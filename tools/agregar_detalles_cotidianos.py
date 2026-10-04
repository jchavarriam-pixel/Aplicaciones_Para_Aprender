"""Detalles útiles y concordancia: acciones, colores, tamaños y lugares cotidianos."""
import json,re,time
from pathlib import Path
from collections import Counter
from ampliar_oraciones_topicos import canonical
root=Path(__file__).resolve().parents[1];base=root/'base_oraciones.json';app=root/'generador-oraciones.html'
b=json.loads(base.read_text(encoding='utf-8'));con=set(b['conectores_reutilizables'])
colors=set(next(c['palabras'] for c in b['categorias'] if c['id']=='colores'))|{'suave','duro'}
places={'casa','sala','dormitorio','escuela','mesa','silla','sofá','cama','pupitre','lavamanos','ducha','patio','primer piso','segundo piso'}
removed=[];kept=[]
for row in b['oraciones']:
 if row.get('source')=='detalles_cotidianos_v1':
  if row['words'][0] in ['Marta','Ana']:
   row['words']=[('sentada' if w=='sentado' else w) for w in row['words']]
   if 'validAnswers' in row:row['validAnswers']=[[('sentada' if w=='sentado' else w) for w in ans] for ans in row['validAnswers']]
  if row['pics'][0]=='perro' and 'pan' in row['pics']:
   row['pics']=[('carne' if w=='pan' else w) for w in row['pics']]
   def meal(words):return (' '.join(words).replace('el pan','la carne')).split()
   row['words']=meal(row['words'])
   if 'validAnswers' in row:row['validAnswers']=[meal(ans) for ans in row['validAnswers']]
  row['categorias']=[c['id'] for c in b['categorias'] if set(row['pics'])&set(c['palabras'])]
  if row['level']>=5:row['contentWords']=[w for w in row['words'] if w not in con]
 text=' '.join(row['words'])
 unsafe=bool(re.search(r'\b(?:camina|caminan|corre|corren) (?:en|por) (?:el|la|los|las|su|sus) (?:sofá|cama|silla|pupitre)\b',text))
 chains=row['level']==6 and len(set(row['pics'])&places)>=3 and not set(row['pics'])&colors
 if unsafe or chains:removed.append({'level':row['level'],'text':text,'reason':'Acción sobre un mueble' if unsafe else 'Cadena de lugares sin un atributo útil'});continue
 kept.append(row)
b['oraciones']=kept;seen={(r['level'],canonical(r['words'])) for r in kept};added=[]
def add(level,pics,text,alternatives=()):
 pics=list(dict.fromkeys(pics));words=(text.strip().rstrip('.')+' .').split();key=(level,canonical(words))
 if key in seen:return
 assert all(p in b['imagenes'] for p in pics),(pics,text)
 if level==6:assert 6<=len(pics)<=8 and len(words)>=12,(pics,text)
 row=dict(level=level,pics=pics,words=words,source='detalles_cotidianos_v1')
 if level>=5:
  row.update(mode='connectors_free',extras=[],contentWords=[w for w in words if w not in con])
  answers=[(a.rstrip('.')+' .').split() for a in alternatives if a!=text]
  if answers:row['validAnswers']=answers
 elif level==4:row['extras']=[w for w in ['cohete','sombrilla','gato','camión','nube'] if w not in pics and w not in words][:2]
 row['categorias']=[c['id'] for c in b['categorias'] if set(pics)&set(c['palabras'])]
 seen.add(key);b['oraciones'].append(row);added.append(row)
def middle(pics,text,alternatives=()):
 assert len(set(pics)) in [4,5]
 for l in [3,4,5]:add(l,pics,text,alternatives)
def adjective(word,female=False,plural=False):
 if word in ['azul','gris','marrón']:
  return word+('es' if plural else '')
 value=word[:-1]+'a' if female and word.endswith('o') else word
 return value+('s' if plural else '')
