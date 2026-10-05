/* Banco revisado: una secuencia vocálica destacada por palabra. */
(() => {
'use strict';
const SOURCE = `
D|ai-re|ai
D|bai-le|ai
D|cai-mán|ai
D|pai-sa-je|ai
D|au-to|au
D|au-la|au
D|pau-sa|au
D|jau-la|au
D|cau-sa|au
D|pei-ne|ei
D|rei-na|ei
D|rei-no|ei
D|a-cei-te|ei
D|seis|ei
D|vein-te|ei
D|deu-da|eu
D|eu-ca-lip-to|eu
D|boi-na|oi
D|oi-go|oi
D|via-je|ia
D|pia-no|ia
D|cie-lo|ie
D|tie-rra|ie
D|dien-te|ie
D|nie-ve|ie
D|pie-dra|ie
D|fies-ta|ie
D|sie-te|ie
D|pie|ie
D|la-bio|io
D|no-vio|io
D|ra-dio|io
D|pa-tio|io
D|a-gua|ua
D|cua-tro|ua
D|cua-dro|ua
D|guan-te|ua
D|cua-der-no|ua
D|i-gua-na|ua
D|fue-go|ue
D|jue-go|ue
D|hue-vo|ue
D|cuen-to|ue
D|puer-ta|ue
D|rue-da|ue
D|bue-no|ue
D|sue-lo|ue
D|rui-do|ui
D|cui-do|ui
D|cui-da-do|ui
D|ciu-dad|iu
D|triun-fo|iu
D|viu-da|iu
H|ca-e|ae
H|tra-e|ae
H|ca-er|ae
H|ma-es-tro|ae
H|ca-ca-o|ao
H|ca-o-ba|ao
H|te-a-tro|ea
H|al-de-a|ea
H|ta-re-a|ea
H|pe-a-je|ea
H|pa-se-ar|ea
H|cre-ar|ea
H|pa-se-o|eo
H|de-se-o|eo
H|fe-o|eo
H|a-se-o|eo
H|le-ón|eó
H|pe-ón|eó
H|to-a-lla|oa
H|bo-a|oa
H|po-e-ta|oe
H|po-e-ma|oe
H|co-he-te|oe
H|a-za-har|aa
H|le-er|ee
H|cre-er|ee
H|po-se-er|ee
H|dí-a|ía
H|frí-o|ío
H|tí-o|ío
H|rí-o|ío
H|lí-o|ío
H|grú-a|úa
H|pú-a|úa
H|bú-ho|úo
H|pa-ís|aí
H|ra-íz|aí
H|ma-íz|aí
H|ba-úl|aú
H|ca-í-da|aí
H|o-í-do|oí
H|re-ír|eí
H|son-rí-e|íe
H|a-le-grí-a|ía
H|san-dí-a|ía
H|po-li-cí-a|ía
H|e-ner-gí-a|ía
H|va-cí-o|ío
H|ro-cí-o|ío
H|a-hín-co|aí
`.trim();
const normalize = s => s.normalize('NFC');
const plain = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function boundaries(syllables) {
  let offset = 0;
  return syllables.slice(0, -1).map(s => (offset += Array.from(s).length));
}
function pairPositions(word, pair) {
  const letters = Array.from(word), wanted = Array.from(pair);
  for (let i = 0; i < letters.length - 1; i++) {
    const j = letters[i + 1] === 'h' ? i + 2 : i + 1;
    if (letters[i] === wanted[0] && letters[j] === wanted[1]) return [i, j];
  }
  throw Error('Secuencia no encontrada: ' + word);
}
function groups(word, cuts) {
  const letters = Array.from(word), pieces = []; let start = 0;
  for (const cut of [...cuts].sort((a, b) => a - b)) {
    if (!Number.isInteger(cut) || cut <= start || cut >= letters.length) throw Error('Separación inválida');
    pieces.push(letters.slice(start, cut).join('')); start = cut;
  }
  pieces.push(letters.slice(start).join(''));
  return pieces;
}
function vowelTogether(record, cuts) {
  const [a, b] = record.focus;
  return ![...cuts].some(cut => cut > a && cut <= b);
}
function validateCuts(record, cuts) {
  const wanted = record.cuts;
  return cuts.size === wanted.length && wanted.every(n => cuts.has(n));
}
const words = SOURCE.split('\n').map((line, index) => {
  const [kind, division, pair] = line.split('|');
  const syllables = normalize(division).split('-'), word = syllables.join('');
  const focus = pairPositions(word, pair), cuts = boundaries(syllables);
  const record = { id: index, word, syllables, pair, focus, cuts, kind: kind === 'D' ? 'diptongo' : 'hiato' };
  record.easy = word.length <= 6 && focus[1] === focus[0] + 1;
  return Object.freeze(record);
});
function explanation(record) {
  const p = Array.from(record.pair), bases = p.map(plain), open = bases.map(v => 'aeo'.includes(v));
  let rule;
  if (record.kind === 'hiato') rule = open.every(Boolean) ? 'Dos vocales abiertas forman hiato.' :
    'La vocal cerrada con tilde se separa de la vocal abierta.';
  else rule = open.every(v => !v) ? 'Dos vocales cerradas distintas forman diptongo.' :
    'La vocal abierta y la cerrada sin tilde quedan en la misma sílaba.';
  if (record.focus[1] - record.focus[0] === 2) rule += ' La h intercalada no cambia esta relación.';
  return rule;
}
function pool(options) {
  return words.filter(r => (options.level !== 'easy' || r.easy) && (options.kind === 'ambos' || r.kind === options.kind));
}
function shuffle(items, random = Math.random) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function deck(items, random = Math.random) {
  const d = shuffle(items.filter(r => r.kind === 'diptongo'), random);
  const h = shuffle(items.filter(r => r.kind === 'hiato'), random);
  const result = []; let first = random() < .5;
  while (d.length || h.length) {
    const a = first ? d : h, b = first ? h : d;
    if (a.length) result.push(a.pop());
    if (b.length) result.push(b.pop());
  }
  return result;
}
const known = new Set();
for (const r of words) {
  if (known.has(r.word)) throw Error('Palabra repetida: ' + r.word);
  known.add(r.word);
  if (r.syllables.join('') !== r.word || !validateCuts(r, new Set(r.cuts))) throw Error('Separación incorrecta');
  if (vowelTogether(r, new Set(r.cuts)) !== (r.kind === 'diptongo')) throw Error('Clasificación incorrecta: ' + r.word);
  if (groups(r.word, new Set(r.cuts)).join('-') !== r.syllables.join('-')) throw Error('Grupos incorrectos');
}
globalThis.HiatoDiptongo = Object.freeze({ words, boundaries, groups, validateCuts, vowelTogether, explanation, pool, shuffle, deck });
})();
