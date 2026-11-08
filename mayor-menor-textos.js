/* Traducción explícita del juego; no cambia los valores ni las respuestas. */
(()=>{
 const pares=`Caja mayor y caja menor|Greater and smaller boxes
Arrastra los números para que la comparación quede correcta.|Drag the numbers to make the comparison correct.
¿Cuál es tu nombre?|What is your name?
Escribe tu nombre aquí|Enter your name here
¿Cuántos ejercicios quieres por página?|How many exercises per page?
¿Cuántos dígitos quieres usar?|How many digits would you like?
Todos los números serán de 1 dígito.|All numbers will have 1 digit.
Empezar a jugar|Start playing
Ejercicios de comparación|Number comparisons
Menú|Menu
Arrastra cada número a su caja.|Drag each number to its box.
Arrastra los números a las cajas.|Drag the numbers to the boxes.
Coloca cada número en la caja correcta.|Place each number in the correct box.
Completa las comparaciones.|Complete the comparisons.
Nueva página|New page
Reiniciar|Reset
Mostrar ayuda en las cajas|Show help inside the boxes
Leer comparaciones y respuestas|Read comparisons and feedback
Mayor|Greater
Menor|Smaller
Escuchar comparación|Listen to the comparison
Arrastra un número 👇|Drag a number 👇
Ese número solo puede colocarse en su propio ejercicio.|That number can only be placed in its own exercise.
Todavía falta acomodar este ejercicio. Coloca los dos números antes de escuchar la comparación.|This exercise is not ready yet. Place both numbers before listening to the comparison.
Primero acomoda los dos números en las cajas para escuchar la comparación.|First place both numbers in the boxes to hear the comparison.
Sí está correcta.|Yes, it is correct.
Está correcta.|It is correct.
¡Muy bien!|Well done!
¡Muy bien! Ya completaste la página.|Well done! You have completed the page.
Pulsa Revisar ✅|Press Check ✅
¡Ya están todas llenas! Pulsa Revisar ✅|All boxes are filled! Press Check ✅
Usa la ayuda de cada caja para acomodar los números.|Use the help inside each box to place the numbers.
Revisa las cajas en rojo. Puedes mover los números y corregir. También puedes tocar 🔊 para escuchar la comparación.|Check the red boxes. You can move the numbers to correct them. You can also tap 🔊 to hear the comparison.
Revisa las cajas rojas y vuelve a intentarlo.|Check the red boxes and try again.
¡Excelente trabajo!|Excellent work!
Siguiente página|Next page
Seguir intentando|Keep trying
¡Por favor, escribe tu nombre!|Please enter your name!
Creada para Gabriel por su familia con ayuda de la IA|Created for Gabriel by his family with help from AI
Creado para Gabriel con ayuda de la IA y su familia|Created for Gabriel with help from AI and his family
¡Lo hiciste increíble!|You did an amazing job!
¡Qué buen trabajo!|Great work!
¡Excelente esfuerzo!|Excellent effort!
¡Muy bien pensado!|Well thought out!
¡Eres un campeón!|You are a champion!
¡Fantástico!|Fantastic!
¡Maravilloso trabajo!|Wonderful work!
¡Cada vez lo haces mejor!|You are getting better every time!
¡Súper bien!|Super job!
¡Eso estuvo genial!|That was great!
¡Qué gran logro!|What a great achievement!
¡Buenísimo!|Excellent!
¡Sigue así!|Keep it up!
¡Qué inteligente trabajo!|Smart work!
¡Perfecto!|Perfect!
¡Bravo!|Bravo!
¡Muy muy bien!|Very well done!
¡Tremendo trabajo!|Amazing work!
¡Lo resolviste excelente!|You solved it brilliantly!
¡Impresionante!|Impressive!
¡Qué bien ordenaste los números!|You arranged the numbers so well!
¡Eso quedó correcto!|That is correct!
¡Lo lograste!|You did it!
¡Eres genial!|You are amazing!
¡Qué bonito trabajo!|Lovely work!
¡Una página excelente!|An excellent page!
¡Lo estás haciendo súper!|You are doing great!
¡Qué bien pensaste!|You thought it through so well!
¡Muy ordenado todo!|Everything is in the right order!
¡Cada intento cuenta y este salió perfecto!|Every attempt counts, and this one was perfect!`;
 const dic=Object.fromEntries(pares.split('\n').map(s=>s.split('|')));Object.assign(window.TEXTOS_INGLES,dic);
 window.traducirActividad=s=>{
  if(/^[✅❌]\s/.test(s))return s.slice(0,2)+window.IdiomaVoz.t(s.slice(2));
  let m;if((m=s.match(/^(\d+) dígitos?$/)))return `${m[1]} ${m[1]==='1'?'digit':'digits'}`;
  if((m=s.match(/^Ejercicio (\d+)$/)))return 'Exercise '+m[1];
  if((m=s.match(/^(\d+) ejercicios? por página • (\d+) dígitos?$/)))return `${m[1]} ${m[1]==='1'?'exercise':'exercises'} per page • ${m[2]} ${m[2]==='1'?'digit':'digits'}`;
  if((m=s.match(/^Al menos el 75% serán de (\d+) dígitos/)))return `At least 75% will have ${m[1]} digits; the rest will have between 1 and ${m[1]} digits.`;
  if((m=s.match(/^(\d+) es (mayor|menor) que (\d+)\.$/)))return `${m[1]} is ${m[2]==='mayor'?'greater':'less'} than ${m[3]}.`;
  if((m=s.match(/^No es correcto\. (\d+) NO ES (Mayor|Menor) que (\d+)\. Este acomodo es incorrecto, intenta de nuevo\.$/)))return `That is not correct. ${m[1]} is NOT ${m[2]==='Mayor'?'greater':'less'} than ${m[3]}. Try arranging the numbers again.`;
  if((m=s.match(/^(.+?), (¡.+!)$/))&&dic[m[2]])return m[1]+', '+dic[m[2]];
 };
})();
