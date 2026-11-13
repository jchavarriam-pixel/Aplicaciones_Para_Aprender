Object.assign(window.TEXTOS_INGLES,{
 'Aprende a Restar':'Learn to subtract','🌈 Aprende a Restar 🌈':'🌈 Learn to subtract 🌈','Quitar:':'Take away:','Quitados:':'Taken away:',
 'Objetos a restar':'Objects to subtract','Quitar aquí ⬇️':'Take away here ⬇️','Nuevo':'New exercise','Repetir':'Repeat','Silenciar':'Mute','Activar':'Unmute','Mixto':'Mixed','Sí se puede':'Enough objects','No se puede':'Not enough objects',
 'Arrastra los objetos a la cesta para quitar la cantidad indicada.':'Drag objects into the basket to take away the given number.',
 '¡Sí se pudo!':'We did it!','¡NO! ¡NO! ¡NO! 🚫':'Not enough objects! 🚫','¡No hay suficientes!':'There are not enough!'
});
window.traducirActividad=s=>{
 let m;if((m=s.match(/^Hola, (.+)$/)))return 'Hello, '+m[1];
 if((m=s.match(/^Objeto (\d+)$/)))return 'Object '+m[1];
 if((m=s.match(/^Quedan: (.*)$/)))return 'Remaining: '+m[1];
 if((m=s.match(/^Debes quitar (\d+) más\.$/)))return 'Take away '+m[1]+' more.';
 if((m=s.match(/^(.*)a (\d+) no se le puede quitar (\d+)\.$/)))return m[1]+'you cannot take '+m[3]+' away from '+m[2]+'.';
 if(s.includes('menos')||s.includes('no se le puede quitar')){const words=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];let out=s.replace(/¡Muy bien(?:, ([^!]+))?!/g,(_,n)=>n?'Well done, '+n+'!':'Well done!').replace('no, no, no. A ','There are not enough. From ').replace(' no se le puede quitar ',' you cannot take away ').replace('No hay suficientes.','There are not enough.').replace(' menos ',' minus ').replace(' es igual a ',' equals ');words.forEach((w,i)=>out=out.replace(new RegExp('\\b'+w+'\\b','g'),IdiomaVoz.ingles(i)));return out;}
 if((m=s.match(/^¡Muy bien(?:, (.+))?! ¡Sí se pudo! 🎉$/)))return 'Well done'+(m[1]?', '+m[1]:'')+'! We did it! 🎉';
};
