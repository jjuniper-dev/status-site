# Intelligence Page Update Workflow

This document defines how to update the intelligence page (`intelligence.html`) — a living document tracking AI governance architecture, operational signals, and capability assessments for HC/PHAC.

## Overview

**What is the Intelligence Page?**
- Living document for EA team (Enterprise Architecture)
- Audience: EA / TPO / ARB decision-makers
- Purpose: Record interpreted positions on AI platform landscape, governance gaps, and architectural implications
- Format: Numbered sections (01-14), operational signals, governance milestones, update log
- Authority: Working intelligence (not policy), evidence-based, explicitly acknowledges uncertainty

**Key Sections:**
- 01-02: Document context & capability landscape
- 03-10: Operational signals, architecture, themes, concerns
- 11-12: Open questions & governance milestones
- 13: Emerging capabilities (local inference, etc.)
- 14: Document update log

## Update Workflow (Complete)

### Step 1: Identify Update Topic
Determine if change is:
- **Operational signal** — new capability deployed, status changed (e.g., PATH progress, shadow AI exposure)
- **Governance gap** — risk identified, control baseline needed
- **Architectural theme** — pattern emerged, implications identified
- **Capability assessment** — new tool/approach evaluated (e.g., local LLM)

### Step 2: Open Intelligence Editor (Browser)
1. Navigate to: `https://jjuniper-dev.github.io/status-site/intelligence.html`
2. Click **"Edit"** button (bottom-right, pencil icon)
3. Editor panel opens on right side

### Step 3: Draft Content in Markdown
**Required format:**
- Markdown syntax (headers, lists, bold, tables)
- Follow intelligence page tone: evidence-based, precise, acknowledges uncertainty
- Reference related sections (e.g., "See 04b · HAIL/PATH Convergence")
- Include: What changed, Why it matters, Implications, Risks/Trade-offs, Next steps

**Example section structure:**
```markdown
## Section X · [Topic]: [Subtitle]

**Operational Signal:** [Context of what changed/is new]

**What Changed:**
- Specific facts/dates
- Quantified data where possible
- Reference source if applicable

**Why It Matters:**
- Architecture/governance impact
- Strategic implications
- Decision relevance

**Technical/Policy Details:**
[Detailed explanation]

**Risk Factors / Trade-offs:**
- [Risk 1]
- [Trade-off 1]

**Next Steps / Recommendations:**
- [Action 1]
- [Related signals: See 04b, 08, etc.]
```

### Step 4: Live Preview
- Right pane shows live Markdown preview
- Verify formatting: headers, lists, code blocks render correctly
- Check for typos and clarity

### Step 5: Analyze Draft with Local LLM (Optional but Recommended)
1. Click **"Review with AI"** button
2. Local models load (first time: ~300MB download, ~2 min; cached thereafter)
3. AI analyzes:
   - Is content relevant to intelligence page?
   - What sections does it inform?
   - Key insights to highlight
   - How to incorporate
   - Any concerns or gaps
4. Review feedback in **AI Review Panel**
5. Modify draft if needed, re-review

**Why local LLM?**
- Zero external API calls (no Anthropic/Hugging Face data transmission)
- PIPEDA/Protected B compliant
- No API key needed
- Offline-capable after initial model cache

### Step 6: Publish to Draft Branch
1. Click **"Publish"** button
2. Enter GitHub Personal Access Token (one-time in browser localStorage)
3. Editor commits to `intelligence-draft` branch
4. Automatic PR created on GitHub
5. Review PR, request human review, merge to main

### Step 7: Update Date & Log Entry
When publishing:
- Update date badge on page (YYYY-MM-DD)
- Update version (vX.Y format)
- Add entry to Section 14 (Update Log) with:
  - Date
  - Version
  - Summary of changes

**Example log entry:**
```
**2026-04-21 (Consolidated Intelligence v1.3):**
Added Section 13: Local Inference Capability. Deployed browser-based LLM analysis 
using Transformers.js. Zero external API calls, Protected B compliant. 
Recommendation: formal compliance validation.
```

---

## Agent Instructions for Intelligence Updates

**Use this workflow when tasked with:**
- Creating intelligence post about new capability
- Documenting governance gap
- Adding operational signal
- Updating intelligence page content

### Pre-Update Checklist
- [ ] Understand the update topic (operational signal, gap, capability, etc.)
- [ ] Identify which section(s) it belongs in or if it needs a new section
- [ ] Gather relevant facts/data (dates, user counts, governance references)
- [ ] Plan section structure (What Changed → Why It Matters → Implications → Next Steps)

### Implementation Steps

**Option A: User Provides Content (You Integrate)**
1. User provides intelligence text or asks to create post
2. You draft content in intelligence page style (evidence-based, governance-focused)
3. Open editor, paste/compose content in Markdown
4. Click "Review with AI" → analyze with local LLM
5. Refine based on feedback
6. Click "Publish" → commits to draft branch
7. Create PR, merge when ready