people=[(n,n,n in ['Marta','Ana'],False) for n in ['Manuel','Juan','Marta','Ana','Marcos']]
people += [('niño','el niño',False,False),('niña','la niña',True,False),('niños','los niños',False,True),('niñas','las niñas',True,True)]
for p,s,f,plural in people:
 state='están' if plural else 'está';seated='sentad'+('a' if f else 'o')+('s' if plural else '')
 add(1,[p,'sentarse'],f'{s} {state} {seated}')
 for furniture in ['sofá','silla']:
  article='el' if furniture=='sofá' else 'la';fem=furniture=='silla'
  add(2,[p,'sentarse',furniture],f'{s} {state} {seated} en {article} {furniture}')
  for color in ['amarillo','azul','rojo','verde']:
   descriptor=adjective(color,fem);start=f'{s} {state} {seated} en {article} {furniture} {descriptor}'
   middle([p,'sentarse',furniture,color],start)
   add(6,[p,'sentarse',furniture,color,'sala','casa'],start+' de la sala de la casa',[
    start+' en la sala de la casa',f'en la sala de la casa {start}',f'{s} {state} {seated} en la sala de la casa en {article} {furniture} {descriptor}'])
   size='grande' if color in ['amarillo','rojo'] else 'pequeño';sizeword=adjective(size,fem)
   detailed=f'{s} {state} {seated} en {article} {furniture} {sizeword} y {descriptor}'
   swapped=f'{s} {state} {seated} en {article} {furniture} {descriptor} y {sizeword}'
   middle([p,'sentarse',furniture,size,color],detailed,[swapped])
   add(6,[p,'sentarse',furniture,color,size,'sala','casa'],detailed+' de la sala de la casa',[
    swapped+' de la sala de la casa',detailed+' en la sala de la casa',swapped+' en la sala de la casa'])
 for color in ['azul','rojo','verde','blanco']:
  read='leen' if plural else 'lee'
  start=f'{s} {read} el libro {color}'
  middle([p,'lee','libro',color],start)
  add(6,[p,'lee','libro',color,'sentarse','silla','sala'],start+f' {seated} en la silla de la sala',[
   f'{s} {state} {seated} en la silla de la sala y {read} el libro {color}',f'en la silla de la sala {start} {seated}'])
 for notebook,pencil in [('azul','negro'),('rojo','amarillo'),('verde','gris')]:
  write='escriben' if plural else 'escribe'
  start=f'{s} {write} en el cuaderno {notebook}'
  middle([p,'escribe','cuaderno',notebook],start)
  add(6,[p,'escribe','cuaderno',notebook,'lápiz',pencil,'mesa'],start+f' con el lápiz {pencil} en la mesa',[
   f'en la mesa {start} con el lápiz {pencil}',f'{s} {write} con el lápiz {pencil} en el cuaderno {notebook} en la mesa'])
 for toy,article,feminine,pl in [('pelota','la',True,False),('robot','el',False,False),('bloques','los',False,True)]:
  play='juegan' if plural else 'juega';partner='niña' if p=='niño' else 'niño';partnertext='la niña' if p=='niño' else 'el niño'
  for color in ['amarillo','azul','rojo','verde']:
   description=adjective(color,feminine,pl)
   start=f'{s} {play} con {article} {toy} {description}'
   middle([p,'juega',toy,color],start)
   add(6,[p,'juega',toy,color,partner,'patio'],start+f' y con {partnertext} en el patio')
 for drink in ['agua','fresco']:
  take='toman' if plural else 'toma'
  for color in ['azul','verde','rojo']:
   start=f'{s} {take} {drink} en el vaso {color}'
   middle([p,'tomar',drink,'vaso',color],start)
   add(6,[p,'tomar',drink,'vaso','grande',color,'patio'],f'{s} {take} {drink} en el vaso grande y {color} en el patio',[
    f'{s} {take} {drink} en el vaso {color} y grande en el patio',f'en el patio {s} {take} {drink} en el vaso grande y {color}'])
 for garment,article in [('gorra','la'),('sombrero','el'),('camisa','la')]:
  use='usan' if plural else 'usa';walk='caminan' if plural else 'camina';partner='niña' if p=='niño' else 'niño';partnertext='la niña' if p=='niño' else 'el niño'
  for color in ['amarillo','azul','rojo','verde']:
   description=adjective(color,article=='la');start=f'{s} {use} {article} {garment} {description}'
   middle([p,garment,color,'parque'],start+' en el parque')
   add(6,[p,garment,color,'caminar',partner,'parque'],start+f' y {walk} con {partnertext} por el parque')
for animal,article,food,colorset in [('conejo','el','zanahoria',['blanco','gris','marrón']),('perro','el','carne',['blanco','marrón','negro']),('gato','el','carne',['blanco','gris','negro']),('tortuga','la','lechuga',['verde','gris','marrón'])]:
 for color in colorset:
  desc=adjective(color,article=='la');small=adjective('pequeño',article=='la');foodarticle='la' if food!='pan' else 'el'
  text=f'{article} {animal} {desc} come {foodarticle} {food}'
  middle([animal,color,'come',food],text)
  add(6,[animal,color,'pequeño','come',food,'patio'],f'{article} {animal} {desc} y {small} come {foodarticle} {food} en el patio',[
   f'{article} {animal} {small} y {desc} come {foodarticle} {food} en el patio'])
report=dict(removed=len(removed),new=len(added),total=len(b['oraciones']),newByLevel=dict(Counter(r['level'] for r in added)),removedSamples=removed)
reportpath=root/'tools/revision_detalles_cotidianos.json'
if not removed and not added and reportpath.exists():report=json.loads(reportpath.read_text(encoding='utf-8'))
else:reportpath.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
html=app.read_text(encoding='utf-8');payload=json.dumps(b,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
html,n=re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',lambda x:x[1]+payload+x[2],html,flags=re.S);assert n==1
mfile=root/'ImagenesGeneradorOraciones/ampliacion_vocabulario.json';m=json.loads(mfile.read_text(encoding='utf-8'));m['resumen']['integracion']=f"{len(b['imagenes'])} imágenes; {len(b['oraciones'])} ejercicios de seis niveles y {len(b['categorias'])} categorías."
m['oraciones_ampliadas']['total']=len(b['oraciones']);m['oraciones_ampliadas']['niveles']={str(i):sum(r['level']==i for r in b['oraciones']) for i in range(1,7)}
m['oraciones_ampliadas']['nivel6']='Oraciones con más detalles útiles: colores, tamaños, postura, objetos y lugares; no se alargan añadiendo lugares o momentos innecesarios.'
m['oraciones_ampliadas']['detalles_cotidianos']='tools/agregar_detalles_cotidianos.py'
for p,t in [(base,json.dumps(b,ensure_ascii=False,indent=2)+'\n'),(app,html),(mfile,json.dumps(m,ensure_ascii=False,indent=2)+'\n')]:
 for i in range(3):
  try:p.write_text(t,encoding='utf-8');break
  except OSError:
   if i==2:raise
   time.sleep(.5)
print(json.dumps({k:v for k,v in report.items() if k!='removedSamples'},ensure_ascii=False))
