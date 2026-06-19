const pageFrame = document.getElementById("page-frame");
const tabs = [...document.querySelectorAll("[data-page]")];

const pages = {
    info: "event-info.html",
    announcements: "announcements.html",
    archive: "archive.html",
    gallery: "gallery.html",
    organizers: "organizers.html",
    contact: "contact.html",
};

let frameResizeObserver;

function resizeFrameToContent() {
    const frameDocument = pageFrame.contentDocument;
    if (!frameDocument?.documentElement || !frameDocument.body) return;

    const contentHeight = Math.max(
        frameDocument.documentElement.scrollHeight,
        frameDocument.body?.scrollHeight || 0,
    );

    pageFrame.style.height = `${contentHeight}px`;
}

function connectFrameResize() {
    frameResizeObserver?.disconnect();
    pageFrame.style.height = "1px";

    requestAnimationFrame(() => {
        resizeFrameToContent();

        if (!pageFrame.contentDocument?.documentElement) return;
        frameResizeObserver = new ResizeObserver(resizeFrameToContent);
        frameResizeObserver.observe(pageFrame.contentDocument.documentElement);
    });
}

pageFrame.addEventListener("load", connectFrameResize);

if (pageFrame.contentDocument?.readyState === "complete") {
    connectFrameResize();
}

function openPage(page, updateHistory = true) {
    const selectedPage = pages[page] ? page : "info";

    tabs.forEach((tab) => {
        const isActive = tab.dataset.page === selectedPage;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-current", isActive ? "page" : "false");
    });

    const nextSource = pages[selectedPage];
    if (!pageFrame.src.endsWith(nextSource)) {
        pageFrame.src = nextSource;
    }

    if (updateHistory) {
        history.pushState({ page: selectedPage }, "", `#${selectedPage}`);
    }
}

tabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
        event.preventDefault();
        openPage(tab.dataset.page);
    });
});

window.addEventListener("popstate", () => {
    openPage(location.hash.slice(1), false);
});

openPage(location.hash.slice(1), false);
