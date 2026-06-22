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
const homeBackground = stage?.querySelector(".home-background");
const entranceImages = [...stage.querySelectorAll("img")];
const pvModal = document.getElementById("pv-modal");
const pvModalClose = document.getElementById("pv-modal-close");
const pvModalBackdrop = pvModal?.querySelector(".pv-modal__backdrop");
const pvModalIframe = document.getElementById("pv-modal-iframe");
const pvModalSoundIcon = document.getElementById("pv-modal-sound-icon");
const pvModalSoundText = document.getElementById("pv-modal-sound-text");
const activityRoot = document.getElementById("activity");
let entranceAssetsReady = false;
let pvModalClosed = !pvModal;
let entranceStarted = false;
let pvReturnFocus = null;

function setupHomeParallax() {
  if (!stage || !homeBackground || reduceMotion.matches) return;

  const maxOffset = 9;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let animationFrame = 0;
  let orientationOrigin = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function renderParallax() {
    current.x += (target.x - current.x) * 0.075;
    current.y += (target.y - current.y) * 0.075;
    stage.style.setProperty("--home-parallax-x", current.x.toFixed(3));
    stage.style.setProperty("--home-parallax-y", current.y.toFixed(3));

    if (
      Math.abs(target.x - current.x) > 0.01 ||
      Math.abs(target.y - current.y) > 0.01
    ) {
      animationFrame = requestAnimationFrame(renderParallax);
    } else {
      animationFrame = 0;
    }
  }

  function setTarget(x, y) {
    target.x = clamp(x, -maxOffset, maxOffset);
    target.y = clamp(y, -maxOffset, maxOffset);
    if (!animationFrame) animationFrame = requestAnimationFrame(renderParallax);
  }

  function handlePointerMove(event) {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    setTarget(x * maxOffset * 2, y * maxOffset * 2);
  }

  function handleOrientation(event) {
    if (!Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    if (!orientationOrigin) {
      orientationOrigin = { beta: event.beta, gamma: event.gamma };
      return;
    }

    const gammaDelta = clamp(event.gamma - orientationOrigin.gamma, -15, 15);
    const betaDelta = clamp(event.beta - orientationOrigin.beta, -15, 15);
    const screenAngle = screen.orientation?.angle ?? window.orientation ?? 0;
    let horizontalDelta = gammaDelta;
    let verticalDelta = betaDelta;

    if (screenAngle === 90) {
      horizontalDelta = betaDelta;
      verticalDelta = -gammaDelta;
    } else if (screenAngle === 270 || screenAngle === -90) {
      horizontalDelta = -betaDelta;
      verticalDelta = gammaDelta;
    }

    setTarget(
      (horizontalDelta / 15) * maxOffset,
      (verticalDelta / 15) * maxOffset,
    );
  }

  function enableOrientation() {
    window.addEventListener("deviceorientation", handleOrientation, {
      passive: true,
    });
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    stage.addEventListener("pointermove", handlePointerMove, { passive: true });
    stage.addEventListener("pointerleave", () => setTarget(0, 0));
  } else if ("DeviceOrientationEvent" in window) {
    const requestPermission = DeviceOrientationEvent.requestPermission;
    if (typeof requestPermission === "function") {
      const requestOnFirstTouch = async () => {
        try {
          if ((await requestPermission.call(DeviceOrientationEvent)) === "granted") {
            enableOrientation();
          }
        } catch {
          // Motion permission was declined or is unavailable; the page stays static.
        }
      };
      stage.addEventListener("pointerup", requestOnFirstTouch, { once: true });
    } else {
      enableOrientation();
    }
  }

  reduceMotion.addEventListener("change", (event) => {
    if (!event.matches) return;
    target.x = 0;
    target.y = 0;
    current.x = 0;
    current.y = 0;
    stage.style.setProperty("--home-parallax-x", "0");
    stage.style.setProperty("--home-parallax-y", "0");
  });
}

setupHomeParallax();

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
  pvModalBackdrop?.addEventListener("click", closePvModal);
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
    if (entry.isIntersecting) {
      document.body.classList.add("activity-visible");
    }
  },
  { threshold: 0.015 },
).observe(activity);

