#!/usr/bin/env node
// Session R0, item 3 — measure only, fix nothing. Loads every live page at
// nine tablet/phone/laptop viewports and reports horizontal overflow:
// document.scrollWidth vs clientWidth, and every element whose right edge
// exceeds the viewport. This is a scope count and a before/after measure
// for the responsive design sessions, not a task list to start working
// through this session — no component code changes because of anything
// this finds.
//
// Run on demand with `node scripts/audit-responsive.mjs` — not wired into
// `build` or `test`. Harness plumbing (server bootstrap, port selection)
// copied verbatim from verify-blink-prosefigure.mjs / verify-case-reveals.mjs.
// Headless Chromium only (this project's Playwright cache has no
// WebKit/Firefox — see CLAUDE.md), no touch emulation.
//
// Known, by-design finding you'll see on every page: Ticker.tsx's
// `.ticker-track` (the duplicated marquee track) is wider than the
// viewport on purpose — its parent (`.ticker-fade`) clips it with
// `overflow-hidden`, so it never causes real scrollWidth overflow. It's
// reported here like anything else (not filtered out), so the design
// sessions see it and know to ignore it rather than "discover" it fresh.
//
// Two passes per page × viewport: "top" (right after load, past the hero's
// own ~2.15s load sequence) and "at rest" (scrolled to the bottom, so
// scroll-driven mechanics — the project stack, the About pin, the
// GeminiCut carousel — have reached their final position). A pinned
// mechanic reads as static-fallback or full-mechanic depending on the
// viewport per MIN_VIEWPORT_H/MIN_ABOUT_VIEWPORT_H/MIN_CAROUSEL_VIEWPORT_H
// (projectGeometry.ts / aboutGeometry.ts / caseStudyGeometry.ts) — this
// script doesn't care which one renders, it just measures what's on screen.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_FILE = process.argv[2] ?? "audit/responsive-baseline.md";

const PAGES = ["/", "/about", "/work/f3global", "/work/chase", "/work/geminicut", "/work/blink"];

// width x height, in the order given in the session prompt: phones, then
// tablets, then two laptop-ish landscape sizes, then the 13" Air floor.
const VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
  { width: 744, height: 1133 },
  { width: 820, height: 1180 },
  { width: 1024, height: 1366 },
  { width: 1180, height: 820 },
  { width: 1366, height: 1024 },
  { width: 1440, height: 900 },
];

// Past LOAD.total (~2.15s, lib/motion.ts) so the hero's own load sequence
// is at rest before the first measurement, on every page (harmless
// overshoot on pages without a load sequence).
const SETTLE_MS = 2500;
const AT_REST_SETTLE_MS = 500;
const MAX_OFFENDERS = 25;

// --- Harness plumbing (verbatim shape, verify-blink-prosefigure.mjs) -------

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

// --- Measurement ------------------------------------------------------------

// Runs inside the page. Self-contained — no closed-over values except the
// MAX_OFFENDERS constant, passed in as an argument.
function scanOverflow(maxOffenders) {
  const clientWidth = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;

  const all = Array.from(document.querySelectorAll("body *"));
  const offenders = [];
  for (const el of all) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > clientWidth + 0.5) {
      offenders.push({ el, rect });
    }
  }

  // Keep only the outermost offender in a chain — an overflowing child
  // inside an overflowing parent is one finding, not two.
  const offenderSet = new Set(offenders.map((o) => o.el));
  const outermost = offenders.filter((o) => {
    let p = o.el.parentElement;
    while (p) {
      if (offenderSet.has(p)) return false;
      p = p.parentElement;
    }
    return true;
  });

  outermost.sort((a, b) => b.rect.right - a.rect.right);

  const list = outermost.slice(0, maxOffenders).map((o) => {
    const el = o.el;
    const dataAttr = Array.from(el.attributes).find((a) => a.name.startsWith("data-"));
    const label = dataAttr
      ? `${dataAttr.name}="${dataAttr.value}"`
      : el.className && typeof el.className === "string"
        ? `.${el.className.trim().split(/\s+/)[0]}`
        : "";
    return {
      tag: el.tagName.toLowerCase(),
      label,
      width: Math.round(o.rect.width),
      overflow: Math.round(o.rect.right - clientWidth),
    };
  });

  return {
    clientWidth,
    scrollWidth,
    delta: scrollWidth - clientWidth,
    offenderCount: outermost.length,
    truncated: outermost.length > maxOffenders,
    offenders: list,
  };
}

