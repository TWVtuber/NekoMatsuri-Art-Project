(() => {
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"]/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
    );

  const supportedTextTones = new Set(["muted", "danger"]);
  const characterTabs = {
    貓祭: "neko",
    祭煜: "matsuri",
    沈曦: "shen-xi",
    沈澈: "shen-che",
    沈樂: "shen-le",
    沈月: "shen-yue",
  };
  const characterNamePattern = /(貓祭|祭煜|沈曦|沈澈|沈樂|沈月)/g;

  const getToneClass = (tone) =>
    supportedTextTones.has(tone) ? ` related-profile__text--${tone}` : "";

  function linkCharacterMentions(value, currentProfileKey = "") {
    return String(value ?? "")
      .split(characterNamePattern)
      .map((part) => {
        const target = characterTabs[part];
        if (!target || target === currentProfileKey) return escapeHtml(part);
        return `<a class="related-character-link" href="#related-data" data-related-character-target="${target}">${escapeHtml(part)}</a>`;
      })
      .join("");
  }

  function renderInlineParts(value, currentProfileKey = "") {
    const item =
      value && typeof value === "object" ? value : { text: value ?? "" };
    const parts = Array.isArray(item.parts) ? item.parts : [item];
    return parts
      .map((part) => {
        const fragment =
          part && typeof part === "object" ? part : { text: part ?? "" };
        return `<span class="related-profile__text${getToneClass(fragment.tone)}">${linkCharacterMentions(fragment.text, currentProfileKey)}</span>`;
      })
      .join("");
  }

  function renderTextBlocks(value, currentProfileKey = "") {
    const lines = Array.isArray(value) ? value : [value];
    return lines
      .map((line) => {
        const block =
          line && typeof line === "object" ? line : { text: line ?? "" };
        if (!Array.isArray(block.parts) && block.text === "") {
          return '<div class="related-profile__text-spacer" aria-hidden="true"></div>';
        }
        return `<p class="related-profile__text">${renderInlineParts(block, currentProfileKey)}</p>`;
      })
      .join("");
  }

  function imageViewerTrigger({
    source,
    title,
    description = "",
    lazy = true,
  }) {
    return `<button class="image-viewer-trigger" type="button" data-image-viewer-src="${escapeHtml(source)}" data-image-viewer-title="${escapeHtml(title)}" data-image-viewer-description="${escapeHtml(description)}" aria-label="開啟${escapeHtml(title)}完整圖片"><img src="${escapeHtml(source)}" alt="${escapeHtml(title)}"${lazy ? ' loading="lazy" decoding="async"' : ""} draggable="false" /></button>`;
  }

  function renderGallery(gallery = [], currentProfileKey = "") {
    return gallery
      .map(
        ([source, caption, description = ""]) =>
          `<figure class="related-photo-card paper-sheet related-profile__gallery-item"><div class="related-profile__gallery-media">${imageViewerTrigger({ source, title: caption, description })}</div><figcaption>${linkCharacterMentions(caption, currentProfileKey)}</figcaption></figure>`,
      )
      .join("");
  }

  function profileTemplate(profile, profileKey) {
    const artist =
      profile.artist && typeof profile.artist === "object"
        ? profile.artist
        : { name: profile.artist ?? "", url: "" };
    const artistName = artist.url
      ? `<a href="${escapeHtml(artist.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(artist.name)}</a>`
      : escapeHtml(artist.name);
    const sidebarImage = profile.sidebarImage;
    const sidebarImageVariant = ["document", "mascot"].includes(
      sidebarImage?.variant,
    )
      ? sidebarImage.variant
      : "document";
    const sidebarImageMarkup = sidebarImage?.src
      ? `<figure class="${sidebarImageVariant === "document" ? "related-photo-card " : ""}related-profile__sidebar-art related-profile__sidebar-art--${sidebarImageVariant}">${imageViewerTrigger({ source: sidebarImage.src, title: sidebarImage.alt ?? profile.name, description: sidebarImage.description ?? "" })}</figure>`
      : "";
    const cornerImageMarkup = profile.cornerImage?.src
      ? `<img class="related-profile__corner-mascot" src="${escapeHtml(profile.cornerImage.src)}" alt="${escapeHtml(profile.cornerImage.alt ?? "")}" loading="lazy" decoding="async" />`
      : "";
    const meta = profile.meta
      .map(
        ([label, value]) =>
          `<li><span>${escapeHtml(label)}</span><strong>${linkCharacterMentions(value, profileKey)}</strong></li>`,
      )
      .join("");
    const socialLink = profile.twitter
      ? `<li class="related-profile__social"><span>Twitter / X</span><strong><a href="${escapeHtml(profile.twitter)}" target="_blank" rel="noopener noreferrer" aria-label="在 Twitter / X 查看 ${escapeHtml(profile.name)} 的個人頁面">查看帳號 <span aria-hidden="true">↗</span></a></strong></li>`
      : "";
    const facts = profile.facts
      .map((fact) => {
        return `<li><span class="related-data-bullet" aria-hidden="true"></span><span class="related-profile__fact-text">${renderInlineParts(fact, profileKey)}</span></li>`;
      })
      .join("");
    const story = renderTextBlocks(profile.story, profileKey);
    const notes = renderTextBlocks(profile.notes, profileKey);
    const gallery = renderGallery(profile.gallery, profileKey);

    return `<div class="manila-texture related-profile related-profile--${escapeHtml(profileKey)}">
      <aside class="related-profile__sidebar">
        <div class="related-profile__portrait-wrap">
          <span class="related-data-photo-tape" aria-hidden="true"></span>
          <div class="related-photo-card polaroid-frame related-profile__portrait">${imageViewerTrigger({ source: profile.portrait, title: `${profile.name}證件照`, description: profile.relationship, lazy: false })}</div>
          <div class="related-profile__name-card"><h2>${escapeHtml(profile.name)}｜${escapeHtml(profile.romanized)}</h2></div>
          <p class="related-profile__artist">繪製：${artistName}</p>
        </div>
        <section class="sticky-note related-profile__facts"><h3>個人資料</h3><ul>${meta}${socialLink}</ul><div class="related-profile__quick-list"><ul>${facts}</ul></div></section>
        ${sidebarImageMarkup}
      </aside>
      <div class="related-profile__main">
        ${cornerImageMarkup}
        <article class="paper-sheet related-profile__paper">
          <section><h3>人物關係</h3><p>${linkCharacterMentions(profile.relationship, profileKey)}</p></section>
          <section><h3>性格</h3><p>${linkCharacterMentions(profile.personality, profileKey)}</p></section>
          <section><h3>背景與相關設定</h3>${story}</section>
          <section><h3>備註</h3>${notes}</section>
        </article>
        <section class="related-profile__gallery"><h3>學院相關照片</h3><div>${gallery}</div></section>
      </div>
    </div>`;
  }

  function familyTemplate(data) {
    const xi = linkCharacterMentions("沈曦");
    const che = linkCharacterMentions("沈澈");
    const le = linkCharacterMentions("沈樂");
    const yue = linkCharacterMentions("沈月");
    const gallery = renderGallery(data.gallery);
    const portraits = [
      ["沈曦", "imgs/characters/證件/照片/沈曦-證件.jpg", "#d34b4b"],
      ["沈澈", "imgs/characters/證件/照片/沈澈-證件.jpg", "#5d9dd5"],
      ["沈樂", "imgs/characters/證件/照片/沈樂-證件.jpg", "#d49a32"],
      ["沈月", "imgs/characters/證件/照片/沈月-證件.jpg", "#7584c8"],
    ]
      .map(
        ([name, source, color]) =>
          `<div class="related-family__portrait-wrap" style="--profile-accent:${escapeHtml(color)}"><span class="related-data-photo-tape" aria-hidden="true"></span><figure class="related-photo-card">${imageViewerTrigger({ source, title: `${name}證件照`, lazy: false })}<figcaption>${linkCharacterMentions(name)}</figcaption></figure></div>`,
      )
      .join("");
    return `<div class="manila-texture related-overview related-family">
      <section><h2>沈家四胞胎相關設定</h2><div class="related-family__portraits">${portraits}</div></section>
      <article class="paper-sheet related-family__names"><h3>沈家對應稱呼</h3><div class="related-family__table-wrap"><table><thead><tr><th>名字</th><th>對${xi}</th><th>對${che}</th><th>對${le}</th><th>對${yue}</th></tr></thead><tbody><tr><th>${xi}</th><td>—</td><td>澈</td><td>樂</td><td>月</td></tr><tr><th>${che}</th><td>大哥</td><td>—</td><td>笨蛋</td><td>妹妹</td></tr><tr><th>${le}</th><td>大哥</td><td>哥</td><td>—</td><td>妹</td></tr><tr><th>${yue}</th><td>大哥</td><td>二哥</td><td>三哥</td><td>—</td></tr></tbody></table></div></article>
      <section class="related-profile__gallery related-family__photo-gallery"><h3>沈家相關照片</h3><div>${gallery}</div></section>
    </div>`;
  }

  function renderTabs(relatedData) {
    const tabList = document.querySelector(
      "#related-data [data-related-data-tabs]",
    );
    if (!tabList) return;

    const tabs = Object.entries(relatedData)
      .filter(([, data]) => data.tab?.title && data.tab?.color)
      .sort(
        ([, first], [, second]) =>
          (first.tab.order ?? Number.MAX_SAFE_INTEGER) -
          (second.tab.order ?? Number.MAX_SAFE_INTEGER),
      );
    const defaultKey =
      tabs.find(([, data]) => data.tab.default)?.[0] ?? tabs[0]?.[0];

    const renderTabGroup = (groupTabs) =>
      groupTabs
      .map(([key, data], index) => {
        const isSelected = key === defaultKey;
        const marginClass = index === groupTabs.length - 1 ? "" : " mr-[-8px]";
        const colorClass = data.tab.color === "#ffcbd3" ? " folder-tab--pink" : " folder-tab--blue";
        return `<button class="folder-tab${colorClass} px-5 py-2 font-label-md text-label-md${marginClass} ${isSelected ? "active-tab text-black" : "inactive-tab text-on-surface-variant"}" type="button" role="tab" aria-selected="${isSelected}" aria-controls="folder-panel-${escapeHtml(key)}" id="folder-tab-${escapeHtml(key)}" data-folder-target="${escapeHtml(key)}">${escapeHtml(data.tab.title)}</button>`;
      })
      .join("");

    const primaryTabs = tabs.filter(([, data]) => (data.tab.order ?? 0) < 4);
    const shenFamilyTabs = tabs.filter(([, data]) => (data.tab.order ?? 0) >= 4);

    tabList.classList.add("related-data-tabs");
    tabList.innerHTML = `<div class="related-data-tabs__group">${renderTabGroup(primaryTabs)}</div><div class="related-data-tabs__group related-data-tabs__group--end">${renderTabGroup(shenFamilyTabs)}</div>`;
  }

  function renderRelatedData(relatedData) {
    renderTabs(relatedData);
    const panelContainer = document.querySelector(
      "#related-data [data-related-data-panels]",
    );
    if (!panelContainer) return;

    const panels = Object.entries(relatedData)
      .filter(([, data]) => data.tab?.title && data.tab?.color)
      .sort(
        ([, first], [, second]) =>
          (first.tab.order ?? Number.MAX_SAFE_INTEGER) -
          (second.tab.order ?? Number.MAX_SAFE_INTEGER),
      );
    const defaultKey =
      panels.find(([, data]) => data.tab.default)?.[0] ?? panels[0]?.[0];

    panelContainer.innerHTML = panels
      .map(([key, data]) => {
        const content =
          data.kind === "family"
            ? familyTemplate(data)
            : profileTemplate(data, key);
        return `<section class="related-data-panel is-rendered" id="folder-panel-${escapeHtml(key)}" role="tabpanel" aria-labelledby="folder-tab-${escapeHtml(key)}" data-folder-panel="${escapeHtml(key)}"${key === defaultKey ? "" : " hidden"}>${content}</section>`;
      })
      .join("");
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
      const panelContainer = document.querySelector(
        "#related-data [data-related-data-panels]",
      );
      if (panelContainer) {
        panelContainer.innerHTML =
          '<p class="related-data-error">人物資料暫時無法載入，請稍後再試。</p>';
      }
    }
  }

  loadRelatedData();
})();
