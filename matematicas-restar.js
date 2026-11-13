(()=>{
 const app=document.getElementById('app'),tools=document.createElement('aside'),game=document.createElement('main');tools.className='herramientas-restar';game.className='juego-restar';
 const title=document.getElementById('titleEl'),name=document.getElementById('studentNamePill'),controls=document.querySelector('.controls');
 tools.append(title,name);const hint=document.createElement('p');hint.textContent='Arrastra los objetos a la cesta para quitar la cantidad indicada.';tools.append(hint);
 const config=document.createElement('details');config.innerHTML='<summary>⚙️ Configuración</summary><div id="preferenciasRestar"></div>';tools.append(config);config.prepend(document.querySelector('.mode-bar'));config.append(document.getElementById('muteBtn'));
 for(const sel of ['#opDisplay','.info-row','.play-area','#dropZone','#remainLabel','#resultArea'])game.append(document.querySelector(sel));
 game.append(controls);tools.append(document.getElementById('creditos-aplicaciones'));app.append(tools,game);
 IdiomaVoz.instalar('#preferenciasRestar');
 Matematicas.pantalla(app,(h,z)=>{app.style.setProperty('--unidad',1/z+'px');app.classList.toggle('compacta',h<500||innerWidth/z<300);});
 addEventListener('resize',cleanupPointerDrag);document.addEventListener('fullscreenchange',cleanupPointerDrag);
})();
