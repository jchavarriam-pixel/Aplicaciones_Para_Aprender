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
    ctx.strokeStyle = '#26354c75';
    ctx.lineWidth = .7;
    ctx.stroke();
  }
  function pintar(canvas, lugar, cantidad) {
    const {width, height} = canvas.getBoundingClientRect();
    if(!width || !height) return;
    const escala = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width*escala);
    canvas.height = Math.round(height*escala);
    const ctx = canvas.getContext('2d');
    ctx.scale(escala,escala);
    if(!cantidad) return;
    const columnas = Math.min(cantidad, lugar === 1 && width >= height*1.3 ? 5 : 3);
    const filas = Math.ceil(cantidad/columnas);
    const w = width/columnas, h = height/filas;
    for(let i=0;i<cantidad;i++){
      const fila = Math.floor(i/columnas);
      const enFila = Math.min(columnas, cantidad-fila*columnas);
      const limite = [32,64,68,72][lugar];
      pieza(ctx, lugar, width/2+(i%columnas-(enFila-1)/2)*w, (fila+.5)*h,
        Math.min(w*.86,limite), Math.min(h*.86,limite));
    }
  }
  window.BloquesMultibase = {pintar};
})();
