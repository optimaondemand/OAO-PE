/* ============================================================================
   Mission: Move! — 7/8 PE interactive lesson system  ·  pe-lesson.js
   One script for every lesson. All interactions are DATA-ATTRIBUTE / DOM driven:
   a lesson writes plain HTML (see _lesson-template.html) and this file wires it.
   Never add per-lesson JS; if a lesson needs a new interaction, add a builder
   here and document it in README.md. Pairs with shared/pe-lesson.css.

   Components (by container class / attribute):
     [data-pe-intro]   pulse-monitor cinematic intro (+ any .replay button)
     .voice            Coach Vee voice guide (recorded audio + read-along)
     .pe-investigate   tap-to-reveal question builder with progress
     .pe-timeline      drag-a-slider threshold model (systems light up)
     .pe-check         single-answer quick check with feedback
     .pe-meter         animated evidence/effect-size bars
     .pe-tracker       multi-column data log (localStorage, auto change)
     .pe-pad           reflection textareas (localStorage autosave)
     .pe-vocab         tap-to-flip vocabulary cards
   ========================================================================== */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function S(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e;}
function split(s){return (s||"").split("|").map(function(x){return x.trim();}).filter(Boolean);}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||"{}")||{};}catch(e){return {};}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function tok(name,fb){try{var v=getComputedStyle(document.body).getPropertyValue(name).trim();return v||fb;}catch(e){return fb;}}

/* ───────────────────────── PULSE-MONITOR INTRO ─────────────────────────
   PE-tailored descendant of the OAO-Science "Lab Flask" intro.
   Config comes from a <div data-pe-intro ...> element:
     data-eyebrow, data-title (may contain <em>), data-sub,
     data-words="A|B|C", data-in="reps|min|bpm", data-out="stronger|faster|data",
     data-key (localStorage; plays once per device). */
