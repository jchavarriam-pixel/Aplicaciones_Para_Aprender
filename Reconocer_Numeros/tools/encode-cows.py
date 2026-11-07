"""Encode the original vector frame sheets as transparent, looping GIF assets."""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parent.parent / "assets"
for sheet_path in assets.glob(".vaca-*-frames.png"):
    sheet = Image.open(sheet_path).convert("RGBA")
    frames = []
    for y in range(0, sheet.height, 240):
        rgba = sheet.crop((0, y, 320, y + 240))
        indexed = rgba.quantize(colors=255, method=Image.Quantize.FASTOCTREE)
        indexed.paste(255, mask=rgba.getchannel("A").point(lambda a: 255 if a < 128 else 0))
        indexed.info["transparency"] = 255
        frames.append(indexed)
    name = sheet_path.name.removeprefix(".").replace("-frames.png", ".gif")
    frames[0].save(assets / name, save_all=True, append_images=frames[1:], duration=70,
                   loop=0, disposal=2, transparency=255, optimize=False)
    sheet.close()
    sheet_path.unlink()
    print(name)
