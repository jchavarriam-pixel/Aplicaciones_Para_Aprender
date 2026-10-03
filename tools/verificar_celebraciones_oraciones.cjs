const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const qa=process.env.ORACIONES_QA_DIR;if(qa)fs.mkdirSync(qa,{recursive:true});
for(const viewport of [{width:768,height:1024},{width:1024,height:768},{width:390,height:844}]){
 const context=await browser.newContext({viewport,hasTouch:true});const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 const url=pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href;await page.goto(url);await page.waitForFunction(()=>baseLista);
 await page.locator('#celebrationSoundInput').uncheck();await page.locator('#nameInput').fill('Marta');await page.locator('#startBtn').click();
 await page.evaluate(()=>{siguienteCelebracion=0;});
 for(const id of ['cohete','globos','estrellas']){
  assert.equal(await page.evaluate(()=>triggerCelebration()),id);
  assert.equal(await page.locator('.interactive-object').count(),3);
  await page.waitForTimeout(3000);
  const targets=page.locator('.interactive-object');
  for(let i=0;i<3;i++){
   const rect=await targets.nth(i).boundingBox();assert.ok(rect.width>=90&&rect.height>=100);
   assert.ok(rect.y>130&&rect.y+rect.height<viewport.height);
   await page.touchscreen.tap(rect.x+rect.width/2,rect.y+rect.height/2);
   assert.equal(await page.locator('.interactive-object:disabled').count(),i+1);
   assert.equal(await page.locator('.interactive-reaction').count(),i+1);
   await targets.nth(i).dispatchEvent('click');assert.equal(await page.locator('.interactive-object:disabled').count(),i+1);
  }
  assert.match(await page.locator('.interactive-progress').textContent(),/todos/);
  if(id==='estrellas')assert.equal(await page.locator('.interactive-constellation').count(),3);
  else assert.ok(await page.locator('.interactive-letter').count()>20);
  assert.ok(await page.locator('.interactive-stage *').count()<130);
  if(qa&&viewport.width===768)await page.screenshot({path:path.join(qa,id+'-reaccion.png')});
  await page.waitForFunction(()=>!document.querySelector('.interactive-stage'),{},{timeout:3500});
 }
 assert.equal(await page.evaluate(()=>siguienteCelebracion),0);
 await page.evaluate(()=>triggerCelebration());await page.locator('.interactive-continue').click();assert.equal(await page.locator('.interactive-stage').count(),0);
 await page.reload();await page.waitForFunction(()=>baseLista);assert.equal(await page.evaluate(()=>siguienteCelebracion),1);
 await page.locator('#reducedCelebrationInput').check();await page.locator('#startBtn').click();await page.evaluate(()=>triggerCelebration());
 assert.equal(await page.locator('.interactive-stage.is-reduced').count(),1);
 assert.equal(await page.locator('.interactive-object').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.locator('.interactive-object').first().click();assert.equal(await page.locator('.interactive-reaction').count(),1);
 await page.keyboard.press('Escape');assert.equal(await page.locator('.interactive-stage').count(),0);
 await page.evaluate(()=>{siguienteCelebracion=2;triggerCelebration();newExercise();});
 assert.equal(await page.locator('.interactive-stage').count(),0);assert.equal(await page.evaluate(()=>interactiveTimers.size),0);
 assert.deepEqual(errors,[]);await context.close();
}
console.log(JSON.stringify({scenes:3,viewports:3,touch:'OK',repeatTap:'OK',rotation:'OK',cleanup:'OK',reducedMotion:'OK'}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
