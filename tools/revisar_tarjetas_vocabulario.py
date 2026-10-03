"""Crea hojas de contacto para revisar las tarjetas, sin alterar los PNG originales."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'ImagenesGeneradorOraciones/ampliacion_vocabulario.json').read_text(encoding='utf-8'))
cards = [c for c in manifest['cards'] if c['status'] == 'generated']
out = root / 'vocabulario_qa'
out.mkdir(exist_ok=True)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
for start in range(0, len(cards), 16):
    group = cards[start:start+16]
    sheet = Image.new('RGB', (1200, 1320), 'white')
    draw = ImageDraw.Draw(sheet)
    for i, card in enumerate(group):
        image = Image.open(root / 'ImagenesGeneradorOraciones' / card.get('relative_path', card['file'])).convert('RGB')
        assert image.size == (1254, 1254), card['file']
        image.thumbnail((290, 290))
        x, y = (i % 4) * 300, (i // 4) * 330
        sheet.paste(image, (x + 5, y))
        draw.text((x + 8, y + 295), card['word'], fill='black', font=font)
    target = out / f'tarjetas-{start//16+1:02d}.jpg'
    sheet.save(target, quality=93)
    print(target)
