// Данные алфавита, цифр, слогов и фраз — в data.js (общие с record.html)
const PRAISES = ['Молодец! 🎉', 'Отлично! ⭐', 'Умница! 🌟', 'Супер! 🎊', 'Правильно! 👏'];
const TRY_AGAIN = ['Попробуй ещё! 🤔', 'Почти! Ещё разок 💪', 'Не сдавайся! 🙌'];
const ROUNDS = 10;
const STARS_PER_STICKER = 25;

// ============ НАСТРОЙКИ ============
const settings = Object.assign(
  { voice: 'sv', rate: 1, sound: true },
  JSON.parse(localStorage.getItem('azbuka-settings') || '{}'),
);

function saveSettings() {
  localStorage.setItem('azbuka-settings', JSON.stringify(settings));
}

// ============ ПРОГРЕСС И СТАТИСТИКА ============
const progress = Object.assign(
  { seenL: [], seenN: [], stars: 0, games: 0, errors: {} },
  JSON.parse(localStorage.getItem('azbuka-progress') || '{}'),
);

function saveProgress() {
  localStorage.setItem('azbuka-progress', JSON.stringify(progress));
}

function markSeen(kind, i) {
  const arr = kind === 'letter' ? progress.seenL : progress.seenN;
  if (!arr.includes(i)) {
    arr.push(i);
    saveProgress();
    renderSeenBadges();
    renderStats();
  }
}

function addError(letter) {
  progress.errors[letter] = (progress.errors[letter] || 0) + 1;
  saveProgress();
}

// ============ ОЗВУЧКА ============
let ruVoice = null;
let enVoice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  ruVoice = voices.find(v => v.lang.startsWith('ru')) || null;
  enVoice = voices.find(v => v.lang.startsWith('en')) || null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text) {
  speakThen(text, () => {});
}

