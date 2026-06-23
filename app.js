const fallbackData = {
  updatedAt: "2026-06-23 亞太時間",
  edition: "2026-06-23 每日更新版",
  hero: {
    primary: "哥倫比亞 -0.75",
    secondary: "克羅埃西亞 小2.75",
    avoid: "熱門深讓追高"
  },
  alerts: ["葡萄牙反彈題材偏熱", "英格蘭深讓需防過熱", "克羅埃西亞勝面佳但不宜追 -1.5", "哥倫比亞讓淺仍有價值"],
  matches: [
    {
      time: "01:00",
      home: "葡萄牙",
      away: "烏茲別克",
      group: "Group Stage",
      fairLine: "葡萄牙 -1.25",
      total: "2.75 / 3",
      confidence: "B",
      filters: ["side", "total"],
      side: "葡萄牙 -1 可小注",
      totalPick: "小3 優先",
      score: "2-0 / 2-1",
      read: "葡萄牙有反彈題材，但名氣盤容易被追深。若市場推到 -1.5 以上，價值變差，改看小球比較像職業打法。",
      chips: ["反彈盤", "熱門偏熱", "不追深"]
    },
    {
      time: "04:00",
      home: "英格蘭",
      away: "迦納",
      group: "Group Stage",
      fairLine: "英格蘭 -1.25",
      total: "2.75",
      confidence: "B-",
      filters: ["side"],
      side: "英格蘭勝 / -1",
      totalPick: "大2.5 小注",
      score: "2-1 / 3-1",
      read: "英格蘭人氣最熱，深讓風險高。-1 到 -1.25 尚可，若到 -1.75 就是公眾盤，不適合重壓。",
      chips: ["人氣盤", "防反風險", "勝出優先"]
    },
    {
      time: "07:00",
      home: "巴拿馬",
      away: "克羅埃西亞",
      group: "Group Stage",
      fairLine: "克羅埃西亞 -1",
      total: "2.5 / 2.75",
      confidence: "A-",
      filters: ["A", "side", "total"],
      side: "克羅埃西亞 -1",
      totalPick: "小2.75",
      score: "0-2 / 0-1",
      read: "克羅埃西亞必須反彈，但比賽節奏未必爆開。-0.75 到 -1 可下，若升到 -1.5，讓分價值消失，轉小球。",
      chips: ["副推", "節奏盤", "小球佳"]
    },
    {
      time: "10:00",
      home: "哥倫比亞",
      away: "剛果民主共和國",
      group: "Group Stage",
      fairLine: "哥倫比亞 -0.75",
      total: "2.25 / 2.5",
      confidence: "A",
      filters: ["A", "side"],
      side: "哥倫比亞 -0.75",
      totalPick: "2.25 大小皆可臨場看水",
      score: "2-1 / 2-0",
      read: "今天最有價值的主推。剛果逼平葡萄牙會被市場高估，但哥倫比亞的邊路與轉換速度更能撕開防線。",
      chips: ["主推", "讓淺有價值", "南美速度"]
    }
  ],
  portfolio: [
    { tag: "主推單場", tagTone: "green", title: "哥倫比亞 -0.75", description: "若臨場升到 -1 還可接受；-1.25 就放棄，代表價值已被買掉。", confidence: 78 },
    { tag: "副推", tagTone: "gold", title: "克羅埃西亞 -1 / 小2.75", description: "讓分不超過 -1 可走克羅埃西亞；若升深，轉小球比較漂亮。", confidence: 72 },
    { tag: "保守串", tagTone: "blue", title: "葡萄牙勝 × 英格蘭勝 × 哥倫比亞不敗", description: "降低深讓風險，只吃強隊勝出與不敗方向。", confidence: 66 }
  ],
  bankroll: [
    { label: "哥倫比亞", value: 40 },
    { label: "克羅埃西亞", value: 30 },
    { label: "勝出串關", value: 20 },
    { label: "正確比分", value: 10 }
  ]
};

let boardData = fallbackData;
let activeFilter = "all";

const grid = document.querySelector("#matchGrid");
const filters = document.querySelectorAll(".filter");
const ticker = document.querySelector("#ticker");
const portfolioList = document.querySelector("#portfolioList");
const bankrollList = document.querySelector("#bankrollList");

function tagClass(label) {
  if (label.includes("主推") || label.includes("讓淺")) return "tag--green";
  if (label.includes("小球") || label.includes("節奏")) return "tag--gold";
  if (label.includes("風險") || label.includes("不追")) return "tag--red";
  return "tag--blue";
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
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
            <div class="team">
              <b>${match.home}</b>
              <small>Home side</small>
            </div>
            <span class="vs">VS</span>
            <div class="team">
              <b>${match.away}</b>
              <small>Away side</small>
            </div>
          </div>
          <div class="match-card__market">
            <div class="market-item">
              <span>公允讓分</span>
              <strong>${match.fairLine}</strong>
            </div>
            <div class="market-item">
              <span>公允大小</span>
              <strong>${match.total}</strong>
            </div>
          </div>
          <div class="pick-list" aria-label="推薦選項">
            <div class="pick-row pick-row--best"><span>首選</span><strong>${match.side}</strong></div>
            <div class="pick-row"><span>備選</span><strong>${match.totalPick}</strong></div>
            <div class="pick-row pick-row--score"><span>比分</span><strong>${match.score}</strong></div>
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

function renderBoard(data) {
  boardData = data;
  renderHero(data);
  renderTicker(data);
  renderMatches(activeFilter);
  renderPortfolio(data);
  renderBankroll(data);
}

async function loadBoardData() {
  try {
    const response = await fetch("./data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("data.json unavailable");
    const data = await response.json();
    renderBoard(data);
  } catch (error) {
    renderBoard(fallbackData);
  }
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
