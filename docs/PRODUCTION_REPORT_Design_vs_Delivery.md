# Production Report — AI Offering Assessment Rubric
## Design Proposal → Delivered Artifacts

**Proposal document:** April 2026 (preceding document)  
**Delivery date:** April 2026  
**Status:** Complete — ready for CDO input and ARB review

---

## Design Decisions — Confirmed and Built As Proposed

| Decision | Proposed | Delivered | Status |
|----------|----------|-----------|--------|
| **Audience** | Dual-use (EA/TPO + CDO), configurable weights | Framework supports both; Summary sheet has editable weights flagged yellow | ✅ |
| **Scoring granularity** | 0–5 internally, R/A/G roll-up for ARB | Scoring sheet scores 0–5; Summary computes R/A/G; conditional formatting on both | ✅ |
| **Weight authority** | Draft (30/25/25/20), flagged for Chad/Shahab confirmation | Weights on Summary sheet use yellow fill (BG_ASSUMP) to signal draft assumption | ✅ |
| **Procurement specificity** | Name specific GC instruments | Gates reference Policy on Service and Digital, DADM, ADR-002/ADR-003, named by title | ✅ |
| **Output artifact** | One-page framework diagram + Excel workbook + Cohere worked example | All three delivered; added Magic Quadrant visualization as bonus | ✅ + 🎁 |
| **Cohere case** | Full illustrative score after proposal approval, example case before CDO input | Worked example complete; marked as draft, pending CDO input | ✅ |
| **Capability framework version** | Anchor v2.3, v2.4 compatibility hooks | v2.3 referenced throughout; v2.4 compatibility noted in briefing note | ✅ |
| **Separation of concerns** | One rubric, variant gates per bid/offer/product | Classifier sheet routes all three types; gates sheet is universal; gates 1–10 apply as routed | ✅ |

---

## Artifact Inventory

### 1. Framework Diagram (PPTX)
**File:** `AI_Offering_Assessment_Rubric_Framework_v0_1.pptx`  
**Size:** 117 KB  
**Content:**
- Single 16:9 slide showing all four layers in visual hierarchy
- Layer 1: Three triage pills (Item type / AI capability type / Strategic tier)
- Layer 2: 10 gates (6 policy [TEAL_200], 4 architectural [PANEL]) with icons
- Layer 3: Four family cards with name, weight, pillar, and four axes each
- Layer 4: Three positioning axes with left-right poles (grey, not scored)
- Footer: Classification, EA/TPO interpretation, not citeable GC policy
- Palette: HC/PHAC navy/teal, WCAG-AA accessible
- QA: Two render-and-fix cycles; all content fits one page; no overflow

**Use:** ARB briefing, stakeholder deck, standalone artifact

---

### 2. Scoring Workbook (XLSX)
**File:** `AI_Offering_Assessment_Rubric_Workbook_v0_1.xlsx`  
**Size:** 26 KB  
**Sheets:** 7

#### Sheet 1: Cover
- Purpose statement, how-to sequence (6 steps)
- Colour legend (Data entry / Key assumption / Computed / Reference)
- Sheet directory

#### Sheet 2: Classifier (Layer 1)
- Offering identity block (name, vendor, source, date, reviewer, ARB submission date)
- Classification block with dropdowns (Item type / AI capability type / Strategic tier / Cluster / BCM L3 / AI Capability Tags)
- Reference text for each field

#### Sheet 3: Gates (Layer 2)
- 10 rows (G1–G10)
- Columns: Gate ID, Gate label, Source/Instrument, Pass/Fail/N/A/Exception dropdown, Evidence text, Notes
- Conditional formatting: Pass = green, Fail = red, N/A = yellow, Exception = orange
- Summary row: "Gates outcome" auto-calculates to "Cleared", "Incomplete", or "DISQUALIFIED — exception required"
- Disqualification override enforced: any Fail forces "DISQUALIFIED"

