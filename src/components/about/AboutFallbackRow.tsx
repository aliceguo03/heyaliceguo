import { PhotoCaption } from "./PhotoCaption";
import { TextBlock } from "./TextBlock";
import type { AboutGeometry } from "./aboutGeometry";
import type { AboutSection } from "@/content/about";

// One row of the reduced-motion / short-viewport fallback (Figma "about -
// reduced motion", 705:5453, "text with photo" — e.g. 705:5568). A
// genuinely different layout from the pinned view, not a compressed
// version of it: both the text block and the photo render at natural
// height, side by side, with no fixed scroll window on either side and no
// section-count pill (nothing to count against once all six sections are
// on screen at once).
//
// Tablet pin reflow session: this used to size its own text column via a
// standalone clamp (textColumnWidthCss) against a hardcoded 653px photo —
// which overflowed at any tablet width (480+653=1133px required against
// an ~864px available content box at 1024px viewport — a real,
// pre-existing bug, confirmed against clean `main` before this session,
// not introduced by it). Tablet and desktop now share the SAME 50/50
// column split the pinned view uses (geo.COLUMN_W/geo.COLUMN_GAP), which
// both fixes that overflow and keeps the fallback visually consistent
// with the pin it's standing in for. Phone tier's own real layout is the
// mobile static stack session's own comment, below.
//
// Mobile static stack session: phone tier now renders its own real layout
// (Figma "about", 1064:9880, page "final" — no longer the interim
// placeholder the tablet pin reflow session left in its place). Text above
// photo. The text block is narrower than the photo — geo.PHONE_TEXT_W, not
// geo.ROW_W — a deliberate difference the mock itself draws (267px text
// vs a 330px photo; see PHONE_TEXT_WIDTH_RATIO's own comment in
// aboutGeometry.ts), not something to normalize away. No section-count
// pill here either (same as tablet/desktop — nothing to count against
// once every section is on screen at once).
//
// B follow-up: text<->photo gap is gap-lg (30), not gap-md (20). 1064:9798
// itself measures 20px here — this is a DELIBERATE OVERRIDE of that mocked
// value (Alice: the mock is too tight at this specific gap), not a
// re-measurement or a correction to a mismeasured number. Noted as such so
// a later session doesn't "fix" this back to match the file.
//
// Mobile spotlight session: `active` (default true) drives both the text
// (`filled`, and — phone tier only — `headerFills`, see TextBlock.tsx's
// own comment for why the header participates here but not in the pinned
// view) and the photo+caption unit's own brightness (PhotoCaption.tsx's
// `active`). AboutFallback computes this per row from
// useAboutSpotlight.ts's committed index; it's always `true` at
// tablet/desktop (that tier never enables the spotlight — see
// AboutFallback.tsx), so threading it into both branches uniformly is a
// no-op there rather than a special case to maintain. `data-about-pair`
// (phone branch only) is the marker useAboutSpotlight.ts measures each
// row's own center off — present only where the spotlight actually
// applies, same "don't mark what nothing reads" discipline
// data-about-block already follows for the pinned view's own marker.
export function AboutFallbackRow({
  section,
  priority,
  geo,
  active = true,
}: {
  section: AboutSection;
  priority?: boolean;
  geo: AboutGeometry;
  active?: boolean;
}) {
  if (geo.tier === "phone") {
    return (
      <div data-about-pair className="flex w-full flex-col gap-lg">
        <div style={{ width: geo.PHONE_TEXT_W }}>
          <TextBlock header={section.header} body={section.body} filled={active} headerFills />
        </div>
        <PhotoCaption
          photo={section.photo}
          alt={section.alt}
          caption={section.caption}
          priority={priority}
          width={geo.ROW_W}
          active={active}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full items-start" style={{ gap: geo.COLUMN_GAP }}>
      <div className="shrink-0" style={{ width: geo.COLUMN_W }}>
        <TextBlock header={section.header} body={section.body} filled={active} />
      </div>
      <PhotoCaption
        photo={section.photo}
        alt={section.alt}
        caption={section.caption}
        priority={priority}
        width={geo.COLUMN_W}
        active={active}
      />
    </div>
  );
}