function speakThen(text, onDone, lang = 'ru-RU') {
  if (!settings.sound || !('speechSynthesis' in window)) { onDone(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const voice = lang.startsWith('en') ? enVoice : ruVoice;
  if (voice) u.voice = voice;
  u.rate = 0.85 * settings.rate;
  u.onend = onDone;
  u.onerror = onDone;
  speechSynthesis.speak(u);
}

// Порядок выбора озвучки: живая запись (.webm из record.html) →
// выбранный голос → голос по умолчанию → синтезатор
const audioPlayer = new Audio();
let seqId = 0; // новый запуск озвучки отменяет ещё не доигравшую предыдущую

function playClip(sources, fallbackText, onDone, lang = 'ru-RU') {
  const tryNext = k => {
    if (k >= sources.length) {
      speakThen(fallbackText, onDone, lang);
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

// clips: [{ sources: [...], text: 'запасной текст' }, ...] — играются по очереди
function playSequence(clips) {
  if (!settings.sound) return;
  speechSynthesis.cancel();
  const seq = ++seqId;
  const next = idx => {
    if (idx >= clips.length || seq !== seqId) return;
    playClip(clips[idx].sources, clips[idx].text, () => next(idx + 1), clips[idx].lang);
  };
  next(0);
}

const pad2 = n => String(n).padStart(2, '0');

function clipFor(path, text) {
  const sources = [`audio/${path}.webm`];
  if (settings.voice === 'dm') sources.push(`audio/dm/${path}.m4a`);
  sources.push(`audio/${path}.m4a`);
  return { sources, text };
}

function playLetter(i) {
  playSequence([
    clipFor('phrases/bukva', 'буква'),
    clipFor(`letters/${pad2(i)}`, ALPHABET[i].name),
  ]);
}

function playWord(i) {
  playSequence([clipFor(`words/${pad2(i)}`, ALPHABET[i].word)]);
}

function playNumber(i) {
  playSequence([clipFor(`numbers/${pad2(i)}`, NUMBERS[i].word)]);
}

// Число прописью (для запасной озвучки синтезатором чисел 21–100)
const RU_TENS = { 20: 'двадцать', 30: 'тридцать', 40: 'сорок', 50: 'пятьдесят',
                  60: 'шестьдесят', 70: 'семьдесят', 80: 'восемьдесят', 90: 'девяносто' };

function numWords(n) {
  if (n <= 20) return NUMBERS[n].word.toLowerCase();
  if (n === 100) return 'сто';
  const t = Math.floor(n / 10) * 10, u = n % 10;
  return RU_TENS[t] + (u ? ' ' + NUMBERS[u].word.toLowerCase() : '');
}

// Озвучка произвольного числа 0–100 (не только из сетки NUMBERS)
function playNumberValue(n) {
  playSequence([clipFor(`numbers/${pad2(n)}`, numWords(n))]);
}

function playSyllable(s) {
  playSequence([clipFor(`syllables/${s.key}`, s.text.toLowerCase())]);
}

function playPhrase(key, fallbackText) {
  playSequence([clipFor(`phrases/${key}`, fallbackText)]);
}

function playVocab(catKey, i, word) {
  playSequence([clipFor(`vocab/${catKey}/${pad2(i)}`, word)]);
}

// Английские клипы: без выбора голоса (Jenny), запасной синтезатор en-US
function clipEn(path, text) {
  return {
    sources: [`audio/${path}.webm`, `audio/${path}.m4a`],
    text,
    lang: 'en-US',
  };
}

function playEnLetter(i) {
  playSequence([
    clipEn(`en/letters/${pad2(i)}`, EN_ALPHABET[i].letter),
    clipEn(`en/words/${pad2(i)}`, EN_ALPHABET[i].word),
  ]);
}

function playEnNumber(i) {
  playSequence([clipEn(`en/numbers/${pad2(i)}`, EN_NUMBERS[i])]);
}

function playEnVocab(catKey, i, text) {
  playSequence([clipEn(`en/vocab/${catKey}/${pad2(i)}`, text)]);
}

function playPraise() {
  const p = randomOf(PHRASES.slice(0, 3));
  playPhrase(p.key, p.text);
}

// ============ ЗВУКОВЫЕ ЭФФЕКТЫ ============
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

// ============ КОНФЕТТИ ============
function confettiBurst() {
  const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#339af0', '#cc5de8'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = randomOf(colors);
    c.style.animationDuration = 2 + Math.random() * 1.5 + 's';
    c.style.animationDelay = Math.random() * 0.4 + 's';
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
    if (tab.dataset.tab === 'trace') initTraceOnce();
    if (tab.dataset.tab === 'more') renderStats();
    if (tab.dataset.tab === 'games') renderRewards();
  });
});

const GAME_STARTERS = {
  'game-listen': () => startListenGame(),
  'game-word': () => startWordGame(),
  'game-syl': () => startSylGame(),
  'game-build': () => startBuildGame(),
  'game-vocab': () => startVocabGame(),
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

// ============ АЛФАВИТ ============
const grid = document.getElementById('letterGrid');
let currentIndex = 0;

ALPHABET.forEach((item, i) => {
  const btn = document.createElement('button');
  btn.className = `letter-card ${item.type}`;
  btn.innerHTML = `<span class="big">${item.letter}${item.letter.toLowerCase()}</span><span class="emoji">${item.emoji}</span><span class="seen-badge">✓</span>`;
  btn.addEventListener('click', () => openLetter(i));
  grid.appendChild(btn);
});

const overlay = document.getElementById('modalOverlay');
let currentMode = 'letter'; // что открыто в карточке: буква или цифра

function openLetter(i) {
  currentMode = 'letter';
  currentIndex = i;
  document.getElementById('sayLetterBtn').textContent = '🔊 Буква';
  document.getElementById('sayWordBtn').style.display = '';
  const item = ALPHABET[i];
  const letterEl = document.getElementById('modalLetter');
  letterEl.textContent = `${item.letter} ${item.letter.toLowerCase()}`;
  letterEl.className = `modal-letter ${item.type}`;
  document.getElementById('modalName').textContent = `«${item.name}»`;
  const emojiEl = document.getElementById('modalEmoji');
  emojiEl.textContent = item.emoji;
  emojiEl.classList.remove('many');

  // Подсвечиваем нашу букву в слове
  const word = item.word;
  const pos = word.toUpperCase().indexOf(item.letter);
  const wordEl = document.getElementById('modalWord');
  if (pos >= 0) {
    wordEl.innerHTML = word.slice(0, pos) + `<span class="first">${word[pos]}</span>` + word.slice(pos + 1);
  } else {
    wordEl.textContent = word;
  }

  overlay.classList.add('open');
  markSeen('letter', i);
  playLetter(i);
}

// ============ ЦИФРЫ ============
const numberGrid = document.getElementById('numberGrid');

NUMBERS.forEach((item, i) => {
  const btn = document.createElement('button');
  btn.className = 'letter-card number';
  btn.innerHTML = `<span class="big">${item.digit}</span><span class="emoji">${item.emoji}</span><span class="seen-badge">✓</span>`;
  btn.addEventListener('click', () => openNumber(i));
  numberGrid.appendChild(btn);
});

function openNumber(i) {
  currentMode = 'number';
  currentIndex = i;
  const item = NUMBERS[i];
  const letterEl = document.getElementById('modalLetter');
  letterEl.textContent = item.digit;
  letterEl.className = 'modal-letter number';
  document.getElementById('modalName').textContent = `«${item.word.toLowerCase()}»`;

  const emojiEl = document.getElementById('modalEmoji');
  emojiEl.textContent = item.digit === 0 ? item.emoji : item.emoji.repeat(item.digit);
  emojiEl.classList.toggle('many', item.digit > 4);

  document.getElementById('modalWord').textContent = item.word;
  document.getElementById('sayLetterBtn').textContent = '🔊 Число';
  document.getElementById('sayWordBtn').style.display = 'none';

  overlay.classList.add('open');
  markSeen('number', i);
  playNumber(i);
}

function renderSeenBadges() {
  document.querySelectorAll('#letterGrid .letter-card').forEach((card, i) =>
    card.classList.toggle('seen', progress.seenL.includes(i)));
  document.querySelectorAll('#numberGrid .letter-card').forEach((card, i) =>
    card.classList.toggle('seen', progress.seenN.includes(i)));
}

// ============ ОБЩЕЕ ДЛЯ КАРТОЧКИ ============
document.getElementById('modalClose').addEventListener('click', () => overlay.classList.remove('open'));
overlay.addEventListener('click', e => {
  if (e.target === overlay) overlay.classList.remove('open');
});
document.getElementById('sayLetterBtn').addEventListener('click', () =>
  currentMode === 'letter' ? playLetter(currentIndex) : playNumber(currentIndex));
document.getElementById('sayWordBtn').addEventListener('click', () => playWord(currentIndex));
document.getElementById('prevLetter').addEventListener('click', () => {
  const len = currentMode === 'letter' ? ALPHABET.length : NUMBERS.length;
  const open = currentMode === 'letter' ? openLetter : openNumber;
  open((currentIndex - 1 + len) % len);
});
document.getElementById('nextLetter').addEventListener('click', () => {
  const len = currentMode === 'letter' ? ALPHABET.length : NUMBERS.length;
  const open = currentMode === 'letter' ? openLetter : openNumber;
  open((currentIndex + 1) % len);
});

// ============ СЛОГИ ============
const sylConsBox = document.getElementById('sylCons');
const sylCardsBox = document.getElementById('sylCards');
let currentCons = 0;

SYL_CONSONANTS.forEach((c, i) => {
  const btn = document.createElement('button');
  btn.className = 'syl-cons-btn' + (i === 0 ? ' active' : '');
  btn.textContent = c.c;
  btn.addEventListener('click', () => {
    currentCons = i;
    document.querySelectorAll('.syl-cons-btn').forEach((b, k) =>
      b.classList.toggle('active', k === i));
    renderSylCards();
  });
  sylConsBox.appendChild(btn);
});

function renderSylCards() {
  sylCardsBox.innerHTML = '';
  const cons = SYL_CONSONANTS[currentCons];
  SYLLABLES.filter(s => s.key.startsWith(cons.k)).forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'letter-card syllable';
    btn.innerHTML = `<span class="big">${s.text}</span>`;
    btn.addEventListener('click', () => playSyllable(s));
    sylCardsBox.appendChild(btn);
  });
}
renderSylCards();

// ============ СЛОВАРИК ============
const vocabCatsBox = document.getElementById('vocabCats');
const vocabGridBox = document.getElementById('vocabGrid');
let currentVocabCat = 0;

VOCAB.forEach((cat, i) => {
  const btn = document.createElement('button');
  btn.className = 'vocab-cat-btn' + (i === 0 ? ' active' : '');
  btn.innerHTML = `${cat.icon} ${cat.title}`;
  btn.addEventListener('click', () => {
    currentVocabCat = i;
    document.querySelectorAll('.vocab-cat-btn').forEach((b, k) =>
      b.classList.toggle('active', k === i));
    renderVocabGrid();
  });
  vocabCatsBox.appendChild(btn);
});

function renderVocabGrid() {
  const cat = VOCAB[currentVocabCat];
  vocabGridBox.innerHTML = '';
  cat.items.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'vocab-card';
    btn.innerHTML = `<span class="vocab-emoji">${item.emoji}</span><span class="vocab-word">${item.word}</span>`;
    btn.addEventListener('click', () => {
      playVocab(cat.key, i, item.word);
      btn.classList.add('spoken');
      setTimeout(() => btn.classList.remove('spoken'), 600);
    });
    vocabGridBox.appendChild(btn);
  });
}
renderVocabGrid();

