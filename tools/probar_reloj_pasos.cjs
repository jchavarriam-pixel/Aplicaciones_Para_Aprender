const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const p=await b.newPage({viewport:{width:1200,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(path.resolve('Reloj_Analogico/reloj.html')).href);await p.locator('[data-modo=explora]').click();
 const menos=p.locator('[data-cambio="-1"]'),mas=p.locator('[data-cambio="1"]'),time=async()=>Number(await p.locator('#reloj').getAttribute('data-minutos'));
 // Half-hour practice contains only :30; quarter-hour practice contains :15 and :45.
 // Preserve those existing grids, and label the actual movement between their allowed times.
 for(const[precision,step]of [['horas',60],['medias',60],['cuartos',30],['cinco',5],['libre',1]]){
  await p.locator('#configurar').click();await p.locator('#precision').selectOption(precision);await p.locator('#narracion').uncheck();await p.locator('#cerrarConfig').click();await p.waitForTimeout(60);
  assert.equal(await mas.textContent(),'+'+step+' min');assert.equal(await menos.textContent(),'−'+step+' min');assert.match(await mas.getAttribute('aria-label'),new RegExp(String(step)));
  const original=await time();for(let i=0;i<12;i++){const before=await time();await mas.click();assert.equal(((await time())-before+720)%720,step);const after=await time();await menos.click();assert.equal((after-(await time())+720)%720,step);assert.equal(await time(),before);await mas.click();}for(let i=0;i<12;i++)await menos.click();assert.equal(await time(),original);
  assert.equal(await p.locator('[data-cambio="-60"]').textContent(),'−1 h');assert.equal(await p.locator('[data-cambio="60"]').textContent(),'+1 h');
  await p.reload();assert.equal(await mas.textContent(),'+'+step+' min');assert.equal(await menos.textContent(),'−'+step+' min');
 }
 // The widest labels must fit in both orientations, at every application zoom.
 await p.locator('#configurar').click();await p.locator('#precision').selectOption('medias');await p.locator('#idiomaAplicacion').selectOption('en');await p.locator('#cerrarConfig').click();await p.waitForTimeout(100);assert.match(await mas.getAttribute('aria-label'),/Advance 60 minutes/);assert.match(await menos.getAttribute('aria-label'),/Go back 60 minutes/);
 for(const[w,h]of [[320,568],[568,320],[390,844],[844,390],[800,1200],[1200,800]])for(const z of [50,85,100,150,200]){await p.setViewportSize({width:w,height:h});await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await p.waitForTimeout(80);const bad=await p.locator('#reloj,#exploracion [data-cambio]').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.x<0||r.y<0||r.right>innerWidth+1||r.bottom>innerHeight+1||e.tagName==='BUTTON'&&e.scrollWidth>e.clientWidth+1;}).map(e=>({text:e.textContent,rect:e.getBoundingClientRect().toJSON()})));assert.deepEqual(bad,[],`${w}x${h} at ${z}%`);}
 await p.locator('#boton-pantalla-completa').click();assert(await p.evaluate(()=>!!document.fullscreenElement));assert.equal(await mas.textContent(),'+60 min');await p.locator('#boton-pantalla-completa').click();assert.deepEqual(errors,[]);console.log('PASS: labels match actual steps for all five precisions, both directions and wraparound; settings survive reload, accessible English labels, 30 layouts/zooms and fullscreen.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
