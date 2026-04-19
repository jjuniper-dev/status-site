# Consolidated AI Project Dashboard — Site Design

**Project:** HC/PHAC AI Platform (PATH/HAIL) + Project Coordination  
**Target:** Unified, functional dashboard for decision-making, stakeholder demos, artifact discovery  
**Technology:** Static HTML + JSON data layer + responsive CSS  

---

## Site Architecture

```
status-site/
├── index.html                 (Dashboard home — control surface)
├── decisions.html             (Decision log)
├── scenarios.html             (Scenario navigator)
├── timeline.html              (Milestones & timeline)
├── intelligence.html          (HC/PHAC platform intelligence)
├── artifacts.html             (Artifact library with search)
├── path-architecture.html     (PATH technical architecture)
├── control-plane.html         (Control plane details)
├── pptx-builder.html          (Presentation builder)
├── sitemap.html               (Navigation & discovery)
│
├── styles.css                 (Unified design system)
├── dashboard.js               (Dashboard interactivity)
├── search.js                  (Cross-site search)
│
└── data/
    ├── decisions.json         (Decision log entries)
    ├── scenarios.json         (Use case scenarios)
    ├── artifacts-index.json   (Artifact catalog with metadata)
    ├── timeline.json          (Milestones & dates)
    └── config.json            (Site metadata, version, etc)
```

---

## Page Map & User Flows

### 1. **Dashboard Home** (index.html)
**Purpose:** Single pane of glass for project status  
**Layout (Control Surface):**
```
┌─────────────────────────────────────────────────────┐
│ PROJECT DASHBOARD — AI Platform Status              │
│ Last Updated: 2026-04-19 14:23                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌───────────────┐  ┌────────────────┐  ┌─────────┐ │
│ │ STATUS BOXES  │  │ KEY METRICS    │  │ ALERTS  │ │
│ │               │  │                │  │         │ │
│ │ ✓ Active      │  │ • FY26-27: 230 │  │ ⚠ ATO   │ │
│ │ ⚠ Blockers: 3 │  │   MS hours     │  │ ⚠ DTB   │ │
│ │ ⏳ Pending: 5  │  │ • Budget: $475K│  │ Gaps    │ │
│ └───────────────┘  └────────────────┘  └─────────┘ │
│                                                     │
│ ┌──────────────────────────────────────────────┐  │
│ │ QUICK NAV — Jump to:                         │  │
│ │ [Decisions] [Scenarios] [Artifacts]          │  │
│ │ [Timeline] [Intelligence] [Sitemap]          │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│ ┌──────────────────────────────────────────────┐  │
│ │ LATEST DECISIONS (3 most recent)             │  │
│ │ • DEC-001: HAIL Production ATO (Active)      │  │
│ │ • DEC-002: PATH / HAIL Convergence (Pending) │  │
│ │ • DEC-003: HC-PATH Pre-Prototype (Emerging)  │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│ ┌──────────────────────────────────────────────┐  │
│ │ FEATURED SCENARIOS                           │  │
│ │ [HAIL Production] [PATH Governance]          │  │
│ │ [Agentic AI] [HC/PHAC Capabilities]         │  │
│ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Data Required:**
- `decisions.json` (latest 3, sorted by date)
- `scenarios.json` (featured scenarios)
- Status summary (from decisions)

---

### 2. **Decision Log** (decisions.html)
**Purpose:** Track decisions with full details, rationale, outcomes

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ DECISION LOG — All Project Decisions                │
│ Filter: [All ▼] [By Status] [By Category] [Search]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ DEC-001 | HAIL Production ATO Gap                   │
│ Status: ✓ Active | Category: Governance             │
│ Date: 2026-04-19 | Owner: CDO/CIO                   │
│ ────────────────────────────────────────────────────│
│ Rationale:                                           │
│   HAIL deployment complete but no ATO conversation  │
│   initiated with CIO. Blocks production for FY26-27 │
│                                                      │
│ Next Steps:                                          │
│   • Escalate to governance queue                    │
│   • Draft ADR for HAIL-to-production                │
│   • Schedule CIO briefing                           │
│                                                      │
│ Supporting Artifacts:                                │
│   → PATH Reference Architecture                      │
│   → Control Plane Details                            │
│   → Governance Risk Assessment                       │
│                                                      │
│ Related Scenario: HAIL Production Move               │
│ ────────────────────────────────────────────────────│
│
│ [More decisions below...]
│
└──────────────────────────────────────────────────────┘
```

**Data Required:**
- `decisions.json` (full entries)
- Filter/search logic
- Link to artifacts & scenarios

---

