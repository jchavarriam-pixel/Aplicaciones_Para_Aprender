'use strict';
(()=>{
 const app=document.querySelector('.app'),juego=document.querySelector('.juego'),lateral=document.querySelector('.lateral');
 const herramientas=document.createElement('aside');herramientas.className='herramientas';app.prepend(herramientas);
 herramientas.append(document.querySelector('.app>header'),lateral);
 lateral.prepend(document.querySelector('.ajustes'),document.getElementById('nuevaRonda'));
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
