# 🎮 2048 網頁版遊戲

經典 2048 遊戲的網頁版實現，支援鍵盤與觸控操作。

DEMO: https://2048.liawchiisen.workers.dev/

## 📖 遊戲玩法

1. **目標**：合併數字方塊，最終得到 2048
2. **操作方式**：
   - **鍵盤**：使用方向鍵 ↑ ↓ ← → 移動方塊
   - **觸控**：在螢幕上滑動來移動方塊
3. **規則**：
   - 每次移動，所有方塊會朝同一方向移動
   - 相同數字的方塊碰撞時會合併成兩倍數值
   - 每次移動後隨機生成一個新方塊 (2 或 4)
   - 當無法移動時遊戲結束

## 🛠️ 技術栈

| 類別 | 技術 |
|------|------|
| 結構 | HTML5 |
| 樣式 | CSS3 (Flexbox, Grid, CSS Variables, Animations, Transitions) |
| 邏輯 | Vanilla JavaScript (ES6+) |
| 特效 | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| 字體 | [Fredoka](https://fonts.google.com/specimen/Fredoka) (Google Fonts) |

## ✨ 特色功能

- 流暢的移動動畫 (CSS Transition)
- 合併時的縮放彈跳效果
- 數字越大顏色越深 (視覺進度回饋)
- 合併成功時灑花慶祝效果
- 支援手機觸控滑動
- 響應式設計 (支援不同螢幕尺寸)
- 遊戲結束偵測與重新開始

## 🚀 使用方式

直接用瀏覽器打開 `index.html` 即可遊玩：

```bash
# 用預設瀏覽器開啟
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

或使用本地伺服器：

```bash
npx serve
# 然後訪問 http://localhost:3000
```

## 📁 專案結構

```
2048/
├── index.html    # 遊戲主檔案
└── README.md     # 說明文件
```

## 🎨 畫面預覽

- 經典木質色調 UI
- 數字方塊顏色漸變 (2→2048)
- 平滑動畫體驗

## 📋 待辦事項 (TODO)

### 🎬 畫面演出 DEBUG

- [x] 確認開發者工具 Console 無錯誤
- [x] 檢查瓦片移動動畫是否流暢 (transform transition)
- [x] 驗證新瓦片出現動畫 (appear keyframes)
- [x] 確認合併彈出動畫是否觸發 (pop keyframes)
- [x] 檢查遊戲結束/勝利畫面顯示正確
- [x] 測試彩紙效果 (confetti) 觸發時機
- [x] 驗證動畫時序問題 (setTimeout 200ms 是否足夠)

### 🐛 Bug 修復

- [x] 修復 tile-new 類別未移除問題
- [x] 修復 tile-merged 類別未添加問題
- [x] 檢查合併後 value 顯示正確性

### ⚡ 效能優化

- [ ] 使用 Chrome Performance 面板測量 FPS
- [ ] 檢查 DOM 元素是否有 memory leak
- [ ] 優化大量瓦片時的渲染效能

### ✨ 功能增強

- [ ] 添加行動態效果 (滑動方向指示)
- [ ] 添加音效 feedback
- [ ] 添加連續合併-combo 顯示
- [ ] 添加歷史紀錄/悔棋功能
- [ ] 添加 theme 切換 (深色/淺色模式)

### 🧪 測試項目

- [ ] 鍵盤操作測試 (上下左右)
- [ ] 觸控滑動測試
- [ ] 不同螢幕尺寸響應式測試
- [ ] 遊戲結束邏輯測試
- [ ] 勝利畫面顯示測試
- [ ] localStorage 儲存測試

---

## 📄 授權

MIT License
