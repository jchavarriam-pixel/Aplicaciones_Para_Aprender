/* Secuencias de valor posicional, sobre la cuenta que está resolviendo el estudiante. */
window.PasosOperaciones = (() => {
  let sesion = null;
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;

  function detenerNarracion() {
    clearTimeout(sesion.timer);
    if (!sesion.voz) return;
    sesion.voz.onend = null;
    sesion.voz.onerror = null;
    sesion.voz = null;
    window.speechSynthesis?.cancel();
  }

  function limpiar() {
    if (!sesion) return;
    detenerNarracion();
    sesion.panel.remove();
    sesion.tablero.classList.remove('mostrando-pasos','prestamo-en-cuenta');
    sesion.tablero.querySelectorAll('.cifra-del-paso,.recta-prestamo').forEach(el => el.remove());
    sesion.tablero.querySelectorAll('.cifra-en-transformacion').forEach(el => el.classList.remove('cifra-en-transformacion'));
    sesion = null;
  }

  function terminar() {
    const completar = sesion.completar;
    const foco = sesion.panel.contains(document.activeElement);
    limpiar();
    completar();
    if (foco) {
      const siguiente = document.querySelector('#borrowBtn:not(:disabled)') || document.getElementById('nuevaOperacion');
      siguiente?.focus({preventScroll:true});
    }
  }

  function rectaNumerica(cambio) {
    const {antes,col} = cambio;
    const columna = sesion.columna(col);
    const zona = columna.querySelector('.borrow-zone');
    zona.querySelector('.cifra-del-paso')?.remove();
    columna.querySelector(sesion.selectorCifra).classList.add('cifra-en-transformacion');
    const linea = document.createElement('div');
    linea.className = 'recta-prestamo';
    linea.setAttribute('aria-hidden', 'true');
    const cinta = document.createElement('div');
    cinta.className = 'cinta-recta-prestamo';
    for (let n=antes+1; n>=antes-2; n--) {
      const marca = document.createElement('span');
      marca.textContent = n < 0 ? '' : n;
      if (n === antes-1) marca.className = 'recta-antecesor';
      if (n === antes) marca.className = 'recta-origen';
      cinta.append(marca);
    }
    linea.append(cinta);
    zona.append(linea);
    sesion.recta = {linea,cambio};
  }

  function cifraPrestada({ col, antes, despues, subir }) {
    const columna = sesion.columna(col);
    const zona = columna.querySelector('.borrow-zone');
    zona.querySelector('.cifra-del-paso')?.remove();
    columna.querySelector(sesion.selectorCifra).classList.add('cifra-en-transformacion');
    const cifra = document.createElement('span');
    cifra.className = subir ? 'cifra-del-paso cifra-sube' : 'cifra-del-paso';
    if (subir) {
      const prefijo = document.createElement('span');
      prefijo.className = 'prefijo-prestado';
      prefijo.textContent = '1';
      cifra.append(prefijo, String(antes));
    } else cifra.textContent = despues;
    cifra.setAttribute('aria-hidden', 'true');
    zona.append(cifra);
  }

  function mostrarEfecto(efecto, paso) {
    if (efecto === 'prefijo') {
      sesion.tablero.querySelector('.cifra-sube')?.classList.add('muestra-prefijo');
    } else if (efecto === 'retroceso') {
      sesion.recta?.linea.classList.add('recta-en-retroceso');
    } else if (efecto === 'llevada') {
      const salida = (paso.cifraOrigen || paso.origen).getBoundingClientRect();
      const llegada = paso.destino.getBoundingClientRect();
      const escala = Matematicas.escala();
      const ficha = document.createElement('span');
      ficha.className = 'cifra-del-paso ficha-llevada-animada';
      ficha.textContent = '1';
      ficha.setAttribute('aria-hidden','true');
      const origenX = salida.left + salida.width * (paso.origenFraccion ?? .32);
      ficha.style.setProperty('--origen-llevada-x', (origenX - llegada.left - llegada.width/2)/escala+'px');
      ficha.style.setProperty('--origen-llevada-y', (salida.top + salida.height/2 - llegada.top - llegada.height/2)/escala+'px');
      if (paso.cifraOrigen) ficha.style.animationDelay = '450ms';
      paso.origen.textContent = paso.resto;
      paso.destino.append(ficha);
    }
  }

  function presentarFragmento(paso, indice) {
    const fragmento = paso.narracion[indice];
    if (!fragmento) { avanzar(); return; }
    if (fragmento.cambio) cifraPrestada(fragmento.cambio);
    mostrarEfecto(fragmento.efecto, paso);
    const actual = sesion;
    const siguiente = () => { if (sesion === actual) presentarFragmento(paso, indice+1); };
    const minimo = fragmento.minimo || 2900;
    const inicio = performance.now();
    let voz = null;
    if (actual.narrar) {
      try { voz = IdiomaVoz.hablar(fragmento.texto); } catch {}
    }
    actual.voz = voz;
    if (!voz) {
      actual.timer = setTimeout(siguiente, minimo);
      return;
    }
    const alTerminar = () => {
      if (sesion !== actual || actual.voz !== voz) return;
      detenerNarracion();
      actual.timer = setTimeout(siguiente, Math.max(520, minimo - (performance.now() - inicio)));
    };
    voz.onend = alTerminar;
    voz.onerror = alTerminar;
    // Algunos navegadores no notifican el final cuando la voz no está disponible.
    actual.timer = setTimeout(alTerminar, Math.max(10000, 1600 + fragmento.texto.length * 118 / IdiomaVoz.velocidad));
  }

  function avanzar() {
    if (!sesion) return;
    detenerNarracion();
    const siguiente = sesion.pasos[++sesion.indice];
    if (!siguiente) { terminar(); return; }
    sesion.tablero.querySelectorAll('.cifra-sube').forEach(el => el.classList.remove('cifra-sube'));
    if (sesion.recta) {
      const {linea,cambio} = sesion.recta;
      linea.remove();
      cifraPrestada(cambio);
      sesion.recta = null;
    }
    const { panel, mensaje, detalle } = sesion;
    panel.querySelector('.paso-operacion-contador').textContent = t(
      `Paso ${sesion.indice+1} de ${sesion.pasos.length}`,
      `Step ${sesion.indice+1} of ${sesion.pasos.length}`
    );
    mensaje.textContent = siguiente.texto;
    detalle.replaceChildren();
    if (siguiente.recta) rectaNumerica(siguiente.recta);
    if (siguiente.ecuacion) detalle.textContent = siguiente.ecuacion;
    for (const cambio of siguiente.cambios || []) cifraPrestada(cambio);
    panel.querySelector('.avanzar-paso-operacion').textContent = sesion.indice < sesion.pasos.length-1
      ? sesion.prestamo ? t('Siguiente','Next') : t('Siguiente paso','Next step') : t('Terminar','Finish');
    presentarFragmento(siguiente, 0);
  }

  function mostrar(pasos, completar, {
    narrar = true, prestamo = false, tablero = document.getElementById('gameScreen'),
    columna = col => document.querySelector(`#colsContainer .col[data-col="${col}"]`),
    selectorCifra = '.digit-cell', controles
  } = {}) {
    limpiar();
    const botonPrestamo = document.getElementById('borrowBtn');
    const enfocarSiguiente = prestamo && document.activeElement === botonPrestamo;
    const panel = document.createElement('section');
    panel.className = prestamo || controles ? 'controles-pasos-prestamo' : 'panel-pasos-operaciones';
    panel.innerHTML = `<div class="texto-paso-operacion" role="status">
      <strong class="paso-operacion-contador"></strong><span class="mensaje-paso-operacion"></span>
    </div><div class="detalle-paso-operacion"></div>
    <div class="acciones-paso-operacion">
      <button class="avanzar-paso-operacion" type="button"></button>
      <button class="saltar-pasos-operacion" type="button"></button>
    </div>`;
    panel.querySelector('.avanzar-paso-operacion').onclick = avanzar;
    const saltar = panel.querySelector('.saltar-pasos-operacion');
    saltar.textContent = t('Saltar','Skip');
    saltar.setAttribute('aria-label', t('Saltar animación','Skip animation'));
    saltar.onclick = terminar;
    tablero.classList.add('mostrando-pasos');
    if (prestamo || controles) {
      tablero.classList.add('prestamo-en-cuenta');
      if (controles) controles.append(panel);
      else botonPrestamo.after(panel);
    } else document.getElementById('hintBar').after(panel);
    sesion = {
      tablero, panel, pasos, completar, narrar, prestamo:prestamo || !!controles, columna, selectorCifra, indice:-1,
      mensaje:panel.querySelector('.mensaje-paso-operacion'),
      detalle:panel.querySelector('.detalle-paso-operacion')
    };
    avanzar();
    if (enfocarSiguiente) {
      panel.querySelector('.avanzar-paso-operacion').focus({preventScroll:true});
    }
  }

    function detectarLlevadaEnRespuesta(col, valor, respuestas, totalEn, faltaLlevada, reconocerUnoSolo = false) {
      const totalDerecha = totalEn(col + 1);
      const respuesta = respuestas[col];
      if (valor === 1 && faltaLlevada(col) && totalDerecha >= 10 &&
          respuestas[col + 1] === totalDerecha - 10) {
        return {columna: col, resto: respuesta};
      }
      const total = totalEn(col);
      if (col === 0 || total < 10 || !faltaLlevada(col - 1)) return null;
      const unidad = total - 10;
      if ((respuesta === 1 && valor === unidad) || (valor === 1 && respuesta === unidad)) {
        return {columna: col - 1, resto: unidad, unidadVisible: unidad};
      }
      if (reconocerUnoSolo && valor === 1 && unidad !== 1) {
        return {columna: col - 1, resto: respuesta === 1 ? null : respuesta};
      }
      return null;
    }

    function avisoLlevada() {
      return t('Oh… recuerda que el 1 va arriba. Ese 1 es el que se lleva.',
        'Oh… remember, the 1 goes above. That is the 1 you carry.');
    }

    function pasosCorregirLlevada(origen, destino, resto, unidadVisible) {
      const par = document.createElement('span');
      const uno = document.createElement('span');
      uno.textContent = '1';
      par.append(uno, String(unidadVisible ?? ''));
      origen.replaceChildren(par);
      const texto = avisoLlevada();
      return [{
        texto, origen, destino, resto: resto ?? '', cifraOrigen: uno, origenFraccion: .5,
        narracion: [{texto, efecto:'llevada', minimo:3500}]
      }];
    }

    function pasosLlevada(total, origen, destino) {
      const resto = total - 10;
      const en = IdiomaVoz.idioma === 'en';
      return [
        {
          texto: en ? `Separate one group of ten from the ${total}.` : `Separa un grupo de diez del ${total}.`,
          ecuacion: `${total} = 10 + ${resto}`,
          narracion: [
            {texto: en ? `This column adds up to ${total}.` : `En esta columna, la suma da ${total}.`},
            {texto: en ? `We separate one ten. That leaves ${resto === 1 ? 'one unit' : `${resto} units`}.` :
              `Separamos una decena. ${resto === 1 ? 'Nos queda una unidad' : `Nos quedan ${resto} unidades`}.`, minimo:3400}
          ]
        },
        {
          texto: en ? `The 1 goes to the left. The ${resto} stays in this column.` : `El 1 pasa a la izquierda. El ${resto} se queda en esta columna.`,
          origen, destino, resto,
          narracion: [
            {texto: en ? 'We carry the 1 to the box on the left. That 1 stands for one ten.'
              : 'Llevamos el 1 a la casilla de la izquierda. Ese 1 representa una decena.', efecto:'llevada', minimo:3600},
            {texto: en ? `The ${resto} stays in the column where we added.` : `El ${resto} se queda en la columna donde sumamos.`}
          ]
        }
      ];
    }

    function pasosPrestamo(origen, receptor, intermedias) {
      const en = IdiomaVoz.idioma === 'en';
      const pasos = [
        {
          texto: en ? `Add ten to ${receptor.antes}. It becomes ${receptor.despues}.`
            : `Suma diez al ${receptor.antes}. Ahora tienes ${receptor.despues}.`,
          ecuacion: `${receptor.antes} + 10 = ${receptor.despues}`, cambios:[receptor],
          narracion: [
            {texto: en ? `Let's take the ${receptor.antes} and move it up.`
              : `Tomemos el ${receptor.antes}. Lo subimos.`, minimo:3200},
            {texto: en ? `We put a 1 in front to make ${receptor.despues}. That 1 represents one ten.`
              : `Le agregamos un 1 delante para formar el ${receptor.despues}. Ese 1 representa una decena.`,
              efecto:'prefijo', minimo:4100}
          ]
        },
        {
          texto: en ? `${origen.antes} lends one. Go back to ${origen.despues}, the previous number.`
            : `El ${origen.antes} presta uno. Retrocede al ${origen.despues}, su antecesor.`,
          recta:origen,
          narracion: [
            {texto: en ? `Find the ${origen.antes} on the number line. This is the digit that lends.`
              : `Busquemos el ${origen.antes} en la recta numérica. Es la cifra que presta.`, minimo:3400},
            {texto: en ? `Go back one number. We land on ${origen.despues}, the number before ${origen.antes}.`
              : `Retrocedemos un número. Llegamos al ${origen.despues}, el antecesor del ${origen.antes}.`,
              efecto:'retroceso', minimo:3900}
          ]
        }
      ];
      if (intermedias.length) pasos.push({
        texto: en ? 'Each zero in between receives ten and passes one to the right. That leaves nine.'
          : 'Cada cero intermedio recibe diez y pasa uno a la derecha. Le quedan nueve.',
        ecuacion:'10 − 1 = 9',
        narracion: intermedias.map((cambio, i) => ({
          texto: en ? `${i === 0 ? 'This zero' : 'The next zero'} receives ten and passes one to the right. Nine stays here.`
            : `${i === 0 ? 'Este cero' : 'El siguiente cero'} recibe diez y pasa uno a la derecha. Aquí quedan nueve.`,
          cambio, minimo:3900
        }))
      });
      return pasos;
    }

  return {mostrar, limpiar, pasosPrestamo, pasosLlevada, detectarLlevadaEnRespuesta, avisoLlevada,
    pasosCorregirLlevada, get activo() { return sesion !== null; }};
})();
