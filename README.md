# Wordle Solver

An interactive web application that helps solve Wordle puzzles using mathematical optimization to suggest the best next guesses.

🔗 **[Live Demo](https://pearlmans-wordle-solver.onrender.com)**

## Features

- Interactive 5x6 Wordle-style grid with click-to-toggle colors
- Real-time analysis of guess quality using expected value calculations
- Visual progress bars showing relative effectiveness of each potential guess
- Statistics panel tracking elimination progress
- Mobile-responsive design

## How It Works

The solver uses an **expected value algorithm** to rank potential guesses:

1. For each possible guess, simulates it against all remaining valid solutions
2. Groups solutions by the pattern they would produce (e.g., "BGGYG")
3. Calculates expected remaining solutions: `Σ(count² / total)`
4. Ranks guesses by lowest expected value (fewer remaining = better guess)

This approach minimizes the average number of remaining possibilities, making it mathematically optimal for narrowing down the answer.

## Tech Stack

- **Backend:** Python, FastAPI
- **Frontend:** JavaScript, HTML, CSS
- **Deployment:** Render

## Usage

1. Enter your Wordle guess in the grid
2. Click each letter to set its color based on Wordle's feedback:
   - Gray: Letter not in word
   - Yellow: Letter in word, wrong position
   - Green: Letter in word, correct position
3. Click "Analyze Guess" to see ranked recommendations
4. Repeat with your next guess

---

Built by Miles Pearlman