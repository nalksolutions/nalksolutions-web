# Customer journey editorial review

Decision D-20, October 20, 2026. Implementation copy draft; owner content/design approval
is separate from engineering verification. Arabic expansion, forms, Sanity and release remain open.

## Review the nine core pages

Use `npm ci`, `npm run dev`, then open the existing paths below on the loopback server.
The unchanged production workflow is `npm run build` followed by `npm start`.

| Page | Path | Review focus |
| --- | --- | --- |
| Home | `/` | Four offers before company detail; one clear enquiry journey |
| Services | `/our-services/` | Four equal choices; 21 optional specialist links |
| Websites | `/professional-website-development-company-in-saudi-arabia/` | Concise introduction; industries and regional context retained below |
| Software | `/services-custom-software-app-development-saudi-arabia/` | Applications and portals within one coherent offer |
| AI | `/services-ai-automation-saudi-arabia/` | Business-process automation; API integration as specialist detail |
| Marketing | `/services-digital-marketing/` | Saudi-market context; campaign automation belongs here |
| About | `/about-us/` | Founder/values/vision/mission retained; one concise service summary |
| Blog | `/blog/` | Four topic links; other topics optional; original article order |
| Contact | `/contacts/` | Working email/phone before locations and unavailable form |

## Editorial change register

The [exact source-fragment ledger](customer-journey-editorial.json) records every rewritten
paragraph/heading on the seven recovered core documents, its source section and reason.
It also defines required authored content. HTTP tests continue checking all other source
paragraphs, list items and headings on those documents. This replaces the whole-body hash
only for these seven explicitly edited pages. All other recovered bodies retain their hash checks.
The original JSON documents, SEO identities, media assets and capture evidence are unchanged.

| Area | Before | Authored change and retained meaning |
| --- | --- | --- |
| Shared header/mobile | Nine-category Blog dropdown; Get Started | Five simple destinations; Discuss Your Project → Contact. Topics move to Blog. Current-page semantics remain distinct from active-section styling. |
| Footer | Legacy Services target | Direct `/our-services/`; legacy rule itself remains protected. Contacts/social/Sitemap remain. |
| Home hero | Check Out Our Services; Contact Us | Explore Our Services → `#services`; Discuss Your Project → Contact. H1/video/poster unchanged. |
| Home offers | Digital Marketing, IT & AI, App, Web; generic Click Here | Four consistent offer names, outcome/capability summaries and descriptive actions; original information distributed among the four offers. |
| Home order | Company introduction before services | Brands → four offers → short company introduction. Ring imagery and Saudi/Vision 2030 context retained. Repeated inline service/location links removed here; directory and regional links remain elsewhere. |
| Home company introduction | Longer four-service recap | Two short Saudi-business/context paragraphs; About Nalk Solutions link. |
| Home features | Work That Speaks for Itself; Discover more | Solutions We Build; descriptive links to AI or Software. Same three capability titles, descriptions and images. No invented case-study claims. |
| Home benefits | Four clickable benefit cards | Existing benefits, copy and illustration remain; cards become explanatory rather than another service selector. |
| Home services/final CTA | Extra Got a bold idea action; two final actions | Remove the intermediate invitation; one final Discuss Your Project action. Existing final heading/copy retained. |
| Home credibility/FAQ | Approved testimonials, stats, FAQ | Text, claims, FAQ answers and structured data unchanged. No new statistics or evidence. |
| Services | Four categories plus 21 full-size cards | Four authored offer cards; compact contact invitation; four native, initially closed specialist groups. All 21 supporting destinations remain in raw HTML, including six regional links under Service areas. Closing promotional heading replaced by a project invitation. |
| Four offer introductions | Long captured hero paragraphs and varied CTA labels | Same H1; concise description/audience; Discuss Your Project and What's Included. Repetition compressed; all distinct industries/application/Saudi-market details retained in context or existing capability sections. |
| Four offer composition | Source order | Capabilities → evidence → local/application context → delivery → specialist links → regional/FAQ/closing sections. Every non-hero source element renders once; figures, tables, FAQs, process detail, imagery and useful source links remain. |
| Website technology stack | Eight identical Lorem ipsum paragraphs | Remove placeholder paragraphs; retain technology labels/icons and real surrounding information. |
| Offer closing actions | Source-specific Contact labels | Standard Discuss Your Project; direct existing Contact destination. |
| About introduction | Two longer positioning paragraphs | Two concise paragraphs covering Saudi businesses, local understanding, startup/enterprise clients, regional coverage and practical outcomes. |
| About services | Repeated three-service showcase/catalogue | One concise summary including performance, usability, UI/UX, SEO, paid ads and Google Business Profile optimization; Explore Our Services. Repeated showcase cards/media removed with that catalogue; founder, values, hero/values imagery and testimonials remain. |
| About semantics | Visible title H2; whole statement/founder paragraphs as H2 | Existing title becomes single H1. Vision/Mission labels stay headings; statement/founder prose becomes paragraphs. Distinct statement text retained, grouped in existing combined section. Founder name/signature content unchanged. |
| About ending | No consistent project invitation | Add Discuss Your Project. No profile/template evidence gains new prominence. |
| Blog | Categories mainly in shared dropdown | Four compact topic links, seven others in All Topics. Original taxonomy, membership, sequence, cards, queries and pagination unchanged. No banners inserted between rows. |
| Contact | Hero About promotion; wellness/appointment/form-prompt language | Existing visible Contact Us Online title becomes H1. Concise business-enquiry introduction and working KSA/PAK phone/email links come first. Remove competing About promotion; replace irrelevant copy. Locations, hours, map, imagery and disabled form remain; no response-time promise. |
| 21 specialists | Standalone search-entry pages | Parent-offer/Contact navigation outside preserved body, plus final project action. H1/body/breadcrumb/schema unchanged; no forced overview step. |
| 35 English articles | Body followed by adjacent/related navigation | One explicit relevant-offer bridge between them. Body/media/date/attribution/shares/anchors unchanged. Four Websites, eight Software, four AI, nineteen Marketing. Eight Arabic articles get no bridge. |
| Search | Title matches shown together | Preserve title/Arabic matches and noindex exclusion; add authored offer aliases, core-offer priority, six results initially and six per Show More. No new URL. |

