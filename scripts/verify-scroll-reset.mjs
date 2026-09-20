#!/usr/bin/env node
// Real-browser verification for the instant route-change scroll reset
// (SmoothScroll.tsx's route-change effect — fix pass item 6). Confirms two
// things a visual check can miss:
//   1. No transit — scrollY reads exactly 0 on every sample taken as soon
//      as this script can observe the destination page, never a ramp
//      through intermediate values. Before this fix, that ramp was the
//      animated DUR.scroll (1.2s) sweep the route-change effect used to run
//      unconditionally.
//   2. No reveal-then-reset flicker — a below-fold ScrollReveal element on
//      the destination page has NOT had its whileInView crossing fire.
//      Before this fix, the animated sweep scrolled *past* such elements on
//      its way back to 0 from wherever the previous page had scrolled to,
//      triggering their reveal mid-transit, which then sat in a bad state
//      once the sweep itself continued past them.
//
// Run on demand with `node scripts/verify-scroll-reset.mjs` against an
// already-running dev server (BASE_URL convention, same as
// verify-page-transition.mjs).

import { chromium } from "playwright";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
}

// Clicks a top-level nav link (HOME/ABOUT) and returns the path it lands on.
async function navTo(page, linkName, to) {
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: linkName, exact: true })
    .click();
  return to;
}

// Opens the WORK dropdown, clicks the entry at `index`, and returns its
// href — same dropdown-navigation shape verify-page-transition.mjs uses.
async function gotoProject(page, index) {
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("button", { name: "WORK" })
    .click();
  const link = page
    .getByRole("navigation", { name: "Main" })
    .locator("#nav-work-menu a[href^='/work/']")
    .nth(index);
  await link.waitFor({ state: "visible" });
  const href = await link.getAttribute("href");
  await link.click();
  return href;
}

// Samples window.scrollY every animation frame for `durationMs`, starting
// the instant this is called — the earliest point a script can observe
// post-navigation state, since it runs inside the page itself rather than
// round-tripping through Playwright per frame.
async function sampleScrollY(page, durationMs) {
  return page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const samples = [];
        const t0 = performance.now();
        function tick() {
          samples.push({ t: Math.round(performance.now() - t0), y: window.scrollY });
          if (performance.now() - t0 < ms) requestAnimationFrame(tick);
          else resolve(samples);
        }
        requestAnimationFrame(tick);
      }),
    durationMs,
  );
}

// A below-fold [data-reveal] element (ScrollReveal.tsx) that has never had
// its whileInView crossing fire still sits at its own `initial` opacity, 0
// — a nonzero reading here this soon after landing means something
// scrolled past it, which an instant jump to 0 never would.
async function belowFoldRevealOpacities(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    return Array.from(document.querySelectorAll("[data-reveal]"))
      .filter((el) => el.getBoundingClientRect().top > vh)
      .slice(0, 8) // a representative sample is enough; some pages have dozens
      .map((el) => Number.parseFloat(getComputedStyle(el).opacity));
  });
}

// `act` performs the navigating click and returns the destination pathname
// — resolved dynamically (the WORK dropdown's own href), not hardcoded, so
// this stays correct however LIVE_PROJECTS is ordered.
async function runCase(browser, { label, setup, act }) {
  const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
  const page = await context.newPage();
  await setup(page);

  const scrolledBefore = await page.evaluate(() => window.scrollY);
  record(
    `${label}: source page is genuinely scrolled before navigating`,
    scrolledBefore > 50,
    `scrollY=${scrolledBefore}`,
  );

  const to = await act(page);
  await page.waitForURL((url) => url.pathname === to);

  const samples = await sampleScrollY(page, 900);
  const allZero = samples.every((s) => s.y === 0);
  record(
    `${label}: destination lands at scrollY 0 with no visible transit`,
    allZero,
    JSON.stringify(samples.filter((_, i) => i < 6 || !allZero)),
  );

  const opacities = await belowFoldRevealOpacities(page);
  const noneRevealed = opacities.every((o) => o === 0);
  record(
    `${label}: below-fold reveals were not triggered by a scroll-through`,
    opacities.length === 0 || noneRevealed,
    JSON.stringify(opacities),
  );

  await context.close();
}

async function main() {
  const browser = await chromium.launch();

  await runCase(browser, {
    label: "Home -> case study",
    setup: async (page) => {
      await page.goto(BASE, { waitUntil: "networkidle" });
      await page.waitForFunction(
        () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
        { timeout: 4000 },
      );
      await page.evaluate(() => window.scrollTo(0, 800));
      await sleep(300);
    },
    act: (page) => gotoProject(page, 0),
  });

  await runCase(browser, {
    label: "case study -> Home",
    setup: async (page) => {
      await page.goto(`${BASE}/work/f3global`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, 2500));
      await sleep(300);
    },
    act: (page) => navTo(page, "HOME", "/"),
  });

  await runCase(browser, {
    label: "case study -> About",
    setup: async (page) => {
      await page.goto(`${BASE}/work/f3global`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, 2500));
      await sleep(300);
    },
    act: (page) => navTo(page, "ABOUT", "/about"),
  });

  await runCase(browser, {
    label: "case study -> case study",
    setup: async (page) => {
      await page.goto(`${BASE}/work/f3global`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, 2500));
      await sleep(300);
    },
    act: (page) => gotoProject(page, 1),
  });

  await browser.close();

  console.log("\n=== Results ===\n");
  let failed = 0;
  for (const r of results) {
    const mark = r.pass ? "PASS" : "FAIL";
    if (!r.pass) failed++;
    console.log(`[${mark}] ${r.name}${!r.pass ? `  (${r.detail})` : ""}`);
  }
  if (failed > 0) {
    console.error(`\n${failed} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
