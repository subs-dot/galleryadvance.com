/* Gallery Advance — site scripts */
(() => {
  'use strict';

  const EMAIL = 'admin@galleryadvance.com';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = n => '$' + Math.round(n).toLocaleString('en-US');

  /* Build a mailto: link with a subject and a pre-filled body */
  const mailto = (subject, lines) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;
  const intro = ['Hi Gallery Advance,', '', "I'd like to learn more about funding for my business.", ''];
  const outro = ['Best phone number: ', '', 'Thank you'];

  /* "Email us" buttons open an email with a short template to fill in */
  $$('[data-mail]').forEach(a => {
    a.href = mailto('Funding inquiry', [
      ...intro,
      'Business name: ',
      'Industry: ',
      'Time in business: ',
      'Average monthly revenue: ',
      'Amount needed: ',
      ...outro
    ]);
  });

  /* Year in footer */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* Mobile nav */
  const menuBtn = $('.menu-btn');
  const nav = $('#nav');
  if (menuBtn && nav) {
    const setOpen = open => {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
    };
    menuBtn.addEventListener('click', () => setOpen(menuBtn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  /* Header border on scroll */
  const header = $('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Advance estimator ---------------- */
  const rev = $('#rev');
  if (rev) {
    const tib = $('#tib');
    const out = $('#revOut');
    const label = $('#calcLabel');
    const range = $('#calcRange');
    const cta = $('#calcCta');
    // Low/high multiples of monthly revenue, by time in business. Illustrative only.
    const MULT = { '6-12': [0.5, 0.9], '1-2': [0.6, 1.1], '2-5': [0.75, 1.3], '5+': [0.85, 1.5] };
    const MIN = 10000, MAX = 3000000;
    const round = n => Math.round(n / 1000) * 1000;

    // The slider runs 0-100 on a logarithmic scale: $15K at the left, $2M+ at the right,
    // so small and very large businesses both get fine control.
    const REV_MIN = 15000, REV_MAX = 2000000;
    const revenueAt = pos => {
      const raw = REV_MIN * Math.pow(REV_MAX / REV_MIN, pos / 100);
      const step = raw < 100000 ? 5000 : raw < 1000000 ? 25000 : 50000;
      return Math.round(raw / step) * step;
    };

    const update = () => {
      const pos = Number(rev.value);
      const r = revenueAt(pos);
      rev.style.setProperty('--fill', pos + '%');
      out.textContent = money(r) + (pos >= Number(rev.max) ? '+' : '');
      rev.setAttribute('aria-valuetext', out.textContent + ' per month');

      const t = tib.value;
      const tibText = tib.options[tib.selectedIndex].text;
      let estimate = '';
      if (!MULT[t]) {
        label.textContent = 'Under 6 months in business';
        range.textContent = 'Email us to discuss options';
      } else {
        const lo = Math.min(MAX, Math.max(MIN, round(r * MULT[t][0])));
        const hi = Math.min(MAX, Math.max(lo, round(r * MULT[t][1])));
        estimate = lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`;
        label.textContent = 'Estimated advance range';
        range.textContent = estimate;
      }

      cta.href = mailto('Funding inquiry', [
        ...intro,
        'Business name: ',
        'Industry: ',
        `Time in business: ${tibText}`,
        `Average monthly revenue: ${out.textContent}`,
        ...(estimate ? [`Website estimate: ${estimate}`] : []),
        'Amount needed: ',
        ...outro
      ]);
    };
    rev.addEventListener('input', update);
    tib.addEventListener('change', update);
    update();
  }
})();
