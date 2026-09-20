"use client";

import Image from "next/image";
import { PageTitle } from "@/components/ui/PageTitle";
import { Ticker } from "@/components/chassis/Ticker";
import { AboutPhotoStack } from "./AboutPhotoStack";
import { ABOUT_HERO_PHOTOS } from "@/content/about";
import { tools } from "@/content/tools";
import { HERO_PHOTO, HERO_W } from "./aboutGeometry";
import { useAboutGeometry } from "./useAboutGeometry";

// About's hero (Figma "hero section", 523:6849 desktop/tablet, "hero home"
// 1049:9788 phone), page "final". Figma's own vertical rhythm is a flat
// 212px below the nav (desktop/tablet) or 100px (phone), in a fixed-height
// composition with no scroll/viewport-fill instruction — but that number
// only ever coincides with what's actually on screen at one specific
// viewport height. The homepage's hero doesn't use a flat number either:
// Hero.tsx centers its content with `my-auto` inside `.viewport-fill`
// (`min-height: calc(100svh - nav-height)`), so its own nav-to-title gap
// is a centering *residual* that tracks viewport height (measured: 50px at
// 375x812, 107px at 430x932, 141.9px at 1440x900, 245.4px at 1710x1107 —
// never Figma's flat 212/100 except by coincidence).
//
// Nav-to-title parity session: real screenshots showed About's title
// landing anywhere from ~10px to ~163px away from Home's at the same
// viewport, because the two pages computed the offset by different
// mechanisms — Home's height-dependent residual vs. About's own flat
// pt-4xl (tablet/desktop) or its own my-auto centering against its own,
// much shorter content block (phone). Centering both pages independently
// can't fix this: `my-auto` splits *whatever's left over* after each
// page's own content height, and About's title+photos block (310px at
// phone) is far shorter than Home's wordmark+bio+button block (673px), so
// the two pages would always land at different offsets even using the
// identical mechanism.
//
// Alice's call: Home is the fixed reference and does not change. About's
// title instead reads Home's own residual directly — `--home-title-offset`
// (globals.css), Hero.tsx's centering math reproduced in pure CSS from
// Home's own content/ticker heights — so About's title lands exactly where
// Home's does at every viewport height, regardless of what About's own
// content below the title measures. That offset is applied as a literal
// `padding-top` here, not a margin inside a centered flex box: everything
// below the title then lays out at fixed gaps (gap-xl to the photos,
// space-3xl to the ticker) rather than being re-centered as one block the
// way Home's is. The tradeoff is blank space between the ticker and the
// hero's own bottom edge at tall viewports, since nothing pins the ticker
// to the bottom the way Home's ticker is (see --hero-peek below for why
// that's fine here).
//
// This also means Home's `--home-hero-content-h`/`--home-hero-ticker-h`
// tokens (globals.css) must stay in step with Hero.tsx's actual geometry —
// verify-about-section.mjs's Home-constants guard exists so a drift there
// fails loudly instead of silently pulling About's title off Home's.
//
// The hero uses `.viewport-fill-peek` (globals.css) — `.viewport-fill`
// shortened by `--hero-peek` — at every tier, not just phone: this is what
// lets the section after the hero (About's own frame) crop at the bottom
// edge by exactly `--hero-peek`, matching the scroll affordance Home
// already has by happening to fill the viewport exactly. Home's own
// `.viewport-fill` and ticker are untouched — the peek is About-only.
//
// No side padding on this wrapper — same pattern as Hero.tsx. The 868px
// title+photos column is centered independently via a fixed width at
// tablet/desktop; Ticker (reused unchanged, just a different `items` list)
// supplies its own 50px inset via its own internal px-xl.
//
// Mobile hero photo stack session: the three-photo row switches to the
// fanned AboutPhotoStack below --breakpoint-about (980) — the SAME
// boundary the section rows below switch at (Alice: the hero holds its
// row layout down to that boundary rather than its own, narrower
// content-only floor — see aboutGeometry.ts's HERO_W comment), read off
// useAboutGeometry() (the same geometry already governing everything else
// on this page) rather than a second, independent breakpoint check.
// `about:` isn't usable here as a pure CSS variant the way it is
// elsewhere on this page: the row and the stack are structurally
// different components (the stack owns its own drag/advance state), not
// a class swap on the same markup — same reasoning Hero.tsx's own
// PhotoStack/mobile split already uses (a JS boolean threaded down,
// SSR-assumes-desktop, not a dual-render CSS toggle). That 980px boundary
// governs row-vs-stack only now — the vertical spacing above and below it
// is CSS-only and identical on both sides of it.
//
// `about.` itself needs no change: PageTitle already renders through
// `text-display`, which steps 104->60 below 744 via globals.css's existing
// mobile type ramp — a different, already-established boundary from this
// file's own 980, and already correct with zero changes.
export function AboutHero() {
  const geo = useAboutGeometry();
  const stacked = geo.tier === "phone";

  return (
    <div
      className="viewport-fill-peek flex w-full flex-col items-center"
      style={{ paddingTop: "var(--home-title-offset)" }}
    >
      <div
        className="flex flex-col items-center gap-xl"
        style={stacked ? undefined : { width: HERO_W }}
      >
        <PageTitle>about.</PageTitle>

        {stacked ? (
          <AboutPhotoStack />
        ) : (
          <div className="flex items-center justify-center gap-xl">
            {ABOUT_HERO_PHOTOS.map((photo, index) => (
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                width={HERO_PHOTO}
                height={HERO_PHOTO}
                priority={index === 0}
                loading={index === 0 ? undefined : "eager"}
                className="rounded-card object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-full pt-3xl">
        <Ticker items={tools} />
      </div>
    </div>
  );
}