function hideHeaderAtPageTop() {
  const isAlternateViewOpen =
    document.body.classList.contains("faq-open") ||
    document.body.classList.contains("organizer-open") ||
    document.body.classList.contains("related-data-open");

  if (window.scrollY <= 1 && !isAlternateViewOpen) {
    document.body.classList.remove("activity-visible");
  }
}

window.addEventListener("scroll", hideHeaderAtPageTop, { passive: true });

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

const heroZoomTargets = [...document.querySelectorAll(".page-content .hero-photo")];
const cardPopTargets = [
  ...document.querySelectorAll(
    [
      ".page-content .countdown-card",
      ".page-content .reward-policy",
      ".page-content .paper-card:not(.hero-copy):not(.reward-policy__paper):not(.common-awards-sheet)",
      ".page-content .faq-card",
      ".page-content .paper-sheet",
    ].join(", "),
  ),
].filter((target, index, targets) => targets.indexOf(target) === index);
const sectionBackgroundTargets = [
  ...document.querySelectorAll(
    ".page-content .common-awards-sheet, .faq-launcher",
  ),
];
const stickyNoteTargets = [
  ...document.querySelectorAll(".awards-showcase .award-note"),
];
const logoStickerTargets = [
  ...document.querySelectorAll(".collaboration-stamps .stamp-logo"),
];
const hashtagStickerTargets = [
  ...document.querySelectorAll(".activity-hashtags .activity-hashtag"),
];
const scrollMotionTargets = [
  ...heroZoomTargets,
  ...cardPopTargets,
  ...sectionBackgroundTargets,
  ...stickyNoteTargets,
  ...logoStickerTargets,
  ...hashtagStickerTargets,
];

scrollMotionTargets.forEach((target) => {
  const originalTransform = getComputedStyle(target).transform;

  target.style.setProperty(
    "--scroll-rest-transform",
    originalTransform === "none" ? "translateZ(0)" : originalTransform,
  );
});

heroZoomTargets.forEach((target) => target.classList.add("scroll-zoom-out-left"));
[...cardPopTargets, ...sectionBackgroundTargets].forEach((target) =>
  target.classList.add("scroll-pop-up"),
);
stickyNoteTargets.forEach((target) => target.classList.add("scroll-stick-note"));
logoStickerTargets.forEach((target) =>
  target.classList.add("scroll-logo-sticker"),
);
hashtagStickerTargets.forEach((target) =>
  target.classList.add("scroll-hashtag-sticker"),
);

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  scrollMotionTargets.forEach((target) =>
    target.classList.add("is-scroll-motion-visible"),
  );
} else {
  document.body.classList.add("scroll-motion-ready");

  const updateScrollMotionTargets = (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle(
        "is-scroll-motion-visible",
        entry.isIntersecting,
      );

      if (entry.target.matches(".countdown-card")) {
        entry.target
          .closest(".countdown-board")
          ?.querySelector(".countdown-pin")
          ?.classList.toggle("is-pinned", entry.isIntersecting);
      }
    });
  };

  // The positive margins form a hysteresis zone around the viewport. They
  // keep an element intersecting while its own entrance transform settles,
  // but still reset it after it has fully left so a later re-entry can replay.
  const heroMotionObserver = new IntersectionObserver(
    updateScrollMotionTargets,
    { threshold: 0.01, rootMargin: "96px 0px" },
  );
  const cardMotionObserver = new IntersectionObserver(
    updateScrollMotionTargets,
    { threshold: 0.01, rootMargin: "96px 0px" },
  );
  const stickyNoteObserver = new IntersectionObserver(
    updateScrollMotionTargets,
    // The lower-middle note waits 170px below its resting position. Extend
    // the lower trigger zone so its transformed position cannot prevent the
    // observer from ever starting the entrance animation.
    { threshold: 0.01, rootMargin: "64px 0px 240px" },
  );
  const logoStickerObserver = new IntersectionObserver(
    updateScrollMotionTargets,
    { threshold: 0.01, rootMargin: "64px 190px" },
  );
  const hashtagStickerObserver = new IntersectionObserver(
    updateScrollMotionTargets,
    { threshold: 0.01, rootMargin: "64px 220px" },
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroZoomTargets.forEach((target) => heroMotionObserver.observe(target));
      cardPopTargets.forEach((target) => cardMotionObserver.observe(target));
      sectionBackgroundTargets.forEach((target) =>
        cardMotionObserver.observe(target),
      );
      stickyNoteTargets.forEach((target) => stickyNoteObserver.observe(target));
      logoStickerTargets.forEach((target) =>
        logoStickerObserver.observe(target),
      );
      hashtagStickerTargets.forEach((target) =>
        hashtagStickerObserver.observe(target),
      );
    });
  });
}

