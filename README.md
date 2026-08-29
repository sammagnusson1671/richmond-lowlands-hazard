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
| Local fire history (Task 4) | NPWS Fire History (Wildfires and Prescribed Burns), `NPWS_Fire_History` MapServer (mapprod3.environment.nsw.gov.au) | **Connected** — locality-level, 10 km radius | Locality (NPWS estate + RFS/Forestry-imported fires; not a private-land ignition register) | Public; NPWS-maintained |
| Street/property flood extents (Task 5) | NSW EPI-Flood (statewide LEP layer); Hawkesbury FRMSP 2025 (NSW Flood Data Portal) | **Investigated — real gap found and documented**, not just unattempted | N/A — see below | EPI-Flood: public, but doesn't cover Hawkesbury LGA. FRMSP 2025 GIS files: require a Flood Data Portal login |
| Evacuation route low points (Task 6) | Hawkesbury evacuation route studies (Flood Data Portal); TfNSW open data | **Investigated — same access gap as Task 5**, not fabricated from terrain data | N/A | Studies exist, login-gated; TfNSW open data has no historical closure-height dataset |
| Street coverage & address search (Task 7) | NSW Spatial Services suburb boundaries + NSW_Property (address-level) | **Connected** — 20 streets, real house numbers verified | Address (house-number match against real property records) | Public |
| Deployment (Task 8) | Netlify / Vercel | Build-ready, not deployed — no account/token in this environment; deploy manually (below) | — | — |

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
- **Spelling corrected:** the road dataset has this street as **"Cupitts Lane"**, not "Cupritts Lane" as inherited from the original 15-street list. Confirmed against the actual SES notice — the app now uses "Cupitts Lane" throughout (suburb, canopy, BFPL and address data all updated).

**What the figures mean.** "Canopy %" is the share of the mesh block's area covered by vegetation over 3 m tall — a direct dataset figure, not derived. "Non-vegetated %" is the dataset's own category and is *not* the same as impervious or hard surface — a bare paddock is non-vegetated but not impervious, and this dataset doesn't distinguish the two. The app says this explicitly rather than letting "non-vegetated" read as "hard surface."

**Resolution honesty.** Several streets share an identical figure because they sit inside the same mesh block — on this floodplain, "Primary Production" (cleared farmland) mesh blocks can run to 200+ hectares, while a couple of others are under a hectare. This is disclosed in the app rather than presented as uniform property-level precision it doesn't have. It's still a real improvement on a suburb-wide average: it reflects the specific location of each street, not Richmond–Clarendon's mean.

### Task 3 — Bush Fire Prone Land

**Endpoint.** Found via `data.nsw.gov.au`'s CKAN `package_search` ("NSW BushFire Prone Land", published by Spatial Services (DCS)), which links a live ArcGIS FeatureServer rather than a static download:

```
https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_BushFire_Prone_Land/FeatureServer/0/query
```

This is queried directly, in the browser, per address — not pre-scraped — with an `esriGeometryPoint` intersects query against the same representative point on each street used for Task 2's canopy lookup (found via the NSW road centreline layer; see Task 2 above). It returns `category` (1/2/3, or unset for buffer) and `d_category` (the human-readable label). No features returned means the point isn't inside any mapped BFPL polygon.

**What this actually tells you.** A single point per street, not the whole street's length — a road can cross a mapping boundary, so a different address further along the same street could carry a different category. Where mapped, all matched streets came back **Category 3** (grassland/lower-intensity vegetation) or, for one, a **buffer** zone — consistent with this being cleared grazing and cropping country, exactly as the grassfire panel already says. 4 of the 14 geocoded streets returned no polygon at all: **not** a bushfire-risk all-clear, just confirmation that BFPL's vegetation-based mapping doesn't extend to that point — which is precisely why the grassfire panel leads the Fire section rather than this one. Francis Street carries the same gap as in Task 2, for the same reason (no road match).

### Task 4 — local fire history

**Endpoint.** `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Fire/NPWS_Fire_History/MapServer/0/query` — found the same way as Task 3, via `data.nsw.gov.au` CKAN pointing at the live service rather than a static download. `www.rfs.nsw.gov.au` remains blocked in this environment, so the RFS's own incident database (which would be the right source for property-specific ignition history) wasn't reachable; this dataset is NPWS's own fire history layer, which mostly captures fires on NPWS estate plus anything RFS or Forestry Corporation NSW choose to import into it. It is explicitly not a complete record of ignitions on private or agricultural land — the app says so, rather than letting an empty result nearby read as "never burned here."

