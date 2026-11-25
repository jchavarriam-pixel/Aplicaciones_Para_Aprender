(() => {
  'use strict';
  Object.assign(window.TEXTOS_INGLES, {
    'Construye el valor posicional':'Build place value',
    'Una cifra cambia de valor según el lugar donde está.':'A digit changes value depending on its position.',
    'Modos de práctica':'Practice modes', 'Todas las aplicaciones':'All apps', 'Ej.: Gabriel':'E.g. Gabriel',
    '⚙ Configuración':'⚙ Settings', '‹ Modos':'‹ Modes', '↻ Nueva ronda':'↻ New round',
    'Bloques multibase':'Base-ten blocks', 'Construye el número con piezas de uno, diez, cien o mil.':'Build the number with pieces worth one, ten, one hundred or one thousand.',
    'Cifras y flechas':'Digits and arrows', 'Encuentra el valor de una cifra o usa su valor para descubrirla.':'Find a digit’s value or use its value to find the digit.',
    'Escuchar ejercicio':'Listen to the exercise', 'Cifras del número':'Digits in the number',
    'Valores de las cifras':'Digit values', 'Siguiente pregunta':'Next question', '✓ Revisar':'✓ Check',
    'Práctica con flechas':'Arrow practice', 'Alternar los dos ejercicios':'Alternate both activities',
    'Escribir el valor de cada cifra':'Write the value of each digit', 'Encontrar la cifra que falta':'Find the missing digit',
    'Mostrar el nombre de las posiciones y el conteo de bloques':'Show place names and block counts',
    'Leer automáticamente las instrucciones y los resultados':'Automatically read instructions and feedback aloud',
    'Aplicar y cerrar':'Apply and close', 'Unidades':'Ones', 'Decenas':'Tens', 'Centenas':'Hundreds', 'Millares':'Thousands',
    'Arrastra cada bloque a su caja o toca ambos.':'Drag each block to its tray or tap both.',
    'Bloques para arrastrar':'Blocks to drag',
    'Lleva ese bloque a la caja de su mismo tipo.':'Move that block to the tray for its type.',
    'El número ya no cabe en las cajas de esta ronda.':'The number no longer fits in this round’s trays.',
    'Diez unidades forman una decena.':'Ten ones make one ten.',
    'Diez decenas forman una centena.':'Ten tens make one hundred.',
    'Diez centenas forman un millar.':'Ten hundreds make one thousand.',
    'Sigue las flechas y escribe cuánto vale cada cifra.':'Follow the arrows and write the value of each digit.',
    'Mira los valores y escribe la cifra que falta.':'Look at the values and write the missing digit.',
    'Compara las bandejas marcadas con el número de arriba.':'Compare the marked trays with the number above.',
    'Comprueba las casillas marcadas.':'Check the marked boxes.', '¡Muy bien!':'Well done!',
    'Respuesta correcta':'Correct answer','Respuesta incorrecta':'Incorrect answer'
  });
  const t = es => IdiomaVoz.t(es);
  const bilingue = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const get = id => document.getElementById(id);
  const app = get('appValor');
  const juego = get('juego');
  const dialogo = get('ajustes');
  const tablero = get('diagrama');
  const bandejas = get('bandejas');
  const banco = get('bancoBloques');
  const fantasma = get('fantasmaBloque');
  const animacionCanje = get('animacionCanje');
  const lineas = get('lineas');
  const teclado = TecladoEnPantalla.instalar(juego, get('teclado'));
  const sorpresas = SorpresasValor.instalar(get('sorpresas'));
  const nombres = ['Unidades','Decenas','Centenas','Millares'];
  const mensajesCanje = ['Diez unidades forman una decena.','Diez decenas forman una centena.','Diez centenas forman un millar.'];
  const abreviaturas = [['U','D','C','UM'], ['O','T','H','Th']];
  const tonos = ['#a26213','#286b9d','#296f59','#6b42a2'];
  const clave = 'valor-posicional-practica.v1';
  const guardado = Matematicas.leer(clave);
  const opciones = {
    digitos: [2,3,4].includes(guardado?.digitos) ? guardado.digitos : 3,
    practica: ['valores','cifra'].includes(guardado?.practica) ? guardado.practica : 'ambas',
    ayudas: guardado?.ayudas !== false,
    narracion: guardado?.narracion !== false
  };
  let modo, numero, cifras = [], piezas = [], hueco = null, direccion = 'cifra', resuelto = false;
  let seleccionado = null, gesto = null, pulsacion = null, canje = null;
  const observador = new ResizeObserver(entradas => {
    for (const {target} of entradas) pintarCanvas(target);
  });
  function pintarCanvas(canvas) {
    const lugar = Number(canvas.dataset.lugar);
    const esBandeja = canvas.classList.contains('piezas');
    BloquesMultibase.pintar(canvas, lugar, esBandeja ? piezas[lugar] : 1, esBandeja);
  }
  [...document.querySelectorAll('.arte-bloques canvas')].forEach((canvas,i) => {
    canvas.dataset.lugar = 2-i;
    observador.observe(canvas);
  });

  function instruccion() {
    if(modo === 'bloques') return t('Arrastra cada bloque a su caja o toca ambos.');
    return t(direccion === 'valores' ? 'Sigue las flechas y escribe cuánto vale cada cifra.' :
      'Mira los valores y escribe la cifra que falta.');
  }
  function escuchar() {
    let lectura = instruccion();
    if(modo === 'bloques') lectura += ' ' + numero + '.';
    else if(direccion === 'valores') lectura += ' ' + numero + '.';
    else lectura += ' ' + bilingue(`El valor que buscas es ${cifras[hueco] * 10 ** hueco}.`,
      `The value you are working with is ${cifras[hueco] * 10 ** hueco}.`);
    IdiomaVoz.hablar(lectura);
  }
  function avisar(texto = '', ok = false) {
    const mensaje = get('mensaje');
    mensaje.classList.toggle('exito', ok);
    mensaje.textContent = t(texto);
    if(texto && opciones.narracion) IdiomaVoz.hablar(texto);
  }
  function lugar(nombre, etiqueta, ubicacion) {
    const nodo = document.createElement(nombre);
    nodo.className = etiqueta;
    nodo.dataset.lugar = ubicacion;
    return nodo;
  }
  function rotularBandeja(bandeja, i) {
    const cantidad = piezas[i];
    bandeja.querySelector('small').textContent = cantidad;
    const canvas = bandeja.querySelector('.piezas');
    pintarCanvas(canvas);
    const destino = bandeja.querySelector('.soltar-bloque');
    destino.setAttribute('aria-label', bilingue(
      `Caja de ${nombres[i].toLowerCase()}, ${cantidad === 1 ? 'un bloque' : `${cantidad} bloques`}`,
      `${t(nombres[i])} tray, ${cantidad === 1 ? 'one block' : `${cantidad} blocks`}`));
    destino.disabled = resuelto || Boolean(canje);
    const quitar = bandeja.querySelector('.quitar-bloque');
    quitar.disabled = resuelto || Boolean(canje) || cantidad === 0;
    quitar.setAttribute('aria-label', bilingue(`Quitar un bloque de ${nombres[i].toLowerCase()}`,
      `Remove one ${t(nombres[i]).toLowerCase()} block`));
  }
  function rotularBanco() {
    for(const ficha of banco.children){
      const i = Number(ficha.dataset.lugar);
      ficha.setAttribute('aria-label', bilingue(`Bloque de ${nombres[i].toLowerCase()}`, `${t(nombres[i])} block`));
      ficha.setAttribute('aria-pressed',String(seleccionado === i));
      ficha.disabled = resuelto || Boolean(canje);
    }
  }
  function dibujarBloques() {
    for(const canvas of get('bloques').querySelectorAll('canvas')) observador.unobserve(canvas);
    bandejas.dataset.cantidad = cifras.length;
    get('numeroMeta').textContent = numero;
    banco.replaceChildren(...cifras.map((_,i) => {
      const boton = lugar('button','origen-bloque',i);
      boton.type = 'button';
      const muestra = lugar('canvas','muestra-bloque',i);
      muestra.setAttribute('aria-hidden','true');
      const etiqueta = document.createElement('span');
      etiqueta.textContent = 10 ** i;
      boton.append(muestra, etiqueta);
      observador.observe(muestra);
      return boton;
    }).reverse());
    rotularBanco();
    bandejas.replaceChildren(...cifras.map((_,i) => {
      const grupo = lugar('section','bandeja',i);
      grupo.innerHTML = `<header class="rotulo-bandeja"><h3></h3><small></small>
        <button type="button" class="quitar-bloque">−</button></header>
        <button type="button" class="soltar-bloque"><canvas class="piezas" aria-hidden="true"></canvas></button>`;
      grupo.querySelector('h3').textContent = nombres[i];
      grupo.querySelector('h3').hidden = grupo.querySelector('small').hidden = !opciones.ayudas;
      for(const canvas of grupo.querySelectorAll('canvas')){
        canvas.dataset.lugar = i;
        observador.observe(canvas);
      }
      return grupo;
    }).reverse());
    for(const grupo of bandejas.children) rotularBandeja(grupo, Number(grupo.dataset.lugar));
  }
  function quitarMarca(grupo) {
    grupo.classList.remove('correcta','incorrecta');
    grupo.removeAttribute('aria-description');
  }
  function cambiarCantidad(grupo,delta) {
    const i = Number(grupo.dataset.lugar);
    piezas[i] += delta;
    quitarMarca(grupo);
    if(piezas[i] === 10){
      iniciarCanje(i,document.activeElement);
      return;
    }
    rotularBandeja(grupo,i);
    avisar();
  }
  function rotularCanje() {
    rotularBanco();
    for(const grupo of bandejas.children) rotularBandeja(grupo,Number(grupo.dataset.lugar));
    get('revisar').disabled = Boolean(canje);
  }
  function cancelarCanje() {
    if(!canje) return;
    cancelAnimationFrame(canje.frame);
    canje.origen.classList.remove('canje-origen');
    canje.destino.classList.remove('canje-destino');
    animacionCanje.hidden = true;
    canje = null;
  }
  function completarCanje() {
    const {i,foco} = canje;
    cancelarCanje();
    piezas[i] = 0;
    piezas[i+1]++;
    if(piezas[i+1] === 10) iniciarCanje(i+1,foco);
    else {
      rotularCanje();
      if(foco && !foco.disabled && foco.isConnected &&
        document.activeElement === document.body && (banco.contains(foco) || bandejas.contains(foco))) foco.focus({preventScroll:true});
    }
  }
  function iniciarCanje(i,foco) {
    const origen = bandejas.querySelector(`[data-lugar="${i}"]`);
    const destino = bandejas.querySelector(`[data-lugar="${i+1}"]`);
    canje = {i,foco,origen,destino,frame:0};
    quitarMarca(destino);
    avisar(mensajesCanje[i]);
    if(document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches){
      completarCanje();
      return;
    }
    rotularCanje();
    origen.classList.add('canje-origen');
    destino.classList.add('canje-destino');
    animacionCanje.hidden = false;
    const desde = origen.querySelector('.piezas'), hasta = destino.querySelector('.piezas');
    const inicio = performance.now();
    const duracion = i === 0 ? 1650 : 3200;
    function paso(ahora) {
      const avance = Math.min(1,(ahora-inicio)/duracion);
      BloquesMultibase.pintarCanje(animacionCanje,i,desde,hasta,piezas[i+1]+1,avance);
      if(avance === 1) completarCanje();
      else canje.frame = requestAnimationFrame(paso);
    }
    canje.frame = requestAnimationFrame(paso);
  }
  document.addEventListener('visibilitychange',() => {
    if(document.hidden && canje) completarCanje();
  });
  function soltar(i,grupo) {
    if(resuelto || canje) return;
    const destino = Number(grupo.dataset.lugar);
    if(i !== destino) avisar('Lleva ese bloque a la caja de su mismo tipo.');
    else if(piezas.slice(i).every(n => n === 9)) avisar('El número ya no cabe en las cajas de esta ronda.');
    else cambiarCantidad(grupo,1);
    seleccionado = null;
    rotularBanco();
  }
  function activarBandeja(boton) {
    if(!boton || resuelto || canje || boton.disabled) return;
    const grupo = boton.closest('.bandeja');
    if(boton.matches('.quitar-bloque')) cambiarCantidad(grupo,-1);
    else if(seleccionado !== null) soltar(seleccionado,grupo);
  }
  bandejas.addEventListener('click', evento => {
    if(evento.detail === 0) activarBandeja(evento.target.closest('button'));
  });
  bandejas.addEventListener('pointerdown', evento => {
    const boton = evento.target.closest('button');
    if(boton && evento.button === 0) pulsacion = {boton,id:evento.pointerId,x:evento.clientX,y:evento.clientY};
  });
  bandejas.addEventListener('pointerup', evento => {
    if(pulsacion?.id !== evento.pointerId) return;
    const {boton,x,y} = pulsacion;
    pulsacion = null;
    const destino = document.elementFromPoint(evento.clientX,evento.clientY)?.closest('button');
    if(destino === boton && Math.hypot(evento.clientX-x,evento.clientY-y) < 12) activarBandeja(boton);
  });
  bandejas.addEventListener('pointercancel', () => { pulsacion = null; });
  function seleccionarBloque(i) {
    seleccionado = seleccionado === i ? null : i;
    rotularBanco();
  }
  function limpiarGesto() {
    gesto?.destino?.classList.remove('sobre-bandeja');
    gesto = null;
    pulsacion = null;
    fantasma.hidden = true;
  }
  banco.addEventListener('click', evento => {
    const ficha = evento.target.closest('.origen-bloque');
    if(ficha && !resuelto && !canje && evento.detail === 0) seleccionarBloque(Number(ficha.dataset.lugar));
  });
  banco.addEventListener('pointerdown', evento => {
    const ficha = evento.target.closest('.origen-bloque');
    if(!ficha || resuelto || canje || gesto || evento.button !== 0) return;
    banco.setPointerCapture(evento.pointerId);
    gesto = {id:evento.pointerId,i:Number(ficha.dataset.lugar),x:evento.clientX,y:evento.clientY};
  });
  banco.addEventListener('pointermove', evento => {
    if(gesto?.id !== evento.pointerId) return;
    const {clientX:x,clientY:y} = evento;
    if(fantasma.hidden) {
      if(Math.hypot(x-gesto.x,y-gesto.y) < 7) return;
      fantasma.hidden = false;
      Matematicas.fantasma(fantasma,x,y);
      BloquesMultibase.pintar(fantasma,gesto.i,1);
    } else Matematicas.fantasma(fantasma,x,y);
    gesto.destino?.classList.remove('sobre-bandeja');
    gesto.destino = document.elementFromPoint(x,y)?.closest('.bandeja');
    gesto.destino?.classList.add('sobre-bandeja');
  });
  banco.addEventListener('pointerup', evento => {
    if(gesto?.id !== evento.pointerId) return;
    const {i} = gesto;
    const arrastrado = !fantasma.hidden;
    const grupo = document.elementFromPoint(evento.clientX,evento.clientY)?.closest('.bandeja');
    limpiarGesto();
    if(arrastrado && grupo) soltar(i,grupo);
    else if(!arrastrado) seleccionarBloque(i);
  });
  for(const tipo of ['pointercancel','lostpointercapture']) banco.addEventListener(tipo,limpiarGesto);
  addEventListener('resize',limpiarGesto);
  document.addEventListener('fullscreenchange',limpiarGesto);

  function rotularEntrada(campo,i,esValor) {
    campo.setAttribute('aria-label', bilingue(
      esValor ? `Valor de ${cifras[i]} en ${nombres[i].toLowerCase()}` : `Cifra en ${nombres[i].toLowerCase()}`,
      esValor ? `Value of ${cifras[i]} in the ${t(nombres[i]).toLowerCase()} place` : `Digit in the ${t(nombres[i]).toLowerCase()} place`));
  }
  function entrada(i, esValor) {
    const campo = document.createElement('input');
    campo.type = 'text';
    campo.readOnly = true;
    campo.inputMode = 'none';
    campo.maxLength = esValor ? i+1 : 1;
    campo.dataset.campoTeclado = '';
    rotularEntrada(campo,i,esValor);
    return campo;
  }
  function dibujarDiagrama() {
    get('cifras').replaceChildren(...cifras.map((n,i) => {
      const nodo = lugar('span','digito',i);
      const rotulo = document.createElement('small');
      rotulo.className = 'abreviatura';
      rotulo.setAttribute('aria-hidden','true');
      nodo.append(rotulo);
      if(hueco === i) nodo.append(entrada(i,false));
      else {
        const cifra = document.createElement('span');
        cifra.className = 'glifo';
        cifra.textContent = n;
        nodo.append(cifra);
      }
      return nodo;
    }).reverse());
    rotularCifras();
    get('valores').replaceChildren(...cifras.map((n,i) => {
      const nodo = lugar('div','valor',i);
      const valor = direccion === 'valores' ? entrada(i,true) : document.createElement('span');
      valor.classList.add('dato-valor');
      if(direccion === 'cifra') valor.textContent = n * 10 ** i;
      const unidad = document.createElement('small');
      unidad.textContent = 'Unidades';
      nodo.append(valor,unidad);
      return nodo;
    }));
    teclado.seleccionar(tablero.querySelector('input'));
    requestAnimationFrame(dibujarLineas);
  }
  function rotularCifras() {
    const codigos = abreviaturas[IdiomaVoz.idioma === 'en' ? 1 : 0];
    get('cifras').setAttribute('aria-label', direccion === 'valores' ?
      bilingue(`Número ${numero}`,`Number ${numero}`) : t('Cifras del número'));
    for(const nodo of get('cifras').children){
      const rotulo = nodo.querySelector('.abreviatura');
      rotulo.textContent = codigos[Number(nodo.dataset.lugar)];
      rotulo.hidden = !opciones.ayudas;
    }
  }
  function dibujarLineas() {
    if(modo !== 'flechas') return;
    const rect = lineas.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    lineas.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    const trazos = cifras.map((_,i) => {
      const desde = get('cifras').querySelector(`[data-lugar="${i}"]`).getBoundingClientRect();
      const hasta = get('valores').children[i].querySelector('.dato-valor').getBoundingClientRect();
      const x = desde.left + desde.width/2 - rect.left, y = desde.bottom - rect.top;
      const finX = hasta.left - rect.left - 4, finY = hasta.top + hasta.height/2 - rect.top;
      const punta = direccion === 'valores'
        ? `M${finX-5} ${finY-4} L${finX} ${finY} L${finX-5} ${finY+4}`
        : `M${x-4} ${y+5} L${x} ${y} L${x+4} ${y+5}`;
      const trazo = document.createElementNS('http://www.w3.org/2000/svg','path');
      trazo.setAttribute('d', `M${x} ${y} V${finY} H${finX} ${punta}`);
      trazo.setAttribute('stroke',tonos[i]);
      return trazo;
    });
    lineas.replaceChildren(...trazos);
  }
  new ResizeObserver(dibujarLineas).observe(tablero);

  function actualizarRotulos() {
    get('tituloReto').textContent = t(modo === 'bloques' ? 'Bloques multibase' : 'Cifras y flechas');
    get('instruccion').textContent = instruccion();
    if(modo === 'bloques') get('numeroMeta').setAttribute('aria-label', bilingue(`Número por construir ${numero}`, `Number to build ${numero}`));
  }
  function siguiente() {
    sorpresas.cerrar();
    limpiarGesto();
    cancelarCanje();
    seleccionado = null;
    resuelto = false;
    const minimo = 10 ** (opciones.digitos-1);
    const cantidad = minimo*9;
    const nuevo = minimo + Math.floor(Math.random()*cantidad);
    numero = nuevo === numero ? minimo + (nuevo-minimo+1)%cantidad : nuevo;
    cifras = Array.from(String(numero)).reverse().map(Number);
    juego.style.setProperty('--lugares',cifras.length);
    piezas = cifras.map(() => 0);
    if(modo === 'flechas') {
      direccion = opciones.practica === 'ambas' ? (direccion === 'cifra' ? 'valores' : 'cifra') : opciones.practica;
      hueco = direccion === 'cifra' ? Math.floor(Math.random()*cifras.length) : null;
      dibujarDiagrama();
    } else dibujarBloques();
    get('revisar').hidden = get('revisar').disabled = false;
    get('siguiente').hidden = true;
    avisar();
    actualizarRotulos();
    if(opciones.narracion) escuchar();
  }
  function marcar(nodo, ok) {
    nodo.classList.toggle('correcta',ok);
    nodo.classList.toggle('incorrecta',!ok);
    nodo.setAttribute('aria-description', t(ok ? 'Respuesta correcta' : 'Respuesta incorrecta'));
    return ok;
  }
  function revisar() {
    if(resuelto || canje) return;
    const campos = [...tablero.querySelectorAll('input')];
    const pruebas = modo === 'bloques' ? [...bandejas.children].map(grupo => {
      const i = Number(grupo.dataset.lugar);
      return marcar(grupo, piezas[i] === cifras[i]);
    }) : campos.map(campo => {
      const caja = campo.parentElement;
      const i = Number(caja.dataset.lugar);
      const ok = /^\d+$/.test(campo.value) && Number(campo.value) === cifras[i] * (direccion === 'valores' ? 10 ** i : 1);
      campo.setAttribute('aria-invalid',String(!ok));
      return marcar(caja,ok);
    });
    if(!pruebas.every(Boolean)) {
      avisar(modo === 'bloques' ? 'Compara las bandejas marcadas con el número de arriba.' : 'Comprueba las casillas marcadas.');
      return;
    }
    resuelto = true;
    limpiarGesto();
    seleccionado = null;
    rotularBanco();
    for(const control of (modo === 'bloques' ? bandejas.querySelectorAll('button') : campos)) control.disabled = true;
    const nombre = window.NombreCompartido?.obtener();
    avisar(nombre ? bilingue(`¡Muy bien, ${nombre}!`,`Well done, ${nombre}!`) : '¡Muy bien!', true);
    get('revisar').hidden = true;
    get('siguiente').hidden = false;
    sorpresas.abrir(modo === 'bloques' ? get('bloques') : get('flechas'));
  }
  tablero.addEventListener('input', evento => {
    evento.target.removeAttribute('aria-invalid');
    evento.target.parentElement.classList.remove('correcta','incorrecta');
    evento.target.parentElement.removeAttribute('aria-description');
    avisar();
  });
  function mostrarModo(vista) {
    limpiarGesto();
    cancelarCanje();
    modo = vista;
    get('modos').hidden = Boolean(vista);
    juego.hidden = !vista;
    get('bloques').hidden = vista !== 'bloques';
    get('flechas').hidden = vista !== 'flechas';
    get('volver').hidden = get('nueva').hidden = !vista;
    sorpresas.cerrar();
    window.speechSynthesis?.cancel();
    if(vista) siguiente();
  }
  const historial = HistorialModos.crear(['bloques','flechas'],mostrarModo);
  get('modos').addEventListener('click', evento => {
    const boton = evento.target.closest('[data-modo]');
    if(boton) historial.ir(boton.dataset.modo);
  });
  get('volver').onclick = get('volverPlegado').onclick = historial.volver;
  get('nueva').onclick = get('siguiente').onclick = siguiente;
  get('revisar').onclick = revisar;
  get('escuchar').onclick = escuchar;
  new MutationObserver(() => { get('volverPlegado').hidden = !app.classList.contains('panel-lateral-oculto'); })
    .observe(app,{attributes:true,attributeFilter:['class']});

  get('abrirAjustes').onclick = () => {
    while(canje) completarCanje();
    get('digitos').value = opciones.digitos;
    get('practica').value = opciones.practica;
    get('ayudas').checked = opciones.ayudas;
    get('narracion').checked = opciones.narracion;
    IdiomaVoz.iniciarEdicion();
    dialogo.showModal();
  };
  dialogo.addEventListener('close', () => {
    const digitos = Number(get('digitos').value), practica = get('practica').value;
    const nueva = digitos !== opciones.digitos || (modo === 'flechas' && practica !== opciones.practica);
    const ayudas = get('ayudas').checked;
    Object.assign(opciones,{digitos,practica,ayudas,narracion:get('narracion').checked});
    Matematicas.guardar(clave,opciones);
    IdiomaVoz.aplicarEdicion();
    if(modo && nueva) siguiente();
    else if(modo) {
      for(const rotulo of bandejas.querySelectorAll('h3,small')) rotulo.hidden = !ayudas;
      rotularCifras();
      requestAnimationFrame(dibujarLineas);
    }
  });
  get('inicio').addEventListener('click', evento => {
    if(evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || !window.AppsFullscreen) return;
    evento.preventDefault();
    AppsFullscreen.navigate(get('inicio').href);
  });
  IdiomaVoz.instalar('#vozValor',{cambioIdioma:() => {
    sorpresas.localizar();
    if(!modo) return;
    actualizarRotulos();
    if(modo === 'bloques') {
      rotularBanco();
      for(const grupo of bandejas.children) rotularBandeja(grupo,Number(grupo.dataset.lugar));
    } else {
      rotularCifras();
      for(const campo of tablero.querySelectorAll('input')) {
        rotularEntrada(campo,Number(campo.parentElement.dataset.lugar),direccion === 'valores');
      }
    }
  }});
  Matematicas.pantalla(app, (_,zoom) => {
    const raiz = document.documentElement;
    raiz.style.setProperty('--ancho-valor',raiz.clientWidth/zoom+'px');
    app.style.setProperty('--alto-util',Math.min(raiz.clientHeight,visualViewport?.height || raiz.clientHeight)/zoom+'px');
    app.style.setProperty('--u',1/zoom+'px');
    app.classList.toggle('horizontal',raiz.clientWidth > raiz.clientHeight);
    requestAnimationFrame(dibujarLineas);
  });
  historial.restaurar();
})();
