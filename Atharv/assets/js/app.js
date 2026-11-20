window.WT = window.WT || {};
WT.App = {};

const ROUTES = {
  "home": {page:()=>WT.Pages.home(), title:"Home", marketing:true},
  "": {page:()=>WT.Pages.home(), title:"Home", marketing:true},
  "dashboard": {page:()=>WT.Pages.dashboard(), title:"Overview", marketing:false},
  "live-tracking": {page:()=>WT.Pages.tracking(), title:"Live Tracking", marketing:false},
  "tracking": {page:()=>WT.Pages.tracking(), title:"Live Tracking", marketing:false},
  "animals": {page:()=>WT.Pages.animals(), title:"Animals", marketing:false},
  "animal": {page:(p)=>WT.Pages.animalProfile(p), title:"Animal Profile", marketing:false},
  "collar-health": {page:()=>WT.Pages.collarHealth(), title:"Collar Health", marketing:false},
  "alerts": {page:()=>WT.Pages.alerts(), title:"Alerts", marketing:false},
  "analytics": {page:()=>WT.Pages.analytics(), title:"Analytics & Reports", marketing:false},
  "use-cases": {page:()=>WT.Pages.useCases(), title:"Use Cases", marketing:true},
  "use-case": {page:(p)=>WT.Pages.useCaseDetail(p), title:"Use Case", marketing:true},
  "integrations": {page:()=>WT.Pages.integrations(), title:"Integrations", marketing:true},
  "how-it-works": {page:()=>WT.Pages.howItWorks(), title:"How It Works", marketing:true},
  "about": {page:()=>WT.Pages.about(), title:"About", marketing:true},
  "team": {page:()=>WT.Pages.team(), title:"Team 20", marketing:true},
  "news": {page:()=>WT.Pages.news(), title:"News", marketing:true},
  "events": {page:()=>WT.Pages.events(), title:"Events", marketing:true},
  "help": {page:()=>WT.Pages.help(), title:"Help & Settings", marketing:false},
  "faq": {page:()=>WT.Pages.faq(), title:"FAQ", marketing:false},
  "contact": {page:()=>WT.Pages.contact(), title:"Contact", marketing:true},
  "login": {page:()=>WT.Pages.login(), title:"Demo login", marketing:true},
};

