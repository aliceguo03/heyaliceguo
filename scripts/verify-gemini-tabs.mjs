#!/usr/bin/env node
// Real-browser verification for GeminiCut's click-driven tabs carousel
// (CarouselTabs.tsx / SelectTab.tsx) and its two video behaviors
// (AmbientVideo.tsx / FeatureVideo.tsx). Run on demand with
// `node scripts/verify-gemini-tabs.mjs` — not wired into `build` or `test`.
// Same harness shape as verify-case-carousel.mjs.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const PAGE_PATH = "/work/geminicut";

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

async function readTabsSnapshot(page) {
  return page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
    return {
      labels: tabs.map((t) => t.textContent?.trim()),
      selected: tabs.map((t) => t.getAttribute("aria-selected")),
      tabIndex: tabs.map((t) => t.tabIndex),
      panelInert: panels.map((p) => p.hasAttribute("inert")),
      panelAriaHidden: panels.map((p) => p.getAttribute("aria-hidden")),
      videoPaused: panels.map((p) => {
        const v = p.querySelector("video");
        return v ? v.paused : null;
      }),
      videoLoop: panels.map((p) => p.querySelector("video")?.loop ?? null),
      videoControls: panels.map((p) => p.querySelector("video")?.controls ?? null),
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

  const url = `${base}${PAGE_PATH}`;
  const results = [];

  try {
    await waitForServer(base);
    const browser = await chromium.launch();

    // ---- Check 1: tabs structure + labels at 1710x1040 ----------------------
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      // Scroll the carousel into view so its IntersectionObserver fires and
      // tab 1's video (autoplay-on-scroll-into-view, per the approved
      // answer) has a chance to start.
      await page.evaluate(() => {
        document.querySelector('[role="tablist"]')?.scrollIntoView({ block: "center" });
      });
      await sleep(500);

      const snap = await readTabsSnapshot(page);
      results.push({
        name: "exactly 4 tabs with the expected Figma labels",
        pass:
          snap.labels.length === 4 &&
          JSON.stringify(snap.labels) ===
            JSON.stringify(["EDIT & REGENERATE", "EDIT TIMELINE", "EDIT STYLE", "EDIT SOUND"]),
        gating: true,
        detail: JSON.stringify(snap.labels),
      });
      results.push({
        name: "exactly one tab is aria-selected",
        pass: snap.selected.filter((s) => s === "true").length === 1 && snap.selected[0] === "true",
        gating: true,
        detail: JSON.stringify(snap.selected),
      });
      results.push({
        name: "roving tabindex: only the selected tab is tabbable",
        pass: JSON.stringify(snap.tabIndex) === JSON.stringify([0, -1, -1, -1]),
        gating: true,
        detail: JSON.stringify(snap.tabIndex),
      });
      results.push({
        name: "inactive panels are inert + aria-hidden; active panel is neither",
        pass:
          snap.panelInert[0] === false &&
          snap.panelAriaHidden[0] === "false" &&
          snap.panelInert.slice(1).every(Boolean) &&
          snap.panelAriaHidden.slice(1).every((v) => v === "true"),
        gating: true,
        detail: JSON.stringify({ inert: snap.panelInert, hidden: snap.panelAriaHidden }),
      });
      results.push({
        name: "carousel video wells measure 1077x616",
        pass: await page.evaluate(() => {
          const wells = Array.from(document.querySelectorAll('[role="tabpanel"] video')).map(
            (v) => v.closest("div")?.getBoundingClientRect(),
          );
          return wells.every((r) => r && Math.abs(r.width - 1077) < 2 && Math.abs(r.height - 616) < 2);
        }),
        gating: true,
      });
      results.push({
        name: "tab 1's video autoplays once scrolled into view (no click yet)",
        pass: snap.videoPaused[0] === false,
        gating: true,
        detail: JSON.stringify(snap.videoPaused),
      });
      results.push({
        name: "only the selected tab's video plays; the rest stay paused",
        pass: snap.videoPaused[0] === false && snap.videoPaused.slice(1).every((p) => p === true),
        gating: true,
        detail: JSON.stringify(snap.videoPaused),
      });
      results.push({
        name: "carousel videos have native loop, no controls",
        pass: snap.videoLoop.every((v) => v === true) && snap.videoControls.every((v) => v === false),
        gating: true,
        detail: JSON.stringify({ loop: snap.videoLoop, controls: snap.videoControls }),
      });
      results.push({
        name: "no horizontal overflow at 1710x1040",
        pass: !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)),
        gating: true,
      });

      // ---- Click tab 3 (EDIT STYLE) — selection + playback follow the click
      const tabs = await page.$$('[role="tab"]');
      await tabs[2].click();
      await sleep(700); // DUR.reveal crossfade settle

      const afterClick = await readTabsSnapshot(page);
      results.push({
        name: "clicking a tab moves aria-selected and plays only that tab's video",
        pass:
          afterClick.selected[2] === "true" &&
          afterClick.selected.filter((s) => s === "true").length === 1 &&
          afterClick.videoPaused[2] === false &&
          afterClick.videoPaused.filter((p) => p === false).length === 1,
        gating: true,
        detail: JSON.stringify({ selected: afterClick.selected, paused: afterClick.videoPaused }),
      });

      // ---- Keyboard: ArrowRight from tab 3 moves to tab 4 and moves focus
      await page.keyboard.press("ArrowRight");
      await sleep(200);
      const afterArrow = await readTabsSnapshot(page);
      const focusedLabel = await page.evaluate(() => document.activeElement?.textContent?.trim());
      results.push({
        name: "ArrowRight moves selection and focus to the next tab",
        pass: afterArrow.selected[3] === "true" && focusedLabel === "EDIT SOUND",
        gating: true,
        detail: JSON.stringify({ selected: afterArrow.selected, focusedLabel }),
      });

      // ---- Scrolling the carousel off-screen pauses the playing video
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(500);
      const offScreen = await readTabsSnapshot(page);
      results.push({
        name: "scrolling the carousel off-screen pauses the active video",
        pass: offScreen.videoPaused.every((p) => p === true),
        gating: true,
        detail: JSON.stringify(offScreen.videoPaused),
      });

      await context.close();
    }

    // ---- Check 2: reduced motion — nothing plays until a real click ---------
    {
      const context = await browser.newContext({
        viewport: { width: 1710, height: 1040 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        document.querySelector('[role="tablist"]')?.scrollIntoView({ block: "center" });
      });
      await sleep(500);

      const beforeClick = await readTabsSnapshot(page);
      results.push({
        name: "reduced motion: tab 1's video does NOT autoplay before any click",
        pass: beforeClick.videoPaused[0] === true,
        gating: true,
        detail: JSON.stringify(beforeClick.videoPaused),
      });

      const tabs = await page.$$('[role="tab"]');
      await tabs[0].click(); // re-click the already-selected tab 1
      await sleep(300);
      const afterClick = await readTabsSnapshot(page);
      results.push({
        name: "reduced motion: clicking a tab DOES play its video",
        pass: afterClick.videoPaused[0] === false,
        gating: true,
        detail: JSON.stringify(afterClick.videoPaused),
      });

      await context.close();
    }

    // ---- Check 3: Commercial Showcase — click-to-play, no loop, real controls
    {
      const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const showcase = await page.evaluate(() => {
        const videos = Array.from(document.querySelectorAll("video"));
        // The showcase video is the one NOT inside a [role="tabpanel"].
        const v = videos.find((el) => !el.closest('[role="tabpanel"]'));
        if (!v) return null;
        const rect = v.closest("div")?.getBoundingClientRect();
        return {
          paused: v.paused,
          loop: v.loop,
          controls: v.controls,
          muted: v.muted,
          autoplay: v.autoplay,
          width: rect?.width,
          height: rect?.height,
        };
      });

      results.push({
        name: "commercial video found, paused on load, has controls, no loop, not muted",
        pass:
          !!showcase &&
          showcase.paused === true &&
          showcase.controls === true &&
          showcase.loop === false &&
          showcase.muted === false &&
          showcase.autoplay === false,
        gating: true,
        detail: JSON.stringify(showcase),
      });
      results.push({
        name: "commercial video well measures 1077x606",
        pass: !!showcase && Math.abs(showcase.width - 1077) < 2 && Math.abs(showcase.height - 606) < 2,
        gating: true,
        detail: JSON.stringify({ width: showcase?.width, height: showcase?.height }),
      });

      await context.close();
    }

    // ---- Check 4: 1440x760 — no horizontal overflow, tabs still render -----
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 760 } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });

      const tabCount = await page.evaluate(() => document.querySelectorAll('[role="tab"]').length);
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );

      results.push({
        name: "1440x760: all 4 tabs render",
        pass: tabCount === 4,
        gating: true,
        detail: `tabs=${tabCount}`,
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
