const workNavToggle = document.querySelector(".nav-toggle");
const workSiteNav = document.getElementById("site-navigation");
const currentYear = document.getElementById("current-year");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

if (document.body.classList.contains("work-page") && workNavToggle && workSiteNav) {
  workNavToggle.addEventListener("click", () => {
    const isOpen = workNavToggle.getAttribute("aria-expanded") === "true";
    workNavToggle.setAttribute("aria-expanded", String(!isOpen));
    workSiteNav.classList.toggle("is-open", !isOpen);
  });

  workSiteNav.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;

    workNavToggle.setAttribute("aria-expanded", "false");
    workSiteNav.classList.remove("is-open");
  });
}

function initializeWorkGallery() {
  const workGallery = document.querySelector("[data-work-grid]");
  if (!workGallery || workGallery.dataset.galleryReady !== undefined) return;
  const filterButtons = [
    ...document.querySelectorAll("[data-work-filter]"),
  ];
  const searchInput = document.querySelector("[data-work-search]");
  const emptyMessage = document.querySelector("[data-work-empty]");
  const workItems = [...workGallery.querySelectorAll("[data-work-category]")];
  if (!filterButtons.length || !workItems.length) return;
  workGallery.dataset.galleryReady = "";
  let activeFilter = "all";

  function normalizeText(value) {
    return value.trim().toLowerCase();
  }

  function updateGallery() {
    const query = normalizeText(searchInput?.value || "");
    let visibleCount = 0;

    workItems.forEach((item) => {
      const category = item.dataset.workCategory || "";
      const keywords = normalizeText(item.dataset.workKeywords || "");
      const matchesFilter = activeFilter === "all" || category === activeFilter;
      const matchesSearch = !query || keywords.includes(query);
      const isVisible = matchesFilter && matchesSearch;

      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.workFilter || "all";

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      updateGallery();
    });
  });

  searchInput?.addEventListener("input", updateGallery);
  updateGallery();
}

