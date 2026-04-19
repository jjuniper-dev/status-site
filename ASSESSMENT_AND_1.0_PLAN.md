# Status Site — 1.0 Release Assessment & Plan

**Date:** April 19, 2026  
**Current Version:** 1.4 (draft)  
**Target Version:** 1.0 (production-ready)

---

## Executive Summary

The status-site is an EA intelligence reporting platform for HC/PHAC PATH and HAIL programs. Current state shows solid content and design direction but lacks:
- **Mobile responsiveness** (fixed 1100px width on 4/6 main pages)
- **CSS coherence** (duplicated styles across every page, inconsistent design systems)
- **Component reusability** (navigation, footer, color palette vary by page)
- **Production polish** (hardcoded versions, no changelog, no performance optimization)

**Recommendation:** Consolidate into a unified design system, add responsive breakpoints, extract shared components, and establish a content/version management approach before 1.0 release.

---

## Current State Assessment

### 1. Content & Information Architecture ✓ (Solid)

**Strengths:**
- Clear purpose: HC/PHAC AI governance and capability reporting
- Well-organized main narrative on index.html
- Structured artifact metadata in JSON
- Consistent information hierarchy and messaging

**Issues:**
- 9 artifact placeholder pages (28 lines each) are nearly empty stubs
- artifacts-index.json has duplicate entries (entries 7 and 8 are identical)
- No site map, search beyond artifacts page, or content discoverability
- Version numbers and dates hardcoded in every page footer

---

### 2. Design System & Visual Coherence ⚠️ (Inconsistent)

**Color Palette Issues:**
- `index.html`, `control-plane.html`, `intelligence.html` use: `--red`, `--teal`, `--gold`, `--blue-light`
- `path-architecture.html` uses: `--teal`, `--green`, `--amber` (missing red)
- `artifacts.html` uses minimal color system (only teal)
- **Impact:** Logo colors, status indicators, and accent colors render inconsistently across site

**Typography:**
- All use IBM Plex fonts (good)
- Font size scales vary (`14px` base, but heading sizes differ by page)
- Line height inconsistent (`1.55` vs `1.6` vs `1.65`)

**Layout Issues:**
- No unified grid system: mix of custom grid columns and flexbox
- Padding/margins vary: `28px 40px` vs `20px` vs unspecified
- Border thickness and color opacity differ across pages

---

### 3. Mobile Responsiveness ✗ (Broken on 4/6 pages)

| Page | Current Width | Mobile Ready? | Issue |
|------|---------------|---------------|-------|
| index.html | 1100px fixed | ❌ No | No breakpoint, body width breaks |
| control-plane.html | 1100px fixed | ❌ No | No breakpoint, body width breaks |
| intelligence.html | 1100px fixed | ❌ No | No breakpoint, body width breaks |
| pptx-builder.html | 1100px fixed | ❌ No | No breakpoint, body width breaks |
| path-architecture.html | Responsive | ✓ Yes | Has `@media (max-width: 980px)` |
| artifacts.html | 1100px fixed | ❌ No | No breakpoint, body width breaks |

**Test result:** Horizontal scroll required on all devices under 1100px. Navigation bar collapses off-screen. Tables don't reflow.

---

### 4. CSS Architecture ✗ (Duplicated & Maintenance Risk)

**Current Problem:**
- ~650–1100 lines of CSS per page, **all duplicated**
- 6 pages × ~800 lines average = **~4800 lines of duplicate CSS**
- Minified CSS in `artifacts.html`, formatted CSS in others
- Changes must be applied 6 times, creating sync risk

**Example duplication (topnav):**
```css
/* Appears in: index.html, control-plane.html, intelligence.html, artifacts.html, path-architecture.html, pptx-builder.html */
.topnav { position:sticky; top:0; z-index:1000; ... }
```

---

### 5. Navigation & Routing ⚠️ (Manual management)

**Current State:**
- Navigation hardcoded on every page
- "Active" state indicator based on `href` match, not automatic
- No centralized nav config
- Some pages have breadcrumb, some don't
- Artifact detail pages (9 pages) have no nav links back

---

### 6. Performance ⚠️ (Acceptable but improvable)

**Issues:**
- Google Fonts loaded on every page (6 separate requests)
- No CSS minification (except artifacts.html)
- No asset caching strategy
- No lazy loading for images
- Artifact images not optimized

---

### 7. Accessibility ⚠️ (Gaps)

- Links have no focus styles
- Some tables don't have proper `<th>` headers
- Color contrast adequate but no fallback for colorblind
- Status dots color-only (should have labels)

---

## 1.0 Release Plan

### Phase 1: Design System (2–3 days)

**Goal:** Single source of truth for all UI

**Tasks:**

1. **Create `styles.css` (unified stylesheet)**
   - Consolidate all CSS from 6 pages
   - Establish single color palette with fallbacks
   - Define responsive breakpoints: `1100px`, `768px`, `480px`
   - Add CSS reset / normalize

