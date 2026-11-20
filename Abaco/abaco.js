(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const tablero = $('tablero');
  const clave = 'abaco.ajustes.v1';
  const pasoCuenta = 6.4;
  const recorrido = 100 - 10 * pasoCuenta;
  const titulos = {libre: 'Explora', suma: 'Aprende a sumar', resta: 'Aprende a quitar'};
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
  const guardados = Matematicas.leer(clave);
  const ajustes = {
    capacidad: guardados.capacidad === 100 ? 100 : 50,
    narracion: guardados.narracion !== false,
    mostrarDecenas: guardados.mostrarDecenas !== false
  };

  let modo = 'libre', fase = 'inicio', ejemplo, arrastre, suprimirClic;
  let filas = [];
  let cantidades = [];
  let animacion = 0;
  let temporizador;
  let enMovimiento = false;
  const total = () => cantidades.reduce((suma, cantidad) => suma + cantidad, 0);
  const limite = (n, min, max) => Math.max(min, Math.min(n, max));
  const alAzar = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const guardar = () => Matematicas.guardar(clave, ajustes);

  function construirTablero() {
    const fragmento = document.createDocumentFragment();
    tablero.style.setProperty('--filas', ajustes.capacidad / 10);
    tablero.style.setProperty('--ancho', pasoCuenta + '%');
    $('marco').dataset.cuentas = ajustes.capacidad;
    $('marco').style.setProperty('--alto-minimo-marco', (ajustes.capacidad / 10 * 17 + 32) + 'px');
    cantidades = Array(ajustes.capacidad / 10).fill(0);
    filas = cantidades.map((_, fila) => {
      const elemento = document.createElement('div');
      elemento.className = 'fila';
      elemento.setAttribute('role', 'group');
      const cuentas = Array.from({length: 10}, (_, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'cuenta ' + ((indice < 5) !== (fila % 2 === 1) ? 'azul' : 'roja');
        boton.dataset.fila = fila;
        boton.dataset.indice = indice;
        boton.tabIndex = indice === 0 ? 0 : -1;
        elemento.append(boton);
        return boton;
      });
      fragmento.append(elemento);
      return {elemento, cuentas};
    });
    tablero.replaceChildren(fragmento);
  }

  function posicion(boton, indice, progreso) {
    boton.style.left = (indice * pasoCuenta + recorrido * (1 - progreso)) + '%';
  }

  function pintarFila(fila) {
    const {elemento, cuentas} = filas[fila];
    elemento.setAttribute('aria-label', t('Fila ', 'Row ') + (fila + 1));
    cuentas.forEach((boton, indice) => {
      const activa = indice < cantidades[fila];
      posicion(boton, indice, Number(activa));
      boton.setAttribute('aria-pressed', activa);
      boton.setAttribute('aria-label', t(
        `Fila ${fila + 1}, cuenta ${indice + 1}. ${activa ? 'Quitar' : 'Añadir'}`,
        `Row ${fila + 1}, bead ${indice + 1}. ${activa ? 'Take away' : 'Add'}`
      ));
      boton.disabled = modo !== 'libre';
    });
  }

  function pintarTotal() {
    $('total').value = total();
    const decenas = Math.floor(total() / 10);
    const unidades = total() % 10;
    $('decenas').textContent = t(
      `${decenas} ${decenas === 1 ? 'decena' : 'decenas'} · ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`,
      `${decenas} ${decenas === 1 ? 'ten' : 'tens'} · ${unidades} ${unidades === 1 ? 'one' : 'ones'}`
    );
    $('decenas').hidden = !ajustes.mostrarDecenas;
  }

  function textoPaso() {
    if (modo === 'libre') {
      return t('Toca una cuenta o arrástrala a la izquierda para añadir. Llévala a la derecha para quitar.',
        'Tap a bead or drag it left to add. Move it right to take away.');
    }
    const {inicio, cambio, resultado} = ejemplo;
    if (fase === 'inicio') return t(`Vamos a empezar con ${inicio} ${inicio === 1 ? 'cuenta' : 'cuentas'}.`,
      `Let’s start with ${inicio} ${inicio === 1 ? 'bead' : 'beads'}.`);
    if (fase === 'cambio') return modo === 'suma'
      ? t(`Tenemos ${inicio}. Mueve ${cambio} ${cambio === 1 ? 'cuenta' : 'cuentas'} más hacia la izquierda.`,
        `We have ${inicio}. Move ${cambio} more ${cambio === 1 ? 'bead' : 'beads'} to the left.`)
      : t(`Tenemos ${inicio}. Devuelve ${cambio} ${cambio === 1 ? 'cuenta' : 'cuentas'} a la derecha.`,
        `We have ${inicio}. Move ${cambio} ${cambio === 1 ? 'bead' : 'beads'} back to the right.`);
    return modo === 'suma'
      ? t(`${inicio} más ${cambio} da ${resultado}. Ahora hay ${resultado} cuentas.`, `${inicio} plus ${cambio} equals ${resultado}. There are now ${resultado} beads.`)
      : t(`${inicio} menos ${cambio} da ${resultado}. ${resultado === 1 ? 'Queda 1 cuenta' : `Quedan ${resultado} cuentas`}.`,
        `${inicio} minus ${cambio} equals ${resultado}. There ${resultado === 1 ? 'is 1 bead' : `are ${resultado} beads`} left.`);
  }

  function pintarInterfaz() {
    document.querySelectorAll('[data-modo]').forEach(boton => boton.setAttribute('aria-pressed', boton.dataset.modo === modo));
    $('modoActual').textContent = titulos[modo];
    $('instruccion').textContent = textoPaso();
    $('reiniciar').hidden = modo !== 'libre';
    $('paso').hidden = $('nuevo').hidden = modo === 'libre';
    $('ensayar').hidden = modo === 'libre' || fase !== 'resultado';
    $('paso').disabled = enMovimiento;
    $('paso').firstElementChild.textContent = fase === 'inicio' ? 'Mostrar inicio'
      : fase === 'resultado' ? '↻ Repetir ejemplo' : modo === 'suma' ? 'Añadir cuentas' : 'Quitar cuentas';
    for (const id of ['reiniciar', 'nuevo', 'ensayar']) $(id).title = IdiomaVoz.t($(id).textContent);
    $('operacion').hidden = modo === 'libre';
    if (modo !== 'libre') {
      $('operacion').textContent = `${ejemplo.inicio} ${modo === 'suma' ? '+' : '−'} ${ejemplo.cambio} = ${fase === 'resultado' ? ejemplo.resultado : '?'}`;
    }
    filas.forEach((_, fila) => pintarFila(fila));
    pintarTotal();
  }

  function cambiarFila(fila, cantidad) {
    cantidades[fila] = cantidad;
    pintarFila(fila);
    pintarTotal();
  }

  function mostrarCantidad(cantidad) {
    cantidades = filas.map((_, fila) => limite(cantidad - fila * 10, 0, 10));
  }

  function detener() {
    ++animacion;
    clearTimeout(temporizador);
    window.speechSynthesis?.cancel();
    enMovimiento = false;
    finalizarArrastre();
    filas.forEach(({elemento}) => elemento.classList.remove('iluminada'));
  }

  function nuevoEjemplo() {
    detener();
    mostrarCantidad(0);
    fase = 'inicio';
    const cruzaDecena = alAzar(1, 3) !== 1;
    const base = cruzaDecena ? alAzar(1, ajustes.capacidad / 10 - 1) * 10 : alAzar(0, ajustes.capacidad / 10 - 1) * 10;
    const menor = cruzaDecena ? base - alAzar(1, 6) : base + alAzar(0, 6);
    const mayor = cruzaDecena ? base + alAzar(1, 6) : base + alAzar(Math.max(2, menor - base + 1), 10);
    const [inicio, resultado] = modo === 'suma' ? [Math.max(1, menor), mayor] : [mayor, menor];
    ejemplo = {inicio, resultado, cambio: Math.abs(resultado - inicio)};
    pintarInterfaz();
  }

  function animarHasta(objetivo, alTerminar) {
    enMovimiento = true;
    $('paso').disabled = true;
    const turno = ++animacion;
    const destino = filas.map((_, fila) => limite(objetivo - fila * 10, 0, 10));
    const cambios = destino.map((_, fila) => fila).filter(fila => destino[fila] !== cantidades[fila]);
    if (objetivo < total()) cambios.reverse();

    function avanzar(indice) {
      if (turno !== animacion) return;
      if (indice > 0) filas[cambios[indice - 1]].elemento.classList.remove('iluminada');
      if (indice === cambios.length) {
        enMovimiento = false;
        alTerminar();
        pintarInterfaz();
        return;
      }
      const fila = cambios[indice];
      filas[fila].elemento.classList.add('iluminada');
      cambiarFila(fila, destino[fila]);
      temporizador = setTimeout(() => avanzar(indice + 1), movimientoReducido.matches ? 100 : 430);
    }
    avanzar(0);
  }

  function narrar(texto, interrumpir = true) {
    if (ajustes.narracion) IdiomaVoz.hablar(texto, {interrumpir});
  }

  function actualizarFase() {
    if (enMovimiento) return;
    if (fase === 'resultado') {
      fase = 'inicio';
      tablero.classList.add('sin-transicion');
      mostrarCantidad(0);
      pintarInterfaz();
      tablero.getBoundingClientRect();
      tablero.classList.remove('sin-transicion');
    }
    narrar(textoPaso());
    if (fase === 'inicio') animarHasta(ejemplo.inicio, () => { fase = 'cambio'; });
    else animarHasta(ejemplo.resultado, () => {
      fase = 'resultado';
      narrar(textoPaso(), false);
    });
  }

  function finalizarArrastre(confirmar = false) {
    if (!arrastre) return;
    const {fila, indice, boton, puntero, progreso, movido} = arrastre;
    arrastre = null;
    filas[fila].elemento.classList.remove('arrastrando');
    if (boton.hasPointerCapture(puntero)) boton.releasePointerCapture(puntero);
    if (confirmar && movido) {
      suprimirClic = boton;
      setTimeout(() => { if (suprimirClic === boton) suprimirClic = null; }, 0);
      cambiarFila(fila, progreso >= .5 ? Math.max(cantidades[fila], indice + 1) : Math.min(cantidades[fila], indice));
    } else pintarFila(fila);
  }

  tablero.addEventListener('pointerdown', evento => {
    const boton = evento.target.closest('.cuenta');
    if (!boton || modo !== 'libre' || arrastre || !evento.isPrimary || evento.button !== 0) return;
    const {fila, indice} = boton.dataset;
    const rect = boton.getBoundingClientRect();
    evento.preventDefault();
    boton.focus({preventScroll: true});
    arrastre = {
      boton, fila: Number(fila), indice: Number(indice), puntero: evento.pointerId,
      inicioX: evento.clientX, agarre: (evento.clientX - rect.left) / rect.width,
      progreso: Number(Number(indice) < cantidades[fila]), movido: false
    };
    boton.setPointerCapture(evento.pointerId);
  });

  tablero.addEventListener('pointermove', evento => {
    if (!arrastre || evento.pointerId !== arrastre.puntero) return;
    if (!arrastre.movido && Math.abs(evento.clientX - arrastre.inicioX) < 4) return;
    arrastre.movido = true;
    const {fila, indice, agarre} = arrastre;
    const {elemento, cuentas} = filas[fila];
    const rect = elemento.getBoundingClientRect();
    const x = (evento.clientX - rect.left) / rect.width * 100;
    const progreso = limite(1 - (x - (indice + agarre) * pasoCuenta) / recorrido, 0, 1);
    arrastre.progreso = progreso;
    elemento.classList.add('arrastrando');
    cuentas.forEach((boton, i) => {
      const previo = Number(i < cantidades[fila]);
      const previoOPuntero = i < indice ? Math.max(previo, progreso) : Math.min(previo, progreso);
      posicion(boton, i, i === indice ? progreso : previoOPuntero);
    });
  });

  tablero.addEventListener('pointerup', evento => {
    if (arrastre?.puntero === evento.pointerId) finalizarArrastre(true);
  });
  for (const evento of ['pointercancel', 'lostpointercapture']) {
    tablero.addEventListener(evento, e => { if (arrastre?.puntero === e.pointerId) finalizarArrastre(); });
  }
  addEventListener('blur', () => finalizarArrastre());
  tablero.addEventListener('focusin', evento => {
    const boton = evento.target.closest('.cuenta');
    if (boton) filas[boton.dataset.fila].cuentas.forEach(cuenta => { cuenta.tabIndex = cuenta === boton ? 0 : -1; });
  });
  tablero.addEventListener('keydown', evento => {
    const boton = evento.target.closest('.cuenta');
    if (!boton || !['ArrowLeft', 'ArrowRight'].includes(evento.key)) return;
    evento.preventDefault();
    const indice = Number(boton.dataset.indice) + (evento.key === 'ArrowLeft' ? -1 : 1);
    filas[boton.dataset.fila].cuentas[limite(indice, 0, 9)].focus({preventScroll: true});
  });
  tablero.addEventListener('click', evento => {
    const boton = evento.target.closest('.cuenta');
    if (!boton || modo !== 'libre') return;
    if (boton === suprimirClic) { suprimirClic = null; return; }
    const fila = Number(boton.dataset.fila), indice = Number(boton.dataset.indice);
    cambiarFila(fila, indice < cantidades[fila] ? indice : indice + 1);
  });

  document.querySelectorAll('[data-modo]').forEach(boton => boton.addEventListener('click', () => {
    if (boton.dataset.modo === modo) return;
    detener();
    modo = boton.dataset.modo;
    if (modo === 'libre') pintarInterfaz();
    else nuevoEjemplo();
  }));
  $('ensayar').addEventListener('click', () => {
    modo = 'libre';
    detener();
    pintarInterfaz();
  });
  $('reiniciar').addEventListener('click', () => {
    detener();
    mostrarCantidad(0);
    pintarInterfaz();
  });
  $('paso').addEventListener('click', actualizarFase);
  $('nuevo').addEventListener('click', nuevoEjemplo);
  $('capacidad').value = ajustes.capacidad;
  $('capacidad').addEventListener('change', () => {
    detener();
    const previas = cantidades;
    ajustes.capacidad = Number($('capacidad').value);
    guardar();
    construirTablero();
    if (modo === 'libre') {
      cantidades = cantidades.map((_, fila) => previas[fila] ?? 0);
      pintarInterfaz();
    } else nuevoEjemplo();
  });

  $('abrirAjustes').addEventListener('click', () => {
    for (const opcion of ['narracion', 'mostrarDecenas']) $(opcion).checked = ajustes[opcion];
    IdiomaVoz.iniciarEdicion();
    $('ajustes').showModal();
  });
  $('ajustes').addEventListener('close', () => {
    for (const opcion of ['narracion', 'mostrarDecenas']) ajustes[opcion] = $(opcion).checked;
    guardar();
    IdiomaVoz.aplicarEdicion();
    pintarInterfaz();
  });

  IdiomaVoz.instalar('#vozAbaco', {cambioIdioma: pintarInterfaz});
  const app = $('appAbaco');
  Matematicas.pantalla(app, (_, zoom) => {
    const {clientWidth, clientHeight} = document.documentElement;
    const alto = Math.min(clientHeight, window.visualViewport?.height ?? clientHeight);
    app.style.setProperty('--alto-util', alto / zoom + 'px');
    app.classList.toggle('compacto', clientWidth / zoom < 300 || alto / zoom < 320);
    finalizarArrastre();
  });
  construirTablero();
  pintarInterfaz();
})();
