'use strict';
(()=>{
 const app=document.querySelector('.app'),juego=document.querySelector('.juego'),lateral=document.querySelector('.lateral');
 const herramientas=document.createElement('aside');herramientas.className='herramientas';app.prepend(herramientas);
 herramientas.append(document.querySelector('.app>header'),lateral);
 const ajustes=document.querySelector('.ajustes'),abrir=document.createElement('button');abrir.id='abrirConfiguracion';abrir.className='boton secundaria';abrir.textContent='⚙ Configuración';
 const dialogo=document.createElement('dialog');dialogo.className='configuracion-formulario';dialogo.setAttribute('aria-labelledby','tituloConfiguracion');
 dialogo.innerHTML='<header><h2 id="tituloConfiguracion">Configuración</h2><button type="button" class="boton secundaria" id="cerrarConfiguracion" aria-label="Aplicar y cerrar">✕</button></header><form method="dialog"><div class="contenido-configuracion"></div><button class="boton principal" value="aplicar">Aplicar y volver al juego</button></form>';
 dialogo.querySelector('.contenido-configuracion').append(ajustes.querySelector('.campos'));ajustes.remove();document.body.append(dialogo);
 const campoNombre=document.getElementById('nombre').closest('label');campoNombre.classList.add('nombre-cabecera');herramientas.querySelector('h1').after(campoNombre);
 dialogo.querySelector('.campos').append(document.getElementById('preferenciasIdiomaVoz'));
 Object.assign(window.TEXTOS_INGLES,{'Aplicar y cerrar':'Apply and close','Aplicar y volver al juego':'Apply and return to the game','Los cambios se aplican al cerrar este formulario y se guardan en este navegador.':'Changes apply when you close this form and are saved in this browser.'});
 const pendientes=new Set();let aplicando=false;
 const campos=dialogo.querySelector('.campos');campos.append(document.getElementById('preferenciasIdiomaVoz'));
 document.addEventListener('DOMContentLoaded',()=>{
  const selector=document.getElementById('criterio'),etiqueta=selector.closest('label');etiqueta.hidden=true;
  const grupo=document.createElement('fieldset');grupo.className='caracteristicas-config';grupo.innerHTML='<legend>Características para practicar</legend><div class="lista-caracteristicas"></div><p id="estadoCaracteristicas" class="nota" role="status"></p>';
  etiqueta.before(grupo);
  for(const c of criterios){const label=document.createElement('label');label.className='opcion';const check=document.createElement('input');check.type='checkbox';check.dataset.caracteristica=c.id;check.checked=config.caracteristicas.includes(c.id);label.append(check,document.createTextNode(c.nombre));grupo.querySelector('.lista-caracteristicas').append(label);}
  grupo.addEventListener('change',e=>{if(aplicando)return;const marcadas=[...grupo.querySelectorAll('input:checked')];if(!marcadas.length){e.target.checked=true;document.getElementById('estadoCaracteristicas').textContent='Selecciona al menos una característica.';return;}
   document.getElementById('estadoCaracteristicas').textContent='';selector.value=marcadas.length===1?marcadas[0].dataset.caracteristica:'mixto';selector.dispatchEvent(new Event('change',{bubbles:true}));
  });
 });
 Object.assign(window.TEXTOS_INGLES,{'Características para practicar':'Features to practise','Selecciona al menos una característica.':'Select at least one feature.'});
 dialogo.addEventListener('change',e=>{if(aplicando)return;pendientes.add(e.target);if(e.target.matches('[data-caracteristica]'))return;e.stopImmediatePropagation();
  if(e.target.id==='criterio'){const anterior={...config};config.criterio=e.target.value;actualizarFamilias();Object.assign(config,anterior);pendientes.add(document.getElementById('familia'));}
 },true);
 abrir.onclick=()=>{pendientes.clear();dialogo.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));dialogo.showModal();};
 document.getElementById('cerrarConfiguracion').onclick=()=>dialogo.close();
 dialogo.addEventListener('close',()=>{const cambio=pendientes.size,familiaElegida=document.getElementById('familia').value;if(cambio){config.caracteristicas=[...dialogo.querySelectorAll('[data-caracteristica]:checked')].map(e=>e.dataset.caracteristica);mazoCriterios=[];guardar();}aplicando=true;for(const el of [...pendientes].sort((a,b)=>(b.id==='criterio')-(a.id==='criterio'))){if(el.id==='familia')el.value=familiaElegida;el.dispatchEvent(new Event('change',{bubbles:true}));}aplicando=false;if(cambio)document.getElementById('nuevaRonda').click();});
 herramientas.insertBefore(document.querySelector('.guia'),lateral);lateral.prepend(abrir,document.getElementById('nuevaRonda'));
 const titulo=document.querySelector('.herramientas h1'),insignia=document.createElement('span');insignia.className='insignia-titulo';insignia.textContent='🧩';insignia.setAttribute('aria-hidden','true');titulo.prepend(insignia);
 const casa=document.querySelector('.inicio');casa.textContent='⌂';casa.setAttribute('aria-label','Aplicaciones');casa.title='Aplicaciones';
 lateral.append(document.getElementById('familiaActual'));document.body.append(document.getElementById('creditos-aplicaciones'));
 app.append(juego);document.querySelector('.layout').remove();
 let proporcion=.25;
 try{const n=Number(localStorage.getItem('ordenarObjetos.anchoHerramientas'));if(n>=.18&&n<=.48)proporcion=n;}catch{}
 const borde=document.createElement('div');borde.className='ajustar-columna';borde.tabIndex=0;borde.setAttribute('role','separator');borde.setAttribute('aria-orientation','vertical');borde.setAttribute('aria-label','Ajustar ancho de la barra de herramientas');app.append(borde);
 function guardarAncho(){try{localStorage.setItem('ordenarObjetos.anchoHerramientas',String(proporcion));}catch{}}
 borde.addEventListener('pointerdown',e=>{if(app.dataset.orientacion!=='horizontal')return;e.preventDefault();borde.setPointerCapture(e.pointerId);borde.classList.add('arrastrando');});
 borde.addEventListener('pointermove',e=>{if(!borde.hasPointerCapture(e.pointerId))return;const r=app.getBoundingClientRect();proporcion=Math.max(.18,Math.min(.48,(e.clientX-r.left)/r.width));programar();});
 for(const tipo of ['pointerup','pointercancel'])borde.addEventListener(tipo,e=>{if(borde.hasPointerCapture(e.pointerId))borde.releasePointerCapture(e.pointerId);borde.classList.remove('arrastrando');guardarAncho();});
 borde.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();proporcion=e.key==='Home'?.25:Math.max(.18,Math.min(.48,proporcion+(e.key==='ArrowRight'?.02:-.02)));guardarAncho();programar();});
 let pendiente=false;
 function ajustar(){
  pendiente=false;
  const escala=app.getBoundingClientRect().width/app.offsetWidth||1;
  const alto=(window.visualViewport?.height||innerHeight)/escala,ancho=(window.visualViewport?.width||innerWidth)/escala;
  app.style.setProperty('--alto-vista',alto+'px');
  const col=Math.min(app.offsetWidth*.48,Math.max(Math.min(190,app.offsetWidth*.3),app.offsetWidth*proporcion));app.style.setProperty('--ancho-herramientas',col+'px');borde.style.left=(col+5)+'px';borde.hidden=innerWidth<=innerHeight;borde.setAttribute('aria-valuemin','18');borde.setAttribute('aria-valuemax','48');borde.setAttribute('aria-valuenow',String(Math.round(proporcion*100)));app.dataset.orientacion=innerWidth>innerHeight?'horizontal':'vertical';
  app.classList.toggle('compacta',alto<570||ancho<390);app.classList.toggle('muy-compacta',alto<330||ancho<270);
 }
 function programar(){if(!pendiente){pendiente=true;requestAnimationFrame(ajustar);}}
 const observer=new ResizeObserver(programar);for(const e of [app,juego,herramientas])observer.observe(e);
 new MutationObserver(programar).observe(document.body,{attributes:true,attributeFilter:['style']});
 window.addEventListener('resize',programar);window.visualViewport?.addEventListener('resize',programar);
 document.addEventListener('fullscreenchange',programar);document.addEventListener('webkitfullscreenchange',programar);
 document.fonts?.ready.then(programar);programar();
})();