const characterHoverAnimations = new Map([
  ["沈家_01_沈曦Q.webp", "imgs/characters/Q/Anims/沈家_01_沈曦Q.webm"],
  ["沈家_01_沈澈Q.webp", "imgs/characters/Q/Anims/沈家_02_沈澈Q.webm"],
  ["沈家_01_沈樂Q.webp", "imgs/characters/Q/Anims/沈家_03_沈樂Q.webm"],
  ["沈家_01_沈月Q.webp", "imgs/characters/Q/Anims/沈家_04_沈月Q.webm"],
]);

function resetCharacterAnimation(video) {
  video.pause();
  if (video.readyState > 0) video.currentTime = 0;
  video.closest("[data-character-hover]")?.classList.remove("is-playing");
}

function enhanceCharacterHover(image) {
  if (image.dataset.characterStatic !== undefined) return;
  const staticSource = image.getAttribute("src");
  const fileName = staticSource?.split("/").at(-1);
  const animationSource = characterHoverAnimations.get(fileName);
  if (!staticSource || !animationSource) return;

  const wrapper = document.createElement("span");
  const video = document.createElement("video");
  [...image.attributes].forEach(({ name, value }) => {
    if (!["src", "alt", "loading", "decoding", "draggable"].includes(name)) {
      wrapper.setAttribute(name, value);
    }
  });
  wrapper.dataset.characterHover = "";
  wrapper.style.setProperty("--character-animation-scale", "1.12");

  image.removeAttribute("class");
  image.removeAttribute("id");
  image.removeAttribute("aria-hidden");
  image.dataset.characterStatic = "";
  image.classList.add("character-hover__static");

  video.className = "character-hover__animation";
  video.setAttribute("aria-hidden", "true");
  video.preload = "metadata";
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;

  const source = document.createElement("source");
  source.src = animationSource;
  source.type = "video/webm";
  video.append(source);

  let hovered = false;
  wrapper.addEventListener("mouseenter", () => {
    if (reduceMotion.matches) return;
    hovered = true;
    video
      .play()
      .then(() => {
        const revealAnimation = () => {
          if (hovered) wrapper.classList.add("is-playing");
        };

        if ("requestVideoFrameCallback" in video) {
          video.requestVideoFrameCallback(revealAnimation);
        } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          revealAnimation();
        } else {
          video.addEventListener("loadeddata", revealAnimation, { once: true });
        }
      })
      .catch(() => {});
  });
  wrapper.addEventListener("mouseleave", () => {
    hovered = false;
    resetCharacterAnimation(video);
  });

  image.replaceWith(wrapper);
  wrapper.append(image, video);
}

document.querySelectorAll("img").forEach(enhanceCharacterHover);

