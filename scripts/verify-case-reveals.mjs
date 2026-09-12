#!/usr/bin/env node
// Real-browser verification for this session's two additions only — stat
// count-up (StatValue.tsx) and block reveals (CaseStudySection.tsx's
// ScrollReveal wrapping). Run on demand with
// `node scripts/verify-case-reveals.mjs` — not wired into `build` or
// `test`. Harness plumbing (server bootstrap, port selection) copied
// verbatim from verify-case-carousel.mjs, per this session's own
// instruction not to extend the harness beyond what these two items need.
//
// Deviation from the plan, disclosed rather than silent: the plan's own
// "panel index unchanged" check called for diffing against a pre-change
// baseline captured via `git stash`. This branch's working tree already
// carries unrelated uncommitted P3 work (Carousel.tsx/CarouselStage.tsx/
// useCarouselScrub.ts etc., per `git status` at session start) — stashing
// would revert past that WIP too, not just this session's two files, which
// is a bigger and less reversible operation than this check needs. Check 5
// below instead asserts the panel's active-section computation directly
// against `[data-section]` geometry read from the live DOM: `transform`/
// `opacity` (all ScrollReveal ever sets) cannot move a static-position
// box's own rect or change document height, so a live structural assertion
// proves the same invariant a before/after diff would, without touching
// the branch's other in-flight changes.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const PAGE_PATH = "/work/f3global";
const SHOT_DIR = process.env.VERIFY_SHOT_DIR || ".";

// Source of truth for the stats block, read for comparison rather than
// retyped as the expected animation targets — content/case-studies/f3global.ts.
const STAT_VALUES = ["30+", "3", "10+", "20+"];

// --- Harness plumbing (verbatim shape, verify-case-carousel.mjs) ----------

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

