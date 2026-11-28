(() => {
  'use strict';

  const selectorOrigen = '#teclado button[data-valor], button[data-ficha-signo]';
  const selectorDestino = '[data-destino-arrastre]';
  const umbral = 5;

  function instalar(app, {puedeSoltar, soltar}) {
    let arrastre = null;
    let clickDeArrastre = null;

    function iniciar(e) {
      if (arrastre || !e.isPrimary || e.button !== 0) return;
      clickDeArrastre = null;
      const origen = e.target.closest(selectorOrigen);
      if (!origen || origen.disabled) return;

      arrastre = {origen, id:e.pointerId, x:e.clientX, y:e.clientY, ficha:null, destino:null};
      try { origen.setPointerCapture(e.pointerId); } catch {}
    }

    function crearFicha(origen) {
      const cuadro = origen.getBoundingClientRect();
      const estilo = getComputedStyle(origen);
      const ficha = document.createElement('span');
      ficha.className = 'arrastre-resta-fantasma';
      ficha.setAttribute('aria-hidden','true');
      ficha.textContent = origen.textContent.trim();
      ficha.style.width = cuadro.width + 'px';
      ficha.style.height = cuadro.height + 'px';
      ficha.style.backgroundColor = estilo.backgroundColor;
      ficha.style.color = estilo.color;
      ficha.style.borderColor = estilo.borderColor;
      ficha.style.fontSize = parseFloat(estilo.fontSize) * Matematicas.escala() + 'px';
      const capa = document.fullscreenElement;
      (capa && capa !== document.documentElement ? capa : document.body).append(ficha);
      return ficha;
    }

    function destinoEn(e) {
      const destino = document.elementFromPoint(e.clientX,e.clientY)?.closest(selectorDestino);
      return destino && app.contains(destino) && puedeSoltar(arrastre.origen,destino) ? destino : null;
    }

    function mover(e) {
      if (e.pointerId !== arrastre?.id) return;
      if (!arrastre.ficha) {
        if (Math.hypot(e.clientX-arrastre.x,e.clientY-arrastre.y) < umbral) return;
        arrastre.ficha = crearFicha(arrastre.origen);
        arrastre.origen.classList.add('arrastre-resta-origen');
        app.classList.add('arrastre-resta-activo');
      }
      e.preventDefault();
      Matematicas.fantasma(arrastre.ficha,e.clientX,e.clientY);

      const destino = destinoEn(e);
      if (destino === arrastre.destino) return;
      arrastre.destino?.classList.remove('arrastre-resta-destino');
      destino?.classList.add('arrastre-resta-destino');
      arrastre.destino = destino;
    }

    function cancelar() {
      if (!arrastre) return;
      const {origen,id,ficha,destino} = arrastre;
      arrastre = null;
      if (ficha) clickDeArrastre = origen;
      ficha?.remove();
      destino?.classList.remove('arrastre-resta-destino');
      origen.classList.remove('arrastre-resta-origen');
      app.classList.remove('arrastre-resta-activo');
      if (origen.hasPointerCapture(id)) origen.releasePointerCapture(id);
    }

    function terminar(e) {
      if (e.pointerId !== arrastre?.id) return;
      const origen = arrastre.origen;
      const destino = arrastre.ficha ? destinoEn(e) : null;
      cancelar();
      if (destino) soltar(origen,destino);
    }

    function cancelarPuntero(e) {
      if (e.pointerId === arrastre?.id) cancelar();
    }

    function filtrarClick(e) {
      if (!e.detail || !clickDeArrastre || !clickDeArrastre.contains(e.target)) return;
      clickDeArrastre = null;
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    app.addEventListener('pointerdown',iniciar);
    app.addEventListener('click',filtrarClick,true);
    document.addEventListener('pointermove',mover,{passive:false});
    document.addEventListener('pointerup',terminar);
    document.addEventListener('pointercancel',cancelarPuntero);
    app.addEventListener('lostpointercapture',cancelarPuntero);
    window.addEventListener('blur',cancelar);
    document.addEventListener('fullscreenchange',cancelar);
    document.addEventListener('webkitfullscreenchange',cancelar);
    return {cancelar};
  }

  window.ArrastreResta = {instalar};
})();
