(() => {
  const hookAttribute = (hook) => hook ? `data-${hook}-link` : "";

  function renderLinkList(container, items) {
    if (!container || !Array.isArray(items)) return;
    const existing = [...container.querySelectorAll(":scope > a")];
    if (existing.length === items.length) {
      existing.forEach((link, index) => {
        const item = items[index];
        link.href = item.href;
        link.textContent = item.label;
      });
      return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      const hook = hookAttribute(item.hook);
      if (hook) link.setAttribute(hook, "");
      fragment.append(link);
    });
    container.replaceChildren(fragment);
  }

  const renderHtmlItems = (container, items) => {
    if (!container || !Array.isArray(items)) return;
    container.replaceChildren(...items.map((html) => {
      const item = document.createElement("li");
      item.innerHTML = html;
      return item;
    }));
  };

  function renderSiteContent(data) {
    if (!data) return;
    if (data.meta) {
      document.title = data.meta.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = data.meta.description;
    }
    renderLinkList(document.querySelector(".site-nav"), data.navigation);

    if (data.academy) {
      document.getElementById("academy-modal-title").textContent = data.academy.title;
      const copy = document.querySelector(".academy-modal__copy");
      copy.replaceChildren(...data.academy.paragraphs.map((html) => {
        const paragraph = document.createElement("p"); paragraph.innerHTML = html; return paragraph;
      }));
      const more = document.querySelector(".academy-modal__more:not(.academy-modal__more--president)");
      more.href = data.academy.more.url; more.textContent = data.academy.more.label;
      document.getElementById("academy-president-link").firstChild.nodeValue = `${data.academy.presidentLabel} `;
    }

    if (data.hashtags) {
      document.getElementById("activity-hashtags-title").textContent = data.hashtags.title;
      const copyButton = document.querySelector("[data-copy-hashtag]");
      copyButton.dataset.copyHashtag = data.hashtags.items.join(" ");
      copyButton.querySelector(".hashtag-copy-label").textContent = data.hashtags.copyLabel;
      const list = document.querySelector(".activity-hashtags__list");
      list.replaceChildren(...data.hashtags.items.map((label) => {
        const wrapper = document.createElement("div"); wrapper.className = "activity-hashtag";
        const link = document.createElement("a"); link.href = `https://x.com/search?q=${encodeURIComponent(label)}&src=hashtag_click`;
        link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = label; wrapper.append(link); return wrapper;
      }));
    }

    if (data.heroCopy) {
      const root = document.querySelector(".about-text");
      root.querySelector(".hero-lead").textContent = data.heroCopy.lead;
      root.querySelector("[data-hero-intro]").innerHTML = data.heroCopy.intro;
      root.querySelector(".hero-declaration__text").textContent = data.heroCopy.declaration;
      const paragraphs = root.querySelectorAll("[data-hero-paragraph]");
      data.heroCopy.paragraphs.forEach((html, index) => { if (paragraphs[index]) paragraphs[index].innerHTML = html; });
      root.querySelector(".hero-closing").textContent = data.heroCopy.closing;
    }

    if (data.countdown) {
      document.getElementById("countdown-title").textContent = data.countdown.title;
      document.getElementById("countdown-title").dataset.closedTitle = data.countdown.closedTitle;
      document.querySelectorAll(".time-card span").forEach((node, index) => { node.textContent = data.countdown.units[index] || ""; });
      document.querySelector(".countdown-cta").textContent = data.countdown.cta;
    }

    if (data.rules) {
      const theme = document.querySelector(".note-card--rules");
      theme.querySelector("h2").textContent = data.rules.themeTitle;
      renderHtmlItems(theme.querySelector(".check-list"), data.rules.themeItems);
      theme.querySelector(".academy-info-trigger__title").textContent = data.rules.academyQuestion;
      theme.querySelector(".academy-info-trigger__action").textContent = data.rules.academyAction;
      theme.querySelector(".character-link__label").textContent = data.rules.referencesLabel;
      const guidelines = document.querySelector(".note-card--guidelines");
      guidelines.querySelector("h2").textContent = data.rules.guidelinesTitle;
      renderHtmlItems(guidelines.querySelector(".rule-list"), data.rules.guidelineItems);
    }

    if (data.footer) {
      const contact = document.querySelector(".footer-contact");
      const mail = document.createElement("a"); mail.href = `mailto:${data.footer.email}`; mail.textContent = data.footer.email;
      contact.replaceChildren(document.createElement("p"), document.createElement("p"), mail, document.createElement("p"));
      contact.querySelectorAll("p").forEach((node, index) => { node.textContent = data.footer.contactLines[index]; });
      renderLinkList(document.querySelector(".footer-links"), data.footer.links);
    }
  }
  const setExternalLinkAttributes = (link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  };

  function renderThemeAssets(data) {
    if (data?.homeBackground) {
      const backgroundUrl = new URL(data.homeBackground, document.baseURI).href;
      document.documentElement.style.setProperty(
        "--home-background-image",
        `url("${backgroundUrl}")`,
      );
    }
  }

  function setImage(selector, data) {
    const image = document.querySelector(selector);
    if (!image || !data) return;
    image.src = typeof data === "string" ? data : data.src;
    if (typeof data === "object" && data.alt !== undefined) image.alt = data.alt;
  }

  function renderEntrance(data) {
    if (!data) return;
    setImage(".home-pink-vfx", data.pinkEffect);
    setImage(".home-logo", data.logo);
    setImage(".home-white-bg", data.logoBackground);
    setImage(".home-vfx", data.logoEffect);
  }

  function renderHeroMedia(data) {
    if (!data) return;
    const pvIframe = document.getElementById("pv-iframe");
    if (pvIframe) { pvIframe.src = data.pv.embedUrl; pvIframe.title = data.pv.title; }
    const modalIframe = document.getElementById("pv-modal-iframe");
    if (modalIframe) { modalIframe.src = data.pv.autoplayEmbedUrl; modalIframe.title = data.pv.title; }
    const sourceLink = document.querySelector(".pv-modal__youtube-link");
    if (sourceLink) sourceLink.href = data.pv.watchUrl;
    const pvCaption = document.querySelector(".hero-pv-frame + figcaption");
    if (pvCaption) pvCaption.textContent = data.pv.label;

    const liveLink = document.querySelector(".hero-photo-stack > a");
    if (liveLink) liveLink.href = data.liveBroadcast.url;
    setImage(".hero-photo--secondary img", { src: data.liveBroadcast.image, alt: data.liveBroadcast.alt });
    const liveCaption = document.querySelector(".hero-photo--secondary figcaption");
    if (liveCaption) liveCaption.firstChild.nodeValue = `${data.liveBroadcast.label} `;
    setImage(".hero-logo-title img", data.mainLogo);
  }

  function renderPartners(partners) {
    if (!Array.isArray(partners)) return;
    const stampLinks = document.querySelectorAll(".stamp-logos .stamp-logo");
    stampLinks.forEach((link, index) => {
      const item = index === 0 ? partners[1] : partners[0];
      if (!item) return;
      link.href = item.url;
      const image = link.querySelector("img");
      image.src = item.logo;
      image.alt = item.alt;
    });
    document.querySelectorAll(".footer-organizers").forEach((container) => {
      container.querySelectorAll(".footer-organizer").forEach((block, index) => {
        const item = partners[index];
        if (!item) return;
        block.querySelector("span").textContent = item.role;
        const link = block.querySelector("a");
        link.href = item.url;
        const image = link.querySelector("img");
        image.src = item.logo;
        image.alt = item.alt;
      });
    });
  }

  function createImageViewerTrigger(item, className = "") {
    const button = document.createElement("button");
    button.className = `image-viewer-trigger ${className}`.trim();
    button.type = "button";
    button.dataset.imageViewerSrc = item.src;
    button.dataset.imageViewerTitle = item.title;
    if (item.description) button.dataset.imageViewerDescription = item.description;
    if (item.link) button.dataset.imageViewerLink = item.link;
    if (item.artist?.name && item.artist?.url) {
      button.dataset.imageViewerArtistName = item.artist.name;
      button.dataset.imageViewerArtistUrl = item.artist.url;
    }
    button.setAttribute("aria-label", `開啟${item.title}完整圖片`);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt || item.title;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    button.append(image);
    return button;
  }

  function renderRelatedReferences(data) {
    const grid = document.querySelector("[data-related-reference-grid]");
    if (grid && Array.isArray(data?.items)) {
      const fragment = document.createDocumentFragment();
      data.items.forEach((item) => {
        if (!item?.src || !item?.title) return;
        const figure = document.createElement("figure");
        figure.className = "related-photo-card related-reference-card";
        if (item.variant === "president") {
          figure.classList.add("related-reference-card--president");
        }
        figure.append(createImageViewerTrigger(item, "related-reference-card__image"));
        const caption = document.createElement("figcaption");
        const title = document.createElement("strong");
        title.textContent = item.title;
        caption.append(title);
        figure.append(caption);
        fragment.append(figure);
      });
      grid.replaceChildren(fragment);
    }

    const links = document.querySelector("[data-related-reference-links]");
    if (links && Array.isArray(data?.links)) {
      const fragment = document.createDocumentFragment();
      data.links.forEach((item) => {
        if (!item?.url || !item?.label) return;
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = item.label;
        setExternalLinkAttributes(link);
        fragment.append(link);
      });
      links.replaceChildren(fragment);
    }

    const classPhoto = document.querySelector("[data-related-class-photo]");
    if (classPhoto && data?.classPhoto?.src) {
      classPhoto.replaceChildren(
        createImageViewerTrigger(data.classPhoto, "related-class-photo__button"),
      );
    }
  }

  function renderWorkGallery(data) {
    const title = document.getElementById("works-title");
    if (title && data?.title) title.textContent = data.title;

    const toolbar = document.querySelector("[data-work-toolbar]");
    if (toolbar && Array.isArray(data?.filters)) {
      const filters = document.createElement("div");
      filters.className = "work-gallery__filters";
      filters.setAttribute("role", "list");
      data.filters.forEach((item, index) => {
        const button = document.createElement("button");
        button.className = `work-gallery__filter${index === 0 ? " is-active" : ""}`;
        button.type = "button";
        button.dataset.workFilter = item.value;
        button.setAttribute("aria-pressed", String(index === 0));
        button.textContent = item.label;
        filters.append(button);
      });

      const search = document.createElement("label");
      search.className = "work-gallery__search";
      const searchLabel = document.createElement("span");
      searchLabel.className = "visually-hidden";
      searchLabel.textContent = data.searchLabel || "搜尋作品";
      const input = document.createElement("input");
      input.type = "search";
      input.dataset.workSearch = "";
      input.placeholder = data.searchPlaceholder || "";
      input.autocomplete = "off";
      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "search";
      search.append(searchLabel, input, icon);
      toolbar.replaceChildren(filters, search);
    }

    const grid = document.querySelector("[data-work-grid]");
    if (grid && Array.isArray(data?.items)) {
      const fragment = document.createDocumentFragment();
      data.items.forEach((item) => {
        const article = document.createElement("article");
        article.className = `work-gallery__item work-gallery__item--${item.layout || "landscape"}`;
        article.dataset.workCategory = item.category || "";
        article.dataset.workKeywords = item.keywords || "";
        if (item.src) {
          const media = item.type === "video"
            ? document.createElement("video")
            : document.createElement("img");
          media.src = item.src;
          if (media instanceof HTMLImageElement) media.alt = item.alt || "";
          if (media instanceof HTMLVideoElement) {
            media.muted = true;
            media.loop = true;
            media.playsInline = true;
          }
          article.append(media);
        } else {
          const placeholder = document.createElement("span");
          placeholder.className = "material-symbols-outlined work-gallery__placeholder-icon";
          placeholder.setAttribute("aria-hidden", "true");
          placeholder.textContent = "image";
          article.append(placeholder);
        }
        fragment.append(article);
      });
      grid.replaceChildren(fragment);
    }

    const empty = document.querySelector("[data-work-empty]");
    if (empty && data?.emptyMessage) empty.textContent = data.emptyMessage;
  }

  async function loadPageContent() {
    try {
      const response = await fetch("data/page-content.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      renderSiteContent(data.siteContent);
      renderThemeAssets(data.themeAssets);
      renderEntrance(data.entrance);
      renderHeroMedia(data.heroMedia);
      renderPartners(data.partners);
      renderRelatedReferences(data.relatedReferences);
      renderWorkGallery(data.workGallery);
      document.dispatchEvent(new CustomEvent("page-content:ready"));
    } catch (error) {
      console.error("Unable to load page content.", error);
      document.dispatchEvent(new CustomEvent("page-content:error"));
    }
  }

  window.pageContentReady = loadPageContent();
})();