const winningWorkGroups = [
  { title: "共同評選獎項", directory: "1_金銀銅", files: ["金賞_繪肝史_凜奈.mp4", "銀賞_貓祭老師與校長的日常_喵喔.jpg", "銅賞_讓我們盡情可愛_麻糬.mov"] },
  { title: "互動賞", directory: "2_互動賞", files: ["互動賞A_沈家【Chu！對不起我這麼可愛！】_叭哺.mp4", "互動賞B_貓祭班導&3年C班日常_亞狸YaRi.mp4"], folders: [
    { name: "互動賞C_玫紅色青春、金色回憶、水藍色怪談_松果柏伯", files: [1, 2, 3, 4].map((number) => `玫紅色青春、金色回憶、水藍色怪談${number}.jpg`) },
  ] },
  { title: "可愛賞", directory: "3_可愛賞", files: ["可愛賞A_這些人怎麼閃亮亮的_貓貓.png", "可愛賞B_一杯沈月_閉門造居.jpg", "可愛賞C_貓祭老師與校長的日常_喵喔.jpg"] },
  { title: "搞怪賞", directory: "4_搞怪賞", files: ["搞怪賞A_當選日_鶴目瑞羽.jpg", "搞怪賞B_可能是遊戲劇情吧_飛凡.mp4", "搞怪賞C_衝刺_nozzz.png"] },
  { title: "貓祭賞", directory: "5_貓祭賞", files: ["貓祭佳作A_請給我 30+紅色貓毛10箱，謝謝_瘋狂的香蕉.png", "貓祭佳作B_來自學生會長候選人沈曦的威壓（身高）_湮月.png", "貓祭佳作C_老師 我想發大財_DZ.png", "貓祭優賞_貓家&沈家日常_李國強(沐沐).png", "貓祭金賞_幻夏予霓_郭喵.png"] },
  { title: "祭煜賞", directory: "6_祭煜賞", files: ["祭煜佳作A_夕暉間的依靠_伊麗莎白.png", "祭煜佳作B_貓家&沈家日常_李國強(沐沐).png", "祭煜佳作C_祭煜的木馬游戲🐎_閉門居造.mp4", "祭煜優賞_貓祭班導&3年C班日常_亞狸YaRi.jpg", "祭煜金賞_祭煜濕身圖_Aizuo.jpg"] },
  { title: "沈曦賞", directory: "7_沈曦賞", files: ["沈曦佳作A_沈家的團寵_泠Rin.png", "沈曦佳作B_游泳課_飛凡.jpg", "沈曦佳作C_3年C班學園祭_阿卡.jpg", "沈曦優賞_三頭龍_松果柏柏.png", "沈曦金賞_完美的學生會長_Aizuo.png"] },
  { title: "沈澈賞", directory: "8_沈澈賞", files: ["沈澈佳作A_性轉！夢中的藍髮少女_湮月.png", "沈澈佳作B_手足_羽毛筆.png", "沈澈佳作C_沈家四胞胎之游泳時間_叭哺.png", "沈澈優賞_if沈澈是乙女遊戲角色_虎芽.jpg", "沈澈金賞_貓家&沈家日常_李國強(沐沐).png"] },
  { title: "沈樂賞", directory: "9_沈樂賞", files: ["沈樂佳作A_貓家&沈家日常_李國強(沐沐).png", "沈樂佳作B_Bet On Me_安希.mp4", "沈樂佳作C_沈樂咬尾巴_伊宇.png", "沈樂優賞_沈樂大直男！_伊宇.png", "沈樂金賞_繪俄史最速傳說-前傳_拉米OxO.jpg"] },
  { title: "沈月賞", directory: "10_沈月賞", files: ["沈月佳作A_沈月水中美照_Aizuo.jpg", "沈月佳作B_池中浮月_亞菲.jpg", "沈月佳作C_沈月with專武_郭喵.png", "沈月優賞_夢_nozzz.png", "沈月金賞_掌上明珠_沐玄.png"] },
  { title: "追加獎項", directory: "11_加碼", files: ["團體賞_三年C班大合照 !!!_瘋狂的香蕉.png", "星星賞_陽光沈樂比耶照_Aizuo.jpg", "最佳死線獎_【2小時32分】沈月水中美照_Aizuo.jpg", "破百賞_夏日沈月好涼涼_御雙夜.png"], folders: [
    {
      name: "最佳手速獎_貓家&沈家日常_李國強(沐沐)",
      files: Array.from({ length: 101 }, (_, index) => `${index + 1}.png`),
      sequenceFiles: [
        "10.png",
        "11.png",
        "54.png",
        "93.png",
        ...Array.from({ length: 101 }, (_, index) => `${index + 1}.png`)
          .filter((file) => !["10.png", "11.png", "54.png", "93.png"].includes(file)),
      ],
    },
    { name: "迷你像素獎_畫得完嗎？畫得完喔！_沐玄", files: ["插圖121.png", "2.png", "3.png", "4.png", "5.png", "6.png"] },
    { name: "貓祭不會讓你俄史賞", entries: [
      { name: "貓祭不會讓你俄史賞1_關於學院的回憶_十少", files: ["貓祭不會讓你俄史賞1_關於學院的回憶_十少.png"] },
      { name: "貓祭不會讓你俄史賞2_老師和學姊！借我拍個照！_安娜伊恩", files: ["貓祭不會讓你俄史賞2_老師和學姊！借我拍個照！_安娜伊恩.png"] },
      { name: "貓祭不會讓你俄史賞3_獨自一人的天台_阿欣", files: ["貓祭不會讓你俄史賞3_無標題157_20260719141851.png", "貓祭不會讓你俄史賞3_無標題158_20260719230942.png"], typeLabel: "插圖" },
      { name: "貓祭不會讓你俄史賞4_家政課的簡易小吃_拉米OxO", files: ["貓祭不會讓你俄史賞4_家政課的簡易小吃_拉米OxO.mp4"] },
      { name: "貓祭不會讓你俄史賞5_上課請不要睡覺_波比pixelart", files: ["貓祭不會讓你俄史賞5_上課請不要睡覺_波比pixelart.gif"] },
      { name: "貓祭不會讓你俄史賞6_可愛四兄妹_灼翼", files: ["貓祭不會讓你俄史賞6_可愛四兄妹_灼翼.png"] },
      { name: "貓祭不會讓你俄史賞7_Alter ego -- 沈家三兄弟跳水版o(°▽°)o_阿太", files: ["貓祭不會讓你俄史賞7_Alter ego -- 沈家三兄弟跳水版o(°▽°)o_阿太.mp4"] },
      { name: "貓祭不會讓你俄史賞8_全員像素中_手滑", files: ["沈曦.png", "沈月.png", "沈樂.png", "沈澈.png", "祭煜.png", "貓祭.png", "阿強.png", "阿貝.png", "阿醜.png", "阿雄.png"], pixelArt: true, typeLabel: "像素插畫" },
      { name: "貓祭不會讓你俄史賞9_沈月戲水_海鮮", files: ["貓祭不會讓你俄史賞9_沈月戲水_海鮮.png"] },
      { name: "貓祭不會讓你俄史賞10_繪俄史調查團✨️_艾迪", files: ["貓祭不會讓你俄史賞10_沈家 調查團.jpg", "貓祭不會讓你俄史賞10_調查團 (1).jpg", "貓祭不會讓你俄史賞10_調查團團長.jpg"], typeLabel: "插圖" },
    ] },
  ] },
];