async function measurePage(browser, base, pagePath, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(`${base}${pagePath}`, { waitUntil: "networkidle" });
  await sleep(SETTLE_MS);

  const top = await page.evaluate(scanOverflow, MAX_OFFENDERS);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(AT_REST_SETTLE_MS);

  const atRest = await page.evaluate(scanOverflow, MAX_OFFENDERS);

  await context.close();
  return { top, atRest };
}

// --- Reporting ---------------------------------------------------------------

function offendersList(offenders, truncated) {
  if (offenders.length === 0) return "";
  const lines = offenders.map(
    (o) => `  - \`<${o.tag}>\` ${o.label || "(no data-*/class)"} — width ${o.width}px, overflow +${o.overflow}px`,
  );
  if (truncated) lines.push(`  - …truncated at ${MAX_OFFENDERS} worst offenders`);
  return lines.join("\n");
}

function renderPageSection(pagePath, rows) {
  const lines = [];
  lines.push(`## \`${pagePath}\``, "");
  lines.push("| viewport | pass | clientWidth | scrollWidth | delta | offenders |");
  lines.push("|---|---|---|---|---|---|");
  for (const row of rows) {
    for (const [passLabel, m] of [
      ["top", row.top],
      ["at rest", row.atRest],
    ]) {
      lines.push(
        `| ${row.width}×${row.height} | ${passLabel} | ${m.clientWidth} | ${m.scrollWidth} | ${m.delta > 0 ? `+${m.delta}` : m.delta} | ${m.offenderCount} |`,
      );
    }
  }
  lines.push("");

  for (const row of rows) {
    for (const [passLabel, m] of [
      ["top", row.top],
      ["at rest", row.atRest],
    ]) {
      if (m.offenderCount === 0) continue;
      lines.push(`**${row.width}×${row.height}, ${passLabel}:**`, offendersList(m.offenders, m.truncated), "");
    }
  }

  return lines.join("\n");
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

  const sections = [];

  try {
    await waitForServer(base);
    const browser = await chromium.launch();

    for (const pagePath of PAGES) {
      const rows = [];
      for (const viewport of VIEWPORTS) {
        const { top, atRest } = await measurePage(browser, base, pagePath, viewport);
        rows.push({ width: viewport.width, height: viewport.height, top, atRest });
      }
      const section = renderPageSection(pagePath, rows);
      sections.push(section);
      console.log("\n" + section);
    }

    await browser.close();
  } finally {
    server?.kill("SIGTERM");
    if (serverOutput.includes("Error")) {
      console.error("\n--- dev server output (tail) ---\n" + serverOutput.slice(-2000));
    }
  }

  const header = [
    "# Responsive audit",
    "",
    `Run: ${new Date().toISOString()}`,
    "",
    "Headless Chromium, no touch emulation. Measure-only — no component code",
    "changed as a result of this run. `.ticker-track` overflowing on every",
    "page is expected (see the script's own header comment); it's clipped by",
    "its parent's `overflow-hidden` and never shows up in the scrollWidth",
    "delta.",
    "",
  ].join("\n");

  const out = header + sections.join("\n\n");
  const outPath = path.isAbsolute(OUT_FILE) ? OUT_FILE : path.join(new URL("..", import.meta.url).pathname, OUT_FILE);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, out, "utf8");
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
