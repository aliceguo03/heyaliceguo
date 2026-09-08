import { ABOUT_SECTIONS } from "@/content/about";
import { SectionCount } from "./SectionCount";
import { PhotoCaption } from "./PhotoCaption";
import { PHOTO_COL_W } from "./aboutGeometry";

// Right column (Figma "progress track + text", 523:6850). Session 5A
// rendered all six photo/caption pairs at rest, clipped with
// overflow:hidden at a fixed PHOTO_WINDOW_H. Session 5B (the pin):
// `windowHeight`/`photoHeight` are now CSS lengths that track the
// viewport (aboutGeometry.ts's photoWindowCss/photoHeightCss) — the frame
// can be shorter than Figma's 940, so this window and the photo inside it
// shrink to match rather than overflowing. Still shows photo 1 plus its
// caption at rest; photo snapping is session 5C.
export function PhotoColumn({
  windowHeight,
  photoHeight,
}: {
  windowHeight: string;
  photoHeight: string;
}) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-md" style={{ width: PHOTO_COL_W }}>
      <SectionCount current={1} total={ABOUT_SECTIONS.length} />

      <div
        data-testid="about-photo-window"
        className="overflow-hidden"
        style={{ width: PHOTO_COL_W, height: windowHeight }}
      >
        <div className="flex flex-col items-start gap-3xl" style={{ width: PHOTO_COL_W }}>
          {ABOUT_SECTIONS.map((section, index) => (
            <PhotoCaption
              key={section.id}
              photo={section.photo}
              alt={section.alt}
              caption={section.caption}
              priority={index === 0}
              height={photoHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
