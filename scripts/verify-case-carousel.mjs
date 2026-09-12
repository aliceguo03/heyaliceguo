#!/usr/bin/env node
// Real-browser verification for the Design Decisions carousel's pinned
// scrub mechanic (Carousel.tsx / CarouselStage.tsx / useCarouselScrub.ts).
// Run on demand with `node scripts/verify-case-carousel.mjs` — not wired
// into `build` or `test`. Same harness shape as verify-case-panel.mjs;
// geometry is read back out of the DOM (data-carousel-* attributes,
// computed styles), never retyped from motion.ts/caseStudyGeometry.ts, so
// this can actually catch drift between those files and the render.
//
// Scroll driving: plain `window.scrollTo`, not real wheel events. The
// mechanic's scroll source (useCarouselScrub.ts) is page-level
// `useScroll()` from motion/react with no `target` — the same shape
// useCaseStudyPanel.ts already uses, which verify-case-panel.mjs already
// validates via window.scrollTo successfully. Real wheel events are the
// right tool for ProjectSection.tsx's `useScroll({ target, offset })` form
// (verify-project-section.mjs) because that mechanic reads Lenis-smoothed
// scroll progress relative to a target element; this one doesn't.
//
// Continuity note (per this session's own instructions): the bar-fill
// check below samples getComputedStyle-derived transforms, which can look
// correct while a real single-frame artifact exists. If this doesn't hold
// up under review, the next step is dense screenshot capture across the
// boundary frames (see check 8's non-gating screenshots), not re-tuning
// the numeric sample.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const PAGE_PATH = "/work/f3global";
const SHOT_DIR = process.env.VERIFY_SHOT_DIR || ".";

// --- Harness plumbing (shared shape with verify-case-panel.mjs) -----------

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

// The stage's own geometry, read from the rendered page rather than
// re-imported from motion.ts/caseStudyGeometry.ts — pinStart is derived
// exactly the way useCarouselScrub.ts derives it internally (spacer's
// absolute top minus the stage's resolved `top`); total scrub is the
// spacer's own rendered height minus the stage's (the spacer is sized
// explicitly to stage-height-plus-scrub, not padding — see
// useCarouselScrub.ts's own comment for why padding doesn't actually hold
// a sticky child in place), divided by however many bars actually
// rendered. A real drift between those files and the component would show
// up as a wrong geometry read here, not get silently reproduced.
async function readGeometry(page) {
  return page.evaluate(() => {
    const spacer = document.querySelector("[data-carousel-spacer]");
    const stage = document.querySelector("[data-carousel-stage]");
    if (!spacer || !stage) return null;
    const spacerRect = spacer.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const stageCssTop = getComputedStyle(stage).top;
    const spacerTopAbs = spacerRect.top + window.scrollY;
    const pinStart = spacerTopAbs - Number.parseFloat(stageCssTop);
    // The spacer's own height is an explicit px value (useCarouselScrub.ts:
    // measured stage height + total scrub — NOT padding-bottom; that variant
    // was tried and doesn't actually hold a sticky child in place, see the
    // hook's own comment), so total scrub is just the difference.
    const totalScrub = spacerRect.height - stageRect.height;
    const itemCount = document.querySelectorAll("[data-carousel-bar]").length;
    return {
      pinStart,
      totalScrub,
      itemCount,
      itemScrub: itemCount > 0 ? totalScrub / itemCount : 0,
      stageCssTop,
      spacerHeight: spacerRect.height,
      stageHeight: stageRect.height,
    };
  });
}

