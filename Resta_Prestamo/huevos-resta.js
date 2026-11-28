(() => {
  'use strict';

  const sorpresas = [
    {id:'volcan', icono:'🌋', mensaje:['¡El volcán lanzó estrellas y números!', 'The volcano launched stars and numbers!']},
    {id:'fuegos', icono:'🎆', mensaje:['¡Estallaron fuegos artificiales en cadena!', 'Fireworks burst in a cascade!']},
    {id:'estrellas', icono:'🌟', mensaje:['¡Las estrellas salieron en todas direcciones!', 'Stars burst in every direction!']},
    {id:'domino', icono:'⋮', mensaje:['¡Cayeron las fichas del dominó!', 'The dominoes tumbled!']},
    {id:'jardin', icono:'🌻', mensaje:['¡Brotó un jardín de colores!', 'A colorful garden grew!']},
    {id:'cinta', icono:'🌈', mensaje:['¡Una cinta arcoíris cruzó el cielo!', 'A rainbow ribbon swept across the sky!']}
  ];
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  const traducir = (es,en) => window.IdiomaVoz?.idioma === 'en' ? en : es;

  function elegirTres(anteriores) {
    const opciones = [...sorpresas];
    for (let i = opciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [opciones[i],opciones[j]] = [opciones[j],opciones[i]];
    }
    // Igual que en Valor posicional, cambia al menos un regalo de la ronda anterior.
    if (opciones.slice(0,3).every(regalo => anteriores.includes(regalo))) {
      [opciones[2],opciones[3]] = [opciones[3],opciones[2]];
    }
    return opciones.slice(0,3);
  }

  function instalar(panel,escena,conSonido) {
    panel.classList.add('premio-con-huevos');
    panel.removeAttribute('aria-hidden');
    panel.setAttribute('data-no-traducir','');
    panel.innerHTML = '<div class="huevos-resta-contenido"><h3 id="tituloHuevosResta" class="huevos-resta-consigna"></h3><div class="huevos-resta-banco" role="group"></div></div><p class="huevos-resta-aviso" role="status"></p>';
    const consigna = panel.querySelector('.huevos-resta-consigna');
    const banco = panel.querySelector('.huevos-resta-banco');
    const aviso = panel.querySelector('.huevos-resta-aviso');
    const animacion = HuevosEfectosResta.crear(escena);
    const sonido = HuevosSonidosResta.crear();
    let anteriores = [], ronda = [], descubierta = null;

    function localizar() {
      const todosAbiertos = ronda.length === 3 && ronda.every(huevo => huevo.abierto);
      consigna.textContent = todosAbiertos ? traducir('¡Tres sorpresas!','Three surprises!') :
        traducir('Abre los tres huevos','Open the three eggs');
      banco.setAttribute('aria-label',traducir('Huevos sorpresa','Surprise eggs'));
      for (const [i,{boton,regalo,abierto}] of ronda.entries()) {
        const numero = i + 1;
        const etiqueta = abierto ? traducir(...regalo.mensaje) :
          traducir('Abre el huevo ' + numero,'Open egg ' + numero);
        boton.setAttribute('aria-label',etiqueta);
        boton.title = etiqueta;
      }
      aviso.textContent = descubierta ? traducir(...descubierta.mensaje) : '';
    }

    function limpiar() {
      ronda = [];
      descubierta = null;
      banco.replaceChildren();
      animacion.limpiar();
      sonido.limpiar();
      localizar();
    }

    function preparar() {
      limpiar();
      anteriores = elegirTres(anteriores);
      ronda = anteriores.map(regalo => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'huevo-resta';
        boton.dataset.sorpresa = regalo.id;
        boton.innerHTML = '<span class="huevo-resta-cascaron" aria-hidden="true"></span><span class="huevo-resta-interrogacion" aria-hidden="true">?</span>';
        const huevo = {boton,regalo,abierto:false};
        let puntero = null;
        boton.addEventListener('pointerdown', evento => {
          if (evento.isPrimary && evento.button === 0) puntero = evento.pointerId;
        });
        boton.addEventListener('pointercancel', evento => {
          if (evento.pointerId === puntero) puntero = null;
        });
        // En pantallas táctiles, Revisar puede reenviar los eventos de ratón al huevo recién mostrado.
        boton.addEventListener('mousedown', evento => {
          if (evento.detail > 0 && puntero === null) evento.preventDefault();
        });
        boton.addEventListener('click', evento => {
          const pulsacion = evento.detail === 0 || puntero !== null;
          puntero = null;
          if (pulsacion) abrir(huevo);
          else evento.preventDefault();
        });
        return huevo;
      });
      banco.replaceChildren(...ronda.map(huevo => huevo.boton));
      localizar();
      return ronda[0].boton;
    }

    function abrir(huevo) {
      if (huevo.abierto || panel.hidden) return;
      const {boton,regalo} = huevo;
      huevo.abierto = true;
      descubierta = regalo;
      boton.setAttribute('aria-disabled','true');
      const figura = document.createElement('span');
      figura.className = 'huevo-resta-figura';
      figura.setAttribute('aria-hidden','true');
      figura.textContent = regalo.icono;
      boton.append(figura);
      localizar();
      if (reducir.matches) return;
      const efecto = HuevosEfectosResta.efectos[regalo.id];
      const estado = efecto.preparar?.();
      animacion.lanzar(boton,efecto,estado);
      if (conSonido()) sonido.lanzar(regalo.id,efecto.sonidos(estado));
    }

    limpiar();
    return {preparar,limpiar,localizar,silenciar:sonido.limpiar};
  }

  window.HuevosResta = {instalar};
})();