const characterImageObserver = new MutationObserver((mutations) => {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node instanceof HTMLImageElement) enhanceCharacterHover(node);
      node.querySelectorAll("img").forEach(enhanceCharacterHover);
    });
  });
});
characterImageObserver.observe(document.body, { childList: true, subtree: true });

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) return;
  document
    .querySelectorAll(".character-hover__animation")
    .forEach(resetCharacterAnimation);
});

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
    { threshold: 0.01, rootMargin: "48px 0px" },
  );

  // Paint the hidden state first so re-entering the buffered viewport replays
  // the animation without flickering at the visible edge.
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
    '.site-nav a[href^="#"]:not([data-faq-link]):not([data-organizer-link]):not([data-related-data-link])',
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
  if (document.body.classList.contains("related-data-open")) {
    setActiveNav(null);
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
const relatedDataView = document.getElementById("related-data");
const faqLinks = [...document.querySelectorAll("[data-faq-link]")];
const organizerLinks = [...document.querySelectorAll("[data-organizer-link]")];
const relatedDataLinks = [...document.querySelectorAll("[data-related-data-link]")];
const faqBackButtons = [...document.querySelectorAll("[data-faq-back]")];
const organizerBackButtons = [
  ...document.querySelectorAll("[data-organizer-back]"),
];
const relatedDataBackButtons = [
  ...document.querySelectorAll("[data-related-data-back]"),
];
let faqReturnHash = "#activity";
let organizerReturnHash = "#activity";
let relatedDataReturnHash = "#activity";

document.querySelectorAll(".faq-card").forEach((card, index) => {
  const heading = card.querySelector("h2");
  const answer = card.querySelector("p");
  const answerId = `faq-answer-${index + 1}`;
  const questionContent = heading.innerHTML;
  const answerReveal = document.createElement("div");

  answer.id = answerId;
  answer.setAttribute("aria-hidden", "true");
  answerReveal.className = "faq-answer-reveal";
  answerReveal.append(answer);
  heading.after(answerReveal);
  heading.innerHTML = `<button class="faq-question" type="button" aria-expanded="false" aria-controls="${answerId}">${questionContent}</button>`;

  heading.querySelector(".faq-question").addEventListener("click", (event) => {
    const question = event.currentTarget;
    const willOpen = question.getAttribute("aria-expanded") !== "true";
    question.setAttribute("aria-expanded", String(willOpen));
    card.classList.toggle("is-open", willOpen);
    answer.setAttribute("aria-hidden", String(!willOpen));
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
  document.body.classList.remove("organizer-open", "related-data-open");
  organizerView.hidden = true;
  relatedDataView.hidden = true;
  faqView.hidden = false;
  if (updateHistory && window.location.hash !== "#faq")
    history.pushState({ faq: true }, "", "#faq");
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
  document.body.classList.remove("faq-open", "related-data-open");
  document.body.classList.add("organizer-open", "activity-visible");
  faqView.hidden = true;
  relatedDataView.hidden = true;
  organizerView.hidden = false;
  if (updateHistory && window.location.hash !== "#organizers") {
    history.pushState({ organizers: true }, "", "#organizers");
  }
  setActiveNav(organizerNavLink);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function hideFaq(targetHash = faqReturnHash, updateHistory = true) {
  document.body.classList.remove("faq-open");
  faqView.hidden = true;
  if (updateHistory) history.pushState(null, "", targetHash);
  requestAnimationFrame(() => {
    document.querySelector(targetHash)?.scrollIntoView({ behavior: "auto" });
    scheduleActiveNavUpdate();
  });
}

function hideOrganizer(targetHash = organizerReturnHash, updateHistory = true) {
  document.body.classList.remove("organizer-open");
  organizerView.hidden = true;
  if (updateHistory) history.pushState(null, "", targetHash);
  requestAnimationFrame(() => {
    document.querySelector(targetHash)?.scrollIntoView({ behavior: "auto" });
    scheduleActiveNavUpdate();
  });
}

function showRelatedData(updateHistory = true) {
  if (
    !document.body.classList.contains("related-data-open") &&
    window.location.hash !== "#related-data"
  ) {
    relatedDataReturnHash = window.location.hash || "#activity";
  }
  document.body.classList.remove("faq-open", "organizer-open");
  document.body.classList.add("related-data-open", "activity-visible");
  faqView.hidden = true;
  organizerView.hidden = true;
  relatedDataView.hidden = false;
  if (updateHistory && window.location.hash !== "#related-data") {
    history.pushState({ relatedData: true }, "", "#related-data");
  }
  setActiveNav(null);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function hideRelatedData(
  targetHash = relatedDataReturnHash,
  updateHistory = true,
) {
  document.body.classList.remove("related-data-open");
  relatedDataView.hidden = true;
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
relatedDataLinks.forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showRelatedData();
  }),
);
relatedDataBackButtons.forEach((button) =>
  button.addEventListener("click", () => history.back()),
);

document
  .querySelectorAll(
    '.site-header a[href^="#"]:not([data-faq-link]):not([data-organizer-link]):not([data-related-data-link])',
  )
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        !document.body.classList.contains("faq-open") &&
        !document.body.classList.contains("organizer-open") &&
        !document.body.classList.contains("related-data-open")
      )
        return;
      event.preventDefault();
      const targetHash = link.getAttribute("href");
      if (document.body.classList.contains("faq-open")) hideFaq(targetHash);
      else if (document.body.classList.contains("organizer-open"))
        hideOrganizer(targetHash);
      else hideRelatedData(targetHash);
    });
  });

