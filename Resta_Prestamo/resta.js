(() => {
  'use strict';

  // Cada préstamo suma diez en esta posición y uno al sustraendo de la siguiente.
  function calcularColumnas(minuendo, sustraendo) {
    const columnas = [];
    let saldo = 0;
    do {
      const arriba = minuendo % 10;
      const abajo = sustraendo % 10;
      const quitar = abajo + saldo;
      const presta = arriba < quitar;
      columnas.push({arriba, abajo, quitar, presta, resultado: arriba + (presta ? 10 : 0) - quitar});
      saldo = Number(presta);
      minuendo = Math.floor(minuendo / 10);
      sustraendo = Math.floor(sustraendo / 10);
    } while (minuendo || sustraendo);
    return columnas;
  }

  const get = id => document.getElementById(id);
  const app = get('appRestaPrestamo'), dialogo = get('configuracion');
  const efectos = get('efectos'), operacion = get('operacion');
  const clave = 'resta-prestamo-abajo.v1';
  const opciones = ['siemprePrestamo','guia','animacion','narracion'];
  const guardado = Matematicas.leer(clave);
  const config = {
    cifras:[2,3,4,5,6].includes(guardado.cifras) ? guardado.cifras : 2,
    siemprePrestamo:guardado.siemprePrestamo !== false,
    guia:guardado.guia !== false,
    animacion:guardado.animacion !== false,
    narracion:guardado.narracion === true
  };
  const posiciones = [
    ['U','Unidades','O','Ones'],['D','Decenas','T','Tens'],['C','Centenas','H','Hundreds'],
    ['UM','Unidades de millar','Th','Thousands'],['DM','Decenas de millar','TTh','Ten thousands'],
    ['CM','Centenas de millar','HTh','Hundred thousands']
  ];
  const en = (es, english) => IdiomaVoz.idioma === 'en' ? english : es;
  const nombrePosicion = indice => en(posiciones[indice][1], posiciones[indice][3]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let ronda, ultimo, columna, elegido, prestados, respuestas, fase, aviso;
  let celdaArriba = [], celdaAbajo = [];
  const actual = () => ronda.columnas[columna];
  const listo = () => columna >= ronda.columnas.length;

  function generar() {
    const min = 10 ** (config.cifras - 1);
    for (let intento = 0; intento < 40; intento++) {
      const a = min + Math.floor(Math.random() * min * 9);
      const b = 1 + Math.floor(Math.random() * a);
      const columnas = calcularColumnas(a,b);
      if (a === ultimo?.a && b === ultimo.b) continue;
      if (!config.siemprePrestamo || columnas.some(c => c.presta)) return {a,b,columnas};
    }
    const b = ultimo?.a === min && ultimo.b === 1 ? 2 : 1;
    return {a:min,b,columnas:calcularColumnas(min,b)};
  }

  function iniciar(ejemplo = false) {
    const nueva = ejemplo ? {a:45,b:28,columnas:calcularColumnas(45,28)} : generar();
    ronda = {...nueva,ejemplo};
    if (!ejemplo) ultimo = nueva;
    efectos.replaceChildren();
    columna = 0;
    elegido = null;
    respuestas = [];
    prestados = new Set();
    fase = null;
    aviso = null;
    render();
    leer();
  }
  function textoPaso() {
    if (listo()) {
      const nombre = window.NombreCompartido?.obtener();
      return nombre ? en(`¡Bien hecho, ${nombre}!`, `Well done, ${nombre}!`) : en('¡Bien hecho!', 'Well done!');
    }
    const {arriba,quitar,presta} = actual();
    if (fase === 'sube') return en('Toma 1 de la columna siguiente de abajo. Aquí equivale a 10.', 'Take 1 from below in the next column. It is worth 10 here.');
    if (fase === 'vuelve') return en('Devuelve 1 al número de abajo de la columna siguiente.', 'Add 1 to the bottom number in the next column.');
    if (!(ronda.ejemplo || config.guia)) return en('Resuelve esta columna.', 'Solve this column.');
    if (presta && !prestados.has(columna)) return en(
      `${arriba} es menor que ${quitar}. Pulsa Pedir prestado.`,
      `${arriba} is smaller than ${quitar}. Tap Borrow.`);
    const superior = arriba + (prestados.has(columna) ? 10 : 0);
    return en(`¿Cuánto es ${superior} menos ${quitar}?`, `What is ${superior} minus ${quitar}?`);
  }
  function leer(manual = false) {
    if (manual || config.narracion) IdiomaVoz.hablar(textoPaso());
  }
  function valorCelda(tipo, valor, etiqueta, ajuste = '') {
    const celda = document.createElement('div');
    celda.className = 'digito ' + tipo + (ajuste ? ' ajustado' : '');
    celda.setAttribute('aria-label', etiqueta);
    const numero = document.createElement('span');
    numero.className = 'numero';
    numero.textContent = valor;
    celda.append(numero);
    if (ajuste) {
      const insignia = document.createElement('span');
      insignia.className = 'ajuste';
      insignia.textContent = ajuste;
      insignia.setAttribute('aria-hidden','true');
      celda.append(insignia);
    }
    return celda;
  }
  function renderOperacion() {
    operacion.replaceChildren();
    operacion.style.setProperty('--cantidad',ronda.columnas.length);
    const signos = document.createElement('div');
    signos.className = 'signos';
    signos.setAttribute('aria-hidden','true');
    signos.innerHTML = '<span class="menos">−</span><span class="raya"></span>';
    operacion.append(signos);
    ronda.columnas.forEach((c,i) => {
      const grupo = document.createElement('div');
      grupo.className = 'columna' + (i === columna ? ' activa' : '');
      grupo.dataset.columna = i;
      const rotulo = document.createElement('span');
      rotulo.className = 'rotulo';
      rotulo.textContent = en(posiciones[i][0],posiciones[i][2]);
      rotulo.title = nombrePosicion(i);
      const prestado = prestados.has(i) || (i === columna && fase === 'vuelve');
      const regresado = prestados.has(i-1);
      const arriba = c.arriba + (prestado ? 10 : 0);
      const abajo = c.abajo + (regresado ? 1 : 0);
      const respuesta = respuestas[i] ?? (i === columna ? elegido : null);
      celdaArriba[i] = valorCelda('arriba',arriba,en(`Arriba, ${nombrePosicion(i)}: ${arriba}`,`Top, ${nombrePosicion(i)}: ${arriba}`),prestado?'+10':'');
      celdaAbajo[i] = valorCelda('abajo',abajo,en(`Abajo, ${nombrePosicion(i)}: ${abajo}`,`Bottom, ${nombrePosicion(i)}: ${abajo}`),regresado?'+1':'');
      celdaAbajo[i].classList.toggle('prestamista',Boolean(fase) && i === columna+1);
      const raya = document.createElement('div');
      raya.className = 'raya';
      const caja = valorCelda('respuesta' + (i < columna?' correcta':''),respuesta ?? (i === columna?'?':''),
        en(`Resultado, ${nombrePosicion(i)}: ${respuesta ?? 'pendiente'}`,`Answer, ${nombrePosicion(i)}: ${respuesta ?? 'pending'}`));
      grupo.append(rotulo,celdaArriba[i],celdaAbajo[i],raya,caja);
      signos.after(grupo);
    });
  }
  function render() {
    const terminado = listo();
    renderOperacion();
    get('progreso').textContent = terminado ? en('Resta completa','Subtraction complete') :
      `${nombrePosicion(columna)} · ${columna+1}/${ronda.columnas.length}`;
    get('indicacion').textContent = textoPaso();
    get('estado').textContent = aviso?.texto || '';
    get('estado').classList.toggle('error',Boolean(aviso?.error));
    get('resultado').hidden = !terminado;
    get('resultado').textContent = terminado ? `${ronda.a} − ${ronda.b} = ${ronda.a-ronda.b}` : '';
    get('prestamo').disabled = Boolean(fase) || terminado || prestados.has(columna);
    get('revisar').disabled = Boolean(fase) || terminado || elegido === null;
    get('revisar').hidden = terminado;
    get('nueva').classList.toggle('principal',terminado);
    for (const tecla of get('teclado').children) {
      tecla.disabled = Boolean(fase) || terminado;
      tecla.setAttribute('aria-pressed',String(Number(tecla.dataset.valor) === elegido));
    }
  }
  function seleccionar(digito) {
    if (fase || listo()) return;
    elegido = digito;
    aviso = null;
    render();
  }
  function error(texto) {
    aviso = {texto,error:true};
    render();
    if (config.narracion) IdiomaVoz.hablar(texto);
  }
  function revisar() {
    if (fase || listo() || elegido === null) return;
    const c = actual();
    if (c.presta&&!prestados.has(columna)) return error(en('En esta columna primero necesitas pedir prestado.','Borrow first in this column.'));
    if (elegido !== c.resultado) return error(en('Revisa esta columna y prueba otro número.','Check this column and try a different number.'));
    respuestas[columna++] = elegido;
    elegido = null;
    aviso = listo() ? null : {texto:en('¡Correcto! Sigue con la columna siguiente.','Correct! Move to the next column.')};
    render();
    leer();
    if (listo()) {
      celebrar();
      get('nueva').focus({preventScroll:true});
    }
  }
  async function moverFicha(desde,hacia,texto,devuelto=false) {
    if (!config.animacion || reduce.matches) return;
    const a=desde.getBoundingClientRect(),b=hacia.getBoundingClientRect();
    const ficha=document.createElement('span');
    ficha.className='ficha-vuelo'+(devuelto?' devuelto':'');
    ficha.textContent=texto;
    ficha.style.left=(a.left+a.width/2)+'px';
    ficha.style.top=(a.top+a.height/2)+'px';
    efectos.append(ficha);
    const vuelo=ficha.animate([
      {transform:'translate(-50%,-50%) scale(.75)',opacity:.45},
      {transform:`translate(calc(-50% + ${(b.left+b.width/2)-(a.left+a.width/2)}px),calc(-50% + ${(b.top+b.height/2)-(a.top+a.height/2)}px)) scale(1.08)`,opacity:1}
    ],{duration:720,easing:'cubic-bezier(.32,.75,.3,1)',fill:'forwards'});
    await vuelo.finished.catch(()=>{});
    ficha.remove();
  }
  async function pedirPrestado() {
    if (fase || listo() || prestados.has(columna)) return;
    if (!actual().presta) return error(en('Aquí puedes restar sin pedir prestado.','You can subtract here without borrowing.'));
    const iniciada = ronda, i = columna;
    elegido = null;
    aviso = null;
    fase = 'sube';
    render();
    leer();
    await moverFicha(celdaAbajo[i+1],celdaArriba[i],'+10');
    if (ronda !== iniciada) return;
    fase = 'vuelve';
    render();
    leer();
    await moverFicha(celdaArriba[i],celdaAbajo[i+1],'+1',true);
    if (ronda !== iniciada) return;
    prestados.add(i);
    fase = null;
    aviso = {texto:en(`Al número de abajo en ${nombrePosicion(i+1).toLowerCase()} se le sumó 1.`,
      `1 was added to the bottom number in the ${nombrePosicion(i+1).toLowerCase()} column.`)};
    render();
    leer();
  }

  function celebrar() {
    if (reduce.matches) return;
    const r = get('resultado').getBoundingClientRect();
    const colores = ['#7b49d8','#df4776','#208365','#ed9823','#3d75d3'];
    for (let i=0;i<18;i++) {
      const estrella = document.createElement('span');
      const angulo = i*Math.PI/9;
      const radio = 54+(i%4)*22;
      estrella.className = 'estrella';
      estrella.textContent = '✦';
      Object.assign(estrella.style,{left:r.left+r.width/2+'px',top:r.top+'px',color:colores[i%colores.length]});
      efectos.append(estrella);
      estrella.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:1},
        {transform:`translate(${Math.cos(angulo)*radio}px,${Math.sin(angulo)*radio}px) rotate(100deg)`,opacity:0}],
        {duration:1000,easing:'ease-out'}).finished.then(()=>estrella.remove(),()=>estrella.remove());
    }
  }

  for (const digito of [1,2,3,4,5,6,7,8,9,0]) {
    const tecla = document.createElement('button');
    tecla.type = 'button';
    tecla.dataset.valor = digito;
    tecla.textContent = digito;
    tecla.onclick = () => seleccionar(digito);
    get('teclado').append(tecla);
  }
  get('prestamo').onclick = pedirPrestado;
  get('revisar').onclick = revisar;
  get('nueva').onclick = () => iniciar();
  get('ejemplo').onclick = () => iniciar(true);
  get('escuchar').onclick = () => leer(true);
  get('inicio').addEventListener('click', e => {
    if (e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||!window.AppsFullscreen) return;
    e.preventDefault();
    AppsFullscreen.navigate(get('inicio').href);
  });
  document.addEventListener('keydown', e => {
    if (dialogo.open || e.target.matches('input,select,button') || !/^[0-9]$/.test(e.key)) return;
    seleccionar(Number(e.key));
  });
  get('ajustes').onclick = () => {
    get('cifras').value = config.cifras;
    for (const id of opciones) get(id).checked = config[id];
    IdiomaVoz.iniciarEdicion();
    dialogo.showModal();
  };
  dialogo.addEventListener('close', () => {
    const cifras = Number(get('cifras').value);
    const soloPrestamo = get('siemprePrestamo').checked;
    const otraRonda = cifras !== config.cifras || soloPrestamo !== config.siemprePrestamo;
    config.cifras = cifras;
    for (const id of opciones) config[id] = get(id).checked;
    Matematicas.guardar(clave,config);
    IdiomaVoz.aplicarEdicion();
    if (otraRonda) iniciar();
    else { aviso=null; render(); leer(); }
  });
  IdiomaVoz.instalar('#idiomaResta');
  Matematicas.pantalla(app, (_, zoom) => {
    const root = document.documentElement;
    app.style.setProperty('--u',1/zoom+'px');
    document.body.style.setProperty('--ancho-resta',root.clientWidth/zoom+'px');
    app.classList.toggle('horizontal',root.clientWidth>root.clientHeight);
  });
  iniciar(!guardado.cifras);
})();
