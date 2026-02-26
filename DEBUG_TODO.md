# 2048 畫面演出邏輯 DEBUG 待辦清單

---

## 階段二：瓦片移動 DEBUG

- [x] 2.1 測試上/下/左/右鍵是否觸發 move() 函式
  - handleKey() 已正確映射 keyMap
- [x] 2.2 檢查 getTilePosition() 計算是否正確
  - x, y 座標對應 col, row 正確
- [x] 2.3 驗證 CSS transition 是否生效
  - style.css:103 已配置 `transition: transform 0.2s ease-in-out`
- [x] 2.4 檢查 transform 樣式是否正確更新
  - move() 中 newCell.element.style.transform 已正確設置

---

## 階段三：新瓦片出現 DEBUG

- [x] 3.1 確認 addRandomTile() 被正確呼叫
  - game.js:270 已正確呼叫
- [x] 3.2 檢查 createTile() 是否正確建立 DOM 元素
  - tile.dataset.id 已遞增
- [x] 3.3 確認 CSS 動畫 appear 是否套用
  - style.css:107-109 的 `.tile-new` 類別存在
  - game.js:157 正確添加 `tile-new` 類別
- [x] 3.4 確認 tile-new 動畫是否在正確時機移除
  - 已於 game.js:263-265 添加移除邏輯 (setTimeout 中移除)

---

## 階段四：合併動畫 DEBUG

- [x] 4.1 確認 processLine() 合併邏輯正確
  - mergedPositions 陣列正確收集合併的瓦片
- [x] 4.2 檢查 tile-merged 類別是否被添加
  - 已於 game.js:199 添加 tile-merged 類別
- [x] 4.3 確認 @keyframes pop 動畫是否存在
  - style.css:120-124 已存在
- [x] 4.4 測試合併後的 value 顯示是否正確
  - 程式碼邏輯正確

---

## 階段五：遊戲結束/勝利畫面 DEBUG

- [x] 5.1 測試 2048 到達時 showWin() 是否觸發
  - game.js:201 已正確觸發
- [x] 5.2 確認 win-display 元素存在於 HTML
  - index.html:40-44 已存在
- [x] 5.3 測試 isGameOver() 邏輯正確性
  - 空格為 0 且無法合併時回傳 true
- [x] 5.4 確認 showGameOver() 是否正確添加 active 類別
  - game.js:292 已正確添加

---

## 階段六：彩紙效果 (Confetti) DEBUG

- [x] 6.1 確認 confetti 函式來源
  - 外部 CDN (canvas-confetti) - index.html:74
- [x] 6.2 檢查 mergedPositions.length > 0 時是否觸發
  - game.js:266-273 已正確配置
- [x] 6.3 測試不同分數的彩紙顏色是否正確
  - 已配置固定顏色

---

## 階段七：效能與動畫流暢度

- [x] 7.1 檢查 move() 函式中的 setTimeout 200ms 是否足夠
  - 動畫與 addRandomTile() 時序已正確配置
- [ ] 7.2 使用 Chrome Performance 面板測量 FPS
- [x] 7.3 檢查是否有 memory leak (大量瓦片 DOM 未移除)
  - 已移除的瓦片會呼叫 .remove()

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
