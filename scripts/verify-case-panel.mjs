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

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const PAGE_PATH = "/work/f3global";

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

async function panelVariant(page) {
  return page.evaluate(() => (document.querySelector("nav[aria-label='Case study sections']") ? "nav" : "meta"));
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
        name: "section tops discovered via data-section (4 for f3global)",
        pass: tops.length === 4,
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
        return {
          active: active ? getComputedStyle(active).color : null,
          inactive: inactive ? getComputedStyle(inactive).color : null,
          ariaCurrentCount: items.filter((el) => el.getAttribute("aria-current") === "location").length,
        };
      });

      results.push({
        name: "active item renders in the project accent (rgb(72, 57, 205))",
        pass: colors.active === "rgb(72, 57, 205)",
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

    // ---- Check 7: reduced motion — sticky stays, swap is instant -----------
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

    // ---- Check 8: deep link on cold load ------------------------------------
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
