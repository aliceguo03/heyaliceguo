#!/usr/bin/env node
// Real-browser verification for scroll-driven animation work (build order
// step 10). Run on demand with `npm run verify` — not wired into `build` or
// `test`. See CLAUDE.md "Animation system" and the session-1 plan.
//
// Extend, don't rewrite: add a target to TARGETS or a viewport to VIEWPORTS
// as later sessions add reveals. The check bodies below are generic over
// both lists.

import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

// --- Declarative data: extend here, not in the check bodies below --------

const VIEWPORTS = [
  { name: '16" MBP', width: 1710, height: 960 },
  { name: '13" Air', width: 1440, height: 760 },
];

// `find` is a Playwright locator recipe: { css } or { role, accessibleName }.
// Role + accessible name is preferred for anything that isn't uniquely
// identified by an id, since a positional/CSS selector silently drifts onto
// the wrong element as the page changes around it (e.g. the hero's own
// VIEW MY WORK <button>, which a bare "button" selector would also match).
const TARGETS = [
  { name: "SELECTED WORK. label", find: { css: "#selected-work" } },
  { name: "BACK TO TOP", find: { role: "button", accessibleName: "BACK TO TOP" } },
  { name: "ALL PROJECTS", find: { role: "link", accessibleName: "ALL PROJECTS" } },
];

// --- Harness plumbing ------------------------------------------------------

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

// Session 3 (hero load animation) needs a *production* server for check 1:
// motion/react can't start until React hydrates, and dev's hydration is
// meaningfully slower than prod's — a dev-measured number would fail the
// 900ms ceiling for reasons that have nothing to do with the animation
// itself. `npm run build` is run by the caller before this script starts.
function startProdServer(port) {
  const child = spawn("npx", ["next", "start", "-p", String(port)], {
    cwd: new URL("..", import.meta.url).pathname,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

function locatorFor(page, find) {
  if (find.css) return page.locator(find.css);
  return page.getByRole(find.role, { name: find.accessibleName });
}

// The animated box is the ScrollReveal wrapper, not the content — resolve
// up to it via its stable data attribute (src/components/motion/ScrollReveal.tsx).
async function revealHandle(page, find) {
  const target = locatorFor(page, find);
  const handle = await target.elementHandle();
  if (!handle) throw new Error(`Target not found: ${JSON.stringify(find)}`);
  const reveal = await handle.evaluateHandle((el) => el.closest("[data-reveal]"));
  const el = reveal.asElement();
  if (!el) throw new Error(`No [data-reveal] ancestor for target: ${JSON.stringify(find)}`);
  return el;
}

async function readBox(handle) {
  return handle.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      opacity: Number.parseFloat(style.opacity),
      transform: style.transform,
      willChange: style.willChange,
      inlineTransform: el.style.transform || "",
      // offsetTop/Left/Width/Height reflect the element's position in
      // normal flow and are, by spec, unaffected by `transform` — unlike
      // getBoundingClientRect, which reports the post-transform painted
      // box. That's exactly the distinction this harness needs: the
      // reveal's own translateY is supposed to move the painted box (that's
      // the animation), but it must never move anything in layout. Reading
      // getBoundingClientRect here would clock the animation itself as a
      // "shift".
      layoutTop: el.offsetTop,
      layoutLeft: el.offsetLeft,
      layoutWidth: el.offsetWidth,
      layoutHeight: el.offsetHeight,
    };
  });
}

function isIdentity(transform) {
  return transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";
}

async function settleScroll(page) {
  // Lenis drives its own rAF loop; wait until window.scrollY stops moving
  // between frames rather than assuming a fixed delay.
  await page.waitForFunction(() => {
    return new Promise((resolve) => {
      const a = window.scrollY;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve(Math.abs(window.scrollY - a) < 0.5));
      });
    });
  });
}

// --- Hero load sequence checks (session 3, revised) --------------------------
// Checks for the wordmark's letter-by-letter rise-and-fade + staggered hero
// arrival (no shimmer, no hover behavior — removed in the session 3
// revision). Structural/behavioral checks run against whatever server `base`
// points at (reused dev, spawned dev, or prod — doesn't affect correctness,
// only speed). The wall-clock number is measured separately, against a real
// production server, by the caller in main().

async function measureLoadWallClock(page) {
  // FCP via the Paint Timing API, read after the fact — avoids racing a
  // PerformanceObserver callback against the poll loop below.
  await page.waitForFunction(() => {
    return performance.getEntriesByName("first-contentful-paint").length > 0;
  }, { timeout: 5000 });
  const fcp = await page.evaluate(
    () => performance.getEntriesByName("first-contentful-paint")[0].startTime,
  );

  // Two distinct rest points: the wordmark alone (all letters at opacity 1,
  // identity transform — reached mid-sequence, around LOAD's wave duration)
  // and the full sequence (data-loaded="true" — the button, last to settle).
  // Polled together in one pass so both come from the same real run rather
  // than two separate page loads with their own timing jitter.
  const { wordmarkRestTime, restTime } = await page.evaluate(() => {
    return new Promise((resolve) => {
      const start = performance.now();
      let wordmarkRestTime = -1;
      function poll() {
        if (wordmarkRestTime < 0) {
          const letters = document.querySelectorAll("[data-load-letter]");
          const wordmarkDone =
            letters.length > 0 &&
            Array.from(letters).every((el) => {
              const s = getComputedStyle(el);
              return (
                Number.parseFloat(s.opacity) >= 0.99 &&
                (s.transform === "none" || s.transform === "matrix(1, 0, 0, 1, 0, 0)")
              );
            });
          if (wordmarkDone) wordmarkRestTime = performance.now();
        }

        const h1 = document.querySelector("#page-top");
        if (h1 && h1.getAttribute("data-loaded") === "true") {
          resolve({ wordmarkRestTime, restTime: performance.now() });
          return;
        }
        if (performance.now() - start > 4000) {
          // never settled — LOAD.total is ~2.15s, leave real margin above it
          resolve({ wordmarkRestTime, restTime: -1 });
          return;
        }
        requestAnimationFrame(poll);
      }
      requestAnimationFrame(poll);
    });
  });

  return {
    fcp,
    wordmarkRestTime,
    restTime,
    wordmarkWallClockMs: wordmarkRestTime < 0 ? -1 : wordmarkRestTime - fcp,
    wallClockMs: restTime < 0 ? -1 : restTime - fcp,
  };
}

