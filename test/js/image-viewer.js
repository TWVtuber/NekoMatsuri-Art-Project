(() => {
  const viewer = document.getElementById("image-viewer");
  const viewport = document.getElementById("image-viewer-viewport");
  const image = document.getElementById("image-viewer-image");
  const video = document.getElementById("image-viewer-video");
  const title = document.getElementById("image-viewer-title");
  const description = document.getElementById("image-viewer-description");
  const descriptionText = document.getElementById(
    "image-viewer-description-text",
  );
  const sourceLink = document.getElementById("image-viewer-source-link");
  const artist = document.getElementById("image-viewer-artist");
  const zoomLabel = document.getElementById("image-viewer-zoom");
  const previousButton = viewer?.querySelector("[data-image-viewer-previous]");
  const nextButton = viewer?.querySelector("[data-image-viewer-next]");
  const galleryCount = viewer?.querySelector("[data-image-viewer-count]");
  const judges = viewer?.querySelector("[data-image-viewer-judges]");
  const judgeList = viewer?.querySelector("[data-image-viewer-judge-list]");
  const reviewPanel = viewer?.querySelector("[data-image-viewer-review]");
  const reviewClose = viewer?.querySelector("[data-image-viewer-review-close]");
  const reviewAvatar = viewer?.querySelector("[data-image-viewer-review-avatar]");
  const reviewName = viewer?.querySelector("[data-image-viewer-review-name]");
  const reviewText = viewer?.querySelector("[data-image-viewer-review-text]");

  if (
    !viewer ||
    !viewport ||
    !image ||
    !video ||
    !title ||
    !description ||
    !descriptionText ||
    !sourceLink ||
    !artist ||
    !zoomLabel
  ) {
    return;
  }

  const defaultMinScale = 1;
  const maxScale = 6;
  const zoomStep = 0.25;
  const pointers = new Map();
  let minScale = defaultMinScale;
  let scale = minScale;
  let translateX = 0;
  let translateY = 0;
  let returnFocus = null;
  let lastSinglePoint = null;
  let lastPinch = null;
  let activeMedia = image;
  let galleryItems = [];
  let galleryIndex = 0;

  const clamp = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value));

  function constrainTranslation() {
    if (scale <= minScale) {
      translateX = 0;
      translateY = 0;
      return;
    }

    const scaledWidth = activeMedia.offsetWidth * scale;
    const scaledHeight = activeMedia.offsetHeight * scale;
    const maxX = Math.max(0, (scaledWidth - viewport.clientWidth) / 2 + 32);
    const maxY = Math.max(0, (scaledHeight - viewport.clientHeight) / 2 + 32);
    translateX = clamp(translateX, -maxX, maxX);
    translateY = clamp(translateY, -maxY, maxY);
  }

  function applyTransform() {
    constrainTranslation();
    activeMedia.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    viewport.classList.toggle("is-zoomed", scale > minScale);
  }

  function resetTransform() {
    scale = minScale;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function zoomTo(nextScale, clientX, clientY) {
    const targetScale = clamp(nextScale, minScale, maxScale);
    if (targetScale === scale) return;

    const rect = viewport.getBoundingClientRect();
    const focusX =
      typeof clientX === "number"
        ? clientX - (rect.left + rect.width / 2)
        : 0;
    const focusY =
      typeof clientY === "number"
        ? clientY - (rect.top + rect.height / 2)
        : 0;
    const imagePointX = (focusX - translateX) / scale;
    const imagePointY = (focusY - translateY) / scale;

    scale = targetScale;
    translateX = focusX - imagePointX * scale;
    translateY = focusY - imagePointY * scale;
    applyTransform();
  }

  function showGalleryItem(index) {
    if (!galleryItems.length) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const source = galleryItems[galleryIndex];
    const videoSource = /\.(?:mp4|mov|webm)(?:[?#].*)?$/i.test(source) ? source : "";
    activeMedia.removeAttribute("style");
    image.src = "";
    video.pause();
    video.removeAttribute("src");
    activeMedia = videoSource ? video : image;
    image.hidden = Boolean(videoSource);
    video.hidden = !videoSource;
    if (videoSource) {
      video.src = videoSource;
      video.controls = true;
      video.setAttribute("controlslist", "nodownload");
      video.muted = false;
      video.volume = 1;
    } else {
      image.alt = title.textContent;
      image.src = source;
    }
    resetTransform();
    activeMedia.addEventListener(videoSource ? "loadedmetadata" : "load", resetTransform, { once: true });
    const hasMultiple = galleryItems.length > 1;
    if (previousButton) previousButton.hidden = !hasMultiple;
    if (nextButton) nextButton.hidden = !hasMultiple;
    if (galleryCount) {
      galleryCount.hidden = !hasMultiple;
      galleryCount.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
    }
  }

  function openViewer(trigger) {
    returnFocus = trigger;
    const requestedInitialScale = Number.parseFloat(
      trigger.dataset.imageViewerInitialScale || String(defaultMinScale),
    );
    minScale = clamp(
      Number.isFinite(requestedInitialScale) ? requestedInitialScale : defaultMinScale,
      0.25,
      defaultMinScale,
    );
    viewer.classList.toggle(
      "image-viewer--pixel-art",
      trigger.dataset.imageViewerPixelArt !== undefined,
    );
    title.textContent = trigger.dataset.imageViewerTitle || "圖片預覽";
    const body = trigger.dataset.imageViewerDescription || "";
    const link = trigger.dataset.imageViewerLink || "";
    const artistName = trigger.dataset.imageViewerArtistName || "";
    const artistUrl = trigger.dataset.imageViewerArtistUrl || "";
    const artistLabel = trigger.dataset.imageViewerArtistLabel || "繪師";
    const artistsJson = trigger.dataset.imageViewerArtists || "";
    descriptionText.textContent = body;
    sourceLink.href = link || "#";
    sourceLink.hidden = !link;
    description.hidden = !body && !link;
    if (reviewPanel) reviewPanel.hidden = true;

    if (judges && judgeList) {
      judgeList.replaceChildren();
      try {
        const people = JSON.parse(decodeURIComponent(trigger.dataset.imageViewerJudges || "[]"));
        people.forEach((person) => {
          const portrait = document.createElement("button");
          portrait.className = "image-viewer__judge";
          portrait.type = "button";
          portrait.dataset.judgeName = person.name;
          portrait.title = `${person.name}評審講評`;
          portrait.setAttribute("aria-label", `查看${person.name}評審講評`);
          portrait.disabled = !person.comment;
          const portraitImage = document.createElement("img");
          portraitImage.src = person.image;
          portraitImage.alt = person.name;
          portrait.append(portraitImage);
          if (person.comment && reviewPanel && reviewAvatar && reviewName && reviewText) {
            portrait.addEventListener("click", () => {
              judgeList.querySelectorAll(".image-viewer__judge").forEach((button) => {
                button.classList.toggle("is-active", button === portrait);
                button.setAttribute("aria-pressed", String(button === portrait));
              });
              reviewAvatar.src = person.image;
              reviewAvatar.alt = person.name;
              reviewName.textContent = person.name;
              reviewText.textContent = person.comment;
              reviewPanel.hidden = false;
              reviewClose?.focus({ preventScroll: true });
            });
          }
          judgeList.append(portrait);
        });
        judges.hidden = !people.length;
      } catch (error) {
        judges.hidden = true;
      }
    }

    artist.replaceChildren();
    if (artistsJson) {
      try {
        const artists = JSON.parse(decodeURIComponent(artistsJson));
        const fragment = document.createDocumentFragment();
        artists.forEach((a, i) => {
          if (i > 0) fragment.append(" | ");
          if (a.label) fragment.append(`${a.label}：`);
          const linkNode = document.createElement("a");
          linkNode.href = a.url || "#";
          linkNode.target = "_blank";
          linkNode.rel = "noopener noreferrer";
          linkNode.textContent = a.name;
          fragment.append(linkNode);
        });
        artist.append(fragment);
        artist.hidden = false;
      } catch (e) {
        artist.hidden = true;
      }
    } else if (artistName && artistUrl) {
      const fragment = document.createDocumentFragment();
      fragment.append(`${artistLabel}：`);
      const linkNode = document.createElement("a");
      linkNode.href = artistUrl;
      linkNode.target = "_blank";
      linkNode.rel = "noopener noreferrer";
      linkNode.textContent = artistName;
      fragment.append(linkNode);
      artist.append(fragment);
      artist.hidden = false;
    } else {
      artist.hidden = true;
    }
    galleryItems = [];
    if (trigger.dataset.imageViewerGallery) {
      try {
        galleryItems = JSON.parse(decodeURIComponent(trigger.dataset.imageViewerGallery));
      } catch (error) {
        galleryItems = [];
      }
    }
    const directSource = trigger.dataset.imageViewerVideoSrc || trigger.dataset.imageViewerSrc || "";
    if (!galleryItems.length && directSource) galleryItems = [directSource];
    galleryIndex = Number.parseInt(trigger.dataset.imageViewerIndex || "0", 10) || 0;
    viewer.hidden = false;
    document.body.classList.add("image-viewer-open");
    showGalleryItem(galleryIndex);
    requestAnimationFrame(() => viewport.focus({ preventScroll: true }));
  }

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    document.body.classList.remove("image-viewer-open");
    pointers.clear();
    lastPinch = null;
    lastSinglePoint = null;
    activeMedia.removeAttribute("style");
    image.src = "";
    video.pause();
    video.removeAttribute("src");
    video.removeAttribute("poster");
    video.load();
    galleryItems = [];
    if (previousButton) previousButton.hidden = true;
    if (nextButton) nextButton.hidden = true;
    if (galleryCount) galleryCount.hidden = true;
    if (reviewPanel) reviewPanel.hidden = true;
    returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
    minScale = defaultMinScale;
    viewer.classList.remove("image-viewer--pixel-art");
  }

  function getPinchState() {
    const [first, second] = [...pointers.values()];
    if (!first || !second) return null;
    return {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    };
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(
      "[data-image-viewer-src], [data-image-viewer-video-src], [data-image-viewer-gallery]",
    );
    if (!trigger) return;
    event.preventDefault();
    openViewer(trigger);
  });

  viewer.querySelectorAll("[data-image-viewer-close]").forEach((button) => {
    button.addEventListener("click", closeViewer);
  });

  viewer
    .querySelector("[data-image-zoom-in]")
    ?.addEventListener("click", () => zoomTo(scale + zoomStep));
  viewer
    .querySelector("[data-image-zoom-out]")
    ?.addEventListener("click", () => zoomTo(scale - zoomStep));
  viewer
    .querySelector("[data-image-zoom-reset]")
    ?.addEventListener("click", resetTransform);

  function handleGalleryNavigation(event, offset) {
    event.preventDefault();
    event.stopPropagation();
    showGalleryItem(galleryIndex + offset);
  }

  [previousButton, nextButton].forEach((button) => {
    button?.addEventListener("pointerdown", (event) => event.stopPropagation());
  });
  previousButton?.addEventListener("click", (event) =>
    handleGalleryNavigation(event, -1),
  );
  nextButton?.addEventListener("click", (event) =>
    handleGalleryNavigation(event, 1),
  );

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      zoomTo(scale * factor, event.clientX, event.clientY);
    },
    { passive: false },
  );

  viewport.addEventListener("dblclick", (event) => {
    if (event.target === video) return;
    zoomTo(scale > minScale ? minScale : 2, event.clientX, event.clientY);
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.target === video || event.target.closest("button")) return;
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      lastSinglePoint = { x: event.clientX, y: event.clientY };
      viewport.classList.add("is-dragging");
    } else if (pointers.size === 2) {
      lastPinch = getPinchState();
      lastSinglePoint = null;
    }
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2) {
      const pinch = getPinchState();
      if (pinch && lastPinch) {
        translateX += pinch.x - lastPinch.x;
        translateY += pinch.y - lastPinch.y;
        const ratio = lastPinch.distance
          ? pinch.distance / lastPinch.distance
          : 1;
        zoomTo(scale * ratio, pinch.x, pinch.y);
      }
      lastPinch = pinch;
      return;
    }

    if (scale > minScale && lastSinglePoint) {
      translateX += event.clientX - lastSinglePoint.x;
      translateY += event.clientY - lastSinglePoint.y;
      applyTransform();
    }
    lastSinglePoint = { x: event.clientX, y: event.clientY };
  });

  function releasePointer(event) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) lastPinch = null;
    if (pointers.size === 1) {
      const point = [...pointers.values()][0];
      lastSinglePoint = { ...point };
    } else if (pointers.size === 0) {
      lastSinglePoint = null;
      viewport.classList.remove("is-dragging");
    }
  }

  viewport.addEventListener("pointerup", releasePointer);
  viewport.addEventListener("pointercancel", releasePointer);
  video.addEventListener("contextmenu", (event) => event.preventDefault());
  reviewClose?.addEventListener("click", () => {
    if (reviewPanel) reviewPanel.hidden = true;
    const activeJudge = judgeList?.querySelector(".image-viewer__judge.is-active");
    activeJudge?.focus({ preventScroll: true });
    judgeList?.querySelectorAll(".image-viewer__judge").forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (viewer.hidden) return;
    if (event.key === "Tab") {
      const focusable = [
        ...viewer.querySelectorAll(
          '.image-viewer__close, .image-viewer__viewport, .image-viewer__judge:not([disabled]), .image-viewer__review-close, .image-viewer__gallery-nav:not([hidden]), .image-viewer__toolbar button, .image-viewer__caption a:not([hidden])',
        ),
      ];
      const currentIndex = focusable.indexOf(document.activeElement);
      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + focusable.length) % focusable.length
        : (currentIndex + 1) % focusable.length;
      event.preventDefault();
      focusable[nextIndex]?.focus();
    } else if (event.key === "Escape" && reviewPanel && !reviewPanel.hidden) reviewClose?.click();
    else if (event.key === "Escape") closeViewer();
    else if (event.key === "ArrowLeft" && galleryItems.length > 1) {
      event.preventDefault();
      showGalleryItem(galleryIndex - 1);
    } else if (event.key === "ArrowRight" && galleryItems.length > 1) {
      event.preventDefault();
      showGalleryItem(galleryIndex + 1);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomTo(scale + zoomStep);
    } else if (event.key === "-") {
      event.preventDefault();
      zoomTo(scale - zoomStep);
    } else if (event.key === "0") {
      event.preventDefault();
      resetTransform();
    }
  });

  window.addEventListener("resize", applyTransform);
})();
