"use client";

import { FlipText } from "@/components/motion/FlipText";
import { usePreviousRoute } from "@/components/motion/PageTransitionProvider";
import { PAGE_TITLES, flipSourceFor } from "@/components/motion/pageTransition";

// The Gambarino display treatment used for page titles other than the
// homepage wordmark (Wordmark.tsx, which owns its own per-letter load
// animation and renders through FlipText separately — see CLAUDE.md
// "Wordmark" and "FlipText"). Built as its own component ahead of any page
// using it a second time, specifically so it could become the FlipText
// target without touching callers — this is that session.
//
// `children` is now `string`, not `ReactNode`: FlipText needs the literal
// text to flip character-by-character, and the same string doubles as the
// <h1>'s aria-label (a role-less span can't reliably expose aria-label
// itself — see FlipText.tsx fix #4). AboutHero's only call site already
// passes a string literal ("about."), so this is a type tightening, not a
// behavior change for it.
//
// Figma "about." (523:6571): same Gambarino 104/0.8/0 treatment as the
// homepage wordmark, but --color-dark-gray rather than --color-ink — a
// deliberately different color for a secondary page title, not a copy
// error. That color is this component's own fixed destination token
// (colorVar below) — unrelated to whichever route the flip is arriving
// from, which supplies its own source color via `from`.
export function PageTitle({ children }: { children: string }) {
  // null only on a hard load (previousRoute === null) — there's no load
  // sequence on this page to defer to (unlike Wordmark's Home), so a hard
  // load still renders `children` as a plain, unanimated text node. Every
  // OTHER client-side arrival now flips, not just from "/": a known
  // PAGE_TITLES source (currently just that route) flips from its own
  // recorded title, and any other route (a case study, or any future
  // non-participant) flips in from nothing — see flipSourceFor's own
  // comment (pageTransition.ts).
  const previousRoute = usePreviousRoute();
  const from = flipSourceFor(previousRoute, PAGE_TITLES["/about"].colorVar);

  return (
    <h1 aria-label={children} className="text-display font-display text-center text-dark-gray">
      <FlipText text={children} colorVar={PAGE_TITLES["/about"].colorVar} from={from} />
    </h1>
  );
}
