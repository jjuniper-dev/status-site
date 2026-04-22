document.addEventListener("DOMContentLoaded", async function() {
  const manifest = await fetch("intelligence/index.json").then(r=>r.json());
  const layout = new DashboardLayoutManager(manifest);
  const renderer = new DashboardRenderer(new MarkdownProcessor());

  window.dashboard = {manifest, layout, renderer, render};

  bindUI();
  await render();
});

function bindUI(){
  document.querySelectorAll("[data-layout]").forEach(btn=>{
    btn.onclick = async ()=>{
      window.dashboard.layout.setLayoutMode(btn.dataset.layout);
      await render();
    };
  });

  const edit = document.getElementById("btn-edit-active");
  if(edit){ edit.onclick = ()=>window.intelligenceEditor.openEditor(); }

  const compare = document.getElementById("btn-open-reference");
  if(compare){ compare.onclick = async ()=>{
    window.dashboard.layout.openInSplit("platform-intelligence");
    await render();
  }}
}

async function render(){
  const {layout, renderer, manifest} = window.dashboard;
  const regions = layout.getRenderableRegions();

  renderNav(manifest, layout);
  renderTabs(layout);

  const center = document.getElementById("panel-center");
  const split = document.getElementById("panel-split-right");
  const panels = document.getElementById("workspace-panels");

  await renderer.renderItem(regions.center, center);

  window.currentIntelligenceDocument = regions.center;

  if(layout.state.layoutMode === "compare" && regions.splitRight){
    panels.classList.add("compare");
    split.style.display="block";
    await renderer.renderItem(regions.splitRight, split);
  } else {
    panels.classList.remove("compare");
    split.style.display="none";
  }

  renderRight(regions);
}

function renderNav(manifest, layout){
  const el = document.getElementById("dashboard-nav");
  if(!el) return;

  const groups = {};
  manifest.documents.forEach(d=>{
    if(!groups[d.collection]) groups[d.collection]=[];
    groups[d.collection].push(d);
  });

  el.innerHTML = Object.keys(groups).map(c=>{
    return `<div class="dashboard-collection-block"><div class="card-title">${c}</div>`+
      groups[c].map(d=>`<div class="dashboard-doc-link" onclick="window.dashboard.layout.open('${d.id}'); window.dashboard.render();">
        <div class="dashboard-doc-title">${d.title}</div>
        <div class="dashboard-doc-meta">${d.type}</div>
      </div>`).join('')+
      `</div>`;
  }).join('');
}

function renderTabs(layout){
  const el = document.getElementById("dashboard-tabs");
  if(!el) return;

  el.innerHTML = layout.state.openTabs.map(id=>{
    const active = id===layout.state.activeTabId?"active":"";
    return `<div class="workspace-tab ${active}" onclick="window.dashboard.layout.activateTab('${id}'); window.dashboard.render();">
      ${id}
      <span class="workspace-tab-close" onclick="event.stopPropagation(); window.dashboard.layout.closeTab('${id}'); window.dashboard.render();">×</span>
    </div>`;
  }).join('');
}

function renderRight(regions){
  const r1=document.getElementById("panel-right-top");
  const r2=document.getElementById("panel-right-middle");
  const r3=document.getElementById("panel-right-bottom");

  if(regions.center){
    r1.innerHTML=`<div class="card"><div class="card-title">Context</div><div>${regions.center.title}</div></div>`;
    r2.innerHTML=`<div class="card"><div class="card-title">Tags</div><div>${(regions.center.tags||[]).join(', ')}</div></div>`;
    r3.innerHTML=`<div class="card"><div class="card-title">Status</div><div>${regions.center.status}</div></div>`;
  }
}
