import type { ReactNode } from "react";

// The Gambarino display treatment used for page titles other than the
// homepage wordmark (Wordmark.tsx, which owns its own per-letter load
// animation and is not reused here — see CLAUDE.md "Wordmark"). Static:
// no flip, no reveal. Built as its own component now, ahead of any page
// using it a second time, so session 6 (page transitions) can make it the
// FlipText target without touching callers.
//
// Figma "about." (523:6571): same Gambarino 104/0.8/0 treatment as the
// homepage wordmark, but --color-dark-gray rather than --color-ink — a
// deliberately different color for a secondary page title, not a copy
// error.
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-display font-display text-center text-dark-gray">
      {children}
    </h1>
  );
}
