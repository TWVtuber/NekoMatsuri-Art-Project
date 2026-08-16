# 專案與素材清冊

最後更新：2026-08-16

## 專案概況

- 單頁靜態網站，入口為 `index.html`；無 `package.json`、bundler 或框架建置步驟。
- 內容由 HTML 骨架、CSS、原生 JavaScript 與 `data/*.json` 組成。
- 網站素材共 580 個檔案、約 1,452.6 MiB；另有 `font/` 1 個字型（4.7 MiB）及 `test/` 22 個來源檔（280.4 MiB）。
- 根目錄另有 `logo.ico` 與 2 份 PDF 文件。

## 可編輯內容資料

| JSON | 用途 |
| --- | --- |
| `data/page-content.json` | 網站 metadata、導覽、學院介紹、Hashtag、首頁文案、倒數文字、活動主題與規則、頁尾文字，以及首頁共用圖片／連結 |
| `data/reward-policy.json` | 獎勵辦法與加碼獎項 |
| `data/awards.json` | 評審、獎項、獎金與獎盃 |
| `data/organizers.json` | 主辦／協辦介紹、幕後人員、贊助與彩蛋 |
| `data/faq.json` | 常見問題 |
| `data/related-data.json` | 角色設定與相關資料 |
| `data/classroom.json` | 教室座位與人物資料 |
| `data/work-gallery.json` | 得獎作品分組、檔名、顯示設定、評審與 UI 文案 |
| `data/work-reviews.json` | 作品評語 |

`index.html` 現在只保留版面骨架、必要的漸進式 fallback／無障礙操作文字與少量元件標籤；主要活動文案不再以 HTML 作為第二份資料來源。JS 中保留的文字為載入錯誤、按鈕狀態、動態 aria-label 與作品類型判斷，屬介面行為而不是內容資料。

## 程式檔案

| 類型 | 檔案 | 說明 |
| --- | --- | --- |
| HTML | `index.html` | 全站結構與各頁面容器 |
| 內容載入 | `js/page-content.js` | 載入 `page-content.json` 並建立共用內容 |
| 內容載入 | `js/*-content.js` | FAQ、獎項、獎勵、主辦、角色資料內容渲染 |
| 互動 | `js/site.js` | 入口、導覽、倒數、modal、彩蛋與頁面切換 |
| 作品 | `js/work-gallery.js` | 作品資料載入、分類、得獎展示與評審資料 |
| 檢視器 | `js/image-viewer.js` | 圖片／影片放大、縮放、作品序列與講評 |
| 樣式 | `css/*.css` | 全站、各內容頁、RWD 與間距樣式 |
| 工具 | `scripts/generate-work-thumbnails.py` | 產生作品縮圖 |

## 素材分布

| 目錄 | 檔案數 | 約略大小 | 用途 |
| --- | ---: | ---: | --- |
| `imgs/characters/` | 179 | 434.5 MiB | 角色、設定圖、動畫與來源素材 |
| `imgs/works/` | 178 | 745.5 MiB | 得獎作品原檔；由 JSON 的 base path + 目錄／檔名動態組合 |
| `imgs/work-thumbs/` | 169 | 約 11.6 MiB | 作品縮圖；由原作品路徑動態推導 |
| `imgs/trophies/` | 13 | 4.7 MiB | 獎盃圖 |
| `imgs/judges/` | 9 | 約 0.2 MiB | 評審頭像與贊助插圖 |
| `imgs/main/` | 7 | 1.6 MiB | 首頁背景、Logo 與效果 |
| `imgs/memes/` | 5 | 約 0.3 MiB | 幕後人員彩蛋 |
| `imgs/organizer/` | 3 | 約 0.1 MiB | 主辦、協辦與廠商 Logo |
| `imgs/比賽規則圖PSD/` | 12 | 253.0 MiB | 設計來源 PSD，不供網站執行使用 |

## 未被網站使用的素材

