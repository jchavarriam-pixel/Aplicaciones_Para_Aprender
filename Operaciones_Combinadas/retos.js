(() => {
  'use strict';
  const signos = {suma: '+', resta: '−', multiplicacion: '×', division: '÷'};
  const operaciones = Object.keys(signos);
  const entero = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const limitar = (valor, min, max, defecto) => {
    const numero = valor == null || valor === '' ? NaN : Number(valor);
    return Number.isFinite(numero) ? Math.min(max, Math.max(min, Math.trunc(numero))) : defecto;
  };
  function mezclar(valores) {
    const copia = [...valores];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = entero(0, i);
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }
  function normalizar(datos = {}) {
    const porOperacion = Object.fromEntries(operaciones.map(nombre => {
      const op = datos?.porOperacion?.[nombre];
      const minimoPermitido = ['multiplicacion', 'division'].includes(nombre) && op?.tipo !== 'resultado' ? 1 : 0;
      const min = limitar(op?.min, 0, 9999, 1);
      const max = limitar(op?.max, min, 9999, Math.max(min, 9));
      return [nombre, {
        activa: op?.activa !== false,
        numeros: op?.numeros === 'rango' ? 'rango' : 'digitos',
        digitos: limitar(op?.digitos, 1, 4, 1),
        min,
        max: Math.max(max, minimoPermitido, nombre === 'division' ? 1 : 0),
        tipo: ['resultado', 'faltante', 'mixto'].includes(op?.tipo) ? op.tipo : 'resultado'
      }];
    }));
    if (!operaciones.some(nombre => porOperacion[nombre].activa)) porOperacion.suma.activa = true;
    return {
      porOperacion,
      preguntas: limitar(datos?.preguntas, 1, 12, 5),
      pares: limitar(datos?.pares, 2, 4, 4),
      narracion: datos?.narracion !== false
    };
  }
  function crearReto(op, ajuste) {
    const min = ajuste.numeros === 'rango' ? ajuste.min : 0;
    const max = ajuste.numeros === 'rango' ? ajuste.max : 10 ** ajuste.digitos - 1;
    const hueco = ajuste.tipo === 'faltante' || (ajuste.tipo === 'mixto' && entero(0, 1))
      ? entero(0, 1) : 2;
    let a, b, total;
    if (op === 'division') {
      const inicio = Math.max(1, min);
      const tope = Math.floor(max / 2);
      b = entero(inicio, tope >= inicio && entero(0, 2) < 2 ? tope : max);
      total = entero(Math.max(hueco === 1 ? 1 : 0, Math.ceil(min / b)), Math.floor(max / b));
      a = b * total;
    } else {
      a = entero(op === 'multiplicacion' && hueco === 1 ? Math.max(min, 1) : min, max);
      b = entero(op === 'multiplicacion' && hueco === 0 ? Math.max(min, 1) : min, max);
      if (op === 'resta' && b > a) [a, b] = [b, a];
      total = op === 'suma' ? a + b : op === 'resta' ? a - b : a * b;
    }
    const numeros = [a, b, total];
    return {op, signo: signos[op], numeros, hueco, respuesta: numeros[hueco]};
  }
  function ronda(ajustes, cantidad) {
    const activas = operaciones.filter(nombre => ajustes.porOperacion[nombre].activa);
    const retos = [];
    let mazo = [];
    for (let i = 0; i < cantidad; i++) {
      if (!mazo.length) mazo = mezclar(activas);
      const op = mazo.pop();
      let mejor, mejorPuntaje = -1;
      for (let intento = 0; intento < 32; intento++) {
        const actual = crearReto(op, ajustes.porOperacion[op]);
        const duplicado = retos.some(r => r.op === op && r.hueco === actual.hueco &&
          r.numeros.every((n, j) => n === actual.numeros[j]));
        const respuestaNueva = !retos.some(r => r.respuesta === actual.respuesta);
        const puntaje = (duplicado ? 0 : 2) + Number(respuestaNueva);
        if (puntaje > mejorPuntaje) {
          mejor = actual;
          mejorPuntaje = puntaje;
        }
        if (puntaje === 3) break;
      }
      retos.push(mejor);
    }
    return retos;
  }
  globalThis.OperacionesCombinadas = {operaciones, signos, mezclar, normalizar, ronda};
})();
