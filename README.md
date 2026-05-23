[![Header](https://capsule-render.vercel.app/api?type=waving&color=0:0a1628,50:0d2137,100:0a1628&height=240&section=header&text=HC/PHAC%20AI%20Project%20Dashboard&fontSize=40&fontColor=e0f2f1&animation=fadeIn&fontAlignY=38&desc=PATH%20%E2%80%A2%20HAIL%20%E2%80%A2%20Architecture%20Governance%20%E2%80%A2%20Decision%20Tracking&descSize=17&descAlignY=58)](https://github.com/jjuniper-dev/status-site)

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&duration=3000&pause=1000&color=4DB6AC&center=true&vCenter=true&multiline=false&repeat=true&width=650&lines=Enterprise+Architecture+%7C+Digital+Transformation+Branch;PATH+%2B+HAIL+%2B+Purview+%2B+Entra+convergence;ARB+submissions+%7C+AI+governance+%7C+use+case+tracking;HC%2FPHAC+AI+Capabilities+Mapping+v2.x" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1-4DB6AC?style=flat" />
  <img src="https://img.shields.io/badge/Status-Active%20Refinement-1a3a4a?style=flat" />
  <img src="https://img.shields.io/badge/Hosted-GitHub%20Pages-4DB6AC?style=flat&logo=github" />
  <img src="https://img.shields.io/badge/Design-IBM%20Plex%20%7C%20Dark%20Teal-0a1628?style=flat" />
</p>

---

## 📋 What this is

A GitHub Pages dashboard for tracking HC/PHAC AI initiatives — architecture decisions, governance status, use cases, and platform alignment across the PATH/HAIL stack. Built for the EA/TPO team within the Digital Transformation Branch.

**Live site:** [jjuniper-dev.github.io/status-site](https://jjuniper-dev.github.io/status-site)

---

## 🛠️ Stack

<p align="left">
  <img src="https://skillicons.dev/icons?i=html,css,js,github" />
</p>

Static HTML/CSS/JS — no build step. Served via GitHub Pages.

---

## 📄 Pages

| Page | Purpose |
|------|---------|
| `index.html` | Dashboard — initiative status overview |
| `decisions.html` | Architecture Decision Log |
| `scenarios.html` | Scenario navigator |
| `intelligence.html` | Analysis and intelligence surface |
| `artifacts.html` | Artifact library |
| `path-architecture.html` | PATH platform architecture view |
| `control-plane.html` | Control-plane view |
| `pptx-builder.html` | PPTX utility |
| `settings.html` | Local configuration |

---

## 📊 Data Files

```
data/
├── decisions.json        # ARB decisions and disposition log
├── scenarios.json        # Platform and governance scenarios
└── artifacts-index.json  # Artifact library index
```

---

## 🏛️ Architectural Context

<details>
<summary>Platform framing — click to expand</summary>

**Azure in GC/SSC context:** foundational infrastructure and service layer — not an enterprise AI platform.

| Component | Role |
|-----------|------|
| **HAIL** | AI runtime (current) |
| **PATH** | Target control plane (Protected B) |
| **Purview** | Emerging data governance layer |
| **Entra ID** | Identity and access |

Real platform emerges from PATH + HAIL + Purview + Entra convergence. Current fragmentation (Databricks vs. Fabric, multiple teams, no unified execution model) is the key gap.

**Correct ARB framing:** *"Structured decision framework pending platform/governance alignment"* — not "ready for implementation."

</details>

---

## 🚀 Local Setup

```bash
git clone https://github.com/jjuniper-dev/status-site.git
cd status-site
python -m http.server 8000
# → http://localhost:8000/
```

---

## ✏️ Content Updates

| What | Where |
|------|-------|
| Page content | Edit `.html` directly |
| Decisions | `data/decisions.json` |
| Scenarios | `data/scenarios.json` |
| Artifacts | `data/artifacts-index.json` + `artifacts/` |
| Styles | `styles.css` |

---

## 📁 Related Repos

| Repo | Purpose |
|------|---------|
| [`jjuniper-dev/personal-cognitive-architecture`](https://github.com/jjuniper-dev/personal-cognitive-architecture) | Ayla / PCA personal AI stack |
| [`jjuniper-dev/Obsidian`](https://github.com/jjuniper-dev/Obsidian) | Obsidian vault reference |

---

[![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:0a1628,50:0d2137,100:0a1628&height=120&section=footer)](https://github.com/jjuniper-dev/status-site)
