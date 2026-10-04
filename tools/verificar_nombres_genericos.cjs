const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path');
async function main(){const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage();await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.goto(pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href);await p.waitForFunction(()=>baseLista);const result=await p.evaluate(()=>{
 let accepted=0,rejected=0;const check=(row,text,expected=true,free=true)=>{if(respuestaValida(text.split(' '),row,free)!==expected)throw Error(text+' / '+row.words.join(' '));expected?accepted++:rejected++;};
 for(const raw of SENTENCES.filter(r=>r.level>=5)){
  const tokens=tokensGramaticales(raw.words);
  for(const person of ['niño','niña']){
   const index=tokens.indexOf(person);if(index<1||!['el','la','un','una'].includes(tokens[index-1])||!raw.pics.includes(person))continue;
   for(const name of NOMBRES_POR_PERSONA[person]){
    if(tokens.includes(name))continue;
    const row={...raw,extras:[name]},text=[...tokens.slice(0,index-1),name,...tokens.slice(index+1)].join(' ');check(row,text);
    check({...raw,extras:[]},text,false);
   }
  }
 }
 const raw=SENTENCES.find(r=>r.level===5&&r.words.join(' ')==='el niño cierra la ventana en la escuela .');if(!raw)throw Error('Falta ejercicio');
 currentLevel=5;current={...raw,extras:['Daniel','conejo']};leerRespuestaYCelebrar=()=>{};loadCurrent();
 const answer='Daniel cierra la ventana de la escuela .';
 for(const w of answer.split(' ')){const i=bankItems.findIndex(it=>it.base===w);if(i>=0)moveItem('bank',i,'sentence',sentenceItems.length);else{const f=functionItems.findIndex(it=>it.base===w);if(f<0)throw Error('Falta '+w);moveItem('function',f,'sentence',sentenceItems.length);}}
 checkAnswer();if(!isSolved||bankItems.length!==2||!bankItems.some(i=>i.base==='niño'))throw Error('Captura');
 check(current,'el niño cierra la ventana de la escuela .');check(current,'Daniel cierra su ventana en su escuela .');
 for(const text of ['Daniel cierran la ventana de la escuela .','Daniel cierra el ventana de la escuela .','Daniel cierra la ventana .','Daniel cierra la ventana de la escuela','Daniel cierra la ventana de la escuela . conejo','Ana cierra la ventana de la escuela .'])check(current,text,false);
 const girl={...raw,pics:['niña','cierra','ventana','escuela'],words:'la niña cierra la ventana en la escuela .'.split(' '),extras:['Marta','Daniel']};check(girl,'Marta cierra la ventana de la escuela .');check(girl,answer,false);
 const named={...raw,pics:['Juan','cierra','ventana','escuela'],words:'Juan cierra la ventana en la escuela .'.split(' '),extras:['Daniel']};check(named,answer,false);
 check({...raw,level:4,extras:['Daniel']},answer,false,false);
 const group={...raw,pics:['niños','cierra','ventana','escuela'],words:'los niños cierran la ventana en la escuela .'.split(' '),extras:['Daniel']};check(group,'Daniel cierran la ventana en la escuela .',false);
 return {accepted,rejected,screenshotThroughWordBank:'OK',preservesNamedPicturesAndAgreement:'OK'};
});console.log(JSON.stringify(result));}finally{await b.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
