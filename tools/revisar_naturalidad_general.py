"""Revisa familias completas y agrega situaciones curadas que funcionan con General."""
import json,re,time
from collections import Counter
from pathlib import Path
from revisar_orden_imagenes_pistas import alinear_fila
from reglas_naturalidad import motivo_descarte,HUMANOS
from ampliar_oraciones_topicos import NOUNS,canonical
root=Path(__file__).resolve().parents[1]
base=root/'base_oraciones.json';app=root/'generador-oraciones.html'
b=json.loads(base.read_text(encoding='utf-8'))
manpath=root/'ImagenesGeneradorOraciones/ampliacion_vocabulario.json';m=json.loads(manpath.read_text(encoding='utf-8'))
nouns=dict(NOUNS)
for c in m['cards']:
 if c.get('article'):nouns[c['word']]=(c['article'],c['gender'])
nouns.update({'sopa':('la','f'),'hamburguesa':('la','f'),'zanahoria':('la','f'),'frutas':('las','fp'),'verduras':('las','fp'),'juguetes':('los','mp'),'cama':('la','f'),'mesa':('la','f'),'silla':('la','f'),'sofá':('el','m')})
# Apoyo común; no convierte las imágenes de apoyo en el tema obligatorio.
general=list(dict.fromkeys(list(HUMANOS)+next(c['palabras'] for c in b['categorias'] if c['id']=='acciones')+['casa','escuela','parque','patio','mesa','silla','cama','sala','dormitorio','pupitre','libro','cuaderno','lápiz','pizarra','día','noche','agua','vaso','plato','manos','peine','cepillo de dientes','niño','niña','grande','pequeño','rojo','azul','verde','blanco','negro','árbol','plantas','pelota','juguetes','puerta','ventana','tarea','conejo','bloques']))
general=sorted([w for w in general if w in b['imagenes']])
b['categorias']=[c for c in b['categorias'] if c['id']!='general']
b['categorias'].insert(0,dict(id='general',label='General',emoji='🧩',palabras=general,apoyo=True))
removed=[];updated=0;kept=[]
for row in b['oraciones']:
 reason=motivo_descarte(row)
 if reason:removed.append(dict(reason=reason,level=row['level'],text=' '.join(row['words']),pics=row['pics']));continue
 text=' '.join(row['words']);new=text
 if 'lavarse' in row['pics'] and 'dientes' in row['pics']:
  new=new.replace('se lava los dientes','se cepilla los dientes').replace('se lavan los dientes','se cepillan los dientes').replace('nos lavamos los dientes','nos cepillamos los dientes')
 if 'come' in row['pics'] and 'manos' in row['pics'] and row.get('source')=='oraciones_largas_v1':
  new=new.replace('con las manos','en el plato');row['pics']=[('plato' if p=='manos' else p) for p in row['pics']]
 if row.get('source')=='general_situaciones_v1':
  new=new.replace('el cielo está lluvioso','el día está lluvioso').replace('el cielo está soleado','el día está soleado').replace('el cielo está nublado','el día está nublado')
  if 'la cama es suave' in new:row['pics']=[('dormitorio' if q=='mesa' else q) for q in row['pics']]
  elif new.startswith(('la mesa es dura','la silla es baja')) and 'sala' not in row['pics']:row['pics'].append('sala')
  if 'lleva el vaso para reciclar' in new:
   subject=new.split(' lleva ')[0];new=subject+' recicla el vaso que está en la mesa de la casa durante el día .'
 if 'tomar' in row['pics'] and 'vaso' in row['pics']:new=new.replace('en el vaso','del vaso')
 if row['level']==6 and len(new.split())<16:new=new.replace('de día .','durante el día .')
 if new!=text:
  row['words']=new.split();row.pop('validAnswers',None);updated+=1
 kept.append(row)
