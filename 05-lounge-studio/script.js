/* THE LATE ROOM v2. Colour arrives, prints settle onto the page, then everything is still. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var head = document.querySelector('.head');
  var bar = document.querySelector('.bar');

  /* Header condenses past 140px of scroll. */
  function onScroll() {
    if (head) head.classList.toggle('small', reduce || window.scrollY > 140);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Full-screen menu. */
  var overlay = document.querySelector('.overlay');
  var openBtn = document.querySelector('.menu-btn');
  if (overlay && openBtn) {
    var closeBtn = overlay.querySelector('.menu-close');
    var close = function () {
      overlay.classList.remove('open');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      openBtn.focus();
    };
    openBtn.addEventListener('click', function () {
      overlay.classList.add('open');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  /* Sticky bar arrives once the first screen has gone. */
  var first = document.querySelector('[data-first]');
  if (bar) {
    if (reduce || !first || !('IntersectionObserver' in window)) {
      bar.classList.add('on');
    } else {
      new IntersectionObserver(function (es) {
        bar.classList.toggle('on', !es[0].isIntersecting);
      }).observe(first);
    }
  }

  var fields = [].slice.call(document.querySelectorAll('.field'));
  var rises = [].slice.call(document.querySelectorAll('.rise, .print'));

  if (reduce || !('IntersectionObserver' in window)) {
    fields.forEach(function (f) { f.classList.add('lit'); });
    rises.forEach(function (r) { r.classList.add('in'); });
  } else {
    /* A field runs once, on first entry, and never at the same moment as another. */
    var queue = [], busy = false;
    var next = function () {
      if (busy || !queue.length) return;
      busy = true;
      queue.shift().classList.add('lit');
      setTimeout(function () { busy = false; next(); }, 300);
    };
    var fo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { fo.unobserve(e.target); queue.push(e.target); next(); }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    fields.forEach(function (f) { fo.observe(f); });

    var ro = new IntersectionObserver(function (es) {
      var n = 0;
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.setProperty('--d', (n++ * 110) + 'ms');
          e.target.classList.add('in');
          ro.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rises.forEach(function (r) { ro.observe(r); });
  }

  /* Rooms: filter by kind of room, and only that. */
  var filters = document.querySelector('.filters');
  if (filters) {
    var btns = [].slice.call(filters.querySelectorAll('button'));
    var items = [].slice.call(document.querySelectorAll('[data-kind]'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-filter');
        btns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        items.forEach(function (i) {
          i.hidden = !(k === 'all' || i.getAttribute('data-kind') === k);
          if (!i.hidden) {
            i.classList.add('lit');
            [].forEach.call(i.querySelectorAll('.print'), function (p) { p.classList.add('in'); });
          }
        });
      });
    });
  }

  /* Forms: nothing leaves this page on the demo; the success state says what happens next. */
  [].forEach.call(document.querySelectorAll('form[data-form]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      [].forEach.call(form.querySelectorAll('[data-req]'), function (wrap) {
        var input = wrap.querySelector('input, select, textarea');
        var ok = input.type === 'radio'
          ? !!wrap.querySelector('input:checked')
          : input.value.trim() !== '' && (input.type !== 'email' || /.+@.+\..+/.test(input.value));
        wrap.classList.toggle('bad', !ok);
        if (input.type !== 'radio') input.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }
      var done = document.getElementById(form.getAttribute('data-done'));
      form.hidden = true;
      done.hidden = false;
      done.setAttribute('tabindex', '-1');
      done.focus();
    });
  });
})();