#### Sheet 4: Scoring (Layer 3)
- 16 data entry rows (4 families × 4 axes each)
- Columns per axis: Family / Axis name / Anchor 0 (fail) / Anchor 3 (meets) / Anchor 5 (leading) / Score (0–5) / Notes
- Data validation: Score must be integer 0–5
- Family subtotal rows compute average per family (blank until scores entered)
- Reference section at bottom shows family cell positions for Summary sheet linkage

#### Sheet 5: Positioning (Layer 4)
- Three sections: Openness (4 sub-properties), Sovereignty (3 dimensions), Runtime position (2 dimensions)
- Input cells for assessed position and narrative
- Read-only reference poles on each dimension

#### Sheet 6: Summary
- Offering identity pull (formulas from Classifier, display blank if source empty)
- Gates outcome pull with policy/arch fail counts
- Layer 3 weights table (editable, yellow flag) with family breakdown
  - Weight sum check (must equal 100%, conditional red fill if not)
  - Family score (pulled from Scoring, displayed blank if empty)
  - Weighted contribution formula (score × weight / 5 × 100)
  - R/A/G per family (Green ≥3.5, Amber 2.5–3.4, Red <2.5)
- Composite score (0–100, blank until any family scored)
- Composite R/A/G (Green ≥70, Amber 50–69, Red <50, but overridden to Red if Gates disqualified)
- Positioning profile pull (Openness, Sovereignty, Runtime from Positioning sheet)
- Recommendation section (dropdown decision + rationale text box)

#### Sheet 7: Rubric Guide (Reference)
- Gate references table: Gate ID / Source / What it triggers / Owner / Notes (all 10 gates)
- Score level anchors: 0 (Fail), 1 (Marginal), 3 (Meets), 5 (Leading) with defensibility and evidence descriptions
- R/A/G thresholds table with interpretation and ARB disposition hints
- Disqualification rule explained in full text

**Features:**
- Print-fit: Landscape, fit-to-width on all sheets
- Dropdowns: Item type, AI capability type, Strategic tier, Cluster, Pass/Fail/N/A/Exception, Decision
- Conditional formatting: Pass/Fail/N/A/Exception colour coding; R/A/G status fills
- Formulas: 31 total, zero errors on recalc
- Smart blanks: Displays blank when source empty (not placeholder zeros)
- Disqualification logic: Any gate Fail forces composite R/A/G to Red regardless of score

**Use:** Template for any offering assessment; reusable across vendors

---

### 3. Cohere Worked Example (XLSX)
**File:** `AI_Offering_Assessment_Rubric_Workbook_v0_1_COHERE_WORKED_EXAMPLE.xlsx`  
**Size:** 29 KB  
**Content:** Same structure as blank workbook, populated with draft EA/TPO assessment of Cohere Command + North

**Classifier entries:**
- Offering: Cohere (Command family + North) via CANChat today; direct enterprise under CDO review
- Item type: Product
- Capability type: Embedded
- Tier: Tier 3 (Productivity)
- Cluster: 6 (Enterprise Service Platforms)
- BCM L3: TBD (use-case dependent)
- AI Tags: Text Summarisation, Document Classification, NER, Semantic Search, RAG, Virtual Assistant

**Gates:**
- G1 (Residency): Pass — SSC and SAP Sovereign Cloud paths confirmed Canadian-operated; direct path ambiguous
- G2 (Classification): **Fail** — UC confirmed, Protected B not evidenced
- G3 (SA&A): **Fail** — CANChat ATO pending; no direct HC/PHAC SA&A path
- G4 (AIA): N/A — use-case dependent
- G5 (PIA): N/A — no PI in scope at classification stage
- G6 (Cloud exception): Pass — Azure and SAP paths avoid s.4.3.2.4 trigger
- G7 (Runtime): Pass (conditional) — consumable via CANChat multi-model; PATH target-state
- G8 (Multi-model): Pass — no lock-in risk
- G9 (Identity): Pass — SSC-integrated for CANChat; configurable for direct
- G10 (FAIR): N/A — use-case data integration dependent

