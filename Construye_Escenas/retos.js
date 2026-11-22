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

  const femeninos = new Set('fuente nina pelota flores casa sombrilla tienda fogata bicicleta cerca oveja vaca escuela nube'.split(' '));
  const variantes = [
    ['tobogan', 'Tobogán', 'Slide'], ['columpios', 'Columpios', 'Swing set'], ['trampolin', 'Trampolín', 'Trampoline'],
    ['bicicleta', 'Bicicleta', 'Bicycle'], ['casa-abierta', 'Casa abierta', 'Open house'], ['cerca', 'Cerca', 'Fence'],
    ['perro', 'Perro', 'Dog'], ['gato', 'Gato', 'Cat'], ['oveja', 'Oveja', 'Sheep'], ['vaca', 'Vaca', 'Cow'],
    ['pajaro', 'Pájaro', 'Bird'], ['caballo', 'Caballo', 'Horse'], ['escuela', 'Escuela', 'School'],
    ['sol', 'Sol', 'Sun'], ['nube', 'Nube', 'Cloud']
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

  const orillas = {
    rio: [168, 170, 154, 163, 191, 195, 187, 191],
    playa: [223, 181, 170, 179, 143, 80, 48, 0],
    lago: [367, 376, 359, 341, 339, 350, 354, 352, 343, 335]
  };
  function distanciaOrilla(terreno, x, z) {
    const muestras = orillas[terreno];
    const profundidadInicial = terreno === 'lago' ? .05 : .25;
    const fila = Math.max(0, Math.min(muestras.length - 1, (z - profundidadInicial) * 10));
    const indice = Math.min(muestras.length - 2, Math.floor(fila));
    const orilla = muestras[indice] + (muestras[indice + 1] - muestras[indice]) * (fila - indice);
    return EscenarioConstruccion.proyectar(x, z)[0] - orilla;
  }

  const lugar = {
    cesped: par('en el césped', 'on the grass'),
    arena: par('en la arena', 'on the sand'),
    calle: par('en la calle', 'on the road'),
    pavimento: par('en el pavimento', 'on the pavement'),
    rio: par('en el río', 'in the river'),
    playa: par('en el mar', 'in the sea'),
    lago: par('en el lago', 'in the lake'),
    cielo: par('en el cielo', 'in the sky')
  };
  const juegos = 'tobogan columpios trampolin';
  const animales = 'perro gato conejo oveja vaca caballo';
  const clima = 'sol nube pajaro';
  const basicos = 'nino nina banco arbol flores pelota bicicleta';
  const lista = (...grupos) => [...new Set(grupos.flatMap(grupo => grupo.split(' ')))];
  const paisajes = [
    {nombre: par('Una tarde junto al río', 'An afternoon by the river'), terreno: 'rio', suelo:'cesped',
      objetos: lista('nino pato nina fuente barco arbol casa-abierta cerca', basicos, animales, clima)},
    {nombre: par('Paseo por el parque', 'A walk in the park'), terreno: 'parque', suelo:'cesped',
      objetos: lista('nino arbol fuente casa-abierta cerca', juegos, basicos, animales, clima)},
    {nombre: par('Un día de playa', 'A day at the beach'), terreno: 'playa', suelo:'arena',
      objetos: lista('sombrilla barco castillo pato nino nina pelota banco bicicleta casa-abierta cerca perro gato arbol', clima)},
    {nombre: par('La casa de la granja', 'The farmhouse'), terreno: 'granja', suelo:'cesped',
      objetos: lista('casa-abierta vaca oveja caballo cerca casa arbol nino nina', basicos, animales, clima)},
    {nombre: par('Campamento entre montañas', 'Mountain campsite'), terreno: 'campamento', suelo:'cesped',
      objetos: lista('arbol tienda fogata nino nina cerca casa-abierta', basicos, animales, clima)},
    {nombre: par('El barrio', 'The neighbourhood'), terreno: 'barrio', suelo:'cesped',
      objetos: lista('casa-abierta bicicleta nino nina casa escuela fuente cerca', basicos, juegos, animales, clima, vehiculos.join(' '))},
    {nombre: par('La terminal', 'The transport terminal'), terreno: 'terminal', suelo:'pavimento',
      objetos: lista('autobus-rojo camion-azul carro-amarillo banco nino nina escuela bicicleta', vehiculos.join(' '), 'casa-abierta fuente arbol flores pelota cerca perro gato', clima)},
    {nombre: par('El recreo', 'Playtime'), terreno: 'recreo', suelo:'cesped',
      objetos: lista('tobogan columpios trampolin nina nino arbol escuela cerca casa-abierta', basicos, animales, clima)},
    {nombre: par('Una visita al lago', 'A visit to the lake'), terreno: 'lago', suelo:'cesped',
      objetos: lista('barco pato sombrilla tienda casa-abierta cerca fuente', basicos, animales, clima)}
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
  const contenedores = new Set(['casa-abierta','cerca']);
  const piezasDentro = ['nina','nino','pelota','perro','gato','conejo'];
  function interior(x, z, a) {
    if (a.id === 'cerca') return EscenarioConstruccion.dentroCerca(x,z,a);
    return a.id === 'casa-abierta' && EscenarioConstruccion.dentroCasa(x,z,a);
  }
  const dist = (x,z,a) => Math.hypot(x - a.x, (z - a.z) * .83);
  const sueloPieza = (id, reto) => clima.split(' ').includes(id) ? 'cielo' :
    ['barco','pato'].includes(id) ? reto.terreno :
    vehiculos.includes(id) && reto.terreno === 'barrio' ? 'calle' : reto.suelo;

  function superficie(x,z,suelo,reto,id) {
    if (x < .055 || x > .945) return false;
    if (suelo === 'cielo') return z >= -.54 && z <= -.36;
    if (z < .08 || z > (reto.terreno === 'barrio' ? .985 : .935)) return false;
    if (orillas[suelo]) {
      const margen = id === 'barco' ? EscenarioConstruccion.semiAnchoEnEscena(id,x,z,reto.terreno) : 0;
      return z >= .25 && distanciaOrilla(reto.terreno,x,z) <= -margen;
    }
    if (orillas[reto.terreno]) return distanciaOrilla(reto.terreno,x,z) >= 0;
    if (reto.terreno === 'barrio') {
      return suelo === 'calle' ? z >= .465 && z <= .765 : z >= .94 || z <= .403;
    }
    if (reto.terreno === 'parque') {
      const bordeSendero = .967 - .169 * Math.min(1, Math.max(0, (z - .29) / .68));
      return EscenarioConstruccion.proyectar(x,z)[0] / EscenarioConstruccion.ancho < bordeSendero;
    }
    return true;
  }

  const zonaTablero = (x,z) => x >= .035 && x <= .965 && z >= -.57 && z <= .99;
  function espacioDisponible(id, terreno, x, z, colocadas, contenedor) {
    if (!EscenarioConstruccion.objetoEnEscena(id,x,z,terreno)) return false;
    return colocadas.every(a => a === contenedor ||
      (contenedores.has(a.id) ? !interior(x,z,a) && dist(x,z,a) >= .095 :
        dist(x,z,a) >= (contenedor ? .05 : .088)));
  }
  function posicionValida(paso, x, z, colocadas) {
    return paso.zona(x,z) && espacioDisponible(paso.id,paso.terreno,x,z,colocadas,paso.contenedor);
  }
  function piezaEnEspacioLibre(id, reto, x, z, colocadas) {
    if (!zonaTablero(x,z)) return null;
    if (sueloPieza(id,reto) === 'cielo' ? z < -.54 || z > -.36 : z < .08) return null;
    const contenedor = piezasDentro.includes(id) && colocadas.find(a => interior(x,z,a));
    return espacioDisponible(id,reto.terreno,x,z,colocadas,contenedor) ?
      {id,x,z,contenedor: contenedor || null} : null;
  }

  const mallaPaisaje = {columnas: 23, filas: 19};
  const malla = Array.from({length: 22}, (_,i) => i + 1).flatMap(i =>
    [-10,-9,-8,-7, ...Array.from({length: 18}, (_,j) => j + 1), 19].map(j =>
      ({i,j,x:i / mallaPaisaje.columnas,z:j === 19 ? .966 : j / mallaPaisaje.filas})));
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

  function sustantivo(id, definido = false) {
    const {es,en} = piezas[id].nombre;
    const fem = femeninos.has(id);
    if (id === 'flores') return par(definido ? 'las flores' : 'unas flores', definido ? 'the flowers' : 'some flowers');
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
  function instruccionPaisaje(reto,id,a,tipo,cantidad,verbo) {
    const suelo = sueloPieza(id,reto);
    const plural = cantidades[id];
    const objeto = cantidad === 1 ? sustantivo(id) :
      par((cantidad === 2 ? 'dos ' : 'tres ') + plural.es, (cantidad === 2 ? 'two ' : 'three ') + plural.en);
    const ref = a && sustantivo(a.id,true);
    const [direccion, coincide] = relacion[tipo] || [];
    const sitio = ref ? par(direccion.es + (ref.es.startsWith('el ') ? ' del ' + ref.es.slice(3) : ' de ' + ref.es),
      direccion.en + ' ' + ref.en) : tipo === 'orilla' ? par(
      orillas[suelo] ? lugar[suelo].es + ', cerca de la orilla' : 'en tierra, cerca de la orilla',
      orillas[suelo] ? lugar[suelo].en + ', near the shore' : 'on land, near the shore'
    ) : lugar[suelo];
    const contenedor = tipo === 'dentro' ? a : null;
    const zona = (x,z) => superficie(x,z,suelo,reto,id) &&
      (tipo !== 'orilla' || Math.abs(distanciaOrilla(reto.terreno,x,z)) <= 94) && (!a || (
      coincide(x-a.x,z-a.z,EscenarioConstruccion.proyectar(x,z)[0] - EscenarioConstruccion.proyectar(a.x,a.z)[0],interior(x,z,a)) &&
      (tipo !== 'fuera' || a.id !== 'casa-abierta' || EscenarioConstruccion.visibleFueraDeCasa(id,x,z,a))
    ));
    return {id,cantidad,contenedor,tipo,terreno:reto.terreno,ancla:a,zona,
      correccion:par('Mueve la pieza ' + sitio.es + '.', 'Move the piece ' + sitio.en + '.'),
      texto:par(verbo.es + ' ' + objeto.es + ' ' + sitio.es + '.',
      verbo.en + ' ' + objeto.en + ' ' + sitio.en + '.')};
  }


  function barajar(lista) {
    const mezcla = [...lista];
    for (let i = mezcla.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mezcla[i],mezcla[j]] = [mezcla[j],mezcla[i]];
    }
    return mezcla;
  }
  function crearRondaPaisaje(reto, inicio) {
    return {
      orden: [inicio,...barajar(reto.objetos.filter(id => id !== inicio))],
      verbos: barajar(verbos),
      tipos: barajar(['relacion','superficie','grupo','relacion','orilla','relacion']),
      direcciones: barajar(Object.keys(relacion)),
      turnoBarco: ['rio','lago'].includes(reto.terreno) ? 1 + Math.floor(Math.random() * 2) : Infinity
    };
  }

  function siguientePaisaje(reto, colocadas, historial, ronda) {
    const {orden,tipos,direcciones,turnoBarco} = ronda;
    const indice = historial.length;
    const verbo = ronda.verbos[indice % ronda.verbos.length];
    const usados = new Set(historial.map(paso => paso.id));
    const candidatos = orden.filter(id => !usados.has(id));
    const anclas = barajar(colocadas.filter(a => !a.contenedor &&
      colocadas.filter(b => a.id === b.id).length === 1));
    anclas.sort((a,b) => Number(a === historial.at(-1)?.ancla) - Number(b === historial.at(-1)?.ancla));
    const mejor = (id,a,tipo,cantidad=1) => {
      const paso = instruccionPaisaje(reto,id,a,tipo,cantidad,verbo);
      if (a && tipo !== 'dentro' && malla.filter(({x,z}) => posicionValida(paso,x,z,colocadas)).length < 5) return null;
      return hayEspacio(paso,colocadas,cantidad) ? paso : null;
    };
    if (indice >= turnoBarco && !usados.has('barco')) {
      const paso = mejor('barco',null,tipos[(indice - 1) % tipos.length] === 'orilla' ? 'orilla' : null) ||
        mejor('barco');
      if (paso) return paso;
    }
    if (indice === 0) return mejor(orden[0]) || candidatos.map(id => mejor(id)).find(Boolean);

    const perfil = tipos[(indice - 1) % tipos.length];
    const recurrencias = tipo => historial.filter(paso => paso.tipo === tipo).length;
    const variacion = [...direcciones].sort((a,b) => recurrencias(a) - recurrencias(b));
    // Antes del turno reservado para el barco, deja el agua libre para su casco.
    const disponibles = indice < turnoBarco && Number.isFinite(turnoBarco) && !usados.has('barco') ?
      candidatos.filter(id => id !== 'pato') : candidatos;
    function relacionado(ids, cantidad = 1) {
      for (const tipo of variacion) for (const a of anclas) for (const id of ids) {
        if (sueloPieza(a.id,reto) !== sueloPieza(id,reto)) continue;
        if (tipo === 'dentro' || tipo === 'fuera') {
          if (!contenedores.has(a.id) || !piezasDentro.includes(id)) continue;
        }
        const paso = mejor(id,a,tipo,cantidad);
        if (paso) return paso;
      }
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
  window.RetosConstruccion = {piezas, bloques, paisajes, zonaTablero, piezaEnEspacioLibre, admite, barajar,
    crearRondaPaisaje, siguientePaisaje, mallaPaisaje, puntosPaisaje: malla};
})();
