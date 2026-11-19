const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    const errores = [];
    page.on('pageerror', error => errores.push(error.message));
    await page.route('https://**', route => route.abort());
    await page.addInitScript(() => {
      localStorage.setItem('operaciones.celebracion.v1', JSON.stringify({tipo:'rotar',duracion:0}));
      speechSynthesis.speak = utterance => setTimeout(() => utterance.onend?.(),10);
      speechSynthesis.cancel = () => {};
      window.golpes = 0;
      const original = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function() {
        golpes++;
        return original.call(this);
      };
    });
    await page.goto(pathToFileURL(path.resolve('Sumas_y_restas.html')).href);
    assert.ok(await page.locator('.marca-operaciones img').evaluate(el => el.complete && el.naturalWidth > 0));
    await page.locator('.boton-ajustes-operaciones').click();
    assert.equal(await page.locator('#tipoFiestaSignos').inputValue(),'globos');
    await page.locator('.aplicar-operaciones').click();
    await page.waitForFunction(() => localStorage.getItem('operaciones.celebracion.v2'));

    const globos = page.locator('.globo-operaciones:visible');
    async function tocarGlobo() {
      const caja = await globos.first().boundingBox();
      await page.touchscreen.tap(caja.x + caja.width/2,caja.y + caja.height/2);
    }

    for (const [w,h] of [[320,568],[390,844],[640,360],[740,320],[1024,768]]) {
      await page.setViewportSize({width:w,height:h});
      for (const zoom of [50,85,100,150,200]) {
        await page.locator('#zoom-aplicacion').evaluate((el,z) => {
          el.value=z;
          el.dispatchEvent(new Event('input',{bubbles:true}));
        },zoom);
        await page.evaluate(() => {
          digits=4; currentOperation='-'; topDigits=[7,5,4,6]; bottomDigits=[2,2,1,8]; resetProblem();
        });
        await page.waitForTimeout(100);
        const boton = await page.locator('#borrowBtn').boundingBox();
        const cuenta = await page.locator('.cuenta-operaciones').boundingBox();
        assert.ok(boton.x > cuenta.x+cuenta.width && boton.height >= 53 && boton.x+boton.width <= w,
          JSON.stringify({w,h,zoom,boton,cuenta}));
        if (w===390 && zoom===100 && process.env.CAPTURAS) await page.screenshot({path:'.qa-operaciones-globos-tablero.png'});
        await page.evaluate(() => FiestaSignos.abrir());
        const escena = await page.locator('.escena-fiesta-signos').boundingBox();
        const cajas = await globos.evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));
        assert.equal(cajas.length,6);
        for (const r of cajas) {
          assert.ok(r.left >= escena.x && r.right <= escena.x+escena.width &&
            r.top >= escena.y && r.bottom <= escena.y+escena.height && r.width >= 44,
          JSON.stringify({w,h,zoom,r,escena}));
        }
        if (w===390 && zoom===100 && process.env.CAPTURAS) await page.screenshot({path:'.qa-operaciones-globos-listos.png'});
        await tocarGlobo();
        assert.equal(await globos.count(),5);
        if (w===390 && zoom===100 && process.env.CAPTURAS) {
          await page.waitForTimeout(220);
          await page.screenshot({path:'.qa-operaciones-globos-explosion.png'});
        }
        await page.locator('.nueva-ronda-fiesta-signos').tap();
        assert.equal(await page.locator('.escena-globos-operaciones').count(),0);
      }
      console.log('PASS botón lateral, globos táctiles, nueva ronda y zoom 50–200%',w,h);
    }

    await page.locator('#boton-pantalla-completa').click();
    await page.waitForFunction(() => document.fullscreenElement);
    await page.evaluate(() => {
      digits=2; currentOperation='-'; topDigits=[5,6]; bottomDigits=[2,8]; resetProblem();
    });
    await page.locator('#borrowBtn').tap();
    assert.equal(await page.evaluate(() => currentTop[1]),16);
    await page.evaluate(() => { answers=[2,8]; checkAnswer(); });
    assert.equal(await page.locator('.fiesta-signos').getAttribute('data-tipo'),'globos');
    const golpes = await page.evaluate(() => window.golpes);
    await tocarGlobo();
    assert.ok(await page.evaluate(() => window.golpes) > golpes);
    await page.locator('.audio-fiesta-signos').tap();
    const silencio = await page.evaluate(() => window.golpes);
    for (let i=0; i<5; i++) await tocarGlobo();
    assert.equal(await page.evaluate(() => window.golpes),silencio);
    await page.locator('.mensaje-fiesta-signos').waitFor({state:'visible'});
    assert.equal(await page.locator('.resultado-fiesta-signos').innerText(),'56 - 28 = 28');
    await page.locator('.nueva-ronda-fiesta-signos').tap();
    assert.ok(await page.evaluate(() => !isAnswerCorrect));
    await page.evaluate(() => document.exitFullscreen());
    assert.deepEqual(errores,[]);
    console.log('PASS pedir prestado, migración, seis globos, sonido, silencio y cuenta resuelta en pantalla completa');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode=1; });
