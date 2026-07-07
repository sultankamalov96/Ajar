// Английская страница «Весёлой Азбуки»: все игры с английской озвучкой.
// Данные (EN_ALPHABET, EN_NUMBERS, VOCAB c полем en) — в data.js
const PRAISES = ['Well done! 🎉', 'Great! ⭐', 'Correct! 👏', 'Super! 🌟'];
const TRY_AGAIN = ['Попробуй ещё! 🤔', 'Almost! Ещё разок 💪', 'Не сдавайся! 🙌'];
const ROUNDS = 10;
const STARS_PER_STICKER = 25;

// Настройки и прогресс общие с русской страницей
const settings = Object.assign(
  { voice: 'sv', rate: 1, sound: true },
  JSON.parse(localStorage.getItem('azbuka-settings') || '{}'),
);

function saveSettings() {
  localStorage.setItem('azbuka-settings', JSON.stringify(settings));
}

const progress = Object.assign(
  { seenL: [], seenN: [], stars: 0, games: 0, errors: {} },
  JSON.parse(localStorage.getItem('azbuka-progress') || '{}'),
);

function saveProgress() {
  localStorage.setItem('azbuka-progress', JSON.stringify(progress));
}

// ============ ОЗВУЧКА (английская) ============
let enVoice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  enVoice = voices.find(v => v.lang.startsWith('en')) || null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function speakThen(text, onDone) {
  if (!settings.sound || !('speechSynthesis' in window)) { onDone(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  if (enVoice) u.voice = enVoice;
  u.rate = 0.85 * settings.rate;
  u.onend = onDone;
  u.onerror = onDone;
  speechSynthesis.speak(u);
}

const audioPlayer = new Audio();
let seqId = 0;

function playClip(sources, fallbackText, onDone) {
  const tryNext = k => {
    if (k >= sources.length) {
      speakThen(fallbackText, onDone);
      return;
    }
    let failed = false;
    const fail = () => {
      if (!failed) { failed = true; tryNext(k + 1); }
    };
    audioPlayer.onerror = fail;
    audioPlayer.onended = onDone;
    audioPlayer.src = sources[k];
    audioPlayer.playbackRate = settings.rate;
    audioPlayer.play().catch(fail);
  };
  tryNext(0);
}

function playSequence(clips) {
  if (!settings.sound) return;
  speechSynthesis.cancel();
  const seq = ++seqId;
  const next = idx => {
    if (idx >= clips.length || seq !== seqId) return;
    playClip(clips[idx].sources, clips[idx].text, () => next(idx + 1));
  };
  next(0);
}

const pad2 = n => String(n).padStart(2, '0');

function clipEn(path, text) {
  return { sources: [`audio/${path}.webm`, `audio/${path}.m4a`], text };
}

// Английское число прописью 0–100 (запасной текст для синтезатора)
const EN_TENS = { 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty',
                  60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety' };

function enNumWords(n) {
  if (n <= 20) return EN_NUMBERS[n];
  if (n === 100) return 'one hundred';
  const t = Math.floor(n / 10) * 10, u = n % 10;
  return EN_TENS[t] + (u ? '-' + EN_NUMBERS[u] : '');
}

const playEnLetter = i => playSequence([
  clipEn(`en/letters/${pad2(i)}`, EN_ALPHABET[i].letter),
  clipEn(`en/words/${pad2(i)}`, EN_ALPHABET[i].word),
]);
const playEnLetterOnly = i => playSequence([clipEn(`en/letters/${pad2(i)}`, EN_ALPHABET[i].letter)]);
const playEnWord = i => playSequence([clipEn(`en/words/${pad2(i)}`, EN_ALPHABET[i].word)]);
const playEnNumber = n => playSequence([clipEn(`en/numbers/${pad2(n)}`, enNumWords(n))]);
const playEnVocab = (catKey, i, text) => playSequence([clipEn(`en/vocab/${catKey}/${pad2(i)}`, text)]);
const playEnPhrase = (key, text) => playSequence([clipEn(`en/phrases/${key}`, text)]);

const EN_PRAISE_TEXTS = ['Well done!', 'Great!', 'Correct!'];

function playEnPraise() {
  const k = Math.floor(Math.random() * 3);
  playEnPhrase(`praise${k}`, EN_PRAISE_TEXTS[k]);
}

// ============ ЗВУКОВЫЕ ЭФФЕКТЫ И КОНФЕТТИ ============
let audioCtx = null;

function beep(freqs, dur, type) {
  if (!settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + i * dur);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (i + 1) * dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * dur);
      osc.stop(audioCtx.currentTime + (i + 1) * dur);
    });
  } catch (e) { /* звук — не критично */ }
}

