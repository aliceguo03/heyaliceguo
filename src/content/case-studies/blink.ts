import { STAT_W_WIDE } from "@/components/case-study/caseStudyGeometry";
import type { CaseStudy } from "./types";

// UC San Diego BFS Blink case study, transcribed verbatim from Figma node
// 808:2722 (page "final"), re-read fresh this session. The simplest case
// study so far — no video, no carousel, no credits block, and no live-site
// link (status is SHIPPED with no href).
//
// Two copy corrections, applied here only (Figma still has the originals —
// flagged for you, not fixed silently, per CLAUDE.md):
//   - the overview's transition paragraph reads "come from from the layers"
//     in the file (duplicated word) — one "from" here.
//   - the info panel's TOOLS & SKILLS value ends in a trailing period in the
//     file ("...Generative AI."); every other project's tools string has
//     none, so it's dropped here for consistency.
//
// This case study is also what motivated `proseFigure.figure` becoming
// optional (types.ts) — four content sections below are heading + paragraph
// with nothing else, unlike any block in F3Global/Chase/GeminiCut.
//
// Two other real, confirmed differences from every other project (Figma
// wins on measurement, per this session's own instruction):
//   - §01 and §04 each open with ONE proseFigure block, not a standalone
//     `statement` followed by a `proseFigure` — 808:2758 and 808:2802 are
//     both single 20px-gap auto-layouts (title row -> hook -> [prose] ->
//     figure); two sibling blocks would put CaseStudySection's 50px
//     between-block gap where Figma shows 20px.
//   - the stats block's columns are 425px (808:2790 etc.), not the 411
//     (STAT_W) every other project's node measures — confirmed as a real
//     difference, not the stale pre-correction value Chase's node once had.
//
// Asset filenames were matched by rendering every photo well in 808:2722
// against public/work/blink/*.jpg — all eight files are used exactly once;
// filename order carries no meaning. Alt text does not exist in Figma; all
// of it is written here, same as every other case study.
export const blink: CaseStudy = {
  slug: "blink",
  hero: {
    tagline: "SYSTEMATIZING ACCESSIBILITY AND UX AT ENTERPRISE SCALE.",
    // 692, not F3Global's full-width HERO_HEADER_W (929, 854:3153) — at 929
    // this tagline would break after "ENTERPRISE" instead of after "AT".
    // Same role as Chase's own titleWidth (620); this project's name line
    // ("UC SAN DIEGO BFS BLINK /") is far shorter than either width, so the
    // narrower column has no effect on it.
    titleWidth: 692,
    photos: [
      {
        src: "/work/blink/blink screenshot.jpg",
        alt: "A UC San Diego Blink page listing EITC eligibility bullet points beside a “Claiming Exemption from Withholding” section and a W-2 Statements FAQ.",
      },
      {
        src: "/work/blink/ucsd logo.jpg",
        alt: "The UC San Diego wordmark in white, underlined, centered on a solid navy background.",
      },
      {
        src: "/work/blink/html code.jpg",
        alt: "A dark-mode code editor showing HTML for an accessibility checklist, with details/summary blocks, styled headings, and a Tables section.",
      },
    ],
    // Round 2, item 2 (Alice's own choice): the phone well's default
    // (photos[0], a UI screenshot) reads less clearly at that size than
    // the UC San Diego wordmark — reused from the strip's own second
    // photo rather than duplicated.
    mobilePhoto: {
      src: "/work/blink/ucsd logo.jpg",
      alt: "The UC San Diego wordmark in white, underlined, centered on a solid navy background.",
    },
  },
  overview: {
    hook: [
      {
        text: "Systematizing accessibility and UX for 26,000+ enterprise users within a locked design system.",
      },
    ],
    paragraphs: [
      [
        {
          text: "UC San Diego Business & Financial Services (BFS) runs the web presence and internal platforms for the university's finance, budget, and procurement operations, serving over 26,000 users. These pages live inside a campus content management system (CMS) with fixed templates and components, leaving zero room for a traditional visual redesign.",
        },
      ],
      [
        {
          text: "Over two years of sustained ownership, I led the UX and accessibility overhaul for the department, while remaining compliant to the pre-built design system that campus materials required. I used AI-assisted research and insight synthesis to evaluate content hierarchy, rebuild internal HTML templates, and design new operational procedures for the staff who maintain them.",
        },
      ],
    ],
    figure: {
      src: "/work/blink/blink mockups.jpg",
      alt: "Four tablet mockups of BFS Blink pages: a Process & Systems Optimization card, a Claiming Exemption from Withholding article, an About BFS org chart, and the Financial Services landing page.",
    },
  },
  sections: [
    {
      id: "our-approach",
      number: "01",
      navLabel: "OUR APPROACH",
      navSubLabel: "Scaling design impact by treating content and compliance as a systems problem.",
      blocks: [
        {
          kind: "proseFigure",
          heading: [
            {
              text: "How might we achieve WCAG 2.1 AA compliance across hundreds of pages when working within fixed CMS templates and components?",
            },
          ],
          paragraphs: [
            [
              {
                text: "Because I had no control over the core UI templates, accessibility work needed to come from the layers I had control over: content structure, text hierarchy, semantic markup, and the publisher workflows.",
              },
            ],
          ],
          figure: {
            src: "/work/blink/design system.jpg",
            alt: "The UC San Diego brand system: the wordmark, five primary and secondary brand colors, and the Grit and Base color palettes with textured swatches.",
          },
        },
        {
          kind: "proseFigure",
          heading: [{ text: "AI-Assisted Auditing at Scale" }],
          paragraphs: [
            [
              {
                text: "To understand the scope of what problems users faced on existing platforms, I analyzed over 14,000 support tickets using Python and generative AI tools. I then mapped 338 Blink sub-pages and 172 Knowledge Base Articles (KBAs), using Claude Cowork alongside Siteimprove to triage issues by impact and prioritize our remediation efforts.",
              },
            ],
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Classifying by Issue, Not by Page" }],
          paragraphs: [
            [
              {
                text: "To maximize my workflow, I grouped issues by type (e.g., bare URLs, table markup, empty anchor tags) instead of auditing page by page. This strategy allowed me to address repeated issues at once, and to clear backlogs efficiently across large clusters of similar pages such as the 13-page Tax section and 12-page Accountability section.",
              },
            ],
          ],
        },
      ],
    },
    {
      id: "design-decisions",
      number: "02",
      navLabel: "DESIGN DECISIONS",
      navSubLabel: "Decisions that focused on structure, accessibility, and long-term sustainability.",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            [
              {
                text: "Working inside a locked CMS is the norm for most instances of enterprise product design. These are some decisions that helped me navigate fixed templates to prioritize systemic architectural fixes over pixel-pushing.",
              },
            ],
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Systematizing the KBA Template" }],
          paragraphs: [
            [
              {
                text: "Editing 172 separate KBAs manually is unsustainable. Instead, I designed a fully revised, accessible HTML template for Knowledge Base Articles with 15 documented systemic changes. Doing this fixed a whole class of accessibility problems at the root, ensuring future articles were compliant by default.",
              },
            ],
          ],
          figure: {
            src: "/work/blink/laptop with code.jpg",
            alt: "A laptop displaying dark-mode HTML source code for a Knowledge Base Article template, with structured, accessibility-focused markup.",
          },
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Overriding Automated Complacence" }],
          paragraphs: [
            [
              {
                text: "Automated checkers only catch a minority of WCAG criteria. For example, a scanner will pass a page as long as the HTML heading tags (H1, H2, H3) are mathematically in order. To ensure page read order and textual hierarchy actually made sense visually and contextually, I would go through and manually verify pages. I would frequently need to restructure layouts to ensure the reading experience remained coherent for screen-reader users.",
              },
            ],
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Contextual Design System Application" }],
          paragraphs: [
            [
              {
                text: "While I was constrained by the university's design system, I adapted my application of it based on the audience. For internal platforms and public Blink pages, I adhered to strict, professional layouts. For student-facing communications and the operational Digest redesign, I leaned into the system's livelier colors and more creative components to drive engagement without breaking brand alignment.",
              },
            ],
          ],
          figure: {
            src: "/work/blink/digest and design system.jpg",
            alt: "Side by side of a Color Palette and Typography style guide slide and the rendered Monthly Digest newsletter built from that same system, with an events calendar and article spotlight.",
          },
        },
      ],
    },
    {
      id: "outcome-impact",
      number: "03",
      navLabel: "OUTCOME & IMPACT",
      navSubLabel: "Leveraging AI to efficiently work through hundreds of pages and shipping future guidance.",
      blocks: [
        {
          kind: "stats",
          // 425, not STAT_W (411) — Blink's own node measure, confirmed as
          // a real difference this session (see this file's header comment
          // and caseStudyGeometry.ts's STAT_W_WIDE).
          columnWidth: STAT_W_WIDE,
          items: [
            { value: "14,000+", label: "Support tickets analyzed using Python and LLMs to identify user behavioral patterns." },
            { value: "99%", label: "Automated WCAG 2.1 AA audit scores achieved across remediated pages." },
            { value: "500+", label: "Total Blink pages (338) and KBAs (172) mapped and brought into scope." },
            { value: "10+", label: "Data-backed UX recommendations approved by product stakeholders." },
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "The Deliverables" }],
          paragraphs: [
            [
              {
                text: "The real deliverable behind the work I did was not just remediated pages, but the institutional knowledge required to keep them corrected. I shipped SOPs, checklists, and contributor guidance so future BFS content creators can maintain the WCAG standard effortlessly.",
              },
            ],
          ],
        },
      ],
    },
    {
      id: "reflections",
      number: "04",
      navLabel: "REFLECTIONS",
      navSubLabel: "What I learned from designing and building within an institutional system.",
      blocks: [
        {
          kind: "proseFigure",
          heading: [
            {
              text: "After two years of sustained ownership over a live, institutional system, I learned that the durable fix is the process that produces the artifact.",
            },
          ],
          // No paragraphs (808:2802) — the closing line runs straight into
          // the figure, same shape as Chase's reflections `statement` but
          // as one proseFigure block per this file's header comment.
          figure: {
            src: "/work/blink/checklists.jpg",
            alt: "A stack of BFS Accessibility Checklist documents for Blink pages, showing a step-by-step SOP and a Page Structure checklist under the WCAG 2.1 AA standard.",
          },
        },
        {
          kind: "tiles",
          heading: [{ text: "Takeaways" }],
          items: [
            {
              title: "Constraints feel rigid at first, but can actually clarify design decisions.",
              body: "With most visual design decisions constrained by locked templates, I was able to prioritize function and accessibility. Instead of ideating what the page could look like, this taught me to start asking what the page needed to do structurally to serve a user on a screen reader.",
            },
            {
              title: "Design for the people who maintain the system.",
              body: "As new content gets created every day, the remediation efforts of this project would decay without a proper system in place. To make sure compliance was always in place, I delivered guidance and operational pipelines that allowed content creators to meet accessibility guidelines naturally, and never have to think about upkeep.",
            },
          ],
        },
      ],
    },
  ],
};
