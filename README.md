# HC/PHAC AI Status Site

**EA intelligence and capability reporting platform** for Health Canada's PATH (Platform for AI governance and Technology Healthcare) and HAIL (Healthcare AI Implementation Layer) enterprise AI programs.

## Purpose

This site provides:
- **Real-time EA intelligence** — Current state of GC AI platforms and HC/PHAC strategic positioning
- **Architecture documentation** — PATH control plane, HAIL runtime, and governance models
- **Decision records and scenarios** — ARB-ready architecture assessments and strategic options
- **Artifact repository** — Conceptual models, diagrams, and reference materials for EA and leadership teams

**Audience:** EA/TPO teams, Architecture Review Board (ARB), Office of Chief Data Officer (OCDO), HC/PHAC leadership.

## Site Structure

### Main Pages

- **[Dashboard](index.html)** — Executive overview, program status, key decisions
- **[Intelligence](intelligence.html)** — Platform landscape analysis, HC/PHAC AI tool assessments
- **[Architecture](path-architecture.html)** — PATH control plane reference architecture
- **[Control Plane](control-plane.html)** — Runtime governance model, enforcement components
- **[Scenarios](scenarios.html)** — Strategic options and decision pathways
- **[Decisions](decisions.html)** — Architecture decisions and rationale
- **[Artifacts](artifacts.html)** — Conceptual diagrams, models, and visual references

## Artifact Ingest Pipeline

Artifacts are ingested via a GitHub Actions workflow:

```
artifacts/inbox/         →  GitHub Action (generate_artifacts.py)  →  artifact detail pages
(drop images/diagrams)       (rename + metadata)                         + index update
```

### Workflow

1. **Add artifact** to `artifacts/inbox/`
2. **GitHub Action triggers:** `generate_artifacts.py`
3. **Metadata generation:** Claude Vision API generates title, summary, and tags
4. **Output:**
   - Detail page created in `artifacts/` with styled HTML
   - Entry added to `data/artifacts-index.json`
   - `artifacts.html` index updated automatically

### Manual Artifact Creation

For detailed workflow and examples, see [ASSESSMENT_AND_1.0_PLAN.md](ASSESSMENT_AND_1.0_PLAN.md#artifact-pipeline).

## Project Status

**Current Version:** 1.4 (draft)  
**Target Version:** 1.0 (production-ready)  
**Last Updated:** April 2026

### Known Issues

- **Mobile responsiveness:** Fixed 1100px width on main pages (responsive breakpoint needed)
- **CSS duplication:** ~4800 lines of duplicated styles across pages (#11)
- **Repository structure:** All HTML, CSS, and generated files in root directory (#9)

See [ASSESSMENT_AND_1.0_PLAN.md](ASSESSMENT_AND_1.0_PLAN.md) for full assessment and release roadmap.

## Development & Contribution

### Local Setup

```bash
# Clone repo
git clone https://github.com/jjuniper-dev/status-site.git
cd status-site

# Serve locally (Python)
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Adding Content

- **Edit pages:** Modify `.html` files directly
- **Update intelligence:** Edit and link in `intelligence.html`
- **Add artifacts:** Drop files in `artifacts/inbox/`, wait for Action to run
- **Styling:** Update `styles.css` (shared design system in progress)

### Pending Tasks

High-priority items before 1.0:
- Consolidate CSS into unified design system (#11)
- Add responsive mobile breakpoints
- Restructure repository for clarity (#9)
- Remove backup/obsolete files (#8)

## Related Documents

- **[ASSESSMENT_AND_1.0_PLAN.md](ASSESSMENT_AND_1.0_PLAN.md)** — Full site assessment, issues, and 4-phase release plan
- **[CONSOLIDATION_STATUS.md](CONSOLIDATION_STATUS.md)** — PATH/HAIL convergence status
- **[CONSOLIDATED_SITE_DESIGN.md](CONSOLIDATED_SITE_DESIGN.md)** — Design system specifications

## License

Internal HC/PHAC use.

---

*For issues, questions, or contributions: see [GitHub Issues](https://github.com/jjuniper-dev/status-site/issues).*