**Scoring (example values, all flagged as draft):**
- Family A (Governance): 2.75 avg — G2 enforcement point (2), transparency (3), lifecycle (3), oversight (3)
- Family B (Architecture): 2.75 avg — PATH alignment (2), Azure coherence (3), Fabric integration (2), RAG/Federated distinction (4)
- Family C (Capability): 3.25 avg — BCM coverage (3), AI tags (4), tier fit (3), cluster coverage (3)
- Family D (Procurement): 3.0 avg — vehicle (3), cost predictability (2), Canadian benefit (4), exit cost (3)

**Composite:** 58.5 (Amber on numeric basis alone)  
**R/A/G override:** Red (due to 2 gate Fails)  
**Recommendation:** Approve with conditions
- Approve for unclassified CANChat consumption
- Decline Protected B and direct-API until deployment pattern documented, HC/PHAC-owned SA&A path established, PATH integration planned

**Positioning:** 
- Openness: Mixed (Command proprietary, Aya open; vendor-hosted by default)
- Sovereignty: Nuanced (strong on entity/weights; weak on hosting partner CoreWeave + US capital)
- Runtime: Consumable through CANChat; target state PATH multi-model

**Use:** First illustrative case; demonstrates rubric in operation; marked as draft pending CDO input

---

### 4. Cohere Briefing Note (Markdown)
**File:** `Cohere_Assessment_Briefing_Note_v0_1.md`  
**Size:** 14 KB  
**Content:** Director-ready narrative assessment of Cohere

**Structure:**
- Executive summary (composite 58.5, two gate Fails, Red overall, conditions-based approval)
- Layer 1 classification (product/offer dual route, embedded, Tier 3, cluster 6)
- Layer 2 gates table (binary outcomes with basis)
- Layer 3 rated dimensions (four families with scores and bases)
- Layer 4 positioning (openness/sovereignty/runtime characterisation)
- Items for CDO review to confirm or refute (deployment pattern, Protected B pathway, SA&A ownership, procurement vehicle, use-case scope)
- Recommendation (approve with conditions + three specific conditions)
- Appendix (sources, caveats, refresh trigger)

**Audience:** CDO, ARB, senior leadership  
**Tone:** Plain prose, no AI tells, acronyms defined, similar requirements flagged  
**Policy alignment:** Caveated as EA/TPO interpretation, not citeable GC policy

**Use:** Standalone brief; pairs with worked example; shareable pre-CDO-input baseline

---