window.addEventListener("popstate", () => {
  if (window.location.hash === "#faq") showFaq(false);
  else if (window.location.hash === "#organizers") showOrganizer(false);
  else if (window.location.hash === "#related-data") showRelatedData(false);
  else if (document.body.classList.contains("faq-open"))
    hideFaq(window.location.hash || "#activity", false);
  else if (document.body.classList.contains("organizer-open"))
    hideOrganizer(window.location.hash || "#activity", false);
  else if (document.body.classList.contains("related-data-open"))
    hideRelatedData(window.location.hash || "#activity", false);
});

if (window.location.hash === "#faq") showFaq(false);
else if (window.location.hash === "#organizers") showOrganizer(false);
else if (window.location.hash === "#related-data") showRelatedData(false);

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

const memeModal = document.getElementById('meme-modal');
const memeModalImage = document.getElementById('meme-modal-image');
const memeModalStatus = document.getElementById('meme-modal-status');
const memeModalAnnouncement = document.getElementById('meme-modal-announcement');
const memeModalPrevious = memeModal?.querySelector('[data-meme-previous]');
const memeModalNext = memeModal?.querySelector('[data-meme-next]');
const memeModalViewer = memeModal?.querySelector('.meme-modal__viewer');

const memeMascots = [...document.querySelectorAll('#activity .section-mascot')].filter(
  (mascot) => !mascot.closest('#related-data'),
);

if (memeMascots.length) {
  const storageKey = 'neko-matsuri-last-meme-mascot';
  let previousIndex = -1;
  try {
    previousIndex = Number.parseInt(localStorage.getItem(storageKey) ?? '-1', 10);
  } catch {}

  let selectedIndex = Math.floor(Math.random() * memeMascots.length);
  if (memeMascots.length > 1 && selectedIndex === previousIndex) {
    selectedIndex = (selectedIndex + 1 + Math.floor(Math.random() * (memeMascots.length - 1)))
      % memeMascots.length;
  }

  const trigger = document.createElement('button');
  trigger.className = 'mascot-meme-button';
  trigger.type = 'button';
  trigger.dataset.memeGallery = '';
  trigger.setAttribute('aria-label', '開啟工作小彩蛋圖片集');
  trigger.textContent = '工作小彩蛋';
  memeMascots[selectedIndex].append(trigger);

  try {
    localStorage.setItem(storageKey, String(selectedIndex));
  } catch {}
}

const memeModalTriggers = [
  ...document.querySelectorAll('[data-meme-src], [data-meme-gallery]'),
];
const memeModalCloseButtons = [...document.querySelectorAll('[data-meme-close]')];
const memeGalleryItems = [
  ...new Map(
    [...document.querySelectorAll('[data-meme-src]')].map((trigger) => [
      trigger.dataset.memeSrc,
      {
        src: trigger.dataset.memeSrc,
        name: trigger.dataset.memeName || '工作',
      },
    ]),
  ).values(),
];
let memeModalTrigger = null;
let memeModalIndex = 0;
let memeSwipeStart = null;

function renderMemeDots() {
  if (!memeModalStatus) return;
  memeModalStatus.replaceChildren();
  memeGalleryItems.forEach((item, index) => {
    const dot = document.createElement('button');
    dot.className = 'meme-modal__dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `切換到${item.name}`);
    dot.addEventListener('click', () => showMemeImage(index));
    memeModalStatus.append(dot);
  });
}

