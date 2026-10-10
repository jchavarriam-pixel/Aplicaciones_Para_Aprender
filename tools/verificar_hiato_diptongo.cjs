// Pruebas de datos y de interacción en Chrome. No modifica las aplicaciones.
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const {pathToFileURL}=require('node:url'), {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const context={}; vm.runInNewContext(fs.readFileSync(path.join(root,'hiato-diptongo-datos.js'),'utf8'),context);
const data=context.HiatoDiptongo;
assert.equal(data.words.length,103);
let dataChecks=0;
for(const word of data.words){
  assert(data.validateCuts(word,new Set(word.cuts)));
  assert.equal(data.vowelTogether(word,new Set(word.cuts)),word.kind==='diptongo');
  assert.equal(Array.from(data.groups(word.word,new Set(word.cuts))).join('-'),Array.from(word.syllables).join('-'));
  for(let i=1;i<word.word.length;i++){
    const wrong=new Set(word.cuts); if(wrong.has(i))wrong.delete(i);else wrong.add(i);
    assert(!data.validateCuts(word,wrong),word.word); dataChecks++;
  }
}
const html=fs.readFileSync(path.join(root,'Hiato_y_Diptongo.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g))assert(fs.existsSync(path.resolve(root,match[1])));
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route(/^https?:/,r=>r.abort());
 // Sólo en las pruebas elegimos una palabra concreta antes de iniciar cada sesión.
 const app=fs.readFileSync(path.join(root,'hiato-diptongo.js'),'utf8');
 const prefix=`{const original=globalThis.HiatoDiptongo;globalThis.HiatoDiptongo={...original,deck:pool=>globalThis.__testWord?[pool.find(r=>r.word===globalThis.__testWord)]:original.deck(pool)}}\n`;
 await page.route('**/hiato-diptongo.js',r=>r.fulfill({contentType:'application/javascript',body:prefix+app}));
 const url=pathToFileURL(path.join(root,'Hiato_y_Diptongo.html')).href;
 await page.goto(url); await page.locator('#hd-level').selectOption('all');
 await page.locator('#hd-name').fill('Gabriel'); await page.locator('#hd-sound').uncheck(); await page.locator('#hd-syllable-sound').uncheck();
 let exercises=0;
 async function dragToCut(cut){
   const token=page.locator('#hd-drag-token'), gap=page.locator('.hd-drag-gap[data-cut="'+cut+'"]').first();
   assert(await gap.count(),'No existe el corte '+cut+' en «'+await page.locator('#hd-word-title').textContent()+'»');
   const a=await token.boundingBox(), b=await gap.boundingBox(); assert(a&&b,'Falta el guion o el espacio de separación para el corte '+cut+' en «'+await page.locator('#hd-word-title').textContent()+'»');
   await page.mouse.move(a.x+a.width/2,a.y+a.height/2); await page.mouse.down();
   await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:5}); await page.mouse.up();
   await page.waitForTimeout(180);
   const selected=await page.locator('.hd-drag-gap.selected').evaluateAll(nodes=>nodes.map(n=>n.dataset.cut).join(','));
   assert(selected.split(',').includes(String(cut)),'No se registró el corte '+cut+'; quedaron '+selected);
 }
 async function exercise(record){
   await page.evaluate(word=>globalThis.__testWord=word,record.word);
   await page.locator('#hd-start').click();
   assert.equal(await page.locator('#hd-word-title').textContent(),record.word);
   assert(await page.locator('.hd-drag-gap').count(), 'No se dibujaron espacios para «'+record.word+'»: '+await page.locator('#hd-letters').innerHTML());
   if(record.cuts.length){await page.locator('#hd-review').click();assert((await page.locator('#hd-feedback').textContent()).includes('Todavía'));}
   for(const cut of record.cuts)await dragToCut(cut);
   await page.locator('#hd-review').click();assert(await page.locator('#hd-classify').isVisible(),record.word+' · '+await page.locator('#hd-feedback').textContent()+' · cortes: '+await page.locator('.hd-drag-gap.selected').evaluateAll(nodes=>nodes.map(n=>n.dataset.cut).join(',')));
   const state=await page.locator('#hd-vowel-state').textContent();
   assert(state.includes(record.kind==='diptongo'?'juntas':'separadas'),record.word+': '+state);
   await page.locator('#hd-'+(record.kind==='hiato'?'diptongo':'hiato')).click();assert(await page.locator('#hd-success').isHidden());
   await page.locator('#hd-'+record.kind).click();assert(await page.locator('#hd-success').isVisible());
   assert((await page.locator('#hd-explanation').textContent()).includes(record.kind));
   await page.locator('#hd-next').click();assert(await page.locator('#hd-game').isVisible());
   await page.locator('#hd-config').click();exercises++;
 }
 // Los datos ya se validan completos arriba. En interfaz cubrimos vocales
 // abiertas/cerradas, tildes, h intercalada y una palabra de cuatro sílabas.
 for(const word of ['aire','país','teatro','búho','eucalipto','sonríe','cuidado'])await exercise(data.words.find(r=>r.word===word));
 const qa=path.join(root,'vocabulario_qa','hiato_diptongo'); fs.mkdirSync(qa,{recursive:true});
 for(const viewport of [{width:768,height:1024},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   for(const word of ['aire','país','teatro','búho','eucalipto'])await exercise(data.words.find(r=>r.word===word));
   await page.evaluate(()=>globalThis.__testWord='país');await page.locator('#hd-start').click();
   await page.screenshot({path:path.join(qa,'separar-'+viewport.width+'.png')});
   await dragToCut(2);await page.locator('#hd-review').click();
   await page.screenshot({path:path.join(qa,'clasificar-'+viewport.width+'.png')});
   const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
   assert(fits,'La página no debe desbordarse horizontalmente');await page.locator('#hd-config').click();
 }
 await page.locator('#hd-kind').selectOption('hiato');await page.locator('#hd-help').uncheck();await page.locator('#hd-read-word').uncheck();await page.locator('#hd-visual-help').uncheck();
 await page.reload();assert.equal(await page.locator('#hd-kind').inputValue(),'hiato');assert(!(await page.locator('#hd-help').isChecked()));assert(!(await page.locator('#hd-read-word').isChecked()));assert(!(await page.locator('#hd-visual-help').isChecked()));assert(!(await page.locator('#hd-syllable-sound').isChecked()));assert.equal(await page.locator('#hd-name').inputValue(),'Gabriel');
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);
 assert.equal(await page.locator('a[href*="Hiato_y_Diptongo.html"]').count(),1);
 const blocked=await browser.newPage();await blocked.route(/^https?:/,r=>r.abort());
 await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}});
 await blocked.goto(url);await blocked.locator('#hd-start').click();assert(await blocked.locator('#hd-game').isVisible());
 assert.equal(errors.length,0,errors.join('\n'));
 console.log(JSON.stringify({words:data.words.length,dataChecks,exercises,viewportChecks:2,localSettings:'OK',blockedStorage:'OK',indexLink:'OK',errors}));
 await browser.close();
}
main().catch(e=>{console.error(e);process.exitCode=1});
