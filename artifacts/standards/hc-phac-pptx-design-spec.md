# HC/PHAC PPTX DESIGN SPEC (EA / AI — v1.0)

## Purpose
Standardized PowerPoint design system for:
- Enterprise Architecture (EA)
- AI Architecture
- ARB decision decks
- Executive briefings

Supports:
- Presentation clarity
- Institutional record
- Accessibility (WCAG-aligned)

---

## 1. Core Principles

### 1.1 Government AI Alignment
All slides must reflect:
- Responsible AI
- Human-in-the-loop
- Lifecycle awareness
- Auditability and traceability

### 1.2 EA Design Principle
> Platforms consume governance — they do not define it

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
- 4-column → capabilities/domains
- Layered stack → architecture
- Network graph → platform relationships
- 2-panel → current vs target

### 2.3 Alignment Rules
- Left → right flow only
- No overlap
- Equal spacing
- Grid-based placement

---

## 3. Color System (HC Standard)

| Role        | Color     | Usage            |
|-------------|-----------|------------------|
| Structure   | #2F6F73   | headers, frames  |
| Components  | #6FAFB3   | boxes            |
| Accent (AI) | #A6CE39   | highlights only  |
| Background  | #F4F6F7   | canvas           |
| Neutral     | #6D6E71   | secondary text   |

Rules:
- No gradients (except arrows if needed)
- Do not rely on color alone for meaning
- Maintain contrast

---

## 4. Typography

| Element | Spec |
|--------|------|
| Font | Arial |
| Title | 28–32 pt |
| Body | 18–24 pt |
| Labels | 16–18 pt |

Rules:
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

1. Title Layer  
2. Platform Layer  
3. Data Layer  
4. Governance Overlay  
5. Runtime Layer  

---

### Platform Examples
- PATH
- HAIL
- Azure AI Foundry
- Microsoft Fabric

### Data Layer Examples
- Governed Data Products
- Classification
- Lineage

### Governance Overlay
- Policy
- ATO
- Audit
- FinOps
- Identity

### Runtime Layer
- Project Runtime A
- Project Runtime B
- Isolation boundary

---

## 7. Connectors

- Straight arrows only
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
- ATO
- Audit
- FinOps
- Identity

---

## 9. AI Visual Rules

### Highlighting
Use green (#A6CE39) only for:
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

### Target
- WCAG 2.1 AA intent
- Accessibility checker passes

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

### Current vs Target
- Left: fragmented
- Right: governed

### Architecture Model
- Layered or network view
- Governance visible

### Risks
| Risk | Impact | Mitigation |

### Decision Ask
- What
- Why
- Consequence of inaction

---

## 13. Visual Quality Rules

DO:
- Clean spacing
- Consistent sizing
- Balanced layout

DO NOT:
- Use decorative graphics
- Add logos or wordmarks
- Overuse shadows
- Mix styles

---

## 14. Validation Checklist

- Unique slide titles
- Logical reading order
- No manual spacing
- All shapes labeled or have alt text
- Governance clearly visible
- AI elements clearly distinguished
- Slide understandable in ≤10 seconds

---

## 15. Critical EA Insight (Must Be Reinforced)

AI is not:
- a tool deployment

AI is:
- a governed enterprise capability

Without:
- a centralized data governance control plane

AI will not scale effectively across HC/PHAC

---
