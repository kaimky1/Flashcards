const questionBoard = document.getElementById('questionBoard');
const answerBoard = document.getElementById('answerBoard');
const statusEl = document.getElementById('status');
const matchesEl = document.getElementById('matches');
const triesEl = document.getElementById('tries');
const streakEl = document.getElementById('streak');
const pairsCountEl = document.getElementById('pairsCount');
const timerEl = document.getElementById('timer');
const bestTimeEl = document.getElementById('bestTime');
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
let timerInterval = null;
let elapsedSeconds = 0;
let bestTimes = {};
const PREVIEW_MS = 5000;

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
  subjectSelect.innerHTML = `<option value="math">Math (default)</option>`;
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
      // Swap to ensure a > b, no negative numbers
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
  const safePairs = pairs.map((pair, idx) => ({
    ...pair,
    id: pair.id || `pair-${Date.now()}-${idx}`
  }));
  totalPairs = pairs.length;
  pairsCountEl.textContent = totalPairs;
  questionCards = shuffle(safePairs.map(pair => ({
    id: pair.id,
    kind: 'question',
    text: pair.question
  })));
  answerCards = shuffle(safePairs.map(pair => ({
    id: pair.id,
    kind: 'answer',
    text: pair.answer
  })));
  renderBoards();
  resetRoundStats();
  updateBestDisplay();
  previewBoard();
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

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function loadBestTimes() {
  try {
    const stored = localStorage.getItem('bestTimes');
    bestTimes = stored ? JSON.parse(stored) : {};
  } catch (e) {
    bestTimes = {};
  }
}

function saveBestTimes() {
  localStorage.setItem('bestTimes', JSON.stringify(bestTimes));
}

function updateBestDisplay() {
  const best = bestTimes[currentSubject];
  bestTimeEl.textContent = Number.isFinite(best) ? formatTime(best) : '--:--';
}

function renderBoards() {
  renderColumn(questionBoard, questionCards);
  renderColumn(answerBoard, answerCards);
}

function previewBoard() {
  lock = true;
  setStatus('Memorize the board!');
  document.querySelectorAll('.tile').forEach(tile => tile.classList.add('flipped'));
  setTimeout(() => {
    document.querySelectorAll('.tile').forEach(tile => tile.classList.remove('flipped', 'matched'));
    lock = false;
    startTimer();
    setStatus('Tap a question first, then match the answer side.');
  }, PREVIEW_MS);
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
    front.innerHTML = '';

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

  // Allow changing selection if clicking the same kind again.
  if (firstPick && !secondPick && firstPick.dataset.kind === kind) {
    firstPick.classList.remove('flipped');
    tile.classList.add('flipped');
    firstPick = tile;
    setStatus('Swapped selection. Now find the match!');
    return;
  }

  tile.classList.add('flipped');

  if (!firstPick) {
    firstPick = tile;
    setStatus('Now find the match!');
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
    firstPick.classList.add('flipped', 'matched');
    secondPick.classList.add('flipped', 'matched');
    setStatus('Aye aye! You found a pair.');
    resetPicks();
    if (matches === totalPairs) {
      setStatus('Victory! All pairs matched. Hit "New round" to shuffle again.');
      stopTimer();
      const best = bestTimes[currentSubject];
      if (!Number.isFinite(best) || elapsedSeconds < best) {
        bestTimes[currentSubject] = elapsedSeconds;
        saveBestTimes();
        updateBestDisplay();
      }
    }
  } else {
    streak = 0;
    setStatus('Not quite! Try again.');
    const a = firstPick;
    const b = secondPick;
    setTimeout(() => {
      if (!a.classList.contains('matched')) a.classList.remove('flipped');
      if (!b.classList.contains('matched')) b.classList.remove('flipped');
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
  previewBoard();
});

subjectSelect.addEventListener('change', () => {
  currentSubject = subjectSelect.value;
  const deck = loadCustomDecks().find(d => d.subject === currentSubject);
  const pairs = deck ? deck.pairs.map((p, idx) => ({ id: `c-${idx}-${currentSubject}`, question: p.question, answer: p.answer })) : null;
  buildDeck(pairs);
  setStatus(deck ? `Using subject: ${currentSubject}` : 'Tap a question first, then match the answer side.');
});

loadBestTimes();
populateSubjectSelect();
buildDeck();
