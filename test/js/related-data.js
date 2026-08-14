(() => {
  let relatedDataTabs = [];
  let relatedDataPanels = [];
  let floatingTabList = null;
  let floatingTabs = [];
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

  function scrollPanelToTop(target) {
    const panel = relatedDataPanels.find(
      (item) => item.dataset.folderPanel === target,
    );
    if (!panel) return;

    requestAnimationFrame(() => {
      const headerHeight =
        document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      const top =
        window.scrollY + panel.getBoundingClientRect().top - headerHeight - 16;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.scrollTo({
        top: Math.max(0, top),
        left: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
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

  function selectRelatedDataTab(tab, focus = false, scrollToPanel = false) {
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

    floatingTabs.forEach((item) => {
      const isSelected = item.dataset.folderTarget === target;
      item.classList.toggle("active-tab", isSelected);
      item.classList.toggle("inactive-tab", !isSelected);
      item.classList.toggle("text-black", isSelected);
      item.classList.toggle("text-on-surface-variant", !isSelected);
      item.setAttribute("aria-selected", String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
    });

    requestAnimationFrame(layoutVisibleGalleries);

    if (scrollToPanel) scrollPanelToTop(target);

    if (focus) tab.focus();
  }

  function initializeFloatingTabs() {
    const sourceTabList = document.querySelector(
      "#related-data [data-related-data-tabs]",
    );
    const section = sourceTabList?.closest(".related-character-section");
    if (!sourceTabList || !section || floatingTabList) return;

    floatingTabList = sourceTabList.cloneNode(true);
    floatingTabList.removeAttribute("data-related-data-tabs");
    floatingTabList.classList.add("related-data-tabs--floating");
    floatingTabList.setAttribute("aria-label", "角色資料快速頁籤");
    floatingTabList.setAttribute("aria-hidden", "true");
    floatingTabList.inert = true;

    floatingTabs = [...floatingTabList.querySelectorAll(".folder-tab")];
    floatingTabs.forEach((tab, index) => {
      tab.removeAttribute("id");
      tab.addEventListener("click", () => {
        const sourceTab = relatedDataTabs.find(
          (item) => item.dataset.folderTarget === tab.dataset.folderTarget,
        );
        if (sourceTab) selectRelatedDataTab(sourceTab, false, true);
      });
      tab.addEventListener("keydown", (event) => {
        if (
          !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(
            event.key,
          )
        ) {
          return;
        }

        event.preventDefault();
        let nextIndex = index;
        if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
          nextIndex = (index - 1 + floatingTabs.length) % floatingTabs.length;
        } else if (["ArrowDown", "ArrowRight"].includes(event.key)) {
          nextIndex = (index + 1) % floatingTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = floatingTabs.length - 1;
        }

        const sourceTab = relatedDataTabs.find(
          (item) =>
            item.dataset.folderTarget === floatingTabs[nextIndex].dataset.folderTarget,
        );
        if (sourceTab) selectRelatedDataTab(sourceTab, false, true);
        floatingTabs[nextIndex].focus();
      });
    });

    section.append(floatingTabList);

    let updateQueued = false;
    const updateFloatingVisibility = () => {
      updateQueued = false;
      const sourceRect = sourceTabList.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const usesSideTabs = window.matchMedia("(max-width: 1023.98px)").matches;
      const sectionEdge = usesSideTabs ? sourceRect.right : sectionRect.left;
      const floatingWidth = floatingTabList.offsetWidth || 44;
      const headerHeight =
        document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      const headerClearance = Math.ceil(headerHeight + 8);
      const availableHeight = Math.max(
        0,
        window.innerHeight - headerClearance - 8,
      );
      const floatingTop = headerClearance + availableHeight / 2;
      const shouldActivate =
        document.body.classList.contains("related-data-open") &&
        sourceRect.top <= headerHeight + 8;

      floatingTabList.classList.remove("is-pinned");
      floatingTabList.style.setProperty(
        "--floating-tabs-header-clearance",
        `${headerClearance}px`,
      );
      floatingTabList.style.setProperty(
        "--floating-tabs-fixed-top",
        `${Math.round(floatingTop)}px`,
      );
      floatingTabList.style.left = `${Math.max(
        0,
        Math.round(sectionEdge - floatingWidth),
      )}px`;
      floatingTabList.classList.toggle("is-visible", shouldActivate);

      const shouldPin =
        shouldActivate &&
        sectionRect.bottom <= floatingTabList.getBoundingClientRect().bottom;
      if (shouldPin) {
        floatingTabList.classList.add("is-pinned");
        floatingTabList.style.left = `${
          usesSideTabs ? -10 : -floatingWidth
        }px`;
      }

      floatingTabList.setAttribute("aria-hidden", String(!shouldActivate));
      floatingTabList.inert = !shouldActivate;
      sourceTabList.classList.toggle("is-floating-source", shouldActivate);
      sourceTabList.setAttribute("aria-hidden", String(shouldActivate));
      sourceTabList.inert = shouldActivate;
    };
    const queueFloatingUpdate = () => {
      if (updateQueued) return;
      updateQueued = true;
      requestAnimationFrame(updateFloatingVisibility);
    };

    window.addEventListener("scroll", queueFloatingUpdate, { passive: true });
    window.addEventListener("resize", queueFloatingUpdate, { passive: true });
    updateFloatingVisibility();
  }

  function initializeRelatedDataTabs() {
    relatedDataTabs = [
      ...document.querySelectorAll("#related-data .folder-tab"),
    ];
    relatedDataPanels = [
      ...document.querySelectorAll("#related-data [data-folder-panel]"),
    ];

    relatedDataTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectRelatedDataTab(tab, false, true));
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
        selectRelatedDataTab(relatedDataTabs[nextIndex], true, true);
      });
    });

    const initialTab =
      relatedDataTabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
      relatedDataTabs[0];
    if (initialTab) selectRelatedDataTab(initialTab);
  }

  document.addEventListener("related-data:ready", () => {
    initializeRelatedDataTabs();
    initializeFloatingTabs();
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
