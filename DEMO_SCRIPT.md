# AI Governance Platform — Demo Script

**Duration:** 5 minutes  
**Audience:** Executives, Sponsors, Technical Decision-Makers  
**Objective:** Demonstrate governance platform structure, decision-support capability, and strategic positioning

---

## Pre-Demo Setup

1. Open browser and navigate to: `https://your-domain/demo-guide.html`
2. Have all 6 demo pages open in tabs (or bookmarked for quick navigation)
3. Know your audience mix: adjust pacing toward execs vs. technical folks
4. **Time box strictly:** 50 seconds per page. Use a timer if needed.

---

## Demo Flow (5 minutes)

### **Opening (30 seconds)**

> *"We're building an enterprise AI governance platform—a living intelligence surface that helps decision-makers track architecture decisions, identify governance gaps, and compare platform options. This isn't a policy document; it's an operational tool."*

**What You're About to See:**
- The control plane architecture (what we're building)
- The decisions blocking progress (what we're wrestling with)
- How we assess platform options (why we chose what we chose)

**Key Takeaway:** *Governance isn't a checkbox. It's integrated technical + policy infrastructure.*

---

### **Page 1: Control Plane (50 seconds)**

**Navigate to:** `control-plane.html`

**What to Show:**
1. Scroll to hero section. Point out: *"This is PATH—the control plane."*
2. Show the 4-layer architecture:
   - **Policy Layer**: Governance, compliance rules
   - **API Gateway**: Token metering, model classification, execution gating
   - **Runtime Enforcement**: Audit logging, model versioning, promotion gates
   - **Operations**: Telemetry, escalation playbooks

3. Point to GREP-ExP pattern box: *"Real example: our epidemiology use case. Agentic AI with built-in review gates."*

**Key Soundbite:**
> *"Control plane means: defined policy, technical enforcement, no shadow AI. Not just trust—verify and audit."*

**Next:** Decisions page for the blockages.

---

### **Page 2: Critical Decisions (50 seconds)**

**Navigate to:** `decisions.html`

**What to Show:**
1. Left panel: Show filters (Governance, Architecture, Resource; Critical, High; Active, Pending)
2. Point to decision cards:
   - **DEC-001: HAIL Production ATO Gap** → *"We deployed the platform, but haven't asked the CIO for production approval. That's the biggest blocker."*
   - **DEC-002: PATH/HAIL Boundary** → *"Where does the control plane end and the runtime begin? That's unresolved."*
   - **DEC-004: Shadow AI Risk** → *"Hundreds of employees using public ChatGPT, Copilot. Protected B data potentially exposed. No controls."*

3. Click into one decision (e.g., DEC-001) to show impact, next steps, owner.

**Key Soundbite:**
> *"We have clear decisions on the table—now it's about governance ownership and timeline. ATO in Q2, convergence model by June."*

**Next:** Architecture visualization for the big picture.

---

### **Page 3: Architecture & PATH Diagram (50 seconds)**

**Navigate to:** `path-architecture.html`

**What to Show:**
1. Hero section: *"This is the enterprise view—how do policy, execution, and operations fit together?"*
2. Scroll to the diagram layers:
   - **Policy Layer**: Governance, approved use cases, classification bands
   - **Classification Bands**: Unrestricted, approved-internal, restricted (Protected B)
   - **Approved Patterns**: Conversational, agentic, batch-processing
   - **Runtime Enforcement**: Every call is logged, tagged, auditable

3. Point to the KPI cards: Maturity, deployment status, timeline.

**Key Soundbite:**
> *"Architecture means constraints aren't obstacles—they're features. Every policy decision translates to technical gates that prevent bad things without blocking good things."*

**Next:** Decision support—how do we pick platforms?

---

### **Page 4: Platform Assessment Comparison (1 minute)**

**Navigate to:** `assessments-compare.html`

**What to Show:**
1. **Vendor selector:** Show toggle between Anthropic, OpenAI, Gemini, Cohere, GC-LLM
   - *"We're evaluating against 4 dimensions: governance maturity, architecture fit, capability level, procurement viability."*

2. **Comparison Matrix:**
   - Show scores: Governance (out of 5), Architecture (out of 5), Capability (out of 5), Procurement (out of 5)
   - Highlight differences: *"OpenAI is a capability leader but governance posture is weaker than Anthropic. Gemini is a strong enterprise competitor."*

3. **Recommendation bands:**
   - Green = recommended
   - Amber = approved with conditions
   - Red = significant governance gaps

4. (Optional) Show **Radar Chart** if time: Visual comparison of all vendors against all criteria.

**Key Soundbite:**
> *"This isn't about 'which model is smartest.' It's about which vendor + model + deployment fits our governance model. That's why Anthropic scores differently than OpenAI—not capability; governance alignment."*

**Next:** The big picture—intelligence synthesis.

---

### **Page 5: Intelligence & Governance Analysis (50 seconds)**

**Navigate to:** `intelligence.html`

**What to Show:**
1. **Header:** *"This is a living document. We update it as facts change, decisions are made, and new capabilities emerge."*
2. **Sections tour** (rapid):
   - **01-02:** Document context & current landscape (PATH/HAIL status)
   - **03-08:** Operational signals, governance gaps, architecture themes
   - **10-11:** Open questions & decision gates
   - **14:** Update log (shows living nature—updates are timestamped, versioned)

3. Point to a specific section (e.g., 08 · Shadow AI): *"We document the risk, evidence, and what we're doing about it. Not a policy document—an EA interpretation."*

**Key Soundbite:**
> *"This platform evolves as the landscape evolves. New threat? New capability? New policy? We capture it here, and it informs decisions."*

**Next:** Operational readiness—this isn't just intelligence; it's infrastructure.

---

### **Page 6: Operational Readiness & Settings (1 minute)**

**Navigate to:** `settings.html`

**What to Show:**
1. **Encrypted API Key Management:**
   - Point to the key list: *"This is how we manage secrets in a Protected B environment. Encrypted, never logged, PBKDF2 + AES-GCM."*
   - Show the add-key form: *"We can add new provider keys here—OpenAI, Anthropic, etc.—all encrypted."*

2. **MCP Server Configuration:**
   - *"Model Context Protocol—we can integrate new tools, data sources, systems. One example: connect to our data catalog, ask questions about datasets."*
   - Show the add-server form.

3. **Custom Skills:**
   - *"We can extend the platform with custom skills—approval workflows, integration with our systems, automation."*

4. **Data Export/Import:**
   - *"Decisions, scenarios, artifacts—all exportable. You're not locked in."*

**Key Soundbite:**
> *"This is governance infrastructure: technical controls (encryption), extensibility (MCP), and auditability (all actions logged). Not just policy; proven."*

---

## Closing (30 seconds)

> *"What you've seen is a platform that connects decisions → assessments → architecture → governance into one operational view. No separate policy docs, no dashboard silos. One source of truth that executive sponsors and technical teams both use."*

**Key Takeaways:**
1. **Governance is infrastructure.** Control plane, audit logs, runtime gates—not just policy.
2. **Decisions are documented and traced.** We can see what we've decided, why, and what's blocked.
3. **Living intelligence.** The platform evolves as facts change. No stale docs.
4. **Decision support, not replacement.** We still make human decisions; this tool helps us make better ones.

**Next Step:** *"Questions? Let me walk through any specific area—architecture, a decision, or an assessment."*

---

## Q&A Follow-up Talking Points

### *"How is this different from just a shared drive with documents?"*
> Single source of truth, cross-linked (decisions → artifacts → assessments), living updates, audit trail of changes, built-in decision support (comparison workbench, governance scoring).

### *"Who maintains this?"*
> EA team updates intelligence, decision owners update decisions, assessments are updated as platforms evolve. No external team gatekeeping.

### *"Can we customize it for our org?"*
> Yes. Decision fields, assessment criteria, artifact types—all configurable. See Settings page for extensibility (MCP, custom skills).

### *"How does this handle security/compliance?"*
> All data at rest is Protected B capable (Settings shows encryption). No external API calls for governance docs. Works air-gapped if needed.

### *"What's the timeline to production?"*
> See Control Plane + Decisions pages. HAIL production move targeted Q2 2026 pending ATO approval. PATH full deployment Q3 2026.

---

## Timing Reference

| Page | Duration | Focus |
|------|----------|-------|
| Opening | 30 sec | Why this matters |
| Control Plane | 50 sec | What we're building (architecture) |
| Decisions | 50 sec | What's blocking (governance gaps) |
| Architecture | 50 sec | How it fits together (visual synthesis) |
| Assessments | 60 sec | How we decide (decision support) |
| Intelligence | 50 sec | What we know (synthesis/narrative) |
| Settings | 60 sec | How we operate (infrastructure) |
| Closing | 30 sec | Recap + open for Q&A |
| **TOTAL** | **5 min 40 sec** | **Round to 6 min with buffer** |

---

## Demo Variants by Audience

### **Executive/Sponsor Focus (5 min)**
1. Skip detailed settings page; focus on: Control Plane (policy/governance narrative) → Decisions (blockers) → Assessments (decision support)
2. Close with Intelligence (living document concept)
3. **Key message:** Governance as integrated strategy, not checkbox.

### **Technical Team Focus (5 min)**
1. Lead with Architecture → Control Plane (technical design) → Settings (extensibility/integration)
2. Touch Decisions (context for architecture choices)
3. Skip detailed assessments deep-dive.
4. **Key message:** Governance infrastructure, MCP extensibility, audit trail.

### **Mixed Audience (7 min)**
Run the full 6-page flow above. Allocate time based on room energy—if tech questions arise, extend Architecture; if policy questions arise, extend Decisions/Intelligence.

---

## Troubleshooting

**Page doesn't load?**
- Check that data files exist: `data/decisions.json`, `data/scenarios.json`, `data/assessments/index.json`
- Clear browser cache (Ctrl+Shift+Del)
- Check browser console for errors (F12)

**Assessment comparison not showing vendors?**
- Verify `data/assessments/*.json` files are populated
- Check that assessment index is loading (network tab in DevTools)

**Links between pages broken?**
- Verify artifact IDs, decision IDs match across JSON files
- Check console for 404 errors on detail pages

---

## Post-Demo Next Steps

1. **Get feedback:** Which pages resonated? What confused?
2. **Schedule follow-up:** Deeper dive on architecture, specific vendor, or governance model?
3. **Share the link:** `demo-guide.html` serves as self-guided tour if needed.
4. **Iterate:** Add/modify scenarios, decisions, assessments based on stakeholder feedback.

---

**Last Updated:** April 22, 2026  
**Platform Version:** v1.1  
**Demo Author:** EA / CDO Team
