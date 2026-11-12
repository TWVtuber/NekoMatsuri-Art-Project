# 投稿作品資料

- 資料來源：投稿表「表單回覆 1」第 2–143 列，共 142 筆投稿。
- 原始 142 列保留在 `submissions-source.json`；展示索引經人工核對合併為 127 張作品卡。
- 重複作品以後面的投稿為主，採用其名稱、含意與媒體順序。`sourceRows` 保留所有原始列號，`titleAliases` 保留舊名稱供搜尋。
- 4 組重複投稿保留後投稿；1 組不同裁切合併但保留兩圖；李國強 11 筆分批投稿合併，保留全部 101 張。
- 合併規則在 `submission-deduplication.json`，由 `scripts/deduplicate-submissions.py` 套用；匯入腳本會自動套用，避免重新匯入後重複卡片復發。
- 已刪除不再引用的 6 個舊媒體檔及 2 個縮圖；得獎區共用檔案保留。
- 340 個原始附件皆已下載。RAR 中另外取出 7 個作品圖片／GIF／影片；模型、貼圖與使用教學不列入展示。
- 63 筆投稿包含現有得獎作品，79 筆未得獎。分類以投稿列為單位，同一列可包含多個作品檔案與獎項。
- 重用 179 個既有檔案對應；新增 167 個媒體檔案（含 RAR 內的 7 個作品媒體）。
- `imgs/works/12_未得獎/`：139 個新增媒體。
- `imgs/works/13_得獎補充/`：28 個得獎投稿的補充／差分媒體。
- 命名遵循 `分類_作品名稱_作者`，多附件加流水號，同名不同投稿以表單列號區分。
- `submissions.json` 為前端索引；`submissions-source.json` 僅保留表單的暱稱、作品名稱、含意、附件連結四欄，不含信箱與其他表單回答。
- 未填作品含意時，彈窗不顯示說明或佔位文字。含意使用純文字呈現，保留換行。
- 靜態圖片使用 WebP 縮圖；GIF／動態 WebP 保留動畫，影片沿用原始媒體。
- 獎項按鈕沿用得獎展示區的彈窗資料、評審與講評；現有專屬獎盃依獎項對應，加碼獎項使用通用無貓金色獎盃。

## 維護與驗證

`submission-media-exclusions.json` 記錄非畫作附圖的來源 ID；整理與重新匯入時會從展示媒體排除，目前包含兩張畫布資訊截圖、一張壓縮檔目錄截圖與一段繪圖軟體操作錄影；分類標籤同步校正。來源紀錄仍保留。

`node scripts/verify-submissions.cjs` 檢查 142 列來源追溯、後投稿內容優先、合併後附件存在性、全部 158 筆得獎索引的對應，以及搜尋／分類交集邏輯。

匯入腳本為 `scripts/import-submissions.py`。需要 Pillow、numpy、imageio-ffmpeg，以及 `.import-cache/metadata.json` 與以 Drive ID 命名的原始附件。原始下載與工具暫存在 `.import-cache/`，不納入版本控制。壓縮檔處理由 `scripts/extract-submission-archive.py` 執行，使用 rarfile 與現有 WinRAR，僅抽取已核對的媒體。

縮圖使用既有 `scripts/generate-work-thumbnails.py` 產生。重新整理作品後，應重新執行完整性檢查並檢查瀏覽器中的圖片、影片與彈窗。
