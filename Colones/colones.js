(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = $('appColones'), escena = $('escena');
  const contenido = $('contenido'), banco = $('banco'), monto = $('monto');
  const resultadoSobre = $('resultadoSobre');
  const clave = 'colones.practica.v1';
  const valores = [10,25,50,100,500,1000,2000,5000,10000,20000];
  const largosBillete = {1000:125,2000:132,5000:139,10000:146,20000:153};
  // El relieve sigue el contorno de cada cifra en las coordenadas de su foto.
  const monedas = {
    10:{diametro:.76,vista:'0 0 99 102',grabado:[
      'M38.8 33.8H43V62H37.4V42.2Q34.1 44.5 30.3 45.2V41Q35.5 38.7 38.8 33.8Z',
      'M54.6 33.4C60.8 33.4 63.7 37.6 63.7 45.4V51C63.7 58.6 60.7 62.6 54.6 62.6S45.3 58.5 45.3 51V45.4C45.3 37.7 48.4 33.4 54.6 33.4ZM54.6 37.5C51.8 37.5 51.2 40.6 51.2 45.4V51C51.2 55.7 51.9 58.5 54.6 58.5S58.1 55.7 58.1 51V45.4C58.1 40.5 57.4 37.5 54.6 37.5Z'
    ]},
    25:{diametro:.81,vista:'0 0 103 102',grabado:[
      'M39.6 30.9C45.4 30.9 48.6 34.9 48.6 39.8C48.6 45.1 45.3 48.6 41.4 52.5L37.4 56.8H48.6V62.4H29.8V59.4C30 54.6 34 50.7 37.7 46.8C40.1 43.9 42.7 41.8 42.7 39C42.7 36.9 41.6 35.6 39.5 35.6C36.8 35.6 35.8 38.2 35.8 41.6H29.6C29.6 35.4 33.8 30.9 39.6 30.9Z',
      'M52.7 31.5H68.8V36.8H57.6L57.3 43.2Q59.3 41.2 62.3 41.2C67.6 41.2 70.1 44.9 70.1 50.1V54.1C70.1 59.6 67 62.6 61.1 62.6C54.7 62.6 51.1 59.5 51.1 53.6H56.7Q57 58.3 61 58.3C63.4 58.3 64.3 56.3 64.3 53.1V50.1C64.3 46.9 63.3 45.5 61.1 45.5Q58.4 45.5 57 48.7H51.9Z'
    ]},
    50:{diametro:.87,vista:'0 0 110 109',grabado:[
      'M34.8 34H53.3V39.7H40.1L39.7 46.5Q41.8 44.4 45.7 44.4C51.6 44.4 54.5 48.9 54.5 54.5V59.5C54.5 65.6 50.5 68.8 44 68.8C37.5 68.8 33 65.5 33 57.6H39.8Q40 63.8 44 63.8C47.1 63.8 47.9 61.4 47.9 58.5V55.2C47.9 51.3 46.6 49.6 43.9 49.6Q41.1 49.6 39.8 52.5H34.1Z',
      'M68.1 33.3C75.2 33.3 79 38.2 79 46.2V56.4C79 64.6 75.2 68.8 68.1 68.8C60.8 68.8 57.1 64.4 57.1 56.4V46.2C57.1 38.1 60.8 33.3 68.1 33.3ZM68.1 38C65 38 64.2 41.3 64.2 46.1V56.7C64.2 61.8 65.2 64.4 68.1 64.4C70.8 64.4 71.9 61.8 71.9 56.7V46.1C71.9 41.3 70.9 38 68.1 38Z'
    ]},
    100:{diametro:.92,vista:'0 0 115 115',grabado:[
      'M34.5 35.5H39.6V70.7H32.5V46Q28.4 49.1 23.5 50.4V44.6Q29.9 41.9 34.5 35.5Z',
      'M53.5 35.2C61 35.2 64.6 40.3 64.6 48.2V58.4C64.6 66.5 60.9 70.9 53.5 70.9S42.3 66.5 42.3 58.4V48.2C42.3 40.2 46.1 35.2 53.5 35.2ZM53.5 39.4C50.3 39.4 49.5 42.9 49.5 48.2V58.3C49.5 63.5 50.5 66.6 53.5 66.6S57.5 63.5 57.5 58.3V48.2C57.5 42.9 56.6 39.4 53.5 39.4Z',
      'M78.5 35.2C86 35.2 89.7 40.3 89.7 48.2V58.4C89.7 66.5 86 71 78.5 71S67.4 66.5 67.4 58.4V48.2C67.4 40.2 71.1 35.2 78.5 35.2ZM78.5 39.4C75.5 39.4 74.5 43 74.5 48.2V58.3C74.5 63.5 75.5 66.7 78.5 66.7S82.6 63.5 82.6 58.3V48.2C82.6 43 81.7 39.4 78.5 39.4Z'
    ]},
    500:{diametro:1,vista:'0 0 123 123',grabado:[
      'M28.9 36H47.8V42H33.9L33.4 50.5Q35.5 48 40 48C46.3 48 49.8 52.3 49.8 59.1V63.3C49.8 70.4 45.6 74 38.1 74C30.8 74 26 70 26 62.6H33.3Q33.5 69.4 38 69.4C41.2 69.4 42.3 66.9 42.3 62.9V59.4C42.3 55.2 41.1 53.2 38 53.2Q35.2 53.2 33.7 56.4H26.7Z',
      'M63.2 35.8C71.1 35.8 75 40.8 75 49.1V61.3C75 69.6 71 74 63.2 74C55.2 74 51.3 69.5 51.3 61.3V49.1C51.3 40.8 55.2 35.8 63.2 35.8ZM63.2 39.7C59.9 39.7 59 43.5 59 49.1V61.3C59 66.7 60.1 69.8 63.2 69.8C66.3 69.8 67.5 66.7 67.5 61.3V49.1C67.5 43.5 66.5 39.7 63.2 39.7Z',
      'M88.5 35.8C96.3 35.8 100.4 40.8 100.4 49.1V61.3C100.4 69.6 96.4 74 88.5 74C80.4 74 76.6 69.5 76.6 61.3V49.1C76.6 40.8 80.5 35.8 88.5 35.8ZM88.5 39.7C85.2 39.7 84.2 43.5 84.2 49.1V61.3C84.2 66.7 85.3 69.8 88.5 69.8C91.6 69.8 92.9 66.7 92.9 61.3V49.1C92.9 43.5 91.7 39.7 88.5 39.7Z'
    ]}
  };
  const tipoDinero = valor => valor<1000 ? 'moneda' : 'billete';
  const modos = {
    contador:{nombre:'Contador de dinero',guia:'Usa la máquina para contar monedas y billetes o formar un monto.'},
    contar:{nombre:'Cantidad en el sobre',guia:'Abre el sobre, cuenta y escribe cuánto dinero hay.'},
    llenar:{nombre:'Preparar un sobre',guia:'Elige monedas y billetes para formar una cantidad.'},
    alcanza:{nombre:'¿Me alcanza?',guia:'Compara tu dinero con el precio de un producto.'},
    exacto:{nombre:'Compra exacta',guia:'Elige un producto y paga su precio exacto en la caja.'},
    compra:{nombre:'Compra con vuelto',guia:'Compra un producto y revisa el vuelto cuando haga falta.'},
    carrito:{nombre:'Carrito de compras',guia:'Compra dos o tres productos y revisa el vuelto cuando haga falta.'},
    cajero:{nombre:'Soy el cajero',guia:'Pasa los productos, recibe el pago y entrega el vuelto.'},
    expendedora:{nombre:'Máquina expendedora',guia:'Elige una bebida o merienda, paga en colones y recoge tu compra y el vuelto.',
      enlace:'../Expendedora/expendedora.html',imagen:'../Expendedora/imagenes/expendedora.png'}
  };
  const productos = [
    ['Manzana','imagenes/productos/manzana.png',250,650],
    ['Pan','imagenes/productos/pan.png',350,1000],
    ['Leche','imagenes/productos/leche.png',700,1450],
    ['Jugo','imagenes/productos/jugo.png',400,1100],
    ['Cuaderno','imagenes/productos/cuaderno.png',800,3800],
    ['Lápiz','imagenes/productos/lapiz.png',100,550],
    ['Bananas','imagenes/productos/bananas.png',175,525],
    ['Pelota','imagenes/productos/pelota.png',1800,8000],
    ['Mochila','imagenes/productos/mochila.png',6500,24500],
    ['Confite','imagenes/productos/confite.png',10,50],
    ['Borrador','imagenes/productos/borrador.png',25,100],
    ['Zanahoria','imagenes/productos/zanahoria.png',50,150],
    ['Pera','../ImagenesSituacionesProblemas/Ilustraciones/pera.webp',75,250],
    ['Galletas','../Expendedora/imagenes/galletas.png',75,300],
    ['Agua','../Expendedora/imagenes/agua.png',100,350],
    ['Papas fritas','../Expendedora/imagenes/papas.png',150,450]
  ];
  const modosConPasillo=new Set(['exacto','compra','carrito']);
  const iniciales = [10,25,50,100,500,1000,2000];
  const guardado = Matematicas.leer(clave);
  const activas = valores.filter(valor => Array.isArray(guardado.activas) && guardado.activas.includes(valor));
  const tiposVuelto=['correcto','incorrecto','mixto'];
  const limitarEscala = (valor,control) => Number.isFinite(valor)
    ? Math.max(Number(control.min),Math.min(Number(control.max),valor)) : Number(control.defaultValue);
  let opciones = {activas:activas.length ? activas : iniciales, ayudas:guardado.ayudas!==false,
    narracion:guardado.narracion!==false, apilarBilletes:guardado.apilarBilletes===true,
    mostrarCifraBilletes:guardado.mostrarCifraBilletes===true,
    mostrarCifraMonedas:guardado.mostrarCifraMonedas===true,
    apilarContador:guardado.apilarContador===true,
    sonidosTolva:guardado.sonidosTolva!==false,
    tamanoBilletes:limitarEscala(guardado.tamanoBilletes,$('tamanoBilletes')),
    tamanoMonedas:limitarEscala(guardado.tamanoMonedas,$('tamanoMonedas')), nombresProductos:guardado.nombresProductos!==false,
    cantidadAlcance:guardado.cantidadAlcance===4?4:3,
    vueltoCaja:tiposVuelto.includes(guardado.vueltoCaja)?guardado.vueltoCaja:'correcto'};
  let modo = null, fase, oferta, elegidos, piezas, sobre, dineroCliente, pagado;
  let varianteContador=guardado.varianteContador==='reto'?'reto':'explorar', metaContador=0;
  let varianteAlcance=guardado.varianteAlcance==='seleccion'?'seleccion':'uno';
  const colaContador=[];
  const tiempoPasoContador=560;
  let temporizadorContador=0, inicioPasoContador=0;
  let compraCaja=null;
  let audioEfectos, aireTolva;
  let arrastre = null, ignorarClic = false;
  let mesa, posicionesMesa, fichaElegida, aperturaSobre, cartera, mercanciaCliente, recibidos;
  let selladoSobre=null;
  let posicionesEfectivo=[], posicionesCliente=[], cuadroDeslizamiento=0;
  const tiemposSobre={abrir:560,pausa:160,salir:520,intervalo:90};
  let avancePasillo=0, animacionPasillo=0, empuje=null, llegadaCaja=null;
  const velocidadInicialPasillo=1.25;
  let velocidadPasillo=velocidadInicialPasillo;
  const mesasPorVuelta=6, pasoMesa=.36, inicioMesa=-.66, primeraMesa=.14;
  const distanciaDesdeUltimaMesa=1.40, profundidadCajaFinal=.75, alturaReferenciaCaja=.34;
  const vueltaPasillo=valor=>((valor%mesasPorVuelta)+mesasPorVuelta)%mesasPorVuelta;
  const imagenCaja='imagenes/caja-registro-frontal.webp';
  const movimientoReducido=matchMedia('(prefers-reduced-motion: reduce)');
  const contadorCompacto=matchMedia('(orientation:portrait) and (max-height:700px)');
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
    const soloMonedas=opciones.activas.at(-1)<1000;
    let montos=[...candidatos.keys()].filter(monto=>!soloMonedas||monto<=1000);
    const pagosConVuelto=new Map();
    // Cuatro de cada cinco rondas intentan ofrecer precios que obliguen a dar vuelto.
    if(modo==='compra'&&entero(1,5)!==1){
      for(const monto of montos){
        const pago=pagoQueRequiereVuelto(monto);
        if(pago)pagosConVuelto.set(monto,pago);
      }
      if(pagosConVuelto.size)montos=[...pagosConVuelto.keys()];
    }
    const surtido=barajar(productos.filter(([, ,min])=>!soloMonedas||min<=500)).map(([nombre,imagen,min,max])=>{
      const dentro=montos.filter(x=>x>=min&&x<=max);
      const distancia=x=>Math.max(min-x,x-max,0);
      const cercanos=dentro.length?dentro:[...montos].sort((a,b)=>distancia(a)-distancia(b)).slice(0,2);
      const precio=tomar(cercanos);
      return {nombre,imagen,monedas:candidatos.get(precio),precio,pagoConVuelto:pagosConVuelto.get(precio)};
    });
    const pasillo=modosConPasillo.has(modo);
    const cantidad=pasillo?mesasPorVuelta*2:6;
    if(!soloMonedas)return surtido.slice(0,cantidad);
    const limiteEconomico=Math.max(200,opciones.activas[0]);
    const economicos=surtido.filter(item=>item.precio<=limiteEconomico).slice(0,3);
    const resto=surtido.filter(item=>!economicos.includes(item));
    const seleccion=economicos.concat(resto).slice(0,cantidad);
    return pasillo?seleccion:barajar(seleccion);
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
    resultadoSobre.close();
    limpiarArrastre();
    detenerDeslizamiento();
    cancelarContador();
    cerrarCompraCaja();
    cancelarAperturaSobre();
    cancelarSelladoSobre();
    oferta=prepararProductos();
    elegidos=[];
    cancelarRecorrido();
    avancePasillo=0;
    velocidadPasillo=velocidadInicialPasillo;
    piezas=[];
    posicionesEfectivo=[];
    posicionesCliente=[];
    sobre=formar(modo==='contar'?entero(3,7):entero(2,5));
    mesa=[...sobre];
    posicionesMesa=posicionesIniciales();
    fichaElegida=null;
    cartera=[];
    pagado=0;
    dineroCliente=[];
    if(modo==='contador'&&varianteContador==='reto'){
      const meta=sumar(formar(entero(2,5)));
      metaContador=meta===metaContador?meta+tomar(opciones.activas):meta;
    }
    if(modo==='cajero'){
      mercanciaCliente=oferta.slice(0,entero(2,3)).map((_,i)=>i);
      recibidos=new Set();
      const exacto=mercanciaCliente.flatMap(i=>oferta[i].monedas);
      const conVuelto=entero(1,4)===1?null:pagoQueRequiereVuelto(sumar(exacto));
      dineroCliente=conVuelto||compactar(exacto);
    }
    if(modo==='alcanza'&&varianteAlcance==='seleccion'){
      prepararSeleccionAlcance();
    }else if(modo==='alcanza'){
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
    cambiarFase(({contador:'medir',contar:'cerrado',llenar:'llenar',
      alcanza:varianteAlcance==='seleccion'?'seleccionar-alcance':'decidir',cajero:'escanear'})[modo]||'elegir');
  }
  function pieza(valor) {
    const largo=largosBillete[valor];
    const moneda=monedas[valor];
    const medida=largo?`--largo-billete:${largo}`:`--diametro-moneda:${moneda.diametro}`;
    const imagen=`imagenes/dinero-${valor}.webp${largo?'?v=anverso':''}`;
    const cifra=largo?`<span class="valor-billete">${valor}</span>`:
      `<svg class="valor-moneda" viewBox="${moneda.vista}" focusable="false"><path d="${moneda.grabado.join(' ')}"/></svg>`;
    return `<span class="dinero ${tipoDinero(valor)}" data-valor="${valor}" style="${medida}" aria-hidden="true"><img src="${imagen}" alt="" draggable="false">${cifra}</span>`;
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
    $('modos').innerHTML=Object.entries(modos).map(([id,{nombre,guia,enlace,imagen}],i)=>{
      const control=enlace?'a':'button';
      const destino=enlace?`href="${enlace}"`:`type="button" data-modo="${id}"`;
      const arte=imagen?`<img class="arte-modo arte-modo-individual" src="${imagen}" alt="">`:
        `<span class="arte-modo" style="--col:${i%4};--fila:${Math.floor(i/4)}" aria-hidden="true"></span>`;
      return `<${control} class="tarjeta" ${destino} aria-labelledby="modo-${id}" aria-describedby="guia-${id}">
        ${arte}
        <span class="texto-modo"><strong id="modo-${id}">${t(nombre)}</strong><span id="guia-${id}" class="detalle-modo">${t(guia)}</span></span>
      </${control}>`;
    }).join('');
  }
  function producto(item) {
    return `<img class="foto-producto" src="${item.imagen}" alt="" draggable="false">`;
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
    const editable=fase==='contar'||fase==='listo';
    const ocupado=Boolean(aperturaSobre);
    const fichas=mesa.map((valor,i)=>{
      const interior=pieza(valor);
      const marca=`class="ficha-mesa" data-ficha-mesa="${i}" style="--turno:${i}" aria-label="${etiquetaDinero(valor)}" ${cerrado||ocupado?'aria-hidden="true"':''}`;
      return editable
        ? `<button type="button" ${marca} aria-pressed="${fichaElegida===i}" ${ocupado?'disabled':''}>${interior}</button>`
        : `<span ${marca} role="img">${interior}</span>`;
    }).join('');
    const {abrir,pausa,salir,intervalo}=tiemposSobre;
    const animacion=ocupado?`data-apertura style="--tiempo-solapa:${abrir}ms;--inicio-vaciado:${abrir+pausa}ms;--tiempo-salida:${salir}ms;--intervalo-salida:${intervalo}ms;--tiempo-vaciado:${salir+(mesa.length-1)*intervalo}ms;--transcurrido:${performance.now()-aperturaSobre.inicio}ms"`:'';
    return `<section class="tablero-mesa" data-sobre="${cerrado?'cerrado':'abierto'}" ${animacion}>
      <header class="controles-mesa"><h3>${t('Dinero sobre la mesa')}</h3>
          ${cerrado||editable?`<button type="button" id="ordenarMesa" ${cerrado||ocupado?'disabled':''}>${t('Agrupar por valor')}</button>`:''}
      </header>
      <div class="mesa-desplazable"><div class="mesa-libre" data-superficie-efectivo role="group" aria-label="${t('Dinero sobre la mesa')}">
        <button class="sobre-mesa" type="button" id="abrirSobre" ${cerrado?'':'disabled aria-hidden="true"'}>${envoltura()}<span class="rotulo-sobre">${t('Abrir sobre')}</span></button>
        ${fichas}
      </div></div>
      </section>`;
  }
  function efectivoSobre() {
    if(fase==='listo')return '';
    return fichasPago(fase==='llenar')||`<p class="sobre-vacio">${t('Arrastra el dinero aquí o tócalo en el banco.')}</p>`;
  }
  function verSobreParaLlenar() {
    const sellado=fase==='listo';
    return `<section class="preparar-sobre">
      <div class="montos-preparar">
        ${etiquetaTotal('Monto pedido',sumar(sobre))}
        ${opciones.ayudas?`<div id="saldoSobre" aria-live="polite" aria-atomic="true">${etiquetaTotal('Preparaste',sumar(piezas))}</div>`:''}
      </div>
      <section id="destinoDinero" class="tablero-mesa tablero-preparar" data-sobre="${sellado?'cerrado':'abierto'}" aria-labelledby="tituloInteriorSobre">
        <header class="controles-mesa"><h3 id="tituloInteriorSobre">${t('Dinero para el sobre')}</h3></header>
        <div class="marco-mesa-preparar">
          <div class="mesa-desplazable"><div class="mesa-libre interior-sobre" id="interiorSobre" data-superficie-efectivo>
            <div id="efectivoSobre" class="efectivo-sobre">${efectivoSobre()}</div>
          </div></div>
          <span class="sobre-mesa">${envoltura()}<strong id="montoSobrePreparado" ${sellado?'':'hidden'}>${sellado?formato(sumar(piezas)):''}</strong></span>
        </div>
        <div class="nota-preparar">
          <p class="ayuda-preparar">${t('Arrastra para acomodar. Toca una pieza para quitarla.')}</p>
          <p id="avisoPrepararSobre" role="status"></p>
        </div>
      </section>
    </section>`;
  }
  function actualizarEfectivoSobre(entrada) {
    const interior=$('interiorSobre');
    $('efectivoSobre').innerHTML=efectivoSobre();
    const saldo=$('saldoSobre')?.querySelector('strong');
    if(saldo)saldo.textContent=formato(sumar(piezas));
    distribuirMesa();
    if(!entrada)return;
    const ficha=interior.querySelector(`[data-indice-efectivo="${piezas.length-1}"]`);
    if(entrada.evento&&ficha){
      moverEfectivo(interior,ficha,entrada.evento.clientX,entrada.evento.clientY,entrada.impulso);
    }else{
      (ficha?.querySelector('.pila-dinero > :last-child')||ficha?.firstElementChild)?.classList.add('dinero-entrando');
    }
  }
  function cancelarSelladoSobre() {
    if(!selladoSobre)return;
    clearTimeout(selladoSobre.temporizador);
    for(const animacion of selladoSobre.animaciones)animacion.cancel();
    selladoSobre=null;
  }
  function fraseSobrePreparado() {
    const total=formato(sumar(piezas));
    return idioma(`Guardaste ${total} en el sobre.`,`You put ${total} in the envelope.`);
  }
  function terminarSelladoSobre() {
    if(fase!=='guardando-sobre')return;
    cancelarSelladoSobre();
    fase='listo';
    escena.dataset.fase=fase;
    $('destinoDinero').dataset.sobre='cerrado';
    $('efectivoSobre').replaceChildren();
    $('interiorSobre').style.minHeight='';
    const total=formato(sumar(piezas));
    const rotulo=$('montoSobrePreparado');
    rotulo.textContent=total;
    rotulo.hidden=false;
    $('instruccion').textContent=instruccion();
    const accion=$('accion');
    accion.textContent=t('Nueva ronda');
    accion.disabled=false;
    accion.focus({preventScroll:true});
    if(opciones.narracion){
      const nombre=window.NombreCompartido?.obtener();
      const felicitacion=nombre?idioma(`¡Muy bien, ${nombre}!`,`Well done, ${nombre}!`):t('¡Lo lograste!');
      leer(felicitacion+' '+fraseSobrePreparado());
    }
  }
  function guardarDineroEnSobre() {
    if(fase!=='llenar'||sumar(piezas)!==sumar(sobre))return;
    detenerDeslizamiento();
    fase='guardando-sobre';
    escena.dataset.fase=fase;
    $('instruccion').textContent=instruccion();
    $('bancoPanel').inert=true;
    $('efectivoSobre').inert=true;
    $('accion').disabled=true;
    const efectivo=[...$('efectivoSobre').querySelectorAll('.dinero')];
    if(movimientoReducido.matches||!efectivo.length)return terminarSelladoSobre();
    // Se anima el efectivo en su lugar. La mesa, el sobre y el banco siguen montados.
    for(const ficha of efectivo)ficha.classList.remove('dinero-entrando');
    const sobreMesa=$('destinoDinero').querySelector('.sobre-mesa');
    const boca=sobreMesa.querySelector('.boca-sobre');
    const entrada=boca.getBoundingClientRect();
    const escala=Matematicas.escala(),duracion=500,intervalo=Math.min(100,450/efectivo.length);
    const cierre=duracion+intervalo*(efectivo.length-1),duracionCierre=310;
    const animaciones=efectivo.map((ficha,i)=>{
      const r=ficha.getBoundingClientRect();
      const x=(entrada.x+entrada.width/2-r.x-r.width/2)/escala;
      const y=(entrada.y+entrada.height*.44-r.y-r.height/2)/escala;
      return ficha.animate([
        {transform:'none',clipPath:'inset(0)'},
        {transform:`translate(${x*.88}px,${y-12/escala}px)`,clipPath:'inset(0)',offset:.72},
        {transform:`translate(${x}px,${y}px)`,clipPath:'inset(48% 42%)',opacity:0}
      ],{duration:duracion,delay:i*intervalo,easing:'ease-in-out',fill:'both'});
    });
    const cierreSobre={duration:duracionCierre,delay:cierre,easing:'ease-in-out',fill:'both'};
    animaciones.push(sobreMesa.querySelector('.solapa-sobre').animate([{transform:'rotateX(124deg)'},{transform:'rotateX(0deg)'}],cierreSobre));
    animaciones.push(boca.animate([{opacity:1},{opacity:0}],cierreSobre));
    selladoSobre={animaciones,temporizador:setTimeout(terminarSelladoSobre,cierre+duracionCierre)};
  }
  function mostrarUltimaPieza(bandeja) {
    const ultima=bandeja?.querySelector(`[data-indice-efectivo="${piezas.length-1}"]`);
    if(!ultima)return null;
    const frente=ultima.querySelector('.pila-dinero > :last-child');
    const inicioPila=bandeja.scrollTop+(ultima.getBoundingClientRect().top-bandeja.getBoundingClientRect().top)/Matematicas.escala();
    const inicioFrente=inicioPila+(frente?.offsetTop||0);
    const altoFrente=(frente||ultima).offsetHeight;
    const finalFrente=inicioFrente+altoFrente;
    const cifra=frente?.querySelector('.valor-billete');
    const altoVisible=bandeja.clientHeight;
    // La cifra impresa del margen izquierdo ocupa la parte superior del billete.
    const abajo=cifra&&finalFrente-inicioPila>altoVisible
      ?inicioFrente+Math.max(altoFrente*.45,cifra.offsetTop+cifra.offsetHeight):finalFrente;
    const arriba=cifra&&abajo-inicioPila<=altoVisible?inicioPila:inicioFrente;
    if(arriba<bandeja.scrollTop)bandeja.scrollTop=arriba;
    else if(abajo>bandeja.scrollTop+altoVisible)bandeja.scrollTop=abajo-altoVisible;
    return frente||ultima.firstElementChild;
  }
  function lecturaContador() {
    const reto=varianteContador==='reto';
    return (reto?etiquetaTotal('Monto pedido',metaContador):etiquetaTotal('Última pieza',piezas.at(-1)??0))+
      (!reto||opciones.ayudas||fase==='listo'?etiquetaTotal('Total contado',sumar(piezas)):'');
  }
  function fichaEnRanura(tipo) {
    const valor=colaContador[0];
    return !movimientoReducido.matches&&valor!==undefined&&tipoDinero(valor)===tipo?pieza(valor):'';
  }
  function ranuraContador(tipo,rotulo) {
    return `<div class="entrada-contador" data-ranura="${tipo}">
      <span class="rotulo-ranura">${t(rotulo)} <span aria-hidden="true">↓</span></span>
      <span class="ranura-contador" aria-hidden="true"></span>
      <div class="flujo-contador" aria-hidden="true">${fichaEnRanura(tipo)}</div>
    </div>`;
  }
  function verContador() {
    const valor=colaContador[0];
    const procesando=valor===undefined?'':`data-procesando="${tipoDinero(valor)}"`;
    const avance=valor===undefined?0:performance.now()-inicioPasoContador;
    return `<section class="contador-caja" ${procesando} style="--tiempo-paso:${tiempoPasoContador}ms;--avance-paso:${avance}ms">
      <div class="cabina-contador">
        <section id="destinoDinero" class="entradas-contador" aria-label="${t('Ranuras para el dinero')}">
          ${ranuraContador('moneda','Monedas')}
          ${ranuraContador('billete','Billetes')}
          <div class="conductos-contador" aria-hidden="true"><span class="boca-contador"></span></div>
        </section>
        <div class="frente-contador">
          <div class="pantalla-contador" id="lecturaContador" role="group" aria-label="${t('Pizarra del contador')}">${lecturaContador()}</div>
          <span class="piloto-contador" aria-hidden="true"></span>
        </div>
      </div>
      <section class="bandeja-contador" aria-labelledby="rotuloDineroContado">
        <header class="salida-contador">
          <h3 id="rotuloDineroContado">${t('Dinero contado')}</h3>
          ${fase==='medir'?`<small class="ayuda-contador">${t('Arrastra para acomodar')}</small>`:''}
        </header>
        <div class="superficie-contador" id="dineroContado">
          <div class="plano-contador" id="planoContador" data-superficie-efectivo>${fichasPago(fase==='medir')}</div>
        </div>
      </section>
    </section>`;
  }
  function actualizarContador(recienContada=false) {
    $('lecturaContador').innerHTML=lecturaContador();
    const plano=$('planoContador');
    plano.innerHTML=fichasPago(fase==='medir');
    distribuirContador(plano,recienContada);
    if(!recienContada)return;
    const ultima=plano.querySelector(`[data-indice-efectivo="${piezas.length-1}"]`);
    const ficha=ultima?.querySelector('.pila-dinero > :last-child')||ultima?.firstElementChild;
    if(!ficha||movimientoReducido.matches)return;
    const boca=contenido.querySelector('.boca-contador').getBoundingClientRect();
    const lugar=ficha.getBoundingClientRect();
    const escala=Matematicas.escala()*(Number(plano.style.getPropertyValue('--escala-bandeja'))||1);
    ficha.style.setProperty('--salida-x',((boca.left+boca.width/2-lugar.left-lugar.width/2)/escala)+'px');
    ficha.style.setProperty('--salida-y',((boca.bottom-lugar.top-lugar.height/2)/escala)+'px');
    ficha.classList.add('pieza-contada');
  }
  function distribuirContador(plano,recienContada=false) {
    const {width:ancho,height:alto}=plano.getBoundingClientRect();
    if(!ancho||!alto||!plano.childElementCount)return;
    const escalaAnterior=Number(plano.style.getPropertyValue('--escala-bandeja'))||1;
    const fichas=[...plano.children].map(nodo=>{
      const {width,height}=nodo.getBoundingClientRect();
      return {nodo,i:Number(nodo.dataset.posicionEfectivo),ancho:width/escalaAnterior,alto:height/escalaAnterior};
    });
    if(recienContada){
      const nueva=fichas.findIndex(({nodo})=>Number(nodo.dataset.indiceEfectivo)===piezas.length-1);
      // Si crece una pila, busca sitio para ella después de ubicar las demás piezas.
      if(nueva>=0)fichas.push(...fichas.splice(nueva,1));
    }
    let escala=recienContada?escalaAnterior:1;
    let ubicadas=[];
    for(const ficha of fichas){
      const p=posicionesEfectivo[ficha.i];
      const medidas={ancho:ficha.ancho*escala,alto:ficha.alto*escala};
      const lugar=posicionLibre({x:(p?.x??.55)*ancho,y:(p?.y??.35)*alto},medidas,ubicadas,ancho,alto);
      if(!lugar)break;
      ubicadas.push({...ficha,...medidas,...lugar});
    }
    if(ubicadas.length!==fichas.length)({escala,ubicadas}=compactarBandejaContador(fichas,ancho,alto));
    plano.style.setProperty('--escala-bandeja',escala);
    for(const {nodo,i,x,y} of ubicadas){
      const posicion={x:x/ancho,y:y/alto};
      posicionesEfectivo[i]=posicion;
      nodo.style.left=posicion.x*100+'%';
      nodo.style.top=posicion.y*100+'%';
    }
  }
  function compactarBandejaContador(fichas,ancho,alto) {
    const orden=[...fichas].sort((a,b)=>b.alto-a.alto||b.ancho-a.ancho);
    const margen=Math.min(margenMesa,ancho*.05,alto*.05);
    const anchoUtil=ancho-2*margen,altoUtil=alto-2*margen;
    const separacion=Math.min(separacionMesa,anchoUtil/(2*orden.length));
    function distribuirEnFilas(escala){
      const ubicadas=[];
      let x=0,y=0,altoFila=0;
      for(const ficha of orden){
        const w=ficha.ancho*escala,h=ficha.alto*escala;
        if(w>anchoUtil)return null;
        if(x+w>anchoUtil){
          x=0;
          y+=altoFila+separacion;
          altoFila=0;
        }
        if(y+h>altoUtil)return null;
        ubicadas.push({...ficha,x:margen+x+w/2,y:margen+y+h/2});
        x+=w+separacion;
        altoFila=Math.max(altoFila,h);
      }
      return ubicadas;
    }
    const completas=distribuirEnFilas(1);
    if(completas)return {escala:1,ubicadas:completas};
    // Una fila cabe a esta escala. Busca desde ahí el mayor tamaño que admite la bandeja.
    const anchoEnFila=orden.reduce((suma,ficha)=>suma+ficha.ancho,0);
    let escala=Math.min((anchoUtil-(orden.length-1)*separacion)/anchoEnFila,altoUtil/orden[0].alto)*.99;
    let ubicadas=distribuirEnFilas(escala),tope=1;
    for(let i=0;i<8;i++){
      const prueba=(escala+tope)/2;
      const resultado=distribuirEnFilas(prueba);
      if(resultado){
        escala=prueba;
        ubicadas=resultado;
      }else tope=prueba;
    }
    return {escala,ubicadas};
  }
  function esperandoContador() {
    return modo==='contador'&&varianteContador==='reto'&&colaContador.length>0;
  }
  function pintarRanuras() {
    const entradas=$('destinoDinero');
    for(const ranura of entradas.querySelectorAll('[data-ranura]')){
      ranura.querySelector('.flujo-contador').innerHTML=fichaEnRanura(ranura.dataset.ranura);
    }
    const maquina=entradas.closest('.contador-caja');
    maquina.style.removeProperty('--avance-paso');
    const valor=colaContador[0];
    if(valor!==undefined)maquina.dataset.procesando=tipoDinero(valor);
    else delete maquina.dataset.procesando;
    $('accion').disabled=esperandoContador();
  }
  function cancelarContador() {
    clearTimeout(temporizadorContador);
    temporizadorContador=0;
    colaContador.length=0;
  }
  function contarSiguiente() {
    inicioPasoContador=performance.now();
    pintarRanuras();
    if(!colaContador.length)return;
    if(largosBillete[colaContador[0]])sonarTolva(colaContador[0]);
    const registrar=()=>{
      // No reconstruir la bandeja mientras un dedo sostiene una de sus piezas.
      if(arrastre?.origen.closest('#planoContador')){
        temporizadorContador=setTimeout(registrar,70);
        return;
      }
      const valor=colaContador.shift();
      if(!largosBillete[valor])sonarTolva(valor);
      piezas.push(valor);
      actualizarContador(true);
      if(opciones.narracion&&!colaContador.length){
        leer(varianteContador==='reto'&&!opciones.ayudas
          ?idioma(`Ingresaste ${formato(valor)}.`,`You added ${formato(valor)}.`)
          :idioma(`Ingresaste ${formato(valor)}. Hay ${formato(sumar(piezas))} en total.`,
            `You added ${formato(valor)}. The total is ${formato(sumar(piezas))}.`));
      }
      contarSiguiente();
    };
    if(movimientoReducido.matches)registrar();
    else temporizadorContador=setTimeout(registrar,tiempoPasoContador);
  }
  function prepararSeleccionAlcance() {
    oferta=oferta.slice(0,opciones.cantidadAlcance);
    let mayor=Math.max(...oferta.map(articulo=>articulo.precio));
    if(oferta.every(articulo=>articulo.precio===mayor)){
      // Con una sola denominación activa pueden coincidir todos los precios.
      const articulo=tomar(oferta),diferencia=opciones.activas[0];
      articulo.precio+=diferencia;
      articulo.monedas=[...articulo.monedas,diferencia];
      mayor=articulo.precio;
    }
    const referencia=tomar(oferta.filter(articulo=>articulo.precio<mayor));
    cartera=barajar(referencia.monedas);
  }
  function verCarteraAlcance() {
    return `<section class="cartera" aria-labelledby="tituloCarteraAlcance">
      <header class="cartera-cabecera">
        <img src="imagenes/cartera-alcance.png" alt="" width="224" height="213">
        <h3 id="tituloCarteraAlcance">${t('Tu dinero')}</h3>
      </header>
      <div class="dinero-en-sobre" style="--piezas-cartera:${Math.max(1,cartera.length)}">${cartera.map(valor=>`<span role="img" aria-label="${etiquetaDinero(valor)}">${pieza(valor)}</span>`).join('')}</div>
      ${opciones.ayudas||fase==='listo'?etiquetaTotal('Total disponible',sumar(cartera)):''}</section>`;
  }
  function exhibirArticuloAlcance(articulo) {
    return `<span class="vitrina-alcance" aria-hidden="true">${producto(articulo)}</span>`;
  }
  function verAlcance() {
    if(varianteAlcance==='seleccion'){
      return `<div class="escaparate-alcance alcance-varios">
        ${verCarteraAlcance()}
        <div class="opciones-alcance" style="--opciones-alcance:${oferta.length}" role="group" aria-label="${t('Artículos para comparar')}">
          ${oferta.map((articulo,i)=>`<button type="button" class="articulo-alcance" data-alcance-articulo="${i}"
            aria-pressed="${elegidos.includes(i)}" ${fase==='listo'?'disabled':''}>
            <span class="marca-alcance" aria-hidden="true">✓</span>
            ${exhibirArticuloAlcance(articulo)}
            <span class="nombre-alcance">${t(articulo.nombre)}</span>
            <strong class="etiqueta-precio">${formato(articulo.precio)}</strong>
          </button>`).join('')}
        </div>
      </div>`;
    }
    const item=oferta[0];
    return `<div class="escaparate-alcance reto-alcance">
      ${verCarteraAlcance()}
      <section class="producto-alcance">
        ${exhibirArticuloAlcance(item)}
        <h3 class="nombre-alcance">${t(item.nombre)}</h3><b class="etiqueta-precio">${formato(item.precio)}</b>
      </section>
      ${fase==='decidir'?`<div class="decidir decisiones-alcance">
        <button type="button" data-alcanza="si"><span aria-hidden="true">✓</span>${t('Sí me alcanza')}</button>
        <button type="button" data-alcanza="no"><span aria-hidden="true">×</span>${t('No me alcanza')}</button>
      </div>`:''}
    </div>`;
  }
  function fichasPago(editable=false,efectivo=piezas) {
    const enContador=modo==='contador';
    const grupos=[];
    const agrupados=new Map();
    for(const [indice,valor] of efectivo.entries()){
      const agrupar=enContador?opciones.apilarContador:largosBillete[valor]&&opciones.apilarBilletes;
      const pila=agrupar?agrupados.get(valor):null;
      // Varias pilas cortas permiten recorrer el efectivo con menos desplazamiento.
      const limite=enContador&&largosBillete[valor]&&contadorCompacto.matches?2:4;
      if(pila&&pila.cantidad<limite){
        pila.cantidad++;
        pila.indice=indice;
      }
      else{
        const ficha={valor,cantidad:1,indice,primera:indice};
        grupos.push(ficha);
        if(agrupar)agrupados.set(valor,ficha);
      }
    }
    return grupos.map(({valor,cantidad,indice,primera})=>{
      const ficha=pieza(valor);
      const tipoPila=enContador?'pila-contador':'pila-billetes';
      const imagen=cantidad>1?`<span class="pila-dinero ${tipoPila}" aria-hidden="true">${ficha.repeat(cantidad)}</span>`:ficha;
      const etiqueta=cantidad>1?idioma(
        `${cantidad} ${valor<1000?'monedas':'billetes'} de ${formato(valor)}`,
        `${cantidad} ${valor<1000?'coins':'banknotes'} of ${formato(valor)}`):etiquetaDinero(valor);
      const quitar=cantidad>1?idioma(`${etiqueta}. Quitar una pieza.`,`${etiqueta}. Remove one piece.`):
        idioma(`Quitar ${etiqueta}`,`Remove ${etiqueta}`);
      const marca=`class="pieza-colocada${modo==='llenar'?' ficha-mesa':''}" data-posicion-efectivo="${primera}"`;
      return editable
        ? `<button type="button" ${marca} data-quitar="${valor}" data-indice-efectivo="${indice}" aria-label="${quitar}">${imagen}</button>`
        : `<span ${marca} role="img" aria-label="${etiqueta}">${imagen}</span>`;
    }).join('');
  }
  function destino(rotulo,estilo='mostrador') {
    const editable=fasesDinero.has(fase);
    const fichas=fichasPago(editable);
    return `<section id="destinoDinero" class="${estilo} zona-dinero"><header><h3>${t(rotulo)}</h3>${(opciones.ayudas||fase==='listo')&&fichas?`<b>${formato(sumar(piezas))}</b>`:''}</header>
      <div class="piezas-colocadas piezas-pago" ${editable?'data-superficie-efectivo':''}>${fichas||`<span>${t(fase==='recibir'?'Guarda aquí el pago del cliente.':'Toca o arrastra una pieza.')}</span>`}</div></section>`;
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
      ${Array.from({length:mesasPorVuelta},(_,tramo)=>verPuesto(tramo*2+indice,tramo)).join('')}</div>`;
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
      `<button type="button" class="origen-dinero" data-recibir="${i}" data-posicion-efectivo="${i}" aria-label="${etiquetaDinero(valor)}">${pieza(valor)}</button>`).join('');
    return vistaCliente('Aquí está mi pago.')+
      `<div class="entrega-cliente ${recibidos.size?'':'efectivo-nuevo'}"><h3>${t('Dinero en el mostrador')}</h3><div class="pago-cliente" data-superficie-efectivo>${efectivo||`<span>${t('Pago guardado en la caja.')}</span>`}</div></div>`+
      destino('Caja registradora','mostrador caja-registradora');
  }
  function iniciarCompraCaja() {
    const existencias=contarPiezas(elegidos.flatMap(i=>oferta[i].monedas));
    const total=precio();
    const conVuelto=modo==='compra'
      ?oferta[elegidos[0]].pagoConVuelto
      :modo==='carrito'&&entero(0,1)===1?pagoQueRequiereVuelto(total):null;
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
      <div class="piezas-colocadas piezas-pago" ${pagando?'data-superficie-efectivo':''}>${fichas||`<span>${t(fase==='entregando'?'La cajera prepara el vuelto…':'Pon el dinero aquí')}</span>`}</div>
      ${fase==='vuelto'?`<div class="decidir respuesta-vuelto">
        <button type="button" data-revisar-vuelto="si">${t('Sí, está bien')}</button>
        <button type="button" data-revisar-vuelto="no">${t('No, está mal')}</button>
      </div>`:''}
      ${fase==='listo'&&mostrandoVuelto?`<p class="resultado-vuelto">${t('Vuelto correcto')} <strong>${formato(aCambio())}</strong></p>`:''}
    </section>`;
  }
  function prepararAudioEfectos() {
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    try{
      audioEfectos??=new Audio();
      if(audioEfectos.state!=='running')audioEfectos.resume().catch(()=>{});
    }catch{}
  }
  function sonarLector() {
    if(!audioEfectos)return;
    try{
      const inicio=audioEfectos.currentTime;
      const tono=audioEfectos.createOscillator(), volumen=audioEfectos.createGain();
      tono.frequency.value=2340;
      volumen.gain.setValueAtTime(.001,inicio);
      volumen.gain.linearRampToValueAtTime(.08,inicio+.004);
      volumen.gain.setValueAtTime(.08,inicio+.062);
      volumen.gain.exponentialRampToValueAtTime(.001,inicio+.087);
      tono.connect(volumen);
      volumen.connect(audioEfectos.destination);
      tono.onended=()=>{tono.disconnect();volumen.disconnect();};
      tono.start(inicio);
      tono.stop(inicio+.09);
    }catch{}
  }
  function sonarSuccion(audio,inicio) {
    if(!aireTolva){
      aireTolva=audio.createBuffer(1,Math.ceil(audio.sampleRate*.25),audio.sampleRate);
      const muestras=aireTolva.getChannelData(0);
      for(let i=0;i<muestras.length;i++)muestras[i]=Math.random()*2-1;
    }
    const aire=audio.createBufferSource(), filtro=audio.createBiquadFilter(), volumen=audio.createGain();
    aire.buffer=aireTolva;
    filtro.type='bandpass';
    filtro.Q.value=.85;
    filtro.frequency.setValueAtTime(460,inicio);
    filtro.frequency.exponentialRampToValueAtTime(2100,inicio+.135);
    filtro.frequency.exponentialRampToValueAtTime(650,inicio+.24);
    volumen.gain.setValueAtTime(.001,inicio);
    volumen.gain.linearRampToValueAtTime(.33,inicio+.065);
    volumen.gain.linearRampToValueAtTime(.23,inicio+.155);
    volumen.gain.exponentialRampToValueAtTime(.001,inicio+.247);
    aire.connect(filtro);
    filtro.connect(volumen);
    volumen.connect(audio.destination);
    aire.onended=()=>{aire.disconnect();filtro.disconnect();volumen.disconnect();};
    aire.start(inicio);
  }
  function sonarMoneda(audio,inicio,valor) {
    const tonoBase=1800*(1.12-monedas[valor].diametro*.22);
    // El primer golpe es más fuerte y los rebotes se acercan al asentarse.
    for(const [retardo,fuerza] of [[.045,1],[.108,.56],[.153,.29]]){
      const golpe=inicio+retardo;
      for(const [parcial,nivel,caida] of [[1,.12,.095],[2.34,.08,.052],[3.61,.035,.027]]){
        const resonancia=audio.createOscillator(), volumen=audio.createGain();
        resonancia.frequency.setValueAtTime(tonoBase*parcial*(1+retardo*.7),golpe);
        volumen.gain.setValueAtTime(.001,golpe);
        volumen.gain.linearRampToValueAtTime(nivel*fuerza,golpe+.003);
        volumen.gain.exponentialRampToValueAtTime(.001,golpe+caida);
        resonancia.connect(volumen);
        volumen.connect(audio.destination);
        resonancia.onended=()=>{resonancia.disconnect();volumen.disconnect();};
        resonancia.start(golpe);
        resonancia.stop(golpe+caida+.003);
      }
    }
  }
  function sonarTolva(valor) {
    if(!opciones.sonidosTolva||!audioEfectos)return;
    try{
      const inicio=audioEfectos.currentTime+.008;
      if(largosBillete[valor])sonarSuccion(audioEfectos,inicio);
      else sonarMoneda(audioEfectos,inicio,valor);
    }catch{
      // Contar dinero también funciona en dispositivos sin salida de audio.
    }
  }
  function ponerProductoCaja(i) {
    if(fase!=='cobro-productos'||compraCaja.pasando!==null||!elegidos.includes(i)||compraCaja.escaneados.includes(i))return;
    prepararAudioEfectos();
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
  const instruccionPrepararSobre=()=>idioma(`Coloca ${formato(sumar(sobre))} en la mesa para llenar el sobre.`,`Put ${formato(sumar(sobre))} on the table to fill the envelope.`);
  function instruccion() {
    switch(fase){
      case 'medir': return varianteContador==='reto'
        ?idioma(`Ingresa ${formato(metaContador)} en la máquina y pulsa Revisar.`,`Put ${formato(metaContador)} into the machine and press Check.`)
        :t('Toca el dinero del banco o arrástralo a las ranuras.');
      case 'decidir': return t('¿Te alcanza el dinero para comprarlo?');
      case 'seleccionar-alcance': return t('Marca todos los artículos que puedes pagar por separado.');
      case 'cerrado': return instruccionAbrirSobre();
      case 'contar': return aperturaSobre?t('Mira cómo se abre el sobre y cae el dinero.'):instruccionContarSobre();
      case 'llenar': return instruccionPrepararSobre();
      case 'guardando-sobre': return t('Mira cómo entra el dinero en el sobre.');
      case 'listo': return t(modo==='llenar'?'¡El sobre está listo!':'¡Lo lograste!');
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
    detenerDeslizamiento();
    if(modo==='contar'){
      contenido.innerHTML=verMesa();
      distribuirMesa();
    }
    else if(modo==='llenar'){
      contenido.innerHTML=verSobreParaLlenar();
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
    for(const bandeja of contenido.querySelectorAll('[data-superficie-efectivo]:not(.mesa-libre)'))dibujarEfectivoGuardado(bandeja);
  }
  function render() {
    if(!modo)return;
    $('tituloModo').textContent=t(modos[modo].nombre);
    $('instruccion').textContent=instruccion();
    $('variantesContador').hidden=modo!=='contador';
    $('explorarContador').setAttribute('aria-pressed',String(varianteContador==='explorar'));
    $('retoContador').setAttribute('aria-pressed',String(varianteContador==='reto'));
    $('variantesAlcance').hidden=modo!=='alcanza';
    $('decidirAlcance').setAttribute('aria-pressed',String(varianteAlcance==='uno'));
    $('seleccionAlcance').setAttribute('aria-pressed',String(varianteAlcance==='seleccion'));
    if(modo==='alcanza')$('guiaModo').textContent=t(varianteAlcance==='seleccion'?
      'Compara cada precio con el dinero de tu cartera.':modos.alcanza.guia);
    const lineas=$('textoInstruccion').dataset;
    if(compraCaja){
      lineas.inicio=instruccionCobro();
      lineas.siguiente=instruccionPago();
    }else if(modo==='contar'){
      lineas.inicio=instruccionAbrirSobre();
      lineas.siguiente=instruccionContarSobre();
    }else if(modo==='llenar'){
      lineas.inicio=instruccionPrepararSobre();
      lineas.siguiente=t('Mira cómo entra el dinero en el sobre.');
    }else if(modo==='alcanza'&&varianteAlcance==='seleccion'){
      lineas.inicio=t('Marca todos los artículos que puedes pagar por separado.');
      delete lineas.siguiente;
    }else{
      delete lineas.inicio;
      delete lineas.siguiente;
    }
    const bancoVisible=fasesDinero.has(fase)||modo==='llenar';
    $('bancoPanel').hidden=!bancoVisible;
    $('bancoPanel').inert=modo==='llenar'&&fase!=='llenar';
    $('bancoPanel').classList.toggle('cartera-compra',fase==='pagar');
    $('bancoTitulo').textContent=t(fase==='pagar'?'Tu cartera':fase==='dar'?'Caja registradora':'Banco de dinero');
    if(bancoVisible)mostrarBanco();
    const sobreRevisado=modo==='contar'&&fase==='listo';
    $('respuesta').hidden=!(sobreRevisado||fasesNumericas.has(fase));
    $('respuesta').inert=Boolean(aperturaSobre)||sobreRevisado;
    escena.dataset.fase=fase;
    actualizarContenido();
    $('accion').hidden=['cerrado','decidir','elegir','cobro-productos','entregando','vuelto'].includes(fase);
    $('accion').disabled=Boolean(aperturaSobre)||esperandoContador()||fase==='guardando-sobre';
    $('accion').textContent=t(({medir:varianteContador==='explorar'?'Vaciar contador':'Revisar',
      escanear:'Cobrar',recibir:'Registrar pago',pagar:'Pagar',dar:'Dar vuelto',
      listo:sobreRevisado?'Revisar':modo==='llenar'?'Nueva ronda':'Siguiente ronda'})[fase]||'Revisar');
  }
  function anunciar(texto='',correcto=false) {
    const mensaje=t(texto);
    const avisoSobre=modo==='llenar'?$('avisoPrepararSobre'):null;
    $('mensaje').textContent=avisoSobre?'':mensaje;
    $('mensaje').classList.toggle('correcto',correcto);
    if(avisoSobre)avisoSobre.textContent=mensaje;
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
  function fraseResultadoSobre() {
    const total=formato(sumar(sobre));
    return idioma(`En el sobre había ${total}.`,`The envelope held ${total}.`);
  }
  function mostrarResultadoSobre() {
    const nombre=window.NombreCompartido?.obtener();
    const titulo=nombre?idioma(`¡Muy bien, ${nombre}!`,`Well done, ${nombre}!`):t('¡Lo lograste!');
    $('tituloResultadoSobre').textContent=titulo;
    $('montoResultadoSobre').textContent=formato(sumar(sobre));
    resultadoSobre.showModal();
    if(opciones.narracion)leer(titulo+' '+fraseResultadoSobre());
  }
  function completarSobre() {
    detenerDeslizamiento();
    limpiarArrastre();
    fase='listo';
    escena.dataset.fase=fase;
    $('respuesta').inert=true;
    $('instruccion').textContent=instruccion();
    anunciar();
    mostrarResultadoSobre();
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
    if(aperturaSobre||fase==='guardando-sobre')return;
    if(fase==='listo') return modo==='contar'?mostrarResultadoSobre():nuevaRonda();
    if(fase==='seleccionar-alcance'){
      if(!elegidos.length)return anunciar('Marca al menos un artículo.');
      const total=sumar(cartera);
      if(oferta.every((articulo,i)=>(articulo.precio<=total)===elegidos.includes(i)))return completar();
      return anunciar('Compara cada precio con el dinero de tu cartera.');
    }
    if(fase==='medir'){
      if(varianteContador==='explorar')return nuevaRonda();
      if(esperandoContador())return;
      const total=sumar(piezas);
      if(total===metaContador)return completar();
      return anunciar(total<metaContador?'Falta dinero.':'Hay dinero de más. Quita alguna pieza.');
    }
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
      return fase==='contar'?completarSobre():completar();
    }
    const total=sumar(piezas);
    const meta=({llenar:()=>sumar(sobre),dar:aCambio,pagar:precio})[fase]();
    if(total===meta){
      if(fase==='llenar')return guardarDineroEnSobre();
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
  function agregarDinero(valor,destino,evento,impulso) {
    if(!opciones.activas.includes(valor)||!fasesDinero.has(fase))return;
    if(piezas.length+colaContador.length>=24)return anunciar('Límite de piezas. Quita alguna para agregar otra.');
    if(fase==='pagar'&&piezas.filter(ficha=>ficha===valor).length>=(compraCaja.cartera.get(valor)||0))return;
    anunciar();
    if(fase==='medir'){
      if(opciones.sonidosTolva)prepararAudioEfectos();
      colaContador.push(valor);
      if(colaContador.length===1)contarSiguiente();
      return;
    }
    piezas.push(valor);
    if(fase==='llenar'){
      actualizarEfectivoSobre({evento,impulso});
      guardarDineroEnSobre();
      return;
    }
    actualizarContenido();
    mostrarUltimaPieza(contenido.querySelector('#destinoDinero .piezas-colocadas'));
    if(evento){
      const bandeja=contenido.querySelector('#destinoDinero [data-superficie-efectivo]');
      const ficha=bandeja?.querySelector(`[data-indice-efectivo="${piezas.length-1}"]`);
      if(ficha)moverEfectivo(bandeja,ficha,evento.clientX,evento.clientY,impulso);
    }
    actualizarCarteraCompra();
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
  function cajaEnSuperficie(nodo,superficie) {
    const rect=nodo.getBoundingClientRect();
    return {x:rect.left-superficie.left+rect.width/2,y:rect.top-superficie.top+rect.height/2,ancho:rect.width,alto:rect.height};
  }
  function seCruzan(punto,ficha,otra) {
    return Math.abs(punto.x-otra.x)<(otra.ancho+ficha.ancho)/2+separacionMesa-.01&&
      Math.abs(punto.y-otra.y)<(otra.alto+ficha.alto)/2+separacionMesa-.01;
  }
  function posicionLibre(punto,ficha,ocupadas,ancho,alto) {
    const minX=ficha.ancho/2+margenMesa,maxX=ancho-minX;
    const minY=ficha.alto/2+margenMesa,maxY=alto-minY;
    if(minX>maxX||minY>maxY)return null;
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
      if(ocupadas.some(otra=>seCruzan({x,y},ficha,otra)))continue;
      mejor={x,y};
      distancia=distancia2;
    }
    return mejor;
  }
  function distribuirMesa() {
    const superficie=contenido.querySelector('.mesa-libre');
    if(!superficie)return;
    const desplazable=superficie.parentElement;
    const desplazamiento=desplazable.scrollTop;
    superficie.style.minHeight='';
    const rect=superficie.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const fichas=[...superficie.querySelectorAll('.ficha-mesa')].map(nodo=>{
      const {width,height}=nodo.getBoundingClientRect();
      const i=Number(nodo.dataset.fichaMesa??nodo.dataset.posicionEfectivo);
      return {i,nodo,ancho:width,alto:height};
    });
    const posiciones=modo==='contar'?posicionesMesa:posicionesEfectivo;
    const {width:ancho,height:alto}=rect;
    const sobre=superficie.closest('.tablero-mesa').querySelector('.sobre-mesa');
    const ocupadas=[cajaEnSuperficie(sobre,rect)];
    const ubicadas=[];
    for(const [orden,ficha] of fichas.entries()){
      const p=posiciones[ficha.i]||{x:.73+(orden%2)*.1,y:.26+(orden%3)*.22};
      const lugar=posicionLibre({x:p.x*ancho,y:p.y*alto},ficha,ocupadas,ancho,alto);
      if(!lugar){
        distribuirMesaEnFilas(superficie,fichas,rect,sobre,posiciones);
        desplazable.scrollTop=desplazamiento;
        return;
      }
      const ubicada={...ficha,...lugar};
      ubicadas.push(ubicada);
      ocupadas.push(ubicada);
    }
    for(const p of ubicadas)posiciones[p.i]={x:p.x/ancho,y:p.y/alto};
    dibujarMesa(fichas,rect,posiciones);
    desplazable.scrollTop=desplazamiento;
  }
  function distribuirMesaEnFilas(superficie,fichas,rect,sobre,posiciones) {
    const centros=[];
    const preparando=superficie.classList.contains('interior-sobre');
    const inicioX=preparando?sobre.getBoundingClientRect().right-rect.left+separacionMesa:margenMesa;
    let x=inicioX,y=margenMesa,altoFila=0;
    for(const ficha of fichas){
      if(altoFila&&x+ficha.ancho>rect.width-margenMesa){
        x=inicioX;
        y+=altoFila+separacionMesa;
        altoFila=0;
      }
      centros[ficha.i]={x:x+ficha.ancho/2,y:y+ficha.alto/2};
      x+=ficha.ancho+separacionMesa;
      altoFila=Math.max(altoFila,ficha.alto);
    }
    const espacioSobre=preparando?0:sobre.getBoundingClientRect().height+separacionMesa;
    const altoNecesario=y+altoFila+espacioSobre+2*margenMesa;
    if(altoNecesario>rect.height)superficie.style.minHeight=altoNecesario/Matematicas.escala()+'px';
    const destino=superficie.getBoundingClientRect();
    for(const {i} of fichas)posiciones[i]={x:centros[i].x/destino.width,y:centros[i].y/destino.height};
    dibujarMesa(fichas,destino,posiciones);
  }
  function dibujarMesa(fichas,rect,posiciones) {
    const boca=aperturaSobre?contenido.querySelector('.boca-sobre').getBoundingClientRect():null;
    const escala=boca?Matematicas.escala():1;
    for(const {i,nodo} of fichas){
      const {x,y}=posiciones[i];
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
    for(const boton of tablero.querySelectorAll('#ordenarMesa,.ficha-mesa')){
      boton.disabled=false;
      boton.removeAttribute('aria-hidden');
    }
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
  function moverEnMesa(origen,x,y,impulso) {
    if(!['contar','listo'].includes(fase)||aperturaSobre||!mesa[origen])return;
    fichaElegida=null;
    contenido.querySelector('[data-ficha-mesa][aria-pressed=true]')?.setAttribute('aria-pressed','false');
    const nodo=contenido.querySelector(`[data-ficha-mesa="${origen}"]`);
    moverEfectivo(nodo.closest('.mesa-libre'),nodo,x,y,impulso);
  }
  function detenerDeslizamiento() {
    cancelAnimationFrame(cuadroDeslizamiento);
    cuadroDeslizamiento=0;
  }
  function deslizarEfectivo(punto,impulso,ficha,rect,ocupadas,dibujar,nodo) {
    if(!impulso||movimientoReducido.matches)return;
    let {x:vx,y:vy}=impulso;
    const minX=ficha.ancho/2+margenMesa,maxX=rect.width-minX;
    const minY=ficha.alto/2+margenMesa,maxY=rect.height-minY;
    let anterior=performance.now(),recorrido=0;
    function paso(ahora) {
      if(!nodo.isConnected)return detenerDeslizamiento();
      const lapso=Math.max(0,Math.min(24,ahora-anterior));
      anterior=ahora;
      recorrido+=lapso;
      // Los pasos cortos evitan atravesar una moneda al lanzar rápido.
      const pasos=Math.max(1,Math.ceil(lapso/6));
      const dt=lapso/pasos;
      for(let i=0;i<pasos;i++){
        const x=Math.max(minX,Math.min(maxX,punto.x+vx*dt));
        const y=Math.max(minY,Math.min(maxY,punto.y+vy*dt));
        if(ocupadas.some(otra=>seCruzan({x,y:punto.y},ficha,otra)))vx*=-.52;
        else{
          punto.x=x;
          if(x===minX||x===maxX)vx*=-.58;
        }
        if(ocupadas.some(otra=>seCruzan({x:punto.x,y},ficha,otra)))vy*=-.52;
        else{
          punto.y=y;
          if(y===minY||y===maxY)vy*=-.58;
        }
        const freno=Math.exp(-.004*dt);
        vx*=freno;
        vy*=freno;
      }
      dibujar(punto);
      if(Math.hypot(vx,vy)>.045&&recorrido<1200)cuadroDeslizamiento=requestAnimationFrame(paso);
      else detenerDeslizamiento();
    }
    cuadroDeslizamiento=requestAnimationFrame(paso);
  }
  function moverEfectivo(superficie,nodo,clienteX,clienteY,impulso) {
    detenerDeslizamiento();
    const rect=superficie.getBoundingClientRect();
    const libre=superficie.id==='planoContador'||superficie.classList.contains('mesa-libre');
    const ficha=cajaEnSuperficie(nodo,rect);
    if(ficha.ancho+2*margenMesa>rect.width||ficha.alto+2*margenMesa>rect.height)return;
    const ocupadas=[...superficie.querySelectorAll('.ficha-mesa,.sobre-mesa,.pieza-colocada,[data-recibir]')].filter(otra=>otra!==nodo)
      .map(otra=>cajaEnSuperficie(otra,rect));
    const sobrePreparado=superficie.closest('.marco-mesa-preparar')?.querySelector('.sobre-mesa');
    if(sobrePreparado)ocupadas.push(cajaEnSuperficie(sobrePreparado,rect));
    const punto=posicionLibre({x:clienteX-rect.left,y:clienteY-rect.top},ficha,ocupadas,rect.width,rect.height);
    if(!punto)return;
    const posiciones=posicionesDe(superficie);
    const indice=Number(nodo.dataset.fichaMesa??nodo.dataset.posicionEfectivo);
    const escala=Matematicas.escala();
    if(!libre)nodo.style.translate='';
    const base=cajaEnSuperficie(nodo,rect);
    function dibujar({x,y}){
      const relativa={x:x/rect.width,y:y/rect.height};
      posiciones[indice]=relativa;
      if(libre){
        nodo.style.left=relativa.x*100+'%';
        nodo.style.top=y/rect.height*100+'%';
      }else nodo.style.translate=`${(x-base.x)/escala}px ${(y-base.y)/escala}px`;
    }
    dibujar(punto);
    deslizarEfectivo(punto,impulso,ficha,rect,ocupadas,dibujar,nodo);
  }
  function posicionesDe(superficie) {
    if(superficie.classList.contains('pago-cliente'))return posicionesCliente;
    return modo==='contar'?posicionesMesa:posicionesEfectivo;
  }
  function dibujarEfectivoGuardado(superficie) {
    if(superficie.id==='planoContador')return distribuirContador(superficie);
    const posiciones=posicionesDe(superficie);
    if(!posiciones.some(Boolean))return;
    const rect=superficie.getBoundingClientRect();
    for(const ficha of superficie.querySelectorAll('[data-posicion-efectivo]')){
      const p=posiciones[Number(ficha.dataset.posicionEfectivo)];
      if(p)moverEfectivo(superficie,ficha,rect.x+p.x*rect.width,rect.y+p.y*rect.height);
    }
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
  function quitarDinero(valor,indice) {
    if(piezas[indice]!==valor||!fasesDinero.has(fase))return;
    piezas.splice(indice,1);
    posicionesEfectivo.splice(indice,1);
    anunciar();
    if(fase==='llenar'){
      actualizarEfectivoSobre();
      guardarDineroEnSobre();
      if(fase!=='llenar')return;
    }
    else if(fase==='medir')actualizarContador();
    else actualizarContenido();
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
    {clave:'recibir',destino:'#destinoDinero,.pago-cliente',soltar:(i,nodo,evento,impulso,origen)=>{
      if(nodo.id==='destinoDinero')guardarPago(i);
      else moverEfectivo(nodo,origen,evento.clientX,evento.clientY,impulso);
    }},
    {clave:'fichaMesa',destino:'.mesa-libre',soltar:(i,nodo,evento,impulso)=>moverEnMesa(i,evento.clientX,evento.clientY,impulso)},
    {clave:'indiceEfectivo',destino:'[data-superficie-efectivo]',
      soltar:(i,nodo,evento,impulso,origen)=>moverEfectivo(nodo,origen,evento.clientX,evento.clientY,impulso)}
  ];
  function impulsoAlSoltar(d,evento) {
    const reciente=d.muestras.at(-1);
    if(evento.timeStamp-reciente.t>80)return null;
    const primera=d.muestras.find(p=>reciente.t-p.t<=100)||reciente;
    const tiempo=evento.timeStamp-primera.t;
    const dx=evento.clientX-primera.x,dy=evento.clientY-primera.y;
    const distancia=Math.hypot(dx,dy);
    if(tiempo<8||distancia<13||distancia/tiempo<.36)return null;
    const velocidad=Math.min(2.1,distancia/tiempo)*.82;
    return {x:dx/distancia*velocidad,y:dy/distancia*velocidad};
  }
  escena.addEventListener('pointerdown',evento=>{
    const origen=evento.target.closest('button[data-dinero],button[data-producto],button[data-poner-caja],button[data-devolver],button[data-recibir],button[data-ficha-mesa],button[data-indice-efectivo]');
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
    detenerDeslizamiento();
    if(fase==='elegir')detenerPasillo();
    const fuente=fuentesArrastre.find(({clave})=>Object.hasOwn(origen.dataset,clave));
    if(!origen.firstElementChild)return;
    arrastre={id:evento.pointerId,origen,fuente,
      x:evento.clientX,y:evento.clientY,valor:Number(origen.dataset[fuente.clave]),
      muestras:[{x:evento.clientX,y:evento.clientY,t:evento.timeStamp}]};
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
    d.muestras.push({x,y,t:evento.timeStamp});
    while(d.muestras.length>2&&evento.timeStamp-d.muestras[0].t>100)d.muestras.shift();
    if(!d.fantasma){
      if(Math.hypot(x-d.x,y-d.y)<7)return;
      const grupo=d.origen.closest('#planoContador')?d.origen.querySelector('.pila-contador'):null;
      const original=grupo||d.origen.querySelector('.pila-dinero .dinero:last-child')||d.origen.firstElementChild;
      const rect=original.getBoundingClientRect();
      d.fantasma=document.createElement('div');
      d.fantasma.className='fantasma-colones';
      d.fantasma.setAttribute('aria-hidden','true');
      d.fantasma.style.width=rect.width+'px';
      d.fantasma.style.height=rect.height+'px';
      const copia=original.cloneNode(true);
      if(grupo){
        const piezasOriginales=grupo.querySelectorAll('.dinero');
        copia.querySelectorAll('.dinero').forEach((ficha,i)=>{
          const {width,height}=piezasOriginales[i].getBoundingClientRect();
          ficha.style.setProperty('--ficha-ancho',width+'px');
          ficha.style.setProperty('--ficha-alto',height+'px');
        });
      }
      d.fantasma.append(copia);
      document.body.append(d.fantasma);
      if(d.origen.closest('[data-superficie-efectivo]'))d.origen.classList.add('moviendo-ficha');
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
      const tocado=document.elementFromPoint(evento.clientX,evento.clientY)?.closest(d.fuente.destino);
      const destino=d.fuente.clave==='recibir'&&tocado?.id==='destinoDinero'?tocado:
        d.origen.closest('[data-superficie-efectivo]')||tocado;
      if(destino)d.fuente.soltar(d.valor,destino,evento,impulsoAlSoltar(d,evento),d.origen);
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
    if(selladoSobre)terminarSelladoSobre();
    if(empuje)detenerPasillo();
    limpiarArrastre();
    detenerDeslizamiento();
  }
  addEventListener('resize',terminarGestos);
  addEventListener('blur',terminarGestos);
  document.addEventListener('fullscreenchange',terminarGestos);
  contadorCompacto.addEventListener('change',()=>{
    if(modo==='contador'&&opciones.apilarContador)actualizarContador();
  });
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
    else if(boton.hasAttribute('data-alcance-articulo')&&fase==='seleccionar-alcance'){
      const i=Number(boton.dataset.alcanceArticulo);
      const seleccionado=elegidos.includes(i);
      elegidos=seleccionado?elegidos.filter(indice=>indice!==i):[...elegidos,i];
      boton.setAttribute('aria-pressed',String(!seleccionado));
      anunciar();
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
    else if(boton.hasAttribute('data-quitar')) quitarDinero(Number(boton.dataset.quitar),Number(boton.dataset.indiceEfectivo));
  });
  escena.addEventListener('keydown',evento=>{
    if(evento.target.id==='empujarCarrito'&&['ArrowUp','ArrowDown'].includes(evento.key)){
      evento.preventDefault();
      anunciar();
      desplazarPasillo(evento.key==='ArrowUp'?1:-1);
      return;
    }
    const ficha=evento.target.closest('button[data-ficha-mesa],button[data-indice-efectivo],button[data-recibir]');
    const paso={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[evento.key];
    const superficie=ficha?.closest('[data-superficie-efectivo]');
    if(!superficie||!paso)return;
    evento.preventDefault();
    const r=ficha.getBoundingClientRect();
    const x=r.x+r.width/2+paso[0]*16,y=r.y+r.height/2+paso[1]*16;
    if(ficha.hasAttribute('data-ficha-mesa'))moverEnMesa(Number(ficha.dataset.fichaMesa),x,y);
    else moverEfectivo(superficie,ficha,x,y);
  });
  function mostrarModo(vista) {
    resultadoSobre.close();
    limpiarArrastre();
    detenerDeslizamiento();
    cancelarContador();
    cancelarRecorrido();
    cerrarCompraCaja();
    cancelarAperturaSobre();
    cancelarSelladoSobre();
    window.speechSynthesis?.cancel();
    modo=vista;
    $('modos').hidden=Boolean(vista);
    $('juego').hidden=!vista;
    $('modosVolver').hidden=$('nueva').hidden=!vista;
    $('guiaModo').textContent=t(vista?modos[vista].guia:'Elige una actividad para practicar con monedas y billetes de Costa Rica.');
    if(vista)nuevaRonda();
  }
  const historial=HistorialModos.crear(Object.keys(modos).filter(id=>!modos[id].enlace),mostrarModo);
  $('modos').addEventListener('click',evento=>{
    const tarjeta=evento.target.closest('[data-modo]');
    if(tarjeta)historial.ir(tarjeta.dataset.modo);
  });
  for(const id of ['modosVolver','volverPlegado'])$(id).onclick=()=>historial.volver();
  $('nueva').onclick=nuevaRonda;
  $('accion').onclick=revisar;
  $('escuchar').onclick=()=>leer(modo==='llenar'&&fase==='listo'?fraseSobrePreparado():instruccion());
  $('iconoResultadoSobre').innerHTML=envoltura()+'<span class="marca-resultado-sobre">✓</span>';
  $('cerrarResultadoSobre').onclick=()=>resultadoSobre.close();
  $('leerResultadoSobre').onclick=()=>leer(fraseResultadoSobre());
  $('seguirResultadoSobre').onclick=()=>{
    nuevaRonda();
    $('abrirSobre').focus({preventScroll:true});
  };
  resultadoSobre.addEventListener('close',()=>{
    if(modo==='contar'&&fase==='listo')$('accion').focus({preventScroll:true});
  });
  for(const [id,variante] of [['explorarContador','explorar'],['retoContador','reto']]){
    $(id).onclick=()=>{
      if(varianteContador===variante||modo!=='contador')return;
      varianteContador=variante;
      guardarAjustes();
      nuevaRonda();
    };
  }
  for(const [id,variante] of [['decidirAlcance','uno'],['seleccionAlcance','seleccion']]){
    $(id).onclick=()=>{
      if(varianteAlcance===variante||modo!=='alcanza')return;
      varianteAlcance=variante;
      guardarAjustes();
      nuevaRonda();
    };
  }
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
  function aplicarVistaDinero() {
    document.documentElement.classList.toggle('mostrar-cifras-billetes',opciones.mostrarCifraBilletes);
    document.documentElement.classList.toggle('mostrar-cifras-monedas',opciones.mostrarCifraMonedas);
    for(const {clase,preferencia} of controlesTamano){
      document.documentElement.style.setProperty('--escala-'+clase,opciones[preferencia]/100);
    }
  }
  function rotularAjustes() {
    $('denominaciones').innerHTML=valores.map(valor=>`<label><input type="checkbox" value="${valor}" aria-label="${etiquetaDinero(valor)}" ${opciones.activas.includes(valor)?'checked':''}>${pieza(valor)}</label>`).join('');
  }
  $('configurar').onclick=()=>{
    if(selladoSobre)terminarSelladoSobre();
    limpiarArrastre();
    detenerDeslizamiento();
    const estabaLlegando=Boolean(llegadaCaja);
    if(llegadaCaja)avancePasillo=llegadaCaja.inicio;
    cancelarRecorrido();
    if(estabaLlegando)actualizarContenido();
    rotularAjustes();
    $('ayudas').checked=opciones.ayudas;
    $('narracion').checked=opciones.narracion;
    $('apilarBilletes').checked=opciones.apilarBilletes;
    $('mostrarCifraBilletes').checked=opciones.mostrarCifraBilletes;
    $('mostrarCifraMonedas').checked=opciones.mostrarCifraMonedas;
    $('apilarContador').checked=opciones.apilarContador;
    $('sonidosTolva').checked=opciones.sonidosTolva;
    $('nombresProductos').checked=opciones.nombresProductos;
    $('cantidadAlcance').value=opciones.cantidadAlcance;
    $('vueltoCaja').value=opciones.vueltoCaja;
    for(const {control,preferencia} of controlesTamano)control.value=opciones[preferencia];
    previsualizarTamano();
    $('errorAjustes').hidden=true;
    IdiomaVoz.iniciarEdicion();
    ajustes.showModal();
  };
  function guardarAjustes() {
    Matematicas.guardar(clave,{...opciones,varianteContador,varianteAlcance});
  }
  function aplicarAjustes() {
    const activas=[...$('denominaciones').querySelectorAll('input:checked')].map(input=>Number(input.value));
    if(!activas.length){$('errorAjustes').hidden=false;return;}
    const cantidadAlcance=$('cantidadAlcance').value==='4'?4:3;
    const cambio=activas.join()!==opciones.activas.join()||
      (modo==='alcanza'&&varianteAlcance==='seleccion'&&cantidadAlcance!==opciones.cantidadAlcance);
    opciones={activas,ayudas:$('ayudas').checked,narracion:$('narracion').checked,
      apilarBilletes:$('apilarBilletes').checked,
      mostrarCifraBilletes:$('mostrarCifraBilletes').checked,
      mostrarCifraMonedas:$('mostrarCifraMonedas').checked,
      apilarContador:$('apilarContador').checked,
      sonidosTolva:$('sonidosTolva').checked,
      tamanoBilletes:$('tamanoBilletes').valueAsNumber,
      tamanoMonedas:$('tamanoMonedas').valueAsNumber,
      nombresProductos:$('nombresProductos').checked,
      cantidadAlcance,
      vueltoCaja:$('vueltoCaja').value};
    guardarAjustes();
    aplicarVistaDinero();
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
    detenerDeslizamiento();
    const estilo=document.documentElement.style;
    estilo.setProperty('--u',1/z+'px');
    estilo.setProperty('--alto',alto+'px');
    estilo.setProperty('--ancho',document.documentElement.clientWidth/z+'px');
    distribuirMesa();
    for(const bandeja of contenido.querySelectorAll('[data-superficie-efectivo]:not(.mesa-libre)'))dibujarEfectivoGuardado(bandeja);
  });
  aplicarVistaDinero();
  localizar();
  historial.restaurar();
})();
