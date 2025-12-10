// Preloaded Elementary Math flashcards
const preloadedCards = [
  { type: 'mc', question: '2 + 2 = ?', choices: ['3','4','5','6'], answer: '4' },
  { type: 'mc', question: '5 - 3 = ?', choices: ['1','2','3','4'], answer: '2' },
  { type: 'input', question: '3 x 4 = ?', answer: '12' },
  { type: 'flip', question: 'What is the square of 5?', back: '25' }
];

// App state
let deck = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let soundOn = true;

// Load progress from localStorage
function loadProgress() {
  const savedDeck = localStorage.getItem('flashcardDeck');
  if(savedDeck) deck = JSON.parse(savedDeck); else deck = [...preloadedCards];
  score = parseInt(localStorage.getItem('score')) || 0;
  streak = parseInt(localStorage.getItem('streak')) || 0;
}

// Save progress
function saveProgress() {
  localStorage.setItem('flashcardDeck', JSON.stringify(deck));
  localStorage.setItem('score', score);
  localStorage.setItem('streak', streak);
}

// Update score display
function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('streak').textContent = streak;
  document.getElementById('deckSize').textContent = deck.length;
  const pct = ((currentIndex+1)/deck.length)*100;
  document.getElementById('progressBar').style.width = pct+'%';
}

// Render current card
function renderCard() {
  const card = deck[currentIndex];
  document.getElementById('questionText').textContent = card.question;
  document.getElementById('cardType').textContent = `Type: ${card.type}`;
  document.getElementById('cardIndex').textContent = `Card ${currentIndex+1} / ${deck.length}`;
  const interactive = document.getElementById('interactiveArea');
  interactive.innerHTML = '';
  document.getElementById('feedback').textContent = '';

  if(card.type==='mc'){
    card.choices.forEach(c=>{
      const btn = document.createElement('button');
      btn.textContent = c;
      btn.className='choice btn';
      btn.onclick=()=>checkAnswer(c);
      interactive.appendChild(btn);
    });
  } else if(card.type==='input'){
    const inp = document.createElement('input');
    inp.className='input-answer';
    inp.type='text';
    const submit = document.createElement('button');
    submit.textContent='Submit';
    submit.className='btn';
    submit.onclick=()=>checkAnswer(inp.value);
    interactive.appendChild(inp);
    interactive.appendChild(submit);
  } else if(card.type==='flip'){
    const flipBtn = document.createElement('button');
    flipBtn.className='btn';
    flipBtn.textContent='Show Answer';
    flipBtn.onclick=()=>document.getElementById('feedback').textContent=card.back;
    interactive.appendChild(flipBtn);
  }
}

// Check answer
function checkAnswer(val){
  const card = deck[currentIndex];
  if(val===card.answer){
    score++; streak++;
    document.getElementById('feedback').textContent='✅ Correct!';
    if(soundOn) new Audio('https://freesound.org/data/previews/320/320655_5260872-lq.mp3').play();
  } else {
    streak=0;
    document.getElementById('feedback').textContent=`❌ Incorrect! Answer: ${card.answer||card.back}`;
    if(soundOn) new Audio('https://freesound.org/data/previews/320/320659_5260872-lq.mp3').play();
  }
  saveProgress();
  updateStats();
}

// Next / Prev
document.getElementById('nextBtn').onclick = ()=>{
  if(currentIndex<deck.length-1) currentIndex++;
  renderCard();
  updateStats();
};
document.getElementById('prevBtn').onclick = ()=>{
  if(currentIndex>0) currentIndex--;
  renderCard();
  updateStats();
};

// Toggle sound
document.getElementById('soundToggle').onclick = ()=>{
  soundOn = !soundOn;
  document.getElementById('soundToggle').textContent = 'Sound: '+(soundOn?'ON':'OFF');
};

// Reset progress
document.getElementById('resetBtn').onclick = ()=>{
  localStorage.clear();
  loadProgress();
  score=0; streak=0; currentIndex=0;
  renderCard();
  updateStats();
};

// Shuffle deck
document.getElementById('shuffleBtn').onclick = ()=>{
  deck.sort(()=>Math.random()-0.5);
  currentIndex=0;
  renderCard();
  updateStats();
};

// Mark known (flip card)
document.getElementById('markKnownBtn').onclick = ()=>{
  score++; streak++;
  updateStats();
};

// Add card logic
document.getElementById('mcFields').style.display='block';

document.getElementById('cardTypeSelect').onchange = e=>{
  const type=e.target.value;
  document.getElementById('mcFields').style.display='none';
  document.getElementById('inputFields').style.display='none';
  document.getElementById('flipFields').style.display='none';
  if(type==='mc') document.getElementById('mcFields').style.display='block';
  if(type==='input') document.getElementById('inputFields').style.display='block';
  if(type==='flip') document.getElementById('flipFields').style.display='block';
};
document.getElementById('addCardBtn').onclick = ()=>{
  const type=document.getElementById('cardTypeSelect').value;
  const question=document.getElementById('qText').value;
  let card={type, question};
  if(type==='mc'){
    const choices=document.getElementById('mcChoices').value.split(',').map(c=>c.trim());
    const answer=document.getElementById('mcAnswer').value.trim();
    card.choices=choices; card.answer=answer;
  } else if(type==='input'){
    card.answer=document.getElementById('inputAnswer').value.trim();
  } else if(type==='flip'){
    card.back=document.getElementById('flipBack').value.trim();
  }
  deck.push(card);
  saveProgress();
  updateStats();
  renderCard();
};

// Reset to preloaded
document.getElementById('importBtn').onclick = ()=>{
  deck=[...preloadedCards];
  currentIndex=0;
  renderCard();
  updateStats();
};

// Initialize
loadProgress();
renderCard();
updateStats();

