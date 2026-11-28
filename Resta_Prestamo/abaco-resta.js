/* El ábaco compartido practica la resta de la columna activa. */
window.AbacoResta = (() => {
  'use strict';

  function instalar({boton, obtenerColumna}) {
    const abaco = AbacoOperaciones.instalar(boton, () => {
      const estado = obtenerColumna();
      if (!estado) return null;
      const {columna, m, n, pendientePrestamo} = estado;
      return {columna, signo:'-', m, n, prestamo:pendientePrestamo};
    }, 'resta-prestamo-abajo.abaco.v1');

    document.getElementById('abaco-flotante').classList.add('abaco-resta');
    return abaco;
  }

  return {instalar};
})();
