
/* experience node map: one component, built into every [data-xnet] container */
(function () {
  var DATA = [
    { id: 'curb', tag: 'Direction', role: 'Creative Director', co: 'Curb Studio', when: 'Jun 2023 \u2013 Present', where: 'India \u00b7 Hybrid', c: '#D26345', x: 58, y: 48, hub: true, pts: [
      "Work across brand strategy, creative direction, campaigns, and visual communication for businesses and emerging brands.",
      "Translate brand positioning into cohesive creative output across identities, digital experiences, content, and campaigns.",
      "Coordinate with clients and multidisciplinary collaborators to move projects from concept through execution."] },
    { id: 'southwave', tag: 'Strategy', role: 'Brand Strategist (Freelance)', co: 'Southwave', when: 'Nov 2024 \u2013 Present', where: 'Hybrid', c: '#84C1D3', x: 84, y: 84, pts: [
      "Work with the founding team on brand positioning, communication, and marketing within India's streetwear and fashion landscape.",
      "Develop content and campaign ideas for product storytelling, launches, and day-to-day brand communication.",
      "Direct and contribute to fashion shoots, supporting concepts, styling, locations, and visual output.",
      "Support in-store events, community initiatives, festival pop-ups, and brand activations, connecting content with real-world brand experiences."] },
    { id: 'freeground', tag: 'Design', role: 'Creative Designer', co: 'Freeground Music Festival', when: 'Aug 2024 \u2013 Mar 2025', where: 'Kozhikode, Kerala \u00b7 Hybrid', c: '#C2AE67', x: 84, y: 50, pts: [
      "Contributed to social media content and audience-facing festival communication.",
      "Developed sponsorship pitch materials and ideated brand activation concepts for prospective partners.",
      "Supported art direction and experience planning for Road to Freeground, including signage, entrances, ticketing, and installation areas."] },
    { id: 'global', tag: 'Design + Ops', role: 'Designer / Operations Manager', co: 'Global Degrees', when: 'Dec 2023 \u2013 Mar 2024', where: 'Kozhikode, Kerala \u00b7 On-site', c: '#86CFBC', x: 84, y: 16, pts: [
      "Created social media designs and promotional posters, and maintained a content calendar for consistent communication.",
      "Supported operational coordination and helped respond to student enquiries through the application process."] },
    { id: 'artifitia', tag: 'AR / Unity3D', role: 'Unity3D & AR Developer', co: 'Artifitia Solutions', when: 'Apr 2023 \u2013 Sep 2023', where: 'Kozhikode, Kerala \u00b7 On-site', c: '#B69BC4', x: 34, y: 22, pts: [
      "Helped prototype an AR-enabled 3D virtual studio for television news channels using Unity3D and Blender."] },
    { id: 'softronicis', tag: 'MERN', role: 'MERN Stack Developer Intern', co: 'Softronicis', when: 'Jun 2023 \u2013 Nov 2023', where: 'Kozhikode, Kerala \u00b7 On-site', c: '#B69BC4', x: 34, y: 76, pts: [
      "Completed an internship in MERN stack development."] },
    { id: 'iluzia', tag: 'AR / VR', role: 'Unity Developer & AR/VR Designer Intern', co: 'Iluzia Labs', when: 'Sep 2021 \u2013 Apr 2022', where: 'Kozhikode, Kerala \u00b7 On-site', c: '#B69BC4', x: 10, y: 49, pts: [
      "Designed and developed AR-enhanced educational projects, including an interactive textbook and children's playing-card experience.",
      "Contributed to VR projects and learned foundational 3D asset workflows using Blender."] }
  ];
  var EDGES = [['iluzia', 'artifitia'], ['iluzia', 'softronicis'], ['artifitia', 'curb'], ['softronicis', 'curb'], ['curb', 'global'], ['curb', 'freeground'], ['curb', 'southwave']];
  var SVGNS = 'http://www.w3.org/2000/svg', uid = 0;
  var wide = matchMedia('(min-width: 1020px)');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function build(net) {
    var n = ++uid, nodes = {}, edges = [], openNode = null;
    net.innerHTML = '<span class="xcorner tl nt-mono">/network/experience</span><span class="xcorner br nt-mono">' + String(DATA.length).padStart(2, '0') + ' nodes / ' + String(EDGES.length).padStart(2, '0') + ' wires</span>';
    var svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'xwires'); svg.setAttribute('aria-hidden', 'true'); net.appendChild(svg);

    DATA.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'xn' + (d.hub ? ' hub' : ''); el.tabIndex = 0; el.setAttribute('data-grab', ''); el.setAttribute('role', 'group');
      el.setAttribute('aria-label', d.role + ', ' + d.co); el.setAttribute('aria-describedby', 'xp' + n + d.id);
      el.style.setProperty('--c', d.c); el.style.left = d.x + '%'; el.style.top = d.y + '%';
      el.innerHTML = '<span class="xn-bar">' + esc(d.tag) + '</span><span class="xn-body"><span class="xn-role">' + esc(d.role) + '</span><span class="xn-co">' + esc(d.co) + '</span><span class="xn-when">' + esc(d.when) + '</span></span>' +
        '<i class="xn-port in"></i><i class="xn-port out"></i>' +
        '<div class="xn-pop" id="xp' + n + d.id + '" role="tooltip"><span class="xp-label">[' + esc(d.when) + ' \u00b7 ' + esc(d.where) + ']</span><ul>' + d.pts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
      net.appendChild(el); nodes[d.id] = { el: el, d: d };
    });
    EDGES.forEach(function (e) {
      var g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'xe');
      var a = document.createElementNS(SVGNS, 'path'); a.setAttribute('class', 'xw');
      var b = document.createElementNS(SVGNS, 'path'); b.setAttribute('class', 'xf');
      g.appendChild(a); g.appendChild(b); svg.appendChild(g); edges.push({ from: e[0], to: e[1], g: g, a: a, b: b });
    });

    function geo(id) { var el = nodes[id].el; return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth }; }
    function wire(e) {
      var s = geo(e.from), t = geo(e.to), x1 = s.x + s.w / 2, y1 = s.y, x2 = t.x - t.w / 2, y2 = t.y, dx = Math.max(50, Math.abs(x2 - x1) * .5);
      var p = 'M' + x1 + ' ' + y1 + ' C' + (x1 + dx) + ' ' + y1 + ' ' + (x2 - dx) + ' ' + y2 + ' ' + x2 + ' ' + y2;
      e.a.setAttribute('d', p); e.b.setAttribute('d', p);
    }
    function wires() { if (wide.matches && net.offsetWidth) edges.forEach(wire); }
    function place(node) {   // popup opens toward the free space
      var cw = net.clientWidth, ch = net.clientHeight, el = node.el, fx = el.offsetLeft / cw, fy = el.offsetTop / ch;
      el.setAttribute('data-h', fx < .3 ? 'left' : fx > .7 ? 'right' : 'center'); el.setAttribute('data-v', fy > .55 ? 'up' : 'down');
    }
    function placeAll() { Object.keys(nodes).forEach(function (k) { place(nodes[k]); }); }
    function hot(id, on) {
      net.classList.toggle('has-hot', on);
      edges.forEach(function (e) { var h = on && (e.from === id || e.to === id); e.g.classList.toggle('hot', h); if (h) { nodes[e.from].el.classList.add('hot'); nodes[e.to].el.classList.add('hot'); } });
      if (!on) Object.keys(nodes).forEach(function (k) { nodes[k].el.classList.remove('hot'); });
    }

    Object.keys(nodes).forEach(function (id) {
      var node = nodes[id], el = node.el, st = null;
      el.addEventListener('mouseenter', function () { hot(id, true); });
      el.addEventListener('mouseleave', function () { if (document.activeElement !== el) hot(id, false); });
      el.addEventListener('focus', function () { hot(id, true); });
      el.addEventListener('blur', function () { hot(id, false); el.classList.remove('open'); });
      el.addEventListener('pointerdown', function (e) {
        if (!wide.matches || (e.pointerType === 'mouse' && e.button !== 0)) return;
        st = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: el.offsetLeft, oy: el.offsetTop, moved: false };
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
      });
      el.addEventListener('pointermove', function (e) {
        if (!st || e.pointerId !== st.id) return;
        var dx = e.clientX - st.sx, dy = e.clientY - st.sy;
        if (!st.moved && Math.hypot(dx, dy) < 5) return;
        st.moved = true; el.classList.add('drag');
        var cw = net.clientWidth, ch = net.clientHeight, w = el.offsetWidth / 2, h = el.offsetHeight / 2;
        var nx = Math.max(w + 6, Math.min(cw - w - 6, st.ox + dx)), ny = Math.max(h + 6, Math.min(ch - h - 6, st.oy + dy));
        el.style.left = (nx / cw * 100) + '%'; el.style.top = (ny / ch * 100) + '%'; wires();
      });
      function end(e) {
        if (!st || (e && e.pointerId !== st.id)) return;
        var moved = st.moved; st = null; el.classList.remove('drag');
        if (moved) place(node);
        else if (e && e.pointerType !== 'mouse') {   // a tap opens the description on touch screens
          var was = el.classList.contains('open'); if (openNode) openNode.classList.remove('open');
          el.classList.toggle('open', !was); openNode = was ? null : el;
        }
      }
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
      el.addEventListener('keydown', function (e) {   // arrow keys nudge a node
        var m = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
        if (!m || !wide.matches) return;
        e.preventDefault();
        var cw = net.clientWidth, ch = net.clientHeight, w = el.offsetWidth / 2, h = el.offsetHeight / 2;
        var nx = Math.max(w + 6, Math.min(cw - w - 6, el.offsetLeft + m[0])), ny = Math.max(h + 6, Math.min(ch - h - 6, el.offsetTop + m[1]));
        el.style.left = (nx / cw * 100) + '%'; el.style.top = (ny / ch * 100) + '%'; wires(); place(node);
      });
    });
    document.addEventListener('pointerdown', function (e) { if (openNode && !openNode.contains(e.target)) { openNode.classList.remove('open'); openNode = null; } });

    function layout() { placeAll(); wires(); }
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(net); else addEventListener('resize', layout);
    wide.addEventListener ? wide.addEventListener('change', layout) : wide.addListener(layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout();
  }
  [].forEach.call(document.querySelectorAll('[data-xnet]'), build);
})();
