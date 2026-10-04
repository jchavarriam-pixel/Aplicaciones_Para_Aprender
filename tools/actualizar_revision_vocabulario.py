"""Actualiza el catálogo de revisión sin modificar imágenes ni oraciones."""
import html
import json
import os
import re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'ImagenesGeneradorOraciones/ampliacion_vocabulario.json').read_text(encoding='utf-8'))
cards = [c for c in manifest['cards'] if c['status'] == 'generated']
page = root / 'ImagenesGeneradorOraciones/Nuevas_para_revisar/revision.html'
source = page.read_text(encoding='utf-8')
head, remaining = source.split('<main>', 1)
_, tail = remaining.split('</main>', 1)
head = re.sub(r'\d+ imágenes', str(len(cards)) + ' imágenes', head)
tiles = []
for card in cards:
    word, name = html.escape(card['word']), html.escape(card['file'])
    asset = root / 'ImagenesGeneradorOraciones' / card.get('relative_path', card['file'])
    url = html.escape(Path(os.path.relpath(asset, page.parent)).as_posix())
    tiles.append(f'<article><a href="{url}" target="_blank"><img src="{url}" alt="{word}" loading="lazy"></a><h2>{word}</h2><p>{name}</p></article>')
page.write_text(head + '<main>' + ''.join(tiles) + '</main>' + tail, encoding='utf-8')
print(f'{len(cards)} tarjetas en la página de revisión')
