/* ============================================================
   WILD TRACK - Demo dataset (simulated sample reports only)
   No real hardware, database, or live wildlife data.
   ============================================================ */
window.WT = window.WT || {};
WT.DATA = WT.DATA || {};

// Configurable demo settings (marked as demo values where applicable)
WT.CONFIG = {
  staleTimeoutMinutes: 30,        // demo value: reports older than this are STALE
  lowBatteryThreshold: 20,        // demo value: configurable in Settings
  moveThresholdSmall: 0.05,       // unvalidated estimate (degrees lat/lng)
  moveThresholdLarge: 0.20,       // unvalidated estimate
  autoRefreshMs: 7000,
  // movement thresholds note shown in UI
  thresholdsNote: "Movement thresholds (0.05 / 0.20) are unvalidated estimates."
};

// Species list
WT.SPECIES = ["Tiger","Elephant","Leopard","Rhino","Deer"];

// Reserve centers (India)
const RESERVES = [
  { name: "Bandipur National Park", lat: 11.66, lng: 76.62 },
  { name: "Nagarhole National Park", lat: 12.0, lng: 76.15 },
  { name: "Kaziranga National Park", lat: 26.58, lng: 93.17 },
  { name: "Jim Corbett National Park", lat: 29.53, lng: 78.94 },
  { name: "Ranthambore National Park", lat: 26.02, lng: 76.50 },
];

function rnd(min, max){ return Math.random()*(max-min)+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// Build 16 animals with report history
function makeAnimals(){
  const names = {
    Tiger: ["Raja","Kali","Sheru","Maya"],
    Elephant: ["Gaja","Mira","Tusker","Padma"],
    Leopard: ["Shadow","Bolt","Naina","Zara"],
    Rhino: ["Horn","Tank","Gori","Raja2"],
    Deer: ["Bambi","Dash","Spot","Grace","Swift","Meadow","Fern","Oak"]
  };
  const animals = [];
  let idx = 0;
  const counts = { Tiger:2, Elephant:2, Leopard:2, Rhino:2, Deer:8 };
  for (const sp of WT.SPECIES){
    for (let i=0;i<counts[sp];i++){
      idx++;
      const reserve = pick(RESERVES);
      const id = sp.substring(0,1).toUpperCase() + "-" + String(idx).padStart(3,"0");
      const collarId = "COL-" + String(100+idx);
      const animal = {
        animalId: id,
        name: names[sp][i % names[sp].length],
        species: sp,
        reserve: reserve.name,
        collarId: collarId,
        collarModel: "WT-Collar v2",
        installedDate: "2025-09-12",
        reports: []
      };
      // generate 8-14 reports over last 2 days
      const n = 8 + Math.floor(Math.random()*7);
      let lat = reserve.lat + rnd(-0.15,0.15);
      let lng = reserve.lng + rnd(-0.15,0.15);
      const now = Date.now();
      for (let r=0;r<n;r++){
        const ageMin = (n-r)* (60 + Math.random()*120); // minutes ago
        const ts = new Date(now - ageMin*60000).toISOString();
        // movement
        const moved = Math.random() > 0.45;
        if (moved){ lat += rnd(-0.004,0.004); lng += rnd(-0.004,0.004); }
        const status = moved ? "MOVING" : "RESTING";
        const batt = Math.max(8, 95 - r*3 - Math.floor(Math.random()*8));
        const conn = Math.random() > 0.12 ? "CONNECTED" : (Math.random()>0.5?"DISCONNECTED":"UNKNOWN");
        // last report CONNECTED mostly
        const report = {
          reportId: "REP-" + id + "-" + r,
          animalId: id,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          timestamp: ts,
          movementStatus: status,
          batteryPercentage: batt,
          connectionStatus: r===0 ? "CONNECTED" : conn
        };
        animal.reports.push(report);
      }
      // sort oldest->newest
      animal.reports.sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp));
      // ensure latest connection CONNECTED for most
      if (animal.reports.length) animal.reports[animal.reports.length-1].connectionStatus = Math.random()>0.15?"CONNECTED":"DISCONNECTED";
      animals.push(animal);
    }
  }
  return animals;
}

WT.DATA.animals = makeAnimals();

// Helper: reports for an animal (from embedded .reports or flat WT.DATA.reports)
WT.reportsFor = function(animalId){
  if(WT.DATA.reports && WT.DATA.reports.length){
    return WT.DATA.reports.filter(r=>r.animalId===animalId).slice().sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
  }
  const a = (WT.DATA.animals||[]).find(x=>x.animalId===animalId);
  return a && a.reports ? a.reports.slice().sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp)) : [];
};
function _normReport(r){
  if(!r) return r;
  return Object.assign({}, r, {
    lat: r.lat!=null?r.lat:(r.latitude!=null?r.latitude:r.lat),
    lng: r.lng!=null?r.lng:(r.longitude!=null?r.longitude:r.lng),
    latitude: r.latitude!=null?r.latitude:(r.lat!=null?r.lat:r.latitude),
    longitude: r.longitude!=null?r.longitude:(r.lng!=null?r.lng:r.longitude)
  });
}
WT.latestReport = function(animal){
  if(!animal) return null;
  const reps = WT.reportsFor(animal.animalId);
  if(!reps.length) return null;
  return _normReport(reps[reps.length-1]);
};

