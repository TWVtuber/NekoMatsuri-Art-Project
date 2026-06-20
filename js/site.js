// Discourage casual image saving and access to browser developer shortcuts.
// This is a client-side deterrent only: anything delivered to a browser can
// still be recovered by a determined visitor.
const blockedDeveloperShortcuts = new Set(["i", "j", "c"]);

document.addEventListener(
  "contextmenu",
  (event) => {
    event.preventDefault();
  },
  { capture: true },
);

// document.addEventListener(
//   "keydown",
//   (event) => {
//     const key = event.key.toLowerCase();
//     const opensDeveloperTools =
//       event.key === "F12" ||
//       ((event.ctrlKey || event.metaKey) &&
//         event.shiftKey &&
//         blockedDeveloperShortcuts.has(key));
//     const opensPageSource =
//       (event.ctrlKey || event.metaKey) && (key === "u" || key === "s");

//     if (opensDeveloperTools || opensPageSource) {
//       event.preventDefault();
//       event.stopImmediatePropagation();
//     }
//   },
//   { capture: true },
// );

document.addEventListener(
  "dragstart",
  (event) => {
    if (event.target instanceof HTMLImageElement) event.preventDefault();
  },
  { capture: true },
);

document.querySelectorAll("img").forEach((image) => {
  image.draggable = false;
});

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

if (window.location.hash) {
  history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
}

function resetInitialScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function scheduleInitialScrollReset() {
  resetInitialScroll();
  requestAnimationFrame(() => requestAnimationFrame(resetInitialScroll));
  window.setTimeout(resetInitialScroll, 100);
}

scheduleInitialScrollReset();
window.addEventListener("pageshow", scheduleInitialScrollReset, { once: true });
window.addEventListener("load", scheduleInitialScrollReset, { once: true });

const artboard = document.getElementById("home-artboard");
const stage = document.querySelector(".home-stage");
const logoMotion = document.getElementById("logo-motion");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const entranceImages = [...stage.querySelectorAll("img")];

function waitForImages() {
  return Promise.all(
    entranceImages.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }),
  );
}

function sizeArtboard() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const useCover = window.matchMedia("(max-width: 820px)").matches;
  const backgroundScale = Math.max(width / 1920, height / 1080);
  const artboardWidth = 1920 * backgroundScale;
  const artboardHeight = 1080 * backgroundScale;
  artboard.style.width = `${artboardWidth}px`;
  artboard.style.height = `${artboardHeight}px`;

  const submitBtn = stage.querySelector('.submit-button');
  // fallback to height * 0.76 if button not found
  const buttonTop = submitBtn ? submitBtn.offsetTop : height * 0.76;

  let logoScale;
  let logoLeft;
  let logoTop;
  if (useCover) {
    logoScale = Math.min((width * 0.94) / 974, (height * 0.58) / 719);
    logoLeft = (width - 949 * logoScale) / 2;
    // Anchor to button. Push down dynamically for smaller screens to avoid the face.
    logoTop = Math.max(20, buttonTop - 679.8 * logoScale + (1 - logoScale) * 90);
  } else {
    logoScale = Math.min(width / 1920, height / 1080);
    // Restore the exact 1920x1080 horizontal visual center
    logoLeft = (width - 974 * logoScale) / 2 + 12.5 * logoScale;
    
    // Anchor to button. Push down dynamically for smaller screens.
    // At 1920x1080 (logoScale=1), it perfectly matches original logoTop (141).
    logoTop = buttonTop - 679.8 * logoScale + (1 - logoScale) * 90;
  }
  Object.assign(logoMotion.style, {
    left: `${logoLeft}px`,
    top: `${logoTop}px`,
    width: `${974 * logoScale}px`,
    height: `${719 * logoScale}px`,
  });
}

let hopTimer;
function scheduleHop() {
  if (reduceMotion.matches) return;
  hopTimer = window.setTimeout(
    () => {
      logoMotion.classList.add("is-hopping");
      logoMotion.addEventListener(
        "animationend",
        () => {
          logoMotion.classList.remove("is-hopping");
          scheduleHop();
        },
        { once: true },
      );
    },
    3600 + Math.random() * 4200,
  );
}

