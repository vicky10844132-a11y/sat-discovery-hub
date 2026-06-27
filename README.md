# Global Geospatial Resource & Production Hub

全球地理空间资源与产品生产调度中心

This repository contains two related platform concepts:

1. **SAT-DISCOVERY / Geospatial Production Hub** — online virtual production factory for DSM/DOM product creation.
2. **GS LinkOps AI** — intelligent ground segment resource and downlink operations platform.

---

## GS LinkOps AI

GS LinkOps AI connects satellite operators with partner ground stations and supports:

- Ground station onboarding
- Satellite resource onboarding
- TLE / NORAD management
- Pass/contact window calculation
- Capability matching
- Downlink mission creation
- Station confirmation
- Reception status tracking
- Data transfer handover
- File manifest and checksum tracking
- Manufacturer/operator confirmation
- Automatic mission reports
- Automatic billing and supplier settlement
- AI Copilot recommendations, alerts and failure analysis

### Runnable prototype

Open the standalone prototype directly:

```text
gs-linkops-ai.html
```

Or run it with a local static server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/gs-linkops-ai.html
```

### Vite option

A package file is included for a future React/Vite implementation:

```bash
npm install
npm run dev
```

The current immediately runnable GS LinkOps AI prototype is the standalone HTML file.

---

## Documentation

- `docs/GS_LinkOps_AI_Platform_Requirement.md`
- `docs/GS_LinkOps_AI_Task_Backlog.md`
- `docs/GS_LinkOps_AI_Implementation_Roadmap.md`

---

## Original SAT-DISCOVERY Positioning

From global geospatial resources to factory-released DSM/DOM products.

The Hub coordinates storage providers, compute providers, data providers, reference data providers, algorithm/software providers, production partners, QC partners and delivery control.

## Original Streamlit Run Locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Recommended Deployment

- GitHub repository: `sat-discovery-hub`
- Vercel / Streamlit Cloud / Render
- Google Sheets can replace local CSV in the next phase.