// Finds the [data-reveal] ancestor of the element whose text matches, and
// its absolute (document-pixel) top — content-driven, not a hardcoded
// selector index, so this still works if a block is reordered.
async function findRevealByText(page, text) {
  return page.evaluate((needle) => {
    const all = Array.from(document.querySelectorAll("p,h2,h3"));
    const el = all.find((e) => e.textContent?.trim() === needle);
    const reveal = el?.closest("[data-reveal]");
    if (!reveal) return null;
    const rect = reveal.getBoundingClientRect();
    return { top: rect.top + window.scrollY, opacity: getComputedStyle(reveal).opacity };
  }, text);
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

    // ---- Check 1: reveals fire once ---------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      // "OUTCOME & IMPACT" title row sits well below the fold at scrollY=0 —
      // a real off-screen reveal to prove the pre-crossing state, not one
      // already visible on load.
      const before = await findRevealByText(page, "OUTCOME & IMPACT");
      results.push({
        name: "title row reveal starts at opacity:0 before scrolling into view",
        pass: !!before && before.opacity === "0",
        gating: true,
        detail: JSON.stringify(before),
      });

      if (before) {
        await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 400)), before.top);
        await sleep(650); // DUR.reveal (500ms) + settle margin
        const entered = await findRevealByText(page, "OUTCOME & IMPACT");
        results.push({
          name: "reveal reaches opacity:1 once scrolled into view",
          pass: entered?.opacity === "1",
          gating: true,
          detail: JSON.stringify(entered),
        });

        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(300);
        const backAtTop = await findRevealByText(page, "OUTCOME & IMPACT");
        await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 400)), before.top);
        await sleep(300);
        const scrolledAgain = await findRevealByText(page, "OUTCOME & IMPACT");
        results.push({
          name: "once:true — stays opacity:1 scrolling away and back, no re-trigger flicker",
          pass: backAtTop?.opacity === "1" && scrolledAgain?.opacity === "1",
          gating: true,
          detail: `backAtTop=${backAtTop?.opacity} scrolledAgain=${scrolledAgain?.opacity}`,
        });
      }

      await context.close();
    }

    // ---- Checks 2-4: stat count-up (value, gradient, suffix stability) ----
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const statsTop = await page.evaluate(() => {
        const p = Array.from(document.querySelectorAll("p")).find((e) =>
          e.textContent?.trim() === "High-fidelity screens delivered across desktop, tablet, and mobile.",
        );
        const block = p?.closest("[data-reveal]");
        if (!block) return null;
        return block.getBoundingClientRect().top + window.scrollY;
      });

      results.push({ name: "stats block reveal found", pass: statsTop !== null, gating: true });

      if (statsTop !== null) {
        // Pre-entry: numeral hasn't started counting — visible text reads
        // "0" (+ suffix), not the source value, proving the animation
        // hasn't run yet rather than the context defaulting to "revealed".
        const preValues = await page.evaluate(() => {
          const nodes = Array.from(document.querySelectorAll('p[aria-hidden="true"].text-gradient-project'));
          return nodes.map((p) => {
            const numeral = p.querySelector(".inline-grid > span:not(.invisible)")?.textContent ?? "";
            const suffixNode = Array.from(p.childNodes).find((n) => n.nodeType === 3);
            return numeral + (suffixNode?.textContent ?? "");
          });
        });
        results.push({
          name: "numerals read 0 (+ suffix) before the block enters view",
          pass: preValues.length === 4 && preValues.every((v, i) => v.startsWith("0") && v !== STAT_VALUES[i]),
          gating: true,
          detail: JSON.stringify(preValues),
        });

        // Suffix-position sampling starts now, spanning the scroll-into-view
        // + the full DUR.page count, so it catches any mid-count shift.
        const suffixXSamplesPromise = (async () => {
          const xs = [];
          for (let i = 0; i < 10; i++) {
            const x = await page.evaluate(() => {
              const p = Array.from(document.querySelectorAll('p[aria-hidden="true"].text-gradient-project'))[0];
              if (!p) return null;
              const textNode = Array.from(p.childNodes).find((n) => n.nodeType === 3 && n.textContent === "+");
              if (!textNode) return null;
              const range = document.createRange();
              range.selectNodeContents(textNode);
              return range.getBoundingClientRect().x;
            });
            if (x !== null) xs.push(x);
            await sleep(100);
          }
          return xs;
        })();

        await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 400)), statsTop);
        const suffixXSamples = await suffixXSamplesPromise;
        await sleep(400); // DUR.page (800ms) total elapsed by now, plus settle

        const postValues = await page.evaluate(() => {
          const nodes = Array.from(document.querySelectorAll('p[aria-hidden="true"].text-gradient-project'));
          return nodes.map((p) => {
            const numeral = p.querySelector(".inline-grid > span:not(.invisible)")?.textContent ?? "";
            const suffixNode = Array.from(p.childNodes).find((n) => n.nodeType === 3);
            return numeral + (suffixNode?.textContent ?? "");
          });
        });
        results.push({
          name: "numerals settle to the exact source values (30+, 3, 10+, 20+)",
          pass: JSON.stringify(postValues) === JSON.stringify(STAT_VALUES),
          gating: true,
          detail: JSON.stringify(postValues),
        });

        const distinctX = new Set(suffixXSamples.map((x) => x.toFixed(1)));
        results.push({
          name: "'+' suffix position is stable throughout the count (reserved-width grid holds)",
          pass: suffixXSamples.length >= 5 && distinctX.size === 1,
          gating: true,
          detail: JSON.stringify(suffixXSamples),
        });

        // Gradient clip survives the grid split: the ancestor still carries
        // its own background-clip:text + transparent color, and the
        // reserved-width copy is truly non-painting (visibility:hidden)
        // while still occupying layout width.
        const clipInfo = await page.evaluate(() => {
          const p = Array.from(document.querySelectorAll('p[aria-hidden="true"].text-gradient-project'))[0];
          const invisible = p?.querySelector(".invisible");
          const style = p && getComputedStyle(p);
          return {
            backgroundClip: style?.webkitBackgroundClip || style?.backgroundClip,
            backgroundImage: style?.backgroundImage,
            color: style?.color,
            invisibleVisibility: invisible && getComputedStyle(invisible).visibility,
            invisibleWidth: invisible?.getBoundingClientRect().width,
          };
        });
        results.push({
          name: "gradient clip + color:transparent still apply through the grid wrapper",
          pass:
            clipInfo.backgroundClip === "text" &&
            clipInfo.backgroundImage !== "none" &&
            (clipInfo.color === "rgba(0, 0, 0, 0)" || clipInfo.color === "transparent") &&
            clipInfo.invisibleVisibility === "hidden" &&
            (clipInfo.invisibleWidth ?? 0) > 0,
          gating: true,
          detail: JSON.stringify(clipInfo),
        });

        // Non-gating screenshot for a manual visual spot-check — same
        // precedent as verify-case-carousel.mjs's own bars-row attachment.
        try {
          const box = await page.evaluate(() => {
            const p = Array.from(document.querySelectorAll('p[aria-hidden="true"].text-gradient-project'))[0];
            const r = p?.getBoundingClientRect();
            if (!r || r.width <= 0 || r.height <= 0) return null;
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          });
          if (box) {
            const path = `${SHOT_DIR}/verify-case-reveals-stat.png`;
            await page.screenshot({ path, clip: box });
            results.push({ name: "settled stat screenshot captured for visual spot-check", pass: true, gating: false, detail: path });
          }
        } catch (err) {
          results.push({ name: "settled stat screenshot captured", pass: true, gating: false, detail: `capture failed: ${err.message}` });
        }
      }

      await context.close();
    }

    // ---- Check 5: panel index / section geometry unaffected ---------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const sections = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-section]")).map((el) => ({
          id: el.dataset.section,
          top: el.getBoundingClientRect().top + window.scrollY,
        })),
      );

      results.push({
        name: "all four case-study sections found with monotonically increasing tops",
        pass: sections.length === 4 && sections.every((s, i) => i === 0 || s.top > sections[i - 1].top),
        gating: true,
        detail: JSON.stringify(sections),
      });

      // READING_LINE = 0.4 (caseStudyGeometry.ts) — reproduced here as a
      // literal to compute the *expected* active section independently,
      // then checked against the panel's own rendered active link, not
      // against each other's source.
      const READING_LINE = 0.4;
      let panelMatchesGeometry = true;
      const detail = [];
      for (const s of sections) {
        const y = s.top - 1040 * READING_LINE + 5; // just past this section's own crossing
        await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), y);
        await sleep(150);
        const activeHref = await page.evaluate(() => document.querySelector('a[aria-current="location"]')?.getAttribute("href") ?? null);
        const ok = activeHref === `#${s.id}`;
        if (!ok) panelMatchesGeometry = false;
        detail.push(`${s.id}: active=${activeHref}`);
      }
      results.push({
        name: "panel's active section matches each [data-section]'s own geometry (reveal wrappers didn't shift layout)",
        pass: panelMatchesGeometry,
        gating: true,
        detail: detail.join(" | "),
      });

      await context.close();
    }

    // ---- Check 6: carousel excluded from reveal, still pins ---------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const info = await page.evaluate(() => {
        const stage = document.querySelector("[data-carousel-stage]");
        return {
          found: !!stage,
          hasRevealAncestor: !!stage?.closest("[data-reveal]"),
          position: stage ? getComputedStyle(stage).position : null,
        };
      });
      results.push({
        name: "carousel stage has no [data-reveal] ancestor and stays position:sticky",
        pass: info.found && !info.hasRevealAncestor && info.position === "sticky",
        gating: true,
        detail: JSON.stringify(info),
      });

      await context.close();
    }

    // ---- Check 7: reduced motion — instant final state, no animation ------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const values = await page.evaluate(() =>
        Array.from(document.querySelectorAll("p.text-gradient-project")).map((p) => p.textContent?.trim()),
      );
      const revealTransforms = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-reveal]")).map((el) => getComputedStyle(el).transform),
      );

      results.push({
        name: "reduced motion: stat values render final source strings immediately, no counting",
        pass: STAT_VALUES.every((v) => values.includes(v)),
        gating: true,
        detail: JSON.stringify(values),
      });
      results.push({
        name: "reduced motion: reveal wrappers carry no transform (plain tags, per ScrollReveal's reduced branch)",
        pass: revealTransforms.every((t) => t === "none"),
        gating: true,
        detail: JSON.stringify([...new Set(revealTransforms)]),
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
