import Image from "next/image";
import type { Project } from "@/content/projects";
import type { CaseStudy } from "@/content/case-studies/types";
import { HERO_HEADER_W, HERO_PHOTO_H, HERO_PHOTO_W } from "./caseStudyGeometry";

// Case study hero card (730:6005/730:5993). Global Nav (layout.tsx) already
// occupies its own flow height above this — this section only supplies the
// 20px gap Figma's own (unused) in-frame nav copy leaves before the card,
// plus the section's own 100px horizontal / 50px bottom padding
// (736:6032's px-100/pb-50, "hero section" band).
export function CaseStudyHero({ project, hero }: { project: Project; hero: CaseStudy["hero"] }) {
  return (
    <section className="flex w-full flex-col px-3xl pb-xl pt-md">
      <div className="flex w-full flex-col items-start gap-xl overflow-hidden rounded-panel border border-divider bg-porcelain pb-xl pt-3xl shadow-case-card">
        <div
          className="flex flex-col gap-sm px-xl text-mono-header font-mono"
          style={{ width: HERO_HEADER_W }}
        >
          <p className="text-muted-gray">{project.number}.</p>
          <div className="flex flex-col gap-sm">
            <p className="text-deep-black">{project.name} /</p>
            <p className="text-muted-gray">{hero.tagline}</p>
          </div>
        </div>

        <div className="relative w-full" style={{ height: HERO_PHOTO_H }}>
          {/* The 3-photo strip is wider than the card and centered — Figma's
              own left=-443 offset on a 1510-wide frame is, within
              rounding, exactly (frame width - strip width) / 2, so
              left-1/2 -translate-x-1/2 reproduces it at any width instead
              of hardcoding that offset. */}
          <div className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 items-center gap-md">
            {hero.photos.map((photo, index) => (
              <div
                key={photo.src}
                className="relative h-full shrink-0 overflow-hidden rounded-card border border-divider"
                style={{ width: HERO_PHOTO_W }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={`${HERO_PHOTO_W}px`}
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
