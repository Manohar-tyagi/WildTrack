window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.animalProfile = function(params){
  const id = params && params[0];
  const a = WT.DATA.animals.find(x=>x.animalId===id);
  if(!a) return WT.C.errorState("Animal not found");
  const r = WT.latestReport(a);
  const outage = WT.Store.outage;
  let html = "";
  if(outage) html += WT.C.offlineBanner();
  html += WT.C.pageHeader(a.animalId+" — "+a.species, "Profile and report history. Demo data.");
  html += `<div class="profile-grid">
    <div class="card glass">
      <h3>Details</h3>
      <div class="detail-row"><span>Name</span><span>${WT.U.escape(a.name)}</span></div>
      <div class="detail-row"><span>Species</span><span>${WT.U.escape(a.species)}</span></div>
      <div class="detail-row"><span>Reserve</span><span>${WT.U.escape(a.reserve)}</span></div>
      <div class="detail-row"><span>Collar ID</span><span>${WT.U.escape(a.collarId)}</span></div>
      <div class="detail-row"><span>Model</span><span>${WT.U.escape(a.collarModel)}</span></div>
      <div class="detail-row"><span>Installed</span><span>${WT.U.escape(a.installedDate)}</span></div>
      <div style="margin-top:12px">${WT.C.batteryRing(r?r.batteryPercentage:0)}</div>
    </div>
    <div>
      <div class="card glass" style="margin-bottom:12px">
        <h3>Latest report</h3>
        <div class="detail-row"><span>Latitude</span><span>${r?r.lat:"Unavailable"}</span></div>
        <div class="detail-row"><span>Longitude</span><span>${r?r.lng:"Unavailable"}</span></div>
        <div class="detail-row"><span>Timestamp</span><span>${r?WT.U.fmtTime(r.timestamp):"Unavailable"}</span></div>
        <div class="detail-row"><span>Movement</span><span>${WT.C.statusBadge(WT.effectiveStatus(r))}</span></div>
        <div class="detail-row"><span>Battery</span><span>${r?r.batteryPercentage+"%":"Unavailable"}</span></div>
        <div class="detail-row"><span>Connection</span><span>${WT.C.statusBadge(WT.connectionEffective(r))}</span></div>
        <div class="detail-row"><span>Last report</span><span>${r?WT.U.timeAgo(r.timestamp):"Unavailable"}</span></div>
      </div>
      <div class="card glass" style="margin-bottom:12px">
        <h3>Mini map</h3>
        <div id="miniMap"></div>
      </div>
      <div class="card glass">
        <h3>Report history</h3>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Lat</th><th>Lng</th><th>Movement</th><th>Battery</th><th>Conn</th><th>Valid</th></tr></thead><tbody>
        ${WT.reportsFor(a.animalId).slice().reverse().map(rep=>`<tr>
          <td>${WT.U.fmtShortTime(rep.timestamp)}</td>
          <td>${rep.lat!=null?rep.lat:rep.latitude}</td><td>${rep.lng!=null?rep.lng:rep.longitude}</td>
          <td>${WT.C.statusBadge(rep.movementStatus)}</td>
          <td>${rep.batteryPercentage}%</td>
          <td>${WT.C.statusBadge(rep.connectionStatus)}</td>
          <td>${WT.validateCoords(rep.lat!=null?rep.lat:rep.latitude, rep.lng!=null?rep.lng:rep.longitude)?"✓":"✗"}</td>
        </tr>`).join("")}
        </tbody></table></div>
      </div>
    </div>
  </div>`;
  return html;
};

WT.MapInit = WT.MapInit || {};
WT.MapInit["animal"] = function(){
  // triggered by route name 'animal' -> MapInit.animal
  const el = document.getElementById("miniMap");
  if(!el || typeof L==="undefined") return;
  const id = (WT.Store.params||[])[0];
  const a = WT.DATA.animals.find(x=>x.animalId===id);
  if(!a) return;
  const r = WT.latestReport(a);
  if(!r || !WT.validateCoords(r.lat,r.lng)) return;
  if(WT._miniMap){ try{WT._miniMap.remove();}catch(e){} }
  const map = L.map(el).setView([r.lat,r.lng],12);
  WT._miniMap = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution:'&copy; OpenStreetMap'}).addTo(map);
  L.marker([r.lat,r.lng]).addTo(map).bindPopup(a.animalId);
  setTimeout(()=>map.invalidateSize(),100);
};
// register under route key used by app afterRender: WT.MapInit[routeName] where routeName = "animal"
WT.MapInit.animal = WT.MapInit["animal"];