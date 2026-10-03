"""Guarda una salida de image_gen y registra su procedencia sin editar sus píxeles."""
import json
import shutil
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
manifest = root / 'ImagenesGeneradorOraciones/ampliacion_vocabulario.json'
record = json.load(sys.stdin)
data = json.loads(manifest.read_text(encoding='utf-8'))
card = next(c for c in data['cards'] if c['file'] == record['file'])
source = Path(record['source'])
with Image.open(source) as image:
    assert image.size == (1254, 1254), (card['word'], image.size)
shutil.copy2(source, manifest.parent / card.get('relative_path', card['file']))
card.update(source=str(source), prompt=record['prompt'], status='generated')
manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(card['file'])
