"""Une los bancos de conectores y crea un nivel avanzado de situaciones cotidianas."""
import json
import re
import time
from pathlib import Path
from ampliar_oraciones_topicos import canonical, NOUNS

root=Path(__file__).resolve().parents[1]
base=root/'base_oraciones.json';app=root/'generador-oraciones.html'
db=json.loads(base.read_text(encoding='utf-8'))
assert db.get('estructura_niveles_version',1)==1,'La nueva estructura ya está instalada'
manifest=json.loads((root/'ImagenesGeneradorOraciones/ampliacion_vocabulario.json').read_text(encoding='utf-8'))
nouns=dict(NOUNS)
for c in manifest['cards']:
    if c.get('article'):nouns[c['word']]=(c['article'],c['gender'])
nouns.update({'sopa':('la','f'),'hamburguesa':('la','f'),'zanahoria':('la','f'),'frutas':('las','fp'),'verduras':('las','fp'),'juguetes':('los','mp'),'cama':('la','f'),'mesa':('la','f'),'silla':('la','f'),'sofá':('el','m')})
def phrase(n):return nouns[n][0]+' '+n
def loc(n,prep='en'):return (prep+' '+phrase(n)).replace('de el ','del ')
merged=[];seen={}
for r in db['oraciones']:
    if r['level'] not in [5,6]:merged.append(r);continue
    key=(tuple(r['words']),tuple(r['pics']))
    if key in seen:
        existing=seen[key]
        for a in r.get('validAnswers',[]):
            if a not in existing.setdefault('validAnswers',[]):existing['validAnswers'].append(a)
        continue
    r.update(level=5,extras=[])
    seen[key]=r;merged.append(r)
db['oraciones']=merged
if 'y' not in db['conectores_reutilizables']:db['conectores_reutilizables'].append('y')
connectors=set(db['conectores_reutilizables'])
seen_long=set()
def add(pics,text):
    pics=list(dict.fromkeys(pics));words=(text.strip().rstrip('.')+' .').split()
    if len(words)<16:
        assert 'día' not in pics and 'soleado' not in pics,text
        text+=' durante el día';pics.append('día');words=(text+' .').split()
    assert 16<=len(words)<=30,(len(words),text)
    assert 6<=len(pics)<=8,(pics,text)
    assert all(p in db['imagenes'] for p in pics),pics
    key=canonical(words)
    if key in seen_long:return
    seen_long.add(key)
    row=dict(level=6,pics=pics,words=words,mode='connectors_free',extras=[],contentWords=[w for w in words if w not in connectors],source='oraciones_largas_v1')
    row['categorias']=[c['id'] for c in db['categorias'] if set(pics)&set(c['palabras'])]
    db['oraciones'].append(row)

