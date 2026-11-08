const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});try{
 const page=await browser.newPage({hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve(__dirname,'../Ordenar_Objetos_Tamano/ordenar_objetos_tamano.html').replaceAll('\\','/'));await page.waitForFunction(()=>listo);await page.evaluate(()=>{config.voz=false;speechSynthesis.cancel();});
 async function zoom(z){await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);}
 async function ronda(n){await page.evaluate(n=>{config.cantidad=n;nuevaRonda();},n);await page.waitForFunction(()=>listo);await page.waitForTimeout(65);}
 async function visible(contexto){
  const d=await page.evaluate(()=>{const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,b:b.bottom,r:b.right};};return {width:innerWidth,height:innerHeight,juego:r(document.querySelector('.juego')),reto:r(document.querySelector('.reto')),boton:r(document.querySelector('#revisar')),titulo:r(document.querySelector('.herramientas header')),herramientas:r(document.querySelector('.herramientas')),casillas:[...document.querySelectorAll('.casilla')].map(r),overflow:document.documentElement.scrollWidth>innerWidth+2};});
  assert(!d.overflow,contexto+' ancho');for(const k of ['juego','reto','boton',...d.casillas.map((_,i)=>i)]){const r=typeof k==='number'?d.casillas[k]:d[k];assert(r.y>=-1&&r.b<=d.height+1&&r.x>=-1&&r.r<=d.width+1,contexto+' fuera de vista '+k+' '+JSON.stringify(d));}assert(d.casillas.every(r=>r.h>10&&r.w>10),contexto+' casillas '+JSON.stringify(d));
  if(d.width>d.height)assert(d.titulo.r<=d.juego.x+1,contexto+' título a la izquierda');else assert(d.herramientas.b<=d.juego.y+1,contexto+' controles arriba');
 }
 for(const [w,h]of [[360,640],[390,844],[640,360],[844,390],[600,960],[768,1024],[1024,768],[1280,800],[1920,1080]]){
  await page.setViewportSize({width:w,height:h});for(const z of [50,70,85,100,125,150,200]){await zoom(z);for(const n of [2,4,6]){await ronda(n);await visible(`${w}x${h} ${z}% ${n} objetos`);}}
  console.log(`PASS ${w}x${h}: 2, 4 y 6 objetos; zoom 50–200%`);
 }
 await page.setViewportSize({width:844,height:390});await page.locator('.ajustes').evaluate(e=>e.open=true);await page.locator('#idiomaAplicacion').selectOption('en');await page.locator('.ajustes').evaluate(e=>e.open=false);
 for(const z of [85,100,125,150,200]){
  await zoom(z);await ronda(6);
  // Arrastre táctil: misma pieza y mismo punto del dedo con cualquier zoom.
  await page.evaluate(()=>{const pieza=document.querySelector('#banco .pieza'),a=pieza.getBoundingClientRect(),slot=document.querySelector('#orden .casilla'),b=slot.getBoundingClientRect(),x=a.x+a.width/2,y=a.y+a.height/2,tx=b.x+b.width/2,ty=b.y+b.height/2,base={bubbles:true,pointerId:71,pointerType:'touch',isPrimary:true};pieza.dispatchEvent(new PointerEvent('pointerdown',{...base,clientX:x,clientY:y}));window.dispatchEvent(new PointerEvent('pointermove',{...base,clientX:tx,clientY:ty}));const r=pieza.getBoundingClientRect();window.resultadoDedo={dx:Math.abs(r.x+r.width/2-tx),dy:Math.abs(r.y+r.height/2-ty)};window.dispatchEvent(new PointerEvent('pointerup',{...base,clientX:tx,clientY:ty}));});
  const dedo=await page.evaluate(()=>resultadoDedo);assert(dedo.dx<2&&dedo.dy<2,`dedo ${z}% ${JSON.stringify(dedo)}`);assert.equal(await page.locator('#orden .pieza').count(),1);
  await page.evaluate(()=>{for(let i=0;i<cantidad;i++)mover(document.querySelector(`.pieza[data-rank="${i}"]`),document.querySelectorAll('#orden .casilla')[i]);revisar();});assert(await page.locator('#otraRonda').isVisible());assert.match(await page.locator('#mensaje').innerText(),/Well done/);await visible('orden correcto '+z);
 }
 console.log('PASS arrastre táctil, orden y felicitación inglesa con zoom');
 await page.setViewportSize({width:640,height:360});await zoom(200);
 for(const criterio of await page.evaluate(()=>criterios.map(c=>c.id))){await page.evaluate(c=>{config.criterio=c;config.familia='azar';},criterio);await ronda(6);await visible('Todos los criterios al 200%: '+criterio);}
 console.log('PASS todos los criterios con seis objetos en teléfono horizontal al 200%');
 for(const [w,h]of [[390,844],[844,390],[1024,768]]){
  await page.setViewportSize({width:w,height:h});await page.locator('#boton-pantalla-completa').click();await page.waitForFunction(()=>!!document.fullscreenElement);
  for(const z of [85,100,125,150]){await zoom(z);await ronda(6);await visible(`Completa ${w}x${h} ${z}%`);}
  await page.locator('.ajustes').evaluate(e=>e.open=true);await page.locator('#nombre').scrollIntoViewIfNeeded();await visible('ajustes abiertos y desplazados');await page.locator('.ajustes').evaluate(e=>e.open=false);await page.evaluate(()=>document.exitFullscreen());await page.waitForTimeout(80);await visible('salida de pantalla completa');console.log(`PASS pantalla completa y ajustes ${w}x${h}`);
 }
 if(process.env.CAPTURAS){await zoom(100);for(const [w,h]of [[390,844],[844,390],[1024,768]]){await page.setViewportSize({width:w,height:h});await ronda(6);await page.locator('.herramientas').evaluate(e=>e.scrollTop=0);await page.screenshot({path:path.resolve(__dirname,`../.qa-ordenar-${w}.png`),fullPage:true});}}
 assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