var PEIntro=(function(){
  var cfgEl=document.querySelector("[data-pe-intro]");
  if(!cfgEl)return {replay:function(){}};
  var CFG={
    eyebrow:cfgEl.getAttribute("data-eyebrow")||"",
    title:cfgEl.getAttribute("data-title")||document.title,
    sub:cfgEl.getAttribute("data-sub")||"Measure the baseline. Run the intervention. Explain it with evidence.",
    words:["?"].concat(split(cfgEl.getAttribute("data-words")||"MOVE|MEASURE|ADAPT|EVIDENCE")).concat(["?"]),
    inTokens:split(cfgEl.getAttribute("data-in")||"reps|min|bpm"),
    outTokens:split(cfgEl.getAttribute("data-out")||"stronger|faster|data"),
    key:cfgEl.getAttribute("data-key")||("pe-intro-"+location.pathname)
  };
  var HEART="M310 172 C262 140 250 100 282 86 C300 78 309 94 310 104 C311 94 320 78 338 86 C370 100 358 140 310 172 Z";
  var EKG="M18 238 H250 L262 238 L272 220 L284 262 L296 238 L302 238 L310 190 L320 238 L330 250 L340 238 H602";
  var timers=[],raf=0,overlay=null;
  function later(fn,ms){timers.push(setTimeout(fn,ms));}
  function clearAll(){timers.forEach(clearTimeout);timers=[];if(raf)cancelAnimationFrame(raf);raf=0;}

  function build(){
    overlay=el("div","pm-intro");overlay.setAttribute("role","dialog");overlay.setAttribute("aria-label","Lesson intro");
    overlay.appendChild(el("div","pm-grid"));
    var canvas=document.createElement("canvas");overlay.appendChild(canvas);
    var stage=el("div","pm-stage");
    var svg=S("svg",{viewBox:"0 0 620 300","aria-hidden":"true"});
    svg.appendChild(S("path",{"class":"pm-ekg",d:EKG}));
    var hg=S("g",{"class":"pm-heartg"});
    hg.appendChild(S("path",{"class":"pm-fill",d:HEART}));
    hg.appendChild(S("path",{"class":"ln pm-heart",d:HEART}));
    var word=S("text",{"class":"pm-word",x:"310",y:"120","font-size":"30"});word.textContent="?";hg.appendChild(word);
    svg.appendChild(hg);
    var gin=S("g",{"class":"pm-arrow"});
    gin.appendChild(S("path",{"class":"ln",d:"M34 120 H196 M182 110 L196 120 L182 130"}));
    var lin=S("text",{"class":"pm-lbl",x:"34",y:"100"});lin.textContent="TRAIN";gin.appendChild(lin);svg.appendChild(gin);
    var tin=S("g",{"class":"pm-arrow"});
    CFG.inTokens.forEach(function(t){var x=S("text",{"class":"pm-tok in",x:"172",y:"124","text-anchor":"end"});x.textContent=t;tin.appendChild(x);});svg.appendChild(tin);
    var gout=S("g",{"class":"pm-arrow"});
    gout.appendChild(S("path",{"class":"ln",d:"M424 120 H586 M572 110 L586 120 L572 130"}));
    var lout=S("text",{"class":"pm-lbl",x:"586",y:"100","text-anchor":"end"});lout.textContent="ADAPT";gout.appendChild(lout);svg.appendChild(gout);
    var tout=S("g",{"class":"pm-arrow"});
    CFG.outTokens.forEach(function(t){var x=S("text",{"class":"pm-tok out",x:"430",y:"124"});x.textContent=t;tout.appendChild(x);});svg.appendChild(tout);
    stage.appendChild(svg);
    var text=el("div","pm-text");
    if(CFG.eyebrow)text.appendChild(el("p","pm-eyebrow",CFG.eyebrow));
    var h=document.createElement("h1");h.innerHTML=CFG.title;text.appendChild(h);
    text.appendChild(el("p","pm-sub",CFG.sub));
    stage.appendChild(text);overlay.appendChild(stage);
    var ctl=el("div","pm-ctl");
    var fs=el("button","pm-btn","Watch full screen");fs.type="button";
    fs.addEventListener("click",function(){var r=overlay.requestFullscreen||overlay.webkitRequestFullscreen;
      if(r){try{var p=r.call(overlay);if(p&&p.catch)p.catch(function(){});}catch(e){}}});
    var skip=el("button","pm-btn","Skip intro");skip.type="button";
    skip.addEventListener("click",function(){finish(true);});
    ctl.appendChild(fs);ctl.appendChild(skip);overlay.appendChild(ctl);
    if(!document.fullscreenEnabled&&!document.webkitFullscreenEnabled)fs.hidden=true;
    document.body.appendChild(overlay);document.body.classList.add("pm-lock");
    try{skip.focus({preventScroll:true});}catch(e){}
    return {canvas:canvas,stage:stage,word:word};
  }
  function fitWord(node,text){
    var MAX=150,size=30;node.textContent=text;node.setAttribute("font-size",size);
    try{var w=node.getComputedTextLength();while(w>MAX&&size>11){size-=1;node.setAttribute("font-size",size);w=node.getComputedTextLength();}}catch(e){}
  }
  function dissolve(parts){
    var ov=overlay;if(!ov)return;
    var NAVY=tok("--navy","#0E1C42"),SKY=tok("--sky","#55C8E8"),GOLD=tok("--gold","#C7922C"),PINK=tok("--pink","#A53E97");
    var cv=parts.canvas,ctx=cv.getContext("2d");
    var W=cv.width=ov.clientWidth,H=cv.height=ov.clientHeight;
    var cell=Math.max(10,Math.round(Math.min(W,H)/36));
    var cols=Math.ceil(W/cell),rows=Math.ceil(H/cell);
    var cx=W/2,cy=H/2,maxd=Math.hypot(cx,cy);
    var t0=null,DUR=1300,order=[];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var d=Math.hypot(c*cell+cell/2-cx,r*cell+cell/2-cy)/maxd;order.push({c:c,r:r,t:d*0.72+Math.random()*0.28});}
    var palette=[SKY,GOLD,PINK,"#ffffff"];
    var sparks=[];for(var k=0;k<110;k++){var ang=-Math.PI/2+(Math.random()-.5)*2.2,sp=1.6+Math.random()*3.4;
      sparks.push({x:cx+(Math.random()-.5)*80,y:cy-20+(Math.random()-.5)*60,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,r:1.6+Math.random()*3,a:1,c:palette[k%4]});}
    parts.stage.classList.add("out");
    ov.style.background="transparent";var g=ov.querySelector(".pm-grid");if(g)g.style.opacity="0";
    var ctl=ov.querySelector(".pm-ctl");if(ctl)ctl.style.opacity="0";
    function frame(ts){
      if(t0===null)t0=ts;var p=(ts-t0)/DUR;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=NAVY;
      for(var i=0;i<order.length;i++){var o=order[i];if(o.t>p)ctx.fillRect(o.c*cell,o.r*cell,cell+1,cell+1);}
      for(var j=0;j<sparks.length;j++){var b=sparks[j];b.x+=b.vx;b.y+=b.vy;b.vy+=0.045;b.a-=0.012;
        if(b.a>0){ctx.globalAlpha=Math.max(0,b.a);ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}}
      ctx.globalAlpha=1;
      if(p<1.18)raf=requestAnimationFrame(frame);else finish(false);
    }
    raf=requestAnimationFrame(frame);
  }
  function finish(skipped){
    clearAll();if(!overlay)return;var ov=overlay;overlay=null;
    try{localStorage.setItem(CFG.key,"1");}catch(e){}
    if(document.fullscreenElement===ov&&document.exitFullscreen){try{document.exitFullscreen();}catch(e){}}
    if(skipped){ov.style.transition="opacity .35s";ov.style.opacity="0";ov.classList.add("pm-done");}
    document.body.classList.remove("pm-lock");
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},skipped?380:0);
  }
  function play(){
    clearAll();if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);
    var parts=build(),ov=overlay;
    function phase(p,ms){later(function(){ov.classList.add(p);},ms);}
    if(reduce){ov.classList.add("p1","p2","p4");later(function(){finish(false);},1700);return;}
    requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add("p1");});});
    phase("p2",950);phase("p3",1750);
    var i=0,W=CFG.words;
    function nextWord(){
      if(i>=W.length)return;
      fitWord(parts.word,W[i]);
      parts.word.classList.remove("pop");try{void parts.word.getBBox();}catch(e){}parts.word.classList.add("pop");
      i++;later(nextWord,i===W.length-1?560:(i===1?520:380));
    }
    later(nextWord,1800);
    var endWords=1800+W.length*400+400;
    phase("p4",endWords);
    later(function(){dissolve(parts);},endWords+1900);
  }
  var seen=false;try{seen=!!localStorage.getItem(CFG.key);}catch(e){}
  if(!seen)play();
  return {replay:function(){window.scrollTo(0,0);play();}};
})();
// any .replay button (re)plays the intro
Array.prototype.forEach.call(document.querySelectorAll(".replay,[data-pe-replay]"),function(b){
  b.addEventListener("click",function(){PEIntro.replay();});
});

