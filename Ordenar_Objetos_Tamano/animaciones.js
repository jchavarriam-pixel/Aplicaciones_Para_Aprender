'use strict';
(()=>{
 const datos={
  tamano:{es:['Tamaño','Pequeño','Grande','El objeto crece: aumentan juntos su altura y su anchura.'],en:['Size','Small','Big','The object grows: its height and width increase together.']},
  grosor:{es:['Grosor','Delgado','Grueso','La vela se hace más gruesa. Su altura se mantiene igual.'],en:['Thickness','Thin','Thick','The candle becomes thicker. Its height stays the same.']},
  longitud:{es:['Longitud','Corto','Largo','La cinta se alarga. Observa cómo aumenta la distancia entre sus extremos.'],en:['Length','Short','Long','The ribbon gets longer. Watch the distance between its ends increase.']},
  tono:{es:['Tono de color','Claro','Oscuro','El mismo objeto cambia de un tono claro a uno oscuro. Su tamaño no cambia.'],en:['Colour shade','Light','Dark','The same object changes from a light shade to a dark shade. Its size stays the same.']},
  inclinacion:{es:['Inclinación','Derecho','Inclinado','El poste empieza derecho y se inclina poco a poco. La línea punteada señala su posición inicial.'],en:['Tilt','Upright','Tilted','The post starts upright and slowly tilts. The dashed line shows its starting position.']},
  lados:{es:['Número de lados','3 lados','8 lados','Cuenta los lados. Cada figura tiene un lado más que la anterior.'],en:['Number of sides','3 sides','8 sides','Count the sides. Each shape has one more side than the previous shape.']},
  altura:{es:['Altura','Bajo','Alto','La torre se hace más alta desde la misma base. Su anchura se mantiene igual.'],en:['Height','Short','Tall','The tower gets taller from the same baseline. Its width stays the same.']},
  anchura:{es:['Anchura','Estrecho','Ancho','La caja se hace más ancha. Su altura se mantiene igual.'],en:['Width','Narrow','Wide','The box gets wider. Its height stays the same.']}
 };
 const en=()=>IdiomaVoz.idioma==='en',texto=(es,ingles)=>en()?ingles:es;
 const boton=document.createElement('button');boton.id='verAnimacion';boton.className='boton secundaria';boton.textContent='↻ Animación';document.querySelector('.reto').append(boton);
 Object.assign(window.TEXTOS_INGLES,{'Animación':'Animation','Ajustar ancho de la barra de herramientas':'Resize the toolbar'});
 const modal=document.createElement('dialog');modal.className='animacion-criterio';modal.setAttribute('aria-labelledby','tituloDemo');
 modal.innerHTML='<header><h2 id="tituloDemo"></h2><button type="button" id="cerrarDemo" class="boton secundaria">✕</button></header><select id="criterioDemo"></select><p id="explicacionDemo"></p><div class="extremos-demo"><span id="inicioDemo"></span><span id="finDemo"></span></div><div class="escena-demo" id="escenaDemo"></div><label id="avanceDemoLabel" for="avanceDemo"></label><input id="avanceDemo" type="range" min="0" max="100" value="0"><div class="controles-demo"><button id="repetirDemo" class="boton principal"></button><button id="pausaDemo" class="boton secundaria"></button><button id="leerDemo" class="boton secundaria">🔊</button></div>';
 document.body.append(modal);
 const q=id=>modal.querySelector('#'+id);let frame=0,inicio=0,progreso=0,activo=false,ultimo=0;
 function objeto(id,p,x,referencia=false){
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
   if(id==='grosor')figura+=`<path d="M${x} 120v-15" stroke="#66534b" stroke-width="4"/><path d="M${x} 105q-18-12 0-30q18 18 0 30" fill="#ffc651"/>`;
   if(id==='longitud')for(let i=1;i<w/20;i++)figura+=`<path d="M${x-w/2+i*20} 260v-12" stroke="#34695d" stroke-width="2"/>`;
  }
  return `<g class="${referencia?'demo-referencia':''}">${figura}</g>`;
 }
 function dibujar(p){progreso=p;q('avanceDemo').value=String(Math.round(p*100));const id=q('criterioDemo').value;
  q('escenaDemo').innerHTML=`<svg viewBox="0 0 600 300" role="img" aria-label="${texto('Demostración visual','Visual demonstration')}"><path d="M25 262H575" stroke="#9cb4cc" stroke-width="3"/>${objeto(id,0,135,true)}<path d="M250 170h45m-10-10 10 10-10 10" fill="none" stroke="#6a86ae" stroke-width="4" stroke-linecap="round"/>${objeto(id,p,420)}</svg>`;
 }
 function parar(){cancelAnimationFrame(frame);activo=false;q('pausaDemo').textContent=texto('▶ Continuar','▶ Continue');}
 function tick(t){if(!activo||!modal.open)return;const p=Math.min(1,(t-inicio)/6500);if(t-ultimo>40||p===1){dibujar(p);ultimo=t;}if(p<1)frame=requestAnimationFrame(tick);else parar();}
 function reproducir(desde=0){cancelAnimationFrame(frame);activo=true;inicio=performance.now()-desde*6500;ultimo=0;q('pausaDemo').textContent=texto('Ⅱ Pausa','Ⅱ Pause');frame=requestAnimationFrame(tick);}
 function preparar(){parar();const d=datos[q('criterioDemo').value][en()?'en':'es'];q('explicacionDemo').textContent=d[3];q('inicioDemo').textContent=d[1];q('finDemo').textContent=d[2];dibujar(0);reproducir();}
 boton.onclick=()=>{
  q('tituloDemo').textContent=texto('¡Mira cómo cambia!','Watch it change!');q('cerrarDemo').setAttribute('aria-label',texto('Cerrar animación','Close animation'));
  q('criterioDemo').setAttribute('aria-label',texto('Característica de la animación','Animation characteristic'));
  q('criterioDemo').innerHTML=Object.entries(datos).map(([id,d])=>`<option value="${id}">${d[en()?'en':'es'][0]}</option>`).join('');q('criterioDemo').value=criterioActual?.id||'tamano';
  q('avanceDemoLabel').textContent=texto('Desliza para explorar el cambio','Slide to explore the change');q('repetirDemo').textContent=texto('↻ Animación','↻ Animation');q('leerDemo').setAttribute('aria-label',texto('Leer explicación','Read explanation'));
  modal.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));modal.showModal();preparar();
 };
 q('cerrarDemo').onclick=()=>modal.close();modal.addEventListener('close',parar);q('criterioDemo').onchange=preparar;q('repetirDemo').onclick=()=>reproducir();q('pausaDemo').onclick=()=>activo?parar():reproducir(progreso===1?0:progreso);q('avanceDemo').oninput=e=>{parar();dibujar(+e.target.value/100);};q('leerDemo').onclick=()=>hablar(q('explicacionDemo').textContent);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&modal.open)parar();});
})();
