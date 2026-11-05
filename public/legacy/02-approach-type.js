
/* approach statement: types once when it scrolls into view, then keeps a blinking caret */
(function () {
  var section = document.getElementById('approach');
  var out = document.getElementById('approachText');
  var caret = document.getElementById('approachCaret');
  var full = "I like seeing the bigger picture, but I'm equally interested in the details that make it work";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false;
  function type(i) {
    if (i > full.length) return;
    out.textContent = full.slice(0, i);
    setTimeout(function () { type(i + 1); }, 24 + Math.random() * 30);
  }
  function start() {
    if (started) return; started = true;
    if (reduce) { out.textContent = full; return; }
    setTimeout(function () { type(1); }, 350);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
    }, { threshold: 0.6 });
    io.observe(section);
  } else { out.textContent = full; }
})();
