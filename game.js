/**
 * 2048 遊戲核心類別
 * 負責處理遊戲邏輯、UI 更新、音效播放、AI 自動玩以及歷史紀錄（悔棋）
 */
class Game2048 {
    /**
     * 初始化遊戲實例
     */
    constructor() {
        // 遊戲設定
        this.size = 4; // 網格大小 4x4
        this.cellSize = 80; // 基礎單元格大小
        this.gap = 10; // 單元格間距
        
        // 遊戲狀態容器
        this.grid = []; // 儲存網格中所有數字方塊的二維陣列
        this.score = 0; // 當前分數
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0; // 最高紀錄
        this.theme = localStorage.getItem('theme') || 'light'; // 主題設定
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // 音效開關
        this.userInteracted = false; // 是否已與頁面互動（用於音效播放限制）
        
        // DOM 元素引用
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
        this.comboCount = 0; // 連擊次數
        this.history = []; // 悔棋歷史紀錄（儲存最近 10 次狀態）
        this.undoBtn = document.getElementById('undo-btn');
        this.aiBtn = document.getElementById('ai-btn');
        
        // AI 狀態
        this.aiPlaying = false;
        this.aiInterval = null;
        
        // 內部追蹤變數
        this.tileId = 0; // 遞增的方塊 ID，確保每個方塊有唯一識別碼
        this.won = false; // 是否已獲勝 (達到 2048)
        this.continued = false; // 獲勝後是否選擇繼續遊戲
        this.audioCtx = null; // Web Audio API 上下文
        
        // 初始化與事件綁定
        this.applyTheme();
        this.updateCellSize();
        this.init();
        this.bindEvents();
        
        // 監聽視窗縮放以動態調整單元格大小
        window.addEventListener('resize', () => this.updateCellSize());
    }

    /**
     * 根據當前主題設定應用樣式到 document
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeBtn.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }

    /**
     * 切換主題並存入本地儲存
     */
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    /**
     * 切換音效開關
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.userInteracted = true;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        document.getElementById('sound-btn').textContent = this.soundEnabled ? '🔊' : '🔇';
        
        // 開啟音效時自動播放背景節奏，關閉時停止
        if (this.soundEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    }

    /**
     * 啟用 Web Audio 上下文（需使用者觸發）
     */
    enableAudio() {
        if (!this.userInteracted) {
            this.userInteracted = true;
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            if (this.soundEnabled) {
                this.startBGM();
            }
        }
    }

    /**
     * 初始化 AudioContext（若尚未建立）
     */
    initAudio() {
        if (!this.audioCtx) {
            try {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('AudioContext not supported');
                return;
            }
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
    }

    /**
     * 開始播放簡單的背景電子節奏
     */
    startBGM() {
        if (!this.soundEnabled || !this.userInteracted || this.bgmPlaying) return;
        this.initAudio();
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;
        
        try {
            this.bgmPlaying = true;
            this.bgmIndex = 0;
            // 設定固定間隔播放音符，營造節奏感
            this.bgmInterval = setInterval(() => {
                if (!this.soundEnabled || !this.audioCtx || this.audioCtx.state !== 'running') return;
                // 遊戲結束時停止背景音
                if (this.gameOverDisplay.classList.contains('active')) return;
                this.playBGMRhythm();
            }, 150);
        } catch (e) {
            this.bgmPlaying = false;
        }
    }

    /**
     * 停止背景音節奏
     */
    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    /**
     * 播放背景音符邏輯（根據拍子變換音高）
     */
    playBGMRhythm() {
        if (!this.audioCtx || this.audioCtx.state !== 'running') return;
        
        const majorScale = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659]; // 大調音階頻率
        const bassLine = [65, 73, 82, 98]; // 低音線
        
        const beat = this.bgmIndex % 4;
        
        // 根據不同拍號播放隨機旋律
        if (beat === 0) {
            this.playNote(majorScale[Math.floor(Math.random() * 5) + 2], 0.04, 0.15);
            this.playNote(bassLine[Math.floor(this.bgmIndex / 4) % 4], 0.06, 0.2);
        } else if (beat === 1) {
            this.playNote(majorScale[Math.floor(Math.random() * 3) + 4], 0.03, 0.1);
        } else if (beat === 2) {
            this.playNote(majorScale[Math.floor(Math.random() * 5)], 0.03, 0.1);
        } else {
            this.playNote(majorScale[Math.floor(Math.random() * 4) + 3], 0.025, 0.08);
        }
        
        this.bgmIndex++;
    }