people=[(n,n,False) for n in ['Ana','Carlos','Daniel','Jimena','Juan','Manuel','Marta','Marcos','Pocoyó']]
people += [('niño','el niño',False),('niña','la niña',False),('niños','los niños',True),('niñas','las niñas',True)]
foods=next(c['palabras'] for c in db['categorias'] if c['id']=='alimentos')
for p,s,plural in people:
    eat='comen' if plural else 'come';walk='caminan' if plural else 'camina';see='ven' if plural else 've'
    for food in foods:
        if food in ['agua','fresco']:continue
        utensil='cuchara' if food in ['sopa','cereal'] else 'tenedor' if food in ['arroz','frijoles','carne','espagueti','verduras','lechuga'] else 'manos'
        for place in ['patio','sala']:
            add([p,'come',food,utensil,place,'casa'],f'{s} {eat} {phrase(food)} con {phrase(utensil)} {loc(place)} de la casa')
    for drink in ['agua','fresco']:
        add([p,'tomar',drink,'vaso','patio','casa','día'],f'{s} {"toman" if plural else "toma"} {phrase(drink)} en el vaso en el patio de la casa de día')
    for place in ['valle','llanura','bosque','costa','colina']:
        for adult in ['señor','señora']:
            add([p,'caminar',place,adult,'plantas','día','soleado'],f'{s} {walk} {loc(place,"por")} con {phrase(adult)} para observar las plantas en un día soleado')
    for activity,obj in [('lee','libro'),('escribe','cuaderno')]:
        verb=('leen' if plural else 'lee') if activity=='lee' else ('escriben' if plural else 'escribe')
        text=f'{s} {verb} '+('en ' if activity=='escribe' else '')+phrase(obj)
        add([p,activity,obj,'mesa','sala','casa'],text+' en la mesa de la sala de la casa')
    for subject in ['matemática','sumas','restas','multiplicación']:
        add([p,'estudiar',subject,'libro','pupitre','escuela'],f'{s} {"estudian" if plural else "estudia"} {phrase(subject)} con el libro en el pupitre de la escuela')
    for obj in ['pelota','bloques','rompecabezas','robot','juguetes']:
        add([p,'juega',obj,'niño','patio','casa'] if p!='niño' else [p,'juega',obj,'niña','patio','casa'],f'{s} {"juegan" if plural else "juega"} con {phrase(obj)} y con {"la niña" if p=="niño" else "el niño"} en el patio de la casa')
    for garment,color in [('gorra','azul'),('sombrero','marrón'),('bufanda','rojo'),('camisa','azul'),('blusa','rosado'),('enagua','púrpura')]:
        a='roja' if color=='rojo' else 'rosada' if color=='rosado' else color
        add([p,garment,color,'caminar','patio','casa'],f'{s} {"usan" if plural else "usa"} {phrase(garment)} {a} y {walk} por el patio de la casa')
    for part,tool,place in [('dientes','cepillo de dientes','lavamanos'),('manos','agua','lavamanos'),('pies','agua','ducha')]:
        verb='se cepillan' if plural else 'se cepilla'
        if part!='dientes':verb='se lavan' if plural else 'se lava'
        add([p,'lavarse',part,tool,place,'casa'],f'{s} {verb} {phrase(part)} con {phrase(tool)} {loc(place)} de la casa')
    add([p,'peinar','peine','gel','dormitorio','casa'],f'{s} {"se peinan" if plural else "se peina"} con el peine y usa gel en el dormitorio de la casa' if not plural else f'{s} se peinan con el peine y usan gel en el dormitorio de la casa')
    for action in ['abre','cierra']:
        verb=('abren' if plural else 'abre') if action=='abre' else ('cierran' if plural else 'cierra')
        add([p,action,'puerta','dormitorio','caminar','sala','casa'],f'{s} {verb} la puerta del dormitorio y {walk} por la sala de la casa')
    add([p,'recoger basura','basura','basurero','patio','casa'],f'{s} {"recogen" if plural else "recoge"} la basura y {"la ponen" if plural else "la pone"} en el basurero del patio de la casa')
    add([p,'sembrar','plantas','suelo','patio','casa'],f'{s} {"siembran" if plural else "siembra"} las plantas en el suelo del patio de la casa durante el día')
    for a,b,habitat in [('jirafa','cebra','llanura'),('pato','pez','lago'),('rana','cocodrilo','río'),('mono','tucán','bosque'),('mariposa','mariquita','plantas')]:
        add([p,'ver',a,b,habitat,'señor','día','soleado'],f'{s} {see} {phrase(a)} y {phrase(b)} {loc(habitat)} con el señor en un día soleado')

for obj,other in [('lavadora','lavamanos'),('refrigeradora','estufa'),('servicio sanitario','lavamanos'),('televisor','sofá'),('cama','ventana')]:
    for floor in ['primer piso','segundo piso']:
        add([obj,'al lado',other,floor,'casa','grande'],f'{phrase(obj)} está al lado {loc(other,"de")} en el {floor} de la casa grande')
for r in db['oraciones']:
    if r['level']>=5:r['contentWords']=[w for w in r['words'] if w not in connectors]
db['estructura_niveles_version']=2
def save(p,text):
    for i in range(3):
        try:p.write_text(text,encoding='utf-8');return
        except OSError:
            if i==2:raise
            time.sleep(.5)
save(base,json.dumps(db,ensure_ascii=False,indent=2)+'\n')
html=app.read_text(encoding='utf-8').replace("'su','sus'];","'su','sus','y'];",1)
payload=json.dumps(db,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
html,n=re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',lambda m:m[1]+payload+m[2],html,flags=re.S);assert n==1
save(app,html)
print(json.dumps({'nivel5_unificado':sum(r['level']==5 for r in db['oraciones']),'nivel6_largo':len(seen_long),'palabras_nivel6':[min(len(r['words']) for r in db['oraciones'] if r['level']==6),max(len(r['words']) for r in db['oraciones'] if r['level']==6)]}))
