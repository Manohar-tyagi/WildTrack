window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.useCases = function(){
  const featured = {
    title:"Tiger corridor monitoring",
    loc:"Bandipur National Park",
    date:"Deployed Sep 2025",
    partner:"Forest Department",
    published:"Nov 2026",
    img:"https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=900&q=70"
  };
  const ucData = (WT.DATA.usecases && WT.DATA.usecases.length) ? WT.DATA.usecases : null;
  const cards = ucData ? ucData.map((u,i)=>({title:u.title, loc:u.location, tag:(u.tags||[])[0]||"Ecological Management", img:u.image, color:["#3D9B68","#D9B65D","#C65B52","#3D9B68","#D99A36","#D9B65D"][i%6], slug:u.slug})) : [
    {title:"Elephant herd tracking", loc:"Nagarhole", tag:"Ecological Management", img:"https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=70", color:"#3D9B68", slug:"use-case-1"},
    {title:"Leopard movement study", loc:"Ranthambore", tag:"Research", img:"https://images.unsplash.com/photo-1456926631375-92c8ce872dc4?auto=format&fit=crop&w=600&q=70", color:"#D9B65D", slug:"use-case-2"},
    {title:"Rhino anti-poaching", loc:"Kaziranga", tag:"Security", img:"https://images.unsplash.com/photo-1557800636-894a64bc81df?auto=format&fit=crop&w=600&q=70", color:"#C65B52", slug:"use-case-3"},
    {title:"Deer habitat use", loc:"Corbett", tag:"Ecological Management", img:"https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=600&q=70", color:"#3D9B68", slug:"use-case-4"},
    {title:"Ranger safety", loc:"Bandipur", tag:"Personnel", img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=70", color:"#D99A36", slug:"use-case-5"},
    {title:"Conflict mitigation", loc:"Nagarhole", tag:"Human-wildlife conflict", img:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=70", color:"#D9B65D", slug:"use-case-6"},
  ];
  let html = `
  <div class="uc-header"><div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
    <h1 style="font-size:40px;font-weight:800;margin:0">Use cases</h1>
    <p style="color:var(--muted)">Field deployments and conservation stories (demo content).</p>
  </div></div>
  <div class="uc-featured">
    <div>
      <img src="${featured.img}" alt="featured" style="width:100%;border-radius:16px" onerror="this.style.display='none'" />
    </div>
    <div>
      <h2>${featured.title}</h2>
      <ul class="uc-meta">
        <li><span>Location</span><span>${featured.loc}</span></li>
        <li><span>Deployment date</span><span>${featured.date}</span></li>
        <li><span>Partner</span><span>${featured.partner}</span></li>
        <li><span>Published date</span><span>${featured.published}</span></li>
      </ul>
      <p class="muted" style="margin-top:12px">Demo use case for the WILD TRACK project.</p>
    </div>
  </div>
  <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
    <div class="row" style="margin-bottom:12px">
      <input id="ucSearch" class="search-box" placeholder="Search use cases…" />
      <div class="filter-chips" id="ucChips">
        ${["All","Ecological Management","Security","Research","Personnel"].map((t,i)=>`<button class="filter-chip ${i===0?'active':''}" data-chip="${t}">${t}</button>`).join("")}
      </div>
    </div>
    <div class="grid grid-3" id="ucGrid">
      ${cards.map(c=>ucCard(c)).join("")}
    </div>
  </div>
  ${WT.Pages.footer()}
  `;
  return html;
};

function ucCard(c){
  return `<a class="uc-card" data-tag="${c.tag}" data-title="${c.title}" href="#/use-cases/${c.slug||'use-case-1'}" style="text-decoration:none;color:inherit">
    <img src="${c.img}" alt="${c.title}" loading="lazy" onerror="this.outerHTML='<div class=img-placeholder style=height:180px>Image unavailable</div>'" />
    <div class="body">
      <h3>${c.title}</h3>
      <div class="loc">${c.loc}</div>
      <div class="tag-dots"><span class="tag-dot" style="background:${c.color}" title="${c.tag}"></span><span class="small muted">${c.tag}</span></div>
    </div>
  </a>`;
}

WT.PageInit["use-cases"] = function(){
  const chips = document.querySelectorAll("#ucChips .filter-chip");
  chips.forEach(ch=>{
    ch.addEventListener("click", ()=>{
      chips.forEach(c=>c.classList.remove("active"));
      ch.classList.add("active");
      const tag = ch.dataset.chip;
      document.querySelectorAll("#ucGrid .uc-card").forEach(card=>{
        const show = tag==="All" || card.dataset.tag===tag;
        card.style.display = show?"":"none";
      });
    });
  });
  const search = document.getElementById("ucSearch");
  if(search) search.addEventListener("input", ()=>{
    const q = search.value.toLowerCase();
    document.querySelectorAll("#ucGrid .uc-card").forEach(card=>{
      card.style.display = card.dataset.title.toLowerCase().includes(q)?"":"none";
    });
  });
};