function showMemeImage(index) {
  if (!memeGalleryItems.length || !memeModalImage) return;
  memeModalIndex = (index + memeGalleryItems.length) % memeGalleryItems.length;
  const item = memeGalleryItems[memeModalIndex];
  memeModalImage.src = item.src;
  memeModalImage.alt = `${item.name}的工作小彩蛋`;
  if (memeModalStatus) {
    [...memeModalStatus.children].forEach((dot, dotIndex) => {
      const active = dotIndex === memeModalIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }
  if (memeModalAnnouncement) memeModalAnnouncement.textContent = item.name;
  memeModalViewer?.classList.add('is-switching');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    memeModalViewer?.classList.remove('is-switching');
  }));
}

renderMemeDots();

function openMemeModal(event) {
  if (!memeModal || !memeModalImage || !memeGalleryItems.length) return;
  const trigger = event.currentTarget;
  memeModalTrigger = trigger;
  const requestedIndex = trigger.dataset.memeGallery !== undefined
    ? Math.floor(Math.random() * memeGalleryItems.length)
    : memeGalleryItems.findIndex((item) => item.src === trigger.dataset.memeSrc);
  showMemeImage(requestedIndex < 0 ? 0 : requestedIndex);
  memeModal.hidden = false;
  document.body.classList.add('meme-is-open');
  activityRoot.inert = true;
  activityRoot.setAttribute('aria-hidden', 'true');
  stage.inert = true;
  stage.setAttribute('aria-hidden', 'true');
  memeModal.focus({ preventScroll: true });
  memeModal.querySelector('.meme-modal__close')?.focus({ preventScroll: true });
}

function closeMemeModal() {
  if (!memeModal || memeModal.hidden) return;
  memeModal.hidden = true;
  document.body.classList.remove('meme-is-open');
  activityRoot.inert = false;
  activityRoot.removeAttribute('aria-hidden');
  stage.inert = false;
  stage.removeAttribute('aria-hidden');
  memeModalImage.removeAttribute('src');
  memeModalImage.alt = '';
  memeModalTrigger?.focus({ preventScroll: true });
  memeModalTrigger = null;
}

memeModalTriggers.forEach((trigger) =>
  trigger.addEventListener('click', openMemeModal),
);
memeModalCloseButtons.forEach((button) =>
  button.addEventListener('click', closeMemeModal),
);
memeModalPrevious?.addEventListener('click', () => showMemeImage(memeModalIndex - 1));
memeModalNext?.addEventListener('click', () => showMemeImage(memeModalIndex + 1));

memeModalViewer?.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  memeModalViewer.setPointerCapture(event.pointerId);
  memeSwipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
});

memeModalViewer?.addEventListener('pointerup', (event) => {
  if (!memeSwipeStart || memeSwipeStart.id !== event.pointerId) return;
  const deltaX = event.clientX - memeSwipeStart.x;
  const deltaY = event.clientY - memeSwipeStart.y;
  memeSwipeStart = null;
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return;
  showMemeImage(memeModalIndex + (deltaX < 0 ? 1 : -1));
});

memeModalViewer?.addEventListener('pointercancel', () => {
  memeSwipeStart = null;
});

const academyModal = document.getElementById('academy-modal');
const academyModalTriggers = [...document.querySelectorAll('[data-academy-info-trigger]')];
const academyModalClose = document.getElementById('academy-modal-close');
const academyPresidentLink = document.getElementById('academy-president-link');
let academyModalTrigger = academyModalTriggers[0] || null;

function openAcademyModal(event) {
  if (!academyModal) return;
  academyModalTrigger = event?.currentTarget || academyModalTrigger;
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

academyModalTriggers.forEach((trigger) => trigger.addEventListener('click', openAcademyModal));
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
  if (memeModal && !memeModal.hidden) {
    if (event.key === 'Escape') {
      closeMemeModal();
      return;
    }
    if (event.key === 'ArrowLeft') {
      showMemeImage(memeModalIndex - 1);
      return;
    }
    if (event.key === 'ArrowRight') {
      showMemeImage(memeModalIndex + 1);
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...memeModal.querySelectorAll('button:not([disabled])')];
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
    return;
  }
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
