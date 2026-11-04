/* LOADLINE · fictional TFS demo. No tracking, no third parties, nothing is sent anywhere. */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* Header condenses past 130px */
  var hdr = d.querySelector('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('is-condensed', reduce || window.scrollY > 130); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile overlay menu */
  var btn = d.querySelector('.menu-btn'), ov = d.getElementById('nav-ov');
  if (btn && ov) {
    var close = ov.querySelector('.menu-close');
    function setOpen(o) {
      ov.classList.toggle('is-open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      d.body.style.overflow = o ? 'hidden' : '';
      (o ? close : btn).focus();
    }
    btn.addEventListener('click', function () { setOpen(true); });
    close.addEventListener('click', function () { setOpen(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('is-open')) setOpen(false); });
  }

  /* Reveal, block-stack build, matrix column reveal: each runs once */
  var stacks = [].slice.call(d.querySelectorAll('.stack'));
  stacks.forEach(function (s) {
    var b = s.querySelectorAll('.blk');
    [].forEach.call(b, function (el, i) { el.style.setProperty('--i', i); });
    s.style.setProperty('--n', b.length);
    if (!reduce) s.classList.add('build');
  });
  var mx = d.querySelector('.mx');
  if (mx) {
    [].forEach.call(mx.querySelectorAll('tbody tr'), function (tr) {
      [].forEach.call(tr.querySelectorAll('td'), function (td, c) { var m = td.querySelector('.mk'); if (m) m.style.setProperty('--c', c); });
    });
    if (!reduce) mx.classList.add('build');
  }
  [].forEach.call(d.querySelectorAll('.rv'), function (el) {
    var p = el.parentElement; p.__rv = (p.__rv || 0) + 1; el.style.setProperty('--i', Math.min(p.__rv - 1, 8));
  });
  var targets = [].slice.call(d.querySelectorAll('.rv, .stack.build, .mx.build'));
  function fire(el) {
    if (el.classList.contains('rv')) el.classList.add('in');
    if (el.classList.contains('stack')) el.classList.add('built');
    if (el.classList.contains('mx')) el.classList.add('built');
  }
  if (reduce || !('IntersectionObserver' in window)) { targets.forEach(fire); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* Matrix filter: unmatched rows dim in place; the table keeps its shape */
  var chips = [].slice.call(d.querySelectorAll('[data-cap]'));
  var live = d.getElementById('mx-live');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      var need = chips.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).map(function (x) { return x.getAttribute('data-cap'); });
      var shown = 0, rows = mx.querySelectorAll('tbody tr');
      [].forEach.call(rows, function (tr) {
        var ok = need.every(function (k) { var td = tr.querySelector('[data-k="' + k + '"]'); return td && td.getAttribute('data-v') !== 'none'; });
        tr.classList.toggle('dim', !ok); if (ok) shown++;
      });
      if (live) live.textContent = need.length ? shown + ' of ' + rows.length + ' event types match the selected capabilities (illustrative marks).' : 'All event types shown.';
    });
  });

  /* Programme block: select a phase to mark the phase(s) it depends on. A mark, never a line. */
  [].forEach.call(d.querySelectorAll('button.blk-t'), function (b) {
    b.addEventListener('click', function () {
      var blk = b.closest('.blk'), stack = b.closest('.stacks') || b.closest('.stack'), on = !blk.classList.contains('is-active');
      [].forEach.call(stack.querySelectorAll('.blk'), function (x) { x.classList.remove('is-active', 'is-target'); });
      [].forEach.call(stack.querySelectorAll('button.blk-t'), function (x) { x.setAttribute('aria-pressed', 'false'); });
      if (on) {
        blk.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
        (blk.getAttribute('data-dep') || '').split(' ').forEach(function (id) {
          if (!id) return; var t = stack.querySelector('[data-id="' + id + '"]'); if (t) t.classList.add('is-target');
        });
      }
    });
  });

  /* RFP: multi-step. Without JS every step is visible and the form still reads top to bottom. */
  var rfp = d.querySelector('.rfp-full');
  if (rfp) {
    var panes = [].slice.call(rfp.querySelectorAll('fieldset.pane'));
    var steps = [].slice.call(d.querySelectorAll('.steps .step'));
    var cur = 0;
    function show(n) {
      cur = Math.max(0, Math.min(n, panes.length - 1));
      panes.forEach(function (p, i) { p.classList.toggle('is-on', i === cur); });
      steps.forEach(function (s, i) {
        s.classList.toggle('is-current', i === cur); s.classList.toggle('is-done', i < cur);
        var m = s.querySelector('.mkd'); if (m) m.textContent = i < cur ? '●' : (i === cur ? '◐' : '○');
        if (i === cur) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
      });
    }
    rfp.addEventListener('click', function (e) {
      var t = e.target.closest('[data-go]'); if (!t) return;
      e.preventDefault();
      var dir = t.getAttribute('data-go');
      if (dir === 'next') {
        var bad = [].filter.call(panes[cur].querySelectorAll('[required]'), function (f) { return !f.checkValidity(); });
        if (bad.length) { bad[0].reportValidity(); return; }
      }
      show(cur + (dir === 'next' ? 1 : -1));
      var lg = panes[cur].querySelector('legend'); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus(); }
    });
    /* carry step-one answers over from the inline intake on the home page */
    try {
      var q = new URLSearchParams(location.search);
      q.forEach(function (v, k) {
        var f = rfp.elements[k]; if (!f) return;
        if (f.length && f[0] && f[0].type === 'radio') { [].forEach.call(f, function (r) { r.checked = r.value === v; }); }
        else f.value = v;
      });
    } catch (err) {}
    show(0);
    rfp.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = d.getElementById('rfp-out');
      out.hidden = false; out.focus();
    });
  }

  /* Demo-only forms: nothing is transmitted */
  [].forEach.call(d.querySelectorAll('form[data-demo]'), function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = f.querySelector('.form-out') || d.getElementById(f.getAttribute('data-out'));
      if (o) { o.hidden = false; o.textContent = 'Demo only: nothing was sent. On a live site this goes to [NEW BUSINESS EMAIL — PLACEHOLDER].'; o.focus && o.focus(); }
    });
  });
})();
