let currentRow = 0;
let currentRemaining = null;

// For mobile compatibility
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const mobileInput = document.getElementById('mobileInput');

async function getAllWords() {
    const response = await fetch('/words');
    return await response.json();
}

function displayResults(data) {
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
    
    // add progress bars for each solution
    const solutionsDiv = document.getElementById('solutions');
    let html = '<h3>Remaining Words (Ranked)</h3>';
    html += '<div class="solutions-list">';
    
    data.ranked.forEach(([word, score]) => {
        const barWidth = score <= 1 ? 100 : Math.max(3, 100 / score);
        const barColor = score <= 3.5 ? 'excellent' : score <= 10 ? 'good' : score <= 22 ? 'decent' : 'poor';
        
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

function toggleCellColor(cell) {
    // Wrong row
    if (parseInt(cell.dataset.row) !== currentRow) return;
    // Nothing typed yet
    if (!cell.textContent) return;
    
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

// Some key is pressed
document.addEventListener('keydown', (e) => {
    // Gets rid of repetition with later mobile input code
    if (isMobile) return;
    // If game over
    if (currentRow >= 6) return;
    
    const currentCells = document.querySelectorAll(`[data-row="${currentRow}"]`);
    let currentCol = Array.from(currentCells).findIndex(cell => !cell.textContent);
    
    // Lets backspace work correctly by putting cursor at last col if row is full
    if (currentCol === -1) currentCol = 5;
    
    if (e.key === 'Enter') {
        document.getElementById('submitBtn').click();
    } else if (e.key === 'Backspace') {
        if (currentCol === 5 && currentCells[4].textContent) {
            currentCells[4].textContent = '';
            currentCells[4].classList.remove('gray', 'yellow', 'green');
        } else if (currentCol > 0) {
            currentCells[currentCol - 1].textContent = '';
            currentCells[currentCol - 1].classList.remove('gray', 'yellow', 'green');
        }
    } else if (e.key.length === 1 && e.key.match(/[a-z]/i) && currentCol < 5) {
        currentCells[currentCol].textContent = e.key.toUpperCase();
    }
});

document.getElementById('submitBtn').addEventListener('click', async () => {
    if (currentRow >= 6) return;
    
    const currentCells = document.querySelectorAll(`[data-row="${currentRow}"]`);
    
    // Ensure row is full
    const guess = Array.from(currentCells).map(cell => cell.textContent).join('');
    if (guess.length !== 5) {
        alert('Please enter a 5-letter word');
        return;
    }
    
    const pattern = Array.from(currentCells).map(cell => {
        if (cell.classList.contains('green')) return 'G';
        if (cell.classList.contains('yellow')) return 'Y';
        if (cell.classList.contains('gray')) return 'B';
        return null;
    }).join('');
    
    // Ensure each cell has a color selected
    if (pattern.includes('null') || pattern.length !== 5) {
    alert('Please click each letter to set its color');
    return;
}
    const validWords = currentRow === 0 ? await getAllWords() : currentRemaining;

    if (currentRow > 0 && !validWords.includes(guess.toLowerCase())) {
        alert('That word is not a valid remaining solution. Please enter a different guess from the list.');
        return;
    }
    
    // All tests passed -- send to backend
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
        // Stop things by setting currentRow to max
        currentRow = 6;
    } else {
        displayResults(data);
        currentRow++;
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('gray', 'yellow', 'green');
    });
    
    currentRow = 0;
    currentRemaining = null;
    
    document.getElementById('stats').innerHTML = '';
    document.getElementById('solutions').innerHTML = '';
});

if (isMobile) {
    document.getElementById('board').addEventListener('click', (e) => {
        if (e.target.classList.contains('cell') && 
            parseInt(e.target.dataset.row) === currentRow) {
            e.preventDefault();
            mobileInput.focus();
        }
    });
    
    mobileInput.addEventListener('input', (e) => {
        const letter = e.target.value.slice(-1).toUpperCase();
        if (/[A-Z]/.test(letter)) {
            const currentCells = document.querySelectorAll(`[data-row="${currentRow}"]`);
            const emptyCell = Array.from(currentCells).find(cell => !cell.textContent);
            if (emptyCell) {
                emptyCell.textContent = letter;
            }
        }
        mobileInput.value = '';
    });

    mobileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            const currentCells = document.querySelectorAll(`[data-row="${currentRow}"]`);
            const filledCells = Array.from(currentCells).filter(cell => cell.textContent);
            if (filledCells.length > 0) {
                const lastCell = filledCells[filledCells.length - 1];
                lastCell.textContent = '';
                lastCell.classList.remove('gray', 'yellow', 'green');
            }
        }
    });
}

createGrid();