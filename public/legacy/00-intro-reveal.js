
/* intro: grow the box on scroll */
(function () {
  var track = document.getElementById('track');
  var stage = document.getElementById('stage');
  var slot = document.getElementById('slot');
  var site = document.getElementById('site');
  var left = document.getElementById('left');
  var right = document.getElementById('right');
  var row = document.getElementById('row');
  var txt = document.getElementById('txt');
  var wasFull = false;
  var ticking = false;

  // landing page is always laid out at the full size the box will reach
  function sizeSite() {
    site.style.width = (stage.clientWidth + 4) + 'px';
    site.style.height = (stage.clientHeight + 4) + 'px';
  }
  sizeSite();
  window.addEventListener('resize', sizeSite);

  function update() {
    ticking = false;
    var vw = stage.clientWidth, vh = stage.clientHeight;
    var range = track.offsetHeight - vh;
    var top = -track.getBoundingClientRect().top;
    var p = Math.min(1, Math.max(0, top / range));
    var e = Math.pow(p, 1.6);
    var gap = Math.min(e * 90, 14);
    var w = e * (vw + 4), h = e * (vh + 4);
    slot.style.width = w + 'px';
    slot.style.height = h + 'px';
    left.style.marginRight = gap + 'px';
    right.style.marginLeft = gap + 'px';
    // the two words differ in width; shift the row so the box ends up exactly centred
    row.style.transform = 'translateX(' + (-(left.offsetWidth - right.offsetWidth) / 2 * e) + 'px)';
    var full = p >= 0.999;
    left.style.visibility = right.style.visibility = full ? 'hidden' : 'visible';
    // first time the page is fully open, show the text; it then stays until refresh
    if (full && !wasFull) {
      wasFull = true;
      txt.classList.add('show');
      site.dispatchEvent(new CustomEvent('sitefull', { detail: true }));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
})();
