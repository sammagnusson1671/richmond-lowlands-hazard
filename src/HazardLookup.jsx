import React, { useState } from "react";

/* ---------------- DESIGN TOKENS ---------------- */
const C = {
  bg: "#F5F5F7",
  surface: "#FFFFFF",
  ink: "#1D1D1F",
  ink2: "#6E6E73",
  ink3: "#98989D",
  line: "rgba(0,0,0,.09)",
  lineSoft: "rgba(0,0,0,.06)",
  blue: "#0A84FF",
  blueTint: "rgba(10,132,255,.10)",
  red: "#FF3B30",
  redTint: "rgba(255,59,48,.10)",
  amber: "#FF9500",
  amberTint: "rgba(255,149,0,.10)",
  green: "#30B94D",
  gray: "#8E8E93",
  grayTint: "rgba(142,142,147,.12)",
};

const sys = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

/* ------------------------------------------------------------------
   STREETS — every street named in the NSW SES "Evacuate Now" order of
   6 April 2024 for Cornwallis and the eastern part of Richmond Lowlands.
   Source: NSW SES emergency warning AUREMER-c02c1bb7b7109e913cbf108519ac47e9
------------------------------------------------------------------ */
const STREETS = [
  { n: "Bensons Lane", s: "Cornwallis" },
  { n: "Cornwallis Road", s: "Cornwallis" },
  { n: "Cornwells Lane", s: "Cornwallis" },
  { n: "Cupritts Lane", s: "Cornwallis" },
  { n: "Gow Lane", s: "Cornwallis" },
  { n: "Ingolds Lane", s: "Richmond Lowlands" },
  { n: "Old Kurrajong Road", s: "Richmond Lowlands" },
  { n: "Onus Lane", s: "Cornwallis" },
  { n: "Percival Street", s: "Richmond Lowlands" },
  { n: "Powells Lane", s: "Richmond Lowlands" },
  { n: "Ridges Lane", s: "Cornwallis" },
  { n: "Triangle Lane", s: "Cornwallis" },
  { n: "Kurrajong Road", s: "Richmond Lowlands" },
  { n: "Francis Street (rear)", s: "Richmond Lowlands" },
  { n: "Dight Street (rear)", s: "Richmond Lowlands" },
];

/* ------------------------------------------------------------------
   FLOOD — Hawkesbury River at NORTH RICHMOND (WPS), BOM station 567098.
   Classification levels published by the Bureau of Meteorology.
------------------------------------------------------------------ */
const RICHMOND_GAUGE = { minor: 3.8, moderate: 7.9, major: 10.5 };

/* Recorded peaks, Hawkesbury River. North Richmond primary, Windsor for comparison. */
const PEAKS = [
  { yr: "Mar 2021", nr: 14.38, wd: 12.93, note: "The highest of these four events at North Richmond." },
  { yr: "Mar 2022", nr: 14.08, wd: 13.80, note: "Slightly lower here than March 2021 — despite Windsor recording its own highest peak since 1978." },
  { yr: "Jul 2022", nr: 14.19, wd: 13.93, note: "Two near-identical peaks at North Richmond, 24 hours apart." },
  { yr: "Apr 2024", nr: 10.52, wd: 7.00, note: "Evacuate Now order issued for these streets as the river passed this level." },
];

const GAUGE_STEPS = [
  { h: 3.8, label: "Minor flood level", body: "Low-lying paddocks and riverbank land begin to flood. On this floodplain, warnings and evacuation planning start well before this point.", tone: C.blue },
  { h: 7.9, label: "Moderate flood level", body: "Roads across the lowlands start to cut. These streets are among the first in the Hawkesbury to lose safe access to Richmond.", tone: C.blue },
  { h: 10.5, label: "Major flood level", body: "Widespread inundation across the floodplain. Evacuation routes are compromised and anyone still here is likely isolated.", tone: C.red },
  { h: 10.52, label: "April 2024 peak", body: "The level the river reached when the NSW SES Evacuate Now order was in force for Cornwallis and eastern Richmond Lowlands.", tone: C.red },
  { h: 14.08, label: "March 2022 peak", body: "Third-highest of the recent peaks at this gauge. Windsor, downstream, recorded its highest level since 1978 during this event.", tone: C.red },
  { h: 14.19, label: "July 2022 peak", body: "The river peaked twice here within 24 hours, at 14.18 m and 14.19 m.", tone: C.red },
  { h: 14.38, label: "March 2021 peak", body: "The highest level recorded at this gauge in the past five years.", tone: C.red },
];

