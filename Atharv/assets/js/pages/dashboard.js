window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.dashboard = function(){
  const k = WT.Store.kpis();
  const outage = WT.Store.outage;
  let html = "";
  if(outage) html += WT.C.offlineBanner();
  html += WT.C.pageHeader("Overview", "KPIs calculated from demo report records. Simulated sample data.");
  html += `<div class="grid grid-5" style="margin-bottom:16px">
    ${WT.C.kpiCard({label:"Total animals", value:k.total, sub:"Registered (demo)", icon:"🐾", color:"var(--accent)"})}
    ${WT.C.kpiCard({label:"Moving", value:k.moving, sub:"Currently moving", icon:"➤", color:"var(--success)"})}
    ${WT.C.kpiCard({label:"Resting", value:k.resting, sub:"Currently resting", icon:"⏸", color:"var(--accent)"})}
    ${WT.C.kpiCard({label:"Collars connected", value:k.connected, sub:"CONNECTED", icon:"●", color:"var(--success)"})}
    ${WT.C.kpiCard({label:"Needs attention", value:k.attention, sub:"Low batt / offline / stale", icon:"!", color:"var(--critical)"})}
  </div>`;

  html += `<div class="grid grid-2" style="margin-bottom:16px">
    <div class="card glass">
      <h3>Map preview</h3>
      <div id="dashMap" style="height:280px;border-radius:12px"></div>
    </div>
    <div class="card glass">
      <h3>Recent reports</h3>
      <div id="recentReports" style="max-height:280px;overflow-y:auto"></div>
    </div>
  </div>`;

  html += `<div class="grid grid-2" style="margin-bottom:16px">
    <div class="card glass">
      <h3>Collar health summary</h3>
      <div id="collarSummary"></div>
    </div>
    <div class="card glass">
      <h3>Alerts summary</h3>
      <div id="alertsSummary"></div>
    </div>
  </div>`;

  html += `<div class="card glass">
    <div class="row" style="justify-content:space-between;margin-bottom:8px">
      <h3 style="margin:0">Moving vs Resting</h3>
      <select id="dateRange" class="search-box" style="max-width:160px">
        <option value="7">Last 7 days</option>
        <option value="14">Last 14 days</option>
        <option value="30">Last 30 days</option>
      </select>
    </div>
    <div class="chart-wrap"><canvas id="mvChart"></canvas></div>
  </div>`;
  return html;
};

WT.PageInit.dashboard = function(){
  // recent reports
  const reps = WT.allReports().sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,8);
  const rr = document.getElementById("recentReports");
  if(rr){
    if(!reps.length) rr.innerHTML = WT.C.emptyState("No reports");
    else rr.innerHTML = reps.map(r=>`
      <div class="detail-row">
        <span>${WT.U.escape(r.animalId)} ${WT.C.statusBadge(r.movementStatus)}</span>
        <span class="muted small">${WT.U.timeAgo(r.timestamp)}</span>
      </div>`).join("");
  }
  // collar summary
  const cs = document.getElementById("collarSummary");
  if(cs){
    const animals = WT.DATA.animals.slice(0,6);
    cs.innerHTML = animals.map(a=>{
      const r = WT.latestReport(a);
      return `<div class="detail-row">
        <span>${WT.U.escape(a.animalId)} ${WT.C.statusBadge(WT.connectionEffective(r))}</span>
        ${WT.C.batteryRing(r?r.batteryPercentage:0)}
      </div>`;
    }).join("");
  }
  // alerts summary
  const asum = document.getElementById("alertsSummary");
  if(asum){
    const alerts = WT.DATA.alerts.slice(0,6);
    if(!alerts.length) asum.innerHTML = WT.C.emptyState("No alerts");
    else asum.innerHTML = alerts.map(a=>`
      <div class="detail-row">
        <span>${WT.U.escape(a.type)} • ${WT.U.escape(a.animalId)}</span>
        <span class="badge badge-new">${WT.U.escape(a.state)}</span>
      </div>`).join("");
  }
};

WT.PageInit.dashboard = WT.PageInit.dashboard || function(){};
// add live refresh of recent reports on store emit
WT.Store.subscribe(()=>{
  if(WT.Store.route!=="dashboard") return;
  const reps = WT.allReports().sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,8);
  const rr = document.getElementById("recentReports");
  if(rr){
    if(!reps.length) rr.innerHTML = WT.C.emptyState("No reports");
    else rr.innerHTML = reps.map(r=>`<div class="detail-row"><span>${WT.U.escape(r.animalId)} ${WT.C.statusBadge(r.movementStatus)}</span><span class="muted small">${WT.U.timeAgo(r.timestamp)}</span></div>`).join("");
  }
});
WT.MapInit = WT.MapInit || {};
WT.MapInit.dashboard = function(){
  const el = document.getElementById("dashMap");
  if(!el || typeof L==="undefined") return;
  if(WT._dashMap){ try{WT._dashMap.remove();}catch(e){} }
  const map = L.map(el).setView([20,78],5);
  WT._dashMap = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution:'&copy; OpenStreetMap'}).addTo(map);
  for(const a of WT.DATA.animals){
    const r = WT.latestReport(a);
    if(!r || !WT.validateCoords(r.lat,r.lng)) continue;
    const color = r.movementStatus==="MOVING" ? "#3D9B68" : "#D9B65D";
    L.circleMarker([r.lat,r.lng], {radius:6, color, fillColor:color, fillOpacity:0.9}).addTo(map).bindPopup(`${a.animalId} ${a.species}`);
  }
  setTimeout(()=>map.invalidateSize(),100);
};

WT.ChartInit = WT.ChartInit || {};
WT.ChartInit.dashboard = function(){
  const ctx = document.getElementById("mvChart");
  if(!ctx || typeof Chart==="undefined") return;
  const days = 7;
  const labels = Array.from({length:days},(_,i)=> "D"+(i+1));
  const moving = labels.map(()=>Math.floor(Math.random()*8)+4);
  const resting = labels.map(()=>Math.floor(Math.random()*6)+2);
  new Chart(ctx, {
    type:"bar",
    data:{labels, datasets:[
      {label:"Moving", data:moving, backgroundColor:"#3D9B68"},
      {label:"Resting", data:resting, backgroundColor:"#D9B65D"}
    ]},
    options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:"#F3F5F0"}}}, scales:{x:{ticks:{color:"#AAB8AD"}},y:{ticks:{color:"#AAB8AD"}}}}
  });
  // date range change -> regenerate
  const sel = document.getElementById("dateRange");
  if(sel) sel.addEventListener("change", ()=> WT.ChartInit.dashboard());
};