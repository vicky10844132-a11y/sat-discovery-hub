# Global Geospatial Resource & Production Hub

全球地理空间资源与产品生产调度中心

This is the MVP version of an online virtual production factory for DSM/DOM product creation.

## Positioning

From global geospatial resources to factory-released DSM/DOM products.

The Hub coordinates:

- Storage providers
- Compute providers
- Data providers
- Reference data providers
- Algorithm / software providers
- Production partners
- QC partners
- Delivery control

## Core Control Rule

All tile-level passwords, access tokens, download keys, and release credentials shall be issued exclusively to the platform owner's designated email address.

The system shall not send access credentials directly to clients, production partners, storage providers, compute providers, or any third party.

External release must be manually approved and forwarded by the platform owner.

## Run Locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Recommended Deployment

- GitHub repository: sat-discovery-hub
- Vercel / Streamlit Cloud / Render
- Google Sheets can replace local CSV in the next phase.