**Option B: User Imports Document (You Guide Analysis)**
1. User has governance doc, architecture doc, or capability assessment
2. Guide them to use editor's "Import File" feature
3. Supported formats: .txt, .md, .jpg, .png, .gif
4. Editor's local LLM analyzes imported content for relevance
5. You help user decide: Append to draft? Replace? Extract insights?
6. Integrate into intelligence post
7. Publish

**Option C: Scheduled Updates (Weekly/Monthly)**
1. If user wants recurring intelligence updates:
   - Set up `/loop` command to remind on cadence (e.g., `/loop 7d Check intelligence page updates`)
   - Or use Agent hook in settings.json for automated checks
2. Review current intelligence page for gaps
3. Identify updates needed (new signals, governance changes, capability shifts)
4. Draft new section or update existing
5. Publish via editor

### Quality Standards

**Content Should:**
- ✅ Be evidence-based (cite facts, not opinions)
- ✅ Acknowledge uncertainty explicitly ("estimated," "pending verification")
- ✅ Connect to existing sections (related signals, dependencies)
- ✅ Include governance/architectural implications (why EA/ARB cares)
- ✅ Suggest next steps or decision points
- ✅ Use standard section numbering (01, 02, 03b, etc.)
- ✅ Follow page tone: precise, no jargon without explanation

**Content Should Avoid:**
- ❌ Unsourced claims or pure opinion
- ❌ Overstating capabilities (e.g., "HAIL is production-ready" when only runtime deployed)
- ❌ Shadow AI without quantification (estimate users/data handled if possible)
- ❌ Recommendations without risk assessment
- ❌ Breaking existing formatting or structure

### Post-Publish Checklist
- [ ] PR created and merged to main
- [ ] Date badge updated
- [ ] Version bumped (v1.X)
- [ ] Log entry added with summary
- [ ] Section number/title consistent with document structure
- [ ] Related sections cross-referenced
- [ ] Live URL reflects changes: https://jjuniper-dev.github.io/status-site/intelligence.html

---

## Common Scenarios

### Scenario 1: New Capability Deployed
**Example:** Local LLM inference via Transformers.js

**Steps:**
1. Identify: "Operational signal — new tool deployed, privacy-compliant"
2. Draft section with:
   - What it is (architecture)
   - Why it matters (compliance, privacy, reduces API dependencies)
   - How it works (browser-based, local inference)
   - Trade-offs (first use slow, browser memory, slower than cloud)
   - Implications (enables Protected B analysis, local-first workflows)
   - Next steps (compliance validation, expand model coverage)
3. Use local LLM to validate: "Is this relevant? What sections does it inform?"
4. Publish as new section (13) or append to related section (04, 06, 08)
5. Update log entry

### Scenario 2: Governance Gap Identified
**Example:** HAIL deployed but ATO path not initiated

**Steps:**
1. Identify: "Architectural concern — deployment ≠ production readiness"
2. Draft section with:
   - The gap (no ATO path, no clear timeline)
   - Current state (HAIL operational as runtime only)
   - Risk (FY26-27 delivery stalled if ATO delayed)
   - Recommended action (initiate ATO workstream, establish timeline)
   - Decision required (ARB approval)
3. Use local LLM: "Does this governance gap need escalation? What's the compliance risk?"
4. Publish as new section or add to Section 10 (Open Questions)
5. Flag if escalation needed (ARB/CIO decision point)

### Scenario 3: Update Existing Section
**Example:** Quantify shadow AI (CANChat users, Copilot scope)

**Steps:**
1. Identify target section (e.g., Section 08 · Shadow AI)
2. Open editor, navigate to section
3. Draft updated content with:
   - New data (estimated user counts, data handling uncertainty)
   - Revised risk assessment
   - Updated mitigation paths
4. Use local LLM: "Has this risk assessment changed? What's the new implication?"
5. Publish (full replace or append, depending on changes)
6. Update log entry: "Updated Section X with quantified exposure data"

### Scenario 4: Import External Document
**Example:** New HC/PHAC AI governance policy published

**Steps:**
1. User has PDF/Word doc with policy
2. Guide: Export as .txt or take screenshot (.png)
3. Use editor's "Import File" button
4. Local LLM analyzes: "Is this relevant? What sections does it affect?"
5. User approves incorporation
6. Draft section: "New governance policy — implications for PATH/HAIL/control baseline"
7. Publish
8. Log: "Incorporated [policy name] findings into Section X"

---

## Editor Features

### File Import (Native Browser APIs)
- **Supported:** .txt, .md, .jpg, .jpeg, .png, .gif
- **No external dependencies:** Uses browser FileReader API
- **Workflow:** Import → Analyze → Append/Replace/Extract
- **Local LLM assessment:** "Is this content valuable? How should it be incorporated?"

### Local LLM Analysis
- **Model:** DistilBERT (relevance) + DistilBART (insights)
- **Privacy:** Zero external API calls, all inference in-browser
- **First use:** ~300MB model download (~2-5 min)
- **Cached:** Instant subsequent analyses
- **Offline:** Works offline after model cache

