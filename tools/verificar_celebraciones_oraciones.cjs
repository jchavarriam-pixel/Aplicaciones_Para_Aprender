const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  const url=pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href;
  await page.goto(url);await page.waitForFunction(()=>baseLista);
  await page.locator('#nameInput').fill('Marta');
  await page.locator('#celebrationSoundInput').uncheck();
  await page.locator('#startBtn').click();
  await page.evaluate(()=>{siguienteCelebracion=0;studentName='Marta';});
  const ids=await page.evaluate(()=>CELEBRACIONES.map(c=>c.id));
  const qa=process.env.ORACIONES_QA_DIR;if(qa)fs.mkdirSync(qa,{recursive:true});
  for(const id of ids){
   assert.equal(await page.evaluate(()=>triggerCelebration()),id);
   assert.equal(await page.locator('.celebration-stage').count(),1);
   assert.equal(await page.locator('.celebration-stage').getAttribute('data-celebration'),id);
   assert.ok(await page.locator('.celebration-stage > *').count()>0);
   assert.ok(await page.locator('.celebration-stage *').count()<220);
   assert.equal(await page.locator('.celebration-stage').evaluate(e=>getComputedStyle(e).pointerEvents),'none');
   assert.equal(await page.evaluate(()=>celebrationAudio),null);
   if(qa){await page.waitForTimeout(1050);await page.screenshot({path:path.join(qa,id+'.png')});}
  }
  assert.equal(await page.evaluate(()=>siguienteCelebracion),0);
  assert.equal(await page.evaluate(()=>triggerCelebration()),'fuegos');
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.equal(await page.evaluate(()=>siguienteCelebracion),1);
  assert.equal(await page.locator('#celebrationSoundInput').isChecked(),false);
  assert.equal(await page.evaluate(()=>triggerCelebration()),'globos');
  await page.evaluate(()=>clearCelebration());assert.equal(await page.locator('.celebration-stage').count(),0);
  await page.locator('#reducedCelebrationInput').check();
  await page.locator('#celebrationSoundInput').check();
  await page.reload();await page.waitForFunction(()=>baseLista);
  assert.equal(await page.locator('#reducedCelebrationInput').isChecked(),true);
  await page.evaluate(()=>triggerCelebration());
  assert.equal(await page.locator('.celebration-stage.is-reduced').count(),1);
  assert.equal(await page.locator('.celebration-piece').count(),0);
  assert.equal(await page.evaluate(()=>!!celebrationAudio),true);
  await page.evaluate(()=>clearCelebration());assert.equal(await page.evaluate(()=>celebrationAudio),null);
  await page.locator('#reducedCelebrationInput').uncheck();
  await page.locator('#celebrationSoundInput').uncheck();
  await page.locator('#startBtn').click();
  const result=await page.evaluate(()=>{
   const before=siguienteCelebracion;
   sentenceItems=current.words.map((base,i)=>({base,text:i===0?capWord(base):base}));
   speak=()=>{};checkAnswer();
   if(!isSolved||siguienteCelebracion!==(before+1)%8)throw Error('Rotación tras respuesta correcta');
   checkAnswer();if(siguienteCelebracion!==(before+1)%8)throw Error('Celebración repetida por doble revisión');
   newExercise();if(celebrationStage||document.getElementById('reviewOverlay').classList.contains('show'))throw Error('Celebración pendiente al cambiar de ejercicio');
   return true;
  });assert.ok(result);
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{siguienteCelebracion=5;triggerCelebration();});
  assert.equal(await page.locator('.celebration-caption').textContent(),'¡Bravo, Marta!');
  if(qa){await page.waitForTimeout(1000);await page.screenshot({path:path.join(qa,'medalla-telefono.png')});}
  await page.waitForFunction(()=>!document.querySelector('.celebration-stage'),{},{timeout:5000});
  const blocked=await browser.newPage({reducedMotion:'reduce'});
  await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('Bloqueado');};Storage.prototype.setItem=()=>{throw Error('Bloqueado');};});
  await blocked.route('https://fonts.googleapis.com/**',r=>r.abort());
  await blocked.goto(url);await blocked.waitForFunction(()=>baseLista);
  assert.equal(await blocked.locator('#reducedCelebrationInput').isChecked(),true);
  assert.equal(await blocked.evaluate(()=>{celebrationSound=false;return triggerCelebration();}),'fuegos');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({celebrations:ids,rotation:'OK',cleanup:'OK',preferences:'OK',correctAnswer:'OK'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
