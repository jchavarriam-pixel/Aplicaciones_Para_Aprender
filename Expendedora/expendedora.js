(() => {
  'use strict';

  Object.assign(window.TEXTOS_INGLES, {
    'Máquina expendedora':'Vending machine',
    'Simulación de compra':'Shopping simulation',
    'Elige un producto.':'Choose a product.',
    'Introduce el dinero.':'Insert your money.',
    'Recoge tu compra.':'Pick up your purchase.',
    'Nueva compra':'New purchase',
    'Bebidas y meriendas':'Drinks and snacks',
    'Productos disponibles':'Available products',
    'Entradas de dinero':'Money slots',
    'Nombre del estudiante':'Student name',
    'Escuchar instrucción':'Listen to the instruction',
    'Denominaciones para practicar':'Denominations to practise',
    'Aplicar y cerrar':'Apply and close',
    'Monedas':'Coins',
    'Billetes':'Banknotes',
    'Comprar':'Buy',
    'Devolver':'Return',
    'Devolver dinero':'Return money',
    'Bandeja':'Pickup tray',
    'Recoger producto':'Pick up product',
    'Recoger vuelto':'Collect change',
    'Recoger dinero':'Collect money',
    'Tu cartera':'Your wallet',
    'Agua':'Water',
    'Jugo de naranja':'Orange juice',
    'Galletas':'Cookies',
    'Papas fritas':'Potato chips',
    'Precio':'Price',
    'Ingresado':'Inserted',
    'Falta':'Still due',
    'Pagaste':'Paid',
    'Vuelto':'Change',
    'Importe devuelto':'Money returned',
    'Elige al menos una denominación.':'Select at least one denomination.',
    'Permitir pagos con vuelto':'Allow payments with change',
    'Mostrar cuánto falta':'Show how much is still due',
    'Leer precios e instrucciones':'Read prices and instructions aloud',
    'Sonidos de la máquina':'Machine sounds',
    'Elige una bebida o una merienda.':'Choose a drink or a snack.',
    'Introduce dinero o toca una pieza de tu cartera.':'Insert money or tap a piece in your wallet.',
    'Esta máquina pide el monto exacto. Prueba con otra pieza.':'This machine needs the exact amount. Try another piece.',
    'No hay vuelto para ese pago. Devuelve el dinero y prueba con otra combinación.':'The machine cannot make change for that payment. Return the money and try a different combination.',
    'Límite de dinero para esta compra.':'Money limit reached for this purchase.',
    'El pago está listo. Pulsa Comprar.':'Your payment is ready. Press Buy.',
    'La máquina está entregando tu compra.':'The machine is dispensing your purchase.',
    'Toca la bandeja para recoger tu producto.':'Tap the tray to pick up your product.',
    'Toca la salida de vuelto para recoger tus monedas o billetes.':'Tap the change tray to collect your coins or banknotes.',
    'Recoge el dinero devuelto en la bandeja de vuelto.':'Collect the refunded money from the change tray.',
    '¡Compra lista! Puedes hacer otra compra.':'Purchase complete! You can make another purchase.',
    'Monedas en la ranura de monedas y billetes en la de billetes.':'Put coins in the coin slot and banknotes in the banknote slot.'
  });

  const $ = id => document.getElementById(id);
  const t = IdiomaVoz.t;
  const clave = 'expendedora.practica.v1';
  const valores = [10, 25, 50, 100, 500, 1000, 2000];
  const productos = [
    {id:'agua', codigo:'A1', nombre:'Agua', precio:350},
    {id:'jugo', codigo:'A2', nombre:'Jugo de naranja', precio:550},
    {id:'galletas', codigo:'B1', nombre:'Galletas', precio:450},
    {id:'papas', codigo:'B2', nombre:'Papas fritas', precio:650}
  ];
  const guardado = Matematicas.leer(clave);
  const activas = valores.filter(valor => Array.isArray(guardado.activas) && guardado.activas.includes(valor));
  let opciones = {activas:activas.length ? activas : valores, conVuelto:guardado.conVuelto!==false,
    ayuda:guardado.ayuda!==false, narracion:guardado.narracion!==false, sonidos:guardado.sonidos!==false};
  const ajustes = $('ajustes');
  const maquina = $('maquina');
  const efectivo = $('efectivo');
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
  const formato = valor => '₡'+valor.toLocaleString(IdiomaVoz.idioma==='en'?'en-US':'es-CR');
  const tipo = valor => valor<1000?'moneda':'billete';
  const total = piezas => piezas.reduce((suma,valor) => suma+valor,0);
  const foto = producto => '<img src="imagenes/'+producto.id+'.png" alt="" draggable="false">';
  const moneda = valor => '<img class="dinero '+tipo(valor)+'" src="../Colones/imagenes/dinero-'+valor+'.webp" alt="" draggable="false">';
  let surtido, tabla, pedido, ingreso, retornado, compra, fase, aviso, vuelo, audio;

  // La tabla conserva el último valor de la combinación más corta para cada monto.
  function combinaciones(limite) {
    const costos = new Uint16Array(limite+1).fill(65535);
    const ultimos = new Uint16Array(limite+1);
    const mayores = [...opciones.activas].reverse();
    costos[0]=0;
    for(let cantidad=1; cantidad<=limite; cantidad++){
      for(const valor of mayores){
        if(valor>cantidad || costos[cantidad-valor]+1>=costos[cantidad])continue;
        costos[cantidad]=costos[cantidad-valor]+1;
        ultimos[cantidad]=valor;
      }
    }
    return {costos,ultimos};
  }

  function nuevaCompra() {
    vuelo?.cancel();
    fase='elegir';
    pedido=null;
    ingreso=[];
    retornado=[];
    compra=null;
    aviso='';
    const minima=opciones.activas[0];
    const limite=Math.max(1200,minima*8);
    tabla=combinaciones(Math.max(limite,opciones.activas.at(-1)));
    const candidatos=[];
    for(let monto=minima; monto<=limite; monto++)if(tabla.costos[monto]<=8)candidatos.push(monto);
    const usados=new Set();
    surtido=productos.map(producto=>{
      const objetivo=Math.max(producto.precio,minima*2)+(Math.floor(Math.random()*5)-2)*25;
      const precio=candidatos.reduce((mejor,actual)=>!usados.has(actual)&&
        (mejor===null||Math.abs(actual-objetivo)<Math.abs(mejor-objetivo))?actual:mejor,null);
      usados.add(precio);
      return {...producto,precio};
    });
    pintarVitrina();
    pintarCartera();
    actualizar();
  }

  function vueltoPara(monto) {
    if(monto<0 || tabla.costos[monto]===undefined || tabla.costos[monto]===65535)return null;
    const piezas=[];
    while(monto){
      const valor=tabla.ultimos[monto];
      piezas.push(valor);
      monto-=valor;
    }
    return piezas;
  }

  function pintarVitrina() {
    $('vitrina').innerHTML=surtido.map(producto=>
      '<button type="button" class="producto" data-producto="'+producto.id+'" aria-pressed="false">'+
      '<span class="producto-foto" aria-hidden="true">'+foto(producto)+'</span>'+
      '<span class="etiqueta"><b>'+producto.codigo+'</b><span>'+t(producto.nombre)+'</span><strong>'+formato(producto.precio)+'</strong></span></button>'
    ).join('');
  }

  function etiquetaDinero(valor) {
    const pieza=tipo(valor)==='moneda';
    return IdiomaVoz.idioma==='en'
      ? valor+' colones, '+(pieza?'coin':'banknote')
      : valor+' colones, '+(pieza?'moneda':'billete');
  }

  function pintarCartera() {
    efectivo.innerHTML=opciones.activas.map(valor=>
      '<button type="button" data-valor="'+valor+'" aria-label="'+etiquetaDinero(valor)+'">'+
      moneda(valor)+'<b>'+formato(valor)+'</b></button>').join('');
  }

  function instruccion() {
    if(aviso)return aviso;
    switch(fase){
      case 'pago': {
        const credito=total(ingreso);
        if(credito<pedido.precio)return 'Introduce dinero o toca una pieza de tu cartera.';
        return vueltoPara(credito-pedido.precio)===null
          ? 'No hay vuelto para ese pago. Devuelve el dinero y prueba con otra combinación.'
          : 'El pago está listo. Pulsa Comprar.';
      }
      case 'entrega': return 'La máquina está entregando tu compra.';
      case 'producto': return 'Toca la bandeja para recoger tu producto.';
      case 'vuelto': return 'Toca la salida de vuelto para recoger tus monedas o billetes.';
      case 'devolucion': return 'Recoge el dinero devuelto en la bandeja de vuelto.';
      case 'listo': return '¡Compra lista! Puedes hacer otra compra.';
      default: return 'Elige una bebida o una merienda.';
    }
  }

  function actualizar() {
    const credito=total(ingreso);
    const diferencia=pedido?pedido.precio-credito:0;
    const pago=fase==='pago';
    const listo=fase==='listo';
    const elegir=fase==='elegir'||(pago&&!credito);
    const recogerProducto=fase==='producto';
    const recogerDinero=fase==='vuelto'||fase==='devolucion';
    maquina.dataset.fase=fase;
    $('instruccion').textContent=t(instruccion());
    for(const boton of $('vitrina').children){
      boton.disabled=!elegir;
      boton.setAttribute('aria-pressed',String(boton.dataset.producto===pedido?.id));
    }
    for(const boton of efectivo.children)boton.disabled=!pago;
    $('comprar').disabled=!listo&&(!pago||diferencia>0||vueltoPara(-diferencia)===null);
    $('comprar').textContent=t(listo?'Nueva compra':'Comprar');
    $('devolver').disabled=!pago||!credito;
    $('recoger').disabled=!recogerProducto;
    $('recogerVuelto').disabled=!recogerDinero;
    $('rotuloProducto').textContent=t(recogerProducto?'Recoger producto':'Bandeja');
    $('rotuloVuelto').textContent=t(fase==='devolucion'?'Recoger dinero':fase==='vuelto'?'Recoger vuelto':'Vuelto');
    $('productoEntregado').innerHTML=recogerProducto?foto(pedido):'';
    $('dineroEntregado').innerHTML=retornado.length
      ? '<span class="muestra-vuelto">'+retornado.map(moneda).join('')+'</span><strong>'+formato(total(retornado))+'</strong>'
      : '';
    const filas=pedido?[['Precio',pedido.precio],[compra?'Pagaste':'Ingresado',compra?.pagado??credito]]:[];
    if(pago&&opciones.ayuda&&diferencia>0)filas.push(['Falta',diferencia]);
    if(compra)filas.push(['Vuelto',total(compra.vuelto)]);
    if(fase==='devolucion')filas.push(['Importe devuelto',total(retornado)]);
    $('pantalla').innerHTML=pedido
      ? '<strong class="seleccion">'+pedido.codigo+' · '+t(pedido.nombre)+'</strong><dl>'+
        filas.map(([nombre,valor])=>'<div><dt>'+t(nombre)+'</dt><dd>'+formato(valor)+'</dd></div>').join('')+'</dl>'
      : '<strong class="seleccion">'+t('Elige un producto.')+'</strong>';
  }

  function decir(texto) {
    if(opciones.narracion)IdiomaVoz.hablar(texto);
  }

  function elegirProducto(producto) {
    if(!producto || (fase!=='elegir'&&(fase!=='pago'||ingreso.length)))return;
    pedido=producto;
    fase='pago';
    aviso='';
    actualizar();
    const precio=pedido.precio+' colones.';
    decir(t(pedido.nombre)+'. '+t('Precio')+'. '+precio+' '+t(instruccion()));
  }

  function sonido(frecuencia,duracion,forma='sine') {
    if(!opciones.sonidos)return;
    try{
      audio ||= new AudioContext();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const ahora=audio.currentTime;
      const tono=audio.createOscillator(), nivel=audio.createGain();
      tono.type=forma;
      tono.frequency.setValueAtTime(frecuencia,ahora);
      tono.frequency.exponentialRampToValueAtTime(frecuencia*.62,ahora+duracion);
      nivel.gain.setValueAtTime(.09,ahora);
      nivel.gain.exponentialRampToValueAtTime(.001,ahora+duracion);
      tono.connect(nivel).connect(audio.destination);
      tono.start(ahora);
      tono.stop(ahora+duracion);
    }catch{ /* La simulación también funciona en silencio. */ }
  }

  function insertar(valor) {
    if(fase!=='pago'||!opciones.activas.includes(valor))return;
    const monto=total(ingreso)+valor;
    if(!opciones.conVuelto&&monto>pedido.precio){
      aviso='Esta máquina pide el monto exacto. Prueba con otra pieza.';
    }else if(monto>pedido.precio+opciones.activas.at(-1)){
      aviso='Límite de dinero para esta compra.';
    }else{
      ingreso.push(valor);
      aviso='';
      const esMoneda=tipo(valor)==='moneda';
      const ranura=$(esMoneda?'entradaMoneda':'entradaBillete');
      if(!movimientoReducido.matches){
        ranura.animate([{background:'#fff5a9',color:'#25423e'},{background:''}],{duration:330});
        const pieza=document.createElement('span');
        pieza.className='ingreso';
        pieza.innerHTML=moneda(valor);
        ranura.append(pieza);
        pieza.animate(esMoneda
          ? [{transform:'translate(-50%, -115%) rotateY(20deg)'},{opacity:0,transform:'translate(-50%, -32%) rotateY(88deg)'}]
          : [{transform:'translate(-50%, -115%)'},{opacity:0,transform:'translate(-50%, -35%) scaleY(.1)'}],
          {duration:285,easing:'ease-in'}).finished.then(()=>pieza.remove(),()=>pieza.remove());
      }
      sonido(esMoneda?1650:440,esMoneda?.16:.24,esMoneda?'triangle':'sine');
    }
    actualizar();
    if(aviso||monto>=pedido.precio)decir(t(instruccion()));
  }

  function devolver() {
    if(fase!=='pago'||!ingreso.length)return;
    retornado=ingreso;
    ingreso=[];
    aviso='';
    fase='devolucion';
    sonido(820,.2,'triangle');
    actualizar();
    decir(t(instruccion()));
  }

  async function vender() {
    if(fase==='listo'){nuevaCompra();return;}
    if(fase!=='pago')return;
    const pagado=total(ingreso);
    const vuelto=vueltoPara(pagado-pedido.precio);
    if(vuelto===null)return;
    compra={pagado,vuelto};
    aviso='';
    fase='entrega';
    actualizar();
    sonido(245,.32,'triangle');
    if(!movimientoReducido.matches){
      const origen=$('vitrina').querySelector('[aria-pressed=true] .producto-foto img');
      const rect=origen.getBoundingClientRect();
      const caja=maquina.getBoundingClientRect();
      const destino=$('productoEntregado').getBoundingClientRect();
      const escala=Matematicas.escala();
      const objeto=origen.cloneNode();
      objeto.className='producto-en-caida';
      Object.assign(objeto.style,{
        left:(rect.left-caja.left)/escala+'px',top:(rect.top-caja.top)/escala+'px',
        width:rect.width/escala+'px',height:rect.height/escala+'px'
      });
      maquina.append(objeto);
      const x=(destino.left+destino.width/2-rect.left-rect.width/2)/escala;
      const y=(destino.top+destino.height/2-rect.top-rect.height/2)/escala;
      const animacion=vuelo=objeto.animate([
        {transform:'translateY(0) rotate(0)'},
        {transform:'translateY(5px) rotate(12deg)',offset:.24},
        {transform:'translate('+x+'px,'+y+'px) rotate(24deg) scale(.72)'}
      ],{duration:620,easing:'cubic-bezier(.45,.1,.75,1)'});
      try{await animacion.finished;}catch{return;}finally{objeto.remove();}
    }
    vuelo=null;
    retornado=compra.vuelto;
    fase='producto';
    sonido(685,.22,'triangle');
    actualizar();
    $('recoger').focus({preventScroll:true});
    decir(t(instruccion()));
  }

  function terminar(estado) {
    fase=estado;
    actualizar();
    if(estado==='vuelto'||estado==='listo')$(estado==='vuelto'?'recogerVuelto':'comprar').focus({preventScroll:true});
    const nombre=$('nombre').value.trim();
    if(estado==='listo'&&nombre){
      decir((IdiomaVoz.idioma==='en'?'Well done, ':'¡Muy bien, ')+nombre+(IdiomaVoz.idioma==='en'?'. ':'! ')+t(instruccion()));
    }else decir(t(instruccion()));
  }

  $('vitrina').addEventListener('click',evento=>{
    const boton=evento.target.closest('[data-producto]');
    if(boton)elegirProducto(surtido.find(producto=>producto.id===boton.dataset.producto));
  });
  $('comprar').onclick=vender;
  $('devolver').onclick=devolver;
  $('recoger').onclick=()=>{
    if(fase==='producto')terminar(retornado.length?'vuelto':'listo');
  };
  $('recogerVuelto').onclick=()=>{
    if(fase!=='vuelto'&&fase!=='devolucion')return;
    retornado=[];
    terminar(fase==='devolucion'?'pago':'listo');
  };
  $('nueva').onclick=()=>{
    if(fase==='pago'&&ingreso.length)devolver();
    else if(!['entrega','producto','vuelto','devolucion'].includes(fase))nuevaCompra();
  };
  $('escuchar').onclick=()=>{
    const precio=fase==='pago'&&pedido?t('Precio')+'. '+pedido.precio+' colones. ':'';
    IdiomaVoz.hablar(precio+t(instruccion()));
  };

  let arrastre=null, suprimirClic=false;
  efectivo.addEventListener('pointerdown',evento=>{
    const boton=evento.target.closest('[data-valor]');
    if(!boton||boton.disabled||arrastre||!evento.isPrimary||evento.button!==0)return;
    suprimirClic=false;
    arrastre={boton,id:evento.pointerId,x:evento.clientX,y:evento.clientY,valor:Number(boton.dataset.valor)};
    boton.setPointerCapture(evento.pointerId);
  });
  efectivo.addEventListener('pointermove',evento=>{
    if(arrastre?.id!==evento.pointerId)return;
    if(!arrastre.fantasma){
      if(Math.hypot(evento.clientX-arrastre.x,evento.clientY-arrastre.y)<6)return;
      arrastre.fantasma=document.createElement('span');
      arrastre.fantasma.className='fantasma';
      arrastre.fantasma.setAttribute('aria-hidden','true');
      arrastre.fantasma.innerHTML=moneda(arrastre.valor);
      document.body.append(arrastre.fantasma);
      maquina.dataset.arrastre=tipo(arrastre.valor);
    }
    Matematicas.fantasma(arrastre.fantasma,evento.clientX,evento.clientY);
  });
  function soltar(evento) {
    if(arrastre?.id!==evento.pointerId)return;
    const {fantasma,valor}=arrastre;
    arrastre=null;
    delete maquina.dataset.arrastre;
    if(!fantasma)return;
    fantasma.remove();
    suprimirClic=true;
    if(evento.type!=='pointerup')return;
    const ranura=document.elementFromPoint(evento.clientX,evento.clientY)?.closest('[data-entrada]');
    if(ranura?.dataset.entrada===tipo(valor))insertar(valor);
    else if(ranura){
      aviso='Monedas en la ranura de monedas y billetes en la de billetes.';
      actualizar();
      decir(t(instruccion()));
    }
  }
  for(const evento of ['pointerup','pointercancel','lostpointercapture'])efectivo.addEventListener(evento,soltar);
  efectivo.addEventListener('click',evento=>{
    if(suprimirClic&&evento.detail){suprimirClic=false;return;}
    const boton=evento.target.closest('[data-valor]');
    if(boton)insertar(Number(boton.dataset.valor));
  });

  const casillas=['conVuelto','ayuda','narracion','sonidos'];
  $('configurar').onclick=()=>{
    $('denominaciones').innerHTML=valores.map(valor=>
      '<label><input type="checkbox" value="'+valor+'" aria-label="'+etiquetaDinero(valor)+'" '+
      (opciones.activas.includes(valor)?'checked':'')+'>'+moneda(valor)+'<b>'+formato(valor)+'</b></label>').join('');
    for(const opcion of casillas)$(opcion).checked=opciones[opcion];
    $('errorAjustes').hidden=true;
    IdiomaVoz.iniciarEdicion();
    ajustes.showModal();
  };
  function aplicar() {
    const seleccion=[...$('denominaciones').querySelectorAll('input:checked')].map(campo=>Number(campo.value));
    if(!seleccion.length){$('errorAjustes').hidden=false;return;}
    const reiniciar=opciones.activas.join()!==seleccion.join()||opciones.conVuelto!==$('conVuelto').checked;
    opciones.activas=seleccion;
    for(const opcion of casillas)opciones[opcion]=$(opcion).checked;
    Matematicas.guardar(clave,opciones);
    ajustes.close();
    IdiomaVoz.aplicarEdicion();
    if(reiniciar)nuevaCompra();
    else actualizar();
  }
  $('denominaciones').addEventListener('change',()=>{$('errorAjustes').hidden=true;});
  $('cerrar').onclick=aplicar;
  ajustes.querySelector('form').onsubmit=evento=>{evento.preventDefault();aplicar();};
  ajustes.addEventListener('cancel',evento=>{evento.preventDefault();aplicar();});
  IdiomaVoz.instalar('#vozExpendedora',{cambioIdioma:()=>{pintarVitrina();pintarCartera();actualizar();}});
  Matematicas.pantalla($('appExpendedora'),(alto,escala)=>{
    document.documentElement.style.setProperty('--u',1/escala+'px');
    document.documentElement.style.setProperty('--ancho',document.documentElement.clientWidth/escala+'px');
  });
  nuevaCompra();
})();
