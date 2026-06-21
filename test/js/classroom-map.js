(() => {
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"]/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
    );

  const seats = [
    {
      row: 1,
      column: 1,
      name: "沈月",
      group: "shen",
      tabTarget: "shen-yue",
      portrait: "imgs/characters/證件/照片/沈月-證件.jpg",
    },
    {
      row: 1,
      column: 2,
      name: "沈樂",
      group: "shen",
      tabTarget: "shen-le",
      portrait: "imgs/characters/證件/照片/沈樂-證件.jpg",
    },
    {
      row: 1,
      column: 7,
      name: "阿強",
      group: "ip",
      portrait: "imgs/characters/證件/照片/阿強-頭貼.png",
      externalUrl: "https://x.com/Nekolive_Chiang",
    },
    {
      row: 2,
      column: 1,
      name: "沈曦",
      group: "shen",
      tabTarget: "shen-xi",
      portrait: "imgs/characters/證件/照片/沈曦-證件.jpg",
    },
    {
      row: 2,
      column: 2,
      name: "沈澈",
      group: "shen",
      tabTarget: "shen-che",
      portrait: "imgs/characters/證件/照片/沈澈-證件.jpg",
    },
    {
      row: 2,
      column: 7,
      name: "阿醜",
      group: "ip",
      portrait: "imgs/characters/證件/照片/阿醜-頭貼.png",
      externalUrl: "https://x.com/Nekolive_Ugly",
    },
    {
      row: 3,
      column: 7,
      name: "利貝",
      group: "ip",
      portrait: "imgs/characters/證件/照片/利貝-頭貼.png",
      externalUrl: "https://x.com/Nekolive_Liber",
    },
    {
      row: 4,
      column: 7,
      name: "阿雄",
      group: "ip",
      portrait: "imgs/characters/證件/照片/阿雄-頭貼.png",
      externalUrl: "https://x.com/Nekolive_Xiong",
    },
    {
      row: 5,
      column: 7,
      name: "祭煜",
      group: "cat",
      tabTarget: "matsuri",
      portrait: "imgs/characters/證件/照片/祭煜-證件.jpg",
    },
  ];

  const teacher = {
    name: "貓祭",
    group: "cat",
    role: "老師",
    tabTarget: "neko",
    portrait: "imgs/characters/證件/照片/貓祭-證件.jpg",
  };

  const seatByPosition = new Map(
    seats.map((seat) => [`${seat.row}-${seat.column}`, seat]),
  );

  function renderPersonCard(seat) {
    const portrait = seat.portrait
      ? `<img src="${escapeHtml(seat.portrait)}" alt="" loading="lazy" decoding="async" />`
      : '<span class="classroom-activity__portrait-placeholder" aria-hidden="true">✦</span>';

    const content = `<div class="classroom-activity__photo-frame">${portrait}</div><strong>${escapeHtml(seat.name)}${seat.role ? `（${escapeHtml(seat.role)}）` : ""}</strong>`;
    if (seat.externalUrl) {
      return `<a class="classroom-activity__seat classroom-activity__seat--${seat.group} is-clickable" href="${escapeHtml(seat.externalUrl)}" target="_blank" rel="noopener noreferrer" aria-label="前往${escapeHtml(seat.name)}的 X 帳號">${content}</a>`;
    }
    if (seat.tabTarget) {
      return `<a class="classroom-activity__seat classroom-activity__seat--${seat.group} is-clickable" href="#related-data" data-related-character-target="${escapeHtml(seat.tabTarget)}" aria-label="查看${escapeHtml(seat.name)}角色資料">${content}</a>`;
    }
    return `<div class="classroom-activity__seat classroom-activity__seat--${seat.group}">${content}</div>`;
  }

  function renderSeat(row, column) {
    const seat = seatByPosition.get(`${row}-${column}`);
    if (!seat) {
      return '<div class="classroom-activity__seat is-empty" aria-label="空座位"></div>';
    }
    return renderPersonCard(seat);
  }

  function template() {
    const seatGrid = Array.from({ length: 5 }, (_, rowIndex) =>
      Array.from({ length: 7 }, (_, columnIndex) =>
        renderSeat(rowIndex + 1, columnIndex + 1),
      ).join(""),
    ).join("");

    return `<section class="classroom-activity" aria-labelledby="classroom-activity-title">
      <header class="section-title classroom-activity__header">
        <span></span>
        <h2 id="classroom-activity-title">三年 C 班座位表</h2>
        <span></span>
      </header>
      <div class="classroom-activity__layout">
        <article class="classroom-activity__board">
          <div class="classroom-activity__balcony">陽台</div>
          <div class="classroom-activity__room">
            <div class="classroom-activity__blackboard">黑板</div>
            <div class="classroom-activity__podium" aria-label="講台"><span>講</span>${renderPersonCard(teacher)}<span>台</span></div>
            <div class="classroom-activity__seats" aria-label="七欄五排座位配置">${seatGrid}</div>
          </div>
        </article>
        <aside class="classroom-activity__legend">
          <div class="classroom-activity__legend-card">
            <ul>
              <li class="is-cat"><i aria-hidden="true"></i><span><strong>貓家</strong><small>核心計分對象</small></span></li>
              <li class="is-shen"><i aria-hidden="true"></i><span><strong>沈家</strong><small>核心計分對象</small></span></li>
              <li class="is-ip"><i aria-hidden="true"></i><span><strong>貓祭旗下 IP</strong><small>額外加分對象</small></span></li>
            </ul>
            <div class="classroom-activity__note"><span>註：</span><p>主要評分角色為貓家與沈家；繪製紫色標示的 IP 角色可獲額外加分，但不是本次活動主軸。</p></div>
          </div>
        </aside>
      </div>
    </section>`;
  }

  window.ClassroomMap = { template };

  document.querySelectorAll("[data-classroom-map]").forEach((target) => {
    target.innerHTML = template();
  });
})();
