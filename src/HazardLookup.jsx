import React, { useState } from "react";

const C = {
  ink: "#16211D", silt: "#C3B79C", river: "#3E6374", paper: "#F3F0E7",
  paper2: "#E8E3D5", flood: "#C77E1E", fire: "#A83E27", canopy: "#5F7F4F",
  rule: "rgba(22,33,29,.16)", verified: "#3E6374", gap: "#A83E27",
};
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
const display = { fontFamily: "'Space Grotesk','Segoe UI',system-ui,sans-serif" };

/* ------------------------------------------------------------------
   STREETS — every street named in the NSW SES "Evacuate Now" order of
   6 April 2024 for Cornwallis and the eastern part of Richmond Lowlands.
   Source: NSW SES emergency warning AUREMER-c02c1bb7b7109e913cbf108519ac47e9
------------------------------------------------------------------ */
const STREETS = [
  { n: "Bensons Lane", s: "Cornwallis", w: true },
  { n: "Cornwallis Road", s: "Cornwallis", w: true },
  { n: "Cornwells Lane", s: "Cornwallis", w: true },
  { n: "Cupritts Lane", s: "Cornwallis", w: true },
  { n: "Gow Lane", s: "Cornwallis", w: true },
  { n: "Ingolds Lane", s: "Richmond Lowlands", w: true },
  { n: "Old Kurrajong Road", s: "Richmond Lowlands", w: true },
  { n: "Onus Lane", s: "Cornwallis", w: true },
  { n: "Percival Street", s: "Richmond Lowlands", w: true },
  { n: "Powells Lane", s: "Richmond Lowlands", w: true },
  { n: "Ridges Lane", s: "Cornwallis", w: true },
  { n: "Triangle Lane", s: "Cornwallis", w: true },
  { n: "Kurrajong Road", s: "Richmond Lowlands", w: true },
  { n: "Francis Street (rear)", s: "Richmond Lowlands", w: true },
  { n: "Dight Street (rear)", s: "Richmond Lowlands", w: true },
];

/* Windsor gauge (PWD). Classification levels published by BoM/NSW SES. */
const WINDSOR = { minor: 5.8, moderate: 7.0, major: 12.2 };

/* Recorded peaks, Hawkesbury River. Windsor gauge unless noted. */
const PEAKS = [
  { yr: "Mar 2021", nr: 14.38, wd: 12.93, note: "North Richmond peaked at 14.38 m." },
  { yr: "Mar 2022", nr: 14.08, wd: 13.80, note: "Windsor peaked ~1 m above March 2021 — highest since 1978." },
  { yr: "Jul 2022", nr: 14.19, wd: 13.93, note: "Two near-identical peaks at North Richmond, 24 hours apart." },
  { yr: "Apr 2024", nr: null, wd: 7.0, note: "Moderate flooding. Evacuate Now order issued for these streets." },
];

const GAUGE_STEPS = [
  { h: 5.8, label: "Minor flood level, Windsor", body: "Low-lying paddocks and riverbank land begin to flood. In April 2024 the SES issued the Evacuate Now order for Cornwallis and eastern Richmond Lowlands as the river was rising toward this level — before it had even reached moderate.", tone: C.flood },
  { h: 7.0, label: "Moderate flood level, Windsor", body: "The trigger at which these streets were directed to evacuate in April 2024. Residents were told to proceed on available roads to Richmond. This is the practical deadline for leaving with a vehicle and animals.", tone: C.flood },
  { h: 12.2, label: "Major flood level, Windsor", body: "Widespread inundation across the floodplain. Evacuation routes across the valley are compromised. Anyone still in the area is likely isolated.", tone: C.fire },
  { h: 12.93, label: "March 2021 peak", body: "North Richmond reached 14.38 m. Extensive inundation across the Richmond–Windsor floodplain.", tone: C.fire },
  { h: 13.93, label: "July 2022 peak", body: "Windsor exceeded the March 2022 level. North Richmond peaked twice at 14.18 m and 14.19 m within a day.", tone: C.fire },
  { h: 19.0, label: "1867 flood — the valley's largest on record", body: "Around 19 m above normal river height at Windsor. If repeated today, NSW SES estimates more than 90,000 people would need to evacuate.", tone: C.ink },
];

