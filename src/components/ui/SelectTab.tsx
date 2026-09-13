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
const STATE_CLASSES = {
  selected: "border-accent-project bg-subtle-gray text-accent-project",
  default: "border-muted-gray bg-transparent text-muted-gray",
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
      className={`rounded-btn border px-md py-sm text-mono-caption font-mono uppercase transition-colors duration-200 ease-standard ${STATE_CLASSES[selected ? "selected" : "default"]}`}
    >
      {label}
    </button>
  );
}
