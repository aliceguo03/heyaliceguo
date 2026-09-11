import Image from "next/image";
import { CONTENT_W, FIGURE_H } from "@/components/case-study/caseStudyGeometry";
import type { Figure as FigureData } from "@/content/case-studies/types";

// A standalone `figure` block, and the figure half of `proseFigure` /
// `carousel` items — always CONTENT_W x FIGURE_H (1077x556), no
// per-project size prop (CLAUDE.md).
export function Figure({ figure }: { figure: FigureData }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-card"
      style={{ height: FIGURE_H }}
    >
      <Image
        src={figure.src}
        alt={figure.alt}
        fill
        sizes={`${CONTENT_W}px`}
        className="object-cover"
      />
    </div>
  );
}
