'use strict';
(()=>{
 const app=document.querySelector('.app'),juego=document.querySelector('.juego'),lateral=document.querySelector('.lateral');
 const herramientas=document.createElement('aside');herramientas.className='herramientas';app.prepend(herramientas);
 herramientas.append(document.querySelector('.app>header'),lateral);
 const ajustes=document.querySelector('.ajustes'),abrir=document.createElement('button');abrir.id='abrirConfiguracion';abrir.className='boton secundaria';abrir.textContent='⚙ Configuración';
 const dialogo=document.createElement('dialog');dialogo.className='configuracion-formulario';dialogo.setAttribute('aria-labelledby','tituloConfiguracion');
 dialogo.innerHTML='<header><h2 id="tituloConfiguracion">Configuración</h2><button type="button" class="boton secundaria" id="cerrarConfiguracion" aria-label="Aplicar y cerrar">✕</button></header><form method="dialog"><div class="contenido-configuracion"></div><button class="boton principal" value="aplicar">Aplicar y volver al juego</button></form>';
 dialogo.querySelector('.contenido-configuracion').append(ajustes.querySelector('.campos'));ajustes.remove();document.body.append(dialogo);
 Object.assign(window.TEXTOS_INGLES,{'Aplicar y cerrar':'Apply and close','Aplicar y volver al juego':'Apply and return to the game','Los cambios se aplican al cerrar este formulario y se guardan en este navegador.':'Changes apply when you close this form and are saved in this browser.'});
 const pendientes=new Set();let aplicando=false;
 dialogo.addEventListener('change',e=>{if(aplicando)return;e.stopImmediatePropagation();pendientes.add(e.target);
  if(e.target.id==='criterio'){const anterior={...config};config.criterio=e.target.value;actualizarFamilias();Object.assign(config,anterior);pendientes.add(document.getElementById('familia'));}
 },true);
 abrir.onclick=()=>{pendientes.clear();dialogo.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));dialogo.showModal();};
 document.getElementById('cerrarConfiguracion').onclick=()=>dialogo.close();
 dialogo.addEventListener('close',()=>{const cambio=pendientes.size,familiaElegida=document.getElementById('familia').value;aplicando=true;for(const el of [...pendientes].sort((a,b)=>(b.id==='criterio')-(a.id==='criterio'))){if(el.id==='familia')el.value=familiaElegida;el.dispatchEvent(new Event('change',{bubbles:true}));}aplicando=false;if(cambio)document.getElementById('nuevaRonda').click();});
 lateral.prepend(abrir,document.getElementById('nuevaRonda'));
 lateral.append(document.getElementById('familiaActual'),document.getElementById('ayudaVisual'),document.getElementById('creditos-aplicaciones'));
 app.append(juego);document.querySelector('.layout').remove();
 let pendiente=false;
 function ajustar(){
  pendiente=false;
  const escala=app.getBoundingClientRect().width/app.offsetWidth||1;
  const alto=(window.visualViewport?.height||innerHeight)/escala,ancho=(window.visualViewport?.width||innerWidth)/escala;
  app.style.setProperty('--alto-vista',alto+'px');app.dataset.orientacion=innerWidth>innerHeight?'horizontal':'vertical';
  app.classList.toggle('compacta',alto<570||ancho<390);app.classList.toggle('muy-compacta',alto<330||ancho<270);
 }
 function programar(){if(!pendiente){pendiente=true;requestAnimationFrame(ajustar);}}
 const observer=new ResizeObserver(programar);for(const e of [app,juego,herramientas])observer.observe(e);
 new MutationObserver(programar).observe(document.body,{attributes:true,attributeFilter:['style']});
 window.addEventListener('resize',programar);window.visualViewport?.addEventListener('resize',programar);
 document.addEventListener('fullscreenchange',programar);document.addEventListener('webkitfullscreenchange',programar);
 document.fonts?.ready.then(programar);programar();
})();