// ============ НАГРАДЫ ============
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
  syl:     { state: () => sylState,     restart: 'startSylGame',     ids: ['sylOptions', 'sylScore', 'sylFeedback'] },
  build:   { state: () => buildState,   restart: 'startBuildGame',   ids: ['buildPool', 'buildScore', 'buildFeedback'] },
  vocab:   { state: () => vocabState,   restart: 'startVocabGame',   ids: ['vocabOptions', 'vocabScore', 'vocabFeedback'] },
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
    ? `🏆 Ура! ${state.score} из ${ROUNDS}! Ты настоящий знаток!`
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
    `${message}<br><button class="play-again-btn" onclick="${cfg.restart}()">🔁 Играть снова</button>`;

  // Награды и статистика
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
  playPhrase(isGreat ? 'win' : 'again', isGreat ? 'Ура! Ты молодец!' : 'Хорошо! Сыграем ещё раз?');
}

function handleAnswer(state, btn, isCorrect, feedbackId, onCorrect, errorKey) {
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
  if (errorKey) addError(errorKey);
  setTimeout(() => btn.classList.remove('wrong'), 500);
  return false;
}

// ============ ИГРА: НАЙДИ БУКВУ ============
const listenState = { answer: null, round: 0, score: 0, locked: false };

function startListenGame() {
  listenState.round = 0;
  listenState.score = 0;
  nextListenRound();
}