const dingCorrect = () => beep([660, 880], 0.12, 'sine');
const dingWrong = () => beep([220], 0.18, 'triangle');

function confettiBurst() {
  const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#339af0', '#cc5de8'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = 2 + Math.random() * 1.5 + 's';
    c.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

const randomOf = arr => arr[Math.floor(Math.random() * arr.length)];
const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ НАВИГАЦИЯ ============
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0 });
  speechSynthesis.cancel();
}

document.querySelectorAll('.tab[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    showScreen(tab.dataset.tab);
    if (tab.dataset.tab === 'games') renderRewards();
  });
});

const GAME_STARTERS = {
  'game-listen': () => startListenGame(),
  'game-word': () => startWordGame(),
  'game-vocab': () => startVocabGame(),
  'game-build': () => startBuildGame(),
  'game-num': () => startNumGame(),
  'game-count': () => startCountGame(),
  'game-add': () => startAddGame(),
  'game-math': () => startMathGame(),
  'game-compare': () => startCompareGame(),
};

document.querySelectorAll('.game-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    showScreen(tile.dataset.game);
    GAME_STARTERS[tile.dataset.game]();
  });
});

document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen('games');
    renderRewards();
  });
});

// ============ ABC ============
const abcGrid = document.getElementById('abcGrid');
EN_ALPHABET.forEach((item, i) => {
  const btn = document.createElement('button');
  btn.className = 'letter-card english';
  btn.innerHTML = `<span class="big">${item.letter}${item.letter.toLowerCase()}</span>` +
    `<span class="emoji">${item.emoji}</span><span class="en-word">${item.word}</span>`;
  btn.addEventListener('click', () => playEnLetter(i));
  abcGrid.appendChild(btn);
});

// ============ NUMBERS ============
const numGrid = document.getElementById('numGrid');
EN_NUMBERS.forEach((word, i) => {
  const btn = document.createElement('button');
  btn.className = 'letter-card english';
  btn.innerHTML = `<span class="big">${i}</span>` +
    `<span class="emoji">${NUMBERS[i].emoji}</span><span class="en-word">${word}</span>`;
  btn.addEventListener('click', () => playEnNumber(i));
  numGrid.appendChild(btn);
});

// ============ WORDS ============
let wordCatIdx = 0;
const wordCatsBox = document.getElementById('wordCats');

VOCAB.forEach((cat, i) => {
  const btn = document.createElement('button');
  btn.className = 'vocab-cat-btn' + (i === 0 ? ' active' : '');
  btn.textContent = `${cat.icon} ${cat.title}`;
  btn.addEventListener('click', () => {
    wordCatIdx = i;
    document.querySelectorAll('#wordCats .vocab-cat-btn').forEach((b, k) =>
      b.classList.toggle('active', k === i));
    renderWordGrid();
  });
  wordCatsBox.appendChild(btn);
});

function renderWordGrid() {
  const cat = VOCAB[wordCatIdx];
  const grid = document.getElementById('wordGrid');
  grid.innerHTML = '';
  cat.items.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'vocab-card';
    btn.innerHTML = `<span class="vocab-emoji">${item.emoji}</span>` +
      `<span class="vocab-word">${item.en}</span><span class="vocab-ru">${item.word}</span>`;
    btn.addEventListener('click', () => playEnVocab(cat.key, i, item.en));
    grid.appendChild(btn);
  });
}
renderWordGrid();

// ============ НАГРАДЫ (общие с русской страницей) ============
function renderRewards() {
  document.getElementById('starsTotal').textContent = progress.stars;
  const shelf = document.getElementById('stickersShelf');
  const count = Math.min(Math.floor(progress.stars / STARS_PER_STICKER), STICKERS.length);
  shelf.innerHTML = STICKERS.slice(0, count).map(s => `<span class="sticker">${s}</span>`).join('')
    + (count < STICKERS.length ? `<span class="sticker locked">❔</span>` : '');
}