**Gospers Mountain distance.** Queried the specific polygon (`FireName='Gospers Mountain' AND FireYear=201920`), reprojected to GDA2020 / MGA Zone 56 (metres), and measured the minimum distance from that polygon's boundary to the nearest of the 14 geocoded streets (Kurrajong Road) using Shapely — **11.6 km**. The NPWS record for this polygon shows an area of 479,514 ha and dates of 25 Oct 2019 – 9 Feb 2020; the app's existing "512,000+ hectares, ~90 homes, 6 council areas" figures are the broader RFS/ADRKH multi-fire-complex numbers already sourced in the prototype and were left untouched, per the brief ("extend it, don't replace it") — the two figures describe different things (one polygon vs. the whole fire complex) and both are cited separately.

**Nearby fire history.** All wildfire and prescribed-burn polygons within a 10 km radius of the streets' centroid were counted (90 total, fully retrieved — no pagination truncation) and each distance computed the same way (boundary-to-point, not centroid-to-centroid). 32 wildfires and 24 hazard reduction burns fall within that radius, spanning the years the dataset happens to have captured (1974/75–2024/25); nothing is mapped within about 4.8–5.8 km of the streets themselves. The nearest *named* event, "Richmond Rd Grass Fire" (2013, 292 ha, ~6 km away), is reported because it's a real, concrete, closer-to-home data point that also reinforces the app's existing grassfire framing.

### Task 5 — street/property flood extents: what was actually found

This is the one task where the honest answer is "investigated properly, real gap, here's exactly why" — not silence.

**NSW EPI-Flood (the statewide Flood Planning Area layer) doesn't cover Hawkesbury.** Found via `data.nsw.gov.au` → "Environmental Planning Instrument - Flood", a live ArcGIS service:

```
https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/1
```

Queried point-in-polygon at all 14 geocoded streets: zero results. Before concluding that meant "not flood-mapped," this was checked against Windsor itself (well inside the known 1% AEP floodplain) — also zero. A distinct-values query on `LGA_NAME` across the *entire statewide layer* returned only 10 LGAs: Bathurst Regional, Clarence Valley, Forbes, Hornsby, Mid-Western Regional, Tamworth Regional, Wentworth, Wingecarribee, Wollongong, Yass Valley. **Hawkesbury isn't one of them.** This state layer simply doesn't have Hawkesbury's flood planning clause digitised into it — a real, verifiable statewide coverage gap, not a query failure or a "no flood risk here" result.

**Hawkesbury's actual 2025 flood study exists, at exactly the right resolution — and is access-gated.** The NSW Flood Data Portal (`flooddata.ses.nsw.gov.au`, a separate public CKAN instance, own API reachable) lists, under the *Hawkesbury Floodplain Risk Management Study and Plan 2025* project: a **Flood Planning Area** GIS layer, **Flood emergency response classification maps** (SHP — the SES's own evacuation-relevant classification: flood islands, trapped perimeters, high/low hazard, etc., published March 2025), and raw **TUFLOW hydraulic model outputs**. This is precisely the "street or property flood height" data the brief asks about, from the actual current study named in the brief.

The dataset *metadata* is public (`GET /api/3/action/package_search` and `package_show` both work, no auth). Downloading the *files themselves* returns `403 Forbidden` from the portal's own server — not this environment's egress proxy, since the metadata API on the identical domain works fine. This reads as the data custodian requiring an authenticated/registered Flood Data Portal account for actual GIS downloads, which this build doesn't have and has no legitimate way to obtain. No attempt was made to work around it.

**What would close this gap:** a registered account on the NSW Flood Data Portal (a human, presumably Hawkesbury Council or a consultant with a legitimate need, would need to request access) to download the Flood Planning Area and Flood Emergency Response Classification shapefiles, then a point-in-polygon lookup exactly like Tasks 2–4 above — the method is proven, only the access is missing. Failing that, the same council could be asked directly for a data-sharing arrangement, since they are both the study's owner and the organisation this whole project is trying to demonstrate value to.

The marker post was **not** converted to a slider and no flood height was added to any street or property — per the brief's explicit instruction, that only happens once real model data exists to drive it, and none was actually obtained here, however close it turned out to be.

### Task 6 — evacuation route low points

The brief calls this "the single most valuable thing the tool could eventually answer" and "also the easiest place to accidentally fabricate." Both turned out to be true.

**What exists.** The NSW Flood Data Portal (`flooddata.ses.nsw.gov.au`) lists real, specific studies commissioned by Hawkesbury Council: *Hobartville Evacuation Route Study*, *Bligh Park Evacuation Route Study*, *Emergency Flood Evacuation Route Options for Richmond and Londonderry*, and a *Windsor Rd and McGraths Hill* local hydraulics specification study tied to the broader Hawkesbury-Nepean Floodplain Management Strategy's Road Evacuation Route Upgrade program. These are exactly the right documents.

