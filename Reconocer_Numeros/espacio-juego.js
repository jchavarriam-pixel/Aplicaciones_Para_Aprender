'use strict';
(()=>{
 const home=document.getElementById('home'),game=document.getElementById('game'),contenido=document.getElementById('gameContent'),cabecera=game.querySelector('.encabezado');
 const herramientas=document.createElement('aside');herramientas.id='herramientasJuego';herramientas.hidden=true;game.prepend(herramientas);
 const casa=cabecera.querySelector('[onclick="goHome()"]');casa.textContent='⌂';casa.setAttribute('aria-label','Volver a los modos de juego');casa.title='Volver a los modos de juego';
 Object.assign(window.TEXTOS_INGLES,{'Volver a los modos de juego':'Back to game modes'});
 let frame=0;
 function ajustar(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
  const z=parseFloat(getComputedStyle(document.body).zoom)||1,u=1/z;
  // Reducir el contenido de cada tarjeta antes de permitir que se desborde.
  home.querySelectorAll('.modo').forEach(el=>{
   let escala=1;el.style.setProperty('--ajuste-tarjeta',escala);
   while((el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)&&escala>.45){escala-=.05;el.style.setProperty('--ajuste-tarjeta',escala);}
  });
  game.style.setProperty('--alto-juego',((visualViewport?.height||innerHeight)/z)+'px');game.style.setProperty('--unidad-juego',u+'px');
  game.dataset.modo=state.mode;game.classList.toggle('juego-horizontal',innerWidth>innerHeight);
  if([2,3,4].includes(state.mode)){
   herramientas.hidden=false;if(cabecera.parentNode!==herramientas)herramientas.prepend(cabecera);
   const guia=contenido.querySelector('.guia-actividad');if(guia){herramientas.querySelectorAll('.guia-actividad,.nueva-ronda').forEach(e=>e.remove());herramientas.append(guia);}
   const nueva=contenido.querySelector('.nueva-ronda,[onclick="startMode2()"]');if(nueva){nueva.classList.add('nueva-ronda');herramientas.append(nueva);}
   const count=state.data?.total||1,cols=innerWidth>innerHeight?(count<=6?3:5):(count<=4?2:3);
   game.style.setProperty('--columnas-cajas',Math.min(cols,count));game.style.setProperty('--filas-cajas',Math.ceil(count/cols));
   const colsBanco=Math.min(count,innerWidth>innerHeight?(count<=6?3:5):(count<=4?2:3));game.style.setProperty('--columnas-banco',colsBanco);game.style.setProperty('--filas-banco',Math.ceil(count/colsBanco));
   const banco=contenido.querySelector('.pool-items');if(banco){const ancho=banco.getBoundingClientRect().width/colsBanco,cifras=Math.max(...state.data.numbers.map(n=>String(n).length));game.style.setProperty('--fuente-banco',Math.min(24,Math.max(10,(ancho-10)/(cifras*.65)))*u+'px');}
   const cajas=contenido.querySelector('.grid-cajas');if(cajas){const cifras=Math.max(...state.data.numbers.map(n=>String(n).length)),ancho=cajas.getBoundingClientRect().width/Math.min(cols,count)-50;game.style.setProperty('--fuente-caja',Math.max(10,Math.min(23,(ancho-8)/(cifras*.65)))*u+'px');}
   if(state.mode===3){contenido.querySelectorAll('.drag-num').forEach(el=>{el.style.fontSize='';const disponible=el.clientWidth-4;if(disponible<=0)return;const estilo=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');ctx.font=`${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`;const ancho=ctx.measureText(el.textContent).width;if(ancho>disponible)el.style.fontSize=(parseFloat(estilo.fontSize)*disponible/ancho*.93)+'px';});}
   if(state.mode===2)layoutCorral();
   const numero=contenido.querySelector('.big-card');if(numero){const w=numero.getBoundingClientRect().width,n=String(state.data.numbers[state.data.index]).length;game.style.setProperty('--fuente-numero',Math.max(24,Math.min(80,(w-20)/(n*.65)))*u+'px');}
  }else{
   herramientas.hidden=true;if(cabecera.parentNode===herramientas)game.prepend(cabecera);
   if(state.mode===1&&document.getElementById('pareo')){game.style.setProperty('--filas-pareo',Math.max(state.data.left.length,state.data.right.length));fitPareo();drawLinks();}
   if(state.mode===2&&document.getElementById('corral'))layoutCorral();
  }
 });}
 new MutationObserver(cambios=>{if(state.mode===3||cambios.some(c=>c.target===contenido))ajustar();}).observe(contenido,{childList:true,subtree:true});new MutationObserver(ajustar).observe(document.body,{attributes:true,attributeFilter:['style']});
 new MutationObserver(ajustar).observe(home,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',ajustar);document.addEventListener('fullscreenchange',ajustar);visualViewport?.addEventListener('resize',ajustar);
 new ResizeObserver(ajustar).observe(home.querySelector('.modos'));ajustar();
})();
