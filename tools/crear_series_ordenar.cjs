/* Series vectoriales con márgenes comunes. Cada serie cambia una sola propiedad. */
const fs=require('fs'),path=require('path');
const app=path.resolve(__dirname,'../Ordenar_Objetos_Tamano'),out=path.join(app,'imagenes/series');
fs.mkdirSync(out,{recursive:true});
const criterios=[
 {id:'tamano',nombre:'Tamaño',desc:'Del más grande al más pequeño',asc:'Del más pequeño al más grande',inicio:'Grande',fin:'Pequeño'},
 {id:'grosor',nombre:'Grosor',desc:'Del más grueso al más delgado',asc:'Del más delgado al más grueso',inicio:'Grueso',fin:'Delgado'},
 {id:'longitud',nombre:'Longitud',desc:'Del más largo al más corto',asc:'Del más corto al más largo',inicio:'Largo',fin:'Corto'},
 {id:'tono',nombre:'Tono de color',desc:'Del más oscuro al más claro',asc:'Del más claro al más oscuro',inicio:'Oscuro',fin:'Claro'},
 {id:'inclinacion',nombre:'Inclinación',desc:'Del más inclinado al más derecho',asc:'Del más derecho al más inclinado',inicio:'Inclinado',fin:'Derecho'},
 {id:'lados',nombre:'Número de lados',desc:'De más lados a menos lados',asc:'De menos lados a más lados',inicio:'Más lados',fin:'Menos lados'},
 {id:'altura',nombre:'Altura',desc:'Del más alto al más bajo',asc:'Del más bajo al más alto',inicio:'Alto',fin:'Bajo'},
 {id:'anchura',nombre:'Anchura',desc:'Del más ancho al más estrecho',asc:'Del más estrecho al más ancho',inicio:'Ancho',fin:'Estrecho'}
];
const familias=[['pelota','Pelotas'],['taza','Tazas'],['manzana','Manzanas'],['mochila','Mochilas'],['peluche','Osos de peluche'],['botella','Botellas']].map(([id,nombre])=>({id,nombre,criterio:'tamano',archivo:`imagenes/${id}.webp`}));
const {series,ventanas}=require('./ilustraciones_ordenar.cjs');
for(const [id,nombre,criterio,p,draw] of series){const imagenes=[];for(let rank=0;rank<6;rank++){const file=`${id}-${rank}.svg`,v=ventanas[criterio];const image=draw(rank,p).replace('width="600" height="420" viewBox="0 0 600 420"',`width="${v[2]}" height="${v[3]}" viewBox="${v.join(' ')}"`);fs.writeFileSync(path.join(out,file),image);imagenes.push('imagenes/series/'+file);}familias.push({id,nombre,criterio,imagenes,version:'20261107-ilustraciones-2'});}
fs.writeFileSync(path.join(app,'series-vectoriales.js'),'// Generado por tools/crear_series_ordenar.cjs. Rango 0 = valor mayor.\nwindow.ORDENAR_CRITERIOS = '+JSON.stringify(criterios,null,2)+';\nwindow.ORDENAR_FAMILIAS = '+JSON.stringify(familias,null,2)+';\n');
console.log(`${criterios.length} criterios, ${familias.length} familias, ${series.length*6} imágenes SVG con márgenes comunes.`);
