(() => {
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
