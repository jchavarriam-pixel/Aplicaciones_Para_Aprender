"""Alinea la pista de observación con el orden de sus dos imágenes de referencia."""
import json,re,time
from pathlib import Path
root=Path(__file__).resolve().parents[1];base=root/'base_oraciones.json';app=root/'generador-oraciones.html'
b=json.loads(base.read_text(encoding='utf-8'));con=set(b['conectores_reutilizables']);changed=[]
for r in b['oraciones']:
 if not {'árbol','parque'}<=set(r['pics']):continue
 before=' '.join(r['words'])
 old='desde el parque cerca del árbol';new='desde el árbol cerca del parque'
 if r['pics'].index('árbol')<r['pics'].index('parque') and old in before:
  r['words']=before.replace(old,new).split()
  if r['level']>=5:r['contentWords']=[w for w in r['words'] if w not in con]
  changed.append({'before':before,'after':' '.join(r['words']),'pics':r['pics']})
html=app.read_text(encoding='utf-8');payload=json.dumps(b,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c');html,n=re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',lambda m:m[1]+payload+m[2],html,flags=re.S);assert n==1
for p,t in [(base,json.dumps(b,ensure_ascii=False,indent=2)+'\n'),(app,html)]:
 for i in range(3):
  try:p.write_text(t,encoding='utf-8');break
  except OSError:
   if i==2:raise
   time.sleep(.5)
if changed:(root/'tools/correccion_orden_pistas.json').write_text(json.dumps(changed,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'hintsAligned':len(changed)},ensure_ascii=False))
