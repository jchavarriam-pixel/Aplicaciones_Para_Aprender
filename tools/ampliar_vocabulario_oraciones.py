"""Oraciones infantiles con asociaciones explícitas, concordancia y seis niveles.

Conserva la base anterior. No combina listas sin restricciones semánticas.
Se puede ejecutar varias veces sin duplicar respuestas de un mismo nivel.
"""
import json
import re
from collections import Counter
from pathlib import Path
from ampliar_oraciones_topicos import NOUNS, canonical

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'base_oraciones.json'
HTML = ROOT / 'generador-oraciones.html'


def main():
    db = json.loads(BASE.read_text(encoding='utf-8'))
    manifest = json.loads((ROOT / 'ImagenesGeneradorOraciones/ampliacion_vocabulario.json').read_text(encoding='utf-8'))
    previous = len(db['oraciones'])
    nouns = dict(NOUNS)
    for c in manifest['cards']:
        if c.get('article'):
            nouns[c['word']] = (c['article'], c['gender'])
    nouns.update({
        'hamburguesa': ('la', 'f'), 'autobús': ('el', 'm'), 'avión': ('el', 'm'),
        'cohete': ('el', 'm'), 'cama': ('la', 'f'), 'mesa': ('la', 'f'),
        'silla': ('la', 'f'), 'sofá': ('el', 'm'), 'sombrilla': ('la', 'f'),
        'frutas': ('las', 'fp'), 'verduras': ('las', 'fp'), 'sopa': ('la', 'f'),
        'zanahoria': ('la', 'f'), 'juguetes': ('los', 'mp'), 'globos': ('los', 'mp'),
        'columpio': ('el', 'm'), 'tobogán': ('el', 'm'), 'super mercado': ('el', 'm'),
        'niño': ('el', 'm'), 'niña': ('la', 'f'), 'día lluvioso': ('el', 'm'),
    })
    extra_categories = [
        ('frutas', 'Frutas', '🍎', 'frutas|naranja|manzana|sandía|banana|uvas|fresas|pera|melocotón'),
        ('vegetales', 'Vegetales', '🥒', 'verduras|zanahoria|pepino|lechuga'),
        ('insectos', 'Insectos', '🐞', 'mariposa|mariquita|mosca|saltamontes'),
        ('animales_agua', 'Animales del agua', '🐟', 'pez|pato|rana|cocodrilo|pingüino'),
        ('habitaciones', 'Espacios del hogar', '🏠', 'casa|cochera|patio|dormitorio|sala|escaleras|balcón|primer piso|segundo piso'),
        ('tecnologia', 'Tecnología y pantallas', '📺', 'televisor|tableta|computadora|robot|YouTube'),
        ('matematica', 'Matemática', '🔢', 'matemática|sumas|restas|multiplicación'),
        ('utensilios', 'Utensilios para comer', '🍽️', 'cuchara|tenedor|cuchillo|plato|vaso'),
        ('formas', 'Formas', '🔺', 'circular|cuadrado|rectangular|triangular|plano|ondulado'),
        ('tamanos', 'Tamaños y medidas', '📏', 'alto|grande|pequeño|mediano|corto|largo|bajo|gordo|delgado'),
    ]
    by_id = {c['id']: c for c in db['categorias']}
    for key, label, emoji, words in extra_categories:
        c = dict(id=key, label=label, emoji=emoji, palabras=words.split('|'))
        if key in by_id:
            by_id[key].update(c)
        else:
            db['categorias'].append(c)
            by_id[key] = c
    # Las imágenes pueden pertenecer a más de una categoría.
    for key, words in {
        'escolar': ['escuela', 'libro', 'cuaderno', 'tableta', 'estudiar', 'responder', 'pregunta', 'escribe', 'lee'],
        'bebidas': ['agua'], 'hogar': ['plato', 'vaso'],
    }.items():
        by_id[key]['palabras'] = list(dict.fromkeys(by_id[key]['palabras'] + words))
    connectors = set(db['conectores_reutilizables'])
    seen = {(r['level'], canonical(r['words'])) for r in db['oraciones']}
    generated = []

    def phrase(n):
        if n in nouns:
            return nouns[n][0] + ' ' + n
        return n

    def loc(n, prep='en'):
        return (prep + ' ' + phrase(n)).replace('de el ', 'del ').replace('a el ', 'al ')

    def adj(n, a):
        kind = nouns.get(n, ('', 'm'))[1]
        f = kind.startswith('f')
        plural = kind.endswith('p')
        if a in ['grande', 'verde', 'suave', 'marrón', 'gris', 'azul', 'multicolor']:
            return a + ('es' if a in ['marrón', 'gris', 'azul', 'multicolor'] else 's') if plural else a
        if a in ['circular', 'rectangular', 'triangular']:
            return a + ('es' if plural else '')
        stem = a[:-1] if a.endswith('o') else a
        return stem + ('a' if f and a.endswith('o') else ('o' if a.endswith('o') else '')) + ('s' if plural else '')

    def add(level, pics, text):
        pics = list(dict.fromkeys(pics))
        assert len(pics) in {1: [2], 2: [3], 3: [4, 5], 4: [3, 4, 5], 5: [4, 5], 6: [4, 5]}[level], (level, pics, text)
        assert all(p in db['imagenes'] for p in pics), pics
        words = (text.rstrip('.').strip() + ' .').split()
        key = (level, canonical(words))
        if key in seen:
            return
        seen.add(key)
        row = dict(level=level, pics=pics, words=words, source='vocabulario_ampliado_v1')
        if level in (4, 6):
            forbidden = set(words) | set(pics) | connectors
            row['extras'] = [w for w in ['cohete', 'sombrilla', 'zanahoria', 'gato', 'camión'] if w not in forbidden][:2]
            assert len(row['extras']) == 2
        if level in (5, 6):
            row.update(mode='connectors_free', contentWords=[w for w in words if w not in connectors])
            row.setdefault('extras', [])
        db['oraciones'].append(row)
        generated.append(row)

    def sentence(pics, text):
        count = len(set(pics))
        levels = {2: [1], 3: [2, 4], 4: [3, 4, 5, 6], 5: [3, 4, 5, 6]}[count]
        for level in levels:
            add(level, pics, text)

    people = [(n, n, False) for n in ['Ana', 'Carlos', 'Daniel', 'Jimena', 'Juan', 'Manuel', 'Marta', 'Marcos', 'Pocoyó']]
    people += [(n, phrase(n), n in ['niños', 'niñas']) for n in ['niño', 'niña', 'señora', 'señor', 'maestra', 'niños', 'niñas']]
    # A cada sustantivo observable se le asignan características compatibles.
    traits = {n: ['grande', 'pequeño'] for n in nouns if n not in ['aire', 'basura', 'agua', 'matemática', 'sumas', 'restas', 'multiplicación', 'día', 'noche', 'día lluvioso', 'pendientes fuertes', 'dientes', 'manos', 'pies']}
    for n in ['lápiz', 'cuchara', 'tenedor', 'cuchillo', 'cepillo de dientes', 'escaleras', 'pantalón']:
        traits[n] += ['corto', 'largo']
    for n in ['pupitre', 'mesa', 'silla', 'edificio', 'montaña', 'volcán', 'jirafa']:
        traits[n] += ['alto', 'bajo']
    for n in ['robot', 'pelota', 'bloques', 'vaso', 'camisa', 'blusa', 'borrador', 'carro', 'bicicleta']:
        traits[n] += ['rojo', 'azul', 'verde', 'amarillo', 'blanco', 'negro', 'rosado', 'gris', 'marrón', 'púrpura', 'multicolor', 'mediano']
    traits['plato'] += ['circular', 'cuadrado']
    traits['pizarra'] += ['rectangular', 'cuadrado']
    traits['bloques'] += ['triangular', 'rectangular']
    traits['camisa'] += ['suave']
    traits['pan'] += ['duro', 'suave']
    traits['lápiz'] += ['gordo', 'delgado']
    # «Plano» y «ondulado» se aplican a terreno, no a seres vivos.
    sentence(['llanura', 'plano'], 'el terreno de la llanura es plano')
    sentence(['colina', 'ondulado'], 'el terreno de la colina es ondulado')
    sentence(['montaña', 'pendientes fuertes'], 'la montaña tiene pendientes fuertes')
    sentence(['cima', 'montaña'], 'la cima está en la montaña')
    for n, adjectives in traits.items():
        for a in adjectives:
            sentence([n, a], f'{phrase(n)} {"son" if nouns[n][1].endswith("p") else "es"} {adj(n, a)}')
    sentence(['día', 'soleado'], 'el día está soleado')
    sentence(['día', 'nublado'], 'el día está nublado')
    sentence(['montaña', 'nevado'], 'la montaña está nevada')
    sentence(['día', 'lluvioso'], 'el día está lluvioso')
    sentence(['día', 'caluroso'], 'el día está caluroso')

    # «Ver» une las personas con objetos reales y atributos apropiados.
    observable = [n for n in nouns if n not in ['aire', 'día', 'noche', 'matemática', 'sumas', 'restas', 'multiplicación', 'día lluvioso']]
    for person, subject, plural in people:
        see = 'ven' if plural else 've'
        for n in observable:
            obj = ('a ' + phrase(n)) if n in ['señora', 'señor', 'maestra', 'niño', 'niña', 'niños', 'niñas'] else phrase(n)
            if person == n:
                continue
            sentence([person, 'ver', n], f'{subject} {see} {obj}')
            for a in traits.get(n, [])[:2]:
                sentence([person, 'ver', n, a], f'{subject} {see} {obj} {adj(n, a)}')
        sentence([person, 'ver', 'YouTube'], f'{subject} {see} videos en YouTube')
        for device in ['televisor', 'tableta', 'computadora']:
            sentence([person, 'ver', 'YouTube', device], f'{subject} {see} videos en YouTube {loc(device)}')
            if person != 'Pocoyó':
                sentence([person, 'ver', 'Pocoyó', device], f'{subject} {see} a Pocoyó {loc(device)}')

    # Acciones humanas: lugares, objetos y formas verbales revisados.
    action_forms = {
        'sembrar': ('siembra', 'siembran'), 'recoger': ('recoge', 'recogen'),
        'estudiar': ('estudia', 'estudian'), 'cierra': ('cierra', 'cierran'),
        'sentarse': ('se sienta', 'se sientan'), 'pararse': ('se pone de pie', 'se ponen de pie'),
        'subir': ('sube', 'suben'), 'bajar': ('baja', 'bajan'),
        'responder': ('responde', 'responden'), 'pensar': ('piensa', 'piensan'),
        'tomar': ('toma', 'toman'), 'reciclar': ('recicla', 'reciclan'),
        'reutilizar': ('reutiliza', 'reutilizan'), 'caminar': ('camina', 'caminan'),
        'peinar': ('se peina', 'se peinan'), 'lavarse': ('se lava', 'se lavan'),
        'lee': ('lee', 'leen'), 'escribe': ('escribe', 'escriben'),
        'abre': ('abre', 'abren'), 'come': ('come', 'comen'),
        'corre': ('corre', 'corren'), 'salta': ('salta', 'saltan'),
        'duerme': ('duerme', 'duermen'), 'juega': ('juega', 'juegan'),
        'pregunta': ('pregunta', 'preguntan'),
    }
    frames = [
        ('sembrar', ['plantas', 'árbol', 'flores'], ['patio', 'campo de cultivo', 'parque'], ''),
        ('recoger', ['bloques', 'juguetes', 'cuaderno', 'lápiz'], ['sala', 'escuela', 'dormitorio'], ''),
        ('estudiar', ['matemática', 'sumas', 'restas', 'multiplicación'], ['escuela', 'casa'], ''),
        ('cierra', ['puerta', 'ventana', 'portón'], ['casa', 'escuela'], ''),
        ('abre', ['puerta', 'ventana', 'libro', 'cuaderno'], ['casa', 'escuela'], ''),
        ('subir', ['escaleras'], ['casa', 'escuela'], 'por '),
        ('bajar', ['escaleras'], ['casa', 'escuela'], 'por '),
        ('tomar', ['agua', 'fresco'], ['casa', 'escuela', 'patio'], ''),
        ('reutilizar', ['vaso', 'papel'] if 'papel' in db['imagenes'] else ['vaso'], ['casa', 'escuela'], ''),
        ('lee', ['libro', 'cuaderno'], ['casa', 'escuela', 'sala', 'dormitorio', 'patio'], ''),
        ('escribe', ['cuaderno', 'pizarra'], ['escuela', 'casa'], 'en '),
        ('juega', ['pelota', 'bloques', 'rompecabezas', 'robot', 'juguetes'], ['sala', 'patio', 'parque'], 'con '),
        ('lavarse', ['dientes', 'manos', 'pies'], ['casa'], ''),
    ]
    foods = by_id['alimentos']['palabras']
    foods = [n for n in foods if n not in ['agua', 'fresco']]
    frames.append(('come', foods, ['casa', 'escuela', 'patio'], ''))
    for person, subject, plural in people:
        for action, objects, places, prep in frames:
            verb = action_forms[action][int(plural)]
            sentence([person, action], f'{subject} {verb}') if action in ['tomar', 'lee', 'escribe', 'juega', 'come', 'estudiar'] else None
            for obj in objects:
                complement = prep + phrase(obj)
                sentence([person, action, obj], f'{subject} {verb} {complement}')
                for place in places:
                    sentence([person, action, obj, place], f'{subject} {verb} {complement} {loc(place)}')
        for place in ['patio', 'parque', 'llanura', 'playa', 'costa', 'valle']:
            for action in ['caminar', 'corre', 'salta']:
                verb = action_forms[action][int(plural)]
                sentence([person, action, place], f'{subject} {verb} {loc(place)}')
                sentence([person, action, place, 'día'], f'{subject} {verb} {loc(place)} de día')
        for place in ['silla', 'sofá', 'pupitre']:
            sentence([person, 'sentarse', place], f'{subject} {action_forms["sentarse"][int(plural)]} {loc(place)}')
            sentence([person, 'sentarse', place, 'escuela' if place == 'pupitre' else 'casa'], f'{subject} {action_forms["sentarse"][int(plural)]} {loc(place)} {loc("escuela" if place == "pupitre" else "casa")}')
        sentence([person, 'pararse'], f'{subject} {action_forms["pararse"][int(plural)]}')
        sentence([person, 'pararse', 'silla'], f'{subject} {action_forms["pararse"][int(plural)]} al lado de la silla')
        sentence([person, 'pararse', 'silla', 'casa'], f'{subject} {action_forms["pararse"][int(plural)]} al lado de la silla en la casa')
        for place in ['cama', 'dormitorio']:
            sentence([person, 'duerme', place], f'{subject} {action_forms["duerme"][int(plural)]} {loc(place)}')
            sentence([person, 'duerme', place, 'noche'], f'{subject} {action_forms["duerme"][int(plural)]} {loc(place)} de noche')
        for obj in ['lápiz', 'borrador', 'cuaderno']:
            sentence([person, 'pensar', obj], f'{subject} {action_forms["pensar"][int(plural)]} dónde está {phrase(obj)}')
            sentence([person, 'pensar', obj, 'escuela'], f'{subject} {action_forms["pensar"][int(plural)]} dónde está {phrase(obj)} en la escuela')
        sentence([person, 'responder', 'maestra'], f'{subject} {action_forms["responder"][int(plural)]} a la maestra') if person != 'maestra' else None
        if person != 'maestra':
            sentence([person, 'responder', 'maestra', 'escuela'], f'{subject} {action_forms["responder"][int(plural)]} a la maestra en la escuela')
        sentence([person, 'pregunta', 'matemática'], f'{subject} {action_forms["pregunta"][int(plural)]} sobre matemática')
        sentence([person, 'pregunta', 'matemática', 'escuela'], f'{subject} {action_forms["pregunta"][int(plural)]} sobre matemática en la escuela')
        sentence([person, 'reciclar', 'casa'], f'{subject} {action_forms["reciclar"][int(plural)]} en la casa')
        sentence([person, 'reciclar', 'casa', 'día'], f'{subject} {action_forms["reciclar"][int(plural)]} en la casa de día')
        sentence([person, 'peinar', 'peine'], f'{subject} {action_forms["peinar"][int(plural)]} con el peine')
        sentence([person, 'peinar', 'peine', 'dormitorio'], f'{subject} {action_forms["peinar"][int(plural)]} con el peine en el dormitorio')
        sentence([person, 'peinar', 'gel', 'casa'], f'{subject} {action_forms["peinar"][int(plural)]} con gel en la casa')
        sentence([person, 'lavarse', 'dientes', 'cepillo de dientes'], f'{subject} {action_forms["lavarse"][int(plural)]} los dientes con el cepillo de dientes')
        sentence([person, 'lavarse', 'manos', 'lavamanos'], f'{subject} {action_forms["lavarse"][int(plural)]} las manos en el lavamanos')
        sentence([person, 'lavarse', 'pies', 'ducha'], f'{subject} {action_forms["lavarse"][int(plural)]} los pies en la ducha')
        for food, utensil in [('sopa', 'cuchara'), ('cereal', 'cuchara'), ('arroz', 'tenedor'), ('carne', 'tenedor'), ('espagueti', 'tenedor')]:
            sentence([person, 'come', food, utensil], f'{subject} {action_forms["come"][int(plural)]} {phrase(food)} con {phrase(utensil)}')
        for drink in ['agua', 'fresco']:
            sentence([person, 'tomar', drink, 'vaso'], f'{subject} {action_forms["tomar"][int(plural)]} {phrase(drink)} en el vaso')

    # Animales en hábitats plausibles, sin mezclar animales de agua y tierra.
    habitats = {
        'león': ['llanura'], 'jirafa': ['llanura'], 'elefante': ['llanura', 'río'],
        'cebra': ['llanura'], 'koala': ['árbol', 'bosque'], 'panda': ['bosque'],
        'serpiente': ['bosque', 'suelo'], 'cocodrilo': ['río', 'lago'],
        'tortuga': ['patio', 'suelo'], 'pez': ['río', 'lago'], 'pingüino': ['costa'],
        'rana': ['lago', 'río'], 'pato': ['lago', 'río'], 'pájaro': ['árbol', 'parque'],
        'mariquita': ['plantas', 'patio'], 'mosca': ['patio'], 'saltamontes': ['pasto', 'patio'],
        'mariposa': ['flores', 'parque'],
    }
    for animal, places in habitats.items():
        for place in places:
            sentence([animal, 'grande', place], f'{phrase(animal)} {adj(animal,"grande")} está {loc(place)}')
            for person, subject, plural in people[:9]:
                sentence([person, 'ver', animal, place], f'{subject} ve {phrase(animal)} {loc(place)}')
        if animal in ['león', 'jirafa', 'elefante', 'cebra']:
            sentence([animal, 'caminar'], f'{phrase(animal)} camina')
            for place in places:
                sentence([animal, 'caminar', place], f'{phrase(animal)} camina {loc(place)}')
                sentence([animal, 'grande', 'caminar', place], f'{phrase(animal)} {adj(animal,"grande")} camina {loc(place)}')
    for place in ['lago', 'piscina']:
        for person, subject, plural in people:
            sentence([person, 'ver', 'agua', place], f'{subject} {"ven" if plural else "ve"} el agua {loc(place)}')
    # Relaciones espaciales de objetos, sin posiciones peligrosas para niños.
    for obj, places in {
        'pelota': ['mesa', 'silla', 'cama'], 'robot': ['mesa', 'sofá', 'cama'],
        'libro': ['mesa', 'pupitre'], 'cuaderno': ['mesa', 'pupitre'],
        'zapatos': ['cama', 'silla'], 'calcetines': ['cama', 'silla'],
        'lápiz': ['cuaderno', 'mesa'], 'vaso': ['plato', 'mesa'],
        'plato': ['vaso', 'mesa'], 'cuchillo': ['plato'],
        'refrigeradora': ['estufa'], 'lavadora': ['lavamanos'], 'servicio sanitario': ['lavamanos'],
    }.items():
        for place in places:
            # Muebles grandes y electrodomésticos solo al lado; no «debajo de un lavamanos».
            relations = ['al lado'] if obj in ['refrigeradora', 'lavadora', 'servicio sanitario', 'cuchillo', 'plato', 'vaso'] else ['al lado', 'debajo', 'detrás', 'al frente']
            for rel in relations:
                verb = 'están' if nouns[obj][1].endswith('p') else 'está'
                sentence([obj, rel, place], f'{phrase(obj)} {verb} {rel} {loc(place,"de")}')
                sentence([obj, 'pequeño', rel, place], f'{phrase(obj)} {adj(obj,"pequeño")} {verb} {rel} {loc(place,"de")}')
    sentence(['agua', 'dentro', 'vaso'], 'el agua está dentro del vaso')
    sentence(['agua', 'azul', 'dentro', 'vaso'], 'el agua azul está dentro del vaso')
    sentence(['plantas', 'dentro', 'casa'], 'las plantas están dentro de la casa')
    sentence(['plantas', 'verde', 'dentro', 'casa'], 'las plantas verdes están dentro de la casa')
    for floor in ['primer piso', 'segundo piso']:
        for room in ['dormitorio', 'sala']:
            sentence([room, 'grande', floor], f'{phrase(room)} {adj(room,"grande")} está en el {floor}')
            sentence([room, 'grande', floor, 'casa'], f'{phrase(room)} {adj(room,"grande")} está en el {floor} de la casa')
    # «Encima» para objetos que se pueden colocar sobre una superficie.
    for obj in ['plato', 'vaso', 'lápiz', 'borrador', 'peine', 'camisa', 'blusa', 'pantalón', 'enagua']:
        sentence([obj, 'encima', 'mesa'], f'{phrase(obj)} está encima de la mesa')
        sentence([obj, 'encima', 'mesa', 'casa'], f'{phrase(obj)} está encima de la mesa en la casa')
    # La tarea y las operaciones se realizan/estudian; no se comen ni se juegan.
    for person, subject, plural in people:
        for obj in ['tarea', 'sumas', 'restas', 'multiplicación']:
            sentence([person, 'escribe', obj, 'cuaderno'], f'{subject} {"escriben" if plural else "escribe"} {phrase(obj)} en el cuaderno')
        sentence([person, 'estudiar', 'tarea'], f'{subject} {"estudian" if plural else "estudia"} la tarea')
        sentence([person, 'estudiar', 'tarea', 'escuela'], f'{subject} {"estudian" if plural else "estudia"} la tarea en la escuela')
    # Medio de transporte en contexto, con la tarjeta «ver» como acción.
    for person, subject, plural in people:
        for vehicle, place in [('camión', 'carretera'), ('taxi', 'carretera'), ('tren', 'puente'), ('patineta', 'parque'), ('monopatín', 'patio')]:
            sentence([person, 'ver', vehicle, place], f'{subject} {"ven" if plural else "ve"} {phrase(vehicle)} {loc(place)}')
    # Uso especial del trampolín: brincar, no correr sobre él.
    for person, subject, plural in people:
        sentence([person, 'salta', 'trampolín'], f'{subject} {"saltan" if plural else "salta"} en el trampolín')
        sentence([person, 'salta', 'trampolín', 'patio'], f'{subject} {"saltan" if plural else "salta"} en el trampolín en el patio')

    for row in db['oraciones']:
        row['categorias'] = [c['id'] for c in db['categorias'] if set(c['palabras']) & set(row['pics'])]
    used = {p for row in db['oraciones'] for p in row['pics']}
    assert set(db['imagenes']) <= used, 'Imágenes sin ejercicios: ' + ', '.join(set(db['imagenes']) - used)
    for row in generated:
        assert all((ROOT / db['imagenes'][p]['img']).is_file() for p in row['pics'])
        assert row['categorias']
    BASE.write_text(json.dumps(db, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    html = HTML.read_text(encoding='utf-8')
    payload = json.dumps(db, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    html, count = re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)', lambda m: m[1] + payload + m[2], html, flags=re.S)
    assert count == 1
    HTML.write_text(html, encoding='utf-8')
    print(json.dumps(dict(antes=previous, nuevas=len(generated), total=len(db['oraciones']), imagenes=len(db['imagenes']), categorias=len(db['categorias']), niveles=Counter(r['level'] for r in db['oraciones'])), ensure_ascii=True))


if __name__ == '__main__':
    main()