## Authored ownership and link map

`src/content/journey/offers.ts` owns four offer identities, summaries, problems, specialist
membership/order, featured specialists, topics and the shared enquiry action. `pages.ts`
owns main navigation and core identities. `articles.ts` explicitly assigns all 35 English
articles; unknown future articles get no guessed recommendation. `company-content.ts`
and `service-content.ts` own editorial transforms/context; immutable recovery JSON is never edited.

Server compositions live in `src/components/journey/`. Supporting pages retain captured
renderers. Shared search consumes the pure journey matcher; no dependencies, publishing
cache, generic page builder or alternate application were added.

The legacy WordPress navigation register remains historical. The current four-offer map
does not change any old route disposition, canonical, metadata or indexing decision.

## Explicit article assignments

These are editorial recommendations, not category reassignment or inferred translation pairs.

| Article identity | Existing title | Offer |
| --- | --- | --- |
| `R-d1807ec5e0e664a2` | How to Choose a Web Design Company: 7 Checks (2026) | Websites & E-commerce |
| `R-027395e0b1f88c25` | Website Cost in Saudi Arabia 2026: Real SAR Price Guide | Websites & E-commerce |
| `R-6547eb8369d41431` | Nalk Solution Provides Best Web Development Services in Islamabad | Websites & E-commerce |
| `R-d2da8ebda8ecd96b` | Web Development and Digital Marketing: Saudi Guide | Websites & E-commerce |
| `R-2712c37e972510b2` | Custom Web App Development: The Complete 2026 Guide | Custom Software & Apps |
| `R-1763d6af248b2200` | How Custom Web Apps Help Scaling Pakistani Startups | Custom Software & Apps |
| `R-e8871af3f8742876` | How to Build a Web App from Scratch in 2026 | Custom Software & Apps |
| `R-fbbead80b209e23c` | How to Build an API from Scratch: Step-by-Step Guide | Custom Software & Apps |
| `R-0e1cd105cb263493` | How to Hire Developers for Startup in Saudi Arabia (2026) | Custom Software & Apps |
| `R-cc6ebeaad95c9e5e` | Nalk Solutions Builds Custom Web Applications in Islamabad | Custom Software & Apps |
| `R-4b3d1ae1a71cffa7` | Nalk Solution Offers Smart Business Portals in Islamabad | Custom Software & Apps |
| `R-26b412fd98c13a52` | Nalk Solution Delivers Advanced IT Solutions in Islamabad | Custom Software & Apps |
| `R-19289ea1a50ad37e` | AI Automation Cost in Saudi Arabia (2026 Guide) | AI & Automation |
| `R-b862c0c7f35eda96` | Process Automation Services Cost in Saudi Arabia: How Much & What You Save | AI & Automation |
| `R-25fee40374e2e31c` | Intelligent Business Process Automation for Saudi Enterprises | AI & Automation |
| `R-7d3b2394efb96d27` | What Is Intelligent Workflow Automation | AI & Automation |
| `R-15de724c087e16e9` | 12 Types of Digital Ads That Drive Sales (2026) | Digital Marketing |
| `R-2c613d2a5c1ee55a` | Ahrefs vs Semrush vs Screaming Frog: 2026 Buyer's Guide | Digital Marketing |
| `R-beb9a0ed5a4db3ce` | B2C Marketing Automation Software: 2026 Buyer's Guide | Digital Marketing |
| `R-5a4fb03e0d7b4c3b` | Best Digital Marketing Agency in Pakistan: Grow Your Brand | Digital Marketing |
| `R-dfd53bfc0f0ad146` | Best SEO Agencies in Saudi Arabia (2026): How to Compare Them | Digital Marketing |
| `R-c68b641619de5fdc` | Content Framework Template: Plan & Execute Fast 2026 | Digital Marketing |
| `R-4ffd91d75c597e33` | Content Marketing Ideas for Saudi Businesses in 2026 | Digital Marketing |
| `R-abdabc0cf23404d4` | Content Marketing Lead Gen: Fast Strategies That Work | Digital Marketing |
| `R-1479975e57602920` | 10 Digital Channel Strategy Secrets That Actually Work in 2026 | Digital Marketing |
| `R-29f69ff6b1371493` | Digital Marketing for Professional Services-2026 Guide | Digital Marketing |
| `R-9f96e046fe483053` | EDM Marketing for Saudi Businesses: A Practical KSA Guide | Digital Marketing |
| `R-93442368c6954c93` | Email Marketing Goals and Objectives: A 2026 Data-Backed Guide | Digital Marketing |
| `R-973785951f782140` | Finding the Best Digital Media Agency in Pakistan | Digital Marketing |
| `R-518ad560a778e4f8` | How can I improve local SEO for a business in Saudi Arabia? | Digital Marketing |
| `R-c417ce86b30e2d17` | Search Ads vs Display Ads: Which Wins in 2026? | Digital Marketing |
| `R-5bd4587bca0b3022` | Google Ads Cost in Saudi Arabia 2026: SAR 1.88 to 18.75 CPC | Digital Marketing |
| `R-4ed78f24068296e3` | Social Media Marketing Cost in Saudi Arabia (2026 Guide) | Digital Marketing |
| `R-cf30b9f0253b83a0` | What Is Virtual Marketing? 2026 Strategies, Backed by Data | Digital Marketing |
| `R-7b1c2739e262abe5` | How to Create Effective Promotional Videos (2026 Guide) | Digital Marketing |

