'use strict';
const $=id=>document.getElementById(id),clave='mayorMenorObjetos.config.v1';
const guiaGeneral=document.querySelector('.guia svg').innerHTML;
const categorias=window.CATEGORIAS_OBJETOS,variantes=window.VARIANTES_OBJETOS,capacidades=window.EJERCICIOS_CAPACIDAD;
const originales=window.OBJETOS_TAMANOS.map(a=>({...a,categoria:'tamano',tipo:'paneles',columnas:2,niveles:[2,0],src:'imagenes/'+a.archivo}));
const defaults={actividad:1,tamano:'mixto',comparacion:'mixto',categorias:categorias.map(c=>c.id),cantidad:8,voz:true,ayuda:true,capacidadTema:'mixto',apoyoCapacidad:'vasitos',capacidadNivel:'3',capacidadEstructura:'misma'};
let config={...defaults,categorias:[...defaults.categorias]},nombre='Gabriel';
try{const s=JSON.parse(localStorage.getItem(clave)||'null');if(s&&typeof s==='object'){
  if([1,2,3,4].includes(s.actividad))config.actividad=s.actividad;
  if(['mixto','grande','mediano','pequeno'].includes(s.tamano))config.tamano=s.tamano;
  else if(s.modo==='mayor')config.tamano='grande';else if(s.modo==='menor')config.tamano='pequeno';
  if(['mas','menos','mixto'].includes(s.comparacion))config.comparacion=s.comparacion;
  if(['agua','capacidad','mixto'].includes(s.capacidadTema))config.capacidadTema=s.capacidadTema;
  if(['3','2','1','variado'].includes(s.capacidadNivel))config.capacidadNivel=s.capacidadNivel;
  if(['misma','mixtos'].includes(s.capacidadEstructura))config.capacidadEstructura=s.capacidadEstructura;
  if(['vasitos','medidas','ninguno'].includes(s.apoyoCapacidad))config.apoyoCapacidad=s.apoyoCapacidad;
  if(Array.isArray(s.categorias)){const ids=[...new Set(s.categorias.filter(id=>categorias.some(c=>c.id===id)))];if(ids.length)config.categorias=ids;}
  if([4,8,12].includes(s.cantidad))config.cantidad=s.cantidad;
  for(const k of ['voz','ayuda'])if(typeof s[k]==='boolean')config[k]=s[k];
}nombre=localStorage.getItem('nombreNinoGabrielApps')?.trim()||nombre;}catch{}
if(config.actividad===1&&config.tamano==='mediano')config.tamano='mixto';
let ronda=[],indice=0,seleccion=null,resuelta=false,lista=false,aciertos=0,fin=false,celebracionTimer,cargaToken=0,llenado=null,timerLlenado=null,autoLlenadoPendiente=false;
function mezclar(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function hablar(texto){if(!config.voz)return;return IdiomaVoz.hablar(texto);}
function guardar(){try{localStorage.setItem(clave,JSON.stringify(config));}catch{}}
function bancoDisponible(){if(config.actividad===4)return capacidades.filter(a=>a.nivel===config.capacidadNivel&&(config.capacidadEstructura==='mixtos'||a.estructura==='misma'));if(config.actividad===1)return [...originales,...variantes.filter(a=>a.categoria==='tamano')];if(config.actividad===2)return variantes.filter(a=>a.categoria==='tamano');return variantes.filter(a=>config.categorias.includes(a.categoria));}
function actualizarConfig(){
  document.querySelector('.guia svg').innerHTML=config.actividad===4?'<g stroke="#557a96" stroke-width="2.5"><path d="M25 30h38l-4 50a15 3 0 0 1-30 0zM98 15h47l-5 65a18.5 3 0 0 1-37 0zM180 25h40l-4 55a16 3 0 0 1-32 0z" fill="#eef8ff"/><path d="M27 55h34l-2 25a15 3 0 0 1-30 0zM101 57h41l-2 23a18.5 3 0 0 1-37 0zM181 40h38l-3 40a16 3 0 0 1-32 0z" fill="#70d2f2" stroke="none"/><g fill="none"><ellipse cx="44" cy="30" rx="19" ry="3"/><ellipse cx="121.5" cy="15" rx="23.5" ry="4"/><ellipse cx="200" cy="25" rx="20" ry="3.5"/></g><g fill="#d6effa"><ellipse cx="44" cy="80" rx="15" ry="3"/><ellipse cx="121.5" cy="80" rx="18.5" ry="3"/><ellipse cx="200" cy="80" rx="16" ry="3"/></g></g>':guiaGeneral;
  $('comoJugar').textContent=config.actividad===4?'Agua y capacidad':'Así jugamos';
  document.querySelector('.guia ol li').innerHTML='<b>1</b> '+(config.actividad===4?'Observa el llenado.':'Mira las opciones.');
  document.querySelectorAll('[data-actividad]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.actividad===config.actividad)));
  $('tamanosConfig').hidden=config.actividad>=3;$('comparacionConfig').hidden=config.actividad<3;$('categoriasConfig').hidden=config.actividad!==3;
  $('capacidadConfig').hidden=config.actividad!==4;$('capacidadTema').value=config.capacidadTema;$('apoyoCapacidad').value=config.apoyoCapacidad;
  $('capacidadNivel').value=config.capacidadNivel;
  $('capacidadEstructura').value=config.capacidadEstructura;
  $('tamano').querySelector('[value=mediano]').disabled=config.actividad===1;
  $('tamano').value=config.tamano;$('comparacion').value=config.comparacion;$('cantidad').value=String(config.cantidad);
  $('voz').checked=config.voz;$('ayuda').checked=config.ayuda;
  document.querySelectorAll('[data-categoria]').forEach(c=>c.checked=config.categorias.includes(c.dataset.categoria));
  const n=bancoDisponible().length;$('disponibles').textContent=`${n} imágenes disponibles. La ronda tendrá ${Math.min(config.cantidad,n)} ejercicios sin repetir imagen.`;
}
function gruposEquilibrados(pool,n){const grupos=new Map();for(const a of mezclar(pool)){const grupo=config.actividad===4&&config.capacidadEstructura==='mixtos'?a.estructura:a.categoria;if(!grupos.has(grupo))grupos.set(grupo,[]);grupos.get(grupo).push(a);}const orden=mezclar([...grupos.keys()]),result=[];while(result.length<n){for(const id of orden){const a=grupos.get(id).pop();if(a)result.push(a);if(result.length===n)break;}}return config.actividad===4&&config.capacidadEstructura==='mixtos'?mezclar(result):result;}
function rasgosDe(asset){const c=categorias.find(c=>c.id===asset.categoria);return asset.rasgos||[c.mayor,c.menor].filter(Boolean);}
function valorDe(asset,rasgo,fuente){const c=categorias.find(c=>c.id===asset.categoria),nivel=asset.niveles?.[fuente]??fuente;return rasgo===c.menor||rasgo==='nublado'?2-nivel:nivel;}
function crearEjercicioCapacidad(asset,i,comparaciones){
  const objetivo=config.capacidadTema==='mixto'?(i%2?'capacidad':'agua'):config.capacidadTema;
  const comparacion=config.comparacion==='mixto'?comparaciones[(config.capacidadTema==='mixto'?Math.floor(i/2):i)%2]:config.comparacion,palabra=comparacion==='mas'?'más':'menos';
  const valores=objetivo==='agua'?asset.agua:asset.capacidades,valorCorrecto=comparacion==='mas'?Math.max(...valores):Math.min(...valores);
  return {asset,actividad:4,rasgo:objetivo,objetivo,comparacion,valorCorrecto,
    pregunta:objetivo==='agua'?`¿Cuál tiene ${palabra} agua?`:`¿A cuál le cabe ${palabra} agua?`,
    ayuda:objetivo==='agua'?'Observa el llenado y compara el agua que queda.':'Observa cuánto entra hasta llenar cada recipiente.',
    opciones:mezclar([0,1,2]).map(fuente=>({fuente,valor:valores[fuente]}))};
}
function crearEjercicio(asset,i,tamanos,comparaciones){
  if(config.actividad===4)return crearEjercicioCapacidad(asset,i,comparaciones);
  const actividad=config.actividad,fuentes=actividad===1?(asset.columnas===2?[0,1]:[0,2]):[0,1,2];
  let rasgo,comparacion,objetivo,valorCorrecto,pregunta,ayuda;
  if(actividad<3){objetivo=config.tamano==='mixto'?tamanos[i%tamanos.length]:config.tamano;rasgo='grande';valorCorrecto={grande:2,mediano:1,pequeno:0}[objetivo];pregunta=`Toca el objeto ${objetivo==='pequeno'?'pequeño':objetivo}.`;ayuda=actividad===1?'Compara el tamaño: grande y pequeño.':'Compara los tres tamaños: grande, mediano y pequeño.';}
  else{
    rasgo=mezclar(rasgosDe(asset))[0];comparacion=config.comparacion==='mixto'?comparaciones[i%2]:config.comparacion;
    valorCorrecto=comparacion==='mas'?2:0;const palabra=comparacion==='mas'?'más':'menos';
    if(asset.categoria==='cantidad')pregunta=`¿Dónde hay ${palabra} ${asset.sustantivo}?`;
    else if(asset.categoria==='distancia')pregunta=`¿Qué pelota está ${palabra} ${rasgo} ${asset.referencia}?`;
    else if(asset.categoria==='separacion')pregunta=`¿En qué grupo están ${palabra} ${rasgo}?`;
    else pregunta=`¿Cuál ${['tamano','altura','longitud','anchura','grosor','claridad','forma','superficie'].includes(asset.categoria)?'es':'está'} ${palabra} ${rasgo}?`;
    ayuda=categorias.find(c=>c.id===asset.categoria).ayuda;
  }
  const opciones=mezclar(fuentes).map(fuente=>({fuente,valor:actividad<3?(asset.niveles?.[fuente]??fuente):valorDe(asset,rasgo,fuente)}));
  return {asset,actividad,rasgo,comparacion,objetivo,valorCorrecto,pregunta,ayuda,opciones};
}
function nuevaRonda(){
  detenerLlenado();
  if('speechSynthesis'in window)speechSynthesis.cancel();limpiarCelebracion();
  const pool=bancoDisponible(),n=Math.min(config.cantidad,pool.length),tamanos=mezclar(config.actividad===1?['grande','pequeno']:['grande','mediano','pequeno']),comparaciones=mezclar(['mas','menos']);
  ronda=gruposEquilibrados(pool,n).map((a,i)=>crearEjercicio(a,i,tamanos,comparaciones));
  indice=0;aciertos=0;fin=false;$('fin').hidden=true;
  for(const id of ['zonaImagen','respuesta','temaActual'])$(id).hidden=false;
  document.querySelector('.acciones').hidden=false;document.querySelector('.pregunta-fila').hidden=false;actualizarConfig();mostrar();
}
function actualizarAyuda(){const item=ronda[indice];$('ayudaTamano').hidden=fin||!config.ayuda;$('escuchar').hidden=!config.voz;if(item&&!fin){$('pregunta').textContent=item.pregunta;$('ayudaTamano').textContent=item.ayuda+(item.actividad===4&&config.apoyoCapacidad==='vasitos'?' Cada vasito lleno equivale a 100 mL de agua.':'');}}
function geometriaOpciones(item){
  const m=window.RECORTES_OBJETOS[item.asset.id];
  if(!m)throw Error('Falta la medición de '+item.asset.id);
  const objetos=item.opciones.map(o=>({r:m.regiones[item.asset.tipo==='sprite'?0:o.fuente],escala:item.asset.tipo==='sprite'?[.38,.68,1][o.fuente]:1}));
  const ancho=Math.max(...objetos.map(o=>o.r.w*o.escala));
  const arriba=Math.max(...objetos.map(o=>(o.r.base-o.r.y+1)*o.escala));
  const abajo=Math.max(...objetos.map(o=>(o.r.y+o.r.h-o.r.base-1)*o.escala));
  const margen=Math.max(7,Math.max(ancho,arriba+abajo)*(item.asset.categoria==='clima'?.018:.065)),w=ancho+2*margen,h=arriba+abajo+2*margen;
  return {m,objetos,ancho,arriba,abajo,margen,w,h,base:(margen+arriba)/h*100};
}
function volumenVisible(item,o){return llenado?.item===item?llenado.volumenes[o.fuente]:0;}
function etiquetaCapacidad(item,o){
  if(item.objetivo==='agua')return 'Tiene';
  const v=volumenVisible(item,o);return v>=o.valor?'Le caben':v>0?'Agua añadida':'Vacío';
}
function vasitoHTML(item,o,j){
  const clip=`vasito-${cargaToken}-${o.fuente}-${j}`;
  return `<svg data-vasito="${j}" data-fraccion="0" viewBox="0 0 28 38" aria-hidden="true"><defs><clipPath id="${clip}"><path d="M5 6H23V32A9 2.5 0 0 1 5 32Z"/></clipPath></defs><path d="M5 6H23V32A9 2.5 0 0 1 5 32Z" fill="#effaff" stroke="#4b7c97" stroke-width="1.7"/><g data-vaso-agua opacity="0" clip-path="url(#${clip})"><rect data-vaso-rect x="5" y="32" width="18" height="0" fill="#42b8e9"/><ellipse data-vaso-superficie cx="14" cy="32" rx="9" ry="2.5" fill="#a4e8ff" stroke="#258fbd" stroke-width=".8"/></g><ellipse cx="14" cy="32" rx="9" ry="2.5" fill="#cdebf4" fill-opacity=".25" stroke="#4b7c97" stroke-width="1.2"/><path d="M5 6H23V32A9 2.5 0 0 1 5 32Z" fill="none" stroke="#4b7c97" stroke-width="1.7"/><ellipse cx="14" cy="6" rx="9" ry="2.5" fill="none" stroke="#4b7c97" stroke-width="1.4"/></svg>`;
}
function apoyoCapacidadHTML(item,o){
  if(item.actividad!==4||config.apoyoCapacidad==='ninguno')return '';
  const etiqueta=etiquetaCapacidad(item,o),v=volumenVisible(item,o);
  if(config.apoyoCapacidad==='medidas')return `<span class="etiqueta-volumen">${etiqueta}</span><strong data-mililitros>${Math.round(v).toLocaleString('es-CR')} mL</strong>`;
  const n=Math.ceil(o.valor/100);
  return `<span class="etiqueta-volumen">${etiqueta}</span><span class="vasitos" role="img" aria-label="${Math.round(v)} mililitros en vasitos de 100 mililitros">${n?Array.from({length:n},(_,j)=>vasitoHTML(item,o,j)).join(''):'<span class="vacio">Sin agua</span>'}</span>`;
}
function actualizarApoyosCapacidad(){
  const item=ronda[indice];if(!item||fin||item.actividad!==4)return;
  let reconstruido=false;
  document.querySelectorAll('.apoyo-capacidad').forEach(el=>{
    const o=item.opciones[+el.dataset.opcion],claveApoyo=[item.asset.id,item.objetivo,o.fuente,o.valor,config.apoyoCapacidad].join('|');
    if(el.dataset.claveApoyo!==claveApoyo){el.innerHTML=apoyoCapacidadHTML(item,o);el.dataset.claveApoyo=claveApoyo;reconstruido=true;}
    const label=el.querySelector('.etiqueta-volumen'),text=etiquetaCapacidad(item,o);if(label&&label.textContent!==text)label.textContent=text;
    const v=Math.round(volumenVisible(item,o)),medida=el.querySelector('[data-mililitros]'),cups=el.querySelector('.vasitos');
    if(medida){const value=v.toLocaleString('es-CR')+' mL';if(medida.textContent!==value)medida.textContent=value;}
    if(cups)cups.setAttribute('aria-label',`${v} mililitros en vasitos de 100 mililitros`);
  });
  if(reconstruido&&llenado?.item===item)llenado.sincronizarVasitos();
}
function opcionHTML(item,g,o,i){
  const {r,escala}=g.objetos[i],x=(g.margen+(g.ancho-r.w*escala)/2)/g.w*100,y=(g.margen+g.arriba-(r.base-r.y+1)*escala)/g.h*100;
  const caja=`left:${x}%;top:${y}%;width:${r.w*escala/g.w*100}%;height:${r.h*escala/g.h*100}%`;
  const imagen=`left:${-r.x/r.w*100}%;top:${-r.y/r.h*100}%;width:${g.m.ancho/r.w*100}%;height:${g.m.alto/r.h*100}%`;
  const dibujo=item.actividad===4?AnimacionCapacidad.marcado(item.asset.id,`llenado-${cargaToken}-${i}`,imagen):`<img src="${item.asset.src}" alt="Opción ${i+1}" draggable="false" decoding="async" style="${imagen}">`;
  return `<button class="tarjeta-opcion" id="eleccion-${i}" aria-label="Elegir opción ${i+1}" aria-pressed="false" disabled><div class="muestra escenario" style="--proporcion:${g.w/g.h}"><div class="lienzo"><span class="linea-base" style="top:${g.base}%" aria-hidden="true"></span><div class="recorte-objeto" data-fuente="${o.fuente}" style="${caja}">${dibujo}</div></div></div>${item.actividad===4?`<span class="apoyo-capacidad" data-opcion="${i}">${apoyoCapacidadHTML(item,o)}</span>`:''}<span class="marca-seleccion" aria-hidden="true">✓</span><span class="texto-eleccion">Elegir</span></button>`;
}
function mostrar(){
  detenerLlenado();
  const token=++cargaToken,item=ronda[indice],a=item.asset;seleccion=null;resuelta=false;lista=false;
  $('errorImagen').hidden=true;$('zonaImagen').hidden=false;$('contador').textContent=`Ejercicio ${indice+1} de ${ronda.length}`;$('estrellas').textContent='★'.repeat(aciertos)+'☆'.repeat(ronda.length-aciertos);
  $('temaActual').textContent=`Modo ${item.actividad} · ${item.actividad===4?(item.objetivo==='agua'?'Agua que contiene':'Lo que le cabe'):categorias.find(c=>c.id===a.categoria).nombre}`+(item.actividad===4&&a.diferenciaVasos?` · Nivel ${4-a.diferenciaVasos}: diferencia de ${a.diferenciaVasos} ${a.diferenciaVasos===1?'vasito':'vasitos'}`:'');
  $('respuesta').textContent='Toca una opción: la selección se iluminará.';$('respuesta').className='respuesta';$('revisar').disabled=true;$('revisar').hidden=false;$('siguiente').hidden=true;
  $('zonaImagen').style.setProperty('--opciones',item.opciones.length);
  const geometria=geometriaOpciones(item);
  $('zonaImagen').classList.toggle('ilustracion-baja',geometria.w/geometria.h>3);
  $('zonaImagen').classList.toggle('escenas-clima',a.categoria==='clima');
  $('zonaImagen').classList.toggle('recipientes-capacidad',item.actividad===4);
  $('zonaImagen').innerHTML=item.opciones.map((o,i)=>opcionHTML(item,geometria,o,i)).join('');
  document.querySelectorAll('.tarjeta-opcion').forEach((b,i)=>b.addEventListener('click',()=>elegir(i)));
  if(item.actividad===4){actualizarAyuda();hablar(item.pregunta);prepararLlenado(item,token);return;}
  const image=new Image();image.onload=()=>{if(token!==cargaToken)return;lista=true;document.querySelectorAll('.tarjeta-opcion').forEach(b=>b.disabled=false);};
  image.onerror=()=>{if(token!==cargaToken)return;lista=false;$('zonaImagen').hidden=true;$('errorImagen').hidden=false;$('revisar').disabled=true;};image.src=a.src;
  actualizarAyuda();hablar(item.pregunta);
}
function detenerLlenado(){clearTimeout(timerLlenado);timerLlenado=null;autoLlenadoPendiente=false;llenado?.cancelar();llenado=null;$('controlLlenado').hidden=true;}
function prepararLlenado(item,token){
  $('controlLlenado').hidden=false;$('repetirLlenado').disabled=false;$('repetirLlenado').textContent='↻ Animación';
  $('estadoLlenado').textContent='Los recipientes empiezan vacíos.';$('respuesta').textContent='Observa el llenado antes de elegir.';
  llenado=AnimacionCapacidad.crear(item,session=>{
    if(session!==llenado||token!==cargaToken)return;actualizarApoyosCapacidad();
  },session=>{
    if(session!==llenado||token!==cargaToken)return;
    lista=true;document.querySelectorAll('.tarjeta-opcion').forEach(b=>b.disabled=resuelta);
    $('revisar').disabled=seleccion===null||resuelta;$('repetirLlenado').disabled=false;$('repetirLlenado').textContent='↻ Animación';
    $('estadoLlenado').textContent=item.objetivo==='capacidad'?'Ya están llenos. Compara cuánto ha entrado en cada uno.':'El agua quedó en la cantidad del ejercicio.';
    if(!resuelta)$('respuesta').textContent='Ahora toca una opción y pulsa Revisar.';
  });
  actualizarApoyosCapacidad();autoLlenadoPendiente=true;
  timerLlenado=setTimeout(()=>{timerLlenado=null;if(!document.hidden)iniciarLlenado();},650);
}
function iniciarLlenado(){
  if(!llenado||llenado.cancelado)return;
  clearTimeout(timerLlenado);timerLlenado=null;autoLlenadoPendiente=false;lista=false;
  document.querySelectorAll('.tarjeta-opcion').forEach(b=>b.disabled=true);$('revisar').disabled=true;$('repetirLlenado').disabled=false;$('repetirLlenado').textContent='↻ Animación';
  if(!resuelta){seleccion=null;document.querySelectorAll('.tarjeta-opcion').forEach(b=>{b.className='tarjeta-opcion';b.setAttribute('aria-pressed','false');b.querySelector('.texto-eleccion').textContent='Elegir';});$('respuesta').textContent='Observa cómo sube el agua.';}
  $('estadoLlenado').textContent=llenado.item.objetivo==='capacidad'?'Reciben agua al mismo ritmo. Mira cuándo se llena cada uno.':'El agua sube hasta la cantidad de este ejercicio.';
  llenado.iniciar();
}
function elegir(i){if(!lista||resuelta||fin)return;seleccion=i;document.querySelectorAll('.tarjeta-opcion').forEach((b,pos)=>{b.className='tarjeta-opcion'+(pos===i?' seleccionada':'');b.setAttribute('aria-pressed',String(pos===i));b.querySelector('.texto-eleccion').textContent=pos===i?'Seleccionado':'Elegir';});$('respuesta').textContent='La opción iluminada es tu selección. Pulsa Revisar.';$('respuesta').className='respuesta';$('revisar').disabled=false;}
function explicacion(item){if(item.actividad===4)return item.objetivo==='agua'?`Este recipiente tiene ${item.valorCorrecto} mililitros de agua.`:`En este recipiente caben ${item.valorCorrecto} mililitros cuando está lleno.`;if(item.actividad<3)return `Es el objeto ${item.objetivo==='pequeno'?'pequeño':item.objetivo}.`;const q=item.comparacion==='mas'?'más':'menos';if(item.asset.categoria==='cantidad')return `Aquí hay ${q} ${item.asset.sustantivo}.`;if(item.asset.categoria==='distancia')return `La pelota está ${q} ${item.rasgo} ${item.asset.referencia}.`;if(item.asset.categoria==='separacion')return `En este grupo están ${q} ${item.rasgo}.`;return `Encontraste la opción: ${q} ${item.rasgo}.`;}
function revisar(){
  if(seleccion===null||!lista||resuelta||fin)return;const item=ronda[indice],b=$('eleccion-'+seleccion);
  if(item.opciones[seleccion].valor===item.valorCorrecto){resuelta=true;aciertos++;b.classList.add('correcta');b.querySelector('.texto-eleccion').textContent='¡Correcto!';document.querySelectorAll('.tarjeta-opcion').forEach(x=>x.disabled=true);
    const texto=`¡Muy bien, ${nombre}! ${explicacion(item)}`;$('respuesta').textContent=texto;$('respuesta').classList.add('acierto');$('revisar').hidden=true;$('siguiente').hidden=false;$('siguiente').textContent=indice===ronda.length-1?'Ver mis estrellas ★':'Siguiente →';$('estrellas').textContent='★'.repeat(aciertos)+'☆'.repeat(ronda.length-aciertos);hablar(texto);celebrar();
  }else{b.classList.add('incorrecta');$('respuesta').textContent='Mira otra vez las opciones. '+item.pregunta;hablar($('respuesta').textContent);$('revisar').disabled=true;}
}
function siguiente(){if(!resuelta||fin)return;detenerLlenado();limpiarCelebracion();indice++;if(indice<ronda.length){mostrar();return;}fin=true;for(const id of ['zonaImagen','respuesta','ayudaTamano','errorImagen','temaActual'])$(id).hidden=true;document.querySelector('.acciones').hidden=true;document.querySelector('.pregunta-fila').hidden=true;$('contador').textContent=`${ronda.length} ejercicios completados`;$('fin').hidden=false;$('mensajeFinal').textContent=`${nombre}, completaste ${ronda.length} comparaciones. ¡Conseguiste ${aciertos} estrellas!`;$('fin').focus();hablar(`¡Buen trabajo, ${nombre}! Completaste la ronda.`);celebrar();}
function limpiarCelebracion(){clearTimeout(celebracionTimer);document.querySelector('.confeti')?.remove();}
function celebrar(){limpiarCelebracion();if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const layer=document.createElement('div');layer.className='confeti';layer.setAttribute('aria-hidden','true');const colors=['#e4af30','#4a99d7','#5eb68a','#cf80a5'];for(let i=0;i<28;i++){const p=document.createElement('i');p.style.setProperty('--x',`${Math.cos(i*2.4)*(70+Math.random()*170)}px`);p.style.setProperty('--y',`${-100+Math.random()*320}px`);p.style.setProperty('--giro',`${Math.random()*500}deg`);p.style.setProperty('--color',colors[i%colors.length]);layer.append(p);}document.querySelector('.actividad').append(layer);celebracionTimer=setTimeout(limpiarCelebracion,950);}
$('categorias').innerHTML=categorias.map(c=>`<label class="opcion"><input type="checkbox" data-categoria="${c.id}">${c.nombre}</label>`).join('');
document.querySelectorAll('[data-categoria]').forEach(el=>el.addEventListener('change',()=>{const elegidas=[...document.querySelectorAll('[data-categoria]:checked')].map(e=>e.dataset.categoria);if(!elegidas.length){el.checked=true;$('estadoCategorias').textContent='Mantén al menos una característica seleccionada.';return;}config.categorias=elegidas;$('estadoCategorias').textContent='';guardar();actualizarConfig();}));
$('todasCategorias').addEventListener('click',()=>{config.categorias=categorias.map(c=>c.id);guardar();actualizarConfig();});$('basicasCategorias').addEventListener('click',()=>{config.categorias=['tamano','altura','longitud','anchura','grosor'];guardar();actualizarConfig();});
for(const id of ['tamano','comparacion','cantidad','voz','ayuda','capacidadTema','apoyoCapacidad','capacidadNivel','capacidadEstructura']){const input=$(id);input.addEventListener('change',()=>{config[id]=input.type==='checkbox'?input.checked:id==='cantidad'?+input.value:input.value;guardar();actualizarConfig();if(id==='voz'&&!config.voz&&'speechSynthesis'in window)speechSynthesis.cancel();actualizarAyuda();actualizarApoyosCapacidad();});}
document.querySelectorAll('[data-actividad]').forEach(b=>b.addEventListener('click',()=>{config.actividad=+b.dataset.actividad;if(config.actividad===1&&config.tamano==='mediano')config.tamano='mixto';guardar();actualizarConfig();nuevaRonda();}));
$('nombre').value=nombre;$('nombre').addEventListener('change',()=>{nombre=$('nombre').value.trim()||'Gabriel';$('nombre').value=nombre;try{localStorage.setItem('nombreNinoGabrielApps',nombre);}catch{}});
$('repetirLlenado').addEventListener('click',iniciarLlenado);
$('revisar').addEventListener('click',revisar);$('siguiente').addEventListener('click',siguiente);$('nuevaRonda').addEventListener('click',nuevaRonda);$('otraRonda').addEventListener('click',nuevaRonda);$('escuchar').addEventListener('click',()=>{if(!fin)hablar(ronda[indice].pregunta);});$('reintentar').addEventListener('click',mostrar);
document.addEventListener('visibilitychange',()=>{if(document.hidden){
  clearTimeout(timerLlenado);timerLlenado=null;llenado?.pausar();if('speechSynthesis'in window)speechSynthesis.cancel();limpiarCelebracion();
}else if(llenado){if(autoLlenadoPendiente)iniciarLlenado();else llenado.reanudar();}});
IdiomaVoz.instalar('#preferenciasIdiomaVoz');
actualizarConfig();nuevaRonda();
