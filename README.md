# AI Project Dashboard — PATH / HAIL Status Site

GitHub Pages site for tracking enterprise AI architecture, governance, scenarios, and artifacts related to PATH and HAIL in the Health Canada / PHAC context.

## What this repo is

This repository is a working dashboard and reference site for:
- enterprise AI governance and operating-model analysis
- PATH / HAIL status tracking
- architecture decisions and scenario framing
- artifact indexing and supporting visuals
- PPTX and settings utilities used alongside the site

The repo treats **PATH** as a governance / control-plane concept and **HAIL** as the active delivery/runtime environment reflected in the current site narrative.

## Current site structure

Main pages currently linked from the site navigation:
- `index.html` — Dashboard
- `decisions.html` — Decision log
- `scenarios.html` — Scenario navigator
- `intelligence.html` — Intelligence and platform analysis
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

## What was corrected in this README

This README has been aligned to the repo as it exists now:
- removed the unverified expansion of the PATH acronym
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

- This repo appears to be intended for internal / working use rather than polished public release documentation.
- Some documentation files describe the site as already consolidated to 1.0, while the live page footer indicates 1.1. Keep that inconsistency in mind when preparing release notes or executive-facing outputs.
- If artifact automation is reintroduced, document the actual workflow file and script path explicitly in this README.

## Related references

- `ASSESSMENT_AND_1.0_PLAN.md` — assessment and release plan
- `CONSOLIDATION_STATUS.md` — consolidation summary and page inventory
- `CONSOLIDATED_SITE_DESIGN.md` — design direction and conventions

## License / usage

Internal HC/PHAC working use.
