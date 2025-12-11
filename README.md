# SpongeBob Flashcard Match

A two-column matching game: flip a question card on the left, find its matching answer on the right. Includes auto-generated math facts, custom teacher decks, a preview phase, timer, and per-subject best times.

## How to play
1. Go to `https://kaimky1.github.io/Flashcards/index.html`.
2. Choose a subject (Math or a saved custom subject).
3. Watch the 5-second preview; then flip a question first, then its matching answer.
4. Clear all pairs; your best time for that subject is recorded.
5. You can also create custom decks with different subjects. 

## Tech notes
- Plain HTML/CSS/JS; no external dependencies.
- Matching uses shared pair IDs between question/answer cards.
- Timer uses `setInterval`; best times and decks are saved in `localStorage`.
