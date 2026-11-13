/* Preferencias locales y lectura compartidas por tres actividades. */
(() => {
 'use strict';
 const app=window.IDIOMA_VOZ_APP||(/Mayor_Menor\.html$/i.test(location.pathname)?'mayorMenor':/Reconocer_Numeros/i.test(location.pathname)?'numeros':/Ordenar_Objetos/i.test(location.pathname)?'ordenar':'comparar');
 const clave='idiomaVoz.'+app+'.v1',estado={idioma:'es',velocidad:1,voces:{es:'',en:''}};
 try{const s=JSON.parse(localStorage.getItem(clave)||'null');if(s){if(['es','en'].includes(s.idioma))estado.idioma=s.idioma;const v=Number(s.velocidad);if(v>=.7&&v<=1.5&&Math.abs(v*10-Math.round(v*10))<1e-8)estado.velocidad=v;for(const l of ['es','en'])if(typeof s.voces?.[l]==='string'&&s.voces[l].length<500)estado.voces[l]=s.voces[l];}}catch{}
 const guardar=()=>{try{localStorage.setItem(clave,JSON.stringify(estado));}catch{}};
 const directo=window.TEXTOS_INGLES||{},faltantes=new Set();
 const bases={grande:'big',pequeño:'small',mediano:'medium-sized',alto:'tall',bajo:'short',largo:'long',corto:'short',ancho:'wide',estrecho:'narrow',grueso:'thick',delgado:'thin',oscuro:'dark',claro:'light',alargado:'elongated',redondo:'round',rugoso:'rough',liso:'smooth',limpio:'clean',sucio:'dirty',mojado:'wet',seco:'dry',ordenado:'tidy',desordenado:'messy',abierto:'open',cerrado:'closed',lleno:'full',vacío:'empty',separados:'far apart',juntos:'close together',lejos:'far',cerca:'close',inclinado:'tilted',derecho:'upright',soleado:'sunny',nublado:'cloudy',lluvioso:'rainy',nevado:'snowy'};
 const comparativos={grande:'bigger',pequeño:'smaller',alto:'taller',bajo:'shorter',largo:'longer',corto:'shorter',ancho:'wider',estrecho:'narrower',grueso:'thicker',delgado:'thinner',oscuro:'darker',claro:'lighter',alargado:'more elongated',redondo:'rounder',rugoso:'rougher',liso:'smoother',limpio:'cleaner',sucio:'dirtier',mojado:'wetter',seco:'drier',ordenado:'tidier',desordenado:'messier',abierto:'more open',cerrado:'more closed',lleno:'fuller',vacío:'emptier',separados:'farther apart',juntos:'closer together',lejos:'farther',cerca:'closer',inclinado:'more tilted',derecho:'more upright',soleado:'sunnier',nublado:'cloudier',lluvioso:'rainier',nevado:'snowier'};
 const comparar=(q,a)=>q==='más'?(comparativos[a]||a):'less '+(bases[a]||a);
 function ingles(n){
  n=Number(n);if(!Number.isInteger(n)||n<0||n>999999)return '';
  const unidades=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],decenas=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if(n<20)return unidades[n];if(n<100)return decenas[Math.floor(n/10)]+(n%10?'-'+unidades[n%10]:'');if(n<1000)return unidades[Math.floor(n/100)]+' hundred'+(n%100?' '+ingles(n%100):'');return ingles(Math.floor(n/1000))+' thousand'+(n%1000?' '+ingles(n%1000):'');
 }
 function traducirContenido(s){
  if(!/\p{L}/u.test(s))return s;
  if(Object.hasOwn(directo,s))return directo[s];
  const traduccionActividad=window.traducirActividad?.(s);if(typeof traduccionActividad==='string')return traduccionActividad;
  if(/[.!]$/.test(s)&&Object.hasOwn(directo,s.slice(0,-1)))return directo[s.slice(0,-1)]+s.at(-1);
  let m;
  if((m=s.match(/^¿Cuál (?:es|está) (más|menos) (.+)\?$/)))return 'Which one is '+comparar(m[1],m[2])+'?';
  if((m=s.match(/^¿Dónde hay (más|menos) (.+)\?$/)))return 'Where are there '+(m[1]==='más'?'more':'fewer')+' '+traducirContenido(m[2])+'?';
  if((m=s.match(/^¿Qué pelota está (más|menos) (lejos|cerca) (.+)\?$/)))return 'Which ball is '+comparar(m[1],m[2])+' '+(m[2]==='lejos'?traducirContenido(m[3]).replace(/^to /,'from '):traducirContenido(m[3]))+'?';
  if((m=s.match(/^¿En qué grupo están (más|menos) (separados|juntos)\?$/)))return 'In which group are they '+comparar(m[1],m[2])+'?';
  if((m=s.match(/^Toca el objeto (.+)\.$/)))return 'Tap the '+(bases[m[1]]||m[1])+' object.';
  if((m=s.match(/^Es el objeto (.+)\.$/)))return 'It is the '+(bases[m[1]]||m[1])+' object.';
  if((m=s.match(/^Encontraste la opción: (más|menos) (.+)\.$/)))return 'You found the '+comparar(m[1],m[2])+' one.';
  if((m=s.match(/^Aquí hay (más|menos) (.+)\.$/)))return 'There are '+(m[1]==='más'?'more':'fewer')+' '+traducirContenido(m[2])+'.';
  if((m=s.match(/^La pelota está (más|menos) (lejos|cerca) (.+)\.$/)))return 'The ball is '+comparar(m[1],m[2])+' '+(m[2]==='lejos'?traducirContenido(m[3]).replace(/^to /,'from '):traducirContenido(m[3]))+'.';
  if((m=s.match(/^En este grupo están (más|menos) (.+)\.$/)))return 'In this group they are '+comparar(m[1],m[2])+'.';
  const reglas=[
   [/^Ejercicio (\d+) de (\d+)$/,(_,a,b)=>`Exercise ${a} of ${b}`],
   [/^(\d+) ejercicios completados$/,(_,a)=>`${a} exercises completed`],
   [/^(\d+) ejercicios$/,(_,a)=>`${a} exercises`],[/^(\d+) objetos$/,(_,a)=>`${a} objects`],
   [/^Modo (\d+)(.*)$/,(_,a,b)=>`Mode ${a}${b?traducirSegmentos(b):''}`],
   [/^Nivel (\d+): diferencia de (\d+) vasitos?$/,(_,a,b)=>`Level ${a}: difference of ${b} ${b==='1'?'cup':'cups'}`],
   [/^Nivel (\d+)$/,(_,a)=>`Level ${a}`],[/^(\d+) vasitos? de diferencia$/,(_,a)=>`${a}-cup difference`],
   [/^(\d+) mililitros en vasitos de 100 mililitros$/,(_,a)=>`${a} milliliters in 100-milliliter cups`],
   [/^Este recipiente tiene (\d+) mililitros de agua\.$/,(_,a)=>`This container holds ${a} milliliters of water.`],
   [/^En este recipiente caben (\d+) mililitros cuando está lleno\.$/,(_,a)=>`This container holds ${a} milliliters when full.`],
   [/^(\d+) imágenes disponibles\. La ronda tendrá (\d+) ejercicios sin repetir imagen\.$/,(_,a,b)=>`${a} images available. The round has ${b} exercises without repeating an image.`],
   [/^Has colocado (\d+) de (\d+)\. (.+)$/,(_,a,b,c)=>`You have placed ${a} of ${b}. ${traducirSegmentos(c)}`],
   [/^¡Muy bien, (.+?)! (.+)$/,(_,a,b)=>`Well done, ${a}! ${traducirSegmentos(b)}`],
   [/^Ordenaste los (\d+) objetos\.$/,(_,a)=>`You ordered all ${a} objects.`],
   [/^(.+), completaste (\d+) comparaciones\. ¡Conseguiste (\d+) estrellas!$/,(_,a,b,c)=>`${a}, you completed ${b} comparisons. You earned ${c} stars!`],
   [/^¡Buen trabajo, (.+)! Completaste la ronda\.$/,(_,a)=>`Great work, ${a}! You completed the round.`],
   [/^Números disponibles: (\d+) a (\d+)$/,(_,a,b)=>`Numbers available: ${a} to ${b}`],
   [/^(\d+) cifras?: (.+) a (.+)$/,(_,a,b,c)=>`${a} ${a==='1'?'digit':'digits'}: ${b} to ${c}`],
   [/^Configurar Modo (\d+): (.+)$/,(_,a,b)=>`Set up Mode ${a}: ${traducirContenido(b)}`],
   [/^Hola (.+)\. Vamos a reconocer números\.$/,(_,a)=>`Hello ${a}. Let's recognize numbers.`],
   [/^Atrapa el número (.+)\.$/,(_,a)=>`Catch number ${traducirContenido(a)}.`],
   [/^Ese no es el número (.+)\. Intenta de nuevo\.$/,(_,a)=>`That is not number ${traducirContenido(a)}. Try again.`],
   [/^Muy bien (.+)\. La vaca llegó al corral\.$/,(_,a)=>`Well done ${a}. The cow reached the pen.`],
   [/^Excelente (.+)\. Está correcto\.$/,(_,a)=>`Excellent ${a}. That is correct.`],
   [/^Revisa la palabra\. El nombre correcto es (.+)\.$/,(_,a)=>`Check the word. The correct name is ${traducirContenido(a)}.`],
   [/^La siguiente letra puede ser (.+)$/,(_,a)=>`The next letter could be ${a}`],
   [/^Llevas (\d+) de (\d+)\. Continúa con las cajas que faltan\.$/,(_,a,b)=>`You have ${a} of ${b}. Continue with the remaining boxes.`],
   [/^Revisa con cuidado, (.+)\. Algunos pareos se pueden mejorar\.$/,(_,a)=>`Check carefully, ${a}. Some matches can be improved.`],
   [/^Ordena los objetos\. (.+)$/,(_,a)=>`Order the objects. ${traducirSegmentos(a)}`],
   [/^Coloca los objetos de izquierda a derecha\. (.+)$/,(_,a)=>`Place the objects from left to right. ${traducirSegmentos(a)}`],
   [/^Guía visual · (.+)$/,(_,a)=>`Visual guide · ${traducirContenido(a)}`],
   [/^Este navegador ofrece (\d+) (?:voz femenina|voces femeninas) y (\d+) (?:voz masculina|voces masculinas) para este idioma\.$/,(_,a,b)=>`This browser provides ${a} female ${a==='1'?'voice':'voices'} and ${b} male ${b==='1'?'voice':'voices'} for this language.`],
   [/^(.+) · No disponible en este navegador$/,(_,a)=>`${a} · Not available in this browser`],
   [/^(.+) · Natural$/,(_,a)=>`${a} · Natural`],
   [/^Posición (\d+) de (\d+)$/,(_,a,b)=>`Position ${a} of ${b}`],
   [/^Seleccionar objeto de (.+)$/,(_,a)=>`Select an object from ${traducirContenido(a)}`],
   [/^(Elegir opción|Opción|Espacio disponible|Escuchar caja|Caja|Seleccionar) (.+)$/,(_,a,b)=>`${traducirContenido(a)} ${traducirContenido(b)}`],
   [/^Vaca con el número (\d+)$/,(_,a)=>`Cow with number ${a}`],
   [/^número (.+)$/,(_,a)=>`number ${traducirContenido(a)}`],
   [/^Del más (.+) al más (.+)$/,(_,a,b)=>`From ${comparativos[a]||a} to ${comparativos[b]||b}`]
  ];
  for(const [r,f]of reglas)if(r.test(s))return s.replace(r,f);
  const felicitaciones=[
   [/^Excelente ([^.!?]+), qué buen trabajo has hecho\.$/,a=>`Excellent ${a}, you have done such a great job.`],
   [/^Excelente ([^.!?]+), lo has hecho genial\.$/,a=>`Excellent ${a}, you did wonderfully.`],
   [/^Qué lindo has trabajado, ([^.!?]+)\.$/,a=>`You have worked so well, ${a}.`],
   [/^Estamos orgullosos de ti, ([^.!?]+)\.$/,a=>`We are proud of you, ${a}.`],
   [/^Muy bien, ([^.!?]+)\.$/,a=>`Well done, ${a}.`],[/^Fantástico, ([^.!?]+)\.$/,a=>`Fantastic, ${a}.`],
   [/^Bravo, ([^.!?]+)\.$/,a=>`Bravo, ${a}.`],[/^([^.!?]+), lo lograste\.$/,a=>`${a}, you did it.`],
   [/^Excelente trabajo, ([^.!?]+)\.$/,a=>`Excellent work, ${a}.`],[/^Muy buen esfuerzo, ([^.!?]+)\.$/,a=>`Great effort, ${a}.`],
   [/^Genial, ([^.!?]+)\.$/,a=>`Great, ${a}.`],[/^([^.!?]+), has hecho un trabajo maravilloso\.$/,a=>`${a}, you did a wonderful job.`],
   [/^Qué gran trabajo, ([^.!?]+)\.$/,a=>`What great work, ${a}.`],[/^Excelente, ([^.!?]+)\.$/,a=>`Excellent, ${a}.`],
   [/^Muy bien hecho, ([^.!?]+)\.$/,a=>`Very well done, ${a}.`]
  ];
  for(const[r,f]of felicitaciones){m=s.match(r);if(m)return f(m[1]);}
  return s;
 }
 function traducirSegmentos(s){
  const entero=traducirContenido(s);if(entero!==s)return entero;
  if(s.includes(' · '))return s.split(' · ').map(traducirSegmentos).join(' · ');
  if(s.includes(' → '))return s.split(' → ').map(traducirSegmentos).join(' → ');
  const partes=s.split(/(?<=[.!?])(\s+)/);if(partes.length>1)return partes.map(p=>/^\s+$/.test(p)?p:traducirContenido(p)).join('');
  const icono=s.match(/^([^\p{L}\p{N}¿¡]+)(.+)$/u);if(icono)return icono[1]+traducirSegmentos(icono[2]);
  if(Object.hasOwn(bases,s))return bases[s];return s;
 }
 function t(texto){if(estado.idioma!=='en'||typeof texto!=='string')return texto;const s=texto.trim(),res=traducirSegmentos(s);if(res===s&&/[áéíóúñ¿¡]|\b(?:el|los|las|del|de|para|una|cada|que|por)\b/.test(s))faltantes.add(s);return texto.replace(s,res);}
 const textos=new WeakMap(),atributos=new WeakMap();
 function localizado(root,atributosProcesados=false){
  if(!root||!root.isConnected||root.nodeType!==1&&root.nodeType!==3)return;
  if(root.nodeType===3){if(root.parentElement?.closest('script,style,#answer,[data-no-traducir]'))return;const now=root.data,old=textos.get(root),source=old&&now===old.tr?old.es:now,tr=t(source);textos.set(root,{es:source,tr});if(now!==tr)root.data=tr;return;}
  if(root.matches('script,style,[data-no-traducir],#answer'))return;
  const elems=atributosProcesados?[]:[root,...root.querySelectorAll('[aria-label],[alt],[title],[placeholder],optgroup')];
  for(const el of elems)for(const attr of ['aria-label','alt','title','placeholder','label'])if(el.hasAttribute(attr)){const key=atributos.get(el)||{},now=el.getAttribute(attr),old=key[attr],es=old&&now===old.tr?old.es:now,tr=t(es);key[attr]={es,tr};atributos.set(el,key);if(now!==tr)el.setAttribute(attr,tr);}
  for(const n of [...root.childNodes])localizado(n,true);
 }
 const femeninas=/\b(dalia|elvira|maria|maría|ximena|paloma|sabina|helena|laura|paulina|m[oó]nica|conchita|lupe|catalina|camila|samantha|ava|emma|jenny|aria|sonia|susan|zira|hazel|sara|sarah|karen|moira|tessa|victoria|salli|joanna|kendra|amy|emma|female)\b/i;
 const masculinas=/\b(jorge|[aá]lvaro|diego|alonso|pablo|marcelo|manuel|andres|andr[eé]s|tomas|tom[aá]s|carlos|miguel|andrew|brian|guy|ryan|david|mark|daniel|alex|fred|oliver|lee|tom|george|arthur|male)\b/i;
 const preferidas={es:{f:['Dalia','Elvira','María'],m:['Jorge','Álvaro','Diego']},en:{f:['Ava','Jenny','Sonia'],m:['Andrew','Guy','Ryan']}};
 const genero=v=>femeninas.test(v.name)?'f':masculinas.test(v.name)?'m':'otro';
 const puntuacion=v=>(/natural|neural|premium|enhanced|online/i.test(v.name)?100:0)+(estado.idioma==='es'&&/es-(CR|MX|US)/i.test(v.lang)?15:0)+(estado.idioma==='en'&&/^en-US/i.test(v.lang)?15:0)+(/Dalia|Ava/i.test(v.name)?30:/Elvira|Jenny/i.test(v.name)?22:/Maria|María|Sonia|Laura/i.test(v.name)?18:0);
 const idVoz=v=>v.voiceURI||v.name+'|'+v.lang;
 function voces(){const vistos=new Set();return ('speechSynthesis'in window?speechSynthesis.getVoices():[]).filter(v=>v.lang&&new RegExp('^'+estado.idioma+'(?:-|$)').test(v.lang.toLowerCase().replace('_','-'))).filter(v=>{const id=idVoz(v);if(vistos.has(id))return false;vistos.add(id);return true;}).sort((a,b)=>puntuacion(b)-puntuacion(a)||a.name.localeCompare(b.name));}
 function elegida(){const vs=voces();return vs.find(v=>idVoz(v)===estado.voces[estado.idioma])||vs.find(v=>genero(v)==='f')||vs[0]||null;}
 function nombreVoz(v){return v.name.replace(/^Microsoft\s+/i,'').replace(/\s+(Online|Desktop).*$/i,'').replace(/\s+-\s+.*$/,'')+' ('+v.lang+')'+(/natural|neural|premium|enhanced/i.test(v.name)?' · Natural':'');}
 let contenedor=null,onIdioma=null,observer=null;
 function opcionesVoz(){
  if(!contenedor)return;const select=contenedor.querySelector('#vozElegida'),status=contenedor.querySelector('#disponibilidadVoces'),vs=voces(),actual=elegida();select.replaceChildren();
  for(const g of ['f','m']){const group=document.createElement('optgroup');group.label=g==='f'?'Femeninas':'Masculinas';const available=vs.filter(v=>genero(v)===g).slice(0,3);for(const v of available)group.append(new Option(nombreVoz(v),idVoz(v)));
   for(const name of preferidas[estado.idioma][g]){if(group.children.length>=3)break;if(available.some(v=>v.name.toLowerCase().includes(name.toLowerCase())))continue;const option=new Option(name+' · No disponible en este navegador','no-'+g+'-'+name);option.disabled=true;group.append(option);}select.append(group);
  }
  const desconocidas=vs.filter(v=>genero(v)==='otro').slice(0,4);if(desconocidas.length){const group=document.createElement('optgroup');group.label='Otras voces disponibles';for(const v of desconocidas)group.append(new Option(nombreVoz(v),idVoz(v)));select.append(group);}
  if(actual&&!Array.from(select.options).some(o=>o.value===idVoz(actual))){const opt=new Option(nombreVoz(actual),idVoz(actual));select.append(opt);}
  if(actual)select.value=idVoz(actual);else select.selectedIndex=-1;select.disabled=!vs.length;
  const f=vs.filter(v=>genero(v)==='f').length,m=vs.filter(v=>genero(v)==='m').length;
  status.textContent=`Este navegador ofrece ${f} ${f===1?'voz femenina':'voces femeninas'} y ${m} ${m===1?'voz masculina':'voces masculinas'} para este idioma.`;
  localizado(contenedor);
 }
 function hablar(texto,{interrumpir=true}={}){if(!('speechSynthesis'in window))return null;if(interrumpir)speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t(texto)),v=elegida();u.lang=v?.lang||(estado.idioma==='es'?'es-ES':'en-US');u.voice=v;u.rate=estado.velocidad;u.pitch=1;speechSynthesis.speak(u);return u;}
 function instalar(selector,{cambioIdioma}={}){
  contenedor=document.querySelector(selector);if(!contenedor)return;onIdioma=cambioIdioma;
  contenedor.classList.add('idioma-voz');contenedor.innerHTML='<h3>Idioma y voz</h3><label>Idioma<select id="idiomaAplicacion"><option value="es">Español</option><option value="en">Inglés</option></select></label><label>Voz<select id="vozElegida"></select></label><p class="iv-nota">Se priorizan las voces naturales. La primera voz femenina disponible se usa de forma predeterminada.</p><p class="iv-nota" id="disponibilidadVoces" role="status"></p><label>Velocidad de la voz<select id="velocidadVoz">'+Array.from({length:9},(_,i)=>`<option value="${(i+7)/10}">${((i+7)/10).toFixed(1)}x</option>`).join('')+'</select></label><button type="button" id="probarIdiomaVoz">🔊 Escuchar esta voz</button><p class="iv-nota">Idioma, voz y velocidad se guardan en este navegador. Cada idioma recuerda su voz.</p>';
  contenedor.querySelector('#idiomaAplicacion').value=estado.idioma;contenedor.querySelector('#velocidadVoz').value=estado.velocidad;
  contenedor.querySelector('#idiomaAplicacion').addEventListener('change',e=>{estado.idioma=e.target.value;if('speechSynthesis'in window)speechSynthesis.cancel();guardar();document.documentElement.lang=estado.idioma;opcionesVoz();onIdioma?.();localizado(document.body);document.title=t(tituloOriginal);});
  contenedor.querySelector('#vozElegida').addEventListener('change',e=>{estado.voces[estado.idioma]=e.target.value;guardar();if('speechSynthesis'in window)speechSynthesis.cancel();});
  contenedor.querySelector('#velocidadVoz').addEventListener('change',e=>{estado.velocidad=+e.target.value;guardar();if('speechSynthesis'in window)speechSynthesis.cancel();});
  contenedor.querySelector('#probarIdiomaVoz').addEventListener('click',()=>hablar('Hola. Vamos a aprender y jugar juntos.'));
  opcionesVoz();document.documentElement.lang=estado.idioma;document.title=t(tituloOriginal);
  observer?.disconnect();observer=new MutationObserver(changes=>{const pendientes=new Set();for(const c of changes){if(c.type==='childList')for(const n of c.addedNodes)pendientes.add(n);else pendientes.add(c.target);}for(const n of pendientes)localizado(n);});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt','placeholder','label']});localizado(document.body);
 }
 const tituloOriginal=document.title;
 if('speechSynthesis'in window)speechSynthesis.addEventListener('voiceschanged',opcionesVoz);
 window.IdiomaVoz={instalar,hablar,t,ingles,localizar:()=>localizado(document.body),get idioma(){return estado.idioma;},get velocidad(){return estado.velocidad;},get estado(){return JSON.parse(JSON.stringify(estado));},get voz(){return elegida();},faltantes:()=>[...faltantes]};
})();