function Bar({ pct, tone, h = 8 }) {
  return (
    <div style={{ background: C.paper2, height: h, width: "100%" }}>
      <div style={{ width: pct + "%", height: "100%", background: tone, transition: "width .7s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function Tag({ kind }) {
  const v = kind === "v";
  return (
    <span style={{ ...mono, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 6px", border: `1px solid ${v ? C.verified : C.gap}`, color: v ? C.verified : C.gap, whiteSpace: "nowrap" }}>
      {v ? "Published source" : "Data gap"}
    </span>
  );
}

/* ---------------- FLOOD: interactive gauge ---------------- */
function FloodSection({ street }) {
  const [h, setH] = useState(7.0);
  const active = [...GAUGE_STEPS].reverse().find((s) => h >= s.h);
  const pctOf = (v) => (v / 20) * 100;

  return (
    <div style={{ border: `1px solid ${C.rule}`, borderLeft: `3px solid ${C.flood}`, background: "#fff", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ ...mono, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", margin: 0, color: C.river }}>Flood</h3>
        <Tag kind="v" />
      </div>

      <p style={{ ...display, fontWeight: 700, fontSize: 21, margin: "10px 0 4px", letterSpacing: "-.01em" }}>
        Among the first areas evacuated
      </p>
      <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "#3A4741" }}>
        {street.n} was named in the NSW SES Evacuate Now order of 6 April 2024 — issued while the Hawkesbury at Windsor was still only approaching moderate flooding. On this floodplain the decision point arrives long before the water does.
      </p>

      {/* interactive gauge */}
      <label htmlFor="gauge" style={{ ...mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.river, display: "block", marginBottom: 8 }}>
        Drag the river height — Hawkesbury at Windsor
      </label>
      <input id="gauge" type="range" min="4" max="20" step="0.1" value={h}
        onChange={(e) => setH(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: C.river }} />
      <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 10.5, color: "#6B7770", marginTop: 2 }}>
        <span>4 m</span><span>12 m</span><span>20 m</span>
      </div>

      <div style={{ ...display, fontSize: 34, fontWeight: 700, letterSpacing: "-.02em", margin: "14px 0 2px" }}>
        {h.toFixed(1)} m
      </div>
      <div style={{ marginBottom: 12 }}>
        <Bar pct={pctOf(h)} tone={active ? active.tone : C.silt} h={10} />
      </div>

      {active ? (
        <div style={{ background: C.paper2, padding: "13px 15px", borderLeft: `3px solid ${active.tone}` }}>
          <p style={{ ...mono, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", margin: "0 0 6px", color: active.tone }}>
            {active.label}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#3A4741", lineHeight: 1.5 }}>{active.body}</p>
        </div>
      ) : (
        <div style={{ background: C.paper2, padding: "13px 15px" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#3A4741" }}>Below the minor flood level. The river is within its banks.</p>
        </div>
      )}

      {/* recorded peaks */}
      <p style={{ ...mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.river, margin: "22px 0 10px" }}>
        Recorded peaks, last five years
      </p>
      {PEAKS.map((p) => (
        <div key={p.yr} style={{ marginBottom: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 12, marginBottom: 3 }}>
            <span>{p.yr}</span>
            <span style={{ color: C.river }}>
              Windsor {p.wd.toFixed(2)} m{p.nr ? ` · Nth Richmond ${p.nr.toFixed(2)} m` : ""}
            </span>
          </div>
          <Bar pct={(p.wd / 20) * 100} tone={C.river} />
          <p style={{ margin: "5px 0 0", fontSize: 12.5, color: "#5A6660" }}>{p.note}</p>
        </div>
      ))}

      <p style={{ ...mono, fontSize: 10.5, color: "#6B7770", marginTop: 14, paddingTop: 10, borderTop: `1px solid ${C.rule}` }}>
        NSW SES emergency warnings · Bureau of Meteorology gauge records · SES Hawkesbury–Nepean flood information
      </p>
      <p style={{ fontSize: 12.5, color: C.gap, marginTop: 8 }}>
        Not yet available: the specific gauge height at which each individual street floods, and floor levels for individual properties. Those come from Hawkesbury City Council flood study data and property survey.
      </p>
    </div>
  );
}

/* ---------------- BUSHFIRE ---------------- */
function FireSection({ street }) {
  const [open, setOpen] = useState(null);
  const cats = [
    { k: "1", t: "Category 1", d: "Forest, woodland or heath capable of supporting a high-intensity fire with significant ember attack. Attracts the largest asset protection zones under Planning for Bush Fire Protection." },
    { k: "2", t: "Category 2", d: "Rainforest, lower-risk vegetation types, and some grasslands. Still triggers bushfire-compliant construction requirements for new development." },
    { k: "3", t: "Category 3", d: "Vegetation capable of supporting lower-intensity fire, including some grassland and managed land." },
    { k: "B", t: "Buffer", d: "Land within 100 m of Category 1, or 30 m of Category 2 or 3 vegetation. Ember attack is the main risk here, not direct flame contact." },
  ];
  return (
    <div style={{ border: `1px solid ${C.rule}`, borderLeft: `3px solid ${C.fire}`, background: "#fff", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ ...mono, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", margin: 0, color: C.river }}>Bushfire</h3>
        <Tag kind="g" />
      </div>

      <p style={{ ...display, fontWeight: 700, fontSize: 21, margin: "10px 0 4px", letterSpacing: "-.01em" }}>
        Needs the live mapping to answer
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 14.5, color: "#3A4741" }}>
        Whether {street.n} sits on mapped Bush Fire Prone Land is a matter of public record — it just isn't in this prototype yet. The dataset is certified by the NSW RFS Commissioner and published through data.nsw.gov.au with an open API. Wiring it in is a build task, not a data-access problem.
      </p>

      <p style={{ margin: "0 0 12px", fontSize: 14.5, color: "#3A4741" }}>
        One thing worth naming regardless: this floodplain is cleared grazing and cropping land. Grassfire moves fast across it and is often <em>not</em> captured by Bush Fire Prone Land mapping, which is built around vegetation categories and development control. A "not mapped" result is not the same as "no fire risk."
      </p>

      <p style={{ ...mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.river, margin: "18px 0 9px" }}>
        What the categories mean — tap to expand
      </p>
      {cats.map((c) => (
        <div key={c.k} style={{ borderTop: `1px solid ${C.rule}` }}>
          <button onClick={() => setOpen(open === c.k ? null : c.k)}
            style={{ width: "100%", textAlign: "left", background: "none", border: 0, padding: "11px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", ...display, fontSize: 14.5, color: C.ink }}>
            <span>{c.t}</span>
            <span style={{ ...mono, fontSize: 16, color: C.river }}>{open === c.k ? "–" : "+"}</span>
          </button>
          {open === c.k && (
            <p style={{ margin: "0 0 13px", fontSize: 13.5, color: "#3A4741", lineHeight: 1.5 }}>{c.d}</p>
          )}
        </div>
      ))}

      <p style={{ ...mono, fontSize: 10.5, color: "#6B7770", marginTop: 14, paddingTop: 10, borderTop: `1px solid ${C.rule}` }}>
        NSW Bush Fire Prone Land, data.nsw.gov.au · NSW RFS Planning for Bush Fire Protection
      </p>
    </div>
  );
}

/* ---------------- HEAT ---------------- */
function HeatSection() {
  const [view, setView] = useState("official");
  const data = {
    official: {
      lead: "What the nearest official station records",
      body: "Richmond RAAF (BoM station 067105) is the closest long-run station, roughly 3 km from Richmond Lowlands. It is the source almost every heat map in this region relies on.",
      stat: "Days ≥35°C and ≥40°C per year: extractable from BoM Climate Data Online, not yet compiled here.",
      tag: "g",
    },
    measured: {
      lead: "What sensors on the ground actually record",
      body: "Western Sydney University research comparing 274 urban microsites against official stations found official readings substantially understate local heat. In the Cumberland LGA, loggers recorded 32 hot days (≥35°C) and 15 extreme days (≥40°C) against 7 and 1 at the nearest official station.",
      stat: "Official stations can understate extreme heat days by an order of magnitude at street level.",
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
  const tabs = [["official", "Official station"], ["measured", "Measured on the ground"], ["ahead", "Projected"]];

  return (
    <div style={{ border: `1px solid ${C.rule}`, borderLeft: `3px solid ${C.canopy}`, background: "#fff", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ ...mono, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", margin: 0, color: C.river }}>Heat</h3>
        <Tag kind={d.tag} />
      </div>

      <p style={{ ...display, fontWeight: 700, fontSize: 21, margin: "10px 0 14px", letterSpacing: "-.01em" }}>
        The number depends on who measured it
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setView(k)}
            style={{ ...mono, fontSize: 11.5, padding: "7px 11px", cursor: "pointer",
              border: `1px solid ${view === k ? C.ink : C.rule}`,
              background: view === k ? C.ink : "transparent",
              color: view === k ? C.paper : "#3A4741" }}>
            {label}
          </button>
        ))}
      </div>

      <p style={{ ...mono, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.river, margin: "0 0 7px" }}>{d.lead}</p>
      <p style={{ margin: "0 0 12px", fontSize: 14.5, color: "#3A4741", lineHeight: 1.55 }}>{d.body}</p>
      <p style={{ ...display, fontSize: 15, fontWeight: 500, margin: 0, padding: "12px 14px", background: C.paper2, borderLeft: `3px solid ${C.canopy}`, color: C.ink }}>
        {d.stat}
      </p>

      <p style={{ ...mono, fontSize: 10.5, color: "#6B7770", marginTop: 16, paddingTop: 10, borderTop: `1px solid ${C.rule}` }}>
        Bureau of Meteorology · Western Sydney University urban heat research · Australia Institute HeatWatch
      </p>
    </div>
  );
}

/* ---------------- APP ---------------- */
export default function HazardLookup() {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(null);

  const matches = query.trim().length > 0
    ? STREETS.filter((s) => (s.n + " " + s.s).toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  return (
    <div style={{ background: C.paper, color: C.ink, fontFamily: "'IBM Plex Sans','Segoe UI',system-ui,sans-serif", minHeight: "100%", paddingBottom: 44 }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px" }}>

        <header style={{ borderBottom: `1px solid ${C.rule}`, padding: "28px 0 22px" }}>
          <p style={{ ...mono, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.river, margin: "0 0 10px" }}>
            Prototype · Cornwallis &amp; Richmond Lowlands
          </p>
          <h1 style={{ ...display, fontWeight: 700, fontSize: "clamp(29px,5vw,46px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "0 0 12px", maxWidth: "17ch" }}>
            What is your street exposed to?
          </h1>
          <p style={{ margin: 0, maxWidth: "58ch", color: "#3A4741", fontSize: 15.5 }}>
            Flood, bushfire and heat for one address, from published sources — and an honest marker wherever the public record runs out.
          </p>
        </header>

        <section style={{ padding: "24px 0 4px" }}>
          <label htmlFor="q" style={{ ...mono, display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: C.river, marginBottom: 8 }}>
            Street
          </label>
          <input id="q" type="text" value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(null); }}
            placeholder="Start typing — Cornwallis Road, Bensons Lane…"
            style={{ width: "100%", fontSize: 16, padding: "13px 15px", border: `1px solid ${C.rule}`, background: "#fff", color: C.ink, fontFamily: "inherit" }} />

          {matches.length > 0 && !sel && (
            <div style={{ border: `1px solid ${C.rule}`, borderTop: 0, background: "#fff" }}>
              {matches.map((s) => (
                <button key={s.n} onClick={() => { setSel(s); setQuery(s.n); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 15px", background: "none", border: 0, borderBottom: `1px solid ${C.rule}`, cursor: "pointer", fontSize: 14.5, fontFamily: "inherit", color: C.ink }}>
                  {s.n} <span style={{ ...mono, fontSize: 11.5, color: "#6B7770" }}>· {s.s}</span>
                </button>
              ))}
            </div>
          )}

          {!sel && query.trim() && matches.length === 0 && (
            <p style={{ color: C.fire, fontSize: 14, margin: "12px 0 0" }}>
              Not in the current street set. This prototype covers the streets named in the SES flood warning area for Cornwallis and eastern Richmond Lowlands.
            </p>
          )}

          {!query.trim() && (
            <div style={{ marginTop: 14 }}>
              <p style={{ ...mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.river, margin: "0 0 9px" }}>
                All streets in this area
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STREETS.map((s) => (
                  <button key={s.n} onClick={() => { setSel(s); setQuery(s.n); }}
                    style={{ ...mono, fontSize: 11.5, padding: "6px 10px", border: `1px solid ${C.rule}`, background: "transparent", color: "#3A4741", cursor: "pointer" }}>
                    {s.n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {sel && (
          <section style={{ padding: "22px 0 0" }}>
            <div style={{ borderTop: `1px solid ${C.ink}`, paddingTop: 14, marginBottom: 18 }}>
              <h2 style={{ ...display, fontSize: 24, margin: "0 0 3px", letterSpacing: "-.01em" }}>{sel.n}</h2>
              <p style={{ ...mono, fontSize: 12, color: "#5A6660", margin: 0 }}>{sel.s} · Hawkesbury LGA · NSW 2753</p>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <FloodSection street={sel} />
              <FireSection street={sel} />
              <HeatSection />
            </div>

            <div style={{ margin: "26px 0 0", padding: "16px 18px", border: `1px solid ${C.rule}`, background: C.paper2, fontSize: 13.5, color: "#3A4741", lineHeight: 1.55 }}>
              <strong style={display}>How to read the tags.</strong> Every claim here carries a marker. <em>Published source</em> means it comes from SES warnings, BoM records or peer-reviewed research, cited at the foot of each section. <em>Data gap</em> means the information exists but isn't yet connected — that gap is the point of this prototype, not a flaw in it. Nothing here replaces a 10.7 planning certificate from Hawkesbury City Council.
            </div>
          </section>
        )}

        <footer style={{ borderTop: `1px solid ${C.rule}`, marginTop: 30, paddingTop: 18, ...mono, fontSize: 11.5, color: "#6B7770", lineHeight: 1.65 }}>
          Stage-one prototype · Hawkesbury–Nepean Community Resilience Platform<br />
          Street list drawn from the NSW SES Evacuate Now order of 6 April 2024 for Cornwallis and eastern Richmond Lowlands.
        </footer>
      </div>
    </div>
  );
}
