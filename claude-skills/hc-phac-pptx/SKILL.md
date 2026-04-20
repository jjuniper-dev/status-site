name: hc-phac-pptx
description: |
  Use this skill whenever the user asks to create, revise, analyze, structure, or convert a slide deck
  for Health Canada (HC) or the Public Health Agency of Canada (PHAC), especially for enterprise
  architecture, AI, ARB, TPO, CDO, CIO, governance, control-plane, runtime, data, or roadmap content.

  Trigger this skill when the task involves:
  - slide decks, decks, slides, presentations, briefings, or PPTX outputs
  - ARB decks, executive decks, EA decks, strategy decks, architecture briefings
  - converting intelligence notes or markdown into slides
  - updating an existing PPTX or template while preserving theme/layout
  - generating a JSON slide spec for downstream PPTX creation

license: Proprietary

# HC/PHAC PPTX Skill

## Purpose
This skill adapts Anthropic's general PPTX workflow to a Health Canada / PHAC enterprise architecture context.
The goal is not to generate random presentation content. The goal is to produce structurally sound,
executive-appropriate, reusable slide specifications and PPTX outputs aligned to HC/PHAC architecture themes.

## Core Rule
Treat PPTX generation as a structured workflow:

1. Read source material
2. Derive slide narrative
3. Assign slide types and visual intent
4. Emit structured JSON matching the PPTX Builder schema
5. Create or update PPTX from the JSON spec

Do not jump directly to decorative slide text with no architecture logic.

## Preferred Workflow

### A. Read / Analyze Inputs
Use this when a PPTX is input, or when markdown/intelligence notes must be converted into a deck.

- Extract content from existing PPTX when needed
- Read intelligence markdown, EA notes, ADR/ADI content, architecture summaries, or decision logs
- Identify the target audience and decision ask before slide generation

### B. Generate Structured Slide Spec
Before creating PPTX, first produce JSON that conforms to:

`schemas/pptx-slide-spec.schema.json`

Every generated deck should include explicit slide typing and visual intent.

### C. Create / Update PPTX
- Use a template-preserving approach when updating an existing deck
- Use a create-from-scratch approach only when no usable template exists
- Preserve executive readability, spacing, and visual hierarchy

## Default HC/PHAC Audience Types
Choose one primary audience and optimize accordingly:

- ARB / EA / TPO
- CDO / OCDO
- CIO / executive leadership
- working-level architecture / delivery teams

## Default Deck Types
Choose one primary deck type:

- executive decision deck
- ARB briefing deck
- architecture model deck
- roadmap / transition deck
- governance / operating model deck
- option analysis deck

## Slide Design Rules

### Narrative
Every deck must have a narrative arc:
1. context / pain / trigger
2. target state or recommendation
3. architecture / logic / evidence
4. risks / dependencies / decision

### Visual Structure
Every slide must have one dominant visual pattern:
- title + architecture diagram
- two-column argument + evidence
- comparison / option matrix
- timeline / transition roadmap
- layered architecture model
- governance operating model
- KPI / status callout

Avoid generic title + bullets unless the content is a brief status slide.

### HC/PHAC Topic Priorities
Prefer strong support for these recurring themes:
- PATH / HAIL
- control plane vs runtime plane
- data governance / Purview / lineage
- ATO / readiness / inherited controls
- shadow AI exposure
- ARB decision framing
- convergence architecture
- enterprise platforms / reference architecture

## Required Output Discipline
When generating slide specs:
- include deck metadata
- include explicit slide type
- include visual intent
- flag which slides require diagrams
- keep bullets concise and decision-oriented
- do not bury the decision ask

## Standard Slide Archetypes
Use only these slide types unless the user explicitly asks otherwise:
- title
- executive-summary
- problem-statement
- architecture-overview
- layered-architecture
- control-plane
- runtime-plane
- data-layer
- option-analysis
- timeline
- risk-register
- decision-ask
- appendix

## Diagram Flagging Rule
If a slide would benefit from a diagram, set:
- `diagram_required: true`
- `diagram_kind` to one of:
  - control-plane
  - layered-ea
  - flow
  - roadmap
  - governance-model
  - capability-map

## JSON First
Before PPTX creation, prefer emitting or validating a JSON deck spec.
This repository uses:
- schema: `schemas/pptx-slide-spec.schema.json`
- integration note: `docs/claude-pptx-integration.md`

## Prompt Pattern
When asked to create a deck from source content, use this internal sequence:

1. Summarize the source in 5-10 decision-relevant points
2. Propose slide outline
3. Convert outline to JSON deck spec
4. Validate schema fields
5. Create or update PPTX

## Guardrails
- Do not produce a deck with no clear audience
- Do not overuse dense paragraphs
- Do not treat architecture and governance as decorative background
- Do not create slides that visually contradict the architecture logic
- Do not output arbitrary colors or motifs that conflict with the repo's HC/PHAC tone unless the user asks for a new style

## Recommended Starter Prompt
Use this when converting HC/PHAC intelligence into slides:

"Convert the provided HC/PHAC source material into a JSON slide spec for an executive architecture deck. Optimize for decision clarity, visual hierarchy, and reuse in PPTX Builder. Use the local schema and flag diagram-required slides explicitly."
