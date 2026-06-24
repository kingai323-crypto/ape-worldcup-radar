let boardData = null;
let activeFilter = "all";

const grid = document.querySelector("#matchGrid");
const filters = document.querySelectorAll(".filter");
const ticker = document.querySelector("#ticker");
const portfolioList = document.querySelector("#portfolioList");
const bankrollList = document.querySelector("#bankrollList");
const bracketList = document.querySelector("#bracketList");
const newsList = document.querySelector("#newsList");

function tagClass(label) {
  if (label.includes("主推") || label.includes("讓淺") || label.includes("A級")) return "tag--green";
  if (label.includes("小球") || label.includes("節奏") || label.includes("大小")) return "tag--gold";
  if (label.includes("風險") || label.includes("避開") || label.includes("不追")) return "tag--red";
  return "tag--blue";
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function pct(value) {
  return `${value}%`;
}

function renderHero(data) {
  setText("#editionLabel", data.edition);
  setText("#heroPrimary", data.hero.primary);
  setText("#heroSecondary", data.hero.secondary);
  setText("#heroAvoid", data.hero.avoid);
  setText("#lastUpdated", `Last updated: ${data.updatedAt}`);
}

function renderTicker(data) {
  ticker.innerHTML = `<div>APE Alert</div>${data.alerts.map((alert) => `<p>${alert}</p>`).join("")}`;
}

function renderStrength(match) {
  return `
    <div class="strength">
      <div class="strength__row">
        <span>${match.home}</span>
        <strong>${pct(match.power.home)}</strong>
      </div>
      <div class="strength__bar"><i style="width: ${match.power.home}%"></i></div>
      <div class="strength__row">
        <span>${match.away}</span>
        <strong>${pct(match.power.away)}</strong>
      </div>
      <div class="strength__bar strength__bar--away"><i style="width: ${match.power.away}%"></i></div>
    </div>
  `;
}

function renderWinRate(match) {
  return `
    <div class="winrate" aria-label="勝平負機率">
      <div><span>主勝</span><strong>${pct(match.winRate.home)}</strong></div>
      <div><span>和局</span><strong>${pct(match.winRate.draw)}</strong></div>
      <div><span>客勝</span><strong>${pct(match.winRate.away)}</strong></div>
    </div>
  `;
}

function renderMatches(filter = "all") {
  const selected = boardData.matches.filter((match) => filter === "all" || match.filters.includes(filter));
  grid.innerHTML = selected
    .map(
      (match) => `
        <article class="match-card">
          <div class="match-card__top">
            <span class="match-card__time">${match.time} · ${match.group}</span>
            <span class="confidence">${match.confidence}</span>
          </div>
          <div class="teams">
            <div class="team"><b>${match.home}</b><small>${match.homeNote}</small></div>
            <span class="vs">VS</span>
            <div class="team"><b>${match.away}</b><small>${match.awayNote}</small></div>
          </div>
          ${renderWinRate(match)}
          ${renderStrength(match)}
          <div class="tw-lines">
            <div><span>台灣常見讓分</span><strong>${match.taiwanLine.handicap}</strong></div>
            <div><span>台灣常見大小</span><strong>${match.taiwanLine.total}</strong></div>
            <div><span>台灣運彩參考</span><strong>${match.taiwanLine.sportsLottery}</strong></div>
            <div><span>亞洲盤格式</span><strong>${match.taiwanLine.asiaFormat}</strong></div>
          </div>
          <div class="pick-list" aria-label="推薦選項">
            <div class="pick-row pick-row--best"><span>首選</span><strong>${match.side}</strong></div>
            <div class="pick-row"><span>備選</span><strong>${match.totalPick}</strong></div>
            <div class="pick-row pick-row--score"><span>比分</span><strong>${match.score}</strong></div>
          </div>
          <div class="context-list" aria-label="進階分析">
            <div><span>晉級情境</span><p>${match.context.scenario}</p></div>
            <div><span>球員動向</span><p>${match.context.players}</p></div>
            <div><span>戰術安排</span><p>${match.context.tactics}</p></div>
            <div><span>即時新聞</span><p>${match.news}</p></div>
          </div>
          <p class="read">${match.read}</p>
          <div class="chips">
            ${match.chips.map((chip) => `<span class="tag ${tagClass(chip)}">${chip}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderPortfolio(data) {
  portfolioList.innerHTML = data.portfolio
    .map(
      (item) => `
        <article>
          <span class="tag tag--${item.tagTone}">${item.tag}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <meter min="0" max="100" value="${item.confidence}"></meter>
        </article>
      `
    )
    .join("");
}

function renderBankroll(data) {
  bankrollList.innerHTML = data.bankroll
    .map(
      (item) => `
        <div class="bankroll__row"><span>${item.label}</span><strong>${item.value}%</strong></div>
        <div class="bankroll__bar"><i style="width: ${item.value}%"></i></div>
      `
    )
    .join("");
}

function renderBracket(data) {
  bracketList.innerHTML = data.bracket
    .map(
      (group) => `
        <article class="bracket-card">
          <h3>${group.group}</h3>
          ${group.teams
            .map(
              (team) => `
                <div class="bracket-row">
                  <span>${team.name}</span>
                  <strong>${team.status}</strong>
                </div>
              `
            )
            .join("")}
        </article>
      `
    )
    .join("");
}

function renderNews(data) {
  newsList.innerHTML = data.newsWeights
    .map(
      (item) => `
        <div class="news-item">
          <span>${item.weight}</span>
          <p>${item.text}</p>
        </div>
      `
    )
    .join("");
}

function renderBoard(data) {
  boardData = data;
  renderHero(data);
  renderTicker(data);
  renderMatches(activeFilter);
  renderPortfolio(data);
  renderBankroll(data);
  renderBracket(data);
  renderNews(data);
}

async function loadBoardData() {
  const response = await fetch("./data.json", { cache: "no-store" });
  const data = await response.json();
  renderBoard(data);
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderMatches(activeFilter);
  });
});

loadBoardData();
