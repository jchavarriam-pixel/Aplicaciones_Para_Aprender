(() => {
  "use strict";
  const app=document.getElementById("app");
  const main=app.querySelector("main");
  const topbar=app.querySelector(".topbar");
  const panel=document.createElement("aside");
  panel.className="herramientas-fracciones";
  app.prepend(panel);
  panel.append(topbar);

  const guide=document.createElement("section");
  guide.className="guia-fracciones";
  guide.innerHTML='<h2>Así jugamos</h2><p>Elige una actividad y practica con fracciones propias.</p>';
  panel.append(guide);
  const navigation=document.createElement("div");
  navigation.className="navegacion-fracciones";
  const back=document.getElementById("backBtn");
  const mode=document.getElementById("modeBtn");
  const config=document.getElementById("settingsBtn");
  config.textContent="⚙ Configuración";
  back.textContent="← Actividades";
  navigation.append(back,config,mode);
  panel.append(navigation);
  const repeat=document.getElementById("repeatBtn");
  navigation.append(repeat);
  topbar.querySelector(".top-actions").remove();

  const home=document.getElementById("homeLink");
  home.onclick=event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!window.AppsFullscreen)return;
    event.preventDefault();
    window.AppsFullscreen.navigate("index.html");
  };

  const delegated=document.createElement("div");
  delegated.className="herramientas-actividad-fracciones";
  panel.append(delegated);
  for(const id of ["a1","a2","a3","a4"]){
    const screen=document.getElementById(id+"Screen");
    const group=document.createElement("div");
    group.className="opciones-actividad-fracciones";
    group.dataset.herramientas=id;
    group.append(screen.querySelector("[data-settings-scope]"));
    if(id==="a1")group.append(document.getElementById("a1CountHelp"));
    if(id==="a3"){
      group.append(document.getElementById("customizeMatch"),document.getElementById("matchCustomizeSummary"));
      document.querySelector(".match-customize").remove();
    }
    delegated.append(group);
  }
  const foldedBar=document.createElement("div");
  foldedBar.className="controles-plegados-fracciones";
  foldedBar.hidden=true;
  main.prepend(foldedBar);
  const board=document.getElementById("matchBoard");
  const matchArea=document.createElement("div");
  matchArea.className="marco-pareo-fracciones";
  board.before(matchArea);
  matchArea.append(board);

  const voice=document.createElement("section");
  voice.id="preferenciasFracciones";
  document.querySelector("#settingsDialog .settings-body").append(voice);
  IdiomaVoz.instalar("#preferenciasFracciones",{cambioIdioma:FraccionesAPI.refreshActivityLanguage});
  FraccionesAPI.renderActivityCards();

  const guideText={
    a1:"Cuenta las partes pintadas y las partes del entero.",
    a2:"Elige el color indicado y toca las partes.",
    a3:"Une las representaciones de la misma fracción.",
    a4:"Divide el entero y después colorea las partes."
  };
  function updateLayout(){
    const activity=FraccionesAPI.current;
    const folded=app.classList.contains("panel-lateral-oculto");
    foldedBar.hidden=!folded;
    back.hidden=!activity;repeat.hidden=!!activity;
    for(const group of delegated.children)group.hidden=group.dataset.herramientas!==activity;
    const message=guideText[activity]||"Elige una actividad y practica con fracciones propias.";
    const guideLine=guide.querySelector("p");
    if(guideLine.dataset.message!==message){
      guideLine.dataset.message=message;
      guideLine.textContent=message;
    }
    const host=folded?foldedBar:panel;
    if(navigation.parentElement!==host)host.append(navigation,delegated);
  }
  const fit=Matematicas.pantalla(app,(_,zoom)=>{
    const width=document.documentElement.clientWidth,height=document.documentElement.clientHeight;
    const available=width/zoom+"px";
    if(document.body.style.getPropertyValue("--ancho-fracciones")!==available)document.body.style.setProperty("--ancho-fracciones",available);
    app.style.setProperty("--alto-util",height/zoom+"px");
    app.style.setProperty("--unidad",1/zoom+"px");
    app.classList.toggle("horizontal",width>height);
    app.classList.toggle("compacta",height<540);
    updateLayout();
    const rows=Math.max(document.getElementById("leftMatchCol").children.length,document.getElementById("rightMatchCol").children.length)-1;
    board.style.setProperty("--filas",Math.max(1,rows));
    if(FraccionesAPI.current==="a3")FraccionesAPI.redrawConnections();
  });
  new MutationObserver(fit).observe(app,{attributes:true,attributeFilter:["class","data-actividad"]});
  for(const id of ["leftMatchCol","rightMatchCol"])new MutationObserver(fit).observe(document.getElementById(id),{childList:true});
  new ResizeObserver(fit).observe(board);
})();
