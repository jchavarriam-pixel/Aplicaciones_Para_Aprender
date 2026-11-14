document.addEventListener('DOMContentLoaded',()=>{
 const app=document.querySelector('.app'),tools=document.createElement('aside');tools.className='herramientas-posicional';app.prepend(tools);tools.append(document.querySelector('.title'));
 const intro=document.createElement('p');intro.textContent='Resuelve la operación. Arrastra los dígitos a las casillas.';tools.append(intro);
 const config=document.createElement('details');config.className='ajustes-posicional';config.innerHTML='<summary>⚙️ Configuración</summary><div id="preferenciasPosicional"></div>';tools.append(config);config.append($('menu'));
 for(const id of ['customScreen','houseScreen']){const screen=$(id),section=document.createElement('section');section.dataset.forScreen=id;section.append(screen.querySelector('.topbar'),screen.querySelector('.card'));config.append(section);}
 const dynamic=document.createElement('div');dynamic.id='controlesPosicional';tools.append(dynamic);document.body.append($('creditos-aplicaciones'));document.querySelector('.footer').remove();
 const saved=Matematicas.leer('valorPosicional.config.v1');if([2,3,4].includes(saved.digits))house.digits=saved.digits;if(['+','-','mix'].includes(saved.op))house.opMode=saved.op;
 $('operationInput').value=typeof saved.operation==='string'?saved.operation:'345+128';setShowLeadingZeros(saved.zeros===true);audioHelpOn=saved.audio===true;
 document.querySelectorAll('[data-d]').forEach(e=>e.classList.toggle('active',+e.dataset.d===house.digits));document.querySelectorAll('[data-op]').forEach(e=>e.classList.toggle('active',e.dataset.op===house.opMode));
 const originalOpen=openMode;openMode=mode=>{originalOpen(mode);if(mode==='custom')generateFromInput();else newHouseProblem();config.open=false;updateTools();};goMenu=()=>{config.open=true;};
 function save(){Matematicas.guardar('valorPosicional.config.v1',{digits:house.digits,op:house.opMode,operation:$('operationInput').value,zeros:showLeadingZeros,audio:audioHelpOn,mode:activeScreen});}
 function updateTools(){
  tools.querySelectorAll('[data-for-screen]').forEach(e=>e.hidden=e.dataset.forScreen!==activeScreen);
  const area=$(activeScreen==='customScreen'?'solverCustom':'houseArea');if(!area)return;
  if(area.querySelector('.actions')){
   dynamic.replaceChildren();const hint=area.querySelector('.board>.message');if(hint)dynamic.append(hint);
   for(const el of [...area.querySelector('.actions').children])if(!el.classList.contains('ok'))dynamic.append(el);
  }
  save();fit();
 }
 config.addEventListener('click',e=>{if(e.target.closest('[data-op],[data-d]')){newHouseProblem();updateTools();}});config.addEventListener('change',save);
 dynamic.addEventListener('click',save);
 const fit=Matematicas.pantalla(app,(h,z)=>{
  app.style.setProperty('--unidad',1/z+'px');const screen=document.querySelector('.screen.active:not(#menu)');if(!screen)return;
  const r=screen.getBoundingClientRect(),cols=current.digits+1;
  const compact=h<500||innerWidth/z<300,side=compact&&innerWidth>innerHeight;
  const cell=Math.max(24/z,Math.min(74,(r.width/z*(side?.7:1)-20)/cols,(r.height/z-(side?115:200)/z)/6.5));app.style.setProperty('--celda',cell+'px');app.classList.toggle('compacta',compact);
 });
 new MutationObserver(updateTools).observe($('solverCustom'),{childList:true});new MutationObserver(updateTools).observe($('houseArea'),{childList:true});
 IdiomaVoz.instalar('#preferenciasPosicional');openMode(saved.mode==='customScreen'?'custom':'house');
 function cancel(){ghost.style.display='none';drag.value=null;document.removeEventListener('pointermove',moveGhost);document.removeEventListener('pointerup',endDrag);}
 document.addEventListener('pointercancel',cancel);addEventListener('resize',cancel);document.addEventListener('fullscreenchange',cancel);
});
