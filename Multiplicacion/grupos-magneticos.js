/* Grupos con enlaces locales y visibilidad directa. Sin simulación continua en reposo. */
(() => {
  'use strict';
  const distancia = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const limitar = (n,a,b) => Math.max(a,Math.min(b,n));
  function envolvente(puntos) {
    const p=puntos.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
    const giro=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
    const abajo=[],arriba=[];
    for(const v of p){while(abajo.length>1&&giro(abajo.at(-2),abajo.at(-1),v)<=0)abajo.pop();abajo.push(v);}
    for(const v of p.slice().reverse()){while(arriba.length>1&&giro(arriba.at(-2),arriba.at(-1),v)<=0)arriba.pop();arriba.push(v);}
    return abajo.slice(0,-1).concat(arriba.slice(0,-1));
  }
  class GruposMagneticos {
    constructor({plano,separar,deshacer,svgFigura,t,alCambiar,alCompletar,alAvisar}) {
      Object.assign(this,{plano,separar,deshacer,svgFigura,t,alCambiar,alCompletar,alAvisar});
      this.capa=plano.querySelector('.nodos-grupos');this.svg=plano.querySelector('svg');
      this.nodos=[];this.enlaces=[];this.historial=[];this.seleccion=null;this.arrastre=null;
      this.mundo={w:0,h:0,tam:50};this.raf=0;this.scrollRaf=0;this.movimiento=null;this.movimientoRaf=0;
      plano.addEventListener('pointerdown',e=>this.tomar(e));
      window.addEventListener('pointermove',e=>this.mover(e),{passive:false});
      window.addEventListener('pointerup',e=>this.soltar(e),{passive:false});
      window.addEventListener('pointercancel',e=>{if(this.arrastre?.id===e.pointerId)this.cancelar();});
      plano.addEventListener('lostpointercapture',e=>{if(this.arrastre?.id===e.pointerId)this.cancelar();});
      plano.addEventListener('click',e=>{if(e.detail===0){const b=e.target.closest('[data-nodo]');if(b)this.tocar(+b.dataset.nodo);}});
      plano.addEventListener('keydown',e=>this.tecla(e));
      separar.onclick=()=>this.separarSeleccion();deshacer.onclick=()=>this.deshacerUltimo();
    }
    iniciar(figuras,cantidad,{ayuda=true,nombreFigura='figura',disposicion='compactos',inercia=false}={}) {
      this.cancelar();this.nodos=figuras.map(f=>({...f,x:0,y:0}));this.enlaces=[];
      this.cantidad=cantidad;this.ayuda=ayuda;this.nombreFigura=nombreFigura;this.disposicion=['compactos','hileras','libre'].includes(disposicion)?disposicion:'compactos';this.inercia=inercia===true;this.plano.dataset.disposicion=this.disposicion;this.plano.dataset.movimiento='reposo';
      this.historial=[];this.seleccion=null;this.resuelto=false;this.mundo={w:0,h:0,tam:50};
      this.capa.replaceChildren();this.botones=new Map();
      for(const n of this.nodos){const b=document.createElement('button');b.type='button';b.className='figura nodo-magnetico';b.dataset.nodo=n.id;b.setAttribute('aria-label',nombreFigura+' '+(n.id+1));b.innerHTML=this.svgFigura(n);this.capa.append(b);this.botones.set(n.id,b);}
      this.adaptar(true);this.actualizar();
    }
    componentes(enlaces=this.enlaces) {
      const vecinos=new Map(this.nodos.map(n=>[n.id,[]]));
      for(const [a,b]of enlaces){vecinos.get(a).push(b);vecinos.get(b).push(a);}
      const visitados=new Set(),grupos=[];
      for(const n of this.nodos){if(visitados.has(n.id))continue;const ids=[],cola=[n.id];visitados.add(n.id);
        for(let i=0;i<cola.length;i++){const id=cola[i];ids.push(id);for(const v of vecinos.get(id))if(!visitados.has(v)){visitados.add(v);cola.push(v);}}
        grupos.push(ids.sort((a,b)=>a-b));
      }
      return grupos;
    }
    conexionLibre(a,b,nodos=this.nodos,tam=this.mundo.tam) {
      const p=nodos[a],q=nodos[b],dx=q.x-p.x,dy=q.y-p.y,largo2=dx*dx+dy*dy;
      if(largo2<.001||largo2>(tam*1.9+.01)**2)return false;
      // Un margen alrededor de la figura evita que el trazo roce sus bordes.
      const radio=tam*.51+2;
      return !nodos.some(n=>{if(n.id===a||n.id===b)return false;
        const t=limitar(((n.x-p.x)*dx+(n.y-p.y)*dy)/largo2,0,1);
        return Math.hypot(n.x-p.x-t*dx,n.y-p.y-t*dy)<radio;
      });
    }
    calcularEnlaces(grupos,nodos=this.nodos,tam=this.mundo.tam) {
      const enlaces=[];
      for(const ids of grupos)for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)
        if(this.conexionLibre(ids[i],ids[j],nodos,tam))enlaces.push([ids[i],ids[j]]);
      return enlaces;
    }
    conectado(ids,enlaces) {
      const visitados=new Set([ids[0]]);let cambio=true;
      while(cambio){cambio=false;for(const[a,b]of enlaces){if(visitados.has(a)&&!visitados.has(b)){visitados.add(b);cambio=true;}if(visitados.has(b)&&!visitados.has(a)){visitados.add(a);cambio=true;}}}
      return ids.every(id=>visitados.has(id));
    }
    completos(){return !!this.nodos.length&&this.componentes().every(g=>g.length===this.cantidad);}
    captura(){return {nodos:this.nodos.map(n=>({id:n.id,x:n.x,y:n.y})),enlaces:this.enlaces.map(e=>e.slice()),mundo:{...this.mundo}};}
    recordar(antes){this.historial.push(antes);if(this.historial.length>35)this.historial.shift();}
    adaptar(inicial=false) {
      if(!this.nodos.length||!this.plano.getClientRects().length)return;
      const z=parseFloat(getComputedStyle(document.body).zoom)||1;
      const espacio=this.plano.closest('.espacio'),barra=this.plano.previousElementSibling;
      const ancho=this.plano.getBoundingClientRect().width;
      const altoVisible=Math.max(110,espacio.getBoundingClientRect().height-barra.getBoundingClientRect().height-28);
      const tam=Math.round(limitar(Math.sqrt(ancho*altoVisible/(this.nodos.length*3.3)),44,74));
      let alto=Math.max(altoVisible,this.nodos.length*tam*tam*2.65/ancho);
      const mismoAncho=Math.abs(ancho-this.mundo.w)<1;
      if(!inicial&&mismoAncho&&(Math.abs(tam-this.mundo.tam)<1&&Math.abs(alto-this.mundo.h)<1||this.movimiento&&Math.abs(tam-this.mundo.tam)<=2&&Math.abs(alto-this.mundo.h)<32)){this.plano.style.height=(this.mundo.h/z)+'px';this.plano.style.setProperty('--tam-nodo',(this.mundo.tam/z)+'px');this.pintar();return;}
      this.cancelar();const anterior=this.mundo;
      if(inicial||!anterior.w||!this.enlaces.length&&!this.historial.length){
        // Dispersión uniforme, sin filas visibles y con separación táctil.
        const margen=tam*.8;
        for(let intento=0;intento<4;intento++){
          const colocados=[];let valido=true;
          for(const n of this.nodos){let mejor=null;
            for(let k=0;k<70;k++){const punto={x:margen+Math.random()*Math.max(0,ancho-2*margen),y:margen+Math.random()*Math.max(0,alto-2*margen)};const d=colocados.length?Math.min(...colocados.map(p=>distancia(p,punto))):Infinity;if(!mejor||d>mejor.d)mejor={...punto,d};if(d>=tam*1.45)break;}
            if(mejor.d<tam*1.18){valido=false;break;}n.x=mejor.x;n.y=mejor.y;colocados.push(n);
          }
          if(valido)break;alto*=1.25;
        }
      }else{
        const escala=tam/anterior.tam;
        for(const ids of this.componentes()){
          const ns=ids.map(id=>this.nodos[id]),cx=ns.reduce((s,n)=>s+n.x,0)/ns.length,cy=ns.reduce((s,n)=>s+n.y,0)/ns.length;
          let puntos=ns.map(n=>({n,x:(n.x-cx)*escala,y:(n.y-cy)*escala}));
          if(Math.max(...puntos.map(p=>p.x))-Math.min(...puntos.map(p=>p.x))>ancho-tam*1.4)puntos=puntos.map(p=>({...p,x:-p.y,y:p.x}));
          const minX=Math.min(...puntos.map(p=>p.x)),maxX=Math.max(...puntos.map(p=>p.x)),minY=Math.min(...puntos.map(p=>p.y)),maxY=Math.max(...puntos.map(p=>p.y));
          alto=Math.max(alto,maxY-minY+tam*1.6);
          const x=limitar(cx/anterior.w*ancho,tam*.7-minX,ancho-tam*.7-maxX),y=limitar(cy/anterior.h*alto,tam*.7-minY,alto-tam*.7-maxY);
          for(const p of puntos){p.n.x=x+p.x;p.n.y=y+p.y;}
        }
      }
      if(!inicial&&anterior.w&&this.enlaces.length)alto=this.repartirComponentes(ancho,alto,tam);
      const gruposActuales=this.componentes();this.mundo={w:ancho,h:Math.ceil(alto),tam};this.enlaces=this.calcularEnlaces(gruposActuales);this.plano.style.height=(this.mundo.h/z)+'px';
      this.plano.style.setProperty('--tam-nodo',(tam/z)+'px');this.svg.setAttribute('viewBox',`0 0 ${ancho} ${this.mundo.h}`);
      this.pintar();
    }
    repartirComponentes(w,h,tam) {
      const colocados=[],grupos=this.componentes().sort((a,b)=>b.length-a.length),m=tam*.7;
      for(const ids of grupos){const ns=ids.map(id=>this.nodos[id]),cx=ns.reduce((s,n)=>s+n.x,0)/ns.length,cy=ns.reduce((s,n)=>s+n.y,0)/ns.length;
        const puntos=ns.map(n=>({n,x:n.x-cx,y:n.y-cy})),minX=Math.min(...puntos.map(p=>p.x)),maxX=Math.max(...puntos.map(p=>p.x)),minY=Math.min(...puntos.map(p=>p.y)),maxY=Math.max(...puntos.map(p=>p.y));
        let destino=null;
        for(let intento=0;intento<4&&!destino;intento++){
          for(let k=0;k<140;k++){const x=k===0?limitar(cx,m-minX,w-m-maxX):m-minX+Math.random()*Math.max(0,w-2*m-maxX+minX),y=k===0?limitar(cy,m-minY,h-m-maxY):m-minY+Math.random()*Math.max(0,h-2*m-maxY+minY);
            if(puntos.every(p=>colocados.every(n=>Math.hypot(p.x+x-n.x,p.y+y-n.y)>=tam*1.12))){destino={x,y};break;}}
          if(!destino)h*=1.3;
        }
        destino??={x:limitar(cx,m-minX,w-m-maxX),y:h-m-maxY};
        for(const p of puntos){p.n.x=destino.x+p.x;p.n.y=destino.y+p.y;colocados.push(p.n);}
      }
      return h;
    }
    actualizar(cambio=false) {
      if(!this.arrastre&&!this.movimiento)this.enlaces=this.calcularEnlaces(this.componentes());
      this.pintar();if(cambio)this.alCambiar?.(this.completos());
    }
    pintar() {
      if(!this.nodos.length)return;
      const {w,h,tam}=this.mundo,grupos=this.componentes();if(!w)return;
      const porId=new Map();for(const g of grupos)for(const id of g)porId.set(id,g);
      for(const n of this.nodos){const b=this.botones.get(n.id),g=porId.get(n.id);b.style.left=(n.x/w*100)+'%';b.style.top=(n.y/h*100)+'%';b.classList.toggle('elegida',n.id===this.seleccion);b.classList.toggle('moviendo',!!this.arrastre?.movido&&this.arrastre.ids.includes(n.id));b.classList.toggle('grupo-cerrado',this.ayuda&&g.length===this.cantidad);b.classList.toggle('atraccion',!!this.candidato&&!this.candidato.bloqueado&&this.candidato.destino.includes(n.id));b.dataset.grupo=String(g[0]);b.dataset.cantidad=String(g.length);b.setAttribute('aria-pressed',String(n.id===this.seleccion));b.setAttribute('aria-label',this.nombreFigura+' '+(n.id+1)+(this.ayuda&&g.length===this.cantidad?this.t(', grupo completo',', complete group'):''));b.disabled=this.resuelto||this.movimiento?.tipo==='ajuste';}
      let svg='';
      if(this.ayuda)for(const g of grupos.filter(g=>g.length===this.cantidad&&!(this.movimiento?.tipo==='ajuste'&&g.some(id=>this.movimiento.ids.includes(id))))){
        const ns=g.map(id=>this.nodos[id]),radio=tam*.64;
        const puntos=ns.flatMap(n=>Array.from({length:12},(_,i)=>({x:limitar(n.x+radio*Math.cos(i*Math.PI/6),2,w-2),y:limitar(n.y+radio*Math.sin(i*Math.PI/6),2,h-2)})));
        const casco=envolvente(puntos);svg+=`<polygon class="marco-completo" points="${casco.map(p=>p.x+','+p.y).join(' ')}"/>`;
        const minX=Math.min(...ns.map(n=>n.x)),maxX=Math.max(...ns.map(n=>n.x)),minY=Math.min(...ns.map(n=>n.y)),maxY=Math.max(...ns.map(n=>n.y)),cx=(minX+maxX)/2,cy=(minY+maxY)/2;
        const opciones=[{x:cx,y:minY-radio-13},{x:cx,y:maxY+radio+13},{x:minX-radio-48,y:cy},{x:maxX+radio+48,y:cy},{x:minX-radio-48,y:minY},{x:maxX+radio+48,y:minY}];
        const etiqueta=opciones.find(p=>p.x>=48&&p.x<=w-48&&p.y>=12&&p.y<=h-12&&this.nodos.every(n=>Math.hypot(Math.max(Math.abs(n.x-p.x)-46,0),Math.max(Math.abs(n.y-p.y)-10,0))>tam*.46))||{x:limitar(cx,49,w-49),y:limitar(minY-radio-13,13,h-13)},x=etiqueta.x,y=etiqueta.y;
        svg+=`<g class="etiqueta-completo"><rect x="${x-46}" y="${y-10}" width="92" height="20" rx="10"/><text x="${x}" y="${y+4}" text-anchor="middle">${this.t('✓ Completo','✓ Complete')}</text></g>`;
      }
      for(const [a,b]of this.calcularEnlaces(grupos)){const p=this.nodos[a],q=this.nodos[b];svg+=`<line class="enlace" data-a="${a}" data-b="${b}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;}
      if(this.candidato&&!this.candidato.bloqueado&&this.conexionLibre(this.candidato.a,this.candidato.b)){const {a,b}=this.candidato,p=this.nodos[a],q=this.nodos[b];svg+=`<line class="enlace-propuesto" data-a="${a}" data-b="${b}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;}
      this.svg.innerHTML=svg;
      this.separar.disabled=this.resuelto||this.seleccion===null||!this.enlaces.some(e=>e.includes(this.seleccion));
      this.deshacer.disabled=this.resuelto||!this.historial.length;
    }
    programar(){if(!this.raf)this.raf=requestAnimationFrame(()=>{this.raf=0;this.pintar();});}
    posicion(e){const r=this.plano.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
    tomar(e) {
      const b=e.target.closest('[data-nodo]');if(!b||this.resuelto||this.movimiento?.tipo==='ajuste'||e.button>0||e.isPrimary===false||this.arrastre)return;this.detenerMovimiento();
      e.preventDefault();const id=+b.dataset.nodo,ids=this.componentes().find(g=>g.includes(id)),p=this.posicion(e);
      this.arrastre={id:e.pointerId,nodo:id,ids,origen:b,inicio:p,antes:this.captura(),movido:false,clienteX:e.clientX,clienteY:e.clientY,muestras:[{x:e.clientX,y:e.clientY,t:performance.now()}]};
      b.setPointerCapture(e.pointerId);this.programar();
    }
    mover(e) {
      const d=this.arrastre;if(!d||d.id!==e.pointerId)return;e.preventDefault();d.clienteX=e.clientX;d.clienteY=e.clientY;const ahora=performance.now();d.muestras.push({x:e.clientX,y:e.clientY,t:ahora});d.muestras=d.muestras.filter(m=>ahora-m.t<130);
      const p=this.posicion(e),dx=p.x-d.inicio.x,dy=p.y-d.inicio.y;
      if(!d.movido&&Math.hypot(dx,dy)<5)return;
      if(!d.movido){d.movido=true;this.seleccion=d.nodo;this.autoDesplazar();}
      const ns=d.ids.map(id=>d.antes.nodos[id]),m=this.mundo.tam*.55;
      const x=limitar(dx,m-Math.min(...ns.map(n=>n.x)),this.mundo.w-m-Math.max(...ns.map(n=>n.x)));
      const y=limitar(dy,m-Math.min(...ns.map(n=>n.y)),this.mundo.h-m-Math.max(...ns.map(n=>n.y)));
      for(const n of ns){this.nodos[n.id].x=n.x+x;this.nodos[n.id].y=n.y+y;}
      this.candidato=this.buscar(d.ids);this.programar();
    }
    autoDesplazar() {
      cancelAnimationFrame(this.scrollRaf);
      const paso=()=>{const d=this.arrastre;if(!d?.movido)return;const s=this.plano.closest('.espacio'),r=s.getBoundingClientRect();
        if(d.clienteX>=r.left&&d.clienteX<=r.right){const v=d.clienteY>r.bottom-35?Math.min(11,(d.clienteY-r.bottom+35)/3):d.clienteY<r.top+35?-Math.min(11,(r.top+35-d.clienteY)/3):0;if(v){s.scrollTop+=v/(parseFloat(getComputedStyle(document.body).zoom)||1);this.mover({pointerId:d.id,clientX:d.clienteX,clientY:d.clienteY,preventDefault(){}});}}
        this.scrollRaf=requestAnimationFrame(paso);};this.scrollRaf=requestAnimationFrame(paso);
    }
    buscar(ids) {
      if(this.ayuda&&ids.length>=this.cantidad)return null;
      const propios=new Set(ids),grupos=this.componentes();let mejor=null;
      for(const a of ids)for(const n of this.nodos){if(propios.has(n.id))continue;const d=distancia(this.nodos[a],n);if(d>this.mundo.tam*1.65||mejor&&d>=mejor.distancia||d>this.mundo.tam*.25&&!this.conexionLibre(a,n.id))continue;const destino=grupos.find(g=>g.includes(n.id));mejor={a,b:n.id,distancia:d,destino,bloqueado:this.ayuda&&(ids.length>=this.cantidad||destino.length>=this.cantidad||ids.length+destino.length>this.cantidad)};}
      return mejor;
    }
    encajar(ids,candidato) {
      if(this.disposicion!=='libre')return this.formarGrupo(ids,candidato);
      const {tam,w,h}=this.mundo,paso=tam*1.22,m=tam*.57,otros=this.nodos.filter(n=>!ids.includes(n.id));
      const anclas=candidato.destino.map(id=>({id,d:Math.min(...ids.map(i=>distancia(this.nodos[i],this.nodos[id])))})).filter(p=>p.d<=tam*1.7).sort((a,b)=>a.d-b.d);
      const cambios=[0];for(let i=1;i<=12;i++){cambios.push(i,-i);}
      // Acercar al grupo y enlazar a todas las vecinas próximas con un paso libre.
      for(const ancla of anclas){const b=this.nodos[ancla.id],a=ids.map(id=>this.nodos[id]).sort((p,q)=>distancia(p,b)-distancia(q,b))[0],angulo=Math.atan2(a.y-b.y,a.x-b.x);
        for(const cambio of cambios)for(const giro of [0,Math.PI/3,-Math.PI/3,Math.PI*2/3,-Math.PI*2/3,Math.PI]){
          const ang=angulo+cambio*Math.PI/12,x=b.x+paso*Math.cos(ang),y=b.y+paso*Math.sin(ang),co=Math.cos(giro),si=Math.sin(giro);
          const puntos=ids.map(id=>{const n=this.nodos[id],dx=n.x-a.x,dy=n.y-a.y;return {id,x:x+dx*co-dy*si,y:y+dx*si+dy*co};});
          if(puntos.some(p=>p.x<m||p.x>w-m||p.y<m||p.y>h-m||otros.some(n=>distancia(p,n)<tam*1.04)))continue;
          const propuesta=this.nodos.map(n=>({...n}));for(const p of puntos)Object.assign(propuesta[p.id],{x:p.x,y:p.y});
          const juntos=[...ids,...candidato.destino].sort((a,b)=>a-b),incluidos=new Set(juntos),grupos=this.componentes().filter(g=>!g.some(id=>incluidos.has(id))).concat([juntos]);
          const enlaces=this.calcularEnlaces(grupos,propuesta);
          if(grupos.some(g=>!this.conectado(g,enlaces)))continue;
          this.animarHasta(puntos,grupos,enlaces);return true;
        }
      }
      return false;
    }
    plantilla(cantidad) {
      const paso=this.mundo.tam*.98,h=Math.sqrt(3)/2;
      if(this.disposicion==='hileras')return Array.from({length:cantidad},(_,i)=>({x:(i-(cantidad-1)/2)*paso,y:0}));
      const simples={1:[[0,0]],2:[[-.5,0],[.5,0]],3:[[-.5,h/3],[.5,h/3],[0,-2*h/3]],4:[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]],5:[[0,0],[1,0],[0,1],[-1,0],[0,-1]],6:[[-1,-h],[0,-h],[1,-h],[-.5,0],[.5,0],[0,h]],7:[[0,0],[1,0],[.5,h],[-.5,h],[-1,0],[-.5,-h],[.5,-h]],8:[[-1,-h],[0,-h],[1,-h],[-.5,0],[.5,0],[-1,h],[0,h],[1,h]]};
      let puntos=simples[cantidad]?.map(([x,y])=>({x,y}));
      if(!puntos){const radio=Math.ceil(Math.sqrt(cantidad))+2,maxX=(this.mundo.w-this.mundo.tam*1.3)/(2*paso);puntos=[];
        for(let r=-radio;r<=radio;r++)for(let q=-radio;q<=radio;q++){const x=q+r*.5,y=r*h;if(Math.abs(x)<=maxX)puntos.push({x,y});}
        puntos.sort((a,b)=>a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y||Math.atan2(a.y,a.x)-Math.atan2(b.y,b.x));puntos=puntos.slice(0,cantidad);
      }
      const cx=puntos.reduce((s,p)=>s+p.x,0)/cantidad,cy=puntos.reduce((s,p)=>s+p.y,0)/cantidad;
      return puntos.map(p=>({x:(p.x-cx)*paso,y:(p.y-cy)*paso}));
    }
    asignar(ids,lugares) {
      const pares=[];for(const id of ids)for(let j=0;j<lugares.length;j++)pares.push({id,j,d:distancia(this.nodos[id],lugares[j])});
      pares.sort((a,b)=>a.d-b.d);const usados=new Set(),ocupados=new Set(),resultado=[];
      for(const p of pares)if(!usados.has(p.id)&&!ocupados.has(p.j)){usados.add(p.id);ocupados.add(p.j);resultado.push({id:p.id,...lugares[p.j]});}
      return resultado;
    }
    formarGrupo(ids,candidato) {
      const juntos=[...ids,...candidato.destino].sort((a,b)=>a-b),incluidos=new Set(juntos),otros=this.nodos.filter(n=>!incluidos.has(n.id));
      const grupos=this.componentes().filter(g=>!g.some(id=>incluidos.has(id))).concat([juntos]),{tam,w}=this.mundo,m=tam*.6,base=this.plantilla(juntos.length);
      let alto=this.mundo.h;
      const centro=candidato.destino.reduce((p,id)=>({x:p.x+this.nodos[id].x/candidato.destino.length,y:p.y+this.nodos[id].y/candidato.destino.length}),{x:0,y:0});
      const angulos=this.disposicion==='hileras'?[0,Math.PI/2]:[0,Math.PI/6,-Math.PI/6,Math.PI/2,Math.PI,-Math.PI/2];
      const centros=[centro];for(let r=1;r<=6;r++)for(let i=0;i<12;i++){const a=i*Math.PI/6;centros.push({x:centro.x+Math.cos(a)*r*tam*.45,y:centro.y+Math.sin(a)*r*tam*.45});}
      let mejor=null;
      const buscarCentros=(lista,apartar=false)=>{for(const ang of angulos){const co=Math.cos(ang),si=Math.sin(ang),puntos=base.map(p=>({x:p.x*co-p.y*si,y:p.x*si+p.y*co})),minX=Math.min(...puntos.map(p=>p.x)),maxX=Math.max(...puntos.map(p=>p.x)),minY=Math.min(...puntos.map(p=>p.y)),maxY=Math.max(...puntos.map(p=>p.y));
        if(maxX-minX>w-2*m)continue;const disponible=Math.max(alto,maxY-minY+2*m);
        for(const c of lista){const cx=limitar(c.x,m-minX,w-m-maxX),cy=limitar(c.y,m-minY,disponible-m-maxY),lugares=puntos.map(p=>({x:p.x+cx,y:p.y+cy}));
          const obstaculos=otros.filter(n=>lugares.some(p=>distancia(p,n)<tam*1.06));
          if(obstaculos.length&&!apartar||obstaculos.some(n=>this.enlaces.some(e=>e.includes(n.id))))continue;
          const destinos=this.asignar(juntos,lugares),reservados=[...lugares,...otros.filter(n=>!obstaculos.includes(n))];let cabe=true;
          for(const n of obstaculos){let sitio=null,menor=Infinity;
            for(let y=m;y<disponible-m;y+=tam*.45)for(let x=m;x<w-m;x+=tam*.45){const d=(x-n.x)**2+(y-n.y)**2;if(d>=menor||reservados.some(p=>Math.hypot(x-p.x,y-p.y)<tam*1.08))continue;sitio={id:n.id,x,y};menor=d;}
            if(!sitio){cabe=false;break;}destinos.push(sitio);reservados.push(sitio);
          }
          if(!cabe)continue;
          const coste=destinos.reduce((s,p)=>s+distancia(this.nodos[p.id],p)**2,0)/juntos.length+Math.hypot(cx-centro.x,cy-centro.y)**2*.4;
          if(mejor&&coste>=mejor.coste)continue;
          const propuesta=this.nodos.map(n=>({...n}));for(const p of destinos)Object.assign(propuesta[p.id],{x:p.x,y:p.y});
          const enlaces=this.calcularEnlaces(grupos,propuesta);if(grupos.some(g=>!this.conectado(g,enlaces)))continue;
          mejor={destinos,enlaces,coste,alto:disponible};
        }
      }
      };
      buscarCentros(centros);
      // En rondas densas buscar un claro más amplio antes de rechazar la unión.
      if(!mejor){const libres=[];for(let y=m;y<alto;y+=tam*.5)for(let x=m;x<w;x+=tam*.5)libres.push({x,y});libres.sort((a,b)=>distancia(a,centro)-distancia(b,centro));buscarCentros(libres);}
      if(!mejor)buscarCentros(centros,true);
      if(!mejor)return false;
      if(mejor.alto>this.mundo.h){this.mundo.h=Math.ceil(mejor.alto);const z=parseFloat(getComputedStyle(document.body).zoom)||1;this.plano.style.height=(this.mundo.h/z)+'px';this.svg.setAttribute('viewBox',`0 0 ${w} ${this.mundo.h}`);}
      this.animarHasta(mejor.destinos,grupos,mejor.enlaces);return true;
    }
    animarHasta(destinos,grupos,enlaces) {
      this.detenerMovimiento();this.enlaces=enlaces;
      const inicio=destinos.map(p=>({id:p.id,x:this.nodos[p.id].x,y:this.nodos[p.id].y}));
      if(matchMedia('(prefers-reduced-motion: reduce)').matches||destinos.every((p,i)=>distancia(p,inicio[i])<1)){for(const p of destinos)Object.assign(this.nodos[p.id],{x:p.x,y:p.y});return;}
      const movimiento={tipo:'ajuste',ids:destinos.map(p=>p.id),inicio,destinos,grupos,tiempo:null};this.movimiento=movimiento;this.plano.dataset.movimiento='ajuste';
      const paso=ms=>{if(this.movimiento!==movimiento)return;movimiento.tiempo??=ms;const t=Math.min(1,(ms-movimiento.tiempo)/520),k=7.5,f=(1-(1+k*t)*Math.exp(-k*t))/(1-(1+k)*Math.exp(-k));
        for(let i=0;i<destinos.length;i++){const a=inicio[i],b=destinos[i];Object.assign(this.nodos[b.id],{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f});}
        this.pintar();if(t<1)this.movimientoRaf=requestAnimationFrame(paso);else{const fin=movimiento.alFinal;this.movimiento=null;this.plano.dataset.movimiento='reposo';this.enlaces=this.calcularEnlaces(grupos);this.pintar();fin?.();}};
      this.movimientoRaf=requestAnimationFrame(paso);
    }
    detenerMovimiento() {
      const m=this.movimiento;if(!m)return;cancelAnimationFrame(this.movimientoRaf);this.movimiento=null;this.plano.dataset.movimiento='reposo';
      if(m.tipo==='ajuste'){for(const p of m.destinos)Object.assign(this.nodos[p.id],{x:p.x,y:p.y});this.enlaces=this.calcularEnlaces(m.grupos);}
      this.pintar();
    }
    notificarGrupo(id) {
      const fin=()=>{if(this.resuelto)return;const g=this.componentes().find(g=>g.includes(id));if(g?.length===this.cantidad)this.alCompletar?.(this.completos());};
      if(this.movimiento?.tipo==='ajuste')this.movimiento.alFinal=fin;else fin();
    }
    deslizar(d) {
      if(!this.inercia||this.resuelto||matchMedia('(prefers-reduced-motion: reduce)').matches||d.muestras.length<2)return;
      const ultimo=d.muestras.at(-1),primero=d.muestras[0],dt=Math.max(16,ultimo.t-primero.t),v={x:(ultimo.x-primero.x)/dt,y:(ultimo.y-primero.y)/dt};
      const velocidad=Math.hypot(v.x,v.y);if(velocidad<.055)return;const factor=Math.min(1,.65/velocidad);v.x*=factor;v.y*=factor;
      const movimiento={tipo:'inercia',ids:d.ids,v,previo:null,inicio:null};this.movimiento=movimiento;this.plano.dataset.movimiento='inercia';
      const paso=ms=>{if(this.movimiento!==movimiento)return;movimiento.previo??=ms;movimiento.inicio??=ms;const tiempo=Math.min(24,ms-movimiento.previo);movimiento.previo=ms;
        const antes=d.ids.map(id=>({id,x:this.nodos[id].x,y:this.nodos[id].y})),m=this.mundo.tam*.56;
        let dx=v.x*tiempo,dy=v.y*tiempo;
        if(antes.some(n=>n.x+dx<m||n.x+dx>this.mundo.w-m)){dx=0;v.x=0;}if(antes.some(n=>n.y+dy<m||n.y+dy>this.mundo.h-m)){dy=0;v.y=0;}
        for(const n of antes)Object.assign(this.nodos[n.id],{x:n.x+dx,y:n.y+dy});
        const candidato=this.buscar(d.ids);
        if(candidato&&!candidato.bloqueado){this.movimiento=null;this.plano.dataset.movimiento='reposo';if(this.encajar(d.ids,candidato)){this.actualizar(true);this.notificarGrupo(d.nodo);return;}this.movimiento=movimiento;this.plano.dataset.movimiento='inercia';}
        const choque=this.nodos.some(n=>!d.ids.includes(n.id)&&d.ids.some(id=>distancia(n,this.nodos[id])<this.mundo.tam*1.04));
        if(choque){for(const n of antes)Object.assign(this.nodos[n.id],{x:n.x,y:n.y});v.x=0;v.y=0;}
        const freno=Math.exp(-tiempo/210);v.x*=freno;v.y*=freno;this.pintar();
        if(Math.hypot(v.x,v.y)>.018&&ms-movimiento.inicio<900)this.movimientoRaf=requestAnimationFrame(paso);else{this.movimiento=null;this.plano.dataset.movimiento='reposo';this.actualizar();}
      };
      this.movimientoRaf=requestAnimationFrame(paso);
    }
    soltar(e) {
      const d=this.arrastre;if(!d||d.id!==e.pointerId)return;e.preventDefault();
      if(d.movido)this.mover(e);const candidato=this.candidato;this.liberar();
      if(!d.movido){this.tocar(d.nodo);return;}
      let unido=false;
      if(candidato?.bloqueado){this.restaurarPosiciones(d.antes);this.alAvisar?.(d.ids.length>=this.cantidad||candidato.destino.length>=this.cantidad?this.t('Este grupo está completo. Forma otro grupo.','This group is complete. Start another group.'):this.t(`Juntos tendrían más de ${this.cantidad}. Separa alguna figura o busca otro grupo.`,`Together they would have more than ${this.cantidad}. Separate a shape or find another group.`));}
      else if(candidato){unido=this.encajar(d.ids,candidato);if(!unido){this.restaurarPosiciones(d.antes);this.alAvisar?.(this.t('Busca un espacio libre junto al grupo.','Find some free space next to the group.'));}}
      else if(this.nodos.some(n=>!d.ids.includes(n.id)&&d.ids.some(id=>distancia(n,this.nodos[id])<this.mundo.tam*1.04)))this.restaurarPosiciones(d.antes);
      const cambio=JSON.stringify(d.antes.nodos)!==JSON.stringify(this.captura().nodos)||unido;
      if(cambio)this.recordar(d.antes);this.actualizar(unido);
      if(unido)this.notificarGrupo(d.nodo);else if(cambio&&!candidato?.bloqueado)this.deslizar(d);
    }
    liberar(){const d=this.arrastre;this.arrastre=null;this.candidato=null;cancelAnimationFrame(this.scrollRaf);if(d)try{d.origen.releasePointerCapture(d.id);}catch{};}
    cancelar(){this.detenerMovimiento();if(this.arrastre){const antes=this.arrastre.antes;this.liberar();this.restaurarPosiciones(antes);this.programar();}}
    restaurarPosiciones(antes){for(const n of antes.nodos)if(this.nodos[n.id])Object.assign(this.nodos[n.id],{x:n.x,y:n.y});}
    tocar(id) {
      if(this.resuelto)return;
      if(this.seleccion!==null&&this.seleccion!==id){
        const ids=this.componentes().find(g=>g.includes(this.seleccion)),destino=this.componentes().find(g=>g.includes(id));
        if(!ids.includes(id)&&distancia(this.nodos[this.seleccion],this.nodos[id])<=this.mundo.tam*1.65){
          const antes=this.captura(),c={a:this.seleccion,b:id,destino,bloqueado:this.ayuda&&(ids.length+destino.length>this.cantidad||ids.length>=this.cantidad||destino.length>=this.cantidad)};
          if(!c.bloqueado&&this.encajar(ids,c)){this.recordar(antes);this.actualizar(true);if(ids.length+destino.length===this.cantidad)this.notificarGrupo(id);return;}
        }
      }
      this.seleccion=id;this.actualizar();
    }
    separarSeleccion() {
      this.detenerMovimiento();if(this.resuelto||this.seleccion===null||!this.enlaces.some(e=>e.includes(this.seleccion)))return;
      const anteriores=new Set(this.componentes().filter(g=>g.length===this.cantidad).map(g=>g.join(',')));
      this.recordar(this.captura());this.enlaces=this.enlaces.filter(e=>!e.includes(this.seleccion));this.actualizar(true);
      if(this.componentes().some(g=>g.length===this.cantidad&&!anteriores.has(g.join(','))))this.alCompletar?.(this.completos());
    }
    deshacerUltimo() {
      const antes=this.historial.pop();if(!antes||this.resuelto)return;
      this.cancelar();const cambio=JSON.stringify(this.componentes())!==JSON.stringify(this.componentes(antes.enlaces));this.enlaces=antes.enlaces.map(e=>e.slice());
      this.restaurarPosiciones(antes);this.mundo={...antes.mundo};this.adaptar();
      this.actualizar(cambio);
    }
    tecla(e) {
      const b=e.target.closest('[data-nodo]');if(!b||this.resuelto||this.movimiento?.tipo==='ajuste')return;this.detenerMovimiento();const id=+b.dataset.nodo;
      if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();this.seleccion=id;this.separarSeleccion();return;}
      const cambio={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!cambio)return;e.preventDefault();
      const antes=this.captura(),ids=this.componentes().find(g=>g.includes(id)),paso=this.mundo.tam*.35,m=this.mundo.tam*.55;
      if(ids.some(i=>this.nodos[i].x+cambio[0]*paso<m||this.nodos[i].x+cambio[0]*paso>this.mundo.w-m||this.nodos[i].y+cambio[1]*paso<m||this.nodos[i].y+cambio[1]*paso>this.mundo.h-m))return;
      for(const i of ids){this.nodos[i].x+=cambio[0]*paso;this.nodos[i].y+=cambio[1]*paso;}
      const c=this.buscar(ids);let unido=false;
      if(c?.bloqueado){this.restaurarPosiciones(antes);this.alAvisar?.(this.t('Este grupo está completo. Forma otro grupo.','This group is complete. Start another group.'));}
      else if(c){unido=this.encajar(ids,c);if(!unido)this.restaurarPosiciones(antes);}
      else if(this.nodos.some(n=>!ids.includes(n.id)&&ids.some(i=>distancia(n,this.nodos[i])<this.mundo.tam*1.04)))this.restaurarPosiciones(antes);
      if(unido||JSON.stringify(antes.nodos)!==JSON.stringify(this.captura().nodos))this.recordar(antes);this.seleccion=id;this.actualizar(unido);if(unido&&ids.length+c.destino.length===this.cantidad)this.notificarGrupo(id);
    }
    bloquear(){this.detenerMovimiento();this.resuelto=true;this.actualizar();}
    pista(){const g=this.componentes().find(g=>g.length<this.cantidad);if(g){this.seleccion=g[0];this.actualizar();}return this.t(`Acerca las figuras hasta unir ${this.cantidad}. Los enlaces muestran cada grupo.`,`Bring the shapes together until you have ${this.cantidad}. The links show each group.`);}
  }
  window.GruposMagneticos=GruposMagneticos;
})();