// ============ ИГРЫ: ОБЩЕЕ ============
function updateScore(elId, state) {
  document.getElementById(elId).innerHTML =
    `Раунд ${state.round} из ${ROUNDS} &nbsp; ${'⭐'.repeat(state.score)}`;
}

const GAMES = {
  listen:  { state: () => listenState,  restart: 'startListenGame',  ids: ['listenOptions', 'listenScore', 'listenFeedback'] },
  word:    { state: () => wordState,    restart: 'startWordGame',    ids: ['wordOptions', 'wordScore', 'wordFeedback'] },
  vocab:   { state: () => vocabState,   restart: 'startVocabGame',   ids: ['vocabOptions', 'vocabScore', 'vocabFeedback'] },
  build:   { state: () => buildState,   restart: 'startBuildGame',   ids: ['buildPool', 'buildScore', 'buildFeedback'] },
  num:     { state: () => numState,     restart: 'startNumGame',     ids: ['numOptions', 'numScore', 'numFeedback'] },
  count:   { state: () => countState,   restart: 'startCountGame',   ids: ['countOptions', 'countScore', 'countFeedback'] },
  add:     { state: () => addState,     restart: 'startAddGame',     ids: ['addOptions', 'addScore', 'addFeedback'] },
  math:    { state: () => mathState,    restart: 'startMathGame',    ids: ['mathOptions', 'mathScore', 'mathFeedback'] },
  compare: { state: () => compareState, restart: 'startCompareGame', ids: [null, 'compareScore', 'compareFeedback'] },
};

function finishGame(game) {
  const cfg = GAMES[game];
  const state = cfg.state();
  const isGreat = state.score >= 8;
  const message = isGreat
    ? `🏆 Hooray! ${state.score} из ${ROUNDS}! Ты знаток английского!`
    : `🎈 Ты набрал ${state.score} из ${ROUNDS}! Сыграем ещё раз?`;

  const [optionsId, scoreId, feedbackId] = cfg.ids;
  if (optionsId) document.getElementById(optionsId).innerHTML = '';
  document.getElementById(scoreId).textContent = '⭐'.repeat(state.score);
  if (game === 'word') {
    document.getElementById('wordEmoji').textContent = isGreat ? '🏆' : '🎈';
    document.getElementById('wordText').textContent = '';
  }
  if (game === 'count') document.getElementById('countObjects').textContent = isGreat ? '🏆' : '🎈';
  if (game === 'add') document.getElementById('addExpr').textContent = isGreat ? '🏆' : '🎈';
  if (game === 'math') document.getElementById('mathExpr').textContent = isGreat ? '🏆' : '🎈';
  if (game === 'vocab') document.getElementById('vocabEmoji').textContent = isGreat ? '🏆' : '🎈';
  if (game === 'build') {
    document.getElementById('buildEmoji').textContent = isGreat ? '🏆' : '🎈';
    document.getElementById('buildSlots').innerHTML = '';
  }
  if (game === 'compare') {
    document.getElementById('compareA').style.display = 'none';
    document.getElementById('compareB').style.display = 'none';
  }
  document.getElementById(feedbackId).innerHTML =
    `${message}<br><button class="play-again-btn" onclick="${cfg.restart}()">🔁 Play again</button>`;

  const before = Math.floor(progress.stars / STARS_PER_STICKER);
  progress.stars += state.score;
  progress.games += 1;
  saveProgress();
  const newSticker = Math.floor(progress.stars / STARS_PER_STICKER) > before;

  if (isGreat || newSticker) confettiBurst();
  if (newSticker) {
    document.getElementById(feedbackId).innerHTML =
      `🎁 Новая наклейка в коллекции!<br>` + document.getElementById(feedbackId).innerHTML;
  }
  playEnPhrase(isGreat ? 'win' : 'again',
    isGreat ? 'Hooray! Well done!' : "Good! Let's play again!");
}

function handleAnswer(state, btn, isCorrect, feedbackId, onCorrect) {
  if (state.locked) return false;
  const feedback = document.getElementById(feedbackId);
  if (isCorrect) {
    state.locked = true;
    state.score++;
    btn.classList.add('correct');
    feedback.textContent = randomOf(PRAISES);
    dingCorrect();
    onCorrect();
    return true;
  }
  btn.classList.add('wrong');
  feedback.textContent = randomOf(TRY_AGAIN);
  dingWrong();
  setTimeout(() => btn.classList.remove('wrong'), 500);
  return false;
}

