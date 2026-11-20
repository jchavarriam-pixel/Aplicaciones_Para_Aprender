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

  const dialog=document.createElement("dialog");
  dialog.className="dialogo-problemas";
  const settings=menuScreen.querySelector(".globalSettings");
  const title=settings.querySelector(".settingsHeader h2");
  title.id="tituloAjustesProblemas";
  dialog.setAttribute("aria-labelledby",title.id);
  const close=document.createElement("button");
  close.type="button";
  close.className="cerrar-ajustes-problemas";
  close.textContent="✕";
  close.setAttribute("aria-label","Cerrar");
  settings.querySelector(".settingsHeader").append(close);
  languageSelect.closest("label").hidden=true;
  voiceSelect.closest("label").hidden=true;
  const options=document.createElement("fieldset");
  options.className="opciones-ayuda-problemas";
  options.innerHTML='<legend>Lectura y ayudas</legend><label><input type="checkbox" name="narracion"> Narración y lectura</label><label><input type="checkbox" name="data"> Pista de datos</label><label><input type="checkbox" name="keyword"> Pista de palabra clave</label><label><input type="checkbox" name="operation"> Pista de operación</label>';
  const busOptions=document.createElement("fieldset");
  busOptions.className="opciones-ayuda-problemas";
  busOptions.innerHTML='<legend>Pasajeros del autobús</legend><label for="modoAutobus">En la parada</label><select id="modoAutobus"><option value="mixto">Mixto (suben o bajan)</option><option value="addition">Solo suben</option><option value="subtraction">Solo bajan</option></select>';
  const modoAutobus=busOptions.querySelector("select");
  const recreoOptions=document.createElement("fieldset");
  recreoOptions.className="opciones-ayuda-problemas";
  recreoOptions.innerHTML='<legend>El recreo en el aula</legend><label for="modoRecreo">Movimiento de estudiantes</label><select id="modoRecreo"><option value="mixto">Mixto (salen o regresan)</option><option value="subtraction">Solo salen</option><option value="addition">Solo regresan</option></select>';
  const modoRecreo=recreoOptions.querySelector("select");
  const parkingOptions=document.createElement("fieldset");
  parkingOptions.className="opciones-ayuda-problemas";
  parkingOptions.innerHTML='<legend>Estacionamiento</legend><label for="modoEstacionamiento">Movimiento de carros</label><select id="modoEstacionamiento"><option value="alternado">Alternan: llegan y se van</option><option value="azar">Al azar en cada ronda</option><option value="addition">Solo llegan</option><option value="subtraction">Solo se van</option></select>';
  const modoEstacionamiento=parkingOptions.querySelector("select");
  const dulcesOptions=document.createElement("fieldset");
  dulcesOptions.className="opciones-ayuda-problemas";
  dulcesOptions.innerHTML='<legend>Dulces de Andrés y María</legend><label for="modoDulces">Operación con dulces</label><select id="modoDulces"><option value="addition">Solo suma</option><option value="subtraction">Resta con ambos turnos</option><option value="restaAndres">Resta: María le quita a Andrés</option><option value="restaMaria">Resta: Andrés le quita a María</option><option value="mixto">Mixto (suma y resta)</option></select>';
  const modoDulces=dulcesOptions.querySelector("select");
  const opcionesNuevas=document.createElement("fieldset");
  opcionesNuevas.className="opciones-ayuda-problemas";
  opcionesNuevas.innerHTML='<legend>Estanque, nevera y piscina</legend>';
  const modosNuevos=Object.entries({
    patosEstanque:"Patos en el estanque",
    frutasNevera:"Frutas en la nevera",
    ninosPiscina:"Niños en la piscina"
  }).map(([id,titulo])=>{
    const campo=document.createElement("div");
    const label=document.createElement("label");
    const select=document.createElement("select");
    select.id="modo-"+id;
    label.htmlFor=select.id;
    label.textContent=titulo;
    select.innerHTML='<option value="alternado">Alternar suma y resta</option><option value="azar">Al azar en cada ronda</option><option value="addition">Solo suma</option><option value="subtraction">Solo resta</option>';
    campo.append(label,select);
    opcionesNuevas.append(campo);
    return [id,select];
  });
  const voice=document.createElement("div");
  voice.id="preferenciasProblemas";
  const done=document.createElement("button");
  done.type="button";
  done.className="mainBtn aplicar-ajustes-problemas";
  done.textContent="Aplicar y volver";
  settings.append(options,busOptions,recreoOptions,parkingOptions,dulcesOptions,opcionesNuevas,voice,done);
  dialog.append(settings);
  document.body.append(dialog);

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
    "Estanque, nevera y piscina":"Pond, fridge and pool",
    "Patos en el estanque":"Ducks in the pond","Frutas en la nevera":"Fruit in the fridge",
    "Niños en la piscina":"Children in the pool","Alternar suma y resta":"Alternate addition and subtraction",
    "Solo resta":"Subtraction only",
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

  let previousRange;
  openSettings.onclick=()=>{
    previousRange=JSON.stringify(readParams());
    modoAutobus.value=preferenciasProblemas.autobus;
    modoRecreo.value=preferenciasProblemas.recreo;
    modoEstacionamiento.value=preferenciasProblemas.estacionamiento;
    modoDulces.value=preferenciasProblemas.dulces;
    for(const [id,select] of modosNuevos)select.value=preferenciasProblemas[id];
    for(const input of options.querySelectorAll("input"))input.checked=preferenciasProblemas[input.name];
    IdiomaVoz.iniciarEdicion();
    dialog.showModal();
  };
  function applySettings(){
    for(const input of options.querySelectorAll("input"))preferenciasProblemas[input.name]=input.checked;
    const cambioAutobus=preferenciasProblemas.autobus!==modoAutobus.value;
    const cambioRecreo=preferenciasProblemas.recreo!==modoRecreo.value;
    const cambioEstacionamiento=preferenciasProblemas.estacionamiento!==modoEstacionamiento.value;
    const cambioDulces=preferenciasProblemas.dulces!==modoDulces.value;
    preferenciasProblemas.autobus=modoAutobus.value;
    preferenciasProblemas.recreo=modoRecreo.value;
    preferenciasProblemas.estacionamiento=modoEstacionamiento.value;
    preferenciasProblemas.dulces=modoDulces.value;
    const cambiosPorHistoria={busPasajeros:cambioAutobus,aulaRecreo:cambioRecreo,estacionamiento:cambioEstacionamiento,andresMariaDulcesPlato:cambioDulces};
    for(const [id,select] of modosNuevos){
      cambiosPorHistoria[id]=preferenciasProblemas[id]!==select.value;
      preferenciasProblemas[id]=select.value;
    }
    if(!preferenciasProblemas.narracion)window.speechSynthesis?.cancel();
    Matematicas.guardar(CLAVE_AYUDAS_PROBLEMAS,preferenciasProblemas);
    const changed=JSON.stringify(readParams())!==previousRange;
    saveParams();
    saveFontSetting();
    IdiomaVoz.aplicarEdicion();
    if(state.currentProblem&&(changed||cambiosPorHistoria[state.currentProblem.id]))newProblem();
    actualizarAyudas();
    dialog.close();
  }
  close.onclick=done.onclick=applySettings;
  dialog.addEventListener("cancel",event=>{event.preventDefault();applySettings();});
  dialog.addEventListener("click",event=>{if(event.target===dialog)applySettings();});

  function updateLayout(){
    const folded=app.classList.contains("panel-lateral-oculto");
    const playing=app.dataset.pantalla==="problem";
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
  dialog.addEventListener("close",updateLayout);
})();
