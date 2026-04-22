document.addEventListener("DOMContentLoaded", async function() {
  const manifest = await fetch("intelligence/index.json").then(function(r){return r.json()});
  const layout = new DashboardLayoutManager(manifest);
  const renderer = new DashboardRenderer(new MarkdownProcessor());

  window.dashboard = {manifest: manifest, layout: layout, renderer: renderer};

  await render();

  var editBtn = document.getElementById("edit");
  if(editBtn){
    editBtn.onclick = function(){
      if(window.intelligenceEditor){
        window.intelligenceEditor.openEditor();
      }
    };
  }
});

async function render(){
  const layout = window.dashboard.layout;
  const renderer = window.dashboard.renderer;

  const regions = layout.getRenderableRegions();
  const center = document.getElementById("center");

  await renderer.renderItem(regions.center, center);

  window.currentIntelligenceDocument = regions.center;
}
