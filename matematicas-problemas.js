"use strict";

const fichasSituaciones={
  estacionamiento:"estacionamiento",
  applesTree:"manzanas",
  pearsBasket:"peras",
  busPasajeros:"autobus",
  danielGlobosParque:"globos",
  pajaritosCable:"pajaritos",
  andresMariaDulcesPlato:"dulces",
  aulaPupitresDesocupados:"pupitres",
  aulaRecreo:"recreo",
  patosEstanque:"estanque",
  frutasNevera:"nevera",
  ninosPiscina:"piscina"
};

const ajusteOperacionPorSituacion = {
  busPasajeros: {clave:"autobus", etiqueta:"En la parada", opciones:{mixto:"Mixto (suben o bajan)", addition:"Solo suben", subtraction:"Solo bajan"}},
  aulaRecreo: {clave:"recreo", etiqueta:"Movimiento de estudiantes", opciones:{mixto:"Mixto (salen o regresan)", subtraction:"Solo salen", addition:"Solo regresan"}},
  estacionamiento: {clave:"estacionamiento", etiqueta:"Movimiento de carros", opciones:{alternado:"Alternan: llegan y se van", azar:"Al azar en cada ronda", addition:"Solo llegan", subtraction:"Solo se van"}},
  andresMariaDulcesPlato: {clave:"dulces", etiqueta:"Operación con dulces", opciones:{addition:"Solo suma", subtraction:"Resta con ambos turnos", restaAndres:"Resta: María le quita a Andrés", restaMaria:"Resta: Andrés le quita a María", mixto:"Mixto (suma y resta)"}},
  pajaritosCable: {clave:"pajaritosCable", etiqueta:"Movimiento de pajaritos", opciones:{alternado:"Alternan: llegan y se van", azar:"Al azar en cada ronda", addition:"Solo llegan", subtraction:"Solo se van"}},
  patosEstanque: {clave:"patosEstanque", etiqueta:"Movimiento de patos", opciones:{alternado:"Alternar suma y resta", azar:"Al azar en cada ronda", addition:"Solo aterrizan", subtraction:"Solo despegan"}},
  frutasNevera: {clave:"frutasNevera", etiqueta:"Movimiento de frutas", opciones:{alternado:"Alternar suma y resta", azar:"Al azar en cada ronda", addition:"Solo se guardan frutas", subtraction:"Solo se sacan frutas"}},
  ninosPiscina: {clave:"ninosPiscina", etiqueta:"Movimiento de nadadores", opciones:{alternado:"Alternar suma y resta", azar:"Al azar en cada ronda", addition:"Solo entran", subtraction:"Solo salen"}}
};

function renderStoryThumbnail(box,problem){
  const archivo=fichasSituaciones[problem.id];
  if(!archivo){problem.renderPreview(box);return;}
  box.classList.add("miniatura-ilustrada");
  const ilustracion=new Image(720,480);
  ilustracion.src=`ImagenesSituacionesProblemas/Fichas/${archivo}.webp`;
  ilustracion.alt="";
  ilustracion.decoding="async";
  box.replaceChildren(ilustracion);
}

