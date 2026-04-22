const STATUSES = [
  { key: 'backlog', label: 'Backlog', description: 'Captured and queued for sequencing.' },
  { key: 'this_week', label: 'This Week', description: 'Committed scope for current cycle.' },
  { key: 'in_progress', label: 'In Progress', description: 'Actively being executed.' },
  { key: 'blocked', label: 'Blocked', description: 'Waiting on dependency or decision.' },
  { key: 'done', label: 'Done', description: 'Completed and closed.' }
];

const PRIORITIES = ['high', 'medium', 'low'];
const DEFAULT_GROUP = 'General';

const state = {
  cards: [],
  search: '',
  group: 'all',
  status: 'all',
  priority: 'all',
  editingId: null,
  dragId: null
};

const cfg = window.KANBAN_CONFIG || {};
const root = document.getElementById('kanban-root');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function uid() {
  return `task-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function normalizeCard(card = {}) {
  const statusKeys = new Set(STATUSES.map(s => s.key));
  const priority = PRIORITIES.includes(card.priority) ? card.priority : 'medium';

  return {
    id: card.id || uid(),
    title: (card.title || 'Untitled task').trim(),
    group: (card.group || DEFAULT_GROUP).trim(),
    status: statusKeys.has(card.status) ? card.status : 'backlog',
    priority,
    notes: (card.notes || '').trim(),
    tags: Array.isArray(card.tags)
      ? card.tags.map(tag => String(tag).trim()).filter(Boolean)
      : String(card.tags || '').split(',').map(tag => tag.trim()).filter(Boolean)
  };
}

function getStorageKey() {
  return cfg.storageKey || 'status-site.kanban.board';
}

function loadStoredCards() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalizeCard);
  } catch {
    return null;
  }
}

function saveCards() {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state.cards));
  } catch {
    // Storage may be unavailable (private mode / file protocol / strict browser settings).
  }
}

async function loadArtifacts() {
  if (!cfg.artifactIndexPath) return [];

  try {
    const response = await fetch(`${cfg.artifactIndexPath}?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return [];

    const payload = await response.json();
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.artifacts)
        ? payload.artifacts
        : [];

    return list.slice(0, 20).map((artifact, idx) => normalizeCard({
      id: `artifact-${artifact.id || idx}`,
      title: artifact.title || artifact.name || `Artifact ${idx + 1}`,
      group: cfg.artifactGroup || 'Artifacts',
      status: cfg.artifactStatus || 'this_week',
      priority: cfg.artifactPriority || 'medium',
      notes: artifact.summary || artifact.description || artifact.url || '',
      tags: [artifact.type, artifact.owner, artifact.status].filter(Boolean)
    }));
  } catch {
    return [];
  }
}

function matchesFilter(card) {
  const haystack = `${card.title} ${card.group} ${card.notes} ${card.tags.join(' ')}`.toLowerCase();
  const searchOk = !state.search || haystack.includes(state.search.toLowerCase());
  const groupOk = state.group === 'all' || card.group === state.group;
  const statusOk = state.status === 'all' || card.status === state.status;
  const priorityOk = state.priority === 'all' || card.priority === state.priority;
  return searchOk && groupOk && statusOk && priorityOk;
}

function groupedCards() {
  const filtered = state.cards.filter(matchesFilter);
  const groups = {};

  for (const status of STATUSES) {
    groups[status.key] = filtered.filter(card => card.status === status.key);
  }

  return groups;
}

