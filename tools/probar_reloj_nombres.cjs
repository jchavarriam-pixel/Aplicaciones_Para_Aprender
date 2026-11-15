const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const p=await b.newPage({viewport:{width:1100,height:850},hasTouch:true}),errors=[],url=pathToFileURL(path.resolve('Reloj_Analogico/reloj.html')).href;
 p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 const time=async()=>Number(await p.locator('#reloj').getAttribute('data-minutos'));
 const width=selector=>p.locator(selector+' .cuerpo-aguja').evaluate(e=>Number.parseFloat(getComputedStyle(e).strokeWidth));
 assert.equal(await width('#horaria'),26);assert.equal(await width('#minutera'),24);
 assert.equal(await p.locator('#rotuloHora').isVisible(),true);
 assert.equal(await p.locator('#horaria .cuerpo-aguja').evaluate(e=>getComputedStyle(e).stroke),'rgb(220, 38, 56)');
 await p.locator('#configurar').click();assert.equal(await p.locator('#nombresAgujas').isChecked(),true);await p.locator('#nombresAgujas').uncheck();
 assert.equal(await width('#horaria'),26,'Apply on closing the form');await p.locator('#cerrarConfig').click();await p.waitForFunction(()=>!document.querySelector('#reloj').classList.contains('con-nombres'));await p.reload();
 assert.equal(await width('#horaria'),17);assert.equal(await width('#minutera'),12);assert.equal(await p.locator('#rotuloHora').isVisible(),false);
 await p.locator('#configurar').click();await p.locator('#nombresAgujas').check();await p.locator('#precision').selectOption('libre');await p.locator('#narracion').uncheck();
 assert.equal(await width('#horaria'),17,'Apply on closing the form');await p.locator('#cerrarConfig').click();await p.waitForFunction(()=>document.querySelector('#reloj').classList.contains('con-nombres'));
 assert.equal(await width('#horaria'),26);assert.equal(await width('#minutera'),24);
 assert.equal(await p.locator('#textoHoraAguja').textContent(),'Hora');assert.equal(await p.locator('#textoMinutosAguja').textContent(),'Minutos');
 await p.locator('[data-modo=explora]').click();await p.screenshot({path:'.qa-reloj-nombres.png'});const cdp=await p.context().newCDPSession(p);
 // Touch each visible word. With coincident hands, the minute hand must cover the hour word too.
 await p.locator('#horaria').focus();await p.keyboard.press('ArrowLeft');assert.equal(await time(),0);
 const occlusion=await p.evaluate(()=>{const q=new DOMPoint(300,251).matrixTransform(document.querySelector('#reloj').getScreenCTM());return document.elementFromPoint(q.x,q.y)?.closest('.aguja')?.id;});assert.equal(occlusion,'minutera');
 const both=await p.locator('#reloj').screenshot();await p.locator('#rotuloHora').evaluate(e=>e.style.visibility='hidden');const covered=await p.locator('#reloj').screenshot();assert.deepEqual(both,covered,'The short hand label must not paint above the minute hand');await p.locator('#rotuloHora').evaluate(e=>e.style.visibility='');
 await p.screenshot({path:'.qa-reloj-nombres-juntas.png'});
 for(const [w,h]of [[390,844],[1024,768]])for(const z of [50,85,100,150,200])for(const hour of [true,false]){
  await p.setViewportSize({width:w,height:h});await p.reload();await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await p.waitForTimeout(90);
  assert.equal(await time(),60);
  const radio=hour?45:106,delta=hour?30:90,selector=hour?'#rotuloHora':'#rotuloMinutos',start=hour?30:0;
  const points=await p.evaluate(({radio,delta,start})=>{const m=document.querySelector('#reloj').getScreenCTM();return Array.from({length:17},(_,i)=>{const a=(start+delta*i/16)*Math.PI/180,q=new DOMPoint(300+radio*Math.sin(a),296-radio*Math.cos(a)).matrixTransform(m);return{x:q.x,y:q.y,radiusX:8,radiusY:8,force:.7,id:1};});},{radio,delta,start});
  const target=await p.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('.aguja')?.id,points[0]);assert.equal(target,hour?'horaria':'minutera',selector);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});assert.equal(await time(),60,'No jump when grabbing the word');
  for(const q of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[q]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok(Math.abs((await time())-60-delta/(hour?.5:6))<=1,`Touch ${selector}, ${w}x${h}, ${z}%: ${await time()}`);
 }
 console.log('PASS: real touch on both labels, coincident hands, 2 orientations and 5 zooms.');
 await p.setViewportSize({width:1100,height:850});await p.locator('#zoom-aplicacion').evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));});
 await p.locator('#configurar').click();assert.equal(await p.locator('#nombresAgujas').isChecked(),true);await p.locator('#idiomaAplicacion').selectOption('en');await p.locator('#cerrarConfig').click();
 await p.waitForFunction(()=>document.querySelector('#textoHoraAguja').textContent==='Hour');assert.equal(await p.locator('#textoMinutosAguja').textContent(),'Minutes');
 await p.reload();assert.equal(await p.locator('#textoMinutosAguja').textContent(),'Minutes');
 await p.locator('#configurar').click();assert.match(await p.locator('label:has(#nombresAgujas)').textContent(),/Show.*Hour.*Minutes/);await p.locator('#cerrarConfig').click();
 for(const [w,h]of [[390,844],[844,390],[800,1200],[1366,768]])for(const z of [50,85,100,150,200]){
  await p.setViewportSize({width:w,height:h});await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);
  for(const mode of ['explica','explora','construye','lee']){await p.locator(`[data-modo=${mode}]`).click();await p.waitForTimeout(60);
   const bad=await p.locator('#reloj,#reto,#revisar:not([hidden]),#respuesta:not([hidden])').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.top<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5;}).map(e=>e.id));assert.deepEqual(bad,[],`${w}x${h}, ${z}%, ${mode}`);
   assert.equal(await p.locator('#rotuloHora').isVisible(),true);
  }
 }
 await p.locator('#boton-pantalla-completa').click();assert(await p.evaluate(()=>!!document.fullscreenElement));await p.locator('#boton-pantalla-completa').click();
 await p.setViewportSize({width:1100,height:850});await p.locator('#configurar').click();await p.locator('#nombresAgujas').uncheck();await p.locator('#cerrarConfig').click();await p.waitForFunction(()=>!document.querySelector('#reloj').classList.contains('con-nombres'));await p.reload();
 assert.equal(await width('#horaria'),17);assert.equal(await width('#minutera'),12);assert.equal(await p.locator('#rotuloHora').isVisible(),false);
 const blocked=await b.newPage();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await blocked.goto(url);assert.equal(await blocked.locator('#rotuloHora').isVisible(),true);
 const legacy=await b.newPage();await legacy.addInitScript(()=>localStorage.setItem('relojAnalogico.config.v1',JSON.stringify({pistas:false,precision:'cinco'})));await legacy.goto(url);await legacy.locator('#configurar').click();assert.equal(await legacy.locator('#nombresAgujas').isChecked(),true);assert.equal(await legacy.locator('#pistas').isChecked(),false);assert.equal(await legacy.locator('#precision').inputValue(),'cinco');
 assert.deepEqual(errors,[]);console.log('PASS: default help, legacy preferences, minute hand occlusion (pixel comparison), persistence, English, disabling, 80 layouts, fullscreen and blocked storage.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
