/* Una sola animación para tres recipientes. Sin lecturas de diseño por fotograma. */
window.AnimacionCapacidad=(()=>{
  function marcado(id,prefijo,estilo){
    return window.DIBUJOS_CAPACIDAD.escenas[id].svg
      .replace(/\bid="([^"]+)"/g,(_,name)=>`id="${prefijo}-${name}"`)
      .replace(/url\(#([^)]+)\)/g,(_,name)=>`url(#${prefijo}-${name})`)
      .replace('<svg ',`<svg class="dibujo-capacidad" aria-hidden="true" focusable="false" style="${estilo}" `);
  }
  function superficie(forma,fraccion){
    const table=window.DIBUJOS_CAPACIDAD.curvas[forma],v=Math.max(0,Math.min(1,fraccion));
    if(v===0)return table[0];if(v===1)return table.at(-1);
    let lo=0,hi=table.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(table[mid].v<v)lo=mid;else hi=mid;}
    const a=table[lo],b=table[hi],f=(v-a.v)/(b.v-a.v);return{h:a.h+(b.h-a.h)*f,r:a.r+(b.r-a.r)*f};
  }
  function unidadesEn(button){
    return [...button.querySelectorAll('[data-vasito]')].map(svg=>({indice:+svg.dataset.vasito,svg,agua:svg.querySelector('[data-vaso-agua]'),rect:svg.querySelector('[data-vaso-rect]'),superficie:svg.querySelector('[data-vaso-superficie]'),fraccion:-1}));
  }
  function pintarUnidades(node,volumen){
    for(const u of node.unidades){const f=Math.max(0,Math.min(1,volumen/100-u.indice));if(Math.abs(f-u.fraccion)<.000001)continue;u.fraccion=f;
      u.svg.setAttribute('data-fraccion',f.toFixed(6));u.agua.setAttribute('opacity',f>0?'1':'0');const y=32-26*f;
      u.rect.setAttribute('y',y.toFixed(4));u.rect.setAttribute('height',(26*f+3).toFixed(4));u.superficie.setAttribute('cy',y.toFixed(4));
    }
  }
  function crear(item,onProgress,onEnd){
    const geometry=window.DIBUJOS_CAPACIDAD.escenas[item.asset.id].geometria;
    const destinos=item.objetivo==='capacidad'?item.asset.capacidades:item.asset.agua;
    const nodos=item.opciones.map((o,i)=>{const root=document.querySelector(`#eleccion-${i} svg.dibujo-capacidad`),agua=root.querySelector(`[data-agua="${o.fuente}"]`);return{button:root.closest('button'),unidades:unidadesEn(root.closest('button')),fuente:o.fuente,g:geometry[o.fuente],agua,rect:agua.querySelector('[data-rect]'),ellipse:agua.querySelector('[data-superficie]'),chorro:root.querySelector(`[data-chorro="${o.fuente}"]`)};});
    const session={item,volumenes:[0,0,0],activo:false,terminado:false,cancelado:false,pausado:false,transcurrido:0,frame:null,last:null,ultimoAviso:-Infinity};
    function dibujar(ml,corriendo){
      session.volumenes=destinos.map(target=>Math.min(target,ml));
      for(const node of nodos){const f=node.fuente,volume=session.volumenes[f],s=superficie(node.g.forma,volume/item.asset.capacidades[f]),y=node.g.base-s.h*node.g.altura,r=node.g.radio*s.r;
        node.agua.setAttribute('opacity',volume>0?'1':'0');node.rect.setAttribute('y',y.toFixed(2));node.rect.setAttribute('height',Math.max(0,node.g.base+(node.g.baseRy||0)-y+4).toFixed(2));
        node.ellipse.setAttribute('cy',y.toFixed(2));node.ellipse.setAttribute('rx',r.toFixed(2));node.ellipse.setAttribute('ry',Math.max(2,r*.14).toFixed(2));
        pintarUnidades(node,volume);
        node.chorro.setAttribute('d',`M${node.g.centro} ${(node.g.base-node.g.altura).toFixed(2)}V${y.toFixed(2)}`);node.chorro.setAttribute('opacity',corriendo&&volume<destinos[f]?'0.8':'0');
      }
    }
    function terminar(){session.activo=false;session.terminado=true;session.frame=null;dibujar(Math.max(...destinos),false);onProgress(session);onEnd(session);}
    function tick(now){
      if(session.cancelado||!session.activo||session.pausado)return;
      if(session.last===null){session.last=now;session.frame=requestAnimationFrame(tick);return;}
      const dt=now-session.last;if(dt<1000/30){session.frame=requestAnimationFrame(tick);return;}
      session.transcurrido+=Math.min(dt,100);session.last=now;
      const ml=session.transcurrido*.1; // 100 mL/s: un vasito por segundo en todos los recipientes.
      if(ml>=Math.max(...destinos)){terminar();return;}
      dibujar(ml,true);if(now-session.ultimoAviso>=120){session.ultimoAviso=now;onProgress(session);}
      session.frame=requestAnimationFrame(tick);
    }
    session.iniciar=()=>{if(session.cancelado)return;cancelAnimationFrame(session.frame);session.terminado=false;session.activo=true;session.pausado=false;session.transcurrido=0;session.last=null;session.ultimoAviso=-Infinity;dibujar(0,true);onProgress(session);
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){terminar();return;}session.frame=requestAnimationFrame(tick);};
    session.pausar=()=>{if(!session.activo||session.pausado)return;session.pausado=true;cancelAnimationFrame(session.frame);session.frame=null;session.last=null;};
    session.reanudar=()=>{if(!session.activo||!session.pausado||session.cancelado)return;session.pausado=false;session.last=null;session.frame=requestAnimationFrame(tick);};
    session.sincronizarVasitos=()=>{for(const node of nodos){node.unidades=unidadesEn(node.button);pintarUnidades(node,session.volumenes[node.fuente]);}};
    session.cancelar=()=>{session.cancelado=true;session.activo=false;cancelAnimationFrame(session.frame);session.frame=null;};
    dibujar(0,false);return session;
  }
  return{marcado,crear,superficie};
})();
