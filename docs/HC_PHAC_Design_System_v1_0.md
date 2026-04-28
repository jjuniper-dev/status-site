# HC/PHAC PowerPoint Design System v1.0

**Purpose:** Standardized design system for Enterprise Architecture, AI Architecture, ARB decision decks, and executive briefings.

---

## 1. Core Principles

### 1.1 Government AI Alignment
All slides must reflect:
- Responsible AI
- Human-in-the-loop
- Lifecycle awareness
- Auditability and traceability

### 1.2 EA Design Principle
**Platforms consume governance — they do not define it**

Enforce visually:
- Separation of control, data, runtime
- Governance as cross-cutting layer

### 1.3 Cognitive Load Rule
- ≤10 seconds to understand
- ≤20% text density
- Visual hierarchy over prose

---

## 2. Canvas & Layout

### 2.1 Canvas
- Aspect ratio: 16:9
- Margin: 0.5 cm (mandatory)

### 2.2 Layout Types
- **4-column** → capabilities/domains
- **Layered stack** → architecture
- **Network graph** → platform relationships
- **2-panel** → current vs target

### 2.3 Alignment Rules
- Left → right flow only
- No overlap
- Equal spacing
- Grid-based placement

---

## 3. Color System (HC Standard)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Structure | #2F6F73 | Teal Dark | Headers, frames |
| Components | #6FAFB3 | Teal Mid | Boxes |
| Accent (AI) | #A6CE39 | Green | Highlights only |
| Background | #F4F6F7 | Light Gray | Canvas |
| Neutral | #6D6E71 | Gray | Secondary text |

**Rules:**
- No gradients (except arrows if needed)
- Do not rely on color alone for meaning
- Maintain contrast

---

## 4. Typography

| Element | Spec |
|---------|------|
| Font | Arial |
| Title | 28–32 pt |
| Body | 18–24 pt |
| Labels | 16–18 pt |

**Rules:**
- Left-aligned only
- No justified text
- No paragraphs inside shapes

---

## 5. Content Normalization

Convert all content to:
- 1–3 word labels
- No sentences in diagrams
- Expand acronyms in notes or record layer

---

## 6. Architecture Slide Pattern

### Required Layers
1. **Title Layer**
2. **Platform Layer** (PATH, HAIL, Azure AI Foundry, Microsoft Fabric)
3. **Data Layer** (Governed Data Products, Classification, Lineage)
4. **Governance Overlay** (Policy, ATO, Audit, FinOps, Identity)
5. **Runtime Layer** (Project Runtimes, Isolation boundaries)

---

## 7. Connectors

- **Straight arrows only**
- Left → right or top → bottom
- No crossing lines
- Max 2 types:
  - Flow
  - Control

---

## 8. Governance Visualization

### Rules
- Always cross-cutting (never embedded)
- Use horizontal overlay or band

### Required Elements
- Policy
- ATO (Authority to Operate)
- Audit
- FinOps
- Identity

---

## 9. AI Visual Rules

### Highlighting
Use green (#A6CE39) **only** for:
- AI capabilities
- Model services
- RAG services

### Required Concepts (when applicable)
- Human-in-the-loop
- Model lifecycle
- Data lineage
- Prompt/response traceability

---

## 10. Accessibility (Mandatory)

### Structure
- Use Slide Master
- No manual formatting hacks
- Logical reading order

### Alt Text
All visuals must describe:
- Purpose
- Meaning
- Context

### Readability
- Clear at 200% zoom
- High contrast
- No dense blocks
- Target WCAG 2.1 AA intent

---

## 11. Dual-Layer Model

### Presentation Layer
- Minimal text
- Visual clarity
- Executive-ready

### Record Layer (Hidden Slides)
- Full descriptions
- Acronyms expanded
- Governance details
- Audit-ready

---

## 12. Standard Slide Types

### Executive Decision
- 3–5 bullets
- Clear ask
- Current vs Target

### Architecture Model
- Layered or network view
- Governance visible
- Risks

### Risk Table
| Risk | Impact | Mitigation |
|------|--------|-----------|

### Decision Ask
- What
- Why
- Consequence of inaction

---

## 13. Visual Quality Rules

### DO:
- Clean spacing
- Consistent sizing
- Balanced layout

### DO NOT:
- Use decorative graphics
- Add logos or wordmarks
- Overuse shadows
- Mix styles

---

## 14. Validation Checklist

- [ ] Unique slide titles
- [ ] Logical reading order
- [ ] No manual spacing
- [ ] All shapes labeled or have alt text
- [ ] Governance clearly visible
- [ ] AI elements clearly distinguished
- [ ] Slide understandable in ≤10 seconds

---

## 15. Critical EA Insight (Must Be Reinforced)

### AI is NOT:
- A tool deployment

### AI IS:
- A governed enterprise capability

### Without:
- A centralized data governance control plane

**AI will not scale effectively across HC/PHAC**

---

**Version:** 1.0  
**Last Updated:** April 28, 2026  
**Status:** Approved for EA/AI presentations
