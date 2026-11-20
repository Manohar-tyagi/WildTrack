window.WT = window.WT || {};
WT.Store = {
  route: "home",
  params: {},
  outage: false,
  autoRefresh: false,
  autoTimer: null,
  listeners: [],
  subscribe(fn){ this.listeners.push(fn); },
  emit(){ this.listeners.forEach(f=>{try{f();}catch(e){console.error(e);}}); },
  setRoute(r,p){ this.route=r; this.params=p||{}; this.emit(); },
  // simulation helpers
  randomAnimal(){ const a=WT.DATA.animals; return a[Math.floor(Math.random()*a.length)]; },
  addSampleReport(){ /* implemented below */ }
};

// fix addSampleReport properly
WT.Store.addSampleReport = function(){
  const a = this.randomAnimal();
  const last = WT.latestReport(a);
  const baseLat = last ? last.lat : 12.0;
  const baseLng = last ? last.lng : 76.0;
  const lat = Number((baseLat + (Math.random()-0.5)*0.003).toFixed(6));
  const lng = Number((baseLng + (Math.random()-0.5)*0.003).toFixed(6));
  // validate; if invalid make valid
  const vlat = WT.U.clamp(lat,-90,90), vlng = WT.U.clamp(lng,-180,180);
  const moved = Math.random() > 0.4;
  const rep = {
    reportId: "REP-"+a.animalId+"-"+Date.now(),
    animalId: a.animalId,
    lat: vlat, lng: vlng,
    timestamp: new Date().toISOString(),
    movementStatus: moved?"MOVING":"RESTING",
    batteryPercentage: last ? Math.max(5, last.batteryPercentage - Math.floor(Math.random()*3)) : 90,
    connectionStatus: "CONNECTED"
  };
  a.reports.push(rep);
  WT.generateAlerts();
  WT.updateLastSynced();
  this.emit();
  WT.U.toast("Sample report added for "+a.animalId, "success");
};

WT.Store.flipStatus = function(){
  const a = this.randomAnimal();
  const last = WT.latestReport(a);
  if(!last){ WT.U.toast("No report","warning"); return; }
  last.movementStatus = last.movementStatus==="MOVING" ? "RESTING" : "MOVING";
  WT.generateAlerts();
  WT.updateLastSynced();
  this.emit();
  WT.U.toast(a.animalId+" → "+last.movementStatus, "info");
};

WT.Store.drainBattery = function(){
  const a = this.randomAnimal();
  const last = WT.latestReport(a);
  if(!last){ WT.U.toast("No report","warning"); return; }
  last.batteryPercentage = Math.max(3, last.batteryPercentage - 25);
  WT.generateAlerts();
  WT.updateLastSynced();
  this.emit();
  WT.U.toast("Battery drained: "+a.animalId+" "+last.batteryPercentage+"%", "warning");
};

WT.Store.disconnect = function(){
  const a = this.randomAnimal();
  const last = WT.latestReport(a);
  if(!last){ WT.U.toast("No report","warning"); return; }
  last.connectionStatus = "DISCONNECTED";
  WT.generateAlerts();
  WT.updateLastSynced();
  this.emit();
  WT.U.toast(a.animalId+" disconnected", "warning");
};

WT.Store.invalidGps = function(){
  const a = this.randomAnimal();
  const last = WT.latestReport(a);
  if(!last){ WT.U.toast("No report","warning"); return; }
  const rep = Object.assign({}, last, {
    reportId: "REP-"+a.animalId+"-BAD-"+Date.now(),
    lat: 999.9, lng: 0,
    timestamp: new Date().toISOString(),
    connectionStatus: "CONNECTED"
  });
  // store invalid report separately? push as report but validation fails; alert generated
  a.reports.push(rep);
  WT.generateAlerts();
  WT.updateLastSynced();
  this.emit();
  WT.U.toast("Invalid GPS report sent for "+a.animalId, "critical");
};

