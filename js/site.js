if ("scrollRestoration" in history) history.scrollRestoration = "manual";

if (window.location.hash) {
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
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
  return Promise.all(entranceImages.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }));
}

function sizeArtboard() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const useCover = window.matchMedia("(max-width: 820px)").matches;
  const backgroundScale = useCover ? Math.max(width / 1920, height / 1080) : Math.min(width / 1920, height / 1080);
  const artboardWidth = 1920 * backgroundScale;
  const artboardHeight = 1080 * backgroundScale;
  artboard.style.width = `${artboardWidth}px`;
  artboard.style.height = `${artboardHeight}px`;

  let logoScale;
  let logoLeft;
  let logoTop;
  if (useCover) {
    logoScale = Math.min((width * .94) / 974, (height * .58) / 719);
    logoLeft = (width - 949 * logoScale) / 2;
    logoTop = Math.max(20, height * .7 - 823 * logoScale + 2);
  } else {
    logoScale = backgroundScale;
    logoLeft = (width - artboardWidth) / 2 + 485.5 * logoScale;
    logoTop = (height - artboardHeight) / 2 + 141 * logoScale;
  }
  Object.assign(logoMotion.style, { left: `${logoLeft}px`, top: `${logoTop}px`, width: `${974 * logoScale}px`, height: `${719 * logoScale}px` });
}

let hopTimer;
function scheduleHop() {
  if (reduceMotion.matches) return;
  hopTimer = window.setTimeout(() => {
    logoMotion.classList.add("is-hopping");
    logoMotion.addEventListener("animationend", () => {
      logoMotion.classList.remove("is-hopping");
      scheduleHop();
    }, { once: true });
  }, 3600 + Math.random() * 4200);
}

waitForImages().then(() => requestAnimationFrame(() => {
  sizeArtboard();
  stage.classList.add("is-playing");
  window.setTimeout(scheduleHop, 2900);
}));
new ResizeObserver(sizeArtboard).observe(stage);
reduceMotion.addEventListener("change", () => {
  clearTimeout(hopTimer);
  logoMotion.classList.remove("is-hopping");
  if (!reduceMotion.matches) scheduleHop();
});

const activity = document.getElementById("activity");
new IntersectionObserver(([entry]) => {
  document.body.classList.toggle("activity-visible", entry.isIntersecting);
}, { threshold: .015 }).observe(activity);

const deadline = new Date("2026-07-19T23:59:00+08:00");
function updateCountdown() {
  const difference = Math.max(0, deadline.getTime() - Date.now());
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  if (difference === 0) document.getElementById("countdown-title").textContent = "本次投稿已截止";
}

updateCountdown();
setInterval(updateCountdown, 1000);
document.getElementById("current-year").textContent = new Date().getFullYear();
