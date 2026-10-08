/* Actividad táctil en dos pasos; configuración local y banco sin repeticiones. */
(() => {
'use strict';
const data = globalThis.HiatoDiptongo;
const $ = id => document.getElementById(id);
const key = 'hiatoDiptongo.config.v1';
const defaults = { name: '', kind: 'ambos', level: 'easy', count: 10, help: true, sound: true, syllableSound: true };
let settings = { ...defaults }, session = [], index = 0, current = null;
let cuts = new Set(), stage = 'separate', results = [], helped = false, helpCount = 0, attempts = 0, ticket = 0;
let lastWord = '', speechTimer = null, speechRun = 0, dragCut = null, dragPointer = null, dragTargets = [], dragMode = 'add', dragOriginalCut = null, ignoreGapClickUntil = 0;
const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
try {
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  if (saved && typeof saved === 'object') {
    settings.name = typeof saved.name === 'string' ? saved.name.slice(0, 50) : '';
    if (['ambos', 'hiato', 'diptongo'].includes(saved.kind)) settings.kind = saved.kind;
    if (['easy', 'all'].includes(saved.level)) settings.level = saved.level;
    if ([5, 10, 20, 30].includes(saved.count)) settings.count = saved.count;
    for (const k of ['help', 'sound', 'syllableSound']) if (typeof saved[k] === 'boolean') settings[k] = saved[k];
  }
  if (!settings.name) settings.name = (localStorage.getItem('nombreNinoGabrielApps') || '').slice(0, 50);
} catch { /* La práctica sigue disponible con el almacenamiento bloqueado. */ }
if (!canSpeak) { settings.sound = false; settings.syllableSound = false; }
for (const [id, value] of [['hd-name', settings.name], ['hd-kind', settings.kind], ['hd-level', settings.level], ['hd-count', settings.count]]) $(id).value = String(value);
$('hd-help').checked = settings.help; $('hd-sound').checked = settings.sound; $('hd-syllable-sound').checked = settings.syllableSound;
$('hd-sound').disabled = !canSpeak; $('hd-syllable-sound').disabled = !canSpeak;
$('hd-listen-word').disabled = !canSpeak;
if (!canSpeak) $('hd-listen-word').title = 'La lectura no está disponible en este navegador.';
function readSettings() {
  settings = { name: $('hd-name').value.trim().slice(0, 50), kind: $('hd-kind').value,
    level: $('hd-level').value, count: Number($('hd-count').value), help: $('hd-help').checked,
    sound: canSpeak && $('hd-sound').checked,
    syllableSound: canSpeak && $('hd-syllable-sound').checked };
}
function saveSettings() {
  readSettings();
  try {
    localStorage.setItem(key, JSON.stringify(settings));
    if (settings.name) localStorage.setItem('nombreNinoGabrielApps', settings.name);
    $('hd-storage').textContent = '';
  } catch { $('hd-storage').textContent = 'La configuración se usa en esta sesión. El navegador no permite guardarla.'; }
  updateAvailable();
}
function updateAvailable() {
  const n = data.pool(settings).length;
  $('hd-available').textContent = n + ' palabras disponibles · ' + Math.min(settings.count, n) + ' en esta sesión. La selección cambia y no repite palabras.';
  $('hd-start').disabled = n === 0;
}
['hd-name', 'hd-kind', 'hd-level', 'hd-count', 'hd-help', 'hd-sound', 'hd-syllable-sound'].forEach(id => $(id).addEventListener(id === 'hd-name' ? 'input' : 'change', saveSettings));
function stopSpeech() {
  speechRun++;
  if (speechTimer) clearTimeout(speechTimer);
  speechTimer = null;
  if (canSpeak) speechSynthesis.cancel();
}
function speak(text, after) {
  stopSpeech();
  if (!canSpeak) { if (after) after(); return; }
  const id = ticket, run = speechRun, utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => /^es[-_]CR$/i.test(v.lang)) || voices.find(v => /^es/i.test(v.lang));
  if (voice) utterance.voice = voice;
  utterance.lang = voice ? voice.lang : 'es-CR';
  utterance.rate = .85;
  let finished = false;
  const finish = () => {
    if (finished || run !== speechRun) return; finished = true;
    if (speechTimer) clearTimeout(speechTimer);
    speechTimer = null;
    if (id === ticket && after) after();
  };
  utterance.onend = finish; utterance.onerror = finish;
  // Algunos navegadores no devuelven eventos de lectura.
  speechTimer = setTimeout(finish, 10000);
  try { speechSynthesis.speak(utterance); } catch { finish(); }
}
function feedback(text, type = '') {
  $('hd-feedback').textContent = text;
  $('hd-feedback').className = 'hd-feedback' + (type ? ' ' + type : '');
}
function vowelClass(letter) {
  const v = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return 'aeo'.includes(v) ? 'open' : 'iu'.includes(v) ? 'closed' : '';
}
function vowelState() {
  return data.vowelTogether(current, cuts) ? 'together' : 'separated';
}
function separationIsReady() {
  return stage !== 'separate' && current && data.validateCuts(current, cuts);
}
function wordColorState(shownCuts = cuts) {
  if (!shownCuts.size) return '';
  return data.vowelTogether(current, shownCuts) ? 'diptongo' : 'hiato';
}
function updateVowelState() {
  const together = vowelState(), el = $('hd-vowel-state');
  el.hidden = !separationIsReady();
  if (!separationIsReady()) return;
  el.className = 'hd-vowel-state ' + together;
  el.textContent = together === 'together'
    ? '«' + current.pair + '»: juntas en la misma sílaba · diptongo'
    : '«' + current.pair + '»: separadas en sílabas diferentes · hiato';
}
function updateReferenceWord(previewCut = null) {
  const shownCuts = new Set(cuts);
  if (previewCut !== null) shownCuts.add(previewCut);
  const title = $('hd-word-title');
  const pieces = data.groups(current.word, shownCuts);
  title.replaceChildren();
  let position = 0;
  pieces.forEach((piece, index) => {
    if (index) { const dash = document.createElement('span'); dash.className = 'hd-reference-hyphen'; dash.textContent = '−'; title.append(dash); }
    const syllable = document.createElement('span'); syllable.className = 'hd-reference-syllable';
    Array.from(piece).forEach(letter => { const span = document.createElement('span'); span.className = current.focus.includes(position) ? 'focus' : ''; position++; span.textContent = letter; syllable.append(span); });
    title.append(syllable);
  });
  const color = wordColorState(shownCuts);
  title.classList.toggle('diptongo', color === 'diptongo');
  title.classList.toggle('hiato', color === 'hiato');
}
function makeLetter(letter, position, tile = false) {
  const span = document.createElement('span');
  span.textContent = letter;
  const focus = current.focus.includes(position);
  span.className = (tile ? 'hd-letter ' : '') + vowelClass(letter) + (focus ? ' focus' + (separationIsReady() ? ' pair-' + vowelState() : '') : '');
  if (tile && current.focus.includes(position)) span.setAttribute('aria-label', letter + ', vocal destacada');
  return span;
}
function afterSeparationChange() {
  renderLetters(); renderPreview(); updateReferenceWord(); updateVowelState();
  if (settings.syllableSound) speak(data.groups(current.word, cuts).join(', '));
}
function toggleCut(cut) {
  if (stage !== 'separate') return;
  if (cuts.has(cut)) cuts.delete(cut); else cuts.add(cut);
  feedback(''); afterSeparationChange();
}
function setDragCut(cut) {
  dragCut = cut;
  document.querySelectorAll('.hd-drag-gap').forEach(gap => gap.classList.toggle('preview', Number(gap.dataset.cut) === cut));
  document.querySelectorAll('.hd-letter[data-position]').forEach(letter => {
    const position = Number(letter.dataset.position);
    letter.classList.toggle('preview-left', cut !== null && position < cut);
    letter.classList.toggle('preview-right', cut !== null && position >= cut);
  });
  updateReferenceWord(cut);
}
function renderLetters() {
  const host = $('hd-letters'); host.className = 'hd-letters word-' + (wordColorState() || 'neutral'); host.replaceChildren();
  Array.from(current.word).forEach((letter, i, all) => {
    const tile = makeLetter(letter, i, true);
    tile.dataset.position = String(i);
    host.append(tile);
    if (i === all.length - 1) return;
    const cut = i + 1, button = document.createElement('button');
    button.type = 'button'; button.dataset.cut = String(cut);
    button.className = 'hd-drag-gap' + (cuts.has(cut) ? ' selected' : '');
    button.textContent = '';
    button.setAttribute('aria-label', (cuts.has(cut) ? 'Quitar este guion' : 'Separar') + ' entre ' + letter + ' y ' + all[i + 1]);
    button.setAttribute('aria-pressed', String(cuts.has(cut)));
    button.disabled = stage !== 'separate';
    button.addEventListener('click', () => { if (Date.now() < ignoreGapClickUntil) return; toggleCut(cut); });
    button.addEventListener('pointerdown', event => { if (cuts.has(cut)) startRemoveDrag(event, cut, button); });
    host.append(button);
  });
  if (separationIsReady()) {
    const [first, last] = current.focus;
    if (vowelState() === 'together') {
      const start = host.querySelector('[data-position="' + first + '"]');
      const end = host.querySelector('[data-position="' + last + '"]');
      const group = document.createElement('span'); group.className = 'hd-main-vowel-group';
      host.insertBefore(group, start);
      let node = start;
      while (node) { const next = node.nextSibling; group.append(node); if (node === end) break; node = next; }
    } else {
      host.querySelectorAll('.hd-letter.focus').forEach(letter => letter.classList.add('hd-main-vowel-separated'));
    }
  }
  requestAnimationFrame(updateScrollNote);
}
function updateScrollNote() {
  const row = $('hd-letter-scroll');
  $('hd-scroll-note').hidden = row.scrollWidth <= row.clientWidth + 2;
}
window.addEventListener('resize', updateScrollNote, { passive: true });
function renderPreview() {
  const pieces = data.groups(current.word, cuts), host = $('hd-preview');
  host.className = 'hd-preview word-' + (wordColorState() || 'neutral');
  host.replaceChildren();
  const accessible = document.createElement('span');
  accessible.className = 'hd-sr'; accessible.textContent = pieces.join(' — '); host.append(accessible);
  let offset = 0;
  pieces.forEach((piece, i) => {
    if (i) { const dash = document.createElement('span'); dash.className = 'hd-preview-divider'; dash.textContent = '−'; dash.setAttribute('aria-hidden', 'true'); host.append(dash); }
    const group = document.createElement('div'); group.className = 'hd-syllable';
    group.setAttribute('aria-hidden', 'true');
    Array.from(piece).forEach((letter, j) => group.append(makeLetter(letter, offset + j)));
    if (current.focus.some(pos => pos >= offset && pos < offset + piece.length)) group.classList.add('focus-group', vowelState());
    host.append(group); offset += piece.length;
  });
}
function dragGapAt(x, y) {
  // Conservamos los centros al iniciar el gesto. Así la apertura animada de
  // letras no puede cambiar el destino mientras el niño arrastra.
  if (dragTargets.length) {
    let closest = null, distance = Infinity;
    dragTargets.forEach(target => {
      if (y < target.top - 30 || y > target.bottom + 30) return;
      const d = Math.abs(x - target.center);
      if (d < distance) { closest = target.gap; distance = d; }
    });
    return distance <= 38 ? closest : null;
  }
  const direct = document.elementFromPoint(x, y);
  const button = direct && direct.closest ? direct.closest('.hd-drag-gap') : null;
  if (button && !button.disabled) return button;
  // Un espacio sin separar mide apenas dos píxeles. En pantallas táctiles,
  // buscamos el punto más cercano para que colocar el guion no sea frustrante.
  let nearest = null, distance = Infinity;
  document.querySelectorAll('.hd-drag-gap:not(:disabled)').forEach(gap => {
    const box = gap.getBoundingClientRect();
    if (y < box.top - 28 || y > box.bottom + 28) return;
    const d = Math.abs(x - (box.left + box.width / 2));
    if (d < distance) { nearest = gap; distance = d; }
  });
  return distance <= 38 ? nearest : null;
}
function moveDragToken(event) {
  const token = $('hd-drag-token');
  token.style.left = event.clientX + 'px'; token.style.top = event.clientY + 'px';
  const gap = dragGapAt(event.clientX, event.clientY);
  setDragCut(gap ? Number(gap.dataset.cut) : null);
}
function startDrag(event) {
  if (stage !== 'separate' || event.button > 0) return;
  event.preventDefault();
  dragMode = 'add'; dragOriginalCut = null;
  dragPointer = event.pointerId; dragCut = null;
  dragTargets = Array.from(document.querySelectorAll('.hd-drag-gap:not(:disabled)')).map(gap => {
    const box = gap.getBoundingClientRect();
    return { gap, center: box.left + box.width / 2, top: box.top, bottom: box.bottom };
  });
  const token = $('hd-drag-token'); token.classList.add('dragging');
  token.setPointerCapture?.(event.pointerId); moveDragToken(event);
}
function startRemoveDrag(event, cut, source) {
  if (stage !== 'separate' || event.button > 0) return;
  event.preventDefault();
  dragMode = 'remove'; dragOriginalCut = cut; dragPointer = event.pointerId; dragCut = cut;
  dragTargets = Array.from(document.querySelectorAll('.hd-drag-gap:not(:disabled)')).map(gap => {
    const box = gap.getBoundingClientRect();
    return { gap, center: box.left + box.width / 2, top: box.top, bottom: box.bottom };
  });
  source.classList.add('drag-source');
  const token = $('hd-drag-token'); token.classList.add('dragging');
  source.setPointerCapture?.(event.pointerId); moveDragToken(event);
}
function endDrag(event) {
  if (dragPointer !== event.pointerId) return;
  // En algunos navegadores táctiles el último movimiento no llega antes de
  // soltar. Leemos también el punto final para no perder esa división.
  const finalGap = dragGapAt(event.clientX, event.clientY);
  const token = $('hd-drag-token'), cut = finalGap ? Number(finalGap.dataset.cut) : dragCut;
  const mode = dragMode, originalCut = dragOriginalCut;
  dragPointer = null; dragCut = null; dragTargets = []; dragMode = 'add'; dragOriginalCut = null;
  token.classList.remove('dragging'); token.style.removeProperty('left'); token.style.removeProperty('top');
  document.querySelectorAll('.hd-drag-gap.drag-source').forEach(gap => gap.classList.remove('drag-source'));
  try { token.releasePointerCapture?.(event.pointerId); } catch { /* El puntero puede haberse liberado antes. */ }
  if (mode === 'remove' && originalCut !== null) {
    ignoreGapClickUntil = Date.now() + 400;
    if (cut !== originalCut) {
      cuts.delete(originalCut);
      if (cut) cuts.add(cut);
      feedback(cut ? 'Moviste el guion a otro espacio.' : 'Quitaste el guion.', 'good');
      afterSeparationChange();
    } else {
      feedback('Arrastra el guion fuera de la palabra para quitarlo o a otro espacio para moverlo.');
    }
  } else if (cut) {
    cuts.add(cut); feedback('¡Separaste la palabra! Escucha cómo suenan las sílabas.', 'good');
    afterSeparationChange();
  } else feedback('Pon el guion en el pequeño espacio entre dos letras.', 'retry');
}
function showWord() {
  ticket++; stopSpeech(); $('hd-celebration').replaceChildren();
  current = session[index]; cuts = new Set(); stage = 'separate'; helped = false; attempts = 0;
  $('hd-workspace').classList.remove('reviewed');
  $('hd-instruction').style.removeProperty('height');
  $('hd-workspace').classList.add('classifying');
  $('hd-word-title').textContent = current.word;
  $('hd-word-title').className = '';
  $('hd-greeting').textContent = settings.name ? '¡Vamos, ' + settings.name + '!' : 'Vamos paso a paso';
  $('hd-progress').textContent = 'Palabra ' + (index + 1) + ' de ' + session.length;
  $('hd-track-fill').style.width = (index / session.length * 100) + '%';
  $('hd-step-one').className = 'active'; $('hd-step-two').className = '';
  $('hd-instruction').textContent = current.cuts.length ? 'Arrastra el guion hacia el espacio entre dos letras para separar la palabra en sílabas.' : 'Esta palabra tiene una sola sílaba. Puedes revisarla sin separar.';
  $('hd-review').hidden = false; $('hd-clear').hidden = false;
  $('hd-review').disabled = false; $('hd-clear').disabled = false;
  $('hd-drag-instruction').hidden = false; $('hd-drag-token').disabled = false;
  $('hd-hint').hidden = !settings.help;
  $('hd-classify').hidden = false; $('hd-classify').classList.add('pending'); $('hd-success').hidden = true;
  for (const kind of ['hiato', 'diptongo']) { $('hd-' + kind).disabled = true; $('hd-' + kind).classList.remove('correct'); }
  feedback(''); renderLetters(); renderPreview(); updateReferenceWord(); updateVowelState();
  $('hd-letter-scroll').scrollLeft = 0;
}
function start() {
  saveSettings();
  let deck = data.deck(data.pool(settings));
  if (deck.length > 1 && deck[0].word === lastWord) deck.push(deck.shift());
  session = deck.slice(0, Math.min(settings.count, deck.length));
  if (!session.length) return;
  index = 0; results = []; helpCount = 0;
  $('hd-settings').hidden = true; $('hd-finish').hidden = true; $('hd-game').hidden = false;
  showWord(); $('hd-game').scrollIntoView({ block: 'start', behavior: 'auto' });
}
function checkSeparation() {
  if (stage !== 'separate') return;
  const pageScroll = { x: window.scrollX, y: window.scrollY };
  const letterScroll = $('hd-letter-scroll').scrollLeft;
  const instructionHeight = $('hd-instruction').getBoundingClientRect().height;
  attempts++;
  if (!data.validateCuts(current, cuts)) {
    feedback('Todavía no coincide la separación. Revisa las divisiones que pusiste; puedes añadirlas o quitarlas.', 'retry');
    return;
  }
  stage = 'classify'; renderLetters(); renderPreview();
  $('hd-workspace').classList.add('reviewed');
  $('hd-workspace').classList.add('classifying');
  updateReferenceWord(); updateVowelState();
  $('hd-review').disabled = true; $('hd-clear').disabled = true;
  $('hd-drag-token').disabled = true;
  $('hd-step-one').className = 'complete'; $('hd-step-two').className = 'active';
  $('hd-instruction').style.height = instructionHeight + 'px';
  $('hd-instruction').textContent = '👀 Mira las dos vocales destacadas.';
  $('hd-classify').hidden = false;
  $('hd-classify').classList.remove('pending');
  for (const kind of ['hiato', 'diptongo']) $('hd-' + kind).disabled = false;
  $('hd-vowel-pair').replaceChildren();
  const pairHost = $('hd-vowel-pair'), together = vowelState() === 'together';
  if (together) {
    const group = document.createElement('span'); group.className = 'hd-vowel-pair-group together';
    Array.from(current.pair).forEach(letter => { const span = document.createElement('span'); span.textContent = letter; group.append(span); });
    pairHost.append(group);
  } else {
    Array.from(current.pair).forEach((letter, index) => {
      if (index) { const mark = document.createElement('span'); mark.className = 'hd-pair-separation-mark'; mark.textContent = '↔'; mark.setAttribute('aria-hidden', 'true'); pairHost.append(mark); }
      const span = document.createElement('span'); span.className = 'separated'; span.textContent = letter; pairHost.append(span);
    });
  }
  feedback('👀 Fíjate en los recuadros de las vocales: ¿quedaron juntas o separadas?', 'good');
  $('hd-letter-scroll').scrollLeft = letterScroll;
  window.scrollTo(pageScroll.x, pageScroll.y);
}
function giveHint() {
  if (!settings.help || !current || stage === 'done') return;
  if (!helped) { helped = true; helpCount++; }
  if (stage === 'separate') {
    const missing = current.cuts.find(cut => !cuts.has(cut));
    const extra = [...cuts].find(cut => !current.cuts.includes(cut));
    const letters = Array.from(current.word);
    if (extra !== undefined) feedback('Prueba quitando la división entre «' + letters[extra - 1] + '» y «' + letters[extra] + '».');
    else if (missing !== undefined) feedback('Prueba separando entre «' + letters[missing - 1] + '» y «' + letters[missing] + '».');
    else feedback('Tu separación ya está lista. Toca «Revisar separación».');
  } else {
    const same = data.vowelTogether(current, cuts);
    feedback(same ? 'Las dos vocales destacadas están en un mismo bloque de sílaba. ¿Cómo se llama esa unión?' :
      'Las dos vocales destacadas están en bloques de sílabas diferentes. ¿Cómo se llama esa separación?');
  }
}
function celebrate() {
  if (stage !== 'done' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const host = $('hd-celebration'); host.replaceChildren();
  for (let i = 0; i < 14; i++) {
    const piece = document.createElement('span'); piece.className = 'hd-spark';
    piece.textContent = ['⭐', '✦', '●'][i % 3];
    const angle = i / 14 * Math.PI * 2, distance = Math.min(innerWidth * .35, 250);
    piece.style.setProperty('--x', Math.cos(angle) * distance + 'px');
    piece.style.setProperty('--y', Math.sin(angle) * distance + 'px');
    piece.style.setProperty('--r', i * 25 + 'deg');
    piece.style.color = ['#7451c8', '#e7ad40', '#3a9d8b'][i % 3]; host.append(piece);
  }
  const id = ticket; setTimeout(() => { if (id === ticket) host.replaceChildren(); }, 1800);
}
function classify(kind) {
  if (stage !== 'classify') return;
  attempts++;
  if (kind !== current.kind) {
    feedback('Mira otra vez los bloques: diptongo significa juntas en una sílaba; hiato significa en sílabas distintas.', 'retry');
    return;
  }
  stage = 'done'; lastWord = current.word;
  results.push({ word: current.word, syllables: current.syllables.slice(), kind, helped, attempts });
  $('hd-step-two').className = 'complete';
  for (const k of ['hiato', 'diptongo']) $('hd-' + k).disabled = true;
  $('hd-' + kind).classList.add('correct'); $('hd-hint').hidden = true;
  $('hd-track-fill').style.width = ((index + 1) / session.length * 100) + '%';
  const sentence = current.syllables.join(' · ') + '. «' + current.pair + '» forma un ' + current.kind + '. ' + data.explanation(current);
  $('hd-explanation').textContent = sentence; $('hd-success').hidden = false;
  $('hd-next').textContent = index + 1 === session.length ? 'Ver mi resultado →' : 'Siguiente palabra →';
  feedback('¡Bien observado!', 'good');
  $('hd-success').scrollIntoView({ block: 'nearest', behavior: 'auto' });
  if (settings.sound) speak(current.word + '. ' + data.explanation(current), celebrate); else celebrate();
}
function finish() {
  ticket++; stopSpeech(); $('hd-celebration').replaceChildren();
  $('hd-game').hidden = true; $('hd-finish').hidden = false;
  const h = results.filter(r => r.kind === 'hiato').length, d = results.length - h;
  $('hd-summary').textContent = (settings.name ? settings.name + ', ' : '') + 'completaste ' + results.length + ' palabras: ' + h + ' hiatos y ' + d + ' diptongos. ' + (helpCount ? 'Usaste pistas en ' + helpCount + ' palabras.' : '¡Lo hiciste sin pistas!');
  const host = $('hd-results'); host.replaceChildren();
  for (const result of results) {
    const card = document.createElement('div'); card.className = 'hd-result';
    const title = document.createElement('strong'); title.textContent = result.word;
    const info = document.createElement('span'); info.textContent = result.syllables.join(' · ') + ' · ' + result.kind;
    card.append(title, info); host.append(card);
  }
  $('hd-finish').scrollIntoView({ block: 'start', behavior: 'auto' });
}
function configure() {
  ticket++; stopSpeech(); $('hd-celebration').replaceChildren();
  $('hd-game').hidden = true; $('hd-finish').hidden = true; $('hd-settings').hidden = false;
  current = null; updateAvailable(); $('hd-settings').scrollIntoView({ block: 'start', behavior: 'auto' });
}
$('hd-start').addEventListener('click', start);
$('hd-again').addEventListener('click', start);
$('hd-config').addEventListener('click', configure);
$('hd-home').addEventListener('click', configure);
$('hd-review').addEventListener('click', checkSeparation);
$('hd-clear').addEventListener('click', () => { if (stage !== 'separate') return; cuts.clear(); feedback(''); renderLetters(); renderPreview(); updateReferenceWord(); updateVowelState(); });
$('hd-drag-token').addEventListener('pointerdown', startDrag);
// El seguimiento se hace desde la ventana: así el gesto sigue funcionando si el
// navegador pierde la captura del botón al pasar por encima de una letra.
window.addEventListener('pointermove', event => { if (dragPointer === event.pointerId) moveDragToken(event); });
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);
$('hd-drag-token').addEventListener('click', event => { if (!event.detail) feedback('Mantén presionado el guion y arrástralo al espacio entre dos letras.'); });
$('hd-hint').addEventListener('click', giveHint);
$('hd-listen-word').addEventListener('click', () => { if (current) speak(current.word); });
$('hd-hiato').addEventListener('click', () => classify('hiato'));
$('hd-diptongo').addEventListener('click', () => classify('diptongo'));
$('hd-next').addEventListener('click', () => {
  if (stage !== 'done') return;
  index++; if (index >= session.length) finish(); else showWord();
});
window.addEventListener('pagehide', () => { ticket++; stopSpeech(); });
updateAvailable();
})();
