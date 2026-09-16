import type { StatusKind } from "@/components/ui/StatusPill";

// Single source for all nine projects. `PROJECTS` never shrinks — restoring
// a paused project means adding its case-study content file and nothing
// else here. Every UI surface (WORK nav dropdown, footer link column,
// generateStaticParams, NEXT PROJECT wrap) actually renders `LIVE_PROJECTS`
// — the subset with a finished case study — which lives in
// `content/liveProjects.ts`, not here: that file imports CASE_STUDIES
// (~50KB of case-study prose), and this module is imported by Nav.tsx and
// Footer.tsx, client components in the root layout. Re-exporting the
// derived list from here was measured to leak that ~50KB into the shared
// client bundle on every page; keeping the two files separate keeps this
// module (and everything that imports it) case-study-content-free.
//
// `name` and `footerLabel` are deliberately different strings per project,
// not a casing transform of one another (e.g. "JPMORGAN CHASE" vs "Chase",
// "HOMEWORK" vs "hoMEwork") — both are rendered verbatim, with no
// text-transform applied by any consumer.
//
// `href` is `/work/${slug}` on every entry. A slug with no entry in
// CASE_STUDIES is filtered out of LIVE_PROJECTS and 404s at
// work/[slug]/page.tsx rather than rendering a stub — see that file's own
// comment.
export type Project = {
  slug: string;
  number: string; // '01'..'09', matches array order
  name: string; // card heading + nav dropdown label, verbatim
  // Session R3.1: the phone project card's own short form (931:4274,
  // 988:7340–7346) — Figma genuinely shortens the title on two of four
  // projects so the row holds on one line ("google geminicut" -> just
  // "geminicut"; "uc san diego bfs blink" -> just "blink"), not a
  // truncation rule applied uniformly. F3Global and Chase are unchanged at
  // phone width, so they omit this and ProjectCardPhone falls back to
  // `name`. Every other surface (nav dropdown, footer, tablet/desktop
  // cards, case study) keeps reading `name` — this is phone-card-only.
  shortName?: string;
  footerLabel: string; // footer column label, verbatim
  href: string;
  featured: boolean;
  status?: {
    label: string;
    // Session R3: the phone project card's own short form (931:4274,
    // 988:7340/988:7226) — Figma shows "LIVE"/"NDA" there where every
    // other size (including the tablet card, 931:4275) keeps the full
    // "LIVE SITE"/"NDA-PROTECTED". Optional: GeminiCut and Blink's labels
    // don't shorten at phone width, so they omit this and StatusPill falls
    // back to `label` for them.
    shortLabel?: string;
    kind: StatusKind;
    href?: string;
  };
  role?: string;
  timeline?: string;
  type?: string;
  // Session R3.1: the phone card's own short form of `type`, same reasoning
  // as `shortName` above — Figma shortens GeminiCut's ("ai-native video
  // editing tool" -> "ai video editing tool") and Blink's ("accessibility &
  // systems design" -> "systems design") so the row fits on one line.
  // F3Global and Chase are unchanged, so they omit this.
  shortType?: string;
  // Case study metadata panel only (info/panel, 736:6049–758:6788): two more
  // rows Figma shows beyond role/timeline/type. Verbatim, all-caps, rendered
  // with no text-transform, same as every other field on this record.
  tools?: string; // "FIGMA, DESIGN SYSTEMS, USABILITY AUDITING, …"
  team?: string; // "3 DESIGNERS, 9 DEVELOPERS, 1 ENGINEERING MANAGER, 1 PROJECT MANAGER"
  // Case study accent (Accent/F3Global etc., one Figma variable per project) —
  // set on the case-study root wrapper as --color-accent-project. Distinct
  // from `color`, the card's solid background fallback.
  accent?: string;
  color?: string; // fallback shown behind `gradient` before it loads
  gradient?: string; // path in public/projects/gradients/ — the home card's own background image
  // Case-study text-gradient fill (Statement.tsx, StatValue.tsx's
  // --gradient-project), a full CSS `background-image` value — either
  // `url(...)` or a gradient function. Distinct from `gradient` above:
  // Figma's Accent/<Project> Gradient (the case-study text fill) and the
  // home card's own gradient image are two different assets that only
  // looked like one field because F3Global's case study happened to reuse
  // its card image. Chase's case-study accent is a real CSS linear-gradient
  // paint, which `gradient` (typed as an image path, always wrapped in
  // url(...) by work/[slug]/page.tsx) can't hold. Omitted = fall back to
  // `url("${gradient}")`, so F3Global is unaffected.
  caseStudyGradient?: string;
  thumbnail?: string;
  video?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "f3global",
    number: "01",
    name: "F3GLOBAL",
    footerLabel: "F3Global",
    href: "/work/f3global",
    featured: true,
    status: { label: "LIVE SITE", shortLabel: "LIVE", kind: "live", href: "https://f3-global.org/" },
    role: "DESIGN LEAD",
    timeline: "8 MOS",
    type: "WEBSITE & ADMIN PORTAL",
    tools: "FIGMA, DESIGN SYSTEMS, USABILITY AUDITING, USER TESTING, RESPONSIVE DESIGN, AI-ASSISTED WORKFLOWS",
    team: "3 DESIGNERS, 9 DEVELOPERS, 1 ENGINEERING MANAGER, 1 PROJECT MANAGER",
    accent: "#4839cd",
    color: "var(--color-project-f3global)",
    gradient: "/projects/gradients/gradient-f3global.png",
    thumbnail: "/projects/f3global.jpg",
    video: "/projects/f3global.mp4",
  },
  {
    slug: "chase",
    number: "02",
    name: "JPMORGAN CHASE",
    footerLabel: "Chase",
    href: "/work/chase",
    featured: true,
    status: { label: "NDA-PROTECTED", shortLabel: "NDA", kind: "nda" },
    role: "UX DESIGN & RESEARCH INTERN",
    timeline: "10 WKS",
    type: "ENTERPRISE DATA PLATFORM",
    tools: "FIGMA, USER RESEARCH, WORKSHOP FACILITATION, AI-ASSISTED WORKFLOW",
    team: "3 UX INTERNS & CROSS-FUNCTIONAL PARTNERS",
    accent: "#127b89",
    color: "var(--color-project-chase)",
    gradient: "/projects/gradients/gradient-chase.png",
    // Accent/Chase Gradient (736:6375), re-read after this project's own
    // second edit (colors only) — a real CSS gradient paint, not an image
    // fill (see Project.caseStudyGradient's own comment). Distinct from
    // gradient-chase.png above, which is a separate, unedited asset (the
    // home/Work card background, 441:5989).
    caseStudyGradient: "linear-gradient(180deg, #1e8694 0%, #0199ae 43.75%, #249fb5 88.942%)",
    thumbnail: "/projects/chase.jpg",
  },
  {
    slug: "geminicut",
    number: "03",
    name: "GOOGLE GEMINICUT",
    shortName: "GEMINICUT",
    footerLabel: "GeminiCut",
    href: "/work/geminicut",
    featured: true,
    status: {
      label: "PROTOTYPE",
      kind: "prototype",
      // Corrected — the value previously here pointed at a different Figma
      // file entirely ("-tse-A3", TSE's own prototype). This is GeminiCut's
      // own interactive prototype link.
      href: "https://www.figma.com/proto/8K2eCn2HJYQWrviJCMoqBg/Google-GeminiCut?node-id=828-3656&p=f&viewport=2500%2C-599%2C0.23&t=hExa2Wjx80WifhbA-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=828%3A3656&show-proto-sidebar=1&page-id=828%3A3653",
    },
    role: "UX DESIGNER & RESEARCHER",
    timeline: "2 MOS",
    type: "AI-NATIVE VIDEO EDITING TOOL",
    shortType: "AI VIDEO EDITING TOOL",
    // Case study metadata panel (794:2389, re-read fresh this session) —
    // GeminiCut's own tools/skills and team rows, beyond role/timeline/type.
    tools: "FIGMA, USER RESEARCH, AI-ASSISTED WORKFLOWS, FIGMA MAKE",
    team: "5 UX DESIGNERS AND RESEARCHERS",
    // Accent/Gemini (767:7271), re-read after this session's own contrast
    // fix — you edited it in Figma from #2E6FD6 to #2A64C4 so the tab label
    // (16px JetBrains Mono) clears AA-normal against both porcelain and the
    // selected tab's subtle-gray fill (5.63:1 / 5.04:1 — see gemini.ts's own
    // contrast note for the full readout).
    accent: "#2a64c4",
    color: "var(--color-project-geminicut)",
    gradient: "/projects/gradients/gradient-geminicut.png",
    // Accent/Gemini Gradient (879:3322), re-read after the same session's
    // contrast fix — the 30% stop moved from #6EA6FA (2.46:1, failing even
    // the 3:1 large-text floor) to #2B5798 (7.17:1). A real CSS gradient
    // paint, not an image fill — see Project.caseStudyGradient's own
    // comment for why that's a distinct field from `gradient` above.
    caseStudyGradient:
      "linear-gradient(90deg, #357CEA 0%, #2B5798 30.288%, #4B77BB 66.827%, #357CEA 100%)",
    thumbnail: "/projects/geminicut.jpg",
    video: "/projects/geminicut.mp4",
  },
  {
    slug: "blink",
    number: "04",
    name: "UC SAN DIEGO BFS BLINK",
    shortName: "BLINK",
    footerLabel: "Blink",
    href: "/work/blink",
    featured: true,
    status: { label: "SHIPPED", kind: "shipped" },
    role: "UX DESIGNER & AI SPECIALIST",
    timeline: "2 YRS",
    type: "ACCESSIBILITY & SYSTEMS DESIGN",
    shortType: "SYSTEMS DESIGN",
    // Case study metadata panel (808:2739/808:2742, re-read fresh this
    // session) — the file's own tools string ends in a trailing period
    // ("...Generative AI."); every other project's has none, so it's
    // dropped here for consistency (content/case-studies/blink.ts's own
    // header comment records the same correction).
    tools: "FIGMA, SITEIMPROVE, WCAG 2.1 AA, PYTHON, CLAUDE CODE, GENERATIVE AI",
    team: "SOLO OWNERSHIP WITHIN CROSS-FUNCTIONAL DEPARTMENT",
    // Accent/Blink (808:2754) — 5.82:1 on porcelain, clears AA-normal.
    accent: "#147169",
    color: "var(--color-project-blink)",
    gradient: "/projects/gradients/gradient-blink.png",
    // Accent/Blink Gradient (808:2788), re-read after you fixed its
    // contrast in Figma this session — a real CSS gradient paint, not an
    // image fill (see caseStudyGradient's own comment). Original/edited
    // readout on porcelain #FEFFFD: #0E878E 4.29 (unchanged) / #4DAFA1 2.63
    // -> #48A396 3.01 / #57B6B0 2.40 -> #4DA29D 3.00 / #20BC92 2.41 ->
    // #1CA782 3.03 — every stop now clears the 3:1 large-text floor this
    // gradient needs (it paints section headings, hooks, and 100px stat
    // numerals, all large text).
    caseStudyGradient:
      "linear-gradient(90deg, #0E878E 0%, #48A396 35.096%, #4DA29D 64.423%, #1CA782 100%)",
    thumbnail: "/projects/blink.jpg",
  },
  {
    slug: "anatole-quartet",
    number: "05",
    name: "ANATOLE QUARTET",
    footerLabel: "Anatole Quartet",
    href: "/work/anatole-quartet",
    featured: false,
  },
  {
    slug: "tse",
    number: "06",
    name: "TSE",
    footerLabel: "TSE",
    href: "/work/tse",
    featured: false,
  },
  {
    slug: "homework",
    number: "07",
    name: "HOMEWORK",
    footerLabel: "hoMEwork",
    href: "/work/homework",
    featured: false,
  },
  {
    slug: "kindsight",
    number: "08",
    name: "KINDSIGHT",
    footerLabel: "KindSight",
    href: "/work/kindsight",
    featured: false,
  },
  {
    slug: "ucproject",
    number: "09",
    name: "URBAN COLLABORATIVE PROJECT",
    footerLabel: "UCProject",
    href: "/work/ucproject",
    featured: false,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((project) => project.featured);
