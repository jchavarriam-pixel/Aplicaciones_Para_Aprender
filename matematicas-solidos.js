(() => {
  "use strict";

  Object.assign(window.TEXTOS_INGLES, ES_EN, {
    "Explorar":"Explore", "Pareo":"Matching","Pareo de sólidos":"Solid matching", "Evaluación":"Assessment",
    "Gira sólidos y descubre sus partes.":"Rotate solids and discover their parts.",
    "Une cada sólido con su nombre.":"Match each solid with its name.",
    "Cuenta caras, aristas o vértices.":"Count faces, edges, or vertices.",
    "Así jugamos":"How to play", "Elige una actividad para empezar.":"Choose an activity to start.",
    "Elegir modo":"Choose a mode", "Configuración":"Settings", "Aplicar y volver":"Apply and return",
    "Presentación y ayudas":"Display and hints", "Lado":"Side", "Alto":"Height", "Radio de la base":"Base radius", "Forma de la base":"Base shape", "Tipo de prisma":"Prism type", "Base triangular":"Triangular base", "Base cuadrada":"Square base", "Base rectangular":"Rectangular base", "Base pentagonal":"Pentagonal base", "Base hexagonal":"Hexagonal base", "Tamaño de la base":"Base size", "Seleccione al menos un sólido.":"Select at least one solid.",
    "Sólido para explorar":"Solid to explore", "Maneras de ver el sólido":"Ways to view the solid",
    "Gire el sólido, cambie sus medidas y toque Caras, Aristas o Vértices.":"Rotate the solid, change its dimensions, and tap Faces, Edges, or Vertices.",
    "Una cada sólido con su nombre. Arrastre el cohete o toque el cohete y su destino.":"Match each solid with its name. Drag the rocket or tap it and its destination.",
    "Arrastre el cohete o toque el cohete y su destino.":"Drag the rocket or tap it and its destination.",
    "Identifique cada sólido":"Identify each solid", "Figuras":"Shapes", "Nombres":"Names", "Cantidades":"Amounts",
    "Números":"Numbers", "Elementos visuales":"Visual elements", "Objetos":"Objects",
    "Mostrar respuestas como":"Show answers as", "Propiedad":"Property", "Detener giro":"Stop rotation",
    "Leer reto":"Read challenge", "Siguiente reto":"Next challenge",
    "Empareje todas las figuras antes de revisar.":"Match all the shapes before checking.",
    "Primero empareje todas las figuras.":"First match all the shapes.",
    "Una todas las figuras antes de revisar.":"Match all figures before checking.",
    "Este dispositivo no pudo iniciar el visor 3D.":"This device could not start the 3D viewer.",
    "El sólido girará para mostrar sus lados.":"The solid will turn to show its sides.",
    "Observe los sólidos desde varios lados.":"Look at the solids from different sides.",
    "Cohete de la figura":"Rocket for the shape", "Cohete de celebración: tocar para explotar":"Celebration rocket: tap to burst", "Aplicaciones":"Applications", "Cerrar":"Close"
  });
  Object.assign(ES_EN, window.TEXTOS_INGLES);

  const app=$(".app-shell");
  const toolbar=document.createElement("aside");
  toolbar.className="herramientas-solidos";
  app.prepend(toolbar);
  toolbar.append($(".topbar"));
  const guide=document.createElement("section");
  guide.className="guia-solidos";
  guide.innerHTML='<h2>Así jugamos</h2><p></p>';
  toolbar.append(guide);

  const actions=document.createElement("div");
  actions.className="controles-solidos";
  actions.innerHTML='<button class="secondary" id="volverModosSolidos" type="button">↩ Elegir modo</button><button class="secondary" id="settingsBtn" type="button">⚙ Configuración</button>';
  toolbar.append(actions);
  const settings=$("#settingsBackdrop");
  const menu=$(".mode-nav");
  const header=$(".encabezado-actividad-solidos");
  const dimensions=$("#dimensionControls");

  for(const view of $$(".mode-view")){
    const mode=view.id.replace("mode-","");
    const section=document.createElement("section");
    section.dataset.modeTools=mode;
    toolbar.append(section);
    const tools=view.querySelector(".challenge-toolbar");
    if(tools){
      const check=tools.querySelector(".success");
      const next=tools.querySelector(".primary.hidden");
      const review=document.createElement("div");
      review.className="acciones-solidos";
      review.append(check,next);
      view.append(review);
      section.append(tools);
      const newRound=tools.querySelector(".action-row button[id^='new']");
      actions.append(newRound);
      newRound.dataset.modeAction=mode;
      const scroller=document.createElement("div");
      scroller.className="desplazamiento-pareo";
      const board=view.querySelector(".matching-board");
      board.before(scroller);
      scroller.append(board);
    }
  }
  const explorer=$('[data-mode-tools="presentation"]');
  const animation=$("#cornerAnimate");
  explorer.append($(".controls-panel"));
  actions.append(animation);
  $('#mode-evaluation').insertBefore($("#readQuestionBtn"),$("#evalInstruction"));
  $(".viewer-panel").append(dimensions);
  $("#solidStrip").replaceWith(Object.assign(document.createElement("select"),{id:"solidStrip",className:"seleccion-solido"}));
  $("#solidStrip").setAttribute("aria-label","Sólido para explorar");
  $(".viewer-head").insertBefore($("#solidStrip"),$(".appearance-toggle"));
  $("#solidStrip").onchange=event=>selectSolid(event.target.value);
  const classStyle=$(".class-satin-toggle");
  classStyle.querySelector("input").setAttribute("aria-label","Sólido satinado");

  const instructions={
    menu:"Elige una actividad para empezar.",
    presentation:"Gire el sólido, cambie sus medidas y toque Caras, Aristas o Vértices.",
    classification:"Una cada sólido con su nombre. Arrastre el cohete o toque el cohete y su destino."
  };
  function updateGuide(){
    const selected=menu.querySelector('[data-mode="'+state.mode+'"] strong');
    $("#nombreModoSolidos").textContent=selected?.textContent||"";
    guide.querySelector("p").textContent=tr(instructions[state.mode]||$("#evalInstruction").textContent);
  }
  function updateLayout(){
    const folded=app.classList.contains("panel-lateral-oculto");
    header.hidden=!folded;
    $("#volverModosSolidos").hidden=state.mode==="menu";
    for(const section of $$("[data-mode-tools]"))section.hidden=section.dataset.modeTools!==state.mode;
    for(const button of $$("[data-mode-action]"))button.hidden=button.dataset.modeAction!==state.mode;
    const actionHost=folded?$("#accionesPlegadasSolidos"):toolbar;
    if(actions.parentElement!==actionHost){
      if(folded)actionHost.append(actions);
      else guide.after(actions);
    }
    animation.hidden=state.mode==="menu";
    updateGuide();
  }

  function updateLanguage(){
    state.config.language=IdiomaVoz.idioma;
    applyLanguage();
    buildSolidStrip();
    $("#viewerTitle").textContent=solidDisplayName(state.currentSolid,state.dimensions[state.currentSolid]);
    buildDimensionControls();
    updateSolidInfo(viewerRenderer.mesh);
    for(const target of $$("#matchingBoard .match-target")){
      target.lastElementChild.textContent=SOLIDS[target.dataset.solid].short;
    }
    if(state.classItems.length)updateClassProgress();
    if(state.evalItems?.length){
      updateEvaluationInstruction();
      renderEvalAnswers();
      updateEvalProgress();
      updateEvalFeedback();
      updateEvaluationNames();
    }
    updateGuide();
  }
  IdiomaVoz.instalar("#preferenciasSolidos",{cambioIdioma:updateLanguage});

  $("#settingsBtn").onclick=()=>{
    populateSettings();
    $("#errorAjustesSolidos").hidden=true;
    IdiomaVoz.iniciarEdicion();
    settings.showModal();
  };
  $("#resetConfigBtn").onclick=()=>{
    populateSettings(DEFAULT_CONFIG);
    $("#errorAjustesSolidos").hidden=true;
  };
  $("#saveSettingsBtn").onclick=$("#closeSettingsBtn").onclick=saveSettings;
  settings.addEventListener("cancel",event=>{event.preventDefault();saveSettings();});
  settings.addEventListener("click",event=>{if(event.target===settings)saveSettings();});
  $("#volverModosSolidos").onclick=()=>setMode("menu");
  $("#homeBtn").onclick=event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!window.AppsFullscreen)return;
    event.preventDefault();
    window.AppsFullscreen.navigate("index.html");
  };

  const fit=Matematicas.pantalla(app,(_,zoom)=>{
    const {clientWidth:width,clientHeight:height}=document.documentElement;
    const availableWidth=width/zoom+"px";
    if(document.body.style.getPropertyValue("--ancho-solidos")!==availableWidth)document.body.style.setProperty("--ancho-solidos",availableWidth);
    app.style.setProperty("--alto-util",height/zoom+"px");
    app.classList.toggle("horizontal",width>height);
    app.style.setProperty("--unidad",1/zoom+"px");
    app.style.setProperty("--escala-modelo",String(1/zoom));
    app.classList.toggle("compacta",height<500);
    updateLayout();
    for(const board of $$(".matching-board")){
      const n=board.querySelector(".matching-list").children.length||1;
      board.style.setProperty("--filas",n);
    }
    renderMatchLines();
    renderEvalMatchLines();
  });
  new MutationObserver(fit).observe(app,{attributes:true,attributeFilter:["class","data-modo"]});
  for(const list of $$(".matching-list"))new MutationObserver(fit).observe(list,{childList:true});
  for(const board of $$(".matching-board"))new ResizeObserver(fit).observe(board);
  document.addEventListener("DOMContentLoaded",()=>{
    const lockedDuringReview=[...$$(".controles-solidos button"),...$$(".challenge-toolbar input,.challenge-toolbar select"),$("#checkClassBtn"),$("#checkEvalBtn")];
    for(const [button,review] of [[$("#checkClassBtn"),checkClassification],[$("#checkEvalBtn"),checkEvaluation]]){
      button.onclick=async()=>{
        for(const control of lockedDuringReview)control.disabled=true;
        try{await review();}
        finally{for(const control of lockedDuringReview)control.disabled=false;}
      };
    }
    $("#readSolidBtn").hidden=!state.config.speech;
    updateLayout();
  });
})();

