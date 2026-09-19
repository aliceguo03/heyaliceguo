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
// 1049:9788 phone), page "final". Tablet/desktop: Figma's flat 850px — no
// viewport-fill, unlike the homepage hero: About has no instruction in the
// file to fill the viewport there, and the vertical rhythm (212px below
// the nav, 30px to the next section) is Figma's own, not derived from
// window height. This still holds at tablet/desktop; see the phone-tier
// note below for where it now doesn't.
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
// SSR-assumes-desktop, not a dual-render CSS toggle).
//
// `about.` itself needs no change: PageTitle already renders through
// `text-display`, which steps 104->60 below 744 via globals.css's existing
// mobile type ramp — a different, already-established boundary from this
// file's own 980, and already correct with zero changes.
//
// Top-spacing follow-up (mobile hero photo stack session): the flat
// 212px top gap (pt-4xl) was Figma's own tablet/desktop measurement,
// carried unchanged into the phone-tier branch this session added — but
// Figma has no phone-tier scroll/viewport-fill instruction to measure
// that gap FROM (the file is a flat mock at one height), and 212px static
// padding pushed the hero tall enough that the ticker sat below the fold
// on real phone heights, never visible without scrolling. The homepage's
// own mobile hero has the identical shape of problem and solves it by
// NOT using a fixed top gap at all: Hero.tsx's section is `my-auto`
// inside a `viewport-fill` (`min-height: calc(100svh - nav-height)`)
// wrapper, so the gap above the wordmark grows or shrinks with whatever
// vertical room the viewport actually has, confirmed to render 50px at
// 375x667 and 107px at 430x932 — not one fixed number at any width.
//
// About's phone tier now adopts Hero.tsx's own mechanism verbatim:
// viewport-fill (min-height: calc(100svh - nav-height)) + `my-auto` on
// the title+stack block. Two things were tried and measured before this
// one: plain `mt-auto` alone (all free space goes to the top gap only,
// which at 430x932 gave a 377px nav-to-title gap — nearly 4x the
// homepage's own 107px at the identical viewport, since About's
// title+stack block is much shorter than the homepage's wordmark+bio+
// button, so there's more leftover space and none of it was going toward
// the photo-to-ticker gap the way the homepage's own centering does); and
// a `flex-1`+`justify-center` wrapper sized to leave the ticker's own gap
// fixed at gap-3xl — mathematically NOT equivalent to a real 50/50 split
// (confirmed: it reproduces the exact same numbers as plain my-auto once
// you account for where the "other half" of the space actually goes), so
// it wasn't actually preserving anything plain my-auto didn't already
// give for the SAME reason. Genuine my-auto centering and a flat
// photo-to-ticker gap are mutually exclusive — splitting free space
// evenly necessarily means BOTH margins grow with it, not just the top
// one. Alice's own call, informed by that finding: let both breathe
// together, matching Hero.tsx exactly rather than special-casing the
// ticker's own gap to stay fixed. So the photo-to-ticker gap is NOT
// pixel-unchanged from before this fix at every height — it grows in
// lockstep with the top gap now, same as it always implicitly did on the
// homepage (whose own "bottom gap" was never fixed either; it just has a
// bio+button block sitting between photo and ticker, so nobody was
// watching it the way About's gap-3xl was being watched here). Title-to-
// photo (gap-xl, INSIDE the my-auto block, unaffected by the block's own
// external margins) stays exactly 50px, unchanged. Tablet/desktop are
// completely unaffected — this branch only ever renders at phone tier,
// where the OLD flat-padding structure below already didn't apply.
export function AboutHero() {
  const geo = useAboutGeometry();
  const stacked = geo.tier === "phone";

  if (stacked) {
    return (
      <div className="viewport-fill flex w-full flex-col items-center gap-3xl pb-lg">
        <div className="my-auto flex flex-col items-center gap-xl">
          <PageTitle>about.</PageTitle>
          <AboutPhotoStack />
        </div>

        <Ticker items={tools} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3xl pt-4xl pb-lg">
      <div className="flex flex-col items-center gap-xl" style={{ width: HERO_W }}>
        <PageTitle>about.</PageTitle>

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
      </div>

      <Ticker items={tools} />
    </div>
  );
}
