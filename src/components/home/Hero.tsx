"use client";

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
