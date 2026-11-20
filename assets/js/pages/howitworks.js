window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.howItWorks = function(){
  return `
  <div style="max-width:var(--maxw);margin:0 auto;padding:0 24px">
    ${WT.C.pageHeader("How it works / Technology", "Architecture story and Java OOP concepts. Demo/simulated data.")}
    
    <h2 class="reveal">Data flow (animated timeline)</h2>
    <div class="timeline" id="timeline">
      <div class="tl-step reveal"><div class="tl-dot"></div><div class="card glass"><h3>1. Collar reads GPS, 4G modem sends it</h3><p class="muted small">The collar acquires a GPS fix; the 4G modem transmits lat, lng, timestamp to the receiver. (Described; no real hardware in this demo.)</p><svg viewBox="0 0 200 60" style="width:100%;height:60px"><path d="M10,30 Q60,10 110,30 T190,30" stroke="#D9B65D" stroke-width="2" fill="none" class="route-line"/></svg></div></div>
      <div class="tl-step reveal"><div class="tl-dot"></div><div class="card glass"><h3>2. Java program receives, checks and saves it</h3><p class="muted small">A Java application receives the report, validates coordinates (−90..90, −180..180), classifies movement (MOVING/RESTING using thresholds), and saves it. (Described; no JDBC/database in this demo.)</p></div></div>
      <div class="tl-step reveal"><div class="tl-dot"></div><div class="card glass"><h3>3. Dashboard shows location, status and battery</h3><p class="muted small">The web dashboard reads reports and displays location, movement status, and collar battery to rangers. (This site uses simulated sample data.)</p></div></div>
    </div>

    <h2 class="reveal" style="margin-top:32px">Java OOP — interactive class diagram</h2>
    <p class="muted small reveal">Click a card to flip and see details.</p>
    <div class="grid grid-3" style="margin-top:12px">
      ${classCard("Animal (abstract)","abstract","Fields: animalId, species. Methods: move(), report(). Abstract base class.","Inheritance: Tiger/Elephant extend Animal; overriding move(); polymorphism via Animal reference.")}
      ${classCard("Tiger","concrete","Extends Animal. Overrides move() and report().","Polymorphism: treated as Animal at runtime.")}
      ${classCard("Elephant","concrete","Extends Animal. Overrides move() and report().","Polymorphism: treated as Animal at runtime.")}
      ${classCard("Collar","concrete","Fields: collarId, battery, connectionStatus. Methods: readGPS(), send().","Encapsulation: private fields with getters/setters.")}
      ${classCard("LocationReport","data","Fields: animalId, lat, lng, timestamp, status, battery.","Validation: lat/lng range checks.")}
      ${classCard("MovementAnalyzer","util","Classifies MOVING vs RESTING using thresholds 0.05/0.20 (unvalidated).","Static utility methods.")}
      ${classCard("AnimalRepository","repo","Stores and retrieves Animal/Report records.","In-memory in this demo; no database.")}
    </div>

    <h2 class="reveal" style="margin-top:32px">OOP concepts (accordion)</h2>
    <div id="oopAccordion">
      ${accordion("Encapsulation","Bundling data and methods; private fields accessed via getters/setters.")}
      ${accordion("Constructors","Special methods to initialize objects when created.")}
      ${accordion("Inheritance","Tiger and Elephant inherit from abstract Animal.")}
      ${accordion("Overriding","Subclasses redefine move()/report() behaviour.")}
      ${accordion("Polymorphism","Animal reference can point to Tiger or Elephant; correct method runs at runtime.")}
      ${accordion("Abstraction","Animal is abstract; cannot be instantiated directly; defines contract.")}
    </div>

    <h2 class="reveal" style="margin-top:32px">Proposed API endpoints</h2>
    <div class="card glass">
      <p class="muted small">Labelled "proposed endpoints" — not implemented in this demo.</p>
      <ul>
        <li><code>GET /api/animals</code> — list animals</li>
        <li><code>GET /api/animals/{id}</code> — animal detail</li>
        <li><code>GET /api/reports</code> — list reports</li>
        <li><code>GET /api/collars</code> — collar health</li>
        <li><code>GET /api/alerts</code> — alerts</li>
      </ul>
    </div>

    <h2 class="reveal" style="margin-top:32px">Movement thresholds (unvalidated)</h2>
    <p class="muted small">Thresholds 0.05 / 0.20 are unvalidated estimates. See Settings.</p>
  </div>
  ${WT.Pages.footer()}
  `;
};

function classCard(name,type,front,back){
  return `<div class="class-card" onclick="this.classList.toggle('flipped')">
    <div class="class-inner">
      <div class="class-front">
        <h3>${name}</h3>
        <p class="muted small">${type}</p>
        <p class="small">${front}</p>
        <p class="muted small">Click to flip</p>
      </div>
      <div class="class-back">
        <h3>${name}</h3>
        <p class="small">${back}</p>
      </div>
    </div>
  </div>`;
}
function accordion(title,body){
  return `<div class="accordion-item">
    <div class="accordion-head" onclick="this.parentElement.classList.toggle('open')">${title}<span>▾</span></div>
    <div class="accordion-body">${body}</div>
  </div>`;
}

WT.PageInit["how-it-works"] = function(){
  WT.U.initReveal();
};