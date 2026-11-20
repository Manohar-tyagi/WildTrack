window.WT = window.WT || {};
WT.DataService = {
  USE_BACKEND: false,
  BASE_URL: "",
  _latency(){ return 100 + Math.floor(Math.random()*300); },
  _delay(fn){ return new Promise(res=>setTimeout(()=>res(fn()), this._latency())); },
  async _fetchJSON(name){
    try {
      const r = await fetch("data/"+name+".json");
      if(!r.ok) throw new Error("bad status");
      return await r.json();
    } catch(e){ return null; }
  },
  async init(){
    // best-effort load from /data; fall back to embedded seed (data.js)
    const animals = await this._fetchJSON("animals");
    if(animals){ WT.DATA.animals = animals; }
    const reserves = await this._fetchJSON("reserves");
    if(reserves){ WT.DATA.reserves = reserves; }
    const collars = await this._fetchJSON("collars");
    if(collars){ WT.DATA.collars = collars; }
    const reports = await this._fetchJSON("reports");
    if(reports){ WT.DATA.reports = reports; }
    const usecases = await this._fetchJSON("usecases");
    if(usecases){ WT.DATA.usecases = usecases; }
    const news = await this._fetchJSON("news");
    if(news){ WT.DATA.news = news; }
    const events = await this._fetchJSON("events");
    if(events){ WT.DATA.events = events; }
    const integrations = await this._fetchJSON("integrations");
    if(integrations){ WT.DATA.integrations = integrations; }
    const team = await this._fetchJSON("team");
    if(team){ WT.DATA.team = team; }
    const faq = await this._fetchJSON("faq");
    if(faq){ WT.DATA.faq = faq; }
    // regenerate alerts from rules if generateAlerts exists
    if(typeof WT.generateAlerts === "function") WT.generateAlerts();
    WT.updateLastSynced();
    if(WT.Store) WT.Store.emit();
    if(WT.App && WT.App.render) WT.App.render();
  },
  // abstraction mimicking REST endpoints
  async getAnimals(){ if(this.USE_BACKEND){ try{ const r=await fetch(this.BASE_URL+"/api/animals"); if(r.ok) return r.json(); }catch(e){} } return this._delay(()=>WT.DATA.animals||[]); },
  async getAnimal(id){ if(this.USE_BACKEND){ try{ const r=await fetch(this.BASE_URL+"/api/animals/"+id); if(r.ok) return r.json(); }catch(e){} } return this._delay(()=> (WT.DATA.animals||[]).find(a=>a.animalId===id) ); },
  async getReports(q){ q=q||{}; if(this.USE_BACKEND){ try{ const r=await fetch(this.BASE_URL+"/api/reports"); if(r.ok) return r.json(); }catch(e){} } return this._delay(()=> {
    let list = WT.DATA.reports || [];
    if(q.animalId) list=list.filter(r=>r.animalId===q.animalId);
    return list;
  }); },
  async getCollars(){ if(this.USE_BACKEND){ try{ const r=await fetch(this.BASE_URL+"/api/collars"); if(r.ok) return r.json(); }catch(e){} } return this._delay(()=>WT.DATA.collars||[]); },
  async getAlerts(){ if(this.USE_BACKEND){ try{ const r=await fetch(this.BASE_URL+"/api/alerts"); if(r.ok) return r.json(); }catch(e){} } return this._delay(()=>WT.DATA.alerts||[]); },
  async getStats(){ return this._delay(()=> WT.Store ? WT.Store.kpis() : {}); },
};

// ensure WT.DATA has defaults
WT.DATA = WT.DATA || {};
// animals from data.js already; if reports not present, derive from WT.DATA.animals reports
if(!WT.DATA.reports){
  // build reports from animals.reports if present
  const reps=[];
  (WT.DATA.animals||[]).forEach(a=>{ (a.reports||[]).forEach(r=> reps.push(Object.assign({},r,{species:a.species}))); });
  WT.DATA.reports = reps;
}