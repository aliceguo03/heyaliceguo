#!/usr/bin/env node
// Real-browser verification for the footer's rotating quote system
// (CLAUDE.md "Footer quote", src/content/quotes.ts,
// src/components/chassis/useFooterQuote.ts, Footer.tsx). Run on demand with
// `node scripts/verify-footer-quote.mjs` — not wired into `build` or `test`.
// Harness plumbing copied verbatim from verify-breakpoints.mjs /
// verify-project-section.mjs.
//
// What's checked:
//   1. DEFAULT_QUOTE renders deterministically on a hard load (3x), with no
//      console error/warning (a hydration mismatch surfaces as one).
//   2. Every quote in the pool, DEFAULT_QUOTE included, is stored ALL CAPS.
//   3. Tier gating: TIER_1 only below nav-depth 6, +TIER_2 below 16, all
//      three at 16+ — driven by real client-side navigation, not a mock.
//   4. The first navigation's pick never repeats DEFAULT_QUOTE (it's still
//      "the last quote shown" at that point, same no-immediate-repeat rule
//      as any other pick).
//   5. Reroll never surfaces a locked tier, never repeats immediately.
//
// Wrapping, the button-to-glyph gap, orphan control, and row-height
// neutrality across line counts are covered in
// scripts/verify-footer-quote-wrap.mjs, not here — this file's own earlier
// versions checked those by directly overwriting the quote paragraph's
// textContent, which stopped being representative once the quote started
// rendering as JS-computed <span> lines rather than one browser-wrapped
// string (CLAUDE.md "Footer quote — wrapping, alignment, and orphan
// control") — a forced plain-text overwrite no longer exercises the real
// fitting/positioning code at all. The checks that stayed here are the ones
// still exercised correctly by driving the real pick/reroll flow instead of
// injecting text directly.
//
// Quotes are read from src/content/quotes.ts as TEXT via regex, not a TS
// import — this project has no ts-node/tsx in devDependencies (same
// approach as check-gradient-contrast.mjs's own comment on why).

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const QUOTES_FILE = path.join(rootDir, "src/content/quotes.ts");

// --- Extraction (regex over the source text, not a TS import) --------------

function extractDefaultQuote(source) {
  const m = /export const DEFAULT_QUOTE: Quote = "((?:[^"\\]|\\.)*)"/.exec(source);
  if (!m) throw new Error("Could not find DEFAULT_QUOTE in quotes.ts");
  return m[1];
}

// Each tier's array holds either the bare DEFAULT_QUOTE identifier (only
// TIER_1's first entry, today) or a quoted string literal — matched in
// source order so DEFAULT_QUOTE's real value drops into the right slot.
function extractTier(source, tierName, defaultQuote) {
  const blockRe = new RegExp(`export const ${tierName}: readonly Quote\\[\\] = \\[([\\s\\S]*?)\\n\\];`);
  const block = blockRe.exec(source);
  if (!block) throw new Error(`Could not find ${tierName} in quotes.ts`);
  const entryRe = /DEFAULT_QUOTE|"((?:[^"\\]|\\.)*)"/g;
  const quotes = [];
  let m;
  while ((m = entryRe.exec(block[1]))) {
    quotes.push(m[1] !== undefined ? m[1] : defaultQuote);
  }
  return quotes;
}

function loadQuotes() {
  const source = readFileSync(QUOTES_FILE, "utf8");
  const DEFAULT_QUOTE = extractDefaultQuote(source);
  return {
    DEFAULT_QUOTE,
    TIER_1: extractTier(source, "TIER_1", DEFAULT_QUOTE),
    TIER_2: extractTier(source, "TIER_2", DEFAULT_QUOTE),
    TIER_3: extractTier(source, "TIER_3", DEFAULT_QUOTE),
  };
}

// Same decoration Footer.tsx applies at render: a leading curly-open quote,
// a trailing curly-close.
function decorate(text) {
  return `“${text}”`;
}

