'use strict';
const familias=window.ORDENAR_FAMILIAS,criterios=window.ORDENAR_CRITERIOS;
const $=id=>document.getElementById(id),clave='ordenarObjetosTamano.config.v1';
let config={cantidad:3,criterio:'tamano',sentido:'descendente',familia:'azar',voz:true,posiciones:true,guiaVisual:true},nombre='Gabriel';
try{
 const s=JSON.parse(localStorage.getItem(clave)||'null');
 if(s&&typeof s==='object'){
  if([2,3,4,5,6].includes(s.cantidad))config.cantidad=s.cantidad;
  if(s.criterio==='mixto'||criterios.some(c=>c.id===s.criterio))config.criterio=s.criterio;
  if(['descendente','ascendente','mixto'].includes(s.sentido))config.sentido=s.sentido;
  if(s.familia==='azar'||familias.some(f=>f.id===s.familia))config.familia=s.familia;
  for(const k of ['voz','posiciones','guiaVisual'])if(typeof s[k]==='boolean')config[k]=s[k];
 }
 nombre=localStorage.getItem('nombreNinoGabrielApps')?.trim()||nombre;
}catch{}
let ronda=0,actual=null,criterioActual=null,ascendenteActual=false,piezasActuales=[],mazoCriterios=[],ultimoCriterio=null;
const mazosFamilias=new Map(),ultimasFamilias=new Map();
let seleccion=null,drag=null,resuelto=false,listo=false,cantidad=3,premioTimer,ignorarClickHasta=0;
function mezclar(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function guardar(){try{localStorage.setItem(clave,JSON.stringify(config));}catch{}}
function hablar(texto){if(!config.voz||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(texto);u.lang='es-ES';u.rate=.9;u.voice=speechSynthesis.getVoices().find(v=>/^es[-_]/i.test(v.lang))||null;speechSynthesis.speak(u);}
function sacarMazo(pool,restantes,ultimo){const mazo=restantes.length?[...restantes]:mezclar(pool);if(!restantes.length&&mazo.length>1&&mazo[0].id===ultimo)[mazo[0],mazo[1]]=[mazo[1],mazo[0]];return {elemento:mazo.shift(),restantes:mazo};}
function siguienteFamilia(){
 let c=config.criterio;
 if(c==='mixto'){const m=sacarMazo(criterios,mazoCriterios,ultimoCriterio);mazoCriterios=m.restantes;c=m.elemento.id;ultimoCriterio=c;}
 const pool=familias.filter(f=>f.criterio===c);
 if(config.criterio!=='mixto'&&config.familia!=='azar'){const f=pool.find(f=>f.id===config.familia);if(f)return f;}
 const m=sacarMazo(pool,mazosFamilias.get(c)||[],ultimasFamilias.get(c));mazosFamilias.set(c,m.restantes);ultimasFamilias.set(c,m.elemento.id);return m.elemento;
}
function actualizarFamilias(){
 const mixto=config.criterio==='mixto',pool=familias.filter(f=>f.criterio===config.criterio);
 if(!mixto&&config.familia!=='azar'&&!pool.some(f=>f.id===config.familia))config.familia='azar';
 $('familia').innerHTML=`<option value="azar">${mixto?'Variar con cada criterio':'Variar en cada ronda'}</option>`+pool.map(f=>`<option value="${f.id}">${f.nombre}</option>`).join('');
 $('familia').value=mixto?'azar':config.familia;$('familia').disabled=mixto;
}
function instruccion(){return criterioActual?(ascendenteActual?criterioActual.asc:criterioActual.desc):'';}
function indicesDeSerie(n){return Array.from({length:n},(_,i)=>Math.round(i*5/(n-1)));}
function guiaSVG(masters,tipo){
 const step=88,width=step*masters.length;
 const glyphs=masters.map((r,i)=>{
  const x=step*i+44,y=72;let shape='';
  if(tipo==='tamano')shape=`<circle cx="${x}" cy="${y-(27-r*3)}" r="${27-r*3}"/>`;
  else if(tipo==='tono')shape=`<circle cx="${x}" cy="47" r="22" fill="hsl(210 65% ${22+r*12}%)" stroke="#53758e"/>`;
  else if(tipo==='grosor'||tipo==='anchura')shape=`<rect x="${x-(44-r*6)/2}" y="22" width="${44-r*6}" height="50" rx="6"/>`;
  else if(tipo==='altura')shape=`<rect x="${x-12}" y="${y-(52-r*7)}" width="24" height="${52-r*7}" rx="5"/>`;
  else if(tipo==='longitud')shape=`<rect x="${x-(54-r*7)/2}" y="45" width="${54-r*7}" height="17" rx="6"/>`;
  else if(tipo==='inclinacion')shape=`<path d="M${x} 72V27" transform="rotate(${65-r*13} ${x} 72)" stroke="#d29432" stroke-width="10"/>`;
  else{const n=8-r,pts=Array.from({length:n},(_,j)=>`${x+24*Math.cos(-Math.PI/2+2*Math.PI*j/n)},${48+24*Math.sin(-Math.PI/2+2*Math.PI*j/n)}`).join(' ');shape=`<polygon points="${pts}"/>`;}
  const arrow=i<masters.length-1?`<path d="M${x+32} 32h24m-6-5 6 5-6 5" stroke="#53758e" stroke-width="3" fill="none"/>`:'';
  return `<g>${shape}${arrow}</g>`;
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 88" aria-hidden="true" focusable="false"><g fill="#f0b348" stroke="#bc7b22" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${glyphs}</g></svg>`;
}
function actualizarAyudas(){
 $('escuchar').hidden=!config.voz;document.querySelectorAll('.posicion').forEach(el=>el.hidden=!config.posiciones);
 $('ayudaVisual').hidden=!config.guiaVisual;const lateral=document.querySelector('.guia');lateral.classList.toggle('sin-dibujo',!config.guiaVisual);
 const anterior=lateral.querySelector('svg');if(!actual){if(anterior)anterior.hidden=!config.guiaVisual;return;}
 const masters=piezasActuales.map(p=>p.master);
 $('textoGuia').textContent='Guía visual · '+instruccion();$('dibujoGuia').setAttribute('aria-label',instruccion());$('dibujoGuia').innerHTML=guiaSVG(masters,actual.criterio);
 if(anterior){const mini=masters.length<=3?masters:[masters[0],masters[Math.floor((masters.length-1)/2)],masters.at(-1)];anterior.outerHTML=guiaSVG(mini,actual.criterio);lateral.querySelector('svg').hidden=!config.guiaVisual;}
 const li=lateral.querySelectorAll('li');li[0].innerHTML='<b>1</b> Observa '+(actual.criterio==='lados'?'los lados.':'las diferencias.');li[1].innerHTML='<b>2</b> Sigue el orden indicado.';li[2].innerHTML='<b>3</b> Coloca y revisa.';
}
function actualizarColumnas(){
 const juego=document.querySelector('.juego'),ancho=juego.clientWidth-60;let cols=cantidad;
 if(ancho/cantidad<110)cols=cantidad===4?2:Math.min(cantidad,3);
 if(juego.style.getPropertyValue('--columnas')!==String(cols))juego.style.setProperty('--columnas',cols);
 juego.style.setProperty('--columnas-movil',Math.min(cantidad,3));
}
function nuevaRonda(reintento=false){
 if(drag)terminarArrastre(null,true);if('speechSynthesis'in window)speechSynthesis.cancel();limpiarPremio();ronda++;
 if(!reintento||!actual){actual=siguienteFamilia();cantidad=config.cantidad;criterioActual=criterios.find(c=>c.id===actual.criterio);ascendenteActual=config.sentido==='ascendente'||config.sentido==='mixto'&&ronda%2===0;}
 seleccion=null;resuelto=false;listo=false;
 let masters=indicesDeSerie(cantidad);if(ascendenteActual)masters.reverse();
 piezasActuales=masters.map((master,rank)=>({rank,master,src:actual.archivo||actual.imagenes[master],escala:actual.archivo?1-master*.132:1}));
 actualizarColumnas();$('familiaActual').textContent=`${criterioActual.nombre} · ${actual.nombre} · ${cantidad} objetos`;
 $('tituloReto').textContent=instruccion();const first=ascendenteActual?criterioActual.fin:criterioActual.inicio,last=ascendenteActual?criterioActual.inicio:criterioActual.fin;
 $('sentidoActual').textContent=`${first} → ${last}`;$('otraRonda').hidden=true;$('revisar').disabled=true;$('reintentar').hidden=true;$('mensaje').className='mensaje';$('mensaje').textContent='Cargando las imágenes…';
 let orden=mezclar(piezasActuales);if(orden.every((p,i)=>p.rank===i))orden.push(orden.shift());
 $('banco').innerHTML=orden.map((p,i)=>`<div class="casilla" data-zona="banco" data-pos="${i}" tabindex="0" role="group" aria-label="Espacio disponible ${i+1}"><button class="pieza" data-rank="${p.rank}" data-master="${p.master}" style="--escala:${p.escala}" aria-label="Seleccionar objeto de ${actual.nombre}" aria-pressed="false" disabled><img src="${p.src}" alt="${actual.nombre}" draggable="false"></button></div>`).join('');
 $('orden').innerHTML=Array.from({length:cantidad},(_,i)=>`<div class="casilla" data-zona="orden" data-pos="${i}" tabindex="0" role="group" aria-label="Posición ${i+1} de ${cantidad}"><span class="posicion" ${config.posiciones?'':'hidden'}>${i+1}</span></div>`).join('');
 document.querySelectorAll('.pieza').forEach(el=>el.addEventListener('pointerdown',empezarArrastre));actualizarAyudas();
 const turno=ronda;
 Promise.all([...new Set(piezasActuales.map(p=>p.src))].map(src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=src;}))).then(()=>{
  if(turno!==ronda)return;listo=true;document.querySelectorAll('.pieza').forEach(e=>e.disabled=false);$('mensaje').textContent='Coloca los objetos de izquierda a derecha. '+instruccion()+'.';hablar('Ordena los objetos. '+instruccion()+'.');
 }).catch(()=>{if(turno!==ronda)return;listo=false;$('mensaje').textContent='No se pudo cargar una imagen. Toca Reintentar.';$('reintentar').hidden=false;});
}
function seleccionar(el){document.querySelectorAll('.pieza.seleccionada').forEach(p=>{p.classList.remove('seleccionada');p.setAttribute('aria-pressed','false');});seleccion=el;if(el){el.classList.add('seleccionada');el.setAttribute('aria-pressed','true');$('mensaje').textContent='Ahora toca el espacio donde quieres colocarlo.';}}
function interactuar(casilla){if(!listo||resuelto||!casilla)return;const pieza=casilla.querySelector('.pieza');if(seleccion&&seleccion.parentNode!==casilla){mover(seleccion,casilla);return;}if(pieza){seleccionar(seleccion===pieza?null:pieza);}else{$('mensaje').textContent='Primero toca un objeto y después este espacio.';}}
function mover(pieza,destino){
 if(resuelto||!listo)return;const origen=pieza.parentNode,otra=destino.querySelector('.pieza');if(origen!==destino){if(otra)origen.append(otra);destino.append(pieza);}seleccionar(null);
 document.querySelectorAll('.casilla').forEach(s=>s.classList.remove('bien','revisar'));$('mensaje').className='mensaje';const total=document.querySelectorAll('#orden .pieza').length;$('revisar').disabled=total!==cantidad;
 $('mensaje').textContent=total===cantidad?'¡Ya están todos! Pulsa Revisar el orden.':`Has colocado ${total} de ${cantidad}. ${instruccion()}.`;
}
function revisar(){
 if(resuelto||!listo||drag||document.querySelectorAll('#orden .pieza').length!==cantidad)return;let aciertos=0;
 document.querySelectorAll('#orden .casilla').forEach((slot,i)=>{const ok=+slot.querySelector('.pieza').dataset.rank===i;slot.classList.toggle('bien',ok);slot.classList.toggle('revisar',!ok);if(ok)aciertos++;});
 if(aciertos===cantidad){resuelto=true;seleccionar(null);document.querySelectorAll('.pieza').forEach(p=>p.disabled=true);$('revisar').disabled=true;$('otraRonda').hidden=false;$('mensaje').className='mensaje acierto';$('mensaje').textContent=`¡Muy bien, ${nombre}! Ordenaste los ${cantidad} objetos. ${instruccion()}.`;hablar($('mensaje').textContent);premiar();}
 else{$('mensaje').textContent='Observa los espacios marcados. Puedes cambiar dos objetos de lugar para corregir el orden.';hablar('Mira otra vez. '+instruccion()+'. Cambia de lugar los objetos que necesites.');}
}
function empezarArrastre(e){if(!listo||resuelto||drag||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();const el=e.currentTarget,r=el.getBoundingClientRect();drag={el,pid:e.pointerId,parent:el.parentNode,next:el.nextSibling,css:el.style.cssText,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,width:r.width,height:r.height,moved:false,layer:null};try{el.setPointerCapture(e.pointerId);}catch{}}
function moverDedo(e){if(!drag||drag.pid!==e.pointerId)return;e.preventDefault();const d=drag;d.x=e.clientX;d.y=e.clientY;if(!d.moved&&Math.hypot(d.x-d.startX,d.y-d.startY)<7)return;if(!d.moved){d.moved=true;const body=document.body,scale=body.getBoundingClientRect().width/body.offsetWidth||1,layer=document.createElement('div');layer.style.cssText=`position:fixed;inset:0;z-index:9999;pointer-events:none;zoom:${1/scale}`;d.layer=layer;body.append(layer);layer.append(d.el);d.el.classList.add('fantasma');d.el.style.cssText+=`;position:absolute;width:${d.width}px;height:${d.height}px;pointer-events:none;`;d.frame=requestAnimationFrame(desplazar);}
  d.el.style.left=(d.x-d.dx)+'px';d.el.style.top=(d.y-d.dy)+'px';marcarDestino();
}
function casillaBajoDedo(){return drag?document.elementFromPoint(drag.x,drag.y)?.closest('.casilla'):null;}
function marcarDestino(){document.querySelectorAll('.casilla.apuntar').forEach(s=>s.classList.remove('apuntar'));casillaBajoDedo()?.classList.add('apuntar');}
function desplazar(now){if(!drag?.moved)return;const d=drag,dt=Math.min(32,now-(d.time||now));d.time=now;const edge=Math.min(65,innerHeight*.1),dir=d.y<edge?-1:d.y>innerHeight-edge?1:0;if(dir)window.scrollBy(0,dir*dt*.55);marcarDestino();d.frame=requestAnimationFrame(desplazar);}
function terminarArrastre(e,cancel=false){const d=drag;if(!d||(e&&e.pointerId!==d.pid))return;const destino=d.moved&&!cancel?document.elementFromPoint(e.clientX,e.clientY)?.closest('.casilla'):null;drag=null;if(d.moved)ignorarClickHasta=performance.now()+350;cancelAnimationFrame(d.frame);try{d.el.releasePointerCapture(d.pid);}catch{}if(d.layer){d.parent.insertBefore(d.el,d.next?.parentNode===d.parent?d.next:null);d.el.style.cssText=d.css;d.el.classList.remove('fantasma');d.layer.remove();}document.querySelectorAll('.casilla.apuntar').forEach(s=>s.classList.remove('apuntar'));if(cancel)return;if(d.moved){if(destino)mover(d.el,destino);}else interactuar(d.parent);}
window.addEventListener('pointermove',moverDedo,{passive:false});window.addEventListener('pointerup',e=>terminarArrastre(e));window.addEventListener('pointercancel',e=>terminarArrastre(e,true));
document.querySelector('.juego').addEventListener('click',e=>{if(e.detail!==0||performance.now()<ignorarClickHasta)return;const pieza=e.target.closest('.pieza');if(pieza)interactuar(pieza.parentNode);});
document.querySelector('.juego').addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key)||!e.target.matches('.casilla'))return;e.preventDefault();interactuar(e.target);});
// Espacios vacíos: tocarlos completa la alternativa de seleccionar y colocar.
for(const id of ['banco','orden'])$(id).addEventListener('click',e=>{if(performance.now()<ignorarClickHasta||e.target.closest('.pieza'))return;const slot=e.target.closest('.casilla');if(slot)interactuar(slot);});

