
(function () {
  /* ---- edit these in one place ---- */
  var SITE = window.EMIL_SITE || {
    email: 'hello@example.com',                       // replace with your real address
    endpoint: '',                                     // optional: a form endpoint (Formspree, Web3Forms...) so messages land in your inbox directly
    socials: [
      { n: 'Instagram', u: 'https://www.instagram.com/' },   // replace with your profile links
      { n: 'LinkedIn',  u: 'https://www.linkedin.com/' },
      { n: 'Email',     u: 'mailto:hello@example.com' },
      { n: 'Behance',   u: 'https://www.behance.net/' }
    ],
    areas: ['Brand strategy', 'Creative direction', 'Brand identity', 'Campaigns', 'Culture & community', 'Creative technology', 'Interactive experiences', 'TouchDesigner', 'Unity & spatial ideas', 'Content & storytelling']
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- footer ---- */
  var set = SITE.areas.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('');
  var social = SITE.socials.map(function (s) {
    var ext = /^https?:/.test(s.u);
    return '<li><a href="' + esc(s.u) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(s.n) + '<i aria-hidden="true">' + (ext ? '\u2197' : '\u2192') + '</i></a></li>';
  }).join('');
  // page links behave like the nav of whichever page the footer sits in
  var GO = {
    home: { about: '', works: '', notes: '' },
    ab:   { about: ' data-ab-go="stay"', works: ' data-ab-go="works"', notes: ' data-ab-go="notes"' },
    nt:   { about: ' data-nt-go="about"', works: ' data-nt-go="works"', notes: ' data-nt-go="stay"' }
  };
  function build(f) {
    var g = GO[f.closest('.ab') ? 'ab' : f.closest('.nt') ? 'nt' : 'home'];
    f.innerHTML =
      '<div class="ft-bar">' +
        '<div class="ft-top">' +
          '<div class="ft-intro"><h2 class="ft-title">That’s all for<br>this scroll.</h2>' +
          '<p class="ft-copy">There’s usually more where that came from. Find me when you have something interesting in mind.</p>' +
          '<span class="ft-sign">made with curiosity</span></div>' +
          '<nav class="ft-links" aria-label="Footer">' +
            '<div><h3>[Pages]</h3><ul><li><a href="#about"' + g.about + '>About</a></li><li><a href="#works"' + g.works + '>Works</a></li><li><a href="#notes"' + g.notes + '>Notes</a></li></ul></div>' +
            '<div><h3>[Elsewhere]</h3><ul>' + social + '</ul></div>' +
          '</nav>' +
        '</div>' +
        '<div class="ft-name" aria-label="Emil Hassan"><span data-scramble>Emil Hassan</span></div>' +
        '<div class="ft-base"><span>&copy; 2026 Emil Hassan</span><span>made with curiosity</span></div>' +
      '</div>';
  }
  [].forEach.call(document.querySelectorAll('[data-footer]'), build);

  /* ---- say hello popup ---- */
  var root = document.documentElement, ct = document.getElementById('ct'), panel = document.getElementById('ctPanel');
  var form = document.getElementById('ctForm'), sendBtn = document.getElementById('ctSend'), status = document.getElementById('ctStatus'), doneText = document.getElementById('ctDoneText');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isOpen = false, lastFocus = null, hideT = 0, held = [];

  function open() {
    if (isOpen) return;
    isOpen = true; clearTimeout(hideT); lastFocus = document.activeElement;
    ct.classList.remove('is-done'); status.textContent = ''; sendBtn.disabled = false;
    // everything behind the popup becomes inert, remembering what was already inert (About / Notes keep the home page inert)
    held = [];
    ['main', '#ab', '#nt', '#pv'].forEach(function (q) { var el = document.querySelector(q); if (el) { held.push([el, el.inert]); el.inert = true; } });
    root.classList.add('ct-open'); ct.classList.add('is-on'); ct.setAttribute('aria-hidden', 'false');
    ct.getBoundingClientRect(); ct.classList.add('is-open');
    var first = form.elements.name; if (first) first.focus({ preventScroll: true }); else panel.focus();
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; ct.classList.remove('is-open');
    function done() {
      ct.classList.remove('is-on'); ct.setAttribute('aria-hidden', 'true'); root.classList.remove('ct-open');
      held.forEach(function (h) { h[0].inert = h[1]; }); held = [];
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    if (reduce) done(); else hideT = setTimeout(done, 380);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-contact]');
    if (a) { e.preventDefault(); open(); return; }
    if (isOpen && e.target.closest('[data-ct-close]')) { e.preventDefault(); close(); }
  });
  // Escape closes the popup only, not the page underneath
  addEventListener('keydown', function (e) {
    if (isOpen && e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); }
  }, true);
  if (location.hash === '#contact') document.addEventListener('loader:done', open);

  function finish(text) { doneText.textContent = text; ct.classList.add('is-done'); form.reset(); var b = ct.querySelector('.ct-done .ct-x'); if (b) b.focus({ preventScroll: true }); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim(), email = form.elements.email.value.trim(), msg = form.elements.message.value.trim();
    if (form.elements.website.value) { finish('Thanks. Your message is on its way.'); return; }   // honeypot
    if (!name || !email || !msg) { status.textContent = 'Please fill in all three fields.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = 'That email address looks off.'; form.elements.email.focus(); return; }
    status.textContent = '';
    if (SITE.endpoint) {
      sendBtn.disabled = true; status.textContent = 'Sending…';
      fetch(SITE.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ name: name, email: email, message: msg }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); finish('Thanks, ' + name + '. Your message is on its way and I’ll reply soon.'); })
        .catch(function () { sendBtn.disabled = false; status.textContent = 'Couldn’t send that. Try again, or email ' + SITE.email + '.'; });
    } else {
      // no form service connected yet: hand the message to the visitor's email app, addressed to me
      location.href = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent('Hello from ' + name) + '&body=' + encodeURIComponent(msg + '\n\n' + name + ' (' + email + ')');
      finish('Your email app should have opened with the message ready to send. If nothing happened, write to ' + SITE.email + ' directly.');
    }
  });
})();
