/* One animation loop and canvas, with a manual start and rotating scenes. */
(() => {
  'use strict';
  const clave = 'signos.celebracion.v1';
  const tipos=['cohete','volcan','tren','globo'],claveUltima='signos.celebracion.ultima.v1';let ultima='';
  const colores = ['#ffe481', '#fff4c7', '#93d9ff', '#ffaabd', '#c6b5ff', '#a1ebd4'];
  const t = (es, en) => window.IdiomaVoz?.idioma === 'en' ? en : es;
  let preferencias = { activa: true, sonido: true, duracion: 8, tipo:'rotar' };
  try {
    const p = JSON.parse(localStorage.getItem(clave) || '{}');
    if (typeof p.activa === 'boolean') preferencias.activa = p.activa;
    if (typeof p.sonido === 'boolean') preferencias.sonido = p.sonido;
    if ([0, 8, 12, 20].includes(p.duracion)) preferencias.duracion = p.duracion;
    if (['rotar',...tipos].includes(p.tipo)) preferencias.tipo=p.tipo;
    const u=localStorage.getItem(claveUltima);if(tipos.includes(u))ultima=u;
  } catch {}
  let opciones, dialogo, area, canvas, ctx, cohete, llama, cuenta, numero, mensaje, estado, consola, cable, despegar, continuar, nuevaRonda, sonidoBoton, barra, escena;
  let audio, ruidoMotor, bufferRuido;
  const fuentes = new Set();
  const guardar = () => { try { localStorage.setItem(clave, JSON.stringify(preferencias)); } catch {} };

  function instalarConfiguracion() {
    if (opciones) return opciones;
    opciones = document.createElement('fieldset');
    opciones.className = 'opciones-fiesta-signos';
    opciones.innerHTML = '<legend>Celebraciones</legend><label><input type="checkbox" id="activarFiestaSignos"> Activar celebraciones</label><label class="duracion-fiesta-signos">Escena<select id="tipoFiestaSignos"><option value="rotar">Alternar las cuatro</option><option value="cohete">Cohete</option><option value="volcan">Volcán de números</option><option value="tren">Tren de la alegría</option><option value="globo">Globo aerostático</option></select></label><label><input type="checkbox" id="sonidoFiestaSignos"> Sonidos y voz de la celebración</label><label class="duracion-fiesta-signos">Tiempo de felicitación<select id="duracionFiestaSignos"><option value="8">8 segundos</option><option value="12">12 segundos</option><option value="20">20 segundos</option><option value="0">Hasta pulsar Continuar</option></select></label><p>Activa cada escena tocando su botón, palanca o quemador. Puedes iniciar otra ronda cuando quieras.</p>';
    prepararConfiguracion();
    return opciones;
  }
  function prepararConfiguracion() {
    if (!opciones) return;
    opciones.querySelector('#activarFiestaSignos').checked = preferencias.activa;
    opciones.querySelector('#sonidoFiestaSignos').checked = preferencias.sonido;
    opciones.querySelector('#duracionFiestaSignos').value = String(preferencias.duracion);
    opciones.querySelector('#tipoFiestaSignos').value=preferencias.tipo;
  }
  function aplicarConfiguracion() {
    if (!opciones) return;
    preferencias = {
      activa: opciones.querySelector('#activarFiestaSignos').checked,
      sonido: opciones.querySelector('#sonidoFiestaSignos').checked,
      duracion: Number(opciones.querySelector('#duracionFiestaSignos').value),
      tipo: opciones.querySelector('#tipoFiestaSignos').value
    };
    guardar();
  }

  function construir() {
    if (dialogo) return;
    dialogo = document.createElement('dialog');
    dialogo.className = 'fiesta-signos';
    dialogo.setAttribute('aria-labelledby', 'tituloFiestaSignos');
    dialogo.innerHTML = `<header class="cabecera-fiesta-signos"><h2 id="tituloFiestaSignos"></h2><button class="audio-fiesta-signos" type="button"></button></header>
      <section class="escena-fiesta-signos" aria-label="">
        <canvas aria-hidden="true"></canvas><div class="plataforma-fiesta-signos" aria-hidden="true"></div>
        <svg class="cable-despegue-signos" aria-hidden="true"><path class="funda-cable-signos"/><path class="hilo-cable-signos"/><circle r="6"/></svg>
        <div class="cohete-fiesta-signos" aria-hidden="true">${coheteSvg()}</div>
        <div class="consola-despegue-signos"><span class="flecha-pulsador-signos flecha-arriba" aria-hidden="true">${flechaSvg()}</span><span class="flecha-pulsador-signos flecha-izquierda" aria-hidden="true">${flechaSvg()}</span><span class="flecha-pulsador-signos flecha-derecha" aria-hidden="true">${flechaSvg()}</span><button class="despegar-fiesta-signos" type="button"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3V15M9 7A12 12 0 1 0 23 7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg><span></span></button></div>
        <div class="cuenta-fiesta-signos" aria-hidden="true"><span></span><strong>3</strong></div>
        <div class="mensaje-fiesta-signos" hidden><span class="insignia-fiesta-signos" aria-hidden="true">★</span><h3></h3><p></p></div>
      </section>
      <footer class="pie-fiesta-signos"><span class="estado-fiesta-signos" role="status" aria-live="polite"></span><button class="continuar-fiesta-signos" type="button"></button><button class="nueva-ronda-fiesta-signos" type="button"></button><div class="tiempo-fiesta-signos" aria-hidden="true"><span></span></div></footer>`;
    document.body.append(dialogo);
    area = dialogo.querySelector('.escena-fiesta-signos');
    canvas = area.querySelector('canvas'); ctx = canvas.getContext('2d', { alpha: true });
    cohete = area.querySelector('.cohete-fiesta-signos'); llama = area.querySelector('.llama-cohete-signos');
    cuenta = area.querySelector('.cuenta-fiesta-signos'); numero = cuenta.querySelector('strong');
    mensaje = area.querySelector('.mensaje-fiesta-signos'); estado = dialogo.querySelector('.estado-fiesta-signos');
    continuar = dialogo.querySelector('.continuar-fiesta-signos'); sonidoBoton = dialogo.querySelector('.audio-fiesta-signos');
    nuevaRonda = dialogo.querySelector('.nueva-ronda-fiesta-signos');
    despegar = dialogo.querySelector('.despegar-fiesta-signos');
    consola = area.querySelector('.consola-despegue-signos'); cable = area.querySelector('.cable-despegue-signos');
    barra = dialogo.querySelector('.tiempo-fiesta-signos');
    continuar.onclick = () => cerrar(true);
    despegar.onclick = iniciarAnimacion;
    nuevaRonda.onclick = () => {
      const accion = escena?.nuevaRonda;
      cerrar(); accion?.();
      document.getElementById('drop0')?.scrollIntoView({ block: 'nearest' });
      document.querySelector('.symbol-card')?.focus({ preventScroll: true });
    };
    sonidoBoton.onclick = () => {
      preferencias.sonido = !preferencias.sonido; guardar(); actualizarAudio();
      if (!preferencias.sonido) { pararAudio(); detenerLectura(); }
      else if (escena?.fase === 'despegue') motor();
    };
    dialogo.addEventListener('cancel', e => { e.preventDefault(); cerrar(true); });
  }
  function flechaSvg() { return '<svg viewBox="0 0 32 44"><path d="M12 3H20V24H29L16 40L3 24H12Z" fill="#ffe69b" stroke="#a97432" stroke-width="2" stroke-linejoin="round"/></svg>'; }
  function coheteSvg() {
    return `<svg viewBox="0 0 160 300" aria-hidden="true"><defs>
      <linearGradient id="cuerpoCoheteSignos"><stop stop-color="#c2deed"/><stop offset=".35" stop-color="#fff"/><stop offset=".7" stop-color="#e9f5ff"/><stop offset="1" stop-color="#88b8d6"/></linearGradient>
      <linearGradient id="narizCoheteSignos" x2=".85" y2=".75"><stop stop-color="#ff9896"/><stop offset="1" stop-color="#e74e6c"/></linearGradient>
      <linearGradient id="vidrioCoheteSignos" x2="1" y2="1"><stop stop-color="#b5f3ff"/><stop offset="1" stop-color="#3485b7"/></linearGradient></defs>
      <g class="llama-cohete-signos" style="opacity:0"><path d="M53 213Q39 252 80 295Q121 252 107 213Z" fill="#ff9561"/><path d="M64 213Q54 246 80 279Q106 246 96 213Z" fill="#ffdc76"/><path d="M73 213Q64 238 80 257Q96 238 87 213Z" fill="#fff5d4"/></g>
      <path d="M48 135Q13 146 15 217L54 198ZM112 135Q147 146 145 217L106 198Z" fill="url(#narizCoheteSignos)" stroke="#ca4665" stroke-width="3"/>
      <path d="M48 100Q47 58 80 15Q113 58 112 100V192Q112 213 100 221H60Q48 213 48 192Z" fill="url(#cuerpoCoheteSignos)" stroke="#658da9" stroke-width="3"/>
      <path d="M49 89Q56 45 80 15Q104 45 111 89Z" fill="url(#narizCoheteSignos)"/>
      <path d="M59 103V169" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
      <circle cx="80" cy="123" r="24" fill="#7fa7c6" stroke="#fff" stroke-width="4"/><circle cx="80" cy="123" r="18" fill="url(#vidrioCoheteSignos)"/><path d="M69 119Q70 110 78 110" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" opacity=".8"/>
      <path d="M80 159L86 173L101 175L90 185L93 200L80 192L67 200L70 185L59 175L74 173Z" fill="#f5c755" stroke="#dca742" stroke-width="2"/>
      <path d="M59 215H101L106 230H54Z" fill="#557b9d" stroke="#385c7b" stroke-width="3"/><path d="M64 221H96" stroke="#b9dbea" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
  function actualizarAudio() {
    sonidoBoton.textContent = preferencias.sonido ? '🔊' : '🔇';
    sonidoBoton.setAttribute('aria-label', t('Sonidos y voz de la celebración', 'Celebration sounds and voice'));
    sonidoBoton.title = sonidoBoton.getAttribute('aria-label');
    sonidoBoton.setAttribute('aria-pressed', String(preferencias.sonido));
  }
  function abrir({ nombre = 'Gabriel', texto, tipo:seleccion, nuevaRonda: iniciarRonda = () => document.getElementById('btnNew')?.click() } = {}) {
    cerrar(); if (!preferencias.activa) return false;
    construir(); window.speechSynthesis?.cancel();
    const tipo=tipos.includes(seleccion)?seleccion:preferencias.tipo==='rotar'?tipos[(tipos.indexOf(ultima)+1)%tipos.length]:preferencias.tipo;
    if(!tipos.includes(seleccion)){ultima=tipo;try{localStorage.setItem(claveUltima,tipo);}catch{}}
    escena = {
      inicio: null, ultimo: 0, frame: 0, fase: '', numero: 0, t: 0, estrellas: [], humo: [],tipo,extra:null,
      w: 0, h: 0, alto: 0, emision: 0, final: 8.3, lectura: null, leyendo: false,
      reducido: matchMedia('(prefers-reduced-motion:reduce)').matches,
      nombre, nuevaRonda: iniciarRonda, texto: texto || t(`¡Felicidades, ${nombre}! Lo has hecho genial. Sigue así.`, `Congratulations, ${nombre}! You did a great job. Keep it up!`)
    };
    dialogo.dataset.tipo=tipo;
    if(tipo!=='cohete'){
      escena.extra=EscenasFiestaSignos.crear(tipo,area,{t,activar:iniciarAnimacion,sonar:sonarEscena,reducido:escena.reducido});
      escena.final=escena.extra.final;
    }
    const titulos={cohete:t('¡Misión cumplida!','Mission complete!'),volcan:t('Volcán de números','Number volcano'),tren:t('Tren de la alegría','Happy train'),globo:t('Globo aerostático','Hot-air balloon')};
    dialogo.querySelector('h2').textContent = titulos[tipo];
    area.setAttribute('aria-label',tipo==='cohete'?t('Despegue de un cohete y lluvia de estrellas','Rocket launch and falling stars'):titulos[tipo]);
    cuenta.querySelector('span').textContent = t('Despegue en', 'Launch in');
    continuar.textContent = t('Continuar →', 'Continue →');
    despegar.querySelector('span').textContent = t('Despegar', 'Launch');
    despegar.setAttribute('aria-label',t('Iniciar despegue: cuenta regresiva de tres segundos','Start launch: three-second countdown'));
    nuevaRonda.textContent = t('↻ Nueva ronda', '↻ New round'); actualizarAudio();
    mensaje.hidden = true; cohete.hidden = false; cuenta.hidden = false; barra.hidden = true;
    mensaje.querySelector('h3').textContent = t('¡Felicidades!', 'Congratulations!');
    mensaje.querySelector('p').textContent = t(`${nombre}, ¡lo has hecho genial!`, `${nombre}, you did a great job!`);
    dialogo.style.zoom = String(1 / (parseFloat(getComputedStyle(document.body).zoom) || 1));
    cambiarFase('preparado'); dialogo.showModal(); ajustar(); pintar();
    (escena.extra?.boton||despegar).focus({ preventScroll: true });
    return true;
  }
  function iniciarAnimacion() {
    if (!escena || escena.inicio !== null) return;
    contextoAudio();
    escena.inicio = performance.now();
    actualizar(0,0); pintar();
    continuar.focus({ preventScroll: true });
    escena.frame = requestAnimationFrame(dibujar);
  }
  function ajustar() {
    if (!escena) return;
    dialogo.style.zoom = String(1 / (parseFloat(getComputedStyle(document.body).zoom) || 1));
    const r = area.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
    escena.w = area.clientWidth; escena.h = area.clientHeight;
    escena.alto = Math.min(360, escena.h * .78, escena.w * .8);
    const horizontal = escena.w > escena.h * 1.1;
    escena.coheteX = escena.w * (horizontal ? .68 : .5);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    cohete.style.width = escena.alto * 160 / 300 + 'px'; cohete.style.height = escena.alto + 'px';
    const plataforma = area.querySelector('.plataforma-fiesta-signos');
    plataforma.style.left = escena.coheteX - escena.w * .15 + 'px'; plataforma.style.right = escena.w - escena.coheteX - escena.w * .15 + 'px';
    const diametro = horizontal ? Math.min(116, escena.w * .16, escena.h * .43) : Math.min(120, escena.w * .32, escena.h * .28);
    const anchoConsola = diametro + 32, x = horizontal ? Math.max(anchoConsola / 2 + 14, escena.w * .2) : escena.w * .5;
    const y = horizontal ? Math.min(escena.h * .67, escena.h - anchoConsola / 2 - 12) : Math.max(anchoConsola / 2 + 36, escena.h * .24);
    consola.style.setProperty('--diametro-pulsador',diametro+'px');
    consola.style.left = x - anchoConsola / 2 + 'px'; consola.style.top = y - anchoConsola / 2 + 'px';
    const sx = x + anchoConsola / 2 - 4, sy = y + 10, ex = escena.coheteX + (horizontal ? -1 : 1) * escena.alto * 160 / 300 * .2, ey = escena.h - escena.alto * .08 - 16;
    const curva = horizontal ? (sx + ex) / 2 : escena.w - 14;
    cable.setAttribute('viewBox',`0 0 ${escena.w} ${escena.h}`);
    cable.querySelectorAll('path').forEach(p=>p.setAttribute('d',`M${sx} ${sy} C${curva} ${sy+28} ${curva} ${ey+12} ${ex} ${ey}`));
    cable.querySelector('circle').setAttribute('cx',ex);cable.querySelector('circle').setAttribute('cy',ey);
    colocarCohete(escena.t);
    escena.extra?.ajustar(escena.w,escena.h);
    if (escena.inicio === null) pintar();
  }
  function colocarCohete(tiempo) {
    const p = Math.max(0, Math.min(1, (tiempo - 3) / 2.8));
    const base = escena.h - escena.alto * .78 - 16;
    const y = base - (base + escena.alto + 20) * p * p;
    const vibracion = escena.reducido || !p || p === 1 ? 0 : Math.sin(tiempo * 50) * 1.1;
    cohete.style.transform = `translate3d(${vibracion}px,${y}px,0)`;
    cohete.style.left = escena.coheteX - escena.alto * 160 / 300 / 2 + 'px';
    llama.style.opacity = p > 0 && p < 1 ? '1' : '0';
    llama.style.transform = `scaleY(${escena.reducido ? 1 : .92 + Math.sin(tiempo * 34) * .08})`;
  }
  function cambiarFase(fase) {
    if (escena.fase === fase) return;
    escena.fase = fase; dialogo.dataset.fase = fase;
    const etiquetas = {
      preparado: escena.extra?.instruccion||t('Pulsa Despegar para iniciar la cuenta regresiva.','Press Launch to start the countdown.'),
      animacion: escena.tipo==='volcan'?t('¡Mira los números que salen del volcán!','Look at the numbers coming out of the volcano!'):escena.tipo==='tren'?t('¡El tren de la alegría está en marcha!','The happy train is on its way!'):t('¡El globo se infla y sube al cielo!','The balloon inflates and rises into the sky!'),
      cuenta: t('Preparados para el despegue…', 'Ready for launch…'),
      despegue: t('¡Despegue!', 'Lift-off!'),
      estrellas: t('¡Una lluvia de estrellas para ti!', 'A shower of stars for you!'),
      felicitacion: t('¡Felicidades!', 'Congratulations!')
    };
    estado.textContent = etiquetas[fase];
    const esCohete=escena.tipo==='cohete';
    consola.hidden = !esCohete||fase !== 'preparado'; cable.toggleAttribute('hidden',!esCohete||fase !== 'preparado'); despegar.disabled = !esCohete||fase !== 'preparado';
    area.querySelector('.plataforma-fiesta-signos').hidden=!esCohete;
    continuar.hidden = false;
    cuenta.hidden = !esCohete||fase !== 'cuenta'; cohete.hidden = !esCohete||fase === 'estrellas' || fase === 'felicitacion';
    if (fase === 'despegue') motor();
    if (fase === 'estrellas') { pararAudio(); campana(); }
    if (fase === 'felicitacion') {
      mensaje.hidden = false; barra.hidden = preferencias.duracion === 0;
      if (preferencias.sonido) {
        const actual = escena;
        actual.lectura = window.IdiomaVoz?.hablar(actual.texto);
        actual.leyendo = !!actual.lectura;
        if (actual.lectura) {
          const fin = () => { if (escena === actual) actual.leyendo = false; };
          actual.lectura.onend = fin; actual.lectura.onerror = fin;
        }
      }
    }
  }
  function emitirEstrella() {
    const limite = (navigator.hardwareConcurrency || 4) <= 4 ? 130 : 200;
    if (escena.estrellas.length >= limite) return;
    escena.estrellas.push({ x: Math.random(), y: -.08 - Math.random() * .1, vx: (Math.random() - .5) * .055, vy: .16 + Math.random() * .2, giro: Math.random() * 6, tamano: 6 + Math.random() * 11, color: colores[Math.floor(Math.random() * colores.length)] });
  }
  function actualizar(dt, tiempo) {
    escena.t = tiempo;
    if(escena.extra){cambiarFase(tiempo<escena.final?'animacion':'felicitacion');escena.extra.actualizar(dt,tiempo);return;}
    cambiarFase(tiempo < 3 ? 'cuenta' : tiempo < 6 ? 'despegue' : tiempo < escena.final ? 'estrellas' : 'felicitacion');
    if (escena.fase === 'cuenta') {
      const n = 3 - Math.floor(tiempo);
      if (n !== escena.numero) { escena.numero = n; numero.textContent = n; if (preferencias.sonido) escena.lectura = window.IdiomaVoz?.hablar(String(n)); }
    }
    colocarCohete(tiempo);
    if (escena.fase === 'despegue') {
      if (!escena.reducido && escena.humo.length < 28) escena.humo.push({ x: .5, y: .88, r: 5, vida: 0, vx: (Math.random() - .5) * .14 });
    }
    if (tiempo >= 6 && tiempo < escena.final + 2.5) {
      escena.emision += dt * (escena.reducido ? 12 : 65);
      while (escena.emision >= 1) { emitirEstrella(); escena.emision--; }
    }
    for (const p of escena.estrellas) { p.y += p.vy * dt; p.x += p.vx * dt; if (!escena.reducido) p.giro += dt * 1.3; }
    escena.estrellas = escena.estrellas.filter(p => p.y < 1.12);
    for (const p of escena.humo) { p.vida += dt; p.x += p.vx * dt; p.y -= dt * .012; p.r += dt * 22; }
    escena.humo = escena.humo.filter(p => p.vida < 1.4);
  }
  function pintar() {
    if (!ctx || !escena) return;
    const { w, h } = escena; ctx.clearRect(0, 0, w, h);
    if(escena.extra){escena.extra.pintar(ctx);return;}
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = i % 3 ? '#ffffff66' : '#fff8cc99'; ctx.beginPath();
      const x = Math.sin(i * 127.1 + 23) * 43758.5453, y = Math.sin(i * 311.7 + 31) * 19642.349;
      ctx.arc((x - Math.floor(x)) * w, (y - Math.floor(y)) * h * .85, i % 3 ? 1 : 2, 0, Math.PI * 2); ctx.fill();
    }
    for (const p of escena.humo) { ctx.globalAlpha = Math.max(0, 1 - p.vida / 1.4) * .3; ctx.fillStyle = '#e4f2ff'; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const p of escena.estrellas) {
      ctx.save(); ctx.translate(p.x * w, p.y * h); ctx.rotate(p.giro); ctx.fillStyle = p.color; ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? p.tamano * .44 : p.tamano; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  function dibujar(ms) {
    if (!escena) return;
    const tiempo = (ms - escena.inicio) / 1000;
    if (preferencias.duracion && tiempo >= escena.final + preferencias.duracion && (!escena.leyendo || tiempo >= escena.final + 30)) { cerrar(true); return; }
    if (!escena.ultimo || ms - escena.ultimo >= 1000 / 30) {
      const dt = Math.min(.075, escena.ultimo ? (ms - escena.ultimo) / 1000 : 0); escena.ultimo = ms;
      actualizar(dt, tiempo); pintar();
      if (tiempo >= escena.final && preferencias.duracion) barra.firstElementChild.style.transform = `scaleX(${Math.max(0, 1 - (tiempo - escena.final) / preferencias.duracion)})`;
    }
    escena.frame = requestAnimationFrame(dibujar);
  }
  function contextoAudio() {
    if (!preferencias.sonido || !escena) return null;
    try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(() => {}); return audio; } catch { return null; }
  }
  function reproducirFuente(fuente, destino, { demora=0, duracion, ataque, volumen }) {
    const inicio = audio.currentTime + demora;
    const ganancia = audio.createGain();
    destino.connect(ganancia).connect(audio.destination);
    ganancia.gain.setValueAtTime(.0001, inicio);
    ganancia.gain.exponentialRampToValueAtTime(volumen, inicio + ataque);
    ganancia.gain.exponentialRampToValueAtTime(.0001, inicio + duracion);
    fuentes.add(fuente);
    fuente.onended = () => {
      fuentes.delete(fuente);
      if (ruidoMotor === fuente) ruidoMotor = null;
      fuente.disconnect();
      if (destino !== fuente) destino.disconnect();
      ganancia.disconnect();
    };
    fuente.start(inicio);
    fuente.stop(inicio + duracion + .02);
    return fuente;
  }
  function ruido(frecuencia, envolvente, frecuenciaFinal=frecuencia) {
    if (!bufferRuido) {
      bufferRuido = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
      const muestras = bufferRuido.getChannelData(0);
      for (let i=0; i<muestras.length; i++) muestras[i] = Math.random()*2-1;
    }
    const fuente = audio.createBufferSource();
    const filtro = audio.createBiquadFilter();
    const inicio = audio.currentTime + (envolvente.demora || 0);
    fuente.buffer = bufferRuido;
    fuente.loop = true;
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(frecuencia, inicio);
    filtro.frequency.exponentialRampToValueAtTime(frecuenciaFinal, inicio + envolvente.duracion);
    fuente.connect(filtro);
    return reproducirFuente(fuente, filtro, envolvente);
  }
  function tono(desde, hasta, envolvente, tipo='sine') {
    const fuente = audio.createOscillator();
    const inicio = audio.currentTime + (envolvente.demora || 0);
    fuente.type = tipo;
    fuente.frequency.setValueAtTime(desde, inicio);
    fuente.frequency.exponentialRampToValueAtTime(hasta, inicio + envolvente.duracion);
    reproducirFuente(fuente, fuente, envolvente);
  }
  function motor() {
    if (!contextoAudio() || ruidoMotor) return;
    ruidoMotor = ruido(330, {duracion:3, ataque:.24, volumen:.09}, 1600);
    tono(56, 104, {duracion:2.6, ataque:.2, volumen:.035});
  }
  function campana() {
    if (!contextoAudio()) return;
    [660, 880, 1100, 1320].forEach((f, i) =>
      tono(f, f, {demora:i*.12, duracion:.55, ataque:.025, volumen:.035}));
  }
  function pararAudio() { for (const f of fuentes) { try { f.stop(); } catch {} } fuentes.clear(); ruidoMotor = null; }
  function sonarEscena(tipo){
    if (!contextoAudio()) return;
    switch (tipo) {
      case 'volcan':
        ruido(170, {duracion:1.4, ataque:.72, volumen:.11}, 450);
        break;
      case 'erupcion':
        ruido(1750, {duracion:1.8, ataque:.035, volumen:.21}, 160);
        tono(112, 44, {duracion:.85, ataque:.018, volumen:.12});
        for (const demora of [.26,.53,.78,1.02]) {
          ruido(2300, {demora, duracion:.22, ataque:.012, volumen:.075}, 480);
        }
        break;
      case 'tren':
        for (const [demora, duracion] of [[0,.27],[.36,.59]]) {
          tono(440, 392, {demora, duracion, ataque:.055, volumen:.05}, 'triangle');
          tono(554, 494, {demora, duracion, ataque:.055, volumen:.03});
        }
        break;
      case 'ruedas':
        ruido(700, {duracion:.16, ataque:.018, volumen:.065}, 210);
        tono(100, 62, {duracion:.12, ataque:.012, volumen:.027});
        break;
      case 'globo':
        ruido(1050, {duracion:1.9, ataque:.3, volumen:.09}, 2200);
        break;
      case 'ascenso':
        [523, 659, 784, 1047].forEach((f, i) =>
          tono(f, f, {demora:i*.17, duracion:.62, ataque:.045, volumen:.038}, 'triangle'));
        break;
    }
  }
  function detenerLectura() { if (escena?.lectura) { window.speechSynthesis?.cancel(); escena.lectura = null; escena.leyendo = false; } }
  function cerrar(enfocar = false) {
    detenerLectura(); if (escena) {cancelAnimationFrame(escena.frame);escena.extra?.destruir();} escena = null; pararAudio();
    if (dialogo) { if (dialogo.open) dialogo.close(); ctx?.clearRect(0, 0, canvas.width, canvas.height); delete dialogo.dataset.fase;delete dialogo.dataset.tipo; }
    if (enfocar) document.getElementById('btnNew')?.focus({ preventScroll: true });
  }
  addEventListener('resize', ajustar); window.visualViewport?.addEventListener('resize', ajustar);
  document.addEventListener('fullscreenchange', ajustar);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cerrar(); });
  new MutationObserver(() => { if (escena) ajustar(); }).observe(document.body, { attributes: true, attributeFilter: ['style'] });
  window.FiestaSignos = { instalarConfiguracion, prepararConfiguracion, aplicarConfiguracion, abrir, cerrar, get activa() { return !!escena; } };
})();
