class Game2048 {
    constructor() {
        this.size = 4;
        this.cellSize = 80;
        this.gap = 10;
        
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.gameOverDisplay = document.getElementById('game-over');
        this.winDisplay = document.getElementById('win-display');
        this.restartBtn = document.getElementById('restart-btn');
        this.continueBtn = document.getElementById('continue-btn');
        
        this.tileId = 0;
        this.won = false;
        this.continued = false;

        this.updateCellSize();
        this.init();
        this.bindEvents();
        
        window.addEventListener('resize', () => this.updateCellSize());
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
        
        this.updateScore();
        this.updateBestScore();
        this.clearTiles();
        this.gameOverDisplay.classList.remove('active');
        this.winDisplay?.classList?.remove('active');
        
        this.addRandomTile();
        this.addRandomTile();
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
        }
    }

    handleSwipe(dx, dy) {
        const threshold = 30;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > threshold) {
                this.move(dx > 0 ? 'right' : 'left');
            }
        } else {
            if (Math.abs(dy) > threshold) {
                this.move(dy > 0 ? 'down' : 'up');
            }
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
            this.updateScore();
            
            setTimeout(() => {
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
        const winEl = document.getElementById('win-display');
        if (winEl) winEl.classList.add('active');
    }

    continueGame() {
        this.continued = true;
        const winEl = document.getElementById('win-display');
        if (winEl) winEl.classList.remove('active');
    }

    showGameOver() {
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
