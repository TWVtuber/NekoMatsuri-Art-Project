# 專案資產清冊

更新日期：2026-08-14

## 專案概況

- 單頁式靜態網站，主入口為 `index.html`；作品展示整合在 `#works` 頁面狀態中。
- 無 `package.json`、bundler 或自動化測試；內容以 HTML、CSS、原生 JavaScript 與 JSON 組成。
- 專案共約 590 個檔案，排除 `.git` 後約 1.44 GiB。
- `work.html` 已於 2026-08-14 移除，作品頁由 `index.html`、`js/work-gallery.js` 與 `css/work-gallery.css` 負責。

## 可編輯資料檔

| 檔案 | 用途 |
| --- | --- |
| `data/page-content.json` | 首頁、活動說明與部分共用頁面內容 |
| `data/related-data.json` | 角色與相關設定資料 |
| `data/reward-policy.json` | 獎勵辦法 |
| `data/awards.json` | 評審與獎項資料 |
| `data/organizers.json` | 主辦、協力與工作人員資料 |
| `data/classroom.json` | 教室／角色地圖資料 |
| `data/faq.json` | 常見問題 |
| `data/work-gallery.json` | 作品頁的作品名稱、分類、媒體路徑、獎盃、評審圖、介面文字與特殊展示設定 |
| `data/work-reviews.json` | 58 組得獎作品的作者連結與評審講評 |

### 作品頁維護方式

- 新增或修改得獎作品：編輯 `data/work-gallery.json` 的 `groups`。
- 修改作品作者連結或講評：編輯 `data/work-reviews.json`。
- 修改圖片／影片來源：使用相對於網站根目錄的路徑；原始作品預設位於 `imgs/works/`，縮圖位於 `imgs/work-thumbs/`。
- `最佳手速獎` 以 `sequence.count`、`sequence.extension` 與 `sequence.featured` 產生序列，不必逐筆列出 101 個檔名。
- `judges` 內以 `$共同評選獎項` 表示沿用同一評審陣列。
- JSON 必須維持 UTF-8 與合法語法；修改後建議執行 JSON 解析檢查。

## 程式檔案

### HTML

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 全站結構、各頁面容器、Modal 與基礎可及性文字 |

### JavaScript

| 檔案 | 用途 |
| --- | --- |
| `js/site.js` | SPA 頁面切換、導覽、PV、倒數、分享與彩蛋 |
| `js/work-gallery.js` | 載入作品 JSON、建立得獎作品、輪播、目錄、篩選與縮圖 |
| `js/image-viewer.js` | 作品放大檢視、縮放、切換媒體與評審講評 |
| `js/page-content.js` | 載入一般頁面內容 |
| `js/reward-policy-content.js` | 載入獎勵辦法 |
| `js/awards-content.js` | 載入評審與獎項 |
| `js/organizers-content.js` | 載入主辦與協力資料 |
| `js/faq-content.js` | 載入 FAQ |
| `js/related-data-content.js` | 載入相關設定內容 |
| `js/related-data.js` | 相關設定互動 |
| `js/classroom-map.js` | 教室地圖互動 |
| `js/analytics.js` | Google Analytics |
| `js/tailwind-config.js` | Tailwind CDN 設定 |

### CSS

| 檔案 | 用途 |
| --- | --- |
| `css/site.css` | 全站基礎版面與元件 |
| `css/event.css` | 活動首頁內容 |
| `css/awards.css` | 評審與獎項 |
| `css/work-gallery.css` | 作品展示、輪播、Loading 與作品目錄 |
| `css/related-data.css` | 相關設定頁 |
| `css/classroom-map.css` | 教室地圖 |
| `css/pages-responsive.css` | 各頁 RWD |
| `css/spacing.css` | 共用間距 |

## 圖像與媒體資產

### `imgs/` 目錄

| 目錄 | 檔案數 | 約略大小 | 用途 |
| --- | ---: | ---: | --- |
| `characters/` | 179 | 434.5 MiB | 角色立繪、Q 版、動畫與來源檔 |
| `works/` | 178 | 745.5 MiB | 得獎作品原始圖片、影片與動畫 |
| `work-thumbs/` | 168 | 11.6 MiB | 作品卡片用 WebP 縮圖 |
| `trophies/` | 13 | 4.7 MiB | 獎盃圖 |
| `judges/` | 9 | 184.7 KiB | 評審頭像 |
| `main/` | 7 | 1.6 MiB | 主視覺與 Logo |
| `memes/` | 5 | 270.9 KiB | 工作人員彩蛋 |
| `organizer/` | 3 | 70.5 KiB | 主辦／協力圖像 |
| `比賽規則圖PSD/` | 12 | 253.0 MiB | 規則圖與大型 PSD 來源檔 |

### 副檔名統計

| 格式 | 數量 | 約略大小 |
| --- | ---: | ---: |
| WebP | 308 | 242.3 MiB |
| PNG | 201 | 513.4 MiB |
| JPG | 22 | 89.3 MiB |
| PSD | 16 | 263.2 MiB |
| WebM | 11 | 164.4 MiB |
| MP4 | 8 | 141.8 MiB |
| AI | 6 | 17.1 MiB |
| CLIP | 4 | 6.0 MiB |
| MOV | 1 | 13.5 MiB |
| GIF | 1 | 1.2 MiB |

此外，根目錄有 2 份 PDF、`font/` 內有 1 份 TTF，並有 `logo.ico`。

## 外部服務與網址

- Google Analytics
- YouTube 嵌入與外部觀看連結
- Google Forms、Docs、Sheets、Drive
- X（Twitter）、Lit.Link、Twitch、LinkedIn、Portaly
- Google Material Symbols 與 Tailwind CDN

作者個人連結集中於 `data/work-reviews.json`；作品頁評審圖片與本機資產路徑集中於 `data/work-gallery.json`。

## 專案 Review

### 已改善

- 作品清單、圖片／影片路徑、獎盃路徑、評審資料、特殊作品設定與主要作品頁介面文字已抽到 `data/work-gallery.json`。
- 評審講評與作者網址維持在獨立的 `data/work-reviews.json`，避免作品清單與長篇文字混在同一檔案。
- 作品序列支援規則化產生，降低 101 張作品重複維護的風險。
- 本清冊原有內容已出現編碼損壞且統計停留在 2026-06-22，現已用 UTF-8 重建並更新。

### 後續建議

1. `js/work-gallery.js` 仍保留一份內建 fallback 設定，供 JSON 載入失敗時顯示基本內容；長期可改成明確錯誤畫面，完全移除重複資料。
2. `index.html` 仍有作品頁容器與圖片檢視器的靜態介面文字；若未來需要多語系，建議再拆成共用 i18n JSON，而非只做作品資料設定。
3. `imgs/works/` 與來源檔占用空間很大，部署時應排除 PSD、AI、CLIP 等編輯來源檔，並考慮把大型影片轉成 WebM/MP4 串流友善版本。
4. `imgs/works/` 有 178 個原始媒體，但 `imgs/work-thumbs/` 為 168 個縮圖；影片與 GIF 會直接預覽，因此數量不必完全相等，但新增靜態圖片後應執行 `scripts/generate-work-thumbnails.py`。
5. 專案目前沒有自動測試與資料 schema。建議加入至少一個檢查腳本，驗證 JSON、作品路徑、作者 URL 與重複作品鍵。
6. `imgs/organizer/` 的英文目錄名稱目前正確；資料或舊文件若出現 `oraganizer`，應視為拼字錯誤。
