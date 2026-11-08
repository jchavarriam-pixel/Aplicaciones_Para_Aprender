'use strict';
(()=>{
 let layer=null,raf=0,audio=null;
 function detener(){cancelAnimationFrame(raf);raf=0;layer?.remove();layer=null;}
 function sonido(){try{audio||=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});for(const [i,f]of [523.25,659.25,783.99,1046.5].entries()){const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.12;o.type='sine';o.frequency.value=f;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.start(t);o.stop(t+.32);o.onended=()=>{o.disconnect();g.disconnect();};}}catch{}}
 function iniciar(){
  detener();sonido();if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const w=innerWidth,h=innerHeight,scale=document.body.getBoundingClientRect().width/document.body.offsetWidth||1,dpr=Math.min(devicePixelRatio||1,1.5);
  layer=document.createElement('div');layer.className='fiesta-mayor';layer.setAttribute('aria-hidden','true');layer.style.cssText=`position:fixed;left:0;top:0;width:${w}px;height:${h}px;zoom:${1/scale};pointer-events:none;z-index:90`;
  const canvas=document.createElement('canvas');canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.cssText='width:100%;height:100%;display:block';layer.append(canvas);document.body.append(layer);
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  const colors=['#fbbf24','#f472b6','#38bdf8','#a78bfa','#34d399','#fb7185'],bursts=[{x:w*.17,y:h*.34,t:0},{x:w*.83,y:h*.29,t:420},{x:w*.5,y:h*.16,t:850}];
  const count=w<700?30:40,particles=bursts.flatMap((b,k)=>Array.from({length:count},(_,i)=>{const a=Math.PI*2*i/count,speed=90+Math.random()*190;return {x:b.x,y:b.y,t:b.t,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,color:colors[(i+k)%colors.length],text:i%3===0?'★':String(i%10),size:13+Math.random()*13};}));
  let start=0,last=-100;
  function frame(now){if(!layer)return;start||=now;const elapsed=now-start;if(elapsed>=2600){detener();return;}raf=requestAnimationFrame(frame);if(now-last<30)return;last=now;ctx.clearRect(0,0,w,h);
   for(const b of bursts){const dt=(elapsed-b.t)/1000;if(dt<0||dt>1.1)continue;ctx.globalAlpha=(1-dt/1.1)*.7;ctx.strokeStyle='#fbbf24';ctx.lineWidth=3*(1-dt/1.1);ctx.beginPath();ctx.arc(b.x,b.y,12+dt*130,0,Math.PI*2);ctx.stroke();}
   for(const p of particles){const dt=(elapsed-p.t)/1000;if(dt<0||dt>1.65)continue;ctx.globalAlpha=Math.max(0,1-dt/1.65);ctx.fillStyle=p.color;ctx.font='900 '+p.size+'px Verdana';ctx.fillText(p.text,p.x+p.vx*dt,p.y+p.vy*dt+100*dt*dt);}ctx.globalAlpha=1;
  }
  raf=requestAnimationFrame(frame);
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)detener();});window.addEventListener('resize',detener);window.addEventListener('pagehide',()=>{detener();audio?.close().catch(()=>{});audio=null;});
 window.CelebracionMayor={iniciar,detener};
})();
