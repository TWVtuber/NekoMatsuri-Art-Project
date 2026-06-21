const relatedDataTabs = [
  ...document.querySelectorAll("#related-data .folder-tab"),
];
const relatedDataPanels = [
  ...document.querySelectorAll("#related-data [data-folder-panel]"),
];

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

  if (focus) tab.focus();
}

relatedDataTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectRelatedDataTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

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

const initialRelatedDataTab =
  relatedDataTabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
  relatedDataTabs[0];

if (initialRelatedDataTab) selectRelatedDataTab(initialRelatedDataTab);
