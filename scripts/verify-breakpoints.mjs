#!/usr/bin/env node
// Real-browser verification for the content-derived breakpoints added in
// Session R1.1 Parts B-D: --breakpoint-footer and --breakpoint-nav (644),
// globals.css's "Breakpoints" comment. --breakpoint-footer moved from 499 to
// 519 in Session R1.1 Part C when the tablet footer's shell padding was
// corrected to match Figma (see that comment) and cost the row 20px of
// content width.
//
// --breakpoint-footer-desktop went through several quote-driven values
// (1124, 1137, 1175) before the natural-minimum-line-wrapping session
// removed the quote-overlap failure mode entirely (the quote is a real,
// shrinking/wrapping flex sibling now, not an absolutely-positioned,
// nowrap-forced block) and reverted it to --breakpoint-laptop's own value,
// 1024 — see that token's own comment in globals.css for the full history.
// Because it's no longer content-derived, the desktop-tier checks below
// only assert it HOLDS (no unexpected wrap, no overlap) — there's no
// "breaks just below" direction to assert anymore, since nothing in this
// row actually fails at any width down to 700px (verified by hand while
// re-deriving this). scripts/verify-footer-quote.mjs owns the checks that
// exercise the quote mechanism's own behavior across that range.
//
// Run on demand with `node scripts/verify-breakpoints.mjs` — not wired into
// `build` or `test`. Harness plumbing copied verbatim from
// verify-project-section.mjs.
//
// --breakpoint-footer and --breakpoint-nav ARE still content-derived, so
// those two get checked in BOTH directions, deliberately, not just "does it
// still fit at the number we picked": the floor is only real if the
// component also breaks just below it. Asserting only the holds-at
// direction would let the true floor silently drift upward (a copy change
// that makes something wrap sooner) without ever failing — the check would
// just keep passing at the old number while quietly protecting less than
// it used to. Asserting the breaks-just-below direction too means that kind
// of drift shows up as a failure demanding the constant be re-derived, not
// as a check that stays green while protecting nothing.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const FOOTER_BREAKPOINT = 519;
const NAV_BREAKPOINT = 644;
const FOOTER_DESKTOP_BREAKPOINT = 1024;
const MIN_GUTTER = 20; // the page-x ramp's own floor value (--spacing-md)

// --- Harness plumbing (shared shape with verify-project-section.mjs) -------

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

// --- Footer: forces the tablet-tier footer visible regardless of the
// current footer:/laptop: gate, so this checks the TIER'S OWN content fit,
// independent of where the CSS switch currently sits — the same
// independence the breakpoint itself is supposed to have from the type step
// and the nav. Returns every wrapped text node's own {text, height,
// lineHeight}, empty if none wrapped.
async function readFooterWraps(page) {
  return page.evaluate(() => {
    const footers = document.querySelectorAll("footer");
    // DOM order: [0] laptop (>=1024), [1] tablet (this tier), [2] mobile.
    footers[0].style.display = "none";
    footers[1].style.display = "flex";
    footers[2].style.display = "none";
    const wrapped = [];
    for (const el of footers[1].querySelectorAll("p, a")) {
      const text = el.textContent.trim();
      if (!text) continue;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const height = el.getBoundingClientRect().height;
      if (height > lineHeight * 1.3) {
        wrapped.push({ text, height: Math.round(height), lineHeight: Math.round(lineHeight) });
      }
    }
    return wrapped;
  });
}