/* ───────────────────────── COACH VEE · VOICE GUIDE ─────────────────────────
   Plays the recorded audio at data-audio; browser speech is the fallback. */
(function(){
  var blocks=document.querySelectorAll(".voice");if(!blocks.length)return;
  var synth=("speechSynthesis" in window)?window.speechSynthesis:null;
  function pickVoice(){
    if(!synth)return null;var vs=[];try{vs=synth.getVoices()||[];}catch(e){}
    function score(v){var s=0;if(/female|zira|samantha|jenny|aria|sonia|libby|eva/i.test(v.name))s+=3;if(/en-US/i.test(v.lang))s+=1;return s;}
    var en=vs.filter(function(v){return /^en/i.test(v.lang);});
    en.sort(function(a,b){return score(b)-score(a);});
    return en[0]||vs[0]||null;
  }
  var current=null;
  Array.prototype.forEach.call(blocks,function(b){
    var play=b.querySelector(".play"),bar=b.querySelector(".bar>i"),read=b.querySelector(".read"),
        scriptEl=b.querySelector(".script"),src=b.getAttribute("data-audio"),audio=null,timer=0;
    if(!play)return;
    var text=scriptEl?scriptEl.textContent.trim():"";
    if(read)read.addEventListener("click",function(){b.classList.toggle("open");});
    function reset(){if(timer){clearInterval(timer);timer=0;}play.textContent="▶";if(bar)bar.style.width="0%";}
    b.__stop=function(){if(audio){try{audio.pause();audio.currentTime=0;}catch(e){}}if(synth){try{synth.cancel();}catch(e){}}reset();};
    function speak(){
      if(!(synth&&"SpeechSynthesisUtterance" in window&&text))return;
      try{synth.cancel();var u=new SpeechSynthesisUtterance(text);var v=pickVoice();if(v)u.voice=v;u.rate=1.03;u.pitch=1.06;
        var est=Math.max(6,text.split(/\s+/).length/2.6),t0=Date.now();
        u.onend=function(){reset();current=null;};u.onerror=function(){reset();current=null;};
        timer=setInterval(function(){if(bar)bar.style.width=Math.min(100,(Date.now()-t0)/1000/est*100)+"%";},90);
        synth.speak(u);play.textContent="⏸";}catch(e){reset();}
    }
    play.addEventListener("click",function(){
      if(play.textContent!=="▶"){b.__stop();current=null;return;}
      if(current&&current!==b)current.__stop();
      current=b;b.classList.add("open");
      if(src){
        if(!audio){
          audio=new Audio(src);
          audio.addEventListener("timeupdate",function(){if(bar&&audio.duration)bar.style.width=(audio.currentTime/audio.duration*100)+"%";});
          audio.addEventListener("ended",function(){reset();current=null;});
          audio.addEventListener("error",function(){audio=null;speak();});
        }
        var p=audio.play();play.textContent="⏸";
        if(p&&p.catch)p.catch(function(){audio=null;speak();});
        return;
      }
      speak();
    });
  });
  if(synth){try{synth.getVoices();}catch(e){}}
})();

