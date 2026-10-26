// ============ ДАННЫЕ: 33 буквы русского алфавита ============
// name — как произносится название буквы (для озвучки)
// type: vowel (гласная), consonant (согласная), sign (знак)
const ALPHABET = [
  { letter: 'А', name: 'а',           type: 'vowel',     word: 'Арбуз',      emoji: '🍉' },
  { letter: 'Б', name: 'бэ',          type: 'consonant', word: 'Банан',      emoji: '🍌' },
  { letter: 'В', name: 'вэ',          type: 'consonant', word: 'Волк',       emoji: '🐺' },
  { letter: 'Г', name: 'гэ',          type: 'consonant', word: 'Гриб',       emoji: '🍄' },
  { letter: 'Д', name: 'дэ',          type: 'consonant', word: 'Дом',        emoji: '🏠' },
  { letter: 'Е', name: 'е',           type: 'vowel',     word: 'Енот',       emoji: '🦝' },
  { letter: 'Ё', name: 'ё',           type: 'vowel',     word: 'Ёжик',       emoji: '🦔' },
  { letter: 'Ж', name: 'жэ',          type: 'consonant', word: 'Жираф',      emoji: '🦒' },
  { letter: 'З', name: 'зэ',          type: 'consonant', word: 'Заяц',       emoji: '🐰' },
  { letter: 'И', name: 'и',           type: 'vowel',     word: 'Игрушка',    emoji: '🧸' },
  { letter: 'Й', name: 'и краткое',   type: 'consonant', word: 'Йогурт',     emoji: '🥛' },
  { letter: 'К', name: 'ка',          type: 'consonant', word: 'Кот',        emoji: '🐱' },
  { letter: 'Л', name: 'эль',         type: 'consonant', word: 'Лиса',       emoji: '🦊' },
  { letter: 'М', name: 'эм',          type: 'consonant', word: 'Медведь',    emoji: '🐻' },
  { letter: 'Н', name: 'эн',          type: 'consonant', word: 'Носорог',    emoji: '🦏' },
  { letter: 'О', name: 'о',           type: 'vowel',     word: 'Облако',     emoji: '☁️' },
  { letter: 'П', name: 'пэ',          type: 'consonant', word: 'Пингвин',    emoji: '🐧' },
  { letter: 'Р', name: 'эр',          type: 'consonant', word: 'Рыба',       emoji: '🐟' },
  { letter: 'С', name: 'эс',          type: 'consonant', word: 'Солнце',     emoji: '☀️' },
  { letter: 'Т', name: 'тэ',          type: 'consonant', word: 'Тигр',       emoji: '🐯' },
  { letter: 'У', name: 'у',           type: 'vowel',     word: 'Улитка',     emoji: '🐌' },
  { letter: 'Ф', name: 'эф',          type: 'consonant', word: 'Флаг',       emoji: '🚩' },
  { letter: 'Х', name: 'ха',          type: 'consonant', word: 'Хлеб',       emoji: '🍞' },
  { letter: 'Ц', name: 'цэ',          type: 'consonant', word: 'Цветок',     emoji: '🌸' },
  { letter: 'Ч', name: 'че',          type: 'consonant', word: 'Часы',       emoji: '⏰' },
  { letter: 'Ш', name: 'ша',          type: 'consonant', word: 'Шарик',      emoji: '🎈' },
  { letter: 'Щ', name: 'ща',          type: 'consonant', word: 'Щенок',      emoji: '🐶' },
  { letter: 'Ъ', name: 'твёрдый знак', type: 'sign',     word: 'Подъезд',    emoji: '🏢' },
  { letter: 'Ы', name: 'ы',           type: 'vowel',     word: 'Сыр',        emoji: '🧀' },
  { letter: 'Ь', name: 'мягкий знак', type: 'sign',      word: 'Медведь',    emoji: '🐻' },
  { letter: 'Э', name: 'э',           type: 'vowel',     word: 'Экскаватор', emoji: '🚜' },
  { letter: 'Ю', name: 'ю',           type: 'vowel',     word: 'Юла',        emoji: '🪀' },
  { letter: 'Я', name: 'я',           type: 'vowel',     word: 'Яблоко',     emoji: '🍎' },
];

