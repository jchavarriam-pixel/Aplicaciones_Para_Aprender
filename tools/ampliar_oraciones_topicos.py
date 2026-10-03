"""Amplía la base mediante plantillas revisadas y sincroniza la copia local del HTML.

Se puede ejecutar de nuevo: conserva las oraciones existentes y evita duplicados
por nivel y respuesta principal. No produce combinaciones arbitrarias de palabras.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'base_oraciones.json'
HTML = ROOT / 'generador-oraciones.html'

CATEGORIES = [
    ('relieve', 'Formas de relieve', '⛰️', 'montaña|volcán|costa|valle|llanura'),
    ('lugares', 'Lugares y construcciones', '🏡', 'casa|escuela|iglesia|edificio|parque|cancha|super mercado|puente|carretera|campo de cultivo|zona ganadera|bosque|río|playa|catarata|montaña|volcán|costa|valle|llanura'),
    ('naturaleza', 'Naturaleza', '🌿', 'árbol|flores|bosque|río|playa|catarata|agua|aire|suelo|arena|plantas|pasto'),
    ('animales', 'Animales', '🐾', 'perro|gato|conejo|caballo|mono|tucán|jaguar|venado|vaca|mariposa'),
    ('ambiente', 'Cuidado del ambiente', '♻️', 'basura|basurero|cuidar|recoger basura|botar basura|contaminar el agua|cortar árboles'),
    ('personas', 'Personas', '😊', 'Ana|Carlos|Daniel|Jimena|Juan|Manuel|Marta|niño|niña'),
    ('alimentos', 'Alimentos', '🥕', 'hamburguesa|frutas|verduras|zanahoria|sopa'),
    ('transportes', 'Transportes', '🚌', 'carro|bicicleta|barco|avión|autobús|cohete'),
    ('hogar', 'Objetos del hogar', '🪑', 'cama|mesa|silla|sofá|sombrilla'),
    ('juegos', 'Juegos', '⚽', 'pelota|juguetes|columpio|tobogán|globos'),
    ('lectura', 'Lectura y escritura', '📚', 'libro|cuaderno|lee|escribe'),
    ('colores', 'Colores y tamaños', '🎨', 'amarillo|azul|rojo|verde|negro|púrpura|multicolor|alto|grande|pequeño'),
    ('acciones', 'Acciones', '🏃', 'abre|come|corre|duerme|escribe|juega|lee|pregunta|salta|ver|cuidar|recoger basura|botar basura|contaminar el agua|cortar árboles'),
    ('ubicacion', 'Ubicación', '↔️', 'al lado|encima|debajo'),
    ('clima', 'Clima', '☀️', 'caluroso|lluvioso|día lluvioso'),
]

NEW_IMAGES = {
    'bosque': 'bosque', 'montaña': 'montana', 'volcán': 'volcan',
    'catarata': 'catarata', 'costa': 'costa', 'valle': 'valle', 'llanura': 'llanura',
    'puente': 'puente', 'carretera': 'carretera', 'campo de cultivo': 'campo_de_cultivo',
    'zona ganadera': 'zona_ganadera', 'agua': 'agua', 'aire': 'aire', 'suelo': 'suelo',
    'arena': 'arena', 'plantas': 'plantas', 'pasto': 'pasto', 'mono': 'mono',
    'tucán': 'tucan', 'jaguar': 'jaguar', 'venado': 'venado', 'vaca': 'vaca',
    'mariposa': 'mariposa', 'basura': 'basura', 'basurero': 'basurero',
    'cuidar': 'cuidar', 'recoger basura': 'recoger_basura', 'botar basura': 'botar_basura',
    'contaminar el agua': 'contaminar_el_agua', 'cortar árboles': 'cortar_arboles',
}

# Artículo y concordancia para cada sustantivo utilizado en las plantillas.
NOUNS = {
    'bosque': ('el', 'm'), 'montaña': ('la', 'f'), 'volcán': ('el', 'm'),
    'catarata': ('la', 'f'), 'costa': ('la', 'f'), 'valle': ('el', 'm'),
    'llanura': ('la', 'f'), 'puente': ('el', 'm'), 'carretera': ('la', 'f'),
    'campo de cultivo': ('el', 'm'), 'zona ganadera': ('la', 'f'),
    'agua': ('el', 'f'), 'aire': ('el', 'm'), 'suelo': ('el', 'm'),
    'arena': ('la', 'f'), 'plantas': ('las', 'fp'), 'pasto': ('el', 'm'),
    'mono': ('el', 'm'), 'tucán': ('el', 'm'), 'jaguar': ('el', 'm'),
    'venado': ('el', 'm'), 'vaca': ('la', 'f'), 'mariposa': ('la', 'f'),
    'basura': ('la', 'f'), 'basurero': ('el', 'm'),
    'árbol': ('el', 'm'), 'flores': ('las', 'fp'), 'río': ('el', 'm'),
    'playa': ('la', 'f'), 'parque': ('el', 'm'), 'casa': ('la', 'f'),
    'escuela': ('la', 'f'), 'iglesia': ('la', 'f'), 'edificio': ('el', 'm'),
    'cancha': ('la', 'f'), 'perro': ('el', 'm'), 'gato': ('el', 'm'),
    'conejo': ('el', 'm'), 'caballo': ('el', 'm'), 'libro': ('el', 'm'),
    'cuaderno': ('el', 'm'), 'pelota': ('la', 'f'), 'carro': ('el', 'm'),
    'bicicleta': ('la', 'f'), 'barco': ('el', 'm'),
}


def canonical(words):
    return ' '.join(words).lower().replace('de el', 'del').replace('a el', 'al').replace(' .', '.')


def phrase(noun):
    return f'{NOUNS[noun][0]} {noun}'


def location(noun, prep='en'):
    return f'{prep} {phrase(noun)}'.replace('de el ', 'del ').replace('a el ', 'al ')


def adjective(noun, adj):
    kind = NOUNS[noun][1]
    forms = {
        'pequeño': ('pequeño', 'pequeña', 'pequeños', 'pequeñas'),
        'alto': ('alto', 'alta', 'altos', 'altas'),
        'rojo': ('rojo', 'roja', 'rojos', 'rojas'),
        'negro': ('negro', 'negra', 'negros', 'negras'),
        'amarillo': ('amarillo', 'amarilla', 'amarillos', 'amarillas'),
    }
    index = {'m': 0, 'f': 1, 'mp': 2, 'fp': 3}[kind]
    return forms[adj][index] if adj in forms else adj + ('s' if kind.endswith('p') else '')


def main():
    db = json.loads(BASE.read_text(encoding='utf-8-sig'))
    previous = len(db['oraciones'])
    for word, filename in NEW_IMAGES.items():
        path = f'ImagenesGeneradorOraciones/{filename}.png'
        assert (ROOT / path).is_file(), path
        db['imagenes'][word] = {'label': word, 'img': path}
    categories = [{'id': key, 'label': label, 'emoji': emoji, 'palabras': words.split('|')}
                  for key, label, emoji, words in CATEGORIES]
    assert set(db['imagenes']) <= {w for c in categories for w in c['palabras']}
    db['categorias'] = categories
    connectors = set(db['conectores_reutilizables'])
    seen = {(row['level'], canonical(row['words'])) for row in db['oraciones']}

    def add(level, pics, text):
        pics = list(dict.fromkeys(pics))
        expected = {1: (2,), 2: (3,), 3: (4, 5), 4: (3, 4, 5), 5: (4, 5), 6: (4, 5)}
        assert len(pics) in expected[level], (level, pics, text)
        assert all(p in db['imagenes'] for p in pics), pics
        words = (text.rstrip('.').strip() + ' .').split()
        key = (level, canonical(words))
        if key in seen:
            return
        seen.add(key)
        row = {'level': level, 'pics': pics, 'words': words}
        if level in (4, 6):
            forbidden = set(words) | set(pics) | connectors
            row['extras'] = [k for k in db['imagenes'] if k not in forbidden and ' ' not in k][:2]
        if level in (5, 6):
            row.update(mode='connectors_free', contentWords=[w for w in words if w not in connectors])
            row.setdefault('extras', [])
        db['oraciones'].append(row)

    def simple(pics, text):
        add(2, pics, text)
        add(4, pics, text)

    def detailed(pics, text):
        for level in (3, 4, 5, 6):
            add(level, pics, text)

    people = [('Ana', 'Ana'), ('Carlos', 'Carlos'), ('Daniel', 'Daniel'),
              ('Jimena', 'Jimena'), ('Juan', 'Juan'), ('Manuel', 'Manuel'),
              ('Marta', 'Marta'), ('niño', 'el niño'), ('niña', 'la niña')]
    new_nouns = [n for n in NEW_IMAGES if n in NOUNS]
    traits = {n: ['grande', 'pequeño'] for n in new_nouns}
    for n in ('bosque', 'plantas', 'pasto'):
        traits[n].append('verde')
    traits['agua'] = ['azul']
    traits['aire'] = []  # El aire no se ve; no se generan frases «ve el aire».
    traits['suelo'] = ['negro']
    traits['arena'] = ['amarillo']
    traits['basura'] = []
    traits['montaña'].append('alto')
    traits['volcán'].append('alto')
    traits['tucán'].append('negro')
    traits['basurero'].append('verde')
    for noun, adjs in traits.items():
        plural = NOUNS[noun][1].endswith('p')
        for adj in adjs:
            add(1, [noun, adj], f'{phrase(noun)} {"son" if plural else "es"} {adjective(noun, adj)}')
    add(1, ['aire', 'caluroso'], 'el aire está caliente')

    # Observar sustantivos y sus características; el aire queda excluido.
    for person, subject in people:
        for noun in new_nouns:
            if noun == 'aire':
                continue
            simple([person, 'ver', noun], f'{subject} ve {phrase(noun)}')
            for adj in traits[noun]:
                detailed([person, 'ver', noun, adj], f'{subject} ve {phrase(noun)} {adjective(noun, adj)}')

    animal_habitats = {
        'mono': ['bosque', 'árbol'], 'tucán': ['bosque', 'árbol'],
        'jaguar': ['bosque', 'río'], 'venado': ['bosque', 'valle', 'llanura'],
        'vaca': ['zona ganadera', 'llanura', 'valle'],
        'mariposa': ['bosque', 'parque', 'campo de cultivo'],
        'perro': ['parque', 'casa', 'llanura'], 'gato': ['casa', 'parque'],
        'conejo': ['parque', 'bosque', 'llanura'], 'caballo': ['llanura', 'valle', 'zona ganadera'],
    }
    animal_actions = {
        'mono': ['salta', 'duerme'], 'tucán': ['duerme'], 'jaguar': ['corre', 'duerme'],
        'venado': ['corre', 'salta', 'duerme'], 'vaca': ['duerme'], 'mariposa': [],
        'perro': ['corre', 'salta', 'duerme'], 'gato': ['salta', 'duerme'],
        'conejo': ['corre', 'salta', 'duerme'], 'caballo': ['corre', 'duerme'],
    }
    for animal, habitats in animal_habitats.items():
        for action in animal_actions[animal]:
            add(1, [animal, action], f'{phrase(animal)} {action}')
            for habitat in habitats:
                simple([animal, action, habitat], f'{phrase(animal)} {action} {location(habitat)}')
                for adj in ('grande', 'pequeño'):
                    detailed([animal, adj, action, habitat], f'{phrase(animal)} {adjective(animal, adj)} {action} {location(habitat)}')
        for person, subject in people:
            for habitat in habitats:
                detailed([person, 'ver', animal, habitat], f'{subject} ve {phrase(animal)} {location(habitat)}')
    for animal in ('vaca', 'venado', 'caballo', 'conejo'):
        food = 'pasto'
        add(1, [animal, 'come'], f'{phrase(animal)} come')
        simple([animal, 'come', food], f'{phrase(animal)} come {food}')
        for habitat in animal_habitats[animal]:
            detailed([animal, 'come', food, habitat], f'{phrase(animal)} come {food} {location(habitat)}')

    # Asociaciones naturales que sí pueden representarse juntas.
    combinations = {
        'plantas': ['suelo', 'campo de cultivo', 'bosque', 'parque'],
        'flores': ['bosque', 'parque', 'valle', 'llanura'],
        'árbol': ['bosque', 'parque', 'valle', 'llanura'],
        'pasto': ['llanura', 'valle', 'zona ganadera', 'parque'],
        'agua': ['río', 'catarata'], 'arena': ['playa', 'costa'],
        'puente': ['río'], 'basura': ['suelo'],
        'basurero': ['parque', 'escuela', 'casa'],
    }
    for noun, places in combinations.items():
        for place in places:
            for adj in ('grande', 'pequeño') if noun not in ('agua', 'basura') else ():
                verb = 'están' if NOUNS[noun][1].endswith('p') else 'está'
                simple([noun, adj, place], f'{phrase(noun)} {adjective(noun, adj)} {verb} {location(place)}')
            for person, subject in people:
                detailed([person, 'ver', noun, place], f'{subject} ve {phrase(noun)} {location(place)}')
    for place in ('playa', 'costa', 'valle', 'llanura'):
        simple(['aire', 'caluroso', place], f'el aire {location(place, "de")} está caliente')
        detailed(['aire', 'caluroso', place, 'grande'], f'el aire {location(place, "de")} {adjective(place, "grande")} está caliente')

    # Personas leyendo, jugando y observando en los nuevos espacios compatibles.
    human_places = ['bosque', 'valle', 'llanura', 'costa']
    for person, subject in people:
        for place in human_places:
            for action in ('corre', 'salta'):
                simple([person, action, place], f'{subject} {action} {location(place)}')
            detailed([person, 'lee', 'libro', place], f'{subject} lee un libro {location(place)}')
            detailed([person, 'escribe', 'cuaderno', place], f'{subject} escribe en el cuaderno {location(place)}')
            detailed([person, 'juega', 'pelota', place], f'{subject} juega con la pelota {location(place)}')
        for landmark in ('montaña', 'volcán', 'catarata', 'puente'):
            detailed([person, 'ver', landmark, 'al lado', 'árbol'],
                     f'{subject} ve {phrase(landmark)} al lado del árbol')

    # Acciones ambientales: las tarjetas con prohibición siempre llevan «no».
    care_targets = ['plantas', 'árbol', 'flores', 'venado', 'agua']
    for target in care_targets:
        target_phrase = 'al venado' if target == 'venado' else phrase(target)
        add(1, ['cuidar', target], f'cuidamos {target_phrase}')
        for person, subject in people:
            simple([person, 'cuidar', target], f'{subject} cuida {target_phrase}')
            for place in ('bosque', 'parque'):
                detailed([person, 'cuidar', target, place], f'{subject} cuida {target_phrase} {location(place)}')
    environmental = [
        ('recoger basura', 'basura', 'recogemos la basura', 'recoge la basura'),
        ('botar basura', 'basura', 'no botamos basura', 'no bota basura'),
        ('contaminar el agua', 'agua', 'no contaminamos el agua', 'no contamina el agua'),
        ('cortar árboles', 'árbol', 'no cortamos el árbol', 'no corta el árbol'),
    ]
    for action, obj, collective, verb in environmental:
        add(1, [action, obj], collective)
        places = ['río', 'catarata'] if obj == 'agua' else ['bosque', 'parque', 'llanura']
        for person, subject in people:
            simple([person, action, obj], f'{subject} {verb}')
            for place in places:
                detailed([person, action, obj, place], f'{subject} {verb} {location(place)}')
        if action == 'recoger basura':
            for person, subject in people:
                detailed([person, action, obj, 'basurero'], f'{subject} recoge la basura y la pone en el basurero')

    # Etiquetas basadas en las imágenes principales; los distractores no cuentan.
    for row in db['oraciones']:
        row['categorias'] = [c['id'] for c in categories if set(row['pics']) & set(c['palabras'])]
    BASE.write_text(json.dumps(db, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    html = HTML.read_text(encoding='utf-8')
    payload = json.dumps(db, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    html, count = re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)',
                         lambda m: m[1] + payload + m[2], html, flags=re.S)
    assert count == 1
    HTML.write_text(html, encoding='utf-8')
    print(json.dumps({'antes': previous, 'despues': len(db['oraciones']),
                      'nuevas': len(db['oraciones']) - previous,
                      'por_nivel': Counter(row['level'] for row in db['oraciones']),
                      'imagenes': len(db['imagenes']), 'categorias': len(categories)}, ensure_ascii=True))


if __name__ == '__main__':
    main()
