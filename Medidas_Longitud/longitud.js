(() => {
  'use strict';

  const get = id => document.getElementById(id);
  const t = text => IdiomaVoz.t(text);
  const esEn = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const app = get('appLongitud');
  const juego = get('juego');
  const plano = get('plano');
  const escena = get('escena');
  const regla = get('regla');
  const campos = get('campos');
  const respuestasObjetos = get('respuestasObjetos');
  const teclado = get('tecladoMedidas');
  const entradaNumerica = TecladoEnPantalla.instalar(juego, teclado);
  const resultado = get('resultado');
  const ajustes = get('ajustes');
  const clave = 'medidas-longitud.v1';
  const guardado = Matematicas.leer(clave);
  const opciones = {cantidad: guardado.cantidad === 2 ? 2 : 3, extremos: guardado.extremos !== false, narracion: guardado.narracion !== false};

  const anchoPlano = 360;
  const unidad = 16;
  const colores = ['#008f8a', '#7559db', '#dc631e'];
  const materiales = {lapiz: 'Lápiz', cinta: 'Cinta', poste: 'Poste'};
  const titulos = {medir: 'Mide los objetos', diferencia: '¿Cuánto más largo?', estimar: 'Estima y elige'};
  const letras = ['A', 'B', 'C'];
  const centroRegla = [120, 22];
  const posicion = {x: 0, y: 0, angulo: 0};
  let ronda, modo, arrastre, seleccion, evaluado, altoPlano;

  const aleatorio = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  function mezclar(valores) {
    for (let i = valores.length - 1; i > 0; i--) {
      const j = aleatorio(0, i);
      [valores[i], valores[j]] = [valores[j], valores[i]];
    }
    return valores;
  }
  function crearRonda() {
    const cantidad = modo === 'diferencia' ? 2 : opciones.cantidad;
    const tipo = mezclar(Object.keys(materiales))[0];
    const vertical = modo === 'diferencia' && tipo === 'poste';
    const orden = modo === 'estimar' ? (ronda?.modo === 'estimar' ? -ronda.orden : Math.random() < .5 ? -1 : 1) : 0;
    const medirVertical = modo === 'medir' && cantidad === 2 && Math.random() < .5;
    const angulos = aleatorio(0, 1) ? [-15, 0, 30] : [15, 0, -30];
    let valores;
    if (modo === 'diferencia') {
      const menor = aleatorio(4, 8);
      valores = mezclar([menor, menor + aleatorio(2, 5)]);
    } else if (modo === 'estimar') {
      const base = aleatorio(4, 7);
      valores = mezclar([base + .3, base + 2.6, base + 5.4].slice(0, cantidad));
    } else {
      valores = mezclar([4, 5, 6, 7, 8, 9, 10, 11, 12, 13]).slice(0, cantidad);
      if (medirVertical) valores[0] = aleatorio(4, 8);
    }
    const objetos = valores.map((valor, i) => {
      const largo = valor * unidad;
      const objeto = {valor, largo, tipo, letra: letras[i], color: colores[i]};
      if (vertical) return {...objeto, x: 114 + i * 105, y: 253, angulo: -90};
      if (modo === 'diferencia') return {...objeto, x: 65, y: 64 + i * 67, angulo: 0};
      if (medirVertical && i === 0) return {...objeto, x: 62, y: 143, angulo: -90};
      const angulo = medirVertical ? 0 : cantidad === 2 && i === 1 ? angulos[2] : angulos[i];
      const medio = rotar(largo / 2, 0, angulo);
      return {
        ...objeto,
        x: (medirVertical ? 170 : 181) - medio.x,
        y: (medirVertical ? 171 : cantidad === 2 ? 65 + i * 94 : 49 + i * 84) - medio.y,
        angulo
      };
    });
    const valoresOrdenados = [...valores].sort((a, b) => a - b);
    const objetivo = orden === -1 ? valoresOrdenados[0] : valoresOrdenados.at(-1);
    return {modo, objetos, vertical, orden, objetivo, menor: valoresOrdenados[0], mayor: valoresOrdenados.at(-1)};
  }

  function rotar(x, y, angulo) {
    const radianes = angulo * Math.PI / 180;
    const coseno = Math.cos(radianes);
    const seno = Math.sin(radianes);
    return {x: x * coseno - y * seno, y: x * seno + y * coseno};
  }
  function dibujarRegla() {
    // Deja sobresalir los extremos al medir junto al borde y conserva el centro al alcance.
    const centro = rotar(...centroRegla, posicion.angulo);
    posicion.x = Math.min(anchoPlano - 20, Math.max(20, posicion.x + centro.x)) - centro.x;
    posicion.y = Math.min(altoPlano - 20, Math.max(20, posicion.y + centro.y)) - centro.y;
    regla.style.transform = `translate(${posicion.x}px, ${posicion.y}px) rotate(${posicion.angulo}deg)`;
  }
  function centrarRegla() {
    Object.assign(posicion, {x: 51, y: altoPlano - 52, angulo: 0});
    dibujarRegla();
  }
  function adaptarEscena() {
    if (juego.hidden) return;
    const escala = Math.min(escena.clientWidth / anchoPlano, escena.clientHeight / altoPlano);
    plano.style.setProperty('--escala-escena', escala);
  }
  function graduarRegla() {
    get('graduacion').replaceChildren(...Array.from({length: 16}, (_, numero) => {
      const marca = document.createElement('span');
      marca.className = 'marca';
      marca.style.left = numero * unidad + 'px';
      const rotulo = document.createElement('span');
      rotulo.textContent = numero;
      marca.append(rotulo);
      return marca;
    }));
  }

  function puntoEnPlano(evento) {
    const rect = plano.getBoundingClientRect();
    const escala = rect.width / anchoPlano;
    return {x: (evento.clientX - rect.left) / escala, y: (evento.clientY - rect.top) / escala};
  }
  function giroSobre(punto, angulo) {
    posicion.angulo = angulo;
    const pivote = rotar(...centroRegla, angulo);
    posicion.x = punto.x - pivote.x;
    posicion.y = punto.y - pivote.y;
    dibujarRegla();
  }
  function centroActual() {
    const pivote = rotar(...centroRegla, posicion.angulo);
    return {x: posicion.x + pivote.x, y: posicion.y + pivote.y};
  }
  function anguloPuntero(punto, centro) {
    return Math.atan2(punto.y - centro.y, punto.x - centro.x) * 180 / Math.PI;
  }
  function comenzarArrastre(evento) {
    if (arrastre || evento.button !== 0) return;
    evento.preventDefault();
    regla.setPointerCapture(evento.pointerId);
    const punto = puntoEnPlano(evento);
    const giro = evento.target.closest('#giro');
    const centro = centroActual();
    arrastre = {
      id: evento.pointerId, giro, centro,
      x: punto.x - posicion.x, y: punto.y - posicion.y,
      ajuste: posicion.angulo - anguloPuntero(punto, centro)
    };
  }
  function moverArrastre(evento) {
    if (arrastre?.id !== evento.pointerId) return;
    const punto = puntoEnPlano(evento);
    if (arrastre.giro) {
      giroSobre(arrastre.centro, anguloPuntero(punto, arrastre.centro) + arrastre.ajuste);
      return;
    }
    posicion.x = punto.x - arrastre.x;
    posicion.y = punto.y - arrastre.y;
    dibujarRegla();
  }
  function terminarArrastre(evento) {
    if (arrastre?.id !== evento.pointerId) return;
    if (arrastre.giro && evento.type === 'pointerup') {
      const cercano = Math.round(posicion.angulo / 15) * 15;
      if (Math.abs(cercano - posicion.angulo) < 3) giroSobre(centroActual(), cercano);
    }
    arrastre = null;
  }
  function ajustarConTeclado(evento) {
    const movimientos = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    const movimiento = movimientos[evento.key];
    if (movimiento) {
      evento.preventDefault();
      const paso = evento.shiftKey ? 1 : 8;
      posicion.x += paso * movimiento[0];
      posicion.y += paso * movimiento[1];
      dibujarRegla();
    } else if (evento.key === '[' || evento.key === ']') {
      evento.preventDefault();
      giroSobre(centroActual(), posicion.angulo + (evento.key === '[' ? -15 : 15));
    }
  }

  function redactarPregunta() {
    if (modo === 'medir') return esEn('Mide cada objeto en centímetros y escribe las medidas.', 'Measure each object in centimetres and write its length.');
    if (modo === 'diferencia') return ronda.vertical ?
      esEn('¿Cuántos centímetros más alto es el poste más alto? Mide los dos desde la base.', 'How many centimetres taller is the taller post? Measure both from the bottom.') :
      esEn('¿Cuántos centímetros más largo es el objeto más largo? Mide los dos desde el mismo extremo.', 'How many centimetres longer is the longer object? Measure both from the same end.');
    return ronda.orden === -1 ?
      esEn('¿Cuál es el más corto? Mira los objetos o compáralos con la regla.', 'Which is the shortest? Look at the objects or compare them with the ruler.') :
      esEn('¿Cuál es el más largo? Mira los objetos o compáralos con la regla.', 'Which is the longest? Look at the objects or compare them with the ruler.');
  }
  function dibujarObjetos() {
    get('objetos').replaceChildren(...ronda.objetos.map(objeto => {
      const pieza = document.createElement('div');
      pieza.className = 'objeto';
      pieza.dataset.letra = objeto.letra;
      pieza.setAttribute('role', 'img');
      pieza.setAttribute('aria-label', `${t(materiales[objeto.tipo])} ${objeto.letra}`);
      pieza.style.cssText = `width:${objeto.largo}px;transform:translate(${objeto.x}px,${objeto.y}px) rotate(${objeto.angulo}deg);--rotulo:${-objeto.angulo}deg;--relleno:${objeto.color};`;
      pieza.innerHTML = `<span class="forma ${objeto.tipo}"></span><span class="letra-objeto">${objeto.letra}</span>`;
      if (opciones.extremos && modo !== 'estimar') pieza.insertAdjacentHTML('beforeend', '<i class="extremo"></i><i class="extremo"></i>');
      return pieza;
    }));
  }
  function camposNumericos() {
    function campo(claveCampo, rotulo) {
      return `<label class="campo">${rotulo}
        <input name="${claveCampo}" aria-label="${claveCampo === 'diferencia' ? t('Diferencia') : t('Medida del objeto') + ' ' + claveCampo}" type="text" inputmode="none" readonly data-campo-teclado maxlength="2" form="respuesta">
        <span>cm</span>
      </label>`;
    }
    if (modo === 'diferencia') campos.innerHTML = campo('diferencia', `<span>${t('Diferencia')}</span>`);
    else {
      respuestasObjetos.innerHTML = ronda.objetos.map(({letra, color}) =>
        campo(letra, `<span class="letra-respuesta" style="--color-respuesta:${color}">${letra}</span>`)
      ).join('');
    }
    entradaNumerica.seleccionar(juego.querySelector('[data-campo-teclado]'));
  }
  function opcionesEstimacion() {
    campos.innerHTML = ronda.objetos.map(({letra}) => `<label class="opcion"><input type="radio" name="estimacion" value="${letra}"><span>${letra}</span></label>`).join('');
  }
  function hablar(texto) {
    if (opciones.narracion) IdiomaVoz.hablar(texto);
  }
  function cargarRonda(leer = true) {
    ronda = crearRonda();
    seleccion = null;
    evaluado = false;
    altoPlano = ronda.vertical || ronda.objetos.length === 3 ? 315 : 253;
    plano.style.setProperty('--alto-plano', altoPlano + 'px');
    get('tituloReto').textContent = t(titulos[modo]);
    get('pregunta').textContent = redactarPregunta();
    get('revisar').hidden = false;
    get('siguiente').hidden = true;
    resultado.textContent = '';
    resultado.classList.remove('exito');
    dibujarObjetos();
    campos.replaceChildren();
    respuestasObjetos.replaceChildren();
    teclado.hidden = modo === 'estimar';
    if (modo === 'estimar') opcionesEstimacion();
    else camposNumericos();
    adaptarEscena();
    centrarRegla();
    if (leer) hablar(redactarPregunta());
  }
  function mostrarDiferencia() {
    const objetos = get('objetos');
    for (const objeto of ronda.objetos) {
      const guia = document.createElement('span');
      guia.className = ronda.vertical ? 'guia-diferencia vertical' : 'guia-diferencia';
      guia.setAttribute('aria-hidden', 'true');
      guia.style.cssText = ronda.vertical ?
        `left:${objeto.x + 10}px;top:${objeto.y - objeto.largo}px;width:${242 - objeto.x}px` :
        `left:${objeto.x + objeto.largo}px;top:${objeto.y + 10}px;height:${146 - objeto.y}px`;
      objetos.append(guia);
    }
    const diferencia = document.createElement('div');
    diferencia.className = 'diferencia';
    const largo = (ronda.mayor - ronda.menor) * unidad;
    if (ronda.vertical) {
      diferencia.classList.add('diferencia-vertical');
      diferencia.style.cssText = `left:252px;top:${253 - ronda.mayor * unidad}px;height:${largo}px`;
    } else {
      diferencia.style.cssText = `left:${65 + ronda.menor * unidad}px;top:156px;width:${largo}px`;
    }
    diferencia.innerHTML = `<span>${ronda.mayor - ronda.menor} cm</span>`;
    objetos.append(diferencia);
  }
  function revisar(evento) {
    evento.preventDefault();
    if (evaluado) return;
    let mensaje = '';
    if (modo === 'estimar') {
      if (!seleccion) {
        resultado.textContent = esEn('Elige un objeto.', 'Choose an object.');
        campos.querySelector('input').focus();
        return;
      }
      const objeto = ronda.objetos.find(pieza => pieza.letra === seleccion);
      evaluado = objeto.valor === ronda.objetivo;
      const etiqueta = campos.querySelector('input:checked').parentElement;
      etiqueta.classList.toggle('correcto', evaluado);
      etiqueta.classList.toggle('incorrecto', !evaluado);
      if (evaluado) mensaje = ronda.orden === -1 ? esEn(`${seleccion} es el más corto.`, `${seleccion} is the shortest.`) : esEn(`${seleccion} es el más largo.`, `${seleccion} is the longest.`);
    } else {
      const entradas = [...juego.querySelectorAll('[data-campo-teclado]')];
      const falta = entradas.find(entrada => !/^\d{1,2}$/.test(entrada.value.trim()));
      if (falta) {
        resultado.textContent = esEn('Escribe una medida en cada espacio.', 'Write a measurement in each box.');
        falta.focus();
        return;
      }
      const valoresCorrectos = modo === 'medir' ? ronda.objetos.map(objeto => objeto.valor) : [ronda.mayor - ronda.menor];
      evaluado = entradas.map((entrada, i) => {
        const correcto = Number(entrada.value) === valoresCorrectos[i];
        entrada.parentElement.classList.toggle('correcto', correcto);
        entrada.parentElement.classList.toggle('incorrecto', !correcto);
        entrada.setAttribute('aria-invalid', String(!correcto));
        return correcto;
      }).every(Boolean);
      if (evaluado && modo === 'diferencia') {
        mostrarDiferencia();
        mensaje = `${ronda.mayor} − ${ronda.menor} = ${valoresCorrectos[0]} cm`;
      }
    }
    const nombre = window.NombreCompartido?.obtener();
    const elogio = nombre ? esEn(`¡Muy bien, ${nombre}!`, `Great job, ${nombre}!`) : esEn('¡Muy bien!', 'Great job!');
    resultado.classList.toggle('exito', evaluado);
    resultado.textContent = evaluado ? [elogio, mensaje].filter(Boolean).join(' ') :
      modo === 'estimar' ? esEn('Compara de nuevo los dos extremos.', 'Compare both ends again.') :
        esEn('Revisa las medidas marcadas. ¿El 0 quedó en el extremo?', 'Check the marked measurements. Did you line up the 0 with the end?');
    if (evaluado) {
      campos.querySelectorAll('input').forEach(entrada => { entrada.disabled = true; });
      respuestasObjetos.querySelectorAll('input').forEach(entrada => { entrada.disabled = true; });
      teclado.hidden = true;
      get('revisar').hidden = true;
      get('siguiente').hidden = false;
      get('siguiente').focus({preventScroll:true});
    }
    if (evaluado && modo === 'diferencia') {
      hablar(esEn(`${elogio} La diferencia es de ${ronda.mayor - ronda.menor} centímetros.`, `${elogio} The difference is ${ronda.mayor - ronda.menor} centimetres.`));
    } else hablar(resultado.textContent);
  }
  function iniciar(nuevoModo) {
    modo = nuevoModo;
    get('modos').hidden = true;
    juego.hidden = false;
    cargarRonda();
    get('volver').focus({preventScroll:true});
  }

  function volverModos() {
    const tarjeta = get('modos').querySelector(`[data-modo="${modo}"]`);
    if (ajustes.open) ajustes.close();
    modo = null;
    ronda = null;
    window.speechSynthesis?.cancel();
    juego.hidden = true;
    get('modos').hidden = false;
    tarjeta?.focus({preventScroll:true});
  }
  const historial = HistorialModos.crear(Object.keys(titulos), vista => vista ? iniciar(vista) : volverModos());
  get('modos').addEventListener('click', evento => {
    const tarjeta = evento.target.closest('[data-modo]');
    if (tarjeta) historial.ir(tarjeta.dataset.modo);
  });
  get('volver').addEventListener('click', historial.volver);
  get('escuchar').addEventListener('click', () => IdiomaVoz.hablar(redactarPregunta()));
  get('respuesta').addEventListener('submit', revisar);
  get('siguiente').addEventListener('click', () => {
    cargarRonda();
    regla.focus({preventScroll:true});
  });
  juego.addEventListener('input', evento => {
    if (evaluado || !evento.target.matches('#campos input, #respuestasObjetos input')) return;
    resultado.textContent = '';
    if (evento.target.type === 'radio') {
      seleccion = evento.target.value;
      campos.querySelectorAll('.opcion').forEach(opcion => opcion.classList.remove('incorrecto'));
      get('objetos').querySelectorAll('.objeto').forEach(pieza => pieza.classList.toggle('elegido', pieza.dataset.letra === seleccion));
    } else {
      evento.target.value = evento.target.value.replace(/\D/g, '').slice(0, 2);
      evento.target.removeAttribute('aria-invalid');
      evento.target.parentElement.classList.remove('correcto', 'incorrecto');
    }
  });
  get('giroIzquierdo').addEventListener('click', () => giroSobre(centroActual(), posicion.angulo - 15));
  get('giroDerecho').addEventListener('click', () => giroSobre(centroActual(), posicion.angulo + 15));
  get('giro').addEventListener('click', evento => {
    if (evento.detail === 0) giroSobre(centroActual(), posicion.angulo + 15);
  });
  get('resetRegla').addEventListener('click', centrarRegla);
  regla.addEventListener('keydown', ajustarConTeclado);
  regla.addEventListener('pointerdown', comenzarArrastre);
  regla.addEventListener('pointermove', moverArrastre);
  for (const evento of ['pointerup', 'pointercancel', 'lostpointercapture']) regla.addEventListener(evento, terminarArrastre);
  get('inicio').addEventListener('click', evento => {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || !window.AppsFullscreen) return;
    evento.preventDefault();
    AppsFullscreen.navigate(get('inicio').href);
  });
  get('abrirAjustes').addEventListener('click', () => {
    get('cantidad').value = opciones.cantidad;
    get('extremos').checked = opciones.extremos;
    get('narracion').checked = opciones.narracion;
    IdiomaVoz.iniciarEdicion();
    ajustes.showModal();
  });
  ajustes.addEventListener('close', () => {
    const cantidad = Number(get('cantidad').value);
    const extremos = get('extremos').checked;
    const idioma = IdiomaVoz.idioma;
    const cambiarCantidad = cantidad !== opciones.cantidad && modo && modo !== 'diferencia';
    const cambiarExtremos = extremos !== opciones.extremos;
    Object.assign(opciones, {cantidad, extremos, narracion: get('narracion').checked});
    Matematicas.guardar(clave, opciones);
    IdiomaVoz.aplicarEdicion();
    if (!modo) return;
    if (cambiarCantidad || idioma !== IdiomaVoz.idioma) cargarRonda();
    else if (cambiarExtremos && modo !== 'estimar') {
      dibujarObjetos();
      if (evaluado && modo === 'diferencia') mostrarDiferencia();
    }
  });

  graduarRegla();
  IdiomaVoz.instalar('#vozLongitud');
  Matematicas.pantalla(app, (_, zoom) => {
    const root = document.documentElement;
    root.style.setProperty('--ancho-longitud', root.clientWidth / zoom + 'px');
    app.style.setProperty('--alto-util', Math.min(root.clientHeight, visualViewport?.height || root.clientHeight) / zoom + 'px');
    app.classList.toggle('horizontal', root.clientWidth > root.clientHeight);
    app.style.setProperty('--u', 1 / zoom + 'px');
  });
  new ResizeObserver(adaptarEscena).observe(escena);
  historial.restaurar();
})();
