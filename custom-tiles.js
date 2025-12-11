const subjectInput = document.getElementById('subjectInput');
const questionInput = document.getElementById('questionInput');
const answerInput = document.getElementById('answerInput');
const addPairBtn = document.getElementById('addPair');
const resetBtn = document.getElementById('resetForm');
const saveBtn = document.getElementById('saveDeck');
const savedSelect = document.getElementById('savedSelect');
const pairList = document.getElementById('pairList');
const saveStatus = document.getElementById('saveStatus');

let pairs = [];
let decks = [];

function renderPairs() {
  pairList.innerHTML = '';
  pairs.forEach((pair, idx) => {
    const row = document.createElement('div');
    const q = document.createElement('span');
    q.textContent = pair.question;
    const a = document.createElement('span');
    a.textContent = pair.answer;
    const actions = document.createElement('span');
    const removeBtn = document.createElement('button');
    removeBtn.className = 'pill-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => {
      pairs.splice(idx, 1);
      renderPairs();
    };
    actions.appendChild(removeBtn);
    row.appendChild(q);
    row.appendChild(a);
    row.appendChild(actions);
    pairList.appendChild(row);
  });
}

function loadDecks() {
  try {
    decks = JSON.parse(localStorage.getItem('customDecks')) || [];
  } catch (e) {
    decks = [];
  }
}

function populateSavedSelect() {
  savedSelect.innerHTML = '<option value="">Select saved subject…</option>';
  decks.forEach(deck => {
    const opt = document.createElement('option');
    opt.value = deck.subject;
    opt.textContent = deck.subject;
    savedSelect.appendChild(opt);
  });
}

addPairBtn.addEventListener('click', () => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  if (!question || !answer) return;
  pairs.push({ question, answer });
  questionInput.value = '';
  answerInput.value = '';
  renderPairs();
});

resetBtn.addEventListener('click', () => {
  subjectInput.value = '';
  questionInput.value = '';
  answerInput.value = '';
  pairs = [];
  renderPairs();
});

saveBtn.addEventListener('click', () => {
  const subject = subjectInput.value.trim() || 'Custom Subject';
  if (!pairs.length) {
    saveStatus.textContent = 'Add at least one pair before saving.';
    return;
  }
  const deck = { subject, pairs: pairs.map(p => ({ question: p.question, answer: p.answer })) };
  loadDecks();
  const existingIdx = decks.findIndex(d => d.subject === subject);
  if (existingIdx >= 0) decks[existingIdx] = deck; else decks.push(deck);
  localStorage.setItem('customDecks', JSON.stringify(decks));
  populateSavedSelect();
  savedSelect.value = subject;
  saveStatus.textContent = `Saved "${subject}" to the game.`;
});

savedSelect.addEventListener('change', () => {
  const subj = savedSelect.value;
  if (!subj) {
    pairs = [];
    subjectInput.value = '';
    renderPairs();
    saveStatus.textContent = '';
    return;
  }
  loadDecks();
  const deck = decks.find(d => d.subject === subj);
  if (!deck) return;
  subjectInput.value = deck.subject;
  pairs = deck.pairs.map(p => (
      { 
        question: p.question, 
        answer: p.answer 
      }
    )
  );
  renderPairs();
  saveStatus.textContent = `Loaded "${deck.subject}". Add pairs and Save to update.`;
});

loadDecks();
populateSavedSelect();
