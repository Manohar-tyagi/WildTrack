window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.tracking = function(){
  const outage = WT.Store.outage;
  let html = "";
  if(outage) html += WT.C.offlineBanner();
  html += WT.C.pageHeader("Live Tracking", "Map of latest demo reports. Not real-time; labels show last report time.");
  html += `<div class="track-layout">
    <div>
      <div class="row" style="margin-bottom:8px">
        <select id="spSpecies" class="search-box" style="max-width:140px"><option value="">All species</option>${WT.SPECIES.map(s=>`<option>${s}</option>`).join("")}</select>
        <input id="spId" class="search-box" style="max-width:160px" placeholder="Filter by ID" />
        <select id="spStatus" class="search-box" style="max-width:140px"><option value="">All status</option><option>MOVING</option><option>RESTING</option><option>STALE</option><option>UNKNOWN</option></select>
        <label class="sim-row" style="margin:0"><input type="checkbox" id="showPath" /> Show path</label>
      </div>
      <div id="trackMap"></div>
      <div style="margin-top:8px" class="row">
        <label class="small muted">Time range (history)</label>
        <input type="range" id="timeRange" min="1" max="100" value="100" style="flex:1" />
        <button class="btn btn-ghost" id="fallbackToggle">Table fallback</button>
      </div>
      <div id="trackFallback" style="display:none;margin-top:12px"></div>
    </div>
    <div class="detail-panel" id="detailPanel">
      <h3>Animal detail</h3>
      <p class="muted small">Click a marker to view.</p>
    </div>
  </div>`;
  return html;
};

WT.MapInit = WT.MapInit || {};
WT.MapInit.tracking = function(){
  const el = document.getElementById("trackMap");
  if(!el || typeof L==="undefined"){ renderFallback(); return; }
  // prevent double init
  if(WT._trackMap){ try{WT._trackMap.remove();}catch(e){} }
  const map = L.map(el).setView([20,78],5);
  WT._trackMap = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  const cluster = L.markerClusterGroup ? L.markerClusterGroup() : null;
  const layer = cluster || L.layerGroup();
  map.addLayer(layer);
  WT._trackLayer = layer;
  WT._trackMarkers = {};
  WT._trackPolylines = {};
  buildMarkers(map, layer);
  // filters
  ["spSpecies","spId","spStatus"].forEach(id=>{
    const e = document.getElementById(id);
    if(e) e.addEventListener("input", ()=> rebuildMarkers(map,layer));
    if(e) e.addEventListener("change", ()=> rebuildMarkers(map,layer));
  });
  const cb = document.getElementById("showPath");
  if(cb) cb.addEventListener("change", ()=> rebuildMarkers(map,layer));
  const tr = document.getElementById("timeRange");
  if(tr) tr.addEventListener("input", ()=> rebuildMarkers(map,layer));
  // fallback toggle
  const ft = document.getElementById("fallbackToggle");
  if(ft) ft.addEventListener("click", ()=>{
    const fb = document.getElementById("trackFallback");
    if(fb.style.display==="none"){ fb.style.display="block"; renderFallbackTable(fb); }
    else fb.style.display="none";
  });
  setTimeout(()=>map.invalidateSize(),100);
};

function filterAnimals(){
  const sp = document.getElementById("spSpecies")?.value || "";
  const idq = (document.getElementById("spId")?.value||"").toLowerCase();
  const st = document.getElementById("spStatus")?.value || "";
  return WT.DATA.animals.filter(a=>{
    if(sp && a.species!==sp) return false;
    if(idq && !a.animalId.toLowerCase().includes(idq)) return false;
    const r = WT.latestReport(a);
    const ms = WT.effectiveStatus(r);
    if(st && ms!==st) return false;
    return true;
  });
}

function markerColor(status){
  if(status==="MOVING") return "#3D9B68";
  if(status==="RESTING") return "#D9B65D";
  if(status==="STALE") return "#D99A36";
  return "#AAB8AD";
}