/* ───────────────────────── INVESTIGATION BUILDER ─────────────────────────
   .pe-investigate [data-done] with child .qitem[data-q] (answer = innerHTML). */
Array.prototype.forEach.call(document.querySelectorAll(".pe-investigate"),function(host){
  var items=[].slice.call(host.querySelectorAll(".qitem"));
  var done=host.getAttribute("data-done")||"✓ Done";
  var grid=el("div","qgrid"),opened=0;
  items.forEach(function(item,i){
    var answer=item.innerHTML;
    var b=document.createElement("button");b.className="qcard";b.type="button";b.setAttribute("aria-expanded","false");
    b.innerHTML='<div class="q"><span class="n">'+(i+1)+'</span><span>'+(item.getAttribute("data-q")||"")+'</span><span class="cx">+</span></div>'+
      '<div class="a"><div class="in">'+answer+'</div></div>';
    var a=b.querySelector(".a");
    b.addEventListener("click",function(){
      var exp=b.getAttribute("aria-expanded")==="true";
      b.setAttribute("aria-expanded",exp?"false":"true");
      a.style.maxHeight=exp?"0":(a.scrollHeight+"px");
      if(!exp&&!b.dataset.d){b.dataset.d="1";opened++;update();}
    });
    grid.appendChild(b);
  });
  var bar=el("i"),prog=el("div","progress");prog.appendChild(bar);
  var msg=el("div","pbar-label");
  function update(){bar.style.width=(opened/items.length*100)+"%";
    msg.textContent=opened>=items.length?done:(opened+" of "+items.length+" questions designed");}
  update();
  host.innerHTML="";host.appendChild(grid);host.appendChild(prog);host.appendChild(msg);
});

/* ───────────────────────── THRESHOLD TIMELINE ─────────────────────────
   .pe-timeline[data-max][data-unit][data-scale="a|b|c"] with child
   .sysrow[data-name][data-emoji][data-start][data-full][data-color]
   (data-start = first visible change; data-full = fully adapted).
   Optional .tl-note child is kept below the model. */