2. **Define Component Library**
   - `.topnav` with flex wrapping
   - `.card` / `.insight-card` with consistent spacing
   - `.section-label` with horizontal rule
   - `.table` with responsive overflow
   - `.grid-2`, `.grid-3` with responsive stacking
   - Status indicator system (dot + label)

3. **Responsive Breakpoints**
   ```css
   /* Desktop-first */
   body { width: 1100px; margin: 0 auto; padding: 28px 40px; }
   
   @media (max-width: 1100px) { body { width: 100%; padding: 20px 24px; } }
   @media (max-width: 768px) { body { padding: 16px 20px; } .grid-2, .grid-3 { grid-template-columns: 1fr; } }
   @media (max-width: 480px) { h1 { font-size: 28px; } .topnav { flex-direction: column; } }
   ```

4. **Color System**
   ```css
   :root {
     /* Primary palette */
     --red: #E8192E;
     --teal: #00C8C8;
     --gold: #F9D030;
     --green: #7CFFB2;
     --blue-light: #5FA8E8;
     
     /* Backgrounds */
     --bg: #07090F;
     --bg2: #0D1117;
     --bg3: #131920;
     
     /* Text */
     --text: #F0F4FA;
     --text-dim: #B0BFCF;
     --text-faint: #6A7D90;
     
     /* Borders */
     --border: rgba(255,255,255,0.10);
     --border-bright: rgba(255,255,255,0.22);
   }
   ```

**Deliverable:** `styles.css` (~600 lines, minified to ~350 lines)

---

### Phase 2: Component Refactor (2–3 days)

**Goal:** Update all 6 main pages to use unified styles + responsive layout

**Tasks:**

1. **Update all page headers**
   - Remove inline `<style>` tags
   - Add `<link rel="stylesheet" href="styles.css">`
   - Keep page-specific overrides only (minimal)

2. **Fix responsive issues**
   - Remove `width: 1100px` from body
   - Use `max-width: 1100px; margin: 0 auto; width: 100%;`
   - Test all pages at: 1100px, 980px, 768px, 480px, 320px

3. **Normalize navigation**
   - Consistent topnav HTML structure
   - Active state auto-detection via JavaScript
   - Breadcrumb on all pages (except home)

4. **Test pages:**
   - `index.html` → Desktop, Tablet, Mobile
   - `path-architecture.html` → Already responsive, verify consistency
   - `control-plane.html` → New responsive version
   - `intelligence.html` → New responsive version
   - `pptx-builder.html` → New responsive version
   - `artifacts.html` → New responsive version + improve search UI

**Deliverable:** All 6 pages passing responsive tests

---

### Phase 3: Artifact Details & Navigation (1–2 days)

**Goal:** Make artifact pages functional and discoverable

**Tasks:**

1. **Fix artifacts-index.json**
   - Remove duplicate entries (7 and 8)
   - Add missing detail pages or update placeholders
   - Add `breadcrumb` field to each artifact

2. **Create artifact detail template**
   - Reusable HTML structure
   - Back to artifacts page link
   - Related artifacts section
   - Consistent header/footer

3. **Generate artifact pages from JSON**
   - Write simple HTML generator or use template system
   - Ensure all 9 artifacts have full pages with images

4. **Add site navigation layer**
   - Site map page (link from footer)
   - Search functionality (full-text, not just artifacts)
   - Breadcrumb auto-generation

**Deliverable:** All artifact pages populated + linked properly

---

### Phase 4: Polish & QA (1–2 days)

**Goal:** Production-ready experience

**Tasks:**

1. **Performance**
   - Minify CSS and inline critical styles
   - Lazy-load artifact images
   - Add caching headers
   - Test page load time (target: <2s)

2. **Accessibility**
   - Add focus styles (`:focus-visible`)
   - Label all status indicators (not color-only)
   - Ensure WCAG AA compliance for color contrast
   - Test with keyboard navigation

3. **Versioning & Metadata**
   - Add `VERSION` constant in shared JS
   - Auto-populate footer with version + build date
   - Create CHANGELOG.md
   - Add Git commit SHA to footer (if hosted)

4. **Testing**
   - Run through full test plan (see below)
   - Cross-browser: Chrome, Firefox, Safari, Edge
   - Mobile browsers: iOS Safari, Chrome Mobile
   - Accessibility: axe DevTools, WAVE

**Deliverable:** Production-ready site, CHANGELOG.md, test report

---

## 1.0 Test Plan

