"""Instala el selector de tarjetas sin modificar la base integrada."""
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'generador-oraciones.html'
s = p.read_text(encoding='utf-8')
assert 'id="exerciseImageOptions"' not in s, 'Ya instalado'
s = s.replace('<div class="available-count" id="availableCount"', '''<div class="image-selection-settings">
    <label class="preference-option"><input type="checkbox" id="onlySelectedImagesInput">Usar únicamente imágenes de las categorías seleccionadas</label>
    <p class="topic-help">Marca las tarjetas que quieres practicar. Las imágenes desmarcadas no aparecerán en las oraciones. Si desactivas la opción anterior, otras categorías pueden aportar imágenes para completar la oración.</p>
    <button type="button" class="image-selection-button" id="resetImageSelectionBtn">Seleccionar todas las imágenes</button>
    <div id="exerciseImageOptions" aria-label="Imágenes para los ejercicios"></div>
  </div>
  <div class="available-count" id="availableCount"''', 1)
s = s.replace('El nivel, los temas, el nombre y estas preferencias', 'El nivel, los temas, las imágenes seleccionadas, el nombre y estas preferencias')
s = s.replace('</style>', '''.image-selection-settings{margin-top:18px;border-top:2px solid #ede9fe;padding-top:16px}
.image-selection-button{background:#ede9fe;color:#5b21b6;border:0;border-radius:12px;min-height:44px;padding:9px 14px;font-weight:800;cursor:pointer}
.image-category{margin-top:10px;border:2px solid #ddd6fe;border-radius:16px;overflow:hidden;background:#faf8ff}
.image-category summary{cursor:pointer;min-height:48px;padding:12px;display:list-item;font-weight:800;color:#5b21b6;overflow-wrap:anywhere}
.image-category-tools{display:flex;flex-wrap:wrap;gap:8px;padding:8px 12px}
.exercise-image-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:8px;padding:12px}
.exercise-image-option{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;padding:8px;background:white;border:2px solid #ddd6fe;border-radius:12px;cursor:pointer;text-align:center;font-size:.88rem;font-weight:800;overflow-wrap:anywhere}
.exercise-image-option:has(input:checked){border-color:#8b5cf6;background:#f5f3ff}
.exercise-image-option input{position:absolute;top:8px;left:8px;width:22px;height:22px;accent-color:#7c3aed}
.exercise-image-option img{width:100%;max-width:125px;aspect-ratio:1;object-fit:contain;border-radius:8px}
@media(max-width:520px){.exercise-image-grid{grid-template-columns:repeat(3,minmax(0,1fr));padding:8px;gap:6px}.exercise-image-option{padding:5px;font-size:.8rem}}
</style>''', 1)
s = s.replace("const CLAVE_CATEGORIAS='generadorOracionesCategorias';", """const CLAVE_CATEGORIAS='generadorOracionesCategorias';
const CLAVE_IMAGENES='generadorOracionesImagenes';
let excludedImages=new Set(),onlySelectedImages=false,imagePreferencesRead=false;
const filteredPools=new Map(),openImageCategories=new Set();
let categoryCounts=new Map();
""")
s = s.replace('baseLista=true;renderCategoryOptions();actualizarDisponibilidad();', 'baseLista=true;renderCategoryOptions();renderImageOptions();actualizarDisponibilidad();')
s = s.replace("if(selectedCategories!==null)selectedCategories=new Set([...selectedCategories].filter(id=>CATEGORIES.some(c=>c.id===id)));\n}", """if(selectedCategories!==null)selectedCategories=new Set([...selectedCategories].filter(id=>CATEGORIES.some(c=>c.id===id)));
 if(!imagePreferencesRead){
  imagePreferencesRead=true;
  try{const value=JSON.parse(localStorage.getItem(CLAVE_IMAGENES)||'null');if(value&&Array.isArray(value.excluded)){excludedImages=new Set(value.excluded.filter(w=>typeof w==='string'));onlySelectedImages=value.onlySelected===true;}}catch{}
 }
 excludedImages=new Set([...excludedImages].filter(w=>WORDS[w]));
 categoryCounts=new Map();
}""", 1)
s = s.replace('guardarCategorias();actualizarDisponibilidad();', 'guardarCategorias();renderImageOptions();actualizarDisponibilidad();', 1)
start=s.index('function coincideCategorias(oracion)')
end=s.index('function actualizarDisponibilidad()',start)
s = s[:start] + '''function imagenesDelFiltro(){
 const cats=selectedCategories===null?CATEGORIES:CATEGORIES.filter(c=>selectedCategories.has(c.id));
 return new Set(cats.flatMap(c=>c.palabras).filter(w=>!excludedImages.has(w)));
}
function coincideCategorias(oracion){
 if(oracion.pics.some(p=>excludedImages.has(p)))return false;
 const allowed=imagenesDelFiltro();
 return oracion.pics.some(p=>allowed.has(p))&&(!onlySelectedImages||oracion.pics.every(p=>allowed.has(p)));
}
function claveMazo(level){return level+'|'+(selectedCategories===null?'*':JSON.stringify([...selectedCategories].sort()))+'|'+JSON.stringify([...excludedImages].sort())+'|'+onlySelectedImages;}
function guardarSeleccionImagenes(){try{localStorage.setItem(CLAVE_IMAGENES,JSON.stringify({excluded:[...excludedImages],onlySelected:onlySelectedImages}));}catch{}}
function actualizarResumenImagenes(){
 document.querySelectorAll('#exerciseImageOptions input[data-word]').forEach(input=>{input.checked=!excludedImages.has(input.dataset.word);});
 document.querySelectorAll('#exerciseImageOptions summary').forEach(summary=>{
  const cat=CATEGORIES.find(c=>c.id===summary.dataset.category);
  if(cat)summary.textContent=(cat.emoji||'📌')+' '+cat.label+' · '+cat.palabras.filter(w=>!excludedImages.has(w)).length+'/'+cat.palabras.length+' imágenes';
 });
}
function cambiarImagenes(words,enabled){
 words.forEach(w=>{if(enabled)excludedImages.delete(w);else excludedImages.add(w);});
 filteredPools.clear();guardarSeleccionImagenes();actualizarResumenImagenes();actualizarDisponibilidad();
}
function renderImageOptions(){
 const container=document.getElementById('exerciseImageOptions');container.replaceChildren();
 const visible=selectedCategories===null?CATEGORIES:CATEGORIES.filter(c=>selectedCategories.has(c.id));
 document.getElementById('onlySelectedImagesInput').checked=onlySelectedImages;
 if(!visible.length){const note=document.createElement('p');note.className='topic-help';note.textContent='Selecciona una categoría para elegir sus imágenes.';container.appendChild(note);}
 visible.forEach(cat=>{
  const details=document.createElement('details');details.className='image-category';details.dataset.category=cat.id;
  const summary=document.createElement('summary');summary.dataset.category=cat.id;details.appendChild(summary);
  let populated=false;
  const populate=()=>{
   if(populated)return;populated=true;
   const tools=document.createElement('div');tools.className='image-category-tools';
   [['Todas',true],['Ninguna',false]].forEach(([name,enabled])=>{const btn=document.createElement('button');btn.type='button';btn.className='image-selection-button';btn.textContent=name;btn.onclick=()=>cambiarImagenes(cat.palabras,enabled);tools.appendChild(btn);});
   details.appendChild(tools);
   const grid=document.createElement('div');grid.className='exercise-image-grid';
   [...cat.palabras].sort((a,b)=>a.localeCompare(b,'es')).forEach(word=>{
    const label=document.createElement('label');label.className='exercise-image-option';
    const input=document.createElement('input');input.type='checkbox';input.dataset.word=word;input.checked=!excludedImages.has(word);input.setAttribute('aria-label',WORDS[word].label);
    input.onchange=()=>cambiarImagenes([word],input.checked);
    const img=document.createElement('img');img.src=WORDS[word].img;img.alt='';img.loading='lazy';img.onerror=()=>tryImageFallback(img);
    const name=document.createElement('span');name.textContent=WORDS[word].label;
    label.append(input,img,name);grid.appendChild(label);
   });details.appendChild(grid);
  };
  details.addEventListener('toggle',()=>{if(details.open){openImageCategories.add(cat.id);populate();actualizarResumenImagenes();}else openImageCategories.delete(cat.id);});
  if(openImageCategories.has(cat.id)){details.open=true;populate();}
  container.appendChild(details);
 });actualizarResumenImagenes();
}
document.getElementById('onlySelectedImagesInput').onchange=event=>{onlySelectedImages=event.target.checked;filteredPools.clear();guardarSeleccionImagenes();actualizarDisponibilidad();};
document.getElementById('resetImageSelectionBtn').onclick=()=>{excludedImages.clear();filteredPools.clear();guardarSeleccionImagenes();actualizarResumenImagenes();actualizarDisponibilidad();};
''' + s[end:]
old="document.querySelectorAll('.topic-count').forEach(badge=>{const id=badge.dataset.category;const n=oracionesUnicas(id==='*'?unfiltered:unfiltered.filter(o=>o.categorias.includes(id))).length;badge.textContent=format(n);badge.title=n+' oraciones de este tema en el nivel '+currentLevel;});"
new="""if(!categoryCounts.has(currentLevel)){const unique=oracionesUnicas(unfiltered),counts=new Map([['*',unique.length]]);CATEGORIES.forEach(c=>counts.set(c.id,oracionesUnicas(unfiltered.filter(o=>o.categorias.includes(c.id))).length));categoryCounts.set(currentLevel,counts);}
 document.querySelectorAll('#categoryOptions .topic-count').forEach(badge=>{const id=badge.dataset.category,n=categoryCounts.get(currentLevel).get(id)||0;badge.textContent=format(n);badge.title=n+' oraciones de este tema antes de filtrar imágenes en el nivel '+currentLevel;});"""
