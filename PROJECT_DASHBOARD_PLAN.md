# Status-Site as AI Project Dashboard — Revised 1.0 Plan

**Reframed Purpose:** Lightweight, functional project coordination dashboard for stakeholder demos, decision tracking, and artifact discovery.

**Target Users:**
- Project leads (decision tracking, status at a glance)
- Stakeholders (demo-ready views, clean reporting)
- Team members (find right artifacts for scenarios)

---

## Dashboard Structure (1.0)

### 1. **Project Overview** (Home Page - Enhanced)
Current: Status snapshot of PATH/HAIL  
Enhanced for 1.0:
- **Status Summary** — Active initiatives, blockers, milestones
- **Key Metrics** — FY26-27 resources, timeline, budget
- **Quick Links** — Jump to decisions, artifacts, timeline
- **Last Updated** — Auto-track when content changed

### 2. **Decision Log** (New Page)
Purpose: Track decisions made, rationale, outcomes

Structure:
```
- Decision ID (DEC-001, DEC-002, etc.)
- Title (e.g., "ATO Gap Flagged for Governance Queue")
- Date Made
- Category (Governance, Architecture, Resource, Risk)
- Owner / Stakeholders
- Rationale (why this decision)
- Status (Active, Pending, Archived)
- Outcome / Next Steps
- Related Artifacts (links to supporting docs)
- Related Scenarios (which scenario this impacts)
```

Example:
```
DEC-001 | HAIL Production Path ATO Gap
Date: 2026-04-19 | Owner: CDO/CIO
Category: Governance
Status: Active / Pending Resolution
Rationale: HAIL deployment complete but no ATO conversation initiated
Next Steps: Escalate to CIO for FY26-27 production unblock
Supports: PATH / HAIL Convergence scenario
```

### 3. **Scenario Navigator** (New - Artifact Organization)
Purpose: Group artifacts by decision scenario/use case

Structure:
```
Scenarios (with artifacts grouped):
├─ PATH Governance
│  ├─ PATH — Reference Architecture
│  ├─ Responsible AI Systems Compliance Model
│  └─ Enterprise Automation Model
├─ HAIL Production Move
│  ├─ ATO Governance Risk Assessment
│  └─ Production Operating Model
├─ Agentic AI Capability
│  ├─ Agentic Workflow Framework
│  ├─ GREP-ExP as Reference Case
│  └─ Agentic Screening Pattern
└─ HC/PHAC Capability Mapping
   ├─ Emerging Digital Capabilities
   └─ Responsible AI Compliance Model
```

Search/filter by:
- Scenario name
- Artifact type (diagram, document, reference)
- Date (newest first)
- Domain (EA, Governance, AI, etc.)

### 4. **Timeline/Milestones** (Enhanced)
Purpose: Visual timeline of FY26-27 planning and dependencies

Show:
- Project phases (Pilot → Production)
- Decision deadlines
- Resource availability
- Key escalation points
- Risk windows

### 5. **Artifacts Library** (Enhanced from Current)
Current: Basic searchable list with JSON index  
Enhanced:
- Filter by scenario (see Navigator above)
- Filter by decision it supports
- Show relationship graph (which artifacts are linked)
- Mark as "Demo-Ready" or "WIP"
- Version history (which version supports which decision?)

### 6. **Materials Index** (Fast Lookup)
Purpose: "Show me materials that support this talking point"

For each scenario/decision, quick access to:
- Slides/diagrams
- Reference documents
- Risk assessments
- Governance templates
- Data sheets

---

## Data Structure for Dashboard

Update JSON schema to support decision tracking:

```json
{
  "decisions": [
    {
      "id": "DEC-001",
      "title": "HAIL Production ATO Gap",
      "date": "2026-04-19",
      "category": "governance",
      "owner": "CDO",
      "status": "active",
      "rationale": "...",
      "next_steps": "...",
      "related_artifacts": ["artifact-id-001"],
      "related_scenarios": ["hail-production-move"]
    }
  ],
  "scenarios": [
    {
      "id": "hail-production-move",
      "name": "HAIL Production Move",
      "description": "...",
      "artifacts": ["artifact-id-001", "artifact-id-002"],
      "decisions": ["DEC-001", "DEC-002"]
    }
  ],
  "artifacts": [
    {
      "id": "artifact-001",
      "title": "...",
      "scenarios": ["hail-production-move"],
      "demo_ready": true,
      "version": "1.0",
      "last_updated": "2026-04-19"
    }
  ]
}
```

---

## Phase 1 Revised: Design System + Dashboard Structure

**Goal:** Unified CSS + JSON-based decision/scenario tracking

**Tasks:**

1. **Design System** (as planned)
   - Unified `styles.css`
   - Responsive breakpoints
   - Component library
   - Mobile-ready

2. **Dashboard JSON Schema**
   - Create `data/decisions.json` (decision log)
   - Create `data/scenarios.json` (scenario mapping)
   - Update `data/artifacts-index.json` with scenario/decision references
   - Schema validation

3. **Decision Log Page**
   - HTML template
   - Fetch from `decisions.json`
   - Filter by status, category, date
   - Link to artifacts and scenarios

4. **Scenario Navigator**
   - Page showing all scenarios
   - Artifacts grouped by scenario
   - Search/filter UI
   - Quick jump to decisions in each scenario

5. **Dashboard Components**
   - Update home page with metrics summary
   - Add timeline/milestones section
   - Add "last updated" timestamp system
   - Link everything together (artifact → decision → scenario)

**New HTML Pages:**
- `decisions.html` — Full decision log with filters
- `scenarios.html` — Scenario navigator
- `index.html` — Enhanced with summary + quick nav

**Data Files:**
- `data/decisions.json` — New
- `data/scenarios.json` — New
- `data/artifacts-index.json` — Enhanced with scenario/decision references

---

## Implementation Priority for Phase 1

**Must Have:**
1. Unified CSS + responsive design (existing plan)
2. Decision log page + JSON data model
3. Scenario navigator page
4. Homepage enhanced with summary

**Should Have:**
1. Timeline/milestones view
2. Decision-to-artifact linking
3. Search across all three (artifacts, decisions, scenarios)

**Nice to Have:**
1. Demo mode (highlight key scenarios)
2. Export decision log as PDF
3. Calendar view for decision dates

---

## Success Criteria (1.0)

✓ Responsive design (all breakpoints)  
✓ Decision log populated with 3–5 key decisions  
✓ Scenario navigator with 4 scenarios and artifacts grouped  
✓ All artifacts mapped to scenarios  
✓ Home page shows summary metrics and quick links  
✓ Mobile-friendly demo experience  
✓ Search works across decisions + scenarios + artifacts  

---

## How This Serves Your Needs

**Decision Support:**
- See all decisions in one place
- Understand rationale and next steps
- Track what's pending vs. active

**Stakeholder Demos:**
- Clean, professional interface
- Scenario-based navigation (easy to tell a story)
- Supporting artifacts instantly available
- Responsive for any device

**Artifact Coordination:**
- Organize by use case (scenario)
- Link to decisions they support
- Find "what materials support this decision?"
- Version track important docs

**Project Tracking:**
- Timeline shows FY26-27 milestones
- Know where decisions are blockers
- See resource dependencies
- Track governance escalation points

---

## Next Steps

1. **Approve this reframing** ✓
2. **Populate initial decisions** — List 3–5 key decisions made so far
3. **Define scenarios** — List the 4 scenarios and their artifacts
4. **Start Phase 1** — Design system + dashboard JSON + decision/scenario pages
5. **Test with stakeholders** — Demo responsiveness and scenario flows