// Validation helpers
WT.validateCoords = function(lat, lng){
  const la = Number(lat), lo = Number(lng);
  if (isNaN(la) || isNaN(lo)) return false;
  if (la < -90 || la > 90) return false;
  if (lo < -180 || lo > 180) return false;
  return true;
};

// Status helpers
WT.isStale = function(report){
  if(!report) return false;
  const ageMin = (Date.now() - new Date(report.timestamp).getTime())/60000;
  return ageMin > WT.CONFIG.staleTimeoutMinutes;
};

WT.effectiveStatus = function(report){
  // movement status possibly STALE if old
  if(!report) return "UNKNOWN";
  if(WT.isStale(report)) return "STALE";
  return report.movementStatus || "UNKNOWN";
};

WT.connectionEffective = function(report){
  if(!report) return "UNKNOWN";
  if(WT.isStale(report)) return "STALE";
  return report.connectionStatus || "UNKNOWN";
};

// Alerts generation (in-memory)
WT.generateAlerts = function(){
  const alerts = [];
  let aid=1;
  const now = Date.now();
  for(const a of WT.DATA.animals){
    const r = WT.latestReport(a);
    if(!r){ 
      alerts.push({id:"AL"+aid++, animalId:a.animalId, species:a.species, type:"No recent GPS report", severity:"high", state:"New", time:new Date().toISOString(), reason:"No report available"});
      continue;
    }
    // low battery
    if(r.batteryPercentage < WT.CONFIG.lowBatteryThreshold){
      alerts.push({id:"AL"+aid++, animalId:a.animalId, species:a.species, type:"Low battery", severity:r.batteryPercentage<10?"critical":"medium", state:"New", time:r.timestamp, reason:"Battery at "+r.batteryPercentage+"%"});
    }
    // disconnected
    if(r.connectionStatus === "DISCONNECTED"){
      alerts.push({id:"AL"+aid++, animalId:a.animalId, species:a.species, type:"Disconnected collar", severity:"high", state:"New", time:r.timestamp, reason:"Collar not connected"});
    }
    // stale
    if(WT.isStale(r)){
      alerts.push({id:"AL"+aid++, animalId:a.animalId, species:a.species, type:"No recent GPS report", severity:"medium", state:"New", time:r.timestamp, reason:"Last report older than "+WT.CONFIG.staleTimeoutMinutes+" min"});
    }
    const reps = WT.reportsFor(a.animalId);
    // invalid gps (check any report with invalid coords)
    for(const rep of reps){
      const la = rep.lat!=null?rep.lat:rep.latitude;
      const lo = rep.lng!=null?rep.lng:rep.longitude;
      if(!WT.validateCoords(la, lo)){
        alerts.push({id:"AL"+aid++, animalId:a.animalId, species:a.species, type:"Invalid GPS report", severity:"medium", state:"New", time:rep.timestamp, reason:"Coordinates out of range"});
        break;
      }
    }
    // unusual movement
    for(let i=1;i<reps.length;i++){
      const la1=reps[i].lat!=null?reps[i].lat:reps[i].latitude;
      const lo1=reps[i].lng!=null?reps[i].lng:reps[i].longitude;
      const la0=reps[i-1].lat!=null?reps[i-1].lat:reps[i-1].latitude;
      const lo0=reps[i-1].lng!=null?reps[i-1].lng:reps[i-1].longitude;
      const d = Math.abs(la1-la0)+Math.abs(lo1-lo0);
      if(d > WT.CONFIG.moveThresholdLarge){
        alerts.push({id:"AL"+aid++, animalId:a.animalId, species:a.species, type:"Unusual movement", severity:"low", state:"New", time:reps[i].timestamp, reason:"Large position jump detected"});
        break;
      }
    }
  }
  WT.DATA.alerts = alerts;
};
WT.generateAlerts();

// Last synced time
WT.lastSynced = new Date();
WT.updateLastSynced = function(){ WT.lastSynced = new Date(); };

// Expose a flat reports list
WT.allReports = function(){
  if(WT.DATA.reports && WT.DATA.reports.length){
    const amap = {};
    (WT.DATA.animals||[]).forEach(a=>{ amap[a.animalId]=a.species; });
    return WT.DATA.reports.map(r=> Object.assign({}, r, { species: r.species || amap[r.animalId] || "Unknown", lat: r.latitude!=null?r.latitude:r.lat, lng: r.longitude!=null?r.longitude:r.lng }));
  }
  const out=[];
  for(const a of WT.DATA.animals||[]) for(const r of (a.reports||[])) out.push(Object.assign({},r,{species:a.species, lat:r.latitude!=null?r.latitude:r.lat, lng:r.longitude!=null?r.longitude:r.lng}));
  return out;
};

// Status icon+text labels
WT.STATUS_LABELS = {
  MOVING: "MOVING", RESTING:"RESTING", CONNECTED:"CONNECTED",
  DISCONNECTED:"DISCONNECTED", STALE:"STALE", UNKNOWN:"UNKNOWN"
};
WT.statusIcon = function(s){
  const m = {MOVING:"➤", RESTING:"⏸", CONNECTED:"●", DISCONNECTED:"○", STALE:"⏱", UNKNOWN:"?"};
  return m[s]||"?";
};