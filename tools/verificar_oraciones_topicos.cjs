// Ejecutar con Node y Playwright disponibles; usa Chrome en modo sin ventana.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'base_oraciones.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'generador-oraciones.html'), 'utf8');
const embedded = JSON.parse(html.match(/id="baseOracionesIntegrada">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(embedded, db, 'La base externa y la integrada deben coincidir');
for (const info of Object.values(db.imagenes)) assert.ok(fs.existsSync(path.join(root, info.img)), info.img);
for (const row of db.oraciones) {
  assert.ok(row.words.at(-1) === '.');
  assert.ok(row.pics.every(p => db.imagenes[p]));
  assert.ok(row.categorias.length);
  if (row.level >= 5) {
    assert.deepEqual(row.contentWords, row.words.filter(w => !db.conectores_reutilizables.includes(w)));
    assert.ok(row.mode === 'connectors_free');
    if (row.level === 5) assert.deepEqual(row.extras, []);
    else assert.ok(row.extras.length === 2 || row.extras.length === 3);
  }
}

const server = http.createServer((req, res) => {
  const filename = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(filename, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', filename.endsWith('.json') ? 'application/json' : filename.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8');
    res.end(data);
  });
});

async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    const localURL = pathToFileURL(path.join(root, 'generador-oraciones.html')).href;
    await page.goto(localURL);
    await page.waitForFunction(() => baseLista);
    assert.equal(await page.locator('#categoryOptions input').count(), 16);
    assert.equal(await page.locator('#startBtn').isEnabled(), true);

    // Un tema, unión de varios temas, ninguna selección y Todas.
    await page.locator('input[value="relieve"]').check();
    const reliefCounts = await page.evaluate(() => Array.from({ length: 6 }, (_, i) => poolUnicoNivel(i + 1).length));
    assert.ok(reliefCounts.every(n => n > 0));
    assert.equal(await page.locator('input[value="*"]').isChecked(), false);
    await page.locator('input[value="animales"]').check();
    const unionCorrect = await page.evaluate(() => Array.from({ length: 6 }, (_, i) => {
      const expected = oracionesUnicas(poolBaseNivel(i + 1).filter(o => o.categorias.includes('relieve') || o.categorias.includes('animales')));
      return expected.length === poolUnicoNivel(i + 1).length;
    }).every(Boolean));
    assert.ok(unionCorrect);
    await page.locator('input[value="relieve"]').uncheck();
    await page.locator('input[value="animales"]').uncheck();
    assert.equal(await page.locator('#startBtn').isEnabled(), false);
    assert.match(await page.locator('#availableCount').textContent(), /Selecciona al menos/);
    await page.locator('input[value="*"]').check();

    const exhaustive = await page.evaluate(() => {
      const fail = msg => { throw new Error(msg); };
      const cases = [null, ...CATEGORIES.map(c => new Set([c.id])), new Set(['relieve', 'animales']), new Set()];
      let draws = 0, pools = 0;
      for (const selection of cases) {
        selectedCategories = selection;
        reiniciarMazosOraciones();
        for (let level = 1; level <= 6; level++) {
          const pool = poolUnicoNivel(level);
          if (!pool.length) { if (tomarOracion(level) !== null) fail('Mazo vacío'); continue; }
          pools++;
          let previous = null;
          for (let round = 0; round < 3; round++) {
            const seen = new Set();
            for (let i = 0; i < pool.length; i++) {
              const row = tomarOracion(level), id = canonical(row.words);
              if (seen.has(id)) fail('Repetición antes de agotar mazo');
              if (i === 0 && previous === id && pool.length > 1) fail('Repetición al cambiar ronda');
              if (!coincideCategorias(row)) fail('Oración fuera del filtro');
              if ((level === 4 || level === 6) && (row.extras.length < 2 || row.extras.length > 3)) fail('Distractores incorrectos');
              if (level === 5 && row.extras.length) fail('Extras en nivel 5');
              if (level >= 5) {
                const inventory = [...row.contentWords, ...row.words.filter(w => CONNECTORS.includes(w))];
                const sorted = a => JSON.stringify([...a].sort());
                if (sorted(inventory) !== sorted(row.words)) fail('Respuesta imposible con las palabras del mazo');
              }
              seen.add(id); previous = id; draws++;
            }
          }
        }
      }
      selectedCategories = null; reiniciarMazosOraciones();actualizarDisponibilidad();
      return { draws, pools };
    });

    // El juego puede construir y aceptar respuestas principales de cada tema/nivel.
    const solved = await page.evaluate(() => {
      triggerCelebration = () => {}; speak = () => {}; showReviewMessage = () => {};
      let checked = 0;
      for (const category of CATEGORIES) {
        selectedCategories = new Set([category.id]);
        for (let level = 1; level <= 6; level++) {
          currentLevel = level;
          for (let i = 0; i < Math.min(3, poolUnicoNivel(level).length); i++) {
            current = tomarOracion(level);loadCurrent();
            for (const word of current.words) {
              const index = bankItems.findIndex(it => it.base === word);
              if (index >= 0) moveItem('bank', index, 'sentence', sentenceItems.length);
              else {
                const fn = functionItems.findIndex(it => it.base === word);
                if (fn < 0) throw new Error('Falta palabra: ' + word);
                moveItem('function', fn, 'sentence', sentenceItems.length);
              }
            }
            renderWords(); checkAnswer();
            if (!isSolved) throw new Error('Respuesta principal rechazada');
            if (level === 5 && bankItems.length) throw new Error('Palabras principales sobrantes');
            if ((level === 4 || level === 6) && bankItems.length !== current.extras.length) throw new Error('Extras sobrantes incorrectos');
            checked++;
          }
        }
      }
      selectedCategories = new Set(['relieve']); currentLevel = 3;actualizarDisponibilidad();
      return checked;
    });

    await page.locator('[data-level="2"]').click();
    assert.match(await page.locator('#availableCount').textContent(), /Nivel 2:/);
    const expectedLevel2 = await page.evaluate(() => poolUnicoNivel(2).length.toLocaleString('es-CR'));
    assert.ok((await page.locator('#availableCount').textContent()).includes(expectedLevel2));
    await page.locator('input[value="*"]').check();
    await page.locator('input[value="relieve"]').check();
    await page.reload();
    await page.waitForFunction(() => baseLista);
    assert.equal(await page.locator('input[value="relieve"]').isChecked(), true);

    // Importación sin categorías: compatibilidad con archivos anteriores y palabras desconocidas.
    const imported = await page.evaluate(() => {
      const before = JSON.parse(document.getElementById('baseOracionesIntegrada').textContent);
      const legacy = { imagenes: { montaña: before.imagenes['montaña'], grande: before.imagenes.grande }, oraciones: [
        { level: 1, pics: ['montaña', 'grande'], words: ['la', 'montaña', 'es', 'grande', '.'] }
      ] };
      aplicarBaseDeDatos(legacy, 'Prueba antigua');
      if (poolUnicoNivel(1).length !== 1) throw new Error('Importación antigua');
      selectedCategories = new Set(['animales']);actualizarDisponibilidad();
      if (!document.getElementById('startBtn').disabled) throw new Error('Comienzo con filtro vacío');
      legacy.imagenes.extra = { label: 'extra', img: before.imagenes.grande.img };
      legacy.oraciones.push({ level: 1, pics: ['extra', 'grande'], words: ['la', 'imagen', 'es', 'grande', '.'] });
      selectedCategories = null;aplicarBaseDeDatos(legacy, 'Prueba desconocida');
      if (!CATEGORIES.some(c => c.label === 'Otras palabras')) throw new Error('Falta categoría de palabras desconocidas');
      aplicarBaseDeDatos(before, 'Base restaurada');
      return true;
    });
    assert.ok(imported);
    const importedEdgeCases = await page.evaluate(() => {
      const original = JSON.parse(document.getElementById('baseOracionesIntegrada').textContent);
      const sharedWords = ['la', 'imagen', 'es', 'grande', '.'];
      const duplicateBase = { imagenes: original.imagenes, oraciones: [
        { level: 1, pics: ['perro', 'grande'], words: sharedWords },
        { level: 1, pics: ['montaña', 'grande'], words: sharedWords }
      ] };
      selectedCategories = new Set(['relieve']);aplicarBaseDeDatos(duplicateBase, 'Duplicados');
      if (poolUnicoNivel(1).length !== 1 || !tomarOracion(1).pics.includes('montaña')) throw new Error('Duplicados filtrados por imágenes incorrectas');
      selectedCategories = null;actualizarDisponibilidad();
      if (poolUnicoNivel(1).length !== 1) throw new Error('Duplicados aumentan el conteo');
      const connectorFallback = { imagenes: original.imagenes, oraciones: [
        { level: 3, pics: ['Ana', 'ver', 'montaña', 'grande'], words: ['Ana', 've', 'la', 'montaña', 'grande', '.'] }
      ] };
      selectedCategories = new Set(['relieve']);aplicarBaseDeDatos(connectorFallback, 'Conectores derivados');
      if (!tomarOracion(5)?.pics.includes('montaña') || !tomarOracion(6)?.pics.includes('montaña')) throw new Error('Fallback pierde categorías');
      selectedCategories = null;aplicarBaseDeDatos(original, 'Base restaurada');
      const first = tomarOracion(1);
      const remaining = mazosOraciones.get(claveMazo(1)).pendientes.length;
      selectedCategories = new Set(['relieve']);tomarOracion(1);
      selectedCategories = null;
      if (mazosOraciones.get(claveMazo(1)).pendientes.length !== remaining) throw new Error('Cambiar temas reinicia otro mazo');
      const second = tomarOracion(1);
      if (canonical(first.words) === canonical(second.words)) throw new Error('Repite al regresar al mazo');
      actualizarDisponibilidad();return true;
    });
    assert.ok(importedEdgeCases);
    await page.locator('input[value="*"]').check();

    // Capturas de configuración en escritorio y teléfono, sin desbordamiento.
    const out = process.env.ORACIONES_QA_DIR;
    if (out) fs.mkdirSync(out, { recursive: true });
    if (out) await page.screenshot({ path: path.join(out, 'configuracion-escritorio.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'Configuración desborda en teléfono');
    if (out) await page.screenshot({ path: path.join(out, 'configuracion-telefono.png'), fullPage: true });

    // Carga HTTP de la base externa, error de red y reintento.
    const url = `http://127.0.0.1:${server.address().port}/generador-oraciones.html`;
    await page.goto(url);
    await page.waitForFunction(() => baseLista);
    assert.match(await page.locator('#dbStatus').textContent(), /Se utiliza base_oraciones.json/);
    await page.route('**/base_oraciones.json', route => route.fulfill({ status: 500, body: 'fallo' }));
    await page.evaluate(() => cargarBaseDeDatos());
    assert.equal(await page.locator('#startBtn').isEnabled(), false);
    assert.equal(await page.locator('#retryBaseBtn').isVisible(), true);
    await page.unroute('**/base_oraciones.json');
    await page.locator('#retryBaseBtn').click();
    await page.waitForFunction(() => baseLista);
    await page.locator('#baseFileInput').setInputFiles(path.join(root, 'base_oraciones.json'));
    await page.waitForFunction(() => baseLista && document.getElementById('dbStatus').textContent.includes('archivo seleccionado'));

    // El almacenamiento bloqueado no impide usar filtros ni iniciar.
    const denied = await browser.newPage();
    await denied.route('https://fonts.googleapis.com/**', route => route.abort());
    await denied.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Bloqueado'); } }); });
    await denied.goto(localURL);
    await denied.waitForFunction(() => baseLista);
    await denied.locator('input[value="relieve"]').check();
    assert.equal(await denied.locator('#startBtn').isEnabled(), true);
    await denied.locator('#startBtn').click();
    assert.equal(await denied.locator('#game').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ exercises: db.oraciones.length, images: Object.keys(db.imagenes).length, categories: db.categorias.length, reliefCounts, ...exhaustive, solved, result: 'OK' }));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