waitForImages().then(() =>
  requestAnimationFrame(() => {
    sizeArtboard();
    stage.classList.add("is-playing");
    window.setTimeout(scheduleHop, 2900);
  }),
);
new ResizeObserver(sizeArtboard).observe(stage);
reduceMotion.addEventListener("change", () => {
  clearTimeout(hopTimer);
  logoMotion.classList.remove("is-hopping");
  if (!reduceMotion.matches) scheduleHop();
});

const activity = document.getElementById("activity");
new IntersectionObserver(
  ([entry]) => {
    document.body.classList.toggle("activity-visible", entry.isIntersecting);
  },
  { threshold: 0.015 },
).observe(activity);

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-navigation");
const mobileNavQuery = window.matchMedia("(max-width: 820px)");

function setMobileNavOpen(isOpen) {
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "關閉導覽列" : "開啟導覽列");
  siteNav.classList.toggle("is-open", isOpen);
}

navToggle.addEventListener("click", () => {
  setMobileNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a") && mobileNavQuery.matches) {
    setMobileNavOpen(false);
  }
});

document.addEventListener("click", (event) => {
  if (
    mobileNavQuery.matches &&
    siteNav.classList.contains("is-open") &&
    !event.target.closest(".site-header__inner")
  ) {
    setMobileNavOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
    setMobileNavOpen(false);
    navToggle.focus();
  }
});

mobileNavQuery.addEventListener("change", () => setMobileNavOpen(false));

const sectionNavLinks = [
  ...document.querySelectorAll(
    '.site-nav a[href^="#"]:not([data-faq-link]):not([data-organizer-link])',
  ),
]
  .map((link) => ({
    link,
    section: document.querySelector(link.getAttribute("href")),
  }))
  .filter(({ section }) => section);
const faqNavLink = document.querySelector(".site-nav [data-faq-link]");
const organizerNavLink = document.querySelector(
  ".site-nav [data-organizer-link]",
);

function setActiveNav(activeLink) {
  [...sectionNavLinks.map(({ link }) => link), organizerNavLink, faqNavLink]
    .filter(Boolean)
    .forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
}

let navScrollFrame;
function updateActiveNav() {
  navScrollFrame = null;
  if (document.body.classList.contains("faq-open")) {
    setActiveNav(faqNavLink);
    return;
  }
  if (document.body.classList.contains("organizer-open")) {
    setActiveNav(organizerNavLink);
    return;
  }

  const marker = window.innerHeight * 0.35;
  const orderedSections = [...sectionNavLinks].sort(
    (a, b) =>
      a.section.getBoundingClientRect().top -
      b.section.getBoundingClientRect().top,
  );
  const active = orderedSections.reduce(
    (current, item) =>
      item.section.getBoundingClientRect().top <= marker ? item : current,
    orderedSections[0],
  );
  setActiveNav(active?.link);
}

function scheduleActiveNavUpdate() {
  if (!navScrollFrame) navScrollFrame = requestAnimationFrame(updateActiveNav);
}

window.addEventListener("scroll", scheduleActiveNavUpdate, { passive: true });
window.addEventListener("resize", scheduleActiveNavUpdate);
scheduleActiveNavUpdate();

const deadline = new Date("2026-07-19T23:59:00+08:00");
function updateCountdown() {
  const difference = Math.max(0, deadline.getTime() - Date.now());
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(
    2,
    "0",
  );
  document.getElementById("seconds").textContent = String(seconds).padStart(
    2,
    "0",
  );
  if (difference === 0)
    document.getElementById("countdown-title").textContent = "本次投稿已截止";
}

updateCountdown();
setInterval(updateCountdown, 1000);
document.getElementById("current-year").textContent = new Date().getFullYear();

const faqView = document.getElementById("faq");
const organizerView = document.getElementById("organizers");
const faqLinks = [...document.querySelectorAll("[data-faq-link]")];
const organizerLinks = [...document.querySelectorAll("[data-organizer-link]")];
const faqBackButtons = [...document.querySelectorAll("[data-faq-back]")];
const organizerBackButtons = [
  ...document.querySelectorAll("[data-organizer-back]"),
];
let faqReturnHash = "#activity";
let organizerReturnHash = "#activity";

