#!/usr/bin/env node
// Real-browser verification for the case study's sticky info panel
// (CasePanel.tsx / InfoPanel.tsx / PanelNav.tsx / PanelMeta.tsx /
// useCaseStudyPanel.ts). Run on demand with
// `node scripts/verify-case-panel.mjs` — not wired into `build` or `test`.
// Same harness shape as verify-project-section.mjs; every check here is a
// measured box or computed style, never an eyeball call.
//
// Selector note: the info panel is found via `[data-info-panel]`, not the
// generic `.sticky[style*='top']` this script used before the Design
// Decisions carousel (verify-case-carousel.mjs) landed — CarouselStage.tsx
// pins with that exact same class-plus-inline-top shape, so the old
// selector would now match two elements on this page for an unrelated
// reason, not zero or one.
//
// Case-study-agnostic since the Chase session: `PAGE_PATH` and the expected
// section count are argv, not literals, so the same script verifies any
// case study's sidebar/panel — `node scripts/verify-case-panel.mjs
// /work/chase 3` is what turned "the panel worked with zero component
// changes for a 3-section case study" from a claim into a measurement. The
// active-item color check no longer hardcodes a project's accent RGB
// either: it reads `--color-accent-project` off the page itself (set by
// work/[slug]/page.tsx from Project.accent) and compares against that, so
// it verifies the *mechanism* (active item = the project's own accent) for
// any project, not one hardcoded hex.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const PAGE_PATH = process.argv[2] ?? "/work/f3global";
const EXPECTED_SECTION_COUNT = Number(process.argv[3] ?? 4);

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  const [, r, g, b] = m;
  return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`;
}

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

async function panelRect(page) {
  return page.evaluate(() => {
    const el = document.querySelector("[data-info-panel]");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { top: r.top, left: r.left, width: r.width, height: r.height, cssTop: cs.top };
  });
}

async function sectionTops(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-section]")).map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.dataset.section, top: r.top + window.scrollY };
    }),
  );
}

async function activeNavItem(page) {
  return page.evaluate(() => {
    const el = document.querySelector('a[aria-current="location"]');
    return el ? el.getAttribute("href") : null;
  });
}

// Fix pass (item 1): PanelNav now mounts for the section's whole life (the
// stacking transition slides it in/out rather than mounting/unmounting it),
// so its mere presence in the DOM no longer tells you which layer is on
// top. [data-panel-nav-layer]'s own `inert` state does — CasePanel.tsx
// toggles it on `current`, the same discrete value that used to gate
// whether PanelNav rendered at all. Falls back to the old presence check
// when that layer doesn't exist at all (belowDesktop and reduced-motion
// both render only one variant, with no stacking wrapper).
async function panelVariant(page) {
  return page.evaluate(() => {
    const navLayer = document.querySelector("[data-panel-nav-layer]");
    if (navLayer) return navLayer.inert ? "meta" : "nav";
    return document.querySelector("nav[aria-label='Case study sections']") ? "nav" : "meta";
  });
}

// The nav layer's own translateY, in px, read off its computed transform
// matrix (matrix(a,b,c,d,tx,ty) — ty is index 5) rather than its inline
// `style.transform`, so this reflects what the browser actually painted,
// not the last value React happened to write. `getComputedStyle` resolves
// the `y: "100%"/"0%"` percentage against the element's own box, so this
// comes back as a real pixel number either way.
async function navLayerY(page) {
  return page.evaluate(() => {
    const el = document.querySelector("[data-panel-nav-layer]");
    if (!el) return null;
    const t = getComputedStyle(el).transform;
    if (t === "none") return 0;
    const m = /matrix\(([^)]+)\)/.exec(t);
    if (!m) return null;
    const parts = m[1].split(",").map(Number);
    return parts[5];
  });
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

  const url = `${base}${PAGE_PATH}`;
  const results = []; // { name, pass, gating, detail }

  try {
    await waitForServer(base);
    const browser = await chromium.launch();

    // ---- Check 1: exactly one panel element exists -------------------------
    for (const viewport of [
      { width: 1710, height: 1040 },
      { width: 1440, height: 760 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const count = await page.evaluate(() => document.querySelectorAll("[data-info-panel]").length);
      results.push({
        name: `exactly one sticky panel at ${viewport.width}x${viewport.height}`,
        pass: count === 1,
        gating: true,
        detail: `found ${count}`,
      });

      await context.close();
    }

    // ---- Check 2: panel box + sticky top, full vs compact ------------------
    const sizeChecks = [
      { viewport: { width: 1710, height: 1040 }, expectH: 840, label: "full" },
      { viewport: { width: 1440, height: 760 }, expectH: 600, label: "compact" },
    ];
    for (const { viewport, expectH, label } of sizeChecks) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const rect = await panelRect(page);
      results.push({
        name: `panel is ${label} (${expectH}px) at ${viewport.width}x${viewport.height}`,
        pass: !!rect && rect.width === 383 && Math.abs(rect.height - expectH) < 1,
        gating: true,
        detail: JSON.stringify(rect),
      });
      results.push({
        name: `panel sticky top resolves to 106px at ${viewport.width}x${viewport.height}`,
        pass: !!rect && rect.cssTop === "106px",
        gating: true,
        detail: rect?.cssTop,
      });

      // Sticky, no drift: scroll far enough that the panel has definitely
      // engaged its sticky offset (past the hero, into the content column),
      // then scroll further and confirm its own viewport y hasn't moved.
      await page.evaluate(() => window.scrollTo(0, 2200));
      await sleep(200);
      const before = await panelRect(page);
      await page.evaluate(() => window.scrollTo(0, 2600));
      await sleep(200);
      const after = await panelRect(page);
      results.push({
        name: `panel does not drift while sticky at ${viewport.width}x${viewport.height}`,
        pass: !!before && !!after && Math.abs(before.top - after.top) < 1,
        gating: true,
        detail: `before=${before?.top} after=${after?.top}`,
      });

      await context.close();
    }

    // ---- Check 3: reading-line crossings, no dead zone, no hold ------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      // Before any section: metadata variant, index -1 (no active item).
      results.push({
        name: "panel shows metadata over the hero/overview",
        pass: (await panelVariant(page)) === "meta",
        gating: true,
      });

      const tops = await sectionTops(page);
      results.push({
        name: `section tops discovered via data-section (${EXPECTED_SECTION_COUNT} for ${PAGE_PATH})`,
        pass: tops.length === EXPECTED_SECTION_COUNT,
        gating: true,
        detail: JSON.stringify(tops),
      });

      const READING_LINE = 0.4;
      for (const section of tops) {
        const line = section.top - 1040 * READING_LINE;

        // 1px above the crossing: previous state should still hold.
        await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, line - 1));
        await sleep(200);
        const beforeHref = await activeNavItem(page);
        const beforeVariant = await panelVariant(page);

        // 1px past the crossing: this section should now be active.
        await page.evaluate((y) => window.scrollTo(0, y), line + 1);
        await sleep(200);
        const afterHref = await activeNavItem(page);
        const afterVariant = await panelVariant(page);

        results.push({
          name: `reading line crossing lands exactly at #${section.id}`,
          pass: afterVariant === "nav" && afterHref === `#${section.id}`,
          gating: true,
          detail: `before(variant=${beforeVariant},href=${beforeHref}) after(variant=${afterVariant},href=${afterHref})`,
        });
      }

      // Scrolling back to the very top returns to metadata at the same line.
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(300);
      results.push({
        name: "scrolling back to the top returns to metadata",
        pass: (await panelVariant(page)) === "meta",
        gating: true,
      });

      await context.close();
    }

    // ---- Check 4: colors — inactive / hover / active -----------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const tops = await sectionTops(page);
      await page.evaluate((y) => window.scrollTo(0, y + 10), tops[0].top - 1040 * 0.4 + 1);
      await sleep(120);

      const colors = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll("nav[aria-label='Case study sections'] a"));
        const active = items.find((el) => el.getAttribute("aria-current") === "location");
        const inactive = items.find((el) => el.getAttribute("aria-current") !== "location");
        const main = document.querySelector("main");
        return {
          active: active ? getComputedStyle(active).color : null,
          inactive: inactive ? getComputedStyle(inactive).color : null,
          ariaCurrentCount: items.filter((el) => el.getAttribute("aria-current") === "location").length,
          accentVar: main ? getComputedStyle(main).getPropertyValue("--color-accent-project") : null,
        };
      });
      const expectedAccent = colors.accentVar ? hexToRgb(colors.accentVar) : null;

      results.push({
        name: `active item renders in the project accent (${expectedAccent ?? "?"}, from --color-accent-project=${colors.accentVar})`,
        pass: !!expectedAccent && colors.active === expectedAccent,
        gating: true,
        detail: colors.active,
      });
      results.push({
        name: "inactive item renders in dark-gray (rgb(92, 92, 92)), not muted-gray",
        pass: colors.inactive === "rgb(92, 92, 92)",
        gating: true,
        detail: colors.inactive,
      });
      results.push({
        name: "exactly one item carries aria-current=location",
        pass: colors.ariaCurrentCount === 1,
        gating: true,
        detail: String(colors.ariaCurrentCount),
      });

      await context.close();
    }

    // ---- Check 5: compact type sizes at 1440x760 ---------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 760 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const meta = await page.evaluate(() => {
        const label = document.querySelector(".text-accent-project.font-mono");
        return label ? getComputedStyle(label).fontSize : null;
      });
      results.push({
        name: "compact meta label is 16px (--text-mono-caption)",
        pass: meta === "16px",
        gating: true,
        detail: meta,
      });

      await context.close();
    }

    // ---- Check 6: jump navigation ------------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const tops = await sectionTops(page);
      await page.evaluate((y) => window.scrollTo(0, y + 10), tops[0].top - 1040 * 0.4 + 1);
      await sleep(120);

      await page.click("nav[aria-label='Case study sections'] a[href='#outcome-impact']");
      await sleep(1500); // Lenis DUR.scroll (1.2s) settle

      const landed = await page.evaluate(() => {
        const el = document.getElementById("outcome-impact");
        return el ? el.getBoundingClientRect().top : null;
      });
      const focused = await page.evaluate(() => document.activeElement?.id);
      results.push({
        name: "jump lands #outcome-impact at the nav clearance (94px)",
        pass: landed !== null && Math.abs(landed - 94) < 2,
        gating: true,
        detail: `top=${landed}`,
      });
      results.push({
        name: "jump moves focus to the target section",
        pass: focused === "outcome-impact",
        gating: true,
        detail: focused,
      });
      results.push({
        name: "jump commits the panel to the target immediately (no flicker)",
        pass: (await activeNavItem(page)) === "#outcome-impact",
        gating: true,
      });

      await context.close();
    }

    // ---- Check 7: sidebar stacking transition (item 1, scroll-linked) ------
    // The metadata->nav boundary is where section 0's own top crosses the
    // reading line (same crossing check 3 already locates); the slide
    // itself runs through a STACK_WINDOW-px scroll range centered on it
    // (caseStudyGeometry.ts). Run at both the full (840px, 1710x1040) and
    // compact (600px, 1440x760) shells, since a percentage `y` transform
    // gets its slide distance from the layer's own height — a bug scoped to
    // one variant wouldn't show up testing only the other.
    {
      const STACK_WINDOW = 300; // caseStudyGeometry.ts — re-tuned against real scroll feel

      for (const { viewport, label } of [
        { viewport: { width: 1710, height: 1040 }, label: "full (840px)" },
        { viewport: { width: 1440, height: 760 }, label: "compact (600px)" },
      ]) {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: "networkidle" });

        const tops = await sectionTops(page);
        const boundary = tops[0].top - viewport.height * 0.4;
        const start = boundary - STACK_WINDOW / 2;
        const end = boundary + STACK_WINDOW / 2;
        // The layer's OWN rect height — a percentage `y` transform resolves
        // against the element's own box. Since the review pass (item 3)
        // moved the card's border/radius/padding/background onto this same
        // layer element (rather than a shared, unmoving ancestor), its box
        // is now the full shell height (840/600), matching panelRect below
        // exactly — it's read independently here rather than assumed equal
        // to panelRect, since the two coming apart is exactly the bug this
        // check exists to catch.
        const layerHeight = await page.evaluate(() => {
          const el = document.querySelector("[data-panel-nav-layer]");
          return el ? el.getBoundingClientRect().height : null;
        });

        await page.evaluate((y) => window.scrollTo(0, Math.max(0, y)), start - 200);
        await sleep(150);
        const beforeY = await navLayerY(page);
        results.push({
          name: `${label}: nav layer parked fully below the shell before the window`,
          pass: beforeY !== null && layerHeight !== null && Math.abs(beforeY - layerHeight) < 2,
          gating: true,
          detail: `y=${beforeY} layerHeight=${layerHeight}`,
        });

        await page.evaluate((y) => window.scrollTo(0, y), end + 200);
        await sleep(150);
        const afterY = await navLayerY(page);
        results.push({
          name: `${label}: nav layer flush (y=0) well after the window`,
          pass: afterY !== null && Math.abs(afterY) < 1,
          gating: true,
          detail: `y=${afterY}`,
        });

        // Monotonically decreasing across the window, 10px steps.
        const downSamples = [];
        for (let y = start - 20; y <= end + 20; y += 10) {
          await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), y);
          await sleep(40);
          downSamples.push(await navLayerY(page));
        }
        const monotonicDown = downSamples.every((v, i) => i === 0 || v <= downSamples[i - 1] + 0.5);
        results.push({
          name: `${label}: slide is monotonically decreasing scrolling down`,
          pass: monotonicDown,
          gating: true,
          detail: JSON.stringify(downSamples),
        });

        // Reversible: scroll back up through the same range and confirm the
        // same values return (this is the "scrolling back up visibly slides
        // the nav layer back down" requirement, measured, not eyeballed).
        const upSamples = [];
        for (let y = end + 20; y >= start - 20; y -= 10) {
          await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), y);
          await sleep(40);
          upSamples.push(await navLayerY(page));
        }
        const downReversed = [...downSamples].reverse();
        const reversible = upSamples.every((v, i) => Math.abs(v - downReversed[i]) < 1.5);
        results.push({
          name: `${label}: scrolling back up reverses the slide`,
          pass: reversible,
          gating: true,
          detail: JSON.stringify({ up: upSamples, downReversed }),
        });

        // Review pass (item 1): a first pass gave the sliding layer a
        // shadow, then removed it — at partial progress it bled onto the
        // metadata layer's own not-yet-covered region, reading as a stray
        // artifact rather than a leading edge casting depth. Sampled across
        // the whole window (not just at rest) since that's specifically
        // where the bled shadow showed up.
        const noShadowSamples = [];
        for (let y = start - 20; y <= end + 20; y += 20) {
          await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), y);
          await sleep(30);
          noShadowSamples.push(
            await page.evaluate(() => {
              const el = document.querySelector("[data-panel-nav-layer]");
              return el ? getComputedStyle(el).boxShadow : null;
            }),
          );
        }
        results.push({
          name: `${label}: no box-shadow on the sliding layer at any point in the transition`,
          pass: noShadowSamples.every((s) => s === "none"),
          gating: true,
          detail: JSON.stringify(noShadowSamples),
        });

        // Review pass (item 3): the border/radius/background used to live
        // on a shared, unmoving shell — only the text slid while that
        // chrome stayed fixed. Confirm the nav layer's OWN border now
        // travels with it (present at every progress, not just at rest, and
        // never on the shared ancestor any more) and the metadata layer
        // carries the identical equivalent.
        const chromeSamples = [];
        for (const y of [start - 20, boundary, end + 20]) {
          await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy)), y);
          await sleep(60);
          chromeSamples.push(
            await page.evaluate(() => {
              const nav = document.querySelector("[data-panel-nav-layer]");
              const meta = document.querySelector("[data-panel-meta-layer]");
              const shell = document.querySelector("[data-info-panel]");
              // Tailwind's preflight reset sets `border-style: solid` on
              // every element sitewide (width 0) so form controls inherit a
              // border color for free later — borderStyle alone is "solid"
              // everywhere regardless of whether a real border is applied.
              // borderTopWidth is the actual signal: "1px" for a real
              // border-divider border, "0px" for the reset default.
              return {
                navWidth: nav ? getComputedStyle(nav).borderTopWidth : null,
                metaWidth: meta ? getComputedStyle(meta).borderTopWidth : null,
                shellWidth: shell ? getComputedStyle(shell).borderTopWidth : null,
              };
            }),
          );
        }
        results.push({
          name: `${label}: each layer carries its own border (not the shared shell)`,
          pass:
            chromeSamples.every((s) => s.navWidth === "1px" && s.metaWidth === "1px") &&
            chromeSamples.every((s) => s.shellWidth === "0px"),
          gating: true,
          detail: JSON.stringify(chromeSamples),
        });

        await context.close();
      }
    }

    // ---- Check 8: reduced motion — sticky stays, swap is instant -----------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const rect = await panelRect(page);
      results.push({
        name: "reduced motion: panel still sticky at 106px",
        pass: !!rect && rect.cssTop === "106px",
        gating: true,
        detail: rect?.cssTop,
      });

      results.push({
        name: "reduced motion: no scroll-linked stacking layer renders at all",
        pass: !(await page.evaluate(() => !!document.querySelector("[data-panel-nav-layer]"))),
        gating: true,
      });

      const tops = await sectionTops(page);
      await page.evaluate((y) => window.scrollTo(0, y + 10), tops[0].top - 1040 * 0.4 + 1);
      // No settle delay — reduced motion should already show the swapped
      // variant on the very next frame, not after a transition.
      await sleep(50);
      results.push({
        name: "reduced motion: swap is effectively instant",
        pass: (await panelVariant(page)) === "nav",
        gating: true,
      });

      await context.close();
    }

    // ---- Check 9: deep link on cold load ------------------------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(`${url}#outcome-impact`, { waitUntil: "networkidle" });
      await sleep(300);

      results.push({
        name: "deep link to #outcome-impact resolves to the right index on cold load",
        pass: (await activeNavItem(page)) === "#outcome-impact",
        gating: true,
        detail: await activeNavItem(page),
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
