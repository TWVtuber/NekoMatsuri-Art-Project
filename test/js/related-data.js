(() => {
  let relatedDataTabs = [];
  let relatedDataPanels = [];
  const masonryGap = 22;

  function layoutGallery(grid) {
    const items = grid.querySelectorAll(":scope > .related-profile__gallery-item");

    if (window.matchMedia("(max-width: 767.98px)").matches) {
      items.forEach((item) => item.style.removeProperty("grid-row-end"));
      return;
    }

    items.forEach((item) => {
      item.style.gridRowEnd = `span ${Math.ceil(item.offsetHeight + masonryGap)}`;
    });
  }

  function layoutVisibleGalleries() {
    document
      .querySelectorAll("#related-data .related-profile__gallery > div.is-masonry-layout")
      .forEach((grid) => {
        if (grid.offsetParent !== null) layoutGallery(grid);
      });
  }

  function initializeMasonryGalleries() {
    document
      .querySelectorAll("#related-data .related-profile__gallery > div")
      .forEach((grid) => {
        grid.classList.add("is-masonry-layout");

        grid.querySelectorAll("img").forEach((image) => {
          if (!image.complete) {
            image.addEventListener("load", () => layoutGallery(grid), {
              once: true,
            });
          }
        });

        let previousWidth = 0;
        new ResizeObserver(([entry]) => {
          const width = entry.contentRect.width;
          if (width === previousWidth) return;
          previousWidth = width;
          layoutGallery(grid);
        }).observe(grid);
      });

    layoutVisibleGalleries();
    document.fonts?.ready.then(layoutVisibleGalleries);
  }

  function selectRelatedDataTab(tab, focus = false) {
    const target = tab.dataset.folderTarget;

    relatedDataTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle("active-tab", isSelected);
      item.classList.toggle("inactive-tab", !isSelected);
      item.classList.toggle("text-black", isSelected);
      item.classList.toggle("text-on-surface-variant", !isSelected);
      item.setAttribute("aria-selected", String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
    });

    relatedDataPanels.forEach((panel) => {
      panel.hidden = panel.dataset.folderPanel !== target;
    });

    requestAnimationFrame(layoutVisibleGalleries);

    if (focus) tab.focus();
  }

  function initializeRelatedDataTabs() {
    relatedDataTabs = [
      ...document.querySelectorAll("#related-data .folder-tab"),
    ];
    relatedDataPanels = [
      ...document.querySelectorAll("#related-data [data-folder-panel]"),
    ];

    relatedDataTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectRelatedDataTab(tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + relatedDataTabs.length) % relatedDataTabs.length;
        } else if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % relatedDataTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = relatedDataTabs.length - 1;
        }
        selectRelatedDataTab(relatedDataTabs[nextIndex], true);
      });
    });

    const initialTab =
      relatedDataTabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
      relatedDataTabs[0];
    if (initialTab) selectRelatedDataTab(initialTab);
  }

  document.addEventListener("related-data:ready", () => {
    initializeRelatedDataTabs();
    initializeMasonryGalleries();
  });

  document.getElementById("related-data")?.addEventListener("click", (event) => {
    const link = event.target.closest("[data-related-character-target]");
    if (!link) return;

    event.preventDefault();
    const targetTab = relatedDataTabs.find(
      (tab) => tab.dataset.folderTarget === link.dataset.relatedCharacterTarget,
    );
    if (!targetTab) return;

    selectRelatedDataTab(targetTab, true);
    targetTab.scrollIntoView({ block: "start", behavior: "smooth" });
  });
})();
