"use client";

import type { KeyboardEvent, Ref } from "react";

// GeminiCut's "design decisions" carousel tab (Figma 879:3389/879:3390,
// state=selected/default). A new component, not a BlackButton variant —
// deliberate. The two share nothing measurable: this tab is 47px tall (px-md
// py-sm) against BlackButton's 62px (px-lg/py-sm or px-btn-x/py-btn-y), sets
// its label in --text-mono-caption (16/0.03em) where BlackButton uses
// --text-mono (20/0.06em), and its "selected" treatment is a subtle-gray fill
// with an *accent*-colored border and label, not BlackButton's ink-on-white.
// Bolting a fourth variant onto BlackButton would mean overriding nearly
// every property it sets — same name, different component. What genuinely
// carries over is BlackButton's structure: a small class-per-state record and
// `transition-colors duration-200 ease-standard`.
//
// Every value below maps to an existing token — no new tokens were needed.
// Three states, each visually distinct, all confirmed against Figma's own
// hover variant (879:3375, state=hover — re-read fresh, corrected this
// session): resting-inactive (muted-gray border/text, transparent fill),
// hover-inactive (deep-black border/text — #0D0D0D, --color-deep-black, NOT
// --color-ink/#0A0A0A, a different token — fill stays transparent, no bg at
// all), and selected (accent border/text with a #F2F2F2/subtle-gray fill —
// that fill is unique to selected, never shared with hover). Hover only
// applies to the inactive/default state — Figma shows no distinct hover
// treatment for an already-selected tab.
//
// Session R5 (case study responsive pass): horizontal padding and label
// size step at --breakpoint-tablet — the phone mock (1005:8050) measures
// this tab at 14px/px-btn-y (16, uniform) where tablet/desktop keep
// 16px/px-md (20, unchanged from before this session). `px-btn-y` reads
// oddly for a horizontal value — see BlackButton.tsx's own filled variant,
// which uses the same "--spacing-btn-y's value, applied as px, at mobile"
// pattern for the same reason (a real, uniform mobile padding scheme, not
// a scaled-down asymmetric one).
const STATE_CLASSES = {
  selected: "border-accent-project bg-subtle-gray text-accent-project",
  default: "border-muted-gray bg-transparent text-muted-gray hover:border-deep-black hover:text-deep-black",
} as const;

export function SelectTab({
  ref,
  label,
  selected,
  onClick,
  onKeyDown,
  id,
  controls,
  tabIndex,
}: {
  ref?: Ref<HTMLButtonElement>;
  label: string;
  selected: boolean;
  onClick: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  id: string;
  controls: string;
  tabIndex: 0 | -1;
}) {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`rounded-btn border px-btn-y py-sm text-mono-mobile font-mono uppercase transition-colors duration-200 ease-standard tablet:px-md tablet:text-mono-caption ${STATE_CLASSES[selected ? "selected" : "default"]}`}
    >
      {label}
    </button>
  );
}
