/* Control compartido. La solicitud se hace únicamente al pulsar el botón. */
(() => {
  'use strict';
  if (document.getElementById('control-pantalla-completa')) return;
  const root = document.documentElement;
  const appRoot = new URL('.', document.currentScript.src);
  const insideAppFrame = window.parent !== window && window.name === 'marco-pantalla-completa';
  const bar = document.createElement('div');
  bar.id = 'control-pantalla-completa';
  const message = document.createElement('span');
  message.id = 'mensaje-pantalla-completa';
  message.setAttribute('role', 'status');
  const button = document.createElement('button');
  button.id = 'boton-pantalla-completa';
  button.type = 'button';
  button.setAttribute('aria-describedby', message.id);
  const homeButton = document.createElement('button');
  homeButton.id = 'boton-inicio-aplicaciones';
  homeButton.type = 'button';
  homeButton.hidden = true;
  homeButton.title = 'Todas las aplicaciones';
  homeButton.setAttribute('aria-label', 'Todas las aplicaciones');
  homeButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-7h6v7"/></svg>';
  bar.append(message, homeButton, button);
  // Fuera de los contenedores que desplazan o transforman los ejercicios.
  document.body.append(bar);

  const currentElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  let appFrame = null;
  let framedUrl = '';
  function localAppUrl(href) {
    try {
      const url = new URL(href, location.href);
      return url.href.startsWith(appRoot.href) && /\.html?$/i.test(url.pathname) ? url : null;
    } catch { return null; }
  }
  function navigate(href) {
    const target = localAppUrl(href);
    if (!target) { location.href = href; return; }
    if (insideAppFrame || !currentElement()) { location.href = target.href; return; }
    if (!appFrame) {
      appFrame = document.createElement('iframe');
      appFrame.id = 'marco-pantalla-completa';
      appFrame.name = 'marco-pantalla-completa';
      appFrame.title = 'Aplicación educativa';
      root.append(appFrame);
    }
    framedUrl = target.href;
    appFrame.src = target.href;
  }
  window.AppsFullscreen = { navigate };
  if (insideAppFrame) {
    // El control visible pertenece a la página principal.
    bar.style.display = 'none';
    window.parent.postMessage({ type: 'apps-fullscreen-location', href: location.href }, '*');
  } else {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (event.defaultPrevented || !link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (link.target && link.target !== '_self') || link.hasAttribute('download') || link.getAttribute('href')?.startsWith('#') || !currentElement() || !localAppUrl(link.href)) return;
      event.preventDefault();
      navigate(link.href);
    });
  }
  window.addEventListener('message', event => {
    if (appFrame && event.source === appFrame.contentWindow && event.data?.type === 'apps-fullscreen-location') {
      const target = localAppUrl(event.data.href);
      if (target) framedUrl = target.href;
    }
  });
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  const supported = Boolean(request && exit &&
    document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false);
  let pending = false;
  let cornerTimer = null;
  const body = document.body;
  const lockedHeight = getComputedStyle(body).overflowY === 'hidden' ||
    getComputedStyle(root).overflowY === 'hidden';
  function fitPage() {
    const style = getComputedStyle(body);
    const marginX = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    const marginY = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    body.style.boxSizing = 'border-box';
    body.style.width = Math.max(0, innerWidth - marginX) + 'px';
    body.style.minHeight = Math.max(0, innerHeight - marginY) + 'px';
    if (lockedHeight) body.style.height = body.style.minHeight;
  }
  fitPage();
  window.addEventListener('resize', fitPage, { passive: true });

  function chooseCorner() {
    if (insideAppFrame) return;
    const halfWidth = bar.offsetWidth / 2;
    const inset = 10 + halfWidth;
    const sampleWidth = halfWidth - 5;
    const corners = [
      ['bottom-right', innerWidth - inset, innerHeight - 32],
      ['bottom-left', inset, innerHeight - 32],
      ['top-right', innerWidth - inset, 32],
      ['top-left', inset, 32]
    ];
    const controls = 'button,a,input,select,textarea,summary,[role="button"],canvas';
    const score = ([, x, y]) => {
      let occupied = 0;
      for (const dx of [-sampleWidth, -sampleWidth / 2, 0, sampleWidth / 2, sampleWidth]) for (const dy of [-16, 0, 16]) {
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
    homeButton.hidden = !active;
    bar.dataset.fullscreen = String(active);
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
    if (!currentElement() && appFrame) {
      const target = framedUrl;
      appFrame.remove(); appFrame = null; framedUrl = '';
      if (target && target !== location.href) { location.href = target; return; }
    }
    update();
    scheduleCorner();
  }
  document.addEventListener('fullscreenchange', changed);
  document.addEventListener('webkitfullscreenchange', changed);
  homeButton.addEventListener('click', () => {
    navigate(new URL('index.html', appRoot).href);
  });
  button.addEventListener('click', async () => {
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