// ============ ЧИСЛА 0–20 ============
const NUMBERS = [
  { digit: 0,  word: 'Ноль',         emoji: '🚫' },
  { digit: 1,  word: 'Один',         emoji: '🍎' },
  { digit: 2,  word: 'Два',          emoji: '🍌' },
  { digit: 3,  word: 'Три',          emoji: '🎈' },
  { digit: 4,  word: 'Четыре',       emoji: '🌸' },
  { digit: 5,  word: 'Пять',         emoji: '⭐' },
  { digit: 6,  word: 'Шесть',        emoji: '🍓' },
  { digit: 7,  word: 'Семь',         emoji: '🐠' },
  { digit: 8,  word: 'Восемь',       emoji: '🍄' },
  { digit: 9,  word: 'Девять',       emoji: '🐞' },
  { digit: 10, word: 'Десять',       emoji: '🐣' },
  { digit: 11, word: 'Одиннадцать',  emoji: '🍬' },
  { digit: 12, word: 'Двенадцать',   emoji: '🥕' },
  { digit: 13, word: 'Тринадцать',   emoji: '🍪' },
  { digit: 14, word: 'Четырнадцать', emoji: '🐚' },
  { digit: 15, word: 'Пятнадцать',   emoji: '🌟' },
  { digit: 16, word: 'Шестнадцать',  emoji: '🍇' },
  { digit: 17, word: 'Семнадцать',   emoji: '🐝' },
  { digit: 18, word: 'Восемнадцать', emoji: '🍀' },
  { digit: 19, word: 'Девятнадцать', emoji: '🦋' },
  { digit: 20, word: 'Двадцать',     emoji: '🐬' },
];

// ============ СЛОГИ ============
// key — имя аудиофайла (audio/syllables/<key>.m4a)
const SYL_CONSONANTS = [
  { c: 'М', k: 'm' }, { c: 'П', k: 'p' }, { c: 'Б', k: 'b' }, { c: 'Н', k: 'n' },
  { c: 'Т', k: 't' }, { c: 'К', k: 'k' }, { c: 'Л', k: 'l' }, { c: 'С', k: 's' },
  { c: 'Р', k: 'r' }, { c: 'Д', k: 'd' },
];
const SYL_VOWELS = [
  { v: 'А', k: 'a' }, { v: 'О', k: 'o' }, { v: 'У', k: 'u' },
  { v: 'И', k: 'i' }, { v: 'Ы', k: 'y' }, { v: 'Е', k: 'e' },
];
const SYLLABLES = [];
for (const { c, k: ck } of SYL_CONSONANTS) {
  for (const { v, k: vk } of SYL_VOWELS) {
    SYLLABLES.push({ text: c + v, key: ck + vk });
  }
}

// ============ СЛОВА ДЛЯ ИГРЫ «СОБЕРИ СЛОВО» ============
// wordIndex — номер слова в ALPHABET (для озвучки audio/words/NN)
const WORD_BUILD = [
  { word: 'КОТ',   emoji: '🐱', wordIndex: 11 },
  { word: 'ДОМ',   emoji: '🏠', wordIndex: 4 },
  { word: 'СЫР',   emoji: '🧀', wordIndex: 28 },
  { word: 'ЮЛА',   emoji: '🪀', wordIndex: 31 },
  { word: 'ВОЛК',  emoji: '🐺', wordIndex: 2 },
  { word: 'ГРИБ',  emoji: '🍄', wordIndex: 3 },
  { word: 'ЕНОТ',  emoji: '🦝', wordIndex: 5 },
  { word: 'ЛИСА',  emoji: '🦊', wordIndex: 12 },
  { word: 'РЫБА',  emoji: '🐟', wordIndex: 17 },
  { word: 'ФЛАГ',  emoji: '🚩', wordIndex: 21 },
  { word: 'ХЛЕБ',  emoji: '🍞', wordIndex: 22 },
  { word: 'ТИГР',  emoji: '🐯', wordIndex: 19 },
  { word: 'ЗАЯЦ',  emoji: '🐰', wordIndex: 8 },
  { word: 'БАНАН', emoji: '🍌', wordIndex: 1 },
  { word: 'ШАРИК', emoji: '🎈', wordIndex: 25 },
  { word: 'ЩЕНОК', emoji: '🐶', wordIndex: 26 },
];