function updateEvaluationInstruction(){
  const property=propertyLabel(state.config.evalProperty);
  $("#evalCriterionTitle").textContent=isEnglish()?`Match the number of ${property}`:`Pareo: número de ${property}`;
  $("#evalInstruction").textContent=isEnglish()?`Match each solid with its number of ${property}. Drag the rocket or tap the rocket and its destination.`:
    `Una cada sólido con su cantidad de ${property}. Arrastre el cohete o toque el cohete y su destino.`;
}
function updateEvaluationNames(){
  for(const figure of $$(".eval-figure")){
    const item=state.evalItems.find(entry=>entry.uid===figure.dataset.evalUid);
    let label=figure.querySelector(".nombre-evaluacion-solidos");
    if(!label){
      label=document.createElement("span");
      label.className="nombre-evaluacion-solidos";
      figure.append(label);
    }
    label.textContent=solidDisplayName(item.id,item.params);
    label.hidden=!state.config.showEvalName;
  }
  $("#readQuestionBtn").hidden=!state.config.speech;
  $("#readSolidBtn").hidden=!state.config.speech;
}
function updateEvalFeedback(){
  const result=state.evalResult;
  $("#evalFeedback").textContent=!result?tr("Una todas las figuras antes de revisar."):
    result.good===result.total?tr("¡Excelente! Todos los pareos son correctos.","Excellent! All matches are correct."):
    isEnglish()?`${result.good} of ${result.total} matches are correct.`:`${result.good} de ${result.total} pareos son correctos.`;
}

