# Routing Engine Spec v1 — Disagreement-Driven Routing (DDR)

Date: 2026-04-19  
Status: Draft v1  
Scope: Ayla / PKA artifact ingestion, classification, and vault routing  
Pattern Base: GREP-ExP → Adapted to Personal Cognitive Architecture (PCA)

## 1. Purpose

Define a deterministic, disagreement-driven routing engine that:
- Classifies incoming artifacts into vault clusters
- Filters noise (discard vs keep)
- Minimizes manual effort
- Improves over time via structured feedback (no retraining required)

## 2. Core Principle

Routing confidence is derived from inter-agent agreement, not model self-confidence.

## 3. High-Level Flow

Artifact → Normalize → Primary Agent → Critical Agent → Agreement Check
- Agree → Auto-route
- Disagree → Ensemble
  - Confident → Auto-route
  - Uncertain → Human Review → Feedback Memory → Future Improvement

## 4. Input Contract

### 4.1 Artifact Object

```json
{
  "artifact_id": "uuid",
  "source_type": "rss|voice|bookmark|email|clip",
  "captured_at": "ISO-8601",
  "title": "...",
  "raw_text": "...",
  "summary": "...",
  "source_url": "...",
  "metadata": {}
}
```

## 5. Routing Taxonomy

Allowed clusters:
- `ea_work`
- `ayla_stack`
- `music_hifi`
- `ottawa_lifestyle`
- `reference_archive`
- `discard`
- `needs_review`

## 6. Output Contract

```json
{
  "artifact_id": "uuid",
  "retain_decision": "keep|discard|review",
  "primary_cluster": "ea_work|ayla_stack|music_hifi|ottawa_lifestyle|reference_archive|discard|needs_review",
  "secondary_clusters": ["optional"],
  "confidence_band": "high|medium|low",
  "signals": ["keyword", "project_ref", "location", "topic_overlap"],
  "reasoning": "short explanation",
  "agent": "routing|critical|ensemble"
}
```

## 7. Agent Definitions

### 7.1 Routing Agent (Primary)
Model: Claude Sonnet
Purpose:
- Assign primary cluster
- Determine retain/discard
- Provide reasoning

Context:
- artifact text
- routing criteria
- few-shot examples from vault

### 7.2 Critical Agent (Adversarial)
Model: Claude Haiku
Constraints:
- Cannot see Routing Agent output
- Must independently classify
- Encouraged to challenge assumptions

Purpose:
- Detect misclassification
- Identify ambiguity
- Flag weak evidence

## 8. Agreement Engine (Deterministic)

### 8.1 Agreement Conditions

Auto-route if ALL true:
- `retain_decision` matches
- `primary_cluster` matches
- neither agent returns `review`
- no strong ambiguity signal

### 8.2 Disagreement Conditions

Escalate if ANY:
- cluster mismatch
- keep vs discard mismatch
- either returns `review`
- reasoning conflicts materially

## 9. Ensemble Layer

### 9.1 Trigger Conditions
Run ensemble if:
- disagreement detected
- artifact not clearly discardable

### 9.2 Execution
- 3 parallel Haiku runs
- randomized prompt phrasing
- varied emphasis

### 9.3 Output

```json
{
  "votes": {
    "ea_work": 1,
    "ayla_stack": 2
  },
  "final_cluster": "ayla_stack",
  "confidence": 0.67
}
```

### 9.4 Decision Rule
- ≥ 67% majority → auto-route
- < 67% → human review

## 10. Human Review Layer

### 10.1 Trigger
- unresolved disagreement
- low ensemble confidence
- ambiguous or multi-domain artifact

### 10.2 Interface
User sees:
- artifact summary
- agent outputs
- reasoning
- suggested routes

### 10.3 User Action
User selects:
- correct cluster
- retain/discard
- optional explanation

## 11. Feedback Memory Layer

### 11.1 Structured Rule Storage

```json
{
  "rule_id": "ROUTE-001",
  "condition": "artifact mentions MCP, n8n, Obsidian, Claude",
  "route_to": "ayla_stack",
  "retain": "keep",
  "created_at": "2026-04-19",
  "source": "user_review",
  "status": "active"
}
```

### 11.2 Prompt Injection
Rules are:
- rendered into natural language
- appended to system prompt
- applied in future routing

### 11.3 Governance
Must support:
- rule versioning
- rule disable/rollback
- deduplication

## 12. Retention Logic

Separate from routing:
- Keep: relevant to active domains
- Discard: spam, duplicates, low-value
- Review: ambiguous or incomplete

## 13. Multi-Label Handling

Allowed:
- one `primary_cluster`
- optional `secondary_clusters`

Use cases:
- EA + Ayla overlap
- Ottawa + personal relevance

## 14. n8n Implementation Flow

1. Ingestion Node — normalize artifact
2. Routing Agent — API call
3. Critical Agent — API call, stripped context
4. Agreement Check — function node
5. Conditional branch
   - agree → route
   - disagree → ensemble
6. Ensemble — parallel nodes
7. Decision node
   - confident → route
   - uncertain → approval node
8. Approval Node — user input
9. Feedback write — update rule store
10. Vault write — create/update Obsidian note

## 15. Performance Targets

- Primary + critical: < 6s
- Ensemble: < 10s total
- Human review latency: user-driven
- Throughput: ≥ 3 concurrent artifacts

## 16. Failure Modes

Deterministic:
- missing artifact text
- invalid classification
- API failure

Model-related:
- hallucinated routing
- over-generalization
- category drift

Mitigation:
- disagreement logic
- human review
- rule memory

## 17. Observability

Track:
- agreement rate
- disagreement rate
- ensemble usage %
- human intervention %
- routing accuracy (post-review)
- rule effectiveness

## 18. Evolution Path

### v1 (current)
- 5–6 clusters
- simple rules
- manual feedback

### v2
- weighted routing
- preference modeling
- confidence calibration

### v3
- graph-aware routing
- semantic linking
- predictive tagging

## 19. Canonical Summary

The Routing Engine is a disagreement-driven classification system that routes knowledge artifacts into a structured personal vault while minimizing human effort and continuously improving through feedback.

It is:
- adversarial by design
- deterministic at decision points
- selective in escalation
- incremental in learning
