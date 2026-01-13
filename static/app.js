let currentRow = 0;
let currentGuesses = [];

let currentRemaining = null;

// Get all words on first guess
async function getAllWords() {
    const response = await fetch('/words');
    return await response.json();
}

// Display results
function displayResults(data) {
    // Update stats section
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <h3>Stats</h3>
        <div class="stat-item">
            <span class="stat-label">Expected Solutions:</span>
            <span class="stat-value">${data.stats.expectedSolutions}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Actual Solutions:</span>
            <span class="stat-value">${data.stats.actualSolutions}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Chance Correct:</span>
            <span class="stat-value">${data.stats.chanceCorrect}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Solutions Eliminated:</span>
            <span class="stat-value">${data.stats.percentEliminated}%</span>
        </div>
        <div style="margin-top: 1rem;">
            <div class="progress-bar-container" style="height: 12px;">
                <div class="progress-bar excellent" style="width: ${data.stats.percentEliminated}%"></div>
            </div>
        </div>
    `;
    
    // Update solutions section with progress bars
    const solutionsDiv = document.getElementById('solutions');
    let html = '<h3>Remaining Words (Ranked)</h3>';
    html += '<div class="solutions-list">';
    
    data.ranked.forEach(([word, score]) => {
        const barWidth = score <= 1 ? 100 : Math.max(3, 100 / score);
        const barColor = score <= 1.5 ? 'excellent' : score <= 3 ? 'good' : score <= 6 ? 'decent' : 'poor';
        
        html += `
            <div class="solution-item">
                <span class="solution-word">${word}</span>
                <div class="progress-bar-container">
                    <div class="progress-bar ${barColor}" style="width: ${barWidth}%"></div>
                </div>
                <span class="solution-score">${score}</span>
            </div>
        `;
    });
    
    html += '</div>';
    solutionsDiv.innerHTML = html;
}

// Create the initial grid (6 rows like Wordle)
function createGrid() {
    const board = document.getElementById('board');
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => toggleCellColor(cell));
            board.appendChild(cell);
        }
    }
}

// Toggle cell color: gray -> yellow -> green -> gray
function toggleCellColor(cell) {
    if (parseInt(cell.dataset.row) !== currentRow) return;

    if (!cell.textContent) return; // Can't toggle empty cells
    
    if (!cell.classList.contains('gray') && !cell.classList.contains('yellow') && !cell.classList.contains('green')) {
        cell.classList.add('gray');
    } else if (cell.classList.contains('gray')) {
        cell.classList.remove('gray');
        cell.classList.add('yellow');
    } else if (cell.classList.contains('yellow')) {
        cell.classList.remove('yellow');
        cell.classList.add('green');
    } else {
        cell.classList.remove('green');
    }
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (currentRow >= 6) return;
    
    const currentCells = document.querySelectorAll(`[data-row="${currentRow}"]`);
    let currentCol = Array.from(currentCells).findIndex(cell => !cell.textContent);
    
    // If all cells are filled, set cursor to end
    if (currentCol === -1) currentCol = 5;
    
    if (e.key === 'Enter') {
        // Trigger analyze button
        document.getElementById('submitBtn').click();
    } else if (e.key === 'Backspace') {
        if (currentCol === 5 && currentCells[4].textContent) {
            // Delete last letter if row is full
            currentCells[4].textContent = '';
            currentCells[4].classList.remove('gray', 'yellow', 'green');  // ADD THIS LINE
        } else if (currentCol > 0) {
            // Delete previous letter
            currentCells[currentCol - 1].textContent = '';
            currentCells[currentCol - 1].classList.remove('gray', 'yellow', 'green');
        }
    } else if (e.key.length === 1 && e.key.match(/[a-z]/i) && currentCol < 5) {
        currentCells[currentCol].textContent = e.key.toUpperCase();
    }
});

// Initialize
createGrid();

document.getElementById('submitBtn').addEventListener('click', async () => {
    if (currentRow >= 6) return;
    
    const currentCells = document.querySelectorAll(`[data-row="${currentRow}"]`);
    
    // Check all cells have letters
    const guess = Array.from(currentCells).map(cell => cell.textContent).join('');
    if (guess.length !== 5) {
        alert('Please enter a 5-letter word');
        return;
    }
    
    // Check all cells have colors
    const pattern = Array.from(currentCells).map(cell => {
        if (cell.classList.contains('green')) return 'G';
        if (cell.classList.contains('yellow')) return 'Y';
        if (cell.classList.contains('gray')) return 'B';
        return null;
    }).join('');
    
    if (pattern.includes('null') || pattern.length !== 5) {
    alert('Please click each letter to set its color');
    return;
}
    // Get list of valid words to check against
    const validWords = currentRow === 0 ? await getAllWords() : currentRemaining;

    // Check if guess is valid (skip check for first guess)
    if (currentRow > 0 && !validWords.includes(guess.toLowerCase())) {
        alert('That word is not a valid remaining solution. Please enter a different guess.');
        return;
    }
    
    // Send to backend
    const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            guess: guess.toLowerCase(),
            pattern: pattern,
            remaining: currentRow === 0 ? await getAllWords() : currentRemaining
        })
    });

    const data = await response.json();
    console.log('Response:', data);

    currentRemaining = data.remaining;
    if (pattern === 'GGGGG') {
        alert(`Word found: ${guess.toUpperCase()}!`);
        currentRow = 6; // Set to max to prevent more guesses
    } else {
        displayResults(data);
        currentRow++;
    }
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    // Clear the board
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('gray', 'yellow', 'green');
    });
    
    // Reset state
    currentRow = 0;
    currentRemaining = null;
    
    // Clear results
    document.getElementById('stats').innerHTML = '';
    document.getElementById('solutions').innerHTML = '';
});