function buildMarkers(map, layer){
  layer.clearLayers();
  if(WT._trackPolys){ WT._trackPolys.forEach(p=>{try{map.removeLayer(p);}catch(e){}}); WT._trackPolys=[]; }
  WT._trackMarkers = {};
  const showPath = document.getElementById("showPath")?.checked;
  const pct = Number(document.getElementById("timeRange")?.value||100)/100;
  for(const a of filterAnimals()){
    const r = WT.latestReport(a);
    if(!r || !WT.validateCoords(r.lat,r.lng)) continue;
    const ms = WT.effectiveStatus(r);
    const color = markerColor(ms);
    // animated marker: pulse for moving
    const icon = L.divIcon({
      className:"wt-marker",
      html:`<div class="marker-dot ${ms==="MOVING"?"pulse":""}" style="background:${color}"></div>`,
      iconSize:[18,18], iconAnchor:[9,9]
    });
    const m = L.marker([r.lat,r.lng], {icon});
    m.bindPopup(`${a.animalId} • ${a.species} • ${ms}`);
    m.on("click", ()=> showDetail(a));
    layer.addLayer(m);
    WT._trackMarkers[a.animalId] = m;
    if(showPath){
      const reps = WT.reportsFor(a.animalId);
      const pts = reps.slice(0, Math.max(1, Math.ceil(reps.length*pct))).map(x=>[x.lat!=null?x.lat:x.latitude, x.lng!=null?x.lng:x.longitude]);
      const poly = L.polyline(pts, {color, weight:2, opacity:0.7, dashArray: ms==="MOVING"?null:"4,4"});
      // animate draw
      poly.addTo(map);
      // store to remove later
      if(!WT._trackPolys) WT._trackPolys=[];
      WT._trackPolys.push(poly);
    }
  }
  // remove old polys if toggled off? We'll clear on rebuild by tracking
  if(!showPath && WT._trackPolys){ WT._trackPolys.forEach(p=>map.removeLayer(p)); WT._trackPolys=[]; }
}

function rebuildMarkers(map,layer){ buildMarkers(map,layer); }

function showDetail(a){
  const r = WT.latestReport(a);
  const panel = document.getElementById("detailPanel");
  if(!panel) return;
  const ms = WT.effectiveStatus(r);
  const cs = WT.connectionEffective(r);
  panel.innerHTML = `
    <h3>${WT.U.escape(a.animalId)} — ${WT.U.escape(a.species)}</h3>
    <div class="detail-row"><span>Name</span><span>${WT.U.escape(a.name)}</span></div>
    <div class="detail-row"><span>Reserve</span><span>${WT.U.escape(a.reserve)}</span></div>
    <div class="detail-row"><span>Collar</span><span>${WT.U.escape(a.collarId)}</span></div>
    <div class="detail-row"><span>Latitude</span><span>${r?r.lat:"Unavailable"}</span></div>
    <div class="detail-row"><span>Longitude</span><span>${r?r.lng:"Unavailable"}</span></div>
    <div class="detail-row"><span>Timestamp</span><span>${r?WT.U.fmtTime(r.timestamp):"Unavailable"}</span></div>
    <div class="detail-row"><span>Movement</span><span>${WT.C.statusBadge(ms)}</span></div>
    <div class="detail-row"><span>Battery</span><span>${r?r.batteryPercentage+"%":"Unavailable"}</span></div>
    <div class="detail-row"><span>Connection</span><span>${WT.C.statusBadge(cs)}</span></div>
    <div class="detail-row"><span>Last report</span><span>${r?WT.U.timeAgo(r.timestamp):"Unavailable"} (never call old/simulated data live)</span></div>
    <div style="margin-top:10px">${WT.C.batteryRing(r?r.batteryPercentage:0)}</div>
  `;
}

function renderFallback(){
  const fb = document.getElementById("trackFallback");
  if(fb){ fb.style.display="block"; renderFallbackTable(fb); }
}
function renderFallbackTable(container){
  const rows = filterAnimals().map(a=>{
    const r=WT.latestReport(a);
    return `<tr>
      <td>${WT.U.escape(a.animalId)}</td><td>${WT.U.escape(a.species)}</td>
      <td>${r?r.lat:"Unavailable"}</td><td>${r?r.lng:"Unavailable"}</td>
      <td>${r?WT.U.fmtShortTime(r.timestamp):"Unavailable"}</td>
      <td>${WT.C.statusBadge(WT.effectiveStatus(r))}</td>
      <td>${r?r.batteryPercentage+"%":"Unavailable"}</td>
    </tr>`;
  }).join("");
  container.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Species</th><th>Lat</th><th>Lng</th><th>Time</th><th>Status</th><th>Battery</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// inject marker css
const style = document.createElement("style");
style.textContent = `.marker-dot{width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(0,0,0,.5)} .marker-dot.pulse{animation:pulse 1.4s infinite} @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(61,155,104,.6)}70%{box-shadow:0 0 0 12px rgba(61,155,104,0)}100%{box-shadow:0 0 0 0 rgba(61,155,104,0)}}`;
document.head.appendChild(style);

// refresh markers on store emit (live updates)
WT.Store.subscribe(()=>{
  if(WT.Store.route==="tracking" && WT._trackMap){
    // clear polys
    if(WT._trackPolys){ WT._trackPolys.forEach(p=>WT._trackMap.removeLayer(p)); WT._trackPolys=[]; }
    buildMarkers(WT._trackMap, WT._trackLayer);
  }
});