(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = $('appColones'), escena = $('escena');
  const contenido = $('contenido'), banco = $('banco'), monto = $('monto');
  const clave = 'colones.practica.v1';
  const dinero = {
    10:{tipo:'moneda',tema:'plata',marca:'◆'},
    25:{tipo:'moneda',tema:'laton',marca:'✿'},
    50:{tipo:'moneda',tema:'plata',marca:'✦'},
    100:{tipo:'moneda',tema:'oro',marca:'❖'},
    500:{tipo:'moneda',tema:'bimetal',marca:'✺'},
    1000:{tipo:'billete',tema:'rojo',marca:'🦌'},
    2000:{tipo:'billete',tema:'azul',marca:'🦈'},
    5000:{tipo:'billete',tema:'amarillo',marca:'🐒'},
    10000:{tipo:'billete',tema:'verde',marca:'🦥'},
    20000:{tipo:'billete',tema:'coral',marca:'🐦'}
  };
  const valores = Object.keys(dinero).map(Number);
  const modos = {
    contar:{nombre:'Cantidad en el sobre',guia:'Abre el sobre, cuenta y escribe cuánto dinero hay.',icono:'✉',tema:'lila'},
    llenar:{nombre:'Preparar un sobre',guia:'Elige monedas y billetes para formar una cantidad.',icono:'✉',tema:'cielo'},
    exacto:{nombre:'Compra exacta',guia:'Elige un producto y paga su precio exacto en la caja.',icono:'🍎',tema:'menta'},
    compra:{nombre:'Compra con vuelto',guia:'Compra un producto, paga de más y calcula el vuelto.',icono:'🧾',tema:'durazno'},
    carrito:{nombre:'Carrito de compras',guia:'Compra de dos a tres productos, paga y calcula el vuelto.',icono:'🛒',tema:'rosa'},
    cajero:{nombre:'Soy el cajero',guia:'Cobra los productos y entrega el vuelto al cliente.',icono:'🔔',tema:'oro'}
  };
  const productos = ['Manzana','Pan','Leche','Jugo','Cuaderno','Lápiz','Bananas','Pelota','Mochila'];
  const iniciales = [10,25,50,100,500,1000,2000];
  const guardado = Matematicas.leer(clave);
  const activas = valores.filter(valor => Array.isArray(guardado.activas) && guardado.activas.includes(valor));
  let opciones = {activas:activas.length ? activas : iniciales, ayudas:guardado.ayudas!==false, narracion:guardado.narracion!==false};
  let modo = null, fase, oferta, elegidos, piezas, sobre, dineroCliente, pagado;
  let arrastre = null, ignorarClic = false;
  const t = texto => IdiomaVoz.t(texto);
  const en = () => IdiomaVoz.idioma==='en';
  const idioma = (es,ingles) => en() ? ingles : es;
  const formato = valor => '₡'+valor.toLocaleString(en()?'en-US':'es-CR');
  const sumar = lista => lista.reduce((total,valor)=>total+valor,0);
  const precio = () => sumar(elegidos.map(i=>oferta[i].precio));
  const aCambio = () => pagado-precio();
  const entero = (min,max) => min+Math.floor(Math.random()*(max-min+1));
  const tomar = lista => lista[entero(0,lista.length-1)];
  function barajar(lista) {
    const orden = [...lista];
    for(let i=orden.length-1;i>0;i--){
      const j=entero(0,i);
      [orden[i],orden[j]]=[orden[j],orden[i]];
    }
    return orden;
  }
  function formar(cantidad,disponibles=opciones.activas) {
    return Array.from({length:cantidad},()=>tomar(disponibles));
  }
  function escalaPrecios(indice) {
    const disponibles=opciones.activas;
    // Los productos baratos usan el tramo inicial de las denominaciones activas.
    const tope=Math.min(disponibles.length,indice<4?Math.max(1,disponibles.length-3):disponibles.length);
    const maximo=disponibles.slice(0,tope);
    return formar(entero(1,indice<4?2:3),maximo);
  }
  function prepararProductos() {
    return barajar(productos.map((nombre,id)=>{
      const monedas=escalaPrecios(id);
      return {nombre,id,monedas,precio:sumar(monedas)};
    })).slice(0,6);
  }
  // Busca combinaciones de vuelto sin asumir que las denominaciones son múltiplos entre sí.
  function sePuedeDarVuelto(cantidad) {
    const orden=[...opciones.activas].reverse();
    const memo=new Set();
    function buscar(resto,i,libres) {
      if(resto===0) return true;
      const valor=orden[i];
      if(!valor || resto>valor*libres) return false;
      if(i===orden.length-1) return resto%valor===0;
      const estado=resto+':'+i+':'+libres;
      if(memo.has(estado)) return false;
      memo.add(estado);
      for(let n=Math.min(libres,Math.floor(resto/valor));n>=0;n--){
        if(buscar(resto-n*valor,i+1,libres-n)) return true;
      }
      return false;
    }
    return buscar(cantidad,0,24);
  }
  function nuevaRonda() {
    if(!modo)return;
    oferta=prepararProductos();
    elegidos=[];
    piezas=[];
    sobre=formar(modo==='contar'?entero(3,7):entero(2,5));
    pagado=0;
    dineroCliente=[];
    if(modo==='cajero'){
      elegidos=oferta.slice(0,entero(2,3)).map((_,i)=>i);
      dineroCliente=compactar(elegidos.flatMap(i=>oferta[i].monedas).concat(formar(entero(1,3))));
    }
    cambiarFase(({contar:'cerrado',llenar:'llenar',cajero:'cobrar'})[modo]||'elegir');
  }
  function pieza(valor) {
    const {tipo,tema,marca}=dinero[valor];
    return `<span class="dinero ${tipo} ${tema}" aria-hidden="true"><i>${marca}</i><b>${formato(valor)}</b><small>${t('Práctica')}</small></span>`;
  }
  const etiquetaDinero = valor => idioma(`${formato(valor)} en ${dinero[valor].tipo==='moneda'?'moneda':'billete'}`,`${formato(valor)} ${dinero[valor].tipo==='moneda'?'coin':'banknote'}`);
  function mostrarBanco() {
    banco.innerHTML=opciones.activas.map(valor=>`<button type="button" class="origen-dinero" data-dinero="${valor}" aria-label="${etiquetaDinero(valor)}">${pieza(valor)}</button>`).join('');
  }
  function mostrarModos() {
    $('modos').innerHTML=Object.entries(modos).map(([id,{nombre,guia,icono,tema}]) =>
      `<button type="button" class="tarjeta ${tema}" data-modo="${id}"><span class="arte-modo" aria-hidden="true"><span>${icono}</span><i>₡</i></span><strong>${t(nombre)}</strong><span>${t(guia)}</span></button>`
    ).join('');
  }
  function producto(item) {
    return `<span class="foto-producto" style="--col:${item.id%3};--fila:${Math.floor(item.id/3)}" aria-hidden="true"></span>`;
  }
  function etiquetaTotal(texto,valor) {
    return `<div class="dato-total"><span>${t(texto)}</span><strong>${formato(valor)}</strong></div>`;
  }
  const fasesDinero = new Set(['llenar','pagar','dar']);
  const fasesNumericas = new Set(['contar','cobrar','vuelto']);
  function verSobre() {
    if(fase==='cerrado') return `<button type="button" class="sobre cerrado" id="abrirSobre"><span class="sello" aria-hidden="true">₡</span><strong>${t('Abrir sobre')}</strong></button>`;
    if(modo==='contar'){
      const total=fase==='listo'?etiquetaTotal('Monto del sobre',sumar(sobre)):'';
      return `<section class="sobre abierto"><h3>${t('Dinero en el sobre')}</h3><div class="dinero-en-sobre">${sobre.map(valor=>`<span aria-label="${etiquetaDinero(valor)}" role="img">${pieza(valor)}</span>`).join('')}</div>${total}</section>`;
    }
    return `<div class="meta-sobre">${etiquetaTotal('Tu sobre',sumar(sobre))}</div>`+destino('Dinero en el sobre','sobre abierto');
  }
  function destino(rotulo,estilo='mostrador') {
    const conteos=contarPiezas(piezas);
    const editable=fase!=='listo';
    const fichas=opciones.activas.filter(valor=>conteos.has(valor)).map(valor=>{
      const cantidad=conteos.get(valor);
      const interior=pieza(valor)+(cantidad>1?`<b class="cantidad-piezas">×${cantidad}</b>`:'');
      const quitar=idioma(`Quitar ${etiquetaDinero(valor)}`,`Remove ${etiquetaDinero(valor)}`);
      return editable?`<button type="button" class="pieza-colocada" data-quitar="${valor}" aria-label="${quitar}">${interior}</button>`:
        `<span class="pieza-colocada" role="img" aria-label="${cantidad} × ${etiquetaDinero(valor)}">${interior}</span>`;
    }).join('');
    return `<section id="destinoDinero" class="${estilo} zona-dinero"><header><h3>${t(rotulo)}</h3>${(opciones.ayudas||!editable)&&fichas?`<b>${formato(sumar(piezas))}</b>`:''}</header>
      <div class="piezas-colocadas">${fichas||`<span>${t('Toca o arrastra una pieza.')}</span>`}</div></section>`;
  }
  function contarPiezas(lista) {
    const conteos=new Map();
    for(const valor of lista)conteos.set(valor,(conteos.get(valor)||0)+1);
    return conteos;
  }
  function compactar(lista) {
    const conteos=contarPiezas(lista);
    for(const valor of opciones.activas){
      const veces=conteos.get(valor)||0;
      const canje=opciones.activas.find(v=>v>valor&&v%valor===0&&v/valor<=veces);
      if(!canje)continue;
      const grupos=Math.floor(veces/(canje/valor));
      conteos.set(valor,veces-grupos*(canje/valor));
      conteos.set(canje,(conteos.get(canje)||0)+grupos);
    }
    return [...conteos].sort(([a],[b])=>b-a).flatMap(([valor,n])=>Array(n).fill(valor));
  }
  function verPagoCliente() {
    const pago=[...contarPiezas(dineroCliente)].map(([valor,n])=>
      `<span class="pieza-colocada" role="img" aria-label="${n} × ${etiquetaDinero(valor)}">${pieza(valor)}${n>1?`<b class="cantidad-piezas">×${n}</b>`:''}</span>`).join('');
    return etiquetaTotal('El cliente paga',sumar(dineroCliente))+`<div class="pago-cliente">${pago}</div>`;
  }
  function estante() {
    return `<div class="estante">${oferta.map((item,i)=>{
      const seleccionado=elegidos.includes(i);
      return `<button type="button" class="producto" data-producto="${i}" aria-pressed="${seleccionado}">${producto(item)}<span><strong>${t(item.nombre)}</strong><b>${formato(item.precio)}</b></span></button>`;
    }).join('')}</div><section class="cesta" id="cesta"><h3>${t(elegidos.length?'Productos elegidos':'Pon aquí los productos')}</h3><div>${elegidos.map(i=>producto(oferta[i])).join('')}</div>${elegidos.length?`<strong>${formato(precio())}</strong>`:''}</section>`;
  }
  function comprobante() {
    const esCajero=modo==='cajero';
    const listado=elegidos.map(i=>{
      const item=oferta[i];
      return `<li>${producto(item)}<span>${t(item.nombre)}</span><strong>${formato(item.precio)}</strong></li>`;
    }).join('');
    return `<section class="recibo">
      <ul ${esCajero?'aria-label="'+t('Productos del cliente')+'"':''}>${listado}</ul>
      ${fase==='cobrar'?'':etiquetaTotal('Precio total',precio())}
      ${fase==='dar'||(esCajero&&fase==='listo')?verPagoCliente():''}
      ${!esCajero&&(fase==='vuelto'||(fase==='listo'&&pagado))?etiquetaTotal('Pagaste',pagado):''}
      ${fase==='listo'&&pagado?etiquetaTotal('Vuelto',aCambio()):''}
      </section>`;
  }
  function instruccion() {
    switch(fase){
      case 'cerrado': return t('Toca el sobre para abrirlo.');
      case 'contar': return t('¿Cuánto dinero hay en total?');
      case 'llenar': return idioma(`Pon ${formato(sumar(sobre))} en el sobre.`,`Put ${formato(sumar(sobre))} in the envelope.`);
      case 'elegir': return t(modo==='carrito'?'Escoge de dos a tres productos y llévalos a la caja.':'Escoge un producto y llévalo a la caja.');
      case 'pagar': return t(modo==='exacto'?'Pon el pago exacto en la caja.':'Paga más que el total y calcula el vuelto.');
      case 'vuelto': return t('¿Cuánto vuelto deben darte?');
      case 'cobrar': return t('¿Cuánto debes cobrar por los productos?');
      case 'dar': return t('Forma el vuelto y entrégaselo al cliente.');
      default: return t('¡Lo lograste!');
    }
  }
  function actualizarContenido() {
    if(modo==='contar'||modo==='llenar') contenido.innerHTML=verSobre();
    else if(fase==='elegir') contenido.innerHTML=estante();
    else{
      contenido.innerHTML=comprobante()+
        (fase==='pagar'?destino('Tu pago'):fase==='dar'?destino('Vuelto para el cliente'):
          fase==='listo'&&modo==='cajero'?destino('Vuelto para el cliente'):'');
    }
  }
  function render() {
    if(!modo)return;
    $('tituloModo').textContent=t(modos[modo].nombre);
    $('instruccion').textContent=instruccion();
    $('bancoPanel').hidden=!fasesDinero.has(fase);
    $('respuesta').hidden=!fasesNumericas.has(fase);
    escena.dataset.fase=fase;
    actualizarContenido();
    $('accion').hidden=fase==='cerrado';
    $('accion').textContent=t(({elegir:'Ir a la caja',cobrar:'Cobrar',pagar:'Pagar',dar:'Dar vuelto',listo:'Siguiente ronda'})[fase]||'Revisar');
  }
  function anunciar(texto='',correcto=false) {
    const mensaje=t(texto);
    $('mensaje').textContent=mensaje;
    $('mensaje').classList.toggle('correcto',correcto);
    if(mensaje&&opciones.narracion) leer(mensaje);
  }
  function leer(texto=instruccion()) {
    IdiomaVoz.hablar(texto.replace(/₡([\d.,\s\u00a0\u202f]*\d)/g,(_,n)=>n.replace(/\D/g,'')+' colones'));
  }
  function cambiarFase(nueva) {
    fase=nueva;
    monto.value='';
    escena.scrollTop=0;
    anunciar();
    render();
    if(opciones.narracion&&nueva!=='listo') leer();
  }
  function completar() {
    cambiarFase('listo');
    const nombre=window.NombreCompartido?.obtener();
    const mensaje=nombre?idioma(`¡Muy bien, ${nombre}!`,`Well done, ${nombre}!`):t('¡Lo lograste!');
    anunciar(mensaje,true);
    $('accion').focus({preventScroll:true});
  }
  function revisar() {
    if(fase==='listo') return nuevaRonda();
    if(fase==='cerrado') return;
    if(fase==='elegir'){
      if(elegidos.length<(modo==='carrito'?2:1)) return anunciar(modo==='carrito'?'Elige dos o tres productos.':'Elige un producto primero.');
      cambiarFase('pagar');
      $('banco').firstElementChild.focus({preventScroll:true});
      return;
    }
    if(fasesNumericas.has(fase)){
      if(!monto.value)return anunciar('Escribe un monto con el teclado.');
      const meta=({contar:()=>sumar(sobre),cobrar:precio,vuelto:aCambio})[fase]();
      if(Number(monto.value)!==meta)return anunciar(({contar:'Cuenta el dinero otra vez.',cobrar:'Suma los precios para encontrar cuánto cobrar.',vuelto:'Resta el precio total al dinero que pagaste.'})[fase]);
      if(fase==='cobrar') {
        pagado=sumar(dineroCliente);
        return cambiarFase('dar');
      }
      return completar();
    }
    const total=sumar(piezas);
    const meta=({llenar:()=>sumar(sobre),dar:aCambio,pagar:precio})[fase]();
    if(fase==='pagar'&&modo!=='exacto'){
      if(total<meta)return anunciar('Falta dinero.');
      if(total===meta)return anunciar('Entrega más dinero que el precio para practicar el vuelto.');
      if(!sePuedeDarVuelto(total-meta))return anunciar('Con ese pago, la caja no puede dar vuelto con las denominaciones activas. Prueba otro monto.');
      pagado=total;
      return cambiarFase('vuelto');
    }
    if(total===meta) return completar();
    anunciar(fase==='dar'?'El cliente necesita un vuelto distinto. Revisa la diferencia.':total<meta?'Falta dinero.':'Hay dinero de más. Quita alguna pieza.');
  }
  function agregarDinero(valor) {
    if(!opciones.activas.includes(valor)||!fasesDinero.has(fase))return;
    if(piezas.length>=24)return anunciar('Límite de piezas. Quita alguna para agregar otra.');
    piezas.push(valor);
    anunciar();
    actualizarContenido();
  }
  function elegirProducto(i,porArrastre=false) {
    if(fase!=='elegir'||!oferta[i])return;
    const posicion=elegidos.indexOf(i);
    if(posicion!==-1){
      if(porArrastre)return;
      elegidos.splice(posicion,1);
    }else{
      if(modo==='carrito'&&elegidos.length===3)return anunciar('Puedes llevar hasta tres productos.');
      if(modo!=='carrito')elegidos=[];
      elegidos.push(i);
    }
    anunciar();
    actualizarContenido();
    if(!porArrastre)contenido.querySelector(`[data-producto="${i}"]`).focus({preventScroll:true});
  }
  function quitarDinero(valor) {
    const i=piezas.lastIndexOf(valor);
    if(i<0||!fasesDinero.has(fase))return;
    piezas.splice(i,1);
    anunciar();
    actualizarContenido();
    (contenido.querySelector(`[data-quitar="${valor}"]`)||banco.querySelector(`[data-dinero="${valor}"]`))?.focus({preventScroll:true});
  }
  function limpiarArrastre() {
    arrastre?.fantasma?.remove();
    arrastre?.destino?.classList.remove('sobre-destino');
    arrastre=null;
  }
  escena.addEventListener('pointerdown',evento=>{
    ignorarClic=false;
    const origen=evento.target.closest('[data-dinero],[data-producto]');
    if(!origen||evento.button!==0||evento.isPrimary===false||arrastre)return;
    const esDinero=origen.hasAttribute('data-dinero');
    arrastre={id:evento.pointerId,origen,esDinero,
      x:evento.clientX,y:evento.clientY,valor:Number(esDinero?origen.dataset.dinero:origen.dataset.producto)};
    origen.setPointerCapture(evento.pointerId);
  });
  escena.addEventListener('pointermove',evento=>{
    const d=arrastre;
    if(d?.id!==evento.pointerId)return;
    const {clientX:x,clientY:y}=evento;
    if(!d.fantasma){
      if(Math.hypot(x-d.x,y-d.y)<7)return;
      const original=d.origen.firstElementChild;
      const rect=original.getBoundingClientRect();
      d.fantasma=document.createElement('div');
      d.fantasma.className='fantasma-colones';
      d.fantasma.setAttribute('aria-hidden','true');
      d.fantasma.style.width=rect.width+'px';
      d.fantasma.style.height=rect.height+'px';
      d.fantasma.append(original.cloneNode(true));
      document.body.append(d.fantasma);
    }
    Matematicas.fantasma(d.fantasma,x,y);
    d.destino?.classList.remove('sobre-destino');
    d.destino=document.elementFromPoint(x,y)?.closest(d.esDinero?'#destinoDinero':'#cesta');
    d.destino?.classList.add('sobre-destino');
  });
  addEventListener('pointerup',evento=>{
    const d=arrastre;
    if(d?.id!==evento.pointerId)return;
    if(d.fantasma){
      ignorarClic=true;
      const destino=document.elementFromPoint(evento.clientX,evento.clientY)?.closest(d.esDinero?'#destinoDinero':'#cesta');
      if(destino){
        if(d.esDinero)agregarDinero(d.valor);
        else elegirProducto(d.valor,true);
      }
    }
    limpiarArrastre();
  });
  escena.addEventListener('pointercancel',limpiarArrastre);
  escena.addEventListener('lostpointercapture',evento=>{
    if(evento.target===arrastre?.origen&&evento.pointerId===arrastre.id)limpiarArrastre();
  });
  addEventListener('resize',limpiarArrastre);
  document.addEventListener('fullscreenchange',limpiarArrastre);
  escena.addEventListener('click',evento=>{
    if(ignorarClic&&evento.detail){ignorarClic=false;return;}
    const boton=evento.target.closest('button');
    if(!boton)return;
    if(boton.id==='abrirSobre') {cambiarFase('contar');monto.focus({preventScroll:true});}
    else if(boton.hasAttribute('data-dinero')) agregarDinero(Number(boton.dataset.dinero));
    else if(boton.hasAttribute('data-producto')) elegirProducto(Number(boton.dataset.producto));
    else if(boton.hasAttribute('data-quitar')) quitarDinero(Number(boton.dataset.quitar));
  });
  function mostrarModo(vista) {
    limpiarArrastre();
    window.speechSynthesis?.cancel();
    modo=vista;
    $('modos').hidden=Boolean(vista);
    $('juego').hidden=!vista;
    $('modosVolver').hidden=$('nueva').hidden=!vista;
    $('guiaModo').textContent=t(vista?modos[vista].guia:'Elige una actividad para practicar con monedas y billetes de Costa Rica.');
    if(vista)nuevaRonda();
  }
  const historial=HistorialModos.crear(Object.keys(modos),mostrarModo);
  $('modos').addEventListener('click',evento=>{
    const tarjeta=evento.target.closest('[data-modo]');
    if(tarjeta)historial.ir(tarjeta.dataset.modo);
  });
  for(const id of ['modosVolver','volverPlegado'])$(id).onclick=()=>historial.volver();
  $('nueva').onclick=nuevaRonda;
  $('accion').onclick=revisar;
  $('escuchar').onclick=()=>leer();
  monto.addEventListener('keydown',evento=>{if(evento.key==='Enter'){evento.preventDefault();revisar();}});
  monto.addEventListener('input',()=>anunciar());
  TecladoEnPantalla.instalar($('respuesta'),$('teclado'),{limpiar:true});

  const ajustes=$('ajustes');
  function rotularAjustes() {
    $('denominaciones').innerHTML=valores.map(valor=>`<label><input type="checkbox" value="${valor}" aria-label="${etiquetaDinero(valor)}" ${opciones.activas.includes(valor)?'checked':''}>${pieza(valor)}</label>`).join('');
  }
  $('configurar').onclick=()=>{
    limpiarArrastre();
    rotularAjustes();
    $('ayudas').checked=opciones.ayudas;
    $('narracion').checked=opciones.narracion;
    $('errorAjustes').hidden=true;
    IdiomaVoz.iniciarEdicion();
    ajustes.showModal();
  };
  function aplicarAjustes() {
    const activas=[...$('denominaciones').querySelectorAll('input:checked')].map(input=>Number(input.value));
    if(!activas.length){$('errorAjustes').hidden=false;return;}
    const cambio=activas.join()!==opciones.activas.join();
    opciones={activas,ayudas:$('ayudas').checked,narracion:$('narracion').checked};
    Matematicas.guardar(clave,opciones);
    ajustes.close();
    IdiomaVoz.aplicarEdicion();
    mostrarBanco();
    if(cambio&&modo)nuevaRonda();
    else render();
  }
  $('denominaciones').addEventListener('change',()=>{$('errorAjustes').hidden=true;});
  $('cerrar').onclick=aplicarAjustes;
  ajustes.querySelector('form').onsubmit=evento=>{evento.preventDefault();aplicarAjustes();};
  ajustes.addEventListener('cancel',evento=>{evento.preventDefault();aplicarAjustes();});
  function localizar() {
    mostrarModos();
    mostrarBanco();
    $('guiaModo').textContent=t(modo?modos[modo].guia:'Elige una actividad para practicar con monedas y billetes de Costa Rica.');
    render();
    anunciar();
    window.dispatchEvent(new Event('resize'));
  }
  IdiomaVoz.instalar('#vozColones',{cambioIdioma:localizar});
  const observarPanel=new MutationObserver(()=>{$('volverPlegado').hidden=!app.classList.contains('panel-lateral-oculto');});
  observarPanel.observe(app,{attributes:true,attributeFilter:['class']});
  Matematicas.pantalla(app,(alto,z)=>{
    const estilo=document.documentElement.style;
    estilo.setProperty('--u',1/z+'px');
    estilo.setProperty('--alto',alto+'px');
    estilo.setProperty('--ancho',document.documentElement.clientWidth/z+'px');
  });
  localizar();
  historial.restaurar();
})();
