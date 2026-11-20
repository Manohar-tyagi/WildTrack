window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.login = function(){
  return `
  <div style="max-width:420px;margin:80px auto;padding:24px">
    ${WT.C.pageHeader("Demo login", "Demonstration login only. Use demo / demo.")}
    <div class="card glass">
      <div class="form-field" style="margin-bottom:10px"><label>Username</label><input id="loginUser" class="search-box" style="width:100%" value="demo" /></div>
      <div class="form-field" style="margin-bottom:10px"><label>Password</label><input id="loginPass" class="search-box" style="width:100%" type="password" value="demo" /></div>
      <button class="btn btn-primary" id="loginBtn">Sign in (demo)</button>
      <p class="muted small" style="margin-top:10px">Clearly labelled as a demonstration login. No real authentication.</p>
    </div>
  </div>
  ${WT.Pages.footer()}
  `;
};

WT.PageInit.login = function(){
  document.getElementById("loginBtn")?.addEventListener("click", ()=>{
    const u = document.getElementById("loginUser").value;
    const p = document.getElementById("loginPass").value;
    if(u==="demo" && p==="demo"){ WT.U.toast("Demo login successful","success"); location.hash="#/dashboard"; }
    else WT.U.toast("Use demo / demo","warning");
  });
};