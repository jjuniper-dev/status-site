# Director Summary — AI Offering Assessment Rubric
## HC / PHAC Enterprise Architecture and Technology Portfolio Office

**Prepared for:** CDO, ARB, Senior Leadership
**Date:** April 2026
**Status:** Project deliverables complete; ready for CDO input and weight confirmation

---

## What Was Built

A four-layer assessment framework and corresponding scoring tools to evaluate AI bids, offers, and products for HC/PHAC. The rubric applies enterprise-level discipline to vendor evaluation by separating mandatory gates (disqualifying constraints) from scored dimensions (capability and alignment measures), and adds a strategic positioning profile that decomposes what "Canadian sovereign AI" actually means.

**Four artifacts delivered:**

1. **Framework diagram** (one-slide PPTX) — visual overview of layer structure, gates, families, axes, and positioning profile. Suitable as ARB briefing slide.

2. **Blank scoring workbook** (Excel) — seven-sheet template (Classifier, Gates, Scoring, Positioning, Summary, Rubric Guide). Reusable for any offering. Includes dropdowns, validation, conditional formatting, and disqualification override logic.

3. **Cohere worked example** (filled Excel) — same workbook populated with draft EA/TPO assessment of Cohere Command + North. Composite score 58.5 (Amber numerically) but Red due to gate failures. Demonstrates how the rubric surfaces systemic constraints vs. vendor-specific gaps.

4. **Gartner-style Magic Quadrant** (interactive React visualization) — positions offerings on Sovereignty (Y-axis) vs Openness (X-axis), with bubble size = composite score and color = R/A/G status. Makes strategic positioning visible and comparable across the landscape.

---

## Why It Matters

**The problem it solves:**

Current AI vendor evaluation at HC/PHAC is fragmented. There is no consistent framework for assessing whether an offering meets enterprise policy (TBS security, AIA, privacy), aligns with architecture constraints (PATH runtime, multi-model, Azure-first), or delivers the capabilities we need across the seven capability clusters. Vendors appear to be assessed ad-hoc, with no documented basis for approval, conditions, or rejection.

**The rubric's structural advantages:**

- **Layered separation:** Mandatory gates first (policy, security, architecture constraints that disqualify on fail), then scored dimensions (capability and strategic fit), then positioning profile (transparency on what sovereignty actually means). This ordering ensures regulatory compliance is never traded off against convenience.

- **Disqualification override:** Any gate failure forces the overall R/A/G to Red, regardless of composite score. Gates are enterprise constraints, not scored dimensions. This prevents a vendor from buying their way out of a policy or security gap with high scores elsewhere.

- **Sovereignty decomposition:** Instead of a single "sovereign yes/no" label, the framework assesses corporate control, weights origin, hosting, and capital ownership independently. Cohere exemplifies why: it's strong on entity control and weights training (Canadian) but weak on hosting partner (CoreWeave, US) and capital (US venture). The nuance would be invisible with a binary label.

- **Reusability:** Same workbook, same gates, same families work for every vendor. Enables direct comparison and surfaces whether gaps are vendor-specific (Cohere's G3 SA&A) or systemic (everyone's Protected B support).

---

## Key Findings

### Finding 1: The systemic G3 gap

Two mandatory gates fail for Cohere: G2 (Protected B classification capability) and G3 (internal SA&A ownership). Neither failure is Cohere-specific. Every current AI offering at HC/PHAC shares them. This is not a vendor problem — it is an enterprise infrastructure problem that should be remediated at the enterprise level (e.g., a central SA&A pool, a Protected B bridge capability, a PATH governance model) rather than negotiated per-vendor.

**Implication:** The rubric frames this correctly. It surfaces the constraint structurally, forcing the conversation to "how do we fix the enterprise model" rather than "how do we make an exception for Cohere."

### Finding 2: Cohere is architecturally interesting but mixed on sovereignty

Cohere scores reasonably on composite dimensions (58.5 / 100, would be Amber on numbers alone) and is well-positioned for the Tier 3 productivity use case via CANChat. However, its "sovereignty" is decomposed and mixed:

| Signal | Position |
|--------|----------|
| Entity control | Canadian (strong) |
| Weights training | Canadian (strong) |
| Hosting partner | CoreWeave (US) — weakens direct deployments |
| Capital | US venture — weakens control signal |

The Gartner quadrant places it at (45, 65) — mid-openness, strong sovereignty, center of the chart. This is defensible and transparent. It is not "Canadian sovereign AI" in any simple sense; it is "Canadian-controlled entity with Canadian-trained weights but non-Canadian hosting and capital partnerships."

**Implication:** The positioning profile forces the enterprise to make an explicit governance call: is that acceptable? For unclassified via CANChat (SSC-hosted), yes. For Protected B direct-to-Cohere (CoreWeave-hosted), no. For Azure or SAP Sovereign Cloud, governance-dependent.

### Finding 3: PATH integration is the architectural lever

