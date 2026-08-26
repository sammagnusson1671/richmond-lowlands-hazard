import React, { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   KNOW YOUR PLACE
   Design direction: the instruments of this valley.
   Flood marker post · fire danger dial · temperature scale.
   Palette drawn from gauge plates, silt water and roadside signage.
   ═══════════════════════════════════════════════════════════ */

const C = {
  ink:       "#0A1C2B",   // gauge plate, near-black blue
  ink80:     "#33475A",
  ink50:     "#7A8B99",
  ink25:     "#B9C4CC",
  hair:      "#DFE6EA",
  wash:      "#F1F5F7",
  page:      "#FFFFFF",
  water:     "#1B6E8C",
  waterWash: "#E4EFF3",
  silt:      "#A8721C",   // floodwater ochre
  siltWash:  "#F8F0DF",
  fire:      "#B93E24",
  fireWash:  "#F9EAE6",
  ember:     "#7A2350",
  emberWash: "#F5E9EF",
  go:        "#2A6A50",
  goWash:    "#E8F1EC",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Karla:wght@400;500;600;700&display=swap');
`;

const disp = { fontFamily: "'Fraunces',Georgia,serif" };
const body = { fontFamily: "'Karla','Segoe UI',system-ui,sans-serif" };

/* ═══════════════════════════ data ═══════════════════════════ */

const STREETS = ["Bensons Lane","Cornwallis Road","Cornwells Lane","Cupritts Lane","Gow Lane","Ingolds Lane","Old Kurrajong Road","Onus Lane","Percival Street","Powells Lane","Ridges Lane","Triangle Lane","Kurrajong Road","Francis Street","Dight Street"];
const SUBURB_OF = (s) =>
  ["Bensons Lane","Cornwallis Road","Cornwells Lane","Cupritts Lane","Gow Lane","Onus Lane","Ridges Lane","Triangle Lane"].includes(s) ? "Cornwallis" : "Richmond Lowlands";

/* One gauge only — Windsor. Mixing gauges on a single post would mislead. */
const MARKS = [
  { m: 5.8,  label: "Minor flood",       year: null,   tone: C.water, wash: C.waterWash, level: "locality",
    head: "The river leaves its banks",
    body: "Official minor flood classification for the Hawkesbury at Windsor. Low-lying paddocks and riverbank land begin to go under.",
    local: "In April 2024 the SES issued its Evacuate Now order for this area while the river was still only forecast to pass this mark." },
  { m: 7.0,  label: "Moderate flood",    year: "2024", tone: C.silt,  wash: C.siltWash,  level: "street", key: true,
    head: "You were told to leave",
    body: "Official moderate flood classification.",
    local: "Your street was named in the SES Evacuate Now area on 6 April 2024. Residents were directed to proceed on available roads to Richmond. Note where this sits on the post — barely a third of the way up. Leaving the floodplain has to happen long before the water looks serious." },
  { m: 12.2, label: "Major flood",       year: null,   tone: C.fire,  wash: C.fireWash,  level: "regional",
    head: "The valley is in trouble",
    body: "Official major flood classification at Windsor. Widespread inundation across the Richmond–Windsor floodplain and heavy pressure on evacuation routes throughout the valley.",
    local: "Anyone still on the floodplain at this point is likely to be isolated." },
  { m: 13.9, label: "2022 floods",       year: "2022", tone: C.fire,  wash: C.fireWash,  level: "regional",
    head: "Twice in one year",
    body: "Windsor peaked at 13.80 m in March 2022 — the highest there since 1978 — then higher again at 13.93 m in July.",
    local: "At North Richmond the July event peaked twice inside 24 hours, at 14.18 m and 14.19 m. The March 2021 flood reached 14.38 m at North Richmond." },
  { m: 19.0, label: "1867",              year: "1867", tone: C.ink,   wash: C.wash,      level: "regional",
    head: "The mark everything is measured against",
    body: "The largest flood since European settlement reached around 19 m above normal river height at Windsor. Thirteen lives were lost.",
    local: "NSW SES estimates a flood of this scale today would require more than 90,000 people to evacuate." },
];

const FLOOD_THREE = [
  { t: "Inundation", q: "Could water enter the land or the house?",
    a: "Not answerable at this address yet. It needs a surveyed floor level in metres AHD and council flood model data. Neither is public at property level.", lvl: "gap", tone: C.ink50 },
  { t: "Isolation", q: "Could you be cut off even if the house stays dry?",
    a: "Yes. This street sits inside the SES flood warning area for Cornwallis and eastern Richmond Lowlands, where road access goes well before peak flood heights.", lvl: "street", tone: C.silt },
  { t: "Evacuation", q: "How early must you leave, and by which road?",
    a: "Early. In April 2024 residents here were directed to Richmond at moderate flooding — not major.", lvl: "street", tone: C.fire },
];

const FDR = [
  { r: "Moderate",     tone: C.go,    wash: C.goWash,    d: "Plan and prepare. Most fires can be controlled." },
  { r: "High",         tone: C.silt,  wash: C.siltWash,  d: "Be ready to act. Fires can be dangerous. Know what you'll do if one starts." },
  { r: "Extreme",      tone: C.fire,  wash: C.fireWash,  d: "Take action now to protect life and property. Fires will spread quickly and be extremely dangerous." },
  { r: "Catastrophic", tone: C.ember, wash: C.emberWash, d: "For your survival, leave bush fire risk areas. These are the conditions in which people die. Homes are not designed to withstand fires in these conditions." },
];

const BFPL = [
  { k: "Category 1", d: "Forest, woodland or heath capable of supporting a high-intensity fire with significant ember attack. Attracts the largest asset protection zones." },
  { k: "Category 2", d: "Rainforest and lower-risk vegetation. Still triggers bushfire-compliant construction for new development." },
  { k: "Category 3", d: "Vegetation supporting lower-intensity fire, including some grassland and managed land." },
  { k: "Buffer",     d: "Within 100 m of Category 1, or 30 m of Category 2 or 3. Ember attack rather than direct flame is the risk here." },
];

const HEAT_MARKS = [
  { t: 35, name: "Hot", tone: C.silt, wash: C.siltWash,
    d: "The standard threshold for a hot day in Australian urban heat research. Outdoor work becomes hazardous; unshaded surfaces climb fast.",
    extra: "Across Greater Sydney's record since 1859, 351 hot days fell in the first 120 years. The two decades from 2000 to 2020 produced 478 on their own." },
  { t: 40, name: "Extreme", tone: C.fire, wash: C.fireWash,
    d: "A direct health risk rather than a discomfort — particularly for older residents, young children, anyone with chronic illness, and anyone without power.",
    extra: "This is where the gap between official stations and street-level sensors matters most. The days people most need warning about are the days most likely to be missed." },
  { t: 45, name: "Catastrophic", tone: C.ember, wash: C.emberWash,
    d: "The upper threshold in Western Sydney University's heat research. Recorded at street level in Western Sydney where nearby official stations recorded none.",
    extra: "Surface temperature runs far above air temperature. Rubber playground surfaces in Western Sydney have been measured above 100°C." },
];

const HEAT_FACTS = [
  { v: "3+ days", k: "Defines a heatwave", lvl: "regional",
    d: "The Bureau of Meteorology defines a heatwave as three or more consecutive days where both daytime and overnight temperatures are unusually high for the local area. The overnight figure matters as much as the peak — the body needs the night to recover." },
  { v: "6°C", k: "Between nearby sites", lvl: "regional",
    d: "Air temperature measured at several hundred Western Sydney locations varied by up to 6°C between sites, and by more than 10°C on days of extreme heat. Two houses in one suburb do not experience the same heat." },
  { v: "25 days", k: "Missed by official stations", lvl: "regional",
    d: "Comparing 274 street-level sensors against official stations across four Western Sydney council areas found discrepancies of up to 25 days a year in the count of days above 35°C." },
  { v: "160 days", k: "Projected by 2060", lvl: "regional",
    d: "Western Sydney University projects maximum air temperatures in Western Sydney could reach 35°C or above on as many as 160 days a year by 2060 on current trajectories." },
];

const HEAT_LOCAL = [
  ["Canopy over and around the block", "The biggest lever at property scale. Trees cool by shade and by evaporation, and the research is clear that small trees given good growing conditions to build a large crown quickly deliver the most cooling."],
  ["Hard, dark surfaces", "Roofs, driveways and paving store heat through the day and release it overnight, which is what stops night temperatures falling. Dark roofs on small blocks are the worst combination."],
  ["Open cleared paddock", "This floodplain is largely cleared: high daytime exposure, little shade — though open rural land does cool faster overnight than dense suburbs."],
  ["Power reliability", "Extreme heat in a house without power is a different and far more serious problem. Ask about outage history before summer, not during it."],
];

/* Task 1 — Bureau of Meteorology Climate Data Online, station 067105 (Richmond RAAF).
   Blocked pending network access to bom.gov.au from the build environment — see README.
   No figures are populated here. Nothing below is invented, estimated or interpolated;
   the panel states plainly what would fill it and why it doesn't yet. */
const HEAT_STATION = {
  id: "067105",
  name: "Richmond RAAF",
  distanceKm: 3,
  available: false,
  blockedReason: "Network access to the Bureau of Meteorology's Climate Data Online service was not available from the environment this build ran in, so the daily record could not be retrieved and compiled.",
  needed: [
    "Daily maximum and minimum temperature series for station 067105, full period of record",
    "Compiled counts of days ≥35°C, ≥40°C and ≥45°C per year, last 30 years",
    "Heatwave events per year under the Bureau's three-or-more-consecutive-day definition",
    "Longest heatwave run, hottest recorded day and date, and the trend across the period",
  ],
};

const EVENTS = [
  { yr: "Oct 2019", t: "Gospers Mountain fire starts", tone: C.fire, d: "One lightning strike in inaccessible bushland north-west of here." },
  { yr: "Jan 2020", t: "Fire contained", tone: C.fire, d: "512,000+ hectares burnt across six local government areas including the Hawkesbury. Around 90 homes destroyed. Rain finally put it out in February." },
  { yr: "Mar 2021", t: "Major flood", tone: C.water, d: "North Richmond peaked at 14.38 m." },
  { yr: "Mar 2022", t: "Major flood", tone: C.water, d: "Windsor peaked at 13.80 m, the highest since 1978. North Richmond 14.08 m." },
  { yr: "Jul 2022", t: "Major flood", tone: C.water, d: "Windsor peaked at 13.93 m. North Richmond peaked twice inside a day, at 14.18 m and 14.19 m." },
  { yr: "Apr 2024", t: "Evacuate Now order", tone: C.silt, key: true, d: "This street was inside the evacuation area, at moderate flooding." },
];

const BUYING = [
  ["Flood history", "This street sits in an area the SES evacuated as recently as April 2024. Ask when the property was last inundated, and to what depth."],
  ["Floor level survey", "Ask whether a surveyed floor level exists in metres AHD. Without it, nobody can tell you at what river height water enters the house."],
  ["Council flood information", "Request a section 10.7 planning certificate and any flood-related development conditions from Hawkesbury City Council before exchange."],
  ["Isolation, not just inundation", "A dry house on a cut road is still a serious problem. Ask how long the property has previously been isolated."],
  ["Evacuation route", "Drive the route out. Ask which road the household would use, and where it has historically gone under."],
  ["Bush fire prone land status", "Confirm whether the land is mapped, and in which category. It governs what can be built, and to what standard."],
  ["Grassfire and fuel loads", "Ask neighbours about grassfire history and who manages fuel on adjoining paddocks. Mapping won't tell you this."],
  ["Canopy and orientation", "Established trees are worth real money in summer here. Note roof colour, shade over living areas, and how much hard surface surrounds the house."],
  ["Insurance quote before you commit", "Get a property-specific quote in writing before exchange — not an estimate, and not a quote for a nearby address."],
  ["Power reliability", "Ask about outage history. Both extreme heat and flood become far more dangerous without power."],
];

const SOURCES = [
  "NSW State Emergency Service — Evacuate Now order, 6 April 2024, Cornwallis and eastern Richmond Lowlands",
  "NSW SES — Hawkesbury–Nepean flood information, Richmond/Windsor floodplain guide",
  "Bureau of Meteorology — Hawkesbury River gauge records, Windsor and North Richmond",
  "Bureau of Meteorology — heatwave definition and heatwave service",
  "Bureau of Meteorology — Climate Data Online, station 067105 Richmond RAAF (not yet connected — see README)",
  "NSW Rural Fire Service — Australian Fire Danger Rating System; Gospers Mountain containment records",
  "Australian Disaster Resilience Knowledge Hub — Black Summer bushfires NSW 2019–20",
  "Pfautsch, Wujeska-Klause & Walters (2025), Weather and Climate Extremes",
  "The Australia Institute — HeatWatch: Extreme Heat in Western Sydney",
  "NSW RFS Bush Fire Prone Land mapping — not yet connected",
  "Hawkesbury City Council flood extent mapping — not yet connected",
];

/* ═══════════════════════════ atoms ═══════════════════════════ */

const LVL = {
  property: ["Property specific", C.go],
  street:   ["Street level", C.water],
  locality: ["Locality level", C.water],
  regional: ["Regional data", C.ink50],
  gap:      ["Not yet available", C.ink50],
};
function Lvl({ k }) {
  const l = LVL[k]; if (!l) return null;
  return (
    <span style={{ ...body, fontSize: 11, fontWeight: 600, color: l[1], letterSpacing: ".04em", textTransform: "uppercase", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: 5, background: l[1], display: "inline-block" }} />
      {l[0]}
    </span>
  );
}

function Eyebrow({ children }) {
  return <p style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: C.ink50, margin: "0 0 14px" }}>{children}</p>;
}

function H2({ children }) {
  return <h2 style={{ ...disp, fontSize: "clamp(26px,4.6vw,36px)", fontWeight: 400, color: C.ink, margin: "0 0 24px", letterSpacing: "-.015em", lineHeight: 1.12 }}>{children}</h2>;
}

function Sec({ eyebrow, title, children }) {
  return (
    <section style={{ padding: "52px 0", borderTop: `1px solid ${C.hair}` }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <H2>{title}</H2>
      {children}
    </section>
  );
}

function Gap({ children, title = "Not yet available" }) {
  return (
    <div style={{ borderLeft: `2px solid ${C.ink25}`, paddingLeft: 18, margin: "22px 0 0" }}>
      <p style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.ink50, margin: "0 0 6px" }}>{title}</p>
      <p style={{ ...body, fontSize: 15, color: C.ink80, margin: 0, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

/* ═══════════ SIGNATURE — the Windsor flood marker post ═══════════ */

function MarkerPost({ sel, setSel, mounted }) {
  const TOP = 20;
  const y = (m) => 100 - (m / TOP) * 100;

  return (
    <div style={{ position: "relative", height: 400, display: "flex", gap: 0, userSelect: "none" }}>
      {/* post */}
      <div style={{ position: "relative", width: 46, flex: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: C.wash, borderRadius: 2 }} />
        {/* water fill to selected mark */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: mounted ? `${(MARKS[sel].m / TOP) * 100}%` : "0%",
          background: `linear-gradient(180deg, ${MARKS[sel].tone}22, ${MARKS[sel].tone}55)`,
          borderTop: `2px solid ${MARKS[sel].tone}`,
          transition: "height 900ms cubic-bezier(.22,1,.36,1), border-color 400ms, background 400ms",
        }} />
        {/* minor tick marks every metre */}
        {Array.from({ length: 20 }, (_, i) => i + 1).map((m) => (
          <div key={m} style={{ position: "absolute", left: 0, width: m % 5 === 0 ? 16 : 8, top: `${y(m)}%`, borderTop: `1px solid ${C.ink25}` }} />
        ))}
      </div>

      {/* notches */}
      <div style={{ position: "relative", flex: 1, marginLeft: 2 }}>
        {MARKS.map((mk, i) => {
          const on = sel === i;
          return (
            <button key={i} onClick={() => setSel(i)}
              style={{
                position: "absolute", left: 0, right: 0, top: `${y(mk.m)}%`,
                transform: "translateY(-50%)", background: "none", border: 0, padding: "3px 0",
                cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                opacity: mounted ? 1 : 0,
                transition: `opacity 500ms ease ${200 + i * 90}ms`,
              }}>
              <span style={{ width: 22, borderTop: `${on ? 2 : 1}px solid ${on ? mk.tone : C.ink25}`, flex: "none", transition: "all 250ms" }} />
              <span style={{ ...disp, fontSize: on ? 22 : 18, fontWeight: on ? 600 : 400, color: on ? mk.tone : C.ink80, letterSpacing: "-.02em", transition: "all 250ms", lineHeight: 1 }}>
                {mk.m.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>m</span>
              </span>
              <span style={{ ...body, fontSize: 12.5, fontWeight: on ? 700 : 500, color: on ? C.ink : C.ink50, transition: "all 250ms" }}>
                {mk.year ? `${mk.label} · ${mk.year}` : mk.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FloodPost() {
  const [sel, setSel] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  const mk = MARKS[sel];

  return (
    <>
      <p style={{ ...body, fontSize: 16, color: C.ink80, margin: "0 0 30px", lineHeight: 1.65, maxWidth: "56ch" }}>
        Windsor has physical posts with the old flood heights cut into them. This is that post, drawn to scale from the gauge record. Tap a mark.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(230px,300px) 1fr", gap: 40, alignItems: "start" }}>
        <MarkerPost sel={sel} setSel={setSel} mounted={mounted} />

        <div style={{ paddingTop: 4 }}>
          <div style={{ marginBottom: 12 }}><Lvl k={mk.level} /></div>
          <h3 style={{ ...disp, fontSize: 26, fontWeight: 400, color: mk.tone, margin: "0 0 14px", letterSpacing: "-.015em", lineHeight: 1.15 }}>
            {mk.head}
          </h3>
          <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: "0 0 18px", lineHeight: 1.65 }}>{mk.body}</p>
          <div style={{ background: mk.wash, padding: "20px 22px", borderRadius: 3 }}>
            <p style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: mk.tone, margin: "0 0 8px" }}>
              What this means for your address
            </p>
            <p style={{ ...body, fontSize: 15.5, color: C.ink, margin: 0, lineHeight: 1.65 }}>{mk.local}</p>
          </div>
        </div>
      </div>

      <Gap>
        The height at which this individual property floods, and at which its access road becomes impassable. Those need Hawkesbury City Council flood model data and a property survey. Until then the post shows what is known: official classifications, and what actually happened.
      </Gap>

      <p style={{ ...body, fontSize: 12.5, color: C.ink50, margin: "26px 0 0", lineHeight: 1.6 }}>
        All heights on the post are the Hawkesbury at Windsor gauge. North Richmond gauge readings are given in the notes where relevant — the two are not interchangeable.
      </p>
    </>
  );
}

/* ═══════════ fire danger dial ═══════════ */

function Dial({ active, setActive }) {
  const R = 84, CX = 100, CY = 96, W = 26;
  const seg = (i) => {
    const a0 = Math.PI - (i * Math.PI) / 4, a1 = Math.PI - ((i + 1) * Math.PI) / 4;
    const p = (a, r) => `${CX + r * Math.cos(a)},${CY - r * Math.sin(a)}`;
    return `M ${p(a0, R)} A ${R} ${R} 0 0 1 ${p(a1, R)} L ${p(a1, R - W)} A ${R - W} ${R - W} 0 0 0 ${p(a0, R - W)} Z`;
  };
  return (
    <svg viewBox="0 0 200 116" style={{ width: "100%", maxWidth: 300, display: "block" }} role="img" aria-label="Fire danger rating dial">
      {FDR.map((f, i) => (
        <path key={f.r} d={seg(i)} fill={active === i ? f.tone : f.wash}
          stroke={C.page} strokeWidth="2" style={{ cursor: "pointer", transition: "fill 250ms" }}
          onClick={() => setActive(active === i ? null : i)} />
      ))}
      {active !== null && (
        <text x={CX} y={CY - 8} textAnchor="middle" style={{ ...disp, fontSize: 17, fontWeight: 600, fill: FDR[active].tone }}>
          {FDR[active].r}
        </text>
      )}
      {active === null && (
        <text x={CX} y={CY - 8} textAnchor="middle" style={{ ...body, fontSize: 11, fontWeight: 600, fill: C.ink50, letterSpacing: ".06em" }}>
          TAP A LEVEL
        </text>
      )}
    </svg>
  );
}

/* ═══════════ heat scale ═══════════ */

function HeatScale({ sel, setSel }) {
  const LO = 25, HI = 50;
  const x = (t) => ((t - LO) / (HI - LO)) * 100;
  return (
    <div style={{ margin: "0 0 26px" }}>
      <div style={{ position: "relative", height: 14, borderRadius: 2, background: `linear-gradient(90deg, ${C.waterWash} 0%, ${C.siltWash} 32%, ${C.silt} 46%, ${C.fire} 68%, ${C.ember} 92%)` }}>
        {HEAT_MARKS.map((h, i) => (
          <button key={h.t} onClick={() => setSel(i)} aria-label={`${h.t} degrees`}
            style={{ position: "absolute", left: `${x(h.t)}%`, top: -6, transform: "translateX(-50%)",
              width: 3, height: 26, background: sel === i ? C.ink : C.page, border: 0, padding: 0, cursor: "pointer", transition: "background 200ms" }} />
        ))}
      </div>
      <div style={{ position: "relative", height: 46, marginTop: 8 }}>
        {HEAT_MARKS.map((h, i) => (
          <button key={h.t} onClick={() => setSel(i)}
            style={{ position: "absolute", left: `${x(h.t)}%`, transform: "translateX(-50%)", background: "none", border: 0, cursor: "pointer", padding: 0, textAlign: "center", width: 96 }}>
            <div style={{ ...disp, fontSize: sel === i ? 24 : 20, fontWeight: sel === i ? 600 : 400, color: sel === i ? h.tone : C.ink50, letterSpacing: "-.02em", transition: "all 250ms", lineHeight: 1.1 }}>
              {h.t}°
            </div>
            <div style={{ ...body, fontSize: 11.5, fontWeight: sel === i ? 700 : 500, color: sel === i ? C.ink : C.ink50, transition: "all 250ms" }}>{h.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ heat locality record — Task 1 slot ═══════════
   Structural home for the compiled BOM station 067105 record.
   Renders the honest not-yet-available state until the daily
   series can actually be fetched and computed — see README. */

function HeatLocalityRecord() {
  const s = HEAT_STATION;
  return (
    <div style={{ marginTop: 44 }}>
      <Eyebrow>The local record</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: 0, lineHeight: 1.65, maxWidth: "58ch" }}>
          Bureau of Meteorology station {s.id}, {s.name} — about {s.distanceKm} km from here. Close enough to be informative, far enough that it is never presented as this property's own reading.
        </p>
        <Lvl k="locality" />
      </div>

      {!s.available && (
        <Gap title="Not yet available">
          {s.blockedReason} Once compiled, this panel will show — for the last 30 years of the station's record — days per year at or above 35°C, 40°C and 45°C, heatwave events per the Bureau's definition, the longest heatwave run, the hottest recorded day and its date, and the trend across the period. Every one of those needs the actual daily maximum and minimum series; none of them are estimated here.
        </Gap>
      )}
    </div>
  );
}

/* ═══════════════════════════ landing ═══════════════════════════ */

function Landing({ onSubmit }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const go = () => {
    const hit = STREETS.find((s) => v.toLowerCase().includes(s.toLowerCase()));
    if (!hit) { setErr(true); return; }
    onSubmit({ raw: v.trim(), street: hit, suburb: SUBURB_OF(hit) });
  };

  return (
    <div style={{ ...body, minHeight: "100%", background: C.page, display: "flex", alignItems: "center", padding: "72px 26px" }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: 560, width: "100%", margin: "0 auto",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(10px)", transition: "all 700ms cubic-bezier(.22,1,.36,1)" }}>

        <p style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: C.ink50, margin: "0 0 22px" }}>
          Hawkesbury–Nepean Valley
        </p>

        <h1 style={{ ...disp, fontSize: "clamp(46px,10vw,78px)", fontWeight: 300, color: C.ink, margin: "0 0 20px", letterSpacing: "-.035em", lineHeight: .96 }}>
          Know<br />your place
        </h1>

        <p style={{ ...body, fontSize: 18, color: C.ink80, margin: "0 0 40px", lineHeight: 1.55, maxWidth: "34ch" }}>
          What flood, fire and heat actually mean at your address — from the official record, with nothing invented.
        </p>

        <div style={{ borderBottom: `1.5px solid ${err ? C.fire : C.ink}`, display: "flex", alignItems: "center", gap: 12, paddingBottom: 10 }}>
          <input value={v} onChange={(e) => { setV(e.target.value); setErr(false); }} onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="Enter your address"
            style={{ ...body, flex: 1, minWidth: 0, fontSize: 19, border: 0, outline: "none", color: C.ink, background: "transparent", padding: "4px 0" }} />
          <button onClick={go} aria-label="Search this address"
            style={{ ...body, background: C.ink, color: C.page, border: 0, borderRadius: 2, width: 40, height: 40, fontSize: 17, cursor: "pointer", flex: "none" }}>→</button>
        </div>

        {err && <p style={{ ...body, fontSize: 14.5, color: C.fire, margin: "14px 0 0", lineHeight: 1.5 }}>
          Not covered yet. This early version covers Cornwallis and Richmond Lowlands only.
        </p>}

        <p style={{ ...body, fontSize: 13, color: C.ink50, margin: "34px 0 12px", letterSpacing: ".02em" }}>Or try</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
          {["33 Ridges Lane, Cornwallis", "8 Percival Street, Richmond Lowlands"].map((a) => (
            <button key={a} onClick={() => { setV(a); setErr(false); }}
              style={{ ...body, fontSize: 14, padding: 0, border: 0, background: "none", color: C.water, cursor: "pointer", borderBottom: `1px solid ${C.ink25}`, paddingBottom: 2 }}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ property ═══════════════════════════ */

function Property({ addr, onBack }) {
  const [mode, setMode] = useState("resident");
  const [heatSel, setHeatSel] = useState(0);
  const [heatFact, setHeatFact] = useState(null);
  const [fdr, setFdr] = useState(null);
  const [cat, setCat] = useState(null);
  const [src, setSrc] = useState(false);

  const shown = addr.raw.toLowerCase().includes(addr.suburb.toLowerCase()) ? addr.raw : `${addr.raw}, ${addr.suburb}`;
  const heat = HEAT_MARKS[heatSel];

  const SNAP = [
    ["Flood", "High", C.fire, "On the floodplain"],
    ["Evacuation", "Early", C.silt, "Ordered out, 2024"],
    ["Fire", "Grassfire country", C.silt, "Mapping not connected"],
    ["Heat", "Regional only", C.ink50, "No address count yet"],
  ];

  return (
    <div style={{ ...body, background: C.page, minHeight: "100%", color: C.ink }}>
      <style>{FONTS}</style>

      <div style={{ position: "sticky", top: 0, zIndex: 9, background: "rgba(255,255,255,.93)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.hair}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "14px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ ...body, background: "none", border: 0, color: C.ink50, fontSize: 14, cursor: "pointer", padding: 0 }}>← New address</button>
          <div style={{ display: "flex", gap: 22 }}>
            {[["resident", "I live here"], ["buying", "I'm buying"]].map(([k, l]) => (
              <button key={k} onClick={() => setMode(k)}
                style={{ ...body, fontSize: 14, fontWeight: mode === k ? 700 : 500, padding: "2px 0", border: 0, background: "none", cursor: "pointer",
                  color: mode === k ? C.ink : C.ink50, borderBottom: `2px solid ${mode === k ? C.ink : "transparent"}` }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 26px 80px" }}>

        {/* hero */}
        <div style={{ padding: "56px 0 40px" }}>
          <p style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: C.ink50, margin: "0 0 16px" }}>
            {addr.suburb} · Hawkesbury LGA · NSW 2753
          </p>
          <h1 style={{ ...disp, fontSize: "clamp(34px,6.4vw,58px)", fontWeight: 300, color: C.ink, margin: 0, letterSpacing: "-.03em", lineHeight: 1.02 }}>
            {shown}
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 1, background: C.hair, border: `1px solid ${C.hair}` }}>
          {SNAP.map(([l, v, tone, sub]) => (
            <div key={l} style={{ background: C.page, padding: "20px 20px 22px" }}>
              <p style={{ ...body, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.ink50, margin: "0 0 10px" }}>{l}</p>
              <p style={{ ...disp, fontSize: 21, fontWeight: 500, color: tone, margin: "0 0 5px", letterSpacing: "-.015em", lineHeight: 1.1 }}>{v}</p>
              <p style={{ ...body, fontSize: 12.5, color: C.ink50, margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginTop: 16 }}>
          <span style={{ ...body, fontSize: 13, color: C.ink80 }}>
            <span style={{ color: C.go, fontWeight: 700 }}>✓</span> Verified official data — NSW SES, Bureau of Meteorology, NSW RFS
          </span>
          <button onClick={() => setSrc(!src)} style={{ ...body, background: "none", border: 0, color: C.water, fontSize: 13, cursor: "pointer", padding: 0, borderBottom: `1px solid ${C.ink25}` }}>
            {src ? "Hide sources" : "View sources"}
          </button>
        </div>
        {src && <ul style={{ ...body, fontSize: 13, color: C.ink80, lineHeight: 1.8, margin: "14px 0 0", paddingLeft: 18 }}>{SOURCES.map((s) => <li key={s}>{s}</li>)}</ul>}

        {/* what you need to know */}
        <Sec eyebrow="The short version" title="What you need to know">
          {[
            ["You'll be told to leave before it looks serious.", "The April 2024 evacuation order came at around 7 m at Windsor. Major flooding there is 12.2 m."],
            ["Getting out matters more than staying dry.", "Inundation is one of three risks. Losing road access — early — affects far more properties than water in the house."],
            ["This is recent and repeated.", "Three major floods across 2021 and 2022, an evacuation order in 2024, and the largest single-ignition fire in Australian history through this LGA in 2019–20."],
            ["Cleared land is not fire-free land.", "Grass fires move around three times faster than bush fires, and bushfire mapping isn't built to capture them."],
            ["The heat figure you'll find online is probably too low.", "Street-level sensors across Western Sydney have recorded up to 25 more days above 35°C a year than the nearest official station."],
          ].map(([h, d], i) => (
            <div key={i} style={{ display: "flex", gap: 22, padding: "20px 0", borderTop: i === 0 ? `1px solid ${C.hair}` : `1px solid ${C.hair}` }}>
              <span style={{ ...disp, fontSize: 15, color: C.ink25, flex: "none", width: 22, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p style={{ ...body, fontSize: 17, fontWeight: 700, color: C.ink, margin: "0 0 6px", lineHeight: 1.35 }}>{h}</p>
                <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: 0, lineHeight: 1.6 }}>{d}</p>
              </div>
            </div>
          ))}
        </Sec>

        {/* flood post */}
        <Sec eyebrow="Flood" title="The marker post"><FloodPost /></Sec>

        {/* three problems */}
        <Sec eyebrow="Flood" title="Three different problems, not one rating">
          <div style={{ display: "grid", gap: 1, background: C.hair, border: `1px solid ${C.hair}` }}>
            {FLOOD_THREE.map((r) => (
              <div key={r.t} style={{ background: C.page, padding: "26px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap", marginBottom: 8 }}>
                  <h3 style={{ ...disp, fontSize: 22, fontWeight: 500, color: r.tone, margin: 0, letterSpacing: "-.015em" }}>{r.t}</h3>
                  <Lvl k={r.lvl} />
                </div>
                <p style={{ ...body, fontSize: 14.5, color: C.ink50, margin: "0 0 10px" }}>{r.q}</p>
                <p style={{ ...body, fontSize: 15.5, color: C.ink, margin: 0, lineHeight: 1.65 }}>{r.a}</p>
              </div>
            ))}
          </div>
        </Sec>

        {/* timeline */}
        <Sec eyebrow="Past events" title="What has happened here">
          {EVENTS.map((e, i) => (
            <div key={e.yr} style={{ display: "flex", gap: 24, padding: "18px 0", borderTop: `1px solid ${C.hair}` }}>
              <span style={{ ...body, fontSize: 13, fontWeight: 700, color: e.tone, flex: "none", width: 76, letterSpacing: ".02em", paddingTop: 3 }}>{e.yr}</span>
              <div>
                <p style={{ ...body, fontSize: 16.5, fontWeight: e.key ? 700 : 600, color: C.ink, margin: "0 0 5px" }}>{e.t}</p>
                <p style={{ ...body, fontSize: 15, color: C.ink80, margin: 0, lineHeight: 1.6 }}>{e.d}</p>
              </div>
            </div>
          ))}
        </Sec>

        {/* evacuation */}
        <Sec eyebrow="Evacuation and access" title="Can I get out?">
          <div style={{ background: C.siltWash, padding: "26px 26px", borderRadius: 3, marginBottom: 26 }}>
            <div style={{ marginBottom: 10 }}><Lvl k="street" /></div>
            <p style={{ ...disp, fontSize: 24, fontWeight: 400, color: C.ink, margin: "0 0 10px", letterSpacing: "-.015em", lineHeight: 1.25 }}>
              In April 2024 you were sent to Richmond.
            </p>
            <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: 0, lineHeight: 1.65 }}>
              Proceed on available roads to Richmond. Stay with family, friends or alternative accommodation outside the flood-affected area.
            </p>
          </div>
          <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: "0 0 10px", lineHeight: 1.65, maxWidth: "60ch" }}>
            NSW SES lists Windsor Road, the Northern Road, Londonderry Road, Castlereagh Road and the South Creek route via Hawkesbury Valley Way and Riverstone Parade as evacuation routes for this floodplain. Any of them can be cut during a flood.
          </p>
          <Lvl k="regional" />
          <Gap>
            The river height at which each route becomes impassable, the low points on your particular way out, and how long this street has previously been isolated. These need council road level data and the Hawkesbury–Nepean flood model.
          </Gap>
        </Sec>

        {/* fire */}
        <Sec eyebrow="Fire" title="Grassfire first, bushfire second">
          <div style={{ background: C.siltWash, padding: "28px 26px", borderRadius: 3, marginBottom: 32 }}>
            <div style={{ marginBottom: 12 }}><Lvl k="regional" /></div>
            <p style={{ ...disp, fontSize: "clamp(24px,4vw,32px)", fontWeight: 400, color: C.ink, margin: "0 0 12px", letterSpacing: "-.02em", lineHeight: 1.15 }}>
              Grass fires move about three times faster than bush fires.
            </p>
            <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: 0, lineHeight: 1.65 }}>
              That's the NSW RFS Commissioner's own framing, and here it outranks the bushfire mapping question. This is cleared grazing and cropping country. After a wet season, heavy fuel loads across open paddocks are exactly what the RFS has warned about. A property can sit entirely outside mapped Bush Fire Prone Land and still be in the path of a fast grassfire.
            </p>
          </div>

          <Eyebrow>The last major fire in this LGA</Eyebrow>
          <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: "0 0 20px", lineHeight: 1.65, maxWidth: "60ch" }}>
            The Gospers Mountain fire began with one lightning strike on 26 October 2019 in inaccessible bushland north-west of here. It wasn't contained until 12 January 2020, and rain finally extinguished it in February.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 1, background: C.hair, border: `1px solid ${C.hair}`, marginBottom: 14 }}>
            {[["512,000+", "hectares burnt", C.fire], ["~90", "homes destroyed", C.fire], ["6", "council areas", C.ink]].map(([v, l, t]) => (
              <div key={l} style={{ background: C.page, padding: "22px 20px" }}>
                <p style={{ ...disp, fontSize: 28, fontWeight: 500, color: t, margin: "0 0 4px", letterSpacing: "-.025em", lineHeight: 1 }}>{v}</p>
                <p style={{ ...body, fontSize: 12.5, color: C.ink50, margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{ ...body, fontSize: 14.5, color: C.ink80, margin: "0 0 8px", lineHeight: 1.6 }}>
            The largest fire from a single ignition point in Australian history.
          </p>
          <Lvl k="regional" />
          <Gap>Fire history for this street — previous ignitions, hazard reduction burns, and how close the 2019–20 front came. NSW RFS and NPWS hold fire history mapping that would answer it.</Gap>

          <div style={{ marginTop: 44 }}>
            <Eyebrow>Fire danger ratings</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 32, alignItems: "center" }}>
              <Dial active={fdr} setActive={setFdr} />
              <div>
                {fdr !== null ? (
                  <>
                    <p style={{ ...disp, fontSize: 24, fontWeight: 500, color: FDR[fdr].tone, margin: "0 0 10px", letterSpacing: "-.015em" }}>{FDR[fdr].r}</p>
                    <p style={{ ...body, fontSize: 15.5, color: C.ink, margin: 0, lineHeight: 1.65 }}>{FDR[fdr].d}</p>
                  </>
                ) : (
                  <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: 0, lineHeight: 1.65 }}>
                    Four levels, replacing the previous six-level system in September 2022. The new system draws on eight mapped vegetation types rather than just bush and grass. The daily rating appears on the NSW RFS site, the Hazards Near Me app, and roadside signs.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 44 }}>
            <Eyebrow>Bush fire prone land</Eyebrow>
            <p style={{ ...body, fontSize: 15.5, color: C.ink80, margin: "0 0 6px", lineHeight: 1.65, maxWidth: "60ch" }}>
              This property's status isn't connected yet. The mapping is certified by the NSW RFS Commissioner and published openly, so it's a build task rather than a data problem. The category governs what can be built here and to what standard.
            </p>
            <div style={{ marginBottom: 18 }}><Lvl k="gap" /></div>
            {BFPL.map((c, i) => (
              <div key={c.k} style={{ borderTop: `1px solid ${C.hair}` }}>
                <button onClick={() => setCat(cat === i ? null : i)}
                  style={{ ...body, width: "100%", textAlign: "left", background: "none", border: 0, padding: "15px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, fontWeight: 600, color: C.ink }}>
                  <span>{c.k}</span><span style={{ color: C.ink25, fontSize: 18 }}>{cat === i ? "−" : "+"}</span>
                </button>
                {cat === i && <p style={{ ...body, fontSize: 15, color: C.ink80, margin: "0 0 18px", lineHeight: 1.65, maxWidth: "58ch" }}>{c.d}</p>}
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.hair}` }} />
            <p style={{ ...body, fontSize: 14.5, color: C.ink80, margin: "20px 0 0", lineHeight: 1.6, maxWidth: "60ch" }}>
              The statutory Bush Fire Danger Period generally runs 1 October to 31 March, though the RFS can vary it locally. A permit is required to light a fire in the open during that period.
            </p>
          </div>
        </Sec>

        {/* heat */}
        <Sec eyebrow="Heat" title="What extreme heat means here">
          <p style={{ ...body, fontSize: 16, color: C.ink80, margin: "0 0 34px", lineHeight: 1.65, maxWidth: "56ch" }}>
            There's no heat sensor on this street. What follows is the regional and research picture for this part of Western Sydney, marked as such — plus what changes heat at the scale of a single block.
          </p>

          <HeatScale sel={heatSel} setSel={setHeatSel} />
          <div style={{ marginBottom: 12 }}><Lvl k="regional" /></div>
          <p style={{ ...body, fontSize: 15.5, color: C.ink, margin: "0 0 16px", lineHeight: 1.65, maxWidth: "60ch" }}>{heat.d}</p>
          <div style={{ background: heat.wash, padding: "20px 22px", borderRadius: 3 }}>
            <p style={{ ...body, fontSize: 15.5, color: C.ink, margin: 0, lineHeight: 1.65 }}>{heat.extra}</p>
          </div>

          <div style={{ marginTop: 44 }}>
            <Eyebrow>What the research shows</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 1, background: C.hair, border: `1px solid ${C.hair}` }}>
              {HEAT_FACTS.map((f, i) => (
                <button key={f.k} onClick={() => setHeatFact(heatFact === i ? null : i)}
                  style={{ background: heatFact === i ? C.wash : C.page, border: 0, padding: "22px 20px", cursor: "pointer", textAlign: "left", transition: "background 200ms" }}>
                  <p style={{ ...disp, fontSize: 26, fontWeight: 500, color: C.ink, margin: "0 0 5px", letterSpacing: "-.025em", lineHeight: 1 }}>{f.v}</p>
                  <p style={{ ...body, fontSize: 12.5, color: C.ink50, margin: 0 }}>{f.k}</p>
                </button>
              ))}
            </div>
            {heatFact !== null && (
              <div style={{ marginTop: 20 }}>
                <div style={{ marginBottom: 8 }}><Lvl k={HEAT_FACTS[heatFact].lvl} /></div>
                <p style={{ ...body, fontSize: 15.5, color: C.ink, margin: 0, lineHeight: 1.65, maxWidth: "60ch" }}>{HEAT_FACTS[heatFact].d}</p>
              </div>
            )}
          </div>

          <HeatLocalityRecord />

          <div style={{ marginTop: 44 }}>
            <Eyebrow>What makes one block hotter than the next</Eyebrow>
            {HEAT_LOCAL.map(([t, d], i) => (
              <div key={t} style={{ padding: "18px 0", borderTop: `1px solid ${C.hair}` }}>
                <p style={{ ...body, fontSize: 16.5, fontWeight: 600, color: C.ink, margin: "0 0 5px" }}>{t}</p>
                <p style={{ ...body, fontSize: 15, color: C.ink80, margin: 0, lineHeight: 1.6, maxWidth: "60ch" }}>{d}</p>
              </div>
            ))}
          </div>

          <Gap>
            Canopy cover for this block from NSW spatial data. That part of the heat picture is a separate build task from the local record above.
          </Gap>
        </Sec>

        {/* buying */}
        {mode === "buying" && (
          <Sec eyebrow="Thinking of buying" title="Before you exchange">
            <p style={{ ...body, fontSize: 16, color: C.ink80, margin: "0 0 30px", lineHeight: 1.65, maxWidth: "56ch" }}>
              Not legal advice. A list of what to find out, and who to ask, before committing to a property on this floodplain.
            </p>
            {BUYING.map(([t, d], i) => (
              <div key={t} style={{ display: "flex", gap: 20, padding: "18px 0", borderTop: `1px solid ${C.hair}` }}>
                <span style={{ ...disp, fontSize: 14, color: C.ink25, flex: "none", width: 22, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p style={{ ...body, fontSize: 16.5, fontWeight: 600, color: C.ink, margin: "0 0 5px" }}>{t}</p>
                  <p style={{ ...body, fontSize: 15, color: C.ink80, margin: 0, lineHeight: 1.6, maxWidth: "58ch" }}>{d}</p>
                </div>
              </div>
            ))}
            <div style={{ background: C.waterWash, padding: "26px 26px", borderRadius: 3, marginTop: 30 }}>
              <p style={{ ...disp, fontSize: 22, fontWeight: 500, color: C.water, margin: "0 0 10px", letterSpacing: "-.015em" }}>Insurance</p>
              <p style={{ ...body, fontSize: 15.5, color: C.ink, margin: 0, lineHeight: 1.65 }}>
                Flood and bushfire exposure affect both what a policy costs and whether cover is offered at all. Get a property-specific quote in writing before you exchange — not an estimate, and not a quote for a nearby address. We don't estimate premiums here, and no tool should.
              </p>
            </div>
          </Sec>
        )}

        <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: 32, marginTop: 20 }}>
          <p style={{ ...body, fontSize: 14.5, color: C.ink80, margin: "0 0 12px", lineHeight: 1.65, maxWidth: "62ch" }}>
            Nothing here replaces a section 10.7 planning certificate from Hawkesbury City Council, or advice from NSW SES or NSW RFS during an emergency. In an emergency call 000. For flood and storm assistance call the NSW SES on 132 500.
          </p>
          <p style={{ ...body, fontSize: 12.5, color: C.ink50, margin: 0 }}>
            Early prototype · Cornwallis and Richmond Lowlands · Hawkesbury–Nepean Community Resilience Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default function KnowYourPlace() {
  const [addr, setAddr] = useState(null);
  return addr ? <Property addr={addr} onBack={() => setAddr(null)} /> : <Landing onSubmit={setAddr} />;
}
