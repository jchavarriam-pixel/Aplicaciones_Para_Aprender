'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const app=document.getElementById('app'),menu=document.getElementById('menuScreen'),game=document.getElementById('gameScreen'),grid=document.getElementById('exercisesGrid');
 const tools=document.createElement('aside');tools.className='herramientas-mayor';app.prepend(tools);tools.append(menu);
 const title=document.getElementById('gameTitle'),intro=title.nextElementSibling;tools.prepend(title,intro);
 Object.assign(window.TEXTOS_INGLES,{'Aplicar y cerrar':'Apply and close','Aplicar y volver al juego':'Apply and return to the game'});
 const settings=document.createElement('dialog');settings.className='configuracion-mayor formulario-mayor';settings.setAttribute('aria-labelledby','tituloConfiguracionMayor');settings.innerHTML='<header><h2 id="tituloConfiguracionMayor">Configuración</h2><button type="button" class="cerrar-configuracion-mayor" aria-label="Aplicar y cerrar">✕</button></header>';document.body.append(settings);settings.append(menu);
 const abrir=document.createElement('button');abrir.className='boton-configuracion-mayor';abrir.textContent='⚙ Configuración';tools.append(abrir);
 const nombre=document.getElementById('nameInput').closest('.config-card');nombre.classList.add('nombre-mayor');title.after(nombre);
 const aceptar=document.createElement('button');aceptar.className='aplicar-configuracion-mayor';aceptar.textContent='Aplicar y volver al juego';settings.append(aceptar);
 const cambios=new Set();let aplicandoDialogo=false;const selecciones=new Map();
 function abrirConfiguracion(){cambios.clear();selecciones.clear();settings.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));settings.showModal();}
 const accesos=document.createElement('nav');accesos.className='accesos-mayor';accesos.setAttribute('aria-label','Aplicaciones y configuración');abrir.before(accesos);const casa=document.createElement('a');casa.className='inicio-mayor';casa.href='index.html';casa.textContent='⌂';casa.setAttribute('aria-label','Volver a las aplicaciones');casa.title='Volver a las aplicaciones';accesos.append(abrir);
 const cabecera=document.createElement('header');cabecera.className='cabecera-comparacion';tools.prepend(cabecera);const insignia=document.createElement('span');insignia.className='insignia-comparacion';insignia.textContent='⚖️';insignia.setAttribute('aria-hidden','true');cabecera.append(insignia,title,nombre,intro,casa);cabecera.append(accesos);
 abrir.onclick=abrirConfiguracion;aceptar.onclick=()=>settings.close();settings.querySelector('.cerrar-configuracion-mayor').onclick=()=>settings.close();
 settings.addEventListener('change',e=>{if(!aplicandoDialogo){e.stopImmediatePropagation();cambios.add(e.target);}},true);
 settings.addEventListener('click',e=>{const b=e.target.closest('.count-btn,.digit-btn');if(b&&!aplicandoDialogo){e.stopImmediatePropagation();e.preventDefault();const tipo=b.matches('.count-btn')?'count':'digit';selecciones.set(tipo,b);settings.querySelectorAll('.'+tipo+'-btn').forEach(el=>el.classList.toggle('active',el===b));}},true);
 settings.addEventListener('close',()=>{window.seleccionNumerosMayor={modo:modo.value,min:Math.floor(+minimo.value),max:Math.floor(+maximo.value)};aplicandoDialogo=true;for(const b of selecciones.values())b.click();for(const el of cambios)el.dispatchEvent(new Event('change',{bubbles:true}));aplicandoDialogo=false;guardar();if(app.classList.contains('jugando')){cancelarArrastre();newPage();}});
 const preferences=document.createElement('div');preferences.className='config-card';preferences.innerHTML='<section id="preferenciasIdiomaVoz"></section><label class="opcion-mayor"><input id="ayudaComparacion" type="checkbox"> Mostrar ayuda en las cajas</label><label class="opcion-mayor"><input id="lecturaComparacion" type="checkbox" checked> Leer comparaciones y respuestas</label>';menu.append(preferences,menu.querySelector('.start-btn'));preferences.append(document.getElementById('preferenciasIdiomaVoz'));
 const top=game.querySelector('.top-bar');top.querySelector('.menu').remove();tools.append(top);
 const secondary=document.createElement('div');secondary.className='acciones-secundarias';for(const e of [...game.querySelector('.actions').children])if(e.id!=='checkBtn')secondary.append(e);tools.append(secondary);
 secondary.querySelector('.new').textContent='🔄 Nueva ronda';
 game.querySelector('.footer-credit').remove();menu.querySelector('p[style]')?.remove();document.body.append(document.getElementById('creditos-aplicaciones'));
 const instruction=document.createElement('h2');instruction.className='instruccion-mayor';instruction.textContent='Completa las comparaciones.';game.prepend(instruction);
 const hint=document.getElementById('hintBar'),marcaHint=document.createComment('mensaje de la actividad');hint.before(marcaHint);
 const key='mayorMenor.config.v1',help=document.getElementById('ayudaComparacion'),read=document.getElementById('lecturaComparacion');
 let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
 Object.assign(window.TEXTOS_INGLES,{'Selección de números':'Number selection','Hasta N dígitos':'Up to N digits','Rango definido':'Defined range','Mínimo':'Minimum','Máximo':'Maximum','Los límites están incluidos. Usa dos valores diferentes entre 0 y 999999.':'Both limits are included. Use two different values between 0 and 999999.'});
 const seleccion=document.createElement('section');seleccion.className='config-card seleccion-numeros-mayor';seleccion.innerHTML='<h2 class="section-title">Selección de números</h2><div class="modos-numeros-casillas"><label><input type="checkbox" id="escogerDigitosMayor"> Hasta N dígitos</label><label><input type="checkbox" id="escogerRangoMayor"> Rango definido</label></div><select id="modoNumerosMayor" hidden aria-hidden="true"><option value="digitos">Hasta N dígitos</option><option value="rango">Rango definido</option></select><div class="limites-mayor"><label>Mínimo<input id="minimoMayor" type="number" min="0" max="999998" step="1"></label><label>Máximo<input id="maximoMayor" type="number" min="1" max="999999" step="1"></label><p>Los límites están incluidos. Usa dos valores diferentes entre 0 y 999999.</p></div>';
 const tarjetaDigitos=menu.querySelector('.digit-btn').closest('.config-card');tarjetaDigitos.before(seleccion);
 const modo=document.getElementById('modoNumerosMayor'),minimo=document.getElementById('minimoMayor'),maximo=document.getElementById('maximoMayor');
 window.seleccionNumerosMayor={modo:saved.modoNumeros==='rango'?'rango':'digitos',min:Math.max(0,Math.min(999998,Math.floor(Number(saved.minimo)||0))),max:Math.max(1,Math.min(999999,Math.floor(Number(saved.maximo)||100)))};
 if(window.seleccionNumerosMayor.max<=window.seleccionNumerosMayor.min)window.seleccionNumerosMayor.max=window.seleccionNumerosMayor.min+1;
 modo.value=window.seleccionNumerosMayor.modo;minimo.value=window.seleccionNumerosMayor.min;maximo.value=window.seleccionNumerosMayor.max;
 const casillaDigitos=document.getElementById('escogerDigitosMayor'),casillaRango=document.getElementById('escogerRangoMayor');
 function escogerModo(valor){modo.value=valor;casillaDigitos.checked=valor==='digitos';casillaRango.checked=valor==='rango';mostrarSeleccion();}
 casillaDigitos.addEventListener('input',()=>escogerModo('digitos'));casillaRango.addEventListener('input',()=>escogerModo('rango'));escogerModo(modo.value);
 function mostrarSeleccion(){tarjetaDigitos.hidden=modo.value==='rango';seleccion.querySelector('.limites-mayor').hidden=modo.value!=='rango';}
 modo.addEventListener('change',mostrarSeleccion);settings.addEventListener('input',()=>{if(modo.value==='rango'){tarjetaDigitos.hidden=true;seleccion.querySelector('.limites-mayor').hidden=false;}});modo.addEventListener('input',mostrarSeleccion);mostrarSeleccion();
 function validarRango(){maximo.setCustomValidity('');if(modo.value==='rango'&&(!minimo.checkValidity()||!maximo.checkValidity()||+maximo.value<=+minimo.value)){maximo.setCustomValidity(IdiomaVoz.idioma==='en'?'Maximum must be greater than minimum.':'El máximo debe ser mayor que el mínimo.');maximo.reportValidity();return false;}return true;}
 aceptar.onclick=()=>{if(validarRango())settings.close();};settings.querySelector('.cerrar-configuracion-mayor').onclick=aceptar.onclick;settings.addEventListener('cancel',e=>{if(!validarRango())e.preventDefault();});
 settings.addEventListener('close',()=>mostrarSeleccion());

 setCountButtonState(saved.cantidad||1);setDigitButtonState(saved.digitos||1);helpMode=saved.ayuda===true;help.checked=helpMode;read.checked=saved.lectura!==false;
 function guardar(){window.seleccionNumerosMayor={modo:modo.value,min:Math.floor(+minimo.value),max:Math.floor(+maximo.value)};try{localStorage.setItem(key,JSON.stringify({cantidad:exercisesPerPage,digitos:selectedDigits,ayuda:helpMode,lectura:read.checked,modoNumeros:modo.value,minimo:+minimo.value,maximo:+maximo.value}));}catch{}}
 function aplicar(){if(aplicandoDialogo)return;guardar();if(app.classList.contains('jugando')){cancelarArrastre();newPage();}}
 document.querySelectorAll('.count-btn,.digit-btn').forEach(e=>e.addEventListener('click',aplicar));help.addEventListener('change',()=>{helpMode=help.checked;aplicar();});read.addEventListener('change',()=>{if(!read.checked)clearSpeech();aplicar();});document.getElementById('nameInput').addEventListener('change',aplicar);
 const oldStart=window.startGameValidated;
 window.startGameValidated=()=>{oldStart();if(game.style.display!=='none'){menu.style.display='';app.classList.add('jugando');if(settings.open)settings.close();tools.scrollTop=0;ajustar();}};
 window.goMenu=abrirConfiguracion;
 IdiomaVoz.instalar('#preferenciasIdiomaVoz',{cambioIdioma:()=>{clearSpeech();if(app.classList.contains('jugando'))newPage();}});
 preferences.addEventListener('change',e=>{if(['vozElegida','velocidadVoz'].includes(e.target.id)&&app.classList.contains('jugando'))newPage();});
 let pending=false;
 function ajustar(){
  pending=false;const scale=app.getBoundingClientRect().width/app.offsetWidth||1,alto=(window.visualViewport?.height||innerHeight)/scale,ancho=innerWidth/scale;
  app.style.setProperty('--alto-vista',alto+'px');const inverso=String(1/scale);if(document.body.style.getPropertyValue('--inverso-mayor')!==inverso)document.body.style.setProperty('--inverso-mayor',inverso);app.dataset.orientacion=innerWidth>innerHeight?'horizontal':'vertical';app.classList.toggle('compacta',alto<570||ancho<600);app.classList.toggle('muy-compacta',alto<330||ancho<270);
  if(alto<330||ancho<270){if(hint.parentElement!==tools)tools.append(hint);}else if(hint.parentElement===tools)marcaHint.after(hint);
  grid.dataset.cantidad=exercises.length;
  // Ajustar la fuente al texto real, sin comprimir ni cortar cifras.
  const canvas=ajustar.canvas||(ajustar.canvas=document.createElement('canvas')),ctx=canvas.getContext('2d');
  const cards=[...grid.querySelectorAll('.exercise-card')],naturales=cards.map(card=>Math.min(260,Math.max(140,card.getBoundingClientRect().width/scale*.75)));
  if(app.dataset.orientacion==='vertical'){
   const estiloTools=getComputedStyle(tools),visibles=[...tools.children].filter(e=>getComputedStyle(e).display!=='none');
   const natural=visibles.reduce((total,e)=>{const s=getComputedStyle(e);return total+e.getBoundingClientRect().height/scale+(parseFloat(s.marginTop)||0)+(parseFloat(s.marginBottom)||0);},0)+Math.max(0,visibles.length-1)*(parseFloat(estiloTools.rowGap)||0)+(parseFloat(estiloTools.paddingTop)||0)+(parseFloat(estiloTools.paddingBottom)||0)+4;
   // Primero ceder el aire del ejercicio; conservar una altura útil por comparación.
   const reservaJuego=125+Math.max(1,cards.length)*100;
   const disponible=app.clientHeight-24;
   const altura=Math.max(90,Math.min(natural,disponible-reservaJuego));
   app.style.setProperty('--alto-herramientas-mayor',altura+'px');
  }
  const filas=app.dataset.orientacion==='vertical'?Math.max(1,cards.length):(cards.length>2?2:1);grid.style.setProperty('--alto-conjunto',Math.max(0,...naturales)*filas+(filas-1)*parseFloat(getComputedStyle(grid).rowGap)+'px');
  for(const [i,card] of cards.entries()){
   card.style.setProperty('--altura-natural',naturales[i]+'px');
   card.style.setProperty('--alto-caja',Math.min(94,...[...card.querySelectorAll('.drop-box')].map(e=>e.getBoundingClientRect().width/scale*.75))+'px');
   const interiores=[...card.querySelectorAll('.drop-box-inner')].map(e=>e.getBoundingClientRect());
   const anchoFicha=Math.max(1,Math.min(160,...interiores.map(r=>r.width/scale-4))),altoFicha=Math.max(1,Math.min(64,anchoFicha*.6,...interiores.map(r=>r.height/scale-2)));
   card.style.setProperty('--alto-ficha',altoFicha+'px');card.style.setProperty('--ancho-ficha',anchoFicha+'px');
   const numeros=[...card.querySelectorAll('.bank-chip,.drop-value')],texto=numeros.map(e=>e.textContent).sort((a,b)=>b.length-a.length)[0]||'0';
   ctx.font='900 100px Verdana';const anchoTexto=ctx.measureText(texto).width/100;
   const size=Math.max(1,Math.min(44,...numeros.map(el=>{const box=el.getBoundingClientRect(),s=getComputedStyle(el),padding=(parseFloat(s.paddingLeft)||0)+(parseFloat(s.paddingRight)||0);return Math.min((box.width/scale-padding-4)/anchoTexto,(box.height/scale-3)*.72);})));for(const el of numeros)el.style.fontSize=size+'px';
  }
 }
 function programar(){if(!pending){pending=true;requestAnimationFrame(ajustar);}}
 const ro=new ResizeObserver(programar);for(const e of [app,game,grid,tools])ro.observe(e);
 new MutationObserver(programar).observe(grid,{childList:true,subtree:true});new MutationObserver(programar).observe(document.body,{attributes:true,attributeFilter:['style']});
 window.addEventListener('resize',programar);window.visualViewport?.addEventListener('resize',programar);document.addEventListener('fullscreenchange',programar);document.fonts?.ready.then(programar);ajustar();
 function cancelarArrastre(){if(dragItemId===null)return;ghost.style.display='none';document.removeEventListener('pointermove',moveGhost);document.removeEventListener('pointerup',endDrag);dragItemId=null;dragValue=null;dragOrigin=null;dragSourceExercise=null;}
 document.addEventListener('pointercancel',cancelarArrastre);window.addEventListener('resize',cancelarArrastre);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelarArrastre();clearSpeech();}});
 const nombreInput=document.getElementById('nameInput');if(!nombreInput.value.trim())nombreInput.value=obtenerNombreGuardado()||'Gabriel';
 window.startGameValidated();menu.querySelector('.start-btn').remove();
});