const compactAdditionalAwards = new Set(["團體賞", "星星賞", "最佳死線獎", "破百賞"]);
const podiumAwards = {
  "銀賞": { position: "silver", place: "銀賞", order: 0, trophy: "imgs/trophies/繪俄史銀獎.webp" },
  "金賞": { position: "gold", place: "金賞", order: 1, trophy: "imgs/trophies/繪俄史金獎.webp" },
  "銅賞": { position: "bronze", place: "銅賞", order: 2, trophy: "imgs/trophies/繪俄史銅獎.webp" },
};
const awardSectionTrophies = {
  "互動賞": "imgs/trophies/互動獎.webp",
  "可愛賞": "imgs/trophies/卡哇獎.webp",
  "搞怪賞": "imgs/trophies/搞怪獎.webp",
  "貓祭賞": "imgs/trophies/貓祭獎.webp",
  "祭煜賞": "imgs/trophies/祭煜獎.webp",
  "沈曦賞": "imgs/trophies/沈曦獎.webp",
  "沈澈賞": "imgs/trophies/沈澈獎.webp",
  "沈樂賞": "imgs/trophies/沈樂獎.webp",
  "沈月賞": "imgs/trophies/沈月獎.webp",
};

const commonAwardJudges = [
  { name: "貓祭", image: "imgs/judges/NekoMatsuri.webp" },
  { name: "Aoi Hinamori", image: "imgs/judges/AoiHinamori.webp" },
  { name: "繪俄史藝術高等學院校長", image: "imgs/judges/President.webp" },
];
let workReviewData = {};

const awardJudges = {
  "共同評選獎項": commonAwardJudges,
  "互動賞": commonAwardJudges,
  "可愛賞": commonAwardJudges,
  "搞怪賞": commonAwardJudges,
  "貓祭賞": [{ name: "貓祭", image: "imgs/judges/NekoMatsuri.webp" }],
  "沈曦賞": [{ name: "貓祭", image: "imgs/judges/NekoMatsuri.webp" }],
  "祭煜賞": [{ name: "貓祭與阿雄", image: "imgs/judges/大雄&NekoMatsuri.webp" }],
  "沈月賞": [{ name: "沈月", image: "imgs/judges/Tsuki.webp" }],
  "沈澈賞": [{ name: "沈澈", image: "imgs/judges/David.webp" }],
  "沈樂賞": [{ name: "沈樂", image: "imgs/judges/Ivan.webp" }],
  "迷你像素獎": [{ name: "繪俄史藝術高等學院校長", image: "imgs/judges/President.webp" }],
  "最佳手速獎": [{ name: "貓祭", image: "imgs/judges/NekoMatsuri.webp" }],
  "最佳死線獎": [{ name: "貓祭", image: "imgs/judges/NekoMatsuri.webp" }],
  "團體賞": [{ name: "貓祭", image: "imgs/judges/NekoMatsuri.webp" }],
  "星星賞": [{ name: "筱星朔光", image: "imgs/judges/star.jpg" }],
  "貓祭不會讓你俄史賞": [{ name: "貓祭", image: "imgs/judges/NekoMatsuri.webp" }],
};

function getWorkJudges(groupTitle, awardTitle) {
  return awardJudges[awardTitle] || awardJudges[groupTitle] || [];
}

function parseWorkName(name) {
  const cleanName = name.replace(/\.[^.]+$/, "");
  const parts = cleanName.split("_");
  const rawAward = parts.shift() || "得獎作品";
  const award = rawAward
    .replace(/(佳作|賞)[A-Z]$/u, "$1")
    .replace(/賞\d+$/u, "賞");
  return { award, rawAward, artist: parts.pop() || "", title: parts.join("_") || cleanName };
}

function getAwardRank(name) {
  const { rawAward } = parseWorkName(name);
  if (rawAward.includes("金賞")) return 0;
  if (rawAward.includes("銀賞")) return 1;
  if (rawAward.includes("銅賞")) return 2;
  if (rawAward.includes("優賞")) return 1;
  if (rawAward.includes("佳作")) return 2;
  return 3;
}

function isVideo(path) { return /\.(?:mp4|mov|webm)$/i.test(path); }

