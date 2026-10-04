const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
async function main(){const browser=await chromium.launch({channel:'chrome',headless:true});try{const page=await browser.newPage();await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto(pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href);await page.waitForFunction(()=>baseLista);
const result=await page.evaluate(()=>{
 let positive=0,negative=0,exercises=0;
 const check=(exercise,text,expected=true)=>{if(respuestaValida(text.split(' '),exercise,true)!==expected)throw Error((expected?'Rechazada: ':'Aceptada indebidamente: ')+text+' / '+exercise.words.join(' '));expected?positive++:negative++;};
 for(const exercise of SENTENCES.filter(r=>r.level>=5&&r.words.join(' ').includes(' y con '))){
  const normalized=tokensGramaticales(exercise.words),variants=variantesRelacionDeJuego(normalized);
  if(variants.length===1)continue;
  exercises++;
  for(const words of variants.slice(1)){
   check(exercise,words.join(' '));
   check(exercise,words.join(' ').replace(/de la casa/g,'de su casa'));
   const obj=words.findIndex(w=>JUGUETES_POSEIBLES.has(w));
   if(obj>0&&['el','la','los','las'].includes(words[obj-1])){const indefinite={el:'un',la:'una',los:'unos',las:'unas'};const copy=[...words];copy[obj-1]=indefinite[copy[obj-1]];check(exercise,copy.join(' '));}
   check(exercise,words.join(' ').replace(/\s\.$/,''),false);
   check(exercise,words.join(' ').replace(/juega(n)?/,'lee'),false);
   check(exercise,words.join(' ').replace(/pelota|juguetes|bloques|robot|rompecabezas/,'pizza'),false);
  }
 }
 let possessiveVariants=0;
 for(const exercise of SENTENCES.filter(r=>r.level>=5)){
  const words=tokensGramaticales(exercise.words),verb=words.findIndex(w=>VERBOS_ORACION.has(w));
  for(let i=verb+1;verb>=0&&i<words.length-1;i++){
   if(!ARTICULOS_VARIANTES[words[i]]||!DETERMINANTES_POSESIVOS[words[i+1]])continue;
   if(words[i-1]==='a'&&words[i+1]==='lado')continue;
   const copy=[...words];copy[i]=DETERMINANTES_POSESIVOS[words[i+1]].at(-1);
   check(exercise,copy.join(' '));possessiveVariants++;
   copy[i]=copy[i]==='su'?'sus':'su';check(exercise,copy.join(' '),false);
  }
 }
 currentLevel=6;current=SENTENCES.find(r=>r.words.join(' ')==='Manuel juega con los juguetes y con el niño en el patio de la casa .');
 if(!current)throw Error('Falta ejercicio de la captura');
 leerRespuestaYCelebrar=()=>{};loadCurrent();
 const screenshot='Manuel juega con los juguetes del niño en el patio de su casa .';
 for(const w of screenshot.split(' ')){const i=bankItems.findIndex(it=>it.base===w);if(i>=0)moveItem('bank',i,'sentence',sentenceItems.length);else{const f=functionItems.findIndex(it=>it.base===w);if(f<0)throw Error('Palabra no disponible: '+w);moveItem('function',f,'sentence',sentenceItems.length);}}
 checkAnswer();if(!isSolved)throw Error('Revisar rechaza la captura');
 for(const text of ['Manuel juega con juguetes del niño en el patio de su casa .','en el patio de su casa Manuel juega con los juguetes del niño .','Manuel juega con el niño y con sus juguetes en su patio de su casa .'])check(current,text);
 for(const text of ['Manuel juega con los juguetes de la niño en el patio de su casa .','Manuel juega con los juguetes del niño en el patio de sus casa .','Manuel juega con los juguetes en el patio de su casa .','Manuel juega con los juguetes del niño .','Manuel juega con los juguetes del niño en el patio de su casa . robot'])check(current,text,false);
 const reverse={level:6,words:'Manuel juega con los juguetes en el patio de la casa y con el niño .'.split(' '),pics:current.pics};
 check(reverse,screenshot);
 // Los verbos nuevos respetan posesivos, concordancia y palabras de todas las imágenes.
 for(const [base,answer,bad] of [
 ['Ana observa el libro en la casa .','Ana observa su libro en su casa .','Ana observa sus libro en su casa .'],
 ['Marcos mira la tableta en la casa .','Marcos mira su tableta en su casa .','Marcos mira su tableta en sus casa .'],
 ['el niño arma el rompecabezas en la sala .','el niño arma su rompecabezas en su sala .','el niño arma sus rompecabezas en su sala .']
 ]){const e={level:5,words:base.split(' ')};check(e,answer);check(e,bad,false);}
 // No trasladar la regla de juguetes a animales ni a otras relaciones.
 check({words:'Ana ve la jirafa y con el niño en la llanura .'.split(' ')},'Ana ve la jirafa del niño en la llanura .',false);
 return {exercises,positive,negative,possessiveVariants,screenshotThroughWordBank:'OK'};
});assert.ok(result.exercises>=81);console.log(JSON.stringify(result));}finally{await browser.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
