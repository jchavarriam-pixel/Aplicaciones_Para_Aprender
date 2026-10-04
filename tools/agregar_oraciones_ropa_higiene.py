"""Frases breves de uso de prendas e higiene; conserva los ejercicios existentes."""
import json
import re
import time
from pathlib import Path
from ampliar_oraciones_topicos import canonical

root = Path(__file__).resolve().parents[1]
base = root / 'base_oraciones.json'
app = root / 'generador-oraciones.html'
db = json.loads(base.read_text(encoding='utf-8'))
before = len(db['oraciones'])
seen = {(o['level'], canonical(o['words'])) for o in db['oraciones']}
connectors = set(db['conectores_reutilizables'])
for word, category in [('gorra', 'ropa'), ('sombrero', 'ropa'), ('bufanda', 'ropa'), ('dientes', 'higiene')]:
    assert (root / db['imagenes'][word]['img']).is_file()
    cat = next(c for c in db['categorias'] if c['id'] == category)
    if word not in cat['palabras']:
        cat['palabras'].append(word)


def add(pics, text):
    pics = list(dict.fromkeys(pics))
    levels = {2: [1], 3: [2, 4], 4: [3, 4, 5, 6], 5: [3, 4, 5, 6]}[len(pics)]
    words = (text.strip().rstrip('.') + ' .').split()
    assert all(p in db['imagenes'] for p in pics)
    for level in levels:
        if level==6 and db.get('estructura_niveles_version')==2:level=5
        key = (level, canonical(words))
        if key in seen:
            continue
        seen.add(key)
        row = dict(level=level, pics=pics, words=words, source='uso_ropa_higiene_v1')
        row['categorias'] = [c['id'] for c in db['categorias'] if set(c['palabras']) & set(pics)]
        if level in [4, 6]:
            row['extras'] = [w for w in ['barco', 'confite', 'robot', 'sopa'] if w not in words and w not in pics][:2]
        if level in [5, 6]:
            row.update(mode='connectors_free', contentWords=[w for w in words if w not in connectors])
            row.setdefault('extras', [])
        db['oraciones'].append(row)


people = [('Ana', 'Ana', False), ('Juan', 'Juan', False), ('Marta', 'Marta', False),
          ('Marcos', 'Marcos', False), ('niños', 'los niños', True), ('niñas', 'las niñas', True)]
for garment, article, color in [('gorra', 'la', 'azul'), ('sombrero', 'el', 'marrón'), ('bufanda', 'la', 'roja')]:
    color_pic = 'rojo' if color == 'roja' else color
    add([garment, color_pic], f'{article} {garment} es {color}')
    for person, subject, plural in people:
        verb = 'usan' if plural else 'usa'
        add([person, garment, color_pic], f'{subject} {verb} {article} {garment} {color}')
        for place in ['casa', 'escuela', 'patio']:
            add([person, garment, place], f'{subject} {verb} {article} {garment} en {"el" if place == "patio" else "la"} {place}')
            add([person, garment, color_pic, place], f'{subject} {verb} {article} {garment} {color} en {"el" if place == "patio" else "la"} {place}')
        for item, prep in [('mesa', 'encima'), ('silla', 'al lado')]:
            add([person, 'ver', garment, prep, item], f'{subject} {"ven" if plural else "ve"} {article} {garment} {prep} de la {item}')
    if garment == 'bufanda':
        add([garment, 'suave'], 'la bufanda es suave')
        add([garment, 'largo'], 'la bufanda es larga')
        add([garment, 'corto'], 'la bufanda es corta')
        for person, subject, plural in people:
            add([person, garment, 'suave'], f'{subject} {"usan" if plural else "usa"} la bufanda suave')
            add([person, garment, 'suave', 'casa'], f'{subject} {"usan" if plural else "usa"} la bufanda suave en la casa')

# La tarjeta dientes no se confunde con boca y tiene también ejercicios muy cortos.
add(['dientes', 'blanco'], 'los dientes son blancos')
add(['lavarse', 'dientes'], 'nos lavamos los dientes')
add(['dientes', 'cepillo de dientes'], 'cepillamos los dientes con el cepillo de dientes')
for person, subject, plural in people:
    verb = 'se cepillan' if plural else 'se cepilla'
    add([person, 'lavarse', 'dientes'], f'{subject} {verb} los dientes')
    add([person, 'dientes', 'cepillo de dientes'], f'{subject} {verb} los dientes con el cepillo de dientes')
    add([person, 'lavarse', 'dientes', 'cepillo de dientes'], f'{subject} {verb} los dientes con el cepillo de dientes')
    add([person, 'lavarse', 'dientes', 'casa'], f'{subject} {verb} los dientes en la casa')
    add([person, 'lavarse', 'dientes', 'cepillo de dientes', 'casa'], f'{subject} {verb} los dientes con el cepillo de dientes en la casa')


def write_retry(path, text):
    # OneDrive puede mantener un bloqueo breve mientras sincroniza el archivo.
    for attempt in range(3):
        try:
            path.write_text(text, encoding='utf-8')
            return
        except OSError:
            if attempt == 2:
                raise
            time.sleep(.5)


write_retry(base, json.dumps(db, ensure_ascii=False, indent=2) + '\n')
html = app.read_text(encoding='utf-8')
payload = json.dumps(db, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
html, count = re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)', lambda m: m[1] + payload + m[2], html, flags=re.S)
assert count == 1
html = html.replace("'tiene']);", "'tiene','usa','usan','cepilla','cepillan','cepillamos','lavamos']);")
write_retry(app, html)
print(json.dumps(dict(nuevas=len(db['oraciones'])-before, total=len(db['oraciones']), anteriores_conservadas=before)))