// --- Footer (desktop tier): same technique as readFooterWraps, forcing
// footers[0] (the >=--breakpoint-footer-desktop variant, with the quote)
// visible instead of footers[1]. A separate reader rather than a shared one
// with a footer-index parameter — readFooterWraps's own DOM-order comment
// is what a caller needs to get right, and duplicating the four-line body
// here keeps that comment attached to the tier it actually describes.
//
// The quote paragraph is deliberately EXCLUDED from the generic wrap check
// below — since the natural-minimum-line-wrapping session, the quote is
// SUPPOSED to wrap into more lines as the row narrows (CLAUDE.md "Footer
// quote"), so flagging that here would be reporting correct, intended
// behavior as a failure. What still matters, and is checked separately: the
// quote can never overlap the circle-back cluster, which real flexbox
// (both siblings `shrink-0`/shrinking normally, not one absolutely
// positioned over the other) guarantees structurally rather than by a
// measured margin — this assertion exists to catch a regression if that
// layout ever changes back, not because the margin is expected to be tight.
async function readDesktopFooterWraps(page) {
  return page.evaluate(() => {
    const footers = document.querySelectorAll("footer");
    footers[0].style.display = "flex";
    footers[1].style.display = "none";
    footers[2].style.display = "none";
    const row1 = footers[0].firstElementChild;
    const cluster = row1?.children[0];
    const quoteGroup = row1?.children[1];
    const quoteP = quoteGroup?.querySelector("p");

    const wrapped = [];
    for (const el of footers[0].querySelectorAll("p, a")) {
      if (el === quoteP) continue;
      const text = el.textContent.trim();
      if (!text) continue;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const height = el.getBoundingClientRect().height;
      if (height > lineHeight * 1.3) {
        wrapped.push({ text, height: Math.round(height), lineHeight: Math.round(lineHeight) });
      }
    }

    if (cluster && quoteGroup) {
      const clusterRect = cluster.getBoundingClientRect();
      const quoteRect = quoteGroup.getBoundingClientRect();
      if (quoteRect.width > 0 && quoteRect.left < clusterRect.right) {
        wrapped.push({
          text: "[quote overlaps circle-back cluster]",
          height: Math.round(clusterRect.right - quoteRect.left),
          lineHeight: 0,
        });
      }
    }

    return wrapped;
  });
}

