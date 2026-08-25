// Builds the SVG figures and the high-impact table for the search-and-discovery
// brief from a pinned snapshot of the kg-pipeline evaluation dashboard's data.
//
//   node scripts/build-brief-figures.mjs
//
// Every number in all four figures comes from runs.json and pubs_runs.json
// exactly as the dashboard publishes them — no reshaping step in between. To
// refresh, re-download those two from https://nf-osi.github.io/kg-pipeline/ ,
// re-run this, and update the captions' run dates.
//
// The one thing neither file carries is the wording of each question, which
// Table 1 prints; data/questions.json is a small overlay holding just that.
// Drop it and the four figures still build, without the table.
//
// The snapshot lives in the brief's own data/ directory rather than being
// fetched at build time: the dashboard is live and these figures are a frozen
// citation, so a rebuild has to reproduce the same numbers the prose quotes.
//
// Marks follow the repo's dataviz conventions: one hue per chart (these are all
// single-series), hairline solid gridlines, values direct-labelled only where
// they carry the point, and colors driven by classes in src/app/prose.css so
// the figures follow the light/dark theme instead of baking in a surface.

import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BRIEF = path.join(ROOT, "_briefs", "search-and-discovery-improvements");
const DATA = path.join(BRIEF, "data");

// The run the whole brief quotes. Pinning model+version+date here (rather than
// "the newest row") keeps the figures and the prose from drifting apart when a
// later run lands in the snapshot.
const TOOLS_RUN = {
  model: "anthropic/claude-sonnet-5",
  version: "v1.3",
  date: "2026-08-18",
  samples: 46,
};
const PUBS_RUN = { model: "anthropic/claude-sonnet-5", date: "2026-08-19" };

// Table 1 is a hand-picked shortlist for researchers to try, not the full set
// of questions that qualify — sixteen rows was more than anyone will paste. One
// per resource category, in this order. Each still has to earn its place: the
// build fails if any of these stops being both painful-on-the-portal and
// answered at full recall.
const FEATURED = [
  "AM-005",
  "AB-003",
  "CL-005",
  "CR-003",
  "MUT-006",
  "PUB-006",
];

// runs.json keys categories as "category/MUT"; the display names are the
// dashboard's, kept here so the figures don't need a second data file for
// nine strings.
const CATEGORY_LABELS = {
  MUT: "Mutation",
  AM: "Animal model",
  CL: "Cell line",
  AB: "Antibody",
  GR: "Genetic reagent",
  ST: "Study",
  PUB: "Publication & people",
  PI: "Investigator",
  CR: "Cross-resource",
};

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const runs = read("runs.json");
const pubsRuns = read("pubs_runs.json");

