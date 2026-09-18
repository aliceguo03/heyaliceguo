import Image from "next/image";
import type { Project } from "@/content/projects";
import type { CaseStudy } from "@/content/case-studies/types";
import { HERO_PHOTO_H, HERO_PHOTO_W } from "./caseStudyGeometry";

// Case study hero card (730:6005/730:5993, tablet 1015:8656/1015:8657).
// Global Nav (layout.tsx) already occupies its own flow height above this —
// this section only supplies the 20px gap Figma's own (unused) in-frame nav
// copy leaves before the card, plus the section's own horizontal/bottom
// padding (--case-x below 1440, the existing unconditional 100/50 pair at
// and above it — see globals.css's own comment on that ramp).
//
// Session R5 (case study responsive pass): the header's own width and the
// 3-photo strip's per-photo width/height are fluid below 1440 —
// HERO_HEADER_W (929) and HERO_PHOTO_W/H (785/522) only apply at desktop
// now; tablet reads --case-hero-header-w (100%, i.e. fills the card) and
// --case-hero-photo-w/-h (591x393, Figma's own tablet measurement, not a
// scaled fraction of the desktop numbers) instead — both CSS vars, since
// neither has a spacing token and an inline style can't itself branch on a
// breakpoint (same reasoning as --blackbutton-height). The phone tier's
// own single-photo layout is a separate addition; see this component's own
// comment where that well is added.
export function CaseStudyHero({ project, hero }: { project: Project; hero: CaseStudy["hero"] }) {
  const singlePhoto = hero.photos.length === 1;

  return (
    <section className="flex w-full flex-col px-case-x pb-xl pt-md">
      <div className="flex w-full flex-col items-start gap-xl overflow-hidden rounded-panel border border-divider bg-porcelain pb-xl pt-3xl shadow-case-card">
        <div
          className="flex flex-col gap-sm px-xl text-mono-header font-mono"
          style={{ width: "var(--case-hero-header-w)" }}
        >
          <p className="text-muted-gray">{project.number}.</p>
          {/* `titleWidth` (Chase: 620, 730:6011) narrows just this group —
              F3Global/GeminiCut omit it and fill the header's own content
              box, same as before this prop existed. Untouched below
              desktop this session — Chase's own tablet/phone rendering
              through this shared component is for the follow-up session
              to verify (CLAUDE.md build order: GeminiCut only, this pass). */}
          <div className="flex w-full flex-col gap-sm" style={{ width: hero.titleWidth }}>
            <p className="text-deep-black">{project.name} /</p>
            <p className="text-muted-gray">{hero.tagline}</p>
          </div>
        </div>

        {singlePhoto ? (
          // Single-photo variant (Chase, 730:6547): one well filling the
          // card's own px-xl padding, not the over-wide 3-photo strip below.
          <div className="w-full px-xl" style={{ height: HERO_PHOTO_H }}>
            <div className="relative h-full w-full overflow-hidden rounded-card border border-divider">
              <Image
                src={hero.photos[0].src}
                alt={hero.photos[0].alt}
                fill
                sizes={`${HERO_PHOTO_W}px`}
                className="object-cover"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: "var(--case-hero-photo-h)" }}>
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
                  style={{ width: "var(--case-hero-photo-w)" }}
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
        )}
      </div>
    </section>
  );
}
