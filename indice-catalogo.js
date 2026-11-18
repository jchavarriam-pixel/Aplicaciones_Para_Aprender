(() => {
 'use strict';
 function iniciar({aplicaciones,materias,clasificacion,ordenAprendizaje,crearTarjeta}){
  const $=s=>document.querySelector(s),t=(es,en)=>IdiomaVoz.idioma==='en'?en:es,tr=s=>IdiomaVoz.t(s);
  const inicio=$('#inicioTemas'),lista=$('#vistaAplicaciones'),contenedor=$('#contenedorApps'),buscar=$('#buscar'),contador=$('#contador');
  let actual=null,filtros={},plegado=false,narrar=false;
  try{filtros=JSON.parse(localStorage.getItem('filtrosMateriasApps'))||{};narrar=localStorage.getItem('indice.narrarTemas')==='true';}catch{}
  if(!filtros||typeof filtros!=='object'||Array.isArray(filtros))filtros={};
  const fichas=[{id:'todas',nombre:'Todas las aplicaciones',icono:'🌈',color:'#7651b5',fondo:'#f3edff',descripcion:'Un poco de todo para explorar y aprender.'},
   ...materias.map((m,i)=>({...m,...[
    {color:'#2f6cc4',fondo:'#edf5ff',descripcion:'Números, operaciones, figuras y mucho más.'},
    {color:'#a64b78',fondo:'#fff0f6',descripcion:'Palabras, lectura y construcción de oraciones.'},
    {color:'#318871',fondo:'#ebf8f2',descripcion:'Animales, vocabulario y primeras preguntas.'},
    {color:'#a37429',fondo:'#fff6df',descripcion:'Mapas, recorridos y puntos cardinales.'},
    {color:'#397c9d',fondo:'#eaf8fc',descripcion:'Escucha, observa y descubre tu entorno.'},
    {color:'#6c5aa9',fondo:'#f0efff',descripcion:'Robots, programación y retos para pensar.'}
   ][i]}))];
  const normalizar=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const ordenados=aplicaciones.slice().sort((a,b)=>(ordenAprendizaje.get(a.archivo)??Infinity)-(ordenAprendizaje.get(b.archivo)??Infinity));
  // Mix subjects evenly and keep each subject's learning sequence intact.
  // Searching filters this fixed order rather than shuffling cards on each keystroke.
  const colas=materias.map(m=>ordenados.filter(a=>clasificacion[a.archivo]?.[0]===m.id));
  const mezcladas=[];for(let i=0;colas.some(apps=>i<apps.length);i++)for(const apps of colas)if(apps[i])mezcladas.push(apps[i]);
  const appsDe=id=>id==='todas'?mezcladas:ordenados.filter(a=>clasificacion[a.archivo]?.[0]===id);
  const buscarEn=apps=>{const q=normalizar(buscar.value);return apps.filter(a=>{const m=materias.find(m=>m.id===clasificacion[a.archivo]?.[0]),temas=clasificacion[a.archivo]?.[1]||[];return normalizar([a.nombre,tr(a.nombre),a.descripcion,tr(a.descripcion),m?.nombre,tr(m?.nombre||''),...temas,...temas.map(tr)].join(' ')).includes(q);});};
  const cantidad=n=>t(n===1?'1 aplicación':`${n} aplicaciones`,n===1?'1 app':`${n} apps`);
  function distribuirTarjetas(){
   if(inicio.hidden)return;const ancho=$('#navegacionMaterias').getBoundingClientRect().width,cols=Math.min(7,Math.max(1,Math.floor((ancho+16)/236))),span=cols-(6%cols),todas=$('[data-materia="todas"]');
   $('#navegacionMaterias').style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;
   if(todas){todas.style.gridColumn='span '+span;todas.classList.toggle('materia-amplia',span>1);}
  }
  function renderizar(){
   $('.subtitulo').textContent=tr('Elige un tema, juega y descubre algo nuevo.');
   const resultados=buscarEn(mezcladas);inicio.hidden=actual!==null;lista.hidden=actual===null;$('#verResultados').hidden=actual!==null||!buscar.value.trim();
   $('#navegacionMaterias').replaceChildren();
   for(const ficha of fichas){
    const total=appsDe(ficha.id).length,n=buscarEn(appsDe(ficha.id)).length,b=document.createElement('button');b.type='button';b.className='tarjeta-materia';b.dataset.materia=ficha.id;b.style.setProperty('--acento-materia',ficha.color);b.style.setProperty('--fondo-materia',ficha.fondo);
    b.innerHTML=`<span class="imagen-materia"><img src="imagenes-indice/${ficha.id}.webp" alt="" width="640" height="384" loading="eager" decoding="async"></span><span class="texto-materia"><span class="nombre-materia">${tr(ficha.nombre)}</span><span class="descripcion-materia">${tr(ficha.descripcion)}</span></span><span class="pie-materia"><span class="cantidad-materia">${buscar.value.trim()?t(`${n} de ${total}`,`${n} of ${total}`)+' · ':''}${buscar.value.trim()?t('coincidencias','matches'):cantidad(total)}</span><span class="abrir-materia">${t('Explorar','Explore')} <span aria-hidden="true">→</span></span></span>`;
    b.onclick=()=>seleccionar(ficha.id);$('#navegacionMaterias').append(b);
   }
   if(actual===null){contador.textContent=cantidad(resultados.length);distribuirTarjetas();return;}
   $('#todasDesdeMateria').hidden=actual==='todas';
   const ficha=fichas.find(f=>f.id===actual),apps=appsDe(actual),coincidencias=buscarEn(apps),temas=[...new Set(apps.flatMap(a=>clasificacion[a.archivo]?.[1]||[]))],activo=actual!=='todas'&&temas.includes(filtros[actual])?filtros[actual]:'';
   const visibles=coincidencias.filter(a=>!activo||clasificacion[a.archivo][1].includes(activo));
   $('#tituloListado').textContent=tr(ficha.nombre);$('#descripcionListado').textContent=actual==='todas'?t('Todas juntas, combinando las distintas materias.','All together, with a mix of subjects.'):t('De lo más básico a actividades más completas. Puedes filtrar por tema.','From the basics to more complete activities. Filter by topic.');
   $('#totalListado').textContent=t(`${visibles.length} de ${apps.length}`,`${visibles.length} of ${apps.length}`);contador.textContent=cantidad(visibles.length);
   const filtrosNodo=$('#filtrosListado');filtrosNodo.replaceChildren();filtrosNodo.hidden=actual==='todas';filtrosNodo.setAttribute('aria-label',t('Temas de ','Topics in ')+tr(ficha.nombre));
   if(actual!=='todas')for(const [i,tema]of ['',...temas].entries()){
    const b=document.createElement('button');b.type='button';b.className='filtro-tema';b.id='filtro-catalogo-'+i;b.setAttribute('aria-pressed',String(activo===tema));const n=coincidencias.filter(a=>!tema||clasificacion[a.archivo][1].includes(tema)).length;b.textContent=tr(tema||'Todas')+` (${n})`;
    b.onclick=()=>{filtros[actual]=tema;try{localStorage.setItem('filtrosMateriasApps',JSON.stringify(filtros));}catch{}renderizar();document.getElementById(b.id)?.focus({preventScroll:true});};filtrosNodo.append(b);
   }
   contenedor.replaceChildren();
   for(const app of visibles){
    const card=crearTarjeta(app);card.querySelector('h3').textContent=tr(app.nombre);card.querySelector('p').textContent=tr(app.descripcion);card.setAttribute('aria-label',t('Abrir ','Open ')+tr(app.nombre));card.querySelector('.abrir').firstChild.textContent=t('Abrir actividad ','Open activity ');
    if(actual==='todas'){const m=materias.find(m=>m.id===clasificacion[app.archivo]?.[0]),chip=document.createElement('span');chip.className='materia-de-app';chip.textContent=tr(m.nombre);card.querySelector('h3').before(chip);}contenedor.append(card);
   }
   $('#sinResultados').hidden=visibles.length>0;
  }
  function seleccionar(id,{historial=true,enfocar=true}={}){
   if(id!==null&&!fichas.some(f=>f.id===id))id=null;actual=id;
   if(historial)try{history.pushState({...history.state,catalogoMateria:id},'');}catch{}
   renderizar();if(enfocar){const e=id===null?$('#tituloTemas'):$('#tituloListado');e.focus({preventScroll:true});(id===null?inicio:lista).scrollIntoView({block:'start',behavior:'instant'});}
   if(id&&narrar)leer();
  }
  function leer(){IdiomaVoz.hablar((actual?tr(fichas.find(f=>f.id===actual).nombre):t('Elige un tema para aprender.','Choose a subject to learn.'))+'. '+contador.textContent);}
  $('#volverTemas').onclick=()=>seleccionar(null);$('#todasDesdeMateria').onclick=()=>seleccionar('todas');$('#verResultados').onclick=()=>seleccionar('todas');
  buscar.addEventListener('input',renderizar);buscar.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();seleccionar('todas');}});
  $('#limpiarBusqueda').onclick=()=>{buscar.value='';if(actual&&actual!=='todas')filtros[actual]='';try{localStorage.setItem('filtrosMateriasApps',JSON.stringify(filtros));}catch{}renderizar();buscar.focus();};$('#escucharCatalogo').onclick=leer;
  addEventListener('popstate',e=>seleccionar(e.state?.catalogoMateria??null,{historial:false}));try{history.replaceState({...history.state,catalogoMateria:null},'');}catch{}
  const modal=$('#configuracionIndice'),pendientes=new Set();let aplicando=false;
  $('#configurarIndice').onclick=()=>{pendientes.clear();$('#narrarTemas').checked=narrar;modal.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));modal.showModal();};$('#cerrarConfigIndice').onclick=()=>modal.close();
  modal.addEventListener('change',e=>{if(!aplicando){e.stopImmediatePropagation();pendientes.add(e.target);}},true);
  modal.addEventListener('close',()=>{narrar=$('#narrarTemas').checked;try{localStorage.setItem('indice.narrarTemas',String(narrar));}catch{}aplicando=true;for(const e of pendientes)e.dispatchEvent(new Event('change',{bubbles:true}));aplicando=false;renderizar();IdiomaVoz.localizar();});
  IdiomaVoz.instalar('#vozIndice',{cambioIdioma:renderizar});
  function ajustar(){const z=parseFloat(getComputedStyle(document.body).zoom)||1;document.documentElement.style.setProperty('--ui-indice',1/z+'px');document.documentElement.style.setProperty('--inversa-indice',String(1/z));document.documentElement.style.setProperty('--alto-indice',(visualViewport?.height||innerHeight)/z+'px');document.body.classList.toggle('indice-horizontal',innerWidth>innerHeight);distribuirTarjetas();}
  $('#plegarIndice').onclick=()=>{plegado=!plegado;$('#panelIndice').hidden=plegado;$('#plegarIndice').setAttribute('aria-expanded',String(!plegado));$('#plegarIndice').setAttribute('aria-label',plegado?t('Mostrar panel','Show panel'):t('Ocultar panel','Hide panel'));document.body.classList.toggle('indice-plegado',plegado);distribuirTarjetas();};
  addEventListener('resize',ajustar);document.addEventListener('fullscreenchange',ajustar);visualViewport?.addEventListener('resize',ajustar);new MutationObserver(ajustar).observe(document.body,{attributes:true,attributeFilter:['style']});ajustar();renderizar();
  return {renderizar};
 }
 window.CatalogoAplicaciones={iniciar};
})();
