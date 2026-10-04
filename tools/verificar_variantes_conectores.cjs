const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href);
  await page.waitForFunction(()=>baseLista);
  const result=await page.evaluate(()=>{
   let originals=0,variants=0,rejected=0;
   const check=(ok,msg)=>{if(!ok)throw Error(msg);};
   const row=text=>({words:text.split(' ')});
   const accepts=(expected,answer,free=true)=>respuestaValida(answer.split(' '),row(expected),free);
   const possessive='Marta lee un libro en la casa .';
   for(const answer of ['Marta lee su libro en la casa .','Marta lee el libro en su casa .','Marta lee su libro en su casa .','en su casa Marta lee su libro .'])check(accepts(possessive,answer),'Posesivo válido: '+answer);
   check(accepts('Marta lee su libro en su casa .',possessive),'Variante inversa de posesivo');
   check(accepts('Marcos usa la gorra en la casa .','Marcos usa su gorra en su casa .'),'Su gorra');
   check(accepts('Ana escribe en el cuaderno en la escuela .','Ana escribe en su cuaderno en su escuela .'),'Su cuaderno');
   check(accepts('Marcos se cepilla los dientes con el cepillo de dientes .','Marcos se cepilla sus dientes con su cepillo de dientes .'),'Sus dientes y su cepillo');
   check(accepts('Marta ve los zapatos en la casa .','Marta ve sus zapatos en su casa .'),'Sus zapatos');
   check(accepts('el señor come la pizza en la casa .','el señor come su pizza en su casa .'),'Su pizza');
   check(accepts('Ana toma agua en la casa .','Ana toma su agua en su casa .'),'Objeto sin artículo con posesivo');
   for(const [expected,answer] of [
    ['Marta lee un libro en la casa .','Marta lee sus libro en la casa .'],
    ['Marta ve los zapatos en la casa .','Marta ve su zapatos en la casa .'],
    ['Marta lee un libro en la casa .','Marta lee su el libro en la casa .'],
    ['Marta ve la montaña en el valle .','Marta ve su montaña en su valle .'],
    ['el barco está al lado de la casa .','el barco está a su lado de la casa .'],
    ['Juan no come la pizza en la casa .','Juan come su pizza en la casa .'],
   ])check(!accepts(expected,answer),'Posesivo incorrecto: '+answer);
   check(!accepts(possessive,'Marta lee su libro en su casa .',false),'Conectores solo en niveles libres');
   const pizza='el señor come la pizza en la casa .';
   for(const answer of ['el señor come pizza en la casa .','el señor come una pizza en la casa .',pizza])check(accepts(pizza,answer),'Pizza válida: '+answer);
   for(const noun of ['pizza','sopa','zanahoria','pepino','lechuga','manzana','naranja','sandía','banana','pera','melocotón','hamburguesa','confite','agua','fresco','cereal','arroz','pan','carne','chocolate','espagueti','galletas','frijoles','huevos','uvas','fresas','frutas','verduras']){
    const arts=ALIMENTOS_GENERICOS[noun]||NOMBRES_SIN_ARTICULO[noun];
    const verb=['agua','fresco'].includes(noun)?'toma':'come';
    const expected='el señor '+verb+' '+arts[0]+' '+noun+' en la casa .';
    for(const article of ['',...arts]){const answer='el señor '+verb+' '+(article?article+' ':'')+noun+' en la casa .';check(accepts(expected,answer),'Consumo válido: '+answer);check(accepts('el señor '+verb+' '+noun+' en la casa .',answer),'Consumo inverso: '+answer);}
    const wrong=['el','un','los','unos'].includes(arts[0])?'una':'un';
    check(!accepts(expected,'el señor '+verb+' '+wrong+' '+noun+' en la casa .'),'Concordancia del alimento: '+noun);
    check(!accepts(expected,'el señor '+verb+' '+noun+' en casa .'),'El artículo del lugar se conserva');
   }
   for(const noun of Object.keys(PRENDAS_GENERICAS)){
    const arts=PRENDAS_GENERICAS[noun];
    const expected='Marcos usa '+arts[0]+' '+noun+' en la casa .';
    for(const article of ['',...arts])check(accepts(expected,'Marcos usa '+(article?article+' ':'')+noun+' en la casa .'),'Prenda válida: '+noun);
   }
   check(!accepts('Marcos ve la gorra en la casa .','Marcos ve gorra en la casa .'),'No omitir cualquier objeto singular');
   check(!accepts('el señor come una barra en la casa .','el señor come barra en la casa .'),'Barra requiere artículo');
   check(!accepts(pizza,'señor come pizza en la casa .'),'El sujeto conserva el artículo');
   check(!accepts(pizza,'el señor pizza come en la casa .'),'Orden incorrecto');
   check(!accepts('el señor no come la pizza en la casa .','el señor come pizza en la casa .'),'Negación conservada en alimentos');
   const food='las niñas comen la zanahoria en el patio .';
   for(const answer of ['las niñas comen zanahoria en el patio .','las niñas comen una zanahoria en el patio .','en el patio las niñas comen zanahoria .'])check(accepts(food,answer),'Alimento sin artículo: '+answer);
   check(accepts('las niñas comen zanahoria en el patio .',food),'Alimento con artículo');
   check(accepts('Marcos come la manzana en la casa .','Marcos come manzana en la casa .'),'Fruta genérica');
   for(const answer of ['las niñas comen un zanahoria en el patio .','las niñas comen zanahoria en patio .','las niñas comen zanahoria .','las niñas comen zanahoria en el patio','las niñas come zanahoria en el patio .','las niñas comen zanahoria en el patio robot .'])check(!accepts(food,answer),'Alimento incorrecto: '+answer);
   check(!accepts('Marta ve la zanahoria en el patio .','Marta ve zanahoria en el patio .'),'La omisión singular se limita al consumo');
   check(!accepts(food,'las niñas comen zanahoria en el patio .',false),'Mazo fijo conserva sus palabras');
   const base='Marta ve el barco en el río .';
   for(const answer of ['Marta ve un barco en el río .','Marta ve un barco en un río .','en el río Marta ve un barco .','Marta en un río ve el barco .'])check(accepts(base,answer),answer);
   for(const answer of ['Marta ve una barco en el río .','Marta ve unos barco en el río .','Marta ve un barco el río .','Marta es un barco en el río .','Marta ve el río en el barco .','Marta ve un barco en el río','Marta ve un barco en el río . .','Marta ve un barco en el río basura .','Marta ve barco en río .'])check(!accepts(base,answer),'No debe aceptar: '+answer);
   check(!accepts(base,'Marta ve un barco en el río .',false),'Los niveles sin conectores conservan su mazo');
   check(accepts('Marta lee un libro en la escuela .','Marta lee el libro en una escuela .'),'el/un y la/una');
   check(accepts('Ana juega con los juguetes en la casa .','Ana juega con unos juguetes en una casa .'),'los/unos');
   check(!accepts('Ana juega con los juguetes en la casa .','Ana juega con las juguetes en la casa .'),'Género plural');
   check(accepts('el barco azul está al lado del río .','un barco azul está al lado de un río .'),'Contracción del');
   check(accepts('el barco azul está al lado del río .','al lado de el río está un barco azul .'),'Lugar antepuesto e inversión');
   check(!accepts('el barco azul está al lado del río .','el barco azul es al lado del río .'),'No confundir ser y estar');
   check(!accepts('el barco azul está al lado del río .','el barco azul está a un lado del río .'),'Locución al lado');
   check(accepts('Marta ve las plantas en el bosque .','Marta ve plantas en un bosque .'),'Objeto plural sin artículo');
   check(accepts('la vaca come pasto en la llanura .','una vaca come el pasto en una llanura .'),'Objeto de materia con artículo');
   check(accepts('Marta no bota basura en el bosque .','en un bosque Marta no bota la basura .'),'Conservar negación');
   check(!accepts('Marta no bota basura en el bosque .','Marta bota basura en el bosque .'),'No omitir no');
   check(accepts('el niño no está en la casa .','en una casa no está un niño .'),'Inversión con negación');
   check(!accepts('el niño no está en la casa .','en una casa está un niño no .'),'Negación fuera de lugar');
   check(!accepts('Marta escribe en el cuaderno en la casa .','en el cuaderno Marta escribe en la casa .'),'No cambiar objeto por lugar');
   const cortar='Juan no corta el árbol en la llanura .';
   for(const answer of ['Juan no corta un árbol de la llanura .','Juan no corta el árbol de una llanura .','Juan no corta un árbol en una llanura .','en la llanura Juan no corta un árbol .'])check(accepts(cortar,answer),'Variante de lugar u origen: '+answer);
   check(accepts('Juan no corta un árbol de la llanura .',cortar),'Variante inversa de/en');
   check(accepts('Marta ve el barco en el río .','Marta ve un barco del río .'),'Pertenencia con contracción');
   for(const answer of ['Juan corta un árbol de la llanura .','Juan no corta una árbol de la llanura .','Juan no corta un árbol de el llanura .','Juan no corta un árbol con la llanura .','Juan no corta un árbol de la llanura basura .','Juan no corta un árbol de la llanura'])check(!accepts(cortar,answer),'Variante incorrecta: '+answer);
   check(!accepts('Juan corre en la llanura .','Juan corre de la llanura .'),'No intercambiar cualquier preposición');
   check(!accepts('el barco está en el río .','el barco está del río .'),'No usar pertenencia con estar');
   check(!accepts(cortar,'Juan no corta un árbol de la llanura .',false),'Mazo sin conectores');
   for(const exercise of SENTENCES){
    const free=exercise.level>=5;
    for(const answer of [exercise.words,...(exercise.validAnswers||[])]){
     check(respuestaValida(answer,exercise,free),'Respuesta existente: '+answer.join(' '));originals++;
    }
    if(!free)continue;
    const tokens=tokensGramaticales(exercise.words);
    for(const structure of estructurasEquivalentes(tokens)){
     check(respuestaValida(structure,exercise,true),'Complemento de lugar: '+structure.join(' '));variants++;
    }
    for(let i=0;i<tokens.length;i++){
     if(!ARTICULOS_VARIANTES[tokens[i]]||(tokens[i]==='el'&&tokens[i-1]==='a'&&tokens[i+1]==='lado'))continue;
     const replacement=ARTICULOS_VARIANTES[tokens[i]].find(w=>w!==tokens[i]);
     const variant=[...tokens];variant[i]=replacement;
     check(respuestaValida(variant,exercise,true),'Artículo válido: '+variant.join(' '));variants++;
     const wrong=[...tokens];wrong[i]=['el','un','los','unos'].includes(tokens[i])?'una':'un';
     check(!respuestaValida(wrong,exercise,true),'Artículo incorrecto: '+wrong.join(' '));rejected++;
    }
    const missing=tokens.slice(0,-1);
    check(!respuestaValida(missing,exercise,true),'Falta punto: '+missing.join(' '));rejected++;
    const shuffled=[...tokens];const v=shuffled.findIndex(w=>VERBOS_ORACION.has(w));
    if(v>=0&&shuffled[v]==='ve'){
     shuffled[v]='es';check(!respuestaValida(shuffled,exercise,true),'Cambio de verbo');rejected++;
    }
   }
   // Integración con el botón Revisar, puntuación y mensaje de éxito.
   currentLevel=5;current=row(base);score=0;isSolved=false;checkAttempts=0;
   sentenceItems='Marta ve un barco en el río .'.split(' ').map((base,i)=>({base,text:i===0?capWord(base):base}));
   triggerCelebration=()=>{};speak=()=>{};
   checkAnswer();check(isSolved&&score===1,'Revisar debe reconocer la variante');
   current=SENTENCES.find(s=>s.level===5&&s.words.join(' ')===cortar);
   check(!!current,'El ejercicio de Juan debe existir en la base');
   isSolved=false;checkAttempts=0;
   sentenceItems='Juan no corta un árbol de la llanura .'.split(' ').map((base,i)=>({base,text:i===0?capWord(base):base}));
   checkAnswer();check(isSolved&&score===2,'Revisar debe aceptar el árbol de la llanura');
   current=SENTENCES.find(s=>s.level===5&&s.words.join(' ')==='las niñas comen la pizza en el patio .');
   check(!!current,'Ejercicio natural de consumo presente');
   isSolved=false;checkAttempts=0;
   sentenceItems='las niñas comen pizza en el patio .'.split(' ').map((base,i)=>({base,text:i===0?capWord(base):base}));
   checkAnswer();check(isSolved&&score===3,'Revisar acepta alimento sin artículo');
   current=SENTENCES.find(s=>s.level===5&&s.words.join(' ')==='Marta lee el libro en la casa .');
   check(!!current,'Existe el ejercicio de lectura');loadCurrent();
   const answer='Marta lee su libro en su casa .'.split(' ');
   for(const word of answer){const index=bankItems.findIndex(it=>it.base===word);if(index>=0)moveItem('bank',index,'sentence',sentenceItems.length);else{const fn=functionItems.findIndex(it=>it.base===word);check(fn>=0,'Conector disponible: '+word);moveItem('function',fn,'sentence',sentenceItems.length);}}
   check(functionItems.some(it=>it.base==='su')&&functionItems.some(it=>it.base==='sus'),'Su y sus son reutilizables');
   checkAnswer();check(isSolved&&bankItems.length===0,'Construcción y revisión con dos usos de su');
   return {originals,variants,rejected,result:'OK'};
  });
  assert.deepEqual(errors,[]);console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
