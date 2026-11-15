const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(path.resolve('Reloj_Analogico/reloj.html')).href);
 await p.locator('#configurar').click();await p.locator('#precision').selectOption('libre');await p.locator('#narracion').uncheck();await p.locator('#cerrarConfig').click();await p.waitForTimeout(80);
 const cdp=await p.context().newCDPSession(p),norm=n=>((n%720)+720)%720,time=async()=>Number(await p.locator('#reloj').getAttribute('data-minutos'));
 function same(actual,expected,why){assert.ok(Math.abs(((actual-expected+1080)%720)-360)<1e-3,`${why}: ${actual} != ${norm(expected)}`);}
 async function gesture(hour,offsets,expected,{touch=false,cancel=false}={}){
  const original=await time(),factor=hour?.5:6,radius=hour?95:198,angle=original*factor;
  const point=offset=>p.evaluate(({angle,offset,factor,radius})=>{const a=(angle+offset*factor)*Math.PI/180,q=new DOMPoint(300+radius*Math.sin(a),296-radius*Math.cos(a)).matrixTransform(document.querySelector('#reloj').getScreenCTM());return{x:q.x,y:q.y};},{angle,offset,factor,radius});
  const send=async(type,q)=>{if(touch)await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{...q,id:1,radiusX:8,radiusY:8,force:.7}]});else if(type==='touchStart'){await p.mouse.move(q.x,q.y);await p.mouse.down();}else if(type==='touchMove')await p.mouse.move(q.x,q.y);else if(type==='touchCancel'){await p.locator('#reloj').dispatchEvent('pointercancel',{pointerId:1});await p.mouse.up();}else await p.mouse.up();};
  await send('touchStart',await point(0));same(await time(),original,'Taking a hand does not jump');let previous=0;
  for(let i=0;i<offsets.length;i++){const target=offsets[i],steps=Math.max(1,Math.ceil(Math.abs(target-previous)*factor/18));for(let j=1;j<=steps;j++)await send('touchMove',await point(previous+(target-previous)*j/steps));if(touch)await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));same(await time(),original+expected[i],`${hour?'Hour':'Minute'} offset ${target}`);previous=target;}
  await send(cancel?'touchCancel':'touchEnd');same(await time(),cancel?original:Math.round(original+expected.at(-1)),cancel?'Cancel restores time':'Release keeps the limit');
 }
 for(const mode of ['explora','construye'])for(const[w,h]of [[390,844],[1024,768]])for(const zoom of [50,85,100,150,200]){
  await p.setViewportSize({width:w,height:h});await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},zoom);await p.locator(`[data-modo=${mode}]`).click();await p.waitForTimeout(80);const touch=(mode==='explora')===(w===390);
  await gesture(false,[20,17,12,5,14,16,25,15],[20,17,15,15,15,16,25,20],{touch});
  await gesture(false,[-10,-4,0],[0,0,0],{touch}); // Regripping cannot bypass the five-minute limit.
  await gesture(false,[3,-3],[3,0],{touch}); // Reversing past the stop cannot ratchet the clock forwards.
  await gesture(false,[10],[10],{touch,cancel:true});await gesture(false,[-5],[0],{touch});
  const bad=await p.locator('#reloj,#revisar:not([hidden])').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.left<0||r.top<0||r.right>innerWidth+.5||r.bottom>innerHeight+.5;}).map(e=>e.id));assert.deepEqual(bad,[],`${mode}, ${w}x${h}, ${zoom}%`);
 }
 console.log('PASS: clockwise travel, five-minute correction, regripping, recovery, cancellation and visibility in both drag modes, mouse/touch, 20 layouts/zooms.');
 await p.setViewportSize({width:1024,height:768});await p.locator('#zoom-aplicacion').evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));});await p.locator('[data-modo=explora]').click();await p.reload();
 // Cross 12:00, and make a complete revolution without resetting the correction window.
 await p.locator('#horaria').focus();await p.keyboard.press('ArrowLeft');await p.locator('#minutera').focus();await p.keyboard.press('ArrowLeft');await p.keyboard.press('ArrowLeft');same(await time(),718,'11:58');
 await gesture(false,[10,-3],[10,5],{touch:true});same(await time(),3,'12:03 is the earliest correction from 12:08');
 await p.locator('#nueva').click();await gesture(false,[60,55,50],[60,55,55]);
 // The hour hand remains unrestricted; changing it establishes the new correction origin.
 await p.locator('#horaria').focus();await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowRight');await gesture(true,[-90,120,-120],[-90,120,-120]);await gesture(false,[-10],[-5]);
 const before=await time();await p.locator('#minutera').focus();for(let i=0;i<8;i++)await p.keyboard.press('ArrowLeft');same(await time(),before-8,'Keyboard remains unrestricted');
 const buttonsBefore=await time();for(let i=0;i<8;i++)await p.locator('[data-cambio="-1"]').click();same(await time(),buttonsBefore-8,'Minute buttons remain unrestricted');
 await p.locator('#boton-pantalla-completa').click();assert.ok(await p.evaluate(()=>!!document.fullscreenElement));await p.locator('#nueva').click();await gesture(false,[-12],[-5],{touch:true});await p.locator('#boton-pantalla-completa').click();
 await p.locator('#configurar').click();await p.locator('#idiomaAplicacion').selectOption('en');await p.locator('#cerrarConfig').click();await p.waitForTimeout(80);assert.match(await p.locator('#instruccion').textContent(),/clockwise.*5 minutes/);
 assert.deepEqual(errors,[]);console.log('PASS: noon/midnight wrap, full revolution, unrestricted hour hand, buttons and keyboard, new round reset, fullscreen and English instructions.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
