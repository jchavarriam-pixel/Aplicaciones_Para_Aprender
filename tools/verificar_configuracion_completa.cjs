// Comprueba cada elección con recarga y con una nueva pestaña del mismo navegador.
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const preferences=['allowHintInput','allowHelpInput','showLabelsInput','showExtrasInput','celebrationSoundInput','reducedCelebrationInput'];
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext();
  await context.route('https://fonts.googleapis.com/**',r=>r.abort());
  const url=pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href;
  let page=await context.newPage();
  const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  await page.goto(url);await page.waitForFunction(()=>baseLista);
  const snapshot=()=>page.evaluate(()=>({
   level:currentLevel,extras:extraWordsCount,name:document.getElementById('nameInput').value,
   categories:selectedCategories===null?null:[...selectedCategories].sort(),
   excluded:[...excludedImages].sort(),onlySelected:onlySelectedImages,
   preferences:Object.fromEntries(['allowHintInput','allowHelpInput','showLabelsInput','showExtrasInput','celebrationSoundInput','reducedCelebrationInput'].map(id=>[id,document.getElementById(id).checked])),
   gallery:galleryCategories===null?null:[...galleryCategories].sort(),
   counts:Array.from({length:6},(_,i)=>poolUnicoNivel(i+1).length),
  }));
  let checks=0;
  for(const mode of ['custom','empty','all']){
   await page.locator('#nameInput').fill(mode==='empty'?'':'Gabriel de prueba');
   await page.locator(`[data-level="${mode==='custom'?6:mode==='empty'?3:1}"]`).click();
   if(mode==='custom')await page.locator('#extraWordsSelect').selectOption('6');
   // Activar ayuda antes de modificar la opción subordinada de nombres.
   await page.locator('#allowHelpInput').check();
   await page.locator('#showLabelsInput').setChecked(mode!=='empty');
   for(const id of preferences.filter(id=>id!=='showLabelsInput'))await page.locator('#'+id).setChecked(mode==='all'||(mode==='custom'&&['showExtrasInput','reducedCelebrationInput'].includes(id)));
   await page.locator('#categoryOptions input[value="*"]').setChecked(true);
   if(mode!=='all'){
    await page.locator('#categoryOptions input[value="*"]').uncheck();
    if(mode==='custom')for(const id of ['frutas','personas','acciones'])await page.locator(`#categoryOptions input[value="${id}"]`).check();
   }
   await page.locator('#resetImageSelectionBtn').click();
   if(mode==='custom'){
    const cat=page.locator('#exerciseImageOptions details[data-category="frutas"]');
    if(!await cat.evaluate(el=>el.open))await cat.locator('summary').click();
    await cat.getByRole('button',{name:'Ninguna',exact:true}).click();
    await cat.locator('input[data-word="pera"]').check();
   }
   await page.locator('#onlySelectedImagesInput').setChecked(mode==='custom');
   await page.locator('#galleryBtn').click();
   await page.locator('#galleryCategoryOptions input[value="*"]').check();
   if(mode!=='all'){
    await page.locator('#galleryCategoryOptions input[value="*"]').uncheck();
    if(mode==='custom')await page.locator('#galleryCategoryOptions input[value="tecnologia"]').check();
   }
   await page.locator('#galleryBackBtn').click();
   const expected=await snapshot();
   await page.reload();await page.waitForFunction(()=>baseLista);
   assert.deepEqual(await snapshot(),expected,'Recarga: '+mode);checks++;
   await page.close();page=await context.newPage();
   await page.goto(url);await page.waitForFunction(()=>baseLista);
   assert.deepEqual(await snapshot(),expected,'Nueva pestaña: '+mode);checks++;
  }
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({configuration:'OK',checked:preferences.concat(['level','name','categories','images','onlySelectedImages','galleryFilters']),reloadAndReopen:checks,emptyAndAll:'OK'}));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
