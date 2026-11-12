let allSubmissions = [];
let submissionByMedia = new Map();
let submissionsError = false;

async function loadAllSubmissions() {
  try {
    const response = await fetch("data/submissions.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Unable to load submissions (${response.status})`);
    allSubmissions = (await response.json()).submissions;
    submissionByMedia = new Map();
    allSubmissions.forEach((submission) => {
      [...submission.media, ...(submission.matchedMedia || [])].forEach((path) => {
        // The exact attachment takes precedence when several rows share a title.
        if (!submissionByMedia.has(path)) submissionByMedia.set(path, submission);
      });
    });
  } catch (error) {
    submissionsError = true;
    console.error(error);
  }
}

function findWorkSubmission(work) {
  return work.media.map((path) => submissionByMedia.get(path)).find(Boolean);
}

function getAwardMedia(entry, submission) {
  // Sequence awards are split into individual cards in the winning gallery.
  const media = new Set(winningWorkGroups.flatMap(getGroupWorks)
    .filter((work) => work.name === entry.name).flatMap((work) => work.media));
  (entry.media || []).forEach((path) => media.add(path));
  // A submission may display a duplicate file under another award's path.
  for (const source of submission?.sources || []) {
    const aliases = [source.path, ...(source.matched || [])];
    if (aliases.some((path) => media.has(path))) aliases.forEach((path) => media.add(path));
  }
  return [...media];
}

function normalizeWorkSearch(value) {
  return value.normalize("NFKC").toLocaleLowerCase().trim();
}

function submissionMatches(submission, { query = "", title = "", artist = "", tag = "all", award = "all" }) {
  const includes = (value, search) => normalizeWorkSearch(search).split(/\s+/u)
    .filter(Boolean).every((word) => normalizeWorkSearch(value).includes(word));
  const titles = [submission.title, ...(submission.titleAliases || [])].join(" ");
  return includes(`${titles} ${submission.artist}`, query)
    && includes(titles, title) && includes(submission.artist, artist)
    && (tag === "all" || submission.tags.includes(tag))
    && (award === "all" || (award === "winning") === Boolean(submission.awards.length));
}

function createSubmissionCard(submission) {
  const primary = submission.awards[0];
  const work = {
    ...(primary || {}),
    name: primary?.name || `投稿作品_${submission.title}_${submission.artist}`,
    details: { title: submission.title, artist: submission.artist, ...(primary ? {} : { award: "投稿作品" }) },
    media: submission.media,
    typeLabel: submission.tags[0],
    submission,
    hideAward: true,
    viewerDescription: `類型：${submission.tags.join("、")}`,
  };
  const card = createWinningWork(work);
  if (submission.tags.some((tag) => tag.startsWith("像素"))) {
    card.classList.add("winning-work--pixel-art");
    card.querySelector(".winning-work__open").dataset.imageViewerPixelArt = "";
  }
  card.dataset.submissionId = submission.id;
  const metadata = card.querySelector(".winning-work__metadata");
  submission.tags.slice(1).forEach((tag) => {
    const label = document.createElement("span");
    label.className = `winning-work__type winning-work__type--${getWorkTypeClass(tag)}`;
    label.textContent = tag;
    metadata.append(label);
  });
  if (submission.awards.length) {
    const awards = document.createElement("div");
    awards.className = "all-works__awards";
    awards.setAttribute("aria-label", "得獎獎項與評審講評");
    submission.awards.forEach((entry) => {
      const details = parseWorkName(entry.name);
      const awardButton = document.createElement("button");
      awardButton.type = "button";
      awardButton.className = "all-works__award";
      awardButton.textContent = details.award;
      awardButton.setAttribute("aria-label", `查看${details.award}作品與評審講評`);
      // Reuse the winning-card trigger so every award keeps its original judges,
      // reviews, media order and pixel-art settings, without creating extra media.
      const winningTrigger = document.querySelector(`[data-winning-works] [data-award-key="${CSS.escape(entry.name)}"]`);
      if (winningTrigger) Object.assign(awardButton.dataset, winningTrigger.dataset);
      else Object.assign(awardButton.dataset, card.querySelector(".winning-work__open").dataset);
      if (submission.meaning) awardButton.dataset.imageViewerMeaning = submission.meaning;
      const trophyPath = podiumAwards[details.award]?.trophy || awardSectionTrophies[entry.groupTitle] || "imgs/trophies/繪俄史金獎(無貓版).webp";
      const trophy = document.createElement("img");
      trophy.src = trophyPath;
      trophy.alt = `${details.award}獎盃`;
      trophy.loading = "lazy";
      awardButton.prepend(trophy);
      awards.append(awardButton);
      const media = getAwardMedia(entry, submission);
      const updateVisibility = (path) => { awardButton.hidden = !media.includes(path); };
      updateVisibility(submission.media[0]);
      card.addEventListener("workmediachange", (event) => updateVisibility(event.detail.path));
    });
    card.append(awards);
  }
  return card;
}

function initializeAllWorks() {
  const panel = document.getElementById("all-works-panel");
  const grid = panel?.querySelector("[data-work-grid]");
  const toolbar = panel?.querySelector("[data-work-toolbar]");
  if (!grid || !toolbar) return;
  grid.classList.add("all-works__grid");
  toolbar.replaceChildren();
  grid.replaceChildren();
  const empty = panel.querySelector("[data-work-empty]");
  if (submissionsError) {
    empty.hidden = false;
    empty.textContent = "投稿資料載入失敗，請重新整理頁面再試。";
    return;
  }
  const form = document.createElement("form");
  form.className = "all-works__search";
  form.setAttribute("role", "search");
  const makeInput = (labelText, placeholder) => {
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "search";
    input.placeholder = placeholder;
    label.append(input);
    return { label, input };
  };
  const general = makeInput("搜尋作品", "輸入作品名稱或作者暱稱");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "搜尋";
  const advanced = document.createElement("details");
  advanced.className = "all-works__advanced";
  const summary = document.createElement("summary");
  summary.textContent = "進階搜尋";
  const title = makeInput("作品名稱", "限定作品名稱");
  const artist = makeInput("作者暱稱", "限定作者");
  const awardLabel = document.createElement("label");
  awardLabel.textContent = "得獎狀態";
  const award = document.createElement("select");
  [["all", "全部投稿"], ["winning", "得獎作品"], ["other", "未得獎作品"]].forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value; option.textContent = text; award.append(option);
  });
  awardLabel.append(award);
  advanced.append(summary, title.label, artist.label, awardLabel);
  const reset = document.createElement("button");
  reset.type = "reset";
  reset.textContent = "清除條件";
  form.append(general.label, submit, reset, advanced);
  const filters = document.createElement("div");
  filters.className = "work-gallery__filters";
  filters.setAttribute("aria-label", "依作品分類篩選");
  let activeTag = "all";
  const tags = [...new Set(allSubmissions.flatMap((submission) => submission.tags))];
  ["all", ...tags].forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "work-gallery__filter";
    button.textContent = tag === "all" ? "全部分類" : tag;
    button.dataset.tag = tag;
    button.addEventListener("click", () => { activeTag = tag; update(); });
    filters.append(button);
  });
  const count = document.createElement("p");
  count.className = "all-works__count";
  count.setAttribute("role", "status");
  count.setAttribute("aria-live", "polite");
  const more = document.createElement("div");
  more.className = "all-works__more";
  more.setAttribute("aria-hidden", "true");
  let matches = [], shown = 0;
  const moreObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) && !more.hidden) renderMore();
  }, { rootMargin: "0px 0px 400px 0px" });
  function renderMore() {
    moreObserver.unobserve(more);
    const batch = matches.slice(shown, shown + 24);
    batch.forEach((submission) => grid.append(createSubmissionCard(submission)));
    shown += batch.length;
    more.hidden = shown >= matches.length;
    // Observe again so short result batches keep filling the viewport.
    if (!more.hidden) moreObserver.observe(more);
  }
  function update() {
    grid.querySelectorAll("video").forEach((video) => {
      videoPreviewObserver?.unobserve(video);
      video.pause(); video.removeAttribute("src"); video.load();
    });
    grid.replaceChildren();
    matches = allSubmissions.filter((submission) => submissionMatches(submission, {
      query: general.input.value, title: title.input.value, artist: artist.input.value,
      tag: activeTag, award: award.value,
    }));
    filters.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.tag === activeTag;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    shown = 0;
    empty.hidden = matches.length > 0;
    count.textContent = `共 ${matches.length} 件作品`;
    renderMore();
  }
  form.addEventListener("submit", (event) => { event.preventDefault(); update(); });
  form.addEventListener("reset", () => { activeTag = "all"; setTimeout(update, 0); });
  let searchTimer;
  form.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(update, 200); });
  award.addEventListener("change", update);
  toolbar.append(form, filters, count);
  grid.after(more);
  update();
}