b['oraciones']=kept
con=set(b['conectores_reutilizables']);seen={(r['level'],canonical(words)) for r in kept for words in [r['words'],*r.get('validAnswers',[])]};added=[]
def add(level,pics,text):
 pics=list(dict.fromkeys(pics))
 if level==6 and len(text.split())<15:
  if 'en la casa' in text:text=text.replace('en la casa','en la sala de la casa');pics.append('sala')
  elif 'en casa' in text:text=text.replace('en casa','en la casa')
  elif 'de la casa' in text:text=text.replace('de la casa','de la casa grande');pics.append('grande')
 pics=list(dict.fromkeys(pics));words=(text.strip().rstrip('.')+' .').split();key=(level,canonical(words))
 assert all(p in b['imagenes'] for p in pics),(pics,text)
 if key in seen:return
 if level==6:assert 16<=len(words)<=24,(len(words),text)
 row=dict(level=level,pics=pics,words=words,source='general_situaciones_v1')
 if motivo_descarte(row):return
 if level>=5:row.update(mode='connectors_free',extras=[],contentWords=[w for w in words if w not in con])
 elif level==4:row['extras']=[w for w in ['cohete','sombrilla','gato','camión','nube'] if w not in pics and w not in words][:2]
 seen.add(key);added.append(row);b['oraciones'].append(row)
def series(pics,text):
 count=len(set(pics))
 for level in {2:[1],3:[2,4],4:[3,4,5],5:[3,4,5]}[count]:add(level,pics,text)
