(() => {
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"]/g,
      (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
    );

  function renderPersonCard(person) {
    const portrait = person.portrait
      ? `<img src="${escapeHtml(person.portrait)}" alt="" loading="lazy" decoding="async" />`
      : '<span class="classroom-activity__portrait-placeholder" aria-hidden="true">✦</span>';
    const content = `<div class="classroom-activity__photo-frame">${portrait}</div><strong>${escapeHtml(person.name)}${person.role ? `（${escapeHtml(person.role)}）` : ""}</strong>`;
    if (person.url) {
      return `<a class="classroom-activity__seat classroom-activity__seat--${escapeHtml(person.group)} is-clickable" href="${escapeHtml(person.url)}" target="_blank" rel="noopener noreferrer" aria-label="前往${escapeHtml(person.name)}的 X 帳號">${content}</a>`;
    }
    if (person.characterTab) {
      return `<a class="classroom-activity__seat classroom-activity__seat--${escapeHtml(person.group)} is-clickable" href="#related-data" data-related-character-target="${escapeHtml(person.characterTab)}" aria-label="查看${escapeHtml(person.name)}角色資料">${content}</a>`;
    }
    return `<div class="classroom-activity__seat classroom-activity__seat--${escapeHtml(person.group)}">${content}</div>`;
  }

  function template(data) {
    const seatByPosition = new Map(
      data.seats.map((seat) => [`${seat.row}-${seat.column}`, seat]),
    );
    const seats = Array.from({ length: data.layout.rows }, (_, rowIndex) =>
      Array.from({ length: data.layout.columns }, (_, columnIndex) => {
        const seat = seatByPosition.get(`${rowIndex + 1}-${columnIndex + 1}`);
        return seat
          ? renderPersonCard(seat)
          : `<div class="classroom-activity__seat is-empty" aria-label="${escapeHtml(data.labels.emptySeat)}"></div>`;
      }).join(""),
    ).join("");
    const legend = data.legend
      .map((item) => `<li class="is-${escapeHtml(item.group)}"><i aria-hidden="true"></i><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></span></li>`)
      .join("");

    return `<section class="classroom-activity" aria-labelledby="classroom-activity-title">
      <header class="section-title classroom-activity__header"><span></span><h2 id="classroom-activity-title">${escapeHtml(data.title)}</h2><span></span></header>
      <div class="classroom-activity__layout">
        <article class="classroom-activity__board">
          <div class="classroom-activity__front-wall"><div class="classroom-activity__pillar" aria-hidden="true"></div><div class="classroom-activity__balcony">${escapeHtml(data.labels.balcony)}</div></div>
          <div class="classroom-activity__room">
            <div class="classroom-activity__blackboard">${escapeHtml(data.labels.blackboard)}</div>
            <div class="classroom-activity__podium" aria-label="${escapeHtml(data.labels.podium)}"><span>講</span>${renderPersonCard(data.teacher)}<span>台</span></div>
            <div class="classroom-activity__seats" aria-label="${escapeHtml(data.labels.seatLayout)}">${seats}</div>
          </div>
        </article>
        <aside class="classroom-activity__legend"><div class="classroom-activity__legend-card"><ul>${legend}</ul><div class="classroom-activity__note"><span>註：</span><p>${escapeHtml(data.note)}</p></div></div></aside>
      </div>
    </section>`;
  }

  async function loadClassroom() {
    try {
      const response = await fetch("data/classroom.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      window.ClassroomMap = { template: () => template(data), data };
      document.querySelectorAll("[data-classroom-map]").forEach((target) => {
        target.innerHTML = template(data);
      });
      document.dispatchEvent(new CustomEvent("classroom-map:ready"));
    } catch (error) {
      console.error("Unable to load classroom content.", error);
    }
  }

  loadClassroom();
})();
