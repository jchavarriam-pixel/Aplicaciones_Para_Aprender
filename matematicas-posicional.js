'use strict';

Object.assign(window.TEXTOS_INGLES, {
  'Sumas y restas por valor posicional':'Place-value addition and subtraction',
  'Así jugamos':'How to play','‹ Modos':'‹ Modes','⚙ Configuración':'⚙ Settings',
  'Coloca cada cifra en su columna y revisa la operación.':'Put each digit in its column and check the calculation.',
  'Ajustes de práctica':'Practice settings','Mostrar ayuda visual':'Show visual hints',
  'Activar ayuda verbal':'Enable spoken hints','Animar préstamos y llevadas':'Animate borrowing and carrying',
  'Narrar los pasos de la animación':'Read the animation steps aloud',
  '🔊 Escuchar la ayuda':'🔊 Listen to the hint','Arrastra los dígitos y el signo 👇':'Drag the digits and sign 👇',
  '¡Lista! Ahora resuelve la operación arrastrando los números.':'Ready! Drag the digits to solve the problem.'
});

document.addEventListener('DOMContentLoaded', () => {
  const app = $('appPosicional'), menu = $('menu'), pantallaCasa = $('houseScreen');
  const pantallaPersonal = $('customScreen'), herramienta = document.createElement('aside');
  const home = document.createElement('a');
  home.href = 'index.html';
  home.className = 'casa-posicional';
  home.setAttribute('aria-label','Volver a las aplicaciones');
  home.title = 'Volver a las aplicaciones';
  home.textContent = '⌂';
  herramienta.className = 'herramientas-posicional';
  herramienta.innerHTML = '<header class="cabecera-posicional"></header><section class="guia-posicional"><h2>Así jugamos</h2><p>Coloca cada cifra en su columna y revisa la operación.</p></section>';
  const cabecera = herramienta.querySelector('header');
  const nombre = $('nameInput');
  const rotulo = document.createElement('label');
  rotulo.htmlFor = nombre.id;
  rotulo.textContent = 'Nombre del estudiante';
  cabecera.append(menu.querySelector('.title'), home, rotulo, nombre);
  menu.querySelector('.subtitle').remove();
  menu.querySelector('.name-row').remove();
  menu.querySelector('.footer').remove();
  app.prepend(herramienta);

  const acciones = document.createElement('div');
  acciones.className = 'acciones-posicional';
  acciones.innerHTML = '<button type="button" id="modosPosicional">‹ Modos</button><button type="button" id="configurarPosicional">⚙ Configuración</button><button type="button" id="nuevaOperacion">🎲 Nueva operación</button><button type="button" id="reiniciarPosicional">🔁 Reiniciar tabla</button>';
  const ayuda = document.createElement('div');
  ayuda.dataset.pistasPanel = '';
  ayuda.innerHTML = '<button type="button" id="escucharPosicional">🔊 Escuchar la ayuda</button>';
  herramienta.append(acciones, ayuda);
  const lugarAcciones = document.createComment('Controles de la actividad');
  acciones.before(lugarAcciones);
  const barraPlegada = document.createElement('div');
  barraPlegada.className = 'barra-plegada-posicional';
  app.append(barraPlegada);
  function situarAcciones() {
    const plegado = app.classList.contains('panel-lateral-oculto');
    if (plegado && acciones.parentNode !== barraPlegada) barraPlegada.append(acciones);
    if (!plegado && acciones.previousSibling !== lugarAcciones) lugarAcciones.after(acciones);
  }
  new MutationObserver(situarAcciones).observe(app,{attributes:true,attributeFilter:['class']});

  const tarjetaPersonal = pantallaPersonal.querySelector('.card');
  const tarjetaCasa = pantallaCasa.querySelector('.card');
  const mensajeCasa = $('houseMsg');
  mensajeCasa.textContent = '';
  $('houseArea').before(mensajeCasa);
  tarjetaPersonal.querySelector('.option-check').remove();
  tarjetaPersonal.querySelector('.panel-title').remove();
  tarjetaPersonal.className = 'editor-posicional';
  const marcador = $('houseScore');
  marcador.className = 'marcador-posicional';
  herramienta.querySelector('.guia-posicional').append(marcador);
  for (const pantalla of [pantallaCasa,pantallaPersonal]) pantalla.querySelector('.topbar').remove();
  tarjetaCasa.querySelector('.actions').remove();
  tarjetaCasa.querySelector('.option-check').remove();
  tarjetaCasa.remove();
  const opciones = document.createElement('dialog');
  opciones.className = 'ajustes-posicional';
  opciones.setAttribute('aria-labelledby','tituloAjustesPosicional');
  opciones.innerHTML = '<header><h2 id="tituloAjustesPosicional">Configuración</h2><button type="button" aria-label="Aplicar y cerrar">✕</button></header>';
  const practica = document.createElement('fieldset');
  practica.innerHTML = '<legend>Ajustes de práctica</legend>';
  practica.append(tarjetaCasa.querySelector('#opOptions'),tarjetaCasa.querySelector('#digitOptions'));
  practica.insertAdjacentHTML('beforeend','<label><input type="checkbox" id="cerosPosicional"> Mostrar ceros de apoyo para completar las cifras.</label>');
  const apoyos = document.createElement('fieldset');
  apoyos.innerHTML = '<legend>Ayudas</legend><label><input type="checkbox" id="visualPosicional"> Mostrar ayuda visual</label><label><input type="checkbox" id="audioPosicional"> Activar ayuda verbal</label><label><input type="checkbox" id="animacionPosicional"> Animar préstamos y llevadas</label><label><input type="checkbox" id="narracionPosicional"> Narrar los pasos de la animación</label>';
  const preferencias = document.createElement('section');
  preferencias.id = 'preferenciasPosicional';
  const cerrar = document.createElement('button');
  cerrar.type = 'button';
  cerrar.className = 'btn purple';
  cerrar.textContent = 'Aplicar y cerrar';

  const btnAbaco = document.createElement('button');
  btnAbaco.type = 'button';
  btnAbaco.className = 'boton-abaco-operaciones';
  btnAbaco.textContent = '🧮 Ábaco';
  const abaco = AbacoOperaciones.instalar(btnAbaco, () => {
    if (activeScreen === 'menu' || !current.topDigits.length) return null;
    const tarea = findTask();
    const col = tarea.done ? 0 : tarea.type === 'carry' ? tarea.col+1 : tarea.col;
    if (current.op === '+') {
      const llevada = Number(current.carrySlots[col] === 1 && expectedCarryAt(col) === 1);
      return {columna:col,signo:'+',m:current.topDigits[col],n:current.bottomDigits[col]+llevada,llevada};
    }
    const m = current.currentTop[col], n = current.bottomDigits[col];
    return {columna:col,signo:'-',m,n,prestamo:m<n};
  },'valorPosicional.abaco.v1');
  opciones.append(practica,apoyos,abaco.configuracion,preferencias,cerrar);
  document.body.append(opciones);

  const clave = 'valorPosicional.config.v1';
  const guardado = Matematicas.leer(clave);
  if ([2,3,4].includes(guardado.digits)) house.digits = guardado.digits;
  if (['+','-','mix'].includes(guardado.op)) house.opMode = guardado.op;
  $('operationInput').value = typeof guardado.operation === 'string' ? guardado.operation : '345+128';
  showLeadingZeros = guardado.zeros === true;
  audioHelpOn = guardado.audio === true;
  ayudaVisualPosicional = guardado.visual !== false;
  animarPasosPosicional = guardado.animar !== false;
  narrarPasosPosicional = guardado.narrar !== false;
  const guardar = () => Matematicas.guardar(clave,{
    digits:house.digits,op:house.opMode,operation:$('operationInput').value,zeros:showLeadingZeros,
    audio:audioHelpOn,visual:ayudaVisualPosicional,animar:animarPasosPosicional,narrar:narrarPasosPosicional
  });
  const config = () => [house.digits,house.opMode,showLeadingZeros];
  let estadoAnterior;
  function sincronizar() {
    ayuda.hidden = !audioHelpOn || activeScreen === 'menu';
    marcador.hidden = activeScreen !== 'houseScreen';
    $('modosPosicional').hidden = activeScreen === 'menu';
    $('nuevaOperacion').hidden = activeScreen !== 'houseScreen';
    $('reiniciarPosicional').hidden = activeScreen === 'menu';
    practica.querySelectorAll('[data-d]').forEach(e => e.classList.toggle('active',+e.dataset.d === house.digits));
    practica.querySelectorAll('[data-op]').forEach(e => e.classList.toggle('active',e.dataset.op === house.opMode));
  }

  $('configurarPosicional').onclick = () => {
    cancelarArrastrePosicional();
    if (PasosOperaciones.activo) rerenderActive();
    clearAudioGuide(false);
    estadoAnterior = config();
    for (const [id,valor] of [['cerosPosicional',showLeadingZeros],['visualPosicional',ayudaVisualPosicional],
      ['audioPosicional',audioHelpOn],['animacionPosicional',animarPasosPosicional],['narracionPosicional',narrarPasosPosicional]]) $(id).checked = valor;
    IdiomaVoz.iniciarEdicion();
    abaco.prepararConfiguracion();
    opciones.style.zoom = String(1/Matematicas.escala());
    opciones.showModal();
    opciones.scrollTop = 0;
  };
  cerrar.onclick = opciones.firstElementChild.querySelector('button').onclick = () => opciones.close();
  opciones.addEventListener('close', () => {
    const ceros = $('cerosPosicional').checked;
    ayudaVisualPosicional = $('visualPosicional').checked;
    audioHelpOn = $('audioPosicional').checked;
    animarPasosPosicional = $('animacionPosicional').checked;
    narrarPasosPosicional = $('narracionPosicional').checked;
    const cambioPractica = estadoAnterior[0] !== house.digits || estadoAnterior[1] !== house.opMode;
    const cambioCeros = ceros !== showLeadingZeros;
    showLeadingZeros = ceros;
    IdiomaVoz.aplicarEdicion();
    abaco.aplicarConfiguracion();
    sincronizar();
    guardar();
    if (activeScreen === 'houseScreen' && cambioPractica) newHouseProblem();
    else if (activeScreen !== 'menu') {
      if (cambioCeros) rerenderActive();
      else updateHint(getActiveContainerId());
      if (audioHelpOn) startAudioGuide(getActiveContainerId());
    }
  });

  function irModo(modo) {
    PasosOperaciones.limpiar();
    cancelarArrastrePosicional();
    clearAudioGuide(false);
    if (btnAbaco.getAttribute('aria-expanded') === 'true') btnAbaco.click();
    $('solverCustom').replaceChildren();
    $('houseArea').replaceChildren();
    showScreen(modo === 'house' ? 'houseScreen' : modo === 'custom' ? 'customScreen' : 'menu');
    sincronizar();
    if (modo === 'house') newHouseProblem();
    if (modo === 'custom') generateFromInput();
    fit();
  }
  openMode = irModo;
  goMenu = () => irModo(null);
  $('modosPosicional').onclick = goMenu;
  $('nuevaOperacion').onclick = () => newHouseProblem();
  $('reiniciarPosicional').onclick = () => {
    if (activeScreen === 'houseScreen') resetHouseOnly();
    else if (!$('solverCustom').classList.contains('hidden')) resetSolver('solverCustom');
  };
  $('escucharPosicional').onclick = () => startAudioGuide(getActiveContainerId());
  $('operationInput').addEventListener('change',guardar);
  mensajeCasa.setAttribute('role','status');

  const observador = new ResizeObserver(() => fit());
  window.PosicionalUI = {
    tablero(area) {
      const board = area.querySelector('.board');
      const reserva = document.createElement('div');
      reserva.className = 'borrow-btn-container';
      reserva.append(board.querySelector('.message'));
      const prestamo = area.querySelector('#borrowBtn');
      if (prestamo) reserva.append(prestamo);
      board.append(reserva);
      const preview = area.querySelector('.operation-preview');
      const encabezado = document.createElement('header');
      encabezado.className = 'cabecera-ejercicio-posicional';
      preview.before(encabezado);
      encabezado.append(preview,btnAbaco);
      observador.disconnect();
      observador.observe(board);
      guardar();
      fit();
    },
    animar(pasos,aplicar,prestamo = false) {
      clearAudioGuide(false);
      const area = $(getActiveContainerId());
      PasosOperaciones.mostrar(pasos,aplicar,{
        narrar:narrarPasosPosicional,prestamo,tablero:area,controles:area.querySelector('.borrow-btn-container'),
        columna:col => area.querySelector(`.digit-col[data-col="${col}"]`),
        selectorCifra:'.top-row > :is(.digit,.place-slot)'
      });
      const revisar = area.querySelector('.actions .ok');
      revisar.disabled = true;
      updateBorrowButton();
    }
  };
  const fit = Matematicas.pantalla(app,(_,z) => {
    const {clientWidth:w,clientHeight:h} = document.documentElement;
    const alto = Math.min(h,window.visualViewport?.height ?? h);
    app.style.setProperty('--alto-util',alto/z+'px');
    app.style.setProperty('--unidad',1/z+'px');
    app.classList.toggle('horizontal',w>alto);
    app.classList.toggle('compacta',w<500||alto<500);
    const board = document.querySelector('.screen.active .board');
    if (!board) return;
    const r = board.getBoundingClientRect();
    const reserva = board.querySelector('.borrow-btn-container').getBoundingClientRect().width;
    const columnas = current.digits+1;
    const celda = Math.max(15,Math.min(104,(r.width-reserva-18)/columnas,(r.height-12)/4.35));
    app.style.setProperty('--celda',celda/z+'px');
  });
  IdiomaVoz.instalar('#preferenciasPosicional',{cambioIdioma:() => {
    abaco.localizar();
    if (activeScreen !== 'menu') {
      const area = getActiveContainerId();
      rotularCasillasPosicional($(area));
      updateHint(area);
    }
  }});
  sincronizar();
  document.addEventListener('pointercancel',cancelarArrastrePosicional);
  document.addEventListener('lostpointercapture',evento => { if (drag.id === evento.pointerId) cancelarArrastrePosicional(); });
  addEventListener('resize',cancelarArrastrePosicional);
  document.addEventListener('fullscreenchange',cancelarArrastrePosicional);
});
