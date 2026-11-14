/* Panel lateral reversible. Nunca se guarda oculto al iniciar otra visita. */
(()=>{
 function iniciar(){
  const archivo=decodeURIComponent(location.pathname).split('/').pop().toLowerCase();
  const opciones={
   'mayor_menor_objetos.html':['.app','.herramientas','.actividad'],
   'ordenar_objetos_tamano.html':['.app','.herramientas','.juego'],
   'mayor_menor.html':['#app','.herramientas-mayor','#gameScreen'],
   'mayor_menor_igual.html':['.app','.herramientas-signos','#gameArea'],
   'reconocer_numeros.html':['#game','#pareoSidebar,#herramientasJuego','#gameContent']
  }[archivo];if(!opciones)return;
  const root=document.querySelector(opciones[0]);if(!root)return;root.classList.add('con-panel-plegable');
  Object.assign(window.TEXTOS_INGLES||={}, {'Ocultar panel lateral':'Hide sidebar','Mostrar panel lateral':'Show sidebar','Pistas disponibles':'Available hints'});
  const boton=document.createElement('button');boton.className='alternar-panel-compartido';boton.type='button';boton.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></svg>';document.body.append(boton);
  const flotante=document.createElement('div');flotante.className='pistas-panel-compartido';flotante.hidden=true;document.body.append(flotante);
  const revisar=document.createElement('button');revisar.className='revisar-pareo-plegado';revisar.type='button';revisar.hidden=true;revisar.onclick=()=>document.getElementById('checkPareo')?.click();flotante.append(revisar);
  let oculto=false,sidebar=null,modo='',pendiente=false;const lugares=new Map();
  const texto=t=>window.IdiomaVoz?.t(t)||t;
  function actualizar(){
   pendiente=false;const horizontal=innerWidth>innerHeight,activo=archivo!=='reconocer_numeros.html'||root.classList.contains('activa');
   const actual=archivo==='reconocer_numeros.html'?root.querySelector(root.classList.contains('modo-pareo')?(horizontal?'#pareoSidebar':':scope > .encabezado'):'#herramientasJuego'):root.querySelector(opciones[1]);
   const siguienteModo=archivo==='reconocer_numeros.html'?root.dataset.modo||'':'';
   if(siguienteModo!==modo){oculto=false;modo=siguienteModo;}
   sidebar=actual;const plegado=activo&&!!sidebar&&oculto;
   root.classList.toggle('panel-lateral-oculto',plegado);root.classList.toggle('panel-pareo-superior-oculto',plegado&&archivo==='reconocer_numeros.html'&&root.classList.contains('modo-pareo')&&!horizontal);boton.hidden=!activo||!sidebar;
   root.querySelectorAll('.panel-ocultable-compartido').forEach(e=>{if(e!==sidebar)e.classList.remove('panel-ocultable-compartido');});
   if(sidebar){sidebar.classList.add('panel-ocultable-compartido');sidebar.id||='panelHerramientasCompartido';boton.setAttribute('aria-controls',sidebar.id);}
   boton.setAttribute('aria-expanded',String(!plegado));boton.title=texto(plegado?'Mostrar panel lateral':'Ocultar panel lateral');boton.setAttribute('aria-label',boton.title);
   const z=parseFloat(getComputedStyle(document.body).zoom)||1;boton.style.zoom=String(1/z);flotante.style.zoom=String(1/z);document.documentElement.style.setProperty('--inverso-panel-compartido',String(1/z));
   if(plegado&&sidebar){sidebar.querySelectorAll('.hint-controls,[data-pistas-panel]').forEach(e=>{if(!e.hidden){if(!lugares.has(e)){const marca=document.createComment('Lugar de las pistas');e.before(marca);lugares.set(e,marca);}flotante.append(e);}});}
   if(!plegado)for(const [e,marca]of lugares){if(marca.isConnected)marca.after(e);else e.remove();}
   revisar.hidden=!(horizontal&&plegado&&archivo==='reconocer_numeros.html'&&root.classList.contains('modo-pareo'));revisar.textContent=texto('✅ Revisar');revisar.disabled=document.getElementById('checkPareo')?.disabled??true;
   flotante.hidden=!plegado||![...flotante.children].some(e=>!e.hidden&&getComputedStyle(e).display!=='none');
  }
  function programar(){if(!pendiente){pendiente=true;requestAnimationFrame(actualizar);}}
  boton.onclick=()=>{oculto=!oculto;actualizar();window.dispatchEvent(new Event('resize'));};
  addEventListener('resize',programar);document.addEventListener('fullscreenchange',programar);
  new MutationObserver(programar).observe(root,{attributes:true,attributeFilter:['class','data-modo']});
  new MutationObserver(programar).observe(root,{attributes:true,subtree:true,attributeFilter:['disabled']});
  new MutationObserver(programar).observe(document.body,{attributes:true,attributeFilter:['style']});
  if(archivo==='reconocer_numeros.html')new MutationObserver(programar).observe(document.getElementById('gameContent'),{childList:true});
  actualizar();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
