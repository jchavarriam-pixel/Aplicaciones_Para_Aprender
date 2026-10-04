"""Audita el orden de imágenes mediante sus palabras y formas verbales explícitas."""
import json,re,unicodedata
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
ALIASES={
 'abre':['abre','abren','abrimos'],'come':['come','comen','comemos'],'corre':['corre','corren','corremos'],
 'duerme':['duerme','duermen','duermo','dormimos'],'escribe':['escribe','escriben','escribimos'],
 'juega':['juega','juegan','jugamos','arma','arman'],'lee':['lee','leen','leemos'],
 'pregunta':['pregunta','preguntan','preguntamos'],'salta':['salta','saltan','saltamos'],
 'ver':['ve','ven','vemos','observa','observan','mira','miran'],
 'cuidar':['cuida','cuidan','cuidamos'],'recoger basura':['recoge','recogen','recogemos'],
 'botar basura':['bota','botan','botamos'],'contaminar el agua':['contamina','contaminan','contaminamos'],
 'cortar árboles':['corta','cortan','cortamos'],'sembrar':['siembra','siembran','sembramos'],
 'recoger':['recoge','recogen','recogemos'],'estudiar':['estudia','estudian','estudiamos','resuelve','resuelven','aprende','aprenden'],
 'cierra':['cierra','cierran','cerramos'],'sentarse':['sienta','sientan','sentado','sentada','sentados','sentadas'],
 'pararse':['pone de pie','ponen de pie'],'subir':['sube','suben'],'bajar':['baja','bajan'],
 'responder':['responde','responden'],'pensar':['piensa','piensan'],'tomar':['toma','toman'],
 'reciclar':['recicla','reciclan','reciclar'],'reutilizar':['reutiliza','reutilizan'],
 'caminar':['camina','caminan','camino','caminamos'],'peinar':['peina','peinan'],
 'lavarse':['lava','lavan','lavamos','cepilla','cepillan','cepillamos'],
 'caluroso':['caluroso','calurosa','calurosos','calurosas','caliente'],
 'nevado':['nevado','nevada','nevados','nevadas'],'día lluvioso':['día lluvioso'],
 'super mercado':['supermercado','super mercado'],'al lado':['al lado','a el lado'],
 'al frente':['al frente','a el frente'],
}
ADJECTIVES={'alto','amarillo','azul','grande','multicolor','negro','pequeño','púrpura','rojo','verde','gris','blanco','marrón','rosado','mediano','corto','largo','bajo','gordo','delgado','circular','cuadrado','rectangular','triangular','plano','ondulado','suave','duro','soleado','nublado','lluvioso'}
def tokens(words):
 text=unicodedata.normalize('NFC',' '.join(words).lower())
 return re.sub(r'\ba el\b','al',re.sub(r'\bde el\b','del',text)).split()
def forms(key):
 k=key.lower()
 if k in ALIASES:return ALIASES[k]+[k]
 if k in ADJECTIVES:
  if k in ['azul','gris','multicolor','circular','rectangular','triangular']:return [k,k+'es']
  if k=='marrón':return [k,'marrones']
  if k.endswith('o'):return [k,k[:-1]+'a',k+'s',k[:-1]+'as']
  return [k,k+'s']
 if ' ' in k or k in ['niña','niño','niñas','niños'] or key[:1].isupper():return [k]
 return [k,k+'s' if k.endswith(('a','e','i','o','u')) else k+'es']
def position(pic,words):
 ts=tokens(words);matches=[]
 for variant in forms(pic):
  part=variant.split()
  for i in range(len(ts)-len(part)+1):
   if ts[i:i+len(part)]==part:matches.append(i)
 return min(matches) if matches else None
def inversions(pics,words):
 ps=[position(p,words) for p in pics];known=[p for p in ps if p is not None]
 return sum(a>b for i,a in enumerate(known) for b in known[i+1:]),ps
