'use strict';
(()=>{
 const app=document.querySelector('.app'),actividad=document.querySelector('.actividad'),zona=document.getElementById('zonaImagen');
 const herramientas=document.createElement('aside');herramientas.className='herramientas';app.prepend(herramientas);
 herramientas.append(document.querySelector('.cabecera'),document.querySelector('.modos'));
 const lateral=document.querySelector('.lateral');herramientas.append(lateral);
 const detalles=document.createElement('section');detalles.className='panel detalles-practica';
 detalles.append(...['ayudaTamano','temaActual','controlLlenado'].map(id=>document.getElementById(id)));lateral.append(detalles);
 lateral.prepend(document.querySelector('.ajustes'),document.getElementById('nuevaRonda'));
 lateral.append(document.getElementById('creditos-aplicaciones'));
 app.append(actividad);document.querySelector('.distribucion').remove();
 let pendiente=false;
 function ajustar(){
  pendiente=false;
  const escala=app.getBoundingClientRect().width/app.offsetWidth||1;
  const alto=(window.visualViewport?.height||innerHeight)/escala,ancho=(window.visualViewport?.width||innerWidth)/escala;
  app.style.setProperty('--alto-vista',alto+'px');app.dataset.orientacion=innerWidth>innerHeight?'horizontal':'vertical';
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
