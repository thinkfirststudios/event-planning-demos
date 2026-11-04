/* Quillon & Crane, fictional demo (ThinkFirst Studios) · v2
   No tracking, no analytics, no network requests, no count-up, no countdown, no scarcity styling.
   The availability states are written into the page; nothing is fetched or stored. Forms send nothing. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* condensing nav */
  var nav = $('[data-nav]');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-condensed', window.scrollY > 160); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    var tog = $('[data-nav-toggle]', nav);
    if (tog) {
      tog.addEventListener('click', function () {
        var open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        tog.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); tog.setAttribute('aria-expanded', 'false'); tog.focus(); }
      });
    }
  }

  /* availability: select a month, reflect to URL, pre-fill any month select */
  var STATE = {
    open: 'Open. Saturdays are free to book.',
    limited: 'Limited. Fridays and Sundays only; Saturdays are booked.',
    held: 'Held. Another couple has a seven-day hold on the last Saturday. Ask and we will tell you when it clears.',
    closed: 'Closed. This month is fully booked. You can join the waiting list.'
  };
  var cells = $$('button.mcell');
  var status = $('[data-avail-status]');
  var selects = $$('select[name="month"]');
  var formOnPage = !!$('form[data-enquiry]');

  function pick(key, fromUser) {
    var hit = null;
    cells.forEach(function (c) { var on = c.getAttribute('data-month') === key; c.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) hit = c; });
    selects.forEach(function (s) { if ($('option[value="' + key + '"]', s)) s.value = key; });
    if (fromUser && history.replaceState) {
      var u = new URL(location.href); u.searchParams.set('month', key);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
    if (!hit || !status) return;
    var name = hit.getAttribute('data-label');
    var st = hit.getAttribute('data-state');
    var link = formOnPage
      ? '<a href="#enquire">Carried into the form below. Book a consultation ↓</a>'
      : '<a class="btn btn--primary" href="enquire.html?month=' + encodeURIComponent(key) + '">Book a consultation for ' + name + '</a>';
    status.innerHTML = '<p><strong>' + name + '</strong>: ' + STATE[st] + '</p><p>' + link + '</p>';
  }
  cells.forEach(function (c) { c.addEventListener('click', function () { pick(c.getAttribute('data-month'), true); }); });
  var q = new URLSearchParams(location.search).get('month');
  if (q && /^20\d\d-\d\d$/.test(q)) pick(q, false);
  var qp = new URLSearchParams(location.search).get('package'), ps = $('select[name="package"]');
  if (qp && ps && $('option[value="' + qp.replace(/[^a-z-]/g, '') + '"]', ps)) ps.value = qp;

  /* forms: demo only. Validate, then show the success panel. Nothing is sent. */
  $$('form[data-enquiry], form[data-quick]').forEach(function (form) {
    var err = $('[data-form-err]', form);
    var ok = form.nextElementSibling && form.nextElementSibling.hasAttribute('data-success') ? form.nextElementSibling : null;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      $$('[aria-invalid]', form).forEach(function (f) { f.removeAttribute('aria-invalid'); });
      var bad = $$('[required]', form).filter(function (f) {
        if (f.type === 'checkbox') return !f.checked;
        return !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      });
      var date = $('input[name="date"]', form), month = $('select[name="month"]', form);
      var needDate = form.hasAttribute('data-enquiry') && date && month && !date.value && !month.value;
      if (needDate) { bad.push(month); }
      bad.forEach(function (f) { f.setAttribute('aria-invalid', 'true'); });
      if (bad.length) {
        var names = bad.map(function (f) { var l = $('label[for="' + f.id + '"]', form); return l ? l.textContent.replace(/\(optional\)/, '').trim() : f.name; });
        if (err) err.textContent = 'Please add: ' + names.join(', ') + '.';
        bad[0].focus();
        return;
      }
      if (err) err.textContent = '';
      if (ok) { form.hidden = true; ok.hidden = false; ok.focus(); }
    });
  });

  /* gallery filter by setting */
  var chips = $$('[data-filter]');
  if (chips.length) {
    var items = $$('[data-setting]'), fs = $('[data-filter-status]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter'), n = 0;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        items.forEach(function (it) { var show = f === 'all' || it.getAttribute('data-setting') === f; it.hidden = !show; if (show) n++; });
        if (fs) fs.textContent = 'Showing ' + n + ' photographs.';
      });
    });
  }

  /* reveals: a 14px rise and fade, staggered within each group; off under reduced motion */
  if (reduce || !('IntersectionObserver' in window)) return;
  var targets = $$('[data-reveal] > *');
  targets.forEach(function (t, i) { t.classList.add('reveal'); t.style.transitionDelay = ((Array.prototype.indexOf.call(t.parentNode.children, t) % 6) * 80) + 'ms'; });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  targets.forEach(function (t) { io.observe(t); });
})();
