# AI Platform Intelligence

## Core Position
HC/PHAC requires a defensible enterprise AI operating model spanning control plane, runtime, and data governance.

## Capability Landscape

### PATH
- Status: Pre-prototype
- Role: Target-state control plane
- Risk: Not operational, must not be presented as such

### HAIL
- Status: Operational runtime
- Stack: Azure Databricks + Unity Catalog
- Gap: No ATO, telemetry incomplete

### Copilot-Class
- Role: Workforce productivity
- Risk: Shadow governance expansion

---

## Key Insights
- Runtime ≠ governance maturity
- Control plane is missing at enterprise scale
- Fragmentation between PATH and HAIL is a P1 issue

## Recommendations
- Define PATH/HAIL convergence architecture
- Establish enterprise control baseline (Purview, Policy)
- Formalize AI-Ops ownership model

## Risks
- Shadow AI expansion via Copilot/CANChat
- Lack of ATO path for HAIL
- Governance fragmentation across platforms

---

## Architecture Model

### Control Plane
- Identity (Entra ID)
- API Gateway (APIM)
- Policy + Audit

### Runtime Plane
- Project-isolated environments
- AI Foundry / Databricks

### Data Layer
- RAG pipelines
- Purview governance

---

## Open Questions
- PATH/HAIL convergence
- Fabric vs Databricks
- AI-Ops ownership

---

_Last updated: 2026-04-20_
