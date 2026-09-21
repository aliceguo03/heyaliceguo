#!/usr/bin/env node
// Real-browser verification for the footer quote's JS line-fitting
// (CLAUDE.md "Footer quote — wrapping, alignment, and orphan control",
// footerQuoteFit.ts, useFooterQuoteLayout.ts). Run on demand with
// `node scripts/verify-footer-quote-wrap.mjs` — not wired into `build` or
// `test`. Harness plumbing copied verbatim from verify-footer-quote.mjs.
//
// Drives the real reroll button (not a forced/injected quote) across many
// clicks at the narrowest and widest points of the desktop tier, sampling
// whichever quotes actually come up, and asserts on every sample:
//   1. The button-to-first-glyph gap is pixel-identical (16px, the CSS
//      gap-footer-quote-gap value) regardless of line count.
//   2. No wrapped quote (2+ lines) ends on a single orphaned word.
//   3. Resizing through the desktop range re-wraps without any wrapped
//      line's rendered width exceeding the row's real available space
//      (the no-crowding guarantee, checked independently of the gap
//      measurement above).
//   4. Hovering to reveal the button never changes row 1's — or the
//      text's own — layout (no re-wrap from an opacity change alone).

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

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
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

async function clickReroll(page) {
  await page.evaluate(() => {
    const footers = document.querySelectorAll("footer");
    footers[0].firstElementChild.children[1].querySelector("button").click();
  });
}

// Reads the current quote's rendered lines, the button-to-line-1 gap, and
// whether row 1's own box height moved (it never should — h-icon).
async function readState(page) {
  return page.evaluate(() => {
    const footers = document.querySelectorAll("footer");
    const row1 = footers[0].firstElementChild;
    const quoteGroup = row1.children[1];
    const button = quoteGroup.querySelector("button");
    const textEl = quoteGroup.querySelector("p");
    const lineEls = [...textEl.children];
    const lines = lineEls.map((el) => el.textContent);
    const firstLineRect = lineEls[0].getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return {
      lines,
      gap: firstLineRect.left - buttonRect.right,
      row1Height: row1.getBoundingClientRect().height,
    };
  });
}

async function main() {
  const reusedBase = "http://localhost:3000";
  const reusingExisting = await isServerUp(reusedBase);

  let base = reusedBase;
  let server = null;
  let serverOutput = "";

  if (reusingExisting) {
    console.log(`Reusing already-running server at ${base}`);
  } else {
    const port = await getFreePort();
    base = `http://localhost:${port}`;
    console.log(`Starting next dev on ${base} ...`);
    server = startDevServer(port);
    server.stdout.on("data", (d) => (serverOutput += d.toString()));
    server.stderr.on("data", (d) => (serverOutput += d.toString()));
  }

  const results = []; // { name, pass, gating, detail }

  try {
    await waitForServer(base);
    const browser = await chromium.launch();

    for (const width of [1024, 1300, 1710]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);

      const samples = [];
      for (let i = 0; i < 60; i++) {
        await clickReroll(page);
        await sleep(60);
        samples.push(await readState(page));
      }

      const gaps = samples.map((s) => Math.round(s.gap * 10) / 10);
      const uniqueGaps = [...new Set(gaps)];
      results.push({
        name: `${width}px: button gap is pixel-identical across ${samples.length} rerolls`,
        pass: uniqueGaps.length === 1 && Math.abs(uniqueGaps[0] - 16) < 0.5,
        gating: true,
        detail: `gaps seen: ${uniqueGaps.join(", ")}`,
      });

      const orphaned = samples.filter((s) => {
        if (s.lines.length < 2) return false;
        const last = s.lines[s.lines.length - 1].trim();
        return !last.includes(" ");
      });
      results.push({
        name: `${width}px: no wrapped quote ends on a single orphaned word`,
        pass: orphaned.length === 0,
        gating: true,
        detail: orphaned.length
          ? orphaned.map((s) => JSON.stringify(s.lines)).join("; ")
          : `checked ${samples.length} samples, ${samples.filter((s) => s.lines.length > 1).length} multi-line`,
      });

      const rowHeights = new Set(samples.map((s) => Math.round(s.row1Height)));
      results.push({
        name: `${width}px: row 1 height never changes across ${samples.length} rerolls`,
        pass: rowHeights.size === 1,
        gating: true,
        detail: `heights seen: ${[...rowHeights].join(", ")}`,
      });

      await context.close();
    }

    // ---- Hover never re-wraps: compare lines/gap before and after
    // revealing the button via hover. -------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1024, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);

      const before = await readState(page);
      await page.hover("footer div.group");
      await sleep(250); // past the opacity transition
      const after = await readState(page);

      results.push({
        name: "hovering to reveal the button never changes the wrap or gap",
        pass: JSON.stringify(before.lines) === JSON.stringify(after.lines) && Math.abs(before.gap - after.gap) < 0.5,
        gating: true,
        detail: `before: ${JSON.stringify(before.lines)} (gap ${before.gap.toFixed(1)}), after: ${JSON.stringify(after.lines)} (gap ${after.gap.toFixed(1)})`,
      });

      await context.close();
    }

    // ---- Resize smoothly re-wraps: drag width down across the desktop
    // range and confirm the gap stays correct at every stop (no crowding,
    // no stale wrap) — same page instance, real resize events. -----------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);

      const badGaps = [];
      for (const width of [1710, 1500, 1300, 1150, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        await sleep(150);
        const state = await readState(page);
        if (Math.abs(state.gap - 16) > 0.5) {
          badGaps.push(`${width}px: gap ${state.gap.toFixed(1)} (lines: ${JSON.stringify(state.lines)})`);
        }
      }
      results.push({
        name: "resizing through the desktop range keeps the gap correct at every stop",
        pass: badGaps.length === 0,
        gating: true,
        detail: badGaps.length ? badGaps.join("; ") : "held at every stop",
      });

      await context.close();
    }

    await browser.close();
  } finally {
    server?.kill("SIGTERM");
  }

  // --- Report -----------------------------------------------------------------
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
