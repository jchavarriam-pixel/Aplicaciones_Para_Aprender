/* Node + Playwright regression test. Uses isolated browser storage and no microphone. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'RobotLab.html'), 'utf8');
new Function(source.match(/<script>([\s\S]*?)<\/script>/)[1]);
const hooks = 'window.__prefs={get settings(){return settings},get state(){return state},showChallenges,generateLeveledChallenge,randomChallengeAction,reachableChallengeTargets};';
const html = source.replace('\n})();', '\n' + hooks + '\n})();');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (file === path.join(root, 'RobotLab.html')) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', {'.png':'image/png','.webp':'image/webp','.gif':'image/gif','.mp3':'audio/mpeg'}[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
let browser;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({headless:true, executablePath:process.env.ROBOTLAB_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context = await browser.newContext({viewport:{width:1280,height:900}});
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const url = `http://127.0.0.1:${server.address().port}/RobotLab.html?nombre=Prueba`;
  const openConfig = async () => {
    await page.evaluate(() => {document.querySelector('#homeModal').classList.remove('show');__prefs.showChallenges();});
  };
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('robotlab_settings_v1')));
  const defaultObstacles = ['lego_1x1','lego_2x1','lego_1x2','lego_3x1','lego_1x3','x_roja'];
  await page.goto(url); await page.waitForFunction(() => !!window.__prefs);
  assert.equal(await page.evaluate(() => __prefs.state.challenge.targets.length), 1);
  assert.equal(await page.evaluate(() => __prefs.state.obstacles.length), 5);
  assert.deepEqual((await saved()).challengeObstacleTypes, defaultObstacles);
  const initialChallenge = await page.evaluate(() => JSON.stringify(__prefs.state.challenge));
  await page.locator('#homeModal [data-start="challenges"]').click();
  assert(!(await page.locator('#homeModal').isVisible()));
  assert(await page.locator('#genericModal').isVisible());
  assert.match(await page.locator('#genericContent h2').innerText(), /Retos por niveles/);
  assert.equal(await page.evaluate(() => JSON.stringify(__prefs.state.challenge)), initialChallenge, 'choosing Retos opens configuration without regenerating a challenge');
  assert.equal(await page.locator('[data-level="1"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('#challengeObstacleCount').inputValue(), '5');
  assert.equal(await page.locator('[data-challenge-obstacle-type]:checked').count(), 6);
  assert.equal((await page.locator('[data-challenge-action-type="greeting"]').locator('..').innerText()).replace(/\s/g,''), '👋Saludar');
  assert.equal((await page.locator('[data-challenge-action-type="emotions"]').locator('..').innerText()).replace(/\s/g,''), '😄Emociones');
  assert(await page.evaluate(() => {
    for(let i=0;i<50;i++){
      __prefs.generateLeveledChallenge(1,false);
      if(__prefs.state.obstacles.length!==5 || !__prefs.reachableChallengeTargets(__prefs.state.obstacles,__prefs.state.challenge.targets,__prefs.state.start))return false;
    }
    return true;
  }), 'default challenges have five obstacles and a reachable objective');
  console.log('PASS first use: one visit, five obstacles, LEGO and red X only');

  assert(await page.evaluate(() => {
    for(const category of ['greeting','emotions']){
      __prefs.settings.challengeActionTypes=[category];
      for(let i=0;i<80;i++){
        const action=__prefs.randomChallengeAction({animal:'gato'});
        if(action.type!=='reaction'||(category==='greeting'?action.reaction!=='saludar':['saludar','saltar'].includes(action.reaction)))return false;
      }
      __prefs.generateLeveledChallenge(8,false);
      if(__prefs.state.challenge.targets.some(t=>t.requiredActions.some(a=>category==='greeting'?a.reaction!=='saludar':['saludar','saltar'].includes(a.reaction))))return false;
    }
    return true;
  }), 'greeting and emotions generate disjoint actions');
  console.log('PASS Saludar is independent from Emociones, including generated tasks');

  await openConfig();
  await page.locator('[data-level="4"]').click();
  await page.locator('#challengeTargetKind').selectOption('animals');
  await page.locator('#challengeObstacleCount').fill('7');
  await page.locator('[data-obstacle-selection="none"]').click();
  await page.locator('[data-challenge-obstacle-type="x_roja"]').check();
  for(const input of await page.locator('[data-challenge-action-type]').all())await input.uncheck();
  await page.locator('[data-challenge-action-type="greeting"]').check();
  const preferences = await saved();
  assert.equal(preferences.challengeLevel,4);
  assert.equal(preferences.challengeTargets,'animals');
  assert.equal(preferences.challengeObstacleCount,7);
  assert.deepEqual(preferences.challengeObstacleTypes,['x_roja']);
  assert.deepEqual(preferences.challengeActionTypes,['greeting']);
  await page.locator('#genericContent [data-close]').click();
  await page.reload(); await page.waitForFunction(() => !!window.__prefs); await openConfig();
  assert.equal(await page.locator('[data-level="4"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#challengeTargetKind').inputValue(),'animals');
  assert.equal(await page.locator('#challengeObstacleCount').inputValue(),'7');
  assert.equal(await page.locator('[data-challenge-obstacle-type]:checked').count(),1);
  assert(await page.locator('[data-challenge-action-type="greeting"]').isChecked());
  assert(!(await page.locator('[data-challenge-action-type="emotions"]').isChecked()));
  console.log('PASS every preference survives closing and reload without generating a challenge');

  for(const viewport of [{width:1280,height:900},{width:768,height:1024},{width:480,height:800}]){
    await page.setViewportSize(viewport);
    const gap = await page.locator('.challenge-config-field').evaluate(label => label.querySelector('input').getBoundingClientRect().left-label.querySelector('span').getBoundingClientRect().right);
    assert(gap>=0&&gap<=9,`obstacle label stays next to its input at ${viewport.width}px`);
    assert(await page.locator('#challengeObstacleCount').evaluate(input=>input.getBoundingClientRect().height>=44),'touch-friendly input');
  }
  if(process.env.ROBOTLAB_QA_DIR){
    await page.locator('.challenge-config').screenshot({path:path.join(process.env.ROBOTLAB_QA_DIR,'challenge-preferences.png')});
    await page.locator('.challenge-action-options').screenshot({path:path.join(process.env.ROBOTLAB_QA_DIR,'challenge-actions.png')});
  }
  console.log('PASS compact obstacle label spacing and touch target on desktop and tablet');

  await page.locator('[data-obstacle-selection="legos"]').click();
  assert.equal((await saved()).challengeObstacleTypes.length,5);
  await page.locator('[data-obstacle-selection="all"]').click();
  assert.equal((await saved()).challengeObstacleTypes.length,15);
  await page.locator('[data-obstacle-selection="none"]').click();
  await page.locator('#challengeObstacleCount').fill('0');
  await page.locator('[data-level="1"]').click();
  await page.reload(); await page.waitForFunction(() => !!window.__prefs);
  assert.equal((await saved()).challengeObstacleCount,0);
  assert.deepEqual((await saved()).challengeObstacleTypes,[]);
  assert.equal(await page.evaluate(() => __prefs.state.obstacles.length),0);
  console.log('PASS zero obstacles and explicit empty selections are not replaced by defaults');
  await page.locator('#skipHome').click();
  assert(await page.locator('#genericModal').isVisible());
  assert.equal(await page.locator('#challengeObstacleCount').inputValue(),'0');
  await page.reload(); await page.waitForFunction(() => !!window.__prefs);
  await page.locator('#homeStudentName').press('Enter');
  assert(await page.locator('#genericModal').isVisible());
  await page.locator('#genericContent [data-close]').click();
  await page.locator('[data-mode="free"]').click();
  assert(!(await page.locator('#genericModal').isVisible()));
  await page.locator('[data-mode="challenges"]').click();
  assert(await page.locator('#genericModal').isVisible());
  assert.equal(await page.locator('#challengeObstacleCount').inputValue(),'0');
  console.log('PASS Retos opens configuration immediately from home, default start, Enter and mode bar');
  assert(await page.evaluate(() => {
    const categoryOf=a=>a.type==='waitNoise'?'noise':a.type==='color'?'lights':a.type==='soundFile'?'sounds':a.reaction==='saltar'?'jump':a.reaction==='saludar'?'greeting':'emotions';
    const settings=__prefs.settings;
    for(const types of [['noise','lights'],['noise','jump','emotions'],['lights','jump','greeting','emotions','sounds','noise']]){
      settings.challengeActionTypes=types;delete settings.challengeActionRotation;
      const counts=Object.fromEntries(types.map(type=>[type,0]));
      for(let round=0;round<30;round++){
        __prefs.generateLeveledChallenge([2,5,8][round%3],false);
        const actions=__prefs.state.challenge.targets.flatMap(t=>t.requiredActions),categories=actions.map(categoryOf);
        if(actions.length!==[1,2,3][round%3]||new Set(categories).size!==Math.min(actions.length,types.length))return false;
        for(const category of categories){
          if(!types.includes(category))return false;
          counts[category]++;
          if(Math.max(...Object.values(counts))-Math.min(...Object.values(counts))>1)return false;
        }
      }
    }
    settings.challengeActionTypes=['lights','noise'];
    settings.challengeActionRotation={types:'lights|noise',remaining:['lights','noise']};
    __prefs.generateLeveledChallenge(5,false);
    if(__prefs.state.challenge.targets[0].requiredActions[0].type!=='color')return false;
    const rotation=JSON.stringify(settings.challengeActionRotation);
    for(const level of [1,3,6]){
      __prefs.generateLeveledChallenge(level,false);
      if(__prefs.state.challenge.targets.some(t=>t.requiredActions.length)||JSON.stringify(settings.challengeActionRotation)!==rotation)return false;
    }
    for(const type of ['lights','emotions']){
      settings.challengeActionTypes=[type];__prefs.generateLeveledChallenge(8,false);
      const actions=__prefs.state.challenge.targets.flatMap(t=>t.requiredActions);
      if(new Set(actions.map(a=>a.name||a.reaction)).size!==3)return false;
    }
    settings.challengeActionTypes=['noise','lights','jump'];
    settings.challengeActionRotation={types:'jump|lights|noise',remaining:['jump','noise','lights']};
    __prefs.generateLeveledChallenge(2,false);
    return __prefs.state.challenge.targets[0].requiredActions[0].reaction==='saltar';
  }), 'all selected categories get balanced turns, distinct types per challenge and no forced applause');
  console.log('PASS equitable action distribution for 90 generated challenges; applause has no priority');
  assert.deepEqual((await saved()).challengeActionRotation.remaining,['noise','lights']);
  await page.reload(); await page.waitForFunction(() => !!window.__prefs);
  assert.equal(await page.evaluate(() => __prefs.state.challenge.targets[0].requiredActions[0].type),'waitNoise');
  assert.deepEqual((await saved()).challengeActionRotation.remaining,['lights']);
  assert(await page.evaluate(() => {
    __prefs.settings.challengeActionTypes=['greeting','emotions'];
    __prefs.generateLeveledChallenge(5,false);
    return __prefs.state.challenge.targets.every(t=>t.requiredActions[0].type==='reaction'&&t.requiredActions[0].reaction!=='saltar');
  }), 'changing the selection resets the rotation without reintroducing deselected types');
  console.log('PASS balanced rotation survives reload and resets safely when selected types change');
  assert.deepEqual(errors,[]);
  await context.close();
  console.log('ALL CHALLENGE PREFERENCE TESTS PASSED');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
