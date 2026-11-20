window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.help = function(){
  return `
  <div style="max-width:var(--maxw);margin:0 auto;padding:24px">
    ${WT.C.pageHeader("Help & Settings", "Demo settings. Changes apply in-memory.")}
    <div class="grid grid-2">
      <div class="card glass">
        <h3>Settings</h3>
        <div class="detail-row"><span>Stale timeout (min)</span><input id="setStale" type="number" value="${WT.CONFIG.staleTimeoutMinutes}" class="search-box" style="max-width:100px" /></div>
        <div class="detail-row"><span>Low battery threshold (%)</span><input id="setBatt" type="number" value="${WT.CONFIG.lowBatteryThreshold}" class="search-box" style="max-width:100px" /> <span class="muted small">demo value</span></div>
        <div class="detail-row"><span>Move threshold small</span><span class="muted small">${WT.CONFIG.moveThresholdSmall} (unvalidated estimate)</span></div>
        <div class="detail-row"><span>Move threshold large</span><span class="muted small">${WT.CONFIG.moveThresholdLarge} (unvalidated estimate)</span></div>
        <button class="btn btn-primary" id="saveSettings" style="margin-top:12px">Save</button>
      </div>
      <div class="card glass">
        <h3>Help center</h3>
        <p class="muted small">Virtual training, community forum, FAQs.</p>
        <div id="faq">
          ${[["How does WILD TRACK work?","Collar → Java receiver → Dashboard (demo)."],
            ["Is data real?","No, all simulated sample reports."],
            ["What is STALE?","Report older than stale timeout."],
            ["Battery threshold?","Configurable; default is a demo value."]].map(([q,a])=>`<div class="accordion-item"><div class="accordion-head" onclick="this.parentElement.classList.toggle('open')">${q}<span>▾</span></div><div class="accordion-body">${a}</div></div>`).join("")}
        </div>
      </div>
    </div>
    <div class="card glass" style="margin-top:16px" id="training">
      <h3>Virtual training</h3>
      <p class="muted small">Demo training module. Community forum and FAQs below.</p>
    </div>
    <div class="card glass" style="margin-top:16px" id="forum">
      <h3>Community forum</h3>
      <p class="muted small">Demo forum. (Not functional.)</p>
    </div>
    <div class="card glass" style="margin-top:16px" id="faq">
      <h3>FAQs</h3>
      <p class="muted small">See accordion above.</p>
    </div>
  </div>
  ${WT.Pages.footer()}
  `;
};

WT.PageInit.help = function(){
  document.getElementById("saveSettings")?.addEventListener("click", ()=>{
    const s = Number(document.getElementById("setStale").value);
    const b = Number(document.getElementById("setBatt").value);
    if(s>0) WT.CONFIG.staleTimeoutMinutes = s;
    if(b>=0 && b<=100) WT.CONFIG.lowBatteryThreshold = b;
    WT.generateAlerts();
    WT.Store.emit();
    WT.U.toast("Settings saved (demo)", "success");
  });
};