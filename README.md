# PKHosting VPS Hosting - Assessment

A single static pricing page for an invented PKHosting VPS line. Plain HTML, CSS and JavaScript. No build step, no packages, no APIs, no deploy.

## How to open

1. Clone or unzip this repository.
2. Open `index.html` in a browser (double-click, or drag into Chrome / Firefox).
3. Optional local server (same files, useful for Lighthouse):

```bash
python3 -m http.server 8080
# then visit http://127.0.0.1:8080/
```

Works offline. Reloading keeps your billing period and currency via `localStorage`.

## What is included

| Path | Role |
| --- | --- |
| `index.html` | Page structure: hero, plans, comparison table, FAQ, footer |
| `styles.css` | Layout, responsive rules, focus styles |
| `script.js` | Period / currency updates, savings math, announcements |
| `NOTES.md` | Live pkhosting.com audit and payment trade-offs |
| `screenshots/` | 360 / 768 / 1440 viewport captures |
| `reports/` | Committed Lighthouse run |
| `tests/verify.cjs` | Offline checks for pricing math and HTML source requirements |
| `favicon.svg` | Tiny local favicon (no remote assets) |

## Pricing rules (checked in code)

- Monthly PKR: Starter 2,400 · Growth 4,800 · Scale 9,600 · Dedicated Core 19,500
- Annual: charge 10 months for 12 → per-month shown = `(monthly × 10) / 12` (Growth → Rs 4,000)
- Annual cards also show annual total and a savings badge computed in JS
- Fixed rates: `1 USD = 278.50 PKR`, `1 GBP = 355.00 PKR`
- PKR: whole numbers · USD/GBP: two decimals
- Monthly PKR figures and the full comparison table live in the HTML source (not script-injected)

## Browsers / viewports tested

- Chrome (Chromium) and Firefox
- Widths: 360, 768, 1440
- Keyboard tab order, visible focus, FAQ expand/collapse
- JavaScript disabled: monthly PKR cards + full table remain
- Offline / no external requests
- Zoom 200%
- Table scrolls inside its own container; page itself does not scroll horizontally

## Decisions and trade-offs

- Progressive enhancement: controls enhance the page; they do not own the content.
- System / UI fonts only - no webfont downloads.
- Payment methods as text chips (see `NOTES.md`); no remote logos.
- `aria-live` status region announces price changes after period or currency changes.
- Savings and annual totals are never hard-typed in the annual UI state - they are calculated.

## Verification

```bash
node tests/verify.cjs
```

Screenshots: `screenshots/pricing-360.png`, `screenshots/pricing-768.png`, `screenshots/pricing-1440.png`  
Lighthouse: `reports/lighthouse.report.html` (and `.report.json` beside it)

## What is unfinished

- No real checkout, provisioning, or CMS.
- Currency rates are assessment-fixed, not live FX.
- No automated visual regression beyond screenshots and the Node verify script.
- Dedicated Core naming is conceptual; specs are invented for the brief.

## Time taken

About 5 hours of focused work (layout, pricing logic, a11y, audit notes, screenshots / Lighthouse, docs).

## AI assistant disclosure

Yes - I used Cursor’s AI coding assistant while building and reviewing this page. I directed the structure, pricing rules, accessibility requirements, and documentation; I reviewed and can explain every file in a follow-up call.
