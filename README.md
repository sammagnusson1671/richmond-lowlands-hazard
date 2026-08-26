# Know your place

Property hazard information for Cornwallis and Richmond Lowlands, Hawkesbury LGA, NSW — flood, fire and heat, built only from public data. Nothing on this site is invented, estimated or interpolated. Where a figure isn't publicly available at the resolution claimed, the interface says so and explains what's missing.

## Running it

```
npm install
npm run dev
```

## Data layers

Status of each data layer this tool depends on, per the build brief's reporting requirement. Updated as tasks land.

| Layer | Source | Status | Resolution | Licence / update frequency |
|---|---|---|---|---|
| SES flood warnings & evacuation order | NSW SES Evacuate Now order, 6 April 2024 | Connected | Street (named streets in the order) | Public notice; event-driven |
| Hawkesbury River gauge history | Bureau of Meteorology, Windsor & North Richmond gauges | Connected | Regional (gauge readings, not per-property) | Public; ongoing |
| Fire danger ratings | NSW RFS Australian Fire Danger Rating System | Connected (reference content, not a live feed) | Regional | Public; daily when live |
| Gospers Mountain fire summary | NSW RFS / Australian Disaster Resilience Knowledge Hub | Connected | Regional | Public; static historical record |
| Heat thresholds & Western Sydney research figures | Pfautsch, Wujeska-Klause & Walters (2025); The Australia Institute HeatWatch | Connected | Regional | Published research, static |
| **BOM local heat record (Task 1)** | Bureau of Meteorology Climate Data Online, station 067105, Richmond RAAF | **Not yet connected — see below** | Locality (station is ~3 km from the target streets) | Public; updated daily by the Bureau |
| Canopy / impervious cover (Task 2) | NSW Spatial Services urban vegetation & canopy datasets | Not yet connected | Property or suburb, depending on what the dataset actually resolves to | Public; NSW Government |
| Bush Fire Prone Land (Task 3) | NSW RFS BFPL mapping, data.nsw.gov.au CKAN API | Not yet connected | Parcel/property (point-in-polygon) | Public; certified by RFS Commissioner |
| Local fire history (Task 4) | NSW RFS fire history, NPWS fire history, SEED | Not yet connected | Varies | Public |
| Street/property flood extents (Task 5) | Hawkesbury City Council flood mapping, NSW Spatial Services, SEED EPI-Flood, 2024 Hawkesbury–Nepean Flood Study | Not yet connected | Unknown until investigated | Public, varies |
| Evacuation route low points (Task 6) | Transport for NSW, Hawkesbury City Council road data | Not yet connected | Unknown until investigated | Public, varies |
| Street coverage & address search (Task 7) | NSW Geographical Names Board, GNAF, OpenStreetMap | Not yet connected — 15 streets from the April 2024 SES order only | Street, moving to address | Public |
| Deployment (Task 8) | Netlify / Vercel | Not yet deployed | — | — |

### Task 1 — why the BOM local heat record isn't connected yet

This isn't a data-availability gap — it's an access gap in the environment this build ran in. The Bureau's Climate Data Online service (`bom.gov.au`) is publicly reachable in general, but the network egress policy for this build session blocks it (confirmed: `bom.gov.au`, `data.gov.au`, `en.wikipedia.org` and `web.archive.org` all returned `EGRESS_BLOCKED` when fetched from this environment). Rather than approximate the count from a secondary source or a different (non-BOM, non-station-067105) dataset, the interface states plainly that this panel is pending, per the brief's own rule.

What's needed to close this, in order of preference:
1. **Network access** to `bom.gov.au` from wherever this is built (an environment egress allowlist change), so the daily maximum/minimum series for station 067105 can be fetched via Climate Data Online and the 30-year statistics computed directly.
2. Failing that, a **manually supplied CDO export** — the daily data CSV for station 067105 downloaded through BOM's own interface and provided to the build — computed the same way, with the same station-level provenance label.

Once either path is open, this fills the "not yet available" note in the Heat section with: days ≥35°C / ≥40°C / ≥45°C per year for the last 30 years, heatwave events per year (Bureau definition: 3+ consecutive days of unusually high day and night temperature), longest heatwave run, hottest recorded day and date, and the trend across the period — labelled **Locality level**, never property-specific, because the station sits about 3 km from these streets.

## What "not yet available" means throughout

Every claim in the interface carries a provenance label: Property specific / Street level / Locality level / Regional data / Not yet available. A "Not yet available" note always names what would close the gap. No figure is upgraded to a more specific provenance level than its actual source supports.
