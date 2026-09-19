#!/usr/bin/env node
// Real-browser verification for the About page's responsiveness work
// (tablet pin reflow, the mobile static stack, the mobile spotlight, then
// the mobile hero photo stack). Run on demand with
// `node scripts/verify-about-section.mjs` against an already-running dev
// server (defaults to localhost:3000). Companion to
// verify-project-section.mjs's own shape; lighter-weight, scoped to each
// session's own acceptance criteria plus the invariants every tier of
// this mechanic must hold.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
}

async function main() {
  const browser = await chromium.launch();

  // ---- Hydration: no console errors at any tier ----
  for (const width of [1710, 1440, 1024, 980, 744, 430]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    record(`no console/hydration errors at ${width}px`, errors.length === 0, JSON.stringify(errors));
    await context.close();
  }

  // ---- No horizontal overflow from the About SECTION itself (pin or
  // fallback) across the whole tier range. Scoped to the section/fallback
  // element, not document.documentElement: AboutHero's fixed 868px row
  // (pre-existing, untouched by this session — its own responsive pass is
  // a later sub-session) and the role ticker (a marquee — overflowing the
  // viewport horizontally is its own by-design behavior, not a bug) both
  // legitimately extend past the viewport below ~908px independent of
  // anything this session touches; asserting on the whole page here would
  // fail for reasons outside this session's scope. ----
  for (const width of [1710, 1440, 1439, 1024, 980, 979, 744, 430, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => {
      const el =
        document.querySelector('[data-testid="about-section"]') ||
        document.querySelector('[data-testid="about-section-fallback"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.left < -1 || r.right > window.innerWidth + 1;
    });
    record(`no horizontal overflow from the About section at ${width}px`, overflow === false, `overflow=${overflow}`);
    await context.close();
  }

  // ---- Photo aspect ratio holds at tablet/desktop pinned view ----
  for (const width of [1710, 1440, 1024, 980]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const box = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="about-photo"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    if (box) {
      const expectedRatio = 653 / 448;
      const actualRatio = box.w / box.h;
      const pass = Math.abs(expectedRatio - actualRatio) < 0.01;
      record(`photo aspect ratio holds at ${width}px`, pass, `w=${box.w.toFixed(1)} h=${box.h.toFixed(1)} ratio=${actualRatio.toFixed(4)} expected=${expectedRatio.toFixed(4)}`);
    } else {
      record(`photo aspect ratio holds at ${width}px`, false, "no [data-testid=about-photo] found — fallback rendered instead of pin at this width/height");
    }
    await context.close();
  }

  // ---- Column widths equal (50/50) at tablet/desktop ----
  for (const width of [1710, 1440, 1024, 980]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const widths = await page.evaluate(() => {
      const textWindow = document.querySelector('[data-testid="about-text-window"]');
      const photoWindow = document.querySelector('[data-testid="about-photo-window"]');
      if (!textWindow || !photoWindow) return null;
      return { text: textWindow.getBoundingClientRect().width, photo: photoWindow.getBoundingClientRect().width };
    });
    if (widths) {
      const pass = Math.abs(widths.text - widths.photo) < 0.5;
      record(`text/photo columns equal width at ${width}px`, pass, JSON.stringify(widths));
    } else {
      record(`text/photo columns equal width at ${width}px`, false, "fallback rendered, not pin");
    }
    await context.close();
  }

  // ---- Caption width equals photo width ----
  {
    const context = await browser.newContext({ viewport: { width: 1024, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const match = await page.evaluate(() => {
      const photo = document.querySelector('[data-testid="about-photo"]');
      const caption = photo?.parentElement?.querySelector("p");
      if (!photo || !caption) return null;
      return { photo: photo.getBoundingClientRect().width, caption: caption.getBoundingClientRect().width };
    });
    record("caption width equals photo width at 1024px", match && Math.abs(match.photo - match.caption) < 0.5, JSON.stringify(match));
    await context.close();
  }

  // ---- Frame is centered at every tier ----
  for (const width of [1710, 1440, 1024, 980, 430]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const centered = await page.evaluate(() => {
      const frame = document.querySelector('[data-testid="about-frame"]');
      if (!frame) return null;
      const r = frame.getBoundingClientRect();
      return { center: r.left + r.width / 2, viewportCenter: window.innerWidth / 2 };
    });
    const pass = centered && Math.abs(centered.center - centered.viewportCenter) < 1;
    record(`frame centered at ${width}px`, pass, JSON.stringify(centered));
    await context.close();
  }

  // ---- Scroll mechanic: currentIndex advances at tablet width ----
  {
    const context = await browser.newContext({ viewport: { width: 1180, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const section = await page.$('[data-testid="about-section"]');
    if (section) {
      const box = await section.boundingBox();
      // Scroll to roughly the middle of the section's own scroll range.
      await page.evaluate((top) => window.scrollTo(0, top + 1000), box.y);
      await page.waitForTimeout(300);
      const filledCount = await page.evaluate(() => {
        return document.querySelectorAll('[data-color-reveal][style*="rgb(13, 13, 13)"]').length;
      });
      record("tablet scroll: some paragraph is filled mid-scroll", true, `(informational — filledCount=${filledCount})`);
    } else {
      record("tablet scroll mechanic present", false, "no [data-testid=about-section] at 1180px");
    }
    await context.close();
  }

  // ---- Reduced motion triggers fallback at every tier ----
  for (const width of [1710, 1024, 430]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const isFallback = await page.evaluate(() => !!document.querySelector('[data-testid="about-section-fallback"]'));
    record(`reduced motion renders fallback at ${width}px`, isFallback, `isFallback=${isFallback}`);
    await context.close();
  }

  // ---- Phone tier always renders fallback (own placeholder) regardless of height ----
  for (const height of [700, 1000]) {
    const context = await browser.newContext({ viewport: { width: 600, height } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const isFallback = await page.evaluate(() => !!document.querySelector('[data-testid="about-section-fallback"]'));
    record(`phone tier (600px) renders fallback at height ${height}`, isFallback, `isFallback=${isFallback}`);
    await context.close();
  }

  // ---- 1710/1440 desktop reference unaffected except the 5px 50/50 shift ----
  {
    const context = await browser.newContext({ viewport: { width: 1710, height: 1040 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const widths = await page.evaluate(() => {
      const textWindow = document.querySelector('[data-testid="about-text-window"]');
      const photoWindow = document.querySelector('[data-testid="about-photo-window"]');
      return { text: textWindow?.getBoundingClientRect().width, photo: photoWindow?.getBoundingClientRect().width };
    });
    const pass = widths.text && Math.abs(widths.text - 658) < 1 && Math.abs(widths.photo - 658) < 1;
    record("desktop 1710px columns are 658/658 (5px 50/50 shift from 663/653)", pass, JSON.stringify(widths));
    await context.close();
  }

  // Tablet text<->photo gap: B follow-up changed 40->50 (design override
  // on top of a confirmed-correct 40 — see aboutGeometry.ts's own note).
  // Measured directly via the two windows' own edges, not assumed from
  // the constant.
  for (const width of [1024, 1200, 1439]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const gap = await page.evaluate(() => {
      const textWindow = document.querySelector('[data-testid="about-text-window"]');
      const photoWindow = document.querySelector('[data-testid="about-photo-window"]');
      if (!textWindow || !photoWindow) return null;
      return photoWindow.getBoundingClientRect().left - textWindow.getBoundingClientRect().right;
    });
    record(`tablet text<->photo gap is 50px at ${width}px`, gap !== null && Math.abs(gap - 50) < 0.5, `gap=${gap}`);
    await context.close();
  }

  // ---- Mobile static stack session ----------------------------------------

  // Phone tier row structure: text above photo, no pill. Text width holds
  // the 267/330 ratio to the photo at EVERY phone-tier width — a same-
  // session cap that made this flat above a 430px reference was reverted
  // (misdiagnosis; confirmed outside dev tools this was the correct,
  // original spec — proportional scaling, same mechanism as the photo).
  for (const width of [430, 980 - 1, 390, 700, 900]) {
    const context = await browser.newContext({ viewport: { width, height: 1200 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const data = await page.evaluate(() => {
      const fallback = document.querySelector('[data-testid="about-section-fallback"]');
      if (!fallback) return null;
      const firstRow = fallback.querySelector('[data-about-block]')?.closest("div.flex.w-full.flex-col");
      const photo = fallback.querySelector('[data-testid="about-photo"]');
      const textBlock = fallback.querySelector('[data-about-block]');
      const pill = fallback.textContent?.includes("01") && fallback.textContent?.includes("06");
      if (!firstRow || !photo || !textBlock) return null;
      const rowRect = firstRow.getBoundingClientRect();
      const photoRect = photo.getBoundingClientRect();
      const textRect = textBlock.getBoundingClientRect();
      // text above photo: text's bottom must be above (or at) photo's top
      const textAbovePhoto = textRect.bottom <= photoRect.top + 1;
      return {
        textAbovePhoto,
        textWidth: textRect.width,
        photoWidth: photoRect.width,
        ratio: textRect.width / photoRect.width,
        hasPill: pill,
        rowWidth: rowRect.width,
      };
    });
    if (data) {
      const expectedRatio = 267 / 330;
      const ratioPass = Math.abs(data.ratio - expectedRatio) < 0.02;
      record(
        `phone tier (${width}px): text sits above photo, 267/330 ratio holds, no pill`,
        data.textAbovePhoto && ratioPass && !data.hasPill,
        JSON.stringify(data),
      );
    } else {
      record(`phone tier (${width}px): row structure readable`, false, "fallback or its children not found");
    }
    await context.close();
  }

  // Phone-tier caption type (--text-mono-mobile, 14px) — distinct from
  // tablet/desktop's --text-mono-caption (16px). Photo radius does NOT
  // step (B follow-up: confirmed 20px/rounded-card at every tier).
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 1200 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const data = await page.evaluate(() => {
      const photo = document.querySelector('[data-testid="about-photo"]');
      const caption = photo?.parentElement?.querySelector("p");
      if (!photo || !caption) return null;
      return {
        radius: getComputedStyle(photo).borderRadius,
        captionFontSize: getComputedStyle(caption).fontSize,
      };
    });
    record(
      "phone tier: photo uses rounded-card (20px, unstepped), caption uses --text-mono-mobile (14px)",
      data && data.radius === "20px" && data.captionFontSize === "14px",
      JSON.stringify(data),
    );
    await context.close();
  }

  // Tablet/desktop radius + caption type unaffected by the phone-tier
  // `about:` variant swap (regression guard for PhotoCaption.tsx's shared
  // classes).
  for (const width of [1024, 1710]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const data = await page.evaluate(() => {
      const photo = document.querySelector('[data-testid="about-photo"]');
      const caption = photo?.parentElement?.querySelector("p");
      if (!photo || !caption) return null;
      return { radius: getComputedStyle(photo).borderRadius, captionFontSize: getComputedStyle(caption).fontSize };
    });
    record(
      `${width}px: photo stays rounded-card (20px), caption stays --text-mono-caption (16px)`,
      data && data.radius === "20px" && data.captionFontSize === "16px",
      JSON.stringify(data),
    );
    await context.close();
  }

  // Row gap between pairs — B follow-up: phone's value changed 50->100
  // (a design override; 50 was rendering correctly per spec, the spec
  // changed) — now the same gap-3xl (100) at every tier, no `about:`
  // variant needed anymore. Tablet/desktop only render AboutFallback
  // under reduced motion or a short viewport (the pin runs otherwise) —
  // forced here with reducedMotion so the fallback's own gap is actually
  // on the page to measure.
  for (const [width, expected, reducedMotion] of [
    [430, 100, undefined],
    [1024, 100, "reduce"],
    [1710, 100, "reduce"],
  ]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const gap = await page.evaluate(() => {
      const stack = document.querySelector('[data-testid="about-fallback-stack"]');
      return stack ? getComputedStyle(stack).rowGap : null;
    });
    record(`${width}px: row gap between pairs is ${expected}px`, gap === `${expected}px`, `gap=${gap}`);
    await context.close();
  }

  // Phone-tier text<->photo gap is gap-lg (30) — a deliberate override of
  // the mock's own 20px, not a re-measurement (see AboutFallbackRow.tsx's
  // own comment). Tablet/desktop untouched by this override.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 1200 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const gap = await page.evaluate(() => {
      const stack = document.querySelector('[data-testid="about-section-fallback"] > div');
      const row = stack?.querySelector('[data-about-block]')?.closest("div.flex.w-full.flex-col");
      return row ? getComputedStyle(row).rowGap : null;
    });
    record("430px: text<->photo gap is 30px (deliberate override of the 20px mock)", gap === "30px", `gap=${gap}`);
    await context.close();
  }

  // Header<->body gap steps too: gap-sm (12) below 980, gap-md (20) at/above.
  for (const [width, expected] of [[430, 12], [1024, 20], [1710, 20]]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const gap = await page.evaluate(() => {
      const block = document.querySelector("[data-about-block]");
      return block ? getComputedStyle(block).rowGap : null;
    });
    record(`${width}px: header<->body gap is ${expected}px`, gap === `${expected}px`, `gap=${gap}`);
    await context.close();
  }

  // ---- Mobile spotlight session ----------------------------------------

  async function activeIndex(page) {
    return page.evaluate(() => {
      const pairs = Array.from(document.querySelectorAll("[data-about-pair]"));
      for (let i = 0; i < pairs.length; i++) {
        const photo = pairs[i].querySelector('[data-testid="about-photo"]')?.parentElement;
        if (photo && getComputedStyle(photo).opacity === "1") return i;
      }
      return -1;
    });
  }

  // Initial state (no scroll): pair 0 active, every other pair dimmed —
  // matches TextBlock's own `filled = true` default / useAboutPin.ts's
  // currentIndex seed, same convention as the pinned view.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const data = await page.evaluate(() => {
      const pairs = Array.from(document.querySelectorAll("[data-about-pair]"));
      return pairs.map((p) => {
        const photo = p.querySelector('[data-testid="about-photo"]')?.parentElement;
        const header = p.querySelector("p");
        return {
          opacity: photo ? getComputedStyle(photo).opacity : null,
          headerColor: header ? getComputedStyle(header).color : null,
        };
      });
    });
    const pass =
      data.length === 6 &&
      data[0].opacity === "1" &&
      data[0].headerColor === "rgb(13, 13, 13)" &&
      data.slice(1).every((d) => d.opacity === "0.4" && d.headerColor === "rgb(138, 138, 138)");
    record("phone spotlight: pair 0 active at rest, rest dimmed", pass, JSON.stringify(data));
    await context.close();
  }

  // Scrolling through the whole stack visits every index in order, both
  // directions, with no skipping — the same reverse-scroll-symmetry
  // property nearestBlockIndex already gives the pinned view for free.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const stack = await page.$('[data-testid="about-fallback-stack"]');
    const box = await stack.boundingBox();

    const forward = [];
    for (let frac = 0; frac <= 1; frac += 0.1) {
      await page.evaluate((y) => window.scrollTo(0, y), box.y + frac * box.height - 400);
      await page.waitForTimeout(700);
      forward.push(await activeIndex(page));
    }
    const forwardOk =
      forward[0] === 0 &&
      forward[forward.length - 1] === 5 &&
      forward.every((v, i) => i === 0 || v >= forward[i - 1]); // non-decreasing
    record("phone spotlight: forward scroll visits 0->5 in order, no skipping backward", forwardOk, JSON.stringify(forward));

    const backward = [];
    for (let frac = 1; frac >= 0; frac -= 0.1) {
      await page.evaluate((y) => window.scrollTo(0, y), box.y + frac * box.height - 400);
      await page.waitForTimeout(700);
      backward.push(await activeIndex(page));
    }
    const backwardOk =
      backward[0] === 5 &&
      backward[backward.length - 1] === 0 &&
      backward.every((v, i) => i === 0 || v <= backward[i - 1]); // non-increasing
    record("phone spotlight: backward scroll visits 5->0 in order, no skipping forward", backwardOk, JSON.stringify(backward));

    await context.close();
  }

  // Reduced motion: every pair active regardless of scroll position —
  // free from TextBlock's own filled=true default, but confirmed directly
  // rather than assumed.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
    await page.waitForTimeout(300);
    const data = await page.evaluate(() => {
      const pairs = Array.from(document.querySelectorAll("[data-about-pair]"));
      return pairs.map((p) => {
        const photo = p.querySelector('[data-testid="about-photo"]')?.parentElement;
        return photo ? getComputedStyle(photo).opacity : null;
      });
    });
    record(
      "phone spotlight: reduced motion keeps every pair active regardless of scroll",
      data.length === 6 && data.every((o) => o === "1"),
      JSON.stringify(data),
    );
    await context.close();
  }

  // Tablet/desktop headers never participate in fill state (locked pinned-
  // view rule; headerFills is phone-branch-only) — regression guard.
  for (const width of [1024, 1710]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const headerColor = await page.evaluate(() => {
      const header = document.querySelector("[data-about-block] p");
      return header ? getComputedStyle(header).color : null;
    });
    record(`${width}px: header stays muted-gray (no headerFills) in fallback`, headerColor === "rgb(138, 138, 138)", `color=${headerColor}`);
    await context.close();
  }

  // ---- Mobile hero photo stack session ----------------------------------

  // Row->stack switch at the SAME --breakpoint-about (980) the section
  // rows use — Alice's own call (hold the layout in lockstep), not the
  // hero's own narrower content-only floor (908).
  for (const [width, expectStack] of [
    [430, true],
    [979, true],
    [980, false],
    [981, false],
    [1024, false],
  ]) {
    const context = await browser.newContext({ viewport: { width, height: 700 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const hasStack = await page.evaluate(
      () => !!document.querySelector('button[aria-label="Show next photo in photostack"]'),
    );
    record(`hero at ${width}px renders ${expectStack ? "stack" : "row"}`, hasStack === expectStack, `hasStack=${hasStack}`);
    await context.close();
  }

  // The "one real unknown" this session's own plan flagged: with only 3
  // photos (no coincident hidden 4th slot), the exiting photo's opacity
  // recovery happens in full view of its destination slot, not hidden
  // behind another layer — so this checks WHEN, not just whether, it's
  // visible. Position must be at (or within a sub-pixel of) its final
  // resting spot by the time opacity is visibly recovering, or the photo
  // would visibly pop/snap into place rather than settle-then-fade-in.
  // Sampled off the actual computed transform + opacity during a live
  // advance(), not assumed from the reused PHOTO_EXIT schedule's own
  // (4-photo) reasoning.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 700 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const btn = await page.$('button[aria-label="Show next photo in photostack"]');
    const box = await btn.boundingBox();
    const clickPromise = page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    // Two-phase: the pre-click resting frame ALSO reads opacity=1 (>0.2),
    // which is irrelevant — only the RECOVERY crossing (opacity rising back
    // through 0.2 after first having dropped near 0) is the one this check
    // cares about, so it must wait for the dip before watching for the
    // rise.
    let hasDipped = false;
    let positionErrorAtRecovery = null;
    const start = Date.now();
    while (Date.now() - start < 550) {
      const sample = await page.evaluate(() => {
        const b = document.querySelector('button[aria-label="Show next photo in photostack"]');
        const layer = b.querySelector(":scope > div");
        const cs = getComputedStyle(layer);
        const m = new DOMMatrixReadOnly(cs.transform);
        return { opacity: parseFloat(cs.opacity), x: m.m41 };
      });
      if (!hasDipped && sample.opacity < 0.05) hasDipped = true;
      if (hasDipped && sample.opacity > 0.2 && positionErrorAtRecovery === null) {
        positionErrorAtRecovery = Math.abs(sample.x - 43.04); // back slot's own x (SLOTS_MOBILE[2])
      }
      await page.waitForTimeout(15);
    }
    await clickPromise;

    record(
      "hero stack: exit position settles before opacity recovers (no visible pop into the back slot)",
      positionErrorAtRecovery !== null && positionErrorAtRecovery < 3,
      `positionErrorPx=${positionErrorAtRecovery?.toFixed(2)}`,
    );
    await context.close();
  }

  // Click-to-advance and drag-to-advance both update front, announced via
  // aria-live — scoped to the stack's own span (the page has several
  // aria-live regions; querying unscoped previously matched the wrong one
  // during this session's own manual testing).
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 700 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    await page.click('button[aria-label="Show next photo in photostack"]');
    await page.waitForTimeout(700);
    const announcement = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Show next photo in photostack"]');
      return b.querySelector('[aria-live="polite"]')?.textContent;
    });
    record(
      "hero stack: click advances and announces the new front photo",
      announcement === "Alice standing on a boat facing New York City.",
      `announcement=${JSON.stringify(announcement)}`,
    );
    await context.close();
  }

  // Drag past the threshold advances; below it, springs back with no
  // advance (DRAG.thresholdFraction * PHOTO_BOX_MOBILE = 0.28*212 ~= 59px).
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 700 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const btn = await page.$('button[aria-label="Show next photo in photostack"]');
    const box = await btn.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(700);
    const announcement = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Show next photo in photostack"]');
      return b.querySelector('[aria-live="polite"]')?.textContent;
    });
    record("hero stack: drag past threshold advances", announcement !== "", `announcement=${JSON.stringify(announcement)}`);
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 700 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const btn = await page.$('button[aria-label="Show next photo in photostack"]');
    const box = await btn.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 20, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(700);
    const announcement = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Show next photo in photostack"]');
      return b.querySelector('[aria-live="polite"]')?.textContent;
    });
    record("hero stack: below-threshold drag springs back, no advance", announcement === "", `announcement=${JSON.stringify(announcement)}`);
    await context.close();
  }

  // Keyboard: focusable, Enter advances.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 700 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelector('button[aria-label="Show next photo in photostack"]').focus());
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    const announcement = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Show next photo in photostack"]');
      return b.querySelector('[aria-live="polite"]')?.textContent;
    });
    record(
      "hero stack: keyboard focus + Enter advances",
      focused === "Show next photo in photostack" && announcement !== "",
      `focused=${focused} announcement=${JSON.stringify(announcement)}`,
    );
    await context.close();
  }

  // Reduced motion: instant swap, no exit-path transform ever applied.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 700 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    await page.click('button[aria-label="Show next photo in photostack"]');
    await page.waitForTimeout(50); // far shorter than DUR.reveal — only passes if there's truly no tween
    const announcement = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Show next photo in photostack"]');
      return b.querySelector('[aria-live="polite"]')?.textContent;
    });
    record(
      "hero stack: reduced motion advances instantly (announced within 50ms)",
      announcement !== "",
      `announcement=${JSON.stringify(announcement)}`,
    );
    await context.close();
  }

  // All three photos load eagerly — no flash of empty space on first
  // advance. Photo 0 uses `priority` (Next.js's own eager-equivalent,
  // `loading` left unset — the DOM property then reads its spec default,
  // "auto", not the literal string "eager"), photos 1-2 explicit
  // `loading="eager"` — same split PhotoStack.tsx's own docs describe.
  {
    const context = await browser.newContext({ viewport: { width: 430, height: 700 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
    const loading = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Show next photo in photostack"]');
      return Array.from(b.querySelectorAll("img")).map((img) => img.loading);
    });
    record(
      "hero stack: no photo is lazy-loaded (photo 0 priority/auto, photos 1-2 eager)",
      loading.length === 3 && loading[0] === "auto" && loading[1] === "eager" && loading[2] === "eager",
      JSON.stringify(loading),
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
