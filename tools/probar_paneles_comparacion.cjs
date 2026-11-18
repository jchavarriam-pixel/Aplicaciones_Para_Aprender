const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  for(const[archivo,panel,clave,config,cerrar,ejercicios]of[
   ['Mayor_Menor.html','.herramientas-mayor','cajasMayorMenor.anchoHerramientas.v1','.boton-configuracion-mayor','.aplicar-configuracion-mayor','.exercise-card'],
   ['mayor_menor_igual.html','.herramientas-signos','signos.anchoHerramientas.v1','.configurar-signos','#aplicarConfiguracionSignos','.exercise-row']
  ]){
   const p=await browser.newPage({viewport:{width:1280,height:800},hasTouch:true}),errors=[];
   p.on('pageerror',e=>errors.push(e.message));await p.route('https://**',r=>r.abort());
   await p.addInitScript(()=>{speechSynthesis.speak=()=>{};speechSynthesis.cancel=()=>{};});
   const url=pathToFileURL(path.resolve(archivo)).href;await p.goto(url);const borde=p.locator('.ancho-panel-ajustable');await borde.waitFor();
   const ronda=await p.locator(ejercicios).allTextContents(),cdp=await p.context().newCDPSession(p);
   async function arrastrar(proporcion,tactil){
    const g=await borde.evaluate((e,n)=>{const app=e.parentElement,r=app.getBoundingClientRect(),s=getComputedStyle(app),z=r.width/app.offsetWidth,l=(parseFloat(s.paddingLeft)+parseFloat(s.borderLeftWidth))*z,der=(parseFloat(s.paddingRight)+parseFloat(s.borderRightWidth))*z,ancho=r.width-l-der,hueco=parseFloat(s.columnGap)*z,b=e.getBoundingClientRect();return{inicio:{x:b.x+b.width/2,y:Math.min(b.y+b.height/2,innerHeight-35)},fin:{x:r.left+l+n*ancho+hueco/2,y:Math.min(b.y+b.height/2,innerHeight-35)},ancho};},proporcion);
    if(tactil){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[g.inicio]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[g.fin]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    else{await p.mouse.move(g.inicio.x,g.inicio.y);await p.mouse.down();await p.mouse.move(g.fin.x,g.fin.y,{steps:5});await p.mouse.up();}
    await p.waitForTimeout(150);
    const ancho=await p.locator(panel).evaluate(e=>e.getBoundingClientRect().width);
    assert.ok(Math.abs(ancho-g.ancho*proporcion)<2,JSON.stringify({archivo,proporcion,tactil,ancho,g}));
    const posicion=await borde.evaluate(e=>e.getBoundingClientRect().width);assert.ok(Math.abs(posicion-24)<.2);
    assert.ok(Math.abs(+(await p.evaluate(k=>localStorage.getItem(k),clave))-proporcion)<.005);
   }
   for(const z of[50,85,100,150,200]){
    await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await p.waitForTimeout(140);
    await arrastrar(.36,true);await arrastrar(.28,false);
    assert.deepEqual(await p.locator(ejercicios).allTextContents(),ronda,'Resizing preserves the round');
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   }
   await p.locator('#zoom-aplicacion').evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));});await p.waitForTimeout(120);
   await arrastrar(.38,true);await p.reload();await borde.waitFor();
   assert.ok(Math.abs(await p.evaluate(k=>+localStorage.getItem(k),clave)-.38)<.001);
   await p.setViewportSize({width:390,height:844});await p.waitForTimeout(150);assert.ok(!await borde.isVisible());
   await p.setViewportSize({width:1280,height:800});await p.waitForTimeout(150);assert.ok(await borde.isVisible());assert.equal(await borde.getAttribute('aria-valuenow'),'38');
   await p.locator('.alternar-panel-compartido').click();assert.ok(!await borde.isVisible());await p.locator('.alternar-panel-compartido').click();await borde.waitFor();assert.equal(await borde.getAttribute('aria-valuenow'),'38');
   await p.locator('#boton-pantalla-completa').click();await p.waitForTimeout(120);await arrastrar(.34,true);await p.locator('#boton-pantalla-completa').click();
   await borde.focus();await p.keyboard.press('Home');await p.keyboard.press('ArrowRight');await p.waitForTimeout(120);assert.ok(+await borde.getAttribute('aria-valuenow')>=27);
   await p.keyboard.press('End');await p.waitForTimeout(120);assert.equal(await borde.getAttribute('aria-valuenow'),'48');
   await p.locator(config).click();await p.selectOption('#idiomaAplicacion','en');await p.locator(cerrar).click();await p.waitForFunction(()=>IdiomaVoz.idioma==='en');assert.equal(await borde.getAttribute('aria-label'),'Adjust panel width');
   await p.screenshot({path:archivo==='Mayor_Menor.html'?'.qa-ancho-cajas.png':'.qa-ancho-signos.png'});
   assert.deepEqual(errors,[]);
   const bloqueado=await browser.newPage({viewport:{width:1024,height:768}});await bloqueado.route('https://**',r=>r.abort());
   await bloqueado.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked');};Storage.prototype.setItem=()=>{throw Error('blocked');};speechSynthesis.speak=()=>{};});await bloqueado.goto(url);await bloqueado.locator('.ancho-panel-ajustable').waitFor();await bloqueado.locator('.ancho-panel-ajustable').focus();await bloqueado.keyboard.press('ArrowRight');assert.ok(await bloqueado.locator('.ancho-panel-ajustable').isVisible());await bloqueado.close();
   console.log('PASS',archivo,'mouse/touch at 50–200%, saved width, round preserved, portrait, fold, fullscreen, keyboard, English and blocked storage');await p.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