function getWorkType(work) {
  if (work.typeLabel) return work.typeLabel;
  if (work.name === "搞怪賞C_衝刺_nozzz.png") return "漫畫";
  if (work.media.length > 1) return "漫畫";
  const [source = ""] = work.media;
  if (/\.gif(?:[?#].*)?$/i.test(source)) return "動畫GIF";
  if (isVideo(source)) return "有聲動畫";
  return "插圖";
}

function getWorkTypeClass(workType) {
  return {
    "插圖": "illustration",
    "有聲動畫": "video",
    "動畫GIF": "gif",
    "漫畫": "comic",
    "像素插畫": "pixel",
  }[workType] || "default";
}

function fitWorkTitle(title) {
  title.style.removeProperty("font-size");
  let fontSize = Number.parseFloat(getComputedStyle(title).fontSize) || 18;
  const card = title.closest(".winning-work");
  const minimumFontSize = card?.classList.contains("winning-work--podium") ? 8 : 10;

  while (title.scrollWidth > title.clientWidth + 1 && fontSize > minimumFontSize) {
    fontSize -= 0.5;
    title.style.fontSize = `${fontSize}px`;
  }

  const secondaryMinimum = card?.classList.contains("winning-work--podium") ? 6 : 8;
  card?.style.setProperty("--work-meta-font-size", `${Math.max(secondaryMinimum, fontSize - 3)}px`);
  card?.style.setProperty("--work-tag-font-size", `${Math.max(secondaryMinimum, fontSize - 4)}px`);
  title.title = title.textContent;
}

function fitAllWorkTitles() {
  document.querySelectorAll(".winning-work__title").forEach(fitWorkTitle);
}

function prepareVideoPreview(video) {
  const ratios = [0.08, 0.2, 0.4, 0.62, 0.78];
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 27;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let candidates = [];
  let candidateIndex = 0;
  let bestFrame = { brightness: -1, time: 0 };
  let finished = false;
  let scanningByPlayback = false;

  const measureBrightness = () => {
    if (!context || !video.videoWidth || !video.videoHeight) return 0;
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;
      let samples = 0;
      for (let index = 0; index < pixels.length; index += 16) {
        total += pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
        samples += 1;
      }
      return samples ? total / samples : 0;
    } catch {
      return 255;
    }
  };

  const finish = (time = video.currentTime) => {
    finished = true;
    video.pause();
    if (Math.abs(video.currentTime - time) > 0.01) video.currentTime = time;
    if (bestFrame.brightness >= 0) {
      video.dataset.previewBrightness = bestFrame.brightness.toFixed(1);
    }
    video.dataset.previewReady = "";
  };

  const scanByPlayback = () => {
    if (scanningByPlayback || finished) return;
    scanningByPlayback = true;
    const stopAt = Math.min(8, Math.max(2, video.duration * 0.2));
    let lastMeasuredAt = -1;

    const inspectFrame = () => {
      if (finished || video.currentTime - lastMeasuredAt < 0.12) return;
      lastMeasuredAt = video.currentTime;
      const brightness = measureBrightness();
      if (brightness > bestFrame.brightness) bestFrame = { brightness, time: video.currentTime };
      if (brightness >= 24) {
        video.removeEventListener("timeupdate", inspectFrame);
        finish();
      } else if (video.currentTime >= stopAt) {
        finished = true;
        video.pause();
        video.dataset.previewFailed = "";
      }
    };

    video.addEventListener("timeupdate", inspectFrame);
    video.play().catch(() => {
      video.removeEventListener("timeupdate", inspectFrame);
      finished = true;
      video.dataset.previewFailed = "";
    });
  };

  video.addEventListener("loadedmetadata", () => {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (duration <= 0) {
      finish();
      return;
    }
    candidates = ratios.map((ratio) => Math.min(duration - 0.05, Math.max(0.05, duration * ratio)));
    video.currentTime = candidates[0];
  }, { once: true });

  video.addEventListener("seeked", () => {
    if (finished || !candidates.length) return;
    const brightness = measureBrightness();
    if (brightness > bestFrame.brightness) bestFrame = { brightness, time: video.currentTime };
    if (brightness >= 24) {
      finish(bestFrame.time);
      return;
    }
    if (candidateIndex >= candidates.length - 1) {
      if (video.currentTime < 0.05) scanByPlayback();
      else finish(bestFrame.time);
      return;
    }
    candidateIndex += 1;
    video.currentTime = candidates[candidateIndex];
  });

  video.addEventListener("error", () => {
    video.dataset.previewFailed = "";
  }, { once: true });
}

function createWinningWork(work) {
  const details = parseWorkName(work.name);
  const reviewEntry = workReviewData[details.rawAward] || workReviewData[details.award] || null;
  const workType = getWorkType(work);
  const article = document.createElement("article");
  article.className = "winning-work";
  if (work.pixelArt) article.classList.add("winning-work--pixel-art");
  if (work.podiumPosition) {
    article.classList.add("winning-work--podium", `winning-work--podium-${work.podiumPosition}`);
    article.dataset.podiumPlace = work.podiumPlace;
  }
  const mediaFrame = document.createElement("div");
  mediaFrame.className = "winning-work__media";
  const openButton = document.createElement("button");
  openButton.className = "winning-work__open";
  openButton.type = "button";
  openButton.dataset.imageViewerGallery = encodeURIComponent(JSON.stringify(work.viewerGallery || work.media));
  openButton.dataset.imageViewerTitle = work.viewerTitle || work.displayTitle || details.title;
  openButton.dataset.imageViewerDescription = work.viewerDescription || `獎項：${details.award}｜類型：${workType}｜作者：${details.artist}`;
  let judges = getWorkJudges(work.groupTitle, details.award).map((judge) => ({
    ...judge,
    comment: reviewEntry?.reviews.find((review) => review.judge === judge.name)?.comment || "",
  }));
  if (!judges.length && reviewEntry?.reviews.length) {
    judges = reviewEntry.reviews.map((review) => ({
      name: review.judge,
      image: review.judge === "貓祭" ? "imgs/judges/NekoMatsuri.webp" : "",
      comment: review.comment,
    }));
  }
  if (judges.length) openButton.dataset.imageViewerJudges = encodeURIComponent(JSON.stringify(judges));
  if (reviewEntry?.artistUrl) {
    openButton.dataset.imageViewerArtistName = details.artist;
    openButton.dataset.imageViewerArtistUrl = reviewEntry.artistUrl;
    openButton.dataset.imageViewerArtistLabel = "作者";
  }
  if (work.pixelArt || details.award === "迷你像素獎") {
    openButton.dataset.imageViewerInitialScale = "0.25";
    openButton.dataset.imageViewerPixelArt = "";
  }
  openButton.setAttribute("aria-label", `放大檢視${work.displayTitle || details.title}`);
  let currentIndex = 0;

  const showMedia = () => {
    const path = work.media[currentIndex];
    const media = isVideo(path) ? document.createElement("video") : document.createElement("img");
    if (media instanceof HTMLVideoElement) {
      media.muted = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.setAttribute("controlslist", "nodownload");
      prepareVideoPreview(media);
      media.src = path;
    }
    else { media.src = path; media.alt = `${work.displayTitle || details.title}，作者 ${details.artist}`; media.loading = "lazy"; media.decoding = "async"; }
    mediaFrame.querySelector("img, video")?.remove();
    mediaFrame.prepend(media);
    const count = mediaFrame.querySelector(".winning-work__count");
    if (count) count.textContent = `${currentIndex + 1} / ${work.media.length}`;
    openButton.dataset.imageViewerIndex = String(work.viewerIndex ?? currentIndex);
  };

  if (work.media.length > 1) {
    const pager = document.createElement("div");
    pager.className = "winning-work__pager";
    const previous = document.createElement("button");
    previous.type = "button"; previous.setAttribute("aria-label", "上一張"); previous.textContent = "‹";
    const count = document.createElement("span"); count.className = "winning-work__count";
    const next = document.createElement("button");
    next.type = "button"; next.setAttribute("aria-label", "下一張"); next.textContent = "›";
    previous.addEventListener("click", () => { currentIndex = (currentIndex - 1 + work.media.length) % work.media.length; showMedia(); });
    next.addEventListener("click", () => { currentIndex = (currentIndex + 1) % work.media.length; showMedia(); });
    pager.append(previous, count, next);
    mediaFrame.append(pager);
  }
  showMedia();
  mediaFrame.append(openButton);

  const caption = document.createElement("div");
  caption.className = "winning-work__caption";
  const metadata = document.createElement("div"); metadata.className = "winning-work__metadata";
  const award = document.createElement("strong"); award.className = "winning-work__award"; award.textContent = details.award;
  const detail = document.createElement("strong"); detail.className = "winning-work__detail"; detail.textContent = work.detailLabel || "";
  const type = document.createElement("span"); type.className = `winning-work__type winning-work__type--${getWorkTypeClass(workType)}`; type.textContent = workType;
  const title = document.createElement("h3"); title.className = "winning-work__title"; title.textContent = work.displayTitle || details.title;
  const artist = document.createElement("p"); artist.className = "winning-work__artist"; artist.append("作者｜");
  if (reviewEntry?.artistUrl) {
    const artistLink = document.createElement("a");
    artistLink.href = reviewEntry.artistUrl;
    artistLink.target = "_blank";
    artistLink.rel = "noopener noreferrer";
    artistLink.textContent = details.artist;
    artist.append(artistLink);
  } else {
    artist.append(details.artist);
  }
  if (!work.hideAward) metadata.append(award);
  if (work.detailLabel) metadata.append(detail);
  metadata.append(type);
  caption.append(metadata);
  if (!work.typeOnly) caption.append(title);
  if (!work.hideArtist && !work.typeOnly) caption.append(artist);
  if (work.trophy) {
    const trophy = document.createElement("img");
    trophy.className = "winning-work__trophy";
    trophy.src = work.trophy;
    trophy.alt = `${details.award}獎盃`;
    trophy.loading = "lazy";
    trophy.draggable = false;
    article.append(trophy);
  }
  article.append(mediaFrame);
  if (!work.hideCaption) article.append(caption);
  return article;
}

function getGroupWorks(group) {
  const base = `imgs/works/${group.directory}`;
  const works = group.files.map((file) => ({ name: file, media: [`${base}/${file}`] }));
  (group.folders || []).forEach((folder) => {
    if (folder.sequenceFiles) {
      folder.sequenceFiles.forEach((file) => {
        works.push({
          name: folder.name,
          media: [`${base}/${folder.name}/${file}`],
          displayTitle: `${parseWorkName(folder.name).title}・${file.replace(/\.[^.]+$/, "")}`,
        });
      });
      return;
    }
    if (folder.entries) {
      folder.entries.forEach((entry) => {
        const entryBase = `${base}/${folder.name}/${entry.name}`;
        const directBase = `${base}/${folder.name}`;
        const media = entry.files.map((file) => entry.files.length === 1 && file.replace(/\.[^.]+$/, "") === entry.name ? `${directBase}/${file}` : `${entryBase}/${file}`);
        works.push({ ...entry, name: entry.name, media });
      });
    } else {
      works.push({ name: folder.name, media: folder.files.map((file) => `${base}/${folder.name}/${file}`) });
    }
  });
  return works
    .map((work, index) => ({ ...work, groupTitle: group.title, originalIndex: index }))
    .sort((a, b) => getAwardRank(a.name) - getAwardRank(b.name) || a.originalIndex - b.originalIndex);
}

function initializeAwardSequence(section, track) {
  const previous = section.querySelector("[data-award-sequence-previous]");
  const next = section.querySelector("[data-award-sequence-next]");

  const updateButtons = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const hasOverflow = maxScroll > 2;
    section.querySelector(".winning-works__carousel")?.classList.toggle("is-static", !hasOverflow);
    previous.hidden = !hasOverflow;
    next.hidden = !hasOverflow;
    previous.disabled = !hasOverflow;
    next.disabled = !hasOverflow;
  };

  const move = (direction) => {
    const firstCard = track.querySelector(".winning-work");
    if (!firstCard) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    let target = track.scrollLeft + direction * step;

    if (direction > 0 && track.scrollLeft >= maxScroll - 2) target = 0;
    if (direction < 0 && track.scrollLeft <= 2) target = maxScroll;

    track.scrollTo({ left: target, behavior: "smooth" });
  };

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  track.addEventListener("scroll", updateButtons, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  });
  if ("ResizeObserver" in window) {
    new ResizeObserver(updateButtons).observe(track);
  }
  requestAnimationFrame(updateButtons);
}

