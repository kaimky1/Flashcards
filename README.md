# SpongeBob Flashcard Match

A two-column matching game: flip a question card on the left, find its matching answer on the right. Includes auto-generated math facts, custom teacher decks, a preview phase, timer, and per-subject best times.

## Features
- Math mode: random +/–/× facts with unique answers each round.
- Custom subjects: build decks in `custom-tiles.html`, save to your browser, and select them in the main game.
- 5-second preview: all cards show briefly before play starts.
- Scoreboard: matches, tries, streak, timer, and fastest time per subject.
- Persistent data: custom decks and best times stored in `localStorage` (per browser/profile).

## How to play
1. Go to `https://kaimky1.github.io/Flashcards/index.html`.
2. Choose a subject (Math or a saved custom subject).
3. Watch the 5-second preview; then flip a question first, then its matching answer.
4. Clear all pairs; your best time for that subject is recorded.

## Creating custom decks
1. Open `https://kaimky1.github.io/Flashcards/custom-tiles.html`.
2. Enter a subject name and add question/answer pairs.
3. Click **Save to game** to store the deck in your browser.
4. Return to `index.html` and pick your subject from the dropdown.

## Tech notes
- Plain HTML/CSS/JS; no external dependencies.
- Matching uses shared pair IDs between question/answer cards.
- Timer uses `setInterval`; best times and decks are saved in `localStorage`.
