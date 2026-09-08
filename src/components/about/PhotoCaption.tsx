import Image from "next/image";
import { PHOTO_COL_W, PHOTO_H } from "./aboutGeometry";

// One "photo and caption" instance (Figma 523:7208 etc.) — a rounded photo
// plus a mono caption beneath it, gap-md between them. Caption is rendered
// verbatim, no CSS text-transform.
export function PhotoCaption({
  photo,
  alt,
  caption,
  priority,
}: {
  photo: string;
  alt: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-md" style={{ width: PHOTO_COL_W }}>
      <Image
        src={photo}
        alt={alt}
        width={PHOTO_COL_W}
        height={PHOTO_H}
        priority={priority}
        className="rounded-card object-cover"
      />
      <p className="text-mono-caption font-mono text-muted-gray">{caption}</p>
    </div>
  );
}