## Evidence and acceptance

Before captures: `tmp/customer-journey/before-1792479555608/manifest.json`, 27 views and
54 screenshots of nine core pages across desktop/tablet/mobile; successful baseline.
The first development preview is diagnostic: 27 views/54 captures with no overflow, but
screenshot caret mutation raced hydration on the website page. It is retained as failed
evidence rather than a clean acceptance run. Final production previews are recorded at
`tmp/customer-journey/final-1792482367037/manifest.json` (54 screenshots) and
`tmp/customer-journey/narrow-1792482608071/manifest.json` (18 screenshots at 320px).
Both audits passed without console/resource errors or overflow. The before/after gallery
is `tmp/customer-journey/review/index.html`. The [phase record](../13-customer-journey.md)
owns engineering results, including failed/interrupted runs and their reconciliation.

Owner review should assess the clarity and copy of all nine pages, including each grouped
specialist directory and the distinct details retained below shorter offer introductions.
Automated checks cannot establish improved rankings, retention or conversion. These remain
post-launch outcomes; owner visual/content acceptance and all release gates stay separate.

## Final engineering result

The complete gate passes 1,350 tests with no failures, skipped cases or retries:
75 tooling, 37 unit, 233 HTTP and 1,005 browser cases.
The [phase record](../13-customer-journey.md) and `tmp/customer-journey/handoff.json`
identify the build, source/fixture revisions, exact reports and earlier reconciled failures.
Owner content/design approval remains pending for all nine review pages.
