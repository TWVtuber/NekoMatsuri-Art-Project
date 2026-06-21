const relatedDataTabs = document.querySelectorAll(
  "#related-data .folder-tab",
);

relatedDataTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    relatedDataTabs.forEach((item) => {
      item.classList.remove("active-tab", "text-black");
      item.classList.add("inactive-tab", "text-on-surface-variant");
      item.setAttribute("aria-selected", "false");
    });

    tab.classList.remove("inactive-tab", "text-on-surface-variant");
    tab.classList.add("active-tab", "text-black");
    tab.setAttribute("aria-selected", "true");
  });
});
