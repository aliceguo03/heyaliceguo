"use client";

import { BioList } from "./BioList";
import { PhotoStack } from "./PhotoStack";
import { Button } from "@/components/ui/Button";
import { Ticker } from "@/components/chassis/Ticker";
import { useScrollAction } from "@/components/chassis/SmoothScroll";
import { LoadReveal } from "@/components/motion/LoadReveal";
import { Wordmark } from "@/components/motion/Wordmark";
import { useLoadSequence } from "@/components/motion/useLoadSequence";
import { BREAKPOINT_TABLET, LOAD, useViewportBelow } from "@/lib/motion";
import { roles } from "@/content/roles";

// Figma hero frame (441:5965), page "final", >=--breakpoint-tablet only.
// Fixed pixel geometry below is specific to this frame at the 1710px
// reference width, not a design token, so it's kept here as documented
// consts rather than in @theme. Below --breakpoint-tablet the row becomes a
// column and these two don't apply at all — see the mobile branch below and
// globals.css's "Hero geometry ramp" (--hero-content-w/-roles-w) for the
// values that replace HERO_WIDTH/ROLES_COLUMN_WIDTH there. PHOTO_CELL and
// PHOTO_STACK_OFFSET have no mobile equivalent: Figma's mobile photo album
// instance (988:7308) is already its own bounding box, so mobile renders
// PhotoStack directly in flow with no reserved cell or offset at all.
const PHOTO_CELL = { width: 307, height: 313 };
const PHOTO_STACK_OFFSET = { left: 10, top: 23 };

export function Hero() {
  const scrollTo = useScrollAction();
  const { play, loaded } = useLoadSequence();

  // Gates ONLY the photo cell's wrapper structure (a reserved 307x313 box
  // with an absolutely-positioned child, vs. PhotoStack sitting directly in
  // flow) and PhotoStack's own internal fan geometry — never the row's
  // width or flex-direction, which switch by CSS alone (tablet:, and
  // --hero-content-w/-roles-w above) so a hydration guess here can never
  // reopen the sub-640px document-width overflow this session fixed (A1).
  // getServerSnapshot defaults to `false` (assume desktop, this site's
  // standing convention — see useViewportBelow's own comment); a wrong
  // guess at this size only ever renders a 307px-wide cell inside a column
  // that's at minimum 335px wide (375 viewport - 2*page-x) — never an
  // overflow, just a one-frame mis-sized photo corrected on hydration.
  const mobile = useViewportBelow(0, BREAKPOINT_TABLET);

  return (
    <div className="viewport-fill flex w-full flex-col items-center px-page-x">
      <section
        className="my-auto flex flex-col items-center gap-xl py-xl"
        style={{ width: "var(--hero-content-w)" }}
      >
        <Wordmark play={play} loaded={loaded} />

        <div
          className="flex flex-col items-center gap-xl tablet:flex-row tablet:gap-lg"
          style={{ width: "var(--hero-content-w)" }}
        >
          {mobile ? (
            <LoadReveal play={play} delay={LOAD.photoStart}>
              <PhotoStack mobile />
            </LoadReveal>
          ) : (
            <div className="relative shrink-0" style={PHOTO_CELL}>
              <div className="absolute" style={PHOTO_STACK_OFFSET}>
                <LoadReveal play={play} delay={LOAD.photoStart}>
                  <PhotoStack mobile={false} />
                </LoadReveal>
              </div>
            </div>
          )}

          <div
            className="flex flex-col items-start gap-lg"
            style={{ width: "var(--hero-roles-w)" }}
          >
            <BioList play={play} startDelay={LOAD.bioStart} />
            <LoadReveal play={play} delay={LOAD.buttonStart}>
              <Button onClick={() => scrollTo("#selected-work", { offsetVar: "--spacing-nav-height" })}>
                VIEW MY WORK
              </Button>
            </LoadReveal>
          </div>
        </div>
      </section>

      <div className="w-full pb-lg tablet:pb-xl">
        <Ticker items={roles} />
      </div>
    </div>
  );
}
