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
  function pintar(canvas, lugar, cantidad, agrupado = false) {
    const {width, height} = canvas.getBoundingClientRect();
    if(!width || !height) return;
    const escala = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width*escala);
    canvas.height = Math.round(height*escala);
    const ctx = canvas.getContext('2d');
    ctx.scale(escala,escala);
    if(!cantidad) return;
    if(!agrupado) {
      pieza(ctx,lugar,width/2,height/2,width*.84,height*.86);
      return;
    }
    if(lugar >= 2) {
      const grupos = cantidad > 5 ? 2 : 1;
      const w = Math.min(width * (grupos === 1 ? .64 : .34), 82);
      const h = Math.min(height*.48,62);
      const paso = Math.min(h*.46, (height-h)*.22);
      for(let g=0;g<grupos;g++){
        const total = Math.min(5,cantidad-g*5);
        const x = width * (grupos === 1 ? .5 : g === 0 ? .25 : .75);
        for(let i=0;i<total;i++) pieza(ctx,lugar,x,height/2+((total-1)/2-i)*paso,w,h);
      }
      return;
    }
    const w = width/5, h = height/(cantidad > 5 ? 2 : 1);
    for(let i=0;i<cantidad;i++){
      pieza(ctx,lugar,(i%5+.5)*w,(Math.floor(i/5)+.5)*h,
        Math.min(w*.86, lugar === 0 ? 34 : 60),Math.min(h*.86,lugar === 0 ? 34 : 65));
    }
  }
  window.BloquesMultibase = {pintar};
})();
