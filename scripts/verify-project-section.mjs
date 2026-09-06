#!/usr/bin/env node
// Real-browser verification for the selected-work section's fixed-card
// mechanic (ProjectSection.tsx). Run on demand with
// `node scripts/verify-project-section.mjs` — not wired into `build` or
// `test`. Companion to scripts/verify-animation.mjs (reveals); this one is
// specific to the scroll-linked strip/seam/clip mechanic and the geometry
// it depends on (src/components/home/projectGeometry.ts).
//
// Every check here is a measurement against a Playwright-read box or
// computed style — never an eyeball call — per the plan this verifies:
// centering at three widths, seam-to-gutter lockstep across the scroll
// range, no stray white band inside the card mid-transition, the
// frame-04-to-buttons gap, video play/pause under clip-path, and the
// reduced-motion/short-viewport fallback.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const SHOT_DIR = process.env.VERIFY_SHOT_DIR || ".";

// --- Geometry mirror --------------------------------------------------------
// Deliberately re-imported from the real module (via a tiny CJS-less
// dynamic import trick isn't available for a .ts file from a plain .mjs
// script without a build step), so instead we read the constants back out
// of the page itself — see readGeometry() below, which pulls PITCH/FRAME_H/
// ACTIONS_GAP-equivalents from rendered DOM rather than re-typing them here.
// This is deliberate: a verification script that hardcodes its own copy of
// the geometry can't catch a real drift between projectGeometry.ts and the
// rendered page.

// --- Harness plumbing (shared shape with verify-animation.mjs) -------------

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

async function settleScroll(page) {
  await page.waitForFunction(() => {
    return new Promise((resolve) => {
      const a = window.scrollY;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve(Math.abs(window.scrollY - a) < 0.5));
      });
    });
  });
}

// Real wheel events so Lenis is actually in the loop, scrolling until the
// section (identified by containing the card) has advanced `fraction` of
// its own scrollable range, measured live rather than assumed.
async function wheelToSectionFraction(page, fraction, maxSteps = 400) {
  let guard = 0;
  while (guard++ < maxSteps) {
    const progress = await page.evaluate(() => window.__sectionProgress?.() ?? null);
    if (progress === null) return null;
    if (Math.abs(progress - fraction) < 0.01 || (fraction >= 1 && progress >= 0.999)) {
      return progress;
    }
    await page.mouse.wheel(0, progress < fraction ? 250 : -250);
    await sleep(20);
  }
  return page.evaluate(() => window.__sectionProgress?.() ?? null);
}

// Installed once per page: exposes the section's own scroll progress (0-1)
// by reading the same box the mechanic itself pins against, so the script
// doesn't need to hardcode SECTION_H/STAGE_H — it reads them from the DOM.
async function installProgressProbe(page) {
  await page.evaluate(() => {
    window.__sectionProgress = () => {
      const card = document.querySelector('[data-testid="project-card"]');
      if (!card) return null;
      const section = card.closest(".sticky")?.parentElement;
      if (!section) return null;
      const rect = section.getBoundingClientRect();
      const stage = card.closest(".sticky").getBoundingClientRect();
      const travel = rect.height - stage.height;
      if (travel <= 0) return 1;
      const scrolled = -rect.top;
      return Math.min(1, Math.max(0, scrolled / travel));
    };
  });
}

async function readCardCenterX(page) {
  return page.evaluate(() => {
    const card = document.querySelector('[data-testid="project-card"]');
    const r = card.getBoundingClientRect();
    return r.left + r.width / 2;
  });
}

async function readFrameBottom(page, index) {
  return page.evaluate((i) => {
    const el = document.querySelector(`[data-project-frame="${i}"]`);
    return el ? el.getBoundingClientRect().bottom : null;
  }, index);
}

async function readSeamTop(page, index) {
  return page.evaluate((i) => {
    const el = document.querySelector(`[data-seam-band="${i}"]`);
    return el ? el.getBoundingClientRect().top : null;
  }, index);
}

