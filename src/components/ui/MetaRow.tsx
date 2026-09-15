// One row of a project card's ROLE / TIMELINE / PROJECT TYPE block
// (I441:5988;565:1465–1473). Rendered inside a parent <dl>. Uses the
// caption size (JetBrains/Caption, 16px) — the tile's redesigned meta rows
// are smaller than --text-mono, which is used elsewhere on the card.
export function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-btn-y">
      <dt className="whitespace-nowrap text-mono-caption font-mono text-muted-gray">
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
      <dd className="m-0 text-mono-caption font-mono text-deep-black">{value}</dd>
    </div>
  );
}