/* ------------------------------------------------------------------
   ICONS — flat, single-color, 24×24. Kept deliberately simple.
------------------------------------------------------------------ */
function DropletIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor">
      <path d="M12 2.6c1.6 2.2 6 8.6 6 12.6a6 6 0 0 1-12 0c0-4 4.4-10.4 6-12.6Z" />
    </svg>
  );
}
function FlameIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor">
      <path d="M12.4 2c.7 3.3-3 4.7-3 8.4a2.7 2.7 0 0 0 5.4 0c0-1.1-.7-1.9-.7-3 2 1.4 3.6 4.1 3.6 6.9a5.7 5.7 0 0 1-11.4 0C6.3 9.7 9.6 5.6 12.4 2Z" />
    </svg>
  );
}
function SunIcon(p) {
  const s = p.size || 20;
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.4" fill="currentColor" stroke="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line key={deg} x1="12" y1="3.2" x2="12" y2="5.4" transform={`rotate(${deg} 12 12)`} />
      ))}
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "transform .25s cubic-bezier(.4,0,.2,1)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.3" y2="15.3" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6.5-7-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 14 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.1" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.2" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------------- shared bits ---------------- */
function Bar({ pct, tone, h = 7 }) {
  return (
    <div style={{ background: C.grayTint, height: h, width: "100%", borderRadius: h }}>
      <div style={{ width: Math.max(pct, 2) + "%", height: "100%", background: tone, borderRadius: h, transition: "width .6s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function SourceTag({ kind }) {
  const v = kind === "v";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...mono, fontSize: 10.5, letterSpacing: ".04em", padding: "3px 9px 3px 7px", borderRadius: 20, background: v ? C.blueTint : C.grayTint, color: v ? C.blue : C.ink2 }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: v ? C.blue : C.ink3 }} />
      {v ? "Published source" : "Not yet connected"}
    </span>
  );
}

