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
  ['vasos','Vasos de tres tamaños',['vaso','vaso','vaso'],[300,600,900],[100,300,600],[8,12,14]],
  ['jarras','Jarras con distinta cantidad de agua',['jarra','jarra','jarra'],[400,800,1200],[300,200,600],[10,14,18]],
  ['botellas','Botellas altas y anchas',['botella','botella','botella'],[500,900,300],[400,200,100],[20,16,22]],
  ['formas','Un vaso, un cuenco y una botella',['vaso','cuenco','botella'],[300,800,600],[200,600,100],[18,6,20]],
  ['cuencos','Cuencos de distintas capacidades',['cuenco','cuenco','cuenco'],[400,1000,700],[100,200,500],[5,8,6]],
  ['lleno-parcial','Lleno y parcialmente llenos',['jarra','vaso','botella'],[1200,300,700],[200,300,400],[16,10,24]],
  ['aberturas','Recipientes de formas diferentes',['vaso','matraz','jarra'],[400,900,600],[200,300,100],[14,18,12]],
  ['tazas','Tazas de tres capacidades',['taza','taza','taza'],[200,500,800],[100,200,600],[6,9,12]],
  ['alturas','Una botella alta puede ser estrecha',['botella','botella','botella'],[400,800,1200],[300,500,100],[22,14,18]],
  ['mezcla','Comparar agua y capacidad',['taza','jarra','vaso'],[600,1200,400],[100,400,300],[10,16,12]],
  ['vacio','Un recipiente vacío y dos con agua',['jarra','cuenco','taza'],[500,1000,300],[0,600,100],[14,10,7]],
  ['matraces','Matraces con distinta capacidad',['matraz','matraz','matraz'],[500,900,1200],[400,100,600],[16,20,22]]
];
const red=n=>+n.toFixed(4);
function cuerpo(c,cx,base,s){const points=[];for(let i=0;i<=96;i++){const t=i/96;points.push([cx-c.radioCm*perfiles[c.forma](t)*s,base-c.alturaCm*t*s]);}for(let i=96;i>=0;i--){const t=i/96;points.push([cx+c.radioCm*perfiles[c.forma](t)*s,base-c.alturaCm*t*s]);}return points.map(([x,y],i)=>(i?'L':'M')+red(x)+','+red(y)).join(' ')+' Z';}
function dibujar(recipientes){
  const width=1200,height=500,base=440,maxH=Math.max(...recipientes.map(c=>c.alturaCm)),maxW=Math.max(...recipientes.map(c=>c.radioCm*2*(c.forma==='taza'||c.forma==='jarra'?1.43:1)));
  const s=Math.min(366/maxH,302/maxW);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="glass"><stop stop-color="#e5f6ff" stop-opacity=".5"/><stop offset=".4" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#b5dce9" stop-opacity=".45"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="#6ed6fb"/><stop offset="1" stop-color="#218bce"/></linearGradient></defs><rect width="1200" height="500" fill="white"/>${recipientes.map((c,i)=>{
    const cx=i*400+190,p=cuerpo(c,cx,base,s),top=base-c.alturaCm*s,fillY=base-c.nivel*c.alturaCm*s,r=c.radioCm*s,rt=r*perfiles[c.forma](1),rf=r*perfiles[c.forma](c.nivel),handle=c.forma==='taza'||c.forma==='jarra';
    return `<defs><clipPath id="body${i}"><path d="${p}"/></clipPath></defs>${handle?`<path d="M${red(cx+r*.83)},${red(top+c.alturaCm*s*.23)} C${red(cx+r*2)},${red(top+c.alturaCm*s*.12)} ${red(cx+r*2)},${red(base-c.alturaCm*s*.15)} ${red(cx+r*.86)},${red(base-c.alturaCm*s*.23)}" fill="none" stroke="#496f89" stroke-width="9"/><path d="M${red(cx+r*.83)},${red(top+c.alturaCm*s*.23)} C${red(cx+r*2)},${red(top+c.alturaCm*s*.12)} ${red(cx+r*2)},${red(base-c.alturaCm*s*.15)} ${red(cx+r*.86)},${red(base-c.alturaCm*s*.23)}" fill="none" stroke="#d5e9f2" stroke-width="4"/>`:''}<path d="${p}" fill="url(#glass)" stroke="#496f89" stroke-width="4.5" stroke-linejoin="round"/><g clip-path="url(#body${i})">${c.aguaMl?`<rect x="${i*400}" y="${red(fillY)}" width="400" height="${red(base-fillY+3)}" fill="url(#water)"/><ellipse cx="${cx}" cy="${red(fillY)}" rx="${red(rf)}" ry="${red(Math.max(2,rf*.1))}" fill="#9ee8ff" stroke="#2199cb" stroke-width="2"/>`:''}<path d="M${red(cx-r*.66)} ${red(top+10)} L${red(cx-r*.66)} ${base-12}" stroke="white" stroke-opacity=".62" stroke-width="5" stroke-linecap="round"/></g><path d="${p}" fill="none" stroke="#496f89" stroke-width="4.5" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${red(top)}" rx="${red(rt)}" ry="${red(Math.max(2,rt*.1))}" fill="none" stroke="#496f89" stroke-width="3"/>`;
  }).join('')}</svg>`;
}
const animaciones={};
const catalogo=definiciones.map(([id,nombre,formas,capacidades,agua,alturas])=>{
  if(new Set(capacidades).size!==3||new Set(agua).size!==3)throw Error('Respuestas ambiguas: '+id);
  const recipientes=formas.map((forma,i)=>{if(agua[i]>capacidades[i]||agua[i]<0)throw Error('Cantidad inválida');const radioCm=Math.sqrt(capacidades[i]/(Math.PI*alturas[i]*integral(forma,1))),n=nivel(forma,agua[i]/capacidades[i]);if(Math.abs(integral(forma,n)/integral(forma,1)*capacidades[i]-agua[i])>.03)throw Error('Nivel incorrecto');return{forma,capacidadMl:capacidades[i],aguaMl:agua[i],alturaCm:alturas[i],radioCm:red(radioCm),nivel:red(n)};});
  const svg=dibujar(recipientes);
  fs.writeFileSync(path.join(out,id+'.svg'),svg);
  const s=Math.min(366/Math.max(...recipientes.map(c=>c.alturaCm)),302/Math.max(...recipientes.map(c=>c.radioCm*2*(c.forma==='taza'||c.forma==='jarra'?1.43:1))));
  const geometria=recipientes.map((c,i)=>({centro:i*400+190,base:440,altura:c.alturaCm*s,radio:c.radioCm*s,forma:c.forma}));
  // Se reutiliza el mismo dibujo y se insertan únicamente las capas de agua.
  const vacio=svg.replace(/<g clip-path="url\(#body(\d+)\)">(?:<rect[^>]*\/><ellipse[^>]*\/>)?/g,(_,index)=>{
    const g=geometria[+index];
    return `<g clip-path="url(#body${index})"><g data-agua="${index}" opacity="0"><rect data-rect x="${+index*400}" y="440" width="400" height="0" fill="url(#water)"/><ellipse data-superficie cx="${g.centro}" cy="440" rx="0" ry="2" fill="#9ee8ff" stroke="#2199cb" stroke-width="2"/></g><path data-chorro="${index}" d="M${g.centro} ${red(g.base-g.altura)}V440" stroke="#46b9e9" stroke-width="5" stroke-linecap="round" opacity="0"/>`;
  });
  animaciones['capacidad-'+id]={svg:vacio,geometria};
  return{id:'capacidad-'+id,nombre,categoria:'capacidad',tipo:'paneles',columnas:3,src:'imagenes/capacidad/'+id+'.svg',capacidades,agua,recipientes};
});
fs.writeFileSync(path.join(app,'capacidades.js'),'// Generado por tools/crear_recipientes_capacidad.cjs. Volúmenes en mililitros.\nwindow.EJERCICIOS_CAPACIDAD = '+JSON.stringify(catalogo,null,2)+';\n');
const curvas={};for(const tipo of Object.keys(perfiles)){const total=integral(tipo,1);curvas[tipo]=Array.from({length:257},(_,i)=>({v:integral(tipo,i/256)/total,h:i/256,r:perfiles[tipo](i/256)}));}
fs.writeFileSync(path.join(app,'dibujos-capacidad.js'),'// SVG y curvas precalculadas para el llenado. Generado por tools/crear_recipientes_capacidad.cjs.\nwindow.DIBUJOS_CAPACIDAD = '+JSON.stringify({escenas:animaciones,curvas})+';\n');
console.log(catalogo.length+' escenas SVG, 36 recipientes y niveles de agua verificados.');
