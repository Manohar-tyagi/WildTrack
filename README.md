# WILD TRACK – Wildlife Monitoring System

Team 20 project. A demo wildlife monitoring dashboard: GPS/4G collar reports → Java receiver (described) → web dashboard.

## Run
Open `index.html` in a modern browser, or serve locally:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Demo data
All animal reports, alerts, KPIs and charts are simulated sample data. No real hardware, database, WebSockets, JDBC or live wildlife data is used. Movement thresholds (0.05 / 0.20) are unvalidated estimates. Battery threshold defaults are demo values (configurable in Settings). Data status pill: "Demo data • Last synced hh:mm:ss".

## Pages
Home, Dashboard (Overview), Live Tracking, Animals (+ profile), Collar Health, Alerts, Analytics & Reports, How It Works / Technology, Use Cases, Integrations, About (Team 20), Help/Settings, Contact, Demo login (demo / demo).

## Notes
- Leaflet and Chart.js are vendored under `vendor/` for offline use.
- Respects `prefers-reduced-motion`.
- Ctrl/Cmd+K opens command palette. G then D/L/A/C/R/N quick nav. F fullscreen. ? shortcuts.

## Run
```bash
python3 -m http.server 8000
```
Open http://localhost:8000

## Folder structure
- index.html, assets/{css,js,images}, data/*.json, vendor/

## Swap demo data for real API
Set WT.DataService.USE_BACKEND=true and BASE_URL in assets/js/dataService.js.

## Replace images
See assets/images/README.md.

## Demo script (~5 min)
1. Home: hero, stats band (count-up), impact cards, integrations, world map.
2. Click "Get started" → Dashboard: KPIs, map preview, alerts summary. Point to "Demo data • Last synced" pill.
3. Live Tracking: click a marker, show path toggle + time slider, "last report X min ago".
4. Animals → open a profile: latest report, mini-map, report history (valid/invalid).
5. Collar Health: battery rings, connection badges.
6. Alerts: advance New→Acknowledged→Resolved. Show invalid GPS alert.
7. Analytics: charts, export CSV.
8. How it works: 3-step timeline, OOP class diagram flip cards, accordion.
9. Use Cases: featured + filter chips + search; open a detail page.
10. Integrations: search, A-Z index, tabs.
11. Simulate panel: add report, flip status, drain battery, disconnect, invalid GPS, outage → show offline banner + restore.
12. Present button guided tour; ? shortcuts.

## Credits
Photos: Unsplash/Pexels/Wikimedia Commons (to be added). Charts: Chart.js. Maps: Leaflet + OpenStreetMap.