### Desktop Browser Testing (1100px width)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Home Page Load** | Navigate to `index.html` | Page loads, layout centered, all content visible | |
| **Navigation** | Click each topnav link | Correct page loads, active state highlights | |
| **Convergence Grid** | View 3-column grid (HC ↔ PHAC) | Columns align, arrows visible, no overflow | |
| **Status Table** | Scroll status table | All columns visible, status dots colored correctly | |
| **Artifact Cards** | Hover over artifact cards | Border color changes to teal, subtle lift effect | |
| **Link Functionality** | Click links to other pages | Navigate correctly, breadcrumb updates | |
| **Typography** | Measure heading sizes | Consistent across pages, proper hierarchy | |
| **Color Consistency** | Check red/teal/gold usage | Consistent badge colors, status indicators | |

### Tablet Testing (768px width)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Responsive Layout** | Resize to 768px | 2-column grids stack to 1 column, still readable | |
| **Navigation Wrap** | Check topnav | Links wrap but stay readable, no horizontal scroll | |
| **Tables** | View layer tables | Columns stack or scroll horizontally (no overflow) | |
| **Artifact Grid** | View artifact grid | Cards stack to 1 column, full width | |
| **Fonts** | Check heading sizes | Responsive scaling, still readable | |
| **Spacing** | Measure padding/margins | Reduced but consistent, no crowding | |

### Mobile Testing (480px width)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Viewport** | Open on iPhone 13 | No horizontal scroll, full width utilization | |
| **Navigation** | View topnav on mobile | Stack vertically OR use hamburger menu, clear | |
| **Typography** | Read main content | Headings 28px+, body text 14px+, readable | |
| **Touch Targets** | Try clicking buttons/links | Minimum 44px height, spaced for thumb taps | |
| **Forms** | Test search on artifacts page | Input visible, keyboard accessible, submit clear | |
| **Images** | View artifact images | Scaled appropriately, not cut off | |
| **Grids** | All grid layouts | Single column, full width, no overflow | |
| **Footer** | Scroll to footer | Readable, links clickable | |

### Cross-Browser Testing (Desktop)

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | |
| Firefox | Latest | |
| Safari | Latest | |
| Edge | Latest | |

### Accessibility Testing

| Test | Tool | Passing Criteria | Status |
|------|------|------------------|--------|
| Color Contrast | axe DevTools or WAVE | WCAG AA minimum (4.5:1) | |
| Keyboard Navigation | Manual + Tab key | All interactive elements reachable, focus visible | |
| Screen Reader | NVDA / JAWS / VoiceOver | Page structure logical, headings nested correctly | |
| Focus States | Manual | All buttons/links have visible focus ring | |
| Color-Blind Safe | Color Oracle or simulated | Status indicators have labels, not color-only | |

### Content Testing

| Test | Expected Result | Status |
|------|-----------------|--------|
| **Artifact Links** | All artifact cards link to detail pages | |
| **Breadcrumbs** | Present on all pages except home, format: `Parent > Current` | |
| **Page Titles** | Unique, descriptive, <60 chars | |
| **Metadata** | Version, date, classification badges present | |
| **Search** | Artifacts page search filters by title/keywords | |
| **External Links** | Links to external sites (if any) open in new tab | |

### Performance Testing

| Metric | Target | Tool |
|--------|--------|------|
| Page Load Time | < 2s | Chrome DevTools / Lighthouse |
| First Contentful Paint (FCP) | < 1s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| CSS Bundle Size | < 50KB | DevTools |

---

## Success Criteria for 1.0

✓ All pages responsive at 480px, 768px, 1100px  
✓ Single `styles.css`, no duplicate CSS in pages  
✓ Navigation consistent across all pages with working active state  
✓ All artifact pages populated and linked  
✓ WCAG AA accessibility compliance  
✓ Desktop + Mobile browser test suite passing  
✓ Version management system in place  
✓ CHANGELOG.md documenting 0.x → 1.0 changes  

---

## Implementation Priority

**Must Have (1.0 release blocker):**
1. Responsive design on all pages
2. Unified CSS system
3. Fixed navigation active state
4. Mobile browser testing passing

**Should Have (strongly recommended):**
1. Accessibility compliance
2. Artifact pages populated
3. Performance optimization
4. Version management

**Nice to Have (future releases):**
1. Full-site search
2. Dark/light mode toggle
3. PDF export functionality
4. Interactive diagrams

---

## Estimated Effort

| Phase | Days | Lead Task |
|-------|------|-----------|
| 1. Design System | 2–3 | CSS consolidation |
| 2. Component Refactor | 2–3 | Responsive markup updates |
| 3. Artifacts & Nav | 1–2 | Detail pages + linking |
| 4. Polish & QA | 1–2 | Testing + accessibility |
| **Total** | **6–10 days** | |

---

## Next Steps

1. **Approve this plan** and prioritize phases
2. **Start Phase 1** (Design System) — extract unified styles.css
3. **Set up branch** `claude/v1.0-refactor` for changes
4. **Create tracking** for test cases (GitHub issues or checklist)
5. **Schedule QA pass** with stakeholders before release