function parseHash(){
  const raw = (location.hash || "").replace(/^#/,"");
  const h = raw || "home";
  const parts = h.split("/").filter(Boolean);
  // normalize: if first segment is "animals" with an id, route to animal profile
  if(parts[0]==="animals" && parts[1]){
    return {name:"animal", params:parts.slice(1), original:"animals/"+parts[1]};
  }
  if(parts[0]==="use-cases" && parts[1]){
    return {name:"use-case", params:parts.slice(1), original:"use-cases/"+parts[1]};
  }
  const first = parts[0] || "home";
  return {name:first, params:parts.slice(1), original:parts.join("/")};
}

function render404(){
  return `<div style="max-width:700px;margin:80px auto;padding:24px;text-align:center">
    ${WT.C.pageHeader("404 — Page not found", "The route you requested does not exist.")}
    <a class="btn btn-primary" href="#/home">Go home</a>
  </div>`;
}

function render(){
  const {name, params} = parseHash();
  const r = ROUTES[name];
  if(!r){
    WT.Store.route = name;
    const main = document.getElementById("main");
    if(main){ main.innerHTML = render404(); }
    window.scrollTo(0,0);
    WT.U.initReveal();
    return;
  }
  WT.Store.route = name;
  WT.Store.params = params;
  const marketing = !!r.marketing;
  document.body.classList.toggle("marketing", marketing);
  const topbar = document.getElementById("topbar");
  if(topbar) topbar.style.display = marketing ? "block" : "none";
  const sidebar = document.getElementById("sidebar");
  if(sidebar) sidebar.style.display = marketing ? "none" : "";
  const appTopbar = document.getElementById("appTopbar");
  if(appTopbar) appTopbar.style.display = marketing ? "none" : "flex";
  const shell = document.getElementById("shell");
  if(shell) shell.style.display = "flex";
  const pageTitle = document.getElementById("pageTitle");
  if(pageTitle) pageTitle.textContent = r.title;
  const main = document.getElementById("main");
  if(!main) return;
  main.innerHTML = `<div class="reveal">${WT.C.skeleton(200)}</div>`;
  requestAnimationFrame(()=>{
    try {
      const node = r.page(params);
      main.innerHTML = "";
      if(typeof node === "string") main.innerHTML = node;
      else if(node instanceof HTMLElement) main.appendChild(node);
    } catch(e){
      console.error("Render error:", e);
      main.innerHTML = `<div class="error-state"><div class="err-icon">!</div><p>Something went wrong — please reload.</p><pre style="text-align:left;font-size:12px">${WT.U.escape(e && e.stack ? e.stack : e)}</pre></div>`;
    }
    afterRender(name);
    WT.U.initReveal();
  });
  document.querySelectorAll(".side-link").forEach(a=>{
    const route = a.dataset.route;
    a.classList.toggle("active", route===name || (route==="animals" && name==="animal") || (route==="tracking" && name==="live-tracking"));
  });
  // nav link active highlight (marketing)
  document.querySelectorAll(".nav-link").forEach(a=>{
    const href = a.getAttribute("href")||"";
    a.classList.toggle("active", href==="#/"+name);
  });
  window.scrollTo(0,0);
  // close dropdowns
  document.querySelectorAll(".nav-dropdown.open").forEach(d=>d.classList.remove("open"));
}

function afterRender(name){
  WT.C.animateKPIs(document);
  WT.C.drawSparklines(document);
  if(WT.PageInit && WT.PageInit[name]) { try { WT.PageInit[name](); } catch(e){ console.error(e); } }
  if(WT.MapInit && WT.MapInit[name]) { try { WT.MapInit[name](); } catch(e){ console.error(e); } }
  if(WT.ChartInit && WT.ChartInit[name]) { try { WT.ChartInit[name](); } catch(e){ console.error(e); } }
  if(WT.PageInit && WT.PageInit["*"]) { try { WT.PageInit["*"](); } catch(e){} }
}

window.addEventListener("hashchange", render);

// topbar shrink
window.addEventListener("scroll", ()=>{
  const t = document.getElementById("topbar");
  if(!t) return;
  t.classList.toggle("shrunk", window.scrollY>40);
});

// theme toggle
document.addEventListener("click", (e)=>{
  const btn = e.target.closest("#themeToggle");
  if(btn){ const cur = localStorage.getItem("wt-theme")||"dark"; WT.U.applyTheme(cur==="dark"?"light":"dark"); }
});

// mobile menu / sidebar
document.addEventListener("click", (e)=>{
  if(e.target.closest("#mobileMenuBtn")){
    const panel = document.querySelector(".mobile-nav-panel");
    if(panel) panel.classList.toggle("open");
  }
  if(e.target.closest("#mobileSideBtn")){
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarBackdrop").classList.toggle("open");
  }
  if(e.target.closest("#sidebarBackdrop")){
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarBackdrop").classList.remove("open");
  }
});

// announce close
document.addEventListener("click", (e)=>{
  if(e.target.closest("#announceClose")){ const a=document.getElementById("announce"); if(a) a.style.display="none"; }
});

// dropdowns: one open at a time, hover with delay, click, keyboard
let ddCloseTimer = null;
function closeAllDropdowns(){
  document.querySelectorAll(".nav-dropdown.open").forEach(d=>d.classList.remove("open"));
  document.querySelectorAll(".dd-trigger").forEach(t=>t.setAttribute("aria-expanded","false"));
}
document.querySelectorAll(".nav-dropdown").forEach(dd=>{
  const trigger = dd.querySelector(".dd-trigger");
  const menu = dd.querySelector(".dd-menu");
  dd.addEventListener("mouseenter", ()=>{ clearTimeout(ddCloseTimer); closeAllDropdowns(); dd.classList.add("open"); trigger.setAttribute("aria-expanded","true"); });
  dd.addEventListener("mouseleave", ()=>{ ddCloseTimer = setTimeout(()=>{ dd.classList.remove("open"); trigger.setAttribute("aria-expanded","false"); }, 150); });
  trigger.addEventListener("click", (e)=>{ e.stopPropagation(); const isOpen = dd.classList.contains("open"); closeAllDropdowns(); if(!isOpen){ dd.classList.add("open"); trigger.setAttribute("aria-expanded","true"); } });
  trigger.addEventListener("keydown", (e)=>{
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); trigger.click(); }
    if(e.key==="Escape"){ closeAllDropdowns(); trigger.focus(); }
    if(e.key==="ArrowDown"){ e.preventDefault(); const first = menu.querySelector("a"); if(first) first.focus(); }
  });
  menu.addEventListener("keydown", (e)=>{
    if(e.key==="Escape"){ closeAllDropdowns(); trigger.focus(); }
  });
});
document.addEventListener("click", (e)=>{
  if(!e.target.closest(".nav-dropdown")) closeAllDropdowns();
});

