import type { CaseStudy } from "./types";

// JPMorgan Chase case study copy, transcribed verbatim from Figma node
// 736:6276 (page "final"), re-read fresh this session after several
// mid-session corrections (see this session's plan for the full readout):
// section numbers 01/02/03 (the content column's own headers were stale
// copies of F3Global's numbering before you fixed them in Figma), the stats
// column width (425 -> corrected to 411, matching STAT_W), and the accent
// color (#18A8BC -> #127B89, for contrast — see projects.ts). `role` and
// `type` below intentionally do NOT match Figma's own copy ("UX Design and
// Research Intern" / "Enterprise Platform") — you confirmed projects.ts
// already held the right strings and Figma's text needs fixing, not this
// file.
//
// Three sections, no carousel — Design Decisions doesn't exist here. The
// sidebar and panel needed zero code changes to produce a correct 3-item
// nav (useCaseStudyPanel.ts measures `[data-section]` count at runtime;
// PanelNav.tsx has no hardcoded section count).
//
// Asset filenames were matched by opening every file in public/work/chase/
// against its Figma slot — filename order carries no meaning. Alt text does
// not exist in Figma; all of it is written here, same as f3global.ts.
export const chase: CaseStudy = {
  slug: "chase",
  hero: {
    tagline: "RETHINKING THE BANKER EXPERIENCE FOR DATA-DENSE WORKFLOWS.",
    // Single photo (730:6547), not F3Global's 3-photo strip —
    // CaseStudyHero.tsx branches on this array's length.
    titleWidth: 620,
    photos: [
      {
        src: "/work/chase/chase cover.png",
        alt: "The Chase logo beside the wordmark “CHASE,” centered on a white card.",
      },
    ],
  },
  overview: {
    hook: [
      { text: "Reframing a dense stream of client data into prioritized, actionable guidance." },
    ],
    paragraphs: [
      [
        {
          text: "Bankers constantly process massive amounts of client data to identify opportunities. Our challenge was to design a single, cohesive information experience that organizes this data-dense workflow into actionable steps, though specific details remain protected under NDA.",
        },
      ],
      [
        {
          text: "Over a 10-week summer internship in the Firmwide Design Development Program (DDP), I collaborated with two co-interns, alongside product, research, tech, and data partners, to deliver a high-fidelity internal platform prototype.",
        },
      ],
    ],
    figure: {
      src: "/work/chase/jpmc building.jpg",
      alt: "The glass-and-timber entrance canopy of a JPMorgan Chase office building, with the Chase wordmark and logo above the doors.",
    },
  },
  sections: [
    {
      id: "our-approach",
      number: "01",
      navLabel: "OUR APPROACH",
      navSubLabel: "Aligning cross-functional language and mapping hierarchy before pushing a single pixel.",
      blocks: [
        {
          kind: "tiles",
          lead: [
            [
              {
                text: "Because enterprise design requires navigating strict domain constraints, our process prioritized structural alignment over immediate wireframing.",
              },
            ],
          ],
          items: [
            {
              title: "Aligning language before designing.",
              body: "Early research surfaced that core terms meant entirely different things to different teams. We paused to align on definitions before designing anything, ensuring that ambiguity in vocabulary wouldn't become ambiguity in the interface.",
            },
            {
              title: "Hierarchy as the main design problem.",
              body: "We were tasked with organizing dense information so that it was immediately actionable. Most of my design effort went into information architecture, deciding what should be surfaced the highest, what became supporting context, and what didn't belong on screen.",
            },
            {
              title: "Continuous feedback from workshop sessions.",
              body: "Rather than waiting until prototypes were polished to ask for feedback, we ran working sessions with designers, researchers, product managers, and data partners across the firm. These sessions clarified our assumptions and ensured technical feasibility early on.",
            },
            {
              title: "Building on shifting ground.",
              body: "The problem space was still taking shape while we designed. There was no time to wait until technical details or product requirements became certain. We learned to commit to architectural decisions with incomplete information and revisit them deliberately as constraints clarified.",
            },
          ],
        },
      ],
    },
    {
      id: "outcome-impact",
      number: "02",
      navLabel: "OUTCOME & IMPACT",
      navSubLabel: "Quantifying our 10-week process through deliverables and cross-functional alignment.",
      blocks: [
        {
          kind: "stats",
          items: [
            { value: "15+", label: "High fidelity screens delivered." },
            { value: "20+", label: "Cross-functional experts facilitated in our workshop session." },
            { value: "3", label: "Presentations given to VPs, design leads, and product stakeholders." },
            { value: "1", label: "In-branch visit observing bankers in action." },
          ],
        },
      ],
    },
    {
      id: "reflections",
      number: "03",
      navLabel: "REFLECTIONS",
      navSubLabel: "Takeaways from designing for specialized users and navigating enterprise-scale product design.",
      blocks: [
        {
          kind: "statement",
          text: [
            {
              text: "Due to NDA restrictions, the final high-fidelity prototypes and proprietary workflows cannot be shown. However, the final deliverable successfully synthesized 10+ research artifacts into a cohesive vision that aligned product, tech, and design on the future of the banker experience.",
            },
          ],
        },
        {
          kind: "tiles",
          heading: [{ text: "Takeaways" }],
          items: [
            {
              title: "Facilitation is a core design skill.",
              body: "For working sessions, we coordinated twenty people from design, product, research, and data into one Zoom call. Making sure we left this session with decisions rather than opinions took as much preparation as the designs themselves. I learned to construct activities that invite all feedback and frame questions narrowly to drive consensus.",
            },
            {
              title: "Constantly strive to validate assumptions.",
              body: "It is easy to rely on synthesized data, but there is no substitute for observing the user in their actual environment. Stepping away from Figma and conducting a branch visit to watch how the bankers work was where some of the most critical design decisions were made.",
            },
          ],
        },
        {
          kind: "credits",
          heading: [{ text: "The Team" }],
          paragraphs: [
            [
              {
                text: "Endlessly grateful for all the amazing people I worked with this summer. Working alongside and learning from my two co-interns, ",
              },
              { text: "Johanna Lohmus", href: "https://www.linkedin.com/in/johanna-lohmus/" },
              { text: " and " },
              { text: "Karun Natarajan", href: "https://www.linkedin.com/in/karun-natarajan-15b945215/" },
              {
                text: ", made the experience so special. Huge thank you as well to my other DDP cohort interns, Yuki and Kayla, and my direct managers, Maria and Antonio, for such a fun summer.",
              },
            ],
          ],
          photos: [
            {
              src: "/work/chase/interns in office.jpg",
              alt: "Three interns smiling at a shared desk with open laptops, in a lounge with a “We'd Love It's the Brooklyn Way” sign in the background.",
            },
            {
              src: "/work/chase/taking notes.jpg",
              alt: "Four people gathered around a meeting-room table, one banker explaining a dashboard on a desktop monitor while two others take notes.",
            },
            {
              src: "/work/chase/chase branch visit.jpg",
              alt: "Six people posing together in front of a screen reading “Because the American dream was never one story,” during a branch visit.",
            },
            {
              src: "/work/chase/interns at lunch.jpg",
              alt: "Four interns posing for a selfie over lunch, with a mural of a city park and skyline in the windows behind them.",
            },
          ],
        },
      ],
    },
  ],
};
