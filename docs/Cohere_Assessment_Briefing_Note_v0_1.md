# Architecture Assessment — Cohere as an AI Offering for HC/PHAC

**Assessment date:** April 2026
**Prepared by:** EA / TPO
**Audience:** CDO, ARB
**Status:** Draft, EA/TPO interpretation. Not citeable Government of Canada (GC) policy.
**Classification:** Unclassified / Non classifié

---

## Executive summary

Cohere is a Canadian-founded, Toronto-headquartered artificial intelligence (AI) company. It offers several capabilities of interest to Health Canada and the Public Health Agency of Canada (HC/PHAC): the Command family of large language models, the Embed and Classify models for semantic search and content categorisation, the Aya family of open-weight models, and the North agentic platform. Cohere is already available to HC/PHAC employees through Shared Services Canada's CANChat pilot alongside other models.

Applying the draft AI Offering Assessment Rubric produces a composite score of 58.5 out of 100 and a positioning profile that is genuinely mixed across the three strategic axes. Two mandatory gates fail as written today: classification capability for Protected B, and internal Security Assessment and Authorization (SA&A) ownership. Neither failure is unique to Cohere — both apply to every current AI offering under consideration at HC/PHAC and should be addressed at the enterprise level rather than the vendor level.

The recommendation is to approve Cohere for unclassified workloads consumed through CANChat, and to decline direct-API or Protected B consumption until three conditions are met: a documented deployment pattern, an HC/PHAC-owned SA&A path, and a PATH runtime integration plan for sustained use at scale.

---

## Layer 1 — Classification

| Field | Value |
|---|---|
| Item type | Product (available via CANChat); potential Offer (direct enterprise engagement under review) |
| AI capability type | Embedded (via CANChat); Standalone (direct-API patterns) |
| Strategic tier | Tier 3 — Productivity (today via CANChat); Tier 1–2 possible if direct enterprise |
| Primary cluster | 6 — Enterprise Service Platforms |
| BCM Level 3 identifier | To be determined — depends on specific use case; multiple L3 IDs likely |
| AI Capability Tags | Text Summarisation, Document Classification, Named Entity Recognition, Semantic Search, Retrieval-Augmented Generation (RAG), Virtual Assistant |

---

## Layer 2 — Mandatory gates

Ten gates, scored as they stand today. Two fail. The remaining eight pass or are not applicable at the classification stage.

| Gate | Status | Basis |
|---|---|---|
| G1  Canadian data residency | Pass | CANChat path is Shared Services Canada (SSC)-hosted. SAP Sovereign Cloud path (announced 10 February 2026) is Canadian-operated. Direct-to-Cohere path is ambiguous — the Cambridge, Ontario data centre is operated by CoreWeave, a United States (US) provider. |
| G2  Classification capability | **Fail** | CANChat is confirmed unclassified only. No Protected B evidence for Cohere-as-service at HC/PHAC. Any Protected B workload needs a different deployment pattern or a classification-scope restriction. |
| G3  SA&A with internal ownership | **Fail** | CANChat Authority to Operate (ATO) is pending. No HC/PHAC-owned SA&A exists for a direct Cohere engagement. This is a systemic gap across current AI offerings. |
| G4  AIA feasibility | Not applicable | No specific administrative decision in scope at the classification stage. Reassess per use case. |
| G5  Privacy Impact Assessment readiness | Not applicable | No personal information in scope at the classification stage. Triggers if personal information enters any workflow. |
| G6  Non-cloud or non-Azure exception | Pass | Azure and SAP Sovereign Cloud paths both avoid the Directive on Service and Digital section 4.3.2.4 trigger. Direct-to-CoreWeave deployment would require a GC Enterprise Architecture Review Board (GC EARB) exception. |
| G7  Consumable through PATH / HAIL runtime | Pass (conditional) | Consumable via CANChat multi-model architecture today. Target state is consumption through the Protected AI Technology Hub (PATH) application gateway. Direct-API consumption bypasses runtime and should be disallowed. |
| G8  Multi-model architecture preserved | Pass | Cohere is one family among several available in CANChat. No architectural lock-in at the platform layer. |
| G9  Identity integration | Pass | Via CANChat, Entra ID integration is handled by SSC. Direct deployment would require configuration. |
| G10  FAIR / data quality preconditions | Not applicable | Dependent on use-case data integration. Assessable at proposal stage, not at vendor stage. |

