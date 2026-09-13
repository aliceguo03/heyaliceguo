import type { CaseStudy } from "./types";
import { CAROUSEL_VIDEO_H, CAROUSEL_VIDEO_ZOOM, SHOWCASE_VIDEO_H } from "@/components/case-study/caseStudyGeometry";

// Google GeminiCut case study, transcribed verbatim from Figma node
// 794:2384 (page "final"), re-read fresh this session. Carousel states from
// 767:7270 (four variants: state=admin/mobile/map/state4 — the tab labels
// are stored caps, matching the `navLabel`/tile-label precedent elsewhere in
// this content model, not a transcription of Figma's own lowercase text).
//
// One content discrepancy, transcribed as-is rather than corrected (CLAUDE.md
// "match the design exactly... if a value looks wrong, say so — don't
// correct it silently"): the overview's second paragraph says "Over 3
// months," but both projects.ts's `timeline` and the info panel itself
// (794:2395/2397) say "2 mos." Flagged for you; not resolved here.
//
// Asset mapping was done by rendering each Figma figure node and matching it
// against public/work/gemini/*, not by filename order — see this session's
// own plan for the full readout. Two figure slots have no Figma reference
// image at all (794:2431's "HCI Literature" photo frame is empty in the
// file) — those assignments are this session's own thematic judgment, not a
// transcription.
export const geminicut: CaseStudy = {
  slug: "geminicut",
  hero: {
    tagline: "AN ADAPTIVE, DIRECT-MANIPULATION UI FOR AI VIDEO EDITING IN GEMINI.",
    // Standard 3-photo strip (794:2387), not Chase's single-image variant —
    // CaseStudyHero.tsx branches on this array's length, so no `titleWidth`
    // override is needed (F3Global's own case).
    photos: [
      {
        src: "/work/gemini/gemini home - hero 1.png",
        alt: "Gemini's blank chat screen greeting “Hi Jeffrey — Where should we start?”, with a prompt describing a stop-motion paper-cat video and quick-action chips for creating an image, music, or video.",
      },
      {
        src: "/work/gemini/gemini video editing - hero 2.png",
        alt: "A generated “Paper Cat Performance Video” playing inside Gemini's chat, showing a puppet-theater stage with a paper cat performing at a tiny paper piano.",
      },
      {
        src: "/work/gemini/gemini full chat - hero 3.png",
        alt: "The same paper-cat performance video open in Gemini's chat, with the four editing-mode buttons — Edit and Regenerate, Edit with Timeline, Edit Style, and Edit Sound — beneath it.",
      },
    ],
  },
  overview: {
    hook: [
      { text: "Bridging the gulf between human intent and generative video through direct manipulation." },
    ],
    paragraphs: [
      [
        {
          text: "As generative video models scale, editing outputs remains fundamentally broken as users are trapped in loops of continuous re-prompting and full regenerations. This causes non-local edits, where tweaking one small detail undos the entire scene, wasting user time and cognitive energy. Novices are left between high-barrier professional tools, like Adobe Firefly, or text-only chat boxes with zero spatial control.",
        },
      ],
      [
        {
          text: "Over 3 months, our team of 5 designers and researchers built an adaptive video editing interface embedded natively inside Google Gemini. Grounded in cognitive science principles and the synthesis of over 20 human-computer interaction research papers, our prototype introduces direct-manipulation primitives directly into the chat flow.",
        },
      ],
    ],
    figure: {
      src: "/work/gemini/gemini modes.jpg",
      alt: "A collage of reference screens for Gemini's four editing modes — spatial, temporal, style, and audio — alongside the source photography and footage they draw on.",
    },
  },
  sections: [
    {
      id: "our-approach",
      number: "01",
      navLabel: "OUR APPROACH",
      navSubLabel: "Identifying current frictions in generative models through literature review and competitive analysis.",
      blocks: [
        {
          kind: "proseFigure",
          figureFirst: true,
          heading: [
            {
              text: "How might we bridge the gulf of execution in generative video editing by embedding direct-manipulation primitives natively within an LLM interface?",
            },
          ],
          figure: {
            src: "/work/gemini/gemini overview.jpg",
            alt: "Gemini's minimal chat home screen, with a single search bar reading “Ask Gemini 3” and an “Edit video” quick action beneath it.",
          },
          paragraphs: [
            [
              {
                text: "Our group first chose to examine the disconnect between a creator’s mental model and an LLM’s underlying mechanics through rigorous research of existing tools and academic sources.",
              },
            ],
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "HCI Literature & Academic Synthesis" }],
          paragraphs: [
            [
              {
                text: "We analyzed 20+ foundational and cutting-edge sources covering Direct Manipulation (Hutchins & Norman), dynamic media representation (Bret Victor), and generative interaction tools (SAM-2, Runway Motion Brush, ExpressEdit). We found that while natural language excels at high-level semantic direction, spatial and temporal edits were more successful when given continuous, visual references.",
              },
            ],
          ],
          figure: {
            src: "/work/gemini/academic research.jpg",
            alt: "A synthesis board of academic diagrams and figures on direct manipulation, tracking, and motion principles, annotated with research takeaways.",
          },
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Heuristic Audits" }],
          paragraphs: [
            [
              {
                text: "To determine the direction of our solution, we conducted heuristic evaluations comparing standalone video models with professional creative suites. We found that generative chatbots often violated Visibility of System Status, given users have no insight into what the model kept or altered. On the other hand, non-linear editing (NLE) tools violated expectations for Match Between System and Real World, overwhelming novice users with keyframes, tracks, and technical jargon.",
              },
            ],
          ],
          figure: {
            src: "/work/gemini/auditing other tools.jpg",
            alt: "A grid of professional editing tools under audit — color-grading panels, a non-linear timeline editor, and a photo-retouching workspace — each annotated with usability callouts.",
          },
        },
      ],
    },
    {
      id: "design-decisions",
      number: "02",
      navLabel: "DESIGN DECISIONS",
      navSubLabel: "Giving our users full control through the editing dimensions of space, time, style, and audio.",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            [
              {
                text: "We grounded our wireframes and prototypes in direct-manipulation principles, validating each state using cognitive walkthroughs to ensure novice creators felt completely in control. To eliminate the high cognitive load of context-switching between external tools, we chose to implement four editing dimensions that lived natively inside the conversational UI. These dimensions were space, time, style, and audio. View the different modes in action below.",
              },
            ],
          ],
        },
        {
          kind: "carousel",
          mode: "tabs",
          items: [
            {
              label: "EDIT & REGENERATE",
              heading: [{ text: "Spatial Precision: In-Frame Lasso" }],
              paragraphs: [
                [
                  {
                    text: "We introduced a contextual lasso tool that lets users point and isolate regions directly on the video frame. By limiting the prompt strictly to the selected area, the interface locally regenerates changes while keeping the rest of the canvas locked, protecting generated artifacts that users were already happy with.",
                  },
                ],
              ],
              figure: {
                src: "/work/gemini/poster edit and regenerate.jpg",
                alt: "A video frame with a lasso selection drawn around one region, isolating it for a localized regeneration prompt.",
                video: {
                  src: "/work/gemini/gemini-regenerate.mp4",
                  height: CAROUSEL_VIDEO_H,
                  behavior: "ambient",
                  zoom: CAROUSEL_VIDEO_ZOOM,
                },
              },
            },
            {
              label: "EDIT TIMELINE",
              heading: [{ text: "Temporal Scoping: Single-Track Timeline" }],
              paragraphs: [
                [
                  {
                    text: "Instead of replicating professional editing software’s multi-track timelines, we designed a single-clip scrubber with adjustable boundary handles. This clearly presents which video slice is editable versus locked, allowing users to zoom, pan, or regenerate specific seconds without risking the entire clip.",
                  },
                ],
              ],
              figure: {
                src: "/work/gemini/poster edit with timeline.jpg",
                alt: "A single-clip scrubber with two boundary handles marking an editable slice of the video, the rest of the timeline shown locked.",
                video: {
                  src: "/work/gemini/gemini-timeline.mp4",
                  height: CAROUSEL_VIDEO_H,
                  behavior: "ambient",
                  zoom: CAROUSEL_VIDEO_ZOOM,
                },
              },
            },
            {
              label: "EDIT STYLE",
              heading: [{ text: "Visual Tuning: Edit Style" }],
              paragraphs: [
                [
                  {
                    text: "Changing visual style usually needs rewriting a prompt from scratch. We built a panel that allows users to browse filters or adjust sliders to apply changes reversibly and non-destructively. Pushing a brightness slider up and instantly seeing the video brighten provides a direct correlation between the user’s physical action and the system’s result.",
                  },
                ],
              ],
              figure: {
                src: "/work/gemini/poster edit style.jpg",
                alt: "A style panel with filter presets and adjustment sliders open beside the video, mid-way through a brightness adjustment.",
                video: {
                  src: "/work/gemini/gemini-style.mp4",
                  height: CAROUSEL_VIDEO_H,
                  behavior: "ambient",
                  zoom: CAROUSEL_VIDEO_ZOOM,
                },
              },
            },
            {
              label: "EDIT SOUND",
              heading: [{ text: "Audio Scoping: Edit Sound" }],
              paragraphs: [
                [
                  {
                    text: "We created an Edit Sound mode to enable users to highlight a specific segment on the waveform and prompt a localized change, such as “add ambient rain here.” This scopes the regeneration strictly to the selected audio, ensuring users don’t accidentally overwrite a sound they wanted to keep.",
                  },
                ],
              ],
              figure: {
                src: "/work/gemini/poster edit sound.jpg",
                alt: "An audio waveform with a segment highlighted for a localized sound edit, the rest of the track shown undisturbed.",
                video: {
                  src: "/work/gemini/gemini-sound.mp4",
                  height: CAROUSEL_VIDEO_H,
                  behavior: "ambient",
                  zoom: CAROUSEL_VIDEO_ZOOM,
                },
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
      navSubLabel: "Interactive prototype showcasing all four modes and a short commercial of GeminiCut in action.",
      blocks: [
        {
          kind: "stats",
          items: [
            { value: "20+", label: "Foundational HCI research papers synthesized into actionable design criteria." },
            { value: "4", label: "Contextual editing modes designed for granular spatial, temporal, visual, and audio refinement." },
          ],
        },
        {
          kind: "proseFigure",
          heading: [{ text: "Commercial Showcase" }],
          paragraphs: [
            [
              {
                text: "To bring our research and interaction models to life, we produced a short commercial alongside our high-fidelity interactive prototype. Check out the video below to see how these four adaptive editing modes seamlessly embed into the Gemini chat experience.",
              },
            ],
          ],
          figure: {
            src: "/work/gemini/poster gemini commercial.jpg",
            alt: "A frame from the GeminiCut commercial: a montage of edit prompts — “change the lighting,” “add some music,” “change the camera angle” — layered over the phrase “it’s editing.”",
            video: {
              src: "/work/gemini/Gemini Cut Commercial.mp4",
              height: SHOWCASE_VIDEO_H,
              behavior: "feature",
              // No capture-window artifact on this source (unlike the four
              // carousel recordings) — left unzoomed per this session's plan.
            },
          },
        },
      ],
    },
    {
      id: "reflections",
      number: "04",
      navLabel: "REFLECTIONS",
      navSubLabel: "Final thoughts about potential refinements given more time and gratitude to the team.",
      blocks: [
        {
          kind: "proseFigure",
          heading: [
            {
              text: "The high-fidelity interactive prototype models a human-centered path forward for generative AI, proving that conversational interfaces become substantially more usable when paired with direct-manipulation controls.",
            },
          ],
          figure: {
            src: "/work/gemini/high fidelity screens.jpg",
            alt: "A grid of high-fidelity screens from the interactive prototype, including editing panels, a timeline view, and a data table.",
          },
        },
        {
          kind: "tiles",
          heading: [{ text: "Further Refinements" }],
          lead: [
            [
              {
                text: "Because GeminiCut was a course project, we were only able to spend two months researching, designing, and iterating before delivering the final prototype. Even though we are proud of what we created in that timespan, here are some areas of refinement we would target given more time.",
              },
            ],
          ],
          items: [
            {
              title: "Semantic selection lasso, instead of geometric.",
              body: "Currently, our lasso selection tool is rectangular and has no object-snapping ability. For small or complex objects, this creates precision problems and may cause users to accidentally include regions they didn’t intend to edit. An intelligent lasso that detects and snaps to object boundaries would minimize likelihood of error.",
            },
            {
              title: "Combining and compounding multi-parameter edits.",
              body: "Right now, edits are scoped by type, but a more powerful interaction would allow users to chunk changes across multiple parameters, such as camera angle and lighting, into a single edit. This would require complex research and iteration but would be a valuable improvement.",
            },
          ],
        },
        {
          kind: "credits",
          heading: [{ text: "The Team" }],
          // No photo grid this time (794:2485 has none) — Credits.tsx's
          // `photos` field is optional for exactly this case.
          paragraphs: [
            [
              { text: "Huge thank you to " },
              { text: "Jeff Antony", href: "https://www.linkedin.com/in/jeff-antony/" },
              { text: ", " },
              { text: "Allison Huang", href: "https://www.linkedin.com/in/allisonhuangg/" },
              { text: ", " },
              { text: "Justin Kim", href: "https://www.linkedin.com/in/justindkim1060/" },
              { text: ", and " },
              { text: "Ivan Rim", href: "https://www.linkedin.com/in/irim/" },
              {
                text: " for being amazing teammates I could lean on and bounce ideas off of for this project. I learned so much from your creativity and the way you all think.",
              },
            ],
          ],
        },
      ],
    },
  ],
};
