# Brand icon, Contact image and complete footer

October 20, 2026. D-23 implements the owner's requested polish without changing page URLs,
content metadata or the existing form's delivery state.

## Changes

- Browser metadata uses original 32px/192px favicon PNGs and the 180px Apple touch icon from
  [the live site](https://nalksolutions.com/), copied locally without modification. Source URLs
  and SHA-256 hashes are in `src/content/home/brand.provenance.json`. The generic SVG is removed.
  `brand.ts` supplies metadata and the proxy's exact public-asset allowlist; `/brand` is reserved
  against published-content collisions. Other asset/routing matching remains unchanged.
- Contact's hero photo uses its natural aspect ratio instead of a fixed 180px crop. Its original
  media and briefing copy remain intact. Office photography retains its separate framing.
- One shared server-rendered footer replaces the old Home/interior layout variants. It contains
  the existing main navigation, four direct retained offer destinations, business summary,
  existing social links, email, Saudi/Pakistan phones, office addresses/hours, enquiry link,
  sitemap and copyright. Contact facts are reused from the Contact composition. Copyright
  overrides and English-shell/Arabic-document language behavior remain supported.
- `footer.css` owns the responsive layout, using the shared content inset. Obsolete footer
  rules were removed from marketing/floating-shell styles; shared icon/menu styles remain.
  No legal pages, contact details or delivery promises were invented.

## Focused verification

Passed: targeted ESLint, strict TypeScript (`tsc --noEmit`), eight journey unit tests, and three
short Chromium browser cases at 1440x1000, 390x844 and 320x844 against the existing development
server. Browser checks cover icon response/type, intrinsic photo ratio, footer navigation and
contact facts, horizontal overflow and console/resource diagnostics. Desktop and narrow previews
were visually inspected. No full engineering or production-build run is claimed for this pass,
in accordance with the owner's request to limit long test runs.

Reports and previews: `tmp/brand-footer/smoke-final/`. The initial failed reports remain in
`tmp/brand-footer/smoke/`: the new icon was correctly rejected until explicitly added to the
asset allowlist. The final three cases pass in 17.5 seconds. Unit coverage also checks that each
footer offer destination matches its existing published identity.

Owner visual approval remains open. The enquiry fields remain visible and editable; their
existing disabled submission control and email fallback are unchanged.