// --- Harness plumbing (shared shape with verify-breakpoints.mjs) -----------

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
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

// Clicks the Home/About link in whichever footer variant is actually
// visible at the current viewport (all three sit in the DOM at once,
// switched by CSS display — see Footer.tsx's own comment on that).
async function clickFooterLink(page, href) {
  await page.evaluate((targetHref) => {
    const footer = [...document.querySelectorAll("footer")].find((f) => getComputedStyle(f).display !== "none");
    footer.querySelector(`a[href="${targetHref}"]`).click();
  }, href);
}

// Reads row 1's structure off footers[0] specifically (DOM order, same
// convention verify-breakpoints.mjs uses), not "whichever footer is
// visible" — below the breakpoint that's the TABLET footer, which has no
// quote at all and a differently-shaped row 1; reading from it silently
// measures the wrong element instead of failing (a real bug caught while
// building this).
//
// The fitted render splits the quote across multiple <span class="block">
// lines with no textual space between them (adjacent lines join back
// together with zero space via a plain .textContent read) — join each
// line's own text with a single space instead, to reconstruct the original
// spacing correctly. Falls back to the paragraph's own textContent when
// there are no child spans (the brief pre-first-measurement render, a
// single plain string — see Footer.tsx's own comment on that fallback).
async function readDesktopQuoteText(page) {
  return page.evaluate(() => {
    const footers = document.querySelectorAll("footer");
    const row1 = footers[0].firstElementChild;
    const p = row1.children[1].querySelector("p");
    if (!p) return null;
    const lineEls = [...p.children];
    return lineEls.length > 0 ? lineEls.map((el) => el.textContent).join(" ") : p.textContent;
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
  const quotes = loadQuotes();
  const allQuotes = [...new Set([...quotes.TIER_1, ...quotes.TIER_2, ...quotes.TIER_3])];

  try {
    await waitForServer(base);
    const browser = await chromium.launch();

    // ==== Check 1: DEFAULT_QUOTE renders deterministically on a hard load,
    // no console error (a hydration mismatch logs one), across 3 loads. =====
    {
      const consoleIssues = [];
      const seen = new Set();
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        page.on("console", (msg) => {
          if (msg.type() === "error" || msg.text().toLowerCase().includes("hydrat")) {
            consoleIssues.push(msg.text());
          }
        });
        page.on("pageerror", (err) => consoleIssues.push(String(err)));
        await page.goto(base, { waitUntil: "networkidle" });
        const text = await readDesktopQuoteText(page);
        seen.add(text);
        await context.close();
      }
      results.push({
        name: "DEFAULT_QUOTE renders deterministically on every hard load",
        pass: seen.size === 1 && [...seen][0] === decorate(quotes.DEFAULT_QUOTE),
        gating: true,
        detail: `saw: ${[...seen].join(" | ")}`,
      });
      results.push({
        name: "no console error/hydration warning across 3 hard loads",
        pass: consoleIssues.length === 0,
        gating: true,
        detail: consoleIssues.join("; ") || "clean",
      });
    }

    // ==== Check 2: every quote is stored ALL CAPS. ===========================
    {
      const notUppercase = allQuotes.filter((q) => q !== q.toUpperCase());
      results.push({
        name: "every quote (16 + DEFAULT_QUOTE) is stored ALL CAPS",
        pass: notUppercase.length === 0,
        gating: true,
        detail: notUppercase.length ? notUppercase.join("; ") : `checked ${allQuotes.length} quotes`,
      });
    }

    // ==== Checks 3-5: tier gating, first-navigation exclusion, and reroll
    // behavior, driven by real client-side navigation and real clicks. ======
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await sleep(200);

      const tier1Set = new Set(quotes.TIER_1);
      const tier2Set = new Set(quotes.TIER_2);

      function classify(text) {
        if (tier1Set.has(text)) return 1;
        if (tier2Set.has(text)) return 2;
        return 3;
      }
      function undecorate(text) {
        return text?.replace(/^“/, "").replace(/”$/, "") ?? null;
      }

      let currentPath = "/";
      let sawTier2 = false;
      let sawTier3 = false;
      let gatingFailure = null;
      let firstNavRepeatedDefault = false;

      for (let navCount = 1; navCount <= 17; navCount++) {
        currentPath = currentPath === "/" ? "/about" : "/";
        await clickFooterLink(page, currentPath);
        await page.waitForFunction((p) => location.pathname === p, currentPath);
        await sleep(150);

        const text = undecorate(await readDesktopQuoteText(page));
        if (navCount === 1 && text === quotes.DEFAULT_QUOTE) firstNavRepeatedDefault = true;

        const tier = classify(text);
        if (tier === 2) sawTier2 = true;
        if (tier === 3) sawTier3 = true;

        const maxAllowed = navCount >= 16 ? 3 : navCount >= 6 ? 2 : 1;
        if (tier > maxAllowed && !gatingFailure) {
          gatingFailure = `nav ${navCount}: got tier ${tier} quote ("${text}"), max allowed is ${maxAllowed}`;
        }
      }

      results.push({
        name: "quote never exceeds its nav-depth tier across 17 navigations",
        pass: gatingFailure === null,
        gating: true,
        detail: gatingFailure ?? "held at every step",
      });
      results.push({
        name: "the first navigation's pick never repeats DEFAULT_QUOTE",
        pass: !firstNavRepeatedDefault,
        gating: true,
        detail: firstNavRepeatedDefault ? "DEFAULT_QUOTE was picked again immediately" : "excluded correctly",
      });
      results.push({
        name: "tier 2 became reachable by nav 6-16",
        pass: sawTier2,
        gating: false,
        detail: sawTier2 ? "observed" : "never observed in this run (probabilistic — rerun if this is the only failure)",
      });
      results.push({
        name: "tier 3 became reachable by nav 16+",
        pass: sawTier3,
        gating: false,
        detail: sawTier3 ? "observed" : "never observed in this run (probabilistic — rerun if this is the only failure)",
      });

      // ---- Reroll: never surfaces a locked tier, never repeats immediately.
      // Reload to reset the module-scope counter to 0, then navigate exactly
      // once (nav-depth 1, TIER_1 only) before rerolling.
      await page.goto(base, { waitUntil: "networkidle" });
      await clickFooterLink(page, "/about");
      await page.waitForFunction(() => location.pathname === "/about");
      await sleep(150);

      let rerollLockedTierHit = null;
      let immediateRepeat = null;
      let previous = undecorate(await readDesktopQuoteText(page));

      for (let i = 0; i < 50; i++) {
        await page.evaluate(() => {
          const footers = document.querySelectorAll("footer");
          footers[0].firstElementChild.children[1].querySelector("button").click();
        });
        await sleep(80);
        const current = undecorate(await readDesktopQuoteText(page));
        const tier = classify(current);
        if (tier > 1 && !rerollLockedTierHit) {
          rerollLockedTierHit = `reroll ${i}: got tier ${tier} quote at nav-depth 1 ("${current}")`;
        }
        if (current === previous && quotes.TIER_1.length > 1 && !immediateRepeat) {
          immediateRepeat = `reroll ${i}: repeated the immediately-previous quote`;
        }
        previous = current;
      }

      results.push({
        name: "reroll never surfaces a locked tier",
        pass: rerollLockedTierHit === null,
        gating: true,
        detail: rerollLockedTierHit ?? "held over 50 rerolls at nav-depth 1",
      });
      results.push({
        name: "reroll never repeats the immediately-previous quote",
        pass: immediateRepeat === null,
        gating: true,
        detail: immediateRepeat ?? "held over 50 rerolls",
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
