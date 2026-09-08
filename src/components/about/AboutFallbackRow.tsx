import { PhotoCaption } from "./PhotoCaption";
import { TextBlock } from "./TextBlock";
import { textColumnWidthCss } from "./aboutGeometry";
import type { AboutSection } from "@/content/about";

// One row of the reduced-motion / short-viewport fallback (Figma "about -
// reduced motion", 705:5453, "text with photo" — e.g. 705:5568). A
// genuinely different layout from the pinned view, not a compressed
// version of it: both the text block and the photo render at natural
// height, side by side, with no fixed scroll window on either side and no
// section-count pill (nothing to count against once all six sections are
// on screen at once). The ~194px gap between columns in Figma is emergent
// from `justify-between` inside the row's own width, not a spacing token.
//
// Fix pass: TextBlock had no width of its own here, so it never actually
// reproduced Figma's 663/194/653 split — measured at the reference
// 1710px width, it was rendering at 857px with a 0px gap (default flex-
// shrink filling 100% of whatever space wasn't the fixed-width photo, not
// a bug this pass introduced, but a pre-existing gap in 5B's own
// verification, surfaced while diagnosing the 1440px collision below).
// The same clamp used in the pinned view's TextColumn.tsx closes both at
// once: at the 1710px reference width it resolves to exactly TEXT_COL_W
// (663), leaving Figma's own 194px gap, and shrinks (never overflows) down
// to TEXT_COL_MIN_W as the row narrows toward 1440px — holding
// MIN_COLUMN_GAP (100) once it's shrinking — same as the pinned view.
// shrink-0 so the flex algorithm's own shrink math doesn't additionally
// fight the clamp's already available-space-aware result.
export function AboutFallbackRow({
  section,
  priority,
}: {
  section: AboutSection;
  priority?: boolean;
}) {
  return (
    <div className="flex w-full items-start justify-between">
      <div className="shrink-0" style={{ width: textColumnWidthCss }}>
        <TextBlock header={section.header} body={section.body} />
      </div>
      <PhotoCaption
        photo={section.photo}
        alt={section.alt}
        caption={section.caption}
        priority={priority}
      />
    </div>
  );
}
