const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});try{
 const p=await browser.newPage({hasTouch:true});let errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{speechSynthesis.speak=u=>window.lastVoice={text:u.text,lang:u.lang,rate:u.rate};speechSynthesis.cancel=()=>{};});
 await p.goto('file:///'+path.resolve(__dirname,'../mayor_menor_igual.html').replaceAll('\\','/'));
 await p.locator('#gameArea.active').waitFor();
 async function check(label){await p.waitForTimeout(70);const d=await p.evaluate(()=>({w:innerWidth,h:innerHeight,rects:[...document.querySelectorAll('#btnCheck,.symbol-card,.num-box,.drop-zone')].map(e=>({id:e.id,txt:e.textContent,r:e.getBoundingClientRect().toJSON()}))}));for(const x of d.rects)assert(x.r.x>=-1&&x.r.y>=-1&&x.r.right<=d.w+1&&x.r.bottom<=d.h+1&&x.r.height>=18,label+JSON.stringify(x));}
 for(const [w,h]of [[360,640],[640,360],[768,1024],[1024,768],[1920,1080]]){await p.setViewportSize({width:w,height:h});for(const z of [50,85,100,125,150,200]){await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await check(`${w} ${h} ${z}: `);
 const a=await p.locator('.symbol-card').first().boundingBox(),b=await p.locator('#drop0').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
 await p.locator('.symbol-card').first().dispatchEvent('pointerdown',{pointerId:5,pointerType:'touch',clientX:a.x+a.width/2,clientY:a.y+a.height/2,bubbles:true});
 await p.evaluate(({x,y})=>window.dispatchEvent(new PointerEvent('pointermove',{pointerId:5,pointerType:'touch',clientX:x,clientY:y,bubbles:true})),{x,y});await p.waitForTimeout(30);
 const g=await p.locator('.drag-ghost').boundingBox();assert(Math.abs(g.x+g.width/2-x)<2&&Math.abs(g.y+g.height/2-y)<2,'ghost '+z);
 await p.evaluate(({x,y})=>window.dispatchEvent(new PointerEvent('pointerup',{pointerId:5,pointerType:'touch',clientX:x,clientY:y,bubbles:true})),{x,y});assert.equal(await p.locator('#drop0').innerText(),'<');
 }console.log('PASS layout and touch '+w+'x'+h);}
 await p.locator('.ajustes-signos').evaluate(e=>e.open=true);await p.locator('#idiomaAplicacion').selectOption('en');await p.locator('#velocidadVoz').selectOption('0.7');await p.locator('#probarIdiomaVoz').click();assert.match(await p.evaluate(()=>lastVoice.lang),/^en/);await p.reload();assert.equal(await p.locator('#idiomaAplicacion').inputValue(),'en');assert.equal(await p.locator('#velocidadVoz').inputValue(),'0.7');
 for(const [w,h]of [[390,844],[844,390]]){await p.setViewportSize({width:w,height:h});await p.locator('#boton-pantalla-completa').click();await p.waitForFunction(()=>!!document.fullscreenElement);await check('fullscreen');await p.evaluate(()=>document.exitFullscreen());await check('normal');}
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await blocked.goto(p.url());await blocked.locator('#gameArea.active').waitFor();await blocked.close();assert.deepEqual(errors,[]);console.log('PASS voices, persistence, fullscreen, blocked storage');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
