window.WT = window.WT || {};
WT.U = WT.U || {};

WT.U.$ = (sel, root=document) => root.querySelector(sel);
WT.U.$$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
WT.U.el = (tag, attrs={}, children=[]) => {
  const e = document.createElement(tag);
  for(const k in attrs){
    if(k==="class") e.className = attrs[k];
    else if(k==="html") e.innerHTML = attrs[k];
    else if(k==="text") e.textContent = attrs[k];
    else if(k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for(const c of (Array.isArray(children)?children:[children])) if(c) e.appendChild(typeof c==="string"?document.createTextNode(c):c);
  return e;
};
WT.U.fmtTime = (iso) => {
  if(!iso) return "Unavailable";
  const d = new Date(iso);
  if(isNaN(d)) return "Unavailable";
  return d.toLocaleString();
};
WT.U.fmtShortTime = (iso) => {
  if(!iso) return "Unavailable";
  const d = new Date(iso);
  if(isNaN(d)) return "Unavailable";
  return d.toLocaleTimeString();
};
WT.U.timeAgo = (iso) => {
  if(!iso) return "Unavailable";
  const d = new Date(iso);
  if(isNaN(d)) return "Unavailable";
  const mins = Math.round((Date.now()-d.getTime())/60000);
  if(mins < 1) return "just now";
  if(mins < 60) return mins+" min ago";
  const hrs = Math.floor(mins/60);
  if(hrs < 24) return hrs+" h ago";
  return Math.floor(hrs/24)+" d ago";
};
WT.U.escape = (s) => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
WT.U.clamp = (v,a,b) => Math.max(a, Math.min(b,v));
WT.U.debounce = (fn,ms) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms);}; };

WT.U.toast = (msg, type="info") => {
  const c = document.getElementById("toastContainer");
  if(!c) return;
  const t = document.createElement("div");
  t.className = "toast toast-"+type;
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(()=>t.classList.add("show"));
  setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(),300); }, 3200);
};

WT.U.animateCount = (el, target, duration=900) => {
  if(!el) return;
  const start = performance.now();
  const from = 0;
  function step(now){
    const p = Math.min(1, (now-start)/duration);
    const eased = 1 - Math.pow(1-p,3);
    el.textContent = Math.round(from + (target-from)*eased).toLocaleString();
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

// reveal on scroll (with fallbacks so content is never invisible)
WT.U.initReveal = () => {
  const els = Array.from(document.querySelectorAll(".reveal"));
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    els.forEach(el=>el.classList.add("revealed"));
    return;
  }
  if(!("IntersectionObserver" in window)){
    els.forEach(el=>el.classList.add("revealed"));
    return;
  }
  // fallback: reveal everything after 1.5s even if observer never fires
  const fallbackTimer = setTimeout(()=>{ els.forEach(el=>el.classList.add("revealed")); }, 1500);
  let fired = false;
  const obs = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){ e.target.classList.add("revealed"); obs.unobserve(e.target); fired=true; }
    }
    if(fired) clearTimeout(fallbackTimer);
  }, {threshold:0.05, rootMargin:"0px 0px -5% 0px"});
  els.forEach(el=>obs.observe(el));
  // reveal elements already in viewport immediately
  requestAnimationFrame(()=>{
    els.forEach(el=>{
      const r = el.getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0) el.classList.add("revealed");
    });
  });
};

WT.U.formatDate = (d) => new Date(d).toLocaleDateString();

// CSV export
WT.U.exportCSV = (rows, filename) => {
  if(!rows || !rows.length){ WT.U.toast("No data to export","warning"); return; }
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(",")].concat(rows.map(r=>keys.map(k=>`"${String(r[k]??"").replace(/"/g,'""')}"`).join(","))).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=filename||"export.csv"; a.click();
  URL.revokeObjectURL(url);
  WT.U.toast("CSV exported","success");
};

// theme
WT.U.applyTheme = (theme) => {
  document.documentElement.classList.toggle("light", theme==="light");
  localStorage.setItem("wt-theme", theme);
};
WT.U.initTheme = () => {
  const t = localStorage.getItem("wt-theme") || "dark";
  WT.U.applyTheme(t);
};

// reduced motion
WT.U.reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;