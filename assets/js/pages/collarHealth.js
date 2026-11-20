window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.collarHealth = function(){
  const outage = WT.Store.outage;
  let html = "";
  if(outage) html += WT.C.offlineBanner();
  html += WT.C.pageHeader("Collar Health", "Battery gauge, connection badge, last communication. Demo data.");
  html += `<div class="grid grid-3" id="collarGrid"></div>`;
  // render after
  setTimeout(()=>{
    const grid = document.getElementById("collarGrid");
    if(!grid) return;
    grid.innerHTML = WT.DATA.animals.map(a=>{
      const r = WT.latestReport(a);
      const cs = WT.connectionEffective(r);
      const tip = cs==="CONNECTED"?"Collar communicating normally (demo).":
                  cs==="DISCONNECTED"?"Collar not communicating (demo).":
                  cs==="STALE"?"No recent report within timeout (demo).":"Status unknown.";
      return `<div class="battery-card glass">
        <h3>${WT.U.escape(a.animalId)}</h3>
        <p class="muted small">${WT.U.escape(a.species)} • ${WT.U.escape(a.collarId)}</p>
        ${WT.C.batteryRing(r?r.batteryPercentage:0)}
        <div style="margin-top:8px">${WT.C.statusBadge(cs)}</div>
        <p class="small muted" title="${tip}">${tip}</p>
        <p class="small">Last comm: ${r?WT.U.timeAgo(r.timestamp):"Unavailable"}</p>
      </div>`;
    }).join("");
  },0);
  return html;
};