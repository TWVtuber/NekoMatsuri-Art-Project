const artboard = document.getElementById("home-artboard");
const stage = document.querySelector(".home-stage");
const logoMotion = document.getElementById("logo-motion");
const images = [...document.images];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

async function waitForImages() {
    await Promise.all(images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
        });
    }));
}

let hopTimer;

function sizeArtboard() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const useCover = window.matchMedia("(max-width: 760px)").matches;
    const backgroundScale = useCover
        ? Math.max(width / 1920, height / 1080)
        : Math.min(width / 1920, height / 1080);

    const artboardWidth = 1920 * backgroundScale;
    const artboardHeight = 1080 * backgroundScale;
    artboard.style.width = `${artboardWidth}px`;
    artboard.style.height = `${artboardHeight}px`;

    let logoScale;
    let logoLeft;
    let logoTop;

    if (useCover) {
        logoScale = Math.min((width * 0.94) / 974, (height * 0.58) / 719);
        logoLeft = (width - 949 * logoScale) / 2;
        const buttonTop = height * 0.7;
        const logoVisualBottom = 823 * logoScale;
        logoTop = Math.max(20, buttonTop - logoVisualBottom + 2);
    } else {
        logoScale = backgroundScale;
        const artboardLeft = (width - artboardWidth) / 2;
        const artboardTop = (height - artboardHeight) / 2;
        logoLeft = artboardLeft + 485.5 * logoScale;
        logoTop = artboardTop + 141 * logoScale;
    }

    logoMotion.style.left = `${logoLeft}px`;
    logoMotion.style.top = `${logoTop}px`;
    logoMotion.style.width = `${974 * logoScale}px`;
    logoMotion.style.height = `${719 * logoScale}px`;
}

function scheduleHop() {
    if (reduceMotion.matches) return;
    const delay = 3600 + Math.random() * 4200;
    hopTimer = window.setTimeout(() => {
        logoMotion.classList.add("is-hopping");
        logoMotion.addEventListener("animationend", () => {
            logoMotion.classList.remove("is-hopping");
            scheduleHop();
        }, { once: true });
    }, delay);
}

waitForImages().then(() => {
    requestAnimationFrame(() => {
        sizeArtboard();
        artboard.classList.add("is-playing");
        stage.classList.add("is-playing");
        window.setTimeout(scheduleHop, 2900);
    });
});

reduceMotion.addEventListener("change", () => {
    window.clearTimeout(hopTimer);
    logoMotion.classList.remove("is-hopping");
    if (!reduceMotion.matches) scheduleHop();
});

new ResizeObserver(sizeArtboard).observe(stage);