function GapNote({ children }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14, padding: "10px 12px", background: C.grayTint, borderRadius: 10 }}>
      <span style={{ color: C.ink3, flexShrink: 0, marginTop: 1 }}><InfoIcon /></span>
      <p style={{ margin: 0, fontSize: 12.5, color: C.ink2, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

/* Collapsible hazard card: icon, one-line status chip, expands to full detail */
function HazardCard({ icon, color, tint, title, chip, summary, open, onToggle, children }) {
  return (
    <div style={{ background: C.surface, borderRadius: 18, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.05)", overflow: "hidden" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "16px 16px", background: "none", border: 0, cursor: "pointer", textAlign: "left", ...sys,
      }}>
        <span style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 12, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontWeight: 600, fontSize: 16.5, color: C.ink, letterSpacing: "-.01em" }}>{title}</span>
          <span style={{ display: "block", fontSize: 13, color: C.ink2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summary}</span>
        </span>
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...mono, fontSize: 10.5, fontWeight: 600, letterSpacing: ".02em", padding: "5px 10px", borderRadius: 20, background: tint, color: color, whiteSpace: "nowrap" }}>
            {chip}
          </span>
          <span style={{ color: C.ink3 }}><ChevronIcon open={open} /></span>
        </span>
      </button>
      <div style={{
        display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .35s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "2px 20px 22px", borderTop: `1px solid ${C.lineSoft}`, marginTop: 2 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- FLOOD detail ---------------- */
function FloodDetail({ street }) {
  const [h, setH] = useState(RICHMOND_GAUGE.moderate);
  const active = [...GAUGE_STEPS].reverse().find((s) => h >= s.h);
  const min = 2, max = 16;
  const pctOf = (v) => ((v - min) / (max - min)) * 100;

  return (
    <div style={{ paddingTop: 16 }}>
      <p style={{ margin: "0 0 16px", fontSize: 14.5, color: C.ink, lineHeight: 1.55 }}>
        {street.n} was named in the NSW SES <strong>Evacuate Now</strong> order of 6 April 2024. On this floodplain, the decision to leave arrives long before the water does — residents here evacuate while the rest of the valley is still watching moderate levels downstream.
      </p>

      <div style={{ background: C.bg, borderRadius: 14, padding: "16px 16px 18px" }}>
        <label htmlFor="gauge" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12.5, color: C.ink2, marginBottom: 10, fontWeight: 500 }}>
          <span>Explore river heights — Hawkesbury at North Richmond</span>
        </label>
        <div style={{ ...sys, fontSize: 36, fontWeight: 700, letterSpacing: "-.02em", color: C.ink, marginBottom: 10 }}>
          {h.toFixed(2)} m
        </div>
        <input id="gauge" type="range" min={min} max={max} step="0.01" value={h}
          onChange={(e) => setH(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: C.blue, height: 24 }} />
        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 10.5, color: C.ink3, marginTop: 2, marginBottom: 14 }}>
          <span>{min} m</span><span>{max} m</span>
        </div>
        <Bar pct={pctOf(h)} tone={active ? active.tone : C.gray} h={9} />

        {active ? (
          <div style={{ marginTop: 14 }}>
            <p style={{ ...mono, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", margin: "0 0 5px", color: active.tone, fontWeight: 600 }}>
              {active.label}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{active.body}</p>
          </div>
        ) : (
          <p style={{ margin: "14px 0 0", fontSize: 14, color: C.ink2 }}>Below the minor flood level — the river is within its banks.</p>
        )}
      </div>

      <p style={{ ...mono, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: C.ink2, margin: "22px 0 12px", fontWeight: 600 }}>
        Recorded peaks, last five years
      </p>
      {PEAKS.map((p) => (
        <div key={p.yr} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
            <span style={{ ...sys, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{p.yr}</span>
            <span style={{ ...mono, fontSize: 12, color: C.ink2 }}>
              N. Richmond <strong style={{ color: C.ink }}>{p.nr.toFixed(2)} m</strong> · Windsor {p.wd.toFixed(2)} m
            </span>
          </div>
          <Bar pct={pctOf(p.nr)} tone={C.blue} />
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: C.ink2, lineHeight: 1.45 }}>{p.note}</p>
        </div>
      ))}

      <div style={{ background: C.bg, borderRadius: 12, padding: "13px 14px", marginTop: 4 }}>
        <p style={{ margin: 0, fontSize: 12.5, color: C.ink2, lineHeight: 1.55 }}>
          The valley's largest flood on record reached <strong style={{ color: C.ink }}>19.68 m at the Windsor gauge in June 1867</strong>. North Richmond's own record doesn't extend back that far — but NSW SES estimates a repeat of that scale would require more than <strong style={{ color: C.ink }}>90,000 people</strong> across the Hawkesbury–Nepean valley to evacuate.
        </p>
      </div>

      <GapNote>
        Not yet available: the specific gauge height at which each individual street floods, and floor levels for individual properties. Those come from Hawkesbury City Council flood study data and property survey — not from gauge records.
      </GapNote>

      <p style={{ ...mono, fontSize: 10, color: C.ink3, marginTop: 16, lineHeight: 1.6 }}>
        Bureau of Meteorology gauge network (North Richmond WPS, station 567098) · NSW SES emergency warnings · NSW SES Hawkesbury–Nepean flood information
      </p>
    </div>
  );
}

