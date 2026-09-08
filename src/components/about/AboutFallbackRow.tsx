import { PhotoCaption } from "./PhotoCaption";
import { TextBlock } from "./TextBlock";
import type { AboutSection } from "@/content/about";

// One row of the reduced-motion / short-viewport fallback (Figma "about -
// reduced motion", 705:5453, "text with photo" — e.g. 705:5568). A
// genuinely different layout from the pinned view, not a compressed
// version of it: both the text block and the photo render at natural
// height, side by side, with no fixed scroll window on either side and no
// section-count pill (nothing to count against once all six sections are
// on screen at once). The ~194px gap between columns in Figma is emergent
// from `justify-between` inside the row's own width, not a spacing token.
export function AboutFallbackRow({
  section,
  priority,
}: {
  section: AboutSection;
  priority?: boolean;
}) {
  return (
    <div className="flex w-full items-start justify-between">
      <TextBlock header={section.header} body={section.body} />
      <PhotoCaption
        photo={section.photo}
        alt={section.alt}
        caption={section.caption}
        priority={priority}
      />
    </div>
  );
}
