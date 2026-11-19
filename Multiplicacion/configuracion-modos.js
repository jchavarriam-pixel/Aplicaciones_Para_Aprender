/* Cada modo conserva su propia práctica y sus preferencias de lectura. */
(()=>{'use strict';
 const t=(es,en)=>IdiomaVoz.idioma==='en'?en:es;
 const names={filas:['1. Aprende las tablas','1. Learn times tables'],grupos:['2. Forma grupos','2. Make groups'],pareo:['3. Pareo','3. Match'],completar:['4. Completar','4. Complete'],seleccion:['5. Escoger','5. Choose']};
 class ConfiguracionMultiplicacion{
  constructor({base,tablas,aplicar,cancelar}){
   Object.assign(this,{aplicar,cancelar});this.dialog=document.querySelector('#configuracion');this.voice=document.querySelector('#voz');this.guardadas={};
   for(const modo of Object.keys(names)){let stored={};try{stored=JSON.parse(localStorage.getItem('multiplicacion.'+modo+'.v1')||'{}');}catch{}
    this.guardadas[modo]=this.sanear({...base,...(tablas.guardadas[modo]||{}),...stored,modo});}
   this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.cerrar();});
  }
  sanear(c){
   c={...c,tablas:Array.isArray(c.tablas)?[...new Set(c.tablas.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=12))].sort((a,b)=>a-b):[2,3,4,5],minFactor:1,maxFactor:10};
   if(!c.tablas.length)c.tablas=[2,3,4,5];
   for(const[k,min,max,fallback]of [['cantidad',1,c.modo==='pareo'?12:24,6],['cantidadSobrantes',0,6,2],['porPagina',1,4,1]])c[k]=Math.max(min,Math.min(max,Number.isFinite(+c[k])?Math.round(+c[k]):fallback));
   if(c.modo==='seleccion')c.porPagina=1;
   if(c.metodoGrupos!=='barrido')c.metodoGrupos='soltar';
   c.opciones=Number(c.opciones)>=4?4:3;for(const k of ['sobrantes','sonidos'])if(typeof c[k]!=='boolean')c[k]=k==='sonidos';
   return c;
  }
  obtener(modo){return {...this.guardadas[modo],tablas:[...this.guardadas[modo].tablas]};}
  restaurarVoz(c){const v=c.preferenciasVoz;if(!v)return;const set=(id,value)=>{const e=document.getElementById(id);if(e&&value!==undefined&&[...e.options].some(o=>o.value===String(value))){e.value=value;e.dispatchEvent(new Event('change',{bubbles:true}));}};
   for(const idioma of ['es','en'])if(v.voces?.[idioma]){set('idiomaAplicacion',idioma);set('vozElegida',v.voces[idioma]);}set('idiomaAplicacion',v.idioma);set('velocidadVoz',v.velocidad);}

  abrir(modo,desdeInicio=false){
   this.modo=modo;this.desdeInicio=desdeInicio;this.vozAlAbrir=IdiomaVoz.estado;const c=this.obtener(modo),basic=['filas','grupos'].includes(modo),match=modo==='pareo',choice=modo==='seleccion';
   const check=(key,es,en)=>`<label class="casilla-config"><input type="checkbox" data-setting="${key}" ${c[key]?'checked':''}>${t(es,en)}</label>`;
   const num=(key,es,en,min,max)=>`<label class="campo">${t(es,en)}<input type="number" data-setting="${key}" value="${c[key]}" min="${min}" max="${max}" required></label>`;
   const select=(key,es,en,options)=>`<label class="campo">${t(es,en)}<select data-setting="${key}">${options.map(([value,a,b])=>`<option value="${value}" ${String(c[key])===String(value)?'selected':''}>${t(a,b)}</option>`).join('')}</select></label>`;
   let fields=`<fieldset><legend>${t('Tablas para practicar','Times tables to practise')}</legend><p class="nota-modo-config">${t('La tabla elegida es el primer factor. El segundo varía del 1 al 10.','The selected table is the first factor. The second ranges from 1 to 10.')}</p><div class="acciones-tablas-config"><button type="button" data-todas>${t('Todas','All')}</button><button type="button" data-ninguna>${t('Ninguna','None')}</button></div><div class="elegir-tablas">${Array.from({length:12},(_,i)=>i+1).map(n=>`<label><input type="checkbox" name="tabla" value="${n}" ${c.tablas.includes(n)?'checked':''}><span>${n}</span></label>`).join('')}</div></fieldset>`;
   if(basic){fields+='<fieldset><legend>'+t('Tu práctica','Your practice')+'</legend>'+select('tipoRespuesta','Cómo responder','How to answer',[['multiplicacion','Completar la multiplicación','Complete the multiplication'],['producto','Solo el producto (total)','Only the product (total)']])+select('forma','Figuras','Shapes',[['azar','Cambiar en cada ronda','Change each round'],['circulo','Círculos','Circles'],['cuadrado','Cuadrados','Squares'],['triangulo','Triángulos','Triangles'],['pentagono','Pentágonos','Pentagons'],['estrella','Estrellas','Stars'],['rombo','Rombos','Diamonds'],['hexagono','Hexágonos','Hexagons'],['rectangulo','Rectángulos','Rectangles']]);
    if(modo==='filas')fields+=check('ayudaConteo','Conteo animado de las figuras','Animated counting of the shapes')+check('sonidoConteo','Campanitas durante el conteo','Chimes while counting');
    else fields+=select('metodoGrupos','Cómo recoger las fichas','How to collect shapes',[
     ['soltar','Acercar y soltar','Move close and release'],
     ['barrido','Recoger al pasar','Sweep to collect']
    ])+select('disposicionGrupos','Forma de los grupos','Group layout',[['compactos','Compactos (en puños)','Compact clusters'],['hileras','En hileras','In rows'],['libre','Libre','Free']])+check('inerciaGrupos','Deslizar suavemente al soltar','Slide gently when released')+check('ayudaGrupos','Marcar y cerrar los grupos completos','Mark and close complete groups');fields+='</fieldset>';
   }else{
    fields+='<fieldset><legend>'+t('Tu ronda','Your round')+'</legend><div class="opciones-modo-grid">'+num('cantidad',match?'Parejas por ronda':'Preguntas por ronda',match?'Pairs per round':'Questions per round',1,match?12:24)+(modo==='completar'?select('porPagina','Preguntas por página','Questions per page',[[1,'1','1'],[2,'2','2'],[3,'3','3'],[4,'4','4']]):'')+(choice?select('opciones','Opciones por pregunta','Options per question',[[3,'3','3'],[4,'4','4']]):'')+'</div>';
    if(!match)fields+=select('tipo','Tipo de pregunta','Question type',[['producto','Solo el producto','Only the product'],['factor','Un factor','One factor'],['mixto','Productos y factores','Products and factors']])+select('posicionFactor','Factor que falta','Missing factor',[['variado','Variar entre los dos','Either factor'],['primero','Primer factor','First factor'],['segundo','Segundo factor','Second factor']]);fields+='</fieldset>';
    if(!choice)fields+='<fieldset><legend>'+t('Fichas sobrantes','Extra cards')+'</legend>'+check('sobrantes','Incluir sobrantes','Include extra cards')+num('cantidadSobrantes','Cantidad de sobrantes en total','Total extra cards',0,6)+(match?select('ladoSobrantes','Dónde sobran','Extra card side',[['derecha','Resultados (derecha)','Results (right)'],['izquierda','Multiplicaciones (izquierda)','Multiplications (left)'],['ambos','Ambos lados','Both sides']]):'')+'</fieldset>';
    fields+=check('sonidos','Sonidos de celebración','Celebration sounds');
   }
   fields+='<fieldset><legend>'+t('Ayudas y lectura','Hints and speech')+'</legend>'+check('permitirPistas','Permitir pistas','Allow hints')+check('narracion',choice||modo==='completar'?'Leer solo mensajes y felicitaciones':'Leer instrucciones y respuestas',choice||modo==='completar'?'Read only messages and praise':'Read instructions and answers')+'</fieldset>';
   this.voice.remove();this.dialog.innerHTML=`<header><h2>${t(...names[modo])}</h2><button type="button" id="cerrarConfig" aria-label="${t('Cerrar','Close')}">✕</button></header><form method="dialog" id="formAjustesModo">${fields}<p id="errorModo" role="alert"></p><button class="principal" id="aplicar" type="submit">${desdeInicio?t('▶ Iniciar','▶ Start'):t('Aplicar y volver al juego','Apply and return to play')}</button>${desdeInicio?`<button type="button" id="cancelarInicio">${t('Volver a los modos','Back to modes')}</button>`:''}</form>`;
   this.dialog.querySelector('#aplicar').before(this.voice);
   this.dialog.querySelector('[data-todas]').onclick=()=>this.dialog.querySelectorAll('[name=tabla]').forEach(e=>e.checked=true);this.dialog.querySelector('[data-ninguna]').onclick=()=>this.dialog.querySelectorAll('[name=tabla]').forEach(e=>e.checked=false);
   const update=()=>{const tipo=this.dialog.querySelector('[data-setting=tipo]'),pos=this.dialog.querySelector('[data-setting=posicionFactor]');if(tipo&&pos)pos.closest('label').hidden=tipo.value==='producto';const sob=this.dialog.querySelector('[data-setting=sobrantes]');if(sob)for(const key of ['cantidadSobrantes','ladoSobrantes']){const el=this.dialog.querySelector(`[data-setting=${key}]`);if(el)el.disabled=!sob.checked;}};
   this.dialog.querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('change',update));update();
   this.dialog.querySelector('#cerrarConfig').onclick=()=>this.cerrar();this.dialog.querySelector('#cancelarInicio')?.addEventListener('click',()=>this.cerrar());
   this.dialog.querySelector('form').onsubmit=e=>{e.preventDefault();this.guardar();};this.dialog.style.zoom=String(1/(parseFloat(getComputedStyle(document.body).zoom)||1));this.dialog.showModal();
  }
  cerrar(){if(this.desdeInicio){this.restaurarVoz({preferenciasVoz:this.vozAlAbrir});this.dialog.close();this.cancelar();}else this.guardar();}
  guardar(){const c=this.obtener(this.modo);c.tablas=[...this.dialog.querySelectorAll('[name=tabla]:checked')].map(e=>+e.value);if(!c.tablas.length){this.dialog.querySelector('#errorModo').textContent=t('Escoge al menos una tabla.','Choose at least one times table.');return;}
   for(const el of this.dialog.querySelectorAll('[data-setting]'))c[el.dataset.setting]=el.type==='checkbox'?el.checked:el.type==='number'?+el.value:el.value;
   c.preferenciasVoz=IdiomaVoz.estado;this.guardadas[this.modo]=this.sanear(c);try{localStorage.setItem('multiplicacion.'+this.modo+'.v1',JSON.stringify(this.guardadas[this.modo]));}catch{}
   this.dialog.close();this.aplicar(this.obtener(this.modo));
  }
 }
 window.ConfiguracionMultiplicacion=ConfiguracionMultiplicacion;
})();