function nextListenRound() {
  if (listenState.round >= ROUNDS) { finishGame('listen'); return; }
  listenState.round++;
  listenState.locked = false;

  const options = shuffle(ALPHABET).slice(0, 4);
  listenState.answer = randomOf(options);

  updateScore('listenScore', listenState);
  document.getElementById('listenFeedback').textContent = '';

  const box = document.getElementById('listenOptions');
  box.innerHTML = '';
  options.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = item.letter;
    btn.addEventListener('click', () => {
      if (handleAnswer(listenState, btn, item.letter === listenState.answer.letter,
          'listenFeedback', () => { playPraise(); setTimeout(nextListenRound, 1400); },
          listenState.answer.letter)) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playLetter(ALPHABET.indexOf(listenState.answer)), 400);
}

document.getElementById('listenPlayBtn').addEventListener('click', () => {
  if (listenState.answer) playLetter(ALPHABET.indexOf(listenState.answer));
});

// ============ ИГРА: ПЕРВАЯ БУКВА ============
const wordState = { answer: null, round: 0, score: 0, locked: false };
const WORD_POOL = ALPHABET.filter(i => i.word.toUpperCase().startsWith(i.letter));

function startWordGame() {
  wordState.round = 0;
  wordState.score = 0;
  nextWordRound();
}

function nextWordRound() {
  if (wordState.round >= ROUNDS) { finishGame('word'); return; }
  wordState.round++;
  wordState.locked = false;

  const options = shuffle(WORD_POOL).slice(0, 4);
  wordState.answer = randomOf(options);

  updateScore('wordScore', wordState);
  document.getElementById('wordFeedback').textContent = '';
  document.getElementById('wordEmoji').textContent = wordState.answer.emoji;
  document.getElementById('wordText').innerHTML =
    `<span class="blank">?</span>` + wordState.answer.word.slice(1).toLowerCase();

  const box = document.getElementById('wordOptions');
  box.innerHTML = '';
  options.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = item.letter;
    btn.addEventListener('click', () => {
      if (handleAnswer(wordState, btn, item.letter === wordState.answer.letter,
          'wordFeedback', () => {
            document.getElementById('wordText').innerHTML =
              `<span class="blank">${wordState.answer.letter}</span>` + wordState.answer.word.slice(1).toLowerCase();
            playPraise();
            setTimeout(nextWordRound, 1400);
          }, wordState.answer.letter)) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playWord(ALPHABET.indexOf(wordState.answer)), 400);
}

// ============ ИГРА: НАЙДИ СЛОГ ============
const sylState = { answer: null, round: 0, score: 0, locked: false };

function startSylGame() {
  sylState.round = 0;
  sylState.score = 0;
  nextSylRound();
}

function nextSylRound() {
  if (sylState.round >= ROUNDS) { finishGame('syl'); return; }
  sylState.round++;
  sylState.locked = false;

  const options = shuffle(SYLLABLES).slice(0, 4);
  sylState.answer = randomOf(options);

  updateScore('sylScore', sylState);
  document.getElementById('sylFeedback').textContent = '';

  const box = document.getElementById('sylOptions');
  box.innerHTML = '';
  options.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'option-btn syl-option';
    btn.textContent = item.text;
    btn.addEventListener('click', () => {
      if (handleAnswer(sylState, btn, item.key === sylState.answer.key,
          'sylFeedback', () => { playPraise(); setTimeout(nextSylRound, 1400); })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playSyllable(sylState.answer), 400);
}

document.getElementById('sylPlayBtn').addEventListener('click', () => {
  if (sylState.answer) playSyllable(sylState.answer);
});

// ============ ИГРА: СОБЕРИ СЛОВО ============
const buildState = { answer: null, pos: 0, round: 0, score: 0, locked: false, mistakes: 0 };
const BUILD_ROUNDS = 6;

function startBuildGame() {
  buildState.round = 0;
  buildState.score = 0;
  document.getElementById('buildEmoji').textContent = '';
  nextBuildRound();
}

function nextBuildRound() {
  if (buildState.round >= BUILD_ROUNDS) {
    // приводим счёт к масштабу 10 раундов, чтобы звёзды были сопоставимы
    buildState.round = ROUNDS;
    finishGame('build');
    return;
  }
  buildState.round++;
  buildState.locked = false;
  buildState.pos = 0;
  buildState.mistakes = 0;
  buildState.answer = randomOf(WORD_BUILD);

  document.getElementById('buildScore').innerHTML =
    `Слово ${buildState.round} из ${BUILD_ROUNDS} &nbsp; ${'⭐'.repeat(buildState.score)}`;
  document.getElementById('buildFeedback').textContent = '';
  document.getElementById('buildEmoji').textContent = buildState.answer.emoji;

  const slots = document.getElementById('buildSlots');
  slots.innerHTML = [...buildState.answer.word]
    .map(() => `<span class="build-slot"></span>`).join('');

  const pool = document.getElementById('buildPool');
  pool.innerHTML = '';
  shuffle([...buildState.answer.word]).forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'option-btn build-letter';
    btn.textContent = ch;
    btn.addEventListener('click', () => tapBuildLetter(btn, ch));
    pool.appendChild(btn);
  });

  setTimeout(() => playWord(buildState.answer.wordIndex), 400);
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
      if (buildState.mistakes === 0) buildState.score += 2;
      else buildState.score += 1;
      feedback.textContent = randomOf(PRAISES);
      playSequence([
        clipFor(`words/${pad2(buildState.answer.wordIndex)}`, buildState.answer.word),
        clipFor(`phrases/${randomOf(PHRASES.slice(0, 3)).key}`, 'Молодец!'),
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

// ============ ИГРА: ЧТО ЭТО? ============
const vocabState = { answer: null, catKey: '', itemIndex: 0, round: 0, score: 0, locked: false };
// Фразы в угадайку не берём — по эмодзи их не угадать
const VOCAB_GAME_CATS = VOCAB.filter(c => c.key !== 'phrases');

// Распознавание речи: ребёнок называет картинку вслух
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!settings.vocabMode || (settings.vocabMode === 'speak' && !SpeechRec)) {
  settings.vocabMode = SpeechRec ? 'speak' : 'tap';
}
settings.vocabLang = 'ru'; // английская версия игры — на странице english.html

const vocabWordOf = item => settings.vocabLang === 'en' ? item.en : item.word;

function playVocabPraise() {
  if (settings.vocabLang === 'en') {
    const k = Math.floor(Math.random() * 3);
    const texts = ['Well done!', 'Great!', 'Correct!'];
    playSequence([clipEn(`en/phrases/praise${k}`, texts[k])]);
  } else {
    playPraise();
  }
}

let recognizer = null;
let listening = false;

function getRecognizer() {
  if (recognizer) return recognizer;
  recognizer = new SpeechRec();
  recognizer.lang = 'ru-RU';
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

const normSpeech = s => settings.vocabLang === 'en'
  ? s.toLowerCase().replace(/[^a-z ]/g, '').trim()
  : s.toLowerCase().replace(/ё/g, 'е').replace(/[^а-я ]/g, '').trim();

function evalVocabSpeech(variants) {
  if (vocabState.locked) return;
  const answerWord = vocabWordOf(vocabState.answer);
  const target = normSpeech(answerWord);
  document.getElementById('vocabHeard').textContent = `Ты сказал: «${variants[0].trim()}»`;
  const hit = variants.map(normSpeech).some(h =>
    h.includes(target) || (target.includes(h) && h.length > 2));

  const feedback = document.getElementById('vocabFeedback');
  vocabState.locked = true;
  if (hit) {
    vocabState.score++;
    feedback.textContent = randomOf(PRAISES);
    dingCorrect();
    playVocabPraise();
    setTimeout(nextVocabRound, 1600);
  } else {
    // Подсказываем правильный ответ голосом
    dingWrong();
    if (settings.vocabLang === 'en') {
      feedback.textContent = `This is ${answerWord.toLowerCase()}! ${vocabState.answer.emoji}`;
      playSequence([
        clipEn('en/phrases/this_is', 'This is'),
        clipEn(`en/vocab/${vocabState.catKey}/${pad2(vocabState.itemIndex)}`, answerWord),
      ]);
    } else {
      feedback.textContent = `Это ${answerWord.toLowerCase()}! ${vocabState.answer.emoji}`;
      playSequence([
        clipFor('phrases/eto', 'это'),
        clipFor(`vocab/${vocabState.catKey}/${pad2(vocabState.itemIndex)}`, answerWord),
      ]);
    }
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
    const rec = getRecognizer();
    rec.lang = settings.vocabLang === 'en' ? 'en-US' : 'ru-RU';
    rec.start();
    listening = true;
    const btn = document.getElementById('vocabMicBtn');
    btn.classList.add('listening');
    btn.textContent = '👂 Слушаю…';
    document.getElementById('vocabFeedback').textContent = '';
    document.getElementById('vocabHeard').textContent = '';
  } catch (e) { /* уже слушает */ }
});

// Выбор категории: конкретная или все вперемешку
if (!settings.vocabCat) settings.vocabCat = 'all';
if (settings.vocabCat !== 'all' && !VOCAB_GAME_CATS.some(c => c.key === settings.vocabCat)) {
  settings.vocabCat = 'all';
}

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
      startVocabGame(); // новая категория — новая игра
    });
    vocabCatPicker.appendChild(btn);
  });

