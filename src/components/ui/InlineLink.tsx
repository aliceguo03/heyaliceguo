import type { AnchorHTMLAttributes, ReactNode } from "react";

// Sitewide inline text link (Figma "any link", 694:5286, variants regular /
// hover) — built here rather than as an About-page detail, since it's meant
// to be reused wherever prose needs a link (case studies included).
//
// Color-only: sets color and its transition and nothing else. Font family,
// size, weight, and line-height all come from the surrounding context —
// Figma shows this at Satoshi 24/32 because that's the About body size, but
// this same component gets used at other sizes and weights elsewhere, so it
// must not hardcode type.
//
// No underline in either Figma variant — checked both states in the file.
//
// Resting/hover map to existing tokens, not new ones. Figma's own variable
// names are inverted relative to their values (Accent/Blue Dark #70C8FF is
// visually lighter than Accent/Blue Light #118EDC) — a known data-integrity
// issue in the file, mirroring the existing Background/Porcelain
// discrepancy. Taking the values as specified, not the names:
//   resting #118EDC -> --color-accent-blue-light
//   hover   #70C8FF -> --color-accent-blue
//
// Focus-visible: intentionally adds nothing of its own. globals.css already
// applies a global 2px solid outline (--color-deep-black, 3px offset) to
// every :focus-visible, explicitly marked "Do not remove" — inventing a
// link-specific ring here would be design that isn't in the file.
export function InlineLink({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`text-accent-blue-light transition-colors duration-200 ease-standard hover:text-accent-blue ${className ?? ""}`}
      {...rest}
    >
      {children}
    </a>
  );
}
