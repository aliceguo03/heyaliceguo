// Page transition (CLAUDE.md "FlipText" — Home ⇄ About). The single source
// of truth for which routes participate: a route absent from this map is a
// non-participant, and that absence IS the opt-out mechanism for every
// other route on the site (case studies, any future route) — no flag, no
// `inert`, no per-page prop needed. See FlipText.tsx / Wordmark.tsx /
// PageTitle.tsx, all of which resolve `from` against this map rather than
// hardcoding either string a second time.
export const PAGE_TITLES = {
  "/": { text: "alice guo.", colorVar: "--color-ink" },
  "/about": { text: "about.", colorVar: "--color-dark-gray" },
} as const;

export type PageTitleRoute = keyof typeof PAGE_TITLES;

export function isPageTitleRoute(pathname: string): pathname is PageTitleRoute {
  return pathname in PAGE_TITLES;
}
