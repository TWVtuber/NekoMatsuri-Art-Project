(() => {
  const viewer = document.getElementById("image-viewer");
  const viewport = document.getElementById("image-viewer-viewport");
  const image = document.getElementById("image-viewer-image");
  const title = document.getElementById("image-viewer-title");
  const description = document.getElementById("image-viewer-description");
  const zoomLabel = document.getElementById("image-viewer-zoom");

  if (!viewer || !viewport || !image || !title || !description || !zoomLabel) {
    return;
  }

  const minScale = 1;
  const maxScale = 6;
  const zoomStep = 0.25;
  const pointers = new Map();
  let scale = minScale;
  let translateX = 0;
  let translateY = 0;
  let returnFocus = null;
  let lastSinglePoint = null;
  let lastPinch = null;

  const clamp = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value));

  function constrainTranslation() {
    if (scale <= minScale) {
      translateX = 0;
      translateY = 0;
      return;
    }

    const scaledWidth = image.offsetWidth * scale;
    const scaledHeight = image.offsetHeight * scale;
    const maxX = Math.max(0, (scaledWidth - viewport.clientWidth) / 2 + 32);
    const maxY = Math.max(0, (scaledHeight - viewport.clientHeight) / 2 + 32);
    translateX = clamp(translateX, -maxX, maxX);
    translateY = clamp(translateY, -maxY, maxY);
  }

  function applyTransform() {
    constrainTranslation();
    image.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
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

  function openViewer(trigger) {
    returnFocus = trigger;
    title.textContent = trigger.dataset.imageViewerTitle || "圖片預覽";
    const body = trigger.dataset.imageViewerDescription || "";
    description.textContent = body;
    description.hidden = !body;
    image.alt = title.textContent;
    image.src = trigger.dataset.imageViewerSrc;
    viewer.hidden = false;
    document.body.classList.add("image-viewer-open");
    resetTransform();
    image.addEventListener("load", resetTransform, { once: true });
    requestAnimationFrame(() => viewport.focus({ preventScroll: true }));
  }

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    document.body.classList.remove("image-viewer-open");
    pointers.clear();
    lastPinch = null;
    lastSinglePoint = null;
    image.removeAttribute("style");
    image.src = "";
    returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
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
    const trigger = event.target.closest("[data-image-viewer-src]");
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
    zoomTo(scale > minScale ? minScale : 2, event.clientX, event.clientY);
  });

  viewport.addEventListener("pointerdown", (event) => {
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

  document.addEventListener("keydown", (event) => {
    if (viewer.hidden) return;
    if (event.key === "Tab") {
      const focusable = [
        ...viewer.querySelectorAll(
          '.image-viewer__close, .image-viewer__viewport, .image-viewer__toolbar button',
        ),
      ];
      const currentIndex = focusable.indexOf(document.activeElement);
      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + focusable.length) % focusable.length
        : (currentIndex + 1) % focusable.length;
      event.preventDefault();
      focusable[nextIndex]?.focus();
    } else if (event.key === "Escape") closeViewer();
    else if (event.key === "+" || event.key === "=") {
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