def ph(n):return nouns.get(n,('la' if n in ['bicicleta','montaña','catarata','casa'] else 'el','m'))[0]+' '+n
def loc(n):return 'en '+ph(n)
people=[('Ana','Ana'),('Marcos','Marcos'),('niño','el niño'),('niña','la niña')]
for p,s in people:
 # Cada estructura combina una acción apropiada con un objeto y un lugar.
 frames=[
 ('lee','libro','sala','lee el libro'),('escribe','cuaderno','escuela','escribe en el cuaderno'),
 ('estudiar','matemática','escuela','estudia matemática'),('estudiar','sumas','escuela','resuelve las sumas'),
 ('estudiar','restas','escuela','resuelve las restas'),('estudiar','multiplicación','escuela','aprende la multiplicación'),
 ('tomar','agua','casa','toma agua'),('tomar','fresco','patio','toma fresco'),
 ('juega','bloques','sala','juega con los bloques'),('juega','rompecabezas','sala','arma el rompecabezas'),
 ('juega','robot','patio','juega con el robot'),('salta','trampolín','patio','salta en el trampolín'),
 ('recoger','juguetes','dormitorio','recoge los juguetes'),('recoger','lápiz','escuela','recoge el lápiz'),
 ('sembrar','plantas','patio','siembra las plantas'),('sembrar','flores','patio','siembra las flores'),
 ('cuidar','árbol','patio','cuida el árbol'),('cierra','puerta','casa','cierra la puerta'),
 ('abre','ventana','dormitorio','abre la ventana'),('lavarse','manos','casa','se lava las manos'),
 ('lavarse','dientes','casa','se cepilla los dientes'),('sentarse','silla','sala','se sienta en la silla'),
 ('subir','escaleras','casa','sube por las escaleras'),('bajar','escaleras','escuela','baja por las escaleras'),
 ('peinar','peine','dormitorio','se peina con el peine'),('responder','maestra','escuela','responde a la maestra'),
 ('ver','tableta','casa','mira la tableta'),('ver','computadora','escuela','mira la computadora'),
 ('ver','televisor','sala','mira el televisor')]
 for action,obj,place,complement in frames:
  series([p,action,obj],f'{s} {complement}')
  series([p,action,obj,place],f'{s} {complement} {loc(place)}')
 # Comidas humanas usuales y animales con su alimento característico.
 for food in ['pan','cereal','galletas','arroz','frijoles','pizza','sopa','manzana','banana','pera','sandía']:
  series([p,'come',food],f'{s} come {ph(food)}')
  series([p,'come',food,'mesa'],f'{s} come {ph(food)} en la mesa')
  add(6,[p,'come',food,'plato','mesa','casa','día'],f'{s} come {ph(food)} del plato en la mesa de la casa durante el día')
 # Relieve: observar desde una distancia o pasear; no tareas escolares en el valle.
 for place in ['montaña','volcán','costa','valle','llanura','playa','meseta','acantilados','golfo','península','colina','cueva','lago','catarata','río','bosque']:
  series([p,'ver',place],f'{s} observa {ph(place)}')
  series([p,'ver',place,'día'],f'{s} observa {ph(place)} durante el día')
  add(6,[p,'ver',place,'niño' if p!='niño' else 'niña','árbol','parque','día'],f'{s} observa {ph(place)} con {"el niño" if p!="niño" else "la niña"} desde el árbol cerca del parque de día')
 for item in ['camisa','pantalón','blusa','enagua','zapatos','calcetines','gorra','sombrero','bufanda']:
  series([p,item,'casa'],f'{s} usa {ph(item)} en la casa')
  add(6,[p,item,'caminar','parque','niño' if p!='niño' else 'niña','día'],f'{s} usa {ph(item)} y camina por el parque con {"el niño" if p!="niño" else "la niña"} durante el día')
 # Temas antes vacíos en el nivel avanzado, con vocabulario de apoyo de General.
 for subject in ['matemática','sumas','restas','multiplicación']:
  add(6,[p,'estudiar',subject,'cuaderno','lápiz','mesa','casa'],f'{s} estudia {ph(subject)} y escribe en el cuaderno con el lápiz en la mesa de casa')
 for utensil,food,complement in [('cuchara','sopa','come la sopa con la cuchara'),('tenedor','arroz','come el arroz con el tenedor'),('cuchillo','pan','corta el pan con el cuchillo')]:
  series([p,utensil,food],f'{s} {complement}')
  add(6,[p,utensil,food,'mesa','casa','día'],f'{s} {complement} en la mesa de la casa durante el día')
 for thing,prep in [('lavadora','al lado de'),('refrigeradora','al lado de'),('estufa','al lado de')]:
  series([thing,'casa'],f'{ph(thing)} está en la casa')
  series([thing,'casa','grande'],f'{ph(thing)} está en la casa grande')
  add(6,[p,'caminar',thing,'casa','niño' if p!='niño' else 'niña','día'],f'{s} camina al lado de {ph(thing)} en la casa con {"el niño" if p!="niño" else "la niña"} durante el día')
 for toy in ['robot','pelota','bloques','rompecabezas']:
  add(6,[p,'juega',toy,'patio','casa','niño' if p!='niño' else 'niña'],f'{s} juega con {ph(toy)} en el patio de la casa y con {"el niño" if p!="niño" else "la niña"}')
 # Dos cláusulas claras, sin rellenar con atributos arbitrarios.
 for quality,obj,text in [('suave','cama','la cama es suave'),('duro','mesa','la mesa es dura'),('corto','lápiz','el lápiz es corto'),('largo','lápiz','el lápiz es largo'),('mediano','libro','el libro es mediano'),('bajo','silla','la silla es baja'),('delgado','lápiz','el lápiz es delgado')]:
  series([quality,obj],text)
  series([p,'ver',quality,obj],f'{s} observa '+text.replace(' es ',' '))
  add(6,[quality,obj,p,'ver','dormitorio' if obj=='cama' else 'sala' if obj in ['mesa','silla'] else 'mesa','casa','día'],f'{text} y {s} lo observa en la mesa de la casa durante el día' if obj not in ['cama','mesa','silla'] else f'{text} y {s} la observa en el dormitorio de la casa durante el día' if obj=='cama' else f'{text} y {s} la observa en la sala de la casa durante el día')
 for shape,obj,desc in [('circular','plato','el plato es circular'),('cuadrado','mesa','la mesa es cuadrada'),('rectangular','mesa','la mesa es rectangular'),('triangular','bloques','los bloques son triangulares')]:
  series([shape,obj],desc)
  series([p,'ver',shape,obj],f'{s} observa '+desc.replace(' es ',' ').replace(' son ',' '))
  add(6,[p,'ver',shape,obj,'casa','niño' if p!='niño' else 'niña','día'],f'{s} observa {ph(obj)} {"triangulares" if shape=="triangular" else "cuadrada" if shape=="cuadrado" else shape} en la casa con {"el niño" if p!="niño" else "la niña"} durante el día')
 for state in ['soleado','nublado','lluvioso','caluroso','nevado']:
  if state=='nevado':
   add(6,[p,'ver','nevado','montaña','casa','ventana','día'],f'{s} observa la montaña nevada desde la ventana de la casa durante el día')
  else:
   add(6,[p,'caminar',state,'día','casa','patio'],f'{s} camina por el patio de la casa durante el día y el día está {state}' if state!='caluroso' else f'{s} camina por el patio de la casa durante el día y el ambiente está caluroso')
 for insect in ['mariposa','mariquita','mosca','saltamontes']:
  add(6,[p,'ver',insect,'ventana','casa','patio','día'],f'{s} observa {ph(insect)} desde la ventana de la casa que da al patio de día')
 for animal in ['pez','pato','rana','cocodrilo','pingüino','conejo','gato','perro']:
  # El libro permite hablar de hábitats variados sin ubicar fauna exótica en la casa.
  add(6,[p,'ver',animal,'libro','mesa','casa','día'],f'{s} observa {ph(animal)} en el libro que está en la mesa de casa de día')
 for vehicle in ['tren','taxi','camión','barco','avión','patineta','monopatín','bicicleta','carro','autobús']:
  add(6,[p,'ver',vehicle,'libro','mesa','casa','día'],f'{s} observa {ph(vehicle)} en el libro que está en la mesa de casa de día')
 add(6,[p,'ver','YouTube','tableta','casa','niño' if p!='niño' else 'niña','día'],f'{s} mira videos en YouTube en la tableta con {"el niño" if p!="niño" else "la niña"} en casa de día')
 add(6,[p,'ver','Pocoyó','televisor','casa','niño' if p!='niño' else 'niña','día'],f'{s} mira a Pocoyó en el televisor con {"el niño" if p!="niño" else "la niña"} en casa de día')
 add(6,[p,'sembrar','plantas','patio','casa','día'],f'{s} siembra las plantas en el patio de la casa y las cuida durante el día')
 add(6,[p,'reciclar','vaso','mesa','casa','día'],f'{s} recicla el vaso que está en la mesa de la casa durante el día')
 add(6,[p,'reutilizar','vaso','plantas','casa','día'],f'{s} reutiliza el vaso para regar las plantas que están en la casa durante el día')
 add(6,[p,'duerme','cama','dormitorio','casa','noche'],f'{s} duerme en la cama del dormitorio de la casa y descansa durante la noche')