// One committed snapshot of the mechanic's whole state: the committed
// index (data-carousel-index), which item is actually opacity:1 (a second,
// independent read of the same fact, off computed style rather than the
// attribute), each item's heading text (content, not assumed order), the
// raw --carousel-progress value, and every bar's rendered fill fraction —
// derived from the fill layer's actual computed transform matrix, not the
// CSS variable, so this measures what the browser painted rather than
// trusting the calc() chain that produced it.
async function readSnapshot(page) {
  return page.evaluate(() => {
    const stage = document.querySelector("[data-carousel-stage]");
    const items = Array.from(document.querySelectorAll("[data-carousel-item]"));
    const opacities = items.map((el) => Number.parseFloat(getComputedStyle(el).opacity));
    const bars = Array.from(document.querySelectorAll("[data-carousel-bar]")).map((bar) => {
      const fill = bar.firstElementChild;
      const width = bar.getBoundingClientRect().width;
      const tx = new DOMMatrixReadOnly(getComputedStyle(fill).transform).m41;
      return width === 0 ? 0 : Math.min(1, Math.max(0, 1 + tx / width));
    });
    return {
      scrollY: window.scrollY,
      committedIndex: stage ? Number.parseInt(stage.dataset.carouselIndex ?? "-1", 10) : null,
      activeByOpacity: opacities.findIndex((o) => o > 0.5),
      headings: items.map((el) => el.textContent?.trim() ?? ""),
      progress: stage ? Number.parseFloat(getComputedStyle(stage).getPropertyValue("--carousel-progress")) : null,
      bars,
      imgCount: document.querySelectorAll("[data-carousel-stage] img").length,
    };
  });
}

