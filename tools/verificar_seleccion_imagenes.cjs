const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'base_oraciones.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'generador-oraciones.html'),'utf8');
assert.deepEqual(JSON.parse(html.match(/id="baseOracionesIntegrada">([\s\S]*?)<\/script>/)[1]),db);
const used=new Set(db.oraciones.flatMap(o=>o.pics));
assert.ok(Object.keys(db.imagenes).every(w=>used.has(w)),'Cada imagen participa en ejercicios');
for(const o of db.oraciones){
 if(o.source==='vocabulario_ampliado_v1')assert.ok(({1:[2],2:[3],3:[4,5],4:[3,4,5],5:[4,5],6:[4,5]})[o.level].includes(o.pics.length));
 assert.ok(o.pics.every(w=>db.imagenes[w]&&fs.existsSync(path.join(root,db.imagenes[w].img))));
 if(o.level>=5)assert.deepEqual(o.contentWords,o.words.filter(w=>!db.conectores_reutilizables.includes(w)));
}
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(pathToFileURL(path.join(root,'generador-oraciones.html')).href);
  await page.waitForFunction(()=>baseLista);
  await page.locator('#categoryOptions input[value="frutas"]').check();
  const fruit=page.locator('#exerciseImageOptions details[data-category="frutas"]');
  await fruit.locator('summary').click();
  await fruit.getByRole('button',{name:'Ninguna',exact:true}).click();
  assert.equal(await page.locator('#startBtn').isEnabled(),false);
  await fruit.locator('input[data-word="pera"]').check();
  const counts=await page.evaluate(()=>Array.from({length:6},(_,i)=>poolUnicoNivel(i+1).length));
  assert.ok(counts.every(n=>n>0),'Pera disponible en los seis niveles');
  await page.evaluate(()=>{
   for(let level=1;level<=6;level++){
    const pool=poolUnicoNivel(level);
    for(const row of pool){if(!row.pics.includes('pera')||row.pics.some(p=>excludedImages.has(p)))throw Error('Imagen no seleccionada');}
    let previous=null;
    for(let round=0;round<2;round++){
     const seen=new Set();
     for(let i=0;i<pool.length;i++){
      const row=tomarOracion(level),key=canonical(row.words);
      if(seen.has(key)||(i===0&&key===previous&&pool.length>1))throw Error('Repeticion');
      if(row.extras?.some(p=>excludedImages.has(p)))throw Error('Distractor desmarcado');
      if([4,6].includes(level)&&![2,3].includes(row.extras.length))throw Error('Distractores');
      seen.add(key);previous=key;
     }
    }
   }
  });
  await page.locator('#categoryOptions input[value="alimentos"]').check();
  const food=page.locator('#exerciseImageOptions details[data-category="alimentos"]');
  await food.locator('summary').click();
  assert.equal(await food.locator('input[data-word="pera"]').isChecked(),true);
  await food.locator('input[data-word="pera"]').uncheck();
  assert.equal(await fruit.locator('input[data-word="pera"]').isChecked(),false,'Selección compartida sincronizada');
  await food.locator('input[data-word="pera"]').check();
  await page.locator('#categoryOptions input[value="alimentos"]').uncheck();
  await page.locator('#onlySelectedImagesInput').check();
  assert.equal(await page.locator('#startBtn').isEnabled(),false,'Filtro estricto no introduce apoyo');
  await page.locator('#categoryOptions input[value="acciones"]').check();
  await page.locator('#categoryOptions input[value="personas"]').check();
  assert.ok(await page.evaluate(()=>poolUnicoNivel(2).length>0));
  const strict=await page.evaluate(()=>{
   const allowed=imagenesDelFiltro();
   return Array.from({length:6},(_,i)=>poolUnicoNivel(i+1).every(o=>o.pics.every(w=>allowed.has(w))));
  });assert.ok(strict.every(Boolean));
  await page.locator('[data-level="2"]').click();
  const count=await page.evaluate(()=>poolUnicoNivel(2).length.toLocaleString('es-CR'));
  assert.ok((await page.locator('#availableCount').textContent()).includes(count));
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.equal(await page.locator('#onlySelectedImagesInput').isChecked(),true);
  assert.equal(await page.evaluate(()=>excludedImages.has('manzana')),true);
  assert.equal(await page.evaluate(()=>excludedImages.has('pera')),false);
  assert.equal(await page.evaluate(()=>currentLevel),2);
  const solved=await page.evaluate(()=>{
   let count=0;
   for(const row of SENTENCES){
    if(row.source!=='vocabulario_ampliado_v1')continue;
    // Una copia temporal evita acumular patrones en el WeakMap de la aplicación.
    if(!respuestaValida(row.words,{...row},row.level>=5))throw Error('Respuesta rechazada: '+row.words.join(' '));
    count++;
   }
   return count;
  });
  const out=process.env.ORACIONES_QA_DIR;
  if(out){fs.mkdirSync(out,{recursive:true});await page.locator('#exerciseImageOptions details[data-category="frutas"] summary').click();await page.screenshot({path:path.join(out,'seleccion-imagenes-tableta.png'),fullPage:true});}
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Sin desbordamiento');
  if(out)await page.screenshot({path:path.join(out,'seleccion-imagenes-telefono.png'),fullPage:true});
  await page.locator('#resetImageSelectionBtn').click();
  assert.equal(await page.evaluate(()=>excludedImages.size),0);
  const narrow=await page.evaluate(()=>{
   selectedCategories=null;onlySelectedImages=true;
   cambiarImagenes(Object.keys(WORDS),false);cambiarImagenes(['Marta','come','pera'],true);
   const pool=poolUnicoNivel(2);if(!pool.length)throw Error('Mazo de tres imágenes vacío');
   for(let i=0;i<20;i++){
    const row=tomarOracion(4);
    if(!row||row.extras.length<2||row.extras.some(w=>excludedImages.has(w)))throw Error('Distractores con selección mínima');
   }
   return pool.length;
  });
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({total:db.oraciones.length,images:Object.keys(db.imagenes).length,categories:db.categorias.length,counts,solved,narrow,result:'OK'}));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
