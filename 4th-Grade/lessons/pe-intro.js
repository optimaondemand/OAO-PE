/* ------------------------------------------------------------
   The Beating Heart: cinematic intro for Mission: Move! lessons
   (4th Grade PE). PE version of the science "Lab Flask" intro
   (OAO-Science/shared/intro.js), 2026-11-05.

   Usage (first thing inside <body>):
     <script src="pe-intro.js"
       data-eyebrow="Week 1 · Mission: Move!"
       data-title="Your Body Is Built to Move"
       data-words="MOVE|HEART|MUSCLES|BRAIN"
       data-key="pe4-w1-intro"><\/script>
   (the closing tag is written with a backslash here so this file can be inlined)
   Optional: data-sub="..." replaces the line under the title.
   Colors follow the page's tokens (--brand-navy, --brand-sky, --learn,
   --spark, --make), so the course body class decides the look.

   A heart draws itself, a pulse line runs in (MOVE) and out (GROW),
   the heart fills and starts to beat, the week's words pop with each
   beat, the title rises, and the screen dissolves into confetti.
   Plays once per device (localStorage key = data-key), silent,
   skippable from frame one, a "Watch full screen" button for the
   Canvas iframe case, a reduced-motion fallback (one-second title
   fade), and a "Replay intro" button in the page header.
   window.PEIntro.replay() plays it again on demand.
   ------------------------------------------------------------ */
