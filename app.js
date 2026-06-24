let boardData = null;
let activeFilter = "all";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function pct(value) {
  return `${value}%`;
}

function tagClass(label) {
  if (label.includes("主推") || label.includes("A級") || label.includes("晉級")) return "tag--green";
  if (label.includes("小") || label.includes("大小") || label.includes("節奏")) return "tag--gold";
  if (label.includes("避開") || label.includes("淘汰") || label.includes("不追")) return "tag--red";
  return "tag--blue";
}

function setText(selector, text) {
  const el = $(selector);
  if (el) el.textContent = text;
}

function teamLabel(team) {
  return `<span class="flag">${team.flag}</span><span>${team.name}</span>`;
}

function confidenceScore(label = "") {
  if (label.includes("A")) return 90;
  if (label.includes("B+")) return 78;
  if (label.includes("B")) return 68;
  return 58;
}

function renderHero(data) {
  setText("#editionLabel", data.edition);
  setText("#heroPrimary", data.hero.primary);
  setText("#heroSecondary", data.hero.secondary);
  setText("#heroAvoid", data.hero.avoid);
  setText("#lastUpdated", `Last updated: ${data.updatedAt}`);
  $("#ticker").innerHTML = `
    <div>APE Alert</div>
    <section class="alert-board">
      ${data.alerts.map((item) => `<p>${item}</p>`).join("")}
    </section>
  `;
}

function renderDashboard() {
  const matches = boardData.matches;
  const aLevel = matches.filter((m) => m.confidence.includes("A")).length;
  const totalPicks = matches.filter((m) => m.totalPick.includes("小") || m.totalPick.includes("大")).length;
  const qualified = boardData.qualified.length;
  const avoid = boardData.hero.avoid;

  $("#dashboardGrid").innerHTML = [
    { label: "今日賽事", value: `${matches.length} 場`, text: boardData.edition },
    { label: "A級方向", value: `${aLevel} 場`, text: "信心較高，但仍以控注為優先" },
    { label: "大小球雷達", value: `${totalPicks} 場`, text: "末輪戰意讓小球權重提高" },
    { label: "已晉級隊伍", value: `${qualified} 隊`, text: "名次仍會改變下一輪路線" }
  ].map((item) => `
    <article class="dash-card">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.text}</p>
    </article>
  `).join("");

  const topMatches = [...matches]
    .sort((a, b) => confidenceScore(b.confidence) - confidenceScore(a.confidence))
    .slice(0, 3);

  $("#radarPicks").innerHTML = topMatches.map((m) => `
    <article class="radar-pick">
      <div><strong>${m.home.flag} ${m.home.name} vs ${m.away.flag} ${m.away.name}</strong><span>${m.group} · ${m.confidence}</span></div>
      <p>${m.side}｜${m.totalPick}｜${m.score}</p>
      <meter min="0" max="100" value="${confidenceScore(m.confidence)}"></meter>
    </article>
  `).join("");

  $("#riskGrid").innerHTML = `
    <article><span>避開盤</span><strong>${avoid}</strong><p>熱門深讓盤只看方向，不追高。</p></article>
    <article><span>主推資金</span><strong>35%</strong><p>單場最高配置，避免滿倉。</p></article>
    <article><span>正確比分</span><strong>10%</strong><p>只適合小注娛樂，不當主軸。</p></article>
  `;
}

function movementTone(text = "") {
  if (text.includes("不追") || text.includes("追高") || text.includes("升盤")) return "hot";
  if (text.includes("小") || text.includes("降注") || text.includes("保守")) return "cool";
  return "watch";
}

