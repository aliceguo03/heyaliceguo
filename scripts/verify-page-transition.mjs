#!/usr/bin/env node
// Real-browser verification for the Home <-> About page transition
// (FlipText — CLAUDE.md "FlipText" / "PAGE_TITLES"). Run on demand with
// `node scripts/verify-page-transition.mjs` against an already-running dev
// server (defaults to localhost:3000) — same lightweight BASE_URL
// convention as verify-about-section.mjs, not verify-animation.mjs's
// self-spawning harness.
//
// Hooks read here are the ones FlipText.tsx/pageTransition.ts expose
// specifically for this: data-flip-root (the color-tweened wrapper —
// color is inherited downward only, so the <h1>'s own computed color
// during a flip is always the STATIC class color, never the live tween;
// see FlipText.tsx's own comment), data-flip-source / data-flip-dest (the
// two letter layers — data-flip-source's mere presence in the DOM is the
// "a flip is active" signal, since the static from=null branch never
// renders it at all — including the new empty-source case below, whose
// source layer is present but contains zero characters).
//
// Fix pass (item 5, flipSourceFor): a route outside PAGE_TITLES is no
// longer a blanket non-participant as a SOURCE — arriving at Home or About
// from one now flips in from an empty source instead of rendering
// statically. Check 5 below used to assert the opposite (no flip from a
// case study); it's rewritten to assert the new behavior instead of
// dropped, since "a case study -> Home fires no flip" is no longer true.

import { chromium } from "playwright";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
}

const INK = "rgb(10, 10, 10)";
const DARK_GRAY = "rgb(92, 92, 92)";

async function h1State(page) {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return null;
    const flipRoot = h1.querySelector("[data-flip-root]");
    // The source layer stays mounted (rotated out of view, not removed)
    // even after a flip settles — invisible and inert (backfaceVisibility:
    // hidden, aria-hidden, pointer-events-none) but still real DOM text.
    // h1.textContent walks the whole subtree regardless of CSS visibility
    // or aria-hidden, so once a flip has run it would read BOTH layers'
    // text concatenated. Read the destination layer specifically (present
    // whenever a flip is active) and fall back to the h1 itself only for
    // the static from=null case, where FlipText renders no layers at all.
    const destLayer = h1.querySelector("[data-flip-dest]");
    const rawText = (destLayer ? destLayer.textContent : h1.textContent) ?? "";
    const rect = h1.getBoundingClientRect();
    return {
      // Wordmark's own static per-letter render (unchanged by this
      // session) renders the word space as  , not a plain space —
      // normalize so callers can compare against an ordinary string.
      text: rawText.replace(/ /g, " "),
      // Accessible name: aria-label if set, else the (aria-hidden-filtered)
      // text content a screen reader would compute — both callers set
      // aria-label explicitly, so this just reads it back.
      ariaLabel: h1.getAttribute("aria-label"),
      // Color lives on data-flip-root while a flip is active, and on the
      // h1 itself in the static case (see this file's own header comment).
      color: getComputedStyle(flipRoot ?? h1).color,
      hasSource: !!h1.querySelector("[data-flip-source]"),
      left: rect.left,
      width: rect.width,
    };
  });
}

async function navTo(page, linkName) {
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: linkName, exact: true })
    .click();
}

// Opens the WORK dropdown and clicks the first project — the one way this
// script reaches a route outside PAGE_TITLES (a case study) without
// hardcoding a slug. Returns the href it landed on.
async function gotoFirstProject(page) {
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("button", { name: "WORK" })
    .click();
  const firstProjectLink = page
    .getByRole("navigation", { name: "Main" })
    .locator("#nav-work-menu a[href^='/work/']")
    .first();
  await firstProjectLink.waitFor({ state: "visible" });
  const href = await firstProjectLink.getAttribute("href");
  await firstProjectLink.click();
  await page.waitForURL((url) => url.pathname === href);
  return href;
}