function installSolidMatching(mode){
  const evaluation=mode==="evaluation";
  const board=$(evaluation?"#evalMatchingBoard":"#matchingBoard");
  const svg=board.querySelector(".matching-lines");
  const sourceKey=evaluation?"evalUid":"solid";
  const targetKey=evaluation?"evalTarget":"solid";
  const previewKey=evaluation?"uid":"sourceId";
  const lockKey=evaluation?"evalLocked":"classLocked";
  const draw=evaluation?renderEvalMatchLines:renderMatchLines;
  const match=evaluation?setEvalMatch:setMatch;
  const scroller=board.parentElement;
  let selected=null, drag=null, scrollFrame=0;
  function scrollWithPointer(){
    if(!drag?.moved)return;
    const bounds=scroller.getBoundingClientRect();
    const direction=drag.point.clientY>bounds.bottom-24?1:drag.point.clientY<bounds.top+24?-1:0;
    const before=scroller.scrollTop;
    scroller.scrollTop+=direction*7/Matematicas.escala();
    if(scroller.scrollTop!==before)preview(drag.point,drag.source);
    scrollFrame=requestAnimationFrame(scrollWithPointer);
  }
  function select(source){
    selected?.classList.remove("cohete-elegido");
    selected?.setAttribute("aria-pressed","false");
    selected=source;
    selected?.classList.add("cohete-elegido");
    selected?.setAttribute("aria-pressed","true");
  }
  function preview(event,source){
    draw({[previewKey]:source.dataset[sourceKey],...puntoEnPareo(svg,event.clientX,event.clientY)});
  }
  function connect(target){
    if(!selected||state[lockKey])return;
    match(selected.dataset[sourceKey],target.dataset[targetKey]);
    select(null);
  }
  function activate(element,label,callback){
    element.tabIndex=0;
    element.setAttribute("role","button");
    element.setAttribute("aria-label",label);
    element.addEventListener("keydown",event=>{
      if(event.key==="Enter"||event.key===" "){event.preventDefault();callback();}
    });
    element.onclick=event=>{if(event.detail===0)callback();};
  }
  for(const source of board.querySelectorAll(".match-source")){
    source.setAttribute("aria-pressed","false");
    activate(source,"Cohete de la figura",()=>{if(!state[lockKey])select(source);});
    source.addEventListener("pointerdown",event=>{
      if(drag||state[lockKey]||event.button!==0)return;
      event.preventDefault();
      select(source);
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false,point:event,source};
      source.setPointerCapture(event.pointerId);
    });
    source.addEventListener("pointermove",event=>{
      if(drag?.id!==event.pointerId)return;
      drag.point=event;
      if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>5){
        drag.moved=true;
        startRocketFlight(event.clientX,event.clientY);
        scrollFrame=requestAnimationFrame(scrollWithPointer);
      }
      if(drag.moved){
        moveRocketFlight(event.clientX,event.clientY);
        preview(event,source);
      }
    });
    function stop(event){
      if(drag?.id!==event.pointerId)return;
      const moved=drag.moved;
      drag=null;
      cancelAnimationFrame(scrollFrame);
      endRocketFlight();
      if(event.type==="pointerup"&&moved){
        const target=document.elementFromPoint(event.clientX,event.clientY)?.closest(".match-target");
        if(target?.closest(".matching-board")===board){connect(target);return;}
      }
      if(moved||event.type!=="pointerup")select(null);
      draw();
    }
    for(const type of ["pointerup","pointercancel","lostpointercapture"])source.addEventListener(type,stop);
  }
  for(const target of board.querySelectorAll(".match-target")){
    target.tabIndex=0;
    target.setAttribute("role","button");
  }
  board.onclick=event=>{
    const target=event.target.closest(".match-target");
    if(target)connect(target);
  };
  board.onkeydown=event=>{
    const target=event.target.closest(".match-target");
    if(target&&(event.key==="Enter"||event.key===" ")){event.preventDefault();connect(target);}
  };
}
