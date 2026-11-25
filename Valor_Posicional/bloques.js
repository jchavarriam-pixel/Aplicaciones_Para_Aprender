(() => {
  'use strict';
  const caras = [
    [['#fff4a6','#ffc63b'],['#ffcf42','#ef8b13'],['#fda93b','#b85a13']],
    [['#c3f8ff','#41d8ff'],['#42d8ff','#008bd9'],['#1cb8ec','#0b57a2']],
    [['#d3ffb2','#6ae56d'],['#78e46e','#16a563'],['#35c478','#097148']],
    [['#f3d4ff','#bc83ff'],['#c694ff','#8650eb'],['#a472f7','#5624aa']]
  ];
  const contornos = ['#985215','#0a5396','#146846','#57268f'];
  const tamanos = [[1,1,1], [1,1,10], [10,10,1], [10,10,10]];

  // Proyecta las tres caras visibles y dibuja una cuadrícula por cada cubito.
  function pieza(ctx, lugar, centroX, centroY, ancho, alto, inclinacion = 0) {
    const [x,y,z] = tamanos[lugar];
    const [arriba, frente, lado] = caras[lugar];
    const coseno = Math.cos(inclinacion), seno = Math.sin(inclinacion);
    const ex = [.84*coseno,.42*coseno+seno], ey = [-.84,.42], ez = [.84*seno,.42*seno-coseno];
    const anchura = Math.abs(ex[0])*x + Math.abs(ey[0])*y + Math.abs(ez[0])*z;
    const altura = Math.abs(ex[1])*x + Math.abs(ey[1])*y + Math.abs(ez[1])*z;
    const escala = Math.min(ancho/anchura,alto/altura);
    const ladoVisible = coseno >= .84*seno ? x : 0;
    const proyectar = ([a,b,c]) => {
      const dx=a-x/2, dy=b-y/2, dz=c-z/2;
      return [centroX+(dx*ex[0]+dy*ey[0]+dz*ez[0])*escala, centroY+(dx*ex[1]+dy*ey[1]+dz*ez[1])*escala];
    };
    function poligono(puntos, colores, cara) {
      const vertices = puntos.map(proyectar);
      const xs = vertices.map(([x]) => x);
      const ys = vertices.map(([,y]) => y);
      const gradiente = ctx.createLinearGradient(0,Math.min(...ys),0,Math.max(...ys));
      gradiente.addColorStop(0,colores[0]);
      gradiente.addColorStop(1,colores[1]);
      ctx.beginPath();
      ctx.moveTo(...vertices[0]);
      vertices.slice(1).forEach(p => ctx.lineTo(...p));
      ctx.closePath();
      ctx.fillStyle = gradiente;
      ctx.fill();
      if(escala >= 1.4) {
        // La franja blanca reproduce un reflejo especular sin tapar las divisiones.
        const brillo = ctx.createLinearGradient(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys));
        const intensidad = cara === 'arriba' ? .8 : cara === 'frente' ? .59 : .31;
        brillo.addColorStop(0,'#ffffff00');
        brillo.addColorStop(.17,`rgba(255,255,255,${intensidad * .42})`);
        brillo.addColorStop(.29,`rgba(255,255,255,${intensidad})`);
        brillo.addColorStop(.43,`rgba(255,255,255,${intensidad * .25})`);
        brillo.addColorStop(.56,'#ffffff00');
        ctx.fillStyle = brillo;
        ctx.fill();
      }
      ctx.strokeStyle = contornos[lugar];
      ctx.lineWidth = .9;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    function trazo(a,b) {
      ctx.moveTo(...proyectar(a));
      ctx.lineTo(...proyectar(b));
    }
    poligono([[0,y,0],[x,y,0],[x,y,z],[0,y,z]], frente, 'frente');
    poligono([[ladoVisible,0,0],[ladoVisible,y,0],[ladoVisible,y,z],[ladoVisible,0,z]], lado, 'lado');
    poligono([[0,0,z],[x,0,z],[x,y,z],[0,y,z]], arriba, 'arriba');
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
      trazo([ladoVisible,b,0],[ladoVisible,b,z]);
      trazo([0,b,z],[x,b,z]);
    }
    for(let c=1;c<z;c++){
      trazo([0,y,c],[x,y,c]);
      trazo([ladoVisible,0,c],[ladoVisible,y,c]);
    }
    ctx.strokeStyle = contornos[lugar]+'a8';
    ctx.lineWidth = lugar === 2 ? .86 : .72;
    ctx.stroke();
    if (escala >= 3) {
      ctx.beginPath();
      trazo([.12,y-.18,z],[.12,.14,z]);
      trazo([.12,.14,z],[x-.14,.14,z]);
      ctx.strokeStyle = '#ffffffad';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  function distribuirMillares(cantidad, width, height) {
    const grupos = Math.ceil(cantidad/5);
    const porGrupo = Math.min(cantidad,5);
    const anchoGrupo = width/grupos;
    const margen = Math.min(4,anchoGrupo*.045,height*.045);
    const espacio = Math.min(8,Math.max(4,Math.min(anchoGrupo,height)*.08));
    const proporcion = 16.8/18.4;
    let mejor = {columnas:1, filas:porGrupo, alto:0};
    // Conserva una columna por grupo mientras las piezas tengan un tamaño legible.
    for(let columnas=1;columnas<=porGrupo;columnas++){
      const filas = Math.ceil(porGrupo/columnas);
      const alto = Math.max(0, Math.min(62,
        (anchoGrupo-2*margen-espacio*(columnas-1))/columnas/proporcion,
        (height-2*margen-espacio*(filas-1))/filas));
      if(alto>mejor.alto) mejor = {columnas,filas,alto};
      if(alto>=30) break;
    }
    const {columnas,filas,alto} = mejor;
    const ancho = alto*proporcion;
    const posiciones = [];
    for(let g=0;g<grupos;g++){
      const total = Math.min(5,cantidad-g*5);
      const columnasOcupadas = Math.min(columnas,Math.ceil(total/filas));
      for(let i=0;i<total;i++){
        const columna = Math.floor(i/filas);
        const filasOcupadas = Math.min(filas,total-columna*filas);
        posiciones.push({
          x:(g+.5)*anchoGrupo+(columna-(columnasOcupadas-1)/2)*(ancho+espacio),
          y:height/2+((filasOcupadas-1)/2-i%filas)*(alto+espacio),
          ancho,alto
        });
      }
    }
    return posiciones;
  }
  function distribucion(lugar, cantidad, width, height) {
    if(lugar === 3) return distribuirMillares(cantidad,width,height);
    const posiciones = [];
    if(lugar === 2) {
      const grupos = cantidad > 5 ? 2 : 1;
      const w = Math.min(width * (grupos === 1 ? .82 : .44),120);
      const h = Math.min(height*.60,90);
      const altoDibujado = Math.min(h,w*9.4/16.8);
      const paso = Math.min(altoDibujado*.83, (height-altoDibujado)*.22);
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
  const fraccion = n => Math.max(0,Math.min(1,n));
  const suavizar = t => t*t*(3-2*t);
  const entre = (a,b,t) => a+(b-a)*t;

  function ensamblar(ctx,lugar,a,x,y,escala,avance) {
    const barras = lugar === 1;
    const anchoFinal = (barras ? 9.24 : 16.8)*escala;
    const altoFinal = (barras ? 5.62 : 9.4)*escala;
    distribucion(lugar,10,a.width,a.height).forEach((p,i) => {
      const demora = i*.012;
      const posicion = suavizar(fraccion((avance-demora)/.53));
      const giro = barras ? Math.PI/2 * suavizar(fraccion((avance-demora-.05)/.42)) : 0;
      const distancia = (i-4.5)*escala;
      // Las barras se juntan de atrás hacia delante y las placas de abajo hacia arriba.
      const finalX = barras ? -.84*distancia : 0;
      const finalY = barras ? .42*distancia : -distancia;
      pieza(ctx,lugar,
        x+entre(p.x-a.width/2,finalX,posicion),
        y+entre(p.y-a.height/2,finalY,posicion),
        entre(p.ancho,anchoFinal,posicion),entre(p.alto,altoFinal,posicion),giro);
    });
  }
  function pintarCanje(canvas, lugar, origen, destino, cantidadDestino, avance) {
    const dibujo = superficie(canvas);
    if(!dibujo) return;
    const {ctx,rect} = dibujo;
    const a = origen.getBoundingClientRect(), b = destino.getBoundingClientRect();
    const x = a.left - rect.left + a.width/2, y = a.top - rect.top + a.height/2;
    const llegada = distribucion(lugar+1,cantidadDestino,b.width,b.height).at(-1);
    const finX = b.left-rect.left+llegada.x, finY = b.top-rect.top+llegada.y;
    if(lugar > 0) {
      const altura = lugar === 1 ? 9.4 : 18.4;
      const escala = Math.min(a.width*.82/16.8,a.height*.77/altura);
      const cambio = fraccion((avance-.68)/.13);
      if(cambio < 1) {
        ctx.globalAlpha = 1-cambio;
        ensamblar(ctx,lugar,a,x,y,escala,avance);
      }
      if(cambio > 0) {
        ctx.globalAlpha = cambio;
        const viaje = suavizar(fraccion((avance-.81)/.19));
        pieza(ctx,lugar+1,entre(x,finX,viaje),entre(y,finY,viaje)-Math.sin(Math.PI*viaje)*18,
          entre(16.8*escala,llegada.ancho,viaje),entre(altura*escala,llegada.alto,viaje));
      }
      ctx.globalAlpha = 1;
      return;
    }
    const ancho = Math.min(a.width*.65,llegada.ancho*1.3);
    const alto = Math.min(a.height*.85,llegada.alto*1.3);
    const juntar = 1 - (1 - fraccion(avance/.48))**3;
    const cambio = fraccion((avance-.48)/.14);
    if(cambio < 1) {
      ctx.globalAlpha = 1-cambio;
      distribucion(lugar,10,a.width,a.height).forEach((p,i) => {
        const fila = (i-4.5)*alto/10;
        const anchoPieza = Math.min(p.ancho,alto*.14);
        pieza(ctx,lugar,
          a.left-rect.left+p.x+(a.width/2-p.x)*juntar,
          a.top-rect.top+p.y+(a.height/2+fila-p.y)*juntar,
          entre(p.ancho,anchoPieza,juntar),entre(p.alto,alto/10,juntar));
      });
    }
    if(cambio > 0) {
      ctx.globalAlpha = cambio;
      const viaje = suavizar(fraccion((avance-.62)/.38));
      pieza(ctx,lugar+1,
        entre(x,finX,viaje),entre(y,finY,viaje)-Math.sin(Math.PI*viaje)*18,
        entre(ancho,llegada.ancho,viaje),entre(alto,llegada.alto,viaje));
    }
    ctx.globalAlpha = 1;
  }
  window.BloquesMultibase = {pintar,pintarCanje};
})();
