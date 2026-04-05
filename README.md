# 英語魔法學院 (English Magic Academy)

這是一個以 React + Vite + TailwindCSS 打造的兒童英語學習網頁遊戲。透過 Google Apps Script 作為後端與資料庫，可以輕鬆客製化課文、文法與單字，體驗豐富的學習與即時測驗。

## 如何本地開發？
1. `npm install` 安裝套件
2. 複製 `.env.example` 並更名為 `.env`，設定其內容：
   - `VITE_API_URL`: (非必填) 指向已部署好的 GAS，不填則讀取 `mockData.js`。
3. `npm run dev` 啟動開發伺服器。

## 🚀 如何自動部署到 GitHub Pages？

此專案已設定好 GitHub Actions (`.github/workflows/deploy.yml`)，當你推送到 `main` 分支時會自動編譯並發布。設定細節與步驟如下：

### 第一步：上傳程式碼到 GitHub
你可以選擇用「終端機打指令」或是用「VSCode 按鈕」兩種方式，**挑一種你習慣的做就好**，兩者的結果完全一樣：

**方法 A：使用 VSCode 按鈕 (視覺化操作)**
1. 點擊 VSCode 左側欄第三個圖示「Source Control (原始檔控制)」。
2. 點擊 **Initialize Repository** (起始這個儲存庫)。
3. 在上方輸入框隨便打一些字 (例如 "init")，然後點擊 **Commit**。
4. 接著點擊 **Publish Branch**，在上方選擇 `Publish to GitHub public repository`，它就會自動幫你在 GitHub 建好網站並上傳了！

**方法 B：使用終端機指令 (CMD 操作)**
如果你喜歡打指令，可以在下方終端機依序輸入：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的帳號/你的Repository名稱.git
git push -u origin main
```

### 第二步：設定 GitHub Secrets (專案私密變數)
因為 `.env` 設定被我們放入了 `.gitignore` 不會上傳，我們要在 Github 儲存庫內給予它編譯時需要的環境變數：

1. 到你 GitHub Repository 的 **Settings** (設定) 頁籤。
2. 尋找左側邊欄 **Secrets and variables** > 選擇 **Actions**。
3. 在 **Repository secrets** 選項，點擊 **New repository secret**，將 `.env.example` 提到的這三個欄位「分別」逐一加進去：
   - **Name**: `VITE_API_URL` -> **Secret**: `https://script.google.com/macros/....`
   - **Name**: `VITE_PASS_THRESHOLD` -> **Secret**: `80` (或你想要的自訂分數)
   - **Name**: `VITE_QUESTION_COUNT` -> **Secret**: `10` (或你想要的自訂題數)

### 第三步：開放 GitHub Pages 權限
1. 在 Github 的 **Settings** 左側選單找 **Pages**。
2. 確認 **Build and deployment** 下的 **Source** 是選取 `GitHub Actions`。
3. 完成上述設定後，你可以再次 Commit 任何內容來觸發流程，或是前往 **Actions** 面板，點擊 `Deploy to GitHub Pages` manually 觸發 **Run workflow**。 

部署燈號轉為綠色 ✅ 即大功告成！你也可以在 Actions 的執行結果紀錄中看到最後的發布網址。
