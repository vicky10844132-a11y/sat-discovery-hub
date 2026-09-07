# SPACE AGI OS — Product Operations / Product Lifecycle

## Purpose
Create one governed product source of truth covering product资料、设计、版本、更新、迭代、宣传与多渠道同步，避免官网、LinkedIn、销售资料、报价附件和内部文档口径不一致。

## Core lifecycle
Idea / Market Signal -> Product Definition -> Technical Specification -> Design Assets -> Internal Review -> Versioned Release -> Website Update -> LinkedIn / Social Content -> Sales Enablement -> Customer Feedback -> Analytics -> Iteration -> New Release

## Product record (single source of truth)
Each product must have one canonical Product ID and a versioned master record including:
- Product name / internal codename
- Product category and target users
- Business problem and value proposition
- Technical specifications and supported configurations
- Data sources / dependencies / suppliers
- Geographic coverage / availability
- Accuracy / resolution / SLA / limitations
- Pricing logic and commercial package
- Licensing / usage restrictions / compliance notes
- Delivery format / API / portal / offline package
- Product owner / reviewer / approval status
- Release version / release date / changelog
- Website copy / long description / short description
- LinkedIn/social copy variants
- Brochure / one-pager / deck / imagery / diagrams / video assets
- FAQ / objections / sales talking points
- Deprecated claims and superseded assets

## Version governance
Statuses:
- CONCEPT
- DRAFT
- INTERNAL_REVIEW
- APPROVED
- RELEASE_CANDIDATE
- RELEASED
- SUPERSEDED
- RETIRED

No public channel may publish from DRAFT or INTERNAL_REVIEW.
Every release must preserve previous versions and changelog.

## Design workflow
1. Product requirements and target audience
2. Information architecture
3. Visual direction / diagrams / product screenshots / videos
4. Technical fact-check
5. Brand consistency check
6. Accessibility / mobile checks when applicable
7. Approval
8. Release asset pack

## Omnichannel publishing
Public content is generated from the approved master record, adapted by channel:
- Website: authoritative, complete, SEO-aware product page
- LinkedIn Company Page: concise launch/update posts, case studies, technical insights
- Sales material: one-pager, proposal section, product sheet
- Email: customer / partner announcement
- Internal project system: current version, pricing, assets, owner, status

Channel copy may differ in tone and length, but technical facts must come from the same approved source.

## Update / iteration loop
Signals can come from:
- Customer emails
- Project outcomes
- Supplier/API changes
- Technology Watch
- Competitor research
- Sales feedback
- Support issues
- Usage / conversion analytics

For each signal:
Detect -> classify -> research -> compare to current product -> impact assessment -> proposal -> controlled change -> regression/fact validation -> approval -> release -> sync channels -> measure result

New technology is not adopted automatically. Research and comparative analysis come first; only valuable capabilities are absorbed.

## Automated checks
Before release:
- Technical claims match approved source
- No expired product specs or pricing
- No conflicting versions across channels
- Links and downloads valid
- Required legal/compliance notes present
- Product images and documents reference current version
- Website and LinkedIn publication packages generated from same release

## Integration with SPACE AGI OS
Product Operations connects with:
- Project Operations: customer requirements and implementation feedback
- Email Intelligence: inbound requests and product feedback
- Technology Watch: candidate improvements and technology changes
- EO / Mission / Ground Station capabilities: actual service availability
- Commercial / Billing: pricing and quote templates
- Website: product pages and updates
- LinkedIn / Social: launch and thought-leadership distribution
- Knowledge / Memory: product history, decisions and lessons

## Approval boundaries
System may research, compare, draft, generate design proposals, assemble release candidates and detect inconsistencies automatically.
External publication, commercial commitments, pricing changes, legal claims and retirement of active products require an approval gate unless explicitly configured otherwise.

## Definition of Done
A product version is COMPLETE only when:
1. Master record is complete.
2. Technical facts are verified.
3. Pricing/commercial status is known.
4. Required design assets exist.
5. Website package is ready.
6. LinkedIn/social package is ready.
7. Sales package is ready where required.
8. Changelog is recorded.
9. Cross-channel consistency check passes.
10. Release and rollback paths are defined.
