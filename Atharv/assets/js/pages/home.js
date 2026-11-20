window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.MapInit = WT.MapInit || {};
WT.ChartInit = WT.ChartInit || {};

WT.Pages.home = function(){
  const stats = WT.Store.kpis();
  const img = (q) => `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=800&q=70`;
  return `
  <!-- Hero -->
  <section class="hero" id="hero">
    <div class="hero-bg" style="background-image:url('https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1600&q=70')"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div>
        <h1 class="reveal">Every Movement Matters. Every Life Counts.</h1>
        <p class="reveal">WILD TRACK turns GPS/4G collar reports into clear, actionable insight for forest rangers — location, movement status, and collar battery in one view. Demo data shown.</p>
        <a class="btn btn-primary magnetic reveal" href="#/dashboard">Get started</a>
      </div>
      <div class="hero-card drift reveal" id="heroCard">
        <h3>Report</h3>
        <div class="form-row">
          <div class="form-field"><label>Reporter</label><input value="Ranger #12" /></div>
          <div class="form-field"><label>Priority</label><select><option>High</option><option>Medium</option><option>Low</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-field"><label>Location</label><input value="11.66, 76.62" /></div>
          <div class="form-field"><label>Date</label><input type="date" value="2026-11-20" /></div>
        </div>
        <div class="form-row">
          <div class="form-field"><label>Species</label><select><option>Tiger</option><option>Elephant</option></select></div>
          <div class="form-field"><label>Count</label><input type="number" value="1" /></div>
        </div>
        <div class="topo-thumb"></div>
      </div>
    </div>
  </section>

  <!-- Stats band -->
  <section class="stats-band">
    <div class="stats-inner">
      <div><div class="stat-num" data-count="90">0</div><div class="stat-cap">Countries supported (reference)</div></div>
      <div><div class="stat-num" data-count="${stats.total}">0</div><div class="stat-cap">Animals tracked (demo)</div></div>
      <div><div class="stat-num" data-count="${stats.connected}">0</div><div class="stat-cap">Collars connected (demo)</div></div>
      <div><div class="stat-num" data-count="${WT.DATA.alerts.length}">0</div><div class="stat-cap">Active alerts (demo)</div></div>
    </div>
  </section>

  <!-- Make a difference -->
  <section class="section">
    <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
      <h2 class="reveal">Helping to make a difference, worldwide</h2>
      <div class="grid grid-5" style="margin-top:16px">
        ${["Wildlife monitoring","Human-wildlife conflict mitigation","Personnel safety","Habitat protection","Protected area management"].map((t,i)=>`
          <div class="img-card reveal">
            <img src="https://images.unsplash.com/photo-${['1549366021-9f761d450615','1564349683136-77e08dba1ef7','1500530855697-b586d89ba3ee','1441974231531-c6227db76b6e','1518709268805-4e9042af9f23'][i]}?auto=format&fit=crop&w=600&q=70" alt="${t}" onerror="this.style.display='none'" />
            <div class="overlay"></div>
            <div class="label">${t}</div>
          </div>`).join("")}
      </div>
    </div>
  </section>

  <!-- Latest release split cream -->
  <section style="padding:0 24px">
    <div class="split cream reveal">
      <div>
        <div style="height:260px;border-radius:16px;background:linear-gradient(135deg,#3D9B68,#14251C);position:relative;overflow:hidden">
          <svg viewBox="0 0 400 260" style="width:100%;height:100%"><g stroke="rgba(217,182,93,0.4)" fill="none">
            ${Array.from({length:18}).map((_,i)=>`<circle cx="${Math.random()*400}" cy="${Math.random()*260}" r="${4+Math.random()*12}" />`).join("")}
          </g></svg>
        </div>
      </div>
      <div>
        <h2>Latest Release</h2>
        <p class="muted">WILD TRACK dashboard now shows movement status and collar battery alongside live location. Built for rangers; demo data only.</p>
        <a class="btn btn-primary" href="#/dashboard">Explore dashboard</a>
      </div>
    </div>
  </section>

  <!-- Integrations dark -->
  <section class="section" style="background:var(--surface)">
    <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
      <h2 class="reveal">Bring your technology together</h2>
      <p class="muted reveal">Integrations</p>
      <div class="icon-grid" style="margin-top:16px">
        ${["Animal collars","Remote imagery","Vehicle trackers","IoT systems","Radios","Camera traps","Aircraft trackers","Personnel trackers"].map((t,i)=>`
          <div class="icon-tile reveal"><div class="ic">${["🐾","🛰️","🚗","📡","📻","📷","✈️","🧍"][i]}</div><div>${t}</div></div>`).join("")}
      </div>
      <div style="margin-top:16px"><a class="btn btn-outline" href="#/integrations">Learn more</a></div>
    </div>
  </section>

  <!-- Tabs feature -->
  <section class="section">
    <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
      <h2 class="reveal">With you every step of the way</h2>
      <div class="tabs" id="homeTabs">
        ${["Connect your data","Collect field observations","Decide in real-time","Analyze data"].map((t,i)=>`<button class="tab ${i===0?'active':''}" data-tab="${i}">${t}</button>`).join("")}
      </div>
      <div id="homeTabContent" class="feature-cards">
        ${renderHomeTab(0)}
      </div>
    </div>
  </section>

  <!-- World map -->
  <section class="section" style="background:var(--surface)">
    <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
      <h2 class="reveal">Advancing conservation in 90+ countries (reference)</h2>
      <div class="worldmap-wrap" id="worldmap">
        ${clusters().map(c=>`<div class="cluster" style="left:${c.x}%;top:${c.y}%;transform:translate(-50%,-50%)" data-cluster="${c.n}">${c.n}</div>`).join("")}
      </div>
    </div>
  </section>

  <!-- News -->
  <section class="section" id="news">
    <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
      <h2 class="reveal">News</h2>
      <div class="grid grid-3">
        ${[1,2,3].map(i=>`
          <div class="news-card reveal">
            <img src="https://images.unsplash.com/photo-${['1549366021-9f761d450615','1564349683136-77e08dba1ef7','1441974231531-c6227db76b6e'][i-1]}?auto=format&fit=crop&w=600&q=70" alt="news" onerror="this.style.display='none'" />
            <div class="body">
              <div class="date">Nov ${10+i}, 2026</div>
              <h3>Collar alert workflow update ${i}</h3>
              <p class="muted small">Demo news item for the WILD TRACK project.</p>
            </div>
          </div>`).join("")}
      </div>
    </div>
  </section>

  <!-- Testimonial -->
  <section class="testimonial">
    <blockquote>“With WILD TRACK, every movement matters and every life counts — rangers see location, status and battery at a glance.”</blockquote>
    <p class="muted" style="margin-top:16px">— Team 20, WILD TRACK project</p>
  </section>

  <!-- Events -->
  <section class="section" id="events">
    <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
      <h2 class="reveal">Upcoming events</h2>
      <div class="grid grid-3">
        ${["Webinar: Collar alerts to ranger action","Field demo day","Conservation tech meetup"].map((t,i)=>`
          <div class="card glass reveal"><h3>${t}</h3><p class="muted small">Dec ${5+i}, 2026 • Online</p></div>`).join("")}
      </div>
    </div>
  </section>

  ${footer()}
  `;
};

