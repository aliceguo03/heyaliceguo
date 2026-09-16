// One row of a project card's ROLE / TIMELINE / PROJECT TYPE block
// (I441:5988;565:1465–1473). Rendered inside a parent <dl>. Uses the
// caption size (JetBrains/Caption, 16px) — the tile's redesigned meta rows
// are smaller than --text-mono, which is used elsewhere on the card.
//
// Session R3: three independent, orthogonal deviations the tablet/phone
// cards each need, kept as separate booleans rather than folded into one
// `size` enum — they don't actually move together. `hideLabel`
// (ProjectCardTablet, 931:4275) has no "ROLE /" text node in Figma at all;
// kept in the DOM as sr-only rather than dropped, so a screen-reader user
// still gets the role/type distinction a sighted user reads from position
// alone. `dim` (ProjectCardTablet's second row only, 920:3965) is
// dark-gray in Figma where every other instance of this row — including
// the phone card's own second row — stays deep-black. `compact`
// (ProjectCardPhone, 931:4274) steps text-mono-caption down to
// text-mono-mobile and halves the label-to-value gap (16 -> 8,
// Figma-measured on 920:4070/920:4073) — text size alone doesn't predict
// that gap, so it isn't derived from the same flag implicitly.
export function MetaRow({
  label,
  value,
  hideLabel = false,
  dim = false,
  compact = false,
}: {
  label: string;
  value: string;
  hideLabel?: boolean;
  dim?: boolean;
  compact?: boolean;
}) {
  const textClass = compact ? "text-mono-mobile" : "text-mono-caption";
  return (
    <div className={`flex ${compact ? "gap-s" : "gap-btn-y"}`}>
      <dt className={hideLabel ? "sr-only" : `whitespace-nowrap ${textClass} font-mono text-muted-gray`}>
        {label}
        <span aria-hidden="true"> /</span>
      </dt>
      {/* Session R1: no whitespace-nowrap here (kept on dt above) — at the
          fallback card's narrowest phone widths (ProjectCard.tsx, reduced
          motion), a long value like "WEBSITE & ADMIN PORTAL" has nowhere
          near enough room on one line and was overflowing the card's right
          edge instead of wrapping. Doesn't affect wider widths: there's
          always room for one line there, so this only ever activates when
          actually forced to. */}
      <dd className={`m-0 ${textClass} font-mono ${dim ? "text-dark-gray" : "text-deep-black"}`}>
        {value}
      </dd>
    </div>
  );
}
