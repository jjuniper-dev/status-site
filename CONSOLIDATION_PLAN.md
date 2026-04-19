# Consolidation Plan: News Feed → Status-Site

**Goal:** Extract useful components from hc-news-briefing-feed repo and integrate into status-site as consolidated AI project dashboard.

**Status:** Ready to extract and consolidate

---

## Files to Extract from News Feed Repo

### 1. Control Surface Layout (Apr 17)
**Source:** hc-news-briefing-feed commit `110d0bf`  
**File:** `index.html` (control surface redesign)  
**Status:** ✓ Extract and adapt

**What it is:**
- Redesigned dashboard home with "AI control surface" layout
- 345 new lines of structured dashboard layout
- Organized view of system status and controls

**How to integrate:**
- Extract the dashboard layout structure
- Replace current status-site `index.html` layout with control surface pattern
- Adapt to show PATH/HAIL status + decisions + scenarios instead of news posts
- Keep the dark theme styling, update colors to match unified palette

**Risk:** May have hardcoded GA/Codex references → Clean before merging

---

### 2. HC/PHAC Intelligence Page (Apr 18)
**Source:** hc-news-briefing-feed commit `c753ab4`  
**File:** `intelligence.html` (NEW — 285 lines)  
**Status:** ✓ Extract, may enhance

**What it is:**
- Complete HC/PHAC AI architecture intelligence page
- Six sections covering:
  - Core definition of PATH as control plane
  - Architectural principles
  - Three-plane system (Control, Runtime, Data)
  - Operating model & onboarding
  - Enterprise positioning relative to HAIL
  - Strategic maturity assessment
- New CSS class: `.intel-link-card`

**How to integrate:**
- Compare with current status-site `intelligence.html`
- Merge best of both versions (more detailed architecture context)
- Update to include decision tracking references
- Link to decision log and scenarios
- Keep the unified design system CSS

**Value:** Provides EA interpretation & platform landscape view

---

### 3. Mobile-First Responsive Framework (Apr 19)
**Source:** hc-news-briefing-feed commit `598ba8a`  
**File:** `index.html` + CSS patterns  
**Status:** ✓ Extract patterns

**What it is:**
- Mobile-first responsive HTML structure
- GitHub-style blog layout (mobile-optimized)
- JSON-driven content pattern
- Responsive CSS with breakpoints

**How to integrate:**
- Extract responsive CSS patterns and breakpoints
- Incorporate into unified `styles.css`
- Apply mobile-first class naming conventions
- Use posts.json pattern as model for decisions.json structure

**Value:** Provides battle-tested responsive framework

---

### 4. JSON Data Structure (Apr 19)
**Source:** hc-news-briefing-feed `posts.json` pattern  
**File:** `posts.json` (data model)  
**Status:** ✓ Adapt pattern

**What it is:**
```json
{
  "posts": [
    {
      "slug": "post-id",
      "date": "2026-04-19",
      "type": "article|update|report",
      "title": "Title",
      "category": "Category",
      "readTime": 5,
      "image": "optional",
      ...metadata
    }
  ]
}
```

**How to integrate:**
- Use same structure for `decisions.json`:
  ```json
  {
    "decisions": [
      {
        "id": "DEC-001",
        "date": "2026-04-19",
        "type": "governance|architecture|resource",
        "title": "Decision Title",
        "category": "Category",
        "status": "active|pending|archived",
        ...metadata
      }
    ]
  }
  ```
- Apply same rendering pattern to decisions, scenarios, artifacts

**Value:** Proven data-first architecture for content updates

---

### 5. UI Animations & Transitions (Apr 17)
**Source:** hc-news-briefing-feed commit `374df7b`  
**File:** Various CSS files  
**Status:** ◐ Extract selectively

**What it is:**
- Lightweight UI animations for dashboard interactivity
- Smooth transitions and hover effects
- Dynamic feel without heavy frameworks

**How to integrate:**
- Extract animation classes
- Add to unified `styles.css`
- Apply to decision cards, scenario cards, artifact cards
- Ensure animations don't impact accessibility

---

## Files NOT to Extract

- ❌ **News post rendering logic** — Different purpose
- ❌ **Feed aggregation scripts** — Not needed for dashboard
- ❌ **Weather generation** — Not relevant
- ❌ **GitHub Actions workflows** (most) — Can rebuild if needed
- ❌ **Duplicate pages** — We have versions already

---

## Integration Strategy

