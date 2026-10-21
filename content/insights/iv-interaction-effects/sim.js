// Interactive figures for the IV interaction effects Insights page (#sim: 2SLS view, #sol: MTE view).
(() => {
"use strict";
const NS = "http://www.w3.org/2000/svg";
function E(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
// Text with single-letter variables (D, Y, I, U) set in italic, as in the math.
function T(parent, x, y, text, attrs) {
  const t = E("text", Object.assign({ x, y }, attrs || {}), parent);
  text.split(/(\b[DYIU]\b)/).forEach(part => {
    if (!part) return;
    const s = E("tspan", /^[DYIU]$/.test(part) ? { "font-style": "italic" } : null, t);
    s.textContent = part;
  });
  return t;
}
const f2 = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace("-", "−");

const B3 = 1.5, A = 2.0;
const states = { sim: { s: 0, d: 0 }, sol: { s: 0, d: 0 } };

function model(p) {
  // Complier populations on the U scale: I = 0 fixed, I = 1 shifted by the first-stage gradient.
  const a0 = 0.25, b0 = 0.74;
  const a1 = 0.25 + p.d, b1 = 0.74 + p.d * 0.15;
  const u0 = (a0 + b0) / 2, u1 = (a1 + b1) / 2;     // middle of each complier population
  const mte0 = u => A - p.s * (u - 0.5);              // effect at U for I = 0
  const mte1 = u => mte0(u) + B3;                     // same U, I = 1
  const late0 = mte0(u0), late1 = mte1(u1);           // average over each (uniform) complier band
  return { a0, b0, a1, b1, u0, u1, mte0, mte1, late0, late1, iv: late1 - late0 };
}

function draw(id, mode) {
  const host = document.getElementById(id);
  const sol = mode === "mte";
  const W = host.clientWidth || 700;
  const narrow = W < 520;
  const M = model(states[id]);
  const m = { l: 58, r: narrow ? 92 : 112, t: 32 };
  const ph = narrow ? 250 : 300;
  const gapBands = 26, rowH = 28, rowGap = 10;
  const bandsTop = m.t + ph + gapBands;
  const axisY = bandsTop + rowH * 2 + rowGap + 12;
  const H = axisY + 66;
  const pw = W - m.l - m.r;
  const YMIN = -1, YMAX = 6;
  const x = u => m.l + u * pw;
  const y = v => m.t + (YMAX - v) / (YMAX - YMIN) * ph;

  host.innerHTML = "";
  const svg = E("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, host);

  // ---- top panel: effects ----
  for (let v = YMIN; v <= YMAX; v += 1) {
    E("line", { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v), class: v === 0 ? "zl" : "gl" }, svg);
    T(svg, m.l - 8, y(v) + 4, String(v).replace("-", "−"), { class: "ax", "text-anchor": "end" });
  }
  T(svg, 0, 0, "Interaction effect", { class: "ax-t", "text-anchor": "middle", transform: `translate(15,${m.t + ph / 2}) rotate(-90)` });

  const rows = [
    { name: "I = 1", c: "var(--sim-g1)", a: M.a1, b: M.b1, mu: M.u1, late: M.late1, f: M.mte1, row: 0 },
    { name: "I = 0", c: "var(--sim-g0)", a: M.a0, b: M.b0, mu: M.u0, late: M.late0, f: M.mte0, row: 1 }
  ];
  const rowTop = r => bandsTop + r * (rowH + rowGap);

  // solution view: shade the range of U where compliers from both groups are present
  const w0 = Math.max(M.a0, M.a1), w1 = Math.min(M.b0, M.b1);
  if (sol && w1 > w0) {
    E("rect", { x: x(w0), y: m.t, width: x(w1) - x(w0), height: bandsTop + 2 * rowH + rowGap - m.t, style: "fill:var(--sim-overlap)" }, svg);
  }

  // drop guides from each LATE to the middle of its complier band
  if (!sol) rows.forEach(r => {
    E("line", { x1: x(r.mu), x2: x(r.mu), y1: y(r.late), y2: rowTop(r.row), style: `stroke:${r.c};stroke-width:1.75;stroke-dasharray:4 3;opacity:.7` }, svg);
  });

  // right-hand brackets: true interaction vs estimate, both measured from the I = 0 reference point
  // (2SLS view: the two LATEs; solution view: both curves at the middle of the overlap)
  const gx = m.l + pw;
  const xT = gx + 22, xS = gx + (narrow ? 66 : 78);
  const um = (w0 + w1) / 2;
  const p0 = sol ? { u: um, v: M.mte0(um) } : { u: M.u0, v: M.late0 };
  const p1 = sol ? { u: um, v: M.mte1(um) } : { u: M.u1, v: M.late1 };
  E("line", { x1: x(p0.u), x2: xS, y1: y(p0.v), y2: y(p0.v), style: "stroke:var(--sim-g0);stroke-width:1.75;stroke-dasharray:4 3" }, svg);
  E("line", { x1: x(p1.u), x2: xS, y1: y(p1.v), y2: y(p1.v), style: "stroke:var(--sim-g1);stroke-width:1.75;stroke-dasharray:4 3" }, svg);
  const bracket = (bx, v0, v1, color) => {
    E("path", { d: `M${bx - 5},${y(v0)} H${bx} V${y(v1)} H${bx - 5}`, style: `fill:none;stroke:${color};stroke-width:2` }, svg);
    const up = v1 >= v0;
    T(svg, bx, up ? y(v1) - 7 : y(v1) + 17, f2(v1 - v0), { class: "lbl-m", "text-anchor": "middle" });
  };
  bracket(xT, p0.v, p0.v + B3, "var(--sim-true)");
  bracket(xS, p0.v, p1.v, sol ? "var(--sim-true)" : "var(--sim-est)");
  T(svg, xT, m.t - 14, "True", { class: "lbl", "text-anchor": "middle", style: "font-weight:600" });
  T(svg, xS, m.t - 14, sol ? "MTE" : "2SLS", { class: "lbl", "text-anchor": "middle", style: "font-weight:600" });

  // effect along each complier population, as a coloured bar spanning its complier share
  // clip to the plot area so steep bars at extreme slider values stay inside the axes
  const defs = E("defs", null, svg);
  const clip = E("clipPath", { id: id + "-clip" }, defs);
  E("rect", { x: m.l, y: m.t, width: pw, height: ph }, clip);
  const curve = (f, a, b) => {
    const n = 80; let d = "";
    for (let k = 0; k <= n; k++) { const u = a + (b - a) * k / n; d += (k ? "L" : "M") + x(u).toFixed(1) + "," + y(f(u)).toFixed(1); }
    return d;
  };
  const barG = E("g", { "clip-path": `url(#${id}-clip)` }, svg);
  if (sol) rows.forEach(r => {
    E("path", { d: curve(r.f, 0.0005, 0.9995), style: `stroke:${r.c};stroke-width:2;fill:none` }, barG);
  });
  rows.forEach(r => {
    E("path", { d: curve(r.f, r.a, r.b), style: `stroke:${r.c};stroke-width:9;stroke-opacity:.45;stroke-linecap:butt;fill:none` }, barG);
  });

  // solution view: vertical comparisons at the same U inside the overlap
  if (sol && w1 > w0) {
    const mk = E("marker", { id: id + "-arrow", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }, defs);
    E("path", { d: "M0,1 L9,5 L0,9 z", style: "fill:var(--sim-true)" }, mk);
    const n = 5;
    for (let k = 0; k < n; k++) {
      const u = w0 + (w1 - w0) * (k + 0.5) / n;
      E("line", { x1: x(u), x2: x(u), y1: y(M.mte0(u)) - 5, y2: y(M.mte1(u)) + 6, style: "stroke:var(--sim-true);stroke-width:1.75", "marker-end": `url(#${id}-arrow)` }, svg);
    }
    T(svg, (x(w0) + x(w1)) / 2, m.t - 14, "Compliers in both groups", { class: "lbl-2", "text-anchor": "middle" });
  }

  // LATE dots, centred on their complier populations
  if (!sol) rows.forEach(r => {
    E("circle", { cx: x(r.mu), cy: y(r.late), r: 7, style: `fill:${r.c};stroke:var(--theme);stroke-width:2.5` }, svg);
  });

  // ---- bottom panel: complier populations ----
  rows.forEach(r => {
    const y0 = rowTop(r.row);
    T(svg, m.l - 8, y0 + rowH / 2 + 5, r.name, { class: "lbl", "text-anchor": "end", style: "font-weight:600" });
    const segs = [
      { a: 0, b: r.a, fill: "var(--sim-fill)", long: "Always-takers", short: "AT", stroke: null },
      { a: r.a, b: r.b, fill: `color-mix(in srgb, ${r.c} 26%, var(--entry))`, long: `Compliers ${Math.round((r.b - r.a) * 100)}%`, mid: "Compliers", short: `${Math.round((r.b - r.a) * 100)}%`, stroke: r.c },
      { a: r.b, b: 1, fill: "var(--sim-fill)", long: "Never-takers", short: "NT", stroke: null }
    ];
    segs.forEach((s, k) => {
      const xa = x(s.a) + (k ? 1 : 0), xb = x(s.b) - (k < 2 ? 1 : 0), w = xb - xa;
      if (w <= 0) return;
      E("rect", { x: xa, y: y0, width: w, height: rowH, rx: 3, style: `fill:${s.fill};stroke:${s.stroke || "none"};stroke-width:${s.stroke ? 1.5 : 0}` }, svg);
      // Use the longest label that fits inside the segment (measured). Never-takers that fit
      // no label inside are labelled in full just right of the band.
      const cx = xa + w / 2, cy = y0 + rowH / 2 + 5;
      for (const t of [s.long, s.mid, s.short].filter(Boolean)) {
        const node = T(svg, cx, cy, t, { class: "lbl-2", "text-anchor": "middle" });
        if (node.getComputedTextLength() + 10 < w) return;
        node.remove();
      }
      if (k === 2) T(svg, x(1) + 8, cy, s.long, { class: "lbl-2" });
    });
  });

  // ---- shared x axis ----
  E("line", { x1: x(0), x2: x(1), y1: axisY, y2: axisY, class: "zl" }, svg);
  [0, 0.25, 0.5, 0.75, 1].forEach(u => {
    E("line", { x1: x(u), x2: x(u), y1: axisY, y2: axisY + 4, class: "zl" }, svg);
    T(svg, x(u), axisY + 18, u === 0 ? "0" : u === 1 ? "1" : u.toFixed(2), { class: "ax", "text-anchor": u === 0 ? "start" : u === 1 ? "end" : "middle" });
  });
  T(svg, x(0), axisY + 37, narrow ? "← Eager" : "← More eager", { class: "ax-t" });
  T(svg, x(1), axisY + 37, narrow ? "Reluctant →" : "More reluctant →", { class: "ax-t", "text-anchor": "end" });
  T(svg, x(0.5), axisY + 58, "Unobserved resistance to taking the treatment, U", { class: "ax-t", "text-anchor": "middle", style: "font-weight:600" });

  const mteEst = w1 > w0 ? B3 : NaN;   // average same-U difference over the overlap
  document.getElementById(sol ? "readout2" : "readout").innerHTML =
    `<div><span class="k"><i class="sw-bar" style="background:var(--sim-true)"></i>True interaction effect</span><span class="v">${f2(B3)}</span></div>` +
    (sol
      ? `<div><span class="k"><i class="sw-bar" style="background:var(--sim-true)"></i>MTE estimate</span><span class="v">${isNaN(mteEst) ? "–" : f2(mteEst)}</span></div>`
      : `<div><span class="k"><i class="sw-bar" style="background:var(--sim-est)"></i>2SLS estimate</span><span class="v">${f2(M.iv)}</span></div>`);
}

function sync() {
  [["sim", ""], ["sol", "2"]].forEach(([fig, sfx]) => {
    document.getElementById("d" + sfx + "-o").textContent = states[fig].d.toFixed(2);
    document.getElementById("s" + sfx + "-o").textContent = states[fig].s.toFixed(1);
  });
}
[["sim", ""], ["sol", "2"]].forEach(([fig, sfx]) => {
  ["d", "s"].forEach(k => {
    const inp = document.getElementById(k + sfx);
    inp.value = states[fig][k];
    inp.addEventListener("input", () => { states[fig][k] = parseFloat(inp.value); sync(); draw(fig, fig === "sol" ? "mte" : "2sls"); });
  });
});
function drawAll() { draw("sim", "2sls"); draw("sol", "mte"); }
sync();
drawAll();
let lastW = 0;
new ResizeObserver(() => {
  const w = document.getElementById("sim").clientWidth;
  if (w !== lastW) { lastW = w; drawAll(); }
}).observe(document.getElementById("sim"));
})();