// sim panel
document.addEventListener("click", (e)=>{
  if(e.target.closest("#simFab")){
    const p = document.getElementById("simPanel");
    if(p) p.hidden = !p.hidden;
  }
  const simBtn = e.target.closest("[data-sim]");
  if(simBtn){
    const action = simBtn.dataset.sim;
    const map = {
      addReport: ()=>WT.Store.addSampleReport(),
      flipStatus: ()=>WT.Store.flipStatus(),
      drainBattery: ()=>WT.Store.drainBattery(),
      disconnect: ()=>WT.Store.disconnect(),
      invalidGps: ()=>WT.Store.invalidGps(),
      outage: ()=>WT.Store.outage(),
      restore: ()=>WT.Store.restore(),
      reset: ()=>WT.Store.resetDemo()
    };
    if(map[action]) map[action]();
  }
  // lightbox close
  if(e.target.closest("[data-lightbox-close]")){ const lb=document.getElementById("lightbox"); if(lb) lb.hidden=true; }
});
const art = document.getElementById("autoRefreshToggle");
if(art) art.addEventListener("change", (e)=>{ WT.Store.setAutoRefresh(e.target.checked); });

// cmdk
const cmdkBackdrop = document.getElementById("cmdkBackdrop");
const cmdkInput = document.getElementById("cmdkInput");
const cmdkResults = document.getElementById("cmdkResults");
function openCmdk(){ if(cmdkBackdrop){ cmdkBackdrop.hidden=false; cmdkInput.value=""; cmdkInput.focus(); renderCmdk(""); } }
function closeCmdk(){ if(cmdkBackdrop) cmdkBackdrop.hidden=true; }
document.addEventListener("keydown", (e)=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); openCmdk(); }
  if(e.key==="Escape") closeCmdk();
  // shortcuts
  if(e.key==="?" && !e.ctrlKey && !e.metaKey){ e.preventDefault(); showShortcuts(); }
  if(e.key==="f" && !e.ctrlKey && !e.metaKey && !e.target.matches("input,textarea")){ toggleFullscreen(); }
  // G then X
  if(e.key.toLowerCase()==="g" && !e.ctrlKey && !e.metaKey && !e.target.matches("input,textarea")){ WT._gPending = true; setTimeout(()=>{WT._gPending=false;},1200); }
  else if(WT._gPending){
    WT._gPending=false;
    const m = {"d":"dashboard","l":"live-tracking","a":"animals","c":"collar-health","r":"alerts","n":"analytics"};
    if(m[e.key.toLowerCase()]){ location.hash = "#/"+m[e.key.toLowerCase()]; }
  }
});
if(cmdkBackdrop) cmdkBackdrop.addEventListener("click", (e)=>{ if(e.target===cmdkBackdrop) closeCmdk(); });
if(cmdkInput) cmdkInput.addEventListener("input", ()=>renderCmdk(cmdkInput.value));
function renderCmdk(q){
  if(!cmdkResults) return;
  const items = [];
  Object.keys(ROUTES).forEach(k=>{ if(k) items.push({type:"page", label:k, route:k}); });
  (WT.DATA.animals||[]).forEach(a=> items.push({type:"animal", label:a.animalId+" "+a.species+" "+(a.name||""), route:"animal/"+a.animalId}));
  const ql = (q||"").toLowerCase();
  const filtered = items.filter(it=>it.label.toLowerCase().includes(ql)).slice(0,30);
  cmdkResults.innerHTML = filtered.map(it=>`<div class="cmdk-item" data-route="${it.route}"><span>${WT.U.escape(it.label)}</span><span class="muted small">${it.type}</span></div>`).join("");
  cmdkResults.querySelectorAll(".cmdk-item").forEach(el=>{
    el.addEventListener("click", ()=>{ location.hash = "#/"+el.dataset.route; closeCmdk(); });
  });
}

// cursor ring
const ring = document.getElementById("cursorRing");
if(ring && !WT.U.reducedMotion()){
  window.addEventListener("mousemove", (e)=>{ ring.style.left = e.clientX+"px"; ring.style.top = e.clientY+"px"; });
}

