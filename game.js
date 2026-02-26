class Game2048 {
    constructor() {
        this.size = 4;
        this.cellSize = 80;
        this.gap = 10;
        
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.theme = localStorage.getItem('theme') || 'light';
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.userInteracted = false;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.gameOverDisplay = document.getElementById('game-over');
        this.winDisplay = document.getElementById('win-display');
        this.restartBtn = document.getElementById('restart-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.themeBtn = document.getElementById('theme-btn');
        this.swipeIndicator = document.getElementById('swipe-indicator');
        this.comboDisplay = document.getElementById('combo-display');
        this.comboCount = 0;
        this.history = [];
        this.undoBtn = document.getElementById('undo-btn');
        
        this.tileId = 0;
        this.won = false;
        this.continued = false;
        
        this.applyTheme();
        this.updateCellSize();
        this.init();
        this.bindEvents();
        
        window.addEventListener('resize', () => this.updateCellSize());
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeBtn.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.userInteracted = true;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        document.getElementById('sound-btn').textContent = this.soundEnabled ? '🔊' : '🔇';
        if (this.soundEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    }

    enableAudio() {
        if (!this.userInteracted) {
            this.userInteracted = true;
            if (this.soundEnabled) {
                this.startBGM();
            }
        }
    }

    startBGM() {
        if (!this.soundEnabled || !this.userInteracted || this.bgmPlaying) return;
        try {
            this.bgmPlaying = true;
            this.bgmInterval = setInterval(() => {
                if (!this.soundEnabled || this.gameOverDisplay.classList.contains('active')) return;
                this.playBGMNote();
            }, 400);
        } catch (e) {}
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    playBGMNote() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            const bgmNotes = [262, 294, 330, 349, 392, 440, 494, 523];
            const note = bgmNotes[Math.floor(Math.random() * bgmNotes.length)];
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = note;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.3);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {}
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            if (type === 'move') {
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.1);
            } else if (type === 'merge') {
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.15);
            } else if (type === 'gameover') {
                oscillator.frequency.value = 150;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
            } else if (type === 'win') {
                oscillator.frequency.value = 523;
                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.4);
            }
        } catch (e) {}
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    updateCellSize() {
        const container = document.querySelector('.game-container');
        if (container) {
            const totalWidth = container.offsetWidth - 20;
            this.cellSize = (totalWidth - this.gap * 3) / 4;
        }
    }

    getTilePosition(col, row) {
        return {
            x: col * (this.cellSize + this.gap),
            y: row * (this.cellSize + this.gap)
        };
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(null));
        this.score = 0;
        this.won = false;
        this.continued = false;
        this.tileId = 0;
        this.history = [];
        
        this.updateScore();
        this.updateBestScore();
        this.clearTiles();
        this.updateUndoButton();
        this.gameOverDisplay.classList.remove('active');
        this.winDisplay?.classList?.remove('active');
        
        this.addRandomTile();
        this.addRandomTile();
        
        if (this.soundEnabled) {
            this.startBGM();
        }
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKey(e));
        
        let startX, startY;
        let isTouching = false;
        
        const handleStart = (x, y, isTouch) => {
            startX = x;
            startY = y;
            isTouching = isTouch;
        };
        
        const handleEnd = (x, y) => {
            if (startX === undefined || startY === undefined) return;
            
            const dx = x - startX;
            const dy = y - startY;
            
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                this.handleSwipe(dx, dy);
            }
            
            startX = undefined;
            startY = undefined;
            isTouching = false;
        };

        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleStart(e.touches[0].clientX, e.touches[0].clientY, true);
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }, { passive: true });

        document.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleStart(e.clientX, e.clientY, false);
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleEnd(e.clientX, e.clientY);
        });

        this.restartBtn.addEventListener('click', () => this.init());
        this.continueBtn?.addEventListener('click', () => this.continueGame());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.undoBtn.addEventListener('click', () => this.undo());
        
        const soundBtn = document.getElementById('sound-btn');
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        soundBtn.addEventListener('click', () => this.toggleSound());
        
        document.addEventListener('click', () => this.enableAudio(), { once: true });
        document.addEventListener('keydown', () => this.enableAudio(), { once: true });
    }

    handleKey(e) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            this.move(keyMap[e.key]);
        } else if (e.key === 'z' || e.key === 'Z') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                this.undo();
            }
        }
    }

    handleSwipe(dx, dy) {
        const threshold = 30;
        const directionArrows = { 'up': '↑', 'down': '↓', 'left': '←', 'right': '→' };
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > threshold) {
                const direction = dx > 0 ? 'right' : 'left';
                this.showSwipeIndicator(directionArrows[direction]);
                this.move(direction);
            }
        } else {
            if (Math.abs(dy) > threshold) {
                const direction = dy > 0 ? 'down' : 'up';
                this.showSwipeIndicator(directionArrows[direction]);
                this.move(direction);
            }
        }
    }

    showSwipeIndicator(arrow) {
        if (!this.swipeIndicator) return;
        this.swipeIndicator.textContent = arrow;
        this.swipeIndicator.classList.add('show');
        setTimeout(() => {
            this.swipeIndicator.classList.remove('show');
        }, 200);
    }

    showCombo(count) {
        if (!this.comboDisplay) return;
        this.comboDisplay.textContent = `${count} COMBO!`;
        this.comboDisplay.classList.add('show');
        setTimeout(() => {
            this.comboDisplay.classList.remove('show');
        }, 500);
    }

    saveHistory() {
        const state = {
            grid: this.grid.map(row => row.map(cell => cell ? { value: cell.value, id: cell.id } : null)),
            score: this.score
        };
        this.history.push(state);
        if (this.history.length > 10) this.history.shift();
        this.updateUndoButton();
    }

    undo() {
        if (this.history.length === 0) return;
        
        const state = this.history.pop();
        this.score = state.score;
        this.updateScore();
        
        this.clearTiles();
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = state.grid[r][c];
                if (cell) {
                    const tile = document.createElement('div');
                    const tileClass = cell.value > 2048 ? 'super' : cell.value;
                    tile.className = `tile tile-${tileClass}`;
                    tile.textContent = cell.value;
                    tile.dataset.id = cell.id;
                    
                    const pos = this.getTilePosition(c, r);
                    tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                    tile.style.width = `${this.cellSize}px`;
                    tile.style.height = `${this.cellSize}px`;
                    
                    this.tileContainer.appendChild(tile);
                    this.grid[r][c] = { element: tile, value: cell.value, id: cell.id };
                } else {
                    this.grid[r][c] = null;
                }
            }
        }
        
        this.updateUndoButton();
        this.playSound('move');
    }

    updateUndoButton() {
        if (this.undoBtn) {
            this.undoBtn.disabled = this.history.length === 0;
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return false;

        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.createTile(r, c, value, true);
        return true;
    }

    createTile(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        const tileClass = value > 2048 ? 'super' : value;
        tile.className = `tile tile-${tileClass}${isNew ? ' tile-new' : ''}`;
        tile.textContent = value;
        tile.dataset.id = this.tileId++;
        
        const pos = this.getTilePosition(col, row);
        tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        tile.style.width = `${this.cellSize}px`;
        tile.style.height = `${this.cellSize}px`;
        
        this.tileContainer.appendChild(tile);
        
        this.grid[row][col] = { element: tile, value, id: parseInt(tile.dataset.id) };
        
        return tile;
    }

    move(direction) {
        const vector = {
            'up': { r: -1, c: 0 },
            'down': { r: 1, c: 0 },
            'left': { r: 0, c: -1 },
            'right': { r: 0, c: 1 }
        }[direction];

        const isVertical = direction === 'up' || direction === 'down';
        const isReverse = direction === 'down' || direction === 'right';

        let moved = false;
        const mergedPositions = [];

        const processLine = (line) => {
            let arr = line.filter(cell => cell !== null);
            
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i].value === arr[i + 1].value) {
                    arr[i].value *= 2;
                    this.score += arr[i].value;
                    
                    arr[i + 1].element.remove();
                    arr.splice(i + 1, 1);
                    
                    mergedPositions.push(arr[i]);
                    arr[i].element.classList.add('tile-merged');
                    this.playSound('merge');
                    
                    if (arr[i].value === 2048 && !this.won && !this.continued) {
                        this.showWin();
                    }
                }
            }
            
            while (arr.length < this.size) {
                arr.push(null);
            }
            
            return arr;
        };

        for (let i = 0; i < this.size; i++) {
            let line;
            if (isVertical) {
                line = [];
                for (let j = 0; j < this.size; j++) {
                    line.push(this.grid[j][i]);
                }
            } else {
                line = [...this.grid[i]];
            }

            if (isReverse) line.reverse();

            const processed = processLine(line);

            if (isReverse) processed.reverse();

            for (let j = 0; j < this.size; j++) {
                const oldCell = isVertical ? this.grid[j][i] : this.grid[i][j];
                const newCell = processed[j];
                
                if (oldCell !== newCell) {
                    moved = true;
                }
                
                if (isVertical) {
                    this.grid[j][i] = newCell;
                } else {
                    this.grid[i][j] = newCell;
                }
                
                if (newCell) {
                    const pos = this.getTilePosition(
                        isVertical ? i : j,
                        isVertical ? j : i
                    );
                    newCell.element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                    
                    const tileClass = newCell.value > 2048 ? 'super' : newCell.value;
                    newCell.element.className = `tile tile-${tileClass}`;
                }
            }
        }

        if (moved) {
            this.saveHistory();
            
            if (mergedPositions.length > 1) {
                this.comboCount += mergedPositions.length;
                this.showCombo(this.comboCount);
            } else if (mergedPositions.length === 1) {
                this.comboCount = 0;
            }
            
            this.playSound('move');
            this.updateScore();
            
            setTimeout(() => {
                document.querySelectorAll('.tile-new').forEach(tile => {
                    tile.classList.remove('tile-new');
                });
                
                if (mergedPositions.length > 0) {
                    confetti({
                        particleCount: 30,
                        spread: 50,
                        origin: { y: 0.6 },
                        colors: ['#f2b179', '#edcc61', '#edc22e']
                    });
                }
                
                this.addRandomTile();
                
                if (this.isGameOver()) {
                    this.showGameOver();
                }
            }, 200);
        }
    }

    showWin() {
        this.won = true;
        this.stopBGM();
        this.playSound('win');
        const winEl = document.getElementById('win-display');
        if (winEl) winEl.classList.add('active');
    }

    continueGame() {
        this.continued = true;
        const winEl = document.getElementById('win-display');
        if (winEl) winEl.classList.remove('active');
    }

    showGameOver() {
        this.stopBGM();
        this.playSound('gameover');
        this.gameOverDisplay.classList.add('active');
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            this.updateBestScore();
        }
    }

    updateBestScore() {
        if (this.bestScoreDisplay) {
            this.bestScoreDisplay.textContent = this.bestScore;
        }
    }

    clearTiles() {
        this.tileContainer.innerHTML = '';
    }

    isGameOver() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) return false;
            }
        }

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const current = this.grid[r][c].value;
                if (c < this.size - 1 && this.grid[r][c + 1]?.value === current) return false;
                if (r < this.size - 1 && this.grid[r + 1][c]?.value === current) return false;
            }
        }
        
        return true;
    }
}

const game = new Game2048();
