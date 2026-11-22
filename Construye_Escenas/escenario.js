(() => {
  const ancho = 760, alto = 440, piso = 396;
  const altoCasaAbierta = 205;
  const escala = z => .40 + z * .94;
  const escalaObjeto = z => z < 0 ? .74 : escala(z);
  const anchoVista = z => 600 + 120 * z;
  const proyectar = (x, z, h = 0) => [380 + (x - .5) * anchoVista(z), 145 + 246 * z - h * escalaObjeto(z)];
  const desdePantalla = (x, y) => {
    const z = (y - 145) / 246;
    return {x: .5 + (x - 380) / anchoVista(z), z};
  };
  function dentroCasa(x, z, casa) {
    const [px, py] = proyectar(x, z);
    const [cx, cy] = proyectar(casa.x, casa.z);
    const alto = altoCasaAbierta * escala(casa.z);
    const profundidad = (cy - py) / alto;
    return profundidad >= 0 && profundidad <= .26 &&
      Math.abs(px - cx) / alto <= .39 - profundidad * .32;
  }
  function poligono(ctx, puntos, relleno, borde, grosor = 2) {
    ctx.beginPath();
    puntos.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    if (relleno) { ctx.fillStyle = relleno; ctx.fill(); }
    if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = grosor; ctx.stroke(); }
  }
  function elipse(ctx, x, y, rx, ry, color, borde) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (borde) { ctx.lineWidth = 2; ctx.strokeStyle = borde; ctx.stroke(); }
  }
  function linea(ctx, puntos, color, grosor = 3) {
    ctx.beginPath();
    puntos.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.stroke();
  }
  function rect(ctx, x, y, w, h, radio, color, borde) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radio);
    ctx.fillStyle = color;
    ctx.fill();
    if (borde) { ctx.lineWidth = 2.5; ctx.strokeStyle = borde; ctx.stroke(); }
  }
  function bloque(ctx, pieza, x, y) {
    const {ancho: w, alto: h, tinta: color, forma} = pieza;
    const suave = ctx.createLinearGradient(0, y - h, 0, y);
    suave.addColorStop(0, '#ffffff45');
    suave.addColorStop(.63, '#ffffff00');
    suave.addColorStop(1, '#3017452f');
    if (forma === 'triangulo') {
      const puntos = [[x - w/2, y], [x, y - h], [x + w/2, y]];
      poligono(ctx, puntos, color, '#323350', 3);
      poligono(ctx, puntos, suave);
      linea(ctx, [[x - w * .34, y - 7], [x, y - h + 12]], '#fff8', 3);
    } else {
      rect(ctx, x - w/2, y - h, w, h, 7, color, '#323350');
      rect(ctx, x - w/2, y - h, w, h, 7, suave);
      linea(ctx, [[x - w/2 + 11, y - h + 9], [x + w/2 - 11, y - h + 9]], '#fff8', 3);
    }
  }
  function fondoBloques(ctx, area = {x: 0, y: 0, ancho, alto}) {
    const luz = ctx.createLinearGradient(0, area.y, 0, piso);
    luz.addColorStop(0, '#f8fbff'); luz.addColorStop(1, '#e2e9ff');
    ctx.fillStyle = luz;
    ctx.fillRect(area.x, area.y, area.ancho, area.alto);
    ctx.fillStyle = '#a6a8d426';
    for (let x = area.x - area.x % 24 + 16; x < area.x + area.ancho; x += 24) {
      for (let y = area.y - area.y % 24 + 16; y < piso; y += 24) ctx.fillRect(x, y, 2, 2);
    }
    ctx.fillStyle = '#c9d7ef';
    ctx.fillRect(area.x, piso, area.ancho, area.y + area.alto - piso);
    linea(ctx, [[area.x, piso], [area.x + area.ancho, piso]], '#6c7bad', 3);
    for (let x = area.x - area.x % 33 + 27; x < area.x + area.ancho; x += 33) linea(ctx, [[x, piso + 13], [x - 9, piso + 26]], '#a1b2d47c', 2);
  }
  const orilla = (tipo, z) => (tipo === 'rio' ? .247 : .32) + .018 * Math.sin(z * 9);
  const fondos = new Map();
  const recortes = {
    fuente: [23, 25, 211, 199, 81],
    nino: [318, 10, 99, 226, 73],
    nina: [523, 16, 132, 219, 73],
    pato: [757, 36, 165, 188, 34],
    pelota: [996, 46, 171, 173, 24],
    arbol: [19, 254, 218, 209, 169],
    banco: [264, 301, 208, 140, 47],
    flores: [501, 267, 190, 188, 33],
    casa: [720, 269, 226, 177, 190],
    conejo: [982, 258, 187, 197, 36],
    barco: [30, 496, 191, 199, 97],
    sombrilla: [260, 493, 205, 202, 101],
    castillo: [496, 497, 224, 192, 40],
    tienda: [720, 522, 235, 153, 81],
    fogata: [995, 498, 167, 195, 48]
  };
  const atlas = new Map();
  const alturasVehiculos = {carro: 71, camion: 104, autobus: 111};
  const coloresVehiculo = ['rojo','azul','amarillo'];
  const vistasVehiculos = {
    'carros-frente': ['carro','frente',[[9,10,282,280],[309,10,282,281],[609,10,282,280]]],
    'carros-lado': ['carro','lado',[[9,58,282,184],[309,58,282,184],[609,59,282,183]]],
    'camiones-frente': ['camion','frente',[[34,9,233,282],[334,9,233,282],[634,9,233,282]]],
    'camiones-lado': ['camion','lado',[[9,46,282,209],[309,46,282,209],[609,46,282,209]]],
    'autobuses-frente': ['autobus','frente',[[20,9,260,282],[320,9,260,282],[620,9,260,282]]],
    'autobuses-lado': ['autobus','lado',[[9,65,282,171],[309,65,282,171],[609,65,282,170]]]
  };
  const grupos = {
    coches: [
      [32,76,255,187],[322,76,256,187],[612,76,255,187],
      [25,345,259,218],[315,345,261,218],[605,345,265,218],
      [17,647,276,205],[309,647,276,206],[600,647,281,206]
    ],
    recreopiezas: [[25,28,271,261],[305,46,290,231],[605,76,286,206],[7,341,289,224]],
    relieve: [[9,61,282,179],[309,71,282,158],[609,104,282,92]],
    'caja-objetos': [[25,9,250,282],[326,9,249,282],[618,9,264,282]],
    extra: [[14,17,277,268],[326,7,239,278],[606,10,282,275],[9,291,288,282],[321,335,271,219],
      [605,291,287,285],[8,588,289,296],[310,590,279,276],[604,626,289,213]]
  };
  const ids = {
    coches: Object.keys(alturasVehiculos).flatMap(tipo => coloresVehiculo.map(color => tipo + '-' + color)),
    recreopiezas: ['tobogan','columpios','trampolin','bicicleta'],
    relieve: ['volcan','montana','cerro'],
    'caja-objetos': ['manzana','cubo-juguete','regalo'],
    extra: ['perro','gato','oveja','vaca','pajaro','caballo','escuela','sol','nube']
  };
  const alturas = {
    coches: Object.values(alturasVehiculos).flatMap(alto => coloresVehiculo.map(() => alto)),
    recreopiezas: [107,110,62,63],
    relieve: [224,245,101],
    'caja-objetos': [27,31,37],
    extra: [47,35,61,88,33,105,218,63,59]
  };
  const atlasPieza = {};
  const piezasIndividuales = {'casa-abierta': [560,406,altoCasaAbierta], cerca: [560,348,114], caja: [440,194,73]};
  for (const id of Object.keys(recortes)) atlasPieza[id] = 'objetos';
  for (const [grupo, cajas] of Object.entries(grupos)) {
    cajas.forEach((caja, i) => {
      const id = ids[grupo][i];
      recortes[id] = [...caja, alturas[grupo][i]];
      atlasPieza[id] = grupo;
    });
  }
  for (const [grupo, [tipo, vista, cajas]] of Object.entries(vistasVehiculos)) {
    cajas.forEach((caja, i) => {
      const id = tipo + '-' + coloresVehiculo[i] + '-' + vista;
      recortes[id] = [...caja, alturasVehiculos[tipo]];
      atlasPieza[id] = grupo;
    });
  }
  for (const [id, medidas] of Object.entries(piezasIndividuales)) {
    recortes[id] = [0,0,...medidas];
    atlasPieza[id] = id;
  }
  function dimensionesObjeto(id, z) {
    const [, , w, h, tamano] = recortes[id];
    const alto = tamano * escalaObjeto(z);
    return {ancho: alto * w / h, alto};
  }
  function dentroCerca(x, z, cerca) {
    const [px, py] = proyectar(x,z), [cx, cy] = proyectar(cerca.x,cerca.z);
    const {ancho, alto} = dimensionesObjeto('cerca',cerca.z);
    const profundidad = (cy - py) / alto;
    return profundidad >= .31 && profundidad <= .78 &&
      Math.abs(px - cx) / ancho <= .44 - profundidad * .18;
  }
  function dentroCaja(x, z, caja) {
    const [px, py] = proyectar(x,z), [cx, cy] = proyectar(caja.x,caja.z);
    const {ancho, alto} = dimensionesObjeto('caja',caja.z);
    const profundidad = (cy - py) / alto;
    return profundidad >= .34 && profundidad <= .64 &&
      Math.abs(px - cx) / ancho <= .39 - profundidad * .09;
  }
  function vistaObjeto(id, x, z, terreno) {
    if (!recortes[id + '-lado']) return {id, reflejar: false};
    // La calle del barrio es horizontal. En la terminal, el acceso central apunta al frente.
    if (terreno === 'terminal' && x >= .33 && x <= .67) return {id: id + '-frente', reflejar: false};
    const reflejar = terreno === 'barrio' ? z >= .615 : x < .33;
    return {id: id + '-lado', reflejar};
  }
  function semiAnchoEnEscena(id, x, z, terreno) {
    const vista = vistaObjeto(id,x,z,terreno);
    return dimensionesObjeto(vista.id,z).ancho / 2;
  }
  function objetoEnEscena(id, x, z, terreno) {
    const [px] = proyectar(x,z);
    const mitad = semiAnchoEnEscena(id,x,z,terreno);
    return px - mitad >= 5 && px + mitad <= ancho - 5;
  }
  function tocarObjeto(punto, objeto, terreno) {
    const [x,y] = proyectar(objeto.x,objeto.z);
    const vista = vistaObjeto(objeto.id,objeto.x,objeto.z,terreno);
    const {ancho,alto} = dimensionesObjeto(vista.id,objeto.z);
    const borde = objeto.z < 0 ? .16 : 1;
    return Math.abs(punto.x - x) <= Math.max(ancho / 2,22) + 10 &&
      punto.y >= y - alto * borde - 9 && punto.y <= y + alto * (1 - borde) + 16;
  }
  function marcaColocacion(ctx, objeto, corregir) {
    const [x,y] = proyectar(objeto.x,objeto.z);
    const radio = objeto.contenedor?.id === 'caja' ? 13 : objeto.z < 0 ? 17 : 19 + 11 * objeto.z;
    const altoMarca = objeto.z < 0 ? radio : radio * .48;
    const color = corregir ? '#a53e1f' : '#155575';
    elipse(ctx,x,y,radio + 3,altoMarca + 3,'#ffffffea',color);
    elipse(ctx,x,y,radio - 1,altoMarca - 1,corregir ? '#ffb862' : '#5ed5ef',color);
    elipse(ctx,x,y,3.5,3.5,color);
  }
  function visibleFueraDeCasa(id, x, z, casa) {
    if (z >= casa.z) return true;
    const [px] = proyectar(x,z), [cx] = proyectar(casa.x,casa.z);
    return Math.abs(px - cx) >= dimensionesObjeto('casa-abierta',casa.z).ancho / 2 +
      dimensionesObjeto(id,z).ancho / 4;
  }
  function cargarFondos(alCargar) {
    for (const tipo of ['rio','parque','playa','granja','campamento','barrio','terminal','recreo','lago']) {
      const imagen = new Image();
      imagen.onload = () => { fondos.set(tipo, imagen); alCargar(tipo); };
      imagen.src = `paisajes/${tipo}.webp${tipo === 'parque' ? '?v=despejado' : ''}`;
    }
    for (const grupo of ['objetos', ...Object.keys(grupos), ...Object.keys(vistasVehiculos), ...Object.keys(piezasIndividuales)]) {
      const imagen = new Image();
      imagen.onload = () => { atlas.set(grupo, imagen); alCargar('objetos'); };
      imagen.src = `paisajes/${grupo}.webp`;
    }
  }
  function terreno(ctx, tipo, area = {x: 0, y: 0, ancho, alto}) {
    const imagen = fondos.get(tipo);
    if (imagen) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, ancho, alto, 16);
      ctx.clip();
      ctx.drawImage(imagen, 0, 0, ancho, alto);
      ctx.restore();
      return;
    }
    const cielo = ctx.createLinearGradient(0, area.y, 0, 440);
    cielo.addColorStop(0, tipo === 'campamento' ? '#91a0f3' : '#86d7fa');
    cielo.addColorStop(.66, '#fff7dc');
    cielo.addColorStop(1, tipo === 'playa' ? '#ffefcc' : '#d9eecf');
    ctx.fillStyle = cielo;
    ctx.fillRect(area.x, area.y, area.ancho, area.alto);
    elipse(ctx, 640, 69 + area.y * .33, 31, 31, '#fff4ab');
    for (const [x, y] of [[110, 52], [276, 65], [535, 37]]) {
      const nube = y + area.y * .29;
      elipse(ctx, x, nube, 40, 11, '#ffffffbb');
      elipse(ctx, x + 8, nube - 7, 20, 14, '#ffffffbb');
    }
    if (tipo === 'campamento' || tipo === 'granja') {
      poligono(ctx, [[0,211],[0,149],[102,61],[179,143],[281,50],[422,160],[532,73],[645,153],[760,89],[760,218]], '#8796c2');
      poligono(ctx, [[60,98],[102,61],[138,99],[111,92],[99,106],[88,93]], '#eaf0ff');
      poligono(ctx, [[229,96],[281,50],[334,91],[304,86],[285,102],[261,86]], '#eaf0ff');
    }
    if (tipo !== 'playa') {
      elipse(ctx, 89, 179, 205, 57, '#a7d696');
      elipse(ctx, 605, 176, 255, 56, '#97c99b');
    } else {
      ctx.fillStyle = '#88d3ee';
      ctx.fillRect(area.x, 120, area.ancho, 77);
    }
    const [a, b, c, d] = [[0,0],[1,0],[1,1],[0,1]].map(([x,z]) => proyectar(x,z));
    poligono(ctx, [d,c,[c[0]-12,c[1]+27],[d[0]+12,d[1]+27]], tipo === 'playa' ? '#c7a16e' : '#61a771');
    poligono(ctx, [a,b,c,d], tipo === 'playa' ? '#f8d694' : tipo === 'granja' ? '#b6d57c' : '#a4d78c', '#589578', 2);
    if (tipo === 'rio' || tipo === 'playa') {
      const curva = Array.from({length: 21}, (_, i) => proyectar(orilla(tipo, i / 20), i / 20));
      poligono(ctx, [a, ...curva, d], tipo === 'rio' ? '#63bbe7' : '#55badf');
      linea(ctx, curva, tipo === 'rio' ? '#dbf2e8' : '#fff4d8', 4);
      for (let i = 0; i < 13; i++) {
        const x = .04 + i % 3 * .067, z = .1 + i * .066;
        linea(ctx, [proyectar(x, z), proyectar(x + .043, z)], '#d5f7ffbb', 2 + z);
      }
    } else if (tipo === 'parque') {
      poligono(ctx, [[.44,0],[.55,0],[.59,1],[.41,1]].map(([x,z]) => proyectar(x,z)), '#e8cb96');
      linea(ctx, [proyectar(.05,.8), proyectar(.95,.8)], '#edd7a2', 7);
    } else if (tipo === 'granja') {
      for (let x = .03; x < .19; x += .044) {
        linea(ctx, [proyectar(x,.59), proyectar(x,.94)], '#8b9658', 3);
      }
    }
    for (let i = 0; i < 22; i++) {
      const x = .055 + (i * 37 % 88) / 100, z = .06 + (i * 29 % 87) / 100;
      if ((tipo === 'rio' || tipo === 'playa') && x <= orilla(tipo, z) + .025) continue;
      const [px, py] = proyectar(x,z);
      linea(ctx, [[px - 3,py],[px,py - 3],[px + 3,py]], tipo === 'playa' ? '#e5b975' : '#75b679', 1.5);
    }
  }
  function volumen(ctx, x, z, w, d, base, h, colores) {
    const frente = z + d / 2, fondo = z - d / 2;
    const izq = x - w / 2, der = x + w / 2, alto = base + h;
    const p = proyectar;
    poligono(ctx, [p(der,fondo,base),p(der,frente,base),p(der,frente,alto),p(der,fondo,alto)], colores[1], '#493b534a');
    poligono(ctx, [p(izq,frente,base),p(der,frente,base),p(der,frente,alto),p(izq,frente,alto)], colores[0], '#493b534a');
    poligono(ctx, [p(izq,fondo,alto),p(der,fondo,alto),p(der,frente,alto),p(izq,frente,alto)], colores[2], '#493b534a');
  }
  function construccion(ctx, id, x, z, h) {
    const casa = id === 'casa', tienda = id === 'tienda';
    const mitad = casa ? .08 : .091, profundidad = casa ? .081 : .092;
    const izq = x - mitad, der = x + mitad, frente = z + profundidad / 2, fondo = z - profundidad / 2;
    const p = proyectar;
    if (id === 'banco') {
      for (const dx of [-.049,.049]) volumen(ctx,x+dx,z,.013,.047,h,21,['#755247','#58433c','#ad8065']);
      volumen(ctx,x,z,.13,.063,h+20,9,['#b87042','#855538','#e3a268']);
      volumen(ctx,x,z-.026,.13,.015,h+25,20,['#b76b36','#8b4c30','#efb67a']);
      return;
    }
    const muro = casa ? 60 : 0;
    if (casa) volumen(ctx,x,z,mitad * 2,profundidad,h,muro,['#ffd181','#d89358','#ffe4aa']);
    const cima = h + muro + (tienda ? 78 : 41);
    poligono(ctx, [p(x,fondo,cima),p(x,frente,cima),p(der,frente,h+muro),p(der,fondo,h+muro)], tienda ? '#f6a044' : '#a94863', '#624259');
    poligono(ctx, [p(izq,frente,h+muro),p(x,frente,cima),p(der,frente,h+muro)], tienda ? '#ffd272' : '#df6a70', '#624259');
    if (tienda) {
      poligono(ctx, [p(x-.035,frente,h),p(x,frente,h+55),p(x+.036,frente,h)], '#655b77');
    } else {
      poligono(ctx, [p(x-.02,frente,h),p(x-.02,frente,h+36),p(x+.021,frente,h+36),p(x+.021,frente,h)], '#995449');
      for (const dx of [-.053,.05]) {
        poligono(ctx, [p(x+dx-.015,frente,h+24),p(x+dx-.015,frente,h+43),p(x+dx+.014,frente,h+43),p(x+dx+.014,frente,h+24)], '#c2edff', '#9c6e53');
      }
    }
  }
  function persona(ctx, nina) {
    linea(ctx,[[-11,-29],[-12,-7],[-17,-3]],'#33436c',8);
    linea(ctx,[[8,-29],[11,-7],[17,-3]],'#33436c',8);
    linea(ctx,[[-13,-50],[-24,-30]],'#db9867',7);
    linea(ctx,[[13,-50],[24,-33]],'#db9867',7);
    rect(ctx,-16,-61,32,36,8,nina ? '#d9569e' : '#416ee7','#384c7b');
    if(nina) elipse(ctx,14,-81,9,19,'#603748');
    elipse(ctx,0,-76,18,19,'#f4ba8b','#a75f50');
    elipse(ctx,-1,-87,17,10,nina ? '#603748' : '#68414a');
    elipse(ctx,-6,-75,1.8,2,'#32243a'); elipse(ctx,6,-75,1.8,2,'#32243a');
    linea(ctx,[[-4,-68],[0,-66],[4,-68]],'#8e4957',1.6);
  }
  function sprite(ctx, id) {
    switch (id) {
      case 'nino': case 'nina': persona(ctx, id === 'nina'); break;
      case 'arbol':
        rect(ctx,-7,-69,14,69,4,'#9c6448','#714335');
        elipse(ctx,-17,-80,25,28,'#428b61','#366854');
        elipse(ctx,19,-80,24,27,'#4d9e67','#366854');
        elipse(ctx,0,-105,29,33,'#68b86c','#3e805b');
        elipse(ctx,-8,-111,14,12,'#90d283');
        break;
      case 'fuente':
        elipse(ctx,0,-4,44,15,'#7c91aa','#516781');
        elipse(ctx,0,-13,44,15,'#e4edfa','#8194b1');
        elipse(ctx,0,-13,35,9,'#69d0f2');
        rect(ctx,-7,-45,14,34,4,'#9caec5','#657f9d');
        elipse(ctx,0,-43,22,7,'#d4eaf1','#738aa3');
        linea(ctx,[[0,-46],[0,-68],[-11,-59],[-18,-44]],'#77d6ff',3);
        linea(ctx,[[0,-64],[12,-60],[18,-46]],'#a3eaff',3);
        break;
      case 'pato':
        poligono(ctx,[[-33,-21],[-43,-37],[-23,-33]],'#ffcf60','#9e6b37');
        elipse(ctx,-5,-17,32,16,'#ffda68','#9e6b37');
        elipse(ctx,14,-38,15,17,'#ffe691','#9e6b37');
        elipse(ctx,28,-35,12,5,'#fa8a3d','#a45e30');
        elipse(ctx,17,-42,2.5,3,'#423342');
        elipse(ctx,-9,-17,15,8,'#ffbf4c');
        break;
      case 'pelota':
        elipse(ctx,0,-17,17,17,'#fb825a','#b64e53');
        linea(ctx,[[-14,-24],[-3,-17],[6,-4]],'#fff08b',4);
        elipse(ctx,-6,-25,4,3,'#ffe1a7');
        break;
      case 'flores':
        for (const [x,y,color] of [[-23,-29,'#ff81a8'],[0,-45,'#ffcc49'],[24,-28,'#b495f0']]) {
          linea(ctx,[[x,y],[x*.82,-12],[x*.58,0]],'#3c9065',4);
          elipse(ctx,x,y,11,10,color,'#a85183');
          elipse(ctx,x,y,4,4,'#fff9b9');
        }
        break;
      case 'conejo':
        elipse(ctx,-10,-13,22,14,'#ded3e6','#85788d');
        elipse(ctx,-28,-16,8,7,'#fff5f4');
        elipse(ctx,11,-28,15,14,'#eee5ed','#85788d');
        elipse(ctx,6,-48,5,14,'#c5b4d0','#85788d');
        elipse(ctx,18,-49,5,15,'#e2b1c9','#85788d');
        elipse(ctx,17,-31,2.3,2.5,'#473b51');
        elipse(ctx,25,-25,3,2,'#bd748b');
        break;
      case 'barco':
        poligono(ctx,[[-38,-20],[-23,0],[24,0],[41,-20]],'#d66f78','#884755');
        linea(ctx,[[0,-21],[0,-76]],'#684865',4);
        poligono(ctx,[[2,-74],[34,-28],[2,-28]],'#fff3c1','#7a7eae');
        poligono(ctx,[[-4,-64],[-4,-30],[-27,-30]],'#9bbcff','#7a7eae');
        break;
      case 'sombrilla':
        linea(ctx,[[0,0],[0,-83]],'#845b62',5);
        poligono(ctx,[[-47,-56],[-37,-75],[-15,-84],[13,-84],[35,-73],[47,-56],[23,-51],[0,-56],[-23,-51]],'#ff6f87','#a14d6e');
        poligono(ctx,[[-23,-51],[-10,-83],[8,-84],[23,-51],[0,-56]],'#ffcb62');
        break;
      case 'castillo':
        rect(ctx,-33,-42,66,41,3,'#efbb72','#b27650');
        for (const x of [-29,-9,11,28]) rect(ctx,x-6,-48,12,11,2,'#fbd58c','#b27650');
        rect(ctx,-9,-23,18,22,6,'#a66b52');
        break;
      case 'fogata':
        linea(ctx,[[-26,-5],[26,-17]],'#885949',9);
        linea(ctx,[[-25,-17],[28,-4]],'#ac7350',9);
        poligono(ctx,[[-17,-11],[-24,-28],[-15,-45],[-7,-35],[1,-69],[9,-54],[18,-40],[23,-23],[14,-11]],'#f4804f','#af5852');
        poligono(ctx,[[-10,-11],[-15,-23],[-2,-43],[4,-32],[11,-40],[16,-22],[8,-11]],'#ffdd66');
        break;
    }
  }
  function paisajeObjeto(ctx, id, x, z, h = 0, terreno, sombraVisible = true) {
    const [sx, sy] = proyectar(x, z);
    if (z >= 0 && sombraVisible) {
      ctx.save();
      ctx.translate(sx + 7 * escala(z), sy + 3 * escala(z));
      ctx.scale(escala(z), escala(z) * .27);
      const sombra = ctx.createRadialGradient(0, 0, 4, 0, 0, 43 + h * .14);
      sombra.addColorStop(0, h ? '#272f4b44' : '#272f4b69');
      sombra.addColorStop(1, '#272f4b00');
      elipse(ctx, 0, 0, 43 + h * .14, 43 + h * .14, sombra);
      ctx.restore();
    }
    const vista = vistaObjeto(id,x,z,terreno);
    const spriteId = atlas.has(atlasPieza[vista.id]) ? vista.id : id;
    const imagen = atlas.get(atlasPieza[spriteId]);
    if (imagen) {
      const [origenX,origenY,anchoImagen,altoImagen] = recortes[spriteId];
      const {ancho, alto} = dimensionesObjeto(spriteId,z);
      const agua = id === 'pato' ? .87 : 1;
      const [,base] = proyectar(x,z,h);
      ctx.save();
      ctx.translate(sx, base);
      if (vista.reflejar) ctx.scale(-1, 1);
      ctx.drawImage(imagen, origenX, origenY, anchoImagen, altoImagen * agua, -ancho/2, -alto * (z < 0 ? .16 : agua), ancho, alto * agua);
      ctx.restore();
      return;
    }
    if (['casa','tienda','banco'].includes(id)) { construccion(ctx,id,x,z,h); return; }
    ctx.save();
    ctx.translate(...proyectar(x,z,h));
    ctx.scale(escala(z), escala(z));
    sprite(ctx, id);
    ctx.restore();
  }
  function ficha(canvas, id, pieza) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    if (pieza.forma) {
      ctx.translate(canvas.width/2,canvas.height*.84);
      const factor = Math.min(canvas.width*.8/pieza.ancho,canvas.height*.72/pieza.alto);
      ctx.scale(factor,factor);
      bloque(ctx,pieza,0,0);
    } else if (atlas.has(atlasPieza[id])) {
      const [x,y,w,h] = recortes[id];
      const tamano = Math.min(canvas.width * .79 / w, canvas.height * .76 / h);
      ctx.drawImage(atlas.get(atlasPieza[id]), x,y,w,h, (canvas.width-w*tamano)/2, (canvas.height-h*tamano)/2, w*tamano,h*tamano);
    } else {
      ctx.scale(canvas.width/760,canvas.width/760);
      const relacion = canvas.height/canvas.width;
      const factor = Math.min(5.4, relacion * 4.2);
      ctx.translate(380, relacion * 760 * .91);
      ctx.scale(factor,factor);
      ctx.translate(-380,-391);
      paisajeObjeto(ctx,id,.5,1);
    }
    ctx.restore();
  }
  return window.EscenarioConstruccion = {ancho,alto,piso,proyectar,desdePantalla,dentroCasa,dentroCerca,dentroCaja,semiAnchoEnEscena,objetoEnEscena,visibleFueraDeCasa,tocarObjeto,marcaColocacion,bloque,fondoBloques,cargarFondos,terreno,paisajeObjeto,ficha,poligono,elipse,linea};
})();
