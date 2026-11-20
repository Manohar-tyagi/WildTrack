window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.about = function(){
  return `
  <div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    ${WT.C.pageHeader("About WILD TRACK", "Team 20 project. Demo data only.")}
    <div class="card glass" style="margin-bottom:16px">
      <h2>Project</h2>
      <p>WILD TRACK – Wildlife Monitoring System. GPS/4G collars on animals → a Java application receives, validates and saves reports → a web dashboard shows location, movement status and collar battery to forest rangers.</p>
      <p class="muted small">All data shown is simulated sample reports. No real hardware, database, WebSockets, JDBC or live wildlife data.</p>
    </div>
    <div class="card glass" id="team">
      <h2>Team 20</h2>
      <div class="grid grid-4">
        ${["Alice","Bob","Carol","Dave","Eve","Frank","Grace","Heidi"].map(n=>`<div class="card glass" style="text-align:center"><div style="width:60px;height:60px;border-radius:50%;background:var(--accent);color:#14251C;margin:0 auto 8px;display:grid;place-items:center;font-weight:800">${n[0]}</div><strong>${n}</strong><p class="muted small">Team member</p></div>`).join("")}
      </div>
    </div>
    <div style="margin-top:16px">${WT.C.pageHeader("", "")}</div>
  </div>
  ${WT.Pages.footer()}
  `;
};