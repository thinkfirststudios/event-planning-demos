/* PENNANT EVENT CO. — fictional demo (ThinkFirst Studios).
   The occasion board: one selector that repaints the page. Add-on tray + labelled estimator.
   No tracking, no storage: state lives in the URL hash (#o=…&g=…&t=…&a=id:qty,…). */
(function () {
  'use strict';
  var PN = window.PN || { occ: [], addons: {}, tiers: {}, tierNames: {}, gallery: [], img: {} };
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var OCC = {}; PN.occ.forEach(function (o) { OCC[o.id] = o; });
  var page = ($('main') || {}).getAttribute ? $('main').getAttribute('data-page') : '';

  /* ---------------- state in the hash ---------------- */
  var state = { o: null, g: 80, t: '2', a: {}, d: '' };
  function parseHash() {
    var h = location.hash.replace(/^#/, '');
    if (h.indexOf('o=') === -1 && h.indexOf('a=') === -1 && h.indexOf('g=') === -1) return;
    h.split('&').forEach(function (kv) {
      var p = kv.split('='), k = p[0], v = decodeURIComponent(p[1] || '');
      if (k === 'o' && OCC[v]) state.o = v;
      if (k === 'g' && +v > 0) state.g = Math.min(999, Math.round(+v));
      if (k === 't' && PN.tiers[v]) state.t = v;
      if (k === 'a' && v) v.split(',').forEach(function (x) {
        var q = x.split(':'); if (PN.addons[q[0]] && +q[1] > 0) state.a[q[0]] = Math.min(999, Math.round(+q[1]));
      });
    });
  }
  function serial() {
    var a = Object.keys(state.a).filter(function (k) { return state.a[k] > 0; }).map(function (k) { return k + ':' + state.a[k]; }).join(',');
    var s = 'o=' + (state.o || PN.occ[0].id) + '&g=' + state.g + '&t=' + state.t;
    if (a) s += '&a=' + a;
    return s;
  }
  var touched = false;
  function writeHash() {
    if (!touched) return;
    try { history.replaceState(null, '', '#' + serial()); } catch (e) { /* file:// in some browsers */ }
    keepLinks();
  }
  // carry the selection to other pages (links without their own #fragment)
  function keepLinks() {
    if (!touched) return;
    $$('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!a.hasAttribute('data-base')) {
        if (!/^[a-z-]+\.html(#.*)?$/.test(href)) return;
        if (href.indexOf('#') !== -1 && !a.hasAttribute('data-keep-state')) return;
        a.setAttribute('data-base', href.split('#')[0]);
      }
      a.setAttribute('href', a.getAttribute('data-base') + '#' + serial());
    });
  }

  /* ---------------- live announcements ---------------- */
  function say(msg, sel) {
    var el = $(sel || '[data-announce]'); if (!el) return;
    el.textContent = ''; setTimeout(function () { el.textContent = msg; }, 30);
  }

  /* ---------------- formatting (every figure is a bracketed placeholder) ---------------- */
  function money(n) { return '$[' + Math.round(n).toLocaleString('en-US') + ']'; }
  function phs(t) { return '<span class="ph">' + esc(t) + '</span>'; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------------- repaint: crossfade with reserved height ---------------- */
  function repaint(el, fn, ms) {
    ms = ms || 200;
    if (reduce || !el || !touched) { fn(); return; }
    el.style.minHeight = el.offsetHeight + 'px';
    el.classList.add('is-fading');
    setTimeout(function () {
      fn();
      el.classList.remove('is-fading');
      setTimeout(function () { el.style.minHeight = ''; }, ms);
    }, ms);
  }

  /* ---------------- the occasion board (radio groups) ---------------- */
  function setChecked(id) {
    $$('[data-occgroup]').forEach(function (g) {
      $$('[role="radio"]', g).forEach(function (r) {
        var on = r.getAttribute('data-occ') === id;
        r.setAttribute('aria-checked', on ? 'true' : 'false');
        r.tabIndex = on ? 0 : -1;
      });
    });
  }
  $$('[data-occgroup]').forEach(function (g) {
    var radios = $$('[role="radio"]', g);
    radios.forEach(function (r, i) {
      r.addEventListener('click', function () { touched = true; setOcc(r.getAttribute('data-occ')); });
      r.addEventListener('keydown', function (ev) {
        var k = ev.key, n = radios.length, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + n) % n;
        else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        else if (k === ' ' || k === 'Enter') { ev.preventDefault(); touched = true; setOcc(r.getAttribute('data-occ')); return; }
        if (j > -1) { ev.preventDefault(); radios[j].focus(); touched = true; setOcc(radios[j].getAttribute('data-occ')); }
      });
    });
  });

  function setOcc(id, first) {
    var o = OCC[id]; if (!o) return;
    var changed = state.o !== id;
    state.o = id;
    setChecked(id);
    if (!changed && !first) return;
    var lc = o.name.charAt(0).toLowerCase() + o.name.slice(1);
    // orchid band: the selected occasion
    var ob = $('[data-repaint="occ"]');
    if (ob) repaint(ob, function () {
      $('[data-f="name"]', ob).textContent = o.name;
      $('[data-f="age"]', ob).innerHTML = phs(o.age);
      $('[data-f="words"]', ob).hidden = !o.words;
    });
    $$('[data-f="name-lc"]').forEach(function (s) { s.textContent = lc; });
    if (page === 'packages') $$('h2[data-f="name"]').forEach(function (h) { h.textContent = o.name; });
    // package cards reload
    var pk = $('[data-repaint="pkg"]');
    if (pk) repaint(pk, function () {
      $$('[data-f="tiername"]', pk).forEach(function (s, i) {
        s.textContent = '[' + o.name.toUpperCase() + ' · TIER 0' + (i + 1) + ' NAME — CONFIRM]';
      });
    });
    reorderTray(o);
    paintStrip(o);
    reorderFaq(o);
    filterGalleryFor(o);
    $$('[data-occ-select]').forEach(function (s) { s.value = id; });
    writeHash();
    if (!first) say('Showing ' + o.name + '. ' + ({ index: 'Packages, add-ons, gallery and quote form updated.', packages: 'Package cards updated.', 'add-ons': 'Add-on tray reordered.', faq: 'Questions reordered.', quote: 'Occasion set.' }[page] || ''));
  }

  /* add-on tray reorders, 120ms crossfade per group (not a reflow animation) */
  function reorderTray(o) {
    var box = $('[data-groups]'); if (!box) return;
    var groups = $$('[data-group]', box);
    var apply = function () {
      o.groups.forEach(function (gid) { var g = $('[data-group="' + gid + '"]', box); if (g) box.appendChild(g); });
    };
    if (reduce || !touched) { apply(); return; }
    groups.forEach(function (g) { g.classList.add('is-fading'); });
    setTimeout(function () { apply(); groups.forEach(function (g) { g.classList.remove('is-fading'); }); }, 120);
  }

  /* gallery strip: rooms and objects tagged with ADULT occasions only */
  function captionHTML(m) {
    return '<span class="what">' + esc(m.what) + '</span>' + (m.cap ? phs(m.cap) + ' · ' : '') + phs('[SETTING — CONFIRM]') + '<span class="credit">' + phs(PN.credit) + '</span>';
  }
  function paintStrip(o) {
    var strip = $('[data-repaint="strip"]'); if (!strip) return;
    var pick;
    if (o.words) pick = ['g02-long-table', 'g08-glassware', 'g04-chairs'];
    else {
      pick = PN.gallery.filter(function (n) { return PN.img[n].tags.indexOf(o.id) !== -1; });
      PN.gallery.forEach(function (n) { if (pick.indexOf(n) === -1) pick.push(n); });
      pick = pick.slice(0, 3);
    }
    var note = $('[data-f="strip-note"]');
    repaint(strip, function () {
      $$('[data-strip-slot]', strip).forEach(function (f, i) {
        var n = pick[i], m = PN.img[n], im = $('img', f), big = m.w[m.w.length - 1];
        im.src = 'assets/img/' + n + '-' + m.w[0] + '.webp';
        im.srcset = m.w.map(function (w) { return 'assets/img/' + n + '-' + w + '.webp ' + w + 'w'; }).join(', ');
        im.width = big; im.height = Math.round(big * m.rh / m.rw); im.alt = m.alt;
        $('figcaption', f).innerHTML = captionHTML(m);
      });
      if (note) note.hidden = !o.words;
    });
  }

  /* FAQ reorders: the questions tagged for this occasion move up */
  function reorderFaq(o) {
    var box = $('[data-faq]'); if (!box) return;
    repaint(box, function () {
      var items = $$('details', box);
      var hit = items.filter(function (d) { return (' ' + d.getAttribute('data-occ') + ' ').indexOf(' ' + o.id + ' ') !== -1; });
      var rest = items.filter(function (d) { return hit.indexOf(d) === -1; });
      hit.concat(rest).forEach(function (d) { box.appendChild(d); });
    });
    if (touched) say(o.name + ': the most relevant questions are now first.', '[data-faq-announce]');
  }

  /* gallery page filter (occasion type only, never venue/host/date) */
  function filterGallery(tag) {
    var figs = $$('.gseq figure'); if (!figs.length) return;
    var shown = 0;
    figs.forEach(function (f) {
      var on = tag === 'all' || f.getAttribute('data-tags').split(' ').indexOf(tag) !== -1;
      f.classList.toggle('is-hidden', !on); if (on) { shown++; f.classList.add('in'); }
    });
    $$('[data-filter]').forEach(function (c) { var on = c.getAttribute('data-filter') === tag; c.setAttribute('aria-pressed', on); c.classList.toggle('is-on', on); });
    say(shown + ' photographs shown.', '[data-gal-announce]');
  }
  $$('[data-filter]').forEach(function (c) { c.addEventListener('click', function () { filterGallery(c.getAttribute('data-filter')); }); });
  function filterGalleryFor(o) {
    if (page !== 'gallery' || !touched) return;
    filterGallery(o.words ? 'all' : o.id);
  }

  /* ---------------- add-on tray rows ---------------- */
  function syncRows() {
    $$('.row[data-ao]').forEach(function (r) {
      var id = r.getAttribute('data-ao'), q = state.a[id] || 0;
      r.classList.toggle('is-on', q > 0);
      var inp = $('[data-qty]', r); if (inp && +inp.value !== q) inp.value = q;
      var t = $('[data-toggle]', r); if (t) t.setAttribute('aria-pressed', q > 0 ? 'true' : 'false');
    });
  }
  $$('.row[data-ao]').forEach(function (r) {
    var id = r.getAttribute('data-ao'), name = r.getAttribute('data-name');
    var inp = $('[data-qty]', r);
    $$('[data-step]', r).forEach(function (b) {
      b.addEventListener('click', function () {
        var q = Math.max(0, Math.min(999, (state.a[id] || 0) + (+b.getAttribute('data-step'))));
        set(id, q);
      });
    });
    if (inp) inp.addEventListener('change', function () { set(id, Math.max(0, Math.min(999, Math.round(+inp.value || 0)))); });
    var t = $('[data-toggle]', r);
    if (t) t.addEventListener('click', function () {
      var on = !(state.a[id] > 0); set(id, on ? 1 : 0);
      say(name + (on ? ' added to the estimate.' : ' removed from the estimate.'));
    });
  });
  function set(id, q) { touched = true; if (q > 0) state.a[id] = q; else delete state.a[id]; syncRows(); compute(); writeHash(); }

  /* ---------------- estimator ---------------- */
  var lastTotal = null;
  function compute() {
    var g = state.g, lines = [], total = 0;
    var tr = PN.tiers[state.t] || 0, tn = PN.tierNames[state.t] || '';
    lines.push([tn + ' · [' + g + '] guests × ' + money(tr) + ' per head', g * tr]);
    total += g * tr;
    Object.keys(state.a).forEach(function (id) {
      var a = PN.addons[id], q = state.a[id]; if (!a || !q) return;
      var v, label;
      if (a.unit === 'item') { v = q * a.rate; label = a.name + ' · [' + q + '] × ' + money(a.rate); }
      else if (a.unit === 'head') { v = g * a.rate; label = a.name + ' · [' + g + '] guests × ' + money(a.rate); }
      else { v = a.rate; label = a.name + ' · per event'; }
      lines.push([label, v]); total += v;
    });
    $$('[data-lines]').forEach(function (ul) {
      ul.innerHTML = lines.map(function (l) { return '<li><span>' + esc(l[0]) + '</span>' + phs(money(l[1])) + '</li>'; }).join('') +
        (lines.length === 1 ? '<li class="empty">No add-ons selected yet. Nothing is pre-selected.</li>' : '');
    });
    var txt = money(total);
    $$('[data-total],[data-total-mini]').forEach(function (f) {
      if (f.textContent === txt) return;
      f.textContent = txt;
      // recompute cue: a 260ms ease-out fill return on the figure. Not a count-up: the figure writes directly.
      if (!reduce && lastTotal !== null) { f.classList.add('is-new'); requestAnimationFrame(function () { requestAnimationFrame(function () { f.classList.remove('is-new'); }); }); }
    });
    lastTotal = total;
    // quote form: add-ons summary + carried values
    $$('[data-ao-summary]').forEach(function (box) {
      var ids = Object.keys(state.a);
      box.innerHTML = ids.length ? ids.map(function (id) { var a = PN.addons[id]; return esc(a.name) + ' ' + phs(a.unit === 'item' ? '[' + state.a[id] + ']' : '[✓]'); }).join(' · ') +
        ' <a href="add-ons.html#' + serial() + '">Change add-ons →</a>' :
        'None yet. <a href="add-ons.html#' + serial() + '">Open the add-on tray →</a>';
    });
    $$('[data-guests]').forEach(function (i) { if (+i.value !== g) i.value = g; });
    $$('[data-guests-text]').forEach(function (i) { if (i !== doc.activeElement) i.value = g; });
    $$('input[type=radio][name$="-tier"]').forEach(function (r) { r.checked = r.value === state.t; });
  }
  $$('[data-guests],[data-guests-text]').forEach(function (i) {
    i.addEventListener('input', function () { var v = Math.round(+i.value); if (v > 0) { touched = true; state.g = Math.min(999, v); compute(); writeHash(); } });
  });
  $$('input[type=radio][name$="-tier"]').forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) { touched = true; state.t = r.value; compute(); writeHash(); } });
  });
  $$('[data-pick-tier]').forEach(function (b) {
    b.addEventListener('click', function () {
      touched = true; state.t = b.getAttribute('data-pick-tier'); compute(); writeHash();
      say(PN.tierNames[state.t] + ' is now in your estimate.');
    });
  });
  $$('[data-occ-select]').forEach(function (s) { s.addEventListener('change', function () { touched = true; setOcc(s.value); }); });

  /* ---------------- demo forms: nothing is sent ---------------- */
  $$('[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = $('.success', f); if (ok) { ok.classList.add('is-shown'); ok.focus(); }
    });
  });

  /* ---------------- header, chip strip, menu ---------------- */
  var hdr = $('[data-hdr]');
  function onScroll() { if (hdr) hdr.classList.toggle('is-condensed', window.scrollY > 130); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var boardEl = $('[data-board]');
  if (hdr && boardEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      en.forEach(function (x) { hdr.classList.toggle('show-strip', !x.isIntersecting && x.boundingClientRect.top < 0); });
    }).observe(boardEl);
  }
  var ov = $('[data-overlay]'), mb = $('[data-menu]');
  function menu(open) {
    if (!ov) return;
    ov.hidden = !open; ov.classList.toggle('is-open', open);
    if (mb) mb.setAttribute('aria-expanded', open);
    doc.body.style.overflow = open ? 'hidden' : '';
    if (open) $('a', ov).focus(); else if (mb) mb.focus();
  }
  if (mb) mb.addEventListener('click', function () { menu(true); });
  var mc = $('[data-menu-close]'); if (mc) mc.addEventListener('click', function () { menu(false); });
  doc.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && ov && !ov.hidden) menu(false); });

  /* mobile: tray groups collapsed except the first (open by default on desktop) */
  if (window.matchMedia('(max-width: 639px)').matches) $$('[data-group]').forEach(function (d, i) { if (i > 0) d.open = false; });

  /* ---------------- scroll reveals: 14px rise + fade, 220ms, 40ms stagger ---------------- */
  var rv = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (x) { x.classList.add('in'); });
  else {
    rv.forEach(function (x) {
      var sib = Array.prototype.indexOf.call(x.parentNode.children, x);
      x.style.transitionDelay = Math.min(sib, 9) * 40 + 'ms';
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (x) { io.observe(x); });
  }

  /* ---------------- boot ---------------- */
  parseHash();
  var fromHash = !!state.o;
  if (fromHash) touched = true;
  var first = state.o || PN.occ[0].id;
  state.o = null;
  var wasTouched = touched; touched = false;   // first paint is instant
  setOcc(first, true);
  touched = wasTouched;
  syncRows(); compute();
  if (touched) { writeHash(); if (page === 'gallery') filterGalleryFor(OCC[first]); }
})();
