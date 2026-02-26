# 2048 畫面演出邏輯 DEBUG 待辦清單

## 階段一：基礎環境確認

- [ ] 1.1 確認瀏覽器開發者工具可正常開啟 (F12)
- [ ] 1.2 確認 console 無報錯 (Error 為 0)
- [ ] 1.3 確認 index.html 正確引入 game.js 與 style.css

---

## 階段二：瓦片移動 DEBUG

- [ ] 2.1 測試上/下/左/右鍵是否觸發 move() 函式
  - 在 handleKey() 加上 console.log 確認 keyMap 映射正確
- [ ] 2.2 檢查 getTilePosition() 計算是否正確
  - 確認 x, y 座標對應 col, row
- [ ] 2.3 驗證 CSS transition 是否生效
  - 檢查 style.css:103 的 `transition: transform 0.2s ease-in-out`
- [ ] 2.4 檢查 transform 樣式是否正確更新
  - 在 move() 的 newCell.element.style.transform 處加入 console.log

---

## 階段三：新瓦片出現 DEBUG

- [ ] 3.1 確認 addRandomTile() 被正確呼叫
  - 在 game.js:270 加入 console.log
- [ ] 3.2 檢查 createTile() 是否正確建立 DOM 元素
  - 驗證 tile.dataset.id 是否遞增
- [ ] 3.3 確認 CSS 動畫 appear 是否套用
  - 檢查 style.css:107-109 的 `.tile-new` 類別
  - 檢查 game.js:157 是否正確添加 `tile-new` 類別
- [x] 3.4 確認 tile-new 動畫是否在正確時機移除
  - 已於 game.js:263-265 添加移除邏輯 (setTimeout 中移除)

---

## 階段四：合併動畫 DEBUG

- [ ] 4.1 確認 processLine() 合併邏輯正確
  - 檢查 mergedPositions 陣列是否正確收集合併的瓦片
- [x] 4.2 檢查 tile-merged 類別是否被添加
  - 已於 game.js:199 添加 tile-merged 類別
- [ ] 4.3 確認 @keyframes pop 動畫是否存在
  - 檢查 style.css:120-124
- [ ] 4.4 測試合併後的 value 顯示是否正確

---

## 階段五：遊戲結束/勝利畫面 DEBUG

- [ ] 5.1 測試 2048 到達時 showWin() 是否觸發
  - 在 game.js:201 加入 console.log
- [ ] 5.2 確認 win-display 元素存在於 HTML
- [ ] 5.3 測試 isGameOver() 邏輯正確性
  - 檢查空格為 0 且無法合併時回傳 true
- [ ] 5.4 確認 showGameOver() 是否正確添加 active 類別

---

## 階段六：彩紙效果 (Confetti) DEBUG

- [ ] 6.1 確認 confetti 函式來源
  - 檢查是否為外部 CDN (canvas-confetti)
- [ ] 6.2 檢查 mergedPositions.length > 0 時是否觸發
  - 在 game.js:262-268 加入 console.log
- [ ] 6.3 測試不同分數的彩紙顏色是否正確

---

## 階段七：效能與動畫流暢度

- [ ] 7.1 檢查 move() 函式中的 setTimeout 200ms 是否足夠
  - 動畫可能未完成就執行 addRandomTile()
- [ ] 7.2 使用 Chrome Performance 面板測量 FPS
- [ ] 7.3 檢查是否有 memory leak (大量瓦片 DOM 未移除)

---

## 已識別的 BUG 清單

1. **[已修復] tile-new 類別未移除** - 新瓦片動畫後應移除該類別
   - 已於 game.js:263-265 添加移除邏輯
2. **[已修復] tile-merged 類別未添加** - 合併時應添加彈出動畫類別
   - 已於 game.js:199 添加 `arr[i].element.classList.add('tile-merged')`
3. **合併動畫時機問題** - 需確認 CSS 動畫與 setTimeout 時序

---

## 除錯技巧

### 快速注入除錯代碼 (在瀏覽器 Console)

```javascript
// 測試瓦片移動
game.move('up');

// 查看 grid 狀態
console.table(game.grid);

// 查看分數
console.log('Score:', game.score);

// 手動觸發彩紙
confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
```

### CSS 除錯技巧

```css
/* 臨時加入以下樣式查看瓦片邊界 */
.tile {
    border: 1px solid red !important;
}
```
