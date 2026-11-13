(()=>{
 const app=document.querySelector('.app'),panel=document.querySelector('.panel'),tools=document.createElement('aside');tools.className='herramientas-orden';panel.prepend(tools);tools.append(document.querySelector('.header'));
 const config=document.createElement('details');config.className='ajustes-orden';config.innerHTML='<summary>⚙️ Configuración</summary>';tools.append(config);config.append(document.querySelector('#setup'));
 const voice=document.createElement('div');voice.id='preferenciasOrden';config.append(voice);
 tools.append(document.querySelector('.hint-controls'));
 for(const id of ['symbolsBtn','newBtn','resetBtn','setupBtn'])tools.append(document.getElementById(id));
 tools.append(document.getElementById('creditos-aplicaciones'));
 document.querySelector('.credit').remove();document.getElementById('startBtn').parentElement.style.display='none';
 const saved=Matematicas.leer('ordenNumeros.config.v1');
 state.mode=['asc','desc','mix'].includes(saved.mode)?saved.mode:'asc';state.digits=[1,2,3,4].includes(saved.digits)?saved.digits:1;state.count=Number.isInteger(saved.count)&&saved.count>=3&&saved.count<=15?saved.count:5;if(state.digits===1)state.count=Math.min(11,state.count);
 for(const [g,k]of [['modeOptions','mode'],['digitOptions','digits'],['countOptions','count']]){
  selectOption('#'+g,document.querySelector(`#${g} [data-${k}="${state[k]}"]`));
  document.getElementById(g).addEventListener('click',()=>{if(state.count===null)state.count=11;newRound();fit();});
 }
 updateCountLimits();document.getElementById('startBtn').onclick();
 IdiomaVoz.instalar('#preferenciasOrden',{cambioIdioma:()=>renderSlots()});
 const fit=Matematicas.pantalla(app,(h,z)=>{
  const game=document.getElementById('game');app.classList.toggle('compacta',h<450||innerWidth/z<300);
  const width=game.getBoundingClientRect().width/z;
  app.style.setProperty('--unidad',1/z+'px');
  const cols=Math.min(state.count,Math.max(3,Math.floor(width/(66/z))));
  game.style.setProperty('--columnas',cols);
  game.style.setProperty('--filas',Math.ceil(state.count/cols));
  game.style.setProperty('--fuente-numero',Math.max(12/z,Math.min(34,(width/cols-18)/Math.max(2,state.digits)*1.4))+'px');
 });
 new ResizeObserver(fit).observe(document.getElementById('game'));
 addEventListener('resize',cancelOrderingDrag);document.addEventListener('fullscreenchange',cancelOrderingDrag);
})();