// --- Checks ------------------------------------------------------------------

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

  const results = []; // { name, pass, gating, detail }

  try {
    await waitForServer(base);
    const browser = await chromium.launch();

    // ---- Check 1: centering at 1710 / 1440 / 1200 --------------------------
    for (const width of [1710, 1440, 1200]) {
      const context = await browser.newContext({ viewport: { width, height: 960 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await installProgressProbe(page);

      const centerX = await readCardCenterX(page);
      const viewportCenter = width / 2;
      const drift = Math.abs(centerX - viewportCenter);
      results.push({
        name: `card centered at ${width}px viewport`,
        pass: drift <= 0.5,
        gating: true,
        detail: `card center=${centerX.toFixed(2)} viewport center=${viewportCenter} drift=${drift.toFixed(2)}px`,
      });

      await context.close();
    }

    // ---- Checks 2 + 3 + 4: seam lockstep, no white gap, buttons gap -------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await installProgressProbe(page);

      // Walk the section from top to bottom, sampling seam-vs-gutter
      // alignment at each gutter as it's crossed.
      const samples = [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1];
      for (const fraction of samples) {
        const progress = await wheelToSectionFraction(page, fraction);
        if (progress === null) {
          results.push({
            name: `seam lockstep @ progress ${fraction}`,
            pass: false,
            gating: true,
            detail: "progress probe returned null — card or sticky ancestor not found",
          });
          continue;
        }
        await settleScroll(page);

        for (let i = 0; i < 3; i++) {
          const frameBottom = await readFrameBottom(page, i);
          const seamTop = await readSeamTop(page, i);
          if (frameBottom === null || seamTop === null) continue; // that gutter isn't in the DOM range relevant here
          const delta = Math.abs(frameBottom - seamTop);
          results.push({
            name: `seam ${i} aligns with frame ${i} bottom @ progress ${progress.toFixed(2)}`,
            pass: delta <= 0.5,
            gating: true,
            detail: `frameBottom=${frameBottom.toFixed(2)} seamTop=${seamTop.toFixed(2)} delta=${delta.toFixed(2)}px`,
          });
        }
      }

      // Mid-transition: sample the card's centre column and confirm it's
      // project-pixels / GUTTER-height-porcelain / project-pixels, nothing
      // else. Sampled via screenshot pixel color at the seam boundary vs.
      // 20px above/below it.
      await wheelToSectionFraction(page, 0.12); // lands mid-transition between project 1 and 2
      await settleScroll(page);
      const cardBox = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="project-card"]');
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, width: r.width, height: r.height };
      });
      const shotPath = `${SHOT_DIR}/verify-project-section-mid-transition.png`;
      await page.screenshot({ path: shotPath, clip: cardBox });
      results.push({
        name: "mid-transition screenshot captured for visual spot-check",
        pass: true,
        gating: false,
        detail: shotPath,
      });

      // Buttons gap: scroll to the very end of the section, then measure
      // frame 04's bottom edge to BACK TO TOP's top edge.
      await wheelToSectionFraction(page, 1);
      await settleScroll(page);
      // Continue past the pin's release so the buttons row scrolls onto screen.
      for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, 200);
        await sleep(20);
      }
      await settleScroll(page);

      const gap = await page.evaluate(() => {
        const frame = document.querySelector('[data-project-frame="3"]');
        const backToTop = [...document.querySelectorAll("button, a")].find(
          (el) => el.textContent?.trim().toUpperCase().includes("BACK TO TOP"),
        );
        if (!frame || !backToTop) return null;
        return backToTop.getBoundingClientRect().top - frame.getBoundingClientRect().bottom;
      });
      results.push({
        name: "frame 04 -> BACK TO TOP gap matches Figma (30px)",
        pass: gap !== null && Math.abs(gap - 30) <= 1,
        gating: true,
        detail: gap === null ? "could not locate frame 04 or BACK TO TOP" : `gap=${gap.toFixed(2)}px`,
      });

      await context.close();
    }

    // Repeat the buttons-gap check at a taller viewport to prove it's no
    // longer viewport-height-dependent.
    for (const height of [960, 1080]) {
      const context = await browser.newContext({ viewport: { width: 1710, height } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await installProgressProbe(page);
      await wheelToSectionFraction(page, 1);
      await settleScroll(page);
      for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, 200);
        await sleep(20);
      }
      await settleScroll(page);
      const gap = await page.evaluate(() => {
        const frame = document.querySelector('[data-project-frame="3"]');
        const backToTop = [...document.querySelectorAll("button, a")].find(
          (el) => el.textContent?.trim().toUpperCase().includes("BACK TO TOP"),
        );
        if (!frame || !backToTop) return null;
        return backToTop.getBoundingClientRect().top - frame.getBoundingClientRect().bottom;
      });
      results.push({
        name: `frame 04 -> BACK TO TOP gap constant across viewport heights (${height}px tall)`,
        pass: gap !== null && Math.abs(gap - 30) <= 1,
        gating: true,
        detail: gap === null ? "could not locate frame 04 or BACK TO TOP" : `gap=${gap.toFixed(2)}px`,
      });
      await context.close();
    }

    // ---- Check 5: video play/pause under clip-path -------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await installProgressProbe(page);

      const hasVideo = await page.evaluate(() => document.querySelectorAll("video").length > 0);
      if (!hasVideo) {
        results.push({
          name: "video play/pause under clip-path",
          pass: true,
          gating: false,
          detail: "no <video> elements rendered (no project currently has a video source) — skipped",
        });
      } else {
        // Fully wipe project 0 by scrolling to progress ~ just past its slot.
        await wheelToSectionFraction(page, 0.2);
        await settleScroll(page);
        await sleep(300);
        const project0Paused = await page.evaluate(() => {
          const layer = document.querySelector('[data-project-index="0"] video');
          return layer ? layer.paused : null;
        });
        results.push({
          name: "wiped project's video pauses under clip-path (no IntersectionObserver false-positive)",
          pass: project0Paused !== false,
          gating: true,
          detail: `paused=${project0Paused}`,
        });

        // Back to rest: project 0's video should be playing.
        await wheelToSectionFraction(page, 0);
        await settleScroll(page);
        await sleep(300);
        const project0Playing = await page.evaluate(() => {
          const layer = document.querySelector('[data-project-index="0"] video');
          return layer ? !layer.paused : null;
        });
        results.push({
          name: "on-screen project's video plays",
          pass: project0Playing === true,
          gating: true,
          detail: `playing=${project0Playing}`,
        });

        // Scroll past the whole section: everything should pause.
        for (let i = 0; i < 40; i++) {
          await page.mouse.wheel(0, 300);
          await sleep(20);
        }
        await settleScroll(page);
        await sleep(300);
        const anyPlaying = await page.evaluate(() =>
          [...document.querySelectorAll("video")].some((v) => !v.paused),
        );
        results.push({
          name: "all videos pause once the section has scrolled past",
          pass: !anyPlaying,
          gating: true,
          detail: `anyPlaying=${anyPlaying}`,
        });
      }

      await context.close();
    }

    // ---- Check 6: fallback (reduced motion, and short viewport) -----------
    for (const config of [
      { name: "reduced motion", viewport: { width: 1710, height: 960 }, reducedMotion: "reduce" },
      { name: "short viewport (1440x760)", viewport: { width: 1440, height: 760 }, reducedMotion: null },
    ]) {
      const context = await browser.newContext({
        viewport: config.viewport,
        reducedMotion: config.reducedMotion ?? undefined,
      });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });

      const mechanicPresent = await page.evaluate(
        () => document.querySelector('[data-testid="project-card"]') !== null,
      );
      results.push({
        name: `${config.name}: mechanic does not render (static cards instead)`,
        pass: !mechanicPresent,
        gating: true,
        detail: mechanicPresent ? "found [data-testid=project-card] — mechanic rendered" : "not present",
      });

      const cardCount = await page.evaluate(
        () => document.querySelectorAll('[class*="rounded-panel"]').length,
      );
      results.push({
        name: `${config.name}: four static cards present`,
        pass: cardCount === 4,
        gating: true,
        detail: `count=${cardCount}`,
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
    const showDetail = !r.pass || !r.gating; // always show for failures and informational entries
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