// ============ GAME: FIND THE LETTER ============
const listenState = { answer: -1, round: 0, score: 0, locked: false };

function startListenGame() {
  listenState.round = 0;
  listenState.score = 0;
  nextListenRound();
}

function nextListenRound() {
  if (listenState.round >= ROUNDS) { finishGame('listen'); return; }
  listenState.round++;
  listenState.locked = false;

  const idxs = shuffle(EN_ALPHABET.map((_, i) => i)).slice(0, 4);
  listenState.answer = randomOf(idxs);

  updateScore('listenScore', listenState);
  document.getElementById('listenFeedback').textContent = '';

  const box = document.getElementById('listenOptions');
  box.innerHTML = '';
  idxs.forEach(i => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = EN_ALPHABET[i].letter;
    btn.addEventListener('click', () => {
      if (handleAnswer(listenState, btn, i === listenState.answer,
          'listenFeedback', () => { playEnPraise(); setTimeout(nextListenRound, 1400); })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playEnLetterOnly(listenState.answer), 400);
}

document.getElementById('listenPlayBtn').addEventListener('click', () => {
  if (listenState.answer >= 0) playEnLetterOnly(listenState.answer);
});

// ============ GAME: FIRST LETTER ============
const wordState = { answer: -1, round: 0, score: 0, locked: false };

function startWordGame() {
  wordState.round = 0;
  wordState.score = 0;
  nextWordRound();
}

function nextWordRound() {
  if (wordState.round >= ROUNDS) { finishGame('word'); return; }
  wordState.round++;
  wordState.locked = false;

  const idxs = shuffle(EN_ALPHABET.map((_, i) => i)).slice(0, 4);
  wordState.answer = randomOf(idxs);
  const item = EN_ALPHABET[wordState.answer];

  updateScore('wordScore', wordState);
  document.getElementById('wordFeedback').textContent = '';
  document.getElementById('wordEmoji').textContent = item.emoji;
  document.getElementById('wordText').innerHTML =
    `<span class="blank">?</span>` + item.word.slice(1).toLowerCase();

  const box = document.getElementById('wordOptions');
  box.innerHTML = '';
  idxs.forEach(i => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = EN_ALPHABET[i].letter;
    btn.addEventListener('click', () => {
      if (handleAnswer(wordState, btn, i === wordState.answer,
          'wordFeedback', () => {
            document.getElementById('wordText').innerHTML =
              `<span class="blank">${item.letter}</span>` + item.word.slice(1).toLowerCase();
            playEnPraise();
            setTimeout(nextWordRound, 1400);
          })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playEnWord(wordState.answer), 400);
}

// ============ GAME: WHAT IS THIS? ============
const vocabState = { answer: null, catKey: '', itemIndex: 0, round: 0, score: 0, locked: false };
const VOCAB_GAME_CATS = VOCAB.filter(c => c.key !== 'phrases');

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!settings.vocabMode || (settings.vocabMode === 'speak' && !SpeechRec)) {
  settings.vocabMode = SpeechRec ? 'speak' : 'tap';
}
if (!settings.vocabCat) settings.vocabCat = 'all';
if (settings.vocabCat !== 'all' && !VOCAB_GAME_CATS.some(c => c.key === settings.vocabCat)) {
  settings.vocabCat = 'all';
}

let recognizer = null;
let listening = false;

function getRecognizer() {
  if (recognizer) return recognizer;
  recognizer = new SpeechRec();
  recognizer.lang = 'en-US';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 5;
  recognizer.onresult = e => {
    const variants = [...e.results[0]].map(a => a.transcript);
    evalVocabSpeech(variants);
  };
  recognizer.onerror = e => {
    stopListenUI();
    document.getElementById('vocabFeedback').textContent =
      e.error === 'not-allowed'
        ? 'Разреши доступ к микрофону 🎤'
        : 'Не расслышала — нажми и скажи ещё раз! 🎤';
  };
  recognizer.onend = stopListenUI;
  return recognizer;
}

function stopListenUI() {
  listening = false;
  const btn = document.getElementById('vocabMicBtn');
  btn.classList.remove('listening');
  btn.textContent = '🎤 Говори!';
}

const normSpeech = s => s.toLowerCase().replace(/[^a-z ]/g, '').trim();

function evalVocabSpeech(variants) {
  if (vocabState.locked) return;
  const target = normSpeech(vocabState.answer.en);
  document.getElementById('vocabHeard').textContent = `Ты сказал: «${variants[0].trim()}»`;
  const hit = variants.map(normSpeech).some(h =>
    h.includes(target) || (target.includes(h) && h.length > 2));

  const feedback = document.getElementById('vocabFeedback');
  vocabState.locked = true;
  if (hit) {
    vocabState.score++;
    feedback.textContent = randomOf(PRAISES);
    dingCorrect();
    playEnPraise();
    setTimeout(nextVocabRound, 1600);
  } else {
    feedback.textContent = `This is ${vocabState.answer.en.toLowerCase()}! ${vocabState.answer.emoji}`;
    dingWrong();
    playSequence([
      clipEn('en/phrases/this_is', 'This is'),
      clipEn(`en/vocab/${vocabState.catKey}/${pad2(vocabState.itemIndex)}`, vocabState.answer.en),
    ]);
    setTimeout(nextVocabRound, 2800);
  }
}

document.getElementById('vocabMicBtn').addEventListener('click', () => {
  if (vocabState.locked) return;
  if (listening) {
    recognizer.stop();
    return;
  }
  try {
    getRecognizer().start();
    listening = true;
    const btn = document.getElementById('vocabMicBtn');
    btn.classList.add('listening');
    btn.textContent = '👂 Слушаю…';
    document.getElementById('vocabFeedback').textContent = '';
    document.getElementById('vocabHeard').textContent = '';
  } catch (e) { /* уже слушает */ }
});

const vocabCatPicker = document.getElementById('vocabCatPicker');
[{ key: 'all', icon: '🎲', title: 'Все' },
 ...VOCAB_GAME_CATS.map(c => ({ key: c.key, icon: c.icon, title: c.title }))]
  .forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'range-btn';
    btn.dataset.cat = cat.key;
    btn.textContent = `${cat.icon} ${cat.title}`;
    btn.addEventListener('click', () => {
      settings.vocabCat = cat.key;
      saveSettings();
      startVocabGame();
    });
    vocabCatPicker.appendChild(btn);
  });

function renderVocabPickers() {
  const speakChip = document.querySelector('#vocabModePicker .range-btn[data-mode="speak"]');
  if (!SpeechRec) speakChip.style.display = 'none';
  document.querySelectorAll('#vocabModePicker .range-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.mode === settings.vocabMode));
  document.querySelectorAll('#vocabCatPicker .range-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.cat === settings.vocabCat));

  const speak = settings.vocabMode === 'speak';
  document.getElementById('vocabMicBtn').style.display = speak ? '' : 'none';
  document.getElementById('vocabHeard').style.display = speak ? '' : 'none';
  document.getElementById('vocabHint').textContent = speak
    ? 'Что на картинке? Скажи по-английски!'
    : 'Что на картинке? Выбери английское слово!';
}

document.querySelectorAll('#vocabModePicker .range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.vocabMode = btn.dataset.mode;
    saveSettings();
    startVocabGame();
  });
});

function startVocabGame() {
  vocabState.round = 0;
  vocabState.score = 0;
  renderVocabPickers();
  nextVocabRound();
}

function nextVocabRound() {
  if (vocabState.round >= ROUNDS) {
    document.getElementById('vocabMicBtn').style.display = 'none';
    document.getElementById('vocabHeard').textContent = '';
    finishGame('vocab');
    return;
  }
  vocabState.round++;
  vocabState.locked = false;

  const cat = settings.vocabCat === 'all'
    ? randomOf(VOCAB_GAME_CATS)
    : VOCAB_GAME_CATS.find(c => c.key === settings.vocabCat);
  const options = shuffle(cat.items).slice(0, 4);
  vocabState.answer = randomOf(options);
  vocabState.catKey = cat.key;
  vocabState.itemIndex = cat.items.indexOf(vocabState.answer);

  updateScore('vocabScore', vocabState);
  document.getElementById('vocabFeedback').textContent = '';
  document.getElementById('vocabHeard').textContent = '';
  document.getElementById('vocabEmoji').textContent = vocabState.answer.emoji;

  const box = document.getElementById('vocabOptions');
  box.innerHTML = '';
  if (settings.vocabMode === 'tap') {
    options.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'option-btn word-option';
      btn.textContent = item.en;
      btn.addEventListener('click', () => {
        if (handleAnswer(vocabState, btn, item === vocabState.answer,
            'vocabFeedback', () => {
              const k = Math.floor(Math.random() * 3);
              playSequence([
                clipEn(`en/vocab/${vocabState.catKey}/${pad2(vocabState.itemIndex)}`, vocabState.answer.en),
                clipEn(`en/phrases/praise${k}`, EN_PRAISE_TEXTS[k]),
              ]);
              setTimeout(nextVocabRound, 2000);
            })) return;
      });
      box.appendChild(btn);
    });
  }

  setTimeout(() => playEnPhrase('what', 'What is this?'), 400);
}

