(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = $('appColones'), escena = $('escena');
  const contenido = $('contenido'), banco = $('banco'), monto = $('monto');
  const clave = 'colones.practica.v1';
  const valores = [10,25,50,100,500,1000,2000,5000,10000,20000];
  const largosBillete = {1000:125,2000:132,5000:139,10000:146,20000:153};
  const diametrosMoneda = {10:.76,25:.81,50:.87,100:.92,500:1};
  const tipoDinero = valor => valor<1000 ? 'moneda' : 'billete';
  const modos = {
    contador:{nombre:'Contador de dinero',guia:'Agrega dinero y escucha cuánto pusiste y cuánto hay en total.'},
    contar:{nombre:'Cantidad en el sobre',guia:'Abre el sobre, cuenta y escribe cuánto dinero hay.'},
    llenar:{nombre:'Preparar un sobre',guia:'Elige monedas y billetes para formar una cantidad.'},
    alcanza:{nombre:'¿Me alcanza?',guia:'Compara tu dinero con el precio de un producto.'},
    exacto:{nombre:'Compra exacta',guia:'Elige un producto y paga su precio exacto en la caja.'},
    compra:{nombre:'Compra con vuelto',guia:'Compra un producto y revisa el vuelto cuando haga falta.'},
    carrito:{nombre:'Carrito de compras',guia:'Compra dos o tres productos y revisa el vuelto cuando haga falta.'},
    cajero:{nombre:'Soy el cajero',guia:'Pasa los productos, recibe el pago y entrega el vuelto.'}
  };
  const productos = ['Manzana','Pan','Leche','Jugo','Cuaderno','Lápiz','Bananas','Pelota','Mochila'];
  const imagenesProductos = ['manzana','pan','leche','jugo','cuaderno','lapiz','bananas','pelota','mochila'];
  const rangosPrecio = [[250,650],[350,1000],[700,1450],[400,1100],[800,3800],
    [100,550],[175,525],[1800,8000],[6500,24500]];
  const iniciales = [10,25,50,100,500,1000,2000];
  const guardado = Matematicas.leer(clave);
  const activas = valores.filter(valor => Array.isArray(guardado.activas) && guardado.activas.includes(valor));
  const tiposVuelto=['correcto','incorrecto','mixto'];
  const limitarEscala = (valor,control) => Number.isFinite(valor)
    ? Math.max(Number(control.min),Math.min(Number(control.max),valor)) : Number(control.defaultValue);
  let opciones = {activas:activas.length ? activas : iniciales, ayudas:guardado.ayudas!==false,
    narracion:guardado.narracion!==false, apilarBilletes:guardado.apilarBilletes===true,
    tamanoBilletes:limitarEscala(guardado.tamanoBilletes,$('tamanoBilletes')),
    tamanoMonedas:limitarEscala(guardado.tamanoMonedas,$('tamanoMonedas')), nombresProductos:guardado.nombresProductos!==false,
    vueltoCaja:tiposVuelto.includes(guardado.vueltoCaja)?guardado.vueltoCaja:'correcto'};
  let modo = null, fase, oferta, elegidos, piezas, sobre, dineroCliente, pagado;
  let compraCaja=null;
  let audioLector;
  let arrastre = null, ignorarClic = false;
  let mesa, posicionesMesa, fichaElegida, aperturaSobre, cartera, mercanciaCliente, recibidos;
  const tiemposSobre={abrir:560,pausa:160,salir:520,intervalo:90};
  let avancePasillo=0, animacionPasillo=0, empuje=null, llegadaCaja=null;
  const velocidadInicialPasillo=1.25;
  let velocidadPasillo=velocidadInicialPasillo;
  const mesasPorVuelta=6, pasoMesa=.36, inicioMesa=-.66, primeraMesa=.14;
  const distanciaDesdeUltimaMesa=1.40, profundidadCajaFinal=.75, alturaReferenciaCaja=.34;
  const vueltaPasillo=valor=>((valor%mesasPorVuelta)+mesasPorVuelta)%mesasPorVuelta;
  const imagenCaja='imagenes/caja-registro-frontal.webp';
  const movimientoReducido=matchMedia('(prefers-reduced-motion: reduce)');
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
  // El conteo opcional limita la búsqueda al dinero que hay en la cartera.
  function formarEfectivo(cantidad,existencias) {
    const orden=[...opciones.activas].reverse();
    const memo=new Set();
    function buscar(resto,i,libres) {
      if(resto===0) return [];
      const valor=orden[i];
      if(!valor || resto>valor*libres) return null;
      const disponibles=existencias?(existencias.get(valor)||0):libres;
      const posibles=Math.min(libres,disponibles,Math.floor(resto/valor));
      if(i===orden.length-1) return resto===posibles*valor?Array(posibles).fill(valor):null;
      const estado=resto+':'+i+':'+libres;
      if(memo.has(estado)) return null;
      memo.add(estado);
      for(let n=posibles;n>=0;n--){
        const cola=buscar(resto-n*valor,i+1,libres-n);
        if(cola)return Array(n).fill(valor).concat(cola);
      }
      return null;
    }
    return buscar(cantidad,0,24);
  }
  function pagoQueRequiereVuelto(total) {
    const alternativas=opciones.activas.filter(valor=>total%valor!==0).map(valor=>{
      const cantidad=Math.floor(total/valor)+1;
      return {valor,cantidad,vuelto:cantidad*valor-total};
    }).filter(pago=>pago.cantidad<=24).sort((a,b)=>a.cantidad-b.cantidad||a.vuelto-b.vuelto);
    const pago=alternativas.find(({vuelto})=>formarEfectivo(vuelto));
    return pago?Array(pago.cantidad).fill(pago.valor):null;
  }
  function cerrarCompraCaja(){
    if(!compraCaja)return;
    for(const timer of compraCaja.temporizadores)clearTimeout(timer);
    compraCaja=null;
  }
  function nuevaRonda() {
    if(!modo)return;
    limpiarArrastre();
    cerrarCompraCaja();
    cancelarAperturaSobre();
    oferta=prepararProductos();
    elegidos=[];
    cancelarRecorrido();
    avancePasillo=0;
    velocidadPasillo=velocidadInicialPasillo;
    piezas=[];
    sobre=formar(modo==='contar'?entero(3,7):entero(2,5));
    mesa=[...sobre];
    posicionesMesa=posicionesIniciales();
    fichaElegida=null;
    cartera=[];
    pagado=0;
    dineroCliente=[];
    if(modo==='cajero'){
      mercanciaCliente=oferta.slice(0,entero(2,3)).map((_,i)=>i);
      recibidos=new Set();
      const exacto=mercanciaCliente.flatMap(i=>oferta[i].monedas);
      const conVuelto=entero(1,4)===1?null:pagoQueRequiereVuelto(sumar(exacto));
      dineroCliente=conVuelto||compactar(exacto);
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
    const medida=largosBillete[valor]?`--largo-billete:${largosBillete[valor]}`:`--diametro-moneda:${diametrosMoneda[valor]}`;
    return `<span class="dinero ${tipoDinero(valor)}" data-valor="${valor}" style="${medida}" aria-hidden="true"><img src="imagenes/dinero-${valor}.webp" alt="" draggable="false"></span>`;
  }
  const etiquetaDinero = valor => idioma(`${formato(valor)} en ${tipoDinero(valor)}`,`${formato(valor)} ${valor<1000?'coin':'banknote'}`);
  function actualizarCarteraCompra() {
    if(!compraCaja||fase!=='pagar')return;
    const ocupadas=contarPiezas(piezas);
    for(const boton of banco.children){
      const valor=Number(boton.dataset.dinero);
      const disponibles=compraCaja.cartera.get(valor)-(ocupadas.get(valor)||0);
      boton.disabled=disponibles===0;
      boton.querySelector('b').textContent='×'+disponibles;
      boton.setAttribute('aria-label',idioma(`${etiquetaDinero(valor)}. Disponibles: ${disponibles}.`,`${etiquetaDinero(valor)}. Available: ${disponibles}.`));
    }
  }
  function mostrarBanco() {
    const carteraAbierta=Boolean(compraCaja&&fase==='pagar');
    const disponibles=carteraAbierta?opciones.activas.filter(valor=>compraCaja.cartera.has(valor)):opciones.activas;
    banco.innerHTML=disponibles.map(valor=>`<button type="button" class="origen-dinero" data-dinero="${valor}" aria-label="${etiquetaDinero(valor)}">${pieza(valor)}${carteraAbierta?'<b class="cantidad-piezas" aria-hidden="true"></b>':''}</button>`).join('');
    actualizarCarteraCompra();
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
    return `<img class="foto-producto" src="imagenes/productos/${imagenesProductos[item.id]}.png" alt="" draggable="false">`;
  }
  function etiquetaTotal(texto,valor) {
    return `<div class="dato-total"><span>${t(texto)}</span><strong>${formato(valor)}</strong></div>`;
  }
  const fasesDinero = new Set(['medir','llenar','pagar','dar']);
  const fasesNumericas = new Set(['contar','corregir-vuelto']);
  function envoltura() {
    return '<span class="cuerpo-sobre" aria-hidden="true"><span class="boca-sobre"></span><span class="bolsillo-sobre"></span><span class="solapa-sobre"></span><span class="sello">₡</span></span>';
  }
  function verMesa() {
    const cerrado=fase==='cerrado';
    const editable=fase==='contar';
    const ocupado=Boolean(aperturaSobre);
    const fichas=mesa.map((valor,i)=>{
      const interior=pieza(valor);
      const marca=`class="ficha-mesa" data-ficha-mesa="${i}" style="--turno:${i}" aria-label="${etiquetaDinero(valor)}"`;
      return editable
        ? `<button type="button" ${marca} aria-pressed="${fichaElegida===i}" ${ocupado?'disabled':''}>${interior}</button>`
        : `<span ${marca} role="img">${interior}</span>`;
    }).join('');
    const {abrir,pausa,salir,intervalo}=tiemposSobre;
    const animacion=ocupado?`data-apertura style="--tiempo-solapa:${abrir}ms;--inicio-vaciado:${abrir+pausa}ms;--tiempo-salida:${salir}ms;--intervalo-salida:${intervalo}ms;--tiempo-vaciado:${salir+(mesa.length-1)*intervalo}ms;--transcurrido:${performance.now()-aperturaSobre.inicio}ms"`:'';
    return `<section class="tablero-mesa" data-sobre="${cerrado?'cerrado':'abierto'}" ${animacion}>
      <header>
        <button class="sobre-mesa" type="button" id="abrirSobre" ${cerrado?'':'disabled aria-hidden="true"'}>${envoltura()}<span class="rotulo-sobre">${t('Abrir sobre')}</span></button>
        <div class="controles-mesa"><h3>${t('Dinero sobre la mesa')}</h3>
          ${cerrado||editable?`<button type="button" id="ordenarMesa" ${cerrado||ocupado?'disabled':''}>${t('Agrupar por valor')}</button>`:''}
        </div>
      </header>
      <div class="mesa-libre" role="group" aria-label="${t('Dinero sobre la mesa')}" ${cerrado||ocupado?'aria-hidden="true"':''}>${fichas}</div>
      ${fase==='listo'?etiquetaTotal('Monto del sobre',sumar(sobre)):''}
      </section>`;
  }
  function verSobre() {
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
  function fichasPago(editable=false,efectivo=piezas) {
    const agruparMonedas=modo==='contador'||modo==='llenar';
    const grupos=[];
    const agrupados=new Map();
    for(const valor of efectivo){
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
  function verPuesto(i,tramo) {
    const item=oferta[i];
    const nombre=t(item.nombre);
    const monto=formato(item.precio);
    const mercancia=elegidos.includes(i)?'<span class="hueco-estante" aria-hidden="true"></span>':
      `<button type="button" class="producto" data-producto="${i}" aria-label="${nombre}, ${monto}">
        ${producto(item)}${opciones.nombresProductos?`<span class="globo-producto" aria-hidden="true">${nombre}</span>`:''}
      </button>`;
    return `<div class="puesto-estante" data-tramo="${tramo}" data-lado="${i%2===0?-1:1}">
      <svg class="mesa-exhibicion" preserveAspectRatio="none" aria-hidden="true">
        <path class="sombra-mesa"></path><path class="patas-mesa"></path><path class="canto-mesa"></path><path class="tablero-exhibicion"></path>
      </svg>${mercancia}<div class="precio-estante"><b>${monto}</b></div></div>`;
  }
  function productosEnCesta() {
    return elegidos.map(i=>`<button type="button" data-devolver="${i}" aria-label="${idioma('Devolver '+oferta[i].nombre,'Return '+t(oferta[i].nombre))}">${producto(oferta[i])}</button>`).join('');
  }
  function verPasillo() {
    const columna=(lado,indice)=>`<div class="lado-estante ${lado}" data-estante>
      ${Array.from({length:mesasPorVuelta},(_,tramo)=>verPuesto((tramo%(oferta.length/2))*2+indice,tramo)).join('')}</div>`;
    return `<div class="pasillo" id="estante">
      <svg class="suelo-en-marcha" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><path></path></svg>
      ${columna('izquierdo',0)}
      <div class="caja-al-fondo" hidden><img src="${imagenCaja}" alt="" draggable="false"></div>
      <div class="camino-carrito">
        <button class="meta-caja" type="button" data-ir-caja>${t('Ir a la caja')}</button>
        <div id="cesta" class="carrito-pasillo" role="group" aria-label="${t('Tu carrito')}">
          <img src="imagenes/carrito-perspectiva.webp" alt="" draggable="false">
          <div class="carga-carrito">${productosEnCesta()}</div>
          <button id="empujarCarrito" type="button" aria-label="${t('Empuja el carrito')}"></button>
        </div>
      </div>
      ${columna('derecho',1)}
    </div>
    <div class="controles-pasillo">
      <button type="button" data-paso="-1">${t('Retroceder')}</button>
      <span><b>${formato(precio())}</b><small>${t('Mantén la manija arriba o abajo.')}</small></span>
      <button type="button" data-paso="1">${t('Avanzar')}</button>
    </div>`;
  }
  // Cámara a 60 grados sobre el piso. La coordenada longitudinal crece hacia el carrito.
  const senoCamara=Math.sin(Math.PI/3),cosenoCamara=Math.cos(Math.PI/3);
  function perspectiva(profundidad,altura) {
    const distancia=2.9-2.28*profundidad,vertical=1.3-altura;
    const fondo=distancia*cosenoCamara+vertical*senoCamara;
    return {fondo,vertical:(vertical*cosenoCamara-distancia*senoCamara)/fondo};
  }
  const horizonte=perspectiva(-.24,.13).vertical, recorteCercano=perspectiva(1,0).vertical;
  const proyectar=(x,profundidad,altura=0)=>{
    const p=perspectiva(profundidad,altura);
    return {x:50+45*x/p.fondo,y:100*(p.vertical-horizonte)/(recorteCercano-horizonte),fondo:p.fondo};
  };
  const fondoCajaAlLlegar=perspectiva(profundidadCajaFinal,alturaReferenciaCaja).fondo;
  function proyectarCaja(pasillo) {
    const caja=pasillo.querySelector('.caja-al-fondo');
    if(!llegadaCaja){caja.hidden=true;return;}
    const profundidad=llegadaCaja.profundidadCaja+llegadaCaja.salida;
    const borde=proyectar(0,profundidad).y;
    caja.hidden=borde<=0;
    if(caja.hidden)return;
    const fondo=perspectiva(profundidad,alturaReferenciaCaja).fondo;
    caja.style.top=borde+'%';
    caja.style.zIndex=Math.round((profundidad-inicioMesa)*100);
    caja.style.setProperty('--escala-caja',.43*fondoCajaAlLlegar/fondo);
  }
  const trazar= puntos=>puntos.map(({x,y},i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('')+'Z';
  function pintarSuelo(pasillo,avance) {
    const caminos=[];
    const desfase=avance*2%2;
    const punto=(columna,profundidad)=>proyectar(columna*.47,profundidad);
    for(let fila=-3;fila<6;fila++){
      const lejano=(fila+desfase)*pasoMesa/2,cercano=lejano+pasoMesa/2;
      for(let columna=-7;columna<7;columna++){
        if((fila+columna)%2===0)caminos.push(trazar([
          punto(columna,lejano),punto(columna+1,lejano),punto(columna+1,cercano),punto(columna,cercano)]));
      }
    }
    pasillo.querySelector('.suelo-en-marcha path').setAttribute('d',caminos.join(''));
  }
  function pintarMesa(puesto,profundidad) {
    const lado=Number(puesto.dataset.lado);
    const interior=lado*.59,exterior=lado*1.48;
    const lejos=profundidad-.116,cerca=profundidad+.116,altura=.27;
    const esquinas=[[interior,lejos],[exterior,lejos],[exterior,cerca],[interior,cerca]];
    const plano=elevacion=>esquinas.map(([x,z])=>proyectar(x,z,elevacion));
    const tablero=plano(altura),canto=plano(altura-.043),piso=plano(0);
    const xs=[...tablero,...piso].map(p=>p.x),ys=[...tablero,...piso].map(p=>p.y);
    const x=Math.min(...xs)-.8,y=Math.min(...ys)-.8;
    const ancho=Math.max(...xs)-x+.8,alto=Math.max(...ys)-y+.8;
    const svg=puesto.querySelector('svg');
    svg.setAttribute('viewBox',`${x} ${y} ${ancho} ${alto}`);
    svg.querySelector('.sombra-mesa').setAttribute('d',trazar(piso.map(p=>({x:p.x+.65,y:p.y+.7}))));
    const patas=esquinas.map(([a,z],i)=>{
      const haciaDentro=i===0||i===3 ? lado*.07 : -lado*.07;
      return trazar([tablero[i],proyectar(a+haciaDentro,z,altura),proyectar(a+haciaDentro,z),piso[i]]);
    });
    svg.querySelector('.patas-mesa').setAttribute('d',patas.join(''));
    svg.querySelector('.canto-mesa').setAttribute('d',trazar([tablero[0],tablero[3],tablero[2],canto[2],canto[3],canto[0]]));
    svg.querySelector('.tablero-exhibicion').setAttribute('d',trazar(tablero));
    const producto=proyectar((interior+exterior)/2,profundidad,altura);
    const precio=proyectar((interior+exterior)/2,cerca,altura-.045);
    const ficha=puesto.querySelector('.producto');
    if(ficha)ficha.tabIndex=producto.y>=0&&producto.y<=100?0:-1;
    puesto.style.left=(x-(lado===1?50:0))*2+'%';
    puesto.style.top=y+'%';
    puesto.style.width=ancho*2+'%';
    puesto.style.height=alto+'%';
    puesto.style.setProperty('--producto-x',(producto.x-x)/ancho*100+'%');
    puesto.style.setProperty('--producto-y',(producto.y+2.5-y)/alto*100+'%');
    puesto.style.setProperty('--precio-x',(precio.x-x)/ancho*100+'%');
    puesto.style.setProperty('--precio-y',(precio.y-y)/alto*100+'%');
    puesto.style.setProperty('--escala-producto',Math.min(1.15,1.65/producto.fondo));
  }
  const profundidadMesa=(tramo,avance)=>inicioMesa+pasoMesa*vueltaPasillo(tramo+(primeraMesa-inicioMesa)/pasoMesa+avance);
  function prepararLlegadaCaja(pasillo) {
    const marco=pasillo.getBoundingClientRect();
    const mesas=new Set();
    const enPantalla=nodo=>{
      const rect=nodo.getBoundingClientRect();
      return rect.bottom>marco.top&&rect.top<marco.bottom;
    };
    for(const puesto of pasillo.querySelectorAll('[data-tramo]:not([hidden])')){
      if(enPantalla(puesto)||[...puesto.querySelectorAll('.producto,.precio-estante')].some(enPantalla)){
        mesas.add(Number(puesto.dataset.tramo));
      }
    }
    const ultima=Math.min(...[...mesas].map(tramo=>profundidadMesa(tramo,avancePasillo)));
    // La caja queda detrás de la última mesa y entra por el mismo borde que el resto del pasillo.
    return {inicio:avancePasillo,salida:0,mesas,profundidadCaja:Math.min(-.47,ultima-distanciaDesdeUltimaMesa)};
  }
  function pintarPasillo() {
    const pasillo=contenido.querySelector('.pasillo');
    if(!pasillo)return;
    const avance=vueltaPasillo(avancePasillo);
    pasillo.style.setProperty('--rodar',avance);
    pintarSuelo(pasillo,avance);
    proyectarCaja(pasillo);
    // Al salir hacia la caja, las mesas que pasan dejan de volver al fondo.
    const base=llegadaCaja?.inicio??avance, salida=llegadaCaja?.salida??0;
    for(const puesto of pasillo.querySelectorAll('[data-tramo]')){
      const tramo=Number(puesto.dataset.tramo);
      const profundidad=profundidadMesa(tramo,base)+salida;
      puesto.hidden=(llegadaCaja&&!llegadaCaja.mesas.has(tramo))||profundidad<-.64||profundidad>1.48;
      if(!puesto.hidden){
        puesto.style.zIndex=Math.round((profundidad-inicioMesa)*100);
        pintarMesa(puesto,profundidad);
      }
    }
  }
  function detenerPasillo() {
    cancelAnimationFrame(animacionPasillo);
    animacionPasillo=0;
    empuje=null;
  }
  function cancelarRecorrido() {
    detenerPasillo();
    llegadaCaja=null;
  }
  function avanzarConManija(tiempo) {
    animacionPasillo=0;
    if(!empuje?.velocidad)return;
    const segundos=Math.min(40,tiempo-empuje.instante)/1000;
    empuje.instante=tiempo;
    if(empuje.velocidad>0)velocidadPasillo=empuje.velocidad;
    avancePasillo=vueltaPasillo(avancePasillo+empuje.velocidad*segundos);
    pintarPasillo();
    animacionPasillo=requestAnimationFrame(avanzarConManija);
  }
  function desplazarPasillo(paso) {
    if(llegadaCaja)return;
    detenerPasillo();
    const inicio=avancePasillo;
    if(movimientoReducido.matches){
      avancePasillo=vueltaPasillo(inicio+paso);
      pintarPasillo();
      return;
    }
    const comenzar=performance.now();
    const mover=tiempo=>{
      const p=Math.min(1,(tiempo-comenzar)/360);
      avancePasillo=vueltaPasillo(inicio+paso*(1-(1-p)**3));
      animacionPasillo=p<1?requestAnimationFrame(mover):0;
      pintarPasillo();
    };
    animacionPasillo=requestAnimationFrame(mover);
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
  function iniciarCompraCaja() {
    const existencias=contarPiezas(elegidos.flatMap(i=>oferta[i].monedas));
    const total=precio();
    const conVuelto=modo!=='exacto'&&entero(0,1)===1?pagoQueRequiereVuelto(total):null;
    const cartera=conVuelto?contarPiezas(conVuelto):new Map(opciones.activas.map(valor=>[valor,Math.max(2,existencias.get(valor)||0)]));
    if(conVuelto){
      // Agrega algunas piezas de sobra sin habilitar una combinación exacta.
      for(const valor of barajar(opciones.activas).slice(0,3)){
        const previas=cartera.get(valor)||0;
        cartera.set(valor,previas+1);
        if(formarEfectivo(total,cartera)){
          if(previas)cartera.set(valor,previas);
          else cartera.delete(valor);
        }
      }
    }
    compraCaja={cartera,pagoExacto:!conVuelto,escaneados:[],pasando:null,cobrado:null,importe:0,vuelto:[],temporizadores:[]};
    cambiarFase('cobro-productos');
    contenido.querySelector('[data-poner-caja]')?.focus({preventScroll:true});
  }
  function actualizarCajaCompra() {
    if(!contenido.querySelector('.escena-caja')){
      contenido.innerHTML=`<div class="compra-en-caja" ${compraCaja.cartera.size>=8?'data-cartera-amplia':''}>
        <div class="escena-caja" role="group">
          <img class="arte-caja" src="${imagenCaja}" alt="" draggable="false">
          <div class="estado-mostrador"></div>
        </div>
        <div class="espacio-pago"></div>
      </div>
      <div class="espacio-carrito"></div>`;
    }
    const {escaneados,pasando,cobrado,importe,vuelto}=compraCaja;
    const escaneando=fase==='cobro-productos';
    const entregando=fase==='entregando';
    const paso=pasando===null?'':`<span class="producto-en-caja" aria-hidden="true" style="--pasado:${performance.now()-pasando.inicio}ms;--posicion-caja:${11.3+escaneados.length*12.7}%">${producto(oferta[pasando.i])}</span>`;
    const restantes=elegidos.filter(i=>!escaneados.includes(i)&&i!==pasando?.i);
    const entrega=entregando?`<div class="dinero-en-camino" aria-hidden="true">${vuelto.slice(0,3).map(pieza).join('')}</div>`:'';
    const carrito=escaneando?`<section class="carrito-en-caja" aria-label="${t('Tu carrito')}">
      ${restantes.map(i=>`<button type="button" data-poner-caja="${i}" aria-label="${t('Poner en el mostrador')} · ${t(oferta[i].nombre)}" ${pasando!==null?'disabled':''}>${producto(oferta[i])}<span>${t(oferta[i].nombre)}</span></button>`).join('')}</section>`:'';
    const pantalla=`<div class="lectura-registro" aria-live="polite">
      <div class="pantalla-registro"><small>${t('Total')}</small><strong data-importe-caja>${formato(importe)}</strong></div>
      <span data-costo-producto>${cobrado===null?'':t(oferta[cobrado].nombre)+' · '+formato(oferta[cobrado].precio)}</span>
    </div>`;
    const mostrador=contenido.querySelector('.escena-caja');
    mostrador.setAttribute('aria-label',t('Mostrador y caja registradora'));
    mostrador.querySelector('.estado-mostrador').innerHTML=`
        ${pantalla}
        <div class="lector-caja" aria-hidden="true" ${pasando!==null?`data-escaneando style="--pasado:${performance.now()-pasando.inicio}ms"`:''}></div>
        ${escaneando&&pasando===null?`<div class="zona-colocar">${t('Pon el producto aquí')}</div>`:''}
        <div class="caja-productos" role="group" aria-label="${t('Caja transparente de productos escaneados')}">
          <div class="productos-dentro">
            ${escaneados.map(i=>`<span role="img" aria-label="${t(oferta[i].nombre)}">${producto(oferta[i])}</span>`).join('')}
          </div>
          <i class="costado-caja-productos" aria-hidden="true"></i>
        </div>
        ${paso}${entrega}`;
    contenido.querySelector('.espacio-pago').innerHTML=escaneando?'':verBandejaCompra(vuelto);
    contenido.querySelector('.espacio-carrito').innerHTML=carrito;
  }
  function verBandejaCompra(vuelto) {
    const pagando=fase==='pagar';
    const mostrandoVuelto=['vuelto','corregir-vuelto','entregando'].includes(fase)||(fase==='listo'&&aCambio()>0);
    const efectivo=mostrandoVuelto?vuelto:piezas;
    const fichas=fase==='entregando'?'':fichasPago(pagando,efectivo);
    const titulo=mostrandoVuelto?'Vuelto de la cajera':'Tu pago';
    return `<section class="bandeja-caja" ${pagando?'id="destinoDinero"':''} aria-label="${t(titulo)}">
      <header><h3>${t(titulo)}</h3>
        ${pagado?`<span>${t('Pagaste')} <b>${formato(pagado)}</b></span>`:opciones.ayudas&&piezas.length?`<b>${formato(sumar(piezas))}</b>`:''}
      </header>
      <div class="piezas-colocadas piezas-pago">${fichas||`<span>${t(fase==='entregando'?'La cajera prepara el vuelto…':'Pon el dinero aquí')}</span>`}</div>
      ${fase==='vuelto'?`<div class="decidir respuesta-vuelto">
        <button type="button" data-revisar-vuelto="si">${t('Sí, está bien')}</button>
        <button type="button" data-revisar-vuelto="no">${t('No, está mal')}</button>
      </div>`:''}
      ${fase==='listo'&&mostrandoVuelto?`<p class="resultado-vuelto">${t('Vuelto correcto')} <strong>${formato(aCambio())}</strong></p>`:''}
    </section>`;
  }
  function prepararSonidoLector() {
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    try{
      audioLector??=new Audio();
      if(audioLector.state!=='running')audioLector.resume().catch(()=>{});
    }catch{}
  }
  function sonarLector() {
    if(!audioLector)return;
    try{
      const inicio=audioLector.currentTime;
      const tono=audioLector.createOscillator(), volumen=audioLector.createGain();
      tono.frequency.value=2340;
      volumen.gain.setValueAtTime(.001,inicio);
      volumen.gain.linearRampToValueAtTime(.08,inicio+.004);
      volumen.gain.setValueAtTime(.08,inicio+.062);
      volumen.gain.exponentialRampToValueAtTime(.001,inicio+.087);
      tono.connect(volumen);
      volumen.connect(audioLector.destination);
      tono.onended=()=>{tono.disconnect();volumen.disconnect();};
      tono.start(inicio);
      tono.stop(inicio+.09);
    }catch{}
  }
  function ponerProductoCaja(i) {
    if(fase!=='cobro-productos'||compraCaja.pasando!==null||!elegidos.includes(i)||compraCaja.escaneados.includes(i))return;
    prepararSonidoLector();
    const item=oferta[i];
    const ultimo=compraCaja.escaneados.length+1===elegidos.length;
    const pasoInmediato=movimientoReducido.matches;
    const registrar=()=>{
      compraCaja.cobrado=i;
      compraCaja.importe+=item.precio;
      contenido.querySelector('[data-costo-producto]').textContent=t(item.nombre)+' · '+formato(item.precio);
      contenido.querySelector('[data-importe-caja]').textContent=formato(compraCaja.importe);
      sonarLector();
      const costo=idioma(`${item.nombre}, ${formato(item.precio)}.`,`${t(item.nombre)}, ${formato(item.precio)}.`);
      const total=ultimo?idioma(` El total es ${formato(compraCaja.importe)}.`,` The total is ${formato(compraCaja.importe)}.`):'';
      compraCaja.temporizadores.push(setTimeout(()=>{
        if(opciones.narracion&&!ajustes.open)leer(costo+total,{interrumpir:false});
      },110));
    };
    const colocarEnBandeja=()=>{
      compraCaja.pasando=null;
      compraCaja.escaneados.push(i);
      if(ultimo)cambiarFase('pagar',false);
      else actualizarContenido();
      if(!ajustes.open)(ultimo?banco.firstElementChild:contenido.querySelector('[data-poner-caja]'))?.focus({preventScroll:true});
    };
    compraCaja.pasando={i,inicio:performance.now()};
    actualizarContenido();
    if(pasoInmediato){
      registrar();
      colocarEnBandeja();
    }else compraCaja.temporizadores.push(setTimeout(registrar,540),setTimeout(colocarEnBandeja,1250));
  }
  function entregarVuelto(efectivo) {
    const incorrecto=opciones.vueltoCaja==='incorrecto'||(opciones.vueltoCaja==='mixto'&&entero(0,1)===1);
    if(incorrecto){
      if(efectivo.length>1)efectivo.pop();
      else{
        const alternativa=opciones.activas.find(valor=>valor<efectivo[0]);
        if(alternativa)efectivo[0]=alternativa;
        else efectivo.push(efectivo[0]);
      }
    }
    compraCaja.vuelto=efectivo;
    const entregar=()=>{
      cambiarFase('vuelto');
      if(!ajustes.open)contenido.querySelector('[data-revisar-vuelto]')?.focus({preventScroll:true});
    };
    if(movimientoReducido.matches)entregar();
    else{
      cambiarFase('entregando',false);
      compraCaja.temporizadores.push(setTimeout(entregar,1100));
    }
  }
  function responderVuelto(afirma) {
    if(fase!=='vuelto')return;
    const correcto=sumar(compraCaja.vuelto)===aCambio();
    if(afirma!==correcto)return anunciar('Resta el total a lo que pagaste y compara el resultado con el dinero que recibiste.');
    if(correcto)return completar();
    cambiarFase('corregir-vuelto');
    monto.focus({preventScroll:true});
  }
  function comprobante() {
    const listado=elegidos.map(i=>{
      const item=oferta[i];
      return `<li>${producto(item)}<span>${t(item.nombre)}</span><strong>${formato(item.precio)}</strong></li>`;
    }).join('');
    return `<section class="recibo">
      <ul aria-label="${t('Productos del cliente')}">${listado}</ul>
      ${etiquetaTotal('Precio total',precio())}
      ${fase==='dar'||fase==='listo'?etiquetaTotal('El cliente paga',pagado):''}
      ${fase==='listo'&&pagado?etiquetaTotal('Vuelto',aCambio()):''}
      </section>`;
  }
  const instruccionCobro=()=>t('Lleva los productos del carrito al mostrador, uno por uno.');
  const instruccionPago=()=>t(compraCaja.pagoExacto?'Saca de la cartera el monto exacto y ponlo en el mostrador.':'Tu cartera no tiene el monto exacto. Paga de más y revisa el vuelto.');
  const instruccionAbrirSobre=()=>t('Toca el sobre para abrirlo.');
  const instruccionContarSobre=()=>t('Acomoda el dinero y escribe cuánto hay en total.');
  function instruccion() {
    switch(fase){
      case 'medir': return t('Toca o arrastra monedas y billetes al contador.');
      case 'decidir': return t('¿Te alcanza el dinero para comprarlo?');
      case 'cerrado': return instruccionAbrirSobre();
      case 'contar': return aperturaSobre?t('Mira cómo se abre el sobre y cae el dinero.'):instruccionContarSobre();
      case 'llenar': return idioma(`Pon ${formato(sumar(sobre))} en el sobre.`,`Put ${formato(sumar(sobre))} in the envelope.`);
      case 'elegir': return t(modo==='carrito'?'Escoge dos o tres productos y empuja el carrito hasta la caja.':'Escoge un producto y empuja el carrito hasta la caja.');
      case 'cobro-productos': return instruccionCobro();
      case 'pagar': return instruccionPago();
      case 'entregando': return t('Espera a que la cajera te entregue el vuelto.');
      case 'vuelto': return t('Cuenta el dinero. ¿Está bien el vuelto?');
      case 'corregir-vuelto': return t('¿Cuánto vuelto deben darte?');
      case 'escanear': return t('Pasa a la cesta cada producto que puso el cliente.');
      case 'recibir': return t('Toma el dinero del mostrador y guárdalo en la caja.');
      case 'dar': return t('Forma el vuelto y entrégaselo al cliente.');
      default: return t('¡Lo lograste!');
    }
  }
  function actualizarContenido() {
    if(modo==='contar'||modo==='llenar'){
      contenido.innerHTML=verSobre();
      distribuirMesa();
    }
    else if(modo==='contador') contenido.innerHTML=verContador();
    else if(modo==='alcanza') contenido.innerHTML=verAlcance();
    else if(fase==='elegir'){
      contenido.innerHTML=estante();
      pintarPasillo();
    }
    else if(fase==='escanear') contenido.innerHTML=vistaCliente('Estos son mis productos.')+estante();
    else if(fase==='recibir') contenido.innerHTML=recibirPago();
    else if(compraCaja) actualizarCajaCompra();
    else{
      contenido.innerHTML=(fase==='dar'?vistaCliente('¿Me das el vuelto?'):'')+comprobante()+
        (fase==='dar'?destino('Vuelto para el cliente'):
          fase==='listo'&&modo==='cajero'&&aCambio()>0?destino('Vuelto para el cliente'):'');
    }
  }
  function render() {
    if(!modo)return;
    $('tituloModo').textContent=t(modos[modo].nombre);
    $('instruccion').textContent=instruccion();
    const lineas=$('textoInstruccion').dataset;
    if(compraCaja){
      lineas.inicio=instruccionCobro();
      lineas.siguiente=instruccionPago();
    }else if(modo==='contar'){
      lineas.inicio=instruccionAbrirSobre();
      lineas.siguiente=instruccionContarSobre();
    }else{
      delete lineas.inicio;
      delete lineas.siguiente;
    }
    $('bancoPanel').hidden=!fasesDinero.has(fase);
    $('bancoPanel').classList.toggle('cartera-compra',fase==='pagar');
    $('bancoTitulo').textContent=t(fase==='pagar'?'Tu cartera':fase==='dar'?'Caja registradora':'Banco de dinero');
    if(fasesDinero.has(fase))mostrarBanco();
    $('respuesta').hidden=!fasesNumericas.has(fase);
    $('respuesta').inert=Boolean(aperturaSobre);
    escena.dataset.fase=fase;
    actualizarContenido();
    $('accion').hidden=['cerrado','decidir','elegir','cobro-productos','entregando','vuelto'].includes(fase);
    $('accion').disabled=Boolean(aperturaSobre);
    $('accion').textContent=t(({medir:'Vaciar contador',escanear:'Cobrar',recibir:'Registrar pago',pagar:'Pagar',dar:'Dar vuelto',listo:'Siguiente ronda'})[fase]||'Revisar');
  }
  function anunciar(texto='',correcto=false) {
    const mensaje=t(texto);
    $('mensaje').textContent=mensaje;
    $('mensaje').classList.toggle('correcto',correcto);
    if(mensaje&&opciones.narracion) leer(mensaje);
  }
  function leer(texto=instruccion(),config) {
    IdiomaVoz.hablar(texto.replace(/₡([\d.,\s\u00a0\u202f]*\d)/g,(_,n)=>n.replace(/\D/g,'')+' colones'),config);
  }
  function cambiarFase(nueva,narrar=true) {
    cancelarRecorrido();
    const conservarVista=(fase==='cobro-productos'&&nueva==='pagar')||(fase==='cerrado'&&nueva==='contar');
    fase=nueva;
    monto.value='';
    if(!conservarVista)escena.scrollTop=0;
    anunciar();
    render();
    if(narrar&&opciones.narracion&&nueva!=='listo') leer();
  }
  function completar() {
    cambiarFase('listo');
    const nombre=window.NombreCompartido?.obtener();
    const mensaje=nombre?idioma(`¡Muy bien, ${nombre}!`,`Well done, ${nombre}!`):t('¡Lo lograste!');
    anunciar(mensaje,true);
    $('accion').focus({preventScroll:true});
  }
  function llegarCaja() {
    if(fase!=='elegir'||llegadaCaja)return;
    const velocidad=(empuje?.velocidad>0?empuje.velocidad:velocidadPasillo)*pasoMesa;
    detenerPasillo();
    if(elegidos.length<(modo==='carrito'?2:1)){
      anunciar(modo==='carrito'?'Recoge dos o tres productos antes de ir a la caja.':'Recoge un producto antes de ir a la caja.');
      return;
    }
    if(movimientoReducido.matches)return iniciarCompraCaja();
    anunciar();
    llegadaCaja=prepararLlegadaCaja(contenido.querySelector('.pasillo'));
    contenido.querySelector('[data-ir-caja]').hidden=true;
    for(const control of contenido.querySelectorAll('.producto,.carrito-pasillo button,[data-paso]'))control.disabled=true;
    const distancia=profundidadCajaFinal-llegadaCaja.profundidadCaja, freno=.08;
    const tiempoCrucero=(distancia-freno)/velocidad, tiempoFreno=2*freno/velocidad;
    const comenzar=performance.now();
    function acercar(tiempo) {
      const segundos=Math.max(0,(tiempo-comenzar)/1000);
      if(segundos<tiempoCrucero+tiempoFreno+.30){
        const frenado=Math.min(1,Math.max(0,(segundos-tiempoCrucero)/tiempoFreno));
        const salida=Math.min(segundos,tiempoCrucero)*velocidad+freno*frenado*(2-frenado);
        if(salida!==llegadaCaja.salida){
          llegadaCaja.salida=salida;
          avancePasillo=vueltaPasillo(llegadaCaja.inicio+salida/pasoMesa);
          pintarPasillo();
        }
        animacionPasillo=requestAnimationFrame(acercar);
      }
      else iniciarCompraCaja();
    }
    pintarPasillo();
    animacionPasillo=requestAnimationFrame(acercar);
  }
  function revisar() {
    if(aperturaSobre)return;
    if(fase==='listo'||fase==='medir') return nuevaRonda();
    if(['cerrado','decidir','elegir','cobro-productos','entregando','vuelto'].includes(fase)) return;
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
    if(total===meta){
      if(fase==='pagar')pagado=total;
      return completar();
    }
    if(fase==='pagar'&&total>meta&&modo!=='exacto'){
      if(compraCaja.pagoExacto)return anunciar('Puedes pagar el monto exacto con el dinero de tu cartera.');
      const vuelto=formarEfectivo(total-meta);
      if(!vuelto)return anunciar('Con ese pago, la caja no puede dar vuelto con las denominaciones activas. Prueba otro monto.');
      pagado=total;
      return entregarVuelto(vuelto);
    }
    anunciar(fase==='dar'?'El cliente necesita un vuelto distinto. Revisa la diferencia.':total<meta?'Falta dinero.':'Hay dinero de más. Quita alguna pieza.');
  }
  function agregarDinero(valor) {
    if(!opciones.activas.includes(valor)||!fasesDinero.has(fase))return;
    if(piezas.length>=24)return anunciar('Límite de piezas. Quita alguna para agregar otra.');
    if(fase==='pagar'&&piezas.filter(ficha=>ficha===valor).length>=(compraCaja.cartera.get(valor)||0))return;
    piezas.push(valor);
    anunciar();
    actualizarContenido();
    actualizarCarteraCompra();
    if(modo==='contador'&&opciones.narracion)leer(idioma(
      `Pusiste ${formato(valor)}. Hay ${formato(sumar(piezas))} en total.`,
      `You added ${formato(valor)}. The total is ${formato(sumar(piezas))}.`));
  }
  function elegirProducto(i) {
    if(!['elegir','escanear'].includes(fase)||!oferta[i]||elegidos.includes(i))return;
    if(modo==='carrito'&&elegidos.length===3)return anunciar('Puedes llevar hasta tres productos.');
    if(modo!=='carrito'&&modo!=='cajero')elegidos=[];
    elegidos.push(i);
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
  function posicionesIniciales(dispersar=true) {
    const puntos=Array.from({length:9},(_,i)=>({x:(i%3+.5)/3,y:(Math.floor(i/3)+.5)/3}));
    const orden=dispersar?barajar(puntos):puntos;
    return orden.slice(0,mesa.length).map(punto=>dispersar?{
      x:punto.x+(Math.random()-.5)*.10,y:punto.y+(Math.random()-.5)*.13
    }:punto);
  }
  const margenMesa=3, separacionMesa=5;
  function posicionLibre(punto,ficha,ocupadas,ancho,alto) {
    const minX=ficha.ancho/2+margenMesa,maxX=ancho-minX;
    const minY=ficha.alto/2+margenMesa,maxY=alto-minY;
    const limitar=(valor,min,max)=>Math.min(max,Math.max(min,valor));
    const xOpciones=[punto.x,minX,maxX],yOpciones=[punto.y,minY,maxY];
    for(const otra of ocupadas){
      const dx=(otra.ancho+ficha.ancho)/2+separacionMesa;
      const dy=(otra.alto+ficha.alto)/2+separacionMesa;
      xOpciones.push(otra.x-dx,otra.x+dx);
      yOpciones.push(otra.y-dy,otra.y+dy);
    }
    let mejor=null,distancia=Infinity;
    for(const candidatoX of xOpciones)for(const candidatoY of yOpciones){
      const x=limitar(candidatoX,minX,maxX),y=limitar(candidatoY,minY,maxY);
      const distancia2=(x-punto.x)**2+(y-punto.y)**2;
      if(distancia2>=distancia)continue;
      if(ocupadas.some(otra=>Math.abs(x-otra.x)<(otra.ancho+ficha.ancho)/2+separacionMesa-.01&&Math.abs(y-otra.y)<(otra.alto+ficha.alto)/2+separacionMesa-.01))continue;
      mejor={x,y};
      distancia=distancia2;
    }
    return mejor;
  }
  function distribuirMesa(movida=-1,destino=null) {
    const superficie=contenido.querySelector('.mesa-libre');
    if(!superficie)return;
    if(movida<0)superficie.style.minHeight='';
    const rect=superficie.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const fichas=[...superficie.children].map((nodo,i)=>{
      const {width,height}=nodo.getBoundingClientRect();
      return {i,nodo,ancho:width,alto:height};
    });
    const orden=fichas.filter(ficha=>ficha.i!==movida);
    if(movida>=0)orden.push(fichas[movida]);
    const {width:ancho,height:alto}=rect;
    const ocupadas=[];
    for(const ficha of orden){
      const p=posicionesMesa[ficha.i];
      const preferida=ficha.i===movida?destino:{x:p.x*ancho,y:p.y*alto};
      const lugar=posicionLibre(preferida,ficha,ocupadas,ancho,alto)||
        posicionLibre({x:p.x*ancho,y:p.y*alto},ficha,ocupadas,ancho,alto);
      if(!lugar){
        if(movida<0)distribuirMesaEnFilas(superficie,fichas,rect);
        return;
      }
      ocupadas.push({...ficha,...lugar});
    }
    for(const p of ocupadas)posicionesMesa[p.i]={x:p.x/ancho,y:p.y/alto};
    dibujarMesa(fichas,rect);
  }
  function distribuirMesaEnFilas(superficie,fichas,rect) {
    const centros=[];
    let x=margenMesa,y=margenMesa,altoFila=0;
    for(const ficha of fichas){
      if(altoFila&&x+ficha.ancho>rect.width-margenMesa){
        x=margenMesa;
        y+=altoFila+separacionMesa;
        altoFila=0;
      }
      centros[ficha.i]={x:x+ficha.ancho/2,y:y+ficha.alto/2};
      x+=ficha.ancho+separacionMesa;
      altoFila=Math.max(altoFila,ficha.alto);
    }
    const altoNecesario=y+altoFila+margenMesa;
    if(altoNecesario>rect.height)superficie.style.minHeight=altoNecesario/Matematicas.escala()+'px';
    const destino=superficie.getBoundingClientRect();
    posicionesMesa=centros.map(p=>({x:p.x/destino.width,y:p.y/destino.height}));
    dibujarMesa(fichas,destino);
  }
  function dibujarMesa(fichas,rect) {
    const boca=aperturaSobre?contenido.querySelector('.boca-sobre').getBoundingClientRect():null;
    const escala=boca?Matematicas.escala():1;
    for(const {i,nodo} of fichas){
      const {x,y}=posicionesMesa[i];
      nodo.style.left=x*100+'%';
      nodo.style.top=y*100+'%';
      if(boca){
        nodo.style.setProperty('--desde-x',(boca.x+boca.width/2-rect.x-x*rect.width)/escala+'px');
        nodo.style.setProperty('--desde-y',(boca.y+boca.height*.48-rect.y-y*rect.height)/escala+'px');
      }
    }
  }
  function cancelarAperturaSobre() {
    if(aperturaSobre)clearTimeout(aperturaSobre.temporizador);
    aperturaSobre=null;
  }
  function terminarAperturaSobre() {
    cancelarAperturaSobre();
    const tablero=contenido.querySelector('.tablero-mesa');
    tablero.removeAttribute('data-apertura');
    tablero.querySelector('.mesa-libre').removeAttribute('aria-hidden');
    for(const boton of tablero.querySelectorAll('#ordenarMesa,.ficha-mesa'))boton.disabled=false;
    $('respuesta').inert=false;
    $('accion').disabled=false;
    $('instruccion').textContent=instruccionContarSobre();
    if(!ajustes.open){
      monto.focus({preventScroll:true});
      if(opciones.narracion)leer();
    }
  }
  function abrirSobre() {
    if(fase!=='cerrado')return;
    if(movimientoReducido.matches){
      cambiarFase('contar');
      monto.focus({preventScroll:true});
      return;
    }
    aperturaSobre={inicio:performance.now()};
    cambiarFase('contar',false);
    const {abrir,pausa,salir,intervalo}=tiemposSobre;
    const duracion=abrir+pausa+salir+(mesa.length-1)*intervalo+40;
    aperturaSobre.temporizador=setTimeout(terminarAperturaSobre,Math.max(0,duracion-(performance.now()-aperturaSobre.inicio)));
  }
  function moverEnMesa(origen,x,y) {
    if(fase!=='contar'||aperturaSobre||!mesa[origen])return;
    const rect=contenido.querySelector('.mesa-libre').getBoundingClientRect();
    fichaElegida=null;
    contenido.querySelector('[data-ficha-mesa][aria-pressed=true]')?.setAttribute('aria-pressed','false');
    distribuirMesa(origen,{x:x-rect.x,y:y-rect.y});
  }
  function tocarMesa(i,boton) {
    if(fichaElegida!==null&&fichaElegida!==i){
      const r=boton.getBoundingClientRect();
      moverEnMesa(fichaElegida,r.x+r.width/2,r.y+r.height/2);
    }
    else{
      fichaElegida=fichaElegida!==i ? i : null;
      boton.setAttribute('aria-pressed',String(fichaElegida===i));
    }
  }
  function quitarDinero(valor) {
    const i=piezas.lastIndexOf(valor);
    if(i<0||!fasesDinero.has(fase))return;
    piezas.splice(i,1);
    anunciar();
    actualizarContenido();
    actualizarCarteraCompra();
    (contenido.querySelector(`[data-quitar="${valor}"]`)||banco.querySelector(`[data-dinero="${valor}"]`))?.focus({preventScroll:true});
  }
  function limpiarArrastre() {
    arrastre?.fantasma?.remove();
    arrastre?.destino?.classList.remove('sobre-destino');
    arrastre?.origen?.classList.remove('moviendo-ficha');
    arrastre=null;
  }
  const fuentesArrastre = [
    {clave:'dinero',destino:'#destinoDinero',soltar:agregarDinero},
    {clave:'producto',destino:'#cesta',soltar:elegirProducto},
    {clave:'ponerCaja',destino:'.escena-caja',soltar:ponerProductoCaja},
    {clave:'devolver',destino:'[data-estante],.mostrador-cliente',soltar:devolverProducto},
    {clave:'recibir',destino:'#destinoDinero',soltar:guardarPago},
    {clave:'fichaMesa',destino:'.mesa-libre',soltar:(i,nodo,evento)=>moverEnMesa(i,evento.clientX,evento.clientY)}
  ];
  escena.addEventListener('pointerdown',evento=>{
    const origen=evento.target.closest('button[data-dinero],button[data-producto],button[data-poner-caja],button[data-devolver],button[data-recibir],button[data-ficha-mesa]');
    if(evento.button!==0||evento.isPrimary===false||arrastre||empuje||llegadaCaja)return;
    ignorarClic=false;
    const camino=evento.target.closest('.camino-carrito');
    if(!origen&&camino&&evento.target.closest('.carrito-pasillo')){
      detenerPasillo();
      const alto=camino.getBoundingClientRect().height;
      empuje={id:evento.pointerId,camino,y:evento.clientY,recorrido:0,alto,velocidad:0,instante:0};
      camino.setPointerCapture(evento.pointerId);
      return;
    }
    if(!origen||origen.disabled)return;
    if(fase==='elegir')detenerPasillo();
    const fuente=fuentesArrastre.find(({clave})=>Object.hasOwn(origen.dataset,clave));
    if(!origen.firstElementChild)return;
    arrastre={id:evento.pointerId,origen,fuente,
      x:evento.clientX,y:evento.clientY,valor:Number(origen.dataset[fuente.clave])};
    origen.setPointerCapture(evento.pointerId);
  });
  escena.addEventListener('pointermove',evento=>{
    if(empuje?.id===evento.pointerId){
      const distancia=empuje.y-evento.clientY;
      empuje.recorrido=Math.max(empuje.recorrido,Math.abs(distancia));
      const meta=contenido.querySelector('[data-ir-caja]').getBoundingClientRect();
      if(distancia>empuje.alto*.35&&evento.clientY<=meta.bottom+8&&
        evento.clientX>=meta.left-12&&evento.clientX<=meta.right+12){
        ignorarClic=true;
        llegarCaja();
        return;
      }
      if(Math.abs(distancia)<5){
        empuje.velocidad=0;
        return;
      }
      const intensidad=Math.min(1,(Math.abs(distancia)-5)/(empuje.alto*.23));
      empuje.velocidad=Math.sign(distancia)*(.6+intensidad*1.6);
      if(!animacionPasillo){
        if($('mensaje').textContent)anunciar();
        empuje.instante=performance.now();
        animacionPasillo=requestAnimationFrame(avanzarConManija);
      }
      return;
    }
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
      if(d.fuente.clave==='fichaMesa')d.origen.classList.add('moviendo-ficha');
    }
    Matematicas.fantasma(d.fantasma,x,y);
    d.destino?.classList.remove('sobre-destino');
    d.destino=document.elementFromPoint(x,y)?.closest(d.fuente.destino);
    d.destino?.classList.add('sobre-destino');
  });
  addEventListener('pointerup',evento=>{
    if(empuje?.id===evento.pointerId){
      ignorarClic=empuje.recorrido>=5;
      detenerPasillo();
      return;
    }
    const d=arrastre;
    if(d?.id!==evento.pointerId)return;
    if(d.fantasma){
      ignorarClic=true;
      const destino=document.elementFromPoint(evento.clientX,evento.clientY)?.closest(d.fuente.destino);
      if(destino)d.fuente.soltar(d.valor,destino,evento);
    }
    limpiarArrastre();
  });
  escena.addEventListener('pointercancel',evento=>{
    if(empuje?.id===evento.pointerId)detenerPasillo();
    limpiarArrastre();
  });
  escena.addEventListener('lostpointercapture',evento=>{
    if(evento.target===empuje?.camino&&evento.pointerId===empuje.id)detenerPasillo();
    if(evento.target===arrastre?.origen&&evento.pointerId===arrastre.id)limpiarArrastre();
  });
  function terminarGestos(){
    if(empuje)detenerPasillo();
    limpiarArrastre();
  }
  addEventListener('resize',terminarGestos);
  addEventListener('blur',terminarGestos);
  document.addEventListener('fullscreenchange',terminarGestos);
  escena.addEventListener('click',evento=>{
    if(ignorarClic&&evento.detail){ignorarClic=false;return;}
    if(llegadaCaja)return;
    const boton=evento.target.closest('button');
    if(!boton){
      if(fichaElegida!==null&&evento.target.closest('.mesa-libre'))moverEnMesa(fichaElegida,evento.clientX,evento.clientY);
      return;
    }
    if(boton.id==='abrirSobre') {
      abrirSobre();
    }
    else if(boton.id==='ordenarMesa') {
      mesa.sort((a,b)=>a-b);
      posicionesMesa=posicionesIniciales(false);
      fichaElegida=null;
      actualizarContenido();
      $('ordenarMesa').focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-alcanza')){
      const afirmativa=boton.dataset.alcanza==='si';
      if(afirmativa===(sumar(cartera)>=oferta[0].precio)){
        completar();
      }else anunciar('Compara tu dinero con la etiqueta de precio.');
    }
    else if(boton.hasAttribute('data-ir-caja')) llegarCaja();
    else if(boton.hasAttribute('data-poner-caja')) ponerProductoCaja(Number(boton.dataset.ponerCaja));
    else if(boton.hasAttribute('data-revisar-vuelto')) responderVuelto(boton.dataset.revisarVuelto==='si');
    else if(boton.hasAttribute('data-paso')||boton.id==='empujarCarrito'){
      anunciar();
      desplazarPasillo(Number(boton.dataset.paso||1));
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
      contenido.querySelector(`.puesto-estante:not([hidden]) [data-producto="${i}"][tabindex="0"], .mostrador-cliente [data-producto="${i}"]`)?.focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-ficha-mesa')) tocarMesa(Number(boton.dataset.fichaMesa),boton);
    else if(boton.hasAttribute('data-recibir')){
      guardarPago(Number(boton.dataset.recibir));
      escena.querySelector('[data-recibir]')?.focus({preventScroll:true});
    }
    else if(boton.hasAttribute('data-quitar')) quitarDinero(Number(boton.dataset.quitar));
  });
  escena.addEventListener('keydown',evento=>{
    if(evento.target.id==='empujarCarrito'&&['ArrowUp','ArrowDown'].includes(evento.key)){
      evento.preventDefault();
      anunciar();
      desplazarPasillo(evento.key==='ArrowUp'?1:-1);
      return;
    }
    const ficha=evento.target.closest('button[data-ficha-mesa]');
    const paso={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[evento.key];
    if(!ficha||!paso)return;
    evento.preventDefault();
    const r=ficha.getBoundingClientRect();
    moverEnMesa(Number(ficha.dataset.fichaMesa),r.x+r.width/2+paso[0]*16,r.y+r.height/2+paso[1]*16);
  });
  function mostrarModo(vista) {
    limpiarArrastre();
    cancelarRecorrido();
    cerrarCompraCaja();
    cancelarAperturaSobre();
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
  const controlesTamano=[
    {control:$('tamanoBilletes'),salida:$('porcentajeBilletes'),clase:'billetes',preferencia:'tamanoBilletes'},
    {control:$('tamanoMonedas'),salida:$('porcentajeMonedas'),clase:'monedas',preferencia:'tamanoMonedas'}
  ];
  $('muestraBilletes').innerHTML=[1000,20000].map(pieza).join('');
  $('muestraMonedas').innerHTML=[25,500].map(pieza).join('');
  function previsualizarTamano() {
    for(const {control,salida,clase} of controlesTamano){
      const valor=Number(control.value);
      ajustes.style.setProperty('--escala-'+clase,valor/100);
      salida.value=valor+' %';
    }
  }
  for(const {control} of controlesTamano)control.addEventListener('input',previsualizarTamano);
  function aplicarTamano() {
    for(const {clase,preferencia} of controlesTamano){
      document.documentElement.style.setProperty('--escala-'+clase,opciones[preferencia]/100);
    }
  }
  function rotularAjustes() {
    $('denominaciones').innerHTML=valores.map(valor=>`<label><input type="checkbox" value="${valor}" aria-label="${etiquetaDinero(valor)}" ${opciones.activas.includes(valor)?'checked':''}>${pieza(valor)}</label>`).join('');
  }
  $('configurar').onclick=()=>{
    limpiarArrastre();
    const estabaLlegando=Boolean(llegadaCaja);
    if(llegadaCaja)avancePasillo=llegadaCaja.inicio;
    cancelarRecorrido();
    if(estabaLlegando)actualizarContenido();
    rotularAjustes();
    $('ayudas').checked=opciones.ayudas;
    $('narracion').checked=opciones.narracion;
    $('apilarBilletes').checked=opciones.apilarBilletes;
    $('nombresProductos').checked=opciones.nombresProductos;
    $('vueltoCaja').value=opciones.vueltoCaja;
    for(const {control,preferencia} of controlesTamano)control.value=opciones[preferencia];
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
      apilarBilletes:$('apilarBilletes').checked,
      tamanoBilletes:$('tamanoBilletes').valueAsNumber,
      tamanoMonedas:$('tamanoMonedas').valueAsNumber,
      nombresProductos:$('nombresProductos').checked,
      vueltoCaja:$('vueltoCaja').value};
    Matematicas.guardar(clave,opciones);
    aplicarTamano();
    ajustes.close();
    if(cambio&&modo)nuevaRonda();
    else render();
    IdiomaVoz.aplicarEdicion();
  }
  $('denominaciones').addEventListener('change',()=>{$('errorAjustes').hidden=true;});
  $('cerrar').onclick=aplicarAjustes;
  ajustes.querySelector('form').onsubmit=evento=>{evento.preventDefault();aplicarAjustes();};
  ajustes.addEventListener('cancel',evento=>{evento.preventDefault();aplicarAjustes();});
  function localizar() {
    mostrarModos();
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
    distribuirMesa();
  });
  aplicarTamano();
  localizar();
  historial.restaurar();
})();
