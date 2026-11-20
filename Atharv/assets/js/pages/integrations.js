window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.integrations = function(){
  const integrations = [
    {name:"GPS module", cat:"Hardware", letter:"G"},
    {name:"4G modem", cat:"Hardware", letter:"4"},
    {name:"Battery pack", cat:"Hardware", letter:"B"},
    {name:"Java receiver", cat:"Software", letter:"J"},
    {name:"REST API", cat:"API", letter:"R"},
    {name:"Camera trap", cat:"Hardware", letter:"C"},
    {name:"Vehicle tracker", cat:"Hardware", letter:"V"},
    {name:"Aircraft tracker", cat:"Hardware", letter:"A"},
    {name:"Personnel tracker", cat:"Hardware", letter:"P"},
    {name:"IoT gateway", cat:"Software", letter:"I"},
    {name:"Radio link", cat:"Hardware", letter:"R"},
    {name:"Satellite uplink", cat:"Hardware", letter:"S"},
  ];
  const letters = [...new Set(integrations.map(i=>i.letter.toUpperCase()))].sort();
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let html = `
  <section class="int-hero">
    <div style="position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1600&q=60') center/cover;opacity:0.35"></div>
    <div class="hero-overlay"></div>
    <div style="position:relative;z-index:2;max-width:var(--maxw);margin:0 auto;padding:40px 24px;width:100%">
      <h1 class="headline reveal">Integrations</h1>
      <p class="reveal" style="color:var(--muted);max-width:520px">Hardware and software that connect to WILD TRACK. Demo content.</p>
      <div style="margin:16px 0"><input id="intSearch" class="search-box" placeholder="Search integrations…" style="max-width:400px" /></div>
      <div class="int-float-card">
        <strong>Tiger T-001</strong><br>
        <span class="muted small">Panthera tigris</span><br>
        <span class="badge badge-new">Healthy</span><br>
        <span class="small">23 mins ago</span><br>
        <span class="small muted">11.66, 76.62</span><br>
        <span class="small muted">Reported by: Collar</span>
      </div>
    </div>
  </section>

  <div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    <div class="tabs" id="intTabs">
      ${["150+ Integrations","How it works","Request","API"].map((t,i)=>`<button class="tab ${i===0?'active':''}" data-tab="${i}">${t}</button>`).join("")}
    </div>
    <div id="intTabContent">
      <div class="int-panel" data-panel="0">
        <div class="row" style="margin-bottom:12px">
          <select id="intCatFilter" class="search-box" style="max-width:180px"><option value="">All categories</option><option>Hardware</option><option>Software</option><option>API</option></select>
        </div>
        <div class="letter-index" id="letterIndex">
          ${allLetters.map(l=>`<button class="letter-btn ${letters.includes(l)?'':'disabled'}" data-letter="${l}" ${letters.includes(l)?'':'disabled'}>${l}</button>`).join("")}
        </div>
        <div class="grid grid-3" id="intGrid">
          ${integrations.map(i=>`<div class="int-card" data-name="${i.name}" data-cat="${i.cat}" data-letter="${i.letter}"><h3>${i.name}</h3><p class="muted small">${i.cat}</p></div>`).join("")}
        </div>
      </div>
      <div class="int-panel" data-panel="1" style="display:none"><div class="card glass"><h3>How it works</h3><p class="muted">Collar → Java receiver → Dashboard. See How it works page.</p></div></div>
      <div class="int-panel" data-panel="2" style="display:none"><div class="card glass"><h3>Request an integration</h3><p class="muted">Form (demo). <input class="search-box" placeholder="Integration name" /></p></div></div>
      <div class="int-panel" data-panel="3" style="display:none"><div class="card glass"><h3>API</h3><p class="muted">Proposed endpoints: GET /api/animals, /api/animals/{id}, /api/reports, /api/collars, /api/alerts.</p></div></div>
    </div>
  </div>

  <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px 24px">
    <h2 class="reveal">Get connected</h2>
    <div class="action-cards">
      ${["Request an integration","Build on the API","Use a custom webhook","Talk to the team"].map(t=>`<div class="int-card reveal"><h3>${t}</h3><p class="muted small">Demo action card.</p><button class="btn btn-outline" style="margin-top:8px">Start</button></div>`).join("")}
    </div>
  </div>
  <div style="background:linear-gradient(135deg,#3D9B68,#1F4A33);padding:40px 24px;text-align:center;margin-top:24px">
    <h2 style="color:#fff">Ready to connect?</h2>
    <a class="btn btn-primary" href="#/contact">Contact us</a>
  </div>
  ${WT.Pages.footer()}
  `;
  // store integrations data globally for filtering
  WT._integrations = integrations;
  return html;
};

WT.PageInit.integrations = function(){
  const search = document.getElementById("intSearch");
  const cat = document.getElementById("intCatFilter");
  let activeLetter = null;
  function filter(){
    const q = (search?.value||"").toLowerCase();
    const c = cat?.value || "";
    document.querySelectorAll("#intGrid .int-card").forEach(card=>{
      const name = card.dataset.name.toLowerCase();
      const cl = card.dataset.cat;
      const letter = card.dataset.letter.toUpperCase();
      let show = name.includes(q);
      if(c && cl!==c) show=false;
      if(activeLetter && letter!==activeLetter) show=false;
      card.style.display = show?"":"none";
    });
  }
  if(search) search.addEventListener("input", filter);
  if(cat) cat.addEventListener("change", filter);
  document.querySelectorAll("#letterIndex .letter-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(btn.disabled) return;
      const l = btn.dataset.letter;
      if(activeLetter===l){ activeLetter=null; btn.classList.remove("active"); }
      else {
        document.querySelectorAll("#letterIndex .letter-btn").forEach(b=>b.classList.remove("active"));
        activeLetter=l; btn.classList.add("active");
      }
      filter();
    });
  });
  // tabs
  document.querySelectorAll("#intTabs .tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll("#intTabs .tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const i = Number(btn.dataset.tab);
      document.querySelectorAll("#intTabContent .int-panel").forEach(p=>{ p.style.display = (Number(p.dataset.panel)===i)?"":"none"; });
    });
  });
};