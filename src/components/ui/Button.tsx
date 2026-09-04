import Link from "next/link";
import type { ReactNode } from "react";

// Figma's "view my work button" (328:310). 63px is a fixed height in the
// design — padding plus a single 26px text line only sums to 58px, so it's
// set explicitly rather than left to derive from content.
const BUTTON_HEIGHT = "63px";

// The arrow glyph rotates to point at the button's destination: "down" for
// scrolling further down the page (the hero's only use today), "up" for
// scrolling back to the top. Figma variant `place` names these the same way.
const ARROW_ROTATION = {
  down: "rotate-90",
  up: "-rotate-90",
} as const;

export function Button({
  href,
  direction = "down",
  children,
}: {
  href: string;
  direction?: "down" | "up";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{ height: BUTTON_HEIGHT }}
      className="inline-flex items-center justify-center gap-sm rounded-btn bg-ink px-btn-x py-btn-y text-mono font-mono text-pure-white transition-colors duration-200 ease-standard hover:bg-ink/85"
    >
      {children}
      <span aria-hidden="true" className={`inline-block ${ARROW_ROTATION[direction]}`}>
        →
      </span>
    </Link>
  );
}