/* ---------------- BUSHFIRE detail ---------------- */
function FireDetail({ street }) {
  const [open, setOpen] = useState(null);
  const cats = [
    { k: "1", t: "Category 1", buf: "100 m buffer", d: "Forest, woodland or heath capable of supporting a high-intensity fire with significant ember attack. Attracts the largest asset protection zones under Planning for Bush Fire Protection." },
    { k: "2", t: "Category 2", buf: "30 m buffer", d: "Rainforest and lower-risk vegetation with active land management that reduces bush fire risk. Still triggers bushfire-compliant construction requirements for new development." },
    { k: "3", t: "Category 3", buf: "30 m buffer", d: "Grasslands, freshwater wetlands and semi-arid woodland — explicitly including unmanaged grassland such as ungrazed or rested pasture. Actively managed cropping and grazing land is generally excluded from mapping altogether." },
  ];
  return (
    <div style={{ paddingTop: 16 }}>
      <p style={{ margin: "0 0 14px", fontSize: 14.5, color: C.ink, lineHeight: 1.55 }}>
        This floodplain is a working mix of cropping paddocks, grazing land and river corridor. Under the certified NSW methodology, actively managed agricultural land is usually excluded from Bush Fire Prone Land mapping — but unmanaged pasture, and the vegetation along the riverbank itself, can still be mapped as Category 3 or fall inside a buffer.
      </p>
      <p style={{ margin: "0 0 14px", fontSize: 14.5, color: C.ink, lineHeight: 1.55 }}>
        That matters here specifically: grassfire moves fast across cleared floodplain land like {street.n}, and that risk is often <em>not</em> captured by Bush Fire Prone Land mapping, which is built around vegetation categories and development control. A "not mapped" result is not the same as "no fire risk."
      </p>

      <p style={{ ...mono, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: C.ink2, margin: "18px 0 4px", fontWeight: 600 }}>
        Vegetation categories — tap to expand
      </p>
      {cats.map((c) => (
        <div key={c.k} style={{ borderTop: `1px solid ${C.lineSoft}` }}>
          <button onClick={() => setOpen(open === c.k ? null : c.k)}
            style={{ width: "100%", textAlign: "left", background: "none", border: 0, padding: "12px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", ...sys }}>
            <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: C.ink }}>{c.t}</span>
              <span style={{ ...mono, fontSize: 11, color: C.ink3 }}>{c.buf}</span>
            </span>
            <span style={{ color: C.ink3 }}><ChevronIcon open={open === c.k} /></span>
          </button>
          {open === c.k && (
            <p style={{ margin: "0 0 14px", fontSize: 13.5, color: C.ink2, lineHeight: 1.55 }}>{c.d}</p>
          )}
        </div>
      ))}

      <GapNote>
        Not yet available: the exact Bush Fire Prone Land category, if any, that applies to this specific street frontage. Confirming that means a point query against Hawkesbury City Council's certified map — a live wiring task, not a data-access problem, since the dataset is open via data.nsw.gov.au.
      </GapNote>

      <p style={{ ...mono, fontSize: 10, color: C.ink3, marginTop: 16, lineHeight: 1.6 }}>
        NSW Bush Fire Prone Land, certified by the NSW RFS Commissioner, data.nsw.gov.au · NSW RFS Guide for Bush Fire Prone Land Mapping
      </p>
    </div>
  );
}

/* ---------------- HEAT detail ---------------- */
function HeatDetail() {
  const [view, setView] = useState("official");
  const data = {
    official: {
      lead: "What the nearest official station records",
      body: "Richmond RAAF (BoM station 067105) is the closest long-run station, roughly 3 km from Richmond Lowlands. It's the source almost every heat map in this region relies on.",
      stat: "Days ≥35°C and ≥40°C per year: extractable from BoM Climate Data Online, not yet compiled here.",
      tag: "g",
    },
    measured: {
      lead: "What sensors on the ground actually record",
      body: "Western Sydney University research comparing 274 urban microsites against official stations found official readings substantially understate local heat. In the Cumberland LGA, loggers recorded 32 hot days (≥35°C) and 15 extreme days (≥40°C) against 7 and 1 at the nearest official station.",
      stat: "Official stations can understate extreme heat days by an order of magnitude at street level.",
      tag: "v",
    },
    canopy: {
      lead: "Canopy cover and heat vulnerability, Hawkesbury LGA",
      body: "Across the whole Hawkesbury LGA, tree canopy covers 47.5% of the area (2024–25) — one of the higher shares in Greater Sydney. But it's unevenly spread: the NSW Government's Heat Vulnerability Index, built from demographics, canopy cover and land surface temperature together, rates around 15% of Hawkesbury neighbourhoods as high vulnerability, 47% as moderate, and 38% as low. This is LGA-wide data — Richmond Lowlands and Cornwallis are open floodplain, not the built-up areas the index is calibrated around, so a score for this specific area isn't published yet.",
      stat: "47.5% LGA-wide canopy cover · 15% of neighbourhoods rated high heat vulnerability.",
      tag: "v",
    },
    ahead: {
      lead: "Where this is heading",
      body: "Australia Institute HeatWatch modelling projects Penrith — the nearest comparable inland station — could see up to 58 days a year above 35°C by 2090 without strong emissions reduction. WSU work suggests Western Sydney could reach 35°C or above on as many as 160 days a year by 2060 on current trajectories.",
      stat: "Heat is the only one of these three hazards that gets structurally worse every decade.",
      tag: "v",
    },
  };
  const d = data[view];
  const tabs = [["official", "Official"], ["measured", "Measured"], ["canopy", "Canopy & HVI"], ["ahead", "Projected"]];

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 11, padding: 4, marginBottom: 16 }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setView(k)}
            style={{
              flex: 1, ...sys, fontSize: 12.5, fontWeight: 600, padding: "8px 4px", cursor: "pointer", border: 0, borderRadius: 8,
              background: view === k ? C.surface : "transparent",
              color: view === k ? C.ink : C.ink2,
              boxShadow: view === k ? "0 1px 3px rgba(0,0,0,.12)" : "none",
              transition: "background .2s, box-shadow .2s",
            }}>
            {label}
          </button>
        ))}
      </div>

      <p style={{ ...mono, fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: C.ink2, margin: "0 0 6px", fontWeight: 600 }}>{d.lead}</p>
      <p style={{ margin: "0 0 14px", fontSize: 14.5, color: C.ink, lineHeight: 1.55 }}>{d.body}</p>
      <div style={{ fontSize: 14.5, fontWeight: 600, margin: 0, padding: "13px 14px", background: C.amberTint, borderRadius: 12, color: C.ink }}>
        {d.stat}
      </div>
      <div style={{ marginTop: 12 }}>
        <SourceTag kind={d.tag} />
      </div>

      <p style={{ ...mono, fontSize: 10, color: C.ink3, marginTop: 18, lineHeight: 1.6 }}>
        Bureau of Meteorology · Western Sydney University urban heat research · NSW Dept of Planning, Housing &amp; Infrastructure (Greener Neighbourhoods canopy &amp; HVI data) · Australia Institute HeatWatch
      </p>
    </div>
  );
}

