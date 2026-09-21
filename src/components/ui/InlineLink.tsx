import Link from "next/link";
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
//
// An `href` starting with "/" is an internal route (e.g. a bio line pointing
// at its own case study) and renders through next/link, matching every
// other internal link on the site (Button.tsx, Nav, Footer) — a plain <a>
// would force a full page reload and skip PageTransitionProvider /
// SmoothScroll's route-change handling. Every other href (the common case
// for this component — About body copy, case-study segments) stays a plain
// <a>, unchanged.
export function InlineLink({
  children,
  className,
  href,
  ...rest
}: { children: ReactNode; className?: string; href: string } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  const classes = `text-accent-blue-light transition-colors duration-200 ease-standard hover:text-accent-blue ${className ?? ""}`;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