// Optional: only Table 1 needs it.
let questionText = null;
try {
  questionText = read("questions.json").text;
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const toolsRun = runs.find(
  (r) =>
    r.model === TOOLS_RUN.model &&
    r.task_version === TOOLS_RUN.version &&
    (r.completed_at || "").startsWith(TOOLS_RUN.date) &&
    r.total_samples === TOOLS_RUN.samples,
);
const pubsBy = (style) =>
  pubsRuns.find(
    (r) =>
      r.model === PUBS_RUN.model &&
      r.question_style === style &&
      (r.completed_at || "").startsWith(PUBS_RUN.date),
  );
const pubsPrecise = pubsBy("precise");
const pubsNatural = pubsBy("user_query");

for (const [name, run] of Object.entries({
  toolsRun,
  pubsPrecise,
  pubsNatural,
})) {
  if (!run) throw new Error(`no run matched for ${name} — check the pins above`);
}

/* ---- tiny SVG helpers ---------------------------------------------------
   Coordinates are plain viewBox units, sized so 1 unit is about 1px at the
   ~936px the brief's figure column gives them; the figure scales with the
   column from there. Keep W at 960 when editing — dropping it scales the type
   up with everything else and the axis labels stop matching the body text. */

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const f2 = (n) => n.toFixed(2);

// A bar with its data-end rounded and its baseline end square, per the mark
// spec. `r` is clamped so a short bar can't turn into a lozenge.
function barRight(x0, y, w, h, r = 4) {
  const rr = Math.max(0, Math.min(r, w));
  return `M${x0},${y} H${x0 + w - rr} A${rr},${rr} 0 0 1 ${x0 + w},${y + rr} V${y + h - rr} A${rr},${rr} 0 0 1 ${x0 + w - rr},${y + h} H${x0} Z`;
}

function svgOpen(w, h, title, desc) {
  return `<svg class="kgfig" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${title.id} ${desc.id}" preserveAspectRatio="xMidYMid meet">
<title id="${title.id}">${esc(title.text)}</title>
<desc id="${desc.id}">${esc(desc.text)}</desc>`;
}

function figure(id, svg, caption) {
  return `<figure id="${id}">
${svg}
<figcaption>${caption}</figcaption>
</figure>
`;
}

const write = (name, contents) => {
  fs.writeFileSync(path.join(BRIEF, name), contents);
  console.log("wrote", name);
};

/* ---- Figure 1: recall against portal pain ------------------------------ */

function figPortalPain() {
  const bins = [
    { key: "low", label: "Low" },
    { key: "moderate", label: "Moderate" },
    { key: "high", label: "High" },
    { key: "very_high", label: "Very high" },
  ];
  const counts = {};
  for (const s of toolsRun.frustration_samples)
    counts[s.frustration] = (counts[s.frustration] || 0) + 1;

  const pts = bins.map((b) => ({
    ...b,
    n: counts[b.key],
    v: toolsRun.frustration_scores[`frustration/${b.key}`],
  }));

  const W = 960,
    H = 300;
  const m = { t: 30, r: 52, b: 70, l: 62 };
  const pw = W - m.l - m.r,
    ph = H - m.t - m.b;
  const x = (i) => m.l + (pw * i) / (pts.length - 1);
  const y = (v) => m.t + ph * (1 - v);

  let s = svgOpen(
    W,
    H,
    { id: "f1t", text: "Recall against how hard the same question is on today's portal" },
    {
      id: "f1d",
      text: pts
        .map((p) => `${p.label} pain (${p.n} questions): recall ${f2(p.v)}`)
        .join(". "),
    },
  );

  // gridlines + y ticks
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    s += `\n<line class="kgfig-grid" x1="${m.l}" y1="${y(t)}" x2="${m.l + pw}" y2="${y(t)}"/>`;
    s += `\n<text class="kgfig-axis kgfig-num" x="${m.l - 10}" y="${y(t) + 4}" text-anchor="end">${t.toFixed(2)}</text>`;
  }
  s += `\n<text class="kgfig-axis" transform="translate(16,${m.t + ph / 2}) rotate(-90)" text-anchor="middle">Recall</text>`;

  // the line, then the markers on top of it
  s += `\n<polyline class="kgfig-line" points="${pts.map((p, i) => `${x(i)},${y(p.v)}`).join(" ")}"/>`;
  for (const [i, p] of pts.entries())
    s += `\n<circle class="kgfig-dot" cx="${x(i)}" cy="${y(p.v)}" r="5"/>`;

  // Label only the two extremes: the best bin and the one the section is about.
  const best = pts.reduce((a, b) => (b.v > a.v ? b : a));
  const worst = pts.reduce((a, b) => (b.v < a.v ? b : a));
  for (const p of [best, worst]) {
    const i = pts.indexOf(p);
    const above = p === best;
    s += `\n<text class="kgfig-value kgfig-num" x="${x(i)}" y="${y(p.v) + (above ? -14 : 26)}" text-anchor="middle">${f2(p.v)}</text>`;
  }

  // x categories, with the bin size under each so a 7-question bin can't read
  // as heavily as a 20-question one
  for (const [i, p] of pts.entries()) {
    s += `\n<text class="kgfig-axis" x="${x(i)}" y="${m.t + ph + 24}" text-anchor="middle">${p.label}</text>`;
    s += `\n<text class="kgfig-muted kgfig-num" x="${x(i)}" y="${m.t + ph + 42}" text-anchor="middle">n=${p.n}</text>`;
  }
  s += `\n<text class="kgfig-axis" x="${m.l + pw / 2}" y="${H - 6}" text-anchor="middle">How hard the question is on today’s portal</text>`;
  s += `\n</svg>`;

  return figure(
    "fig-portal-pain",
    s,
    `Figure 1: Recall falls as the question gets harder to answer on the current portal — but it does not fall off a cliff. Each question in the benchmark carries a curator's estimate of how painful it is on today's faceted search, from "answerable with minimal effort" to "cannot be answered at all". Question set v1.3 (46 questions), claude-sonnet-5, run 2026-08-18, harness commit <code>aa78cfa</code>.`,
  );
}

/* ---- Figure 2: recall by resource category ----------------------------- */

