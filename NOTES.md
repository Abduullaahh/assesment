# Notes from the live PKHosting pricing section

Reviewed publicly at [pkhosting.com](https://www.pkhosting.com/), [pkhosting.com/pricing](https://www.pkhosting.com/pricing/), and [pkhosting.com/vps](https://www.pkhosting.com/vps/) while building this assessment page. Nothing here is a critique of their production stack - only product and UX takeaways that shaped this VPS concept page.

## Six observations

1. **Top-bar currency chip (`🇵🇰 PKR`)**  
   Currency lives in the global chrome, not next to the plan cards. Consequence: shoppers can change currency before they reach pricing, which is strong for a multi-currency business, but a dedicated VPS landing page benefits from putting the selector beside the billing toggle so the price they are staring at updates in the same visual region.

2. **Monthly / Annually segmented control with “Save up to N%”**  
   The live toggle advertises a percentage savings ceiling rather than a cash amount. Consequence: the marketing line is sticky, but buyers still have to reverse-engineer what they save on a specific plan. This page computes a real savings badge from `(monthly × 2)` and shows the annual total on each card.

3. **“Most Popular” / “Best Value” badges on cards**  
   Popularity is labelled on the card itself (and again in the comparison table on shared hosting). Consequence: the badge works as a decision shortcut. I kept a single “Most popular” mark on Growth and repeated a small “Popular” hint in the comparison table so the recommendation survives when cards stack on a phone.

4. **“Renews at the same price - never the crossed-out one” line under each card**  
   They call out renewal honesty explicitly. Consequence: Pakistani buyers are wary of bait-and-switch hosting renewals; a VPS concept page should keep billing language plain. Annual cards here show the effective monthly rate *and* the billed annual total so there is no crossed-out decoy number.

5. **Wide VPS catalogue (many Cloud / Premium tiers)**  
   The live VPS grid is long - useful for power users, heavy for a first decision. Consequence: for this invented line I collapsed choice into four clearly stepped plans so a comparison table of ten rows stays scannable at 360px without forcing the whole page to scroll sideways.

6. **Footer payment strip as remote SVG icons**  
   The homepage footer currently renders payment trust via `/payments/*.svg` images (`Stripe`, `PayPal`, `JazzCash`, `Easypaisa`, `Bank account`). Consequence: logos look polished online, but they fail an offline / zero-external-request brief and can be opaque to screen readers when alt text is the only label. This page uses plain text chips instead.

## Trade-offs

### State persistence

Period and currency are stored in `localStorage` under `pkhosting-vps-pricing` as `{ period, currency }`. On load, invalid or missing values fall back to monthly PKR. If storage throws (private mode / `file://` quirks), pricing still works for the session; only the reload memory is lost. That matches the brief (“survive a reload”) without blocking the page when storage is unavailable.

### Payment methods - what I kept and what I cut

Live footer icons observed: **Stripe, PayPal, JazzCash, Easypaisa, Bank account** (five). Older public payment copy also described **credit/debit cards**, **bank transfer/deposit**, and **cash at the Lahore office**. The brief referenced eight methods; treating Stripe as the card gateway, Visa and Mastercard as the card brands shoppers recognise, plus PayPal, JazzCash, Easypaisa, bank transfer, and office cash gets you to eight logical options.

**Kept (six text labels):**

| Method | Why |
| --- | --- |
| Visa | Card brand buyers look for; covers Stripe-backed checkout without a branded logo. |
| Mastercard | Same as Visa for local and international cards. |
| Bank transfer | Dominant for higher-ticket VPS invoices in Pakistan. |
| Easypaisa | High local wallet reach; already on the live footer. |
| JazzCash | Second major wallet; already on the live footer. |
| PayPal | Useful for diaspora / USD–GBP billed customers. |

**Cut (and why):**

| Method | Why cut |
| --- | --- |
| Stripe (brand) | Redundant once Visa/Mastercard are listed; Stripe is the processor, not what a Pakistani buyer asks for. |
| Cash deposit at office | Offline-only, Lahore-centric, and a poor fit for a VPS product that can be provisioned remotely. Keeps the footer honest for national buyers. |

No hotlinked logos - text chips only, so the page stays offline and under the size budget.
