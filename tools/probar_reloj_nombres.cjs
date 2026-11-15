const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const p=await b.newPage({viewport:{width:1100,height:850},hasTouch:true}),errors=[],url=pathToFileURL(path.resolve('Reloj_Analogico/reloj.html')).href;
 p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 const time=async()=>Number(await p.locator('#reloj').getAttribute('data-minutos'));
 const width=selector=>p.locator(selector+' .cuerpo-aguja').evaluate(e=>Number.parseFloat(getComputedStyle(e).strokeWidth));
 assert.equal(await width('#horaria'),17);assert.equal(await width('#minutera'),12);
 assert.equal(await p.locator('#rotulosAgujas').isVisible(),false);
 assert.equal(await p.locator('#horaria .cuerpo-aguja').evaluate(e=>getComputedStyle(e).stroke),'rgb(220, 38, 56)');
 await p.locator('#configurar').click();await p.locator('#nombresAgujas').check();await p.locator('#precision').selectOption('libre');await p.locator('#narracion').uncheck();
 assert.equal(await width('#horaria'),17,'Apply on closing the form');await p.locator('#cerrarConfig').click();await p.waitForFunction(()=>document.querySelector('#reloj').classList.contains('con-nombres'));
 assert.equal(await width('#horaria'),36);assert.equal(await width('#minutera'),34);
 assert.equal(await p.locator('#textoHoraAguja').textContent(),'Hora');assert.equal(await p.locator('#textoMinutosAguja').textContent(),'Minutos');
 await p.locator('[data-modo=explora]').click();const cdp=await p.context().newCDPSession(p);
 // Touch the words themselves, including when both hands point to twelve.
 for(const [w,h]of [[390,844],[1024,768]])for(const z of [50,85,100,150,200])for(const hour of [true,false]){
  await p.setViewportSize({width:w,height:h});await p.reload();await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await p.waitForTimeout(90);
  await p.locator('#horaria').focus();await p.keyboard.press('ArrowLeft');assert.equal(await time(),0);
  const radio=hour?45:106,delta=hour?30:90,selector=hour?'#rotuloHora rect':'#rotuloMinutos rect';
  const points=await p.evaluate(({radio,delta})=>{const m=document.querySelector('#reloj').getScreenCTM();return Array.from({length:17},(_,i)=>{const a=delta*Math.PI/180*i/16,q=new DOMPoint(300+radio*Math.sin(a),296-radio*Math.cos(a)).matrixTransform(m);return{x:q.x,y:q.y,radiusX:8,radiusY:8,force:.7,id:1};});},{radio,delta});
  const target=await p.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('[data-aguja]')?.dataset.aguja,points[0]);assert.equal(target,hour?'horaria':'minutera',selector);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});assert.equal(await time(),0,'No jump when grabbing the word');
  for(const q of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[q]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok(Math.abs((await time())-delta/(hour?.5:6))<=1,`Touch ${selector}, ${w}x${h}, ${z}%: ${await time()}`);
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
   assert.equal(await p.locator('#rotulosAgujas').isVisible(),true);
  }
 }
 await p.locator('#boton-pantalla-completa').click();assert(await p.evaluate(()=>!!document.fullscreenElement));await p.locator('#boton-pantalla-completa').click();
 await p.setViewportSize({width:1100,height:850});await p.locator('#configurar').click();await p.locator('#nombresAgujas').uncheck();await p.locator('#cerrarConfig').click();await p.waitForFunction(()=>!document.querySelector('#reloj').classList.contains('con-nombres'));await p.reload();
 assert.equal(await width('#horaria'),17);assert.equal(await width('#minutera'),12);assert.equal(await p.locator('#rotulosAgujas').isVisible(),false);
 const blocked=await b.newPage();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await blocked.goto(url);await blocked.locator('#configurar').click();await blocked.locator('#nombresAgujas').check();await blocked.locator('#cerrarConfig').click();await blocked.waitForFunction(()=>document.querySelector('#reloj').classList.contains('con-nombres'));assert.equal(await blocked.locator('#rotulosAgujas').isVisible(),true);
 assert.deepEqual(errors,[]);console.log('PASS: optional help, apply on close, persistence, English, disabling, 80 layouts, fullscreen and blocked storage.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