assert old in s
s=s.replace(old,new)
s=s.replace("' para estos temas. Elige otro nivel o agrega temas. Total en los seis niveles: '", "' para estas imágenes. Elige otro nivel, agrega imágenes o permite imágenes de otras categorías. Total en los seis niveles: '")
s=s.replace('function reiniciarMazosOraciones(){mazosOraciones.clear();poolsPorNivel.clear();}', 'function reiniciarMazosOraciones(){mazosOraciones.clear();poolsPorNivel.clear();filteredPools.clear();categoryCounts.clear();}')
old='function poolUnicoNivel(level){return oracionesUnicas(poolBaseNivel(level).filter(coincideCategorias));}'
new='''function poolUnicoNivel(level){
 const key=claveMazo(level);if(filteredPools.has(key))return filteredPools.get(key);
 const allowed=imagenesDelFiltro();
 const pool=oracionesUnicas(poolBaseNivel(level).filter(o=>!o.pics.some(p=>excludedImages.has(p))&&o.pics.some(p=>allowed.has(p))&&(!onlySelectedImages||o.pics.every(p=>allowed.has(p)))));
 filteredPools.set(key,pool);return pool;
}'''
assert old in s
s=s.replace(old,new)
# Los distractores también respetan las imágenes desmarcadas y el modo estricto.
s=s.replace("const disponibles=Object.keys(WORDS).filter(w=>!funciones.has(w)&&!w.includes(' ')&&!prohibidas.has(w));", "const allowed=onlySelectedImages?imagenesDelFiltro():null;\n const disponibles=Object.keys(WORDS).filter(w=>!funciones.has(w)&&!w.includes(' ')&&!prohibidas.has(w)&&!excludedImages.has(w)&&(!allowed||allowed.has(w)));\n // Si el filtro deja muy pocos distractores, se usan palabras de apoyo sin imágenes nuevas.\n const reserva=['luna','mochila','rueda','campana','toalla'].filter(w=>!prohibidas.has(w)&&!excludedImages.has(w));\n while(disponibles.length<3&&reserva.length)disponibles.push(reserva.shift());")
p.write_text(s,encoding='utf-8')
print('Selector de imágenes instalado.')