Array.prototype.forEach.call(document.querySelectorAll(".pe-timeline"),function(host){
  var max=parseInt(host.getAttribute("data-max")||"52",10);
  var unit=host.getAttribute("data-unit")||"week";
  var scale=split(host.getAttribute("data-scale")||"");
  var note=host.querySelector(".tl-note");
  var defs=[].slice.call(host.querySelectorAll(".sysrow")).map(function(r){
    return {nm:r.getAttribute("data-name")||"",e:r.getAttribute("data-emoji")||"",
      start:parseFloat(r.getAttribute("data-start")||"0"),full:parseFloat(r.getAttribute("data-full")||"1"),
      c:r.getAttribute("data-color")||"--sky"};
  });
  var head=el("div","tl-head"),wk=el("div","tl-weeks");head.appendChild(wk);
  var range=document.createElement("input");range.className="tl-range";range.type="range";
  range.min="0";range.max=String(max);range.value="0";range.step="1";range.setAttribute("aria-label","Amount of consistent training");
  var sc=el("div","tl-scale");scale.forEach(function(s){var sp=document.createElement("span");sp.textContent=s;sc.appendChild(sp);});
  var body=el("div");var rows=[];
  defs.forEach(function(s){
    var row=el("div","sys");
    row.innerHTML='<div class="nm"><span class="e">'+s.e+'</span>'+s.nm+'</div>'+
      '<div class="track"><i style="background:var('+s.c+')"></i></div><div class="st">Not yet</div>';
    body.appendChild(row);rows.push({el:row,fill:row.querySelector("i"),st:row.querySelector(".st"),s:s});
  });
  function render(w){
    wk.innerHTML=w+'<small> '+unit+(w===1?"":"s")+'</small>';
    rows.forEach(function(r){
      var s=r.s,pct,status,cls;
      if(w<s.start){pct=s.start>0?Math.max(0,w/s.start*18):0;status="Not yet";cls="";}
      else if(w<s.full){var k=(s.full>s.start)?(w-s.start)/(s.full-s.start):1;pct=18+k*82;status="Adapting";cls="part";}
      else{pct=100;status="Adapted ✓";cls="on";}
      r.fill.style.width=pct+"%";r.st.textContent=status;
      r.el.classList.remove("on","part");if(cls)r.el.classList.add(cls);
    });
  }
  range.addEventListener("input",function(){render(+range.value);});
  host.innerHTML="";host.appendChild(head);host.appendChild(range);
  if(scale.length)host.appendChild(sc);
  host.appendChild(body);if(note)host.appendChild(note);
  render(0);
});

/* ───────────────────────── QUICK CHECK ─────────────────────────
   .pe-check with child .qopt buttons; the correct one has [data-correct];
   each button may hold a <span class="fb">feedback</span>. */
Array.prototype.forEach.call(document.querySelectorAll(".pe-check"),function(host){
  var raw=[].slice.call(host.querySelectorAll(".qopt"));
  var opts=raw.map(function(o){
    var fbEl=o.querySelector(".fb");var fb=fbEl?fbEl.innerHTML:"";if(fbEl)fbEl.remove();
    return {t:o.innerHTML,ok:o.hasAttribute("data-correct"),fb:fb};
  });
  var wrap=el("div","opts"),fb=el("div","fb"),done=false,correctIdx=-1;
  opts.forEach(function(o,i){if(o.ok)correctIdx=i;});
  var btns=[];
  opts.forEach(function(o,i){
    var b=document.createElement("button");b.className="opt";b.type="button";
    b.innerHTML='<span class="mk"></span><span>'+o.t+'</span>';
    b.addEventListener("click",function(){
      if(done)return;done=true;
      btns.forEach(function(x){x.setAttribute("disabled","");});
      b.classList.add(o.ok?"right":"wrong");b.querySelector(".mk").textContent=o.ok?"✓":"✕";
      if(!o.ok&&correctIdx>=0){btns[correctIdx].classList.add("right");btns[correctIdx].querySelector(".mk").textContent="✓";}
      fb.innerHTML="<b>"+(o.ok?"Correct — ":"Here's the science: ")+"</b>"+o.fb;fb.classList.add("show");
    });
    btns.push(b);wrap.appendChild(b);
  });
  host.innerHTML="";host.appendChild(wrap);host.appendChild(fb);
});

