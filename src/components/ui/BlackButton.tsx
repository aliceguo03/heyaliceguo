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
//
// Session R3: reads --blackbutton-height (globals.css) rather than a bare
// literal — that property is "auto" below 744, letting the height derive
// from padding + the mobile-stepped line-height instead of a second forced
// number; see its own comment in globals.css for why that's correct for
// both variants without doubling the border math here.
const BUTTON_HEIGHT = "var(--blackbutton-height)";

// Each variant has its own Figma padding scheme — they aren't the same
// component scaled by color. Filled: symmetric px-lg/py-sm (380:1977) at
// desktop. Session R2a: the mobile instance of this same button (988:7340's
// "view case study", 949:5325, in the mobile "selected work" project card)
// measures uniform 16px on all four sides (space-btn-y) — not a scaled-down
// 30/12, a genuinely different scheme — so it steps at --breakpoint-tablet
// like the type scale does, widening back to the desktop lg/sm split only
// at tablet+.
//
// Outline covers two distinct Figma components sharing one style, not one
// padding scheme: "back to top button" (400:3559) is bound to the 24px
// "side" var (space-btn-x) on the left but the 16px "top-bottom" var
// (space-btn-y) on the right — asymmetric, because that right padding is
// scoped to the trailing arrow glyph's own whitespace, not a general
// outline-button rule. "secondary button" (677:4690, e.g. BACK TO HOME, no
// icon) is symmetric space-btn-x on both sides — confirmed by re-reading
// that node fresh, not inherited from the icon-bearing one.
//
// Session R2a: unlike the filled variant, outline does NOT step at mobile —
// the mobile "back to top button" instance (988:7349, in the mobile
// buttons band 988:7348) measures pl-24/pr-16/py-16, byte-identical to the
// desktop reading of 400:3559. Confirmed unchanged, not overlooked; no
// breakpoint variant added here.
//
// Picked by the caller's own `outlineKind` rather than inferred from
// whether `arrow` is passed: bug-fix pass 1 found the two outline callers
// were coupled through that proxy (and through this shared VARIANT_CLASSES
// entry) — a future arrowed outline button elsewhere would have silently
// inherited BACK TO TOP's own padding. `outlineKind` names each Figma
// component directly instead.
const VARIANT_CLASSES = {
  filled: "px-btn-y py-btn-y tablet:px-lg tablet:py-sm bg-ink text-pure-white hover:bg-ink/85",
  outline: "py-btn-y border border-dark-gray bg-porcelain text-dark-gray hover:bg-divider",
} as const;

// BACK TO TOP's own right padding is space-md (20px), not Figma's space-btn-y
// (16px) — a deliberate visual call by design (Alice), made after re-reading
// Figma confirmed 16px was in fact what the file said. Scoped to `backToTop`
// only via OUTLINE_PADDING_X, so `secondary` (BACK TO HOME) is untouched.
const OUTLINE_PADDING_X = {
  backToTop: "pl-btn-x pr-md",
  secondary: "px-btn-x",
} as const;

type BlackButtonProps = {
  children: ReactNode;
  variant?: "filled" | "outline";
  arrow?: "up" | "down";
  // Only meaningful for variant="outline" — selects which of the two Figma
  // outline components' padding scheme applies (see OUTLINE_PADDING_X
  // above). Defaults to "secondary" (symmetric, no icon), the more common
  // of the two; BACK TO TOP passes "backToTop" explicitly.
  outlineKind?: "backToTop" | "secondary";
  // Only meaningful for the filled variant — see the magnetOn derivation
  // below. Undefined (the common case: ALL PROJECTS, ProjectCard's own CTA,
  // BACK TO TOP) means "nothing clips this button, so it's always eligible."
  // ProjectTileContent passes an explicit boolean for its four CTAs, each
  // clipped by the fixed-card mechanic and only magnet-eligible while its
  // own frame is fully onscreen (CLAUDE.md "Magnet" — the visibility gate).
  magnetEnabled?: boolean;
  // Session R3: the phone project card's CTA (931:4274) spans the full
  // card width rather than sitting inline beside the meta rows — every
  // other caller stays their natural content width, so this defaults off.
  fullWidth?: boolean;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function BlackButton({
  href,
  onClick,
  variant = "filled",
  arrow,
  outlineKind = "secondary",
  magnetEnabled,
  fullWidth = false,
  children,
}: BlackButtonProps) {
  const outlinePaddingX = OUTLINE_PADDING_X[outlineKind];
  // `uppercase` here, not on the content passed in: every caller so far
  // hand-types its label already in caps, but CaseStudyActions.tsx's NEXT
  // PROJECT button interpolates a project's own `footerLabel` ("Chase",
  // "GeminiCut" — deliberately mixed-case elsewhere, e.g. Footer.tsx's
  // link columns, per content/projects.ts's own comment). This component's
  // established style is all-caps mono regardless of source casing, so the
  // transform belongs on the button chrome, not on a per-caller string.
  const classes = `inline-flex items-center justify-center gap-sm rounded-btn text-mono font-mono uppercase transition-colors duration-200 ease-standard ${VARIANT_CLASSES[variant]} ${variant === "outline" ? outlinePaddingX : ""} ${fullWidth ? "w-full" : ""}`;

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
