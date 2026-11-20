window.WT = window.WT || {};
WT.Pages = WT.Pages || {};
WT.PageInit = WT.PageInit || {};
WT.Pages.contact = function(){
  return `
  <div style="max-width:700px;margin:0 auto;padding:40px 24px">
    ${WT.C.pageHeader("Contact us", "Demo contact form.")}
    <div class="card glass">
      <div class="form-field" style="margin-bottom:10px"><label>Name</label><input class="search-box" style="width:100%" /></div>
      <div class="form-field" style="margin-bottom:10px"><label>Email</label><input class="search-box" style="width:100%" type="email" /></div>
      <div class="form-field" style="margin-bottom:10px"><label>Message</label><textarea class="search-box" style="width:100%;height:120px"></textarea></div>
      <button class="btn btn-primary" onclick="WT.U.toast('Message sent (demo)','success')">Send</button>
    </div>
  </div>
  ${WT.Pages.footer()}
  `;
};