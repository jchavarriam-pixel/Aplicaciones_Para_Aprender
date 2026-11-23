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
    'Construye el número con los botones + y −.':'Build the number with the + and − buttons.',
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
  const lineas = get('lineas');
  const teclado = TecladoEnPantalla.instalar(juego, get('teclado'));
  const efectos = new EfectosTablas(get('celebracionValor'));
  const nombres = ['Unidades','Decenas','Centenas','Millares'];
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
  const observador = new ResizeObserver(entradas => {
    for (const {target} of entradas) pintarCanvas(target);
  });
  function pintarCanvas(canvas) {
    const lugar = Number(canvas.dataset.lugar);
    BloquesMultibase.pintar(canvas, lugar, canvas.classList.contains('piezas') ? piezas[lugar] : 1);
  }
  [...document.querySelectorAll('.arte-bloques canvas')].forEach((canvas,i) => {
    canvas.dataset.lugar = 2-i;
    observador.observe(canvas);
  });

  function instruccion() {
    if(modo === 'bloques') return t('Construye el número con los botones + y −.');
    return t(direccion === 'valores' ? 'Sigue las flechas y escribe cuánto vale cada cifra.' :
      'Mira los valores y escribe la cifra que falta.');
  }
  function escuchar() {
    let lectura = instruccion();
    if(modo === 'bloques') lectura += ' ' + numero + '.';
    else if(direccion === 'valores') lectura += ' ' + cifras.slice().reverse().join(', ') + '.';
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
    canvas.setAttribute('aria-label', `${t(nombres[i])}: ${cantidad}`);
    pintarCanvas(canvas);
    for(const boton of bandeja.querySelectorAll('button')) {
      const delta = Number(boton.dataset.delta);
      boton.disabled = resuelto || (delta < 0 ? cantidad === 0 : cantidad === 9);
      boton.setAttribute('aria-label', bilingue(
        `${delta > 0 ? 'Añadir' : 'Quitar'} un bloque de ${nombres[i].toLowerCase()}`,
        `${delta > 0 ? 'Add' : 'Remove'} one ${t(nombres[i]).toLowerCase()} block`));
    }
  }
  function dibujarBloques() {
    for(const canvas of bandejas.querySelectorAll('canvas')) observador.unobserve(canvas);
    bandejas.dataset.cantidad = cifras.length;
    get('numeroMeta').textContent = numero;
    bandejas.replaceChildren(...cifras.map((_,i) => {
      const grupo = lugar('section','bandeja',i);
      grupo.innerHTML = `<header class="rotulo-bandeja"><canvas aria-hidden="true"></canvas><h3></h3><small></small></header>
        <canvas class="piezas" role="img"></canvas>
        <div class="ajustar-piezas"><button type="button" data-delta="-1">−</button><button type="button" data-delta="1">+</button></div>`;
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
  bandejas.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-delta]');
    if(!boton || resuelto || boton.disabled) return;
    const grupo = boton.closest('.bandeja'), i = Number(grupo.dataset.lugar);
    piezas[i] += Number(boton.dataset.delta);
    grupo.classList.remove('correcta','incorrecta');
    grupo.removeAttribute('aria-description');
    rotularBandeja(grupo, i);
    avisar();
  });

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
      if(hueco === i) nodo.append(entrada(i,false));
      else nodo.textContent = n;
      return nodo;
    }).reverse());
    get('valores').replaceChildren(...cifras.map((n,i) => {
      const nodo = lugar('div','valor',i);
      if(direccion === 'valores') nodo.append(entrada(i,true));
      else {
        const valor = document.createElement('span');
        valor.textContent = n * 10 ** i;
        nodo.append(valor);
      }
      if(opciones.ayudas){
        const rotulo = document.createElement('small');
        rotulo.textContent = nombres[i];
        nodo.prepend(rotulo);
      }
      return nodo;
    }));
    teclado.seleccionar(tablero.querySelector('input'));
    requestAnimationFrame(dibujarLineas);
  }
  function dibujarLineas() {
    if(modo !== 'flechas') return;
    const rect = lineas.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    lineas.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    const trazos = cifras.map((_,i) => {
      const desde = get('cifras').querySelector(`[data-lugar="${i}"]`).getBoundingClientRect();
      const hasta = get('valores').children[i].getBoundingClientRect();
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
    efectos.detener();
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
    if(resuelto) return;
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
    for(const control of (modo === 'bloques' ? bandejas.querySelectorAll('button') : campos)) control.disabled = true;
    const nombre = window.NombreCompartido?.obtener();
    avisar(nombre ? bilingue(`¡Muy bien, ${nombre}!`,`Well done, ${nombre}!`) : '¡Muy bien!', true);
    get('revisar').hidden = true;
    get('siguiente').hidden = false;
    get('siguiente').focus({preventScroll:true});
    efectos.canones(false);
  }
  tablero.addEventListener('input', evento => {
    evento.target.removeAttribute('aria-invalid');
    evento.target.parentElement.classList.remove('correcta','incorrecta');
    evento.target.parentElement.removeAttribute('aria-description');
    avisar();
  });
  function mostrarModo(vista) {
    modo = vista;
    get('modos').hidden = Boolean(vista);
    juego.hidden = !vista;
    get('bloques').hidden = vista !== 'bloques';
    get('flechas').hidden = vista !== 'flechas';
    get('volver').hidden = get('nueva').hidden = !vista;
    efectos.detener();
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
      for(const valor of get('valores').children) {
        let rotulo = valor.querySelector('small');
        if(!rotulo && ayudas) {
          rotulo = document.createElement('small');
          rotulo.textContent = nombres[Number(valor.dataset.lugar)];
          valor.prepend(rotulo);
        }
        if(rotulo) rotulo.hidden = !ayudas;
      }
      requestAnimationFrame(dibujarLineas);
    }
  });
  get('inicio').addEventListener('click', evento => {
    if(evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || !window.AppsFullscreen) return;
    evento.preventDefault();
    AppsFullscreen.navigate(get('inicio').href);
  });
  IdiomaVoz.instalar('#vozValor',{cambioIdioma:() => {
    if(!modo) return;
    actualizarRotulos();
    if(modo === 'bloques') {
      for(const grupo of bandejas.children) rotularBandeja(grupo,Number(grupo.dataset.lugar));
    } else {
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
