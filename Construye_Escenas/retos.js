(() => {
  const par = (es, en) => ({es, en});
  const formas = {
    cuadrado: {nombre: par('Cuadrado', 'Square'), ancho: 92, alto: 92},
    rectangulo: {nombre: par('Rectángulo', 'Rectangle'), ancho: 182, alto: 47},
    triangulo: {nombre: par('Triángulo', 'Triangle'), ancho: 94, alto: 69}
  };
  const colores = {
    rojo: {nombre: par('rojo', 'red'), tinta: '#ed5b69'},
    azul: {nombre: par('azul', 'blue'), tinta: '#4692f1'},
    amarillo: {nombre: par('amarillo', 'yellow'), tinta: '#ffc247'},
    verde: {nombre: par('verde', 'green'), tinta: '#43bb8e'}
  };
  const piezas = Object.fromEntries(Object.entries(formas).flatMap(([forma, datos]) =>
    Object.entries(colores).map(([color, {nombre, tinta}]) => [forma + '-' + color, {
      forma, ancho: datos.ancho, alto: datos.alto, tinta,
      nombre: par(datos.nombre.es + ' ' + nombre.es, nombre.en[0].toUpperCase() + nombre.en.slice(1) + ' ' + datos.nombre.en.toLowerCase())
    }])
  ));
  for (const [id, es, en] of [
    ['fuente', 'Fuente', 'Fountain'], ['nino', 'Niño', 'Boy'], ['nina', 'Niña', 'Girl'],
    ['pato', 'Pato', 'Duck'], ['pelota', 'Pelota', 'Ball'], ['arbol', 'Árbol', 'Tree'],
    ['banco', 'Banco', 'Bench'], ['flores', 'Flores', 'Flowers'], ['casa', 'Casa', 'House'],
    ['conejo', 'Conejo', 'Rabbit'], ['barco', 'Barco', 'Boat'], ['sombrilla', 'Sombrilla', 'Beach umbrella'],
    ['castillo', 'Castillo de arena', 'Sandcastle'], ['tienda', 'Tienda de campaña', 'Tent'], ['fogata', 'Fogata', 'Campfire']
  ]) piezas[id] = {nombre: par(es, en)};

  const bloque = (id, x, apoyos, es, en) => ({id, x, apoyos, texto: par(es, en)});
  const bloques = [
    {nombre: par('Torre de dos colores', 'Two-colour tower'), pasos: [
      bloque('rectangulo-rojo', 380, [], 'Pon un rectángulo rojo en el suelo.', 'Put a red rectangle on the ground.'),
      bloque('cuadrado-azul', 380, [0], 'Pon un cuadrado azul sobre el rectángulo rojo.', 'Put a blue square on top of the red rectangle.'),
      bloque('cuadrado-rojo', 380, [1], 'Pon un cuadrado rojo sobre el cuadrado azul.', 'Put a red square on top of the blue square.'),
      bloque('triangulo-azul', 380, [2], 'Termina la torre con un triángulo azul encima.', 'Finish the tower with a blue triangle on top.')
    ]},
    {nombre: par('El puente amarillo', 'The yellow bridge'), pasos: [
      {...bloque('cuadrado-verde', 327, [], 'Pon un cuadrado verde en el suelo. Deja espacio a su derecha.', 'Put a green square on the ground. Leave room to its right.'), espacio: 147},
      {...bloque('cuadrado-azul', 433, [], 'Pon un cuadrado azul justo a la derecha del cuadrado verde.', 'Put a blue square just to the right of the green square.'), desde: 0, separacion: [92,135]},
      bloque('rectangulo-amarillo', 380, [0, 1], 'Pon un rectángulo amarillo encima de los dos cuadrados, como un puente.', 'Put a yellow rectangle across both squares like a bridge.'),
      bloque('triangulo-rojo', 380, [2], 'Pon un triángulo rojo en el centro del puente.', 'Put a red triangle in the middle of the bridge.')
    ]},
    {nombre: par('Escalera de colores', 'Colourful staircase'), pasos: [
      {...bloque('cuadrado-verde', 244, [], 'Pon un cuadrado verde en el suelo. Deja espacio para dos cuadrados a su derecha.', 'Put a green square on the ground. Leave room for two squares to its right.'), espacio: 250},
      {...bloque('cuadrado-verde', 380, [], 'Pon otro cuadrado verde al lado derecho del primero.', 'Put another green square to the right of the first one.'), desde: 0, separacion: [92,150], espacio: 150},
      {...bloque('cuadrado-verde', 516, [], 'Pon un tercer cuadrado verde a la derecha del segundo.', 'Put a third green square to the right of the second one.'), desde: 1, separacion: [92,150]},
      bloque('cuadrado-azul', 380, [1], 'Pon un cuadrado azul encima del segundo cuadrado verde.', 'Put a blue square above the second green square.'),
      bloque('cuadrado-azul', 516, [2], 'Pon otro cuadrado azul encima del cuadrado verde de la derecha.', 'Put another blue square above the green square on the right.'),
      bloque('cuadrado-amarillo', 516, [4], 'Completa el escalón más alto con un cuadrado amarillo.', 'Finish the tallest step with a yellow square.')
    ]},
    {nombre: par('Dos casitas', 'Two little houses'), pasos: [
      {...bloque('cuadrado-rojo', 245, [], 'Para la primera casa, pon un cuadrado rojo en el suelo. Deja espacio a su derecha.', 'Start the first house with a red square on the ground. Leave room to its right.'), espacio: 176},
      bloque('triangulo-amarillo', 245, [0], 'Pon un triángulo amarillo sobre el cuadrado rojo, como techo.', 'Put a yellow triangle on top of the red square for the roof.'),
      {...bloque('cuadrado-azul', 515, [], 'Para la segunda casa, pon un cuadrado azul a la derecha de la primera casa.', 'Start the second house with a blue square to the right of the first house.'), desde: 0, separacion: [118, 650]},
      bloque('triangulo-verde', 515, [2], 'Pon un triángulo verde sobre el cuadrado azul.', 'Put a green triangle on top of the blue square.')
    ]},
    {nombre: par('El cohete en la plataforma', 'Rocket on the launch pad'), pasos: [
      bloque('rectangulo-verde', 380, [], 'Pon un rectángulo verde en el suelo. Esa será la plataforma.', 'Put a green rectangle on the ground. That will be the launch pad.'),
      bloque('cuadrado-amarillo', 380, [0], 'Pon un cuadrado amarillo en el centro de la plataforma.', 'Put a yellow square in the middle of the launch pad.'),
      bloque('cuadrado-amarillo', 380, [1], 'Pon otro cuadrado amarillo encima del primero.', 'Put another yellow square on top of the first one.'),
      bloque('triangulo-rojo', 380, [2], 'Pon un triángulo rojo encima, como la punta de un cohete.', 'Put a red triangle on top for the tip of the rocket.')
    ]}
  ];

  const femeninos = new Set('fuente nina pelota flores casa sombrilla tienda fogata bicicleta cerca oveja vaca escuela nube montana caja manzana calle acera tienda-barrio'.split(' '));
  const variantes = [
    ['tobogan', 'Tobogán', 'Slide'], ['columpios', 'Columpios', 'Swing set'], ['trampolin', 'Trampolín', 'Trampoline'],
    ['bicicleta', 'Bicicleta', 'Bicycle'], ['casa-abierta', 'Casa abierta', 'Open house'], ['cerca', 'Cerca', 'Fence'],
    ['perro', 'Perro', 'Dog'], ['gato', 'Gato', 'Cat'], ['oveja', 'Oveja', 'Sheep'], ['vaca', 'Vaca', 'Cow'],
    ['pajaro', 'Pájaro', 'Bird'], ['caballo', 'Caballo', 'Horse'], ['escuela', 'Escuela', 'School'],
    ['sol', 'Sol', 'Sun'], ['nube', 'Nube', 'Cloud'],
    ['volcan', 'Volcán', 'Volcano'], ['montana', 'Montaña', 'Mountain'], ['cerro', 'Cerro', 'Hill'],
    ['caja', 'Caja', 'Box'], ['manzana', 'Manzana', 'Apple'], ['rio', 'Río', 'River'], ['puente', 'Puente', 'Bridge'],
    ['calle','Calle','Road'], ['acera','Acera','Sidewalk'], ['paso-peatonal','Paso peatonal','Crosswalk'],
    ['semaforo','Semáforo','Traffic light'], ['tienda-barrio','Tienda','Shop'], ['taller','Taller mecánico','Repair shop'],
    ['cubo-juguete', 'Cubo de juguete', 'Toy cube'], ['regalo', 'Regalo', 'Present'],
    ['apartamentos', 'Edificio de apartamentos', 'Apartment building'], ['oficinas', 'Edificio de oficinas', 'Office building'],
    ['avion', 'Avión', 'Airplane'], ['globo', 'Globo aerostático', 'Hot air balloon'], ['cohete', 'Cohete', 'Rocket'],
    ['rocas', 'Rocas', 'Rocks'], ['arbusto', 'Arbusto', 'Shrub'], ['poste', 'Poste', 'Utility pole'],
    ['lago-pieza', 'Lago', 'Lake'], ['sapo', 'Sapo', 'Toad'], ['zorro', 'Zorro', 'Fox'], ['venado', 'Venado', 'Deer']
  ];
  const vehiculos = [];
  for (const [tipo, es, en] of [['carro','Carro','car'], ['camion','Camión','truck'], ['autobus','Autobús','bus']]) {
    for (const color of ['rojo', 'azul', 'amarillo']) {
      const id = tipo + '-' + color, colorEn = colores[color].nombre.en;
      variantes.push([id, es + ' ' + color, colorEn[0].toUpperCase() + colorEn.slice(1) + ' ' + en]);
      vehiculos.push(id);
    }
  }
  for (const [id, es, en] of variantes) piezas[id] = {nombre: par(es,en)};
  femeninos.add('casa-abierta');
  const adjetivosTamano = {
    pequeno:['pequeño','pequeña','small'],
    mediano:['mediano','mediana','medium-sized'],
    grande:['grande','grande','large']
  };
  const tamanos = Object.keys(adjetivosTamano);
  const piezasConTamano = new Set([
    'arbol','arbusto','pelota','banco','fuente','casa','sombrilla','castillo','bicicleta',
    'perro','gato','conejo','caballo','vaca','oveja','sapo','zorro','venado',...vehiculos
  ]);
  function nombrePieza(id, tamano) {
    const nombre = piezas[id].nombre;
    if (!tamano) return nombre;
    const [masculino,femenino,ingles] = adjetivosTamano[tamano];
    return par(nombre.es + ' ' + (femeninos.has(id) ? femenino : masculino),
      ingles[0].toUpperCase() + ingles.slice(1) + ' ' + nombre.en.toLowerCase());
  }

  const escena = EscenarioConstruccion;
  // Bordes trazados sobre los fondos originales de 1280 × 720, antes de escalarlos al tablero.
  const orillas = {
    rio: [
      [250,175,253],[260,157,265],[275,97,238],[295,67,231],[310,45,239],
      [325,18,254],[340,0,275],[365,0,292],[390,0,286],[420,0,266],
      [440,0,261],[470,0,283],[510,0,315],[545,0,332],[590,0,324],
      [640,0,318],[680,0,328],[720,0,359]
    ],
    'rio-central': escena.orillasRioCentral,
    playa: [
      [234,0,490],[250,0,394],[272,0,408],[300,0,405],[325,0,432],
      [353,0,405],[400,0,352],[435,0,382],[470,0,360],[500,0,317],
      [531,0,274],[560,0,288],[600,0,239],[630,0,177],[658,0,181],[690,0,112],[720,0,61]
    ],
    lago: [
      [247,0,553],[266,0,620],[291,0,638],[327,0,620],[370,0,584],
      [414,0,572],[460,0,588],[501,0,601],[551,0,598],[603,0,580],[653,0,560],[720,0,543]
    ]
  };
  function interpolar(muestras, eje) {
    const primer = muestras[0], ultimo = muestras.at(-1);
    if (eje <= primer[0]) return primer.slice(1);
    if (eje >= ultimo[0]) return ultimo.slice(1);
    const i = muestras.findIndex(([valor]) => valor >= eje);
    const [a,...inicio] = muestras[i-1], [b,...fin] = muestras[i];
    return inicio.map((valor,j) => valor+(fin[j]-valor)*(eje-a)/(b-a));
  }
  function puntoImagen(x,z) {
    const [px,py] = escena.proyectar(x,z);
    return [px*1280/escena.ancho,py*720/escena.alto];
  }
  function distanciaOrilla(terreno,x,z) {
    const [u,v] = puntoImagen(x,z);
    const [izquierda,derecha] = interpolar(orillas[terreno],v);
    const distancia = terreno === 'rio' || terreno === 'rio-central' ? Math.max(izquierda-u,u-derecha) : u-derecha;
    return distancia*escena.ancho/1280;
  }
  function tramoPuente(x,z) {
    const [u,v] = puntoImagen(x,z);
    if (v < 290 || v > 686) return null;
    const [izquierda,derecha] = interpolar(orillas['rio-central'],v);
    if (u < izquierda || u > derecha) return null;
    const [izquierdaFondo,derechaFondo] = interpolar(orillas['rio-central'],v-30);
    const margen = 20;
    return [
      Math.min(izquierda,izquierdaFondo)*escena.ancho/1280-margen,
      Math.max(derecha,derechaFondo)*escena.ancho/1280+margen
    ];
  }

  const lugar = {
    cesped: par('en el césped', 'on the grass'),
    arena: par('en la arena', 'on the sand'),
    calle: par('en la calle', 'on the road'),
    pavimento: par('en el pavimento', 'on the pavement'),
    rio: par('en el río', 'in the river'),
    'rio-central': par('en el río', 'in the river'),
    playa: par('en el mar', 'in the sea'),
    lago: par('en el lago', 'in the lake'),
    cielo: par('en el cielo', 'in the sky'),
    relieve: par('al fondo del paisaje', 'at the back of the landscape')
  };
  const juegos = 'tobogan columpios trampolin';
  const animales = 'perro gato conejo oveja vaca caballo sapo zorro venado';
  const cielo = 'sol nube pajaro avion globo cohete';
  const aereos = new Set(cielo.split(' '));
  const relieve = new Set(['volcan','montana','cerro']);
  const basicos = 'nino nina banco arbol flores pelota bicicleta rocas arbusto';
  const lista = (...grupos) => [...new Set(grupos.flatMap(grupo => grupo.split(' ')))];
  const paisajes = [
    {nombre: par('Una tarde junto al río', 'An afternoon by the river'), terreno: 'rio', suelo:'cesped',
      objetos: lista('nino pato nina fuente barco arbol casa-abierta cerca', basicos, animales, cielo)},
    {nombre: par('Paseo por el parque', 'A walk in the park'), terreno: 'parque', suelo:'cesped',
      objetos: lista('nino arbol fuente casa-abierta cerca caja manzana cubo-juguete regalo lago-pieza', juegos, basicos, animales, cielo)},
    {nombre: par('Un día de playa', 'A day at the beach'), terreno: 'playa', suelo:'arena',
      objetos: lista('sombrilla barco castillo pato nino nina pelota banco bicicleta casa-abierta cerca perro gato arbol rocas', cielo)},
    {nombre: par('La casa de la granja', 'The farmhouse'), terreno: 'granja', suelo:'cesped',
      objetos: lista('casa-abierta vaca oveja caballo cerca casa arbol nino nina cerro caja manzana lago-pieza poste', basicos, animales, cielo)},
    {nombre: par('Campamento entre montañas', 'Mountain campsite'), terreno: 'campamento', suelo:'cesped',
      objetos: lista('arbol tienda fogata nino nina cerca casa-abierta lago-pieza', [...relieve].join(' '), basicos, animales, cielo)},
    {nombre: par('El barrio', 'The neighbourhood'), terreno: 'barrio', suelo:'cesped',
      objetos: lista('casa-abierta bicicleta nino nina casa escuela fuente cerca apartamentos oficinas poste', basicos, juegos, animales, cielo, vehiculos.join(' '))},
    {nombre: par('La terminal', 'The transport terminal'), terreno: 'terminal', suelo:'pavimento',
      objetos: lista('autobus-rojo camion-azul carro-amarillo banco nino nina escuela bicicleta apartamentos oficinas poste', vehiculos.join(' '), 'casa-abierta fuente arbol flores pelota cerca perro gato', cielo)},
    {nombre: par('El recreo', 'Playtime'), terreno: 'recreo', suelo:'cesped',
      objetos: lista('tobogan columpios trampolin nina nino arbol escuela cerca casa-abierta caja manzana cubo-juguete regalo', basicos, animales, cielo)},
    {nombre: par('Una visita al lago', 'A visit to the lake'), terreno: 'lago', suelo:'cesped',
      objetos: lista('barco pato sombrilla tienda casa-abierta cerca fuente', basicos, animales, cielo)},
    {nombre: par('El río y el puente', 'The river and the bridge'), terreno: 'rio-central', suelo:'cesped',
      objetos: lista('rio puente barco pato fuente casa poste', basicos, animales, juegos)},
    {nombre: par('Construye una calle', 'Build a street'), terreno: 'calle-nueva', suelo:'cesped',
      objetos: lista('calle acera paso-peatonal semaforo tienda-barrio taller apartamentos oficinas escuela poste', basicos, vehiculos.join(' '))}
  ];

  const relacion = {
    derecha: [par('a la derecha', 'to the right of'), (dx, dz) => dx >= .115 && Math.abs(dz) <= .32],
    izquierda: [par('a la izquierda', 'to the left of'), (dx, dz) => dx <= -.115 && Math.abs(dz) <= .32],
    detras: [par('detrás', 'behind'), (dx, dz, pixelX) => dz <= -.15 && Math.abs(pixelX) <= 200],
    delante: [par('delante', 'in front of'), (dx, dz, pixelX) => dz >= .15 && Math.abs(pixelX) <= 200],
    lado: [par('al lado', 'next to'), (dx, dz) => Math.abs(dx) >= .085 && Math.abs(dx) <= .235 && Math.abs(dz) <= .14],
    cerca: [par('cerca', 'near'), (dx, dz) => Math.hypot(dx, dz * .83) <= .205],
    dentro: [par('dentro', 'inside'), (_, __, ___, adentro) => adentro],
    fuera: [par('fuera', 'outside'), (dx, dz, _, adentro) => !adentro && Math.hypot(dx, dz * .72) <= .31]
  };
  const contenedores = new Set(['casa-abierta','cerca','caja','lago-pieza']);
  const piezasDentro = ['nina','nino','pelota','perro','gato','conejo'];
  const piezasCaja = ['pelota','manzana','cubo-juguete','regalo'];
  const referenciasCaja = ['dentro','derecha','izquierda','lado','detras','delante'];
  const cabeDentro = (id, caja) => {
    if (caja.id === 'lago-pieza') return id === 'sapo';
    return (caja.id === 'caja' ? piezasCaja : piezasDentro).includes(id);
  };
  function interior(x, z, a) {
    if (a.id === 'caja') return EscenarioConstruccion.dentroCaja(x,z,a);
    if (a.id === 'cerca') return EscenarioConstruccion.dentroCerca(x,z,a);
    if (a.id === 'lago-pieza') return escena.dentroLago(x,z,a);
    return a.id === 'casa-abierta' && EscenarioConstruccion.dentroCasa(x,z,a);
  }
  const dist = (x,z,a) => Math.hypot(x - a.x, (z - a.z) * .83);
  const sueloPieza = (id, reto) => relieve.has(id) ? 'relieve' : aereos.has(id) ? 'cielo' :
    ['barco','pato','rio','puente'].includes(id) ? reto.terreno :
    vehiculos.includes(id) && reto.terreno === 'barrio' ? 'calle' : reto.suelo;

  const senderoParque = [
    [267,1208,1280],[275,1148,1221],[292,1113,1188],[310,1142,1255],[324,1161,1280],
    [365,1206,1280],[397,1199,1280],[432,1169,1280],[468,1118,1280],[505,1076,1280],
    [550,1040,1280],[603,1016,1280],[650,1014,1280],[690,1024,1280],[720,1041,1280]
  ];
  const inicioSuelo = {
    rio: [[0,279],[115,265],[205,252],[600,254],[1100,253],[1280,268]],
    'rio-central': [[0,214],[1280,214]],
    'calle-nueva': [[0,214],[1280,214]],
    parque: [[0,274],[400,267],[850,263],[1280,267]],
    playa: [[0,249],[455,245],[750,234],[1280,225]],
    granja: [[0,277],[235,273],[330,280],[535,263],[678,261],[924,280],[1040,275],[1280,274]],
    campamento: [[0,266],[132,264],[408,264],[820,265],[1090,261],[1280,263]],
    barrio: [[0,310],[82,307],[202,258],[780,260],[1080,264],[1196,297],[1280,299]],
    terminal: [[0,306],[1280,306]],
    recreo: [[0,273],[65,262],[110,250],[559,251],[719,251],[1160,249],[1231,260],[1280,260]],
    lago: [[0,247],[510,248],[670,244],[920,237],[1280,233]]
  };
  const alComienzoDelSuelo = (terreno,u) => interpolar(inicioSuelo[terreno],u)[0];
  const zonaTablero = (x,z) => {
    const [px,py] = escena.proyectar(x,z);
    return px >= 5 && px <= escena.ancho-5 && z >= -.57 && py <= escena.alto-12;
  };
  function superficie(x,z,suelo,reto,id) {
    if (!zonaTablero(x,z)) return false;
    if (suelo === 'cielo') return z >= -.48 && z <= -.205;
    const [u,v] = puntoImagen(x,z);
    if (v < alComienzoDelSuelo(reto.terreno,u)) return false;
    if (suelo === 'relieve') return z <= .30;
    if (orillas[suelo]) {
      const margen = id === 'barco' ? escena.semiAnchoEnEscena(id,x,z,reto.terreno) : 0;
      return v >= orillas[suelo][0][0] && distanciaOrilla(reto.terreno,x,z) <= -margen;
    }
    if (orillas[reto.terreno]) return v < orillas[reto.terreno][0][0] || distanciaOrilla(reto.terreno,x,z) > 0;
    if (reto.terreno === 'barrio') {
      return suelo === 'calle' ? v >= 425 && v <= 555 : v < 408 || v > 612;
    }
    if (reto.terreno === 'parque' && v >= senderoParque[0][0]) {
      const [izquierda,derecha] = interpolar(senderoParque,v);
      return u < izquierda || u > derecha;
    }
    return true;
  }

  function ocupaCruce(x,z,tramo,zPuente) {
    const [px] = escena.proyectar(x,z);
    return Math.abs(z-zPuente) < .12 && px >= tramo[0]-8 && px <= tramo[1]+8;
  }
  function espacioDisponible(id, terreno, x, z, colocadas, contenedor, tamano) {
    if (!escena.objetoEnEscena(id,x,z,terreno,tamano)) return false;
    const tramo = id === 'puente' && tramoPuente(x,z);
    return colocadas.every(a => {
      if (a === contenedor || escena.esObra(a.id)) return true;
      if (tramo) return !ocupaCruce(a.x,a.z,tramo,z);
      if (a.tramo) return !ocupaCruce(x,z,a.tramo,a.z);
      const proporcion = (escena.factorTamano(tamano)+escena.factorTamano(a.tamano))/2;
      return (id !== 'lago-pieza' || !escena.dentroLago(a.x,a.z,{x,z})) &&
      (contenedores.has(a.id) ? !interior(x,z,a) && dist(x,z,a) >= .095 :
        dist(x,z,a) >= (contenedor ? .05 : .088)*proporcion);
    });
  }
  function posicionValida(paso, x, z, colocadas) {
    return paso.zona(x,z) && espacioDisponible(paso.id,paso.terreno,x,z,colocadas,paso.contenedor,paso.tamano);
  }
  function piezaEnEspacioLibre(id, reto, x, z, colocadas, tamano) {
    if (!zonaTablero(x,z)) return null;
    const contenedor = colocadas.find(a => cabeDentro(id,a) && interior(x,z,a));
    const [u,v] = puntoImagen(x,z);
    if (!contenedor && (sueloPieza(id,reto) === 'cielo' ? !superficie(x,z,'cielo',reto,id) :
      v < Math.min(243,alComienzoDelSuelo(reto.terreno,u)))) return null;
    if (!espacioDisponible(id,reto.terreno,x,z,colocadas,contenedor,tamano)) return null;
    const tramo = id === 'puente' ? tramoPuente(x,z) : null;
    return {id,x,z,tamano,contenedor: contenedor || null,...(tramo && {tramo})};
  }

  // La malla se usa al planear instrucciones con varias piezas, nunca para limitar un punto de colocación.
  const malla = Array.from({length: 24}, (_,i) => 12+i*32).flatMap(px =>
    [29,42,55,68,81,94,...Array.from({length: 22}, (_,i) => 152+i*13)].map(py => escena.desdePantalla(px,py)));
  function hayEspacio(paso, colocadas, cantidad, puntos = malla) {
    if (!cantidad) return true;
    for (let i = 0; i < puntos.length; i++) {
      const {x,z} = puntos[i];
      if (!posicionValida(paso,x,z,colocadas)) continue;
      if (cantidad === 1 || hayEspacio(paso,[...colocadas,{x,z}],cantidad - 1,puntos.slice(i + 1))) return true;
    }
    return false;
  }
  function admite(paso, x, z, colocadas, pendientes) {
    return posicionValida(paso,x,z,colocadas) && hayEspacio(paso,[...colocadas,{x,z}],pendientes);
  }

  function sustantivo(id, definido = false, tamano) {
    const {es,en} = nombrePieza(id,tamano);
    const fem = femeninos.has(id);
    if (id === 'flores') return par(definido ? 'las flores' : 'unas flores', definido ? 'the flowers' : 'some flowers');
    if (id === 'rocas') return par(definido ? 'las rocas' : 'unas rocas', definido ? 'the rocks' : 'some rocks');
    if (id === 'columpios') return par(definido ? 'los columpios' : 'unos columpios', definido ? 'the swing set' : 'a swing set');
    return par((definido ? (fem ? 'la ' : 'el ') : (fem ? 'una ' : 'un ')) + es.toLowerCase(),
      (definido ? 'the ' : (/^[aeiou]/i.test(en) ? 'an ' : 'a ')) + en.toLowerCase());
  }

  const cantidades = {
    arbol: par('árboles','trees'), banco: par('bancos','benches'), conejo: par('conejos','rabbits'),
    pato: par('patos','ducks'), pelota: par('pelotas','balls'), nube: par('nubes','clouds')
  };
  const verbos = [
    par('Pon','Put'), par('Coloca','Place'), par('Agrega','Add'), par('Ubica','Position')
  ];
  function instruccionPaisaje(reto,id,a,tipo,cantidad,verbo,pisos,tamano) {
    if (id === 'rio') return {
      id,cantidad,terreno:reto.terreno,tipo,preparacion:true,
      zona(x,z) {
        const [u,v] = puntoImagen(x,z);
        return u >= 512 && u <= 768 && v >= 214 && v <= 700;
      },
      texto:par('Coloca el río en el centro del paisaje.', 'Place the river in the middle of the landscape.'),
      correccion:par('Mueve el río hacia el centro del paisaje.', 'Move the river to the middle of the landscape.')
    };
    const suelo = sueloPieza(id,reto);
    const plural = cantidades[id];
    const objeto = cantidad === 1 ? sustantivo(id,false,tamano) :
      par((cantidad === 2 ? 'dos ' : 'tres ') + plural.es, (cantidad === 2 ? 'two ' : 'three ') + plural.en);
    const ref = a && sustantivo(a.id,true,a.tamano);
    const [direccion, coincide] = relacion[tipo] || [];
    const ladoRio = tipo === 'izquierda-rio' || tipo === 'derecha-rio';
    function enLadoDelRio(x,z) {
      const [u,v] = puntoImagen(x,z);
      const [izquierda,derecha] = interpolar(orillas['rio-central'],v);
      return tipo === 'izquierda-rio' ? u < izquierda : u > derecha;
    }
    const sitio = id === 'puente' ? par('sobre el río para unir las dos orillas', 'across the river to join both banks') :
      ladoRio ? (tipo === 'izquierda-rio' ? par('a la izquierda del río', 'to the left of the river') :
        par('a la derecha del río', 'to the right of the river')) :
      ref ? par(direccion.es + (ref.es.startsWith('el ') ? ' del ' + ref.es.slice(3) : ' de ' + ref.es),
      direccion.en + ' ' + ref.en) : tipo === 'orilla' ? par(
      orillas[suelo] ? lugar[suelo].es + ', cerca de la orilla' : 'en tierra, cerca de la orilla',
      orillas[suelo] ? lugar[suelo].en + ', near the shore' : 'on land, near the shore'
    ) : lugar[suelo];
    const contenedor = tipo === 'dentro' ? a : null;
    const esInterior = contenedor?.id === 'caja' || contenedor?.id === 'lago-pieza';
    const zona = id === 'puente' ? (x,z) => zonaTablero(x,z) && Boolean(tramoPuente(x,z)) :
      (x,z) => (esInterior || superficie(x,z,suelo,reto,id)) &&
      (!ladoRio || enLadoDelRio(x,z)) &&
      (!pisos || escena.cimaEdificio(x,z,pisos)[1] >= 20) &&
      (id !== 'lago-pieza' || escena.bordesLago(x,z).every(p => superficie(p.x,p.z,suelo,reto,id))) &&
      (tipo !== 'orilla' || Math.abs(distanciaOrilla(reto.terreno,x,z)) <= 94) && (!a || (
      coincide(x-a.x,z-a.z,EscenarioConstruccion.proyectar(x,z)[0] - EscenarioConstruccion.proyectar(a.x,a.z)[0],interior(x,z,a)) &&
      (tipo !== 'fuera' || a.id !== 'casa-abierta' || EscenarioConstruccion.visibleFueraDeCasa(id,x,z,a))
    ));
    const texto = pisos ?
      par('Construye ' + objeto.es + ' de ' + pisos + ' pisos. Coloca el primer piso ' + sitio.es + '.',
        'Build ' + objeto.en + ' with ' + pisos + ' floors. Place the first floor ' + sitio.en + '.') :
      par(verbo.es + ' ' + objeto.es + ' ' + sitio.es + '.', verbo.en + ' ' + objeto.en + ' ' + sitio.en + '.');
    return {id,cantidad,pisos,tamano,contenedor,tipo,terreno:reto.terreno,ancla:a,zona,texto,
      correccion:par('Coloca la pieza ' + sitio.es + '.', 'Place the piece ' + sitio.en + '.'),
    };
  }


  function barajar(lista) {
    const mezcla = [...lista];
    for (let i = mezcla.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mezcla[i],mezcla[j]] = [mezcla[j],mezcla[i]];
    }
    return mezcla;
  }
  function pasoUrbano(reto,id,texto,zona,ajustar,tamano) {
    return {id,cantidad:1,tamano,terreno:reto.terreno,texto,correccion:texto,preparacion:escena.esObra(id),
      zona:(x,z) => zona(...escena.proyectar(x,z),x,z),ajustar};
  }
  function siguienteCalle(reto,colocadas,historial,ronda) {
    const {mitad,acera,cruce} = escena.medidasCalle;
    const buscar = id => colocadas.find(pieza => pieza.id === id);
    const calle = buscar('calle');
    if (!calle) return pasoUrbano(reto,'calle',par('Coloca una calle en el centro del terreno.','Place a road across the middle of the field.'),
      (px,py) => py >= 260 && py <= 310,
      (px,py) => [escena.ancho/2,py]);
    const [,centro] = escena.proyectar(calle.x,calle.z);
    const borde = mitad+acera;
    const aceras = colocadas.filter(pieza => pieza.id === 'acera').length;
    if (aceras < 2) {
      const lado = ronda.ladosAcera[aceras];
      const texto = lado < 0 ? par('Pon una acera junto al borde de arriba de la calle.','Place a sidewalk along the top edge of the road.') :
        par('Pon una acera junto al borde de abajo de la calle.','Place a sidewalk along the bottom edge of the road.');
      return pasoUrbano(reto,'acera',texto, (px,py) => {
        const distancia = (py-centro)*lado;
        return distancia >= mitad-9 && distancia <= borde+20;
      }, (px,py) => [escena.ancho/2,centro+lado*(mitad+acera/2)]);
    }
    const cruces = colocadas.filter(pieza => pieza.id === 'paso-peatonal');
    const crucePuesto = cruces[0];
    if (!crucePuesto) return pasoUrbano(reto,'paso-peatonal',
      par('Coloca el paso peatonal sobre la calle para unir las aceras.','Place the crosswalk across the road to connect the sidewalks.'),
      (px,py) => px >= 114 && px <= escena.ancho-114 && Math.abs(py-centro) <= mitad,
      (px,py) => [px,centro]);
    const [pasoX] = escena.proyectar(crucePuesto.x,crucePuesto.z);
    const semaforos = colocadas.filter(pieza => pieza.id === 'semaforo');
    const pasosPractica = historial.filter(paso => !paso.preparacion).length;
    const cercaDelCruce = px => Math.abs(px-pasoX) >= cruce/2+11 && Math.abs(px-pasoX) <= 128;
    const enAcera = py => Math.abs(py-centro) >= mitad+1 && Math.abs(py-centro) <= borde+7;
    if (pasosPractica >= 5 && semaforos.length === 1) {
      const [,semaforoY] = escena.proyectar(semaforos[0].x,semaforos[0].z);
      const segundo = pasoUrbano(reto,'semaforo',par('Pon otro semáforo cerca del paso peatonal, en la otra acera.',
        'Put another traffic light near the crosswalk, on the opposite sidewalk.'),
        (px,py) => cercaDelCruce(px) && enAcera(py) && (py-centro)*(semaforoY-centro) < 0);
      if (hayEspacio(segundo,colocadas,1)) return segundo;
    }
    const libreDeCruces = (px,margen) => cruces.every(pieza =>
      Math.abs(px-escena.proyectar(pieza.x,pieza.z)[0]) > cruce/2+margen);
    if (pasosPractica >= 6 && cruces.length === 1) {
      const paso = pasoUrbano(reto,'paso-peatonal',par('Agrega otro paso peatonal en un tramo libre de la calle.',
        'Add another crosswalk on a clear stretch of the road.'), (px,py) =>
        px >= 114 && px <= escena.ancho-114 && Math.abs(py-centro) <= mitad && libreDeCruces(px,133) &&
        colocadas.every(pieza => !vehiculos.includes(pieza.id) ||
          Math.abs(px-escena.proyectar(pieza.x,pieza.z)[0]) >
            cruce/2+escena.semiAnchoEnEscena(pieza.id,pieza.x,pieza.z,reto.terreno,pieza.tamano)+8),
      (px,py) => [px,centro]);
      paso.preparacion = false;
      if (hayEspacio(paso,colocadas,1)) return paso;
    }
    const pedidos = new Set(historial.map(paso => paso.id));
    const trasLaAcera = (px,py) => py >= 158 && py <= centro-borde-8;
    const piezasBajas = ['rocas','pelota','flores','arbusto','banco','bicicleta'];
    const [primerComercio,segundoComercio] = ronda.comercios;
    const orden = ['semaforo',primerComercio,ronda.vehiculo,ronda.edificio,segundoComercio,...ronda.orden];
    for (const id of new Set(orden)) {
      if (escena.esObra(id) || pedidos.has(id)) continue;
      const tamano = ronda.tamanosPieza[id];
      const objeto = sustantivo(id,false,tamano);
      let paso;
      if (id === 'semaforo') {
        paso = pasoUrbano(reto,id,par('Pon un semáforo en una acera, cerca del paso peatonal.',
          'Put a traffic light on a sidewalk near the crosswalk.'), (px,py) => cercaDelCruce(px) && enAcera(py));
      } else if (vehiculos.includes(id)) {
        paso = pasoUrbano(reto,id,par('Coloca '+objeto.es+' en la calle y deja libre el paso peatonal.',
          'Place '+objeto.en+' on the road and keep the crosswalk clear.'), (px,py,x,z) =>
          Math.abs(py-centro) <= mitad-7 && libreDeCruces(px,escena.semiAnchoEnEscena(id,x,z,reto.terreno,tamano)+6),
          undefined,tamano);
      } else {
        const edificio = escena.esEdificio(id);
        const verbo = par('Coloca','Place');
        paso = edificio ? instruccionPaisaje(reto,id,null,null,1,verbo,ronda.pisosEdificio) :
          piezasBajas.includes(id) ? pasoUrbano(reto,id,par('Coloca '+objeto.es+' en el césped, lejos de la calle.',
            'Place '+objeto.en+' on the grass, away from the road.'), (px,py) => trasLaAcera(px,py) || py >= centro+borde+40,undefined,tamano) :
          pasoUrbano(reto,id,par('Coloca '+objeto.es+' en el césped, detrás de la acera de arriba.',
            'Place '+objeto.en+' on the grass behind the top sidewalk.'), trasLaAcera,undefined,tamano);
        if (edificio) {
          const zonaEdificio = paso.zona;
          paso.texto = par('Construye '+objeto.es+' de '+paso.pisos+' pisos. Coloca el primer piso detrás de la acera de arriba.',
            'Build '+objeto.en+' with '+paso.pisos+' floors. Place the first floor behind the top sidewalk.');
          paso.correccion = paso.texto;
          paso.zona = (x,z) => zonaEdificio(x,z) && trasLaAcera(...escena.proyectar(x,z));
        }
      }
      if (hayEspacio(paso,colocadas,1)) return paso;
    }
  }
  function crearRondaPaisaje(reto, inicio) {
    const familias = barajar(reto.objetos.filter(id => piezasConTamano.has(id)));
    const ordenTamanos = barajar(tamanos);
    const ronda = {
      orden: [inicio,...barajar(reto.objetos.filter(id => id !== inicio))],
      verbos: barajar(verbos),
      tipos: barajar(['relacion','superficie','grupo','relacion','orilla','relacion']),
      direcciones: barajar(Object.keys(relacion)),
      turnoBarco: ['rio','lago'].includes(reto.terreno) ? 1 + Math.floor(Math.random() * 2) : Infinity,
      turnoRelieve: reto.terreno === 'campamento' ? 1 + Math.floor(Math.random() * 2) : Infinity,
      pisosEdificio: 2 + Math.floor(Math.random() * 3),
      tamanosPieza:Object.fromEntries(familias.map((id,i) => [id,ordenTamanos[i%ordenTamanos.length]])),
      ladosRio: reto.terreno === 'rio-central' ? barajar(['izquierda-rio','derecha-rio']) : null,
      practicarCaja: reto.terreno === 'parque' && Math.random() < .55
    };
    if (reto.terreno === 'calle-nueva') {
      ronda.ladosAcera = barajar([-1,1]);
      ronda.comercios = barajar(['tienda-barrio','taller']);
      ronda.vehiculo = barajar(vehiculos)[0];
      ronda.edificio = barajar(['apartamentos','oficinas'])[0];
    }
    return ronda;
  }

  function siguientePaisaje(reto, colocadas, historial, ronda) {
    if (reto.terreno === 'calle-nueva') return siguienteCalle(reto,colocadas,historial,ronda);
    const {orden,tipos,direcciones,turnoBarco,turnoRelieve,pisosEdificio,tamanosPieza} = ronda;
    const indice = historial.length;
    const verbo = ronda.verbos[indice % ronda.verbos.length];
    const usados = new Set(historial.map(paso => paso.id));
    const candidatos = orden.filter(id => !usados.has(id));
    const sinTamano = !historial.some(paso => paso.tamano);
    const anclas = barajar(colocadas.filter(a => !a.contenedor &&
      colocadas.filter(b => a.id === b.id).length === 1));
    anclas.sort((a,b) => Number(a === historial.at(-1)?.ancla) - Number(b === historial.at(-1)?.ancla));
    const mejor = (id,a,tipo,cantidad=1) => {
      const paso = instruccionPaisaje(reto,id,a,tipo,cantidad,verbo,
        escena.esEdificio(id) ? pisosEdificio : undefined,
        cantidad === 1 && tipo !== 'dentro' && tipo !== 'fuera' ? tamanosPieza[id] : undefined);
      if (a && tipo !== 'dentro' && malla.filter(({x,z}) => posicionValida(paso,x,z,colocadas)).length < 5) return null;
      return hayEspacio(paso,colocadas,cantidad) ? paso : null;
    };
    if (ronda.ladosRio) {
      if (indice === 0) return mejor('rio');
      const turno = indice - 1;
      if (turno >= 2 && !usados.has('puente')) {
        const puente = mejor('puente');
        if (puente) return puente;
      }
      if (turno >= 3 && !usados.has('barco')) {
        const barco = mejor('barco');
        if (barco) return barco;
      }
      const piezasOrilla = sinTamano ? [...candidatos].sort((a,b) => Boolean(tamanosPieza[b])-Boolean(tamanosPieza[a])) : candidatos;
      for (const offset of [0,1]) for (const id of piezasOrilla) {
        if (sueloPieza(id,reto) !== reto.suelo) continue;
        const paso = mejor(id,null,ronda.ladosRio[(turno+offset)%2]);
        if (paso) return paso;
      }
    }
    if (sinTamano && (indice === 2 || (indice === 1 && turnoBarco === 2))) {
      for (const id of candidatos.filter(id => tamanosPieza[id])) {
        const paso = mejor(id);
        if (paso) return paso;
      }
    }
    if (indice >= turnoBarco && !usados.has('barco')) {
      const paso = mejor('barco',null,tipos[(indice - 1) % tipos.length] === 'orilla' ? 'orilla' : null) ||
        mejor('barco');
      if (paso) return paso;
    }
    if (indice >= turnoRelieve && !historial.some(paso => relieve.has(paso.id))) {
      for (const id of candidatos.filter(id => relieve.has(id))) {
        const paso = mejor(id);
        if (paso) return paso;
      }
    }
    if (indice === 0) return mejor(orden[0]) || candidatos.map(id => mejor(id)).find(Boolean);
    if (indice === 1 && !historial.some(paso => paso.pisos)) {
      const edificio = candidatos.find(escena.esEdificio);
      const paso = edificio && mejor(edificio);
      if (paso) return paso;
    }
    if (indice === 1 && ronda.practicarCaja && !usados.has('caja')) {
      const paso = mejor('caja');
      if (paso) return paso;
    }

    const perfil = tipos[(indice - 1) % tipos.length];
    const recurrencias = tipo => historial.filter(paso => paso.tipo === tipo).length;
    const variacion = [...direcciones].sort((a,b) => recurrencias(a) - recurrencias(b));
    // Antes del turno reservado para el barco, deja el agua libre para su casco.
    const disponibles = indice < turnoBarco && Number.isFinite(turnoBarco) && !usados.has('barco') ?
      candidatos.filter(id => id !== 'pato') : candidatos;
    function relacionado(ids, cantidad = 1, referencias = anclas, posiciones = variacion) {
      for (const tipo of posiciones) for (const a of referencias) for (const id of ids) {
        if (sueloPieza(a.id,reto) !== sueloPieza(id,reto)) continue;
        if (tipo === 'dentro' || tipo === 'fuera') {
          if (!contenedores.has(a.id) || !cabeDentro(id,a)) continue;
        }
        const paso = mejor(id,a,tipo,cantidad);
        if (paso) return paso;
      }
    }
    const caja = anclas.find(a => a.id === 'caja');
    if (caja && !historial.some(paso => paso.ancla === caja)) {
      const posiciones = variacion.filter(tipo => referenciasCaja.includes(tipo));
      const paso = relacionado(disponibles,1,[caja],posiciones);
      if (paso) return paso;
    }
    const lago = anclas.find(a => a.id === 'lago-pieza');
    if (lago && disponibles.includes('sapo') && !historial.some(paso => paso.ancla === lago)) {
      const paso = mejor('sapo',lago,'dentro') || mejor('sapo',lago,'cerca');
      if (paso) return paso;
    }

    if (perfil === 'grupo') {
      const grupos = disponibles.filter(id => cantidades[id]);
      const cantidad = Math.random() < .5 ? 2 : 3;
      const paso = relacionado(grupos,cantidad);
      if (paso) return paso;
      for (const id of grupos) {
        const abierto = mejor(id,null,null,cantidad);
        if (abierto) return abierto;
      }
    }
    if (perfil === 'orilla' && orillas[reto.terreno]) {
      for (const id of disponibles) {
        if (sueloPieza(id,reto) === 'cielo') continue;
        const paso = mejor(id,null,'orilla');
        if (paso) return paso;
      }
    }
    if (perfil === 'relacion' || perfil === 'grupo') {
      const paso = relacionado(disponibles);
      if (paso) return paso;
    }
    for (const id of disponibles) {
      const paso = mejor(id);
      if (paso) return paso;
    }
    // Conserva una salida jugable cuando el estudiante ha llenado parte del terreno.
    for (const id of orden) {
      const paso = mejor(id);
      if (paso) return paso;
    }
  }
  window.RetosConstruccion = {piezas, bloques, paisajes, zonaTablero, piezaEnEspacioLibre, admite, barajar,tamanos,nombrePieza,
    crearRondaPaisaje, siguientePaisaje};
})();
