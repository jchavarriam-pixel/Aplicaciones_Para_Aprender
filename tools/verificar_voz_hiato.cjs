// Comprueba que la lectura de sílabas espere una voz española y nunca use la inglesa.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

async function main() {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      const listeners = [];
      let voices = [{ name: 'English', lang: 'en-US' }];
      window.__spoken = [];
      window.__setVoices = next => {
        voices = next;
        listeners.forEach(listener => listener());
      };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
        getVoices: () => voices,
        addEventListener: (name, listener) => { if (name === 'voiceschanged') listeners.push(listener); },
        cancel: () => {},
        speak: utterance => { window.__spoken.push({ text: utterance.text, lang: utterance.lang, voice: utterance.voice }); }
      } });
      window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    });
    const app = fs.readFileSync(path.join(root, 'hiato-diptongo.js'), 'utf8');
    const prefix = '{const original=globalThis.HiatoDiptongo;globalThis.HiatoDiptongo={...original,deck:pool=>[pool.find(r=>r.word==="piedra")]}}\n';
    await page.route('**/hiato-diptongo.js', route => route.fulfill({ contentType: 'application/javascript', body: prefix + app }));
    await page.goto(pathToFileURL(path.join(root, 'Hiato_y_Diptongo.html')).href);
    await page.locator('#hd-start').click();
    await page.locator('.hd-drag-gap[data-cut="3"]').click();
    assert.deepEqual(await page.evaluate(() => window.__spoken), [], 'Una voz inglesa no debe leer «pie-dra»');
    await page.evaluate(() => window.__setVoices([{ name: 'Español', lang: 'es-CR' }]));
    await page.waitForFunction(() => window.__spoken.length === 1);
    const first = await page.evaluate(() => window.__spoken[0]);
    assert.equal(first.text, 'pie, dra');
    assert.equal(first.lang, 'es-CR');
    assert.equal(first.voice.lang, 'es-CR');
    await page.evaluate(() => window.__setVoices([{ name: 'English', lang: 'en-US' }]));
    await page.locator('.hd-drag-gap[data-cut="3"]').click();
    assert.equal(await page.evaluate(() => window.__spoken.length), 1, 'La voz inglesa tampoco debe usarse después');
    assert.match(await page.locator('#hd-voice-warning').textContent(), /voz en español/);
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('Voz española para «pie-dra»: OK; espera de voces y bloqueo de voz inglesa: OK');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
