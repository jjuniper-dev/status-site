# AI Project Dashboard

GitHub Pages site for tracking enterprise architecture, governance, scenarios, decisions, and artifacts in a reusable dashboard format.

## What this repo is

This repository is a working dashboard and reference site for:
- architecture and governance analysis
- status tracking across major initiatives
- decision logging and scenario framing
- artifact indexing and supporting visuals
- PPTX and settings utilities used alongside the site

It is structured as a reusable status and intelligence surface for architecture, planning, and reporting workflows.

## Current site structure

Main pages currently linked from the site navigation:
- `index.html` — Dashboard
- `decisions.html` — Decision log
- `scenarios.html` — Scenario navigator
- `intelligence.html` — Intelligence and analysis
- `artifacts.html` — Artifact library
- `path-architecture.html` — Architecture view
- `control-plane.html` — Control-plane view
- `pptx-builder.html` — PPTX utility
- `settings.html` — Local settings / configuration utility

## Data and styling

Shared styling:
- `styles.css` — unified design system used across the main dashboard pages

Current data files:
- `data/decisions.json`
- `data/scenarios.json`
- `data/artifacts-index.json`

Supporting documentation:
- `ASSESSMENT_AND_1.0_PLAN.md`
- `CONSOLIDATION_STATUS.md`
- `CONSOLIDATED_SITE_DESIGN.md`

## Project status

This repo is in **active v1.x refinement**.

Why this wording:
- the shared stylesheet is marked **Version 1.0**
- the consolidation note says **Version 1.0 Complete**
- the dashboard footer currently shows **Version 1.1**

Rather than hard-coding one inconsistent version number in this README, this file reflects the repo’s current state as an actively refined v1.x dashboard.

## README alignment notes

This README has been aligned to the repo as it exists now:
- removed program- and organization-specific identifiers
- removed the claim that artifact ingestion is powered by a root-level `generate_artifacts.py` GitHub Action pipeline
- updated the page list to match the current navigation, including `decisions.html`, `scenarios.html`, and `settings.html`
- updated the project-status section to reflect the repo’s current versioning inconsistency instead of asserting a single stale value

## Local setup

Clone the repo and serve it locally with any static file server.

### Python

```bash
git clone https://github.com/jjuniper-dev/status-site.git
cd status-site
python -m http.server 8000
```

Then open:
- `http://localhost:8000/`

## Content update guidance

### Update page content
Edit the relevant `.html` file directly.

### Update decisions or scenarios
Edit the JSON files under `data/`:
- `data/decisions.json`
- `data/scenarios.json`

### Update artifacts
Maintain artifact entries in:
- `data/artifacts-index.json`
- `artifacts/`

### Update styles
Edit:
- `styles.css`

## Notes

- This repo appears to be intended as a working dashboard and reference surface rather than polished product documentation.
- Some documentation files describe the site as already consolidated to 1.0, while the live page footer indicates 1.1. Keep that inconsistency in mind when preparing release notes or external-facing outputs.
- If artifact automation is reintroduced, document the actual workflow file and script path explicitly in this README.

## Related references

- `ASSESSMENT_AND_1.0_PLAN.md` — assessment and release plan
- `CONSOLIDATION_STATUS.md` — consolidation summary and page inventory
- `CONSOLIDATED_SITE_DESIGN.md` — design direction and conventions

## License / usage

Working-use repository.
