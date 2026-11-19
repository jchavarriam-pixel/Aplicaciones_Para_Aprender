/* Secuencias de valor posicional, sobre la cuenta que está resolviendo el estudiante. */
window.PasosOperaciones = (() => {
  let sesion = null;
  const t = (es, en) => IdiomaVoz.idioma === 'en' ? en : es;

  function limpiar() {
    if (!sesion) return;
    clearTimeout(sesion.timer);
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
      if (n === antes) marca.className = 'recta-origen';
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

  function avanzar() {
    if (!sesion) return;
    clearTimeout(sesion.timer);
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
    for (const cambio of siguiente.cambios || []) cifraPrestada(cambio);
    if (siguiente.destino) {
      const ficha = document.createElement('span');
      ficha.className = 'cifra-del-paso ficha-llevada-animada';
      ficha.textContent = '1';
      ficha.setAttribute('aria-hidden','true');
      siguiente.destino.append(ficha);
    }
    panel.querySelector('.avanzar-paso-operacion').textContent = sesion.indice < sesion.pasos.length-1
      ? t('Siguiente paso','Next step') : t('Terminar','Finish');
    sesion.timer = setTimeout(avanzar, siguiente.duracion || 2700);
  }

  function mostrar(pasos, completar) {
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
      tablero, panel, pasos, completar, indice:-1,
      mensaje:panel.querySelector('.mensaje-paso-operacion'),
      detalle:panel.querySelector('.detalle-paso-operacion')
    };
    avanzar();
  }

  return {mostrar, limpiar, get activo() { return sesion !== null; }};
})();