    /**
     * 產生單個正弦波音符
     * @param {number} freq 頻率 (Hz)
     * @param {number} volume 音量 (0-1)
     * @param {number} duration 持續時間 (秒)
     */
    playNote(freq, volume, duration) {
        if (!this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
            // 指數衰減，營造撥弦效果
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            osc.start(this.audioCtx.currentTime);
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {}
    }

    /**
     * 播放特定事件的音效
     * @param {string} type 事件類型 ('move', 'merge', 'gameover', 'win')
     */
    playSound(type) {
        if (!this.soundEnabled || !this.userInteracted) return;
        this.initAudio();
        if (!this.audioCtx || this.audioCtx.state !== 'running') return;
        
        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            if (type === 'move') {
                // 短促低音
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
                oscillator.start(this.audioCtx.currentTime);
                oscillator.stop(this.audioCtx.currentTime + 0.1);
            } else if (type === 'merge') {
                // 中音頻率
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
                oscillator.start(this.audioCtx.currentTime);
                oscillator.stop(this.audioCtx.currentTime + 0.15);
            } else if (type === 'gameover') {
                // 鋸齒波低沉音
                oscillator.frequency.value = 150;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
                oscillator.start(this.audioCtx.currentTime);
                oscillator.stop(this.audioCtx.currentTime + 0.5);
            } else if (type === 'win') {
                // 簡單升調小旋律
                oscillator.frequency.value = 523;
                gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                oscillator.frequency.setValueAtTime(659, this.audioCtx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, this.audioCtx.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);
                oscillator.start(this.audioCtx.currentTime);
                oscillator.stop(this.audioCtx.currentTime + 0.4);
            }
        } catch (e) {}
    }

    /**
     * 動態計算單元格大小，確保響應式呈現
     */
    updateCellSize() {
        const container = document.querySelector('.game-container');
        if (container) {
            // 扣除間距後平分長度
            const totalWidth = container.offsetWidth - 20;
            this.cellSize = (totalWidth - this.gap * 3) / 4;
        }
    }

    /**
     * 取得方塊在二維座標系中的 CSS translate 偏移量
     * @param {number} col 欄位 (0-3)
     * @param {number} row 行位 (0-3)
     */
    getTilePosition(col, row) {
        return {
            x: col * (this.cellSize + this.gap),
            y: row * (this.cellSize + this.gap)
        };
    }

    /**
     * 重置並初始化遊戲狀態
     */
    init() {
        this.stopAI();
        this.aiPlaying = false;
        this.aiBtn.textContent = '🤖';
        this.aiBtn.classList.remove('active');
        
        // 建立空的二維陣列
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(null));
        this.score = 0;
        this.won = false;
        this.continued = false;
        this.tileId = 0;
        this.history = [];
        
        // UI 更新
        this.updateScore();
        this.updateBestScore();
        this.clearTiles();
        this.updateUndoButton();
        this.gameOverDisplay.classList.remove('active');
        this.winDisplay?.classList?.remove('active');
        
        // 初始生成兩個方塊
        this.addRandomTile();
        this.addRandomTile();
        
