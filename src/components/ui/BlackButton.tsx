import Link from "next/link";
import type { ReactNode } from "react";

// Figma "black button" component (380:1978/380:1977). Distinct from
// ui/Button.tsx (the "view my work button", 328:310) — different height,
// padding, and no arrow glyph. Reused wherever a case-study CTA appears,
// including the "all projects" button row (441:5996), so it lives in ui/.
const BUTTON_HEIGHT = "62px";

export function BlackButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{ height: BUTTON_HEIGHT }}
      className="inline-flex items-center justify-center rounded-btn bg-ink px-lg py-sm text-mono font-mono text-pure-white transition-colors duration-200 ease-standard hover:bg-ink/85"
    >
      {children}
    </Link>
  );
}
