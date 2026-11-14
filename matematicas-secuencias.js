(()=>{
 const app=document.querySelector('.app'),tools=document.createElement('aside');tools.className='herramientas-secuencias';app.prepend(tools);tools.append(document.querySelector('.topbar'));
 const config=document.createElement('details');config.className='ajustes-secuencias';config.innerHTML='<summary>⚙️ Configuración</summary><div id="preferenciasSecuencias"></div>';tools.append(config);config.append(els.configScreen);
 tools.append(document.querySelector('.exercise-toolbar'));for(const id of ['newRoundBtn','clearBtn','readBtn'])tools.append($(id));document.body.append(document.getElementById('creditos-aplicaciones'));
 document.querySelector('.footer').remove();document.querySelector('.intro').remove();document.querySelector('.bottom-actions-panel h2').remove();els.startBtn.style.display='none';document.getElementById('configMessage').remove();
 IdiomaVoz.instalar('#preferenciasSecuencias',{cambioIdioma:()=>updateSummary()});
 const pager=document.createElement('div');pager.className='secuencias-paginas';pager.innerHTML='<button id="seqPrev">◀</button><span id="seqPage"></span><button id="seqNext">▶</button>';document.querySelector('.bottom-actions').prepend(pager);
 function remember(){document.querySelectorAll('.slot').forEach(e=>sequenceValues[e.dataset.seq+':'+e.dataset.index]=e.dataset.value||'');}
 function pageRender(){renderCards();buildDeck();document.querySelectorAll('.slot').forEach(e=>{const v=sequenceValues[e.dataset.seq+':'+e.dataset.index];if(v){e.dataset.value=v;e.textContent=v;e.classList.add('has-value');const t=state.tiles.find(t=>!t.used&&t.value===+v);if(t){t.used=true;e.dataset.tileId=t.id;}}});renderDeck();}
 document.getElementById('seqPrev').onclick=()=>{remember();sequencePage--;pageRender();fit();};document.getElementById('seqNext').onclick=()=>{remember();sequencePage++;pageRender();fit();};
 startPractice();
 for(const key of SETTINGS_FIELDS){const c=els[key];if(key!=='studentName')c.addEventListener('change',()=>{createRound();fit();});}
 const fit=Matematicas.pantalla(app,(h,z)=>{
  app.style.setProperty('--unidad',1/z+'px');
  const size=innerWidth<600||innerHeight<700?1:2;
  if(size!==sequencePageSize){remember();sequencePageSize=size;sequencePage=0;pageRender();}
  const pages=Math.ceil(state.sequences.length/sequencePageSize);document.getElementById('seqPage').textContent=(sequencePage+1)+' / '+pages;document.getElementById('seqPrev').disabled=sequencePage===0;document.getElementById('seqNext').disabled=sequencePage>=pages-1;pager.hidden=pages<=1;

  const cards=els.cardsArea,r=cards.getBoundingClientRect(),cols=r.width>650?2:1;
  cards.style.setProperty('--columnas',cols);cards.style.setProperty('--filas',Math.ceil(Math.min(sequencePageSize,state.sequences.length)/cols));
  const deck=els.deck,dr=deck.getBoundingClientRect(),tileCount=state.tiles.length;
  let columns=Math.min(Math.max(1,tileCount),Math.max(3,Math.floor(dr.width/65)));
  deck.style.setProperty('--mazo-columnas',columns);deck.style.setProperty('--mazo-filas',Math.ceil(tileCount/columns));
  app.classList.toggle('compacta',h<500||state.sequences.length>3);
 });
 new MutationObserver(fit).observe(els.cardsArea,{childList:true});new ResizeObserver(fit).observe(els.cardsArea);new ResizeObserver(fit).observe(els.deck);
 addEventListener('resize',()=>cancelDrag());document.addEventListener('fullscreenchange',()=>cancelDrag());
})();
