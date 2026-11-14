/* Ayuda secuencial: el arreglo no cambia de posición durante el conteo. */
(() => {
  'use strict';
  class ConteoArreglo {
    constructor({arreglo,boton,t,opciones,alEstado,alCambiar}) {
      Object.assign(this,{arreglo,boton,t,opciones,alEstado,alCambiar});
      this.activo=false;this.ticket=0;this.esperas=new Map();this.audio=null;this.notas=new Set();
      boton.onclick=()=>{if(this.activo)this.detener();else this.reproducir();};
      this.actualizarBoton();
    }
    preparar(filas,columnas){this.detener();this.filas=filas;this.columnas=columnas;}
    actualizarBoton() {
      this.boton.textContent=this.activo?this.t('■ Detener conteo','■ Stop counting'):this.t('▶ Contar filas y columnas','▶ Count rows and columns');
      this.boton.setAttribute('aria-pressed',String(this.activo));
      this.arreglo.setAttribute('aria-busy',String(this.activo));this.alCambiar?.();
    }
    detener({limpiar=true}={}) {
      const estabaActivo=this.activo;this.activo=false;this.ticket++;
      this.cancelarVoz?.();this.cancelarVoz=null;
      if(estabaActivo)window.speechSynthesis?.cancel();
      for(const [id,fin]of this.esperas){clearTimeout(id);fin(false);}this.esperas.clear();
      for(const nota of this.notas)try{nota.stop();}catch{}this.notas.clear();
      this.arreglo.querySelectorAll('.contando,.girando,.etiqueta-activa').forEach(e=>e.classList.remove('contando','girando','etiqueta-activa'));
      if(limpiar){this.arreglo.querySelectorAll('.etiqueta-conteo').forEach(e=>e.setAttribute('hidden',''));this.arreglo.dataset.conteo='reposo';delete this.arreglo.dataset.paso;}
      else this.arreglo.dataset.conteo='detenido';
      this.actualizarBoton();
    }
    esperar(ms,ticket) {
      return new Promise(resolve=>{if(ticket!==this.ticket){resolve(false);return;}const id=setTimeout(()=>{this.esperas.delete(id);resolve(ticket===this.ticket);},ms);this.esperas.set(id,resolve);});
    }
    frase(texto,ticket) {
      if(!this.opciones().narracion||ticket!==this.ticket)return Promise.resolve();
      let voz;try{voz=IdiomaVoz.hablar(texto);}catch{return Promise.resolve();}if(!voz)return Promise.resolve();
      // Sin voces instaladas, continuar con las señales visuales sin esperar al sintetizador.
      if(!window.speechSynthesis?.getVoices().length){window.speechSynthesis?.cancel();return Promise.resolve();}
      return new Promise(resolve=>{
        let terminado=false;
        const fin=()=>{if(terminado)return;terminado=true;clearTimeout(limite);voz.onend=null;voz.onerror=null;if(this.cancelarVoz===fin)this.cancelarVoz=null;resolve();};
        const limite=setTimeout(fin,Math.max(2600,texto.length*110/IdiomaVoz.velocidad));
        voz.onend=fin;voz.onerror=fin;this.cancelarVoz=fin;
      });
    }
    prepararAudio() {
      if(!this.opciones().sonidoConteo)return;
      try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;this.audio??=new Audio();if(this.audio.state==='suspended')this.audio.resume().catch(()=>{});}catch{}
    }
    campana(indice,eje) {
      if(!this.opciones().sonidoConteo||!this.audio||this.audio.state!=='running')return;
      const ahora=this.audio.currentTime,escala=[784,880,988,1046.5,1174.7,1318.5,1396.9,1568],base=escala[(indice-1)%escala.length]*(eje==='columnas'?1.12:1);
      try{for(const [multiplo,volumen]of [[1,.035],[2.01,.009],[3.9,.003]]){const o=this.audio.createOscillator(),g=this.audio.createGain();o.type='sine';o.frequency.value=base*multiplo;g.gain.setValueAtTime(.0001,ahora);g.gain.exponentialRampToValueAtTime(volumen,ahora+.012);g.gain.exponentialRampToValueAtTime(.0001,ahora+.34);o.connect(g);g.connect(this.audio.destination);this.notas.add(o);o.onended=()=>{this.notas.delete(o);o.disconnect();g.disconnect();};o.start(ahora);o.stop(ahora+.36);}}catch{}
    }
    marcar(eje,indice) {
      this.arreglo.querySelectorAll('.contando,.girando,.etiqueta-activa').forEach(e=>e.classList.remove('contando','girando','etiqueta-activa'));
      const atributo=eje==='filas'?'fila':'columna';
      for(const celda of this.arreglo.querySelectorAll(`.celda[data-${atributo}="${indice}"]`)){
        celda.classList.add('contando');celda.dataset.eje=eje;
        const pieza=celda.querySelector('.pieza');pieza.classList.add('girando');pieza.style.animationDelay=(Number(eje==='filas'?celda.dataset.columna:celda.dataset.fila)-1)*18+'ms';
      }
      const etiqueta=this.arreglo.querySelector(`[data-etiqueta-${atributo}="${indice}"]`);etiqueta?.removeAttribute('hidden');etiqueta?.classList.add('etiqueta-activa');
      this.arreglo.dataset.conteo=eje;this.arreglo.dataset.paso=String(indice);this.campana(indice,eje);
    }
    async reproducir() {
      if(!this.opciones().habilitada||!this.arreglo.getClientRects().length)return;
      this.detener();this.activo=true;const ticket=this.ticket;this.actualizarBoton();this.prepararAudio();
      try{
        for(const [eje,cantidad]of [['filas',this.filas],['columnas',this.columnas]]){
          if(ticket!==this.ticket)return;
          this.arreglo.querySelectorAll('.contando,.girando,.etiqueta-activa').forEach(e=>e.classList.remove('contando','girando','etiqueta-activa'));
          const intro=eje==='filas'?this.t('Contemos las filas.','Let’s count the rows.'):this.t('Ahora las columnas.','Now the columns.');
          this.alEstado(intro);this.arreglo.dataset.conteo=eje;delete this.arreglo.dataset.paso;
          await Promise.all([this.frase(intro,ticket),this.esperar(400,ticket)]);
          for(let i=1;i<=cantidad;i++){
            if(ticket!==this.ticket)return;this.marcar(eje,i);
            const texto=String(i);
            this.alEstado(eje==='filas'?this.t(`Fila ${i}`,`Row ${i}`):this.t(`Columna ${i}`,`Column ${i}`));
            await Promise.all([this.frase(texto,ticket),this.esperar(560,ticket)]);
          }
        }
        if(ticket!==this.ticket)return;
        this.arreglo.querySelectorAll('.contando,.girando,.etiqueta-activa').forEach(e=>e.classList.remove('contando','girando','etiqueta-activa'));
        const resumen=this.t(`Hay ${this.filas} ${this.filas===1?'fila':'filas'} y ${this.columnas} ${this.columnas===1?'columna':'columnas'}. Multiplica ${this.filas} por ${this.columnas}.`,`There ${this.filas===1?'is':'are'} ${this.filas} ${this.filas===1?'row':'rows'} and ${this.columnas} ${this.columnas===1?'column':'columns'}. Multiply ${this.filas} by ${this.columnas}.`);
        this.alEstado(resumen);this.arreglo.dataset.conteo='terminado';delete this.arreglo.dataset.paso;await this.frase(resumen,ticket);
      }finally{if(ticket===this.ticket){this.activo=false;this.actualizarBoton();}}
    }
  }
  window.ConteoArreglo=ConteoArreglo;
})();
