window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.team = function(){
  const team = WT.DATA.team || [];
  return `<div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    ${WT.C.pageHeader("Team 20", "Demo team members (edit names/roles in data/team.json).")}
    <div class="grid grid-3">${team.map(m=>`<div class="card glass" style="text-align:center">
      <div style="width:72px;height:72px;border-radius:50%;margin:0 auto 8px;background:linear-gradient(135deg,var(--accent),#3D9B68);color:#14251C;display:grid;place-items:center;font-weight:800;font-size:22px">${(m.name||"?")[0]}</div>
      <strong>${WT.U.escape(m.name)}</strong>
      <p class="muted small">${WT.U.escape(m.role)}</p>
      <p class="muted small">${WT.U.escape(m.note||"")}</p>
    </div>`).join("")}</div>
  </div>${WT.Pages.footer()}`;
};
WT.Pages.news = function(){
  const news = WT.DATA.news || [];
  return `<div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    ${WT.C.pageHeader("News", "Demo news posts.")}
    <div class="grid grid-3">${news.map(n=>`<div class="news-card">
      <img src="${n.image}" alt="${WT.U.escape(n.title)}" loading="lazy" onerror="this.style.display='none'" />
      <div class="body"><div class="date">${WT.U.escape(n.date)}</div><h3>${WT.U.escape(n.title)}</h3><p class="muted small">${WT.U.escape(n.excerpt)}</p></div>
    </div>`).join("")}</div>
  </div>${WT.Pages.footer()}`;
};
WT.Pages.events = function(){
  const events = WT.DATA.events || [];
  return `<div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    ${WT.C.pageHeader("Events", "Demo events.")}
    <div class="grid grid-3">${events.map(e=>`<div class="card glass"><h3>${WT.U.escape(e.title)}</h3><p class="muted small">${WT.U.escape(e.date)} • ${WT.U.escape(e.location)}</p></div>`).join("")}</div>
  </div>${WT.Pages.footer()}`;
};
WT.Pages.faq = function(){
  const faq = WT.DATA.faq || [];
  return `<div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    ${WT.C.pageHeader("FAQ", "Searchable accordion.")}
    <input id="faqSearch" class="search-box" placeholder="Search FAQ…" style="width:100%;max-width:400px;margin-bottom:12px" />
    <div id="faqList">${faq.map(f=>`<div class="accordion-item" data-q="${WT.U.escape(f.q).toLowerCase()}"><div class="accordion-head" onclick="this.parentElement.classList.toggle('open')">${WT.U.escape(f.q)}<span>▾</span></div><div class="accordion-body">${WT.U.escape(f.a)}</div></div>`).join("")}</div>
  </div>${WT.Pages.footer()}`;
};
WT.PageInit.faq = function(){
  const input = document.getElementById("faqSearch");
  if(input) input.addEventListener("input", ()=>{
    const q = input.value.toLowerCase();
    document.querySelectorAll("#faqList .accordion-item").forEach(it=>{
      it.style.display = it.dataset.q.includes(q) ? "" : "none";
    });
  });
};
WT.Pages.useCaseDetail = function(params){
  const slug = params && params[0];
  const uc = (WT.DATA.usecases||[]).find(u=>u.slug===slug);
  if(!uc) return WT.C.errorState("Use case not found");
  return `<div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    ${WT.C.pageHeader(uc.title, uc.location)}
    <div class="grid grid-2">
      <img src="${uc.image}" alt="${WT.U.escape(uc.title)}" loading="lazy" style="width:100%;border-radius:16px" onerror="this.style.display='none'" />
      <div class="card glass">
        <ul class="uc-meta">
          <li><span>Location</span><span>${WT.U.escape(uc.location)}</span></li>
          <li><span>Deployment date</span><span>${WT.U.escape(uc.deployedDate)}</span></li>
          <li><span>Partner</span><span>${WT.U.escape(uc.partner)}</span></li>
          <li><span>Published date</span><span>${WT.U.escape(uc.publishedDate)}</span></li>
        </ul>
        <p style="margin-top:12px">${WT.U.escape(uc.body)}</p>
        <div class="tag-dots">${(uc.tags||[]).map(t=>`<span class="tag-dot" style="background:var(--accent)" title="${WT.U.escape(t)}"></span><span class="small muted">${WT.U.escape(t)}</span>`).join(" ")}</div>
      </div>
    </div>
  </div>${WT.Pages.footer()}`;
};
// news/events already in home? ensure WT.Pages.news/events exist (done above)