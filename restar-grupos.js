/* Recogida por barrido: los grupos se conservan; no hay física activa en reposo. */
(()=>{'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const puntoSegmento=(x,y,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,k=l?clamp(((x-a.x)*dx+(y-a.y)*dy)/l,0,1):0;return {avance:k,distancia:Math.hypot(x-a.x-k*dx,y-a.y-k*dy)};};
 function distribuirRestar(cantidad,w,h,orden,semilla=0){
  if(!cantidad)return {size:0,centros:[]};
  const opciones=Array.from({length:cantidad},(_,i)=>{
   const cols=i+1,rows=Math.ceil(cantidad/cols),gap=5;
   const size=Math.max(0,Math.min(92,(w-gap*(cols-1))/cols,(h-gap*(rows-1))/rows));
   return {cols,rows,size};
  });
  const mayor=Math.max(...opciones.map(opcion=>opcion.size));
  const legibles=opciones.filter(opcion=>opcion.size>=mayor*.85);
  const forma=orden==='columnas'?legibles[0]:orden==='filas'?legibles.at(-1):opciones.find(opcion=>opcion.size===mayor);
  const {cols,rows}=forma,disperso=orden==='desorden',size=forma.size*(disperso ? .8 : 1);
  const pasoX=disperso?w/cols:size+5,pasoY=disperso?h/rows:size+5;
  const desdeX=(w-pasoX*cols)/2,desdeY=(h-pasoY*rows)/2;
  const azar=(i,sal)=>{const x=Math.sin(semilla+i*97.7+sal)*43758.5453;return x-Math.floor(x)-.5;};
  const indices=Array.from({length:cantidad},(_,i)=>i);
  if(disperso)indices.sort((a,b)=>azar(a,3)-azar(b,3));
  const centros=indices.map(i=>{
   const vertical=orden==='columnas';
   const col=vertical?Math.floor(i/rows):i%cols,row=vertical?i%rows:Math.floor(i/cols);
   const x=desdeX+(col+.5)*pasoX+(disperso?azar(i,9)*(pasoX-size):0);
   const y=desdeY+(row+.5)*pasoY+(disperso?azar(i,19)*(pasoY-size):0);
   return {x,y};
  });
  return {size,centros};
 }
 const posiciones=(n,ancho=false)=>{
  if(n>9||(ancho&&n>=5)){
   const rows=n<=9?2:Math.ceil(Math.sqrt(n/(ancho?2:1))),cols=Math.ceil(n/rows);
   const cells=Array.from({length:n},(_,i)=>[i%cols,Math.floor(i/cols)]),cx=(cols-1)/2,cy=(rows-1)/2;
   cells.sort((a,b)=>(a[0]-cx)**2+(a[1]-cy)**2-((b[0]-cx)**2+(b[1]-cy)**2)||a[1]-b[1]||a[0]-b[0]);
   const [x,y]=cells[0];
   return cells.map(([col,row])=>[col-x,row-y]);
  }
  if(n===1)return [[0,0]];
  if(n===2)return [[0,0],[1,0]];
  if(n===3)return [[0,0],[1,0],[.5,.87]];
  if(n===4)return [[0,0],[1,0],[0,1],[1,1]];
  if(n===5)return [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  if(n===6)return [[0,0],[1,0],[-1,0],[0,1],[1,1],[-1,1]];
  return [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].slice(0,n);
 };
 const limites=(ids,s,ancho=false)=>{const ps=posiciones(ids.length,ancho).map(([x,y])=>({x:x*s,y:y*s})),pad=ids.length>1?4:0;return {ps,minX:Math.min(...ps.map(p=>p.x))-s/2-pad,minY:Math.min(...ps.map(p=>p.y))-s/2-pad,maxX:Math.max(...ps.map(p=>p.x))+s/2+pad,maxY:Math.max(...ps.map(p=>p.y))+s/2+pad};};
 const lineas=(ps,s)=>{let out='';for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j],d=Math.hypot(b.x-a.x,b.y-a.y);if(d>s*1.17)continue;const k=s*.33/d,dx=(b.x-a.x)*k,dy=(b.y-a.y)*k;out+=`<line x1="${a.x+dx}" y1="${a.y+dy}" x2="${b.x-dx}" y2="${b.y-dy}"/>`;}return out;};
 class AgrupadorRestar{
  constructor({board,cesta,alQuitar,alCambiar,alIniciar,ordenar,limite,t}){Object.assign(this,{board,cesta,alQuitar,alCambiar,alIniciar,ordenar,limite,t});this.activo=false;this.grupos=[];this.items=new Map();this.seleccion=null;this.drag=null;this.size=48;this.w=0;this.h=0;this.svg=null;}
  iniciar(){this.desactivar();this.activo=true;this.board.classList.add('en-grupos');this.items=new Map([...this.board.querySelectorAll('.obj-item:not(.removed)')].map(b=>[+b.dataset.idx,b]));this.grupos=[...this.items.keys()].map(id=>({id,ids:[id],x:0,y:0}));this.svg=document.createElementNS('http://www.w3.org/2000/svg','svg');this.svg.classList.add('enlaces-restar');this.svg.setAttribute('aria-hidden','true');this.board.prepend(this.svg);this.adaptar();this.notificar();}
  desactivar(){this.cancelar();this.activo=false;this.svg?.remove();this.svg=null;this.board.classList.remove('en-grupos');for(const b of this.board.querySelectorAll('.obj-item')){b.classList.remove('en-grupo','grupo-elegido','dragging');for(const k of ['left','top','width','height','font-size'])b.style.removeProperty(k);delete b.dataset.grupo;delete b.dataset.cantidad;b.removeAttribute('aria-pressed');}this.items.clear();this.grupos=[];this.seleccion=null;this.w=this.h=0;}
  grupo(id){return this.grupos.find(g=>g.ids.includes(id));}
  seleccionado(){return this.grupos.find(g=>g.id===this.seleccion);}
  notificar(){this.alCambiar?.(this.drag?.ids.length||this.seleccionado()?.ids.length||0);}
  empacar(s,w,h){const gap=6,rows=[];let row={parts:[],w:0,h:0};for(const g of this.grupos.slice().sort((a,b)=>b.ids.length-a.ids.length||a.id-b.id)){const q=limites(g.ids,s,this.ancho),gw=q.maxX-q.minX,gh=q.maxY-q.minY;if(gw>w+.1||gh>h+.1)return null;if(row.parts.length&&row.w+gap+gw>w){rows.push(row);row={parts:[],w:0,h:0};}row.parts.push({g,q,x:row.w+(row.parts.length?gap:0)});row.w+=(row.parts.length>1?gap:0)+gw;row.h=Math.max(row.h,gh);}if(row.parts.length)rows.push(row);const height=rows.reduce((n,r)=>n+r.h,0)+Math.max(0,rows.length-1)*gap;if(height>h+.1)return null;let y=(h-height)/2;const centers=new Map();for(const r of rows){for(const {g,q,x}of r.parts)centers.set(g.id,{x:(w-r.w)/2+x-q.minX,y:y+(r.h-(q.maxY-q.minY))/2-q.minY});y+=r.h+gap;}return centers;}
  adaptar(conservar=false,reubicar=false){if(!this.activo||this.drag)return;const r=this.board.getBoundingClientRect();if(r.width<1||r.height<1)return;for(const [id,b]of this.items)if(b.classList.contains('removed')){this.items.delete(id);this.grupos=this.grupos.map(g=>({...g,ids:g.ids.filter(v=>v!==id)})).filter(g=>g.ids.length);}
   const w=r.width,h=r.height;this.ancho=w/h>2.3;
   let s,packed;
   if(this.grupos.every(g=>g.ids.length===1)){
    const ordenados=this.grupos.slice().sort((a,b)=>a.id-b.id);
    const {size,centros}=this.ordenar(ordenados.length,w,h);
    s=size;
    packed=new Map(ordenados.map((g,i)=>[g.id,centros[i]]));
   }else{
    let min=1,max=92;
    while(min<=max){
     const size=Math.floor((min+max)/2),intento=this.empacar(size,w,h);
     if(intento){s=size;packed=intento;min=size+1;}else max=size-1;
    }
    s??=1;
   }
   const iguales=Math.abs(w-this.w)<.5&&Math.abs(h-this.h)<.5&&Math.abs(s-this.size)<.5;
   let valid=conservar&&iguales,rects=[];if(valid)for(const g of this.grupos){const q=limites(g.ids,s,this.ancho);g.x=clamp(g.x,-q.minX,w-q.maxX);g.y=clamp(g.y,-q.minY,h-q.maxY);const box={x:g.x+q.minX,y:g.y+q.minY,w:q.maxX-q.minX,h:q.maxY-q.minY};if(rects.some(b=>box.x<b.x+b.w+4&&box.x+box.w+4>b.x&&box.y<b.y+b.h+4&&box.y+box.h+4>b.y)){valid=false;break;}rects.push(box);}
   if(!valid&&(!iguales||conservar||reubicar||!this.w))for(const g of this.grupos)Object.assign(g,packed?.get(g.id)||{x:w/2,y:h/2});this.size=s;this.w=w;this.h=h;this.pintar();
  }
  pintar(){if(!this.activo||!this.svg)return;const z=Matematicas.escala(),s=this.size;let svg='';for(const g of this.grupos){const q=limites(g.ids,s,this.ancho),selected=g.id===this.seleccion;if(g.ids.length>1&&!this.drag?.ids.some(id=>g.ids.includes(id)))svg+=`<g class="${selected?'seleccionado':''}"><rect x="${g.x+q.minX}" y="${g.y+q.minY}" width="${q.maxX-q.minX}" height="${q.maxY-q.minY}" rx="${s*.4}"/><g transform="translate(${g.x} ${g.y})">${lineas(q.ps,s)}</g></g>`;g.ids.forEach((id,i)=>{const b=this.items.get(id);if(!b)return;b.style.left=(g.x+q.ps[i].x)/z+'px';b.style.top=(g.y+q.ps[i].y)/z+'px';b.style.width=b.style.height=s/z+'px';b.style.fontSize=s*.83/z+'px';b.classList.toggle('en-grupo',g.ids.length>1);b.classList.toggle('grupo-elegido',selected);b.dataset.grupo=g.id;b.dataset.cantidad=g.ids.length;b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',this.t(`Objeto ${id+1}, grupo de ${g.ids.length}. Arrastra para mover o toca para unir.`,`Object ${id+1}, group of ${g.ids.length}. Drag to move or tap to join.`));});}this.svg.setAttribute('viewBox',`0 0 ${this.w} ${this.h}`);this.svg.innerHTML=svg;}
  fusionar(ids,x,y){const unique=[...new Set(ids)].filter(id=>this.items.has(id)),groups=this.grupos.filter(g=>!g.ids.some(id=>unique.includes(id)));if(!unique.length)return null;const g={id:Math.min(...unique),ids:unique,x,y};groups.push(g);this.grupos=groups;this.seleccion=g.id;return g;}
  tocar(item){if(!this.activo||item.disabled)return;this.alIniciar?.();const g=this.grupo(+item.dataset.idx),chosen=this.seleccionado();if(!g)return;if(chosen&&chosen!==g&&chosen.ids.length+g.ids.length<=this.limite()){this.fusionar([...chosen.ids,...g.ids],chosen.x,chosen.y);this.adaptar(true);}else{this.seleccion=g.id;this.pintar();}this.notificar();}
  separar(){if(this.drag)return;const g=this.seleccionado();if(!g||g.ids.length<2)return;this.alIniciar?.();const q=limites(g.ids,this.size,this.ancho);this.grupos=this.grupos.filter(v=>v!==g).concat(g.ids.map((id,i)=>({id,ids:[id],x:g.x+q.ps[i].x,y:g.y+q.ps[i].y})));this.seleccion=null;this.adaptar(true);this.notificar();}
  quitarSeleccion(){const g=this.seleccionado();if(!g||!this.alQuitar(g.ids.map(id=>this.items.get(id))))return false;for(const id of g.ids)this.items.delete(id);this.grupos=this.grupos.filter(v=>v!==g);this.seleccion=null;this.adaptar(true);this.notificar();return true;}
  tomar(e){const b=e.currentTarget;if(!this.activo||b.disabled||e.button>0||e.isPrimary===false||this.drag)return;e.preventDefault();this.alIniciar?.();this.adaptar();const g=this.grupo(+b.dataset.idx);if(!g)return;const ids=[+b.dataset.idx,...g.ids.filter(id=>id!==+b.dataset.idx)];this.drag={pointerId:e.pointerId,item:b,ids,x:e.clientX,y:e.clientY,inicio:{x:e.clientX,y:e.clientY},anterior:{x:e.clientX,y:e.clientY},movido:false,ghost:null,clones:new Map(),frames:[]};b.setPointerCapture(e.pointerId);}
  crearFantasma(){const d=this.drag,g=document.createElement('div');g.className='grupo-fantasma';g.setAttribute('aria-hidden','true');g.style.width=g.style.height=this.size*7+'px';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');g.append(svg);document.body.append(g);d.ghost=g;d.svg=svg;this.actualizarFantasma();this.pintar();}
  actualizarFantasma(){const d=this.drag;if(!d?.ghost)return;const s=this.size,mid=s*3.5,q=limites(d.ids,s,this.ancho),ps=q.ps.map(p=>({x:p.x+mid,y:p.y+mid}));d.svg.setAttribute('viewBox',`0 0 ${s*7} ${s*7}`);d.svg.innerHTML=`<rect x="${mid+q.minX}" y="${mid+q.minY}" width="${q.maxX-q.minX}" height="${q.maxY-q.minY}" rx="${s*.4}"/>${lineas(ps,s)}`;
   d.ids.forEach((id,i)=>{const original=this.items.get(id);if(!original)return;original.classList.add('dragging');let b=d.clones.get(id);if(!b){b=document.createElement('span');b.textContent=original.textContent;b.style.width=b.style.height=s+'px';b.style.fontSize=s*.83+'px';const r=original.getBoundingClientRect();b.style.left=r.x+r.width/2-d.x+mid+'px';b.style.top=r.y+r.height/2-d.y+mid+'px';if(i===0){b.style.transition='none';b.style.left=ps[i].x+'px';b.style.top=ps[i].y+'px';}d.ghost.append(b);d.clones.set(id,b);}const move=()=>{if(this.drag!==d)return;b.style.left=ps[i].x+'px';b.style.top=ps[i].y+'px';};d.frames.push(requestAnimationFrame(move));});Matematicas.fantasma(d.ghost,d.x,d.y);
  }
  recoger(a,b){
   const d=this.drag,maximo=this.limite();
   if(d.ids.length>=maximo)return;
   const umbral=this.size*.52+Math.min(12,this.size*.18),candidatos=[];
   for(const g of this.grupos){
    if(g.ids.length+d.ids.length>maximo||g.ids.some(id=>d.ids.includes(id)))continue;
    let avance=Infinity;
    for(const id of g.ids){
     const r=this.items.get(id).getBoundingClientRect();
     const punto=puntoSegmento(r.x+r.width/2,r.y+r.height/2,a,b);
     if(punto.distancia<=umbral)avance=Math.min(avance,punto.avance);
    }
    if(Number.isFinite(avance))candidatos.push({g,avance});
   }
   const antes=d.ids.length;
   candidatos.sort((a,b)=>a.avance-b.avance);
   for(const {g} of candidatos)if(d.ids.length+g.ids.length<=maximo)d.ids.push(...g.ids);
   if(d.ids.length!==antes){this.actualizarFantasma();this.pintar();this.notificar();}
  }
  mover(e){const d=this.drag;if(!d||d.pointerId!==e.pointerId)return;e.preventDefault();d.x=e.clientX;d.y=e.clientY;if(!d.movido&&Math.hypot(d.x-d.inicio.x,d.y-d.inicio.y)>6){d.movido=true;this.crearFantasma();}if(d.movido){this.recoger(d.anterior,{x:d.x,y:d.y});Matematicas.fantasma(d.ghost,d.x,d.y);const r=this.cesta.getBoundingClientRect();this.cesta.classList.toggle('over',d.x>=r.left&&d.x<=r.right&&d.y>=r.top&&d.y<=r.bottom);}d.anterior={x:d.x,y:d.y};}
  soltar(e){const d=this.drag;if(!d||d.pointerId!==e.pointerId)return;e.preventDefault();if(!d.movido){const b=d.item;this.cancelar();this.tocar(b);return;}const r=this.board.getBoundingClientRect(),basket=this.cesta.getBoundingClientRect(),inside=e.clientX>=basket.left&&e.clientX<=basket.right&&e.clientY>=basket.top&&e.clientY<=basket.bottom,ids=d.ids.slice();this.cancelar();this.fusionar(ids,e.clientX-r.left,e.clientY-r.top);this.adaptar(true);this.notificar();if(inside)this.quitarSeleccion();}
  cancelar(){const d=this.drag;if(!d)return;this.drag=null;for(const f of d.frames)cancelAnimationFrame(f);d.ghost?.remove();for(const b of this.items.values())b.classList.remove('dragging');try{d.item.releasePointerCapture(d.pointerId);}catch{}this.cesta.classList.remove('over');this.pintar();this.notificar();}
 }
 window.AgrupadorRestar=AgrupadorRestar;
 window.distribuirRestar=distribuirRestar;
})();