// ============ GAME: BUILD THE WORD ============
// Короткие слова без пробелов и дефисов
const EN_BUILD = EN_ALPHABET
  .map((a, i) => ({ word: a.word.toUpperCase(), emoji: a.emoji, idx: i }))
  .filter(a => a.word.length <= 5 && /^[A-Z]+$/.test(a.word));
const BUILD_ROUNDS = 6;
const buildState = { answer: null, pos: 0, round: 0, score: 0, locked: false, mistakes: 0 };

function startBuildGame() {
  buildState.round = 0;
  buildState.score = 0;
  document.getElementById('buildEmoji').textContent = '';
  nextBuildRound();
}

function nextBuildRound() {
  if (buildState.round >= BUILD_ROUNDS) {
    buildState.round = ROUNDS;
    finishGame('build');
    return;
  }
  buildState.round++;
  buildState.locked = false;
  buildState.pos = 0;
  buildState.mistakes = 0;
  buildState.answer = randomOf(EN_BUILD);

  document.getElementById('buildScore').innerHTML =
    `Слово ${buildState.round} из ${BUILD_ROUNDS} &nbsp; ${'⭐'.repeat(buildState.score)}`;
  document.getElementById('buildFeedback').textContent = '';
  document.getElementById('buildEmoji').textContent = buildState.answer.emoji;

  document.getElementById('buildSlots').innerHTML =
    [...buildState.answer.word].map(() => `<span class="build-slot"></span>`).join('');

  const pool = document.getElementById('buildPool');
  pool.innerHTML = '';
  shuffle([...buildState.answer.word]).forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'option-btn build-letter';
    btn.textContent = ch;
    btn.addEventListener('click', () => tapBuildLetter(btn, ch));
    pool.appendChild(btn);
  });

  setTimeout(() => playEnWord(buildState.answer.idx), 400);
}

