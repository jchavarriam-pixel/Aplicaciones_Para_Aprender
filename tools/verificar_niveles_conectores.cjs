const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'base_oraciones.json'),'utf8'));
assert.equal(db.estructura_niveles_version,2);
const long=db.oraciones.filter(r=>r.level===6);
assert.ok(long.length>=1258);
assert.ok(long.every(r=>r.words.length>=11&&r.words.length<=19&&r.pics.length>=5&&r.pics.length<=8));
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(path.join(root,'generador-oraciones.html')).href;
  await page.goto(url);await page.waitForFunction(()=>baseLista);
  assert.equal(await page.locator('#connectorDifficultyOptions').isVisible(),false);
  let checks=0;
  for(const level of [5,6]){
   await page.locator(`[data-level="${level}"]`).click();
   assert.equal(await page.locator('#connectorDifficultyOptions').isVisible(),true);
   for(const amount of [0,1,2,3,6]){
    await page.locator('#extraWordsSelect').selectOption(String(amount));
    const result=await page.evaluate(({level,amount})=>{
     leerRespuestaYCelebrar=()=>{};
     for(let i=0;i<25;i++){
      current=tomarOracion(level);loadCurrent();
      if(current.extras.length!==amount||new Set(current.extras).size!==amount)throw Error('Cantidad o duplicados');
      for(const w of current.words){
       const b=bankItems.findIndex(it=>it.base===w);
       if(b>=0)moveItem('bank',b,'sentence',sentenceItems.length);
       else{const f=functionItems.findIndex(it=>it.base===w);if(f<0)throw Error('Falta '+w);moveItem('function',f,'sentence',sentenceItems.length);}
      }
      renderWords();checkAnswer();
      if(!isSolved||bankItems.length!==amount)throw Error('Respuesta o sobrantes incorrectos');
      if(!functionItems.some(it=>it.base==='su')||!functionItems.some(it=>it.base==='y'))throw Error('Conectores');
     }
     return 25;
    },{level,amount});checks+=result;
   }
  }
  // Incluso un filtro estricto con casi ninguna palabra disponible mantiene seis extras distintos.
  await page.evaluate(()=>{
   const row=SENTENCES.find(r=>r.level===6);
   selectedCategories=null;onlySelectedImages=true;
   excludedImages=new Set(Object.keys(WORDS).filter(w=>!row.pics.includes(w)));
   reiniciarMazosOraciones();
   for(let i=0;i<20;i++){
    const r=tomarOracion(6);if(!r||r.extras.length!==6||new Set(r.extras).size!==6||r.extras.some(w=>excludedImages.has(w)))throw Error('Selección mínima');
   }
   selectedCategories=null;onlySelectedImages=false;excludedImages=new Set();reiniciarMazosOraciones();
   actualizarDisponibilidad();
  });
  await page.locator('#extraWordsSelect').selectOption('3');
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.deepEqual(await page.evaluate(()=>[currentLevel,extraWordsCount]),[6,3]);
  const out=process.env.ORACIONES_QA_DIR;
  if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'niveles-tableta.png'),fullPage:true});}
  await page.locator('#startBtn').click();
  await page.evaluate(()=>{current=SENTENCES.find(r=>r.level===6&&r.pics.length===8);current={...current,extras:[]};loadCurrent();});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Juego desborda en tableta');
  if(out)await page.screenshot({path:path.join(out,'oracion-larga-tableta.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Juego desborda en teléfono');
  if(out)await page.screenshot({path:path.join(out,'oracion-larga-telefono.png'),fullPage:true});
  await page.evaluate(()=>localStorage.setItem(CLAVE_PREFERENCIAS,JSON.stringify({level:6})));
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.deepEqual(await page.evaluate(()=>[currentLevel,extraWordsCount]),[5,2],'Migración del antiguo nivel 6');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({longExercises:long.length,words:[Math.min(...long.map(r=>r.words.length-1)),Math.max(...long.map(r=>r.words.length-1))],solvedWithExactExtras:checks,strictFilter:'OK',savedAndMigration:'OK',tabletAndPhone:'OK'}));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
