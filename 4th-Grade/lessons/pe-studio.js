/* =====================================================================
   OPTIMA ART STUDIO · shared lesson interactions · v1.0 (2026-09-28)
   Everything is data-attribute driven. No per-lesson JS needed.
   Works with mouse, touch, and keyboard. localStorage is a nicety only.
   ===================================================================== */
(function () {
  'use strict';
  var KEY = (document.body.dataset.lessonKey || location.pathname) + '::';
  function save(k, v) { try { localStorage.setItem(KEY + k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }

  /* ---- reduced motion (v2.14, 2026-10-19): pause SMIL animations in drawn SVG scenes when the reader asks for less motion ---- */
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
    }
  } catch (e) {}

  /* ---- quick check: .check [data-correct] .opts button[data-choice] ---- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.check .opts button');
    if (!b) return;
    var q = b.closest('.q');
    var opts = q.querySelectorAll('.opts button');
    opts.forEach(function (x) { x.classList.remove('selected', 'correct', 'incorrect'); });
    var fb = q.querySelector('.fb') || q.appendChild(document.createElement('div'));
    fb.className = 'fb show';
    if (q.dataset.correct) {                 /* right/wrong mode */
      var right = b.dataset.choice === q.dataset.correct;
      b.classList.add(right ? 'correct' : 'incorrect');
      fb.classList.add(right ? 'correct' : 'incorrect');
      fb.textContent = right ? (b.dataset.fb || q.dataset.fb || 'Yes, that is it.')
                             : (b.dataset.fb || q.dataset.hint || 'Not quite. Look again and try another.');
    } else {                                 /* opinion mode: every answer gets a response */
      b.classList.add('selected');
      fb.classList.add('neutral');
      fb.textContent = b.dataset.fb || '';
    }
  });
  document.addEventListener('click', function (e) {
    var r = e.target.closest('.check .reset');
    if (!r) return;
    var c = r.closest('.check');
    c.querySelectorAll('.opts button').forEach(function (x) { x.classList.remove('selected', 'correct', 'incorrect'); });
    c.querySelectorAll('.fb').forEach(function (f) { f.className = 'fb'; f.textContent = ''; });
  });

  /* ---- reveal cards: button.reveal ---- */
  document.addEventListener('click', function (e) {
    var r = e.target.closest('.reveal'); if (r) r.classList.toggle('open');
  });

  /* ---- steps accordion: .steps > .step > button ---- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.step > button'); if (!b) return;
    var s = b.parentElement, all = s.parentElement.querySelectorAll('.step');
    var open = s.classList.contains('open');
    all.forEach(function (x) { x.classList.remove('open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); });
    if (!open) { s.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
  });

  /* ---- slider: .slider input[data-target="#id"] ; targets .stage[data-i] and .note[data-i] ---- */
  document.querySelectorAll('.slider input[type=range]').forEach(function (r) {
    var tgt = document.querySelector(r.dataset.target || 'body');
    var notes = r.closest('.slider').querySelectorAll('[data-note]');
    var note = r.closest('.slider').querySelector('.note');
    function go() {
      var v = String(Math.round(parseFloat(r.value)));   /* fine steps drag smoothly; the nearest stage is shown */
      tgt.querySelectorAll('.stage').forEach(function (s) { s.classList.toggle('active', s.dataset.i === v); });
      notes.forEach(function (n) { if (n.dataset.note === v && note) note.innerHTML = n.innerHTML; });
      /* [data-grow] (v1.6): scales from 45% to 100% as the slider moves, e.g. a balloon that inflates */
      var t = (r.value - r.min) / ((r.max - r.min) || 1);
      r.closest('.slider').querySelectorAll('[data-grow]').forEach(function (g) { g.style.transform = 'scale(' + (0.45 + 0.55 * t).toFixed(3) + ')'; });
      /* [data-fill] (v1.7): stretches upward from its base, 15% to 100%, e.g. a thermometer column or a water level */
      r.closest('.slider').querySelectorAll('[data-fill]').forEach(function (g) { g.style.transform = 'scaleY(' + (0.15 + 0.85 * t).toFixed(3) + ')'; });
      /* [data-fade] (v1.7): fades in from 0 to full as the slider moves, e.g. steam over a warming cup */
      r.closest('.slider').querySelectorAll('[data-fade]').forEach(function (g) { g.style.opacity = t.toFixed(3); });
      /* [data-show="2-4"] (v1.8): visible only while the nearest stage is within that range (a single number is one stage), e.g. snow that arrives at step 2 */
      r.closest('.slider').querySelectorAll('[data-show]').forEach(function (g) {
        var p = String(g.dataset.show).split('-'), a = parseInt(p[0], 10), b = parseInt(p[p.length - 1], 10), s = parseInt(v, 10);
        g.style.opacity = (s >= a && s <= b) ? '1' : '0';
      });
    }
    r.addEventListener('input', go); go();
    r.addEventListener('change', function () { r.value = Math.round(parseFloat(r.value)); go(); });   /* snap to the stage on release */
  });

  /* ---- sort: .sort  .pool .token[data-a="bucketKey"]  .bucket[data-b="bucketKey"] ---- */
  document.querySelectorAll('.sort').forEach(function (s) {
    var picked = null;
    s.addEventListener('click', function (e) {
      var t = e.target.closest('.token');
      var b = e.target.closest('.bucket');
      if (t && !s.classList.contains('checked')) {
        if (picked === t) { t.classList.remove('picked'); picked = null; s.classList.remove('picking'); return; }
        s.querySelectorAll('.token').forEach(function (x) { x.classList.remove('picked'); });
        t.classList.add('picked'); picked = t; s.classList.add('picking');
        s.querySelectorAll('.bucket').forEach(function (x) { x.classList.add('target'); });
        return;
      }
      if (b && picked) {
        b.appendChild(picked); picked.classList.remove('picked'); picked = null;
        s.querySelectorAll('.bucket').forEach(function (x) { x.classList.remove('target'); });
        s.classList.remove('picking');
      }
    });
    var chk = s.querySelector('.sort-check'), rst = s.querySelector('.sort-reset'), out = s.querySelector('.fb');
    if (chk) chk.addEventListener('click', function () {
      var n = 0, ok = 0;
      s.querySelectorAll('.bucket .token').forEach(function (t) {
        n++; var good = t.dataset.a === t.closest('.bucket').dataset.b; if (good) ok++;
        t.classList.add(good ? 'right' : 'wrong');
      });
      var left = s.querySelectorAll('.pool .token').length;
      if (out) { out.className = 'fb show ' + (ok === n && !left ? 'correct' : 'incorrect');
        out.textContent = left ? 'Place every card first (' + left + ' left).'
          : ok === n ? 'All ' + n + ' sorted correctly. ' + (s.dataset.done || 'You can tell them apart by sight.')
          : ok + ' of ' + n + ' right. Move the ones marked in coral, then check again.'; }
      if (ok === n && !left) s.classList.add('checked');
    });
    if (rst) rst.addEventListener('click', function () {
      var pool = s.querySelector('.pool');
      s.querySelectorAll('.bucket .token').forEach(function (t) { t.classList.remove('right', 'wrong'); pool.appendChild(t); });
      s.classList.remove('checked'); if (out) { out.className = 'fb'; out.textContent = ''; }
    });
  });

  /* ---- checklist + timers: .todo li  input[type=checkbox][data-k]  .timer[data-min] ---- */
  document.querySelectorAll('.todo input[type=checkbox]').forEach(function (c) {
    var k = 'todo:' + (c.dataset.k || c.id);
    if (load(k) === '1') { c.checked = true; c.closest('li').classList.add('done'); }
    c.addEventListener('change', function () { c.closest('li').classList.toggle('done', c.checked); save(k, c.checked ? '1' : '0'); });
  });
  document.querySelectorAll('.todo .timer').forEach(function (t) {
    var total = Math.round(parseFloat(t.dataset.min || '5') * 60), left = total, id = null;
    function show() { var m = Math.floor(left / 60), s = left % 60; t.textContent = (id ? '' : '▶ ') + m + ':' + (s < 10 ? '0' : '') + s; }
    show();
    t.addEventListener('click', function () {
      if (id) { clearInterval(id); id = null; t.classList.remove('running'); show(); return; }
      if (left <= 0) left = total;
      t.classList.add('running');
      id = setInterval(function () { left--; show(); if (left <= 0) { clearInterval(id); id = null; t.classList.remove('running'); t.textContent = 'Time!'; } }, 1000);
      show();
    });
  });

  /* ---- sticky note: .sticky textarea[data-k] ---- */
  document.querySelectorAll('.sticky textarea').forEach(function (ta) {
    var k = 'note:' + (ta.dataset.k || ta.id), st = ta.closest('.sticky').querySelector('.saved'), tm;
    var v = load(k); if (v) { ta.value = v; if (st) st.textContent = 'Saved in this browser'; }
    ta.addEventListener('input', function () {
      clearTimeout(tm); if (st) st.textContent = 'Saving…';
      tm = setTimeout(function () { save(k, ta.value); if (st) st.textContent = 'Saved in this browser'; }, 500);
    });
  });

  /* ---- sketch pad: .pad canvas[data-sym="1|4|6|8"] ; .pad .tools .sw[data-c] .size .clear .dl ---- */
  document.querySelectorAll('.pad').forEach(function (pad) {
    var cv = pad.querySelector('canvas'), ctx = cv.getContext('2d');
    var sym = parseInt(cv.dataset.sym || '1', 10), color = '#22304A', size = 4, drawing = false, last = null;
    var W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
    function reset() {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
      if (sym > 1) {  /* faint guide wedges + center */
        ctx.save(); ctx.strokeStyle = '#E7DFD0'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
        for (var i = 0; i < sym; i++) { var a = i * 2 * Math.PI / sym; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * W, cy + Math.sin(a) * H); ctx.stroke(); }
        ctx.setLineDash([]); ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * .46, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    }
    function pos(e) { var r = cv.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return { x: (p.clientX - r.left) * W / r.width, y: (p.clientY - r.top) * H / r.height }; }
    function seg(a, b) {
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var i = 0; i < sym; i++) {
        var th = i * 2 * Math.PI / sym;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(th); ctx.translate(-cx, -cy);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if (sym > 1) { /* mirror each wedge too, so one stroke becomes a true radial pattern */
          ctx.translate(cx, cy); ctx.scale(1, -1); ctx.translate(-cx, -cy);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.restore();
      }
    }
    var history = [];
    function snapshot() { try { history.push(ctx.getImageData(0, 0, W, H)); if (history.length > 40) history.shift(); } catch (err) {} }
    function down(e) { snapshot(); drawing = true; last = pos(e); seg(last, last); e.preventDefault(); }
    function move(e) { if (!drawing) return; var p = pos(e); seg(last, p); last = p; e.preventDefault(); }
    function up() { drawing = false; last = null; }
    var undo = pad.querySelector('.undo'); if (undo) undo.addEventListener('click', function () { var s = history.pop(); if (s) ctx.putImageData(s, 0, 0); });
    var wheel = pad.querySelector('.wheel'); if (wheel) wheel.addEventListener('input', function () { color = wheel.value; pad.querySelectorAll('.sw').forEach(function (x) { x.classList.remove('on'); }); });
    cv.addEventListener('mousedown', down); cv.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    cv.addEventListener('touchstart', down, { passive: false }); cv.addEventListener('touchmove', move, { passive: false }); cv.addEventListener('touchend', up);
    pad.querySelectorAll('.sw').forEach(function (s) {
      s.style.background = s.dataset.c;
      s.addEventListener('click', function () { color = s.dataset.c; pad.querySelectorAll('.sw').forEach(function (x) { x.classList.remove('on'); }); s.classList.add('on'); });
    });
    var sz = pad.querySelector('.size'); if (sz) sz.addEventListener('input', function () { size = parseInt(sz.value, 10); });
    var cl = pad.querySelector('.clear'); if (cl) cl.addEventListener('click', function () { snapshot(); reset(); });
    var dl = pad.querySelector('.dl'); if (dl) dl.addEventListener('click', function () {
      var a = document.createElement('a'); a.download = (cv.dataset.name || 'sketch') + '.png'; a.href = cv.toDataURL('image/png'); a.click();
    });
    reset();
  });

  /* ---- spin button: [data-spin="#imgId"] rotates target by data-deg each click ---- */
  document.querySelectorAll('[data-spin]').forEach(function (b) {
    var t = document.querySelector(b.dataset.spin), deg = parseFloat(b.dataset.deg || '45'), cur = 0;
    t.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
    b.addEventListener('click', function () { cur += deg; t.style.transform = 'rotate(' + cur + 'deg)'; var o = document.querySelector(b.dataset.out); if (o) o.textContent = (cur % 360) + '°'; });
  });
})();

/* ---- voice guide (v1.2, per-guide placeholder voice): .voice[data-audio="audio/x.mp3"] .play  .script  .read ----
   Plays the MP3 if it exists. If it does not (yet), reads the .script aloud with the
   browser's own voice so the page works before the ElevenLabs file is dropped in. */
(function () {
  'use strict';
  /* Placeholder browser voice per guide, keyed by the <body> course class. Each entry is an ordered
     list of voice-name patterns (first installed match wins), plus rate and pitch. Override on one
     block with data-voice="Guy" (a name pattern), data-rate="0.9", data-pitch="0.95". Only used until
     the ElevenLabs MP3 exists; the recording is always preferred. */
  var GUIDES = {
    'course-va1': { // Anika Rao, museum educator: warm, curious
      prefer: [/Aria|Jenny|Sonia|Libby|Emma/i, /Samantha|Karen|Moira/i, /Google (UK|US) English Female/i, /Zira|Hazel|Susan/i, /Natural|Online|Google/i],
      rate: 0.95, pitch: 1 },
    'course-sa2': { // Theo Marsh, painter: lower, unhurried
      prefer: [/Guy|Ryan|Christopher|Davis|Andrew|Brian|Thomas/i, /Daniel|Alex|Fred/i, /Google (UK|US) English Male/i, /David|George|Mark/i, /Natural|Online|Google/i],
      rate: 0.92, pitch: 0.9 },
    'course-sci6': { // Dr. Maya Ortiz (Q2 W1-2, field geologist) and Dr. Nina Castillo (Q2 W3 on, NASA mission scientist): warm, bright, curious
      prefer: [/Aria|Jenny|Sonia|Libby|Emma/i, /Samantha|Karen|Moira/i, /Google (UK|US) English Female/i, /Zira|Hazel|Susan/i, /Natural|Online|Google/i],
      rate: 0.95, pitch: 1 },
    'course-sci7': { // Dr. Lena Okafor, wildlife biologist: calm, curious, a little dry
      prefer: [/Aria|Jenny|Sonia|Libby|Emma/i, /Samantha|Karen|Moira/i, /Google (UK|US) English Female/i, /Zira|Hazel|Susan/i, /Natural|Online|Google/i],
      rate: 0.93, pitch: 0.95 },
    'course-sci8': { // Dr. Sam Reyes, chemist: direct, good-humored
      prefer: [/Guy|Ryan|Christopher|Davis|Andrew|Brian|Thomas/i, /Daniel|Alex|Fred/i, /Google (UK|US) English Male/i, /David|George|Mark/i, /Natural|Online|Google/i],
      rate: 0.95, pitch: 0.95 },
    'course-pe4': { // Coach Rivera, PE coach (Mission: Move!, 4th grade): upbeat, encouraging
      prefer: [/Aria|Jenny|Sonia|Libby|Emma/i, /Samantha|Karen|Moira/i, /Google (UK|US) English Female/i, /Zira|Hazel|Susan/i, /Natural|Online|Google/i],
      rate: 1.0, pitch: 1.05 }
  };
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function () { window.speechSynthesis.getVoices(); };
  var current = null;
  function stopAll() {
    document.querySelectorAll('.voice.playing').forEach(function (v) {
      v.classList.remove('playing'); if (v._audio) v._audio.pause();
    });
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    current = null;
  }
  document.querySelectorAll('.voice').forEach(function (v) {
    var play = v.querySelector('.play'), bar = v.querySelector('.bar i'), read = v.querySelector('.read');
    var script = v.querySelector('.script'), text = script ? script.textContent.trim() : '';
    var src = v.dataset.audio, audio = null, usable = null;
    if (src) {
      audio = new Audio(src); v._audio = audio;
      audio.addEventListener('canplaythrough', function () { usable = true; });
      audio.addEventListener('error', function () { usable = false; v.classList.add('synth'); });
      audio.addEventListener('timeupdate', function () { if (bar && audio.duration) bar.style.width = (audio.currentTime / audio.duration * 100) + '%'; });
      audio.addEventListener('ended', function () { v.classList.remove('playing'); if (bar) bar.style.width = '0'; current = null; });
      audio.load();
    } else { v.classList.add('synth'); }
    function speak() {
      if (!window.speechSynthesis || !text) return;
      var g = GUIDES[document.body.className.match(/course-[a-z0-9]+/) ? document.body.className.match(/course-[a-z0-9]+/)[0] : ''] || GUIDES['course-va1'];
      var u = new SpeechSynthesisUtterance(text);
      u.rate = parseFloat(v.dataset.rate) || g.rate; u.pitch = parseFloat(v.dataset.pitch) || g.pitch;
      var vs = window.speechSynthesis.getVoices().filter(function (x) { return /^en/i.test(x.lang); });
      var prefs = (v.dataset.voice ? [new RegExp(v.dataset.voice, 'i')] : []).concat(g.prefer);
      var pick = null;
      prefs.forEach(function (re) { if (!pick) pick = vs.filter(function (x) { return re.test(x.name); })[0]; });
      if (pick) u.voice = pick; else if (vs[0]) u.voice = vs[0];
      var start = Date.now(), est = Math.max(4000, text.split(/\s+/).length * 420), t;
      u.onstart = function () { t = setInterval(function () { if (bar) bar.style.width = Math.min(100, (Date.now() - start) / est * 100) + '%'; }, 200); };
      u.onend = u.onerror = function () { clearInterval(t); v.classList.remove('playing'); if (bar) bar.style.width = '0'; current = null; };
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    }
    play.addEventListener('click', function () {
      if (v.classList.contains('playing')) { stopAll(); return; }
      stopAll(); v.classList.add('playing'); current = v;
      if (audio && usable !== false) {
        audio.currentTime = 0;
        audio.play().catch(function () { v.classList.add('synth'); speak(); });
      } else { speak(); }
    });
    if (read) read.addEventListener('click', function () { v.classList.toggle('open'); read.textContent = v.classList.contains('open') ? 'Hide the words' : 'Read the words'; });
  });
})();

/* ---- scroll art (v1.2): <svg class="scrollart" data-scrollart="mandala|leaf"></svg>.
   Draws itself as the student scrolls; scrolling up undraws it. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function mandala(svg) {
    svg.setAttribute('viewBox', '-50 -50 100 100');
    var rings = [], g;
    /* ring 0: center dot */
    g = el('g', {}); g.appendChild(el('circle', { cx: 0, cy: 0, r: 3.2, fill: 'var(--spark)', stroke: 'none' })); rings.push(g);
    /* ring 1: 8 petals */
    g = el('g', {}); for (var i = 0; i < 8; i++) g.appendChild(el('path', { d: 'M0 -5 C 4 -11, 4 -19, 0 -22 C -4 -19, -4 -11, 0 -5 Z', transform: 'rotate(' + (i * 45) + ')', fill: 'var(--make)', stroke: '#fff', 'stroke-width': .8 })); rings.push(g);
    /* ring 2: thin circle + 16 dots */
    g = el('g', {}); g.appendChild(el('circle', { cx: 0, cy: 0, r: 26, fill: 'none', stroke: 'var(--brand-sky)', 'stroke-width': 1.2 }));
    for (i = 0; i < 16; i++) { var a = i * Math.PI / 8; g.appendChild(el('circle', { cx: Math.cos(a) * 26, cy: Math.sin(a) * 26, r: 1.6, fill: '#fff' })); } rings.push(g);
    /* ring 3: 8 diamonds */
    g = el('g', {}); for (i = 0; i < 8; i++) g.appendChild(el('path', { d: 'M0 -30 L 4 -36 L 0 -42 L -4 -36 Z', transform: 'rotate(' + (i * 45 + 22.5) + ')', fill: 'var(--spark)', stroke: 'none' })); rings.push(g);
    /* ring 4: 16 small petals */
    g = el('g', {}); for (i = 0; i < 16; i++) g.appendChild(el('path', { d: 'M0 -32 C 2.2 -35, 2.2 -40, 0 -43 C -2.2 -40, -2.2 -35, 0 -32 Z', transform: 'rotate(' + (i * 22.5) + ')', fill: 'var(--brand-sky)', stroke: 'none' })); rings.push(g);
    /* ring 5: scalloped outer edge */
    g = el('g', {}); for (i = 0; i < 24; i++) { var b = i * Math.PI / 12; g.appendChild(el('circle', { cx: Math.cos(b) * 45, cy: Math.sin(b) * 45, r: 2.2, fill: 'var(--make)' })); } rings.push(g);
    /* ring 6: outer circle */
    g = el('g', {}); g.appendChild(el('circle', { cx: 0, cy: 0, r: 48.5, fill: 'none', stroke: '#fff', 'stroke-width': 1.2, 'stroke-dasharray': 1, pathLength: 1 })); rings.push(g);
    rings.forEach(function (r) { r.style.transition = 'opacity .25s, transform .25s'; r.style.transformOrigin = '0 0'; svg.appendChild(r); });
    return rings;
  }
  /* maple leaf, four rungs of the abstraction ladder: realistic → simplified → stylized → non-representational */
  function leafPts(n, base, lobe, jag, jagFreq) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = -Math.PI / 2 + i * 2 * Math.PI / n;                       /* start at top lobe */
      var r = base * (1 + lobe * Math.cos(5 * (t + Math.PI / 2)));
      var stemNotch = Math.exp(-Math.pow((t - Math.PI / 2) / 0.35, 2)); /* notch at the bottom, where the stem enters */
      r *= 1 - 0.55 * stemNotch;
      if (jag) r += jag * (Math.abs(Math.sin(jagFreq * t)) - .5);
      pts.push([Math.cos(t) * r, Math.sin(t) * r]);
    }
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ') + ' Z';
  }
  function veins(g, len, w, col) {
    for (var i = 0; i < 5; i++) { var t = -Math.PI / 2 + i * 2 * Math.PI / 5; g.appendChild(el('path', { d: 'M0 6 L' + (Math.cos(t) * len).toFixed(1) + ' ' + (Math.sin(t) * len).toFixed(1), stroke: col, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 })); }
  }
  function leaf(svg) {
    svg.setAttribute('viewBox', '-50 -50 100 100');
    var stages = [], g;
    /* rung 1 · realistic: jagged outline, ink, five veins, stem */
    g = el('g', {});
    g.appendChild(el('path', { d: leafPts(260, 27, 0.55, 1.6, 34), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.1, 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 }));
    veins(g, 30, .7, 'var(--ink)');
    g.appendChild(el('path', { d: 'M0 6 L0 30', stroke: 'var(--ink)', 'stroke-width': 1.2, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }));
    stages.push(g);
    /* rung 2 · simplified: smooth silhouette, main veins only, soft fill */
    g = el('g', {});
    g.appendChild(el('path', { d: leafPts(120, 27, 0.5, 0, 0), fill: 'var(--learn-soft)', stroke: 'var(--learn)', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }));
    veins(g, 26, .9, 'var(--learn)');
    stages.push(g);
    /* rung 3 · stylized: one flat color, pointed symmetrical lobes, no veins */
    g = el('g', {});
    g.appendChild(el('path', { d: leafPts(60, 26, 0.7, 0, 0), fill: 'var(--make)', stroke: '#fff', 'stroke-width': 1.2, 'stroke-linejoin': 'miter' }));
    g.appendChild(el('circle', { cx: 0, cy: 4, r: 3, fill: '#fff' }));
    stages.push(g);
    /* rung 4 · non-representational: the lobe shapes, detached and rearranged */
    g = el('g', {});
    var lobe = 'M0 0 C 9 -6, 12 -20, 0 -30 C -12 -20, -9 -6, 0 0 Z';
    g.appendChild(el('path', { d: lobe, transform: 'translate(-16 10) rotate(-40) scale(1.1)', fill: 'var(--spark)' }));
    g.appendChild(el('path', { d: lobe, transform: 'translate(14 -2) rotate(35) scale(1.3)', fill: 'var(--brand-sky)' }));
    g.appendChild(el('path', { d: lobe, transform: 'translate(0 26) rotate(180) scale(.9)', fill: 'var(--make)' }));
    g.appendChild(el('circle', { cx: -22, cy: -22, r: 5, fill: 'var(--learn)' }));
    g.appendChild(el('path', { d: 'M-30 30 Q 0 12, 30 28', stroke: 'var(--ink)', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }));
    stages.push(g);
    stages.forEach(function (s) { s.style.transition = 'opacity .3s, transform .3s'; s.style.transformOrigin = '0 0'; s.style.opacity = 0; svg.appendChild(s); });
    return stages;
  }
  document.querySelectorAll('.scrollart').forEach(function (svg) {
    var type = svg.dataset.scrollart;
    var rings = type === 'mandala' ? mandala(svg) : type === 'leaf' ? leaf(svg) : [];
    var staged = type === 'leaf';
    if (!rings.length) return;
    var n = rings.length, scroller = document.scrollingElement || document.documentElement, ticking = false;
    function paint() {
      ticking = false;
      var max = scroller.scrollHeight - window.innerHeight, p = max > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / max)) : 1;
      rings.forEach(function (r, i) {
        var local = Math.min(1, Math.max(0, (p * n - i)));           /* 0..1 for this ring/stage */
        if (staged) {
          /* stages: rise, hold, then fade to a ghost when the next stage takes over; the last stage stays */
          var rise = Math.min(1, local * 1.6);
          var next = Math.min(1, Math.max(0, (p * n - (i + 1)) * 1.6));
          var op = (i === n - 1) ? rise : rise * (1 - 0.85 * next);
          r.style.opacity = op; r.style.transform = 'scale(' + (0.85 + 0.15 * rise) + ')';
          r.querySelectorAll('[pathLength]').forEach(function (c) { c.setAttribute('stroke-dashoffset', 1 - rise); });
        } else {
          r.style.opacity = local; r.style.transform = 'scale(' + (0.6 + 0.4 * local) + ')';
          var c = r.querySelector('[pathLength]'); if (c) c.setAttribute('stroke-dashoffset', 1 - local);
        }
      });
      svg.style.setProperty('--p', p);
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener('resize', paint); paint();
  });
})();

/* ---- vocabulary drawers (v1.2): .cabinet > button.drawer > .front + .inside ---- */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var d = e.target.closest('.drawer'); if (!d) return;
    var open = d.classList.contains('open');
    d.closest('.cabinet').querySelectorAll('.drawer').forEach(function (x) { x.classList.remove('open'); x.setAttribute('aria-expanded', 'false'); });
    if (!open) { d.classList.add('open'); d.setAttribute('aria-expanded', 'true'); }
  });
})();

/* ---- science model · fair test (v1.3, scene added v1.5, 2026-10-01): <div class="model" data-model="fairtest"></div>
   The student picks an experiment, then switches a second variable from "kept the same" to "changed".
   With one variable changed the result has one explanation; with two, the verdict says it cannot be told apart.
   An animated scene shows the three runs and redraws when a controlled variable is switched on, so the second
   change is visible (a longer string, a sunny window, warmer water). Teaches: why a fair test changes one thing at a time. ---- */
(function () {
  'use strict';
  var EXPS = [
    { name: 'Balloon rocket', iv: 'Balloon size', dv: 'Distance traveled (cm)', lowWins: false, unit: 'cm', scene: 'balloon',
      levels: ['Small', 'Medium', 'Full'], results: [120, 240, 410],
      controls: [
        { name: 'String length', effect: 'longer string', bump: [0, 90, 180] },
        { name: 'Straw type', effect: 'smoother straw', bump: [0, 40, 110] },
        { name: 'Start spot', effect: 'closer start', bump: [0, 30, 60] }] },
    { name: 'Ice cube melting race', iv: 'Surface the cube sits on', dv: 'Time to melt (min)', lowWins: true, unit: 'min', scene: 'ice',
      levels: ['Plastic lid', 'Wood board', 'Metal spoon'], results: [18, 15, 7],
      controls: [
        { name: 'Cube size', effect: 'smaller cube', bump: [0, -3, -4] },
        { name: 'Room temperature', effect: 'warmer room', bump: [0, -4, -2] },
        { name: 'Start temperature', effect: 'warmer cube', bump: [0, -2, -3] }] },
    { name: 'Lava lamp', iv: 'Salt added', dv: 'Time for blobs to rise (s)', lowWins: true, unit: 's', scene: 'lava',
      levels: ['1/2 tsp', '1 tsp', '2 tsp'], results: [14, 9, 5],
      controls: [
        { name: 'Water temperature', effect: 'warmer water', bump: [0, -2, -2] },
        { name: 'Amount of oil', effect: 'less oil', bump: [0, -1, -2] },
        { name: 'Jar size', effect: 'narrower jar', bump: [0, -3, -1] }] }
  ];
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function sv(n, a, txt) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  var COL = ['var(--make)', 'var(--spark)', 'var(--learn)'];

  /* scenes: each returns {svg, play} where play() starts the animation from the beginning */
  function balloonScene(x, vals, on) {
    var svg = sv('svg', { viewBox: '0 0 600 210', role: 'img', 'aria-label': 'Three balloon rockets on strings' }), movers = [];
    var longer = on.indexOf(0) >= 0, smooth = on.indexOf(1) >= 0, closer = on.indexOf(2) >= 0;
    for (var i = 0; i < 3; i++) {
      var y = 45 + i * 65, len = 470 * (longer && i ? 1 + .06 * i : 1), start = 70 + (closer && i ? 28 * i : 0);
      svg.appendChild(sv('rect', { x: 28, y: y - 22, width: 10, height: 44, rx: 2, fill: 'var(--ink-soft)' }));          /* chair legs */
      svg.appendChild(sv('rect', { x: 38 + len, y: y - 22, width: 10, height: 44, rx: 2, fill: 'var(--ink-soft)' }));
      svg.appendChild(sv('line', { x1: 38, y1: y, x2: 38 + len, y2: y, stroke: 'var(--ink)', 'stroke-width': 1.5 }));   /* string */
      svg.appendChild(sv('text', { x: 14, y: y + 4, 'font-size': 11, 'font-weight': 800, fill: 'var(--ink-soft)' }, x.levels[i][0]));
      var g = sv('g', {}); g.style.transform = 'translate(' + start + 'px, ' + y + 'px)';
      g.appendChild(sv('rect', { x: -14, y: -3, width: 28, height: 6, rx: 3, fill: smooth && i ? 'var(--brand-sky)' : '#C9DEE6', stroke: 'var(--ink-soft)', 'stroke-width': .8 })); /* straw */
      var r = 9 + i * 6; g.appendChild(sv('ellipse', { cx: 0, cy: -r - 2, rx: r, ry: r * 1.2, fill: COL[i], stroke: '#fff', 'stroke-width': 1.5 }));
      g.appendChild(sv('path', { d: 'M' + (r + 2) + ' ' + (-r - 2) + ' l6 -4 l0 8 z', fill: COL[i] }));              /* knot/nozzle */
      var lbl = sv('text', { x: 0, y: 20, 'font-size': 11, 'font-weight': 800, 'text-anchor': 'middle', fill: 'var(--ink)' }, vals[i] + ' ' + x.unit);
      g.appendChild(lbl); svg.appendChild(g);
      g.style.transition = 'none';
      movers.push({ g: g, from: start, to: Math.min(start + vals[i] * 0.95, 38 + len - 16), y: y, dur: 0.8 + i * 0.3 });
    }
    function play() {
      movers.forEach(function (m) { m.g.style.transition = 'none'; m.g.style.transform = 'translate(' + m.from + 'px, ' + m.y + 'px)'; });
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        movers.forEach(function (m) { m.g.style.transition = 'transform ' + m.dur + 's cubic-bezier(.2,.8,.3,1)'; m.g.style.transform = 'translate(' + m.to + 'px, ' + m.y + 'px)'; });
      }); });
    }
    return { svg: svg, play: play };
  }
  function iceScene(x, vals, on) {
    var svg = sv('svg', { viewBox: '0 0 600 210', role: 'img', 'aria-label': 'Three ice cubes on three surfaces (practice numbers)' }), cubes = [];
    var small = on.indexOf(0) >= 0, sunny = on.indexOf(1) >= 0, warm = on.indexOf(2) >= 0, maxV = Math.max.apply(null, vals);
    if (sunny) { svg.appendChild(sv('circle', { cx: 560, cy: 34, r: 18, fill: 'var(--spark)' })); for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; svg.appendChild(sv('line', { x1: 560 + Math.cos(a) * 24, y1: 34 + Math.sin(a) * 24, x2: 560 + Math.cos(a) * 32, y2: 34 + Math.sin(a) * 32, stroke: 'var(--spark)', 'stroke-width': 3, 'stroke-linecap': 'round' })); } }
    for (var i = 0; i < 3; i++) {
      var cx = 110 + i * 190, base = 150;
      /* the surface */
      if (i === 0) svg.appendChild(sv('rect', { x: cx - 60, y: base, width: 120, height: 14, rx: 7, fill: '#C9DEE6', stroke: 'var(--ink-soft)', 'stroke-width': .8 }));
      if (i === 1) { svg.appendChild(sv('rect', { x: cx - 60, y: base, width: 120, height: 16, rx: 2, fill: '#C89B6A', stroke: '#8A5A2B', 'stroke-width': .8 })); svg.appendChild(sv('path', { d: 'M' + (cx - 50) + ' ' + (base + 6) + ' q30 -3 60 0 t40 2', stroke: '#8A5A2B', 'stroke-width': .8, fill: 'none' })); }
      if (i === 2) { svg.appendChild(sv('ellipse', { cx: cx, cy: base + 7, rx: 44, ry: 10, fill: '#D9DEE3', stroke: 'var(--ink-soft)', 'stroke-width': .8 })); svg.appendChild(sv('rect', { x: cx + 40, y: base + 4, width: 60, height: 6, rx: 3, fill: '#D9DEE3', stroke: 'var(--ink-soft)', 'stroke-width': .8 })); }
      svg.appendChild(sv('text', { x: cx, y: 196, 'font-size': 11, 'font-weight': 800, 'text-anchor': 'middle', fill: 'var(--ink-soft)' }, x.levels[i].toUpperCase()));
      var puddle = sv('ellipse', { cx: cx, cy: base - 1, rx: 4, ry: 2, fill: '#BFE3F0', opacity: .9 });
      var s = small && i ? 30 : 40, g = sv('g', {}); g.style.transform = 'translate(' + cx + 'px, ' + base + 'px) scale(1)'; g.style.transformOrigin = cx + 'px ' + base + 'px';
      g.appendChild(sv('rect', { x: -s / 2, y: -s, width: s, height: s, rx: 6, fill: warm && i ? '#DDEEF6' : '#EAF6FB', stroke: '#8DC6DC', 'stroke-width': 1.5 }));
      g.appendChild(sv('path', { d: 'M' + (-s / 2 + 8) + ' ' + (-s + 8) + ' l10 0 M' + (-s / 2 + 8) + ' ' + (-s + 8) + ' l0 10', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      svg.appendChild(puddle); svg.appendChild(g);
      var lbl = sv('text', { x: cx, y: 180, 'font-size': 11, 'font-weight': 800, 'text-anchor': 'middle', fill: 'var(--ink)' }, vals[i] + ' ' + x.unit);
      svg.appendChild(lbl);
      cubes.push({ g: g, puddle: puddle, dur: 0.6 + 2.4 * vals[i] / maxV, cx: cx, base: base });
    }
    function play() {
      cubes.forEach(function (c) { c.g.style.transition = 'none'; c.puddle.style.transition = 'none'; c.g.style.transform = 'translate(' + c.cx + 'px, ' + c.base + 'px) scale(1)'; c.puddle.setAttribute('rx', 4); c.puddle.setAttribute('ry', 2); });
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        cubes.forEach(function (c) { c.g.style.transition = 'transform ' + c.dur + 's linear'; c.puddle.style.transition = 'rx ' + c.dur + 's linear, ry ' + c.dur + 's linear'; c.g.style.transform = 'translate(' + c.cx + 'px, ' + c.base + 'px) scale(.25)'; c.puddle.setAttribute('rx', 46); c.puddle.setAttribute('ry', 5); });
      }); });
    }
    return { svg: svg, play: play };
  }
  function lavaScene(x, vals, on) {
    var svg = sv('svg', { viewBox: '0 0 600 210', role: 'img', 'aria-label': 'Three jars of oil and water with rising blobs' }), blobs = [];
    var warmW = on.indexOf(0) >= 0, lessOil = on.indexOf(1) >= 0, narrow = on.indexOf(2) >= 0, maxV = Math.max.apply(null, vals);
    for (var i = 0; i < 3; i++) {
      var cx = 110 + i * 190, w = narrow && i ? 70 - 10 * i : 80, top = 30, bot = 170, oilH = (lessOil && i ? 60 - 10 * i : 80);
      var clipId = 'jar' + i + Math.random().toString(36).slice(2, 6);
      var defs = sv('defs', {}), cp = sv('clipPath', { id: clipId }); cp.appendChild(sv('rect', { x: cx - w / 2, y: top, width: w, height: bot - top, rx: 10 })); defs.appendChild(cp); svg.appendChild(defs);
      svg.appendChild(sv('rect', { x: cx - w / 2, y: top + oilH, width: w, height: bot - top - oilH, fill: warmW && i ? '#F6C9C0' : '#BFE3F0' }));   /* water */
      svg.appendChild(sv('rect', { x: cx - w / 2, y: top, width: w, height: oilH, fill: '#FBF1D6' }));                                            /* oil */
      var g = sv('g', { 'clip-path': 'url(#' + clipId + ')' });
      for (var b = 0; b < 2; b++) { var el = sv('circle', { cx: cx - 14 + b * 28, cy: bot - 16 - b * 8, r: 9 + b * 3, fill: 'var(--make)', opacity: .9 }); g.appendChild(el); blobs.push({ el: el, from: bot - 16 - b * 8, to: top + 18 + b * 10, dur: 0.6 + 2.4 * vals[i] / maxV + b * .2 }); }
      svg.appendChild(g);
      svg.appendChild(sv('rect', { x: cx - w / 2, y: top, width: w, height: bot - top, rx: 10, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.5 }));
      svg.appendChild(sv('rect', { x: cx - w / 2 + 8, y: top - 8, width: w - 16, height: 10, rx: 3, fill: 'var(--ink-soft)' }));                  /* lid */
      for (var sp = 0; sp <= i; sp++) svg.appendChild(sv('circle', { cx: cx - 10 + sp * 10, cy: 190, r: 3.5, fill: '#fff', stroke: 'var(--ink-soft)', 'stroke-width': 1 })); /* salt dots: 1, 2, 3 */
      svg.appendChild(sv('text', { x: cx, y: 205, 'font-size': 10, 'font-weight': 800, 'text-anchor': 'middle', fill: 'var(--ink-soft)' }, x.levels[i].toUpperCase() + ' SALT'));
      svg.appendChild(sv('text', { x: cx + w / 2 + 6, y: top + 14, 'font-size': 11, 'font-weight': 800, fill: 'var(--ink)' }, vals[i] + ' ' + x.unit));
    }
    function play() {
      blobs.forEach(function (bl) { bl.el.style.transition = 'none'; bl.el.style.transform = 'translateY(0px)'; });
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        blobs.forEach(function (bl) { bl.el.style.transition = 'transform ' + bl.dur + 's ease-in'; bl.el.style.transform = 'translateY(' + (bl.to - bl.from) + 'px)'; });
      }); });
    }
    return { svg: svg, play: play };
  }
  var SCENES = { balloon: balloonScene, ice: iceScene, lava: lavaScene };

  document.querySelectorAll('.model[data-model="fairtest"]').forEach(function (root) {
    var ei = 0, changed = {}, current = null;
    var top = h('div', 'mtop'), picks = h('div', 'mpicks'), scene = h('div', 'mscene'), vars = h('div', 'mvars'), table = h('table', 'mtable'), verdict = h('div', 'mverdict');
    var run = h('button', 'btn make mrun', 'Run it'); run.type = 'button';
    root.appendChild(top); root.appendChild(scene); root.appendChild(vars); root.appendChild(table); root.appendChild(verdict);
    top.appendChild(h('span', 'mlabel', 'Experiment')); top.appendChild(picks); top.appendChild(run);
    EXPS.forEach(function (x, i) {
      var b = h('button', 'mpick' + (i === 0 ? ' on' : ''), x.name); b.type = 'button';
      b.addEventListener('click', function () { ei = i; changed = {}; picks.querySelectorAll('.mpick').forEach(function (p, j) { p.classList.toggle('on', j === i); }); render(true); });
      picks.appendChild(b);
    });
    run.addEventListener('click', function () { if (current) current.play(); });
    function render(autoplay) {
      var x = EXPS[ei], on = Object.keys(changed).filter(function (k) { return changed[k]; }).map(Number);
      var vals = x.results.map(function (v, i) { var t = v; on.forEach(function (k) { t += x.controls[k].bump[i]; }); return t; });
      /* scene */
      scene.innerHTML = ''; current = SCENES[x.scene](x, vals, on); scene.appendChild(current.svg);
      var cap = h('div', 'mcap', on.length ? 'Look again: ' + on.map(function (k) { return x.controls[k].effect; }).join(' and ') + ' in runs 2 and 3. Two things are different now.' : 'Three runs. Only the ' + x.iv.toLowerCase() + ' is different. Tap Run it.');
      scene.appendChild(cap);
      /* variables */
      vars.innerHTML = '';
      var row = h('div', 'mrow'); row.appendChild(h('span', 'mtag iv', 'Changed on purpose')); row.appendChild(h('span', null, x.iv)); vars.appendChild(row);
      row = h('div', 'mrow'); row.appendChild(h('span', 'mtag dv', 'Measured')); row.appendChild(h('span', null, x.dv)); vars.appendChild(row);
      var ctl = h('div', 'mrow mctl'); ctl.appendChild(h('span', 'mtag cv', 'Kept the same')); ctl.appendChild(h('span', 'mhint', 'Tap a switch to let that one change too'));
      var wrap = h('span', 'mswitches');
      x.controls.forEach(function (c, i) {
        var s = h('button', 'msw' + (changed[i] ? ' on' : ''), c.name); s.type = 'button'; s.setAttribute('aria-pressed', changed[i] ? 'true' : 'false');
        s.title = changed[i] ? 'Tap to keep it the same again' : 'Tap to let this change too';
        s.addEventListener('click', function () { changed[i] = !changed[i]; render(true); });
        wrap.appendChild(s);
      });
      ctl.appendChild(wrap); vars.appendChild(ctl);
      /* table */
      table.innerHTML = '';
      var tr = h('tr'); tr.appendChild(h('th', null, x.iv)); tr.appendChild(h('th', null, x.dv)); if (on.length) tr.appendChild(h('th', null, 'Also different')); table.appendChild(tr);
      x.levels.forEach(function (l, i) {
        var r = h('tr'); r.appendChild(h('td', null, l)); r.appendChild(h('td', 'mnum', String(vals[i])));
        if (on.length) r.appendChild(h('td', 'mdiff', i === 0 ? 'the starting run' : on.map(function (k) { return x.controls[k].effect; }).join(', ')));
        table.appendChild(r);
      });
      /* verdict */
      var pick = x.lowWins ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
      var best = x.levels[vals.indexOf(pick)];
      var names = on.map(function (k) { return x.controls[k].name.toLowerCase(); }).join(' and the ');
      verdict.className = 'mverdict ' + (on.length ? 'bad' : 'good');
      verdict.textContent = on.length
        ? 'Result: "' + best + '" did best. But was it the ' + x.iv.toLowerCase() + ', or the ' + names + '? With ' + (on.length + 1) + ' things changing, you cannot tell which one did it. Switch the extra one off.'
        : 'Result: "' + best + '" did best. Only the ' + x.iv.toLowerCase() + ' changed, so you can say the ' + x.iv.toLowerCase() + ' caused it. That is a fair test.';
      if (autoplay) setTimeout(current.play, 150);
    }
    render(true);
  });
})();

/* ---- science model · energy exchange (v1.8, 2026-10-08): <div class="model" data-model="energy"></div>
   A ball on a track. The student sets the release height, switches friction on or off, and runs it. Three bars show
   where the energy is at every instant: stored (potential), moving (kinetic), and leaked away as heat and sound.
   A total bar stays flat. After a run, a scrub slider steps back through the run frame by frame.
   Practice numbers: energy is shown as a share of the starting total, not in joules.
   Teaches: potential and kinetic energy trade places; the total never changes; with friction the "lost" part is heat
   and sound; a ball can never climb higher than where it was released. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function sv(n, a, txt) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  /* the track: a tall first hill, a dip, a lower second hill, a short valley, and a tall end wall so the ball always turns back */
  var TRACK = 'M30 40 C 110 40, 150 190, 260 190 C 330 190, 350 190, 400 190 C 470 190, 500 90, 560 90 C 600 90, 620 130, 640 130 C 665 130, 685 60, 700 24';
  var BOTTOM = 190, TOP = 40, HMAX = BOTTOM - TOP;   /* heights are measured up from the dip */

  document.querySelectorAll('.model[data-model="energy"]').forEach(function (root) {
    var frames = [], friction = false, release = 4, running = false, raf = 0, dir = 1, s = 0, heat = 0, E0 = 0, lastT = 0, L = 0, SCALE = 100 / HMAX;   /* SCALE: 100 = released from the very top */
    /* layout */
    var top = h('div', 'mtop'), scene = h('div', 'mscene'), ctrl = h('div', 'mvars'), bars = h('div', 'mbars'), note = h('div', 'mverdict good');
    var run = h('button', 'btn make mrun', 'Run it'); run.type = 'button';
    root.appendChild(top); root.appendChild(scene); root.appendChild(ctrl); root.appendChild(bars); root.appendChild(note);
    top.appendChild(h('span', 'mlabel', 'Energy exchange')); top.appendChild(h('span', 'mhint mtophint', 'A ball on a track. Set the release height, then run it and watch the bars trade.')); top.appendChild(run);
    /* scene */
    var svg = sv('svg', { viewBox: '0 0 720 230', role: 'img', 'aria-label': 'A ball on a roller coaster track with a tall first hill, a dip, a lower second hill, and a tall wall at the end' });
    svg.appendChild(sv('path', { d: 'M20 ' + BOTTOM + ' H700', stroke: 'var(--ink-soft)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
    var path = sv('path', { d: TRACK, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 5, 'stroke-linecap': 'round' });
    svg.appendChild(path);
    var startMark = sv('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: 'var(--wonder)', 'stroke-width': 2, 'stroke-dasharray': '3 3' });
    var startTxt = sv('text', { x: 0, y: 0, 'font-size': 11, 'font-weight': 800, fill: 'var(--wonder)' }, 'release height');
    svg.appendChild(startMark); svg.appendChild(startTxt);
    var shimmer = sv('g', { opacity: 0 });   /* heat and sound marks that grow with friction */
    for (var i = 0; i < 5; i++) shimmer.appendChild(sv('path', { d: 'M' + (300 + i * 24) + ' 186 q3 -6 0 -12 q-3 -6 0 -12', fill: 'none', stroke: 'var(--spark)', 'stroke-width': 2, 'stroke-linecap': 'round' }));
    svg.appendChild(shimmer);
    var ball = sv('circle', { r: 11, fill: 'var(--make)', stroke: '#fff', 'stroke-width': 2.5 });
    var shine = sv('circle', { r: 3, fill: '#fff', opacity: .7 });
    svg.appendChild(ball); svg.appendChild(shine);
    var tag = sv('text', { x: 0, y: 0, 'font-size': 11, 'font-weight': 800, fill: 'var(--ink)', 'text-anchor': 'middle' }, '');
    svg.appendChild(tag);
    svg.appendChild(sv('text', { x: 20, y: 212, 'font-size': 11, 'font-weight': 800, fill: 'var(--ink-soft)' }, 'DIP (height 0)'));
    scene.appendChild(svg);
    var cap = h('div', 'mcap', 'Practice numbers: 100 is the energy of a ball released from the very top. Each bar shows where that energy is now.'); scene.appendChild(cap);
    /* controls */
    var row1 = h('div', 'mrow'); row1.appendChild(h('span', 'mtag cv', 'Release height'));
    var hs = document.createElement('input'); hs.type = 'range'; hs.min = 1; hs.max = 5; hs.step = 1; hs.value = release; hs.className = 'mrange'; hs.setAttribute('aria-label', 'Release height, 1 low to 5 high');
    var hsv = h('span', 'mval', 'high'); row1.appendChild(hs); row1.appendChild(hsv); ctrl.appendChild(row1);
    var row2 = h('div', 'mrow'); row2.appendChild(h('span', 'mtag iv', 'Friction'));
    var fsw = h('button', 'msw', 'Rubbing on the track (friction)'); fsw.type = 'button'; fsw.setAttribute('aria-pressed', 'false'); fsw.title = 'Tap to switch friction on';
    row2.appendChild(fsw); row2.appendChild(h('span', 'mhint', 'Off: a perfect track. On: the wheels rub, warm up, and make sound.')); ctrl.appendChild(row2);
    var row3 = h('div', 'mrow'); row3.appendChild(h('span', 'mtag dv', 'Scrub the run'));
    var sc = document.createElement('input'); sc.type = 'range'; sc.min = 0; sc.max = 0; sc.value = 0; sc.className = 'mrange'; sc.disabled = true; sc.setAttribute('aria-label', 'Step back through the last run');
    var scv = h('span', 'mval', 'run it first'); row3.appendChild(sc); row3.appendChild(scv); ctrl.appendChild(row3);
    /* bars */
    var BARS = [['pe', 'Potential · stored', 'var(--wonder)'], ['ke', 'Kinetic · moving', 'var(--make)'], ['heat', 'Heat + sound · leaked', 'var(--spark)'], ['tot', 'Total', 'var(--learn)']];
    var fills = {}, vals = {};
    BARS.forEach(function (b) {
      var r = h('div', 'mbar ' + b[0]); r.appendChild(h('span', 'mbname', b[1]));
      var tr = h('div', 'mtrack'); var f = h('i'); f.style.background = b[2]; tr.appendChild(f); r.appendChild(tr);
      var v = h('span', 'mbval', '0'); r.appendChild(v); bars.appendChild(r); fills[b[0]] = f; vals[b[0]] = v;
    });
    function setBars(pe, ke, hz) {
      var tot = pe + ke + hz;
      fills.pe.style.width = pe + '%'; fills.ke.style.width = ke + '%'; fills.heat.style.width = hz + '%'; fills.tot.style.width = Math.min(100, tot) + '%';
      vals.pe.textContent = Math.round(pe); vals.ke.textContent = Math.round(ke); vals.heat.textContent = Math.round(hz); vals.tot.textContent = Math.round(tot);
    }
    /* geometry helpers */
    function pt(dist) { return path.getPointAtLength(Math.max(0, Math.min(L, dist))); }
    function heightAt(dist) { return BOTTOM - pt(dist).y; }
    function startDist(rel) { /* release 1..5 maps to a point on the first slope: 5 = just over the top, where the track starts to fall */
      var target = HMAX * (0.25 + 0.71 * (rel - 1) / 4), lo = 0, hi = L * 0.33;
      for (var k = 0; k < 30; k++) { var mid = (lo + hi) / 2; if (heightAt(mid) > target) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    }
    function place(dist, pe, ke, hz, label) {
      var p = pt(dist); ball.setAttribute('cx', p.x); ball.setAttribute('cy', p.y - 12); shine.setAttribute('cx', p.x - 3); shine.setAttribute('cy', p.y - 16);
      tag.setAttribute('x', p.x); tag.setAttribute('y', p.y - 30); tag.textContent = label;
      shimmer.setAttribute('opacity', hz > 0 ? Math.min(1, hz / 40) : 0);
      setBars(pe, ke, hz);
    }
    function describe(pe, ke, hz, state) {
      var tot = Math.max(1, pe + ke + hz);
      if (state === 'start') return 'Ready. High and still: all of the energy is stored. Tap Run it.';
      if (state === 'turn') return 'It turned back. It could not climb past the height it was released from: the stored energy ran out before the top.';
      if (state === 'rest') return friction ? 'It stopped in the dip. Nothing vanished: the energy that was stored at the start is now heat in the track and the wheels, and sound in the air. The total is the same.' : 'Run finished.';
      if (ke > pe + hz && ke > 0.6 * tot) return 'Low and fast: most of the energy is moving energy now.';
      if (pe > ke) return 'High and slow: most of the energy is stored.';
      return 'Trading: stored energy is becoming moving energy, or the other way around. Watch the total.';
    }
    function reset() {
      cancelAnimationFrame(raf); running = false; frames = []; heat = 0; dir = 1;
      L = path.getTotalLength(); SCALE = 100 / heightAt(startDist(5)); s = startDist(release); E0 = heightAt(s);
      var p = pt(s); startMark.setAttribute('x1', 20); startMark.setAttribute('x2', 700); startMark.setAttribute('y1', p.y); startMark.setAttribute('y2', p.y);
      startTxt.setAttribute('x', 560); startTxt.setAttribute('y', p.y - 6);
      place(s, E0 * SCALE, 0, 0, 'stored'); note.className = 'mverdict good'; note.textContent = describe(E0 * SCALE, 0, 0, 'start');
      sc.disabled = true; sc.max = 0; sc.value = 0; scv.textContent = 'run it first'; run.textContent = 'Run it';
    }
    function step(now) {
      var dt = Math.min(0.04, (now - lastT) / 1000 || 0.016); lastT = now;
      var tot = E0 * SCALE, hgt = heightAt(s), pe = hgt * SCALE, ke = tot - pe - heat;
      if (ke <= 0.3) { /* out of moving energy: a resting ball rolls toward the lower side; in the dip it stops */
        var ahead = heightAt(s + 2), behind = heightAt(s - 2);
        if (hgt < 2 || (frames.length > 5 && Math.abs(ahead - behind) < 0.05)) { finish('rest'); return; }
        var down = ahead < behind ? 1 : -1;
        if (frames.length > 5 && down !== dir) { note.className = 'mverdict bad'; note.textContent = describe(pe, ke, heat, 'turn'); }
        dir = down; ke = 0.3;
      }
      var speed = Math.sqrt(ke / 100) * 240 + 6;            /* px per second, from the moving share */
      var ds = speed * dt; s += dir * ds;
      if (s <= 0) { s = 0; dir = 1; } if (s >= L) { s = L; dir = -1; }
      if (friction) heat = Math.min(tot, heat + ds * 0.075 * tot / 100);
      hgt = heightAt(s); pe = Math.max(0, Math.min(tot - heat, hgt * SCALE)); ke = Math.max(0, tot - pe - heat);
      var label = pe > 0.7 * tot ? 'stored' : ke > 0.6 * tot ? 'moving' : 'trading';
      place(s, pe, ke, heat, label);
      if (!note.classList.contains('bad') || ke > 5) { note.className = 'mverdict good'; note.textContent = describe(pe, ke, heat); }
      frames.push({ s: s, pe: pe, ke: ke, heat: heat, label: label });
      if (frames.length > 900) { finish(friction ? 'rest' : 'done'); return; }
      raf = requestAnimationFrame(step);
    }
    function finish(state) {
      running = false; run.textContent = 'Run it again';
      if (state === 'rest') { var f = frames[frames.length - 1] || { s: s, heat: heat }, tot = E0 * SCALE; place(f.s, 0, 0, tot, 'stopped'); setBars(0, 0, tot); note.className = 'mverdict good'; note.textContent = describe(0, 0, tot, 'rest'); }
      else { note.className = 'mverdict good'; note.textContent = 'Run finished. With no friction the ball keeps trading forever and never climbs higher than it started. Scrub the run, or switch friction on.'; }
      sc.disabled = false; sc.max = frames.length - 1; sc.value = frames.length - 1; scv.textContent = 'drag to replay';
    }
    run.addEventListener('click', function () {
      if (running) return;
      reset(); running = true; run.textContent = 'Running…'; lastT = performance.now(); raf = requestAnimationFrame(step);
    });
    hs.addEventListener('input', function () { release = +hs.value; hsv.textContent = ['', 'low', 'lowish', 'middle', 'high', 'the very top'][release]; reset(); });
    fsw.addEventListener('click', function () { friction = !friction; fsw.classList.toggle('on', friction); fsw.setAttribute('aria-pressed', friction ? 'true' : 'false'); fsw.title = friction ? 'Tap to switch friction off' : 'Tap to switch friction on'; reset(); });
    sc.addEventListener('input', function () {
      var f = frames[+sc.value]; if (!f) return; cancelAnimationFrame(raf); running = false;
      place(f.s, f.pe, f.ke, f.heat, f.label); note.className = 'mverdict good'; note.textContent = describe(f.pe, f.ke, f.heat); scv.textContent = 'frame ' + (+sc.value + 1) + ' of ' + frames.length;
    });
    hsv.textContent = 'high';
    /* the path needs layout before lengths are right */
    requestAnimationFrame(reset);
  });
})();

/* ---- science model · push the book (v1.9, 2026-10-14): <div class="model" data-model="force"></div>
   A book on a surface. The student picks the push strength, the book's mass, and the surface, then runs it.
   Arrows show every force while it acts: the push, friction (always against the motion), gravity down and the
   surface's normal force up. A readout names the net force and whether the forces are balanced or unbalanced,
   the book moves (or refuses to), and the run is logged in a trial table so one factor can be changed at a time.
   Practice numbers: forces in "force units", distance in cm, scaled to look right, not measured.
   Teaches: net force, balanced vs unbalanced, friction grows with rougher surfaces and heavier objects, and
   why a book that is pushed stops anyway. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function sv(n, a, txt) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  var PUSHES = [['Gentle', 2], ['Medium', 4], ['Hard', 6], ['Very hard', 8]];
  var MASSES = [['Light book', 1], ['Heavy book', 2], ['Stack of books', 3]];
  var SURFACES = [['Ice', 0.5], ['Wooden desk', 1.5], ['Carpet', 3]];
  var FONT = 'Nunito, Segoe UI, sans-serif';

  document.querySelectorAll('.model[data-model="force"]').forEach(function (root) {
    var pi = 1, mi = 0, si = 1, running = false, raf = 0, trials = 0;
    var top = h('div', 'mtop'), scene = h('div', 'mscene'), ctrl = h('div', 'mvars'), verdict = h('div', 'mverdict good'), table = h('table', 'mtable');
    var run = h('button', 'btn make mrun', 'Push it'); run.type = 'button';
    root.appendChild(top); root.appendChild(scene); root.appendChild(ctrl); root.appendChild(verdict); root.appendChild(table);
    top.appendChild(h('span', 'mlabel', 'Push the book')); top.appendChild(h('span', 'mhint mtophint', 'Change one thing at a time. Run it. Read the arrows and the log.')); top.appendChild(run);
    /* scene */
    var svg = sv('svg', { viewBox: '0 0 720 250', role: 'img', 'aria-label': 'A book on a surface with arrows for the push, friction, gravity, and the surface pushing up' });
    var ground = sv('rect', { x: 20, y: 190, width: 680, height: 12, rx: 3, fill: '#8A5A2B' });
    var groundLbl = sv('text', { x: 30, y: 222, 'font-size': 12, 'font-weight': 800, fill: 'var(--ink-soft)', 'font-family': FONT }, '');
    svg.appendChild(ground); svg.appendChild(groundLbl);
    svg.appendChild(sv('text', { x: 690, y: 222, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink-soft)', 'font-family': FONT }, 'practice numbers'));
    var book = sv('g', {});
    var bookRect = sv('rect', { x: -45, y: -40, width: 90, height: 40, rx: 5, fill: '#fff', stroke: 'var(--ink)', 'stroke-width': 2 });
    var bookTxt = sv('text', { x: 0, y: -15, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)', 'font-family': FONT }, 'book');
    book.appendChild(bookRect); book.appendChild(bookTxt); svg.appendChild(book);
    function arrow(color) { var g = sv('g', { opacity: 0 }); var line = sv('path', { d: '', stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round' }); var head = sv('path', { d: '', fill: 'none', stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); var lbl = sv('text', { 'font-size': 12, 'font-weight': 800, fill: color, 'font-family': FONT, 'text-anchor': 'middle' }, ''); g.appendChild(line); g.appendChild(head); g.appendChild(lbl); svg.appendChild(g); return { g: g, line: line, head: head, lbl: lbl }; }
    var aPush = arrow('var(--make)'), aFric = arrow('var(--learn)'), aGrav = arrow('var(--wonder)'), aNorm = arrow('var(--wonder)');
    function setArrow(a, x, y, dx, dy, text, tx, ty) {
      if (!dx && !dy) { a.g.setAttribute('opacity', 0); return; }
      a.g.setAttribute('opacity', 1);
      var ex = x + dx, ey = y + dy, ux = dx ? Math.sign(dx) : 0, uy = dy ? Math.sign(dy) : 0;
      a.line.setAttribute('d', 'M' + x + ' ' + y + ' L' + ex + ' ' + ey);
      if (dx) a.head.setAttribute('d', 'M' + (ex - ux * 14) + ' ' + (ey - 12) + ' L' + ex + ' ' + ey + ' L' + (ex - ux * 14) + ' ' + (ey + 12));
      else a.head.setAttribute('d', 'M' + (ex - 12) + ' ' + (ey - uy * 14) + ' L' + ex + ' ' + ey + ' L' + (ex + 12) + ' ' + (ey - uy * 14));
      a.lbl.textContent = text; a.lbl.setAttribute('x', tx); a.lbl.setAttribute('y', ty);
    }
    scene.appendChild(svg);
    scene.appendChild(h('div', 'mcap', 'Arrow length shows the size of each force. Friction always points against the motion.'));
    /* controls */
    function pickRow(label, tagCls, opts, get, set) {
      var row = h('div', 'mrow'); row.appendChild(h('span', 'mtag ' + tagCls, label));
      var picks = h('span', 'mpicks');
      opts.forEach(function (o, i) {
        var b = h('button', 'mpick' + (get() === i ? ' on' : ''), o[0]); b.type = 'button';
        b.addEventListener('click', function () { if (running) return; set(i); picks.querySelectorAll('.mpick').forEach(function (p, j) { p.classList.toggle('on', j === i); }); ready(); });
        picks.appendChild(b);
      });
      row.appendChild(picks); ctrl.appendChild(row);
    }
    pickRow('Your push', 'iv', PUSHES, function () { return pi; }, function (i) { pi = i; });
    pickRow('The book', 'cv', MASSES, function () { return mi; }, function (i) { mi = i; });
    pickRow('The surface', 'cv', SURFACES, function () { return si; }, function (i) { si = i; });
    /* table */
    var thead = h('tr'); ['Trial', 'Push', 'Book', 'Surface', 'Friction', 'Net force', 'Result'].forEach(function (t) { thead.appendChild(h('th', null, t)); }); table.appendChild(thead);
    var clearRow = h('div', 'mrow'); var clear = h('button', 'reset', 'Clear the log'); clear.type = 'button'; clear.addEventListener('click', function () { while (table.rows.length > 1) table.deleteRow(1); trials = 0; }); clearRow.appendChild(clear); root.appendChild(clearRow);
    /* physics (practice numbers) */
    function friction() { return MASSES[mi][1] * SURFACES[si][1]; }
    function place(x, push, fric, moving) {
      book.setAttribute('transform', 'translate(' + x + ' 190)');
      var m = MASSES[mi][1], g = 10 * m;
      setArrow(aGrav, x, 190, 0, g + 12, 'gravity ' + m, x + 44, 190 + g + 10);
      setArrow(aNorm, x, 150, 0, -(g + 12), 'surface pushes up ' + m, x, 150 - g - 18);
      setArrow(aPush, x - 45, 170, -push * 12, 0, push ? 'push ' + push : '', x - 45 - push * 6, 150);
      setArrow(aFric, x + 45, 170, fric * 12, 0, fric ? 'friction ' + fric : '', x + 45 + fric * 6, 150);
      groundLbl.textContent = SURFACES[si][0].toUpperCase() + (moving ? ' · sliding' : '');
    }
    function ready() {
      cancelAnimationFrame(raf); running = false;
      ground.setAttribute('fill', ['#BFE3F0', '#C89B6A', '#D96A4B'][si]); ground.setAttribute('opacity', si === 2 ? .55 : 1);
      bookRect.setAttribute('height', 30 + 10 * MASSES[mi][1]); bookRect.setAttribute('y', -(30 + 10 * MASSES[mi][1])); bookTxt.setAttribute('y', -(30 + 10 * MASSES[mi][1]) / 2 + 5);
      place(160, 0, 0, false);
      verdict.className = 'mverdict good';
      verdict.textContent = 'Ready: a ' + MASSES[mi][0].toLowerCase() + ' on ' + (si === 0 ? 'ice' : SURFACES[si][0].toLowerCase()) + '. Gravity pulls down and the surface pushes up the same amount, so up and down are balanced. Tap Push it.';
      run.textContent = 'Push it';
    }
    run.addEventListener('click', function () {
      if (running) return; running = true; run.textContent = 'Pushing…';
      var P = PUSHES[pi][1], f = friction(), m = MASSES[mi][1], x0 = 160, t0 = performance.now();
      if (P <= f) { /* static: friction matches the push, nothing moves */
        place(x0, P, P, false);
        verdict.className = 'mverdict bad';
        verdict.textContent = 'Push ' + P + ' to the right, friction ' + P + ' to the left: net force 0. Balanced, so the book does not move. Friction can hold up to ' + f + ' here. Push harder, use a lighter book, or pick a smoother surface.';
        log(P, f, 'balanced, net 0', 'Did not move');
        setTimeout(function () { running = false; run.textContent = 'Push it again'; }, 900); return;
      }
      var a = (P - f) / m, T = 0.6, v = a * T, d1 = 0.5 * a * T * T, dec = f / m, d2 = v * v / (2 * dec), scale = 40;
      var total = Math.round((d1 + d2) * scale), net = P - f;
      function step(now) {
        var t = (now - t0) / 1000, x, phase;
        if (t <= T) { x = x0 + 0.5 * a * t * t * scale; phase = 'push'; place(x, P, f, true); verdict.className = 'mverdict good'; verdict.textContent = 'Pushing: push ' + P + ' right, friction ' + f + ' left. Net force ' + net + ' to the right: unbalanced, so the book speeds up.'; }
        else { var tt = t - T, vv = Math.max(0, v - dec * tt); x = x0 + (d1 + v * tt - 0.5 * dec * tt * tt) * scale; phase = 'slide';
          if (vv <= 0) { x = x0 + (d1 + d2) * scale; place(Math.min(x, 650), 0, 0, false); finish(); return; }
          place(Math.min(x, 650), 0, f, true); verdict.className = 'mverdict bad'; verdict.textContent = 'You let go. Only friction ' + f + ' is left, pointing against the motion. Net force ' + f + ' to the left: unbalanced, so the book slows down.'; }
        raf = requestAnimationFrame(step);
      }
      function finish() {
        running = false; run.textContent = 'Push it again';
        verdict.className = 'mverdict good';
        verdict.textContent = 'Stopped after about ' + total + ' cm. Now nothing pushes sideways: net force 0, balanced again. The moving energy became heat in the surface and a little sound.';
        log(P, f, 'unbalanced, ' + net + ' right', 'Slid about ' + total + ' cm');
      }
      raf = requestAnimationFrame(step);
    });
    function log(P, f, netTxt, result) {
      trials += 1; var tr = h('tr');
      [String(trials), PUSHES[pi][0] + ' (' + P + ')', MASSES[mi][0] + ' (' + MASSES[mi][1] + ')', SURFACES[si][0], String(f), netTxt, result].forEach(function (t, i) { tr.appendChild(h('td', i === 6 ? 'mnum' : null, t)); });
      table.appendChild(tr);
    }
    ready();
  });
})();

/* ---- science model · solve the puddle (v2.0, 2026-10-15): <div class="model" data-model="puddle"></div>
   The Week 4 reading's wet patch, tested. The student picks a hypothesis (the hose, dew from the tree, a sprinkler),
   switches on what to change (move the hose, cover the tree, turn off the sprinkler), picks how many mornings to
   check (1, 3, 5), and runs it. Each morning fills a tile and a data row, wet or dry, from a hidden true cause plus
   a little chance, so one morning can mislead but three or five rarely do. The student then calls the hypothesis
   supported or not and the model answers from the data. The true cause is picked once per page load (the hose most
   of the time, dew from the tree otherwise), so the data, not the reading, decides.
   Teaches: a hypothesis names one change and one result; change one thing at a time; repeat before you trust
   a result; a test can only speak to the hypothesis it was built for; an unsupported hypothesis is still a result. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var HYP = [
    ['The hose', 'If the dripping hose is the source, then moving the hose away will leave the sidewalk dry in the morning.'],
    ['Dew from the tree', 'If dew dripping from the tree is the source, then covering the tree will leave the sidewalk dry in the morning.'],
    ['A sprinkler', 'If a sprinkler is the source, then turning the sprinkler off will leave the sidewalk dry in the morning.']];
  var CHG = ['Move the hose away', 'Cover the tree', 'Turn the sprinkler off'];
  var DAYS = [1, 3, 5];

  document.querySelectorAll('.model[data-model="puddle"]').forEach(function (root) {
    var cause = Math.random() < 0.65 ? 0 : 1; /* hidden: 0 hose, 1 tree dew */
    var hi = 0, di = 1, on = [false, false, false], running = false, trials = 0, result = null;
    var top = h('div', 'mtop'), ctrl = h('div', 'mvars'), hyp = h('div', 'mverdict good'), scene = h('div', 'mscene'), days = h('div', 'mdays'), ask = h('div', 'mask'), verdict = h('div', 'mverdict good'), table = h('table', 'mtable');
    var run = h('button', 'btn make mrun', 'Check the sidewalk'); run.type = 'button';
    root.appendChild(top); root.appendChild(hyp); root.appendChild(ctrl); root.appendChild(scene); root.appendChild(ask); root.appendChild(verdict); root.appendChild(table);
    top.appendChild(h('span', 'mlabel', 'Solve the puddle')); top.appendChild(h('span', 'mhint mtophint', 'Pick a hypothesis, change one thing, check more than one morning.')); top.appendChild(run);
    /* controls */
    var hrow = h('div', 'mrow'); hrow.appendChild(h('span', 'mtag iv', 'Step 3 · Hypothesis')); var hp = h('span', 'mpicks');
    HYP.forEach(function (o, i) { var b = h('button', 'mpick' + (i === hi ? ' on' : ''), o[0]); b.type = 'button'; b.addEventListener('click', function () { if (running) return; hi = i; hp.querySelectorAll('.mpick').forEach(function (p, j) { p.classList.toggle('on', j === i); }); ready(); }); hp.appendChild(b); });
    hrow.appendChild(hp); ctrl.appendChild(hrow);
    var crow = h('div', 'mrow'); crow.appendChild(h('span', 'mtag cv', 'Step 4 · What you change')); var sw = h('span', 'mswitches');
    CHG.forEach(function (c, i) { var b = h('button', 'msw', c); b.type = 'button'; b.addEventListener('click', function () { if (running) return; on[i] = !on[i]; b.classList.toggle('on', on[i]); ready(); }); sw.appendChild(b); });
    crow.appendChild(sw); ctrl.appendChild(crow);
    var drow = h('div', 'mrow'); drow.appendChild(h('span', 'mtag dv', 'Mornings to check')); var dp = h('span', 'mpicks');
    DAYS.forEach(function (d, i) { var b = h('button', 'mpick' + (i === di ? ' on' : ''), d + (d === 1 ? ' morning' : ' mornings')); b.type = 'button'; b.addEventListener('click', function () { if (running) return; di = i; dp.querySelectorAll('.mpick').forEach(function (p, j) { p.classList.toggle('on', j === i); }); ready(); }); dp.appendChild(b); });
    drow.appendChild(dp); ctrl.appendChild(drow);
    /* scene: the mornings */
    scene.appendChild(days); scene.appendChild(h('div', 'mcap', 'Each tile is one 7:00 check of the spot under the tree.'));
    /* ask: supported or not */
    var askTxt = h('span', 'masktxt', ''); var yes = h('button', 'btn learn', 'Supported'); var no = h('button', 'btn make', 'Not supported'); yes.type = no.type = 'button';
    ask.appendChild(askTxt); ask.appendChild(yes); ask.appendChild(no); ask.hidden = true;
    yes.addEventListener('click', function () { call(true); }); no.addEventListener('click', function () { call(false); });
    /* table */
    var thead = h('tr'); ['Trial', 'Hypothesis', 'Changed', 'Mornings', 'Data', 'Your call', 'What the data says'].forEach(function (t) { thead.appendChild(h('th', null, t)); }); table.appendChild(thead);
    var clearRow = h('div', 'mrow'); var clear = h('button', 'reset', 'Clear the log'); clear.type = 'button'; clear.addEventListener('click', function () { while (table.rows.length > 1) table.deleteRow(1); trials = 0; }); clearRow.appendChild(clear); root.appendChild(clearRow);
    function nOn() { return on.filter(Boolean).length; }
    function ready() {
      running = false; result = null; ask.hidden = true; days.innerHTML = ''; run.textContent = 'Check the sidewalk';
      hyp.className = 'mverdict good'; hyp.textContent = 'Your hypothesis: ' + HYP[hi][1];
      var n = nOn(), msg;
      if (n === 0) msg = 'You have not changed anything yet. With no change, every morning just repeats what you already saw.';
      else if (n > 1) msg = 'You switched on ' + n + ' changes at once. If the sidewalk comes up dry, you will not know which change did it. Scientists change one thing at a time.';
      else if (!on[hi]) msg = 'Careful: "' + CHG[on.indexOf(true)] + '" does not test the hypothesis you picked. A test can only answer the question it was built for.';
      else msg = 'Good test: one change, and it matches your hypothesis. ' + (DAYS[di] === 1 ? 'One morning is a thin test. Can one morning fool you?' : DAYS[di] + ' mornings will give you a pattern, not a fluke.');
      verdict.className = 'mverdict ' + (n === 1 && on[hi] ? 'good' : 'bad'); verdict.textContent = msg;
    }
    run.addEventListener('click', function () {
      if (running) return; running = true; run.textContent = 'Checking…'; days.innerHTML = ''; ask.hidden = true;
      var removed = on[cause], pWet = removed ? 0.12 : 0.88, N = DAYS[di], data = [], k = 0;
      for (var i = 0; i < N; i++) data.push(Math.random() < pWet);
      verdict.className = 'mverdict good'; verdict.textContent = 'Step 4: checking the spot under the tree at 7:00 each morning…';
      (function tick() {
        if (k < N) { var t = h('div', 'mday ' + (data[k] ? 'wet' : 'dry')); t.appendChild(h('span', 'mdn', 'Morning ' + (k + 1))); t.appendChild(h('span', 'mdv', data[k] ? 'WET' : 'DRY')); days.appendChild(t); k += 1; setTimeout(tick, 550); return; }
        result = data; running = false; run.textContent = 'Check again';
        var wet = data.filter(Boolean).length;
        verdict.textContent = 'Step 5: look at the data. ' + wet + ' wet, ' + (N - wet) + ' dry out of ' + N + '. Was your hypothesis supported or not? Tap your call.';
        askTxt.textContent = 'Step 6 · Your conclusion:'; ask.hidden = false;
      })();
    });
    function call(saidYes) {
      if (!result) return; ask.hidden = true;
      var N = result.length, wet = result.filter(Boolean).length, dry = N - wet, mostlyDry = dry > wet, n = nOn(), truth, msg, good;
      var dataTxt = wet + ' wet / ' + dry + ' dry';
      if (n !== 1 || !on[hi]) {
        truth = 'Cannot tell';
        msg = n === 0 ? 'The data cannot support or reject anything: nothing was changed, so this was not a test of your hypothesis.' : n > 1 ? (mostlyDry ? 'Mostly dry, but ' + n + ' things changed, so the data cannot say which one mattered. Run it again with one change.' : 'Mostly wet even with ' + n + ' changes. That rejects all of them at once, but a scientist would still test them one at a time to be sure.') : 'You tested "' + CHG[on.indexOf(true)] + '" but your hypothesis is about ' + HYP[hi][0].toLowerCase() + '. The data says nothing about your hypothesis. Match the change to the claim.';
        good = false;
      } else {
        truth = mostlyDry ? 'Supported' : 'Not supported';
        good = saidYes === mostlyDry;
        if (good && mostlyDry) msg = 'Yes. ' + dataTxt + ': with the change made, the sidewalk came up dry. The data supports your hypothesis. ' + (N === 1 ? 'But one morning is thin evidence. Would you bet on it? Try 3 or 5.' : 'Repeated mornings make this a result you can trust, and share.');
        else if (good && !mostlyDry) msg = 'Yes. ' + dataTxt + ': the spot stayed wet even after the change, so the data does not support your hypothesis. That is not a failure. You just ruled out a suspect. New question: what else is near that spot?';
        else if (!good && mostlyDry) msg = 'Look again. ' + dataTxt + ': the sidewalk was mostly dry after your change. That is what your if-then sentence predicted, so the data supports it.';
        else msg = 'Look again. ' + dataTxt + ': the spot stayed wet even though you made the change. Your if-then predicted dry. Not supported, and that is a real result worth sharing.';
        if (N === 1) msg += ' Remember, a single morning can fool you either way.';
      }
      verdict.className = 'mverdict ' + (good ? 'good' : 'bad'); verdict.textContent = msg;
      trials += 1; var tr = h('tr');
      [String(trials), HYP[hi][0], on.map(function (b, i) { return b ? CHG[i] : null; }).filter(Boolean).join(' + ') || 'Nothing', String(N), dataTxt, saidYes ? 'Supported' : 'Not supported', truth].forEach(function (t, i) { tr.appendChild(h('td', i === 6 ? 'mnum' : null, t)); });
      table.appendChild(tr); result = null;
    }
    ready();
  });
})();

/* ---- microscope vocabulary (v1.4, 2026-10-01): .scope > .eyepiece .view (.term, .def) + .tray > button.slide (text, then .def)
   Tap a slide in the tray and its term and definition appear in the eyepiece. One slide under the lens at a time.
   The science course's version of the vocabulary cabinet. ---- */
(function () {
  'use strict';
  document.querySelectorAll('.scope').forEach(function (sc) {
    var term = sc.querySelector('.eyepiece .term'), def = sc.querySelector('.eyepiece .def'), slides = sc.querySelectorAll('.slide');
    function show(s) {
      slides.forEach(function (x) { x.classList.toggle('on', x === s); x.setAttribute('aria-pressed', x === s ? 'true' : 'false'); });
      var d = s.querySelector('.def');
      if (term) term.textContent = s.childNodes[0].textContent.trim();
      if (def) def.textContent = d ? d.textContent : '';
    }
    slides.forEach(function (s) { s.type = 'button'; s.addEventListener('click', function () { show(s); }); });
    if (term && !term.textContent.trim()) { term.textContent = 'Tap a slide'; if (def) def.textContent = 'Each slide in the tray holds one term. Put it under the lens.'; }
  });
})();

/* ---- science model · compound builder (v1.9, 2026-10-08): <div class="model" data-model="compound" data-elements='[["H","Hydrogen","nonmetal"],...]' data-compounds='[{"name":"Water","formula":"H2O","counts":{"H":2,"O":1},"note":"..."}]'></div>
   Element tiles from the page (symbol, name, family). The student taps tiles to add atoms to the bench; the formula builds
   itself with subscripts; when the atoms match one of the page's compounds exactly, the model names it and shows the page's
   note. A "Build this" target cycles through the page's compounds. Everything shown comes from the page's data attributes.
   Teaches: a compound is a specific combination of elements in specific numbers; a short list of elements builds many compounds. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function formulaHTML(order, counts) {
    return order.map(function (s) { return s + (counts[s] > 1 ? '<sub>' + counts[s] + '</sub>' : ''); }).join('');
  }
  function sameCounts(a, b) {
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return a[k] === b[k]; });
  }
  document.querySelectorAll('.model[data-model="compound"]').forEach(function (root) {
    var elements, compounds;
    try { elements = JSON.parse(root.dataset.elements); compounds = JSON.parse(root.dataset.compounds); } catch (e) { return; }
    var counts = {}, order = [], target = 0, built = {}, history = [];
    var top = h('div', 'mtop'), tiles = h('div', 'mtiles'), bench = h('div', 'mbench'), out = h('div', 'mverdict'), actions = h('div', 'mtop');
    top.appendChild(h('span', 'mlabel', root.dataset.label || 'Compound builder'));
    var tgt = h('span', 'mtarget'); top.appendChild(tgt);
    var next = h('button', 'btn ghost mnext', 'Next target'); next.type = 'button'; top.appendChild(next);
    root.appendChild(top); root.appendChild(tiles); root.appendChild(bench); root.appendChild(out); root.appendChild(actions);
    var undo = h('button', 'btn ghost', 'Remove last'); undo.type = 'button';
    var clear = h('button', 'reset', 'Clear the bench'); clear.type = 'button';
    var tally = h('span', 'mhint mtophint', '');
    actions.appendChild(undo); actions.appendChild(clear); actions.appendChild(tally);
    elements.forEach(function (el) {
      var b = h('button', 'mtile ' + (el[2] || '')); b.type = 'button';
      b.appendChild(h('span', 'msym', el[0])); b.appendChild(h('span', 'mname', el[1]));
      b.setAttribute('aria-label', 'Add one ' + el[1] + ' atom');
      b.addEventListener('click', function () { add(el[0]); });
      tiles.appendChild(b);
    });
    function famOf(sym) { var e = elements.filter(function (x) { return x[0] === sym; })[0]; return (e && e[2]) || ''; }
    function add(sym) { history.push(sym); if (!counts[sym]) { counts[sym] = 0; order.push(sym); } counts[sym]++; render(); }
    function removeLast() {
      var sym = history.pop(); if (!sym) return;
      counts[sym]--; if (!counts[sym]) { delete counts[sym]; order = order.filter(function (s) { return s !== sym; }); }
      render();
    }
    function reset() { counts = {}; order = []; history = []; render(); }
    function setTarget(i) { target = i % compounds.length; tgt.innerHTML = 'Build this: <strong>' + compounds[target].name + '</strong>'; render(); }
    function render() {
      bench.innerHTML = '';
      var total = 0;
      order.forEach(function (s) { for (var i = 0; i < counts[s]; i++) { bench.appendChild(h('span', 'matom ' + famOf(s), s)); total++; } });
      if (!total) bench.appendChild(h('span', 'mempty', 'Tap element tiles to put atoms on the bench.'));
      var f = h('div', 'mformula'); f.innerHTML = total ? formulaHTML(order, counts) : '&nbsp;'; bench.appendChild(f);
      tally.textContent = total ? total + ' atom' + (total === 1 ? '' : 's') + ' from ' + order.length + ' element' + (order.length === 1 ? '' : 's') : '';
      var match = compounds.filter(function (c) { return sameCounts(c.counts, counts); })[0];
      out.className = 'mverdict' + (match ? ' good' : (total ? ' bad' : ''));
      if (match) {
        built[match.name] = true;
        var isTarget = match === compounds[target];
        out.innerHTML = (isTarget ? 'Target built. ' : 'You built ') + '<strong>' + match.name + '</strong>, ' + formulaHTML(Object.keys(match.counts), match.counts) + ': ' + match.note
          + (isTarget ? ' <em>Tap Next target.</em>' : '') + ' <span class="mhint">Compounds built so far: ' + Object.keys(built).length + ' of ' + compounds.length + '.</span>';
      } else if (total) {
        out.textContent = 'Not one of this week\'s compounds yet. Add or remove atoms, or clear the bench. The numbers matter as much as the elements.';
      } else {
        out.textContent = 'A compound is a specific set of elements in specific numbers. Build the target, then try the others.';
      }
    }
    undo.addEventListener('click', removeLast);
    clear.addEventListener('click', reset);
    next.addEventListener('click', function () { reset(); setTarget(target + 1); });
    setTarget(0);
  });
})();

/* ---- fossil dig (v1.10, 2026-10-15): a shovel follows the mouse or finger; swiping over the rock clears it.
   When a find is uncovered, a pop-up shows it and asks its type; digging resumes after the right answer.
   <div class="dig card" data-done="text when every find is named" data-types="mo:Mold|ca:Cast|tr:Trace|tf:True form">
     <div class="dig-site" data-cols="16" data-rows="12" data-layers="Top layer|Middle layer|Bottom layer" tabindex="0" aria-label="...">
       <div class="find" data-r="1" data-c="9" data-w="4" data-h="4" data-type="tr" data-name="..." data-fb="..." data-hint="..."><img src="..." alt="..." /></div>
     </div>
     <div class="dig-bar"><span class="dig-count"></span><button class="reset dig-reset">Fill the site back in</button></div>
     <ol class="dig-log"></ol>
   </div>
   Options (v2.3, 2026-10-15): data-ask="… {layer} …" replaces the pop-up question (the layer name is filled in);
   data-noun="" drops the word "fossil" after the chosen answer; data-tool="drill" swaps the shovel for a core drill.
   Theme .dig.core-drill colors four layers as Earth's crust, mantle, outer core, and inner core.
   Rows split evenly into the named layers (top first). Mouse: move over the rock to dig. Touch: drag a finger.
   Keyboard: focus the site, move the shovel with the arrow keys, Space or Enter to dig. ---- */
(function () {
  var SHOVEL = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M44 6l14 14-5 5-14-14z" fill="#8A5A2B"/><path d="M41 13l10 10-17 17-10-10z" fill="#A0703C"/>'
    + '<path d="M26 28l10 10-8 8c-4 4-12 5-17 0s-4-13 0-17z" fill="#9AA3AE" stroke="#4B5563" stroke-width="2.5" stroke-linejoin="round"/>'
    + '<path d="M14 40c2 3 5 6 9 7" fill="none" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/></svg>';
  var DRILL = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M40 4l20 20-10 10-20-20z" fill="#D96A4B" stroke="#7A3320" stroke-width="2" stroke-linejoin="round"/>'
    + '<path d="M33 21l10 10-6 6-10-10z" fill="#4B5563"/><path d="M30 28l6 6L10 58l-4-4z" fill="#9AA3AE" stroke="#4B5563" stroke-width="2" stroke-linejoin="round"/>'
    + '<path d="M27 37l4 4M22 42l4 4M17 47l4 4" stroke="#4B5563" stroke-width="2" stroke-linecap="round"/></svg>';
  document.querySelectorAll('.dig').forEach(function (d) {
    var site = d.querySelector('.dig-site');
    var cols = +site.dataset.cols || 16, rows = +site.dataset.rows || 12;
    var layers = (site.dataset.layers || 'Layer').split('|');
    var types = (d.dataset.types || '').split('|').map(function (t) { var p = t.split(':'); return { k: p[0], label: p[1] }; });
    var finds = [].slice.call(site.querySelectorAll('.find'));
    var log = d.querySelector('.dig-log'), count = d.querySelector('.dig-count');
    var grid = [], queue = [], named = 0, down = false, popOpen = false, kr = 1, kc = 1;
    site.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    site.style.gridTemplateRows = 'repeat(' + rows + ', 1fr)';
    if (!site.hasAttribute('tabindex')) site.tabIndex = 0;
    function layerOf(r) { return Math.min(layers.length - 1, Math.floor((r - 1) * layers.length / rows)); }
    finds.forEach(function (f) { f.style.gridArea = f.dataset.r + ' / ' + f.dataset.c + ' / span ' + (f.dataset.h || 1) + ' / span ' + (f.dataset.w || 1); });
    layers.forEach(function (name, i) {
      var lab = document.createElement('span'); lab.className = 'dig-layer'; lab.textContent = name;
      lab.style.top = (i * 100 / layers.length) + '%'; site.appendChild(lab);
    });
    var tool = document.createElement('span'); tool.className = 'dig-tool'; tool.innerHTML = d.dataset.tool === 'drill' ? DRILL : SHOVEL; site.appendChild(tool);
    var noun = d.dataset.noun != null ? d.dataset.noun : ' fossil';

    // the pop-up lives on <body> so it is centered on any screen, over everything
    var pop = document.createElement('div'); pop.className = 'dig-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true');
    pop.innerHTML = '<div class="dig-pop-card"><div class="dig-pop-img"></div><p class="prompt"></p><div class="opts"></div><div class="fb"></div><div class="dig-pop-actions"></div></div>';
    document.body.appendChild(pop);

    function build() {
      grid.forEach(function (row) { row.forEach(function (c) { c.remove(); }); });
      grid = [];
      for (var r = 1; r <= rows; r++) {
        var row = [];
        for (var c = 1; c <= cols; c++) {
          var b = document.createElement('span');
          b.className = 'dig-cell l' + layerOf(r); b.style.gridArea = r + ' / ' + c; b.dataset.r = r; b.dataset.c = c;
          site.appendChild(b); row.push(b);
        }
        grid.push(row);
      }
      site.appendChild(tool);
      finds.forEach(function (f) { f.classList.remove('found', 'named'); });
      queue = []; named = 0; log.innerHTML = ''; d.classList.remove('done'); closePop(); status();
    }
    function covers(f) {
      var r0 = +f.dataset.r, c0 = +f.dataset.c, h = +(f.dataset.h || 1), w = +(f.dataset.w || 1), out = [];
      for (var r = r0; r < r0 + h; r++) for (var c = c0; c < c0 + w; c++) out.push(grid[r - 1][c - 1]);
      return out;
    }
    function status() {
      count.textContent = named === finds.length && finds.length ? (d.dataset.done || 'Every find named.') : 'Finds named: ' + named + ' of ' + finds.length;
    }
    function clearAt(r, c) {            // the shovel clears the square under it and the four around it
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) {
        var rr = r + o[0], cc = c + o[1];
        if (rr >= 1 && rr <= rows && cc >= 1 && cc <= cols) grid[rr - 1][cc - 1].classList.add('gone');
      });
      finds.forEach(function (f) {
        if (f.classList.contains('found')) return;
        var cv = covers(f), gone = cv.filter(function (x) { return x.classList.contains('gone'); }).length;
        if (gone / cv.length >= 0.8) { cv.forEach(function (x) { x.classList.add('gone'); }); f.classList.add('found'); queue.push(f); }
      });
      if (queue.length && !popOpen) setTimeout(function () { if (!popOpen && queue.length) ask(queue.shift()); }, 350);
    }
    function cellFromPoint(x, y) {
      var b = site.getBoundingClientRect();
      if (x < b.left || x > b.right || y < b.top || y > b.bottom) return null;
      return [Math.min(rows, Math.floor((y - b.top) / b.height * rows) + 1), Math.min(cols, Math.floor((x - b.left) / b.width * cols) + 1)];
    }
    function moveTool(x, y) {
      var b = site.getBoundingClientRect();
      tool.style.left = (x - b.left) + 'px'; tool.style.top = (y - b.top) + 'px'; site.classList.add('tooling');
    }
    function digAt(x, y) {
      if (popOpen) return;
      var rc = cellFromPoint(x, y); if (!rc) return;
      clearAt(rc[0], rc[1]); site.classList.add('digging'); clearTimeout(site._t); site._t = setTimeout(function () { site.classList.remove('digging'); }, 160);
    }
    site.addEventListener('pointermove', function (e) {
      moveTool(e.clientX, e.clientY);
      if (e.pointerType === 'mouse' || down) digAt(e.clientX, e.clientY);    // a mouse digs as it sweeps; a finger digs while dragging
    });
    site.addEventListener('pointerdown', function (e) { down = true; moveTool(e.clientX, e.clientY); digAt(e.clientX, e.clientY); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { site.addEventListener(ev, function () { down = false; }); });
    site.addEventListener('pointerleave', function () { down = false; site.classList.remove('tooling'); });
    site.addEventListener('keydown', function (e) {
      var k = e.key, moved = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[k];
      if (moved) { e.preventDefault(); kr = Math.max(1, Math.min(rows, kr + moved[0])); kc = Math.max(1, Math.min(cols, kc + moved[1])); }
      else if (k === ' ' || k === 'Enter') { e.preventDefault(); if (!popOpen) clearAt(kr, kc); }
      else return;
      var b = site.getBoundingClientRect();
      moveTool(b.left + (kc - 0.5) * b.width / cols, b.top + (kr - 0.5) * b.height / rows);
    });

    function closePop() { popOpen = false; pop.classList.remove('show'); }
    function ask(f) {
      popOpen = true; down = false;
      var layer = layers[layerOf(+f.dataset.r)];
      var card = pop.querySelector('.dig-pop-card');
      var img = f.querySelector('img');
      card.querySelector('.dig-pop-img').innerHTML = img ? '<img src="' + img.getAttribute('src') + '" alt="' + (img.getAttribute('alt') || '') + '" />' : '';
      card.querySelector('.prompt').innerHTML = (d.dataset.ask || 'You found something in the <strong>{layer}</strong>! What type of fossil is it?').replace('{layer}', layer.toLowerCase());
      var opts = card.querySelector('.opts'), fb = card.querySelector('.fb'), act = card.querySelector('.dig-pop-actions');
      opts.innerHTML = ''; fb.className = 'fb'; fb.innerHTML = ''; act.innerHTML = '';
      pop.setAttribute('aria-label', 'Name your find');
      types.forEach(function (t) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = t.label;
        b.addEventListener('click', function () {
          if (f.classList.contains('named')) return;
          if (t.k === f.dataset.type) {
            b.classList.add('correct'); fb.className = 'fb show correct';
            fb.innerHTML = '<strong>' + t.label + noun + '.</strong> ' + (f.dataset.fb || '');
            f.classList.add('named'); named++;
            var li = document.createElement('li');
            li.innerHTML = '<strong>' + (f.dataset.name || 'Find') + '</strong> · ' + t.label + noun + ' · ' + layer;
            log.appendChild(li);
            var next = document.createElement('button'); next.type = 'button'; next.className = 'btn make';
            next.textContent = queue.length ? 'Next find' : (named === finds.length ? 'See my field notebook' : 'Keep digging');
            next.addEventListener('click', function () {
              closePop(); status();
              if (queue.length) ask(queue.shift());
              else if (named === finds.length) { d.classList.add('done'); log.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
              else site.focus({ preventScroll: true });
            });
            act.appendChild(next); next.focus();
          } else {
            b.classList.add('incorrect'); fb.className = 'fb show incorrect';
            fb.textContent = 'Not quite. ' + (f.dataset.hint || 'Ask what this fossil kept: a shape, a copy, an action, or the real thing.');
          }
        });
        opts.appendChild(b);
      });
      pop.classList.add('show');
      var first = opts.querySelector('button'); if (first) first.focus({ preventScroll: true });
      status();
    }
    d.querySelector('.dig-reset').addEventListener('click', build);
    build();
  });
})();

/* ---- science model · grow the plant experiment (v2.1, 2026-10-15; stepper rewrite v2.4, 2026-10-16 after teacher feedback
   "simplify the buttons, students test without directions"): <div class="model" data-model="plantlab" data-label="…"
   data-question="…" data-hypothesis="…" data-levels='["Low light","Medium light","High light"]' data-controls='["Water","Soil","Plant type"]' data-days="10"></div>
   One step on screen at a time, one instruction, one or three big buttons. 1 Predict (taller / shorter / the same with more
   light). 2 Set up: three identical plants, light low, medium, high, fixed. 3 Grow: one button, "Next day", grows a day and
   writes the heights into the table. 4 Conclude: supported or not supported; the verdict says "supported, not proved".
   Then an optional second run, "Try it again, unfairly", where water also changes in pots B and C, with "can't tell" as the
   right conclusion. The plants are a MODEL: they grow by the guide's rule (more light, faster growth); the centimeters are
   the model's own and the page says so. Teaches: the six steps in one run, a fair test, support versus proof. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (text != null) e.textContent = text; return e; }
  document.querySelectorAll('.model[data-model="plantlab"]').forEach(function (root) {
    var levels, controls, days;
    try { levels = JSON.parse(root.dataset.levels); controls = JSON.parse(root.dataset.controls); days = parseInt(root.dataset.days || '10', 10); } catch (e) { return; }
    var RATE = [0.6, 1.2, 1.9], BUMP = [0, 0.5, 1.1], pots = [0, 1, 2];
    var extra = (controls[0] || 'Water').toLowerCase();
    var step = 1, prediction = null, day = 0, rows = [], unfair = false, concluded = null;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Grow it'));
    var q = h('div', 'mq'); q.innerHTML = '<strong>Question:</strong> ' + (root.dataset.question || '');
    var head = h('div', 'pstep'), body = h('div', 'pbody'), scene = h('div', 'mscene'), table = h('table', 'mtable'), verdict = h('div', 'mverdict'), foot = h('div', 'mtop');
    [top, q, head, body, scene, table, verdict, foot].forEach(function (el) { root.appendChild(el); });
    function heights(d) {
      return pots.map(function (lv, i) { var hh = 2 + RATE[lv] * d; if (unfair) hh += BUMP[i] * d * 0.9; return Math.round(hh * 10) / 10; });
    }
    function big(text, cls, fn) { var b = h('button', 'mbig' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', fn); return b; }
    function reset(all) { day = 0; rows = []; concluded = null; if (all) { prediction = null; unfair = false; } step = all ? 1 : 2; render(); }
    function drawScene() {
      scene.innerHTML = '';
      var W = 360, H = 232, hs = heights(day), maxH = 2 + RATE[2] * days + BUMP[2] * days * 0.9, scale = 150 / maxH, base = 190;
      var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Day ' + day + '. ' + hs.map(function (v, i) { return 'Pot ' + 'ABC'[i] + ' ' + v + ' centimeters'; }).join(', ') });
      var rul = s('g', { 'font-family': 'Nunito, Segoe UI, sans-serif', 'font-size': '9', fill: 'var(--ink-soft)' });
      for (var cm = 0; cm <= maxH; cm += 5) { var y = base - cm * scale; rul.appendChild(s('line', { x1: 14, x2: 22, y1: y, y2: y, stroke: 'var(--ink-soft)', 'stroke-width': 1 })); rul.appendChild(s('text', { x: 2, y: y + 3 }, String(cm))); }
      rul.appendChild(s('line', { x1: 22, x2: 22, y1: base, y2: base - maxH * scale, stroke: 'var(--ink-soft)', 'stroke-width': 1.5 }));
      svg.appendChild(rul);
      pots.forEach(function (lv, i) {
        var cx = 85 + i * 110;
        svg.appendChild(s('ellipse', { cx: cx, cy: 22, rx: 44, ry: 12, fill: '#F2C94C', opacity: [0.18, 0.5, 0.95][lv] }));
        svg.appendChild(s('text', { x: cx, y: 26, 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '800', fill: 'var(--ink-soft)', 'font-family': 'Nunito, Segoe UI, sans-serif' }, levels[lv]));
        svg.appendChild(s('path', { d: 'M' + (cx - 26) + ' ' + base + ' L' + (cx - 20) + ' ' + (base + 26) + ' L' + (cx + 20) + ' ' + (base + 26) + ' L' + (cx + 26) + ' ' + base + ' Z', fill: '#C97B4A', stroke: '#8A4E2A', 'stroke-width': 2 }));
        svg.appendChild(s('rect', { x: cx - 29, y: base - 6, width: 58, height: 10, rx: 3, fill: '#D98B58', stroke: '#8A4E2A', 'stroke-width': 2 }));
        var ph = hs[i] * scale, topY = base - 6 - ph;
        svg.appendChild(s('rect', { x: cx - 3, y: topY, width: 6, height: ph, rx: 3, fill: '#2E8B57' }));
        if (ph > 14) { svg.appendChild(s('ellipse', { cx: cx - 11, cy: topY + 10, rx: 10, ry: 4.5, fill: '#3FA76A', transform: 'rotate(-28 ' + (cx - 11) + ' ' + (topY + 10) + ')' })); svg.appendChild(s('ellipse', { cx: cx + 11, cy: topY + 16, rx: 10, ry: 4.5, fill: '#3FA76A', transform: 'rotate(28 ' + (cx + 11) + ' ' + (topY + 16) + ')' })); }
        svg.appendChild(s('text', { x: cx, y: Math.max(topY - 6, 44), 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: 'var(--ink)', 'font-family': 'Nunito, Segoe UI, sans-serif' }, hs[i] + ' cm'));
        svg.appendChild(s('text', { x: cx, y: base + 22, 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '800', fill: '#fff', 'font-family': 'Nunito, Segoe UI, sans-serif' }, 'Pot ' + 'ABC'[i]));
        if (unfair && i > 0) { for (var k = 0; k <= i; k++) svg.appendChild(s('circle', { cx: cx + 34 + k * 9, cy: base - 20, r: 3.5, fill: '#5BA4CF' })); }
      });
      svg.appendChild(s('text', { x: W - 8, y: H - 8, 'text-anchor': 'end', 'font-size': '11', 'font-weight': '800', fill: 'var(--ink-soft)', 'font-family': 'Nunito, Segoe UI, sans-serif' }, 'Day ' + day + ' of ' + days));
      scene.appendChild(svg);
      var cap = h('div', 'mcap', unfair ? 'This time pots B and C also get more ' + extra + ' (the blue drops). Two things are different now.' : 'Three identical plants. Only the light is different.');
      scene.appendChild(cap);
    }
    function drawTable() {
      table.innerHTML = '';
      if (step < 3) { table.style.display = 'none'; return; }
      table.style.display = '';
      var tr = h('tr'); tr.appendChild(h('th', null, 'Day')); pots.forEach(function (lv, i) { tr.appendChild(h('th', null, 'Pot ' + 'ABC'[i] + ' · ' + levels[lv].toLowerCase() + ' (cm)')); }); table.appendChild(tr);
      if (!rows.length) { var r0 = h('tr'); var td = h('td', 'mhint', 'Your data table. Each day you measure goes here.'); td.colSpan = 4; r0.appendChild(td); table.appendChild(r0); }
      rows.forEach(function (r) { var tr2 = h('tr'); tr2.appendChild(h('td', null, String(r.day))); r.h.forEach(function (v) { tr2.appendChild(h('td', 'mnum', String(v))); }); table.appendChild(tr2); });
    }
    function render() {
      head.innerHTML = ''; body.innerHTML = ''; foot.innerHTML = ''; verdict.className = 'mverdict'; verdict.textContent = '';
      var titles = ['', '1 · Predict', '2 · Set up', '3 · Grow and measure', '4 · Conclude'];
      head.appendChild(h('span', 'mtag ' + (step === 3 ? 'iv' : 'dv'), titles[step] + (unfair ? ' · second run' : '')));
      scene.style.display = step === 1 ? 'none' : '';
      if (step === 1) {
        body.appendChild(h('p', 'pask', 'With more light, the plants will grow…'));
        var row = h('div', 'pbtns');
        [['taller', 'Taller'], ['shorter', 'Shorter'], ['same', 'The same']].forEach(function (p) { row.appendChild(big(p[1], prediction === p[0] ? 'on' : '', function () { prediction = p[0]; step = 2; render(); })); });
        body.appendChild(row);
        body.appendChild(h('p', 'mhint', 'Any answer is a hypothesis. Written out: ' + (root.dataset.hypothesis || '')));
      } else if (step === 2) {
        body.appendChild(h('p', 'pask', unfair ? 'Same three plants, same light: A low, B medium, C high. But this time pots B and C also get more ' + extra + '. Two things change.' : 'Three identical plants. Pot A gets low light, Pot B medium, Pot C high. Everything else stays the same.'));
        var row2 = h('div', 'pbtns'); row2.appendChild(big('Start growing', 'go', function () { step = 3; render(); })); body.appendChild(row2);
      } else if (step === 3) {
        body.appendChild(h('p', 'pask', day === 0 ? 'Tap Next day. Each tap grows the plants one day and measures them.' : (rows.length < 3 ? 'Keep going. Scientists measure more than once.' : 'Enough data when you are ready, or keep growing to day ' + days + '.')));
        var row3 = h('div', 'pbtns');
        if (day < days) row3.appendChild(big('Next day', 'go', function () { day++; rows.push({ day: day, h: heights(day) }); if (day >= days) step = 4; render(); }));
        if (rows.length >= 3 && day < days) row3.appendChild(big('I have enough data', '', function () { step = 4; render(); }));
        body.appendChild(row3);
      } else if (step === 4) {
        var last = rows[rows.length - 1], tallest = 'ABC'[last.h.indexOf(Math.max.apply(null, last.h))];
        body.appendChild(h('p', 'pask', 'Day ' + last.day + ': Pot ' + tallest + ' (' + levels[pots['ABC'.indexOf(tallest)]].toLowerCase() + ') is tallest. You predicted ' + (prediction === 'same' ? 'no difference' : prediction + ' plants with more light') + '. Do your results…'));
        var row4 = h('div', 'pbtns');
        var opts = [['supported', 'Support my hypothesis'], ['not', 'Fail to support it']];
        if (unfair) opts.push(['cant', 'Can’t tell: two things changed']);
        opts.forEach(function (p) { row4.appendChild(big(p[1], concluded === p[0] ? 'on' : '', function () { concluded = p[0]; render(); })); });
        body.appendChild(row4);
        if (concluded) {
          var right = unfair ? 'cant' : (prediction === 'taller' ? 'supported' : 'not');
          var ok = concluded === right;
          verdict.className = 'mverdict ' + (ok ? 'good' : 'bad');
          if (right === 'cant') verdict.textContent = (ok ? 'Yes. ' : 'Not quite. ') + 'Pot C is tallest again, but it also got the most ' + extra + '. Was it the light or the ' + extra + '? With two things changing you cannot tell. That is why a fair test changes one thing at a time.';
          else if (right === 'supported') verdict.textContent = (ok ? 'Yes. ' : 'Look at the table again. ') + 'More light, taller plants: the results support your hypothesis. Supported, not proved. A scientist would repeat the trial and test again.';
          else verdict.textContent = (ok ? 'Yes. ' : 'Look at the table again. ') + 'The results fail to support your prediction. That is not a failed experiment. You learned something new, and the next question is why.';
          if (ok && !unfair) foot.appendChild(big('Try it again, unfairly', '', function () { unfair = true; reset(false); }));
          if (ok) foot.appendChild(big('Start over', 'ghost', function () { reset(true); }));
        }
      }
      drawScene(); drawTable();
    }
    render();
  });
})();

/* ---- science model · build a trip (v2.5, 2026-10-16; replaces graph the race v2.2): <div class="model" data-model="trip"></div>
   One walker on a 40 m sidewalk and a distance-time graph. Four buttons, each two seconds of motion: Walk (2 m/s),
   Run (5 m/s), Stop, Walk back (2 m/s toward the start). Every tap moves the walker and adds one piece of line,
   so one action makes one shape. A log works out each piece as distance ÷ time. A second mode, Match the graph,
   draws a dashed target line; the student taps buttons to copy it and gets a hint on any piece that does not match.
   Practice numbers. Teaches: speed = distance ÷ time; steeper is faster; flat is stopped; a line that goes down is
   motion back toward the start; and, in match mode, reading a graph backward into the motion that made it. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function sv(n, a, txt) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  var FONT = 'Nunito, Segoe UI, sans-serif', DT = 2, TMAX = 20, DMAX = 40, MAXB = TMAX / DT;
  /* key: [button, speed m/s (signed), color, shape words, hint when it was needed but missed] */
  var MOVES = {
    walk: ['Walk', 2, 'var(--learn)', 'a gentle slope', 'This piece climbs gently: some distance, not a lot. Which button covers 4 m in 2 s?'],
    run: ['Run', 5, 'var(--make)', 'a steep slope', 'This piece climbs steeply: a lot of distance in the same 2 s. Which button is fastest?'],
    stop: ['Stop', 0, '#B8860B', 'a flat line', 'This piece is flat: time goes on, distance stays the same. Which button keeps you in place?'],
    back: ['Walk back', -2, 'var(--wonder)', 'a line going down', 'This piece goes down: the distance from the start gets smaller. Which button heads back toward the start?']
  };
  var KEYS = ['walk', 'run', 'stop', 'back'];
  var TARGETS = [['walk', 'walk', 'stop', 'walk'], ['run', 'stop', 'back', 'back'], ['walk', 'run', 'run', 'stop', 'back'], ['stop', 'stop', 'walk', 'run'], ['run', 'run', 'back', 'back', 'back', 'stop']];
  var X0 = 70, XW = 600, GY = 360, GH = 220;
  function gx(t) { return X0 + t / TMAX * XW; }
  function gy(d) { return GY - d / DMAX * GH; }
  function tx(d) { return 60 + d / DMAX * 600; }

  document.querySelectorAll('.model[data-model="trip"]').forEach(function (root) {
    var mode = 'build', blocks = [], ti = 0, busy = false, raf = 0, done = {};
    var top = h('div', 'mtop'), modes = h('div', 'mpicks mmodes'), scene = h('div', 'mscene'), btns = h('div', 'mrow mbtns'), verdict = h('div', 'mverdict good'), log = h('ol', 'mlog');
    root.appendChild(top); root.appendChild(modes); root.appendChild(btns); root.appendChild(scene); root.appendChild(verdict); root.appendChild(log);
    top.appendChild(h('span', 'mlabel', 'Build a trip')); top.appendChild(h('span', 'mhint mtophint', 'Each button is 2 seconds of motion and adds one piece of line.'));
    var mb = h('button', 'mpick on', 'Build a trip'), mm = h('button', 'mpick', 'Match the graph'); mb.type = mm.type = 'button';
    modes.appendChild(mb); modes.appendChild(mm);
    mb.addEventListener('click', function () { setMode('build'); }); mm.addEventListener('click', function () { setMode('match'); });
    /* scene */
    var svg = sv('svg', { viewBox: '0 0 720 410', role: 'img', 'aria-label': 'A 40 meter sidewalk with a walker, and a distance-time graph that adds one piece of line for every move' });
    svg.appendChild(sv('rect', { x: 50, y: 28, width: 620, height: 44, rx: 8, fill: '#E9E4DA' }));
    for (var m = 0; m <= DMAX; m += 5) {
      svg.appendChild(sv('line', { x1: tx(m), y1: 28, x2: tx(m), y2: 72, stroke: m === 0 ? 'var(--ink)' : '#fff', 'stroke-width': m === 0 ? 3 : 1.5 }));
      svg.appendChild(sv('text', { x: tx(m), y: 88, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink-soft)', 'font-family': FONT }, m + ' m'));
    }
    svg.appendChild(sv('text', { x: tx(0), y: 20, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: 'var(--ink)', 'font-family': FONT }, 'START'));
    var walker = sv('g', {}); walker.appendChild(sv('circle', { cx: 0, cy: 0, r: 13, fill: 'var(--ink)', stroke: '#fff', 'stroke-width': 2.5 })); walker.appendChild(sv('text', { x: 0, y: 4.5, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 900, fill: '#fff', 'font-family': FONT }, 'You')); svg.appendChild(walker);
    var clock = sv('text', { x: 670, y: 112, 'text-anchor': 'end', 'font-size': 18, 'font-weight': 900, fill: 'var(--ink)', 'font-family': FONT }, '0 s');
    svg.appendChild(clock);
    svg.appendChild(sv('text', { x: 50, y: 112, 'font-size': 12, 'font-weight': 800, fill: 'var(--ink-soft)', 'font-family': FONT }, 'DISTANCE-TIME GRAPH'));
    for (var s = 0; s <= TMAX; s += 2) {
      svg.appendChild(sv('line', { x1: gx(s), y1: gy(0), x2: gx(s), y2: gy(DMAX), stroke: '#E4DCCB', 'stroke-width': 1 }));
      svg.appendChild(sv('text', { x: gx(s), y: GY + 17, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink-soft)', 'font-family': FONT }, String(s)));
    }
    for (var d = 0; d <= DMAX; d += 10) {
      svg.appendChild(sv('line', { x1: gx(0), y1: gy(d), x2: gx(TMAX), y2: gy(d), stroke: '#E4DCCB', 'stroke-width': 1 }));
      svg.appendChild(sv('text', { x: X0 - 8, y: gy(d) + 4, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink-soft)', 'font-family': FONT }, String(d)));
    }
    svg.appendChild(sv('line', { x1: gx(0), y1: gy(0), x2: gx(TMAX), y2: gy(0), stroke: 'var(--ink)', 'stroke-width': 2 }));
    svg.appendChild(sv('line', { x1: gx(0), y1: gy(0), x2: gx(0), y2: gy(DMAX) - 6, stroke: 'var(--ink)', 'stroke-width': 2 }));
    svg.appendChild(sv('text', { x: gx(TMAX / 2), y: GY + 38, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', 'font-family': FONT }, 'Time (seconds) · x-axis'));
    svg.appendChild(sv('text', { x: 18, y: gy(DMAX / 2), 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', 'font-family': FONT, transform: 'rotate(-90 18 ' + gy(DMAX / 2) + ')' }, 'Distance from start (m) · y-axis'));
    var targetG = sv('g', {}), lineG = sv('g', {}); svg.appendChild(targetG); svg.appendChild(lineG);
    scene.appendChild(svg);
    var cap = h('div', 'mcap', 'Practice numbers. Walk = 2 m/s, Run = 5 m/s, Walk back = 2 m/s toward the start.'); scene.appendChild(cap);
    /* buttons */
    var mbtn = {};
    KEYS.forEach(function (k) { var b = h('button', 'btn mmove mv-' + k, MOVES[k][0]); b.type = 'button'; b.addEventListener('click', function () { add(k); }); btns.appendChild(b); mbtn[k] = b; });
    var undo = h('button', 'reset', 'Undo'), clear = h('button', 'reset', 'Start over'), next = h('button', 'btn make mnext', 'Next graph'); undo.type = clear.type = next.type = 'button';
    btns.appendChild(undo); btns.appendChild(clear); btns.appendChild(next);
    undo.addEventListener('click', function () { if (busy || !blocks.length) return; blocks.pop(); redraw(); say(); });
    clear.addEventListener('click', function () { if (busy) return; blocks = []; redraw(); say(); });
    next.addEventListener('click', function () { if (busy) return; ti = (ti + 1) % TARGETS.length; blocks = []; drawTarget(); redraw(); say(); });

    function posAt(list, n) { var p = 0; for (var i = 0; i < n; i++) p += MOVES[list[i]][1] * DT; return p; }
    function seg(k, i, d0, frac, cls) {
      var d1 = d0 + MOVES[k][1] * DT * frac;
      return sv('line', { x1: gx(i * DT), y1: gy(d0), x2: gx((i + frac) * DT), y2: gy(d1), stroke: cls === 'target' ? '#9AA3B2' : MOVES[k][2], 'stroke-width': cls === 'target' ? 10 : 5, 'stroke-linecap': 'round', 'stroke-dasharray': cls === 'target' ? '2 12' : '', opacity: cls === 'target' ? .7 : 1 });
    }
    function drawTarget() {
      while (targetG.firstChild) targetG.removeChild(targetG.firstChild);
      if (mode !== 'match') return;
      var t = TARGETS[ti]; t.forEach(function (k, i) { targetG.appendChild(seg(k, i, posAt(t, i), 1, 'target')); });
    }
    function redraw() {
      while (lineG.firstChild) lineG.removeChild(lineG.firstChild);
      blocks.forEach(function (k, i) { lineG.appendChild(seg(k, i, posAt(blocks, i), 1)); });
      var p = posAt(blocks, blocks.length); walker.setAttribute('transform', 'translate(' + tx(p).toFixed(1) + ' 50)');
      clock.textContent = (blocks.length * DT) + ' s';
      while (log.firstChild) log.removeChild(log.firstChild);
      blocks.forEach(function (k, i) {
        var v = MOVES[k][1], dist = Math.abs(v * DT);
        var li = h('li', null); li.appendChild(h('strong', 'mlk mv-' + k, MOVES[k][0]));
        li.appendChild(document.createTextNode(' · ' + (i * DT) + ' to ' + ((i + 1) * DT) + ' s · ' + (v === 0 ? '0 m in 2 s = 0 m/s, ' : dist + ' m ' + (v < 0 ? 'back ' : '') + 'in 2 s = ' + dist + ' ÷ 2 = ' + Math.abs(v) + ' m/s, ') + MOVES[k][3]));
        log.appendChild(li);
      });
      KEYS.forEach(function (k) { mbtn[k].disabled = blocks.length >= MAXB || (k === 'back' && p - 4 < 0) || (k === 'walk' && p + 4 > DMAX) || (k === 'run' && p + 10 > DMAX); });
      undo.disabled = clear.disabled = !blocks.length;
    }
    function say(last) {
      var p = posAt(blocks, blocks.length), n = blocks.length;
      if (mode === 'build') {
        verdict.className = 'mverdict good';
        if (!n) verdict.textContent = 'Tap a button. Before you tap, predict: will the new piece of line go up steeply, up gently, stay flat, or go down?';
        else if (last) { var mv = MOVES[last]; verdict.textContent = mv[0] + ': ' + (mv[1] === 0 ? 'time kept going but the distance stayed at ' + p + ' m, so the piece is flat. Flat means stopped.' : mv[1] < 0 ? 'the distance from the start went down to ' + p + ' m, so the piece goes down.' : Math.abs(mv[1] * DT) + ' m in 2 s makes ' + mv[3] + '.' + (last === 'run' ? ' More distance in the same time: steeper means faster.' : '')); }
        else verdict.textContent = 'You are ' + p + ' m from the start after ' + n * DT + ' s.';
        if (n >= MAXB) verdict.textContent += ' The graph is full at 20 s. Start over to build a new trip.';
        else if (KEYS.some(function (k) { return mbtn[k].disabled; }) && n) verdict.textContent += ' (Some buttons are off because the sidewalk ends at 0 m and 40 m.)';
        return;
      }
      var t = TARGETS[ti], wrong = -1;
      for (var i = 0; i < n; i++) if (blocks[i] !== t[i]) { wrong = i; break; }
      if (wrong >= 0) { verdict.className = 'mverdict bad'; verdict.textContent = 'Piece ' + (wrong + 1) + ' does not match the dashed line. ' + MOVES[t[wrong]][4] + ' Tap Undo and try again.'; }
      else if (n === t.length) { done[ti] = 1; verdict.className = 'mverdict good'; verdict.textContent = 'Matched! Your trip: ' + t.map(function (k) { return MOVES[k][0].toLowerCase(); }).join(', ') + '. You read the graph backward into the motion that made it. Graphs matched: ' + Object.keys(done).length + ' of ' + TARGETS.length + '. Tap Next graph.'; }
      else if (n > t.length) { verdict.className = 'mverdict bad'; verdict.textContent = 'The dashed line ended, but your trip kept going. Tap Undo.'; }
      else { verdict.className = 'mverdict good'; verdict.textContent = n ? 'So far so good: ' + n + ' of ' + t.length + ' pieces match. Look at the next dashed piece. Steep, gentle, flat, or down?' : 'Graph ' + (ti + 1) + ' of ' + TARGETS.length + '. Read the dashed line one piece at a time, left to right. Each piece is 2 seconds. Which button makes the first piece?'; }
    }
    function add(k) {
      if (busy || blocks.length >= MAXB) return;
      var i = blocks.length, d0 = posAt(blocks, i), start = null; busy = true;
      function step(now) {
        if (start === null) start = now;
        var f = Math.min(1, (now - start) / 600);
        if (lineG.lastChild && lineG.lastChild.dataset && lineG.lastChild.dataset.live) lineG.removeChild(lineG.lastChild);
        var piece = seg(k, i, d0, f); piece.dataset.live = '1'; lineG.appendChild(piece);
        walker.setAttribute('transform', 'translate(' + tx(d0 + MOVES[k][1] * DT * f).toFixed(1) + ' 50)');
        clock.textContent = (i * DT + f * DT).toFixed(1) + ' s';
        if (f < 1) { raf = requestAnimationFrame(step); return; }
        busy = false; blocks.push(k); redraw(); say(k);
      }
      raf = requestAnimationFrame(step);
    }
    function setMode(md) {
      if (busy) return; mode = md; blocks = [];
      mb.classList.toggle('on', md === 'build'); mm.classList.toggle('on', md === 'match');
      next.hidden = md !== 'match';
      top.querySelector('.mlabel').textContent = md === 'build' ? 'Build a trip' : 'Match the graph';
      drawTarget(); redraw(); say();
    }
    setMode('build');
  });
})();

/* ---- science model · order at The Chemical Café (v2.3, 2026-10-16): <div class="model" data-model="cafe" data-label="…" data-budget="20"
   data-menu='[{"course":"Drink","name":"…","desc":"…","price":1.5,"type":"sol"},…]' data-types='[{"k":"el","label":"Element","sep":"none"},…]'></div>
   A rehearsal of the Chemical Café assignment: the student orders one item per course from the assignment's own menu, watches
   the total against the budget, then classifies each item (type of matter, separated physically or only chemically) and
   checks the whiteboard. Every name, description, price, and classification is the assignment's; the separation rule per
   type is the guide's recap table (element: cannot be separated; compound, salt, acid, base: chemical reaction; mixture,
   solution: physically). Teaches: classify matter from clues, and the assignment's three whiteboard questions. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function money(n) { return '$' + n.toFixed(2); }
  var SEPS = [['physical', 'Physically'], ['chemical', 'Only by a chemical reaction'], ['none', 'Cannot be separated: one kind of atom']];
  document.querySelectorAll('.model[data-model="cafe"]').forEach(function (root) {
    var menu, types, budget;
    try { menu = JSON.parse(root.dataset.menu); types = JSON.parse(root.dataset.types); budget = parseFloat(root.dataset.budget || '20'); } catch (e) { return; }
    var courses = []; menu.forEach(function (m) { if (courses.indexOf(m.course) < 0) courses.push(m.course); });
    var order = {}, answers = {}, checked = false;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'The Chemical Café'));
    var hint = h('span', 'mhint', 'Budget ' + money(budget) + '. One drink, one appetizer, one main course, one dessert.'); top.appendChild(hint);
    var menuEl = h('div', 'cmenu'), receipt = h('div', 'creceipt'), board = h('div', 'cboard'), verdict = h('div', 'mverdict'), actions = h('div', 'mtop');
    var check = h('button', 'btn make', 'Check my whiteboard'); check.type = 'button';
    var reset = h('button', 'reset', 'New order'); reset.type = 'button';
    actions.appendChild(check); actions.appendChild(reset);
    [top, menuEl, receipt, board, verdict, actions].forEach(function (el) { root.appendChild(el); });
    courses.forEach(function (c) {
      var g = h('div', 'ccourse'); g.appendChild(h('div', 'ccourse-name', c));
      var cards = h('div', 'ccards');
      menu.filter(function (m) { return m.course === c; }).forEach(function (m) {
        var b = h('button', 'ccard'); b.type = 'button';
        b.appendChild(h('span', 'cname', m.name)); b.appendChild(h('span', 'cdesc', m.desc)); b.appendChild(h('span', 'cprice', money(m.price)));
        b.addEventListener('click', function () { order[c] = (order[c] === m) ? null : m; delete answers[m.name]; checked = false; render(); });
        m._btn = b; cards.appendChild(b);
      });
      g.appendChild(cards); menuEl.appendChild(g);
    });
    function picked() { return courses.map(function (c) { return order[c]; }).filter(Boolean); }
    function total() { return picked().reduce(function (s, m) { return s + m.price; }, 0); }
    function typeOf(k) { return types.filter(function (t) { return t.k === k; })[0]; }
    function render() {
      menu.forEach(function (m) { m._btn.classList.toggle('on', order[m.course] === m); });
      /* receipt */
      receipt.innerHTML = '';
      var items = picked(), t = total();
      receipt.appendChild(h('div', 'mlabel', 'Your order'));
      if (!items.length) receipt.appendChild(h('div', 'mhint', 'Nothing yet. Tap one item in each course.'));
      items.forEach(function (m) { var r = h('div', 'crow'); r.appendChild(h('span', null, m.course + ': ' + m.name)); r.appendChild(h('span', 'mnum', money(m.price))); receipt.appendChild(r); });
      var tr = h('div', 'crow ctotal' + (t > budget ? ' over' : '')); tr.appendChild(h('span', null, 'Total')); tr.appendChild(h('span', 'mnum', money(t))); receipt.appendChild(tr);
      if (items.length) receipt.appendChild(h('div', 'mhint', t > budget ? 'Over budget by ' + money(t - budget) + '. Swap something cheaper.' : (items.length === courses.length ? 'At or under ' + money(budget) + '. Now classify each item below.' : (courses.length - items.length) + ' course' + (courses.length - items.length === 1 ? '' : 's') + ' still to pick.')));
      /* whiteboard */
      board.innerHTML = '';
      if (items.length === courses.length) {
        board.appendChild(h('div', 'mlabel', 'Your whiteboard · for each item: what type of matter, and how could it be separated?'));
        items.forEach(function (m) {
          var a = answers[m.name] = answers[m.name] || {};
          var row = h('div', 'cq'); row.appendChild(h('div', 'cqname', m.name)); row.appendChild(h('div', 'mhint', 'Clue from the menu: ' + m.desc));
          var tp = h('div', 'mpicks');
          types.forEach(function (ty) { var b = h('button', 'mpick' + (a.type === ty.k ? ' on' : ''), ty.label); b.type = 'button'; b.addEventListener('click', function () { a.type = ty.k; checked = false; render(); }); tp.appendChild(b); });
          var sp = h('div', 'mpicks');
          SEPS.forEach(function (s) { var b = h('button', 'mpick csep' + (a.sep === s[0] ? ' on' : ''), s[1]); b.type = 'button'; b.addEventListener('click', function () { a.sep = s[0]; checked = false; render(); }); sp.appendChild(b); });
          row.appendChild(tp); row.appendChild(sp);
          if (checked) {
            var ty = typeOf(m.type), okT = a.type === m.type, okS = a.sep && (a.sep === ty.sep || (ty.alt && ty.alt.indexOf(a.sep) >= 0));
            var fb = h('div', 'cfb ' + (okT && okS ? 'good' : 'bad'));
            fb.innerHTML = (okT ? '<strong>Type: yes.</strong> ' : '<strong>Type: the menu says ' + ty.label + '.</strong> ') + (okS ? '<strong>Separation: yes.</strong> ' : '<strong>Separation: ' + SEPS.filter(function (s) { return s[0] === ty.sep; })[0][1].toLowerCase() + '.</strong> ') + ty.why;
            row.appendChild(fb);
          }
          board.appendChild(row);
        });
      }
      /* verdict */
      if (!checked) { verdict.className = 'mverdict'; verdict.textContent = items.length === courses.length ? (t > budget ? 'Fix the budget first: the assignment asks you to stay at or under ' + money(budget) + '.' : 'Answer both questions for all four items, then tap Check my whiteboard.') : 'Step 1: order one item from each course and watch the total.'; return; }
      var right = items.filter(function (m) { var a = answers[m.name] || {}, ty = typeOf(m.type); return a.type === m.type && (a.sep === ty.sep || (ty.alt && ty.alt.indexOf(a.sep) >= 0)); }).length;
      verdict.className = 'mverdict ' + (right === items.length && t <= budget ? 'good' : 'bad');
      verdict.textContent = (right === items.length ? 'Whiteboard complete. ' : right + ' of ' + items.length + ' items fully right. Read the clues again and fix the rest. ') + 'Total ' + money(t) + (t <= budget ? ', under budget. ' : ', over budget. ') + (right === items.length && t <= budget ? 'That is the photo the assignment asks for: your meal, your total, and every item classified with its clue.' : '');
    }
    check.addEventListener('click', function () {
      var items = picked(); if (items.length < courses.length) { render(); return; }
      var missing = items.some(function (m) { var a = answers[m.name] || {}; return !a.type || !a.sep; });
      if (missing) { verdict.className = 'mverdict bad'; verdict.textContent = 'Every item needs both answers: a type of matter and how it could be separated.'; return; }
      checked = true; render();
    });
    reset.addEventListener('click', function () { order = {}; answers = {}; checked = false; render(); });
    render();
  });
})();

/* ---- science model · litmus bench (v2.3, 2026-10-16): <div class="model" data-model="litmus" data-label="…"
   data-samples='[{"name":"Lemon juice","kind":"acid","note":"citric acid"},…]'></div>
   The student picks a sample and a litmus paper (blue or red), dips it, and reads the result: blue litmus turns red in an
   acid; red litmus turns blue in a base; otherwise the paper keeps its color (the guide's two indicator facts). An evidence
   log fills; the student then labels the sample acid or base and the verdict checks the label against the evidence, not
   against memory. A second bench mixes the guide's HCl + NaOH: H⁺ and OH⁻ pair into water and Na⁺ and Cl⁻ are left as
   salt. Teaches: indicators give evidence; neutralization makes salt and water. Everything shown is in the guide. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (text != null) e.textContent = text; return e; }
  var BLUE = '#3B6FD6', RED = '#D6453B';
  document.querySelectorAll('.model[data-model="litmus"]').forEach(function (root) {
    var samples;
    try { samples = JSON.parse(root.dataset.samples); } catch (e) { return; }
    var cur = 0, paper = 'blue', dipped = null, log = [], labels = {}, mixed = false, product = null;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Litmus bench'));
    var picks = h('div', 'mpicks'); top.appendChild(picks);
    var bench = h('div', 'lbench'), controls = h('div', 'mrow'), table = h('table', 'mtable'), labelRow = h('div', 'mrow'), verdict = h('div', 'mverdict');
    var neut = h('div', 'mvars'), nverdict = h('div', 'mverdict');
    [top, bench, controls, table, labelRow, verdict, neut, nverdict].forEach(function (el) { root.appendChild(el); });
    samples.forEach(function (sm, i) {
      var b = h('button', 'mpick' + (i === 0 ? ' on' : ''), sm.name); b.type = 'button';
      b.addEventListener('click', function () { cur = i; dipped = null; picks.querySelectorAll('.mpick').forEach(function (x, j) { x.classList.toggle('on', j === i); }); render(); });
      picks.appendChild(b);
    });
    controls.appendChild(h('span', 'mtag iv', 'Paper'));
    var pp = h('span', 'mpicks');
    [['blue', 'Blue litmus'], ['red', 'Red litmus']].forEach(function (p) { var b = h('button', 'mpick' + (p[0] === paper ? ' on' : ''), p[1]); b.type = 'button'; b.addEventListener('click', function () { paper = p[0]; dipped = null; pp.querySelectorAll('.mpick').forEach(function (x) { x.classList.toggle('on', x === b); }); render(); }); pp.appendChild(b); });
    controls.appendChild(pp);
    var dip = h('button', 'btn make', 'Dip the paper'); dip.type = 'button'; controls.appendChild(dip);
    var clear = h('button', 'reset', 'Clear the log'); clear.type = 'button'; controls.appendChild(clear);
    function result(kind, p) { if (kind === 'acid' && p === 'blue') return 'red'; if (kind === 'base' && p === 'red') return 'blue'; return p; }
    dip.addEventListener('click', function () {
      var sm = samples[cur], r = result(sm.kind, paper); dipped = r;
      if (!log.some(function (l) { return l.name === sm.name && l.paper === paper; })) log.push({ name: sm.name, paper: paper, result: r });
      render();
    });
    clear.addEventListener('click', function () { log = []; labels = {}; dipped = null; render(); });
    labelRow.appendChild(h('span', 'mtag dv', 'Your label'));
    var lp = h('span', 'mpicks');
    [['acid', 'Acid'], ['base', 'Base']].forEach(function (p) { var b = h('button', 'mpick', p[1]); b.type = 'button'; b.addEventListener('click', function () { labels[samples[cur].name] = p[0]; render(); }); lp.appendChild(b); });
    labelRow.appendChild(lp);
    function drawBench() {
      bench.innerHTML = '';
      var sm = samples[cur];
      var svg = s('svg', { viewBox: '0 0 320 150', role: 'img', 'aria-label': (dipped ? paper + ' litmus paper dipped in ' + sm.name + ' is now ' + dipped : paper + ' litmus paper above a beaker of ' + sm.name) });
      svg.appendChild(s('path', { d: 'M110 40 L110 128 Q110 138 120 138 L200 138 Q210 138 210 128 L210 40', fill: '#EEF4F7', stroke: 'var(--ink-soft)', 'stroke-width': 2.5 }));
      svg.appendChild(s('rect', { x: 113, y: 80, width: 94, height: 55, rx: 6, fill: sm.kind === 'acid' ? '#FBE9A6' : '#DCEBF7', opacity: .9 }));
      svg.appendChild(s('text', { x: 160, y: 24, 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: 'var(--ink)', 'font-family': 'Nunito, Segoe UI, sans-serif' }, sm.name + (sm.note ? ' · ' + sm.note : '')));
      var col = dipped ? (dipped === 'red' ? RED : BLUE) : (paper === 'red' ? RED : BLUE), y = dipped ? 70 : 34;
      svg.appendChild(s('rect', { x: 150, y: y, width: 20, height: 56, rx: 3, fill: '#F7F3EA', stroke: 'var(--ink-soft)', 'stroke-width': 1.5 }));
      svg.appendChild(s('rect', { x: 150, y: y + 26, width: 20, height: 30, rx: 3, fill: col }));
      svg.appendChild(s('text', { x: 250, y: 100, 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: col, 'font-family': 'Nunito, Segoe UI, sans-serif' }, dipped ? ('Paper: ' + dipped) : ''));
      svg.appendChild(s('text', { x: 250, y: 116, 'text-anchor': 'middle', 'font-size': '10', fill: 'var(--ink-soft)', 'font-family': 'Nunito, Segoe UI, sans-serif' }, dipped ? (dipped === paper ? 'no change' : 'changed') : 'tap Dip the paper'));
      bench.appendChild(svg);
    }
    function render() {
      drawBench();
      table.innerHTML = '';
      var tr = h('tr'); ['Sample', 'Paper', 'Result', 'Your label'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      if (!log.length) { var r0 = h('tr'); var td = h('td', 'mhint', 'Evidence log is empty. Dip a paper into a sample.'); td.colSpan = 4; r0.appendChild(td); table.appendChild(r0); }
      log.forEach(function (l) { var r = h('tr'); r.appendChild(h('td', null, l.name)); r.appendChild(h('td', null, l.paper + ' litmus')); var c = h('td', 'mnum', l.result === l.paper ? 'stayed ' + l.result : 'turned ' + l.result); c.style.color = l.result === 'red' ? RED : BLUE; r.appendChild(c); r.appendChild(h('td', null, labels[l.name] ? labels[l.name] : '')); table.appendChild(r); });
      lp.querySelectorAll('.mpick').forEach(function (b) { b.classList.toggle('on', labels[samples[cur].name] === b.textContent.toLowerCase()); });
      var sm = samples[cur], tested = log.filter(function (l) { return l.name === sm.name; }), lab = labels[sm.name];
      var changed = tested.filter(function (l) { return l.result !== l.paper; });
      if (!tested.length) { verdict.className = 'mverdict'; verdict.textContent = 'No evidence yet for ' + sm.name + '. An indicator changes color depending on pH. Dip, then read the paper.'; }
      else if (!lab) { verdict.className = 'mverdict'; verdict.textContent = changed.length ? 'The ' + changed[0].paper + ' paper changed. Your guide says which kind of substance does that. Label it.' : 'The paper kept its color. That rules one answer out. Try the other paper for a change you can read, then label it.'; }
      else {
        var ok = lab === sm.kind;
        verdict.className = 'mverdict ' + (ok ? 'good' : 'bad');
        verdict.textContent = (ok ? 'Yes. ' : 'Check the paper again. ') + sm.name + ': ' + (sm.kind === 'acid' ? 'blue litmus turns red in an acid' : 'red litmus turns blue in a base') + (changed.length ? ', and that is what your log shows.' : '. Dip the other paper and your log will show it.') + (ok && Object.keys(labels).length >= samples.length ? ' All ' + samples.length + ' samples labeled from evidence.' : '');
      }
      drawNeut();
    }
    /* neutralization bench */
    var nrow = h('div', 'mrow'); nrow.appendChild(h('span', 'mtag cv', 'Neutralize')); nrow.appendChild(h('span', null, 'Your guide’s reaction: hydrochloric acid + sodium hydroxide'));
    var mix = h('button', 'btn make', 'Mix them'); mix.type = 'button'; nrow.appendChild(mix);
    var again = h('button', 'reset', 'Separate again'); again.type = 'button'; nrow.appendChild(again);
    var nscene = h('div', 'lbench'), nq = h('div', 'mrow');
    neut.appendChild(nrow); neut.appendChild(nscene); neut.appendChild(nq);
    nq.appendChild(h('span', 'mtag dv', 'Products'));
    var np = h('span', 'mpicks');
    [['saltwater', 'a salt and water'], ['acid', 'a stronger acid'], ['base', 'a stronger base']].forEach(function (p) { var b = h('button', 'mpick', p[1]); b.type = 'button'; b.addEventListener('click', function () { product = p[0]; np.querySelectorAll('.mpick').forEach(function (x) { x.classList.toggle('on', x === b); }); drawNeut(); }); np.appendChild(b); });
    nq.appendChild(np);
    mix.addEventListener('click', function () { mixed = true; drawNeut(); });
    again.addEventListener('click', function () { mixed = false; product = null; np.querySelectorAll('.mpick').forEach(function (x) { x.classList.remove('on'); }); drawNeut(); });
    function ion(svg, x, y, txt, col) { svg.appendChild(s('circle', { cx: x, cy: y, r: 13, fill: col, stroke: '#fff', 'stroke-width': 2 })); svg.appendChild(s('text', { x: x, y: y + 4, 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '800', fill: '#fff', 'font-family': 'Nunito, Segoe UI, sans-serif' }, txt)); }
    function drawNeut() {
      nscene.innerHTML = '';
      var svg = s('svg', { viewBox: '0 0 360 150', role: 'img', 'aria-label': mixed ? 'One beaker: water molecules and sodium chloride' : 'Two beakers: hydrochloric acid with H plus and Cl minus ions, sodium hydroxide with Na plus and OH minus ions' });
      function beaker(x, w, label, fill) { svg.appendChild(s('path', { d: 'M' + x + ' 46 L' + x + ' 126 Q' + x + ' 136 ' + (x + 10) + ' 136 L' + (x + w - 10) + ' 136 Q' + (x + w) + ' 136 ' + (x + w) + ' 126 L' + (x + w) + ' 46', fill: '#EEF4F7', stroke: 'var(--ink-soft)', 'stroke-width': 2.5 })); svg.appendChild(s('rect', { x: x + 3, y: 76, width: w - 6, height: 57, rx: 6, fill: fill, opacity: .9 })); svg.appendChild(s('text', { x: x + w / 2, y: 30, 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: 'var(--ink)', 'font-family': 'Nunito, Segoe UI, sans-serif' }, label)); }
      if (!mixed) {
        beaker(30, 130, 'HCl · acid', '#FBE9A6'); beaker(200, 130, 'NaOH · base', '#DCEBF7');
        ion(svg, 70, 100, 'H⁺', RED); ion(svg, 120, 108, 'Cl⁻', '#7A8699'); ion(svg, 240, 104, 'Na⁺', '#7A8699'); ion(svg, 290, 98, 'OH⁻', BLUE);
      } else {
        beaker(95, 170, 'NaCl + H₂O · salt and water', '#E6F2F6');
        ion(svg, 140, 100, 'H₂O', '#4C9BB0'); ion(svg, 180, 112, 'H₂O', '#4C9BB0'); ion(svg, 225, 100, 'Na⁺Cl⁻', '#7A8699');
      }
      nscene.appendChild(svg);
      var cap = h('div', 'mcap'); cap.innerHTML = mixed ? 'The acid’s <strong>H⁺</strong> and the base’s <strong>OH⁻</strong> combined to form <strong>water</strong>. What is left behind is a <strong>salt</strong>: HCl + NaOH → NaCl + H₂O.' : 'In water the acid gives <strong>hydrogen ions (H⁺)</strong> and the base gives <strong>hydroxide ions (OH⁻)</strong>. Tap Mix them.';
      nscene.appendChild(cap);
      if (!mixed) { nverdict.className = 'mverdict'; nverdict.textContent = 'An acid and a base together: your guide calls what happens next a neutralization reaction.'; }
      else if (!product) { nverdict.className = 'mverdict'; nverdict.textContent = 'Read the beaker, then pick the products.'; }
      else { var ok = product === 'saltwater'; nverdict.className = 'mverdict ' + (ok ? 'good' : 'bad'); nverdict.textContent = ok ? 'Yes. Neutralization makes a salt and water. Sodium chloride is the table salt on your pretzels; the same reaction, not the same beaker.' : 'Look at the beaker again. The H⁺ and OH⁻ are gone into water, so the result is neither a stronger acid nor a stronger base.'; }
    }
    render();
  });
})();

/* ---- science model · separation lab (v2.6, 2026-10-15): <div class="model" data-model="separate" data-label="…" data-live="https://…/sci8/q2w05/"
   data-methods='[{"k":"sort","name":"Sort by hand"},…]'
   data-materials='[{"name":"Trail mix","img":"images/…jpg","alt":"…","has":"…","kind":"het","works":{"sort":"…"},"fails":{"filter":"…"},"hint":"…"},…]'
   data-kinds='[{"k":"het","label":"Heterogeneous mixture","why":"…"},…]'></div>
   The student picks a material (a real photo), picks a method, and reads what happens. A method listed in "works" separates
   it (the page's own result line); one in "fails" cannot (the page's reason); "chem" on a mixture is "not needed"; any other
   method gets the material's hint, which claims nothing. After a separation works, the student says whether it was physical
   or chemical and what the material is, and a log fills. Teaches: mixtures come apart by physical means, compounds only by a
   chemical reaction. Every line shown comes from the page's data attributes. Images load from data-live first, then the
   relative path. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  document.querySelectorAll('.model[data-model="separate"]').forEach(function (root) {
    var mats, methods, kinds;
    try { mats = JSON.parse(root.dataset.materials); methods = JSON.parse(root.dataset.methods); kinds = JSON.parse(root.dataset.kinds); } catch (e) { return; }
    var live = root.dataset.live || '', notNeeded = root.dataset.notneeded || 'Not needed.';
    var cur = 0, tried = null, state = mats.map(function () { return { method: null, how: null, kind: null }; });
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Separation lab'));
    var mrow = h('div', 'mrow'), photo = h('figure', 'sphoto'), meth = h('div', 'mrow'), out = h('div', 'mverdict'), ask = h('div', 'mvars'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, mrow, photo, meth, out, ask, table, done].forEach(function (el) { root.appendChild(el); });
    mrow.appendChild(h('span', 'mtag iv', 'Material'));
    var mp = h('span', 'mpicks'); mrow.appendChild(mp);
    mats.forEach(function (m, i) {
      var b = h('button', 'mpick', m.name); b.type = 'button';
      b.addEventListener('click', function () { cur = i; tried = null; render(); });
      mp.appendChild(b);
    });
    var img = h('img'), cap = h('figcaption');
    img.addEventListener('error', function () { if (img.dataset.rel && img.getAttribute('src') !== img.dataset.rel) img.src = img.dataset.rel; });
    photo.appendChild(img); photo.appendChild(cap);
    meth.appendChild(h('span', 'mtag dv', 'Method'));
    var tp = h('span', 'mpicks'); meth.appendChild(tp);
    methods.forEach(function (mt) {
      var b = h('button', 'mpick', mt.name); b.type = 'button'; b.dataset.k = mt.k;
      b.addEventListener('click', function () { tried = mt.k; var s = state[cur]; if (mats[cur].works[mt.k] && !s.method) s.method = mt.k; render(); });
      tp.appendChild(b);
    });
    var reset = h('button', 'reset', 'Start over'); reset.type = 'button';
    reset.addEventListener('click', function () { state = mats.map(function () { return { method: null, how: null, kind: null }; }); tried = null; cur = 0; render(); });
    function nameOf(k) { var m = methods.filter(function (x) { return x.k === k; })[0]; return m ? m.name : k; }
    function kindOf(k) { return kinds.filter(function (x) { return x.k === k; })[0] || {}; }
    function question(label, opts, key, right, okText, noText) {
      var row = h('div', 'mrow'); row.appendChild(h('span', 'mtag cv', label));
      var ps = h('span', 'mpicks'); row.appendChild(ps);
      var s = state[cur];
      opts.forEach(function (o) {
        var b = h('button', 'mpick' + (s[key] === o[0] ? ' on' : ''), o[1]); b.type = 'button';
        b.addEventListener('click', function () { s[key] = o[0]; render(); });
        ps.appendChild(b);
      });
      ask.appendChild(row);
      if (s[key]) { var v = h('div', 'mverdict ' + (s[key] === right ? 'good' : 'bad')); v.textContent = s[key] === right ? okText : noText; ask.appendChild(v); }
    }
    function render() {
      var m = mats[cur], s = state[cur];
      mp.querySelectorAll('.mpick').forEach(function (b, i) { b.classList.toggle('on', i === cur); b.classList.toggle('sdone', !!(state[i].how && state[i].kind)); });
      img.dataset.rel = m.img; img.src = live ? live + m.img : m.img; img.alt = m.alt;
      cap.textContent = m.has;
      tp.querySelectorAll('.mpick').forEach(function (b) { b.classList.toggle('on', b.dataset.k === tried); });
      if (!tried) { out.className = 'mverdict'; out.textContent = s.method ? 'You already separated this one with ' + nameOf(s.method).toLowerCase() + '. Try another method, or answer below.' : 'Pick a method and try it on ' + m.name.toLowerCase() + '.'; }
      else if (m.works[tried]) { out.className = 'mverdict good'; out.textContent = 'It works. ' + m.works[tried]; }
      else if (m.fails && m.fails[tried]) { out.className = 'mverdict bad'; out.textContent = 'It won’t work. ' + m.fails[tried]; }
      else if (tried === 'chem') { out.className = 'mverdict bad'; out.textContent = notNeeded; }
      else { out.className = 'mverdict'; out.textContent = m.hint; }
      ask.innerHTML = '';
      if (s.method) {
        var chem = s.method === 'chem';
        question('Physical or chemical?', [['physical', 'A physical separation'], ['chemical', 'A chemical reaction']], 'how', chem ? 'chemical' : 'physical',
          chem ? 'Yes. It took a chemical reaction to break the bonds.' : 'Yes. ' + nameOf(s.method) + ' is a physical means: each part keeps its own identity.',
          chem ? 'Look at the method again. Breaking bonds is not a physical means.' : 'Look at the method again. Nothing new was made, and each part kept its identity.');
        if (s.how) {
          var k = kindOf(m.kind);
          question('So it is a…', kinds.map(function (x) { return [x.k, x.label]; }), 'kind', m.kind, 'Yes. ' + (k.why || ''), 'Check the evidence: ' + (chem ? 'only a chemical reaction separated it.' : 'a physical means separated it, and ' + (m.kind === 'sol' ? 'it looks the same throughout.' : 'you can see its parts.')));
        }
      }
      table.innerHTML = '';
      var tr = h('tr'); ['Material', 'What worked', 'Physical or chemical', 'It is a…'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      mats.forEach(function (mm, i) {
        var st = state[i], r = h('tr');
        r.appendChild(h('td', null, mm.name));
        r.appendChild(h('td', null, st.method ? nameOf(st.method) : '…'));
        r.appendChild(h('td', null, st.how ? (st.how === 'chemical' ? 'Chemical' : 'Physical') : '…'));
        r.appendChild(h('td', null, st.kind ? kindOf(st.kind).label : '…'));
        table.appendChild(r);
      });
      var all = mats.every(function (mm, i) { return state[i].how === (state[i].method === 'chem' ? 'chemical' : 'physical') && state[i].kind === mm.kind; });
      done.className = 'mverdict' + (all ? ' good' : '');
      done.textContent = all ? (root.dataset.done || 'All separated.') : 'Separated and explained: ' + mats.filter(function (mm, i) { return state[i].how && state[i].kind === mm.kind; }).length + ' of ' + mats.length + '. Pick another material.';
      done.appendChild(document.createTextNode(' ')); done.appendChild(reset);
    }
    render();
  });
})();

/* ---- science model · mass meter (v2.8, 2026-10-19): <div class="model" data-model="massmeter" data-label="…" data-live="https://…/sci8/q2w06/"
   data-cases='[{"name":"…","img":"images/…","alt":"…","kind":"physical"|"chemical","closed":true|false,"before":"…","after":"…","why":"…","gas":"…"},…]'
   data-note="…" data-done="…"></div>
   The student picks one of the page's cases (a real photo), predicts the mass after the change (the same, less, or more),
   says physical or chemical, and runs it. Two bars show the scale before and after; in an open case a dashed third piece
   shows the gas that left the container, so the total matter is the same length as before. Bar lengths are the model's
   (no numbers, no units): the page says so. Verdicts check the prediction and the label against the case's own data.
   Teaches: mass is conserved in physical and chemical changes; an open system only appears to lose mass. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  document.querySelectorAll('.model[data-model="massmeter"]').forEach(function (root) {
    var cases;
    try { cases = JSON.parse(root.dataset.cases); } catch (e) { return; }
    var live = root.dataset.live || '';
    var cur = 0, st = cases.map(function () { return { pred: null, kind: null, ran: false }; });
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Mass meter'));
    var crow = h('div', 'mrow'), photo = h('figure', 'sphoto'), qs = h('div', 'mvars'), runrow = h('div', 'mrow'), meter = h('div', 'mmeter'), out = h('div', 'mverdict'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, crow, photo, qs, runrow, meter, out, table, done].forEach(function (el) { root.appendChild(el); });
    crow.appendChild(h('span', 'mtag iv', 'Change'));
    var cp = h('span', 'mpicks'); crow.appendChild(cp);
    cases.forEach(function (c, i) { var b = h('button', 'mpick', c.name); b.type = 'button'; b.addEventListener('click', function () { cur = i; render(); }); cp.appendChild(b); });
    var img = h('img'), cap = h('figcaption');
    img.addEventListener('error', function () { if (img.dataset.rel && img.getAttribute('src') !== img.dataset.rel) img.src = img.dataset.rel; });
    photo.appendChild(img); photo.appendChild(cap);
    var run = h('button', 'btn make', 'Run the change'); run.type = 'button';
    var again = h('button', 'reset', 'Reset this one'); again.type = 'button';
    runrow.appendChild(run); runrow.appendChild(again);
    run.addEventListener('click', function () { if (st[cur].pred) { st[cur].ran = true; render(); } else { out.className = 'mverdict'; out.textContent = 'Predict first: after the change, will the scale read the same, less, or more?'; } });
    again.addEventListener('click', function () { st[cur] = { pred: null, kind: null, ran: false }; render(); });
    function ask(label, opts, key) {
      var row = h('div', 'mrow'); row.appendChild(h('span', 'mtag cv', label));
      var ps = h('span', 'mpicks'); row.appendChild(ps);
      opts.forEach(function (o) {
        var b = h('button', 'mpick' + (st[cur][key] === o[0] ? ' on' : ''), o[1]); b.type = 'button';
        b.addEventListener('click', function () { if (key === 'pred' && st[cur].ran) return; st[cur][key] = o[0]; render(); });
        ps.appendChild(b);
      });
      qs.appendChild(row);
    }
    function bar(label, frac, cls, ghost) {
      var row = h('div', 'mbarrow'); row.appendChild(h('span', 'mbarlabel', label));
      var track = h('span', 'mbartrack'), fill = h('span', 'mbar ' + cls); fill.style.width = (frac * 100) + '%'; track.appendChild(fill);
      if (ghost) { var g = h('span', 'mbar ghost'); g.style.width = (ghost * 100) + '%'; g.title = 'gas that left the container'; track.appendChild(g); }
      row.appendChild(track); return row;
    }
    function render() {
      var c = cases[cur], s = st[cur];
      cp.querySelectorAll('.mpick').forEach(function (b, i) { b.classList.toggle('on', i === cur); b.classList.toggle('sdone', st[i].ran && st[i].kind === cases[i].kind); });
      img.dataset.rel = c.img; img.src = live ? live + c.img : c.img; img.alt = c.alt; cap.textContent = (c.where ? c.where + ' · ' : '') + 'Before: ' + c.before;
      qs.innerHTML = '';
      ask('Predict', [['same', 'The scale reads the same'], ['less', 'The scale reads less'], ['more', 'The scale reads more']], 'pred');
      ask('Kind of change', [['physical', 'Physical change'], ['chemical', 'Chemical change']], 'kind');
      meter.innerHTML = '';
      meter.appendChild(bar('Before', .9, 'before'));
      if (s.ran) meter.appendChild(bar('After, on the scale', c.closed ? .9 : .72, 'after', c.closed ? 0 : .18));
      else meter.appendChild(bar('After', 0, 'after'));
      if (s.ran && !c.closed) meter.appendChild(h('div', 'mhint', 'Dashed piece: ' + (c.gas || 'gas that escaped into the air') + '. Not on the scale, but still matter.'));
      if (!s.ran) { out.className = 'mverdict'; out.textContent = s.pred ? 'Now tap Run the change.' : 'Predict first, then run the change.'; }
      else {
        var reads = c.closed ? 'same' : 'less', ok = s.pred === reads;
        out.className = 'mverdict ' + (ok ? 'good' : 'bad');
        out.textContent = (ok ? 'Your prediction matches. ' : 'Not what you predicted. ') + 'After: ' + c.after + ' ' + c.why;
      }
      if (s.kind) {
        var kv = h('div', 'mverdict ' + (s.kind === c.kind ? 'good' : 'bad'));
        kv.textContent = s.kind === c.kind ? 'Yes: a ' + c.kind + ' change.' : 'Look again: is a new substance formed? That decides physical or chemical.';
        qs.appendChild(kv);
      }
      table.innerHTML = '';
      var tr = h('tr'); ['Change', 'System', 'Your prediction', 'Scale after', 'Kind'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      var P = { same: 'the same', less: 'less', more: 'more' };
      cases.forEach(function (cc, i) {
        var x = st[i], r = h('tr');
        r.appendChild(h('td', null, cc.name)); r.appendChild(h('td', null, cc.closed ? 'nothing escapes' : 'open: gas can leave'));
        r.appendChild(h('td', null, x.pred ? P[x.pred] : '…')); r.appendChild(h('td', null, x.ran ? (cc.closed ? 'the same' : 'less (gas left)') : '…'));
        r.appendChild(h('td', null, x.kind ? x.kind : '…')); table.appendChild(r);
      });
      var all = cases.every(function (cc, i) { return st[i].ran && st[i].kind === cc.kind; });
      done.className = 'mverdict' + (all ? ' good' : '');
      done.textContent = all ? (root.dataset.done || 'All changes run.') : 'Run every change and label it: ' + cases.filter(function (cc, i) { return st[i].ran && st[i].kind === cc.kind; }).length + ' of ' + cases.length + ' done.';
    }
    render();
  });
})();

/* ---- science model · Atom Architect workbench (v2.9, 2026-10-19): <div class="model" data-model="atomarch" data-label="…" data-live="https://…/sci8/q2w06/"
   data-items='[{"k":"buttons","name":"Buttons","img":"images/…jpg"},…]' data-elements='[["H","Hydrogen"],…]' data-shells='[2,8]'></div>
   A rehearsal of the Atom Architect assignment. Step 1: pick three different household items (real photos) for protons,
   neutrons, and electrons. Step 2: for two elements, enter the numbers from the student's own Bohr notes (the bench never
   supplies element data), build the nucleus, and place electrons on the shells; the shells hold up to the page's
   capacities and the bench checks that the placed electrons match the number written down. Step 3: bond the atoms into a
   molecule. Step 4: rearrange into a new molecule. A piece counter tracks every item type at every stage; "add a piece" and
   "remove a piece" are offered on purpose and break the count, which the bench flags. Teaches: the same pieces, rearranged,
   means no matter created or destroyed. Everything shown comes from the page's data and the student's entries. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs) { var e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); return e; }
  var uid = 0;
  document.querySelectorAll('.model[data-model="atomarch"]').forEach(function (root) {
    var items, elements, caps;
    try { items = JSON.parse(root.dataset.items); elements = JSON.parse(root.dataset.elements); caps = JSON.parse(root.dataset.shells || '[2,8]'); } catch (e) { return; }
    var live = root.dataset.live || '', id = 'aa' + (uid++);
    var ROLES = [['p', 'Protons'], ['n', 'Neutrons'], ['e', 'Electrons']];
    var mat = { p: null, n: null, e: null };
    function blank() { return { el: null, p: '', n: '', e: '', shells: caps.map(function () { return 0; }), built: false }; }
    var atoms = [blank(), blank()], cur = 0, stage = 'build', extra = { p: 0, n: 0, e: 0 }, pending = null;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Atom Architect workbench'));
    var steps = h('div', 'aasteps'), p1 = h('div', 'aapanel'), p2 = h('div', 'aapanel'), scene = h('div', 'aascene'), p3 = h('div', 'aapanel'), count = h('table', 'mtable aacount'), out = h('div', 'mverdict');
    [top, steps, p1, p2, scene, p3, count, out].forEach(function (x) { root.appendChild(x); });
    function src(rel) { return live ? live + rel : rel; }
    function itemOf(k) { return items.filter(function (x) { return x.k === k; })[0]; }
    function num(v) { var n = parseInt(v, 10); return isNaN(n) ? null : n; }
    function ready() { return mat.p && mat.n && mat.e && mat.p !== mat.n && mat.p !== mat.e && mat.n !== mat.e; }
    function totals() {
      var t = { p: 0, n: 0, e: 0 };
      atoms.forEach(function (a) { if (a.built) { t.p += num(a.p) || 0; t.n += num(a.n) || 0; t.e += a.shells.reduce(function (x, y) { return x + y; }, 0); } });
      return t;
    }
    var snap = { built: null, molecule: null, rearranged: null };
    /* ---- step 1 · materials ---- */
    function drawMaterials() {
      p1.innerHTML = '';
      p1.appendChild(h('h4', null, 'Step 1 · Choose three different items'));
      ROLES.forEach(function (r) {
        var row = h('div', 'mrow'); row.appendChild(h('span', 'mtag ' + (r[0] === 'p' ? 'iv' : r[0] === 'n' ? 'cv' : 'dv'), r[1]));
        var ps = h('span', 'aaitems');
        items.forEach(function (it) {
          var b = h('button', 'aaitem' + (mat[r[0]] === it.k ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', it.name + ' for ' + r[1].toLowerCase());
          var im = h('img'); im.alt = ''; im.src = src(it.img); im.addEventListener('error', function () { if (im.getAttribute('src') !== it.img) im.src = it.img; });
          b.appendChild(im); b.appendChild(h('span', null, it.name));
          b.addEventListener('click', function () { if (stage !== 'build') return; mat[r[0]] = it.k; render(); });
          ps.appendChild(b);
        });
        row.appendChild(ps); p1.appendChild(row);
      });
      var dup = mat.p && mat.n && mat.e && !ready();
      p1.appendChild(h('p', 'mhint', dup ? 'Each particle needs its own item type: pick three different items.' : 'All protons are the same item type, all neutrons the same, all electrons the same. You use only these items for the whole project.'));
    }
    /* ---- step 2 · build each atom ---- */
    function field(a, key, label) {
      var w = h('label', 'aafield'); w.appendChild(h('span', null, label));
      var inp = h('input'); inp.type = 'number'; inp.min = '0'; inp.max = '12'; inp.value = a[key]; inp.disabled = a.built;
      inp.addEventListener('input', function () { a[key] = inp.value; drawCount(); });
      w.appendChild(inp); return w;
    }
    function drawAtomPanel() {
      p2.innerHTML = '';
      if (!ready()) { p2.appendChild(h('p', 'mhint', 'Pick your three items to start building.')); return; }
      p2.appendChild(h('h4', null, 'Step 2 · Build Atom 1 and Atom 2'));
      var tabs = h('div', 'mpicks');
      atoms.forEach(function (a, i) { var b = h('button', 'mpick' + (i === cur ? ' on' : '') + (a.built ? ' sdone' : ''), 'Atom ' + (i + 1) + (a.el ? ' · ' + a.el[1] : '')); b.type = 'button'; b.addEventListener('click', function () { cur = i; render(); }); tabs.appendChild(b); });
      p2.appendChild(tabs);
      var a = atoms[cur];
      var er = h('div', 'mrow'); er.appendChild(h('span', 'mtag iv', 'Element'));
      var eps = h('span', 'mpicks');
      elements.forEach(function (el) { var b = h('button', 'mpick' + (a.el && a.el[0] === el[0] ? ' on' : ''), el[1] + ' (' + el[0] + ')'); b.type = 'button'; b.disabled = a.built; b.addEventListener('click', function () { a.el = el; render(); }); eps.appendChild(b); });
      er.appendChild(eps); p2.appendChild(er);
      var fr = h('div', 'mrow aafields'); fr.appendChild(h('span', 'mtag cv', 'From your notes'));
      fr.appendChild(field(a, 'p', 'Protons')); fr.appendChild(field(a, 'n', 'Neutrons')); fr.appendChild(field(a, 'e', 'Electrons'));
      p2.appendChild(fr);
      var sr = h('div', 'mrow'); sr.appendChild(h('span', 'mtag dv', 'Place electrons'));
      caps.forEach(function (c, k) {
        var add = h('button', 'aaplus', '+'); add.setAttribute('aria-label', 'Add an electron to shell ' + (k + 1)); add.type = 'button'; add.disabled = a.built;
        add.addEventListener('click', function () { if (a.shells[k] >= c) { say('bad', 'Shell ' + (k + 1) + ' holds up to ' + c + ' electrons. Place the next one on another shell.'); return; } a.shells[k]++; render(); });
        var rem = h('button', 'reset', '−'); rem.type = 'button'; rem.disabled = a.built; rem.setAttribute('aria-label', 'Remove an electron from shell ' + (k + 1));
        rem.addEventListener('click', function () { if (a.shells[k] > 0) { a.shells[k]--; render(); } });
        var grp = h('span', 'aashell'); grp.appendChild(rem); grp.appendChild(h('span', 'aashelln', 'Shell ' + (k + 1) + ': ' + a.shells[k] + ' of up to ' + c)); grp.appendChild(add);
        sr.appendChild(grp);
      });
      p2.appendChild(sr);
      var br = h('div', 'mrow');
      var build = h('button', 'btn make', a.built ? 'Atom ' + (cur + 1) + ' built' : 'Check and build Atom ' + (cur + 1)); build.type = 'button'; build.disabled = a.built;
      build.addEventListener('click', function () {
        var P = num(a.p), N = num(a.n), E = num(a.e), placed = a.shells.reduce(function (x, y) { return x + y; }, 0);
        if (!a.el) return say('bad', 'Choose an element first: Row 1 or Row 2.');
        if (P === null || N === null || E === null) return say('bad', 'Write down all three numbers from your Bohr diagram notes: protons, neutrons, electrons.');
        if (P < 1) return say('bad', 'An atom needs protons in its nucleus. Check your notes: protons = atomic number.');
        if (placed !== E) return say('bad', 'You wrote ' + E + ' electron' + (E === 1 ? '' : 's') + ' but placed ' + placed + '. Electrons on the shells should match what you wrote down.');
        a.built = true; cur = atoms[0].built && !atoms[1].built ? 1 : cur;
        say('good', a.el[1] + ' built: ' + P + ' proton' + (P === 1 ? '' : 's') + ' and ' + N + ' neutron' + (N === 1 ? '' : 's') + ' in the nucleus, ' + E + ' electron' + (E === 1 ? '' : 's') + ' on the shells. Label: ' + a.el[1] + ', ' + a.el[0] + ', atomic number ' + P + ' (protons = atomic number), "Atom ' + (atoms.indexOf(a) + 1) + '".' + (atoms[0].built && atoms[1].built ? ' Both atoms built: this is Photo #1.' : ''));
        if (atoms[0].built && atoms[1].built) snap.built = totals();
        render(true);
      });
      br.appendChild(build);
      if (a.built) { var un = h('button', 'reset', 'Edit this atom'); un.type = 'button'; un.addEventListener('click', function () { if (stage !== 'build') return; a.built = false; snap.built = null; render(); }); br.appendChild(un); }
      p2.appendChild(br);
      p2.appendChild(h('p', 'mhint', 'The bench checks the rules, not your numbers. Check your numbers against your Bohr diagram notes from class.'));
    }
    /* ---- scene ---- */
    function tokens(g, list, x, y, r, k) {
      list.forEach(function (pt) {
        var it = itemOf(mat[k]); if (!it) return;
        var cid = id + 'c' + (uid++);
        var cp = s('clipPath', { id: cid }); cp.appendChild(s('circle', { cx: pt[0], cy: pt[1], r: r })); g.appendChild(cp);
        var im = s('image', { x: pt[0] - r, y: pt[1] - r, width: 2 * r, height: 2 * r, 'clip-path': 'url(#' + cid + ')', preserveAspectRatio: 'xMidYMid slice' });
        im.setAttribute('href', src(it.img)); im.addEventListener('error', function () { if (im.getAttribute('href') !== it.img) im.setAttribute('href', it.img); });
        g.appendChild(im);
        g.appendChild(s('circle', { cx: pt[0], cy: pt[1], r: r, fill: 'none', stroke: k === 'p' ? 'var(--make)' : k === 'n' ? 'var(--wonder)' : 'var(--learn)', 'stroke-width': 1.8 }));
      });
    }
    function nucleusPts(cx, cy, n) { var pts = []; for (var i = 0; i < n; i++) { var a = i * 2.39996, rr = 6.6 * Math.sqrt(i + .6); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } return pts; }
    function drawAtom(g, a, cx, cy, rot, label) {
      var R = [46, 76];
      caps.forEach(function (c, k) { if (k < R.length) g.appendChild(s('circle', { cx: cx, cy: cy, r: R[k], fill: 'none', stroke: 'var(--line)', 'stroke-width': 2, 'stroke-dasharray': '4 4' })); });
      var P = num(a.p) || 0, N = num(a.n) || 0, mix = [];
      var pp = P, nn = N; while (pp || nn) { if (pp) { mix.push('p'); pp--; } if (nn) { mix.push('n'); nn--; } }
      var pts = nucleusPts(cx, cy, P + N);
      tokens(g, pts.filter(function (_, j) { return mix[j] === 'p'; }), cx, cy, 8, 'p');
      tokens(g, pts.filter(function (_, j) { return mix[j] === 'n'; }), cx, cy, 8, 'n');
      a.shells.forEach(function (cnt, k) { var e = []; for (var j = 0; j < cnt; j++) { var ang = rot + j * 2 * Math.PI / cnt; e.push([cx + R[k] * Math.cos(ang), cy + R[k] * Math.sin(ang)]); } tokens(g, e, cx, cy, 9.5, 'e'); });
      if (label) { var t = s('text', { x: cx, y: cy + 98, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)', 'font-family': 'Nunito, Segoe UI, sans-serif' }); t.textContent = label; g.appendChild(t); }
    }
    function drawScene() {
      scene.innerHTML = '';
      if (!ready()) return;
      var svg = s('svg', { viewBox: '0 0 520 230', role: 'img', 'aria-label': stage === 'build' ? 'Two atoms on the bench, built from your items' : stage === 'molecule' ? 'The two atoms bonded into one molecule' : 'The same pieces rearranged into a new molecule' });
      var g = s('g'); svg.appendChild(g);
      var a = atoms[0], b = atoms[1];
      if (stage === 'build') { drawAtom(g, a, 140, 112, -Math.PI / 2, a.el ? 'Atom 1 · ' + a.el[1] : 'Atom 1'); drawAtom(g, b, 380, 112, -Math.PI / 2, b.el ? 'Atom 2 · ' + b.el[1] : 'Atom 2'); }
      else if (stage === 'molecule') { g.appendChild(s('line', { x1: 205, y1: 112, x2: 315, y2: 112, stroke: 'var(--ink-soft)', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .5 })); drawAtom(g, a, 205, 112, 0, ''); drawAtom(g, b, 315, 112, Math.PI, ''); }
      else { g.appendChild(s('line', { x1: 260, y1: 70, x2: 260, y2: 160, stroke: 'var(--ink-soft)', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .5 })); svg.setAttribute('viewBox', '0 0 520 260'); drawAtom(g, b, 205, 95, Math.PI / 4, ''); drawAtom(g, a, 315, 165, -Math.PI / 4, ''); }
      if (extra.p || extra.n || extra.e) { var w = s('text', { x: 260, y: 22, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#9E3E24', 'font-family': 'Nunito, Segoe UI, sans-serif' }); w.textContent = 'Pieces changed: the count no longer matches'; svg.appendChild(w); }
      scene.appendChild(svg);
      var lg = h('div', 'aalegend'); ROLES.forEach(function (r) { var it = itemOf(mat[r[0]]); lg.appendChild(h('span', 'aakey ' + r[0], r[1] + ': ' + (it ? it.name.toLowerCase() : '…'))); }); scene.appendChild(lg);
    }
    /* ---- steps 3 and 4 · bond and rearrange ---- */
    function drawBond() {
      p3.innerHTML = '';
      if (!(atoms[0].built && atoms[1].built)) return;
      p3.appendChild(h('h4', null, stage === 'build' ? 'Step 3 · Bond your atoms into a molecule' : stage === 'molecule' ? 'Step 4 · Rearrange into a new molecule' : 'Done · same pieces, new molecule'));
      var r = h('div', 'mrow');
      if (stage === 'build') { var bond = h('button', 'btn make', 'Bond into a molecule'); bond.type = 'button'; bond.addEventListener('click', function () { if (pending) return say('bad', 'Put the count back first.'); stage = 'molecule'; snap.molecule = totals(); say('good', 'Bonded. The nuclei moved closer and the atoms are connected, with every piece still visible. This is Photo #2.'); render(true); }); r.appendChild(bond); }
      if (stage === 'molecule') { var re = h('button', 'btn make', 'Rearrange into a new molecule'); re.type = 'button'; re.addEventListener('click', function () { if (pending) return say('bad', 'Put the count back first.'); stage = 'new'; snap.rearranged = totals(); var t = snap.rearranged; say('good', 'Rearranged into a different structure with the exact same pieces: ' + t.p + ' protons, ' + t.n + ' neutrons, ' + t.e + ' electrons before, during, and after. No matter created or destroyed. That is the Law of Conservation of Mass, modeled.'); render(true); }); r.appendChild(re); }
      if (stage === 'molecule') {
        var add = h('button', 'btn ghost', 'Add a piece'); add.type = 'button';
        add.addEventListener('click', function () { extra.e++; pending = 'add'; say('bad', 'You added a piece. The counter no longer matches: in a real change that would be matter created out of nothing. The assignment\'s rule: do not add any new pieces.'); render(true); });
        var rem = h('button', 'btn ghost', 'Remove a piece'); rem.type = 'button';
        rem.addEventListener('click', function () { extra.e--; pending = 'remove'; say('bad', 'You removed a piece. The counter no longer matches: in a real change that would be matter destroyed. The assignment\'s rule: do not remove any pieces.'); render(true); });
        r.appendChild(add); r.appendChild(rem);
        if (pending) { var fix = h('button', 'reset', 'Put it back'); fix.type = 'button'; fix.addEventListener('click', function () { extra = { p: 0, n: 0, e: 0 }; pending = null; say('', 'Back to the pieces you started with.'); render(true); }); r.appendChild(fix); }
      }
      var again = h('button', 'reset', 'Start over'); again.type = 'button';
      again.addEventListener('click', function () { atoms = [blank(), blank()]; cur = 0; stage = 'build'; extra = { p: 0, n: 0, e: 0 }; pending = null; snap = { built: null, molecule: null, rearranged: null }; say('', 'A new bench. Pick your items.'); render(true); });
      r.appendChild(again); p3.appendChild(r);
    }
    function drawCount() {
      count.innerHTML = '';
      var tr = h('tr'); ['Piece', 'Item', 'Two atoms', 'Molecule', 'New molecule'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); count.appendChild(tr);
      var now = totals();
      ROLES.forEach(function (r) {
        var k = r[0], row = h('tr'), it = itemOf(mat[k]);
        row.appendChild(h('td', null, r[1])); row.appendChild(h('td', null, it ? it.name : '…'));
        var b0 = snap.built ? snap.built[k] : (atoms.some(function (a) { return a.built; }) ? now[k] : '…');
        row.appendChild(h('td', 'mnum', String(b0)));
        var live1 = stage === 'molecule' ? now[k] + extra[k] : (snap.molecule ? snap.molecule[k] : '…');
        var c1 = h('td', 'mnum', String(live1)); if (stage === 'molecule' && extra[k]) c1.className += ' aabad'; row.appendChild(c1);
        var live2 = stage === 'new' ? snap.rearranged[k] : '…';
        row.appendChild(h('td', 'mnum', String(live2)));
        count.appendChild(row);
      });
    }
    function say(cls, t) { out.className = 'mverdict' + (cls ? ' ' + cls : ''); out.textContent = t; }
    function render(keepMsg) {
      drawMaterials(); drawAtomPanel(); drawScene(); drawBond(); drawCount();
      steps.innerHTML = '';
      [['Items', ready()], ['Atom 1', atoms[0].built], ['Atom 2', atoms[1].built], ['Bond', stage !== 'build'], ['Rearrange', stage === 'new']].forEach(function (x) { steps.appendChild(h('span', 'aastep' + (x[1] ? ' done' : ''), x[0])); });
      if (!keepMsg && !out.textContent) say('', 'Start with Step 1: three different items for protons, neutrons, and electrons.');
    }
    render();
  });
})();

/* ---- science model · case files (v2.10, 2026-10-19): <div class="model" data-model="casefile" data-label="…" data-live="https://…/sci8/q2w06/"
   data-cases='[{"title":"…","img":"images/…","alt":"…","report":"…","claim":"…","what":[{"t":"…","ok":true,"fb":"…"},…],"proof":[{"t":"…","ok":true,"fb":"…"},…],"closed":"…"},…]' data-done="…"></div>
   A detective game on claims and evidence. Each case is a real photo, a short report of what happened, and a classmate's
   claim. The student decides what really happened, then picks the line from the guide that proves it. Both right: the
   case is stamped closed with the page's summary. Everything shown comes from the page's data. Teaches: a claim needs
   evidence; when mass seems to vanish, the rule still holds. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  document.querySelectorAll('.model[data-model="casefile"]').forEach(function (root) {
    var cases;
    try { cases = JSON.parse(root.dataset.cases); } catch (e) { return; }
    var live = root.dataset.live || '', cur = 0, st = cases.map(function () { return { what: null, proof: null }; });
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Case files'));
    var tabs = h('div', 'mpicks'), file = h('div', 'cffile'), done = h('div', 'mverdict');
    [top, tabs, file, done].forEach(function (x) { root.appendChild(x); });
    function closed(i) { var c = cases[i], x = st[i]; return x.what !== null && c.what[x.what].ok && x.proof !== null && c.proof[x.proof].ok; }
    function choice(label, list, key) {
      var box = h('div', 'cfq'); box.appendChild(h('div', 'mtag ' + (key === 'what' ? 'iv' : 'dv'), label));
      var x = st[cur];
      list.forEach(function (o, j) {
        var b = h('button', 'cfopt' + (x[key] === j ? (o.ok ? ' good' : ' bad') : '')); b.type = 'button'; b.textContent = o.t;
        b.addEventListener('click', function () { if (closed(cur)) return; x[key] = j; render(); });
        box.appendChild(b);
      });
      if (x[key] !== null) { var o = list[x[key]], v = h('div', 'mverdict ' + (o.ok ? 'good' : 'bad')); v.textContent = o.fb || (o.ok ? 'Yes.' : 'Not quite. Try another.'); box.appendChild(v); }
      return box;
    }
    function render() {
      tabs.innerHTML = '';
      cases.forEach(function (c, i) { var b = h('button', 'mpick' + (i === cur ? ' on' : '') + (closed(i) ? ' sdone' : ''), 'Case ' + (i + 1) + ' · ' + c.title); b.type = 'button'; b.addEventListener('click', function () { cur = i; render(); }); tabs.appendChild(b); });
      var c = cases[cur]; file.innerHTML = '';
      var head = h('div', 'cfhead'); head.appendChild(h('span', 'cfno', 'Case file ' + (cur + 1))); head.appendChild(h('span', 'cftitle', c.title));
      if (closed(cur)) head.appendChild(h('span', 'cfstamp', 'Case closed'));
      file.appendChild(head);
      var body = h('div', 'cfbody');
      var fig = h('figure', 'cfphoto'), im = h('img'); im.alt = c.alt; im.src = live ? live + c.img : c.img;
      im.addEventListener('error', function () { if (im.getAttribute('src') !== c.img) im.src = c.img; });
      fig.appendChild(im); body.appendChild(fig);
      var txt = h('div', 'cftext');
      txt.appendChild(h('div', 'cflabel', 'The report')); txt.appendChild(h('p', null, c.report));
      txt.appendChild(h('div', 'cflabel', 'The claim')); txt.appendChild(h('blockquote', 'cfclaim', '“' + c.claim + '”'));
      body.appendChild(txt); file.appendChild(body);
      file.appendChild(choice('1 · What really happened?', c.what, 'what'));
      if (st[cur].what !== null && c.what[st[cur].what].ok) file.appendChild(choice('2 · Which line from your guide proves it?', c.proof, 'proof'));
      if (closed(cur)) { var cl = h('div', 'mverdict good cfclose'); cl.innerHTML = '<strong>Case closed.</strong> ' + c.closed; file.appendChild(cl); }
      var n = cases.filter(function (_, i) { return closed(i); }).length;
      done.className = 'mverdict' + (n === cases.length ? ' good' : '');
      done.textContent = n === cases.length ? (root.dataset.done || 'All cases closed.') : 'Cases closed: ' + n + ' of ' + cases.length + '.';
    }
    render();
  });
})();

/* ---- science model · video planner (v2.15, 2026-10-19): <div class="model" data-model="videoplan" data-label="…" data-key="…"
   data-experiments='[{"name":"…","lines":{"question":"…","vars":"…","reasoning":"…"}},…]'
   data-scenes='[{"k":"question","name":"…","frame":"My question was ___","fill":"question","need":"…"},…]'
   data-visuals='[{"k":"setup","name":"…"},…]' data-rules='{"test":"setup","results":"data"}' data-done="…"></div>
   A storyboard for the science fair video. Step 1: pick your experiment. Step 2: the scenes arrive shuffled; put them in
   order with the arrows (the guide: follow your script step by step, don't jump ahead). Step 3: each scene's script line is
   prefilled where the experiments document gives it (question, variables, reasoning) and left for the student where it
   does not (hypothesis, test, results, claim, what you learned). Step 4: pick a visual for each scene from the guide's list.
   Gallery check: every scene filled, in order, with the setup and data visuals where the page's rules put them. The script
   is shown whole to copy, and saved in this browser only. Everything shown comes from the page's data. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function shuffle(a) { var b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; } if (b.every(function (x, i) { return x === a[i]; })) { b.push(b.shift()); } return b; }
  document.querySelectorAll('.model[data-model="videoplan"]').forEach(function (root) {
    var exps, scenes, visuals, rules;
    try { exps = JSON.parse(root.dataset.experiments); scenes = JSON.parse(root.dataset.scenes); visuals = JSON.parse(root.dataset.visuals); rules = JSON.parse(root.dataset.rules || '{}'); } catch (e) { return; }
    var KEY = 'videoplan-' + (root.dataset.key || 'x');
    var st = { exp: null, order: shuffle(scenes.map(function (s) { return s.k; })), text: {}, vis: {}, checked: false };
    try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && saved.order && saved.order.length === scenes.length) st = saved; } catch (e) {}
    function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
    function sc(k) { return scenes.filter(function (s) { return s.k === k; })[0]; }
    function vname(k) { var v = visuals.filter(function (x) { return x.k === k; })[0]; return v ? v.name : ''; }
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Video planner'));
    var p1 = h('div', 'vpstep'), board = h('div', 'vpboard'), check = h('div', 'mrow'), out = h('div', 'mverdict'), script = h('div', 'vpscript');
    [top, p1, board, check, out, script].forEach(function (x) { root.appendChild(x); });
    function inOrder() { return st.order.every(function (k, i) { return k === scenes[i].k; }); }
    function lineFor(s) {
      if (st.text[s.k] != null && st.text[s.k] !== '') return st.text[s.k];
      var e = st.exp != null ? exps[st.exp] : null;
      return e && s.fill && e.lines[s.fill] ? e.lines[s.fill] : '';
    }
    function drawPick() {
      p1.innerHTML = '';
      p1.appendChild(h('h4', null, 'Step 1 · Your experiment'));
      var ps = h('div', 'mpicks');
      exps.forEach(function (e, i) { var b = h('button', 'mpick' + (st.exp === i ? ' on' : ''), e.name); b.type = 'button'; b.addEventListener('click', function () { st.exp = i; st.checked = false; save(); render(); }); ps.appendChild(b); });
      p1.appendChild(ps);
    }
    function drawBoard() {
      board.innerHTML = '';
      if (st.exp == null) { board.appendChild(h('p', 'mhint', 'Pick your experiment to open the storyboard.')); return; }
      board.appendChild(h('h4', null, inOrder() ? 'Steps 2 to 4 · Your storyboard (in order)' : 'Step 2 · Put the scenes in order with the arrows'));
      st.order.forEach(function (k, i) {
        var s = sc(k), card = h('div', 'vpcard' + (inOrder() ? ' ok' : ''));
        var head = h('div', 'vphead');
        head.appendChild(h('span', 'vpnum', String(i + 1)));
        head.appendChild(h('span', 'vpname', s.name));
        var up = h('button', 'vparrow', '▲'), dn = h('button', 'vparrow', '▼');
        up.type = dn.type = 'button'; up.setAttribute('aria-label', 'Move ' + s.name + ' earlier'); dn.setAttribute('aria-label', 'Move ' + s.name + ' later');
        up.disabled = i === 0; dn.disabled = i === st.order.length - 1;
        up.addEventListener('click', function () { var o = st.order; o.splice(i - 1, 0, o.splice(i, 1)[0]); st.checked = false; save(); render(); });
        dn.addEventListener('click', function () { var o = st.order; o.splice(i + 1, 0, o.splice(i, 1)[0]); st.checked = false; save(); render(); });
        head.appendChild(up); head.appendChild(dn);
        card.appendChild(head);
        if (inOrder()) {
          card.appendChild(h('div', 'vpframe', s.frame));
          var ta = h('textarea', 'vptext'); ta.rows = 2; ta.value = lineFor(s); ta.placeholder = s.need || 'Write this part in your own words.';
          ta.setAttribute('aria-label', s.name + ': your script line');
          ta.addEventListener('input', function () { st.text[s.k] = ta.value; st.checked = false; save(); drawScript(); });
          card.appendChild(ta);
          if (s.fill && exps[st.exp].lines[s.fill]) card.appendChild(h('div', 'mhint', 'Filled from your experiments document. Keep it or make it yours.'));
          var vr = h('div', 'mrow'); vr.appendChild(h('span', 'mtag dv', 'On screen'));
          var sel = h('select', 'vpsel'); sel.setAttribute('aria-label', 'Visual for ' + s.name);
          sel.appendChild(new Option('Pick a visual…', ''));
          visuals.forEach(function (v) { var o = new Option(v.name, v.k); if (st.vis[s.k] === v.k) o.selected = true; sel.appendChild(o); });
          sel.addEventListener('change', function () { st.vis[s.k] = sel.value; st.checked = false; save(); drawScript(); });
          vr.appendChild(sel); card.appendChild(vr);
        }
        board.appendChild(card);
      });
      if (!inOrder()) board.appendChild(h('p', 'mhint', 'Think like a viewer in the gallery: what do they need to hear first? The script lines open once the order is right.'));
    }
    function problems() {
      var p = [];
      if (!inOrder()) p.push('The scenes are not in order yet.');
      scenes.forEach(function (s) { if (!lineFor(s).trim() || /_{3,}/.test(lineFor(s))) p.push(s.name + ': the script line is still blank.'); });
      scenes.forEach(function (s) { if (!st.vis[s.k]) p.push(s.name + ': pick what is on screen.'); });
      Object.keys(rules).forEach(function (k) { if (st.vis[k] && st.vis[k] !== rules[k]) p.push(sc(k).name + ': your guide says to show ' + vname(rules[k]).toLowerCase() + ' here.'); });
      return p;
    }
    var run = h('button', 'btn make', 'Gallery check'); run.type = 'button';
    var reset = h('button', 'reset', 'Start over'); reset.type = 'button';
    check.appendChild(run); check.appendChild(reset);
    run.addEventListener('click', function () { st.checked = true; save(); render(); });
    reset.addEventListener('click', function () { st = { exp: null, order: shuffle(scenes.map(function (s) { return s.k; })), text: {}, vis: {}, checked: false }; save(); render(); });
    function drawCheck() {
      if (!st.checked) { out.className = 'mverdict'; out.textContent = 'When every scene has words and a visual, run the gallery check. A viewer in the VR gallery has to understand your experiment without you there.'; return; }
      var p = problems();
      if (!p.length) { out.className = 'mverdict good'; out.textContent = root.dataset.done || 'Ready for the gallery.'; return; }
      out.className = 'mverdict bad'; out.textContent = '';
      out.appendChild(h('strong', null, 'Not ready yet. ' + p.length + ' thing' + (p.length === 1 ? '' : 's') + ' to fix:'));
      var ul = h('ul', 'vplist'); p.slice(0, 8).forEach(function (t) { ul.appendChild(h('li', null, t)); }); out.appendChild(ul);
    }
    function drawScript() {
      script.innerHTML = '';
      if (st.exp == null || !inOrder()) return;
      script.appendChild(h('h4', null, 'Your script, in order · ' + exps[st.exp].name));
      var ol = h('ol', 'vpol');
      scenes.forEach(function (s) { var li = h('li'); li.appendChild(h('strong', null, s.name + ': ')); li.appendChild(document.createTextNode(lineFor(s) || '…')); if (st.vis[s.k]) li.appendChild(h('span', 'vpon', ' [On screen: ' + vname(st.vis[s.k]) + ']')); ol.appendChild(li); });
      script.appendChild(ol);
      script.appendChild(h('p', 'mhint', 'Saved in this browser only. Copy it into your notes or your Checkpoint 4 script.'));
    }
    function render() { drawPick(); drawBoard(); drawCheck(); drawScript(); check.style.display = st.exp == null ? 'none' : ''; }
    render();
  });
})();

/* ---- science model · change detective (v2.16, 2026-10-28; v2.18, 2026-10-29: each change is a drawn animation): <div class="model" data-model="changetest" data-label="…"
   data-questions='["Did a new substance form?",…]'
   data-cases='[{"name":"…","anim":"melt"|"boil"|"dissolve"|"flatten"|"burn"|"rust"|"glow"|"fizz","stages":["Ice cube","Melting","Water"],"alt":"…","show":"…","kind":"physical"|"chemical","why":"…","trap":"…"},…]' data-done="…"></div>
   The student picks one of the page's changes and watches it happen: a drawn scene (SVG, built here) that Play runs from
   start to finish in a few seconds, or the student drags the slider or taps a stage label. Bubbles, flames, and smoke keep
   moving while the scene is on screen (not with reduced motion). The scenes are pictures of the page's own examples, sped
   up; they carry no numbers. A case with "img" (and "alt") instead of "anim" shows one photo. Then the student answers the
   page's key questions yes or no as evidence, and makes the call: physical or chemical. The verdict checks the call against
   the page's own classification and gives the page's reason; a case may carry a "trap" note (for example, bubbles in
   boiling water that are not a new substance). The key-question answers are the student's notes and are not graded one by
   one. A log fills. Teaches: scientists use evidence, not looks, to tell the two changes apart. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', DUR = 6500;
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, a, parent) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
  function set(e, a) { for (var k in a) e.setAttribute(k, a[k]); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { return clamp((t - a) / (b - a)); }
  function ease(x) { return x * x * (3 - 2 * x); }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }
  function mix(c1, c2, t) {
    var a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
    return 'rgb(' + [16, 8, 0].map(function (sh) { return Math.round(lerp((a >> sh) & 255, (b >> sh) & 255, t)); }).join(',') + ')';
  }
  /* Each scene draws into an SVG group (viewBox 600 x 350) and returns draw(t, now): t runs 0 to 1 through the change,
     now (ms) moves bubbles, flames, and smoke. */
  var SCENES = {
    melt: function (g) {
      s('rect', { width: 600, height: 350, fill: '#e6f0f6' }, g);
      s('rect', { y: 262, width: 600, height: 88, fill: '#c9a27a' }, g);
      s('rect', { y: 262, width: 600, height: 6, fill: '#ad8660' }, g);
      var pud = s('ellipse', { cx: 300, cy: 268, fill: '#8fcbea' }, g);
      var cube = s('rect', { fill: '#d9f1fb', stroke: '#86c3e3', 'stroke-width': 3 }, g);
      var shine = s('rect', { fill: '#fff', opacity: 0.85, rx: 5 }, g);
      var drops = [0, 1, 2, 3].map(function () { return s('ellipse', { rx: 5, ry: 7, fill: '#8fcbea' }, g); });
      return function (t, now) {
        var m = ease(seg(t, 0.08, 0.95)), hh = lerp(140, 6, m), w = lerp(140, 104, m), x = 300 - w / 2, y = 266 - hh;
        set(cube, { x: x, y: y, width: w, height: hh, rx: Math.min(lerp(10, 40, m), hh / 2), opacity: m > 0.98 ? 0 : 1 });
        set(shine, { x: x + 14, y: y + 12, width: w * 0.16, height: Math.max(0, hh * 0.45 - 6), opacity: 0.85 * (1 - m) });
        set(pud, { rx: lerp(76, 220, m), ry: lerp(5, 18, m), opacity: lerp(0.35, 0.9, m) });
        drops.forEach(function (d, i) {
          var p = (now / 1500 + i / 4) % 1, side = i % 2 ? x + w + 2 : x - 2;
          set(d, { cx: side, cy: y + 10 + p * Math.max(0, hh - 12), opacity: m > 0.04 && m < 0.9 ? 1 - p * 0.4 : 0 });
        });
      };
    },
    boil: function (g) {
      s('rect', { width: 600, height: 350, fill: '#f3ede4' }, g);
      s('rect', { x: 130, y: 286, width: 340, height: 64, rx: 6, fill: '#3a3f47' }, g);
      s('rect', { x: 215, y: 278, width: 170, height: 10, rx: 4, fill: '#23262b' }, g);
      var flames = [0, 1, 2, 3, 4, 5].map(function (i) { return s('path', { d: 'M-9 0 Q0 -26 9 0 Z', fill: i % 2 ? '#5b9bf2' : '#3f7fe0' }, g); });
      var water = s('rect', { x: 194, width: 212, rx: 4, fill: '#7cc4ef', opacity: 0.85 }, g);
      var bub = [], steam = [];
      for (var i = 0; i < 30; i++) bub.push(s('circle', { fill: '#eaf7ff', stroke: '#b9e2f7', 'stroke-width': 1.5 }, g));
      s('rect', { x: 188, y: 104, width: 224, height: 172, rx: 10, fill: '#ffffff', 'fill-opacity': 0.18, stroke: '#7d8a96', 'stroke-width': 5 }, g);
      s('rect', { x: 150, y: 120, width: 40, height: 12, rx: 6, fill: '#5d6670' }, g);
      s('rect', { x: 410, y: 120, width: 40, height: 12, rx: 6, fill: '#5d6670' }, g);
      for (i = 0; i < 4; i++) steam.push(s('path', { d: 'M0 0 q-14 -22 0 -44 q14 -22 0 -44', fill: 'none', stroke: '#b8c3cc', 'stroke-width': 7, 'stroke-linecap': 'round' }, g));
      return function (t, now) {
        var heat = seg(t, 0, 0.12), boil = ease(seg(t, 0.3, 0.75)), top = lerp(136, 150, seg(t, 0.7, 1)), bottom = 270;
        flames.forEach(function (f, i) { set(f, { transform: 'translate(' + (232 + i * 27) + ' 280) scale(1 ' + (heat * (0.75 + 0.25 * Math.sin(now / 80 + i * 2))) + ')' }); });
        set(water, { y: top, height: bottom - top });
        bub.forEach(function (b, i) {
          var on = rnd(i + 50) < Math.max(boil, 0.12 * seg(t, 0.12, 0.3)), sp = lerp(2600, 900, boil) * (0.7 + 0.6 * rnd(i + 9));
          var p = (now / sp + rnd(i + 3)) % 1;
          set(b, { cx: 202 + rnd(i) * 196 + Math.sin(now / 300 + i) * 3, cy: bottom - 4 - p * (bottom - top - 8), r: lerp(2, 5 + 5 * boil, p), opacity: on ? 1 : 0 });
        });
        steam.forEach(function (w, i) {
          var p = (now / 2600 + i / 4) % 1;
          set(w, { transform: 'translate(' + (230 + i * 46) + ' ' + (98 - p * 40) + ')', opacity: seg(t, 0.5, 0.85) * 0.75 * Math.sin(Math.PI * p) });
        });
      };
    },
    dissolve: function (g) {
      s('rect', { width: 600, height: 350, fill: '#f6efe6' }, g);
      s('rect', { y: 296, width: 600, height: 54, fill: '#d8c3a5' }, g);
      var clip = s('clipPath', { id: 'ctglass' + (++uid) }, g);
      s('path', { d: 'M212 92 L388 92 L370 294 L230 294 Z' }, clip);
      var inside = s('g', { 'clip-path': 'url(#ctglass' + uid + ')' }, g);
      s('rect', { x: 200, y: 140, width: 200, height: 160, fill: '#b8641e', opacity: 0.85 }, inside);
      var grains = [];
      for (var i = 0; i < 60; i++) grains.push(s('circle', { r: 2.2, fill: '#fffaf0' }, inside));
      var cube = s('rect', { fill: '#ffffff', stroke: '#d9d4cc', 'stroke-width': 2, rx: 4 }, g);
      s('path', { d: 'M212 92 L388 92 L370 294 L230 294 Z', fill: '#ffffff', 'fill-opacity': 0.15, stroke: '#9aa5ae', 'stroke-width': 4 }, g);
      var splash = [0, 1, 2, 3].map(function () { return s('circle', { r: 4, fill: '#c8803c' }, g); });
      return function (t, now) {
        var fall = ease(seg(t, 0.02, 0.2)), sink = seg(t, 0.2, 0.34), shrink = seg(t, 0.32, 0.9), size = 46 * (1 - shrink);
        var cy = sink > 0 ? lerp(160, 260, ease(sink)) : lerp(-50, 160, fall), cx = 300;
        set(cube, { x: cx - size / 2, y: cy - size / 2, width: size, height: size, opacity: size < 1 ? 0 : 1 });
        splash.forEach(function (d, i) {
          var p = seg(t, 0.18, 0.27), a = -Math.PI / 2 + (i - 1.5) * 0.6;
          set(d, { cx: 300 + Math.cos(a) * 50 * p, cy: 140 + Math.sin(a) * 40 * p + 60 * p * p, opacity: p > 0 && p < 1 ? 1 : 0 });
        });
        grains.forEach(function (gr, i) {
          var start = 0.32 + rnd(i) * 0.45, d = ease(seg(t, start, Math.min(1, start + 0.35))), a = rnd(i + 7) * Math.PI * 2, r = 20 + rnd(i + 13) * 90;
          set(gr, { cx: cx + Math.cos(a) * r * d + Math.sin(now / 900 + i) * 3 * d, cy: 260 + Math.sin(a) * r * 0.9 * d - 40 * d * rnd(i + 2),
            opacity: d > 0 ? (1 - seg(t, 0.78, 1)) * 0.95 : 0 });
        });
      };
    },
    flatten: function (g) {
      s('rect', { width: 600, height: 350, fill: '#dcd7cf' }, g);
      var gid = 'ctfoil' + (++uid), gr = s('linearGradient', { id: gid, x1: 0, y1: 0, x2: 1, y2: 1 }, g);
      s('stop', { offset: '0', 'stop-color': '#f6f8fa' }, gr); s('stop', { offset: '0.5', 'stop-color': '#b6bec6' }, gr); s('stop', { offset: '1', 'stop-color': '#eef1f4' }, gr);
      var N = 48, ball = [], sheet = [], shape = s('polygon', { fill: 'url(#' + gid + ')', stroke: '#8c949c', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
      for (var i = 0; i < N; i++) {
        var a = i / N * Math.PI * 2, r = 64 * (0.72 + 0.4 * rnd(i));
        ball.push([300 + Math.cos(a) * r, 178 + Math.sin(a) * r]);
        var d = i / N * 1200, x, y;   /* walk the sheet's edge, 380 by 220 */
        if (d < 380) { x = d; y = 0; } else if (d < 600) { x = 380; y = d - 380; } else if (d < 980) { x = 980 - d; y = 220; } else { x = 0; y = 1200 - d; }
        sheet.push([110 + x + (rnd(i + 99) - 0.5) * 6, 68 + y + (rnd(i + 77) - 0.5) * 6]);
      }
      var cid = 'ctfoilclip' + uid, cl = s('clipPath', { id: cid }, g), clipShape = s('polygon', {}, cl), wr = s('g', { 'clip-path': 'url(#' + cid + ')' }, g);
      var lines = [];
      for (i = 0; i < 14; i++) lines.push({ u: [rnd(i + 200) * 2 - 1, rnd(i + 300) * 2 - 1, rnd(i + 400) * 2 - 1], v: [rnd(i + 500) * 2 - 1, rnd(i + 600) * 2 - 1, rnd(i + 700) * 2 - 1],
        el: s('polyline', { fill: 'none', stroke: '#8a939b', 'stroke-width': 1.6 }, wr) });
      return function (t) {
        var m = ease(seg(t, 0.1, 0.9));
        var pts = ball.map(function (p, k) { return lerp(p[0], sheet[k][0], m).toFixed(1) + ',' + lerp(p[1], sheet[k][1], m).toFixed(1); }).join(' ');
        shape.setAttribute('points', pts); clipShape.setAttribute('points', pts);
        var sx = lerp(48, 175, m), sy = lerp(48, 95, m);
        lines.forEach(function (l) {
          set(l.el, { points: l.u.map(function (u, k) { return (300 + u * sx).toFixed(1) + ',' + (178 + l.v[k] * sy).toFixed(1); }).join(' '), opacity: lerp(0.9, 0.3, m) });
        });
      };
    },
    burn: function (g) {
      s('rect', { width: 600, height: 350, fill: '#1f2636' }, g);
      s('rect', { y: 272, width: 600, height: 78, fill: '#3d3428' }, g);
      var rid = 'ctfire' + (++uid), rg = s('radialGradient', { id: rid }, g);
      s('stop', { offset: '0', 'stop-color': '#ffb347', 'stop-opacity': 0.9 }, rg); s('stop', { offset: '1', 'stop-color': '#ff8a1f', 'stop-opacity': 0 }, rg);
      var glow = s('ellipse', { cx: 300, cy: 230, rx: 230, ry: 130, fill: 'url(#' + rid + ')' }, g);
      var ash = s('ellipse', { cx: 300, cy: 274, fill: '#bdb7ae' }, g);
      var logs = [[-14, 240], [14, 240], [0, 256]].map(function (o) { return { rot: o[0], y: o[1], el: s('rect', { x: 190, width: 220, rx: 14 }, g) }; });
      var flames = [], smoke = [], specks = [];
      for (var i = 0; i < 5; i++) flames.push([s('path', { d: 'M0 0 C-30 -34 -12 -70 0 -112 C12 -70 30 -34 0 0 Z', fill: '#ff7a1a' }, g), s('path', { d: 'M0 0 C-16 -22 -6 -44 0 -70 C6 -44 16 -22 0 0 Z', fill: '#ffd23f' }, g)]);
      for (i = 0; i < 9; i++) smoke.push(s('circle', { fill: '#8d939c' }, g));
      for (i = 0; i < 12; i++) specks.push(s('circle', { r: 3, fill: '#2a2624' }, g));
      return function (t, now) {
        var fire = seg(t, 0.06, 0.24) * (1 - seg(t, 0.68, 0.9)), ch = seg(t, 0.25, 0.85), left = 1 - seg(t, 0.6, 0.97), heap = ease(seg(t, 0.45, 0.95));
        set(glow, { opacity: 0.8 * fire });
        set(ash, { rx: 140 * heap, ry: 22 * heap });
        logs.forEach(function (l) {
          var hh = lerp(30, 14, ch);
          set(l.el, { y: l.y + 15 - hh, height: hh, fill: mix('#8b5a2b', '#2b2522', ch), opacity: left, transform: 'rotate(' + l.rot + ' 300 ' + l.y + ')' });
        });
        flames.forEach(function (f, k) {
          var fl = fire * (0.8 + 0.2 * Math.sin(now / 70 + k * 1.9)) * (0.75 + 0.5 * rnd(k)), x = 240 + k * 30;
          f.forEach(function (p) { set(p, { transform: 'translate(' + x + ' 252) scale(' + (0.9 + 0.1 * Math.sin(now / 110 + k)) + ' ' + fl + ')' }); });
        });
        var smk = seg(t, 0.12, 0.3) * (1 - seg(t, 0.88, 1));
        smoke.forEach(function (c, k) {
          var p = (now / 3000 + k / 9) % 1;
          set(c, { cx: 300 + Math.sin(p * 5 + k) * 26 + p * 40, cy: 150 - p * 150, r: 12 + p * 22, opacity: smk * 0.55 * (1 - p) });
        });
        specks.forEach(function (c, k) { set(c, { cx: 300 + (rnd(k + 30) - 0.5) * 220 * heap, cy: 272 + (rnd(k + 40) - 0.5) * 22 * heap, opacity: heap }); });
      };
    },
    rust: function (g) {
      s('rect', { width: 600, height: 350, fill: '#eceef1' }, g);
      s('rect', { y: 262, width: 600, height: 88, fill: '#d3ccc0' }, g);
      var steel = '#a9b3bd', brown = '#8c4a24';
      var parts = [s('rect', { x: 110, y: 130, width: 26, height: 104, rx: 5 }, g), s('rect', { x: 132, y: 166, width: 320, height: 32 }, g), s('polygon', { points: '452,166 506,182 452,198' }, g)];
      var shine = s('rect', { x: 140, y: 172, width: 300, height: 5, rx: 2.5, fill: '#ffffff' }, g);
      var spots = [], flakes = [];
      for (var i = 0; i < 46; i++) {
        var onHead = i < 8;
        spots.push({ th: rnd(i) * 0.6, r: 5 + rnd(i + 5) * 8, el: s('circle', { cx: onHead ? 114 + rnd(i + 9) * 18 : 140 + rnd(i + 9) * 340, cy: onHead ? 136 + rnd(i + 11) * 92 : 168 + rnd(i + 11) * 28, fill: i % 2 ? '#b5541c' : '#7a3510' }, g) });
      }
      for (i = 0; i < 7; i++) flakes.push(s('rect', { width: 7, height: 4, fill: '#9c4a1c' }, g));
      return function (t) {
        var r = seg(t, 0.12, 1);
        parts.forEach(function (p) { p.setAttribute('fill', mix(steel, brown, Math.pow(r, 1.3))); });
        shine.setAttribute('opacity', 0.8 * (1 - seg(t, 0.1, 0.6)));
        spots.forEach(function (sp) { var k = seg(t, 0.1 + sp.th, 0.4 + sp.th); set(sp.el, { r: sp.r * k, opacity: k ? 0.9 : 0 }); });
        flakes.forEach(function (f, k) { var p = seg(t, 0.75 + k * 0.025, 0.9 + k * 0.012); var fx = 160 + k * 44 + rnd(k + 60) * 24, fy = 198 + p * (58 + rnd(k + 70) * 18); set(f, { x: fx, y: fy, opacity: p > 0 ? 1 : 0, transform: 'rotate(' + (p * 70 + rnd(k) * 90) + ' ' + (fx + 3) + ' ' + (fy + 2) + ')' }); });
      };
    },
    glow: function (g) {
      var bg = s('rect', { width: 600, height: 350 }, g);
      var fid = 'ctglow' + (++uid), f = s('filter', { id: fid, x: '-30%', y: '-80%', width: '160%', height: '260%' }, g);
      s('feGaussianBlur', { stdDeviation: 14 }, f);
      var halo = s('g', { filter: 'url(#' + fid + ')' }, g), stick = s('g', {}, g), dots = [];
      var halves = [-1, 1].map(function (side) {
        var grp = s('g', {}, stick);
        return { side: side, grp: grp, hal: s('rect', { x: side < 0 ? -176 : 0, y: -22, width: 176, height: 44, rx: 22 }, halo),
          body: s('rect', { x: side < 0 ? -176 : 0, y: -20, width: 176, height: 40, rx: 20, stroke: '#9aa49a', 'stroke-width': 3 }, grp),
          vial: s('rect', { x: side < 0 ? -140 : 0, y: -6, width: 140, height: 12, rx: 6, fill: '#f7f9fb', stroke: '#b9c1c8', 'stroke-width': 2 }, grp) };
      });
      for (var i = 0; i < 18; i++) dots.push(s('circle', { r: 4, fill: i % 2 ? '#f4f19a' : '#ffffff' }, stick));
      return function (t, now) {
        var dark = seg(t, 0.25, 0.55), bend = 18 * Math.sin(Math.PI * seg(t, 0.1, 0.32)), mixing = seg(t, 0.25, 0.6), lit = ease(seg(t, 0.32, 0.72));
        var pulse = lit * (0.92 + 0.08 * Math.sin(now / 400));
        bg.setAttribute('fill', mix('#e7e3ef', '#0e1020', dark));
        stick.setAttribute('transform', 'translate(300 175)'); halo.setAttribute('transform', 'translate(300 175)');
        halves.forEach(function (hv) {
          hv.grp.setAttribute('transform', 'rotate(' + (hv.side * bend) + ')');
          hv.hal.setAttribute('transform', 'rotate(' + (hv.side * bend) + ')');
          set(hv.body, { fill: mix('#dfe7d8', '#7dff5a', lit), 'fill-opacity': 0.9 });
          set(hv.hal, { fill: '#6dff4a', opacity: 0.85 * pulse });
          hv.vial.setAttribute('opacity', 1 - seg(t, 0.2, 0.4));
        });
        dots.forEach(function (d, k) {
          var x = (rnd(k) - 0.5) * 320 + Math.sin(now / 350 + k) * 18 * mixing, y = (rnd(k + 5) - 0.5) * 22;
          set(d, { cx: x, cy: y, opacity: mixing * (1 - seg(t, 0.6, 0.8)) });
        });
      };
    },
    fizz: function (g) {
      s('rect', { width: 600, height: 350, fill: '#eaf1f5' }, g);
      s('rect', { y: 298, width: 600, height: 52, fill: '#cdbfaa' }, g);
      var liquid = s('rect', { x: 216, width: 168, fill: '#eef3cf', opacity: 0.9 }, g);
      var powder = s('ellipse', { cx: 300, cy: 290, fill: '#ffffff', stroke: '#d8d8d8', 'stroke-width': 2 }, g);
      var gas = [], foam = [];
      for (var i = 0; i < 16; i++) gas.push(s('circle', { fill: 'none', stroke: '#c2ccd2', 'stroke-width': 2 }, g));
      for (i = 0; i < 46; i++) foam.push(s('circle', { fill: '#ffffff', stroke: '#d5dde2', 'stroke-width': 1.5 }, g));
      s('path', { d: 'M212 96 L212 292 Q212 298 220 298 L380 298 Q388 298 388 292 L388 96', fill: 'none', stroke: '#8796a3', 'stroke-width': 5 }, g);
      [150, 190, 230].forEach(function (y) { s('line', { x1: 214, x2: 236, y1: y, y2: y, stroke: '#8796a3', 'stroke-width': 2 }, g); });
      var stream = s('path', { fill: 'none', stroke: '#e3ebc0', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      var cup = s('g', {}, g);
      s('rect', { x: -32, y: -46, width: 64, height: 86, rx: 6, fill: '#ffffff', 'fill-opacity': 0.5, stroke: '#8796a3', 'stroke-width': 4 }, cup);
      var inCup = s('rect', { x: -28, width: 56, fill: '#eef3cf' }, cup);
      return function (t, now) {
        var tilt = -78 * (ease(seg(t, 0.04, 0.16)) - ease(seg(t, 0.38, 0.5))), pour = seg(t, 0.14, 0.4), F = ease(seg(t, 0.2, 0.45)) * (1 - 0.55 * seg(t, 0.72, 1));
        cup.setAttribute('transform', 'translate(452 70) rotate(' + tilt + ')');
        var left = 1 - pour; set(inCup, { y: 36 - 70 * left, height: 70 * left });
        var top = lerp(296, 230, pour);
        set(liquid, { y: top, height: 296 - top, opacity: pour > 0 ? 0.9 : 0 });
        stream.setAttribute('d', 'M418 58 Q330 50 310 ' + top);
        stream.setAttribute('opacity', pour > 0.02 && pour < 0.98 ? 1 : 0);
        set(powder, { rx: lerp(62, 8, seg(t, 0.3, 0.92)), ry: lerp(10, 3, seg(t, 0.3, 0.92)) });
        foam.forEach(function (c, k) {
          var on = rnd(k) < F, wob = Math.sin(now / 260 + k) * 2;
          set(c, { cx: 222 + rnd(k + 1) * 156 + wob, cy: top - rnd(k + 3) * F * 150 + 4, r: 8 + rnd(k + 6) * 9 + wob * 0.5, opacity: on ? 1 : 0 });
        });
        gas.forEach(function (c, k) {
          var p = (now / 900 + rnd(k + 20)) % 1;
          set(c, { cx: 230 + rnd(k + 8) * 140, cy: 292 - p * (292 - top), r: 2 + p * 4, opacity: F > 0.05 ? F : 0 });
        });
      };
    }
  };
  var uid = 0;
  document.querySelectorAll('.model[data-model="changetest"]').forEach(function (root) {
    var cases, qs;
    try { cases = JSON.parse(root.dataset.cases); qs = JSON.parse(root.dataset.questions); } catch (e) { return; }
    var live = root.dataset.live || '', cur = 0, st = cases.map(function () { return { ans: {}, call: null }; });
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Change detective'));
    var crow = h('div', 'mpicks'), photo = h('figure', 'sphoto'), box = h('div', 'mvars'), callrow = h('div', 'mrow'), out = h('div', 'mverdict'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, crow, photo, box, callrow, out, table, done].forEach(function (x) { root.appendChild(x); });
    var stage = h('div', 'ctstage'), ctl = h('div', 'ctplay'), ticks = h('div', 'ctticks'), cap = h('figcaption');
    var play = h('button', 'mpick', '▶ Play'); play.type = 'button';
    var range = h('input'); range.type = 'range'; range.min = 0; range.max = 1000; range.step = 1; range.setAttribute('aria-label', 'Scrub through the change');
    ctl.appendChild(play); ctl.appendChild(range);
    [stage, ctl, ticks, cap].forEach(function (x) { photo.appendChild(x); });
    callrow.appendChild(h('span', 'mtag iv', 'Your call'));
    var cp = h('span', 'mpicks'); callrow.appendChild(cp);
    var draw = null, tt = 0, playing = false, last = 0, raf = 0, seen = true, shown = -1;
    function paint(now) {
      if (draw) draw(tt, now);
      range.value = Math.round(tt * 1000);
      var labs = ticks.querySelectorAll('button'), n = labs.length;
      labs.forEach(function (b, k) { b.classList.toggle('on', n > 1 && Math.round(tt * (n - 1)) === k); });
    }
    function loop(now) {
      raf = 0;
      if (playing) {
        tt = Math.min(1, tt + (now - last) / DUR);
        if (tt >= 1) { playing = false; play.textContent = '↺ Replay'; }
      }
      last = now; paint(still && !playing ? 0 : now);
      if (draw && seen && (playing || !still)) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function pause() { playing = false; play.textContent = '▶ Play'; }
    play.addEventListener('click', function () {
      if (playing) { pause(); return; }
      if (tt >= 1) tt = 0;
      playing = true; play.textContent = 'Pause'; kick();
    });
    range.addEventListener('input', function () { pause(); tt = +range.value / 1000; paint(performance.now()); kick(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) kick(); }).observe(stage);
    function buildStage(c) {
      pause(); tt = 0; draw = null; stage.innerHTML = ''; ticks.innerHTML = '';
      if (c.anim && SCENES[c.anim]) {
        var svg = s('svg', { viewBox: '0 0 600 350', role: 'img', 'aria-label': c.alt || c.show, preserveAspectRatio: 'xMidYMid slice' });
        draw = SCENES[c.anim](s('g', {}, svg)); stage.appendChild(svg);
        (c.stages || []).forEach(function (lab, k, all) {
          var b = h('button', null, lab); b.type = 'button';
          b.addEventListener('click', function () { pause(); tt = all.length > 1 ? k / (all.length - 1) : 0; paint(performance.now()); kick(); });
          ticks.appendChild(b);
        });
      } else {
        var im = h('img'); im.dataset.rel = c.img; im.alt = c.alt;
        im.addEventListener('error', function () { if (im.getAttribute('src') !== im.dataset.rel) im.src = im.dataset.rel; });
        im.src = live ? live + c.img : c.img; stage.appendChild(im);
      }
      ctl.hidden = ticks.hidden = !draw;
      paint(performance.now()); kick();
    }
    [['physical', 'Physical change'], ['chemical', 'Chemical change']].forEach(function (o) {
      var b = h('button', 'mpick', o[1]); b.type = 'button'; b.dataset.k = o[0];
      b.addEventListener('click', function () {
        var s0 = st[cur];
        if (!Object.keys(s0.ans).length) { out.className = 'mverdict'; out.textContent = 'Gather evidence first: answer at least one key question above.'; return; }
        s0.call = o[0]; render();
      });
      cp.appendChild(b);
    });
    function render() {
      var c = cases[cur], sc = st[cur];
      crow.innerHTML = '';
      cases.forEach(function (cc, i) {
        var b = h('button', 'mpick' + (i === cur ? ' on' : '') + (st[i].call === cc.kind ? ' sdone' : ''), cc.name); b.type = 'button';
        b.addEventListener('click', function () { cur = i; render(); }); crow.appendChild(b);
      });
      if (shown !== cur) { buildStage(c); shown = cur; }
      cap.textContent = c.show;
      box.innerHTML = '';
      box.appendChild(h('div', 'mtag cv', 'Key questions · your evidence'));
      qs.forEach(function (q, j) {
        var row = h('div', 'ctq'); row.appendChild(h('span', 'ctqt', q));
        var ps = h('span', 'mpicks');
        [['yes', 'Yes'], ['no', 'No']].forEach(function (o) {
          var b = h('button', 'mpick' + (sc.ans[j] === o[0] ? ' on' : ''), o[1]); b.type = 'button';
          b.addEventListener('click', function () { sc.ans[j] = o[0]; render(); }); ps.appendChild(b);
        });
        row.appendChild(ps); box.appendChild(row);
      });
      cp.querySelectorAll('.mpick').forEach(function (b) { b.classList.toggle('on', sc.call === b.dataset.k); });
      if (!sc.call) { out.className = 'mverdict'; out.textContent = (draw ? 'Press Play and watch the change happen. Then answer' : 'Answer') + ' the key questions from what you see and read, and make the call.'; }
      else {
        var ok = sc.call === c.kind;
        out.className = 'mverdict ' + (ok ? 'good' : 'bad');
        out.textContent = (ok ? 'Yes: a ' + c.kind + ' change. ' : 'Look at your evidence again. ') + (ok ? c.why : (c.trap || 'Ask the first key question again: did a new substance form?'));
        if (ok && c.trap) { var t = h('div', 'mhint', 'The trap: ' + c.trap); out.appendChild(t); }
      }
      table.innerHTML = '';
      var tr = h('tr'); ['Change', 'Your call', 'Check'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      cases.forEach(function (cc, i) { var r = h('tr'); r.appendChild(h('td', null, cc.name)); r.appendChild(h('td', null, st[i].call ? st[i].call : '…')); r.appendChild(h('td', null, st[i].call ? (st[i].call === cc.kind ? '✓' : 'try again') : '…')); table.appendChild(r); });
      var n = cases.filter(function (cc, i) { return st[i].call === cc.kind; }).length;
      done.className = 'mverdict' + (n === cases.length ? ' good' : '');
      done.textContent = n === cases.length ? (root.dataset.done || 'All solved.') : 'Solved: ' + n + ' of ' + cases.length + '.';
    }
    render();
  });
})();

/* ---- science model · weigh-in around the solar system (v2.17, 2026-10-29): <div class="model" data-model="weighin" data-label="…" data-who="…"
   data-worlds='[{"name":"Earth","pull":"…","weight":80,"jump":1,"sky":"#…","ground":"#…","why":"…"},…]' data-mass="…" data-done="…"></div>
   No photos (Jorge, 2026-10-29: "something animated"). The first world is home (Earth). The student picks another world,
   predicts heavier or lighter than at home, and steps on the scale: the dial needle swings to the page's weight, then the
   drawn kid jumps (height and hang time scale with the page's "jump" number, 1 = home). A badge under the scene says the
   mass never changes. Every number shown comes from the page's data. Teaches: weight is gravity's pull on your mass, so it
   changes from world to world while mass stays the same; worlds with more mass pull harder. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function cap1(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.model[data-model="weighin"]').forEach(function (root) {
    var worlds;
    try { worlds = JSON.parse(root.dataset.worlds); } catch (e) { return; }
    var home = worlds[0], cur = 0, shown = home.weight, busy = false;
    var st = worlds.map(function (w, i) { return { pred: null, ran: i === 0 }; });
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Weigh-in'));
    var wrow = h('div', 'mrow'), prow = h('div', 'mrow'), scene = h('div', 'mscene'), badge = h('div', 'wibadge'), out = h('div', 'mverdict'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, wrow, prow, scene, badge, out, table, done].forEach(function (x) { root.appendChild(x); });
    wrow.appendChild(h('span', 'mtag iv', 'Travel to'));
    var wp = h('span', 'mpicks'); wrow.appendChild(wp);
    badge.textContent = root.dataset.mass || 'Mass: the same on every world.';
    // the scene: sky, ground, a scale with the kid on it, and a dial (0 to 250 pounds)
    var svg = s('svg', { viewBox: '0 0 600 240', role: 'img' }), sky = s('rect', { x: 0, y: 0, width: 600, height: 240 }), ground = s('rect', { x: 0, y: 190, width: 600, height: 50 });
    var wname = s('text', { x: 20, y: 34, 'font-size': 22, 'font-weight': 800 });
    svg.appendChild(sky); svg.appendChild(ground); svg.appendChild(wname);
    svg.appendChild(s('rect', { x: 240, y: 174, width: 120, height: 16, rx: 5, fill: '#fff', stroke: '#22304A', 'stroke-width': 2 }));
    var kid = s('g', { fill: 'none', stroke: '#22304A', 'stroke-width': 5, 'stroke-linecap': 'round' });
    kid.appendChild(s('circle', { cx: 300, cy: 86, r: 16, fill: '#F2C9A0', 'stroke-width': 3 }));
    kid.appendChild(s('path', { d: 'M300 103 L300 145 M300 116 L280 134 M300 116 L320 134 M300 145 L286 173 M300 145 L314 173' }));
    svg.appendChild(kid);
    var dial = s('g'); svg.appendChild(dial);
    dial.appendChild(s('circle', { cx: 480, cy: 100, r: 66, fill: '#fff', stroke: '#22304A', 'stroke-width': 3 }));
    function ang(w) { return -120 + 240 * Math.min(w, 250) / 250; }
    for (var w = 0; w <= 250; w += 50) {
      var a = (ang(w) - 90) * Math.PI / 180;
      dial.appendChild(s('line', { x1: 480 + 52 * Math.cos(a), y1: 100 + 52 * Math.sin(a), x2: 480 + 62 * Math.cos(a), y2: 100 + 62 * Math.sin(a), stroke: '#22304A', 'stroke-width': 2 }));
      dial.appendChild(s('text', { x: 480 + 40 * Math.cos(a), y: 104 + 40 * Math.sin(a), 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle', fill: '#5B6577' }, w));
    }
    var needle = s('line', { x1: 480, y1: 100, x2: 480, y2: 50, stroke: '#D96A4B', 'stroke-width': 4, 'stroke-linecap': 'round' });
    dial.appendChild(needle); dial.appendChild(s('circle', { cx: 480, cy: 100, r: 6, fill: '#22304A' }));
    var readout = s('text', { x: 480, y: 146, 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: '#22304A' });
    dial.appendChild(readout);
    scene.appendChild(svg);
    var cap = h('div', 'mcap', 'A drawing, not to scale. The dial counts pounds.'); scene.appendChild(cap);
    function setDial(v) { shown = v; needle.setAttribute('transform', 'rotate(' + ang(v) + ' 480 100)'); readout.textContent = Math.round(v) + ' lb'; }
    function jump(f, then) {
      var hgt = Math.min(110, 18 * f), dur = 520 * Math.sqrt(f);
      if (still || !kid.animate) { then(); return; }
      kid.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-hgt) + 'px)', offset: .5, easing: 'ease-in' }, { transform: 'translateY(0)' }], { duration: dur, easing: 'ease-out' });
      setTimeout(then, dur + 50);
    }
    function weigh(to, then) {
      if (still) { setDial(to); then(); return; }
      var from = shown, t0 = Date.now();
      (function step() {
        var k = Math.min(1, (Date.now() - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
        setDial(from + (to - from) * e);
        if (k < 1) setTimeout(step, 16); else then();
      })();
    }
    var step = h('button', 'btn make mrun', 'Step on the scale'); step.type = 'button';
    step.addEventListener('click', function () {
      if (busy) return;
      var x = st[cur], wd = worlds[cur];
      if (cur !== 0 && !x.pred) { out.className = 'mverdict'; out.textContent = 'Predict first: will the scale read more or less than on ' + home.name + '?'; return; }
      busy = true; step.disabled = true;
      weigh(wd.weight, function () { jump(wd.jump, function () { busy = false; x.ran = true; render(); }); });
    });
    function render() {
      var wd = worlds[cur], x = st[cur];
      wp.innerHTML = '';
      worlds.forEach(function (ww, i) {
        var b = h('button', 'mpick' + (i === cur ? ' on' : '') + (i && st[i].ran ? ' sdone' : ''), cap1(ww.name)); b.type = 'button';
        b.addEventListener('click', function () { if (busy) return; cur = i; if (!st[i].ran) setDial(home.weight); else setDial(ww.weight); render(); });
        wp.appendChild(b);
      });
      sky.setAttribute('fill', wd.sky); ground.setAttribute('fill', wd.ground);
      wname.setAttribute('fill', wd.dark ? '#fff' : '#22304A'); wname.textContent = 'On ' + wd.name;
      prow.innerHTML = '';
      if (cur !== 0) {
        prow.appendChild(h('span', 'mtag cv', 'Predict'));
        var ps = h('span', 'mpicks'); prow.appendChild(ps);
        [['more', 'Heavier than on ' + home.name], ['less', 'Lighter than on ' + home.name]].forEach(function (o) {
          var b = h('button', 'mpick' + (x.pred === o[0] ? ' on' : ''), o[1]); b.type = 'button';
          b.addEventListener('click', function () { if (x.ran || busy) return; x.pred = o[0]; render(); }); ps.appendChild(b);
        });
      }
      prow.appendChild(step); step.disabled = busy || (cur !== 0 && x.ran);
      if (cur === 0) { out.className = 'mverdict'; out.textContent = wd.why; }
      else if (!x.ran) { out.className = 'mverdict'; out.textContent = x.pred ? 'Now step on the scale.' : 'Predict first, then step on the scale.'; }
      else {
        var real = wd.weight > home.weight ? 'more' : 'less', ok = x.pred === real;
        out.className = 'mverdict ' + (ok ? 'good' : 'bad');
        out.textContent = (ok ? 'Your prediction matches. ' : 'Not what you predicted. ') + wd.why;
      }
      table.innerHTML = '';
      var tr = h('tr'); ['World', 'Pull compared to ' + home.name, 'Scale reads', 'Mass'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      worlds.forEach(function (ww, i) {
        var r = h('tr'), seen = st[i].ran;
        r.appendChild(h('td', null, cap1(ww.name))); r.appendChild(h('td', null, seen ? ww.pull : '…'));
        var n = h('td', 'mnum', seen ? ww.weight + ' lb' : '…'); r.appendChild(n); r.appendChild(h('td', null, seen ? 'the same' : '…'));
        table.appendChild(r);
      });
      var left = worlds.filter(function (ww, i) { return i && !st[i].ran; }).length;
      done.className = 'mverdict' + (left ? '' : ' good');
      done.textContent = left ? 'Worlds left to visit: ' + left + '.' : (root.dataset.done || 'Every world visited.');
    }
    setDial(home.weight); render();
  });
})();

/* ---- science model · farther out, slower orbit (v2.17, 2026-10-29): <div class="model" data-model="orbits" data-label="…" data-speed="150"
   data-planets='[{"name":"Mercury","days":88,"trip":"88 days","color":"#…","size":6},…]' data-note="…" data-done="…"></div>
   No photos. A top-down drawing: the Sun in the middle, the page's planets on rings in order from the Sun (rings not to
   scale; the caption says so). The student predicts which planet finishes one trip around the Sun first, then presses
   Play: every planet circles at its real relative speed (one lap = its "days") while an Earth-day counter runs. The
   first lap of each planet flashes and fills its row with the page's "trip" text. It stops when the slowest planet has
   gone around once. Teaches the guide's distance example: planets farther from the Sun orbit more slowly. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  document.querySelectorAll('.model[data-model="orbits"]').forEach(function (root) {
    var ps;
    try { ps = JSON.parse(root.dataset.planets); } catch (e) { return; }
    var speed = +root.dataset.speed || 150, end = Math.max.apply(null, ps.map(function (p) { return p.days; }));
    var fastest = ps.reduce(function (a, p, i) { return p.days < ps[a].days ? i : a; }, 0);
    var pred = null, t = 0, playing = false, last = null, laps = ps.map(function () { return 0; });
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Orbits'));
    var prow = h('div', 'mrow'), ctrl = h('div', 'mrow'), scene = h('div', 'mscene'), out = h('div', 'mverdict'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, prow, ctrl, scene, out, table, done].forEach(function (x) { root.appendChild(x); });
    prow.appendChild(h('span', 'mtag cv', 'Predict'));
    prow.appendChild(h('span', 'orq', 'Which planet finishes one trip around the Sun first?'));
    var pp = h('span', 'mpicks'); prow.appendChild(pp);
    var play = h('button', 'btn make', 'Play'), reset = h('button', 'reset', 'Start over'), clock = h('span', 'orclock');
    play.type = reset.type = 'button';
    ctrl.appendChild(play); ctrl.appendChild(reset); ctrl.appendChild(clock);
    var svg = s('svg', { viewBox: '0 0 420 420', role: 'img' });
    svg.appendChild(s('rect', { x: 0, y: 0, width: 420, height: 420, rx: 14, fill: '#1B2238' }));
    var gap = 165 / ps.length, dots = [], labels = [];
    ps.forEach(function (p, i) { svg.appendChild(s('circle', { cx: 210, cy: 210, r: 45 + gap * i, fill: 'none', stroke: '#4A5675', 'stroke-width': 1.5, 'stroke-dasharray': '3 5' })); });
    svg.appendChild(s('line', { x1: 210, y1: 10, x2: 210, y2: 186, stroke: '#F4C542', 'stroke-width': 1.5, 'stroke-dasharray': '2 4', opacity: .6 }));
    svg.appendChild(s('circle', { cx: 210, cy: 210, r: 24, fill: '#F4C542' }));
    svg.appendChild(s('text', { x: 210, y: 215, 'font-size': 12, 'font-weight': 800, 'text-anchor': 'middle', fill: '#5A4300' }, 'Sun'));
    ps.forEach(function (p) { var d = s('circle', { r: p.size || 7, fill: p.color }), l = s('text', { 'font-size': 12, 'font-weight': 700, fill: '#fff' }, p.name); svg.appendChild(d); svg.appendChild(l); dots.push(d); labels.push(l); });
    scene.appendChild(svg);
    scene.appendChild(h('div', 'mcap', root.dataset.note || 'A drawing, not to scale. Speeds are real compared with each other.'));
    function draw() {
      ps.forEach(function (p, i) {
        var r = 45 + gap * i, a = -Math.PI / 2 - 2 * Math.PI * t / p.days, x = 210 + r * Math.cos(a), y = 210 + r * Math.sin(a);
        dots[i].setAttribute('cx', x); dots[i].setAttribute('cy', y);
        var left = x < 206; labels[i].setAttribute('text-anchor', left ? 'end' : 'start');
        labels[i].setAttribute('x', x + (left ? -1 : 1) * ((p.size || 7) + 4)); labels[i].setAttribute('y', y + 4);
      });
      clock.textContent = 'Earth days passed: ' + Math.floor(t).toLocaleString('en-US') + ' (about ' + (t / 365.25).toFixed(1) + ' Earth years)';
    }
    function tick() {
      if (!playing) return;
      var now = Date.now();
      if (last !== null) t = Math.min(end, t + speed * Math.min(.25, (now - last) / 1000));
      last = now;
      var changed = false;
      ps.forEach(function (p, i) {
        var n = Math.floor(t / p.days + 1e-9);
        if (n > laps[i]) { laps[i] = n; changed = true; if (dots[i].animate) dots[i].animate([{ r: (p.size || 7) * 2.2 }, { r: p.size || 7 }], { duration: 700 }); }
      });
      draw();
      if (t >= end) { playing = false; changed = true; }
      if (changed) render();
      if (playing) setTimeout(tick, 16);
    }
    play.addEventListener('click', function () {
      if (!pred) { out.className = 'mverdict'; out.textContent = 'Predict first: tap the planet you think will finish one trip first.'; return; }
      if (t >= end) return;
      playing = !playing; last = null; render();
      if (playing) tick();
    });
    reset.addEventListener('click', function () { playing = false; t = 0; pred = null; laps = ps.map(function () { return 0; }); draw(); render(); });
    function render() {
      pp.innerHTML = '';
      ps.forEach(function (p) {
        var b = h('button', 'mpick' + (pred === p.name ? ' on' : ''), p.name); b.type = 'button';
        b.addEventListener('click', function () { if (t > 0) return; pred = p.name; render(); }); pp.appendChild(b);
      });
      play.textContent = playing ? 'Pause' : (t > 0 && t < end ? 'Keep going' : 'Play');
      play.disabled = t >= end;
      if (!laps[fastest]) { out.className = 'mverdict'; out.textContent = pred ? (playing ? 'Watch the planets go around.' : 'Now press Play.') : 'Predict first, then press Play.'; }
      else {
        var ok = pred === ps[fastest].name;
        out.className = 'mverdict ' + (ok ? 'good' : 'bad');
        out.textContent = (ok ? 'Your prediction matches. ' : 'Not what you predicted. ') + ps[fastest].name + ' finished first. It is the closest planet to the Sun.';
      }
      table.innerHTML = '';
      var tr = h('tr'); ['Planet', 'Order from the Sun', 'One trip takes', 'Trips so far'].forEach(function (x) { tr.appendChild(h('th', null, x)); }); table.appendChild(tr);
      ps.forEach(function (p, i) {
        var r = h('tr');
        r.appendChild(h('td', null, p.name)); r.appendChild(h('td', null, ['1st (closest)', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'][i] + (i === ps.length - 1 ? ' (farthest here)' : '')));
        r.appendChild(h('td', 'mnum', laps[i] ? p.trip : '…')); r.appendChild(h('td', 'mnum', laps[i])); table.appendChild(r);
      });
      var all = laps.every(function (n) { return n > 0; });
      done.className = 'mverdict' + (all ? ' good' : '');
      done.textContent = all ? (root.dataset.done || 'Every planet went around once.') : 'Planets that finished one trip: ' + laps.filter(function (n) { return n > 0; }).length + ' of ' + ps.length + '.';
    }
    draw(); render();
  });
})();

/* ---- science model · temperature lab (v2.19, 2026-10-29): <div class="model" data-model="templab" data-label="…" data-alt="…"
   data-start="…" data-runs='[{"k":"fire"|"cold","name":"…","head":"…","effects":["…",…],"at":[0.3,…],"after":"…"},…]' data-done="…"></div>
   A drawn gingerbread house (SVG, built here) with a molecule window and a thermometer. The student picks a run and the
   scene plays for a few seconds while the page's own effect lines light up, one at a time, at the "at" points. The "fire"
   run browns, caramelizes, scorches, melts, chars, smokes, and leaves ash and soot, and the molecules speed up. The "cold"
   run frosts the house and changes nothing else, and the molecules slow almost to a stop. Reset starts over from the
   decorated house. Every line shown comes from the page's data; the drawing carries no numbers. Teaches: temperature
   controls chemical change. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', DUR = 7000;
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, a, parent) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
  function set(e, a) { for (var k in a) e.setAttribute(k, a[k]); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { return clamp((t - a) / (b - a)); }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 7.3) * 43758.5453; return x - Math.floor(x); }
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  /* tone('#c27c3e', [['#6b3b17', t1], ['#231a15', t2]]): blend toward each color in turn */
  function tone(base, steps) {
    var c = rgb(base);
    steps.forEach(function (st) { var d = rgb(st[0]); c = c.map(function (v, i) { return lerp(v, d[i], st[1]); }); });
    return 'rgb(' + c.map(Math.round).join(',') + ')';
  }
  document.querySelectorAll('.model[data-model="templab"]').forEach(function (root) {
    var runs;
    try { runs = JSON.parse(root.dataset.runs); } catch (e) { return; }
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Temperature lab'));
    var row = h('div', 'mpicks'), stage = h('div', 'tlstage'), head = h('div', 'tlhead'), list = h('ul', 'tllist'), out = h('div', 'mverdict');
    [top, row, stage, head, list, out].forEach(function (x) { root.appendChild(x); });
    var svg = s('svg', { viewBox: '0 0 600 350', role: 'img', 'aria-label': root.dataset.alt || 'A decorated gingerbread house.' });
    stage.appendChild(svg);

    /* the scene, back to front */
    var sky = s('rect', { width: 600, height: 350 }, svg);
    var glow = s('rect', { width: 600, height: 350, fill: '#ff8a1f' }, svg);
    var ground = s('rect', { y: 298, width: 600, height: 52 }, svg);
    var chimney = s('rect', { x: 282, y: 100, width: 28, height: 60 }, svg);
    var walls = s('rect', { x: 110, y: 170, width: 230, height: 128, rx: 4 }, svg);
    var roof = s('polygon', { points: '92,178 225,82 358,178' }, svg);
    var door = s('path', { d: 'M200 298 L200 244 Q225 218 250 244 L250 298 Z' }, svg);
    var wins = [130, 276].map(function (x) { return s('rect', { x: x, y: 200, width: 44, height: 40, rx: 3 }, svg); });
    var icing = [
      s('path', { d: 'M96 176 L225 86 L354 176', fill: 'none', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg),
      s('path', { d: 'M114 186 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9', fill: 'none', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg),
      s('path', { d: 'M130 200 h44 v40 h-44 Z M152 200 v40 M130 220 h44 M276 200 h44 v40 h-44 Z M298 200 v40 M276 220 h44', fill: 'none', 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg),
    ];
    var choc = s('g', {}, svg), chocBar = s('rect', { x: -22, y: -12, width: 44, height: 24, rx: 2 }, choc);
    s('path', { d: 'M-7 -12 v24 M8 -12 v24 M-22 0 h44', stroke: '#3a2419', 'stroke-width': 1.5, fill: 'none' }, choc);
    var gums = [[150, 150, '#e53935'], [186, 124, '#43a047'], [222, 100, '#fdd835'], [262, 124, '#1e88e5'], [300, 150, '#8e24aa']].map(function (g) {
      return { x: g[0], y: g[1], c: g[2], el: s('path', { d: 'M-11 0 A11 11 0 0 1 11 0 Z' }, svg) };
    });
    var peps = [[152, 272], [298, 272]].map(function (p) {
      var g = s('g', {}, svg);
      return { x: p[0], y: p[1], g: g, base: s('circle', { r: 12 }, g), sw: s('path', { d: 'M0 -12 A6 6 0 0 1 0 0 A6 6 0 0 0 0 12 M-12 0 A6 6 0 0 1 0 0 A6 6 0 0 0 12 0', fill: 'none', 'stroke-width': 3 }, g) };
    });
    var cane = s('path', { d: 'M366 298 L366 226 Q366 208 381 208 Q396 208 396 224', fill: 'none', 'stroke-width': 9, 'stroke-linecap': 'round' }, svg);
    var stripe = s('path', { d: 'M366 298 L366 226 Q366 208 381 208 Q396 208 396 224', fill: 'none', 'stroke-width': 9, 'stroke-dasharray': '7 9' }, svg);
    var soot = [[150, 260, 40, 20], [300, 190, 34, 18], [190, 150, 46, 16], [255, 120, 30, 14], [320, 270, 28, 16]].map(function (o) { return s('ellipse', { cx: o[0], cy: o[1], rx: o[2], ry: o[3], fill: '#1a1512' }, svg); });
    var ash = [], flames = [], smoke = [], flakes = [], icicles = [];
    for (var i = 0; i < 22; i++) ash.push(s('ellipse', { cx: 100 + rnd(i) * 300, cy: 300 + rnd(i + 3) * 6, rx: 6 + rnd(i + 5) * 10, ry: 3 + rnd(i + 7) * 3, fill: '#a9a39b' }, svg));
    var frost = s('g', {}, svg);
    s('polygon', { points: '92,178 225,82 358,178', fill: '#ffffff' }, frost);
    s('rect', { x: 110, y: 170, width: 230, height: 128, fill: '#e8f4ff' }, frost);
    var snowcap = s('path', { d: 'M96 176 L225 86 L354 176', fill: 'none', stroke: '#ffffff', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    for (i = 0; i < 12; i++) icicles.push({ x: 104 + i * 22, el: s('polygon', { fill: '#dff1ff', stroke: '#b3d7f2', 'stroke-width': 1 }, svg) });
    for (i = 0; i < 9; i++) flames.push([s('path', { d: 'M0 0 C-22 -26 -9 -52 0 -84 C9 -52 22 -26 0 0 Z', fill: '#ff7a1a' }, svg), s('path', { d: 'M0 0 C-12 -16 -5 -32 0 -52 C5 -32 12 -16 0 0 Z', fill: '#ffd23f' }, svg)]);
    for (i = 0; i < 10; i++) smoke.push(s('circle', { fill: '#6f6a66' }, svg));
    for (i = 0; i < 34; i++) flakes.push(s('circle', { r: 2 + rnd(i + 40) * 2.5, fill: '#ffffff' }, svg));
    /* thermometer */
    s('rect', { x: 420, y: 150, width: 16, height: 140, rx: 8, fill: '#ffffff', stroke: '#8a8f96', 'stroke-width': 2 }, svg);
    var merc = s('rect', { x: 424, width: 8, rx: 4 }, svg), bulb = s('circle', { cx: 428, cy: 296, r: 13, stroke: '#8a8f96', 'stroke-width': 2 }, svg);
    /* molecule window */
    s('rect', { x: 452, y: 20, width: 134, height: 120, rx: 10, fill: '#fffdf8', 'fill-opacity': 0.94, stroke: '#8a8f96', 'stroke-width': 2 }, svg);
    var mlab = s('text', { x: 519, y: 40, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#4a4f57' }, svg); mlab.textContent = 'Molecules';
    var mols = [];
    for (i = 0; i < 12; i++) {
      var a = rnd(i + 60) * Math.PI * 2;
      mols.push({ x: 466 + rnd(i + 50) * 106, y: 54 + rnd(i + 55) * 74, vx: Math.cos(a), vy: Math.sin(a), el: s('circle', { r: 6 }, svg) });
    }

    var run = null, p = 0, playing = false, last = 0, raf = 0, seen = true, finished = {};
    function draw(now, dt) {
      var F = run && run.k === 'fire' ? p : 0, C = run && run.k === 'cold' ? p : 0;
      var brown = seg(F, 0.15, 0.55), chr = seg(F, 0.45, 0.85), melt = seg(F, 0.35, 0.65), car = seg(F, 0.28, 0.5), burnt = seg(F, 0.55, 0.85);
      set(sky, { fill: tone('#dfeaf2', [['#f3b07a', seg(F, 0, 0.3)], ['#5f5550', seg(F, 0.5, 1)], ['#b9cfe6', seg(C, 0, 0.4)], ['#94b0d0', seg(C, 0.4, 1)]]) });
      set(ground, { fill: tone('#f2f5f8', [['#5e5143', seg(F, 0.35, 0.9)], ['#ffffff', C]]) });
      var bread = tone('#c27c3e', [['#6b3b17', brown], ['#231a15', chr]]);
      [walls, chimney].forEach(function (e) { e.setAttribute('fill', bread); });
      roof.setAttribute('fill', tone('#a8652f', [['#5c3214', brown], ['#1f1712', chr]]));
      door.setAttribute('fill', tone('#7a4a24', [['#2a1a10', chr]]));
      wins.forEach(function (w) { w.setAttribute('fill', tone('#ffe08a', [['#3a2a1e', burnt]])); });
      var ice = tone('#ffffff', [['#d9b27c', seg(F, 0.2, 0.4)], ['#2b2420', seg(F, 0.4, 0.7)]]);
      icing.forEach(function (e) { e.setAttribute('stroke', ice); });
      chocBar.setAttribute('fill', tone('#5b3a29', [['#1d1410', burnt]]));
      choc.setAttribute('transform', 'translate(225 192) scale(1 ' + lerp(1, 0.55, melt) + ')');
      gums.forEach(function (g) {
        set(g.el, { fill: tone(g.c, [['#c8811f', car], ['#2a1a12', burnt]]), transform: 'translate(' + g.x + ' ' + g.y + ') scale(' + lerp(1, 1.3, melt) + ' ' + lerp(1, 0.45, melt) + ')' });
      });
      peps.forEach(function (q) {
        q.base.setAttribute('fill', tone('#ffffff', [['#c8811f', car], ['#2a1a12', burnt]]));
        q.sw.setAttribute('stroke', tone('#e53935', [['#7a3a10', car], ['#2a1a12', burnt]]));
        q.g.setAttribute('transform', 'translate(' + q.x + ' ' + (q.y + 6 * melt) + ') scale(' + lerp(1, 1.25, melt) + ' ' + lerp(1, 0.5, melt) + ')');
      });
      cane.setAttribute('stroke', tone('#ffffff', [['#c8811f', car], ['#2a1a12', burnt]]));
      stripe.setAttribute('stroke', tone('#e53935', [['#7a3a10', car], ['#2a1a12', burnt]]));
      soot.forEach(function (e, k) { e.setAttribute('opacity', 0.75 * seg(F, 0.55 + k * 0.04, 0.9)); });
      var heap = seg(F, 0.7, 1);
      ash.forEach(function (e) { e.setAttribute('opacity', heap); });
      var fl = seg(F, 0.05, 0.25) * (1 - 0.65 * seg(F, 0.8, 1));
      glow.setAttribute('opacity', 0.28 * fl);
      flames.forEach(function (f, k) {
        var x = 40 + k * 66, sy = fl * (0.8 + 0.2 * Math.sin(now / 75 + k * 1.7)) * (0.7 + 0.5 * rnd(k + 20));
        f.forEach(function (e) { e.setAttribute('transform', 'translate(' + x + ' 304) scale(' + (0.9 + 0.1 * Math.sin(now / 120 + k)) + ' ' + sy + ')'); });
      });
      var smk = seg(F, 0.3, 0.6);
      smoke.forEach(function (c, k) {
        var q = (now / 2800 + k / 10) % 1;
        set(c, { cx: (k % 2 ? 296 : 225) + Math.sin(q * 5 + k) * 20 + q * 30, cy: (k % 2 ? 96 : 120) - q * 110, r: 10 + q * 22, opacity: smk * 0.6 * (1 - q) });
      });
      frost.setAttribute('opacity', 0.22 * seg(C, 0.1, 0.8));
      snowcap.setAttribute('stroke-width', lerp(0, 16, seg(C, 0.05, 0.6)));
      snowcap.setAttribute('opacity', C > 0 ? 1 : 0);
      var il = 26 * seg(C, 0.25, 0.9);
      icicles.forEach(function (ic, k) {
        var len = il * (0.6 + 0.6 * rnd(k + 80));
        ic.el.setAttribute('points', (ic.x - 5) + ',172 ' + (ic.x + 5) + ',172 ' + ic.x + ',' + (172 + len));
        ic.el.setAttribute('opacity', len > 1 ? 1 : 0);
      });
      flakes.forEach(function (c, k) {
        var q = (now / (4200 + rnd(k) * 2400) + rnd(k + 9)) % 1;
        set(c, { cx: rnd(k + 30) * 600 + Math.sin(now / 900 + k) * 10, cy: q * 350, opacity: seg(C, 0, 0.2) });
      });
      var temp = F > 0 ? lerp(0.5, 1, seg(F, 0, 0.4)) : C > 0 ? lerp(0.5, 0.04, seg(C, 0, 0.5)) : 0.5;
      var hot = tone('#5b8fd9', [['#e5533b', temp]]);
      set(merc, { y: 290 - 132 * temp, height: 132 * temp + 4, fill: hot });
      bulb.setAttribute('fill', hot);
      var speed = F > 0 ? lerp(1, 5, seg(F, 0, 0.4)) : C > 0 ? lerp(1, 0.05, seg(C, 0, 0.5)) : 1;
      mols.forEach(function (m) {
        if (!still) {
          m.x += m.vx * speed * dt * 0.03; m.y += m.vy * speed * dt * 0.03;
          if (m.x < 466) { m.x = 466; m.vx = Math.abs(m.vx); } if (m.x > 572) { m.x = 572; m.vx = -Math.abs(m.vx); }
          if (m.y < 54) { m.y = 54; m.vy = Math.abs(m.vy); } if (m.y > 128) { m.y = 128; m.vy = -Math.abs(m.vy); }
        }
        set(m.el, { cx: m.x, cy: m.y, fill: hot });
      });
      if (run) {
        var at = run.at || run.effects.map(function (x, k) { return 0.2 + k * 0.15; });
        list.querySelectorAll('li').forEach(function (li, k) { li.classList.toggle('on', p >= at[k]); });
      }
    }
    function loop(now) {
      raf = 0;
      var dt = Math.min(64, now - last); last = now;
      if (playing) {
        p = Math.min(1, p + dt / DUR);
        if (p >= 1) { playing = false; finish(); }
      }
      draw(now, dt);
      if (seen && (playing || !still)) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function finish() {
      finished[run.k] = true;
      out.className = 'mverdict good';
      out.textContent = run.after;
      if (runs.every(function (r) { return finished[r.k]; }) && root.dataset.done) out.appendChild(h('div', 'mhint', root.dataset.done));
    }
    function start(r) {
      run = r; p = 0; playing = true;
      row.querySelectorAll('.mpick').forEach(function (b) { b.classList.toggle('on', b.dataset.k === r.k); });
      head.textContent = r.head;
      list.innerHTML = '';
      r.effects.forEach(function (t) { list.appendChild(h('li', null, t)); });
      out.className = 'mverdict'; out.textContent = 'Watch the house, the thermometer, and the molecules.';
      kick();
    }
    function reset() {
      run = null; p = 0; playing = false;
      row.querySelectorAll('.mpick').forEach(function (b) { b.classList.remove('on'); });
      head.textContent = ''; list.innerHTML = '';
      out.className = 'mverdict'; out.textContent = root.dataset.start || 'Pick a run.';
      draw(performance.now(), 0); kick();
    }
    runs.forEach(function (r) {
      var b = h('button', 'mpick', r.name); b.type = 'button'; b.dataset.k = r.k;
      b.addEventListener('click', function () { start(r); }); row.appendChild(b);
    });
    var rb = h('button', 'mpick', 'Reset'); rb.type = 'button'; rb.addEventListener('click', reset); row.appendChild(rb);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) kick(); }).observe(stage);
    reset();
  });
})();

/* ---- science model · tug-of-war net force (v2.20, 2026-10-29): <div class="model" data-model="tugwar" data-label="…"
   data-rounds='[{"name":"Round 1","left":3,"right":3,"note":"…"},…]' data-done="…"></div>
   Drawn, no photos. Each round puts a number of pullers on each side of a rope (every puller pulls with the same force;
   the caption says so). Force arrows show each side's pull. The student predicts (rope moves left, no change in motion,
   rope moves right), then taps Pull: with equal sides the rope only wobbles in place; with unequal sides the rope and both
   teams start moving and speed up toward the stronger side, and a net-force arrow appears. A log fills. Teaches the
   guide's balanced vs. unbalanced forces and net force: motion changes only when the net force is not zero. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function arrow(x1, y, len, color, label) {
    var g = s('g'), x2 = x1 + len, d = len > 0 ? 1 : -1;
    g.appendChild(s('line', { x1: x1, y1: y, x2: x2 - d * 8, y2: y, stroke: color, 'stroke-width': 7, 'stroke-linecap': 'round' }));
    g.appendChild(s('path', { d: 'M' + x2 + ' ' + y + ' L' + (x2 - d * 16) + ' ' + (y - 11) + ' L' + (x2 - d * 16) + ' ' + (y + 11) + ' Z', fill: color }));
    if (label) g.appendChild(s('text', { x: (x1 + x2) / 2, y: y - 12, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: color }, label));
    return g;
  }
  document.querySelectorAll('.model[data-model="tugwar"]').forEach(function (root) {
    var rounds;
    try { rounds = JSON.parse(root.dataset.rounds); } catch (e) { return; }
    var cur = 0, busy = false, st = rounds.map(function () { return { pred: null, ran: false }; });
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Tug-of-war'));
    var rrow = h('div', 'mrow'), prow = h('div', 'mrow'), scene = h('div', 'mscene'), out = h('div', 'mverdict'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, rrow, prow, scene, out, table, done].forEach(function (x) { root.appendChild(x); });
    rrow.appendChild(h('span', 'mtag iv', 'Round'));
    var rp = h('span', 'mpicks'); rrow.appendChild(rp);
    var svg = s('svg', { viewBox: '0 0 640 230', role: 'img' }); scene.appendChild(svg);
    scene.appendChild(h('div', 'mcap', 'A drawing. In this model, every puller pulls with the same force.'));
    var pull = h('button', 'btn make mrun', 'Pull!'); pull.type = 'button';
    pull.addEventListener('click', function () {
      if (busy || st[cur].ran) return;
      if (!st[cur].pred) { out.className = 'mverdict'; out.textContent = 'Predict first: what will the rope do?'; return; }
      busy = true; pull.disabled = true; run();
    });
    var play, net;
    function figure(x, side) {   // a puller leaning back from the rope
      var g = s('g', { fill: 'none', stroke: '#22304A', 'stroke-width': 4, 'stroke-linecap': 'round' }), lean = side === 'left' ? -1 : 1;
      g.appendChild(s('circle', { cx: x + lean * 14, cy: 92, r: 9, fill: side === 'left' ? '#F2B8A6' : '#A9DDD3', 'stroke-width': 2.5 }));
      g.appendChild(s('path', { d: 'M' + (x + lean * 12) + ' 102 L' + x + ' 140 M' + (x + lean * 4) + ' 116 L' + (x - lean * 8) + ' 124 M' + x + ' 140 L' + (x - lean * 10) + ' 176 M' + x + ' 140 L' + (x + lean * 8) + ' 176' }));
      return g;
    }
    function drawScene() {
      var r = rounds[cur];
      svg.innerHTML = '';
      svg.appendChild(s('rect', { x: 0, y: 0, width: 640, height: 230, fill: '#F4F8FB' }));
      svg.appendChild(s('rect', { x: 0, y: 176, width: 640, height: 54, fill: '#DDEBD5' }));
      svg.appendChild(s('line', { x1: 320, y1: 168, x2: 320, y2: 230, stroke: '#22304A', 'stroke-width': 2, 'stroke-dasharray': '5 5' }));
      svg.appendChild(s('text', { x: 326, y: 222, 'font-size': 11, 'font-weight': 700, fill: '#5B6577' }, 'center line'));
      play = s('g'); svg.appendChild(play);
      play.appendChild(s('line', { x1: 40, y1: 124, x2: 600, y2: 124, stroke: '#B08A55', 'stroke-width': 6, 'stroke-linecap': 'round' }));
      play.appendChild(s('path', { d: 'M320 124 L312 150 L328 150 Z', fill: '#D7263D' }));
      for (var i = 0; i < r.left; i++) play.appendChild(figure(262 - i * 42, 'left'));
      for (var j = 0; j < r.right; j++) play.appendChild(figure(378 + j * 42, 'right'));
      svg.appendChild(arrow(300, 34, -r.left * 34, '#D96A4B', 'Left pull: ' + r.left));
      svg.appendChild(arrow(340, 34, r.right * 34, '#1E8C7C', 'Right pull: ' + r.right));
      net = s('g'); svg.appendChild(net);
    }
    function showNet() {
      var r = rounds[cur], d = r.right - r.left;
      net.innerHTML = '';
      if (d === 0) net.appendChild(s('text', { x: 320, y: 70, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#7A5C9E' }, 'Net force: zero'));
      else net.appendChild(arrow(320, 70, d * 34, '#7A5C9E', 'Net force: ' + Math.abs(d) + (d > 0 ? ' to the right' : ' to the left')));
    }
    function run() {
      var r = rounds[cur], d = r.right - r.left, t0 = Date.now();
      showNet();
      (function step() {
        var t = (Date.now() - t0) / 1000, x;
        if (d === 0) x = Math.sin(t * 18) * 3 * Math.max(0, 1 - t / 1.4);
        else x = Math.max(-150, Math.min(150, 0.5 * d * 70 * t * t));
        play.setAttribute('transform', 'translate(' + x + ' 0)');
        if (t < 1.6 && (d === 0 || Math.abs(x) < 150)) setTimeout(step, 16);
        else { if (d === 0) play.setAttribute('transform', ''); busy = false; st[cur].ran = true; render(); }
      })();
    }
    function verdict(r) {
      var d = r.right - r.left, side = d > 0 ? 'right' : 'left';
      if (d === 0) return 'Left ' + r.left + ', right ' + r.right + '. The forces are equal in size and opposite in direction, so they cancel. Net force: zero. These are balanced forces, so there is no change in motion.' + (r.note ? ' ' + r.note : '');
      return 'Left ' + r.left + ', right ' + r.right + '. The ' + side + ' side pulls harder by ' + Math.abs(d) + '. Net force: ' + Math.abs(d) + ' toward the ' + side + '. These are unbalanced forces, so the rope starts moving and speeds up toward the ' + side + '.' + (r.note ? ' ' + r.note : '');
    }
    function render() {
      var r = rounds[cur], x = st[cur];
      rp.innerHTML = '';
      rounds.forEach(function (rr, i) {
        var b = h('button', 'mpick' + (i === cur ? ' on' : '') + (st[i].ran ? ' sdone' : ''), rr.name); b.type = 'button';
        b.addEventListener('click', function () { if (busy) return; cur = i; drawScene(); if (st[i].ran) { showNet(); var dd = rounds[i].right - rounds[i].left; if (dd) play.setAttribute('transform', 'translate(' + (dd > 0 ? 150 : -150) + ' 0)'); } render(); });
        rp.appendChild(b);
      });
      prow.innerHTML = '';
      prow.appendChild(h('span', 'mtag cv', 'Predict'));
      var pp = h('span', 'mpicks'); prow.appendChild(pp);
      [['left', 'Rope moves left'], ['none', 'No change in motion'], ['right', 'Rope moves right']].forEach(function (o) {
        var b = h('button', 'mpick' + (x.pred === o[0] ? ' on' : ''), o[1]); b.type = 'button';
        b.addEventListener('click', function () { if (x.ran || busy) return; x.pred = o[0]; render(); }); pp.appendChild(b);
      });
      prow.appendChild(pull); pull.disabled = busy || x.ran;
      if (!x.ran) { out.className = 'mverdict'; out.textContent = x.pred ? 'Now tap Pull!' : 'Count the pullers on each side. Predict, then tap Pull!'; }
      else {
        var d = r.right - r.left, real = d === 0 ? 'none' : (d > 0 ? 'right' : 'left'), ok = x.pred === real;
        out.className = 'mverdict ' + (ok ? 'good' : 'bad');
        out.textContent = (ok ? 'Your prediction matches. ' : 'Not what you predicted. ') + verdict(r);
      }
      table.innerHTML = '';
      var tr = h('tr'); ['Round', 'Left', 'Right', 'Net force', 'Forces', 'Motion'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      rounds.forEach(function (rr, i) {
        var row = h('tr'), seen = st[i].ran, d = rr.right - rr.left;
        row.appendChild(h('td', null, rr.name)); row.appendChild(h('td', 'mnum', rr.left)); row.appendChild(h('td', 'mnum', rr.right));
        row.appendChild(h('td', null, seen ? (d === 0 ? 'zero' : Math.abs(d) + (d > 0 ? ' right' : ' left')) : '…'));
        row.appendChild(h('td', null, seen ? (d === 0 ? 'balanced' : 'unbalanced') : '…'));
        row.appendChild(h('td', null, seen ? (d === 0 ? 'no change' : 'starts moving, speeds up') : '…'));
        table.appendChild(row);
      });
      var left = rounds.filter(function (rr, i) { return !st[i].ran; }).length;
      done.className = 'mverdict' + (left ? '' : ' good');
      done.textContent = left ? 'Rounds left to pull: ' + left + '.' : (root.dataset.done || 'Every round pulled.');
    }
    drawScene(); render();
  });
})();

/* ---- science game · tap-to-pull tug-of-war (v2.21, 2026-11-02; illustrated, animated art v2.22): <div class="model" data-model="tuggame" data-label="…" data-seconds="15"
   data-foes='[{"name":"Beach ball","kind":"object","resist":1.5,"mass":1,"draw":"ball","why":"…"},
               {"name":"Puppy","kind":"animal","pull":3,"wiggle":1.5,"mass":2,"draw":"puppy","why":"…"},…]' data-done="…"></div>
   Drawn, no photos (Jorge, 2026-11-02: "the faster they press the more force they are pulling"). The student picks an
   opponent and taps PULL (or the space bar) as fast as they can: their pull = taps in the last second (game units, not real
   measurements; the caption says so). An object only resists: while it sits still, friction matches the pull up to its
   "resist" number, so the forces stay balanced and nothing moves; past that, the net force starts it moving toward the
   student. An animal pulls back with its own changing force, so the rope can move either way. Arrows show your pull, their
   pull or friction, and the net force, with a live Balanced / Unbalanced label. Win by dragging the flag over your line
   before time runs out. Teaches: motion changes only when the net force is not zero; heavier objects need a bigger pull. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  // Illustrated cartoon opponents and player (v2.22, Jorge 2026-11-02: "not too drawn looking ... make it animated").
  // Rope end at (0,0), ground at y = 46, drawn to the right. Parts with tg-* classes move (see studio.css).
  function wedge(cx, cy, r, a0, a1) {
    var p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    return 'M' + cx + ' ' + cy + ' L' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' Z';
  }
  function art(kind, id) {
    var D = '<defs>' +
      '<radialGradient id="' + id + 'shine" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>' +
      '<linearGradient id="' + id + 'tan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2B07A"/><stop offset="1" stop-color="#B9814A"/></linearGradient>' +
      '<linearGradient id="' + id + 'bay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C08A57"/><stop offset="1" stop-color="#8A5530"/></linearGradient>' +
      '<linearGradient id="' + id + 'wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98B4E"/><stop offset="1" stop-color="#8E5A2B"/></linearGradient>' +
      '<linearGradient id="' + id + 'brick" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8643F"/><stop offset="1" stop-color="#93391D"/></linearGradient>' +
      '</defs>';
    var shadow = function (cx, rx) { return '<ellipse cx="' + cx + '" cy="47" rx="' + rx + '" ry="5" fill="#22304A" opacity=".16"/>'; };
    if (kind === 'ball') {
      var cols = ['#E63946', '#FFFFFF', '#F4C542', '#FFFFFF', '#2E86DE', '#FFFFFF'], w = '';
      for (var k = 0; k < 6; k++) w += '<path d="' + wedge(40, 12, 32, k * Math.PI / 3, (k + 1) * Math.PI / 3) + '" fill="' + cols[k] + '"/>';
      return D + shadow(40, 30) + '<path d="M0 0 C8 0 10 6 12 10" fill="none" stroke="#B08A55" stroke-width="5" stroke-linecap="round"/>' +
        '<g class="tg-spin">' + w + '<circle cx="40" cy="12" r="8" fill="#fff" stroke="#E5E5E5"/></g>' +
        '<circle cx="40" cy="12" r="32" fill="url(#' + id + 'shine)" stroke="#22304A" stroke-opacity=".35" stroke-width="1.5"/>';
    }
    if (kind === 'puppy') {
      return D + shadow(50, 38) +
        '<g class="tg-body">' +
        '<path class="tg-wag" d="M80 2 C92 -4 96 -16 92 -26 C88 -16 84 -10 76 -6 Z" fill="url(#' + id + 'tan)" stroke="#7A4E25" stroke-width="1.5"/>' +
        '<path d="M66 18 L70 44 M76 16 L82 44" stroke="#A8743F" stroke-width="7" stroke-linecap="round"/>' +
        '<ellipse cx="54" cy="8" rx="30" ry="17" fill="url(#' + id + 'tan)" stroke="#7A4E25" stroke-width="1.5"/>' +
        '<ellipse cx="40" cy="14" rx="12" ry="9" fill="#F6E3CB"/>' +
        '<path d="M34 18 L24 44 M44 20 L38 44" stroke="#B9814A" stroke-width="7" stroke-linecap="round"/>' +
        '<ellipse cx="23" cy="45" rx="6" ry="3" fill="#7A4E25"/><ellipse cx="37" cy="45" rx="6" ry="3" fill="#7A4E25"/>' +
        '<g class="tg-head"><circle cx="18" cy="-8" r="16" fill="url(#' + id + 'tan)" stroke="#7A4E25" stroke-width="1.5"/>' +
        '<ellipse cx="4" cy="-2" rx="10" ry="7.5" fill="#F6E3CB" stroke="#7A4E25" stroke-width="1"/>' +
        '<ellipse cx="-4" cy="-5" rx="4" ry="3" fill="#2B1B10"/>' +
        '<path d="M-2 4 Q4 7 9 3" fill="none" stroke="#2B1B10" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path class="tg-ear" d="M24 -22 C34 -24 38 -10 32 2 C28 -6 24 -12 22 -18 Z" fill="#8E5A2B"/>' +
        '<circle cx="12" cy="-12" r="3.2" fill="#2B1B10"/><circle cx="13" cy="-13" r="1.1" fill="#fff"/></g>' +
        '<path d="M6 4 Q12 10 20 6" fill="none" stroke="#D7263D" stroke-width="4" stroke-linecap="round"/>' +
        '</g><path d="M0 0 C3 1 5 3 7 5" fill="none" stroke="#B08A55" stroke-width="5" stroke-linecap="round"/>';
    }
    if (kind === 'horse') {
      return D + shadow(74, 56) +
        '<g class="tg-body">' +
        '<path class="tg-swish" d="M118 -26 C134 -20 140 4 132 30 C126 14 122 0 112 -14 Z" fill="#3A2210"/>' +
        '<path d="M98 4 L100 40 M110 2 L114 40" stroke="#5A3418" stroke-width="9" stroke-linecap="round"/>' +
        '<ellipse cx="74" cy="-12" rx="48" ry="25" fill="url(#' + id + 'bay)" stroke="#3A2210" stroke-width="1.5"/>' +
        '<path d="M38 4 L32 40 M52 6 L50 40" stroke="#6B3F1F" stroke-width="9" stroke-linecap="round"/>' +
        '<g fill="#2B1B10"><rect x="26" y="38" width="12" height="7" rx="2"/><rect x="44" y="38" width="12" height="7" rx="2"/><rect x="94" y="38" width="12" height="7" rx="2"/><rect x="108" y="38" width="12" height="7" rx="2"/></g>' +
        '<g class="tg-head">' +
        '<path d="M34 -22 C28 -44 32 -64 44 -74 L60 -62 C54 -48 56 -32 62 -24 Z" fill="url(#' + id + 'bay)" stroke="#3A2210" stroke-width="1.5"/>' +
        '<path d="M44 -76 C54 -62 56 -44 62 -28 L68 -32 C62 -48 60 -64 50 -78 Z" fill="#2B1B10"/>' +
        '<path d="M44 -74 C30 -78 14 -70 6 -58 C2 -50 6 -44 14 -44 C26 -46 38 -54 54 -62 Z" fill="url(#' + id + 'bay)" stroke="#3A2210" stroke-width="1.5"/>' +
        '<path d="M42 -76 L46 -90 L52 -74 Z" fill="#6B3F1F" stroke="#3A2210" stroke-width="1"/>' +
        '<circle cx="30" cy="-64" r="4" fill="#fff"/><circle cx="29.5" cy="-63.5" r="2.8" fill="#1A0F08"/><circle cx="30.5" cy="-64.5" r="1" fill="#fff"/>' +
        '<ellipse cx="10" cy="-51" rx="2.5" ry="1.8" fill="#1A0F08"/>' +
        '<path d="M14 -60 L22 -46 M12 -56 C20 -60 28 -62 34 -64" fill="none" stroke="#D7263D" stroke-width="2.5"/>' +
        '</g></g><path d="M0 0 C6 -14 12 -30 18 -46" fill="none" stroke="#B08A55" stroke-width="4" stroke-linecap="round"/>';
    }
    // sled of bricks
    var bricks = '', rows = [[8, 4, 3], [20, -14, 2], [32, -32, 1]];
    rows.forEach(function (r) { for (var b = 0; b < r[2]; b++) bricks += '<rect x="' + (r[0] + b * 30) + '" y="' + r[1] + '" width="28" height="16" rx="2" fill="url(#' + id + 'brick)" stroke="#6E2A12" stroke-width="1.2"/><path d="M' + (r[0] + b * 30 + 3) + ' ' + (r[1] + 4) + ' h22" stroke="#E08A66" stroke-width="1.2" opacity=".6"/>'; });
    return D + shadow(56, 58) +
      '<path d="M0 0 C4 10 6 22 8 30" fill="none" stroke="#B08A55" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M8 42 L112 42 M2 30 Q-2 42 12 42" fill="none" stroke="#4A5675" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M24 30 L24 42 M56 30 L56 42 M88 30 L88 42" stroke="#4A5675" stroke-width="4"/>' +
      '<rect x="4" y="20" width="108" height="11" rx="3" fill="url(#' + id + 'wood)" stroke="#5E3A1A" stroke-width="1.5"/>' +
      '<path d="M8 24 h100" stroke="#E0B07E" stroke-width="1" opacity=".7"/>' + bricks;
  }
  function kidArt() {   // a cartoon kid leaning back, hands on the rope at (195,150)
    return '<ellipse cx="170" cy="197" rx="30" ry="5" fill="#22304A" opacity=".16"/>' +
      '<g class="tg-kid">' +
      '<path d="M176 152 L152 192 M176 152 L190 192" stroke="#34508F" stroke-width="11" stroke-linecap="round"/>' +
      '<ellipse cx="148" cy="194" rx="10" ry="5" fill="#22304A"/><ellipse cx="193" cy="194" rx="10" ry="5" fill="#22304A"/>' +
      '<path d="M176 152 L158 116" stroke="#E76F51" stroke-width="22" stroke-linecap="round"/>' +
      '<path d="M162 120 L194 147 M166 128 L194 151" stroke="#F2C9A0" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M160 118 L176 136" stroke="#D45A3D" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="150" cy="98" r="15" fill="#F2C9A0" stroke="#C99A72" stroke-width="1"/>' +
      '<path d="M135 98 C134 82 150 76 162 84 C158 86 150 86 146 92 C142 90 138 94 135 98 Z" fill="#4A2E1A"/>' +
      '<circle cx="155" cy="97" r="2" fill="#22304A"/>' +
      '<path d="M152 106 L160 105" stroke="#22304A" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="195" cy="149" r="4.5" fill="#F2C9A0" stroke="#C99A72"/></g>';
  }

  document.querySelectorAll('.model[data-model="tuggame"]').forEach(function (root) {
    var foes;
    try { foes = JSON.parse(root.dataset.foes); } catch (e) { return; }
    var SECS = +root.dataset.seconds || 15, LINE = 100, cur = 0;
    var st = foes.map(function () { return { result: null, best: 0 }; });
    var game = null;   // { t, pos, v, taps: [], best, over }
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Tug-of-war challenge'));
    var frow = h('div', 'mrow'), scene = h('div', 'mscene'), bar = h('div', 'tgbar'), out = h('div', 'mverdict'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, frow, scene, bar, out, table, done].forEach(function (x) { root.appendChild(x); });
    frow.appendChild(h('span', 'mtag iv', 'Opponent'));
    var fp = h('span', 'mpicks'); frow.appendChild(fp);
    var svg = s('svg', { viewBox: '0 0 640 250', role: 'img' }); scene.appendChild(svg);
    scene.appendChild(h('div', 'mcap', 'A drawing and a game. Your pull = how many times you tapped in the last second. Game numbers, not real measurements.'));
    var pullBtn = h('button', 'btn make tgpull', 'PULL!'), status = h('span', 'tgstatus'), clock = h('span', 'tgclock');
    pullBtn.type = 'button';
    var again = h('button', 'reset', 'Try again'); again.type = 'button';
    bar.appendChild(pullBtn); bar.appendChild(status); bar.appendChild(clock); bar.appendChild(again);
    var g = {}, timer = null, uid = 'tg' + Math.random().toString(36).slice(2, 7);
    function drawScene() {
      var f = foes[cur];
      svg.innerHTML = '';
      var bg = s('g'); bg.innerHTML = '<defs><linearGradient id="' + uid + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE4F5"/><stop offset="1" stop-color="#F2F7FB"/></linearGradient></defs>' +
        '<rect width="640" height="250" fill="url(#' + uid + 'sky)"/><ellipse cx="120" cy="205" rx="260" ry="46" fill="#E2ECF4"/><ellipse cx="520" cy="210" rx="240" ry="50" fill="#DCE8F1"/>' +
        '<rect y="196" width="640" height="54" fill="#F7FAFC"/><path d="M0 196 H640" stroke="#D5E2EC" stroke-width="2"/>' +
        '<g fill="#fff" opacity=".9"><circle cx="60" cy="30" r="2"/><circle cx="230" cy="18" r="1.6"/><circle cx="470" cy="40" r="2.2"/><circle cx="590" cy="20" r="1.5"/><circle cx="380" cy="100" r="1.8"/><circle cx="120" cy="130" r="1.4"/></g>';
      svg.appendChild(bg);
      svg.appendChild(s('line', { x1: 320 - LINE, y1: 150, x2: 320 - LINE, y2: 250, stroke: '#D96A4B', 'stroke-width': 3, 'stroke-dasharray': '6 5' }));
      svg.appendChild(s('text', { x: 320 - LINE - 6, y: 244, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 800, fill: '#D96A4B' }, 'your line'));
      if (f.kind === 'animal') {
        svg.appendChild(s('line', { x1: 320 + LINE, y1: 150, x2: 320 + LINE, y2: 250, stroke: '#1E8C7C', 'stroke-width': 3, 'stroke-dasharray': '6 5' }));
        svg.appendChild(s('text', { x: 320 + LINE + 6, y: 244, 'text-anchor': 'start', 'font-size': 12, 'font-weight': 800, fill: '#1E8C7C' }, f.name.toLowerCase() + "'s line"));
      }
      g.play = s('g'); svg.appendChild(g.play);
      g.play.appendChild(s('line', { x1: 195, y1: 150, x2: 420, y2: 150, stroke: '#B08A55', 'stroke-width': 7, 'stroke-linecap': 'round' }));
      g.play.appendChild(s('line', { x1: 197, y1: 150, x2: 418, y2: 150, stroke: '#8C6A3E', 'stroke-width': 7, 'stroke-dasharray': '2 5', opacity: .55 }));
      g.play.appendChild(s('path', { d: 'M320 150 L311 178 L329 178 Z', fill: '#D7263D' }));
      var kid = s('g'); kid.innerHTML = kidArt(); g.play.appendChild(kid); g.kid = kid.querySelector('.tg-kid');
      g.play.appendChild(s('text', { x: 152, y: 72, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#22304A' }, 'YOU'));
      var foe = s('g', { transform: 'translate(420 150)' }); foe.innerHTML = art(f.draw, uid); g.play.appendChild(foe); g.spin = foe.querySelector('.tg-spin');
      svg.setAttribute('class', 'tg-' + f.draw);
      g.arrows = s('g'); svg.appendChild(g.arrows);
      place(0); arrows(0, 0, 'idle');
    }
    function arrow(x1, y, len, color, label, dir) {   // dir: 1 = right, -1 = left (keeps the label on its side at zero)
      var a = s('g'), x2 = x1 + len, d = dir || (len >= 0 ? 1 : -1);
      if (Math.abs(len) > 6) {
        a.appendChild(s('line', { x1: x1, y1: y, x2: x2 - d * 8, y2: y, stroke: color, 'stroke-width': 7, 'stroke-linecap': 'round' }));
        a.appendChild(s('path', { d: 'M' + x2 + ' ' + y + ' L' + (x2 - d * 15) + ' ' + (y - 10) + ' L' + (x2 - d * 15) + ' ' + (y + 10) + ' Z', fill: color }));
      }
      a.appendChild(s('text', { x: x1 + d * 8, y: y - 13, 'text-anchor': d > 0 ? 'start' : 'end', 'font-size': 13, 'font-weight': 800, fill: color }, label));
      return a;
    }
    function place(pos) { g.play.setAttribute('transform', 'translate(' + (-pos) + ' 0)'); if (g.spin) g.spin.setAttribute('transform', 'rotate(' + (pos * 2.2).toFixed(1) + ' 40 12)'); }
    function arrows(you, them, mode) {
      var f = foes[cur], k = 14, net = you - them;
      g.arrows.innerHTML = '';
      g.arrows.appendChild(arrow(312, 30, -you * k, '#D96A4B', 'Your pull: ' + you.toFixed(0), -1));
      g.arrows.appendChild(arrow(328, 30, them * k, '#1E8C7C', (f.kind === 'animal' ? f.name + "'s pull: " : 'Friction: ') + them.toFixed(1), 1));
      var lab = Math.abs(net) < 0.05 ? 'Net force: zero' : 'Net force: ' + Math.abs(net).toFixed(1) + (net > 0 ? ' toward you' : ' toward the ' + f.name.toLowerCase());
      g.arrows.appendChild(arrow(320, 72, -net * k, '#7A5C9E', lab));
    }
    function stop(result) {
      clearInterval(timer); timer = null; game.over = true;
      var x = st[cur]; x.best = Math.max(x.best, game.best);
      if (result === 'win' || !x.result) x.result = result;
      render();
    }
    function tick() {
      var f = foes[cur], now = Date.now(), dt = 0.05;
      game.t += dt;
      game.taps = game.taps.filter(function (t) { return now - t < 1000; });
      var you = game.taps.length, them, net, mode;
      game.best = Math.max(game.best, you);
      if (f.kind === 'object') {
        if (game.v <= 0 && you <= f.resist) { them = you; net = 0; game.v = 0; mode = 'held'; }
        else { them = f.resist; net = you - f.resist; game.v = Math.max(0, game.v + net / f.mass * dt * 3); mode = game.v > 0 ? 'moving' : 'held'; }
      } else {
        them = Math.max(0, f.pull + f.wiggle * Math.sin(game.t * 2.3) * Math.sin(game.t * 0.9 + 1));
        net = you - them; game.v = (game.v + net / f.mass * dt * 3) * 0.97; mode = Math.abs(net) < 0.4 ? 'even' : (net > 0 ? 'you' : 'them');
      }
      game.pos += game.v * dt * 40;
      place(game.pos); arrows(you, them, mode);
      if (f.kind === 'object') status.textContent = mode === 'held' ? (you ? 'Balanced: friction holds it still. Pull harder!' : 'Tap PULL to start pulling.') : (net > 0 ? 'Unbalanced: it speeds up toward you!' : 'Friction is slowing it down. Keep tapping!');
      else status.textContent = mode === 'even' ? 'Almost balanced: the rope barely moves.' : (mode === 'you' ? 'Unbalanced: the net force points toward you!' : 'Unbalanced: the ' + f.name.toLowerCase() + ' is winning. Tap faster!');
      clock.textContent = Math.max(0, SECS - game.t).toFixed(1) + ' s';
      if (game.pos >= LINE) stop('win');
      else if (game.pos <= -LINE) stop('lose');
      else if (game.t >= SECS) stop('time');
    }
    function tap() {
      if (game && game.over) return;
      if (!game) { game = { t: 0, pos: 0, v: 0, taps: [], best: 0, over: false }; timer = setInterval(tick, 50); render(); }
      game.taps.push(Date.now());
      if (g.kid) { g.kid.classList.remove('heave'); void g.kid.getBoundingClientRect(); g.kid.classList.add('heave'); }
      pullBtn.classList.remove('hit'); void pullBtn.offsetWidth; pullBtn.classList.add('hit');
    }
    pullBtn.addEventListener('click', tap);
    root.addEventListener('keydown', function (e) { if (e.code === 'Space' && e.target === pullBtn) { e.preventDefault(); if (!e.repeat) tap(); } });
    pullBtn.addEventListener('keydown', function (e) { if (e.code === 'Space') e.preventDefault(); });
    again.addEventListener('click', function () { reset(); });
    function reset() { if (timer) clearInterval(timer); timer = null; game = null; drawScene(); render(); }
    function render() {
      var f = foes[cur], x = st[cur];
      fp.innerHTML = '';
      foes.forEach(function (ff, i) {
        var b = h('button', 'mpick' + (i === cur ? ' on' : '') + (st[i].result === 'win' ? ' sdone' : ''), ff.name); b.type = 'button';
        b.addEventListener('click', function () { if (game && !game.over) return; cur = i; reset(); }); fp.appendChild(b);
      });
      pullBtn.disabled = !!(game && game.over);
      again.style.display = game && game.over ? '' : 'none';
      if (!game) { status.textContent = f.kind === 'animal' ? 'The ' + f.name.toLowerCase() + ' pulls back. Tap PULL as fast as you can!' : 'The ' + f.name.toLowerCase() + ' just sits there. Tap PULL as fast as you can!'; clock.textContent = SECS + ' s'; }
      if (!game || !game.over) { out.className = 'mverdict'; out.textContent = f.kind === 'animal' ? 'An animal pulls back. Pull harder than it does to win.' : 'An object does not pull back, but friction holds it in place. Pull harder than friction can hold.'; }
      else {
        var r = x.result === 'win' && game.pos >= LINE ? 'You won! ' : (game.pos <= -LINE ? 'The ' + f.name.toLowerCase() + ' won this time. ' : "Time's up. ");
        out.className = 'mverdict ' + (game.pos >= LINE ? 'good' : 'bad');
        out.textContent = r + 'Your fastest pull was ' + game.best + '. ' + f.why;
      }
      table.innerHTML = '';
      var tr = h('tr'); ['Opponent', 'Pulls back?', 'Your best pull', 'Result'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      foes.forEach(function (ff, i) {
        var row = h('tr'), y = st[i];
        row.appendChild(h('td', null, ff.name)); row.appendChild(h('td', null, ff.kind === 'animal' ? 'yes, an animal' : 'no, an object (friction)'));
        row.appendChild(h('td', 'mnum', y.best ? y.best : '…')); row.appendChild(h('td', null, y.result === 'win' ? 'won' : (y.result ? 'not yet' : '…')));
        table.appendChild(row);
      });
      var wins = st.filter(function (y) { return y.result === 'win'; }).length, tried = st.filter(function (y) { return y.result; }).length;
      done.className = 'mverdict' + (tried === foes.length ? ' good' : '');
      done.textContent = tried === foes.length ? (root.dataset.done || 'You took on every opponent.') : 'Opponents tried: ' + tried + ' of ' + foes.length + '. Wins: ' + wins + '.';
    }
    drawScene(); render();
  });
})();

/* ---- science model · freeze and thaw (v2.23, 2026-11-03): <div class="model" data-model="freezethaw" data-label="…" data-done="…"></div>
   Drawn and animated, no photos. A cliff of rock with one crack. Each tap of "Run one freeze and thaw" plays one cycle:
   rain fills the crack, the water freezes and the ice pushes the walls apart (the crack gets wider), then the ice melts
   and the water seeps deeper (the crack gets deeper). The student predicts first (wider, same, or closes). After the fifth
   cycle the cracked slab breaks off and gravity pulls it down the slope, where the pieces come to rest. A log fills.
   Teaches the guide's physical weathering (ice wedging: the rock breaks, it stays the same material) and that weathering
   happens in place, until erosion (here gravity) moves the pieces; the Zion rockfall photo is the real version. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
  document.querySelectorAll('.model[data-model="freezethaw"]').forEach(function (root) {
    var MAX = 5, n = 0, busy = false, pred = null, fallen = false, log = [];
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Freeze and thaw'));
    var prow = h('div', 'mrow'), scene = h('div', 'mscene'), out = h('div', 'mverdict'), table = h('table', 'mtable'), done = h('div', 'mverdict');
    [top, prow, scene, out, table, done].forEach(function (x) { root.appendChild(x); });
    var svg = s('svg', { viewBox: '0 0 640 280', role: 'img', 'aria-label': 'A drawing of a rock cliff with one crack in it' }); scene.appendChild(svg);
    scene.appendChild(h('div', 'mcap', 'A drawing. Real ice wedging takes many winters. This model speeds it up.'));
    var run = h('button', 'btn make mrun', 'Run one freeze and thaw'); run.type = 'button';
    var again = h('button', 'reset', 'Start over'); again.type = 'button';
    run.addEventListener('click', function () {
      if (busy || fallen) return;
      if (!pred) { out.className = 'mverdict'; out.textContent = 'Predict first: what will the ice do to the crack?'; return; }
      cycle();
    });
    again.addEventListener('click', function () { if (busy) return; n = 0; fallen = false; pred = null; log = []; draw(0, 0); render(); });

    // geometry: cliff face from x 120 to 470, top y 60, slope foot to the right; crack starts at x 330 on the top edge
    var CX = 330, TOP = 60, sky, slab, crack, water, ice, drops, arrows, pile, label;
    function crackPath(w, d) {   // a jagged crack, w = half-width at the top, d = depth
      var y1 = TOP + d * 0.35, y2 = TOP + d * 0.7, y3 = TOP + d;
      return 'M' + (CX - w) + ' ' + TOP + ' L' + (CX - w * 0.7 - 6) + ' ' + y1 + ' L' + (CX - w * 0.45 + 4) + ' ' + y2 + ' L' + CX + ' ' + y3 +
             ' L' + (CX + w * 0.45 + 4) + ' ' + y2 + ' L' + (CX + w * 0.7 - 6) + ' ' + y1 + ' L' + (CX + w) + ' ' + TOP + ' Z';
    }
    function fillPath(w, d, f) {  // the lower f fraction of the crack (water or ice)
      var y0 = TOP + d * (1 - f), ww = w * (0.25 + 0.75 * (1 - f));
      return 'M' + (CX - ww) + ' ' + y0 + ' L' + (CX - w * 0.45 + 4) + ' ' + Math.max(y0, TOP + d * 0.7) + ' L' + CX + ' ' + (TOP + d) + ' L' + (CX + w * 0.45 + 4) + ' ' + Math.max(y0, TOP + d * 0.7) + ' L' + (CX + ww) + ' ' + y0 + ' Z';
    }
    function widthAt(k) { return 3 + k * 3.2; }
    function depthAt(k) { return 40 + k * 26; }
    function draw(k, slabShift) {
      svg.innerHTML = '';
      var g = s('linearGradient', { id: 'ftsky', x1: 0, y1: 0, x2: 0, y2: 1 });
      g.appendChild(s('stop', { offset: 0, 'stop-color': '#CFE3F2' })); g.appendChild(s('stop', { offset: 1, 'stop-color': '#F4F8FB' }));
      var defs = s('defs'); defs.appendChild(g); svg.appendChild(defs);
      sky = s('rect', { x: 0, y: 0, width: 640, height: 280, fill: 'url(#ftsky)' }); svg.appendChild(sky);
      // ground and slope
      svg.appendChild(s('path', { d: 'M0 250 L120 250 L120 60 L470 60 L470 120 L640 250 L640 280 L0 280 Z', fill: '#8C8577' }));
      svg.appendChild(s('path', { d: 'M470 120 L640 250 L640 280 L470 280 Z', fill: '#A69C88' }));
      svg.appendChild(s('rect', { x: 0, y: 250, width: 640, height: 30, fill: '#B9AE97' }));
      // left part of the cliff (stays) and the slab right of the crack (can fall)
      svg.appendChild(s('path', { d: 'M120 250 L120 60 L' + CX + ' 60 L' + CX + ' 250 Z', fill: '#9C9A93' }));
      slab = s('g'); svg.appendChild(slab);
      slab.appendChild(s('path', { d: 'M' + CX + ' 60 L470 60 L470 ' + (TOP + depthAt(MAX) + 6) + ' L' + CX + ' ' + (TOP + depthAt(MAX) + 6) + ' Z', fill: '#A7A59E' }));
      slab.appendChild(s('path', { d: 'M' + CX + ' ' + (TOP + depthAt(MAX) + 6) + ' L470 ' + (TOP + depthAt(MAX) + 6) + ' L470 250 L' + CX + ' 250 Z', fill: '#9C9A93' }));
      // rock texture
      [[170, 110, 60], [210, 190, 80], [380, 100, 50], [400, 220, 60], [150, 225, 40]].forEach(function (l) {
        svg.appendChild(s('path', { d: 'M' + l[0] + ' ' + l[1] + ' l' + l[2] + ' 4', stroke: '#7E7C76', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.5 }));
      });
      crack = s('path', { d: crackPath(widthAt(k), depthAt(k)), fill: '#3B3A37' }); svg.appendChild(crack);
      water = s('path', { d: '', fill: '#4A90D9', opacity: 0.9 }); svg.appendChild(water);
      ice = s('path', { d: '', fill: '#EAF6FF', stroke: '#9CC9EE', 'stroke-width': 1.5 }); svg.appendChild(ice);
      drops = s('g'); svg.appendChild(drops);
      arrows = s('g'); svg.appendChild(arrows);
      pile = s('g'); svg.appendChild(pile);
      label = s('text', { x: 450, y: 40, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#22304A' }, ''); svg.appendChild(label);
      svg.appendChild(s('text', { x: 20, y: 30, 'font-size': 13, 'font-weight': 800, fill: '#5B6577' }, 'Freeze-thaw cycles: ' + k));
      if (slabShift) slab.setAttribute('transform', slabShift);
    }
    function pushArrows(w, d, on) {
      arrows.innerHTML = '';
      if (!on) return;
      var y = TOP + d * 0.45;
      [[-1, CX - w - 8], [1, CX + w + 8]].forEach(function (a) {
        var x2 = a[1] + a[0] * 26;
        arrows.appendChild(s('line', { x1: a[1], y1: y, x2: x2, y2: y, stroke: '#D96A4B', 'stroke-width': 5, 'stroke-linecap': 'round' }));
        arrows.appendChild(s('path', { d: 'M' + (x2 + a[0] * 10) + ' ' + y + ' L' + x2 + ' ' + (y - 8) + ' L' + x2 + ' ' + (y + 8) + ' Z', fill: '#D96A4B' }));
      });
    }
    function cycle() {
      busy = true; run.disabled = true;
      var k0 = n, t0 = Date.now(), T = 3600;
      var w0 = widthAt(k0), w1 = widthAt(k0 + 1), d0 = depthAt(k0), d1 = depthAt(k0 + 1);
      var rain = []; for (var i = 0; i < 14; i++) rain.push({ x: CX - 60 + Math.random() * 120, y: -Math.random() * 120 });
      (function step() {
        var t = (Date.now() - t0) / T, w = w0, d = d0;
        drops.innerHTML = '';
        if (t < 0.3) {   // rain fills the crack
          var f = t / 0.3;
          label.textContent = 'Rain fills the crack';
          rain.forEach(function (r) { var y = r.y + f * 220; if (y > 0 && y < TOP + 10) drops.appendChild(s('path', { d: 'M' + r.x + ' ' + y + ' l-2 9', stroke: '#4A90D9', 'stroke-width': 2.5, 'stroke-linecap': 'round' })); });
          water.setAttribute('d', fillPath(w, d, f * 0.85)); ice.setAttribute('d', '');
        } else if (t < 0.65) {   // the water freezes and pushes the walls apart
          var g = (t - 0.3) / 0.35; w = lerp(w0, w1, g);
          label.textContent = 'The water freezes and expands';
          crack.setAttribute('d', crackPath(w, d));
          water.setAttribute('d', g < 0.5 ? fillPath(w, d, 0.85) : '');
          ice.setAttribute('d', g >= 0.25 ? fillPath(w, d, 0.92) : '');
          pushArrows(w, d, g > 0.2);
        } else {   // the ice melts and the water seeps deeper
          var m = (t - 0.65) / 0.35; w = w1; d = lerp(d0, d1, m);
          label.textContent = 'The ice melts and water seeps deeper';
          pushArrows(w, d, false);
          crack.setAttribute('d', crackPath(w, d));
          ice.setAttribute('d', m < 0.4 ? fillPath(w, d, 0.92) : '');
          water.setAttribute('d', m >= 0.4 ? fillPath(w, d, Math.max(0, 0.6 * (1 - m))) : '');
        }
        if (t < 1) setTimeout(step, 16);
        else {
          n = k0 + 1; label.textContent = '';
          water.setAttribute('d', ''); ice.setAttribute('d', '');
          log.push(n);
          if (n >= MAX) fall(); else { busy = false; render(); }
        }
      })();
    }
    function fall() {   // the slab breaks free and gravity pulls it down the slope
      var t0 = Date.now(), T = 2200;
      label.textContent = 'The slab breaks off';
      (function step() {
        var t = Math.min(1, (Date.now() - t0) / T), e = t * t;
        var dx = e * 150, dy = e * 120, rot = e * 38;
        slab.setAttribute('transform', 'translate(' + dx + ' ' + dy + ') rotate(' + rot + ' 470 ' + (TOP + depthAt(MAX)) + ')');
        if (t > 0.35) label.textContent = 'Gravity pulls it downhill';
        if (t < 1) setTimeout(step, 16);
        else {
          slab.setAttribute('transform', 'translate(150 120) rotate(38 470 ' + (TOP + depthAt(MAX)) + ')');
          slab.setAttribute('opacity', '0');
          pile.innerHTML = '';
          [[520, 236, 34, 22, 12], [566, 240, 26, 18, -18], [598, 246, 20, 13, 25], [492, 244, 18, 12, -8], [548, 250, 14, 9, 40]].forEach(function (p) {
            pile.appendChild(s('rect', { x: p[0] - p[2] / 2, y: p[1] - p[3] / 2, width: p[2], height: p[3], rx: 4, fill: '#A7A59E', stroke: '#7E7C76', 'stroke-width': 2, transform: 'rotate(' + p[4] + ' ' + p[0] + ' ' + p[1] + ')' }));
          });
          label.textContent = 'The pieces come to rest';
          fallen = true; busy = false; render();
        }
      })();
    }
    function render() {
      prow.innerHTML = '';
      prow.appendChild(h('span', 'mtag cv', 'Predict'));
      var pp = h('span', 'mpicks'); prow.appendChild(pp);
      [['wider', 'The crack gets wider'], ['same', 'The crack stays the same'], ['closes', 'The crack closes up']].forEach(function (o) {
        var b = h('button', 'mpick' + (pred === o[0] ? ' on' : ''), o[1]); b.type = 'button';
        b.addEventListener('click', function () { if (busy || n > 0) return; pred = o[0]; render(); }); pp.appendChild(b);
      });
      prow.appendChild(run); prow.appendChild(again);
      run.disabled = busy || fallen;
      if (n === 0) { out.className = 'mverdict'; out.textContent = pred ? 'Now run one freeze and thaw, and watch the crack.' : 'Water gets into the crack. Predict what the ice will do, then run one cycle.'; }
      else if (!fallen) {
        var ok = pred === 'wider';
        out.className = 'mverdict ' + (ok ? 'good' : 'bad');
        out.textContent = (n === 1 ? (ok ? 'Your prediction matches. ' : 'Not what you predicted. ') : '') + 'Water expands when it freezes, so the ice pushed the walls of the crack apart. The crack got wider. When the ice melted, water seeped deeper. The rock is breaking, but it is still the same rock, and it has not moved. Run another cycle.';
      } else {
        out.className = 'mverdict good';
        out.textContent = 'After ' + MAX + ' cycles the crack went all the way through, and the slab broke off. Ice wedging is physical weathering: it broke the rock, and the pieces are still the same rock. Then gravity moved the pieces downhill. That is erosion. Where they stopped, at the bottom of the slope, they were deposited.';
      }
      table.innerHTML = '';
      var tr = h('tr'); ['Cycle', 'What the water did', 'The crack'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
      for (var i = 1; i <= MAX; i++) {
        var row = h('tr'), seen = i <= n;
        row.appendChild(h('td', 'mnum', i));
        row.appendChild(h('td', null, seen ? 'filled the crack, froze, melted' : '…'));
        row.appendChild(h('td', null, seen ? (i === MAX ? 'broke through: the slab fell' : 'wider and deeper') : '…'));
        table.appendChild(row);
      }
      done.className = 'mverdict' + (fallen ? ' good' : '');
      done.textContent = fallen ? (root.dataset.done || 'The rock broke, then moved.') : 'Cycles left until something happens: ' + (MAX - n) + '.';
    }
    draw(0, 0); render();
  });
})();

/* ---- science model · plan a rock's journey (v2.23, 2026-11-03): <div class="model" data-model="rockjourney" data-label="…" data-done="…"></div>
   Drawn and animated cartoon landscape: a mountain with a glacier, a river running to a delta, sand dunes, a beach, the
   sea and its floor. The student names a rock and picks a personality, then makes three choices in order: a weathering
   type (physical: ice wedging, plant roots, abrasion; chemical: acid rain, oxidation, dissolution), a force of erosion
   (water, wind, ice, gravity), and a place where the sediment is deposited (only the places that force can reach are
   offered, with the reason). Go plays the journey: the rock weathers in place, a piece breaks off, the force carries it,
   and it settles. A journey summary lists the vocabulary words used; a log keeps every journey.
   Teaches the guide's order (weathering, then erosion, then deposition; weathering does not move the pieces), physical vs.
   chemical weathering, and the four forces of erosion; doubles as the plan for the week's A Rock's Journey story. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  var KEY = (document.body.dataset.lessonKey || location.pathname) + '::rockjourney::';
  function save(k, v) { try { localStorage.setItem(KEY + k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }
  var WEATHER = [
    { id: 'ice', name: 'Ice wedging', kind: 'physical', words: [], what: 'water froze in a crack and split me apart' },
    { id: 'roots', name: 'Plant roots', kind: 'physical', words: [], what: 'a plant root grew into my crack and pried me apart' },
    { id: 'abrasion', name: 'Abrasion', kind: 'physical', words: ['abrasion'], what: 'wind-blown sand rubbed and scraped me, an action called abrasion' },
    { id: 'acid', name: 'Acid rain', kind: 'chemical', words: ['acid rain'], what: 'acid rain slowly ate away at my minerals' },
    { id: 'rust', name: 'Oxidation (rust)', kind: 'chemical', words: [], what: 'the iron in me rusted, turned orange, and crumbled' },
    { id: 'dissolve', name: 'Dissolution', kind: 'chemical', words: [], what: 'rainwater slowly dissolved part of me' }
  ];
  var FORCE = [
    { id: 'water', name: 'Water', words: [], what: 'a river carried me downstream', to: ['valley', 'delta', 'beach', 'ocean'] },
    { id: 'wind', name: 'Wind', words: [], what: 'the wind lifted my sandy grains and blew them away', to: ['dune', 'beach'], why: 'Wind can only carry small, light grains, and it drops them on land where it slows down.' },
    { id: 'ice', name: 'Ice (a glacier)', words: ['glacier'], what: 'a glacier dragged me slowly down the mountain', to: ['valley'], why: 'A glacier moves downhill and drops its rock where the ice melts, in the valley below.' },
    { id: 'gravity', name: 'Gravity', words: ['gravity'], what: 'gravity pulled me tumbling down the slope', to: ['valley'], why: 'Gravity pulls rock straight downhill, so it lands at the bottom of the slope, in the valley.' }
  ];
  var PLACE = {
    valley: { name: 'Valley', x: 262, y: 236, what: 'in the valley at the foot of the mountain' },
    dune: { name: 'Desert dune', x: 404, y: 222, what: 'on top of a sand dune' },
    delta: { name: 'River delta', x: 498, y: 246, what: 'in the river delta, where the river slows down at the sea', words: ['delta'] },
    beach: { name: 'Beach', x: 540, y: 236, what: 'on the beach' },
    ocean: { name: 'Ocean floor', x: 600, y: 300, what: 'on the ocean floor' }
  };
  var PERSON = ['brave', 'grumpy', 'curious', 'patient', 'adventurous'];
  var START = { x: 128, y: 92 };
  function path(force, place) {   // points the broken piece follows
    var P = PLACE[place];
    if (force === 'water') {
      var p = [[150, 120], [178, 150], [206, 186], [236, 222], [262, 238]];
      if (place === 'valley') return p;
      p = p.concat([[320, 246], [380, 248], [440, 247], [498, 246]]);
      if (place === 'delta') return p;
      if (place === 'beach') return p.concat([[520, 241], [540, 236]]);
      return p.concat([[530, 258], [560, 280], [600, 300]]);
    }
    if (force === 'wind') {
      var w = [[170, 70], [230, 60], [300, 80], [360, 120], [400, 170], [404, 222]];
      if (place === 'dune') return w;
      return [[170, 70], [250, 54], [340, 64], [430, 100], [500, 160], [540, 236]];
    }
    if (force === 'ice') return [[146, 104], [164, 126], [184, 152], [206, 182], [232, 214], [262, 236]];
    return [[150, 112], [172, 140], [196, 172], [218, 196], [240, 222], [262, 236]];   // gravity
  }
  document.querySelectorAll('.model[data-model="rockjourney"]').forEach(function (root) {
    var pick = { w: null, f: null, p: null }, busy = false, journeys = [];
    var name = load('name') || '', person = load('person') || '';
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || "Plan a rock's journey"));
    var nrow = h('div', 'mrow'), prow = h('div', 'mrow'), wrow = h('div', 'mrow'), frow = h('div', 'mrow'), drow = h('div', 'mrow'), arow = h('div', 'mrow');
    var scene = h('div', 'mscene'), out = h('div', 'mverdict'), sum = h('div', 'mverdict'), table = h('table', 'mtable');
    [top, nrow, prow, wrow, frow, drow, arow, scene, out, sum, table].forEach(function (x) { root.appendChild(x); });
    var svg = s('svg', { viewBox: '0 0 640 320', role: 'img', 'aria-label': 'A drawing of a landscape: a mountain with a glacier, a river, a valley, sand dunes, a river delta, a beach, and the sea' }); scene.appendChild(svg);
    scene.appendChild(h('div', 'mcap', 'A drawing. A real journey like this can take thousands of years or more.'));
    // name and personality
    nrow.appendChild(h('span', 'mtag iv', 'Your rock'));
    var nin = h('input', 'mfield'); nin.type = 'text'; nin.maxLength = 18; nin.placeholder = 'Name your rock'; nin.value = name; nin.setAttribute('aria-label', 'Name your rock');
    nin.addEventListener('input', function () { name = nin.value.trim(); save('name', name); drawRock(); renderSummary(); });
    nrow.appendChild(nin);
    var go = h('button', 'btn make mrun', 'Go!'); go.type = 'button';
    var again = h('button', 'reset', 'New journey'); again.type = 'button';
    go.addEventListener('click', function () {
      if (busy) return;
      if (!pick.w || !pick.f || !pick.p) { out.className = 'mverdict bad'; out.textContent = !pick.w ? 'Step 1 first: how does your rock get broken down?' : (!pick.f ? 'Step 2: what moves the broken piece?' : 'Step 3: where does the piece end up?'); return; }
      busy = true; render(); play();
    });
    again.addEventListener('click', function () { if (busy) return; pick = { w: null, f: null, p: null }; drawScene(); render(); });

    var rockG, piece, fx;
    function rockColor() { var w = pick.w; return w === 'rust' ? '#C2703D' : (w === 'acid' || w === 'dissolve' ? '#B9B4A8' : '#A39E93'); }
    function face(g, x, y, r) {
      g.appendChild(s('circle', { cx: x - r * 0.35, cy: y - r * 0.15, r: Math.max(1.6, r * 0.13), fill: '#22304A' }));
      g.appendChild(s('circle', { cx: x + r * 0.35, cy: y - r * 0.15, r: Math.max(1.6, r * 0.13), fill: '#22304A' }));
      var mood = person === 'grumpy' ? 'M' + (x - r * 0.3) + ' ' + (y + r * 0.42) + ' Q' + x + ' ' + (y + r * 0.2) + ' ' + (x + r * 0.3) + ' ' + (y + r * 0.42)
                                     : 'M' + (x - r * 0.3) + ' ' + (y + r * 0.25) + ' Q' + x + ' ' + (y + r * 0.5) + ' ' + (x + r * 0.3) + ' ' + (y + r * 0.25);
      g.appendChild(s('path', { d: mood, fill: 'none', stroke: '#22304A', 'stroke-width': Math.max(1.5, r * 0.09), 'stroke-linecap': 'round' }));
    }
    function blob(x, y, r, fill) {
      return s('path', { d: 'M' + (x - r) + ' ' + (y + r * 0.2) + ' Q' + (x - r) + ' ' + (y - r * 0.9) + ' ' + (x - r * 0.1) + ' ' + (y - r) + ' Q' + (x + r * 1.05) + ' ' + (y - r * 0.95) + ' ' + (x + r) + ' ' + (y + r * 0.1) +
                       ' Q' + (x + r * 0.9) + ' ' + (y + r * 0.85) + ' ' + x + ' ' + (y + r * 0.8) + ' Q' + (x - r * 0.95) + ' ' + (y + r * 0.85) + ' ' + (x - r) + ' ' + (y + r * 0.2) + ' Z', fill: fill, stroke: '#6E695F', 'stroke-width': 2.5 });
    }
    function drawRock() {
      if (!rockG) return;
      rockG.innerHTML = '';
      rockG.appendChild(blob(START.x, START.y, 24, rockColor()));
      face(rockG, START.x, START.y, 24);
      rockG.appendChild(s('text', { x: START.x, y: START.y - 32, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#22304A' }, name || 'your rock'));
    }
    function drawScene() {
      svg.innerHTML = '';
      var defs = s('defs');
      var sky = s('linearGradient', { id: 'rjsky', x1: 0, y1: 0, x2: 0, y2: 1 });
      sky.appendChild(s('stop', { offset: 0, 'stop-color': '#BFDDF2' })); sky.appendChild(s('stop', { offset: 1, 'stop-color': '#EEF6FB' }));
      var sea = s('linearGradient', { id: 'rjsea', x1: 0, y1: 0, x2: 0, y2: 1 });
      sea.appendChild(s('stop', { offset: 0, 'stop-color': '#5DA9DE' })); sea.appendChild(s('stop', { offset: 1, 'stop-color': '#245E92' }));
      defs.appendChild(sky); defs.appendChild(sea); svg.appendChild(defs);
      svg.appendChild(s('rect', { x: 0, y: 0, width: 640, height: 320, fill: 'url(#rjsky)' }));
      svg.appendChild(s('circle', { cx: 590, cy: 44, r: 20, fill: '#F6C744' }));
      // sea and its floor
      svg.appendChild(s('path', { d: 'M500 250 Q560 246 640 244 L640 320 L500 320 Z', fill: 'url(#rjsea)' }));
      svg.appendChild(s('path', { d: 'M520 300 Q580 292 640 296 L640 320 L520 320 Z', fill: '#C9B48A' }));
      // land
      svg.appendChild(s('path', { d: 'M0 320 L0 240 L300 242 Q400 248 470 246 L520 252 L520 320 Z', fill: '#9BC48A' }));
      // mountain with glacier
      svg.appendChild(s('path', { d: 'M0 250 L40 150 L110 60 L150 80 L200 150 L270 245 Z', fill: '#8E8A80' }));
      svg.appendChild(s('path', { d: 'M110 60 L150 80 L170 108 L150 104 L132 120 L118 98 L96 110 L82 98 Z', fill: '#FFFFFF', stroke: '#CFE3F2', 'stroke-width': 2 }));
      svg.appendChild(s('path', { d: 'M132 120 L150 104 L168 126 L196 164 L226 206 L212 210 L186 176 L160 140 Z', fill: '#E8F4FC', stroke: '#B9D8EE', 'stroke-width': 2, opacity: 0.95 }));
      // river from the mountain to the delta
      svg.appendChild(s('path', { d: 'M150 118 Q190 170 236 222 Q262 244 320 247 L440 247 Q480 247 500 250', fill: 'none', stroke: '#5DA9DE', 'stroke-width': 7, 'stroke-linecap': 'round' }));
      // delta fan
      svg.appendChild(s('path', { d: 'M482 246 L520 238 L528 252 L520 266 Z', fill: '#CDBE8F' }));
      [[500, 248, 524, 242], [500, 249, 528, 252], [500, 250, 522, 262]].forEach(function (c) { svg.appendChild(s('path', { d: 'M' + c[0] + ' ' + c[1] + ' L' + c[2] + ' ' + c[3], stroke: '#5DA9DE', 'stroke-width': 2.5 })); });
      // beach
      svg.appendChild(s('path', { d: 'M520 236 Q545 232 580 238 L600 245 L528 250 Z', fill: '#EED9A4' }));
      // dunes
      svg.appendChild(s('path', { d: 'M340 243 Q370 214 404 226 Q430 208 462 243 Z', fill: '#E6C27E' }));
      svg.appendChild(s('path', { d: 'M372 226 Q392 216 404 226', fill: 'none', stroke: '#C9A05A', 'stroke-width': 2 }));
      // labels
      [['Valley', 262, 268], ['Dunes', 404, 205], ['Delta', 500, 278], ['Beach', 560, 228], ['Ocean floor', 590, 314], ['Glacier', 186, 112]].forEach(function (l) {
        svg.appendChild(s('text', { x: l[1], y: l[2], 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#22304A', opacity: 0.75 }, l[0]));
      });
      fx = s('g'); svg.appendChild(fx);
      rockG = s('g'); svg.appendChild(rockG);
      piece = s('g'); svg.appendChild(piece);
      drawRock();
    }
    function pieceAt(x, y, r) {
      piece.innerHTML = '';
      piece.appendChild(blob(x, y, r, rockColor()));
      face(piece, x, y, r);
    }
    function weatherFx(t) {   // t from 0 to 1: the rock breaks down in place
      fx.innerHTML = '';
      var x = START.x, y = START.y, w = pick.w;
      if (w === 'ice') {
        fx.appendChild(s('path', { d: 'M' + (x + 2) + ' ' + (y - 24) + ' L' + (x + 6 + t * 3) + ' ' + (y - 6) + ' L' + (x + 2) + ' ' + (y + 8 * t), stroke: t > 0.5 ? '#EAF6FF' : '#4A90D9', 'stroke-width': 3 + t * 4, 'stroke-linecap': 'round' }));
      } else if (w === 'roots') {
        fx.appendChild(s('path', { d: 'M' + (x + 4) + ' ' + (y - 24) + ' q2 ' + (-10 * t) + ' ' + (-4) + ' ' + (-18 * t), stroke: '#3E8E4E', 'stroke-width': 3, fill: 'none' }));
        if (t > 0.3) fx.appendChild(s('ellipse', { cx: x - 2, cy: y - 24 - 18 * t, rx: 7 * t, ry: 4 * t, fill: '#5DBB63' }));
        fx.appendChild(s('path', { d: 'M' + (x + 4) + ' ' + (y - 22) + ' L' + (x + 6) + ' ' + (y - 22 + 34 * t), stroke: '#6B4E2E', 'stroke-width': 2 + 2 * t }));
      } else if (w === 'abrasion') {
        for (var i = 0; i < 10; i++) { var gx = x - 70 + ((t * 140 + i * 17) % 70); fx.appendChild(s('circle', { cx: gx, cy: y - 14 + (i % 5) * 7, r: 1.8, fill: '#C9A05A' })); }
      } else {   // chemical: rain or color change
        if (w !== 'rust') for (var j = 0; j < 8; j++) { var ry = (t * 160 + j * 23) % 70; fx.appendChild(s('path', { d: 'M' + (x - 24 + j * 7) + ' ' + (y - 70 + ry) + ' l-2 7', stroke: w === 'acid' ? '#7FBF5A' : '#4A90D9', 'stroke-width': 2.5, 'stroke-linecap': 'round' })); }
        if (w === 'rust') { for (var k = 0; k < 6; k++) fx.appendChild(s('circle', { cx: x - 14 + k * 6, cy: y - 6 + (k % 3) * 7, r: 2 + 4 * t, fill: '#C2703D', opacity: 0.8 })); }
      }
      if (t > 0.85) fx.appendChild(s('path', { d: 'M' + (x + 4) + ' ' + (y - 24) + ' L' + (x + 10) + ' ' + y + ' L' + (x + 4) + ' ' + (y + 20), stroke: '#3B3A37', 'stroke-width': 3, fill: 'none' }));
    }
    function forceFx(i, x, y) {
      var f = pick.f;
      if (f === 'wind') { fx.innerHTML = ''; [0, 1, 2].forEach(function (k) { fx.appendChild(s('path', { d: 'M' + (x - 60 - k * 10) + ' ' + (y - 8 + k * 9) + ' q20 -8 40 0', fill: 'none', stroke: '#7DA9C9', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0.8 })); }); }
      else if (f === 'gravity') { fx.innerHTML = ''; if (i % 6 < 3) fx.appendChild(s('circle', { cx: x - 8, cy: y + 8, r: 6, fill: '#C9BFA9', opacity: 0.7 })); }
      else if (f === 'water') { fx.innerHTML = ''; fx.appendChild(s('ellipse', { cx: x, cy: y + 6, rx: 14, ry: 4, fill: '#8CC4EC', opacity: 0.8 })); }
      else { fx.innerHTML = ''; }
    }
    function play() {
      var t0 = Date.now(), TW = 2200;
      out.className = 'mverdict'; out.textContent = 'Weathering: ' + WEATHER.filter(function (w) { return w.id === pick.w; })[0].name.toLowerCase() + '. The rock breaks down right where it is.';
      (function wstep() {
        var t = Math.min(1, (Date.now() - t0) / TW);
        weatherFx(t);
        if (pick.w === 'dissolve' || pick.w === 'acid') { rockG.setAttribute('transform', 'translate(' + START.x + ' ' + START.y + ') scale(' + (1 - 0.15 * t) + ') translate(' + (-START.x) + ' ' + (-START.y) + ')'); }
        if (t < 1) setTimeout(wstep, 16);
        else travel();
      })();
    }
    function travel() {
      var pts = [[START.x + 10, START.y + 4]].concat(path(pick.f, pick.p)), seg = [], total = 0;
      for (var i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
      var speed = pick.f === 'ice' ? 0.05 : (pick.f === 'gravity' ? 0.22 : 0.14), t0 = Date.now(), n = 0;
      var F = FORCE.filter(function (f) { return f.id === pick.f; })[0];
      out.textContent = 'Erosion: ' + F.name.toLowerCase() + ' carries the broken piece away. Now it is sediment.';
      (function step() {
        var dist = (Date.now() - t0) * speed, x = pts[pts.length - 1][0], y = pts[pts.length - 1][1];
        if (dist < total) {
          var acc = 0;
          for (var j = 0; j < seg.length; j++) {
            if (acc + seg[j] >= dist) { var u = (dist - acc) / seg[j]; x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u; y = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * u; break; }
            acc += seg[j];
          }
          if (pick.f === 'gravity') y -= Math.abs(Math.sin(dist / 14)) * 8;
        }
        pieceAt(x, y, 10); forceFx(n++, x, y);
        if (dist < total) setTimeout(step, 16);
        else settle();
      })();
    }
    function settle() {
      fx.innerHTML = '';
      var P = PLACE[pick.p];
      out.className = 'mverdict good';
      out.textContent = 'Deposition: the force slowed down and dropped the piece ' + P.what + '. It builds up the land there.';
      journeys.push({ w: pick.w, f: pick.f, p: pick.p });
      busy = false; render();
    }
    function wordsUsed() {
      var set = { weathering: 1, erosion: 1, deposition: 1, sediment: 1 };
      var W = WEATHER.filter(function (w) { return w.id === pick.w; })[0], F = FORCE.filter(function (f) { return f.id === pick.f; })[0], P = PLACE[pick.p];
      (W.words || []).concat(F.words || [], (P && P.words) || []).forEach(function (w) { set[w] = 1; });
      if (pick.f === 'gravity') set.gravity = 1;
      return Object.keys(set);
    }
    function renderSummary() {
      if (!pick.w || !pick.f || !pick.p || busy) { sum.style.display = 'none'; return; }
      var W = WEATHER.filter(function (w) { return w.id === pick.w; })[0], F = FORCE.filter(function (f) { return f.id === pick.f; })[0], P = PLACE[pick.p];
      var who = name || 'Your rock';
      sum.style.display = '';
      sum.className = 'mverdict good';
      sum.innerHTML = '';
      sum.appendChild(h('strong', null, who + "'s journey" + (person ? ' (a ' + person + ' rock)' : '') + ': '));
      sum.appendChild(document.createTextNode('Weathering (' + W.kind + '): ' + W.what + '. Erosion: ' + F.what + '. Deposition: I settled ' + P.what + '. '));
      var wu = wordsUsed();
      sum.appendChild(h('em', null, 'Vocabulary words this plan gives you: ' + wu.join(', ') + ' (' + wu.length + '). Your story needs at least 5, underlined.'));
    }
    function row(r, tag, cls, opts, sel, onPick, enabledFn) {
      r.innerHTML = '';
      r.appendChild(h('span', 'mtag ' + cls, tag));
      var pp = h('span', 'mpicks'); r.appendChild(pp);
      opts.forEach(function (o) {
        var ok = enabledFn ? enabledFn(o) : true;
        var b = h('button', 'mpick' + (sel === o.id ? ' on' : ''), o.name); b.type = 'button'; b.disabled = !ok || busy;
        if (!ok) b.style.opacity = '0.45';
        b.addEventListener('click', function () { if (busy) return; onPick(o.id); }); pp.appendChild(b);
      });
    }
    function render() {
      prow.innerHTML = '';
      prow.appendChild(h('span', 'mtag cv', 'Personality'));
      var pp = h('span', 'mpicks'); prow.appendChild(pp);
      PERSON.forEach(function (p) {
        var b = h('button', 'mpick' + (person === p ? ' on' : ''), p); b.type = 'button';
        b.addEventListener('click', function () { if (busy) return; person = p; save('person', p); drawRock(); render(); }); pp.appendChild(b);
      });
      row(wrow, '1 · Weathering', 'iv', WEATHER.map(function (w) { return { id: w.id, name: w.name + ' · ' + w.kind }; }), pick.w, function (id) { pick.w = id; drawScene(); render(); });
      row(frow, '2 · Erosion', 'dv', FORCE, pick.f, function (id) { pick.f = id; if (pick.p && FORCE.filter(function (f) { return f.id === id; })[0].to.indexOf(pick.p) < 0) pick.p = null; render(); }, function () { return !!pick.w; });
      var F = FORCE.filter(function (f) { return f.id === pick.f; })[0];
      row(drow, '3 · Deposition', 'cv', Object.keys(PLACE).map(function (k) { return { id: k, name: PLACE[k].name }; }), pick.p, function (id) { pick.p = id; render(); }, function (o) { return !!F && F.to.indexOf(o.id) >= 0; });
      arow.innerHTML = ''; arow.appendChild(go); arow.appendChild(again); go.disabled = busy;
      if (!busy) {
        out.className = 'mverdict';
        if (!pick.w) out.textContent = 'Name your rock and pick a personality. Then step 1: how does your rock get broken down?';
        else if (!pick.f) {
          var W = WEATHER.filter(function (w) { return w.id === pick.w; })[0];
          out.textContent = W.name + ' is ' + W.kind + ' weathering: ' + (W.kind === 'physical' ? 'the rock breaks into smaller pieces, but it stays the same material.' : 'it changes what the rock is made of.') + ' Weathering happens right where the rock is. Step 2: what moves the broken piece?';
        }
        else if (!pick.p) out.textContent = (F.why || 'Moving water can carry sediment a long way: to a valley, a delta, a beach, or out to the ocean floor.') + ' Step 3: where does the piece end up?';
        else if (!journeys.length || journeys[journeys.length - 1].p !== pick.p || journeys[journeys.length - 1].f !== pick.f || journeys[journeys.length - 1].w !== pick.w) out.textContent = 'Your plan is ready. Tap Go! and watch the journey.';
      }
      renderSummary();
      table.innerHTML = '';
      if (journeys.length) {
        var tr = h('tr'); ['#', 'Weathering', 'Erosion', 'Deposition'].forEach(function (t) { tr.appendChild(h('th', null, t)); }); table.appendChild(tr);
        journeys.forEach(function (j, i) {
          var r2 = h('tr');
          r2.appendChild(h('td', 'mnum', i + 1));
          var W2 = WEATHER.filter(function (w) { return w.id === j.w; })[0];
          r2.appendChild(h('td', null, W2.name + ' (' + W2.kind + ')'));
          r2.appendChild(h('td', null, FORCE.filter(function (f) { return f.id === j.f; })[0].name));
          r2.appendChild(h('td', null, PLACE[j.p].name));
          table.appendChild(r2);
        });
        if (journeys.length >= 2 && root.dataset.done) { var dr = h('tr'); var td = h('td', null, root.dataset.done); td.colSpan = 4; dr.appendChild(td); table.appendChild(dr); }
      }
    }
    drawScene(); render();
  });
})();

/* ---- science model · light lab (v2.24, 2026-11-03): <div class="model" data-model="lightlab" data-label="…" data-alt="…"
   data-start="…" data-runs='[{"k":"…","name":"…","kind":"orbit"|"trip","from":"earth"|"sun"|"star"|"galaxy","to":"earth"|"star",
   "fromName":"…","toName":"…","laps":7,"clock":"…","stamp":"…","ship":"…","head":"…","lines":["…",…],"at":[0.2,…],"after":"…"},…]' data-done="…"></div>
   Drawn, no photos, no numbers of its own: a dark sky with twinkling stars. An "orbit" run sends one flash of light around a
   cartoon Earth `laps` times (the page's "one second", slowed down) with a trip counter. A "trip" run sends a flash from one
   object to another (Sun, Earth, a nearby star, a spiral galaxy) and, when `ship` is set, launches a small spacecraft on the
   same trip that barely leaves home by the time the light arrives. A light-travel-time bar fills and then shows the run's
   `clock` label; the page's own lines light up at the `at` points; on arrival a stamp shows `stamp`. Every word and number
   shown comes from the page's data. Teaches the Week 1 guide: light is fast but takes time, light travel time means seeing
   the past, and spacecraft are far slower than light. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', DUR = 7000, W = 600, H = 340;
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, a, parent) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
  function set(e, a) { for (var k in a) e.setAttribute(k, a[k]); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 7.3) * 43758.5453; return x - Math.floor(x); }
  var uid = 0;
  /* cartoon objects, drawn around (0,0) */
  function earth(g, r) {
    s('circle', { r: r + 6, fill: '#4fa3ff', opacity: 0.18 }, g);
    s('circle', { r: r, fill: '#2f7fd8' }, g);
    s('path', { d: 'M' + (-r * 0.55) + ' ' + (-r * 0.35) + ' q' + r * 0.3 + ' ' + (-r * 0.35) + ' ' + r * 0.6 + ' ' + (-r * 0.05) + ' q' + r * 0.2 + ' ' + r * 0.35 + ' ' + (-r * 0.15) + ' ' + r * 0.55 + ' q' + (-r * 0.35) + ' ' + r * 0.1 + ' ' + (-r * 0.45) + ' ' + (-r * 0.5) + ' Z', fill: '#4caf50' }, g);
    s('path', { d: 'M' + r * 0.2 + ' ' + r * 0.25 + ' q' + r * 0.35 + ' ' + (-r * 0.1) + ' ' + r * 0.5 + ' ' + r * 0.2 + ' q' + (-r * 0.1) + ' ' + r * 0.3 + ' ' + (-r * 0.4) + ' ' + r * 0.3 + ' Z', fill: '#4caf50' }, g);
    s('path', { d: 'M' + (-r * 0.7) + ' ' + (-r * 0.05) + ' q' + r * 0.7 + ' ' + (-r * 0.25) + ' ' + r * 1.3 + ' ' + r * 0.15, fill: 'none', stroke: '#ffffff', 'stroke-width': r * 0.08, 'stroke-linecap': 'round', opacity: 0.7 }, g);
    s('circle', { r: r, fill: 'none', stroke: '#bfe0ff', 'stroke-width': 1.5, opacity: 0.6 }, g);
  }
  function sun(g, r) {
    var id = 'llsun' + (uid++), d = s('defs', {}, g), gr = s('radialGradient', { id: id }, d);
    s('stop', { offset: '0', 'stop-color': '#fff6c2' }, gr); s('stop', { offset: '0.55', 'stop-color': '#ffcf3f' }, gr); s('stop', { offset: '1', 'stop-color': '#ff9a1f' }, gr);
    var rays = s('g', { 'class': 'll-spin' }, g);
    for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s('line', { x1: Math.cos(a) * r * 1.15, y1: Math.sin(a) * r * 1.15, x2: Math.cos(a) * r * 1.5, y2: Math.sin(a) * r * 1.5, stroke: '#ffcf3f', 'stroke-width': 4, 'stroke-linecap': 'round' }, rays); }
    s('circle', { r: r * 1.25, fill: '#ffcf3f', opacity: 0.18 }, g);
    s('circle', { r: r, fill: 'url(#' + id + ')' }, g);
  }
  function star(g, r) {
    s('circle', { r: r * 1.6, fill: '#cfe3ff', opacity: 0.16 }, g);
    s('path', { d: 'M0 ' + (-r * 1.4) + ' Q' + r * 0.18 + ' ' + (-r * 0.18) + ' ' + r * 1.4 + ' 0 Q' + r * 0.18 + ' ' + r * 0.18 + ' 0 ' + r * 1.4 + ' Q' + (-r * 0.18) + ' ' + r * 0.18 + ' ' + (-r * 1.4) + ' 0 Q' + (-r * 0.18) + ' ' + (-r * 0.18) + ' 0 ' + (-r * 1.4) + ' Z', fill: '#eaf3ff', 'class': 'll-twinkle' }, g);
    s('circle', { r: r * 0.45, fill: '#ffffff' }, g);
  }
  function galaxy(g, r) {
    var spin = s('g', { 'class': 'll-spin-slow' }, g);
    s('ellipse', { rx: r * 1.15, ry: r * 0.5, fill: '#b9a6ff', opacity: 0.18, transform: 'rotate(-20)' }, spin);
    for (var arm = 0; arm < 2; arm++) {
      var d = '';
      for (var k = 0; k <= 40; k++) { var t = k / 40, a = arm * Math.PI + t * 3.6, rr = r * (0.15 + t * 0.95); d += (k ? ' L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ' ' + (Math.sin(a) * rr * 0.45).toFixed(1); }
      s('path', { d: d, fill: 'none', stroke: '#d9ccff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.85, transform: 'rotate(-20)' }, spin);
    }
    s('ellipse', { rx: r * 0.28, ry: r * 0.2, fill: '#fff4d6', transform: 'rotate(-20)' }, spin);
  }
  function probe(g) {
    s('path', { d: 'M-16 0 L-26 -6 L-26 6 Z', fill: '#ff8a3d', 'class': 'll-flame' }, g);
    s('rect', { x: -16, y: -6, width: 22, height: 12, rx: 3, fill: '#e9edf2', stroke: '#8a94a3', 'stroke-width': 1.2 }, g);
    s('path', { d: 'M6 -6 Q16 0 6 6 Z', fill: '#c9d2dd', stroke: '#8a94a3', 'stroke-width': 1.2 }, g);
    s('rect', { x: -12, y: -17, width: 10, height: 9, fill: '#2f6fd8', stroke: '#8a94a3', 'stroke-width': 1 }, g);
    s('rect', { x: -12, y: 8, width: 10, height: 9, fill: '#2f6fd8', stroke: '#8a94a3', 'stroke-width': 1 }, g);
    s('circle', { cx: -2, r: 2.6, fill: '#7fc6ff' }, g);
  }
  var DRAW = { earth: [earth, 34], sun: [sun, 40], star: [star, 18], galaxy: [galaxy, 52] };

  document.querySelectorAll('.model[data-model="lightlab"]').forEach(function (root) {
    var runs;
    try { runs = JSON.parse(root.dataset.runs); } catch (e) { return; }
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Light lab'));
    var row = h('div', 'mpicks'), stage = h('div', 'llstage'), head = h('div', 'llhead'), list = h('ul', 'lllist'), out = h('div', 'mverdict');
    [top, row, stage, head, list, out].forEach(function (x) { root.appendChild(x); });
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': root.dataset.alt || 'A drawn space scene.' });
    stage.appendChild(svg);
    s('rect', { width: W, height: H, fill: '#0b1530' }, svg);
    var neb = s('ellipse', { cx: 420, cy: 90, rx: 260, ry: 90, fill: '#3b2a7a', opacity: 0.25 }, svg);
    s('ellipse', { cx: 120, cy: 280, rx: 220, ry: 70, fill: '#1d4a7a', opacity: 0.25 }, svg);
    var twinkles = [];
    for (var i = 0; i < 70; i++) twinkles.push(s('circle', { cx: rnd(i) * W, cy: rnd(i + 99) * H, r: 0.6 + rnd(i + 7) * 1.4, fill: '#ffffff' }, svg));
    var scene = s('g', {}, svg);
    /* the light travel time bar */
    var clockG = s('g', { transform: 'translate(20 18)' }, svg);
    s('rect', { width: 300, height: 56, rx: 10, fill: '#ffffff', 'fill-opacity': 0.1, stroke: '#ffffff', 'stroke-opacity': 0.35 }, clockG);
    var clockT = s('text', { x: 12, y: 16, 'font-size': 11, 'font-weight': 800, fill: '#cfe0ff', 'letter-spacing': 1 }, clockG); clockT.textContent = 'LIGHT TRAVEL TIME';
    s('rect', { x: 12, y: 24, width: 276, height: 8, rx: 4, fill: '#ffffff', 'fill-opacity': 0.15 }, clockG);
    var clockBar = s('rect', { x: 12, y: 24, width: 0, height: 8, rx: 4, fill: '#ffe066' }, clockG);
    var clockV = s('text', { x: 12, y: 48, 'font-size': 13, 'font-weight': 800, fill: '#ffe066' }, clockG);
    var stamp = s('g', { opacity: 0 }, svg);
    var stampBox = s('rect', { rx: 10, fill: '#ffe066' }, stamp);
    var stampT = s('text', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#1b2440' }, stamp);

    var run = null, p = 0, playing = false, last = 0, raf = 0, seen = true, finished = {}, parts = {};
    function build(r) {
      while (scene.firstChild) scene.removeChild(scene.firstChild);
      parts = {};
      if (!r) { var g0 = s('g', { transform: 'translate(300 200)' }, scene); earth(g0, 44); return; }
      if (r.kind === 'orbit') {
        var ge = s('g', { transform: 'translate(300 192)' }, scene); earth(ge, 56);
        s('circle', { cx: 300, cy: 192, r: 112, fill: 'none', stroke: '#ffe066', 'stroke-opacity': 0.25, 'stroke-dasharray': '3 7' }, scene);
        parts.trail = s('path', { fill: 'none', stroke: '#ffe066', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.55 }, scene);
        parts.dot = s('circle', { r: 7, fill: '#fffbe0', stroke: '#ffe066', 'stroke-width': 3 }, scene);
        parts.count = s('text', { x: 580, y: 46, 'text-anchor': 'end', 'font-size': 16, 'font-weight': 900, fill: '#ffe066' }, scene);
        return;
      }
      var A = DRAW[r.from] || DRAW.sun, B = DRAW[r.to] || DRAW.earth;
      parts.ax = 80 + A[1] * 0.5; parts.bx = 530 - B[1] * 0.3; parts.y = 190;
      s('line', { x1: parts.ax, y1: parts.y, x2: parts.bx, y2: parts.y, stroke: '#ffffff', 'stroke-opacity': 0.18, 'stroke-dasharray': '4 8' }, scene);
      var ga = s('g', { transform: 'translate(' + parts.ax + ' ' + parts.y + ')' }, scene); A[0](ga, A[1]);
      var gb = s('g', { transform: 'translate(' + parts.bx + ' ' + parts.y + ')' }, scene); B[0](gb, B[1]);
      var la = s('text', { x: parts.ax, y: parts.y + Math.max(A[1], 30) + 34, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#cfe0ff' }, scene); la.textContent = (r.fromName || r.from).toUpperCase();
      var lb = s('text', { x: parts.bx, y: parts.y + Math.max(B[1], 30) + 34, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#cfe0ff' }, scene); lb.textContent = (r.toName || r.to).toUpperCase();
      parts.beam = s('line', { x1: parts.ax, y1: parts.y, x2: parts.ax, y2: parts.y, stroke: '#ffe066', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.8 }, scene);
      parts.dot = s('circle', { cx: parts.ax, cy: parts.y, r: 7, fill: '#fffbe0', stroke: '#ffe066', 'stroke-width': 3 }, scene);
      if (r.ship) {
        parts.ship = s('g', {}, scene); probe(parts.ship);
        parts.shipT = s('text', { x: parts.ax + 50, y: parts.y - 82, 'font-size': 12, 'font-weight': 800, fill: '#ffb27a' }, scene);
      }
    }
    function showStamp(text, x, y) {
      stampT.textContent = text;
      var wpx = Math.min(580, 20 + text.length * 7.4);
      set(stampBox, { x: x - wpx / 2, y: y - 22, width: wpx, height: 32 });
      set(stampT, { x: x, y: y - 1 });
    }
    function draw(now) {
      twinkles.forEach(function (c, k) { c.setAttribute('opacity', still ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin(now / (700 + rnd(k) * 1600) + k))); });
      neb.setAttribute('opacity', 0.2 + 0.08 * Math.sin(now / 2400));
      var r = run, t = p;
      clockBar.setAttribute('width', 276 * (r ? t : 0));
      clockV.textContent = r && t >= 1 ? r.clock : '';
      stamp.setAttribute('opacity', r && t >= 1 ? 1 : 0);
      if (!r) return;
      if (r.kind === 'orbit') {
        var laps = r.laps || 7, turns = laps * t, a = -Math.PI / 2 + turns * Math.PI * 2;
        set(parts.dot, { cx: 300 + Math.cos(a) * 112, cy: 192 + Math.sin(a) * 112 });
        var d = '';
        for (var k = 0; k <= 14; k++) { var b = a - k * 0.06; d += (k ? ' L' : 'M') + (300 + Math.cos(b) * 112).toFixed(1) + ' ' + (192 + Math.sin(b) * 112).toFixed(1); }
        parts.trail.setAttribute('d', t > 0 ? d : '');
        parts.count.textContent = 'Trips around Earth: ' + Math.min(laps, Math.floor(turns + 1e-6));
        if (t >= 1) showStamp(r.stamp || r.clock, 300, 326);
        return;
      }
      var bx = parts.ax + (parts.bx - parts.ax) * ease(t);
      set(parts.beam, { x2: bx }); set(parts.dot, { cx: bx, opacity: t < 1 ? 1 : 0 });
      if (parts.ship) {
        parts.ship.setAttribute('transform', 'translate(' + (parts.ax + 34 + 12 * t) + ' ' + (parts.y - 66) + ') rotate(-4)');
        parts.shipT.textContent = t >= 1 ? r.ship : '';
      }
      if (t >= 1) showStamp(r.stamp || r.clock, 300, 326);
    }
    function lightLines() {
      var at = run.at || run.lines.map(function (x, k) { return 0.2 + k * 0.25; });
      list.querySelectorAll('li').forEach(function (li, k) { li.classList.toggle('on', p >= at[k]); });
    }
    function loop(now) {
      raf = 0;
      var dt = Math.min(64, now - last); last = now;
      if (playing) {
        p = still ? 1 : Math.min(1, p + dt / DUR);
        if (p >= 1) { playing = false; finish(); }
      }
      draw(now); if (run) lightLines();
      if (seen && (playing || !still)) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function finish() {
      finished[run.k] = true;
      row.querySelectorAll('.mpick').forEach(function (b) { if (finished[b.dataset.k]) b.classList.add('sdone'); });
      out.className = 'mverdict good';
      out.textContent = run.after;
      if (runs.every(function (r) { return finished[r.k]; }) && root.dataset.done) out.appendChild(h('div', 'mhint', root.dataset.done));
    }
    function start(r) {
      run = r; p = 0; playing = true; build(r);
      row.querySelectorAll('.mpick').forEach(function (b) { b.classList.toggle('on', b.dataset.k === r.k); });
      head.textContent = r.head;
      list.innerHTML = '';
      r.lines.forEach(function (t) { list.appendChild(h('li', null, t)); });
      out.className = 'mverdict'; out.textContent = 'Watch the light. Read each line as it lights up.';
      kick();
    }
    function reset() {
      run = null; p = 0; playing = false; build(null);
      row.querySelectorAll('.mpick').forEach(function (b) { b.classList.remove('on'); });
      head.textContent = ''; list.innerHTML = '';
      out.className = 'mverdict'; out.textContent = root.dataset.start || 'Pick a trip for the light.';
      draw(performance.now()); kick();
    }
    runs.forEach(function (r) {
      var b = h('button', 'mpick', r.name); b.type = 'button'; b.dataset.k = r.k;
      b.addEventListener('click', function () { start(r); }); row.appendChild(b);
    });
    var rb = h('button', 'mpick', 'Reset'); rb.type = 'button'; rb.addEventListener('click', reset); row.appendChild(rb);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) kick(); }).observe(stage);
    reset();
  });
})();

/* ---- science model · station telescope (v2.25, 2026-11-04): <div class="model" data-model="telescope" data-label="…" data-alt="…"
   data-start="…" data-targets='[{"k":"…","name":"…","obj":"sun"|"star"|"galaxy","sent":"…","seen":"…","log":"…"},…]' data-done="…"></div>
   An illustrated space station interior: a round porthole with a riveted metal rim looking out at space (Earth's edge glowing
   at the bottom), and a white telescope on a tripod. The student picks a target; the telescope swings to the window, the
   porthole view fills with the target (a glowing Sun with flares, a twinkling star with light spikes, or a turning spiral
   galaxy), and a glowing "light postcard" flies out of it toward the viewer and lands stamped with the page's `sent` line.
   A logbook fills with each target's `log` line. Every word comes from the page's data; the drawing carries no numbers.
   Teaches the Week 1 guide: light takes time to travel, so we see objects as they were when the light left. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', W = 640, H = 400, CX = 432, CY = 168, R = 116, FLY = 2600;
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, a, parent) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
  function set(e, a) { for (var k in a) e.setAttribute(k, a[k]); }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 7.3) * 43758.5453; return x - Math.floor(x); }
  var uid = 0;
  function grad(defs, type, stops, a) {
    var id = 'tsc' + (uid++), g = s(type, Object.assign({ id: id }, a || {}), defs);
    stops.forEach(function (st) { s('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] == null ? 1 : st[2] }, g); });
    return 'url(#' + id + ')';
  }
  /* the three targets, drawn around (0,0) at "scale 1" ≈ fills the porthole */
  function drawSun(g, defs) {
    var glow = grad(defs, 'radialGradient', [['0', '#fff7d1', 0.9], ['0.45', '#ffcf4a', 0.45], ['1', '#ff8a1f', 0]]);
    var body = grad(defs, 'radialGradient', [['0', '#fffbe6'], ['0.35', '#ffe066'], ['0.8', '#ffad2b'], ['1', '#ff7a1a']], { cx: '40%', cy: '38%' });
    s('circle', { r: 120, fill: glow, 'class': 'tsc-pulse' }, g);
    var flares = s('g', { 'class': 'tsc-spin' }, g);
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * 360;
      s('path', { d: 'M0 -62 C 10 -78, 4 -92, 0 -100 C -4 -92, -10 -78, 0 -62 Z', fill: '#ffb33a', opacity: 0.75, transform: 'rotate(' + a + ')' }, flares);
    }
    s('circle', { r: 62, fill: body }, g);
    [[-20, -14, 7], [16, 10, 5], [-6, 22, 4], [24, -20, 3.5]].forEach(function (sp) { s('circle', { cx: sp[0], cy: sp[1], r: sp[2], fill: '#e8891c', opacity: 0.45 }, g); });
    s('ellipse', { cx: -18, cy: -24, rx: 18, ry: 10, fill: '#ffffff', opacity: 0.35 }, g);
  }
  function drawStar(g, defs) {
    var glow = grad(defs, 'radialGradient', [['0', '#ffffff', 1], ['0.25', '#cfe6ff', 0.75], ['1', '#7fb2ff', 0]]);
    s('circle', { r: 110, fill: glow, 'class': 'tsc-pulse' }, g);
    var spikes = s('g', { 'class': 'tsc-twinkle' }, g);
    [[0, 115, 5], [90, 115, 5], [45, 60, 3], [135, 60, 3]].forEach(function (sp) {
      s('path', { d: 'M0 ' + (-sp[1]) + ' L' + sp[2] + ' 0 L0 ' + sp[1] + ' L' + (-sp[2]) + ' 0 Z', fill: '#eef6ff', opacity: 0.9, transform: 'rotate(' + sp[0] + ')' }, spikes);
    });
    s('circle', { r: 22, fill: '#ffffff' }, g);
    s('circle', { r: 30, fill: 'none', stroke: '#bcd9ff', 'stroke-width': 4, opacity: 0.6 }, g);
    for (var i = 0; i < 18; i++) s('circle', { cx: (rnd(i + 3) - 0.5) * 230, cy: (rnd(i + 9) - 0.5) * 230, r: 0.8 + rnd(i) * 1.6, fill: '#ffffff', opacity: 0.8, 'class': 'tsc-tw' + (i % 3) }, g);
  }
  function drawGalaxy(g, defs) {
    var haze = grad(defs, 'radialGradient', [['0', '#fff1d6', 0.95], ['0.18', '#ffd59a', 0.7], ['0.5', '#9c7cff', 0.28], ['1', '#3a2a8a', 0]]);
    var spin = s('g', { 'class': 'tsc-spin-slow' }, g);
    var tilt = s('g', { transform: 'rotate(-24) scale(1 0.62)' }, spin);
    s('circle', { r: 118, fill: haze }, tilt);
    var cols = ['#cdbbff', '#a6c8ff', '#ffd8f0'];
    for (var arm = 0; arm < 3; arm++) {
      for (var k = 0; k < 70; k++) {
        var t = k / 70, a = arm * (Math.PI * 2 / 3) + t * 4.4, rr = 14 + t * 100;
        var jx = (rnd(arm * 100 + k) - 0.5) * 10 * (0.4 + t), jy = (rnd(arm * 100 + k + 50) - 0.5) * 10 * (0.4 + t);
        s('circle', { cx: Math.cos(a) * rr + jx, cy: Math.sin(a) * rr + jy, r: 1.2 + (1 - t) * 2.2 * rnd(k + arm), fill: cols[(k + arm) % 3], opacity: 0.55 + 0.45 * (1 - t) }, tilt);
      }
    }
    s('circle', { r: 16, fill: '#fff7e6' }, tilt);
    s('circle', { r: 30, fill: '#ffe2a8', opacity: 0.35 }, tilt);
  }
  var DRAW = { sun: drawSun, star: drawStar, galaxy: drawGalaxy };

  document.querySelectorAll('.model[data-model="telescope"]').forEach(function (root) {
    var targets;
    try { targets = JSON.parse(root.dataset.targets); } catch (e) { return; }
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Station telescope'));
    var row = h('div', 'mpicks'), stage = h('div', 'tscstage'), out = h('div', 'mverdict'), logW = h('div', 'tsclog');
    var logH = h('div', 'tsclogh', 'Station logbook'), log = h('ol', 'tscloglist');
    logW.appendChild(logH); logW.appendChild(log);
    [top, row, stage, out, logW].forEach(function (x) { root.appendChild(x); });
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': root.dataset.alt || 'An illustrated space station window with a telescope.' });
    stage.appendChild(svg);
    var defs = s('defs', {}, svg);

    /* observation deck (v2.26 look, 2026-11-05): a softly lit room with a curved ceiling light and a control console */
    s('rect', { width: W, height: H, fill: grad(defs, 'linearGradient', [['0', '#34466d'], ['0.6', '#25314f'], ['1', '#1a2238']], { x1: 0, y1: 0, x2: 0, y2: 1 }) }, svg);
    s('rect', { x: -30, y: 52, width: 262, height: 300, rx: 30, fill: '#ffffff', opacity: 0.04 }, svg);
    s('rect', { x: 584, y: 52, width: 90, height: 300, rx: 30, fill: '#ffffff', opacity: 0.04 }, svg);
    s('circle', { cx: CX, cy: CY, r: R + 120, fill: grad(defs, 'radialGradient', [['0', '#6d9cf0', 0.32], ['1', '#6d9cf0', 0]]) }, svg);
    s('path', { d: 'M0 0 H' + W + ' V24 Q' + W / 2 + ' 62 0 24 Z', fill: '#141b2e' }, svg);
    s('path', { d: 'M36 30 Q' + W / 2 + ' 66 ' + (W - 36) + ' 30', fill: 'none', stroke: '#7fc6ff', 'stroke-width': 18, 'stroke-linecap': 'round', opacity: 0.16 }, svg);
    s('path', { d: 'M36 30 Q' + W / 2 + ' 66 ' + (W - 36) + ' 30', fill: 'none', stroke: '#d6efff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.95 }, svg);
    [[612, 118, '#4ade80', 0], [612, 138, '#ffe066', 1], [612, 158, '#4ade80', 2]].forEach(function (l) {
      s('circle', { cx: l[0], cy: l[1], r: 6, fill: l[2], opacity: 0.18 }, svg);
      s('circle', { cx: l[0], cy: l[1], r: 3, fill: l[2], 'class': 'tsc-tw' + l[3] }, svg);
    });
    /* console along the bottom */
    s('path', { d: 'M0 326 Q' + W / 2 + ' 304 ' + W + ' 326 V' + H + ' H0 Z', fill: grad(defs, 'linearGradient', [['0', '#46598a'], ['1', '#1c2540']], { x1: 0, y1: 0, x2: 0, y2: 1 }) }, svg);
    s('path', { d: 'M0 326 Q' + W / 2 + ' 304 ' + W + ' 326', fill: 'none', stroke: '#9cc0f0', 'stroke-width': 2.5, opacity: 0.65 }, svg);
    s('rect', { x: 468, y: 340, width: 124, height: 42, rx: 9, fill: '#0c2633', stroke: '#3fb8c9', 'stroke-width': 2 }, svg);
    s('path', { d: 'M478 362 q8 -14 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t8 0', fill: 'none', stroke: '#5ef2ff', 'stroke-width': 2, 'stroke-linecap': 'round', 'class': 'tsc-tw1' }, svg);
    [['#ff7a5c', 300], ['#ffe066', 326], ['#4ade80', 352], ['#7fc6ff', 378]].forEach(function (bt) {
      s('circle', { cx: bt[1], cy: 360, r: 8, fill: bt[0] }, svg);
      s('circle', { cx: bt[1] - 2.5, cy: 357, r: 2.5, fill: '#ffffff', opacity: 0.6 }, svg);
    });

    /* porthole: shadow, polished rim, bolts, glass, view */
    var clipId = 'tscclip' + (uid++), clip = s('clipPath', { id: clipId }, defs); s('circle', { cx: CX, cy: CY, r: R }, clip);
    s('circle', { cx: CX + 7, cy: CY + 12, r: R + 34, fill: '#0b1020', opacity: 0.45 }, svg);
    s('circle', { cx: CX, cy: CY, r: R + 32, fill: grad(defs, 'linearGradient', [['0', '#f2f5fa'], ['0.35', '#b3bfd1'], ['0.7', '#6f7c95'], ['1', '#3a4458']], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, svg);
    s('circle', { cx: CX, cy: CY, r: R + 19, fill: grad(defs, 'linearGradient', [['0', '#4a5670'], ['1', '#b9c4d6']], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, svg);
    s('circle', { cx: CX, cy: CY, r: R + 8, fill: '#10172a' }, svg);
    for (var b = 0; b < 16; b++) {
      var ba = b / 16 * Math.PI * 2, bx = CX + Math.cos(ba) * (R + 25.5), by = CY + Math.sin(ba) * (R + 25.5);
      s('circle', { cx: bx, cy: by, r: 3.4, fill: '#e9eef6', stroke: '#56627a', 'stroke-width': 1 }, svg);
      s('circle', { cx: bx - 1, cy: by - 1, r: 1.1, fill: '#ffffff' }, svg);
    }
    var view = s('g', { 'clip-path': 'url(#' + clipId + ')' }, svg);
    s('rect', { x: CX - R, y: CY - R, width: R * 2, height: R * 2, fill: grad(defs, 'radialGradient', [['0', '#1c2d62'], ['1', '#050a1b']]) }, view);
    var stars = [];
    for (var i = 0; i < 60; i++) stars.push(s('circle', { cx: CX - R + rnd(i) * R * 2, cy: CY - R + rnd(i + 40) * R * 2, r: 0.6 + rnd(i + 7) * 1.5, fill: '#ffffff' }, view));
    var earthLimb = s('g', {}, view);
    s('circle', { cx: CX, cy: CY + R + 250, r: 300, fill: grad(defs, 'radialGradient', [['0.82', '#2f7fd8'], ['0.96', '#6fc3ff'], ['1', '#bfe6ff']]) }, earthLimb);
    s('path', { d: 'M' + (CX - 100) + ' ' + (CY + 88) + ' q40 -16 80 -6 q30 8 60 -4', fill: 'none', stroke: '#ffffff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.55 }, earthLimb);
    var targetG = s('g', { transform: 'translate(' + CX + ' ' + CY + ')', opacity: 0 }, view);
    s('circle', { cx: CX, cy: CY, r: R, fill: grad(defs, 'radialGradient', [['0.72', '#000000', 0], ['1', '#000000', 0.55]]) }, svg);
    s('path', { d: 'M' + (CX - R + 26) + ' ' + (CY - 30) + ' A ' + (R - 18) + ' ' + (R - 18) + ' 0 0 1 ' + (CX - 24) + ' ' + (CY - R + 24), fill: 'none', stroke: '#ffffff', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.16 }, svg);
    s('ellipse', { cx: CX + R * 0.45, cy: CY - R * 0.55, rx: 14, ry: 6, fill: '#ffffff', opacity: 0.18, transform: 'rotate(35 ' + (CX + R * 0.45) + ' ' + (CY - R * 0.55) + ')' }, svg);

    /* light from the window to the telescope (a soft cone, drawn each frame) */
    var beam = s('polygon', { fill: grad(defs, 'radialGradient', [['0', '#fff1b8', 0.9], ['1', '#ffe066', 0]], { cx: '100%', cy: '0%', r: '120%' }), opacity: 0 }, svg);

    /* telescope on a pier mount; the tube turns around its fork */
    var PX = 138, PY = 240;
    s('ellipse', { cx: PX, cy: 330, rx: 50, ry: 8, fill: '#0b1020', opacity: 0.45 }, svg);
    s('rect', { x: PX - 38, y: 316, width: 76, height: 13, rx: 6, fill: '#3b4766' }, svg);
    s('rect', { x: PX - 11, y: PY + 16, width: 22, height: 62, fill: grad(defs, 'linearGradient', [['0', '#56668a'], ['0.5', '#d3dcea'], ['1', '#56668a']], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, svg);
    s('rect', { x: PX - 17, y: PY + 10, width: 34, height: 14, rx: 4, fill: '#e2a33a', stroke: '#a8741f', 'stroke-width': 1.5 }, svg);
    s('path', { d: 'M' + (PX - 15) + ' ' + (PY + 12) + ' L' + (PX - 11) + ' ' + PY + ' L' + (PX + 11) + ' ' + PY + ' L' + (PX + 15) + ' ' + (PY + 12) + ' Z', fill: '#8fa0bd' }, svg);
    var tube = s('g', {}, svg);
    var tubeFill = grad(defs, 'linearGradient', [['0', '#ffffff'], ['0.5', '#dbe4f1'], ['1', '#8d9eba']], { x1: 0, y1: 0, x2: 0, y2: 1 });
    var shieldFill = grad(defs, 'linearGradient', [['0', '#3f548f'], ['1', '#1b2440']], { x1: 0, y1: 0, x2: 0, y2: 1 });
    s('rect', { x: -88, y: -9, width: 20, height: 18, rx: 4, fill: '#2b3448' }, tube);
    s('rect', { x: -96, y: -24, width: 12, height: 20, rx: 3, fill: '#1b2440', transform: 'rotate(-30 -90 -14)' }, tube);
    s('rect', { x: -70, y: -15, width: 188, height: 30, rx: 9, fill: tubeFill, stroke: '#7d8aa1', 'stroke-width': 1.5 }, tube);
    [-44, 66].forEach(function (x) { s('rect', { x: x, y: -15, width: 7, height: 30, fill: '#2b3a67' }, tube); });
    s('rect', { x: 116, y: -20, width: 52, height: 40, rx: 6, fill: shieldFill }, tube);
    s('rect', { x: 116, y: -20, width: 5, height: 40, fill: '#e2a33a' }, tube);
    s('ellipse', { cx: 168, cy: 0, rx: 6, ry: 18, fill: grad(defs, 'linearGradient', [['0', '#c9f1ff'], ['1', '#3f8fd1']], { x1: 0, y1: 0, x2: 0, y2: 1 }), stroke: '#1b2440', 'stroke-width': 2 }, tube);
    s('ellipse', { cx: 167, cy: -7, rx: 2, ry: 5, fill: '#ffffff', opacity: 0.8 }, tube);
    s('rect', { x: 14, y: -29, width: 58, height: 9, rx: 4, fill: '#e3e9f2', stroke: '#7d8aa1', 'stroke-width': 1.2 }, tube);
    s('rect', { x: 24, y: -21, width: 5, height: 6, fill: '#7d8aa1' }, tube);
    s('rect', { x: 58, y: -21, width: 5, height: 6, fill: '#7d8aa1' }, tube);
    s('rect', { x: -9, y: -19, width: 18, height: 38, rx: 4, fill: '#e2a33a', stroke: '#a8741f', 'stroke-width': 1.5 }, tube);
    s('path', { d: 'M-62 -10 H110', stroke: '#ffffff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 }, tube);

    /* the light postcard */
    var card = s('g', { opacity: 0 }, svg);
    var cardGlow = s('rect', { x: -96, y: -60, width: 192, height: 128, rx: 14, fill: '#ffe066', opacity: 0.35, 'class': 'tsc-pulse' }, card);
    s('rect', { x: -86, y: -52, width: 172, height: 112, rx: 8, fill: '#fffaf0', stroke: '#e2c79a', 'stroke-width': 2 }, card);
    s('rect', { x: 34, y: -42, width: 42, height: 46, rx: 3, fill: '#ffffff', stroke: '#d96a4b', 'stroke-width': 2, 'stroke-dasharray': '3 2' }, card);
    var stampArt = s('g', { transform: 'translate(55 -19) scale(0.16)' }, card);
    var pm = s('g', { transform: 'translate(58 -12) rotate(-14)', opacity: 0.85 }, card);
    s('circle', { r: 20, fill: 'none', stroke: '#3b5bab', 'stroke-width': 2 }, pm);
    var pmT = s('text', { y: 4, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 900, fill: '#3b5bab', 'letter-spacing': 1 }, pm); pmT.textContent = 'SENT';
    s('line', { x1: -72, y1: 22, x2: 72, y2: 22, stroke: '#e6dccb', 'stroke-width': 1.5 }, card);
    s('line', { x1: -72, y1: 44, x2: 72, y2: 44, stroke: '#e6dccb', 'stroke-width': 1.5 }, card);
    var cardFromL = s('text', { x: -74, y: -32, 'font-size': 9.5, 'font-weight': 900, fill: '#8a8f99', 'letter-spacing': 1.2 }, card); cardFromL.textContent = 'FROM';
    var cardFrom = s('text', { x: -74, y: -14, 'font-size': 11.5, 'font-weight': 900, fill: '#1b2440' }, card);
    var cardSent = s('text', { x: -74, y: 18, 'font-size': 12.5, 'font-weight': 800, fill: '#b2442a' }, card);
    var cardSent2 = s('text', { x: -74, y: 40, 'font-size': 12.5, 'font-weight': 800, fill: '#b2442a' }, card);

    var cur = null, t0 = 0, raf = 0, seen = true, done = {}, aim = -4, aimFrom = -4, aimTo = -4, AIM = Math.atan2(CY - PY, CX - PX) * 180 / Math.PI;
    function wrap(text, n) {
      var words = text.split(' '), lines = [''];
      words.forEach(function (w) { var l = lines[lines.length - 1]; if ((l + ' ' + w).trim().length > n && l) lines.push(w); else lines[lines.length - 1] = (l + ' ' + w).trim(); });
      return lines;
    }
    function frame(now) {
      raf = 0;
      stars.forEach(function (c, k) { c.setAttribute('opacity', still ? 0.8 : 0.35 + 0.65 * Math.abs(Math.sin(now / (600 + rnd(k) * 1500) + k))); });
      var t = cur ? (still ? 1 : clamp((now - t0) / FLY)) : 0;
      var swing = easeInOut(clamp(t / 0.3));
      aim = aimFrom + (aimTo - aimFrom) * swing;
      tube.setAttribute('transform', 'translate(' + PX + ' ' + PY + ') rotate(' + aim + ') scale(0.86)');
      if (cur) {
        var fade = clamp((t - 0.15) / 0.3);
        targetG.setAttribute('opacity', fade);
        targetG.setAttribute('transform', 'translate(' + CX + ' ' + CY + ') scale(' + (0.55 + 0.45 * easeOut(fade)) + ')');
        earthLimb.setAttribute('opacity', 1 - 0.8 * fade);
        var rad = aim * Math.PI / 180, ex = PX + Math.cos(rad) * 146, ey = PY + Math.sin(rad) * 146, th = Math.atan2(ey - CY, ex - CX);
        set(beam, { points: ex + ',' + ey + ' ' + (CX + Math.cos(th - 0.55) * R * 0.9) + ',' + (CY + Math.sin(th - 0.55) * R * 0.9) + ' ' + (CX + Math.cos(th + 0.55) * R * 0.9) + ',' + (CY + Math.sin(th + 0.55) * R * 0.9), opacity: 0.55 * fade });
        var fly = easeOut(clamp((t - 0.45) / 0.55));
        var x = CX + (132 - CX) * fly, y = CY + (128 - CY) * fly, sc = 0.08 + 0.97 * fly;
        set(card, { opacity: t > 0.45 ? 1 : 0, transform: 'translate(' + x + ' ' + y + ') scale(' + sc + ') rotate(' + (-6 * fly) + ')' });
        if (t >= 1 && !done[cur.k]) finish();
      } else {
        targetG.setAttribute('opacity', 0); earthLimb.setAttribute('opacity', 1); card.setAttribute('opacity', 0); beam.setAttribute('opacity', 0);
      }
      if (seen && !still) raf = requestAnimationFrame(frame);
      else if (seen && cur && t < 1) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function aimAt(tg) {
      cur = tg; t0 = performance.now(); aimFrom = aim; aimTo = AIM;
      while (targetG.firstChild) targetG.removeChild(targetG.firstChild);
      (DRAW[tg.obj] || drawStar)(targetG, defs);
      while (stampArt.firstChild) stampArt.removeChild(stampArt.firstChild);
      (DRAW[tg.obj] || drawStar)(stampArt, defs);
      cardFrom.textContent = tg.from || tg.name;
      var lines = wrap(tg.sent, 23);
      cardSent.textContent = lines[0] || ''; cardSent2.textContent = lines.slice(1).join(' ');
      row.querySelectorAll('.mpick').forEach(function (b) { b.classList.toggle('on', b.dataset.k === tg.k); });
      out.className = 'mverdict'; out.textContent = 'Aiming at ' + tg.name.toLowerCase() + '… watch for the light postcard.';
      kick();
    }
    function finish() {
      done[cur.k] = true;
      row.querySelectorAll('.mpick').forEach(function (b) { if (done[b.dataset.k]) b.classList.add('sdone'); });
      out.className = 'mverdict good'; out.textContent = cur.seen;
      if (!log.querySelector('[data-k="' + cur.k + '"]')) { var li = h('li', null, cur.log); li.dataset.k = cur.k; log.appendChild(li); }
      logW.classList.add('on');
      if (targets.every(function (x) { return done[x.k]; }) && root.dataset.done) out.appendChild(h('div', 'mhint', root.dataset.done));
    }
    targets.forEach(function (tg) {
      var b = h('button', 'mpick', tg.name); b.type = 'button'; b.dataset.k = tg.k;
      b.addEventListener('click', function () { aimAt(tg); }); row.appendChild(b);
    });
    var rb = h('button', 'mpick', 'Reset'); rb.type = 'button';
    rb.addEventListener('click', function () {
      cur = null; done = {}; log.innerHTML = ''; logW.classList.remove('on'); aimFrom = aim; aimTo = -4; t0 = performance.now();
      row.querySelectorAll('.mpick').forEach(function (b) { b.classList.remove('on', 'sdone'); });
      out.className = 'mverdict'; out.textContent = root.dataset.start || 'Pick a target for the telescope.'; kick();
    });
    row.appendChild(rb);
    out.textContent = root.dataset.start || 'Pick a target for the telescope.';
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) kick(); }).observe(stage);
    kick();
  });
})();

/* ---- science model · fix the space diary (v2.25, 2026-11-04): <div class="model" data-model="diary" data-label="…" data-title="…"
   data-byline="…" data-lines='[{"t":"…","ok":true,"why":"…"},{"t":"…","ok":false,"fix":"…","decoy":"…","why":"…"},…]' data-done="…"></div>
   An illustrated diary page (lined paper, red margin, tape, a station sketch and star doodles in the margin). Each sentence
   is a tappable line. Tapping opens three choices: keep it as written, or one of two rewrites (for a wrong line, `fix` is the
   right rewrite and `decoy` is not; for a right line, both rewrites are decoys made from `decoy`). A right choice marks the
   line with a green check, or crosses out the mistake and writes the fix in blue ink; a wrong choice shakes and shows the
   page's `why`. A counter tracks lines checked and mistakes fixed. Teaches: read science claims critically, using the guide. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var DOODLE = '<svg viewBox="0 0 120 400" aria-hidden="true"><g fill="none" stroke="#3b5bab" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="38" y="40" width="44" height="22" rx="6"/><rect x="10" y="44" width="24" height="14"/><rect x="86" y="44" width="24" height="14"/><path d="M34 51h4M82 51h4M10 51h24M86 51h24M60 40v-10M54 30h12"/><circle cx="60" cy="51" r="5"/>' +
    '<path d="M60 120l4 9 10 1-8 6 3 10-9-5-9 5 3-10-8-6 10-1z"/><path d="M30 175l2 5 5 .5-4 3 1.5 5-4.5-2.5-4.5 2.5 1.5-5-4-3 5-.5z"/>' +
    '<circle cx="64" cy="240" r="18"/><path d="M48 236q16-8 32 6M50 250q12 2 26-6"/>' +
    '<path d="M60 300c10 8 10 26 0 36c-10-10-10-28 0-36zM52 330l-8 10M68 330l8 10M60 336v10"/><circle cx="60" cy="314" r="3"/>' +
    '</g><g fill="#ffe066" stroke="#e2a33a" stroke-width="1.5"><path d="M92 170l2 5 5 .5-4 3 1.5 5-4.5-2.5-4.5 2.5 1.5-5-4-3 5-.5z"/><path d="M24 280l2 5 5 .5-4 3 1.5 5-4.5-2.5-4.5 2.5 1.5-5-4-3 5-.5z"/></g></svg>';
  function shuffle(a, seed) { var r = a.slice(); for (var i = r.length - 1; i > 0; i--) { var x = Math.sin((i + seed) * 91.7) * 1e4; var j = Math.floor((x - Math.floor(x)) * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
  document.querySelectorAll('.model[data-model="diary"]').forEach(function (root) {
    var lines;
    try { lines = JSON.parse(root.dataset.lines); } catch (e) { return; }
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Fix the space diary'));
    var count = h('span', 'dycount'); top.appendChild(count);
    var page = h('div', 'dypage'), doodle = h('div', 'dydoodle'), paper = h('div', 'dypaper'), out = h('div', 'mverdict');
    doodle.innerHTML = DOODLE;
    page.appendChild(h('span', 'dytape dytape1')); page.appendChild(h('span', 'dytape dytape2'));
    page.appendChild(doodle); page.appendChild(paper);
    root.appendChild(top); root.appendChild(page); root.appendChild(out);
    paper.appendChild(h('div', 'dytitle', root.dataset.title || 'My space station diary'));
    if (root.dataset.byline) paper.appendChild(h('div', 'dybyline', root.dataset.byline));
    var st = lines.map(function () { return { done: false, tries: 0 }; }), mistakes = lines.filter(function (l) { return !l.ok; }).length;
    function render() {
      var checked = st.filter(function (x) { return x.done; }).length, fixed = lines.filter(function (l, i) { return !l.ok && st[i].done; }).length;
      count.textContent = 'Checked ' + checked + ' of ' + lines.length + ' · Mistakes fixed ' + fixed + ' of ' + mistakes;
      if (checked === lines.length) { out.className = 'mverdict good'; out.textContent = root.dataset.done || 'Every line checked. Your diary is scientifically accurate.'; }
    }
    lines.forEach(function (l, i) {
      var wrapEl = h('div', 'dyline'), btn = h('button', 'dytext'), choices = h('div', 'dychoices'), fb = h('div', 'dyfb');
      btn.type = 'button';
      var orig = h('span', 'dyorig', l.t), fixed = h('span', 'dyfix', l.ok ? '' : l.fix), mark = h('span', 'dymark');
      btn.appendChild(mark); btn.appendChild(orig); btn.appendChild(fixed);
      wrapEl.appendChild(btn); wrapEl.appendChild(choices); wrapEl.appendChild(fb);
      paper.appendChild(wrapEl);
      var opts = [{ t: 'Keep it as written. It is correct.', right: !!l.ok, keep: true }];
      if (l.ok) opts.push({ t: l.decoy, right: false });
      else { opts.push({ t: l.fix, right: true }); opts.push({ t: l.decoy, right: false }); }
      var shown = [opts[0]].concat(shuffle(opts.slice(1), i + 3));
      shown.forEach(function (o) {
        var c = h('button', 'dychoice' + (o.keep ? ' keep' : ''), o.keep ? o.t : 'Change it to: ' + o.t); c.type = 'button';
        c.addEventListener('click', function () {
          if (st[i].done) return;
          if (o.right) {
            st[i].done = true; wrapEl.classList.add(l.ok ? 'isok' : 'isfixed'); wrapEl.classList.remove('open');
            mark.textContent = l.ok ? '✓' : '✎';
            fb.className = 'dyfb good'; fb.textContent = l.why || '';
          } else {
            st[i].tries++; c.classList.add('nope'); c.disabled = true;
            wrapEl.classList.remove('shake'); void wrapEl.offsetWidth; wrapEl.classList.add('shake');
            fb.className = 'dyfb bad'; fb.textContent = 'Not quite. ' + (l.hint || 'Check your Quick Reference Guide and try again.');
          }
          render();
        });
        choices.appendChild(c);
      });
      btn.addEventListener('click', function () {
        if (st[i].done) return;
        var was = wrapEl.classList.contains('open');
        paper.querySelectorAll('.dyline.open').forEach(function (x) { x.classList.remove('open'); });
        if (!was) wrapEl.classList.add('open');
      });
    });
    out.className = 'mverdict'; out.textContent = root.dataset.start || 'Tap a line in the diary. Is it right, or does it need a fix?';
    render();
  });
})();

/* ---- science model · galaxy shape spotter (v2.26, 2026-11-05): <div class="model" data-model="galaxyspot" data-label="…"
   data-types='[{"k":"spiral","name":"Spiral","look":"…","note":"…"},…]'
   data-cards='[{"src":"images/….jpg","alt":"…","name":"…","type":"spiral","credit":"…"},…]' data-done="…"></div>
   An illustrated observatory monitor (bezel, corner brackets, scan lines, a "target" readout) shows one real telescope
   photograph at a time. The student classifies it with three big buttons, each with a drawn icon of the shape. Right: a
   stamp lands on the screen and the type's guide line shows; wrong: the screen shakes and the type's "look" clue shows.
   Classified photos collect in a filmstrip. Every word comes from the page's data. Teaches the guide's galaxy types. ---- */
(function () {
  'use strict';
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var ICON = {
    spiral: '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 24c0-3 3-5 6-4 5 2 5 9 0 12-7 4-15-1-15-9 0-10 11-15 20-11"/><path d="M24 24c0 3-3 5-6 4-5-2-5-9 0-12 7-4 15 1 15 9 0 10-11 15-20 11"/></g><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>',
    elliptical: '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="18" ry="12" fill="currentColor" opacity=".25"/><ellipse cx="24" cy="24" rx="11" ry="7" fill="currentColor" opacity=".5"/><ellipse cx="24" cy="24" rx="4" ry="3" fill="currentColor"/></svg>',
    irregular: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 26c-2-7 5-12 10-10 3-6 12-5 13 1 6 0 8 7 4 11 2 6-5 10-10 7-4 4-12 2-12-3-4 0-6-3-5-6z" fill="currentColor" opacity=".35"/><g fill="currentColor"><circle cx="18" cy="22" r="2"/><circle cx="28" cy="20" r="1.6"/><circle cx="31" cy="29" r="2.2"/><circle cx="22" cy="31" r="1.5"/></g></svg>'
  };
  document.querySelectorAll('.model[data-model="galaxyspot"]').forEach(function (root) {
    var types, cards;
    try { types = JSON.parse(root.dataset.types); cards = JSON.parse(root.dataset.cards); } catch (e) { return; }
    var byK = {}; types.forEach(function (t) { byK[t.k] = t; });
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Galaxy shape spotter'));
    var count = h('span', 'gscount'); top.appendChild(count);
    var mon = h('div', 'gsmon'), screen = h('div', 'gsscreen'), img = h('img'), scan = h('div', 'gsscan'), stamp = h('div', 'gsstamp');
    var read = h('div', 'gsread'), readL = h('span', 'gsreadl'), readR = h('span', 'gsreadr', 'TELESCOPE FEED');
    ['tl', 'tr', 'bl', 'br'].forEach(function (c) { screen.appendChild(h('span', 'gscorner ' + c)); });
    screen.insertBefore(img, screen.firstChild); screen.appendChild(scan); screen.appendChild(stamp);
    read.appendChild(readL); read.appendChild(readR);
    mon.appendChild(screen); mon.appendChild(read);
    var cap = h('div', 'gscap'), btns = h('div', 'gsbtns'), out = h('div', 'mverdict'), next = h('button', 'btn make gsnext', 'Next galaxy →'), strip = h('div', 'gsstrip');
    next.type = 'button';
    [top, mon, cap, btns, out, next, strip].forEach(function (x) { root.appendChild(x); });
    var cur = 0, st = cards.map(function () { return { done: false, tries: 0 }; });
    types.forEach(function (t) {
      var b = h('button', 'gsbtn'); b.type = 'button'; b.dataset.k = t.k;
      var ic = h('span', 'gsic'); ic.innerHTML = ICON[t.k] || ''; b.appendChild(ic);
      var tx = h('span', 'gstx'); tx.appendChild(h('strong', null, t.name)); tx.appendChild(h('small', null, t.look)); b.appendChild(tx);
      b.addEventListener('click', function () { guess(t.k, b); });
      btns.appendChild(b);
    });
    function show(i) {
      cur = i; var c = cards[i];
      img.src = c.src; img.alt = c.alt;
      readL.textContent = 'TARGET ' + (i + 1) + ' OF ' + cards.length;
      cap.textContent = c.credit || '';
      stamp.className = 'gsstamp'; stamp.textContent = '';
      screen.classList.remove('shake');
      btns.querySelectorAll('.gsbtn').forEach(function (b) { b.disabled = false; b.classList.remove('nope', 'yes'); });
      next.style.display = 'none';
      out.className = 'mverdict'; out.textContent = 'Look at the shape first: arms, a smooth oval, or no clear shape? Then pick.';
      if (st[i].done) reveal(true);
      render();
    }
    function reveal() {
      var c = cards[cur], t = byK[c.type];
      stamp.className = 'gsstamp on ' + c.type; stamp.textContent = t.name.toUpperCase() + ' ✓';
      btns.querySelectorAll('.gsbtn').forEach(function (b) { b.disabled = true; if (b.dataset.k === c.type) b.classList.add('yes'); });
      out.className = 'mverdict good'; out.textContent = (c.name ? c.name + ': ' : '') + t.name.toLowerCase() + '. ' + t.note;
      var left = st.findIndex(function (x) { return !x.done; });
      next.style.display = left >= 0 ? '' : 'none';
      if (left < 0 && root.dataset.done) { out.appendChild(h('div', 'mhint', root.dataset.done)); }
    }
    function guess(k, b) {
      var c = cards[cur];
      if (st[cur].done) return;
      if (k === c.type) {
        st[cur].done = true;
        var th = strip.querySelector('[data-i="' + cur + '"]');
        if (!th) {
          th = h('button', 'gsthumb ' + c.type); th.type = 'button'; th.dataset.i = cur;
          var ti = h('img'); ti.src = c.src; ti.alt = ''; th.appendChild(ti); th.appendChild(h('span', null, byK[c.type].name));
          var idx = cur; th.addEventListener('click', function () { show(idx); });
          strip.appendChild(th);
        }
        reveal();
      } else {
        st[cur].tries++; b.classList.add('nope'); b.disabled = true;
        screen.classList.remove('shake'); void screen.offsetWidth; screen.classList.add('shake');
        out.className = 'mverdict bad'; out.textContent = 'Not this time. ' + byK[k].name + ' galaxies have ' + byK[k].look.toLowerCase() + '. Look again at this one.';
      }
      render();
    }
    function render() {
      var n = st.filter(function (x) { return x.done; }).length;
      count.textContent = 'Classified ' + n + ' of ' + cards.length;
    }
    next.addEventListener('click', function () {
      for (var j = 1; j <= cards.length; j++) { var i = (cur + j) % cards.length; if (!st[i].done) { show(i); return; } }
    });
    show(0);
  });
})();

/* ---- science model · scale stack (v2.26, 2026-11-05): <div class="model" data-model="scalestack" data-label="…" data-alt="…"
   data-items='[{"k":"earth"|"solar"|"milkyway"|"universe","name":"…","fact":"…"},…]' (smallest first) data-done="…"></div>
   An illustrated zoom-out. Shuffled cards (each with a drawn icon) wait below a starry stage; the student picks what comes
   next, smallest first. Each right pick draws its level and the camera pulls back so the previous level shrinks into its
   place inside the new one (Earth on its orbit, the solar system on a Milky Way arm with "you are here", the Milky Way
   among many galaxies). A wrong pick shakes. A chain "Earth → … → Universe" builds as you go. Teaches the guide's "Our
   place in the universe": Earth is a tiny part of a vast universe, and it is not at the center. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', W = 600, H = 360, uid = 0;
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, a, parent) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 7.3) * 43758.5453; return x - Math.floor(x); }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function grad(defs, type, stops, a) {
    var id = 'ss' + (uid++), g = s(type, Object.assign({ id: id }, a || {}), defs);
    stops.forEach(function (st) { s('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] == null ? 1 : st[2] }, g); });
    return 'url(#' + id + ')';
  }
  /* each level is drawn around (0,0) within radius ~150; ANCHOR[k] is where level k sits inside level k+1, SC its size there */
  var ANCHOR = [[64, -64], [108, 50], [-60, 26]], SC = [0.06, 0.09, 0.16];
  var LEVEL = {
    earth: function (g, defs) {
      s('circle', { r: 70, fill: '#5fb4ff', opacity: 0.16 }, g);
      s('circle', { r: 60, fill: grad(defs, 'radialGradient', [['0', '#5fb0ff'], ['0.7', '#2f7fd8'], ['1', '#1d4f9a']], { cx: '38%', cy: '35%' }) }, g);
      s('path', { d: 'M-34 -22 q16 -20 34 -4 q10 14 -8 24 q-18 6 -26 -20 Z', fill: '#4caf50' }, g);
      s('path', { d: 'M12 14 q20 -6 28 10 q-6 18 -24 16 q-12 -10 -4 -26 Z', fill: '#43a047' }, g);
      s('path', { d: 'M-46 4 q30 -10 66 6 M-30 30 q20 6 40 0', fill: 'none', stroke: '#ffffff', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.6 }, g);
    },
    solar: function (g, defs) {
      [40, 90, 122, 146].forEach(function (r) { s('circle', { r: r, fill: 'none', stroke: '#9fc2ff', 'stroke-width': 1.5, opacity: 0.35, 'stroke-dasharray': '3 5' }, g); });
      s('circle', { r: 34, fill: '#ffcf4a', opacity: 0.22 }, g);
      s('circle', { r: 22, fill: grad(defs, 'radialGradient', [['0', '#fff6c2'], ['0.6', '#ffcf3f'], ['1', '#ff9a1f']]) }, g);
      [[40, 200, '#c9b29b', 3.5], [122, 20, '#e07a4b', 5], [146, 150, '#e8c48a', 8]].forEach(function (p) {
        var a = p[1] * Math.PI / 180; s('circle', { cx: Math.cos(a) * p[0], cy: Math.sin(a) * p[0], r: p[3], fill: p[2] }, g);
      });
    },
    milkyway: function (g, defs) {
      var tilt = s('g', { transform: 'rotate(-18)' }, g);
      s('circle', { r: 150, fill: grad(defs, 'radialGradient', [['0', '#fff1d6', 0.9], ['0.15', '#ffd59a', 0.55], ['0.55', '#7d6cff', 0.18], ['1', '#3a2a8a', 0]]) }, tilt);
      var cols = ['#d8ccff', '#a9cbff', '#ffe3f3'];
      for (var arm = 0; arm < 4; arm++) for (var k = 0; k < 90; k++) {
        var t = k / 90, a = arm * Math.PI / 2 + t * 4.2, rr = 18 + t * 130;
        s('circle', { cx: Math.cos(a) * rr + (rnd(arm * 300 + k) - 0.5) * 12 * t, cy: Math.sin(a) * rr + (rnd(arm * 300 + k + 9) - 0.5) * 12 * t, r: 0.8 + (1 - t) * 1.8 * rnd(k + arm * 7), fill: cols[(k + arm) % 3], opacity: 0.5 + 0.5 * (1 - t) }, tilt);
      }
      s('ellipse', { rx: 22, ry: 16, fill: '#fff6e0' }, tilt);
    },
    universe: function (g, defs) {
      for (var i = 0; i < 46; i++) {
        var x = (rnd(i + 3) - 0.5) * 560, y = (rnd(i + 71) - 0.5) * 330;
        if (Math.abs(x - ANCHOR[2][0]) < 42 && Math.abs(y - ANCHOR[2][1]) < 42) continue;
        var sc = 0.5 + rnd(i + 5) * 1.1, rot = rnd(i + 8) * 180, kind = i % 3, c = ['#cdbbff', '#ffd9a8', '#a9cbff'][i % 3];
        var gg = s('g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + sc + ')' }, g);
        if (kind === 0) { s('ellipse', { rx: 12, ry: 5, fill: c, opacity: 0.35 }, gg); s('path', { d: 'M-10 0 q5 -7 10 0 q5 7 10 0', fill: 'none', stroke: c, 'stroke-width': 1.6, opacity: 0.9 }, gg); s('circle', { r: 2.2, fill: '#fff' }, gg); }
        else if (kind === 1) { s('ellipse', { rx: 8, ry: 5.5, fill: c, opacity: 0.55 }, gg); s('ellipse', { rx: 3, ry: 2, fill: '#fff6e0' }, gg); }
        else { s('path', { d: 'M-7 1 q1 -6 6 -4 q5 -3 7 2 q2 5 -4 6 q-6 2 -9 -4 Z', fill: c, opacity: 0.6 }, gg); }
      }
    }
  };
  var ICON = {
    earth: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#2f7fd8"/><path d="M9 15q6-7 12-2q3 5-3 8q-6 2-9-6z" fill="#4caf50"/><path d="M22 24q7-2 9 4q-2 5-8 4q-4-3-1-8z" fill="#43a047"/></svg>',
    solar: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#9fc2ff" stroke-dasharray="2 3"/><circle cx="20" cy="20" r="10" fill="none" stroke="#9fc2ff" stroke-dasharray="2 3"/><circle cx="20" cy="20" r="5" fill="#ffcf3f"/><circle cx="30" cy="20" r="2.4" fill="#2f7fd8"/><circle cx="8" cy="12" r="2.6" fill="#e8c48a"/></svg>',
    milkyway: '<svg viewBox="0 0 40 40"><g fill="none" stroke="#c8b8ff" stroke-width="2.4" stroke-linecap="round"><path d="M20 20c0-3 3-4 5-3 4 2 4 8 0 10-6 3-12-1-12-7 0-8 9-12 16-9"/><path d="M20 20c0 3-3 4-5 3-4-2-4-8 0-10 6-3 12 1 12 7 0 8-9 12-16 9"/></g><circle cx="20" cy="20" r="3" fill="#fff1d6"/></svg>',
    universe: '<svg viewBox="0 0 40 40"><g fill="#cdbbff"><ellipse cx="9" cy="10" rx="5" ry="2.4" transform="rotate(20 9 10)"/><ellipse cx="29" cy="9" rx="4" ry="3"/><ellipse cx="20" cy="22" rx="6" ry="2.6" transform="rotate(-25 20 22)"/><ellipse cx="9" cy="31" rx="3.6" ry="2.4"/><ellipse cx="31" cy="30" rx="5" ry="2.2" transform="rotate(35 31 30)"/></g><g fill="#fff"><circle cx="9" cy="10" r="1"/><circle cx="20" cy="22" r="1.2"/><circle cx="31" cy="30" r="1"/></g></svg>'
  };
  document.querySelectorAll('.model[data-model="scalestack"]').forEach(function (root) {
    var items;
    try { items = JSON.parse(root.dataset.items); } catch (e) { return; }
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Scale stack'));
    var stage = h('div', 'ssstage'), chain = h('div', 'sschain'), pool = h('div', 'sspool'), out = h('div', 'mverdict'), again = h('button', 'reset', 'Start over');
    again.type = 'button';
    [top, stage, chain, pool, out, again].forEach(function (x) { root.appendChild(x); });
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': root.dataset.alt || 'A zoom-out from Earth to the universe.' });
    stage.appendChild(svg);
    var defs = s('defs', {}, svg);
    s('rect', { width: W, height: H, fill: grad(defs, 'radialGradient', [['0', '#1c2a5e'], ['1', '#060a1a']]) }, svg);
    for (var i = 0; i < 90; i++) s('circle', { cx: rnd(i) * W, cy: rnd(i + 50) * H, r: 0.5 + rnd(i + 9) * 1.2, fill: '#ffffff', opacity: 0.3 + rnd(i + 2) * 0.6 }, svg);
    var cam = s('g', {}, svg), groups = [], marks = [];
    /* level k's placement inside the universe frame: P(3) = identity; P(k) = P(k+1) · translate(ANCHOR[k]) · scale(SC[k]) */
    var P = [];
    for (var k = 3; k >= 0; k--) {
      if (k === 3) P[k] = { x: 0, y: 0, s: 1 };
      else P[k] = { x: P[k + 1].x + ANCHOR[k][0] * P[k + 1].s, y: P[k + 1].y + ANCHOR[k][1] * P[k + 1].s, s: P[k + 1].s * SC[k] };
    }
    var KEYS = ['earth', 'solar', 'milkyway', 'universe'];
    for (k = 3; k >= 0; k--) {
      var g = s('g', { transform: 'translate(' + P[k].x + ' ' + P[k].y + ') scale(' + P[k].s + ')', opacity: 0 }, cam);
      LEVEL[KEYS[k]](g, defs); groups[k] = g;
    }
    /* "you are here" marker on the Milky Way (sits in Milky Way coordinates, at the solar system's anchor) */
    var you = s('g', { opacity: 0 }, svg);
    s('circle', { r: 9, fill: 'none', stroke: '#ffe066', 'stroke-width': 2.5, 'class': 'ss-ping' }, you);
    s('path', { d: 'M0 -12 L-7 -24 H7 Z', fill: '#ffe066' }, you);
    var youT = s('text', { y: -30, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 900, fill: '#ffe066' }, you); youT.textContent = 'YOU ARE HERE';
    var placed = 0, z = 0, zFrom = 0, zTo = 0, t0 = 0, raf = 0, wrong = {};
    function camFor(zz) {
      var a = Math.floor(zz), f = zz - a, b = Math.min(3, a + 1);
      if (a >= 3) { a = 3; b = 3; f = 0; }
      var fs = 135 / 150;   /* the top level fills most of the stage */
      var la = Math.log(P[a].s), lb = Math.log(P[b].s), sc = Math.exp(la + (lb - la) * f);
      var x = P[a].x + (P[b].x - P[a].x) * f, y = P[a].y + (P[b].y - P[a].y) * f;
      return { s: fs / sc, x: x, y: y };
    }
    function draw(now) {
      raf = 0;
      var t = still ? 1 : clamp((now - t0) / 1600);
      z = zFrom + (zTo - zFrom) * ease(t);
      var c = camFor(z);
      cam.setAttribute('transform', 'translate(' + W / 2 + ' ' + H / 2 + ') scale(' + c.s + ') translate(' + (-c.x) + ' ' + (-c.y) + ')');
      groups.forEach(function (g, k) { g.setAttribute('opacity', k < placed ? 1 : 0); });
      /* the marker follows the solar system's spot while the Milky Way is the top level */
      if (placed >= 3) {
        var px = W / 2 + (P[1].x - c.x) * c.s, py = H / 2 + (P[1].y - c.y) * c.s;
        you.setAttribute('transform', 'translate(' + px + ' ' + py + ')');
        you.setAttribute('opacity', clamp(1 - Math.abs(z - 2) * 1.2));
      } else you.setAttribute('opacity', 0);
      if (t < 1) raf = requestAnimationFrame(draw);
    }
    function go(toZ) { zFrom = z; zTo = toZ; t0 = performance.now(); if (!raf) raf = requestAnimationFrame(draw); }
    var order = [3, 1, 0, 2];   /* fixed shuffle so every student sees the same, non-sorted order */
    function build() {
      pool.innerHTML = ''; chain.innerHTML = '';
      order.forEach(function (idx) {
        var it = items[idx]; if (!it) return;
        var b = h('button', 'sscard'); b.type = 'button'; b.dataset.i = idx;
        var ic = h('span', 'ssic'); ic.innerHTML = ICON[it.k] || ''; b.appendChild(ic); b.appendChild(h('strong', null, it.name));
        b.addEventListener('click', function () { pick(idx, b); });
        pool.appendChild(b);
      });
      items.forEach(function (it, j) {
        if (j) chain.appendChild(h('span', 'ssarrow', '→'));
        chain.appendChild(h('span', 'sslink', '?'));
      });
    }
    function pick(idx, b) {
      if (b.classList.contains('used')) return;
      if (idx === placed) {
        b.classList.add('used'); b.disabled = true;
        chain.querySelectorAll('.sslink')[idx].textContent = items[idx].name;
        chain.querySelectorAll('.sslink')[idx].classList.add('on');
        placed++;
        out.className = 'mverdict good'; out.textContent = items[idx].fact;
        if (placed === items.length && root.dataset.done) out.appendChild(h('div', 'mhint', root.dataset.done));
        go(Math.min(3, placed - 1));
      } else {
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        out.className = 'mverdict bad';
        out.textContent = placed === 0 ? 'Start with the smallest. Which one fits inside all the others?' : 'Not yet. What is the next size up from ' + items[placed - 1].name + '?';
      }
    }
    again.addEventListener('click', function () { placed = 0; z = 0; build(); go(0); out.className = 'mverdict'; out.textContent = root.dataset.start || 'Tap the smallest one first.'; });
    build(); out.className = 'mverdict'; out.textContent = root.dataset.start || 'Tap the smallest one first.';
    go(0);
  });
})();

/* ---- science model · connect the constellation (v2.26, 2026-11-05): <div class="model" data-model="constellation" data-label="…"
   data-sets='[{"k":"…","name":"…","stars":[{"n":"…","x":120,"y":80,"m":1},…],"lines":[[0,1],…],"done":"…"},…]' data-done="…"></div>
   A polished night sky (gradient, twinkling background stars, a hill and observatory silhouette on the horizon). The set's
   bright stars glow; the student taps one star, then another, to draw a line. A line that belongs to the pattern turns gold
   and stays; a line that does not flashes red and fades. Hint pulses both ends of a missing line. When every line is drawn
   the figure glows and the set's `done` text shows. Star names appear on hover/tap. Practice for the assignment's bonus:
   draw a real constellation accurately. ---- */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', W = 600, H = 380;
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, a, parent) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 7.3) * 43758.5453; return x - Math.floor(x); }
  var uid = 0;
  document.querySelectorAll('.model[data-model="constellation"]').forEach(function (root) {
    var sets;
    try { sets = JSON.parse(root.dataset.sets); } catch (e) { return; }
    var top = h('div', 'mtop'); top.appendChild(h('span', 'mlabel', root.dataset.label || 'Connect the constellation'));
    var row = h('div', 'mpicks'), stage = h('div', 'csstage'), bar = h('div', 'csbar'), out = h('div', 'mverdict');
    var cnt = h('span', 'cscount'), hint = h('button', 'mpick', 'Hint'), clr = h('button', 'mpick', 'Clear lines');
    hint.type = clr.type = 'button'; bar.appendChild(cnt); bar.appendChild(hint); bar.appendChild(clr);
    [top, row, stage, bar, out].forEach(function (x) { root.appendChild(x); });
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'A night sky. Tap one bright star, then another, to draw the constellation.' });
    stage.appendChild(svg);
    var defs = s('defs', {}, svg), gid = 'csg' + (uid++), gr = s('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [['0', '#060b22'], ['0.6', '#14214f'], ['1', '#2c3f78']].forEach(function (st) { s('stop', { offset: st[0], 'stop-color': st[1] }, gr); });
    s('rect', { width: W, height: H, fill: 'url(#' + gid + ')' }, svg);
    s('path', { d: 'M-20 ' + (H - 80) + ' C 120 ' + (H - 160) + ', 260 ' + (H - 40) + ', 420 ' + (H - 120) + ' S 640 ' + (H - 70) + ', 660 ' + (H - 90), fill: 'none', stroke: '#9fb6ff', 'stroke-width': 60, opacity: 0.05 }, svg);
    for (var i = 0; i < 120; i++) s('circle', { cx: rnd(i) * W, cy: rnd(i + 31) * (H - 60), r: 0.4 + rnd(i + 7) * 1.1, fill: '#ffffff', 'class': 'cs-tw' + (i % 3), opacity: 0.6 }, svg);
    s('path', { d: 'M0 ' + (H - 34) + ' Q 90 ' + (H - 70) + ' 190 ' + (H - 44) + ' T 380 ' + (H - 40) + ' Q 480 ' + (H - 66) + ' ' + W + ' ' + (H - 38) + ' V' + H + ' H0 Z', fill: '#0a0f22' }, svg);
    var dome = s('g', { transform: 'translate(470 ' + (H - 60) + ')' }, svg);
    s('rect', { x: -18, y: 0, width: 36, height: 22, fill: '#0a0f22' }, dome);
    s('path', { d: 'M-20 1 A20 20 0 0 1 20 1 Z', fill: '#0a0f22' }, dome);
    s('rect', { x: -3, y: -19, width: 6, height: 14, fill: '#1a2550' }, dome);
    s('circle', { cx: 9, cy: 12, r: 2, fill: '#ffd36b' }, dome);
    var lineG = s('g', {}, svg), flashG = s('g', {}, svg), starG = s('g', {}, svg);
    var nameT = s('text', { 'font-size': 13, 'font-weight': 800, fill: '#cfe0ff', 'text-anchor': 'middle', opacity: 0 }, svg);
    var title = s('text', { x: W / 2, y: 34, 'font-size': 22, 'font-weight': 900, fill: '#ffe066', 'text-anchor': 'middle', 'letter-spacing': 3, opacity: 0, 'class': 'cs-title' }, svg);
    var set = null, drawn = {}, sel = -1, stars = [];
    function key(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
    function load(st) {
      set = st; drawn = {}; sel = -1;
      while (lineG.firstChild) lineG.removeChild(lineG.firstChild);
      while (starG.firstChild) starG.removeChild(starG.firstChild);
      title.setAttribute('opacity', 0); title.textContent = st.name.toUpperCase(); stage.classList.remove('csdone');
      stars = st.stars.map(function (p, j) {
        var g = s('g', { transform: 'translate(' + p.x + ' ' + p.y + ')', 'class': 'csstar', tabindex: 0, role: 'button', 'aria-label': p.n }, starG);
        var r = 3.2 + (p.m != null ? (2.5 - Math.min(2.5, p.m)) * 1.4 : 1.5);
        s('circle', { r: 16, fill: 'transparent' }, g);
        s('circle', { r: r * 3.2, fill: '#cfe3ff', opacity: 0.16 }, g);
        var core = s('circle', { r: r, fill: '#ffffff' }, g);
        s('path', { d: 'M0 ' + (-r * 2.6) + ' V' + (r * 2.6) + ' M' + (-r * 2.6) + ' 0 H' + (r * 2.6), stroke: '#ffffff', 'stroke-width': 1, opacity: 0.55 }, g);
        var ring = s('circle', { r: r + 7, fill: 'none', stroke: '#ffe066', 'stroke-width': 2.5, opacity: 0 }, g);
        g.addEventListener('click', function () { tap(j); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(j); } });
        g.addEventListener('mouseenter', function () { showName(j); });
        g.addEventListener('mouseleave', function () { nameT.setAttribute('opacity', 0); });
        return { g: g, ring: ring, core: core, p: p };
      });
      row.querySelectorAll('.mpick').forEach(function (b) { b.classList.toggle('on', b.dataset.k === st.k); });
      out.className = 'mverdict'; out.textContent = 'Tap a bright star, then tap the star it connects to. Build the whole pattern.';
      render();
    }
    function showName(j) { var p = stars[j].p; set_(nameT, { x: p.x, y: p.y + 30, opacity: 1 }); nameT.textContent = p.n; }
    function set_(e, a) { for (var k in a) e.setAttribute(k, a[k]); }
    function tap(j) {
      showName(j);
      if (sel < 0) { sel = j; stars[j].ring.setAttribute('opacity', 1); return; }
      if (sel === j) { stars[j].ring.setAttribute('opacity', 0); sel = -1; return; }
      var a = sel, b = j, k = key(a, b), pa = stars[a].p, pb = stars[b].p;
      stars[a].ring.setAttribute('opacity', 0); sel = -1;
      var ok = set.lines.some(function (l) { return key(l[0], l[1]) === k; });
      if (ok && !drawn[k]) {
        drawn[k] = true;
        s('line', { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, stroke: '#ffe066', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'class': 'cs-draw' }, lineG);
        out.className = 'mverdict good'; out.textContent = 'Yes, ' + pa.n + ' connects to ' + pb.n + '.';
      } else if (!ok) {
        var ln = s('line', { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, stroke: '#ff6b6b', 'stroke-width': 2.4, 'stroke-dasharray': '6 5', 'class': 'cs-flash' }, flashG);
        setTimeout(function () { if (ln.parentNode) ln.parentNode.removeChild(ln); }, 900);
        out.className = 'mverdict bad'; out.textContent = 'Those two are not connected in this pattern. Look at the shape again.';
      }
      render();
    }
    function render() {
      var n = Object.keys(drawn).length, total = set.lines.length;
      cnt.textContent = 'Lines ' + n + ' of ' + total;
      if (n === total) {
        stage.classList.add('csdone'); title.setAttribute('opacity', 1);
        out.className = 'mverdict good'; out.textContent = set.done || 'Constellation complete.';
        var all = sets.every(function (x) { return x.complete || x === set; }); set.complete = true;
        row.querySelectorAll('.mpick').forEach(function (b) { if (b.dataset.k === set.k) b.classList.add('sdone'); });
        if (sets.every(function (x) { return x.complete; }) && root.dataset.done) out.appendChild(h('div', 'mhint', root.dataset.done));
      }
    }
    hint.addEventListener('click', function () {
      var miss = set.lines.find(function (l) { return !drawn[key(l[0], l[1])]; });
      if (!miss) return;
      [miss[0], miss[1]].forEach(function (j) { var g = stars[j].g; g.classList.remove('cs-hint'); void g.getBBox(); g.classList.add('cs-hint'); });
      out.className = 'mverdict'; out.textContent = 'Try connecting the two pulsing stars: ' + stars[miss[0]].p.n + ' and ' + stars[miss[1]].p.n + '.';
    });
    clr.addEventListener('click', function () { load(set); });
    sets.forEach(function (st) {
      var b = h('button', 'mpick', st.name); b.type = 'button'; b.dataset.k = st.k;
      b.addEventListener('click', function () { load(st); }); row.insertBefore(b, null);
    });
    load(sets[0]);
  });
})();

/* =====================================================================
   "You Make the Call!" referee game (PE, v1.0 2026-11-06).
   Markup contract (no per-lesson JS):
     .refgame[data-badge][data-done]
       .round[data-correct][data-hint]
         .scene            — the play, in words
         .calls button[data-choice][data-fb]
   The script builds a scoreboard, deals one play at a time, scores
   first-try calls with a star, and ends with a badge + confetti.
   ===================================================================== */
(function () {
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function h(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  document.querySelectorAll('.refgame').forEach(function (g) {
    var rounds = [].slice.call(g.querySelectorAll('.round'));
    if (!rounds.length) return;
    var N = rounds.length, i = 0, tries = 0, score = 0;

    /* scoreboard */
    var board = h('div', 'rg-board');
    var title = h('div', 'rg-title', "📣 You're the ref");
    var meta = h('div', 'rg-roundno', '');
    var slots = h('div', 'rg-score');
    var slotEls = rounds.map(function () { var s = h('span', 'rg-slot', ''); slots.appendChild(s); return s; });
    board.appendChild(title); board.appendChild(meta); board.appendChild(slots);
    g.insertBefore(board, g.firstChild);

    /* verdict strip + next button */
    var foot = h('div', 'rg-foot');
    var verdict = h('div', 'rg-verdict'); verdict.setAttribute('aria-live', 'polite');
    var next = h('button', 'btn make rg-next', 'Next play →'); next.type = 'button'; next.hidden = true;
    foot.appendChild(verdict); foot.appendChild(next);
    g.appendChild(foot);

    function show(n) {
      i = n; tries = 0;
      rounds.forEach(function (r, k) { r.classList.toggle('on', k === n); });
      meta.textContent = 'Play ' + (n + 1) + ' of ' + N;
      verdict.className = 'rg-verdict'; verdict.textContent = '';
      next.hidden = true;
    }

    g.addEventListener('click', function (e) {
      var b = e.target.closest('.calls button');
      if (!b || b.disabled || !g.contains(b)) return;
      var r = b.closest('.round');
      if (!r || !r.classList.contains('on')) return;
      tries++;
      if (b.dataset.choice === r.dataset.correct) {
        b.classList.add('correct');
        r.querySelectorAll('.calls button').forEach(function (x) { x.disabled = true; });
        if (tries === 1) { score++; slotEls[i].classList.add('won'); slotEls[i].textContent = '★'; }
        else { slotEls[i].classList.add('ok'); slotEls[i].textContent = '✓'; }
        verdict.className = 'rg-verdict good';
        verdict.textContent = '🟢 GOOD CALL! ' + (b.dataset.fb || '');
        next.hidden = false;
        next.textContent = (i === N - 1) ? 'See my ref report 🏅' : 'Next play →';
      } else {
        b.classList.add('incorrect'); b.disabled = true;
        verdict.className = 'rg-verdict foul';
        verdict.textContent = '🟠 FWEEET! That’s a foul. ' + (r.dataset.hint ? r.dataset.hint + ' ' : '') + 'Try again.';
      }
    });

    next.addEventListener('click', function () {
      if (i < N - 1) { show(i + 1); return; }
      finale();
    });

    function finale() {
      g.classList.add('done');
      var fin = h('div', 'rg-final');
      fin.appendChild(h('div', 'rg-badge', '🏅'));
      fin.appendChild(h('div', 'rg-fintitle', g.dataset.badge || 'Certified Good-Sport Ref'));
      fin.appendChild(h('p', 'rg-finline', score === N
        ? 'Perfect game — ' + N + ' out of ' + N + ' first-try calls!'
        : 'You made ' + score + ' out of ' + N + ' calls on the first try.'));
      if (g.dataset.done) fin.appendChild(h('p', 'rg-finmsg', g.dataset.done));
      var again = h('button', 'reset rg-again', 'Ref it again'); again.type = 'button';
      again.addEventListener('click', reset);
      fin.appendChild(again);
      g.appendChild(fin);
      if (!REDUCE) confetti();
    }

    function confetti() {
      var c = h('div', 'rg-confetti'), colors = ['#55C8E8', '#C7922C', '#76C043', '#A53E97', '#E4553F'];
      for (var k = 0; k < 40; k++) {
        var p = h('i');
        p.style.left = (Math.random() * 100) + '%';
        p.style.background = colors[k % colors.length];
        p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
        p.style.animationDelay = (Math.random() * 0.7) + 's';
        c.appendChild(p);
      }
      g.appendChild(c);
      setTimeout(function () { c.remove(); }, 4000);
    }

    function reset() {
      score = 0;
      slotEls.forEach(function (s) { s.className = 'rg-slot'; s.textContent = ''; });
      rounds.forEach(function (r) {
        r.querySelectorAll('.calls button').forEach(function (x) { x.disabled = false; x.classList.remove('correct', 'incorrect'); });
      });
      g.classList.remove('done');
      var fin = g.querySelector('.rg-final'); if (fin) fin.remove();
      show(0);
    }

    show(0);
  });
})();
