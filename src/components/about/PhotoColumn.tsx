import { ABOUT_SECTIONS } from "@/content/about";
import { SectionCount } from "./SectionCount";
import { PhotoCaption } from "./PhotoCaption";
import { PHOTO_COL_W, PHOTO_WINDOW_H } from "./aboutGeometry";

// Right column (Figma "progress track + text", 523:6850). Session 5A
// renders all six photo/caption pairs at rest, clipped with
// overflow:hidden at PHOTO_WINDOW_H — at rest that shows photo 1 plus its
// caption and 61px of the gap below it (see aboutGeometry.ts's comment on
// why PHOTO_WINDOW_H isn't derived arithmetic). Scroll behavior is 5B.
export function PhotoColumn() {
  return (
    <div className="flex shrink-0 flex-col items-start gap-md" style={{ width: PHOTO_COL_W }}>
      <SectionCount current={1} total={ABOUT_SECTIONS.length} />

      <div className="overflow-hidden" style={{ width: PHOTO_COL_W, height: PHOTO_WINDOW_H }}>
        <div className="flex flex-col items-start gap-3xl" style={{ width: PHOTO_COL_W }}>
          {ABOUT_SECTIONS.map((section, index) => (
            <PhotoCaption
              key={section.id}
              photo={section.photo}
              alt={section.alt}
              caption={section.caption}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
