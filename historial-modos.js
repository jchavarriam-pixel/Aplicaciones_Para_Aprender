/* Las vistas internas comparten la URL y cada paso del navegador conserva su destino. */
(() => {
  const clave = 'modoAplicacion';

  function crear(vistas, mostrar) {
    let actual = null;
    let esperandoRetroceso = false;
    const registrada = estado => vistas.includes(estado?.[clave]?.vista) ? estado[clave] : null;

    function registrar(vista, nivel = 1) {
      if (vista === actual) return;
      actual = vista;
      try {
        const anterior = registrada(history.state);
        const profundidad = Math.min(nivel, (anterior?.nivel ?? 0) + 1);
        const estado = {...history.state, [clave]: {vista, nivel: profundidad}};
        if (anterior && nivel <= anterior.nivel) history.replaceState(estado, '');
        else history.pushState(estado, '');
      } catch { /* El botón de la aplicación sigue disponible si se bloquea el historial. */ }
    }

    function restaurar(estado = history.state) {
      esperandoRetroceso = false;
      const vista = registrada(estado)?.vista ?? null;
      if (vista === actual) return;
      actual = vista;
      mostrar(vista);
    }

    addEventListener('popstate', evento => restaurar(evento.state));
    return {
      registrar,
      restaurar,
      ir(vista, nivel) {
        if (esperandoRetroceso || vista === actual) return;
        registrar(vista, nivel);
        mostrar(vista);
      },
      volver() {
        if (esperandoRetroceso) return;
        const entrada = registrada(history.state);
        if (entrada && entrada.vista === actual) {
          esperandoRetroceso = true;
          try { history.go(-entrada.nivel); return; } catch { esperandoRetroceso = false; }
        }
        actual = null;
        mostrar(null);
      }
    };
  }
  window.HistorialModos = {crear};
})();
