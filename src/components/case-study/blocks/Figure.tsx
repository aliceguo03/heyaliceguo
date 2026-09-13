import Image from "next/image";
import { CONTENT_W, FIGURE_H } from "@/components/case-study/caseStudyGeometry";
import { AmbientVideo } from "./AmbientVideo";
import { FeatureVideo } from "./FeatureVideo";
import type { Figure as FigureData } from "@/content/case-studies/types";

// A standalone `figure` block, and the figure half of `proseFigure` /
// `carousel` items — CONTENT_W x FIGURE_H (1077x556) by default, no
// per-project size prop (CLAUDE.md) — UNLESS `figure.video` is present, in
// which case the well takes `video.height` instead (see types.ts's
// VideoSource comment: two of GeminiCut's figures are real screen
// recordings whose own aspect ratio doesn't match every other figure's
// cropped 1077x556). `visible`/`onCanReplay` are unused by the plain-image
// path — passed straight through to AmbientVideo when a caller (only
// CarouselTabs.tsx today) owns the play/pause gate.
export function Figure({
  figure,
  visible,
}: {
  figure: FigureData;
  visible?: boolean;
}) {
  const height = figure.video?.height ?? FIGURE_H;

  return (
    <div className="relative w-full overflow-hidden rounded-card" style={{ height }}>
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
          sizes={`${CONTENT_W}px`}
          className="object-cover"
        />
      )}
    </div>
  );
}
