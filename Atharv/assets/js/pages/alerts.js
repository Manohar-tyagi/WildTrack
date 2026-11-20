window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.alerts = function(){
  const outage = WT.Store.outage;
  let html = "";
  if(outage) html += WT.C.offlineBanner();
  html += WT.C.pageHeader("Alerts", "Demo alert lifecycle: New → Acknowledged → Resolved.");
  html += `<div class="row" style="margin-bottom:12px">
    <select id="alertSevFilter" class="search-box" style="max-width:160px"><option value="">All severity</option><option>critical</option><option>high</option><option>medium</option><option>low</option></select>
    <select id="alertTypeFilter" class="search-box" style="max-width:220px"><option value="">All types</option>
      ${["Low battery","Disconnected collar","No recent GPS report","Invalid GPS report","Unusual movement"].map(t=>`<option>${t}</option>`).join("")}
    </select>
  </div>`;
  html += `<div id="alertsContainer"></div>`;
  html += WT.C.modal("alertDetailModal","Alert detail","<div id='alertDetailBody'></div>");
  return html;
};

function renderAlerts(){
  const sev = document.getElementById("alertSevFilter")?.value || "";
  const type = document.getElementById("alertTypeFilter")?.value || "";
  let list = (WT.DATA.alerts||[]).slice();
  if(sev) list = list.filter(a=>a.severity===sev);
  if(type) list = list.filter(a=>a.type===type);
  const container = document.getElementById("alertsContainer");
  if(!container) return;
  if(!list.length){ container.innerHTML = WT.C.emptyState("No alerts"); return; }
  container.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Type</th><th>Animal</th><th>Severity</th><th>State</th><th>Time</th><th>Action</th></tr></thead><tbody>
    ${list.map(a=>`<tr>
      <td>${WT.U.escape(a.id)}</td>
      <td>${WT.U.escape(a.type)}</td>
      <td>${WT.U.escape(a.animalId)}</td>
      <td><span class="badge badge-${a.severity==="critical"?"critical":a.severity==="high"?"new":"ack"}">${WT.U.escape(a.severity)}</span></td>
      <td><span class="badge badge-${a.state==="New"?"new":a.state==="Acknowledged"?"ack":"resolved"}">${WT.U.escape(a.state)}</span></td>
      <td>${WT.U.timeAgo(a.time)}</td>
      <td><button class="btn btn-ghost" data-alert="${a.id}" data-open>View</button> <button class="btn btn-ghost" data-adv="${a.id}">Advance</button></td>
    </tr>`).join("")}
  </tbody></table></div>`;
  container.querySelectorAll("[data-open]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = b.dataset.alert;
      const al = WT.DATA.alerts.find(x=>x.id===id);
      const body = document.getElementById("alertDetailBody");
      if(body && al) body.innerHTML = `
        <div class="detail-row"><span>ID</span><span>${WT.U.escape(al.id)}</span></div>
        <div class="detail-row"><span>Type</span><span>${WT.U.escape(al.type)}</span></div>
        <div class="detail-row"><span>Animal</span><span>${WT.U.escape(al.animalId)} (${WT.U.escape(al.species)})</span></div>
        <div class="detail-row"><span>Severity</span><span>${WT.U.escape(al.severity)}</span></div>
        <div class="detail-row"><span>State</span><span>${WT.U.escape(al.state)}</span></div>
        <div class="detail-row"><span>Time</span><span>${WT.U.fmtTime(al.time)}</span></div>
        <div class="detail-row"><span>Reason</span><span>${WT.U.escape(al.reason)}</span></div>
        <div class="detail-row"><span>Affected collar</span><span>${WT.U.escape((WT.DATA.animals.find(x=>x.animalId===al.animalId)||{}).collarId||"Unavailable")}</span></div>
      `;
      document.getElementById("alertDetailModal").hidden = false;
    });
  });
  container.querySelectorAll("[data-adv]").forEach(b=>{
    b.addEventListener("click", ()=>{ WT.Store.advanceAlert(b.dataset.adv); renderAlerts(); });
  });
}

WT.PageInit.alerts = function(){
  renderAlerts();
  ["alertSevFilter","alertTypeFilter"].forEach(id=>{
    const e=document.getElementById(id);
    if(e){ e.addEventListener("change", renderAlerts); }
  });
  // modal close
  document.querySelectorAll("[data-close='alertDetailModal']").forEach(b=> b.addEventListener("click", ()=> document.getElementById("alertDetailModal").hidden=true));
  WT.Store.subscribe(()=>{ if(WT.Store.route==="alerts") renderAlerts(); });
};