function renderHomeTab(i){
  const tabs = [
    `<div class="card glass"><h3>Monitor live movements</h3><p class="muted small">Map paths animate across reserves.</p><div style="height:140px;border-radius:12px;background:linear-gradient(135deg,#1a3326,#0f1f17);margin-top:8px;position:relative;overflow:hidden"><svg viewBox="0 0 300 140" style="width:100%;height:100%"><path d="M10,120 Q60,80 120,90 T240,60 T290,40" stroke="#D9B65D" stroke-width="2" fill="none" class="route-line"/></svg></div></div>
     <div class="card glass"><h3>Instant alerts</h3><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"><div style="background:var(--surface2);padding:8px;border-radius:8px;font-size:12px">📱 SMS: Tiger T-001 low battery</div><div style="background:var(--surface2);padding:8px;border-radius:8px;font-size:12px">💬 WhatsApp: Collar disconnected</div><div style="background:var(--surface2);padding:8px;border-radius:8px;font-size:12px">✉ Email: Daily summary</div></div></div>
     <div class="card glass"><h3>Stay in touch, stay safe</h3><p class="muted small">Chat bubble over satellite map.</p><div style="height:140px;border-radius:12px;background:linear-gradient(135deg,#0f1f17,#1a3326);position:relative"><div style="position:absolute;bottom:10px;right:10px;background:var(--accent);color:#14251C;padding:6px 10px;border-radius:10px;font-size:12px">💬 Ranger: On my way</div></div></div>`,
    `<div class="card glass"><h3>Collect field observations</h3><p class="muted small">Rangers submit sightings with location and species.</p></div>`,
    `<div class="card glass"><h3>Decide in real-time</h3><p class="muted small">Alerts surface low battery, disconnects, stale reports.</p></div>`,
    `<div class="card glass"><h3>Analyze data</h3><p class="muted small">Movement distribution, reports per animal, battery trends.</p></div>`
  ];
  return tabs[i] || tabs[0];
}

