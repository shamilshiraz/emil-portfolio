
/* loader: white blobs drift in from all over the black screen and merge into clean round braille dots for "emil hassan";
   after a beat the dots swell and flood the screen white, and the page fades in underneath */
(function () {
  var root = document.documentElement;
  var ov = document.getElementById('loader'), cv = document.getElementById('ldCv'), pct = document.getElementById('ldPct');
  var ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  root.classList.add('is-loading'); root.classList.remove('pre');

  // Grade 1 braille, dot numbers per letter (1-3 down the left column, 4-6 down the right)
  var DOTS = { e: [1, 5], m: [1, 3, 4], i: [2, 4], l: [1, 2, 3], h: [1, 2, 5], a: [1], s: [2, 3, 4], n: [1, 3, 4, 5] };
  var CELLS = 'emil hassan'.split('');

  // timeline (seconds): blobs arrive, hold as clean dots, flood white, fade to the page
  var D1 = 1.5, STAG = 1.1, HOLD = 1.0, FLOOD = 1.05, FADE = .45, PER_DOT = 5;
  var T_ARR = STAG + D1, T_FLOOD = T_ARR + HOLD;

  var M = 60, W = 0, H = 0, DPR = 1, NB = 0, ND = 0, Rd = 10, Rend = 1000, blurCss = '';
  var dx_, dy_, sx, sy, bx, by, r0, bd, cu;
  var built = false, done = false, sharp = false, t0 = 0, shown = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function inOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function size() {
    W = root.clientWidth; H = root.clientHeight; DPR = Math.min(2, devicePixelRatio || 1);
    // the canvas bleeds past the screen so the blur never darkens the edges
    cv.width = Math.round((W + 2 * M) * DPR); cv.height = Math.round((H + 2 * M) * DPR);
    cv.style.left = cv.style.top = -M + 'px'; cv.style.width = (W + 2 * M) + 'px'; cv.style.height = (H + 2 * M) + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, M * DPR, M * DPR);
  }

  function build() {
    size();
    // braille layout, centred
    var s = Math.min(44, W * .84 / (10 * 2.4 + 1)), pitch = s * 2.4;
    Rd = s * .34; Rend = Math.hypot(W, H);
    var totalW = 10 * pitch + s, ox = (W - totalW) / 2, oy = H / 2 - s, dots = [];
    CELLS.forEach(function (ch, ci) {
      (DOTS[ch] || []).forEach(function (k) {
        var col = k >= 4 ? 1 : 0, row = k >= 4 ? k - 4 : k - 1;
        dots.push([ox + ci * pitch + col * s, oy + row * s]);
      });
    });
    ND = dots.length; NB = ND * PER_DOT;
    dx_ = new Float32Array(ND); dy_ = new Float32Array(ND);
    for (var d = 0; d < ND; d++) { dx_[d] = dots[d][0]; dy_[d] = dots[d][1]; }
    sx = new Float32Array(NB); sy = new Float32Array(NB); bx = new Float32Array(NB); by = new Float32Array(NB);
    r0 = new Float32Array(NB); bd = new Float32Array(NB); cu = new Float32Array(NB);
    for (var i = 0; i < NB; i++) {
      bx[i] = dx_[i % ND]; by[i] = dy_[i % ND];               // every blob lands on its dot's exact centre
      r0[i] = Rd * rnd(.9, 2.4);
      sx[i] = Math.random(); sy[i] = Math.random();
      bd[i] = rnd(0, STAG); cu[i] = rnd(-.3, .3);
    }
    // blur merges blobs while they travel; contrast snaps the result back to crisp white shapes
    blurCss = 'blur(' + Math.max(1.5, Rd * .42).toFixed(1) + 'px) contrast(26)';
    cv.style.filter = blurCss; sharp = false;
    built = true;
  }

  function frame(now) {
    if (done) return;
    requestAnimationFrame(frame);
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;

    // once every blob has landed, drop the blur so the braille is plain, perfectly round dots
    if (!sharp && t >= T_ARR + .05 && t < T_FLOOD) { cv.style.filter = 'none'; sharp = true; }
    if (sharp && t >= T_FLOOD) { cv.style.filter = blurCss; sharp = false; }

    ctx.fillStyle = '#000'; ctx.fillRect(-M, -M, W + 2 * M, H + 2 * M);
    ctx.fillStyle = '#fff'; ctx.beginPath();
    var f = 0;
    if (t < T_FLOOD) {
      for (var i = 0; i < NB; i++) {
        var l = t - bd[i]; if (l <= 0) continue;
        var g = Math.min(1, l / .4); g = g * g * (3 - 2 * g);                // pop in
        var u = clamp(l / D1, 0, 1), e = inOut(u);
        var ax = sx[i] * W, ay = sy[i] * H, dx = bx[i] - ax, dy = by[i] - ay, k = Math.sin(Math.PI * e) * cu[i];
        var x = ax + dx * e - dy * k, y = ay + dy * e + dx * k, r = (r0[i] + (Rd - r0[i]) * e) * g;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832);
      }
    } else {
      f = clamp((t - T_FLOOD) / FLOOD, 0, 1);
      var R = Rd + (Rend - Rd) * f * f * f;                                  // slow start, then it swallows the screen
      for (var d = 0; d < ND; d++) { ctx.moveTo(dx_[d] + R, dy_[d]); ctx.arc(dx_[d], dy_[d], R, 0, 6.2832); }
    }
    ctx.fill();

    // counter follows the timeline but eases toward it, so it never jumps
    var p = clamp(t / (T_FLOOD - .25), 0, 1), target = 100 * (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    shown += (target - shown) * .14;
    var v = t >= T_FLOOD ? 100 : Math.min(100, Math.round(shown));
    pct.textContent = v + '%'; ov.setAttribute('aria-valuenow', v);

    if (f >= 1) fadeOut();
  }

  function finish() { ov.remove(); document.dispatchEvent(new Event('loader:done')); }
  function fadeOut() {
    if (done) return; done = true; root.classList.remove('is-loading');
    ov.style.transition = 'opacity ' + FADE + 's ease'; ov.style.opacity = 0;
    setTimeout(finish, FADE * 1000 + 60);
  }

  function start() {
    build();
    if (reduce) { done = false; fadeOut(); return; }
    requestAnimationFrame(frame);
  }

  var fontReady = Promise.race([
    document.fonts && document.fonts.load ? document.fonts.load('400 96px "Libre Caslon Text"') : Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 2500); })
  ]).then(function () { return document.fonts && document.fonts.ready ? document.fonts.ready : null; });
  fontReady.then(start, start);

  var rt;
  addEventListener('resize', function () {
    if (!built || done) return;
    clearTimeout(rt); rt = setTimeout(build, 120);
  });
})();
