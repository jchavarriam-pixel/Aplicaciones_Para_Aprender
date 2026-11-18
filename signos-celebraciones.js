/* One animation loop, a bounded star canvas and one reusable SVG rocket. */
(() => {
  'use strict';
  const clave = 'signos.celebracion.v1';
  const colores = ['#ffe481', '#fff4c7', '#93d9ff', '#ffaabd', '#c6b5ff', '#a1ebd4'];
  const t = (es, en) => window.IdiomaVoz?.idioma === 'en' ? en : es;
  let preferencias = { activa: true, sonido: true, duracion: 8 };
  try {
    const p = JSON.parse(localStorage.getItem(clave) || '{}');
    if (typeof p.activa === 'boolean') preferencias.activa = p.activa;
    if (typeof p.sonido === 'boolean') preferencias.sonido = p.sonido;
    if ([0, 8, 12, 20].includes(p.duracion)) preferencias.duracion = p.duracion;
  } catch {}
  let opciones, dialogo, area, canvas, ctx, cohete, llama, cuenta, numero, mensaje, estado, continuar, sonidoBoton, barra, escena;
  let audio, ruidoMotor;
  const fuentes = new Set();
  const guardar = () => { try { localStorage.setItem(clave, JSON.stringify(preferencias)); } catch {} };

  function instalarConfiguracion() {
    if (opciones) return opciones;
    opciones = document.createElement('fieldset');
    opciones.className = 'opciones-fiesta-signos';
    opciones.innerHTML = '<legend>Celebración del cohete</legend><label><input type="checkbox" id="activarFiestaSignos"> Activar celebraciones</label><label><input type="checkbox" id="sonidoFiestaSignos"> Sonidos y voz de la celebración</label><label class="duracion-fiesta-signos">Tiempo de felicitación<select id="duracionFiestaSignos"><option value="8">8 segundos</option><option value="12">12 segundos</option><option value="20">20 segundos</option><option value="0">Hasta pulsar Continuar</option></select></label><p>Cuenta regresiva, despegue, lluvia de estrellas y una felicitación. Puedes continuar cuando quieras.</p>';
    prepararConfiguracion();
    return opciones;
  }
  function prepararConfiguracion() {
    if (!opciones) return;
    opciones.querySelector('#activarFiestaSignos').checked = preferencias.activa;
    opciones.querySelector('#sonidoFiestaSignos').checked = preferencias.sonido;
    opciones.querySelector('#duracionFiestaSignos').value = String(preferencias.duracion);
  }
  function aplicarConfiguracion() {
    if (!opciones) return;
    preferencias = {
      activa: opciones.querySelector('#activarFiestaSignos').checked,
      sonido: opciones.querySelector('#sonidoFiestaSignos').checked,
      duracion: Number(opciones.querySelector('#duracionFiestaSignos').value)
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
        <div class="cohete-fiesta-signos" aria-hidden="true">${coheteSvg()}</div>
        <div class="cuenta-fiesta-signos" aria-hidden="true"><span></span><strong>3</strong></div>
        <div class="mensaje-fiesta-signos" hidden><span class="insignia-fiesta-signos" aria-hidden="true">★</span><h3></h3><p></p></div>
      </section>
      <footer class="pie-fiesta-signos"><span class="estado-fiesta-signos" role="status" aria-live="polite"></span><button class="continuar-fiesta-signos" type="button"></button><div class="tiempo-fiesta-signos" aria-hidden="true"><span></span></div></footer>`;
    document.body.append(dialogo);
    area = dialogo.querySelector('.escena-fiesta-signos');
    canvas = area.querySelector('canvas'); ctx = canvas.getContext('2d', { alpha: true });
    cohete = area.querySelector('.cohete-fiesta-signos'); llama = area.querySelector('.llama-cohete-signos');
    cuenta = area.querySelector('.cuenta-fiesta-signos'); numero = cuenta.querySelector('strong');
    mensaje = area.querySelector('.mensaje-fiesta-signos'); estado = dialogo.querySelector('.estado-fiesta-signos');
    continuar = dialogo.querySelector('.continuar-fiesta-signos'); sonidoBoton = dialogo.querySelector('.audio-fiesta-signos');
    barra = dialogo.querySelector('.tiempo-fiesta-signos');
    continuar.onclick = () => cerrar(true);
    sonidoBoton.onclick = () => {
      preferencias.sonido = !preferencias.sonido; guardar(); actualizarAudio();
      if (!preferencias.sonido) { pararAudio(); detenerLectura(); }
      else if (escena?.fase === 'despegue') motor();
    };
    dialogo.addEventListener('cancel', e => { e.preventDefault(); cerrar(true); });
  }
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
  function abrir({ nombre = 'Gabriel', texto } = {}) {
    cerrar(); if (!preferencias.activa) return false;
    construir(); window.speechSynthesis?.cancel();
    escena = {
      inicio: performance.now(), ultimo: 0, frame: 0, fase: '', numero: 0, t: 0, estrellas: [], humo: [],
      w: 0, h: 0, alto: 0, emision: 0, final: 8.3, lectura: null, leyendo: false,
      reducido: matchMedia('(prefers-reduced-motion:reduce)').matches,
      nombre, texto: texto || t(`¡Felicidades, ${nombre}! Lo has hecho genial. Sigue así.`, `Congratulations, ${nombre}! You did a great job. Keep it up!`)
    };
    dialogo.querySelector('h2').textContent = t('¡Misión cumplida!', 'Mission complete!');
    area.setAttribute('aria-label', t('Despegue de un cohete y lluvia de estrellas', 'Rocket launch and falling stars'));
    cuenta.querySelector('span').textContent = t('Despegue en', 'Launch in');
    continuar.textContent = t('Continuar →', 'Continue →'); actualizarAudio();
    mensaje.hidden = true; cohete.hidden = false; cuenta.hidden = false; barra.hidden = true;
    mensaje.querySelector('h3').textContent = t('¡Felicidades!', 'Congratulations!');
    mensaje.querySelector('p').textContent = t(`${nombre}, ¡lo has hecho genial!`, `${nombre}, you did a great job!`);
    dialogo.style.zoom = String(1 / (parseFloat(getComputedStyle(document.body).zoom) || 1));
    dialogo.showModal(); ajustar(); actualizar(0, 0); pintar();
    continuar.focus({ preventScroll: true }); escena.frame = requestAnimationFrame(dibujar);
    return true;
  }
  function ajustar() {
    if (!escena) return;
    dialogo.style.zoom = String(1 / (parseFloat(getComputedStyle(document.body).zoom) || 1));
    const r = area.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
    escena.w = area.clientWidth; escena.h = area.clientHeight;
    escena.alto = Math.min(360, escena.h * .78, escena.w * .8);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    cohete.style.width = escena.alto * 160 / 300 + 'px'; cohete.style.height = escena.alto + 'px';
    colocarCohete(escena.t);
  }
  function colocarCohete(tiempo) {
    const p = Math.max(0, Math.min(1, (tiempo - 3) / 2.8));
    const base = escena.h - escena.alto * .78 - 16;
    const y = base - (base + escena.alto + 20) * p * p;
    const vibracion = escena.reducido || !p || p === 1 ? 0 : Math.sin(tiempo * 50) * 1.1;
    cohete.style.transform = `translate3d(${vibracion}px,${y}px,0)`;
    cohete.style.left = (escena.w - escena.alto * 160 / 300) / 2 + 'px';
    llama.style.opacity = p > 0 && p < 1 ? '1' : '0';
    llama.style.transform = `scaleY(${escena.reducido ? 1 : .92 + Math.sin(tiempo * 34) * .08})`;
  }
  function cambiarFase(fase) {
    if (escena.fase === fase) return;
    escena.fase = fase; dialogo.dataset.fase = fase;
    const etiquetas = {
      cuenta: t('Preparados para el despegue…', 'Ready for launch…'),
      despegue: t('¡Despegue!', 'Lift-off!'),
      estrellas: t('¡Una lluvia de estrellas para ti!', 'A shower of stars for you!'),
      felicitacion: t('¡Felicidades!', 'Congratulations!')
    };
    estado.textContent = etiquetas[fase];
    cuenta.hidden = fase !== 'cuenta'; cohete.hidden = fase === 'estrellas' || fase === 'felicitacion';
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
  function motor() {
    if (!contextoAudio() || ruidoMotor) return;
    // One noise buffer, faded at both ends. No audio nodes are created per frame.
    const buffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate), datos = buffer.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
    const s = audio.createBufferSource(), filtro = audio.createBiquadFilter(), g = audio.createGain(), ahora = audio.currentTime;
    s.buffer = buffer; s.loop = true; filtro.type = 'lowpass'; filtro.frequency.value = 600;
    s.connect(filtro).connect(g).connect(audio.destination); g.gain.setValueAtTime(.0001, ahora); g.gain.exponentialRampToValueAtTime(.045, ahora + .45); g.gain.exponentialRampToValueAtTime(.0001, ahora + 3);
    s.start(); s.stop(ahora + 3.05); ruidoMotor = s; fuentes.add(s);
    s.onended = () => { fuentes.delete(s); if (ruidoMotor === s) ruidoMotor = null; s.disconnect(); filtro.disconnect(); g.disconnect(); };
  }
  function campana() {
    if (!contextoAudio()) return;
    [660, 880, 1100].forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain(), inicio = audio.currentTime + i * .13;
      o.connect(g).connect(audio.destination); o.frequency.value = f; g.gain.setValueAtTime(.0001, inicio); g.gain.exponentialRampToValueAtTime(.035, inicio + .02); g.gain.exponentialRampToValueAtTime(.0001, inicio + .55);
      o.start(inicio); o.stop(inicio + .6); fuentes.add(o); o.onended = () => { fuentes.delete(o); o.disconnect(); g.disconnect(); };
    });
  }
  function pararAudio() { for (const f of fuentes) { try { f.stop(); } catch {} } fuentes.clear(); ruidoMotor = null; }
  function detenerLectura() { if (escena?.lectura) { window.speechSynthesis?.cancel(); escena.lectura = null; escena.leyendo = false; } }
  function cerrar(enfocar = false) {
    detenerLectura(); if (escena) cancelAnimationFrame(escena.frame); escena = null; pararAudio();
    if (dialogo) { if (dialogo.open) dialogo.close(); ctx?.clearRect(0, 0, canvas.width, canvas.height); delete dialogo.dataset.fase; }
    if (enfocar) document.getElementById('btnNew')?.focus({ preventScroll: true });
  }
  addEventListener('resize', ajustar); window.visualViewport?.addEventListener('resize', ajustar);
  document.addEventListener('fullscreenchange', ajustar);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cerrar(); });
  new MutationObserver(() => { if (escena) ajustar(); }).observe(document.body, { attributes: true, attributeFilter: ['style'] });
  window.FiestaSignos = { instalarConfiguracion, prepararConfiguracion, aplicarConfiguracion, abrir, cerrar, get activa() { return !!escena; } };
})();
