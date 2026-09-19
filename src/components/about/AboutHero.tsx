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
// 1049:9788 phone), page "final". Figma's flat 850px — no viewport-fill
// here, unlike the homepage hero: About has no instruction in the file to
// fill the viewport, and the vertical rhythm (212px below the nav, 30px to
// the next section) is Figma's own, not derived from window height.
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
// The 868px fixed width on the title+photos column only applies at
// tablet/desktop — at phone tier it's `undefined` (auto), letting the
// title and the (much narrower, 240px) stack each center independently
// via the outer wrapper's own `items-center`, the same "auto below its
// breakpoint" pattern Hero.tsx's own --hero-content-w ramp uses.
//
// `about.` itself needs no change here: PageTitle already renders through
// `text-display`, which steps 104->60 below 744 via globals.css's existing
// mobile type ramp — a different, already-established boundary from this
// file's own 980, and already correct with zero changes.
export function AboutHero() {
  const geo = useAboutGeometry();
  const stacked = geo.tier === "phone";

  return (
    <div className="flex w-full flex-col items-center gap-3xl pt-4xl pb-lg">
      <div className="flex flex-col items-center gap-xl" style={{ width: stacked ? undefined : HERO_W }}>
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

      <Ticker items={tools} />
    </div>
  );
}
