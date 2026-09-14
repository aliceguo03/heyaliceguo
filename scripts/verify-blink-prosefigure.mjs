#!/usr/bin/env node
// Real-browser verification for this session's one addition: `proseFigure`
// with an absent `figure` (types.ts + ProseFigure.tsx). Run on demand with
// `node scripts/verify-blink-prosefigure.mjs` — not wired into `build` or
// `test`. Harness plumbing (server bootstrap, port selection) copied
// verbatim from verify-case-reveals.mjs.
//
// Blink (content/case-studies/blink.ts) has four proseFigure blocks with no
// figure at all — "AI-Assisted Auditing at Scale", "Classifying by Issue,
// Not by Page", "Overriding Automated Complacence", "The Deliverables" —
// and several with one, to prove the normal path is undisturbed. The two
// questions this checks, matching this session's own report-back items:
//   1. does a figureless block render zero figure wells (nothing reserved
//      and left empty)?
//   2. does its own height match heading+gap+prose exactly, with no leftover
//      556px + gap-md for the well that isn't there?

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const PAGE_PATH = "/work/blink";
const GAP_MD = 20; // --spacing-md
const GAP_XL = 50; // --spacing-xl
const TOLERANCE = 1.5; // px, sub-pixel layout rounding

// Source of truth: content/case-studies/blink.ts. Headings only — enough to
// locate each block's own [data-reveal] wrapper and its ProseFigure root.
const FIGURELESS_HEADINGS = [
  "AI-Assisted Auditing at Scale",
  "Classifying by Issue, Not by Page",
  "Overriding Automated Complacence",
  "The Deliverables",
];
const FIGURED_HEADINGS = [
  "How might we achieve WCAG 2.1 AA compliance across hundreds of pages when working within fixed CMS templates and components?",
  "Systematizing the KBA Template",
  "Contextual Design System Application",
];

// --- Harness plumbing (verbatim shape, verify-case-reveals.mjs) -----------

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function isServerUp(url) {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await sleep(300);
  }
  throw new Error(`Dev server did not respond at ${url} within ${timeoutMs}ms`);
}

