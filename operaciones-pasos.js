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
    sesion.tablero.classList.remove('mostrando-pasos');
    sesion.tablero.querySelectorAll('.cifra-del-paso').forEach(el => el.remove());
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

  function rectaNumerica(antes) {
    const linea = document.createElement('div');
    linea.className = 'recta-prestamo';
    linea.setAttribute('aria-hidden', 'true');
    for (let n=Math.max(0,antes-2); n<=antes+1; n++) {
      const marca = document.createElement('span');
      marca.textContent = n;
      if (n === antes-1) marca.className = 'recta-antecesor';
      if (n === antes) {
        marca.className = 'recta-origen';
        const marcador = document.createElement('i');
        marcador.className = 'marcador-recta-prestamo';
        marca.append(marcador);
      }
      linea.append(marca);
    }
    return linea;
  }

  function cifraPrestada({ col, antes, despues, subir }) {
    const columna = document.querySelector(`#colsContainer .col[data-col="${col}"]`);
    const zona = columna.querySelector('.borrow-zone');
    zona.querySelector('.cifra-del-paso')?.remove();
    columna.querySelector('.digit-cell').classList.add('cifra-en-transformacion');
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
      sesion.detalle.querySelector('.recta-prestamo')?.classList.add('recta-en-retroceso');
      for (const cambio of paso.cambios) cifraPrestada(cambio);
    } else if (efecto === 'llevada') {
      const salida = paso.origen.getBoundingClientRect();
      const llegada = paso.destino.getBoundingClientRect();
      const escala = Matematicas.escala();
      const ficha = document.createElement('span');
      ficha.className = 'cifra-del-paso ficha-llevada-animada';
      ficha.textContent = '1';
      ficha.setAttribute('aria-hidden','true');
      ficha.style.setProperty('--origen-llevada-x', (salida.left + salida.width*.32 - llegada.left - llegada.width/2)/escala+'px');
      ficha.style.setProperty('--origen-llevada-y', (salida.top + salida.height/2 - llegada.top - llegada.height/2)/escala+'px');
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
    const { panel, mensaje, detalle } = sesion;
    panel.querySelector('.paso-operacion-contador').textContent = t(
      `Paso ${sesion.indice+1} de ${sesion.pasos.length}`,
      `Step ${sesion.indice+1} of ${sesion.pasos.length}`
    );
    mensaje.textContent = siguiente.texto;
    detalle.replaceChildren();
    if (siguiente.recta !== undefined) detalle.append(rectaNumerica(siguiente.recta));
    if (siguiente.ecuacion) detalle.textContent = siguiente.ecuacion;
    if (siguiente.recta === undefined) for (const cambio of siguiente.cambios || []) cifraPrestada(cambio);
    panel.querySelector('.avanzar-paso-operacion').textContent = sesion.indice < sesion.pasos.length-1
      ? t('Siguiente paso','Next step') : t('Terminar','Finish');
    presentarFragmento(siguiente, 0);
  }

  function mostrar(pasos, completar, { narrar = true } = {}) {
    limpiar();
    const tablero = document.getElementById('gameScreen');
    const panel = document.createElement('section');
    panel.className = 'panel-pasos-operaciones';
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
    document.getElementById('hintBar').after(panel);
    sesion = {
      tablero, panel, pasos, completar, narrar, indice:-1,
      mensaje:panel.querySelector('.mensaje-paso-operacion'),
      detalle:panel.querySelector('.detalle-paso-operacion')
    };
    avanzar();
  }

  return {mostrar, limpiar, get activo() { return sesion !== null; }};
})();
