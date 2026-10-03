const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');const {chromium}=require('playwright');
const db=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../base_oraciones.json'),'utf8'));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 const url=pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href;
 await page.goto(url);await page.waitForFunction(()=>baseLista);
 await page.locator('#categoryOptions input[value="animales"]').check();
 await page.locator('#galleryBtn').click();assert.equal(await page.locator('#galleryCategoryOptions input').count(),db.categorias.length+1);
 assert.equal(await page.locator('.gallery-card').count(),Object.keys(db.imagenes).length);
 const tested=await page.evaluate(()=>{
  let tested=0;
  for(const c of CATEGORIES){galleryCategories=new Set([c.id]);renderImageGallery();
   const expected=Object.keys(WORDS).filter(k=>c.palabras.includes(k)).length;
   if(galleryGrid.children.length!==expected)throw Error(c.id);
   for(const card of galleryGrid.children)if(!card.querySelector('.gallery-categories').textContent.includes(c.label))throw Error('Etiqueta '+c.id);
   tested++;
  }
  galleryCategories=null;renderImageGallery();return tested;
 });
 await page.locator('#galleryCategoryOptions input[value="relieve"]').check();
 await page.locator('#galleryCategoryOptions input[value="lugares"]').check();
 const union=await page.evaluate(()=>{
  const keys=Object.keys(WORDS).filter(k=>CATEGORIES.some(c=>['relieve','lugares'].includes(c.id)&&c.palabras.includes(k)));
  return galleryGrid.children.length===keys.length&&selectedCategories.size===1&&selectedCategories.has('animales');
 });assert.ok(union);
 assert.equal(await page.locator('#galleryCategoryOptions input[value="*"]').isChecked(),false);
 const qa=process.env.ORACIONES_QA_DIR;if(qa){fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'galeria-escritorio.png'),fullPage:true});}
 await page.reload();await page.waitForFunction(()=>baseLista);await page.locator('#galleryBtn').click();
 for(const id of ['relieve','lugares'])assert.equal(await page.locator(`#galleryCategoryOptions input[value="${id}"]`).isChecked(),true);
 await page.locator('#galleryCategoryOptions input[value="relieve"]').uncheck();await page.locator('#galleryCategoryOptions input[value="lugares"]').uncheck();
 assert.equal(await page.locator('.gallery-card').count(),0);assert.match(await page.locator('#galleryCount').textContent(),/Selecciona/);
 await page.locator('#galleryCategoryOptions input[value="*"]').check();assert.equal(await page.locator('.gallery-card').count(),Object.keys(db.imagenes).length);
 await page.setViewportSize({width:390,height:844});await page.locator('#galleryCategoryOptions input[value="relieve"]').check();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 if(qa)await page.screenshot({path:path.join(qa,'galeria-telefono.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({categories:tested,union:'OK',independent:'OK',persistence:'OK',emptySelection:'OK',phone:'OK'}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
