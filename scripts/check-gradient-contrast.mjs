#!/usr/bin/env node
// Contrast check for every project's case-study text paint
// (Statement.tsx / StatValue.tsx's `text-gradient-project`, reading
// `--gradient-project` — set from Project.caseStudyGradient,
// content/projects.ts) against --color-porcelain (globals.css), the
// background every one of these renders on. Plain Node, no browser: unlike
// every other script here (Playwright DOM harnesses), this is pure color
// math, so it doesn't need a rendered page.
//
// Run on demand with `node scripts/check-gradient-contrast.mjs` — not wired
// into `build` or `test`. Same PASS/FAIL/exit(1) report shape as the
// Playwright scripts, for the same reason: a human or a CI step can read
// the tail and know whether it's safe to stop reading.
//
// Reads `src/content/projects.ts` as TEXT via a small regex extraction,
// not as a TS import — this project has no ts-node/tsx in devDependencies,
// and pulling one in for a single read-only script would be its own
// dependency-approval question (CLAUDE.md's third-party protocol, item 6).
// The regex is deliberately narrow (slug/accent/caseStudyGradient string
// literals only) rather than a general TS/JS parser — it only needs to
// survive this one data file's actual shape, not arbitrary TypeScript.
//
// What "3:1" means here: every caseStudyGradient in this file paints
// Statement.tsx (24px Satoshi Bold, WCAG large text) and/or StatValue.tsx
// (100px, also large text) — never anything smaller — so 3:1 is the
// governing floor, not 4.5:1. Both ratios are reported regardless, since
// the 4.5:1 figure is informative there.
//
// Fix pass (item 3): also checks each project's flat `accent` — now also
// Tiles.tsx's takeaway-header color (text-accent-project) — at 4.5:1, the
// stricter normal-text floor: 20px Satoshi 400 is normal text, not large,
// unlike everything the gradient check above covers.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PROJECTS_FILE = path.join(rootDir, "src/content/projects.ts");
const PORCELAIN_HEX = "#fefffd"; // globals.css --color-porcelain

// --- Extraction (regex over the source text, not a TS import) --------------

function extractProjects(source) {
  const slugMatches = [...source.matchAll(/slug:\s*"([^"]+)"/g)];
  const projects = [];
  for (let i = 0; i < slugMatches.length; i++) {
    const start = slugMatches[i].index;
    const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : source.length;
    const chunk = source.slice(start, end);
    const slug = slugMatches[i][1];
    const accent = chunk.match(/\baccent:\s*"([^"]+)"/)?.[1] ?? null;
    const caseStudyGradient = chunk.match(/caseStudyGradient:\s*"([^"]+)"/)?.[1] ?? null;
    projects.push({ slug, accent, caseStudyGradient });
  }
  return projects;
}

// --- Color math --------------------------------------------------------------

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a 6-digit hex color: ${hex}`);
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

// WCAG 2.x relative luminance (the same formula every other contrast note
// in this repo — projects.ts's own comments, PanelNav.tsx's — cites by
// number without re-deriving; this is that derivation, checkable by eye).
function relativeLuminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(rgbA, rgbB) {
  const [lA, lB] = [relativeLuminance(rgbA), relativeLuminance(rgbB)];
  const [lighter, darker] = lA >= lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Gradient parsing + sampling ---------------------------------------------
// Every caseStudyGradient in this project is a plain `linear-gradient(<angle>,
// stop1 pct%, stop2 pct%, ...)` with no `in <color-space>` clause — CSS's
// default is to interpolate each stop pair linearly in sRGB gamma-encoded
// space, which is exactly what lerping the raw 0-255 channel values below
// does. The angle itself is irrelevant to contrast (it only decides which
// screen direction 0%->100% points in), so this only ever reads the stop
// list.

function parseLinearGradient(value) {
  const m = /^linear-gradient\([^,]+,\s*(.+)\)$/.exec(value.trim());
  if (!m) throw new Error(`Unrecognized gradient shape: ${value}`);
  const stops = [...m[1].matchAll(/#([0-9a-f]{6})\s+([\d.]+)%/gi)].map(([, hex, pct]) => ({
    rgb: hexToRgb(`#${hex}`),
    pct: Number(pct),
  }));
  if (stops.length < 2) throw new Error(`Fewer than 2 stops parsed from: ${value}`);
  return stops;
}