/* ───────────────────────── EVIDENCE METER ─────────────────────────
   .pe-meter with child .mrow[data-pct][data-color][data-value] (label=text). */
Array.prototype.forEach.call(document.querySelectorAll(".pe-meter"),function(host){
  var defs=[].slice.call(host.querySelectorAll(".mrow")).map(function(r){
    return {k:r.textContent.trim(),v:r.getAttribute("data-value")||"",pct:parseFloat(r.getAttribute("data-pct")||"0"),c:r.getAttribute("data-color")||"--sky"};
  });
  var wrap=el("div","meter");
  defs.forEach(function(m){
    var row=el("div","row");
    row.innerHTML='<div class="cap"><span>'+m.k+'</span><span>'+m.v+'</span></div>'+
      '<div class="bar"><i data-pct="'+m.pct+'" style="background:var('+m.c+')"></i></div>';
    wrap.appendChild(row);
  });
  host.innerHTML="";host.appendChild(wrap);
  var fired=false;
  function go(){if(fired)return;fired=true;wrap.querySelectorAll("i[data-pct]").forEach(function(i){i.style.width=i.dataset.pct+"%";});}
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){go();io.disconnect();}});},{threshold:.4});
    io.observe(wrap);
  }else go();
});

/* ───────────────────────── DATA TRACKER ─────────────────────────
   .pe-tracker[data-key][data-cols="Week 1|Week 4"] with child
   .trow[data-id][data-name][data-unit][data-better="up|down"].
   Change compares the last two filled columns. Saves to localStorage. */
Array.prototype.forEach.call(document.querySelectorAll(".pe-tracker"),function(host){
  var key=host.getAttribute("data-key")||("pe-tracker-"+location.pathname);
  var cols=split(host.getAttribute("data-cols")||"Week 1|Week 4");
  var rows=[].slice.call(host.querySelectorAll(".trow")).map(function(r){
    return {id:r.getAttribute("data-id"),nm:r.getAttribute("data-name")||"",unit:r.getAttribute("data-unit")||"",better:r.getAttribute("data-better")||"up"};
  });
  var data=lsGet(key);
  var thead="<tr><th>Measure</th>"+cols.map(function(c){return "<th>"+c+"</th>";}).join("")+"<th>Change</th></tr>";
  var tbodyRows=rows.map(function(r){
    var cells=cols.map(function(c,ci){return '<td><input type="number" inputmode="numeric" id="c'+ci+"_"+r.id+'" aria-label="'+r.nm+" "+c+'"></td>';}).join("");
    return '<tr><td>'+r.nm+' <span class="unit">('+r.unit+')</span></td>'+cells+'<td class="chg" id="chg_'+r.id+'">—</td></tr>';
  }).join("");
  var wrap=el("div");
  wrap.innerHTML='<div class="table-scroll"><table class="bt"><thead>'+thead+'</thead><tbody>'+tbodyRows+'</tbody></table></div>'+
    '<div class="bt-actions"><button class="btn" type="button" data-save>Save my data</button>'+
    '<button class="btn ghost" type="button" data-clear>Reset</button>'+
    '<span class="saved">✓ Saved on this device</span></div>';
  host.innerHTML="";host.appendChild(wrap);
  function val(id){var e=document.getElementById(id);return e&&e.value!==""?parseFloat(e.value):null;}
  function recompute(){
    rows.forEach(function(r){
      var vals=cols.map(function(c,ci){return val("c"+ci+"_"+r.id);}).filter(function(v){return v!==null;});
      var cell=document.getElementById("chg_"+r.id);cell.className="chg";
      if(vals.length<2){cell.textContent="—";return;}
      var d=Math.round((vals[vals.length-1]-vals[0])*10)/10;
      var improved=(r.better==="up"&&d>0)||(r.better==="down"&&d<0);
      var dec=(r.better==="down"&&d>0)||(r.better==="up"&&d<0);
      var num=(d>0?"+":"")+d;
      if(improved){cell.classList.add("up");cell.textContent="▲ "+num;}
      else if(dec){cell.classList.add("down");cell.textContent="▼ "+num;}
      else cell.textContent=num;
    });
  }
  rows.forEach(function(r){cols.forEach(function(c,ci){
    var e=document.getElementById("c"+ci+"_"+r.id);
    if(data["c"+ci+"_"+r.id]!=null)e.value=data["c"+ci+"_"+r.id];
    e.addEventListener("input",recompute);
  });});
  recompute();
  var saved=wrap.querySelector(".saved");
  wrap.querySelector("[data-save]").addEventListener("click",function(){
    var out={};rows.forEach(function(r){cols.forEach(function(c,ci){var v=val("c"+ci+"_"+r.id);if(v!==null)out["c"+ci+"_"+r.id]=v;});});
    lsSet(key,out);saved.classList.add("show");setTimeout(function(){saved.classList.remove("show");},2200);
  });
  wrap.querySelector("[data-clear]").addEventListener("click",function(){
    rows.forEach(function(r){cols.forEach(function(c,ci){document.getElementById("c"+ci+"_"+r.id).value="";});});
    try{localStorage.removeItem(key);}catch(e){}recompute();
  });
});

