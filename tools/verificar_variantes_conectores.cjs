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
   return {originals,variants,rejected,result:'OK'};
  });
  assert.deepEqual(errors,[]);console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
