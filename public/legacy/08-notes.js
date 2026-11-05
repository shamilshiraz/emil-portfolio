
/* notes: three on the home page, the full list and a reading view in a page that opens from the nav link like About */
(function () {
  var NOTES = [
    { slug: "brand-values-sound-the-same", title: "Most brand values sound the same", cat: "Strategy", date: "2026-10-21", read: 5, featured: true,
      ex: "Integrity, innovation, excellence. If a value fits on any company's wall, it isn't doing any work.",
      body: [
        "Open the about page of ten companies and you will find the same five words. Integrity, innovation, quality, passion, community. None of them are wrong. They are also useless, because a value only earns its place when it helps someone make a decision.",
        "The test I use is simple. Take a value and ask what the brand would give up to protect it. If the answer is nothing, it is decoration. A bakery that values freshness and still sells yesterday's bread at full price has not made a decision yet.",
        "Good values are specific enough to cause friction. They say no to a client, a channel or a shortcut. When I write them with a founder, we start from the arguments they have had in the past year, because that is where the real principles are hiding.",
        "The wording matters less than the trade. Write each value as a rule someone could break, then check whether anyone in the business would notice. If they would, you have something worth building an identity around."
      ] },
    { slug: "a-website-should-feel-like-a-place", title: "A website should feel like a place", cat: "Technology", date: "2026-10-09", read: 4, featured: true,
      ex: "Scroll, cursor and sound are the architecture. Treat them like rooms and corridors.",
      body: [
        "Most sites are a stack of sections. You arrive, you scroll, you leave. A place is different. It has an entrance, a sense of scale, and somewhere you want to linger.",
        "I think about movement before layout. How does the cursor behave when you hesitate? What happens when you scroll back up? Small answers to these questions are what make a page feel lived in rather than assembled.",
        "Restraint helps. One orchestrated moment, like a window opening onto the next scene, is more memorable than ten effects competing for attention. The rest of the page can stay quiet and let that moment land.",
        "Technology is only the material. TouchDesigner, Unity or plain JavaScript all do the same job here, which is to give people a reason to stay a little longer than they planned."
      ] },
    { slug: "the-case-for-the-small-idea", title: "The case for the small idea", cat: "Direction", date: "2026-09-28", read: 6, featured: true,
      ex: "Big concepts get the applause. Small ideas get used.",
      body: [
        "Every brief starts by asking for something big. A big idea, a big launch, a big moment. Yet the work people remember tends to be a small decision repeated with care.",
        "A small idea fits in one sentence and survives being explained by someone who was not in the room. It can be applied to a carton, a caption and a shopfront without being rewritten.",
        "That portability is the real test. If an idea needs a deck to be understood, it will not travel far beyond the people who made it.",
        "When I present concepts now, I try to show the smallest version first. If it still works at that size, we can scale it up and trust it to hold."
      ] },
    { slug: "naming-a-brand-in-a-week", title: "Naming a brand in a week", cat: "Practice", date: "2026-09-14", read: 5,
      ex: "What a tight deadline taught me about how names actually get chosen.",
      body: [
        "A client once asked for a name by Friday. My first reaction was to say it could not be done properly. By Wednesday I had changed my mind about what properly means.",
        "With a week, you skip the long search for the perfect word and start from constraints. Can it be said easily in two languages? Is the handle free? Does it survive being shouted across a shop?",
        "Those practical checks removed most of the list on their own. What remained was a handful of names that all worked, and the choice became a question of which story the founder wanted to tell.",
        "I still prefer more time. But I have stopped treating time as the thing that makes a name good. Clear criteria do most of that work."
      ] },
    { slug: "in-defence-of-low-fidelity", title: "In defence of low fidelity", cat: "Culture", date: "2026-08-30", read: 4,
      ex: "Grain, halftone and rough edges carry something that polished work often loses.",
      body: [
        "Clean renders are everywhere now, and they are easy to produce. That is exactly why a rough edge has started to feel generous.",
        "Halftone, grain and visible process tell you a person was involved. They leave room for the viewer to fill in what is missing, which is a quieter kind of engagement than perfect detail.",
        "I use these textures when a brand needs warmth or memory. They work best when they are built into the system from the start rather than sprinkled on at the end.",
        "The rule I follow is to roughen on purpose and keep the structure sharp. Loose surfaces over a firm grid look considered. Loose everything looks accidental."
      ] },
    { slug: "founders-with-strong-opinions", title: "Working with founders who have strong opinions", cat: "Practice", date: "2026-08-12", read: 6,
      ex: "How to use conviction as a resource instead of a roadblock.",
      body: [
        "Founders usually arrive with opinions about colour, type and tone. I used to treat that as resistance. I now treat it as research.",
        "An opinion is a compressed experience. When a founder says a logo feels wrong, I ask them to name the last brand that felt right and what made it so. The answers describe the audience better than most surveys.",
        "The goal is to move the conversation from taste to criteria. Once we agree what the work has to do, disagreements about how it looks become much easier to settle.",
        "It also changes the mood in the room. People defend preferences, but they will happily test a hypothesis."
      ] }
  ];

  var root = document.documentElement, nt = document.getElementById('nt'), mainEl = document.querySelector('main');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isOpen = false, opener = null, lastFocus = null, doneT = 0, pending = null, view = 'list', filter = 'All';
  var bySlug = {}; NOTES.forEach(function (n, i) { n.i = i; bySlug[n.slug] = n; });
  var views = document.getElementById('ntViews'), listEl = document.getElementById('ntList'), artEl = document.getElementById('ntArticle');
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(d) { var p = d.split('-'); return +p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* rows: the same component on the home page and on the full list */
  function rowHtml(n, full) {
    return '<li class="' + (full ? 'nt-rv' : '') + '"><a class="nt-row" href="#note-' + n.slug + '" data-note="' + n.slug + '">' +
      '<span class="nt-r-meta nt-mono"><span>' + fmt(n.date) + '</span><span>' + esc(n.cat) + '</span></span>' +
      '<span class="nt-r-main"><span class="nt-r-title">' + esc(n.title) + '</span>' + (full ? '<span class="nt-r-ex">' + esc(n.ex) + '</span>' : '') + '</span>' +
      '<span class="nt-r-end nt-mono"><span>' + n.read + ' min read</span><i class="nt-arrow" aria-hidden="true">&rarr;</i></span></a></li>';
  }

  var cats = ['All']; NOTES.forEach(function (n) { if (cats.indexOf(n.cat) < 0) cats.push(n.cat); });
  var filtersEl = document.getElementById('ntFilters'), allEl = document.getElementById('ntAll'), countEl = document.getElementById('ntCount');
  filtersEl.innerHTML = cats.map(function (c) { return '<button class="nt-f" type="button" data-filter="' + esc(c) + '" aria-pressed="' + (c === filter) + '">' + esc(c) + '</button>'; }).join('');
  function renderAll() {
    var list = NOTES.filter(function (n) { return filter === 'All' || n.cat === filter; });
    allEl.innerHTML = list.map(function (n) { return rowHtml(n, true); }).join('');
    countEl.textContent = list.length === NOTES.length ? pad(NOTES.length) + ' pieces' : pad(list.length) + ' of ' + pad(NOTES.length);
    [].forEach.call(filtersEl.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === filter)); });
    armReveal();
  }

  /* reveal on scroll, inside the sheet */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { root: nt, threshold: .12 }) : null;
  function armReveal() { [].forEach.call(nt.querySelectorAll('.nt-rv'), function (n) { if (io && !n.classList.contains('in')) io.observe(n); else n.classList.add('in'); }); }

  function fillArticle(n) {
    document.getElementById('ntaTitle').textContent = n.title;
    document.getElementById('ntaDek').textContent = n.ex;
    document.getElementById('ntaDate').textContent = fmt(n.date);
    document.getElementById('ntaCat').textContent = n.cat;
    document.getElementById('ntaRead').textContent = n.read + ' min';
    document.getElementById('ntaBody').innerHTML = n.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var nx = NOTES[(n.i + 1) % NOTES.length];
    document.getElementById('ntaNext').innerHTML = '<div class="rule-row"><span class="label">[Next note]</span><a href="#note-' + nx.slug + '" data-note="' + nx.slug + '">' + esc(nx.title) + '</a><span class="nt-count nt-mono">' + fmt(nx.date) + '</span></div>';
  }
  function apply(name, slug) {
    view = name;
    listEl.hidden = name !== 'list'; artEl.hidden = name !== 'article';
    if (name === 'article') fillArticle(bySlug[slug]); else renderAll();
    nt.scrollTop = 0; armReveal();
  }
  function setView(name, slug, animate) {
    if (!animate || !isOpen || reduce) { apply(name, slug); return; }
    views.classList.add('swap');
    setTimeout(function () { apply(name, slug); views.classList.remove('swap'); }, 220);
  }
  function go(name, slug) {
    try { history.replaceState({ nt: 1 }, '', name === 'article' ? '#note-' + slug : '#notes'); } catch (e) {}
    setView(name, slug, true);
  }
  function setNavH() { nt.style.setProperty('--nt-nav-h', nt.querySelector('.nt-nav').offsetHeight + 'px'); }
  addEventListener('resize', function () { if (isOpen) setNavH(); });

  function insetFor(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect(), w = root.clientWidth, h = root.clientHeight;
    if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w || !r.width) return null;
    return 'inset(' + Math.max(0, r.top) + 'px ' + Math.max(0, w - r.right) + 'px ' + Math.max(0, h - r.bottom) + 'px ' + Math.max(0, r.left) + 'px)';
  }
  function open(fromEl, instant) {
    if (isOpen) return;
    clearTimeout(doneT); isOpen = true; lastFocus = document.activeElement;
    nt.classList.remove('fade'); nt.classList.add('is-on'); nt.setAttribute('aria-hidden', 'false');
    mainEl.inert = true; root.classList.add('nt-open'); nt.scrollTop = 0; setNavH(); armReveal();
    var from = insetFor(fromEl);
    if (instant || reduce || !from) { nt.style.clipPath = 'none'; }
    else {
      nt.style.transition = 'none'; nt.style.clipPath = from; nt.getBoundingClientRect(); nt.style.transition = '';
      nt.style.clipPath = 'inset(0px 0px 0px 0px)'; doneT = setTimeout(function () { if (isOpen) nt.style.clipPath = 'none'; }, 950);
    }
    nt.focus({ preventScroll: true });
  }
  function finish() {
    nt.classList.remove('is-on', 'fade'); nt.style.clipPath = ''; nt.style.transition = ''; nt.setAttribute('aria-hidden', 'true');
    mainEl.inert = false; root.classList.remove('nt-open');
    if (pending) { var p = pending; pending = null; p(); }
    else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; clearTimeout(doneT);
    var to = insetFor(opener);
    if (reduce) { finish(); return; }
    if (to) {
      nt.style.transition = 'none'; nt.style.clipPath = 'inset(0px 0px 0px 0px)'; nt.getBoundingClientRect(); nt.style.transition = '';
      nt.style.clipPath = to;
    } else nt.classList.add('fade');
    doneT = setTimeout(finish, 800);
  }
  function requestClose() {
    if (history.state && history.state.nt) history.back();
    else { close(); if (/^#note/.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} } }
  }
  function navLink() { return document.querySelector('.nav nav a[href="#notes"]'); }
  function parse() {
    var h = location.hash;
    if (h === '#notes') return { v: 'list' };
    if (h.indexOf('#note-') === 0 && bySlug[h.slice(6)]) return { v: 'article', s: h.slice(6) };
    return null;
  }
  function route(instant) {
    var r = parse();
    if (!r) { if (isOpen) close(); return; }
    if (!isOpen) { opener = navLink(); apply(r.v, r.s); open(opener, instant); }
    else setView(r.v, r.s, true);
  }

  /* clicks inside the page */
  nt.addEventListener('click', function (e) {
    var row = e.target.closest('a[data-note]');
    if (row) { e.preventDefault(); go('article', row.getAttribute('data-note')); return; }
    if (e.target.closest('[data-nt-list]')) { e.preventDefault(); go('list'); return; }
    var f = e.target.closest('[data-filter]');
    if (f) { filter = f.getAttribute('data-filter'); renderAll(); return; }
    var g = e.target.closest('[data-nt-go]');
    if (!g) return;
    e.preventDefault();
    var to = g.getAttribute('data-nt-go');
    if (to === 'stay') { if (view !== 'list') go('list'); else nt.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (to === 'works') pending = function () { var w = document.getElementById('works'); if (w) w.scrollIntoView(); };
    else if (to === 'about') pending = function () { var a = document.querySelector('.nav nav a[href="#about"]'); if (a) a.click(); };
    requestClose();
  });
  addEventListener('keydown', function (e) {
    if (!isOpen || e.key !== 'Escape') return;
    if (view === 'article') go('list'); else requestClose();
  });

  /* clicks on the home page: the nav link, "view more notes" and the three selected notes */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#notes"], a[data-note]');
    if (!a || a.closest('.nt') || a.closest('.ab')) return;
    var slug = a.getAttribute('data-note');
    if (slug && !bySlug[slug]) return;
    e.preventDefault(); opener = a;
    try { history.pushState({ nt: 1 }, '', slug ? '#note-' + slug : '#notes'); } catch (err) {}
    apply(slug ? 'article' : 'list', slug);
    open(a);
  });
  addEventListener('popstate', function () { route(false); });
  if (parse()) document.addEventListener('loader:done', function () { route(true); });
})();
