# 程式碼與數位資產清冊

盤點日期：2026-06-22

## 維護規則

- 從本次調整開始，任何新增、刪除、搬移或用途變更，都必須同步更新本清冊。
- 可重複的圖片卡、人物／作品資料與純文字內容，優先放在 `data/*.json`；敘事段落與帶特殊排版的單次內容保留在 HTML。
- JSON 內的文字以純文字處理，不接受可執行 HTML；需要連結、粗體或特殊排版時，應擴充明確的資料欄位與渲染模板。
- JSON 必須以完整內容單位建模：超連結要與顯示文字／圖片放在同一物件，同一段或同一行文字不可因 DOM 結構任意拆成多個字串。

## 專案概況

- 類型：無建置流程的靜態活動網站
- 頁面：`index.html`（活動主站）、`work.html`（作品展示）
- 程式與內容檔：28 個、約 13,283 行、387 KB
- 全專案：150 個檔案、約 247.19 MiB（含本清冊）
- 套件管理／建置設定：無 `package.json`、無 bundler 設定
- 自動化測試：目前無測試程式；`test/imgs/` 為空目錄

## 程式碼資產

### HTML

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 首頁、活動資訊、規則、獎項、設定資料、FAQ、主辦資訊及各式互動視窗 |
| `work.html` | 作品篩選與搜尋展示頁，目前使用 16 個無檔案的版面 placeholder |

### JavaScript

| 檔案 | 用途 |
| --- | --- |
| `js/site.js` | 首頁進場、PV、導覽、倒數、FAQ／主辦／資料分頁、複製 Hashtag、彩蛋等主要互動 |
| `js/awards-content.js` | 從 JSON 套用評審、共同獎項與角色獎項資料 |
| `js/organizers-content.js` | 從 JSON 套用主協辦介紹、幕後名單、彩蛋與贊助資料 |
| `js/faq-content.js` | 從 JSON 載入並安全渲染 FAQ |
| `js/page-content.js` | 從 JSON 載入設定參考圖、班級合照與作品展示資料 |
| `js/related-data-content.js` | 將角色與家族 JSON 轉成頁籤、人物卡及圖庫 |
| `js/related-data.js` | 角色頁籤切換、浮動頁籤與瀑布流排版 |
| `js/classroom-map.js` | 從 JSON 建立教室座位圖與人物連結 |
| `js/image-viewer.js` | 圖片燈箱、縮放與拖曳 |
| `js/work-gallery.js` | 作品類別篩選、關鍵字搜尋、行動版導覽 |
| `js/tailwind-config.js` | Tailwind CDN 主題設定 |
| `js/analytics.js` | Google Analytics 初始化 |

### CSS

| 檔案 | 用途 |
| --- | --- |
| `css/site.css` | 全站基礎樣式、導覽與頁尾 |
| `css/event.css` | 首頁、活動內容與主要互動元件 |
| `css/awards.css` | 評審及獎項區塊 |
| `css/related-data.css` | 角色設定頁、人物卡、資料夾頁籤與圖庫 |
| `css/classroom-map.css` | 教室座位圖 |
| `css/work-gallery.css` | 作品展示頁 |
| `css/pages-responsive.css` | 跨頁 RWD 規則 |
| `css/spacing.css` | 區塊間距覆寫 |

### 可編輯內容資料

| 檔案 | 用途 |
| --- | --- |
| `data/related-data.json` | 6 名角色與沈家四胞胎設定；圖片、圖說、人物標籤與連結均使用具名物件配對 |
| `data/faq.json` | 15 組 FAQ 問答與頁面標題 |
| `data/page-content.json` | 首頁背景、進場圖層、PV、直播封面、合作 Logo、設定參考圖、班級合照及作品頁資料 |
| `data/awards.json` | 評審姓名、權重、圖片、社群連結，以及獎盃、獎金、名額與負責評審 |
| `data/classroom.json` | 教室文字、座位位置、人物圖片、角色頁／社群連結與圖例 |
| `data/organizers.json` | 主協辦圖片與介紹、社群連結、幕後人員、贊助名單，以及對話泡泡共用的 `memes` 圖片清單 |

FAQ、角色設定、設定參考圖、班級合照與作品展示使用具名結構 JSON 渲染。活動規則、獎項、主辦介紹、導覽與頁尾含有特殊排版或只出現一次，因此保留在 HTML，不為了追求「全 JSON」而破壞內容可讀性。倒數數字、複製結果、燈箱縮放比例等即時狀態文字則由 JavaScript 管理。

