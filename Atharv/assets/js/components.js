window.WT = window.WT || {};
WT.C = WT.C || {};

// Status badge: icon + text, never colour alone
WT.C.statusBadge = function(status){
  const s = status || "UNKNOWN";
  const icon = WT.statusIcon(s);
  const cls = "status-badge status-"+s.toLowerCase();
  return `<span class="${cls}" role="status" aria-label="${WT.U.escape(s)}"><span class="status-icon" aria-hidden="true">${icon}</span> ${WT.U.escape(s)}</span>`;
};

WT.C.kpiCard = function({label, value, sub, icon, color}){
  return `<div class="kpi-card glass reveal">
    <div class="kpi-top"><span class="kpi-icon" style="color:${color||'var(--accent)'}">${icon||'●'}</span><span class="kpi-label">${WT.U.escape(label)}</span></div>
    <div class="kpi-value" data-count="${value}">0</div>
    <div class="kpi-sub">${WT.U.escape(sub||'')}</div>
    <canvas class="spark" width="120" height="30" data-spark="${label}"></canvas>
  </div>`;
};

WT.C.skeleton = function(h=120){
  return `<div class="skeleton" style="height:${h}px"></div>`;
};

WT.C.emptyState = function(msg, hint){
  return `<div class="empty-state"><div class="empty-icon">∅</div><p>${WT.U.escape(msg)}</p>${hint?`<small>${WT.U.escape(hint)}</small>`:''}</div>`;
};

WT.C.errorState = function(msg){
  return `<div class="error-state"><div class="err-icon">!</div><p>${WT.U.escape(msg)}</p></div>`;
};

WT.C.offlineBanner = function(){
  return `<div class="offline-banner">⚠ Offline / backend outage — showing last-known data. Last report time preserved. Data is not live.</div>`;
};

WT.C.pageHeader = function(title, subtitle){
  return `<div class="page-header reveal">
    <h1>${WT.U.escape(title)}</h1>
    ${subtitle?`<p>${WT.U.escape(subtitle)}</p>`:''}
  </div>`;
};

WT.C.card = function(html, cls=""){
  return `<div class="card glass ${cls}">${html}</div>`;
};

WT.C.modal = function(id, title, body){
  return `<div class="modal" id="${id}" hidden>
    <div class="modal-backdrop" data-close="${id}"></div>
    <div class="modal-box glass">
      <div class="modal-head"><h3>${WT.U.escape(title)}</h3><button class="icon-btn" data-close="${id}" aria-label="Close">✕</button></div>
      <div class="modal-body">${body}</div>
    </div>
  </div>`;
};

// Animate count-ups in a container
WT.C.animateKPIs = function(root){
  root = root||document;
  root.querySelectorAll(".kpi-value[data-count]").forEach(el=>{
    WT.U.animateCount(el, Number(el.dataset.count));
  });
};

// sparkline draw (simple)
WT.C.drawSparklines = function(root){
  root = root||document;
  root.querySelectorAll("canvas.spark").forEach(c=>{
    const ctx = c.getContext("2d");
    const pts = Array.from({length:12},()=>Math.random()*0.8+0.1);
    ctx.clearRect(0,0,c.width,c.height);
    ctx.strokeStyle = "rgba(217,182,93,0.9)";
    ctx.lineWidth=1.5;
    ctx.beginPath();
    pts.forEach((p,i)=>{
      const x = i/(pts.length-1)*c.width;
      const y = c.height - p*c.height;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  });
};

// battery ring
WT.C.batteryRing = function(pct){
  const p = WT.U.clamp(pct,0,100);
  const color = p<WT.CONFIG.lowBatteryThreshold ? "var(--critical)" : (p<40?"var(--warning)":"var(--success)");
  const r=26, circ=2*Math.PI*r;
  const dash = circ*(p/100);
  return `<svg class="battery-ring" viewBox="0 0 64 64" aria-label="Battery ${p}%">
    <circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/>
    <circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-dasharray="${dash} ${circ}" stroke-linecap="round" transform="rotate(-90 32 32)"/>
    <text x="32" y="36" text-anchor="middle" font-size="12" fill="var(--text)">${p}%</text>
  </svg>`;
};

// map marker factory (leaflet) handled in tracking page

// filter chips helper
WT.C.chips = function(items, active, onClickName){
  return `<div class="chips">${items.map(it=>`<button class="chip ${it===active?'active':''}" data-chip="${WT.U.escape(it)}">${WT.U.escape(it)}</button>`).join("")}</div>`;
};