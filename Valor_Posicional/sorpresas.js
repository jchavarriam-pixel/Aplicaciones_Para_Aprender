(() => {
  'use strict';
  const regalos = {
    cohete:{icono:'🚀',mensaje:'¡Despegó un cohete!',duracion:1350},
    avion:{icono:'✈️',mensaje:'¡Un avión voló en espiral!',duracion:2450},
    explosion:{icono:'💥',mensaje:'¡Una explosión de colores!',duracion:1050},
    mariposa:{icono:'🦋',mensaje:'¡Una mariposa aleteó por el cielo!',duracion:2200},
    globo:{icono:'🎈',mensaje:'¡Un globo subió entre las nubes!',duracion:2050},
    arcoiris:{icono:'🌈',mensaje:'¡Se dibujó un arcoíris!',duracion:1800},
    estrella:{icono:'🌟',mensaje:'¡Pasó una estrella fugaz!',duracion:1400},
    planeta:{icono:'🪐',mensaje:'¡Un planeta giró en su órbita!',duracion:2250},
    delfin:{icono:'🐬',mensaje:'¡Un delfín saltó sobre el agua!',duracion:1800},
    pelota:{icono:'⚽',mensaje:'¡Una pelota dio tres botes!',duracion:1900},
    fuente:{icono:'⛲',mensaje:'¡Saltó una fuente de chispas!',duracion:1600},
    robot:{icono:'🤖',mensaje:'¡Un robot salió a bailar!',duracion:2100}
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
    '¡Una explosión de colores!':'An explosion of colours!',
    '¡Una mariposa aleteó por el cielo!':'A butterfly fluttered across the sky!',
    '¡Un globo subió entre las nubes!':'A balloon floated up through the clouds!',
    '¡Se dibujó un arcoíris!':'A rainbow appeared!',
    '¡Pasó una estrella fugaz!':'A shooting star flew by!',
    '¡Un planeta giró en su órbita!':'A planet spun in orbit!',
    '¡Un delfín saltó sobre el agua!':'A dolphin jumped out of the water!',
    '¡Una pelota dio tres botes!':'A ball bounced three times!',
    '¡Saltó una fuente de chispas!':'A fountain of sparks sprang up!',
    '¡Un robot salió a bailar!':'A robot came out to dance!'
  });
  const interpolar = (a,b,t) => a+(b-a)*t;
  const limitar = (n,min,max) => Math.max(min,Math.min(max,n));
  function espiral(x,y,w,h,t) {
    const radio = Math.min(w*.2,h*.23);
    const giro = t*2.8*Math.PI;
    const amplitud = radio*Math.sin(Math.PI*t);
    return {
      x:limitar(interpolar(x,x>w/2 ? w*.23 : w*.77,t)+Math.cos(giro)*amplitud,w*.10,w*.90),
      y:limitar(interpolar(y,h*.24,t)+Math.sin(giro)*amplitud*.8,h*.11,h*.88)
    };
  }
  const recorridos = {
    cohete:(x,y,w,h,p) => ({x:x+(w*.5-x)*p*.64+Math.sin(Math.PI*p)*w*.09,y:interpolar(y,-28,p*p)}),
    avion:espiral,
    mariposa:(x,y,w,h,p) => ({x:interpolar(x,x>w/2?w*.2:w*.8,p),y:interpolar(y,h*.25,p)+Math.sin(p*5*Math.PI)*h*.09}),
    globo:(x,y,w,h,p) => ({x:x+Math.sin(p*3*Math.PI)*w*.055,y:interpolar(y,h*.12,p)}),
    estrella:(x,y,w,h,p) => ({x:interpolar(x,x>w/2?w*.1:w*.9,p),y:interpolar(y,h*.15,Math.sqrt(p))}),
    planeta:(x,y,w,h,p) => {
      const giro = p*2*Math.PI, radio = Math.sin(Math.PI*p);
      return {x:interpolar(x,w*.5,p)+Math.sin(giro)*radio*w*.19,y:interpolar(y,h*.3,p)+(Math.cos(giro)-1)*radio*h*.13};
    },
    delfin:(x,y,w,h,p) => ({x:interpolar(x,x>w/2?w*.25:w*.75,p),y:y-Math.sin(p*Math.PI)*h*.36}),
    pelota:(x,y,w,h,p) => ({x:interpolar(x,x>w/2?w*.18:w*.82,p),y:y-Math.abs(Math.sin(p*3*Math.PI))*h*.32*(1-p*.64)}),
    robot:(x,y,w,h,p) => ({x:x+Math.sin(p*6*Math.PI)*w*.055,y:y-Math.abs(Math.sin(p*4*Math.PI))*h*.1})
  };
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
  function volar(ctx,tipo,x,y,w,h,progreso) {
    const trayectoria = recorridos[tipo];
    if(['cohete','avion','estrella','planeta'].includes(tipo)){
      for(let j=10;j>0;j--){
        const p = progreso-j*.014;
        if(p<0) continue;
        const punto = trayectoria(x,y,w,h,p);
        ctx.globalAlpha = .65*(1-j/11)*(1-progreso*.7);
        ctx.fillStyle = tipo === 'cohete' || tipo === 'estrella' ? colores[j%2] : '#dcf8ff';
        ctx.beginPath();
        ctx.arc(punto.x,punto.y,(11-j)*.57,0,Math.PI*2);
        ctx.fill();
      }
    }
    const ahora = trayectoria(x,y,w,h,progreso);
    const tamano = limitar(Math.min(w*.16,h*.33),26,65);
    let angulo = 0;
    if(tipo === 'cohete' || tipo === 'avion'){
      const luego = trayectoria(x,y,w,h,progreso+.008);
      angulo = Math.atan2(luego.y-ahora.y,luego.x-ahora.x)+Math.PI/4;
    } else if(tipo === 'pelota') angulo = progreso*(x>w/2?-1:1)*9;
    else if(tipo === 'robot') angulo = Math.sin(progreso*6*Math.PI)*.33;
    else if(tipo === 'delfin') angulo = (progreso-.5)*(x>w/2?-1:1)*1.3;
    else if(tipo === 'planeta') angulo = Math.sin(progreso*2*Math.PI)*.5;
    ctx.globalAlpha = limitar((1-progreso)/.18,0,1);
    if(tipo === 'globo') {
      emoji(ctx,'☁️',x-w*.075,h*.31,tamano*.58);
      emoji(ctx,'☁️',x+w*.075,h*.24,tamano*.53);
    }
    if(tipo === 'delfin') {
      const onda = Math.abs(progreso-.5)*2;
      ctx.strokeStyle = '#89fff3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(ahora.x,y+tamano*.26,5+onda*tamano*.45,2+onda*4,0,0,Math.PI*2);
      ctx.stroke();
    }
    const aleteo = tipo === 'mariposa' ? .45+.55*Math.abs(Math.cos(progreso*15*Math.PI)) : 1;
    emoji(ctx,regalos[tipo].icono,ahora.x,ahora.y,tamano,angulo,aleteo);
  }
  function dibujarArcoiris(ctx,x,y,w,h,p) {
    const radio = Math.min(w*.19,h*.29), cx = limitar(x,radio+5,w-radio-5);
    const bandas = ['#ff637a','#ffac67','#ffec79','#87ef9d','#75d6ff','#cda3ff'];
    const arco = Math.min(1,p/.68)*Math.PI;
    ctx.globalAlpha = limitar((1-p)/.2,0,1);
    ctx.lineWidth = radio*.095;
    ctx.lineCap = 'round';
    bandas.forEach((color,i) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(cx,y,radio-i*ctx.lineWidth,Math.PI,Math.PI+arco);
      ctx.stroke();
    });
  }
  function dibujarFuente(ctx,x,y,w,h,p) {
    for(let i=0;i<30;i++){
      const tiempo = (p-i*.018)*1.9;
      if(tiempo<0 || tiempo>1)continue;
      const desvio = (i%11-5)/5;
      const altura = h*(.24+i%6*.035);
      ctx.globalAlpha = (1-tiempo)*Math.min(1,tiempo*9);
      ctx.fillStyle = colores[i%colores.length];
      ctx.beginPath();
      ctx.arc(x+desvio*w*.23*tiempo,y-4*altura*tiempo*(1-tiempo),2+i%4,0,Math.PI*2);
      ctx.fill();
    }
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
        ctx.save();
        if(tipo==='explosion') estallar(ctx,x,y,rect.width,rect.height,progreso);
        else if(tipo==='arcoiris') dibujarArcoiris(ctx,x,y,rect.width,rect.height,progreso);
        else if(tipo==='fuente') dibujarFuente(ctx,x,y,rect.width,rect.height,progreso);
        else volar(ctx,tipo,x,y,rect.width,rect.height,progreso);
        ctx.restore();
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
      premio.style.setProperty('--duracion-premio',regalos[tipo].duracion+'ms');
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
