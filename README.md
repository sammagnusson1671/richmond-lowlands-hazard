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

- Street search restricted to the exact street list named in the NSW SES
  "Evacuate Now" order of 6 April 2024 for Cornwallis and eastern Richmond
  Lowlands.
- **Flood** — interactive Hawkesbury-at-Windsor gauge, recorded peaks
  (2021–2024), and the SES evacuation context for the selected street.
  Sourced from NSW SES warnings and BoM gauge records.
- **Bushfire** — plain-language explainer of Bush Fire Prone Land
  categories, with an explicit "data gap" tag: the NSW RFS dataset
  (data.nsw.gov.au, CKAN API) is identified as the wiring-in target but is
  not yet connected for this prototype.
- **Heat** — three-way comparison of official BoM station readings,
  Western Sydney University ground-sensor research, and forward projections
  (Australia Institute HeatWatch / WSU), since no single authoritative
  address-level heat layer exists yet for this area.
- Every claim carries a **Published source** or **Data gap** tag so the
  boundary between what's connected and what's still to be wired in is
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
- Bureau of Meteorology — Hawkesbury River gauge records (Windsor, North
  Richmond)
- NSW Bush Fire Prone Land dataset, data.nsw.gov.au (CKAN API), certified
  by the NSW RFS Commissioner
- Western Sydney University urban heat microclimate research
- Australia Institute HeatWatch modelling
