/* Matching uses viewport coordinates, converted once into the local SVG space.
   No native drag image is used, so touch stays aligned at every page zoom. */
(() => {
 'use strict';
 const ns='http://www.w3.org/2000/svg';
 let o,raiz,svg,origenes=[],destinos=[],uniones=new Map(),seleccion=null,arrastre=null,temporal=null,frame=0,efecto=null,animando=false,terminado=false;
 const mezclar=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const nodo=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
 function reloj(n,i){
  const relieve=o.estiloAgujas!=='plano',hora=relieve?`url(#miniHora${i})`:'#dc2638',minutos=relieve?`url(#miniMin${i})`:'#275ba7';
  const etiqueta=(texto,angulo,y)=>o.nombresAgujas?`<g transform="rotate(${((angulo-90)%360+360)%360>90&&((angulo-90)%360+360)%360<270?90:-90} 300 ${y})"><text x="300" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-size="16" font-weight="800" fill="white">${texto}</text></g>`:'';
  return `<svg viewBox="0 0 600 600" role="img" aria-label="${o.t('Reloj','Clock')} ${i+1}" data-estilo="${o.estiloAgujas}"><defs><linearGradient id="miniHora${i}" gradientUnits="userSpaceOnUse" x1="287" y1="0" x2="313" y2="0"><stop stop-color="#9f1426"/><stop offset=".2" stop-color="#f95766"/><stop offset=".55" stop-color="#dc2638"/><stop offset="1" stop-color="#8f1125"/></linearGradient><linearGradient id="miniMin${i}" gradientUnits="userSpaceOnUse" x1="288" y1="0" x2="312" y2="0"><stop stop-color="#163675"/><stop offset=".2" stop-color="#75c9ff"/><stop offset=".55" stop-color="#275ba7"/><stop offset="1" stop-color="#142e65"/></linearGradient></defs><image href="reloj.svg" width="600" height="600"/><g transform="rotate(${n*.5} 300 296)"><path d="M300 296 V184" stroke="${hora}" stroke-width="${o.nombresAgujas?26:21}" stroke-linecap="round"/><path d="M300 157 L282 188 L318 188Z" fill="${hora}"/>${etiqueta(o.t('Hora','Hour'),n*.5,251)}</g><g transform="rotate(${n*6} 300 296)"><path d="M300 296 V109" stroke="${minutos}" stroke-width="${o.nombresAgujas?24:13}" stroke-linecap="round"/><path d="M300 77 L284 113 L316 113Z" fill="${minutos}"/>${etiqueta(o.t('Minutos','Minutes'),n*6,190)}</g><circle cx="300" cy="296" r="17" fill="white" stroke="#34538b" stroke-width="5"/></svg>`;
 }
 function iniciar(opciones){
  cancelar();o=opciones;raiz=o.contenedor;raiz.replaceChildren();uniones=new Map();seleccion=null;terminado=false;
  const horas=mezclar([...new Set(o.horas)]),n=Math.min(o.cantidad,horas.length);
  origenes=horas.slice(0,n);destinos=mezclar(horas.slice(0,n+o.extras));
  raiz.innerHTML=`<p class="guia-pareo">${o.t('Reloj analógico → hora digital','Analog clock → digital time')}</p><div class="pista-carreras"><svg class="rutas-reloj" aria-hidden="true"></svg><div class="columna-relojes salidas-reloj"></div><div class="carretera-central" aria-hidden="true"></div><div class="columna-relojes metas-reloj"></div></div><p class="progreso-pareo" role="status"></p>`;
  svg=raiz.querySelector('.rutas-reloj');
  origenes.forEach((n,i)=>{
   const b=document.createElement('button');b.className='salida-reloj';b.dataset.origen=i;b.setAttribute('aria-label',o.t('Unir reloj ','Match clock ')+(i+1));
   b.innerHTML=`${reloj(n,i)}<span class="carrito-reloj" aria-hidden="true">🏎️</span>`;
   b.addEventListener('lostpointercapture',()=>{if(arrastre?.b===b)cancelarArrastre();});b.onpointerdown=e=>iniciarArrastre(e,i);b.onclick=e=>{if(e.detail&&b.dataset.sinClick==='true'){delete b.dataset.sinClick;return;}elegir(i);};
   b.onkeydown=e=>{if(e.key==='Escape'){seleccion=null;pintar();}};raiz.querySelector('.salidas-reloj').append(b);
  });
  destinos.forEach((n,j)=>{
   const b=document.createElement('button');b.className='meta-reloj';b.dataset.destino=j;b.setAttribute('aria-label',o.t('Meta ','Finish line ')+o.digital(n));
   b.innerHTML=`<span class="bandera-reloj" aria-hidden="true">🏁</span><span class="hora-meta">${o.digital(n)}</span>`;b.onclick=()=>{if(seleccion!==null)unir(seleccion,j);};raiz.querySelector('.metas-reloj').append(b);
  });
  ajustar();
 }
 function punto(el){const r=el.getBoundingClientRect(),s=svg.getBoundingClientRect(),z=s.width/svg.viewBox.baseVal.width;return {x:(r.left+r.width/2-s.left)/z,y:(r.top+r.height/2-s.top)/z};}
 function extremo(i,esMeta=false){return punto(raiz.querySelector(esMeta?`[data-destino="${i}"] .bandera-reloj`:`[data-origen="${i}"] .carrito-reloj`));}
 function curva(a,b){const d=Math.max(12,Math.abs(b.x-a.x)*.44);return `M${a.x} ${a.y} C${a.x+d} ${a.y} ${b.x-d} ${b.y} ${b.x} ${b.y}`;}
 function pintar(){
  if(!svg)return;svg.replaceChildren();
  for(const [i,j]of uniones){const p=nodo('path',{d:curva(extremo(i),extremo(j,true)),class:'ruta-pareo '+(terminado?(origenes[i]===destinos[j]?'correcta':'incorrecta'):''),'data-ruta':i});svg.append(p);}
  if(temporal)svg.append(nodo('path',{d:curva(extremo(temporal.i),temporal.p),class:'ruta-pareo provisional'}));
  raiz.querySelectorAll('[data-origen]').forEach(b=>{const i=+b.dataset.origen;b.classList.toggle('elegido',i===seleccion);b.classList.toggle('conectado',uniones.has(i));b.setAttribute('aria-pressed',String(i===seleccion));});
  raiz.querySelectorAll('[data-destino]').forEach(b=>b.classList.toggle('conectado',[...uniones.values()].includes(+b.dataset.destino)));
  raiz.querySelector('.progreso-pareo').textContent=uniones.size+'/'+origenes.length+' '+o.t('relojes unidos','clocks matched');
 }
 function ajustar(){if(animando)return;if(!svg||!raiz?.getClientRects().length)return;const r=svg.getBoundingClientRect(),z=parseFloat(getComputedStyle(document.body).zoom)||1;svg.setAttribute('viewBox',`0 0 ${r.width/z} ${r.height/z}`);pintar();}
 function elegir(i){if(animando)return;seleccion=seleccion===i?null:i;pintar();}
 function unir(i,j){if(animando)return;for(const [a,b]of uniones)if(b===j&&a!==i)uniones.delete(a);uniones.set(i,j);seleccion=null;terminado=false;o.estado('');pintar();}
 function iniciarArrastre(e,i){if(animando||arrastre||e.button>0||e.isPrimary===false)return;e.preventDefault();seleccion=i;const b=e.currentTarget;b.setPointerCapture(e.pointerId);arrastre={id:e.pointerId,i,b,x:e.clientX,y:e.clientY,movido:false};pintar();window.addEventListener('pointermove',mover,{passive:false});window.addEventListener('pointerup',soltar);window.addEventListener('pointercancel',cancelarArrastre);}
 function mover(e){if(!arrastre||arrastre.id!==e.pointerId)return;e.preventDefault();const d=arrastre;d.x=e.clientX;d.y=e.clientY;d.movido=true;actualizarTemporal();if(!frame)frame=requestAnimationFrame(desplazar);}
 function actualizarTemporal(){if(!arrastre)return;const r=svg.getBoundingClientRect(),z=r.width/svg.viewBox.baseVal.width;temporal={i:arrastre.i,p:{x:(arrastre.x-r.left)/z,y:(arrastre.y-r.top)/z}};pintar();}
 function desplazar(){frame=0;if(!arrastre)return;const area=raiz,r=area.getBoundingClientRect(),y=arrastre.y,delta=y<r.top+50?-9:y>r.bottom-50?9:0;if(delta){area.scrollTop+=delta;actualizarTemporal();frame=requestAnimationFrame(desplazar);}}
 function soltar(e){if(!arrastre||arrastre.id!==e.pointerId)return;const d=arrastre,meta=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-destino]');d.b.dataset.sinClick='true';cancelarArrastre();if(meta)unir(d.i,+meta.dataset.destino);else{seleccion=d.i;pintar();}}
 function cancelarArrastre(){const d=arrastre;arrastre=null;temporal=null;cancelAnimationFrame(frame);frame=0;if(d)try{d.b.releasePointerCapture(d.id);}catch{}window.removeEventListener('pointermove',mover);window.removeEventListener('pointerup',soltar);window.removeEventListener('pointercancel',cancelarArrastre);if(svg)pintar();}
 function pista(){if(animando)return;const i=origenes.findIndex((n,i)=>!uniones.has(i)||destinos[uniones.get(i)]!==n);if(i<0)return;seleccion=i;const n=origenes[i],h=Math.floor(n/60)||12,m=n%60;o.estado(o.t(`En el reloj ${i+1}, la corta marca ${h} y la larga ${m} minutos. Busca ${o.digital(n)}.`,`On clock ${i+1}, the short hand shows ${h} and the long hand ${m} minutes. Find ${o.digital(n)}.`));pintar();o.decir(raiz.parentElement.querySelector('#estado').textContent);}
 function revisar(){
  if(animando)return;if(uniones.size<origenes.length){o.estado(o.t('Une todos los relojes antes de revisar.','Match every clock before checking.'));return;}
  terminado=true;pintar();const buenas=[...uniones].filter(([i,j])=>origenes[i]===destinos[j]);
  const todo=buenas.length===origenes.length,texto=todo?o.t('¡Buen trabajo, ','Great work, ')+o.nombre()+'!':o.t(`${buenas.length} de ${origenes.length}. Revisa las líneas rojas.`,`${buenas.length} of ${origenes.length}. Check the red lines.`);o.estado(texto,todo);o.decir(texto);carrera(buenas.map(([i])=>svg.querySelector(`[data-ruta="${i}"]`)));
 }
 let audio;
 function sonido(fin=false){try{audio ||= new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),g=audio.createGain();osc.connect(g).connect(audio.destination);osc.type=fin?'triangle':'sawtooth';const a=audio.currentTime;osc.frequency.setValueAtTime(fin?620:90,a);osc.frequency.exponentialRampToValueAtTime(fin?90:210,a+.35);g.gain.setValueAtTime(.035,a);g.gain.exponentialRampToValueAtTime(.001,a+.4);osc.start(a);osc.stop(a+.42);}catch{}}
 function carrera(rutas){
  if(!rutas.length)return;animando=true;sonido();const reducido=matchMedia('(prefers-reduced-motion:reduce)').matches,duracion=reducido?250:1500,coches=rutas.map(p=>{const g=nodo('g',{'aria-hidden':'true'});g.innerHTML='<path d="M-17 4L-15-7H-8L-2-15H11L17-6L23-3V7H-17Z" fill="#f48936" stroke="#fff" stroke-width="2"/><path d="M0-12H9L13-6H-4Z" fill="#b5e8ff"/><circle cx="-9" cy="8" r="5" fill="#293954"/><circle cx="15" cy="8" r="5" fill="#293954"/>';svg.append(g);return {p,g,l:p.getTotalLength()};});
  const estallidos=[],colores=['#ff6e91','#42bd9a','#517de4','#ffbe3d','#9c73e0'];let inicio;
  efecto={frame:0,grupos:coches.map(c=>c.g),rutas};
  function paso(ms){if(!efecto)return;inicio??=ms;const f=Math.min(1,(ms-inicio)/duracion);for(const {p,g,l}of coches){const a=p.getPointAtLength(l*f),b=p.getPointAtLength(Math.min(l,l*f+2));g.setAttribute('transform',`translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI})`);}
   if(f===1&&!estallidos.length){sonido(true);for(const c of coches){const p=c.p.getPointAtLength(c.l);c.g.remove();for(let i=0;i<(reducido?6:24);i++){const r=nodo(i%2?'circle':'rect',{fill:colores[i%5]});if(i%2){r.setAttribute('r',3);}else{r.setAttribute('width',6);r.setAttribute('height',6);}svg.append(r);efecto.grupos.push(r);estallidos.push({r,x:p.x,y:p.y,a:i*Math.PI*2/24,v:30+Math.random()*45});}}}
   const tiempo=(ms-inicio-duracion)/800;if(tiempo>=0)for(const p of estallidos){p.r.setAttribute('transform',`translate(${p.x+Math.cos(p.a)*p.v*tiempo} ${p.y+Math.sin(p.a)*p.v*tiempo+25*tiempo*tiempo}) rotate(${tiempo*160})`);p.r.setAttribute('opacity',Math.max(0,1-tiempo));}
   if(tiempo>=1){finalizarCarrera();return;}efecto.frame=requestAnimationFrame(paso);
  }efecto.frame=requestAnimationFrame(paso);
 }
 function finalizarCarrera(){if(efecto){cancelAnimationFrame(efecto.frame);for(const g of efecto.grupos)g.remove();efecto=null;}animando=false;}
 function cancelar(){cancelarArrastre();finalizarCarrera();}
 window.PareoReloj={iniciar,ajustar,revisar,pista,cancelar};
 addEventListener('resize',cancelarArrastre);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelar();});
})();