### Step 1: Backup & Compare (1 day)
- [ ] Create branch `claude/v1.0-consolidate-news-feed`
- [ ] Compare news feed `index.html` control surface with status-site `index.html`
- [ ] Compare news feed `intelligence.html` with status-site `intelligence.html`
- [ ] Document which patterns/code to keep from each

### Step 2: Extract Control Surface (1 day)
- [ ] Extract index.html control surface layout from news feed
- [ ] Remove news/post specific code (keep structure)
- [ ] Replace status-site index.html layout with control surface
- [ ] Test: Homepage loads, navigation works

### Step 3: Extract & Merge Intelligence (1 day)
- [ ] Extract intelligence.html from news feed (285 lines)
- [ ] Compare with current status-site intelligence.html
- [ ] Merge: Keep architecture sections from news feed, add links to decisions/scenarios
- [ ] Extract `.intel-link-card` CSS to unified styles.css

### Step 4: Extract Responsive Framework (1 day)
- [ ] Extract responsive CSS patterns from news feed
- [ ] Extract mobile-first HTML structure patterns
- [ ] Add to unified `styles.css`
- [ ] Add responsive HTML patterns to component library

### Step 5: Adapt JSON Pattern (1 day)
- [ ] Study posts.json structure and rendering logic
- [ ] Create decisions.json following same pattern
- [ ] Create scenarios.json following same pattern
- [ ] Test: JSON loads, renders correctly in decision log page

### Step 6: Apply Unified Design System (2 days)
- [ ] Remove all old inline CSS from extracted pages
- [ ] Link all pages to unified `styles.css`
- [ ] Apply consistent color palette
- [ ] Test: All pages styled consistently, colors correct

### Step 7: Integration Testing (1 day)
- [ ] Test all pages at 1100px, 768px, 480px
- [ ] Test navigation between extracted & existing pages
- [ ] Test responsive layout at all breakpoints
- [ ] Test decision/scenario links from control surface

### Step 8: Archive News Feed (When done)
- [ ] Confirm all useful code extracted
- [ ] Archive hc-news-briefing-feed repo
- [ ] Update status-site README with consolidation note

---

## Files to Create/Modify in status-site

### Modify (Extract from news feed):
- `index.html` — Replace with control surface layout
- `intelligence.html` — Merge with HC/PHAC intelligence page
- `styles.css` (NEW) — Add responsive + animation patterns from news feed

### Create (New):
- `data/decisions.json` — Decision log data
- `data/scenarios.json` — Scenario definitions
- `decisions.html` — Decision log page (new)
- `scenarios.html` — Scenario navigator page (new)
- `dashboard.js` — Dashboard interactivity
- `CONSOLIDATED_SITE_DESIGN.md` ✓ (created)
- `CONSOLIDATION_PLAN.md` ✓ (this file)

### Keep as-is (Link in navigation):
- `path-architecture.html`
- `control-plane.html`
- `pptx-builder.html`
- `artifacts.html` (enhance with decision links)

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Control surface layout has news-specific code | Compare carefully, extract only dashboard structure, remove post/news logic |
| Different CSS variable names between repos | Use unified `styles.css`, normalize all variable names |
| Intelligence page duplicate content | Merge both versions, keep best from each |
| Breaking changes to existing pages | Test at each step, validate navigation/links |
| JSON data inconsistency | Use same schema across decisions/scenarios/artifacts |

---

## Success Criteria for Consolidation

✓ All useful code extracted from news feed → status-site  
✓ Control surface layout integrated into homepage  
✓ HC/PHAC intelligence page merged  
✓ Responsive framework patterns applied  
✓ Unified CSS system in place  
✓ All pages styled consistently  
✓ Responsive at 1100px, 768px, 480px  
✓ Decision/scenario/artifact JSON populated  
✓ Decision log page functional  
✓ Scenario navigator functional  
✓ Navigation updated to link all new pages  
✓ News feed repo archived  

---

## Estimated Effort

**Total: 8–10 days**
- Step 1: 1 day (comparison & analysis)
- Step 2: 1 day (control surface)
- Step 3: 1 day (intelligence merge)
- Step 4: 1 day (responsive patterns)
- Step 5: 1 day (JSON adaptation)
- Step 6: 2 days (design system integration)
- Step 7: 1 day (testing)
- Step 8: 0.5 day (archive)

**Overlap with original plan:** Steps 1–6 replace original Phase 1 (design system), Steps 7–8 continue as Phase 2.

---

## Next Action

1. **Approve consolidation plan** ✓
2. **Start Step 1** — Compare and analyze both repos
3. **Extract control surface** — Begin Phase 1 implementation

Ready to proceed?

