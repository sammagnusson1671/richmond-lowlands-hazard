# Richmond Lowlands Property Hazard Risk Lookup

Stage-one prototype for a single-suburb property risk tool: search a street
in Cornwallis / Richmond Lowlands and see flood, bushfire, and heat risk
summarised in plain language, each claim tagged as a published source or an
acknowledged data gap.

This is the fast, cheap stage-one demonstration ahead of the larger
Hawkesbury-Nepean Community Resilience Platform concept. Its job is to prove
delivery capability and give something concrete to show — not to be the
finished multi-hazard platform.

## What's here (v1)

- Simple, iOS-style interface: a search bar, a street list, and three
  colour-coded, tap-to-expand hazard cards (blue = flood, red = bushfire,
  amber = heat) so it's obvious at a glance which hazard is which.
- Street search restricted to the exact street list named in the NSW SES
  "Evacuate Now" order of 6 April 2024 for Cornwallis and eastern Richmond
  Lowlands.
- **Flood** — interactive gauge for the Hawkesbury River at **North
  Richmond** (BoM station 567098, the gauge closest to this floodplain),
  with its own minor/moderate/major classification levels, recorded peaks
  2021–2024, and the SES evacuation context for the selected street.
  Sourced from BoM gauge records and NSW SES warnings.
- **Bushfire** — plain-language explainer of Bush Fire Prone Land vegetation
  categories, plus the specific mapping rule that matters on this
  floodplain: actively managed cropping/grazing land is generally excluded
  from BFPL mapping, but unmanaged pasture and riparian corridors can still
  be mapped. The exact category for a given street still needs a live
  point-query against the council's certified map — flagged explicitly.
- **Heat** — four-way read: official BoM station, Western Sydney University
  ground-sensor research, real Hawkesbury LGA tree-canopy-cover and Heat
  Vulnerability Index figures (NSW DPHI), and forward projections
  (Australia Institute HeatWatch / WSU).
- Every claim carries a **Published source** or **Not yet connected** tag so
  the boundary between what's wired in and what still needs live data is
  never hidden.

## Known limitations (by design, disclosed in-app)

- No live map / geocoding yet — v1 is a curated street list, not a full
  address search. Flood zone, bushfire-prone-land, and canopy/heat map
  overlays (per the build brief) are the next wiring task, not a data
  problem: the flood (NSW Spatial Services), bushfire (data.nsw.gov.au),
  and canopy-cover proxy layers are all public and queryable.
- Heat is a proxy/comparative read, not a direct address-level
  microclimate figure.
- No real-time event data — that belongs to the larger platform, not this
  prototype.
- Single area only (Cornwallis / eastern Richmond Lowlands) — not yet
  suburb-wide or regional.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

Deploys as a static site (Netlify/Vercel — `npm run build`, publish `dist/`).

## Sources

- NSW SES emergency warning, Evacuate Now order, 6 April 2024
  (Cornwallis / eastern Richmond Lowlands)
- Bureau of Meteorology — Hawkesbury River gauge records, North Richmond
  WPS (station 567098) and Windsor
- NSW RFS Guide for Bush Fire Prone Land Mapping; NSW Bush Fire Prone Land
  dataset, data.nsw.gov.au (CKAN API), certified by the NSW RFS Commissioner
- NSW Dept of Planning, Housing & Infrastructure — Greener Neighbourhoods
  tree canopy cover and Heat Vulnerability Index data, Hawkesbury LGA
- Western Sydney University urban heat microclimate research
- Australia Institute HeatWatch modelling
