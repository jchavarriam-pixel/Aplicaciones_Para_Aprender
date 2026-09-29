/* Isolated browser test: captures speech and mutes audio; no real microphone. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'RobotLab.html'),'utf8');
new Function(source.match(/<script>([\s\S]*?)<\/script>/)[1]);
const hooks='window.__guide={get settings(){return settings},get state(){return state},BLOCKS,REACTIONS,addTool,renderAll,renderProgram,getConstructionChallengeProgress,challengeArrival,challengeAction,challengeTaskText,challengeActionText,challengeSpeechText,activityTargetText,challengeFailureMessage,run,resetRobot};';
const html=source.replace('\n})();','\n'+hooks+'\n})();');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 if(file===path.join(root,'RobotLab.html')){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}
 res.setHeader('Content-Type',{'.png':'image/png','.webp':'image/webp','.gif':'image/gif','.mp3':'audio/mpeg'}[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,executablePath:process.env.ROBOTLAB_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--mute-audio']});
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
 await context.addInitScript(()=>{
  window.guideSpeech=[];window.guideUtterances=[];window.guideCancels=0;
  Object.defineProperty(speechSynthesis,'speak',{value:u=>{guideSpeech.push(u.text);guideUtterances.push(u)}});
  Object.defineProperty(speechSynthesis,'cancel',{value:()=>guideCancels++});
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/RobotLab.html?nombre=Prueba`);
 await page.waitForFunction(()=>!!window.__guide);
 assert.equal(await page.evaluate(()=>__guide.settings.speakNextTask),true,'construction guidance defaults to enabled');
 const wording=await page.evaluate(()=>{
  const ch={active:true,type:'levels'},task=(actions)=>__guide.challengeTaskText(ch,{kind:'animal',animal:'perro',requiredActions:actions},0);
  return{
   greeting:task([{type:'reaction',reaction:'saludar',text:'hazlo saludar'}]),
   reactions:Object.keys(__guide.REACTIONS).map(reaction=>task([{type:'reaction',reaction,text:'hazlo reaccionar'}])),
   sound:task([{type:'soundFile',sound:'perro',text:'reproduce el sonido del perro'}]),
   lights:['principal','ears','eyes'].map(lightZone=>task([{type:'color',name:'roja',lightZone}])),
   noise:task([{type:'waitNoise'}]),
   legacy:__guide.challengeTaskText(ch,{kind:'animal',animal:'perro',requiredReaction:'saludar',requiredReactionLabel:'hazlo saludar'},0),
   custom:__guide.activityTargetText({kind:'animal',animal:'perro',jump:true,lights:[{name:'verde'}],sounds:['perro']},0)
  };
 });
 assert.equal(wording.greeting,'Visita al perro y, al llegar, haz que el robot salude.');
 assert.equal(wording.legacy,wording.greeting,'old task labels also render an explicit robot subject');
 for(const text of [...wording.reactions,wording.sound,...wording.lights,wording.noise,wording.custom]){assert.match(text,/robot/);assert.doesNotMatch(text,/\bhazlo\b/)}
 assert.match(wording.sound,/el robot reproduzca el sonido del perro/);
 assert(wording.lights.every(text=>text.includes('del robot en color rojo')));
 assert.match(wording.custom,/haz saltar al robot/);
 console.log('PASS child-literal wording: robot explicitly performs reactions, sounds, lights and noise waits, including old/custom tasks');
 const setup=async(actions=[{type:'reaction',reaction:'saltar',text:'hazlo saltar'}])=>{
  await page.evaluate(actions=>{
   document.querySelector('#homeModal').classList.remove('show');document.querySelector('#genericModal').classList.remove('show');
   const s=__guide.state;Object.assign(__guide.settings,{help:2,preview:true,speakNextTask:true,autoSpeak:0,reduceMotion:1});
   Object.assign(s,{program:[],functions:[],activeRepeat:null,activeFunctionId:null,activeFunctionRepeat:null,status:'idle',paused:false,executionFocus:null,obstacles:[],executed:[],start:{c:1,r:4,heading:0}});
   Object.assign(s.robot,{c:1,r:4,heading:0});s.goal={c:4,r:4};
   s.challenge={active:true,type:'levels',mode:'levels',level:5,index:0,completed:false,targets:[
    {kind:'animal',animal:'leon',c:3,r:4,requiredActions:actions.map(a=>({...a,done:false})),arrived:false,completed:false},
    {kind:'animal',animal:'perro',c:4,r:4,requiredActions:[],arrived:false,completed:false}
   ],description:'Visita primero al león y hazlo saltar. Luego visita al perro.'};
   __guide.renderAll();guideSpeech.length=0;guideUtterances.length=0;
  },actions);
 };
 const add=async(tool)=>{await page.evaluate(tool=>__guide.addTool(tool),tool);await page.waitForTimeout(320)};
 const last=()=>page.evaluate(()=>guideSpeech.at(-1));
 await setup();const realBefore=await page.evaluate(()=>JSON.stringify([__guide.state.robot,__guide.state.challenge]));
 await add('forward');assert.equal(await page.evaluate(()=>guideSpeech.length),0,'ordinary route extensions do not repeat the current instruction');
 await add('forward');assert.equal(await last(),'Haz saltar al robot.','predicted arrival asks for the action, before execution');
 assert.equal(await page.evaluate(()=>JSON.stringify([__guide.state.robot,__guide.state.challenge])),realBefore,'prediction never moves the robot or completes actual tasks');
 await page.evaluate(()=>{for(let i=0;i<6;i++){__guide.renderAll();__guide.renderProgram()}});await page.waitForTimeout(320);
 assert.equal(await page.evaluate(()=>guideSpeech.length),1,'layout redraws do not repeat a spoken step');
 await add('reaction_saltar');assert.match(await last(),/^Ahora debes ir a la tarea 2 de 2: Visita al perro/);
 await add('forward');assert.match(await last(),/^La ruta prevista incluye todas las tareas/);
 assert.equal(await page.evaluate(()=>__guide.state.challenge.completed),false,'only actual execution can complete a challenge');
 console.log('PASS route construction: arrive at lion, request jump, then next visit; no real state mutation or repeated speech');

 await setup([{type:'reaction',reaction:'saltar',text:'hazlo saltar'},{type:'soundFile',sound:'leon',text:'reproduce el sonido del león'}]);
 await add('forward');await add('forward');await add('reaction_feliz');
 assert.equal(await page.evaluate(()=>guideSpeech.length),1,'wrong emotion cannot complete the jump');
 await add('reaction_saltar');assert.equal(await last(),'Haz que el robot reproduzca el sonido del león.');
 await add('sound_perro');assert.equal(await page.evaluate(()=>guideSpeech.length),2,'wrong animal sound does not advance');
 await add('sound_leon');assert.match(await last(),/^Ahora debes ir a la tarea 2/);
 await page.evaluate(()=>{__guide.state.program.pop();__guide.renderAll()});await page.waitForTimeout(320);
 assert.equal(await last(),'Haz que el robot reproduzca el sonido del león.','deleting a required action restores the right instruction');
 await page.evaluate(()=>{const p=__guide.state.program;const jump=p.splice(3,1)[0];p.unshift(jump);__guide.renderAll()});await page.waitForTimeout(320);
 assert.equal(await last(),'Haz saltar al robot.','reordering an action to the wrong cell does not satisfy the visit');
 console.log('PASS multiple actions, exact action matching, deletion and reordering');

 for(const disabled of ['setting','help','route']){
  await setup();await page.evaluate(disabled=>{__guide.settings.speakNextTask=disabled!=='setting';__guide.settings.help=disabled==='help'?0:2;__guide.settings.preview=disabled!=='route';__guide.renderAll()},disabled);
  await add('forward');await add('forward');assert.equal(await page.evaluate(()=>guideSpeech.length),0,`${disabled} disables construction speech`);
 }
 await setup();await page.evaluate(()=>{__guide.addTool('forward');__guide.addTool('forward');__guide.settings.speakNextTask=false;__guide.renderAll()});await page.waitForTimeout(320);
 assert.equal(await page.evaluate(()=>guideSpeech.length),0,'disabling while an announcement is pending cancels it');
 await setup();await add('forward');await add('forward');const cancels=await page.evaluate(()=>guideCancels);
 await page.evaluate(()=>{__guide.settings.speakNextTask=false;__guide.renderAll()});
 assert((await page.evaluate(()=>guideCancels))>cancels,'disabling interrupts only the active construction voice');
 console.log('PASS independent setting, route/help gates and cancellation when disabled');

 await setup();await page.evaluate(()=>{const s=__guide.state;s.functions=[{id:'F1',body:[{...__guide.BLOCKS.forward},{...__guide.BLOCKS.forward}]}];s.program=[{type:'callFunction',functionId:'F1'}];__guide.renderAll()});await page.waitForTimeout(320);
 assert.equal(await last(),'Haz saltar al robot.','function calls contribute their planned movements');
 await page.evaluate(()=>{__guide.state.functions[0].body.push({...__guide.BLOCKS.reaction_saltar});__guide.renderAll()});await page.waitForTimeout(320);
 assert.match(await last(),/^Ahora debes ir a la tarea 2/,'editing a used function updates construction guidance');
 await setup();await page.evaluate(()=>{__guide.state.program=[{type:'repeat',times:2,body:[{...__guide.BLOCKS.forward}]}];__guide.renderAll()});await page.waitForTimeout(320);
 assert.equal(await last(),'Haz saltar al robot.','repeat bodies are simulated in order');
 await setup();await page.evaluate(()=>{const s=__guide.state;s.challenge.targets[0].c=2;s.challenge.targets[0].r=5;s.program=[{...__guide.BLOCKS.right45},{...__guide.BLOCKS.forward}];__guide.renderAll()});await page.waitForTimeout(320);
 assert.equal(await last(),'Haz saltar al robot.','diagonal moves use both grid coordinates');
 await setup();await page.evaluate(()=>{const s=__guide.state;s.obstacles=[{c:2,r:4,w:1,h:2}];s.program=[{...__guide.BLOCKS.forward},{...__guide.BLOCKS.forward},{...__guide.BLOCKS.reaction_saltar}];__guide.renderAll()});await page.waitForTimeout(320);
 assert.match(await last(),/^La ruta prevista choca/,'a collision prevents falsely completing later tasks');
 console.log('PASS reusable functions, function editing, repeats, 45-degree movement and collision boundaries');

 for(const status of ['running','waiting','paused']){
  await setup();await page.evaluate(status=>{const s=__guide.state;s.status=status;s.program=[{...__guide.BLOCKS.forward},{...__guide.BLOCKS.forward}];__guide.renderAll();s.robot.c=3;__guide.challengeArrival();__guide.challengeAction({...__guide.BLOCKS.reaction_saltar});__guide.renderAll()},status);await page.waitForTimeout(320);
  assert.equal(await page.evaluate(()=>guideSpeech.length),0,`${status} does not announce construction steps`);
 }
 await setup([]);await page.evaluate(()=>{const s=__guide.state;s.program=[{...__guide.BLOCKS.forward},{...__guide.BLOCKS.forward}];__guide.renderAll();window.guideRun=__guide.run()});
 await page.evaluate(()=>guideRun);await page.waitForTimeout(320);
 assert.equal(await page.evaluate(()=>guideSpeech.length),0,'starting execution before the pending hint cancels it');
 assert.equal(await page.evaluate(()=>__guide.state.challenge.index),1,'actual execution still validates visits normally');
 console.log('PASS no construction guidance during execution, waits or pause; execution still validates visits');

 await page.locator('#settingsBtn').click();assert.match(await page.locator('label:has(#speakNextTask)').innerText(),/mientras se construye/);
 await page.locator('#speakNextTask').uncheck();await page.locator('#applySettings').click();await page.reload();await page.waitForFunction(()=>!!window.__guide);
 assert.equal(await page.evaluate(()=>__guide.settings.speakNextTask),false,'opt-out persists in the browser');
 assert.deepEqual(errors,[]);await context.close();console.log('ALL CONSTRUCTION GUIDE TESTS PASSED');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
