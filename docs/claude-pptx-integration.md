# Claude PPTX Integration — HC/PHAC

## Purpose
This document explains how Claude integrates with the PPTX Builder and Diagram Lab.

## Architecture

```
Intelligence (.md)
   ↓
Claude Skill (hc-phac-pptx)
   ↓
JSON Slide Spec (schema enforced)
   ↓
PPTX Builder
   ↓
Excalidraw Diagram Lab (optional)
   ↓
Final PPTX
```

## Why JSON First
Claude's PPTX skill is designed around structured workflows (read, edit, create) rather than raw slide styling. This repo enforces a JSON-first approach so:
- slides are reusable
- diagrams can be injected
- governance is preserved

## Usage Pattern

### Step 1 — Source
Provide:
- intelligence markdown
- architecture notes
- meeting summaries

### Step 2 — Prompt Claude

Example:

```
Convert this intelligence document into an ARB-ready slide deck JSON.
Use the local schema.
Flag slides requiring diagrams.
```

### Step 3 — Output
Claude produces JSON matching:

`schemas/pptx-slide-spec.schema.json`

### Step 4 — Build
Feed JSON into PPTX Builder.

### Step 5 — Enhance
Use Diagram Lab for diagrams flagged by Claude.

## Design Principle
Claude = reasoning + structure
Builder = rendering + control

## Anti-Patterns
Avoid:
- generating final PPTX directly from Claude
- bypassing schema validation
- mixing visual generation with architecture reasoning

## Future Extensions
- auto-trigger diagram generation
- slide validation agent
- ARB readiness scoring