**Gates outcome:** Disqualified as written, on two systemic Fails. Cleared by either (a) scope restriction to unclassified CANChat consumption, or (b) an enterprise-level remediation plan for internal SA&A ownership.

---

## Layer 3 — Rated dimensions

Each axis scored 0 to 5 against the rubric anchors. Family averages feed the weighted composite.

### Family A — Governance maturity  (weight 30%, average 2.75, Amber)

| Axis | Score | Basis |
|---|---|---|
| Enforcement point | 2 | CANChat provides partial runtime enforcement. HC/PHAC's PATH runtime is not yet operational for Cohere. Direct-API consumption has terms-of-use enforcement only. |
| Transparency and AIA-readiness | 3 | Cohere publishes model cards for the Command family. Algorithmic Impact Assessment (AIA) feasibility is confirmable per use case. The Aya family adds transparency through open weights. |
| Lifecycle management | 3 | Commercial vendor lifecycle is standard — versioning, retraining cadence, and deprecation notices. Drift detection at HC/PHAC level is not yet in place. |
| Human oversight fit | 3 | Oversight is configurable at the application layer. A final-decision-by-person pattern is viable for AIA Level IV workloads. |

### Family B — Architectural fit  (weight 25%, average 2.75, Amber)

| Axis | Score | Basis |
|---|---|---|
| PATH / HAIL alignment | 2 | Consumable via CANChat today. PATH integration is target-state only. Direct-API path bypasses runtime controls. |
| Azure-first coherence | 3 | Cohere is available on Azure Machine Learning. SAP Sovereign Cloud is also Canadian-operated. The Cambridge Ontario + CoreWeave pattern complicates this on the direct path. |
| Data integration (Fabric, Databricks, Unity Catalog) | 2 | No first-class integration with Fabric or Databricks evidenced. Unity Catalog lineage not assessed. |
| RAG and Federated Search distinction | 4 | Embed plus Command are natively RAG-capable. The architectural distinction between RAG (generative synthesis) and Federated Search (retrieval only) is cleanly supported. |

### Family C — Capability coverage  (weight 25%, average 3.25, Amber)

| Axis | Score | Basis |
|---|---|---|
| BCM Level 3 coverage | 3 | Multiple L3 identifiers addressable depending on use case. Not narrowly scoped. |
| AI Capability Tag coverage | 4 | Multi-tag platform. Covers Text Summarisation, Document Classification, Named Entity Recognition, RAG, Semantic Search, and Virtual Assistant. |
| Strategic tier fit | 3 | Broadly applicable across Tiers 1 to 3. Primary fit today is Tier 3 productivity via CANChat. Tier 1 or 2 fit requires use-case specification. |
| Cluster coverage | 3 | Applicable to the primary cluster (Enterprise Service Platforms) with secondary coverage across Surveillance, Regulatory Intake, and Data Management. |

### Family D — Procurement and cost  (weight 20%, average 3.0, Amber)

| Axis | Score | Basis |
|---|---|---|
| Procurement vehicle available | 3 | Available via SSC and CANChat. SAP Sovereign Cloud partnership adds a second procurement path. Direct Cohere vehicle not established at SSC. |
| Lifecycle cost predictability | 2 | Free via CANChat today; a paid model is anticipated but not published. Direct pricing is less transparent. Cost envelope is not yet forecastable. |
| Canadian economic benefit | 4 | Canadian prime. A federal investment of up to $240 million has been announced for Cohere's $725 million data centre in Cambridge, Ontario. Strong Industrial and Technological Benefits footprint. |
| Exit cost and portability | 3 | Standard application programming interface formats. The open-weight Aya family provides a portability option. Exit from the Command family would require re-engineering prompts and agent workflows. |

### Composite

| Measure | Value |
|---|---|
| Composite score (0 to 100) | 58.5 |
| Composite R/A/G (numeric basis) | Amber |
| R/A/G after gate override | **Red — Disqualified as written, pending exception or scope restriction** |

The disqualification rule is intentional. The rubric forces Red whenever any gate fails, regardless of the numeric composite. The gates are enterprise-level constraints, not scored dimensions.

---

## Layer 4 — Positioning profile

The profile is characterised, not scored. This is where Cohere is most instructive.

### Openness — mixed

