import Link from "next/link";
import type { ReactNode } from "react";

// Figma's "view my work button" (328:310). 63px is a fixed height in the
// design — padding plus a single 26px text line only sums to 58px, so it's
// set explicitly rather than left to derive from content.
const BUTTON_HEIGHT = "63px";

// The arrow glyph rotates to point at the button's destination: "down" for
// scrolling further down the page (the hero's only use today), "up" for
// scrolling back to the top. Figma variant `place` names these the same way.
// Exported so BlackButton's outline variant (back to top button, 400:3559)
// reuses the same rotation map instead of duplicating it.
export const ARROW_ROTATION = {
  down: "rotate-90",
  up: "-rotate-90",
} as const;

const CLASSES =
  "inline-flex items-center justify-center gap-sm rounded-btn bg-ink px-btn-x py-btn-y text-mono font-mono text-pure-white transition-colors duration-200 ease-standard hover:bg-ink/85";

type ButtonProps = {
  direction?: "down" | "up";
  children: ReactNode;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

// Every use of this button is either a real navigation (href) or a scroll
// action (onClick) — never both, so the element itself follows: a Link for
// navigation, a real <button> for a scroll trigger.
export function Button({ href, onClick, direction = "down", children }: ButtonProps) {
  const content = (
    <>
      {children}
      <span aria-hidden="true" className={`inline-block ${ARROW_ROTATION[direction]}`}>
        →
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} style={{ height: BUTTON_HEIGHT }} className={CLASSES}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} style={{ height: BUTTON_HEIGHT }} className={CLASSES}>
      {content}
    </button>
  );
}
