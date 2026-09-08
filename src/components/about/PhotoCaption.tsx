import Image from "next/image";
import { PHOTO_COL_W, PHOTO_H } from "./aboutGeometry";

// One "photo and caption" instance (Figma 523:7208 etc.) — a rounded photo
// plus a mono caption beneath it, gap-md between them. Caption is rendered
// verbatim, no CSS text-transform.
//
// `height` is an optional CSS length (session 5B's photoHeightCss, a
// viewport-tracking min() expression) — defaults to Figma's flat 448px for
// the reduced-motion fallback, where nothing shrinks. Since the height is
// now a string rather than a number, the photo is sized via a fixed-height
// wrapper + `fill` rather than next/image's width/height props (still
// rule-12 compliant: `fill` inside a sized parent, explicit `sizes`).
export function PhotoCaption({
  photo,
  alt,
  caption,
  priority,
  height = `${PHOTO_H}px`,
}: {
  photo: string;
  alt: string;
  caption: string;
  priority?: boolean;
  height?: string;
}) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-md" style={{ width: PHOTO_COL_W }}>
      <div
        data-testid="about-photo"
        className="relative w-full overflow-hidden rounded-card"
        style={{ height }}
      >
        <Image
          src={photo}
          alt={alt}
          fill
          sizes={`${PHOTO_COL_W}px`}
          priority={priority}
          className="object-cover"
        />
      </div>
      <p className="text-mono-caption font-mono text-muted-gray">{caption}</p>
    </div>
  );
}
