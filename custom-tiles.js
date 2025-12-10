const subjectInput = document.getElementById('subjectInput');
const questionInput = document.getElementById('questionInput');
const answerInput = document.getElementById('answerInput');
const addPairBtn = document.getElementById('addPair');
const resetBtn = document.getElementById('resetForm');
const copyBtn = document.getElementById('copyConfig');
const pairList = document.getElementById('pairList');
const configOutput = document.getElementById('configOutput');

let pairs = [];

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
      writeConfig();
    };
    actions.appendChild(removeBtn);
    row.appendChild(q);
    row.appendChild(a);
    row.appendChild(actions);
    pairList.appendChild(row);
  });
}

function writeConfig() {
  const config = {
    subject: subjectInput.value || 'Custom Subject',
    pairs: pairs.map(({ question, answer }) => ({ question, answer }))
  };
  configOutput.value = JSON.stringify(config, null, 2);
}

addPairBtn.addEventListener('click', () => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  if (!question || !answer) return;
  pairs.push({ question, answer });
  questionInput.value = '';
  answerInput.value = '';
  renderPairs();
  writeConfig();
});

resetBtn.addEventListener('click', () => {
  subjectInput.value = '';
  questionInput.value = '';
  answerInput.value = '';
  pairs = [];
  renderPairs();
  writeConfig();
});

copyBtn.addEventListener('click', () => {
  configOutput.select();
  document.execCommand('copy');
});

subjectInput.addEventListener('input', writeConfig);

writeConfig();
