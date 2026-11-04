/* Loadline (FICTIONAL DEMO) · v2. No tracking, no third parties, nothing is sent anywhere. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js');

  // menu overlay (mobile)
  var ov = d.getElementById('nav-ov'), open = d.querySelector('.menu-open');
  function setMenu(on) {
    if (!ov) return;
    ov.classList.toggle('open', on);
    if (open) open.setAttribute('aria-expanded', on ? 'true' : 'false');
    d.body.style.overflow = on ? 'hidden' : '';
    if (on) { var c = ov.querySelector('.menu-close'); if (c) c.focus(); } else if (open) open.focus();
  }
  if (open) open.addEventListener('click', function () { setMenu(true); });
  if (ov) {
    ov.querySelector('.menu-close').addEventListener('click', function () { setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) setMenu(false); });
  }

  // reveal once, top to bottom. Skipped entirely under reduced motion.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = d.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // demo forms: validate, then show a plain confirmation. Nothing leaves the page.
  d.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var ok = f.querySelector('.ok');
      if (ok) { ok.classList.add('show'); ok.setAttribute('tabindex', '-1'); ok.focus(); }
    });
  });
})();
