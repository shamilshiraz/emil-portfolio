
/* scroll hint: if the visitor just sits there for 2s after the loader, ease the page down a little and back so the box
   opening between "Emil" and "Hassan" shows there is something inside. Any real input cancels it for good. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var track = document.getElementById('track'), stage = document.getElementById('stage');
  var timer = 0, raf = 0, stopped = false, pulses = 0;
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  function stop() {
    stopped = true; clearTimeout(timer); cancelAnimationFrame(raf);
    evs.forEach(function (e) { removeEventListener(e, stop); });
  }
  evs.forEach(function (e) { addEventListener(e, stop, { passive: true }); });

  function pulse() {
    if (stopped || scrollY > 4) return;
    var peak = (track.offsetHeight - stage.clientHeight) * .17, up = 1000, hold = 350, down = 1100, t0 = performance.now();
    (function step(now) {
      if (stopped) return;
      var t = now - t0, y;
      if (t < up) y = peak * ease(t / up);
      else if (t < up + hold) y = peak;
      else if (t < up + hold + down) y = peak * (1 - ease((t - up - hold) / down));
      else { scrollTo(0, 0); if (++pulses < 2) timer = setTimeout(pulse, 3500); return; }
      scrollTo(0, y);
      raf = requestAnimationFrame(step);
    })(t0);
  }
  document.addEventListener('loader:done', function () { if (!stopped) timer = setTimeout(pulse, 2000); });
})();
