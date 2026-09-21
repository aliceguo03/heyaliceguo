// Pure line-fitting logic for the footer's rotating quote (CLAUDE.md
// "Footer quote"). No DOM here except through the injected `measure`
// function — same split as projectGeometry.ts/aboutGeometry.ts (pure
// geometry math) vs. their `use*` hook counterparts (the DOM/React wiring).
//
// Why this exists instead of plain CSS wrap: the reload button sits beside
// line 1 only, so line 1 needs a NARROWER width budget than every line
// below it — CSS has no way to express "this box's first line is narrower
// than the rest" without float/shape-outside gymnastics, and even with
// those, there's no CSS mechanism for "never leave a single orphaned word
// on the last line." `text-wrap: pretty` addresses orphans in some
// browsers, but isn't universal — silently reverting to plain wrap (orphan
// included) in an unsupported browser isn't acceptable for something this
// small and static. Measuring and computing real line breaks in JS makes
// the result the same everywhere, matching how the About page already
// measures real rendered block heights (useAboutPin.ts) rather than
// assuming CSS will land where expected.

// Real character widths (font metrics, kerning, the 0.06em JetBrains Mono
// tracking) can't be predicted from a formula — this takes a measure
// function instead of reimplementing font shaping. See
// useFooterQuoteLayout.ts's `createMeasurer` for the real, DOM-probe-backed
// implementation; tests can inject a synthetic one.
export type Measure = (text: string) => number;

export interface FitBudgets {
  // Line 1's own budget — narrower than the rest to leave room for the
  // reload button beside it. Computed by the caller as
  // `fullLineWidth - buttonWidth - minimumGap` (useFooterQuoteLayout.ts).
  firstLineWidth: number;
  // Every line after the first gets the row's full available width — only
  // line 1 shares its row with the button.
  fullLineWidth: number;
  measure: Measure;
}

function budgetForLine(lineIndex: number, budgets: FitBudgets): number {
  return lineIndex === 0 ? budgets.firstLineWidth : budgets.fullLineWidth;
}

// Greedy word-wrap against a PER-LINE budget (not one flat width), plus a
// final orphan-control pass. `decoratedQuote` already carries its curly
// quote marks (Footer.tsx wraps the raw quote before calling this) — they
// glue to the first/last word with no space, so splitting on spaces keeps
// them attached to whichever word ends up first/last even after
// rebalancing.
export function fitQuoteLines(decoratedQuote: string, budgets: FitBudgets): string[] {
  const words = decoratedQuote.split(" ").filter(Boolean);
  if (words.length === 0) return [decoratedQuote];

  const lines: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    const candidate = current.length === 0 ? word : `${current.join(" ")} ${word}`;
    // current.length === 0: always place at least one word on a line, even
    // if it alone exceeds the budget — never drop a word, never split one.
    if (current.length === 0 || budgets.measure(candidate) <= budgetForLine(lines.length, budgets)) {
      current.push(word);
    } else {
      lines.push(current.join(" "));
      current = [word];
    }
  }
  if (current.length > 0) lines.push(current.join(" "));

  // Orphan control: a lone final word reads as abandoned (CLAUDE.md's own
  // worked example — "...OR BELIEVE TO / BE BEAUTIFUL." not "...OR BELIEVE
  // TO BE / BEAUTIFUL."). Pull the previous line's last word down, but only
  // if the rebalanced last line still fits ITS OWN budget (which could
  // still be the reduced line-1 budget, if the whole quote is short enough
  // that line 1 is also the second-to-last line) — if it doesn't fit,
  // leave the orphan rather than force an overflow.
  if (lines.length > 1) {
    const lastIndex = lines.length - 1;
    const lastLineWords = lines[lastIndex].split(" ");
    if (lastLineWords.length === 1) {
      const prevIndex = lastIndex - 1;
      const prevWords = lines[prevIndex].split(" ");
      if (prevWords.length > 1) {
        const movedWord = prevWords[prevWords.length - 1];
        const rebalancedLast = `${movedWord} ${lines[lastIndex]}`;
        if (budgets.measure(rebalancedLast) <= budgetForLine(lastIndex, budgets)) {
          lines[prevIndex] = prevWords.slice(0, -1).join(" ");
          lines[lastIndex] = rebalancedLast;
        }
      }
    }
  }

  return lines;
}