// ============ СЛОВАРИК С КАРТИНКАМИ ============
// Аудио: русское — audio/vocab/<key>/<NN>.m4a, английское — audio/en/vocab/<key>/<NN>.m4a
const VOCAB = [
  {
    key: 'animals', title: 'Животные', icon: '🐾',
    items: [
      { word: 'Кошка',    en: 'Cat',      emoji: '🐱' },
      { word: 'Собака',   en: 'Dog',      emoji: '🐶' },
      { word: 'Лошадь',   en: 'Horse',    emoji: '🐴' },
      { word: 'Корова',   en: 'Cow',      emoji: '🐮' },
      { word: 'Свинья',   en: 'Pig',      emoji: '🐷' },
      { word: 'Курица',   en: 'Chicken',  emoji: '🐔' },
      { word: 'Утка',     en: 'Duck',     emoji: '🦆' },
      { word: 'Медведь',  en: 'Bear',     emoji: '🐻' },
      { word: 'Лиса',     en: 'Fox',      emoji: '🦊' },
      { word: 'Заяц',     en: 'Rabbit',   emoji: '🐰' },
      { word: 'Волк',     en: 'Wolf',     emoji: '🐺' },
      { word: 'Слон',     en: 'Elephant', emoji: '🐘' },
      { word: 'Обезьяна', en: 'Monkey',   emoji: '🐵' },
      { word: 'Лев',      en: 'Lion',     emoji: '🦁' },
      { word: 'Тигр',     en: 'Tiger',    emoji: '🐯' },
      { word: 'Жираф',    en: 'Giraffe',  emoji: '🦒' },
    ],
  },
  {
    key: 'colors', title: 'Цвета', icon: '🎨',
    items: [
      { word: 'Красный',    en: 'Red',        emoji: '🔴' },
      { word: 'Оранжевый',  en: 'Orange',     emoji: '🟠' },
      { word: 'Жёлтый',     en: 'Yellow',     emoji: '🟡' },
      { word: 'Зелёный',    en: 'Green',      emoji: '🟢' },
      { word: 'Голубой',    en: 'Light blue', emoji: '🩵' },
      { word: 'Синий',      en: 'Blue',       emoji: '🔵' },
      { word: 'Фиолетовый', en: 'Purple',     emoji: '🟣' },
      { word: 'Розовый',    en: 'Pink',       emoji: '🩷' },
      { word: 'Коричневый', en: 'Brown',      emoji: '🟤' },
      { word: 'Чёрный',     en: 'Black',      emoji: '⚫' },
      { word: 'Белый',      en: 'White',      emoji: '⚪' },
    ],
  },
  {
    key: 'vegetables', title: 'Овощи', icon: '🥕',
    items: [
      { word: 'Морковь',  en: 'Carrot',   emoji: '🥕' },
      { word: 'Помидор',  en: 'Tomato',   emoji: '🍅' },
      { word: 'Огурец',   en: 'Cucumber', emoji: '🥒' },
      { word: 'Картошка', en: 'Potato',   emoji: '🥔' },
      { word: 'Лук',      en: 'Onion',    emoji: '🧅' },
      { word: 'Чеснок',   en: 'Garlic',   emoji: '🧄' },
      { word: 'Капуста',  en: 'Cabbage',  emoji: '🥬' },
      { word: 'Перец',    en: 'Pepper',   emoji: '🫑' },
      { word: 'Баклажан', en: 'Eggplant', emoji: '🍆' },
      { word: 'Кукуруза', en: 'Corn',     emoji: '🌽' },
      { word: 'Тыква',    en: 'Pumpkin',  emoji: '🎃' },
    ],
  },
  {
    key: 'fruits', title: 'Фрукты', icon: '🍎',
    items: [
      { word: 'Яблоко',   en: 'Apple',      emoji: '🍎' },
      { word: 'Груша',    en: 'Pear',       emoji: '🍐' },
      { word: 'Банан',    en: 'Banana',     emoji: '🍌' },
      { word: 'Апельсин', en: 'Orange',     emoji: '🍊' },
      { word: 'Лимон',    en: 'Lemon',      emoji: '🍋' },
      { word: 'Виноград', en: 'Grapes',     emoji: '🍇' },
      { word: 'Клубника', en: 'Strawberry', emoji: '🍓' },
      { word: 'Арбуз',    en: 'Watermelon', emoji: '🍉' },
      { word: 'Дыня',     en: 'Melon',      emoji: '🍈' },
      { word: 'Персик',   en: 'Peach',      emoji: '🍑' },
      { word: 'Ананас',   en: 'Pineapple',  emoji: '🍍' },
      { word: 'Вишня',    en: 'Cherry',     emoji: '🍒' },
      { word: 'Киви',     en: 'Kiwi',       emoji: '🥝' },
      { word: 'Манго',    en: 'Mango',      emoji: '🥭' },
    ],
  },
  {
    key: 'body', title: 'Тело', icon: '🧍',
    items: [
      { word: 'Глаза',  en: 'Eyes',   emoji: '👀' },
      { word: 'Нос',    en: 'Nose',   emoji: '👃' },
      { word: 'Рот',    en: 'Mouth',  emoji: '👄' },
      { word: 'Ухо',    en: 'Ear',    emoji: '👂' },
      { word: 'Язык',   en: 'Tongue', emoji: '👅' },
      { word: 'Зуб',    en: 'Tooth',  emoji: '🦷' },
      { word: 'Рука',   en: 'Hand',   emoji: '✋' },
      { word: 'Палец',  en: 'Finger', emoji: '☝️' },
      { word: 'Нога',   en: 'Leg',    emoji: '🦵' },
      { word: 'Стопа',  en: 'Foot',   emoji: '🦶' },
      { word: 'Сердце', en: 'Heart',  emoji: '🫀' },
      { word: 'Мозг',   en: 'Brain',  emoji: '🧠' },
    ],
  },
  {
    key: 'school', title: 'Школа', icon: '🎒',
    items: [
      { word: 'Парта',    en: 'Desk',     emoji: '🪑' },
      { word: 'Книга',    en: 'Book',     emoji: '📖' },
      { word: 'Тетрадь',  en: 'Notebook', emoji: '📓' },
      { word: 'Ручка',    en: 'Pen',      emoji: '🖊️' },
      { word: 'Карандаш', en: 'Pencil',   emoji: '✏️' },
      { word: 'Линейка',  en: 'Ruler',    emoji: '📏' },
      { word: 'Ножницы',  en: 'Scissors', emoji: '✂️' },
      { word: 'Рюкзак',   en: 'Backpack', emoji: '🎒' },
      { word: 'Кисточка', en: 'Brush',    emoji: '🖌️' },
      { word: 'Краски',   en: 'Paints',   emoji: '🎨' },
      { word: 'Глобус',   en: 'Globe',    emoji: '🌍' },
      { word: 'Школа',    en: 'School',   emoji: '🏫' },
    ],
  },
  {
    key: 'phrases', title: 'Фразы', icon: '💬',
    items: [
      { word: 'Привет!',             en: 'Hello!',              emoji: '👋' },
      { word: 'Доброе утро!',        en: 'Good morning!',       emoji: '🌅' },
      { word: 'Добрый день!',        en: 'Good afternoon!',     emoji: '☀️' },
      { word: 'Спокойной ночи!',     en: 'Good night!',         emoji: '🌙' },
      { word: 'Как дела?',           en: 'How are you?',        emoji: '🙂' },
      { word: 'Хорошо!',             en: 'Good!',               emoji: '👍' },
      { word: 'Спасибо!',            en: 'Thank you!',          emoji: '🙏' },
      { word: 'Пожалуйста!',         en: 'Please!',             emoji: '🤲' },
      { word: 'Извини!',             en: 'Sorry!',              emoji: '😔' },
      { word: 'Да',                  en: 'Yes',                 emoji: '✅' },
      { word: 'Нет',                 en: 'No',                  emoji: '❌' },
      { word: 'Как тебя зовут?',     en: 'What is your name?',  emoji: '❓' },
      { word: 'До свидания!',        en: 'Goodbye!',            emoji: '🚪' },
      { word: 'Приятного аппетита!', en: 'Enjoy your meal!',    emoji: '🍽️' },
      { word: 'С днём рождения!',    en: 'Happy birthday!',     emoji: '🎂' },
    ],
  },
];

