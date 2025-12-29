# 曼谷奢華旅程 (Bangkok Luxury Tour)

歡迎來到曼谷奢華旅程專案！這是一個基於 React 和 Vite 構建的現代化旅遊應用程式。

## 🚀 專案功能

- **極致奢華的視覺體驗**：使用 Framer Motion 打造流暢動畫。
- **響應式設計**：支援各種裝置瀏覽。
- **高效能**：基於 Vite 的快速開發與構建。

## 🛠️ 技術棧

- **Core**: React, TypeScript, Vite
- **Styling**: CSS / Tailwind (if applicable), Framer Motion
- **Deployment**: GitHub Actions (GitHub Pages)

## 📦 安裝與啟動

### 前置需求
- Node.js (建議 v18 或以上)

### 1. 安裝套件
在專案根目錄執行：
```bash
npm install
```

### 2. 本地開發
啟動開發伺服器：
```bash
npm run dev
```
應用程式將在 `http://localhost:3000` 運行（已預設為可供行動裝置連線的 `0.0.0.0`）。

### 3. 建置專案
構建生產版本：
```bash
npm run build
```
產出的檔案將位於 `dist` 資料夾。

### 4. 預覽生產版本
以與正式部署一致的方式啟動預覽伺服器：
```bash
npm run start
```
預覽伺服器會在 `http://localhost:4173` 以 `0.0.0.0` 域啟動，方便手機或同網域裝置直接連線進行實機瀏覽。

## ☁️ 部署

本專案已設定 GitHub Actions 自動部署。
每當推送到 `main` 分支時，會自動構建並部署至 GitHub Pages。

### 設定步驟 (GitHub Repo Setting)
1. 進入 GitHub Repository 的 **Settings** > **Pages**。
2. 在 **Build and deployment** > **Source** 選擇 **GitHub Actions**。
3. 推送程式碼後，Action 將自動執行。

## 📝 專案結構

```
.
├── .github/workflows/  # GitHub Actions 設定
├── src/               # 原始碼
├── components/        # UI 元件
├── views/             # 頁面視圖
└── ...
```

---
Built with ❤️ using React & Vite.
