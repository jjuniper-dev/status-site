// Intelligence Page Editor — enhanced editor controller
// Adds file import, parsing, OCR/PDF/DOCX extraction, import-to-editor flow,
// upload analysis, and existing AI review + publish workflow.

class IntelligenceEditor {
  constructor() {
    this.reviewer = new AIContentReviewer();
    this.markdownProcessor = new MarkdownProcessor();

    this.state = {
      mode: 'draft',
      isDraft: false,
      lastSaved: null,
      draftContent: '',
      reviewFeedback: null,
      confirmCallback: null,
      pendingImportText: '',
      pendingImportMeta: null
    };

    this.supportedExtensions = ['txt', 'md', 'pdf', 'docx', 'jpg', 'jpeg', 'png'];
    this.toastTimer = null;
    this.init();
  }

  init() {
    this.createEditorUI();
    this.setupEventListeners();
    this.loadDraft();
    this.setupAutoSave();
  }

  createEditorUI() {
    const editorHTML = `
      <button id="edit-button" class="edit-button" title="Edit intelligence page">
        <span style="font-size: 14px;">✎</span> Edit
      </button>

      <div id="editor-panel" class="editor-panel">
        <div class="editor-header">
          <div class="editor-header-title">Intelligence Page Editor</div>
          <div class="editor-header-buttons">
            <button class="editor-btn" id="btn-import-content" title="Import file content">Import Content</button>
            <button class="editor-btn" id="close-editor" title="Close editor">Close</button>
          </div>
        </div>

        <div id="editor-mode-draft" class="editor-mode active">
          <div class="editor-section">
            <label class="editor-label">Markdown Content</label>

            <div id="editor-dropzone" class="editor-dropzone">
              <div class="editor-dropzone-title">Drop files here or use Import Content</div>
              <div class="editor-dropzone-sub">
                Supported: .txt, .md, .pdf, .docx, .jpg, .jpeg, .png
              </div>
            </div>

            <input
              id="editor-file-input"
              type="file"
              accept=".txt,.md,.pdf,.docx,.jpg,.jpeg,.png"
              style="display:none"
            >

            <div id="upload-status" class="editor-import-status" hidden></div>
            <div id="inline-toast" class="editor-inline-toast" hidden></div>

            <textarea
              id="editor-textarea"
              class="editor-textarea"
              placeholder="Enter markdown content for intelligence page..."
            ></textarea>
          </div>

          <div class="editor-section">
            <label class="editor-label">Live Preview</label>
            <div id="editor-preview" class="editor-preview"></div>
          </div>
        </div>

        <div id="editor-mode-ai-review" class="editor-mode">
          <div id="ai-review-panel" class="ai-review-panel"></div>
        </div>

        <div class="editor-status">
          <div class="editor-status-dot" id="editor-status-dot"></div>
          <span id="editor-status-text">Ready</span>
        </div>

        <div class="editor-buttons">
          <button class="editor-btn" id="btn-ai-review" title="Review with AI">🤖 Review with AI</button>
          <button class="editor-btn primary" id="btn-publish" title="Publish to draft branch">📤 Publish</button>
          <button class="editor-btn" id="btn-discard" title="Discard draft">🗑 Discard</button>
        </div>
      </div>

      <div id="modal-api-key" class="editor-modal">
        <div class="editor-modal-content">
          <div class="editor-modal-title">Anthropic API Key</div>
          <div class="editor-modal-text">Enter your Anthropic API key to enable AI content review.</div>
          <div class="editor-modal-warning">⚠️ Key stored in browser. Use short-lived tokens or revoke after use.</div>
          <input id="modal-api-key-input" class="editor-modal-input" type="password" placeholder="sk-ant-...">
          <div class="editor-modal-buttons">
            <button class="editor-btn" id="modal-api-key-cancel">Cancel</button>
            <button class="editor-btn primary" id="modal-api-key-ok">Save</button>
          </div>
        </div>
      </div>

      <div id="modal-github-token" class="editor-modal">
        <div class="editor-modal-content">
          <div class="editor-modal-title">GitHub Personal Access Token</div>
          <div class="editor-modal-text">Enter your GitHub token to publish changes.</div>
          <div class="editor-modal-warning">⚠️ Token stored in browser. Use short-lived tokens or revoke after use.</div>
          <input id="modal-github-token-input" class="editor-modal-input" type="password" placeholder="ghp_...">
          <div class="editor-modal-buttons">
            <button class="editor-btn" id="modal-github-token-cancel">Cancel</button>
            <button class="editor-btn primary" id="modal-github-token-ok">Save</button>
          </div>
        </div>
      </div>

      <div id="modal-confirm" class="editor-modal">
        <div class="editor-modal-content">
          <div class="editor-modal-title" id="modal-confirm-title">Confirm Action</div>
          <div class="editor-modal-text" id="modal-confirm-text">Are you sure?</div>
          <div class="editor-modal-buttons">
            <button class="editor-btn" id="modal-confirm-cancel">Cancel</button>
            <button class="editor-btn primary" id="modal-confirm-ok">Confirm</button>
          </div>
        </div>
      </div>

      <div id="modal-import-choice" class="editor-modal">
        <div class="editor-modal-content">
          <div class="editor-modal-title">Import Content</div>
          <div class="editor-modal-text" id="modal-import-text">
            Choose how to use the extracted content.
          </div>
          <div class="editor-modal-buttons import-choice-buttons">
            <button class="editor-btn" id="modal-import-append">Append</button>
            <button class="editor-btn" id="modal-import-replace">Replace</button>
            <button class="editor-btn primary" id="modal-import-standalone">Analyze Standalone</button>
            <button class="editor-btn" id="modal-import-cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', editorHTML);
  }

  setupEventListeners() {
    document.getElementById('edit-button').addEventListener('click', () => this.openEditor());
    document.getElementById('close-editor').addEventListener('click', () => this.closeEditor());

    const textarea = document.getElementById('editor-textarea');
    textarea.addEventListener('input', () => {
      this.state.draftContent = textarea.value;
      this.updatePreview();
      this.markDirty();
    });

    document.getElementById('btn-ai-review').addEventListener('click', () => this.reviewWithAI());
    document.getElementById('btn-publish').addEventListener('click', () => this.publish());
    document.getElementById('btn-discard').addEventListener('click', () => this.confirmDiscard());

    document.getElementById('modal-api-key-ok').addEventListener('click', () => this.saveApiKey());
    document.getElementById('modal-api-key-cancel').addEventListener('click', () => this.closeModal('modal-api-key'));

    document.getElementById('modal-github-token-ok').addEventListener('click', () => this.saveGithubToken());
    document.getElementById('modal-github-token-cancel').addEventListener('click', () => this.closeModal('modal-github-token'));

    document.getElementById('modal-confirm-ok').addEventListener('click', () => this.handleConfirm());
    document.getElementById('modal-confirm-cancel').addEventListener('click', () => this.closeModal('modal-confirm'));

    document.getElementById('btn-import-content').addEventListener('click', () => {
      document.getElementById('editor-file-input').click();
    });

    document.getElementById('editor-file-input').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await this.handleFileUpload(file);
      event.target.value = '';
    });

    document.getElementById('modal-import-append').addEventListener('click', async () => {
      this.closeModal('modal-import-choice');
      await this.commitImportedContent('append');
    });

    document.getElementById('modal-import-replace').addEventListener('click', async () => {
      this.closeModal('modal-import-choice');
      await this.commitImportedContent('replace');
    });

    document.getElementById('modal-import-standalone').addEventListener('click', async () => {
      this.closeModal('modal-import-choice');
      await this.commitImportedContent('standalone-analysis');
    });

    document.getElementById('modal-import-cancel').addEventListener('click', () => {
      this.state.pendingImportText = '';
      this.state.pendingImportMeta = null;
      this.closeModal('modal-import-choice');
    });

    this.setupDropZone();
  }

  setupDropZone() {
    const dropZone = document.getElementById('editor-dropzone');
    if (!dropZone) return;

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove('drag-active');
      });
    });

    dropZone.addEventListener('drop', async (event) => {
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      await this.handleFileUpload(file);
    });
  }

  openEditor() {
    document.getElementById('editor-panel').classList.add('open');
    document.getElementById('editor-textarea').focus();
  }

  closeEditor() {
    if (this.state.isDraft) {
      this.confirm('Unsaved changes will be lost. Close anyway?', () => {
        document.getElementById('editor-panel').classList.remove('open');
      });
    } else {
      document.getElementById('editor-panel').classList.remove('open');
    }
  }

  loadDraft() {
    const draft = localStorage.getItem('intelligence_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        this.state.draftContent = data.content || '';
        this.state.lastSaved = data.lastSaved;
        document.getElementById('editor-textarea').value = this.state.draftContent;
        this.updatePreview();
        this.state.isDraft = true;
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    } else {
      this.loadCurrentContent();
    }
  }

  loadCurrentContent() {
    const placeholder = [
      '# Intelligence Page Content',
      '',
      'Edit this content directly.',
      '',
      '## Imported Content',
      '',
      'Imported sections will appear here when you use the file import flow.'
    ].join('\n');

    this.state.draftContent = placeholder;
    document.getElementById('editor-textarea').value = placeholder;
    this.updatePreview();
  }

  setupAutoSave() {
    let timeout;
    document.getElementById('editor-textarea').addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this.saveDraft(), 1000);
    });
  }

  saveDraft() {
    const draft = {
      content: this.state.draftContent,
      lastSaved: new Date().toISOString(),
      version: '2.0'
    };
    localStorage.setItem('intelligence_draft', JSON.stringify(draft));
    this.setStatus('saved');
  }

  updatePreview() {
    const html = this.markdownProcessor.toHtml(this.state.draftContent);
    document.getElementById('editor-preview').innerHTML = html;
  }

  async handleFileUpload(file) {
    try {
      this.validateFile(file);
      this.showProgress(`Processing ${file.name}...`);

      const parser = await this.getParserForFile(file);
      const result = await parser.parse(file, {
        onProgress: (message) => this.showProgress(message)
      });

      const cleanText = (result?.text || '').trim();
      if (!cleanText) {
        throw new Error('No readable text could be extracted from this file.');
      }

      this.state.pendingImportText = cleanText;
      this.state.pendingImportMeta = {
        fileName: file.name,
        fileType: file.type || this.getExtension(file.name),
        parser: result?.metadata?.parser || 'unknown',
        importedAt: new Date().toISOString().slice(0, 10)
      };

      document.getElementById('modal-import-text').textContent =
        `Extracted content from ${file.name}. Choose whether to append it, replace the current draft, or analyze it as standalone content.`;

      this.hideProgress();
      this.openModal('modal-import-choice');
    } catch (error) {
      this.hideProgress();
      this.showToast(`Failed to process file: ${error.message}`, 'error');
      console.error(error);
    }
  }

  validateFile(file) {
    const ext = this.getExtension(file.name);
    if (!this.supportedExtensions.includes(ext)) {
      throw new Error('Unsupported file format. Supported: txt, md, pdf, docx, jpg, jpeg, png.');
    }
  }

  getExtension(fileName) {
    return (fileName.split('.').pop() || '').toLowerCase();
  }

  async getParserForFile(file) {
    const ext = this.getExtension(file.name);

    if (ext === 'txt') return new TextFileParser();
    if (ext === 'md') return new MarkdownFileParser();
    if (ext === 'pdf') return new PdfFileParser(this);
    if (ext === 'docx') return new DocxFileParser(this);
    if (['jpg', 'jpeg', 'png'].includes(ext)) return new ImageOcrParser(this);

    throw new Error('Unsupported file format.');
  }

  wrapImportedContent(text, meta) {
    return [
      '## Imported Content',
      `**Source:** ${meta.fileName}  `,
      `**Imported:** ${meta.importedAt}  `,
      `**Parser:** ${meta.parser}`,
      '',
      text
    ].join('\n');
  }

  async commitImportedContent(mode) {
    const wrapped = this.wrapImportedContent(this.state.pendingImportText, this.state.pendingImportMeta);

    if (mode === 'replace') {
      this.state.draftContent = wrapped;
      document.getElementById('editor-textarea').value = wrapped;
      this.updatePreview();
      this.markDirty();
      this.saveDraft();

      const shouldAnalyze = window.confirm('Run AI analysis on the imported content now?');
      if (shouldAnalyze) {
        await this.analyzeImportedContent(this.state.pendingImportText);
      }
    }

    if (mode === 'append') {
      const current = document.getElementById('editor-textarea').value.trim();
      const nextValue = current ? `${current}\n\n${wrapped}` : wrapped;
      this.state.draftContent = nextValue;
      document.getElementById('editor-textarea').value = nextValue;
      this.updatePreview();
      this.markDirty();
      this.saveDraft();

      const shouldAnalyze = window.confirm('Run AI analysis on the imported content now?');
      if (shouldAnalyze) {
        await this.analyzeImportedContent(this.state.pendingImportText);
      }
    }

    if (mode === 'standalone-analysis') {
      await this.analyzeImportedContent(this.state.pendingImportText, true);
    }

    this.state.pendingImportText = '';
    this.state.pendingImportMeta = null;
  }

  async analyzeImportedContent(importedText, standalone = false) {
    if (!this.reviewer.hasApiKey()) {
      this.openModal('modal-api-key');
      return;
    }

    try {
      this.showProgress('Analyzing Content...');
      this.setStatus('reviewing', 'Analyzing imported content...');

      const analysis = await this.reviewer.reviewContent(
        this.buildImportedAnalysisPrompt(importedText),
        this.getCurrentPublishedContent()
      );

      const parsed = this.reviewer.parseReview(analysis.review);
      const insightItems = this.toBulletList(parsed.whatChanged, parsed.whyItMatters, parsed.implications);
      const recommendationItems = this.toBulletList(parsed.recommendations);
      const riskItems = this.toBulletList(parsed.riskFactors, parsed.accuracy, parsed.consistency);

      const analysisMarkdown = [
        '## Key Insights',
        ...(insightItems.length ? insightItems.map(item => `- ${item}`) : ['- No key insights returned.']),
        '',
        '## Recommendations',
        ...(recommendationItems.length ? recommendationItems.map(item => `- ${item}`) : ['- No recommendations returned.']),
        '',
        '## Risks',
        ...(riskItems.length ? riskItems.map(item => `- ${item}`) : ['- No major risks returned.'])
      ].join('\n');

      if (standalone) {
        this.state.draftContent = analysisMarkdown;
        document.getElementById('editor-textarea').value = analysisMarkdown;
      } else {
        const current = document.getElementById('editor-textarea').value.trim();
        const combined = `${current}\n\n---\n\n${analysisMarkdown}`.trim();
        this.state.draftContent = combined;
        document.getElementById('editor-textarea').value = combined;
      }

      this.updatePreview();
      this.markDirty();
      this.saveDraft();
      this.hideProgress();
      this.setStatus('ready');
      this.showToast('Imported content analyzed and added to the draft.', 'success');
    } catch (error) {
      console.error('Imported analysis error:', error);
      this.hideProgress();
      this.setStatus('error', `Analysis failed: ${error.message}`);
      this.showToast(`Analysis failed: ${error.message}`, 'error');
    }
  }

  buildImportedAnalysisPrompt(text) {
    return [
      'Review this imported source content and produce material that helps update an enterprise architecture intelligence page.',
      '',
      'Focus on:',
      '- key insights',
      '- recommendations',
      '- risks',
      '',
      'Imported content:',
      '---',
      text,
      '---'
    ].join('\n');
  }

  toBulletList(...values) {
    const flattened = values.flatMap((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return String(value)
        .split('\n')
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean);
    });

    return [...new Set(flattened)];
  }

  async reviewWithAI() {
    if (!this.reviewer.hasApiKey()) {
      this.openModal('modal-api-key');
      return;
    }

    this.setStatus('reviewing', 'calling Claude API...');
    document.getElementById('btn-ai-review').disabled = true;

    try {
      const currentContent = this.getCurrentPublishedContent();
      const result = await this.reviewer.reviewContent(this.state.draftContent, currentContent);

      this.displayAIReview(result.review);
      this.switchMode('ai-review');
      this.reviewer.cacheReview(result);

      this.setStatus('ready');
    } catch (error) {
      console.error('AI Review Error:', error);
      this.setStatus('error', `Review failed: ${error.message}`);
      alert(`AI Review Error: ${error.message}`);
    } finally {
      document.getElementById('btn-ai-review').disabled = false;
    }
  }

  getCurrentPublishedContent() {
    const sections = Array.from(document.querySelectorAll('.text-block, .card-title, .card-sub, .table'));
    const text = sections.map(el => el.textContent).join('\n\n');
    return text || 'Current intelligence page content';
  }

  displayAIReview(reviewText) {
    const panel = document.getElementById('ai-review-panel');
    panel.innerHTML = '';

    const parsed = this.reviewer.parseReview(reviewText);

    const sections = [
      { key: 'whatChanged', title: 'What Changed', icon: '📝' },
      { key: 'whyItMatters', title: 'Why It Matters', icon: '⚡' },
      { key: 'consistency', title: 'Consistency Check', icon: '✓' },
      { key: 'accuracy', title: 'Accuracy', icon: '🎯' },
      { key: 'implications', title: 'Implications', icon: '→' },
      { key: 'riskFactors', title: 'Risk Factors', icon: '⚠️' },
      { key: 'recommendations', title: 'Recommendations', icon: '💡' },
      { key: 'overallAssessment', title: 'Overall Assessment', icon: '📊' }
    ];

    for (const section of sections) {
      const content = parsed[section.key];
      if (!content || (Array.isArray(content) && !content.length)) continue;

      const sectionEl = document.createElement('div');
      sectionEl.className = 'ai-review-section';

      const titleEl = document.createElement('div');
      titleEl.className = 'ai-review-section-title';
      titleEl.innerHTML = `${section.icon} ${section.title}`;

      const contentEl = document.createElement('div');
      contentEl.className = 'ai-review-content';

      if (section.key === 'riskFactors' && Array.isArray(content)) {
        contentEl.innerHTML = content.map(item => `<div class="ai-review-risk">• ${item}</div>`).join('');
      } else if (section.key === 'recommendations' && Array.isArray(content)) {
        contentEl.innerHTML = content.map(item => `<div class="ai-review-recommendation">• ${item}</div>`).join('');
      } else {
        contentEl.textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      }

      sectionEl.appendChild(titleEl);
      sectionEl.appendChild(contentEl);
      panel.appendChild(sectionEl);
    }

    const backBtn = document.createElement('button');
    backBtn.className = 'editor-btn';
    backBtn.textContent = '← Back to Draft';
    backBtn.addEventListener('click', () => this.switchMode('draft'));
    panel.appendChild(backBtn);
  }

  async publish() {
    if (!localStorage.getItem('github_token')) {
      this.openModal('modal-github-token');
      return;
    }

    this.confirm('Publish to intelligence-draft branch?', async () => {
      this.setStatus('publishing', 'committing changes...');
      document.getElementById('btn-publish').disabled = true;

      try {
        const githubToken = localStorage.getItem('github_token');
        const owner = 'jjuniper-dev';
        const repo = 'status-site';
        const branch = 'intelligence-draft';
        const path = 'intelligence.md';

        const currentSha = await this.getFileSha(owner, repo, branch, path, githubToken);
        const message = `Update intelligence page: ${new Date().toLocaleString()}`;
        const content = this.state.draftContent;

        await this.commitToGithub(owner, repo, branch, path, content, message, currentSha, githubToken);
        await this.createOrUpdatePR(owner, repo, githubToken);

        this.clearDraft();
        this.setStatus('published');
        this.switchMode('draft');

        alert('Published! Check GitHub for the PR on the intelligence-draft branch.');
        this.closeEditor();
      } catch (error) {
        console.error('Publish Error:', error);
        this.setStatus('error', `Publish failed: ${error.message}`);
        alert(`Publish Error: ${error.message}`);
      } finally {
        document.getElementById('btn-publish').disabled = false;
      }
    });
  }

  async getFileSha(owner, repo, branch, path, token) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `token ${token}` }
      });

      if (response.status === 404) return null;
      const data = await response.json();
      return data.sha;
    } catch (error) {
      console.error('Failed to get file SHA:', error);
      return null;
    }
  }

  async commitToGithub(owner, repo, branch, path, content, message, sha, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch,
      committer: {
        name: 'Intelligence Editor',
        email: 'editor@status-site'
      }
    };

    if (sha) body.sha = sha;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub commit failed: ${error.message}`);
    }

    return response.json();
  }

  async createOrUpdatePR(owner, repo, token) {
    const prTitle = 'Update Intelligence Page (AI-reviewed)';
    const prBody = `## Intelligence Page Update\n\nUpdated intelligence page content.\n\nReview this change before merging to main.`;

    const listUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&head=${owner}:intelligence-draft`;
    const listResponse = await fetch(listUrl, {
      headers: { 'Authorization': `token ${token}` }
    });

    const existingPRs = await listResponse.json();

    if (existingPRs.length > 0) {
      const prNumber = existingPRs[0].number;
      const updateUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

      await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: prBody })
      });
    } else {
      const createUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;

      await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: prTitle,
          head: 'intelligence-draft',
          base: 'main',
          body: prBody,
          maintainer_can_modify: true
        })
      });
    }
  }

  confirmDiscard() {
    if (!this.state.isDraft) return;

    this.confirm('Discard draft?', () => {
      this.clearDraft();
      this.loadCurrentContent();
      this.state.isDraft = false;
      this.setStatus('ready');
    });
  }

  clearDraft() {
    localStorage.removeItem('intelligence_draft');
    this.reviewer.clearCachedReview();
    this.state.draftContent = '';
    this.state.isDraft = false;
    document.getElementById('editor-textarea').value = '';
    this.updatePreview();
  }

  switchMode(mode) {
    ['draft', 'ai-review'].forEach((m) => {
      document.getElementById(`editor-mode-${m}`).classList.remove('active');
    });
    document.getElementById(`editor-mode-${mode}`).classList.add('active');
    this.state.mode = mode;
  }

  setStatus(status, text) {
    const dot = document.getElementById('editor-status-dot');
    const statusText = document.getElementById('editor-status-text');

    const statusMap = {
      ready: { color: 'var(--teal)', text: 'Ready' },
      saved: { color: 'var(--green)', text: 'Saved' },
      dirty: { color: 'var(--gold)', text: 'Unsaved' },
      reviewing: { color: 'var(--blue-light)', text: text || 'Reviewing...' },
      publishing: { color: 'var(--blue-light)', text: text || 'Publishing...' },
      published: { color: 'var(--green)', text: 'Published' },
      error: { color: 'var(--red)', text: text || 'Error' }
    };

    const config = statusMap[status] || statusMap.ready;
    dot.style.background = config.color;
    statusText.textContent = config.text;
  }

  markDirty() {
    this.state.isDraft = true;
    this.setStatus('dirty', 'Unsaved');
  }

  openModal(modalId) {
    document.getElementById(modalId).classList.add('open');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
  }

  saveApiKey() {
    const input = document.getElementById('modal-api-key-input');
    const key = input.value.trim();

    if (!key) {
      alert('Please enter an API key');
      return;
    }

    if (this.reviewer.setApiKey(key)) {
      input.value = '';
      this.closeModal('modal-api-key');
      this.setStatus('ready');
    }
  }

  saveGithubToken() {
    const input = document.getElementById('modal-github-token-input');
    const token = input.value.trim();

    if (!token) {
      alert('Please enter a GitHub token');
      return;
    }

    localStorage.setItem('github_token', token);
    input.value = '';
    this.closeModal('modal-github-token');
    this.setStatus('ready');
  }

  confirm(message, callback) {
    this.state.confirmCallback = callback;
    document.getElementById('modal-confirm-text').textContent = message;
    this.openModal('modal-confirm');
  }

  handleConfirm() {
    this.closeModal('modal-confirm');
    if (this.state.confirmCallback) {
      this.state.confirmCallback();
      this.state.confirmCallback = null;
    }
  }

  showProgress(message) {
    const el = document.getElementById('upload-status');
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
  }

  hideProgress() {
    const el = document.getElementById('upload-status');
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  showToast(message, type = 'info') {
    const el = document.getElementById('inline-toast');
    if (!el) return;
    el.textContent = message;
    el.className = `editor-inline-toast ${type}`;
    el.hidden = false;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4000);
  }

  async ensureScript(src, globalName, onLoad) {
    if (globalName && window[globalName]) return window[globalName];

    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      await new Promise((resolve, reject) => {
        if (globalName && window[globalName]) {
          resolve();
          return;
        }
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
      });
      if (onLoad) onLoad();
      return globalName ? window[globalName] : true;
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.src = src;
      script.onload = () => {
        if (onLoad) onLoad();
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load dependency: ${src}`));
      document.head.appendChild(script);
    });

    return globalName ? window[globalName] : true;
  }

  async ensurePdfJs() {
    await this.ensureScript(
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      'pdfjsLib',
      () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      }
    );
    return window.pdfjsLib;
  }

  async ensureTesseract() {
    await this.ensureScript(
      'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
      'Tesseract'
    );
    return window.Tesseract;
  }

  async ensureMammoth() {
    await this.ensureScript(
      'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.7.2/mammoth.browser.min.js',
      'mammoth'
    );
    return window.mammoth;
  }
}

