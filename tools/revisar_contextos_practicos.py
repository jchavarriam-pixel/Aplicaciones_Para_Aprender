"""Sustituye contextos poco cotidianos por acciones claras para niños."""
import json
import re
import time
from pathlib import Path

root=Path(__file__).resolve().parents[1]
base=root/'base_oraciones.json'
app=root/'generador-oraciones.html'
db=json.loads(base.read_text(encoding='utf-8'))
people=set(next(c for c in db['categorias'] if c['id']=='personas')['palabras'])
terrain={'valle':'el','llanura':'la','bosque':'el','costa':'la'}
play_places={'valle':'patio','llanura':'cancha','bosque':'parque','costa':'casa'}
if 'por' not in db['conectores_reutilizables']:
    db['conectores_reutilizables'].append('por')
connectors=set(db['conectores_reutilizables'])
changed=[]
for row in db['oraciones']:
    person=next((p for p in row['pics'] if p in people),None)
    place=next((p for p in row['pics'] if p in terrain),None)
    if person and place and any(a in row['pics'] for a in ['lee','escribe','juega']):
        action=next(a for a in ['lee','escribe','juega'] if a in row['pics'])
        old=' '.join(row['words'])
        if action in ['lee','escribe']:
            verb_index=next(i for i,w in enumerate(row['words']) if w.lower() in ['lee','leen','escribe','escriben'])
            subject=' '.join(row['words'][:verb_index])
            plural=person in ['niños','niñas']
            verb='caminan' if plural else 'camina'
            weather='día' if action=='escribe' else 'soleado'
            ending='de día' if weather=='día' else 'en un día soleado'
            row['pics']=[person,'caminar',weather,place]
            text=f'{subject} {verb} por {terrain[place]} {place} {ending}'
            row['words']=(text+' .').split()
            row['validAnswers']=[(text.replace(' por ',' en ',1)+' .').split()]
        else:
            new_place=play_places[place]
            row['pics']=[new_place if p==place else p for p in row['pics']]
            text=' '.join(row['words']).replace('en '+terrain[place]+' '+place,'en '+('el' if new_place in ['patio','parque'] else 'la')+' '+new_place)
            row['words']=text.split()
            row.pop('validAnswers',None)
        row['source']='contextos_practicos_v1'
        row['categorias']=[c['id'] for c in db['categorias'] if set(row['pics']) & set(c['palabras'])]
        changed.append({'antes':old,'despues':' '.join(row['words']),'nivel':row['level']})
    if row['level']>=5:
        row['contentWords']=[w for w in row['words'] if w not in connectors]

def save(path,text):
    for attempt in range(3):
        try:path.write_text(text,encoding='utf-8');return
        except OSError:
            if attempt==2:raise
            time.sleep(.5)

save(base,json.dumps(db,ensure_ascii=False,indent=2)+'\n')
html=app.read_text(encoding='utf-8')
html=html.replace("'son','en','con'];", "'son','en','con','por'];",1)
payload=json.dumps(db,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
html,n=re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',lambda m:m[1]+payload+m[2],html,flags=re.S)
assert n==1
save(app,html)
report=root/'tools/revision_contextos_practicos.json'
save(report,json.dumps({'criterios':['Leer, escribir y estudiar en espacios cotidianos','Caminar por espacios naturales de día','Jugar con pelota en patio, parque, cancha o casa','En y por válidos en las nuevas frases de caminar'],'cambios':changed},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'revisadas':len(db['oraciones']),'corregidas':len(changed),'total_conservado':len(db['oraciones'])}))
