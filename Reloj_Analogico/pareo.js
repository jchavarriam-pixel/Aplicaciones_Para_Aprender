/* Matching uses viewport coordinates, converted once into the local SVG space.
   No native drag image is used, so touch stays aligned at every page zoom. */
(() => {
 'use strict';
 const ns='http://www.w3.org/2000/svg';
 let o,raiz,svg,origenes=[],destinos=[],uniones=new Map(),seleccion=null,arrastre=null,temporal=null,frame=0,efecto=null,animando=false,terminado=false;
 const mezclar=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const nodo=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
 function reloj(n,i){return DibujosReloj.reloj(n,{id:'pareo'+i,nombres:o.nombresAgujas,relieve:o.estiloAgujas!=='plano',hora:o.t('Hora','Hour'),minutos:o.t('Minutos','Minutes')}).replace('class="esfera-pareo"',`class="esfera-pareo" role="img" aria-label="${o.t('Reloj','Clock')} ${i+1}" data-estilo="${o.estiloAgujas}"`);}
 function iniciar(opciones){
  cancelar();o=opciones;raiz=o.contenedor;raiz.replaceChildren();uniones=new Map();seleccion=null;terminado=false;
  const horas=mezclar([...new Set(o.horas)]),n=Math.min(o.cantidad,horas.length);
  origenes=horas.slice(0,n);destinos=mezclar(horas.slice(0,n+o.extras));
  raiz.innerHTML=`<p class="guia-pareo">${o.t('Reloj analógico → hora digital','Analog clock → digital time')}</p><div class="pista-carreras"><svg class="rutas-reloj" aria-hidden="true"></svg><div class="columna-relojes salidas-reloj"></div><div class="carretera-central" aria-hidden="true"></div><div class="columna-relojes metas-reloj"></div></div><p class="progreso-pareo" role="status"></p>`;
  svg=raiz.querySelector('.rutas-reloj');
  origenes.forEach((n,i)=>{
   const b=document.createElement('button');b.className='salida-reloj';b.dataset.origen=i;b.setAttribute('aria-label',o.t('Unir reloj ','Match clock ')+(i+1));
   b.innerHTML=`${reloj(n,i)}<span class="carrito-reloj" aria-hidden="true"><svg viewBox="0 0 120 72">${DibujosReloj.carro(i)}</svg></span>`;
   b.addEventListener('lostpointercapture',()=>{if(arrastre?.b===b)cancelarArrastre();});b.onpointerdown=e=>iniciarArrastre(e,i);b.onclick=e=>{if(e.detail&&b.dataset.sinClick==='true'){delete b.dataset.sinClick;return;}elegir(i);};
   b.onkeydown=e=>{if(e.key==='Escape'){seleccion=null;pintar();}};raiz.querySelector('.salidas-reloj').append(b);
  });
  destinos.forEach((n,j)=>{
   const b=document.createElement('button');b.className='meta-reloj';b.dataset.destino=j;b.setAttribute('aria-label',o.t('Meta ','Finish line ')+o.digital(n));
   b.innerHTML=`<span class="bandera-reloj" aria-hidden="true">${DibujosReloj.meta()}</span><span class="pantalla-meta"><span class="rotulo-meta">${o.t("Meta","Finish")}</span><span class="hora-meta">${o.digital(n)}</span></span>`;b.onclick=()=>{if(seleccion!==null)unir(seleccion,j);};raiz.querySelector('.metas-reloj').append(b);
  });
  ajustar();
 }
 function punto(el){const r=el.getBoundingClientRect(),s=svg.getBoundingClientRect(),z=s.width/svg.viewBox.baseVal.width;return {x:(r.left+r.width/2-s.left)/z,y:(r.top+r.height/2-s.top)/z};}
 function extremo(i,esMeta=false){return punto(raiz.querySelector(esMeta?`[data-destino="${i}"] .bandera-reloj`:`[data-origen="${i}"] .carrito-reloj`));}
 function curva(a,b){const d=Math.max(12,Math.abs(b.x-a.x)*.44);return `M${a.x} ${a.y} C${a.x+d} ${a.y} ${b.x-d} ${b.y} ${b.x} ${b.y}`;}
 function pintar(){
  if(!svg)return;svg.replaceChildren();
  for(const [i,j]of uniones){const p=nodo('path',{d:curva(extremo(i),extremo(j,true)),class:'ruta-pareo '+(terminado?(origenes[i]===destinos[j]?'correcta':'incorrecta'):''),'data-ruta':i});svg.append(nodo('path',{d:p.getAttribute('d'),class:'borde-ruta'}),p,nodo('path',{d:p.getAttribute('d'),class:'centro-ruta'}));}
  if(temporal)svg.append(nodo('path',{d:curva(extremo(temporal.i),temporal.p),class:'ruta-pareo provisional'}));
  raiz.querySelectorAll('[data-origen]').forEach(b=>{const i=+b.dataset.origen;b.classList.toggle('elegido',i===seleccion);b.classList.toggle('conectado',uniones.has(i));b.setAttribute('aria-pressed',String(i===seleccion));});
  raiz.querySelectorAll('[data-destino]').forEach(b=>b.classList.toggle('conectado',[...uniones.values()].includes(+b.dataset.destino)));
  raiz.querySelector('.progreso-pareo').textContent=uniones.size+'/'+origenes.length+' '+o.t('relojes unidos','clocks matched');
 }
 function ajustar(){
  if(!svg||!raiz?.getClientRects().length)return;
  if(animando){const r=svg.getBoundingClientRect(),z=parseFloat(getComputedStyle(document.body).zoom)||1;if(Math.abs(r.width-efecto.medida.width)<.5&&Math.abs(r.height-efecto.medida.height)<.5&&z===efecto.medida.z)return;finalizarCarrera();}
  const z=parseFloat(getComputedStyle(document.body).zoom)||1,col=raiz.querySelector('.salidas-reloj').getBoundingClientRect();
  const alto=raiz.getBoundingClientRect().height-54,filas=Math.max(origenes.length,destinos.length),disponible=(alto-14*(filas-1))/filas;
  const diametro=Math.min(250,Math.max(innerWidth<600?124:132,Math.min(col.width-14,disponible-14)));
  raiz.style.setProperty('--diametro-pareo',diametro/z+'px');
  const panel=raiz.querySelector('.pantalla-meta'),estilo=getComputedStyle(panel),ancho=panel.getBoundingClientRect().width-(parseFloat(estilo.paddingLeft)+parseFloat(estilo.paddingRight))*z;raiz.style.setProperty('--fuente-digital',Math.min(42,Math.max(16,(ancho-14)/3.1))/z+'px');
  const r=svg.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${r.width/z} ${r.height/z}`);pintar();
 }
 function elegir(i){if(animando)return;seleccion=seleccion===i?null:i;pintar();}
 function unir(i,j){if(animando)return;for(const [a,b]of uniones)if(b===j&&a!==i)uniones.delete(a);uniones.set(i,j);seleccion=null;terminado=false;raiz.querySelectorAll('.llegada').forEach(e=>e.classList.remove('llegada'));o.estado('');pintar();}
 function iniciarArrastre(e,i){if(animando||arrastre||e.button>0||e.isPrimary===false)return;e.preventDefault();seleccion=i;const b=e.currentTarget;b.setPointerCapture(e.pointerId);arrastre={id:e.pointerId,i,b,x:e.clientX,y:e.clientY,movido:false};pintar();window.addEventListener('pointermove',mover,{passive:false});window.addEventListener('pointerup',soltar);window.addEventListener('pointercancel',cancelarArrastre);}
 function mover(e){if(!arrastre||arrastre.id!==e.pointerId)return;e.preventDefault();const d=arrastre;d.x=e.clientX;d.y=e.clientY;d.movido=true;actualizarTemporal();if(!frame)frame=requestAnimationFrame(desplazar);}
 function actualizarTemporal(){if(!arrastre)return;const r=svg.getBoundingClientRect(),z=r.width/svg.viewBox.baseVal.width;temporal={i:arrastre.i,p:{x:(arrastre.x-r.left)/z,y:(arrastre.y-r.top)/z}};pintar();}
 function desplazar(){frame=0;if(!arrastre)return;const area=raiz,r=area.getBoundingClientRect(),y=arrastre.y,delta=y<r.top+50?-9:y>r.bottom-50?9:0;if(delta){area.scrollTop+=delta;actualizarTemporal();frame=requestAnimationFrame(desplazar);}}
 function soltar(e){if(!arrastre||arrastre.id!==e.pointerId)return;const d=arrastre,meta=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-destino]');d.b.dataset.sinClick='true';cancelarArrastre();if(meta)unir(d.i,+meta.dataset.destino);else{seleccion=d.i;pintar();}}
 function cancelarArrastre(){const d=arrastre;arrastre=null;temporal=null;cancelAnimationFrame(frame);frame=0;if(d)try{d.b.releasePointerCapture(d.id);}catch{}window.removeEventListener('pointermove',mover);window.removeEventListener('pointerup',soltar);window.removeEventListener('pointercancel',cancelarArrastre);if(svg)pintar();}
 function pista(){if(animando)return;const i=origenes.findIndex((n,i)=>!uniones.has(i)||destinos[uniones.get(i)]!==n);if(i<0)return;seleccion=i;const n=origenes[i],h=Math.floor(n/60)||12,minutos=o.cantidadMinutos(n%60);o.estado(o.t(`En el reloj ${i+1}, la corta marca ${h} y la larga marca ${minutos}. Busca ${o.digital(n)}.`,`On clock ${i+1}, the short hand shows ${h} and the long hand shows ${minutos}. Find ${o.digital(n)}.`));pintar();o.decir(raiz.parentElement.querySelector('#estado').textContent);}
 function revisar(){
  if(animando)return;if(uniones.size<origenes.length){o.estado(o.t('Une todos los relojes antes de revisar.','Match every clock before checking.'));return;}
  terminado=true;pintar();const buenas=[...uniones].filter(([i,j])=>origenes[i]===destinos[j]);
  const todo=buenas.length===origenes.length,texto=todo?o.t('¡Buen trabajo, ','Great work, ')+o.nombre()+'!':o.t(`${buenas.length} de ${origenes.length}. Revisa las líneas rojas.`,`${buenas.length} of ${origenes.length}. Check the red lines.`);o.estado(texto,todo);o.decir(texto);ajustar();carrera(buenas.map(([i])=>svg.querySelector(`[data-ruta="${i}"]`)));
 }
 let audio;
 function sonido(fin=false){
  try{
   audio ||= new(window.AudioContext||window.webkitAudioContext)();audio.resume();const a=audio.currentTime,g=audio.createGain();g.connect(audio.destination);
   if(fin){
    const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*.24),audio.sampleRate),datos=buffer.getChannelData(0);for(let i=0;i<datos.length;i++)datos[i]=(Math.random()*2-1)*(1-i/datos.length);
    const ruido=audio.createBufferSource(),f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=1600;ruido.buffer=buffer;ruido.connect(f).connect(g);g.gain.setValueAtTime(.045,a);g.gain.exponentialRampToValueAtTime(.001,a+.28);ruido.start(a);ruido.stop(a+.28);
   }else{
    const motor=audio.createOscillator();motor.type='triangle';motor.connect(g);motor.frequency.setValueAtTime(80,a);motor.frequency.exponentialRampToValueAtTime(220,a+.8);motor.frequency.exponentialRampToValueAtTime(120,a+2.4);g.gain.setValueAtTime(.001,a);g.gain.linearRampToValueAtTime(.025,a+.18);g.gain.exponentialRampToValueAtTime(.001,a+2.6);motor.start(a);motor.stop(a+2.6);
    if(efecto)efecto.motor=motor;
   }
  }catch{}
 }
 function carrera(rutas){
  if(!rutas.length)return;animando=true;
  const reducido=matchMedia('(prefers-reduced-motion:reduce)').matches,z=parseFloat(getComputedStyle(document.body).zoom)||1,escala=(innerWidth<600?60:78)/120/z;
  const coches=rutas.map((p,k)=>{
   const i=+p.dataset.ruta,j=uniones.get(i),g=nodo('g',{class:'coche-en-carrera','aria-hidden':'true'}),cuerpo=nodo('g'),estela=nodo('g');
   estela.innerHTML='<path d="M-17 33H5M-25 44H2M-12 55H4" fill="none" stroke="#adc8df" stroke-width="3.5" stroke-linecap="round"/>';
   cuerpo.innerHTML=DibujosReloj.carro(i);g.append(estela,cuerpo);svg.append(g);
   raiz.querySelector(`[data-origen="${i}"]`).classList.add('en-carrera');
   return {p,g,cuerpo,estela,ruedas:[...cuerpo.querySelectorAll('.rueda-coche')],i,j,l:p.getTotalLength(),retardo:reducido?0:k*90,llego:false};
  });
  let inicio;
  efecto={frame:0,grupos:coches.map(c=>c.g),particulas:[],coches,medida:{width:svg.getBoundingClientRect().width,height:svg.getBoundingClientRect().height,z}};sonido();
  function paso(ms){
   if(!efecto)return;inicio??=ms;let todos=true;
   for(const c of coches){
    const edad=ms-inicio-c.retardo,preparacion=reducido?0:250,duracion=reducido?220:2100,u=Math.max(0,Math.min(1,(edad-preparacion)/duracion)),avance=u*u*(3-2*u),p=c.p.getPointAtLength(c.l*avance),antes=c.p.getPointAtLength(Math.max(0,c.l*avance-2)),despues=c.p.getPointAtLength(Math.min(c.l,c.l*avance+2)),angulo=Math.atan2(despues.y-antes.y,despues.x-antes.x)*180/Math.PI;
    c.g.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angulo}) scale(${escala})`);c.g.style.visibility=edad<0||c.llego?'hidden':'visible';
    const rebote=reducido?0:Math.sin(edad/(edad<preparacion?25:55))*1.1;c.cuerpo.setAttribute('transform',`translate(-60 ${-36+rebote})`);c.estela.setAttribute('transform','translate(-60 -36)');c.estela.setAttribute('opacity',u>0&&u<.96?Math.sin(u*Math.PI)*.8:0);
    if(!reducido)for(const rueda of c.ruedas)rueda.setAttribute('transform',`rotate(${avance*1900} ${rueda.dataset.eje})`);
    if(u===1&&!c.llego){
     c.llego=true;c.g.style.visibility='hidden';sonido(true);raiz.querySelector(`[data-destino="${c.j}"]`).classList.add('llegada');
     const cantidad=reducido?8:32;for(let k=0;k<cantidad;k++){
      const forma=nodo(k%3===0?'circle':'rect',{fill:DibujosReloj.paleta[k%6]});if(k%3===0)forma.setAttribute('r',3/z);else{forma.setAttribute('width',5/z);forma.setAttribute('height',(k%2?8:5)/z);forma.setAttribute('rx',1/z);}svg.append(forma);efecto.grupos.push(forma);efecto.particulas.push({forma,x:p.x,y:p.y,a:k*Math.PI*2/cantidad,v:(50+Math.random()*70)/z,inicio:ms});
     }
     const aro=nodo('circle',{cx:p.x,cy:p.y,r:8/z,fill:'none',stroke:'#e9b954','stroke-width':3/z});svg.append(aro);efecto.grupos.push(aro);efecto.particulas.push({forma:aro,x:p.x,y:p.y,inicio:ms,aro:true});
    }
    if(!c.llego)todos=false;
   }
   let vivas=false;for(const p of efecto.particulas){const t=(ms-p.inicio)/(reducido?400:900);if(t>=1){p.forma.style.visibility='hidden';continue;}vivas=true;if(p.aro){p.forma.setAttribute('r',(8+55*t)/z);p.forma.setAttribute('opacity',(1-t)*.7);}else{p.forma.setAttribute('transform',`translate(${p.x+Math.cos(p.a)*p.v*t} ${p.y+Math.sin(p.a)*p.v*t+45*t*t/z}) rotate(${t*240})`);p.forma.setAttribute('opacity',1-t);}}
   if(todos&&!vivas){finalizarCarrera();return;}efecto.frame=requestAnimationFrame(paso);
  }efecto.frame=requestAnimationFrame(paso);
 }
 function finalizarCarrera(){if(efecto){cancelAnimationFrame(efecto.frame);try{efecto.motor?.stop();}catch{}for(const g of efecto.grupos)g.remove();efecto=null;}raiz?.querySelectorAll('.en-carrera').forEach(e=>e.classList.remove('en-carrera'));animando=false;}
 function cancelar(){finalizarCarrera();cancelarArrastre();}
 window.PareoReloj={iniciar,ajustar,revisar,pista,cancelar};
 addEventListener('resize',cancelarArrastre);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelar();});
})();
