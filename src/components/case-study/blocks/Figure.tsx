import Image from "next/image";
import { FIGURE_ASPECT } from "@/components/case-study/caseStudyGeometry";
import { AmbientVideo } from "./AmbientVideo";
import { FeatureVideo } from "./FeatureVideo";
import type { Figure as FigureData } from "@/content/case-studies/types";

// The `sizes` string every figure well in the template shares. Fluid at
// every tier below the 1710px reference width, matching each tier's own
// horizontal page inset (--case-x, added this session: 20 below 744, 50
// from 744, 100 from 1440) rather than a single guess — an inaccurate
// `sizes` doesn't break layout, but it does make Next request an image
// candidate sized for the wrong viewport. Capped at CONTENT_W (1077) since
// the well never renders wider than that at any tier.
const FIGURE_SIZES =
  "(max-width: 743px) calc(100vw - 40px), (max-width: 1439px) calc(100vw - 100px), 1077px";

// A standalone `figure` block, and the figure half of `proseFigure` /
// `carousel` items — FIGURE_ASPECT (1077/556) by default, no per-project
// size prop (CLAUDE.md) — UNLESS `figure.video` is present, in which case
// the well takes `video.aspect` instead (see types.ts's VideoSource
// comment: two of GeminiCut's figures are real screen recordings whose own
// aspect ratio doesn't match every other figure's cropped 1077x556).
// Session R5: the well's height was a flat px value; now `aspect-ratio`, so
// it stays fluid below the 1710px reference width and at the existing
// 1440px floor, instead of a fixed height cropping into real image content
// once the column clamps narrower than 1077px (every source still is
// pre-cropped to exactly this ratio — confirmed with `sips`). `visible`/
// `onCanReplay` are unused by the plain-image path — passed straight
// through to AmbientVideo when a caller (only CarouselTabs.tsx today) owns
// the play/pause gate.
export function Figure({
  figure,
  visible,
}: {
  figure: FigureData;
  visible?: boolean;
}) {
  const aspectRatio = figure.video?.aspect ?? FIGURE_ASPECT;

  return (
    <div className="relative w-full overflow-hidden rounded-card" style={{ aspectRatio }}>
      {figure.video ? (
        figure.video.behavior === "ambient" ? (
          <AmbientVideo video={figure.video} poster={figure.src} alt={figure.alt} playing={visible} />
        ) : (
          <FeatureVideo video={figure.video} poster={figure.src} alt={figure.alt} />
        )
      ) : (
        <Image
          src={figure.src}
          alt={figure.alt}
          fill
          sizes={FIGURE_SIZES}
          className="object-cover"
        />
      )}
    </div>
  );
}
