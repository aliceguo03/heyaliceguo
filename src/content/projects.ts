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
// `href` is "/work" on every entry, including the featured four: no
// `/work/[slug]` route exists until build step 9. Case-study links become
// `/work/${slug}` once that route lands.
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
  color?: string; // fallback shown behind `gradient` before it loads
  gradient?: string; // path in public/projects/gradients/
  thumbnail?: string;
  video?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "f3global",
    number: "01",
    name: "F3GLOBAL",
    footerLabel: "F3Global",
    href: "/work",
    featured: true,
    status: { label: "LIVE SITE", kind: "live", href: "https://f3-global.org/" },
    role: "DESIGN LEAD",
    timeline: "8 MOS",
    type: "WEBSITE & ADMIN PORTAL",
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
    href: "/work",
    featured: true,
    status: { label: "NDA-PROTECTED", kind: "nda" },
    role: "UX DESIGN & RESEARCH INTERN",
    timeline: "10 WKS",
    type: "ENTERPRISE DATA PLATFORM",
    color: "var(--color-project-chase)",
    gradient: "/projects/gradients/gradient-chase.png",
    thumbnail: "/projects/chase.jpg",
  },
  {
    slug: "geminicut",
    number: "03",
    name: "GOOGLE GEMINICUT",
    footerLabel: "GeminiCut",
    href: "/work",
    featured: true,
    status: {
      label: "PROTOTYPE",
      kind: "prototype",
      href: "https://www.figma.com/proto/2mlTyyDTO8oHp5pCC5Jn4x/-tse-A3?node-id=828-3656&viewport=1261%2C559%2C0.12&t=hGIuLTjfOFtPLRiE-9&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=828%3A3656&page-id=828%3A3653&show-proto-sidebar=1",
    },
    role: "UX DESIGNER & RESEARCHER",
    timeline: "2 MOS",
    type: "AI-NATIVE VIDEO EDITING TOOL",
    color: "var(--color-project-geminicut)",
    gradient: "/projects/gradients/gradient-geminicut.png",
    thumbnail: "/projects/geminicut.jpg",
    video: "/projects/geminicut.mp4",
  },
  {
    slug: "blink",
    number: "04",
    name: "UC SAN DIEGO BFS BLINK",
    footerLabel: "Blink",
    href: "/work",
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
    href: "/work",
    featured: false,
  },
  {
    slug: "tse",
    number: "06",
    name: "TSE",
    footerLabel: "TSE",
    href: "/work",
    featured: false,
  },
  {
    slug: "homework",
    number: "07",
    name: "HOMEWORK",
    footerLabel: "hoMEwork",
    href: "/work",
    featured: false,
  },
  {
    slug: "kindsight",
    number: "08",
    name: "KINDSIGHT",
    footerLabel: "KindSight",
    href: "/work",
    featured: false,
  },
  {
    slug: "ucproject",
    number: "09",
    name: "URBAN COLLABORATIVE PROJECT",
    footerLabel: "UCProject",
    href: "/work",
    featured: false,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((project) => project.featured);
