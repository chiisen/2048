# 🎮 2048 網頁版遊戲

經典 2048 遊戲的網頁版實現，支援鍵盤與觸控操作。

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

## 📄 授權

MIT License