// ============ АНГЛИЙСКИЙ АЛФАВИТ ============
// Аудио: буква — audio/en/letters/NN.m4a, слово — audio/en/words/NN.m4a
const EN_ALPHABET = [
  { letter: 'A', word: 'Apple',     emoji: '🍎' },
  { letter: 'B', word: 'Ball',      emoji: '⚽' },
  { letter: 'C', word: 'Cat',       emoji: '🐱' },
  { letter: 'D', word: 'Dog',       emoji: '🐶' },
  { letter: 'E', word: 'Elephant',  emoji: '🐘' },
  { letter: 'F', word: 'Fish',      emoji: '🐟' },
  { letter: 'G', word: 'Giraffe',   emoji: '🦒' },
  { letter: 'H', word: 'House',     emoji: '🏠' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', word: 'Juice',     emoji: '🧃' },
  { letter: 'K', word: 'Kite',      emoji: '🪁' },
  { letter: 'L', word: 'Lion',      emoji: '🦁' },
  { letter: 'M', word: 'Moon',      emoji: '🌙' },
  { letter: 'N', word: 'Nose',      emoji: '👃' },
  { letter: 'O', word: 'Orange',    emoji: '🍊' },
  { letter: 'P', word: 'Penguin',   emoji: '🐧' },
  { letter: 'Q', word: 'Queen',     emoji: '👑' },
  { letter: 'R', word: 'Rabbit',    emoji: '🐰' },
  { letter: 'S', word: 'Sun',       emoji: '☀️' },
  { letter: 'T', word: 'Tiger',     emoji: '🐯' },
  { letter: 'U', word: 'Umbrella',  emoji: '☂️' },
  { letter: 'V', word: 'Violin',    emoji: '🎻' },
  { letter: 'W', word: 'Whale',     emoji: '🐳' },
  { letter: 'X', word: 'X-ray',     emoji: '🩻' },
  { letter: 'Y', word: 'Yo-yo',     emoji: '🪀' },
  { letter: 'Z', word: 'Zebra',     emoji: '🦓' },
];

// Английские числа 0–20 (текст — запасная озвучка синтезатором)
const EN_NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

// ============ НАКЛЕЙКИ-НАГРАДЫ (каждые 25 звёзд) ============
const STICKERS = ['🦁', '🚀', '🦄', '🐬', '🌈', '🦖', '⚽', '🎠', '🛸', '🐳',
                  '🏰', '🦜', '🎪', '🐉', '🌋', '🛶', '🎸', '🤖', '🦩', '👑'];

// ============ ФРАЗЫ ДЛЯ ИГР ============
// Первые три — похвала за верный ответ
const PHRASES = [
  { key: 'praise0',      text: 'Молодец!' },
  { key: 'praise1',      text: 'Отлично!' },
  { key: 'praise2',      text: 'Правильно!' },
  { key: 'win',          text: 'Ура! Ты молодец!' },
  { key: 'again',        text: 'Хорошо! Сыграем ещё раз?' },
  { key: 'bukva',        text: 'буква' },
  { key: 'cifra',        text: 'цифра' },
  { key: 'skolko',       text: 'Сколько?' },
  { key: 'gde_bolshe',   text: 'Где больше?' },
  { key: 'gde_menshe',   text: 'Где меньше?' },
  { key: 'skolko_vsego', text: 'Сколько всего?' },
  { key: 'reshi',        text: 'Реши пример!' },
  { key: 'chto_eto',     text: 'Что это?' },
  { key: 'eto',          text: 'Это' },
];

// Английские фразы для игр: audio/en/phrases/<key>.m4a
const EN_PHRASES = [
  { key: 'what',    text: 'What is this?' },
  { key: 'this_is', text: 'This is' },
  { key: 'praise0', text: 'Well done!' },
  { key: 'praise1', text: 'Great!' },
  { key: 'praise2', text: 'Correct!' },
];

// ============ УЧИМСЯ ЧИТАТЬ ============
// Как буква ЗВУЧИТ в слове (не её название): «эм» → «ммм».
// Тянущиеся звуки записаны с повтором — так их удобно «тянуть» к гласной.
// Пустая строка — знак без звука (Ъ, Ь). Аудио: audio/read/sounds/NN
const LETTER_SOUNDS = [
  'а', 'б', 'ввв', 'г', 'д', 'е', 'ё', 'жжж', 'ззз', 'и', 'й', 'к', 'ллл',
  'ммм', 'ннн', 'о', 'п', 'ррр', 'ссс', 'т', 'у', 'ффф', 'ххх', 'ц', 'ч',
  'шшш', 'щщщ', '', 'ы', '', 'э', 'ю', 'я',
];

// Слова для чтения. lvl: 1 — два открытых слога, 2 — один слог, 3 — три слога.
// Слоги считаются автоматически (splitSyllables). Аудио: audio/read/w/<translit>
const READ_WORDS = [
  { word: 'МАМА',    emoji: '👩', lvl: 1 },
  { word: 'ПАПА',    emoji: '👨', lvl: 1 },
  { word: 'ЛУНА',    emoji: '🌙', lvl: 1 },
  { word: 'РЫБА',    emoji: '🐟', lvl: 1 },
  { word: 'ЛИСА',    emoji: '🦊', lvl: 1 },
  { word: 'РУКА',    emoji: '✋', lvl: 1 },
  { word: 'НОТЫ',    emoji: '🎵', lvl: 1 },
  { word: 'САНИ',    emoji: '🛷', lvl: 1 },
  { word: 'ЛУПА',    emoji: '🔍', lvl: 1 },
  { word: 'РАМА',    emoji: '🖼️', lvl: 1 },
  { word: 'БУСЫ',    emoji: '📿', lvl: 1 },
  { word: 'СОВА',    emoji: '🦉', lvl: 1 },
  { word: 'КОЗА',    emoji: '🐐', lvl: 1 },
  { word: 'ЗУБЫ',    emoji: '🦷', lvl: 1 },
  { word: 'КОТ',     emoji: '🐱', lvl: 2 },
  { word: 'ДОМ',     emoji: '🏠', lvl: 2 },
  { word: 'СОК',     emoji: '🧃', lvl: 2 },
  { word: 'СУП',     emoji: '🍲', lvl: 2 },
  { word: 'ЛУК',     emoji: '🧅', lvl: 2 },
  { word: 'НОС',     emoji: '👃', lvl: 2 },
  { word: 'ЛЕС',     emoji: '🌲', lvl: 2 },
  { word: 'КИТ',     emoji: '🐳', lvl: 2 },
  { word: 'ЖУК',     emoji: '🪲', lvl: 2 },
  { word: 'СЫР',     emoji: '🧀', lvl: 2 },
  { word: 'ТОРТ',    emoji: '🎂', lvl: 2 },
  { word: 'МОЛОКО',  emoji: '🥛', lvl: 3 },
  { word: 'СОБАКА',  emoji: '🐶', lvl: 3 },
  { word: 'ПАНАМА',  emoji: '👒', lvl: 3 },
  { word: 'БАНАНЫ',  emoji: '🍌', lvl: 3 },
  { word: 'МАШИНА',  emoji: '🚗', lvl: 3 },
  { word: 'РАКЕТА',  emoji: '🚀', lvl: 3 },
  { word: 'ПОМИДОР', emoji: '🍅', lvl: 3 },
  { word: 'БАРАБАН', emoji: '🥁', lvl: 3 },
];

// Книжка-малышка: одна фраза на страницу. Слова озвучиваются по одному из audio/read/w/
const BOOK = [
  { emoji: '🐱',     text: 'Это кот.' },
  { emoji: '😴🐱',   text: 'Кот спит.' },
  { emoji: '👧⚽',   text: 'У Маши мяч.' },
  { emoji: '👩🖼️',   text: 'Мама мыла раму.' },
  { emoji: '🦊🌲',   text: 'Лиса в лесу.' },
  { emoji: '🐟🌊',   text: 'Рыба в реке.' },
  { emoji: '🐶🦴',   text: 'У собаки кость.' },
  { emoji: '👨👦🏠', text: 'Папа и сын идут домой.' },
];

const RU_VOWELS = 'АЕЁИОУЫЭЮЯ';

// Деление на слоги «как в букваре»: согласные между гласными уходят
// к следующему слогу, Й, Ь и Ъ остаются с предыдущим: МА-ШИ-НА, ДО-МОЙ
function splitSyllables(word) {
  const w = word.toUpperCase();
  const vowelsAt = [...w].map((ch, i) => RU_VOWELS.includes(ch) ? i : -1).filter(i => i >= 0);
  if (vowelsAt.length < 2) return [word];
  const cuts = [];
  for (let k = 0; k < vowelsAt.length - 1; k++) {
    let cut = vowelsAt[k] + 1;
    while (cut < vowelsAt[k + 1] && 'ЙЬЪ'.includes(w[cut])) cut++;
    cuts.push(cut);
  }
  const parts = [];
  let start = 0;
  for (const c of cuts) { parts.push(word.slice(start, c)); start = c; }
  parts.push(word.slice(start));
  return parts;
}

// Латиница для имён аудиофайлов: «МАМА» → «mama» (как ключи слогов: ы → y)
const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i',
  й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'eh', ю: 'yu', я: 'ya',
};
const translit = s => [...s.toLowerCase()].map(ch => TRANSLIT[ch] ?? '').join('');

// Все слоги из READ_WORDS, которых нет в готовом наборе SYLLABLES
const READ_EXTRA_SYLLABLES = [...new Set(READ_WORDS.flatMap(w => splitSyllables(w.word)))]
  .filter(s => !SYLLABLES.some(x => x.text === s));
