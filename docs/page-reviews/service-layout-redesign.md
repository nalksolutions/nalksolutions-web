# Shared service-page layout revision

October 20, 2026. D-25 addresses distracting inherited columns, detached actions and the
integration scenario layout across all 30 shared service-page consumers (25 English and five
existing Arabic documents). Owner visual review remains open.

## Design and content ownership

The API integration document contains no body image nodes; the apparent missing assets came
from empty WordPress columns. The source audit also finds zero body image nodes across this
service family. Existing header/footer assets and decorative hero diagrams remain in place;
no invented stock imagery or claims were added to fill the gaps.

- Empty layout columns no longer reserve half a section. Empty spacer paragraphs are hidden.
- Consecutive concise capability sections share a responsive two-column panel grid. The six
  scenarios under **Common Integration Scenarios Nalk Offers** form one grid, stacking on mobile.
- Capability headings, reading sizes and spacing are consistent. Longer editorial material,
  features, tabs, regional groups, FAQs and final contact sections retain distinct treatments.
- Supporting links retain their original wording and destinations but use quieter underlined
  arrow links. Primary hero/final enquiry actions retain the shared button system. Capability
  actions sit after the copy and align to the bottom of their cards.
- In sections mixing meaningful copy and button-only columns, the button-only column moves
  after the content in a related-link row. On the integration page this relocates the maintenance
  link after Marketing Automation Integration's body and existing portal link. No link is dropped.
- Existing glass colors, hero artwork and shell remain. Capability panels use the existing
  scroll entrance system with a subtle 750ms fade; supporting arrows have 200ms hover/focus
  motion. Reduced motion and server-visible content are retained. D-24 disclosure behavior stays.

This is a presentation revision. Source documents, page identities, titles, H1 wording,
substantive paragraphs, links, established IDs, media references, structured data and SEO
metadata are unchanged. Text/link order can change within a section when action-only columns
are relocated; reading order now follows the displayed content. No new public routes or redirects.

## Implementation

`presentServiceNodes` normalizes recovered column roles, marks blank spacers and identifies
capability panels. The 2400-character panel limit keeps lengthy prose at an editorial measure;
it does not truncate anything. `ServiceSections` is a small server composition used by specialist
pages and each group in the four authored offers, preserving their existing section identities.
`service-layout.css` owns the revised layout and supporting-link styling. Obsolete empty-column
spotlight styling was removed. No page builder, new dependency or external runtime media.

## Verification boundary

Targeted ESLint, strict TypeScript and 39 unit cases pass, including text/link/media preservation
and source non-mutation for every service document. Four desktop/mobile browser cases passed
in `tmp/service-redesign/smoke-final/`: integration content/layout/resources, plus representative
Software, AI, Marketing, B2B portal and existing Arabic pages. The initial browser preservation
assertion used visible text and missed inactive tab panels; it was corrected to check server
text content. Initial reports remain in `tmp/service-redesign/smoke/`.

The final layout adjustment additionally checks the integration panels and existing regional/
accordion regression cases at desktop/mobile in `tmp/service-redesign/final-layout/` (four passed,
41.3 seconds). Previews
are captured there. No full engineering, production build or broad cross-browser run is claimed;
long suites remain deferred at the owner's direction. Automated checks do not establish owner
visual acceptance, ranking outcomes or completion of Arabic translations/forms/CMS/deployment.

Owner follow-up: an odd final capability card now spans the complete two-column row, including
the HR and Employee Operations example. Paired rows retain their columns; mobile remains stacked.
The widened card retains the existing bounded reading measure. A targeted desktop/mobile
regression covers the final card's full width and unchanged paired-card sizing.
