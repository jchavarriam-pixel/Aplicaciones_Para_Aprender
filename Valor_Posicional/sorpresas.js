(() => {
  'use strict';
  const regalos = {
    cohete:{icono:'🚀',mensaje:'¡Despegó un cohete gigante!',ingles:'A giant rocket took off!',duracion:2050,efecto:cohete},
    avion:{icono:'✈️',mensaje:'¡Un avión recorrió el cielo!',ingles:'A plane flew across the sky!',duracion:3950,efecto:avion},
    helicoptero:{icono:'🚁',mensaje:'¡Un helicóptero recorrió el cielo!',ingles:'A helicopter flew across the sky!',duracion:3950,efecto:helicoptero},
    globos:{icono:'🎈',mensaje:'¡Subieron globos de colores!',ingles:'Colourful balloons floated up!',duracion:2950,efecto:globos},
    mariposas:{icono:'🦋',mensaje:'¡Volaron muchas mariposas!',ingles:'Lots of butterflies flew by!',duracion:3250,efecto:mariposas},
    estrellas:{icono:'🌟',mensaje:'¡Estrellas en todas direcciones!',ingles:'Stars burst in every direction!',duracion:1850,efecto:estrellas},
    lluvia:{icono:'✨',mensaje:'¡Las estrellas subieron y luego cayeron!',ingles:'The stars shot up and then fell!',duracion:2700,efecto:lluvia},
    numeros:{icono:'🔢',mensaje:'¡Los números del uno al diez salieron brincando!',ingles:'The numbers one through ten bounced out!',duracion:3300,efecto:numeros},
    fugaces:{icono:'🌠',mensaje:'¡Estrellas fugaces en varias direcciones!',ingles:'Shooting stars flew in different directions!',duracion:2550,efecto:fugaces},
    figuras:{icono:'🔷',mensaje:'¡Figuras geométricas por toda la pantalla!',ingles:'Geometric shapes flew all over the screen!',duracion:2600,efecto:figuras}
  };
  const colores = ['#ffcf53','#ff80ab','#76edff','#c1a5ff','#fff3ab','#a6ef82','#ff9564'];
  const TAU = 2*Math.PI;
  const t = texto => IdiomaVoz.t(texto);
  Object.assign(window.TEXTOS_INGLES, {
    '¡Huevos sorpresa!':'Surprise eggs!',
    'Toca cada huevo para descubrir qué hay dentro.':'Tap each egg to find out what is inside.',
    'Huevo sorpresa 1':'Surprise egg 1',
    'Huevo sorpresa 2':'Surprise egg 2',
    'Huevo sorpresa 3':'Surprise egg 3',
    ...Object.fromEntries(Object.values(regalos).map(({mensaje,ingles}) => [mensaje,ingles]))
  });
  const unir = (a,b,p) => a+(b-a)*p;
  const limitar = (n,min=0,max=1) => Math.max(min,Math.min(max,n));
  const suavizar = p => p*p*(3-2*p);
  const apagar = (p,d=.25) => limitar((1-p)/d);
  const color = i => colores[i%colores.length];
  function emoji(ctx,icono,x,y,tamano,angulo=0,ancho=1) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angulo);
    ctx.scale(ancho,1);
    ctx.font = tamano+'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icono,0,0);
    ctx.restore();
  }
  function punto(ctx,x,y,r) {
    ctx.beginPath();
    ctx.arc(x,y,r,0,TAU);
    ctx.fill();
  }
  function poligono(ctx,x,y,r,lados,angulo,estrella=false) {
    const vertices = lados*(estrella?2:1);
    ctx.beginPath();
    for(let i=0;i<vertices;i++){
      const a = angulo+i*TAU/vertices;
      const radio = estrella && i%2 ? r*.44 : r;
      ctx.lineTo(x+Math.cos(a)*radio,y+Math.sin(a)*radio);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
  function estrella(ctx,x,y,r,angulo,colorEstrella) {
    ctx.fillStyle = colorEstrella;
    ctx.strokeStyle = '#614182';
    ctx.lineWidth = r*.19;
    ctx.lineJoin = 'round';
    poligono(ctx,x,y,r,5,angulo,true);
  }
  function cohete(ctx,x,y,w,h,p) {
    const tamano = limitar(Math.min(w,h)*.3,76,184);
    const subir = q => unir(y,-tamano,q*q);
    const centrar = q => unir(x,w*.5,suavizar(q)*.65);
    ctx.globalAlpha = apagar(p,.16);
    for(let i=1;i<=18;i++){
      const q = p-i*.012;
      if(q<0)continue;
      ctx.fillStyle = color(i);
      punto(ctx,centrar(q)+Math.sin(q*46+i)*i*1.15,subir(q)+tamano*.36+i*2,Math.max(2,tamano*(.065-i*.0028)));
    }
    emoji(ctx,'🚀',centrar(p),subir(p),tamano,-Math.PI/4);
  }
  function volar(ctx,x,y,w,h,p,esHelicoptero) {
    const tamano = limitar(Math.min(w,h)*.22,52,124);
    const direccion = x<w/2?1:-1;
    const cara = esHelicoptero ? '🚁' : '✈️';
    const ruta = q => {
      const a = esHelicoptero ? q*TAU : q*TAU*1.2;
      const entrada = suavizar(limitar(q*4.6));
      return {
        x:unir(x,w*.5+direccion*Math.sin(a)*Math.max(0,w*.5-tamano*.65),entrada),
        y:unir(y,h*.5-Math.cos(a*(esHelicoptero?1.25:1.75))*Math.max(0,h*.5-tamano*.75),entrada)
      };
    };
    const ahora = ruta(p), luego = ruta(p+.005);
    for(let i=1;i<=12;i++){
      const q = p-i*.013;
      if(q<0)continue;
      const {x:px,y:py} = ruta(q);
      ctx.globalAlpha = apagar(p,.16)*(.62-i*.04);
      ctx.fillStyle = '#e5faff';
      punto(ctx,px,py,(13-i)*.55);
    }
    ctx.globalAlpha = apagar(p,.15);
    const avanzaDerecha = luego.x>=ahora.x;
    const angulo = esHelicoptero ? (avanzaDerecha ? .12 : -.12) :
      Math.atan2(luego.y-ahora.y,luego.x-ahora.x)+Math.PI/4;
    emoji(ctx,cara,ahora.x,ahora.y,tamano,angulo,esHelicoptero&&avanzaDerecha ? -1 : 1);
  }
  function avion(ctx,x,y,w,h,p) { volar(ctx,x,y,w,h,p,false); }
  function helicoptero(ctx,x,y,w,h,p) { volar(ctx,x,y,w,h,p,true); }
  function globos(ctx,x,y,w,h,p) {
    const tamano = limitar(Math.min(w,h)*.065,17,46);
    for(let i=0;i<10;i++){
      const q = limitar((p-i*.021)/.8);
      if(q===0 || q===1)continue;
      const r = tamano*(.64+i%4*.14);
      const px = unir(x,w*(.07+.86*i/9),Math.sqrt(q))+Math.sin(q*8+i)*r*.39;
      const py = unir(y,-r*2,q*(.84+i%3*.08));
      ctx.globalAlpha = apagar(q,.18);
      ctx.strokeStyle = '#53639b';
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.moveTo(px,py+r);
      ctx.quadraticCurveTo(px-r*.23,py+r*1.36,px+r*.12,py+r*1.82);
      ctx.stroke();
      ctx.fillStyle = color(i);
      ctx.beginPath();
      ctx.ellipse(px,py,r*.77,r,0,0,TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffffbc';
      punto(ctx,px-r*.26,py-r*.33,r*.19);
    }
  }
  function mariposas(ctx,x,y,w,h,p) {
    const tamano = limitar(Math.min(w,h)*.105,29,68);
    for(let i=0;i<9;i++){
      const q = limitar((p-i*.023)/.79);
      if(q===0 || q===1)continue;
      const px = unir(x,w*(.08+.84*(i*5%9)/8),q);
      const py = unir(y,h*(.12+.73*(i*7%9)/8),q)+Math.sin(q*13+i)*h*.046;
      ctx.globalAlpha = apagar(q,.22);
      emoji(ctx,'🦋',px,py,tamano*(.58+i%4*.14),Math.sin(q*10+i)*.4,.36+.64*Math.abs(Math.cos(q*17*Math.PI+i)));
    }
  }
  function estrellas(ctx,x,y,w,h,p) {
    const escala = limitar(Math.min(w,h)*.028,7,20);
    const avance = 1-(1-p)**2;
    ctx.globalAlpha = apagar(p,.38);
    for(let i=0;i<44;i++){
      const a = i*2.399963, radio = .49+i%9*.071;
      estrella(ctx,x+Math.cos(a)*w*.52*radio*avance,y+Math.sin(a)*h*.51*radio*avance,
        escala*(.48+i%5*.16),a+p*(i%2?3:-3),color(i));
    }
  }
  function lluvia(ctx,x,y,w,h,p) {
    const escala = limitar(Math.min(w,h)*.027,7,21);
    for(let i=0;i<36;i++){
      const q = limitar((p-i%8*.022)/.83);
      if(q===0 || q===1)continue;
      const cx = unir(x,w*(.06+.88*(i*13%36)/35),suavizar(q));
      const cima = h*(.05+i%6*.05);
      const cy = q<.44 ? unir(y,cima,1-(1-q/.44)**2) : unir(cima,h+escala,((q-.44)/.56)**2);
      ctx.globalAlpha = apagar(q,.19);
      estrella(ctx,cx,cy,escala*(.52+i%5*.16),i+q*(i%2?3:-3),color(i));
    }
  }
  function numeros(ctx,x,y,w,h,p) {
    const columnas = w>h?10:5;
    const tamano = limitar(Math.min(w/columnas,h)*.68,25,90);
    ctx.font = '900 '+tamano+'px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#28215d';
    ctx.lineWidth = Math.max(3,tamano*.105);
    for(let i=0;i<10;i++){
      const q = limitar((p-i*.037)/.66);
      if(q===0 || q===1)continue;
      const px = unir(x,w*(i%columnas+.5)/columnas,suavizar(limitar(q*2.4)));
      const nivel = columnas===10 ? .65 : i<5 ? .48 : .76;
      const salto = Math.abs(Math.sin(q*3*Math.PI))*h*.185*(1-q*.48);
      const py = unir(y,h*nivel,q)-salto;
      ctx.globalAlpha = apagar(q,.19);
      ctx.fillStyle = color(i);
      ctx.strokeText(i+1,px,py);
      ctx.fillText(i+1,px,py);
    }
  }
  function fugaces(ctx,x,y,w,h,p) {
    const escala = limitar(Math.min(w,h)*.036,10,24);
    for(let i=0;i<11;i++){
      const q = limitar((p-i*.048)/.5);
      if(q===0 || q===1)continue;
      const a = i*TAU/11+.18;
      const dx = Math.cos(a)*w*.61, dy = Math.sin(a)*h*.61;
      const px = x+dx*q, py = y+dy*q;
      const cola = Math.min(q,.26);
      const brillo = ctx.createLinearGradient(px-dx*cola,py-dy*cola,px,py);
      brillo.addColorStop(0,'#ffffff00');
      brillo.addColorStop(1,color(i));
      ctx.globalAlpha = apagar(q,.2);
      ctx.strokeStyle = brillo;
      ctx.lineWidth = escala*.48;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px-dx*cola,py-dy*cola);
      ctx.lineTo(px,py);
      ctx.stroke();
      estrella(ctx,px,py,escala,a,color(i));
    }
  }
  function figuras(ctx,x,y,w,h,p) {
    const escala = limitar(Math.min(w,h)*.04,11,25);
    ctx.strokeStyle = '#363070';
    ctx.lineJoin = 'round';
    ctx.lineWidth = escala*.14;
    for(let i=0;i<40;i++){
      const q = limitar((p-i%9*.019)/.83);
      if(q===0 || q===1)continue;
      const cx = unir(x,w*(.045+.91*(i*17%40)/39),suavizar(q));
      const cy = unir(y,h*(.06+.88*(i*23%40)/39),suavizar(q))+Math.sin(q*Math.PI)*h*.07;
      const r = escala*(.55+i%5*.13);
      ctx.globalAlpha = apagar(q,.25);
      ctx.fillStyle = color(i);
      if(i%4===0) {
        ctx.beginPath();
        ctx.arc(cx,cy,r*.83,0,TAU);
        ctx.stroke();
        ctx.fill();
      } else poligono(ctx,cx,cy,r,2+i%4,i+q*TAU);
    }
  }

  function instalar(panel,canvas) {
    const huevos = panel.querySelector('.huevos');
    const aviso = panel.querySelector('[role="status"]');
    const ctx = canvas.getContext('2d');
    let actividad, frame = 0, vuelos = [], anteriores = [];
    function rotular(huevo,i) {
      const abierto = huevo.getAttribute('aria-disabled') === 'true';
      huevo.setAttribute('aria-label',t(abierto ? regalos[huevo.dataset.regalo].mensaje : `Huevo sorpresa ${i+1}`));
    }
    function cerrar() {
      cancelAnimationFrame(frame);
      frame = 0;
      vuelos = [];
      panel.hidden = true;
      if(actividad) actividad.inert = false;
      actividad = null;
      huevos.replaceChildren();
      aviso.textContent = '';
      ctx?.clearRect(0,0,canvas.width,canvas.height);
      canvas.hidden = true;
    }
    function abrir(tablero) {
      cerrar();
      actividad = tablero;
      actividad.inert = true;
      const orden = Object.keys(regalos);
      for(let i=orden.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [orden[i],orden[j]] = [orden[j],orden[i]];
      }
      if(orden.slice(0,3).every(regalo => anteriores.includes(regalo))) [orden[2],orden[3]] = [orden[3],orden[2]];
      anteriores = orden.slice(0,3);
      huevos.replaceChildren(...anteriores.map((regalo,i) => {
        const huevo = document.createElement('button');
        huevo.type = 'button';
        huevo.className = 'huevo-sorpresa';
        huevo.dataset.regalo = regalo;
        huevo.innerHTML = '<span class="cascaron" aria-hidden="true"></span><span class="pregunta-huevo" aria-hidden="true">?</span>';
        rotular(huevo,i);
        return huevo;
      }));
      panel.hidden = false;
      huevos.firstElementChild.focus({preventScroll:true});
    }
    function pintar(ahora) {
      frame = 0;
      const rect = canvas.getBoundingClientRect();
      if(!rect.width || !rect.height) { canvas.hidden = true; return; }
      const escala = Math.min(devicePixelRatio || 1,1.5);
      const ancho = Math.round(rect.width*escala), alto = Math.round(rect.height*escala);
      if(canvas.width !== ancho) canvas.width = ancho;
      if(canvas.height !== alto) canvas.height = alto;
      ctx.setTransform(escala,0,0,escala,0,0);
      ctx.clearRect(0,0,rect.width,rect.height);
      vuelos = vuelos.filter(({inicio,tipo}) => ahora-inicio < regalos[tipo].duracion);
      for(const {inicio,tipo,huevo} of vuelos){
        const origen = huevo.getBoundingClientRect();
        const x = origen.left-rect.left+origen.width/2, y = origen.top-rect.top+origen.height*.45;
        const progreso = limitar((ahora-inicio)/regalos[tipo].duracion,0,1);
        ctx.save();
        regalos[tipo].efecto(ctx,x,y,rect.width,rect.height,progreso);
        ctx.restore();
      }
      if(vuelos.length) frame = requestAnimationFrame(pintar);
      else canvas.hidden = true;
    }
    huevos.addEventListener('click', evento => {
      const huevo = evento.target.closest('.huevo-sorpresa');
      if(!huevo || huevo.getAttribute('aria-disabled') === 'true') return;
      const tipo = huevo.dataset.regalo;
      huevo.setAttribute('aria-disabled','true');
      rotular(huevo);
      const premio = document.createElement('span');
      premio.className = 'premio-huevo';
      premio.style.setProperty('--duracion-premio',regalos[tipo].duracion+'ms');
      premio.setAttribute('aria-hidden','true');
      premio.textContent = regalos[tipo].icono;
      huevo.append(premio);
      aviso.textContent = t(regalos[tipo].mensaje);
      if(!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      vuelos.push({inicio:performance.now(),tipo,huevo});
      canvas.hidden = false;
      if(!frame) frame = requestAnimationFrame(pintar);
    });
    return {abrir,cerrar,localizar() { [...huevos.children].forEach(rotular); }};
  }
  window.SorpresasValor = {instalar};
})();
