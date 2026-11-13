Object.assign(window.TEXTOS_INGLES,{
 'Mayor, Menor o Igual':'Greater than, less than or equal to',
 'Arrastra el signo correcto con el dedo o tócalo y luego toca una casilla.':'Drag the correct sign, or tap it and then tap a box.',
 'Practica los signos':'Practise the signs','mayor que':'greater than','menor que':'less than','igual':'equal to','e':'and',
 'Observa los dos números y coloca el signo correcto en el centro.':'Look at both numbers and place the correct sign in the middle.',
 'Menor que <':'Less than <','Mayor que >':'Greater than >','Igual =':'Equal to =',
 '¿Cuál es tu nombre?':'What is your name?','Ej: Gabriel':'For example: Gabriel',
 '¿Cuántos dígitos quieres practicar?':'How many digits would you like to practise?',
 'Consejo: también se puede arrastrar un signo colocado para cambiarlo de casilla o sacarlo.':'Tip: you can also drag a placed sign to another box or remove it.',
 'Sin ayuda':'No hints','Ayuda 1':'Read correct answers','Ayuda 2':'Check as you play','signos':'signs',
 'Mayor que >   Menor que <   Igual =':'Greater than >   Less than <   Equal to =',
 'Mayor que >    Menor que <    Igual =':'Greater than >    Less than <    Equal to =',
 'Cambiar nivel':'Change level',
 'Revisa esta ronda. Los signos marcados con ✗ deben corregirse.':'Check this round. Correct the signs marked with ✗.'
});
window.traducirActividad=s=>{
 let m;
 if((m=s.match(/^(\d+) dígitos?$/)))return m[1]+' '+(m[1]==='1'?'digit':'digits');
 if((m=s.match(/^Nivel: hasta (\d+) dígitos?$/)))return 'Level: up to '+m[1]+' '+(m[1]==='1'?'digit':'digits');
 if((m=s.match(/^casilla (\d+)$/)))return 'box '+m[1];
 if(/\d+ (?:no )?es (?:mayor que|menor que|igual a) \d+/.test(s))return s.replaceAll('Correcto.','Correct.').replaceAll('Revisa bien.','Check carefully.').replaceAll('Revisa esta pregunta.','Check this question.').replaceAll('Lo correcto es:','The correct answer is:').replaceAll(' no es ',' is not ').replaceAll(' es ',' is ').replaceAll('menor que','less than').replaceAll('mayor que','greater than').replaceAll('igual a','equal to');
 const templates=[
 ['Excelente {name}, qué buen trabajo has hecho.','Excellent {name}, you did a great job.'],
 ['Excelente {name}, eres muy bueno ordenando números. Sigue así.','Excellent {name}, you are great at ordering numbers. Keep going.'],
 ['{name}, estamos orgullosos de ti. Qué buen trabajo has realizado.','{name}, we are proud of you. You did a great job.'],
 ['{name}, qué gran trabajo has realizado con esos números. Eres genial.','{name}, great work with those numbers. You are amazing.'],
 ['Excelente {name}, tu dedicación al trabajo ha sido admirable. Continúa así de bien.','Excellent {name}, you worked so carefully. Keep it up.'],
 ['Muy bien {name}, resolviste la ronda con mucho cuidado.','Well done {name}, you completed the round carefully.'],
 ['Fantástico {name}, cada vez comparas mejor los números.','Fantastic {name}, you are getting better at comparing numbers.'],
 ['Bravo {name}, tu esfuerzo se nota muchísimo.','Bravo {name}, your hard work really shows.'],
 ['Excelente {name}, lo hiciste con mucha concentración.','Excellent {name}, you stayed focused.'],
 ['Qué lindo has trabajado {name}. Sigue así.','Lovely work {name}. Keep it up.'],
 ['{name}, hiciste un trabajo maravilloso.','{name}, you did a wonderful job.'],
 ['Muy bien {name}, estás aprendiendo con mucha alegría.','Well done {name}, you are having fun learning.'],
 ['Excelente {name}, completaste la ronda como un campeón.','Excellent {name}, you completed the round like a champion.'],
 ['{name}, lo has hecho genial. Buen trabajo.','{name}, you did wonderfully. Good job.'],
 ['Estamos muy felices por tu esfuerzo, {name}.','We are so happy with your effort, {name}.']
 ];
 for(const[a,b]of templates){const [pre,post]=a.split('{name}');if(s.startsWith(pre)&&s.endsWith(post))return b.replace('{name}',s.slice(pre.length,s.length-post.length));}
};
