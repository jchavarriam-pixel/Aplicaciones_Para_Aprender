'use strict';
(()=>{
 const datos={
  tamano:{es:['Tamaño','Pequeño','Grande','El cuadrado pasa de pequeño a grande.'],en:['Size','Small','Big','The square changes from small to big.']},
  grosor:{es:['Grosor','Delgado','Grueso','El rectángulo pasa de delgado a grueso.'],en:['Thickness','Thin','Thick','The rectangle changes from thin to thick.']},
  longitud:{es:['Longitud','Corto','Largo','El rectángulo pasa de corto a largo.'],en:['Length','Short','Long','The rectangle changes from short to long.']},
  tono:{es:['Tono de color','Claro','Oscuro','El rectángulo pasa de claro a oscuro.'],en:['Colour shade','Light','Dark','The rectangle changes from light to dark.']},
  inclinacion:{es:['Inclinación','Derecho','Inclinado','El rectángulo pasa de derecho a inclinado.'],en:['Tilt','Upright','Tilted','The rectangle changes from upright to tilted.']},
  lados:{es:['Número de lados','3 lados','8 lados','La figura pasa de tener tres lados a tener ocho lados.'],en:['Number of sides','3 sides','8 sides','The shape changes from three sides to eight sides.']},
  altura:{es:['Altura','Bajo','Alto','El rectángulo pasa de bajo a alto.'],en:['Height','Short','Tall','The rectangle changes from short to tall.']},
  anchura:{es:['Anchura','Estrecho','Ancho','El rectángulo pasa de estrecho a ancho.'],en:['Width','Narrow','Wide','The rectangle changes from narrow to wide.']}
 };
 const en=()=>IdiomaVoz.idioma==='en',texto=(es,ingles)=>en()?ingles:es;
 const boton=document.createElement('button');boton.id='verAnimacion';boton.className='boton secundaria';boton.textContent='↻ Animación';document.querySelector('.reto').append(boton);
 Object.assign(window.TEXTOS_INGLES,{'Animación':'Animation','Ajustar ancho de la barra de herramientas':'Resize the toolbar'});
 const modal=document.createElement('dialog');modal.className='animacion-criterio';modal.setAttribute('aria-labelledby','tituloDemo');
 modal.innerHTML='<header><h2 id="tituloDemo"></h2><button type="button" id="cerrarDemo" class="boton secundaria">✕</button></header><div id="criterioDemo" class="botones-animacion" role="group"></div><p id="explicacionDemo"></p><div class="extremos-demo"><span id="inicioDemo"></span><span id="finDemo"></span></div><div class="modo-demostracion"><button id="modoFiguras" type="button"></button><button id="modoEjemplo" type="button"></button></div><p id="instruccionEjemplo" hidden></p><div class="escena-demo" id="escenaDemo"></div><p id="medidaEjemplo"></p><label id="avanceDemoLabel" for="avanceDemo"></label><input id="avanceDemo" type="range" min="0" max="100" value="0"><div class="controles-demo"><button id="repetirDemo" class="boton principal"></button><button id="pausaDemo" class="boton secundaria"></button><button id="leerDemo" class="boton secundaria">🔊</button></div>';
 document.body.append(modal);
 const q=id=>modal.querySelector('#'+id);let frame=0,inicio=0,progreso=0,activo=false,ultimo=0,criterioElegido='tamano',ejemplo=false;
 function objeto(id,p,x,referencia=false){
  if(ejemplo)return EjemplosOrdenar.figura(id,p,x);
  let figura='',color='#f6b944';
  if(id==='inclinacion')figura=`<path d="M${x} 260V75" stroke="#6985a4" stroke-width="3" stroke-dasharray="7 6"/><g transform="rotate(${p*48} ${x} 260)"><rect x="${x-14}" y="85" width="28" height="175" rx="9" fill="#8276dd" stroke="#4c4788" stroke-width="4"/><circle cx="${x}" cy="98" r="5" fill="#fff5b6"/></g>`;
  else if(id==='lados'){
   const n=3+Math.min(5,Math.floor(p*6)),r=78,pts=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[x+Math.cos(a)*r,175+Math.sin(a)*r].join(',')}).join(' ');
   figura=`<polygon points="${pts}" fill="#ffd477" stroke="#a67523" stroke-width="5"/><text x="${x}" y="187" text-anchor="middle" class="demo-numero">${n}</text>`;
  }else{
   let w=90,h=100;
   if(id==='tamano'){w=55+p*90;h=w;}
   if(id==='grosor'){w=24+p*72;h=140;color='#c39bea';}
   if(id==='longitud'){w=45+p*140;h=36;color='#6bc7b1';}
   if(id==='altura'){w=80;h=55+p*125;color='#71acd9';}
   if(id==='anchura'){w=40+p*130;h=100;color='#eaa078';}
   if(id==='tono')color=`hsl(212 65% ${87-p*58}%)`;
   figura=`<rect x="${x-w/2}" y="${260-h}" width="${w}" height="${h}" rx="12" fill="${color}" stroke="#47617e" stroke-width="3"/><path d="M${x-w/2+9} ${260-h+12}h${Math.max(5,w-18)}" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>`;
  }
  return `<g class="${referencia?'demo-referencia':''}">${figura}</g>`;
 }
 function dibujar(p){progreso=p;q('avanceDemo').value=String(Math.round(p*100));const id=criterioElegido;
  const d=datos[id][en()?'en':'es'],etiqueta=id==='lados'?(3+Math.min(5,Math.floor(p*6)))+' '+texto('lados','sides'):p===0?d[1]:p===1?d[2]:d[1]+' → '+d[2];
  q('medidaEjemplo').textContent=ejemplo?EjemplosOrdenar.frase(id,p,en()):'';
  q('escenaDemo').innerHTML=`<svg viewBox="0 0 600 300" role="img" aria-label="${texto('Demostración visual','Visual demonstration')}"><path d="M25 262H575" stroke="#9cb4cc" stroke-width="3"/>${objeto(id,0,135,true)}<path d="M250 170h45m-10-10 10 10-10 10" fill="none" stroke="#6a86ae" stroke-width="4" stroke-linecap="round"/>${objeto(id,p,420)}<text x="135" y="288" text-anchor="middle" class="etiqueta-figura">${d[1]}</text><text x="420" y="288" text-anchor="middle" class="etiqueta-figura">${etiqueta}</text></svg>`;
 }
 function parar(){cancelAnimationFrame(frame);activo=false;q('pausaDemo').textContent=texto('▶ Continuar','▶ Continue');}
 function tick(t){if(!activo||!modal.open)return;const p=Math.min(1,(t-inicio)/6500);if(t-ultimo>40||p===1){dibujar(p);ultimo=t;}if(p<1)frame=requestAnimationFrame(tick);else parar();}
 function reproducir(desde=0){cancelAnimationFrame(frame);if(desde===0)hablar(ejemplo&&criterioElegido==='altura'?texto('El árbol crece: pasa de bajo a alto.','The tree grows from short to tall.'):ejemplo?texto('Cambia de ','It changes from ')+datos[criterioElegido][en()?'en':'es'][1].toLowerCase()+texto(' a ',' to ')+datos[criterioElegido][en()?'en':'es'][2].toLowerCase()+'.':datos[criterioElegido][en()?'en':'es'][3]);activo=true;inicio=performance.now()-desde*6500;ultimo=0;q('pausaDemo').textContent=texto('Ⅱ Pausa','Ⅱ Pause');frame=requestAnimationFrame(tick);}
 function preparar(){parar();q('criterioDemo').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.criterio===criterioElegido)));const d=datos[criterioElegido][en()?'en':'es'];q('explicacionDemo').textContent=ejemplo?(criterioElegido==='altura'?texto('El árbol crece: pasa de bajo a alto.','The tree grows from short to tall.'):texto('Cambia de ','It changes from ')+d[1].toLowerCase()+texto(' a ',' to ')+d[2].toLowerCase()+'.'):d[3];q('inicioDemo').textContent=d[1];q('finDemo').textContent=d[2];dibujar(0);reproducir();}
 boton.onclick=()=>{
  q('leerDemo').disabled=!config.voz;
  q('modoFiguras').setAttribute('aria-pressed',String(!ejemplo));q('modoEjemplo').setAttribute('aria-pressed',String(ejemplo));q('instruccionEjemplo').hidden=!ejemplo;
  q('modoFiguras').textContent=texto('Figuras','Shapes');q('modoEjemplo').textContent=texto('Ver ejemplo','See an example');q('instruccionEjemplo').textContent=texto('Arrastra sobre la imagen o mueve el deslizador para cambiarla.','Drag over the picture or move the slider to change it.');
  q('tituloDemo').textContent=texto('¡Mira cómo cambia!','Watch it change!');q('cerrarDemo').setAttribute('aria-label',texto('Cerrar animación','Close animation'));
  q('criterioDemo').setAttribute('aria-label',texto('Característica de la animación','Animation characteristic'));
  q('criterioDemo').innerHTML=Object.entries(datos).map(([id,d])=>`<button type="button" data-criterio="${id}" aria-pressed="false">${d[en()?'en':'es'][0]}</button>`).join('');criterioElegido=criterioActual?.id||'tamano';
  q('avanceDemoLabel').textContent=texto('Desliza para explorar el cambio','Slide to explore the change');q('repetirDemo').textContent=texto('↻ Animación','↻ Animation');q('leerDemo').setAttribute('aria-label',texto('Leer explicación','Read explanation'));
  modal.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));modal.showModal();preparar();
 };
 q('cerrarDemo').onclick=()=>modal.close();modal.addEventListener('close',()=>{parar();if('speechSynthesis'in window)speechSynthesis.cancel();});q('criterioDemo').onclick=e=>{const b=e.target.closest('[data-criterio]');if(b){criterioElegido=b.dataset.criterio;preparar();}};q('repetirDemo').onclick=()=>reproducir();q('pausaDemo').onclick=()=>activo?parar():reproducir(progreso===1?0:progreso);q('avanceDemo').oninput=e=>{parar();dibujar(+e.target.value/100);};q('leerDemo').onclick=()=>hablar(ejemplo&&criterioElegido==='altura'?EjemplosOrdenar.frase(criterioElegido,progreso,en()):q('explicacionDemo').textContent);
 function modo(valor){ejemplo=valor;q('modoFiguras').setAttribute('aria-pressed',String(!valor));q('modoEjemplo').setAttribute('aria-pressed',String(valor));q('instruccionEjemplo').hidden=!valor;preparar();}
 q('modoFiguras').onclick=()=>modo(false);q('modoEjemplo').onclick=()=>modo(true);
 const escena=q('escenaDemo');escena.style.touchAction='none';
 function arrastrar(e){if(!ejemplo)return;parar();const r=escena.getBoundingClientRect();const p=criterioElegido==='altura'||criterioElegido==='tamano'?1-(e.clientY-r.top)/r.height:(e.clientX-r.left)/r.width;dibujar(Math.max(0,Math.min(1,p)));}
 escena.addEventListener('pointerdown',e=>{if(!ejemplo)return;e.preventDefault();escena.setPointerCapture(e.pointerId);arrastrar(e);});escena.addEventListener('pointermove',e=>{if(escena.hasPointerCapture(e.pointerId))arrastrar(e);});
 escena.addEventListener('pointerup',e=>{if(!escena.hasPointerCapture(e.pointerId))return;escena.releasePointerCapture(e.pointerId);if(ejemplo)hablar(EjemplosOrdenar.frase(criterioElegido,progreso,en()));});
 q('avanceDemo').addEventListener('change',()=>{if(ejemplo)hablar(EjemplosOrdenar.frase(criterioElegido,progreso,en()));});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&modal.open)parar();});
})();