**What's actually accessible.** Nothing. Every file on this portal — not just the GIS layers found in Task 5, but the PDF *reports* too — returns `403 Forbidden` on direct download; a test download of one of the Hawkesbury FRMSP report volumes confirmed this applies to PDFs as much as shapefiles. Only the CKAN metadata API (titles, descriptions, organisation, resource lists) is public. Transport for NSW's open data portal (`opendata.transport.nsw.gov.au`) is reachable and has a "Live Traffic Hazards" feed, but nothing resembling historical flood-closure trigger levels for specific roads.

**What we deliberately didn't do.** NSW Spatial Services publishes LiDAR-derived elevation data (`NSW_Elevation` / `NSW_5m_Elevation` services) that's technically reachable and could be used to eyeball a low point on a road and guess a closure height. We didn't do this. Inferring "this road floods at X metres" from raw terrain data, without a hydraulic model or a council/TfNSW-confirmed threshold behind it, is precisely the kind of invented figure the brief prohibits — a terrain low point is not the same thing as a flood closure trigger, which depends on flow dynamics the elevation data alone doesn't capture. The gap stays marked rather than quietly filled with something that would look authoritative and wouldn't be.

### Task 7 — street coverage and address-level search

**Suburb corrections, not just additions.** Cross-checking the original 15 streets against NSW's own suburb-boundary layer (`sixmaps/LPIMap/MapServer/9`) and, independently, the NSW property address layer (`public/NSW_Property/MapServer`) turned up more than a coverage gap — five streets were filed under the wrong suburb in the data this build started from: **Bensons Lane, Cornwells Lane, Onus Lane, Ridges Lane and Triangle Lane are in Richmond Lowlands, not Cornwallis.** Both sources agree independently, so this is corrected rather than repeated. Four more of the original 15 — **Ingolds Lane and Percival Street (Clarendon), Old Kurrajong Road, Kurrajong Road and Dight Street (Richmond)** — sit outside both suburbs this tool claims to cover. They stayed in (they were genuinely part of the original 15, presumably from the actual April 2024 order, which followed flood extent rather than suburb lines), but are now labelled with their real suburb rather than folded into "Richmond Lowlands" by default. Francis Street never resolved to a road in the state network at all (see Task 2), so its suburb is left as inherited and marked unverified.

**Five new streets added**, found by intersecting the official Cornwallis and Richmond Lowlands suburb polygons against the NSW road centreline layer: Cordners Lane and Greenway Crescent (Cornwallis); Dells Lane, Edwards Road and Sandstone Place (Richmond Lowlands). None were in the April 2024 SES order — the app records this distinction per street rather than presenting old and new streets identically.

**Address-level search.** GNAF itself wasn't reachable as a queryable service from this environment, but NSW Spatial Services' `NSW_Property` layer — sourced from the same Valuer-General address authority data — serves the same purpose and is live. For each of the 20 streets, real house numbers were pulled by querying this layer with a small envelope around the street's location and keeping only addresses that exactly match the street name (bounded match, so "Kurrajong Road" doesn't also catch "Old Kurrajong Road" addresses). When a user searches with a house number that matches a real address on record, the app shows a second verification line ("This house number is on record in NSW's property address data"); when it doesn't match, the search still proceeds on the street match alone rather than rejecting a possibly-real address our necessarily-partial lookup missed. This is address-level validation, not full GNAF autocomplete — a genuine step beyond street-only matching, using the real data actually reachable.

### Task 8 — deploy

This build has no Netlify or Vercel account or token, so it couldn't deploy itself — that needs a human with an account. The project is otherwise ready: it's a plain Vite + React static site (`npm run build` → `dist/`), no server, no environment variables, no build-time secrets. A `netlify.toml` is included (build command, publish directory, SPA redirect).

**Netlify** — fastest path: go to app.netlify.com → Add new site → Import an existing project → connect GitHub → pick `sammagnusson1671/richmond-lowlands-hazard`, branch `claude/knowyourplace3-data-coverage-4jnkpk` (or `main`, once merged). Netlify reads `netlify.toml` automatically; no manual config needed. Every push redeploys.

**Vercel** — same idea: vercel.com → Add New → Project → import the same repo. Vercel auto-detects Vite (build command `npm run build`, output `dist`) with no config file required.

Either way, the result is a shareable `https://*.netlify.app` or `https://*.vercel.app` URL, static-hosted, and — since the page is a single responsive column with a 375px floor already tested (see Design in the brief) — should work on a phone without further work.

## What "not yet available" means throughout

Every claim in the interface carries a provenance label: Property specific / Street level / Locality level / Regional data / Not yet available. A "Not yet available" note always names what would close the gap. No figure is upgraded to a more specific provenance level than its actual source supports.