// --- Nav: forces the desktop pill visible regardless of the current nav:
// gate, for the same reason. Returns the pill's own gutter on each side
// (viewport width minus pill width, halved — the pill is centered via
// left-1/2 -translate-x-1/2, not page-x padding) and any document overflow.
async function readNavGutter(page) {
  return page.evaluate(() => {
    const navs = document.querySelectorAll('nav[aria-label="Main"]');
    navs[0].style.display = "block"; // DesktopNav
    navs[1].style.display = "none"; // MobileNav
    const pill = navs[0].querySelector(":scope > div > div");
    const rect = pill.getBoundingClientRect();
    const cw = document.documentElement.clientWidth;
    return {
      gutter: (cw - rect.width) / 2,
      overflow: document.documentElement.scrollWidth - cw,
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

    // ---- Footer: holds with no wrap at the breakpoint and above ---------
    for (const width of [FOOTER_BREAKPOINT, 600, 700, 1023]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);
      const wrapped = await readFooterWraps(page);
      results.push({
        name: `footer tablet tier: no wrap at ${width}px`,
        pass: wrapped.length === 0,
        gating: true,
        detail: wrapped.length
          ? wrapped.map((w) => `"${w.text}" (${w.height}px / ${w.lineHeight}px line)`).join(", ")
          : "no wrapped text",
      });
      await context.close();
    }

    // ---- Footer: breaks just below the breakpoint ------------------------
    // Intentional tightness (see file header) — if this ever starts
    // passing "no wrap" at 518, the floor moved and FOOTER_BREAKPOINT needs
    // re-deriving, not this check loosening.
    {
      const width = FOOTER_BREAKPOINT - 1;
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);
      const wrapped = await readFooterWraps(page);
      results.push({
        name: `footer tablet tier: DOES wrap at ${width}px (confirms the floor is real)`,
        pass: wrapped.length > 0,
        gating: true,
        detail: wrapped.length ? wrapped.map((w) => `"${w.text}"`).join(", ") : "nothing wrapped — floor may have moved",
      });
      await context.close();
    }

    // ---- Nav: holds a >=20px gutter, no overflow, at the breakpoint and
    // above ------------------------------------------------------------
    for (const width of [NAV_BREAKPOINT, 700, 743]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await sleep(200);
      const { gutter, overflow } = await readNavGutter(page);
      results.push({
        name: `nav pill: >=${MIN_GUTTER}px gutter, no overflow at ${width}px`,
        pass: gutter >= MIN_GUTTER - 0.1 && overflow === 0,
        gating: true,
        detail: `gutter=${gutter.toFixed(2)}px overflow=${overflow}px`,
      });
      await context.close();
    }

    // ---- Nav: breaks just below the breakpoint ---------------------------
    // Same intentional-tightness reasoning as the footer's check above.
    {
      const width = NAV_BREAKPOINT - 1;
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await sleep(200);
      const { gutter } = await readNavGutter(page);
      results.push({
        name: `nav pill: gutter drops below ${MIN_GUTTER}px at ${width}px (confirms the floor is real)`,
        pass: gutter < MIN_GUTTER - 0.1,
        gating: true,
        detail: `gutter=${gutter.toFixed(2)}px`,
      });
      await context.close();
    }

    // ---- Nav: the actual --breakpoint-nav switch lands exactly at 644 ----
    // (mirrors Part A's A3-style boundary check, redone against the new
    // number) — checks the REAL, un-forced markup this time, not the
    // display-override probes above.
    for (const [width, expectDesktop] of [
      [NAV_BREAKPOINT, true],
      [NAV_BREAKPOINT - 1, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await sleep(200);
      const displays = await page.evaluate(() => {
        const navs = document.querySelectorAll('nav[aria-label="Main"]');
        return { desktop: getComputedStyle(navs[0]).display, mobile: getComputedStyle(navs[1]).display };
      });
      const isDesktop = displays.desktop !== "none" && displays.mobile === "none";
      results.push({
        name: `nav switch: ${width}px shows ${expectDesktop ? "desktop" : "mobile"} nav`,
        pass: isDesktop === expectDesktop,
        gating: true,
        detail: `desktop display=${displays.desktop} mobile display=${displays.mobile}`,
      });
      await context.close();
    }

    // ---- Footer: the actual --breakpoint-footer switch lands exactly at
    // 519 ----------------------------------------------------------------
    for (const [width, expectTablet] of [
      [FOOTER_BREAKPOINT, true],
      [FOOTER_BREAKPOINT - 1, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);
      const displays = await page.evaluate(() => {
        const footers = document.querySelectorAll("footer");
        return { tablet: getComputedStyle(footers[1]).display, mobile: getComputedStyle(footers[2]).display };
      });
      const isTablet = displays.tablet !== "none" && displays.mobile === "none";
      results.push({
        name: `footer switch: ${width}px shows ${expectTablet ? "tablet" : "mobile"} tier`,
        pass: isTablet === expectTablet,
        gating: true,
        detail: `tablet display=${displays.tablet} mobile display=${displays.mobile}`,
      });
      await context.close();
    }

    // ---- Footer (desktop tier): holds with no unexpected wrap or overlap
    // at the breakpoint and above. 1440 is worth keeping in this list even
    // though it's well above the breakpoint: it's where --page-x steps
    // 30->50. No forced quote needed any more (see file header) — the real,
    // randomly-picked quote is whatever loads. -----------------------------
    for (const width of [FOOTER_DESKTOP_BREAKPOINT, 1200, 1439, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);
      const wrapped = await readDesktopFooterWraps(page);
      results.push({
        name: `footer desktop tier: no unexpected wrap/overlap at ${width}px`,
        pass: wrapped.length === 0,
        gating: true,
        detail: wrapped.length
          ? wrapped.map((w) => `"${w.text}" (${w.height}px / ${w.lineHeight}px line)`).join(", ")
          : "clean",
      });
      await context.close();
    }

    // ---- Footer (desktop tier): the quote never overlaps the cluster,
    // swept across the whole practical range down to well below the
    // breakpoint — not just "holds at the number we picked." There's no
    // "breaks just below" assertion here (unlike --breakpoint-footer/-nav
    // above): nothing in this row actually fails at any of these widths, by
    // construction (see file header) — this just guards against a future
    // layout change quietly reintroducing the overlap the old absolute-
    // positioned version had to be measured against. ----------------------
    for (const width of [700, 800, 900, 1000, FOOTER_DESKTOP_BREAKPOINT - 1]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);
      const wrapped = await readDesktopFooterWraps(page);
      const overlap = wrapped.filter((w) => w.text.includes("overlaps"));
      results.push({
        name: `footer desktop tier (forced visible below its own floor): no overlap at ${width}px`,
        pass: overlap.length === 0,
        gating: true,
        detail: overlap.length ? overlap.map((w) => w.text).join(", ") : "clean",
      });
      await context.close();
    }

    // ---- Footer: the actual --breakpoint-footer-desktop switch lands
    // exactly at 1024 — reads the real, un-forced markup. ------------------
    for (const [width, expectDesktop] of [
      [FOOTER_DESKTOP_BREAKPOINT, true],
      [FOOTER_DESKTOP_BREAKPOINT - 1, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(200);
      const displays = await page.evaluate(() => {
        const footers = document.querySelectorAll("footer");
        return { desktop: getComputedStyle(footers[0]).display, tablet: getComputedStyle(footers[1]).display };
      });
      const isDesktop = displays.desktop !== "none" && displays.tablet === "none";
      results.push({
        name: `footer desktop switch: ${width}px shows ${expectDesktop ? "desktop" : "tablet"} tier`,
        pass: isDesktop === expectDesktop,
        gating: true,
        detail: `desktop display=${displays.desktop} tablet display=${displays.tablet}`,
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