判定方式：掃描 HTML、JS、CSS、JSON 的直接引用；`imgs/works/` 與 `imgs/work-thumbs/` 會由 `work-gallery.json` 動態組合路徑，因此視為使用中，不以完整路徑字串誤判。以下合計 133 個檔案、約 752.8 MiB。這些檔案未刪除。

| 分組 | 數量 | 約略大小 | 說明 |
| --- | ---: | ---: | --- |
| `test/imgs/` | 22 | 280.4 MiB | AI／PSD 設計來源備份，全部未在網站引用 |
| `imgs/比賽規則圖PSD/` | 12 | 253.0 MiB | PSD 設計來源，全部未在網站引用 |
| `imgs/characters/` 中的個別檔案 | 95 / 179 | 217.7 MiB | 此目錄整體有使用；只有下方列出的 95 個來源檔／替代版本未被目前網站引用 |
| `imgs/main/main2.webp`, `imgs/main/main3.webp` | 2 | 0.9 MiB | 目前程式與 JSON 沒有引用；網站背景使用 `imgs/main/main.webp` |
| `imgs/NekoMatsuriA4.webp` | 1 | 0.7 MiB | 目前程式與 JSON 沒有引用 |
| `imgs/trophies/繪俄史金獎(無貓版).webp` | 1 | 0.2 MiB | 目前程式與 JSON 沒有引用；金賞使用 `imgs/trophies/繪俄史金獎.webp` |

### `imgs/characters/` 中未使用的個別檔案分組

`imgs/characters/` 並非未使用目錄：角色頁目前直接使用其中的證件照、角色 Logo WebP、`*-alpha.webp` 動畫、Q 版圖與大量 3C 圖文。下表只列同一目錄內沒有被引用的其他格式或替代版本。

| 路徑／分組 | 數量 | 約略大小 |
| --- | ---: | ---: |
| `imgs/characters/Amins/*.webm` | 6 | 135.7 MiB |
| `imgs/characters/Logo/`（六位角色的 AI 與各式 PNG 版本） | 60 | 31.2 MiB |
| `imgs/characters/Q/Anims/*.webm` | 4 | 24.0 MiB |
| `imgs/characters/Objects/證件/`（PSD／CLIP／範例） | 9 | 16.4 MiB |
| `imgs/characters/3C-Pics/沈家相關/` | 7 | 7.8 MiB |
| `imgs/characters/3C-Pics/貓祭/` | 2 | 0.7 MiB |
| `imgs/characters/證件/`（阿強、阿貝、阿醜、阿雄學生證） | 4 | 1.9 MiB |
| `imgs/characters/Objects/素材/校長.webp`、`校徽.webp` | 2 | 0.2 MiB |
| `imgs/characters/3C-Pics/3C相關圖文/木由/【木由】蘑菇人.webp` | 1 | 0.02 MiB |

其中 `Amins/*.webm` 與 `Q/Anims/*.webm` 有同用途的 WebP 動畫版本被網站使用；未使用的 WebM 很可能是轉檔前來源。Logo、PSD、CLIP、AI 也多屬可編輯來源檔，雖不參與網站執行，仍可能值得移至獨立的 source archive，而不是直接刪除。

## Review 結果與注意事項

- 主要內容已集中至 9 份 JSON；之後修改文案應先找相應 JSON，不需改 HTML。
- `work-gallery.json` 是作品與評審展示的權威來源；作品原檔與縮圖路徑由程式動態產生。
- 網頁採 `fetch()` 讀 JSON，不能直接以 `file://` 開啟；需透過本機 HTTP server 或正式網站測試。
- JSON 目前沒有 schema 驗證；錯字、缺欄位或路徑錯誤會在瀏覽器執行時才出現。
- 大型 PSD、AI、CLIP、原始作品與重複動畫版本讓 repo 超過 1 GiB；若要部署或協作，建議把設計來源與網站發布檔分離，或使用 Git LFS／物件儲存。
- `imgs/organizer/` 的目錄命名正確；資料與程式均已使用此拼法。
