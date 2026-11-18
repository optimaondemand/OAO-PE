/* ============================================================
   MISSION: MOVE!  —  SHARED LESSON ENGINE  (behavior)
   3rd Grade Physical Education · Optima Academy Online

   Each lesson page defines  window.LESSON = {...}  then loads
   this script. The engine builds the whole interactive journey
   (intro animation, HUD + Flight Points, station screens,
   activities, reflection, confetti finish) so every lesson
   looks and behaves exactly like the approved Unit 1.1 pilot.

   LESSON config shape:
   {
     week:  "Week 3",
     unit:  "Unit 1.2",
     title: "Warm-Ups & Cool-Downs",
     subtitle: "3rd Grade Physical Education · Optima Academy Online",
     assets: "../assets/",            // optional (default)
     owl: "optima-owl.png?v=2",       // optional (default)
     launch: { h1, leadHTML, video?, missionHTML? },
     stations: [
       { label?, title, html,
         activity?: <activity> | activities?: [<activity>] }
     ],
     reflection: { promptHTML, noteHTML?, placeholder? },
     finish: { whatsNextHTML?, blurbHTML? }
   }

   Activity types:
     {type:'sort',  title, tag?, sub?, items:[{t,e,correct}], points}
     {type:'flip',  title, tag?, sub?, cards:[{e,t,p}], points, gate?}
     {type:'snack', title?, tag?, introHTML?, moves:[...], seconds?, points}
     {type:'match', title?, tag?, pairs:[{w,d}], points}
     {type:'quiz',  title, tag?, q, options:[...], answer:<index>, points}
     {type:'heartbeat', title?, tag?, sub?, points?}   // bonus, non-gating
   ============================================================ */
