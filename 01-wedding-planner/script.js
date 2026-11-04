/* Quillon & Crane, fictional demo (ThinkFirst Studios).
   No tracking, no analytics, no network requests, no count-up, no countdown, no scarcity styling.
   The availability grid shows the states written into the page; nothing is fetched or stored. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- condensing header: 88px -> 56px past 140px ---------- */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-condensed', reduce || window.scrollY > 140); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile menu ---------- */
  var menu = $('[data-menu]'), openBtn = $('[data-menu-open]'), closeBtn = $('[data-menu-close]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { closeBtn.focus(); } else { openBtn.focus(); }
  }
  if (menu && openBtn) {
    openBtn.addEventListener('click', function () { setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.hidden = true; document.body.style.overflow = ''; openBtn.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- availability grid ---------- */
  var LONG = { open: '[OPEN]', limited: '[LIMITED — CONFIRM WHAT THIS MEANS]', held: '[HELD — CONFIRM]', closed: '[CLOSED]' };
  var grids = $$('[data-avail-grid]');
  var allCells = $$('.mcell', document);

  // Hero row: the next four months, cloned from the full grid (wraps into the following year if present).
  var row = $('[data-avail-row]');
  if (row && grids.length) {
    var src = $$('.mcell', grids[0]);
    var start = new Date().getMonth();
    for (var i = 0; i < 4; i++) {
      var c = src[(start + i) % 12];
      if (!c) continue;
      var li = document.createElement('li');
      var b = c.cloneNode(true);
      b.setAttribute('aria-pressed', 'false');
      li.appendChild(b);
      row.appendChild(li);
    }
    allCells = $$('.mcell', document);
  }

  // Honest empty state: if every month in a grid is closed, say so in one plain line.
  grids.forEach(function (g) {
    var cells = $$('.mcell', g);
    var allClosed = cells.length && cells.every(function (c) { return c.getAttribute('data-state') === 'closed'; });
    var empty = g.nextElementSibling;
    if (empty && empty.hasAttribute('data-avail-empty')) empty.hidden = !allClosed;
  });

  var status = $('[data-avail-status]');
  var formOnPage = status && status.getAttribute('data-form-on-page') === '1';
  var monthSelects = $$('[data-month-select]');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  function selectMonth(key, fromUser) {
    var any = null;
    allCells.forEach(function (c) {
      var on = c.getAttribute('data-month') === key;
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && !any) any = c;
    });
    monthSelects.forEach(function (s) { if ($('option[value="' + key + '"]', s)) s.value = key; });
    if (!any) return;
    var state = any.getAttribute('data-state');
    var label = any.getAttribute('data-mname') + ' [' + any.getAttribute('data-ylabel') + ']';
    if (fromUser && window.history && history.replaceState) {
      var u = new URL(window.location.href);
      u.searchParams.set('month', key);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
    if (status) {
      var html = '<p><strong>' + esc(label) + '</strong> — <span class="ph">' + esc(LONG[state]) + '</span></p>';
      if (state === 'closed') {
        html += '<p>This month is not taking further weddings. Ask about the waiting list, <span class="ph">[WAITING LIST — CONFIRM POLICY]</span>, or choose another month.</p>';
      }
      if (formOnPage) {
        html += '<p>Carried into the enquiry form below. <a href="#enquire">Book a consultation ↓</a></p>';
      } else {
        html += '<p><a class="btn btn--primary" href="enquire.html?month=' + encodeURIComponent(key) + '">Book a consultation for ' + esc(any.getAttribute('data-mname')) + '</a></p>';
      }
      status.innerHTML = html;
    }
  }

  allCells.forEach(function (c) {
    c.addEventListener('click', function () { selectMonth(c.getAttribute('data-month'), true); });
  });

  // Arriving with ?month=y0-sep: pre-select the cell and pre-fill the form.
  var qMonth = new URLSearchParams(window.location.search).get('month');
  if (qMonth && /^y[01]-[a-z]{3}$/.test(qMonth)) selectMonth(qMonth, false);

  /* ---------- forms: demo only, nothing is sent ---------- */
  function wire(form) {
    var err = $('[data-form-err]', form);
    var success = form.nextElementSibling && form.nextElementSibling.hasAttribute('data-success') ? form.nextElementSibling : null;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('[required]', form).filter(function (f) { return !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)); });
      var date = $('input[name="date"]', form), month = $('select[name="month"]', form);
      var needDate = form.hasAttribute('data-enquiry') && date && month && !date.value && !month.value;
      $$('[aria-invalid]', form).forEach(function (f) { f.removeAttribute('aria-invalid'); });
      bad.forEach(function (f) { f.setAttribute('aria-invalid', 'true'); });
      if (needDate) { date.setAttribute('aria-invalid', 'true'); month.setAttribute('aria-invalid', 'true'); }
      if (bad.length || needDate) {
        var names = bad.map(function (f) { var l = $('label[for="' + f.id + '"]', form); return l ? l.textContent.replace(/\(optional\)/, '').trim() : f.name; });
        if (needDate) names.push('a wedding date or a month');
        if (err) err.textContent = 'Please add: ' + names.join(', ') + '.';
        (bad[0] || date).focus();
        return;
      }
      if (err) err.textContent = '';
      if (success) { form.hidden = true; success.hidden = false; success.focus(); }
    });
  }
  $$('form[data-enquiry], form[data-quick]').forEach(wire);

  /* ---------- gallery filter by setting ---------- */
  var chips = $$('[data-filter]');
  if (chips.length) {
    var items = $$('.book__item'), fs = $('[data-filter-status]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter'), n = 0;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        items.forEach(function (it) { var show = f === 'all' || it.getAttribute('data-setting') === f; it.hidden = !show; if (show) n++; });
        if (fs) fs.textContent = 'Showing ' + n + ' plates.';
      });
    });
  }

  /* ---------- sticky mobile bar: slides up once the hero leaves the viewport ---------- */
  var mbar = $('[data-mbar]'), hero = $('[data-hero]');
  if (mbar) {
    if (!hero || reduce || !('IntersectionObserver' in window)) { mbar.classList.add('is-on'); }
    else {
      new IntersectionObserver(function (es) { es.forEach(function (e) { mbar.classList.toggle('is-on', !e.isIntersecting); }); }, { threshold: 0 }).observe(hero);
    }
  }

  /* ---------- reveals: a page turning. 10px rise + fade, 70ms stagger; caption rails draw once ---------- */
  if (reduce || !('IntersectionObserver' in window)) return;
  var groups = $$('.band .wrap');
  var targets = [];
  groups.forEach(function (g) {
    var kids = $$(':scope > *', g).filter(function (k) { return !k.classList.contains('visually-hidden'); });
    kids.forEach(function (k, i) {
      if (k.querySelector('.plate') || k.classList.contains('plate')) {
        // plate groups: stagger the plates themselves
        var plates = k.classList.contains('plate') ? [k] : $$('.plate', k);
        plates.forEach(function (p, j) { p.classList.add('reveal', 'reveal-plate'); p.style.transitionDelay = (j * 70) + 'ms'; targets.push(p); });
      } else {
        k.classList.add('reveal'); k.style.transitionDelay = (Math.min(i, 6) * 70) + 'ms'; targets.push(k);
      }
    });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in', 'is-drawn');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  targets.forEach(function (t) { io.observe(t); });
})();
