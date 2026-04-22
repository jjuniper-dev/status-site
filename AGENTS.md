# AGENTS.md — Codex Execution Control (status-site)

## 0. Repository Guardrail (READ FIRST)

This file applies to the **jjuniper-dev/status-site** repository only.

Before making changes, verify:
- target repository = `jjuniper-dev/status-site`
- branch = requested branch, otherwise `main`
- files and modules belong to the status-site EA workbench

If the active repository is not `jjuniper-dev/status-site`, stop and do not write changes intended for the EA workbench.

---

## 1. System Context (ALWAYS LOAD FIRST)

This repository is an **Enterprise Architecture AI Workbench**.

Core characteristics:
- Single-page application mindset
- Dashboard-centric UI
- Manifest-driven rendering
- Modular components (not page sprawl)

Primary modules:
- dashboard (control center)
- compare (vendor + assessment)
- intelligence (md-driven knowledge system)
- kanban (task tracking)

---

## 2. Architectural Rules (NON-NEGOTIABLE)

### 2.1 Page Strategy
- DO NOT create new pages unless explicitly instructed
- Consolidate into:
  - index.html (dashboard shell)
  - one compare page
  - one detail page

### 2.2 UI Model
- Tabbed workspace inside pages
- Split-view comparison supported
- Components > pages

### 2.3 Navigation
- Use shared nav component
- No inline nav duplication
- All pages must be reachable from unified nav

---

## 3. Code Behavior

### ALWAYS:
- Reuse existing JS modules
- Extend instead of rewriting
- Keep logic modular and readable
- Maintain consistent naming patterns

### NEVER:
- Duplicate logic across files
- Introduce unnecessary frameworks
- Break existing navigation or layout

---

## 4. Data & Rendering Model

- Prefer JSON or manifest-driven structures
- UI should render from data, not hardcoded HTML
- Support future:
  - capability registry
  - assessment schema
  - intelligence indexing

---

## 5. AI / EA Workflow Alignment

This system supports:

- Vendor evaluation (rubric-driven)
- EA capability mapping
- Architecture decision support
- Scenario comparison

All features must reinforce these workflows.

---

## 6. Output Expectations

All outputs must be:

- Clean, production-ready
- Fully integrated into existing structure
- Minimal and efficient (no bloat)
- Visually consistent with current design

---

## 7. Default Decision Logic

If task is ambiguous:

1. Consolidate instead of expand
2. Integrate instead of isolate
3. Reuse instead of rebuild
4. Simplify instead of add complexity

---

## 8. Anti-Patterns to Avoid

- Multiple versions of the same page (compare, dashboard, etc.)
- Fragmented navigation
- Standalone experimental pages
- Hardcoded UI when data-driven is possible

---

## 9. Priority Focus Areas

When improving the system, prioritize:

1. Dashboard as central control plane
2. Compare page (core analytical engine)
3. Intelligence system (md ingestion + rendering)
4. Kanban integration into dashboard

---

## 10. Mental Model

Treat this repo as:

→ A lightweight EA platform  
→ Not a static website  
→ Not a collection of pages  

Everything should move toward:
**interactive, integrated, decision-support system**
