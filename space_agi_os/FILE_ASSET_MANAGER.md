# SPACE AGI OS — File Asset Manager

Status: Implemented, not yet verified

## Goal
Create one controlled file and image management layer for GLORY STELLAR and personal/education records. Prevent repeated storage, preserve authoritative versions, and make every retained asset easy to find.

## Core rules
1. Exact duplicates are detected by content fingerprint (SHA-256), not filename alone.
2. Same-name or similar-name files are not deleted automatically unless fingerprints match.
3. Version chains are preserved: FINAL/APPROVED current version plus SUPERSEDED history where needed.
4. Contracts, signed documents, invoices, legal/compliance files, original evidence, original photos, and authoritative final deliverables receive protected status.
5. Random UUID image names must be classified and renamed only after content/type confidence is sufficient.
6. Deletion requires an auditable record: retained canonical asset, deleted duplicate, reason, timestamp, source location.

## Canonical categories
### Company
- GLORY_STELLAR/Contracts
- GLORY_STELLAR/Projects
- GLORY_STELLAR/Finance_Legal
- GLORY_STELLAR/Operations
- GLORY_STELLAR/Brand_Media
- GLORY_STELLAR/Market_Materials

### Personal
- PERSONAL/Documents
- PERSONAL/Images

### Education
- EDUCATION/NAU
- EDUCATION/TOEFL

### Lifecycle
- ARCHIVE/Superseded
- INBOX_TO_CLASSIFY

## Detection pipeline
INGEST -> METADATA SCAN -> CONTENT FINGERPRINT -> DUPLICATE GROUPING -> VERSION CLASSIFICATION -> CATEGORY CLASSIFICATION -> PROTECTION CHECK -> MOVE/RENAME -> DUPLICATE DELETE -> INDEX UPDATE -> AUDIT LOG

## Duplicate classes
- EXACT_DUPLICATE: identical SHA-256. Safe to remove extra copies after one canonical copy is selected.
- FORMAT_EQUIVALENT: same content in different formats (e.g. DOCX/PDF). Keep both when each format serves a business purpose.
- VERSION_VARIANT: similar title/content but substantive differences. Never delete as duplicate; assign version chain.
- DERIVATIVE_ASSET: cropped/compressed/exported image or document. Retain based on use; do not treat as exact duplicate.
- UNKNOWN: insufficient evidence; move to INBOX_TO_CLASSIFY, do not delete.

## Protected asset types
- signed contract / agreement
- invoice / tax / payment evidence
- government / regulatory record
- company registration / compliance
- customer/supplier requirement and acceptance record
- final approved business plan / presentation / proposal
- source/original imagery and irreplaceable personal photo
- delivery evidence and project acceptance

## File naming policy
Use descriptive names where possible:
`YYYY-MM-DD_ProjectOrTopic_DocumentType_Party_Status_Version.ext`

Examples:
- `2026-06-29_HangzhouTuwei_Contract_Clean_FINAL.pdf`
- `2026-08-27_EDB_IntroductoryDeck_RELEASED.pptx`
- `2026-08_Belize_Tasking_Requirement_FINAL.docx`

## Image handling
Images are classified into:
- company project / AOI / satellite
- company brand / product / marketing
- contract / receipt / evidence screenshot
- personal
- education
- temporary / disposable

Near-duplicate image detection should use perceptual hashes in addition to SHA-256. Exact byte duplicates may be deleted automatically under approved cleanup policy; visually similar but edited images require comparison before deletion.

## Definition of Done
A cleanup batch is VERIFIED only when:
1. every deleted file has an identical retained canonical copy or explicit deletion rationale;
2. protected assets were not deleted;
3. moved files resolve at the destination;
4. current/final versions are identifiable;
5. storage saved is measured;
6. an audit log exists for deletes/moves/renames.
