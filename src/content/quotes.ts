// Footer rotating quotes (CLAUDE.md "Footer quote"). Unattributed in the
// UI — attribution kept only in these comments for future reference, some
// of them not fully certain (flagged inline where that's the case).
//
// Stored ALL CAPS, literally, like every other capitalized label on this
// site (SectionLabel's "SELECTED WORK.", about.ts's `header`, projects.ts —
// CLAUDE.md rule 9) — never a CSS text-transform.
//
// Each quote is a single unbroken string, not pre-broken lines: the footer
// wraps it naturally within --container-footer-quote (globals.css, 660px),
// so a quote renders in however few lines actually fit the current width
// and only grows to more as the footer narrows. This gives up manual
// control over exactly where a quote breaks — the browser wraps at
// whatever word boundary fits, not necessarily the rhetorical pause an
// earlier, pre-broken-lines version of this file chose (the Vuong quote in
// particular could land mid-clause at some in-between widths). Confirmed
// as an acceptable trade before this file was rewritten this way — see the
// session that made this change for the alternative that was rejected.
export type Quote = string;

// Renders statically in the initial markup on a hard load — identical on
// server and client, so no client-only effect or null-initial state is
// needed for this specific render (unlike the random picks below, which
// only exist once the user actually navigates). useFooterQuote.ts's
// `useState` initializer reads this directly.
//
// Kept in the TIER_1 pool (not retired after first load) so it isn't lost
// from rotation entirely once a visitor starts navigating.
export const DEFAULT_QUOTE: Quote = "A DESIGNER IS A PLANNER WITH AN AESTHETIC SENSE."; // attribution not confirmed

// Unlocked at nav-depth 1+ (useFooterQuote.ts). Always in the pool above
// that.
export const TIER_1: readonly Quote[] = [
  DEFAULT_QUOTE,
  "DESIGN IS WHERE SCIENCE AND ART BREAK EVEN.", // Robin Mathew — attribution not fully certain
  "SIMPLICITY, CARRIED TO AN EXTREME, BECOMES ELEGANCE.", // Jon Franklin
  "EACH COLOR LIVES BY ITS MYSTERIOUS LIFE.", // Wassily Kandinsky
  "A LINE IS A DOT THAT WENT FOR A WALK.", // Paul Klee
  "HAVE NOTHING IN YOUR HOUSES THAT YOU DO NOT KNOW TO BE USEFUL, OR BELIEVE TO BE BEAUTIFUL.", // William Morris
  "I WAS WITHIN AND WITHOUT, SIMULTANEOUSLY ENCHANTED AND REPELLED BY THE INEXHAUSTIBLE VARIETY OF LIFE.", // F. Scott Fitzgerald, The Great Gatsby
  "A GREAT ARTIST'S WORK IS NEVER FINISHED, ONLY ABANDONED.", // attributed to both Leonardo da Vinci and Paul Valéry
  "THE ESSENCE OF THE BEAUTIFUL IS UNITY IN VARIETY.", // Felix Mendelssohn
];

// Unlocked at nav-depth 6+. TIER_1 stays in the pool alongside this.
export const TIER_2: readonly Quote[] = [
  "DON'T ONLY PRACTICE YOUR ART, BUT FORCE YOUR WAY INTO ITS SECRETS.", // Ludwig van Beethoven
  "MUSIC IS ENOUGH FOR A LIFETIME, BUT A LIFETIME IS NOT ENOUGH FOR MUSIC.", // Sergei Rachmaninoff
  "A CREATIVE ARTIST WORKS ON HIS NEXT COMPOSITION BECAUSE HE WAS NOT SATISFIED WITH HIS PREVIOUS ONE.", // Dmitri Shostakovich
  "IS THAT WHAT ART IS? TO BE TOUCHED THINKING WHAT WE FEEL IS OURS WHEN, IN THE END, IT WAS SOMEONE ELSE, IN LONGING, WHO FINDS US?", // Ocean Vuong
  "DUCT TAPE IS MAGIC AND SHOULD BE WORSHIPPED.", // Mark Watney, The Martian (Andy Weir)
];

// Unlocked at nav-depth 16+. TIER_1 and TIER_2 stay in the pool alongside
// this.
export const TIER_3: readonly Quote[] = [
  "THEY SAY NO PLAN SURVIVES FIRST CONTACT WITH IMPLEMENTATION.", // Mark Watney, The Martian (Andy Weir)
  "MELODIES GREW UP IN MY HEAD AS IF I WERE BEWITCHED.", // Sergei Rachmaninoff, on the Second Piano Concerto
  "THEY SAY THE EARTH SPINS AND THAT'S WHY WE FALL BUT EVERYONE KNOWS IT'S THE MUSIC.", // Ocean Vuong
];

const TIER_2_FLOOR = 6;
const TIER_3_FLOOR = 16;

// navCount is 1-indexed nav-depth (useFooterQuote.ts) — the number of
// client-side navigations made so far this session, never decremented.
export function quotePoolFor(navCount: number): readonly Quote[] {
  if (navCount >= TIER_3_FLOOR) return [...TIER_1, ...TIER_2, ...TIER_3];
  if (navCount >= TIER_2_FLOOR) return [...TIER_1, ...TIER_2];
  return TIER_1;
}