// store subscription
WT.Store.subscribe(()=>{
  const pill = document.getElementById("dataStatusPill");
  const pill2 = document.getElementById("dataStatusPill2");
  const txt = "Demo data • Last synced "+WT.U.fmtShortTime(WT.lastSynced);
  if(pill) pill.textContent = txt;
  if(pill2) pill2.textContent = txt;
  const nb = document.getElementById("notifBadge");
  if(nb) nb.textContent = (WT.DATA.alerts||[]).filter(a=>a.state==="New").length;
  if(WT.Store.route==="dashboard"){
    const k = WT.Store.kpis();
    const vals = [k.total,k.moving,k.resting,k.connected,k.attention];
    document.querySelectorAll(".kpi-value[data-count]").forEach((el,i)=>{ if(vals[i]!=null){ el.dataset.count=vals[i]; el.textContent=Number(vals[i]).toLocaleString(); } });
  }
});

// datetime
setInterval(()=>{ const d=document.getElementById("datetime"); if(d) d.textContent=new Date().toLocaleString(); },1000);

// shortcuts overlay
function showShortcuts(){
  let el = document.getElementById("shortcutOverlay");
  if(!el){
    el = document.createElement("div");
    el.id="shortcutOverlay";
    el.className="lightbox";
    el.innerHTML = `<div class="card glass" style="max-width:420px"><h3>Keyboard shortcuts</h3>
      <ul style="text-align:left">
        <li>Ctrl/Cmd+K — Command palette</li>
        <li>G then D/L/A/C/R/N — Go to Dashboard/Live/Animals/Collars/Alerts/Analytics</li>
        <li>F — Fullscreen</li>
        <li>? — This help</li>
        <li>Esc — Close overlays</li>
      </ul>
      <button class="btn btn-primary" onclick="document.getElementById('shortcutOverlay').hidden=true">Close</button></div>`;
    document.body.appendChild(el);
  }
  el.hidden = false;
}
function toggleFullscreen(){
  if(!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  else document.exitFullscreen && document.exitFullscreen();
}

// presentation tour
WT.App.startTour = function(){
  const steps = [
    {sel:"#main .kpi-card", caption:"Dashboard KPIs computed from demo report records. Note the 'Demo data • Last synced' pill."},
    {sel:"#trackMap, #dashMap", caption:"Live Tracking map with animated markers (pulse = MOVING). Click a marker for details."},
    {sel:".detail-panel, #detailPanel", caption:"Animal detail panel shows latest LocationReport: lat, lng, timestamp, status, battery, connection."},
    {sel:".battery-card, .battery-ring", caption:"Collar Health: battery gauge + connection badge + last communication."},
    {sel:"#simFab", caption:"Use Simulate to flip MOVING/RESTING, drain battery, disconnect, send invalid GPS, or simulate outage."},
    {sel:".offline-banner", caption:"Outage keeps last-known timestamp and never shows stale data as live."}
  ];
  let i=0;
  let overlay = document.getElementById("tourOverlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.id="tourOverlay";
    overlay.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:95;display:grid;place-items:center;padding:24px";
    overlay.innerHTML = `<div class="card glass" style="max-width:460px">
      <h3 id="tourTitle">Guided tour</h3>
      <p id="tourCaption" class="muted"></p>
      <div class="row" style="justify-content:space-between;margin-top:12px">
        <button class="btn btn-ghost" id="tourBack">Back</button>
        <span id="tourStep" class="muted small"></span>
        <button class="btn btn-primary" id="tourNext">Next</button>
      </div>
      <button class="btn btn-ghost" id="tourSkip" style="margin-top:8px">Skip</button>
    </div>`;
    document.body.appendChild(overlay);
  }
  function show(){
    const step = steps[i];
    overlay.style.display="grid";
    document.getElementById("tourCaption").textContent = step.caption;
    document.getElementById("tourStep").textContent = (i+1)+"/"+steps.length;
    const el = document.querySelector(step.sel);
    if(el){ el.scrollIntoView({behavior:"smooth",block:"center"}); el.style.outline="3px solid var(--accent)"; setTimeout(()=>{el.style.outline="";},1200); }
  }
  document.getElementById("tourNext").onclick = ()=>{ if(i<steps.length-1){i++;show();}else{overlay.style.display="none";} };
  document.getElementById("tourBack").onclick = ()=>{ if(i>0){i--;show();} };
  document.getElementById("tourSkip").onclick = ()=>{ overlay.style.display="none"; };
  show();
};

// init
WT.U.initTheme();
WT.updateLastSynced();
WT.Store.emit();
// try loading JSON data (best-effort)
if(WT.DataService && WT.DataService.init){ WT.DataService.init(); }
render();

// expose
WT.App.render = render;
WT.App.parseHash = parseHash;