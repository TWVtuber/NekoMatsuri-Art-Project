const workGallery = document.querySelector("[data-work-grid]");
const workNavToggle = document.querySelector(".nav-toggle");
const workSiteNav = document.getElementById("site-navigation");
const currentYear = document.getElementById("current-year");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

if (workNavToggle && workSiteNav) {
  workNavToggle.addEventListener("click", () => {
    const isOpen = workNavToggle.getAttribute("aria-expanded") === "true";
    workNavToggle.setAttribute("aria-expanded", String(!isOpen));
    workSiteNav.classList.toggle("is-open", !isOpen);
  });

  workSiteNav.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;

    workNavToggle.setAttribute("aria-expanded", "false");
    workSiteNav.classList.remove("is-open");
  });
}

if (workGallery) {
  const filterButtons = [
    ...document.querySelectorAll("[data-work-filter]"),
  ];
  const searchInput = document.querySelector("[data-work-search]");
  const emptyMessage = document.querySelector("[data-work-empty]");
  const workItems = [...workGallery.querySelectorAll("[data-work-category]")];
  let activeFilter = "all";

  function normalizeText(value) {
    return value.trim().toLowerCase();
  }

  function updateGallery() {
    const query = normalizeText(searchInput?.value || "");
    let visibleCount = 0;

    workItems.forEach((item) => {
      const category = item.dataset.workCategory || "";
      const keywords = normalizeText(item.dataset.workKeywords || "");
      const matchesFilter = activeFilter === "all" || category === activeFilter;
      const matchesSearch = !query || keywords.includes(query);
      const isVisible = matchesFilter && matchesSearch;

      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.workFilter || "all";

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      updateGallery();
    });
  });

  searchInput?.addEventListener("input", updateGallery);
  updateGallery();
}
