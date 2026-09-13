import type { StatusKind } from "@/components/ui/StatusPill";

// Single source for all nine projects. Feeds three consumers: the homepage
// (FEATURED_PROJECTS, four cards), the WORK nav dropdown (all nine, `name`),
// and the footer link columns (all nine, `footerLabel`). Only the four
// featured projects have case-study data — role/timeline/type/color/media —
// since the other five have no case-study page yet.
//
// `name` and `footerLabel` are deliberately different strings per project,
// not a casing transform of one another (e.g. "JPMORGAN CHASE" vs "Chase",
// "HOMEWORK" vs "hoMEwork") — both are rendered verbatim, with no
// text-transform applied by any consumer.
//
// `href` is `/work/${slug}` on every entry (the `/work/[slug]` route now
// exists — build step 9 landed with F3Global and Chase). A slug with no
// case-study entry in CASE_STUDIES still resolves: work/[slug]/page.tsx
// renders the CLAUDE.md stub (title only) for it. Stored rather than
// computed at each call site since it's read verbatim by both Nav's WORK
// dropdown and Footer's project columns.
export type Project = {
  slug: string;
  number: string; // '01'..'09', matches array order
  name: string; // card heading + nav dropdown label, verbatim
  footerLabel: string; // footer column label, verbatim
  href: string;
  featured: boolean;
  status?: {
    label: string;
    kind: StatusKind;
    href?: string;
  };
  role?: string;
  timeline?: string;
  type?: string;
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
    status: { label: "LIVE SITE", kind: "live", href: "https://f3-global.org/" },
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
    status: { label: "NDA-PROTECTED", kind: "nda" },
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
    footerLabel: "Blink",
    href: "/work/blink",
    featured: true,
    status: { label: "SHIPPED", kind: "shipped" },
    role: "UX DESIGNER & AI SPECIALIST",
    timeline: "2 YRS",
    type: "ACCESSIBILITY & SYSTEMS DESIGN",
    color: "var(--color-project-blink)",
    gradient: "/projects/gradients/gradient-blink.png",
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
