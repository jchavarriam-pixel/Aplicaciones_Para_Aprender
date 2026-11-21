const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  try {
    const p = await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.route('https://**', r => r.abort());
    await p.addInitScript(() => {
      window.locucionesPasos = [];
      speechSynthesis.speak = voz => {
        locucionesPasos.push({texto:voz.text, idioma:voz.lang});
        setTimeout(() => voz.onend?.(), 45);
      };
      speechSynthesis.cancel = () => {};
    });
    await p.goto(pathToFileURL(path.resolve('Sumas_y_restas.html')).href);
    const avanzar = p.locator('.avanzar-paso-operacion');
    const pasos = p.locator('.panel-pasos-operaciones');
    const prestamo = p.locator('.controles-pasos-prestamo');
    const pedir = p.locator('#borrowBtn');
    const preparar = (a,b,op='-') => p.evaluate(({a,b,op}) => {
      currentOperation=op; digits=a.length; topDigits=a; bottomDigits=b;
      expectedCarryIn=op==='+' ? calculateAdditionCarryIn(a,b) : new Array(digits).fill(0);
      expectedLeadingDigit=op==='+' ? Math.floor((digitsToNumber(a)+digitsToNumber(b))/10**digits) : 0;
      resetProblem();
    },{a,b,op});
    const medirCasillas = () => p.locator('#colsContainer .digit-cell, #ansContainer .answer-cell').evaluateAll(casillas =>
      casillas.map(casilla => {
        const {x,y,width,height} = casilla.getBoundingClientRect();
        return [x,y,width,height,parseFloat(getComputedStyle(casilla).fontSize)].map(n=>Math.round(n*10)/10);
      }));
    const esperarAjuste = () => p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    for (const [width,height] of [[320,568],[390,844],[640,360],[740,320],[1024,768]]) {
      await p.setViewportSize({width,height});
      for (const zoom of [50,85,100,150,200]) {
        await p.evaluate(zoom => { document.body.style.zoom=zoom/100; },zoom);
        await preparar([5,2],[1,7]);
        await esperarAjuste();
        const antes = await medirCasillas();
        await pedir.tap();
        assert.equal(await pasos.count(),0);
        assert.match(await prestamo.innerText(),/2 \+ 10 = 12/);
        assert.equal(await p.locator('#colsContainer .col[data-col="1"] .cifra-sube').innerText(),'12');
        assert.equal(await p.locator('.cifra-sube.muestra-prefijo').count(),0);
        assert.deepEqual(await p.evaluate(()=>currentTop),[5,2]);
        await esperarAjuste();
        assert.deepEqual(await medirCasillas(),antes,'Subir la cifra no mueve ni cambia de tamaño la cuenta');
        await avanzar.tap();
        const recta = p.locator('#colsContainer .col[data-col="0"] .borrow-zone .recta-prestamo');
        await recta.waitFor();
        assert.deepEqual(await recta.locator('span').allTextContents(),['6','5','4','3']);
        assert.equal(await p.locator('#colsContainer .col[data-col="1"] .cifra-del-paso').innerText(),'12');
        await esperarAjuste();
        assert.deepEqual(await medirCasillas(),antes,'La recta no mueve ni cambia de tamaño la cuenta');
        for (const sel of ['.controles-pasos-prestamo','.recta-prestamo','.answer-cell','#checkBtn']) {
          const r=await p.locator(sel).first().boundingBox();
          assert.ok(r.x>=-.5 && r.y>=-.5 && r.x+r.width<=width+1 && r.y+r.height<=height+1,
            JSON.stringify({width,height,zoom,sel,r}));
        }
        if (width===390 && zoom===100 && process.env.CAPTURAS) await p.screenshot({path:'.qa-operaciones-pasos.png'});
        await avanzar.tap();
        await esperarAjuste();
        assert.deepEqual(await p.evaluate(()=>currentTop),[4,12]);
        assert.deepEqual(await medirCasillas(),antes,'Terminar el préstamo mantiene la geometría');
        assert.equal(await prestamo.count(),0);
        await preparar([5,2],[1,7],'+');
        await esperarAjuste();
        assert.deepEqual(await medirCasillas(),antes,'Ocultar el botón de préstamo conserva el espacio');
      }
      console.log('PASS borrow animation and controls at 50–200%', width,height);
    }

    await p.locator('#boton-pantalla-completa').click();
    await p.waitForFunction(()=>document.fullscreenElement);
    await preparar([8,0,0,2],[1,2,3,7]);
    await pedir.tap(); await avanzar.tap(); await avanzar.tap();
    assert.match(await prestamo.innerText(),/10 − 1 = 9/);
    await avanzar.tap();
    assert.deepEqual(await p.evaluate(()=>currentTop),[7,9,9,12]);
    async function arrastrar(n, selector) {
      const ficha=await p.locator(`.bank-chip[data-val="${n}"]`).boundingBox();
      const casilla=await p.locator(selector).boundingBox();
      await p.mouse.move(ficha.x+ficha.width/2,ficha.y+ficha.height/2);
      await p.mouse.down();
      await p.mouse.move(casilla.x+casilla.width/2,casilla.y+casilla.height/2,{steps:5});
      await p.mouse.up();
    }
    const unidades = '.answer-cell[data-col="1"]';
    await preparar([2,6],[1,4],'+');
    await arrastrar(0, unidades);
    await arrastrar(1,'.carry-cell');
    assert.equal(await pasos.count(),0);
    assert.equal(await p.locator(unidades).innerText(),'0');
    await preparar([2,6],[1,4],'+');
    await arrastrar(1, unidades);
    await arrastrar(0, unidades);
    assert.equal(await p.locator(unidades).innerText(),'10');
    assert.match(await pasos.innerText(),/10 = 10 \+ 0/);
    await avanzar.tap();
    assert.equal(await p.locator('.carry-cell .ficha-llevada-animada').innerText(),'1');
    assert.equal(await p.locator(unidades).innerText(),'0');
    await avanzar.tap();
    assert.equal(await p.locator('.carry-cell').innerText(),'1');
    await preparar([6,2],[4,1],'+');
    await arrastrar(1,'.answer-cell[data-col="0"]');
    await arrastrar(0,'.answer-cell[data-col="0"]');
    await p.locator('.saltar-pasos-operacion').tap();
    assert.equal(await p.locator('.answer-cell[data-type="leading"]').innerText(),'1');
    await p.evaluate(()=>document.exitFullscreen());

    await preparar([5,2],[1,7]);
    await pedir.tap();
    assert.match(await p.evaluate(()=>locucionesPasos.at(-1).texto),/Tomemos el 2\. Lo subimos/);
    await p.locator('.cifra-sube.muestra-prefijo').waitFor({state:'visible',timeout:5000});
    assert.match(await p.evaluate(()=>locucionesPasos.at(-1).texto),/para formar el 12/);
    await p.locator('.recta-origen').waitFor({state:'visible',timeout:6500});
    assert.match(await p.evaluate(()=>locucionesPasos.at(-1).texto),/Busquemos el 5 en la recta/);
    const centro = async selector => {
      const {x,y,width,height} = await p.locator(selector).boundingBox();
      return {x:x+width/2,y:y+height/2};
    };
    await p.locator('.recta-prestamo').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
    const ancla = await centro('#colsContainer .col[data-col="0"] .borrow-zone');
    let cifra = await centro('.recta-origen');
    assert.ok(Math.abs(cifra.x-ancla.x)<2 && Math.abs(cifra.y-ancla.y)<2);
    assert.ok((await centro('.recta-antecesor')).y > cifra.y);
    await p.locator('.recta-en-retroceso').waitFor({state:'visible',timeout:5500});
    assert.match(await p.evaluate(()=>locucionesPasos.at(-1).texto),/Llegamos al 4, el antecesor del 5/);
    await p.locator('.cinta-recta-prestamo').evaluate(el =>
      Promise.all(el.getAnimations().map(animacion => animacion.finished)));
    cifra = await centro('.recta-antecesor');
    assert.ok(Math.abs(cifra.x-ancla.x)<2 && Math.abs(cifra.y-ancla.y)<2);
    await p.locator('.saltar-pasos-operacion').tap();
    assert.deepEqual(await p.evaluate(()=>currentTop),[4,12]);

    await p.locator('.boton-ajustes-operaciones').click();
    assert.ok(await p.locator('.ajustes-operaciones #ayudaVisualOperaciones').isVisible());
    assert.ok(await p.locator('.ajustes-operaciones #ayudaVerbalOperaciones').isVisible());
    await p.locator('#narrarPasosOperaciones').uncheck();
    await p.locator('#animarPasosOperaciones').uncheck();
    await p.locator('#ayudaVisualOperaciones').check();
    await p.locator('.aplicar-operaciones').click();
    await p.waitForFunction(()=>{
      const preferencias=JSON.parse(localStorage.getItem('operaciones.config.v1'));
      return preferencias?.animarPasos===false && preferencias?.narrarPasos===false;
    });
    await p.reload();
    await preparar([9,2],[1,7]);
    await pedir.tap();
    assert.deepEqual(await p.evaluate(()=>[currentTop,helpOn]),[[8,12],true]);
    assert.equal(await pasos.count(),0);
    assert.equal(await prestamo.count(),0);
    assert.deepEqual(errors,[]);
    console.log('PASS successive zeros, carry placement, fullscreen, settings and instant borrowing after reload');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
