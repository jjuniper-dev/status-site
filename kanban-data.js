window.KANBAN_SEED = [];

async function loadGitHubIssues() {
  const cfg = window.KANBAN_CONFIG?.github;
  if (!cfg?.issueSourcePath) return [];

  try {
    const res = await fetch(`${cfg.issueSourcePath}?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('Failed to load GitHub issues', err);
    return [];
  }
}

function mapLabelsToGroup(labels) {
  const names = labels.map(l => l.name || l);

  if (names.includes('path') || names.includes('hail')) return 'PATH / HAIL';
  if (names.includes('governance') || names.includes('arb')) return 'Governance';
  if (names.includes('agent') || names.includes('agents')) return 'Agentic Framework';
  if (names.includes('data') || names.includes('eda')) return 'Data / AI';
  if (names.includes('artifact')) return 'Artifacts';

  return 'General';
}

function mapLabelsToStatus(labels) {
  const names = labels.map(l => l.name || l);

  if (names.includes('status-done')) return 'done';
  if (names.includes('status-in-progress')) return 'in_progress';
  if (names.includes('status-this-week')) return 'this_week';
  if (names.includes('status-backlog')) return 'backlog';

  return 'backlog';
}

function mapLabelsToPriority(labels) {
  const names = labels.map(l => l.name || l);

  if (names.includes('high')) return 'high';
  if (names.includes('medium')) return 'medium';
  if (names.includes('low')) return 'low';

  return 'medium';
}

function issueToCard(issue) {
  const labels = issue.labels || [];

  return {
    id: `issue-${issue.number}`,
    title: issue.title,
    group: mapLabelsToGroup(labels),
    status: issue.state === 'closed' ? 'done' : mapLabelsToStatus(labels),
    priority: mapLabelsToPriority(labels),
    notes: `${issue.body || ''}\n\n🔗 https://github.com/${window.KANBAN_CONFIG.github.owner}/${window.KANBAN_CONFIG.github.repo}/issues/${issue.number}`,
    tags: labels.map(l => l.name || l)
  };
}

window.buildKanbanFromIssues = async function () {
  const issues = await loadGitHubIssues();
  if (!issues.length) return window.KANBAN_SEED;

  const cards = issues.map(issueToCard);
  window.KANBAN_SEED = cards;

  window.dispatchEvent(new CustomEvent('kanban:issues-loaded', {
    detail: { count: cards.length }
  }));

  return window.KANBAN_SEED;
};

window.buildKanbanFromIssues();
