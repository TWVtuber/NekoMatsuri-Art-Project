(() => {
  function patchProfile(container, profile) {
    if (!container) return;
    container.querySelector(".corner-label").textContent = profile.label;
    const image = container.querySelector(".organizer-polaroid__image img");
    image.src = profile.image.src;
    image.alt = profile.image.alt;
    container.querySelector(".organizer-polaroid__caption span").textContent = profile.image.caption;
    container.querySelector(".organizer-quote-heading").textContent = `"${profile.heading}"`;
    container.querySelectorAll(".handwritten.text-xl p").forEach((paragraph, index) => {
      if (profile.paragraphs[index]) paragraph.textContent = profile.paragraphs[index];
    });
    container.querySelectorAll(".mt-12 a").forEach((link, index) => {
      const item = profile.links[index];
      if (!item) return;
      link.href = item.url;
      const label = link.querySelector("span:last-child");
      if (label) label.textContent = item.label;
    });
  }

  function patchCredits(credits, memes) {
    const memeByKey = new Map(memes.map((item) => [item.key, item]));
    document.getElementById("organizer-credits-title").textContent = credits.title;
    document.querySelector(".organizer-credits__label").textContent = credits.label;
    document.querySelectorAll(".organizer-credits__notes .credit-note").forEach((note, index) => {
      const item = credits.items[index];
      if (!item) return;
      const links = note.querySelectorAll("h3 > a");
      links.forEach((link, personIndex) => {
        const person = item.people[personIndex];
        if (!person) return;
        link.textContent = person.name;
        link.href = person.url;
      });
      const memeButton = note.querySelector("[data-meme-src]");
      const memeOwner = item.people.find((person) => person.memeKey);
      const meme = memeOwner ? memeByKey.get(memeOwner.memeKey) : null;
      if (memeButton && meme) {
        memeButton.dataset.memeSrc = meme.image;
        memeButton.dataset.memeName = meme.name;
        memeButton.setAttribute("aria-label", `開啟${meme.name}的彩蛋對話`);
      }
      const contribution = note.querySelector("p");
      contribution.replaceChildren();
      if (typeof item.contribution === "string") {
        contribution.textContent = item.contribution;
      } else {
        item.contribution.forEach((part) => {
          const segment = document.createElement("span");
          segment.textContent = part.text;
          (part.variants || []).forEach((variant) => {
            segment.classList.add(`credit-note__segment--${variant}`);
          });
          contribution.append(segment);
        });
      }
    });
    document.querySelectorAll(".organizer-sponsors .sponsor-note").forEach((note, index) => {
      const item = credits.sponsors[index];
      if (!item) return;
      note.querySelector("dt").textContent = item.label;
      note.querySelector("dd").textContent = item.names;
    });
  }

  fetch("data/organizers.json", { cache: "no-cache" })
    .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then((data) => {
      document.getElementById("organizers-title").textContent = data.pageTitle;
      patchProfile(document.querySelector(".journal-container-1"), data.profiles.find((item) => item.target === "organizer"));
      patchProfile(document.getElementById("academy-president-message"), data.profiles.find((item) => item.target === "president"));
      patchCredits(data.credits, data.memes);
      document.dispatchEvent(new CustomEvent("organizers-content:ready"));
    })
    .catch((error) => console.error("Unable to load organizer content.", error));
})();
