"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode, Ref } from "react";
import { ARROW_ROTATION } from "./Button";
import { useMagnet } from "@/components/motion/useMagnet";

const MotionLink = motion.create(Link);

// Figma "black button" component (380:1978/380:1977) — the filled variant,
// e.g. "ALL PROJECTS" (441:5996) and ProjectCard's "VIEW CASE STUDY".
// Distinct from ui/Button.tsx (the "view my work button", 328:310) —
// different height and padding, and no arrow unless requested.
//
// The outline variant (400:3559/400:3560, "back to top button") lives here
// too rather than in a separate component: same height, radius, and font as
// the filled variant, just a different fill/border and an arrow. Reused
// wherever a case-study CTA or a back-to-top action appears, so it lives in
// ui/.
const BUTTON_HEIGHT = "62px";

// Each variant has its own Figma padding scheme — they aren't the same
// component scaled by color. Filled: symmetric px-lg/py-sm (380:1977).
// Outline: left bound to the 24px "side" var (space-btn-x), right and
// vertical bound to the 16px "top-bottom" var (space-btn-y) — asymmetric
// horizontal padding, confirmed intentional in the source file, not a
// mistake to normalize away.
const VARIANT_CLASSES = {
  filled: "px-lg py-sm bg-ink text-pure-white hover:bg-ink/85",
  outline:
    "pl-btn-x pr-btn-y py-btn-y border border-dark-gray bg-porcelain text-dark-gray hover:bg-divider",
} as const;

type BlackButtonProps = {
  children: ReactNode;
  variant?: "filled" | "outline";
  arrow?: "up" | "down";
  // Only meaningful for the filled variant — see the magnetOn derivation
  // below. Undefined (the common case: ALL PROJECTS, ProjectCard's own CTA,
  // BACK TO TOP) means "nothing clips this button, so it's always eligible."
  // ProjectTileContent passes an explicit boolean for its four CTAs, each
  // clipped by the fixed-card mechanic and only magnet-eligible while its
  // own frame is fully onscreen (CLAUDE.md "Magnet" — the visibility gate).
  magnetEnabled?: boolean;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function BlackButton({
  href,
  onClick,
  variant = "filled",
  arrow,
  magnetEnabled,
  children,
}: BlackButtonProps) {
  const classes = `inline-flex items-center justify-center gap-sm rounded-btn text-mono font-mono transition-colors duration-200 ease-standard ${VARIANT_CLASSES[variant]}`;

  // BACK TO TOP (outline) is excluded regardless of the prop — the outline
  // variant is never one of the six primary black-fill buttons the magnet
  // spec covers (CLAUDE.md "Magnet").
  const magnetOn = variant === "filled" && (magnetEnabled ?? true);
  const { ref, style } = useMagnet<HTMLButtonElement | HTMLAnchorElement>(magnetOn);

  const content = (
    <>
      {children}
      {arrow && (
        <span aria-hidden="true" className={`inline-block ${ARROW_ROTATION[arrow]}`}>
          →
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <MotionLink
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        style={{ height: BUTTON_HEIGHT, ...style }}
        className={classes}
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
      className={classes}
    >
      {content}
    </motion.button>
  );
}
