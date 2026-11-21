/* Ayuda de conteo para la columna que se está resolviendo en Sumas y restas. */
Object.assign(window.TEXTOS_INGLES ||= {}, {
  '🧮 Ábaco': '🧮 Abacus',
  'Ábaco de 20 cuentas': '20-bead abacus',
  'Mover el ábaco con las flechas': 'Move the abacus with the arrow keys',
  'Arrastra para mover el ábaco': 'Drag to move the abacus',
  'Cerrar ábaco': 'Close abacus',
  'Libre': 'Free play',
  'Intermedio': 'Intermediate',
  'Paso a paso': 'Step by step',
  'Se cuentan': 'Count these',
  'En espera': 'Waiting',
  'Cuentas del ábaco': 'Abacus beads',
  '↺ Reiniciar ábaco': '↺ Reset abacus',
  'Comprobar paso': 'Check step'
});

window.AbacoOperaciones = (() => {
  'use strict';
  const clave = 'operaciones.abaco.v1';
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;
  const modos = ['libre', 'intermedio', 'guiado'];
  const distribuir = n => [Math.min(n, 10), Math.max(0, n - 10)];
  const cuentas = (n, idioma) => idioma === 'es' ? `${n} ${n === 1 ? 'cuenta' : 'cuentas'}` : `${n} ${n === 1 ? 'bead' : 'beads'}`;

  function instalar(boton, obtenerOperacion) {
    const panel = document.createElement('aside');
    panel.id = 'abaco-flotante';
    panel.hidden = true;
    panel.setAttribute('aria-labelledby', 'tituloAbacoFlotante');
    panel.innerHTML = `
      <header>
        <button type="button" class="mover-abaco" aria-label="Mover el ábaco con las flechas" title="Arrastra para mover el ábaco">
          <span aria-hidden="true">✥</span> <strong id="tituloAbacoFlotante">Ábaco de 20 cuentas</strong>
        </button>
        <button type="button" data-abaco="cerrar" aria-label="Cerrar ábaco" title="Cerrar ábaco">✕</button>
      </header>
      <div class="interior-abaco">
        <div class="opciones-abaco">
          <label for="modoAbacoFlotante">Ayuda</label>
          <select id="modoAbacoFlotante">
            <option value="libre">Libre</option>
            <option value="intermedio">Intermedio</option>
            <option value="guiado">Paso a paso</option>
          </select>
          <output data-abaco="expresion" data-no-traducir></output>
        </div>
        <p data-abaco="mensaje" role="status" data-no-traducir></p>
        <div class="marco-abaco-operaciones">
          <div class="leyenda-abaco-operaciones"><span>Se cuentan</span><span>En espera</span></div>
          <div data-abaco="tablero" role="group" aria-label="Cuentas del ábaco"></div>
        </div>
        <div class="pie-abaco-operaciones">
          <button type="button" data-abaco="reiniciar">↺ Reiniciar ábaco</button>
          <button type="button" data-abaco="comprobar">Comprobar paso</button>
        </div>
      </div>`;
    document.body.append(panel);
    const buscar = id => panel.querySelector(`[data-abaco="${id}"]`);
    const tablero = buscar('tablero'), mensaje = buscar('mensaje'), expresion = buscar('expresion');
    const comprobar = buscar('comprobar'), reiniciar = buscar('reiniciar');
    const selector = panel.querySelector('select');
    const filas = AbacoCuentas.crear(tablero, 2);
    const guardado = Matematicas.leer(clave);
    let modo = modos.includes(guardado.modo) ? guardado.modo : 'guiado';
    let cantidades = [0, 0], fase = 'inicio', operacion, firma, error = false;
    let contar = [], contadas = new Set();

    function puedeMover(fila) {
      if (modo === 'libre') return true;
      if (!operacion || operacion.prestamo) return false;
      if (fase === 'inicio') return fila === 0 || operacion.m > 10;
      if (fase !== 'cambio') return false;
      return operacion.signo === '+' ? fila === 1 : distribuir(operacion.m)[fila] > distribuir(operacion.m - operacion.n)[fila];
    }

    function destino() {
      const {m, n, signo} = operacion;
      if (fase === 'inicio') return distribuir(m);
      return signo === '+' ? [m, n] : distribuir(m - n);
    }

    function escribir() {
      const {m, n, signo, prestamo, llevada} = operacion || {};
      const esSuma = signo === '+';
      expresion.hidden = modo === 'libre' || !operacion;
      const total = esSuma ? m + n : m - n;
      expresion.textContent = operacion ? `${m} ${esSuma ? '+' : '−'} ${n} = ${fase === 'resultado' ? total : '?'}` : '';
      comprobar.hidden = modo === 'libre' || !operacion || prestamo || !['inicio', 'cambio'].includes(fase);
      let texto;
      if (modo === 'libre') {
        texto = t('Toca o arrastra las cuentas. A la izquierda se cuentan.', 'Tap or slide the beads. Count the ones on the left.');
      } else if (!operacion) {
        texto = t('Abre una operación para usar la guía.', 'Open a problem to use the guide.');
      } else if (prestamo) {
        texto = t('Primero pulsa Pedir prestado en la operación. Luego representa la nueva cantidad.',
          'Select Borrow in the problem first. Then show the new amount.');
      } else if (error) {
        texto = fase === 'conteo'
          ? t('Toca la siguiente cuenta resaltada.', 'Tap the next highlighted bead.')
          : t('Revisa cuántas cuentas quedaron a la izquierda y vuelve a comprobar.',
            'Check how many beads are on the left and try again.');
      } else if (fase === 'inicio') {
        texto = m > 10
          ? t(`Pon 10 cuentas a la izquierda en la primera fila y ${m - 10} en la segunda.`, `Move 10 beads left in the first row and ${m - 10} in the second row.`)
          : t(`Pon ${cuentas(m, 'es')} a la izquierda en la primera fila.`, `Move ${cuentas(m, 'en')} to the left in the first row.`);
      } else if (fase === 'cambio') {
        texto = esSuma
          ? t(`Añade ${cuentas(n, 'es')} a la izquierda en la segunda fila${llevada ? ', incluida la que llevas' : ''}.`,
            `Move ${cuentas(n, 'en')} to the left in the second row${llevada ? ', including the one you carried' : ''}.`)
          : t(`Devuelve ${cuentas(n, 'es')} a la derecha. Empieza por la última fila que tenga cuentas a la izquierda.`,
            `Move ${cuentas(n, 'en')} back to the right. Start with the last row that has beads on the left.`);
      } else if (fase === 'conteo') {
        texto = esSuma
          ? t(`Parte de ${m} y toca cada cuenta de la segunda fila para seguir contando. Vas por ${m + contadas.size}.`,
            `Start at ${m} and tap each bead in the second row to count on. You are at ${m + contadas.size}.`)
          : t(`Toca las cuentas que quedaron a la izquierda para contarlas. Llevas ${contadas.size}.`,
            `Tap the beads left on the left to count them. You have counted ${contadas.size}.`);
      } else {
        texto = esSuma && total > 9
          ? t(`Llegaste a ${total}. Escribe ${total % 10} en esta columna y lleva 1 a la siguiente.`,
            `You reached ${total}. Write ${total % 10} in this column and carry 1 to the next.`)
          : t(`El resultado es ${total}. Colócalo en la operación.`, `The answer is ${total}. Put it in the problem.`);
      }
      mensaje.textContent = texto;
    }

    const claveCuenta = (fila, indice) => fila * 10 + indice;

    function pintarFila(fila) {
      const contando = modo !== 'libre' && fase === 'conteo';
      AbacoCuentas.pintar(filas[fila], fila, cantidades[fila], t, indice =>
        contando ? contar.includes(claveCuenta(fila, indice)) && !contadas.has(claveCuenta(fila, indice)) : puedeMover(fila), contando);
      const siguiente = contar.find(id => !contadas.has(id));
      const objetivo = modo === 'guiado' && operacion && ['inicio', 'cambio'].includes(fase) && puedeMover(fila) ? destino()[fila] : null;
      filas[fila].cuentas.forEach((cuenta, indice) => {
        const id = claveCuenta(fila, indice);
        const mueve = objetivo !== null && indice >= Math.min(objetivo, cantidades[fila]) && indice < Math.max(objetivo, cantidades[fila]);
        cuenta.classList.toggle('objetivo-abaco', mueve || (modo === 'guiado' && contando && siguiente === id));
        cuenta.classList.toggle('contada-abaco', modo !== 'libre' && contadas.has(id));
      });
    }

    function pintar() {
      filas.forEach((_, fila) => pintarFila(fila));
      escribir();
    }

    function cambiarFila(fila, valor) {
      cantidades[fila] = valor;
      if (error) { error = false; escribir(); }
      pintarFila(fila);
    }

    function alTocar(fila, indice) {
      if (fase !== 'conteo' || modo === 'libre') return false;
      const id = claveCuenta(fila, indice);
      const siguiente = contar.find(cuenta => !contadas.has(cuenta));
      error = modo === 'guiado' && siguiente !== id;
      if (!error) {
        contadas.add(id);
        if (contadas.size === contar.length) fase = 'resultado';
      }
      pintar();
      if (!error) {
        const proxima = contar.find(cuenta => !contadas.has(cuenta));
        const foco = proxima === undefined ? reiniciar : filas[Math.floor(proxima / 10)].cuentas[proxima % 10];
        foco.focus({preventScroll: true});
      }
      return true;
    }

    const cancelarCuentas = AbacoCuentas.conectar(tablero, {
      filas: () => filas, cantidad: fila => cantidades[fila], puedeMover, pintarFila, cambiarFila, alTocar
    });

    function volverAlInicio() {
      cancelarCuentas();
      cantidades = [0, 0];
      fase = 'inicio';
      error = false;
      contar = [];
      contadas = new Set();
      pintar();
    }

    function actualizar(nuevaRonda = false) {
      operacion = obtenerOperacion();
      const nuevaFirma = JSON.stringify(operacion);
      if (modo !== 'libre' && (nuevaRonda || nuevaFirma !== firma)) volverAlInicio();
      firma = nuevaFirma;
    }

    comprobar.onclick = () => {
      const esperadas = destino();
      error = cantidades.some((n, fila) => n !== esperadas[fila]);
      if (error) { escribir(); return; }
      if (fase === 'inicio') {
        fase = 'cambio';
      } else {
        const esSuma = operacion.signo === '+';
        contar = cantidades.flatMap((n, fila) => esSuma && fila === 0 ? [] :
          Array.from({length: n}, (_, indice) => claveCuenta(fila, indice)));
        fase = contar.length ? 'conteo' : 'resultado';
      }
      pintar();
      if (comprobar.hidden) {
        const primera = contar[0];
        const foco = primera === undefined ? reiniciar : filas[Math.floor(primera / 10)].cuentas[primera % 10];
        foco.focus({preventScroll: true});
      }
    };
    reiniciar.onclick = volverAlInicio;
    selector.value = modo;
    selector.onchange = () => {
      modo = selector.value;
      Matematicas.guardar(clave, {modo});
      actualizar();
      volverAlInicio();
    };

    posicionarAbaco(panel, cancelarCuentas);
    function mostrar(visible) {
      panel.hidden = !visible;
      boton.setAttribute('aria-expanded', visible);
      if (visible) {
        actualizar();
        pintar();
        panel.querySelector('.mover-abaco').focus({preventScroll: true});
      } else {
        cancelarCuentas();
        boton.focus({preventScroll: true});
      }
    }
    boton.setAttribute('aria-controls', panel.id);
    boton.setAttribute('aria-expanded', 'false');
    boton.onclick = () => mostrar(panel.hidden);
    buscar('cerrar').onclick = () => mostrar(false);
    panel.addEventListener('keydown', evento => {
      if (evento.key === 'Escape') { evento.preventDefault(); mostrar(false); }
    });
    document.addEventListener('operacion-cambiada', evento => actualizar(evento.detail?.nuevaRonda));
    return {localizar: pintar};
  }

  function posicionarAbaco(panel, cancelarCuentas) {
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
      panel.style.width = Math.min(340, ancho - 2 * margen) + 'px';
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
  }

  return {instalar};
})();