WT.Store.outage = function(){
  this.outage = true;
  this.emit();
  if(WT.App && WT.App.render) WT.App.render();
  WT.U.toast("Backend outage simulated", "critical");
};

WT.Store.restore = function(){
  this.outage = false;
  WT.updateLastSynced();
  this.emit();
  if(WT.App && WT.App.render) WT.App.render();
  WT.U.toast("Connection restored", "success");
};
WT.Store.resetDemo = function(){
  // reload page to reset all in-memory state
  WT.U.toast("Resetting demo…", "info");
  setTimeout(()=>{ location.reload(); }, 400);
};

WT.Store.setAutoRefresh = function(on){
  this.autoRefresh = on;
  if(this.autoTimer){ clearInterval(this.autoTimer); this.autoTimer=null; }
  if(on){
    this.autoTimer = setInterval(()=>{
      // small random movement: pick random animal, nudge last report
      const a = this.randomAnimal();
      const last = WT.latestReport(a);
      if(last && !this.outage){
        last.lat = Number((last.lat + (Math.random()-0.5)*0.001).toFixed(6));
        last.lng = Number((last.lng + (Math.random()-0.5)*0.001).toFixed(6));
        last.timestamp = new Date().toISOString();
        if(Math.random()<0.15) last.movementStatus = last.movementStatus==="MOVING"?"RESTING":"MOVING";
        WT.updateLastSynced();
        WT.generateAlerts();
        this.emit();
      }
    }, WT.CONFIG.autoRefreshMs);
  }
};

WT.Store.ackAlert = function(id){
  const al = (WT.DATA.alerts||[]).find(x=>x.id===id);
  if(al){ al.state = al.state==="New"?"Acknowledged": (al.state==="Acknowledged"?"Resolved":al.state); WT.generateAlerts?0:0; }
  // persist state mutation: regenerate would reset; so instead mark in a separate map
  WT.Store.alertStates = WT.Store.alertStates || {};
  // track overrides
  WT.Store.alertStates[id] = al ? al.state : "Resolved";
  this.emit();
};
// We'll instead mutate alert objects directly and prevent regenerate from clobbering? 
// Simplest: keep alertStates override applied after generateAlerts.
const _origGen = WT.generateAlerts;
WT.generateAlerts = function(){
  _origGen();
  if(WT.Store.alertStates){
    for(const a of WT.DATA.alerts){
      const key = a.animalId+"|"+a.type;
      if(WT.Store.alertStates[key]) a.state = WT.Store.alertStates[key];
    }
  }
};

// Acknowledge lifecycle helper
WT.Store.advanceAlert = function(id){
  const al = (WT.DATA.alerts||[]).find(x=>x.id===id);
  if(!al) return;
  if(al.state==="New") al.state="Acknowledged";
  else if(al.state==="Acknowledged") al.state="Resolved";
  WT.Store.alertStates = WT.Store.alertStates || {};
  WT.Store.alertStates[al.animalId+"|"+al.type]=al.state;
  this.emit();
  WT.U.toast("Alert "+al.state.toLowerCase(), "info");
};

// KPIs
WT.Store.kpis = function(){
  const animals = WT.DATA.animals;
  let moving=0, resting=0, connected=0, attention=0;
  for(const a of animals){
    const r = WT.latestReport(a);
    const ms = WT.effectiveStatus(r);
    const cs = WT.connectionEffective(r);
    if(ms==="MOVING") moving++;
    else if(ms==="RESTING") resting++;
    if(cs==="CONNECTED") connected++;
    // needs attention: low battery or disconnected or stale
    if(r && (r.batteryPercentage < WT.CONFIG.lowBatteryThreshold || r.connectionStatus==="DISCONNECTED" || WT.isStale(r))) attention++;
    else if(!r) attention++;
  }
  return { total: animals.length, moving, resting, connected, attention };
};