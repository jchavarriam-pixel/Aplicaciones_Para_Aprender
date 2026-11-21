/* Ábaco libre con orientación opcional para la columna activa. */
Object.assign(window.TEXTOS_INGLES ||= {}, {
  '🧮 Ábaco': '🧮 Abacus',
  'Ábaco': 'Abacus',
  'Mover el ábaco con las flechas': 'Move the abacus with the arrow keys',
  'Arrastra para mover el ábaco': 'Drag to move the abacus',
  'Cerrar ábaco': 'Close abacus',
  'Ayuda del ábaco': 'Abacus hints',
  'Tamaño del ábaco': 'Abacus size',
  'Libre': 'Free play',
  'Intermedio': 'Intermediate',
  'Paso a paso': 'Step by step',
  'Pequeño': 'Small',
  'Mediano': 'Medium',
  'Grande': 'Large',
  'Cuentas del ábaco': 'Abacus beads'
});

window.AbacoOperaciones = (() => {
  'use strict';
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const modos = ['libre','intermedio','guiado'];
  const anchos = {pequeno:276, mediano:342, grande:426};
  const distribuir = n => [Math.min(n,10),Math.max(0,n-10)];

  function instalar(boton, obtenerOperacion, clave = 'operaciones.abaco.v1') {
    const configuracion = document.createElement('fieldset');
    configuracion.className = 'ajustes-abaco-operaciones';
    configuracion.innerHTML = `
      <legend>Ábaco</legend>
      <label>Ayuda del ábaco
        <select id="modoAbacoFlotante">
          <option value="libre">Libre</option>
          <option value="intermedio">Intermedio</option>
          <option value="guiado">Paso a paso</option>
        </select>
      </label>
      <label>Tamaño del ábaco
        <select id="tamanoAbacoFlotante">
          <option value="pequeno">Pequeño</option>
          <option value="mediano">Mediano</option>
          <option value="grande">Grande</option>
        </select>
      </label>`;
    const selectorModo = configuracion.querySelector('#modoAbacoFlotante');
    const selectorTamano = configuracion.querySelector('#tamanoAbacoFlotante');

    const panel = document.createElement('aside');
    panel.id = 'abaco-flotante';
    panel.hidden = true;
    panel.setAttribute('aria-labelledby','tituloAbacoFlotante');
    panel.innerHTML = `
      <header>
        <button type="button" class="mover-abaco" aria-label="Mover el ábaco con las flechas" title="Arrastra para mover el ábaco">
          <span aria-hidden="true">✥</span> <strong id="tituloAbacoFlotante">Ábaco</strong>
        </button>
        <button type="button" data-abaco="cerrar" aria-label="Cerrar ábaco" title="Cerrar ábaco">✕</button>
      </header>
      <div class="interior-abaco">
        <div data-abaco="tablero" role="group" aria-label="Cuentas del ábaco"></div>
        <p data-abaco="mensaje" role="status" data-no-traducir></p>
      </div>`;
    document.body.append(panel);
    const tablero = panel.querySelector('[data-abaco="tablero"]');
    const mensaje = panel.querySelector('[data-abaco="mensaje"]');
    const filas = AbacoCuentas.crear(tablero,2);
    const rotulos = filas.map(({elemento}) => {
      const rotulo = document.createElement('span');
      rotulo.className = 'rotulo-fila-abaco';
      elemento.append(rotulo);
      return rotulo;
    });
    const guardado = Matematicas.leer(clave);
    let modo = modos.includes(guardado.modo) ? guardado.modo : 'guiado';
    let tamano = Object.hasOwn(anchos,guardado.tamano) ? guardado.tamano : 'pequeno';
    let cantidades = [0,0], operacion, firma, filaBase = null, restaPreparada = false;

    function orientacion() {
      const metas = [...cantidades];
      const rotulosFila = ['',''];
      if (!operacion) return {metas,rotulosFila,texto:''};
      const {signo,m,n,prestamo} = operacion;
      const total = cantidades[0] + cantidades[1];
      let texto;

      if (signo === '+') {
        let fila = filaBase ?? 0;
        if (total === m && cantidades.includes(m)) filaBase = fila = cantidades.indexOf(m);
        const unaFila = total === m+n && cantidades.includes(total);
        const mismaFila = (filaBase !== null && cantidades[fila] > m && cantidades[1-fila] === 0) || unaFila;
        if (unaFila) fila = cantidades.indexOf(total);
        rotulosFila[fila] = mismaFila ? `${m} + ${n}` : String(m);
        if (!mismaFila) rotulosFila[1-fila] = `+ ${n}`;

        const dosFilas = cantidades.includes(m) && cantidades.includes(n);
        const conservaInicio = filaBase !== null && cantidades[filaBase] >= m;
        if (total === m+n && (unaFila || dosFilas || conservaInicio)) {
          texto = n ? t(`Cuenta a partir de ${m}.`, `Count on from ${m}.`)
            : t(`Ya tienes ${m}.`, `You already have ${m}.`);
        } else if (conservaInicio) {
          const faltan = m+n-total;
          if (faltan < 0) texto = t('Quita las cuentas de más.', 'Take away the extra beads.');
          else {
            texto = faltan < n ? t(`Añade ${faltan} más.`, `Add ${faltan} more.`) : m+n <= 10
              ? t(`Añade ${n} en esta fila o en la otra.`, `Add ${n} on this row or the other row.`)
              : t(`Añade ${n} en la otra fila.`, `Add ${n} on the other row.`);
            const preferida = mismaFila && m+n <= 10 ? fila : 1-fila;
            const agregar = Math.min(faltan,10-cantidades[preferida]);
            metas[preferida] += agregar;
            metas[1-preferida] += faltan-agregar;
          }
        } else {
          texto = t(`Pon ${m} en la primera fila.`, `Put ${m} on the first row.`);
          metas[0] = m;
          metas[1] = 0;
        }
      } else {
        rotulosFila[0] = `${m} − ${n}`;
        if (prestamo) {
          texto = t(`Pide prestado para quitar ${n}.`, `Borrow to take away ${n}.`);
        } else {
          const inicio = distribuir(m);
          if (total === m && cantidades.every((cantidad,i) => cantidad === inicio[i])) restaPreparada = true;
          if (!restaPreparada || total > m || cantidades.some((cantidad,i) => cantidad > inicio[i])) {
            texto = m <= 10 ? t(`Pon ${m} en la primera fila.`, `Put ${m} on the first row.`)
              : t(`Pon 10 arriba y ${m-10} abajo.`, `Put 10 on top and ${m-10} below.`);
            metas[0] = inicio[0];
            metas[1] = inicio[1];
          } else if (total === m-n) {
            texto = t('Cuenta las que quedan.', 'Count the beads left.');
          } else if (total < m-n) {
            texto = t('Quitaste de más. Devuelve algunas.', 'You took away too many. Put some back.');
          } else {
            const faltan = total-(m-n), abajo = Math.min(faltan,cantidades[1]);
            texto = t(`Quita ${faltan} hacia la derecha.`, `Move ${faltan} to the right.`);
            metas[1] -= abajo;
            metas[0] -= faltan-abajo;
          }
        }
      }
      return {metas,rotulosFila,texto};
    }

    function pintarFila(fila) {
      AbacoCuentas.pintar(filas[fila],fila,cantidades[fila],t,() => true);
    }

    function pintar() {
      const {metas,rotulosFila,texto} = orientacion();
      filas.forEach(({cuentas},fila) => {
        pintarFila(fila);
        const [inicio,fin] = [metas[fila],cantidades[fila]].sort((a,b) => a-b);
        cuentas.forEach((cuenta,indice) => cuenta.classList.toggle('objetivo-abaco',modo === 'guiado' && indice >= inicio && indice < fin));
        rotulos[fila].textContent = rotulosFila[fila];
      });
      mensaje.textContent = modo === 'libre' ? '' : texto;
    }

    const cancelarCuentas = AbacoCuentas.conectar(tablero,{
      filas:() => filas, cantidad:fila => cantidades[fila], puedeMover:() => true, pintarFila,
      cambiarFila(fila,valor) { cantidades[fila] = valor; pintar(); }
    });

    function actualizar(nuevaRonda = false) {
      operacion = obtenerOperacion();
      const nuevaFirma = JSON.stringify(operacion);
      if (nuevaRonda || nuevaFirma !== firma) {
        cancelarCuentas();
        filaBase = null;
        restaPreparada = false;
        if (modo !== 'libre') cantidades = [0,0];
        firma = nuevaFirma;
        pintar();
      }
    }

    const ajustar = posicionarAbaco(panel,cancelarCuentas,() => anchos[tamano]);
    function mostrar(visible) {
      panel.hidden = !visible;
      boton.setAttribute('aria-expanded',visible);
      if (visible) {
        actualizar();
        pintar();
        panel.querySelector('.mover-abaco').focus({preventScroll:true});
      } else {
        cancelarCuentas();
        boton.focus({preventScroll:true});
      }
    }
    boton.setAttribute('aria-controls',panel.id);
    boton.setAttribute('aria-expanded','false');
    boton.onclick = () => mostrar(panel.hidden);
    panel.querySelector('[data-abaco="cerrar"]').onclick = () => mostrar(false);
    panel.addEventListener('keydown',evento => {
      if (evento.key === 'Escape') { evento.preventDefault(); mostrar(false); }
    });
    document.addEventListener('operacion-cambiada',evento => actualizar(evento.detail?.nuevaRonda));
    return {
      configuracion,
      prepararConfiguracion() { selectorModo.value = modo; selectorTamano.value = tamano; },
      aplicarConfiguracion() {
        modo = selectorModo.value;
        tamano = selectorTamano.value;
        Matematicas.guardar(clave,{modo,tamano});
        pintar();
        ajustar();
      },
      localizar:pintar
    };
  }

  function posicionarAbaco(panel, cancelarCuentas, anchoPreferido) {
    const mover = panel.querySelector('.mover-abaco');
    const margen = 8;
    let posicion, arrastre;

    function ubicar(x, y) {
      const rect = panel.getBoundingClientRect();
      const vista = window.visualViewport;
      const ancho = Math.min(document.documentElement.clientWidth, vista?.width ?? innerWidth);
      const alto = Math.min(document.documentElement.clientHeight, vista?.height ?? innerHeight);
      const izquierda = vista?.offsetLeft ?? 0, arriba = vista?.offsetTop ?? 0;
      panel.style.left = Math.max(izquierda + margen, Math.min(x, izquierda + ancho - rect.width - margen)) + 'px';
      panel.style.top = Math.max(arriba + margen, Math.min(y, arriba + alto - rect.height - margen)) + 'px';
    }

    function ajustar() {
      if (panel.hidden) return;
      panel.style.zoom = String(1 / Matematicas.escala());
      const vista = window.visualViewport;
      const ancho = Math.min(document.documentElement.clientWidth, vista?.width ?? innerWidth);
      const alto = Math.min(document.documentElement.clientHeight, vista?.height ?? innerHeight);
      panel.style.width = Math.min(anchoPreferido(), ancho - 2 * margen) + 'px';
      panel.style.maxHeight = Math.max(0, alto - 2 * margen) + 'px';
      const x = posicion?.x ?? (innerWidth > innerHeight ? margen : ancho - panel.offsetWidth - margen);
      ubicar(x, posicion?.y ?? 54);
    }

    mover.addEventListener('pointerdown', e => {
      if (!e.isPrimary || e.button !== 0) return;
      const {left, top} = panel.getBoundingClientRect();
      arrastre = {id: e.pointerId, x: e.clientX - left, y: e.clientY - top};
      mover.setPointerCapture(e.pointerId);
    });
    mover.addEventListener('pointermove', e => {
      if (arrastre?.id !== e.pointerId) return;
      const x = e.clientX - arrastre.x, y = e.clientY - arrastre.y;
      ubicar(x, y);
      const {left, top} = panel.getBoundingClientRect();
      posicion = {x: left, y: top};
    });
    mover.addEventListener('lostpointercapture', () => { arrastre = null; });
    mover.addEventListener('keydown', e => {
      const delta = {ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16]}[e.key];
      if (!delta) return;
      e.preventDefault();
      const {left, top} = panel.getBoundingClientRect();
      ubicar(left + delta[0], top + delta[1]);
      const rect = panel.getBoundingClientRect();
      posicion = {x: rect.left, y: rect.top};
    });
    new MutationObserver(ajustar).observe(panel, {attributes: true, attributeFilter: ['hidden']});
    new ResizeObserver(ajustar).observe(panel);
    const adaptar = () => { cancelarCuentas(); ajustar(); };
    addEventListener('resize', adaptar);
    document.addEventListener('fullscreenchange', adaptar);
    window.visualViewport?.addEventListener('resize', adaptar);
    window.visualViewport?.addEventListener('scroll', adaptar);
    new MutationObserver(adaptar).observe(document.body, {attributes: true, attributeFilter: ['style']});
    return ajustar;
  }

  return {instalar};
})();
