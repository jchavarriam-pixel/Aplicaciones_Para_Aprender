const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path');
async function main(){const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage();await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.goto(pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href);await p.waitForFunction(()=>baseLista);const result=await p.evaluate(()=>{
 let locations=0,times=0,rejected=0;
 for(const row of SENTENCES.filter(r=>r.level>=5)){
  const tokens=tokensGramaticales(row.words),variants=variantesPuntoDeObservacion(tokens);
  for(const variant of variants.slice(1)){
   if(!respuestaValida(variant,row,true))throw Error('Punto de observación');locations++;
   if(respuestaValida(variant.filter(w=>w!=='cerca'),row,true))throw Error('Falta referencia');rejected++;
  }
  const text=tokens.join(' '),time=text.endsWith('de día .')?'día':text.endsWith('de noche .')?'noche':null;
  if(time){for(const prefix of time==='día'?['de día','en el día','durante el día','por el día']:['de noche','en la noche','durante la noche','por la noche']){
   const answer=text.replace('de '+time+' .',prefix+' .');if(!respuestaValida(answer.split(' '),row,true))throw Error(answer);times++;
  }
  const opposite=text.replace('de '+time+' .','de '+(time==='día'?'noche':'día')+' .');if(respuestaValida(opposite.split(' '),row,true))throw Error('Cambio de día a noche');rejected++;
 }
 }
 currentLevel=6;current=SENTENCES.find(r=>r.words.join(' ')==='la niña observa la montaña con el niño desde el árbol cerca del parque de día .');
 if(!current)throw Error('Falta ejercicio de la captura');leerRespuestaYCelebrar=()=>{};loadCurrent();
 const answer='la niña observa la montaña con el niño desde el árbol cerca del parque en el día .';
 for(const w of answer.split(' ')){const i=bankItems.findIndex(it=>it.base===w);if(i>=0)moveItem('bank',i,'sentence',sentenceItems.length);else{const f=functionItems.findIndex(it=>it.base===w);if(f<0)throw Error('Falta '+w);moveItem('function',f,'sentence',sentenceItems.length);}}
 checkAnswer();if(!isSolved||bankItems.length)throw Error('Captura rechazada o palabras principales sobrantes');
 for(const text of ['la niña observa la montaña con el niño desde el árbol cerca del parque durante el día .','la niña observa la montaña con el niño desde el parque cerca del árbol en el día .'])if(!respuestaValida(text.split(' '),current,true))throw Error(text);
 for(const text of ['la niña observa la montaña con el niño desde el árbol cerca del parque en la día .','la niña observa la montaña con el niño desde el árbol cerca del parque en el noche .','la niña observa la montaña desde el árbol cerca del parque en el día .','la niña observa la montaña con el niño desde el árbol cerca del parque en el día','la niña observa la montaña con el niño desde el árbol cerca del parque en el día . pizza'])if(respuestaValida(text.split(' '),current,true))throw Error('Aceptada incorrectamente '+text);
 if(!functionItems.some(i=>i.base==='durante'))throw Error('Falta durante reutilizable');
 return {locations,times,rejected,screenshotThroughWordBank:'OK',noRequiredWordsLeft:'OK'};
});console.log(JSON.stringify(result));}finally{await b.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
