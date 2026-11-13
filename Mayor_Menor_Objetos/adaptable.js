'use strict';
(()=>{
 Object.assign(window.TEXTOS_INGLES||(window.TEXTOS_INGLES={}),{'Animación':'Animation'});
 const app=document.querySelector('.app'),actividad=document.querySelector('.actividad'),zona=document.getElementById('zonaImagen');
 const herramientas=document.createElement('aside');herramientas.className='herramientas';app.prepend(herramientas);
 herramientas.append(document.querySelector('.cabecera'),document.querySelector('.guia'),document.querySelector('.modos'));
 const lateral=document.querySelector('.lateral');herramientas.append(lateral);
 const detalles=document.createElement('section');detalles.className='panel detalles-practica';
 detalles.append(...['ayudaTamano','temaActual'].map(id=>document.getElementById(id)));lateral.append(detalles);
 const ajustes=document.querySelector('.ajustes');
 const abrir=document.createElement('button');abrir.className='boton secundaria';abrir.textContent='⚙ Configuración';abrir.id='abrirConfiguracion';
 const dialogo=document.createElement('dialog');dialogo.className='configuracion-formulario';dialogo.setAttribute('aria-labelledby','tituloConfiguracion');
 dialogo.innerHTML='<header><h2 id="tituloConfiguracion">Configuración</h2><button type="button" class="boton secundaria" id="cerrarConfiguracion" aria-label="Aplicar y cerrar">✕</button></header><form method="dialog"><div class="contenido-configuracion"></div><button class="boton principal" value="aplicar">Aplicar y volver al juego</button></form>';
 dialogo.querySelector('.contenido-configuracion').append(ajustes.querySelector('.campos'));ajustes.remove();document.body.append(dialogo);
 const pendientes=new Set();let aplicando=false;
 dialogo.addEventListener('change',e=>{if(!aplicando){e.stopImmediatePropagation();pendientes.add(e.target);}},true);
 const acciones=[];dialogo.addEventListener('click',e=>{const b=e.target.closest('#todasCategorias,#basicasCategorias');if(b&&!aplicando){e.preventDefault();e.stopImmediatePropagation();acciones.push(b);}},true);
 abrir.onclick=()=>{pendientes.clear();acciones.length=0;dialogo.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));dialogo.showModal();};
 document.getElementById('cerrarConfiguracion').onclick=()=>dialogo.close();
 dialogo.addEventListener('close',()=>{aplicando=true;const cambio=pendientes.size||acciones.length;for(const el of pendientes)el.dispatchEvent(new Event('change',{bubbles:true}));for(const b of acciones)b.click();aplicando=false;if(cambio)document.getElementById('nuevaRonda').click();});
 lateral.prepend(abrir,document.getElementById('nuevaRonda'));
 actividad.append(document.querySelector('.acciones'));
 document.querySelector('.pregunta-fila').append(document.getElementById('controlLlenado'));
 const titulo=document.querySelector('.cabecera h1');titulo.classList.add('titulo-aventura');
 const insignia=document.createElement('span');insignia.className='insignia-aventura';insignia.textContent='🔎';insignia.setAttribute('aria-hidden','true');titulo.prepend(insignia);
 lateral.append(document.getElementById('creditos-aplicaciones'));
 app.append(actividad);document.querySelector('.distribucion').remove();
 let proporcion=.25;
 try{const n=Number(localStorage.getItem('exploraCompara.anchoHerramientas'));if(n>=.18&&n<=.48)proporcion=n;}catch{}
 const borde=document.createElement('div');borde.className='ajustar-columna';borde.tabIndex=0;borde.setAttribute('role','separator');borde.setAttribute('aria-orientation','vertical');borde.setAttribute('aria-label','Ajustar ancho de la barra de herramientas');borde.title='Arrastra para cambiar el ancho';app.append(borde);
 function guardarAncho(){try{localStorage.setItem('exploraCompara.anchoHerramientas',String(proporcion));}catch{}}
 function cambiarAncho(x){const r=app.getBoundingClientRect();proporcion=Math.max(.18,Math.min(.48,(x-r.left)/r.width));programar();}
 borde.addEventListener('pointerdown',e=>{if(app.dataset.orientacion!=='horizontal')return;e.preventDefault();borde.setPointerCapture(e.pointerId);borde.classList.add('arrastrando');});
 borde.addEventListener('pointermove',e=>{if(borde.hasPointerCapture(e.pointerId))cambiarAncho(e.clientX);});
 for(const tipo of ['pointerup','pointercancel'])borde.addEventListener(tipo,e=>{if(borde.hasPointerCapture(e.pointerId))borde.releasePointerCapture(e.pointerId);borde.classList.remove('arrastrando');guardarAncho();});
 borde.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();proporcion=e.key==='Home'?.25:Math.max(.18,Math.min(.48,proporcion+(e.key==='ArrowRight'?.02:-.02)));guardarAncho();programar();});
 let pendiente=false;
 function ajustar(){
  pendiente=false;
  const escala=app.getBoundingClientRect().width/app.offsetWidth||1;
  const alto=(window.visualViewport?.height||innerHeight)/escala,ancho=(window.visualViewport?.width||innerWidth)/escala;
  app.style.setProperty('--alto-vista',alto+'px');
  const anchoColumna=Math.min(app.offsetWidth*.48,Math.max(Math.min(190,app.offsetWidth*.3),app.offsetWidth*proporcion));app.style.setProperty('--ancho-herramientas',anchoColumna+'px');borde.style.left=(anchoColumna+5)+'px';borde.hidden=innerWidth<=innerHeight;borde.setAttribute('aria-valuemin','18');borde.setAttribute('aria-valuemax','48');borde.setAttribute('aria-valuenow',String(Math.round(proporcion*100)));app.dataset.orientacion=innerWidth>innerHeight?'horizontal':'vertical';
  app.classList.toggle('compacta',alto<570||ancho<390);app.classList.toggle('muy-compacta',alto<330||ancho<270);
  const apoyos=[...zona.querySelectorAll('.apoyo-capacidad')];
  const altoApoyo=Math.ceil(Math.max(0,...apoyos.map(el=>{const s=getComputedStyle(el),hijos=[...el.children].filter(e=>getComputedStyle(e).display!=='none');return hijos.reduce((h,e)=>h+e.getBoundingClientRect().height/escala,0)+Math.max(0,hijos.length-1)*(parseFloat(s.rowGap)||0)+(parseFloat(s.paddingTop)||0)+(parseFloat(s.paddingBottom)||0);})));
  zona.style.setProperty('--alto-apoyo',altoApoyo+'px');
  const muestras=[...zona.querySelectorAll('.muestra')];
  const disponible=muestras.length?Math.max(1,Math.floor(Math.min(...muestras.map(e=>e.getBoundingClientRect().height/escala)))):1;
  if(zona.style.getPropertyValue('--alto-disponible')!==disponible+'px')zona.style.setProperty('--alto-disponible',disponible+'px');
 }
 function programar(){if(!pendiente){pendiente=true;requestAnimationFrame(ajustar);}}
 const observer=new ResizeObserver(programar);for(const el of [app,actividad,zona,herramientas])observer.observe(el);
 new MutationObserver(programar).observe(zona,{childList:true,subtree:true,characterData:true});
 new MutationObserver(programar).observe(document.body,{attributes:true,attributeFilter:['style']});
 window.addEventListener('resize',programar);window.visualViewport?.addEventListener('resize',programar);
 document.addEventListener('fullscreenchange',programar);document.addEventListener('webkitfullscreenchange',programar);
 document.fonts?.ready.then(programar);programar();
})();
