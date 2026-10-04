const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
async function main(){const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage();await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.goto(pathToFileURL(path.resolve(__dirname,'../generador-oraciones.html')).href);await p.waitForFunction(()=>baseLista);const result=await p.evaluate(()=>{
 let checks=0;const verify=(exercise,text,expected=true)=>{if(respuestaValida(text.split(' '),exercise,exercise.level>=5)!==expected)throw Error(text);checks++;};
 const rows=SENTENCES.filter(r=>r.source==='detalles_cotidianos_v1');
 for(const row of rows){verify(row,row.words.join(' '));for(const ans of row.validAnswers||[])verify(row,ans.join(' '));if(row.level===6&&(/durante el día|de la sala de la casa durante/.test(row.words.join(' '))))throw Error('Relleno innecesario');if(row.words[0]==='Marta'||row.words[0]==='Ana'){if(row.words.includes('sentado'))throw Error('Concordancia');}}
 currentLevel=6;current=rows.find(r=>r.level===6&&r.words.join(' ')==='Manuel está sentado en el sofá amarillo de la sala de la casa .');
 if(!current)throw Error('Falta ejemplo solicitado');leerRespuestaYCelebrar=()=>{};loadCurrent();
 const answer='Manuel está sentado en el sofá amarillo de la sala de su casa .';
 for(const w of answer.split(' ')){const i=bankItems.findIndex(it=>it.base===w);if(i>=0)moveItem('bank',i,'sentence',sentenceItems.length);else{const f=functionItems.findIndex(it=>it.base===w);if(f<0)throw Error('Falta '+w);moveItem('function',f,'sentence',sentenceItems.length);}}
 checkAnswer();if(!isSolved)throw Error('Rechazo desde el mazo');
 for(const text of [answer,'Manuel está sentado en su sofá amarillo en la sala de su casa .','en la sala de su casa Manuel está sentado en el sofá amarillo .','Manuel está sentado en la sala de su casa en su sofá amarillo .'])verify(current,text);
 for(const text of ['Manuel está sentado en el sofá amarilla de la sala de su casa .','Manuel están sentado en el sofá amarillo de la sala de su casa .','Manuel está sentado en el sofá de la sala de su casa .','Manuel está sentado en el sofá amarillo de la sala de sus casa .','Manuel está sentado en el sofá amarillo de la sala de su casa','Manuel está sentado en el sofá amarillo de su casa .'])verify(current,text,false);
 const female=rows.find(r=>r.level===6&&r.words.join(' ')==='Marta está sentada en la silla roja de la sala de la casa .');verify(female,'Marta está sentada en su silla roja de la sala de su casa .');verify(female,'Marta está sentado en la silla roja de la sala de la casa .',false);
 const fixed=rows.find(r=>r.level===3&&r.words.join(' ')==='Manuel está sentado en el sofá amarillo .');verify(fixed,'Manuel está sentado en su sofá amarillo .',false);
 return {newExercises:rows.length,level6:rows.filter(r=>r.level===6).length,checks,requestedExampleThroughWordBank:'OK',colorsGenderPlacesAndPossessives:'OK'};
});assert.equal(result.newExercises,1983);console.log(JSON.stringify(result));}finally{await b.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
