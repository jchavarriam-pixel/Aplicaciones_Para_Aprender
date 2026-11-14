const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});
 await page.addInitScript(()=>{localStorage.setItem('multiplicacion.config.v1',JSON.stringify({forma:'mixto',narracion:false}));});
 await page.goto(pathToFileURL(path.resolve('Multiplicacion/multiplicacion.html')).href);
 await page.waitForFunction(()=>!!window.NombreCompartido);
 assert.equal((await page.locator('#arreglo .forma-geometrica').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.forma))])).length,1,'migrate mixed preference to uniform rounds');
 await page.evaluate(()=>{window.frases=[];IdiomaVoz.hablar=texto=>{window.frases.push(texto);return null;};});
 const configure=async(values)=>{await page.locator('#configurar').click();for(const [id,v]of Object.entries(values)){const e=page.locator('#'+id);if(typeof v==='boolean')await e.setChecked(v);else if(await e.evaluate(n=>n.tagName==='SELECT'))await e.selectOption(String(v));else await e.fill(String(v));}await page.locator('#aplicar').click();await page.waitForTimeout(60);};
 const expected=[['circulo','círculos','circles'],['cuadrado','cuadrados','squares'],['triangulo','triángulos','triangles'],['pentagono','pentágonos','pentagons'],['estrella','estrellas','stars'],['rombo','rombos','rhombuses'],['hexagono','hexágonos','hexagons'],['rectangulo','rectángulos','rectangles']];
 const checkUniform=async(selector,id)=>{const shapes=await page.locator(selector).evaluateAll(es=>es.map(e=>({forma:e.dataset.forma,stroke:e.getAttribute('stroke')})));assert.equal(shapes.length,6);assert.deepEqual([...new Set(shapes.map(e=>e.forma))],[id]);assert.equal(new Set(shapes.map(e=>e.stroke)).size,1);};
 for(const language of ['es','en'])for(const [id,es,en]of expected){
  await configure({forma:id,filasMin:2,filasMax:2,columnasMin:3,columnasMax:3,porGrupoMin:3,porGrupoMax:3,gruposMin:2,gruposMax:2,narracion:true,idiomaAplicacion:language});
  await page.locator('[data-modo="filas"]').click();await checkUniform('#arreglo .forma-geometrica',id);
  const question=language==='es'?`¿Cuánt${id==='estrella'?'as':'os'} ${es} hay?`:`How many ${en} are there?`;
  assert.equal(await page.locator('#pregunta').textContent(),question);
  assert.equal(await page.evaluate(()=>window.frases.at(-1)),question,'automatic spoken question');
  await page.locator('#escuchar').click();assert((await page.evaluate(()=>window.frases.at(-1))).startsWith(question));
  await page.locator('[data-modo="grupos"]').click();await checkUniform('#agrupacion .forma-geometrica',id);assert.equal(await page.locator('#pregunta').textContent(),language==='es'?`Haz grupos de 3 ${es}`:`Make groups of 3 ${en}`);
 }
 await page.locator('[data-modo="filas"]').click();await configure({forma:'azar',idiomaAplicacion:'es',narracion:false});
 const seen=new Set();for(let i=0;i<8;i++){const id=await page.locator('#arreglo .forma-geometrica').first().getAttribute('data-forma');assert(!seen.has(id),'variety between rounds without mixing within a round');seen.add(id);await checkUniform('#arreglo .forma-geometrica',id);await page.locator('#nueva').click();}
 assert.equal(await page.locator('#ecuacion button:not(.casilla)').count(),0,'no erasers inside equation');
 const enter=async(id,n)=>{await page.locator('#'+id).click();for(const c of String(n))await page.locator(`[data-cifra="${c}"]`).click();};
 await enter('factorA',2);await enter('factorB',3);await enter('total',16);await page.locator('#total').click();await page.locator('#borrarNumero').click();assert.equal(await page.locator('#total').textContent(),'');assert.equal(await page.locator('#factorA').textContent(),'2');assert.equal(await page.locator('#factorB').textContent(),'3');assert(await page.locator('#borrarNumero').isDisabled());
 await enter('total',6);await page.locator('#factorA').click();assert.equal(await page.locator('#borrarNumero').getAttribute('aria-controls'),'factorA');await page.locator('#borrarNumero').click();assert.equal(await page.locator('#factorA').textContent(),'');assert.equal(await page.locator('#total').textContent(),'6');
 await configure({forma:'estrella',narracion:false});await enter('factorA',2);await enter('factorB',3);await enter('total',6);await page.screenshot({path:'.qa-multiplicacion-estrellas.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.qa-multiplicacion-estrellas-vertical.png'});const equation=await page.locator('#ecuacion').boundingBox(),eraser=await page.locator('#borrarNumero').boundingBox();assert(eraser.y>=equation.y+equation.height,'eraser below operation');
 await page.setViewportSize({width:800,height:1100});await page.locator('[data-modo="grupos"]').click();await page.screenshot({path:'.qa-multiplicacion-estrellas-grupos.png'});
 await configure({forma:'rectangulo',filasMin:6,filasMax:6,columnasMin:8,columnasMax:8,porGrupoMin:8,porGrupoMax:8,gruposMin:6,gruposMax:6,idiomaAplicacion:'en'});
 for(const modo of ['filas','grupos']){await page.locator(`[data-modo="${modo}"]`).click();for(const [width,height]of [[320,568],[390,844],[844,390],[800,1200],[1200,800]])for(const zoom of [50,100,200]){await page.setViewportSize({width,height});await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},zoom);await page.waitForTimeout(50);const bad=await page.evaluate(()=>['#pregunta','#ecuacion','#borrarNumero','#revisar'].filter(id=>{const r=document.querySelector(id).getBoundingClientRect();return r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1;}));assert.deepEqual(bad,[],`${modo} ${width}x${height} zoom ${zoom}`);}}
 assert.deepEqual(errors,[]);console.log('PASS: all 8 shapes uniform in both modes, Spanish/English and spoken questions, saved mixed preference migration, clean equation, erase only selected field.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
