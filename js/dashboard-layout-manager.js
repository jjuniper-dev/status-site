class DashboardLayoutManager {
  constructor(manifest) {
    this.manifest = manifest;
    this.state = this.loadState() || this.buildDefaultState();
  }

  buildDefaultState() {
    return {
      layoutMode: this.manifest.defaultLayout || "workspace",
      openTabs: [this.manifest.defaultOpen?.center].filter(Boolean),
      activeTabId: this.manifest.defaultOpen?.center || null,
      regions: {
        center: this.manifest.defaultOpen?.center || null,
        splitRight: null,
        rightTop: this.manifest.defaultOpen?.rightTop || null,
        rightMiddle: this.manifest.defaultOpen?.rightMiddle || null,
        rightBottom: this.manifest.defaultOpen?.rightBottom || null
      },
      pinned: [],
      recent: []
    };
  }

  loadState() {
    try {
      return JSON.parse(localStorage.getItem("dashboard_workspace_state"));
    } catch {
      return null;
    }
  }

  saveState() {
    localStorage.setItem("dashboard_workspace_state", JSON.stringify(this.state));
  }

  getItem(id) {
    return this.manifest.documents.find(d => d.id === id) ||
           (this.manifest.widgets || []).find(w => w.id === id);
  }

  open(id) {
    if (!this.state.openTabs.includes(id)) {
      this.state.openTabs.push(id);
    }
    this.state.activeTabId = id;
    this.state.regions.center = id;
    this.pushRecent(id);
    this.saveState();
  }

  openInSplit(id) {
    this.state.layoutMode = "compare";
    this.state.regions.splitRight = id;
    this.pushRecent(id);
    this.saveState();
  }

  setLayoutMode(mode) {
    this.state.layoutMode = mode;
    if (mode !== "compare") {
      this.state.regions.splitRight = null;
    }
    this.saveState();
  }

  activateTab(id) {
    this.state.activeTabId = id;
    this.state.regions.center = id;
    this.pushRecent(id);
    this.saveState();
  }

  closeTab(id) {
    this.state.openTabs = this.state.openTabs.filter(x => x !== id);
    if (this.state.activeTabId === id) {
      this.state.activeTabId = this.state.openTabs.slice(-1)[0] || null;
      this.state.regions.center = this.state.activeTabId;
    }
    this.saveState();
  }

  pushRecent(id) {
    this.state.recent = [id, ...this.state.recent.filter(x => x !== id)].slice(0, 10);
  }

  getRenderableRegions() {
    return {
      layoutMode: this.state.layoutMode,
      center: this.getItem(this.state.regions.center),
      splitRight: this.getItem(this.state.regions.splitRight),
      rightTop: this.getItem(this.state.regions.rightTop),
      rightMiddle: this.getItem(this.state.regions.rightMiddle),
      rightBottom: this.getItem(this.state.regions.rightBottom)
    };
  }
}

window.DashboardLayoutManager = DashboardLayoutManager;
