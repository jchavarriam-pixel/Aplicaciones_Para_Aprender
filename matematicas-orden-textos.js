Object.assign(window.TEXTOS_INGLES,{
 'Ordenar números':'Order numbers','Arrastra cada ficha con el dedo y colócala en el orden correcto.':'Drag each card into the correct order.',
 '¿Cuál es tu nombre?':'What is your name?','Escribe tu nombre':'Enter your name','Tipo de orden':'Order type','Ascendente':'Ascending','Descendente':'Descending','Mixto':'Mixed','Cantidad de cifras':'Number of digits','Cantidad de números':'Number of numbers','Comenzar':'Start','Ordena':'Put in order','Ordena de menor a mayor':'Order from smallest to largest','Ordena de mayor a menor':'Order from largest to smallest','Fichas disponibles':'Available cards','Pista 1':'Hint 1','Pista 2':'Hint 2','Ver < >':'Show < >','Ocultar < >':'Hide < >','Cambiar modo':'Change mode','Número más pequeño':'Smallest number','Número más grande':'Largest number','¡Muy bien!':'Well done!',
 'Creado para Gabriel por parte de su familia con ayuda de la IA':'Created for Gabriel by his family with help from AI'
});
window.traducirActividad=s=>{
 let m;if((m=s.match(/^(\d+) cifras?$/)))return m[1]+' '+(m[1]==='1'?'digit':'digits');
 if((m=s.match(/^Revisa bien (.+)\. Intenta de nuevo\.$/)))return 'Check carefully, '+m[1]+'. Try again.';
 if((m=s.match(/^(.+) Puedes revisar (\d+) veces? más\.$/)))return IdiomaVoz.t(m[1])+' You can check '+m[2]+' more '+(m[2]==='1'?'time.':'times.');
 const pairs=[
 ['Excelente (.+), qué buen trabajo has hecho.','Excellent $1, you did a great job.'],
 ['Excelente (.+), eres muy bueno ordenando números. Sigue así.','Excellent $1, you are great at ordering numbers. Keep going.'],
 ['(.+), estamos orgullosos de ti, qué buen trabajo has realizado.','$1, we are proud of you. You did a great job.'],
 ['(.+), qué gran trabajo has realizado con esos números. Eres genial.','$1, great work with those numbers. You are amazing.'],
 ['Excelente (.+), tu dedicación al trabajo ha sido admirable. Continúa trabajando así de bien.','Excellent $1, you worked so carefully. Keep it up.'],
 ['Muy bien (.+), cada vez ordenas los números con más seguridad.','Well done $1, you are getting better at ordering numbers.'],
 ['(.+), lo hiciste con mucha concentración. Ese esfuerzo vale muchísimo.','$1, you stayed focused. Your effort matters.'],
 ['Excelente (.+), pensaste muy bien y lograste ordenar todos los números.','Excellent $1, you thought carefully and ordered every number.'],
 ['(.+), tu trabajo fue fantástico. Sigue practicando así de bien.','$1, your work was fantastic. Keep practising.'],
 ['Bravo (.+), resolviste el ejercicio con mucha dedicación y alegría.','Bravo $1, you solved the exercise with care and joy.'],
 ['Bravo (.+), resolviste el ejercicio con mucha dedicación.','Bravo $1, you solved the exercise with care.']
 ];for(const[a,b]of pairs){const r=new RegExp('^'+a.replaceAll('.','\\.').replace('(\\.+)','(.+)')+'$');if(r.test(s))return s.replace(r,b);}
};