function tapBuildLetter(btn, ch) {
  if (buildState.locked || btn.disabled) return;
  const need = buildState.answer.word[buildState.pos];
  const feedback = document.getElementById('buildFeedback');
  if (ch === need) {
    btn.disabled = true;
    btn.classList.add('used');
    const slot = document.querySelectorAll('#buildSlots .build-slot')[buildState.pos];
    slot.textContent = ch;
    slot.classList.add('filled');
    buildState.pos++;
    dingCorrect();
    if (buildState.pos >= buildState.answer.word.length) {
      buildState.locked = true;
      buildState.score += buildState.mistakes === 0 ? 2 : 1;
      feedback.textContent = randomOf(PRAISES);
      const k = Math.floor(Math.random() * 3);
      playSequence([
        clipEn(`en/words/${pad2(buildState.answer.idx)}`, buildState.answer.word),
        clipEn(`en/phrases/praise${k}`, EN_PRAISE_TEXTS[k]),
      ]);
      setTimeout(nextBuildRound, 1800);
    }
  } else {
    buildState.mistakes++;
    btn.classList.add('wrong');
    feedback.textContent = randomOf(TRY_AGAIN);
    dingWrong();
    setTimeout(() => btn.classList.remove('wrong'), 500);
  }
}

// ============ GAME: FIND THE NUMBER ============
const numState = { answer: null, round: 0, score: 0, locked: false };
if (!Array.isArray(settings.numRange)) settings.numRange = [0, 10];

function renderNumRange() {
  document.querySelectorAll('#numRangePicker .range-btn').forEach(btn => {
    btn.classList.toggle('active',
      +btn.dataset.min === settings.numRange[0] && +btn.dataset.max === settings.numRange[1]);
  });
}

document.querySelectorAll('#numRangePicker .range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.numRange = [+btn.dataset.min, +btn.dataset.max];
    saveSettings();
    startNumGame();
  });
});

function startNumGame() {
  numState.round = 0;
  numState.score = 0;
  renderNumRange();
  nextNumRound();
}

