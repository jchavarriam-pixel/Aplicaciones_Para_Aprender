/* Scalable illustrations shared by the activity and the mode cards. */
(() => {
 'use strict';
 const paleta=['#ed6177','#438ee0','#28ad91','#a178dd','#ed9f32','#32a4b8'];
 const punto=(r,a)=>({x:150+r*Math.sin(a*Math.PI/180),y:150-r*Math.cos(a*Math.PI/180)});
 function reloj(n,{id='mini',nombres=false,relieve=true,hora='Hora',minutos='Minutos'}={}){
  const h=n*.5,m=n*6;
  const rotulo=(texto,a,y)=>nombres?`<text class="rotulo-mini" x="150" y="${y}" transform="rotate(${((a-90)%360+360)%360>90&&((a-90)%360+360)%360<270?90:-90} 150 ${y})" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="800" fill="white">${texto}</text>`:'';
  let marcas='',cifras='';
  for(let i=0;i<60;i++){
   const p=punto(128,i*6),q=punto(i%5?124:119,i*6),v=punto(139,i*6),principal=i%5===0;
   marcas+=`<path d="M${p.x} ${p.y}L${q.x} ${q.y}" stroke="${principal?'#597fa5':'#b0c6d8'}" stroke-width="${principal?2:1}" stroke-linecap="round"/>`;
   marcas+=`<text class="minuto-mini" x="${v.x}" y="${v.y}" text-anchor="middle" dominant-baseline="central" fill="${principal?'#345b85':'#7892ad'}" font-size="${principal?10:7}" font-weight="${principal?800:600}">${i?i:'00'}</text>`;
  }
  for(let i=1;i<=12;i++){
   const p=punto(98,i*30);
   cifras+=`<circle cx="${p.x}" cy="${p.y}" r="16.5" fill="${i%3===0?'#e1edff':'#f0f5fc'}"/><text class="cifra-hora-mini" x="${p.x}" y="${p.y+.5}" text-anchor="middle" dominant-baseline="central" fill="#293f69" font-size="24" font-weight="850">${i}</text>`;
  }
  const rojo=relieve?`url(#${id}Hora)`:'#e6384f',azul=relieve?`url(#${id}Min)`:'#2864c1';
  return `<svg class="esfera-pareo" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" font-family="Trebuchet MS,system-ui,sans-serif"><defs><linearGradient id="${id}Marco" x2=".85" y2="1"><stop stop-color="#a7d2ff"/><stop offset=".5" stop-color="#6699db"/><stop offset="1" stop-color="#8e7ed2"/></linearGradient><linearGradient id="${id}Hora" gradientUnits="userSpaceOnUse" x1="142" x2="158"><stop stop-color="#b52643"/><stop offset=".35" stop-color="#ff7184"/><stop offset=".7" stop-color="#e53850"/><stop offset="1" stop-color="#b52c45"/></linearGradient><linearGradient id="${id}Min" gradientUnits="userSpaceOnUse" x1="143" x2="157"><stop stop-color="#235391"/><stop offset=".35" stop-color="#73bcff"/><stop offset=".7" stop-color="#3676c9"/><stop offset="1" stop-color="#234c8c"/></linearGradient></defs><circle cx="150" cy="153" r="147" fill="#304d7b" opacity=".12"/><circle cx="150" cy="150" r="146" fill="url(#${id}Marco)"/><circle cx="150" cy="150" r="142" fill="#fff" stroke="#fff" stroke-width="2"/><circle cx="150" cy="150" r="116" fill="#fffef9" stroke="#d9e5f2" stroke-width="1.5"/>${marcas}${cifras}<g class="horaria-mini" transform="rotate(${h} 150 150)"><path d="M150 150V87" stroke="${rojo}" stroke-width="${nombres?15:10}" stroke-linecap="round"/><path d="M150 72L141 91H159Z" fill="${rojo}"/>${rotulo(hora,h,126)}</g><g class="minutera-mini" transform="rotate(${m} 150 150)"><path d="M150 150V53" stroke="${azul}" stroke-width="${nombres?13:6}" stroke-linecap="round"/><path d="M150 36L142 56H158Z" fill="${azul}"/>${rotulo(minutos,m,96)}</g><circle cx="150" cy="150" r="9" fill="#fff" stroke="#3f5983" stroke-width="3"/></svg>`;
 }
 function carro(i=0){
  const color=paleta[i%paleta.length];
  return `<ellipse cx="59" cy="61" rx="53" ry="6" fill="#263957" opacity=".14"/><path d="M10 42L14 30Q17 25 30 25L43 12Q47 8 56 8H72Q80 8 85 18L91 29L106 33Q114 35 114 43V52Q114 56 106 56H13Q7 56 7 49V44Z" fill="${color}" stroke="#334967" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 27L46 14H57V27Z" fill="#cbf2ff" stroke="#334967" stroke-width="2"/><path d="M62 14H71Q77 14 80 20L84 27H62Z" fill="#afe3f7" stroke="#334967" stroke-width="2"/><path d="M16 34H29M91 34L106 38M40 36H77" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity=".65"/><path d="M39 44H85V55H39Z" fill="#fff" opacity=".2"/><rect x="106" y="39" width="9" height="7" rx="2" fill="#ffe397"/><rect x="7" y="38" width="6" height="8" rx="2" fill="#e5354d"/><path d="M8 52H18M100 52H114" stroke="#dce5f0" stroke-width="4" stroke-linecap="round"/><circle cx="61" cy="42" r="8" fill="#fff" opacity=".95"/><path d="M61 35L63 39L67 40L64 43L65 47L61 45L57 47L58 43L55 40L59 39Z" fill="${color}"/>${[28,92].map(x=>`<g class="rueda-coche" data-eje="${x} 54"><circle cx="${x}" cy="54" r="12" fill="#293b55" stroke="#fff" stroke-width="2.5"/><circle cx="${x}" cy="54" r="7" fill="#bfcedd"/><path d="M${x-5} 54H${x+5}M${x} 49V59" stroke="#607790" stroke-width="2"/><circle cx="${x}" cy="54" r="2" fill="#f9fcff"/></g>`).join('')}`;
 }
 function meta(){return `<svg viewBox="0 0 76 70" xmlns="http://www.w3.org/2000/svg"><ellipse cx="38" cy="65" rx="34" ry="4" fill="#243e60" opacity=".13"/><path d="M9 63V12M67 63V12" stroke="#45617f" stroke-width="4" stroke-linecap="round"/><path d="M7 12Q38 2 69 12V35Q38 25 7 35Z" fill="#fff" stroke="#45617f" stroke-width="2"/>${Array.from({length:12},(_,i)=>{const x=8+i%6*10,y=12+Math.floor(i/6)*10;return(i%6+Math.floor(i/6))%2===0?`<rect x="${x}" y="${y}" width="10" height="10" fill="#344961"/>`:'';}).join('')}<path d="M16 55H60" stroke="#39ab89" stroke-width="5" stroke-linecap="round"/><path d="M32 49L38 55L32 61" fill="none" stroke="#39ab89" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
 window.DibujosReloj={reloj,carro,meta,paleta};
})();
