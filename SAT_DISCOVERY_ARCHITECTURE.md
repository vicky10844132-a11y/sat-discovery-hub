# SAT-DISCOVERY Architecture Principles

## Core Positioning

SAT-DISCOVERY is a stateless online geospatial production platform.

The platform coordinates:
- User-controlled data
- AOI definition
- Production tools
- Job orchestration
- QC review
- Output delivery

The platform is NOT:
- A long-term data warehouse
- An imagery marketplace
- An AI-first concept product

## Architecture Layers

### Layer 1 - Production Foundation

Input Center
AOI Tools
Production Toolkit
Job Builder
Progress Monitor
Preview & QC
Output Center
Source & Disclaimer

### Layer 2 - Rule-Based Validation

CRS validation
Geometry validation
AOI validation
Coverage validation
Offset checks
Output completeness checks
Delivery checks

### Layer 3 - Production Intelligence

Workflow recommendation
Error explanation
QC summary
Report generation
Production memory

## AI Principles

Use intelligence only where it creates measurable value.

AI may:
- Recommend workflows
- Explain failures
- Summarize QC findings
- Generate reports
- Reuse historical production knowledge

AI should NOT be presented as:
- Fully automatic production
- Guaranteed classification
- Guaranteed QC authority
- Autonomous geospatial production

## Product Principle

Rule-based workflows first.
Production intelligence second.
Professional judgement remains final.
