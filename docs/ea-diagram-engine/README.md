# EA Diagram Engine

## Purpose
The EA Diagram Engine is a provider-agnostic architecture for generating enterprise architecture diagrams from structured requests.

It is designed to support:
- OpenAI
- Gemini
- OpenAI-compatible / open-model endpoints
- execution with skills/tools enabled
- execution without skills/tools enabled

It separates:
- request intake
- provider selection
- orchestration mode
- diagram planning
- diagram rendering
- artifact export

---

## Core Design Principle
Models are interchangeable planning engines.
Rendering is a separate concern.

The engine must not hard-code one vendor into the workflow.

---

## Supported Execution Modes

### 1. Direct Model Mode
Prompt-only generation with no external skills/tools.

Use when:
- the request is simple
- deterministic output schema is enforced
- environment has no tool runtime

### 2. Tool / Skill Augmented Mode
Model can use structured tools, remote MCP-style capabilities, local skills, or function-calling loops.

Use when:
- the model must inspect source files
- the model must retrieve reference content
- the model must run diagram transforms or exporters
- the workflow needs multi-step planning

### 3. Hybrid Mode
Use structured schema and deterministic post-processing first, then escalate to tools/skills only when needed.

Preferred default.

---

## Provider Targets

### OpenAI
Recommended for:
- reasoning-led diagram planning
- tool-augmented orchestration
- Responses API based execution
- remote MCP / built-in tool workflows

### Gemini
Recommended for:
- schema-constrained generation
- function-calling workflows
- compositional tool chains
- strong structured output use cases

### Open-model / OpenAI-compatible endpoint
Recommended for:
- private hosting
- cost-controlled execution
- local or sovereign deployments
- fallback planning mode where frontier APIs are unavailable

This layer should be treated as an abstraction target, not a single vendor assumption.

---

## Engine Layers

### A. Request Layer
Input object describing:
- title
- purpose
- audience
- diagram type
- layers/components
- relationships
- constraints
- rendering target

### B. Planning Layer
Normalizes request into:
- semantic graph
- layout plan
- annotation plan
- accessibility metadata

### C. Provider Adapter Layer
Maps normalized request into provider-specific calls.

Adapters:
- `openai-responses`
- `gemini-functions`
- `openai-compatible-chat`

### D. Orchestration Layer
Chooses execution path:
- no-skills
- with-skills
- with-function-calling
- with-local transforms

### E. Rendering Layer
Outputs one or more of:
- Excalidraw schema
- Mermaid
- SVG
- PNG
- PPTX-friendly JSON

### F. Artifact Layer
Stores:
- request
- normalized plan
- rendered outputs
- audit metadata
- provider used
- execution mode used

---

## Recommended Repo Structure

```text
schemas/
  ea-diagram-engine.config.schema.json
  ea-diagram-request.schema.json
  hcphac-ai-platform-layering.excalidraw.schema.json

docs/
  ea-diagram-engine/
    README.md
    provider-modes.md
  diagram-agents/
    hcphac-ai-platform-layering.instructions.md

artifacts/
  diagrams/
    requests/
    renders/
    exports/
```

---

## Provider Mode Matrix

| Mode | OpenAI | Gemini | Open-model endpoint |
|---|---|---|---|
| Prompt only | Yes | Yes | Yes |
| Structured outputs | Yes | Yes | Depends on endpoint |
| Function calling | Yes | Yes | Depends on endpoint |
| Skills / local runtime | Yes | Partial via external orchestration | External orchestration required |
| MCP / remote tool model | Yes | External orchestration required | External orchestration required |

---

## Skills vs No-Skills Design

### No-Skills Path
Use:
- strict request schema
- strict output schema
- deterministic validator
- renderer

Best for:
- simple layered diagrams
- repeatable architecture visuals
- low-risk generation

### Skills Path
Use:
- repo/file inspection
- policy lookup
- icon lookup
- style reference retrieval
- PPTX export automation

Best for:
- large architecture sets
- document-driven visuals
- multi-step diagram generation

---

## Minimum Viable Flow

1. Receive structured diagram request
2. Validate against request schema
3. Normalize into planning object
4. Select provider + orchestration mode
5. Generate rendering schema
6. Validate output structure
7. Export artifacts
8. Save trace metadata

---

## Governance Requirements

Every generated diagram should capture:
- request timestamp
- provider
- model
- execution mode
- source documents or prompts
- schema version
- validation outcome

---

## Initial Recommendation

Default engine mode:
- Planning: OpenAI or Gemini
- Output contract: JSON schema first
- Rendering target: Excalidraw schema first
- Escalation: tools/skills only when request complexity requires them

This gives:
- portability
- lower vendor lock-in
- deterministic outputs
- future PPTX integration
