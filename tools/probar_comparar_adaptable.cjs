const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});try{
 const page=await browser.newPage({hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve(__dirname,'../Mayor_Menor_Objetos/mayor_menor_objetos.html').replaceAll('\\','/'));
 await page.evaluate(()=>{config.voz=false;});
 for(const [width,height] of [[360,640],[390,844],[640,360],[844,390],[600,960],[768,1024],[1024,768],[1280,800],[1920,1080]]){
  await page.setViewportSize({width,height});
  for(const modo of [1,2,3,4]){
   await page.evaluate(modo=>{config.actividad=modo;if(modo===3)config.categorias=['clima'];actualizarConfig();nuevaRonda();},modo);
   await page.waitForTimeout(220);
   const data=await page.evaluate(()=>{const z=document.querySelector('#zonaImagen'),a=document.querySelector('.actividad');return {overflow:document.documentElement.scrollWidth>innerWidth+2,cards:[...z.children].map(e=>{const r=e.getBoundingClientRect(),l=e.querySelector('.lienzo').getBoundingClientRect(),m=e.querySelector('.muestra').getBoundingClientRect();return {w:r.width,h:r.height,fits:l.width<=m.width+1&&l.height<=m.height+1};}),alto:z.style.getPropertyValue('--alto-disponible'),right:a.getBoundingClientRect().right};});
   assert(!data.overflow,`overflow ${width}x${height} modo ${modo}`);assert(data.cards.every(c=>c.w>=50&&c.h>=44&&c.fits),JSON.stringify({width,height,modo,data}));assert(data.alto);
   const antes=data.alto;await page.waitForTimeout(100);assert.equal(await page.locator('#zonaImagen').evaluate(e=>e.style.getPropertyValue('--alto-disponible')),antes,'La distribución debe estabilizarse');
   if(modo<4){await page.waitForFunction(()=>lista);await page.evaluate(()=>{elegir(ronda[indice].opciones.findIndex(o=>o.valor===ronda[indice].valorCorrecto));revisar();});assert(await page.locator('#siguiente').isVisible());}
  }
  await page.locator('.ajustes').evaluate(e=>e.open=true);await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.locator('.ajustes').evaluate(e=>e.open=false);
  console.log(`PASS ${width}x${height}: cuatro modos y configuración`);
 }
 await page.setViewportSize({width:844,height:390});await page.locator('.ajustes').evaluate(e=>e.open=true);await page.locator('#idiomaAplicacion').selectOption('en');await page.locator('.ajustes').evaluate(e=>e.open=false);
 for(const zoom of [85,125,150]){await page.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}));},zoom);await page.waitForTimeout(180);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));}
 assert.deepEqual(errors,[]);console.log('PASS inglés y zoom 85%, 125%, 150%');
 if(process.env.CAPTURAS){await page.locator('#zoom-aplicacion').evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));});for(const [w,h]of [[390,844],[844,390],[1024,768]]){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(180);await page.screenshot({path:path.resolve(__dirname,`../.qa-comparar-${w}.png`),fullPage:true});}}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
