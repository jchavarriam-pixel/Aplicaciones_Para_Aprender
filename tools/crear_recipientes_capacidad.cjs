/* Ilustraciones SVG didácticas: cuerpos de revolución con volumen definido.
   El nivel del agua se calcula por integración del área de cada sección.
   No requiere librerías externas. */
const fs=require('fs'),path=require('path');
const app=path.resolve(__dirname,'../Mayor_Menor_Objetos'),out=path.join(app,'imagenes/capacidad');
fs.mkdirSync(out,{recursive:true});
const perfiles={
  vaso:t=>.76+.24*t,
  taza:()=>1,
  jarra:t=>.84+.16*t,
  botella:t=>t<.63?1:t<.83?1-(t-.63)/.2*.58:.42,
  cuenco:t=>Math.sqrt(.22+.78*t),
  matraz:t=>t<.12?.7+t/.12*.3:t<.5?1:t<.78?1-(t-.5)/.28*.66:.34
};
function integral(tipo,h){const n=1024,dt=h/n,f=perfiles[tipo];let sum=0;for(let i=0;i<n;i++){const r=f((i+.5)*dt);sum+=r*r*dt;}return sum;}
function nivel(tipo,fraccion){if(fraccion<=0)return 0;if(fraccion>=1)return 1;const total=integral(tipo,1);let lo=0,hi=1;for(let i=0;i<34;i++){const mid=(lo+hi)/2;if(integral(tipo,mid)/total<fraccion)lo=mid;else hi=mid;}return(lo+hi)/2;}
const definiciones=[
  ['vasos','Vasos de tres tamaños',['vaso','vaso','vaso'],[300,600,900],[100,300,600],[7,12,18]],
  ['jarras','Jarras con distinta cantidad de agua',['jarra','jarra','jarra'],[400,800,1200],[300,200,600],[8,13,20]],
  ['botellas','Botellas altas y anchas',['botella','botella','botella'],[500,900,300],[400,200,100],[20,16,22]],
  ['formas','Un vaso, un cuenco y una botella',['vaso','cuenco','botella'],[300,800,600],[200,600,100],[18,6,20]],
  ['cuencos','Cuencos de distintas capacidades',['cuenco','cuenco','cuenco'],[400,1000,700],[100,200,500],[5,8,6]],
  ['lleno-parcial','Lleno y parcialmente llenos',['jarra','vaso','botella'],[1200,300,700],[200,300,400],[16,10,24]],
  ['aberturas','Recipientes de formas diferentes',['vaso','matraz','jarra'],[400,900,600],[200,300,100],[14,18,12]],
  ['tazas','Tazas de tres capacidades',['taza','taza','taza'],[200,500,800],[100,200,600],[5.5,9,14]],
  ['alturas','Una botella alta puede ser estrecha',['botella','botella','botella'],[400,800,1200],[300,500,100],[22,14,18]],
  ['mezcla','Comparar agua y capacidad',['taza','jarra','vaso'],[600,1200,400],[100,400,300],[10,16,12]],
  ['vacio','Un recipiente vacío y dos con agua',['jarra','cuenco','taza'],[500,1000,300],[0,600,100],[14,10,7]],
  ['matraces','Matraces con distinta capacidad',['matraz','matraz','matraz'],[500,900,1200],[400,100,600],[12,20,27]]
];
const red=n=>+n.toFixed(4);
function medidas(recipientes){
  const maxH=Math.max(...recipientes.map(c=>c.alturaCm)),maxW=Math.max(...recipientes.map(c=>c.radioCm*2*(c.forma==='taza'||c.forma==='jarra'?1.43:1)));
  const escala=Math.min(360/maxH,294/maxW);
  return recipientes.map((c,i)=>{const radio=c.radioCm*escala,radioBase=radio*perfiles[c.forma](0),baseRy=Math.max(3,radioBase*.14);return{centro:i*400+190,base:440-baseRy,baseRy,radioBase,altura:c.alturaCm*escala,radio,forma:c.forma,escala};});
}
function cuerpo(c,g){
  const points=[];for(let i=0;i<=96;i++){const t=i/96;points.push([g.centro-g.radio*perfiles[c.forma](t),g.base-g.altura*t]);}
  for(let i=96;i>=0;i--){const t=i/96;points.push([g.centro+g.radio*perfiles[c.forma](t),g.base-g.altura*t]);}
  return points.map(([x,y],i)=>(i?'L':'M')+red(x)+','+red(y)).join(' ')+` A${red(g.radioBase)},${red(g.baseRy)} 0 0 1 ${red(g.centro-g.radioBase)},${red(g.base)} Z`;
}
function dibujar(recipientes){
  const geometry=medidas(recipientes);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500"><defs><linearGradient id="glass"><stop stop-color="#91bfd5" stop-opacity=".7"/><stop offset=".17" stop-color="#eafaff" stop-opacity=".5"/><stop offset=".43" stop-color="white" stop-opacity=".12"/><stop offset=".78" stop-color="#d8f2fc" stop-opacity=".45"/><stop offset="1" stop-color="#8bb9d0" stop-opacity=".75"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="#74e1fc"/><stop offset="1" stop-color="#238fce"/></linearGradient><linearGradient id="baseGlass" x2="0" y2="1"><stop stop-color="#f1fcff" stop-opacity=".55"/><stop offset="1" stop-color="#86b8d0" stop-opacity=".7"/></linearGradient><linearGradient id="rim" x2="0" y2="1"><stop stop-color="#9cc9dc" stop-opacity=".3"/><stop offset=".5" stop-color="white" stop-opacity=".1"/><stop offset="1" stop-color="#bce0ed" stop-opacity=".45"/></linearGradient></defs><rect width="1200" height="500" fill="white"/>${recipientes.map((c,i)=>{
    const g=geometry[i],cx=g.centro,p=cuerpo(c,g),top=g.base-g.altura,fillY=g.base-c.nivel*g.altura,r=g.radio,rt=r*perfiles[c.forma](1),rf=r*perfiles[c.forma](c.nivel),handle=c.forma==='taza'||c.forma==='jarra';
    return `<defs><clipPath id="body${i}"><path d="${p}"/></clipPath></defs>${handle?`<path d="M${red(cx+r*.83)},${red(top+g.altura*.23)} C${red(cx+r*2)},${red(top+g.altura*.12)} ${red(cx+r*2)},${red(g.base-g.altura*.15)} ${red(cx+r*.86)},${red(g.base-g.altura*.23)}" fill="none" stroke="#426d88" stroke-width="11"/><path d="M${red(cx+r*.83)},${red(top+g.altura*.23)} C${red(cx+r*2)},${red(top+g.altura*.12)} ${red(cx+r*2)},${red(g.base-g.altura*.15)} ${red(cx+r*.86)},${red(g.base-g.altura*.23)}" fill="none" stroke="#d9f1fa" stroke-width="5"/>`:''}<path d="${p}" fill="url(#glass)" stroke="#3d6580" stroke-width="5.5" stroke-linejoin="round"/><g clip-path="url(#body${i})">${c.aguaMl?`<rect x="${i*400}" y="${red(fillY)}" width="400" height="${red(g.base+g.baseRy-fillY+4)}" fill="url(#water)"/><ellipse cx="${cx}" cy="${red(fillY)}" rx="${red(rf)}" ry="${red(Math.max(2,rf*.14))}" fill="#b0efff" stroke="#2196c8" stroke-width="2"/>`:''}<path d="M${red(cx-r*.65)} ${red(top+12)} L${red(cx-r*.65)} ${red(g.base-10)}" stroke="white" stroke-opacity=".72" stroke-width="6" stroke-linecap="round"/><path d="M${red(cx+r*.67)} ${red(top+14)} L${red(cx+r*.67)} ${red(g.base-10)}" stroke="#b5e3f6" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/></g><ellipse data-base="true" cx="${cx}" cy="${red(g.base)}" rx="${red(g.radioBase)}" ry="${red(g.baseRy)}" fill="url(#baseGlass)" stroke="#5786a0" stroke-width="2.7"/><path d="${p}" fill="none" stroke="#3d6580" stroke-width="5.5" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${red(top)}" rx="${red(rt)}" ry="${red(Math.max(2,rt*.14))}" fill="url(#rim)" stroke="#3d6580" stroke-width="3.5"/>`;
  }).join('')}</svg>`;
}
const animaciones={};
// En cada nivel, las cantidades consecutivas difieren exactamente en 3, 2 o 1 vasitos.
const escenas=definiciones.flatMap((original,i)=>[original,...[3,2,1].map(d=>{
  const [id,nombre,formas,capacidades,,alturas]=original;
  const orden=[0,1,2].sort((a,b)=>capacidades[a]-capacidades[b]);
  const nuevas=[0,0,0],agua=[0,0,0],base=300+(i%3)*100;
  orden.forEach((fuente,rango)=>{nuevas[fuente]=base+rango*d*100;agua[fuente]=nuevas[fuente]-200;});
  // Misma forma y anchura: la altura crece en proporción a la capacidad.
  // Así, 3 vasitos producen una diferencia visual mayor que 2 o 1.
  const forma=formas[i%3],alturaReferencia=alturas[i%3];
  const formasNivel=[forma,forma,forma],alturasNivel=nuevas.map(v=>alturaReferencia*v/500);
  const titulos={vaso:'Vasos',jarra:'Jarras',botella:'Botellas',cuenco:'Cuencos',taza:'Tazas',matraz:'Matraces'};
  return [`${id}-d${d}`,`${titulos[forma]} de distinta capacidad`,formasNivel,nuevas,agua,alturasNivel,d];
})]);
const catalogo=escenas.map(([id,nombre,formas,capacidades,agua,alturas,diferenciaVasos])=>{
  if(new Set(capacidades).size!==3||new Set(agua).size!==3)throw Error('Respuestas ambiguas: '+id);
  const recipientes=formas.map((forma,i)=>{if(agua[i]>capacidades[i]||agua[i]<0)throw Error('Cantidad inválida');const radioCm=Math.sqrt(capacidades[i]/(Math.PI*alturas[i]*integral(forma,1))),n=nivel(forma,agua[i]/capacidades[i]);if(Math.abs(integral(forma,n)/integral(forma,1)*capacidades[i]-agua[i])>.03)throw Error('Nivel incorrecto');return{forma,capacidadMl:capacidades[i],aguaMl:agua[i],alturaCm:alturas[i],radioCm:red(radioCm),nivel:red(n)};});
  const svg=dibujar(recipientes);
  fs.writeFileSync(path.join(out,id+'.svg'),svg);
  const geometria=medidas(recipientes).map(({escala,...g})=>g);
  // Se reutiliza el mismo dibujo y se insertan únicamente las capas de agua.
  const vacio=svg.replace(/<g clip-path="url\(#body(\d+)\)">(?:<rect[^>]*\/><ellipse[^>]*\/>)?/g,(_,index)=>{
    const g=geometria[+index];
    return `<g clip-path="url(#body${index})"><g data-agua="${index}" opacity="0"><rect data-rect x="${+index*400}" y="${red(g.base)}" width="400" height="0" fill="url(#water)"/><ellipse data-superficie cx="${g.centro}" cy="${red(g.base)}" rx="0" ry="2" fill="#9ee8ff" stroke="#2199cb" stroke-width="2"/></g><path data-chorro="${index}" d="M${g.centro} ${red(g.base-g.altura)}V${red(g.base)}" stroke="#46b9e9" stroke-width="5" stroke-linecap="round" opacity="0"/>`;
  });
  animaciones['capacidad-'+id]={svg:vacio,geometria};
  return{id:'capacidad-'+id,nombre,categoria:'capacidad',tipo:'paneles',columnas:3,src:'imagenes/capacidad/'+id+'.svg',nivel:diferenciaVasos?String(diferenciaVasos):'variado',diferenciaVasos:diferenciaVasos||null,capacidades,agua,recipientes};
});
fs.writeFileSync(path.join(app,'capacidades.js'),'// Generado por tools/crear_recipientes_capacidad.cjs. Volúmenes en mililitros.\nwindow.EJERCICIOS_CAPACIDAD = '+JSON.stringify(catalogo,null,2)+';\n');
const curvas={};for(const tipo of Object.keys(perfiles)){const total=integral(tipo,1);curvas[tipo]=Array.from({length:257},(_,i)=>({v:integral(tipo,i/256)/total,h:i/256,r:perfiles[tipo](i/256)}));}
fs.writeFileSync(path.join(app,'dibujos-capacidad.js'),'// SVG y curvas precalculadas para el llenado. Generado por tools/crear_recipientes_capacidad.cjs.\nwindow.DIBUJOS_CAPACIDAD = '+JSON.stringify({escenas:animaciones,curvas})+';\n');
console.log(catalogo.length+' escenas SVG, '+catalogo.length*3+' recipientes y niveles de agua verificados.');
