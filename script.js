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

  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let ticking = false;

    const syncHeader = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(syncHeader);
    };

    syncHeader();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    const items = [...accordion.querySelectorAll('.faq-item')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const openItem = (item) => {
      item.open = true;
      window.requestAnimationFrame(() => {
        item.classList.add('is-open');
      });
    };

    const closeItem = (item) => {
      const panel = item.querySelector('.faq-panel');
      item.classList.remove('is-open');

      if (reduceMotion || !panel) {
        item.open = false;
        return;
      }

      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        item.open = false;
        panel.removeEventListener('transitionend', onEnd);
      };

      const onEnd = (event) => {
        if (event.target === panel && event.propertyName === 'grid-template-rows') {
          finish();
        }
      };

      panel.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, 400);
    };

    items.forEach((item) => {
      if (item.hasAttribute('open')) {
        item.classList.add('is-open');
      }

      const summary = item.querySelector('summary');
      if (!summary) {
        return;
      }

      summary.addEventListener('click', (event) => {
        event.preventDefault();
        const willOpen = !item.classList.contains('is-open');

        items.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            closeItem(other);
          }
        });

        if (willOpen) {
          openItem(item);
        } else {
          closeItem(item);
        }
      });
    });
  }

  // Expose deterministic helpers for the small offline verification script.
  window.PKHostingPricing = Object.freeze({
    calculatePrice,
    formatAmount,
    rates: RATES
  });
})();
