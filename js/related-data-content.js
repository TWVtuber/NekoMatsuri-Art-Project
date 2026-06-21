(() => {
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"]/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[
          character
        ],
    );

  function renderTextBlocks(value) {
    const lines = Array.isArray(value) ? value : [value];
    return lines
      .map((line) => {
        if (line === "") {
          return '<div class="related-profile__text-spacer" aria-hidden="true"></div>';
        }
        return `<p>${escapeHtml(line ?? "")}</p>`;
      })
      .join("");
  }

  function profileTemplate(profile) {
    const meta = profile.meta
      .map(
        ([label, value]) =>
          `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`,
      )
      .join("");
    const facts = profile.facts
      .map(
        (fact) =>
          `<li><span class="related-data-bullet" aria-hidden="true"></span><span>${escapeHtml(fact)}</span></li>`,
      )
      .join("");
    const story = renderTextBlocks(profile.story);
    const notes = renderTextBlocks(profile.notes);
    const gallery = profile.gallery
      .map(
        ([source, caption]) =>
          `<figure class="related-profile__gallery-item"><div class="paper-sheet"><img src="${escapeHtml(source)}" alt="${escapeHtml(caption)}" loading="lazy" /></div><figcaption>${escapeHtml(caption)}</figcaption></figure>`,
      )
      .join("");

    return `<div class="manila-texture related-profile" style="--profile-accent:${profile.accent}">
      <aside class="related-profile__sidebar">
        <div class="related-profile__portrait-wrap">
          <span class="tape related-data-photo-tape" aria-hidden="true"></span>
          <div class="polaroid-frame related-profile__portrait"><img src="${escapeHtml(profile.portrait)}" alt="${escapeHtml(profile.name)}證件照" /></div>
          <div class="related-profile__name-card"><h2>${escapeHtml(profile.name)}｜${escapeHtml(profile.romanized)}</h2></div>
          <p class="related-profile__artist">繪製：${escapeHtml(profile.artist)}</p>
        </div>
        <section class="sticky-note related-profile__facts"><h3>個人資料</h3><ul>${meta}</ul><div class="related-profile__quick-list"><ul>${facts}</ul></div></section>
      </aside>
      <div class="related-profile__main">
        <article class="paper-sheet related-profile__paper">
          <section><h3>人物關係</h3><p>${escapeHtml(profile.relationship)}</p></section>
          <section><h3>性格</h3><p>${escapeHtml(profile.personality)}</p></section>
          <section><h3>背景與相關設定</h3>${story}</section>
          <section><h3>備註</h3>${notes}</section>
        </article>
        <section class="related-profile__gallery"><h3>學院相關照片</h3><div>${gallery}</div></section>
      </div>
    </div>`;
  }

  function classroomTemplate() {
    const seats = [
      ["沈月", "沈樂", "阿強"],
      ["沈曦", "沈澈", "阿醜"],
      ["貓祭", "利貝", ""],
      ["祭煜", "阿雄", ""],
    ];
    const seatHtml = seats
      .flat()
      .map(
        (name) =>
          `<div class="class-seat${!name ? " is-empty" : ""}">${escapeHtml(name)}</div>`,
      )
      .join("");
    return `<div class="manila-texture related-overview">
      <article class="paper-sheet related-overview__paper"><h2>三年 C 班相關設定</h2>
        <div class="classroom-layout"><div class="classroom-layout__balcony">陽台</div><div class="classroom-layout__board">黑板</div><div class="classroom-layout__seats">${seatHtml}</div><div class="classroom-layout__desk">講台</div></div>
        <ul class="related-overview__legend"><li><i class="is-cat"></i>紅色底為貓家：貓祭、祭煜</li><li><i class="is-shen"></i>藍色底為沈家：沈月、沈曦、沈樂、沈澈</li><li><i class="is-ip"></i>紫色底為貓祭旗下 IP：阿強、阿醜、利貝、阿雄</li></ul>
        <p>本次繪圖比賽主要繪製評分標準為貓家以及沈家；額外繪製紫色底人物尚有加分，但並非本次活動主軸。</p>
      </article>
      <section class="related-uniforms"><h2>繪俄史藝術高等學院制服</h2><div><figure class="paper-sheet"><img src="imgs/characters/Objects/制服%26運動服/制服男.jpg" alt="男性制服與運動服設定" loading="lazy" /><figcaption>男性制服／運動服</figcaption></figure><figure class="paper-sheet"><img src="imgs/characters/Objects/制服%26運動服/制服女.jpg" alt="女性制服與運動服設定" loading="lazy" /><figcaption>女性制服／運動服</figcaption></figure></div></section>
    </div>`;
  }

  function familyTemplate() {
    const portraits = [
      ["沈曦", "imgs/characters/沈曦-證件.jpg"],
      ["沈澈", "imgs/characters/沈澈-證件.jpg"],
      ["沈樂", "imgs/characters/沈樂-證件.jpg"],
      ["沈月", "imgs/characters/沈月-證件.jpg"],
    ]
      .map(
        ([name, source]) =>
          `<figure><img src="${source}" alt="${name}證件照" /><figcaption>${name}</figcaption></figure>`,
      )
      .join("");
    return `<div class="manila-texture related-overview related-family">
      <section><h2>沈家四胞胎相關設定</h2><div class="related-family__portraits">${portraits}</div></section>
      <article class="paper-sheet related-family__names"><h3>沈家對應稱呼</h3><div class="related-family__table-wrap"><table><thead><tr><th>名字</th><th>對沈曦</th><th>對沈澈</th><th>對沈樂</th><th>對沈月</th></tr></thead><tbody><tr><th>沈曦</th><td>—</td><td>澈</td><td>樂</td><td>月</td></tr><tr><th>沈澈</th><td>大哥</td><td>—</td><td>笨蛋</td><td>妹妹</td></tr><tr><th>沈樂</th><td>大哥</td><td>哥</td><td>—</td><td>妹</td></tr><tr><th>沈月</th><td>大哥</td><td>二哥</td><td>三哥</td><td>—</td></tr></tbody></table></div></article>
      <section class="related-family__gallery"><img src="imgs/characters/3C-Pics/沈家相關/【沈家】全彩日常.jpg" alt="沈家全彩日常" loading="lazy" /><img src="imgs/characters/3C-Pics/沈家相關/【沈家】三年C班的四胞胎.jpg" alt="三年 C 班的沈家四胞胎" loading="lazy" /></section>
      <p class="related-profile__credit">相關設定繪製：十炎 Shiyan</p>
    </div>`;
  }

  function renderRelatedData(relatedData) {
    document
      .querySelectorAll("#related-data [data-profile-key]")
      .forEach((panel) => {
        const data = relatedData[panel.dataset.profileKey];
        if (!data) return;
        if (data.kind === "profile") panel.innerHTML = profileTemplate(data);
        else if (data.kind === "classroom")
          panel.innerHTML = classroomTemplate();
        else if (data.kind === "family") panel.innerHTML = familyTemplate();
        panel.classList.remove("related-data-panel--placeholder");
        panel.classList.add("is-rendered");
      });
  }

  async function loadRelatedData() {
    try {
      const response = await fetch("data/related-data.json", {
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      renderRelatedData(await response.json());
      document.dispatchEvent(new CustomEvent("related-data:ready"));
    } catch (error) {
      console.error("Unable to load related character data.", error);
      document
        .querySelectorAll("#related-data [data-profile-key]")
        .forEach((panel) => {
          panel.innerHTML = "<p>人物資料暫時無法載入，請稍後再試。</p>";
        });
    }
  }

  loadRelatedData();
})();
