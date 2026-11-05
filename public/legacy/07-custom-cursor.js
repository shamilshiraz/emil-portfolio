
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var root = document.documentElement, el = document.getElementById('cur');
  root.classList.add('has-cur');
  var x = -100, y = -100, tx = -100, ty = -100, s = 1, ts = 1, seen = false;
  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    tx = e.clientX; ty = e.clientY;
    if (!seen) { x = tx; y = ty; seen = true; el.style.opacity = 1; }
    ts = e.target.closest && e.target.closest('a[href]:not([data-soon]), button, [data-grab]') ? 2.6 : 1;     // grows a little over things you can click
    var inHero = !!(e.target.closest && e.target.closest('#site')); el.classList.toggle('plain', inHero); el.classList.toggle('in-hero', inHero);             // plain white inside the portrait, inverting everywhere else
  }, { passive: true });
  addEventListener('scroll', function () {                                                       // the page moved under a still cursor
    var t = document.elementFromPoint(tx, ty); var ih = !!(t && t.closest('#site')); el.classList.toggle('plain', ih); el.classList.toggle('in-hero', ih);
  }, { passive: true });
  function hide() { el.style.opacity = 0; seen = false; }
  root.addEventListener('mouseleave', hide);
  addEventListener('blur', hide);
  (function loop() {
    x += (tx - x) * .55; y += (ty - y) * .55; s += (ts - s) * .2;
    el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
    requestAnimationFrame(loop);
  })();
})();
