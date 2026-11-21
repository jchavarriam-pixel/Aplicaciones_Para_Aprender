(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const tablero = $('tablero');
  const clave = 'abaco.ajustes.v1';
  const titulos = {libre: 'Explora', suma: 'Aprende a sumar', resta: 'Aprende a quitar', practica: 'Preguntas y respuestas'};
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
  const guardados = Matematicas.leer(clave);
  const ajustes = {
    capacidad: guardados.capacidad === 100 ? 100 : 50,
    narracion: guardados.narracion !== false,
    mostrarDecenas: guardados.mostrarDecenas !== false,
    tipoPractica: ['suma','resta','mixta'].includes(guardados.tipoPractica) ? guardados.tipoPractica : 'mixta'
  };

  let modo = null, fase = 'inicio', ejemplo, pregunta, respuesta = '', lluvia;
  let filas = [];
  let cantidades = [];
  let animacion = 0;
  let temporizador;
  let enMovimiento = false;
  const total = () => cantidades.reduce((suma, cantidad) => suma + cantidad, 0);
  const limite = (n, min, max) => Math.max(min, Math.min(n, max));
  const alAzar = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const guardar = () => Matematicas.guardar(clave, ajustes);
  const puedeMover = () => modo === 'libre' || (modo === 'practica' && respuesta !== 'correcta');

  function construirTablero() {
    $('marco').dataset.cuentas = ajustes.capacidad;
    $('marco').style.setProperty('--alto-minimo-marco', (ajustes.capacidad / 10 * 17 + 32) + 'px');
    cantidades = Array(ajustes.capacidad / 10).fill(0);
    filas = AbacoCuentas.crear(tablero, cantidades.length);
  }

  function pintarFila(fila) {
    AbacoCuentas.pintar(filas[fila], fila, cantidades[fila], t, puedeMover);
  }

  function pintarTotal() {
    $('total').value = total();
    const decenas = Math.floor(total() / 10);
    const unidades = total() % 10;
    $('decenas').textContent = t(
      `${decenas} ${decenas === 1 ? 'decena' : 'decenas'} · ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`,
      `${decenas} ${decenas === 1 ? 'ten' : 'tens'} · ${unidades} ${unidades === 1 ? 'one' : 'ones'}`
    );
    $('decenas').hidden = !ajustes.mostrarDecenas || modo === 'practica';
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
    $('modosAbaco').hidden = !!modo;
    $('juegoAbaco').hidden = !modo;
    if (!modo) return;
    const practica = modo === 'practica';
    const demostracion = modo === 'suma' || modo === 'resta';
    $('modoActual').textContent = titulos[modo];
    $('marcadorAbaco').hidden = practica;
    $('respuestaPractica').hidden = !practica;
    if (!practica) $('instruccion').textContent = textoPaso();
    $('reiniciar').hidden = modo !== 'libre';
    $('paso').hidden = $('nuevo').hidden = !demostracion;
    $('ensayar').hidden = !demostracion || fase !== 'resultado';
    $('paso').disabled = enMovimiento;
    $('paso').firstElementChild.textContent = fase === 'inicio' ? 'Mostrar inicio'
      : fase === 'resultado' ? '↻ Repetir ejemplo' : modo === 'suma' ? 'Añadir cuentas' : 'Quitar cuentas';
    for (const id of ['reiniciar', 'nuevo', 'ensayar']) $(id).title = IdiomaVoz.t($(id).textContent);
    $('operacion').hidden = modo === 'libre';
    if (demostracion) {
      $('operacion').textContent = `${ejemplo.inicio} ${modo === 'suma' ? '+' : '−'} ${ejemplo.cambio} = ${fase === 'resultado' ? ejemplo.resultado : '?'}`;
    }
    if (practica) pintarPregunta();
    filas.forEach((_, fila) => pintarFila(fila));
    pintarTotal();
  }

  function cambiarFila(fila, cantidad) {
    cantidades[fila] = cantidad;
    pintarFila(fila);
    pintarTotal();
    if (modo === 'practica' && respuesta === 'tablero') {
      respuesta = '';
      pintarPregunta();
    }
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
    cancelarCaida();
    $('marco').classList.remove('cuentas-caidas');
    filas.forEach(({elemento}) => elemento.classList.remove('iluminada'));
  }

  function instruccionPractica() {
    const {inicio,cambio,operacion,resultado} = pregunta;
    if (respuesta === 'correcta') {
      const nombre = $('nombre').value.trim();
      return nombre ? t(`¡Muy bien, ${nombre}! El resultado es ${resultado}.`, `Well done, ${nombre}! The answer is ${resultado}.`)
        : t(`¡Muy bien! El resultado es ${resultado}.`, `Well done! The answer is ${resultado}.`);
    }
    if (respuesta === 'respuesta') return t('Vuelve a contar y corrige tu respuesta.', 'Count again and correct your answer.');
    if (respuesta === 'tablero') return t('Revisa las cuentas a la izquierda. Deben mostrar tu resultado.', 'Check the beads on the left. They should show your answer.');
    return operacion === 'suma'
      ? t(`Empieza con ${inicio}. Agrega ${cambio} cuentas y escribe el total.`, `Start with ${inicio}. Add ${cambio} beads and enter the total.`)
      : t(`Empieza con ${inicio}. Quita ${cambio} cuentas y escribe cuántas quedan.`, `Start with ${inicio}. Take away ${cambio} beads and enter how many are left.`);
  }

  function pintarPregunta() {
    const {inicio,cambio,operacion,resultado} = pregunta;
    const correcta = respuesta === 'correcta';
    $('operacion').textContent = `${inicio} ${operacion === 'suma' ? '+' : '−'} ${cambio} = ${correcta ? resultado : '?'}`;
    $('instruccion').textContent = instruccionPractica();
    $('resultadoPractica').disabled = correcta;
    $('tecladoAbaco').hidden = correcta;
    if (respuesta === 'respuesta') $('resultadoPractica').setAttribute('aria-invalid','true');
    else $('resultadoPractica').removeAttribute('aria-invalid');
    $('revisarPractica').hidden = correcta;
    $('siguientePractica').hidden = !correcta;
  }

  function nuevaPregunta() {
    detener();
    const operacion = ajustes.tipoPractica === 'mixta'
      ? (pregunta ? pregunta.operacion === 'suma' ? 'resta' : 'suma' : alAzar(0,1) ? 'suma' : 'resta')
      : ajustes.tipoPractica;
    const suma = operacion === 'suma';
    const inicio = alAzar(1,ajustes.capacidad-Number(suma));
    const cambio = alAzar(1,Math.min(20,suma ? ajustes.capacidad-inicio : inicio));
    pregunta = {operacion,inicio,cambio,resultado:inicio+(suma ? cambio : -cambio)};
    respuesta = '';
    $('resultadoPractica').value = '';
    mostrarCantidad(inicio);
    pintarInterfaz();
    narrar(instruccionPractica());
  }

  function revisarPregunta(evento) {
    evento.preventDefault();
    if (respuesta === 'correcta') return;
    const escrito = $('resultadoPractica').value;
    respuesta = total() !== pregunta.resultado ? 'tablero'
      : !/^\d+$/.test(escrito) || Number(escrito) !== pregunta.resultado ? 'respuesta' : 'correcta';
    const texto = instruccionPractica();
    pintarInterfaz();
    narrar(texto);
    if (respuesta === 'correcta') {
      celebrarCaida();
      $('siguientePractica').focus({preventScroll:true});
    }
  }

  function cancelarCaida() {
    lluvia?.remove();
    lluvia = null;
  }

  function celebrarCaida() {
    if (movimientoReducido.matches) return;
    const pantalla = document.createElement('div');
    pantalla.className = 'caida-abaco';
    pantalla.setAttribute('aria-hidden','true');
    pantalla.style.zoom = String(1/Matematicas.escala());
    const origen = filas.flatMap(({cuentas}) => cuentas.map(cuenta => ({
      rect: cuenta.getBoundingClientRect(),
      fondo: getComputedStyle(cuenta).backgroundImage,
      borde: getComputedStyle(cuenta).borderColor
    })));
    const fichas = origen.map(({rect,fondo,borde}) => {
      const ficha = document.createElement('span');
      Object.assign(ficha.style,{
        left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',
        backgroundImage:fondo,borderColor:borde
      });
      return ficha;
    });
    pantalla.append(...fichas);
    document.body.append(pantalla);
    lluvia = pantalla;
    $('marco').classList.add('cuentas-caidas');
    fichas.forEach((ficha,i) => {
      const final = innerHeight-origen[i].rect.top+60;
      const x = alAzar(-45,45), giro = alAzar(-240,240);
      ficha.animate([{transform:'none'},{transform:`translate(${x}px,${final}px) rotate(${giro}deg)`}],
        {duration:alAzar(660,900),delay:alAzar(0,200),easing:'cubic-bezier(.56,.03,.9,.58)',fill:'forwards'});
    });
    setTimeout(() => { if (lluvia === pantalla) cancelarCaida(); },1150);
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
    puedeMover,
    pintarFila, cambiarFila
  });

  function mostrarModo(vista) {
    detener();
    if (!vista) {
      const anterior = modo;
      modo = null;
      if ($('ajustes').open) $('ajustes').close();
      pintarInterfaz();
      document.querySelector(`[data-modo="${anterior}"]`)?.focus({preventScroll:true});
      return;
    }
    modo = vista;
    if (modo === 'libre') {
      mostrarCantidad(0);
      pintarInterfaz();
    } else if (modo === 'practica') {
      pregunta = null;
      nuevaPregunta();
    }
    else nuevoEjemplo();
  }
  const historial = HistorialModos.crear(Object.keys(titulos), mostrarModo);
  document.querySelectorAll('[data-modo]').forEach(boton => boton.addEventListener('click', () => historial.ir(boton.dataset.modo)));
  $('volverModosAbaco').addEventListener('click', historial.volver);
  TecladoEnPantalla.instalar($('respuestaPractica'), $('tecladoAbaco'));
  $('respuestaPractica').addEventListener('submit',revisarPregunta);
  $('siguientePractica').addEventListener('click',nuevaPregunta);
  $('resultadoPractica').addEventListener('input',evento => {
    evento.target.value = evento.target.value.replace(/\D/g,'').slice(0,3);
    if (respuesta === 'respuesta') {
      respuesta = '';
      pintarPregunta();
    }
  });
  $('ensayar').addEventListener('click', () => {
    historial.registrar('libre');
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
    } else if (modo === 'practica') nuevaPregunta();
    else if (modo) nuevoEjemplo();
  });

  $('abrirAjustes').addEventListener('click', () => {
    for (const opcion of ['narracion', 'mostrarDecenas']) $(opcion).checked = ajustes[opcion];
    $('tipoPractica').value = ajustes.tipoPractica;
    IdiomaVoz.iniciarEdicion();
    $('ajustes').style.zoom = String(1/Matematicas.escala());
    $('ajustes').showModal();
  });
  $('ajustes').addEventListener('close', () => {
    for (const opcion of ['narracion', 'mostrarDecenas']) ajustes[opcion] = $(opcion).checked;
    const tipo = $('tipoPractica').value;
    const nuevaPractica = modo === 'practica' && tipo !== ajustes.tipoPractica;
    ajustes.tipoPractica = tipo;
    guardar();
    IdiomaVoz.aplicarEdicion();
    if (nuevaPractica) nuevaPregunta();
    else pintarInterfaz();
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
  historial.restaurar();
})();
