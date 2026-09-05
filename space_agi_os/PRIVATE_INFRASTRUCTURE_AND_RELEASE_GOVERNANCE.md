# SPACE AGI OS — Private Infrastructure & Release Governance

## Objective
Deliver a complete private company operating environment in which core source code, company data, credentials, project records, email-derived intelligence, commercial workflows and internal AI capabilities are not publicly exposed.

## Target operating model
- Private source control for all company code.
- Google Cloud as the primary private runtime and data environment.
- Public internet exposure limited to approved company website pages and explicitly approved public APIs.
- No secrets, customer data, supplier data, commercial data or internal workflow logic in public repositories.
- Every production change is versioned, tested, reviewable and reversible.

## System domains to consolidate
1. SPACE AGI OS orchestration layer
2. Project Operations / company project management
3. EO Data Search / AOI workflows
4. Space Ops / orbit / ground-station operations
5. Supplier and API integrations
6. Production / QC / delivery
7. Order / contract / invoice / payment tracking
8. Gmail synchronization and Email-to-Project mapping
9. Company website content operations
10. LinkedIn / external communications workflows
11. Technology Watch and controlled capability upgrades

## Migration sequence
1. Freeze new sensitive work on public branches.
2. Inventory all code, files, secrets, data models, workflows and external dependencies.
3. Establish canonical baselines and acceptance criteria for every module.
4. Classify each legacy capability as KEEP / MERGE / REFACTOR / REPLACE / RETIRE / MISSING.
5. Build the consolidated private version on isolated branches.
6. Create regression tests and end-to-end acceptance tests.
7. Provision private Google Cloud runtime, database, object storage, secret storage and audit logging.
8. Migrate application code and data to the private environment.
9. Validate staging end-to-end before production cutover.
10. Rotate every credential or token that may ever have appeared in public source history.
11. Restrict or remove the public GitHub repository only after private deployment and backups are verified.
12. Run post-cutover health checks and preserve rollback points.

## Security boundaries
- Secrets must come from managed secret storage, never committed source files.
- Production and staging credentials must be separate.
- Least-privilege IAM is mandatory for services and agents.
- External email sending, contract commitments, payments, credential release and destructive actions require explicit approval gates.
- Technology Watch may research, compare, prototype and test new technology, but may not modify production directly.

## Change-control loop
Goal baseline -> implementation branch -> automated checks -> regression comparison -> end-to-end validation -> approval -> production release -> health check -> rollback if required.

## Completion rule
A capability is COMPLETE only when its backend, data path, permissions, error handling, logs, tests, documentation and end-to-end workflow are verified. A page, button or draft implementation alone is not COMPLETE.

## Repository end state
Preferred: keep a private GitHub repository for version control, while Google Cloud hosts runtime, data and secrets. Public GitHub should contain only intentionally open-source material, if any.

## Non-negotiable principle
Do not optimize for more features. Optimize for the user's intended result, system integrity, traceability and long-term maintainability.