document.querySelectorAll(".faq-card").forEach((card, index) => {
  const heading = card.querySelector("h2");
  const answer = card.querySelector("p");
  const answerId = `faq-answer-${index + 1}`;
  const questionContent = heading.innerHTML;

  answer.id = answerId;
  answer.hidden = true;
  heading.innerHTML = `<button class="faq-question" type="button" aria-expanded="false" aria-controls="${answerId}">${questionContent}</button>`;

  heading.querySelector(".faq-question").addEventListener("click", (event) => {
    const question = event.currentTarget;
    const willOpen = question.getAttribute("aria-expanded") !== "true";
    question.setAttribute("aria-expanded", String(willOpen));
    card.classList.toggle("is-open", willOpen);
    answer.hidden = !willOpen;
  });
});

function showFaq(updateHistory = true) {
  if (
    !document.body.classList.contains("faq-open") &&
    window.location.hash !== "#faq"
  ) {
    faqReturnHash = window.location.hash || "#activity";
  }
  document.body.classList.add("faq-open", "activity-visible");
  document.body.classList.remove("organizer-open");
  organizerView.hidden = true;
  faqView.hidden = false;
  if (updateHistory && window.location.hash !== "#faq")
    history.pushState({ faq: true }, "", "#faq");
  document.title = `常見問題｜${document.title.replace(/^(常見問題|主辦單位介紹)｜/, "")}`;
  setActiveNav(faqNavLink);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function showOrganizer(updateHistory = true) {
  if (
    !document.body.classList.contains("organizer-open") &&
    window.location.hash !== "#organizers"
  ) {
    organizerReturnHash = window.location.hash || "#activity";
  }
  document.body.classList.remove("faq-open");
  document.body.classList.add("organizer-open", "activity-visible");
  faqView.hidden = true;
  organizerView.hidden = false;
  if (updateHistory && window.location.hash !== "#organizers") {
    history.pushState({ organizers: true }, "", "#organizers");
  }
  document.title = `主辦單位介紹｜${document.title.replace(/^(常見問題|主辦單位介紹)｜/, "")}`;
  setActiveNav(organizerNavLink);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function hideFaq(targetHash = faqReturnHash, updateHistory = true) {
  document.body.classList.remove("faq-open");
  faqView.hidden = true;
  document.title = document.title.replace(/^常見問題｜/, "");
  if (updateHistory) history.pushState(null, "", targetHash);
  requestAnimationFrame(() => {
    document.querySelector(targetHash)?.scrollIntoView({ behavior: "auto" });
    scheduleActiveNavUpdate();
  });
}

function hideOrganizer(targetHash = organizerReturnHash, updateHistory = true) {
  document.body.classList.remove("organizer-open");
  organizerView.hidden = true;
  document.title = document.title.replace(/^主辦單位介紹｜/, "");
  if (updateHistory) history.pushState(null, "", targetHash);
  requestAnimationFrame(() => {
    document.querySelector(targetHash)?.scrollIntoView({ behavior: "auto" });
    scheduleActiveNavUpdate();
  });
}

faqLinks.forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showFaq();
  }),
);

faqBackButtons.forEach((button) =>
  button.addEventListener("click", () => history.back()),
);
organizerLinks.forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showOrganizer();
  }),
);
organizerBackButtons.forEach((button) =>
  button.addEventListener("click", () => history.back()),
);

document
  .querySelectorAll(
    '.site-header a[href^="#"]:not([data-faq-link]):not([data-organizer-link])',
  )
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        !document.body.classList.contains("faq-open") &&
        !document.body.classList.contains("organizer-open")
      )
        return;
      event.preventDefault();
      const targetHash = link.getAttribute("href");
      if (document.body.classList.contains("faq-open")) hideFaq(targetHash);
      else hideOrganizer(targetHash);
    });
  });

window.addEventListener("popstate", () => {
  if (window.location.hash === "#faq") showFaq(false);
  else if (window.location.hash === "#organizers") showOrganizer(false);
  else if (document.body.classList.contains("faq-open"))
    hideFaq(window.location.hash || "#activity", false);
  else if (document.body.classList.contains("organizer-open"))
    hideOrganizer(window.location.hash || "#activity", false);
});