(() => {
  const app=document.querySelector(".app");
  const layout=document.querySelector("#problemScreen .layout");
  const panel=document.createElement("aside");
  const content=document.createElement("div");
  panel.className="herramientas-problemas";
  content.className="contenido-problemas";
  app.prepend(panel);
  app.append(content);
  content.append(menuScreen,problemScreen);
  const hero=app.querySelector(".hero");
  panel.append(hero);
  const home=document.createElement("a");
  home.className="casa-problemas";
  home.href="index.html";
  home.textContent="⌂";
  home.setAttribute("aria-label","Aplicaciones");
  home.title="Aplicaciones";
  home.onclick=event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!window.AppsFullscreen)return;
    event.preventDefault();
    window.AppsFullscreen.navigate(home.href);
  };
  hero.append(home);
  const guide=document.createElement("section");
  guide.className="guia-problemas";
  guide.innerHTML="<h2>Así jugamos</h2>";
  guide.append(mainSubtitle);
  panel.append(guide);

  const actions=document.createElement("div");
  actions.className="controles-problemas";
  const openSettings=document.createElement("button");
  openSettings.type="button";
  openSettings.className="mainBtn";
  openSettings.textContent="⚙ Configuración";
  actions.append(backBtn,openSettings,newBtn);
  panel.append(actions);

  const hints=document.querySelector(".rightControlArea");
  hints.classList.add("pistas-problemas");
  hints.querySelector(".actionButtonsBelowHints").remove();
  hints.append(equationBox);
  panel.append(hints);
  const foldedBar=document.createElement("div");
  foldedBar.className="controles-plegados-problemas";
  foldedBar.hidden=true;
  content.prepend(foldedBar);

  const stage=document.createElement("div");
  stage.className="marco-escena-problemas";
  scene.before(stage);
  stage.append(scene);
  const answerBar=document.createElement("div");
  answerBar.className="revision-problemas";
  answerBar.append(feedback,checkBtn);
  layout.prepend(storyBox);
  layout.append(answerBar);
  layout.querySelector("aside.card").remove();

  const settings=menuScreen.querySelector(".globalSettings");
  const rangos=settings.querySelector(".generalParamsGrid");
  const opcionesGenerales=document.createElement("fieldset");
  opcionesGenerales.className="opciones-ayuda-problemas";
  opcionesGenerales.innerHTML='<legend>Lectura y ayudas</legend><label><input type="checkbox" name="narracion"> Narración y lectura</label><label><input type="checkbox" name="data"> Pista de datos</label><label><input type="checkbox" name="keyword"> Pista de palabra clave</label><label><input type="checkbox" name="operation"> Pista de operación</label>';
  languageSelect.closest("label").hidden=true;
  voiceSelect.closest("label").hidden=true;
  const voice=document.createElement("div");
  voice.id="preferenciasProblemas";
  settings.append(opcionesGenerales,voice);

  const ajustesSituacion=document.createElement("div");
  ajustesSituacion.className="globalSettings";
  ajustesSituacion.innerHTML='<div class="cabecera-ajustes-situacion"><div><h2></h2><p>Ajustes de esta situación</p></div></div>';
  const tituloSituacion=ajustesSituacion.querySelector("h2");
  const cantidades=document.createElement("fieldset");
  cantidades.className="cantidades-situacion";
  cantidades.innerHTML="<legend>Cantidades del ejercicio</legend>";
  cantidades.append(rangos);
  const campoOperacion=document.createElement("div");
  campoOperacion.className="settingsGrid";
  ajustesSituacion.append(cantidades,campoOperacion);

  function crearDialogo(contenido, encabezado, aplicar) {
    const dialog=document.createElement("dialog");
    dialog.className="dialogo-problemas";
    const titulo=encabezado.querySelector("h2");
    dialog.setAttribute("aria-labelledby",titulo.id);
    const close=document.createElement("button");
    close.type="button";
    close.className="cerrar-ajustes-problemas";
    close.textContent="✕";
    close.setAttribute("aria-label","Cerrar");
    encabezado.append(close);
    const done=document.createElement("button");
    done.type="button";
    done.className="mainBtn aplicar-ajustes-problemas";
    done.textContent="Aplicar y volver";
    contenido.append(done);
    dialog.append(contenido);
    document.body.append(dialog);
    const guardarYCerrar=()=>{aplicar();dialog.close();};
    close.onclick=done.onclick=guardarYCerrar;
    dialog.addEventListener("cancel",event=>{event.preventDefault();guardarYCerrar();});
    dialog.addEventListener("click",event=>{if(event.target===dialog)guardarYCerrar();});
    dialog.addEventListener("close",updateLayout);
    return dialog;
  }

  const cabeceraGeneral=settings.querySelector(".settingsHeader");
  cabeceraGeneral.querySelector("h2").id="tituloAjustesProblemas";
  tituloSituacion.id="tituloAjustesSituacion";
  const dialogoGeneral=crearDialogo(settings,cabeceraGeneral,aplicarGenerales);
  const dialogoSituacion=crearDialogo(ajustesSituacion,ajustesSituacion.firstElementChild,aplicarSituacion);

  Object.assign(window.TEXTOS_INGLES,{
    "Así jugamos":"How to play","Aplicaciones":"Applications","Configuración":"Settings",
    "Cerrar":"Close","Aplicar y volver":"Apply and return","Lectura y ayudas":"Speech and hints",
    "Pasajeros del autobús":"Bus passengers","En la parada":"At the bus stop",
    "Mixto (suben o bajan)":"Mixed (get on or off)","Solo suben":"Get on only","Solo bajan":"Get off only",
    "El recreo en el aula":"Classroom recess","Movimiento de estudiantes":"Student movement",
    "Mixto (salen o regresan)":"Mixed (leave or return)","Solo salen":"Leave only","Solo regresan":"Return only",
    "Estacionamiento":"Parking lot","Movimiento de carros":"Car movement","Alternan: llegan y se van":"Alternate arrivals and departures",
    "Al azar en cada ronda":"Random each round","Solo llegan":"Arrivals only","Solo se van":"Departures only",
    "Dulces de Andrés y María":"Andrés and María's candies","Operación con dulces":"Candy operation",
    "Solo suma":"Addition only","Resta con ambos turnos":"Subtraction with either child",
    "Resta: María le quita a Andrés":"Subtraction: María takes from Andrés",
    "Resta: Andrés le quita a María":"Subtraction: Andrés takes from María",
    "Mixto (suma y resta)":"Mixed (addition and subtraction)",
    "Configuración general":"General settings","Ajustes de esta situación":"Story settings",
    "Cantidades del ejercicio":"Exercise quantities","Alternar suma y resta":"Alternate addition and subtraction",
    "Movimiento de pajaritos":"Bird movement","Movimiento de patos":"Duck movement",
    "Movimiento de frutas":"Fruit movement","Movimiento de nadadores":"Swimmer movement",
    "Solo aterrizan":"Land only","Solo despegan":"Take off only",
    "Solo se guardan frutas":"Put fruit in only","Solo se sacan frutas":"Take fruit out only","Solo entran":"Get in only",
    "Ya estaban":"Already there","Llegaron":"Arrivals",
    "Narración y lectura":"Narration and reading","Pista de datos":"Data hint",
    "Pista de palabra clave":"Keyword hint","Pista de operación":"Operation hint"
  });

  function actualizarAyudas(){
    speakBtn.hidden=!preferenciasProblemas.narracion;
    hintDataBtn.hidden=!preferenciasProblemas.data;
    hintKeywordBtn.hidden=!preferenciasProblemas.keyword;
    hintOperationBtn.hidden=!preferenciasProblemas.operation;
    if(state.activeHint&&!preferenciasProblemas[state.activeHint]){
      state.activeHint=null;
      delete hintBox.dataset.hintActive;
      hintBox.innerHTML=t("defaultHint");
    }
    if(!preferenciasProblemas.operation)state.showOperation=false;
    if(!state.activeHint)state.highlightKeyword=false;
    if(state.currentProblem)updateText();
  }
  IdiomaVoz.instalar("#preferenciasProblemas",{cambioIdioma:()=>{
    languageSelect.value=IdiomaVoz.idioma;
    applyStaticLanguage();
    if(!state.currentProblem)return;
    updateOperationLabels();
    feedback.textContent=t("defaultFeedback");
    if(state.activeHint)showHint(state.activeHint);
    else hintBox.innerHTML=t("defaultHint");
  }});

  const camposRango={minTotal,maxTotal,minChange,maxChange};
  let idConfigurado;
  openSettings.onclick=()=>{
    const problema=state.currentProblem;
    if(!problema){
      for(const input of opcionesGenerales.querySelectorAll("input"))input.checked=preferenciasProblemas[input.name];
      IdiomaVoz.iniciarEdicion();
      dialogoGeneral.showModal();
      return;
    }
    idConfigurado=problema.id;
    tituloSituacion.textContent=problemText(problema,"title");
    const rango=rangoDeSituacion(idConfigurado);
    for(const [clave,input] of Object.entries(camposRango))input.value=rango[clave];
    const operacion=ajusteOperacionPorSituacion[idConfigurado];
    campoOperacion.replaceChildren();
    campoOperacion.hidden=!operacion;
    if(operacion){
      const label=document.createElement("label");
      label.textContent=operacion.etiqueta;
      const select=document.createElement("select");
      select.id="modoSituacion";
      for(const [valor,texto] of Object.entries(operacion.opciones))select.add(new Option(texto,valor));
      const guardado=preferenciasProblemas[operacion.clave];
      select.value=Object.hasOwn(operacion.opciones,guardado)?guardado:select.options[0].value;
      label.append(select);
      campoOperacion.append(label);
    }
    IdiomaVoz.localizar();
    dialogoSituacion.showModal();
  };

  function aplicarGenerales(){
    for(const input of opcionesGenerales.querySelectorAll("input"))preferenciasProblemas[input.name]=input.checked;
    if(!preferenciasProblemas.narracion)window.speechSynthesis?.cancel();
    Matematicas.guardar(CLAVE_AYUDAS_PROBLEMAS,preferenciasProblemas);
    saveFontSetting();
    IdiomaVoz.aplicarEdicion();
    actualizarAyudas();
  }

  function aplicarSituacion(){
    const anterior=rangoDeSituacion(idConfigurado);
    const rango=normalizarRango(Object.fromEntries(Object.entries(camposRango).map(([clave,input])=>[clave,input.value])));
    const cambioRango=Object.keys(rango).some(clave=>rango[clave]!==anterior[clave]);
    if(cambioRango)guardarRangoDeSituacion(idConfigurado,rango);
    const operacion=ajusteOperacionPorSituacion[idConfigurado];
    const nuevaOperacion=campoOperacion.querySelector("select")?.value;
    const anteriorOperacion=operacion&&(preferenciasProblemas[operacion.clave]??Object.keys(operacion.opciones)[0]);
    const cambioOperacion=operacion&&nuevaOperacion!==anteriorOperacion;
    if(cambioOperacion){
      preferenciasProblemas[operacion.clave]=nuevaOperacion;
      Matematicas.guardar(CLAVE_AYUDAS_PROBLEMAS,preferenciasProblemas);
    }
    if(state.currentProblem?.id===idConfigurado&&(cambioRango||cambioOperacion))newProblem();
  }

  function updateLayout(){
    const folded=app.classList.contains("panel-lateral-oculto");
    const playing=app.dataset.pantalla==="problem";
    const etiqueta=IdiomaVoz.t(playing?"Ajustes de esta situación":"Configuración general");
    if(openSettings.textContent!=="⚙ "+etiqueta)openSettings.textContent="⚙ "+etiqueta;
    foldedBar.hidden=!folded;
    newBtn.hidden=backBtn.hidden=!playing;
    hints.hidden=!playing||![preferenciasProblemas.data,preferenciasProblemas.keyword,preferenciasProblemas.operation].some(Boolean);
    const host=folded?foldedBar:panel;
    if(actions.parentElement!==host)host.append(actions,hints);
  }
  startApp();
  if(new URLSearchParams(location.search).get("actividad")==="estacionamiento")openProblem("estacionamiento");
  actualizarAyudas();
  const fit=Matematicas.pantalla(app,(_,zoom)=>{
    const width=document.documentElement.clientWidth, height=document.documentElement.clientHeight;
    app.style.setProperty("--alto-util",height/zoom+"px");
    const available=width/zoom+"px";
    if(document.body.style.getPropertyValue("--ancho-problemas")!==available)document.body.style.setProperty("--ancho-problemas",available);
    app.style.setProperty("--unidad",1/zoom+"px");
    app.classList.toggle("horizontal",width>height);
    app.classList.toggle("compacta",height<540);
    updateLayout();
  });
  new MutationObserver(fit).observe(app,{attributes:true,attributeFilter:["class","data-pantalla"]});
})();
