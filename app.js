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

function renderHero(data) {
  setText("#editionLabel", data.edition);
  setText("#heroPrimary", data.hero.primary);
  setText("#heroSecondary", data.hero.secondary);
  setText("#heroAvoid", data.hero.avoid);
  setText("#lastUpdated", `Last updated: ${data.updatedAt}`);
  $("#ticker").innerHTML = `<div>APE Alert</div>${data.alerts.map((item) => `<p>${item}</p>`).join("")}`;
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
  $(`#view-${name}`).classList.add("is-active");
  $$(".nav-tab").forEach((b) => b.classList.toggle("is-active", b.dataset.view === name));
}

async function init() {
  boardData = await (await fetch("./data.json", { cache: "no-store" })).json();
  renderHero(boardData);
  renderMatches();
  renderStandings();
  renderQualified();
  renderNews();
  renderPortfolio();
}

$$(".nav-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
$$(".filter").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  $$(".filter").forEach((b) => b.classList.toggle("is-active", b === button));
  renderMatches(activeFilter);
}));

init();