Every offering assessed against the rubric will face a similar verdict: acceptable through a governed runtime (CANChat, PATH, SAP Sovereign Cloud) with policy enforcement, but risky as a direct-API standalone deployment. The Cohere case reinforces this. Architectural constraint (G7) is as important as policy or security constraints.

**Implication:** PATH is not just an efficiency play. It is a governance architecture that enables enterprise-level control over AI consumption patterns, regardless of which vendor supplies the model.

---

## Recommendation

**Approve Cohere for unclassified CANChat consumption.** Do not approve for Protected B or direct-API consumption until three conditions are met:

1. **Documented deployment pattern.** For any direct enterprise engagement, confirm whether the path is Azure Canada Central, SAP Sovereign Cloud, or Cambridge Ontario-via-CoreWeave. G1 and G6 (residency and cloud exception) depend on this.

2. **HC/PHAC-owned SA&A pathway.** Clarify whether HC/PHAC will own the SA&A for Cohere or whether this will be negotiated per-vendor forever. Recommend escalating this to the enterprise level (recommend a shared pool or central governance model).

3. **PATH runtime integration plan.** For sustained consumption at scale, establish a timeline for consuming Cohere through the PATH multi-model gateway rather than direct API.

**Broader recommendation:** Use this rubric as the governance model for all future AI vendor assessments. It forces the right conversations: policy and security first, then capability fit, then strategic transparency. The CDO and ARB should jointly confirm the four family weights (currently 30/25/25/20, flagged as draft assumptions) before socializing the framework.

---

## Next Steps

**Immediate (next 2 weeks):**
- CDO to provide input on Cohere deployment patterns, SA&A ownership approach, and any protected B plans.
- Chad and Shahab to confirm or adjust the four family weights (Governance/Architecture/Capability/Procurement).
- Refresh Cohere worked example with confirmed weights and CDO feedback.

**Near-term (next 4 weeks):**
- Produce a briefing note for ARB explaining the rubric structure and the Cohere assessment.
- Test the rubric against one additional offering (e.g., GC Translate or a hypothetical internal offering) to validate reusability.
- Present the framework and first case study to ARB for endorsement.

**Medium-term (next 8 weeks):**
- Use the rubric to assess all current AI offerings under CDO and TPO review.
- Build a landscape map (the Magic Quadrant) showing all offerings positioned on Sovereignty × Openness.
- Feed findings back into PATH architecture roadmap and enterprise AI governance design.

---

## Deliverables Checklist

| Artifact | Status | Location | Audience |
|----------|--------|----------|----------|
| Framework diagram (PPTX) | ✅ Complete | `/outputs` | ARB, leadership |
| Blank scoring workbook (Excel) | ✅ Complete | `/outputs` | Internal use (template) |
| Cohere worked example (Excel) | ✅ Complete | `/outputs` | CDO review, ARB case study |
| Cohere briefing note (Markdown) | ✅ Complete | `/outputs` | CDO, ARB, directors |
| Magic Quadrant visualization (React) | ✅ Complete | `/outputs` + shareable artifact | ARB presentations, stakeholder communication |

---

## Risk Mitigation

**Risk:** Weights (30/25/25/20) are draft assumptions pending Chad/Shahab confirmation. If weights are materially different, all composite scores and R/A/G overrides change.

**Mitigation:** Weights flagged yellow in Summary sheet. Do not socialize any scores outside TPO until weights are confirmed.

**Risk:** The disqualification override rule is strict. Any single gate failure forces Red. This may feel unfair to vendors.

**Mitigation:** Document the disqualification rule explicitly and link it to enterprise policy. It is intentional — gates represent non-negotiable constraints (policy, security, architecture). If a vendor fails a gate, the enterprise must either (a) change the gate criteria (policy/security decision at TBS/ARB level) or (b) grant a documented exception. There is no middle ground.

**Risk:** The Cohere assessment is EA/TPO interpretation against a draft rubric. CDO input may shift conclusions.

**Mitigation:** Cohere worked example is marked "draft, pending CDO input." Refresh it when CDO provides feedback.

---

## Conclusion

The rubric fills a structural gap: it provides a repeatable, layered, transparent framework for evaluating AI offerings against enterprise policy, architecture, and capability requirements. It surfaces systemic constraints (like the G3 SA&A gap) as separate from vendor-specific shortcomings. It makes sovereignty visible, not as a binary label but as four independent sub-dimensions that the enterprise can govern separately.

Cohere is the first test case. The assessment shows the rubric working as designed: identifying mandatory gate failures that are systemic (G2, G3), positioning the offering transparently on sovereignty and openness dimensions, and recommending a path forward that is neither a blank approval nor a categorical reject, but rather a conditional approval with clear governance requirements.

The framework is ready for CDO review and ARB endorsement. Recommend proceeding with weight confirmation and landscape assessment of all current offerings.

---

*Unclassified / Non classifié  •  EA/TPO interpretation — ready for CDO input and ARB governance review*
