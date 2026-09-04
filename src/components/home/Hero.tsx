import { BioList } from "./BioList";
import { PhotoStack } from "./PhotoStack";
import { Button } from "@/components/ui/Button";
import { Ticker } from "@/components/chassis/Ticker";

// Figma hero frame (441:5965), page "final". Fixed pixel geometry below is
// specific to this frame at the 1710px reference width, not a design token,
// so it's kept here as documented consts rather than in @theme.
const HERO_WIDTH = 657;
const PHOTO_CELL = { width: 307, height: 313 };
const PHOTO_STACK_OFFSET = { left: 10, top: 23 };
const ROLES_COLUMN_WIDTH = 320;

export function Hero() {
  return (
    <div className="viewport-fill flex w-full flex-col items-center">
      <section
        className="my-auto flex flex-col items-center gap-xl py-xl"
        style={{ width: HERO_WIDTH }}
      >
        {/* Plain text for now — FlipText's per-character flip lands in step 10. */}
        <h1 className="text-display font-display text-center text-ink">alice guo.</h1>

        <div className="flex items-center gap-lg" style={{ width: HERO_WIDTH }}>
          <div className="relative shrink-0" style={PHOTO_CELL}>
            <div className="absolute" style={PHOTO_STACK_OFFSET}>
              <PhotoStack />
            </div>
          </div>

          <div
            className="flex flex-col items-start gap-lg"
            style={{ width: ROLES_COLUMN_WIDTH }}
          >
            <BioList />
            <Button href="/work">VIEW MY WORK</Button>
          </div>
        </div>
      </section>

      <Ticker />
    </div>
  );
}
