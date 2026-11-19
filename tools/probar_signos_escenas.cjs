const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve('mayor_menor_igual.html')).href;
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**',r=>r.abort());
 await p.addInitScript(()=>{
  if(!localStorage.getItem('signos.celebracion.v1'))localStorage.setItem('signos.celebracion.v1',JSON.stringify({activa:true,sonido:false,duracion:0,tipo:'rotar'}));
  if(!localStorage.getItem('nombreNinoGabrielApps'))localStorage.setItem('nombreNinoGabrielApps','Gabriel');
  window.lecturas=[];speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>{lecturas.push({texto:u.text,idioma:u.lang});setTimeout(()=>u.onend?.(),20);};
  window.contextosAudio=0;const Original=window.AudioContext;window.AudioContext=class extends Original{constructor(...a){super(...a);window.contextosAudio++;}};
 });
 await p.goto(url);await p.locator('#gameArea.active').waitFor();await p.locator('.configurar-signos').click();await p.selectOption('#cantidadComparaciones','1');await p.locator('#aplicarConfiguracionSignos').click();await p.waitForTimeout(100);await p.clock.install();
 // Actual exercise wins rotate through all four scenes without any console preview.
 for(const tipo of['cohete','volcan','tren','globo']){
  await p.locator('.symbol-card[data-symbol="="]').click();await p.locator('#drop0').click();await p.locator('#btnCheck').click();
  assert.equal(await p.locator('.fiesta-signos').getAttribute('data-tipo'),tipo);
  if(tipo==='cohete'){await p.locator('.nueva-ronda-fiesta-signos').tap();continue;}
  const control=p.locator('.activar-escena-signos');assert.ok(await control.isVisible());await p.clock.fastForward(10000);assert.equal(await p.locator('.fiesta-signos').getAttribute('data-fase'),'preparado');
  await p.screenshot({path:`.qa-${tipo}-preparado.png`});
  await control.tap();await p.clock.runFor(3500);assert.equal(await p.locator('.fiesta-signos').getAttribute('data-fase'),'animacion');
  assert.equal(await p.locator('.escena-fiesta-signos canvas').count(),1);assert.equal(await p.locator('.escena-adicional-signos').count(),1);
  await p.screenshot({path:`.qa-${tipo}-activo.png`});
  await p.clock.fastForward(5500);await p.clock.runFor(50);assert.equal(await p.locator('.fiesta-signos').getAttribute('data-fase'),'felicitacion');assert.match(await p.locator('.mensaje-fiesta-signos p').innerText(),/Gabriel/);
  await p.locator('.nueva-ronda-fiesta-signos').tap();assert.equal(await p.locator('.escena-adicional-signos').count(),0);assert.equal(await p.locator('#drop0').innerText(),'');
 }
 assert.equal(await p.evaluate(()=>contextosAudio),0,'Muted scenes never create audio contexts');
 await p.reload();await p.locator('#gameArea.active').waitFor();await p.evaluate(()=>FiestaSignos.abrir());assert.equal(await p.locator('.fiesta-signos').getAttribute('data-tipo'),'cohete');await p.locator('.continuar-fiesta-signos').click();
 console.log('PASS actual round rotation, persistence, manual starts, all three animations, named finish, mute and cleanup');
 const cdp=await p.context().newCDPSession(p);
 for(const[w,h]of[[320,740],[390,844],[740,320],[844,390],[768,1024],[1024,768],[1920,1080]]){
  await p.setViewportSize({width:w,height:h});
  for(const zoom of[50,85,100,150,200]){
   await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},zoom);await p.clock.runFor(100);
   for(const tipo of['volcan','tren','globo']){
    await p.evaluate(tipo=>FiestaSignos.abrir({tipo,nombre:'Gabriel'}),tipo);await p.clock.runFor(50);
    const controles=await p.evaluate(()=>['.activar-escena-signos','.continuar-fiesta-signos','.nueva-ronda-fiesta-signos'].map(s=>({s,...document.querySelector(s).getBoundingClientRect().toJSON()})));
    for(const r of controles)assert.ok(r.left>=0&&r.top>=0&&r.right<=w+1&&r.bottom<=h+1&&r.width>=44&&r.height>=44,JSON.stringify({w,h,zoom,tipo,r}));
    const geometria=await p.locator('.actor-adicional-signos>svg').evaluate(e=>{const b=e.getBBox(),m=e.getScreenCTM(),points=[[b.x,b.y],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m)),r=e.closest('.escena-fiesta-signos').getBoundingClientRect();return {left:points[0].x,top:points[0].y,right:points[1].x,bottom:points[1].y,stage:r.toJSON()};});
    const g=geometria;assert.ok(g.left>=g.stage.left-2&&g.top>=g.stage.top-2&&g.right<=g.stage.right+2&&g.bottom<=g.stage.bottom+2,JSON.stringify({w,h,zoom,tipo,g}));
    if(zoom===100&&(w===390||w===740))await p.screenshot({path:`.qa-${tipo}-${w===390?'vertical':'horizontal'}.png`});
    if(tipo==='tren'){
     const a=await p.locator('.activar-escena-signos').boundingBox(),inicio={x:a.x+a.width/2,y:a.y+a.height*.3},fin={x:inicio.x,y:inicio.y+a.height*.35};
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[inicio]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[fin]});await p.clock.runFor(50);
     assert.notEqual(await p.locator('.brazo-palanca-fiesta').getAttribute('transform'),'rotate(-28 55 82)');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.clock.runFor(50);
    }else await p.locator('.activar-escena-signos').click();
    assert.equal(await p.locator('.fiesta-signos').getAttribute('data-fase'),'animacion');
    await p.clock.fastForward(9000);await p.clock.runFor(50);assert.ok(await p.locator('.mensaje-fiesta-signos').isVisible());assert.ok(await p.locator('.mensaje-fiesta-signos').evaluate(e=>e.scrollWidth<=e.clientWidth+1&&e.scrollHeight<=e.clientHeight+1));
    // Chromium's native post-drag tap timing uses real time, unlike the animation clock.
    // Check that touch sequence separately below without virtual time.
    await p.locator('.nueva-ronda-fiesta-signos').click();await p.clock.runFor(50);assert.equal(await p.evaluate(()=>FiestaSignos.activa),false,JSON.stringify({w,h,zoom,tipo}));
   }
  }console.log('PASS',w,h,'new scenes, touch lever, complete artwork, readable final message and new round at 50–200%');
 }
 await p.setViewportSize({width:1024,height:768});await p.locator('#zoom-aplicacion').evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));});await p.clock.runFor(100);
 await p.locator('.configurar-signos').click();await p.selectOption('#tipoFiestaSignos','globo');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('signos.celebracion.v1')).tipo),'rotar');await p.locator('#sonidoFiestaSignos').check();await p.selectOption('#idiomaAplicacion','en');await p.locator('#aplicarConfiguracionSignos').click();await p.waitForFunction(()=>IdiomaVoz.idioma==='en');await p.clock.runFor(100);
 await p.evaluate(()=>FiestaSignos.abrir());assert.equal(await p.locator('.fiesta-signos').getAttribute('data-tipo'),'globo');await p.locator('.continuar-fiesta-signos').click();await p.reload();assert.equal(await p.locator('#tipoFiestaSignos').inputValue(),'globo');
 for(const[tipo,titulo]of[['volcan','Number volcano'],['tren','Happy train'],['globo','Hot-air balloon']]){
  await p.evaluate(tipo=>{lecturas=[];FiestaSignos.abrir({tipo,nombre:'Marcos'});},tipo);assert.equal(await p.locator('#tituloFiestaSignos').innerText(),titulo);await p.locator('.activar-escena-signos').focus();await p.keyboard.press('Enter');await p.clock.fastForward(9000);await p.clock.runFor(100);assert.equal(await p.evaluate(()=>lecturas.length),1);assert.match(await p.evaluate(()=>lecturas[0].texto),/Marcos/);assert.match(await p.evaluate(()=>lecturas[0].idioma),/^en/);await p.locator('.continuar-fiesta-signos').click();
 }
 await p.locator('#boton-pantalla-completa').click();await p.evaluate(()=>FiestaSignos.abrir({tipo:'tren'}));await p.locator('.activar-escena-signos').tap();await p.clock.runFor(1500);await p.setViewportSize({width:768,height:1024});await p.clock.runFor(100);assert.equal(await p.locator('.fiesta-signos').getAttribute('data-fase'),'animacion');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>FiestaSignos.activa),false);await p.locator('#boton-pantalla-completa').click();assert.deepEqual(errors,[]);
 const bloqueado=await browser.newPage({viewport:{width:740,height:320},reducedMotion:'reduce'});await bloqueado.route('https://**',r=>r.abort());await bloqueado.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked');};Storage.prototype.setItem=()=>{throw Error('blocked');};speechSynthesis.speak=()=>{};speechSynthesis.cancel=()=>{};});await bloqueado.goto(url);
 for(const tipo of['volcan','tren','globo']){await bloqueado.evaluate(tipo=>FiestaSignos.abrir({tipo}),tipo);assert.equal(await bloqueado.locator('.flecha-pulsador-signos svg').last().evaluate(e=>getComputedStyle(e).animationName),'none');await bloqueado.locator('.activar-escena-signos').click();await bloqueado.locator('.nueva-ronda-fiesta-signos').click();assert.equal(await bloqueado.locator('.escena-adicional-signos').count(),0);}
 console.log('PASS deferred scene selection, persistence, English voice, keyboard, fullscreen/orientation, reduced motion and blocked storage');
 const tactil=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});await tactil.route('https://**',r=>r.abort());await tactil.addInitScript(()=>{localStorage.setItem('signos.celebracion.v1',JSON.stringify({activa:true,sonido:false,duracion:0}));speechSynthesis.speak=()=>{};speechSynthesis.cancel=()=>{};});await tactil.goto(url);
 const dedo=await tactil.context().newCDPSession(tactil);
 for(const[w,h]of[[390,844],[844,390]])for(const zoom of[50,85,100,150,200]){
  await tactil.setViewportSize({width:w,height:h});await tactil.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},zoom);await tactil.evaluate(()=>FiestaSignos.abrir({tipo:'tren'}));const r=await tactil.locator('.activar-escena-signos').boundingBox(),x=r.x+r.width/2,y=r.y+r.height*.3;
  await dedo.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await dedo.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+r.height*.35}]});await tactil.waitForTimeout(60);assert.notEqual(await tactil.locator('.brazo-palanca-fiesta').getAttribute('transform'),'rotate(-28 55 82)');await dedo.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tactil.waitForFunction(()=>document.querySelector('.fiesta-signos').dataset.fase==='animacion');
  if(zoom===85)await tactil.locator('.mensaje-fiesta-signos').waitFor({state:'visible'});
  await tactil.locator('.nueva-ronda-fiesta-signos').tap();assert.equal(await tactil.evaluate(()=>FiestaSignos.activa),false);
 }
 console.log('PASS real-time touch drag followed by New round, both orientations and 50–200%, including completed animation');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