function getGroups() {
  return [...new Set(state.cards.map(card => card.group).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function renderSummary() {
  const total = state.cards.length;
  const inProgress = state.cards.filter(c => c.status === 'in_progress').length;
  const blocked = state.cards.filter(c => c.status === 'blocked').length;
  const done = state.cards.filter(c => c.status === 'done').length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  return `
    <section class="kanban-summary" aria-label="Board summary">
      <article class="kanban-summary-card">
        <div class="kanban-summary-label">Total Tasks</div>
        <div class="kanban-summary-value">${total}</div>
        <div class="kanban-summary-sub">Across all lanes</div>
      </article>
      <article class="kanban-summary-card">
        <div class="kanban-summary-label">In Progress</div>
        <div class="kanban-summary-value">${inProgress}</div>
        <div class="kanban-summary-sub">Active execution items</div>
      </article>
      <article class="kanban-summary-card">
        <div class="kanban-summary-label">Blocked</div>
        <div class="kanban-summary-value">${blocked}</div>
        <div class="kanban-summary-sub">Needs unblocking action</div>
      </article>
      <article class="kanban-summary-card">
        <div class="kanban-summary-label">Completion</div>
        <div class="kanban-summary-value">${completion}%</div>
        <div class="kanban-summary-sub">Done / total</div>
      </article>
    </section>
  `;
}

function renderToolbar() {
  const groupOptions = getGroups().map(g => `<option value="${escapeHtml(g)}" ${state.group === g ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('');

  return `
    <section class="kanban-toolbar" aria-label="Kanban controls">
      <div class="kanban-toolbar-left">
        <div class="kanban-field">
          <label for="kanban-search">Search</label>
          <input id="kanban-search" class="kanban-input" type="text" value="${escapeHtml(state.search)}" placeholder="Title, notes, tags" />
        </div>
        <div class="kanban-field">
          <label for="kanban-group">Group</label>
          <select id="kanban-group" class="kanban-select">
            <option value="all">All groups</option>
            ${groupOptions}
          </select>
        </div>
        <div class="kanban-field">
          <label for="kanban-status">Status</label>
          <select id="kanban-status" class="kanban-select">
            <option value="all">All statuses</option>
            ${STATUSES.map(s => `<option value="${s.key}" ${state.status === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="kanban-field">
          <label for="kanban-priority">Priority</label>
          <select id="kanban-priority" class="kanban-select">
            <option value="all">All priorities</option>
            ${PRIORITIES.map(p => `<option value="${p}" ${state.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="kanban-toolbar-right">
        <button id="kanban-add" class="kanban-button" type="button">+ Add Task</button>
        <button id="kanban-clear-filters" class="kanban-button-secondary" type="button">Clear Filters</button>
        <button id="kanban-reset-board" class="kanban-button-danger" type="button">Reset Board</button>
      </div>
    </section>
  `;
}

function renderCard(card) {
  const tags = card.tags.map(tag => `<span class="kanban-tag">${escapeHtml(tag)}</span>`).join('');
  const notes = escapeHtml(card.notes).replaceAll('\n', '<br>');

  return `
    <article class="kanban-card" draggable="true" data-id="${card.id}">
      <div class="kanban-card-header">
        <h3 class="kanban-card-title">${escapeHtml(card.title)}</h3>
        <span class="kanban-card-priority ${card.priority}">${card.priority}</span>
      </div>
      <div class="kanban-group">${escapeHtml(card.group)}</div>
      ${card.notes ? `<div class="kanban-notes">${notes}</div>` : ''}
      ${tags ? `<div class="kanban-tags">${tags}</div>` : ''}
      <div class="kanban-card-actions">
        <button class="kanban-link-button" type="button" data-action="edit" data-id="${card.id}">Edit</button>
        <button class="kanban-link-button" type="button" data-action="delete" data-id="${card.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderBoard() {
  const byStatus = groupedCards();

  const columns = STATUSES.map(status => {
    const cards = byStatus[status.key] || [];
    const body = cards.length
      ? cards.map(renderCard).join('')
      : '<div class="kanban-empty">No tasks in this lane.</div>';

    return `
      <section class="kanban-column" data-status="${status.key}">
        <header class="kanban-column-header">
          <div class="kanban-column-label">${status.label}</div>
          <div class="kanban-column-meta">
            <div class="kanban-count">${cards.length}</div>
            <div class="kanban-column-desc">${status.description}</div>
          </div>
        </header>
        <div class="kanban-column-body" data-dropzone="${status.key}">
          ${body}
        </div>
      </section>
    `;
  }).join('');

  return `
    <section class="kanban-board-wrap">
      <div class="kanban-board">${columns}</div>
    </section>
  `;
}

function render() {
  root.innerHTML = `
    <div class="kanban-shell">
      ${renderSummary()}
      ${renderToolbar()}
      ${renderBoard()}
    </div>
  `;

  bindUI();
}

function openModal(card) {
  state.editingId = card?.id || null;

  const modal = document.createElement('div');
  modal.className = 'kanban-modal-backdrop';
  modal.innerHTML = `
    <div class="kanban-modal" role="dialog" aria-modal="true" aria-label="Task editor">
      <div class="kanban-modal-header">
        <div class="kanban-modal-title">${card ? 'Edit Task' : 'Add Task'}</div>
        <button class="kanban-button-secondary" type="button" data-modal-close>Close</button>
      </div>
      <form class="kanban-modal-body" id="kanban-form">
        <div class="kanban-field">
          <label for="task-title">Title</label>
          <input id="task-title" class="kanban-input" name="title" required value="${escapeHtml(card?.title || '')}" />
        </div>

        <div class="kanban-modal-grid">
          <div class="kanban-field">
            <label for="task-group">Group</label>
            <input id="task-group" class="kanban-input" name="group" value="${escapeHtml(card?.group || DEFAULT_GROUP)}" />
          </div>
          <div class="kanban-field">
            <label for="task-status">Status</label>
            <select id="task-status" class="kanban-select" name="status">
              ${STATUSES.map(s => `<option value="${s.key}" ${(card?.status || 'backlog') === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="kanban-modal-grid">
          <div class="kanban-field">
            <label for="task-priority">Priority</label>
            <select id="task-priority" class="kanban-select" name="priority">
              ${PRIORITIES.map(p => `<option value="${p}" ${(card?.priority || 'medium') === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="kanban-field">
            <label for="task-tags">Tags (comma separated)</label>
            <input id="task-tags" class="kanban-input" name="tags" value="${escapeHtml((card?.tags || []).join(', '))}" />
          </div>
        </div>

        <div class="kanban-field">
          <label for="task-notes">Notes</label>
          <textarea id="task-notes" class="kanban-textarea" name="notes">${escapeHtml(card?.notes || '')}</textarea>
        </div>
      </form>
      <div class="kanban-modal-footer">
        <div>${card ? `Editing ID: <strong>${escapeHtml(card.id)}</strong>` : 'Create a new task card.'}</div>
        <div class="kanban-modal-footer-right">
          ${card ? '<button class="kanban-button-danger" type="button" id="modal-delete">Delete</button>' : ''}
          <button class="kanban-button-secondary" type="button" data-modal-close>Cancel</button>
          <button class="kanban-button" type="submit" form="kanban-form">Save</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.remove();
    state.editingId = null;
  };

  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.hasAttribute('data-modal-close')) {
      close();
    }
  });

  modal.querySelector('#kanban-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.target);
    const next = normalizeCard({
      id: card?.id,
      title: data.get('title'),
      group: data.get('group'),
      status: data.get('status'),
      priority: data.get('priority'),
      notes: data.get('notes'),
      tags: data.get('tags')
    });

    if (card) {
      state.cards = state.cards.map(item => item.id === card.id ? next : item);
    } else {
      state.cards.unshift(next);
    }

    saveCards();
    close();
    render();
  });

  const deleteBtn = modal.querySelector('#modal-delete');
  if (deleteBtn && card) {
    deleteBtn.addEventListener('click', () => {
      state.cards = state.cards.filter(item => item.id !== card.id);
      saveCards();
      close();
      render();
    });
  }
}

function bindUI() {
  root.querySelector('#kanban-search')?.addEventListener('input', event => {
    state.search = event.target.value;
    render();
  });

  root.querySelector('#kanban-group')?.addEventListener('change', event => {
    state.group = event.target.value;
    render();
  });

  root.querySelector('#kanban-status')?.addEventListener('change', event => {
    state.status = event.target.value;
    render();
  });

  root.querySelector('#kanban-priority')?.addEventListener('change', event => {
    state.priority = event.target.value;
    render();
  });

  root.querySelector('#kanban-add')?.addEventListener('click', () => openModal());

  root.querySelector('#kanban-clear-filters')?.addEventListener('click', () => {
    state.search = '';
    state.group = 'all';
    state.status = 'all';
    state.priority = 'all';
    render();
  });

  root.querySelector('#kanban-reset-board')?.addEventListener('click', async () => {
    if (!confirm('Reset board to latest imported seed items?')) return;
    try {
      localStorage.removeItem(getStorageKey());
    } catch {
      // No-op when storage is unavailable.
    }
    await initializeCards();
    render();
  });

  root.querySelectorAll('[data-action="edit"]').forEach(button => {
    button.addEventListener('click', event => {
      const card = state.cards.find(item => item.id === event.target.dataset.id);
      if (card) openModal(card);
    });
  });

  root.querySelectorAll('[data-action="delete"]').forEach(button => {
    button.addEventListener('click', event => {
      const id = event.target.dataset.id;
      state.cards = state.cards.filter(item => item.id !== id);
      saveCards();
      render();
    });
  });

  root.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', event => {
      const id = event.currentTarget.dataset.id;
      state.dragId = id;
      event.dataTransfer.setData('text/plain', id);
      event.currentTarget.classList.add('dragging');
    });

    card.addEventListener('dragend', event => {
      event.currentTarget.classList.remove('dragging');
      state.dragId = null;
    });
  });

  root.querySelectorAll('[data-dropzone]').forEach(zone => {
    zone.addEventListener('dragover', event => {
      event.preventDefault();
      zone.closest('.kanban-column')?.classList.add('is-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.closest('.kanban-column')?.classList.remove('is-over');
    });

    zone.addEventListener('drop', event => {
      event.preventDefault();
      zone.closest('.kanban-column')?.classList.remove('is-over');
      const targetStatus = zone.dataset.dropzone;
      const id = event.dataTransfer.getData('text/plain') || state.dragId;
      const card = state.cards.find(item => item.id === id);
      if (!card || !targetStatus) return;
      card.status = targetStatus;
      saveCards();
      render();
    });
  });
}

async function initializeCards() {
  const stored = loadStoredCards();
  if (stored?.length) {
    state.cards = stored;
    return;
  }

  const issues = Array.isArray(window.KANBAN_SEED) ? window.KANBAN_SEED : [];
  const artifacts = await loadArtifacts();

  const merged = [...issues, ...artifacts];
  state.cards = merged.length ? merged.map(normalizeCard) : [
    normalizeCard({ title: 'Confirm board workflow', group: 'General', status: 'this_week', priority: 'medium', notes: 'Seeded fallback task.' })
  ];

  saveCards();
}

window.addEventListener('kanban:issues-loaded', () => {
  if (loadStoredCards()) return;
  initializeCards().then(render);
});

initializeCards().then(render);