### 3. **Scenario Navigator** (scenarios.html)
**Purpose:** Organize artifacts by decision context (use cases)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ SCENARIO NAVIGATOR — Use Cases & Artifacts         │
│ Filter: [All Scenarios ▼] Search: ___________       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ HAIL PRODUCTION MOVE                                │
│ ──────────────────────────────────────────────────  │
│ Decisions: DEC-001, DEC-002                         │
│ Supporting Artifacts:                               │
│   [PATH Reference Architecture]                     │
│   [Control Plane Details]                           │
│   [Governance Risk Assessment]                      │
│   [Production Operating Model]                      │
│                                                     │
│ PATH GOVERNANCE                                     │
│ ──────────────────────────────────────────────────  │
│ Decisions: DEC-003, DEC-004                         │
│ Supporting Artifacts:                               │
│   [Enterprise Automation Model]                     │
│   [Responsible AI Compliance]                       │
│   [HC/PHAC Capability Model]                        │
│                                                     │
│ AGENTIC AI CAPABILITY                               │
│ ──────────────────────────────────────────────────  │
│ Decisions: DEC-005                                  │
│ Supporting Artifacts:                               │
│   [Agentic Workflow Framework]                      │
│   [GREP-ExP Reference Case]                         │
│   [Agentic Screening Pattern]                       │
│   [Hype Cycle for Agentic AI]                       │
│                                                     │
│ HC/PHAC CAPABILITY MAPPING                          │
│ ──────────────────────────────────────────────────  │
│ Decisions: DEC-006                                  │
│ Supporting Artifacts:                               │
│   [Emerging Digital Capabilities]                   │
│   [Responsible AI Compliance]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Data Required:**
- `scenarios.json` (scenario definitions)
- `decisions.json` (linked decisions)
- `artifacts-index.json` (linked artifacts)

---

### 4. **Timeline/Milestones** (timeline.html)
**Purpose:** Visual project roadmap with decision gates

