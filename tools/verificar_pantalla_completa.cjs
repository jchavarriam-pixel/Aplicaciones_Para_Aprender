// Comprueba el cambio entre aplicaciones sin salir de pantalla completa.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    await page.route(/^https?:/, route => route.abort());
    await page.addInitScript(() => { try { localStorage.setItem('nombreNinoGabrielApps', 'Gabriel'); } catch {} });
    const root = path.resolve(__dirname, '..');
    const file = name => pathToFileURL(path.join(root, name)).href;
    const fullscreen = () => page.evaluate(() => Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    const iframe = page.locator('#marco-pantalla-completa');

    await page.goto(file('index.html'));
    await page.locator('#boton-pantalla-completa').click();
    assert(await fullscreen(), 'El índice no entró en pantalla completa');
    await page.locator('a[href="Hiato_y_Diptongo.html"]').click();
    await iframe.waitFor();
    await page.frameLocator('#marco-pantalla-completa').locator('#hd-start').waitFor();
    assert(await fullscreen(), 'Se perdió la pantalla completa al abrir Hiato y diptongo');
    await page.frameLocator('#marco-pantalla-completa').locator('.hd-back').click();
    await page.frameLocator('#marco-pantalla-completa').locator('a[href="generador-oraciones.html"]').waitFor();
    assert(await fullscreen(), 'Se perdió la pantalla completa al regresar al índice');
    await page.frameLocator('#marco-pantalla-completa').locator('a[href="generador-oraciones.html"]').click();
    await page.frameLocator('#marco-pantalla-completa').locator('#nameInput').waitFor();
    assert(await fullscreen(), 'Se perdió la pantalla completa al abrir la segunda aplicación');
    await page.locator('#zoom-aplicacion').evaluate(slider => {
      slider.value = '150';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.frames().find(frame => frame.url().includes('generador-oraciones.html')).waitForFunction(() => document.body.style.zoom === '1.5');
    await page.locator('#boton-pantalla-completa').click();
    await page.waitForURL(/generador-oraciones\.html/);
    assert(!(await fullscreen()), 'La salida no devolvió la aplicación actual');

    await page.goto(file('Hiato_y_Diptongo.html'));
    await page.locator('#boton-pantalla-completa').click();
    assert(await fullscreen(), 'La aplicación independiente no entró en pantalla completa');
    await page.locator('#boton-inicio-aplicaciones').click();
    await page.frameLocator('#marco-pantalla-completa').locator('a[href="generador-oraciones.html"]').waitFor();
    assert(await fullscreen(), 'Se perdió la pantalla completa al salir desde una aplicación');

    await page.goto(file('index.html'));
    await page.locator('#boton-pantalla-completa').click();
    const apps = await page.locator('a.card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
    assert.equal(apps.length, 20);
    for (const app of apps) {
      const destination = new URL(app, page.url()).href;
      const loaded = page.waitForEvent('framenavigated', frame => frame.name() === 'marco-pantalla-completa' && frame.url() === destination);
      await page.evaluate(href => window.AppsFullscreen.navigate(href), app);
      await loaded;
      assert(await fullscreen(), 'Se perdió la pantalla completa al abrir '+app);
    }
    console.log('Pantalla completa conservada al recorrer las '+apps.length+' aplicaciones.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
