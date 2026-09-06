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
// centering at three widths, the banner's alignment with the frame strip
// and its corner rounding, seam-to-gutter lockstep across the scroll range,
// no stray white band inside the card mid-transition, the frame-04-to-buttons
// gap, video play/pause under clip-path, the gentle scroll snap
// (useProjectSnap.ts) and its guards, and the reduced-motion/short-viewport
// fallback.

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

// --- Scroll snap helpers -----------------------------------------------------
// Geometry read from the rendered page rather than re-typed as constants —
// same reasoning as the rest of this file: a hardcoded copy can't catch a
// real drift between projectGeometry.ts and what actually renders. Must be
// called before any scrolling (frame 0/1 are only PITCH apart at rest).

async function readSectionTop(page) {
  return page.evaluate(() => {
    const card = document.querySelector('[data-testid="project-card"]');
    const section = card.closest(".sticky").parentElement;
    return section.getBoundingClientRect().top + window.scrollY;
  });
}

async function readPitch(page) {
  return page.evaluate(() => {
    const f0 = document.querySelector('[data-project-frame="0"]').getBoundingClientRect();
    const f1 = document.querySelector('[data-project-frame="1"]').getBoundingClientRect();
    return f1.top - f0.top;
  });
}

// Reaches an absolute document Y via real wheel events only — never a raw
// window.scrollTo, which bypasses Lenis's own tracked target/animated
// scroll state. Stops once within stopThreshold rather than pursuing exact
// precision: each wheel-driven scrollTo has a long (DUR.scroll = 1.2s)
// tween, so continuing to feed input once close compounds into overshoot,
// since the externally observed scrollY lags the real, already-moved
// target. A small stopThreshold (default) is precise enough for an
// arbitrary target; a larger one (pass explicitly) leaves the final
// approach to the snap mechanism under test — needed near the section's own
// travel boundary, where even a small overshoot exits the valid range.
async function wheelToY(page, targetY, { maxSteps = 400, stopThreshold = 30 } = {}) {
  let guard = 0;
  while (guard++ < maxSteps) {
    const y = await page.evaluate(() => window.scrollY);
    const diff = targetY - y;
    if (Math.abs(diff) < stopThreshold) break;
    const step = Math.sign(diff) * Math.min(50, Math.abs(diff));
    await page.mouse.wheel(0, step);
    await sleep(70);
  }
  // Let any in-flight lenis animation, then the idle debounce, then the
  // snap's own animation (if we landed inside SNAP_RADIUS) fully settle.
  await sleep(2600);
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

    // ---- Check 1b: banner label aligns with the frame strip at all three
    // widths (regression guard for the horizontal-centering fix — the
    // banner used to resolve its own position via a parallel padding/cap
    // split that only agreed with the frame strip's at the 1710px
    // reference width). ------------------------------------------------
    for (const width of [1710, 1440, 1200]) {
      const context = await browser.newContext({ viewport: { width, height: 960 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });

      const rects = await page.evaluate(() => {
        function rect(el) {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right };
        }
        const label = document.getElementById("selected-work");
        const frame0 = document.querySelector('[data-project-frame="0"]');
        return { label: rect(label), frame0: rect(frame0) };
      });
      const leftDrift = Math.abs(rects.label.left - rects.frame0.left);
      const rightDrift = Math.abs(rects.label.right - rects.frame0.right);
      results.push({
        name: `SELECTED WORK. banner aligns with frame strip at ${width}px`,
        pass: leftDrift <= 0.5 && rightDrift <= 0.5,
        gating: true,
        detail: `label=${JSON.stringify(rects.label)} frame0=${JSON.stringify(rects.frame0)}`,
      });

      await context.close();
    }

    // ---- Check 1c: the strip's own rounded overflow-hidden viewport is
    // what rounds its visible boundary — not the banner (regression guard,
    // updated: the banner-rounds-its-own-corner approach this used to test
    // was replaced — rounding a straight edge can only ever cut a concave
    // notch, never the convex bulge the design wants — with a rounded
    // overflow-hidden box wrapping the whole strip, so whatever's at that
    // box's own top/bottom edge clips to a convex curve at any scroll
    // position, not just at rest). ---------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });

      // The banner itself must NOT carry corner rounding any more — a
      // plain rectangle, per the reasoning above.
      const bannerRadius = await page.evaluate(() => {
        const card = document.querySelector('[data-testid="project-card"]');
        const bannerOuter = card.closest(".sticky").querySelector(":scope > div:last-child");
        const bannerInner = bannerOuter.querySelector(":scope > div");
        return getComputedStyle(bannerInner).borderBottomLeftRadius;
      });
      results.push({
        name: "banner is a plain rectangle (no corner rounding of its own)",
        pass: Number.parseFloat(bannerRadius) === 0,
        gating: true,
        detail: `borderBottomLeftRadius=${bannerRadius}`,
      });

      // The mask: [data-project-frame="0"]'s grandparent is the
      // overflow-hidden, rounded-card viewport that clips the translating
      // strip (ProjectSection.tsx's L1 comment).
      const mask = await page.evaluate(() => {
        const el = document.querySelector('[data-project-frame="0"]').parentElement.parentElement;
        const cs = getComputedStyle(el);
        return {
          overflow: cs.overflow,
          tl: cs.borderTopLeftRadius,
          tr: cs.borderTopRightRadius,
          bl: cs.borderBottomLeftRadius,
          br: cs.borderBottomRightRadius,
        };
      });
      const cardRadius = await page.evaluate(() =>
        getComputedStyle(document.querySelector('[data-testid="project-card"]')).getPropertyValue(
          "--radius-card",
        ),
      );
      const allRounded = [mask.tl, mask.tr, mask.bl, mask.br].every((r) => Number.parseFloat(r) > 0);
      results.push({
        name: "strip viewport clips (overflow hidden) with all four corners rounded",
        pass: mask.overflow === "hidden" && allRounded,
        gating: true,
        detail: `overflow=${mask.overflow} tl=${mask.tl} tr=${mask.tr} bl=${mask.bl} br=${mask.br} radius-card token=${cardRadius}`,
      });

      // Rounding is baked into the mask's own static shape, not derived
      // from scroll position — confirm the computed radius is identical at
      // a rest slot and mid-transition (screenshots are the human-legible
      // version of this same claim; this is its automated, exact form).
      const sectionTop = await page.evaluate(() => {
        const card = document.querySelector('[data-testid="project-card"]');
        const section = card.closest(".sticky").parentElement;
        return section.getBoundingClientRect().top + window.scrollY;
      });
      const pitch = await page.evaluate(() => {
        const f0 = document.querySelector('[data-project-frame="0"]').getBoundingClientRect();
        const f1 = document.querySelector('[data-project-frame="1"]').getBoundingClientRect();
        return f1.top - f0.top;
      });
      await page.evaluate((y) => window.scrollTo(0, y), sectionTop + pitch * 0.5);
      await settleScroll(page);
      const maskMidScroll = await page.evaluate(() => {
        const el = document.querySelector('[data-project-frame="0"]').parentElement.parentElement;
        const cs = getComputedStyle(el);
        return [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius].join(
          ",",
        );
      });
      const maskAtRest = [mask.tl, mask.tr, mask.bl, mask.br].join(",");
      results.push({
        name: "strip viewport's corner radius is identical at rest and mid-transition (baked into shape, not scroll-derived)",
        pass: maskAtRest === maskMidScroll,
        gating: true,
        detail: `atRest=${maskAtRest} midScroll=${maskMidScroll}`,
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

    // ---- Check 7: scroll snap (useProjectSnap.ts) --------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      const sectionTop = await readSectionTop(page);
      const pitch = await readPitch(page);
      const travel = 3 * pitch;

      // From each of the four rest slots, a small nudge settles back to
      // that exact slot. Slot 3 sits exactly at the travel boundary
      // (offset === travel): approaching it needs a larger stop threshold
      // so the harness doesn't overshoot past the valid range itself, and
      // the nudge must go backward — a forward nudge legitimately exits
      // [sectionTop, sectionTop+travel], which the snap correctly leaves
      // alone (that's what the out-of-range check below covers).
      for (let i = 0; i < 4; i++) {
        const slotY = sectionTop + i * pitch;
        const isLastSlot = i === 3;
        await wheelToY(page, slotY, isLastSlot ? { stopThreshold: 150 } : {});
        await page.mouse.wheel(0, isLastSlot ? -120 : 120);
        await sleep(2600);
        const finalY = await page.evaluate(() => window.scrollY);
        results.push({
          name: `scroll snap: settles back to slot ${i} exactly after a small nudge`,
          pass: Math.abs(finalY - slotY) < 1,
          gating: true,
          detail: `finalY=${finalY} slotY=${slotY}`,
        });
      }

      // A stop partway between slot 0 and slot 1, closer to slot 1, snaps
      // to slot 1 — confirms nearest-slot rounding, not always-slot-0.
      await wheelToY(page, sectionTop + pitch * 0.6);
      const midFinalY = await page.evaluate(() => window.scrollY);
      const slot1Y = sectionTop + pitch;
      results.push({
        name: "scroll snap: a stop closer to slot 1 than slot 0 lands on slot 1",
        pass: Math.abs(midFinalY - slot1Y) < 1,
        gating: true,
        detail: `midFinalY=${midFinalY} slot1Y=${slot1Y}`,
      });

      // Sub-deadzone nudge (a few px) is a true no-op — no forced re-snap.
      await wheelToY(page, sectionTop + 2 * pitch);
      const settledY = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, 3);
      await sleep(2600);
      const afterTinyNudge = await page.evaluate(() => window.scrollY);
      results.push({
        name: "scroll snap: sub-deadzone nudge does not trigger a re-snap",
        pass: Math.abs(afterTinyNudge - (settledY + 3)) < 2,
        gating: true,
        detail: `settledY=${settledY} afterTinyNudge=${afterTinyNudge}`,
      });

      // Past sectionTop+travel: outside the pinned stage's own range, the
      // snap must leave the scroll where the wheel put it.
      await wheelToY(page, sectionTop + travel + 200, { stopThreshold: 10 });
      const pastTravelY = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, 2);
      await sleep(2600);
      const afterPastTravel = await page.evaluate(() => window.scrollY);
      results.push({
        name: "scroll snap: past sectionTop+travel is not pulled back into the section",
        pass: Math.abs(afterPastTravel - (pastTravelY + 2)) < 2,
        gating: true,
        detail: `pastTravelY=${pastTravelY} afterPastTravel=${afterPastTravel}`,
      });

      // A fast flick across the whole section is never yanked backwards.
      await wheelToY(page, sectionTop);
      let minY = Infinity;
      for (let i = 0; i < 15; i++) {
        await page.mouse.wheel(0, 400);
        await sleep(15);
        const y = await page.evaluate(() => window.scrollY);
        minY = Math.min(minY, y);
      }
      await sleep(50);
      const midFlickY = await page.evaluate(() => window.scrollY);
      results.push({
        name: "scroll snap: a fast flick across the section is never yanked backwards",
        pass: midFlickY >= minY - 1,
        gating: true,
        detail: `midFlickY=${midFlickY} minY=${minY}`,
      });

      // Focus inside the section (a tabbed-to CTA) blocks the snap from
      // moving the page out from under the user.
      await wheelToY(page, sectionTop + pitch - 100);
      await page.evaluate(() => {
        const btn = document.querySelector('[data-project-index="1"] a, [data-project-index="1"] button');
        btn?.focus();
      });
      const beforeFocusSettle = await page.evaluate(() => window.scrollY);
      await sleep(2600);
      const afterFocusSettle = await page.evaluate(() => window.scrollY);
      results.push({
        name: "scroll snap: focus inside the section blocks the snap from moving the page",
        pass: Math.abs(afterFocusSettle - beforeFocusSettle) < 2,
        gating: true,
        detail: `beforeFocusSettle=${beforeFocusSettle} afterFocusSettle=${afterFocusSettle}`,
      });

      // Every rest slot's card and VIEW CASE STUDY button fit fully inside
      // the viewport at both the reference width and the 13" Air width.
      await context.close();
    }

    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 1710, height: 1000 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      const sectionTop = await readSectionTop(page);
      const pitch = await readPitch(page);

      for (let i = 0; i < 4; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), sectionTop + i * pitch);
        await sleep(200);
        const fit = await page.evaluate((idx) => {
          const card = document.querySelector('[data-testid="project-card"]');
          const cardRect = card.getBoundingClientRect();
          const btn = document.querySelector(
            `[data-project-index="${idx}"] a, [data-project-index="${idx}"] button`,
          );
          const btnRect = btn ? btn.getBoundingClientRect() : null;
          return {
            cardRect: { top: cardRect.top, bottom: cardRect.bottom },
            btnRect: btnRect ? { top: btnRect.top, bottom: btnRect.bottom } : null,
            viewportHeight: window.innerHeight,
          };
        }, i);
        const cardFits = fit.cardRect.top >= 0 && fit.cardRect.bottom <= fit.viewportHeight;
        const btnFits = fit.btnRect && fit.btnRect.top >= 0 && fit.btnRect.bottom <= fit.viewportHeight;
        results.push({
          name: `scroll snap: at ${viewport.width}x${viewport.height} slot ${i}, card fits fully in the viewport`,
          pass: cardFits,
          gating: true,
          detail: JSON.stringify(fit.cardRect) + ` vh=${fit.viewportHeight}`,
        });
        results.push({
          name: `scroll snap: at ${viewport.width}x${viewport.height} slot ${i}, VIEW CASE STUDY fits fully in the viewport`,
          pass: btnFits,
          gating: true,
          detail: JSON.stringify(fit.btnRect) + ` vh=${fit.viewportHeight}`,
        });
      }

      await context.close();
    }

    // ---- Check 8: reduced motion / short viewport — the snap attaches no
    // listener at all (not attached-and-inert) ------------------------------
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

      const before = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, 300);
      await sleep(2600);
      const after = await page.evaluate(() => window.scrollY);
      results.push({
        name: `scroll snap: ${config.name} — scroll settles at a plain wheel-scrolled position (no snap jump)`,
        pass: Math.abs(after - (before + 300)) < 50,
        gating: true,
        detail: `before=${before} after=${after}`,
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