function clusters(){
  const pts = [
    {x:15,y:30,n:12},{x:30,y:45,n:8},{x:55,y:25,n:20},{x:70,y:40,n:15},
    {x:45,y:60,n:6},{x:25,y:70,n:9},{x:80,y:55,n:11},{x:60,y:75,n:7}
  ];
  return pts;
}

function footer(){
  return `<footer class="footer">
    <div class="footer-grid">
      <div><h4>WILD TRACK</h4><p class="muted small">Wildlife monitoring demo. Team 20.</p><div class="socials"><a href="#">f</a><a href="#">x</a><a href="#">in</a></div></div>
      <div><h4>Product</h4><a href="#/dashboard">Dashboard</a><a href="#/tracking">Live Tracking</a><a href="#/analytics">Analytics</a></div>
      <div><h4>Resources</h4><a href="#/help">Help center</a><a href="#/help#training">Virtual training</a><a href="#/help#forum">Community forum</a><a href="#/help#faq">FAQs</a></div>
      <div><h4>Company</h4><a href="#/about">About</a><a href="#/contact">Contact us</a><a href="#/use-cases">Use cases</a></div>
    </div>
    <div class="footer-watermark">WT</div>
  </footer>`;
}
WT.Pages.footer = footer;

WT.PageInit.home = function(){
  // tabs
  document.querySelectorAll("#homeTabs .tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll("#homeTabs .tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("homeTabContent").innerHTML = renderHomeTab(Number(btn.dataset.tab));
      WT.U.initReveal();
    });
  });
  // cluster click expand
  document.querySelectorAll(".cluster").forEach(c=>{
    c.addEventListener("click", ()=> c.classList.toggle("expanded"));
  });
  // hero parallax + 3d tilt
  if(!WT.U.reducedMotion()){
    const hero = document.getElementById("hero");
    const bg = hero && hero.querySelector(".hero-bg");
    const card = document.getElementById("heroCard");
    window.addEventListener("mousemove", (e)=>{
      if(!hero) return;
      const rect = hero.getBoundingClientRect();
      if(e.clientY < rect.top || e.clientY > rect.bottom) return;
      const x = (e.clientX - rect.left)/rect.width - 0.5;
      const y = (e.clientY - rect.top)/rect.height - 0.5;
      if(bg) bg.style.transform = `scale(1.05) translate(${x*20}px,${y*20}px)`;
      if(card) card.style.transform = `perspective(1000px) rotateY(${x*12}deg) rotateX(${-y*12}deg)`;
    });
    // animate stats count-up (already via component? manual)
    document.querySelectorAll(".stat-num[data-count]").forEach(el=> WT.U.animateCount(el, Number(el.dataset.count)));
  }
};