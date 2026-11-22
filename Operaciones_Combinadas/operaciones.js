(() => {
  'use strict';
  const {operaciones, signos, normalizar, ronda, mezclar} = OperacionesCombinadas;
  const nombres = {suma: 'Suma', resta: 'Resta', multiplicacion: 'Multiplicación', division: 'División'};
  const lecturas = {suma: 'más', resta: 'menos', multiplicacion: 'por', division: 'dividido entre'};
  const titulos = {respuesta: 'Respuesta corta', pareo: 'Pareo de operaciones'};
  const instrucciones = {
    respuesta: 'Completa la casilla con el teclado del juego.',
    pareo: 'Une cada operación con el número que le falta. Puedes arrastrar o tocar las dos fichas.'
  };
  Object.assign(window.TEXTOS_INGLES, {
    'Combina operaciones': 'Mix and match operations',
    'Calcula qué número va en la casilla.': 'Work out which number goes in the box.',
    'Modos de práctica': 'Practice modes',
    'Respuesta corta': 'Short answer',
    'Completa una operación a la vez con el teclado del juego.': 'Complete one calculation at a time using the game keypad.',
    'Pareo de operaciones': 'Match the operations',
    'Une cada operación con el número que la completa.': 'Match each calculation with the number that completes it.',
    '‹ Modos': '‹ Modes', '↻ Nueva ronda': '↻ New round', '⚙ Configuración': '⚙ Settings',
    'Aplicar y cerrar': 'Apply and close',
    'Escuchar ejercicio': 'Listen to the exercise',
    'Teclado numérico': 'Number keypad', 'Operaciones': 'Operations', 'Números': 'Numbers',
    '✓ Revisar': '✓ Check', 'Siguiente pregunta': 'Next question', 'Nueva ronda': 'New round',
    'Activa las operaciones que quieras practicar. Los límites se aplican a los dos números que se suman, restan, multiplican o dividen.': 'Choose which operations to practise. The limits apply to the two numbers being added, subtracted, multiplied or divided.',
    'Las restas no dan resultados negativos y las divisiones son exactas.': 'Subtraction results are non-negative and division has no remainder.',
    'Preguntas por ronda de respuesta corta': 'Short-answer questions per round',
    'Pares por ronda': 'Pairs per round',
    'Leer preguntas y comentarios automáticamente': 'Automatically read questions and feedback aloud',
    'Suma': 'Addition', 'Resta': 'Subtraction', 'Multiplicación': 'Multiplication', 'División': 'Division',
    'Practicar': 'Practise', 'Elegir números': 'Choose numbers',
    'Hasta N dígitos': 'Up to N digits', 'Rango definido': 'Custom range',
    'Cantidad de dígitos': 'Number of digits', 'Mínimo': 'Minimum', 'Máximo': 'Maximum',
    'Qué debe completar': 'What to complete',
    'El resultado': 'The result', 'Un número que falta': 'A missing operand',
    'Resultado o número que falta': 'Result or missing operand',
    'Activa al menos una operación.': 'Enable at least one operation.',
    'El máximo debe ser igual o mayor que el mínimo.': 'The maximum must be at least the minimum.',
    'El rango debe incluir al menos un número mayor que cero.': 'The range must include at least one number greater than zero.',
    'Completa la casilla con el teclado del juego.': 'Fill in the box using the game keypad.',
    'Une cada operación con el número que le falta. Puedes arrastrar o tocar las dos fichas.': 'Match each calculation with its missing number. Drag or tap the two tiles.',
    'Escribe el número que falta.': 'Enter the missing number.',
    'Comprueba la operación y vuelve a intentarlo.': 'Check the calculation and try again.',
    'Revisa las parejas marcadas y vuelve a intentarlo.': 'Check the marked pairs and try again.',
    '¡Muy bien!': 'Well done!', 'Resultado correcto': 'Correct answer', 'Respuesta por revisar': 'Answer to check',
    'espacio': 'blank', 'más': 'plus', 'menos': 'minus', 'por': 'times', 'dividido entre': 'divided by',
    'es igual a': 'equals', 'Número que falta': 'Missing number',
    'Todas las aplicaciones': 'All apps', 'Ej.: Gabriel': 'E.g. Gabriel'
  });
  const t = texto => IdiomaVoz.t(texto);
  const get = id => document.getElementById(id);
  const app = get('appOperaciones');
  const juego = get('juego');
  const ajustes = get('ajustes');
  const form = get('formAjustes');
  const salidas = get('salidas');
  const metas = get('metas');
  const lineas = get('lineas');
  const mensaje = get('mensaje');
  const entradaNumerica = TecladoEnPantalla.instalar(juego, get('teclado'));
  const efectos = new EfectosTablas(get('celebracionOperaciones'));
  const clave = 'operaciones-combinadas.v1';
  let opciones = normalizar(Matematicas.leer(clave));
  let modo, retos = [], numerosDestino = [], pregunta = 0, activo = null, gesto = null, resuelto = false;
  const enlaces = new Map();
  const colores = ['#4d57ba', '#b23b6e', '#23785c', '#9d5c1a'];

  get('ajustesOperaciones').innerHTML = operaciones.map(op => `
    <fieldset class="ajuste-operacion" data-operacion="${op}">
      <legend><span aria-hidden="true">${signos[op]}</span> <span>${nombres[op]}</span></legend>
      <label class="opcion-casilla"><input type="checkbox" class="operacion-activa"> Practicar</label>
      <div class="ajuste-detalle">
        <label>Elegir números<select class="tipo-numeros">
          <option value="digitos">Hasta N dígitos</option><option value="rango">Rango definido</option>
        </select></label>
        <label class="ajuste-digitos">Cantidad de dígitos<select class="digitos">
          <option>1</option><option>2</option><option>3</option><option>4</option>
        </select></label>
        <div class="limites">
          <label>Mínimo<input class="minimo" type="number" min="0" max="9999" required></label>
          <label>Máximo<input class="maximo" type="number" min="0" max="9999" required></label>
        </div>
        <label>Qué debe completar<select class="tipo-reto">
          <option value="resultado">El resultado</option><option value="faltante">Un número que falta</option>
          <option value="mixto">Resultado o número que falta</option>
        </select></label>
      </div>
    </fieldset>`).join('');
  const configuraciones = [...get('ajustesOperaciones').children].map(grupo => {
    const buscar = selector => grupo.querySelector(selector);
    return {
      op: grupo.dataset.operacion, activa: buscar('.operacion-activa'), detalle: buscar('.ajuste-detalle'),
      numeros: buscar('.tipo-numeros'), digitos: buscar('.digitos'), filaDigitos: buscar('.ajuste-digitos'),
      limites: buscar('.limites'), min: buscar('.minimo'), max: buscar('.maximo'), tipo: buscar('.tipo-reto')
    };
  });
  for (let i = 1; i <= 12; i++) get('preguntas').add(new Option(i, i));
  for (let i = 2; i <= 4; i++) get('pares').add(new Option(i, i));

  function mostrarCampos(c) {
    const rango = c.numeros.value === 'rango';
    c.detalle.hidden = !c.activa.checked;
    c.filaDigitos.hidden = rango;
    c.limites.hidden = !rango;
    c.min.disabled = c.max.disabled = !rango || !c.activa.checked;
    c.max.setCustomValidity('');
    configuraciones[0].activa.setCustomValidity('');
  }
  function abrirAjustes() {
    for (const c of configuraciones) {
      const op = opciones.porOperacion[c.op];
      c.activa.checked = op.activa;
      for (const campo of ['numeros', 'digitos', 'min', 'max', 'tipo']) c[campo].value = op[campo];
      mostrarCampos(c);
    }
    get('preguntas').value = opciones.preguntas;
    get('pares').value = opciones.pares;
    get('narracion').checked = opciones.narracion;
    IdiomaVoz.iniciarEdicion();
    ajustes.showModal();
  }
  function validarAjustes() {
    configuraciones[0].activa.setCustomValidity(configuraciones.some(c => c.activa.checked) ? '' :
      t('Activa al menos una operación.'));
    for (const c of configuraciones) {
      if (c.max.disabled) continue;
      const mensaje = Number(c.max.value) < Number(c.min.value) ? 'El máximo debe ser igual o mayor que el mínimo.' :
        Number(c.max.value) === 0 && (c.op === 'division' || (c.op === 'multiplicacion' && c.tipo.value !== 'resultado')) ?
          'El rango debe incluir al menos un número mayor que cero.' : '';
      c.max.setCustomValidity(t(mensaje));
    }
    return form.reportValidity();
  }
  form.addEventListener('input', evento => {
    const c = configuraciones.find(campo => campo.detalle.parentElement.contains(evento.target));
    if (c) mostrarCampos(c);
  });
  form.addEventListener('submit', evento => { if (!validarAjustes()) evento.preventDefault(); });
  ajustes.addEventListener('cancel', evento => { if (!validarAjustes()) evento.preventDefault(); });
  ajustes.addEventListener('close', () => {
    const anterior = opciones;
    opciones = normalizar({
      preguntas: get('preguntas').value, pares: get('pares').value, narracion: get('narracion').checked,
      porOperacion: Object.fromEntries(configuraciones.map(c => [c.op, {
        activa: c.activa.checked, numeros: c.numeros.value, digitos: c.digitos.value,
        min: c.min.value, max: c.max.value, tipo: c.tipo.value
      }]))
    });
    Matematicas.guardar(clave, opciones);
    IdiomaVoz.aplicarEdicion();
    const cantidad = modo === 'pareo' ? 'pares' : 'preguntas';
    if (modo && (anterior[cantidad] !== opciones[cantidad] ||
      JSON.stringify(anterior.porOperacion) !== JSON.stringify(opciones.porOperacion))) nuevaRonda();
  });

  function leerOperacion(reto) {
    const [a, b, c] = reto.numeros.map((numero, i) => i === reto.hueco ? t('espacio') : numero);
    return `${a} ${t(lecturas[reto.op])} ${b} ${t('es igual a')} ${c}`;
  }
  function ecuacion(caja, reto, editable = false) {
    caja.replaceChildren();
    reto.numeros.forEach((numero, i) => {
      if (i > 0) {
        const signo = document.createElement('span');
        signo.textContent = i === 1 ? reto.signo : '=';
        caja.append(signo);
      }
      if (i === reto.hueco && editable) {
        const campo = document.createElement('input');
        campo.id = 'numeroRespuesta';
        campo.readOnly = true;
        campo.inputMode = 'none';
        campo.dataset.campoTeclado = '';
        campo.setAttribute('aria-label', t('Número que falta'));
        campo.maxLength = Math.max(2, String(reto.respuesta).length);
        campo.style.setProperty('--cifras', campo.maxLength);
        caja.append(campo);
        entradaNumerica.seleccionar(campo);
      } else {
        const ficha = document.createElement('span');
        ficha.textContent = i === reto.hueco ? '?' : numero;
        if (i === reto.hueco) ficha.className = 'casilla-vacia';
        caja.append(ficha);
      }
    });
  }
  function rotulos() {
    get('tituloReto').textContent = t(titulos[modo]);
    get('instruccion').textContent = t(instrucciones[modo]);
    get('siguiente').textContent = t(modo === 'pareo' || pregunta === retos.length - 1 ? 'Nueva ronda' : 'Siguiente pregunta');
    if (modo === 'pareo') {
      [...salidas.children].forEach((ficha, i) => ficha.setAttribute('aria-label', leerOperacion(retos[i])));
    } else {
      get('progreso').textContent = `${pregunta + 1} / ${retos.length}`;
      get('numeroRespuesta')?.setAttribute('aria-label', t('Número que falta') + '. ' + leerOperacion(retos[pregunta]));
    }
  }
  function hablar(texto, manual = false) {
    if (manual || opciones.narracion) IdiomaVoz.hablar(texto);
  }
  function escuchar() {
    hablar(modo === 'respuesta' ? leerOperacion(retos[pregunta]) :
      activo === null ? t(instrucciones.pareo) : leerOperacion(retos[activo]), true);
  }
  function informar(texto = '', ok = false) {
    mensaje.classList.toggle('exito', ok);
    mensaje.textContent = t(texto);
    if (texto) hablar(texto);
  }
  function prepararPregunta() {
    resuelto = false;
    get('revisar').hidden = false;
    get('revisar').disabled = true;
    get('siguiente').hidden = true;
    informar();
    rotulos();
  }
  function mostrarPregunta() {
    ecuacion(get('ecuacion'), retos[pregunta], true);
    prepararPregunta();
    hablar(leerOperacion(retos[pregunta]));
  }
  function puntoFicha(ficha) {
    const rect = ficha.querySelector('.punto').getBoundingClientRect();
    return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
  }
  function trazo(a, b, color, provisional = false) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const rect = lineas.getBoundingClientRect();
    const x = a.x - rect.left, y = a.y - rect.top;
    const finX = b.x - rect.left, finY = b.y - rect.top, medio = (x + finX) / 2;
    path.setAttribute('d', `M${x} ${y} C${medio} ${y}, ${medio} ${finY}, ${finX} ${finY}`);
    path.setAttribute('stroke', color);
    if (provisional) path.classList.add('vista-previa');
    return path;
  }
  function dibujarLineas() {
    if (modo !== 'pareo' || juego.hidden) return;
    const {width, height} = lineas.getBoundingClientRect();
    if (!width || !height) return;
    lineas.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const trazos = [...enlaces].map(([i, j]) =>
      trazo(puntoFicha(salidas.children[i]), puntoFicha(metas.children[j]), colores[i]));
    if (gesto?.movido) trazos.push(trazo(puntoFicha(salidas.children[gesto.i]), gesto, colores[gesto.i], true));
    lineas.replaceChildren(...trazos);
  }
  function fichaPareo(tipo, indice, punto, contenido) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = `ficha-pareo ficha-${tipo}`;
    boton.dataset.indice = indice;
    const icono = document.createElement('span');
    icono.className = 'punto';
    icono.setAttribute('aria-hidden', 'true');
    icono.textContent = punto;
    if (tipo === 'origen') boton.append(contenido, icono);
    else boton.append(icono, contenido);
    return boton;
  }
  function mostrarPareo() {
    salidas.replaceChildren(...retos.map((reto, i) => {
      const frase = document.createElement('span');
      frase.className = 'ecuacion';
      frase.setAttribute('aria-hidden', 'true');
      ecuacion(frase, reto);
      return fichaPareo('origen', i, '🚀', frase);
    }));
    metas.replaceChildren(...numerosDestino.map((n, i) => {
      const valor = document.createElement('span');
      valor.textContent = n;
      return fichaPareo('meta', i, '🪐', valor);
    }));
    prepararPregunta();
    actualizarPareo();
    hablar(t(instrucciones.pareo));
  }
  function actualizarPareo() {
    [...salidas.children].forEach((ficha, i) => ficha.setAttribute('aria-pressed', String(i === activo)));
    const progreso = get('progreso');
    const texto = `${enlaces.size} / ${retos.length}`;
    if (progreso.textContent !== texto) progreso.textContent = texto;
    get('revisar').disabled = enlaces.size !== retos.length;
    dibujarLineas();
  }
  function seleccionar(i) {
    if (resuelto) return;
    activo = activo === i ? null : i;
    actualizarPareo();
  }
  function enlazar(i, j) {
    if (resuelto) return;
    for (const [origen, destino] of enlaces) {
      if (origen === i || destino === j) enlaces.delete(origen);
    }
    enlaces.set(i, j);
    activo = null;
    informar();
    for (const ficha of [...salidas.children, ...metas.children]) {
      ficha.classList.remove('correcta', 'incorrecta');
      ficha.removeAttribute('aria-description');
    }
    actualizarPareo();
  }
  function fichaEn(evento, selector) { return evento.target.closest(selector); }
  salidas.addEventListener('click', evento => {
    const ficha = fichaEn(evento, '.ficha-origen');
    if (ficha && evento.detail === 0) seleccionar(Number(ficha.dataset.indice));
  });
  metas.addEventListener('click', evento => {
    const ficha = fichaEn(evento, '.ficha-meta');
    if (ficha && activo !== null) enlazar(activo, Number(ficha.dataset.indice));
  });
  salidas.addEventListener('pointerdown', evento => {
    const ficha = fichaEn(evento, '.ficha-origen');
    if (!ficha || gesto || resuelto || evento.button !== 0) return;
    salidas.setPointerCapture(evento.pointerId);
    gesto = {id: evento.pointerId, i: Number(ficha.dataset.indice), inicioX: evento.clientX, inicioY: evento.clientY};
  });
  salidas.addEventListener('pointermove', evento => {
    if (gesto?.id !== evento.pointerId) return;
    const {clientX: x, clientY: y} = evento;
    if (!gesto.movido && Math.hypot(x - gesto.inicioX, y - gesto.inicioY) < 7) return;
    Object.assign(gesto, {x, y, movido: true});
    dibujarLineas();
  });
  salidas.addEventListener('pointerup', evento => {
    if (gesto?.id !== evento.pointerId) return;
    const {i, movido} = gesto;
    gesto = null;
    if (!movido) seleccionar(i);
    else {
      const meta = document.elementFromPoint(evento.clientX, evento.clientY)?.closest('.ficha-meta');
      if (meta) enlazar(i, Number(meta.dataset.indice));
      else dibujarLineas();
    }
  });
  for (const nombre of ['pointercancel', 'lostpointercapture']) salidas.addEventListener(nombre, evento => {
    if (gesto?.id !== evento.pointerId) return;
    gesto = null;
    dibujarLineas();
  });
  new ResizeObserver(dibujarLineas).observe(get('tablero'));
  get('vistaPareo').addEventListener('scroll', dibujarLineas, {passive: true});

  function celebrar(trayectorias = null) {
    resuelto = true;
    get('revisar').hidden = true;
    get('siguiente').hidden = false;
    get('siguiente').focus({preventScroll: true});
    const nombre = window.NombreCompartido?.obtener();
    const felicitacion = nombre ? (IdiomaVoz.idioma === 'en' ? `Well done, ${nombre}!` : `¡Muy bien, ${nombre}!`) : t('¡Muy bien!');
    informar(felicitacion, true);
    if (trayectorias) efectos.cohetes(trayectorias, false);
    else if (pregunta === retos.length - 1) efectos.canones(false);
  }
  function revisar() {
    if (resuelto || get('revisar').disabled) return;
    if (modo === 'respuesta') {
      const campo = get('numeroRespuesta');
      const ok = /^\d+$/.test(campo.value) && Number(campo.value) === retos[pregunta].respuesta;
      campo.setAttribute('aria-invalid', String(!ok));
      if (ok) {
        campo.disabled = true;
        celebrar();
      } else informar('Comprueba la operación y vuelve a intentarlo.');
      return;
    }
    let todoCorrecto = true;
    for (const [i, j] of enlaces) {
      const ok = retos[i].respuesta === numerosDestino[j];
      todoCorrecto &&= ok;
      for (const ficha of [salidas.children[i], metas.children[j]]) {
        ficha.classList.toggle('correcta', ok);
        ficha.classList.toggle('incorrecta', !ok);
        ficha.setAttribute('aria-description', t(ok ? 'Resultado correcto' : 'Respuesta por revisar'));
      }
    }
    if (!todoCorrecto) {
      informar('Revisa las parejas marcadas y vuelve a intentarlo.');
      return;
    }
    celebrar([...enlaces].map(([i, j]) => ({a: puntoFicha(salidas.children[i]), b: puntoFicha(metas.children[j])})));
  }
  function nuevaRonda() {
    efectos.detener();
    activo = null;
    gesto = null;
    enlaces.clear();
    pregunta = 0;
    retos = ronda(opciones, modo === 'pareo' ? opciones.pares : opciones.preguntas);
    if (modo === 'pareo') {
      numerosDestino = mezclar(retos.map(reto => reto.respuesta));
      mostrarPareo();
    } else mostrarPregunta();
  }
  function mostrarModo(vista) {
    modo = vista;
    get('modos').hidden = Boolean(vista);
    juego.hidden = !vista;
    get('respuestaCorta').hidden = vista !== 'respuesta';
    get('vistaPareo').hidden = vista !== 'pareo';
    get('nueva').hidden = get('volver').hidden = !vista;
    efectos.detener();
    window.speechSynthesis?.cancel();
    if (vista) nuevaRonda();
  }
  const historial = HistorialModos.crear(Object.keys(titulos), mostrarModo);
  get('modos').addEventListener('click', evento => {
    const boton = evento.target.closest('[data-modo]');
    if (boton) historial.ir(boton.dataset.modo);
  });
  get('nueva').addEventListener('click', nuevaRonda);
  get('volver').addEventListener('click', historial.volver);
  get('volverPlegado').addEventListener('click', historial.volver);
  new MutationObserver(() => { get('volverPlegado').hidden = !app.classList.contains('panel-lateral-oculto'); })
    .observe(app, {attributes: true, attributeFilter: ['class']});
  get('escuchar').addEventListener('click', escuchar);
  get('revisar').addEventListener('click', revisar);
  get('siguiente').addEventListener('click', () => {
    if (modo === 'pareo' || pregunta === retos.length - 1) nuevaRonda();
    else {
      pregunta++;
      mostrarPregunta();
    }
  });
  juego.addEventListener('input', evento => {
    if (evento.target.id !== 'numeroRespuesta' || resuelto) return;
    evento.target.removeAttribute('aria-invalid');
    get('revisar').disabled = !evento.target.value;
    informar();
  });
  juego.addEventListener('keydown', evento => {
    if (evento.target.id === 'numeroRespuesta' && evento.key === 'Enter') revisar();
  });
  get('abrirAjustes').addEventListener('click', abrirAjustes);
  get('inicio').addEventListener('click', evento => {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || !window.AppsFullscreen) return;
    evento.preventDefault();
    AppsFullscreen.navigate(get('inicio').href);
  });
  IdiomaVoz.instalar('#vozOperaciones', {cambioIdioma: () => { if (modo) rotulos(); }});
  Matematicas.pantalla(app, (_, zoom) => {
    const raiz = document.documentElement;
    raiz.style.setProperty('--ancho-operaciones', raiz.clientWidth / zoom + 'px');
    app.style.setProperty('--alto-util', Math.min(raiz.clientHeight, visualViewport?.height || raiz.clientHeight) / zoom + 'px');
    app.style.setProperty('--u', 1 / zoom + 'px');
    app.classList.toggle('horizontal', raiz.clientWidth > raiz.clientHeight);
    dibujarLineas();
  });
  historial.restaurar();
})();
