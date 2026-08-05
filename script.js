(() => {
  'use strict';

  const PLANS = Object.freeze({
    starter: 2400,
    growth: 4800,
    scale: 9600,
    dedicated: 19500
  });

  const RATES = Object.freeze({
    PKR: 1,
    USD: 278.5,
    GBP: 355
  });

  const SYMBOLS = Object.freeze({
    PKR: 'Rs',
    USD: '$',
    GBP: '£'
  });

  const STORAGE_KEY = 'pkhosting-vps-pricing';
  const DEFAULT_STATE = Object.freeze({ period: 'monthly', currency: 'PKR' });

  const formatAmount = (amount, currency) => {
    const decimals = currency === 'PKR' ? 0 : 2;

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  };

  const convertFromPkr = (amount, currency) => amount / RATES[currency];

  const calculatePrice = (monthlyPkr, period, currency) => {
    const annualTotalPkr = monthlyPkr * 10;
    const effectiveMonthlyPkr = period === 'annual'
      ? annualTotalPkr / 12
      : monthlyPkr;

    return {
      monthly: convertFromPkr(effectiveMonthlyPkr, currency),
      annualTotal: convertFromPkr(annualTotalPkr, currency),
      savings: convertFromPkr(monthlyPkr * 2, currency)
    };
  };

  const isValidState = (state) => (
    state &&
    ['monthly', 'annual'].includes(state.period) &&
    Object.hasOwn(RATES, state.currency)
  );

  const loadState = () => {
    try {
      const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return isValidState(savedState) ? savedState : { ...DEFAULT_STATE };
    } catch {
      return { ...DEFAULT_STATE };
    }
  };

  const saveState = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Pricing still works when storage is unavailable (for example, strict file privacy settings).
    }
  };

  const cards = [...document.querySelectorAll('[data-plan]')];
  const periodControls = [...document.querySelectorAll('input[name="period"]')];
  const currencyControl = document.querySelector('#currency');
  const status = document.querySelector('#price-status');

  if (!cards.length || !periodControls.length || !currencyControl || !status) {
    return;
  }

  let state = loadState();

  const updateCard = (card) => {
    const planKey = card.dataset.plan;
    const monthlyPkr = PLANS[planKey];
    const values = calculatePrice(monthlyPkr, state.period, state.currency);
    const symbol = SYMBOLS[state.currency];

    card.querySelector('.currency-symbol').textContent = symbol;
    card.querySelector('[data-price]').textContent = formatAmount(values.monthly, state.currency);

    const detail = card.querySelector('[data-billing-detail]');
    const savings = card.querySelector('[data-savings]');

    if (state.period === 'annual') {
      detail.textContent = `Billed annually at ${symbol} ${formatAmount(values.annualTotal, state.currency)}`;
      savings.textContent = `Save ${symbol} ${formatAmount(values.savings, state.currency)}`;
      savings.hidden = false;
    } else {
      detail.textContent = 'Pay monthly';
      savings.textContent = '';
      savings.hidden = true;
    }
  };

  const announceUpdate = () => {
    const growth = calculatePrice(PLANS.growth, state.period, state.currency);
    const periodLabel = state.period === 'annual' ? 'annual billing' : 'monthly billing';

    status.textContent = `Prices updated to ${periodLabel} in ${state.currency}. Growth is ${SYMBOLS[state.currency]} ${formatAmount(growth.monthly, state.currency)} per month.`;
  };

  const render = ({ announce = true } = {}) => {
    cards.forEach(updateCard);
    periodControls.forEach((control) => {
      control.checked = control.value === state.period;
    });
    currencyControl.value = state.currency;
    saveState(state);

    if (announce) {
      announceUpdate();
    }
  };

  periodControls.forEach((control) => {
    control.addEventListener('change', (event) => {
      if (!event.target.checked) {
        return;
      }

      state = { ...state, period: event.target.value };
      render();
    });
  });

  currencyControl.addEventListener('change', (event) => {
    state = { ...state, currency: event.target.value };
    render();
  });

  render({ announce: false });

  // Expose deterministic helpers for the small offline verification script.
  window.PKHostingPricing = Object.freeze({
    calculatePrice,
    formatAmount,
    rates: RATES
  });
})();
