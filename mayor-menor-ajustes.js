'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const app=document.getElementById('app'),menu=document.getElementById('menuScreen'),game=document.getElementById('gameScreen'),grid=document.getElementById('exercisesGrid');
 const tools=document.createElement('aside');tools.className='herramientas-mayor';app.prepend(tools);tools.append(menu);
 const title=document.getElementById('gameTitle'),intro=title.nextElementSibling;tools.prepend(title,intro);
 const settings=document.createElement('details');settings.className='configuracion-mayor';settings.open=true;settings.innerHTML='<summary>⚙ Configuración</summary>';tools.append(settings);settings.append(menu);
 const preferences=document.createElement('div');preferences.className='config-card';preferences.innerHTML='<section id="preferenciasIdiomaVoz"></section><label class="opcion-mayor"><input id="ayudaComparacion" type="checkbox"> Mostrar ayuda en las cajas</label><label class="opcion-mayor"><input id="lecturaComparacion" type="checkbox" checked> Leer comparaciones y respuestas</label>';menu.append(preferences,menu.querySelector('.start-btn'));
 const top=game.querySelector('.top-bar');top.querySelector('.menu').remove();tools.append(top);
 const secondary=document.createElement('div');secondary.className='acciones-secundarias';for(const e of [...game.querySelector('.actions').children])if(e.id!=='checkBtn')secondary.append(e);tools.append(secondary);
 secondary.querySelector('.new').textContent='🔄 Nueva ronda';
 game.querySelector('.footer-credit').remove();menu.querySelector('p[style]')?.remove();tools.append(document.getElementById('creditos-aplicaciones'));
 const instruction=document.createElement('h2');instruction.className='instruccion-mayor';instruction.textContent='Completa las comparaciones.';game.prepend(instruction);
 const hint=document.getElementById('hintBar'),marcaHint=document.createComment('mensaje de la actividad');hint.before(marcaHint);
 const key='mayorMenor.config.v1',help=document.getElementById('ayudaComparacion'),read=document.getElementById('lecturaComparacion');
 let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
 setCountButtonState(saved.cantidad||1);setDigitButtonState(saved.digitos||1);helpMode=saved.ayuda===true;help.checked=helpMode;read.checked=saved.lectura!==false;
 function guardar(){try{localStorage.setItem(key,JSON.stringify({cantidad:exercisesPerPage,digitos:selectedDigits,ayuda:helpMode,lectura:read.checked}));}catch{}}
 function aplicar(){guardar();if(app.classList.contains('jugando')){cancelarArrastre();newPage();}}
 document.querySelectorAll('.count-btn,.digit-btn').forEach(e=>e.addEventListener('click',aplicar));help.addEventListener('change',()=>{helpMode=help.checked;aplicar();});read.addEventListener('change',()=>{if(!read.checked)clearSpeech();aplicar();});document.getElementById('nameInput').addEventListener('change',aplicar);
 const oldStart=window.startGameValidated;
 window.startGameValidated=()=>{oldStart();if(game.style.display!=='none'){menu.style.display='';app.classList.add('jugando');settings.open=false;tools.scrollTop=0;ajustar();}};
 window.goMenu=()=>{settings.open=true;settings.scrollIntoView({block:'nearest'});};
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
  const filas=cards.length>2?2:1;grid.style.setProperty('--alto-conjunto',Math.max(0,...naturales)*filas+(filas-1)*parseFloat(getComputedStyle(grid).rowGap)+'px');
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
