'use strict';
/* Ejemplos con recursos existentes. El árbol se estira desde su base fija. */
window.EjemplosOrdenar={
 figura(id,p,x){
  if(id==='altura'){
   const h=120+120*p,y=260-h;
   let regla='';for(let n=0;n<=4;n++){const yy=260-n*60;regla+=`<path d="M${x-112} ${yy}h12" stroke="#80632e" stroke-width="2"/>`;}
   return `<rect x="${x-112}" y="18" width="17" height="244" rx="4" fill="#ffe6a3"/>${regla}<image href="../ImagenesGeneradorOraciones/arbol.png" x="${x-64}" y="${y}" width="128" height="${h}" preserveAspectRatio="none"/><path d="M${x+70} ${y}h15v${h}h-15" fill="none" stroke="#397cc9" stroke-width="3"/><circle cx="${x+85}" cy="${y}" r="12" fill="#397cc9" stroke="white" stroke-width="3"/>`;
  }
  const familia=id==='longitud'?familias.find(f=>f.id==='cuerdas'):(actual?.criterio===id?actual:familias.find(f=>f.criterio===id));
  if(!familia)return '';
  if(['tamano','grosor','longitud','anchura'].includes(id)){
   const src=familia.archivo||familia.imagenes[0],recorte=window.RECORTES_EJEMPLOS[src];let w=65+p*115,h=w,aspect='xMidYMax meet';
   if(id==='tamano'&&recorte){const ratio=recorte[5]/recorte[4],maximo=Math.min(180,190/ratio);w=maximo*(.36+.64*p);h=w*ratio;}
   if(id==='grosor'){w=35+p*85;h=180;aspect='none';}
   if(id==='longitud'){w=65+p*115;h=22;aspect='none';}
   if(id==='anchura'){w=65+p*115;h=155;aspect='none';}
   const imagen=recorte?`<svg class="objeto-recortado" style="width:${w}px;height:${h}px" x="${x-90}" y="${260-h}" width="${w}" height="${h}" viewBox="${recorte.slice(2).join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${src}" x="0" y="0" width="${recorte[0]}" height="${recorte[1]}"/></svg>`:`<image href="${src}" x="${x-90}" y="${260-h}" width="${w}" height="${h}" preserveAspectRatio="${aspect}"/>`;
   let marcas='';for(let n=0;n<=6;n++)marcas+=`<path d="M${x-90+n*30} 50v10" stroke="#80632e" stroke-width="2"/>`;
   return `<rect x="${x-94}" y="49" width="188" height="14" rx="4" fill="#ffe6a3"/>${marcas}<path d="M${x-90} 62V260M${x-90+w} 62V260" stroke="#397cc9" stroke-width="2" stroke-dasharray="5 5"/><circle cx="${x-90}" cy="55" r="4" fill="#397cc9"/>${imagen}`;
  }
  if(familia.archivo){const medida=65+p*115;return `<image href="${familia.archivo}" x="${x-medida/2}" y="${260-medida}" width="${medida}" height="${medida}" preserveAspectRatio="xMidYMax meet"/>`;}
  const posicion=(1-p)*5,a=Math.floor(posicion),b=Math.min(5,a+1),t=posicion-a;
  // Disolver entre ilustraciones de la serie muestra los cambios sin estirar el PNG.
  return `<image href="${familia.imagenes[a]}" x="${x-85}" y="55" width="170" height="205" preserveAspectRatio="xMidYMax meet" opacity="${1-t}"/><image href="${familia.imagenes[b]}" x="${x-85}" y="55" width="170" height="205" preserveAspectRatio="xMidYMax meet" opacity="${t}"/>`;
 },
 frase(id,p,en){
  const pares={altura:en?['The tree is short.','The tree grows.','The tree is tall.']:['El árbol es bajo.','El árbol crece.','El árbol es alto.'],tamano:en?['The object is small.','The object grows.','The object is big.']:['El objeto es pequeño.','El objeto crece.','El objeto es grande.'],grosor:en?['The object is thin.','The object becomes thicker.','The object is thick.']:['El objeto es delgado.','El objeto se hace más grueso.','El objeto es grueso.'],longitud:en?['The object is short.','The object gets longer.','The object is long.']:['El objeto es corto.','El objeto se alarga.','El objeto es largo.'],anchura:en?['The object is narrow.','The object gets wider.','The object is wide.']:['El objeto es estrecho.','El objeto se ensancha.','El objeto es ancho.']};
  return pares[id]?.[p<.25?0:p>.75?2:1]||'';
 }
};
