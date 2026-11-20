window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.animals = function(){
  const outage = WT.Store.outage;
  let html = "";
  if(outage) html += WT.C.offlineBanner();
  html += WT.C.pageHeader("Animals", "Searchable, sortable, filterable directory. Demo data.");
  html += `<div class="row" style="margin-bottom:12px">
    <input id="animalSearch" class="search-box" placeholder="Search by ID, name, species…" />
    <select id="animalSpeciesFilter" class="search-box" style="max-width:160px"><option value="">All species</option>${WT.SPECIES.map(s=>`<option>${s}</option>`).join("")}</select>
    <select id="animalStatusFilter" class="search-box" style="max-width:160px"><option value="">All status</option><option>MOVING</option><option>RESTING</option><option>STALE</option><option>UNKNOWN</option></select>
    <button class="btn btn-ghost" id="viewToggle">Grid/Table</button>
  </div>`;
  html += `<div id="animalsContainer"></div>`;
  return html;
};

WT.PageInit.animals = function(){
  let view = "grid";
  function render(){
    const q = (document.getElementById("animalSearch").value||"").toLowerCase();
    const sp = document.getElementById("animalSpeciesFilter").value;
    const st = document.getElementById("animalStatusFilter").value;
    const sortKey = WT._animalSort || "animalId";
    let list = WT.DATA.animals.filter(a=>{
      if(sp && a.species!==sp) return false;
      const r = WT.latestReport(a);
      if(st && WT.effectiveStatus(r)!==st) return false;
      if(q && !(a.animalId.toLowerCase().includes(q)||a.name.toLowerCase().includes(q)||a.species.toLowerCase().includes(q))) return false;
      return true;
    });
    list.sort((a,b)=> String(a[sortKey]||"").localeCompare(String(b[sortKey]||"")));
    const container = document.getElementById("animalsContainer");
    if(!container) return;
    if(!list.length){ container.innerHTML = WT.C.emptyState("No animals match"); return; }
    if(view==="grid"){
      container.innerHTML = `<div class="grid grid-3">${list.map(a=>{
        const r = WT.latestReport(a);
        const photo = a.photo || "";
        return `<div class="card glass animal-card" data-id="${a.animalId}" style="cursor:pointer">
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px">
            <div class="img-wrap round" style="width:48px;height:48px;flex-shrink:0">
              <img src="${WT.U.escape(photo)}" alt="${WT.U.escape(a.species)}" loading="lazy" onerror="this.outerHTML='<div class=img-placeholder style=width:48px;height:48px;border-radius:50%>🐾</div>'" />
            </div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <h3 style="margin:0">${WT.U.escape(a.animalId)}</h3>
                ${WT.C.statusBadge(WT.effectiveStatus(r))}
              </div>
              <p class="muted small" style="margin:0">${WT.U.escape(a.name||"")} • ${WT.U.escape(a.species)}</p>
            </div>
          </div>
          <p class="small">${WT.U.escape(a.reserve)}</p>
          <div class="row" style="justify-content:space-between">
            <span class="small">🔋 ${r?r.batteryPercentage+"%":"Unavailable"}</span>
            <span class="small muted">${r?WT.U.timeAgo(r.timestamp):"Unavailable"}</span>
          </div>
        </div>`;
      }).join("")}</div>`;
    } else {
      container.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr>
        <th data-sort="animalId">ID</th><th data-sort="species">Species</th><th>Name</th><th>Status</th><th>Battery</th><th>Last report</th>
      </tr></thead><tbody>${list.map(a=>{
        const r=WT.latestReport(a);
        return `<tr data-id="${a.animalId}" style="cursor:pointer">
          <td>${WT.U.escape(a.animalId)}</td><td>${WT.U.escape(a.species)}</td><td>${WT.U.escape(a.name)}</td>
          <td>${WT.C.statusBadge(WT.effectiveStatus(r))}</td>
          <td>${r?r.batteryPercentage+"%":"Unavailable"}</td>
          <td>${r?WT.U.timeAgo(r.timestamp):"Unavailable"}</td>
        </tr>`;
      }).join("")}</tbody></table></div>`;
    }
    // click handlers
    container.querySelectorAll("[data-id]").forEach(el=>{
      el.addEventListener("click", ()=> location.hash = "#/animal/"+el.dataset.id);
    });
    // sort headers
    container.querySelectorAll("th[data-sort]").forEach(th=>{
      th.addEventListener("click", ()=>{ WT._animalSort = th.dataset.sort; render(); });
    });
  }
  render();
  ["animalSearch","animalSpeciesFilter","animalStatusFilter"].forEach(id=>{
    const e=document.getElementById(id);
    if(e){ e.addEventListener("input", render); e.addEventListener("change", render); }
  });
  document.getElementById("viewToggle").addEventListener("click", ()=>{ view = view==="grid"?"table":"grid"; render(); });
  // live update
  WT.Store.subscribe(()=>{ if(WT.Store.route==="animals") render(); });
};