import type { FlipTextSource } from "./FlipText";

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

// Fix pass (item 5): resolves what FlipText's `from` prop should be for a
// given mount, given `usePreviousRoute()` and this destination's OWN color
// token. Both Wordmark.tsx and PageTitle.tsx used to inline this as an
// identical two-line expression; centralizing it here is what lets the
// third case below apply to both without touching FlipText itself.
//
// - `previousRoute === null` (a hard load): returns null. This is the LOAD
//   sequence's own case for Home (see useLoadSequence.ts's `play` gate) —
//   About has no load sequence of its own to defer to, so its title also
//   renders statically on a hard load, same as before this fix.
// - `previousRoute` IS a PAGE_TITLES entry (Home <-> About, either
//   direction): the existing known-source flip, byte-identical to before —
//   returns that route's own recorded title.
// - `previousRoute` is a client-side arrival from anywhere else (a case
//   study, or any future non-participating route): this used to fall
//   through to null and render statically, even though the destination IS
//   a PAGE_TITLES route. Now returns an empty-text source instead — the
//   existing FlipText mechanic runs unmodified with nothing to flip OUT
//   (`splitChars("")` is `[]`), so the destination flips in from nothing.
//   `destColorVar` doubles as the synthetic source color: the color tween
//   then runs from the destination's own token to itself, which is the
//   correct read when there is no departing title's color to start from —
//   and it means this branch needs no special case in FlipText.tsx at all.
export function flipSourceFor(
  previousRoute: string | null,
  destColorVar: string,
): FlipTextSource | null {
  if (previousRoute === null) return null;
  if (isPageTitleRoute(previousRoute)) return PAGE_TITLES[previousRoute];
  return { text: "", colorVar: destColorVar };
}