### 5. Magic Quadrant Visualization (React)
**File:** `AIOfferingQuadrant.jsx`  
**Type:** Interactive shareable artifact (runs in Claude's interface)  
**Content:**

**Axes:**
- X-axis (Openness): Proprietary weights + vendor-hosted → Open weights + open code + self-hostable
- Y-axis (Sovereignty): Foreign-controlled entity/weights/hosting → Canadian-controlled across all three

**Quadrants:**
- Leaders (top-left): Proprietary but sovereign
- Visionaries (top-right): Open and sovereign (aspirational)
- Niche (bottom-left): Proprietary, foreign
- Laggards (bottom-right): Open but foreign-controlled

**Offerings plotted:**
1. **Cohere** (45, 65) — Red bubble, size 35, highlighted
   - Position: Mixed openness (Command proprietary, Aya open) + strong sovereignty (Canadian entity, Canadian-trained weights)
   - Score: 58.5
   - Status: Red (gated by G2/G3, despite Amber numeric basis)
   - Annotation on hover: "Primary case study / Gated by Protected B & SA&A / Approve w/ conditions"

2. GC Translate (25, 40) — Amber, proprietary, US-controlled
3. Open Source AI (85, 90) — Green, fully open, fully Canadian (hypothetical)
4. Closed US Model (15, 15) — Red, proprietary, fully US (hypothetical)
5. Hybrid SaaS (35, 55) — Amber, proprietary, mixed sovereignty (hypothetical)

**Interactive:**
- Hover on any bubble to see name + score + status
- Hover on Cohere (red) to see detailed annotation
- Legend explains R/A/G colours, axis definitions, and disqualification override

**Use:** ARB presentations, stakeholder communication, director briefings

---

### 6. Director Summary (Markdown)
**File:** `DIRECTOR_SUMMARY_AI_Assessment_Rubric.md`  
**Size:** 8 KB  
**Content:** Executive brief for CDO, ARB, senior leadership

**Sections:**
- What was built (the five artifacts)
- Why it matters (fills governance gap, enables comparability)
- Key findings (systemic G3 gap, Cohere sovereignty decomposition, PATH as architectural lever)
- Recommendation (approve Cohere with conditions)
- Next steps (CDO input, weight confirmation, ARB presentation, landscape assessment)
- Deliverables checklist (all items, status, location)
- Risk mitigation (draft weights, strict disqualification rule, draft assessment status)
- Conclusion (framework ready for CDO review and ARB endorsement)

**Audience:** Director-level decision makers  
**Length:** One-pager (can be printed or shared as-is)

---

## Design Proposal Alignment — Detailed

### Layer 1: Classifier ✅
**Proposed:** Three triage questions (item type, AI capability type, strategic tier)  
**Delivered:** Classifier sheet with all three as dropdowns; reference text for each; clean routing to gates/weights
**Variance:** None. Exactly as proposed.

### Layer 2: Mandatory Gates ✅
**Proposed:** 10 gates (6 policy, 4 architectural) with specific TBS/HC instruments  
**Delivered:** 
- All 10 gates present, labelled G1–G10
- Policy gates: G1–G6 (all TBS instruments named: Policy on Service and Digital, Policy on Government Security, DADM, Privacy Act, PIA Directive, Directive on Service and Digital s.4.3.2.4)
- Architectural gates: G7–G10 (source: ADR-002, ADR-003, ADR-002, EA Principles)
- Dropdowns: Pass / Fail / N/A / Exception
- Gates outcome: Auto-formula "Cleared", "Incomplete", or "DISQUALIFIED — exception required"
- Disqualification rule: Any Fail forces Red, documented in Rubric Guide

**Variance:** None. Gates naming, sourcing, and disqualification logic exactly as proposed.

### Layer 3: Rated Dimensions ✅
**Proposed:** Four families (30/25/25/20), 4 axes each (16 axes total)  
**Delivered:**
- Family A (Governance maturity, 30%): 4 axes (enforcement point, transparency/AIA-readiness, lifecycle management, human oversight fit)
- Family B (Architectural fit, 25%): 4 axes (PATH/HAIL alignment, Azure-first coherence, data integration Fabric/DBX, RAG/Federated Search distinction)
- Family C (Capability coverage, 25%): 4 axes (BCM L3 coverage, AI Capability Tag coverage, strategic tier fit, cluster coverage)
- Family D (Procurement and cost, 20%): 4 axes (procurement vehicle available, lifecycle cost predictability, Canadian economic benefit, exit cost/portability)
- Scoring: 0–5 per axis, anchors provided (0=Fail, 1=Marginal, 3=Meets, 5=Leading)
- Composite: Family averages weighted and summed to 100-point scale
- R/A/G: Green ≥70, Amber 50–69, Red <50 (overridden to Red if gates fail)

**Variance:** None. Weights, family structure, and axes exactly as proposed.

### Layer 4: Positioning Profile ✅
**Proposed:** Three strategic axes (Openness, Sovereignty, Runtime position) with decomposed sub-properties  
**Delivered:**
- Openness: Four sub-properties (model weights / training code & data / inference runtime / licence type) with poles documented
- Sovereignty: Explicitly decomposed into corporate control, weights origin, hosting, capital — each assessed independently
- Runtime position: Standalone/direct API ↔ Consumed through PATH/HAIL
- Output: Narrative characterisation, not scored
- Magic Quadrant visualization: X-axis (Openness) vs Y-axis (Sovereignty), with bubble size = composite score, bubble colour = R/A/G

**Variance:** Enhanced. Added Magic Quadrant visualization as bonus artifact (not in original proposal but strongly aligned with spirit of "positioning profile").

---

## Decisions Confirmed by Delivery

| Proposal Item | Decision | Confirmed By |
|---------------|----------|--------------|
| Weight authority | Draft 30/25/25/20, flagged for Chad/Shahab | Yellow fill on Summary weights; briefing note flags as assumption |
| Procurement specificity | Name specific instruments | All gates reference Policy/DADM/ADR/Directive by title; Cluster Dictionary footnotes added |
| Output artifact | Framework diagram + workbook + Cohere example | All three delivered + Magic Quadrant bonus |
| Capability framework | Anchor v2.3 with v2.4 hooks | v2.3 referenced; v2.4 compatibility noted in briefing |
| Separation of concerns | One rubric, variant gates per item type | Classifier routes bid/offer/product; gates universal but conditional |
| Cohere case | Full illustrative score, marked draft | Worked example complete, marked "pending CDO input" in Cover sheet |

---

## Status and Handoff

**Project status:** ✅ **COMPLETE** — Ready for CDO input and ARB review

**What's ready for immediate use:**
- Framework diagram (shareable, self-explanatory)
- Blank scoring workbook (template, reusable for any vendor)
- Magic Quadrant visualization (interactive, stakeholder-friendly)
- Director summary (one-pager for leadership)

**What's pending CDO input:**
- Cohere worked example scores and recommendation (current example is draft EA/TPO interpretation)
- Weight confirmation (30/25/25/20 currently flagged yellow/draft)
- Deployment pattern clarification (CANChat vs. direct vs. SAP Sovereign vs. CoreWeave-Cambridge)
- SA&A ownership approach (enterprise-level remediation vs. per-vendor negotiation)
- Protected B support pathway (if any, when)

**Next recommended steps:**
1. **Week 1:** Share framework diagram and director summary with CDO. Request input on five items above.
2. **Week 2:** Chad/Shahab confirm weights or propose adjustment.
3. **Week 3:** Refresh Cohere worked example with confirmed weights and CDO input.
4. **Week 4:** Present framework + Cohere case to ARB for endorsement.
5. **Weeks 5–8:** Assess all current AI offerings using blank workbook. Build landscape map (Magic Quadrant) with all offerings positioned.

**Deliverables for handoff:**
- ✅ `AI_Offering_Assessment_Rubric_Framework_v0_1.pptx`
- ✅ `AI_Offering_Assessment_Rubric_Workbook_v0_1.xlsx` (blank template)
- ✅ `AI_Offering_Assessment_Rubric_Workbook_v0_1_COHERE_WORKED_EXAMPLE.xlsx` (draft case)
- ✅ `Cohere_Assessment_Briefing_Note_v0_1.md`
- ✅ `AIOfferingQuadrant.jsx` (shareable React component)
- ✅ `DIRECTOR_SUMMARY_AI_Assessment_Rubric.md`

**All files in:** `/mnt/user-data/outputs/`

---

## Conclusion

The four-layer rubric design proposed in the initial brief has been fully implemented as a reusable framework and corresponding scoring tools. All design decisions were confirmed and built without variance. The framework is now ready for governance-level review, CDO input, and ARB endorsement.

The Cohere case study demonstrates the rubric working as intended: it surfaces the systemic G3 gap (internal SA&A ownership) as a constraint that applies to every current AI offering, not just Cohere; it decomposes sovereignty into four independent sub-dimensions making nuanced governance visible; and it produces a defensible recommendation (approve with conditions) grounded in policy, architecture, and strategic positioning.

---

*Unclassified / Non classifié  •  EA/TPO interpretation — draft framework, ready for CDO input and ARB governance review*
