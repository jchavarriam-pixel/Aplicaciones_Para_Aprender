const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,'generador-oraciones.html')).href);await page.waitForFunction(()=>baseLista);
  const coverage=await page.evaluate(()=>{
   const counts={};onlySelectedImages=true;excludedImages=new Set();
   const people=new Set(CATEGORIES.find(c=>c.id==='personas').palabras);
   if(SENTENCES.some(r=>r.pics.includes('come')&&!r.pics.some(p=>['conejo','tortuga','caballo'].includes(p))&&r.pics.some(p=>people.has(p))&&r.pics.some(p=>['zanahoria','pepino','lechuga'].includes(p))))throw Error('Comida cruda sin contexto humano');
   if(!SENTENCES.some(r=>r.pics.includes('conejo')&&r.pics.includes('come')&&r.pics.includes('zanahoria')))throw Error('Falta ejemplo del conejo');
   for(const cat of CATEGORIES.filter(c=>c.id!=='general')){
    selectedCategories=new Set(['general',cat.id]);reiniciarMazosOraciones();
    const theme=new Set(cat.palabras),allowed=imagenesDelFiltro();counts[cat.id]=[];
    for(let level=1;level<=6;level++){
     const pool=poolUnicoNivel(level);if(!pool.length)throw Error('Vacío '+cat.id+' '+level);
     if(pool.some(r=>!r.pics.some(p=>theme.has(p))||r.pics.some(p=>!allowed.has(p))))throw Error('Filtrado '+cat.id);
     counts[cat.id].push(pool.length);
     for(let i=0;i<5;i++){
      const row=tomarOracion(level);if(!respuestaValida(row.words,row,level>=5))throw Error('Respuesta');
     }
    }
   }
   selectedCategories=new Set(['general','texturas']);excludedImages=new Set(['suave','duro']);reiniciarMazosOraciones();
   if(Array.from({length:6},(_,i)=>poolUnicoNivel(i+1).length).some(Boolean))throw Error('General presenta ejercicios sin tema');
   selectedCategories=new Set(['general','vegetales']);excludedImages=new Set();reiniciarMazosOraciones();
   guardarCategorias();guardarSeleccionImagenes();renderCategoryOptions();renderImageOptions();actualizarDisponibilidad();
   return counts;
  });
  await page.locator('[data-level="6"]').click();
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.deepEqual(await page.evaluate(()=>({cats:[...selectedCategories].sort(),strict:onlySelectedImages,level:currentLevel})),{cats:['general','vegetales'],strict:true,level:6});
  await page.locator('#startBtn').click();
  assert.ok(await page.evaluate(()=>current.pics.includes('zanahoria')||current.pics.includes('lechuga')));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await page.locator('#backBtn').click();
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  const out=process.env.ORACIONES_QA_DIR;if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'general-vegetales-telefono.png'),fullPage:true});}
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({categoryPairs:Object.keys(coverage).length,levelsPerPair:6,strictSelectionAndTopicAnchor:'OK',savedAndPhone:'OK',counts:coverage}));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
