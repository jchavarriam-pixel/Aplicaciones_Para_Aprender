/* Extra celebrations: one SVG actor, one native control and bounded canvas particles. */
(() => {
  const colores=['#ffd05f','#f585a6','#63c6e7','#ac91e5','#7bd2ae','#ffae76'];
  const limitar=(n,a,b)=>Math.max(a,Math.min(b,n));
  const flecha='<svg viewBox="0 0 32 44"><path d="M12 3H20V24H29L16 40L3 24H12Z" fill="#ffe69b" stroke="#a97432" stroke-width="2" stroke-linejoin="round"/></svg>';
  const senales=()=>['arriba','izquierda','derecha'].map(c=>`<span class="flecha-pulsador-signos flecha-${c}" aria-hidden="true">${flecha}</span>`).join('');
  function volcanSvg(){return `<svg viewBox="0 0 480 360" aria-hidden="true"><defs><linearGradient id="montanaFiesta" x2="1" y2=".3"><stop stop-color="#bd9276"/><stop offset=".55" stop-color="#966c62"/><stop offset="1" stop-color="#74515a"/></linearGradient><linearGradient id="lavaFiesta" x2="0" y2="1"><stop stop-color="#ffe18d"/><stop offset="1" stop-color="#f58c62"/></linearGradient></defs>
   <ellipse cx="240" cy="333" rx="222" ry="18" fill="#648a6b" opacity=".2"/>
   <path d="M29 329Q91 263 136 182L173 114Q240 90 307 114L344 182Q389 263 451 329Z" fill="url(#montanaFiesta)" stroke="#79595b" stroke-width="5" stroke-linejoin="round"/>
   <path d="M173 114Q196 131 209 180L224 223L242 180L263 197L283 155L307 114Q240 92 173 114Z" fill="#e7ba9c"/>
   <path d="M111 268L148 203M343 244L369 289M191 267L173 309M301 271L315 316" stroke="#77595b" stroke-width="8" stroke-linecap="round" opacity=".45"/>
   <ellipse cx="240" cy="116" rx="68" ry="20" fill="#684e5a" stroke="#e6bb96" stroke-width="7"/>
   <g class="lava-fiesta"><ellipse cx="240" cy="118" rx="52" ry="11" fill="#ffc464"/><path d="M193 128Q211 139 208 165Q208 179 220 178Q231 175 226 153Q226 134 244 137Q257 141 253 162Q253 181 267 176L282 129Z" fill="url(#lavaFiesta)"/></g>
   <path d="M56 329Q111 315 165 329Q216 314 268 328Q341 316 420 330" fill="none" stroke="#a4c998" stroke-width="10" stroke-linecap="round"/>
   <g fill="#ffd981"><path d="M70 283l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/><path d="M402 280l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/></g></svg>`;}
  function trenSvg(){return `<svg viewBox="0 0 600 240" aria-hidden="true"><defs><linearGradient id="cuerpoTrenFiesta" x2="0" y2="1"><stop stop-color="#83c8ef"/><stop offset="1" stop-color="#4c90c1"/></linearGradient></defs>
   <g stroke="#556985" stroke-width="3" stroke-linejoin="round"><path d="M19 160H353V177H19Z" fill="#7593ae"/>
    <rect x="26" y="96" width="139" height="68" rx="15" fill="#f5ba67"/><path d="M34 108H157" stroke="#fff0c9" stroke-width="5" stroke-linecap="round"/>
    <rect x="188" y="96" width="139" height="68" rx="15" fill="#a49bdf"/><path d="M196 108H319" stroke="#eae5ff" stroke-width="5" stroke-linecap="round"/>
    <path d="M165 152H188M327 152H353" stroke="#74859d" stroke-width="9"/>
    <path d="M349 161V66Q349 58 360 58H425Q437 58 437 70V98H522Q543 98 543 119V159Z" fill="url(#cuerpoTrenFiesta)"/>
    <path d="M341 59Q338 47 352 47H430Q442 47 442 59Z" fill="#ec7189"/><rect x="363" y="70" width="51" height="37" rx="8" fill="#d5f5ff"/>
    <path d="M477 99V61H508V99" fill="#ee8191"/><path d="M469 57H516V69H469Z" fill="#efaa77"/>
    <path d="M437 123H541M449 135H478" stroke="#d2edfc" stroke-width="5" stroke-linecap="round"/>
    <path d="M532 154H554L570 178H527Z" fill="#ec7189"/><path d="M347 167H539V180H347Z" fill="#567796"/>
    <circle cx="538" cy="120" r="12" fill="#ffe49c"/></g>
   <g fill="#fff7df" font-family="system-ui,sans-serif" font-size="38" font-weight="900" text-anchor="middle"><text x="96" y="146">1</text><text x="258" y="146">2</text><text x="392" y="149">3</text></g>
   ${[62,132,224,294,380,433,498].map((x,i)=>`<g class="rueda-tren-fiesta" data-x="${x}"><circle cx="${x}" cy="183" r="${i>3?25:20}" fill="#435b78" stroke="#d4e6ed" stroke-width="4"/><circle cx="${x}" cy="183" r="${i>3?16:12}" fill="#e3eaf1"/><path d="M${x-11} 183H${x+11}M${x} 172V194" stroke="#9caec5" stroke-width="3"/></g>`).join('')}</svg>`;}
  function globoSvg(){return `<svg viewBox="0 0 240 360" aria-hidden="true"><defs><linearGradient id="sombraGloboFiesta" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".32"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#47658e" stop-opacity=".18"/></linearGradient><linearGradient id="cestaGloboFiesta" x2="1" y2="1"><stop stop-color="#efca93"/><stop offset="1" stop-color="#b47f59"/></linearGradient></defs>
   <g class="envoltura-globo-fiesta"><path d="M120 20C9 20 2 124 44 173Q74 209 95 232H145Q166 209 196 173C238 124 231 20 120 20Z" fill="#ec829d" stroke="#9d6687" stroke-width="3"/>
    <path d="M120 20C52 20 52 135 95 232H113C86 126 86 40 120 20Z" fill="#ffdc7d"/><path d="M120 20C188 20 188 135 145 232H127C154 126 154 40 120 20Z" fill="#85d6c4"/>
    <path d="M120 20C86 40 86 126 113 232H127C154 126 154 40 120 20Z" fill="#82bdec"/>
    <path d="M120 20C9 20 2 124 44 173Q74 209 95 232H145Q166 209 196 173C238 124 231 20 120 20Z" fill="url(#sombraGloboFiesta)"/>
    <path d="M44 150Q78 182 120 157Q162 182 196 150" fill="none" stroke="#fff7dc" stroke-width="6" opacity=".8"/>
    <path d="M42 73Q55 45 76 43" stroke="white" stroke-width="8" stroke-linecap="round" opacity=".5"/></g>
   <path d="M96 229L103 291M144 229L137 291M104 239H136" fill="none" stroke="#7b6d78" stroke-width="4"/>
   <g class="llama-globo-fiesta"><path d="M110 266Q97 248 120 224Q143 248 130 266Z" fill="#ffae5c"/><path d="M115 265Q107 255 120 242Q133 255 125 265Z" fill="#fff0a0"/></g>
   <path d="M108 266H132V278H108Z" fill="#7e8c9e"/><path d="M89 288H151L145 332Q120 341 95 332Z" fill="url(#cestaGloboFiesta)" stroke="#a77957" stroke-width="3"/>
   <path d="M95 300H146M96 312H145M99 324H143M105 290L109 333M120 290V335M135 290L131 333" stroke="#bf9368" stroke-width="3"/><path d="M90 287H151" stroke="#f6ddb4" stroke-width="7" stroke-linecap="round"/></svg>`;}
  function palancaSvg(){return '<svg viewBox="0 0 110 110" aria-hidden="true"><path d="M18 88H92V104H18Z" fill="#91a9bd" stroke="#5d7893" stroke-width="3"/><ellipse cx="55" cy="83" rx="31" ry="12" fill="#4b6384"/><g class="brazo-palanca-fiesta"><path d="M55 82V28" stroke="#d2e1e8" stroke-width="12" stroke-linecap="round"/><path d="M53 78V30" stroke="#8ca5b9" stroke-width="3"/><circle cx="55" cy="22" r="18" fill="#eb6c7e" stroke="#a63b57" stroke-width="3"/><path d="M46 16Q48 10 55 11" fill="none" stroke="#ffc8c9" stroke-width="4" stroke-linecap="round"/></g></svg>';}

  function crear(tipo,contenedor,{t,activar,sonar,reducido}){
   const raiz=document.createElement('div');raiz.className='escena-adicional-signos';raiz.dataset.tipo=tipo;
   const etiquetas={volcan:[t('Activar','Activate'),t('Pulsa el botón para despertar el volcán de números.','Press the button to wake up the number volcano.')],tren:[t('Arrancar','Start'),t('Baja la palanca o tócala para poner el tren en marcha.','Pull the lever down or tap it to start the train.')],globo:[t('Inflar','Inflate'),t('Toca el quemador para inflar el globo.','Tap the burner to inflate the balloon.')]};
   const icono=tipo==='tren'?palancaSvg():tipo==='globo'?'<svg viewBox="0 0 40 46" aria-hidden="true"><path d="M19 3C23 17 35 18 33 32C31 47 6 47 6 30Q6 20 15 14Q13 23 18 23Q24 22 19 3Z" fill="#fff3ac"/><path d="M19 25Q32 39 20 41Q9 40 19 25Z" fill="#ffc063"/></svg>':'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3V15M9 7A12 12 0 1 0 23 7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>';
   raiz.innerHTML=`<div class="actor-adicional-signos" aria-hidden="true">${tipo==='volcan'?volcanSvg():tipo==='tren'?trenSvg():globoSvg()}</div><div class="mando-adicional-signos">${senales()}<button type="button" class="activar-escena-signos control-${tipo}-signos" aria-label="">${icono}<span></span></button></div>`;
   contenedor.append(raiz);
   const actor=raiz.querySelector('.actor-adicional-signos'),mando=raiz.querySelector('.mando-adicional-signos'),boton=mando.querySelector('button');
   boton.querySelector('span').textContent=etiquetas[tipo][0];boton.setAttribute('aria-label',etiquetas[tipo][1]);
   let w=1,h=1,ancho=1,alto=1,x0=0,y0=0,x=0,y=0,tiempo=-1,iniciado=false,emision=0,anteriorSonido=-1,particulas=[],puntero=null,inicioY=0,activacionPendiente=0;
   const limite=(navigator.hardwareConcurrency||4)<=4?96:150;
   const activarUnaVez=()=>{if(iniciado)return;activar();};
   boton.onclick=activarUnaVez;
   const brazo=boton.querySelector('.brazo-palanca-fiesta');
   function angulo(n){brazo?.setAttribute('transform',`rotate(${n} 55 82)`);}
   if(tipo==='tren'){
    angulo(-28);
    boton.addEventListener('pointerdown',e=>{if(e.button>0||e.isPrimary===false||iniciado)return;puntero=e.pointerId;inicioY=e.clientY;boton.setPointerCapture(puntero);});
    boton.addEventListener('pointermove',e=>{if(e.pointerId!==puntero)return;e.preventDefault();const recorrido=(e.clientY-inicioY)/Math.max(1,boton.getBoundingClientRect().height);angulo(limitar(-28+recorrido*130,-28,40));});
    // Finish the pointer gesture before hiding its target and moving keyboard focus.
    boton.addEventListener('pointerup',e=>{if(e.pointerId!==puntero)return;const id=puntero;puntero=null;try{boton.releasePointerCapture(id);}catch{}activacionPendiente=requestAnimationFrame(()=>{activacionPendiente=0;activarUnaVez();});});
    boton.addEventListener('pointercancel',()=>{puntero=null;if(!iniciado)angulo(-28);});
   }
   function ajustar(nw,nh){
    w=nw;h=nh;const horizontal=w>h*1.1;
    if(tipo==='volcan'){ancho=Math.min(w*(horizontal?.68:.86),h*1.35,560);alto=ancho*.75;x0=w*(horizontal?.66:.5)-ancho/2;y0=h-alto*.98-8;}
    else if(tipo==='tren'){
     ancho=Math.min(w*(horizontal?.6:.94),h*2.1,700);
     alto=ancho*.4;
     // The nose ends at x=570 in the 600-unit drawing.
     const visible=Math.min(w*.19,ancho*.22);
     x0=visible-ancho*(570/600);
     y0=h-alto*.86-17;
    }
    else{alto=Math.min(420,h*.82,w*1.23);ancho=alto*2/3;x0=w*(horizontal?.67:.5)-ancho/2;y0=h-alto*.93-8;}
    actor.style.width=ancho+'px';actor.style.height=alto+'px';
    const d=tipo==='globo'?Math.min(76,Math.max(56,h*.15)):Math.min(106,w*.27,h*.43);
    let cx=horizontal?Math.max(d/2+22,w*.17):w*.5,cy=horizontal?Math.max(d/2+40,h*.45):Math.max(d/2+44,h*.24);
    if(tipo==='globo'){cx=x0+ancho*.5;cy=y0+alto*.73;}
    cx=limitar(cx,d/2+15,w-d/2-15);cy=limitar(cy,d/2+40,h-d/2-12);
    mando.style.width=d+'px';mando.style.height=(tipo==='tren'?d*1.2:d)+'px';mando.style.left=cx-d/2+'px';mando.style.top=cy-d/2+'px';
    colocar(tiempo);
   }
   function colocar(t){
    x=x0;y=y0;let giro=0;
    if(tipo==='volcan'){
     if(t>=0&&t<1.4&&!reducido)x+=Math.sin(t*35)*2;
     actor.querySelector('.lava-fiesta').style.opacity=t>=1.4?'1':'.3';
    }else if(tipo==='tren'){
     const p=limitar((t-.5)/5.8,0,1);
     x+=p*(.45+.55*p)*(w-x0);
     if(!reducido)for(const rueda of actor.querySelectorAll('.rueda-tren-fiesta'))rueda.setAttribute('transform',`rotate(${p*1800} ${rueda.dataset.x} 183)`);
    }else{
     const inflado=t<0?0:limitar(t/2,0,1),sy=.58+.42*inflado,sx=.78+.22*inflado;
     actor.querySelector('.envoltura-globo-fiesta').setAttribute('transform',`translate(120 232) scale(${sx} ${sy}) translate(-120 -232)`);
     actor.querySelector('.llama-globo-fiesta').style.opacity=t>=0&&t<3?'1':'.15';
     const p=limitar((t-2)/4.8,0,1);y-=p*p*(h+alto);if(!reducido&&p>0&&p<1){x+=Math.sin(t*1.5)*7;giro=Math.sin(t*1.2)*2;}
    }
    actor.style.transform=`translate3d(${x}px,${y}px,0) rotate(${giro}deg)`;
   }
   function emitir(){
    if(particulas.length>=limite)return;
    const i=Math.floor(Math.random()*12),color=colores[i%6];
    const p={x:0,y:0,vx:(Math.random()-.5)*.09,vy:.12,gravedad:0,vida:0,duracion:4,tamano:6+Math.random()*8,giro:Math.random()*6,color,forma:i%4,numero:String(Math.floor(Math.random()*10))};
    if(tipo==='volcan'){p.x=(x+ancho*.5)/w;p.y=(y+alto*.32)/h;p.vx=(Math.random()-.5)*.48;p.vy=-.45-Math.random()*.45;p.gravedad=.55;p.forma=i%3===0?'numero':i%4;p.tamano=8+Math.random()*12;p.duracion=3.5;}
    else if(tipo==='tren'){p.x=(x+ancho*.82)/w;p.y=(y+alto*.25)/h;p.vy=-.12-Math.random()*.16;p.vx=-.015-Math.random()*.04;p.forma=i%3===0?'globo':i%3===1?'numero':'estrella';p.duracion=4.5;}
    else{p.x=(x+ancho*.5)/w;p.y=(y+alto*.92)/h;p.vy=.10+Math.random()*.14;p.forma='estrella';p.duracion=4;}
    particulas.push(p);
   }
   function actualizar(dt,t){
    tiempo=t;
    if(!iniciado){iniciado=true;mando.hidden=true;boton.disabled=true;sonar(tipo);}
    colocar(t);
    const emite=tipo==='volcan'?t>=1.4&&t<6:tipo==='tren'?t>.5&&t<5.8:t>=2&&t<6.8;
    if(emite){emision+=dt*(reducido?12:tipo==='volcan'?48:35);while(emision>=1){emitir();emision--;}}
    if(tipo==='volcan'&&t>=1.4&&anteriorSonido<0){anteriorSonido=0;sonar('erupcion');}
    if(tipo==='tren'&&t>.5&&t<6.3){
     const pulso=Math.floor((t-.5)*(.9+.42*t));
     if(pulso>anteriorSonido){anteriorSonido=pulso;sonar('ruedas');}
    }
    if(tipo==='globo'&&t>=2&&anteriorSonido<0){anteriorSonido=0;sonar('ascenso');}
    for(const p of particulas){p.vida+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravedad*dt;if(!reducido)p.giro+=dt;}
    particulas=particulas.filter(p=>p.vida<p.duracion&&p.y<1.2&&p.x>-.2&&p.x<1.2);
   }
   function estrella(ctx,r){ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,k=i%2?r*.44:r;ctx.lineTo(Math.cos(a)*k,Math.sin(a)*k);}ctx.closePath();ctx.fill();}
   function pintar(ctx){
    ctx.save();
    // Light scenery stays on the existing canvas; no separate moving DOM clouds.
    if(tipo!=='volcan')for(const[nx,ny,s]of[[.15,.15,1],[.75,.25,.8],[.43,.09,.65]]){ctx.fillStyle='#ffffffb3';ctx.beginPath();ctx.ellipse(nx*w,ny*h,50*s,13*s,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=tipo==='volcan'?'#a8cf9b':'#b5d9a6';ctx.fillRect(0,h-13,w,13);
    if(tipo==='tren'){
     ctx.lineWidth=3;ctx.strokeStyle='#71899d';for(const y of[h-20,h-10]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
     ctx.strokeStyle='#ac8d71';for(let x=0;x<w;x+=28){ctx.beginPath();ctx.moveTo(x,h-24);ctx.lineTo(x+5,h-6);ctx.stroke();}
    }
    for(const p of particulas){
     ctx.save();ctx.translate(p.x*w,p.y*h);if(p.forma!=='numero'&&p.forma!=='globo')ctx.rotate(p.giro);ctx.globalAlpha=Math.min(1,(p.duracion-p.vida)*2);ctx.fillStyle=p.color;
     if(p.forma==='numero'){ctx.font=`850 ${p.tamano*1.8}px system-ui`;ctx.textAlign='center';ctx.fillText(p.numero,0,0);}
     else if(p.forma==='globo'){ctx.beginPath();ctx.ellipse(0,0,p.tamano*.7,p.tamano,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#809cac';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,p.tamano);ctx.quadraticCurveTo(-5,p.tamano+10,0,p.tamano+17);ctx.stroke();}
     else if(p.forma==='estrella'||p.forma===0)estrella(ctx,p.tamano);
     else if(p.forma===1){ctx.beginPath();ctx.arc(0,0,p.tamano*.65,0,Math.PI*2);ctx.fill();}
     else if(p.forma===2){ctx.beginPath();ctx.moveTo(0,-p.tamano);ctx.lineTo(p.tamano,p.tamano*.7);ctx.lineTo(-p.tamano,p.tamano*.7);ctx.fill();}
     else ctx.fillRect(-p.tamano/2,-p.tamano/2,p.tamano,p.tamano);
     ctx.restore();
    }
    ctx.restore();
   }
   return {boton,instruccion:etiquetas[tipo][1],final:tipo==='volcan'?7.3:tipo==='tren'?7.8:8.3,ajustar,actualizar,pintar,destruir(){cancelAnimationFrame(activacionPendiente);raiz.remove();particulas=[];puntero=null;}};
  }
  window.EscenasFiestaSignos={crear};
})();
