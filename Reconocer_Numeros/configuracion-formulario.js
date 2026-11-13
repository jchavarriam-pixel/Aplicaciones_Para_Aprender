'use strict';
(()=>{
 const home=document.getElementById('home'),game=document.getElementById('game'),setup=document.getElementById('setup');
 const general=home.querySelector('.home-grid>.tarjeta'),modos=general.nextElementSibling;
 const nombre=document.getElementById('childName'),filaNombre=nombre.closest('.fila');filaNombre.classList.add('nombre-bajo-titulo');
 home.querySelector('h1').after(filaNombre);
 const cabeceraInicio=home.querySelector('.titulo'),titulo=home.querySelector('h1');titulo.textContent='Reconocer números';const icono=document.createElement('span');icono.className='icono-titulo-numeros';icono.textContent='🔢';icono.setAttribute('aria-hidden','true');titulo.prepend(icono);
 const instruccion=cabeceraInicio.querySelector('.sub');instruccion.textContent='Elige los números que quieres practicar y después un modo de juego.';
 const escoger=document.createElement('section');escoger.className='escoger-numeros';escoger.setAttribute('aria-label','Forma de escoger los números');escoger.append(document.querySelector('input[name="selectType"]').closest('.fila'),document.getElementById('digitsConfig'),document.getElementById('rangeConfig'));instruccion.after(escoger);

 const modal=document.createElement('dialog');modal.id='configuracionNumeros';modal.setAttribute('aria-labelledby','tituloConfiguracionNumeros');
 modal.innerHTML='<header class="formulario-cabecera"><h2 id="tituloConfiguracionNumeros">Configuración</h2><button id="cerrarConfiguracionNumeros" class="btn gray" aria-label="Aplicar y cerrar">✕</button></header><form method="dialog"><div id="camposConfiguracionNumeros"></div><button class="btn green aplicar-numeros">Aplicar y volver al juego</button></form>';
 document.body.append(modal);const campos=document.getElementById('camposConfiguracionNumeros');campos.append(general,setup,document.getElementById('preferenciasIdiomaVoz'));
 general.querySelector('h2').remove();general.querySelector('p.sub').textContent='Los cambios se aplican al cerrar el formulario y se guardan en este navegador.';setup.querySelector('.encabezado').hidden=true;
 modos.classList.add('seleccion-modos');home.querySelector('.home-grid').append(modos);
 const pendientes=new Map();let aplicando=false,lanzando=false,eraJuego=false,modoModal=null,modoAnterior=null,valoresPrevios=[],configPrevia=null;
 Object.assign(window.TEXTOS_INGLES,{'Elige los números que quieres practicar y después un modo de juego.':'Choose the numbers you want to practise, then choose a game mode.','Jugar':'Play','Cancelar':'Cancel','Aplicar y cerrar':'Apply and close','Aplicar y volver al juego':'Apply and return to the game','Elegir modo':'Choose a mode','Ajustes del modo':'Mode settings','Configuración general':'General settings','Los cambios se aplican al cerrar el formulario y se guardan en este navegador.':'Changes apply when you close the form and are saved in this browser.'});
 function abrir(modo=null,preparar=false){
  pendientes.clear();eraJuego=game.classList.contains('activa');modoAnterior=state.mode;modoModal=modo;
  if(modo){
   if(preparar){openOriginal(modo);screen('home');}else renderSetup(modo);
  }
  setup.hidden=!modo;general.hidden=!!modo;document.getElementById('preferenciasIdiomaVoz').hidden=!!modo;document.getElementById('tituloConfiguracionNumeros').textContent=modo?document.getElementById('setupTitle').textContent:'Configuración general';
  const principal=modal.querySelector('.aplicar-numeros');principal.type=modo?'button':'submit';principal.textContent=modo?'▶ Jugar':'Aplicar y volver al juego';cancelar.hidden=!modo;document.getElementById('cerrarConfiguracionNumeros').setAttribute('aria-label',modo?'Cancelar':'Aplicar y cerrar');
  setup.querySelectorAll('[onclick^="startMode"]').forEach(b=>b.hidden=true);
  valoresPrevios=[...modal.querySelectorAll('input,select')].map(el=>({el,value:el.value,checked:el.checked}));configPrevia=JSON.stringify(configuracion);
  modal.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));modal.showModal();
 }
 function aplicar(){
  aplicando=true;for(const [el,tipo]of pendientes)el.dispatchEvent(new Event(tipo,{bubbles:true}));aplicando=false;
  guardarConfiguracion();state.childName=guardarNombreEstudiante(nombre.value)||'Gabriel';
  if(modoModal){state.mode=modoModal;state.numbers=getNums();}
 }
 for(const tipo of ['input','change'])modal.addEventListener(tipo,e=>{
  if(aplicando)return;e.stopImmediatePropagation();pendientes.set(e.target,tipo);
  if(e.target.name==='selectType')actualizarSeleccionNumeros();
 },true);
 modal.addEventListener('click',e=>{if(e.target.closest('[onclick^="startMode"]')){lanzando=true;aplicar();modal.close();}},true);
 const cancelar=document.createElement('button');cancelar.type='button';cancelar.className='btn gray cancelar-numeros';cancelar.textContent='Cancelar';cancelar.onclick=()=>modal.close();modal.querySelector('form').append(cancelar);
 modal.querySelector('.aplicar-numeros').addEventListener('click',()=>{if(!modoModal)return;lanzando=true;aplicar();modal.close();window['startMode'+modoModal]();});
 document.getElementById('cerrarConfiguracionNumeros').onclick=()=>modal.close();
 modal.addEventListener('close',()=>{
  if(lanzando){lanzando=false;return;}
  if(modoModal){for(const {el,value,checked}of valoresPrevios){el.value=value;if(el.type==='checkbox'||el.type==='radio')el.checked=checked;}configuracion=JSON.parse(configPrevia);state.mode=modoAnterior;pendientes.clear();return;}
  const cambio=pendientes.size;aplicar();const reiniciar=modoModal||modoAnterior;if(cambio&&eraJuego&&reiniciar){state.mode=reiniciar;state.numbers=getNums();window['startMode'+reiniciar]();}
 });
 const openOriginal=openModeSetup;openModeSetup=m=>abrir(m,true);
 for(const pantalla of [home]){const b=document.createElement('button');b.className='btn blue configurar-numeros';b.textContent=pantalla===game?'⚙ Ajustes del modo':'⚙ Configuración general';b.onclick=()=>abrir(pantalla===game?state.mode:null);pantalla.querySelector('.encabezado').append(b);}
 function situarNombre(){const titulo=home.querySelector('.titulo');titulo.querySelector('h1,h2').after(filaNombre);}
 for(const el of[home,game])new MutationObserver(situarNombre).observe(el,{attributes:true,attributeFilter:['class']});
 function ajustarInicio(){const z=parseFloat(getComputedStyle(document.body).zoom)||1;home.style.setProperty('--alto-inicio',((visualViewport?.height||innerHeight)/z)+'px');home.style.setProperty('--unidad-inicio',1/z+'px');home.classList.toggle('inicio-horizontal',innerWidth>innerHeight);}
 new MutationObserver(ajustarInicio).observe(document.body,{attributes:true,attributeFilter:['style']});addEventListener('resize',ajustarInicio);document.addEventListener('fullscreenchange',ajustarInicio);visualViewport?.addEventListener('resize',ajustarInicio);ajustarInicio();
 home.querySelectorAll('.modo').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
})();
