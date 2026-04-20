class IntelligencePageRenderer {
  constructor() {
    this.markdownProcessor = new MarkdownProcessor();
    this.init();
  }

  async init() {
    try {
      const response = await fetch('intelligence.md?cache=' + Date.now());
      if (!response.ok) throw new Error('Failed to load intelligence.md');

      const markdown = await response.text();

      const container = document.getElementById('intelligence-markdown-root');
      container.innerHTML = this.markdownProcessor.toHtml(markdown);

      window.__INTELLIGENCE_SOURCE__ = markdown;
      document.dispatchEvent(new CustomEvent('intelligence-source-loaded', {
        detail: { markdown }
      }));

    } catch (error) {
      console.error(error);
      document.getElementById('intelligence-markdown-root').innerHTML =
        '<div class="text-block">Failed to load intelligence source.</div>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new IntelligencePageRenderer();
});