# Artifact Assessment MVP — Acceptance Criteria

Date: 2026-04-19
Status: Draft v0.1
Scope: iPhone-first artifact capture and target-state assessment app aligned to `status-site`

## Product intent
This MVP allows a user to capture an artifact, select one or more target-state decisions or scenarios, submit the artifact for assessment, and receive a structured result showing alignment, gaps, and recommended follow-up references.

---

## Acceptance Criteria

### AC-01 — Multi-input artifact capture
The user can capture artifacts through five input types with minimal friction:
- Camera
- Gallery
- Text Paste
- Webpage Link
- Voice Record

#### Success conditions
- User reaches any capture mode in no more than 2 taps from the main screen.
- Camera capture stores an image artifact with timestamp and source=`camera`.
- Gallery import stores an image artifact with timestamp and source=`gallery`.
- Text paste stores a text artifact with timestamp and source=`paste`.
- Webpage link stores a URL artifact with timestamp and source=`url`.
- Voice record stores an audio artifact with timestamp and source=`voice`.
- Voice recording supports up to 60 seconds.
- Each artifact is assigned a unique local artifact ID.
- Artifact metadata includes at minimum:
  - `artifact_id`
  - `artifact_type`
  - `captured_at`
  - `source`
  - `device_local_status`

#### Failure handling
- If permission is denied for camera, gallery, or microphone, the app shows a direct recovery message.
- If capture fails, the app preserves any already-entered metadata and allows retry.

---

### AC-02 — Target-state registry availability
The app syncs target-state references from the `status-site` and makes them locally browsable.

#### Required registry sources
- `decisions.json`
- `scenarios.json`

#### Success conditions
- Registry content is cached locally for offline viewing.
- User can browse and filter decisions and scenarios independently.
- User can select one or more targets for assessment.
- User can explicitly assess against:
  - a decision (example: `DEC-001`)
  - a scenario (example: `HAIL Production Move`)
  - multiple mixed targets in one assessment request
- Cached target-state content loads in under 1 second after app open on a warm start.
- Registry records include stable IDs, titles, summaries, update timestamps, and assessment anchors.

#### Failure handling
- If sync fails, last known cache remains usable.
- App surfaces registry freshness status to the user.

---

### AC-03 — Assessment execution and response time
The app can submit an artifact plus selected targets for assessment and receive a structured response.

#### Inputs to assessment
- Artifact payload or artifact reference
- Selected decisions and/or scenarios
- Optional normalized metadata
- Optional transcription step for audio
- Optional image understanding step for image inputs

#### External assessment dependencies
- Claude API for reasoning
- MCP-accessible target-state context sources

#### Success conditions
- Assessment completes in less than 10 seconds for standard text, URL, and single-image cases under normal network conditions.
- Audio assessments complete in less than 15 seconds for a 60-second recording under normal conditions.
- Response is returned as structured JSON conforming to the assessment schema.
- Response includes, at minimum:
  - `summary_judgement`
  - `alignment_score`
  - `confidence`
  - `key_findings`
  - `gaps`
  - `violated_constraints`
  - `related_decisions`
  - `recommended_artifacts_to_review`
  - `reasoning`
- Assessment explicitly references the selected targets, rather than returning generic architecture commentary.

#### Failure handling
- If model output is malformed, backend retries normalization once.
- If assessment cannot complete, the request is marked failed with a recoverable error state.

---

### AC-04 — Result presentation and sharing
Assessment results are understandable immediately and still expose full fidelity when needed.

#### Success conditions
- Result screen shows:
  - alignment score
  - summary judgement
  - key findings
  - gaps / violated constraints
  - recommended decisions, scenarios, or artifacts to review
- Raw JSON is accessible in no more than 1 swipe or 1 tap from the result screen.
- User can save the result locally.
- User can share the result in no more than 2 taps.
- Result layout is readable in both portrait and landscape.
- Long reasoning text wraps correctly and remains scrollable.

#### Failure handling
- If partial result is returned, the UI labels it as partial rather than complete.

---

### AC-05 — Offline cache and queued execution
The app works meaningfully when offline.

#### Success conditions
- Cached decisions and scenarios are fully accessible offline.
- User can prepare an assessment request while offline.
- If assessment requires network and no network is available:
  - request is queued locally
  - queue state is visible
  - request auto-retries when connectivity returns or can be retried manually
- Queued request preserves:
  - artifact reference
  - selected targets
  - timestamp
  - request state
- Target-state registry is never blocked by temporary network loss once a cache exists.

#### Failure handling
- If queued assessment expires or becomes invalid, user is informed and can resubmit.

---

### AC-06 — Concurrency and workload handling
The system supports multiple active assessments without collapsing the user experience.

#### Success conditions
- System handles 3 or more concurrent assessment requests.
- Each queued or running assessment shows distinct status:
  - queued
  - uploading
  - assessing
  - completed
  - failed
- No assessment overwrites another assessment’s state or result.
- Results remain associated with the correct artifact and selected targets.

#### Performance target
- 3 concurrent standard assessments should complete without UI blocking or request corruption.

---

### AC-07 — MCP exposure and target-state retrieval
MCP-accessible server capabilities expose the target-state material needed by the assessment engine.

#### Required MCP domains
- decisions
- scenarios
- governance rules
- patterns

#### Success conditions
- MCP layer can return decisions by ID.
- MCP layer can return scenarios by ID.
- MCP layer can return governance rules relevant to a selected target.
- MCP layer can return reference patterns relevant to a selected target.
- Assessment engine can use MCP-retrieved context in the final reasoning packet.
- Missing MCP resources fail gracefully and do not crash the entire assessment flow.

---

## Non-functional acceptance targets

### UX
- Main capture-to-assess flow should be understandable without training.
- Standard artifact assessment should require no more than:
  - 2 taps to capture mode
  - 2 taps to select target(s)
  - 1 tap to assess

### Reliability
- Cached registry should survive app restart.
- Saved assessments should survive app restart.
- Malformed model output should not crash the UI.

### Security / governance
- Artifact metadata and assessment payloads should be tagged with timestamp and source.
- Saved assessments should retain the target IDs used during evaluation.
- Any raw model reasoning shown to the user should remain attached to the corresponding structured result.

---

## Suggested assessment JSON minimum contract

```json
{
  "artifact_id": "uuid",
  "artifact_type": "image|text|url|audio",
  "captured_at": "ISO-8601",
  "selected_targets": [
    {
      "type": "decision|scenario",
      "id": "DEC-001",
      "title": "HAIL Production ATO Gap"
    }
  ],
  "summary_judgement": "aligned|partially_aligned|misaligned|insufficient_evidence",
  "alignment_score": 0,
  "confidence": 0.0,
  "key_findings": [],
  "gaps": [],
  "violated_constraints": [],
  "related_decisions": [],
  "recommended_artifacts_to_review": [],
  "reasoning": "",
  "assessment_version": "v1"
}
```

---

## Recommendation
For first implementation, treat text, URL, and gallery image as the fastest path to a working MVP. Camera and voice remain in scope, but text/URL/image should be the first three paths validated end-to-end.
