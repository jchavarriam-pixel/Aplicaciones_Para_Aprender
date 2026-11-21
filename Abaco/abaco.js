(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const tablero = $('tablero');
  const clave = 'abaco.ajustes.v1';
  const titulos = {libre: 'Explora', suma: 'Aprende a sumar', resta: 'Aprende a quitar'};
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
  const guardados = Matematicas.leer(clave);
  const ajustes = {
    capacidad: guardados.capacidad === 100 ? 100 : 50,
    narracion: guardados.narracion !== false,
    mostrarDecenas: guardados.mostrarDecenas !== false
  };

  let modo = 'libre', fase = 'inicio', ejemplo;
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
    $('marco').dataset.cuentas = ajustes.capacidad;
    $('marco').style.setProperty('--alto-minimo-marco', (ajustes.capacidad / 10 * 17 + 32) + 'px');
    cantidades = Array(ajustes.capacidad / 10).fill(0);
    filas = AbacoCuentas.crear(tablero, cantidades.length);
  }

  function pintarFila(fila) {
    AbacoCuentas.pintar(filas[fila], fila, cantidades[fila], t, () => modo === 'libre');
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

  const finalizarArrastre = AbacoCuentas.conectar(tablero, {
    filas: () => filas,
    cantidad: fila => cantidades[fila],
    puedeMover: () => modo === 'libre',
    pintarFila, cambiarFila
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
