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
// breakpoint (same reasoning as --blackbutton-height).
//
// The phone tier adds a genuinely separate single-photo well (below), not
// a third state of the existing `singlePhoto`/3-strip branch: Figma's own
// phone card (1005:7981) shows one photo regardless of how many the
// project's data carries — GeminiCut has 3 — where `singlePhoto` is a
// *data*-driven branch (Chase genuinely has one photo at every tier). Both
// the strip and the new phone well are always rendered and toggled with
// `hidden`/`block` + `tablet:`, the same "render every tier, toggle
// visibility" pattern Nav.tsx/Footer.tsx use sitewide — chosen over a JS
// branch so this stays a server component (no hydration flash, no client
// JS for a purely-visual swap). The phone well shows `hero.mobilePhoto`
// (types.ts), falling back to `photos[0]` when a project hasn't specified
// one (round 2, item 2 — GeminiCut/Chase haven't needed to); photos 2/3 in
// the strip get `loading="lazy"` so a phone viewport (where the strip sits
// in a permanently `hidden` subtree) never fetches them — `loading="lazy"`
// defers to viewport intersection, which a `display:none` element never
// reaches.
//
// Card chrome (radius, padding, gaps, shadow) all step at `tablet:` too —
// Figma's phone card (1005:7982) measures gap-sm(12)/pt-xl(50)/pb-md(20)/
// px-md(20)/rounded-card(20), a tighter, squarer treatment than desktop's
// gap-xl/pt-3xl/pb-xl/rounded-panel. The photo well's own 12px radius has
// no matching token (`rounded-nav` is the closest existing value, named for
// an unrelated component — flagged for review rather than adding a new
// token for one instance) and the card's own shadow (Figma measures
// 8/11/14.5) doesn't match either existing shadow token, so this reuses
// `shadow-case-card` (the card's own existing desktop shadow) rather than
// inventing a third — both are P1-plan "Flags" items, not oversights.
//
// Chase's own `singlePhoto` (Chase genuinely has one photo) branch is
// UNTOUCHED beyond the same hidden/tablet:block toggle every other well
// gets — its own tablet/phone rendering through this shared component is
// for the follow-up session to verify (CLAUDE.md build order: GeminiCut
// only, this pass).
export function CaseStudyHero({ project, hero }: { project: Project; hero: CaseStudy["hero"] }) {
  const singlePhoto = hero.photos.length === 1;
  const [firstPhoto] = hero.photos;
  // Round 2, item 2: `mobilePhoto` (types.ts) overrides which photo the
  // phone well below shows — F3Global and Blink both need this, since
  // photos[0] there isn't the most representative single image. Falls
  // back to photos[0] for every project that hasn't needed an override
  // (Chase is single-photo already; GeminiCut's own photos[0] reads fine).
  const mobilePhoto = hero.mobilePhoto ?? firstPhoto;

  return (
    // F9 (fix pass, item 7): matches Figma exactly now — 20px phone, 0px
    // tablet, 100px desktop — rather than the judgment call the tablet/
    // phone build made here (splitting the difference between the flat
    // pre-existing padding and Figma's own numbers). `pb-0` is unchanged:
    // the gap below the card is supplied entirely by CaseStudyBody.tsx's
    // own top padding on the section below this one (`pt-md tablet:pt-0
    // desktop:pt-3xl` there, see that component's own comment), not by
    // anything in this section. `desktop:pb-xl` also stays unchanged —
    // desktop's own gap below the card is a different, unrelated measure
    // from this fix.
    <section className="flex w-full flex-col px-case-x pb-0 pt-md desktop:pb-xl">
      <div className="flex w-full flex-col items-start gap-sm overflow-hidden rounded-card border border-divider bg-porcelain pb-md pt-xl shadow-case-card tablet:gap-xl tablet:rounded-panel tablet:pb-xl tablet:pt-3xl">
        <div
          className="flex flex-col gap-s px-md text-mono font-mono tablet:gap-sm tablet:px-xl tablet:text-mono-header"
          style={{ width: "var(--case-hero-header-w)" }}
        >
          <p className="text-muted-gray">{project.number}.</p>
          {/* `titleWidth` (Chase: 620, Blink: 692, 730:6011) narrows just
              this group at the 1710px reference width — it exists purely
              to reproduce Figma's own deliberate desktop line break
              ("FOR" for Chase, "AT" for Blink), not as a real container
              width at every tier. F3Global/GeminiCut omit it and fill the
              header's own content box, same as before this prop existed.
              Fix pass (round 2, item 1): the old unconditional `width:
              titleWidth` clipped Chase and Blink's tagline mid-word below
              ~800-850px, once the card itself (and --case-hero-header-w's
              own fluid resolution below 1440) narrowed past the fixed 620/
              692 literal — the outer card has `overflow-hidden`, so the
              box's own overflow past the card edge silently cropped text
              instead of wrapping it. `min(100%, Npx)` fixes this at the
              source rather than patching a breakpoint: it reproduces the
              exact same 620/692px box wherever the header's own content
              box is wider than that (>=~840px for Chase, ~890px for Blink,
              in practice always true at 1440+ and often true down into
              tablet), and falls back to filling 100% of the header the
              moment the container gets narrower than the literal — the
              same "fill" behavior F3Global/GeminiCut already have
              unconditionally. Verified against every project's tagline,
              not just Chase/Blink's current lengths, since a fix tuned to
              today's two strings could still clip a longer one later. */}
          <div
            className="flex w-full flex-col gap-s tablet:gap-sm"
            style={hero.titleWidth ? { width: `min(100%, ${hero.titleWidth}px)` } : undefined}
          >
            <p className="text-deep-black">{project.name} /</p>
            <p className="text-muted-gray">{hero.tagline}</p>
          </div>
        </div>

        {/* Phone-only single photo (1005:7987) — `mobilePhoto` (defaults to
            photos[0]) above, a fluid aspect-ratio box (272/181, Figma's own
            stated ratio) rather than a fixed height, since a phone's own
            viewport width isn't fixed the way the card's desktop/tablet
            width is. */}
        <div className="block w-full px-md tablet:hidden">
          <div
            className="relative w-full overflow-hidden rounded-nav border border-divider"
            style={{ aspectRatio: "272 / 181" }}
          >
            <Image
              src={mobilePhoto.src}
              alt={mobilePhoto.alt}
              fill
              sizes="(max-width: 743px) calc(100vw - 40px), 0px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {singlePhoto ? (
          // Single-photo variant (Chase, 730:6547): one well filling the
          // card's own px-xl padding, not the over-wide 3-photo strip below.
          <div className="hidden w-full px-xl tablet:block" style={{ height: HERO_PHOTO_H }}>
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
          <div className="relative hidden w-full tablet:block" style={{ height: "var(--case-hero-photo-h)" }}>
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
                    loading={index === 0 ? undefined : "lazy"}
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
