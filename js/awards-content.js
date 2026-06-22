(() => {
  const externalLink = (url, text = "") => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = text;
    return link;
  };

  const awardToneClasses = [
    "award-note--yellow",
    "award-note--blue",
    "award-note--pink",
    "award-note--green",
  ];

  function setAwardTone(figure, tone) {
    figure.classList.remove(...awardToneClasses);
    figure.classList.add(`award-note--${tone}`);
  }

  function applyAwards(data) {
    const title = document.getElementById("awards-title");
    if (title) title.textContent = data.sectionTitle;
    const commonSheet = document.querySelector(".common-awards-sheet");
    if (commonSheet) {
      commonSheet.querySelector("h3").textContent = data.common.title;
      commonSheet.querySelector(".common-awards-sheet__note").textContent = data.common.description;
    }

    document.querySelectorAll(".judge-grid figure").forEach((figure, index) => {
      const item = data.common.judges[index];
      if (!item) return;
      const imageLink = figure.querySelector(".judge-portrait a");
      const image = imageLink?.querySelector("img");
      const textLink = figure.querySelector("figcaption a");
      if (imageLink) imageLink.href = item.url;
      if (image) { image.src = item.image; image.alt = item.alt; }
      if (textLink) { textLink.href = item.url; textLink.textContent = item.name; }
      figure.querySelector("figcaption strong").textContent = ` ${item.weight}`;
    });

    document.querySelectorAll(".common-award-notes .award-note").forEach((figure, index) => {
      const item = data.common.awards[index];
      if (!item) return;
      setAwardTone(figure, item.tone);
      const image = figure.querySelector("img");
      image.src = item.image;
      image.alt = item.alt;
      const strong = document.createElement("strong");
      strong.textContent = item.name;
      const prize = document.createElement("span");
      prize.textContent = item.prize;
      figure.querySelector("figcaption").replaceChildren(strong, document.createTextNode(`（${item.count}）`), prize);
    });

    document.querySelector(".role-awards-title")?.firstChild &&
      (document.querySelector(".role-awards-title").firstChild.nodeValue = `${data.roleAwards.title}\n`);
    const lead = document.querySelector(".role-awards-lead");
    if (lead) lead.textContent = data.roleAwards.description;

    document.querySelectorAll(".award-note-grid--special .role-award-note").forEach((figure, index) => {
      const item = data.roleAwards.awards[index];
      if (!item) return;
      setAwardTone(figure, item.tone);
      const trophy = figure.querySelector(":scope > img");
      trophy.src = item.image;
      trophy.alt = item.alt;
      const caption = figure.querySelector("figcaption");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const prize = document.createElement("span");
      prize.textContent = item.prize;
      const judge = document.createElement("small");
      judge.className = "award-judge";
      const imageLink = externalLink(item.judgeImageUrl);
      const image = document.createElement("img");
      image.src = item.judgeImage;
      image.alt = item.judgeImageAlt;
      imageLink.append(image);
      judge.append(imageLink);
      if (item.judges.length === 1) judge.append(externalLink(item.judges[0].url, item.judges[0].name));
      else {
        const people = document.createElement("span");
        item.judges.forEach((person, personIndex) => {
          if (personIndex) people.append(document.createTextNode(" ＆ "));
          people.append(externalLink(person.url, person.name));
        });
        judge.append(people);
      }
      caption.replaceChildren(name, prize, judge);
    });
  }

  fetch("data/awards.json", { cache: "no-cache" })
    .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(applyAwards)
    .catch((error) => console.error("Unable to load awards content.", error));
})();
