"""Añade el pictograma de al lado sin perder las oraciones ni sus variantes."""
import json, re, time
from collections import Counter
from pathlib import Path
from revisar_orden_imagenes_pistas import alinear_fila, position

ROOT = Path(__file__).resolve().parents[1]

def main():
    db = json.loads((ROOT / 'base_oraciones.json').read_text(encoding='utf-8-sig'))
    assert (ROOT / db['imagenes']['al lado']['img']).is_file()
    changes = []
    for row in db['oraciones']:
        if position('al lado', row['words']) is None or 'al lado' in row['pics']:
            continue
        before = {'level': row['level'], 'pics': row['pics'][:]}
        words = row['words'][:]
        answers = [a[:] for a in row.get('validAnswers', [])]
        edits = alinear_fila(row)
        assert row['words'] == words and row.get('validAnswers', []) == answers
        row['categorias'] = [c['id'] for c in db['categorias'] if set(row['pics']) & set(c['palabras'])]
        changes.append({'before': before, 'after': {'level': row['level'], 'pics': row['pics'][:]}, 'words': words, 'changes': edits})
    assert all('al lado' in r['pics'] for r in db['oraciones'] if position('al lado', r['words']) is not None)
    if not changes:
        print('Sin pictogramas pendientes.'); return
    htmlpath = ROOT / 'generador-oraciones.html'
    html = htmlpath.read_text(encoding='utf-8')
    payload = json.dumps(db, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    html, n = re.subn(r'(<script type="application/json" id="baseOracionesIntegrada">).*?(</script>)', lambda m: m[1]+payload+m[2], html, flags=re.S)
    assert n == 1
    for path, content in [(ROOT/'base_oraciones.json', json.dumps(db, ensure_ascii=False, indent=2)+'\n'), (htmlpath, html)]:
        for attempt in range(3):
            try: path.write_text(content, encoding='utf-8'); break
            except OSError:
                if attempt == 2: raise
                time.sleep(.5)
    report = {'oraciones_conservadas': len(db['oraciones']), 'corregidas': len(changes), 'changes': dict(Counter(edit for r in changes for edit in r['changes'])), 'details': changes}
    (ROOT/'tools/correccion_pictograma_al_lado.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='details'}, ensure_ascii=False))

if __name__ == '__main__': main()
