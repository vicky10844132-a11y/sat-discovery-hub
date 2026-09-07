# SPACE AGI OS — Market Materials Governance

Status: Implemented, not yet verified

## Purpose
Create a canonical Market Materials layer for GLORY STELLAR so finalized plans, product packs, pricing sheets, presentations, speaking scripts, public materials, website copy, LinkedIn copy, and historical versions are preserved and controlled from one source of truth.

## Core rule
A document may exist in many output formats, but there must be one authoritative record for its content, version, confidentiality level, approval state, and publication eligibility.

## Material classes
1. Master Plans / Business Plans
2. Product Materials
3. Pricing / Commercial Positioning
4. Presentations / Speaking Scripts
5. Ground Segment / Mission Ops Materials
6. Website / Public Company Materials
7. LinkedIn / External Communications
8. Sales / Customer-Facing Packs
9. Evidence / Supporting Records
10. Historical / Superseded Versions

## Lifecycle
DRAFT -> INTERNAL REVIEW -> APPROVED -> FINAL -> RELEASED -> SUPERSEDED -> RETIRED

`FINAL` means the content is locked as the final approved version for its intended purpose.
`RELEASED` means it has actually been published or sent externally.

## Required metadata
- Material ID
- Title
- Category
- Language
- Version
- Status
- Confidentiality
- Intended audience
- Authoritative file reference
- Supersedes / superseded by
- Approval date
- Release date
- Public publication allowed: yes/no
- Website sync allowed: yes/no
- LinkedIn sync allowed: yes/no
- Sales-pack sync allowed: yes/no
- Contact email to display
- Notes / evidence references

## Publication controls
- Internal, confidential, pricing, contract, supplier, customer, government-discussion and evidence-room materials must never be published automatically.
- Website, LinkedIn and public sales materials may only be generated from records marked APPROVED/FINAL and Public publication allowed=yes.
- Outdated product names, figures, investment numbers, contract status or technical claims must not be reintroduced from superseded documents.
- All public materials must use the current approved GLORY STELLAR company email identity rather than personal Gmail unless the user explicitly approves otherwise.

## Relationship to Product Operations
Product Operations owns the authoritative product facts and release states.
Market Materials converts approved product facts into controlled collateral for website, LinkedIn, presentations, sales packs, proposals and customer communications.

## Relationship to Project Operations
Project-specific proposals, quotations, contracts, requirement confirmations and delivery records remain attached to the authoritative project record. Reusable approved material may be promoted into Market Materials without exposing project-confidential information.

## Storage model
- Confidential/final material files live in private storage/library, not the public repository.
- This repository contains only non-sensitive schemas, governance and orchestration logic until private source control/runtime is in place.
- Historical versions are retained rather than overwritten.

## Definition of Done
A Market Materials item is `VERIFIED` only when:
1. the authoritative file is present,
2. version/status metadata is correct,
3. confidentiality/publication flags are correct,
4. supersession links are correct,
5. public contact identity is current,
6. any intended website/LinkedIn/sales synchronization has been validated end-to-end.
