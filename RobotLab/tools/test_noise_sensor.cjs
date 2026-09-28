/* Run with Node + Playwright: node tools/test_noise_sensor.cjs
 * Uses synthetic audio, never the device microphone. Test hooks are injected
 * into an in-memory HTTP response; RobotLab.html is never modified by tests.
 * Optional: ROBOTLAB_CHROME and ROBOTLAB_QA_DIR environment variables.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'RobotLab.html'), 'utf8');
new Function(source.match(/<script>([\s\S]*?)<\/script>/)[1]);
const hooks = `window.__lab={get state(){return state},get settings(){return settings},get listener(){return activeNoiseListener},BLOCKS,resetRobot,renderAll,showChallenges,generateLeveledChallenge,selectedChallengeActionTypes,challengeArrival,createFunction,flattenProgramDetailed,setMode,saveSettings,noiseOwnAudioPlaying};`;
assert(source.includes('\n})();'));
const html = source.replace('\n})();', '\n' + hooks + '\n})();');
const mime = { '.html':'text/html; charset=utf-8', '.png':'image/png', '.webp':'image/webp', '.gif':'image/gif', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.svg':'image/svg+xml' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (file === path.join(root, 'RobotLab.html')) { res.setHeader('Content-Type', mime['.html']); res.end(html); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
let browser;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({headless:true, executablePath:process.env.ROBOTLAB_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context = await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(() => {
    // Real Web Audio analyser, but input is an oscillator, not user audio.
    window.fakeMicCalls = 0; window.fakeMics = []; window.fakeMicMode = 'ok';
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {value:async constraints => {
      window.fakeMicCalls++; window.fakeMicConstraints = constraints;
      if (window.fakeMicMode === 'denied') throw new DOMException('denied', 'NotAllowedError');
      if (window.fakeMicMode === 'pending') await new Promise(resolve => window.resolveFakePermission = resolve);
      const ctx = new AudioContext(), oscillator = ctx.createOscillator(), gain = ctx.createGain(), sink = ctx.createMediaStreamDestination();
      gain.gain.value = 0; oscillator.frequency.value = 600; oscillator.connect(gain); gain.connect(sink); oscillator.start(); await ctx.resume();
      const mic = {ctx, gain, stream:sink.stream}; window.fakeMics.push(mic); window.fakeMic = mic;
      return sink.stream;
    }});
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/RobotLab.html?nombre=Prueba`);
  await page.waitForFunction(() => !!window.__lab);
  await page.evaluate(() => {document.querySelector('#homeModal').classList.remove('show');__lab.setMode('free');});
  assert.equal(await page.evaluate(() => fakeMicCalls), 0, 'startup never opens microphone');
  await page.locator('[data-tool-tab="actions"]').click();
  await page.locator('[data-action-tab="reactions"]').click();
  for(const scale of [50,100,150]){
    await page.locator('#toolboxScale').evaluate((input,scale)=>{input.value=scale;input.dispatchEvent(new Event('input',{bubbles:true}));},scale);
    const readable=await page.locator('.reaction-label').evaluateAll((labels,scale)=>labels.every(label=>{const style=getComputedStyle(label),box=label.getBoundingClientRect(),button=label.closest('button').getBoundingClientRect(),canShrink=label.closest('button').dataset.tool==='reaction_sorprendido';return (canShrink||parseFloat(style.fontSize)*scale/100>=12.8)&&box.left>=button.left&&box.right<=button.right&&box.bottom<=button.bottom&&label.scrollWidth<=label.clientWidth+1;}),scale);
    assert(readable,`reaction labels remain readable and fit at ${scale}%`);
  }
  await page.locator('#toolboxScale').evaluate(input=>{input.value='100';input.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('.reaction-label').first().evaluate(el=>getComputedStyle(el).fontSize),'19.2px','reaction text size remains unchanged');
  const shiftedWithoutResize=await page.locator('.reaction-icon').first().evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el),matrix=new DOMMatrixReadOnly(s.transform);return matrix.m42<0&&matrix.a===1&&matrix.d===1&&Math.abs(r.width-parseFloat(s.width))<.1&&Math.abs(r.height-parseFloat(s.height))<.1;});
  assert(shiftedWithoutResize,'reaction figure moves upward without scaling');
  if(process.env.ROBOTLAB_QA_DIR)await page.locator('[data-action-panel="reactions"]').screenshot({path:path.join(process.env.ROBOTLAB_QA_DIR,'reaction-labels.png')});
  await page.locator('[data-compact-category="actions"]').click();
  assert.equal(await page.locator('.reaction-label').first().isVisible(),false,'Text: no still hides reaction labels');
  assert.equal(await page.locator('.reaction-icon').first().evaluate(el=>getComputedStyle(el).transform),'none','icon-only positioning remains unchanged');
  await page.locator('[data-compact-category="actions"]').click();
  for(const width of [220,330,500])for(const scale of [50,75,100,125,150]){
    await page.evaluate(width=>document.querySelector('.workspace').style.setProperty('--toolbox-width',`${width}px`),width);
    await page.locator('#toolboxScale').evaluate((input,scale)=>{input.value=scale;input.dispatchEvent(new Event('input',{bubbles:true}));},scale);
    await page.waitForFunction(()=>{const label=document.querySelector('[data-tool="reaction_sorprendido"] .reaction-label'),range=document.createRange();range.selectNodeContents(label);const text=range.getBoundingClientRect(),box=label.getBoundingClientRect();return getComputedStyle(label).whiteSpace==='nowrap'&&text.left>=box.left+1&&text.right<=box.right-1;});
  }
  await page.evaluate(()=>document.querySelector('.workspace').style.setProperty('--toolbox-width','330px'));
  await page.locator('#toolboxScale').evaluate(input=>{input.value='100';input.dispatchEvent(new Event('input',{bubbles:true}));});
  console.log('PASS Sorprendido fits on one line across panel widths and button scales');
  console.log('PASS larger reaction labels fit all panel scales; icon-only mode stays unchanged');
  await page.locator('[data-tool-tab="sensors"]').click();
  await page.locator('[data-tool="waitNoise"]').click();
  assert.equal(await page.locator('#programList .program-icon[src="Sensores/esperar_ruido.png"]').count(), 1);
  assert.equal(await page.evaluate(() => __lab.state.program[0].type), 'waitNoise');
  assert.equal(await page.evaluate(() => fakeMicCalls), 0, 'adding block never opens microphone');
  await page.evaluate(() => {__lab.state.program.push({...__lab.BLOCKS.green});__lab.renderAll();});
  await page.waitForTimeout(250);
  const boardRect = () => page.locator('#boardWrap').evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};});
  const boardBefore = await boardRect();
  await page.locator('#runBtn').click();
  await page.waitForFunction(() => __lab.listener?.analyser && !__lab.listener.pending);
  await page.waitForTimeout(650);
  assert.equal(await page.evaluate(() => __lab.state.status), 'waiting');
  assert.equal(await page.evaluate(() => fakeMicConstraints.video), false);
  assert.deepEqual(await boardRect(), boardBefore, 'floating notice never changes board size or position');
  assert.equal(await page.locator('#noiseWaitNotice').evaluate(el=>getComputedStyle(el).position), 'absolute');
  assert.equal(await page.locator('#noiseWaitNotice').evaluate(el=>el.parentElement.id), 'boardWrap');
  assert((await page.locator('#noiseWaitNotice').boundingBox()).width<=44, 'sound sensor is only a slim vertical bar');
  assert.equal(await page.locator('#noiseWaitMessage').evaluate(el=>el.parentElement.getBoundingClientRect().width), 1, 'instructions do not occupy visible board area');
  await page.evaluate(() => fakeMic.gain.gain.value=.025);
  await page.waitForFunction(() => +document.querySelector('#noiseInputMeter').getAttribute('aria-valuenow')>5);
  assert.match(await page.locator('#noiseInputLevel').evaluate(el=>el.style.height), /^\d+%$/);
  assert.equal(await page.locator('#noiseInputThreshold').evaluate(el=>el.style.bottom), '45%');
  const qaDir = process.env.ROBOTLAB_QA_DIR;
  if (qaDir) await page.screenshot({path:path.join(qaDir,'noise-wait.png')});
  await page.evaluate(() => fakeMic.gain.gain.value=0);
  for (const viewport of [{width:1024,height:768},{width:768,height:1024}]) {
    await page.setViewportSize(viewport); await page.waitForTimeout(100);
    const bottom = await page.locator('#boardWrap').evaluate(el=>el.getBoundingClientRect().bottom);
    assert(bottom <= viewport.height, 'board remains inside tablet viewport while listening');
    const fits = await page.locator('#noiseWaitNotice').evaluate(el=>{const n=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return n.left>=b.left&&n.right<=b.right&&n.top>=b.top&&n.bottom<=b.bottom;});
    assert(fits, 'floating notice remains inside the board at tablet sizes');
  }
  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(() => fakeMic.gain.gain.value = .2);
  await page.waitForFunction(() => __lab.state.status === 'finished');
  assert.equal(await page.evaluate(() => __lab.state.robot.lightColor), '#2f9c67');
  assert.equal(await page.evaluate(() => fakeMic.stream.getTracks()[0].readyState), 'ended');
  assert.equal(await page.locator('#noiseWaitNotice').isVisible(), false);
  await page.waitForTimeout(250);
  assert.deepEqual(await boardRect(), boardBefore, 'hiding notice never changes board size or position');
  console.log('PASS silence waits; noise resumes; microphone closes; next instruction runs');

  async function begin(mode = 'ok') {
    await page.evaluate(mode => {__lab.resetRobot();window.fakeMicMode=mode;__lab.state.challenge=null;__lab.state.program=[{...__lab.BLOCKS.waitNoise}];__lab.renderAll();}, mode);
    await page.locator('#runBtn').click();
    if (mode === 'ok') { await page.waitForFunction(() => __lab.listener?.analyser && !__lab.listener.pending); await page.waitForTimeout(600); }
  }
  await begin(); await page.locator('#pauseBtn').click();
  assert.equal(await page.evaluate(() => fakeMic.stream.getAudioTracks()[0].enabled), false);
  await page.evaluate(() => fakeMic.gain.gain.value=.2); await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => __lab.state.status), 'paused');
  await page.evaluate(() => fakeMic.gain.gain.value=0); await page.locator('#pauseBtn').click(); await page.waitForTimeout(600);
  await page.evaluate(() => fakeMic.gain.gain.value=.2); await page.waitForFunction(() => __lab.state.status==='finished');
  console.log('PASS pause silences microphone and ignores noise; resume rearms sensor');

  await begin(); await page.locator('#resetBtn').click();
  assert.equal(await page.evaluate(() => __lab.listener), null);
  assert.equal(await page.evaluate(() => fakeMic.stream.getTracks()[0].readyState), 'ended');
  await begin('pending'); await page.waitForFunction(() => !!window.resolveFakePermission);
  const micCount = await page.evaluate(() => fakeMics.length);
  await page.locator('#resetBtn').click(); await page.evaluate(() => resolveFakePermission());
  await page.waitForFunction(count => fakeMics.length>count && fakeMic.stream.getTracks()[0].readyState === 'ended', micCount);
  assert.equal(await page.evaluate(() => __lab.state.status), 'idle');
  console.log('PASS reset releases microphone, including a late permission response');

  await begin('denied'); await page.locator('#noiseRetryBtn').waitFor({state:'visible'});
  assert.match(await page.locator('#noiseWaitMessage').innerText(), /Permite usar el micrófono/);
  await page.evaluate(() => fakeMicMode='ok'); await page.locator('#noiseRetryBtn').click();
  await page.waitForFunction(() => __lab.listener?.analyser && !__lab.listener.pending); await page.waitForTimeout(600);
  await page.evaluate(() => fakeMic.gain.gain.value=.2); await page.waitForFunction(() => __lab.state.status==='finished');
  console.log('PASS denied permission shows instructions; retry succeeds');

  await begin();
  await page.evaluate(() => {Object.defineProperty(speechSynthesis,'speaking',{configurable:true,value:true});fakeMic.gain.gain.value=.2;});
  await page.waitForTimeout(500); assert.equal(await page.evaluate(() => __lab.state.status), 'waiting');
  await page.evaluate(() => {Object.defineProperty(speechSynthesis,'speaking',{configurable:true,value:false});fakeMic.gain.gain.value=0;});
  await page.waitForTimeout(650); await page.evaluate(() => fakeMic.gain.gain.value=.2); await page.waitForFunction(() => __lab.state.status==='finished');
  console.log('PASS robot speech cannot trigger its own sound sensor');

  await page.evaluate(() => {__lab.resetRobot();__lab.state.program=[{...__lab.BLOCKS.waitNoise},{...__lab.BLOCKS.waitNoise}];__lab.renderAll();});
  await page.locator('#runBtn').click(); await page.waitForFunction(() => __lab.listener?.quietSince!=null);
  const calls = await page.evaluate(() => fakeMicCalls);
  await page.evaluate(() => fakeMic.gain.gain.value=.2);
  await page.waitForFunction(calls => fakeMicCalls>calls && __lab.listener?.quietSince!=null, calls);
  assert.equal(await page.evaluate(() => __lab.state.pc), 1);
  await page.evaluate(() => fakeMic.gain.gain.value=.2); await page.waitForFunction(() => __lab.state.status==='finished');
  console.log('PASS two wait blocks require two fresh noise events');

  await page.evaluate(() => {__lab.state.program=[];__lab.createFunction();});
  await page.locator('[data-tool="waitNoise"]').click();
  assert.equal(await page.locator('#functionEditorList img[src="Sensores/esperar_ruido.png"]').count(), 1);
  assert.equal(await page.evaluate(() => __lab.state.functions.at(-1).body[0].type), 'waitNoise');
  await page.locator('#closeFunctionEditorBtn').click();
  await page.evaluate(() => {__lab.state.program=[{type:'repeat',times:2,body:[{...__lab.BLOCKS.waitNoise}],cat:'repeat'}];__lab.renderAll();});
  assert.equal(await page.locator('#programList img[src="Sensores/esperar_ruido.png"]').count(), 1);
  assert.equal(await page.evaluate(() => __lab.flattenProgramDetailed().length), 2);
  page.once('dialog', dialog=>dialog.accept('Prueba del sensor'));
  await page.locator('#saveBtn').click();
  await page.locator('[data-mode="projects"]').click();
  await page.locator('#genericContent [data-open]').first().click();
  assert.equal(await page.evaluate(() => __lab.state.program[0].body[0].type), 'waitNoise');
  assert.equal(await page.evaluate(() => __lab.state.functions[0].body[0].type), 'waitNoise');
  console.log('PASS sensor works as a nested repeat block and in reusable functions');

  await page.locator('#settingsBtn').click();
  await page.locator('#noiseSensitivity').evaluate(input => {input.value='80';input.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#applySettings').click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('robotlab_settings_v1')).noiseSensitivity), 80);
  await page.evaluate(() => __lab.showChallenges());
  await page.locator('[data-challenge-action-type]').evaluateAll(inputs => inputs.forEach(input => input.checked=input.dataset.challengeActionType==='noise'));
  await page.locator('[data-level="2"]').click();
  if (qaDir) await page.locator('[data-challenge-action-type="noise"]').scrollIntoViewIfNeeded().then(()=>page.screenshot({path:path.join(qaDir,'noise-challenges.png')}));
  await page.locator('#generateLevelChallenge').click();
  assert.match(await page.locator('#challengePrompt').innerText(), /espera un aplauso/);
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('robotlab_settings_v1')).challengeActionTypes), ['noise']);
  const configChecks = await page.evaluate(() => {
    const results=[];
    for(let level=1;level<=8;level++)for(let repeat=0;repeat<8;repeat++){
      __lab.settings.challengeActionTypes=['noise'];__lab.generateLeveledChallenge(level,false);
      results.push(__lab.state.challenge.targets.some(t=>t.requiredActions.some(a=>a.type==='waitNoise')));
      __lab.settings.challengeActionTypes=['lights','jump','emotions','sounds'];__lab.generateLeveledChallenge(level,false);
      results.push(!__lab.state.challenge.targets.some(t=>t.requiredActions.some(a=>a.type==='waitNoise')));
    }
    __lab.settings.challengeActionTypes=[];__lab.generateLeveledChallenge(1,false);
    results.push(__lab.state.challenge.targets.every(t=>t.requiredActions.length===0));
    __lab.settings.challengeActionTypes=['noise'];__lab.generateLeveledChallenge(2,false);
    return results.every(Boolean);
  });
  assert.equal(configChecks,true);
  console.log('PASS all 8 challenge levels respect action selection; applause guaranteed when selected');

  await page.evaluate(() => {__lab.state.program=[{...__lab.BLOCKS.waitNoise}];__lab.renderAll();});
  await page.locator('#runBtn').click(); await page.waitForFunction(() => __lab.listener?.quietSince!=null);
  await page.evaluate(() => fakeMic.gain.gain.value=.2); await page.waitForFunction(() => __lab.state.status==='finished');
  assert.equal(await page.evaluate(() => __lab.state.challenge.completed), false);
  assert.equal(await page.evaluate(() => __lab.state.challenge.targets[0].requiredActions[0].done), false);
  console.log('PASS hearing noise at the wrong cell cannot complete a challenge task');
  await page.evaluate(() => {__lab.resetRobot();__lab.generateLeveledChallenge(2,false);});
  await page.evaluate(() => {const t=__lab.state.challenge.targets[0];__lab.state.robot.c=t.c;__lab.state.robot.r=t.r;__lab.challengeArrival();__lab.state.program=[{...__lab.BLOCKS.waitNoise}];__lab.renderAll();});
  const description = await page.locator('#challengePrompt').innerText();
  await page.locator('#runBtn').click(); await page.waitForFunction(() => __lab.listener?.quietSince!=null);
  assert.equal(await page.evaluate(() => __lab.state.challenge.completed), false);
  assert.equal(await page.locator('#challengePrompt').innerText(), description);
  await page.evaluate(() => fakeMic.gain.gain.value=.2); await page.waitForFunction(() => __lab.state.challenge.completed);
  assert.equal(await page.evaluate(() => __lab.state.challenge.targets[0].requiredActions[0].done), true);
  await page.locator('#genericModal [data-close]').count().then(async count => {if(count)await page.locator('#genericModal [data-close]').first().click();else await page.evaluate(()=>document.querySelector('#genericModal').classList.remove('show'));});
  await page.reload(); await page.waitForFunction(() => !!window.__lab);
  assert.equal(await page.evaluate(() => __lab.settings.noiseSensitivity), 80);
  assert.deepEqual(await page.evaluate(() => __lab.settings.challengeActionTypes), ['noise']);
  assert.equal(await page.evaluate(() => fakeMicCalls), 0);
  assert.deepEqual(errors, []);
  console.log('PASS challenge completion waits for input, checklist stays stable, preferences survive reload');
  await page.evaluate(() => fakeMics.forEach(mic=>mic.ctx.close()));
  await context.close();
  console.log('ALL NOISE SENSOR TESTS PASSED');
})().catch(error => {console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
