
/* about: opens from the navbar like the project view (grows out of the nav link), scrolls inside, closes back to where you were */
(function () {
  var root = document.documentElement, ab = document.getElementById('ab'), mainEl = document.querySelector('main');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isOpen = false, opener = null, lastFocus = null, doneT = 0, pending = null;

  /* reveal on scroll, inside the sheet */
  var rv = [].slice.call(ab.querySelectorAll('.ab-rv'));
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { root: ab, threshold: .12 }) : null;
  function armReveal() { rv.forEach(function (n) { if (io && !n.classList.contains('in')) io.observe(n); else n.classList.add('in'); }); }

  /* "the way I work" types out the way the approach line does, each time the page opens */
  var wayEl = document.getElementById('ab-approach'), wayOut = document.getElementById('abWayText'), wayCaret = document.getElementById('abWayCaret');
  var wayFull = wayEl.querySelector('.sr').textContent, wayRun = 0, wayStarted = false;
  function wayType(id, i) {
    if (id !== wayRun || i > wayFull.length) return;
    wayOut.textContent = wayFull.slice(0, i);
    setTimeout(function () { wayType(id, i + 1); }, 24 + Math.random() * 30);
  }
  function wayReset() { wayRun++; wayStarted = false; wayOut.textContent = reduce ? wayFull : ''; }
  function wayStart() {
    if (wayStarted) return; wayStarted = true;
    if (reduce) { wayOut.textContent = wayFull; return; }
    var id = ++wayRun; setTimeout(function () { wayType(id, 1); }, 350);
  }
  var wio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    if (es.some(function (e) { return e.isIntersecting; })) wayStart();
  }, { root: ab, threshold: .6 }) : null;
  if (!wio) wayOut.textContent = wayFull;
  function setNavH() { ab.style.setProperty('--ab-nav-h', ab.querySelector('.ab-nav').offsetHeight + 'px'); }
  addEventListener('resize', function () { if (isOpen) setNavH(); });

  /* the phone drifts on its own and leans toward the cursor; a soft sheen slides across the glass as it turns */
  var phoneRaf = 0;
  function phoneStart() {
    var stage = document.getElementById('abStage'), body = document.getElementById('abBody'), ph = document.getElementById('abPhone');
    if (!stage || !body) return;
    ab.style.setProperty('--phone-mask', 'url("' + ph.src + '")');
    if (reduce) return;
    cancelAnimationFrame(phoneRaf);
    var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    var px = 0, py = 0, lastMove = -1e9, cx = 0, cy = 0, c = { rx: 0, ry: 0, rz: 0, tx: 0, ty: 0 }, t0 = performance.now();
    function mv(e) { if (e.pointerType !== 'mouse') return; px = e.clientX; py = e.clientY; lastMove = performance.now(); }
    ab.onpointermove = fine ? mv : null;
    function frame(now) {
      if (!isOpen) return;
      phoneRaf = requestAnimationFrame(frame);
      var t = (now - t0) / 1000;
      var r = stage.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      var live = now - lastMove < 2500;
      var dx = live ? Math.max(-1, Math.min(1, (px - cx) / (innerWidth * .5))) : 0, dy = live ? Math.max(-1, Math.min(1, (py - cy) / (innerHeight * .5))) : 0;
      // idle drift, always running, with the pointer's lean added on top
      var T = { ry: Math.sin(t * .7) * 5 + dx * 18, rx: Math.sin(t * .5 + 1.2) * 3 - dy * 11, rz: Math.sin(t * .4 + .6) * 1.2 - dx * 2,
                tx: Math.sin(t * .6 + .3) * 4 + dx * 10, ty: Math.sin(t * .9) * 7 + dy * 8 };
      var k = .08; for (var n in T) c[n] += (T[n] - c[n]) * k;
      body.style.setProperty('--rx', c.rx.toFixed(2) + 'deg'); body.style.setProperty('--ry', c.ry.toFixed(2) + 'deg'); body.style.setProperty('--rz', c.rz.toFixed(2) + 'deg');
      body.style.setProperty('--tx', c.tx.toFixed(1) + 'px'); body.style.setProperty('--ty', c.ty.toFixed(1) + 'px');
      body.style.setProperty('--sx', (8 + c.ry * .6).toFixed(1) + 'px');
      body.style.setProperty('--sh', (50 + c.ry * 2.6 + c.rx * 1.2).toFixed(1) + '%');
    }
    phoneRaf = requestAnimationFrame(frame);
  }

  function insetFor(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect(), w = root.clientWidth, h = root.clientHeight;
    if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w || !r.width) return null;
    return 'inset(' + Math.max(0, r.top) + 'px ' + Math.max(0, w - r.right) + 'px ' + Math.max(0, h - r.bottom) + 'px ' + Math.max(0, r.left) + 'px)';
  }
  function open(fromEl, instant) {
    if (isOpen) return;
    clearTimeout(doneT); isOpen = true; lastFocus = document.activeElement;
    ab.classList.remove('fade'); ab.classList.add('is-on'); ab.setAttribute('aria-hidden', 'false');
    mainEl.inert = true; root.classList.add('ab-open'); ab.scrollTop = 0; setNavH(); phoneStart(); wayReset(); if (wio) { wio.disconnect(); wio.observe(wayEl); } armReveal();
    var from = insetFor(fromEl);
    if (instant || reduce || !from) { ab.style.clipPath = 'none'; }
    else {
      ab.style.transition = 'none'; ab.style.clipPath = from; ab.getBoundingClientRect(); ab.style.transition = '';
      ab.style.clipPath = 'inset(0px 0px 0px 0px)'; doneT = setTimeout(function () { if (isOpen) ab.style.clipPath = 'none'; }, 950);
    }
    ab.focus({ preventScroll: true });
  }
  function finish() {
    ab.classList.remove('is-on', 'fade'); ab.style.clipPath = ''; ab.style.transition = ''; ab.setAttribute('aria-hidden', 'true');
    mainEl.inert = false; root.classList.remove('ab-open');
    if (pending) { var p = pending; pending = null; p(); }
    else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; clearTimeout(doneT);
    var to = insetFor(opener);
    if (reduce) { finish(); return; }
    if (to) {
      ab.style.transition = 'none'; ab.style.clipPath = 'inset(0px 0px 0px 0px)'; ab.getBoundingClientRect(); ab.style.transition = '';
      ab.style.clipPath = to;
    } else ab.classList.add('fade');
    doneT = setTimeout(finish, 800);
  }
  function requestClose() {
    if (history.state && history.state.ab) history.back();
    else { close(); if (location.hash === '#about') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} } }
  }
  function navLink() { return document.querySelector('.nav nav a[href="#about"]'); }

  ab.addEventListener('click', function (e) {
    var g = e.target.closest('[data-ab-go]'), s = e.target.closest('[data-ab-scroll]');
    if (s) { e.preventDefault(); var t = document.getElementById(s.getAttribute('data-ab-scroll')); if (t) ab.scrollTo({ top: t.offsetTop - 70, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (!g) return;
    e.preventDefault();
    var go = g.getAttribute('data-ab-go');
    if (go === 'stay') { ab.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (go === 'works') pending = function () { var w = document.getElementById('works'); if (w) w.scrollIntoView(); };
    else if (go === 'notes') pending = function () { var n = document.querySelector('.nav nav a[href="#notes"]'); if (n) n.click(); };
    requestClose();
  });
  addEventListener('keydown', function (e) { if (isOpen && e.key === 'Escape') requestClose(); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#about"]');
    if (!a || a.closest('.ab')) return;
    e.preventDefault(); opener = a;
    try { history.pushState({ ab: 1 }, '', '#about'); } catch (err) {}
    open(a);
  });
  addEventListener('popstate', function () {
    if (location.hash === '#about') { if (!isOpen) { opener = navLink(); open(opener); } }
    else if (isOpen) close();
  });
  if (location.hash === '#about') document.addEventListener('loader:done', function () { opener = navLink(); open(opener, true); });
})();
