/* Un solo canvas para las partículas y botones nativos para los globos. */
(() => {
  const colores = ['#ff668f', '#ffd16c', '#55d9ff', '#a995ff', '#75efb8', '#ff9d68'];
  const tonosOscuros = ['#a81e67', '#ab5d15', '#1857bc', '#5932a8', '#11725c', '#ac4520'];
  const total = colores.length;
  const mosaico = 36;
  let atlas;

  function atlasNumeros() {
    if (atlas) return atlas;
    atlas = document.createElement('canvas');
    atlas.width = 10 * mosaico;
    atlas.height = total * mosaico;
    const ctx = atlas.getContext('2d');
    ctx.font = '900 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22204d';
    colores.forEach((color, fila) => {
      ctx.fillStyle = color;
      for (let n = 0; n < 10; n++) {
        const x = (n + .5) * mosaico, y = (fila + .5) * mosaico;
        ctx.strokeText(n, x, y);
        ctx.fillText(n, x, y);
      }
    });
    return atlas;
  }

  function crear(area, { t, sonar, reducido }) {
    const capa = document.createElement('div');
    capa.className = 'escena-globos-operaciones';
    const marcador = document.createElement('output');
    marcador.className = 'cuenta-globos-operaciones';
    marcador.setAttribute('aria-live', 'polite');
    capa.append(marcador);
    area.append(capa);

    let w = 1, h = 1, escala = 1, diametro = 62, tiempo = 0;
    let fin = Infinity, explotados = 0;
    const particulas = [], ondas = [];
    const tope = (navigator.hardwareConcurrency || 4) <= 4 ? 240 : 360;
    const instruccion = t('¡Toca los globos para hacerlos estallar!', 'Tap the balloons to pop them!');
    const globos = colores.map((color, i) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'globo-operaciones';
      boton.style.setProperty('--globo-claro', color);
      boton.style.setProperty('--globo-oscuro', tonosOscuros[i]);
      boton.setAttribute('aria-label', t(`Reventar globo ${i+1} de ${total}`, `Pop balloon ${i+1} of ${total}`));
      boton.innerHTML = '<span class="cuerpo-globo-operaciones"></span><span class="hilo-globo-operaciones"></span>';
      const globo = { boton, i, x: 0, y: 0, reventado: false };
      boton.onclick = () => reventar(globo);
      capa.append(boton);
      return globo;
    });
    actualizarMarcador();

    function actualizarMarcador() {
      marcador.textContent = t(`Globos: ${explotados}/${total}`, `Balloons: ${explotados}/${total}`);
    }

    function reventar(globo) {
      if (globo.reventado) return;
      globo.reventado = true;
      const colocarFoco = globo.boton.matches(':focus-visible');
      globo.boton.hidden = true;
      explotados++;
      actualizarMarcador();
      sonar('estallido-globo');
      const x = globo.x/w, y = globo.y/h;
      const cantidad = reducido ? 36 : Math.min(112, Math.round(74 + escala*.08));
      particulas.splice(0, Math.max(0, particulas.length + cantidad - tope));
      ondas.push({x, y, color: colores[globo.i], inicio:tiempo, edad:0});
      for (let i = 0; i < cantidad; i++) {
        const a = i / cantidad * Math.PI * 2 + (Math.random() - .5)*.16;
        const velocidad = (reducido ? .21 : .36) + Math.random() * (reducido ? .37 : 1.27);
        particulas.push({
          x, y, vx: Math.cos(a)*velocidad, vy: Math.sin(a)*velocidad,
          color: (i + globo.i) % total, cifra: i % 10, tam: 13 + Math.random()*11,
          inicio: tiempo, edad: 0, vida: reducido ? .7 : 1.15 + Math.random()*.8
        });
      }
      if (explotados === total) fin = tiempo + (reducido ? .8 : 2.05);
      if (colocarFoco) {
        const siguiente = globos.find(g => !g.reventado)?.boton || area.parentElement.querySelector('.nueva-ronda-fiesta-signos');
        siguiente?.focus({preventScroll:true});
      }
    }

    function colocar() {
      const columnas = w >= h*1.4 ? total : 3;
      for (const globo of globos) {
        if (globo.reventado) continue;
        const { i, boton } = globo;
        const subida = reducido ? 0 : Math.max(0, 1 - tiempo/1.65) ** 2;
        globo.x = (i % columnas + .5) * w / columnas + (reducido ? 0 : Math.sin(tiempo*1.6+i) * diametro*.1);
        const centro = columnas === total ? .50 : i < 3 ? .31 : .68;
        const balanceo = reducido ? 0 : Math.sin(tiempo*1.8 + i*2)*Math.min(h*.055, 17);
        globo.y = Math.min(h-diametro*.58, h*centro + balanceo + subida*h*.14);
        boton.style.transform = `translate3d(${globo.x-diametro/2}px,${globo.y-diametro*.55}px,0)`;
      }
    }

    function ajustar(ancho, alto) {
      w = Math.max(1, ancho);
      h = Math.max(1, alto);
      escala = Math.min(w,h);
      const columnas = w >= h*1.4 ? total : 3;
      diametro = Math.max(44, Math.min(104, w/columnas*.75, h*(columnas === total ? .52 : .25)));
      capa.style.setProperty('--diametro-globo', diametro+'px');
      colocar();
    }

    function actualizar(dt, segundos) {
      tiempo = segundos;
      colocar();
      for (let i = particulas.length-1; i >= 0; i--) {
        const p = particulas[i];
        p.edad = tiempo - p.inicio;
        if (p.edad >= p.vida) { particulas.splice(i, 1); continue; }
        p.vy += .76 * dt;
        p.x += p.vx*(escala/w)*dt;
        p.y += p.vy*(escala/h)*dt;
      }
      for (const onda of ondas) onda.edad = tiempo - onda.inicio;
      while (ondas[0]?.edad > .57) ondas.shift();
    }

    function pintar(ctx) {
      ctx.save();
      for (const onda of ondas) {
        const avance = Math.min(1, onda.edad/.57);
        const radio = diametro*.38 + escala*.42*(1-(1-avance)**2);
        ctx.strokeStyle = onda.color;
        for (const [multiplicador, grosor] of [[1,4], [.72,2]]) {
          ctx.globalAlpha = (1-avance)*.8;
          ctx.lineWidth = grosor;
          ctx.beginPath();
          ctx.arc(onda.x*w, onda.y*h, radio*multiplicador,0,Math.PI*2);
          ctx.stroke();
        }
      }
      if (particulas.length) {
        const sprites = atlasNumeros();
        for (const p of particulas) {
          ctx.globalAlpha = Math.min(1, (p.vida-p.edad)*3);
          ctx.drawImage(sprites, p.cifra*mosaico, p.color*mosaico, mosaico, mosaico,
            p.x*w-p.tam/2, p.y*h-p.tam/2, p.tam, p.tam);
        }
      }
      ctx.restore();
    }

    return {
      automatica: true, boton: globos[0].boton, instruccion, instruccionActiva: instruccion,
      get intervalo() { return tiempo < fin ? 15 : 1000/30; },
      get final() { return fin; },
      get enReposo() { return tiempo >= fin; },
      ajustar, actualizar, pintar, destruir: () => capa.remove()
    };
  }
  window.FiestaGlobos = {crear};
})();