function renderVocabCat() {
  document.querySelectorAll('#vocabCatPicker .range-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.cat === settings.vocabCat));
}

function renderVocabMode() {
  const speakChip = document.querySelector('#vocabModePicker .range-btn[data-mode="speak"]');
  if (!SpeechRec) speakChip.style.display = 'none';
  document.querySelectorAll('#vocabModePicker .range-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.mode === settings.vocabMode));
  document.querySelectorAll('#vocabLangPicker .range-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.lang === settings.vocabLang));

  const speak = settings.vocabMode === 'speak';
  const en = settings.vocabLang === 'en';
  document.getElementById('vocabMicBtn').style.display = speak ? '' : 'none';
  document.getElementById('vocabHeard').style.display = speak ? '' : 'none';
  document.getElementById('vocabHint').textContent = speak
    ? (en ? 'Что на картинке? Скажи по-английски!' : 'Что на картинке? Скажи вслух!')
    : (en ? 'Что на картинке? Выбери английское слово!' : 'Что на картинке? Выбери слово!');
}

document.querySelectorAll('#vocabLangPicker .range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.vocabLang = btn.dataset.lang;
    saveSettings();
    startVocabGame(); // новый язык — новая игра
  });
});

document.querySelectorAll('#vocabModePicker .range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.vocabMode = btn.dataset.mode;
    saveSettings();
    startVocabGame(); // новый режим — новая игра
  });
});