async function loadSequenceChecks(browser, base, results) {
  const LS_VIEWPORTS = [
    { name: '16" MBP', width: 1710, height: 960 },
    { name: '13" Air', width: 1440, height: 760 },
  ];

  // ---- Check 2 (position half): wordmark rests where Figma's "load in"
  // frame (594:2633) puts it — only meaningful at the 1710x1040 reference
  // viewport, since viewport-fill's vertical centering is viewport-height
  // dependent at any other size.
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 }, // LOAD.total is ~2.15s now — leave real margin above it
    );
    const box = await page.locator("#page-top").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    });
    // Figma: x=650, y=306, 410x83 (absolute, within the 1710-wide frame).
    // Measured pre-change baseline at this exact viewport: top=305.9,
    // left=651.1, height=83.19 — the ±1-2px tolerance below covers rendering
    // sub-pixel rounding, not any real drift.
    const pass =
      Math.abs(box.top - 306) < 1.5 &&
      Math.abs(box.left - 650) < 2.5 &&
      Math.abs(box.height - 83) < 1;
    results.push({
      name: "Wordmark rests at Figma's load-in position (1710x1040)",
      pass,
      gating: true,
      detail: JSON.stringify(box),
    });
    await context.close();
  }

  for (const viewport of LS_VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__lsCls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__lsCls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(base, { waitUntil: "networkidle" });

    // ---- Hard reload replays the sequence -------------------------------
    await page.reload({ waitUntil: "commit" });
    let sawInFlight = false;
    for (let i = 0; i < 40; i++) {
      const state = await page.evaluate(() => {
        const el = document.querySelector("[data-load-letter]");
        if (!el) return { opacity: "1", transform: "none" };
        const s = getComputedStyle(el);
        return { opacity: s.opacity, transform: s.transform };
      });
      if (Number.parseFloat(state.opacity) < 0.99 || !isIdentity(state.transform)) {
        sawInFlight = true;
        break;
      }
      await sleep(15);
    }
    results.push({
      name: `${viewport.name}: hard reload replays the sequence`,
      pass: sawInFlight,
      gating: true,
      detail: sawInFlight ? "observed a letter mid-rise (opacity < 1 or non-identity transform) after reload" : "letters were already at rest — no replay observed",
    });

    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );
    await sleep(50);

    // ---- Resting state, no layout shift ---------------------------------
    const restState = await page.evaluate(() => {
      const h1 = document.querySelector("#page-top");
      const letters = Array.from(document.querySelectorAll("[data-load-letter]")).map((el) => {
        const s = getComputedStyle(el);
        return { opacity: s.opacity, transform: s.transform };
      });
      const loadEls = Array.from(document.querySelectorAll("[data-load]")).map((el) => {
        const s = getComputedStyle(el);
        return { opacity: s.opacity, transform: s.transform };
      });
      return {
        dataLoaded: h1.getAttribute("data-loaded"),
        letters,
        loadEls,
      };
    });
    results.push({
      name: `${viewport.name}: all letters at opacity 1, identity transform at rest`,
      pass: restState.letters.every(
        (l) => Number.parseFloat(l.opacity) >= 0.99 && isIdentity(l.transform),
      ),
      gating: true,
      detail: JSON.stringify(restState.letters),
    });
    results.push({
      name: `${viewport.name}: photo stack / bio lines / button at opacity 1, identity transform`,
      pass: restState.loadEls.length > 0 &&
        restState.loadEls.every((el) => Number.parseFloat(el.opacity) >= 0.99 && isIdentity(el.transform)),
      gating: true,
      detail: JSON.stringify(restState.loadEls),
    });

    const cls = await page.evaluate(() => window.__lsCls ?? 0);
    results.push({
      name: `${viewport.name}: no cumulative layout shift across the load sequence`,
      pass: cls < 0.01,
      gating: true,
      detail: `CLS=${cls}`,
    });

    await context.close();
  }

  // ---- Check 4: prefers-reduced-motion — complete, static, immediately ----
  {
    const context = await browser.newContext({
      viewport: { width: 1710, height: 960 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleIssues = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || /hydration|did not match|hydrating/i.test(msg.text())) {
        consoleIssues.push(msg.text());
      }
    });
    page.on("pageerror", (err) => consoleIssues.push(String(err)));

    await page.goto(base, { waitUntil: "networkidle" });
    await sleep(200); // past hydration, well short of any real animation duration

    const state = await page.evaluate(() => {
      const h1 = document.querySelector("#page-top");
      const letters = Array.from(document.querySelectorAll("[data-load-letter]")).map((el) => {
        const s = getComputedStyle(el);
        return { opacity: s.opacity, transform: s.transform };
      });
      const loadEls = Array.from(document.querySelectorAll("[data-load]")).map((el) => {
        const s = getComputedStyle(el);
        return { opacity: s.opacity, transform: s.transform };
      });
      return {
        dataLoaded: h1.getAttribute("data-loaded"),
        letters,
        loadEls,
      };
    });

    results.push({
      name: "Reduced motion: letters visible at full opacity, identity transform, immediately",
      pass: state.letters.every(
        (l) => Number.parseFloat(l.opacity) >= 0.99 && isIdentity(l.transform),
      ),
      gating: true,
      detail: JSON.stringify(state.letters),
    });
    results.push({
      name: "Reduced motion: photo stack / bio lines / button visible immediately, no transform",
      pass: state.loadEls.length > 0 &&
        state.loadEls.every((el) => Number.parseFloat(el.opacity) >= 0.99 && isIdentity(el.transform)),
      gating: true,
      detail: JSON.stringify(state.loadEls),
    });
    results.push({
      name: 'Reduced motion: data-loaded="true" immediately',
      pass: state.dataLoaded === "true",
      gating: true,
      detail: `dataLoaded=${state.dataLoaded}`,
    });
    results.push({
      name: "Reduced motion: no hydration errors or console errors",
      pass: consoleIssues.length === 0,
      gating: true,
      detail: consoleIssues.join(" | ") || "clean",
    });

    await context.close();
  }

  // ---- Check 6: client-side nav to /work and back does not replay --------
  // /work does not exist yet in this codebase (only "/" is a real route as
  // of session 3 — see CLAUDE.md build order, step 8 not yet reached).
  // Clicking a Link to a route that 404s makes Next.js fall back to a hard
  // navigation, which *would* reset the module-scope flag correctly (that's
  // what a real reload should do) — but that means a green result here would
  // prove nothing about client-side nav specifically, and a red one would be
  // a false alarm about a route that isn't built rather than a defect in the
  // load sequence. Detected and reported as blocked rather than guessed at.
  {
    const probe = await fetch(new URL("/work", base)).catch(() => null);
    if (!probe || !probe.ok) {
      results.push({
        name: "Client-side nav to /work and back: no replay",
        pass: true,
        gating: false,
        detail:
          "BLOCKED, not verified: /work returns " +
          (probe ? probe.status : "no response") +
          " — that route doesn't exist yet in this codebase, so there is no second real page to navigate to and back from without a hard reload. The fire-once contract itself (module-scope flag, written only from an effect, per useLoadSequence.ts) is exercised by the hard-reload check above; this specific check needs a real second route and should be re-run once /work is built.",
      });
    } else {
      const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
      const page = await context.newPage();
      const consoleIssues = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleIssues.push(msg.text());
      });
      page.on("pageerror", (err) => consoleIssues.push(String(err)));

      await page.goto(base, { waitUntil: "networkidle" });
      await page.waitForFunction(
        () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
        { timeout: 4000 },
      );

      // "ALL PROJECTS" (WorkSectionActions.tsx) is a real client-side <Link>
      // to /work — a Playwright page.goto() here would be a fresh navigation
      // (fresh module evaluation, module flag reset), which is exactly the
      // case this check must NOT exercise.
      await page.getByRole("link", { name: "ALL PROJECTS" }).click();
      await page.waitForURL(/\/work$/);
      await sleep(150);

      // Scoped to the nav — "Home"/"hoMEwork" links also exist in the footer.
      await page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "HOME", exact: true })
        .click();
      await page.waitForURL((url) => url.pathname === "/");
      await sleep(150);

      let sawInFlight = false;
      for (let i = 0; i < 20; i++) {
        const state = await page.evaluate(() => {
          const el = document.querySelector("[data-load-letter]");
          if (!el) return { opacity: "1", transform: "none" };
          const s = getComputedStyle(el);
          return { opacity: s.opacity, transform: s.transform };
        });
        if (Number.parseFloat(state.opacity) < 0.99 || !isIdentity(state.transform)) sawInFlight = true;
        await sleep(10);
      }
      const dataLoaded = await page.evaluate(() =>
        document.querySelector("#page-top")?.getAttribute("data-loaded"),
      );

      results.push({
        name: "Client-side nav to /work and back: wordmark renders at rest, no replay",
        pass: !sawInFlight && dataLoaded === "true",
        gating: true,
        detail: `sawLetterInFlight=${sawInFlight} dataLoaded=${dataLoaded}`,
      });
      results.push({
        name: "Client-side nav to /work and back: no console errors",
        pass: consoleIssues.length === 0,
        gating: true,
        detail: consoleIssues.join(" | ") || "clean",
      });

      await context.close();
    }
  }
}

// --- Magnetic button checks (session 4, useMagnet.ts) -----------------------
// Targets the hero's "VIEW MY WORK" button (ui/Button.tsx) — always magnet-
// eligible (not gated by ProjectSection's visibility mask), and above the
// fold, so these checks don't need to scroll first.

async function readTransform(handleOrPage, arg) {
  return handleOrPage.evaluate((el) => getComputedStyle(el).transform, arg);
}

function isIdentityTransform(transform) {
  return transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";
}

