const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(pathToFileURL(path.resolve('Reloj_Analogico/reloj.html')).href);
  await p.locator('#configurarGeneral').click();await p.locator('#narracion').uncheck();await p.locator('#cerrarGeneral').click();await p.locator('[data-entrar="pareo"]').click();
  for(const[width,height]of[[320,740],[740,320],[768,1024],[1024,768],[1920,1080]]){
   await p.setViewportSize({width,height});
   for(const z of[.5,.85,1,1.5,2]){
    await p.evaluate(z=>document.body.style.zoom=z,z);await p.waitForTimeout(90);
    const result=await p.evaluate(()=>{
     const s=document.querySelector('.salida-reloj>.esfera-pareo').getBoundingClientRect(),c=document.querySelector('.carrito-reloj').getBoundingClientRect(),r=document.querySelector('#revisar').getBoundingClientRect();
     return{size:s.width,overlap:c.left<s.right-1,review:r.bottom<=innerHeight&&r.top>=0,overflow:document.documentElement.scrollWidth>innerWidth+1,digits:[...document.querySelectorAll('.hora-meta')].map(e=>({overflow:e.scrollWidth>e.clientWidth+2,rect:e.getBoundingClientRect().toJSON()}))};
    });
    assert.ok(result.size>=100,JSON.stringify({width,height,z,result}));assert.ok(!result.overlap&&result.review&&!result.overflow,JSON.stringify({width,height,z,result}));assert.ok(result.digits.every(d=>!d.overflow),JSON.stringify({width,height,z,result}));
   }
  }console.log('PASS: readable clocks, unobstructed cars, digital text and Review in 25 additional layouts/zooms');
  await p.setViewportSize({width:1280,height:900});await p.evaluate(()=>document.body.style.zoom=1);await p.waitForTimeout(100);
  async function conectar(){
   await p.locator('#nueva').click();await p.waitForTimeout(70);
   const times=await p.locator('.horaria-mini').evaluateAll(es=>es.map(e=>{const n=Math.round(+e.getAttribute('transform').match(/rotate\(([^ ]+)/)[1]*2);return`${Math.floor(n/60)||12}:${String(n%60).padStart(2,'0')}`;}));
   for(let i=0;i<times.length;i++){await p.locator(`[data-origen="${i}"]`).click();await p.locator('.hora-meta').filter({hasText:new RegExp('^'+times[i]+'$')}).click();}
  }
  await conectar();await p.locator('#revisar').click();await p.waitForTimeout(400);
  const car=p.locator('.coche-en-carrera').first(),first=await car.getAttribute('transform'),wheel=await car.locator('.rueda-coche').first().getAttribute('transform');assert.equal(await p.locator('.coche-en-carrera').count(),3);
  await p.waitForTimeout(650);assert.notEqual(await car.getAttribute('transform'),first);assert.notEqual(await car.locator('.rueda-coche').first().getAttribute('transform'),wheel);await p.screenshot({path:'.qa-reloj-carrera.png'});
  await p.waitForFunction(()=>document.querySelectorAll('.llegada').length===3);assert.ok(await p.locator('.rutas-reloj>rect,.rutas-reloj>circle').count()<=99);await p.waitForFunction(()=>!document.querySelector('.coche-en-carrera'));assert.equal(await p.locator('.rutas-reloj>rect,.rutas-reloj>circle').count(),0);
  // Zoom/folding during a race cancels the effect and redraws valid connections.
  await p.locator('#revisar').click();await p.waitForTimeout(350);await p.locator('#plegar').click();await p.waitForTimeout(90);assert.equal(await p.locator('.coche-en-carrera').count(),0);assert.equal(await p.locator('[data-ruta]').count(),3);await p.locator('#plegar').click();
  await p.emulateMedia({reducedMotion:'reduce'});await conectar();await p.locator('#revisar').click();await p.waitForFunction(()=>!document.querySelector('.coche-en-carrera'),{},{timeout:1500});assert.equal(await p.locator('.llegada').count(),3);
  await p.locator('#boton-pantalla-completa').click();assert.ok(await p.evaluate(()=>!!document.fullscreenElement));await p.locator('#boton-pantalla-completa').click();
  assert.deepEqual(errors,[]);console.log('PASS: moving cars, spinning wheels, bounded confetti, cleanup, folding, reduced motion and fullscreen');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
