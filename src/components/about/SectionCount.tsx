import { PILL_PAD_X } from "./aboutGeometry";

// Section count pill (Figma "section count", desktop 523:7254 / tablet
// 1076:10221). `total` is never a literal — the caller passes
// ABOUT_SECTIONS.length, so this can't drift from the actual number of
// sections in the content module.
//
// Tablet pin reflow session: `size` picks the tablet variant — genuinely
// smaller type (--text-mono-mobile, 14px vs desktop's 20px) with its own
// content-derived height (18px line box + 2*8px padding = 34px, TALLER
// than desktop's clamped-fixed 32px despite the smaller type) and a
// tighter 12px gap to the photo (--spacing-sm, vs desktop's 20). Height is
// intentionally left intrinsic here (py-s, not an explicit PILL_H) rather
// than hardcoding 34 — it's genuinely content-derived in Figma, unlike
// desktop's, which Figma reports as a fixed 32 that can't coexist with its
// own 16px padding (see the original clamping note this file inherited).
export function SectionCount({
  current,
  total,
  size = "default",
}: {
  current: number;
  total: number;
  size?: "default" | "compact";
}) {
  const pad = (n: number) => String(n).padStart(2, "0");

  const sizeClass =
    size === "compact"
      ? "py-s text-mono-mobile"
      : "text-mono";

  return (
    <div
      className={`flex items-center gap-sm rounded-btn bg-menu-gradient/70 font-mono ${sizeClass}`}
      style={
        size === "default"
          ? { height: 32, paddingLeft: PILL_PAD_X, paddingRight: PILL_PAD_X }
          : { paddingLeft: PILL_PAD_X, paddingRight: PILL_PAD_X }
      }
    >
      <span className="text-deep-black">{pad(current)}</span>
      <span className="text-muted-gray">/</span>
      <span className="text-muted-gray">{pad(total)}</span>
    </div>
  );
}
