class IntelligenceLibrary {
  constructor() {
    this.owner = 'jjuniper-dev';
    this.repo = 'status-site';
    this.path = 'intelligence';

    this.docs = [];
    this.filtered = [];
    this.activeTags = new Set();
    this.search = '';

    this.init();
  }

  async init() {
    await this.loadDocs();
    this.renderTags();
    this.applyFilters();
  }

  async loadDocs() {
    const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}`);
    const files = await res.json();

    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    for (const file of mdFiles) {
      const text = await fetch(file.download_url).then(r => r.text());
      const parsed = this.parse(text);
      this.docs.push({ ...parsed, path: file.path });
    }
  }

  parse(text) {
    if (!text.startsWith('---')) return { content: text, tags: [] };

    const end = text.indexOf('---', 3);
    const fm = text.substring(3, end).trim();
    const body = text.substring(end + 3);

    const meta = {};
    fm.split('\n').forEach(line => {
      const [k, v] = line.split(':');
      if (!k) return;
      meta[k.trim()] = v.trim();
    });

    if (meta.tags) {
      meta.tags = meta.tags.replace(/\[|\]/g,'').split(',').map(t=>t.trim());
    } else {
      meta.tags = [];
    }

    return { ...meta, content: body };
  }

  renderTags() {
    const all = [...new Set(this.docs.flatMap(d=>d.tags))];
    const el = document.getElementById('tag-filter');
    el.innerHTML = all.map(t=>`<span class="tag-chip" data-tag="${t}">${t}</span>`).join('');

    el.querySelectorAll('.tag-chip').forEach(chip => {
      chip.onclick = () => {
        const t = chip.dataset.tag;
        if (this.activeTags.has(t)) this.activeTags.delete(t);
        else this.activeTags.add(t);
        chip.classList.toggle('active');
        this.applyFilters();
      };
    });
  }

  applyFilters() {
    this.filtered = this.docs.filter(d => {
      const tagOk = this.activeTags.size === 0 || d.tags.some(t=>this.activeTags.has(t));
      const searchOk = !this.search || (d.title||'').toLowerCase().includes(this.search);
      return tagOk && searchOk;
    });

    this.renderList();
    if (this.filtered[0]) this.select(this.filtered[0]);
  }

  renderList() {
    const el = document.getElementById('intel-list');
    el.innerHTML = this.filtered.map(d=>`
      <div class="intel-item" data-path="${d.path}">
        <div class="intel-title">${d.title||d.path}</div>
        <div class="intel-meta">${d.date||''}</div>
      </div>
    `).join('');

    el.querySelectorAll('.intel-item').forEach(i => {
      i.onclick = () => {
        const doc = this.docs.find(d=>d.path===i.dataset.path);
        this.select(doc);
      };
    });
  }

  select(doc) {
    const html = new MarkdownProcessor().toHtml(doc.content);
    document.getElementById('intel-content').innerHTML = html;

    window.__INTELLIGENCE_SOURCE__ = doc.content;
    window.__INTELLIGENCE_DOC_PATH__ = doc.path;

    document.dispatchEvent(new CustomEvent('intelligence-doc-changed',{detail:doc}));
  }
}

document.addEventListener('DOMContentLoaded',()=>new IntelligenceLibrary());