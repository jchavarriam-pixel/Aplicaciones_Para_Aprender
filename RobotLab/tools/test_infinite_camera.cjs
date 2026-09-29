/* Isolated camera test: synthetic movement, muted audio and no real microphone. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'RobotLab.html'),'utf8');
new Function(source.match(/<script>([\s\S]*?)<\/script>/)[1]);
const hooks=`window.__camera={get settings(){return settings},get state(){return state},parseGrid,renderBoard,followInfiniteRobot,updateBoardCamera,updateRobotPose,cellFromPoint,cellCenter,inBounds,moveOne,setRobotLight,pause,
 async traceMove(toC,toR){
  const traces=[],nodes={},original=updateRobotPose;
  let stable=true;
  updateRobotPose=function(){original();if(!state.visual||!state.moving)return;
   for(const id of ['boardGrid','robotG','robotTracksAsset','robotLight']){const node=document.getElementById(id);if(!nodes[id])nodes[id]=node;else if(nodes[id]!==node)stable=false}
   const svg=document.getElementById('board'),v=svg.viewBox.baseVal,g=document.getElementById('robotG'),m=g.transform.baseVal.consolidate().matrix,p=cellCenter(state.visual.c,state.visual.r);
   traces.push({c:state.boardView.c,r:state.boardView.r,visual:{...state.visual},x:m.e-v.x,y:m.f-v.y,expectedX:(state.visual.c-state.boardView.c+.5)*cellW,expectedY:(state.visual.r-state.boardView.r+.5)*cellH,labelY:Number(document.getElementById('boardColumnLabels').transform.baseVal.consolidate()?.matrix.f||0)-v.y});
  };
  try{const ok=await animateMove(state.robot.c,state.robot.r,toC,toR,execToken);const svg=document.getElementById('board'),v=svg.viewBox.baseVal,p=cellCenter(toC,toR),before={x:p.x-v.x,y:p.y-v.y};if(ok){state.robot.c=toC;state.robot.r=toR}renderBoard();const after=cellCenter(state.robot.c,state.robot.r);return{ok,traces,stable,tracks:!!nodes.robotTracksAsset,light:!!nodes.robotLight,before,after,view:{...state.boardView}}}finally{updateRobotPose=original;stopMotionSound()}
 },stopMotionSound,get token(){return execToken}};`;
const html=source.replace('\n})();','\n'+hooks+'\n})();');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 if(file===path.join(root,'RobotLab.html')){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}
 res.setHeader('Content-Type',{'.png':'image/png','.webp':'image/webp','.gif':'image/gif'}[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
const near=(a,b,message)=>assert(Math.abs(a-b)<1e-3,`${message}: ${a} != ${b}`);
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,executablePath:process.env.ROBOTLAB_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--mute-audio']});
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
 await context.addInitScript(()=>{Object.defineProperty(speechSynthesis,'speak',{value:()=>{}})});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/RobotLab.html?nombre=Prueba`);
 await page.waitForFunction(()=>!!window.__camera&&!!document.querySelector('#robotImageAsset'));
 await page.evaluate(()=>{
  document.querySelector('#homeModal').classList.remove('show');document.querySelector('#genericModal').classList.remove('show');
  const s=__camera.state;Object.assign(__camera.settings,{boardInfinite:true,grid:'8x8',reduceMotion:0,speed:10,autoSpeak:0,speakNextTask:false,help:2,preview:true});
  Object.assign(s,{challenge:null,goal:null,activityTargets:[],obstacles:[],program:[],customPath:null,executed:[],visual:null,boardView:{c:0,r:0},paused:false,status:'idle',collisionDebris:[]});
  __camera.parseGrid();__camera.setRobotLight('#00ff00');__camera.renderBoard();
 });
 await page.waitForTimeout(700); // Allow asset probes to finish before checking node identity.
 const setup=async(size,c,r)=>page.evaluate(({size,c,r})=>{
  const s=__camera.state;__camera.settings.grid=size+'x'+size;__camera.settings.boardInfinite=true;__camera.parseGrid();
  s.visual=null;s.boardView={c:0,r:0};s.robot.c=c;s.robot.r=r;s.robot.heading=0;s.paused=false;__camera.renderBoard();
 },{size,c,r});
 const checkMotion=(result,expectStable=true)=>{
  assert(result.ok);assert(result.traces.length>8,'multiple animation frames');
  if(expectStable)assert(result.stable,'panning must not recreate grid, robot, tracks or lights');assert(result.tracks);assert(result.light);
  assert(result.traces.some(t=>Math.abs(t.c-Math.round(t.c))>.01||Math.abs(t.r-Math.round(t.r))>.01),'camera must use fractional cell positions');
  for(let i=0;i<result.traces.length;i++){
   const t=result.traces[i];near(t.x,t.expectedX,'robot x matches continuous camera');near(t.y,t.expectedY,'robot y matches continuous camera');near(t.labelY,0,'column labels stay at top');
   if(i){const prev=result.traces[i-1];assert(Math.abs(t.c-prev.c)<.5&&Math.abs(t.r-prev.r)<.5,'no full-cell camera jumps')}
  }
  near(result.before.x,result.after.x,'scene rebase preserves robot x');near(result.before.y,result.after.y,'scene rebase preserves robot y');
 };
 for(const size of [4,8,10]){
  for(const [c,r,dc,dr] of [[size-2,1,1,0],[1,1,-1,0],[1,size-2,0,1],[1,1,0,-1],[size-2,size-2,1,1],[1,1,-1,-1]]){
   await setup(size,c,r);const result=await page.evaluate(({c,r})=>__camera.traceMove(c,r),{c:c+dc,r:r+dr});checkMotion(result);
   near(result.view.c,dc,'horizontal camera displacement');near(result.view.r,dr,'vertical camera displacement');
  }
 }
 console.log('PASS continuous following in all directions and diagonals, 4x4 / 8x8 / 10x10; stable animated assets');
 await setup(8,3,3);
 const inside=await page.evaluate(()=>__camera.traceMove(4,3));near(inside.view.c,0,'no panning within safe area');near(inside.view.r,0,'safe area y');
 await setup(8,6,3);checkMotion(await page.evaluate(()=>__camera.traceMove(7,3)));checkMotion(await page.evaluate(()=>__camera.traceMove(8,3)));
 const reversed=await page.evaluate(()=>__camera.traceMove(7,3));near(reversed.view.c,2,'turning back inside safe area keeps camera still');
 console.log('PASS consecutive steps rebase without jumps; reversing within safe area does not move camera');

 await setup(8,6,3);
 const placement=await page.evaluate(()=>{
  const s=__camera.state;s.visual={c:6.4,r:3};__camera.followInfiniteRobot();__camera.updateBoardCamera();__camera.updateRobotPose();
  const right=__camera.cellFromPoint({x:70,y:150});
  s.boardView={c:-.4,r:-.6};const left=__camera.cellFromPoint({x:10,y:10}),cross=__camera.cellFromPoint({x:50,y:70});
  s.visual={c:.4,r:.4};__camera.renderBoard();
  const cells=[...document.querySelectorAll('#boardGrid rect')].map(el=>({key:el.dataset.gridCell,x:+el.getAttribute('x'),y:+el.getAttribute('y')}));
  return{right,left,cross,cells,view:{...s.boardView},labels:[...document.querySelectorAll('#boardColumnLabels text')].map(el=>el.textContent)};
 });
 assert.deepEqual(placement.right,{c:1,r:1});assert.deepEqual(placement.left,{c:-1,r:-1});assert.deepEqual(placement.cross,{c:0,r:0});
 assert(placement.labels.every(n=>Number.isInteger(+n)),'world column labels remain integers');
 for(const cell of placement.cells){const [c,r]=cell.key.split(',').map(Number);assert.notEqual((c+r)%2,0,'checkerboard parity uses world coordinates');near(cell.x,(c-placement.view.c)*100,'gray cell x');near(cell.y,(r-placement.view.r)*100,'gray cell y')}
 console.log('PASS checkerboard alignment and touch placement with fractional / negative camera positions');

 await setup(8,6,3);
 await page.evaluate(()=>{
  const s=__camera.state;s.obstacles=[{c:-2,r:1,w:3,h:1,asset:'legos/lego_rojo_3x1'},{c:8,r:2,w:1,h:3,asset:'legos/lego_azul_1x3'}];
  s.activityTargets=[{c:8,r:5,kind:'animal',animal:'perro'}];__camera.renderBoard();
 });
 await page.waitForTimeout(500);
 assert.equal(await page.locator('[data-obstacle]').count(),2,'partial large obstacles and entering obstacles render before panning');
 assert.equal(await page.locator('[data-activity-target]').count(),1,'entering targets are pre-rendered');
 const aligned=await page.evaluate(async()=>{
  const result=await __camera.traceMove(7,3),img=document.querySelector('[data-obstacle="1"] image');
  return{result,x:+img.getAttribute('x'),width:+img.getAttribute('width'),height:+img.getAttribute('height'),ratio:img.getAttribute('preserveAspectRatio')};
 });checkMotion(aligned.result);near(aligned.x,700,'obstacle world location after pan');near(aligned.width,100,'LEGO width');near(aligned.height,300,'LEGO height');assert.equal(aligned.ratio,'xMidYMid meet');
 console.log('PASS large LEGO obstacles remain partially visible, preserve aspect ratio and move with the grid');

 await setup(8,6,3);
 await page.evaluate(()=>{__camera.state.status='running';window.pausedMove=__camera.traceMove(7,3)});
 await page.waitForFunction(()=>__camera.state.visual?.c>6.15);
 const paused=await page.evaluate(()=>{__camera.pause();return{...__camera.state.boardView}});
 await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>({...__camera.state.boardView})),paused,'pausing freezes camera');
 await page.evaluate(()=>__camera.pause());checkMotion(await page.evaluate(()=>pausedMove),false);
 console.log('PASS pause / resume freezes and continues the camera smoothly');

 await setup(8,7,3);
 const finite=await page.evaluate(async()=>{
  __camera.settings.boardInfinite=false;__camera.parseGrid();__camera.renderBoard();
  const bounds=__camera.inBounds(8,3),ok=await __camera.moveOne('forward',__camera.token);
  __camera.stopMotionSound();return{bounds,ok,c:__camera.state.robot.c,view:{...__camera.state.boardView},viewBox:document.querySelector('#board').getAttribute('viewBox')};
 });assert.equal(finite.bounds,false);assert.equal(finite.ok,false);assert.equal(finite.c,7);assert.deepEqual(finite.view,{c:0,r:0});assert.equal(finite.viewBox,'0 0 800 800');
 console.log('PASS finite boards still stop at their border and do not pan');
 if(process.env.ROBOTLAB_QA_DIR){
  await setup(8,6,3);await page.evaluate(()=>{const s=__camera.state;s.lastCollision=false;s.collisionDebris=[];s.visual={c:6.5,r:3};__camera.followInfiniteRobot();__camera.renderBoard()});
  await page.screenshot({path:path.join(process.env.ROBOTLAB_QA_DIR,'infinite-camera.png')});
 }
 assert.deepEqual(errors,[]);await context.close();console.log('ALL INFINITE CAMERA TESTS PASSED');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