function startVocabGame() {
  vocabState.round = 0;
  vocabState.score = 0;
  renderVocabMode();
  renderVocabCat();
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

  // Варианты из одной категории, чтобы приходилось знать слово
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
      btn.textContent = vocabWordOf(item);
      btn.addEventListener('click', () => {
        if (handleAnswer(vocabState, btn, item === vocabState.answer,
            'vocabFeedback', () => {
              const en = settings.vocabLang === 'en';
              const wordClip = en
                ? clipEn(`en/vocab/${vocabState.catKey}/${pad2(vocabState.itemIndex)}`, vocabState.answer.en)
                : clipFor(`vocab/${vocabState.catKey}/${pad2(vocabState.itemIndex)}`, vocabState.answer.word);
              const k = Math.floor(Math.random() * 3);
              const praiseClip = en
                ? clipEn(`en/phrases/praise${k}`, ['Well done!', 'Great!', 'Correct!'][k])
                : clipFor(`phrases/praise${k}`, PHRASES[k].text);
              playSequence([wordClip, praiseClip]);
              setTimeout(nextVocabRound, 2000);
            })) return;
      });
      box.appendChild(btn);
    });
  }

  setTimeout(() => {
    if (settings.vocabLang === 'en') {
      playSequence([clipEn('en/phrases/what', 'What is this?')]);
    } else {
      playPhrase('chto_eto', 'Что это?');
    }
  }, 400);
}

// ============ ИГРА: НАЙДИ ЧИСЛО ============
const numState = { answer: null, round: 0, score: 0, locked: false };
// Диапазон чисел выбирает пользователь; запоминаем между визитами
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
    renderNumRange();
    startNumGame(); // новый диапазон — новая игра
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
  const pool = NUMBERS.filter(n => n.digit >= min && n.digit <= max);
  const options = shuffle(pool).slice(0, 4);
  numState.answer = randomOf(options);

  updateScore('numScore', numState);
  document.getElementById('numFeedback').textContent = '';

  const box = document.getElementById('numOptions');
  box.innerHTML = '';
  options.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = item.digit;
    btn.addEventListener('click', () => {
      if (handleAnswer(numState, btn, item.digit === numState.answer.digit,
          'numFeedback', () => { playPraise(); setTimeout(nextNumRound, 1400); })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playNumber(NUMBERS.indexOf(numState.answer)), 400);
}

document.getElementById('numPlayBtn').addEventListener('click', () => {
  if (numState.answer) playNumber(NUMBERS.indexOf(numState.answer));
});

// ============ ИГРА: ПОСЧИТАЙ ============
const countState = { answer: null, round: 0, score: 0, locked: false };

function startCountGame() {
  countState.round = 0;
  countState.score = 0;
  nextCountRound();
}

function nextCountRound() {
  if (countState.round >= ROUNDS) { finishGame('count'); return; }
  countState.round++;
  countState.locked = false;

  // Считаем от 1 до 10
  const pool = NUMBERS.slice(1, 11);
  const options = shuffle(pool).slice(0, 4);
  countState.answer = randomOf(options);

  updateScore('countScore', countState);
  document.getElementById('countFeedback').textContent = '';
  document.getElementById('countObjects').textContent =
    countState.answer.emoji.repeat(countState.answer.digit);

  const box = document.getElementById('countOptions');
  box.innerHTML = '';
  options.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = item.digit;
    btn.addEventListener('click', () => {
      if (handleAnswer(countState, btn, item.digit === countState.answer.digit,
          'countFeedback', () => {
            playNumber(NUMBERS.indexOf(countState.answer));
            setTimeout(nextCountRound, 1600);
          })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playPhrase('skolko', 'Сколько?'), 400);
}

// ============ ИГРА: СЛОЖЕНИЕ ============
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

  const a = 1 + Math.floor(Math.random() * 5);
  const b = 1 + Math.floor(Math.random() * Math.min(5, 10 - a));
  addState.answer = a + b;
  const emoji = randomOf(NUMBERS.slice(1, 11)).emoji;

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
            playNumber(addState.answer);
            setTimeout(nextAddRound, 1600);
          })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playPhrase('skolko_vsego', 'Сколько всего?'), 400);
}

// ============ ИГРА: ПРИМЕРЫ (числами) ============
const mathState = { answer: 0, round: 0, score: 0, locked: false };
if (!settings.mathOp) settings.mathOp = 'add';
if (![10, 20, 50, 100].includes(settings.mathMax)) settings.mathMax = 20;

