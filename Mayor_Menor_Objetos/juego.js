'use strict';
const banco=window.OBJETOS_TAMANOS;
const $=id=>document.getElementById(id);
const clave='mayorMenorObjetos.config.v1';
const defaults={modo:'mixto',cantidad:8,voz:true,ayuda:true};
let config={...defaults};
try{const saved=JSON.parse(localStorage.getItem(clave)||'null');if(saved&&typeof saved==='object'){
  if(['mayor','menor','mixto'].includes(saved.modo))config.modo=saved.modo;
  if([4,8].includes(saved.cantidad))config.cantidad=saved.cantidad;
  for(const k of ['voz','ayuda'])if(typeof saved[k]==='boolean')config[k]=saved[k];
}}catch{}
let nombre='Gabriel';try{nombre=localStorage.getItem('nombreNinoGabrielApps')?.trim()||nombre;}catch{}
let ronda=[],indice=0,seleccion=null,resuelta=false,lista=false,aciertos=0,fin=false,celebracionTimer;
function mezclar(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function hablar(texto){if(!config.voz||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(texto);u.lang='es-ES';u.rate=.9;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>/^es[-_]/i.test(v.lang)&&v.localService)||voices.find(v=>/^es[-_]/i.test(v.lang))||null;speechSynthesis.speak(u);}
function guardar(){try{localStorage.setItem(clave,JSON.stringify(config));}catch{}}
function pregunta(){return `¿Cuál es el ${ronda[indice].objetivo}${config.ayuda?(ronda[indice].objetivo==='mayor'?' (más grande)':' (más pequeño)'):''}?`;}
function actualizarAyuda(){ $('ayudaTamano').hidden=fin||!config.ayuda;$('escuchar').hidden=!config.voz;if(!fin)$('pregunta').textContent=pregunta();}
function nuevaRonda(){
  if('speechSynthesis'in window)speechSynthesis.cancel();limpiarCelebracion();
  const primerObjetivo=Math.random()<.5?'mayor':'menor';
  ronda=mezclar(banco).slice(0,config.cantidad).map((item,i)=>({...item,invertida:Math.random()<.5,objetivo:config.modo==='mixto'?(i%2?(primerObjetivo==='mayor'?'menor':'mayor'):primerObjetivo):config.modo}));
  indice=0;aciertos=0;fin=false;$('fin').hidden=true;
  for(const id of ['zonaImagen','respuesta'])$(id).hidden=false;
  document.querySelector('.acciones').hidden=false;document.querySelector('.pregunta-fila').hidden=false;
  mostrar();
}
function mostrar(){
  seleccion=null;resuelta=false;lista=false;$('errorImagen').hidden=true;$('zonaImagen').hidden=false;
  $('contador').textContent=`Imagen ${indice+1} de ${ronda.length}`;$('estrellas').textContent='★'.repeat(aciertos)+'☆'.repeat(ronda.length-aciertos);
  $('respuesta').textContent='Toca uno de los objetos.';$('respuesta').className='respuesta';$('revisar').disabled=true;$('revisar').hidden=false;$('siguiente').hidden=true;
  for(const lado of ['izquierda','derecha']){const b=$(lado);b.className='elegir';b.disabled=true;b.setAttribute('aria-pressed','false');b.querySelector('span').textContent='Este objeto';}
  const item=ronda[indice],image=$('imagenPar');image.classList.toggle('invertida',item.invertida);image.alt=`Dos ${item.nombre} del mismo tipo y de distinto tamaño.`;
  image.onload=()=>{lista=true;for(const lado of ['izquierda','derecha'])$(lado).disabled=false;};
  image.onerror=()=>{lista=false;$('zonaImagen').hidden=true;$('errorImagen').hidden=false;$('revisar').disabled=true;};
  image.src=`imagenes/${item.archivo}`;actualizarAyuda();hablar(pregunta());
}
function elegir(lado){if(!lista||resuelta||fin)return;seleccion=lado;for(const side of ['izquierda','derecha']){const b=$(side);b.className='elegir'+(side===lado?' seleccionada':'');b.setAttribute('aria-pressed',String(side===lado));}
  $('respuesta').textContent='Pulsa Revisar para comprobar.';$('respuesta').className='respuesta';$('revisar').disabled=false;
}
function revisar(){
  if(!seleccion||!lista||resuelta||fin)return;
  const item=ronda[indice],ladoMayor=item.invertida?'derecha':'izquierda',correcta=item.objetivo==='mayor'?ladoMayor:(ladoMayor==='izquierda'?'derecha':'izquierda');
  if(seleccion===correcta){resuelta=true;aciertos++;$(seleccion).classList.add('correcta');$(seleccion).querySelector('span').textContent='✓ ¡Correcto!';
    for(const lado of ['izquierda','derecha'])$(lado).disabled=true;
    const texto=`¡Muy bien, ${nombre}! Este es el ${item.objetivo}: es ${item.objetivo==='mayor'?'más grande':'más pequeño'}.`;
    $('respuesta').textContent=texto;$('respuesta').classList.add('acierto');$('revisar').hidden=true;$('siguiente').hidden=false;$('siguiente').textContent=indice===ronda.length-1?'Ver mis estrellas ★':'Siguiente →';
    $('estrellas').textContent='★'.repeat(aciertos)+'☆'.repeat(ronda.length-aciertos);hablar(texto);celebrar();
  }else{$(seleccion).classList.add('incorrecta');$('respuesta').textContent=`Mira otra vez el tamaño. Busca el ${item.objetivo==='mayor'?'más grande':'más pequeño'}.`;hablar($('respuesta').textContent);$('revisar').disabled=true;}
}
function siguiente(){if(!resuelta||fin)return;limpiarCelebracion();indice++;if(indice<ronda.length){mostrar();return;}
  fin=true;for(const id of ['zonaImagen','respuesta','ayudaTamano','errorImagen'])$(id).hidden=true;document.querySelector('.acciones').hidden=true;document.querySelector('.pregunta-fila').hidden=true;
  $('contador').textContent=`${ronda.length} imágenes completadas`;$('fin').hidden=false;$('mensajeFinal').textContent=`${nombre}, comparaste los tamaños de ${ronda.length} pares de objetos. ¡Conseguiste ${aciertos} estrellas!`;$('fin').focus();hablar(`¡Buen trabajo, ${nombre}! Completaste la ronda.`);celebrar();
}
function limpiarCelebracion(){clearTimeout(celebracionTimer);document.querySelector('.confeti')?.remove();}
function celebrar(){limpiarCelebracion();if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const layer=document.createElement('div');layer.className='confeti';layer.setAttribute('aria-hidden','true');const colors=['#e4af30','#4a99d7','#5eb68a','#cf80a5'];for(let i=0;i<28;i++){const p=document.createElement('i');p.style.setProperty('--x',`${Math.cos(i*2.4)*(70+Math.random()*170)}px`);p.style.setProperty('--y',`${-100+Math.random()*320}px`);p.style.setProperty('--giro',`${Math.random()*500}deg`);p.style.setProperty('--color',colors[i%colors.length]);layer.append(p);}document.querySelector('.actividad').append(layer);celebracionTimer=setTimeout(limpiarCelebracion,950);}
for(const id of ['modo','cantidad','voz','ayuda']){const input=$(id);input.type==='checkbox'?input.checked=config[id]:input.value=String(config[id]);input.addEventListener('change',()=>{config[id]=input.type==='checkbox'?input.checked:id==='cantidad'?+input.value:input.value;guardar();if(id==='voz'&&!config.voz&&'speechSynthesis'in window)speechSynthesis.cancel();actualizarAyuda();});}
$('nombre').value=nombre;$('nombre').addEventListener('change',()=>{nombre=$('nombre').value.trim()||'Gabriel';$('nombre').value=nombre;try{localStorage.setItem('nombreNinoGabrielApps',nombre);}catch{}});
for(const lado of ['izquierda','derecha'])$(lado).addEventListener('click',()=>elegir(lado));
$('revisar').addEventListener('click',revisar);$('siguiente').addEventListener('click',siguiente);$('nuevaRonda').addEventListener('click',nuevaRonda);$('otraRonda').addEventListener('click',nuevaRonda);$('escuchar').addEventListener('click',()=>hablar(pregunta()));$('reintentar').addEventListener('click',mostrar);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if('speechSynthesis'in window)speechSynthesis.cancel();limpiarCelebracion();}});
nuevaRonda();