async function magnetChecks(browser, base, results) {
  // ---- Check: bounding box identical before/after the magnet applies -----
  // The magnet writes to `style.x`/`style.y` (a transform), which must never
  // move the button's own layout box — offsetTop/Left/Width/Height are, by
  // spec, unaffected by transform (see readBox's own comment above), which is
  // exactly the property this check needs.
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    const handle = await page.getByRole("button", { name: "VIEW MY WORK" }).elementHandle();
    const readLayoutBox = (el) => ({
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });

    const restBox = await handle.evaluate(readLayoutBox);
    const restTransform = await readTransform(handle, undefined);

    // 10px inside the button's left edge — activation is contact-only
    // (session 4 tuning: a literal hit test against the button's own rect,
    // no proximity radius), so the point must be inside the box, not just
    // near it. Off-center enough to produce a real, non-trivial offset
    // rather than one that happens to land near zero.
    const box = await handle.boundingBox();
    await page.mouse.move(box.x + 10, box.y + box.height / 2, { steps: 10 });
    await page.waitForFunction((el) => !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(getComputedStyle(el).transform), handle, { timeout: 2000 }).catch(() => {});

    const pullingBox = await handle.evaluate(readLayoutBox);
    const pullingTransform = await readTransform(handle, undefined);

    // Release: move far away and wait for the eased return to identity.
    await page.mouse.move(200, 200, { steps: 5 });
    await page.waitForFunction((el) => ["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(getComputedStyle(el).transform), handle, { timeout: 2000 }).catch(() => {});
    const releasedBox = await handle.evaluate(readLayoutBox);
    const releasedTransform = await readTransform(handle, undefined);

    results.push({
      name: "Magnet: pointer contact produces a non-identity transform",
      pass: isIdentityTransform(restTransform) && !isIdentityTransform(pullingTransform),
      gating: true,
      detail: `rest=${restTransform} pulling=${pullingTransform}`,
    });
    results.push({
      name: "Magnet: layout box unchanged while pulling",
      pass:
        restBox.top === pullingBox.top &&
        restBox.left === pullingBox.left &&
        restBox.width === pullingBox.width &&
        restBox.height === pullingBox.height,
      gating: true,
      detail: `rest=${JSON.stringify(restBox)} pulling=${JSON.stringify(pullingBox)}`,
    });
    results.push({
      name: "Magnet: releases back to identity transform, layout box still unchanged",
      pass:
        isIdentityTransform(releasedTransform) &&
        restBox.top === releasedBox.top &&
        restBox.left === releasedBox.left &&
        restBox.width === releasedBox.width &&
        restBox.height === releasedBox.height,
      gating: true,
      detail: `released=${releasedTransform} box=${JSON.stringify(releasedBox)}`,
    });

    await context.close();
  }

  // ---- Check: keyboard focus is inert -------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    const button = page.getByRole("button", { name: "VIEW MY WORK" });
    await button.focus();
    const handle = await button.elementHandle();
    const box = await handle.boundingBox();
    // Hover dead-center — the strongest possible pull if focus weren't inert.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
    await sleep(200);
    const transform = await readTransform(handle, undefined);

    results.push({
      name: "Magnet: focused button does not displace even while hovered",
      pass: isIdentityTransform(transform),
      gating: true,
      detail: `transform=${transform}`,
    });

    await context.close();
  }

  // ---- Check: reduced motion attaches no listeners (no transform ever) ---
  {
    const context = await browser.newContext({
      viewport: { width: 1710, height: 960 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await sleep(300);

    const handle = await page.getByRole("button", { name: "VIEW MY WORK" }).elementHandle();
    const box = await handle.boundingBox();
    // Inside the box (contact, not proximity) — the point that would
    // activate the magnet were it enabled, so this actually exercises the
    // reduced-motion gate rather than just failing to make contact.
    await page.mouse.move(box.x + 10, box.y + box.height / 2, { steps: 10 });
    await sleep(200);
    const transform = await readTransform(handle, undefined);

    results.push({
      name: "Magnet: reduced motion — no transform under pointer contact",
      pass: isIdentityTransform(transform),
      gating: true,
      detail: `transform=${transform}`,
    });

    await context.close();
  }

  // ---- Check: touch context attaches nothing ------------------------------
  {
    const context = await browser.newContext({
      viewport: { width: 1710, height: 960 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await sleep(300);

    const pointerFine = await page.evaluate(
      () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
    const handle = await page.getByRole("button", { name: "VIEW MY WORK" }).elementHandle();
    const box = await handle.boundingBox();
    // Chromium still lets Playwright dispatch synthetic mouse events in a
    // touch-emulated context — this confirms the magnet stays inert even if
    // one arrived, not just that no touch input was sent. Inside the box, as
    // above, so this exercises the touch gate specifically.
    await page.mouse.move(box.x + 10, box.y + box.height / 2, { steps: 10 });
    await sleep(200);
    const transform = await readTransform(handle, undefined);

    results.push({
      name: "Magnet: touch emulation reports a coarse/no-hover pointer",
      pass: pointerFine === false,
      gating: true,
      detail: `pointerFine=${pointerFine}`,
    });
    results.push({
      name: "Magnet: touch emulation — no transform under simulated pointer contact",
      pass: isIdentityTransform(transform),
      gating: true,
      detail: `transform=${transform}`,
    });

    await context.close();
  }

  // ---- Check: pointer-capability and reduced-motion logic live in one place
  // Static, not a browser check — greps src/ for the two matchMedia queries
  // useMagnet.ts (and, per CLAUDE.md, the cursor bubble) must reuse from
  // lib/motion.ts rather than reimplementing.
  {
    const pointerFineHits = execSync(
      String.raw`grep -rl 'matchMedia(.*hover: hover.*pointer: fine' src/ || true`,
      { cwd: new URL("..", import.meta.url).pathname, encoding: "utf8" },
    ).trim().split("\n").filter(Boolean);
    const reducedMotionHits = execSync(
      String.raw`grep -rl 'matchMedia(.*prefers-reduced-motion' src/ || true`,
      { cwd: new URL("..", import.meta.url).pathname, encoding: "utf8" },
    ).trim().split("\n").filter(Boolean);

    results.push({
      name: "Grep: pointer-capability query (hover/pointer:fine) defined in exactly one file",
      pass: pointerFineHits.length === 1,
      gating: true,
      detail: pointerFineHits.join(", ") || "no hits",
    });
    results.push({
      name: "Grep: reduced-motion query defined in exactly one file",
      pass: reducedMotionHits.length === 1,
      gating: true,
      detail: reducedMotionHits.join(", ") || "no hits",
    });
  }
}

// --- Cursor label bubble checks (session 4, CursorLabel.tsx) ---------------
// Nav's and Footer's mail/LinkedIn controls are role-scoped to their landmark
// (`nav[aria-label="Main"]` vs the implicit "contentinfo" `<footer>`) since
// ContactLinks.tsx's extraction means both render the same accessible name.

function mailLocator(page, landmarkRole, landmarkName) {
  const scope = landmarkName
    ? page.getByRole(landmarkRole, { name: landmarkName })
    : page.getByRole(landmarkRole);
  return scope.getByRole("button", { name: /Copy email/ });
}

function linkedinLocator(page, landmarkRole, landmarkName) {
  const scope = landmarkName
    ? page.getByRole(landmarkRole, { name: landmarkName })
    : page.getByRole(landmarkRole);
  return scope.getByRole("link", { name: "Alice on LinkedIn" });
}

async function cursorLabelChecks(browser, base, results) {
  // ---- Show/hide, label text, click-through, and the clipboard gate ------
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    const navMail = mailLocator(page, "navigation", "Main");
    const navLinkedin = linkedinLocator(page, "navigation", "Main");

    await navMail.hover();
    await page.waitForSelector("[data-cursor-bubble]", { timeout: 2000 });
    const bubbleCount = await page.locator("[data-cursor-bubble]").count();
    const bubbleTextOnHover = await page.locator("[data-cursor-bubble]").innerText();

    results.push({
      name: "Cursor bubble: exactly one instance in the DOM while hovering the mail icon",
      pass: bubbleCount === 1,
      gating: true,
      detail: `count=${bubbleCount}`,
    });
    results.push({
      name: "Cursor bubble: shows the copy-email label on hover",
      pass: bubbleTextOnHover.includes("A2GUO@UCSD.EDU"),
      gating: true,
      detail: `text="${bubbleTextOnHover}"`,
    });

    // Click reaches the icon despite the bubble sitting over it —
    // Playwright's own actionability check throws if a different element
    // would intercept the click, so a successful click here is itself proof
    // pointer-events: none on the bubble is doing its job, not an assumption
    // about it.
    await navMail.click();
    const announced = await page
      .waitForFunction(
        () =>
          Array.from(document.querySelectorAll('[aria-live="polite"]')).some((el) =>
            el.textContent?.includes("Copied"),
          ),
        { timeout: 2000 },
      )
      .then(() => true)
      .catch(() => false);
    results.push({
      name: "Cursor bubble: click reaches the mail icon (bubble intercepts nothing)",
      pass: announced,
      gating: true,
      detail: `announced=${announced}`,
    });

    const bubbleTextAfterClick = await page.locator("[data-cursor-bubble]").innerText();
    results.push({
      name: 'Cursor bubble: label swaps to "COPIED" only after the write resolves',
      pass: bubbleTextAfterClick === "COPIED",
      gating: true,
      detail: `text="${bubbleTextAfterClick}"`,
    });

    await sleep(1800); // past ContactLinks.tsx's COPY_FEEDBACK_MS (1500ms)
    const bubbleTextAfterRevert = await page.locator("[data-cursor-bubble]").innerText();
    results.push({
      name: "Cursor bubble: reverts to the copy-email label after the feedback window",
      pass: bubbleTextAfterRevert.includes("A2GUO@UCSD.EDU"),
      gating: true,
      detail: `text="${bubbleTextAfterRevert}"`,
    });

    await page.mouse.move(50, 50);
    const bubbleGone = await page
      .waitForSelector("[data-cursor-bubble]", { state: "detached", timeout: 2000 })
      .then(() => true)
      .catch(() => false);
    results.push({
      name: "Cursor bubble: hides after the pointer leaves",
      pass: bubbleGone,
      gating: true,
      detail: bubbleGone ? "removed" : "still present",
    });

    await navLinkedin.hover();
    await page.waitForSelector("[data-cursor-bubble]", { timeout: 2000 });
    const linkedinBubbleText = await page.locator("[data-cursor-bubble]").innerText();
    results.push({
      name: 'Cursor bubble: shows "CONNECT" on the LinkedIn icon',
      pass: linkedinBubbleText === "CONNECT",
      gating: true,
      detail: `text="${linkedinBubbleText}"`,
    });

    const cursorNoneAnywhere = await page.evaluate(
      () => Array.from(document.querySelectorAll("*")).some((el) => getComputedStyle(el).cursor === "none"),
    );
    results.push({
      name: "cursor: none is applied nowhere on the page",
      pass: !cursorNoneAnywhere,
      gating: true,
      detail: cursorNoneAnywhere ? "found an element with cursor: none" : "clean",
    });

    await context.close();
  }

  // ---- Reduced motion: bubble still appears, without the entrance/lag ----
  {
    const context = await browser.newContext({
      viewport: { width: 1710, height: 960 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#page-top")?.getAttribute("data-loaded") === "true",
      { timeout: 4000 },
    );

    await mailLocator(page, "navigation", "Main").hover();
    await page.waitForSelector("[data-cursor-bubble]", { timeout: 500 }).catch(() => {});
    const opacity = await page.evaluate(() => {
      const el = document.querySelector("[data-cursor-bubble]");
      return el ? Number.parseFloat(getComputedStyle(el).opacity) : -1;
    });
    results.push({
      name: "Cursor bubble: reduced motion — full opacity essentially immediately, no entrance animation",
      pass: opacity >= 0.99,
      gating: true,
      detail: `opacity=${opacity}`,
    });

    await context.close();
  }

  // ---- Touch: no bubble at all ---------------------------------------------
  {
    const context = await browser.newContext({
      viewport: { width: 1710, height: 960 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await sleep(300);
    await page.mouse.move(300, 300); // Chromium still dispatches pointermove for this
    await sleep(200);
    const bubbleExists = (await page.locator("[data-cursor-bubble]").count()) > 0;
    results.push({
      name: "Cursor bubble: touch emulation renders no bubble",
      pass: !bubbleExists,
      gating: true,
      detail: `count=${bubbleExists ? ">0" : 0}`,
    });

    await context.close();
  }

  // ---- Nav/Footer render-identical (ContactLinks.tsx extraction) ---------
  // Session-4 request: "identical rendered output" measured, not asserted.
  // Nav's and Footer's icon markup differed, pre-extraction, only in color
  // classes (text-muted-gray/hover:text-accent-blue-light vs
  // text-pure-white/hover:text-accent-blue) — everything else (tag, aria-
  // label, href, icon svg) must still match exactly post-extraction.
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });

    async function describe(locator) {
      return locator.evaluate((el) => ({
        tag: el.tagName,
        ariaLabel: el.getAttribute("aria-label"),
        href: el.getAttribute("href"),
        svgViewBox: el.querySelector("svg")?.getAttribute("viewBox") ?? null,
        classList: Array.from(el.classList),
      }));
    }

    function stripColorClasses(classes) {
      return classes.filter((c) => !c.startsWith("text-") && !c.startsWith("hover:text-"));
    }

    const navMailD = await describe(mailLocator(page, "navigation", "Main"));
    const footerMailD = await describe(mailLocator(page, "contentinfo"));
    const navLinkedinD = await describe(linkedinLocator(page, "navigation", "Main"));
    const footerLinkedinD = await describe(linkedinLocator(page, "contentinfo"));

    const mailMatches =
      navMailD.tag === footerMailD.tag &&
      navMailD.svgViewBox === footerMailD.svgViewBox &&
      navMailD.ariaLabel === footerMailD.ariaLabel &&
      JSON.stringify(stripColorClasses(navMailD.classList)) ===
        JSON.stringify(stripColorClasses(footerMailD.classList));

    const linkedinMatches =
      navLinkedinD.tag === footerLinkedinD.tag &&
      navLinkedinD.svgViewBox === footerLinkedinD.svgViewBox &&
      navLinkedinD.ariaLabel === footerLinkedinD.ariaLabel &&
      navLinkedinD.href === footerLinkedinD.href &&
      JSON.stringify(stripColorClasses(navLinkedinD.classList)) ===
        JSON.stringify(stripColorClasses(footerLinkedinD.classList));

    results.push({
      name: "Nav/Footer render-identical: mail button matches except color classes",
      pass: mailMatches,
      gating: true,
      detail: `nav=${JSON.stringify(navMailD)} footer=${JSON.stringify(footerMailD)}`,
    });
    results.push({
      name: "Nav/Footer render-identical: LinkedIn link matches except color classes",
      pass: linkedinMatches,
      gating: true,
      detail: `nav=${JSON.stringify(navLinkedinD)} footer=${JSON.stringify(footerLinkedinD)}`,
    });
    results.push({
      name: "Nav/Footer aria-label text matches pre-extraction markup",
      pass:
        navMailD.ariaLabel === "Copy email address a2guo@ucsd.edu to clipboard" &&
        navLinkedinD.ariaLabel === "Alice on LinkedIn",
      gating: true,
      detail: `mail="${navMailD.ariaLabel}" linkedin="${navLinkedinD.ariaLabel}"`,
    });

    await context.close();
  }
}

// --- About page pin checks (session 5B, aboutGeometry.ts) -------------------
// The frame-locks/text-column-scrolls mechanic on /about. Same discipline as
// verify-project-section.mjs: every check reads real rendered rects and
// computed styles off the page rather than re-typing NAV_CLEARANCE/
// BOTTOM_GAP/etc. as literals here, so a real drift between aboutGeometry.ts
// and the rendered page is exactly what these catch. BOTTOM_GAP and
// NAV_CLEARANCE are read back as the underlying --spacing-lg /
// --spacing-nav-height custom properties they mirror. Kept as its own
// section (own viewport list, own helpers) so the home-page checks above
// aren't perturbed.

const ABOUT_VIEWPORTS = [
  { name: '16" MBP', width: 1710, height: 1040 },
  { name: '13" Air (900)', width: 1440, height: 900 },
  { name: '13" Air (760)', width: 1440, height: 760 },
];

// Below this height none of the three ABOUT_VIEWPORTS sit — chosen well
// under aboutGeometry.ts's own MIN_ABOUT_VIEWPORT_H (717) without
// hardcoding that number here.
const ABOUT_SUBTHRESHOLD_VIEWPORT = { width: 1440, height: 650 };

async function readAboutTokens(page) {
  return page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      bottomGap: Number.parseFloat(cs.getPropertyValue("--spacing-lg")),
      navClearance: Number.parseFloat(cs.getPropertyValue("--spacing-nav-height")),
      // Fix-pass: the nav/frame breathing-room gap mirrors this token
      // (Figma "padding/small") — read back from the page, not re-typed as
      // a literal.
      navFrameGap: Number.parseFloat(cs.getPropertyValue("--spacing-sm")),
    };
  });
}

async function aboutSample(page) {
  return page.evaluate(() => {
    function rectOf(sel) {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect() : null;
    }
    const photoWindowEl = document.querySelector('[data-testid="about-photo-window"]');
    const textContentEl = document.querySelector('[data-testid="about-text-content"]');
    return {
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      frame: rectOf('[data-testid="about-frame"]'),
      nav: rectOf('nav[aria-label="Main"]'),
      ticker: rectOf(".ticker-fade"),
      photo: rectOf('[data-testid="about-photo"]'),
      photoWindow: rectOf('[data-testid="about-photo-window"]'),
      photoWindowClientH: photoWindowEl?.clientHeight ?? null,
      photoWindowScrollH: photoWindowEl?.scrollHeight ?? null,
      textWindow: rectOf('[data-testid="about-text-window"]'),
      textContent: rectOf('[data-testid="about-text-content"]'),
      textContentTransform: textContentEl ? getComputedStyle(textContentEl).transform : null,
    };
  });
}

// Predicted pin window from measured rects — NOT from an imported copy of
// aboutGeometry.ts's constants. sectionTop/sectionHeight/frameHeight are
// all read off the real rendered elements, so this only assumes the same
// *shape* of relationship (frame position bottom = viewportH - bottomGap
// for a sticky element inside a section sized to frame + travel) that a
// generic sticky-pin mechanic has — the frame's actual on-screen position
// throughout the scan is governed by CSS (position: sticky) entirely
// independent of this formula, so comparing the two is a real check, not
// a tautology.
async function computeAboutPinWindow(page, bottomGap) {
  return page.evaluate((gap) => {
    const section = document.querySelector('[data-testid="about-section"]');
    const wrapper = document.querySelector('[data-testid="about-sticky-wrapper"]');
    if (!section || !wrapper) return null;
    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top + window.scrollY;
    const sectionHeight = section.offsetHeight;
    const frameHeight = wrapper.offsetHeight;
    const lockStart = sectionTop - (window.innerHeight - gap - frameHeight);
    const travel = Math.max(0, sectionHeight - frameHeight);
    return { lockStart, lockEnd: lockStart + travel, travel, frameHeight };
  }, bottomGap);
}

async function scrollAboutTo(page, y) {
  await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), y);
  // Let motion/react's rAF-driven `scrollY`/`textY` MotionValues settle —
  // direct window.scrollTo (unlike a wheel gesture) doesn't fight Lenis
  // (verified empirically: Lenis only syncs its own state from the native
  // scroll position, it doesn't animate away from a position it didn't
  // itself initiate), so two rAFs is enough, no settleScroll() polling
  // loop needed.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

async function aboutPinChecks(browser, base, results) {
  const aboutUrl = new URL("/about", base).toString();
  const perViewportPhoto = [];

  for (const viewport of ABOUT_VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__aboutCls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__aboutCls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(aboutUrl, { waitUntil: "networkidle" });

    const { bottomGap, navClearance, navFrameGap } = await readAboutTokens(page);
    const win = await computeAboutPinWindow(page, bottomGap);

    if (!win) {
      results.push({
        name: `${viewport.name}: About pin — section/sticky-wrapper found in DOM`,
        pass: false,
        gating: true,
        detail: "no [data-testid=about-section] / [data-testid=about-sticky-wrapper] — page may have rendered the fallback at this viewport unexpectedly",
      });
      await context.close();
      continue;
    }

    // ---- Structural stacking check (the acec80d signature) --------------
    // Static, deterministic proxy for "the background gradient doesn't
    // paint over the content" — checks the actual stacking order rule
    // (z-10 content wrapper vs z-0 image) rather than sampling pixels,
    // which would be flaky against anti-aliased text and JPEG compression.
    const stacking = await page.evaluate(() => {
      const frame = document.querySelector('[data-testid="about-frame"]');
      const img = frame?.querySelector("img");
      const contentWrapper = img?.nextElementSibling;
      if (!frame || !img || !contentWrapper) return null;
      return {
        imgZ: getComputedStyle(img).zIndex,
        imgPosition: getComputedStyle(img).position,
        contentZ: getComputedStyle(contentWrapper).zIndex,
        contentPosition: getComputedStyle(contentWrapper).position,
      };
    });
    results.push({
      name: `${viewport.name}: About frame — background image stacks below content (no acec80d regression)`,
      pass: !!stacking && stacking.imgPosition === "absolute" && stacking.contentPosition === "relative" &&
        Number(stacking.contentZ) > (Number.isNaN(Number(stacking.imgZ)) ? 0 : Number(stacking.imgZ)),
      gating: true,
      detail: JSON.stringify(stacking),
    });

    // ---- Sticky wrapper carries no z-index (own stacking-context risk) --
    const wrapperZ = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-testid="about-sticky-wrapper"]')).zIndex,
    );
    results.push({
      name: `${viewport.name}: sticky wrapper has no z-index (falls through to auto)`,
      pass: wrapperZ === "auto",
      gating: true,
      detail: `zIndex=${wrapperZ}`,
    });

    // ---- Scan the pin window + a margin before/after --------------------
    const margin = Math.max(200, win.travel * 0.1);
    const scanStart = Math.max(0, win.lockStart - margin);
    const scanEnd = win.lockEnd + margin;
    const steps = 30;
    const samples = [];
    for (let i = 0; i <= steps; i++) {
      const y = scanStart + ((scanEnd - scanStart) * i) / steps;
      await scrollAboutTo(page, y);
      samples.push(await aboutSample(page));
    }

    const inPin = samples.filter((s) => s.scrollY >= win.lockStart - 1 && s.scrollY <= win.lockEnd + 1);

    // ---- Check 1: frame bottom sits exactly bottomGap above viewport bottom
    const bottomOffsets = inPin.map((s) => s.innerHeight - s.frame.bottom);
    const bottomOk = bottomOffsets.every((off) => Math.abs(off - bottomGap) < 1.5);
    results.push({
      name: `${viewport.name}: frame bottom holds exactly BOTTOM_GAP above viewport bottom through the pin`,
      pass: bottomOk && inPin.length > 0,
      gating: true,
      detail: `bottomGap=${bottomGap} offsets(min/max)=${Math.min(...bottomOffsets)?.toFixed(2)}/${Math.max(...bottomOffsets)?.toFixed(2)} samples=${inPin.length}`,
    });

    // ---- Check 3: frame top never overlaps the nav in the pinned range --
    const topOk = inPin.every((s) => s.frame.top >= s.nav.bottom - 0.5);
    results.push({
      name: `${viewport.name}: frame top never overlaps the nav during the pin`,
      pass: topOk,
      gating: true,
      detail: `navClearance(token)=${navClearance} min(frame.top-nav.bottom)=${Math.min(...inPin.map((s) => s.frame.top - s.nav.bottom)).toFixed(2)}`,
    });

    // ---- Fix 2: frame locks exactly navFrameGap (--spacing-sm) below the
    // nav, not just "doesn't overlap" — the whole point of the fix.
    const navGapOffsets = inPin.map((s) => s.frame.top - s.nav.bottom);
    const navGapOk = navGapOffsets.every((off) => Math.abs(off - navFrameGap) < 1.5);
    results.push({
      name: `${viewport.name}: frame locks exactly navFrameGap (--spacing-sm) below the nav`,
      pass: navGapOk,
      gating: true,
      detail: `navFrameGap(token)=${navFrameGap} offsets(min/max)=${Math.min(...navGapOffsets).toFixed(2)}/${Math.max(...navGapOffsets).toFixed(2)}`,
    });

    // ---- Fix 1: HOLD_PX dead zone at hold 0 — text holds at rest for a
    // real stretch of scroll past lockStart, then starts traveling toward
    // hold 1. Doesn't hardcode the tuned constant (it's a judgment call,
    // expected to get retuned): scans for the actual observed pause and
    // asserts it's substantial (not a rounding artifact) and leaves real
    // travel remaining afterward, so a future retune of HOLD_PX doesn't
    // need this check rewritten. (Session 5D: this is now hold 0 of six,
    // not a standalone pause constant — see the hold-plateau checks below
    // for the other five.)
    {
      const identityAt = async (y) => {
        await scrollAboutTo(page, y);
        const t = await page.evaluate(
          () => getComputedStyle(document.querySelector('[data-testid="about-text-content"]')).transform,
        );
        return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
      };
      let observedPause = 0;
      const probeStep = Math.max(4, Math.round(win.travel * 0.02));
      for (let dy = 0; dy <= win.travel; dy += probeStep) {
        if (!(await identityAt(win.lockStart + dy))) break;
        observedPause = dy;
      }
      results.push({
        name: `${viewport.name}: a real scroll dead-zone holds the text at rest after lock (Fix 1)`,
        pass: observedPause > 20 && observedPause < win.travel * 0.5,
        gating: true,
        detail: `observedPause≈${observedPause}px (probe step ${probeStep}px), travel=${win.travel.toFixed(0)}`,
      });
    }

    // ---- Check 2: ticker never partially clipped at lock onset ----------
    await scrollAboutTo(page, win.lockStart);
    const atLock = await aboutSample(page);
    const tickerPartial =
      atLock.ticker !== null && atLock.ticker.top < -0.5 && atLock.ticker.bottom > 0.5;
    results.push({
      name: `${viewport.name}: ticker not partially clipped at the viewport's top edge at lock onset`,
      pass: !tickerPartial,
      gating: true,
      detail: atLock.ticker ? JSON.stringify(atLock.ticker) : "ticker off-screen (null rect not expected — element always mounted)",
    });

    // Report (non-gating) where the ticker's accepted transit falls,
    // relative to the pin window — this is documented, accepted behavior
    // (aboutGeometry.ts's TICKER_H comment / plan §A4), not a defect, so
    // it's visible in the run rather than silently unverified.
    {
      const fine = [];
      const fineStart = Math.max(0, win.lockStart - 400);
      for (let i = 0; i <= 40; i++) {
        const y = fineStart + (400 * i) / 40;
        await scrollAboutTo(page, y);
        const s = await aboutSample(page);
        if (s.ticker && s.ticker.top < -0.5 && s.ticker.bottom > 0.5) fine.push(s.scrollY);
      }
      const transitInPin = fine.length > 0 && fine[0] >= win.lockStart - 1;
      results.push({
        name: `${viewport.name}: ticker transit window (report only, accepted per plan §A4)`,
        pass: true,
        gating: false,
        detail: fine.length
          ? `ticker partially clipped for scrollY [${fine[0].toFixed(0)}, ${fine[fine.length - 1].toFixed(0)}], lockStart=${win.lockStart.toFixed(0)} (inside pin: ${transitInPin})`
          : "no partial-clip window found in the scanned range",
      });
    }

    // ---- Session 5D: hold plateaus, and the live color/photo/counter
    // spotlight at each one. Supersedes the old "last paragraph fully
    // reachable" check (session 5C's runway requirement — every header
    // reaching the window's literal top edge — no longer exists; each hold,
    // including the last, now releases once its block reaches ITS OWN
    // center, not any shared edge).
    //
    // Detects plateaus empirically off the real rendered transform, not by
    // re-typing HOLD_PX or the measured hold positions — same discipline
    // as the Fix 1 pause check above, extended from one plateau to six.
    const parseTranslateY = (transform) => {
      if (transform === "none") return 0;
      const match = transform.match(/matrix\(([-\d.,\s]+)\)/);
      if (!match) return null;
      const parts = match[1].split(",").map((v) => Number.parseFloat(v.trim()));
      return parts.length === 6 ? parts[5] : null;
    };

    const fineSteps = 240;
    const fineSamples = [];
    for (let i = 0; i <= fineSteps; i++) {
      const y = win.lockStart + (win.travel * i) / fineSteps;
      await scrollAboutTo(page, y);
      const t = await page.evaluate(
        () => getComputedStyle(document.querySelector('[data-testid="about-text-content"]')).transform,
      );
      fineSamples.push({ scrollY: y, ty: -(parseTranslateY(t) ?? 0) });
    }

    // A plateau is a maximal run of consecutive samples whose ty doesn't
    // move (within a rounding tolerance) — a real, substantial dwell, not
    // a momentary flat spot between two probe steps.
    const plateaus = [];
    let runStart = 0;
    for (let i = 1; i <= fineSamples.length; i++) {
      const stillFlat = i < fineSamples.length && Math.abs(fineSamples[i].ty - fineSamples[runStart].ty) <= 1;
      if (stillFlat) continue;
      const runLen = fineSamples[i - 1].scrollY - fineSamples[runStart].scrollY;
      if (runLen > 20) {
        plateaus.push({
          y: fineSamples[runStart].ty,
          scrollStart: fineSamples[runStart].scrollY,
          scrollEnd: fineSamples[i - 1].scrollY,
        });
      }
      runStart = i;
    }

    results.push({
      name: `${viewport.name}: exactly 6 hold plateaus across the pin range`,
      pass: plateaus.length === 6,
      gating: true,
      detail: JSON.stringify(
        plateaus.map((p) => ({ y: +p.y.toFixed(1), scrollStart: +p.scrollStart.toFixed(0), scrollEnd: +p.scrollEnd.toFixed(0) })),
      ),
    });

    // Predicted hold positions from real rendered block rects — an
    // independent measurement (this evaluate reads the DOM fresh; it does
    // not import aboutGeometry.ts's pinSchedule or useAboutPin.ts's
    // measure()), so agreement here is a genuine cross-check, not a
    // tautology.
    const predictedHolds = await page.evaluate(() => {
      const windowEl = document.querySelector('[data-testid="about-text-window"]');
      const content = document.querySelector('[data-testid="about-text-content"]');
      const windowH = windowEl.getBoundingClientRect().height;
      const contentTop = content.getBoundingClientRect().top;
      let prev = 0;
      return Array.from(content.querySelectorAll("[data-about-block]"), (block) => {
        const r = block.getBoundingClientRect();
        const top = r.top - contentTop;
        const raw = r.height > windowH ? top : top + r.height / 2 - windowH / 2;
        const hold = Math.max(prev, Math.max(0, raw));
        prev = hold;
        return hold;
      });
    });

    const holdsMatch =
      plateaus.length === predictedHolds.length && plateaus.every((p, i) => Math.abs(p.y - predictedHolds[i]) < 2);
    results.push({
      name: `${viewport.name}: each plateau's y matches its block's measured center (±2px)`,
      pass: holdsMatch,
      gating: true,
      detail: `plateaus=${JSON.stringify(plateaus.map((p) => +p.y.toFixed(1)))} predicted=${JSON.stringify(predictedHolds.map((h) => +h.toFixed(1)))}`,
    });

    // ---- At each plateau's midpoint: counter, photo, and color spotlight,
    // color-only (no transform/opacity/blur on any block), and — scrolling
    // back from hold 4 to hold 2 — reversal with no special-casing needed.
    // The custom property's own raw value (--color-deep-black: #0d0d0d)
    // isn't the same string format `getComputedStyle(el).color` resolves
    // to (rgb(13, 13, 13)) — same color, different serialization. Resolve
    // each token through a real `color` property on a throwaway element so
    // both sides of the comparison below go through the same
    // browser-normalized format, rather than comparing a hex literal
    // against an rgb() string.
    const revealTokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.display = "none";
      document.body.appendChild(probe);
      probe.style.color = "var(--color-deep-black)";
      const black = getComputedStyle(probe).color;
      probe.style.color = "var(--color-dark-gray)";
      const gray = getComputedStyle(probe).color;
      probe.remove();
      return { black, gray };
    });

    const sampleHold = async (index) => {
      const plateau = plateaus[index];
      await scrollAboutTo(page, (plateau.scrollStart + plateau.scrollEnd) / 2);
      await page.waitForTimeout(650); // DUR.reveal's color transition settling
      return page.evaluate(() => {
        const counterEl = document.querySelector('[data-testid="about-photo-window"]').parentElement.querySelector("span");
        const photos = Array.from(document.querySelectorAll('[data-testid="about-photo-window"] > div'), (el) =>
          Number.parseFloat(getComputedStyle(el).opacity),
        );
        const blocks = Array.from(document.querySelectorAll("[data-color-reveal]"), (p) => {
          const cs = getComputedStyle(p);
          return { color: cs.color, transform: cs.transform, opacity: cs.opacity, filter: cs.filter };
        });
        return { counter: counterEl?.textContent ?? null, photos, blocks };
      });
    };

    const normalizeColor = (c) => c.replace(/\s/g, "");
    const assertHold = (index, sample) => {
      const expectedCounter = String(index + 1).padStart(2, "0");
      results.push({
        name: `${viewport.name}: hold ${index + 1}/6 — counter reads ${expectedCounter}/06`,
        pass: sample.counter === expectedCounter,
        gating: true,
        detail: `counter=${sample.counter}`,
      });
      const photoOk = sample.photos.every((op, i) => (i === index ? op > 0.99 : op < 0.01));
      results.push({
        name: `${viewport.name}: hold ${index + 1}/6 — only photo ${index + 1} is at full opacity`,
        pass: photoOk,
        gating: true,
        detail: JSON.stringify(sample.photos.map((o) => +o.toFixed(2))),
      });
      const colorOk = sample.blocks.every((b, i) =>
        i === index
          ? normalizeColor(b.color) === normalizeColor(revealTokens.black)
          : normalizeColor(b.color) === normalizeColor(revealTokens.gray),
      );
      results.push({
        name: `${viewport.name}: hold ${index + 1}/6 — only block ${index + 1} is deep-black, every other block (passed or not yet reached) is gray`,
        pass: colorOk,
        gating: true,
        detail: JSON.stringify(sample.blocks.map((b) => b.color)),
      });
      const colorOnlyOk = sample.blocks.every(
        (b) =>
          (b.transform === "none" || b.transform === "matrix(1, 0, 0, 1, 0, 0)") &&
          Math.abs(Number.parseFloat(b.opacity) - 1) < 0.01 &&
          b.filter === "none",
      );
      results.push({
        name: `${viewport.name}: hold ${index + 1}/6 — color only, no transform/opacity/blur on any block`,
        pass: colorOnlyOk,
        gating: true,
        detail: JSON.stringify(sample.blocks.map((b) => ({ transform: b.transform, opacity: b.opacity, filter: b.filter }))),
      });
    };

    if (plateaus.length === 6) {
      for (let i = 0; i < 6; i++) assertHold(i, await sampleHold(i));

      // Reverse: settle at hold 4, then scroll back to hold 2 — the
      // previously-black paragraph (hold 4, index 3) must be gray again,
      // with no special-casing (this is the same sampleHold/assertHold
      // used forward).
      await sampleHold(3);
      assertHold(1, await sampleHold(1));
    }

    // ---- Width regression: the content column matches the WINDOW's own
    // width, not the clamp's TEXT_COL_MIN_W floor — the bug this session's
    // §1 fix caught (the content div re-applied textColumnWidthCss, whose
    // 100% branch resolved against the window itself and floored out).
    const widthCheck = await page.evaluate(() => {
      const windowEl = document.querySelector('[data-testid="about-text-window"]');
      const content = document.querySelector('[data-testid="about-text-content"]');
      return {
        windowWidth: windowEl.getBoundingClientRect().width,
        contentWidth: content.getBoundingClientRect().width,
      };
    });
    results.push({
      name: `${viewport.name}: text content column matches the window's own width (no clamp-floor regression)`,
      pass: Math.abs(widthCheck.windowWidth - widthCheck.contentWidth) < 1,
      gating: true,
      detail: JSON.stringify(widthCheck),
    });

    // ---- Check 7: reverse scroll returns exactly to the starting transform
    await scrollAboutTo(page, win.lockEnd);
    const atRestBefore = await aboutSample(page);
    await scrollAboutTo(page, 0);
    const atTop = await aboutSample(page);
    await scrollAboutTo(page, win.lockEnd);
    const atEndAgain = await aboutSample(page);
    results.push({
      name: `${viewport.name}: scrolling back to top returns text column to its exact starting transform`,
      pass: atTop.textContentTransform === "none" || atTop.textContentTransform === "matrix(1, 0, 0, 1, 0, 0)",
      gating: true,
      detail: `transform=${atTop.textContentTransform}`,
    });
    results.push({
      name: `${viewport.name}: scrolling back down reaches the exact same end transform as before`,
      pass: atEndAgain.textContentTransform === atRestBefore.textContentTransform,
      gating: true,
      detail: `before=${atRestBefore.textContentTransform} after=${atEndAgain.textContentTransform}`,
    });

    // ---- Check 4: photo never exceeds 448px; right column never extends
    // past the frame's own content box. NOT `photoWindow.scrollHeight <=
    // clientHeight` — that window deliberately clips five of its six
    // stacked photos at rest (overflow: hidden, same as TextColumn's own
    // window), so a taller scrollHeight there is correct-by-design, not
    // overflow. The real invariant is that the right column doesn't poke
    // out past where the frame's padding box actually ends — proxied by
    // the text column's window bottom: that outer window's own bottom edge
    // is fixed by CSS (frame height minus padding), independent of where
    // the hold schedule currently has the content translated to, so it's a
    // stable reference regardless of scroll position.
    await scrollAboutTo(page, win.lockStart);
    const photoSample = await aboutSample(page);
    const photoColumnOverflow =
      !!photoSample.photoWindow && !!photoSample.textWindow && photoSample.photoWindow.bottom > photoSample.textWindow.bottom + 1.5;
    results.push({
      name: `${viewport.name}: photo window never overflows the frame`,
      pass: !photoColumnOverflow,
      gating: true,
      detail: `photoWindow.bottom=${photoSample.photoWindow?.bottom.toFixed(2)} textWindow.bottom=${photoSample.textWindow?.bottom.toFixed(2)}`,
    });
    results.push({
      name: `${viewport.name}: photo height never exceeds Figma's 448px`,
      pass: !!photoSample.photo && photoSample.photo.height <= 448.5,
      gating: true,
      detail: `photo.height=${photoSample.photo?.height.toFixed(2)}`,
    });
    perViewportPhoto.push({ name: viewport.name, height: photoSample.photo?.height ?? null, viewportH: viewport.height });

    // ---- Check 8: CLS = 0 across pin entry and exit ----------------------
    await page.evaluate(() => {
      window.__aboutCls = 0;
    });
    await scrollAboutTo(page, Math.max(0, win.lockStart - 300));
    await scrollAboutTo(page, win.lockStart);
    await scrollAboutTo(page, win.lockEnd);
    await scrollAboutTo(page, win.lockEnd + 300);
    const cls = await page.evaluate(() => window.__aboutCls ?? 0);
    results.push({
      name: `${viewport.name}: no cumulative layout shift across pin entry and exit`,
      pass: cls < 0.01,
      gating: true,
      detail: `CLS=${cls}`,
    });

    // ---- Sticky-ancestor invariant, /about specifically ------------------
    const offenders = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll("*")) {
        if (getComputedStyle(el).position !== "sticky") continue;
        let node = el.parentElement;
        while (node) {
          const s = getComputedStyle(node);
          if (
            (s.transform && s.transform !== "none") ||
            (s.filter && s.filter !== "none") ||
            (s.perspective && s.perspective !== "none") ||
            s.contain?.includes("paint")
          ) {
            bad.push({ sticky: el.tagName + (el.id ? `#${el.id}` : ""), ancestor: node.tagName });
            break;
          }
          node = node.parentElement;
        }
      }
      return bad;
    });
    results.push({
      name: `${viewport.name}: /about — no sticky element has a transformed/filtered/perspective ancestor`,
      pass: offenders.length === 0,
      gating: true,
      detail: offenders.length ? JSON.stringify(offenders) : "clean",
    });

    // ---- Screenshot for direct visual inspection (not just computed styles)
    try {
      const shotDir = process.env.VERIFY_SHOT_DIR || ".";
      await scrollAboutTo(page, win.lockStart + win.travel / 2);
      await page.locator('[data-testid="about-frame"]').screenshot({
        path: `${shotDir}/about-pin-${viewport.width}x${viewport.height}.png`,
      });
    } catch {
      // Non-fatal — the structural stacking check above is the gating
      // signal; this screenshot is for a human/direct look, per the plan.
    }

    await context.close();
  }

  // ---- Cross-viewport: photo shrinks (never grows) as FRAME_H shrinks ----
  const heights = perViewportPhoto.map((p) => p.height);
  const monotonicNonIncreasing = heights.every((h, i) => i === 0 || h <= heights[i - 1] + 0.5);
  results.push({
    name: "Photo height shrinks (never grows) as viewport height shrinks, across all three sizes",
    pass: monotonicNonIncreasing,
    gating: true,
    detail: JSON.stringify(perViewportPhoto),
  });

  // ---- Fix 3: text/photo columns hold with no overflow/collision, and
  // match Figma at the reference width, at 1440/1600/1710 — both in the
  // pinned view and the fallback (which had the same shape of bug: no
  // fixed width at all, so it silently never matched Figma, not caught by
  // any 5B check). Deliberately not testing narrower than 1440 — that's
  // still the deferred responsive pass, per the plan.
  {
    const COLUMN_WIDTHS = [1440, 1600, 1710];
    for (const width of COLUMN_WIDTHS) {
      // Pinned view.
      const context = await browser.newContext({ viewport: { width, height: 1040 } });
      const page = await context.newPage();
      await page.goto(aboutUrl, { waitUntil: "networkidle" });
      await page.mouse.wheel(0, 1500);
      await page.waitForTimeout(400);
      const pinned = await page.evaluate(() => {
        const frame = document.querySelector('[data-testid="about-frame"]').getBoundingClientRect();
        const textWindow = document.querySelector('[data-testid="about-text-window"]').getBoundingClientRect();
        const photoWindow = document.querySelector('[data-testid="about-photo-window"]').getBoundingClientRect();
        return {
          textWidth: textWindow.width,
          photoWidth: photoWindow.width,
          gap: photoWindow.left - textWindow.right,
          overlap: photoWindow.left < textWindow.right - 0.5,
          photoOverflowsFrame: photoWindow.right > frame.right + 0.5,
        };
      });
      results.push({
        name: `${width}px width: pinned columns don't collide or overflow the frame`,
        pass: !pinned.overlap && !pinned.photoOverflowsFrame && pinned.gap >= 0,
        gating: true,
        detail: JSON.stringify(pinned),
      });
      await context.close();

      // Fallback — same two-column shape, checked separately since it had
      // no width constraint at all before this fix.
      const fbContext = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const fbPage = await fbContext.newPage();
      await fbPage.goto(aboutUrl, { waitUntil: "networkidle" });
      await fbPage.waitForTimeout(300);
      const fallback = await fbPage.evaluate(() => {
        const rows = document.querySelectorAll('[data-testid="about-section-fallback"] .flex.w-full.flex-col.gap-3xl > div');
        const row = rows[0];
        if (!row) return null;
        const textWrap = row.children[0].getBoundingClientRect();
        const photo = row.children[1].getBoundingClientRect();
        return { textWidth: textWrap.width, photoWidth: photo.width, gap: photo.left - textWrap.right, overlap: photo.left < textWrap.right - 0.5 };
      });
      results.push({
        name: `${width}px width: fallback columns don't collide`,
        pass: !!fallback && !fallback.overlap && fallback.gap >= 0,
        gating: true,
        detail: JSON.stringify(fallback),
      });
      await fbContext.close();
    }

    // Reference width reproduces Figma's exact split, in both layouts.
    const refContext = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
    const refPage = await refContext.newPage();
    await refPage.goto(aboutUrl, { waitUntil: "networkidle" });
    await refPage.mouse.wheel(0, 1500);
    await refPage.waitForTimeout(400);
    const refPinned = await refPage.evaluate(() => {
      const textWindow = document.querySelector('[data-testid="about-text-window"]').getBoundingClientRect();
      const photoWindow = document.querySelector('[data-testid="about-photo-window"]').getBoundingClientRect();
      return { textWidth: textWindow.width, gap: photoWindow.left - textWindow.right };
    });
    results.push({
      name: "1710px width: pinned view reproduces Figma's 663/194/653 split exactly",
      pass: Math.abs(refPinned.textWidth - 663) < 1 && Math.abs(refPinned.gap - 194) < 1,
      gating: true,
      detail: JSON.stringify(refPinned),
    });
    await refContext.close();
  }

  // ---- Reduced motion: no pin, no clip, no transform, no listeners -------
  {
    const context = await browser.newContext({
      viewport: { width: 1710, height: 1040 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(aboutUrl, { waitUntil: "networkidle" });
    await sleep(300);

    const state = await page.evaluate(() => ({
      hasStickyWrapper: !!document.querySelector('[data-testid="about-sticky-wrapper"]'),
      hasFallback: !!document.querySelector('[data-testid="about-section-fallback"]'),
      hasPhotoWindow: !!document.querySelector('[data-testid="about-photo-window"]'),
      photoCount: document.querySelectorAll('[data-testid="about-photo"]').length,
    }));
    results.push({
      name: "Reduced motion: /about renders the plain fallback (no pin, no clipped photo window)",
      pass: !state.hasStickyWrapper && state.hasFallback && !state.hasPhotoWindow && state.photoCount === 6,
      gating: true,
      detail: JSON.stringify(state),
    });

    await context.close();
  }

  // ---- Sub-threshold viewport: same fallback, no listeners ---------------
  {
    const context = await browser.newContext({ viewport: ABOUT_SUBTHRESHOLD_VIEWPORT });
    const page = await context.newPage();
    await page.goto(aboutUrl, { waitUntil: "networkidle" });
    await sleep(300);

    const state = await page.evaluate(() => ({
      hasStickyWrapper: !!document.querySelector('[data-testid="about-sticky-wrapper"]'),
      hasFallback: !!document.querySelector('[data-testid="about-section-fallback"]'),
      photoCount: document.querySelectorAll('[data-testid="about-photo"]').length,
    }));
    results.push({
      name: `Sub-threshold viewport (${ABOUT_SUBTHRESHOLD_VIEWPORT.width}x${ABOUT_SUBTHRESHOLD_VIEWPORT.height}): /about renders the plain fallback`,
      pass: !state.hasStickyWrapper && state.hasFallback && state.photoCount === 6,
      gating: true,
      detail: JSON.stringify(state),
    });

    await context.close();
  }
}

// --- Checks -----------------------------------------------------------------
// `results` (built up in main()) is a flat list of { name, pass, gating,
// detail } that the report step at the bottom prints and gates the exit
// code on. Kept as one flat list rather than per-check functions returning
// objects, since most checks need state (page, handle) threaded through
// several async steps in sequence.

async function main() {
  // Next.js refuses to run two dev servers against the same project
  // directory (it's a project-wide lock, not a per-port one), so a second
  // `next dev` fails outright whenever one is already running — e.g. the
  // one this IDE environment keeps up on :3000 for live preview. Reuse it
  // when present rather than fighting it, and only spawn our own otherwise.
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
  let clsReport = [];

  try {
    await waitForServer(base);
    const browser = await chromium.launch();

    for (const viewport of VIEWPORTS) {
      for (const target of TARGETS) {
        // ---- Check 1 + 2: fires once, no re-fire, no layout shift -------
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
        const page = await context.newPage();

        await page.addInitScript(() => {
          window.__cls = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) window.__cls += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
        });

        await page.goto(base, { waitUntil: "networkidle" });

        const handle = await revealHandle(page, target.find);
        const before = await readBox(handle);

        const label = `${viewport.name} — ${target.name}`;

        // Layout shift is measured from mount, before any scroll, using the
        // transform-invariant layout box (see readBox).
        const preScrollBox = {
          top: before.layoutTop,
          left: before.layoutLeft,
          width: before.layoutWidth,
          height: before.layoutHeight,
        };

        // Scroll the target into view via real wheel events, so Lenis is
        // genuinely in the loop rather than jumping via scrollIntoView.
        let guard = 0;
        while (guard++ < 60) {
          const box = await handle.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
          });
          if (box.top < box.vh * 0.7) break;
          await page.mouse.wheel(0, 400);
          await sleep(30);
        }
        await settleScroll(page);
        await sleep(600); // let the DUR.reveal transition finish

        const atRest = await readBox(handle);
        results.push({
          name: `${label}: reveals to opacity 1`,
          pass: atRest.opacity >= 0.99,
          gating: true,
          detail: `opacity=${atRest.opacity}`,
        });
        results.push({
          name: `${label}: transform settles to identity`,
          pass: isIdentity(atRest.transform),
          gating: true,
          detail: `transform=${atRest.transform}`,
        });

        const postRevealBox = {
          top: atRest.layoutTop,
          left: atRest.layoutLeft,
          width: atRest.layoutWidth,
          height: atRest.layoutHeight,
        };
        const shifted =
          Math.abs(preScrollBox.top - postRevealBox.top) > 0.5 ||
          Math.abs(preScrollBox.left - postRevealBox.left) > 0.5 ||
          Math.abs(preScrollBox.width - postRevealBox.width) > 0.5 ||
          Math.abs(preScrollBox.height - postRevealBox.height) > 0.5;
        results.push({
          name: `${label}: no layout shift from reveal transform`,
          pass: !shifted,
          gating: true,
          detail: `before=${JSON.stringify(preScrollBox)} after=${JSON.stringify(postRevealBox)}`,
        });

        // Scroll back to top, then down again: must never re-dip to hidden.
        await page.mouse.wheel(0, -20000);
        await settleScroll(page);
        const backAtTop = await readBox(handle);

        await page.mouse.wheel(0, 20000);
        await settleScroll(page);
        await sleep(300);
        const afterReturn = await readBox(handle);

        results.push({
          name: `${label}: does not re-fire (stays revealed while scrolled away)`,
          pass: backAtTop.opacity >= 0.99 && isIdentity(backAtTop.transform),
          gating: true,
          detail: `opacity=${backAtTop.opacity} transform=${backAtTop.transform}`,
        });
        results.push({
          name: `${label}: does not re-fire (stays revealed on return)`,
          pass: afterReturn.opacity >= 0.99 && isIdentity(afterReturn.transform),
          gating: true,
          detail: `opacity=${afterReturn.opacity} transform=${afterReturn.transform}`,
        });

        const cls = await page.evaluate(() => window.__cls ?? 0);
        clsReport.push({ label, cls });

        await context.close();
      }

      // ---- Check 4 + 5: reduced motion, first paint + hydration safety --
      const rmContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: "reduce",
      });
      const rmPage = await rmContext.newPage();

      const consoleIssues = [];
      const pageErrors = [];
      rmPage.on("console", (msg) => {
        const text = msg.text();
        if (
          msg.type() === "error" ||
          /hydration|did not match|hydrating/i.test(text)
        ) {
          consoleIssues.push(text);
        }
      });
      rmPage.on("pageerror", (err) => pageErrors.push(String(err)));

      await rmPage.goto(base, { waitUntil: "networkidle" });
      await sleep(300); // give React a moment past hydration

      for (const target of TARGETS) {
        const handle = await revealHandle(rmPage, target.find);
        const box = await readBox(handle);
        const label = `${viewport.name} — ${target.name} (reduced motion)`;
        results.push({
          name: `${label}: visible at full opacity immediately`,
          pass: box.opacity >= 0.99,
          gating: true,
          detail: `opacity=${box.opacity}`,
        });
        results.push({
          name: `${label}: no transform applied`,
          pass: isIdentity(box.transform) && box.inlineTransform === "",
          gating: true,
          detail: `computed=${box.transform} inline="${box.inlineTransform}"`,
        });
        results.push({
          name: `${label}: no residual will-change`,
          pass: box.willChange === "auto" || box.willChange === "",
          gating: false,
          detail: `will-change=${box.willChange}`,
        });
      }

      results.push({
        name: `${viewport.name}: no hydration errors under reduced motion`,
        pass: consoleIssues.length === 0 && pageErrors.length === 0,
        gating: true,
        detail: [...consoleIssues, ...pageErrors].join(" | ") || "clean",
      });

      await rmContext.close();
    }

    // ---- Check 6: sticky invariant (viewport-independent, run once) -----
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      const offenders = await page.evaluate(() => {
        const bad = [];
        for (const el of document.querySelectorAll("*")) {
          if (getComputedStyle(el).position !== "sticky") continue;
          let node = el.parentElement;
          while (node) {
            const s = getComputedStyle(node);
            if (
              (s.transform && s.transform !== "none") ||
              (s.filter && s.filter !== "none") ||
              (s.perspective && s.perspective !== "none") ||
              s.contain?.includes("paint")
            ) {
              bad.push({
                sticky: el.tagName + (el.id ? `#${el.id}` : ""),
                ancestor: node.tagName + (node.id ? `#${node.id}` : ""),
              });
              break;
            }
            node = node.parentElement;
          }
        }
        return bad;
      });
      results.push({
        name: "No sticky element has a transformed/filtered/perspective ancestor",
        pass: offenders.length === 0,
        gating: true,
        detail: offenders.length ? JSON.stringify(offenders) : "clean",
      });
      await context.close();
    }

    // ---- Hero load sequence (session 3) — checks 2-7 -----------------------
    await loadSequenceChecks(browser, base, results);

    // ---- Magnetic buttons (session 4) --------------------------------------
    await magnetChecks(browser, base, results);

    // ---- Cursor label bubble (session 4) -----------------------------------
    await cursorLabelChecks(browser, base, results);

    // ---- About page pin (session 5B) ---------------------------------------
    await aboutPinChecks(browser, base, results);

    await browser.close();
  } finally {
    // Never kill a server we didn't start ourselves.
    server?.kill("SIGTERM");
  }

  // ---- Check 1: wall clock, against a real production server -------------
  // Separate from the block above: motion/react can't start until React
  // hydrates, and dev's hydration is meaningfully slower than prod's, so this
  // is measured against `next start`, not whatever dev server `base` pointed
  // at. Run `npm run build` before `npm run verify` — this does not build for
  // you, to keep a single run's cost predictable.
  let wallClockResult = null;
  {
    const prodPort = await getFreePort();
    const prodBase = `http://localhost:${prodPort}`;
    const prodServer = startProdServer(prodPort);
    let prodOutput = "";
    prodServer.stdout.on("data", (d) => (prodOutput += d.toString()));
    prodServer.stderr.on("data", (d) => (prodOutput += d.toString()));

    try {
      await waitForServer(prodBase, 30_000);
      const browser = await chromium.launch();
      const context = await browser.newContext({ viewport: { width: 1710, height: 960 } });
      const page = await context.newPage();
      await page.goto(prodBase, { waitUntil: "commit" });
      wallClockResult = await measureLoadWallClock(page);
      await context.close();
      await browser.close();
    } catch (err) {
      wallClockResult = { error: String(err), output: prodOutput.slice(-1000) };
    } finally {
      prodServer.kill("SIGTERM");
    }
  }

  // --- Report ---------------------------------------------------------------
  // Session 3 revision: no hard ceiling any more — CLAUDE.md now frames the
  // ~1.4-1.5s wordmark / ~2s full-sequence numbers as a soft target ("close
  // is fine"), not a gate. Reported here for visibility; only a genuine
  // measurement failure (sequence never settling at all) fails the run.
  const WORDMARK_TARGET_MS = [1400, 1500];
  const TOTAL_TARGET_MS = 2000;

  console.log("\n=== Hero load sequence: wall clock (production server) ===\n");
  if (wallClockResult?.error) {
    console.log(`  FAILED TO MEASURE: ${wallClockResult.error}`);
    if (wallClockResult.output) {
      console.log(`  --- prod server output (tail) ---\n${wallClockResult.output}`);
    }
  } else if (wallClockResult.wallClockMs < 0 || wallClockResult.wordmarkWallClockMs < 0) {
    console.log('  Sequence never reached data-loaded="true" (or the wordmark never settled) within 4000ms of FCP.');
  } else {
    console.log(`  FCP=${wallClockResult.fcp.toFixed(1)}ms`);
    console.log(
      `  wordmark alone: ${wallClockResult.wordmarkWallClockMs.toFixed(1)}ms first-paint-to-rest (target: ${WORDMARK_TARGET_MS[0]}-${WORDMARK_TARGET_MS[1]}ms)`,
    );
    console.log(
      `  full sequence:  ${wallClockResult.wallClockMs.toFixed(1)}ms first-paint-to-rest (target: ~${TOTAL_TARGET_MS}ms)`,
    );
    console.log("  (soft target, not a gate — close is fine, per CLAUDE.md \"Hero load sequence\")");
  }

  console.log("\n=== Results ===\n");
  let failed = 0;
  for (const r of results) {
    const mark = r.pass ? "PASS" : r.gating ? "FAIL" : "warn";
    if (!r.pass && r.gating) failed++;
    console.log(`[${mark}] ${r.name}${r.pass ? "" : `  (${r.detail})`}`);
  }
  if (wallClockResult?.error || wallClockResult?.wallClockMs < 0 || wallClockResult?.wordmarkWallClockMs < 0) {
    failed++; // a real measurement failure, not a missed soft target
  }

  console.log("\n=== Cumulative Layout Shift (reported, non-gating) ===\n");
  for (const { label, cls } of clsReport) {
    console.log(`  ${label}: CLS=${cls.toFixed(4)}`);
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