const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// Каждый генератор возвращает { text, answer }; числа и ответ
// не превышают выбранный предел M (озвучка есть для 0–100)
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
    // Множители — в пределах таблицы умножения, произведение ≤ M
    const a = rnd(2, Math.min(9, Math.floor(M / 2)));
    const b = rnd(2, Math.min(9, Math.floor(M / a)));
    return { text: `${a} × ${b}`, answer: a * b };
  },
  div(M) {
    // Всегда нацело: пример строится от ответа
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
    startMathGame(); // новое действие — новая игра
  });
});

document.querySelectorAll('#mathMaxPicker .range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.mathMax = +btn.dataset.max;
    saveSettings();
    startMathGame(); // новый диапазон — новая игра
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
  const op = settings.mathOp === 'mix'
    ? randomOf(Object.keys(MATH_OPS))
    : settings.mathOp;
  const task = MATH_OPS[op](M);
  mathState.answer = task.answer;

  updateScore('mathScore', mathState);
  document.getElementById('mathFeedback').textContent = '';
  document.getElementById('mathExpr').textContent = `${task.text} = ?`;

  // Неправильные варианты — рядом с ответом, чтобы приходилось считать;
  // для больших чисел разброс шире
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
            playNumberValue(mathState.answer);
            setTimeout(nextMathRound, 1600);
          })) return;
    });
    box.appendChild(btn);
  });

  setTimeout(() => playPhrase('reshi', 'Реши пример!'), 400);
}

// ============ ИГРА: БОЛЬШЕ-МЕНЬШЕ ============
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

  let a = 1 + Math.floor(Math.random() * 9);
  let b = 1 + Math.floor(Math.random() * 9);
  while (b === a) b = 1 + Math.floor(Math.random() * 9);
  compareState.a = a;
  compareState.b = b;
  const emoji = randomOf(NUMBERS.slice(1, 11)).emoji;

  updateScore('compareScore', compareState);
  document.getElementById('compareFeedback').textContent = '';
  document.getElementById('compareHint').textContent =
    compareState.more ? 'Где больше? Нажми!' : 'Где меньше? Нажми!';

  const cardA = document.getElementById('compareA');
  const cardB = document.getElementById('compareB');
  cardA.textContent = emoji.repeat(a);
  cardB.textContent = emoji.repeat(b);
  cardA.classList.remove('correct', 'wrong');
  cardB.classList.remove('correct', 'wrong');

  setTimeout(() => playPhrase(
    compareState.more ? 'gde_bolshe' : 'gde_menshe',
    compareState.more ? 'Где больше?' : 'Где меньше?'), 400);
}

function checkCompare(card, count) {
  const other = compareState.more
    ? Math.max(compareState.a, compareState.b)
    : Math.min(compareState.a, compareState.b);
  if (handleAnswer(compareState, card, count === other, 'compareFeedback',
      () => { playPraise(); setTimeout(nextCompareRound, 1400); })) return;
}

document.getElementById('compareA').addEventListener('click', () =>
  !compareState.locked && checkCompare(document.getElementById('compareA'), compareState.a));
document.getElementById('compareB').addEventListener('click', () =>
  !compareState.locked && checkCompare(document.getElementById('compareB'), compareState.b));

// ============ ПРОПИСИ ============
const TRACE_ITEMS = [
  ...ALPHABET.map((a, i) => ({ char: a.letter, say: () => playLetter(i) })),
  ...NUMBERS.slice(0, 10).map((n, i) => ({ char: String(n.digit), say: () => playNumber(i) })),
];
let traceIndex = 0;
let traceInited = false;
let canvas, ctx, tplCanvas, tplCtx, userCanvas, userCtx, drawing = false;

function initTraceOnce() {
  if (traceInited) { drawTrace(); return; }
  traceInited = true;
  canvas = document.getElementById('traceCanvas');
  ctx = canvas.getContext('2d');
  tplCanvas = document.createElement('canvas');
  tplCanvas.width = canvas.width;
  tplCanvas.height = canvas.height;
  tplCtx = tplCanvas.getContext('2d');
  userCanvas = document.createElement('canvas');
  userCanvas.width = canvas.width;
  userCanvas.height = canvas.height;
  userCtx = userCanvas.getContext('2d');

  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    const p = tracePoint(e);
    userCtx.beginPath();
    userCtx.moveTo(p.x, p.y);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = tracePoint(e);
    userCtx.lineTo(p.x, p.y);
    userCtx.strokeStyle = '#339af0';
    userCtx.lineWidth = 20;
    userCtx.lineCap = 'round';
    userCtx.lineJoin = 'round';
    userCtx.stroke();
    compositeTrace();
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  document.getElementById('tracePrev').addEventListener('click', () => moveTrace(-1));
  document.getElementById('traceNext').addEventListener('click', () => moveTrace(1));
  document.getElementById('traceClear').addEventListener('click', clearTrace);
  document.getElementById('traceCheck').addEventListener('click', checkTrace);
  document.getElementById('traceSay').addEventListener('click', () => TRACE_ITEMS[traceIndex].say());

  drawTrace();
}

function tracePoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}

function drawTrace() {
  const item = TRACE_ITEMS[traceIndex];
  document.getElementById('traceLabel').textContent = item.char;
  document.getElementById('traceFeedback').textContent = '';

  tplCtx.clearRect(0, 0, tplCanvas.width, tplCanvas.height);
  tplCtx.font = "900 240px 'Nunito', sans-serif";
  tplCtx.textAlign = 'center';
  tplCtx.textBaseline = 'middle';
  tplCtx.fillStyle = '#000';
  tplCtx.fillText(item.char, tplCanvas.width / 2, tplCanvas.height / 2 + 12);

  userCtx.clearRect(0, 0, userCanvas.width, userCanvas.height);
  compositeTrace();
}

function compositeTrace() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Контур-образец
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.drawImage(tplCanvas, 0, 0);
  ctx.restore();
  // Пунктирная рамка-подсказка не нужна: рисуем штрихи ребёнка
  ctx.drawImage(userCanvas, 0, 0);
}

function moveTrace(d) {
  traceIndex = (traceIndex + d + TRACE_ITEMS.length) % TRACE_ITEMS.length;
  drawTrace();
  TRACE_ITEMS[traceIndex].say();
}

function clearTrace() {
  userCtx.clearRect(0, 0, userCanvas.width, userCanvas.height);
  document.getElementById('traceFeedback').textContent = '';
  compositeTrace();
}

function checkTrace() {
  const tpl = tplCtx.getImageData(0, 0, tplCanvas.width, tplCanvas.height).data;
  const usr = userCtx.getImageData(0, 0, userCanvas.width, userCanvas.height).data;
  let tplPx = 0, usrPx = 0, hit = 0, miss = 0;
  for (let i = 3; i < tpl.length; i += 16) { // каждый 4-й пиксель — быстрее
    const t = tpl[i] > 40, u = usr[i] > 40;
    if (t) tplPx++;
    if (u) {
      usrPx++;
      if (t) hit++; else miss++;
    }
  }
  const feedback = document.getElementById('traceFeedback');
  if (!usrPx) {
    feedback.textContent = 'Сначала обведи букву! ✍️';
    return;
  }
  const coverage = hit / Math.max(tplPx, 1);
  const stray = miss / usrPx;
  if (coverage > 0.25 && stray < 0.55) {
    feedback.textContent = randomOf(PRAISES);
    dingCorrect();
    playPraise();
    confettiBurst();
    progress.stars += 1;
    saveProgress();
  } else {
    feedback.textContent = coverage <= 0.25
      ? 'Обведи букву посередине! 🤔'
      : 'Старайся вести по букве! 💪';
    dingWrong();
  }
}

// ============ НАСТРОЙКИ: UI ============
function renderSettings() {
  document.querySelectorAll('.setting-btn').forEach(btn => {
    const { setting, value } = btn.dataset;
    let current;
    if (setting === 'voice') current = settings.voice;
    if (setting === 'rate') current = String(settings.rate);
    if (setting === 'sound') current = settings.sound ? 'on' : 'off';
    btn.classList.toggle('active', current === value);
  });
}

document.querySelectorAll('.setting-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const { setting, value } = btn.dataset;
    if (setting === 'voice') settings.voice = value;
    if (setting === 'rate') settings.rate = parseFloat(value);
    if (setting === 'sound') settings.sound = value === 'on';
    saveSettings();
    renderSettings();
    if (setting === 'voice') playPhrase('praise0', 'Молодец!');
    if (setting === 'rate') playPhrase('bukva', 'буква');
  });
});

// ============ РОДИТЕЛЯМ: СТАТИСТИКА ============
function renderStats() {
  document.getElementById('statStars').textContent = progress.stars;
  document.getElementById('statGames').textContent = progress.games;
  document.getElementById('statLetters').textContent = `${progress.seenL.length}/${ALPHABET.length}`;
  document.getElementById('statNumbers').textContent = `${progress.seenN.length}/${NUMBERS.length}`;

  const hard = Object.entries(progress.errors).sort((a, b) => b[1] - a[1]).slice(0, 5);
  document.getElementById('hardLetters').innerHTML = hard.length
    ? `<b>Трудные буквы:</b> ` + hard.map(([l, n]) => `<span class="hard-chip">${l} · ${n}</span>`).join(' ')
    : 'Ошибок в играх с буквами пока не замечено 👍';
}

document.getElementById('resetProgress').addEventListener('click', () => {
  if (!confirm('Точно сбросить весь прогресс: звёзды, наклейки и статистику?')) return;
  progress.seenL = [];
  progress.seenN = [];
  progress.stars = 0;
  progress.games = 0;
  progress.errors = {};
  saveProgress();
  renderSeenBadges();
  renderStats();
  renderRewards();
});

// ============ СТАРТ ============
renderSeenBadges();
renderSettings();
renderRewards();
renderStats();