for animal,food in [('conejo','zanahoria'),('conejo','lechuga'),('caballo','manzana'),('vaca','pasto'),('tortuga','lechuga')]:
 series([animal,'come'],f'{ph(animal)} come')
 series([animal,'come',food],f'{ph(animal)} come {ph(food)}')
 series([animal,'come',food,'patio'],f'{ph(animal)} come {ph(food)} en el patio')
 add(6,[animal,'come',food,'patio','casa','niño'],f'{ph(animal)} come {ph(food)} en el patio de la casa junto al niño')
for subject in ['matemática','sumas','restas','multiplicación']:
 series(['tarea',subject],f'la tarea es de {subject}')
# Apoyo para los temas con huecos en niveles intermedios.
for p,s in people:
 for quality,obj,adjective in [('suave','cama','suave'),('duro','mesa','dura'),('circular','plato','circular'),('cuadrado','mesa','cuadrada'),('rectangular','libro','rectangular'),('triangular','bloques','triangulares')]:
  series([p,obj,quality],f'{s} tiene {ph(obj)} {adjective}')
  series([p,obj,quality,'casa'],f'{s} tiene {ph(obj)} {adjective} en la casa')
 for state in ['soleado','nublado','lluvioso','caluroso']:
  series([p,'día',state],f'{s} sale en un día {state}')
 for time,activity,verb in [('día','caminar','camina'),('noche','duerme','duerme')]:
  series([p,activity,time],f'{s} {verb} de {time}')
 for animal in ['pez','pato','rana','cocodrilo','pingüino']:
  series([p,'ver',animal,'libro'],f'{s} observa {ph(animal)} en el libro')
 for relation,prep in [('al lado','al lado de'),('encima','encima de'),('debajo','debajo de'),('al frente','al frente de'),('detrás','detrás de'),('dentro','dentro de')]:
  obj='casa' if relation=='dentro' else 'mesa'
  series(['pelota',relation,obj],f'la pelota está {prep} {ph(obj)}')
  series(['pelota',relation,obj,'casa'] if obj!='casa' else ['pelota',relation,obj,'grande'],f'la pelota está {prep} {ph(obj)}'+(' en la casa' if obj!='casa' else ' grande'))
  add(6,[p,'ver','pelota',relation,obj,'casa','día'],f'{s} observa la pelota que está {prep} {ph(obj)}'+(' en la casa durante el día' if obj!='casa' else ' y la recoge durante el día'))
