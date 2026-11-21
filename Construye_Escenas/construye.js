(() => {
  'use strict';

  const get = id => document.getElementById(id);
  const {piezas, bloques, paisajes, zonaTablero, admite, siguientePaisaje, mallaPaisaje: malla, puntosPaisaje} = RetosConstruccion;
  const retos = {bloques, paisajes};
  const escena = EscenarioConstruccion;
  const app = get('appConstruye'), juego = get('juego'), tablero = get('tablero'), banco = get('banco');
  const ctx = tablero.getContext('2d');
  const ajustes = get('ajustes'), selector = get('elegirReto');
  const verZona = get('verZona');
  const controlesConfigurables = ['narracion', 'texto', 'pistas'];
  const esEn = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const local = texto => texto[IdiomaVoz.idioma];
  const clave = 'construye-escenas.v1';
  const guardado = Matematicas.leer(clave);
  const config = {
    cantidad: guardado.cantidad === 5 ? 5 : 4,
    narracion: guardado.narracion === true,
    texto: guardado.texto !== false,
    longitudRonda: Number.isInteger(guardado.longitudRonda) && guardado.longitudRonda >= 3 &&
      guardado.longitudRonda <= 12 ? guardado.longitudRonda : 6,
    pistas: guardado.pistas === true
  };
  const vista = {escala: 1, x: 0, y: 0, densidad: 1};
  const colocadas = [];
  const historial = [], fuegos = [];
  const cursor = {x: 380, y: 275};
  let modo, reto, indiceReto = 0, elegida, opciones = [], zonas = [], pistaManual = null;
  let arrastre, vistaPrevia, movimiento, teclado = false;
  let cuadroAnimacion = 0;
  let pasoPaisaje, ordenPaisaje, puestasEnPaso = 0;

  const paso = () => esBloques() ? reto?.pasos[colocadas.length] : pasoPaisaje;
  const esBloques = () => modo === 'bloques';
  const limites = (valor, min, max) => Math.max(min, Math.min(valor, max));
  const dentro = ({x, y}) => x >= 0 && x <= escena.ancho && y <= escena.alto &&
    y >= (esBloques() ? -vista.y / vista.escala : 0);
  const completar = () => reto && !paso();
  const mostrarZona = () => pistaManual ?? config.pistas;
  function mezclar(elementos) {
    for (let i = elementos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [elementos[i], elementos[j]] = [elementos[j], elementos[i]];
    }
    return elementos;
  }

  function instruccion() {
    if (paso()) return local(paso().texto);
    const nombre = window.NombreCompartido?.obtener();
    if (esBloques()) return nombre ?
      esEn(`¡Bien hecho, ${nombre}! Cuenta en voz alta qué pusiste primero y qué bloque quedó encima.`,
        `Well done, ${nombre}! Say what you put down first and which block ended up on top.`) :
      esEn('¡Bien hecho! Cuenta en voz alta qué pusiste primero y qué bloque quedó encima.',
        'Well done! Say what you put down first and which block ended up on top.');
    return nombre ?
      esEn(`¡Bien hecho, ${nombre}! Describe tu paisaje en voz alta. ¿Qué pusiste y dónde quedó?`,
        `Well done, ${nombre}! Describe your landscape aloud. What did you put down, and where?`) :
      esEn('¡Bien hecho! Describe tu paisaje en voz alta. ¿Qué pusiste y dónde quedó?',
        'Well done! Describe your landscape aloud. What did you put down, and where?');
  }
  function narrar(texto, manual = false) {
    if (manual || config.narracion) IdiomaVoz.hablar(texto);
  }
  function mostrarEstado(texto = '', esCorrecto = false) {
    get('estado').textContent = texto;
    get('estado').classList.toggle('correcto', esCorrecto);
  }
  function generarOpciones() {
    if (!paso()) return [];
    const id = paso().id, datos = piezas[id];
    const mismoGrupo = Object.keys(piezas).filter(clavePieza => clavePieza !== id && Boolean(piezas[clavePieza].forma) === esBloques());
    if (!esBloques()) {
      const familia = id.split('-')[0];
      const similares = reto.objetos.filter(item => item !== id && item.startsWith(familia + '-'));
      const proximos = mezclar(reto.objetos.filter(item => item !== id && !similares.includes(item)));
      const otros = mismoGrupo.filter(item => !proximos.includes(item));
      return mezclar([id, ...similares, ...proximos, ...otros].slice(0, config.cantidad));
    }
    const otraForma = mismoGrupo.filter(item => piezas[item].forma !== datos.forma && piezas[item].tinta === datos.tinta);
    const otroColor = mismoGrupo.filter(item => piezas[item].forma === datos.forma);
    const otros = mismoGrupo.filter(item => !otraForma.includes(item) && !otroColor.includes(item));
    return mezclar([id, mezclar(otraForma)[0], mezclar(otroColor)[0], ...mezclar(otros)].slice(0, config.cantidad));
  }
  function renderBanco() {
    banco.hidden = completar();
    banco.style.setProperty('--opciones', config.cantidad);
    banco.replaceChildren(...opciones.map(id => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'ficha';
      boton.dataset.pieza = id;
      boton.setAttribute('aria-pressed', String(elegida === id));
      const imagen = document.createElement('canvas');
      imagen.width = 128; imagen.height = 96;
      imagen.setAttribute('aria-hidden', 'true');
      escena.ficha(imagen, id, piezas[id]);
      const rotulo = document.createElement('span');
      rotulo.textContent = local(piezas[id].nombre);
      boton.append(imagen, rotulo);
      return boton;
    }));
  }
  function renderPaso(nuevoBanco = true, leer = true) {
    elegida = nuevoBanco ? null : elegida;
    if (nuevoBanco) {
      opciones = generarOpciones();
      pistaManual = null;
    }
    tablero.classList.toggle('colocando', !!elegida);
    const indicePaso = (esBloques() ? colocadas.length : historial.length) + 1;
    const total = esBloques() ? reto.pasos.length : config.longitudRonda;
    get('progreso').textContent = completar() ? esEn('¡Listo!', 'Done!') :
      esEn(`Paso ${indicePaso} de ${total}`, `Step ${indicePaso} of ${total}`);
    const cantidad = paso()?.cantidad || 1;
    get('cantidadPuesta').hidden = cantidad === 1;
    get('cantidadPuesta').textContent = esEn(`${puestasEnPaso} de ${cantidad} colocados`, `${puestasEnPaso} of ${cantidad} placed`);
    get('indicacion').hidden = !config.texto && !completar();
    get('indicacion').textContent = instruccion();
    get('siguiente').hidden = !completar();
    renderBanco();
    actualizarGuias();
    dibujar();
    if (leer) narrar(instruccion());
  }

  function renderLista() {
    selector.replaceChildren(...retos[modo].map((item, indice) => new Option(local(item.nombre), indice)));
    selector.value = indiceReto;
  }
  function iniciar(indice, leer = true) {
    detenerMovimiento();
    indiceReto = indice;
    reto = retos[modo][indice];
    colocadas.length = 0;
    historial.length = 0;
    fuegos.length = 0;
    puestasEnPaso = 0;
    if (!esBloques()) {
      const [inicial, ...resto] = reto.objetos;
      ordenPaisaje = reto.terreno === 'terminal' ? [
        ...mezclar(reto.objetos.filter(id => /^(carro|camion|autobus)-/.test(id))).slice(0, 3),
        ...mezclar(reto.objetos.filter(id => !/^(carro|camion|autobus)-/.test(id)))
      ] : [inicial, ...mezclar(resto)];
      pasoPaisaje = siguientePaisaje(reto, colocadas, historial, ordenPaisaje);
    }
    opciones = [];
    vistaPrevia = null;
    arrastre = null;
    teclado = false;
    cursor.x = 380; cursor.y = 275;
    selector.value = indice;
    mostrarEstado();
    renderPaso(true, leer);
  }
  function abrirModo(nuevoModo) {
    modo = nuevoModo;
    juego.dataset.modo = nuevoModo;
    get('escena').classList.toggle('paisaje', !esBloques());
    indiceReto = 0;
    renderLista();
    get('modos').hidden = true;
    get('reiniciar').hidden = false;
    juego.hidden = false;
    iniciar(0);
    adaptar();
    selector.focus({preventScroll: true});
  }

  function destinoBloque(id, x, y) {
    const pieza = piezas[id];
    x = limites(x, pieza.ancho / 2 + 9, escena.ancho - pieza.ancho / 2 - 9);
    const colisiones = colocadas.map((objeto, indice) => {
      const otro = piezas[objeto.id];
      const izquierda = Math.max(x - pieza.ancho / 2, objeto.x - otro.ancho / 2);
      const derecha = Math.min(x + pieza.ancho / 2, objeto.x + otro.ancho / 2);
      return {indice, cima: objeto.y - otro.alto, solape: derecha - izquierda};
    }).filter(contacto => contacto.solape >= 9);
    const final = Math.min(escena.piso, ...colisiones.map(contacto => contacto.cima));
    const apoyos = colisiones.filter(contacto => contacto.cima === final && contacto.solape >= 18).map(contacto => contacto.indice);
    return {id, x, y: final, origen: Math.min(y, final - 19), apoyos};
  }
  function bloqueCorrecto(destino) {
    const objetivo = paso();
    if (destino.apoyos.length !== objetivo.apoyos.length || !objetivo.apoyos.every(indice => destino.apoyos.includes(indice))) return false;
    if (!objetivo.apoyos.length) {
      if (objetivo.espacio && destino.x > escena.ancho - objetivo.espacio) return false;
      if (objetivo.desde === undefined) return true;
      const distancia = destino.x - colocadas[objetivo.desde].x;
      const [min,max] = objetivo.separacion;
      return distancia >= min && distancia <= max;
    }
    const centro = objetivo.apoyos.reduce((total, indice) => total + colocadas[indice].x, 0) / objetivo.apoyos.length;
    return Math.abs(destino.x - centro) <= (objetivo.apoyos.length > 1 ? 27 : 31);
  }
  function paisajeCorrecto(x, z) {
    return zonaTablero(x,z) && admite(paso(), x, z, colocadas, paso().cantidad - puestasEnPaso - 1);
  }
  function calcularPistas() {
    if (!mostrarZona() || !paso()) return [];
    if (esBloques()) {
      const id = paso().id;
      return Array.from({length: 95}, (_, i) => destinoBloque(id, (i + 1) * 8, 0)).filter(bloqueCorrecto);
    }
    return puntosPaisaje.filter(({x,z}) => paisajeCorrecto(x,z));
  }
  function actualizarGuias() {
    verZona.hidden = !paso();
    verZona.setAttribute('aria-pressed', String(mostrarZona()));
    verZona.title = IdiomaVoz.t(mostrarZona() ? 'Ocultar zona' : 'Mostrar zona');
    zonas = calcularPistas();
  }
  function dibujarPistas() {
    if (esBloques()) {
      for (const zona of zonas) {
        ctx.fillStyle = '#6644b4c9';
        ctx.fillRect(zona.x - 4, zona.y - 7, 8, 7);
      }
    } else {
      const casillas = new Set(zonas.map(({i,j}) => `${i}:${j}`));
      const dx = .5 / malla.columnas, dz = .5 / malla.filas;
      const bordes = [];
      for (const {i,j,x,z} of zonas) {
        const vertices = [[x-dx,z-dz],[x+dx,z-dz],[x+dx,z+dz],[x-dx,z+dz]].map(([px,pz]) => escena.proyectar(px,pz));
        escena.poligono(ctx, vertices, '#ecdaffae');
        const vecinos = [[i,j-1],[i+1,j],[i,j+1],[i-1,j]];
        vecinos.forEach(([vi,vj], arista) => {
          if (!casillas.has(`${vi}:${vj}`)) bordes.push([vertices[arista], vertices[(arista+1)%4]]);
        });
      }
      for (const borde of bordes) {
        escena.linea(ctx, borde, '#67419b', 2.8);
      }
    }
  }
  function dibujarPieza(item, elevacion = 0) {
    if (esBloques()) escena.bloque(ctx, piezas[item.id], item.x, item.y - elevacion);
    else escena.paisajeObjeto(ctx, item.id, item.x, item.z, elevacion, Boolean(item.contenedor));
  }
  const coloresFuegos = ['#ffe25e','#ff6ba2','#68edff','#caa0ff','#ff9652','#f9ffff'];
  function celebrar() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ahora = performance.now();
    const centros = mezclar([150, 380, 610]);
    const cohetes = centros.map((x, i) => ({
      x: x + Math.random() * 46 - 23, y: 62 + Math.random() * 42, inicio: ahora + i * 115,
      chispas: Array.from({length: 20}, (_, j) => ({
        angulo: j * Math.PI / 10 + Math.random() * .21, radio: 26 + Math.random() * 70,
        color: coloresFuegos[(i * 2 + j) % coloresFuegos.length], tamano: 2 + Math.random() * 2
      }))
    }));
    fuegos.push(...cohetes);
    if (fuegos.length > 9) fuegos.splice(0, fuegos.length - 9);
  }
  function dibujarFuegos(tiempo) {
    while (fuegos.length && tiempo - fuegos[0].inicio >= 1030) fuegos.shift();
    if (!fuegos.length) return;
    ctx.save();
    for (const {x,y,inicio,chispas} of fuegos) {
      const edad = tiempo - inicio;
      if (edad < 0 || edad >= 1030) continue;
      if (edad < 170) {
        ctx.globalAlpha = .85;
        escena.linea(ctx, [[x,y + 129 * (1 - edad / 170) + 12],[x,y + 129 * (1 - edad / 170)]], '#fff4ad', 3);
        continue;
      }
      const avance = (edad - 170) / 860;
      const expansion = 1 - (1 - avance) ** 2;
      ctx.globalAlpha = 1 - avance;
      for (const {angulo,radio,color,tamano} of chispas) {
        const px = x + Math.cos(angulo) * radio * expansion;
        const py = y + Math.sin(angulo) * radio * expansion + avance ** 2 * 28;
        const r = tamano * (1 - avance * .5);
        escena.poligono(ctx, [[px-r,py],[px,py-r*1.7],[px+r,py],[px,py+r*1.7]], color);
      }
    }
    ctx.restore();
  }
  function dibujar(tiempo = performance.now()) {
    cancelAnimationFrame(cuadroAnimacion);
    if (juego.hidden || !reto) return;
    const {escala, densidad, x, y} = vista;
    ctx.setTransform(densidad, 0, 0, densidad, 0, 0);
    ctx.clearRect(0,0,tablero.width/densidad,tablero.height/densidad);
    ctx.translate(x,y); ctx.scale(escala,escala);
    const area = {x: -x / escala, y: -y / escala, ancho: tablero.width / densidad / escala, alto: tablero.height / densidad / escala};
    if (esBloques()) escena.fondoBloques(ctx, area);
    else escena.terreno(ctx,reto.terreno, area);
    dibujarFuegos(tiempo);
    dibujarPistas();
    const progreso = movimiento ? limites((tiempo - movimiento.inicio) / movimiento.duracion, 0, 1) : 0;
    const fantasma = movimiento?.pieza || vistaPrevia;
    const items = fantasma ? [...colocadas, fantasma] : colocadas;
    const orden = esBloques() ? items : [...items].sort((a, b) =>
      (a.contenedor ? a.contenedor.z + .001 : a.z) - (b.contenedor ? b.contenedor.z + .001 : b.z));
    for (const item of orden) {
      if (item !== fantasma) { dibujarPieza(item); continue; }
      ctx.save();
      if (!movimiento) ctx.globalAlpha = .62;
      const elevacion = movimiento ? movimiento.elevacion * (1 - progreso * progreso) : esBloques() ? 0 : 24;
      dibujarPieza(item, elevacion);
      ctx.restore();
    }
    if (teclado && elegida && !movimiento) {
      escena.elipse(ctx, cursor.x, cursor.y, 10, 10, '#fff9', '#53239d');
      escena.linea(ctx, [[cursor.x - 7,cursor.y],[cursor.x + 7,cursor.y]], '#53239d', 2);
      escena.linea(ctx, [[cursor.x,cursor.y - 7],[cursor.x,cursor.y + 7]], '#53239d', 2);
    }
    if (movimiento && progreso < 1) cuadroAnimacion = requestAnimationFrame(dibujar);
    else if (movimiento) finalizarCaida();
    else if (fuegos.length) cuadroAnimacion = requestAnimationFrame(dibujar);
  }
  function adaptar() {
    const w = tablero.clientWidth, h = tablero.clientHeight;
    if (w < 1 || h < 1) return;
    const densidad = Math.min(devicePixelRatio || 1, 2);
    const escala = Math.min(w / escena.ancho, h / escena.alto);
    Object.assign(vista, {densidad, escala, x: (w - escena.ancho * escala) / 2, y: (h - escena.alto * escala) / 2});
    if (tablero.width !== Math.round(w * densidad)) tablero.width = Math.round(w * densidad);
    if (tablero.height !== Math.round(h * densidad)) tablero.height = Math.round(h * densidad);
    cancelAnimationFrame(cuadroAnimacion);
    dibujar();
  }
  function encimaTablero(evento) {
    const rect = tablero.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return {x: -1, y: -1};
    const x = (evento.clientX - rect.left) * tablero.clientWidth / rect.width;
    const y = (evento.clientY - rect.top) * tablero.clientHeight / rect.height;
    return {x: (x - vista.x) / vista.escala, y: (y - vista.y) / vista.escala};
  }
  function seleccionar(id, enfocar = false) {
    if (movimiento || completar()) return;
    elegida = id;
    mostrarEstado();
    tablero.classList.add('colocando');
    for (const boton of banco.children) boton.setAttribute('aria-pressed', String(boton.dataset.pieza === id));
    if (enfocar) {
      teclado = true;
      tablero.focus({preventScroll: true});
      dibujar();
    }
  }
  function errorPieza() {
    const texto = esEn('Revisa la instrucción y elige otra pieza.', 'Check the instruction and choose another piece.');
    mostrarEstado(texto);
    narrar(texto);
  }
  function errorLugar() {
    const texto = esEn('La pieza es correcta. Prueba en otro lugar.', 'That is the right piece. Try a different place.');
    mostrarEstado(texto);
    narrar(texto);
  }
  function colocar(punto) {
    if (!elegida || !paso() || movimiento || !dentro(punto)) {
      if (!elegida && paso()) mostrarEstado(esEn('Escoge una pieza primero.', 'Choose a piece first.'));
      return;
    }
    if (elegida !== paso().id) { errorPieza(); return; }
    let pieza, elevacion, valido;
    if (esBloques()) {
      pieza = destinoBloque(elegida, punto.x, punto.y);
      valido = bloqueCorrecto(pieza);
      const ajuste = !valido && zonas.find(zona => Math.abs(pieza.x - zona.x) <= 4);
      if (ajuste) {
        pieza = destinoBloque(elegida, ajuste.x, punto.y);
        valido = true;
      }
      elevacion = pieza.y - pieza.origen;
    } else {
      const {x,z} = escena.desdePantalla(punto.x,punto.y);
      valido = paisajeCorrecto(x,z);
      // Un toque puede llegar redondeado al píxel más cercano, especialmente en pantallas pequeñas.
      const toleranciaX = mostrarZona() ? .5 / malla.columnas : .009;
      const toleranciaZ = mostrarZona() ? .5 / malla.filas : .018;
      const ajuste = !valido && puntosPaisaje.find(zona => Math.abs(x - zona.x) <= toleranciaX &&
        Math.abs(z - zona.z) <= toleranciaZ && paisajeCorrecto(zona.x,zona.z));
      if (!ajuste && !zonaTablero(x,z)) { errorLugar(); return; }
      pieza = {id: elegida, x: ajuste?.x ?? x, z: ajuste?.z ?? z, contenedor: paso().contenedor};
      elevacion = z < 0 ? 14 : 94;
      valido ||= Boolean(ajuste);
    }
    vistaPrevia = null;
    mostrarEstado();
    const duracion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : limites(Math.sqrt(elevacion) * 27, 160, 490);
    movimiento = {pieza, elevacion, valido, duracion: Math.max(1, duracion), inicio: performance.now()};
    dibujar();
  }
  function detenerMovimiento() {
    cancelAnimationFrame(cuadroAnimacion);
    movimiento = null;
  }
  function finalizarCaida() {
    const {pieza, valido} = movimiento;
    detenerMovimiento();
    if (!valido) { errorLugar(); dibujar(); return; }
    colocadas.push(pieza);
    let pasoCompleto = true;
    if (!esBloques()) {
      puestasEnPaso++;
      pasoCompleto = puestasEnPaso === pasoPaisaje.cantidad;
      if (pasoCompleto) {
        historial.push(pasoPaisaje);
        puestasEnPaso = 0;
        pasoPaisaje = historial.length < config.longitudRonda ?
          siguientePaisaje(reto, colocadas, historial, ordenPaisaje) : null;
      }
    }
    celebrar();
    if (completar()) mostrarEstado(esEn('Escena completa', 'Scene complete'), true);
    else mostrarEstado(esEn('¡Bien colocado!', 'Well placed!'), true);
    renderPaso(pasoCompleto, pasoCompleto);
    if (completar()) get('siguiente').focus({preventScroll: true});
    else if (teclado) banco.firstElementChild?.focus({preventScroll: true});
  }

  banco.addEventListener('pointerdown', evento => {
    const boton = evento.target.closest('[data-pieza]');
    if (evento.button !== 0 || arrastre || movimiento || !boton) return;
    boton.setPointerCapture(evento.pointerId);
    teclado = false;
    seleccionar(boton.dataset.pieza);
    arrastre = {puntero: evento.pointerId, x: evento.clientX, y: evento.clientY, movido: false};
  });
  banco.addEventListener('pointermove', evento => {
    if (arrastre?.puntero !== evento.pointerId) return;
    if (!arrastre.movido && Math.hypot(arrastre.x - evento.clientX, arrastre.y - evento.clientY) < 6) return;
    arrastre.movido = true;
    const punto = encimaTablero(evento);
    vistaPrevia = null;
    if (dentro(punto)) {
      if (esBloques()) vistaPrevia = {id: elegida, ...punto};
      else {
        const {x,z} = escena.desdePantalla(punto.x,punto.y);
        if (zonaTablero(x,z)) vistaPrevia = {id: elegida,x,z,contenedor: paso()?.contenedor};
      }
    }
    dibujar();
  });
  for (const nombreEvento of ['pointerup','pointercancel','lostpointercapture']) {
    banco.addEventListener(nombreEvento, evento => {
      if (arrastre?.puntero !== evento.pointerId) return;
      const soltar = nombreEvento === 'pointerup' && arrastre.movido;
      arrastre = null;
      vistaPrevia = null;
      if (soltar) {
        const punto = encimaTablero(evento);
        if (dentro(punto)) colocar(punto);
      }
      if (!movimiento) dibujar();
    });
  }
  banco.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-pieza]');
    if (boton && evento.detail === 0) seleccionar(boton.dataset.pieza, true);
  });
  tablero.addEventListener('click', evento => {
    teclado = false;
    colocar(encimaTablero(evento));
  });
  tablero.addEventListener('keydown', evento => {
    const pasos = {ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1]};
    const delta = pasos[evento.key];
    if (delta && elegida) {
      evento.preventDefault();
      teclado = true;
      cursor.x = limites(cursor.x + delta[0] * 12, 8, escena.ancho - 8);
      cursor.y = limites(cursor.y + delta[1] * 12, 8, escena.alto - 8);
      dibujar();
    }
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      colocar(cursor);
    }
  });
  get('modos').addEventListener('click', evento => {
    const boton = evento.target.closest('[data-modo]');
    if (boton) abrirModo(boton.dataset.modo);
  });
  get('volver').addEventListener('click', () => {
    const tarjeta = get('modos').querySelector(`[data-modo="${modo}"]`);
    detenerMovimiento();
    window.speechSynthesis?.cancel();
    modo = null;
    reto = null;
    fuegos.length = 0;
    juego.hidden = true;
    get('reiniciar').hidden = true;
    get('modos').hidden = false;
    tarjeta.focus({preventScroll: true});
  });
  selector.addEventListener('change', () => iniciar(Number(selector.value)));
  get('reiniciar').addEventListener('click', () => iniciar(indiceReto));
  get('escuchar').addEventListener('click', () => narrar(instruccion(), true));
  verZona.addEventListener('click', () => {
    if (!paso() || movimiento) return;
    pistaManual = !mostrarZona();
    actualizarGuias();
    dibujar();
  });
  get('siguiente').addEventListener('click', () => {
    iniciar((indiceReto + 1) % retos[modo].length);
    selector.focus({preventScroll: true});
  });
  get('inicio').addEventListener('click', evento => {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || !window.AppsFullscreen) return;
    evento.preventDefault();
    AppsFullscreen.navigate(get('inicio').href);
  });
  get('abrirAjustes').addEventListener('click', () => {
    get('cantidad').value = config.cantidad;
    get('longitudRonda').value = config.longitudRonda;
    for (const claveControl of controlesConfigurables) get(claveControl).checked = config[claveControl];
    IdiomaVoz.iniciarEdicion();
    ajustes.showModal();
  });
  ajustes.addEventListener('close', () => {
    const cantidad = Number(get('cantidad').value);
    const cambioCantidad = config.cantidad !== cantidad;
    const longitud = Number(get('longitudRonda').value);
    const cambioLongitud = config.longitudRonda !== longitud;
    config.longitudRonda = longitud;
    config.cantidad = cantidad;
    for (const claveControl of controlesConfigurables) config[claveControl] = get(claveControl).checked;
    pistaManual = null;
    Matematicas.guardar(clave,config);
    IdiomaVoz.aplicarEdicion();
    if (!modo) return;
    if (movimiento) {
      detenerMovimiento();
      vistaPrevia = null;
    }
    renderLista();
    if (cambioLongitud && !esBloques()) { iniciar(indiceReto); return; }
    mostrarEstado();
    renderPaso(cambioCantidad);
  });

  function dibujarTarjetas() {
    const bloques = get('arteBloques').getContext('2d');
    escena.fondoBloques(bloques);
    escena.bloque(bloques,piezas['rectangulo-rojo'],380,escena.piso);
    escena.bloque(bloques,piezas['cuadrado-azul'],380,escena.piso-47);
    escena.bloque(bloques,piezas['cuadrado-amarillo'],380,escena.piso-139);
    escena.bloque(bloques,piezas['triangulo-rojo'],380,escena.piso-231);
    escena.bloque(bloques,piezas['cuadrado-verde'],189,escena.piso);
    escena.bloque(bloques,piezas['triangulo-amarillo'],189,escena.piso-92);
    escena.bloque(bloques,piezas['cuadrado-rojo'],566,escena.piso);
    escena.bloque(bloques,piezas['triangulo-azul'],566,escena.piso-92);
    const paisaje = get('artePaisajes').getContext('2d');
    escena.terreno(paisaje,'rio');
    for (const [id,x,z] of [['arbol',.73,.2],['fuente',.74,.56],['pato',.12,.65],['nino',.51,.74],['pelota',.63,.87]]) {
      escena.paisajeObjeto(paisaje,id,x,z);
    }
  }
  IdiomaVoz.instalar('#vozConstruye');
  Matematicas.pantalla(app, (_, zoom) => {
    const root = document.documentElement;
    root.style.setProperty('--ancho-construye', root.clientWidth / zoom + 'px');
    app.style.setProperty('--alto-util', Math.min(root.clientHeight, visualViewport?.height || root.clientHeight) / zoom + 'px');
    app.style.setProperty('--u', 1 / zoom + 'px');
    app.classList.toggle('horizontal', root.clientWidth > root.clientHeight);
  });
  new ResizeObserver(adaptar).observe(tablero);
  dibujarTarjetas();
  escena.cargarFondos(tipo => {
    if (tipo === 'rio' || tipo === 'objetos') dibujarTarjetas();
    if (tipo === 'objetos') {
      for (const boton of banco.children) escena.ficha(boton.firstElementChild, boton.dataset.pieza, piezas[boton.dataset.pieza]);
    }
    if (reto?.terreno === tipo || (modo === 'paisajes' && tipo === 'objetos')) {
      cancelAnimationFrame(cuadroAnimacion);
      dibujar();
    }
  });
})();
