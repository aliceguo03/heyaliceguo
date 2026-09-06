#!/usr/bin/env node
// Real-browser verification for scroll-driven animation work (build order
// step 10). Run on demand with `npm run verify` — not wired into `build` or
// `test`. See CLAUDE.md "Animation system" and the session-1 plan.
//
// Extend, don't rewrite: add a target to TARGETS or a viewport to VIEWPORTS
// as later sessions add reveals. The check bodies below are generic over
// both lists.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
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

    await browser.close();
  } finally {
    // Never kill a server we didn't start ourselves.
    server?.kill("SIGTERM");
  }

  // --- Report ---------------------------------------------------------------
  console.log("\n=== Results ===\n");
  let failed = 0;
  for (const r of results) {
    const mark = r.pass ? "PASS" : r.gating ? "FAIL" : "warn";
    if (!r.pass && r.gating) failed++;
    console.log(`[${mark}] ${r.name}${r.pass ? "" : `  (${r.detail})`}`);
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