series(['caminar','día'],'camino durante el día')
series(['duerme','noche'],'duermo durante la noche')
series(['casa','al frente'],'la casa está al frente')
# Mantener las respuestas principales, metadatos y banco integrado sincronizados.
unique={}
for r in b['oraciones']:
 alinear_fila(r)
 key=(r['level'],canonical(r['words']))
 if key in unique:
  for ans in r.get('validAnswers',[]):
   if ans not in unique[key].setdefault('validAnswers',[]):unique[key]['validAnswers'].append(ans)
  continue
 r['categorias']=[c['id'] for c in b['categorias'] if set(r['pics'])&set(c['palabras'])]
 if r['level']>=5:r['contentWords']=[w for w in r['words'] if w not in con]
 unique[key]=r
b['oraciones']=list(unique.values())
report=dict(removed=len(removed),reasons=dict(Counter(r['reason'] for r in removed)),updated=updated,added=len(added),total=len(b['oraciones']),levels=dict(Counter(r['level'] for r in b['oraciones'])),samples=removed[:40])
reportpath=root/'tools/revision_naturalidad_general.json'
if reportpath.exists() and not removed:
 previous=json.loads(reportpath.read_text(encoding='utf-8'));report['removed']=previous['removed'];report['reasons']=previous['reasons'];report['samples']=previous['samples'];report['updated']+=previous['updated'];report['added']+=previous['added']
reportpath.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
html=app.read_text(encoding='utf-8');payload=json.dumps(b,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
html,n=re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',lambda x:x[1]+payload+x[2],html,flags=re.S);assert n==1
m['resumen']['integracion']=f"{len(b['imagenes'])} imágenes; {len(b['oraciones'])} ejercicios de seis niveles y {len(b['categorias'])} categorías."
m['oraciones_ampliadas']['total']=len(b['oraciones']);m['oraciones_ampliadas']['niveles']={str(i):sum(r['level']==i for r in b['oraciones']) for i in range(1,7)}
m['oraciones_ampliadas']['nivel6']=f"{sum(r['level']==6 for r in b['oraciones'])} oraciones largas de 15 a 18 palabras, con conectores reutilizables y palabras sobrantes configurables entre 0 y 6."
m['oraciones_ampliadas']['revision_naturalidad']='tools/revisar_naturalidad_general.py'
for path,text in [(base,json.dumps(b,ensure_ascii=False,indent=2)+'\n'),(app,html),(manpath,json.dumps(m,ensure_ascii=False,indent=2)+'\n')]:
 for i in range(3):
  try:path.write_text(text,encoding='utf-8');break
  except OSError:
   if i==2:raise
   time.sleep(.5)
print(json.dumps({k:v for k,v in report.items() if k!='samples'},ensure_ascii=False))
