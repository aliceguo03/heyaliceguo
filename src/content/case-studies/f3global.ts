import type { CaseStudy } from "./types";

// F3Global case study copy, transcribed verbatim from Figma node 736:6031
// (page "final"), re-read fresh this session. All-caps strings are stored
// all-caps and rendered with no CSS text-transform (CLAUDE.md rule 9).
//
// Asset filenames below were confirmed by opening every file in
// public/work/f3global/ against its Figma slot before wiring it — three of
// those wells (usability audit, design system, three entry points) are
// empty frames in the file, so the mapping there is by filename and
// subject content, not by anything visible in Figma itself. Alt text does
// not exist in Figma; all of it is written here, same as content/about.ts.
//
// The hook in the reflections section (§04) and §01's opening hook both
// point at the same Figma node ("image 25") for their figure — reusing one
// file (tablet-mockups.jpg) in both slots is intentional, not a mistake.
export const f3global: CaseStudy = {
  slug: "f3global",
  hero: {
    tagline: "REBUILDING A PUBLIC SITE AND CUSTOM ADMIN PORTAL FOR A GLOBAL MICROFINANCE NONPROFIT.",
    photos: [
      {
        src: "/work/f3global/hero-card-newsletter.jpg",
        alt: "Screenshot of the F3Global admin portal's newsletter article table, listing article titles, view counts, and featured status.",
      },
      {
        src: "/work/f3global/hero-card-home.jpg",
        alt: "F3Global homepage hero reading “Empowering Small Businesses” over a faded world map, with Become a Client and Join as a Member buttons.",
      },
      {
        src: "/work/f3global/hero-card-map.jpg",
        alt: "World map highlighting countries with F3Global team members, darker blue marking countries with five or more.",
      },
    ],
  },
  overview: {
    hook: [
      {
        text: "Designing credibility for a microfinance nonprofit, resulting in a fully shipped, live platform.",
      },
    ],
    paragraphs: [
      [
        {
          text: "F3 Global Foundation provides microloans and entrepreneur support to small businesses in underserved communities worldwide. The old website wasn't reaching any of the three groups the organization depends on, including donors who fund the loans, clients who receive them, and members who run programs. The site was also hosted in a way the organization couldn't easily afford or update.",
        },
      ],
      [
        {
          text: "I led two other designers through a full redesign, handing off to and working alongside with a team of 9 developers. The deliverables included a public site, mobile and tablet breakpoints, and a custom admin portal so staff could maintain the content, newsletter system, and team member database.",
        },
      ],
    ],
    figure: {
      src: "/work/f3global/computer-and-phone.jpg",
      alt: "Laptop and phone mockups of the F3Global site's interactive team map, showing an Our Team Around the World panel listing members by country.",
    },
  },
  sections: [
    {
      id: "our-approach",
      number: "01",
      navLabel: "OUR APPROACH",
      navSubLabel: "Identifying the problem, then crafting a solution backed by user research.",
      blocks: [
        {
          kind: "proseFigure",
          figureFirst: true,
          heading: [
            {
              text: "How might we rebuild a confusing legacy website that donors, clients, and members can each navigate to achieve distinct goals, paired with an intuitive backend admin portal?",
            },
          ],
          figure: {
            src: "/work/f3global/tablet-mockups.jpg",
            alt: "Tablet mockups of the F3Global admin portal login screen, an impact timeline, the site's navigation sidebar, the newsletter article list, and a published article.",
          },
          paragraphs: [
            [
              {
                text: "Before proposing anything new, we spent two weeks auditing the existing site and evaluating how similar organizations drove engagement and earned trust. From scratch, we then built a design system that nine developers could implement inside an eight-month timeline.",
              },
            ],
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Usability Audit" }],
          paragraphs: [
            [
              {
                text: "We started by evaluating every screen of the legacy site. We discovered issues including a confusing information hierarchy, overly dense text, and a lack of clear purpose in the contact forms that left users lost. The site also faced accessibility problems, with colors that didn't clear contrast guidelines and broken responsiveness.",
              },
            ],
          ],
          figure: {
            src: "/work/f3global/usability-audit.png",
            alt: "Screens from the legacy F3Global website annotated with usability audit feedback on navigation, contrast, and layout.",
          },
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Competitive Analysis" }],
          paragraphs: [
            [
              {
                text: "We analyzed successful microfinance platforms like Kiva and Grameen America to understand industry standards for building trust. We realized our solution needed to build confidence for every visitor, using testimonials and measurable impact to show we put people we serve first.",
              },
            ],
          ],
          figure: {
            src: "/work/f3global/competitive-analysis.jpg",
            alt: "Homepage screenshots of four microfinance nonprofits used in the competitive analysis: Kiva, OneTable, Grameen America, and Accion.",
          },
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Design System" }],
          paragraphs: [
            [
              {
                text: "To craft an experience that felt credible and modern, we established a fresh, accessible design system. We used a cohesive color palette of blue shades and clean typography to build components that evoked a feeling of immediate trust.",
              },
            ],
          ],
          figure: {
            src: "/work/f3global/design-system.png",
            alt: "Design system reference board with JPMorgan and Goldman Sachs branding, typography scales, button styles, and the F3Global color palette.",
          },
        },
      ],
    },
    {
      id: "design-decisions",
      number: "02",
      navLabel: "DESIGN DECISIONS",
      navSubLabel:
        "Using feedback from other designers, stakeholders, developers, and user testing to iterate.",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            [
              {
                text: "Every screen went through several rounds of iterations before it was ready to ship. One decision about entry points reshaped the site's entire structure. Others shaped individual components, incorporating feedback from user testing, stakeholder review, and the developer team about what was feasible to build during the time we had",
              },
            ],
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Three Entry Points for Three Audiences" }],
          paragraphs: [
            [
              {
                text: "Donors, clients, and members came to the site for completely different reasons, but the previous site treated them as one audience. We rebuilt the homepage around three separate paths, each with its own entry point, language, and primary action which were to become a client, join as a member, or donate. Everything deeper in the site was organized underneath those three branches.",
              },
            ],
          ],
          figure: {
            src: "/work/f3global/three-paths.jpg",
            alt: "Three F3Global homepage variations side by side, each opening with a different call to action for donors, members, and clients.",
          },
        },
        {
          kind: "carousel",
          items: [
            {
              heading: [{ text: "Pivoting the Admin Portal" }],
              paragraphs: [
                [
                  {
                    text: "We initially designed the backend Newsletter Editor to fit everything needed for adding a new article into a single, large pop-up that filled the screen. User testing quickly revealed cognitive overload. We iterated and separated the flow into a two-step process, reducing information into digestible chunks.",
                  },
                ],
              ],
              figure: {
                src: "/work/f3global/admin-portal-pivot.jpg",
                alt: "Before and after comparison of the admin portal's Add New Article form, split from one long form into a two-step flow.",
              },
            },
            {
              heading: [{ text: "The Mobile Sprint" }],
              paragraphs: [
                [
                  {
                    text: "Our client mistakenly assumed mobile and tablet designs were included in the MVP handoff. We adapted immediately, grinding out the fully responsive mobile screens in just two weeks to meet the launch deadline. This was made possible through well-tokenized components in the initial build and buffer room I planned in our design schedule.",
                  },
                ],
              ],
              figure: {
                src: "/work/f3global/mobile-screens.jpg",
                alt: "Responsive mobile screens of the F3Global site, including the homepage, mission page, donation flow, and an article page.",
              },
            },
            {
              heading: [{ text: "Storytelling Through Design" }],
              paragraphs: [
                [
                  {
                    text: "To drive donor engagement, we prioritized components proved the organization's real world impact rather than just telling it. We designed impact stories from past clients, an interactive global map showcasing F3Global's worldwide spread, and surfaced real, impactful numbers.",
                  },
                ],
              ],
              figure: {
                src: "/work/f3global/map-impact.jpg",
                alt: "Interactive world map with a connected panel listing F3Global team members by country, including names, roles, and contact links.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "outcome-impact",
      number: "03",
      navLabel: "OUTCOME & IMPACT",
      navSubLabel: "Fully shipped and deployed website and admin portal after 8 months with over 30 screens.",
      blocks: [
        {
          kind: "stats",
          items: [
            { value: "30+", label: "High-fidelity screens delivered across desktop, tablet, and mobile." },
            { value: "3", label: "Distinct audience paths, each with its own entry point." },
            { value: "10+", label: "Content types staff can now edit without a developer." },
            { value: "20+", label: "Usability test participants." },
          ],
        },
      ],
    },
    {
      id: "reflections",
      number: "04",
      navLabel: "REFLECTIONS",
      navSubLabel: "Final thoughts about the process and working with the team.",
      blocks: [
        {
          kind: "proseFigure",
          figureFirst: true,
          heading: [
            { text: "The fully responsive website and custom admin portal are now shipped and live at " },
            { text: "f3-global.org", href: "https://f3-global.org/" },
            { text: ". We are currently tracking metrics like click rates and bounce rates to quantify our success." },
          ],
          figure: {
            src: "/work/f3global/tablet-mockups.jpg",
            alt: "Tablet mockups of the F3Global admin portal login screen, an impact timeline, the site's navigation sidebar, the newsletter article list, and a published article.",
          },
        },
        {
          kind: "tiles",
          heading: [{ text: "Takeaways" }],
          items: [
            {
              title: "Responsiveness is more complex than scaling.",
              body: "The work is only half done when everything is in high-fidelity on desktop. Making mobile designs and tablet adjustments required a whole different way of thinking, not just rescaling components. We delivered on time, but scheduling more space for responsiveness in the timeline would have given us more room to experiment and iterate.",
            },
            {
              title: "Ask to see the content before designing the container.",
              body: "We rebuilt the newsletter page after finding the content would be 20+ page articles, instead of the blog posts we assumed. Even though the rebuild was successful, it would have saved us time to ask what the content looked like beforehand instead of assuming. This has become an important lesson that's changed how I approach and run client meetings.",
            },
            {
              title: "What's easy in Figma isn't easy to build.",
              body: "Working closely with developers taught me to pressure-test technical feasibility early on in the process, so that handoff was smooth and everyone knew what to expect. We learned to think about our designs not only from a designer's perspective, but also consider how it may work in code.",
            },
            {
              title: "Design for someone less fluent than you.",
              body: "Our audience wasn't tech-savvy or design-literate, and neither were the staff maintaining the admin portal. Throughout the process, we had to remember to put ourselves in their shoes, and keep ourselves honest with user testing.",
            },
          ],
        },
        {
          kind: "credits",
          heading: [{ text: "The Team" }],
          paragraphs: [
            [
              { text: "Huge thank you to " },
              { text: "Jeff Antony", href: "https://www.linkedin.com/in/jeff-antony/" },
              { text: " and " },
              { text: "Sylvie Tran", href: "https://www.linkedin.com/in/sylvie-t2k4/" },
              {
                text: " for being two of the most talented, creative, and hardworking designers I could have asked to work with. To Weston Zong and Annabelle Guiditta, our Engineering Manager and Project Manager, thanks for leading the best TSE team with me.",
              },
            ],
            [
              {
                text: "And of course, so grateful to the incredible developers who made our designs come to life: Jaden Huang, James Escobedo, Katelyn Li, Munachi Okoro, Suhaan Khurana, Sweekrit Bhatnagar, Tony Wang, and Yasmin Kabir.",
              },
            ],
          ],
        },
      ],
    },
  ],
};
