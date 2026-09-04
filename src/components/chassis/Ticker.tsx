import { roles } from "@/content/roles";

// Pure CSS marquee — no JS needed. Hover-pause and prefers-reduced-motion
// are both handled by the .ticker-track rules in globals.css.
function RoleTrack({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-lg"
      aria-hidden={hidden ? "true" : undefined}
    >
      {roles.map((role, index) => (
        <div key={index} className="flex items-center gap-lg">
          <span className="text-mono font-mono text-disabled">{role}</span>
          <span className="text-mono font-mono text-disabled">/</span>
        </div>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <div className="ticker-fade w-full overflow-hidden px-xl pb-xl">
      <div className="ticker-track flex w-max items-center gap-lg">
        <RoleTrack />
        <RoleTrack hidden />
      </div>
    </div>
  );
}
