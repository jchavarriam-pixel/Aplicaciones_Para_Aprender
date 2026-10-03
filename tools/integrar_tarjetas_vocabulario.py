"""Registra las tarjetas terminadas en la base externa y en el HTML local."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
base = root / 'base_oraciones.json'
app = root / 'generador-oraciones.html'
db = json.loads(base.read_text(encoding='utf-8'))
manifest = json.loads((root / 'ImagenesGeneradorOraciones/ampliacion_vocabulario.json').read_text(encoding='utf-8'))
definitions = {c['id']: c for c in db['categorias']}
for key, label, emoji in [('generales', 'Día y noche', '🌙'), ('bebidas', 'Bebidas', '🥤')]:
    if key not in definitions:
        category = dict(id=key, label=label, emoji=emoji, palabras=[])
        db['categorias'].append(category)
        definitions[key] = category
definitions['colores']['label'] = 'Colores, tamaños y formas'
added = []
for card in manifest['cards']:
    if card['status'] not in ('generated', 'existing'):
        continue
    word = card['word']
    path = root / 'ImagenesGeneradorOraciones' / card['file']
    assert path.is_file(), path
    if word not in db['imagenes']:
        added.append(word)
    db['imagenes'][word] = dict(label=word, img='ImagenesGeneradorOraciones/' + card['file'])
    for category_id in card['categories']:
        category = definitions[category_id]
        if word not in category['palabras']:
            category['palabras'].append(word)
for row in db['oraciones']:
    row['categorias'] = [c['id'] for c in db['categorias'] if set(c['palabras']) & set(row['pics'])]
base.write_text(json.dumps(db, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
html = app.read_text(encoding='utf-8')
payload = json.dumps(db, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
html, count = re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)', lambda m: m[1] + payload + m[2], html, flags=re.S)
assert count == 1
app.write_text(html, encoding='utf-8')
print(json.dumps(dict(new=len(added), images=len(db['imagenes']), categories=len(db['categorias'])), ensure_ascii=True))