(function(){
  "use strict";

  var L = window.LESSON || {};
  var ASSETS = L.assets || "../assets/";
  var OWL = ASSETS + (L.owl || "optima-owl.png?v=2");
  var SUB = L.subtitle || "3rd Grade Physical Education · Optima Academy Online";

  function esc(s){ return String(s==null?'':s); }

  /* ---------- build an activity's HTML + return a wiring fn ---------- */
  var wirers = [];      // functions to run after DOM is in place
  var gateKeys = {};    // gateName -> array of award keys that must complete

  function activityHTML(act, sid, aidx){
    var id = 's'+sid+'a'+aidx;
    var gate = 'g'+sid;              // one gate per station
    var t = act.type;

    if(t==='sort'){
      gateKeys[gate] = gateKeys[gate] || [];
      gateKeys[gate].push(id);
      wirers.push(function(){ wireSort(act, id, gate); });
      return '<div class="mbox" id="'+id+'box">'+
        '<div class="mbox-h">'+esc(act.title)+' <span class="tag">'+esc(act.tag||'Tap to play')+'</span></div>'+
        (act.sub?'<p class="mbox-sub">'+act.sub+'</p>':'')+
        '<div class="tapgrid" id="'+id+'grid"></div></div>';
    }
    if(t==='flip'){
      if(act.gate!==false){ gateKeys[gate]=gateKeys[gate]||[]; gateKeys[gate].push(id); }
      wirers.push(function(){ wireFlip(act, id, gate); });
      return (act.title?'<p class="mbox-sub" style="margin-top:6px;"><strong>'+esc(act.title)+'</strong> '+esc(act.sub||'')+'</p>':'')+
        '<div class="cardgrid" id="'+id+'grid"></div>';
    }
    if(t==='snack'){
      gateKeys[gate] = gateKeys[gate] || [];
      gateKeys[gate].push(id);
      wirers.push(function(){ wireSnack(act, id, gate); });
      return '<div class="mbox" id="'+id+'box">'+
        '<div class="mbox-h">'+esc(act.title||'⏱️ Movement Snack')+' <span class="tag">'+esc(act.tag||'Get up!')+'</span></div>'+
        (act.introHTML||'')+
        '<div class="timerwrap">'+
          '<img class="owlmove" id="'+id+'owl" src="'+OWL+'" alt="Optima owl"/>'+
          '<div class="ring" id="'+id+'ring">0:'+pad(act.seconds||30)+'</div>'+
          '<div class="cue" id="'+id+'cue">Tap Start and copy the owl!</div>'+
          '<div style="margin-top:8px;"><button class="beatbtn" id="'+id+'btn" style="background:var(--purple);">Start the snack ▶</button></div>'+
        '</div></div>';
    }
    if(t==='match'){
      gateKeys[gate] = gateKeys[gate] || [];
      gateKeys[gate].push(id);
      wirers.push(function(){ wireMatch(act, id, gate); });
      var n = (act.pairs||[]).length;
      return '<div class="mbox" id="'+id+'box">'+
        '<div class="mbox-h">'+esc(act.title||'🧩 Vocabulary Match')+' <span class="tag">'+esc(act.tag||('Match all '+n))+'</span></div>'+
        '<div class="match">'+
          '<div class="mcol"><h4>Word</h4><div id="'+id+'w"></div></div>'+
          '<div class="mcol"><h4>Meaning</h4><div id="'+id+'d"></div></div>'+
        '</div></div>';
    }
    if(t==='quiz'){
      gateKeys[gate] = gateKeys[gate] || [];
      gateKeys[gate].push(id);
      wirers.push(function(){ wireQuiz(act, id, gate); });
      return '<div class="mbox" id="'+id+'box">'+
        '<div class="mbox-h">'+esc(act.title||'✅ Quick Check')+' <span class="tag">'+esc(act.tag||'Pick one')+'</span></div>'+
        (act.q?'<p class="mbox-sub">'+act.q+'</p>':'')+
        '<div class="quiz" id="'+id+'opts"></div></div>';
    }
    if(t==='heartbeat'){
      wirers.push(function(){ wireHeart(act, id); });
      return '<div class="mbox" id="'+id+'box">'+
        '<div class="mbox-h">'+esc(act.title||'❤️ Feel the Beat')+' <span class="tag">'+esc(act.tag||'Try it')+'</span></div>'+
        (act.sub?'<p class="mbox-sub">'+act.sub+'</p>':'')+
        '<div class="heartbox">'+
          '<div class="heart beat" id="'+id+'heart">❤️</div>'+
          '<div><button class="beatbtn" id="'+id+'pump">Pump it up! 🏃</button></div>'+
          '<div class="cue" id="'+id+'cue" style="margin-top:8px;">Resting heart: calm and steady… <em>bump… bump…</em></div>'+
        '</div></div>';
    }
    return '';
  }
  function pad(n){ return (n<10?'0':'')+n; }

  /* ---------- assemble the full stage markup ---------- */
  var stations = L.stations || [];
  var S = stations.length;

  var html = '<div class="stage" id="stage"><div class="hud">'+
    '<div class="hud-brand"><span class="hud-badge">'+esc(L.week||'')+'</span></div>'+
    '<div class="hud-title">Mission: Move!<small>'+esc(L.unit||'')+(L.unit&&L.title?' · ':'')+esc(L.title||'')+'</small></div>'+
    '<div class="track"><div class="track-line"><div class="track-fill" id="fill"></div></div>'+
      '<img class="track-owl" id="trackowl" src="'+OWL+'" alt="Optima owl"/></div>'+
    '<div class="points" id="points"><span class="star">✦</span><span id="pts">0</span> FP</div>'+
  '</div><div class="screens" id="screens">';

  // launch screen
  var lc = L.launch || {};
  html += '<section class="screen" data-nextlabel="Blast off →" data-steplabel="🚀 Launch pad"><div class="wrap">'+
    '<h1>'+esc(lc.h1||L.title||'Welcome!')+'</h1>'+
    (lc.leadHTML?'<p class="lead">'+lc.leadHTML+'</p>':'')+
    (lc.video?'<div class="video"><video controls playsinline preload="metadata" style="width:100%;height:100%;object-fit:contain;background:#000;">'+
      '<source src="'+esc(lc.video)+'" type="video/mp4">Your browser can\'t play this video. '+
      '<a href="'+esc(lc.video)+'" style="color:#fff;">Open the lesson video</a>.</video></div>':'')+
    '<div class="callout next" style="margin-top:20px;"><div class="ctag">🚀 Your Mission</div>'+
      '<p>'+(lc.missionHTML || ('Travel through <strong>'+S+' movement stations</strong>. Tap, play, and explore at each stop to earn <strong>Flight Points</strong> — and watch your owl climb the ranks. Ready? Tap <strong>Blast off</strong>!'))+'</p>'+
    '</div></div></section>';

  // station screens
  stations.forEach(function(st, i){
    var sid = i+1;
    var acts = st.activities || (st.activity ? [st.activity] : []);
    var actHTML = acts.map(function(a,ai){ return activityHTML(a, sid, ai); }).join('');
    var gated = !!(gateKeys['g'+sid] && gateKeys['g'+sid].length);
    html += '<section class="screen" data-nextlabel="Next station →"'+
      (gated?' data-gate="g'+sid+'"':'')+' data-steplabel="Station '+sid+' of '+S+'"><div class="wrap">'+
      '<div class="eyebrow"><div class="num">'+sid+'</div><div><div class="lbl">'+esc(st.label||('Station '+sid))+'</div>'+
        '<h2>'+esc(st.title||'')+'</h2></div></div>'+
      (st.html||'')+ actHTML +
      '</div></section>';
  });

  // reflection screen
  var rf = L.reflection || {};
  html += '<section class="screen" data-nextlabel="Finish mission 🎉" data-steplabel="✎ Final reflection"><div class="wrap">'+
    '<div class="eyebrow"><div class="num">✎</div><div><div class="lbl">Final Stop</div><h2>Weekly Reflection</h2></div></div>'+
    '<div class="callout reflect"><div class="ctag">📝 Quick Reflection Time!</div><p>'+(rf.promptHTML||'What is one thing you learned or want to try this week?')+'</p></div>'+
    (rf.noteHTML?'<p class="mbox-sub">'+rf.noteHTML+'</p>':'')+
    '<textarea id="reflect" placeholder="'+esc(rf.placeholder||'Type your thoughts here…')+'"></textarea>'+
  '</div></section>';

  // finish screen
  var fn = L.finish || {};
  html += '<section class="screen" data-final="1"><div class="wrap finish">'+
    '<div class="badge" id="badge"><img src="'+OWL+'" alt="Optima owl"/></div>'+
    '<div class="rankname" id="rankname">Mission Accomplished!</div>'+
    '<div class="scoreline">You earned <strong id="finalpts">0</strong> Flight Points this week!</div>'+
    '<p style="font-size:16px;color:var(--muted);max-width:520px;margin:6px auto 0;">'+(fn.blurbHTML||'Every point is a step toward your next owl rank in <strong>Flight Club</strong>. Awesome moving, superstar! 🎉')+'</p>'+
    (fn.whatsNextHTML?'<div class="callout next" style="text-align:left;max-width:560px;margin:22px auto;"><div class="ctag">→ What\'s Next</div><p>'+fn.whatsNextHTML+'</p></div>':'')+
    '<button class="btn btn-ghost" id="replay" style="margin:0 auto;">↻ Replay the mission</button>'+
  '</div></section>';

  html += '</div><div class="nav">'+
    '<button class="btn btn-ghost" id="back">← Back</button>'+
    '<span class="steplabel" id="steplabel"></span>'+
    '<button class="btn btn-primary" id="next">Next →</button>'+
  '</div>'+
  '<div class="intro" id="intro"><div class="stars" id="stars"></div>'+
    '<img class="intro-owl" src="'+OWL+'" alt="Optima owl"/>'+
    '<div class="intro-title">Mission: Move!</div>'+
    '<div class="intro-sub">'+esc(SUB)+'</div>'+
    '<div class="intro-unit">'+esc(L.unit||'')+(L.unit&&L.title?' — ':'')+esc(L.title||'')+'</div>'+
    '<button class="start" id="startbtn">Start Mission 🚀</button>'+
    '<button class="skip" id="skipbtn">Skip intro →</button>'+
  '</div><div class="toast" id="toast"></div><canvas id="confetti"></canvas></div>';

  var mount = document.getElementById('app') || document.body;
  mount.innerHTML = html;
  if(L.title){ try{ document.title = 'Mission: Move! — '+(L.unit?L.unit+' · ':'')+L.title; }catch(e){} }

  /* ================= runtime (mirrors the pilot) ================= */
  var screens = Array.prototype.slice.call(document.querySelectorAll('.screen'));
  var idx = 0, points = 0, maxStep = 0;
  var gates = {}, pointsAwarded = {};

  var fill = document.getElementById('fill');
  var trackowl = document.getElementById('trackowl');
  var ptsEl = document.getElementById('pts');
  var pointsBox = document.getElementById('points');
  var backBtn = document.getElementById('back');
  var nextBtn = document.getElementById('next');
  var stepLabel = document.getElementById('steplabel');
  var toast = document.getElementById('toast');

  var RANKS = [
    {min:85,name:'Soaring Owl',emoji:'🌌'},
    {min:70,name:'Wise Owl',emoji:'🦉'},
    {min:50,name:'Gliding Owl',emoji:'🪽'},
    {min:30,name:'Fluttering Owl',emoji:'🐤'},
    {min:0, name:'Nestling Learner',emoji:'🥚'}
  ];
  function rankFor(p){for(var i=0;i<RANKS.length;i++){if(p>=RANKS[i].min)return RANKS[i];}return RANKS[RANKS.length-1];}

  function showToast(msg){
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function(){toast.classList.remove('show');},1600);
  }
  function award(key,n){
    if(pointsAwarded[key]) return; pointsAwarded[key]=true;
    points += n; ptsEl.textContent = points;
    pointsBox.classList.remove('pop'); void pointsBox.offsetWidth; pointsBox.classList.add('pop');
    if(n>0) showToast('+'+n+' Flight Points!');
  }
  function maybeCompleteGate(gate){
    var keys = gateKeys[gate]; if(!keys) return;
    for(var i=0;i<keys.length;i++){ if(!pointsAwarded[keys[i]]) return; }
    gates[gate]=true; refreshNav();
  }
  function refreshNav(){
    var cur = screens[idx];
    var gate = cur.getAttribute('data-gate');
    var locked = gate && !gates[gate];
    nextBtn.classList.toggle('locked', !!locked);
    var nl = cur.getAttribute('data-nextlabel');
    nextBtn.textContent = locked ? 'Finish the activity to continue' : (nl || 'Next →');
    backBtn.classList.toggle('hidden', idx===0);
    nextBtn.style.display = cur.getAttribute('data-final') ? 'none' : '';
    stepLabel.textContent = cur.getAttribute('data-final') ? 'Mission complete! 🎉' : (cur.getAttribute('data-steplabel')||'');
  }
  function go(n){
    if(n<0||n>=screens.length) return;
    var prev=screens[idx]; prev.classList.remove('active'); prev.classList.add('left');
    idx=n; var cur=screens[idx]; cur.classList.remove('left'); cur.classList.add('active'); cur.scrollTop=0;
    maxStep=Math.max(maxStep,idx);
    var denom=screens.length-2; var prog=Math.min(1,idx/denom);
    fill.style.width=(prog*100)+'%'; trackowl.style.left=(prog*100)+'%';
    refreshNav();
    if(cur.getAttribute('data-final')) renderFinish();
  }
  nextBtn.addEventListener('click',function(){
    if(nextBtn.classList.contains('locked')){ showToast('Finish the activity first! 😊'); return; }
    var cur=screens[idx];
    if(cur.querySelector('#reflect')){ var v=document.getElementById('reflect').value.trim(); if(v.length>0) award('reflect',10); }
    go(idx+1);
  });
  backBtn.addEventListener('click',function(){ go(idx-1); });

  /* ---------- intro ---------- */
  (function(){
    var box=document.getElementById('stars'); var n=36;
    for(var i=0;i<n;i++){var s=document.createElement('i');s.textContent='✦';
      s.style.left=(Math.random()*100)+'%';s.style.top=(Math.random()*100)+'%';
      s.style.fontSize=(8+Math.random()*14)+'px';s.style.animationDelay=(Math.random()*3)+'s';box.appendChild(s);}
  })();
  function launch(){ document.getElementById('intro').classList.add('gone'); go(0); }
  document.getElementById('startbtn').addEventListener('click',launch);
  document.getElementById('skipbtn').addEventListener('click',launch);

  /* ---------- activity wiring ---------- */
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  function wireSort(act,id,gate){
    var grid=document.getElementById(id+'grid'); if(!grid) return;
    var items=act.items||[]; var need=0; items.forEach(function(d){if(d.correct)need++;});
    var found=0;
    items.forEach(function(d){
      var c=document.createElement('button'); c.className='tapcard';
      c.innerHTML='<span class="e">'+esc(d.e||'')+'</span>'+esc(d.t||'');
      c.addEventListener('click',function(){
        if(d.correct){
          c.classList.add('correct','locked'); found++;
          if(found===need){ award(id,act.points||20); var b=document.getElementById(id+'box'); if(b)b.classList.add('done'); maybeCompleteGate(gate); }
        } else {
          c.classList.remove('wrong'); void c.offsetWidth; c.classList.add('wrong');
          showToast(act.wrongMsg||'Not that one — try again!');
          setTimeout(function(){c.classList.remove('wrong');},500);
        }
      });
      grid.appendChild(c);
    });
  }
  function wireFlip(act,id,gate){
    var grid=document.getElementById(id+'grid'); if(!grid) return;
    var cards=act.cards||[]; var revealed=0;
    cards.forEach(function(d){
      var f=document.createElement('div'); f.className='flip';
      f.innerHTML='<div class="flip-in">'+
        '<div class="flip-face flip-front"><div class="e">'+esc(d.e||'')+'</div><h3>'+esc(d.t||'')+'</h3><div class="hint">Tap to reveal</div></div>'+
        '<div class="flip-face flip-back"><p>'+esc(d.p||'')+'</p></div></div>';
      f.addEventListener('click',function(){
        f.classList.add('flipped');
        if(!f.classList.contains('revealed')){ f.classList.add('revealed'); revealed++;
          if(revealed===cards.length){ award(id,act.points||15); maybeCompleteGate(gate); } }
      });
      grid.appendChild(f);
    });
  }
  function wireSnack(act,id,gate){
    var owl=document.getElementById(id+'owl'), ring=document.getElementById(id+'ring'),
        cue=document.getElementById(id+'cue'), btn=document.getElementById(id+'btn');
    if(!btn) return;
    var moves=act.moves||['Jumping jacks! 🤸','March in place! 🚶','Reach up high! 🙆','Touch your toes! 🙇','Wiggle it out! 🕺','Big arm circles! 💪'];
    var total=act.seconds||30, running=false, left=total, iv=null, mi=0;
    btn.addEventListener('click',function(){
      if(running) return; running=true; owl.classList.add('go'); left=total; btn.textContent='Keep going! 💪';
      cue.textContent=moves[0];
      iv=setInterval(function(){
        left--; ring.textContent='0:'+pad(left<0?0:left);
        if(left%5===0){ mi=(mi+1)%moves.length; cue.textContent=moves[mi]; }
        if(left<=0){ clearInterval(iv); running=false; owl.classList.remove('go');
          ring.textContent='Done!'; cue.innerHTML='Amazing! Feel those happiness sparkles? ✨'; btn.textContent='Do it again ↻';
          award(id,act.points||20); var b=document.getElementById(id+'box'); if(b)b.classList.add('done'); maybeCompleteGate(gate); }
      },1000);
    });
  }
  function wireMatch(act,id,gate){
    var wcol=document.getElementById(id+'w'), dcol=document.getElementById(id+'d'); if(!wcol) return;
    var pairs=act.pairs||[]; var sel=null, done=0;
    shuffle(pairs).forEach(function(p){ var b=document.createElement('button'); b.className='chip'; b.textContent=p.w; b.dataset.k=p.w;
      b.addEventListener('click',function(){pick(b,'w');}); wcol.appendChild(b); });
    shuffle(pairs).forEach(function(p){ var b=document.createElement('button'); b.className='chip def'; b.textContent=p.d; b.dataset.k=p.w;
      b.addEventListener('click',function(){pick(b,'d');}); dcol.appendChild(b); });
    function clearSel(){ if(sel){sel.el.classList.remove('sel');} sel=null; }
    function pick(el,type){
      if(el.classList.contains('done')) return;
      if(!sel){ sel={el:el,type:type,k:el.dataset.k}; el.classList.add('sel'); return; }
      if(sel.el===el){ clearSel(); return; }
      if(sel.type===type){ clearSel(); sel={el:el,type:type,k:el.dataset.k}; el.classList.add('sel'); return; }
      if(sel.k===el.dataset.k){
        sel.el.classList.remove('sel'); sel.el.classList.add('done'); el.classList.add('done'); clearSel(); done++;
        if(done===pairs.length){ award(id,act.points||20); var b=document.getElementById(id+'box'); if(b)b.classList.add('done'); maybeCompleteGate(gate); }
        else { showToast('Match! ✅'); }
      } else {
        var was=sel.el; el.classList.add('wrong'); was.classList.add('wrong');
        showToast('Not a match — try again!');
        setTimeout(function(){el.classList.remove('wrong');was.classList.remove('wrong');},500); clearSel();
      }
    }
  }
  function wireQuiz(act,id,gate){
    var box=document.getElementById(id+'opts'); if(!box) return;
    var opts=act.options||[]; var ans=act.answer;
    opts.forEach(function(o,i){
      var b=document.createElement('button'); b.className='qopt'; b.innerHTML=esc(o);
      b.addEventListener('click',function(){
        if(i===ans){ b.classList.add('correct','locked'); box.querySelectorAll('.qopt').forEach(function(x){x.classList.add('locked');});
          award(id,act.points||15); var bx=document.getElementById(id+'box'); if(bx)bx.classList.add('done'); maybeCompleteGate(gate);
          showToast('Correct! ✅'); }
        else { b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); showToast('Try again! 😊');
          setTimeout(function(){b.classList.remove('wrong');},500); }
      });
      box.appendChild(b);
    });
  }
  function wireHeart(act,id){
    var heart=document.getElementById(id+'heart'), cue=document.getElementById(id+'cue'), pump=document.getElementById(id+'pump');
    if(!pump) return; var fast=false;
    pump.addEventListener('click',function(){
      fast=!fast;
      if(fast){ heart.classList.remove('beat'); heart.classList.add('fast');
        cue.innerHTML=act.fastHTML||'Moving heart: <strong>FAST!</strong> <em>bump-bump-bump-bump!</em> Your heart is working hard to send oxygen to your muscles. 💓';
        pump.textContent='Rest again 😌'; if(act.points) award(id,act.points); }
      else { heart.classList.remove('fast'); heart.classList.add('beat');
        cue.innerHTML=act.restHTML||'Resting heart: calm and steady… <em>bump… bump…</em>'; pump.textContent='Pump it up! 🏃'; }
    });
  }

  // run all wirers now that DOM exists
  wirers.forEach(function(fn){ try{ fn(); }catch(e){ if(window.console) console.error(e); } });

  /* ---------- finish ---------- */
  function renderFinish(){
    var r=rankFor(points);
    document.getElementById('finalpts').textContent=points;
    document.getElementById('rankname').textContent='Rank: '+r.name+' '+r.emoji;
    burst();
  }
  document.getElementById('replay').addEventListener('click',function(){ location.reload(); });

  /* ---------- confetti ---------- */
  var cv=document.getElementById('confetti'), ctx=cv.getContext('2d'), cparts=[], raf=null;
  function size(){ cv.width=cv.offsetWidth; cv.height=cv.offsetHeight; }
  window.addEventListener('resize',size); size();
  var COLORS=['#55C8E8','#C7922C','#76C043','#F78F1E','#A53E97','#0E1C42'];
  function burst(){ size(); cparts=[];
    for(var i=0;i<140;i++){ cparts.push({x:cv.width/2+(Math.random()-.5)*120,y:cv.height*0.35,
      vx:(Math.random()-.5)*9,vy:(Math.random()*-9)-3,g:0.22+Math.random()*0.1,s:6+Math.random()*7,
      c:COLORS[(Math.random()*COLORS.length)|0],r:Math.random()*6,vr:(Math.random()-.5)*.4,life:0}); }
    if(raf) cancelAnimationFrame(raf); tick();
  }
  function tick(){ ctx.clearRect(0,0,cv.width,cv.height); var alive=false;
    for(var i=0;i<cparts.length;i++){var p=cparts[i]; p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; p.life++;
      if(p.y<cv.height+20){alive=true;} ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle=p.c; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.6); ctx.restore(); }
    if(alive) raf=requestAnimationFrame(tick); else ctx.clearRect(0,0,cv.width,cv.height);
  }

  refreshNav();
})();