        if (this.soundEnabled) {
            this.startBGM();
        }
    }

    /**
     * 綁定所有使用者互動事件 (鍵盤、觸控、點擊)
     */
    bindEvents() {
        // 鍵盤監聽
        document.addEventListener('keydown', (e) => this.handleKey(e));
        
        // 觸控/滑鼠滑動監聽
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
            
            // 滑動距離超過閾值才判定為移動
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                this.handleSwipe(dx, dy);
            }
            
            startX = undefined;
            startY = undefined;
            isTouching = false;
        };

        // 觸控事件 (行動版)
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleStart(e.touches[0].clientX, e.touches[0].clientY, true);
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }, { passive: true });

        // 滑鼠事件 (桌面版滑動)
        document.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleStart(e.clientX, e.clientY, false);
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            handleEnd(e.clientX, e.clientY);
        });

        // 按鈕點擊監聽
        this.restartBtn.addEventListener('click', () => this.init());
        this.continueBtn?.addEventListener('click', () => this.continueGame());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.undoBtn.addEventListener('click', () => this.undo());
        
        const soundBtn = document.getElementById('sound-btn');
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        soundBtn.addEventListener('click', () => this.toggleSound());
        
        this.aiBtn.addEventListener('click', () => this.toggleAI());
        
        // 解鎖音效 (首次互動)
        document.addEventListener('click', () => this.enableAudio(), { once: true });
        document.addEventListener('keydown', () => this.enableAudio(), { once: true });
    }

    /**
     * 切換 AI 自動玩狀態
     */
    toggleAI() {
        this.aiPlaying = !this.aiPlaying;
        this.aiBtn.textContent = this.aiPlaying ? '⏹️' : '🤖';
        this.aiBtn.classList.toggle('active', this.aiPlaying);
        
        if (this.aiPlaying) {
            this.runAI();
        } else {
            this.stopAI();
        }
    }

    /**
     * 停止 AI 運算定時器
     */
    stopAI() {
        if (this.aiInterval) {
            clearTimeout(this.aiInterval);
            this.aiInterval = null;
        }
    }

    /**
     * AI 決策邏輯：使用簡單的單步評估
     * 嘗試所有移動方向，選擇移動後預期分數最高的方向
     */
    runAI() {
        if (!this.aiPlaying) return;
        
        const directions = ['up', 'down', 'left', 'right'];
        let bestDir = null;
        let bestScore = -Infinity;
        
        // 評估四個方向
        for (const dir of directions) {
            const result = this.evaluateMove(dir);
            if (result.canMove && result.score > bestScore) {
                bestScore = result.score;
                bestDir = dir;
            }
        }
        
        // 若無法再移動，停止 AI 並顯示結束
        if (!bestDir) {
            this.aiPlaying = false;
            this.aiBtn.textContent = '🤖';
            this.aiBtn.classList.remove('active');
            this.showGameOver();
            return;
        }
        
        // 執行最佳移動方向
        this.move(bestDir);
        
        // 定時循環，維持每 250ms 一步
        if (this.aiPlaying) {
            this.aiInterval = setTimeout(() => this.runAI(), 250);
        }
    }

    /**
     * 內部模擬評估單次移動的價值
     * @param {string} direction 移動方向
     * @returns {Object} { canMove: 是否可移動, score: 移動後的預計得分 }
     */
    evaluateMove(direction) {
        const isVertical = direction === 'up' || direction === 'down';
        const isReverse = direction === 'down' || direction === 'right';
        
        let score = 0;
        let canMove = false;
        
        // 建立一個深拷貝的過渡網格進行模擬
        const testGrid = this.grid.map(row => row.map(cell => cell ? { value: cell.value } : null));
        
        for (let i = 0; i < this.size; i++) {
            let line;
            if (isVertical) {
                line = [];
                for (let j = 0; j < this.size; j++) {
                    line.push(testGrid[j][i]);
                }
            } else {
                line = [...testGrid[i]];
            }

            if (isReverse) line.reverse();

            // 模擬合併邏輯
            let arr = line.filter(cell => cell !== null);
            
            for (let j = 0; j < arr.length - 1; j++) {
                if (arr[j].value === arr[j + 1].value) {
                    arr[j].value *= 2;
                    score += arr[j].value;
                    arr.splice(j + 1, 1);
                }
            }
            
            // 補齊空位
            while (arr.length < this.size) {
                arr.push(null);
            }
            
            if (isReverse) arr.reverse();
            
            // 檢查移動後狀態是否與原本不同
            for (let j = 0; j < this.size; j++) {
                const orig = isVertical ? this.grid[j][i] : this.grid[i][j];
                const newVal = arr[j];
                
                if ((orig === null && newVal !== null) || (orig !== null && newVal === null) || 
                    (orig !== null && newVal !== null && orig.value !== newVal.value)) {
                    canMove = true;
                }
            }
        }
        
        // AI 評分機制：除了基礎得分外，空位越多分數越高
        const emptyCells = this.grid.flat().filter(c => c === null).length;
        score += emptyCells * 10;
        
        return { canMove, score };
    }

    /**
     * 處理鍵盤按鍵輸入
     */
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
            // 快捷鍵：Ctrl+Z 悔棋
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                this.undo();
            }
        }
    }

    /**
     * 處理滑動邏輯，判定上下左右方向
     */
    handleSwipe(dx, dy) {
        const threshold = 30; // 判定閾值 (px)
        const directionArrows = { 'up': '↑', 'down': '↓', 'left': '←', 'right': '→' };
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑動
            if (Math.abs(dx) > threshold) {
                const direction = dx > 0 ? 'right' : 'left';
                this.showSwipeIndicator(directionArrows[direction]);
                this.move(direction);
            }
        } else {
            // 垂直滑動
            if (Math.abs(dy) > threshold) {
                const direction = dy > 0 ? 'down' : 'up';
                this.showSwipeIndicator(directionArrows[direction]);
                this.move(direction);
            }
        }
    }

    /**
     * 在螢幕中央顯示滑動方向提示
     * @param {string} arrow 箭頭符號
     */
    showSwipeIndicator(arrow) {
        if (!this.swipeIndicator) return;
        this.swipeIndicator.textContent = arrow;
        this.swipeIndicator.classList.add('show');
        setTimeout(() => {
            this.swipeIndicator.classList.remove('show');
        }, 200);
    }

    /**
     * 顯示連擊 (Combo) 提示
     * @param {number} count 連擊數
     */
    showCombo(count) {
        if (!this.comboDisplay) return;
        this.comboDisplay.textContent = `${count} COMBO!`;
        this.comboDisplay.classList.add('show');
        setTimeout(() => {
            this.comboDisplay.classList.remove('show');
        }, 500);
    }

    /**
     * 儲存當前狀態以便之後悔棋回溯
     */
    saveHistory() {
        const state = {
            grid: this.grid.map(row => row.map(cell => cell ? { value: cell.value, id: cell.id } : null)),
            score: this.score
        };
        this.history.push(state);
        // 為了效能與內存，僅保留最近 10 次紀錄
        if (this.history.length > 10) this.history.shift();
        this.updateUndoButton();
    }

    /**
     * 悔棋邏輯：從 history stack 彈出上一個狀態並恢復
     */
    undo() {
        if (this.history.length === 0) return;
        
        const state = this.history.pop();
        this.score = state.score;
        this.updateScore();
        
        // 清除目前的 DOM
        this.clearTiles();
        
        // 重建網格與方塊元素
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

    /**
     * 更新悔棋按鈕的可點擊狀態
     */
    updateUndoButton() {
        if (this.undoBtn) {
            this.undoBtn.disabled = this.history.length === 0;
        }
    }

    /**
     * 在隨機空位生成一個新方塊
     * @returns {boolean} 是否成功生成 (網格若滿則回傳 false)
     */
    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return false;

        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4; // 90% 機率為 2, 10% 為 4
        this.createTile(r, c, value, true);
        return true;
    }

    /**
     * 建立方塊 DOM 元素並加到容器中
     * @param {number} row 
     * @param {number} col 
     * @param {number} value 方塊值
     * @param {boolean} isNew 是否套用 "新方塊出現" 動畫
     */
    createTile(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        const tileClass = value > 2048 ? 'super' : value;
        tile.className = `tile tile-${tileClass}${isNew ? ' tile-new' : ''}`;
        tile.textContent = value;
        tile.dataset.id = this.tileId++; // 給予唯一 ID 方便在 undo 時識別
        
        const pos = this.getTilePosition(col, row);
        tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        tile.style.width = `${this.cellSize}px`;
        tile.style.height = `${this.cellSize}px`;
        
        this.tileContainer.appendChild(tile);
        
        // 將參照存在 grid 陣列中
        this.grid[row][col] = { element: tile, value, id: parseInt(tile.dataset.id) };
        
        return tile;
    }

    /**
     * 執行一次移動 (核心演算法)
     * @param {string} direction 'up', 'down', 'left', 'right'
     */
    move(direction) {
        const isVertical = direction === 'up' || direction === 'down';
        const isReverse = direction === 'down' || direction === 'right';

        let moved = false;
        const mergedPositions = [];

        /**
         * 處理單行(或單欄)的合併邏輯
         */
        const processLine = (line) => {
            // 過濾掉空值，將方塊擠向一側
            let arr = line.filter(cell => cell !== null);
            
            for (let i = 0; i < arr.length - 1; i++) {
                // 如果相鄰且數值相同則合併
                if (arr[i].value === arr[i + 1].value) {
                    arr[i].value *= 2;
                    this.score += arr[i].value;
                    
                    // 從 DOM 移除被合併進來的方塊
                    arr[i + 1].element.remove();
                    arr.splice(i + 1, 1);
                    
                    mergedPositions.push(arr[i]);
                    arr[i].element.classList.add('tile-merged');
                    this.playSound('merge');
                    
                    // 檢查是否獲勝
                    if (arr[i].value === 2048 && !this.won && !this.continued) {
                        this.showWin();
                    }
                }
            }
            
            // 補齊剩餘的空位
            while (arr.length < this.size) {
                arr.push(null);
            }
            
            return arr;
        };

        // 遍歷所有行/欄執行處理
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

            // 移動方向如果是反向(右/下)，處理前需反轉陣列
            if (isReverse) line.reverse();

            const processed = processLine(line);

            // 處理完後恢復陣列方向
            if (isReverse) processed.reverse();

            // 更新網格狀態與呈現
            for (let j = 0; j < this.size; j++) {
                const oldCell = isVertical ? this.grid[j][i] : this.grid[i][j];
                const newCell = processed[j];
                
                if (oldCell !== newCell) {
                    moved = true; // 標記是否有任何移動發生
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
                    // 套用位移動畫
                    newCell.element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                    
                    // 更新數字對應的 CSS 樣式
                    const tileClass = newCell.value > 2048 ? 'super' : newCell.value;
                    newCell.element.className = `tile tile-${tileClass}`;
                }
            }
        }

        // 如果遊戲狀態有改變
        if (moved) {
            this.saveHistory();
            
            // 處理連擊判定
            if (mergedPositions.length > 1) {
                this.comboCount += mergedPositions.length;
                this.showCombo(this.comboCount);
            } else if (mergedPositions.length <= 1) {
                // 如果該次移動只是一次普通合併或沒合併，連擊清零
                if (mergedPositions.length === 0) this.comboCount = 0;
            }
            
            this.playSound('move');
            this.updateScore();
            
            // 延遲執行：等待位移動畫結束後再加入新方塊
            setTimeout(() => {
                // 清理標記標籤
                document.querySelectorAll('.tile-new').forEach(tile => {
                    tile.classList.remove('tile-new');
                });
                
                // 合併特效 (彩帶)
                if (mergedPositions.length > 0) {
                    confetti({
                        particleCount: 30,
                        spread: 50,
                        origin: { y: 0.6 },
                        colors: ['#f2b179', '#edcc61', '#edc22e']
                    });
                }
                
                // 加入新方塊
                this.addRandomTile();
                
                // 檢查是否不再能移動
                if (this.isGameOver()) {
                    this.showGameOver();
                }
            }, 200);
        }
    }

    /**
     * 獲勝機制：啟動獲勝覆蓋層
     */
    showWin() {
        this.won = true;
        this.stopBGM();
        this.stopAI();
        this.playSound('win');
        const winEl = document.getElementById('win-display');
        if (winEl) winEl.classList.add('active');
    }

    /**
     * 獲勝後選擇繼續遊戲
     */
    continueGame() {
        this.continued = true;
        const winEl = document.getElementById('win-display');
        if (winEl) winEl.classList.remove('active');
    }

    /**
     * 遊戲結束機制
     */
    showGameOver() {
        this.stopBGM();
        this.stopAI();
        this.playSound('gameover');
        this.gameOverDisplay.classList.add('active');
    }

    /**
     * 更新目前的得分 UI 並同步最高分紀錄
     */
    updateScore() {
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            this.updateBestScore();
        }
    }

    /**
     * 更新最高紀錄 UI
     */
    updateBestScore() {
        if (this.bestScoreDisplay) {
            this.bestScoreDisplay.textContent = this.bestScore;
        }
    }

    /**
     * 清理所有方塊實體，用於重啟或悔棋
     */
    clearTiles() {
        this.tileContainer.innerHTML = '';
    }

    /**
     * 判定是否遊戲結束 (判定有無空格或可合併項)
     * @returns {boolean}
     */
    isGameOver() {
        // 首先檢查是否有空格
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) return false;
            }
        }

        // 其次檢查水平或垂直相鄰是否有相同數字
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

// 建立實例並啟動遊戲
const game = new Game2048();

