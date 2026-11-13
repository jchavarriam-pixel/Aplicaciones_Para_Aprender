(()=>{
 Object.assign(window.TEXTOS_INGLES,ES_EN);
 const app=document.querySelector('.app-shell'),tools=document.createElement('aside');tools.className='herramientas-solidos';app.prepend(tools);tools.append(document.querySelector('.topbar'),document.querySelector('.mode-nav'));
 const config=document.createElement('details');config.className='ajustes-solidos';config.innerHTML='<summary>⚙️ Configuración</summary><div id="preferenciasSolidos"></div>';tools.append(config);config.append(document.getElementById('settingsBackdrop'));
 document.getElementById('languageSelect').closest('.field').hidden=true;document.getElementById('voiceSelect').closest('.field').hidden=true;
 const originalOpen=openSettings;openSettings=first=>{originalOpen(false);config.open=true;};const originalClose=closeSettings;closeSettings=()=>{originalClose();config.open=false;};closeSettings();
 config.addEventListener('toggle',()=>{if(config.open&&document.getElementById('settingsBackdrop').classList.contains('hidden'))originalOpen(false);});
 for(const view of document.querySelectorAll('.mode-view')){
  const section=document.createElement('section');section.dataset.modeTools=view.id.replace('mode-','');tools.append(section);section.append(view.querySelector('.hero-card'));
  const toolbar=view.querySelector('.challenge-toolbar');if(toolbar){section.append(toolbar);const check=toolbar.querySelector('.success'),next=toolbar.querySelector('.primary.hidden');const actions=document.createElement('div');actions.className='acciones-solidos';actions.append(check,next);view.append(actions);}
 }
 document.querySelector('[data-mode-tools="presentation"]').append(document.querySelector('.controls-panel'),document.getElementById('solidStrip'),document.getElementById('dimensionControls'));
 tools.append(document.getElementById('cornerRead'),document.getElementById('cornerAnimate'),document.getElementById('creditos-aplicaciones'));document.querySelector('.app-shell>footer').remove();
 const change=()=>{state.config.language=IdiomaVoz.idioma;document.getElementById('languageSelect').value=IdiomaVoz.idioma;Matematicas.almacen.setItem(CONFIG_KEY,JSON.stringify(state.config));applyLanguage();selectSolid(state.currentSolid);newClassification();startEvaluation();};
 IdiomaVoz.instalar('#preferenciasSolidos',{cambioIdioma:change});
 const fit=Matematicas.pantalla(app,(h,z)=>{
  app.style.setProperty('--unidad',1/z+'px');app.style.setProperty('--escala-modelo',String(1/z));app.classList.toggle('compacta',h<500||innerWidth/z<300);
  tools.querySelectorAll('[data-mode-tools]').forEach(e=>e.hidden=e.dataset.modeTools!==state.mode);
  for(const board of document.querySelectorAll('.matching-board')){const n=board.querySelector('.matching-list').children.length||1;board.style.setProperty('--filas',n);}
  renderMatchLines();renderEvalMatchLines();
 });
 new MutationObserver(fit).observe(document.querySelector('.app-shell>main'),{attributes:true,attributeFilter:['class'],subtree:true});
 document.querySelectorAll('.matching-list').forEach(e=>new MutationObserver(fit).observe(e,{childList:true}));
 document.getElementById('settingsBtn').onclick=()=>openSettings();document.getElementById('homeBtn').onclick=()=>openSettings();
})();