Cohere cannot be reduced to open or proprietary. The Command family is proprietary and vendor-hosted. The Aya family is open-weight, self-hostable, and permissively licensed. A single openness label would hide this.

| Sub-property | Position |
|---|---|
| Model weights | Closed (Command) / Open (Aya) |
| Training code and data | Partial |
| Inference runtime | Vendor-hosted (Command) / Self-hostable (Aya) |
| Licence type | Proprietary (Command) / Permissive (Aya) |

### Sovereignty — nuanced

Canadian entity control and Canadian-trained weights are strong sovereignty signals. US venture capital ownership and US-operated hosting infrastructure are weakening signals. Sovereignty is not binary — each sub-dimension must be assessed separately.

| Dimension | Position |
|---|---|
| Corporate control | Canadian-controlled entity (strong) |
| Weights origin | Canadian-trained (strong) |
| Hosting | Mixed — Cambridge Ontario data centre operated by CoreWeave, a US cloud provider (weakening) |
| Capital | US venture capital accepted (weakening, not disqualifying) |

### Runtime position — partial

Today, Cohere is consumed through CANChat at the productivity layer. The direct-API path is standalone and bypasses HC/PHAC governance. The target state is consumption through the PATH multi-model gateway with policy enforcement and audit logging.

---

## What the CDO review should confirm or refute

The following items were assessed on the best available public and internal information. The CDO review is expected to resolve each.

1. **Deployment pattern.** Is the direct-enterprise engagement a CANChat extension, a dedicated Azure Canada Central instance, a SAP Sovereign Cloud consumption path, or a Cambridge-Ontario-via-CoreWeave pattern? Each produces a different G1 and G6 answer.
2. **Protected B pathway.** Is there any plan or commitment from Cohere or from SSC to extend CANChat or a Cohere-direct pattern to Protected B? If yes, G2 changes.
3. **SA&A ownership.** What is the HC/PHAC-owned SA&A path for Cohere? Is it planned to be consolidated across all AI offerings (the enterprise approach recommended here) or negotiated per-vendor?
4. **Procurement vehicle.** Does the CDO review anticipate a Cohere-specific procurement vehicle, or is the path through SSC/CANChat sufficient?
5. **Use-case scope.** Which specific use cases are contemplated? Without a use case, AIA and PIA readiness (G4, G5) are not assessable.

---

## Recommendation

**Approve with conditions.**

Approve Cohere for unclassified workloads consumed through CANChat under existing SSC controls. Do not approve for Protected B workloads or for direct-API consumption that bypasses the CANChat or PATH runtime.

Conditions:

1. Any direct-enterprise engagement must document its deployment pattern and confirm Canadian data residency against the specific hosting path chosen.
2. Protected B consideration requires an HC/PHAC-owned SA&A path — recommended as an enterprise-level remediation, not a Cohere-specific one.
3. Sustained consumption at scale requires a PATH runtime integration plan with enforcement at the application gateway.
4. Any AIA or PIA triggered by a specific use case must be completed before production, per the TBS Directive on Automated Decision-Making and the Privacy Act.

The Cohere assessment is architecturally instructive because it shows that "Canadian sovereign AI" is not a single binary property. The rubric structurally separates entity control, weights origin, hosting, and capital — each can move independently. The EA and TPO position is that sovereignty should be discussed in these decomposed terms whenever an offering is assessed, not as a single label.

---

## Appendix — Sources and caveats

**Internal:** CANChat briefing material (March 2026); HC PATH reference material; TBS policy references (DADM, Directive on Service and Digital, Policy on Government Security).

**External (current, as of April 2026):**
- SAP and Cohere partnership announcement, 10 February 2026 — North integrated into SAP Sovereign Cloud, Canada.
- Federal commitment of up to $240 million to Cohere's $725 million Cambridge, Ontario data centre; facility operated by CoreWeave.
- Canadian Sovereign AI Compute Strategy (ISED), supported by Budgets 2024 and 2025.

**Caveat:** This assessment is EA/TPO interpretation against a draft rubric (v0.1). Weights have not been confirmed by Chad or Shahab. The assessment is not citeable GC policy. It should be refreshed after CDO review input lands and after any weight adjustments are accepted.

---

*Unclassified / Non classifié  •  EA/TPO interpretation — draft assessment, not citeable GC policy*
