(() => {
  'use strict';
  const animals = window.ANIMAL_BANK;
  const storageKey = 'animal_lab_can_have_v1';
  const game = document.getElementById('game');
  const autoRead = document.getElementById('autoRead');
  const byId = new Map(animals.map(animal => [animal.id, animal]));
  const shuffle = items => [...items].sort(() => Math.random() - 0.5);
  const pick = items => items[Math.floor(Math.random() * items.length)];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (_) {}
  let deck = Array.isArray(saved.deck) && saved.deck.length === animals.length &&
    new Set(saved.deck).size === animals.length && saved.deck.every(id => byId.has(id))
    ? saved.deck : shuffle(animals.map(animal => animal.id));
  let index = Number.isInteger(saved.index) && saved.index >= 0 && saved.index < deck.length ? saved.index : 0;
  let score = Number.isInteger(saved.score) && saved.score >= 0 ? saved.score : 0;
  let step = 0;
  let answered = false;
  let selected = null;
  let lastWrong = null;
  autoRead.checked = saved.autoRead !== false;

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({deck, index, score, autoRead: autoRead.checked})); } catch (_) {}
  }
  function questionsFor(animal) {
    return shuffle([
      {kind:'have', correct:true, text:`Does it have ${pick(animal.haveYes)}?`},
      {kind:'have', correct:false, text:`Does it have ${pick(animal.haveNo)}?`},
      {kind:'can', correct:true, text:`Can the ${animal.name} ${pick(animal.canYes)}?`},
      {kind:'can', correct:false, text:`Can the ${animal.name} ${pick(animal.canNo)}?`}
    ]);
  }
  let questions = questionsFor(byId.get(deck[index]));
  function speak(message) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = .9;
    const voice = speechSynthesis.getVoices().find(voice => /^en([-_]|$)/i.test(voice.lang));
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  }
  function currentPrompt() {
    if (step === 0) return 'What animal is it?';
    if (step <= 4) return questions[step - 1].text;
    const name = byId.get(deck[index]).name;
    return `It is ${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}!`;
  }
  function render(read = false) {
    const animal = byId.get(deck[index]);
    const question = step >= 1 && step <= 4 ? questions[step - 1] : null;
    const done = step === 5;
    const label = step === 0 ? 'SAY IT' : done ? 'GREAT WORK' : question.kind.toUpperCase();
    const instruction = step === 0 ? 'Say its name out loud, then tap Continue.' : done ? 'You answered all four questions about this animal.' : 'Choose the correct answer.';
    const answerWords = question ? (question.kind === 'have' ? ['Yes, it does.', 'No, it doesn\'t.'] : ['Yes, it can.', 'No, it can\'t.']) : [];
    const feedback = lastWrong === null ? (answered ? 'Great job! You got it right.' : step === 0 ? 'Look at the picture. What animal is it?' : done ? 'Ready for another animal?' : 'Look at the animal and choose an answer.') : 'Try again. Look closely at the animal.';
    game.innerHTML = `
      <div class="topline"><div class="round">Animal ${index + 1} of ${deck.length}</div><div class="progress" aria-label="Question ${Math.min(step + 1, 5)} of 5">${Array.from({length:5}, (_, i) => `<span class="dot ${i < step ? 'done' : i === step ? 'now' : ''}">${i + 1}</span>`).join('')}</div><div class="score">⭐ ${score} correct</div></div>
      <div class="play"><div class="picture"><img src="images/${animal.id}.webp" alt="Animal to identify" draggable="false"></div>
      <section class="question-area"><span class="tag ${question ? question.kind : ''}">${label}</span><h2 class="question">${currentPrompt()}</h2><p class="instruction">${instruction}</p>
      ${question ? `<div class="answers">${answerWords.map((words, i) => `<button type="button" class="answer ${i ? 'no' : ''} ${selected === i ? 'chosen correct' : ''} ${lastWrong === i ? 'chosen incorrect' : ''}" data-answer="${i}" ${answered ? 'disabled' : ''}>${words}</button>`).join('')}</div>` : ''}
      <div class="feedback ${answered || done ? 'good' : lastWrong !== null ? 'try' : ''}" role="status">${feedback}</div>
      <div class="actions"><button type="button" class="primary" data-next ${question && !answered ? 'disabled' : ''}>${done ? 'Next animal →' : 'Continue →'}</button></div></section></div>`;
    if (read && autoRead.checked) speak(currentPrompt());
  }
  game.addEventListener('click', event => {
    const answer = event.target.closest('[data-answer]');
    if (answer && step >= 1 && step <= 4 && !answered) {
      const choice = Number(answer.dataset.answer);
      if ((choice === 0) === questions[step - 1].correct) {
        selected = choice; lastWrong = null; answered = true; score++; save(); render();
        if (autoRead.checked) speak('Great job!');
      } else {
        lastWrong = choice; render();
        if (autoRead.checked) speak('Try again.');
      }
      return;
    }
    if (!event.target.closest('[data-next]')) return;
    if (step >= 1 && step <= 4 && !answered) return;
    if (step === 5) {
      const previous = deck[index];
      index++;
      if (index >= deck.length) {
        deck = shuffle(animals.map(animal => animal.id));
        if (deck[0] === previous) [deck[0], deck[1]] = [deck[1], deck[0]];
        index = 0;
        score = 0;
      }
      questions = questionsFor(byId.get(deck[index]));
      step = 0;
      save();
    } else {
      step++;
    }
    answered = false; selected = null; lastWrong = null;
    render(true);
  });
  document.getElementById('listen').addEventListener('click', () => speak(currentPrompt()));
  document.getElementById('restart').addEventListener('click', () => {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const previous = deck[index];
    deck = shuffle(animals.map(animal => animal.id));
    if (deck[0] === previous) [deck[0], deck[1]] = [deck[1], deck[0]];
    index = 0; score = 0; step = 0; answered = false; selected = null; lastWrong = null;
    questions = questionsFor(byId.get(deck[index]));
    save(); render(true);
  });
  autoRead.addEventListener('change', save);
  save(); render(true);
})();
