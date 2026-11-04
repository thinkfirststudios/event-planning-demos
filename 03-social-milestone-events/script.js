/* Pennant Event Co. (demo 03) v2. Hand-written.
   Occasion board (ARIA radio group) repaints the page; add-on tray and estimate;
   selections travel between pages in the URL hash (#o=...&t=...&g=...&a=id:qty,...). Nothing is stored. */
(function () {
  'use strict';
  var doc = document, PN = window.PN;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OCC = {}; PN.occ.forEach(function (o) { OCC[o.id] = o; });
  var AO = {}; PN.addons.forEach(function (a) { AO[a.id] = a; });
  var page = doc.body.getAttribute('data-page');
  var state = { o: PN.occ[0].id, t: 0, g: 60, a: {} };
  var H0 = location.hash;

  function money(n) {
    var r = Math.round(n * 100) / 100;
    return '$' + (r % 1 === 0 ? r.toLocaleString('en-US') : r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- hash state */
  function readHash() {
    var h = location.hash.replace(/^#/, '');
    h.split('&').forEach(function (kv) {
      var p = kv.split('='), k = p[0], v = decodeURIComponent(p[1] || '');
      if (k === 'o' && OCC[v]) state.o = v;
      if (k === 't') state.t = v === 'none' ? 'none' : Math.max(0, Math.min(2, parseInt(v, 10) || 0));
      if (k === 'g') state.g = Math.max(1, Math.min(400, parseInt(v, 10) || 60));
      if (k === 'a' && v) v.split(',').forEach(function (x) {
        var q = x.split(':'); if (AO[q[0]]) state.a[q[0]] = Math.max(0, parseInt(q[1], 10) || 0);
      });
    });
  }
  function serial(full) {
    var s = 'o=' + state.o;
    if (full) {
      var a = Object.keys(state.a).filter(function (k) { return state.a[k] > 0; }).map(function (k) { return k + ':' + state.a[k]; }).join(',');
      s += '&t=' + state.t + '&g=' + state.g + (a ? '&a=' + a : '');
    }
    return s;
  }
  function writeHash() {
    var full = page === 'add-ons';
    if (history.replaceState) history.replaceState(null, '', '#' + serial(full));
    $$('[data-bind-href]').forEach(function (a) { a.href = a.getAttribute('data-bind-href') + '#' + serial(full || /quote|add-ons/.test(a.getAttribute('data-bind-href')) && page === 'add-ons'); });
    var q = $('[data-est-quote]'); if (q) q.href = 'quote.html#' + serial(true);
  }
  function say(msg) { var el = $('#announce'); if (!el) return; el.textContent = ''; setTimeout(function () { el.textContent = msg; }, 40); }

  function repaint(el, fn) {
    if (reduce || !el) { fn(); return; }
    el.style.minHeight = el.offsetHeight + 'px';
    el.classList.add('is-fading');
    setTimeout(function () { fn(); el.classList.remove('is-fading'); setTimeout(function () { el.style.minHeight = ''; }, 220); }, 200);
  }

  /* ---------- board */
  function setChecked(id) {
    $$('[data-occgroup] [role="radio"]').forEach(function (r) {
      var on = r.getAttribute('data-occ') === id;
      r.setAttribute('aria-checked', on ? 'true' : 'false');
      r.tabIndex = on ? 0 : -1;
    });
  }
  $$('[data-occgroup]').forEach(function (g) {
    var radios = $$('[role="radio"]', g);
    radios.forEach(function (r, i) {
      r.addEventListener('click', function () { setOcc(r.getAttribute('data-occ')); });
      r.addEventListener('keydown', function (ev) {
        var k = ev.key, n = radios.length, j = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n;
        if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + n) % n;
        if (k === 'Home') j = 0; if (k === 'End') j = n - 1;
        if (k === ' ' || k === 'Enter') { ev.preventDefault(); setOcc(r.getAttribute('data-occ')); return; }
        if (j !== null) { ev.preventDefault(); radios[j].focus(); setOcc(radios[j].getAttribute('data-occ')); }
      });
    });
  });

  function setOcc(id, first) {
    var o = OCC[id]; if (!o) return;
    var changed = state.o !== id; state.o = id;
    setChecked(id);
    var apply = function () {
      $$('[data-bind="name"]').forEach(function (e) { e.textContent = o.name; });
      $$('[data-bind="lc"]').forEach(function (e) { e.textContent = o.name.toLowerCase(); });
      $$('[data-bind="band"]').forEach(function (e) { e.textContent = o.band; });
      $$('[data-bind="note"]').forEach(function (e) { e.textContent = o.note; });
      $$('[data-bind="desc"]').forEach(function (e) { e.textContent = o.desc; });
      $$('[data-bind="guests"]').forEach(function (e) { e.textContent = o.guests; });
      $$('[data-bind="price"]').forEach(function (e) { e.textContent = money(o.prices[0]); });
      $$('[data-bind-list="plan"]').forEach(function (e) { e.innerHTML = o.plan.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); });
      $$('[data-tier-price]').forEach(function (e) { e.textContent = money(o.prices[+e.getAttribute('data-tier-price')]); });
    };
    var panels = $$('[data-repaint]');
    if (first || !changed) apply(); else { panels.forEach(function (p, i) { repaint(p, i === 0 ? apply : function () {}); }); if (!panels.length) apply(); }

    $$('[data-occ-link]').forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('data-occ-link') === id ? 'true' : 'false'); });
    $$('[data-occ-select]').forEach(function (s) { if (!first || /o=/.test(H0)) s.value = id; });
    var pop = $('[data-popular]');
    if (pop) pop.innerHTML = o.addons.map(function (aid) { var a = AO[aid]; return '<li><span>' + esc(a.name) + '</span><span class="rate">' + money(a.rate) + ' <small>' + esc(a.unit) + '</small></span></li>'; }).join('');
    reorderTray(o, first);
    if (!first || /o=/.test(H0)) filterGallery(o);
    reorderFaq(o);
    writeHash();
    if (!first) say(o.name + ' selected. Packages from ' + money(o.prices[0]) + '.');
  }

  /* ---------- tray order */
  function reorderTray(o, first) {
    var box = $('[data-tray]'); if (!box) return;
    var order = PN.groupOrder[o.id] || [];
    var groups = $$('[data-group]', box);
    var apply = function () { order.forEach(function (gid) { var g = $('[data-group="' + gid + '"]', box); if (g) box.appendChild(g); }); };
    if (first || reduce) { apply(); return; }
    groups.forEach(function (g) { g.classList.add('is-fading'); });
    setTimeout(function () { apply(); groups.forEach(function (g) { g.classList.remove('is-fading'); }); }, 120);
  }

  /* ---------- gallery */
  function filterGallery(o) {
    var list = $('[data-gallery]'); if (!list) return;
    var note = $('[data-gal-note]');
    var items = $$('.g-item', list);
    var any = items.some(function (li) { return li.getAttribute('data-occs').split(' ').indexOf(o.id) > -1; });
    items.forEach(function (li) { li.hidden = any ? li.getAttribute('data-occs').split(' ').indexOf(o.id) < 0 : false; });
    if (note) note.hidden = any;
  }

  /* ---------- faq */
  function reorderFaq(o) {
    var box = $('[data-faq-list]'); if (!box) return;
    var items = $$('.faq-item', box);
    items.sort(function (a, b) {
      var ra = a.getAttribute('data-occs').split(' ').indexOf(o.id) > -1 ? 0 : 1;
      var rb = b.getAttribute('data-occs').split(' ').indexOf(o.id) > -1 ? 0 : 1;
      return ra - rb || (+a.getAttribute('data-i')) - (+b.getAttribute('data-i'));
    }).forEach(function (el) { box.appendChild(el); });
  }
  $$('.faq-item').forEach(function (el, i) { el.setAttribute('data-i', i); });

  /* ---------- estimator */
  var est = $('[data-est-lines]');
  function addonQty(a) {
    var v = state.a[a.id] || 0;
    if (a.kind === 'guest') return v ? state.g : 0;
    if (a.kind === 'event') return v ? 1 : 0;
    return v;
  }
  function calc() {
    if (!est) return;
    var o = OCC[state.o], lines = [], total = 0;
    if (state.t !== 'none') {
      var t = PN.tiers[state.t], base = o.prices[state.t];
      lines.push([t.name + ': ' + o.name.toLowerCase(), base]); total += base;
      var extra = Math.max(0, state.g - t.incl);
      if (extra) { lines.push([extra + ' guests over ' + t.incl + ' × ' + money(t.extra), extra * t.extra]); total += extra * t.extra; }
    }
    PN.addons.forEach(function (a) {
      var q = addonQty(a); if (!q) return;
      var sub = q * a.rate; total += sub;
      lines.push([a.name + (a.kind === 'event' ? '' : ' × ' + q), sub]);
    });
    est.innerHTML = lines.length ? lines.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><span>' + money(l[1]) + '</span></li>'; }).join('') : '<li><span>Nothing added yet</span><span>$0</span></li>';
    var fig = $('[data-est-total]');
    fig.textContent = money(total);
    if (!reduce) { fig.classList.add('fill'); setTimeout(function () { fig.classList.remove('fill'); }, 260); }
    var warn = $('[data-est-warn]'), w = [];
    if (state.g < PN.minGuests) w.push('Our minimum is ' + PN.minGuests + ' guests.');
    if (total > 0 && total < PN.minSpend) w.push('Our minimum spend is ' + money(PN.minSpend) + '.');
    warn.hidden = !w.length; warn.textContent = w.join(' ');
    $$('.ao-row').forEach(function (r) { r.classList.toggle('is-on', (state.a[r.getAttribute('data-row')] || 0) > 0); });
    writeHash();
  }
  if (est) {
    $$('[data-ao]').forEach(function (inp) {
      var id = inp.getAttribute('data-ao');
      if (inp.type === 'checkbox') {
        inp.checked = !!state.a[id];
        inp.addEventListener('change', function () { state.a[id] = inp.checked ? 1 : 0; calc(); });
      } else {
        inp.value = state.a[id] || 0;
        inp.addEventListener('input', function () { state.a[id] = Math.max(0, parseInt(inp.value, 10) || 0); calc(); });
      }
    });
    $$('.stepper').forEach(function (st) {
      var step = +st.getAttribute('data-step') || 1, inp = $('input', st);
      $$('.st-b', st).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = Math.max(0, (parseInt(inp.value, 10) || 0) + step * +b.getAttribute('data-d'));
          inp.value = v; state.a[inp.getAttribute('data-ao')] = v; calc();
        });
      });
    });
    var tier = $('#est-tier'), guests = $('#est-guests');
    tier.value = String(state.t);
    guests.value = state.g;
    tier.addEventListener('change', function () { state.t = tier.value === 'none' ? 'none' : +tier.value; calc(); });
    guests.addEventListener('input', function () { state.g = Math.max(1, Math.min(400, parseInt(guests.value, 10) || 1)); calc(); });
    $$('[data-occgroup] [role="radio"]').forEach(function (r) { r.addEventListener('click', calc); r.addEventListener('keydown', function () { setTimeout(calc, 0); }); });
  }

  /* ---------- quote page: carry the estimate */
  function carry() {
    var box = $('[data-carried]'); if (!box) return;
    var items = Object.keys(state.a).filter(function (k) { return state.a[k] > 0; });
    var g = $('#q-guests'); if (g && /g=/.test(H0)) g.value = state.g;
    if (!items.length && !/t=/.test(H0)) return;
    var li = [];
    if (state.t !== 'none' && /t=/.test(H0)) li.push(PN.tiers[state.t].name + ' package');
    items.forEach(function (k) { var a = AO[k]; li.push(a.name + (a.kind === 'qty' ? ' × ' + state.a[k] : '')); });
    $('[data-carried-list]').innerHTML = li.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    $('[data-carried-input]').value = li.join('; ');
    box.hidden = false;
  }

  /* ---------- demo forms (no network) */
  $$('[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var st = $('.form-status', f), bad = null;
      $$('[required]', f).forEach(function (el) { el.removeAttribute('aria-invalid'); if (!bad && !el.value.trim()) bad = el; if (!el.value.trim()) el.setAttribute('aria-invalid', 'true'); });
      if (bad) { st.textContent = 'Please fill in: ' + ($('label[for="' + bad.id + '"]').textContent.replace(/\(optional\)/, '').trim()) + '.'; bad.focus(); return; }
      st.textContent = 'Thank you. This is a demo, so nothing was sent. On the live site this reaches the Pennant inbox.';
    });
  });

  /* ---------- nav toggle */
  var tog = $('.nav-toggle');
  if (tog) tog.addEventListener('click', function () {
    var nav = tog.parentNode, open = !nav.classList.contains('open');
    nav.classList.toggle('open', open); tog.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---------- reveal */
  var rv = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (e, i) { e.style.transitionDelay = (i % 4) * 40 + 'ms'; io.observe(e); });
  }

  readHash();
  setOcc(state.o, true);
  if (page === 'gallery' && !/o=/.test(H0)) $$('[data-occgroup] [role="radio"]').forEach(function (r, i) { r.setAttribute('aria-checked', 'false'); r.tabIndex = i === 0 ? 0 : -1; });
  calc();
  carry();
})();
