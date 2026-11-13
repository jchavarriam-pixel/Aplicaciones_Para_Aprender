(()=>{
 const app=document.getElementById('app'),tools=document.createElement('aside');tools.className='herramientas-fracciones';app.prepend(tools);tools.append(document.querySelector('.topbar'));
 const config=document.createElement('details');config.className='ajustes-fracciones';config.innerHTML='<summary>⚙️ Configuración</summary><div id="preferenciasFracciones"></div>';tools.append(config);
 const dialog=document.getElementById('settingsDialog');config.append(dialog);dialog.showModal=()=>{config.open=true;dialog.setAttribute('open','');};dialog.addEventListener('close',()=>config.open=false);document.getElementById('voiceSelect').closest('label').hidden=true;
 config.addEventListener('toggle',()=>{if(config.open&&!dialog.open)FraccionesAPI.openSettings();});
 for(const id of ['a1','a2','a3','a4']){const section=document.createElement('section');section.dataset.fraccionesTools=id;tools.append(section);const screen=document.getElementById(id+'Screen');section.append(screen.querySelector('.instruction'));const feedback=screen.querySelector('.feedback');section.append(feedback);if(id==='a3')section.append(document.querySelector('.match-customize'));}
 tools.append(document.getElementById('creditos-aplicaciones'));
 IdiomaVoz.instalar('#preferenciasFracciones',{cambioIdioma:()=>{if(FraccionesAPI.current)FraccionesAPI.startActivity(FraccionesAPI.current);}});
 const fit=Matematicas.pantalla(app,(h,z)=>{
  app.style.setProperty('--unidad',1/z+'px');app.classList.toggle('compacta',h<500||innerWidth/z<300);
  tools.querySelectorAll('[data-fracciones-tools]').forEach(e=>e.hidden=e.dataset.fraccionesTools!==FraccionesAPI.current);
  const screen=document.querySelector('.screen.active');if(screen){const r=screen.getBoundingClientRect();app.style.setProperty('--figura',Math.min(r.width/z*.55,(r.height/z-110/z))+'px');}
  const n=Math.max(document.getElementById('leftMatchCol').children.length,document.getElementById('rightMatchCol').children.length)-1;document.getElementById('matchBoard').style.setProperty('--filas',Math.max(1,n));
  if(FraccionesAPI.current==='a3')FraccionesAPI.redrawConnections();
 });
 new MutationObserver(fit).observe(app.querySelector('main'),{subtree:true,attributes:true,attributeFilter:['class']});
 new MutationObserver(fit).observe(document.getElementById('leftMatchCol'),{childList:true});
})();
