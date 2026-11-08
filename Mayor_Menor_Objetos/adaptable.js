'use strict';
// Medir en coordenadas CSS mantiene la escala al cambiar zoom u orientación.
(()=>{
 const zona=document.getElementById('zonaImagen'),actividad=document.querySelector('.actividad');
 const compacto=matchMedia('(orientation:landscape) and (max-height:650px)');
 const detalles=document.createElement('section');detalles.className='panel detalles-practica';detalles.hidden=true;
 document.querySelector('.guia').after(detalles);
 const ayudas=['ayudaTamano','temaActual','controlLlenado'].map(id=>{const el=document.getElementById(id),marca=document.createComment(id);el.before(marca);return {el,marca};});
 function distribuir(){detalles.hidden=!compacto.matches;for(const {el,marca}of ayudas){if(compacto.matches)detalles.append(el);else marca.after(el);}programar();}
 let pendiente=false;
 function ajustar(){
  pendiente=false;
  if(zona.hidden||!zona.children.length)return;
  const rect=actividad.getBoundingClientRect(),escala=rect.width/actividad.offsetWidth||1;
  const estilo=getComputedStyle(actividad),altoVentana=document.documentElement.clientHeight;
  const alturaUtil=(altoVentana-Math.max(0,rect.top))/escala;
  let resto=parseFloat(estilo.paddingTop)+parseFloat(estilo.paddingBottom)+4;
  for(const el of actividad.children){if(el===zona||el.hidden||getComputedStyle(el).position==='absolute')continue;const s=getComputedStyle(el);resto+=el.getBoundingClientRect().height/escala+(parseFloat(s.marginTop)||0)+(parseFloat(s.marginBottom)||0);}
  const tarjetas=[...zona.querySelectorAll('.tarjeta-opcion')];
  const extra=Math.max(...tarjetas.map(el=>{const s=getComputedStyle(el);return el.getBoundingClientRect().height/escala-el.querySelector('.muestra').getBoundingClientRect().height/escala;}),0);
  const zs=getComputedStyle(zona);resto+=extra+(parseFloat(zs.paddingTop)||0)+(parseFloat(zs.paddingBottom)||0)+16;
  // En pantallas pequeñas se permite desplazamiento vertical antes que dibujos ilegibles.
  const minimo=compacto.matches?100:innerWidth<=500?140:120;
  const alto=Math.round(Math.max(minimo,Math.min(620,alturaUtil-resto)));
  if(zona.style.getPropertyValue('--alto-disponible')!==alto+'px')zona.style.setProperty('--alto-disponible',alto+'px');
 }
 function programar(){if(!pendiente){pendiente=true;requestAnimationFrame(ajustar);}}
 const observer=new ResizeObserver(programar);
 for(const el of [document.querySelector('.cabecera'),document.querySelector('.modos'),document.querySelector('.lateral'),...actividad.children])observer.observe(el);
 new MutationObserver(programar).observe(zona,{childList:true});
 window.addEventListener('resize',programar);window.visualViewport?.addEventListener('resize',programar);
 compacto.addEventListener('change',distribuir);document.fonts?.ready.then(programar);distribuir();
})();
