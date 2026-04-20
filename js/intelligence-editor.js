// Intelligence Page Editor — self-contained markdown editor with AI review & GitHub publishing
// File import via native browser APIs (text, markdown, images) — no CDN dependencies

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
            <button class="editor-btn" id="btn-import-content" title="Import file">Import File</button>
            <button class="editor-btn" id="close-editor" title="Close editor">Close</button>
          </div>
        </div>

        <div id="editor-mode-draft" class="editor-mode active">
          <div class="editor-section">
            <label class="editor-label">Markdown Content</label>

            <div id="editor-dropzone" class="editor-dropzone">
              <div class="editor-dropzone-title">Drop files here or use Import File</div>
              <div class="editor-dropzone-sub">
                Supported: .txt, .md, .jpg, .jpeg, .png, .gif
              </div>
            </div>

            <input
              id="editor-file-input"
              type="file"
              accept=".txt,.md,.jpg,.jpeg,.png,.gif"
              style="display:none"
            >

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
            How would you like to use this content?
          </div>
          <div class="editor-modal-buttons import-choice-buttons">
            <button class="editor-btn" id="modal-import-append">Append to Draft</button>
            <button class="editor-btn" id="modal-import-replace">Replace Draft</button>
            <button class="editor-btn primary" id="modal-import-analyze">Analyze with AI</button>
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
      if (file) await this.handleFileUpload(file);
      event.target.value = '';
    });

    document.getElementById('editor-dropzone').addEventListener('dragover', (e) => {
      e.preventDefault();
      document.getElementById('editor-dropzone').classList.add('drag-active');
    });

    document.getElementById('editor-dropzone').addEventListener('dragleave', () => {
      document.getElementById('editor-dropzone').classList.remove('drag-active');
    });

    document.getElementById('editor-dropzone').addEventListener('drop', async (e) => {
      e.preventDefault();
      document.getElementById('editor-dropzone').classList.remove('drag-active');
      const file = e.dataTransfer.files?.[0];
      if (file) await this.handleFileUpload(file);
    });

    document.getElementById('modal-import-append').addEventListener('click', async () => {
      this.closeModal('modal-import-choice');
      await this.commitImportedContent('append');
    });

    document.getElementById('modal-import-replace').addEventListener('click', async () => {
      this.closeModal('modal-import-choice');
      await this.commitImportedContent('replace');
    });

    document.getElementById('modal-import-analyze').addEventListener('click', async () => {
      this.closeModal('modal-import-choice');
      await this.analyzeImportedContent();
    });

    document.getElementById('modal-import-cancel').addEventListener('click', () => {
      this.closeModal('modal-import-choice');
    });
  }

  loadDraft() {
    const stored = localStorage.getItem('intelligence_draft');
    if (stored) {
      const draft = JSON.parse(stored);
      this.state.draftContent = draft.content || '';
      this.state.lastSaved = draft.lastSaved;
      document.getElementById('editor-textarea').value = this.state.draftContent;
      this.updatePreview();
      this.setStatus('saved', `Draft loaded (${new Date(draft.lastSaved).toLocaleString()})`);
    } else {
      this.setStatus('ready', 'Ready to edit');
    }
  }

  saveDraft() {
    if (!this.state.isDraft) return;

    const draft = {
      content: this.state.draftContent,
      lastSaved: new Date().toISOString(),
      version: '1.2'
    };

    localStorage.setItem('intelligence_draft', JSON.stringify(draft));
    this.state.lastSaved = draft.lastSaved;
    this.setStatus('saved', `Saved ${new Date().toLocaleTimeString()}`);
  }

  setupAutoSave() {
    let timeout;
    document.getElementById('editor-textarea').addEventListener('input', () => {
      clearTimeout(timeout);
      this.markDirty();
      timeout = setTimeout(() => this.saveDraft(), 1000);
    });
  }

  markDirty() {
    this.state.isDraft = true;
    this.setStatus('unsaved', 'Unsaved changes');
  }

  openEditor() {
    document.getElementById('editor-panel').classList.add('open');
    this.loadDraft();
  }

  closeEditor() {
    document.getElementById('editor-panel').classList.remove('open');
  }

  updatePreview() {
    const html = this.markdownProcessor.toHtml(this.state.draftContent);
    document.getElementById('editor-preview').innerHTML = html;
  }

  setStatus(state, text) {
    const dot = document.getElementById('editor-status-dot');
    const textEl = document.getElementById('editor-status-text');
    dot.className = `editor-status-dot ${state}`;
    textEl.textContent = text;
  }

  switchMode(mode) {
    document.querySelectorAll('.editor-mode').forEach(el => el.classList.remove('active'));
    document.getElementById(`editor-mode-${mode}`).classList.add('active');
    this.state.mode = mode;
  }

  openModal(modalId) {
    document.getElementById(modalId).classList.add('open');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
  }

  saveApiKey() {
    const key = document.getElementById('modal-api-key-input').value.trim();
    if (!key) {
      alert('Please enter an API key');
      return;
    }
    this.reviewer.setApiKey(key);
    this.closeModal('modal-api-key');
    alert('API key saved to browser storage');
  }

  saveGithubToken() {
    const token = document.getElementById('modal-github-token-input').value.trim();
    if (!token) {
      alert('Please enter a GitHub token');
      return;
    }
    localStorage.setItem('github_token', token);
    this.closeModal('modal-github-token');
    alert('GitHub token saved to browser storage');
  }

  confirmDiscard() {
    this.confirmAction(
      'Discard Draft?',
      'This will delete your current draft. This cannot be undone.',
      () => this.discardDraft()
    );
  }

  confirmAction(title, text, callback) {
    document.getElementById('modal-confirm-title').textContent = title;
    document.getElementById('modal-confirm-text').textContent = text;
    this.state.confirmCallback = callback;
    this.openModal('modal-confirm');
  }

  handleConfirm() {
    if (this.state.confirmCallback) {
      this.state.confirmCallback();
      this.state.confirmCallback = null;
    }
    this.closeModal('modal-confirm');
  }

  discardDraft() {
    localStorage.removeItem('intelligence_draft');
    this.state.draftContent = '';
    this.state.isDraft = false;
    document.getElementById('editor-textarea').value = '';
    this.updatePreview();
    this.setStatus('ready', 'Draft discarded');
  }

  clearDraft() {
    localStorage.removeItem('intelligence_draft');
    this.state.draftContent = '';
    this.state.isDraft = false;
    document.getElementById('editor-textarea').value = '';
    this.updatePreview();
  }

  async reviewWithAI() {
    if (!this.state.draftContent.trim()) {
      alert('Please enter some content to review');
      return;
    }

    if (!this.reviewer.hasApiKey()) {
      document.getElementById('modal-api-key-input').value = '';
      this.openModal('modal-api-key');
      return;
    }

    this.setStatus('loading', 'Requesting AI review...');

    try {
      const currentContent = this.extractCurrentContent();
      const review = await this.reviewer.reviewContent(this.state.draftContent, currentContent);

      this.state.reviewFeedback = review;
      this.displayReview(review);
      this.switchMode('ai-review');
      this.setStatus('completed', 'AI review complete');
    } catch (error) {
      this.setStatus('error', `Review failed: ${error.message}`);
      alert(`AI review failed: ${error.message}`);
    }
  }

  extractCurrentContent() {
    // Extract text from currently rendered intelligence page
    const content = document.body.innerText || '';
    return content.substring(0, 5000); // First 5000 chars for context
  }

  displayReview(review) {
    const panel = document.getElementById('ai-review-panel');
    panel.classList.add('active');

    let html = '<div class="ai-review-section">';
    html += '<div class="ai-review-section-title">📋 AI Analysis</div>';

    if (review.whatChanged) {
      html += '<div class="ai-review-content"><strong>What Changed:</strong><br>' + this.escapeHtml(review.whatChanged) + '</div>';
    }
    if (review.whyItMatters) {
      html += '<div class="ai-review-content"><strong>Why It Matters:</strong><br>' + this.escapeHtml(review.whyItMatters) + '</div>';
    }
    if (review.consistency) {
      html += '<div class="ai-review-content"><strong>Consistency:</strong><br>' + this.escapeHtml(review.consistency) + '</div>';
    }
    if (review.accuracy) {
      html += '<div class="ai-review-content"><strong>Accuracy:</strong><br>' + this.escapeHtml(review.accuracy) + '</div>';
    }

    if (review.implications) {
      html += '<div class="ai-review-risk"><strong>⚠️ Implications:</strong><br>' + this.escapeHtml(review.implications) + '</div>';
    }
    if (review.riskFactors && review.riskFactors.length) {
      html += '<div class="ai-review-risk"><strong>⚠️ Risk Factors:</strong><br>' + this.escapeHtml(review.riskFactors.join(', ')) + '</div>';
    }
    if (review.recommendations && review.recommendations.length) {
      html += '<div class="ai-review-recommendation"><strong>✅ Recommendations:</strong><br>' + this.escapeHtml(review.recommendations.join('\n')) + '</div>';
    }

    html += '</div>';
    panel.innerHTML = html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async handleFileUpload(file) {
    try {
      const ext = this.getFileExtension(file.name);

      if (!['txt', 'md', 'jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
        alert('Unsupported file type. Supported: .txt, .md, .jpg, .jpeg, .png, .gif');
        return;
      }

      this.setStatus('loading', `Reading ${file.name}...`);

      let content = '';
      let isImage = false;

      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
        // Read image as base64
        content = await this.readImageAsBase64(file);
        isImage = true;
      } else {
        // Read text file
        content = await this.readTextFile(file);
      }

      this.state.pendingImportText = content;
      this.state.pendingImportMeta = {
        fileName: file.name,
        fileType: ext,
        isImage,
        importedAt: new Date().toISOString().slice(0, 10)
      };

      document.getElementById('modal-import-text').textContent = isImage
        ? `Imported image: ${file.name}. Should this be analyzed for relevance and incorporation?`
        : `Extracted ${content.length} characters from ${file.name}. How should this content be used?`;

      this.setStatus('ready', 'File imported');
      this.openModal('modal-import-choice');
    } catch (error) {
      this.setStatus('error', `Import failed: ${error.message}`);
      alert(`Failed to import file: ${error.message}`);
    }
  }

  getFileExtension(fileName) {
    return (fileName.split('.').pop() || '').toLowerCase();
  }

  readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  readImageAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  }

  async commitImportedContent(mode) {
    const { isImage } = this.state.pendingImportMeta;

    if (isImage) {
      // For images, create markdown with image reference
      const imageMarkdown = `\n![Imported: ${this.state.pendingImportMeta.fileName}](${this.state.pendingImportText})\n`;
      if (mode === 'replace') {
        this.state.draftContent = imageMarkdown;
      } else {
        this.state.draftContent += imageMarkdown;
      }
    } else {
      // For text, include as code block or plain text
      const textBlock = `\n## Imported from ${this.state.pendingImportMeta.fileName}\n\n${this.state.pendingImportText}\n`;
      if (mode === 'replace') {
        this.state.draftContent = textBlock;
      } else {
        this.state.draftContent += textBlock;
      }
    }

    document.getElementById('editor-textarea').value = this.state.draftContent;
    this.updatePreview();
    this.markDirty();
    this.setStatus('ready', 'Content imported');
  }

  async analyzeImportedContent() {
    if (!this.reviewer.hasApiKey()) {
      document.getElementById('modal-api-key-input').value = '';
      this.openModal('modal-api-key');
      return;
    }

    this.setStatus('loading', 'AI analyzing imported content...');

    try {
      const { pendingImportText, pendingImportMeta } = this.state;
      const prompt = pendingImportMeta.isImage
        ? `You are analyzing an imported image document for an enterprise AI governance intelligence page.
           Assess: (1) Is this content relevant to AI governance/architecture? (2) What sections should it inform?
           (3) What specific insights should be extracted? (4) Should it be incorporated as-is or synthesized?`
        : `You are analyzing imported document content for an enterprise AI governance intelligence page.
           Assess: (1) Is this content relevant and accurate? (2) What sections should it inform?
           (3) What specific insights are valuable? (4) Should it be incorporated directly or synthesized?`;

      const analysis = await this.reviewer.analyzeImportedContent(
        pendingImportText,
        prompt,
        pendingImportMeta
      );

      this.displayImportAnalysis(analysis);
      this.setStatus('completed', 'Analysis complete');
    } catch (error) {
      this.setStatus('error', `Analysis failed: ${error.message}`);
      alert(`AI analysis failed: ${error.message}`);
    }
  }

  displayImportAnalysis(analysis) {
    const panel = document.getElementById('ai-review-panel');
    panel.classList.add('active');
    this.switchMode('ai-review');

    let html = '<div class="ai-review-section">';
    html += '<div class="ai-review-section-title">🔍 Import Analysis</div>';

    if (analysis.isRelevant !== false) {
      html += '<div class="ai-review-recommendation"><strong>✅ Relevant:</strong> ' + this.escapeHtml(analysis.relevance || 'Content is relevant to intelligence page') + '</div>';
    } else {
      html += '<div class="ai-review-risk"><strong>⚠️ Relevance:</strong> ' + this.escapeHtml(analysis.relevance || 'Content may not be relevant') + '</div>';
    }

    if (analysis.suggestedSections) {
      html += '<div class="ai-review-content"><strong>Suggested Sections:</strong><br>' + this.escapeHtml(analysis.suggestedSections) + '</div>';
    }

    if (analysis.keyInsights) {
      html += '<div class="ai-review-content"><strong>Key Insights:</strong><br>' + this.escapeHtml(analysis.keyInsights) + '</div>';
    }

    if (analysis.incorporationApproach) {
      html += '<div class="ai-review-recommendation"><strong>How to Incorporate:</strong><br>' + this.escapeHtml(analysis.incorporationApproach) + '</div>';
    }

    if (analysis.concerns) {
      html += '<div class="ai-review-risk"><strong>⚠️ Concerns:</strong><br>' + this.escapeHtml(analysis.concerns) + '</div>';
    }

    html += '</div>';
    html += '<div style="padding-top: 12px; border-top: 1px solid var(--border); margin-top: 12px;">';
    html += '<button class="editor-btn" id="btn-append-after-analysis" style="margin-right: 8px;">Append to Draft</button>';
    html += '<button class="editor-btn primary" id="btn-accept-analysis">Accept & Incorporate</button>';
    html += '</div>';

    panel.innerHTML = html;

    document.getElementById('btn-append-after-analysis').addEventListener('click', async () => {
      await this.commitImportedContent('append');
      this.switchMode('draft');
    });

    document.getElementById('btn-accept-analysis').addEventListener('click', async () => {
      await this.commitImportedContent('append');
      this.switchMode('draft');
      alert('Content appended to draft. Review and edit as needed before publishing.');
    });
  }

  async publish() {
    if (!this.state.draftContent.trim()) {
      alert('Please enter content to publish');
      return;
    }

    if (!localStorage.getItem('github_token')) {
      document.getElementById('modal-github-token-input').value = '';
      this.openModal('modal-github-token');
      return;
    }

    this.setStatus('publishing', 'Publishing to GitHub...');

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
      this.setStatus('published', 'Published! Check GitHub for the PR.');
      this.switchMode('draft');
      alert('✅ Published! The PR has been created on the intelligence-draft branch.');
      this.closeEditor();
    } catch (error) {
      this.setStatus('error', `Publish failed: ${error.message}`);
      alert(`Publish failed: ${error.message}`);
    }
  }

  async getFileSha(owner, repo, branch, path, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `token ${token}` }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data.sha;
  }

  async commitToGithub(owner, repo, branch, path, content, message, sha, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const body = {
      message,
      content: btoa(content),
      branch
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
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }
  }

  async createOrUpdatePR(owner, repo, token) {
    // Check if PR exists
    const listUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&head=${owner}:intelligence-draft`;
    const listResponse = await fetch(listUrl, {
      headers: { 'Authorization': `token ${token}` }
    });

    if (!listResponse.ok) {
      throw new Error('Failed to list PRs');
    }

    const prs = await listResponse.json();
    const existingPR = prs[0];

    if (existingPR) {
      // Update existing PR
      const updateUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${existingPR.number}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: `**Updated:** ${new Date().toLocaleString()}\n\n*AI-reviewed intelligence page updates*`
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update PR');
      }
    } else {
      // Create new PR
      const createUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Intelligence Page Update',
          head: 'intelligence-draft',
          base: 'main',
          body: `**Created:** ${new Date().toLocaleString()}\n\n*AI-reviewed intelligence page updates*`
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create PR');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.intelligenceEditor = new IntelligenceEditor();
});
