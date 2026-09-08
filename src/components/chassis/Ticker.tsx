// Pure CSS marquee — no JS needed. Hover-pause and prefers-reduced-motion
// are both handled by the .ticker-track rules in globals.css.
//
// `items` is a required prop, not an import — the homepage passes `roles`
// (src/content/roles.ts), the About page passes `tools`
// (src/content/tools.ts). Bottom spacing is deliberately NOT this
// component's job: the two pages want different gaps (50px on the
// homepage, 30px on About, owned by the section there) — each caller wraps
// this in its own spacing div rather than this component taking a padding
// override, which would reopen the arbitrary-value door.
function RoleTrack({
  items,
  hidden,
}: {
  items: readonly string[];
  hidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-lg"
      aria-hidden={hidden ? "true" : undefined}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-lg">
          <span className="text-mono font-mono text-disabled">{item}</span>
          <span className="text-mono font-mono text-disabled">/</span>
        </div>
      ))}
    </div>
  );
}

export function Ticker({ items }: { items: readonly string[] }) {
  return (
    <div className="ticker-fade w-full overflow-hidden px-xl">
      <div className="ticker-track flex w-max items-center gap-lg">
        <RoleTrack items={items} />
        <RoleTrack items={items} hidden />
      </div>
    </div>
  );
}