function limpiarPremio(){clearTimeout(premioTimer);document.querySelector('.celebracion')?.remove();}
function premiar(){limpiarPremio();if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const layer=document.createElement('div');layer.className='celebracion';layer.setAttribute('aria-hidden','true');const colores=['#f0b33a','#5f9bd3','#64b18f','#c684b0'];for(let i=0;i<28;i++){const el=document.createElement('i');el.style.setProperty('--x',`${Math.cos(i*2.4)*(70+Math.random()*180)}px`);el.style.setProperty('--y',`${Math.random()*340-80}px`);el.style.setProperty('--rot',`${Math.random()*500}deg`);el.style.setProperty('--color',colores[i%4]);layer.append(el);}document.querySelector('.juego').append(layer);premioTimer=setTimeout(limpiarPremio,1000);}

$('criterio').innerHTML=criterios.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('')+'<option value="mixto">Mixto · Todos los criterios</option>';
actualizarFamilias();
for(const id of ['cantidad','familia','criterio','sentido','voz','posiciones','guiaVisual']){
 const input=$(id);input.type==='checkbox'?input.checked=config[id]:input.value=id==='familia'&&config.criterio==='mixto'?'azar':String(config[id]);
 input.addEventListener('change',()=>{
  config[id]=input.type==='checkbox'?input.checked:id==='cantidad'?+input.value:input.value;
  if(id==='criterio')actualizarFamilias();guardar();
  if(!config.voz&&'speechSynthesis'in window)speechSynthesis.cancel();actualizarAyudas();
 });
}
$('nombre').value=nombre;$('nombre').addEventListener('change',()=>{nombre=$('nombre').value.trim()||'Gabriel';$('nombre').value=nombre;try{localStorage.setItem('nombreNinoGabrielApps',nombre);}catch{}});
for(const id of ['nuevaRonda','otraRonda'])$(id).addEventListener('click',()=>nuevaRonda());
$('reintentar').addEventListener('click',()=>nuevaRonda(true));$('revisar').addEventListener('click',revisar);$('escuchar').addEventListener('click',()=>hablar('Ordena los objetos. '+instruccion()+'.'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(drag)terminarArrastre(null,true);limpiarPremio();if('speechSynthesis'in window)speechSynthesis.cancel();}});
window.addEventListener('resize',()=>{if(drag)terminarArrastre(null,true);actualizarColumnas();});
new ResizeObserver(actualizarColumnas).observe(document.querySelector('.juego'));
nuevaRonda();
