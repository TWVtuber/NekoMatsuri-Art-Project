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
    artist = null,
    lazy = true,
  }) {
    const artistAttributes = artist?.name && artist?.url
      ? ` data-image-viewer-artist-name="${escapeHtml(artist.name)}" data-image-viewer-artist-url="${escapeHtml(artist.url)}"`
      : "";
    return `<button class="image-viewer-trigger" type="button" data-image-viewer-src="${escapeHtml(source)}" data-image-viewer-title="${escapeHtml(title)}" data-image-viewer-description="${escapeHtml(description)}"${artistAttributes} aria-label="開啟${escapeHtml(title)}完整圖片"><img src="${escapeHtml(source)}" alt="${escapeHtml(title)}"${lazy ? ' loading="lazy" decoding="async"' : ""} draggable="false" /></button>`;
  }

  function animationViewerTrigger({ source, title, description = "", artist = null }) {
    const artistAttributes = artist?.name && artist?.url
      ? ` data-image-viewer-artist-name="${escapeHtml(artist.name)}" data-image-viewer-artist-url="${escapeHtml(artist.url)}"`
      : "";
    return `<button class="image-viewer-trigger" type="button" data-image-viewer-src="${escapeHtml(source)}" data-image-viewer-title="${escapeHtml(title)}" data-image-viewer-description="${escapeHtml(description)}"${artistAttributes} aria-label="開啟${escapeHtml(title)}完整動圖"><img class="related-profile__gallery-animation" src="${escapeHtml(source)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" draggable="false" /></button>`;
  }

  function renderGallery(gallery = [], currentProfileKey = "") {
    return gallery
      .map(
        ({ src, caption, description = "", type = "image", artist = null }) => {
          const media = type === "video"
            ? animationViewerTrigger({ source: src, title: caption, description, artist })
            : imageViewerTrigger({ source: src, title: caption, description, artist });
          return `<figure class="related-photo-card paper-sheet related-profile__gallery-item"><div class="related-profile__gallery-media">${media}</div><figcaption>${linkCharacterMentions(caption, currentProfileKey)}</figcaption></figure>`;
        },
      )
      .join("");
  }

  function profileTemplate(profile, profileKey, labels) {
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
      ? `<figure class="${sidebarImageVariant === "document" ? "related-photo-card " : ""}related-profile__sidebar-art related-profile__sidebar-art--${sidebarImageVariant}">${imageViewerTrigger({ source: sidebarImage.src, title: sidebarImage.alt ?? profile.name, description: sidebarImage.description ?? "", artist: sidebarImage.artist })}</figure>`
      : "";
    const renderCornerDisplay = (placement) => {
      const placementClass = `related-profile__corner-mascot--${placement}`;
      const cornerImageMarkup = profile.cornerImage?.animationSrc
        ? `<button class="image-viewer-trigger related-profile__corner-mascot ${placementClass}" type="button" data-image-viewer-src="${escapeHtml(profile.cornerImage.animationSrc)}" data-image-viewer-title="${escapeHtml(profile.cornerImage.alt ?? profile.name)}" aria-label="開啟${escapeHtml(profile.cornerImage.alt ?? profile.name)}完整動圖"><img class="related-profile__corner-mascot-animation" src="${escapeHtml(profile.cornerImage.animationSrc)}" alt="${escapeHtml(profile.cornerImage.alt ?? "")}" loading="lazy" decoding="async" draggable="false" /></button>`
        : profile.cornerImage?.src
          ? `<button class="image-viewer-trigger related-profile__corner-mascot ${placementClass}" type="button" data-image-viewer-src="${escapeHtml(profile.cornerImage.src)}" data-image-viewer-title="${escapeHtml(profile.cornerImage.alt ?? profile.name)}" aria-label="開啟${escapeHtml(profile.cornerImage.alt ?? profile.name)}完整圖片"><img class="related-profile__corner-mascot-image" src="${escapeHtml(profile.cornerImage.src)}" alt="${escapeHtml(profile.cornerImage.alt ?? "")}" loading="lazy" decoding="async" /></button>`
          : "";
      if (!cornerImageMarkup) return "";
      const logoTitle = profile.logo?.alt ?? `${profile.name} Logo`;
      const logoMarkup = profile.logo?.src
        ? `<button class="image-viewer-trigger related-profile__corner-logo-button" type="button" data-image-viewer-src="${escapeHtml(profile.logo.src)}" data-image-viewer-title="${escapeHtml(logoTitle)}" aria-label="開啟${escapeHtml(logoTitle)}大圖"><img class="related-profile__corner-logo" src="${escapeHtml(profile.logo.src)}" alt="${escapeHtml(logoTitle)}" loading="lazy" decoding="async" draggable="false" /></button>`
        : "";
      return `<div class="related-profile__corner-display related-profile__corner-display--${placement}">${cornerImageMarkup}${logoMarkup}</div>`;
    };
    const cornerImageMarkup = renderCornerDisplay("paper");
    const sidebarCornerImageMarkup = renderCornerDisplay("sidebar");
    const sidebarArtRowMarkup = sidebarImageMarkup || sidebarCornerImageMarkup
      ? `<div class="related-profile__sidebar-art-row">${sidebarImageMarkup}${sidebarCornerImageMarkup}</div>`
      : "";
    const meta = profile.meta
      .map(
        ({ label, value }) =>
          `<li><span>${escapeHtml(label)}</span><strong>${linkCharacterMentions(value, profileKey)}</strong></li>`,
      )
      .join("");
    const relatedLink = profile.relatedLink ??
      (profile.twitter
        ? {
            label: labels.defaultSocialLabel,
            url: profile.twitter,
            text: labels.defaultSocialText,
          }
        : null);
    const socialLink = relatedLink
      ? `<li class="related-profile__social"><span>${escapeHtml(relatedLink.label)}</span><strong><a href="${escapeHtml(relatedLink.url)}" target="_blank" rel="noopener noreferrer" aria-label="查看 ${escapeHtml(profile.name)}的${escapeHtml(relatedLink.label)}">${escapeHtml(relatedLink.text)} <span aria-hidden="true">↗</span></a></strong></li>`
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
          <div class="related-photo-card polaroid-frame related-profile__portrait">${imageViewerTrigger({ source: profile.portrait, title: `${profile.name}證件照`, description: profile.relationship, artist, lazy: false })}</div>
          <div class="related-profile__name-card"><h2>${escapeHtml(profile.name)}｜${escapeHtml(profile.romanized)}</h2></div>
          <p class="related-profile__artist">${escapeHtml(labels.artistPrefix)}${artistName}</p>
        </div>
        <section class="sticky-note related-profile__facts"><h3>${escapeHtml(labels.personalDataTitle)}</h3><ul>${meta}${socialLink}</ul><div class="related-profile__quick-list"><ul>${facts}</ul></div></section>
        ${sidebarArtRowMarkup}
      </aside>
      <div class="related-profile__main">
        <article class="paper-sheet related-profile__paper">
          <section>${cornerImageMarkup}<h3>${escapeHtml(labels.relationshipTitle)}</h3><p>${linkCharacterMentions(profile.relationship, profileKey)}</p></section>
          <section><h3>${escapeHtml(labels.personalityTitle)}</h3><p>${linkCharacterMentions(profile.personality, profileKey)}</p></section>
          <section><h3>${escapeHtml(labels.storyTitle)}</h3>${story}</section>
          <section><h3>${escapeHtml(labels.notesTitle)}</h3>${notes}</section>
        </article>
        <section class="related-profile__gallery"><h3>${escapeHtml(labels.galleryTitle)}</h3><div>${gallery}</div></section>
      </div>
    </div>`;
  }

  function familyTemplate(data, labels) {
    const gallery = renderGallery(data.gallery);
    const portraitCountClass = data.portraits.length === 2
      ? " related-family__portraits--2"
      : "";
    const portraits = data.portraits
      .map(
        ({ name, src, accent, artist, url = "" }) => {
          const caption = url
            ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="前往${escapeHtml(name)}的 X 帳號">${escapeHtml(name)}</a>`
            : linkCharacterMentions(name);
          return `<div class="related-family__portrait-wrap" style="--profile-accent:${escapeHtml(accent)}"><span class="related-data-photo-tape" aria-hidden="true"></span><figure class="related-photo-card">${imageViewerTrigger({ source: src, title: `${name}證件照`, artist, lazy: false })}<figcaption>${caption}</figcaption></figure></div>`;
        },
      )
      .join("");
    const namesMarkup = data.nameTable
      ? (() => {
          const tableHead = data.nameTable.columns
            .map((column) => `<th>${linkCharacterMentions(column)}</th>`)
            .join("");
          const tableBody = data.nameTable.rows
            .map(
              ({ name, values }) =>
                `<tr><th>${linkCharacterMentions(name)}</th>${values.map((value) => `<td>${linkCharacterMentions(value)}</td>`).join("")}</tr>`,
            )
            .join("");
          return `<article class="paper-sheet related-family__names"><h3>${escapeHtml(labels.namesTitle)}</h3><div class="related-family__table-wrap"><table><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></div></article>`;
        })()
      : "";
    const galleryMarkup = data.gallery?.length
      ? `<section class="related-profile__gallery related-family__photo-gallery"><h3>${escapeHtml(labels.galleryTitle)}</h3><div>${gallery}</div></section>`
      : "";
    return `<div class="manila-texture related-overview related-family">
      <section><h2>${escapeHtml(labels.title)}</h2><div class="related-family__portraits${portraitCountClass}">${portraits}</div></section>
      ${namesMarkup}
      ${galleryMarkup}
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
      .map(([key, data]) => {
        const isSelected = key === defaultKey;
        const colorClass = data.tab.color === "#ffcbd3"
          ? " folder-tab--pink"
          : data.tab.color === "#e2d2ff"
            ? " folder-tab--purple"
            : " folder-tab--blue";
        return `<button class="folder-tab${colorClass} px-5 py-2 font-label-md text-label-md ${isSelected ? "active-tab text-black" : "inactive-tab text-on-surface-variant"}" type="button" role="tab" aria-selected="${isSelected}" aria-controls="folder-panel-${escapeHtml(key)}" id="folder-tab-${escapeHtml(key)}" data-folder-target="${escapeHtml(key)}">${escapeHtml(data.tab.title)}</button>`;
      })
      .join("");

    const primaryTabs = tabs.filter(([, data]) => (data.tab.order ?? 0) < 4);
    const shenFamilyTabs = tabs.filter(([, data]) => {
      const order = data.tab.order ?? 0;
      return order >= 4 && order < 9;
    });
    const otherTabs = tabs.filter(([, data]) => (data.tab.order ?? 0) >= 9);

    tabList.classList.add("related-data-tabs");
    tabList.innerHTML = `<div class="related-data-tabs__group">${renderTabGroup(primaryTabs)}</div><div class="related-data-tabs__group related-data-tabs__group--end">${renderTabGroup(shenFamilyTabs)}</div><div class="related-data-tabs__group related-data-tabs__group--other">${renderTabGroup(otherTabs)}</div>`;
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
            ? familyTemplate(data, {
                ...relatedData._ui.family,
                ...(data.labels ?? {}),
              })
            : profileTemplate(data, key, relatedData._ui.profile);
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
