/* Modos 3–5: preferencias independientes; las respuestas sobreviven al cambio de distribución. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const t=(es,en)=>IdiomaVoz.idioma==='en'?en:es;
  const defaults={cantidad:6,porPagina:1,tablas:[2,3,4,5],minFactor:1,maxFactor:10,sobrantes:false,cantidadSobrantes:2,ladoSobrantes:'derecha',tipo:'producto',posicionFactor:'variado',opciones:3,sonidos:true};
  function sanitize(value){
    const c={...defaults,...value};
    c.tablas=Array.isArray(c.tablas)?[...new Set(c.tablas.filter(n=>Number.isInteger(n)&&n>=1&&n<=12))].sort((a,b)=>a-b):[...defaults.tablas];
    for(const[k,min,max]of [['cantidad',1,24],['porPagina',1,4],['minFactor',0,12],['maxFactor',0,12],['cantidadSobrantes',0,6],['opciones',3,4]])c[k]=clamp(Number.isFinite(Number(c[k]))?Math.round(Number(c[k])):defaults[k],min,max);
    c.minFactor=1;c.maxFactor=10;c.opciones=Number(c.opciones)>=4?4:3;
    for(const[k,vs]of Object.entries({ladoSobrantes:['izquierda','derecha','ambos'],tipo:['producto','factor','mixto'],posicionFactor:['primero','segundo','variado']}))if(!vs.includes(c[k]))c[k]=defaults[k];
    for(const k of ['sobrantes','sonidos'])if(typeof c[k]!=='boolean')c[k]=defaults[k];
    return c;
  }
  class ModosTablas {
    constructor({root,efectosRoot,estado,decir,nombre,opciones,alAjustar}){
      Object.assign(this,{root,estado,decir,nombre,opciones,alAjustar});
      this.efectos=new EfectosTablas(efectosRoot);this.modo='';this.activo=false;this.ronda=0;this.pagina=0;this.porPagina=1;this.drag=null;this.scrollFrame=0;this.firmaVista='';this.bolsas={};this.guardadas={};
      for(const modo of ['pareo','completar','seleccion']){
        let value={};try{value=JSON.parse(localStorage.getItem('multiplicacion.'+modo+'.v1')||'{}');}catch{}
        const c=sanitize(value);if(!c.tablas.length)c.tablas=[...defaults.tablas];if(modo==='pareo')c.cantidad=Math.min(12,c.cantidad);if(modo!=='pareo'&&c.tipo!=='producto'&&!this.bases(c).some(p=>this.posiciones(p,c).length))c.tipo='producto';this.guardadas[modo]=c;
      }
      this.root.addEventListener('pointerdown',e=>this.tomar(e));
      window.addEventListener('pointermove',e=>this.mover(e),{passive:false});window.addEventListener('pointerup',e=>this.soltar(e),{passive:false});window.addEventListener('pointercancel',()=>this.cancelarArrastre());
      document.addEventListener('lostpointercapture',e=>{if(this.drag?.id===e.pointerId)this.cancelarArrastre();});
      this.root.addEventListener('click',e=>this.click(e));this.root.addEventListener('keydown',e=>this.tecla(e));
      $('#espacio').addEventListener('scroll',()=>{if(this.activo&&this.modo==='pareo')this.dibujarPareo();},{passive:true});
      addEventListener('resize',()=>{if(this.activo)this.pausar();});document.addEventListener('fullscreenchange',()=>{if(this.activo)this.pausar();});
    }
    configuracion(){const c=this.guardadas[this.modo];if(this.modo==='seleccion')c.porPagina=1;return c;}
    titulo(){return this.modo==='pareo'?t('Une cada multiplicación con su resultado','Match each multiplication to its result'):this.modo==='completar'?t('Completa las multiplicaciones','Complete the multiplications'):t('Escoge la respuesta correcta','Choose the correct answer');}
    instrucciones(){return this.modo==='pareo'?t('Arrastra un cohete hasta su planeta, o toca las dos tarjetas. Revisa para ver los vuelos correctos.','Drag a rocket to its planet, or tap both cards. Check to see the correct flights.'):this.modo==='completar'?t('Arrastra una ficha al espacio vacío. También puedes tocar una ficha y su casilla.','Drag a tile to the empty space. You can also tap a tile and its box.'):t('Lee la multiplicación. Escoge una opción y pulsa Revisar. Después, toca Siguiente pregunta.','Read the multiplication. Choose an option and press Check. Then tap Next question.');}
    posiciones(base,c){return ['a','b'].filter(k=>(k==='a'?base.b:base.a)!==0&&(c.posicionFactor==='variado'||c.posicionFactor===(k==='a'?'primero':'segundo')));}
    bases(c){const pool=[];for(const a of c.tablas)for(let b=c.minFactor;b<=c.maxFactor;b++)pool.push({a,b,c:a*b});return pool;}
    sacar(pool,cantidad,firma){
      let bag=this.bolsas[this.modo];if(!bag||bag.firma!==firma)bag=this.bolsas[this.modo]={firma,pendientes:[],ultima:''};
      const out=[],used=new Set();for(let i=0;i<Math.min(cantidad,pool.length);i++){
        if(!bag.pendientes.length){bag.pendientes=shuffle(pool.map((_,i)=>i));if(bag.pendientes.length>1&&bag.pendientes.at(-1)===bag.ultima)[bag.pendientes[0],bag.pendientes[bag.pendientes.length-1]]=[bag.pendientes.at(-1),bag.pendientes[0]];}
        let index=bag.pendientes.findLastIndex(i=>!used.has(i));if(index<0){bag.pendientes=shuffle(pool.map((_,i)=>i).filter(i=>!used.has(i)));index=bag.pendientes.length-1;}
        const choice=bag.pendientes.splice(index,1)[0];used.add(choice);out.push(pool[choice]);bag.ultima=choice;
      }return out;
    }
    nueva(modo){
      this.cancelar();this.activo=true;this.modo=modo;this.ronda++;this.pagina=0;this.seleccion=null;this.ficha=null;this.revisando=false;this.resuelto=false;this.nota='';this.historial=[];this.links=new Map();this.estados={};this.porPagina=1;
      const c=this.configuracion(),pool=this.bases(c);this.configActual=c;this.porPagina=c.porPagina;
      if(modo==='pareo')this.crearPareo(pool,c);else this.crearPreguntas(pool,c);
      this.root.hidden=false;this.root.dataset.modo=modo;$('#espacio').scrollTop=0;if($('#preguntasTablas'))$('#preguntasTablas').scrollTop=0;if($('#fichasTablas'))$('#fichasTablas').scrollTop=0;this.estado('');this.render();
      if(this.opciones().narracion)this.leer();
    }
    crearPareo(pool,c){
      const porProducto=new Map();for(const p of shuffle(pool.slice()))if(!porProducto.has(p.c))porProducto.set(p.c,p);
      const distintos=[...porProducto.values()].sort((a,b)=>a.c-b.c),base=this.sacar(distintos,Math.min(12,c.cantidad),JSON.stringify([c.tablas,c.minFactor,c.maxFactor,'productos']));
      this.necesarios=base.length;const productos=new Set(base.map(p=>p.c));let sobrantes=c.sobrantes?c.cantidadSobrantes:0;
      let izq=c.ladoSobrantes==='izquierda'?sobrantes:c.ladoSobrantes==='ambos'?Math.ceil(sobrantes/2):0,der=sobrantes-izq;
      const extraIzq=shuffle(distintos.filter(p=>!productos.has(p.c))).slice(0,izq);izq=extraIzq.length;
      const excluir=new Set([...productos,...extraIzq.map(p=>p.c)]),extraDer=this.distractores([...productos],der,144,excluir);
      this.left=shuffle([...base.map((p,i)=>({...p,id:'l'+i,requerido:true})),...extraIzq.map((p,i)=>({...p,id:'lx'+i,requerido:false}))]);
      this.right=shuffle([...base.map((p,i)=>({valor:p.c,id:'r'+i})),...extraDer.map((valor,i)=>({valor,id:'rx'+i}))]);
      if(base.length<c.cantidad||izq+extraDer.length<sobrantes)this.nota=t(`Esta selección permite ${base.length} ${base.length===1?'pareja':'parejas'} y ${izq+extraDer.length} sobrantes.`,`This selection provides ${base.length} ${base.length===1?'pair':'pairs'} and ${izq+extraDer.length} extra cards.`);
    }
    crearPreguntas(pool,c){
      const disponibles=c.tipo==='factor'?pool.filter(p=>this.posiciones(p,c).length):pool;
      const elegidas=this.sacar(disponibles,c.cantidad,JSON.stringify([c.tablas,c.minFactor,c.maxFactor,c.tipo,c.posicionFactor]));
      this.questions=elegidas.map((base,i)=>{
        const positions=this.posiciones(base,c),factor=c.tipo==='factor'||c.tipo==='mixto'&&i%2===1;
        const campo=factor&&positions.length?positions[Math.floor(Math.random()*positions.length)]:'c';
        const q={...base,id:'q'+this.ronda+'-'+i,campo,esperado:base[campo],respuesta:null,review:false};
        if(this.modo==='seleccion')q.choices=shuffle([q.esperado,...this.distractores([q.esperado],c.opciones-1,campo==='c'?144:12)]);
        return q;
      });
      if(this.questions.length<c.cantidad)this.nota=t(`Con esta selección hay ${this.questions.length} ejercicios distintos.`,`This selection has ${this.questions.length} different questions.`);
      this.tokens=new Map();this.poolFichas=this.questions.map(q=>({id:'f-'+q.id,valor:q.esperado}));if(this.modo==='completar')this.seleccion=this.questions[0]?.id||null;
    }
    distractores(correctos,cantidad,max,excluir=new Set(correctos)){
      const usados=new Set(excluir),out=[];
      const posibles=shuffle(correctos.flatMap(v=>[v-1,v+1,v-2,v+2,v+3,v-3]).filter(v=>v>=0&&v<=max));
      for(const v of posibles)if(out.length<cantidad&&!usados.has(v)){out.push(v);usados.add(v);}
      const resto=shuffle(Array.from({length:max+1},(_,i)=>i).filter(v=>!usados.has(v)));while(out.length<cantidad&&resto.length)out.push(resto.pop());return out;
    }
    visibles(){return this.questions?.slice(this.pagina*this.porPagina,(this.pagina+1)*this.porPagina)||[];}
    paginaCorrecta(){return this.visibles().length>0&&this.visibles().every(q=>q.review&&q.respuesta!==null&&Number(q.respuesta)===q.esperado);}
    render(){
      if(!this.activo)return;
      if(this.modo==='pareo')this.renderPareo();else this.renderPreguntas();
      $('#revisar').disabled=this.modo==='pareo'?this.resuelto:this.paginaCorrecta();this.ajustar();this.alAjustar();
    }
    notaHTML(){return this.nota?`<p class="nota-tablas">${this.nota}</p>`:'';}
    renderPareo(){
      const card=(p,lado)=>`<button type="button" class="match-celda" data-match="${p.id}" data-side="${lado}" aria-pressed="false" aria-label="${lado==='left'?this.frase(p,false,true):p.valor}">${lado==='right'?'<span class="punto-vuelo" aria-hidden="true">🪐</span>':''}<span class="texto-match">${lado==='left'?p.a+' × '+p.b:p.valor}</span>${lado==='left'?'<span class="punto-vuelo" aria-hidden="true">🚀</span>':''}</button>`;
      this.root.innerHTML=`<div class="tablas-barra"><span id="progresoTablas">0 / ${this.necesarios}</span><button id="deshacerPareo" class="tablas-pequeno" type="button">${t('↶ Deshacer unión','↶ Undo link')}</button></div>${this.notaHTML()}<div class="match-shell"><div id="pareoTablas" class="match-layout"><svg id="lineasTablas" aria-hidden="true"></svg><section class="match-col match-left"><h3>${t('🚀 Salida','🚀 Launch')}</h3><div class="match-lista">${this.left.map(p=>card(p,'left')).join('')}</div></section><div class="match-separacion" aria-hidden="true"></div><section class="match-col match-right"><h3>${t('🪐 Destino','🪐 Destination')}</h3><div class="match-lista">${this.right.map(p=>card(p,'right')).join('')}</div></section></div></div>`;
      $('#deshacerPareo').onclick=()=>{if(!this.historial.length)return;this.cancelar();this.activo=true;this.links=new Map(this.historial.pop());this.estados={};this.resuelto=false;this.estado('');this.refrescarPareo();};this.refrescarPareo();
    }
    refrescarPareo(){
      for(const b of this.root.querySelectorAll('[data-match]')){b.classList.toggle('match-elegida',this.seleccion?.id===b.dataset.match);b.setAttribute('aria-pressed',String(this.seleccion?.id===b.dataset.match));b.classList.remove('match-bien','match-mal','match-unida');b.disabled=this.resuelto;
        const l=b.dataset.side==='left'?(this.links.has(b.dataset.match)?b.dataset.match:null):[...this.links].find(([,r])=>r===b.dataset.match)?.[0];if(l){b.classList.add('match-unida');if(this.estados[l])b.classList.add(this.estados[l]==='bien'?'match-bien':'match-mal');}
      }
      $('#progresoTablas').textContent=this.links.size+' / '+this.necesarios;$('#deshacerPareo').disabled=!this.historial.length||this.revisando||this.resuelto;this.dibujarPareo();$('#revisar').disabled=this.revisando||this.resuelto;
    }
    punto(id,viewport=false){const r=this.root.querySelector(`[data-match="${id}"] .punto-vuelo`)?.getBoundingClientRect(),b=$('#pareoTablas')?.getBoundingClientRect();if(!r||!b)return null;return{x:r.x+r.width/2-(viewport?0:b.x),y:r.y+r.height/2-(viewport?0:b.y)};}
    dibujarPareo(){
      const board=$('#pareoTablas'),svg=$('#lineasTablas');if(!this.activo||this.modo!=='pareo'||!board||!svg)return;const rect=board.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);let html='';
      for(const[l,r]of this.links){const a=this.punto(l),b=this.punto(r),mid=(a.x+b.x)/2;html+=`<path data-link="${l}" class="match-linea ${this.estados[l]||''}" d="M${a.x},${a.y} C${mid},${a.y} ${mid},${b.y} ${b.x},${b.y}"/>`;}
      if(this.drag?.tipo==='match'&&this.drag.movido){const a=this.punto(this.drag.key),b={x:this.drag.x-rect.x,y:this.drag.y-rect.y},mid=(a.x+b.x)/2;html+=`<path class="match-temporal" d="M${a.x},${a.y} C${mid},${a.y} ${mid},${b.y} ${b.x},${b.y}"/>`;}
      svg.innerHTML=html;
    }
    elegirMatch(id,side){
      if(this.revisando||this.resuelto)return;
      if(this.seleccion&&this.seleccion.side!==side){this.unir(this.seleccion,{id,side});return;}
      this.seleccion=this.seleccion?.id===id?null:{id,side};this.refrescarPareo();
    }
    unir(a,b){
      if(a.side===b.side)return;const l=a.side==='left'?a.id:b.id,r=a.side==='right'?a.id:b.id;this.historial.push([...this.links]);
      for(const[x,y]of this.links)if(x===l||y===r)this.links.delete(x);this.links.set(l,r);this.seleccion=null;this.estados={};this.estado('');this.refrescarPareo();
    }
    formula(q,interactive=true){
      const nombres={a:t('Primer factor','First factor'),b:t('Segundo factor','Second factor'),c:t('Producto','Product')};
      return ['a','b','c'].map((k,i)=>{
        let html;if(k===q.campo){const correct=q.review&&q.respuesta!==null&&Number(q.respuesta)===q.esperado,cls=q.review?(correct?'bien':q.respuesta===null?'vacia':'mal'):'';
          html=interactive?`<button type="button" class="tablas-casilla ${cls}" data-respuesta="${q.id}" aria-label="${nombres[k]}: ${q.respuesta??t('sin responder','unanswered')}" aria-pressed="${this.seleccion===q.id}">${q.respuesta??'?'}</button>`:'<span class="factor-desconocido">?</span>';
        }else html=`<span class="tablas-valor">${q[k]}</span>`;
        return html+(i===0?'<span class="tablas-signo">×</span>':i===1?'<span class="tablas-signo">=</span>':'');
      }).join('');
    }
    enunciado(q){if(q.campo==='c')return t(`La multiplicación de ${q.a} × ${q.b} = __________.`,`Calculate ${q.a} × ${q.b} = __________.`);return t(`Completa la multiplicación: ${q.campo==='a'?'_____':q.a} × ${q.campo==='b'?'_____':q.b} = ${q.c}.`,`Complete the multiplication: ${q.campo==='a'?'_____':q.a} × ${q.campo==='b'?'_____':q.b} = ${q.c}.`);}
    renderPreguntas(){
      const scrollPreguntas=$('#preguntasTablas')?.scrollTop||0,scrollFichas=$('#fichasTablas')?.scrollTop||0;
      const visibles=this.visibles(),pages=Math.max(1,Math.ceil(this.questions.length/this.porPagina));
      this.root.innerHTML=`<div class="tablas-barra"><span id="progresoTablas">${t(this.porPagina===1?'Pregunta':'Preguntas',this.porPagina===1?'Question':'Questions')} ${this.pagina*this.porPagina+1}${this.porPagina===1?'':'–'+Math.min((this.pagina+1)*this.porPagina,this.questions.length)} / ${this.questions.length}</span><nav class="tablas-paginas" aria-label="${t('Navegación de preguntas','Question navigation')}" ${pages<=1?'hidden':''}><button id="tablaAnterior" aria-label="${t('Pregunta anterior','Previous question')}">‹</button><button id="tablaSiguiente">${this.porPagina===1?t('Siguiente pregunta →','Next question →'):t('Siguientes preguntas →','Next questions →')}</button></nav></div>${this.notaHTML()}<section id="preguntasTablas" class="preguntas-tablas" aria-label="${t('Multiplicaciones para resolver','Multiplications to solve')}">${visibles.map((q,i)=>`<article class="pregunta-tablas ${q.review&&q.respuesta===null?'sin-responder':''}" data-pregunta="${q.id}"><header><span>${t('Ejercicio','Question')} ${this.pagina*this.porPagina+i+1}</span></header><div class="formula-tablas ${this.modo==='seleccion'?'enunciado-examen':''}" id="formula-${q.id}">${this.modo==='seleccion'?this.enunciado(q):this.formula(q,true)}</div>${this.modo==='seleccion'?`<div class="opciones-tablas" role="radiogroup" aria-labelledby="formula-${q.id}">${q.choices.map((v,j)=>`<button type="button" class="opcion-tabla ${q.review&&q.respuesta===v?(v===q.esperado?'bien':'mal'):''}" role="radio" aria-checked="${q.respuesta===v}" data-opcion="${v}" data-q="${q.id}"><span class="opcion-letra" aria-hidden="true">${String.fromCharCode(65+j)}</span><span>${v}</span></button>`).join('')}</div>`:''}</article>`).join('')}</section>${this.modo==='completar'?`<section class="banco-tablas"><header><h3>${t('Fichas para completar','Tiles to complete')}</h3><div class="acciones-banco-tablas"><button id="borrarFicha" class="tablas-pequeno">${t('⌫ Borrar casilla','⌫ Clear box')}</button><button id="masFichasTablas" class="tablas-pequeno" aria-label="${t('Ver más fichas','See more tiles')}" hidden>↓</button></div></header><div id="fichasTablas" class="fichas-tablas"></div></section>`:''}`;
      if(pages>1){$('#tablaAnterior').disabled=this.pagina===0;$('#tablaSiguiente').disabled=this.pagina===pages-1||!this.paginaCorrecta();$('#tablaAnterior').onclick=()=>this.cambiarPagina(-1);$('#tablaSiguiente').onclick=()=>this.cambiarPagina(1);$('#tablaSiguiente').classList.toggle('pagina-lista',this.paginaCorrecta());}
      if(this.modo==='completar'){$('#borrarFicha').onclick=()=>this.borrar();this.renderFichas();$('#masFichasTablas').onclick=()=>{const b=$('#fichasTablas');b.scrollTo({top:b.scrollTop+b.clientHeight>=b.scrollHeight-2?0:b.scrollTop+Math.max(35,b.clientHeight-10),behavior:'smooth'});};$('#fichasTablas').onscroll=()=>this.bancoScroll();}
      $('#preguntasTablas').scrollTop=scrollPreguntas;if($('#fichasTablas'))$('#fichasTablas').scrollTop=scrollFichas;this.refrescarSeleccion();
    }
    renderFichas(){
      const actuales=this.visibles(),key=actuales.map(q=>q.id).join('|');
      if(!this.tokens.has(key)){const c=this.configuracion(),sobras=this.distractores(actuales.map(q=>q.esperado),c.sobrantes?c.cantidadSobrantes:0,Math.max(12,...actuales.map(q=>q.esperado))),tokens=[...actuales.map(q=>({id:'f-'+q.id,valor:q.esperado})),...sobras.map((valor,i)=>({id:'x-'+key+'-'+i,valor}))];this.tokens.set(key,shuffle(tokens));}
      this.fichas=this.tokens.get(key);const usadas=new Set(this.questions.map(q=>q.token).filter(Boolean));
      // Al reagrupar páginas, una ficha con el mismo valor puede haberse usado
      // en otra pregunta. Sustituirla por una equivalente libre, en su misma posición.
      const visiblesIds=new Set(actuales.map(q=>q.id)),ocupadasFuera=new Set(this.questions.filter(q=>!visiblesIds.has(q.id)).map(q=>q.token).filter(Boolean)),reservadas=new Set(this.fichas.map(f=>f.id));
      for(let i=0;i<this.fichas.length;i++){const ficha=this.fichas[i];if(!ocupadasFuera.has(ficha.id))continue;const libre=this.poolFichas.find(f=>f.valor===ficha.valor&&!usadas.has(f.id)&&!reservadas.has(f.id));if(libre){reservadas.delete(ficha.id);reservadas.add(libre.id);this.fichas[i]=libre;}}

      $('#fichasTablas').innerHTML=this.fichas.map(f=>`<button type="button" class="ficha-tabla ${usadas.has(f.id)?'usada':''} ${this.ficha===f.id?'elegida':''}" data-ficha="${f.id}" data-valor="${f.valor}" aria-label="${f.valor}${usadas.has(f.id)?t(', ficha colocada',', placed tile'):''}" ${usadas.has(f.id)?'disabled':''}>${usadas.has(f.id)?'✓':f.valor}</button>`).join('');
    }
    bancoScroll(){const b=$('#fichasTablas'),boton=$('#masFichasTablas');if(!b||!boton)return;const antes=boton.hidden;boton.hidden=b.scrollHeight<=b.clientHeight+2;if(antes!==boton.hidden)this.alAjustar();boton.textContent=b.scrollTop+b.clientHeight>=b.scrollHeight-2?'↑':'↓';}
    refrescarSeleccion(){
      if(this.modo!=='completar')return;this.root.querySelectorAll('[data-respuesta]').forEach(b=>{b.classList.toggle('elegida',b.dataset.respuesta===this.seleccion);b.setAttribute('aria-pressed',String(b.dataset.respuesta===this.seleccion));});const q=this.questions.find(q=>q.id===this.seleccion);$('#borrarFicha').disabled=!q||q.respuesta===null;
    }
    editar(q){this.cancelarAnimacion();q.review=false;this.estado('');$('#revisar').disabled=false;}
    colocarFicha(id,qid){
      const f=this.fichas.find(f=>f.id===id),q=this.questions.find(q=>q.id===qid);if(!f||!q||this.questions.some(q=>q.token===id))return;
      this.editar(q);q.respuesta=f.valor;q.token=id;this.seleccion=q.id;this.ficha=null;this.renderPreguntas();this.alAjustar();
    }
    elegirFicha(id){const q=this.questions.find(q=>q.id===this.seleccion);if(q&&q.respuesta===null){this.colocarFicha(id,q.id);return;}this.ficha=this.ficha===id?null:id;this.renderFichas();}
    elegirCasilla(id){this.seleccion=id;if(this.ficha){this.colocarFicha(this.ficha,id);return;}this.refrescarSeleccion();}
    borrar(){const q=this.questions.find(q=>q.id===this.seleccion);if(!q)return;this.editar(q);q.respuesta=null;delete q.token;this.ficha=null;this.renderPreguntas();this.alAjustar();}
    intercambiar(a,b){if(a===b)return;const p=this.questions.find(q=>q.id===a),q=this.questions.find(q=>q.id===b);if(!p||!q||p.respuesta===null)return;this.editar(p);this.editar(q);[p.respuesta,q.respuesta]=[q.respuesta,p.respuesta];[p.token,q.token]=[q.token,p.token];this.seleccion=b;this.renderPreguntas();this.alAjustar();}
    cambiarPagina(delta){const pages=Math.ceil(this.questions.length/this.porPagina),n=this.pagina+delta;if(n<0||n>=pages)return;this.cancelar();this.activo=true;this.pagina=n;if($('#preguntasTablas'))$('#preguntasTablas').scrollTop=0;if($('#fichasTablas'))$('#fichasTablas').scrollTop=0;this.ficha=null;this.seleccion=this.modo==='completar'?this.visibles()[0]?.id||null:null;this.estado('');this.render();}
    click(e){
      const opcion=e.target.closest('[data-opcion]');if(opcion){const q=this.questions.find(q=>q.id===opcion.dataset.q);this.editar(q);q.respuesta=Number(opcion.dataset.opcion);this.renderPreguntas();this.alAjustar();return;}
      if(e.detail!==0)return;const m=e.target.closest('[data-match]'),f=e.target.closest('[data-ficha]:not(:disabled)'),c=e.target.closest('[data-respuesta]');if(m)this.elegirMatch(m.dataset.match,m.dataset.side);if(f)this.elegirFicha(f.dataset.ficha);if(c)this.elegirCasilla(c.dataset.respuesta);
    }
    tecla(e){
      const box=e.target.closest('[data-respuesta]');if(box&&['Delete','Backspace'].includes(e.key)){e.preventDefault();this.seleccion=box.dataset.respuesta;this.borrar();}
      const match=e.target.closest('[data-match]');if(match&&['Delete','Backspace'].includes(e.key)){e.preventDefault();const id=match.dataset.side==='left'?match.dataset.match:[...this.links].find(([,r])=>r===match.dataset.match)?.[0];if(id&&this.links.has(id)){this.historial.push([...this.links]);this.links.delete(id);this.estados={};this.refrescarPareo();}}
      const option=e.target.closest('[data-opcion]');if(option&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const options=[...option.parentElement.children],i=options.indexOf(option),next=options[(i+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+options.length)%options.length];next.click();this.root.querySelector(`[data-q="${next.dataset.q}"][data-opcion="${next.dataset.opcion}"]`)?.focus({preventScroll:true});}
    }
    tomar(e){
      if(!this.activo||this.revisando||e.button>0||e.isPrimary===false||this.drag)return;
      const m=e.target.closest('[data-match]'),f=e.target.closest('[data-ficha]:not(:disabled)'),c=e.target.closest('[data-respuesta]');if(!m&&!f&&!c)return;if(m&&this.resuelto)return;
      e.preventDefault();const el=m||f||c,kind=m?'match':f?'ficha':'casilla';this.drag={id:e.pointerId,el,tipo:kind,key:m?m.dataset.match:f?f.dataset.ficha:c.dataset.respuesta,side:m?.dataset.side,x:e.clientX,y:e.clientY,inicioX:e.clientX,inicioY:e.clientY,movido:false};el.setPointerCapture(e.pointerId);
    }
    mover(e){
      const d=this.drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();d.x=e.clientX;d.y=e.clientY;
      if(!d.movido&&Math.hypot(d.x-d.inicioX,d.y-d.inicioY)>6){
        const q=d.tipo==='casilla'?this.questions.find(q=>q.id===d.key):null;if(q&&q.respuesta===null)return;d.movido=true;d.el.classList.add('origen-arrastre');
        if(d.tipo!=='match'){const g=document.createElement('div');g.className='fantasma ficha-fantasma';g.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));g.textContent=q?q.respuesta:this.fichas.find(f=>f.id===d.key).valor;document.body.append(g);d.ghost=g;}
        this.autoScroll();
      }
      if(d.ghost){d.ghost.style.left=d.x+'px';d.ghost.style.top=d.y+'px';}
      this.root.querySelectorAll('.destino-arrastre').forEach(e=>e.classList.remove('destino-arrastre'));
      if(d.movido){const target=document.elementFromPoint(d.x,d.y)?.closest(d.tipo==='match'?'[data-match]':'[data-respuesta]');if(target)target.classList.add('destino-arrastre');if(d.tipo==='match')this.dibujarPareo();}
    }
    soltar(e){
      const d=this.drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();const hit=document.elementFromPoint(e.clientX,e.clientY),m=hit?.closest('[data-match]'),c=hit?.closest('[data-respuesta]'),bank=hit?.closest('.banco-tablas');this.cancelarArrastre();
      if(!d.movido){if(d.tipo==='match')this.elegirMatch(d.key,d.side);else if(d.tipo==='ficha')this.elegirFicha(d.key);else this.elegirCasilla(d.key);return;}
      if(d.tipo==='match'&&m&&m.dataset.side!==d.side)this.unir({id:d.key,side:d.side},{id:m.dataset.match,side:m.dataset.side});
      else if(c&&d.tipo==='ficha')this.colocarFicha(d.key,c.dataset.respuesta);else if(c&&d.tipo==='casilla')this.intercambiar(d.key,c.dataset.respuesta);else if(bank&&d.tipo==='casilla'){this.seleccion=d.key;this.borrar();}
    }
    autoScroll(){const step=()=>{if(!this.drag?.movido)return;const d=this.drag,z=parseFloat(getComputedStyle(document.body).zoom)||1,boxes=this.modo==='pareo'?[$('#espacio')]:[$('#preguntasTablas'),$('#espacio')];
      for(const box of boxes){if(!box)continue;const r=box.getBoundingClientRect();if(d.x<r.left||d.x>r.right||box.id==='preguntasTablas'&&(d.y<r.top-8||d.y>r.bottom+8))continue;const v=d.y>r.bottom-30?Math.min(12,(d.y-r.bottom+30)/2):d.y<r.top+30?-Math.min(12,(r.top+30-d.y)/2):0;if(v&&box.scrollHeight>box.clientHeight+1){box.scrollTop+=v/z;break;}}
      if(this.modo==='pareo')this.dibujarPareo();this.scrollFrame=requestAnimationFrame(step);};this.scrollFrame=requestAnimationFrame(step);}
    cancelarArrastre(){const d=this.drag;this.drag=null;cancelAnimationFrame(this.scrollFrame);d?.ghost?.remove();d?.el.classList.remove('origen-arrastre');if(d)try{d.el.releasePointerCapture(d.id);}catch{}this.root.querySelectorAll('.destino-arrastre').forEach(e=>e.classList.remove('destino-arrastre'));if(this.activo&&this.modo==='pareo')this.dibujarPareo();}
    cancelarAnimacion(){this.efectos.detener();this.revisando=false;if(this.activo)$('#revisar').disabled=this.modo==='pareo'?this.resuelto:this.paginaCorrecta();}
    pausar(){this.cancelarArrastre();this.cancelarAnimacion();}
    cancelar(){this.pausar();this.activo=false;}
    revisar(){
      if(!this.activo||this.revisando)return;if(this.modo==='pareo'){this.revisarPareo();return;}
      const qs=this.visibles();qs.forEach(q=>q.review=true);const correctas=qs.filter(q=>q.respuesta!==null&&Number(q.respuesta)===q.esperado).length;this.renderPreguntas();this.alAjustar();
      if(correctas!==qs.length){const text=this.modo==='seleccion'?t(`${correctas} de ${qs.length} correctas. Escoge una opción en cada ejercicio y revisa las marcadas.`,`${correctas} of ${qs.length} correct. Choose an option for each question and check the marked answers.`):t(`${correctas} de ${qs.length} correctas. Completa o corrige las casillas marcadas.`,`${correctas} of ${qs.length} correct. Complete or correct the marked answers.`);this.estado(text);this.decir(text);$('#revisar').disabled=false;return;}
      const total=this.questions.every(q=>q.review&&q.respuesta!==null&&Number(q.respuesta)===q.esperado),text=total?t(`¡Buen trabajo, ${this.nombre()}! Completaste la ronda.`,`Great work, ${this.nombre()}! You completed the round.`):t(`¡Genial, ${this.nombre()}! Continúa con ${this.porPagina===1?'la siguiente pregunta':'las siguientes preguntas'}.`,`Great, ${this.nombre()}! Continue to the next ${this.porPagina===1?'question':'questions'}.`);
      this.estado(text,true);this.decir(text);this.revisando=true;$('#revisar').disabled=true;const round=this.ronda;this.efectos.canones(this.configuracion().sonidos,()=>{if(this.activo&&this.ronda===round){this.revisando=false;$('#revisar').disabled=this.paginaCorrecta();}});
    }
    revisarPareo(){
      let good=0,bad=0;const vuelos=[];this.estados={};
      for(const[l,r]of this.links){const left=this.left.find(p=>p.id===l),right=this.right.find(p=>p.id===r),ok=left.requerido&&left.c===right.valor;this.estados[l]=ok?'bien':'mal';if(ok){good++;vuelos.push({a:this.punto(l,true),b:this.punto(r,true)});}else bad++;}
      this.resuelto=good===this.necesarios&&bad===0;const text=this.resuelto?t(`¡Buen trabajo, ${this.nombre()}! Todas las parejas están correctas.`,`Great work, ${this.nombre()}! All the pairs are correct.`):t(`${good} de ${this.necesarios} parejas correctas. Revisa las uniones y deja libres los sobrantes.`,`${good} of ${this.necesarios} pairs correct. Check the links and leave the extra cards unpaired.`);
      this.estado(text,this.resuelto);this.decir(text);this.refrescarPareo();if(!vuelos.length)return;
      this.revisando=true;$('#revisar').disabled=true;const round=this.ronda;this.efectos.cohetes(vuelos,this.configuracion().sonidos,()=>{if(this.activo&&this.ronda===round){this.revisando=false;this.refrescarPareo();}});
    }
    frase(q,completa=false,pareo=false){const val=k=>!completa&&!pareo&&k===q.campo?t('casilla vacía','empty box'):String(q[k]);return t(`${val('a')} por ${val('b')}${pareo?'':' es '+val('c')}.`,`${val('a')} times ${val('b')}${pareo?'':' equals '+val('c')}.`);}
    leer(){if(this.activo&&this.modo==='pareo'&&this.opciones().narracion)this.decir(this.instrucciones());}
    pista(){
      if(!this.opciones().pistas)return;let q;
      if(this.modo==='pareo'){q=this.left.find(p=>p.requerido&&(!this.links.has(p.id)||this.right.find(r=>r.id===this.links.get(p.id))?.valor!==p.c));if(q){this.seleccion={id:q.id,side:'left'};this.refrescarPareo();}}
      else q=this.visibles().find(q=>q.respuesta===null||Number(q.respuesta)!==q.esperado);
      if(!q){this.estado(t('Las respuestas están listas. Pulsa Revisar.','The answers are ready. Press Check.'));return;}
      const text=q.campo&&q.campo!=='c'?t(`Busca qué número multiplicado por ${q.campo==='a'?q.b:q.a} da ${q.c}.`,`Find the number that, multiplied by ${q.campo==='a'?q.b:q.a}, gives ${q.c}.`):t(`Puedes sumar ${q.b}, ${q.a} veces.`,`You can add ${q.b}, ${q.a} times.`);this.estado(text);if(this.modo==='pareo')this.decir(text);
    }
    ajustar(){
      if(!this.activo||!this.root.getClientRects().length)return;const z=parseFloat(getComputedStyle(document.body).zoom)||1,r=$('#espacio').getBoundingClientRect(),firma=[innerWidth,innerHeight,z].join('|');
      if(firma!==this.firmaVista){this.firmaVista=firma;this.cancelarArrastre();this.cancelarAnimacion();}
      if(this.modo==='pareo'){
        const n=Math.max(this.left.length,this.right.length),w=Math.max(210,r.width-20),col=Math.min(174,(w-44)/2),width=Math.min(w,col*4.5),compact=innerHeight<650,title=compact?32:40,gap=compact?6:8;
        const rootRect=this.root.getBoundingClientRect(),bar=this.root.querySelector('.tablas-barra').getBoundingClientRect(),note=this.root.querySelector('.nota-tablas')?.getBoundingClientRect().height||0,rootGap=parseFloat(getComputedStyle(this.root).rowGap)*z;
        const available=Math.max(110,rootRect.height-bar.height-note-rootGap*(note?2:1)),min=n*(compact?35:42)+(n-1)*gap+title,height=n<=4?Math.max(min,Math.min(available,n*61+(n-1)*24+title)):Math.max(min,available),row=Math.min(62,(height-title-(n-1)*gap)/n);
        this.root.style.setProperty('--match-width',width/z+'px');this.root.style.setProperty('--match-col',col/z+'px');this.root.style.setProperty('--match-height',height/z+'px');this.root.style.setProperty('--match-row',row/z+'px');this.root.style.setProperty('--match-gap',gap/z+'px');this.root.style.setProperty('--match-font',clamp((col-45)/4.5,16,24)/z+'px');this.dibujarPareo();
      }else{
        const size=this.configuracion().porPagina,columns=size>1&&r.width>(this.modo==='seleccion'?900:650)?2:1;
        if(size!==this.porPagina){const first=this.pagina*this.porPagina;this.porPagina=size;this.pagina=Math.floor(first/size);this.seleccion=this.ficha=null;this.renderPreguntas();$('#revisar').disabled=this.paginaCorrecta();}
        const count=this.visibles().length;this.root.style.setProperty('--preguntas-cols',Math.min(count,columns));this.root.style.setProperty('--preguntas-rows',Math.ceil(count/columns));
        const minCard=Math.max(1,...[...this.root.querySelectorAll('.pregunta-tablas')].map(card=>{const style=getComputedStyle(card),children=[...card.children].filter(e=>e.getClientRects().length);return children.reduce((sum,e)=>sum+Math.max(e.getBoundingClientRect().height,e.scrollHeight*z),0)+(children.length-1)*parseFloat(style.rowGap)*z+(parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth))*z;}));this.root.style.setProperty('--pregunta-minh',Math.ceil(minCard)/z+'px');
        const options=this.configuracion().opciones;this.root.style.setProperty('--opciones-cols',1);if(this.modo==='completar'){
          const bank=this.root.querySelector('.banco-tablas'),tiles=$('#fichasTablas'),cards=[...this.root.querySelectorAll('.pregunta-tablas')],gap=parseFloat(getComputedStyle($('#preguntasTablas')).rowGap)*z;
          const minimum=cards.length?Math.max(...cards.map(card=>{const style=getComputedStyle(card),head=card.querySelector('header').getBoundingClientRect().height,formula=card.querySelector('.formula-tablas').getBoundingClientRect().height;return head+formula+(head?parseFloat(style.rowGap)*z:0)+(parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth))*z;})):80;
          const rootRect=this.root.getBoundingClientRect(),rootGap=parseFloat(getComputedStyle(this.root).rowGap)*z,bar=this.root.querySelector('.tablas-barra').getBoundingClientRect().height,note=this.root.querySelector('.nota-tablas')?.getBoundingClientRect().height||0,overhead=bank.getBoundingClientRect().height-tiles.getBoundingClientRect().height,cardRows=Math.ceil(count/columns),needed=minimum*cardRows+Math.max(0,cardRows-1)*gap,available=rootRect.height-bar-note-rootGap*(note?3:2)-overhead-needed,minRow=parseFloat(getComputedStyle(tiles).gridAutoRows)*z;
          this.root.style.setProperty('--fichas-maxh',Math.max(minRow,Math.min(104,available))/z+'px');this.bancoScroll();
        }
      }
    }

  }
  window.ModosTablas=ModosTablas;
})();
