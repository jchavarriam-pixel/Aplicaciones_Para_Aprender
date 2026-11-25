(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = $('appColones'), escena = $('escena');
  const contenido = $('contenido'), banco = $('banco'), monto = $('monto');
  const clave = 'colones.practica.v1';
  const valores = [10,25,50,100,500,1000,2000,5000,10000,20000];
  const largosBillete = {1000:125,2000:132,5000:139,10000:146,20000:153};
  const tipoDinero = valor => valor<1000 ? 'moneda' : 'billete';
  const modos = {
    contador:{nombre:'Contador de dinero',guia:'Agrega dinero y escucha cuánto pusiste y cuánto hay en total.'},
    contar:{nombre:'Cantidad en el sobre',guia:'Abre el sobre, cuenta y escribe cuánto dinero hay.'},
    llenar:{nombre:'Preparar un sobre',guia:'Elige monedas y billetes para formar una cantidad.'},
    alcanza:{nombre:'¿Me alcanza?',guia:'Compara tu dinero con el precio de un producto.'},
    exacto:{nombre:'Compra exacta',guia:'Elige un producto y paga su precio exacto en la caja.'},
    compra:{nombre:'Compra con vuelto',guia:'Compra un producto, paga de más y calcula el vuelto.'},
    carrito:{nombre:'Carrito de compras',guia:'Compra de dos a tres productos, paga y calcula el vuelto.'},
    cajero:{nombre:'Soy el cajero',guia:'Pasa los productos, recibe el pago y entrega el vuelto.'}
  };
  const productos = ['Manzana','Pan','Leche','Jugo','Cuaderno','Lápiz','Bananas','Pelota','Mochila'];
  const rangosPrecio = [[250,650],[350,1000],[700,1450],[400,1100],[800,3800],
    [100,550],[175,525],[1800,8000],[6500,24500]];
  const iniciales = [10,25,50,100,500,1000,2000];
  const guardado = Matematicas.leer(clave);
  const activas = valores.filter(valor => Array.isArray(guardado.activas) && guardado.activas.includes(valor));
  const limitarEscala = valor => Number.isFinite(valor) ? Math.max(70,Math.min(150,valor)) : 100;
  let opciones = {activas:activas.length ? activas : iniciales, ayudas:guardado.ayudas!==false,
    narracion:guardado.narracion!==false, apilarBilletes:guardado.apilarBilletes===true, tamanoBilletes:limitarEscala(guardado.tamanoBilletes)};
  let modo = null, fase, oferta, elegidos, piezas, sobre, dineroCliente, pagado;
  let arrastre = null, ignorarClic = false;
  let mesa, fichaElegida, animarSobre, cartera, mercanciaCliente, recibidos;
  let estacionCarrito=0, estacionAnterior=0;
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
  function prepararProductos() {
    const candidatos=new Map([[0,[]]]);
    // Tres piezas por producto dejan espacio para pagar varios artículos con el mismo banco.
    for(let n=0;n<3;n++){
      for(const [actual,piezas] of [...candidatos]){
        for(const valor of opciones.activas){
          const monto=actual+valor;
          if(!candidatos.has(monto))candidatos.set(monto,[...piezas,valor]);
        }
      }
    }
    candidatos.delete(0);
    const montos=[...candidatos.keys()];
    return barajar(productos.map((nombre,id)=>{
      const [min,max]=rangosPrecio[id];
      const dentro=montos.filter(x=>x>=min&&x<=max);
      const distancia=x=>Math.max(min-x,x-max,0);
      const cercanos=dentro.length?dentro:[...montos].sort((a,b)=>distancia(a)-distancia(b)).slice(0,2);
      const precio=tomar(cercanos);
      return {nombre,id,monedas:candidatos.get(precio),precio};
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
    estacionAnterior=estacionCarrito=0;
    piezas=[];
    sobre=formar(modo==='contar'?entero(3,7):entero(2,5));
    mesa=Array.from({length:10},(_,i)=>sobre[i]??null);
    fichaElegida=null;
    animarSobre=false;
    cartera=[];
    pagado=0;
    dineroCliente=[];
    if(modo==='cajero'){
      mercanciaCliente=oferta.slice(0,entero(2,3)).map((_,i)=>i);
      recibidos=new Set();
      const extra=entero(1,4)===1?[]:formar(entero(1,3));
      dineroCliente=compactar(mercanciaCliente.flatMap(i=>oferta[i].monedas).concat(extra));
    }
    if(modo==='alcanza'){
      const item=oferta[0];
      const tieneSuficiente=entero(0,1)===0;
      if(tieneSuficiente){
        cartera=item.monedas.concat(formar(entero(0,1)));
      }else if(item.monedas.length>1){
        cartera=item.monedas.slice(0,-1);
      }else{
        const valorMenor=opciones.activas[0];
        cartera=[valorMenor];
        if(valorMenor>=item.precio)item.precio+=valorMenor;
      }
      cartera=barajar(cartera);
    }
    cambiarFase(({contador:'medir',contar:'cerrado',llenar:'llenar',alcanza:'decidir',cajero:'escanear'})[modo]||'elegir');
  }
  function pieza(valor) {
    const medida=largosBillete[valor]?` style="--largo-billete:${largosBillete[valor]}"`:'';
    return `<span class="dinero ${tipoDinero(valor)}" data-valor="${valor}"${medida} aria-hidden="true"><img src="imagenes/dinero-${valor}.webp" alt="" draggable="false"></span>`;
  }
  const etiquetaDinero = valor => idioma(`${formato(valor)} en ${tipoDinero(valor)}`,`${formato(valor)} ${valor<1000?'coin':'banknote'}`);
  function mostrarBanco() {
    banco.innerHTML=opciones.activas.map(valor=>`<button type="button" class="origen-dinero" data-dinero="${valor}" aria-label="${etiquetaDinero(valor)}">${pieza(valor)}</button>`).join('');
  }
  function mostrarModos() {
    $('modos').innerHTML=Object.entries(modos).map(([id,{nombre,guia}],i) =>
      `<button type="button" class="tarjeta" data-modo="${id}" aria-labelledby="modo-${id}" aria-describedby="guia-${id}">
        <span class="arte-modo" style="--col:${i%4};--fila:${Math.floor(i/4)}" aria-hidden="true"></span>
        <span class="texto-modo"><strong id="modo-${id}">${t(nombre)}</strong><span id="guia-${id}" class="detalle-modo">${t(guia)}</span></span>
      </button>`
    ).join('');
  }
  function producto(item) {
    return `<span class="foto-producto" style="--col:${item.id%3};--fila:${Math.floor(item.id/3)}" aria-hidden="true"></span>`;
  }
  function etiquetaTotal(texto,valor) {
    return `<div class="dato-total"><span>${t(texto)}</span><strong>${formato(valor)}</strong></div>`;
  }
  const fasesDinero = new Set(['medir','llenar','pagar','dar']);
  const fasesNumericas = new Set(['contar','vuelto']);
  function envoltura() {
    return '<span class="cuerpo-sobre" aria-hidden="true"><span class="solapa-sobre"></span><span class="sello">₡</span></span>';
  }
  function verMesa() {
    const editable=fase==='contar';
    const fichas=mesa.map((valor,i)=>{
      const interior=valor?pieza(valor):'';
      const etiqueta=valor?etiquetaDinero(valor):idioma(`Espacio ${i+1}`,`Space ${i+1}`);
      const marca=`class="celda-mesa" data-celda="${i}" style="--turno:${i}" aria-label="${etiqueta}"`;
      return editable
        ? `<button type="button" ${marca} aria-pressed="${fichaElegida===i}">${interior}</button>`
        : `<span ${marca} ${valor?'role="img"':''}>${interior}</span>`;
    }).join('');
    return `<section class="tablero-mesa ${animarSobre?'abriendo':''}">
      <header><div class="sobre-mini">${envoltura()}</div><h3>${t('Dinero sobre la mesa')}</h3>
      ${editable?`<button type="button" id="ordenarMesa">${t('Agrupar por valor')}</button>`:''}</header>
      <div class="dinero-en-sobre mesa" aria-label="${t('Dinero sobre la mesa')}">${fichas}</div>
      ${editable?'':etiquetaTotal('Monto del sobre',sumar(sobre))}
      </section>`;
  }
  function verSobre() {
    if(fase==='cerrado') return `<button type="button" class="sobre cerrado" id="abrirSobre">${envoltura()}<strong>${t('Abrir sobre')}</strong></button>`;
    if(modo==='contar')return verMesa();
    return `<div class="meta-sobre">${etiquetaTotal('Tu sobre',sumar(sobre))}</div>`+destino('Dinero en el sobre','sobre abierto');
  }
  function verContador() {
    return `<section class="contador-caja"><div class="pantalla-contador">
      ${etiquetaTotal('Última pieza',piezas.at(-1)??0)}${etiquetaTotal('Total contado',sumar(piezas))}</div>
      ${destino('Pon aquí el dinero')}</section>`;
  }
  function verAlcance() {
    const item=oferta[0];
    return `<div class="reto-alcance"><section class="producto-alcance">${producto(item)}<h3>${t(item.nombre)}</h3><b class="etiqueta-precio">${formato(item.precio)}</b></section>
      <section class="cartera"><h3>${t('Tu dinero')}</h3><div class="dinero-en-sobre">${cartera.map(valor=>`<span role="img" aria-label="${etiquetaDinero(valor)}">${pieza(valor)}</span>`).join('')}</div>
      ${opciones.ayudas||fase==='listo'?etiquetaTotal('Total disponible',sumar(cartera)):''}</section></div>
      ${fase==='decidir'?`<div class="decidir"><button type="button" data-alcanza="si">${t('Sí me alcanza')}</button><button type="button" data-alcanza="no">${t('No me alcanza')}</button></div>`:''}`;
  }
  function fichasPago(editable=false) {
    const agruparMonedas=modo==='contador'||modo==='llenar';
    const grupos=[];
    const agrupados=new Map();
    for(const valor of piezas){
      const agrupar=largosBillete[valor]?opciones.apilarBilletes:agruparMonedas;
      if(agrupar&&agrupados.has(valor))agrupados.get(valor).cantidad++;
      else{
        const ficha={valor,cantidad:1};
        grupos.push(ficha);
        if(agrupar)agrupados.set(valor,ficha);
      }
    }
    return grupos.map(({valor,cantidad})=>{
      const apilado=cantidad>1&&largosBillete[valor];
      const imagen=apilado
        ? `<span class="pila-billetes" style="--cantidad-pila:${cantidad-1}" aria-hidden="true">${Array.from({length:cantidad},(_,i)=>
          `<span style="--capa:${cantidad-1-i}">${pieza(valor)}</span>`).join('')}</span>`
        : pieza(valor)+(cantidad>1?`<b class="cantidad-piezas">×${cantidad}</b>`:'');
      const etiqueta=cantidad>1?`${cantidad} × ${etiquetaDinero(valor)}`:etiquetaDinero(valor);
      const quitar=cantidad>1?idioma(`${etiqueta}. Quitar una pieza.`,`${etiqueta}. Remove one piece.`):
        idioma(`Quitar ${etiqueta}`,`Remove ${etiqueta}`);
      return editable
        ? `<button type="button" class="pieza-colocada" data-quitar="${valor}" aria-label="${quitar}">${imagen}</button>`
        : `<span class="pieza-colocada" role="img" aria-label="${etiqueta}">${imagen}</span>`;
    }).join('');
  }
  function destino(rotulo,estilo='mostrador') {
    const editable=fasesDinero.has(fase);
    const esPago=modo!=='contador'&&modo!=='llenar';
    const fichas=fichasPago(editable);
    return `<section id="destinoDinero" class="${estilo} zona-dinero"><header><h3>${t(rotulo)}</h3>${modo!=='contador'&&(opciones.ayudas||fase==='listo')&&fichas?`<b>${formato(sumar(piezas))}</b>`:''}</header>
      <div class="piezas-colocadas ${esPago?'piezas-pago':''}">${fichas||`<span>${t(fase==='recibir'?'Guarda aquí el pago del cliente.':'Toca o arrastra una pieza.')}</span>`}</div></section>`;
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
  function verProductoEnEstante(i) {
    if(elegidos.includes(i))return '<span class="hueco-estante" aria-hidden="true"></span>';
    const item=oferta[i];
    return `<button type="button" class="producto" data-producto="${i}">${producto(item)}<span><strong>${t(item.nombre)}</strong><b class="etiqueta-precio">${formato(item.precio)}</b></span></button>`;
  }
  function productosEnCesta() {
    return elegidos.map(i=>`<button type="button" data-devolver="${i}" aria-label="${idioma('Devolver '+oferta[i].nombre,'Return '+t(oferta[i].nombre))}">${producto(oferta[i])}</button>`).join('');
  }
  function verPasillo() {
    const columna=(lado,indices)=>`<div class="lado-estante ${lado}" data-estante>${indices.map(verProductoEnEstante).join('')}</div>`;
    const moviendo=estacionAnterior!==estacionCarrito?' paseando':'';
    return `<div class="pasillo" id="estante">
      ${columna('izquierdo',[0,2,4])}
      <div class="camino-carrito">
        <div id="cesta" class="carrito-pasillo${moviendo}" style="--estacion:${estacionCarrito};--estacion-origen:${estacionAnterior}" role="group" aria-label="${t('Tu carrito')}">
          <img src="imagenes/carrito-arriba.webp" alt="" draggable="false">
          <div class="carga-carrito">${productosEnCesta()}</div>
        </div>
      </div>
      ${columna('derecho',[1,3,5])}
    </div>
    <div class="controles-pasillo">
      <button type="button" data-paso="-1" ${estacionCarrito===0?'disabled':''}>${t('Retroceder')}</button>
      <span><b>${formato(precio())}</b><small>${idioma(`Parada ${estacionCarrito+1} de 3`,`Stop ${estacionCarrito+1} of 3`)}</small></span>
      <button type="button" data-paso="1" ${estacionCarrito===2?'disabled':''}>${t('Avanzar')}</button>
    </div>`;
  }
  function situarCarrito(estacion) {
    estacionAnterior=estacionCarrito;
    estacionCarrito=Math.max(0,Math.min(2,estacion));
  }
  function estante() {
    if(modo!=='cajero')return verPasillo();
    return `<div class="estante mostrador-cliente" id="estante">${mercanciaCliente.map(verProductoEnEstante).join('')}</div>
      <section class="cesta cesta-caja" id="cesta"><header><h3>${t('Cesta de la caja')}</h3><strong data-total-carrito>${formato(precio())}</strong></header>
      <div class="carrito-real"><div class="rejilla-carrito">${productosEnCesta()}</div></div></section>`;
  }
  function vistaCliente(mensaje) {
    return `<div class="cliente ${fase==='escanear'&&!elegidos.length?'llega-cliente':''}"><img src="imagenes/cliente.webp" alt=""><p>${t(mensaje)}</p></div>`;
  }
  function recibirPago() {
    const efectivo=dineroCliente.map((valor,i)=>recibidos.has(i)?'':
      `<button type="button" class="origen-dinero" data-recibir="${i}" aria-label="${etiquetaDinero(valor)}">${pieza(valor)}</button>`).join('');
    return vistaCliente('Aquí está mi pago.')+
      `<div class="entrega-cliente ${recibidos.size?'':'efectivo-nuevo'}"><h3>${t('Dinero en el mostrador')}</h3><div class="pago-cliente">${efectivo||`<span>${t('Pago guardado en la caja.')}</span>`}</div></div>`+
      destino('Caja registradora','mostrador caja-registradora');
  }
  function comprobante() {
    const esCajero=modo==='cajero';
    const listado=elegidos.map(i=>{
      const item=oferta[i];
      return `<li>${producto(item)}<span>${t(item.nombre)}</span><strong>${formato(item.precio)}</strong></li>`;
    }).join('');
    return `<section class="recibo">
      <ul ${esCajero?'aria-label="'+t('Productos del cliente')+'"':''}>${listado}</ul>
      ${etiquetaTotal('Precio total',precio())}
      ${esCajero&&(fase==='dar'||fase==='listo')?etiquetaTotal('El cliente paga',pagado):''}
      ${!esCajero&&(fase==='vuelto'||(fase==='listo'&&pagado))?etiquetaTotal('Pagaste',pagado):''}
      ${!esCajero&&pagado?`<div class="piezas-colocadas piezas-pago pago-entregado" role="group" aria-label="${t('Tu pago')}">${fichasPago()}</div>`:''}
      ${fase==='listo'&&pagado&&modo!=='exacto'?etiquetaTotal('Vuelto',aCambio()):''}
      </section>`;
  }
  function instruccion() {
    switch(fase){
      case 'medir': return t('Toca o arrastra monedas y billetes al contador.');
      case 'decidir': return t('¿Te alcanza el dinero para comprarlo?');
      case 'cerrado': return t('Toca el sobre para abrirlo.');
      case 'contar': return t('Acomoda el dinero y escribe cuánto hay en total.');
      case 'llenar': return idioma(`Pon ${formato(sumar(sobre))} en el sobre.`,`Put ${formato(sumar(sobre))} in the envelope.`);
      case 'elegir': return t(modo==='carrito'?'Escoge de dos a tres productos y llévalos a la caja.':'Escoge un producto y llévalo a la caja.');
      case 'pagar': return t(modo==='exacto'?'Pon el pago exacto en la caja.':'Paga más que el total y calcula el vuelto.');
      case 'vuelto': return t('¿Cuánto vuelto deben darte?');
      case 'escanear': return t('Pasa a la cesta cada producto que puso el cliente.');
      case 'recibir': return t('Toma el dinero del mostrador y guárdalo en la caja.');
      case 'dar': return t('Forma el vuelto y entrégaselo al cliente.');
      default: return t('¡Lo lograste!');
    }
  }
  function actualizarContenido() {
    if(modo==='contar'||modo==='llenar') contenido.innerHTML=verSobre();
    else if(modo==='contador') contenido.innerHTML=verContador();
    else if(modo==='alcanza') contenido.innerHTML=verAlcance();
    else if(fase==='elegir'){
      contenido.innerHTML=estante();
      estacionAnterior=estacionCarrito;
    }
    else if(fase==='escanear') contenido.innerHTML=vistaCliente('Estos son mis productos.')+estante();
    else if(fase==='recibir') contenido.innerHTML=recibirPago();
    else{
      contenido.innerHTML=(fase==='dar'?vistaCliente('¿Me das el vuelto?'):'')+comprobante()+
        (fase==='pagar'?destino('Tu pago'):fase==='dar'?destino('Vuelto para el cliente'):
          fase==='listo'&&modo==='cajero'&&aCambio()>0?destino('Vuelto para el cliente'):'');
    }
  }
  function render() {
    if(!modo)return;
    $('tituloModo').textContent=t(modos[modo].nombre);
    $('instruccion').textContent=instruccion();
    $('bancoPanel').hidden=!fasesDinero.has(fase);
    $('bancoTitulo').textContent=t(fase==='dar'?'Caja registradora':'Banco de dinero');
    $('respuesta').hidden=!fasesNumericas.has(fase);
    escena.dataset.fase=fase;
    actualizarContenido();
    $('accion').hidden=fase==='cerrado'||fase==='decidir';
    $('accion').textContent=t(({medir:'Vaciar contador',elegir:'Ir a la caja',escanear:'Cobrar',recibir:'Registrar pago',pagar:'Pagar',dar:'Dar vuelto',listo:'Siguiente ronda'})[fase]||'Revisar');
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
    if(fase==='listo'||fase==='medir') return nuevaRonda();
    if(fase==='cerrado'||fase==='decidir') return;
    if(fase==='elegir'){
      if(elegidos.length<(modo==='carrito'?2:1)) return anunciar(modo==='carrito'?'Elige dos o tres productos.':'Elige un producto primero.');
      cambiarFase('pagar');
      $('banco').firstElementChild.focus({preventScroll:true});
      return;
    }
    if(fase==='escanear'){
      if(elegidos.length!==mercanciaCliente.length)return anunciar('Pasa todos los productos a la cesta antes de cobrar.');
      return cambiarFase('recibir');
    }
    if(fase==='recibir'){
      if(recibidos.size!==dineroCliente.length)return anunciar('Todavía queda dinero del cliente en el mostrador.');
      pagado=sumar(piezas);
      piezas=[];
      if(pagado===precio())return completar();
      return cambiarFase('dar');
    }
    if(fasesNumericas.has(fase)){
      if(!monto.value)return anunciar('Escribe un monto con el teclado.');
      const meta=fase==='contar'?sumar(sobre):aCambio();
      if(Number(monto.value)!==meta)return anunciar(fase==='contar'?'Cuenta el dinero otra vez.':'Resta el precio total al dinero que pagaste.');
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
    if(total===meta){
      if(fase==='pagar')pagado=total;
      return completar();
    }
    anunciar(fase==='dar'?'El cliente necesita un vuelto distinto. Revisa la diferencia.':total<meta?'Falta dinero.':'Hay dinero de más. Quita alguna pieza.');
  }
  function agregarDinero(valor) {
    if(!opciones.activas.includes(valor)||!fasesDinero.has(fase))return;
    if(piezas.length>=24)return anunciar('Límite de piezas. Quita alguna para agregar otra.');
    piezas.push(valor);
    anunciar();
    actualizarContenido();
    if(modo==='contador'&&opciones.narracion)leer(idioma(
      `Pusiste ${formato(valor)}. Hay ${formato(sumar(piezas))} en total.`,
      `You added ${formato(valor)}. The total is ${formato(sumar(piezas))}.`));
  }
  function elegirProducto(i) {
    if(!['elegir','escanear'].includes(fase)||!oferta[i]||elegidos.includes(i))return;
    if(modo==='carrito'&&elegidos.length===3)return anunciar('Puedes llevar hasta tres productos.');
    if(modo!=='carrito'&&modo!=='cajero')elegidos=[];
    elegidos.push(i);
    if(fase==='elegir')situarCarrito(Math.floor(i/2));
    anunciar();
    actualizarContenido();
  }
  function devolverProducto(i) {
    if(!['elegir','escanear'].includes(fase)||!elegidos.includes(i))return;
    elegidos=elegidos.filter(id=>id!==i);
    anunciar();
    actualizarContenido();
  }
  function guardarPago(i) {
    if(fase!=='recibir'||!dineroCliente[i]||recibidos.has(i))return;
    const valor=dineroCliente[i];
    recibidos.add(i);
    piezas.push(valor);
    anunciar();
    actualizarContenido();
  }
  function moverEnMesa(origen,destino) {
    if(fase!=='contar'||!mesa[origen])return;
    [mesa[origen],mesa[destino]]=[mesa[destino],mesa[origen]];
    fichaElegida=null;
    animarSobre=false;
    actualizarContenido();
  }
  function tocarMesa(i) {
    if(fichaElegida!==null&&fichaElegida!==i)moverEnMesa(fichaElegida,i);
    else{
      fichaElegida=mesa[i]&&fichaElegida!==i ? i : null;
      animarSobre=false;
      actualizarContenido();
    }
    contenido.querySelector(`[data-celda="${i}"]`).focus({preventScroll:true});
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
  const fuentesArrastre = [
    {clave:'dinero',destino:'#destinoDinero',soltar:agregarDinero},
    {clave:'producto',destino:'#cesta',soltar:elegirProducto},
    {clave:'devolver',destino:'[data-estante],.mostrador-cliente',soltar:devolverProducto},
    {clave:'recibir',destino:'#destinoDinero',soltar:guardarPago},
    {clave:'celda',destino:'button[data-celda]',soltar:(i,nodo)=>moverEnMesa(i,Number(nodo.dataset.celda))}
  ];
  escena.addEventListener('pointerdown',evento=>{
    ignorarClic=false;
    const origen=evento.target.closest('button[data-dinero],button[data-producto],button[data-devolver],button[data-recibir],button[data-celda]');
    if(!origen||evento.button!==0||evento.isPrimary===false||arrastre)return;
    const fuente=fuentesArrastre.find(({clave})=>Object.hasOwn(origen.dataset,clave));
    if(!origen.firstElementChild)return;
    arrastre={id:evento.pointerId,origen,fuente,
      x:evento.clientX,y:evento.clientY,valor:Number(origen.dataset[fuente.clave])};
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
    d.destino=document.elementFromPoint(x,y)?.closest(d.fuente.destino);
    d.destino?.classList.add('sobre-destino');
  });
  addEventListener('pointerup',evento=>{
    const d=arrastre;
    if(d?.id!==evento.pointerId)return;
    if(d.fantasma){
      ignorarClic=true;
      const destino=document.elementFromPoint(evento.clientX,evento.clientY)?.closest(d.fuente.destino);
      if(destino)d.fuente.soltar(d.valor,destino);
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
    if(boton.id==='abrirSobre') {
      animarSobre=true;
      cambiarFase('contar');
      monto.focus({preventScroll:true});
    }
    else if(boton.id==='ordenarMesa') {
      const ordenadas=mesa.filter(Boolean).sort((a,b)=>a-b);
      mesa=mesa.map((_,i)=>ordenadas[i]??null);
      fichaElegida=null;
      animarSobre=false;
      actualizarContenido();
      $('ordenarMesa').focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-alcanza')){
      const afirmativa=boton.dataset.alcanza==='si';
      if(afirmativa===(sumar(cartera)>=oferta[0].precio)){
        completar();
      }else anunciar('Compara tu dinero con la etiqueta de precio.');
    }
    else if(boton.hasAttribute('data-paso')){
      const paso=Number(boton.dataset.paso);
      situarCarrito(estacionCarrito+paso);
      actualizarContenido();
      (contenido.querySelector(`[data-paso="${paso}"]:enabled`)||contenido.querySelector('[data-paso]:enabled'))?.focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-dinero')) agregarDinero(Number(boton.dataset.dinero));
    else if(boton.hasAttribute('data-producto')) {
      const i=Number(boton.dataset.producto);
      elegirProducto(i);
      contenido.querySelector(`[data-devolver="${i}"]`)?.focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-devolver')) {
      const i=Number(boton.dataset.devolver);
      devolverProducto(i);
      contenido.querySelector(`[data-producto="${i}"]`)?.focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-celda')) tocarMesa(Number(boton.dataset.celda));
    else if(boton.hasAttribute('data-recibir')){
      guardarPago(Number(boton.dataset.recibir));
      escena.querySelector('[data-recibir]')?.focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-quitar')) quitarDinero(Number(boton.dataset.quitar));
  });
  escena.addEventListener('animationend',evento=>{
    if(evento.animationName==='abrirSolapa')animarSobre=false;
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
  const deslizador=$('tamanoBilletes');
  $('muestraBilletes').innerHTML=[1000,20000].map(pieza).join('');
  function previsualizarTamano() {
    const valor=Number(deslizador.value);
    ajustes.style.setProperty('--escala-billetes',valor/100);
    $('porcentajeBilletes').value=valor+' %';
  }
  deslizador.addEventListener('input',previsualizarTamano);
  function aplicarTamano() {
    document.documentElement.style.setProperty('--escala-billetes',opciones.tamanoBilletes/100);
  }
  function rotularAjustes() {
    $('denominaciones').innerHTML=valores.map(valor=>`<label><input type="checkbox" value="${valor}" aria-label="${etiquetaDinero(valor)}" ${opciones.activas.includes(valor)?'checked':''}>${pieza(valor)}</label>`).join('');
  }
  $('configurar').onclick=()=>{
    limpiarArrastre();
    rotularAjustes();
    $('ayudas').checked=opciones.ayudas;
    $('narracion').checked=opciones.narracion;
    $('apilarBilletes').checked=opciones.apilarBilletes;
    deslizador.value=opciones.tamanoBilletes;
    previsualizarTamano();
    $('errorAjustes').hidden=true;
    IdiomaVoz.iniciarEdicion();
    ajustes.showModal();
  };
  function aplicarAjustes() {
    const activas=[...$('denominaciones').querySelectorAll('input:checked')].map(input=>Number(input.value));
    if(!activas.length){$('errorAjustes').hidden=false;return;}
    const cambio=activas.join()!==opciones.activas.join();
    opciones={activas,ayudas:$('ayudas').checked,narracion:$('narracion').checked,
      apilarBilletes:$('apilarBilletes').checked,tamanoBilletes:limitarEscala(Number(deslizador.value))};
    Matematicas.guardar(clave,opciones);
    aplicarTamano();
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
  aplicarTamano();
  localizar();
  historial.restaurar();
})();