function colorAt(stops, t) {
  if (t <= stops[0].pct) return stops[0].rgb;
  if (t >= stops[stops.length - 1].pct) return stops[stops.length - 1].rgb;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.pct && t <= b.pct) {
      const localT = (t - a.pct) / (b.pct - a.pct || 1);
      return a.rgb.map((c, ch) => c + (b.rgb[ch] - c) * localT);
    }
  }
  throw new Error(`Unreachable: t=${t} outside every stop pair`);
}

const SAMPLE_STEP_PCT = 1; // "~1% steps" per the plan
const LARGE_TEXT_THRESHOLD = 3;
const NORMAL_TEXT_THRESHOLD = 4.5;

function worstPoint(stops, backgroundRgb) {
  let worst = null;
  for (let t = 0; t <= 100; t += SAMPLE_STEP_PCT) {
    const rgb = colorAt(stops, t);
    const ratio = contrastRatio(rgb, backgroundRgb);
    if (!worst || ratio < worst.ratio) {
      worst = { ratio, t, hex: rgbToHex(rgb) };
    }
  }
  return worst;
}

// --- Report -------------------------------------------------------------------

function main() {
  const source = readFileSync(PROJECTS_FILE, "utf8");
  const allProjects = extractProjects(source);
  const backgroundRgb = hexToRgb(PORCELAIN_HEX);
  let failed = 0;

  console.log(`Background: ${PORCELAIN_HEX} (--color-porcelain)\n`);

  console.log("=== Case-study gradients (Statement/StatValue, large text) ===\n");
  for (const { slug, caseStudyGradient } of allProjects.filter((p) => p.caseStudyGradient)) {
    const stops = parseLinearGradient(caseStudyGradient);
    const worst = worstPoint(stops, backgroundRgb);
    const passesLarge = worst.ratio >= LARGE_TEXT_THRESHOLD;
    const passesNormal = worst.ratio >= NORMAL_TEXT_THRESHOLD;
    if (!passesLarge) failed++;

    console.log(`${slug}`);
    console.log(`  gradient: ${caseStudyGradient}`);
    console.log(`  worst point: ${worst.ratio.toFixed(2)}:1 at ${worst.t}% (${worst.hex})`);
    console.log(
      `  [${passesLarge ? "PASS" : "FAIL"}] large text (>=3:1, this gradient's only use — 24px/100px)`,
    );
    console.log(`  [${passesNormal ? "PASS" : "info"}] normal text (>=4.5:1), for reference`);
    console.log("");
  }

  // Fix pass (item 3): flat accents, checked at the stricter normal-text
  // floor — Tiles.tsx's takeaway header (20px Satoshi 400) is the reason
  // this section exists, but every project with an `accent` is checked,
  // not just the ones with a "Takeaways" block, since the token is shared
  // sitewide (PanelMeta.tsx's row labels, PanelNav.tsx's active item, etc.)
  // and a future consumer at normal text size shouldn't need a second pass.
  console.log("=== Flat accents (Tiles.tsx takeaway headers, normal text) ===\n");
  for (const { slug, accent } of allProjects.filter((p) => p.accent)) {
    const rgb = hexToRgb(accent);
    const ratio = contrastRatio(rgb, backgroundRgb);
    const passesNormal = ratio >= NORMAL_TEXT_THRESHOLD;
    if (!passesNormal) failed++;

    console.log(`${slug}`);
    console.log(`  accent: ${accent}`);
    console.log(`  ratio: ${ratio.toFixed(2)}:1`);
    console.log(`  [${passesNormal ? "PASS" : "FAIL"}] normal text (>=4.5:1)`);
    console.log("");
  }

  if (failed > 0) {
    console.error(`${failed} check(s) failed.`);
    process.exit(1);
  }
  console.log("All checks passed.");
}

main();
