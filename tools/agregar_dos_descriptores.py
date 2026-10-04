"""Dos atributos compatibles por objeto, con orden alternativo y concordancia."""
import json,re,time
from collections import Counter
from pathlib import Path
from ampliar_oraciones_topicos import canonical
root=Path(__file__).resolve().parents[1];base=root/'base_oraciones.json';app=root/'generador-oraciones.html'
b=json.loads(base.read_text(encoding='utf-8'));con=set(b['conectores_reutilizables']);seen={(r['level'],canonical(r['words'])) for r in b['oraciones']};added=[]
def adj(w,f=False,pl=False):
 if w in ['azul','gris']:return w+('es' if pl else '')
 if w in ['circular','rectangular']:return w+('es' if pl else '')
 return (w[:-1]+'a' if f and w.endswith('o') else w)+('s' if pl else '')
def add(level,pics,text,alternatives):
 words=(text+' .').split();key=(level,canonical(words))
 if key in seen:return
 pics=list(dict.fromkeys(pics));assert all(p in b['imagenes'] for p in pics)
 if level==6:assert 6<=len(pics)<=8
 row=dict(level=level,pics=pics,words=words,source='dos_descriptores_v1')
 if level>=5:
  row.update(mode='connectors_free',extras=[],contentWords=[w for w in words if w not in con])
  row['validAnswers']=[(a+' .').split() for a in dict.fromkeys(alternatives) if a!=text]
 elif level==4:row['extras']=[w for w in ['cohete','sombrilla','gato','camión','nube'] if w not in pics and w not in words][:2]
 row['categorias']=[c['id'] for c in b['categorias'] if set(pics)&set(c['palabras'])]
 seen.add(key);b['oraciones'].append(row);added.append(row)
def middle(pics,text,alts):
 for l in [3,4,5]:add(l,pics,text,alts)
people=[(n,n,n in ['Marta','Ana'],False) for n in ['Manuel','Juan','Marta','Ana','Marcos']]+[('niño','el niño',False,False),('niña','la niña',True,False),('niños','los niños',False,True),('niñas','las niñas',True,True)]
for p,s,f,pl in people:
 for obj,article in [('sofá','el'),('silla','la')]:
  state='están' if pl else 'está';posture=adj('sentado',f,pl)
  for size in ['grande','pequeño']:
   for color in ['amarillo','azul','rojo','verde']:
    a=adj(size,article=='la');c=adj(color,article=='la')
    prefix=f'{s} {state} {posture} en {article} {obj}'
    variants=[f'{prefix} {a} y {c}',f'{prefix} {c} y {a}',f'{prefix} {a} {c}',f'{prefix} {c} {a}']
    middle([p,'sentarse',obj,size,color],variants[0],variants[1:])
    add(6,[p,'sentarse',obj,size,color,'casa'],variants[0]+' de la casa',[t+ending for t in variants for ending in [' de la casa',' en la casa']])
 for obj,article,fem,plural in [('pelota','la',True,False),('robot','el',False,False),('bloques','los',False,True)]:
  verb='juegan' if pl else 'juega'
  for size in ['grande','pequeño']:
   for color in ['amarillo','azul','rojo','verde']:
    a=adj(size,fem,plural);c=adj(color,fem,plural);prefix=f'{s} {verb} con {article} {obj}'
    variants=[f'{prefix} {a} y {c}',f'{prefix} {c} y {a}',f'{prefix} {a} {c}',f'{prefix} {c} {a}']
    middle([p,'juega',obj,size,color],variants[0],variants[1:])
    add(6,[p,'juega',obj,size,color,'patio'],variants[0]+' en el patio',[t+' en el patio' for t in variants[1:]])
 # Tamaño y forma, sin atribuir formas abstractas a personas o paisajes.
 for obj,article,shape in [('plato','el','circular'),('libro','el','rectangular'),('mesa','la','cuadrado')]:
  for size in ['grande','pequeño']:
   a=adj(size,article=='la');c=adj(shape,article=='la');see='observan' if pl else 'observa'
   prefix=f'{s} {see} {article} {obj}'
   variants=[f'{prefix} {a} y {c}',f'{prefix} {c} y {a}',f'{prefix} {a} {c}',f'{prefix} {c} {a}']
   middle([p,'ver',obj,size,shape],variants[0],variants[1:])
   add(6,[p,'ver',obj,size,shape,'casa'],variants[0]+' en la casa',[t+' en la casa' for t in variants[1:]])
# Pocas estructuras simples para aprender primero la pareja de descriptores.
for obj,article,shape in [('plato','el','circular'),('libro','el','rectangular'),('mesa','la','cuadrado')]:
 for size in ['grande','pequeño']:
  a=adj(size,article=='la');c=adj(shape,article=='la');add(2,[obj,size,shape],f'{article} {obj} es {a} y {c}',[])
report=dict(new=len(added),levels=dict(Counter(r['level'] for r in added)),total=len(b['oraciones']))
if added:(root/'tools/ampliacion_dos_descriptores.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
mfile=root/'ImagenesGeneradorOraciones/ampliacion_vocabulario.json';m=json.loads(mfile.read_text(encoding='utf-8'));m['resumen']['integracion']=f"{len(b['imagenes'])} imágenes; {len(b['oraciones'])} ejercicios de seis niveles y {len(b['categorias'])} categorías."
m['oraciones_ampliadas']['total']=len(b['oraciones']);m['oraciones_ampliadas']['niveles']={str(i):sum(r['level']==i for r in b['oraciones']) for i in range(1,7)};m['oraciones_ampliadas']['dos_descriptores']='tools/agregar_dos_descriptores.py'
html=app.read_text(encoding='utf-8');payload=json.dumps(b,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c');html,n=re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',lambda x:x[1]+payload+x[2],html,flags=re.S);assert n==1
for p,t in [(base,json.dumps(b,ensure_ascii=False,indent=2)+'\n'),(app,html),(mfile,json.dumps(m,ensure_ascii=False,indent=2)+'\n')]:
 for i in range(3):
  try:p.write_text(t,encoding='utf-8');break
  except OSError:
   if i==2:raise
   time.sleep(.5)
print(json.dumps(report,ensure_ascii=False))