function nextNumRound() {
  if (numState.round >= ROUNDS) { finishGame('num'); return; }
  numState.round++;
  numState.locked = false;

  const [min, max] = settings.numRange;
  const pool = [];
  for (let n = min; n <= max; n++) pool.push(n);
  const options = shuffle(pool).slice(0, 4);
  numState.answer = randomOf(options);

  updateScore('numScore', numState);
  document.getElementById('numFeedback').textContent = '';

  const box = document.getElementById('numOptions');
  box.innerHTML = '';
  options.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = n;
    btn.addEventListener('click', () => {
      if (handleAnswer(numState, btn, n === numState.answer,
          'numFeedback', () => { playEnPraise(); setTimeout(nextNumRound, 1400); })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playEnNumber(numState.answer), 400);
}

document.getElementById('numPlayBtn').addEventListener('click', () => {
  if (numState.answer !== null) playEnNumber(numState.answer);
});

// ============ GAME: HOW MANY? ============
const countState = { answer: 0, round: 0, score: 0, locked: false };

function startCountGame() {
  countState.round = 0;
  countState.score = 0;
  nextCountRound();
}

function nextCountRound() {
  if (countState.round >= ROUNDS) { finishGame('count'); return; }
  countState.round++;
  countState.locked = false;

  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const options = shuffle(pool).slice(0, 4);
  countState.answer = randomOf(options);
  const emoji = NUMBERS[countState.answer].emoji;

  updateScore('countScore', countState);
  document.getElementById('countFeedback').textContent = '';
  document.getElementById('countObjects').textContent = emoji.repeat(countState.answer);

  const box = document.getElementById('countOptions');
  box.innerHTML = '';
  options.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = n;
    btn.addEventListener('click', () => {
      if (handleAnswer(countState, btn, n === countState.answer,
          'countFeedback', () => {
            playEnNumber(countState.answer);
            setTimeout(nextCountRound, 1600);
          })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playEnPhrase('how_many', 'How many?'), 400);
}

// ============ GAME: ADDITION ============
const addState = { answer: 0, round: 0, score: 0, locked: false };

function startAddGame() {
  addState.round = 0;
  addState.score = 0;
  nextAddRound();
}

function nextAddRound() {
  if (addState.round >= ROUNDS) { finishGame('add'); return; }
  addState.round++;
  addState.locked = false;

  const a = rnd(1, 5);
  const b = rnd(1, Math.min(5, 10 - a));
  addState.answer = a + b;
  const emoji = NUMBERS[rnd(1, 10)].emoji;

  updateScore('addScore', addState);
  document.getElementById('addFeedback').textContent = '';
  document.getElementById('addExpr').innerHTML =
    `<span class="add-group">${emoji.repeat(a)}</span><span class="add-sign">+</span>` +
    `<span class="add-group">${emoji.repeat(b)}</span><span class="add-sign">=</span><span class="add-sign">?</span>`;

  const wrongs = shuffle([...Array(10).keys()].map(n => n + 1).filter(n => n !== addState.answer)).slice(0, 3);
  const options = shuffle([addState.answer, ...wrongs]);

  const box = document.getElementById('addOptions');
  box.innerHTML = '';
  options.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = n;
    btn.addEventListener('click', () => {
      if (handleAnswer(addState, btn, n === addState.answer,
          'addFeedback', () => {
            playEnNumber(addState.answer);
            setTimeout(nextAddRound, 1600);
          })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playEnPhrase('altogether', 'How many altogether?'), 400);
}

// ============ GAME: MATH ============
const mathState = { answer: 0, round: 0, score: 0, locked: false };
if (!settings.mathOp) settings.mathOp = 'add';
if (![10, 20, 50, 100].includes(settings.mathMax)) settings.mathMax = 20;

const MATH_OPS = {
  add(M) {
    const a = rnd(1, M - 1);
    const b = rnd(1, M - a);
    return { text: `${a} + ${b}`, answer: a + b };
  },
  sub(M) {
    const a = rnd(2, M);
    const b = rnd(1, a - 1);
    return { text: `${a} − ${b}`, answer: a - b };
  },
  mul(M) {
    const a = rnd(2, Math.min(9, Math.floor(M / 2)));
    const b = rnd(2, Math.min(9, Math.floor(M / a)));
    return { text: `${a} × ${b}`, answer: a * b };
  },
  div(M) {
    const d = rnd(2, Math.min(9, Math.floor(M / 2)));
    const q = rnd(1, Math.min(9, Math.floor(M / d)));
    return { text: `${d * q} ÷ ${d}`, answer: q };
  },
};

function renderMathPickers() {
  document.querySelectorAll('#mathOpPicker .range-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.op === settings.mathOp));
  document.querySelectorAll('#mathMaxPicker .range-btn').forEach(btn =>
    btn.classList.toggle('active', +btn.dataset.max === settings.mathMax));
}

document.querySelectorAll('#mathOpPicker .range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.mathOp = btn.dataset.op;
    saveSettings();
    startMathGame();
  });
});

document.querySelectorAll('#mathMaxPicker .range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.mathMax = +btn.dataset.max;
    saveSettings();
    startMathGame();
  });
});

function startMathGame() {
  mathState.round = 0;
  mathState.score = 0;
  renderMathPickers();
  nextMathRound();
}

function nextMathRound() {
  if (mathState.round >= ROUNDS) { finishGame('math'); return; }
  mathState.round++;
  mathState.locked = false;

  const M = settings.mathMax;
  const op = settings.mathOp === 'mix' ? randomOf(Object.keys(MATH_OPS)) : settings.mathOp;
  const task = MATH_OPS[op](M);
  mathState.answer = task.answer;

  updateScore('mathScore', mathState);
  document.getElementById('mathFeedback').textContent = '';
  document.getElementById('mathExpr').textContent = `${task.text} = ?`;

  const spread = Math.max(4, Math.round(task.answer * 0.25));
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = task.answer + rnd(-spread, spread);
    if (w !== task.answer && w >= 0 && w <= M) wrongs.add(w);
  }
  const options = shuffle([task.answer, ...wrongs]);

  const box = document.getElementById('mathOptions');
  box.innerHTML = '';
  options.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = n;
    btn.addEventListener('click', () => {
      if (handleAnswer(mathState, btn, n === mathState.answer,
          'mathFeedback', () => {
            playEnNumber(mathState.answer);
            setTimeout(nextMathRound, 1600);
          })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playEnPhrase('solve', 'Solve the problem!'), 400);
}

// ============ GAME: MORE OR LESS ============
const compareState = { more: true, a: 0, b: 0, round: 0, score: 0, locked: false };

function startCompareGame() {
  compareState.round = 0;
  compareState.score = 0;
  document.getElementById('compareA').style.display = '';
  document.getElementById('compareB').style.display = '';
  nextCompareRound();
}

function nextCompareRound() {
  if (compareState.round >= ROUNDS) { finishGame('compare'); return; }
  compareState.round++;
  compareState.locked = false;
  compareState.more = Math.random() < 0.5;

  let a = rnd(1, 9);
  let b = rnd(1, 9);
  while (b === a) b = rnd(1, 9);
  compareState.a = a;
  compareState.b = b;
  const emoji = NUMBERS[rnd(1, 10)].emoji;

  updateScore('compareScore', compareState);
  document.getElementById('compareFeedback').textContent = '';
  document.getElementById('compareHint').textContent =
    compareState.more ? 'Where are there more? Нажми!' : 'Where are there fewer? Нажми!';

  const cardA = document.getElementById('compareA');
  const cardB = document.getElementById('compareB');
  cardA.textContent = emoji.repeat(a);
  cardB.textContent = emoji.repeat(b);
  cardA.classList.remove('correct', 'wrong');
  cardB.classList.remove('correct', 'wrong');

  setTimeout(() => playEnPhrase(
    compareState.more ? 'where_more' : 'where_less',
    compareState.more ? 'Where are there more?' : 'Where are there fewer?'), 400);
}

function checkCompare(card, count) {
  const target = compareState.more
    ? Math.max(compareState.a, compareState.b)
    : Math.min(compareState.a, compareState.b);
  if (handleAnswer(compareState, card, count === target, 'compareFeedback',
      () => { playEnPraise(); setTimeout(nextCompareRound, 1400); })) return;
}

document.getElementById('compareA').addEventListener('click', () =>
  !compareState.locked && checkCompare(document.getElementById('compareA'), compareState.a));
document.getElementById('compareB').addEventListener('click', () =>
  !compareState.locked && checkCompare(document.getElementById('compareB'), compareState.b));

// ============ СТАРТ ============
renderRewards();
