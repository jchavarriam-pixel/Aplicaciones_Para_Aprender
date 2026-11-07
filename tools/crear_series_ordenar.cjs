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
const palettes={morado:['#c6a4f4','#8554c5','#4a2d79'],azul:['#9cd9fa','#4298d0','#24527d'],verde:['#ace4c0','#55ad86','#286a50'],naranja:['#ffe0a1','#edab48','#946027'],rosa:['#fac4d9','#d779a7','#874366']};
const round=n=>+n.toFixed(3);
function svg(contenido,p='azul'){
 const [light,main,dark]=palettes[p];
 return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="color" x2="1" y2="0"><stop stop-color="${main}"/><stop offset=".25" stop-color="${light}"/><stop offset=".65" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="plano" x2="0" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${main}"/></linearGradient></defs><g stroke="${dark}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${contenido}</g></svg>`;
}
function cilindro(w,h,p,detalle){const x=300-w/2,y=365-h,ry=10;const extra=detalle==='vela'?`<path d="M300 ${y-3}v-19" stroke="#625362" stroke-width="5"/>`:detalle==='marcador'?`<path d="M${x} ${y+53}Q300 ${y+53+ry*2} ${x+w} ${y+53}" fill="none" stroke-width="7"/><path d="M${x+w*.76} ${y+12}v28" stroke-width="7"/>`:'';return svg(`<path d="M${x} ${y}H${x+w}V${365-ry}A${w/2} ${ry} 0 0 1 ${x} ${365-ry}Z" fill="url(#color)"/><ellipse cx="300" cy="${y}" rx="${w/2}" ry="${ry}" fill="url(#plano)"/><path d="M${x+w*.22} ${y+20}V${340-ry}" stroke="white" stroke-opacity=".65" stroke-width="7"/>${extra}`,p);}
function barra(w,h,p,clase){const x=300-w/2,y=365-h;let detail='';if(clase==='regla'){for(let k=20;k<w-10;k+=24)detail+=`<path d="M${x+k} ${y+2}v${Math.round(k/24)%2?18:29}" stroke-width="3"/>`;}else detail=`<path d="M${x+12} ${y+14}H${x+w-12}" stroke="white" stroke-opacity=".6" stroke-width="6"/>`;return svg(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${clase==='regla'?8:18}" fill="url(#plano)"/>${detail}`,p);}
function lapiz(largo,angulo,p){const x=300,y=365;return svg(`<g transform="rotate(${angulo} ${x} ${y})"><path d="M286 ${y-18}V${y-largo+40}L300 ${y-largo}L314 ${y-largo+40}V${y-18}Z" fill="url(#color)"/><path d="M286 ${y-largo+40}L300 ${y-largo}L314 ${y-largo+40}Z" fill="#f5d6a5"/><path d="M295 ${y-largo+13}L300 ${y-largo}L305 ${y-largo+13}Z" fill="#4b5264" stroke="#4b5264" stroke-width="2"/><path d="M292 ${y-largo+49}V${y-29}" stroke="white" stroke-opacity=".55" stroke-width="4"/><rect x="286" y="${y-25}" width="28" height="25" rx="7" fill="#f4bdcf"/></g>`,p);}
function poligono(n,p){const points=Array.from({length:n},(_,i)=>({x:300+150*Math.cos(-Math.PI/2+2*Math.PI*i/n),y:150*Math.sin(-Math.PI/2+2*Math.PI*i/n)})),base=Math.max(...points.map(p=>p.y));return svg(`<polygon points="${points.map(p=>`${round(p.x)},${round(365-base+p.y)}`).join(' ')}" fill="url(#plano)"/>`,p);}
function puerta(w,p){const x=300-w/2;return svg(`<rect x="${x}" y="95" width="${w}" height="270" rx="8" fill="url(#plano)"/><path d="M${x+14} 365V110H${x+w-14}V365" fill="none" stroke-width="7"/><circle cx="${x+w-32}" cy="247" r="7" fill="#fff0b6"/>`,p);}
function edificio(h,p){const top=365-h;let windows='';for(let y=top+25;y<345;y+=48)windows+=`<rect x="270" y="${y}" width="22" height="25" rx="3" fill="#eaf8ff" stroke-width="3"/><rect x="308" y="${y}" width="22" height="25" rx="3" fill="#eaf8ff" stroke-width="3"/>`;return svg(`<rect x="250" y="${top}" width="100" height="${h}" rx="7" fill="url(#plano)"/>${windows}`,p);}
function inclinacion(a,p,clase){if(clase==='lapiz')return lapiz(260,a,p);return svg(`<path d="M120 390H560" stroke="#b1c6d6" stroke-width="4"/><g transform="rotate(${a} 290 362)"><rect x="${clase==='tabla'?266:277}" y="102" width="${clase==='tabla'?48:26}" height="260" rx="10" fill="url(#color)"/><path d="M${clase==='tabla'?280:285} 119V343" stroke="white" stroke-opacity=".55" stroke-width="5"/></g>`,p);}
const series=[
 ['tubos','Tubos morados','grosor','morado',(r,p)=>cilindro(144-r*21,270,p)],
 ['velas','Velas naranjas','grosor','naranja',(r,p)=>cilindro(140-r*20,260,p,'vela')],
 ['marcadores','Marcadores azules','grosor','azul',(r,p)=>cilindro(132-r*18,280,p,'marcador')],
 ['cintas','Cintas verdes','longitud','verde',(r,p)=>barra(500-r*74,70,p)],
 ['reglas','Reglas naranjas','longitud','naranja',(r,p)=>barra(500-r*74,75,p,'regla')],
 ['barras','Barras moradas','longitud','morado',(r,p)=>barra(500-r*74,70,p)],
 ...[['azules',210],['violetas',275],['verdes',150],['naranjas',35]].map(([nombre,hue])=>['tonos-'+nombre,'Tonos '+nombre,'tono','azul',r=>`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><circle cx="300" cy="220" r="145" fill="hsl(${hue} 65% ${22+r*12}%)" stroke="#51647b" stroke-width="4"/></svg>`]),
 ['postes','Postes azules','inclinacion','azul',(r,p)=>inclinacion(65-r*13,p,'poste')],
 ['tablas','Tablas verdes','inclinacion','verde',(r,p)=>inclinacion(65-r*13,p,'tabla')],
 ['lapices','Lápices morados','inclinacion','morado',(r,p)=>inclinacion(65-r*13,p,'lapiz')],
 ...['naranja','azul','morado'].map(p=>['poligonos-'+p,'Figuras '+{naranja:'naranjas',azul:'azules',morado:'moradas'}[p],'lados',p,(r,p)=>poligono(8-r,p)]),
 ['edificios','Edificios azules','altura','azul',(r,p)=>edificio(300-r*43,p)],
 ['torres','Torres moradas','altura','morado',(r,p)=>barra(105,300-r*43,p)],
 ['columnas','Columnas verdes','altura','verde',(r,p)=>cilindro(115,300-r*43,p)],
 ['puertas','Puertas naranjas','anchura','naranja',(r,p)=>puerta(360-r*46,p)],
 ['paneles','Paneles azules','anchura','azul',(r,p)=>barra(420-r*56,250,p)],
 ['carteles','Carteles rosados','anchura','rosa',(r,p)=>barra(420-r*56,250,p)]
];
const ventanas={grosor:[200,55,200,340],longitud:[25,255,550,140],tono:[120,45,360,350],inclinacion:[100,65,480,335],lados:[120,45,360,350],altura:[210,45,180,350],anchura:[60,65,480,330]};
for(const [id,nombre,criterio,p,draw] of series){const imagenes=[];for(let rank=0;rank<6;rank++){const file=`${id}-${rank}.svg`,v=ventanas[criterio];const image=draw(rank,p).replace('width="600" height="420" viewBox="0 0 600 420"',`width="${v[2]}" height="${v[3]}" viewBox="${v.join(' ')}"`);fs.writeFileSync(path.join(out,file),image);imagenes.push('imagenes/series/'+file);}familias.push({id,nombre,criterio,imagenes});}
fs.writeFileSync(path.join(app,'series.js'),'// Generado por tools/crear_series_ordenar.cjs. Rango 0 = valor mayor.\nwindow.ORDENAR_CRITERIOS = '+JSON.stringify(criterios,null,2)+';\nwindow.ORDENAR_FAMILIAS = '+JSON.stringify(familias,null,2)+';\n');
console.log(`${criterios.length} criterios, ${familias.length} familias, ${series.length*6} imágenes SVG con márgenes comunes.`);