def alinear_fila(row):
 changes=[]
 # Las relaciones espaciales explícitas también requieren su pictograma.
 if position('al lado',row['words']) is not None and 'al lado' not in row['pics']:
  pos=position('al lado',row['words'])
  at=next((i for i,p in enumerate(row['pics']) if position(p,row['words']) is not None and position(p,row['words'])>pos),len(row['pics']))
  row['pics'].insert(at,'al lado');changes.append('pictograma_al_lado')
  if row['level']==2 and len(row['pics'])==4:
   row['level']=3;changes.append('nivel_por_numero_de_imagenes')
 # Correcciones verificadas: una tilde plural y dos imágenes sobrantes en plantillas.
 for words in [row['words'],*row.get('validAnswers',[])]:
  for i,w in enumerate(words):
   if w=='marrónes':words[i]='marrones';changes.append('ortografia')
 text=' '.join(row['words'])
 before=row['pics'][:]
 if text=='la mesa es dura .' and row['level']==1:row['pics']=[p for p in row['pics'] if p!='sala']
 if row.get('source')=='general_situaciones_v1' and text.startswith('la silla es baja y ') and 'en la sala de la casa' in text:row['pics']=[p for p in row['pics'] if p!='mesa']
 if before!=row['pics']:changes.append('imagen_sobrante')
 score,ps=inversions(row['pics'],row['words'])
 if score:
  candidates=[row['words'],*row.get('validAnswers',[])]
  best=min(candidates,key=lambda words:inversions(row['pics'],words)[0])
  if best!=row['words']:
   original=row['words'];row['words']=best[:]
   row['validAnswers']=[a for a in row.get('validAnswers',[]) if a!=best]
   if original not in row['validAnswers']:row['validAnswers'].append(original)
   changes.append('pista_equivalente')
  remaining,ps=inversions(row['pics'],row['words'])
  if remaining:
   if any(pos is None for pos in ps):raise ValueError(('Imagen sin correspondencia',row,ps))
   row['pics']=[p for _,p in sorted(zip(ps,row['pics']),key=lambda x:x[0])]
   changes.append('orden_imagenes')
 return changes
if __name__=='__main__':
 import sys,time
 apply='--apply' in sys.argv
 b=json.loads((ROOT/'base_oraciones.json').read_text(encoding='utf-8'));issues=[];missing=Counter();changes=[]
 for r in b['oraciones']:
  if apply:
   before={'words':r['words'][:],'pics':r['pics'][:]}
   edits=alinear_fila(r)
   if edits:changes.append({'level':r['level'],'changes':edits,'before':before,'after':{'words':r['words'][:],'pics':r['pics'][:]}})
  inv,ps=inversions(r['pics'],r['words'])
  if inv:issues.append((r,ps))
  for p,v in zip(r['pics'],ps):
   if v is None:missing[p]+=1
 if apply:
  assert not issues and not missing,(issues[:1],missing)
  con=set(b['conectores_reutilizables'])
  for r in b['oraciones']:
   r['categorias']=[c['id'] for c in b['categorias'] if set(r['pics'])&set(c['palabras'])]
   if r['level']>=5:r['contentWords']=[w for w in r['words'] if w not in con]
  htmlpath=ROOT/'generador-oraciones.html';html=htmlpath.read_text(encoding='utf-8')
  payload=json.dumps(b,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
  html,n=re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',lambda m:m[1]+payload+m[2],html,flags=re.S);assert n==1
  for path,text in [(ROOT/'base_oraciones.json',json.dumps(b,ensure_ascii=False,indent=2)+'\n'),(htmlpath,html)]:
   for i in range(3):
    try:path.write_text(text,encoding='utf-8');break
    except OSError:
     if i==2:raise
     time.sleep(.5)
  report={'checked':len(b['oraciones']),'corrected':len(changes),'changes':dict(Counter(k for row in changes for k in row['changes'])),'remainingOrderMismatches':len(issues),'unmatchedImages':dict(missing),'details':changes}
  if changes:(ROOT/'tools/revision_orden_pistas.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  print(json.dumps({k:v for k,v in report.items() if k!='details'},ensure_ascii=False))
 else:
  print('MISMATCHES',len(issues),'BY_SOURCE',Counter(r.get('source','original') for r,ps in issues))
  print('UNMAPPED',missing)
  for r,ps in issues[:10]:print(json.dumps({'text':' '.join(r['words']),'pics':r['pics'],'positions':ps},ensure_ascii=False))
