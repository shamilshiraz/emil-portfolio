
/* works drawer: tabs are drawn as one continuous outline per card; hovering or focusing a tab pulls that card up */
(function () {
  var dw = document.getElementById('dw'); if (!dw) return;
  var NS = 'http://www.w3.org/2000/svg';
  var folds = [].slice.call(dw.querySelectorAll('.dw-fold')), back = dw.querySelector('.dw-back');
  var peek = document.getElementById('dwPeek'), cat = document.getElementById('dwCat'), nm = document.getElementById('dwName'),
      blurb = document.getElementById('dwBlurb'), opn = document.getElementById('dwOpen');
  var cur = 0, lastType = 'mouse', swapT = 0, tabCat = document.getElementById('dwTabCat');
  // the fan of images on the card reuses the project strip's photos
  (function () {
    var src = [].map.call(document.querySelectorAll('#pvSet .pv-ph img'), function (i) { return i.src; });
    [].forEach.call(dw.querySelectorAll('.dw-img'), function (im) { var u = src[+im.dataset.pick]; if (u) im.src = u; });
  })();

  function mk(svg, cls) { var p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); svg.appendChild(p); return p; }
  function shape(el) {
    var svg = el.querySelector('.dw-svg'), tab = el.querySelector('.dw-tab');
    var W = el.offsetWidth, H = el.offsetHeight, tx = tab.offsetLeft, tw = tab.offsetWidth, th = tab.offsetHeight;
    var r = Math.min(14, th * .4), s = Math.round(th * .5), x2 = tx + tw;
    if (!svg._p) { svg._p = [mk(svg, 'dw-fill'), mk(svg, 'dw-tabfill'), mk(svg, 'dw-line')]; }
    var tabD = 'M' + (tx - 6) + ' ' + th + ' Q' + tx + ' ' + th + ' ' + (tx + 4) + ' ' + (th - 9) +
      ' L' + (tx + s - 3) + ' 7 Q' + (tx + s - 1) + ' 0 ' + (tx + s + 8) + ' 0 H' + (x2 - s - 8) +
      ' Q' + (x2 - s + 1) + ' 0 ' + (x2 - s + 3) + ' 7 L' + (x2 - 4) + ' ' + (th - 9) + ' Q' + x2 + ' ' + th + ' ' + (x2 + 6) + ' ' + th;
    var d = 'M0 ' + H + ' V' + (th + r) + ' Q0 ' + th + ' ' + r + ' ' + th + ' H' + (tx - 6) + ' ' + tabD.slice(tabD.indexOf('Q')) +
      ' H' + (W - r) + ' Q' + W + ' ' + th + ' ' + W + ' ' + (th + r) + ' V' + H + ' Z';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg._p[0].setAttribute('d', d); svg._p[2].setAttribute('d', d); svg._p[1].setAttribute('d', tabD + ' Z');
  }
  function draw() { shape(back); folds.forEach(shape); }
  draw();
  if (window.ResizeObserver) new ResizeObserver(draw).observe(dw); else addEventListener('resize', draw);

  var cardsEl = document.getElementById('dwCards'), trackEl = document.getElementById('dwTrack'), skirtP = dw.querySelector('.dw-skirt path');
  var cardEls = [back].concat(folds), reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function progress() {
    var r = trackEl.getBoundingClientRect(), range = Math.max(1, trackEl.offsetHeight - innerHeight);
    var p = Math.min(1, Math.max(0, -r.top / range));
    return Math.min(1, p / .7);               // fully open at 70% of the pinned scroll, the rest is a rest stop
  }
  function setOpen(e) {
    var ec = ease(e), H = cardsEl.offsetHeight + 90;
    dw.style.setProperty('--fit', Math.min(1, (innerHeight - 170) / dw.offsetHeight).toFixed(4));
    dw.style.setProperty('--e', ec.toFixed(4));
    dw.classList.toggle('is-closed', e < .92);
    cardEls.forEach(function (c, k) {
      var t = Math.min(1, Math.max(0, (e - k * .06) / .5));
      c.style.setProperty('--r', ((1 - ease(t)) * H).toFixed(1) + 'px');
    });
    var q = 50 * ec;                           // front leans back as it opens: rectangle -> trapezoid
    skirtP.setAttribute('d', 'M0 0 H1000 L' + (1000 - q) + ' 100 H' + q + ' Z');
  }
  var tick2 = false;
  function onS() { if (tick2) return; tick2 = true; requestAnimationFrame(function () { tick2 = false; setOpen(progress()); }); }
  if (reduceM) { trackEl.classList.add('static'); setOpen(1); }
  else { addEventListener('scroll', onS, { passive: true }); addEventListener('resize', onS); setOpen(progress()); }

  function show(f) {
    var live = f.dataset.work === 'subspace', all = f.hasAttribute('data-all');
    cat.textContent = f.dataset.cat; tabCat.textContent = f.dataset.cat; nm.textContent = f.dataset.name;
    blurb.textContent = f.dataset.blurb; blurb.hidden = !f.dataset.blurb; opn.textContent = f.dataset.open;
    peek.classList.toggle('has-img', live);
    if (f.dataset.color) back.style.setProperty('--c', f.dataset.color);
    back.classList.toggle('is-dark', all);
    if (live) { peek.setAttribute('href', '#subspace'); peek.setAttribute('data-work', 'subspace'); }
    else if (all) { peek.setAttribute('href', '#works'); peek.removeAttribute('data-work'); }
    else { peek.removeAttribute('href'); peek.removeAttribute('data-work'); }
  }
  function setActive(i) {
    if (i === cur || i < 0) return;
    cur = i; folds.forEach(function (f, k) { f.classList.toggle('on', k === i); });
    clearTimeout(swapT); peek.classList.add('swap');
    swapT = setTimeout(function () { show(folds[i]); peek.classList.remove('swap'); }, 150);
  }
  dw.addEventListener('pointerdown', function (e) { lastType = e.pointerType; });
  dw.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;
    var f = e.target.closest('.dw-fold'); if (f) setActive(folds.indexOf(f));
  });
  dw.addEventListener('focusin', function (e) { var f = e.target.closest('.dw-fold'); if (f) setActive(folds.indexOf(f)); });
  dw.addEventListener('click', function (e) {
    var f = e.target.closest('.dw-fold'); if (!f) return;
    var i = folds.indexOf(f);
    if (f.hasAttribute('data-soon')) { e.preventDefault(); setActive(i); return; }
    if (lastType === 'touch' && cur !== i) { e.preventDefault(); e.stopPropagation(); setActive(i); }   // first tap pulls the card, second opens it
  });
})();
