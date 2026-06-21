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
const pvModal = document.getElementById("pv-modal");
const pvModalClose = document.getElementById("pv-modal-close");
const pvModalIframe = document.getElementById("pv-modal-iframe");
const pvModalSoundIcon = document.getElementById("pv-modal-sound-icon");
const pvModalSoundText = document.getElementById("pv-modal-sound-text");
const activityRoot = document.getElementById("activity");
let entranceAssetsReady = false;
let pvModalClosed = !pvModal;
let entranceStarted = false;
let pvReturnFocus = null;

function sendPvCommand(command, args = []) {
  if (!pvModalIframe?.contentWindow || pvModalClosed) return;
  pvModalIframe.contentWindow.postMessage(
    JSON.stringify({ event: "command", func: command, args }),
    "*",
  );
}

function requestPvAutoplay() {
  if (pvModal?.classList.contains("is-closing")) return;
  sendPvCommand("mute");
  sendPvCommand("playVideo");
}

function setPvSoundNote(hasSound) {
  if (pvModalSoundIcon) {
    pvModalSoundIcon.textContent = hasSound ? "volume_up" : "volume_off";
  }
  if (pvModalSoundText) {
    pvModalSoundText.textContent = hasSound
      ? "目前為有聲播放，可由播放器調整音量"
      : "已靜音自動播放，點擊播放器可開啟聲音";
  }
}

function openPvModal({ withSound = false, restart = false, returnFocus = null } = {}) {
  if (!pvModal || !pvModalIframe) return;

  pvReturnFocus = returnFocus;
  pvModalClosed = false;
  pvModal.hidden = false;
  pvModal.classList.remove("is-closing");
  pvModal.removeAttribute("aria-hidden");
  document.body.classList.add("pv-is-open");
  stage.inert = true;
  stage.setAttribute("aria-hidden", "true");
  activityRoot.inert = true;
  activityRoot.setAttribute("aria-hidden", "true");
  pvModal.focus({ preventScroll: true });

  if (restart) sendPvCommand("seekTo", [0, true]);
  sendPvCommand(withSound ? "unMute" : "mute");
  sendPvCommand("playVideo");
  setPvSoundNote(withSound);
}

if (pvModalIframe) {
  pvModalIframe.addEventListener("load", () => {
    requestPvAutoplay();
    window.setTimeout(requestPvAutoplay, 500);
    window.setTimeout(requestPvAutoplay, 1500);
  });
}

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
  const useDesktop = width >= 1200;
  const useLaptop = width >= 1024 && width < 1200;
  const useTablet = width >= 600 && width < 1024;
  const useCover = width < 1024;
  const backgroundScale = Math.max(width / 1920, height / 1080);
  const artboardWidth = 1920 * backgroundScale;
  const artboardHeight = 1080 * backgroundScale;
  artboard.style.width = `${artboardWidth}px`;
  artboard.style.height = `${artboardHeight}px`;

  const submitBtn = stage.querySelector('.submit-button');
  // fallback to height * 0.76 if button not found
  const buttonTop = submitBtn ? submitBtn.offsetTop : height * 0.76;
  const logoStyle = window.getComputedStyle(logoMotion);
  const marginTop = parseFloat(logoStyle.marginTop) || 0;

  const maxLogoRatio =
    width < 600 ? 0.8 : useTablet ? 0.72 : useLaptop ? 0.62 : 0.5;
  const topSafePadding = useCover ? 24 : 48;
  const logoButtonGap = width < 600 ? 32 : width < 1024 ? 40 : 48;
  const safeAreaBottom = Math.max(
    topSafePadding + 160,
    buttonTop - logoButtonGap,
  );
  const safeAreaHeight = safeAreaBottom - topSafePadding;
  const maxLogoScaleByWidth = (width * maxLogoRatio) / 974;
  const maxLogoScaleByHeight = safeAreaHeight / 719;
  const logoScale = Math.min(maxLogoScaleByWidth, maxLogoScaleByHeight);
  const logoWidth = 974 * logoScale;
  const logoHeight = 719 * logoScale;
  const logoLeft = (width - logoWidth) / 2;
  const logoVisualOffset =
    width < 600
      ? height * 0.1
      : useTablet
        ? height * 0.14
        : useLaptop
          ? height * 0.14
          : 0;
  const preferredLogoTop = useDesktop
    ? (height - logoHeight) / 2
    : topSafePadding + (safeAreaHeight - logoHeight) / 2 + logoVisualOffset;
  const minLogoTop = topSafePadding;
  const maxLogoTop = safeAreaBottom - logoHeight;
  const logoTop =
    Math.min(Math.max(preferredLogoTop, minLogoTop), maxLogoTop) - marginTop;
  Object.assign(logoMotion.style, {
    left: `${logoLeft}px`,
    top: `${logoTop}px`,
    width: `${logoWidth}px`,
    height: `${logoHeight}px`,
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

function startEntranceAnimation() {
  if (!entranceAssetsReady || !pvModalClosed || entranceStarted) return;
  entranceStarted = true;
  requestAnimationFrame(() => {
    sizeArtboard();
    stage.classList.add("is-playing");
    window.setTimeout(scheduleHop, 2900);
  });
}

function closePvModal() {
  if (!pvModal || pvModalClosed || pvModal.classList.contains("is-closing")) return;

  sendPvCommand("pauseVideo");
  pvModal.classList.add("is-closing");
  pvModal.setAttribute("aria-hidden", "true");

  const closeDuration = reduceMotion.matches ? 0 : 360;
  window.setTimeout(() => {
    pvModal.hidden = true;
    document.body.classList.remove("pv-is-open");
    stage.inert = false;
    stage.removeAttribute("aria-hidden");
    activityRoot.inert = false;
    activityRoot.removeAttribute("aria-hidden");
    pvModalClosed = true;
    startEntranceAnimation();
    if (pvReturnFocus?.isConnected) pvReturnFocus.focus({ preventScroll: true });
    pvReturnFocus = null;
  }, closeDuration);
}

if (pvModal && pvModalClose) {
  pvModalClose.addEventListener("click", closePvModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !pvModalClosed) closePvModal();
  });
  requestAnimationFrame(() => pvModal.focus({ preventScroll: true }));
}

