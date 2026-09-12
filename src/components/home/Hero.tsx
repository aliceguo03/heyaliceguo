"use client";

import { useEffect, useState } from "react";
import { BioList } from "./BioList";
import { PhotoStack } from "./PhotoStack";
import { Button } from "@/components/ui/Button";
import { Ticker } from "@/components/chassis/Ticker";
import { useScrollAction } from "@/components/chassis/SmoothScroll";
import { LoadReveal } from "@/components/motion/LoadReveal";
import { Wordmark } from "@/components/motion/Wordmark";
import { useLoadSequence } from "@/components/motion/useLoadSequence";
import { LOAD } from "@/lib/motion";
import { roles } from "@/content/roles";

// Figma hero frame (441:5965), page "final". Fixed pixel geometry below is
// specific to this frame at the 1710px reference width, not a design token,
// so it's kept here as documented consts rather than in @theme.
const HERO_WIDTH = 657;
const PHOTO_CELL = { width: 307, height: 313 };
const PHOTO_STACK_OFFSET = { left: 10, top: 23 };
const ROLES_COLUMN_WIDTH = 320;

export function Hero() {
  const scrollTo = useScrollAction();
  const { play, loaded } = useLoadSequence();

  // Diagnosis (before this fix): the root layout (Nav/SmoothScroll/Footer)
  // never unmounts between routes, so Lenis's own scroll state isn't the
  // culprit — nothing here caches or restores a prior position. What was
  // actually missing is exactly the second half of that question: nothing
  // told the freshly-mounted Home page to land at #page-top through this
  // app's own scroll system. Next's default Link behavior happens to reset
  // the raw scroll offset to 0 on its own, but silently — no Lenis
  // animation, and critically no focus move, so a keyboard/screen-reader
  // user arriving via "BACK TO HOME" (or any other client-side link to "/")
  // got no landing cue at all, unlike every other "top" landing on this
  // site (WorkSectionActions' BACK TO TOP), which goes through scrollTo
  // ("top") for exactly that reason.
  //
  // `useLoadSequence`'s own `play` is the right signal for "did this mount
  // arrive via a fresh hard reload (play=true, nothing to correct — the
  // browser's already at 0) or via client-side navigation (play=false, the
  // module-scope flag already flipped from an earlier visit)" — frozen at
  // mount via useState, the same reason that hook freezes its own
  // hasPlayedAtMount, so a later reduced-motion toggle can't retrigger this.
  // Generalizes to arriving from any route (not just a case study, and not
  // keyed to any specific one) since Hero remounts fresh every time "/" is
  // (re)entered.
  const [arrivedViaNavigation] = useState(() => !play);
  useEffect(() => {
    if (arrivedViaNavigation) {
      scrollTo("top");
    }
  }, [arrivedViaNavigation, scrollTo]);

  return (
    <div className="viewport-fill flex w-full flex-col items-center">
      <section
        className="my-auto flex flex-col items-center gap-xl py-xl"
        style={{ width: HERO_WIDTH }}
      >
        <Wordmark play={play} loaded={loaded} />

        <div className="flex items-center gap-lg" style={{ width: HERO_WIDTH }}>
          <div className="relative shrink-0" style={PHOTO_CELL}>
            <div className="absolute" style={PHOTO_STACK_OFFSET}>
              <LoadReveal play={play} delay={LOAD.photoStart}>
                <PhotoStack />
              </LoadReveal>
            </div>
          </div>

          <div
            className="flex flex-col items-start gap-lg"
            style={{ width: ROLES_COLUMN_WIDTH }}
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

      <div className="w-full pb-xl">
        <Ticker items={roles} />
      </div>
    </div>
  );
}
