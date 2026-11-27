/*
 * createWorks.js — the imperative engine behind <SelectedWorks />.
 *
 * CAROUSEL MODE: the strip no longer follows page scroll. It moves with the ← → buttons,
 * keyboard arrows, drag and horizontal trackpad swipes. The section is one screen tall.
 * The centre cloth is drawn bigger, the side cloths smaller (see CENTER_SCALE / SIDE_SCALE).
 *
 * React owns: the markup, the text inside the detail panel, and the buttons.
 * The returned API → { open, close, go, step, skipToContact, destroy }
 */
import * as THREE from 'three';
import { Poster } from './Cloth.js';
import { clamp, lerp, pad } from './utils.js';

const ASPECT = 420 / 595;  // cloth height / width, matches the poster images
const DIST = 1400;         // camera distance
const SWAP_MS = 320;       // how long the old text/photos fade out before the new ones are put in
const CENTER_SCALE = 1.3;  // size of the centre cloth
const SIDE_SCALE = 0.82;   // size of the left / right cloths
const SPACING = 1.3;       // distance between cloths (× cloth width) — keeps 3 on screen

function loadImg(src) {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}

export function createWorks({ els, projects, hooks }) {
  const { stage, works, canvas, nowebgl, dot, tip, count: countEl, prog, panel, gallery: galEl, grid: gridEl } = els;
  const POSTERS = projects.map((p) => ({ ...p })); // engine adds .el (loaded image) to its own copies
  const N = POSTERS.length;
  const root = document.documentElement;

  // ---- tidy bookkeeping so React StrictMode / unmount can fully tear this down
  let destroyed = false;
  let raf = 0;
  const cleanups = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  const api = { open() {}, close() {}, go() {}, step() {}, skipToContact() {}, destroy() { destroyed = true; cleanups.forEach((f) => f()); } };

  /* ---------- renderer ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    nowebgl.style.display = 'flex';
    return api;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.autoClear = false; // every cloth layer is drawn in its own pass (see tick)
  const camera = new THREE.PerspectiveCamera(40, 1, 10, 5000);
  camera.position.z = DIST;
  let W = stage.clientWidth || innerWidth, H = stage.clientHeight || innerHeight;

  let posters = [], gal = null, galGo = 0, layerSeq = 10;
  let PW, PH, PITCH, TOTAL;
  let lastW = 0, lastH = 0;

  function resize() {
    const nw = stage.clientWidth, nh = stage.clientHeight;
    if (posters.length && nw === lastW && Math.abs(nh - lastH) < 140) return; // mobile URL-bar jitter
    lastW = W = nw; lastH = H = nh;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = 2 * Math.atan(H / 2 / DIST) * 180 / Math.PI;
    camera.updateProjectionMatrix();
    PW = Math.min(W * (W < 800 ? .72 : .27), 470);
    PH = PW * ASPECT;
    if (PH > H * .6) { PH = H * .6; PW = PH / ASPECT; }
    PITCH = PW * SPACING; TOTAL = PITCH * N;
    works.style.height = H + 'px'; // one screen tall — no long scroll
    posters.forEach((p) => p.layout(PW, PH));
    if (gal) gal.layout(PW, PH);
    if (openIdx >= 0) layoutGallery();
  }

  // centre cloth big, neighbours small, smooth in between
  function scaleAt(sx) {
    const f = clamp(1 - Math.abs(sx) / PITCH, 0, 1);
    return lerp(SIDE_SCALE, CENTER_SCALE, f);
  }

  /* ---------- state / input ---------- */
  let target = 0, cur = 0, snapTimer = null, openIdx = -1, swapT = null, hovShown = -1;
  let vis = false, introDone = false;
  const ptr = { on: false, x: 0, y: 0, cx: 0, cy: 0, down: false };
  const PTR_OFF = { on: false, x: 0, y: 0, down: false };
  function scheduleSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => { if (openIdx < 0 && !dragging) target = Math.round(target / PITCH) * PITCH; }, 140);
  }

  // ← / → : one project at a time (or Prev / Next while a project is open)
  function step(dir) {
    if (openIdx >= 0) { go(dir); return; }
    clearTimeout(snapTimer);
    target = Math.round(target / PITCH) * PITCH + dir * PITCH;
  }

  // horizontal trackpad swipes still spin the loop
  on(canvas, 'wheel', (e) => {
    if (openIdx >= 0) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { target += e.deltaX * (e.deltaMode === 1 ? 30 : 1) * 1.1; scheduleSnap(); }
  }, { passive: true });

  let dragging = false, dragX = 0, moved = 0, dragVel = 0;
  const stageRect = () => stage.getBoundingClientRect();
  function setPtr(e) {
    ptr.cx = e.clientX; ptr.cy = e.clientY; ptr.on = true;
    dot.style.opacity = 1; dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    const flip = e.clientX > innerWidth - 260;
    tip.style.transform = 'translate(' + (flip ? e.clientX - 16 : e.clientX + 16) + 'px,' + (e.clientY + 18) + 'px)' + (flip ? ' translateX(-100%)' : '');
  }
  on(canvas, 'pointerdown', (e) => {
    dragging = true; ptr.down = true; dot.classList.add('down'); dragX = e.clientX; moved = 0; dragVel = 0; setPtr(e);
    canvas.setPointerCapture(e.pointerId);
  });
  on(canvas, 'pointermove', (e) => {
    setPtr(e);
    if (!dragging) return;
    const mx = e.clientX - dragX; dragX = e.clientX;
    moved += Math.abs(mx) + Math.abs(e.movementY || 0);
    if (openIdx < 0 && moved > 4) { target -= mx * 1.3; dragVel = mx; }
  });
  on(canvas, 'pointerleave', () => { if (!dragging) { ptr.on = false; dot.style.opacity = 0; } });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false; ptr.down = false; dot.classList.remove('down');
    if (moved < 8) clickAt(e.clientX, e.clientY);
    else if (openIdx < 0) { target -= dragVel * 8; scheduleSnap(); }
  }
  on(canvas, 'pointerup', endDrag);
  on(canvas, 'pointercancel', () => { dragging = false; ptr.down = false; dot.classList.remove('down'); });
  // on the detail page the panes sit above the canvas, so keep the cursor and cloth tracking global
  on(window, 'pointermove', (e) => { if (openIdx >= 0 && e.target !== canvas) setPtr(e); });
  on(window, 'pointerover', (e) => { if (openIdx >= 0) dot.classList.toggle('hov', !!(e.target.closest && e.target.closest('button,a'))); });
  on(window, 'keydown', (e) => {
    if (e.key === 'Escape') { closeDetail(); return; }
    if (!vis) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  // while a project is open the page is locked
  on(window, 'touchmove', (e) => { if (openIdx >= 0 && !(e.target.closest && e.target.closest('#gal, #pd .main'))) e.preventDefault(); }, { passive: false });

  /* ---------- detail page ---------- */
  function openLayout() {
    const g = 3, ox = W * .06, oy = H * .06, narrow = W < 800;
    let A, B;
    if (narrow) {
      const sy = H * .5;
      A = { x0: -ox, x1: W + ox, y0: -oy, y1: sy - g };
      B = { x0: -ox, x1: W + ox, y0: sy + g, y1: H + oy };
    } else {
      const sx = W / 3;
      A = { x0: -ox, x1: sx - g, y0: -oy, y1: H + oy };
      B = { x0: sx + g, x1: W + ox, y0: -oy, y1: H + oy };
    }
    const f = (r) => ({ x: (r.x0 + r.x1) / 2 - W / 2, y: H / 2 - (r.y0 + r.y1) / 2, scx: (r.x1 - r.x0) / PW, scy: (r.y1 - r.y0) / PH });
    const a = f(A), b = f(B);
    b.ex = b.x + (narrow ? 0 : W * .72);
    b.ey = b.y - (narrow ? H * .62 : 0);
    return { a, b };
  }
  const dTint = new THREE.Color(1, 1, 1), dTintT = new THREE.Color(1, 1, 1);
  function tintDetails(i, snap) {
    const c = new THREE.Color(POSTERS[i].accent);
    dTintT.setRGB(c.r * 1.14, c.g * 1.14, c.b * 1.14);
    if (snap) dTint.copy(dTintT);
  }

  /* ---------- gallery (endless) ---------- */
  let gy = 0, gcur = 0, gInert = 0, gDrag = false, gLastY = 0, gLastT = 0, gCols = [];
  function buildGallery(d) {
    gy = gcur = gInert = 0;
    gridEl.innerHTML = ''; gCols = [];
    const list = (d.gallery && d.gallery.length) ? d.gallery.slice(0, 8) : null;
    const ratios = ['4/5', '1/1', '3/4', '4/3', '1/1', '4/5', '3/2', '1/1'];
    const n = list ? list.length : 8;
    for (let c = 0; c < 2; c++) {
      const col = document.createElement('div'); col.className = 'col';
      const set = document.createElement('div'); set.className = 'set';
      for (let k = c; k < n; k += 2) {
        const t = document.createElement('div'); t.className = 'tile'; t.style.setProperty('--i', k);
        t.style.aspectRatio = ratios[k % ratios.length];
        if (list) { t.style.backgroundImage = 'url("' + list[k] + '")'; t.style.backgroundSize = 'cover'; t.style.backgroundPosition = 'center'; }
        set.appendChild(t);
      }
      col.appendChild(set); gridEl.appendChild(col); gCols.push({ el: col, P: 0 });
    }
    layoutGallery();
  }
  function layoutGallery() {
    const hh = galEl.clientHeight || H;
    gCols.forEach((c) => {
      while (c.el.children.length > 1) c.el.removeChild(c.el.lastChild);
      const set = c.el.firstChild, P = set.offsetHeight;
      c.P = P;
      if (P > 0) { const copies = Math.ceil(hh / P) + 1; for (let k = 0; k < copies; k++) c.el.appendChild(set.cloneNode(true)); }
    });
  }
  function galStep() {
    if (!gDrag) { gy += gInert; gInert *= .93; if (Math.abs(gInert) < .02) gInert = 0; }
    const prev = gcur; gcur += (gy - gcur) * .14;
    gal.kick = Math.min(Math.abs(gcur - prev) * .8, 36);
    for (const c of gCols) { if (c.P > 0) { const m = ((gcur % c.P) + c.P) % c.P; c.el.style.transform = 'translate3d(0,' + (-m).toFixed(2) + 'px,0)'; } }
  }
  on(galEl, 'wheel', (e) => { e.preventDefault(); gy += e.deltaY * (e.deltaMode === 1 ? 30 : 1) * .9; gInert = 0; }, { passive: false });
  on(galEl, 'pointerdown', (e) => { gDrag = true; gLastY = e.clientY; gLastT = performance.now(); gInert = 0; galEl.setPointerCapture(e.pointerId); });
  on(galEl, 'pointermove', (e) => { if (!gDrag) return; const dy = e.clientY - gLastY; gLastY = e.clientY; gLastT = performance.now(); gy -= dy; gInert = -dy * .9; });
  const gEnd = () => { gDrag = false; if (performance.now() - gLastT > 80) gInert = 0; };
  on(galEl, 'pointerup', gEnd); on(galEl, 'pointercancel', gEnd);

  function slideX(i) { let sx = (((i * PITCH - cur) % TOTAL) + TOTAL) % TOTAL; if (sx > TOTAL / 2) sx -= TOTAL; return sx; }
  function clickAt(px, py) {
    if (openIdx >= 0) return;
    const r = stageRect();
    const lx = px - r.left - W / 2, ly = H / 2 - (py - r.top); let best = -1;
    posters.forEach((p) => {
      const sx = slideX(p.i), s = scaleAt(sx);
      if (Math.abs(lx - sx) < PW * s / 2 && Math.abs(ly) < PH * s / 2) best = p.i;
    });
    if (best >= 0) openDetail(best);
  }

  function fill(i) {
    hooks.onContent(i);
    buildGallery(POSTERS[i]);
  }

  function openDetail(i) {
    // bring the section fully on screen so the detail view fills the window
    window.scrollTo({ top: works.getBoundingClientRect().top + scrollY, behavior: 'instant' });
    openIdx = i; posters[i].layer = ++layerSeq; fill(i); tintDetails(i, posters.every((p) => p.o < .05)); galGo = 0;
    target = cur + slideX(i); // centre this cloth before it stretches
    clearTimeout(swapT);
    root.classList.add('open');
    panel.classList.remove('nav');
    panel.classList.add('on');
    tip.classList.remove('on'); hovShown = -1;
  }
  function closeDetail() {
    if (openIdx < 0) return;
    openIdx = -1; clearTimeout(swapT);
    root.classList.remove('open'); panel.classList.remove('on'); panel.classList.remove('nav');
    target = Math.round(cur / PITCH) * PITCH;
  }

  function transferCloth(from, to) {
    to.p.set(from.p); to.q.set(from.q);
    to.o = from.o; to.a = 1; to.layer = from.layer;
    to.lastAx = from.lastAx; to.lastAy = from.lastAy;
    to.lsx = -1; to.init = true; to.rh = 0;
    to.mesh.visible = true;
    from.o = 0; from.layer = 1; from.a = .08; from.hide();
  }
  function go(dir) {
    if (openIdx < 0) return;
    const old = openIdx, ni = (openIdx + dir + N) % N;
    if (ni === old) return;
    transferCloth(posters[old], posters[ni]);
    openIdx = ni; tintDetails(ni, false);
    target = cur + slideX(ni); cur = target;
    panel.classList.add('nav');
    panel.classList.remove('on');
    clearTimeout(swapT);
    swapT = setTimeout(() => { if (openIdx === ni) { fill(ni); panel.classList.add('on'); } }, SWAP_MS);
  }
  api.open = openDetail; api.close = closeDetail; api.go = go; api.step = step;

  /* ---------- loop ---------- */
  let shown = -1; const t0 = performance.now();
  function tick() {
    raf = requestAnimationFrame(tick);
    if (!vis) return;
    const time = (performance.now() - t0) / 1000;
    const rect = stageRect();
    if (ptr.on) { ptr.x = ptr.cx - rect.left - W / 2; ptr.y = H / 2 - (ptr.cy - rect.top); }
    dTint.lerp(dTintT, .08);
    cur += (target - cur) * .085;
    if (Math.abs(target - cur) < .01) cur = target;
    const ov = openIdx >= 0 ? 1 : 0, L = openLayout(), ot = L.a, now = performance.now();
    if (ov) { if (!galGo) galGo = now + 260; } else galGo = 0;
    gal.o += (((ov && now >= galGo) ? 1 : 0) - gal.o) * .055;
    const reach = W / 2 + PW * 1.5;
    const hl = (ptr.on && !ov && !dragging) ? ptr : null;
    const openP = ov ? posters[openIdx] : null;
    const covered = !!openP && gal.o > .95 && openP.o > .9;
    const inRect = (r) => ptr.on && Math.abs(ptr.x - r.x) < PW * r.scx / 2 && Math.abs(ptr.y - r.y) < PH * r.scy / 2;
    const ptrA = inRect(L.a) ? ptr : PTR_OFF, ptrB = (ov && inRect(L.b)) ? ptr : PTR_OFF;
    let nearest = 0, nd = 1e9, hov = -1;
    posters.forEach((p) => {
      const sx = slideX(p.i);
      const bs = scaleAt(sx); // centre big, sides small
      const mine = p.i === openIdx;
      p.o += ((mine ? 1 : 0) - p.o) * .075;
      if (Math.abs(sx) < nd) { nd = Math.abs(sx); nearest = p.i; }
      if (hl && Math.abs(hl.x - sx) < PW * bs / 2 && Math.abs(hl.y) < PH * bs / 2) hov = p.i;
      const o = p.o;
      const ax = lerp(sx, ot.x, o), ay = lerp(0, ot.y, o), scx = lerp(bs, ot.scx, o), scy = lerp(bs, ot.scy, o), az = o * 60;
      p.a += ((ov && !mine ? .08 : 1) - p.a) * .15;
      p.mat.uniforms.uA.value = p.a;
      const mx = Math.min(1, o * 1.1); p.mat.uniforms.uMix.value = mx;
      p.mat.uniforms.uTint.value.setRGB(lerp(1, dTint.r, mx), lerp(1, dTint.g, mx), lerp(1, dTint.b, mx));
      if (!mine && p.layer > 1 && o < .01) p.layer = 1;
      if (covered && !mine && o < .01) { p.hide(); p.lastAx = ax; }
      else if (Math.abs(ax) < reach || o > .01) { p.mesh.visible = true; p.step(ax, ay, az, scx, scy, TOTAL, time, mine ? (p === openP ? ptrA : PTR_OFF) : ptr, o > .001); }
      else { p.hide(); p.lastAx = ax; }
    });
    if (gal.o > .004) {
      const e = L.b, go = gal.o;
      if (ov) galStep(); else gal.kick = 0;
      gal.tintStep();
      gal.mesh.visible = true;
      gal.step(lerp(e.ex, e.x, go), lerp(e.ey, e.y, go), 38 + 30 * go, e.scx, e.scy, TOTAL, time, ptrB, true);
    } else if (gal.mesh.visible) gal.hide();
    if (hov !== hovShown) {
      hovShown = hov;
      if (hov >= 0) { tip.innerHTML = '<span>' + pad(hov + 1) + '</span>' + POSTERS[hov].name + ' ↗'; tip.classList.add('on'); }
      else tip.classList.remove('on');
      dot.classList.toggle('hov', hov >= 0);
    }
    const idx = openIdx >= 0 ? openIdx : nearest;
    if (idx !== shown) {
      shown = idx;
      countEl.textContent = POSTERS[idx].name;
    }
    renderer.clear();
    const list = posters.concat(gal).filter((c) => c.isDrawn()).sort((x, y) => x.layer - y.layer || x.i - y.i);
    let lastLayer = -1;
    for (const c of list) { if (c.layer !== lastLayer) { renderer.clearDepth(); lastLayer = c.layer; } renderer.render(c.scene, camera); }
  }

  function start() {
    if (destroyed) return;
    posters = POSTERS.map((d, i) => new Poster(i, d));
    gal = new Poster(N, { name: 'gallery', bg: '#ffffff', tint: '#ffffff' });
    gal.setTint('#ffffff', 1.2, true);
    gal.layer = 1e6;
    resize();
    target = cur = 0;
    on(window, 'resize', resize);
    const io = new IntersectionObserver((es) => {
      vis = es[es.length - 1].isIntersecting;
      if (vis && !introDone) { introDone = true; cur = target - 1600; } // cloths fly in the first time the strip appears
      if (!vis) { posters.forEach((p) => p.hide()); gal.hide(); tip.classList.remove('on'); hovShown = -1; }
    });
    io.observe(stage);
    cleanups.push(() => io.disconnect());
    tick();
  }

  api.destroy = () => {
    destroyed = true;
    cancelAnimationFrame(raf);
    clearTimeout(snapTimer); clearTimeout(swapT);
    cleanups.forEach((f) => f());
    root.classList.remove('open');
    posters.forEach((c) => c.dispose());
    if (gal) gal.dispose();
    renderer.dispose();
  };

  Promise.all([
    Promise.race([
      document.fonts ? document.fonts.load('700 100px "Host Grotesk"') : Promise.resolve(),
      new Promise((r) => setTimeout(r, 1500)),
    ]),
    ...POSTERS.map((d) => loadImg(d.image).then((im) => { d.el = im; })),
  ]).then(start, start);

  return api;
}