function startDevServer(port) {
  const child = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: new URL("..", import.meta.url).pathname,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

async function main() {
  const reusedBase = "http://localhost:3000";
  const reusingExisting = await isServerUp(reusedBase);

  let base = reusedBase;
  let server = null;
  let serverOutput = "";

  if (reusingExisting) {
    console.log(`Reusing already-running dev server at ${base}`);
  } else {
    const port = await getFreePort();
    base = `http://localhost:${port}`;
    console.log(`Starting next dev on ${base} ...`);
    server = startDevServer(port);
    server.stdout.on("data", (d) => (serverOutput += d.toString()));
    server.stderr.on("data", (d) => (serverOutput += d.toString()));
  }

  const url = `${base}${PAGE_PATH}`;
  const results = []; // { name, pass, gating, detail }

  try {
    await waitForServer(base);
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    // ---- Checks 1-2: figureless blocks have no figure well, right height --
    for (const heading of FIGURELESS_HEADINGS) {
      const info = await page.evaluate((needle) => {
        const all = Array.from(document.querySelectorAll("p,h2,h3"));
        const headingEl = all.find((e) => e.textContent?.trim() === needle);
        const root = headingEl?.parentElement; // ProseFigure's own flex-col div
        if (!headingEl || !root) return null;

        // Prose.tsx wraps its <p> in its own flex-col <div> — the direct
        // child here is that div, not a bare <p> — so take the second
        // direct child generically rather than filtering by tag.
        const proseEl = Array.from(root.children)[1];
        const imgCount = root.querySelectorAll("img").length;
        const rounded556 = Array.from(root.querySelectorAll("*")).some(
          (el) => getComputedStyle(el).height === "556px",
        );

        const headingH = headingEl.getBoundingClientRect().height;
        const proseH = proseEl ? proseEl.getBoundingClientRect().height : 0;
        const rootH = root.getBoundingClientRect().height;

        return { imgCount, rounded556, headingH, proseH, rootH, hasProse: !!proseEl };
      }, heading);

      results.push({
        name: `"${heading}": zero figure wells rendered (no <img>, no 556px well)`,
        pass: !!info && info.imgCount === 0 && !info.rounded556,
        gating: true,
        detail: JSON.stringify(info),
      });

      if (info) {
        const expected = info.headingH + GAP_MD + info.proseH;
        results.push({
          name: `"${heading}": block height == heading + gap-md + prose exactly (space actually removed, not left empty)`,
          pass: Math.abs(info.rootH - expected) <= TOLERANCE,
          gating: true,
          detail: `rootH=${info.rootH.toFixed(1)} expected=${expected.toFixed(1)} (heading=${info.headingH.toFixed(1)} + ${GAP_MD} + prose=${info.proseH.toFixed(1)})`,
        });
      }
    }

    // ---- Check 3: figured proseFigure blocks keep their normal 20/20 gaps -
    for (const heading of FIGURED_HEADINGS) {
      const gaps = await page.evaluate((needle) => {
        const all = Array.from(document.querySelectorAll("p,h2,h3"));
        const headingEl = all.find((e) => e.textContent?.trim() === needle);
        const root = headingEl?.parentElement;
        if (!root) return null;
        const children = Array.from(root.children);
        const rects = children.map((c) => c.getBoundingClientRect());
        const out = [];
        for (let i = 1; i < rects.length; i++) {
          out.push(rects[i].top - rects[i - 1].bottom);
        }
        return out;
      }, heading);

      results.push({
        name: `"${heading}": figured proseFigure still holds gap-md (20px) between every child`,
        pass: !!gaps && gaps.length > 0 && gaps.every((g) => Math.abs(g - GAP_MD) <= TOLERANCE),
        gating: true,
        detail: JSON.stringify(gaps?.map((g) => Number(g.toFixed(1)))),
      });
    }

    // ---- Check 4: section rhythm (title-row->block0 = 20, block->block = 50)
    const sectionGaps = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("[data-section]"));
      return sections.map((section) => {
        const reveals = Array.from(section.querySelectorAll(":scope [data-reveal]"));
        const rects = reveals.map((el) => el.getBoundingClientRect());
        const gaps = [];
        for (let i = 1; i < rects.length; i++) {
          gaps.push(Number((rects[i].top - rects[i - 1].bottom).toFixed(1)));
        }
        return { id: section.dataset.section, gaps };
      });
    });

    for (const { id, gaps } of sectionGaps) {
      if (gaps.length === 0) continue;
      const titleGap = gaps[0];
      const blockGaps = gaps.slice(1);
      results.push({
        name: `§${id}: title-row -> block[0] gap is 20px`,
        pass: Math.abs(titleGap - GAP_MD) <= TOLERANCE,
        gating: true,
        detail: `${titleGap}`,
      });
      results.push({
        name: `§${id}: every block[n] -> block[n+1] gap is 50px`,
        pass: blockGaps.every((g) => Math.abs(g - GAP_XL) <= TOLERANCE),
        gating: true,
        detail: JSON.stringify(blockGaps),
      });
    }

    // ---- Non-gating: measured section heights vs Figma's own -------------
    const FIGMA_HEIGHTS = {
      "AI-Assisted Auditing at Scale": 130,
      "Classifying by Issue, Not by Page": 130,
      "Overriding Automated Complacence": 156,
      "The Deliverables": 130,
    };
    for (const heading of FIGURELESS_HEADINGS) {
      const rootH = await page.evaluate((needle) => {
        const all = Array.from(document.querySelectorAll("p,h2,h3"));
        const headingEl = all.find((e) => e.textContent?.trim() === needle);
        return headingEl?.parentElement?.getBoundingClientRect().height ?? null;
      }, heading);
      results.push({
        name: `"${heading}": measured height vs Figma's ${FIGMA_HEIGHTS[heading]}px`,
        pass: true,
        gating: false,
        detail: `measured=${rootH?.toFixed(1)}px figma=${FIGMA_HEIGHTS[heading]}px`,
      });
    }

    await context.close();
    await browser.close();
  } finally {
    server?.kill("SIGTERM");
  }

  // --- Report ---------------------------------------------------------------
  console.log("\n=== Results ===\n");
  let failed = 0;
  for (const r of results) {
    const mark = r.pass ? "PASS" : r.gating ? "FAIL" : "warn";
    if (!r.pass && r.gating) failed++;
    const showDetail = !r.pass || !r.gating;
    console.log(`[${mark}] ${r.name}${showDetail && r.detail ? `  (${r.detail})` : ""}`);
  }

  if (failed > 0) {
    console.error(`\n${failed} gating check(s) failed.`);
    if (serverOutput.includes("Error")) {
      console.error("\n--- dev server output (tail) ---\n" + serverOutput.slice(-2000));
    }
    process.exit(1);
  }
  console.log("\nAll gating checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
