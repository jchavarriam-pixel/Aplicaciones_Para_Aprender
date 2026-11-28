
(() => {
  'use strict';

  // Añadir 10 aquí y 1 al sustraendo de la izquierda conserva la diferencia.
  function calcularColumnas(minuendo, sustraendo) {
    const columnas = [];
    let compensacion = 0;
    do {
      const arriba = minuendo % 10;
      const abajo = sustraendo % 10;
      const quitar = abajo + compensacion;
      const presta = arriba < quitar;
      columnas.push({arriba, abajo, quitar, presta, resultado: arriba + (presta ? 10 : 0) - quitar});
      compensacion = Number(presta);
      minuendo = Math.floor(minuendo / 10);
      sustraendo = Math.floor(sustraendo / 10);
    } while (minuendo || sustraendo);
    return columnas;
  }

  const get = id => document.getElementById(id);
  const app = get('appRestaPrestamo');
  const dialogo = get('configuracion');
  const operacion = get('operacion');
  const efectos = get('efectos');
  const teclado = get('teclado');
  const nuevaRonda = get('nueva');
  const pieAcciones = nuevaRonda.parentElement;
  const herramientasPaso = get('escuchar').parentElement;
  const vistaBreve = matchMedia('(orientation:portrait) and (max-height:550px)');
  const clave = 'resta-prestamo-abajo.v1';
  const opciones = ['siemprePrestamo','colocarSigno','guia','animacion','narracion','decirResultado','narrarPrestamo','sonidoSorpresas'];
  const tamanosActividad = [85,100,115,130];
  const guardado = Matematicas.leer(clave);
  const config = {
    tamanoActividad:tamanosActividad.includes(guardado.tamanoActividad) ? guardado.tamanoActividad : 100,
    cifras:[2,3,4,5,6].includes(guardado.cifras) ? guardado.cifras : 2,
    siemprePrestamo:guardado.siemprePrestamo !== false,
    colocarSigno:guardado.colocarSigno === true,
    guia:guardado.guia !== false,
    animacion:guardado.animacion !== false,
    narracion:guardado.narracion === true,
    decirResultado:guardado.decirResultado === true,
    narrarPrestamo:guardado.narrarPrestamo ?? (guardado.narracion !== false),
    sonidoSorpresas:guardado.sonidoSorpresas !== false
  };
  const posiciones = [
    ['U','Unidades','O','Ones'], ['D','Decenas','T','Tens'], ['C','Centenas','H','Hundreds'],
    ['UM','Unidades de millar','Th','Thousands'], ['DM','Decenas de millar','TTh','Ten thousands'],
    ['CM','Centenas de millar','HTh','Hundred thousands']
  ];
  const en = (es, english) => IdiomaVoz.idioma === 'en' ? english : es;
  const nombrePosicion = indice => en(posiciones[indice][1], posiciones[indice][3]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let ronda, ultimo, columna, prestados, respuestas, fase, aviso, revision;
  let casillas = [], vuelo, casillaSigno, signoColocado, firmaAbaco;
  let realces = [], finRealce;

  const actual = () => ronda.columnas[columna];
  const listo = () => columna >= ronda.columnas.length;
  const completa = () => respuestas.every(digito => digito !== null);
  const resuelta = () => revision?.every(Boolean) === true;
  const conGuia = () => config.guia;
  const faltaSigno = () => config.colocarSigno && !signoColocado;
  const valorSuperior = () => actual().arriba + (prestados.has(columna) ? 10 : 0);

  function obtenerColumnaAbaco() {
    return !ronda || listo() || faltaSigno() ? null :
      {columna,m:valorSuperior(),n:actual().quitar,pendientePrestamo:faltaPrestamo()};
  }

  function informarAbaco(nuevaRonda) {
    const firma = JSON.stringify(obtenerColumnaAbaco());
    if (!nuevaRonda && firma === firmaAbaco) return;
    firmaAbaco = firma;
    document.dispatchEvent(new CustomEvent('operacion-cambiada',{detail:{nuevaRonda}}));
  }

  const faltaPrestamo = (i = columna) => ronda.columnas[i]?.presta === true && !prestados.has(i);

  function generar() {
    const minimo = 10 ** (config.cifras - 1);
    for (let intento = 0; intento < 40; intento++) {
      const a = minimo + Math.floor(Math.random() * minimo * 9);
      const b = 1 + Math.floor(Math.random() * a);
      if (a === ultimo?.a && b === ultimo.b) continue;
      const columnas = calcularColumnas(a,b);
      if (!config.siemprePrestamo || columnas.some(c => c.presta)) return {a,b,columnas};
    }
    const b = ultimo?.a === minimo && ultimo.b === 1 ? 2 : 1;
    return {a:minimo,b,columnas:calcularColumnas(minimo,b)};
  }

  function iniciar(ejemplo = false) {
    const nueva = ejemplo ? {a:45,b:28,columnas:calcularColumnas(45,28)} : generar();
    ronda = {...nueva,ejemplo};
    if (!ejemplo) ultimo = nueva;
    arrastre.cancelar();
    vuelo?.cancel();
    huevos.limpiar();
    efectos.replaceChildren();
    window.speechSynthesis?.cancel();
    columna = 0;
    respuestas = Array(ronda.columnas.length).fill(null);
    revision = null;
    prestados = new Set();
    fase = null;
    aviso = null;
    signoColocado = false;
    construirOperacion();
    render(true);
    leer();
  }

  function felicitar() {
    const nombre = window.NombreCompartido?.obtener();
    return nombre ? en(`¡Lo lograste, ${nombre}!`, `You did it, ${nombre}!`) : en('¡Lo lograste!', 'You did it!');
  }

  function explicarPrestamo() {
    const de = nombrePosicion(columna).toLowerCase();
    const hacia = nombrePosicion(columna+1).toLowerCase();
    const {arriba} = actual();
    const {abajo} = ronda.columnas[columna+1];
    return en(
      `Suma 10 arriba en ${de}. ${arriba} pasa a ${arriba + 10}. Para compensar, suma 1 abajo en ${hacia}. ${abajo} pasa a ${abajo + 1}.`,
      `Add 10 to the top of the ${de} column. ${arriba} becomes ${arriba + 10}. To keep the difference the same, add 1 to the bottom of the ${hacia} column. ${abajo} becomes ${abajo + 1}.`);
  }

  function textoPaso() {
    if (resuelta()) return felicitar();
    if (listo()) return revision ?
      en('Toca una cifra con error para corregirla.', 'Tap an incorrect digit to correct it.') :
      en('Pulsa Revisar para comprobar toda la resta.', 'Tap Check to review the whole subtraction.');
    if (faltaSigno()) return en('Coloca el signo menos en su casilla.', 'Place the minus sign in its box.');
    const {arriba,quitar} = actual();
    if (fase === 'aumentar') return en('Suma 10 arriba en la columna activa.', 'Add 10 at the top of the active column.');
    if (fase === 'compensar') return en('Suma 1 abajo en la columna de la izquierda.', 'Add 1 at the bottom of the column on the left.');
    if (aviso?.instruccion) return aviso.texto;
    if (!conGuia()) return en('Arrastra el resultado a esta columna.', 'Drag the answer to this column.');
    if (faltaPrestamo()) return en(
      `${arriba} es menor que ${quitar}. Pulsa Pedir prestado.`,
      `${arriba} is smaller than ${quitar}. Tap Borrow.`);
    const superior = arriba + (prestados.has(columna) ? 10 : 0);
    return en(`¿Cuánto es ${superior} menos ${quitar}?`, `What is ${superior} minus ${quitar}?`);
  }

  function limpiarRealce() {
    clearTimeout(finRealce);
    for (const [elemento,clase] of realces) elemento.classList.remove(clase);
    realces = [];
  }

  function resaltarAyuda() {
    const casilla = casillas[columna];
    const vigente = operando => operando.caja.classList.contains('ajustado') ? operando.numero : operando.caja;
    realces = [
      [casillaSigno,'ayuda-lectura'],
      [casilla.grupo,'ayuda-lectura'],
      [casilla.respuesta.caja,'ayuda-lectura'],
      [vigente(casilla.arriba),'audio-operando-superior'],
      [vigente(casilla.abajo),'audio-operando-inferior']
    ];
    for (const [elemento,clase] of realces) elemento.classList.add(clase);
    finRealce = setTimeout(limpiarRealce,3800);
  }

  function leer(manual = false, texto = null) {
    limpiarRealce();
    if (!manual && !config.narracion) return;
    if (texto || fase || listo() || faltaSigno() || aviso?.instruccion) {
      IdiomaVoz.hablar(texto || (fase ? explicarPrestamo() : textoPaso()));
      return;
    }
    const m = valorSuperior(), n = actual().quitar;
    const base = en(`Tengo ${m} y le quito ${n}.`, `I have ${m} and take away ${n}.`);
    const paso = faltaPrestamo() ?
      en(` A ${m} no se le puede quitar ${n}. Debes pedir prestado.`, ` You cannot take ${n} away from ${m}. You need to borrow.`) :
      config.decirResultado ? en(` El resultado es ${m-n}.`, ` The answer is ${m-n}.`) : '';
    if (conGuia()) resaltarAyuda();
    IdiomaVoz.hablar(base + paso);
  }

  function crearCelda(tipo) {
    const esRespuesta = tipo === 'respuesta';
    const caja = document.createElement(esRespuesta ? 'button' : 'div');
    const numero = document.createElement('span');
    caja.className = 'digito ' + tipo;
    if (esRespuesta) caja.type = 'button';
    else caja.setAttribute('role','img');
    numero.className = 'numero';
    caja.append(numero);
    const original = tipo === 'respuesta' ? null : document.createElement('s');
    if (original) {
      original.className = 'numero-original';
      original.setAttribute('aria-hidden','true');
      caja.append(original);
    }
    return {caja,numero,original};
  }

  function actualizarCelda(celda, valor, etiqueta) {
    celda.numero.textContent = valor;
    celda.caja.setAttribute('aria-label',etiqueta);
  }

  function actualizarOperando(celda, original, valor, etiqueta) {
    const ajustado = original !== valor;
    const lectura = ajustado ?
      en(`${original} tachado, ahora ${valor}`, `${original} crossed out, now ${valor}`) : valor;
    actualizarCelda(celda,valor,`${etiqueta}: ${lectura}`);
    celda.original.textContent = ajustado ? original : '';
    celda.original.hidden = !ajustado;
    celda.caja.classList.toggle('ajustado',ajustado);
  }

  function construirOperacion() {
    const signos = document.createElement('div');
    signos.className = 'signos';
    signos.innerHTML = '<span class="casilla-signo" data-destino-arrastre="signo" role="img" data-no-traducir><span class="trazo-menos" aria-hidden="true"></span></span><span class="raya" aria-hidden="true"></span>';
    casillaSigno = signos.querySelector('.casilla-signo');
    operacion.replaceChildren(signos);
    operacion.style.setProperty('--cantidad',ronda.columnas.length);
    casillas = ronda.columnas.map((_,i) => {
      const grupo = document.createElement('div');
      grupo.className = 'columna';
      grupo.dataset.columna = i;
      const rotulo = document.createElement('span');
      rotulo.className = 'rotulo';
      const arriba = crearCelda('arriba');
      const abajo = crearCelda('abajo');
      const respuesta = crearCelda('respuesta');
      respuesta.caja.dataset.destinoArrastre = 'respuesta';
      vincularAccion(respuesta.caja,() => elegirColumna(i));
      const raya = document.createElement('div');
      raya.className = 'raya';
      grupo.append(rotulo,arriba.caja,abajo.caja,raya,respuesta.caja);
      signos.after(grupo);
      return {grupo,rotulo,arriba,abajo,respuesta};
    });
  }

  function renderOperacion() {
    ronda.columnas.forEach((c,i) => {
      const casilla = casillas[i];
      const posicion = nombrePosicion(i);
      const activa = i === columna;
      const prestado = prestados.has(i) || (activa && fase === 'compensar');
      const devuelto = prestados.has(i-1);
      const arriba = c.arriba + (prestado ? 10 : 0);
      const abajo = c.abajo + Number(devuelto);
      const respuesta = respuestas[i];
      casilla.grupo.classList.toggle('activa',activa);
      casilla.rotulo.textContent = en(posiciones[i][0],posiciones[i][2]);
      casilla.rotulo.title = posicion;
      actualizarOperando(casilla.arriba,c.arriba,arriba,en(`Arriba, ${posicion}`,`Top, ${posicion}`));
      actualizarOperando(casilla.abajo,c.abajo,abajo,en(`Abajo, ${posicion}`,`Bottom, ${posicion}`));
      const marca = revision?.[i];
      const estado = marca === undefined ? '' : marca ? en(', correcta', ', correct') : en(', por corregir', ', needs correction');
      const etiqueta = en(`Resultado, ${posicion}: ${respuesta ?? 'pendiente'}`, `Answer, ${posicion}: ${respuesta ?? 'pending'}`);
      actualizarCelda(casilla.respuesta,respuesta ?? (activa ? '?' : ''),etiqueta + estado);
      casilla.abajo.caja.classList.toggle('prestamista',Boolean(fase) && i === columna+1);
      casilla.respuesta.caja.disabled = Boolean(fase) || resuelta() || faltaSigno() || (!activa && respuesta === null);
      casilla.respuesta.caja.classList.toggle('escrita',respuesta !== null);
      casilla.respuesta.caja.setAttribute('aria-invalid',String(marca === false));
      casilla.respuesta.caja.classList.toggle('correcta',marca === true);
      casilla.respuesta.caja.classList.toggle('equivocada',marca === false);
    });
  }

  function ubicarNuevaRonda() {
    const compacta = resuelta() && vistaBreve.matches;
    const destino = compacta ? herramientasPaso : pieAcciones;
    if (nuevaRonda.parentElement !== destino) destino.append(nuevaRonda);
    app.classList.toggle('nueva-compacta',compacta);
  }

  function render(reinicio = false) {
    const terminado = resuelta(), signoPendiente = faltaSigno(), pendiente = listo();
    const revisionIncorrecta = pendiente && revision !== null && !terminado;
    renderOperacion();
    casillaSigno.classList.toggle('signo-pendiente',signoPendiente);
    casillaSigno.setAttribute('aria-label',signoPendiente ?
      en('Casilla para el signo menos','Box for the minus sign') : en('Signo menos','Minus sign'));
    get('fichaSigno').hidden = !signoPendiente;
    app.classList.toggle('resuelta',terminado);
    get('progreso').textContent = terminado ? en('Resta correcta','Correct subtraction') :
      pendiente ? en('Respuesta completa','Answer complete') : signoPendiente ?
        en('Signo de la operación','Operation sign') : `${nombrePosicion(columna)} · ${columna+1}/${ronda.columnas.length}`;
    const instruccion = textoPaso();
    get('indicacion').textContent = instruccion;
    get('indicacion').classList.toggle('error',revisionIncorrecta);
    get('estado').textContent = revisionIncorrecta ? instruccion : aviso?.texto || '';
    get('estado').classList.toggle('en-cabecera',revisionIncorrecta || Boolean(aviso?.instruccion));
    get('resultado').textContent = terminado ? `${ronda.a} − ${ronda.b} = ${ronda.a-ronda.b}` : '';
    get('resultado').setAttribute('aria-hidden',String(!terminado));
    get('premio').hidden = !terminado;
    const prestamo = get('prestamo');
    prestamo.hidden = signoPendiente;
    prestamo.disabled = signoPendiente || Boolean(fase) || pendiente || prestados.has(columna);
    prestamo.classList.toggle('sugerido',!fase && conGuia() && faltaPrestamo());
    prestamo.textContent = en('↑ Pedir prestado','↑ Borrow');
    prestamo.setAttribute('aria-label',en('Pedir prestado','Borrow'));
    get('borrar').disabled = signoPendiente || Boolean(fase) || terminado || !respuestas.some(digito => digito !== null);
    get('revisar').disabled = signoPendiente || Boolean(fase) || terminado || !completa();
    get('revisar').hidden = terminado;
    nuevaRonda.classList.toggle('principal',terminado);
    ubicarNuevaRonda();
    for (const tecla of teclado.children) tecla.disabled = signoPendiente || Boolean(fase) || pendiente;
    informarAbaco(reinicio);
  }

  function colocarSigno() {
    if (!faltaSigno()) return;
    signoColocado = true;
    render();
    leer();
  }

  function elegirColumna(i) {
    if (fase || resuelta() || faltaSigno() || i === columna || respuestas[i] === null) return;
    columna = i;
    aviso = null;
    render();
    leer();
  }

  function seleccionar(digito, i = columna) {
    if (fase || resuelta() || faltaSigno() || i >= respuestas.length) return;
    if (faltaPrestamo(i)) {
      avisar(en('Primero pide prestado en esta columna.','Borrow first in this column.'));
      return;
    }
    respuestas[i] = digito;
    revision = null;
    aviso = null;
    const pendiente = respuestas.indexOf(null);
    columna = pendiente === -1 ? respuestas.length : pendiente;
    render();
    leer();
    if (listo()) get('revisar').focus({preventScroll:true});
  }

  function borrar() {
    if (fase || resuelta() || faltaSigno()) return;
    const i = respuestas[columna] == null ? respuestas.findLastIndex(digito => digito !== null) : columna;
    if (i === -1) return;
    respuestas[i] = null;
    revision = null;
    aviso = null;
    columna = i;
    render();
  }

  function avisar(texto) {
    aviso = {texto,instruccion:true};
    render();
    leer(false,texto);
  }

  function revisar() {
    if (fase || faltaSigno() || resuelta() || !completa()) return;
    arrastre.cancelar();
    revision = respuestas.map((digito,i) => digito === ronda.columnas[i].resultado);
    columna = respuestas.length;
    aviso = null;
    render();
    leer();
    if (resuelta()) huevos.preparar()?.focus({preventScroll:true});
  }

  function centro(elemento, altura = .5) {
    const caja = elemento.getBoundingClientRect();
    const plano = efectos.getBoundingClientRect();
    const escala = efectos.offsetWidth ? plano.width / efectos.offsetWidth : 1;
    return {x:(caja.left + caja.width/2 - plano.left)/escala,y:(caja.top + caja.height * altura - plano.top)/escala};
  }

  async function moverFicha(desde,hacia,texto,devuelto = false) {
    const a = centro(desde);
    // El primer renglón de cada casilla ocupa la mitad superior.
    const b = centro(hacia,.25);
    const ficha = document.createElement('span');
    ficha.className = 'ficha-vuelo' + (devuelto ? ' devuelto' : '');
    ficha.textContent = texto;
    ficha.style.left = a.x + 'px';
    ficha.style.top = a.y + 'px';
    efectos.append(ficha);
    let animacion;
    try {
      animacion = ficha.animate([
        {transform:'translate(-50%, -50%) scale(.78)',opacity:0},
        {transform:'translate(-50%, -50%) scale(1)',opacity:1,offset:.2},
        {transform:`translate(calc(-50% + ${b.x-a.x}px),calc(-50% + ${b.y-a.y}px)) scale(1.04)`,opacity:1}
      ],{duration:devuelto ? 850 : 930,easing:'ease-in-out',fill:'forwards'});
      vuelo = animacion;
      await animacion.finished;
    } catch {
      // La compensación se aplica también cuando el navegador interrumpe el efecto.
    } finally {
      if (animacion && vuelo === animacion) vuelo = null;
      ficha.remove();
    }
  }

  async function pedirPrestado() {
    if (fase || listo() || faltaSigno()) return;
    arrastre.cancelar();
    limpiarRealce();
    if (prestados.has(columna)) return;
    if (!actual().presta) return avisar(en('Aquí puedes restar sin pedir prestado.','You can subtract here without borrowing.'));
    const iniciada = ronda;
    const i = columna;
    aviso = null;
    const narracionPrestamo = explicarPrestamo();
    if (config.animacion && !reduce.matches) {
      fase = 'aumentar';
      render();
      if (config.narrarPrestamo) IdiomaVoz.hablar(narracionPrestamo);
      await moverFicha(casillas[i+1].abajo.numero,casillas[i].arriba.caja,'+10');
      if (ronda !== iniciada) return;
      fase = 'compensar';
      render();
      if (config.animacion && !reduce.matches) await moverFicha(casillas[i].arriba.numero,casillas[i+1].abajo.caja,'+1',true);
      if (ronda !== iniciada) return;
    } else {
      if (config.narrarPrestamo) IdiomaVoz.hablar(narracionPrestamo);
    }
    prestados.add(i);
    fase = null;
    aviso = {texto:en('+10 arriba aquí · +1 abajo a la izquierda','+10 above here · +1 below to the left')};
    render();
    if (!config.narrarPrestamo) leer();
  }

  for (const digito of [1,2,3,4,5,6,7,8,9,0]) {
    const tecla = document.createElement('button');
    tecla.type = 'button';
    tecla.dataset.valor = digito;
    tecla.textContent = digito;
    tecla.onclick = () => seleccionar(digito);
    teclado.append(tecla);
  }
  function vincularAccion(boton, accion) {
    let toque, atendido = false;
    boton.addEventListener('pointerdown', e => {
      atendido = false;
      toque = e.pointerType === 'touch' && e.isPrimary ? {id:e.pointerId,x:e.clientX,y:e.clientY} : null;
    });
    boton.addEventListener('pointercancel', () => { toque = null; });
    boton.addEventListener('pointerup', e => {
      if (toque?.id !== e.pointerId) return;
      const cerca = Math.hypot(e.clientX-toque.x,e.clientY-toque.y) < 10;
      toque = null;
      if (!cerca || boton.disabled || !boton.contains(document.elementFromPoint(e.clientX,e.clientY))) return;
      // Tras un arrastre, el navegador puede entregar el toque sin generar un clic.
      atendido = true;
      accion();
    });
    boton.addEventListener('click', e => {
      if (atendido && e.detail > 0) {
        atendido = false;
        return;
      }
      accion();
    });
  }

  const arrastre = ArrastreResta.instalar(app,{
    puedeSoltar(origen,destino) {
      if (origen.hasAttribute('data-ficha-signo')) return faltaSigno() && destino === casillaSigno;
      return destino.dataset.destinoArrastre === 'respuesta' && !destino.disabled;
    },
    soltar(origen,destino) {
      if (origen.hasAttribute('data-ficha-signo')) colocarSigno();
      else seleccionar(Number(origen.dataset.valor),Number(destino.parentElement.dataset.columna));
    }
  });
  const huevos = HuevosResta.instalar(get('premio'),get('vueloSorpresas'),() => config.sonidoSorpresas);
  const abaco = AbacoResta.instalar({boton:get('abacoResta'),obtenerColumna:obtenerColumnaAbaco});
  get('idiomaResta').before(abaco.configuracion);
  get('fichaSigno').onclick = colocarSigno;
  vincularAccion(get('borrar'),borrar);
  vincularAccion(get('prestamo'),pedirPrestado);
  vincularAccion(get('revisar'),revisar);
  nuevaRonda.onclick = () => iniciar();
  get('ejemplo').onclick = () => iniciar(true);
  get('escuchar').onclick = () => leer(true);
  get('inicio').addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !window.AppsFullscreen) return;
    e.preventDefault();
    AppsFullscreen.navigate(get('inicio').href);
  });
  document.addEventListener('keydown', e => {
    if (dialogo.open || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing ||
        e.target.closest?.('input,textarea,select,[contenteditable],#abaco-flotante')) return;
    if (e.key === '-' && faltaSigno()) {
      e.preventDefault();
      colocarSigno();
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      seleccionar(Number(e.key));
    } else if (e.key === 'Backspace' && !resuelta()) {
      e.preventDefault();
      borrar();
    }
  });
  get('ajustes').onclick = () => {
    get('cifras').value = config.cifras;
    get('tamanoActividad').value = config.tamanoActividad;
    for (const id of opciones) get(id).checked = config[id];
    arrastre.cancelar();
    limpiarRealce();
    abaco.prepararConfiguracion();
    IdiomaVoz.iniciarEdicion();
    dialogo.showModal();
  };
  dialogo.addEventListener('close', () => {
    const cifras = Number(get('cifras').value);
    const soloPrestamo = get('siemprePrestamo').checked;
    const otraRonda = cifras !== config.cifras || soloPrestamo !== config.siemprePrestamo ||
      get('colocarSigno').checked !== config.colocarSigno;
    config.cifras = cifras;
    config.tamanoActividad = Number(get('tamanoActividad').value);
    app.style.setProperty('--tamano-actividad',config.tamanoActividad / 100);
    for (const id of opciones) config[id] = get(id).checked;
    if (!config.sonidoSorpresas) huevos.silenciar();
    Matematicas.guardar(clave,config);
    IdiomaVoz.aplicarEdicion();
    abaco.aplicarConfiguracion();
    if (otraRonda) iniciar();
    else { aviso = null; render(); leer(); }
  });
  addEventListener('nombre-estudiante-cambiado', () => {
    if (resuelta()) get('indicacion').textContent = felicitar();
  });
  IdiomaVoz.instalar('#idiomaResta',{
    cambioIdioma() {
      abaco.localizar();
      huevos.localizar();
    }
  });
  app.style.setProperty('--tamano-actividad',config.tamanoActividad / 100);
  let dimensiones;
  Matematicas.pantalla(app, (_, zoom) => {
    const {clientWidth:ancho,clientHeight:alto} = document.documentElement;
    const medidas = [ancho,alto,zoom].join('/');
    if (dimensiones && dimensiones !== medidas) vuelo?.cancel();
    dimensiones = medidas;
    app.style.setProperty('--u',1/zoom+'px');
    efectos.style.zoom = String(1/zoom);
    document.body.style.setProperty('--ancho-resta',ancho/zoom+'px');
    app.classList.toggle('horizontal',ancho>alto);
    app.classList.toggle('compacta',alto<670 || ancho<440);
    if (ronda) ubicarNuevaRonda();
  });
  iniciar(!guardado.cifras);
})();
