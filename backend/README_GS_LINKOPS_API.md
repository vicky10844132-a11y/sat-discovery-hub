# GS LinkOps AI Backend

This backend is the production-oriented API skeleton for the full intelligent ground segment operations platform.

It starts with no preloaded satellite, station, manufacturer or customer data.

## Run locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-gs-linkops.txt
uvicorn gs_linkops_api:app --reload --host 0.0.0.0 --port 8000
```

Open:

```text
http://localhost:8000/docs
```

## Included API areas

- Health check
- Dashboard
- Organizations
- Contacts
- Ground stations
- Satellites
- Orbit/contact calculation placeholder
- Mission creation from pass window
- Mission status advancement
- Transfer completion
- Billing record generation
- AI alerts

## Production upgrade required

The current `/orbit/calculate` endpoint includes a simplified placeholder calculation so the full workflow can run.

Production mode should replace it with:

- Python Skyfield / SGP4 propagation
- official TLE freshness check
- station azimuth/elevation profile
- pass start/end UTC
- max elevation
- contact duration
- conflict check
- multi-station ranking

## Data model direction

Current prototype uses in-memory storage.

Production version should use:

- PostgreSQL
- optional PostGIS
- SQLAlchemy or SQLModel
- migration framework
- role-based access control
- audit table
- object storage for temporary transfer manifests and attachments

## Billing logic

Default trigger:

```text
Transfer Completed + Operator / Manufacturer Confirmed = Billable
```

Billing modes to support:

- Per pass
- Per minute
- Per successful downlink
- Per test mission
- Cost plus service fee
- Monthly package
- Partial/failure/cancellation rules
