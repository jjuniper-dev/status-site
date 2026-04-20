# HC/PHAC Enterprise AI Architecture — v1.1

**Date:** 2026-04-20  
**Status:** Final (Production-Ready)  
**Owner:** EA / TPO  

---

## Purpose

Executive and Architecture Review Board (ARB) visualization of enterprise AI control, runtime, and governance convergence across HC/PHAC.

---

## North Star

*A governed enterprise AI ecosystem enabling scalable regulatory modernization and real-time public health intelligence.*

---

## Architecture Overview

The architecture is structured across four layers:

1. **Enterprise Governance**
2. **Control Planes (Data + AI)**
3. **Enterprise AI Platform Layer**
4. **AI-Enabled Business Execution**

---

## 1. Enterprise Governance

Centralized governance defines:

- Responsible AI  
- Security & Privacy  
- Data Governance  
- FinOps & Cost Control  

> Governance is defined centrally and inherited by all platforms and use cases.

---

## 2. Control Planes

### 2.1 Data Control Plane — Microsoft Purview

**Role:** Data lifecycle governance

Capabilities:
- Data Classification  
- Data Lineage  
- Policy Definition  
- Policy Enforcement  
- Auditability / Traceability  

---

### 2.2 AI Control Plane — PATH (Future) / HAIL (Current)

**Role:** AI lifecycle governance and runtime control

Capabilities:

**Intake & Governance**
- AI Intake & Triage  
- Model Registry  
- Governance & Compliance  

**Runtime Enforcement**
- Runtime Guardrails  
- Model Access Gateway (API Management)  
- Audit & Monitoring  

> Transition state: HAIL → PATH-aligned runtime

---

## 3. Enterprise AI Platform Layer

**Role:** Enforcement layer where governance becomes infrastructure

### Data Platforms
- Microsoft Fabric  
- Azure Databricks  
- Search / RAG  

### Identity & Access
- Microsoft Entra ID  
- RBAC / ABAC  
- API Gateway enforcement  

### AI Runtime Services
- Model Hosting  
- Agent Execution  
- Orchestration  

---

## 4. Telemetry & Lineage

**Data Signals**
- Lineage Signals  
- Data Events  
- Policy Trace  

**Runtime Signals**
- Telemetry  
- Runtime Audit  
- Model Monitoring  

---

## 5. AI-Enabled Business Execution Layer

Enterprise workloads inherit governance and controls:

### Regulatory Intake & Submission
- CSI / eCTD  
- CTLS  
- AI Document Processing  
- AI Classification  

### Public Health Surveillance
- FluWatch  
- CDSS  
- AI Signal Detection  
- AI Forecasting  
- GeoAI  

### Enterprise Data Platform
- Fabric / Databricks  
- Data Modernization Initiative (DMI)  
- AI RAG  
- Semantic Search  

### Enterprise Services
- Enterprise Service Management (ESM)  
- Case & Workflow  
- AI Agents  
- AI Copilots  

---

## Key Principles

- Governance is centralized and enforced  
- Control planes define policy, not platforms  
- Platforms inherit and operationalize governance  
- Data and AI governance are distinct but complementary  
- PATH is the target control plane; HAIL is transitional  
- All use cases inherit controls automatically  

---

## Diagram Design Rules

- 16:9 layout  
- Azure / Fluent iconography  
- Teal = governance/platform  
- Blue = AI/runtime  
- Green = business/use cases  
- WCAG AA accessibility compliance  
- No overlapping elements  
- Strict top-down reading order  

---

## Notes

- PATH is not a sandbox — it is the AI control plane  
- HAIL is the current PHAC runtime environment  
- Convergence architecture between PATH and HAIL remains a priority decision  

---

## Output Targets

- PPTX (DTB Option A template)  
- SVG (diagram reuse)  
- PNG (executive decks)  

---

## Status

This version (v1.1) reflects:

- Corrected PATH/HAIL positioning  
- Explicit API gateway enforcement layer  
- Strengthened platform layer definition  
- Added North Star narrative for executive alignment  