class TextFileParser {
  async parse(file) {
    return {
      success: true,
      text: await file.text(),
      metadata: {
        parser: 'TextFileParser',
        fileName: file.name,
        fileType: file.type
      }
    };
  }
}

class MarkdownFileParser {
  async parse(file) {
    return {
      success: true,
      text: await file.text(),
      metadata: {
        parser: 'MarkdownFileParser',
        fileName: file.name,
        fileType: file.type
      }
    };
  }
}

class PdfFileParser {
  constructor(editor) {
    this.editor = editor;
  }

  async parse(file, { onProgress } = {}) {
    const pdfjsLib = await this.editor.ensurePdfJs();
    onProgress?.('Reading PDF...');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(`Extracting text from PDF page ${pageNum} of ${pdf.numPages}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ').trim();
      fullText += `${pageText}\n\n`;
    }

    return {
      success: true,
      text: fullText.trim(),
      metadata: {
        parser: 'PdfFileParser',
        fileName: file.name,
        fileType: file.type,
        pageCount: pdf.numPages
      }
    };
  }
}

class DocxFileParser {
  constructor(editor) {
    this.editor = editor;
  }

  async parse(file, { onProgress } = {}) {
    const mammoth = await this.editor.ensureMammoth();
    onProgress?.('Reading Word document...');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      success: true,
      text: (result.value || '').trim(),
      metadata: {
        parser: 'DocxFileParser',
        fileName: file.name,
        fileType: file.type,
        warnings: result.messages || []
      }
    };
  }
}

class ImageOcrParser {
  constructor(editor) {
    this.editor = editor;
  }

  async parse(file, { onProgress } = {}) {
    const Tesseract = await this.editor.ensureTesseract();
    onProgress?.('Running OCR on image...');

    const result = await Tesseract.recognize(file, 'eng', {
      logger: (msg) => {
        if (msg?.status) {
          const percent = typeof msg.progress === 'number'
            ? ` (${Math.round(msg.progress * 100)}%)`
            : '';
          onProgress?.(`${msg.status}${percent}`);
        }
      }
    });

    return {
      success: true,
      text: (result?.data?.text || '').trim(),
      metadata: {
        parser: 'ImageOcrParser',
        fileName: file.name,
        fileType: file.type
      }
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.intelligenceEditor = new IntelligenceEditor();
});