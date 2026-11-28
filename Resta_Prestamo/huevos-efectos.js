(() => {
  'use strict';

  const colores = ['#ffc83e','#fc6e9d','#58dfff','#b59bff','#ff8b57','#8ce573'];
  const arcoiris = ['#fc6684','#ff9b61','#ffe36e','#86f1a1','#7ee4ff','#a997ff'];
  const vuelta = Math.PI * 2;
  const limitar = p => Math.max(0,Math.min(1,p));
  const unir = (a,b,p) => a+(b-a)*p;
  const suavizar = p => p*p*(3-2*p);
  const desvanecer = (t,duracion,margen=.45) => limitar((duracion-t)/margen);
  const estrella = new Path2D();
  for (let i=0;i<10;i++) {
    const a=i*Math.PI/5-Math.PI/2, r=i%2?.44:1;
    if (i===0) estrella.moveTo(Math.cos(a)*r,Math.sin(a)*r);
    else estrella.lineTo(Math.cos(a)*r,Math.sin(a)*r);
  }
  estrella.closePath();

  function punto(ctx,x,y,r,color) {
    ctx.beginPath();
    ctx.arc(x,y,r,0,vuelta);
    ctx.fillStyle=color;
    ctx.fill();
  }

  function dibujarEstrella(ctx,x,y,r,color,giro) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(giro);
    ctx.scale(r,r);
    ctx.fillStyle=color;
    ctx.strokeStyle='#362456';
    ctx.lineWidth=.10;
    ctx.lineJoin='round';
    ctx.stroke(estrella);
    ctx.fill(estrella);
    ctx.restore();
  }

  function trayectoria(ctx,vertices,color) {
    ctx.beginPath();
    ctx.moveTo(...vertices[0]);
    for (let i=1;i<vertices.length;i++) ctx.lineTo(...vertices[i]);
    ctx.closePath();
    ctx.fillStyle=color;
    ctx.fill();
  }

  function volcan(ctx,zona,origen,t) {
    const {ancho,alto,corto}=zona;
    const subida=limitar(t/.56);
    const x=unir(origen.x,ancho*.50,suavizar(subida));
    const y=unir(origen.y,alto*.77,suavizar(subida))-Math.sin(Math.PI*subida)*corto*.14;
    const medida=Math.min(240,corto*.42)*(.26+.74*subida);
    const crater=y-medida*.65;

    ctx.save();
    ctx.globalAlpha=desvanecer(t,3.9);
    ctx.translate(x,y);
    ctx.scale(medida,medida);
    ctx.fillStyle='#31194865';
    ctx.beginPath();
    ctx.ellipse(0,.03,.56,.09,0,0,vuelta);
    ctx.fill();
    trayectoria(ctx,[[-.54,.02],[-.16,-.65],[.12,-.65],[.56,.02]],'#49346e');
    trayectoria(ctx,[[-.50,.02],[-.14,-.64],[-.04,-.52],[-.01,.02]],'#8e5d87');
    trayectoria(ctx,[[.09,-.63],[.51,.01],[.16,.02],[.13,-.20],[-.01,-.33]],'#653e70');
    trayectoria(ctx,[[-.15,-.63],[-.24,-.52],[-.15,-.56],[-.12,-.40],[-.02,-.50],[.06,-.32],[.09,-.51],[.22,-.51],[.12,-.64]],'#ff793e');
    ctx.beginPath();
    ctx.ellipse(-.01,-.64,.14,.057,0,0,vuelta);
    ctx.fillStyle='#ffce58';
    ctx.fill();
    ctx.restore();

    const base=Math.max(7,corto*.038);
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.lineJoin='round';
    for (let i=0;i<54;i++) {
      const tiempo=(t-.63-i%18*.047)/2.10;
      if (tiempo<=0 || tiempo>=1) continue;
      const paso=1-(1-tiempo)**2;
      const destino=ancho*(.04+.92*(i*17%54)/53);
      const px=unir(x,destino,paso);
      const cima=alto*(.045+(i%6)*.05);
      const py=tiempo<.48 ?
        unir(crater,cima,1-(1-tiempo/.48)**2) :
        unir(cima,alto+base,((tiempo-.48)/.52)**2);
      const r=base*(.56+i%5*.13);
      const color=colores[i%colores.length];
      ctx.globalAlpha=limitar((1-tiempo)*4);
      if (i%2) {
        ctx.font='900 '+(r*1.75)+'px system-ui,sans-serif';
        ctx.lineWidth=Math.max(1.1,r*.16);
        ctx.strokeStyle='#402855';
        ctx.fillStyle=color;
        const cifra=String(Math.floor(i/2)%10);
        ctx.strokeText(cifra,px,py);
        ctx.fillText(cifra,px,py);
      } else {
        dibujarEstrella(ctx,px,py,r,color,tiempo*3+i);
      }
    }
    ctx.globalAlpha=1;
  }

  function prepararFuegos() {
    const cohetes = [[.18,.27],[.52,.17],[.82,.30]].map(([x,y],i) => ({
      fin:{x,y}, inicio:i*.17, duracion:.72+i*.07, color:i*2
    }));
    const dividir = (grupo,nivel) => grupo.flatMap((padre,i) =>
      [-1,0,1].map((lado,j) => {
        const a = nivel===1 ? (-.5+lado*.49)*Math.PI : (j*.67+i*.63)*Math.PI;
        const distancia = nivel===1 ? .14 : .086+(i%4)*.011;
        return {
          origen:padre.fin,
          fin:{
            x:Math.max(.04,Math.min(.96,padre.fin.x+Math.cos(a)*distancia)),
            y:Math.max(.045,Math.min(.87,padre.fin.y+Math.sin(a)*distancia+(nivel===2?.065:0)))
          },
          inicio:padre.inicio+padre.duracion,
          duracion:nivel===1 ? .52+j*.085 : .56+j*.08,
          color:(padre.color+j+1)%colores.length
        };
      })
    );
    const brotes = dividir(cohetes,1);
    return {generaciones:[cohetes,brotes,dividir(brotes,2)]};
  }

  function fuegos(ctx,{ancho,alto,corto},origen,t,{generaciones}) {
    for (let nivel=0;nivel<generaciones.length;nivel++) {
      const radio=Math.max(2,corto*[.016,.011,.0075][nivel]);
      for (const proyectil of generaciones[nivel]) {
        const {fin,duracion,inicio,color}=proyectil;
        const tiempo=t-inicio;
        if (tiempo<0 || tiempo>duracion+.60) continue;
        const salida=proyectil.origen ? {x:proyectil.origen.x*ancho,y:proyectil.origen.y*alto} : origen;
        const destinoX=fin.x*ancho, destinoY=fin.y*alto;
        const tono=colores[color];
        if (tiempo<=duracion) {
          for (let cola=6;cola>=0;cola--) {
            const q=limitar(tiempo/duracion-cola*.04);
            const px=unir(salida.x,destinoX,q);
            const py=unir(salida.y,destinoY,q) - Math.sin(q*Math.PI)*corto*[.095,.06,.045][nivel];
            ctx.globalAlpha=1-cola/8;
            if (cola===0) punto(ctx,px,py,radio*1.19,tono);
            punto(ctx,px,py,radio*(.74-cola*.065),cola===0?'#fff7d9':tono);
          }
        } else {
          const q=limitar((tiempo-duracion)/.60);
          ctx.globalAlpha=limitar((1-q)*1.35);
          const cantidad=nivel===0?18:nivel===1?9:4;
          for (let i=0;i<cantidad;i++) {
            const a=i*vuelta/cantidad+color;
            const distancia=radio*(1+8*q);
            punto(ctx,destinoX+Math.cos(a)*distancia,destinoY+Math.sin(a)*distancia+q*q*corto*.035,radio*(.24+.12*(i%3)),tono);
          }
        }
      }
    }
    ctx.globalAlpha=1;
  }

  function sonidoFuegos({generaciones}) {
    const [cohetes,brotes]=generaciones;
    return [
      ...cohetes.map(({inicio})=>[inicio,'ascenso']),
      ...cohetes.map(({inicio,duracion})=>[inicio+duracion,'explosion']),
      ...brotes.map(({inicio,duracion})=>[inicio+duracion,'chispa'])
    ];
  }

  function estrellas(ctx,{ancho,alto,corto},origen,t) {
    const p=limitar(t/2.55);
    const radio=1-(1-p)**2.7;
    const base=Math.max(5,corto*.037);
    ctx.globalAlpha=Math.max(0,.40-t*2.0);
    punto(ctx,origen.x,origen.y,base*(1+t*18),'#fff4bb');
    ctx.globalAlpha=desvanecer(t,2.55,.78);
    for (let i=0;i<52;i++) {
      const a=i*2.399963;
      const alcance=.44+(i%9)*.068;
      const x=unir(origen.x,ancho*(.5+Math.cos(a)*.49*alcance),radio);
      const y=unir(origen.y,alto*(.5+Math.sin(a)*.48*alcance),radio);
      dibujarEstrella(ctx,x,y,base*(.52+(i%5)*.16),colores[i%colores.length],a+p*(i%2?2:-2));
    }
    ctx.globalAlpha=1;
  }

  const fichas=12;
  function domino(ctx,{ancho,alto,corto},origen,t) {
    const altoFicha=Math.min(corto*.14,99);
    const anchoFicha=altoFicha*.52;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='850 '+Math.round(anchoFicha*.53)+'px system-ui,sans-serif';
    ctx.globalAlpha=desvanecer(t,3.25);
    for (let i=0;i<fichas;i++) {
      const fila=Math.floor(i/6);
      const paso=i%6;
      const pos=fila===0?paso:5-paso;
      const entrada=suavizar(limitar((t-i*.034)/.48));
      if (entrada<=0) continue;
      const caida=suavizar(limitar((t-.69-i*.153)/.24));
      const x=unir(origen.x,ancho*(.14+.144*pos),entrada);
      const y=unir(origen.y,alto*(.37+.33*fila+Math.sin(i*.86)*.025),entrada);

      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(caida*(fila===0?1:-1)*1.43);
      ctx.lineWidth=Math.max(1,anchoFicha*.07);
      ctx.fillStyle=colores[i%colores.length];
      ctx.strokeStyle='#47305f';
      ctx.beginPath();
      ctx.roundRect(-anchoFicha/2,-altoFicha,anchoFicha,altoFicha,anchoFicha*.20);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle='#372553';
      ctx.fillText(String(i+1),0,-altoFicha*.72);
      for (let j=0;j<3;j++) punto(ctx,(j-1)*anchoFicha*.20,-altoFicha*.28,anchoFicha*.067,'#55375d');
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }

  const arriates=[[.16,.72],[.32,.47],[.48,.80],[.62,.53],[.80,.74],[.88,.47]];
  function jardin(ctx,{ancho,alto,corto},origen,t) {
    const altura=Math.min(133,corto*.23);
    ctx.globalAlpha=desvanecer(t,4.20,.70);
    for (const [i,[x,y]] of arriates.entries()) {
      const q=limitar((t-.48-i*.32)/.69);
      if (!q) continue;
      const px=x*ancho, py=y*alto;
      const tamano=altura*(.68+(i%3)*.13);
      const cima=py-tamano*suavizar(q);
      const inclinacion=Math.sin(i*2.13)*tamano*.13;
      ctx.strokeStyle='#2b9a67';
      ctx.lineWidth=Math.max(2,corto*.011);
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.quadraticCurveTo(px-inclinacion,(py+cima)/2,px+inclinacion,cima);
      ctx.stroke();
      const hoja=tamano*.24*q, centro=(py+cima)/2;
      trayectoria(ctx,[[px,centro+hoja*.3],[px-hoja,centro-hoja*.25],[px-hoja*.50,centro+hoja*.44]],'#4ebc77');
      trayectoria(ctx,[[px,centro-hoja*.24],[px+hoja,centro-hoja*.84],[px+hoja*.52,centro-hoja*.16]],'#84de78');
      const r=tamano*.28*suavizar(limitar((q-.56)/.44));
      if (!r) continue;
      for (let p=0;p<6;p++) {
        const a=p*vuelta/6 + i;
        punto(ctx,px+inclinacion+Math.cos(a)*r,cima+Math.sin(a)*r,r*.71,colores[i%colores.length]);
      }
      punto(ctx,px+inclinacion,cima,r*.58,'#ffe17a');
    }

    const etapa=limitar(t/2.1)*arriates.length;
    const i=Math.min(arriates.length-1,Math.floor(etapa));
    const q=limitar(etapa-i);
    const desde=i>0?arriates[i-1]:[origen.x/ancho,origen.y/alto];
    const hasta=arriates[i];
    const x=unir(desde[0],hasta[0],suavizar(q))*ancho;
    const y=unir(desde[1],hasta[1],q)*alto-Math.sin(q*Math.PI)*corto*.13;
    ctx.globalAlpha*=desvanecer(t,2.36,.27);
    punto(ctx,x,y,Math.max(5,corto*.024),'#8bd346');
    ctx.globalAlpha=1;
  }

  function cinta(ctx,{ancho,alto,corto},origen,t) {
    const p=t/3.42;
    const final=limitar(p*1.12);
    const inicio=Math.max(0,final-.37)+limitar((p-.87)/.13)*.37;
    const direccion=origen.x<ancho/2?1:-1;
    const grosor=Math.min(10,corto*.018);
    ctx.globalAlpha=desvanecer(t,3.42,.47);
    ctx.lineCap='round';
    ctx.lineJoin='round';
    const muestra=q=>{
      const angulo=vuelta*q*1.13;
      const mezcla=suavizar(limitar(q*5.1));
      return {
        x:unir(origen.x,ancho*(.5+direccion*.40*Math.sin(angulo)),mezcla),
        y:unir(origen.y,alto*(.5-.32*Math.sin(angulo*1.65+.35)),mezcla)
      };
    };
    for (let color=0;color<arcoiris.length;color++) {
      ctx.strokeStyle=arcoiris[color];
      ctx.lineWidth=Math.max(1.7,grosor*.76);
      ctx.beginPath();
      const banda=(color-(arcoiris.length-1)/2)*grosor*.69;
      for (let j=0;j<=32;j++) {
        const q=unir(inicio,final,j/32);
        const {x,y}=muestra(q);
        const curva=banda*Math.sin(q*7.9);
        if (!j) ctx.moveTo(x+curva,y+banda);
        else ctx.lineTo(x+curva,y+banda);
      }
      ctx.stroke();
    }
    const cabeza=muestra(final);
    punto(ctx,cabeza.x,cabeza.y,Math.max(3,grosor*.64),'#fff2c0');
    ctx.globalAlpha=1;
  }

  const efectos = {
    volcan:{duracion:3.9,dibujar:volcan,sonidos:()=>[[.24,'rugido'],[.65,'explosion'],[1.05,'chispa'],[1.55,'chispa']]},
    fuegos:{duracion:3.25,preparar:prepararFuegos,dibujar:fuegos,sonidos:sonidoFuegos},
    estrellas:{duracion:2.55,dibujar:estrellas,sonidos:()=>[[0,'explosion']]},
    domino:{duracion:3.25,dibujar:domino,sonidos:()=>Array.from({length:fichas},(_,i)=>[.74+i*.153,'piedra'])},
    jardin:{duracion:4.20,dibujar:jardin,sonidos:()=>arriates.map((_,i)=>[.88+i*.32,'flor'])},
    cinta:{duracion:3.42,dibujar:cinta,sonidos:()=>[[0,'cinta'],[1.71,'cinta']]}
  };

  function crear(lienzo) {
    const ctx=lienzo.getContext('2d');
    let activos=[], cuadro=0;

    function pintar(ahora) {
      const rect=lienzo.getBoundingClientRect();
      const escala=Math.min(devicePixelRatio||1,1.5);
      const ancho=Math.max(1,Math.round(rect.width*escala));
      const alto=Math.max(1,Math.round(rect.height*escala));
      if (lienzo.width!==ancho) lienzo.width=ancho;
      if (lienzo.height!==alto) lienzo.height=alto;
      const zona={ancho:rect.width,alto:rect.height,corto:Math.min(rect.width,rect.height)};
      ctx.setTransform(escala,0,0,escala,0,0);
      ctx.clearRect(0,0,zona.ancho,zona.alto);
      activos=activos.filter(({inicio,efecto})=>ahora-inicio<efecto.duracion*1000);
      for (const {inicio,efecto,estado,x,y} of activos) {
        ctx.save();
        efecto.dibujar(ctx,zona,{x:x*zona.ancho,y:y*zona.alto},Math.max(0,(ahora-inicio)/1000),estado);
        ctx.restore();
      }
      cuadro=activos.length?requestAnimationFrame(pintar):0;
      lienzo.hidden=!cuadro;
    }

    function limpiar() {
      cancelAnimationFrame(cuadro);
      cuadro=0;
      activos=[];
      lienzo.hidden=true;
    }

    function lanzar(boton,efecto,estado) {
      if (!ctx) return;
      lienzo.hidden=false;
      const zona=lienzo.getBoundingClientRect(), origen=boton.getBoundingClientRect();
      if (!(zona.width && zona.height)) { lienzo.hidden=true; return; }
      activos.push({
        efecto,estado,inicio:performance.now(),
        x:(origen.left+origen.width/2-zona.left)/zona.width,
        y:(origen.top+origen.height*.48-zona.top)/zona.height
      });
      if (!cuadro) cuadro=requestAnimationFrame(pintar);
    }

    return {lanzar,limpiar};
  }

  window.HuevosEfectosResta={crear,efectos};
})();