async function main() {
  const browser = await chromium.launch();

  // ---- Checks 1/2/8: hard load, both routes — static text, correct
  // color, correct accessible name, no source layer, no PAGE_TITLES drift.
  for (const [path, text, color] of [
    ["/", "alice guo.", INK],
    ["/about", "about.", DARK_GRAY],
  ]) {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await sleep(100);
    const state = await h1State(page);

    record(`hard load ${path}: h1 text is "${text}"`, state?.text === text, JSON.stringify(state));
    record(`hard load ${path}: color matches PAGE_TITLES token`, state?.color === color, `color=${state?.color}`);
    record(`hard load ${path}: accessible name is "${text}"`, state?.ariaLabel === text, `ariaLabel=${state?.ariaLabel}`);
    record(`hard load ${path}: no source layer (static render)`, state?.hasSource === false, JSON.stringify(state));

    await context.close();
  }

  // ---- Checks 3/4/9/10: the flip itself, both directions — mid-flight
  // source glyphs + non-endpoint color, resting text/color/box-stability,
  // accessible name throughout.
  const DIRECTIONS = [
    { from: "/", to: "/about", link: "ABOUT", destText: "about.", destColor: DARK_GRAY, srcColor: INK },
    { from: "/about", to: "/", link: "HOME", destText: "alice guo.", destColor: INK, srcColor: DARK_GRAY },
  ];

  for (const dir of DIRECTIONS) {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(`${BASE}${dir.from}`, { waitUntil: "networkidle" });
    await sleep(100);

    await navTo(page, dir.link);
    await page.waitForURL((url) => url.pathname === dir.to);

    // Mid-flight sample (~50% through DUR.page=0.8s, i.e. ~400ms after the
    // navigation settles — deliberately not t~0, since CSS-variable
    // keyframe resolution is async by one frame; see the plan's own
    // "Resolved before building" note on Motion's var() handling).
    await sleep(400);
    const midFlight = await h1State(page);

    record(
      `${dir.from} -> ${dir.to}: source layer present mid-flight`,
      midFlight?.hasSource === true,
      JSON.stringify(midFlight),
    );
    record(
      `${dir.from} -> ${dir.to}: mid-flight color is neither endpoint (var() color resolves, doesn't snap)`,
      midFlight?.color !== dir.destColor && midFlight?.color !== dir.srcColor && !!midFlight?.color,
      `color=${midFlight?.color} src=${dir.srcColor} dest=${dir.destColor}`,
    );

    // Rest.
    await sleep(1200); // DUR.page(0.8) + 9*STAGGER(0.63) worst case ~1.43s
    const atRest = await h1State(page);

    record(`${dir.from} -> ${dir.to}: rests at destination text`, atRest?.text === dir.destText, JSON.stringify(atRest));
    record(`${dir.from} -> ${dir.to}: rests at destination color`, atRest?.color === dir.destColor, `color=${atRest?.color}`);
    record(`${dir.from} -> ${dir.to}: accessible name is destination text at rest`, atRest?.ariaLabel === dir.destText, `ariaLabel=${atRest?.ariaLabel}`);

    await context.close();
  }

  // ---- Check 3/4 (the real box-stability claim): sample the h1's own
  // rect repeatedly THROUGH one flip and assert it never resizes/moves —
  // this is the actual claim the two-layer design makes (destination
  // layer sizes the box from frame 0; the wider absolute source layer
  // contributes no width), checked within a single flip, not cross-route.
  for (const dir of DIRECTIONS) {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(`${BASE}${dir.from}`, { waitUntil: "networkidle" });
    await sleep(100);

    await navTo(page, dir.link);
    await page.waitForURL((url) => url.pathname === dir.to);

    const boxes = [];
    for (let i = 0; i < 15; i++) {
      const s = await h1State(page);
      if (s) boxes.push({ left: s.left, width: s.width });
      await sleep(100);
    }
    const stable = boxes.every(
      (b) => Math.abs(b.left - boxes[0].left) < 1 && Math.abs(b.width - boxes[0].width) < 1,
    );
    record(
      `${dir.from} -> ${dir.to}: h1 box never resizes or drifts during the flip`,
      stable,
      JSON.stringify(boxes),
    );

    await context.close();
  }

  // ---- Check 5: case study route itself has no <h1> at all (unchanged —
  // case studies never render through FlipText/PageTitle either way).
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    const projectHref = await gotoFirstProject(page);
    await sleep(150);

    const caseStudyH1Count = await page.locator("h1").count();
    record(`case study route (${projectHref}) renders no <h1>`, caseStudyH1Count === 0, `h1 count=${caseStudyH1Count}`);

    await context.close();
  }

  // ---- Check 5b (item 5, flip in from nothing): a case study -> Home or
  // -> About now DOES flip, from an empty source — the destination's own
  // characters rotate in with nothing opposite them, rather than the title
  // just appearing. Verifies both destinations (Wordmark and PageTitle),
  // mid-flight source-layer presence, resting text/color, accessible name,
  // and box stability throughout — the same shape as the known-direction
  // flip checks above, applied to this new source case.
  const UNMAPPED_SOURCE_DIRECTIONS = [
    { link: "HOME", to: "/", destText: "alice guo.", destColor: INK },
    { link: "ABOUT", to: "/about", destText: "about.", destColor: DARK_GRAY },
  ];

  for (const dir of UNMAPPED_SOURCE_DIRECTIONS) {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    await gotoFirstProject(page);
    await sleep(150);

    await navTo(page, dir.link);
    await page.waitForURL((url) => url.pathname === dir.to);

    // Mid-flight: the source layer element exists (an active flip),
    // holding zero characters (nothing to flip out).
    await sleep(200);
    const midFlight = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const source = h1?.querySelector("[data-flip-source]");
      return {
        hasSource: !!source,
        sourceCharCount: source ? source.querySelectorAll(":scope > span").length : null,
      };
    });
    record(
      `case study -> ${dir.to}: flip is active mid-flight (source layer present)`,
      midFlight.hasSource === true,
      JSON.stringify(midFlight),
    );
    record(
      `case study -> ${dir.to}: source layer holds no characters (flip FROM nothing)`,
      midFlight.sourceCharCount === 0,
      JSON.stringify(midFlight),
    );

    // Box stability through the flip — same claim as the known-direction
    // checks, since this is the same FlipText mechanic with an empty
    // source, not a special-cased render.
    const boxes = [];
    for (let i = 0; i < 10; i++) {
      const s = await h1State(page);
      if (s) boxes.push({ left: s.left, width: s.width });
      await sleep(80);
    }
    const stable = boxes.every(
      (b) => Math.abs(b.left - boxes[0].left) < 1 && Math.abs(b.width - boxes[0].width) < 1,
    );
    record(`case study -> ${dir.to}: h1 box never resizes or drifts during the flip`, stable, JSON.stringify(boxes));

    // Rest.
    await sleep(800);
    const atRest = await h1State(page);
    record(`case study -> ${dir.to}: rests at destination text`, atRest?.text === dir.destText, JSON.stringify(atRest));
    record(`case study -> ${dir.to}: rests at destination color`, atRest?.color === dir.destColor, `color=${atRest?.color}`);
    record(
      `case study -> ${dir.to}: accessible name is destination text at rest`,
      atRest?.ariaLabel === dir.destText,
      `ariaLabel=${atRest?.ariaLabel}`,
    );

    await context.close();
  }

  // ---- Check 5c: must NOT fire between two unmapped routes (case study ->
  // case study) or from a mapped route to an unmapped one (Home/About ->
  // case study) — both stay static, matching current (pre- and post-fix)
  // behavior, since neither renders an h1 through FlipText/PageTitle at all.
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    // Home -> case study (mapped source, unmapped destination).
    const firstHref = await gotoFirstProject(page);
    await sleep(150);
    let h1Count = await page.locator("h1").count();
    record(`Home -> case study (${firstHref}): still renders no <h1>`, h1Count === 0, `h1 count=${h1Count}`);

    // case study -> a different case study (both unmapped) — the WORK
    // dropdown's SECOND entry, to land on a genuinely different route than
    // the one already open.
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("button", { name: "WORK" })
      .click();
    const secondProjectLink = page
      .getByRole("navigation", { name: "Main" })
      .locator("#nav-work-menu a[href^='/work/']")
      .nth(1);
    if (await secondProjectLink.count()) {
      await secondProjectLink.waitFor({ state: "visible" });
      const secondHref = await secondProjectLink.getAttribute("href");
      await secondProjectLink.click();
      await page.waitForURL((url) => url.pathname === secondHref);
      await sleep(150);
      h1Count = await page.locator("h1").count();
      record(
        `case study -> case study (${firstHref} -> ${secondHref}): still renders no <h1>`,
        h1Count === 0,
        `h1 count=${h1Count}`,
      );
    }

    await context.close();
  }

  // ---- Check 6: fast round-trip (/ -> /about -> / inside 2.15s) — the
  // useLoadSequence fix. Load sequence must not replay, and data-loaded
  // must already be true (or become true immediately, without a letter
  // ever sitting at a translateY offset).
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    await navTo(page, "ABOUT");
    await page.waitForURL((url) => url.pathname === "/about");
    await sleep(200); // well inside LOAD.total (2.15s)
    await navTo(page, "HOME");
    await page.waitForURL((url) => url.pathname === "/");

    let sawLetterInFlight = false;
    for (let i = 0; i < 20; i++) {
      const state = await page.evaluate(() => {
        const el = document.querySelector("[data-load-letter]");
        if (!el) return { opacity: "1", transform: "none" };
        const s = getComputedStyle(el);
        return { opacity: s.opacity, transform: s.transform };
      });
      if (
        Number.parseFloat(state.opacity) < 0.99 ||
        !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(state.transform)
      ) {
        sawLetterInFlight = true;
      }
      await sleep(15);
    }
    record(
      "fast round-trip (< LOAD.total): load sequence does not replay",
      !sawLetterInFlight,
      `sawLetterInFlight=${sawLetterInFlight}`,
    );

    await context.close();
  }

  // ---- Check 7: reduced motion, both directions — instant swap, no
  // source layer at any point, correct text/color on the very first
  // sample after navigation.
  for (const dir of DIRECTIONS) {
    const context = await browser.newContext({
      viewport: { width: 1710, height: 960 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(`${BASE}${dir.from}`, { waitUntil: "networkidle" });
    await sleep(100);

    await navTo(page, dir.link);
    await page.waitForURL((url) => url.pathname === dir.to);
    await sleep(50); // past hydration/commit, well short of any real animation

    const state = await h1State(page);
    record(
      `${dir.from} -> ${dir.to} (reduced motion): destination text/color immediately, no source layer`,
      state?.text === dir.destText && state?.color === dir.destColor && state?.hasSource === false,
      JSON.stringify(state),
    );

    await context.close();
  }

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
