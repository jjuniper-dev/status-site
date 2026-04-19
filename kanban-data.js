window.KANBAN_SEED = [
  {
    id: "path-1",
    title: "Define PATH/HAIL convergence model and share graph",
    group: "PATH / HAIL",
    status: "backlog",
    priority: "high",
    notes: "Core ARB-level architectural gap",
    tags: ["PATH","HAIL"]
  },
  {
    id: "path-2",
    title: "Start thread on enterprise data architecture alignment",
    group: "PATH / HAIL",
    status: "this_week",
    priority: "high",
    notes: "Tie into EDAxAI brief",
    tags: ["Data","EDA"]
  },
  {
    id: "path-3",
    title: "Upload PATH/HAIL graph into Neo4j",
    group: "PATH / HAIL",
    status: "backlog",
    priority: "medium",
    notes: "Supports knowledge graph integration",
    tags: ["Graph"]
  },
  {
    id: "deck-1",
    title: "Prepare Lunch & Learn AI architecture deck",
    group: "EA Decks",
    status: "this_week",
    priority: "high",
    notes: "Executive narrative + visuals",
    tags: ["Deck"]
  },
  {
    id: "deck-2",
    title: "Create Chad cluster priority visuals",
    group: "EA Decks",
    status: "backlog",
    priority: "medium",
    notes: "Align with IT plan analysis",
    tags: ["Clusters"]
  },
  {
    id: "deck-3",
    title: "Refine AI architecture slide set",
    group: "EA Decks",
    status: "in_progress",
    priority: "high",
    notes: "PATH framing correction",
    tags: ["AI"]
  },
  {
    id: "agent-1",
    title: "Define multi-agent orchestration framework",
    group: "Agentic Framework",
    status: "backlog",
    priority: "high",
    notes: "Foundation for PCA",
    tags: ["Agents"]
  },
  {
    id: "agent-2",
    title: "Implement disagreement-driven validation",
    group: "Agentic Framework",
    status: "backlog",
    priority: "high",
    notes: "DDV core principle",
    tags: ["DDV"]
  },
  {
    id: "agent-3",
    title: "Map GREP-ExP pipeline to PCA",
    group: "Agentic Framework",
    status: "this_week",
    priority: "high",
    notes: "Screening + escalation pattern",
    tags: ["GREP"]
  },
  {
    id: "infra-1",
    title: "Install n8n via Docker",
    group: "Infrastructure",
    status: "in_progress",
    priority: "high",
    notes: "Core orchestration layer",
    tags: ["n8n"]
  },
  {
    id: "infra-2",
    title: "Configure Whisper transcription pipeline",
    group: "Infrastructure",
    status: "done",
    priority: "medium",
    notes: "Voice capture working",
    tags: ["Audio"]
  },
  {
    id: "infra-3",
    title: "Stand up local LLM environment",
    group: "Infrastructure",
    status: "backlog",
    priority: "high",
    notes: "Ollama / LM Studio",
    tags: ["LLM"]
  },
  {
    id: "pca-1",
    title: "Define knowledge lifecycle (Inbox → Trusted)",
    group: "PCA",
    status: "this_week",
    priority: "high",
    notes: "Core PKM model",
    tags: ["PCA"]
  },
  {
    id: "pca-2",
    title: "Implement Obsidian vault structure",
    group: "PCA",
    status: "in_progress",
    priority: "medium",
    notes: "Canonical store",
    tags: ["Obsidian"]
  },
  {
    id: "pca-3",
    title: "Add vector + graph retrieval layer",
    group: "PCA",
    status: "backlog",
    priority: "high",
    notes: "Hybrid retrieval",
    tags: ["RAG"]
  },
  {
    id: "personal-1",
    title: "Build social concierge agent",
    group: "Personal Projects",
    status: "backlog",
    priority: "medium",
    notes: "Events + recommendations",
    tags: ["Agent"]
  },
  {
    id: "personal-2",
    title: "Enhance weekend events automation",
    group: "Personal Projects",
    status: "this_week",
    priority: "medium",
    notes: "Email quiz improvements",
    tags: ["Events"]
  },
  {
    id: "ops-1",
    title: "Draft HAIL production ADR",
    group: "Governance",
    status: "backlog",
    priority: "high",
    notes: "ATO path",
    tags: ["ARB"]
  },
  {
    id: "ops-2",
    title: "Escalate ATO discussion to CIO",
    group: "Governance",
    status: "this_week",
    priority: "high",
    notes: "Critical unblock",
    tags: ["ATO"]
  },
  {
    id: "ops-3",
    title: "Define AI governance operating model",
    group: "Governance",
    status: "in_progress",
    priority: "high",
    notes: "Roles + controls",
    tags: ["Governance"]
  }
];

window.KANBAN_ARTIFACT_CONFIG = {
  enabled: true,
  indexPath: 'data/artifacts-index.json',
  group: 'Artifacts',
  status: 'this_week',
  priority: 'medium',
  limit: 12,
  tagPrefix: 'artifact:'
};

window.injectArtifactCards = async function injectArtifactCards() {
  const cfg = window.KANBAN_ARTIFACT_CONFIG;
  if (!cfg || !cfg.enabled) return window.KANBAN_SEED;

  try {
    const res = await fetch(`${cfg.indexPath}?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return window.KANBAN_SEED;

    const items = await res.json();
    if (!Array.isArray(items) || !items.length) return window.KANBAN_SEED;

    const existingIds = new Set(window.KANBAN_SEED.map(item => item.id));
    const cards = items
      .slice()
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, cfg.limit)
      .map((item, idx) => {
        const artifactId = item.id || `artifact-${idx + 1}`;
        const cardId = `artifact-card-${artifactId}`;
        if (existingIds.has(cardId)) return null;

        const topics = Array.isArray(item.topics) ? item.topics.slice(0, 4) : [];
        const detail = item.detail_page || 'artifacts.html';

        return {
          id: cardId,
          title: item.title || 'Untitled artifact',
          group: cfg.group,
          status: cfg.status,
          priority: cfg.priority,
          notes: `${item.summary || 'Artifact indexed.'} [Open artifact](${detail})`,
          tags: [
            'Artifacts',
            ...(item.artifact_type ? [item.artifact_type] : []),
            ...topics,
            `${cfg.tagPrefix}${artifactId}`
          ]
        };
      })
      .filter(Boolean);

    if (cards.length) {
      window.KANBAN_SEED = [...cards, ...window.KANBAN_SEED];
      window.dispatchEvent(new CustomEvent('kanban:artifacts-loaded', {
        detail: { count: cards.length, cards }
      }));
    }
  } catch (err) {
    console.warn('Artifact card injection failed', err);
  }

  return window.KANBAN_SEED;
};

window.injectArtifactCards();
