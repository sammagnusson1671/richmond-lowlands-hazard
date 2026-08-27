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
| **BOM local heat record (Task 1)** | Bureau of Meteorology Climate Data Online, station 067105, Richmond RAAF (IDCJAC0010/0011) | **Connected** — 1996–2025 compiled | Locality (station is ~3 km from the target streets) | Public; Bureau updates the station's record daily, this compilation is a point-in-time snapshot (fetched 27 Aug 2026) |
| Canopy / non-vegetated cover (Task 2) | NSW DPHI — Greater Sydney Region Tree Canopy to Modified Mesh Block 2024/25 | **Connected** — 14 of 15 streets | Street (ABS Modified Mesh Block containing the street) | CC-BY; captured Dec 2024–Apr 2025, `update_freq: notPlanned` |
| Bush Fire Prone Land (Task 3) | NSW RFS BFPL, `NSW_BushFire_Prone_Land` FeatureServer (portal.spatial.nsw.gov.au) | **Connected** — live point-in-polygon, 13 of 15 streets | Street (one representative point per street) | Public; certified by RFS Commissioner |
| Local fire history (Task 4) | NSW RFS fire history, NPWS fire history, SEED | Not yet connected | Varies | Public |
| Street/property flood extents (Task 5) | Hawkesbury City Council flood mapping, NSW Spatial Services, SEED EPI-Flood, 2024 Hawkesbury–Nepean Flood Study | Not yet connected | Unknown until investigated | Public, varies |
| Evacuation route low points (Task 6) | Transport for NSW, Hawkesbury City Council road data | Not yet connected | Unknown until investigated | Public, varies |
| Street coverage & address search (Task 7) | NSW Geographical Names Board, GNAF, OpenStreetMap | Not yet connected — 15 streets from the April 2024 SES order only | Street, moving to address | Public |
| Deployment (Task 8) | Netlify / Vercel | Not yet deployed | — | — |

### Task 1 — the BOM local heat record

**Access note, for anyone rebuilding this.** `www.bom.gov.au` is blocked by this environment's network egress policy — every path under it, including Climate Data Online, returned `EGRESS_BLOCKED`. But `reg.bom.gov.au` serves the identical Climate Data Online application (same HTML, same session tokens, same download links) and was reachable. That's the host used below. `data.gov.au` and `data.nsw.gov.au` also opened up once the policy was widened; `www.rfs.nsw.gov.au`, `www.hawkesbury.nsw.gov.au` and `www.transport.nsw.gov.au` did not, and remain blocked as of this task.

**What was pulled.** Daily maximum temperature (product `IDCJAC0010`) and daily minimum temperature (`IDCJAC0011`) for station 067105, Richmond RAAF, full period of record: 1 January 1993 (station opening) to 26 August 2026. Fetched via Climate Data Online's own "all years of data" CSV export:

```
https://reg.bom.gov.au/jsp/ncc/cdio/weatherData/av?p_display_type=dailyZippedDataFile&p_stn_num=067105&p_c=<session token>&p_nccObsCode=122&p_startYear=<year>
```
(`p_nccObsCode=122` for maximum temperature, `123` for minimum; the `p_c` token is issued per-session by the station's data-file page and isn't stable across requests.)

**What was computed, and how.** All 30-year figures use the last 30 *complete* years, 1996–2025 (the station only opened in 1993, so this is nearly its entire life; 2026 is excluded as a partial year).

- **Days ≥35°C / ≥40°C / ≥45°C per year** — direct count of days where the recorded daily maximum met or exceeded each threshold. No estimation involved.
- **Heatwave events** — the Bureau's own operational definition is implemented via the **Excess Heat Factor (EHF)**, the method underlying the Bureau's heatwave service (Nairn & Fawcett, *The excess heat factor: a metric for heatwave intensity and its use in classifying heatwave severity*, 2013): a day's 3-day mean temperature is compared against (a) the local calendar-day 95th percentile and (b) the preceding 30-day mean; a day counts when both comparisons are positive, and a heatwave event is 3 or more such days in a row. **The percentile reference period is this station's own 1993–2025 record** — there's no earlier data for 067105, so the standard national 1961–1990 baseline can't be used; this is disclosed in the app copy, not just here. This is our own computation from the raw series, not a figure pulled from the Bureau's separate heatwave-service product, which isn't queryable historically at station level through any public interface we found.
- **Trend** — a linear fit across the 30 annual ≥35°C counts has a positive slope (roughly +2.5 days/decade) but is *not* statistically significant (p ≈ 0.24, from `scipy.stats.linregress`) given how much the count swings year to year (2 days in 2008, 42 in 2018). The app reports the plain decade-to-decade comparison (18.5/yr in 1996–2005 vs 24.6/yr in 2016–2025) rather than asserting a trend the data doesn't actually support at this resolution.
- **Data quality** — 52 of 10,958 days in the 1996–2025 window have no recorded maximum, 79 no recorded minimum (~0.5–0.7%); a large share of 2014 onward still carries the Bureau's own "not yet quality controlled" flag. Neither materially changes the figures above, but both are disclosed in the app rather than silently absorbed.

