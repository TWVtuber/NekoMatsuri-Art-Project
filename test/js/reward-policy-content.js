(() => {
  const allowedTags = new Set(["b", "strong", "span"]);

  function appendSegments(container, segments = []) {
    segments.forEach((segment) => {
      if (!segment?.text) return;
      if (!segment.tag && !segment.className) {
        container.append(document.createTextNode(segment.text));
        return;
      }
      const tag = allowedTags.has(segment.tag) ? segment.tag : "span";
      const element = document.createElement(tag);
      if (segment.className) element.className = segment.className;
      element.textContent = segment.text;
      container.append(element);
    });
  }

  function renderPolicies(items) {
    const list = document.querySelector(".reward-policy__list");
    if (!list || !Array.isArray(items)) return;
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const listItem = document.createElement("li");
      appendSegments(listItem, item.segments);
      fragment.append(listItem);
    });
    list.replaceChildren(fragment);
  }

  function createMainAward(item) {
    const listItem = document.createElement("li");
    const heading = document.createElement("span");
    heading.className = "reward-prize-list__heading";
    const name = document.createElement("b");
    name.textContent = item.name;
    const count = document.createElement("span");
    count.className = "reward-prize-list__count";
    count.textContent = `（${item.count}）`;
    heading.append(name, count);

    const prize = document.createElement("span");
    prize.className = "reward-prize-list__value fit-single-line";
    prize.textContent = item.prize;
    listItem.append(heading, prize);

    if (item.bonus) {
      const bonus = document.createElement("span");
      bonus.className = "reward-prize-list__bonus fit-single-line";
      bonus.textContent = item.bonus;
      listItem.append(bonus);
    }
    if (item.description) {
      const description = document.createElement("small");
      description.textContent = item.description;
      listItem.append(description);
    }
    return listItem;
  }

  function renderMainAwards(items) {
    const list = document.querySelector(".reward-prize-list");
    if (!list || !Array.isArray(items)) return;
    list.replaceChildren(...items.map(createMainAward));
  }

  function createExtraAward(item) {
    const listItem = document.createElement("li");
    const heading = document.createElement("div");
    heading.className = "reward-extra-awards__heading";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const count = document.createElement("span");
    count.textContent = `（${item.count}）`;
    const prize = document.createElement("b");
    prize.textContent = item.prize;
    heading.append(name, count, prize);
    if (item.unlockLabel) {
      const unlockLabel = document.createElement("span");
      unlockLabel.className = "reward-extra-awards__unlock";
      unlockLabel.textContent = item.unlockLabel;
      heading.append(unlockLabel);
    }
    const description = document.createElement("p");
    appendSegments(description, item.segments);
    listItem.append(heading, description);
    return listItem;
  }

  function renderExtraAwards(data) {
    const title = document.getElementById("reward-extra-awards-title");
    if (title && data?.title) title.textContent = data.title;
    const list = document.querySelector(".reward-extra-awards__list");
    if (list && Array.isArray(data?.items)) {
      list.replaceChildren(...data.items.map(createExtraAward));
    }
  }

  fetch("data/reward-policy.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const title = document.getElementById("rewards-title");
      if (title && data.sectionTitle) title.textContent = data.sectionTitle;
      renderPolicies(data.policies);
      renderMainAwards(data.mainAwards);
      renderExtraAwards(data.extraAwards);
    })
    .catch((error) => console.error("Unable to load reward policy content.", error));
})();