### 內容編輯入口

1. FAQ 問答：編輯 `data/faq.json`。
2. 角色人物、圖庫、沈家證件照與稱呼表：編輯 `data/related-data.json`。
3. 首頁主視覺、PV、直播、合作 Logo、參考圖與作品卡：編輯 `data/page-content.json`。
4. 評審、獎盃、獎金與角色獎：編輯 `data/awards.json`。
5. 教室座位人物、圖片與連結：編輯 `data/classroom.json`。
6. 主協辦、幕後人員、彩蛋與贊助：編輯 `data/organizers.json`。
7. 其餘帶特殊排版的單次敘事文字：編輯對應 HTML。
8. 修改任何內容或資產後，同步更新本清冊的檔案用途、數量或注意事項。

## 圖像、影音與設計素材

| 類型 | 數量 | 總大小 | 備註 |
| --- | ---: | ---: | --- |
| JPG | 56 | 約 61.84 MiB | 主視覺、角色、設定與漫畫圖片 |
| WebP | 43 | 約 10.67 MiB | Logo、人物、獎盃與展示圖片 |
| PNG | 6 | 約 3.94 MiB | 證件與設計素材 |
| WebM | 10 | 約 159.63 MiB | 人物及 Q 版循環動畫；為最大宗資產 |
| CLIP | 4 | 約 6.04 MiB | 學生證、證件照與教職證原始檔 |
| PDF | 2 | 約 12.52 MiB | 人物設定及活動規劃文件 |
| TTF | 1 | 約 4.68 MiB | `jf-openhuninn-2.1.ttf` |
| ICO | 1 | 約 4.19 KiB | 網站 favicon |

圖片主要按 `main`、`characters`、`judges`、`trophies`、`oraganizer`、`memes` 分類。`oraganizer` 資料夾名稱有拼字錯誤，但頁面引用一致，若要更名必須同步修改 HTML。

## 外部服務與依賴

- Tailwind CSS CDN（含 forms、container-queries plugins）
- Google Material Symbols 字型
- Google Analytics（ID：`G-SK2PXVFFGS`）
- YouTube 嵌入播放器與影片連結
- Google Forms 投稿表單、Google Docs／Sheets／Drive 設定資料
- X、Lit.Link、Twitch、LinkedIn、Portaly 等外部社群連結

## 健康檢查與注意事項

- HTML、CSS 與角色 JSON 中共檢查 116 筆本機檔案引用，正規化 query/hash 後未發現缺檔。
- `data/related-data.json` 與 `data/faq.json` 均為有效 JSON。
- `data/page-content.json` 提供首頁設定參考圖與作品頁內容；圖片路徑、標題、替代文字、說明和外部連結皆可直接編輯。
- 角色資料的 `meta`、`gallery`、`portraits`、`nameTable` 已改為具名物件；圖像路徑與圖說不再拆成無名稱的字串位置。
- HTML、CSS、JavaScript 引用的所有本機圖片／影片路徑均已在語意 JSON 中有對應設定；未納入 JSON 的唯一媒體路徑數為 0。
- JSON 套用獎項色系時只替換色系 class，保留 `scroll-stick-note` 與可見性 class，避免共同／角色獎便條紙失去進場動畫。
- Hashtag 貼紙改由未位移的外層容器觸發 IntersectionObserver，避免 1024–1199px 等重排解析度因貼紙初始位移而永遠不相交。
- 首頁進場會等待 `page-content.json` 套用並確認圖片載入後才播放，避免更換 JSON 圖片路徑時短暫缺圖。
- JSON 的首頁背景路徑會先依 `document.baseURI` 轉成完整 URL，再寫入 CSS 變數，避免被錯誤解析成 `css/imgs/...`。
- 主辦與校長的引言標題使用固定語意 class 維持黑色墨水色；教室圖例標題已限制在較小字級範圍。
- Tailwind 設定已調整為在 CDN 本體載入後執行，避免 `tailwind is not defined`。
- 專案大量依賴 WebM，初次下載與行動網路流量值得持續觀察。
- `.clip` 原始設計檔目前會跟網站一起部署；若不打算公開下載，可移出網站公開目錄。
- Tailwind 在瀏覽器執行 CDN 版本，正式環境的效能、版本穩定性與離線能力皆依賴外部服務。
- 目前沒有測試或建置檢查，改版後需以瀏覽器人工驗證。
