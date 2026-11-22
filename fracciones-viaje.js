(() => {
  'use strict';

  function instalar({tono, llegada, siguiente, etiquetaSiguiente}) {
    const dialogo = document.getElementById('viajeFracciones');
    const lienzo = document.getElementById('viajeLienzo');
    const estado = document.getElementById('viajeEstado');
    const repetir = document.getElementById('viajeRepetir');
    const botonSiguiente = document.getElementById('viajeSiguiente');
    const ctx = lienzo.getContext('2d');
    const cohete = new Image();
    cohete.src = 'iconos/fracciones-cohete.webp';
    const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
    const salida = [.209, .533], destino = [.786, .445];
    const controlA = [.209, .16], controlB = [.63, .12];
    const colores = ['#ffe57f','#ff9ace','#82e9ff','#d5b6ff','#fff'];
    const cuentaRegresiva = 2100, duracionVuelo = 2650, duracionLlegada = 950;
    let cuadro = 0, inicio = 0, momento = 0, mensaje = '';

    function punto(t) {
      const u = 1 - t;
      return salida.map((valor, i) => u**3 * valor + 3 * u*u*t * controlA[i] +
        3 * u*t*t * controlB[i] + t**3 * destino[i]);
    }

    function dibujar(tiempo) {
      const w = lienzo.clientWidth, h = lienzo.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      if (lienzo.width !== Math.round(w*dpr)) lienzo.width = Math.round(w*dpr);
      if (lienzo.height !== Math.round(h*dpr)) lienzo.height = Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,w,h);

      const t = Math.max(0, Math.min(1, (tiempo - cuentaRegresiva) / duracionVuelo));
      const fin = (tiempo - cuentaRegresiva - duracionVuelo) / duracionLlegada;
      const volando = t > 0 && t < 1;
      const [x,y] = punto(t);
      const tamano = Math.min(w * .12, h * .24);

      if (volando) {
        ctx.save();
        ctx.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
          const desde = Math.max(0, t - (i + 1) * .025);
          const hasta = Math.max(0, t - i * .025);
          const [ax,ay] = punto(desde), [bx,by] = punto(hasta);
          ctx.beginPath();
          ctx.moveTo(ax*w,ay*h);ctx.lineTo(bx*w,by*h);
          ctx.lineWidth = Math.max(1, tamano * (.24 - i * .017));
          ctx.strokeStyle = i < 3 ? '#ffdc7d' : '#8de5ff';
          ctx.globalAlpha = (12 - i) / 16;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (fin >= 0) {
        const avance = Math.min(fin,1);
        ctx.save();
        ctx.globalAlpha = .75 * (1 - avance);
        ctx.strokeStyle = '#ffe8a1';
        ctx.lineWidth = Math.max(1, tamano * .026);
        ctx.beginPath();
        ctx.ellipse(x*w,y*h,tamano*(.23+avance*1.4),tamano*(.09+avance*.44),0,0,Math.PI*2);
        ctx.stroke();
        for (let i=0;i<20;i++) {
          const angulo = i * Math.PI / 10;
          const distancia = tamano * (1 - (1 - avance)**2) * (i%3===0 ? 1.4 : 2.15);
          const px = x*w + Math.cos(angulo) * distancia;
          const py = y*h + Math.sin(angulo) * distancia * .7 - tamano * .22;
          const radio = Math.max(1, tamano * .045 * (1 - avance * .5));
          ctx.fillStyle = colores[i%colores.length];
          ctx.beginPath();
          ctx.moveTo(px-radio,py);ctx.lineTo(px,py-radio*1.65);
          ctx.lineTo(px+radio,py);ctx.lineTo(px,py+radio*1.65);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.translate(x*w,y*h);
      if (volando) {
        const [ax,ay] = punto(Math.max(0,t-.008)), [bx,by] = punto(Math.min(1,t+.008));
        const giro = Math.atan2((bx-ax)*w, (ay-by)*h);
        ctx.rotate(giro * Math.min(1, (1-t) / .24));
        const llama = tamano * (.29 + .045 * Math.sin(tiempo*.025));
        ctx.fillStyle = '#ff944b';
        ctx.beginPath();
        ctx.moveTo(-tamano*.1,0);ctx.quadraticCurveTo(-tamano*.12,llama*.4,0,llama);
        ctx.quadraticCurveTo(tamano*.12,llama*.4,tamano*.1,0);
        ctx.fill();
        ctx.fillStyle = '#fff5a8';
        ctx.beginPath();
        ctx.ellipse(0,llama*.22,tamano*.05,llama*.38,0,0,Math.PI*2);
        ctx.fill();
      }
      if (cohete.naturalWidth) {
        const ancho = tamano * cohete.naturalWidth / cohete.naturalHeight;
        ctx.drawImage(cohete,-ancho/2,-tamano,ancho,tamano);
      } else {
        ctx.font = tamano * .8 + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚀',0,-tamano*.12);
      }
      ctx.restore();
    }

    function indicar(texto, english = texto) {
      const actual = IdiomaVoz.idioma === 'en' ? english : texto;
      if (actual === mensaje) return false;
      mensaje = actual;
      estado.textContent = actual;
      return true;
    }

    function animar(ahora) {
      if (!dialogo.open) return;
      momento = ahora - inicio;
      dibujar(momento);
      if (momento < cuentaRegresiva) {
        const numero = 3 - Math.floor(momento / (cuentaRegresiva / 3));
        if (indicar(String(numero))) tono(380 + (3-numero)*78,.13,'triangle',.06);
      } else if (momento < cuentaRegresiva + duracionVuelo) {
        if (indicar('¡Despegue!', 'Lift-off!')) tono(125,.58,'triangle',.1);
      } else if (indicar('¡Aterrizaje perfecto!', 'Perfect landing!')) {
        llegada();
        repetir.hidden = false;
      }
      if (momento < cuentaRegresiva + duracionVuelo + duracionLlegada) cuadro = requestAnimationFrame(animar);
    }

    function iniciar() {
      cancelAnimationFrame(cuadro);
      mensaje = '';
      repetir.hidden = true;
      if (reducirMovimiento.matches) {
        momento = cuentaRegresiva + duracionVuelo + duracionLlegada;
        dibujar(momento);
        indicar('¡Aterrizaje perfecto!', 'Perfect landing!');
        llegada();
        return;
      }
      inicio = performance.now();
      animar(inicio);
    }
    function abrir() {
      if (!dialogo.open) dialogo.showModal();
      botonSiguiente.textContent = etiquetaSiguiente();
      iniciar();
    }
    function cerrar() {
      cancelAnimationFrame(cuadro);
      if (dialogo.open) dialogo.close();
    }
    dialogo.addEventListener('close', () => {
      if (!dialogo.open) cancelAnimationFrame(cuadro);
    });
    document.getElementById('viajeCerrar').addEventListener('click',cerrar);
    botonSiguiente.addEventListener('click',() => {
      cerrar();
      siguiente();
    });
    repetir.addEventListener('click',iniciar);
    cohete.addEventListener('load', () => { if (dialogo.open) dibujar(momento); });
    new ResizeObserver(() => { if (dialogo.open) dibujar(momento); }).observe(lienzo);
    return {abrir,cerrar};
  }

  window.ViajeFracciones = {instalar};
})();
