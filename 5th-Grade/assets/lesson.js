/* ==========================================================
   MISSION: MOVE! — 5th GRADE PE  ·  Shared lesson framework
   Linked by every unit lesson. Drives the briefing intro,
   sticky progress rail, scroll-reveal, and the Mission
   Complete payoff, plus a set of data-attribute widgets so
   each lesson needs little or no custom JS.

   Generic widgets (add the data-attrs in the HTML):
     • Progress rail  — #trSteps .tr-dot[data-go] + #trPct
     • Flip cards     — .flipgrid[data-done-step] > .flip
     • Flashcards     — .cards[data-done-step] > .vc  (+ [data-flip-all])
     • Tap explorer   — .sys-grid[data-done-step] > .sys
     • Reveal button  — [data-reveal="id"][data-done-step]
                        (+ [data-done-text], [data-art="id"])
     • Tally ring     — .chips[data-done-step][data-target]
                        [data-ring][data-num][data-msg] > .chip[data-min]
     • Journal        — .journal[data-done-step] textarea[data-key]
   Bespoke activities call  window.Mission.markDone('stepId').
   ========================================================== */
(function () {
  "use strict";

  var doneSet = {}, STEPS = [], dotByStep = {}, pctEl = null, finished = false;

  function markDone(step) {
    if (!step || doneSet[step]) return;
    doneSet[step] = true;
    var d = dotByStep[step];
    if (d) d.classList.add('done');
    var n = Object.keys(doneSet).length;
    if (pctEl && STEPS.length) pctEl.textContent = Math.round(n / STEPS.length * 100) + '%';
    if (STEPS.length && n >= STEPS.length) finishMission();
  }

  function finishMission() {
    if (finished) return; finished = true;
    var c = document.getElementById('complete');
    if (!c) return;
    c.classList.add('show');
    var colors = ['#55C8E8', '#C7922C', '#76C043', '#F78F1E', '#A53E97', '#fff'];
    for (var i = 0; i < 26; i++) {
      var b = document.createElement('span');
      b.className = 'burst';
      b.style.background = colors[i % colors.length];
      b.style.left = (10 + Math.random() * 80) + '%';
      b.style.top = (18 + Math.random() * 30) + '%';
      b.style.setProperty('--dx', ((Math.random() * 2 - 1) * 220).toFixed(0) + 'px');
      b.style.setProperty('--dy', (120 + Math.random() * 160).toFixed(0) + 'px');
      b.style.animationDelay = (Math.random() * 0.3) + 's';
      c.appendChild(b);
    }
    c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var rf = document.getElementById('rankFill');
    setTimeout(function () { c.classList.add('in'); if (rf) rf.style.width = '20%'; }, 120);
  }

  // expose immediately so bespoke inline scripts can call it at any time
  window.Mission = { markDone: markDone, finish: finishMission };

  function init() {
    /* ---------- MISSION BRIEFING ---------- */
    var briefing = document.getElementById('briefing');
    if (briefing) {
      var close = function () {
        briefing.classList.add('hide');
        setTimeout(function () { briefing.style.display = 'none'; }, 750);
      };
      var bb = document.getElementById('beginBtn'), sb = document.getElementById('skipBtn');
      if (bb) bb.addEventListener('click', close);
      if (sb) sb.addEventListener('click', close);
      var sc = ['#55C8E8', '#C7922C', '#76C043', '#F78F1E', '#A53E97'];
      for (var i = 0; i < 16; i++) {
        var s = document.createElement('span');
        s.className = 'spark';
        var sz = 4 + Math.random() * 7;
        s.style.width = sz + 'px'; s.style.height = sz + 'px';
        s.style.background = sc[i % sc.length];
        s.style.left = (Math.random() * 100) + '%';
        s.style.bottom = (Math.random() * 40) + '%';
        s.style.animationDuration = (3.5 + Math.random() * 3.5) + 's';
        s.style.animationDelay = (Math.random() * 4) + 's';
        briefing.appendChild(s);
      }
    }

    /* ---------- PROGRESS RAIL ---------- */
    pctEl = document.getElementById('trPct');
    document.querySelectorAll('#trSteps .tr-dot').forEach(function (d) {
      var go = d.getAttribute('data-go');
      if (!go) return;
      STEPS.push(go);
      dotByStep[go] = d;
      d.addEventListener('click', function () {
        var el = document.getElementById(go);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* ---------- FLIP CARDS ---------- */
    document.querySelectorAll('.flipgrid').forEach(function (grid) {
      var step = grid.getAttribute('data-done-step');
      var flips = grid.querySelectorAll('.flip'), seen = {}, done = 0;
      flips.forEach(function (f, i) {
        f.addEventListener('click', function () {
          f.classList.toggle('on');
          if (f.classList.contains('on') && !seen[i]) {
            seen[i] = true; done++;
            if (step && done >= flips.length) markDone(step);
          }
        });
      });
    });

    /* ---------- VOCAB FLASHCARDS ---------- */
    document.querySelectorAll('.cards').forEach(function (cards) {
      var step = cards.getAttribute('data-done-step');
      var vcs = cards.querySelectorAll('.vc'), seen = {}, done = 0;
      vcs.forEach(function (v, i) {
        v.addEventListener('click', function () {
          v.classList.toggle('on');
          if (v.classList.contains('on') && !seen[i]) {
            seen[i] = true; done++;
            if (step && done >= vcs.length) markDone(step);
          }
        });
      });
      var scope = cards.closest('.act') || document;
      var fa = scope.querySelector('[data-flip-all]') || document.getElementById('flipAll');
      if (fa) {
        var all = false;
        fa.addEventListener('click', function () {
          all = !all;
          vcs.forEach(function (v, i) {
            v.classList.toggle('on', all);
            if (all && !seen[i]) { seen[i] = true; done++; }
          });
          if (step && done >= vcs.length) markDone(step);
          fa.textContent = all ? 'Flip back' : 'Flip all';
        });
      }
    });

    /* ---------- TAP EXPLORER (power-on grid) ---------- */
    document.querySelectorAll('.sys-grid').forEach(function (grid) {
      var step = grid.getAttribute('data-done-step');
      var cells = grid.querySelectorAll('.sys'), lit = 0;
      cells.forEach(function (s) {
        s.addEventListener('click', function () {
          if (!s.classList.contains('lit')) {
            s.classList.add('lit'); lit++;
            if (step && lit >= cells.length) markDone(step);
          }
        });
      });
    });

    /* ---------- REVEAL BUTTON (stagger cards in) ---------- */
    document.querySelectorAll('[data-reveal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-reveal'));
        if (!target) return;
        var artId = btn.getAttribute('data-art');
        if (artId) {
          var art = document.getElementById(artId);
          if (art) { art.classList.remove('go'); void art.offsetWidth; art.classList.add('go'); }
        }
        var items = target.querySelectorAll('.benefit');
        items.forEach(function (c, i) { setTimeout(function () { c.classList.add('show'); }, 300 + i * 420); });
        btn.disabled = true;
        var dt = btn.getAttribute('data-done-text');
        if (dt) btn.textContent = dt;
        var step = btn.getAttribute('data-done-step');
        if (step) setTimeout(function () { markDone(step); }, 300 + items.length * 420);
      });
    });

    /* ---------- TALLY RING (chips add toward a target) ---------- */
    document.querySelectorAll('.chips[data-target]').forEach(function (chips) {
      var step = chips.getAttribute('data-done-step');
      var target = parseInt(chips.getAttribute('data-target'), 10) || 60;
      var ring = document.getElementById(chips.getAttribute('data-ring'));
      var numEl = document.getElementById(chips.getAttribute('data-num'));
      var msgEl = document.getElementById(chips.getAttribute('data-msg'));
      var unit = chips.getAttribute('data-unit') || 'min';
      var CIRC = 326.7, total = 0;
      var baseMsg = msgEl ? msgEl.innerHTML : '';
      chips.querySelectorAll('.chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          var m = parseInt(chip.getAttribute('data-min'), 10) || 0;
          if (chip.classList.toggle('on')) total += m; else total -= m;
          if (total < 0) total = 0;
          var capped = Math.min(total, target);
          if (ring) ring.style.strokeDashoffset = CIRC - (CIRC * capped / target);
          if (numEl) numEl.textContent = total;
          if (msgEl) {
            if (total === 0) { if (ring) ring.style.stroke = '#76C043'; msgEl.innerHTML = baseMsg; }
            else if (total < target) { if (ring) ring.style.stroke = '#F78F1E'; msgEl.innerHTML = '<strong>' + (target - total) + ' ' + unit + ' to go.</strong> See how it stacks up from little pieces?'; }
            else { if (ring) ring.style.stroke = '#76C043'; msgEl.innerHTML = '<strong>Goal reached — ' + total + ' ' + unit + '! 🎉</strong> That adds up to a full, healthy effort.'; if (step) markDone(step); }
          } else if (total >= target && step) { markDone(step); }
        });
      });
    });

    /* ---------- REFLECTION JOURNAL (localStorage) ---------- */
    var saveEl = document.getElementById('jSave'), savedTimer;
    document.querySelectorAll('.journal').forEach(function (j) {
      var step = j.getAttribute('data-done-step') || 'reflect';
      var areas = j.querySelectorAll('textarea');
      function check() {
        var any = false;
        areas.forEach(function (t) { if (t.value.trim().length > 3) any = true; });
        if (any) markDone(step);
      }
      areas.forEach(function (t) {
        var key = t.getAttribute('data-key');
        if (key) { try { var v = localStorage.getItem(key); if (v) t.value = v; } catch (e) {} }
        t.addEventListener('input', function () {
          if (key) { try { localStorage.setItem(key, t.value); } catch (e) {} }
          if (saveEl) {
            saveEl.innerHTML = 'Saving… <b>saved ✓</b>';
            clearTimeout(savedTimer);
            savedTimer = setTimeout(function () { saveEl.innerHTML = 'Your log saves on this device as you type.'; }, 1400);
          }
          check();
        });
      });
      check();
    });
    var pb = document.getElementById('printBtn');
    if (pb) pb.addEventListener('click', function () { window.print(); });

    /* ---------- SCROLL REVEAL + ACTIVE SECTION ---------- */
    var revObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revObserver.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revObserver.observe(el); });

    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          document.querySelectorAll('#trSteps .tr-dot').forEach(function (d) {
            d.classList.toggle('active', d.getAttribute('data-go') === id);
          });
        }
      });
    }, { threshold: 0.4 });
    STEPS.forEach(function (id) { var el = document.getElementById(id); if (el) secObserver.observe(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
