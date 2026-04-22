class DashboardRenderer {
  constructor(markdownProcessor) {
    this.markdownProcessor = markdownProcessor;
  }

  async renderItem(item, container) {
    if (!item) {
      container.innerHTML = '<div class="card">Nothing selected</div>';
      return;
    }

    if (item.type === 'widget') {
      container.innerHTML = `<div class="card"><div class="card-title">${item.title}</div></div>`;
      return;
    }

    const markdown = await fetch(item.path).then(r => r.text());
    container.innerHTML = this.markdownProcessor.toHtml(markdown);
  }
}

window.DashboardRenderer = DashboardRenderer;