(function(){
  var me=document.currentScript;if(!me)return;
  var EYEBROW=me.getAttribute("data-eyebrow")||"";
  var TITLE=me.getAttribute("data-title")||document.title;
  var KEY=me.getAttribute("data-key")||("pe-intro-"+location.pathname);
  var SUB=me.getAttribute("data-sub")||"Warm up your brain. Your mission starts now.";
  var WORDS=["?","MOVE","PLAY","GROW","?"];
  if(me.getAttribute("data-words")){WORDS=["?"].concat(me.getAttribute("data-words").split("|").map(function(s){return s.trim()}).filter(Boolean)).concat(["?"])}
  // Colors come from the page's design tokens (pe-studio.css), so a course that overrides them gets its own look.
  function tok(name,fb){try{var v=getComputedStyle(document.body||document.documentElement).getPropertyValue(name).trim();return v||fb}catch(e){return fb}}
  var NAVY=tok("--brand-navy","#0E1C42"),SKY=tok("--brand-sky","#55C8E8"),TEAL=tok("--learn","#1E8C7C"),MUSTARD=tok("--spark","#E0A93A"),CORAL=tok("--heart",tok("--make","#D96A4B")),INK="#EEF6FA";
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var css=''+
  '.pe-intro{position:fixed;inset:0;z-index:10000;background:'+NAVY+';color:'+INK+';font-family:Nunito,"Segoe UI",Helvetica,Arial,sans-serif;overflow:hidden;display:flex;align-items:center;justify-content:center}'+
  '.pe-intro .si-grid{position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,'+SKY+' 10%,transparent) 1.5px,transparent 1.5px);background-size:26px 26px;pointer-events:none;transition:opacity .4s}'+
  '.pe-intro canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'+
  '.pe-intro .si-stage{position:relative;width:min(92vw,760px);display:flex;flex-direction:column;align-items:center;gap:1rem;transition:opacity .45s}'+
  '.pe-intro .si-stage.out{opacity:0}'+
  '.pe-intro svg{display:block;width:min(88vw,620px);height:auto;overflow:visible}'+
  '.pe-intro .ln{fill:none;stroke:'+SKY+';stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}'+
  '.pe-intro .heart{stroke-dasharray:800;stroke-dashoffset:800;transition:stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)}'+
  '.pe-intro.p1 .heart{stroke-dashoffset:0}'+
  '.pe-intro .hfill{fill:'+CORAL+';opacity:0;transform:translateY(16px);transform-box:fill-box;transition:opacity .6s,transform .8s cubic-bezier(.3,.7,.3,1)}'+
  '.pe-intro.p3 .hfill{opacity:.82;transform:none}'+
  '.pe-intro .heartg{transform-box:fill-box;transform-origin:center}'+
  '.pe-intro.p3 .heartg{animation:pe-beat .83s ease-in-out infinite}'+
  '@keyframes pe-beat{0%,100%{transform:scale(1)}18%{transform:scale(1.07)}36%{transform:scale(1)}}'+
  '.pe-intro .ekg{stroke:'+TEAL+';stroke-width:2.6;stroke-dasharray:420;stroke-dashoffset:420;transition:stroke-dashoffset .9s linear}'+
  '.pe-intro.p2 .ekg{stroke-dashoffset:0}'+
  '.pe-intro .arrow{opacity:0;transition:opacity .5s}'+
  '.pe-intro.p2 .arrow{opacity:1}'+
  '.pe-intro .lbl{font-family:Nunito,"Segoe UI",sans-serif;font-weight:800;font-size:13px;letter-spacing:.16em;fill:'+SKY+';opacity:0;transition:opacity .5s}'+
  '.pe-intro.p2 .lbl{opacity:1}'+
  '.pe-intro .tok{font-family:Nunito,"Segoe UI",sans-serif;font-weight:700;font-size:13px;fill:'+INK+';opacity:0}'+
  '.pe-intro.p2 .tok.in{animation:si-in 1.1s linear infinite}'+
  '.pe-intro.p2 .tok.out{animation:si-out 1.1s linear infinite}'+
  '.pe-intro .tok:nth-child(2){animation-delay:.37s!important}.pe-intro .tok:nth-child(3){animation-delay:.74s!important}'+
  '@keyframes si-in{0%{transform:translateX(-140px);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(0);opacity:0}}'+
  '@keyframes si-out{0%{transform:translateX(0);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(140px);opacity:0}}'+
  '.pe-intro .bub{fill:'+MUSTARD+';stroke:none;opacity:0}'+
  '.pe-intro.p3 .bub{animation:si-bub 1.4s ease-in infinite}'+
  '@keyframes si-bub{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-110px);opacity:0}}'+
  '.pe-intro .word{font-family:Fredoka,Nunito,Georgia,serif;font-weight:700;letter-spacing:.06em;fill:#fff;text-anchor:middle;dominant-baseline:middle;opacity:0;transition:opacity .3s}'+
  '.pe-intro.p3 .word{opacity:1}'+
  '.pe-intro .word.pop{animation:si-pop .28s cubic-bezier(.3,1.6,.5,1) 1;transform-box:fill-box;transform-origin:center}'+
  '@keyframes si-pop{0%{transform:translateY(10px) scale(.7);opacity:0}100%{transform:none;opacity:1}}'+
  '.pe-intro .si-text{text-align:center;opacity:0;transform:translateY(10px);transition:opacity .7s,transform .7s}'+
  '.pe-intro.p4 .si-text{opacity:1;transform:none}'+
  '.pe-intro .si-eyebrow{font-size:.78rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:'+SKY+';margin:0 0 .5rem}'+
  '.pe-intro h1{margin:0;font-family:Fredoka,Nunito,Georgia,serif;font-size:clamp(1.7rem,4.8vw,2.8rem);font-weight:700;line-height:1.12;color:#fff;text-wrap:balance}'+
  '.pe-intro .si-sub{margin:.65rem 0 0;font-size:1.02rem;color:#BFD6E2;opacity:0;transition:opacity .6s .5s}'+
  '.pe-intro.p4 .si-sub{opacity:1}'+
  '.pe-intro .si-ctl{position:absolute;left:0;right:0;bottom:1.1rem;display:flex;justify-content:space-between;gap:.6rem;padding:0 1.2rem;z-index:2;transition:opacity .3s}'+
  '.pe-intro .si-btn{font:inherit;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:'+SKY+';background:color-mix(in srgb,'+NAVY+' 60%,transparent);border:1px solid color-mix(in srgb,'+SKY+' 60%,transparent);border-radius:10px;padding:.55rem .9rem;cursor:pointer;backdrop-filter:blur(4px)}'+
  '.pe-intro .si-btn:hover{background:color-mix(in srgb,'+SKY+' 15%,transparent)}'+
  '.pe-intro .si-btn:focus-visible{outline:3px solid '+MUSTARD+';outline-offset:2px}'+
  '.pe-intro.si-done{pointer-events:none}'+
  '.si-replay{font:inherit;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:'+SKY+';background:none;border:1.5px solid '+SKY+';border-radius:8px;padding:.3rem .65rem;cursor:pointer;margin-left:12px}'+
  '.si-replay:hover{background:color-mix(in srgb,'+SKY+' 15%,transparent)}'+
  '.si-replay:focus-visible{outline:3px solid '+MUSTARD+';outline-offset:2px}'+
  'body.si-lock{overflow:hidden}';
  var style=document.createElement("style");style.textContent=css;document.head.appendChild(style);

  var seen=false;try{seen=!!localStorage.getItem(KEY)}catch(e){}
  var timers=[],raf=0,overlay=null;

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function svgEl(tag,attrs){var e=document.createElementNS("http://www.w3.org/2000/svg",tag);for(var k in attrs)e.setAttribute(k,attrs[k]);return e}
  function later(fn,ms){timers.push(setTimeout(fn,ms))}
  function clearAll(){timers.forEach(clearTimeout);timers=[];if(raf)cancelAnimationFrame(raf);raf=0}

  function build(){
    overlay=el("div","pe-intro");overlay.setAttribute("role","dialog");overlay.setAttribute("aria-label","Intro: "+TITLE);
    overlay.appendChild(el("div","si-grid"));
    var canvas=document.createElement("canvas");overlay.appendChild(canvas);
    var stage=el("div","si-stage");

    // 620 x 300 viewBox. The heart sits in the middle: x 216-404, top y 56, point y 236.
    var svg=svgEl("svg",{viewBox:"0 0 620 300","aria-hidden":"true"});
    var HEART="M310 236 C296 222 216 172 216 112 C216 76 244 56 274 56 C292 56 304 66 310 78 C316 66 328 56 346 56 C376 56 404 76 404 112 C404 172 324 222 310 236 Z";
    var heartg=svgEl("g",{"class":"heartg"});
    heartg.appendChild(svgEl("path",{"class":"hfill",d:HEART}));
    heartg.appendChild(svgEl("path",{"class":"ln heart",d:HEART}));
    // the week's word, inside the heart
    var word=svgEl("text",{"class":"word",x:"310",y:"128","font-size":"30"});word.textContent="?";heartg.appendChild(word);
    // MOVE pulse line flowing in (with an EKG spike) and GROW line flowing out
    var gIn=svgEl("g",{"class":"arrow"});
    gIn.appendChild(svgEl("path",{"class":"ln ekg",d:"M28 150 H112 L124 150 L134 122 L146 178 L156 150 H206 M192 140 L206 150 L192 160"}));
    var lIn=svgEl("text",{"class":"lbl",x:"28",y:"126"});lIn.textContent="MOVE";gIn.appendChild(lIn);
    svg.appendChild(gIn);
    var tokIn=svgEl("g",{"class":"arrow"});
    ["run","jump","play"].forEach(function(t){var x=svgEl("text",{"class":"tok in",x:"176",y:"184","text-anchor":"end"});x.textContent=t;tokIn.appendChild(x)});
    svg.appendChild(tokIn);
    var gOut=svgEl("g",{"class":"arrow"});
    gOut.appendChild(svgEl("path",{"class":"ln ekg",d:"M414 150 H472 L482 130 L492 168 L500 150 H592 M578 140 L592 150 L578 160"}));
    var lOut=svgEl("text",{"class":"lbl",x:"592",y:"126","text-anchor":"end"});lOut.textContent="GROW";gOut.appendChild(lOut);
    svg.appendChild(gOut);
    var tokOut=svgEl("g",{"class":"arrow"});
    ["strong","focused","happy"].forEach(function(t){var x=svgEl("text",{"class":"tok out",x:"430",y:"184"});x.textContent=t;tokOut.appendChild(x)});
    svg.appendChild(tokOut);
    svg.appendChild(heartg);
    // energy sparks rising off the top of the heart
    [[268,70,4,0],[296,56,3,.35],[326,54,4.5,.7],[352,66,3,1.0],[310,48,2.5,1.25]].forEach(function(b){
      var c=svgEl("circle",{"class":"bub",cx:b[0],cy:b[1],r:b[2]});c.style.animationDelay=b[3]+"s";svg.appendChild(c);
    });
    stage.appendChild(svg);

    var text=el("div","si-text");
    if(EYEBROW)text.appendChild(el("p","si-eyebrow",EYEBROW));
    text.appendChild(el("h1",null,TITLE));
    text.appendChild(el("p","si-sub",SUB));
    stage.appendChild(text);
    overlay.appendChild(stage);

    var ctl=el("div","si-ctl");
    var fs=el("button","si-btn","Watch full screen");fs.type="button";
    fs.addEventListener("click",function(){
      var r=overlay.requestFullscreen||overlay.webkitRequestFullscreen;
      if(r){try{var p=r.call(overlay);if(p&&p.catch)p.catch(function(){})}catch(e){}}
    });
    var skip=el("button","si-btn","Skip intro");skip.type="button";
    skip.addEventListener("click",function(){finish(true)});
    ctl.appendChild(fs);ctl.appendChild(skip);overlay.appendChild(ctl);
    if(!document.fullscreenEnabled&&!document.webkitFullscreenEnabled)fs.hidden=true;

    document.body.appendChild(overlay);document.body.classList.add("si-lock");
    skip.focus({preventScroll:true});
    return {canvas:canvas,stage:stage,word:word};
  }

  function play(){
    clearAll();
    if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);
    var parts=build(),ov=overlay;
    function phase(p,ms){later(function(){ov.classList.add(p)},ms)}
    if(reduce){
      ov.classList.add("p1","p2","p4");
      later(function(){finish(false)},1600);
      return;
    }
    requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add("p1")})});
    phase("p2",900);
    phase("p3",1800);
    var i=0;
    function nextWord(){
      if(i>=WORDS.length)return;
      fitWord(parts.word,WORDS[i]);
      parts.word.classList.remove("pop");void parts.word.getBBox();parts.word.classList.add("pop");
      i++;later(nextWord,i===WORDS.length-1?620:(i===1?560:420));
    }
    later(nextWord,1800);
    phase("p4",1800+WORDS.length*440+400);
    later(function(){dissolve(parts)},1800+WORDS.length*440+2300);
  }

  // Keep the word inside the heart (about 130 units wide at y 128).
  function fitWord(node,text){
    var MAX=124,size=30;
    node.textContent=text;
    node.setAttribute("font-size",size);
    try{
      var w=node.getComputedTextLength();
      while(w>MAX&&size>11){size-=1;node.setAttribute("font-size",size);w=node.getComputedTextLength()}
    }catch(e){}
  }

  function dissolve(parts){
    var ov=overlay;if(!ov)return;
    var cv=parts.canvas,ctx=cv.getContext("2d");
    var W=cv.width=ov.clientWidth,H=cv.height=ov.clientHeight;
    // Navy cells clear from the middle outward while confetti bursts up and fades.
    var cell=Math.max(10,Math.round(Math.min(W,H)/36));
    var cols=Math.ceil(W/cell),rows=Math.ceil(H/cell);
    var cx=W/2,cy=H/2,maxd=Math.hypot(cx,cy);
    var t0=null,DUR=1300,order=[];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      var d=Math.hypot(c*cell+cell/2-cx,r*cell+cell/2-cy)/maxd;
      order.push({c:c,r:r,t:d*0.75+Math.random()*0.25});
    }
    var cols3=[SKY,MUSTARD,CORAL,"#ffffff"];
    var bits=[];for(var k=0;k<110;k++){bits.push({x:cx+(Math.random()-.5)*Math.min(W*.6,480),y:cy+20+Math.random()*120,vx:(Math.random()-.5)*2.2,vy:-1.6-Math.random()*3.2,r:2.5+Math.random()*5,a:1,c:cols3[k%4],sq:k%3===0})}
    parts.stage.classList.add("out");
    ov.style.background="transparent";ov.querySelector(".si-grid").style.opacity="0";
    var ctl=ov.querySelector(".si-ctl");if(ctl)ctl.style.opacity="0";
    function frame(ts){
      if(t0===null)t0=ts;var p=(ts-t0)/DUR;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=NAVY;
      for(var i=0;i<order.length;i++){var o=order[i];if(o.t>p)ctx.fillRect(o.c*cell,o.r*cell,cell+1,cell+1)}
      for(var j=0;j<bits.length;j++){var b=bits[j];b.x+=b.vx;b.y+=b.vy;b.vy+=0.035;b.a-=0.011;
        if(b.a>0){ctx.globalAlpha=Math.max(0,b.a);ctx.fillStyle=b.c;
          if(b.sq){ctx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2)}
          else{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}}}
      ctx.globalAlpha=1;
      if(p<1.15)raf=requestAnimationFrame(frame);else finish(false);
    }
    raf=requestAnimationFrame(frame);
  }

  function finish(skipped){
    clearAll();
    if(!overlay)return;
    var ov=overlay;overlay=null;
    try{localStorage.setItem(KEY,"1")}catch(e){}
    if(document.fullscreenElement===ov&&document.exitFullscreen){try{document.exitFullscreen()}catch(e){}}
    if(skipped){ov.style.transition="opacity .35s";ov.style.opacity="0";ov.classList.add("si-done")}
    document.body.classList.remove("si-lock");
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov)},skipped?380:0);
  }

  function addReplay(){
    var head=document.querySelector("header.brand")||document.querySelector("header");
    if(!head||head.querySelector(".si-replay"))return;
    var b=el("button","si-replay","▸ Replay intro");b.type="button";
    b.addEventListener("click",function(){window.scrollTo(0,0);play()});
    head.appendChild(b);
  }

  window.PEIntro={replay:function(){play()},reset:function(){try{localStorage.removeItem(KEY)}catch(e){}}};

  function start(){if(!seen)play();addReplay()}
  if(document.body&&document.readyState!=="loading")start();
  else document.addEventListener("DOMContentLoaded",start);
})();
