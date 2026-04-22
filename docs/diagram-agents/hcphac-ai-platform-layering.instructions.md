# HC/PHAC AI Platform Layering Diagram — Agent Instructions

## Purpose
Generate a standardized enterprise architecture diagram aligned to the PATH / HAIL visual model.

## Inputs
- Schema: `schemas/hcphac-ai-platform-layering.excalidraw.schema.json`

## Rendering Rules
- Preserve all layers exactly as defined
- Do not merge or reorder layers
- Maintain ownership separation:
  - Top layers = GC-provided
  - Lower layers = HC/PHAC-controlled

## Critical Constraints
- CANChat must be shown as UI-only (not API-accessible)
- GCTranslate must remain in the governed shared services layer
- GREP-ExP must be in departmental modules
- HAIL = current runtime
- PATH = target control plane

## Diagram Style
- 16:9 layout
- Horizontal layered stack
- Flat design (no gradients or shadows)
- Straight connectors only
- High contrast, accessible

## Output Expectations
- Readable in <10 seconds
- Clearly communicates:
  - Layer separation
  - Ownership boundaries
  - Governance vs execution distinction

## Do Not
- Treat shared AI tools as enterprise platforms
- Assume LLM access equals integration capability
- Collapse control and runtime layers

## Optional Enhancements
- Add progression label: "Productivity → Knowledge → Decision AI"
- Include side note on LLM vs application ownership
