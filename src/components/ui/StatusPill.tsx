// Figma "project stage" component set (439:5352), 4 variants. `kind` picks the
// dot color; the arrow is a separate axis driven by whether `href` is present,
// matching Figma treating `link` as independent of `light`.
export type StatusKind = "live" | "nda" | "prototype" | "shipped";

// Session R5 (case study responsive pass): a third, distinct treatment of
// the same status data, alongside the desktop/tablet pill this file
// already draws. The phone mock (1005:8011) shows the status as a
// standalone bordered button — "VIEW {label} ↗" — styled like BlackButton's
// existing outline/backToTop treatment (border-dark-gray, bg-porcelain,
// hover:bg-divider, rounded-btn, pl-btn-x/pr-md/py-btn-y), not the pill's
// dot+muted-text style. A variant, not a conditional inside the pill's own
// markup: the two share no measurable property (border vs none, filled
// background vs transparent, "VIEW {label}" vs bare `label`), the same
// reasoning ui/SelectTab.tsx's own header comment gives for staying a
// separate component from BlackButton rather than bolting on a fourth
// variant there. `variant="button"` with no `href` falls back to the plain
// pill-without-link render below (unchanged) — a bordered button with
// nothing to link to doesn't read as a button at all, and Chase (NDA) and
// Blink (shipped) both currently omit `href`, so this is what they'll get
// once the follow-up session opts them into this variant at phone width.
export type StatusVariant = "pill" | "button";

// Which element carries the on-hover shift, and which way. "left" (the
// default, unchanged) is the homepage project cards' existing treatment —
// the dot+label group nudges left, away from a stationary arrow, cheaper
// than animating the arrow itself and correct for a compact card row.
// "right" is the case study side panel's own pill (InfoPanel via
// PanelMeta/PanelNav): a bigger, more central CTA, where the arrow itself
// slides right on hover instead — a direct "go forward" cue, and the
// opposite element/opposite direction from "left", not a sign flip of the
// same transform. No Figma reference for the panel's hover state; this
// session's own call.
export type ArrowHoverDirection = "left" | "right";

// Session R3: this pill is now drawn at three sizes — the original desktop
// instance (439:5352, used at >=1440 and inside the case-study panels via
// PanelMeta/PanelNav) plus two card-specific ones for ProjectCardTablet
// (931:4275) and ProjectCardPhone (931:4274). Not a blanket scale-down:
// tablet keeps the default's own dot size and text size (both already
// correct there, per 931:4275's own variable defs) and steps only the
// dot-to-label gap (16 -> 12, Figma-measured on 920:3952); phone steps all
// three, plus the arrow's own hit-target box (26 -> ~19, rounded to the
// nearest existing spacing token rather than adding a new one for a 7px
// difference — same tolerance StatusPill's own media-well token elsewhere
// in this session already accepts).
type StatusSize = "default" | "tablet" | "phone";
const SIZE_CONFIG: Record<StatusSize, { dot: number; text: string; gap: string; icon: string }> = {
  default: { dot: 15, text: "text-mono", gap: "gap-btn-y", icon: "size-icon" },
  tablet: { dot: 15, text: "text-mono", gap: "gap-sm", icon: "size-icon" },
  phone: { dot: 10, text: "text-mono-mobile", gap: "gap-s", icon: "size-md" },
};

const DOT_COLOR: Record<StatusKind, string> = {
  live: "bg-accent-success",
  shipped: "bg-accent-success",
  prototype: "bg-accent-success",
  nda: "bg-accent-caution",
};

export function StatusPill({
  label,
  shortLabel,
  kind,
  href,
  arrowHover = "left",
  size = "default",
  short = false,
  variant = "pill",
}: {
  label: string;
  // Session R3: the phone card's own short form (projects.ts) — "LIVE" /
  // "NDA" in place of "LIVE SITE" / "NDA-PROTECTED". Resolved here, in one
  // place, rather than by a caller pre-truncating `label` itself, so no
  // component ever hand-edits a project's text (CLAUDE.md rule 9).
  shortLabel?: string;
  kind: StatusKind;
  href?: string;
  arrowHover?: ArrowHoverDirection;
  size?: StatusSize;
  // Only meaningful together with `shortLabel` — ProjectCardPhone passes
  // both; every other caller passes neither and gets `label` unchanged.
  short?: boolean;
  variant?: StatusVariant;
}) {
  const { dot: dotSize, text: textClass, gap, icon } = SIZE_CONFIG[size];
  const displayLabel = short && shortLabel ? shortLabel : label;

  const dot = (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-full ${DOT_COLOR[kind]}`}
      style={{ width: dotSize, height: dotSize }}
    />
  );

  if (!href) {
    return (
      <div className={`flex items-center ${gap}`}>
        {dot}
        <span className={`${textClass} font-mono text-muted-gray`}>{displayLabel}</span>
      </div>
    );
  }

  if (variant === "button") {
    // Copies BlackButton's outline/backToTop chrome directly (border-dark-
    // gray, bg-porcelain, hover:bg-divider, rounded-btn, pl-btn-x/pr-md/
    // py-btn-y, uppercase text-mono) rather than importing it — BlackButton
    // is a click/href union with its own magnet-eligibility logic this
    // status button doesn't need, and the two only share a handful of
    // classes. `text-mono` unconditional (not `textClass`/SIZE_CONFIG's own
    // per-size override): BlackButton's own outline variant deliberately
    // doesn't step at mobile either, per its own comment — the global
    // mobile type step already shrinks --text-mono site-wide, so this
    // renders correctly at 16/21 below 744 with no extra branching.
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center justify-center gap-sm rounded-btn border border-dark-gray bg-porcelain py-btn-y pl-btn-x pr-md text-mono font-mono uppercase text-dark-gray transition-colors duration-200 ease-standard hover:bg-divider"
      >
        <span>VIEW {displayLabel}</span>
        <span
          aria-hidden="true"
          className="flex size-icon shrink-0 items-center justify-center transition-transform duration-200 ease-standard group-hover:translate-x-sm"
        >
          ↗
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-xs ${textClass} font-mono text-muted-gray transition-colors duration-200 ease-standard hover:text-accent-blue-light`}
    >
      {/* Dot + label move together as one unit on hover, so the transform
          lives on this shared span rather than on the label alone. */}
      <span
        className={`flex items-center ${gap} transition-transform duration-200 ease-standard ${
          arrowHover === "left" ? "group-hover:-translate-x-sm" : ""
        }`}
      >
        {dot}
        {displayLabel}
      </span>
      <span
        aria-hidden="true"
        className={`flex ${icon} shrink-0 items-center justify-center transition-transform duration-200 ease-standard ${
          arrowHover === "right" ? "group-hover:translate-x-sm" : ""
        }`}
      >
        ↗
      </span>
    </a>
  );
}