function figCategory() {
  const counts = {};
  for (const s of toolsRun.level_samples) {
    const code = s.id.split("-")[0];
    counts[code] = (counts[code] || 0) + 1;
  }
  const rows = Object.entries(toolsRun.category_scores)
    .map(([k, v]) => {
      const code = k.split("/")[1];
      return { code, label: CATEGORY_LABELS[code] ?? code, n: counts[code], v };
    })
    .sort((a, b) => b.v - a.v || b.n - a.n);

  const rowH = 30,
    barH = 18;
  const W = 960,
    m = { t: 16, r: 52, b: 46, l: 176 };
  const H = m.t + rows.length * rowH + m.b;
  const pw = W - m.l - m.r;
  const x = (v) => m.l + pw * v;

  let s = svgOpen(
    W,
    H,
    { id: "f2t", text: "Recall by resource category" },
    {
      id: "f2d",
      text: rows
        .map((r) => `${r.label} (${r.n} questions): recall ${f2(r.v)}`)
        .join(". "),
    },
  );

  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    s += `\n<line class="kgfig-grid" x1="${x(t)}" y1="${m.t}" x2="${x(t)}" y2="${m.t + rows.length * rowH}"/>`;
    s += `\n<text class="kgfig-axis kgfig-num" x="${x(t)}" y="${m.t + rows.length * rowH + 20}" text-anchor="middle">${t.toFixed(2)}</text>`;
  }
  s += `\n<text class="kgfig-axis" x="${m.l + pw / 2}" y="${H - 8}" text-anchor="middle">Recall</text>`;

  for (const [i, r] of rows.entries()) {
    const y = m.t + i * rowH + (rowH - barH) / 2;
    s += `\n<text class="kgfig-label" x="${m.l - 46}" y="${y + barH - 4}" text-anchor="end">${esc(r.label)}</text>`;
    s += `\n<text class="kgfig-muted kgfig-num" x="${m.l - 10}" y="${y + barH - 4}" text-anchor="end">n=${r.n}</text>`;
    s += `\n<path class="kgfig-bar" d="${barRight(m.l, y, Math.max(pw * r.v, 1), barH)}"/>`;
    s += `\n<text class="kgfig-value kgfig-num" x="${x(r.v) + 8}" y="${y + barH - 4}">${f2(r.v)}</text>`;
  }
  s += `\n</svg>`;

  return figure(
    "fig-category",
    s,
    `Figure 2: Recall by resource category, best to worst. The two categories added in v1.3 — Study, and Publication &amp; people — are among the weakest, as is Animal model. Several categories rest on very few questions, so <em>n</em> is given for each: a perfect score over two questions is not the same evidence as a perfect score over nine. Question set v1.3, claude-sonnet-5, run 2026-08-18.`,
  );
}

/* ---- Figure 3: citation F1 by question type, both phrasings ------------ */

