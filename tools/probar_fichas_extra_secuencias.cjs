const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800},hasTouch:true}),url=pathToFileURL(path.resolve('Antecesor_y_Sucesor.html')).href,errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  async function configure(count,length=3,range=null){
   await page.locator('#configBtn').click();await page.locator('#speechEnabled').uncheck();await page.locator('#autoReadRound').uncheck();
   await page.locator('#distractorMode').selectOption(String(count));await page.locator('#sequenceLength').selectOption(String(length));
   await page.locator('#digitMode').selectOption(range?'custom':'two');if(range){await page.locator('#minNumber').fill(String(range[0]));await page.locator('#maxNumber').fill(String(range[1]));}
   await page.locator('#startBtn').click();await page.waitForTimeout(100);
  }
  async function verify(count,min=10,max=99){
   const cards=await page.locator('.card').evaluateAll(es=>es.map(card=>{
    const id=card.dataset.seq,slots=[...card.querySelectorAll('.slot')],given=Number(card.querySelector('.fixed').textContent),answers=[given,...slots.map(e=>Number(e.dataset.answer))];
    const tiles=[...document.querySelectorAll('.tile')].filter(e=>e.dataset.tileId.startsWith(id+'x'));
    return{answers,extras:tiles.map(e=>Number(e.dataset.value))};
   }));
   for(const card of cards){assert.equal(card.extras.length,Math.min(count,max-min+1-card.answers.length));assert.equal(new Set(card.extras).size,card.extras.length);for(const n of card.extras){assert.ok(n>=min&&n<=max);assert.ok(!card.answers.includes(n),'Extra cannot duplicate a number from its own sequence');}}
  }
  for(const length of [3,4,5])for(const count of [0,1,4,10,20]){await configure(count,length);await verify(count);await page.locator('#newRoundBtn').click();await verify(count);}
  await page.reload();await verify(20);await page.locator('#configBtn').click();assert.equal(await page.locator('#distractorMode').inputValue(),'20');await page.locator('#startBtn').click();
  await configure(20,3,[0,4]);await verify(20,0,4);await page.locator('#configBtn').click();assert.match(await page.locator('#extraTilesNote').textContent(),/solo 2/);await page.locator('#startBtn').click();
  await configure(20,5,[0,4]);await verify(20,0,4);await configure(20,5,[999990,999999]);await verify(20,999990,999999);
  // Existing qualitative preferences retain the same number of extra tiles.
  for(const[old,count]of [['none',0],['low',2],['medium',3],['high',5]]){
   await page.evaluate(old=>localStorage.setItem('antecesorSucesor_config_v4',JSON.stringify({distractorMode:old,sequenceLength:5,autoReadRound:false,speechEnabled:false})),old);await page.reload();await verify(count);await page.locator('#configBtn').click();assert.equal(await page.locator('#distractorMode').inputValue(),String(count));await page.locator('#startBtn').click();
  }
  await configure(20,3);await page.locator('#configBtn').click();await page.locator('#idiomaAplicacion').selectOption('en');await page.locator('#startBtn').click();await page.locator('#configBtn').click();assert.match(await page.locator('label:has(#distractorMode)').textContent(),/Extra tiles/);assert.match(await page.locator('#extraTilesNote').textContent(),/each sequence/);await page.locator('#startBtn').click();
  for(const[w,h]of [[390,844],[844,390],[800,1200],[1200,800]])for(const z of [50,85,100,150,200]){
   await page.setViewportSize({width:w,height:h});await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await page.waitForTimeout(80);
   const bad=await page.locator('#checkBtn,.banco,.num-box').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.x<-.5||r.y<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5;}).map(e=>e.className));assert.deepEqual(bad,[],`${w}x${h} at ${z}%`);
  }
  const cdp=await page.context().newCDPSession(page);
  for(const[w,h]of [[390,844],[1024,768]])for(const z of [50,85,100,150,200]){
   await page.setViewportSize({width:w,height:h});await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await page.locator('#newRoundBtn').click();await page.waitForTimeout(100);
   const answer=await page.locator('.slot').first().getAttribute('data-answer'),tile=page.locator(`.tile[data-value="${answer}"]`).first();await tile.scrollIntoViewIfNeeded();const a=await tile.boundingBox(),r=await page.locator('.slot').first().boundingBox(),start={x:a.x+a.width/2,y:a.y+a.height/2},end={x:r.x+r.width/2,y:r.y+r.height/2},mid={x:(start.x+end.x)/2,y:(start.y+end.y)/2},touch=q=>({...q,radiusX:8,radiusY:8,force:.7,id:1});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(start)]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(mid)]});const ghost=await page.locator('.drag-ghost').boundingBox();assert.ok(Math.abs(ghost.x+ghost.width/2-mid.x)<1.5&&Math.abs(ghost.y+ghost.height/2-mid.y)<1.5);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(end)]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await page.locator('.slot').first().getAttribute('data-value'),answer);
  }
  await page.locator('#boton-pantalla-completa').click();assert.ok(await page.evaluate(()=>!!document.fullscreenElement));await page.locator('#boton-pantalla-completa').click();
  const blocked=await browser.newPage();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await blocked.goto(url);await blocked.locator('#configBtn').click();await blocked.locator('#distractorMode').selectOption('4');await blocked.locator('#startBtn').click();assert.ok(await blocked.locator('.tile').count());
  assert.deepEqual(errors,[]);console.log('PASS: exact counts, no duplicates, no overlap with answers, 3–5 places, persistence, legacy preferences, narrow ranges, English, 20 layouts/zooms, real touch dragging, fullscreen and blocked storage.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
