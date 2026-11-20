(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const titulos = {exacta:'Reparto exacto', resto:'Reparto con resto', cajas:'Reparto en cajas'};
  Object.assign(window.TEXTOS_INGLES, {
    'Divide y reparte':'Divide and share', 'Modos de división':'Division modes', 'Nombre del niño':'Child’s name',
    'Ej.: Gabriel':'E.g. Gabriel', 'Todas las aplicaciones':'All apps', 'Así jugamos':'How to play',
    'Elige cómo quieres repartir las fichas.':'Choose how to share the counters.',
    'Reparto exacto':'Exact sharing', 'Reparto con resto':'Sharing with a remainder', 'Reparto en cajas':'Share into boxes',
    'Forma grupos iguales. Usa todas las fichas.':'Make equal groups. Use every counter.',
    'Forma grupos iguales y cuenta las fichas que sobran.':'Make equal groups and count the counters left over.',
    'Pon la misma cantidad de fichas en cada caja.':'Put the same number of counters in each box.',
    'Configuración general':'General settings', '⚙ Configuración general':'⚙ General settings',
    '⚙ Ajustes del modo':'⚙ Mode settings', 'Ajustes del modo':'Mode settings',
    '‹ Modos':'‹ Modes', 'Tablero para agrupar fichas':'Board for grouping counters',
    'Separar ficha':'Separate counter', 'Deshacer':'Undo', 'Fichas por repartir':'Counters to share',
    'Escribe la división.':'Write the division.', 'Dividendo':'Dividend', 'Divisor':'Divisor',
    'Cociente':'Quotient', 'Resto':'Remainder', 'Editar reparto':'Edit sharing',
    'Comprobar reparto':'Check sharing', 'Revisar división':'Check division', '↻ Nueva ronda':'↻ New round',
    'Leer instrucciones y comentarios':'Read instructions and feedback aloud',
    'Máximo de grupos o cajas':'Maximum groups or boxes', 'Máximo de fichas por grupo':'Maximum counters per group',
    'Tipo de reparto':'Sharing type', 'Solo exacto':'Exact only', 'Solo con resto':'With remainder only', 'Mixto':'Mixed',
    'Cómo unir las fichas':'How to join counters', 'Pasar sobre ellas':'Sweep over them',
    'Acercar y soltar':'Bring together and release', 'Marcar los grupos o cajas completos':'Mark complete groups or boxes',
    'Aplicar y cerrar':'Apply and close', 'Aplicar y volver':'Apply and return'
  });

  const clave = 'division.reparto.v1';
  const guardado = Matematicas.leer(clave);
  const ajustes = {
    narracion:guardado.narracion !== false,
    modos:Object.fromEntries(Object.keys(titulos).map(modo => {
      const anterior = guardado.modos?.[modo] ?? {};
      return [modo,{
        maxGrupos:[2,3,4,5].includes(anterior.maxGrupos) ? anterior.maxGrupos : 3,
        maxPorGrupo:[2,3,4,5].includes(anterior.maxPorGrupo) ? anterior.maxPorGrupo : 3,
        tipoCajas:['exacta','resto','mixto'].includes(anterior.tipoCajas) ? anterior.tipoCajas : 'exacta',
        metodo:anterior.metodo === 'soltar' ? 'soltar' : 'barrido',
        guiaGrupos:anterior.guiaGrupos === true
      }];
    }))
  };
  const app = $('appDivision'), espacio = $('espacioDivision'), dialogo = $('ajustes');
  const campos = ['dividendo','divisor','cociente','residuo'].map($);
  const repartosPrevios = new Map();
  let modo = null, ronda, fase, elegido = null, arrastre = null, ignorarClic = false;
  let fichasCajas = [], zonas = [];
  const formas = [
    {es:'estrella',en:'star',d:'M32 5 40 23 60 25 45 39 49 59 32 49 15 59 19 39 4 25 24 23Z',color:'#ffbf43',brillo:'#fff0aa',borde:'#bd7622'},
    {es:'rombo',en:'diamond',d:'M32 5 57 32 32 59 7 32Z',color:'#35cbb1',brillo:'#b5fae9',borde:'#218076'},
    {es:'hexágono',en:'hexagon',d:'M18 8H46L60 32 46 56H18L4 32Z',color:'#ad8dfa',brillo:'#e8d9ff',borde:'#7150c5'}
  ];
  function dibujarFicha({forma,id}) {
    const {d,color,brillo,borde} = forma;
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="ficha-${id}" x2="0" y2="1"><stop stop-color="${brillo}"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><path d="${d}" fill="url(#ficha-${id})" stroke="${borde}" stroke-width="3" stroke-linejoin="round"/><path d="M20 27 28 21" stroke="#fff" stroke-opacity=".75" stroke-linecap="round" stroke-width="3"/></svg>`;
  }

  const magneticos = new GruposMagneticos({
    plano:$('plano'), separar:$('separar'), deshacer:$('deshacer'), svgFigura:dibujarFicha, t,
    alCambiar:actualizarConteo, alAvisar:mensajeDirecto
  });

  function hablar(texto) {
    if (ajustes.narracion) IdiomaVoz.hablar(texto);
  }

  function mensajeDirecto(texto, estado = '') {
    $('mensaje').textContent = texto;
    $('mensaje').dataset.estado = estado;
  }

  function crearRonda() {
    const config = ajustes.modos[modo];
    let tipo = modo === 'cajas' ? config.tipoCajas : modo;
    if (tipo === 'mixto') tipo = Math.random() < .5 ? 'exacta' : 'resto';
    const opciones = [];
    for (let divisor = 2; divisor <= config.maxGrupos; divisor++) {
      for (let cociente = 2; cociente <= config.maxPorGrupo; cociente++) {
        const restos = tipo === 'exacta' ? [0] : Array.from({length:divisor - 1}, (_, i) => i + 1);
        for (const resto of restos) opciones.push({divisor,cociente,resto,total:divisor*cociente+resto});
      }
    }
    const anteriores = repartosPrevios.get(modo);
    const distintas = opciones.filter(r => !anteriores || r.total !== anteriores.total || r.divisor !== anteriores.divisor);
    const opcionesDisponibles = distintas.length ? distintas : opciones;
    const reparto = opcionesDisponibles[Math.floor(Math.random() * opcionesDisponibles.length)];
    repartosPrevios.set(modo,reparto);
    return {...reparto,forma:formas[Math.floor(Math.random() * formas.length)]};
  }

  function enunciado() {
    const {total,divisor,resto} = ronda;
    if (modo === 'cajas') return t(
      `Reparte ${total} fichas en ${divisor} cajas. Pon la misma cantidad en cada una.${resto ? ' Deja las que sobren afuera.' : ''}`,
      `Share ${total} counters among ${divisor} boxes. Put the same number in each box.${resto ? ' Leave any extras outside.' : ''}`);
    return t(
      `Forma ${divisor} grupos iguales con ${total} fichas.${resto ? ' Deja sueltas las que sobren.' : ' Usa todas las fichas.'}`,
      `Make ${divisor} equal groups from ${total} counters.${resto ? ' Leave any extras loose.' : ' Use every counter.'}`);
  }

  function actualizarTextos() {
    $('configDivision').textContent = IdiomaVoz.t(modo ? '⚙ Ajustes del modo' : '⚙ Configuración general');
    $('ayudasDivision').hidden = !modo || !ajustes.narracion;
    $('guia').textContent = !modo ? IdiomaVoz.t('Elige cómo quieres repartir las fichas.') : modo === 'cajas'
      ? t('Arrastra una ficha a una caja. También puedes tocar la ficha y luego la caja.', 'Drag a counter into a box. You can also tap the counter, then the box.')
      : ajustes.modos[modo].metodo === 'barrido'
        ? t('Arrastra una ficha sobre otras para unirlas. Suelta para dejar el grupo.', 'Drag a counter over other counters to join them. Release to leave the group.')
        : t('Acerca una ficha a las demás y suéltala para unirlas.', 'Bring a counter near the others and release it to join them.');
    if (!modo) return;
    $('modoActual').textContent = IdiomaVoz.t(titulos[modo]);
    $('pregunta').textContent = enunciado();
    if (modo === 'cajas') pintarCajas();
    else {
      magneticos.nombreFigura = t(ronda.forma.es,ronda.forma.en);
      magneticos.pintar();
      actualizarConteo();
    }
    actualizarFase();
  }

  function actualizarFase() {
    $('respuesta').hidden = fase === 'repartir';
    $('campoResto').hidden = !ronda.resto;
    $('editarReparto').hidden = fase !== 'escribir';
    $('revisar').textContent = IdiomaVoz.t(fase === 'repartir' ? 'Comprobar reparto' : 'Revisar división');
    $('revisar').disabled = fase === 'listo';
    for (const campo of campos) campo.readOnly = fase === 'listo';
  }

  function iniciarRonda() {
    cancelarArrastre();
    magneticos.cancelar();
    fase = 'repartir';
    ronda = crearRonda();
    espacio.scrollTop = 0;
    $('grupoDivision').hidden = modo === 'cajas';
    $('cajasDivision').hidden = modo !== 'cajas';
    for (const campo of campos) {
      campo.value = '';
      campo.removeAttribute('aria-invalid');
    }
    mensajeDirecto('');
    const fichas = Array.from({length:ronda.total}, (_, id) => ({id,forma:ronda.forma}));
    if (modo === 'cajas') {
      $('plano').querySelector('.nodos-grupos').replaceChildren();
      crearCajas(fichas);
    } else {
      const config = ajustes.modos[modo];
      magneticos.iniciar(fichas,ronda.cociente,{ayuda:config.guiaGrupos,metodo:config.metodo,nombreFigura:t(ronda.forma.es,ronda.forma.en)});
    }
    actualizarTextos();
    hablar(enunciado());
  }

  function actualizarConteo() {
    if (!modo || modo === 'cajas') return;
    const grupos = magneticos.componentes();
    const unidos = grupos.filter(g => g.length > 1).length;
    const sueltas = grupos.length - unidos;
    $('conteoGrupos').textContent = t(`Grupos de dos o más: ${unidos} · Sueltas: ${sueltas}`, `Groups of two or more: ${unidos} · Loose: ${sueltas}`);
  }

  function crearCajas(fichas) {
    elegido = null;
    $('fichasCajas').replaceChildren();
    const cajas = Array.from({length:ronda.divisor}, (_, i) => {
      const caja = document.createElement('section');
      caja.className = 'zona-caja caja-destino';
      caja.dataset.destino = i;
      caja.innerHTML = `<div class="cabecera-caja"><button type="button" data-soltar="${i}"></button><span></span></div><div class="contenido-caja"></div>`;
      return caja;
    });
    $('destinos').replaceChildren(...cajas);
    zonas = [$('fichasCajas').closest('.zona-caja'),...cajas];
    fichasCajas = fichas.map(ficha => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'ficha-caja';
      boton.dataset.ficha = ficha.id;
      boton.innerHTML = dibujarFicha(ficha);
      $('fichasCajas').append(boton);
      return {boton,destino:-1};
    });
  }

  function pintarCajas() {
    if (!zonas.length) return;
    for (const [i,zona] of zonas.entries()) {
      const contenido = zona.querySelector('.contenido-caja');
      const cantidad = contenido.childElementCount;
      zona.querySelector('.cabecera-caja span').textContent = String(cantidad);
      const boton = zona.querySelector('[data-soltar]');
      if (i) boton.textContent = t(`Caja ${i}`,`Box ${i}`);
      boton.setAttribute('aria-label', t(i ? `Caja ${i}, fichas: ${cantidad}` : `Fichas por repartir: ${cantidad}`,i ? `Box ${i}, counters: ${cantidad}` : `Counters to share: ${cantidad}`));
      boton.disabled = fase !== 'repartir';
      zona.classList.toggle('completa',i > 0 && ajustes.modos.cajas.guiaGrupos && cantidad === ronda.cociente);
    }
    for (const [id,{boton,destino}] of fichasCajas.entries()) {
      boton.setAttribute('aria-pressed',String(elegido === id));
      boton.setAttribute('aria-label',t(`Ficha ${id+1}${destino < 0 ? ', por repartir' : `, en la caja ${destino+1}`}`,`Counter ${id+1}${destino < 0 ? ', to share' : `, in box ${destino+1}`}`));
      boton.disabled = fase !== 'repartir';
    }
  }

  function colocarFicha(id,destino) {
    const ficha = fichasCajas[id], zona = zonas[destino+1];
    if (!ficha || !zona || fase !== 'repartir') return;
    ficha.destino = destino;
    zona.querySelector('.contenido-caja').append(ficha.boton);
    elegido = null;
    mensajeDirecto('');
    pintarCajas();
  }

  const cajasDivision = $('cajasDivision');
  cajasDivision.addEventListener('click',event => {
    if (ignorarClic || fase !== 'repartir') return;
    const ficha = event.target.closest('[data-ficha]'), zona = event.target.closest('[data-destino]');
    if (ficha) {
      const id = Number(ficha.dataset.ficha);
      elegido = elegido === id ? null : id;
      pintarCajas();
    } else if (zona && elegido !== null) colocarFicha(elegido,Number(zona.dataset.destino));
  });
  cajasDivision.addEventListener('pointerdown',event => {
    const ficha = event.target.closest('[data-ficha]');
    if (!ficha || event.button !== 0 || !event.isPrimary || fase !== 'repartir' || arrastre) return;
    arrastre = {ficha,id:event.pointerId,x:event.clientX,y:event.clientY};
    ficha.setPointerCapture(event.pointerId);
  });

  function zonaEn(x,y) { return document.elementFromPoint(x,y)?.closest('#cajasDivision [data-destino]'); }
  function marcarZona(gesto) {
    const zona = zonaEn(gesto.ultimo.x,gesto.ultimo.y);
    for (const caja of zonas) caja.classList.toggle('destino-activo',caja === zona);
  }
  function desplazarCajas(gesto) {
    if (arrastre !== gesto) return;
    const vista = espacio.getBoundingClientRect(), {x,y} = gesto.ultimo;
    if (x >= vista.left && x <= vista.right) {
      const paso = y > vista.bottom - 30 ? 6 : y < vista.top + 30 ? -6 : 0;
      if (paso) {
        espacio.scrollTop += paso / Matematicas.escala();
        marcarZona(gesto);
      }
    }
    gesto.frame = requestAnimationFrame(() => desplazarCajas(gesto));
  }
  cajasDivision.addEventListener('pointermove',event => {
    const gesto = arrastre;
    if (gesto?.id !== event.pointerId) return;
    gesto.ultimo = {x:event.clientX,y:event.clientY};
    if (!gesto.fantasma) {
      if (Math.hypot(event.clientX-gesto.x,event.clientY-gesto.y) < 6) return;
      const fantasma = document.createElement('span');
      fantasma.className = 'fantasma-division';
      fantasma.innerHTML = gesto.ficha.innerHTML.replaceAll(/(?:ficha-)(\d+)/g,'fantasma-ficha-$1');
      fantasma.setAttribute('aria-hidden','true');
      document.body.append(fantasma);
      gesto.ficha.classList.add('alzada');
      gesto.fantasma = fantasma;
      gesto.frame = requestAnimationFrame(() => desplazarCajas(gesto));
    }
    Matematicas.fantasma(gesto.fantasma,event.clientX,event.clientY);
    marcarZona(gesto);
  });

  function cancelarArrastre() {
    const gesto = arrastre;
    if (!gesto) return;
    arrastre = null;
    cancelAnimationFrame(gesto.frame);
    gesto.fantasma?.remove();
    gesto.ficha.classList.remove('alzada');
    if (gesto.ficha.hasPointerCapture(gesto.id)) gesto.ficha.releasePointerCapture(gesto.id);
    for (const caja of zonas) caja.classList.remove('destino-activo');
  }
  cajasDivision.addEventListener('pointerup',event => {
    const gesto = arrastre;
    if (gesto?.id !== event.pointerId) return;
    const zona = gesto.fantasma && zonaEn(event.clientX,event.clientY);
    if (gesto.fantasma) {
      ignorarClic = true;
      setTimeout(() => {ignorarClic = false;},0);
    }
    cancelarArrastre();
    if (zona) colocarFicha(Number(gesto.ficha.dataset.ficha),Number(zona.dataset.destino));
  });
  for (const tipo of ['pointercancel','lostpointercapture']) cajasDivision.addEventListener(tipo,event => {
    if (arrastre?.id === event.pointerId) cancelarArrastre();
  });

  function comprobarReparto() {
    if (arrastre || (modo !== 'cajas' && (magneticos.arrastre || magneticos.movimiento))) return;
    const {divisor,cociente,resto} = ronda;
    const grupos = modo === 'cajas' ? zonas.slice(1).map(z => z.querySelector('.contenido-caja').childElementCount) : magneticos.componentes();
    const juntos = modo === 'cajas' ? grupos : grupos.filter(g => g.length > 1).map(g => g.length);
    const sueltas = modo === 'cajas' ? $('fichasCajas').childElementCount : grupos.length - juntos.length;
    let error = '';
    if (juntos.length !== divisor) error = t(`Necesitas formar ${divisor} grupos.`,`You need to make ${divisor} groups.`);
    else if (!juntos[0] || juntos.some(n => n !== juntos[0])) error = t('Pon la misma cantidad de fichas en cada grupo.', 'Put the same number of counters in each group.');
    else if (sueltas !== resto || juntos.some(n => n !== cociente)) error = resto
      ? t('Intenta repartir una ficha más a cada grupo mientras alcance para todos.', 'Try adding one more counter to each group while there are enough for every group.')
      : t('Reparte también las fichas que aún están sueltas.', 'Share the counters that are still loose too.');

    if (error) {
      mensajeDirecto(error,'intenta');
      hablar(error);
      return;
    }
    fase = 'escribir';
    if (modo === 'cajas') pintarCajas();
    else magneticos.bloquear();
    actualizarFase();
    const bien = resto
      ? t('El reparto es equitativo. Las fichas que sobran no alcanzan para dar una más a cada grupo.', 'You shared equally. There are not enough leftover counters to give one more to each group.')
      : t('¡El reparto es equitativo! Ahora escribe la división.', 'You shared equally! Now write the division.');
    mensajeDirecto(bien,'bien');
    hablar(bien);
  }

  function revisarDivision() {
    const {total,divisor,cociente,resto} = ronda;
    const esperados = [total,divisor,cociente,...(resto ? [resto] : [])];
    const errores = esperados.map((valor,i) => !/^\d+$/.test(campos[i].value) || Number(campos[i].value) !== valor);
    for (const [i,error] of errores.entries()) campos[i].setAttribute('aria-invalid',String(error));
    if (errores.some(Boolean)) {
      const texto = t(
        `Revisa las casillas marcadas. Cuenta las fichas, los grupos y cuántas hay en cada grupo.${resto ? ' Incluye las que sobran en el resto.' : ''}`,
        `Check the marked boxes. Count the counters, the groups and how many are in each group.${resto ? ' Write any leftovers as the remainder.' : ''}`);
      mensajeDirecto(texto,'intenta');
      hablar(texto);
      return;
    }
    fase = 'listo';
    actualizarFase();
    const nombre = NombreCompartido.obtener();
    const felicitacion = nombre ? t(`¡Muy bien, ${nombre}!`,`Well done, ${nombre}!`) : t('¡Muy bien!', 'Well done!');
    const ecuacion = `${total} ÷ ${divisor} = ${cociente}${resto ? t(`, resto ${resto}`, `, remainder ${resto}`) : ''}`;
    mensajeDirecto(`${felicitacion} ${ecuacion}`,'bien');
    hablar(t(`${felicitacion} ${total} dividido entre ${divisor} es ${cociente}.${resto ? ` Sobran ${resto}.` : ''}`,`${felicitacion} ${total} divided by ${divisor} is ${cociente}.${resto ? ` The remainder is ${resto}.` : ''}`));
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $('respuesta').animate([{transform:'scale(1)'},{transform:'scale(1.025)'},{transform:'scale(1)'}],{duration:470,easing:'ease-out'});
    }
  }

  function irAModos() {
    cancelarArrastre();
    magneticos.cancelar();
    window.speechSynthesis?.cancel();
    modo = null;
    $('juego').hidden = true;
    $('modos').hidden = false;
    actualizarTextos();
  }
  $('volverModos').onclick = irAModos;
  $('nuevaRonda').onclick = iniciarRonda;
  $('escuchar').onclick = () => hablar(enunciado());
  $('revisar').onclick = () => {
    if (fase === 'repartir') comprobarReparto();
    else if (fase === 'escribir') revisarDivision();
  };
  $('respuesta').onsubmit = event => {event.preventDefault();if(fase === 'escribir')revisarDivision();};
  for (const campo of campos) campo.addEventListener('input', () => {
    campo.value = campo.value.replace(/\D/g,'');
    campo.removeAttribute('aria-invalid');
  });
  $('editarReparto').onclick = () => {
    fase = 'repartir';
    if (modo === 'cajas') pintarCajas();
    else {magneticos.resuelto = false;magneticos.actualizar();}
    actualizarFase();
    mensajeDirecto('');
  };
  $('modos').addEventListener('click',event => {
    const tarjeta = event.target.closest('[data-modo]');
    if (!tarjeta) return;
    modo = tarjeta.dataset.modo;
    $('modos').hidden = true;
    $('juego').hidden = false;
    iniciarRonda();
  });

  $('configDivision').onclick = () => {
    cancelarArrastre();
    magneticos.cancelar();
    $('ajustesGenerales').hidden = Boolean(modo);
    $('ajustesModo').hidden = !modo;
    $('tituloAjustes').textContent = IdiomaVoz.t(modo ? 'Ajustes del modo' : 'Configuración general');
    if (modo) {
      const config = ajustes.modos[modo];
      for (const id of ['maxGrupos','maxPorGrupo','tipoCajas','metodo']) $(id).value = config[id];
      $('guiaGrupos').checked = config.guiaGrupos;
      $('campoTipo').hidden = modo !== 'cajas';
      $('campoMetodo').hidden = modo === 'cajas';
    } else {
      $('narracion').checked = ajustes.narracion;
      IdiomaVoz.iniciarEdicion();
    }
    dialogo.showModal();
  };
  function aplicarAjustes() {
    let cambiaRonda = false;
    if (modo) {
      const antes = ajustes.modos[modo];
      const despues = {maxGrupos:+$('maxGrupos').value,maxPorGrupo:+$('maxPorGrupo').value,
        tipoCajas:$('tipoCajas').value,metodo:$('metodo').value,guiaGrupos:$('guiaGrupos').checked};
      cambiaRonda = Object.keys(despues).some(k => despues[k] !== antes[k]);
      ajustes.modos[modo] = despues;
    } else {
      ajustes.narracion = $('narracion').checked;
      IdiomaVoz.aplicarEdicion();
    }
    Matematicas.guardar(clave,ajustes);
    dialogo.close();
    if (cambiaRonda) iniciarRonda();
    else actualizarTextos();
  }
  $('aplicarAjustes').onclick = $('cerrarAjustes').onclick = aplicarAjustes;
  dialogo.addEventListener('cancel',event => {event.preventDefault();aplicarAjustes();});
  dialogo.addEventListener('click',event => {if(event.target === dialogo)aplicarAjustes();});

  IdiomaVoz.instalar('#preferenciasDivision',{cambioIdioma:actualizarTextos});
  const ajustar = Matematicas.pantalla(app,(_,z) => {
    const {clientWidth:w,clientHeight:h} = document.documentElement;
    const altoVisible = Math.min(h,window.visualViewport?.height ?? h);
    app.style.setProperty('--alto-util',altoVisible/z+'px');
    app.style.setProperty('--iz',String(1/z));
    app.classList.toggle('horizontal',w>h);
    if (modo && modo !== 'cajas') magneticos.adaptar();
    cancelarArrastre();
  });
  new ResizeObserver(ajustar).observe(espacio);
  actualizarTextos();
})();