function figCitationType() {
  const types = Object.keys(pubsPrecise.question_type_f1);
  const counts = {};
  for (const s of pubsPrecise.per_sample)
    counts[s.question_type] = (counts[s.question_type] || 0) + 1;

  const rows = types
    .map((t) => ({
      label: t[0].toUpperCase() + t.slice(1),
      n: counts[t],
      precise: pubsPrecise.question_type_f1[t],
      natural: pubsNatural.question_type_f1[t],
    }))
    .sort((a, b) => b.precise - a.precise);

  const rowH = 34;
  const W = 960,
    m = { t: 16, r: 52, b: 74, l: 176 };
  const H = m.t + rows.length * rowH + m.b;
  const pw = W - m.l - m.r;
  const x = (v) => m.l + pw * v;

  let s = svgOpen(
    W,
    H,
    { id: "f3t", text: "Citation F1 by question type, precise against natural phrasing" },
    {
      id: "f3d",
      text: rows
        .map(
          (r) =>
            `${r.label} (${r.n} questions): citation F1 ${f2(r.precise)} with precise phrasing, ${f2(r.natural)} with natural phrasing`,
        )
        .join(". "),
    },
  );

  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    s += `\n<line class="kgfig-grid" x1="${x(t)}" y1="${m.t}" x2="${x(t)}" y2="${m.t + rows.length * rowH}"/>`;
    s += `\n<text class="kgfig-axis kgfig-num" x="${x(t)}" y="${m.t + rows.length * rowH + 20}" text-anchor="middle">${t.toFixed(2)}</text>`;
  }
  s += `\n<text class="kgfig-axis" x="${m.l + pw / 2}" y="${m.t + rows.length * rowH + 42}" text-anchor="middle">Citation F1</text>`;

  for (const [i, r] of rows.entries()) {
    const y = m.t + i * rowH + rowH / 2;
    s += `\n<text class="kgfig-label" x="${m.l - 46}" y="${y + 5}" text-anchor="end">${esc(r.label)}</text>`;
    s += `\n<text class="kgfig-muted kgfig-num" x="${m.l - 10}" y="${y + 5}" text-anchor="end">n=${r.n}</text>`;
    s += `\n<line class="kgfig-track" x1="${x(Math.min(r.precise, r.natural))}" y1="${y}" x2="${x(Math.max(r.precise, r.natural))}" y2="${y}"/>`;
    s += `\n<circle class="kgfig-dot-hollow" cx="${x(r.natural)}" cy="${y}" r="5"/>`;
    s += `\n<circle class="kgfig-dot" cx="${x(r.precise)}" cy="${y}" r="5"/>`;
    s += `\n<text class="kgfig-value kgfig-num" x="${x(Math.max(r.precise, r.natural)) + 10}" y="${y + 5}">${f2(r.precise)}</text>`;
  }

  // Two series, so a legend is required — and identity here is fill, not hue.
  const ly = m.t + rows.length * rowH + 62;
  s += `\n<circle class="kgfig-dot" cx="${m.l + 6}" cy="${ly - 4}" r="5"/>`;
  s += `\n<text class="kgfig-axis" x="${m.l + 18}" y="${ly}">Precise phrasing</text>`;
  s += `\n<circle class="kgfig-dot-hollow" cx="${m.l + 166}" cy="${ly - 4}" r="5"/>`;
  s += `\n<text class="kgfig-axis" x="${m.l + 178}" y="${ly}">Natural phrasing</text>`;
  s += `\n</svg>`;

  return figure(
    "fig-citation-type",
    s,
    `Figure 3: Citation F1 by question type. Answer accuracy was 1.00 for every type under both phrasings, so the only thing that moves is attribution. Causal questions are the weakest and the one type where asking naturally scores slightly <em>better</em> than asking in the paper's own terms. Labelled values are the precise phrasing. Pub RAG v1, 130 questions, claude-sonnet-5, run 2026-08-19.`,
  );
}

/* ---- Figure 4: citation F1 by paper ------------------------------------ */

function figCitationPaper() {
  // How many questions each paper contributed is just a tally of per_sample.
  const counts = {};
  for (const s of pubsPrecise.per_sample)
    counts[s.paper] = (counts[s.paper] || 0) + 1;

  const rows = Object.entries(pubsPrecise.paper_f1)
    .map(([id, v]) => ({
      id,
      n: counts[id] ?? 0,
      v,
      acc: pubsPrecise.paper_accuracy[id],
    }))
    .sort((a, b) => b.v - a.v);

  const rowH = 26,
    barH = 16;
  const W = 960,
    m = { t: 16, r: 52, b: 46, l: 152 };
  const H = m.t + rows.length * rowH + m.b;
  const pw = W - m.l - m.r;
  const x = (v) => m.l + pw * v;

  let s = svgOpen(
    W,
    H,
    { id: "f4t", text: "Citation F1 by paper" },
    {
      id: "f4d",
      text: rows
        .map((r) => `${r.id} (${r.n} questions): citation F1 ${f2(r.v)}`)
        .join(". "),
    },
  );

  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    s += `\n<line class="kgfig-grid" x1="${x(t)}" y1="${m.t}" x2="${x(t)}" y2="${m.t + rows.length * rowH}"/>`;
    s += `\n<text class="kgfig-axis kgfig-num" x="${x(t)}" y="${m.t + rows.length * rowH + 20}" text-anchor="middle">${t.toFixed(2)}</text>`;
  }
  s += `\n<text class="kgfig-axis" x="${m.l + pw / 2}" y="${H - 8}" text-anchor="middle">Citation F1</text>`;

  for (const [i, r] of rows.entries()) {
    const y = m.t + i * rowH + (rowH - barH) / 2;
    s += `\n<text class="kgfig-label kgfig-mono" x="${m.l - 44}" y="${y + barH - 3}" text-anchor="end">${r.id}</text>`;
    s += `\n<text class="kgfig-muted kgfig-num" x="${m.l - 10}" y="${y + barH - 3}" text-anchor="end">n=${r.n}</text>`;
    s += `\n<path class="kgfig-bar" d="${barRight(m.l, y, Math.max(pw * r.v, 1), barH)}"/>`;
    s += `\n<text class="kgfig-value kgfig-num" x="${x(r.v) + 8}" y="${y + barH - 3}">${f2(r.v)}</text>`;
  }
  s += `\n</svg>`;

  const lo = rows[rows.length - 1],
    hi = rows[0];
  return figure(
    "fig-citation-paper",
    s,
    `Figure 4: Citation F1 for each of the 14 indexed papers, precise phrasing. Answer accuracy was 1.00 on every paper, so the spread here is attribution alone — from ${f2(hi.v)} on ${hi.id} down to ${f2(lo.v)} on ${lo.id}. Citation F1 by question <em>difficulty</em>, by contrast, is nearly flat (easy ${f2(pubsPrecise.difficulty_f1.easy)}, medium ${f2(pubsPrecise.difficulty_f1.medium)}, hard ${f2(pubsPrecise.difficulty_f1.hard)}): attribution breaks down by paper, not by how hard the question is. Run 2026-08-19.`,
  );
}

