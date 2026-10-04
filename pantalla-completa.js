/* Control compartido. La solicitud se hace únicamente al pulsar el botón. */
(() => {
  'use strict';
  if (document.getElementById('control-pantalla-completa')) return;
  const root = document.documentElement;
  const bar = document.createElement('div');
  bar.id = 'control-pantalla-completa';
  const message = document.createElement('span');
  message.id = 'mensaje-pantalla-completa';
  message.setAttribute('role', 'status');
  const button = document.createElement('button');
  button.id = 'boton-pantalla-completa';
  button.type = 'button';
  button.setAttribute('aria-describedby', message.id);
  const zoomButton = document.createElement('button');
  zoomButton.type = 'button';
  zoomButton.id = 'boton-zoom-aplicacion';
  zoomButton.title = 'Ajustar zoom';
  zoomButton.setAttribute('aria-label', 'Ajustar zoom');
  zoomButton.setAttribute('aria-expanded', 'false');
  zoomButton.setAttribute('aria-controls', 'panel-zoom-aplicacion');
  zoomButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6M10 7v6"/></svg>';
  const zoomPanel = document.createElement('div');
  zoomPanel.id = 'panel-zoom-aplicacion';
  zoomPanel.hidden = true;
  zoomPanel.setAttribute('role', 'group');
  zoomPanel.setAttribute('aria-label', 'Zoom de la aplicación');
  zoomPanel.innerHTML = '<div class="zoom-cabecera"><label for="zoom-aplicacion">Zoom</label><output id="valor-zoom-aplicacion" for="zoom-aplicacion">100%</output></div>' +
    '<div class="zoom-ajuste"><button type="button" id="reducir-zoom" aria-label="Reducir zoom">−</button>' +
    '<input id="zoom-aplicacion" type="range" min="50" max="200" step="5" value="100">' +
    '<button type="button" id="aumentar-zoom" aria-label="Aumentar zoom">+</button></div>' +
    '<button type="button" id="restablecer-zoom">Restablecer a 100%</button><span id="estado-zoom" role="status"></span>';
  bar.append(message, zoomPanel, zoomButton, button);
  // Fuera de los contenedores que desplazan o transforman los ejercicios.
  document.body.append(bar);

  const currentElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  const supported = Boolean(request && exit &&
    document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false);
  let pending = false;
  let cornerTimer = null;
  const zoomKey = 'appsAprender.zoom.v1';
  const slider = zoomPanel.querySelector('input');
  const zoomValue = zoomPanel.querySelector('output');
  const zoomStatus = zoomPanel.querySelector('#estado-zoom');
  const body = document.body;
  const lockedHeight = getComputedStyle(body).overflowY === 'hidden' ||
    getComputedStyle(root).overflowY === 'hidden';
  let zoom = 100;
  function validZoom(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 50 && number <= 200 ? Math.round(number / 5) * 5 : 100;
  }
  function applyZoom(value, save = true) {
    zoom = validZoom(value);
    const scale = zoom / 100;
    body.style.zoom = String(scale);
    // Los controles mantienen su tamaño táctil y su posición, incluso a 50% o 200%.
    bar.style.zoom = String(1 / scale);
    const style = getComputedStyle(body);
    const marginX = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    const marginY = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    body.style.boxSizing = 'border-box';
    body.style.width = `${Math.max(0, innerWidth / scale - marginX)}px`;
    body.style.minHeight = `${Math.max(0, innerHeight / scale - marginY)}px`;
    if (lockedHeight) body.style.height = `${Math.max(0, innerHeight / scale - marginY)}px`;
    slider.value = String(zoom);
    slider.setAttribute('aria-valuetext', `${zoom}%`);
    zoomValue.value = `${zoom}%`;
    zoomPanel.querySelector('#reducir-zoom').disabled = zoom === 50;
    zoomPanel.querySelector('#aumentar-zoom').disabled = zoom === 200;
    if (save) {
      try { localStorage.setItem(zoomKey, String(zoom)); zoomStatus.textContent = 'Guardado en este navegador.'; }
      catch { zoomStatus.textContent = 'Zoom aplicado. El navegador no permite guardar la preferencia.'; }
      window.dispatchEvent(new Event('resize'));
    }
  }
  try { zoom = validZoom(localStorage.getItem(zoomKey)); } catch { /* Sin almacenamiento: 100%. */ }
  if (CSS.supports('zoom', '1')) applyZoom(zoom, false);
  else {
    slider.disabled = true;
    zoomPanel.querySelectorAll('button').forEach(el => { el.disabled = true; });
    zoomStatus.textContent = 'Este navegador no admite este ajuste de zoom.';
  }
  function closeZoom() {
    zoomPanel.hidden = true;
    zoomButton.setAttribute('aria-expanded', 'false');
    scheduleCorner();
  }
  zoomButton.addEventListener('click', () => {
    if (!zoomPanel.hidden) { closeZoom(); return; }
    message.textContent = '';
    zoomPanel.hidden = false;
    zoomButton.setAttribute('aria-expanded', 'true');
    slider.focus({ preventScroll: true });
  });
  slider.addEventListener('input', () => applyZoom(slider.value));
  zoomPanel.querySelector('#reducir-zoom').addEventListener('click', () => applyZoom(zoom - 5));
  zoomPanel.querySelector('#aumentar-zoom').addEventListener('click', () => applyZoom(zoom + 5));
  zoomPanel.querySelector('#restablecer-zoom').addEventListener('click', () => applyZoom(100));
  document.addEventListener('pointerdown', event => { if (!bar.contains(event.target)) closeZoom(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !zoomPanel.hidden) { closeZoom(); zoomButton.focus({ preventScroll: true }); }
  });
  window.addEventListener('resize', () => {
    if (CSS.supports('zoom', '1')) applyZoom(zoom, false);
  }, { passive: true });
  window.addEventListener('storage', event => {
    if (event.key === zoomKey && CSS.supports('zoom', '1')) {
      applyZoom(validZoom(event.newValue), false);
      window.dispatchEvent(new Event('resize'));
    }
  });

  function chooseCorner() {
    if (!zoomPanel.hidden) return;
    const inset = 57;
    const corners = [
      ['bottom-right', innerWidth - inset, innerHeight - 32],
      ['bottom-left', inset, innerHeight - 32],
      ['top-right', innerWidth - inset, 32],
      ['top-left', inset, 32]
    ];
    const controls = 'button,a,input,select,textarea,summary,[role="button"],canvas';
    const score = ([, x, y]) => {
      let occupied = 0;
      for (const dx of [-41, -20, 0, 20, 41]) for (const dy of [-16, 0, 16]) {
        const hits = document.elementsFromPoint(x + dx, y + dy);
        if (hits.some(el => !bar.contains(el) && el.closest(controls))) occupied++;
      }
      return occupied;
    };
    let best = corners[0], bestScore = score(best);
    for (const corner of corners.slice(1)) {
      if (bestScore === 0) break;
      const value = score(corner);
      if (value < bestScore) { best = corner; bestScore = value; }
    }
    bar.dataset.corner = best[0];
  }
  function scheduleCorner() {
    if (cornerTimer !== null) return;
    // Agrupa los eventos de desplazamiento para evitar trabajo continuo en tabletas.
    cornerTimer = setTimeout(() => { cornerTimer = null; chooseCorner(); }, 120);
  }
  window.addEventListener('resize', scheduleCorner, { passive: true });
  document.addEventListener('scroll', scheduleCorner, { capture: true, passive: true });
  document.addEventListener('click', event => {
    if (!bar.contains(event.target)) scheduleCorner();
  });
  window.addEventListener('load', scheduleCorner, { once: true });

  function update() {
    const active = Boolean(currentElement());
    const label = active ? 'Salir de pantalla completa' : 'Pantalla completa';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="' + (active ? 'M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5' :
        'M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5') + '"/></svg>';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(active));
    button.disabled = pending;
  }
  function changed() {
    message.textContent = '';
    update();
    scheduleCorner();
  }
  document.addEventListener('fullscreenchange', changed);
  document.addEventListener('webkitfullscreenchange', changed);
  button.addEventListener('click', async () => {
    closeZoom();
    if (pending) return;
    if (!supported) {
      message.textContent = 'Este navegador no permite activar la pantalla completa. En iPhone o iPad, puedes abrir el sitio desde «Añadir a pantalla de inicio».';
      return;
    }
    message.textContent = '';
    pending = true;
    update();
    try {
      if (currentElement()) await exit.call(document);
      else await request.call(root);
    } catch {
      message.textContent = 'No se pudo activar la pantalla completa. Intenta de nuevo o prueba otro navegador.';
    } finally {
      pending = false;
      update();
    }
  });
  update();
  chooseCorner();
})();
