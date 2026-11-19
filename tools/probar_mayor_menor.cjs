const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});try{
 const page=await browser.newPage({hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.speechSynthesis.cancel=()=>{};window.speechSynthesis.speak=u=>{window.ultimaVoz={text:u.text,rate:u.rate,lang:u.lang};};});
 const url='file:///'+path.resolve(__dirname,'../Mayor_Menor.html').replaceAll('\\','/');await page.goto(url);await page.locator('#preferenciasIdiomaVoz').waitFor({state:'attached'});assert(await page.locator('#checkBtn').isVisible());assert.equal(await page.locator('.configuracion-mayor').evaluate(e=>e.open),false);await page.locator('.boton-configuracion-mayor').click();
 assert.equal(await page.locator('.count-btn').count(),4);assert.equal(await page.locator('.digit-btn').count(),6);assert.equal(await page.locator('#helpBtn').count(),0);
 assert.equal(await page.locator('.start-btn').count(),0);await page.locator('[data-count="4"]').click();assert.equal(await page.evaluate(()=>exercises.length),1);await page.locator('[data-digits="6"]').click();await page.locator('#ayudaComparacion').check();await page.locator('#velocidadVoz').selectOption('0.7');await page.locator('#idiomaAplicacion').selectOption('en');await aplicarAjustes();await page.waitForFunction(()=>exercises.length===4&&IdiomaVoz.idioma==='en');assert.match(await page.locator('.acciones-secundarias .new').innerText(),/New round/);
 async function aplicarAjustes(){
  await page.evaluate(()=>{
   const ajustes=document.querySelector('.configuracion-mayor');
   window.ajustesAplicados=new Promise(resolve=>ajustes.addEventListener('close',()=>resolve(),{once:true}));
  });
  await page.locator('.aplicar-configuracion-mayor').click();
  await page.evaluate(()=>window.ajustesAplicados);
 }
 async function visible(context){await page.waitForTimeout(95);const d=await page.evaluate(()=>{const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,b:b.bottom,r:b.right};};return {w:innerWidth,h:innerHeight,game:r(document.querySelector('#gameScreen')),check:r(document.querySelector('#checkBtn')),title:r(document.querySelector('#gameTitle')),tools:r(document.querySelector('.herramientas-mayor')),cards:[...document.querySelectorAll('.exercise-card')].map(r),targets:[...document.querySelectorAll('.drop-box')].map(r),sources:[...document.querySelectorAll('.bank-chip')].map(r),overflow:document.documentElement.scrollWidth>innerWidth+2,fonts:[...document.querySelectorAll('.bank-chip')].map(e=>({scroll:e.scrollWidth,width:e.clientWidth,text:e.textContent,size:parseFloat(getComputedStyle(e).fontSize)}))};});
 assert(!d.overflow,context+' ancho '+JSON.stringify(d));for(const r of [d.game,d.check,...d.cards,...d.targets,...d.sources])assert(r.y>=-1&&r.b<=d.h+1&&r.x>=-1&&r.r<=d.w+1&&r.h>3&&r.w>3,context+' fuera de vista '+JSON.stringify(d));assert(d.fonts.every(f=>f.scroll<=f.width+1),context+' números completos '+JSON.stringify(d));if(d.w>d.h)assert(d.title.r<=d.game.x+1);else assert(d.tools.b<=d.game.y+1);
 assert(await page.evaluate(()=>[...document.querySelectorAll('.exercise-card')].every(card=>{const targets=[...card.querySelectorAll('.drop-box-inner')].map(e=>e.getBoundingClientRect()),sources=[...card.querySelectorAll('.bank-chip')].map(e=>e.getBoundingClientRect());return sources.every((r,i)=>r.width<=targets[i].width+1&&r.height<=targets[i].height+1);})),context+' fichas menores que sus destinos '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('.exercise-card')].map(e=>({targets:[...e.querySelectorAll('.drop-box-inner')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})),sources:[...e.querySelectorAll('.bank-chip')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})),style:e.style.cssText,h:e.getBoundingClientRect().height,row:e.querySelector(".relation-row").getBoundingClientRect().height,bank:e.querySelector(".number-bank").getBoundingClientRect().height})))));
 }
 for(const [w,h]of [[360,640],[390,844],[640,360],[844,390],[600,960],[768,1024],[1024,768],[1280,800],[1920,1080]]){await page.setViewportSize({width:w,height:h});for(const z of [50,70,85,100,125,150,200]){await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await visible(`${w}x${h} ${z}%`);}console.log(`PASS ${w}x${h}: cuatro ejercicios, seis cifras, ayuda y zoom 50–200%`);}
 for(const z of [50,85,100,125,150,200]){await page.setViewportSize({width:844,height:390});await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await page.evaluate(()=>newPage());await page.waitForTimeout(100);const d=await page.evaluate(()=>{const chip=document.querySelector('.bank-chip'),box=document.querySelector('.drop-box'),b=box.getBoundingClientRect(),p=chip.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2,base={bubbles:true,pointerType:'touch',pointerId:31,isPrimary:true};chip.dispatchEvent(new PointerEvent('pointerdown',{...base,clientX:p.x+p.width/2,clientY:p.y+p.height/2}));document.dispatchEvent(new PointerEvent('pointermove',{...base,clientX:x,clientY:y}));const r=ghost.getBoundingClientRect(),result={dx:Math.abs(r.x+r.width/2-x),dy:Math.abs(r.y+r.height/2-y)};document.dispatchEvent(new PointerEvent('pointerup',{...base,clientX:x,clientY:y}));return result;});assert(d.dx<2&&d.dy<2,'arrastre '+z+' '+JSON.stringify(d));assert.equal(await page.evaluate(()=>exercises[0].slots.filter(n=>n!==null).length),1);}
 console.log('PASS arrastre táctil centrado en el dedo con zoom 50–200%');
 for(const digits of [1,2,3,4,5,6]){await page.evaluate(d=>{setDigitButtonState(d);},digits);for(let i=0;i<12;i++){const nums=await page.evaluate(()=>generateUniqueNumbers(8));assert.equal(new Set(nums).size,8);assert(nums.every(n=>n>=1&&n<10**digits));assert(nums.filter(n=>String(n).length===digits).length>=Math.ceil(8*.75));}}console.log('PASS generación de 1–6 cifras sin duplicados y cuota del 75%');
 async function resolverRonda(){
  await page.evaluate(()=>{
   for(const ex of exercises){
    const valores=[...ex.numbers].sort((a,b)=>ex.mode==='mayor'?b-a:a-b);
    valores.forEach((valor,i)=>placeNumber(ex.id,i,ex.sources.find(s=>s.value===valor).id,valor));
   }
  });
  await page.locator('#checkBtn').click();
 }
 await page.evaluate(()=>{setDigitButtonState(6);newPage();});await resolverRonda();
 assert.equal(await page.evaluate(()=>isPageSolved),true);
 assert.equal(await page.locator('#tituloFiestaSignos').innerText(),'Mission complete!');
 await page.evaluate(()=>speakExercise(0));
 assert.match((await page.evaluate(()=>ultimaVoz.text)),/greater than|less than/);assert(Math.abs(await page.evaluate(()=>ultimaVoz.rate)-.7)<.0001);
 await page.getByRole('button',{name:'↻ New round'}).tap();
 assert(await page.evaluate(()=>!isPageSolved&&exercises.every(ex=>ex.slots.every(n=>n===null))));
 await page.locator('.boton-configuracion-mayor').click();await page.locator('#lecturaComparacion').uncheck();await page.locator('#idiomaAplicacion').selectOption('es');await aplicarAjustes();await page.waitForFunction(()=>IdiomaVoz.idioma==='es');await page.reload();await page.locator('#preferenciasIdiomaVoz').waitFor({state:'attached'});await page.locator('.boton-configuracion-mayor').click();assert(await page.locator('[data-count="4"]').evaluate(e=>e.classList.contains('active')));assert(await page.locator('[data-digits="6"]').evaluate(e=>e.classList.contains('active')));assert(await page.locator('#ayudaComparacion').isChecked());assert.equal(await page.locator('#lecturaComparacion').isChecked(),false);assert.equal(await page.locator('#velocidadVoz').inputValue(),'0.7');assert.equal(await page.locator('#idiomaAplicacion').inputValue(),'es');console.log('PASS validación, audio inglés y preferencias tras recarga');
 await aplicarAjustes();for(const [w,h]of [[390,844],[844,390],[1024,768]]){await page.setViewportSize({width:w,height:h});await page.locator('#boton-pantalla-completa').click();await page.waitForFunction(()=>!!document.fullscreenElement);for(const z of [85,100,125,150]){await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},z);await visible('Pantalla completa '+w+' '+z);}await page.locator('.boton-configuracion-mayor').click();await page.locator('#ayudaComparacion').scrollIntoViewIfNeeded();await visible('Configuración abierta');await aplicarAjustes();await page.evaluate(()=>document.exitFullscreen());console.log('PASS pantalla completa y ajustes '+w+'x'+h);}
 if(process.env.CAPTURAS){for(const [w,h]of [[390,844],[844,390],[1024,768]]){await page.setViewportSize({width:w,height:h});await page.locator('#zoom-aplicacion').evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('.herramientas-mayor').evaluate(e=>e.scrollTop=0);await page.waitForTimeout(150);await page.screenshot({path:path.resolve(__dirname,`../.qa-mayor-${w}.png`),fullPage:true});}}
 for(const escena of ['volcan','tren','globo']){
  await resolverRonda();
  assert.equal(await page.locator('.fiesta-signos').getAttribute('data-tipo'),escena);
  assert.equal(await page.locator('.fiesta-signos canvas').count(),1);
  await page.locator('.activar-escena-signos').tap();
  await page.waitForFunction(()=>document.querySelector('.fiesta-signos').dataset.fase==='animacion');
  await page.locator('.nueva-ronda-fiesta-signos').tap();
  assert(await page.evaluate(()=>!FiestaSignos.activa&&!isPageSolved&&exercises.every(ex=>ex.slots.every(n=>n===null))));
 }
 await page.locator('.boton-configuracion-mayor').click();
 await page.selectOption('#tipoFiestaSignos','tren');
 await page.uncheck('#activarFiestaSignos');
 await aplicarAjustes();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cajaMayorMenor.celebracion.v1'))?.activa===false);
 await page.reload();
 assert.equal(await page.locator('#tipoFiestaSignos').inputValue(),'tren');
 await resolverRonda();
 assert.equal(await page.locator('.fiesta-signos[open]').count(),0);
 assert(await page.locator('#feedback.show').isVisible());
 console.log('PASS rotación, inicio táctil, Nueva ronda, preferencia persistente y felicitación sin animación');
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await blocked.goto(url);assert(await blocked.locator('#checkBtn').isVisible());await blocked.close();assert.deepEqual(errors,[]);console.log('PASS almacenamiento bloqueado');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
