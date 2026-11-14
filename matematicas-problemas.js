(()=>{
 const app=document.querySelector('.app'),tools=document.createElement('aside');tools.className='herramientas-problemas';app.prepend(tools);tools.append(document.querySelector('.hero'));
 const config=document.createElement('details');config.className='ajustes-problemas';config.innerHTML='<summary>⚙️ Configuración</summary><div id="preferenciasProblemas"></div>';tools.append(config);config.append(document.querySelector('.globalSettings'));
 languageSelect.closest('label').hidden=true;voiceSelect.closest('label').hidden=true;
 const guide=document.createElement('div');guide.className='guia-problemas';tools.append(guide);guide.append(document.querySelector('.rightControlArea'),document.querySelector('.panelHeader'),answerTitle,numberGrid,feedback,equationBox);
 const play=document.querySelector('#problemScreen .layout');play.append(storyBox,checkBtn);play.querySelector('aside.card').style.display='none';
 guide.append(backBtn,newBtn,resetAnimationBtn,speakBtn,animateBtn);
 document.body.append(document.getElementById('creditos-aplicaciones'));
 IdiomaVoz.instalar('#preferenciasProblemas',{cambioIdioma:()=>{languageSelect.value=IdiomaVoz.idioma;applyStaticLanguage();if(state.currentProblem)addOperationBuilder();}});
 Matematicas.pantalla(app,(h,z)=>{app.style.setProperty('--unidad',1/z+'px');app.classList.toggle('compacta',h<500||innerWidth/z<300);});
})();
