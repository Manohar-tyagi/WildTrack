window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.analytics = function(){
  const outage = WT.Store.outage;
  let html = "";
  if(outage) html += WT.C.offlineBanner();
  html += WT.C.pageHeader("Analytics & Reports", "Charts and report history. Demo data.");
  html += `<div class="row" style="margin-bottom:12px">
    <select id="anAnimal" class="search-box" style="max-width:160px"><option value="">All animals</option>${WT.DATA.animals.map(a=>`<option value="${a.animalId}">${a.animalId}</option>`).join("")}</select>
    <select id="anSpecies" class="search-box" style="max-width:160px"><option value="">All species</option>${WT.SPECIES.map(s=>`<option>${s}</option>`).join("")}</select>
    <select id="anRange" class="search-box" style="max-width:160px"><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option></select>
    <button class="btn btn-primary" id="exportCsv">Export CSV</button>
  </div>`;
  html += `<div class="grid grid-2" style="margin-bottom:16px">
    <div class="chart-card"><h3>Movement distribution</h3><div class="chart-wrap"><canvas id="chartMove"></canvas></div></div>
    <div class="chart-card"><h3>Reports per animal</h3><div class="chart-wrap"><canvas id="chartReports"></canvas></div></div>
  </div>`;
  html += `<div class="chart-card" style="margin-bottom:16px"><h3>Battery trend</h3><div class="chart-wrap"><canvas id="chartBatt"></canvas></div></div>`;
  html += `<div class="card glass"><h3>Report history</h3>
    <div class="row" style="margin-bottom:8px">
      <input id="repSearch" class="search-box" placeholder="Search reports…" />
    </div>
    <div id="reportTable"></div>
  </div>`;
  return html;
};

function renderReportTable(){
  const q = (document.getElementById("repSearch")?.value||"").toLowerCase();
  const animal = document.getElementById("anAnimal")?.value || "";
  const species = document.getElementById("anSpecies")?.value || "";
  let rows = WT.allReports();
  if(animal) rows = rows.filter(r=>r.animalId===animal);
  if(species) rows = rows.filter(r=>r.species===species);
  if(q) rows = rows.filter(r=> (r.animalId+" "+r.species).toLowerCase().includes(q));
  rows = rows.slice().sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,100);
  const container = document.getElementById("reportTable");
  if(!container) return;
  if(!rows.length){ container.innerHTML = WT.C.emptyState("No reports"); return; }
  container.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Animal</th><th>Species</th><th>Time</th><th>Lat</th><th>Lng</th><th>Movement</th><th>Battery</th><th>Conn</th><th>Valid</th></tr></thead><tbody>
    ${rows.map(r=>`<tr>
      <td>${WT.U.escape(r.animalId)}</td><td>${WT.U.escape(r.species)}</td>
      <td>${WT.U.fmtShortTime(r.timestamp)}</td>
      <td>${r.lat}</td><td>${r.lng}</td>
      <td>${WT.C.statusBadge(r.movementStatus)}</td>
      <td>${r.batteryPercentage}%</td>
      <td>${WT.C.statusBadge(r.connectionStatus)}</td>
      <td>${WT.validateCoords(r.lat,r.lng)?"✓":"✗"}</td>
    </tr>`).join("")}
  </tbody></table></div>`;
}

WT.ChartInit = WT.ChartInit || {};
WT.ChartInit.analytics = function(){
  // movement distribution
  const ctx = document.getElementById("chartMove");
  if(ctx && typeof Chart!=="undefined"){
    const moving = WT.allReports().filter(r=>r.movementStatus==="MOVING").length;
    const resting = WT.allReports().filter(r=>r.movementStatus==="RESTING").length;
    if(ctx._chart) ctx._chart.destroy();
    ctx._chart = new Chart(ctx, {type:"doughnut", data:{labels:["Moving","Resting"], datasets:[{data:[moving,resting], backgroundColor:["#3D9B68","#D9B65D"]}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#F3F5F0"}}}}});
  }
  const ctx2 = document.getElementById("chartReports");
  if(ctx2 && typeof Chart!=="undefined"){
    const counts = {};
    for(const a of WT.DATA.animals) counts[a.animalId]=a.reports.length;
    if(ctx2._chart) ctx2._chart.destroy();
    ctx2._chart = new Chart(ctx2, {type:"bar", data:{labels:Object.keys(counts), datasets:[{label:"Reports", data:Object.values(counts), backgroundColor:"#D9B65D"}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#F3F5F0"}}}, scales:{x:{ticks:{color:"#AAB8AD"}},y:{ticks:{color:"#AAB8AD"}}}}});
  }
  const ctx3 = document.getElementById("chartBatt");
  if(ctx3 && typeof Chart!=="undefined"){
    // battery trend for selected animal or avg
    const animalSel = document.getElementById("anAnimal")?.value;
    const labels = [];
    const data = [];
    const src = animalSel ? WT.DATA.animals.find(a=>a.animalId===animalSel) : null;
    if(src){
      src.reports.forEach(r=>{ labels.push(WT.U.fmtShortTime(r.timestamp)); data.push(r.batteryPercentage); });
    } else {
      // avg battery per day bucket
      const reps = WT.allReports().slice().sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
      reps.forEach(r=>{ labels.push(WT.U.fmtShortTime(r.timestamp)); data.push(r.batteryPercentage); });
      // downsample
      const step = Math.max(1, Math.floor(labels.length/20));
      const l2=[], d2=[];
      for(let i=0;i<labels.length;i+=step){ l2.push(labels[i]); d2.push(data[i]); }
      labels.splice(0,labels.length,...l2); data.splice(0,data.length,...d2);
    }
    if(ctx3._chart) ctx3._chart.destroy();
    ctx3._chart = new Chart(ctx3, {type:"line", data:{labels, datasets:[{label:"Battery %", data, borderColor:"#3D9B68", backgroundColor:"rgba(61,155,104,0.2)", fill:true}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#F3F5F0"}}}, scales:{x:{ticks:{color:"#AAB8AD"}},y:{ticks:{color:"#AAB8AD"}, min:0,max:100}}}});
  }
};

WT.PageInit.analytics = function(){
  renderReportTable();
  ["anAnimal","anSpecies","anRange"].forEach(id=>{
    const e=document.getElementById(id);
    if(e){ e.addEventListener("change", ()=>{ renderReportTable(); WT.ChartInit.analytics(); }); }
  });
  const rs = document.getElementById("repSearch");
  if(rs) rs.addEventListener("input", renderReportTable);
  document.getElementById("exportCsv").addEventListener("click", ()=>{
    const rows = WT.allReports().map(r=>({
      animalId:r.animalId, species:r.species, timestamp:r.timestamp, lat:r.lat, lng:r.lng,
      movementStatus:r.movementStatus, battery:r.batteryPercentage, connection:r.connectionStatus,
      valid:WT.validateCoords(r.lat,r.lng)
    }));
    WT.U.exportCSV(rows, "wildtrack-reports.csv");
  });
  WT.ChartInit.analytics();
  WT.Store.subscribe(()=>{ if(WT.Store.route==="analytics"){ renderReportTable(); } });
};