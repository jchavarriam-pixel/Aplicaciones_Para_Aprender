/* Cohetes y fuegos de dos etapas. Un canvas transparente y recursos de audio reutilizados. */
(() => {
  'use strict';
  const colores=['#ef6862','#f7bb45','#43bca2','#569ced','#a078df','#ef8ec0'];
  class EfectosTablas {
    constructor(root){this.root=root;this.run=null;this.audio=null;this.buffers=new Map();this.sonidos=new Set();}
    detener(){
      if(this.run)cancelAnimationFrame(this.run.frame);this.run=null;
      for(const source of this.sonidos)try{source.stop();}catch{}this.sonidos.clear();
      this.root.replaceChildren();delete this.root.dataset.efecto;delete this.root.dataset.fase;
      if(this.audio?.state==='running')this.audio.suspend().catch(()=>{});
    }
    prepararAudio(){
      try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
        this.audio??=new Audio({latencyHint:'interactive'});
        if(this.audio.state==='suspended')this.audio.resume().catch(()=>{});
      }catch{}
    }
    sonido(tipo,volumen=1){
      if(!this.audio||this.audio.state!=='running')return;
      try{
        let buffer=this.buffers.get(tipo);
        if(!buffer){const duration=tipo==='silbido'?1.15:.27,rate=this.audio.sampleRate;
          buffer=this.audio.createBuffer(1,Math.ceil(rate*duration),rate);const out=buffer.getChannelData(0);let phase=0,noise=0;
          for(let i=0;i<out.length;i++){const t=i/rate,p=t/duration;
            if(tipo==='silbido'){phase+=2*Math.PI*(650+850*Math.sin(p*Math.PI*.8))/rate;out[i]=Math.sin(phase)*.025*Math.sin(Math.PI*p)**2;}
            else{noise=noise*.72+(Math.random()*2-1)*.28;phase+=2*Math.PI*(110-75*p)/rate;out[i]=(noise*.32+Math.sin(phase)*.1)*Math.min(1,t/.004)*Math.exp(-t*20);}
          }this.buffers.set(tipo,buffer);
        }
        const source=this.audio.createBufferSource(),gain=this.audio.createGain();gain.gain.value=volumen;source.buffer=buffer;source.connect(gain);gain.connect(this.audio.destination);this.sonidos.add(source);
        source.onended=()=>{this.sonidos.delete(source);source.disconnect();gain.disconnect();};source.start();
      }catch{}
    }
    superficie(tipo,sonido,fin){
      this.detener();if(matchMedia('(prefers-reduced-motion: reduce)').matches){fin?.();return null;}
      const w=innerWidth,h=innerHeight,canvas=document.createElement('canvas');
      const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1800000/(w*h)));canvas.width=Math.ceil(w*ratio);canvas.height=Math.ceil(h*ratio);
      const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){fin?.();return null;}ctx.setTransform(ratio,0,0,ratio,0,0);this.root.append(canvas);
      this.root.dataset.efecto=tipo;this.root.dataset.explosiones='0';this.root.dataset.proyectiles='0';
      const run={canvas,ctx,w,h,ratio,fin,frame:0,particulas:[],anillos:[],inicio:performance.now(),sonido,explosiones:0,ultimo:0};this.run=run;
      if(sonido)this.prepararAudio();return run;
    }
    terminar(run){if(this.run!==run)return;const fin=run.fin;this.detener();fin?.();}
    limpiar(run){const c=run.ctx;c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,run.canvas.width,run.canvas.height);c.restore();c.globalAlpha=1;c.globalCompositeOperation='source-over';}
    explosion(run,x,y,ms,cantidad=24,numeros=false){
      run.explosiones++;this.root.dataset.explosiones=String(run.explosiones);
      if(run.sonido)this.sonido('explosion',cantidad>30?.8:.5);
      run.anillos.push({x,y,ms});
      const max=(navigator.hardwareConcurrency||8)<=4?180:280;
      if(run.particulas.length+cantidad>max)run.particulas.splice(0,run.particulas.length+cantidad-max);
      for(let i=0;i<cantidad;i++){const angle=2*Math.PI*i/cantidad+Math.random()*.2,speed=70+Math.random()*160;
        run.particulas.push({x,y,ms,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,size:3+Math.random()*4,color:colores[i%colores.length],tipo:numeros?3:i%3,n:i%10,angle:Math.random()*6});
      }
    }
    pintarParticulas(run,ms){
      const ctx=run.ctx;
      for(let i=run.anillos.length-1;i>=0;i--){const r=run.anillos[i],age=(ms-r.ms)/1000;if(age>.5){run.anillos.splice(i,1);continue;}ctx.globalAlpha=(1-age/.5)*.8;ctx.strokeStyle='#ffc85e';ctx.lineWidth=4;ctx.beginPath();ctx.arc(r.x,r.y,4+age*100,0,Math.PI*2);ctx.stroke();}
      for(let i=run.particulas.length-1;i>=0;i--){const p=run.particulas[i],age=(ms-p.ms)/1000;if(age>1.3){run.particulas.splice(i,1);continue;}ctx.save();ctx.globalAlpha=Math.min(1,(1.3-age)/.5);ctx.translate(p.x+p.vx*age,p.y+p.vy*age+75*age*age);ctx.rotate(p.angle+age*3);ctx.fillStyle=p.color;
        if(p.tipo===0){ctx.beginPath();ctx.arc(0,0,p.size,0,Math.PI*2);ctx.fill();}
        else if(p.tipo===1)ctx.fillRect(-p.size,-p.size,p.size*2,p.size*2);
        else if(p.tipo===2){ctx.beginPath();ctx.moveTo(0,-p.size*1.4);ctx.lineTo(p.size,p.size);ctx.lineTo(-p.size,p.size);ctx.closePath();ctx.fill();}
        else{ctx.font='800 '+Math.round(p.size*3)+'px system-ui';ctx.textAlign='center';ctx.fillText(p.n,0,0);}ctx.restore();
      }ctx.globalAlpha=1;
    }
    coheteSprite(){
      if(this.sprite)return this.sprite;const canvas=document.createElement('canvas');canvas.width=canvas.height=96;
      const c=canvas.getContext('2d');c.scale(1.5,1.5);c.font='44px "Segoe UI Emoji","Apple Color Emoji",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🚀',32,32);return this.sprite=canvas;
    }
    cohetes(trayectorias,sonido,fin){
      if(!trayectorias.length){fin?.();return;}const run=this.superficie('cohetes',sonido,fin);if(!run)return;
      const sprite=this.coheteSprite(),flights=trayectorias.map((p,i)=>({...p,delay:i*130,lanzado:false,llego:false}));
      this.root.dataset.fase='vuelo';this.root.dataset.proyectiles=String(flights.length);
      const frame=ms=>{if(this.run!==run)return;const elapsed=ms-run.inicio;this.limpiar(run);
        for(const f of flights){if(elapsed<f.delay||f.llego)continue;
          if(!f.lanzado){f.lanzado=true;if(sonido)this.sonido('silbido',.7);}
          const t=Math.min(1,(elapsed-f.delay)/1150),u=1-t,mid=(f.a.x+f.b.x)/2;
          const x=u*u*u*f.a.x+3*u*u*t*mid+3*u*t*t*mid+t*t*t*f.b.x,y=(u*u*u+3*u*u*t)*f.a.y+(3*u*t*t+t*t*t)*f.b.y;
          if(t===1){f.llego=true;this.explosion(run,x,y,ms,26,true);continue;}
          const dx=3*u*u*(mid-f.a.x)+3*t*t*(f.b.x-mid),dy=6*u*t*(f.b.y-f.a.y);
          const c=run.ctx;c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx)+Math.PI/4);c.drawImage(sprite,-29,-29,58,58);c.restore();
        }
        this.pintarParticulas(run,ms);
        if(flights.every(f=>f.llego)&&!run.particulas.length){this.terminar(run);return;}run.frame=requestAnimationFrame(frame);
      };run.frame=requestAnimationFrame(frame);
    }
    canones(sonido,fin){
      const run=this.superficie('canones',sonido,fin);if(!run)return;
      const scale=Math.min(run.w,run.h),speed=Math.min(180,scale*.35);
      const principales=[0,1].map(i=>({x:run.w*(i?.84:.16),y:run.h*.88,tx:run.w*(i?.65:.35),ty:run.h*.3,explotado:false,color:colores[i*3]}));
      const hijos=[];this.root.dataset.fase='lanzamiento';this.root.dataset.proyectiles='2';
      const dibujarCanon=(p,i)=>{const c=run.ctx;c.save();c.translate(p.x,p.y);c.fillStyle=i?'#5366ad':'#6b56a3';c.beginPath();c.roundRect(-27,-8,54,22,9);c.fill();c.fillStyle='#e4b557';c.beginPath();c.arc(-17,13,10,0,Math.PI*2);c.arc(17,13,10,0,Math.PI*2);c.fill();c.rotate(i?-.6:.6);c.fillStyle=i?'#6a82c5':'#8d72c2';c.beginPath();c.roundRect(-10,-42,20,42,6);c.fill();c.fillStyle='#c2d5ef';c.fillRect(-10,-42,20,6);c.restore();};
      const proyectil=(x,y,color,size=6)=>{const c=run.ctx;c.globalAlpha=1;c.fillStyle=color;c.beginPath();c.arc(x,y,size,0,Math.PI*2);c.fill();c.fillStyle='#fff6c8';c.beginPath();c.arc(x-1,y-1,size*.43,0,Math.PI*2);c.fill();};
      let salida=false;
      const frame=ms=>{if(this.run!==run)return;const elapsed=ms-run.inicio;this.limpiar(run);
        if(elapsed<1300)principales.forEach(dibujarCanon);
        if(!salida){salida=true;if(sonido)this.sonido('explosion',.3);}
        for(let i=0;i<principales.length;i++){const p=principales[i],t=Math.min(1,elapsed/1050),x=p.x+(p.tx-p.x)*t,y=p.y+(p.ty-p.y)*(1-(1-t)**2);
          if(t<1){for(let j=1;j<=5;j++){const u=Math.max(0,t-j*.018);run.ctx.globalAlpha=(1-j/6)*.6;proyectil(p.x+(p.tx-p.x)*u,p.y+(p.ty-p.y)*(1-(1-u)**2),'#f6c66b',Math.max(1,5-j*.7));}proyectil(x,y,p.color);}
          else if(!p.explotado){p.explotado=true;this.explosion(run,x,y,ms,12);for(let k=0;k<5;k++){const angle=-Math.PI/2+k*2*Math.PI/5+i*.22;hijos.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,start:ms,explotado:false,color:colores[k%6]});}this.root.dataset.fase='cinco-proyectiles';this.root.dataset.proyectiles=String(hijos.length);}
        }
        for(const p of hijos){const age=(ms-p.start)/1000;if(age<.85){for(let j=1;j<5;j++){const a=Math.max(0,age-j*.025);proyectil(p.x+p.vx*a,p.y+p.vy*a+35*a*a,'#f6d18b',2);}proyectil(p.x+p.vx*age,p.y+p.vy*age+35*age*age,p.color,4);}
          else if(!p.explotado){p.explotado=true;this.explosion(run,p.x+p.vx*.85,p.y+p.vy*.85+35*.85**2,ms,24);this.root.dataset.fase='figuras';}
        }
        this.pintarParticulas(run,ms);
        if(elapsed>2200&&hijos.length===10&&hijos.every(p=>p.explotado)&&!run.particulas.length){this.terminar(run);return;}run.frame=requestAnimationFrame(frame);
      };run.frame=requestAnimationFrame(frame);
    }
  }
  window.EfectosTablas=EfectosTablas;
})();
