(() => {
  function instalar(raiz, panel, {teclas = '1234567890', limpiar = false} = {}) {
    const selector = '[data-campo-teclado]';
    let campo = null;
    const campos = () => [...raiz.querySelectorAll(selector)].filter(entrada => !entrada.disabled && entrada.getClientRects().length);
    function seleccionar(entrada) {
      campo?.removeAttribute('data-campo-activo');
      campo = entrada;
      campo?.toggleAttribute('data-campo-activo', campos().length > 1);
    }
    function pulsar(tecla) {
      if (!campos().includes(campo)) seleccionar(campos()[0]);
      if (!campo) return;
      const anterior = campo.value;
      const valor = tecla === 'Delete' ? '' : tecla === 'Backspace' ? anterior.slice(0, -1) : anterior + tecla;
      if (valor === anterior || (campo.maxLength >= 0 && valor.length > campo.maxLength)) return;
      campo.value = valor;
      campo.dispatchEvent(new Event('input', {bubbles: true}));
    }
    const acciones = limpiar ? ['Backspace', 'Delete'] : ['Backspace'];
    panel.replaceChildren(...[...teclas, ...acciones].map(tecla => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.dataset.tecla = tecla;
      boton.textContent = ({Backspace: '⌫', Delete: '×', '-': '−', ' ': 'Espacio'})[tecla] ?? tecla;
      if (acciones.includes(tecla)) boton.setAttribute('aria-label', tecla === 'Delete' ? 'Borrar todo' : 'Borrar');
      return boton;
    }));
    panel.addEventListener('click', evento => {
      const boton = evento.target.closest('[data-tecla]');
      if (boton) pulsar(boton.dataset.tecla);
    });
    raiz.addEventListener('focusin', evento => {
      if (evento.target.matches(selector)) seleccionar(evento.target);
    });
    raiz.addEventListener('click', evento => {
      if (evento.target.matches(selector)) seleccionar(evento.target);
    });
    raiz.addEventListener('keydown', evento => {
      if (!evento.target.matches(selector) || evento.ctrlKey || evento.metaKey || evento.altKey) return;
      const tecla = acciones.includes(evento.key) ? evento.key : evento.key.toLowerCase();
      if (!acciones.includes(tecla) && (tecla.length !== 1 || !teclas.includes(tecla))) return;
      evento.preventDefault();
      seleccionar(evento.target);
      pulsar(tecla);
    });
    return {seleccionar};
  }
  window.TecladoEnPantalla = {instalar};
  Object.assign(window.TEXTOS_INGLES ||= {}, {'Teclado numérico': 'Number keypad', 'Teclado de letras': 'Letter keyboard', 'Espacio': 'Space', 'Borrar': 'Delete', 'Borrar todo': 'Clear all'});
})();