function getWinningWorkSections() {
  return winningWorkGroups.flatMap((group) => {
    const works = getGroupWorks(group);
    if (group.title === "共同評選獎項") {
      return [{
        title: group.title,
        hideHeading: true,
        podium: true,
        works: works
          .map((work) => {
            const podium = podiumAwards[parseWorkName(work.name).award];
            return {
              ...work,
              hideAward: true,
              podiumPosition: podium.position,
              podiumPlace: podium.place,
              podiumOrder: podium.order,
              trophy: podium.trophy,
            };
          })
          .sort((a, b) => a.podiumOrder - b.podiumOrder),
      }];
    }
    if (group.title !== "追加獎項") {
      return [{ title: group.title, works, trophy: awardSectionTrophies[group.title] || "" }];
    }

    const additionalSections = new Map();
    works.forEach((work) => {
      const awardTitle = parseWorkName(work.name).award;
      if (!additionalSections.has(awardTitle)) additionalSections.set(awardTitle, []);
      additionalSections.get(awardTitle).push(work);
    });

    return [...additionalSections].map(([title, awardWorks]) => {
      if (title === "最佳手速獎") {
        const viewerGallery = awardWorks.map((work) => work.media[0]);
        return {
          title,
          subtitle: "《貓家&沈家日常》｜作者：",
          subtitleArtist: { name: "李國強(沐沐)", url: workReviewData[title]?.artistUrl || "" },
          countNote: "共 101 張",
          additional: true,
          works: awardWorks.map((work, index) => ({
            ...work,
            hideAward: true,
            typeOnly: true,
            viewerGallery,
            viewerIndex: index,
            viewerTitle: "貓家&沈家日常",
          })),
        };
      }
      if (title !== "迷你像素獎") {
        const compact = compactAdditionalAwards.has(title);
        const displayedWorks = compact
          ? awardWorks.map((work) => {
              const display = { ...work, hideAward: true };
              if (title === "最佳死線獎") {
                const details = parseWorkName(work.name);
                const time = details.title.match(/^(【[^】]+】)\s*/u);
                if (time) {
                  display.detailLabel = time[1];
                  display.displayTitle = details.title.replace(time[0], "");
                }
              }
              return display;
            })
          : awardWorks;
        return { title, works: displayedWorks, compact, additional: true };
      }

      const [pixelWork] = awardWorks;
      const characterNames = ["沈月", "沈樂", "沈澈", "沈曦", "貓祭", "祭煜"];
      return {
        title,
        subtitle: "《畫得完嗎？畫得完喔！》｜作者：",
        subtitleArtist: { name: "沐玄", url: workReviewData[title]?.artistUrl || "" },
        additional: true,
        showAll: true,
        works: pixelWork.media.map((media, index) => ({
          name: `迷你像素獎_${characterNames[index]}_沐玄`,
          media: [media],
          displayTitle: characterNames[index],
          hideAward: true,
          hideArtist: true,
          pixelArt: true,
          typeLabel: "像素插畫",
          viewerDescription: `作品：畫得完嗎？畫得完喔！｜角色：${characterNames[index]}｜類型：像素插畫｜作者：沐玄`,
        })),
      };
    });
  });
}