async function activeSectionHref(page) {
  return page.evaluate(() => {
    const el = document.querySelector('a[aria-current="location"]');
    return el ? el.getAttribute("href") : null;
  });
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

    // ---- Check 1: exactly one carousel stage; pin shape is sane ------------
    let geometry;
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const stageCount = await page.evaluate(() => document.querySelectorAll("[data-carousel-stage]").length);
      results.push({
        name: "exactly one carousel stage at 1710x1040",
        pass: stageCount === 1,
        gating: true,
        detail: `found ${stageCount}`,
      });

      geometry = await readGeometry(page);
      results.push({
        name: "geometry reads back from the DOM (spacer + stage + bars found)",
        pass: !!geometry && geometry.itemCount === 3,
        gating: true,
        detail: JSON.stringify(geometry),
      });
      results.push({
        name: "stage pins at STICKY_TOP (106px)",
        pass: !!geometry && geometry.stageCssTop === "106px",
        gating: true,
        detail: geometry?.stageCssTop,
      });
      results.push({
        name: "total scrub is positive and divides evenly across all items",
        pass: !!geometry && geometry.totalScrub > 0 && Math.abs(geometry.totalScrub - geometry.itemScrub * geometry.itemCount) < 1,
        gating: true,
        detail: `totalScrub=${geometry?.totalScrub} itemScrub=${geometry?.itemScrub} itemCount=${geometry?.itemCount}`,
      });

      // The only two sticky-with-inline-top elements on the whole page
      // should be the info panel and this stage — proof the pin didn't
      // leak a second copy anywhere else.
      const stickyCount = await page.evaluate(
        () => document.querySelectorAll("[data-info-panel], [data-carousel-stage]").length,
      );
      results.push({
        name: "exactly two pinned elements on the page (info panel + carousel stage)",
        pass: stickyCount === 2,
        gating: true,
        detail: `found ${stickyCount}`,
      });

      await context.close();
    }

    if (!geometry) {
      throw new Error("Could not read carousel geometry — aborting remaining checks.");
    }

    // ---- Check 2: does not drift while pinned -------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const mid = geometry.pinStart + geometry.totalScrub / 2;
      await page.evaluate((y) => window.scrollTo(0, y), mid);
      await sleep(150);
      const before = await page.evaluate(() => document.querySelector("[data-carousel-stage]").getBoundingClientRect().top);
      await page.evaluate((y) => window.scrollTo(0, y + 50), mid);
      await sleep(150);
      const after = await page.evaluate(() => document.querySelector("[data-carousel-stage]").getBoundingClientRect().top);

      results.push({
        name: "stage does not drift while pinned",
        pass: Math.abs(before - after) < 1,
        gating: true,
        detail: `before=${before} after=${after}`,
      });

      await context.close();
    }

    // ---- Check 3: index + fill across the whole pin, densely sampled -------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const { pinStart, totalScrub, itemScrub, itemCount } = geometry;
      const SAMPLE_STEP = 25; // px — dense enough to prove continuity, not just endpoints
      const from = pinStart - 100;
      const to = pinStart + totalScrub + 100;

      const samples = [];
      for (let y = from; y <= to; y += SAMPLE_STEP) {
        await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), y);
        await sleep(15);
        const snap = await readSnapshot(page);
        samples.push({ y, ...snap });
      }

      // -- Index boundaries: 40px on either side of each crossing lands on
      //    the expected item, read off the item's own heading text, not a
      //    hardcoded string.
      const headingTextsAtStart = samples[0].headings;
      let boundaryPass = true;
      const boundaryDetail = [];
      for (let k = 0; k <= itemCount; k++) {
        const boundaryY = pinStart + k * itemScrub;
        const before = k === 0 ? 0 : Math.min(itemCount - 1, k - 1);
        const after = Math.min(itemCount - 1, k);

        // 600ms settle, not the dense sweep's 15ms: activeByOpacity reads a
        // CSS transition (DUR.reveal, 500ms) actually completing, unlike
        // committedIndex (a plain React state flip) or --carousel-progress
        // (a MotionValue with no transition) — both of which update within
        // a frame regardless of sleep length.
        await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), boundaryY - 40);
        await sleep(600);
        const beforeSnap = await readSnapshot(page);
        await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), boundaryY + 40);
        await sleep(600);
        const afterSnap = await readSnapshot(page);

        const beforeOk = k === 0 || (beforeSnap.committedIndex === before && beforeSnap.activeByOpacity === before);
        const afterOk = afterSnap.committedIndex === after && afterSnap.activeByOpacity === after;
        if (!beforeOk || !afterOk) boundaryPass = false;
        boundaryDetail.push(
          `k=${k}: before(idx=${beforeSnap.committedIndex},opacity=${beforeSnap.activeByOpacity}) after(idx=${afterSnap.committedIndex},opacity=${afterSnap.activeByOpacity})`,
        );
      }
      results.push({
        name: "committed index (and opacity-active item) match expectations at every boundary ±40px",
        pass: boundaryPass,
        gating: true,
        detail: boundaryDetail.join(" | "),
      });
      results.push({
        name: `${itemCount} distinct heading texts found (content-driven, not hardcoded)`,
        pass: new Set(headingTextsAtStart.filter(Boolean)).size === itemCount,
        gating: true,
        detail: JSON.stringify(headingTextsAtStart),
      });

      // -- Monotonic progress across the whole sweep.
      const progresses = samples.map((s) => s.progress).filter((p) => p !== null);
      let monotonic = true;
      for (let i = 1; i < progresses.length; i++) {
        if (progresses[i] < progresses[i - 1] - 1e-6) monotonic = false;
      }
      results.push({
        name: "--carousel-progress is monotonic non-decreasing across the sweep",
        pass: monotonic,
        gating: true,
        detail: monotonic ? undefined : JSON.stringify(progresses),
      });

      // -- Continuity, not stepping: for each bar, count distinct fraction
      //    values strictly between 0 and 1 across the whole sweep. A
      //    correctly continuous fill produces many; a stepped
      //    implementation (opacity/visibility flips only) would produce
      //    ~0, since a bar would jump straight from 0 to 1.
      let continuityPass = true;
      const continuityDetail = [];
      for (let bar = 0; bar < itemCount; bar++) {
        const inBetween = new Set(
          samples
            .map((s) => s.bars[bar])
            .filter((f) => f !== undefined && f > 0.02 && f < 0.98)
            .map((f) => f.toFixed(3)),
        );
        const ok = inBetween.size >= 15;
        if (!ok) continuityPass = false;
        continuityDetail.push(`bar ${bar}: ${inBetween.size} distinct intermediate fractions`);
      }
      results.push({
        name: "each bar's fill passes through >=15 distinct intermediate values (continuous, not stepped)",
        pass: continuityPass,
        gating: true,
        detail: continuityDetail.join(" | "),
      });

      // -- Completed bars read ~1, upcoming bars read ~0, at every sample —
      //    checked against each sample's own committed index rather than a
      //    fixed offset.
      let restStatesPass = true;
      for (const s of samples) {
        for (let bar = 0; bar < itemCount; bar++) {
          const f = s.bars[bar];
          if (bar < s.committedIndex && f < 0.98) restStatesPass = false;
          if (bar > s.committedIndex && f > 0.02) restStatesPass = false;
        }
      }
      results.push({
        name: "completed bars are full and upcoming bars are empty at every sample",
        pass: restStatesPass,
        gating: true,
      });

      // -- No src swap: all `items.length` <img> elements present at every
      //    sample.
      const imgCountsOk = samples.every((s) => s.imgCount === geometry.itemCount);
      results.push({
        name: "all figure <img> elements stay mounted throughout (no src swap)",
        pass: imgCountsOk,
        gating: true,
      });

      // -- The info panel's active section stays "design-decisions" for
      //    the whole pin.
      await page.evaluate((yy) => window.scrollTo(0, yy), pinStart + totalScrub / 2);
      await sleep(150);
      const sectionHref = await activeSectionHref(page);
      results.push({
        name: "info panel's active section stays #design-decisions mid-pin",
        pass: sectionHref === "#design-decisions",
        gating: true,
        detail: sectionHref,
      });

      // -- Non-gating: dense screenshots of the bars row for a visual
      //    spot-check, per this session's own instruction to go straight to
      //    screenshots rather than re-trusting numeric sampling if anything
      //    looks off. Wrapped in try/catch and bounds-checked so a failed
      //    clip (e.g. the row momentarily out of the viewport) can't crash
      //    a gating run — this is a non-gating, best-effort attachment.
      const shotYs = [pinStart, pinStart + itemScrub * 0.5, pinStart + itemScrub, pinStart + totalScrub * 0.9];
      const shotPaths = [];
      try {
        for (const [i, y] of shotYs.entries()) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await sleep(150);
          const box = await page.evaluate(() => {
            const bars = document.querySelector("[data-carousel-bar]")?.parentElement;
            if (!bars) return null;
            const r = bars.getBoundingClientRect();
            if (r.width <= 0 || r.height <= 0 || r.x < 0 || r.y < 0) return null;
            if (r.x + r.width > window.innerWidth || r.y + r.height > window.innerHeight) return null;
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          });
          if (box) {
            const path = `${SHOT_DIR}/verify-case-carousel-bars-${i}.png`;
            await page.screenshot({ path, clip: box });
            shotPaths.push(path);
          }
        }
      } catch (err) {
        shotPaths.push(`(screenshot capture failed: ${err.message})`);
      }
      results.push({
        name: "bars-row screenshots captured for visual spot-check",
        pass: true,
        gating: false,
        detail: shotPaths.join(", ") || "(none captured)",
      });

      await context.close();
    }

    // ---- Check 4: reduced motion — P1 stack, no pin -------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const stageCount = await page.evaluate(() => document.querySelectorAll("[data-carousel-stage]").length);
      const barCount = await page.evaluate(() => document.querySelectorAll("[data-carousel-bar]").length);
      const proseFigureImgCount = await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll("h1,h2,h3,p")).find(
          (el) => el.textContent?.trim() === "Pivoting the Admin Portal",
        );
        const container = heading?.closest("section") ?? document.body;
        return container.querySelectorAll("img").length;
      });

      results.push({
        name: "reduced motion: no pinned stage, no bars",
        pass: stageCount === 0 && barCount === 0,
        gating: true,
        detail: `stage=${stageCount} bars=${barCount}`,
      });
      results.push({
        name: "reduced motion: all three items' figures present (P1 stack)",
        pass: proseFigureImgCount >= 3,
        gating: true,
        detail: `imgs=${proseFigureImgCount}`,
      });

      await context.close();
    }

    // ---- Check 5: 1440x760 — below MIN_CAROUSEL_VIEWPORT_H, same fallback --
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 760 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const stageCount = await page.evaluate(() => document.querySelectorAll("[data-carousel-stage]").length);
      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

      results.push({
        name: "1440x760: below MIN_CAROUSEL_VIEWPORT_H, fallback renders (no pinned stage)",
        pass: stageCount === 0,
        gating: true,
        detail: `stage=${stageCount}`,
      });
      results.push({
        name: "1440x760: no horizontal overflow",
        pass: !overflowX,
        gating: true,
      });

      await context.close();
    }

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