waitForImages().then(() => {
  entranceAssetsReady = true;
  sizeArtboard();
  startEntranceAnimation();
});
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

const heroDeclaration = document.querySelector(".hero-declaration");
if (heroDeclaration) {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    heroDeclaration.classList.add("is-circle-drawn");
  } else {
    const heroDeclarationObserver = new IntersectionObserver(
      ([entry]) => {
        heroDeclaration.classList.toggle("is-circle-drawn", entry.isIntersecting);
      },
      { threshold: 0.45 },
    );
    heroDeclarationObserver.observe(heroDeclaration);
  }
}

const highlighterMarks = [
  ...document.querySelectorAll(
    ".hero-lead, .hero-closing, .check-list b, .rule-list b, .reward-policy__list b",
  ),
];

highlighterMarks.forEach((mark) => {
  mark.classList.add("marker-highlight");
  const finalAlpha = getComputedStyle(mark).getPropertyValue("--marker-alpha").trim();
  mark.style.setProperty("--marker-final-alpha", finalAlpha || "1");
});

document.body.classList.add("marker-motion-ready");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  highlighterMarks.forEach((mark) => mark.classList.add("is-marked"));
} else {
  const highlighterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-marked", entry.isIntersecting);
      });
    },
    { threshold: 0.01, rootMargin: "0px 0px -2% 0px" },
  );

  // Let the browser paint the zero-width strokes before observing them.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      highlighterMarks.forEach((mark) => highlighterObserver.observe(mark));
    });
  });
}

const sectionMascots = [...document.querySelectorAll(".section-mascot")];

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  sectionMascots.forEach((mascot) => mascot.classList.add("is-visible"));
} else {
  document.body.classList.add("mascot-motion-ready");

  const mascotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.01 },
  );

  // Paint the hidden state first so every re-entry produces a visible fade.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sectionMascots.forEach((mascot) => mascotObserver.observe(mascot));
    });
  });
}

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-navigation");
const mobileNavQuery = window.matchMedia("(max-width: 1023.95px)");

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

// Reopen the themed PV modal from the activity photo.
const pvOverlay = document.getElementById('pv-overlay');

if (pvOverlay) {
  pvOverlay.addEventListener('click', () => {
    openPvModal({ withSound: true, restart: true, returnFocus: pvOverlay });
  });
}

const hashtagCopyStatus = document.getElementById('hashtag-copy-status');

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy command failed');
}

document.querySelectorAll('[data-copy-hashtag]').forEach((button) => {
  button.addEventListener('click', async () => {
    const hashtag = button.dataset.copyHashtag;
    const label = button.querySelector('.hashtag-copy-label');
    const icon = button.querySelector('.material-symbols-outlined');
    if (label && !label.dataset.defaultLabel) {
      label.dataset.defaultLabel = label.textContent;
    }
    try {
      await copyText(hashtag);
      if (label) label.textContent = '已複製';
      if (icon) icon.textContent = 'done';
      if (hashtagCopyStatus) hashtagCopyStatus.textContent = `已複製 ${hashtag}`;
      window.setTimeout(() => {
        if (label) label.textContent = label.dataset.defaultLabel;
        if (icon) icon.textContent = 'content_copy';
      }, 1600);
    } catch {
      if (hashtagCopyStatus) hashtagCopyStatus.textContent = '複製失敗，請手動複製 Hashtag';
    }
  });
});

const academyModal = document.getElementById('academy-modal');
const academyModalTrigger = document.getElementById('academy-info-trigger');
const academyModalClose = document.getElementById('academy-modal-close');
const academyPresidentLink = document.getElementById('academy-president-link');

function openAcademyModal() {
  if (!academyModal) return;
  academyModal.hidden = false;
  document.body.classList.add('academy-is-open');
  activityRoot.inert = true;
  activityRoot.setAttribute('aria-hidden', 'true');
  stage.inert = true;
  stage.setAttribute('aria-hidden', 'true');
  academyModal.focus({ preventScroll: true });
  academyModalClose?.focus({ preventScroll: true });
}

function closeAcademyModal({ restoreFocus = true } = {}) {
  if (!academyModal || academyModal.hidden) return;
  academyModal.hidden = true;
  document.body.classList.remove('academy-is-open');
  activityRoot.inert = false;
  activityRoot.removeAttribute('aria-hidden');
  stage.inert = false;
  stage.removeAttribute('aria-hidden');
  if (restoreFocus) academyModalTrigger?.focus({ preventScroll: true });
}

academyModalTrigger?.addEventListener('click', openAcademyModal);
academyModalClose?.addEventListener('click', closeAcademyModal);
academyModal?.querySelector('[data-academy-close]')?.addEventListener('click', closeAcademyModal);
academyPresidentLink?.addEventListener('click', (event) => {
  event.preventDefault();
  closeAcademyModal({ restoreFocus: false });
  showOrganizer();
  requestAnimationFrame(() => {
    document.getElementById('academy-president-message')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });
});
document.addEventListener('keydown', (event) => {
  if (!academyModal || academyModal.hidden) return;
  if (event.key === 'Escape') {
    closeAcademyModal();
    return;
  }
  if (event.key === 'Tab') {
    const focusable = [...academyModal.querySelectorAll('button, a[href]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});
