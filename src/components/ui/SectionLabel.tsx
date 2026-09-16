import type { ReactNode } from "react";

// Figma "SELECTED WORK." label (441:5986). `id` is optional: only the
// homepage's instance is a scroll/focus target (VIEW MY WORK jumps here),
// so it's opt-in rather than baked into every heading this renders.
//
// R4a follow-up (mobile visual fixes): `size="phone"` steps the label down
// to `text-mono-caption` — matching ProjectTileContentPhone.tsx's own
// title-row token exactly (16px/21/0.03em), confirmed by reading that
// file rather than assumed. Before this, the label used `text-mono-header`
// at every width, which steps 24px→20px below --breakpoint-tablet
// (globals.css's mobile type-ramp block) but never all the way down to
// 16px — a visible mismatch against the project title inside the card
// directly beneath it. Only ProjectSection.tsx passes `size="phone"`, and
// only when its own geometry resolves to the phone tier — every other
// caller (there are none today; this component has exactly one consumer)
// keeps the default.
const SIZE_CLASS = {
  default: "text-mono-header",
  phone: "text-mono-caption",
} as const;

export function SectionLabel({
  id,
  size = "default",
  children,
}: {
  id?: string;
  size?: keyof typeof SIZE_CLASS;
  children: ReactNode;
}) {
  return (
    <h2 id={id} tabIndex={id ? -1 : undefined} className={`${SIZE_CLASS[size]} font-mono text-dark-gray`}>
      {children}
    </h2>
  );
}
