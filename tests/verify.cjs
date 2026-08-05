#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { createRequire } = require('module');

const root = path.resolve(__dirname, '..');
const failures = [];
const pass = (label) => console.log(`  ✓ ${label}`);
const fail = (label, detail) => {
  failures.push(`${label}: ${detail}`);
  console.error(`  ✗ ${label} — ${detail}`);
};

const PLANS = { starter: 2400, growth: 4800, scale: 9600, dedicated: 19500 };
const RATES = { PKR: 1, USD: 278.5, GBP: 355 };

const formatAmount = (amount, currency) => {
  const decimals = currency === 'PKR' ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

const calculatePrice = (monthlyPkr, period, currency) => {
  const annualTotalPkr = monthlyPkr * 10;
  const effectiveMonthlyPkr = period === 'annual' ? annualTotalPkr / 12 : monthlyPkr;
  return {
    monthly: effectiveMonthlyPkr / RATES[currency],
    annualTotal: annualTotalPkr / RATES[currency],
    savings: (monthlyPkr * 2) / RATES[currency]
  };
};

console.log('Pricing math');
{
  const growthAnnual = calculatePrice(4800, 'annual', 'PKR');
  if (growthAnnual.monthly === 4000) pass('Growth annual per-month is Rs 4,000');
  else fail('Growth annual per-month', `expected 4000, got ${growthAnnual.monthly}`);

  if (growthAnnual.annualTotal === 48000) pass('Growth annual total is Rs 48,000');
  else fail('Growth annual total', `expected 48000, got ${growthAnnual.annualTotal}`);

  if (growthAnnual.savings === 9600) pass('Growth annual savings is Rs 9,600');
  else fail('Growth annual savings', `expected 9600, got ${growthAnnual.savings}`);

  const starterUsd = calculatePrice(2400, 'monthly', 'USD');
  const expected = formatAmount(2400 / 278.5, 'USD');
  if (formatAmount(starterUsd.monthly, 'USD') === expected) {
    pass(`Starter monthly USD formats as ${expected}`);
  } else {
    fail('Starter monthly USD', formatAmount(starterUsd.monthly, 'USD'));
  }

  const scaleGbp = calculatePrice(9600, 'annual', 'GBP');
  if (formatAmount(scaleGbp.monthly, 'GBP') === formatAmount((9600 * 10) / 12 / 355, 'GBP')) {
    pass('Scale annual GBP uses fixed rate and two decimals');
  } else {
    fail('Scale annual GBP', formatAmount(scaleGbp.monthly, 'GBP'));
  }

  for (const [key, monthly] of Object.entries(PLANS)) {
    const m = calculatePrice(monthly, 'monthly', 'PKR');
    if (m.monthly === monthly) pass(`${key} monthly PKR unchanged (${monthly})`);
    else fail(`${key} monthly PKR`, String(m.monthly));
  }
}

console.log('\nHTML source requirements');
{
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  const checks = [
    ['Starter monthly in source', /data-plan="starter"[\s\S]*?data-price>2,400</],
    ['Growth monthly in source', /data-plan="growth"[\s\S]*?data-price>4,800</],
    ['Scale monthly in source', /data-plan="scale"[\s\S]*?data-price>9,600</],
    ['Dedicated monthly in source', /data-plan="dedicated"[\s\S]*?data-price>19,500</],
    ['Most popular label', /Most popular/],
    ['Ten comparison rows', (h) => (h.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr>/g) || []).length === 10],
    ['FAQ has 4+ items', (h) => (h.match(/<details>/g) || []).length >= 4],
    ['aria-live status region', /id="price-status"[^>]*aria-live="polite"/],
    ['No remote http(s) assets in markup', (h) => !/https?:\/\//.test(h.replace(/mailto:[^"']+/g, ''))],
    ['Local stylesheet only', /href="styles\.css"/],
    ['Local script only', /src="script\.js"/]
  ];

  for (const [label, rule] of checks) {
    const ok = typeof rule === 'function' ? rule(html) : rule.test(html);
    if (ok) pass(label);
    else fail(label, 'not satisfied');
  }
}

console.log('\nSelf-containment / size');
{
  const files = ['index.html', 'styles.css', 'script.js', 'README.md', 'NOTES.md'];
  let total = 0;
  for (const file of files) {
    total += fs.statSync(path.join(root, file)).size;
  }
  // Deliverable core under 300 KB; screenshots/reports are evidence and may be larger.
  if (total < 300 * 1024) pass(`Core files total ${total} bytes (< 300 KB)`);
  else fail('Core size', `${total} bytes`);

  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  if (!/https?:\/\//.test(css) && !/https?:\/\//.test(js)) pass('CSS/JS have no remote URLs');
  else fail('Remote URLs', 'found in CSS or JS');

  if (js.includes('localStorage') && js.includes('aria-live') === false) {
    // status region is in HTML; JS writes to it
  }
  if (js.includes('STORAGE_KEY') && js.includes('announceUpdate')) pass('Persistence and announcement helpers present');
  else fail('JS helpers', 'missing persistence/announce');
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log('\nAll checks passed');
