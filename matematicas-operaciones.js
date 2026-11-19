'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const game = document.getElementById('gameScreen');
  const menu = document.getElementById('menuScreen');
  const title = document.getElementById('gameTitle');
  const name = document.getElementById('nameInput');
  name.removeAttribute('style');
  name.previousElementSibling.remove();
  const tools = document.createElement('aside');
  tools.className = 'herramientas-operaciones';
  tools.innerHTML = `<header class="cabecera-operaciones">
    <a class="inicio-operaciones" href="index.html" aria-label="Volver a las aplicaciones" title="Volver a las aplicaciones">⌂</a>
    <label for="nameInput">Nombre del estudiante</label>
  </header>
  <section class="guia-operaciones"><h2>Así jugamos</h2><p>Empieza por la columna de la derecha. Completa las casillas y pulsa Revisar.</p></section>`;
  app.prepend(tools);
  const header = tools.querySelector('header');
  const marca = document.createElement('div');
  marca.className = 'marca-operaciones';
  marca.innerHTML = '<img src="iconos/sumas-y-restas.webp" width="64" height="64" alt="">';
  marca.append(title);
  header.prepend(marca);
  header.append(name);

  const modos = menu.querySelector('[data-group="operation"]').closest('.mode-section');
  modos.querySelector('.mode-title').id = 'tituloModoOperaciones';
  modos.querySelector('.mode-buttons').setAttribute('role','group');
  modos.querySelector('.mode-buttons').setAttribute('aria-labelledby','tituloModoOperaciones');
  tools.append(modos);
  const botones = document.createElement('div');
  botones.className = 'acciones-operaciones';
  botones.innerHTML = '<button class="boton-ajustes-operaciones" type="button">⚙ Configuración</button>';
  const nuevo = game.querySelector('.new-game');
  nuevo.id = 'nuevaOperacion';
  nuevo.textContent = '↻ Nueva ronda';
  botones.append(nuevo, game.querySelector('.reset'));
  tools.append(botones);

  const top = game.querySelector('.top-bar');
  tools.append(top);
  const instruccion = document.createElement('h2');
  instruccion.className = 'instruccion-operaciones';
  instruccion.textContent = 'Completa la operación.';
  const hint = document.getElementById('hintBar');
  hint.setAttribute('role','status');
  game.prepend(instruccion, hint);

  const ajustes = document.createElement('dialog');
  ajustes.className = 'ajustes-operaciones';
  ajustes.setAttribute('aria-labelledby', 'tituloAjustesOperaciones');
  ajustes.innerHTML = '<header><h2 id="tituloAjustesOperaciones">Configuración</h2><button type="button" aria-label="Aplicar y cerrar">✕</button></header>';
  const cierre = ajustes.firstElementChild.querySelector('button');
  const preferencias = document.createElement('section');
  preferencias.id = 'preferenciasOperaciones';
  const aplicar = document.createElement('button');
  aplicar.type = 'button';
  aplicar.className = 'aplicar-operaciones';
  aplicar.textContent = 'Aplicar y cerrar';
  const ayudas = document.createElement('fieldset');
  ayudas.className = 'ayudas-configuracion-operaciones';
  ayudas.innerHTML = `<legend>Ayudas</legend>
    <label class="option-check"><input type="checkbox" id="ayudaVisualOperaciones"> Mostrar ayuda visual</label>
    <label class="option-check"><input type="checkbox" id="ayudaVerbalOperaciones"> Activar ayuda verbal</label>
    <label class="option-check"><input type="checkbox" id="animarPasosOperaciones"> Animar préstamos y llevadas</label>`;
  ayudas.insertBefore(game.querySelector('.audio-settings'), ayudas.lastElementChild);
  ajustes.append(menu, ayudas, document.getElementById('musicBtn'),
    FiestaSignos.instalarConfiguracion(), preferencias, aplicar);
  document.body.append(ajustes);
  menu.querySelectorAll('#levelScreen>p:last-child,[onclick="startGameValidated()"]').forEach(el => el.remove());
  game.querySelector('.footer-credit').remove();

  const clave = 'operaciones.config.v1';
  const saved = Matematicas.leer(clave);
  if ([2,3,4].includes(saved.digits)) digits = saved.digits;
  if (['solo_suma','solo_resta','mixto'].includes(saved.operationMode)) operationMode = saved.operationMode;
  if (['sin_llevada','con_llevada','mixta'].includes(saved.additionMode)) additionMode = saved.additionMode;
  if (['sin_prestamo','con_prestamo','mixta'].includes(saved.subtractionMode)) subtractionMode = saved.subtractionMode;
  if (musicModes[saved.currentMusicMode]) currentMusicMode = saved.currentMusicMode;
  helpOn = saved.helpOn === true;
  audioHelpOn = saved.audioHelpOn === true;
  animarPasos = saved.animarPasos !== false;
  allowLeadingSum = saved.allowLeadingSum === true;
  speakAudioResult = saved.speakAudioResult === true;
  for (const [grupo, valor] of [['operation',operationMode],['addition',additionMode],['subtraction',subtractionMode],['digits',digits]]) {
    for (const el of document.querySelectorAll(`[data-group="${grupo}"]`)) {
      const activa = el.getAttribute('onclick').includes(String(valor));
      el.classList.toggle('active', activa);
      el.setAttribute('aria-pressed', activa);
    }
  }
  document.getElementById('allowLeadingSumCheckbox').checked = allowLeadingSum;
  document.getElementById('speakResultCheckbox').checked = speakAudioResult;
  const ayudaVisual = document.getElementById('ayudaVisualOperaciones');
  const ayudaVerbal = document.getElementById('ayudaVerbalOperaciones');
  const mostrarPasos = document.getElementById('animarPasosOperaciones');
  ayudaVisual.checked = helpOn;
  ayudaVerbal.checked = audioHelpOn;
  mostrarPasos.checked = animarPasos;
  const musicName = musicModes[currentMusicMode];
  document.getElementById('musicBtn').textContent = '🎵 ' + musicName[0].toUpperCase() + musicName.slice(1);
  name.value ||= 'Gabriel';

  function guardar() {
    Matematicas.guardar(clave, {digits,operationMode,additionMode,subtractionMode,helpOn,audioHelpOn,animarPasos,allowLeadingSum,speakAudioResult,currentMusicMode});
  }
  const pendientes = new Set();
  let aplicando = false;
  const abrir = botones.querySelector('.boton-ajustes-operaciones');
  abrir.onclick = () => {
    if (PasosOperaciones.activo) {
      PasosOperaciones.limpiar();
      updateBorrowBtn();
      updateCheckButtonState();
    }
    cancelarArrastre();
    clearAudioGuide();
    FiestaSignos.prepararConfiguracion();
    ajustes.style.zoom = String(1 / Matematicas.escala());
    ajustes.showModal();
    ajustes.scrollTop = 0;
  };
  aplicar.onclick = cierre.onclick = () => ajustes.close();
  ajustes.addEventListener('change', e => {
    if (!ajustes.open || aplicando || !e.target.closest('#preferenciasOperaciones')) return;
    e.stopImmediatePropagation();
    pendientes.add(e.target);
  }, true);
  ajustes.addEventListener('close', () => {
    helpOn = ayudaVisual.checked;
    audioHelpOn = ayudaVerbal.checked;
    animarPasos = mostrarPasos.checked;
    FiestaSignos.aplicarConfiguracion();
    aplicando = true;
    for (const control of pendientes) control.dispatchEvent(new Event('change', {bubbles:true}));
    aplicando = false;
    pendientes.clear();
    guardar();
    initBackgroundMusic();
    newProblem();
  });
  modos.addEventListener('click', e => {
    if (!e.target.closest('[data-group="operation"]')) return;
    guardar();
    newProblem();
  });
  IdiomaVoz.instalar('#preferenciasOperaciones');
  startGameValidated();
  updateModeVisibility();
  initBackgroundMusic();

  const board = document.getElementById('board');
  const fit = Matematicas.pantalla(app, (alto, zoom) => {
    app.style.setProperty('--unidad', 1/zoom + 'px');
    app.classList.toggle('compacta', alto*zoom < 460);
    const espacio = board.getBoundingClientRect();
    const reservaPrestamo = document.getElementById('borrowBtn').parentElement.getBoundingClientRect().width;
    const columnas = digits + 1 + Number(shouldShowLeadingAnswerCell());
    const celda = Math.max(16, Math.min(118, (espacio.width - 24 - reservaPrestamo)/columnas - 5, (espacio.height - 20)/3.7));
    app.style.setProperty('--celda', celda/zoom + 'px');
  });
  new ResizeObserver(fit).observe(board);
  new MutationObserver(fit).observe(document.getElementById('colsContainer'), {childList:true});
  addEventListener('resize', cancelarArrastre);
  document.addEventListener('fullscreenchange', cancelarArrastre);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelarArrastre();
      clearAudioGuide();
    }
  });
});