function initializeWinningWorks() {
  const container = document.querySelector("[data-winning-works]");
  if (!container || container.childElementCount) return;
  let compactRow = null;
  let additionalHeadingRendered = false;
  getWinningWorkSections().forEach((group) => {
    if (group.additional && !additionalHeadingRendered) {
      const groupTitle = document.createElement("div");
      groupTitle.className = "section-title winning-works__additional-title";
      const heading = document.createElement("h3");
      heading.textContent = "加碼獎項";
      groupTitle.append(document.createElement("span"), heading, document.createElement("span"));
      container.append(groupTitle);
      additionalHeadingRendered = true;
    }
    const section = document.createElement("section"); section.className = "winning-works__section paper-card";
    section.dataset.awardTitle = group.podium ? "金賞、銀賞、銅賞" : group.title;
    if (group.additional) section.dataset.awardGroup = "additional";
    if (group.showAll) section.classList.add("winning-works__section--show-all");
    if (group.compact) section.classList.add("winning-works__section--compact");
    if (group.podium) section.classList.add("winning-works__section--podium");
    if (group.title === "最佳手速獎") section.classList.add("winning-works__section--speed");
    const heading = document.createElement("h2"); heading.className = "winning-works__heading"; heading.textContent = group.title;
    if (group.trophy) {
      const trophy = document.createElement("img");
      trophy.className = "winning-works__heading-trophy";
      trophy.src = group.trophy;
      trophy.alt = `${group.title}獎盃`;
      trophy.loading = "lazy";
      trophy.draggable = false;
      heading.append(trophy);
    }
    const subtitle = document.createElement("p"); subtitle.className = "winning-works__subtitle"; subtitle.textContent = group.subtitle || "";
    if (group.subtitleArtist) {
      if (group.subtitleArtist.url) {
        const artistLink = document.createElement("a");
        artistLink.href = group.subtitleArtist.url;
        artistLink.target = "_blank";
        artistLink.rel = "noopener noreferrer";
        artistLink.textContent = group.subtitleArtist.name;
        subtitle.append(artistLink);
      } else {
        subtitle.append(group.subtitleArtist.name);
      }
    }
    const countNote = document.createElement("p"); countNote.className = "winning-works__count-note"; countNote.textContent = group.countNote || "";
    const carousel = document.createElement("div"); carousel.className = "winning-works__carousel";
    const previous = document.createElement("button");
    previous.className = "winning-works__nav winning-works__nav--previous";
    previous.type = "button"; previous.dataset.awardSequencePrevious = "";
    previous.setAttribute("aria-label", `${group.title}上一件作品`); previous.textContent = "‹";
    const grid = document.createElement("div"); grid.className = "winning-works__grid";
    if (group.showAll) grid.classList.add("winning-works__grid--show-all");
    if (group.podium) grid.classList.add("winning-works__grid--podium");
    if (!group.podium) grid.tabIndex = 0;
    grid.setAttribute("aria-label", `${group.title}得獎作品序列`);
    const next = document.createElement("button");
    next.className = "winning-works__nav winning-works__nav--next";
    next.type = "button"; next.dataset.awardSequenceNext = "";
    next.setAttribute("aria-label", `${group.title}下一件作品`); next.textContent = "›";
    group.works.forEach((work) => grid.append(createWinningWork(work)));
    carousel.append(previous, grid, next);
    if (!group.hideHeading) section.append(heading);
    if (group.subtitle) section.append(subtitle);
    if (group.countNote) section.append(countNote);
    section.append(carousel);
    if (group.compact) {
      if (!compactRow) {
        compactRow = document.createElement("div");
        compactRow.className = "winning-works__compact-row";
        container.append(compactRow);
      }
      compactRow.append(section);
    } else {
      compactRow = null;
      container.append(section);
    }
    if (group.showAll || group.podium) {
      carousel.classList.add("is-static");
      previous.hidden = true;
      next.hidden = true;
    } else {
      initializeAwardSequence(section, grid);
    }
  });
  initializeWorkToc(container);
  requestAnimationFrame(fitAllWorkTitles);
}

