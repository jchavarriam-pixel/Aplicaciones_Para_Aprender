/* Coordenadas de cliente y preferencias seguras compartidas por Matemática. */
window.Matematicas = {
 almacen:{getItem(k){try{return localStorage.getItem(k)}catch{return null}},setItem(k,v){try{localStorage.setItem(k,v)}catch{}},removeItem(k){try{localStorage.removeItem(k)}catch{}}},
 leer(clave, defecto={}) {try{return JSON.parse(localStorage.getItem(clave))||defecto;}catch{return defecto;}},
 guardar(clave, valor) {try{localStorage.setItem(clave,JSON.stringify(valor));}catch{}},
 escala() {return parseFloat(getComputedStyle(document.body).zoom)||1;},
 fantasma(el,x,y) {
  const z=this.escala();
  el.style.transition='none';el.style.animation='none';el.style.margin='0';
  el.style.zoom=String(1/z);
  el.style.left=x+'px';el.style.top=y+'px';
  el.style.transform='translate(-50%,-50%)';
 },
 pantalla(root,ajustar) {
  let frame=0;
  const fit=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const z=this.escala(),h=(visualViewport?.height||innerHeight)/z;
   root.style.setProperty('--alto-util',h+'px');
   root.classList.toggle('horizontal',innerWidth>innerHeight);
   ajustar?.(h,z);
  });};
  addEventListener('resize',fit);document.addEventListener('fullscreenchange',fit);
  visualViewport?.addEventListener('resize',fit);
  new MutationObserver(fit).observe(document.body,{attributes:true,attributeFilter:['style']});
  fit();return fit;
 }
};
Object.assign(window.TEXTOS_INGLES||={}, {
 'Volver al menú':'Back to menu','Leer instrucción':'Read instruction','Antecesor & sucesor del número':'Previous & next numbers',
 'Acomoda los números en la tabla de valor posicional: UM | C | D | U, según corresponda. También arrastra el signo correcto. Luego resuelve en la misma tabla.':'Place the digits in the place-value table: Th | H | T | O. Drag the correct sign too. Then solve the calculation in the same table.',
 'Sumas y Restas - Versión personalizada':'Addition and subtraction - Custom practice',
 'Encabezado de la aplicación':'Application header','Pistas para resolver':'Problem hints','Acciones del problema':'Problem actions','Opciones de respuesta':'Answer choices','Menú de situaciones problema':'Word problem menu','Situación problema seleccionada':'Selected word problem','Animación de la situación problema':'Word problem animation','Planteamiento de la operación':'Build the calculation','Teclado para arrastrar':'Draggable keypad','Más':'Plus',
 'Usa una pista si necesitas ayuda para decidir si se suma o se resta.':'Use a hint if you need help deciding whether to add or subtract.','Primero mira la animación y luego escoge la respuesta.':'First watch the animation, then choose the answer.',
 'Tipo de respuesta':'Answer type','Modelo tridimensional del sólido':'Three-dimensional model','Actividad de pareo de sólidos':'Solid matching activity','Sólido 3D: arrastre aquí para girar':'3D solid: drag here to rotate','Pareo de cantidades':'Match amounts','¡Hola!':'Hello!','Pirámide':'Pyramid','Propiedad para este reto':'Property for this challenge','Número de caras':'Number of faces','Número de aristas':'Number of edges','Número de vértices':'Number of vertices','Cantidad de figuras:':'Number of shapes:','Nota didáctica:':'Teaching note:',
 'para esta actividad, las superficies curvas del cilindro, cono y esfera se cuentan como caras. Así, el cilindro tiene 3 caras o superficies, el cono 2 y la esfera 1.':'In this activity, curved surfaces of the cylinder, cone and sphere count as faces. The cylinder has 3 faces or surfaces, the cone has 2 and the sphere has 1.',
 'Arrastre el sólido con el dedo o el cursor para girarlo.':'Drag the solid with your finger or pointer to rotate it.','Medidas del sólido':'Solid dimensions','Modo práctica: puedes configurar cada tipo de ayuda por separado.':'Practice mode: you can configure each kind of help separately.'
});
for(let i=0;i<10;i++)window.TEXTOS_INGLES['Dígito '+i]='Digit '+i;