### Draft Persistence
- Saves to browser localStorage automatically
- Survives page reload/browser restart
- Can export draft, clear draft, or resume existing

### GitHub Publishing
- Commits to `intelligence-draft` branch
- Creates PR for review before merging to main
- Requires GitHub personal access token (stored in browser only)
- Automatic commit message with timestamp

---

## Tips for Agents

1. **Tone matters:** Intelligence page is for decision-makers. Be precise, evidence-based, acknowledge uncertainty.
2. **Cross-reference:** Link new content to related sections (e.g., "See 04b · HAIL/PATH Convergence").
3. **Quantify when possible:** Instead of "many users," say "estimated 200+ users."
4. **Separate signals:** Don't conflate "operational signal" (what is) with "risk" (what could go wrong).
5. **Use local LLM:** Always analyze draft with AI before publishing. It catches gaps and forces clarity.
6. **Version semantics:** 
   - v1.0 = initial
   - v1.1 = minor updates (clarifications, added signals)
   - v1.2 = substantial additions (new sections, governance model)
   - v2.0 = major restructure
7. **Date badge:** Always update when content changes (YYYY-MM-DD).
8. **Log every update:** Future readers need to know what changed and when.

---

## Troubleshooting

**Q: Can't open editor (Edit button missing)**
- Ensure JavaScript enabled and page fully loaded
- Check browser console for errors
- Clear browser cache, reload

**Q: Local LLM analysis is slow / times out**
- First run requires model download (~300MB, 2-5 min)
- Subsequent analyses should be fast (cached)
- If stuck, close editor, reload page, try again

**Q: Can't publish (GitHub token error)**
- Ensure token is valid (GitHub Settings > Personal Access Tokens)
- Token needs `repo` scope (read/write to repositories)
- Clear browser localStorage if token corrupted, re-enter

**Q: Merge conflict on PR**
- If main diverged from feature branch, pull main first
- Use `git merge origin/main` to resolve
- Or: Rebase feature branch on main

**Q: Content not appearing on live site**
- Ensure PR merged to `main` branch
- GitHub Pages rebuild takes ~1-2 min
- Check: https://jjuniper-dev.github.io/status-site/intelligence.html

---

## References

- **Editor code:** `js/intelligence-editor.js` (markdown editor UI)
- **Local LLM:** `js/local-llm-analyzer.js` (Transformers.js inference)
- **Page content:** `intelligence.html` (sections 01-14)
- **Styling:** `css/editor.css` (editor panel styles)
- **Markdown processor:** `js/markdown-processor.js` (preview rendering)

---

## Example: Creating Intelligence Post (Full Walkthrough)

**Task:** Document new local LLM capability

1. **Plan:**
   - Topic: Browser-based LLM inference, privacy-first analysis
   - Section: New (13) or existing (08, 09)?
   - Content: What changed, why it matters, trade-offs, implications

2. **Draft (in editor):**
   ```markdown
   ## Section 13 · Local Inference Capability: Privacy-First Intelligence Analysis
   
   **Operational Signal:** New intelligence analysis capability deployed April 2026. 
   Supports privacy-compliant document analysis without external API dependencies.
   
   **What Changed:**
   Browser-based LLM analysis using Transformers.js (Hugging Face).
   - Imported documents analyzed locally (zero external calls)
   - Models: DistilBERT (relevance), DistilBART (insights)
   - First run: ~300MB model download; cached thereafter
   
   **Why It Matters:**
   - Removes barrier for Protected B / sensitive governance analysis
   - Enables privacy-compliant document review without vendor vetting
   - Reduces API key management, supports air-gapped environments
   
   **Trade-offs:**
   | Benefit | Trade-off |
   |---------|-----------|
   | Zero external API calls | First use requires model download (~2-5 min) |
   | Fully offline-capable | Inference slower than cloud API |
   | PIPEDA/Protected B compliant | Browser memory usage (~500MB-1GB) |
   
   **Next Steps:**
   - Formal compliance approval for Protected B workflows
   - Evaluate larger models (Llama, Mistral) if compute available
   
   **Related:** See 04b (convergence), 08 (shadow AI reduction)
   ```

3. **Analyze:**
   - Click "Review with AI"
   - Local LLM: "This is relevant to intelligence page. Informs sections 04b, 06, 08. 
     Key insights: privacy-first alternative to cloud LLM, reduces shadow AI risk."
   - Refine if needed

4. **Publish:**
   - Click "Publish"
   - Enter GitHub token
   - PR created: `jjuniper-dev/status-site#36`
   - Merge when reviewed

5. **Update:**
   - Date badge: `2026-04-21`
   - Version: `v1.3`
   - Log entry: "Added Section 13: Local Inference Capability..."

---

**Last Updated:** 2026-04-21  
**Document Version:** 1.0  
**Audience:** Claude agents, EA team  
**Status:** Operational
