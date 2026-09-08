import { PILL_H, PILL_PAD_X } from "./aboutGeometry";

// Section count pill (Figma "section count", 523:7254). `total` is never a
// literal — the caller passes ABOUT_SECTIONS.length, so this can't drift
// from the actual number of sections in the content module.
export function SectionCount({ current, total }: { current: number; total: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="flex items-center gap-sm rounded-btn bg-menu-gradient/70 text-mono font-mono"
      style={{ height: PILL_H, paddingLeft: PILL_PAD_X, paddingRight: PILL_PAD_X }}
    >
      <span className="text-deep-black">{pad(current)}</span>
      <span className="text-muted-gray">/</span>
      <span className="text-muted-gray">{pad(total)}</span>
    </div>
  );
}
