/* Restar quitando: preferencias compartidas y coordenadas en píxeles de la pantalla. */
'use strict';
const $=s=>document.querySelector(s),EMOJIS=['🍎','⭐','🎈','🌸','⚽','🚗','🦋','🍓','🐱','🎀'];
let numA=0,numB=0,removed=0,emoji='🍎',done=false,lastAudio='',activeDrag=null,plegado=false;
const savedRestar=Matematicas.leer('restarQuitando.config.v1');
let mode=['mix','yes','no'].includes(savedRestar.mode)?savedRestar.mode:'mix',muted=savedRestar.muted===true;
let mostrarContadores=savedRestar.mostrarContadores!==false,mostrarRestantes=savedRestar.mostrarRestantes!==false;
const t=(es,en)=>IdiomaVoz.idioma==='en'?en:es,rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function obtenerNombreNino(){return $('#nombre').value.trim()||window.NombreCompartido?.obtener()||'Gabriel';}
function guardarRestar(){Matematicas.guardar('restarQuitando.config.v1',{mode,muted,mostrarContadores,mostrarRestantes});}
function speak(text){lastAudio=text;if(!muted)IdiomaVoz.hablar(text);}
function instruccion(){return t(`Quita ${numB} ${emoji}. ¿Cuántos quedan?`,`Take away ${numB} ${emoji}. How many are left?`);}
function mensajeResultado(){const nombre=obtenerNombreNino();return numB<=numA?t(`¡Muy bien, ${nombre}! Quedan ${numA-removed}.`,`Well done, ${nombre}! ${numA-removed} are left.`):t(`${nombre}, no hay suficientes: tienes ${numA} y necesitas quitar ${numB}.`,`${nombre}, there are not enough: you have ${numA} and need to take away ${numB}.`);}
function audioActual(){return done?(numB<=numA?t(`¡Muy bien, ${obtenerNombreNino()}! ${numA} menos ${numB} es igual a ${numA-numB}.`,`Well done, ${obtenerNombreNino()}! ${numA} minus ${numB} equals ${numA-numB}.`):mensajeResultado()):t(`Tienes ${numA} objetos. Quita ${numB}. ¿Cuántos quedan?`,`You have ${numA} objects. Take away ${numB}. How many are left?`);}
function repeatAudio(){speak(audioActual());}
function actualizarVista(){
 $('#instruccionRestar').textContent=instruccion();$('#numAEl').textContent=numA;$('#numBEl').textContent=numB;$('#wantRemove').textContent=numB;$('#removedCount').textContent=removed;
 $('#resultadoNumero').textContent=done?(numB<=numA?numA-numB:'—'):'?';$('#contadoresRestar').hidden=!mostrarContadores;
 $('#remainLabel').textContent=t(`Quedan: ${numA-removed}`,`Left: ${numA-removed}`);$('#remainLabel').hidden=!mostrarRestantes;
 $('#ayudasRestar').hidden=muted;$('#objectsBox').classList.toggle('empty',removed===numA);$('#dropZone').classList.toggle('completa',done);
 document.querySelectorAll('.mode-btn').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
 document.querySelectorAll('#playArea .obj-item').forEach((b,i)=>b.setAttribute('aria-label',t(`Quitar objeto ${i+1}`,`Take away object ${i+1}`)));
 const result=$('#resultArea');result.replaceChildren();if(done){const message=document.createElement('p');message.className='result-msg '+(numB<=numA?'success':'aviso');message.textContent=(numB<=numA?'★ ':'🧺 ')+mensajeResultado();result.append(message);}
 lastAudio=audioActual();programarAjuste();
}
function generateNumbers(){if(mode==='yes'){numA=rand(2,9);numB=rand(1,numA);}else if(mode==='no'){numA=rand(1,7);numB=rand(numA+1,9);}else if(Math.random()<.5){numA=rand(2,9);numB=rand(1,numA);}else{numA=rand(1,7);numB=rand(numA+1,9);}}
function buildObjects(){const pa=$('#playArea');pa.replaceChildren();for(let i=0;i<numA;i++){const b=document.createElement('button');b.type='button';b.className='obj-item';b.textContent=emoji;b.dataset.idx=i;b.draggable=false;b.addEventListener('pointerdown',startPointerDrag);b.addEventListener('click',e=>{if(e.detail===0)handleDrop(b);});pa.append(b);}}
function resetExercise(){cleanupPointerDrag();done=false;removed=0;$('#objetosQuitados').replaceChildren();buildObjects();actualizarVista();}
function newExercise(){generateNumbers();emoji=EMOJIS[rand(0,EMOJIS.length-1)];resetExercise();speak(audioActual());}
function setMode(m){if(!['mix','yes','no'].includes(m))return;mode=m;guardarRestar();newExercise();}
function handleDrop(item){if(done||item.classList.contains('removed'))return;item.classList.add('removed');item.disabled=true;removed++;const s=document.createElement('span');s.className='obj-in';s.textContent=emoji;$('#objetosQuitados').append(s);done=removed===numB||removed===numA;actualizarVista();speak(done?audioActual():t(`Quita ${numB-removed} más.`,`Take away ${numB-removed} more.`));}
function isInsideDropZone(x,y){const r=$('#dropZone').getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
function moveDragClone(x,y){if(!activeDrag)return;Matematicas.fantasma(activeDrag.clone,x,y);$('#dropZone').classList.toggle('over',isInsideDropZone(x,y));}
function startPointerDrag(e){const item=e.currentTarget;if(done||item.disabled||e.button>0||e.isPrimary===false||activeDrag)return;e.preventDefault();const rect=item.getBoundingClientRect(),z=Matematicas.escala(),clone=item.cloneNode(true);clone.className='obj-item drag-ghost';clone.tabIndex=-1;clone.setAttribute('aria-hidden','true');clone.style.width=rect.width+'px';clone.style.height=rect.height+'px';clone.style.fontSize=parseFloat(getComputedStyle(item).fontSize)*z+'px';document.body.append(clone);activeDrag={item,clone,pointerId:e.pointerId,x:e.clientX,y:e.clientY,movido:false};item.classList.add('dragging');item.setPointerCapture(e.pointerId);moveDragClone(e.clientX,e.clientY);}
function onPointerMove(e){const d=activeDrag;if(!d||d.pointerId!==e.pointerId)return;e.preventDefault();if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>6)d.movido=true;moveDragClone(e.clientX,e.clientY);}
function endPointerDrag(e){const d=activeDrag;if(!d||d.pointerId!==e.pointerId)return;e.preventDefault();const quitar=!d.movido||isInsideDropZone(e.clientX,e.clientY);cleanupPointerDrag();if(quitar)handleDrop(d.item);}
function cleanupPointerDrag(){const d=activeDrag;if(!d)return;activeDrag=null;d.item.classList.remove('dragging');d.clone.remove();try{d.item.releasePointerCapture(d.pointerId);}catch{}$('#dropZone').classList.remove('over');}
window.addEventListener('pointermove',onPointerMove,{passive:false});window.addEventListener('pointerup',endPointerDrag,{passive:false});window.addEventListener('pointercancel',cleanupPointerDrag);document.addEventListener('lostpointercapture',e=>{if(activeDrag?.pointerId===e.pointerId)cleanupPointerDrag();});
function abrirConfiguracion(){cleanupPointerDrag();$('#mostrarContadores').checked=mostrarContadores;$('#mostrarRestantes').checked=mostrarRestantes;$('#narracionRestar').checked=!muted;$('#configuracionRestar').style.zoom=String(1/Matematicas.escala());$('#configuracionRestar').showModal();}
function cerrarConfiguracion(){mostrarContadores=$('#mostrarContadores').checked;mostrarRestantes=$('#mostrarRestantes').checked;muted=!$('#narracionRestar').checked;guardarRestar();if('speechSynthesis'in window)speechSynthesis.cancel();$('#configuracionRestar').close();actualizarVista();}
function plegarPanel(){cleanupPointerDrag();plegado=!plegado;document.body.classList.toggle('plegado',plegado);$('#plegarRestar').setAttribute('aria-expanded',String(!plegado));const label=t(plegado?'Mostrar panel':'Ocultar panel',plegado?'Show panel':'Hide panel');$('#plegarRestar').setAttribute('aria-label',label);$('#plegarRestar').title=label;$('#flotantesRestar').hidden=!plegado;(plegado?$('#flotantesRestar'):$('#herramientasRestar')).append($('#ayudasRestar'));(plegado?$('#accionesRestar'):$('#cabeceraRestar')).append($('#volverAplicaciones'));programarAjuste();}
let frameAjuste=0;
function programarAjuste(){if(frameAjuste)return;frameAjuste=requestAnimationFrame(()=>{frameAjuste=0;ajustarObjetos();});}
function ajustarObjetos(){const z=Matematicas.escala();for(const [selector,count,max]of [['#playArea',done?numA-removed:numA,92],['#objetosQuitados',removed,42]]){const board=$(selector),r=board.getBoundingClientRect(),gap=parseFloat(getComputedStyle(board).gap)*z||0;let best={size:0,cols:1};for(let cols=1;cols<=Math.max(1,count);cols++){const rows=Math.ceil(Math.max(1,count)/cols),size=Math.min(max,(r.width-gap*(cols-1))/cols,(r.height-gap*(rows-1))/rows);if(size>best.size)best={size,cols};}board.style.setProperty('--columnas',best.cols);board.style.setProperty('--obj-size',Math.max(8,best.size)/z+'px');}}
$('#nombre').value=(()=>{try{return localStorage.getItem('nombreNinoGabrielApps')||'Gabriel';}catch{return 'Gabriel';}})();
$('#nuevaRestar').onclick=newExercise;$('#reiniciarRestar').onclick=()=>{resetExercise();repeatAudio();};$('#repetirRestar').onclick=repeatAudio;$('#configurarRestar').onclick=abrirConfiguracion;$('#cerrarConfiguracionRestar').onclick=cerrarConfiguracion;$('#ajustesRestar').onsubmit=e=>{e.preventDefault();cerrarConfiguracion();};$('#configuracionRestar').addEventListener('cancel',e=>{e.preventDefault();cerrarConfiguracion();});$('#plegarRestar').onclick=plegarPanel;document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
IdiomaVoz.instalar('#preferenciasRestar',{cambioIdioma:()=>{cleanupPointerDrag();actualizarVista();}});
Matematicas.pantalla($('#app'),(h,z)=>{const root=document.documentElement,w=innerWidth;root.style.setProperty('--u',1/z+'px');root.style.setProperty('--iz',1/z);root.style.setProperty('--alto',h+'px');root.style.setProperty('--ancho-panel',(innerHeight<450?190:Math.max(240,Math.min(320,w*.25)))/z+'px');$('#app').classList.toggle('compacta',innerHeight<650);programarAjuste();});
const observarEscena=new ResizeObserver(programarAjuste);observarEscena.observe($('#playArea'));observarEscena.observe($('#objetosQuitados'));addEventListener('resize',cleanupPointerDrag);document.addEventListener('fullscreenchange',cleanupPointerDrag);window.addEventListener('nombre-estudiante-cambiado',()=>{if(numA)actualizarVista();});
newExercise();
