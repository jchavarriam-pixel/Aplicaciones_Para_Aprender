(() => {
  'use strict';

  function crear() {
    let contexto, salida, ruido;
    const fuentes = new Set();

    function iniciar() {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return false;
      if (!contexto) {
        try {
          const nuevo = new Audio();
          const compresor = nuevo.createDynamicsCompressor();
          compresor.threshold.value = -16;
          compresor.ratio.value = 12;
          compresor.attack.value = .003;
          compresor.release.value = .17;
          const volumen = nuevo.createGain();
          volumen.gain.value = .54;
          const limitador = nuevo.createWaveShaper();
          limitador.curve = Float32Array.from({length:1025},(_,i) => .22 * Math.tanh((i / 512 - 1) / .22));
          compresor.connect(volumen);
          volumen.connect(limitador);
          limitador.connect(nuevo.destination);
          contexto = nuevo;
          salida = compresor;
        } catch {
          return false;
        }
      }
      if (contexto.state !== 'running') contexto.resume().catch(() => {});
      return true;
    }

    function reproducir(fuente, filtro, tiempo, duracion, volumen, entrada) {
      const envolvente = contexto.createGain();
      envolvente.gain.setValueAtTime(0, tiempo);
      envolvente.gain.linearRampToValueAtTime(volumen, tiempo + entrada);
      envolvente.gain.exponentialRampToValueAtTime(.0001, tiempo + duracion);
      if (filtro) filtro.connect(envolvente);
      fuente.connect(filtro ?? envolvente);
      envolvente.connect(salida);
      const liberar = () => {
        fuentes.delete(fuente);
        fuente.onended = null;
        fuente.disconnect();
        filtro?.disconnect();
        envolvente.disconnect();
      };
      fuentes.add(fuente);
      fuente.onended = liberar;
      fuente.start(tiempo);
      fuente.stop(tiempo + duracion);
    }

    function tono(tiempo, duracion, inicial, final, volumen, tipo = 'sine') {
      const fuente = contexto.createOscillator();
      fuente.type = tipo;
      fuente.frequency.setValueAtTime(inicial, tiempo);
      fuente.frequency.exponentialRampToValueAtTime(final, tiempo + duracion);
      reproducir(fuente, null, tiempo, duracion, volumen, .012);
    }

    function soplo(tiempo, duracion, inicial, final, volumen, tipo, entrada = .015) {
      if (!ruido) {
        ruido = contexto.createBuffer(1, contexto.sampleRate, contexto.sampleRate);
        const muestras = ruido.getChannelData(0);
        for (let i = 0; i < muestras.length; i++) muestras[i] = 2 * Math.random() - 1;
      }
      const fuente = contexto.createBufferSource();
      fuente.buffer = ruido;
      const filtro = contexto.createBiquadFilter();
      filtro.type = tipo;
      filtro.Q.value = .55;
      filtro.frequency.setValueAtTime(inicial, tiempo);
      filtro.frequency.exponentialRampToValueAtTime(final, tiempo + duracion);
      reproducir(fuente, filtro, tiempo, duracion, volumen, entrada);
    }

    const efectos = new Map([
      ['ascenso', t => tono(t, .29, 560, 1370, .078)],
      ['explosion', (t, _, id) => {
        const volcan = id === 'volcan';
        soplo(t, .34, volcan ? 1250 : 1930, 320, .36, 'lowpass');
        tono(t, .25, volcan ? 136 : 195, 73, .15, 'triangle');
      }],
      ['chispa', (t, i) => soplo(t, .085, 1450 + (i % 4) * 320, 970, .14, 'highpass', .006)],
      ['rugido', t => {
        soplo(t, .82, 650, 210, .44, 'lowpass', .055);
        tono(t, .56, 114, 56, .17, 'triangle');
      }],
      ['piedra', (t, i) => {
        const nota = 520 + (i % 5) * 48;
        tono(t, .078, nota, nota * .55, .13, 'triangle');
        soplo(t, .052, 1410, 730, .12, 'bandpass', .007);
      }],
      ['flor', (t, i) => {
        const nota = [523.25, 659.25, 783.99, 880][i % 4];
        tono(t, .25, nota, nota, .085);
        tono(t + .013, .19, nota * 2, nota * 2, .022);
      }],
      ['cinta', t => soplo(t, .66, 880, 1540, .33, 'bandpass', .09)]
    ]);

    function lanzar(id, eventos) {
      if (!eventos?.length || !iniciar()) return;
      const origen = contexto.currentTime + .012;
      const programados = new Set();
      eventos.forEach(([segundos, tipo], i) => {
        const efecto = efectos.get(tipo);
        if (!efecto || !Number.isFinite(segundos) || segundos < 0) return;
        const pulso = tipo + ':' + Math.round(segundos / .04);
        if (programados.has(pulso)) return;
        programados.add(pulso);
        efecto(origen + segundos, i, id);
      });
    }

    function limpiar() {
      for (const fuente of fuentes) {
        fuente.stop();
        fuente.onended();
      }
    }

    return {lanzar, limpiar};
  }

  window.HuevosSonidosResta = {crear};
})();
