const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  const url=pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href;
  await page.goto(url);await page.waitForFunction(()=>baseLista);
  await page.locator('#nameInput').fill('Marta');
  await page.locator('[data-level="6"]').click();
  await page.locator('input[value="relieve"]').check();
  await page.locator('input[value="animales"]').check();
  await page.locator('#showLabelsInput').check();
  await page.locator('#showExtrasInput').check();
  await page.locator('#allowHintInput').uncheck();
  await page.locator('#allowHelpInput').uncheck();
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.equal(await page.locator('.level-btn.active').getAttribute('data-level'),'6');
  assert.equal(await page.locator('#nameInput').inputValue(),'Marta');
  for(const id of ['relieve','animales'])assert.equal(await page.locator(`input[value="${id}"]`).isChecked(),true);
  for(const id of ['allowHintInput','allowHelpInput'])assert.equal(await page.locator('#'+id).isChecked(),false);
  for(const id of ['showLabelsInput','showExtrasInput'])assert.equal(await page.locator('#'+id).isChecked(),true);
  assert.equal(await page.locator('#showLabelsInput').isDisabled(),true);
  const qa=process.env.ORACIONES_QA_DIR;
  if(qa){fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'preferencias-escritorio.png'),fullPage:true});}
  await page.locator('#startBtn').click();
  assert.equal(await page.locator('#labelsBtn').isVisible(),false);
  assert.equal(await page.locator('#sentenceHintBtn').isVisible(),false);
  assert.equal(await page.locator('.pic-label').first().isVisible(),false);
  await page.evaluate(()=>{toggleSentenceHint();document.getElementById('labelsBtn').click();});
  assert.equal(await page.locator('#sentenceHintBox').isVisible(),false);
  assert.equal(await page.locator('.pic-label').first().isVisible(),false);
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('show-extra-gray')),true);
  const filtered=await page.evaluate(()=>{
   let checked=0;
   for(const c of CATEGORIES){
    selectedCategories=new Set([c.id]);
    for(let level=1;level<=6;level++)for(const row of poolUnicoNivel(level)){
     if(!row.pics.some(p=>c.palabras.includes(p)))throw Error('Falta una imagen de '+c.label);
     checked++;
    }
   }
   selectedCategories=new Set(['relieve']);reiniciarMazosOraciones();
   for(let level=1;level<=6;level++)for(let i=0;i<100;i++){
    const row=tomarOracion(level),words=CATEGORIES.find(c=>c.id==='relieve').palabras;
    if(!row.pics.some(p=>words.includes(p)))throw Error('Ejercicio sin imagen del tema');
   }
   // Un registro mal etiquetado no puede pasar por una categoría ajena a sus imágenes.
   if(coincideCategorias({pics:['perro'],categorias:['relieve']}))throw Error('Confió en una etiqueta incorrecta');
   return checked;
  });
  for(const width of [1280,390]){
   await page.setViewportSize({width,height:900});
   for(const level of [1,2,3,5]){
    await page.evaluate(level=>{currentLevel=level;newExercise();},level);
    await page.locator('.pic-card img').first().evaluate(img=>img.decode());
    const geometry=await page.locator('.pic-card').first().evaluate(card=>{
     const image=card.querySelector('img').getBoundingClientRect(),box=card.getBoundingClientRect();
     return {ratio:image.width/box.width,square:Math.abs(image.width-image.height),gap:box.height-image.height};
    });
    assert.ok(geometry.ratio>.88,JSON.stringify(geometry));
    assert.ok(geometry.square<2);
    assert.ok(geometry.gap<20,JSON.stringify(geometry));
   }
   if(qa)await page.screenshot({path:path.join(qa,`imagenes-${width}.png`),fullPage:true});
  }
  await page.locator('#backBtn').click();
  await page.locator('[data-level="6"]').click();
  await page.locator('#allowHelpInput').check();await page.locator('#allowHintInput').check();
  await page.locator('#startBtn').click();
  assert.equal(await page.locator('#labelsBtn').isVisible(),true);
  assert.equal(await page.locator('.pic-label').first().isVisible(),true);
  await page.locator('#sentenceHintBtn').click();assert.equal(await page.locator('#sentenceHintBox').isVisible(),true);
  await page.locator('#labelsBtn').click();await page.locator('#extraGrayBtn').click();
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.equal(await page.locator('#showLabelsInput').isChecked(),false);
  assert.equal(await page.locator('#showExtrasInput').isChecked(),false);
  await page.locator('#nameInput').fill('');await page.reload();await page.waitForFunction(()=>baseLista);
  assert.equal(await page.locator('#nameInput').inputValue(),'');
  const blocked=await browser.newPage();
  await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('Bloqueado');};Storage.prototype.setItem=()=>{throw Error('Bloqueado');};});
  await blocked.route('https://fonts.googleapis.com/**',r=>r.abort());
  await blocked.goto(url);await blocked.waitForFunction(()=>baseLista);
  await blocked.locator('#allowHelpInput').uncheck();await blocked.locator('[data-level="5"]').click();
  await blocked.locator('#startBtn').click();assert.equal(await blocked.locator('#labelsBtn').isVisible(),false);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({filtered,preferences:'OK',imageSizing:'OK',blockedStorage:'OK'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
