(() => {
  'use strict';
  const regalos = {
    cohete:{icono:'🚀',mensaje:'¡Despegó un cohete!',duracion:1350},
    avion:{icono:'✈️',mensaje:'¡Un avión voló en espiral!',duracion:2450},
    explosion:{icono:'💥',mensaje:'¡Una explosión de colores!',duracion:1050}
  };
  const colores = ['#ffcf53','#ff80ab','#89fff3','#bda9ff','#fff7b7','#a6ef82'];
  const t = texto => IdiomaVoz.t(texto);
  Object.assign(window.TEXTOS_INGLES, {
    '¡Huevos sorpresa!':'Surprise eggs!',
    'Toca cada huevo para descubrir qué hay dentro.':'Tap each egg to find out what is inside.',
    'Huevo sorpresa 1':'Surprise egg 1',
    'Huevo sorpresa 2':'Surprise egg 2',
    'Huevo sorpresa 3':'Surprise egg 3',
    '¡Despegó un cohete!':'A rocket took off!',
    '¡Un avión voló en espiral!':'A plane flew in a spiral!',
    '¡Una explosión de colores!':'An explosion of colours!'
  });
  const interpolar = (a,b,t) => a+(b-a)*t;
  const limitar = (n,min,max) => Math.max(min,Math.min(max,n));
  function trayectoria(tipo,x,y,w,h,t) {
    if(tipo === 'cohete') {
      return {x:x+(w*.5-x)*t*.64+Math.sin(Math.PI*t)*w*.09, y:interpolar(y,-28,t*t)};
    }
    const radio = Math.min(w*.2,h*.23);
    const giro = t*2.8*Math.PI;
    const amplitud = radio*Math.sin(Math.PI*t);
    return {
      x:limitar(interpolar(x,x>w/2 ? w*.23 : w*.77,t)+Math.cos(giro)*amplitud,w*.10,w*.90),
      y:limitar(interpolar(y,h*.24,t)+Math.sin(giro)*amplitud*.8,h*.11,h*.88)
    };
  }
  function volar(ctx,tipo,x,y,w,h,progreso) {
    for(let j=10;j>0;j--){
      const p = progreso-j*.014;
      if(p<0) continue;
      const punto = trayectoria(tipo,x,y,w,h,p);
      ctx.globalAlpha = .56*(1-j/11)*(1-progreso*.7);
      ctx.fillStyle = tipo === 'cohete' ? colores[j%2] : '#dcf8ff';
      ctx.beginPath();
      ctx.arc(punto.x,punto.y,(11-j)*.47,0,Math.PI*2);
      ctx.fill();
    }
    const ahora = trayectoria(tipo,x,y,w,h,progreso);
    const luego = trayectoria(tipo,x,y,w,h,progreso+.008);
    const angulo = Math.atan2(luego.y-ahora.y,luego.x-ahora.x);
    const tamano = limitar(Math.min(w*.16,h*.33),26,65);
    ctx.save();
    ctx.globalAlpha = limitar((1-progreso)/.18,0,1);
    ctx.translate(ahora.x,ahora.y);
    ctx.rotate(angulo+Math.PI/4);
    ctx.font = tamano+'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(regalos[tipo].icono,0,0);
    ctx.restore();
  }
  function estallar(ctx,x,y,w,h,p) {
    const impulso = Math.min(w*.3,h*.43,128);
    ctx.globalAlpha = limitar((1-p)/.4,0,1);
    for(let i=0;i<34;i++){
      const angulo = i*Math.PI*2/34;
      const distancia = impulso*(.48+(i*13%17)/26)*(1-(1-p)**2);
      const tamano = 4+i%5;
      ctx.save();
      ctx.translate(x+Math.cos(angulo)*distancia,y+Math.sin(angulo)*distancia+p*p*h*.12);
      ctx.rotate(angulo+p*(i%2 ? -4 : 4));
      ctx.fillStyle = colores[i%colores.length];
      if(i%3 === 0) ctx.fillRect(-tamano/2,-tamano/2,tamano,tamano);
      else {
        ctx.beginPath();
        if(i%3 === 1) ctx.arc(0,0,tamano*.52,0,Math.PI*2);
        else {
          ctx.moveTo(0,-tamano);
          ctx.lineTo(tamano*.75,tamano*.58);
          ctx.lineTo(-tamano*.75,tamano*.58);
        }
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = (1-p)*.65;
    ctx.strokeStyle = '#fff3a2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x,y,4+impulso*p,0,Math.PI*2);
    ctx.stroke();
  }
  function instalar(panel) {
    const huevos = panel.querySelector('.huevos');
    const aviso = panel.querySelector('[role="status"]');
    const canvas = panel.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    let actividad, frame = 0, vuelos = [];
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
      huevos.replaceChildren(...orden.map((regalo,i) => {
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
      if(!rect.width || !rect.height) return;
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
        if(tipo==='explosion') estallar(ctx,x,y,rect.width,rect.height,progreso);
        else volar(ctx,tipo,x,y,rect.width,rect.height,progreso);
      }
      ctx.globalAlpha = 1;
      if(vuelos.length) frame = requestAnimationFrame(pintar);
    }
    huevos.addEventListener('click', evento => {
      const huevo = evento.target.closest('.huevo-sorpresa');
      if(!huevo || huevo.getAttribute('aria-disabled') === 'true') return;
      const tipo = huevo.dataset.regalo;
      huevo.setAttribute('aria-disabled','true');
      rotular(huevo);
      const premio = document.createElement('span');
      premio.className = 'premio-huevo';
      premio.setAttribute('aria-hidden','true');
      premio.textContent = regalos[tipo].icono;
      huevo.append(premio);
      aviso.textContent = t(regalos[tipo].mensaje);
      if(!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      vuelos.push({inicio:performance.now(),tipo,huevo});
      if(!frame) frame = requestAnimationFrame(pintar);
    });
    return {abrir,cerrar,localizar() { [...huevos.children].forEach(rotular); }};
  }
  window.SorpresasValor = {instalar};
})();
