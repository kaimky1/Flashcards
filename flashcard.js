const questionBoard = document.getElementById('questionBoard');
const answerBoard = document.getElementById('answerBoard');
const statusEl = document.getElementById('status');
const matchesEl = document.getElementById('matches');
const triesEl = document.getElementById('tries');
const streakEl = document.getElementById('streak');
const pairsCountEl = document.getElementById('pairsCount');
const subjectSelect = document.getElementById('subjectSelect');

let questionCards = [];
let answerCards = [];
let firstPick = null;
let secondPick = null;
let lock = false;
let matches = 0;
let tries = 0;
let streak = 0;
let totalPairs = 0;
let currentSubject = 'math';

function loadCustomDecks() {
  try {
    const stored = localStorage.getItem('customDecks');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function populateSubjectSelect() {
  const decks = loadCustomDecks();
  subjectSelect.innerHTML = `<option value="math">Math (auto)</option>`;
  decks.forEach(deck => {
    const opt = document.createElement('option');
    opt.value = deck.subject;
    opt.textContent = deck.subject;
    subjectSelect.appendChild(opt);
  });
  subjectSelect.value = currentSubject;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createMathPairs(count = 8) {
  const pairs = [];
  const usedAnswers = new Set();
  const ops = ['+', '-', '×'];
  let attempts = 0;

  while (pairs.length < count && attempts < 200) {
    attempts += 1;
    const op = ops[randomInt(0, ops.length - 1)];
    let a = randomInt(1, 10);
    let b = randomInt(1, 10);
    if (op === '-') {
      if (b > a) [a, b] = [b, a];
    }
    if (op === '×') {
      a = randomInt(1, 9);
      b = randomInt(1, 9);
    }

    const question = `${a} ${op} ${b}`;
    const answerVal = op === '+'
      ? (a + b)
      : op === '-'
        ? (a - b)
        : (a * b);
    const answer = answerVal.toString();

    if (usedAnswers.has(answer)) continue;
    usedAnswers.add(answer);
    pairs.push({ id: `pair-${pairs.length}-${Date.now()}`, question, answer });
  }
  return pairs;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(customPairs) {
  const pairs = customPairs && customPairs.length ? customPairs : createMathPairs();
  totalPairs = pairs.length;
  pairsCountEl.textContent = totalPairs;
  questionCards = shuffle(pairs.map(pair => ({ id: pair.id || `pair-${Math.random()}`, kind: 'question', text: pair.question })));
  answerCards = shuffle(pairs.map(pair => ({ id: pair.id || `pair-${Math.random()}`, kind: 'answer', text: pair.answer })));
  renderBoards();
  resetRoundStats();
}

function resetRoundStats() {
  matches = 0;
  tries = 0;
  streak = 0;
  updateScoreboard();
  firstPick = null;
  secondPick = null;
  lock = false;
  setStatus('Tap a question first, then match the answer side.');
}

function setStatus(message) {
  statusEl.textContent = message;
}

function updateScoreboard() {
  matchesEl.textContent = matches;
  triesEl.textContent = tries;
  streakEl.textContent = streak;
}

function renderBoards() {
  renderColumn(questionBoard, questionCards);
  renderColumn(answerBoard, answerCards);
}

function renderColumn(container, cards) {
  container.innerHTML = '';
  cards.forEach((card, index) => {
    const tile = document.createElement('button');
    tile.className = `tile ${card.kind}-tile`;
    tile.setAttribute('data-id', card.id);
    tile.setAttribute('data-kind', card.kind);
    tile.setAttribute('data-index', index.toString());
    tile.setAttribute('aria-label', `${card.kind} card`);

    const inner = document.createElement('div');
    inner.className = 'tile-inner';

    const front = document.createElement('div');
    front.className = 'face front';
    front.style.backgroundImage = 'url(pictures/PatrickStar.png)';
    front.innerHTML = `<span class="sr-only">Flip me</span>`;

    const back = document.createElement('div');
    back.className = `face back ${card.kind === 'question' ? 'question' : 'answer'}`;
    back.innerHTML = `
      <span class="badge ${card.kind}">${card.kind}</span>
      <div class="text">${card.text}</div>
    `;

    inner.appendChild(front);
    inner.appendChild(back);
    tile.appendChild(inner);
    tile.addEventListener('click', () => handleFlip(tile, card.kind));
    container.appendChild(tile);
  });
}

function handleFlip(tile, kind) {
  if (lock || tile.classList.contains('matched')) return;

  // Prevent starting on the answer side.
  if (!firstPick && kind !== 'question') {
    setStatus('Start with a question card on the left side.');
    return;
  }

  // Change selected question if a new one is chosen.
  if (firstPick && !secondPick && kind === 'question') {
    firstPick.classList.remove('flipped');
    tile.classList.add('flipped');
    firstPick = tile;
    setStatus('Swapped question. Now find the matching answer!');
    return;
  }

  tile.classList.add('flipped');

  if (!firstPick) {
    firstPick = tile;
    setStatus('Now find the matching answer!');
    return;
  }

  secondPick = tile;
  lock = true;
  tries += 1;
  checkForMatch();
}

function cardsMatch() {
  return firstPick.dataset.id === secondPick.dataset.id
    && firstPick.dataset.kind !== secondPick.dataset.kind;
}

function checkForMatch() {
  if (cardsMatch()) {
    matches += 1;
    streak += 1;
    firstPick.classList.add('matched');
    secondPick.classList.add('matched');
    setStatus('Aye aye! You found a pair.');
    resetPicks();
    if (matches === totalPairs) {
      setStatus('Victory! All pairs matched. Hit "New round" to shuffle again.');
    }
  } else {
    streak = 0;
    setStatus('Not quite! Try again.');
    setTimeout(() => {
      firstPick.classList.remove('flipped');
      secondPick.classList.remove('flipped');
      resetPicks();
    }, 750);
  }
  updateScoreboard();
}

function resetPicks() {
  firstPick = null;
  secondPick = null;
  lock = false;
}

document.getElementById('newRound').addEventListener('click', () => {
  const deck = loadCustomDecks().find(d => d.subject === currentSubject);
  const pairs = deck ? deck.pairs.map((p, idx) => ({ id: `c-${idx}-${currentSubject}`, question: p.question, answer: p.answer })) : null;
  buildDeck(pairs);
});

document.getElementById('resetStats').addEventListener('click', () => {
  resetRoundStats();
  document.querySelectorAll('.tile').forEach(tile => {
    tile.classList.remove('flipped', 'matched');
  });
});

subjectSelect.addEventListener('change', () => {
  currentSubject = subjectSelect.value;
  const deck = loadCustomDecks().find(d => d.subject === currentSubject);
  const pairs = deck ? deck.pairs.map((p, idx) => ({ id: `c-${idx}-${currentSubject}`, question: p.question, answer: p.answer })) : null;
  buildDeck(pairs);
  setStatus(deck ? `Using subject: ${currentSubject}` : 'Tap a question first, then match the answer side.');
});

populateSubjectSelect();
buildDeck();
