/* Resizable comparison panels. All pointer positions stay in viewport coordinates. */
(() => {
  function iniciar() {
    const archivo = decodeURIComponent(location.pathname).split('/').pop().toLowerCase();
    const opciones = {
      'mayor_menor.html': ['#app', '.herramientas-mayor', 'cajasMayorMenor.anchoHerramientas.v1', .25],
      'mayor_menor_igual.html': ['.app', '.herramientas-signos', 'signos.anchoHerramientas.v1', .26]
    }[archivo];
    if (!opciones) return;
    const [selector, selectorPanel, clave, inicial] = opciones;
    const app = document.querySelector(selector), panel = app?.querySelector(selectorPanel);
    if (!app || !panel) return;
    let proporcion = inicial, pendiente = 0, puntero = null;
    try { const n = Number(localStorage.getItem(clave)); if (n >= .18 && n <= .48) proporcion = n; } catch {}
    Object.assign(window.TEXTOS_INGLES ||= {}, {
      'Ajustar ancho del panel': 'Adjust panel width',
      'Arrastra para cambiar el ancho': 'Drag to change the width'
    });
    app.classList.add('panel-con-ancho-ajustable');
    const borde = document.createElement('div');
    borde.className = 'ajustar-columna ancho-panel-ajustable'; borde.tabIndex = 0;
    borde.setAttribute('role', 'separator'); borde.setAttribute('aria-orientation', 'vertical');
    borde.setAttribute('aria-label', 'Ajustar ancho del panel'); borde.title = 'Arrastra para cambiar el ancho';
    panel.id ||= 'panelHerramientasCompartido'; borde.setAttribute('aria-controls', panel.id);
    app.append(borde);
    const horizontal = () => innerWidth > innerHeight && !app.classList.contains('panel-lateral-oculto');
    const guardar = () => { try { localStorage.setItem(clave, String(proporcion)); } catch {} };
    function medidas() {
      const r = app.getBoundingClientRect(), s = getComputedStyle(app), escala = r.width / app.offsetWidth || 1;
      const izquierda = parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth) || 0;
      const derecha = parseFloat(s.paddingRight) + parseFloat(s.borderRightWidth) || 0;
      const disponible = Math.max(1, r.width - (izquierda + derecha) * escala), hueco = (parseFloat(s.columnGap) || 0) * escala;
      return { r, escala, disponible, hueco, izquierda, minimo: Math.max(.18, Math.min(.3, 180 / disponible)), maximo: .48 };
    }
    function finalizar() {
      const anterior = puntero; puntero = null;
      if (anterior !== null) { try { borde.releasePointerCapture(anterior); } catch {} }
      borde.classList.remove('arrastrando'); guardar();
    }
    function ajustar() {
      pendiente = 0;
      borde.hidden = !horizontal();
      if (borde.hidden) { if (puntero !== null) finalizar(); return; }
      const m = medidas();
      const ancho = Math.max(m.minimo, Math.min(m.maximo, proporcion)) * m.disponible / m.escala;
      const valor = ancho.toFixed(3) + 'px';
      const cambio = app.style.getPropertyValue('--ancho-panel-ajustable') !== valor;
      if (cambio) app.style.setProperty('--ancho-panel-ajustable', valor);
      const p = panel.getBoundingClientRect();
      borde.style.left = (p.right - m.r.left + m.hueco / 2) / m.escala + 'px';
      borde.style.top = (p.top - m.r.top) / m.escala + 'px';
      borde.style.height = p.height / m.escala + 'px';
      borde.style.width = 24 / m.escala + 'px';
      borde.style.setProperty('--alto-agarre-panel', Math.min(p.height * .45, innerHeight * .4) / m.escala + 'px');
      borde.style.setProperty('--unidad-agarre-panel', 1 / m.escala + 'px');
      borde.setAttribute('aria-valuemin', String(Math.round(m.minimo * 100)));
      borde.setAttribute('aria-valuemax', String(Math.round(m.maximo * 100)));
      borde.setAttribute('aria-valuenow', String(Math.round(ancho * m.escala / m.disponible * 100)));
      if (cambio) window.dispatchEvent(new Event('ancho-panel-cambiado'));
    }
    function programar() { if (!pendiente) pendiente = requestAnimationFrame(ajustar); }
    function mover(x) {
      const m = medidas();
      proporcion = Math.max(m.minimo, Math.min(m.maximo, (x - m.r.left - m.izquierda * m.escala - m.hueco / 2) / m.disponible));
      programar();
    }
    borde.addEventListener('pointerdown', e => {
      if (!horizontal() || e.button > 0 || e.isPrimary === false) return;
      e.preventDefault(); puntero = e.pointerId;
      borde.setPointerCapture(puntero); borde.classList.add('arrastrando');
    });
    borde.addEventListener('pointermove', e => { if (e.pointerId === puntero) { e.preventDefault(); mover(e.clientX); } });
    borde.addEventListener('pointerup', e => { if (e.pointerId === puntero) { mover(e.clientX); finalizar(); } });
    borde.addEventListener('pointercancel', e => { if (e.pointerId === puntero) finalizar(); });
    borde.addEventListener('lostpointercapture', () => { if (puntero !== null) finalizar(); });
    borde.addEventListener('keydown', e => {
      if (!horizontal() || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const m = medidas(), paso = e.shiftKey ? .05 : .02;
      proporcion = e.key === 'Home' ? inicial : e.key === 'End' ? m.maximo : Math.max(m.minimo, Math.min(m.maximo, proporcion + (e.key === 'ArrowRight' ? paso : -paso)));
      guardar(); programar();
    });
    borde.addEventListener('dblclick', () => { proporcion = inicial; guardar(); programar(); });
    new ResizeObserver(programar).observe(panel);
    new ResizeObserver(programar).observe(app);
    new MutationObserver(programar).observe(app, { attributes: true, attributeFilter: ['class', 'data-orientacion'] });
    new MutationObserver(programar).observe(document.body, { attributes: true, attributeFilter: ['style'] });
    addEventListener('resize', programar); window.visualViewport?.addEventListener('resize', programar);
    document.addEventListener('fullscreenchange', programar); ajustar();
  }
  if (document.readyState === 'complete') iniciar(); else document.addEventListener('DOMContentLoaded', iniciar, { once: true });
})();
