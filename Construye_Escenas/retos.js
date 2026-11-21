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
  const paisaje = (id, zona, es, en) => ({id, zona, texto: par(es, en)});
  const zona = (izquierda, derecha, fondo, frente) => (x, z) => x >= izquierda && x <= derecha && z >= fondo && z <= frente;
  const cerca = (indice, direccion = '') => (x, z, piezas) => {
    const referencia = piezas[indice];
    const dx = x - referencia.x, dz = z - referencia.z;
    const distancia = Math.hypot(dx, dz * .72);
    return distancia >= .12 && distancia <= .26 &&
      (direccion !== 'frente' || dz >= .13) &&
      (direccion !== 'fondo' || dz <= -.13) &&
      (direccion !== 'izquierda' || dx <= -.12);
  };
  const y = (...reglas) => (x, z, piezas) => reglas.every(regla => regla(x, z, piezas));

  const bloques = [
    {nombre: par('Torre de dos colores', 'Two-colour tower'), pasos: [
      bloque('rectangulo-rojo', 380, [], 'Pon un rectángulo rojo en el centro, sobre el suelo.', 'Put a red rectangle on the ground in the middle.'),
      bloque('cuadrado-azul', 380, [0], 'Pon un cuadrado azul sobre el rectángulo rojo.', 'Put a blue square on top of the red rectangle.'),
      bloque('cuadrado-rojo', 380, [1], 'Pon un cuadrado rojo sobre el cuadrado azul.', 'Put a red square on top of the blue square.'),
      bloque('triangulo-azul', 380, [2], 'Termina la torre con un triángulo azul encima.', 'Finish the tower with a blue triangle on top.')
    ]},
    {nombre: par('El puente amarillo', 'The yellow bridge'), pasos: [
      bloque('cuadrado-verde', 327, [], 'Pon un cuadrado verde un poco a la izquierda del centro.', 'Put a green square a little left of the middle.'),
      bloque('cuadrado-azul', 433, [], 'Pon un cuadrado azul un poco a la derecha del centro, sobre el suelo.', 'Put a blue square on the ground a little right of the middle.'),
      bloque('rectangulo-amarillo', 380, [0, 1], 'Pon un rectángulo amarillo encima de los dos cuadrados, como un puente.', 'Put a yellow rectangle across both squares like a bridge.'),
      bloque('triangulo-rojo', 380, [2], 'Pon un triángulo rojo en el centro del puente.', 'Put a red triangle in the middle of the bridge.')
    ]},
    {nombre: par('Escalera de colores', 'Colourful staircase'), pasos: [
      bloque('cuadrado-verde', 244, [], 'Pon un cuadrado verde a la izquierda, sobre el suelo.', 'Put a green square on the ground on the left.'),
      bloque('cuadrado-verde', 380, [], 'Pon otro cuadrado verde en el centro, sobre el suelo.', 'Put another green square on the ground in the middle.'),
      bloque('cuadrado-verde', 516, [], 'Pon un cuadrado verde a la derecha, sobre el suelo.', 'Put a green square on the ground on the right.'),
      bloque('cuadrado-azul', 380, [1], 'Pon un cuadrado azul encima del cuadrado verde del centro.', 'Put a blue square above the green square in the middle.'),
      bloque('cuadrado-azul', 516, [2], 'Pon otro cuadrado azul encima del cuadrado verde de la derecha.', 'Put another blue square above the green square on the right.'),
      bloque('cuadrado-amarillo', 516, [4], 'Completa el escalón más alto con un cuadrado amarillo.', 'Finish the tallest step with a yellow square.')
    ]},
    {nombre: par('Dos casitas', 'Two little houses'), pasos: [
      bloque('cuadrado-rojo', 245, [], 'Para la primera casa, pon un cuadrado rojo a la izquierda.', 'Start the first house by putting a red square on the left.'),
      bloque('triangulo-amarillo', 245, [0], 'Pon un triángulo amarillo sobre el cuadrado rojo, como techo.', 'Put a yellow triangle on top of the red square for the roof.'),
      bloque('cuadrado-azul', 515, [], 'Para la segunda casa, pon un cuadrado azul a la derecha.', 'Start the second house by putting a blue square on the right.'),
      bloque('triangulo-verde', 515, [2], 'Pon un triángulo verde sobre el cuadrado azul.', 'Put a green triangle on top of the blue square.')
    ]},
    {nombre: par('El cohete en la plataforma', 'Rocket on the launch pad'), pasos: [
      bloque('rectangulo-verde', 380, [], 'Pon un rectángulo verde en el centro del suelo. Esa será la plataforma.', 'Put a green rectangle in the middle of the ground. That will be the launch pad.'),
      bloque('cuadrado-amarillo', 380, [0], 'Pon un cuadrado amarillo en el centro de la plataforma.', 'Put a yellow square in the middle of the launch pad.'),
      bloque('cuadrado-amarillo', 380, [1], 'Pon otro cuadrado amarillo encima del primero.', 'Put another yellow square on top of the first one.'),
      bloque('triangulo-rojo', 380, [2], 'Pon un triángulo rojo encima, como la punta de un cohete.', 'Put a red triangle on top for the tip of the rocket.')
    ]}
  ];
  const paisajes = [
    {nombre: par('Una tarde junto al río', 'An afternoon by the river'), terreno: 'rio', pasos: [
      paisaje('fuente', zona(.66, .9, .36, .72), 'Pon una fuente a la derecha del río.', 'Put a fountain on the right side of the river.'),
      paisaje('pato', zona(.08, .22, .3, .85), 'Pon un pato en el río, a la izquierda.', 'Put a duck in the river on the left.'),
      paisaje('nino', zona(.35, .59, .55, .81), 'Pon un niño en el césped, entre el río y la fuente.', 'Put a boy on the grass between the river and the fountain.'),
      paisaje('pelota', y(cerca(2), zona(.31, .72, .29, .94)), 'Pon una pelota cerca del niño para que pueda jugar.', 'Put a ball near the boy so he can play.'),
      paisaje('arbol', y(cerca(0, 'fondo'), zona(.6, .94, .1, .59)), 'Pon un árbol detrás de la fuente.', 'Put a tree behind the fountain.')
    ]},
    {nombre: par('Paseo por el parque', 'A walk in the park'), terreno: 'parque', pasos: [
      paisaje('fuente', zona(.42, .59, .37, .62), 'Pon una fuente en el centro del parque.', 'Put a fountain in the middle of the park.'),
      paisaje('banco', zona(.13, .32, .4, .72), 'Pon un banco a la izquierda de la fuente.', 'Put a bench to the left of the fountain.'),
      paisaje('arbol', y(cerca(1, 'fondo'), zona(.09, .4, .1, .57)), 'Pon un árbol detrás del banco.', 'Put a tree behind the bench.'),
      paisaje('nina', zona(.68, .89, .57, .87), 'Pon una niña a la derecha de la fuente, cerca del frente.', 'Put a girl to the right of the fountain, near the front.'),
      paisaje('flores', y(cerca(0, 'frente'), zona(.31, .68, .53, .93)), 'Pon unas flores delante de la fuente.', 'Put some flowers in front of the fountain.')
    ]},
    {nombre: par('Un día de playa', 'A day at the beach'), terreno: 'playa', pasos: [
      paisaje('sombrilla', zona(.65, .87, .44, .71), 'Pon una sombrilla en la arena, a la derecha.', 'Put a beach umbrella on the sand on the right.'),
      paisaje('barco', zona(.07, .26, .24, .72), 'Pon un barco en el mar, a la izquierda.', 'Put a boat in the sea on the left.'),
      paisaje('castillo', y(cerca(0, 'frente'), zona(.54, .93, .57, .94)), 'Pon un castillo de arena delante de la sombrilla.', 'Put a sandcastle in front of the beach umbrella.'),
      paisaje('pelota', zona(.37, .52, .51, .83), 'Pon una pelota en la arena, a la izquierda de la sombrilla.', 'Put a ball on the sand to the left of the beach umbrella.')
    ]},
    {nombre: par('La casa de la granja', 'The farmhouse'), terreno: 'granja', pasos: [
      paisaje('casa', zona(.19, .39, .21, .44), 'Pon una casa al fondo de la granja, a la izquierda.', 'Put a house at the back of the farm on the left.'),
      paisaje('arbol', zona(.67, .86, .27, .62), 'Pon un árbol a la derecha de la casa.', 'Put a tree to the right of the house.'),
      paisaje('conejo', y(cerca(1, 'frente'), zona(.6, .92, .39, .94)), 'Pon un conejo delante del árbol.', 'Put a rabbit in front of the tree.'),
      paisaje('banco', y(cerca(0, 'frente'), zona(.11, .44, .36, .78)), 'Pon un banco delante de la casa.', 'Put a bench in front of the house.'),
      paisaje('flores', zona(.43, .56, .59, .88), 'Pon unas flores en el centro, cerca del frente.', 'Put some flowers in the middle near the front.')
    ]},
    {nombre: par('Campamento entre montañas', 'Mountain campsite'), terreno: 'campamento', pasos: [
      paisaje('tienda', zona(.63, .86, .25, .47), 'Pon una tienda de campaña al fondo, a la derecha.', 'Put a tent at the back on the right.'),
      paisaje('arbol', zona(.15, .36, .24, .49), 'Pon un árbol al fondo, a la izquierda.', 'Put a tree at the back on the left.'),
      paisaje('fogata', y(cerca(0, 'frente'), zona(.55, .92, .4, .81)), 'Pon una fogata delante de la tienda.', 'Put a campfire in front of the tent.'),
      paisaje('conejo', y(cerca(1, 'frente'), zona(.11, .42, .39, .83)), 'Pon un conejo delante del árbol.', 'Put a rabbit in front of the tree.'),
      paisaje('nina', zona(.43, .54, .65, .9), 'Pon una niña cerca del frente, entre el conejo y la fogata.', 'Put a girl near the front, between the rabbit and the campfire.')
    ]}
  ];
  window.RetosConstruccion = {piezas, bloques, paisajes};
})();