function renderProReport() {
  const portfolio = boardData.portfolio || [];
  const main = portfolio[0] || { title: boardData.hero.primary, description: "今日主推方向" };
  const total = portfolio.find((item) => item.title.includes("小") || item.description.includes("小")) || { title: boardData.hero.secondary, description: "今日大小球方向" };
  const avoid = boardData.hero.avoid;
  const scoreMatch = boardData.matches.find((m) => m.score) || boardData.matches[0];
  const quickItems = boardData.quickSlip || [
    { label: "今日最穩", value: main.title, note: main.description },
    { label: "今日小分", value: total.title, note: total.description },
    { label: "今日避開", value: avoid, note: "熱門深讓盤不追高，等臨場盤或跳過。" },
    { label: "正確比分", value: scoreMatch ? `${scoreMatch.home.name} vs ${scoreMatch.away.name}｜${scoreMatch.score}` : "待更新", note: "比分只做小注參考，不納入主資金。" }
  ];

  $("#quickSlip").innerHTML = quickItems.map((item) => `
    <article>
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `).join("");

  const oddsMoves = boardData.oddsMoves || boardData.matches.map((m) => ({
    match: `${m.home.flag} ${m.home.name} vs ${m.away.flag} ${m.away.name}`,
    open: m.taiwanLine.asiaFormat,
    current: `${m.taiwanLine.handicap}｜${m.taiwanLine.total}`,
    move: movementTone(`${m.side} ${m.read}`) === "hot" ? "市場偏熱" : movementTone(`${m.totalPick} ${m.read}`) === "cool" ? "節奏降速" : "觀察盤",
    read: m.read
  }));

  $("#oddsBoard").innerHTML = oddsMoves.map((item) => `
    <article class="odds-row odds-row--${movementTone(`${item.move} ${item.read}`)}">
      <div><strong>${item.match}</strong><span>${item.move}</span></div>
      <p><b>初盤</b>${item.open}</p>
      <p><b>目前</b>${item.current}</p>
      <small>${item.read}</small>
    </article>
  `).join("");

  const form = boardData.form7d || {
    summary: "新站啟用，今日賽後開始累積近7日樣本。",
    metrics: [
      { label: "主推命中", value: "待統計", note: "賽後更新" },
      { label: "大小球", value: "待統計", note: "賽後更新" },
      { label: "避開盤", value: "待統計", note: "賽後更新" },
      { label: "正比接近", value: "待統計", note: "只看方向" }
    ]
  };

  $("#streakBoard").innerHTML = `
    <p>${form.summary}</p>
    <div class="streak-metrics">
      ${form.metrics.map((item) => `
        <article>
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          <small>${item.note}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function renderMatches(filter = "all") {
  const matches = boardData.matches.filter((m) => filter === "all" || m.filters.includes(filter));
  $("#matchGrid").innerHTML = matches.map((m) => `
    <article class="match-card">
      <div class="match-card__top"><span>${m.time} · ${m.group}</span><strong class="confidence">${m.confidence}</strong></div>
      <div class="versus">
        <div class="team-box"><b>${teamLabel(m.home)}</b><small>${m.home.note}</small></div>
        <span class="vs">VS</span>
        <div class="team-box"><b>${teamLabel(m.away)}</b><small>${m.away.note}</small></div>
      </div>
      <div class="winrate">
        <div><span>${m.home.name}勝</span><strong>${pct(m.winRate.home)}</strong></div>
        <div><span>和局</span><strong>${pct(m.winRate.draw)}</strong></div>
        <div><span>${m.away.name}勝</span><strong>${pct(m.winRate.away)}</strong></div>
      </div>
      <div class="power-row">
        <span>${m.home.flag} ${m.home.name}</span><div class="power"><i style="width:${m.power.home}%"></i></div><strong>${m.power.home}</strong>
      </div>
      <div class="power-row">
        <span>${m.away.flag} ${m.away.name}</span><div class="power power--away"><i style="width:${m.power.away}%"></i></div><strong>${m.power.away}</strong>
      </div>
      <div class="tw-lines">
        <div><span>台灣讓分</span><strong>${m.taiwanLine.handicap}</strong></div>
        <div><span>台灣大小</span><strong>${m.taiwanLine.total}</strong></div>
        <div><span>運彩參考</span><strong>${m.taiwanLine.sportsLottery}</strong></div>
        <div><span>亞洲盤</span><strong>${m.taiwanLine.asiaFormat}</strong></div>
      </div>
      <div class="pick-list">
        <div class="pick-row pick-row--best"><span>首選</span><strong>${m.side}</strong></div>
        <div class="pick-row"><span>大小</span><strong>${m.totalPick}</strong></div>
        <div class="pick-row pick-row--score"><span>正確比分</span><strong>${m.score}</strong></div>
      </div>
      <div class="context-list">
        <div><span>球員新聞</span><p>${m.context.players}</p></div>
        <div><span>戰術安排</span><p>${m.context.tactics}</p></div>
        <div><span>晉級情境</span><p>${m.context.scenario}</p></div>
      </div>
      <p class="read">${m.read}</p>
      <div class="chips">${m.chips.map((c) => `<span class="tag ${tagClass(c)}">${c}</span>`).join("")}</div>
    </article>
  `).join("");
}

function renderScenarios() {
  const groupsByName = Object.fromEntries(boardData.groups.map((g) => [g.group, g]));
  $("#scenarioGrid").innerHTML = boardData.matches.map((m) => {
    const group = groupsByName[m.group];
    const leaders = group ? [...group.teams].sort((a, b) => b.points - a.points).slice(0, 3) : [];
    return `
      <article class="scenario-card">
        <div class="scenario-card__match">
          <strong>${m.home.flag} ${m.home.name}</strong>
          <span>VS</span>
          <strong>${m.away.flag} ${m.away.name}</strong>
        </div>
        <div class="scenario-branches">
          <div><span>${m.home.name}贏</span><p>${m.home.note}方升級，若為必勝盤會拉高讓分風險。</p></div>
          <div><span>和局</span><p>${m.context.scenario}</p></div>
          <div><span>${m.away.name}贏</span><p>${m.away.note}方路線更穩，熱門方若深讓需降注。</p></div>
        </div>
        <div class="scenario-table">
          ${leaders.map((t) => `<p><b>${t.flag} ${t.name}</b><span>${t.points}分 · ${t.status}</span></p>`).join("")}
        </div>
        <p class="read">${m.read}</p>
      </article>
    `;
  }).join("");
}

function renderStandings() {
  $("#standingsGrid").innerHTML = boardData.groups.map((g) => `
    <article class="table-card">
      <div class="table-card__head"><h3>${g.group}</h3><small>${g.note}</small></div>
      <table>
        <thead><tr><th>隊伍</th><th>賽</th><th>分</th><th>淨勝</th><th>狀態</th></tr></thead>
        <tbody>
          ${g.teams.map((t) => `<tr>
            <td>${t.flag} ${t.name}</td><td>${t.played}</td><td>${t.points}</td><td>${t.gd}</td><td><span class="status ${t.tone}">${t.status}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </article>
  `).join("");
}

function renderQualified() {
  $("#qualifiedChips").innerHTML = boardData.qualified.map((q) => `
    <span class="qualified-chip">${q.flag} ${q.name}<small>${q.group}</small></span>
  `).join("");
  setText("#qualifiedNote", boardData.qualificationNote);
  const overlay = $("#bracketOverlay");
  if (overlay && boardData.bracketSlots) {
    overlay.innerHTML = boardData.bracketSlots.map((s) => `
      <div class="bracket-fill bracket-fill--${s.tone}" style="left:${s.x}%;top:${s.y}%">
        <b>${s.seed}</b><span>${s.flag} ${s.team}</span><small>${s.status}</small>
      </div>
    `).join("");
  }
  $("#qualifiedGrid").innerHTML = boardData.qualified.map((q) => `
    <article class="qualified-card">
      <span class="flag-xl">${q.flag}</span>
      <div><h3>${q.name}</h3><p>${q.status}</p><strong>${q.next}</strong></div>
    </article>
  `).join("");
  $("#bracketPanel").innerHTML = `<h3>32強路線圖</h3>${boardData.bracket.map((b) => `
    <div class="bracket-row"><span>${b.seed}</span><strong>${b.path}</strong></div>
  `).join("")}`;
}

function renderNews() {
  $("#newsGrid").innerHTML = boardData.newsWeights.map((n) => `
    <article class="news-card"><span class="weight">${n.weight}</span><h3>${n.title}</h3><p>${n.text}</p></article>
  `).join("");
}

function renderReview() {
  const review = boardData.review || {
    summary: "賽後待更新：比賽結束後補上命中、錯盤原因、盤口變化與下一輪修正。",
    hitRate: "待統計",
    lessons: [
      "確認開賽前陣容與輪換後，再校正讓分深度。",
      "已晉級球隊不盲追深讓，優先看戰意與節奏。",
      "正確比分只列參考，不納入主資金配置。"
    ],
    matches: boardData.matches.map((m) => ({
      match: `${m.home.flag} ${m.home.name} vs ${m.away.flag} ${m.away.name}`,
      pick: `${m.side}｜${m.totalPick}`,
      result: "待開賽",
      note: "賽後補上比分與盤口復盤"
    }))
  };

  $("#reviewLayout").innerHTML = `
    <section class="review-summary">
      <p class="eyebrow">Review Board</p>
      <h3>${review.hitRate}</h3>
      <p>${review.summary}</p>
      <div class="lesson-list">${review.lessons.map((item) => `<span>${item}</span>`).join("")}</div>
    </section>
    <section class="review-list">
      ${review.matches.map((item) => `
        <article>
          <strong>${item.match}</strong>
          <p>${item.pick}</p>
          <span>${item.result}</span>
          <small>${item.note}</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderPortfolio() {
  $("#portfolioList").innerHTML = boardData.portfolio.map((item) => `
    <article><span class="tag tag--${item.tagTone}">${item.tag}</span><h3>${item.title}</h3><p>${item.description}</p><meter min="0" max="100" value="${item.confidence}"></meter></article>
  `).join("");
  $("#bankrollList").innerHTML = boardData.bankroll.map((item) => `
    <div class="bankroll__row"><span>${item.label}</span><strong>${item.value}%</strong></div><div class="bankroll__bar"><i style="width:${item.value}%"></i></div>
  `).join("");
}

function switchView(name) {
  $$(".view").forEach((v) => v.classList.remove("is-active"));
  const target = $(`#view-${name}`);
  if (target) target.classList.add("is-active");
  $$(".nav-tab").forEach((b) => b.classList.toggle("is-active", b.dataset.view === name));
}

async function init() {
  try {
    boardData = await (await fetch("./data.json", { cache: "no-store" })).json();
    renderHero(boardData);
    renderDashboard();
    renderProReport();
    renderMatches();
    renderScenarios();
    renderStandings();
    renderQualified();
    renderNews();
    renderReview();
    renderPortfolio();
  } catch (error) {
    console.error(error);
    setText("#heroPrimary", "data.json 格式需檢查");
    setText("#heroSecondary", "請確認 JSON 沒有多餘文字");
    setText("#heroAvoid", "修正後重新整理");
  }
}

$$(".nav-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
$$(".filter").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  $$(".filter").forEach((b) => b.classList.toggle("is-active", b === button));
  renderMatches(activeFilter);
}));

init();
