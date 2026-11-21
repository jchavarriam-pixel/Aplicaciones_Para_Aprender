/* Varillas de diez cuentas para el ábaco completo y su versión flotante. */
window.AbacoCuentas = (() => {
  'use strict';
  const paso = 6.4;
  const recorrido = 100 - 10 * paso;
  const limite = (n, min, max) => Math.max(min, Math.min(n, max));

  function crear(tablero, numeroFilas) {
    tablero.classList.add('abaco-cuentas');
    tablero.style.setProperty('--filas', numeroFilas);
    tablero.style.setProperty('--ancho', paso + '%');
    const filas = Array.from({length: numeroFilas}, (_, fila) => {
      const elemento = document.createElement('div');
      elemento.className = 'fila';
      elemento.setAttribute('role', 'group');
      const cuentas = Array.from({length: 10}, (_, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'cuenta';
        boton.dataset.fila = fila;
        boton.dataset.indice = indice;
        boton.tabIndex = indice === 0 ? 0 : -1;
        elemento.append(boton);
        return boton;
      });
      return {elemento, cuentas};
    });
    tablero.replaceChildren(...filas.map(fila => fila.elemento));
    return filas;
  }

  function posicion(boton, indice, progreso) {
    boton.style.left = (indice * paso + recorrido * (1 - progreso)) + '%';
  }

  function pintar({elemento, cuentas}, fila, cantidad, t, permite, contar = false) {
    elemento.setAttribute('aria-label', t('Fila ', 'Row ') + (fila + 1));
    cuentas.forEach((boton, indice) => {
      const activa = indice < cantidad;
      posicion(boton, indice, Number(activa));
      boton.setAttribute('aria-pressed', activa);
      const accion = contar ? t('Contar', 'Count') : activa ? t('Quitar', 'Take away') : t('Añadir', 'Add');
      boton.setAttribute('aria-label', t(`Fila ${fila + 1}, cuenta ${indice + 1}.`, `Row ${fila + 1}, bead ${indice + 1}.`) + ' ' + accion);
      boton.disabled = !permite(indice);
    });
    if (!cuentas.some(boton => !boton.disabled && boton.tabIndex === 0)) {
      cuentas.forEach(boton => { boton.tabIndex = -1; });
      const disponible = cuentas.find(boton => !boton.disabled);
      if (disponible) disponible.tabIndex = 0;
    }
  }

  function conectar(tablero, {filas, cantidad, puedeMover, pintarFila, cambiarFila, alTocar}) {
    let arrastre, suprimirClic;

    function finalizar(confirmar = false) {
      if (!arrastre) return;
      const {fila, indice, boton, puntero, progreso, movido} = arrastre;
      arrastre = null;
      filas()[fila].elemento.classList.remove('arrastrando');
      if (boton.hasPointerCapture(puntero)) boton.releasePointerCapture(puntero);
      if (confirmar && movido) {
        suprimirClic = boton;
        setTimeout(() => { if (suprimirClic === boton) suprimirClic = null; }, 0);
        cambiarFila(fila, progreso >= .5 ? Math.max(cantidad(fila), indice + 1) : Math.min(cantidad(fila), indice));
      } else pintarFila(fila);
    }

    tablero.addEventListener('pointerdown', evento => {
      const boton = evento.target.closest('.cuenta');
      if (!boton || boton.disabled || arrastre || !evento.isPrimary || evento.button !== 0) return;
      const fila = Number(boton.dataset.fila), indice = Number(boton.dataset.indice);
      if (!puedeMover(fila)) return;
      const rect = boton.getBoundingClientRect();
      if (!rect.width) return;
      evento.preventDefault();
      boton.focus({preventScroll: true});
      arrastre = {boton, fila, indice, puntero: evento.pointerId, inicioX: evento.clientX,
        agarre: (evento.clientX - rect.left) / rect.width, progreso: Number(indice < cantidad(fila)), movido: false};
      boton.setPointerCapture(evento.pointerId);
    });
    tablero.addEventListener('pointermove', evento => {
      if (!arrastre || evento.pointerId !== arrastre.puntero) return;
      if (!arrastre.movido && Math.abs(evento.clientX - arrastre.inicioX) < 4) return;
      arrastre.movido = true;
      const {fila, indice, agarre} = arrastre;
      const {elemento, cuentas} = filas()[fila];
      const rect = elemento.getBoundingClientRect();
      const x = (evento.clientX - rect.left) / rect.width * 100;
      const progreso = limite(1 - (x - (indice + agarre) * paso) / recorrido, 0, 1);
      arrastre.progreso = progreso;
      elemento.classList.add('arrastrando');
      cuentas.forEach((boton, i) => {
        const previo = Number(i < cantidad(fila));
        const vecino = i < indice ? Math.max(previo, progreso) : Math.min(previo, progreso);
        posicion(boton, i, i === indice ? progreso : vecino);
      });
    });
    tablero.addEventListener('pointerup', evento => {
      if (arrastre?.puntero === evento.pointerId) finalizar(true);
    });
    for (const evento of ['pointercancel', 'lostpointercapture']) {
      tablero.addEventListener(evento, e => { if (arrastre?.puntero === e.pointerId) finalizar(); });
    }
    addEventListener('blur', () => finalizar());
    tablero.addEventListener('focusin', evento => {
      const boton = evento.target.closest('.cuenta');
      if (boton) filas()[boton.dataset.fila].cuentas.forEach(cuenta => { cuenta.tabIndex = cuenta === boton ? 0 : -1; });
    });
    tablero.addEventListener('keydown', evento => {
      const boton = evento.target.closest('.cuenta');
      if (!boton || !['ArrowLeft', 'ArrowRight'].includes(evento.key)) return;
      evento.preventDefault();
      const fila = filas()[boton.dataset.fila].cuentas;
      const direccion = evento.key === 'ArrowLeft' ? -1 : 1;
      for (let i = Number(boton.dataset.indice) + direccion; i >= 0 && i < fila.length; i += direccion) {
        if (!fila[i].disabled) { fila[i].focus({preventScroll: true}); break; }
      }
    });
    tablero.addEventListener('click', evento => {
      const boton = evento.target.closest('.cuenta');
      if (!boton || boton.disabled) return;
      if (boton === suprimirClic) { suprimirClic = null; return; }
      const fila = Number(boton.dataset.fila), indice = Number(boton.dataset.indice);
      if (alTocar?.(fila, indice) || !puedeMover(fila)) return;
      cambiarFila(fila, indice < cantidad(fila) ? indice : indice + 1);
    });
    return () => finalizar();
  }

  return {crear, pintar, conectar};
})();
