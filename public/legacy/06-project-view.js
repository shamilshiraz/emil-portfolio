
/* project view: opens from the work card (grows out of its thumbnail), loops its images, and goes straight back home */
(function () {
  var root = document.documentElement, pv = document.getElementById('pv'), mainEl = document.querySelector('main');
  var stage = document.getElementById('pvStage'), track = document.getElementById('pvTrack'), set0 = document.getElementById('pvSet');
  var cur = document.getElementById('pvCursor');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function subOpener() { return document.querySelector('.dw-fold[data-work="subspace"] .dw-tab'); }
  var isOpen = false, opener = null, lastFocus = null, doneT = 0;

  /* ---- image loop ---- */
  var base = reduce ? 0 : 42, W = 1, x = 0, vel = 0, drag = false, lastX = 0, lastT = 0, flick = 0, moved = 0, last = 0;
  var mx = 0, my = 0, cx = 0, cy = 0, over = false, curInit = false;
  function build() {
    Array.prototype.forEach.call(track.querySelectorAll('.pv-clone'), function (n) { n.remove(); });
    W = set0.getBoundingClientRect().width || 1;
    var copies = Math.max(1, Math.ceil(stage.clientWidth / W) + 1);
    for (var i = 0; i < copies; i++) {
      var c = set0.cloneNode(true); c.removeAttribute('id'); c.classList.add('pv-clone'); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
    }
  }
  function tick(now) {
    if (!isOpen) return;
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!drag) { x += (base + vel) * dt; vel *= Math.exp(-dt * 2.6); }
    x = ((x % W) + W) % W;
    track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
    if (!curInit) { cx = mx; cy = my; curInit = true; }
    cx += (mx - cx) * .28; cy += (my - cy) * .28;
    cur.style.transform = 'translate3d(' + (cx + 18).toFixed(1) + 'px,' + (cy + 20).toFixed(1) + 'px,0)';
    requestAnimationFrame(tick);
  }

  stage.addEventListener('wheel', function (e) {
    if (!matchMedia('(min-width: 821px)').matches) return;
    e.preventDefault();
    var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    vel = Math.max(-2400, Math.min(2400, vel + d * 3));
  }, { passive: false });
  stage.addEventListener('pointerdown', function (e) {
    drag = true; lastX = e.clientX; lastT = performance.now(); flick = 0; vel = 0; moved = 0;
    stage.classList.add('dragging'); stage.setPointerCapture(e.pointerId); cur.classList.remove('show');
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastT);
    x -= dx; moved += Math.abs(dx); flick = flick * .6 + (-dx / dt * 1000) * .4; lastX = e.clientX; lastT = now;
  });
  function release(e) {
    if (!drag) return;
    drag = false; stage.classList.remove('dragging');
    if (e.type === 'pointerup' && moved < 6) { requestClose(); return; }      // a click, not a drag: back
    vel = Math.max(-2400, Math.min(2400, flick));
    if (e.pointerType === 'mouse') cur.classList.add('show');
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  /* ---- "Back" label near the cursor, only outside the orange sheet ---- */
  pv.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    over = !e.target.closest('.pv-sheet') && !e.target.closest('.pv-touchback');
    cur.classList.toggle('show', over && !drag);
  });
  pv.addEventListener('pointerleave', function () { cur.classList.remove('show'); });

  /* ---- open / close ---- */
  function insetFor(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect(), w = root.clientWidth, h = root.clientHeight;
    if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return null;
    return 'inset(' + Math.max(0, r.top) + 'px ' + Math.max(0, w - r.right) + 'px ' + Math.max(0, h - r.bottom) + 'px ' + Math.max(0, r.left) + 'px)';
  }
  function open(fromEl, instant) {
    if (isOpen) return;
    clearTimeout(doneT);
    isOpen = true; lastFocus = document.activeElement; curInit = false;
    pv.classList.remove('fade', 'is-closing'); pv.classList.add('is-on');
    pv.setAttribute('aria-hidden', 'false'); mainEl.inert = true; root.classList.add('pv-open');
    stage.scrollLeft = 0; x = 0; vel = 0; build();
    var from = insetFor(fromEl);
    if (instant || reduce || !from) {
      pv.style.clipPath = 'none'; pv.getBoundingClientRect(); pv.classList.add('is-open');
    } else {
      pv.style.transition = 'none'; pv.style.clipPath = from; pv.getBoundingClientRect(); pv.style.transition = '';
      pv.classList.add('is-open'); pv.style.clipPath = 'inset(0px 0px 0px 0px)';
      doneT = setTimeout(function () { if (isOpen) pv.style.clipPath = 'none'; }, 950);
    }
    last = performance.now(); requestAnimationFrame(tick);
    var b = pv.querySelector('.pv-back'); if (b) b.focus({ preventScroll: true });
  }
  function finish() {
    pv.classList.remove('is-on', 'is-closing', 'fade'); pv.style.clipPath = ''; pv.style.transition = '';
    pv.setAttribute('aria-hidden', 'true'); mainEl.inert = false; root.classList.remove('pv-open');
    cur.classList.remove('show');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; clearTimeout(doneT); cur.classList.remove('show');
    var to = insetFor(opener);
    pv.classList.add('is-closing'); pv.classList.remove('is-open');
    if (reduce) { finish(); return; }
    if (to) {
      pv.style.transition = 'none'; pv.style.clipPath = 'inset(0px 0px 0px 0px)'; pv.getBoundingClientRect(); pv.style.transition = '';
      pv.style.clipPath = to;
    } else pv.classList.add('fade');
    doneT = setTimeout(finish, 800);
  }
  function requestClose() {
    if (history.state && history.state.pv) history.back();
    else { close(); if (location.hash === '#subspace') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} } }
  }
  Array.prototype.forEach.call(pv.querySelectorAll('[data-pv-back]'), function (b) { b.addEventListener('click', requestClose); });
  addEventListener('keydown', function (e) { if (isOpen && e.key === 'Escape') requestClose(); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-work="subspace"]');
    if (!a || a.closest('.pv')) return;
    e.preventDefault(); opener = subOpener();
    try { history.pushState({ pv: 1 }, '', '#subspace'); } catch (err) {}
    open(opener);
  });
  addEventListener('popstate', function () {
    if (location.hash === '#subspace') { if (!isOpen) { opener = subOpener(); open(opener); } }
    else if (isOpen) close();
  });
  if (location.hash === '#subspace') {
    document.addEventListener('loader:done', function () { opener = subOpener(); open(opener, true); });
  }
  addEventListener('resize', function () { if (isOpen) build(); });
})();