/* ───────────────────────── REFLECTION PAD ─────────────────────────
   .pe-pad[data-key] with child .pfield[data-id][data-label][data-ph][data-tone].
   data-tone="sup"/"ovr" sit side by side; others run full width. Autosaves. */
Array.prototype.forEach.call(document.querySelectorAll(".pe-pad"),function(host){
  var key=host.getAttribute("data-key")||("pe-pad-"+location.pathname);
  var fields=[].slice.call(host.querySelectorAll(".pfield")).map(function(f){
    return {id:f.getAttribute("data-id"),label:f.getAttribute("data-label")||"",ph:f.getAttribute("data-ph")||"",tone:f.getAttribute("data-tone")||""};
  });
  var data=lsGet(key);
  var pad2=el("div","pad2"),extra=[];
  function makeField(f){
    var col=el("div","pcol"+(f.tone?(" "+f.tone):""));
    col.innerHTML='<h4>'+f.label+'</h4><textarea id="pf_'+f.id+'" placeholder="'+(f.ph.replace(/"/g,"&quot;"))+'"></textarea>';
    var ta=col.querySelector("textarea");
    if(data[f.id])ta.value=data[f.id];
    ta.addEventListener("input",function(){
      var out={};fields.forEach(function(x){var e=document.getElementById("pf_"+x.id);if(e&&e.value)out[x.id]=e.value;});
      lsSet(key,out);
    });
    return col;
  }
  fields.forEach(function(f){if(f.tone==="sup"||f.tone==="ovr")pad2.appendChild(makeField(f));else extra.push(f);});
  host.innerHTML="";
  if(pad2.children.length)host.appendChild(pad2);
  extra.forEach(function(f){var c=makeField(f);c.classList.add("pfull");host.appendChild(c);});
});

/* ───────────────────────── VOCAB FLIP CARDS ─────────────────────────
   .pe-vocab with child .vitem[data-term] (definition = innerHTML). */
Array.prototype.forEach.call(document.querySelectorAll(".pe-vocab"),function(host){
  var items=[].slice.call(host.querySelectorAll(".vitem")).map(function(v){
    return {term:v.getAttribute("data-term")||"",def:v.innerHTML};
  });
  var grid=el("div","vgrid");
  items.forEach(function(v){
    var b=document.createElement("button");b.className="vcard";b.type="button";b.setAttribute("aria-expanded","false");
    b.innerHTML='<div class="term">'+v.term+'<span class="flip">flip ↻</span></div>'+
      '<div class="hintline">Tap to reveal</div><div class="def">'+v.def+'</div>';
    b.addEventListener("click",function(){b.setAttribute("aria-expanded",b.getAttribute("aria-expanded")==="true"?"false":"true");});
    grid.appendChild(b);
  });
  host.innerHTML="";host.appendChild(grid);
});
})();
