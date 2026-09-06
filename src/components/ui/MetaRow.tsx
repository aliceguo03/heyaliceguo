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
      <dd className="m-0 whitespace-nowrap text-mono-caption font-mono text-deep-black">
        {value}
      </dd>
    </div>
  );
}