/* ---------------- APP ---------------- */
export default function HazardLookup() {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(null);
  const [openCard, setOpenCard] = useState("flood");

  const matches = query.trim().length > 0
    ? STREETS.filter((s) => (s.n + " " + s.s).toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  function selectStreet(s) {
    setSel(s);
    setQuery(s.n);
    setOpenCard("flood");
  }

  return (
    <div style={{ background: C.bg, color: C.ink, ...sys, minHeight: "100%", paddingBottom: 60 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 18px" }}>

        <header style={{ padding: "36px 0 24px", display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: "linear-gradient(160deg, #0A84FF 0%, #30B94D 55%, #FF9500 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            boxShadow: "0 4px 14px rgba(10,132,255,.25)",
          }}>
            <PinIconLarge />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: C.ink2 }}>Hazard Lookup</p>
            <p style={{ margin: "1px 0 0", fontSize: 12, color: C.ink3 }}>Cornwallis &amp; Richmond Lowlands · Stage-one prototype</p>
          </div>
        </header>

        <h1 style={{ fontWeight: 700, fontSize: "clamp(26px,6vw,34px)", lineHeight: 1.15, letterSpacing: "-.02em", margin: "0 0 8px", textWrap: "balance" }}>
          What is your street exposed to?
        </h1>
        <p style={{ margin: "0 0 22px", color: C.ink2, fontSize: 15, lineHeight: 1.5, maxWidth: "42ch" }}>
          Flood, bushfire and heat risk for one address — from published sources, with an honest flag wherever the record runs out.
        </p>

        <section>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: C.ink3, pointerEvents: "none" }}>
              <SearchIcon />
            </span>
            <input type="text" value={query}
              onChange={(e) => { setQuery(e.target.value); setSel(null); }}
              placeholder="Search a street — Cornwallis Road, Bensons Lane…"
              style={{
                width: "100%", fontSize: 16, padding: "14px 16px 14px 42px", borderRadius: 14, border: `1px solid ${C.line}`,
                background: C.surface, color: C.ink, fontFamily: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,.03)",
                outline: "none",
              }} />
          </div>

          {matches.length > 0 && !sel && (
            <div style={{ marginTop: 8, background: C.surface, borderRadius: 14, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 8px 20px rgba(0,0,0,.06)", overflow: "hidden" }}>
              {matches.map((s, i) => (
                <button key={s.n} onClick={() => selectStreet(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "12px 15px",
                    background: "none", border: 0, borderTop: i ? `1px solid ${C.lineSoft}` : "none", cursor: "pointer", fontSize: 14.5, fontFamily: "inherit", color: C.ink,
                  }}>
                  <span style={{ color: C.ink3, flexShrink: 0 }}><PinIcon /></span>
                  {s.n} <span style={{ ...mono, fontSize: 11.5, color: C.ink3 }}>· {s.s}</span>
                </button>
              ))}
            </div>
          )}

          {!sel && query.trim() && matches.length === 0 && (
            <p style={{ color: C.red, fontSize: 13.5, margin: "10px 2px 0" }}>
              Not in the current street set — this prototype covers the streets named in the SES flood warning area for Cornwallis and eastern Richmond Lowlands.
            </p>
          )}

          {!query.trim() && (
            <div style={{ marginTop: 20 }}>
              <p style={{ ...mono, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: C.ink2, margin: "0 0 10px", fontWeight: 600 }}>
                All streets in this area
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {STREETS.map((s) => (
                  <button key={s.n} onClick={() => selectStreet(s)}
                    style={{ fontSize: 13, fontWeight: 500, padding: "8px 13px", borderRadius: 20, border: `1px solid ${C.line}`, background: C.surface, color: C.ink2, cursor: "pointer", fontFamily: "inherit" }}>
                    {s.n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {sel && (
          <section style={{ paddingTop: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 23, fontWeight: 700, margin: "0 0 2px", letterSpacing: "-.01em" }}>{sel.n}</h2>
              <p style={{ ...mono, fontSize: 12, color: C.ink2, margin: 0 }}>{sel.s} · Hawkesbury LGA · NSW 2753</p>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <HazardCard
                icon={<DropletIcon />} color={C.blue} tint={C.blueTint}
                title="Flood" summary="Named in the April 2024 Evacuate Now order"
                chip="History" open={openCard === "flood"} onToggle={() => setOpenCard(openCard === "flood" ? null : "flood")}>
                <FloodDetail street={sel} />
              </HazardCard>

              <HazardCard
                icon={<FlameIcon />} color={C.red} tint={C.redTint}
                title="Bushfire" summary="Cleared floodplain — mapping not yet queried"
                chip="Partial data" open={openCard === "fire"} onToggle={() => setOpenCard(openCard === "fire" ? null : "fire")}>
                <FireDetail street={sel} />
              </HazardCard>

              <HazardCard
                icon={<SunIcon />} color={C.amber} tint={C.amberTint}
                title="Heat" summary="LGA canopy &amp; vulnerability data available"
                chip="LGA data" open={openCard === "heat"} onToggle={() => setOpenCard(openCard === "heat" ? null : "heat")}>
                <HeatDetail />
              </HazardCard>
            </div>

            <div style={{ marginTop: 18, padding: "15px 16px", borderRadius: 14, background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
              <div style={{ display: "flex", gap: 9 }}>
                <span style={{ color: C.ink3, flexShrink: 0, marginTop: 1 }}><InfoIcon /></span>
                <p style={{ margin: 0, fontSize: 12.5, color: C.ink2, lineHeight: 1.55 }}>
                  <strong style={{ color: C.ink }}>How to read this.</strong> Every figure here is sourced at the foot of its section. <em>Published source</em> means SES warnings, BoM gauge records or peer-reviewed research. <em>Not yet connected</em> means the data exists publicly but isn't wired into this prototype yet — that gap is the point of a stage-one build, not a flaw in it. Nothing here replaces a 10.7 planning certificate from Hawkesbury City Council.
                </p>
              </div>
            </div>
          </section>
        )}

        <footer style={{ marginTop: 40, paddingTop: 18, borderTop: `1px solid ${C.lineSoft}`, ...mono, fontSize: 11, color: C.ink3, lineHeight: 1.7 }}>
          Stage-one prototype · Hawkesbury–Nepean Community Resilience Platform<br />
          Street list drawn from the NSW SES Evacuate Now order of 6 April 2024 for Cornwallis and eastern Richmond Lowlands.
        </footer>
      </div>
    </div>
  );
}

function PinIconLarge() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6.5-7-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 14 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.1" />
    </svg>
  );
}