The scripts used to compute this (pandas, full formulas) aren't checked into the repo — they're a one-off compilation against a point-in-time snapshot of the record, referenced here for reproducibility. Rerunning against a fresh CDO export will not reproduce identical numbers to the day, since the Bureau keeps extending and lightly revising the record.

### Task 2 — canopy and non-vegetated cover per street

**Dataset.** NSW Department of Planning, Housing and Infrastructure, *Greater Sydney Region Tree Canopy to Modified Mesh Block 2024/25*, via `data.nsw.gov.au`'s CKAN API (`package_search`), download served from `planningportal.nsw.gov.au`. A 427 MB GeoPackage covering all of Greater Sydney at the ABS **Modified Mesh Block** level — the smallest ABS geography, height-stratified vegetation cover derived from 0.48 m resolution imagery (ArborCarbon Pty Ltd) combined with ABS mesh block boundaries. Licence: CC-BY. Capture window: December 2024–April 2025. Coordinate system: GDA2020 / MGA Zone 56 (EPSG:7856).

**Locating each street.** The dataset has no street or suburb name field beyond SA2 (all 15 streets fall in SA2 "Richmond - Clarendon"), so getting anything better than a suburb-wide average required finding *where* each street actually is. Each of the 15 streets was queried by name against NSW Spatial Services' road centreline layer (`maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/LPIMap/MapServer`, layers 28/29 — urban and rural road geometry), filtered to real matches inside a bounding box around Cornwallis/Richmond Lowlands (to discard same-named streets elsewhere in NSW — "Kurrajong Road" and "Francis Street" in particular have many namesakes). The resulting point was matched against the mesh block polygon that contains it.

- 14 of 15 streets resolved to a specific mesh block this way.
- **Francis Street did not resolve** — it isn't present under that name in the state road centreline layer within the target area, in either the urban or rural road datasets, at any bounding box. It may be an unformed or private access road that the state dataset doesn't carry. The app shows this as a named gap rather than falling back to a suburb average.
- **Spelling discrepancy found:** the road dataset has this street as **"Cupitts Lane"**, not "Cupritts Lane" as carried in the original 15-street list (inherited from the SES order transcription this project started from). The app still displays "Cupritts Lane" pending verification against the actual SES notice text — this wasn't silently corrected, because the source of the discrepancy (a transcription error upstream, vs. the SES order itself) hasn't been confirmed. Worth fixing properly in Task 7's address-matching work, where the wrong spelling would break exact GNAF lookups.

**What the figures mean.** "Canopy %" is the share of the mesh block's area covered by vegetation over 3 m tall — a direct dataset figure, not derived. "Non-vegetated %" is the dataset's own category and is *not* the same as impervious or hard surface — a bare paddock is non-vegetated but not impervious, and this dataset doesn't distinguish the two. The app says this explicitly rather than letting "non-vegetated" read as "hard surface."

**Resolution honesty.** Several streets share an identical figure because they sit inside the same mesh block — on this floodplain, "Primary Production" (cleared farmland) mesh blocks can run to 200+ hectares, while a couple of others are under a hectare. This is disclosed in the app rather than presented as uniform property-level precision it doesn't have. It's still a real improvement on a suburb-wide average: it reflects the specific location of each street, not Richmond–Clarendon's mean.

### Task 3 — Bush Fire Prone Land

**Endpoint.** Found via `data.nsw.gov.au`'s CKAN `package_search` ("NSW BushFire Prone Land", published by Spatial Services (DCS)), which links a live ArcGIS FeatureServer rather than a static download:

```
https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_BushFire_Prone_Land/FeatureServer/0/query
```

This is queried directly, in the browser, per address — not pre-scraped — with an `esriGeometryPoint` intersects query against the same representative point on each street used for Task 2's canopy lookup (found via the NSW road centreline layer; see Task 2 above). It returns `category` (1/2/3, or unset for buffer) and `d_category` (the human-readable label). No features returned means the point isn't inside any mapped BFPL polygon.

**What this actually tells you.** A single point per street, not the whole street's length — a road can cross a mapping boundary, so a different address further along the same street could carry a different category. Where mapped, all matched streets came back **Category 3** (grassland/lower-intensity vegetation) or, for one, a **buffer** zone — consistent with this being cleared grazing and cropping country, exactly as the grassfire panel already says. 4 of the 14 geocoded streets returned no polygon at all: **not** a bushfire-risk all-clear, just confirmation that BFPL's vegetation-based mapping doesn't extend to that point — which is precisely why the grassfire panel leads the Fire section rather than this one. Francis Street carries the same gap as in Task 2, for the same reason (no road match).

## What "not yet available" means throughout

Every claim in the interface carries a provenance label: Property specific / Street level / Locality level / Regional data / Not yet available. A "Not yet available" note always names what would close the gap. No figure is upgraded to a more specific provenance level than its actual source supports.
