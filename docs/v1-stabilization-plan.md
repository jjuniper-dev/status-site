# V1 Stabilization Plan — Status Site

## Purpose
Stabilize the five core v1 features so the platform behaves as a simple, coherent, decision-support workbench.

## V1 Feature Set

### 1. Dashboard Shell
**Goal:** One reliable control plane for navigation and entry into the other modules.

**Must be true for v1:**
- Shared navigation works consistently
- No dead links
- Clear entry points to Compare, Intelligence, Decisions, and Kanban
- Consistent layout and labeling

**Primary gaps to check:**
- Duplicate nav logic
- Orphan pages
- Inconsistent layout patterns

**Acceptance criteria:**
- User can reach all v1 features from one shell
- Navigation behaves the same on all included pages
- No broken primary navigation links

---

### 2. Compare Workspace
**Goal:** One canonical comparison experience for options, vendors, or patterns.

**Must be true for v1:**
- Single compare page
- Split-view works reliably
- Reads structured assessment data
- Surfaces score, rationale, and recommendation clearly

**Primary gaps to check:**
- Multiple compare pages with overlapping purpose
- Hardcoded comparison content
- Fragile rendering logic

**Acceptance criteria:**
- At least one assessment can be loaded and compared cleanly
- Duplicate compare experiences are removed or clearly deprecated
- Recommendation summary is visible without hunting

---

### 3. Intelligence / Evidence Viewer
**Goal:** One evidence layer to support assessments and decisions.

**Must be true for v1:**
- Evidence content renders consistently
- Entries have title, source/date where available, and readable body
- Compare and decisions can link into evidence

**Primary gaps to check:**
- Mixed rendering approaches
- Weak metadata handling
- Poor discoverability from assessments

**Acceptance criteria:**
- User can open evidence items consistently
- At least one assessment and one decision can point to evidence
- Evidence pages are readable and predictable

---

### 4. Assessment + Decision Model
**Goal:** Normalize how judgments are recorded.

**Must be true for v1:**
- One assessment schema
- One decision schema
- One folder convention
- Simple status model

**Primary gaps to check:**
- Inconsistent object shapes
- No canonical sample data
- UI not reading from structured files yet

**Acceptance criteria:**
- At least one valid assessment JSON exists
- At least one valid decision JSON exists
- Compare or dashboard can read these objects

---

### 5. Kanban / Follow-Through
**Goal:** Close the loop from decision to action.

**Must be true for v1:**
- One working board
- Simple statuses
- Linked conceptually to decisions or assessments
- Accessible from dashboard

**Primary gaps to check:**
- Broken board logic
- Multiple implementations
- Weak connection to decision flow

**Acceptance criteria:**
- Board loads reliably
- User can see backlog / in progress / done
- Dashboard links cleanly to the board

---

## Stabilization Sequence

### Phase 1 — Freeze Surfaces
- Identify the single canonical page/module for each feature
- Deprecate duplicates
- Stop adding new surfaces

### Phase 2 — Normalize Data
- Standardize assessments and decisions
- Ensure evidence has a consistent rendering pattern
- Reduce hardcoded UI where practical

### Phase 3 — Wire the Workflow
Target loop:
**Intelligence → Assessment → Decision → Kanban**

### Phase 4 — Harden UX
- Fix dead links
- Improve empty states
- Standardize labels
- Reduce broken interactions

### Phase 5 — Polish
- Visual cleanup
- Better summaries
- Small usability improvements only after stability is achieved

## Guardrails
- Reuse before rebuild
- Consolidate before expand
- One canonical location per v1 feature
- No new pages unless a current v1 page cannot reasonably absorb the function

## Recommended Immediate Deliverables
1. Feature inventory by page/module
2. Canonical source-of-truth map for each feature
3. One sample assessment JSON
4. One sample decision JSON
5. Five stabilization issues, one per feature
