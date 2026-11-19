const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try {
  const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**',r=>r.abort());
  await page.addInitScript(()=>{
   Object.defineProperty(window,'GruposMagneticos',{configurable:true,set(Clase){
    Object.defineProperty(window,'GruposMagneticos',{value:class extends Clase{
     constructor(...args){super(...args);window.tableroDePrueba=this;}
    }});
   }});
  });
  await page.goto(pathToFileURL(path.resolve('Multiplicacion/multiplicacion.html')).href);
  assert.equal(await page.locator('.tarjetas-modos .icono-modo svg').count(),5);
  assert.equal(await page.locator('#emblemaMultiplicacion svg').count(),1);
  await page.locator('.tarjetas-modos [data-modo=grupos]').click();
  assert.equal(await page.locator('[data-setting=metodoGrupos]').inputValue(),'soltar');
  await page.locator('[data-ninguna]').click();
  await page.locator('[name=tabla][value="3"]').check();
  await page.locator('[data-setting=narracion]').uncheck();
  await page.locator('[data-setting=metodoGrupos]').selectOption('barrido');
  await page.locator('#aplicar').click();
  const cdp=await page.context().newCDPSession(page);
  const evento=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[p]:[]});
  const tamano=id=>page.locator(`[data-nodo="${id}"]`).getAttribute('data-cantidad').then(Number);

  async function preparar(){
   return page.evaluate(()=>{
    const m=tableroDePrueba;
    m.iniciar(Array.from({length:6},(_,id)=>({id,forma:'circulo',color:2})),3,
     {ayuda:true,metodo:m.metodo,disposicion:'compactos'});
    document.querySelector('#espacio').scrollTop=0;
    m.plano.style.height='';m.adaptar(true);
    const r=m.plano.getBoundingClientRect(),u=m.mundo.tam;
    const puntos=[[.7,.75],[2,.75],[3.3,.75],[4.6,.75],[1,2.95],[2.6,2.95]];
    m.nodos.forEach((n,i)=>{n.x=puntos[i][0]*u;n.y=puntos[i][1]*u;});
    m.actualizar();
    return puntos.map(([x,y])=>({x:r.left+x*u,y:r.top+y*u}));
   });
  }

  for(const [width,height] of [[1024,768],[390,844]]){
   await page.setViewportSize({width,height});
   for(const zoom of [50,85,100,150,200]){
    await page.locator('#zoom-aplicacion').evaluate((el,z)=>{
     el.value=z;el.dispatchEvent(new Event('input',{bubbles:true}));
    },zoom);
    await page.waitForTimeout(110);
    const p=await preparar();
    await evento('touchStart',p[0]);await evento('touchMove',p[2]);
    await page.waitForFunction(()=>document.querySelector('[data-nodo="0"]').dataset.cantidad==='3');
    assert.equal(await tamano(1),3);
    await evento('touchMove',p[3]);
    assert.equal(await tamano(3),1);
    await evento('touchEnd');
    await page.waitForFunction(()=>tableroDePrueba.componentes().some(g=>g.join(',')==='0,1,2')&&!tableroDePrueba.movimiento);
    assert.ok(await page.locator('.etiqueta-completo').count());
    await page.locator('#deshacerGrupo').click();
    assert.equal(await tamano(0),1);
    const r=await page.locator('#revisar').boundingBox();
    assert.ok(r.y>=0&&r.y+r.height<=height+1);
   }
   console.log('PASS pickup while touching, group limit, commit, undo and review visible',width,height);
  }
  await page.locator('#boton-pantalla-completa').click();
  await page.waitForFunction(()=>document.fullscreenElement);
  await page.waitForTimeout(200);
  const p=await preparar();
  await evento('touchStart',p[0]);await evento('touchMove',p[1]);
  await page.waitForFunction(()=>document.querySelector('[data-nodo="0"]').dataset.cantidad==='2');
  await evento('touchCancel');
  await page.waitForFunction(()=>document.querySelector('[data-nodo="0"]').dataset.cantidad==='1');
  await page.evaluate(()=>document.exitFullscreen());
  await page.reload();
  await page.locator('.tarjetas-modos [data-modo=grupos]').click();
  assert.equal(await page.locator('[data-setting=metodoGrupos]').inputValue(),'barrido');
  await page.locator('[data-setting=metodoGrupos]').selectOption('soltar');
  await page.locator('#aplicar').click();
  await page.waitForTimeout(100);
  const q=await preparar();
  await evento('touchStart',q[0]);await evento('touchMove',q[1]);
  await page.waitForFunction(()=>!!tableroDePrueba.arrastre?.movido);
  assert.equal(await tamano(0),1);
  await evento('touchEnd');
  await page.waitForFunction(()=>document.querySelector('[data-nodo="0"]').dataset.cantidad==='2');
  for(const [width,height] of [[320,568],[640,360],[844,390],[1920,1080]]){
   await page.setViewportSize({width,height});
   for(const zoom of [50,200]){
    await page.locator('#zoom-aplicacion').evaluate((el,z)=>{
     el.value=z;el.dispatchEvent(new Event('input',{bubbles:true}));
    },zoom);
    await page.waitForTimeout(90);
    for(const selector of ['#pregunta','#espacio','#ecuacion','#revisar']){
     const r=await page.locator(selector).boundingBox();
     assert.ok(r.x>=-1&&r.x+r.width<=width+1&&r.y>=-1&&r.y+r.height<=height+1,
       JSON.stringify({width,height,zoom,selector,r}));
    }
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS cancellation, fullscreen, saved method and classic release behavior');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
