"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode, Ref } from "react";
import { useMagnet } from "@/components/motion/useMagnet";

// Figma's "view my work button" (328:310 desktop, 988:7320 mobile). Fixed
// height in the design at both breakpoints — desktop's 63px is 5px more than
// padding-y*2 + a single text line would derive to on its own (58px), so
// it's forced explicitly rather than left to derive from content; mobile's
// 53px happens to equal its own natural sum exactly, but is still forced
// here for the same reason (robust to a future content-height change,
// consistent with desktop). Read through --hero-button-height (globals.css
// "Hero geometry ramp") since an inline style can't itself respond to the
// tablet breakpoint the way a CSS var can.
const BUTTON_HEIGHT = "var(--hero-button-height)";

const MotionLink = motion.create(Link);

// The arrow glyph rotates to point at the button's destination: "down" for
// scrolling further down the page (the hero's only use today), "up" for
// scrolling back to the top. Figma variant `place` names these the same way.
// Exported so BlackButton's outline variant (back to top button, 400:3559)
// reuses the same rotation map instead of duplicating it.
export const ARROW_ROTATION = {
  down: "rotate-90",
  up: "-rotate-90",
} as const;

// Padding is uniform (py-btn-y, both axes) below --breakpoint-tablet —
// Figma's mobile button (988:7320) measures 16px on all four sides, not the
// desktop 24/16 split — widening to px-btn-x only at tablet+.
const CLASSES =
  "inline-flex items-center justify-center gap-sm rounded-btn bg-ink px-btn-y py-btn-y tablet:px-btn-x text-mono font-mono text-pure-white transition-colors duration-200 ease-standard hover:bg-ink/85";

type ButtonProps = {
  direction?: "down" | "up";
  children: ReactNode;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

// Every use of this button is either a real navigation (href) or a scroll
// action (onClick) — never both, so the element itself follows: a Link for
// navigation, a real <button> for a scroll trigger.
export function Button({ href, onClick, direction = "down", children }: ButtonProps) {
  // Only primary (black-fill) button this component renders — always
  // magnet-eligible; onscreen state doesn't gate it the way ProjectTileContent's
  // clipped CTAs are gated (see BlackButton.tsx).
  const { ref, style } = useMagnet<HTMLButtonElement | HTMLAnchorElement>(true);

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
      <MotionLink
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        style={{ height: BUTTON_HEIGHT, ...style }}
        className={CLASSES}
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      style={{ height: BUTTON_HEIGHT, ...style }}
      className={CLASSES}
    >
      {content}
    </motion.button>
  );
}
