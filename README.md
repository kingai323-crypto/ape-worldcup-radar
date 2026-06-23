# APE世足預測雷達

這是一個可直接部署的靜態網站。主要更新檔是 `data.json`，每天只要改這個檔案，首頁主推、跑馬提醒、四場賽事、推薦組合與資金配置都會同步更新。

## 分享給朋友

最快方式：

1. 打開 Netlify Drop 或 Vercel。
2. 上傳整個 `worldcup-sharp-board` 資料夾。
3. 取得公開網址後傳給朋友。

推薦方式：

1. 建立 GitHub repository，例如 `ape-worldcup-radar`。
2. 上傳此資料夾內所有檔案。
3. 用 Vercel 或 Netlify 連接 GitHub repository。
4. 之後每天更新 `data.json` 並推送，網站會自動重新部署。

## 每日更新

每天主要修改 `data.json`：

- `updatedAt`：更新時間
- `edition`：首頁日期文字
- `hero`：首頁主推、副推、避開
- `alerts`：跑馬提醒
- `matches`：每場比賽資料
- `portfolio`：下注組合
- `bankroll`：資金配置

`matches` 裡每場重要欄位：

- `time`：開賽時間
- `home` / `away`：對戰隊伍
- `fairLine`：公允讓分
- `total`：公允大小
- `confidence`：信心等級
- `filters`：篩選分類，可用 `A`、`side`、`total`
- `side`：首選
- `totalPick`：備選
- `score`：比分參考
- `read`：操盤判讀
- `chips`：標籤

## 本機預覽

可以直接打開 `index.html`。若瀏覽器因安全限制不讀取 `data.json`，網站會使用內建備援資料；部署到 Vercel/Netlify 後會正常讀取 `data.json`。
