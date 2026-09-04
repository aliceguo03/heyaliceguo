// One row of a project card's ROLE / TIMELINE / PROJECT TYPE block
// (I441:5988;439:5401–5409). Rendered inside a parent <dl>.
export function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-btn-y">
      <dt className="whitespace-nowrap text-mono font-mono text-muted-gray">
        {label}
        <span aria-hidden="true"> /</span>
      </dt>
      <dd className="m-0 whitespace-nowrap text-mono font-mono text-deep-black">{value}</dd>
    </div>
  );
}
