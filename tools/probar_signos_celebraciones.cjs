const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve('mayor_menor_igual.html')).href;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try {
  const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**',r=>r.abort());
  await page.addInitScript(()=>{
   window.lecturas=[];
   speechSynthesis.speak=u=>{window.lecturas.push({texto:u.text,idioma:u.lang,tiempo:performance.now()});setTimeout(()=>u.onend?.(),60);};
   speechSynthesis.cancel=()=>{};
   if(!localStorage.getItem('nombreNinoGabrielApps'))localStorage.setItem('nombreNinoGabrielApps','Gabriel');
  });
  await page.goto(url);await page.locator('#gameArea.active').waitFor();
  await page.locator('.configurar-signos').click();
  await page.selectOption('#cantidadComparaciones','1');
  await page.locator('#aplicarConfiguracionSignos').click();await page.waitForTimeout(100);
  await page.clock.install();
  // A real correct answer launches the scene; the praise must wait for the stars.
  await page.locator('.symbol-card[data-symbol="="]').click();await page.locator('#drop0').click();
  await page.locator('#btnCheck').click();
  assert.ok(await page.locator('.fiesta-signos[open]').isVisible());
  assert.equal(await page.locator('.fiesta-signos').getAttribute('data-fase'),'preparado');
  await page.clock.fastForward(20000);
  assert.equal(await page.locator('.fiesta-signos').getAttribute('data-fase'),'preparado');
  assert.deepEqual(await page.evaluate(()=>lecturas),[]);
  await page.screenshot({path:'.qa-signos-despegar.png'});
  await page.locator('.despegar-fiesta-signos').tap();
  // A repeated activation must not restart the clock or create another loop.
  await page.locator('.despegar-fiesta-signos').evaluate(e=>e.click());
  assert.equal(await page.locator('.fiesta-signos').getAttribute('data-fase'),'cuenta');
  assert.equal(await page.locator('.cuenta-fiesta-signos strong').innerText(),'3');
  assert.deepEqual(await page.evaluate(()=>lecturas.map(x=>x.texto)),['3']);
  await page.clock.runFor(1050);assert.equal(await page.locator('.cuenta-fiesta-signos strong').innerText(),'2');
  await page.clock.runFor(1000);assert.equal(await page.locator('.cuenta-fiesta-signos strong').innerText(),'1');
  await page.screenshot({path:'.qa-signos-cohete.png'});
  const inicio=await page.locator('.cohete-fiesta-signos').boundingBox();
  await page.clock.runFor(1500);
  assert.equal(await page.locator('.fiesta-signos').getAttribute('data-fase'),'despegue');
  const volando=await page.locator('.cohete-fiesta-signos').boundingBox();assert.ok(volando.y<inicio.y);
  await page.clock.runFor(2300);
  const arriba=await page.locator('.cohete-fiesta-signos').boundingBox(),area=await page.locator('.escena-fiesta-signos').boundingBox();
  assert.ok(arriba.y+arriba.height<area.y+15,'The rocket leaves through the top');
  await page.clock.runFor(1200);
  assert.equal(await page.locator('.fiesta-signos').getAttribute('data-fase'),'estrellas');
  assert.ok(!await page.locator('.mensaje-fiesta-signos').isVisible());
  assert.deepEqual(await page.evaluate(()=>lecturas.map(x=>x.texto)),['3','2','1']);
  await page.screenshot({path:'.qa-signos-estrellas.png'});
  await page.clock.runFor(1500);
  assert.equal(await page.locator('.fiesta-signos').getAttribute('data-fase'),'felicitacion');
  assert.equal(await page.locator('.mensaje-fiesta-signos h3').innerText(),'¡Felicidades!');
  assert.match(await page.locator('.mensaje-fiesta-signos p').innerText(),/Gabriel/);
  assert.equal(await page.evaluate(()=>lecturas.length),4);
  assert.match(await page.evaluate(()=>lecturas.at(-1).texto),/Gabriel/);
  assert.equal(await page.locator('.escena-fiesta-signos canvas').count(),1);
  await page.screenshot({path:'.qa-signos-felicidades.png'});
  await page.locator('.continuar-fiesta-signos').click();assert.ok(!await page.locator('.fiesta-signos').isVisible());
  assert.ok(await page.locator('#drop0').evaluate(e=>e.classList.contains('correct')));
  console.log('PASS actual success, 3–2–1, launch, exit, stars, then named praise and clean close');
  await page.evaluate(()=>FiestaSignos.abrir({nombre:'Gabriel'}));
  await page.locator('.nueva-ronda-fiesta-signos').tap();
  assert.equal(await page.evaluate(()=>FiestaSignos.activa),false);
  assert.equal(await page.locator('#drop0').innerText(),'');
  assert.ok(await page.locator('#btnCheck').isDisabled());

  // Preferences are deferred until the settings form closes, then survive reload.
  await page.locator('.configurar-signos').click();
  await page.locator('#sonidoFiestaSignos').uncheck();await page.selectOption('#duracionFiestaSignos','0');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('signos.celebracion.v1')).sonido),true);
  await page.locator('#aplicarConfiguracionSignos').click();await page.clock.runFor(100);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('signos.celebracion.v1')).sonido===false);
  await page.reload();await page.locator('#gameArea.active').waitFor();
  await page.evaluate(()=>FiestaSignos.abrir({nombre:'Marcos'}));
  assert.equal(await page.locator('.audio-fiesta-signos').getAttribute('aria-pressed'),'false');
  assert.deepEqual(await page.evaluate(()=>lecturas),[]);
  await page.locator('.despegar-fiesta-signos').tap();
  await page.clock.runFor(17000);assert.ok(await page.locator('.fiesta-signos[open]').isVisible());
  await page.locator('.continuar-fiesta-signos').click();

  // Complete overlay, controls and readable final message at every application zoom.
  for(const[w,h]of[[320,740],[390,844],[740,320],[844,390],[768,1024],[1024,768],[1920,1080]]){
   await page.setViewportSize({width:w,height:h});
   for(const z of[50,85,100,150,200]){
    await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);
    await page.clock.runFor(100);
    await page.evaluate(()=>FiestaSignos.abrir({nombre:'Gabriel'}));await page.clock.runFor(50);
    const inicioBoton=await page.locator('.despegar-fiesta-signos').boundingBox();
    assert.ok(inicioBoton&&inicioBoton.x>=0&&inicioBoton.y>=0&&inicioBoton.x+inicioBoton.width<=w&&inicioBoton.y+inicioBoton.height<=h,JSON.stringify({w,h,z,inicioBoton}));
    await page.locator('.despegar-fiesta-signos').tap();await page.clock.runFor(50);
    const cajas=await page.evaluate(()=>['.fiesta-signos','.escena-fiesta-signos','.cohete-fiesta-signos','.cuenta-fiesta-signos','.continuar-fiesta-signos','.nueva-ronda-fiesta-signos','.audio-fiesta-signos'].map(s=>({s,r:document.querySelector(s).getBoundingClientRect().toJSON()})));
    for(const{r,s}of cajas)assert.ok(r.left>=-1&&r.top>=-1&&r.right<=w+1&&r.bottom<=h+1,JSON.stringify({w,h,z,s,r}));
    await page.clock.fastForward(8500);await page.clock.runFor(50);
    const texto=await page.locator('.mensaje-fiesta-signos').evaluate(e=>({r:e.getBoundingClientRect().toJSON(),overflow:e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1}));
    assert.ok(!texto.overflow,JSON.stringify({w,h,z,texto}));
    // Both exit buttons work with actual touch, including 50% and 200% zoom.
    await page.locator(z===85||z===200?'.nueva-ronda-fiesta-signos':'.continuar-fiesta-signos').tap();
    assert.equal(await page.evaluate(()=>FiestaSignos.activa),false);
    if(z===85||z===200)assert.equal(await page.locator('#drop0').innerText(),'');
   }
   console.log('PASS complete rocket scene, message and touch at all zooms',w,h);
  }
  await page.setViewportSize({width:1024,height:768});
  await page.locator('#zoom-aplicacion').evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));});await page.clock.runFor(100);
  await page.locator('#boton-pantalla-completa').click();assert.ok(await page.evaluate(()=>!!document.fullscreenElement));
  await page.evaluate(()=>FiestaSignos.abrir({nombre:'Gabriel'}));await page.clock.runFor(100);
  await page.locator('.despegar-fiesta-signos').focus();await page.keyboard.press('Enter');
  assert.ok(await page.locator('.continuar-fiesta-signos').isVisible());
  await page.setViewportSize({width:768,height:1024});await page.clock.runFor(100);
  const resized=await page.locator('.fiesta-signos').boundingBox();assert.ok(resized.x>=0&&resized.y>=0&&resized.width<=768&&resized.height<=1024);
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>FiestaSignos.activa),false);
  await page.locator('#boton-pantalla-completa').click();

  await page.locator('.configurar-signos').click();await page.selectOption('#idiomaAplicacion','en');await page.locator('#sonidoFiestaSignos').check();await page.selectOption('#duracionFiestaSignos','8');await page.locator('#aplicarConfiguracionSignos').click();await page.clock.runFor(100);
  await page.waitForFunction(()=>IdiomaVoz.idioma==='en');
  await page.evaluate(()=>{lecturas=[];FiestaSignos.abrir({nombre:'Marcos'});});
  assert.equal(await page.locator('#tituloFiestaSignos').innerText(),'Mission complete!');
  assert.equal(await page.locator('.nueva-ronda-fiesta-signos').innerText(),'↻ New round');
  assert.equal(await page.locator('.despegar-fiesta-signos').innerText(),'🚀 Launch');
  await page.locator('.despegar-fiesta-signos').tap();
  await page.clock.fastForward(8400);await page.clock.runFor(100);
  assert.equal(await page.locator('.mensaje-fiesta-signos h3').innerText(),'Congratulations!');
  assert.match(await page.evaluate(()=>lecturas.at(-1).texto),/Marcos/);assert.match(await page.evaluate(()=>lecturas.at(-1).idioma),/^en/);
  await page.clock.fastForward(8100);await page.clock.runFor(100);assert.equal(await page.evaluate(()=>FiestaSignos.activa),false);
  await page.locator('.configurar-signos').click();await page.locator('#activarFiestaSignos').uncheck();await page.locator('#aplicarConfiguracionSignos').click();await page.clock.runFor(100);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('signos.celebracion.v1')).activa===false);
  assert.equal(await page.evaluate(()=>FiestaSignos.abrir()),false);
  assert.deepEqual(errors,[]);

  const blocked=await browser.newPage({viewport:{width:740,height:320},reducedMotion:'reduce'});
  await blocked.route('https://**',r=>r.abort());
  await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked');};Storage.prototype.setItem=()=>{throw Error('blocked');};speechSynthesis.speak=()=>{};speechSynthesis.cancel=()=>{};});
  await blocked.goto(url);await blocked.evaluate(()=>FiestaSignos.abrir());
  assert.ok(await blocked.locator('.cohete-fiesta-signos').isVisible());await blocked.locator('.despegar-fiesta-signos').click();await blocked.locator('.continuar-fiesta-signos').click();assert.equal(await blocked.evaluate(()=>FiestaSignos.activa),false);
  console.log('PASS deferred preferences, mute, persistence, English voice, timer, disabled celebration, fullscreen, rotation and blocked storage');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
