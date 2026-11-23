(() => {
  'use strict';
  const caras = [
    ['#fbe48f', '#edac3e', '#d58b24'],
    ['#9de4ff', '#4aafdf', '#277bb3'],
    ['#a8e8ca', '#57bd98', '#258371'],
    ['#dcd0ff', '#aa8fea', '#8061bf']
  ];
  const tamanos = [[1,1,1], [1,1,10], [10,10,1], [10,10,10]];

  // Proyecta las tres caras visibles y dibuja una cuadrícula por cada cubito.
  function pieza(ctx, lugar, centroX, centroY, ancho, alto) {
    const [x,y,z] = tamanos[lugar];
    const [arriba, frente, lado] = caras[lugar];
    const escala = Math.min(ancho / ((x+y)*.84), alto / ((x+y)*.42+z));
    const origenX = centroX - (x-y)*.42*escala;
    const origenY = centroY - ((x+y)*.42-z)*escala/2;
    const proyectar = ([a,b,c]) => [origenX+(a-b)*.84*escala, origenY+((a+b)*.42-c)*escala];
    function poligono(puntos, color) {
      ctx.beginPath();
      ctx.moveTo(...proyectar(puntos[0]));
      puntos.slice(1).forEach(p => ctx.lineTo(...proyectar(p)));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#26354c9c';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    function trazo(a,b) {
      ctx.moveTo(...proyectar(a));
      ctx.lineTo(...proyectar(b));
    }
    poligono([[0,y,0],[x,y,0],[x,y,z],[0,y,z]], frente);
    poligono([[x,0,0],[x,y,0],[x,y,z],[x,0,z]], lado);
    poligono([[0,0,z],[x,0,z],[x,y,z],[0,y,z]], arriba);
    if(lugar === 2 && escala >= 3){
      // Un borde luminoso dentro de cada celda hace visible el relieve de los cubitos.
      ctx.beginPath();
      for(let a=0;a<x;a++) for(let b=0;b<y;b++){
        trazo([a+.2,b+.8,z],[a+.2,b+.2,z]);
        trazo([a+.2,b+.2,z],[a+.8,b+.2,z]);
      }
      ctx.strokeStyle = '#ecfff4bb';
      ctx.lineWidth = .65;
      ctx.stroke();
    }
    ctx.beginPath();
    for(let a=1;a<x;a++){
      trazo([a,y,0],[a,y,z]);
      trazo([a,0,z],[a,y,z]);
    }
    for(let b=1;b<y;b++){
      trazo([x,b,0],[x,b,z]);
      trazo([0,b,z],[x,b,z]);
    }
    for(let c=1;c<z;c++){
      trazo([0,y,c],[x,y,c]);
      trazo([x,0,c],[x,y,c]);
    }
    ctx.strokeStyle = lugar === 2 ? '#214c48a3' : '#26354c75';
    ctx.lineWidth = lugar === 2 ? .86 : .7;
    ctx.stroke();
  }
  function distribucion(lugar, cantidad, width, height) {
    const posiciones = [];
    if(lugar >= 2) {
      const grupos = cantidad > 5 ? 2 : 1;
      const placa = lugar === 2;
      const w = placa ? Math.min(width * (grupos === 1 ? .82 : .44),120) :
        Math.min(width * (grupos === 1 ? .64 : .34),82);
      const h = placa ? Math.min(height*.60,90) : Math.min(height*.48,62);
      const altoDibujado = placa ? Math.min(h,w*9.4/16.8) : h;
      const paso = Math.min(altoDibujado*(placa ? .83 : .46), (height-altoDibujado)*.22);
      for(let g=0;g<grupos;g++){
        const total = Math.min(5,cantidad-g*5);
        const x = width * (grupos === 1 ? .5 : g === 0 ? .25 : .75);
        for(let i=0;i<total;i++) posiciones.push({x,y:height/2+((total-1)/2-i)*paso,ancho:w,alto:h});
      }
      return posiciones;
    }
    const filas = cantidad > 5 ? 2 : 1;
    const unidad = lugar === 0;
    const espacioVertical = Math.min(8,height*.06);
    const alto = unidad ? Math.min(height/filas*.86,34) :
      Math.min((height-(filas-1)*espacioVertical)*.95/filas,104,width/5*5.8);
    const ancho = unidad ? Math.min(width/5*.86,34) : alto*(1.68/10.84);
    const altoDibujado = unidad ? Math.min(alto,ancho*1.84/1.68) : alto;
    const pasoY = Math.min(height/filas,altoDibujado+espacioVertical);
    const pasoX = unidad ? width/5 : Math.min(width/5,ancho+Math.min(10,ancho*.8));
    for(let i=0;i<cantidad;i++){
      const x = unidad ? (i%5+.5)*pasoX : width/2+(i%5-(Math.min(cantidad,5)-1)/2)*pasoX;
      const y = height/2+(Math.floor(i/5)-(filas-1)/2)*pasoY;
      posiciones.push({x,y,ancho,alto});
    }
    return posiciones;
  }
  function superficie(canvas) {
    const rect = canvas.getBoundingClientRect();
    if(!rect.width || !rect.height) return null;
    const escala = Math.min(devicePixelRatio || 1, 2);
    const ancho = Math.round(rect.width*escala), alto = Math.round(rect.height*escala);
    if(canvas.width !== ancho) canvas.width = ancho;
    if(canvas.height !== alto) canvas.height = alto;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(escala,0,0,escala,0,0);
    ctx.clearRect(0,0,rect.width,rect.height);
    return {ctx,rect};
  }
  function pintar(canvas, lugar, cantidad, agrupado = false) {
    const dibujo = superficie(canvas);
    if(!dibujo || !cantidad) return;
    const {ctx,rect:{width,height}} = dibujo;
    if(!agrupado) pieza(ctx,lugar,width/2,height/2,width*.84,height*.86);
    else for(const p of distribucion(lugar,cantidad,width,height)) pieza(ctx,lugar,p.x,p.y,p.ancho,p.alto);
  }
  function pintarCanje(canvas, lugar, origen, destino, cantidadDestino, avance) {
    const dibujo = superficie(canvas);
    if(!dibujo) return;
    const {ctx,rect} = dibujo;
    const a = origen.getBoundingClientRect(), b = destino.getBoundingClientRect();
    const x = a.left - rect.left + a.width/2, y = a.top - rect.top + a.height/2;
    const llegada = distribucion(lugar+1,cantidadDestino,b.width,b.height).at(-1);
    const ancho = Math.min(a.width*.65,llegada.ancho*1.3);
    const alto = Math.min(a.height*.85,llegada.alto*1.3);
    const limitar = n => Math.max(0,Math.min(1,n));
    const juntar = 1 - (1 - limitar(avance/.48))**3;
    const cambio = limitar((avance-.48)/.14);
    if(cambio < 1) {
      ctx.globalAlpha = 1-cambio;
      distribucion(lugar,10,a.width,a.height).forEach((p,i) => {
        const fila = lugar === 0 ? (i-4.5)*alto/10 : (i-4.5)*alto/26;
        const anchoPieza = lugar === 0 ? Math.min(p.ancho,alto*.14) : p.ancho*.52;
        const altoPieza = lugar === 0 ? alto/10 : p.alto*.48;
        pieza(ctx,lugar,
          a.left-rect.left+p.x+(a.width/2-p.x)*juntar,
          a.top-rect.top+p.y+(a.height/2+fila-p.y)*juntar,
          p.ancho+(anchoPieza-p.ancho)*juntar,p.alto+(altoPieza-p.alto)*juntar);
      });
    }
    if(cambio > 0) {
      ctx.globalAlpha = cambio;
      const t = limitar((avance-.62)/.38);
      const viaje = t*t*(3-2*t);
      pieza(ctx,lugar+1,
        x+(b.left-rect.left+llegada.x-x)*viaje,
        y+(b.top-rect.top+llegada.y-y)*viaje - Math.sin(Math.PI*viaje)*18,
        ancho+(llegada.ancho-ancho)*viaje,alto+(llegada.alto-alto)*viaje);
    }
    ctx.globalAlpha = 1;
  }
  window.BloquesMultibase = {pintar,pintarCanje};
})();