**Layout:**
```
┌────────────────────────────────────────────────────┐
│ PROJECT TIMELINE — FY26-27 Roadmap                 │
├────────────────────────────────────────────────────┤
│                                                    │
│ APRIL 2026 (Current)                              │
│ ├─ ✓ HAIL Deployment Complete                     │
│ ├─ ✓ GREP-ExP Onboarded                           │
│ ├─ ⚠ ATO Conversation NOT INITIATED               │
│ └─ ⏳ DEC-001: ATO Decision Pending                │
│                                                    │
│ MAY 2026 (Next)                                    │
│ ├─ 🎯 CIO Briefing Target                         │
│ ├─ 🎯 Governance Escalation                       │
│ └─ 🔒 PATH/HAIL Boundary Resolution               │
│                                                    │
│ JUNE-AUGUST 2026 (Production Unblock)              │
│ ├─ 🎯 ATO Approval                                │
│ ├─ 🎯 Production Move Gate                        │
│ └─ 🔒 FY26-27 Resourcing Confirmed                │
│                                                    │
│ SEPTEMBER 2026+ (Sustained Operations)             │
│ ├─ 📊 Operational AI Capability                    │
│ └─ 🚀 Scaling Phase                               │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Data Required:**
- `timeline.json` (milestones, gates, dates)
- `decisions.json` (decision gates)

---

### 5. **Intelligence Page** (intelligence.html)
**Purpose:** HC/PHAC platform landscape & EA interpretation  
**Current:** Exists in status-site  
**Enhancement:** Link to decisions & scenarios, add HC/PHAC intel context

---

### 6. **Artifact Library** (artifacts.html)
**Purpose:** Searchable catalog organized by scenario/decision  
**Current:** Exists but basic search  
**Enhancement:** 
- Search across artifacts + decisions + scenarios
- Filter by scenario
- Show decision support
- Mark "demo-ready" vs "WIP"

---

### 7. **Architecture Pages** (path-architecture.html, control-plane.html, pptx-builder.html)
**Purpose:** Technical deep-dives  
**Enhancement:** Link back to scenarios/decisions that use these

---

## Design System (Unified CSS)

### Color Palette (Dark Theme)
```css
:root {
  /* Primary */
  --red: #E8192E;           (Alerts, blockers)
  --teal: #00C8C8;          (Active, primary accent)
  --gold: #F9D030;          (Warnings, emerging)
  --green: #7CFFB2;         (Success, completed)
  --blue-light: #5FA8E8;    (Secondary info)
  
  /* Backgrounds */
  --bg: #07090F;            (Page background)
  --bg2: #0D1117;           (Card background)
  --bg3: #131920;           (Elevated cards)
  --surface: #1A2230;       (Surface/table headers)
  
  /* Text */
  --text: #F0F4FA;          (Primary text)
  --text-dim: #B0BFCF;      (Secondary text)
  --text-faint: #6A7D90;    (Tertiary/labels)
  
  /* Borders */
  --border: rgba(255,255,255,0.10);
  --border-bright: rgba(255,255,255,0.22);
  
  /* Fonts */
  --mono: 'IBM Plex Mono', monospace;
  --sans: 'IBM Plex Sans', sans-serif;
  --cond: 'IBM Plex Sans Condensed', sans-serif;
}
```

### Responsive Breakpoints
```css
/* Desktop-first */
1100px+    (Full width, max-content design)
980px      (Content reflow, nav adaptation)
768px      (Tablet, single column grids)
480px      (Mobile, vertical layout)
320px      (Small mobile, minimal spacing)
```

### Component Library
- `.topnav` — Sticky navigation
- `.dashboard-box` — Status/metric boxes
- `.decision-card` — Decision entry
- `.scenario-section` — Scenario grouping
- `.artifact-card` — Artifact preview
- `.timeline-item` — Timeline milestone
- `.alert-banner` — Blocker/alert display
- `.search-box` — Global search
- `.status-badge` (active, pending, blocked, emerging)

---

## Data Model

### decisions.json
```json
{
  "decisions": [
    {
      "id": "DEC-001",
      "title": "HAIL Production ATO Gap",
      "date": "2026-04-19",
      "category": "governance",
      "owner": "CDO/CIO",
      "status": "active",
      "rationale": "HAIL deployment complete but no ATO conversation initiated...",
      "next_steps": ["Escalate to governance queue", "Draft ADR", "Schedule briefing"],
      "related_artifacts": ["artifact-006", "artifact-007"],
      "related_scenarios": ["hail-production-move"],
      "impact": "high",
      "timeline_gate": "may-2026"
    }
  ]
}
```

### scenarios.json
```json
{
  "scenarios": [
    {
      "id": "hail-production-move",
      "name": "HAIL Production Move",
      "description": "Path to moving HAIL from pilot to production",
      "decisions": ["DEC-001", "DEC-002"],
      "artifacts": ["artifact-006", "artifact-010", "artifact-012"],
      "priority": "critical",
      "status": "in-progress"
    }
  ]
}
```

### artifacts-index.json (Enhanced)
```json
{
  "artifacts": [
    {
      "id": "artifact-006",
      "title": "PATH — Reference Architecture",
      "scenarios": ["hail-production-move", "path-governance"],
      "decisions": ["DEC-001", "DEC-003"],
      "demo_ready": true,
      "version": "1.0",
      "last_updated": "2026-04-18"
    }
  ]
}
```

### timeline.json
```json
{
  "timeline": [
    {
      "period": "april-2026",
      "name": "Current Status",
      "milestones": [
        {"name": "HAIL Deployment Complete", "status": "completed"},
        {"name": "GREP-ExP Onboarded", "status": "completed"}
      ],
      "gates": [{"decision_id": "DEC-001", "status": "pending"}]
    }
  ]
}
```

---

## Navigation Structure

**Top Navigation (all pages):**
```
[LOGO] Dashboard | Decisions | Scenarios | Timeline | Intelligence | Artifacts | Sitemap
```

**Breadcrumb (non-home pages):**
```
Dashboard > [Current Page] > [Optional Section]
```

**Related Links (sidebar or footer):**
- Linked decisions
- Linked scenarios
- Linked artifacts
- Related pages

---

## Mobile Experience

**Breakpoint 768px:**
- Navigation becomes two-row or collapsible
- 2-column grids stack to 1 column
- Decision cards shrink to essential info
- Artifact grid becomes single column
- Timeline becomes vertical

**Breakpoint 480px:**
- All multi-column → single column
- Tabs for filtering instead of buttons
- Touch-friendly spacing (44px min tap target)
- Simplified metric boxes
- Full-width cards

---

## Key Features for 1.0

✓ **Dashboard Home** — Status at a glance  
✓ **Decision Log** — Full decision tracking  
✓ **Scenario Navigator** — Use case organization  
✓ **Cross-linking** — Decisions ↔ Scenarios ↔ Artifacts  
✓ **Search** — Global search across all content  
✓ **Timeline** — Project roadmap  
✓ **Responsive** — Works on desktop, tablet, mobile  
✓ **Static** — No backend required, GitHub Pages ready  

---

## Migration from News Feed Repo

**Files to Extract & Integrate:**
1. **AI Control Surface Layout** (from Apr 17 redesign) → Home page design
2. **HC/PHAC Intelligence Page** (from Apr 18) → Intelligence page enhancement
3. **Mobile Blog Layout** (from Apr 19) → Responsive framework
4. **UI Animations** — Smooth transitions and interactions
5. **JSON Data Pattern** — Decision/scenario data model

**Files to Keep in status-site:**
- Current artifact pages (enhance, don't replace)
- Current architecture pages (link in context)
- Current intelligence page (expand with HC/PHAC context)

---

## Implementation Roadmap

**Phase 1A:** Design System (CSS + responsive) — START HERE  
**Phase 1B:** Home page redesign (control surface) + decisions.json  
**Phase 1C:** Decision Log page + Scenario Navigator page  
**Phase 2:** Cross-linking, search, timeline  
**Phase 3:** Integrate news feed assets, animations, polish  
**Phase 4:** QA, accessibility, stakeholder testing  

