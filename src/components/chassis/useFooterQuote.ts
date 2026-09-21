"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_QUOTE, type Quote, quotePoolFor } from "@/content/quotes";

// Module-scope nav-depth counter — the same pattern and SSR-safety
// reasoning as useLoadSequence.ts's `hasPlayed` flag. CLAUDE.md hard rule 6
// forbids sessionStorage/localStorage outright; this is not a workaround
// for that rule, it's a different, allowed mechanism (a plain in-memory
// module variable, written only from an effect, never during render — see
// useLoadSequence.ts's own comment for why a render-time write here would
// leak across server requests in a long-lived Node process).
//
// A hard reload re-evaluates this module and resets to 0 — the tiers are a
// per-session progression through *client-side* navigation, not a
// permanent unlock, which is what CLAUDE.md's "incremented once per
// client-side route change (not per reload)" already describes.
let navDepth = 0;

function pick(pool: readonly Quote[], last: Quote | null): Quote {
  const options = pool.length > 1 && last ? pool.filter((q) => q !== last) : pool;
  return options[Math.floor(Math.random() * options.length)];
}

// Desktop footer's rotating quote (CLAUDE.md "Footer quote"). DEFAULT_QUOTE
// renders on a hard load: it's a fixed string, identical on server and
// client, so it's the `useState` initializer directly — no client-only
// effect, no null-initial state, no flash-avoidance mechanism needed for
// THIS render specifically (unlike the clock's useSanDiegoTime, which this
// hook used to mirror for exactly that reason). Random selection only
// takes over from the first client-side navigation onward.
export function useFooterQuote() {
  const pathname = usePathname();
  const [quote, setQuote] = useState<Quote>(DEFAULT_QUOTE);
  // Read only from effects/handlers below, never during render — this
  // project's React Compiler rejects reading a ref's .current mid-render
  // (react-hooks/refs), same constraint PageTransitionProvider.tsx's own
  // comment documents.
  const lastQuote = useRef<Quote>(DEFAULT_QUOTE);
  // The last pathname this hook actually processed — null until the very
  // first effect run. NOT reverted by a cleanup; see the effect's own
  // comment for why an undo-in-cleanup approach doesn't work here.
  const lastProcessedPathname = useRef<string | null>(null);

  useEffect(() => {
    // Next's default reactStrictMode double-invokes an effect on the
    // component's very first mount in dev only (mount -> cleanup -> mount
    // again) to catch missing-cleanup bugs — caught here, not assumed, by
    // scripts/verify-footer-quote.mjs's forced-Math.random check landing on
    // the wrong quote. An earlier version of this effect tried to fix that
    // by capturing pre-effect values and restoring them in a cleanup
    // function — which is exactly the wrong tool: React calls an effect's
    // cleanup before EVERY re-run, real navigations included, not only
    // before StrictMode's synthetic remount. That made every real
    // navigation immediately undo its own increment and its own quote pick
    // a moment after making it, permanently freezing navDepth at 0 for the
    // rest of the session — caught by pinning Math.random to a constant and
    // finding the identical quote survive repeated real navigations (a real
    // bug, present in production too, not a StrictMode-only artifact — see
    // git history for that version).
    //
    // The fix that's actually safe against an unknown number of duplicate
    // invocations for the same pathname: skip entirely if this pathname has
    // already been processed, and don't revert that fact in cleanup. A
    // second invocation for the SAME pathname (StrictMode's synthetic
    // remount, or anything else) reads its own past invocation's result and
    // no-ops; a real navigation's pathname always differs from whatever was
    // last processed, so it's never skipped.
    if (lastProcessedPathname.current === pathname) return;

    const isVeryFirstMount = lastProcessedPathname.current === null;
    lastProcessedPathname.current = pathname;

    if (isVeryFirstMount) {
      // DEFAULT_QUOTE is already rendered (the useState initializer above)
      // and already sitting in lastQuote.current (its own initializer) —
      // this mount just needed to record the pathname so the first REAL
      // navigation below correctly treats itself as "not the first" and
      // increments navDepth. No pick, no setQuote: touching either here
      // would replace the deterministic first-paint quote with a random
      // one before the user ever navigates, which is exactly what fix #1
      // says not to do.
      return;
    }

    navDepth += 1;
    const next = pick(quotePoolFor(navDepth), lastQuote.current);
    lastQuote.current = next;
    setQuote(next);
  }, [pathname]);

  function reroll() {
    // Rerolls within the CURRENT pool only (whatever navDepth already is)
    // and never advances navDepth itself — a reroll is not a navigation.
    // Usable immediately, even before the first navigation (navDepth 0,
    // TIER_1 only) — only the automatic pick-on-navigation is gated to
    // "after the first load," not the reroll control.
    const next = pick(quotePoolFor(navDepth), lastQuote.current);
    lastQuote.current = next;
    setQuote(next);
  }

  return { quote, reroll };
}
