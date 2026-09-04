// Figma "project stage" component set (439:5352), 4 variants. `kind` picks the
// dot color; the arrow is a separate axis driven by whether `href` is present,
// matching Figma treating `link` as independent of `light`.
export type StatusKind = "live" | "nda" | "prototype" | "shipped";

const DOT_COLOR: Record<StatusKind, string> = {
  live: "bg-accent-success",
  shipped: "bg-accent-success",
  prototype: "bg-accent-success",
  nda: "bg-accent-caution",
};

// Frame-specific pixel math, not a design token — same treatment as the photo
// sizes in PhotoStack.tsx.
const DOT_SIZE = 15;

export function StatusPill({
  label,
  kind,
  href,
}: {
  label: string;
  kind: StatusKind;
  href?: string;
}) {
  const dot = (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-full ${DOT_COLOR[kind]}`}
      style={{ width: DOT_SIZE, height: DOT_SIZE }}
    />
  );

  if (!href) {
    return (
      <div className="flex items-center gap-btn-y">
        {dot}
        <span className="text-mono font-mono text-muted-gray">{label}</span>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-xs text-mono font-mono text-muted-gray transition-colors duration-200 ease-standard hover:text-accent-blue-light"
    >
      {/* Dot + label move together as one unit on hover, so the transform
          lives on this shared span rather than on the label alone. */}
      <span className="flex items-center gap-btn-y transition-transform duration-200 ease-standard group-hover:-translate-x-sm">
        {dot}
        {label}
      </span>
      <span
        aria-hidden="true"
        className="flex size-icon shrink-0 items-center justify-center"
      >
        ↗
      </span>
    </a>
  );
}
