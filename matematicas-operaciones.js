document.addEventListener('DOMContentLoaded',()=>{
 const app=document.getElementById('app'),tools=document.createElement('aside');tools.className='herramientas-operaciones';app.prepend(tools);tools.append(document.getElementById('gameTitle'));
 const instruction=document.createElement('p');instruction.textContent='Resuelve la operación. Arrastra los dígitos a las casillas.';tools.append(instruction);
 const config=document.createElement('details');config.className='ajustes-operaciones';config.innerHTML='<summary>⚙️ Configuración</summary><div id="preferenciasOperaciones"></div>';tools.append(config);config.append(document.getElementById('menuScreen'));
 tools.append(document.querySelector('.top-bar'),document.getElementById('hintBar'));
 for(const el of [...document.querySelector('.actions').children])if(el.id!=='checkBtn')tools.append(el);
 config.append(document.querySelector('.audio-settings'));tools.append(document.getElementById('creditos-aplicaciones'));
 document.querySelectorAll('.footer-credit,#levelScreen>p:last-child,[onclick="startGameValidated()"]').forEach(e=>e.remove());
 const saved=Matematicas.leer('operaciones.config.v1');
 if([2,3,4].includes(saved.digits))digits=saved.digits;
 if(['solo_suma','solo_resta','mixto'].includes(saved.operationMode))operationMode=saved.operationMode;
 if(['sin_llevada','con_llevada','mixta'].includes(saved.additionMode))additionMode=saved.additionMode;
 if(['sin_prestamo','con_prestamo','mixta'].includes(saved.subtractionMode))subtractionMode=saved.subtractionMode;
 if(Number.isInteger(saved.currentMusicMode)&&saved.currentMusicMode>=0&&saved.currentMusicMode<6)currentMusicMode=saved.currentMusicMode;
 helpOn=saved.helpOn===true;audioHelpOn=saved.audioHelpOn===true;allowLeadingSum=saved.allowLeadingSum===true;speakAudioResult=saved.speakAudioResult===true;
 for(const [group,value]of [['operation',operationMode],['addition',additionMode],['subtraction',subtractionMode],['digits',digits]])document.querySelectorAll(`[data-group="${group}"]`).forEach(e=>e.classList.toggle('active',e.getAttribute('onclick').includes(String(value))));
 document.getElementById('allowLeadingSumCheckbox').checked=allowLeadingSum;document.getElementById('speakResultCheckbox').checked=speakAudioResult;
 document.getElementById('helpBtn').textContent=helpOn?'💡 Ayuda: ON':'💡 Ayuda';
 document.getElementById('audioHelpBtn').textContent=audioHelpOn?'🔊 Audio: ON':'🔊 Audio';
 const musicName=musicModes[currentMusicMode];document.getElementById('musicBtn').textContent='🎵 '+musicName.charAt(0).toUpperCase()+musicName.slice(1);
 document.getElementById('nameInput').value||='Gabriel';
 IdiomaVoz.instalar('#preferenciasOperaciones');startGameValidated();updateModeVisibility();
 const save=()=>Matematicas.guardar('operaciones.config.v1',{digits,operationMode,additionMode,subtractionMode,helpOn,audioHelpOn,allowLeadingSum,speakAudioResult,currentMusicMode});
 tools.addEventListener('click',e=>{if(e.target.closest('[data-group]')){save();newProblem();fit();}else save();});tools.addEventListener('change',save);
 function cancel(){document.removeEventListener('pointermove',moveGhost);document.removeEventListener('pointerup',endDrag);ghost.style.display='none';dragValue=-1;}
 document.addEventListener('pointercancel',cancel);addEventListener('resize',cancel);document.addEventListener('fullscreenchange',cancel);
 const fit=Matematicas.pantalla(app,(h,z)=>{
  app.style.setProperty('--unidad',1/z+'px');const game=document.getElementById('gameScreen'),r=game.getBoundingClientRect();
  const cell=Math.max(15/z,Math.min(82,(r.width/z-24)/(digits+2),(r.height/z-100/z)/5.2));app.style.setProperty('--celda',cell+'px');
  app.classList.toggle('compacta',h<500||innerWidth/z<300);
 });
 new ResizeObserver(fit).observe(document.getElementById('gameScreen'));
});
