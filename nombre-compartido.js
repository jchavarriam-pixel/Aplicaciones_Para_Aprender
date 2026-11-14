/* Identidad compartida por el índice y las actividades. No reinicia las rondas. */
(() => {
  'use strict';
  if (window.NombreCompartido) return;
  const clave = 'nombreNinoGabrielApps';
  const selector = ['nombreNino', 'nombreVisitante', 'nombre', 'nameInput', 'childName',
    'studentName', 'student-name', 'studentNameInput', 'hd-name', 'homeStudentName',
    'playerNameInput'].map(id => 'input#' + id).join(',');
  let actual = '', sincronizando = false, iniciado = false;
  const ediciones = new WeakMap();
  const limpiar = valor => typeof valor === 'string' ? valor.trim() : '';
  function leer() {
    try { return limpiar(localStorage.getItem(clave)); } catch { return ''; }
  }
  function notificar(nombre) {
    window.dispatchEvent(new CustomEvent('nombre-estudiante-cambiado', {detail: {nombre}}));
  }
  function aplicar(nombre, origen = null, forzar = false) {
    nombre = limpiar(nombre);
    if (!nombre || sincronizando || (!forzar && nombre === actual)) return;
    actual = nombre;
    sincronizando = true;
    try {
      for (const campo of document.querySelectorAll(selector)) {
        if (campo === origen) continue; // No mover el cursor mientras se escribe.
        campo.value = nombre;
        // El estado interno se actualiza con el evento propio, sin volver a guardar
        // una notificación antigua sobre un nombre que acaba de cambiar.
      }
      notificar(nombre);
    } finally { sincronizando = false; }
  }
  function guardar(valor, origen = null) {
    const nombre = limpiar(valor);
    if (!nombre || sincronizando) return actual;
    try { localStorage.setItem(clave, nombre); } catch { /* Seguir en esta sesión. */ }
    aplicar(nombre, origen);
    return nombre;
  }
  function refrescar() {
    if (!iniciado || sincronizando) return;
    const nombre = leer();
    const campoAntiguo = [...document.querySelectorAll(selector)].some(campo =>
      campo !== document.activeElement && limpiar(campo.value) !== nombre);
    aplicar(nombre, null, campoAntiguo);
  }
  function editar(evento) {
    if (sincronizando || !evento.target.matches?.(selector)) return;
    if (evento.type === 'change' && !limpiar(evento.target.value)) {
      evento.target.value = leer() || actual;
      return;
    }
    if (evento.type === 'input') ediciones.set(evento, {valor: evento.target.value, inicio: evento.target.selectionStart, fin: evento.target.selectionEnd});
    guardar(evento.target.value, evento.target);
  }
  function iniciar() {
    iniciado = true;
    aplicar(leer(), null, true);
    document.addEventListener('input', editar, true);
    document.addEventListener('change', editar, true);
    document.addEventListener('input', evento => {
      const edicion = ediciones.get(evento);
      if (!edicion) return;
      const campo = evento.target;
      campo.value = edicion.valor;
      if (edicion.inicio !== null) campo.setSelectionRange(edicion.inicio, edicion.fin);
    });
  }
  window.NombreCompartido = Object.freeze({clave, obtener: () => leer() || actual, guardar, refrescar});
  window.addEventListener('storage', evento => {
    if (evento.key === clave || evento.key === null) refrescar();
  });
  window.addEventListener('pageshow', refrescar);
  window.addEventListener('focus', refrescar);
  document.addEventListener('visibilitychange', () => {if (!document.hidden) refrescar();});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, {once: true});
  else iniciar();
})();