function initializeWorkToc(container) {
  const workRoot = container.closest(".work-view, .work-page__content");
  if (!workRoot || workRoot.querySelector("[data-work-toc]")) return;

  const sections = [...container.querySelectorAll("[data-award-title]")];
  if (!sections.length) return;

  const toc = document.createElement("aside");
  toc.className = "work-toc";
  toc.dataset.workToc = "";

  const panel = document.createElement("nav");
  panel.className = "work-toc__panel";
  panel.id = "work-award-directory";
  panel.setAttribute("aria-label", "獎項目錄");
  panel.hidden = true;

  const heading = document.createElement("strong");
  heading.className = "work-toc__heading";
  heading.textContent = "獎項目錄";
  panel.append(heading);

  let additionalDividerRendered = false;
  sections.forEach((section, index) => {
    const title = section.dataset.awardTitle;
    const targetId = `work-award-${index + 1}`;
    section.id = targetId;

    if (section.dataset.awardGroup === "additional" && !additionalDividerRendered) {
      const divider = document.createElement("span");
      divider.className = "work-toc__divider";
      divider.textContent = "加碼獎項";
      panel.append(divider);
      additionalDividerRendered = true;
    }

    const link = document.createElement("a");
    link.href = `#${targetId}`;
    link.textContent = title;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    });
    panel.append(link);
  });

  const toggle = document.createElement("button");
  toggle.className = "work-toc__toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-controls", panel.id);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "開啟獎項目錄");
  toggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">format_list_bulleted</span><span>獎項目錄</span>';

  function setOpen(open) {
    toc.classList.toggle("is-open", open);
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "關閉獎項目錄" : "開啟獎項目錄");
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.addEventListener("click", (event) => {
    if (!panel.hidden && !toc.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  toc.append(panel, toggle);
  workRoot.append(toc);
}

function initializeWorkViews() {
  const tabs = [...document.querySelectorAll("[data-work-view]")];
  const panels = [...document.querySelectorAll("[data-work-panel]")];
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    if (tab.disabled) return;
    const view = tab.dataset.workView;
    tabs.forEach((item) => { const active = item === tab; item.classList.toggle("is-active", active); item.setAttribute("aria-selected", String(active)); });
    panels.forEach((panel) => { panel.hidden = panel.dataset.workPanel !== view; });
  }));
}

initializeWorkViews();
initializeWorkGallery();
document.addEventListener("page-content:ready", initializeWorkGallery);
document.fonts?.ready.then(fitAllWorkTitles);
window.addEventListener("resize", fitAllWorkTitles);

fetch("data/work-reviews.json", { cache: "no-cache" })
  .then((response) => {
    if (!response.ok) throw new Error(`Unable to load work reviews (${response.status}).`);
    return response.json();
  })
  .then((data) => { workReviewData = data; })
  .catch((error) => console.error(error))
  .finally(initializeWinningWorks);
