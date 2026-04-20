// Intelligence Page Editor — Main editor controller for markdown editing + AI review + publishing
// Manages workflow: Draft → AI-Review → Publish (to intelligence-draft branch)

class IntelligenceEditor {
  constructor() {
    this.reviewer = new AIContentReviewer();
    this.markdownProcessor = new MarkdownProcessor();
    this.state = {
      mode: 'draft', // 'draft' | 'review' | 'ai-review' | 'publish'
      isDraft: false,
      lastSaved: null,
      draftContent: '',
      reviewFeedback: null
    };
    this.init();
  }

  init() {
    // Create editor UI
    this.createEditorUI();
    this.setupEventListeners();
    this.loadDraft();
    this.setupAutoSave();
  }

  // Create editor HTML structure
  createEditorUI() {
    const editorHTML = `
      <!-- Edit Button -->
      <button id="edit-button" class="edit-button" title="Edit intelligence page">
        <span style="font-size: 14px;">✎</span> Edit
      </button>

      <!-- Editor Panel -->
      <div id="editor-panel" class="editor-panel">
        <!-- Header -->
        <div class="editor-header">
          <div class="editor-header-title">Intelligence Page Editor</div>
          <div class="editor-header-buttons">
            <button class="editor-btn" id="close-editor" title="Close editor">Close</button>
          </div>
        </div>

        <!-- Draft Mode -->
        <div id="editor-mode-draft" class="editor-mode active">
          <div class="editor-section">
            <label class="editor-label">Markdown Content</label>
            <textarea id="editor-textarea" class="editor-textarea" placeholder="Enter markdown content for intelligence page..."></textarea>
          </div>
          <div class="editor-section">
            <label class="editor-label">Live Preview</label>
            <div id="editor-preview" class="editor-preview"></div>
          </div>
        </div>

        <!-- AI Review Mode -->
        <div id="editor-mode-ai-review" class="editor-mode">
          <div id="ai-review-panel" class="ai-review-panel"></div>
        </div>

        <!-- Status Bar -->
        <div class="editor-status">
          <div class="editor-status-dot" id="editor-status-dot"></div>
          <span id="editor-status-text">Ready</span>
        </div>

        <!-- Action Buttons -->
        <div class="editor-buttons">
          <button class="editor-btn" id="btn-ai-review" title="Review with AI">🤖 Review with AI</button>
          <button class="editor-btn primary" id="btn-publish" title="Publish to draft branch">📤 Publish</button>
          <button class="editor-btn" id="btn-discard" title="Discard draft">🗑 Discard</button>
        </div>
      </div>

      <!-- API Key Modal -->
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

      <!-- GitHub Token Modal -->
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

      <!-- Confirmation Modal -->
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
    `;

    document.body.insertAdjacentHTML('beforeend', editorHTML);
  }

  // Setup event listeners
  setupEventListeners() {
    // Edit button
    document.getElementById('edit-button').addEventListener('click', () => this.openEditor());
    document.getElementById('close-editor').addEventListener('click', () => this.closeEditor());

    // Editor textarea
    const textarea = document.getElementById('editor-textarea');
    textarea.addEventListener('input', () => {
      this.state.draftContent = textarea.value;
      this.updatePreview();
      this.markDirty();
    });

    // Action buttons
    document.getElementById('btn-ai-review').addEventListener('click', () => this.reviewWithAI());
    document.getElementById('btn-publish').addEventListener('click', () => this.publish());
    document.getElementById('btn-discard').addEventListener('click', () => this.confirmDiscard());

    // API Key Modal
    document.getElementById('modal-api-key-ok').addEventListener('click', () => this.saveApiKey());
    document.getElementById('modal-api-key-cancel').addEventListener('click', () => this.closeModal('modal-api-key'));

    // GitHub Token Modal
    document.getElementById('modal-github-token-ok').addEventListener('click', () => this.saveGithubToken());
    document.getElementById('modal-github-token-cancel').addEventListener('click', () => this.closeModal('modal-github-token'));

    // Confirm Modal
    document.getElementById('modal-confirm-ok').addEventListener('click', () => this.handleConfirm());
    document.getElementById('modal-confirm-cancel').addEventListener('click', () => this.closeModal('modal-confirm'));
  }

