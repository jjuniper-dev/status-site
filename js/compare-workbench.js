const STATE = {
  registry: [],
  assessments: [],
  selected: new Set(),
  radarChart: null
};

const EL = {
  summaryCards: document.getElementById("summary-cards"),
  vendorToggles: document.getElementById("vendor-toggles"),
  comparisonOutput: document.getElementById("comparison-output"),
  radarCanvas: document.getElementById("radarChart")
};

async function init() {
  try {
    const res = await fetch("data/assessment-registry.json", { cache: "no-store" });
    const data = await res.json();

    STATE.registry = data.vendors;
    STATE.assessments = data.assessments;
    STATE.selected = new Set(data.default_selection);

    renderAll();
  } catch (e) {
    EL.comparisonOutput.innerHTML = "<p style='color:red'>Failed to load data</p>";
    console.error(e);
  }
}

function renderAll() {
  renderSummary();
  renderToggles();
  renderTable();
}

function renderSummary() {
  EL.summaryCards.innerHTML = STATE.assessments.map(d => `
    <div class="summary-card">
      <div class="summary-vendor">${d.vendor}</div>
      <div class="summary-composite">${d.composite}</div>
      <div class="summary-rec">${d.recommendation}</div>
    </div>
  `).join("");
}

function renderToggles() {
  EL.vendorToggles.innerHTML = STATE.registry.map(v => `
    <button class="vendor-toggle" data-slug="${v.slug}">${v.display_name}</button>
  `).join("");

  EL.vendorToggles.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const slug = btn.dataset.slug;
      if (STATE.selected.has(slug)) STATE.selected.delete(slug);
      else STATE.selected.add(slug);
      renderTable();
    };
  });
}

function renderTable() {
  const selected = STATE.assessments.filter(a => STATE.selected.has(a.slug));

  if (!selected.length) {
    EL.comparisonOutput.innerHTML = "<p>Select vendors to compare</p>";
    return;
  }

  EL.comparisonOutput.innerHTML = `
    <table class="compare-table">
      <tr>
        <th>Vendor</th>
        <th>Composite</th>
        <th>Recommendation</th>
      </tr>
      ${selected.map(d => `
        <tr>
          <td>${d.vendor}</td>
          <td>${d.composite}</td>
          <td>${d.recommendation}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

init();
