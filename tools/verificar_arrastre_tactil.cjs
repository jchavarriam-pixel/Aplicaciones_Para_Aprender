// Comprueba que el guion siga el punto táctil, también con zoom de la aplicación.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    const file = pathToFileURL(path.resolve(__dirname, '..', 'Hiato_y_Diptongo.html')).href;
    const touch = async (type, x, y) => client.send('Input.dispatchTouchEvent', {
      type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }]
    });
    const point = async locator => {
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      assert(box);
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    const aligned = async ({ x, y }) => {
      const box = await page.locator('#hd-drag-ghost').boundingBox();
      assert(box, 'El guion flotante no aparece');
      assert(Math.abs(box.x + box.width / 2 - x) < 2, `Guion desfasado horizontalmente: ${JSON.stringify({ box, x, y })}`);
      assert(Math.abs(box.y + box.height / 2 - y) < 2, `Guion desfasado verticalmente: ${JSON.stringify({ box, x, y })}`);
    };
    for (const [zoom, pageScale] of [[50, 1], [75, 1], [100, 1], [150, 1], [200, 1], [100, 1.5], [150, 2]]) {
      await page.goto(file);
      await page.locator('#zoom-aplicacion').evaluate((slider, value) => {
        slider.value = String(value);
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }, zoom);
      await page.locator('#hd-start').click();
      await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: pageScale });
      if (pageScale === 2) {
        await client.send('Input.synthesizeScrollGesture', {
          x: 200, y: 200, xDistance: -110, yDistance: -80, gestureSourceType: 'touch'
        });
        const offset = await page.evaluate(() => ({ x: visualViewport.offsetLeft, y: visualViewport.offsetTop }));
        assert(offset.x > 0 || offset.y > 0, 'La prueba no desplazó la vista ampliada');
      }
      const token = page.locator('#hd-drag-token');
      const origin = await point(token);
      await touch('touchStart', origin.x, origin.y);
      await aligned(origin);
      const middle = { x: Math.min(728, origin.x + 45), y: origin.y - 35 };
      await touch('touchMove', middle.x, middle.y);
      await aligned(middle);
      await touch('touchEnd', middle.x, middle.y);
    }
    console.log('Arrastre táctil alineado con zoom de aplicación y ampliación de página.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