  // Open editor panel
  openEditor() {
    document.getElementById('editor-panel').classList.add('open');
    const textarea = document.getElementById('editor-textarea');
    textarea.focus();
  }

  // Close editor panel
  closeEditor() {
    if (this.state.isDraft) {
      this.confirm('Unsaved changes will be lost. Close anyway?', () => {
        document.getElementById('editor-panel').classList.remove('open');
      });
    } else {
      document.getElementById('editor-panel').classList.remove('open');
    }
  }

  // Load draft from localStorage
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
      // Load current page content (convert HTML to markdown)
      this.loadCurrentContent();
    }
  }

  // Load current published content from page
  loadCurrentContent() {
    const contentDiv = document.querySelector('.section-label') || document.querySelector('.text-block');
    if (contentDiv) {
      // For now, show a placeholder
      const placeholder = '# Intelligence Page Content\n\nEdit this content directly.';
      this.state.draftContent = placeholder;
      document.getElementById('editor-textarea').value = placeholder;
      this.updatePreview();
    }
  }

  // Auto-save draft (debounced)
  setupAutoSave() {
    let timeout;
    document.getElementById('editor-textarea').addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveDraft();
      }, 1000); // Save after 1 second of inactivity
    });
  }

  // Save draft to localStorage
  saveDraft() {
    const draft = {
      content: this.state.draftContent,
      lastSaved: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('intelligence_draft', JSON.stringify(draft));
    this.setStatus('saved');
  }

  // Update live preview
  updatePreview() {
    const html = this.markdownProcessor.toHtml(this.state.draftContent);
    document.getElementById('editor-preview').innerHTML = html;
  }

  // Review with AI
  async reviewWithAI() {
    // Check API key
    if (!this.reviewer.hasApiKey()) {
      this.openModal('modal-api-key');
      return;
    }

    this.setStatus('reviewing', 'calling Claude API...');
    document.getElementById('btn-ai-review').disabled = true;

    try {
      // Get current published content
      const currentContent = this.getCurrentPublishedContent();

      // Call AI
      const result = await this.reviewer.reviewContent(this.state.draftContent, currentContent);

      // Display review
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

  // Get current published content from page
  getCurrentPublishedContent() {
    // Extract text from all sections
    const sections = Array.from(document.querySelectorAll('.text-block, .card-title, .card-sub, .table'));
    const text = sections.map(el => el.textContent).join('\n\n');
    return text || 'Current intelligence page content';
  }

  // Display AI review feedback
  displayAIReview(reviewText) {
    const panel = document.getElementById('ai-review-panel');
    panel.innerHTML = '';

    // Parse review into sections
    const parsed = this.reviewer.parseReview(reviewText);

    // Create collapsible sections
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
      if (content) {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'ai-review-section';

        const titleEl = document.createElement('div');
        titleEl.className = 'ai-review-section-title';
        titleEl.innerHTML = `${section.icon} ${section.title}`;

        const contentEl = document.createElement('div');
        contentEl.className = 'ai-review-content';

        // Format content based on type
        if (section.key === 'riskFactors' && Array.isArray(content)) {
          contentEl.innerHTML = content.map(item => `<div class="ai-review-risk">• ${item}</div>`).join('');
        } else if (section.key === 'recommendations' && Array.isArray(content)) {
          contentEl.innerHTML = content.map(item => `<div class="ai-review-recommendation">• ${item}</div>`).join('');
        } else {
          contentEl.textContent = typeof content === 'string' ? content : JSON.stringify(content);
        }

        sectionEl.appendChild(titleEl);
        sectionEl.appendChild(contentEl);
        panel.appendChild(sectionEl);
      }
    }

    // Add button to return to draft
    const backBtn = document.createElement('button');
    backBtn.className = 'editor-btn';
    backBtn.textContent = '← Back to Draft';
    backBtn.addEventListener('click', () => this.switchMode('draft'));
    panel.appendChild(backBtn);
  }

  // Publish to intelligence-draft branch
  async publish() {
    // Check GitHub token
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

        // Get current file SHA
        const currentSha = await this.getFileSha(owner, repo, branch, path, githubToken);

        // Prepare content
        const message = `Update intelligence page: ${new Date().toLocaleString()}`;
        const content = this.state.draftContent;

        // Create commit
        await this.commitToGithub(
          owner, repo, branch, path,
          content, message, currentSha,
          githubToken
        );

        // Create/update PR
        await this.createOrUpdatePR(owner, repo, githubToken);

        // Success
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

  // Get file SHA for update (GitHub API)
  async getFileSha(owner, repo, branch, path, token) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `token ${token}` }
      });

      if (response.status === 404) {
        // File doesn't exist yet
        return null;
      }

      const data = await response.json();
      return data.sha;
    } catch (error) {
      console.error('Failed to get file SHA:', error);
      return null; // Assume new file
    }
  }

  // Commit to GitHub
  async commitToGithub(owner, repo, branch, path, content, message, sha, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const body = {
      message: message,
      content: btoa(content), // Base64 encode
      branch: branch,
      committer: {
        name: 'Intelligence Editor',
        email: 'editor@status-site'
      }
    };

    if (sha) {
      body.sha = sha;
    }

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

  // Create or update PR
  async createOrUpdatePR(owner, repo, token) {
    const prTitle = 'Update Intelligence Page (AI-reviewed)';
    const prBody = `## Intelligence Page Update\n\nUpdated intelligence page content.\n\nReview this change before merging to main.`;

    // Check if PR exists
    const listUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&head=${owner}:intelligence-draft`;
    const listResponse = await fetch(listUrl, {
      headers: { 'Authorization': `token ${token}` }
    });

    const existingPRs = await listResponse.json();

    if (existingPRs.length > 0) {
      // Update existing PR
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
      // Create new PR
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

  // Confirm discard
  confirmDiscard() {
    if (!this.state.isDraft) {
      return;
    }
    this.confirm('Discard draft?', () => {
      this.clearDraft();
      this.loadCurrentContent();
      this.state.isDraft = false;
      this.setStatus('ready');
    });
  }

  // Clear draft
  clearDraft() {
    localStorage.removeItem('intelligence_draft');
    this.reviewer.clearCachedReview();
    this.state.draftContent = '';
    this.state.isDraft = false;
    document.getElementById('editor-textarea').value = '';
    this.updatePreview();
  }

  // Switch editor mode
  switchMode(mode) {
    const modes = ['draft', 'ai-review'];
    for (const m of modes) {
      document.getElementById(`editor-mode-${m}`).classList.remove('active');
    }
    document.getElementById(`editor-mode-${mode}`).classList.add('active');
    this.state.mode = mode;
  }

  // Set status indicator
  setStatus(status, text) {
    const dot = document.getElementById('editor-status-dot');
    const statusText = document.getElementById('editor-status-text');

    const statusMap = {
      'ready': { color: 'var(--teal)', text: 'Ready' },
      'saved': { color: 'var(--green)', text: 'Saved' },
      'dirty': { color: 'var(--gold)', text: 'Unsaved' },
      'reviewing': { color: 'var(--blue-light)', text: text || 'Reviewing...' },
      'published': { color: 'var(--green)', text: 'Published' },
      'error': { color: 'var(--red)', text: text || 'Error' }
    };

    const config = statusMap[status] || statusMap['ready'];
    dot.style.background = config.color;
    statusText.textContent = config.text;
  }

  // Mark as dirty (unsaved)
  markDirty() {
    this.state.isDraft = true;
    this.setStatus('dirty', 'Unsaved');
  }

  // Open modal
  openModal(modalId) {
    document.getElementById(modalId).classList.add('open');
  }

  // Close modal
  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
  }

  // Save API key
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

  // Save GitHub token
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

  // Confirm dialog
  confirm(message, callback) {
    this.confirmCallback = callback;
    document.getElementById('modal-confirm-text').textContent = message;
    this.openModal('modal-confirm');
  }

  // Handle confirm button
  handleConfirm() {
    this.closeModal('modal-confirm');
    if (this.confirmCallback) {
      this.confirmCallback();
      this.confirmCallback = null;
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.intelligenceEditor = new IntelligenceEditor();
});
