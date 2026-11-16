/* Validación acotada al artículo y nombre pedidos, sin aceptar desacuerdos de número. */
(()=>{'use strict';
 const normal=s=>String(s||'').normalize('NFC').trim().toLocaleLowerCase().replace(/[.!?,;:]+$/u,'').trim().replace(/\s+/g,' ');
 const nombreNormal=s=>normal(s).replace(/[áéíóúü]/g,c=>({'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u'}[c]));
 const capital=s=>s?s[0].toLocaleUpperCase()+s.slice(1):s;
 function articulos(q,idioma,indefinidos=false){if(idioma==='en')return ['the',...(indefinidos&&!q.plural?[/^[aeiou]/i.test(q.sujeto.en[0])?'an':'a']:[])];return [q.plural?(q.sujeto.genero==='f'?'las':'los'):(q.sujeto.genero==='f'?'la':'el'),...(indefinidos?[q.plural?(q.sujeto.genero==='f'?'unas':'unos'):(q.sujeto.genero==='f'?'una':'un')]:[])];}
 function nombre(q,idioma){return q.sujeto[idioma][q.plural?1:0];}
 function predicado(q,idioma){return q.sujeto.frases[q.frase][(idioma==='en'?2:0)+(q.plural?1:0)];}

 function opciones(config){const nums=config.numero==='mixto'?[false,true]:[config.numero==='plural'];return ASDatos.filter(s=>config.imagenes.includes(s.id)).flatMap(s=>nums.flatMap(plural=>s.frases.map((_,frase)=>({id:s.id+'-'+Number(plural)+'-'+frase,sujeto:s,plural,frase}))));}
 function validar(q,respuestas,{idioma='es',indefinidos=false}={}){const articulo=articulos(q,idioma,indefinidos).includes(normal(respuestas.articulo)),sustantivo=(q.sujeto.alternativas?.[idioma]?.[q.plural?1:0]||[nombre(q,idioma)]).some(n=>nombreNormal(respuestas.nombre)===nombreNormal(n));return {articulo,nombre:sustantivo,correcta:articulo&&sustantivo};}
 function frase(q,idioma,articulo=articulos(q,idioma)[0],sustantivo=nombre(q,idioma)){return capital(normal(articulo))+' '+normal(sustantivo)+' '+predicado(q,idioma)+'.';}
 function imagenes(q){return q.plural?(q.sujeto.imagenPlural?[q.sujeto.imagenPlural]:[q.sujeto.imagen,q.sujeto.imagen]):[q.sujeto.imagen];}
 function cantidad(q){return q.plural?(q.sujeto.cantidadPlural||2):1;}
 window.ASModelo={normal,nombreNormal,capital,articulos,nombre,predicado,imagenes,cantidad,opciones,validar,frase};
})();
