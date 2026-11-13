const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('path');
const apps=[
 ['mayor_menor_igual.html',()=>{},'#btnCheck'],
 ['OrdenarAscendenteYDescendente.html',()=>{},'#checkBtn'],
 ['Antecesor_y_Sucesor.html',()=>{},'#checkBtn'],
 ['aprende_a_restar_quitando.html',()=>{},'.controls'],
 ['Sumas_y_restas.html',()=>{},'#checkBtn'],
 ['Sumas_y_Restas_UM_C_D_U.html',()=>{},'.screen.active .actions .ok'],
 ['Situaciones_Problema_Sumas_Restas.html',()=>openProblem(Object.keys(problems)[0]),'#checkBtn'],
 ['Modelador_de_Solidos_3D.html',()=>{closeSettings();setMode('classification')},'#checkClassBtn'],
 ['Fracciones_Propias_1.html',()=>{FraccionesAPI.setScreen('a2');FraccionesAPI.startActivity('a2')},'#a2Check']
];
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});try{for(const[file,setup,main]of apps){const context=await b.newContext({hasTouch:true});const p=await context.newPage();let errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{speechSynthesis.speak=u=>{window.lastVoice={text:u.text,lang:u.lang,rate:u.rate};setTimeout(()=>u.onend?.(),0)};speechSynthesis.cancel=()=>{}});const url='file:///'+path.resolve(file).replaceAll('\\','/');await p.goto(url);await p.evaluate(setup);await p.waitForTimeout(150);
 await p.locator('#idiomaAplicacion').selectOption('en',{force:true});await p.locator('#velocidadVoz').selectOption('0.8',{force:true});await p.locator('#probarIdiomaVoz').dispatchEvent('click');assert.match(await p.evaluate(()=>lastVoice.lang),/^en/);assert(Math.abs(await p.evaluate(()=>lastVoice.rate)-.8)<1e-6);await p.reload();assert.equal(await p.locator('#idiomaAplicacion').inputValue(),'en');assert.equal(await p.locator('#velocidadVoz').inputValue(),'0.8');await p.evaluate(setup);
 for(const[w,h]of [[390,844],[844,390]]){await p.setViewportSize({width:w,height:h});for(const z of [50,85,100,150,200]){await p.locator('#zoom-aplicacion').evaluate((e,z)=>{e.value=z;e.dispatchEvent(new Event('input',{bubbles:true}))},z);for(const full of [true,false]){if(full)await p.locator('#boton-pantalla-completa').click();else await p.evaluate(()=>document.exitFullscreen());await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>!!document.fullscreenElement),full);await p.evaluate(()=>document.querySelectorAll('details').forEach(e=>e.open=true));await p.waitForTimeout(80);const r=await p.locator(main).first().boundingBox();assert(r&&r.x>=-1&&r.y>=-1&&r.x+r.width<=w+1&&r.y+r.height<=h+1,file+' main '+w+' '+z+' '+JSON.stringify(r));await p.evaluate(()=>document.querySelectorAll('details').forEach(e=>e.open=false));}}}
 assert.deepEqual(errors,[],file);const blocked=await context.newPage();const be=[];blocked.on('pageerror',e=>be.push(e.message));await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await blocked.goto(url);await blocked.evaluate(setup);await blocked.waitForTimeout(100);assert.deepEqual(be,[],file+' blocked storage');assert(await blocked.locator(main).first().isVisible());await context.close();console.log('PASS voices, storage, fullscreen, settings:',file);
}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
