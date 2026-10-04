"""Criterios explícitos de naturalidad para plantillas y revisión del banco."""
import re

HUMANOS={'Ana','Carlos','Daniel','Jimena','Juan','Manuel','Marta','Marcos','Pocoyó','niño','niña','niños','niñas','señor','señora','maestra'}
CRUDOS={'zanahoria','pepino','lechuga'}

def motivo_descarte(row):
    pics=set(row['pics']);words=row['words']
    if re.search(r'\b(?:camina|caminan|corre|corren) (?:en|por) (?:el|la|los|las|su|sus) (?:sofá|cama|silla|pupitre)\b',' '.join(words)):
        return 'Acción sobre un mueble'
    places={'casa','sala','dormitorio','escuela','mesa','silla','sofá','cama','pupitre','lavamanos','ducha','patio','primer piso','segundo piso'}
    details={'amarillo','azul','rojo','verde','negro','púrpura','multicolor','alto','grande','pequeño','plano','ondulado','gris','blanco','marrón','rosado','mediano','corto','largo','bajo','gordo','delgado','circular','cuadrado','rectangular','triangular','suave','duro'}
    if row['level']==6 and len(pics&places)>=3 and not pics&details:
        return 'Cadena de lugares sin un atributo útil'
    if 'come' in pics and pics&HUMANOS and pics&CRUDOS and not pics&{'conejo','tortuga','caballo'}:
        return 'Vegetal crudo con persona, sin preparación o contexto de ensalada'
    if 'ver' in pics and pics&{'grande','pequeño'} and row.get('source')=='vocabulario_ampliado_v1':
        return 'Plantilla repetitiva de ver un objeto grande o pequeño'
    if pics&{'gel','suelo','arena'} and pics&{'grande','pequeño'}:
        return 'Tamaño aplicado a una sustancia sin recipiente o porción'
    if 'juega' in pics and 'bicicleta' in pics:
        return 'Para la bicicleta es más natural pasear o montar'
    if 'agua' in pics and 'azul' in pics and 'dentro' in pics:
        return 'Agua azul sin explicación'
    return None