/* ---- Table 1: the questions the portal handles badly -------------------- */

function tableHighImpact() {
  const THRESHOLD = 0.95;
  const painful = new Set(["high", "very_high"]);

  // frustration_samples carries id, frustration and score for all 46, so the
  // row set and the counts in the caption both come straight from runs.json.
  const scores = Object.fromEntries(
    toolsRun.frustration_samples.map((s) => [s.id, s.score]),
  );
  const painTotal = toolsRun.frustration_samples.filter((s) =>
    painful.has(s.frustration),
  ).length;

  const qualifies = new Set(
    toolsRun.frustration_samples
      .filter((s) => painful.has(s.frustration) && s.score >= THRESHOLD)
      .map((s) => s.id),
  );

  const notQualifying = FEATURED.filter((id) => !qualifies.has(id));
  if (notQualifying.length)
    throw new Error(
      `FEATURED includes ${notQualifying.join(", ")}, which no longer clear ` +
        `${THRESHOLD} recall on a high/very-high pain question — repick or drop them`,
    );

  const byId = Object.fromEntries(
    toolsRun.frustration_samples.map((s) => [s.id, s]),
  );
  const rows = FEATURED.map((id) => ({
    id,
    frustration: byId[id].frustration,
    categoryLabel: CATEGORY_LABELS[id.split("-")[0]] ?? id.split("-")[0],
    question: questionText?.[id],
  }));

  const missing = rows.filter((q) => !q.question);
  if (missing.length)
    throw new Error(
      `data/questions.json has no wording for ${missing.map((q) => q.id).join(", ")}`,
    );

  const pretty = { high: "High", very_high: "Very high" };
  const body = rows
    .map(
      (q) => `    <tr>
      <td>${esc(q.question)}</td>
      <td>${esc(q.categoryLabel)}</td>
      <td>${pretty[q.frustration]}</td>
    </tr>`,
    )
    .join("\n");

  const notPerfect = rows.filter((q) => scores[q.id] < 1);
  if (notPerfect.length)
    throw new Error(
      `caption claims recall 1.00 for every row, but ${notPerfect.map((q) => q.id).join(", ")} scored lower — reword the caption or restore the Recall column`,
    );
  console.log(
    `  table 1: ${rows.length} featured of ${qualifies.size} qualifying, ` +
      `${painTotal} painful overall`,
  );

  return `<table>
  <caption><span id="tab:high-impact">Table 1: </span>${rows.length} questions to try, one per resource category. Each is rated hard or impossible on today's portal, and the Assistant returns <em>every</em> expected resource for it — recall 1.00 on all ${rows.length}. They are a selection from the ${qualifies.size} such questions in the benchmark, not the whole list. Question set v1.3, claude-sonnet-5, run 2026-08-18.</caption>
  <thead>
    <tr>
      <th scope="col">Question</th>
      <th scope="col">Category</th>
      <th scope="col">Portal pain</th>
    </tr>
  </thead>
  <tbody>
${body}
  </tbody>
</table>
`;
}

// All four figures are pure functions of runs.json / pubs_runs.json.
write("fig1-portal-pain.html", figPortalPain());
write("fig2-category.html", figCategory());
write("fig3-citation-type.html", figCitationType());
write("fig4-citation-paper.html", figCitationPaper());

// Table 1 prints the questions themselves, so it is the one output that needs
// the wording overlay.
if (questionText) {
  write("table1-high-impact.html", tableHighImpact());
} else {
  console.warn(
    "skipped table1-high-impact.html — data/questions.json is missing, and the\n" +
      "  question wording is not in runs.json. The four figures are unaffected.",
  );
}
