// About page content (src/app/about/page.tsx). Mirrors the shape of
// src/content/projects.ts: an exported type plus one ordered array, so no
// copy, photo path, or section count is ever hardcoded in a component.
// Figma node 523:6602 (page "final", re-pulled after Alice's copy edit —
// the text frame is now 696:5290).
//
// Two of the six section bodies contain an inline link (Anatole Quartet,
// connect). `body` is modeled as an ordered array of parts rather than a
// plain string so this module stays data-only — no JSX in content/, same
// boundary projects.ts keeps. TextBlock (components/about/TextBlock.tsx)
// renders each part, emitting <InlineLink> for any part with an `href`.
export type AboutBodyPart = { text: string; href?: string };

export type AboutSection = {
  id: string;
  header: string; // stored all-caps; rendered verbatim, no CSS text-transform
  body: AboutBodyPart[];
  photo: string; // path in public/about/
  alt: string;
  caption: string; // verbatim, no CSS text-transform
};

export const ABOUT_SECTIONS: AboutSection[] = [
  {
    id: "nice-to-meet-you",
    header: "NICE TO MEET YOU /",
    body: [
      {
        text: "Hey, my name is Alice. Originally from Boston, I’m now based in San Diego while finishing up my bachelor’s in Cognitive Science (Design & Interaction). Along the way, I’ve also expanded my skillset with minors in both Data Science and Music.",
      },
    ],
    photo: "/about/sd.jpg",
    alt: "Alice smiling on a beach near campus in San Diego.",
    caption: "ON THE BEACHES OF SAN DIEGO, CALIFORNIA.",
  },
  {
    id: "how-i-entered-design",
    header: "HOW I ENTERED DESIGN /",
    body: [
      {
        text: "My journey to product design began with an interest in psychology. I wanted to learn how the brain works, how people perceive each other, and how they interact with their surroundings. After briefly majoring in neuroscience, I found my way to design because it is, at the core, user-centered problem-solving. As someone who’s always been a creative, I believe in the art of evoking a feeling and crafting an experience. I’ve also learned to build much of what I design, owning the entire product lifecycle and letting each phase sharpen the next.",
      },
    ],
    photo: "/about/designathon.jpg",
    alt: "Alice gesturing at a presentation screen showing mobile mockups.",
    caption: "PRESENTING AT MY FIRST DESIGNATHON IN 2025.",
  },
  {
    id: "building-community",
    header: "BUILDING COMMUNITY /",
    body: [
      {
        text: "On campus, I’m the VP of Design for Triton Software Engineering. We design and build products for nonprofits, a mission that’s driven my growth as a designer over the past two years. The people are what make being in TSE so special, and one of my favorite memories is stargazing at Joshua Tree last spring on retreat.",
      },
    ],
    photo: "/about/joshua-tree.jpg",
    alt: "Alice and her TSE project team posing on a rock in Joshua Tree at dusk.",
    caption: "WITH MY TSE PROJECT TEAM AT JOSHUA TREE.",
  },
  {
    id: "designing-in-the-real-world",
    header: "DESIGNING IN THE REAL WORLD /",
    body: [
      {
        text: "For me, nothing is more exciting than spending time in different cities to discover what life is like there. Last summer, I interned at JPMorgan Chase in New York City, a place unlike any other. That experience gave me a taste of what design is like in the real world, with real constraints, feedback, and impact. It also showed me how unmatched the food scene is and how brilliant the people are in New York. Some of my other favorite cities I’ve visited are London and Shanghai.",
      },
    ],
    photo: "/about/nyc.jpg",
    alt: "A busy street in Midtown Manhattan as the sun is setting.",
    caption: "GOLDEN HOUR ON THE STREETS OF MANHATTAN.",
  },
  {
    id: "outside-of-design",
    header: "OUTSIDE OF DESIGN /",
    body: [
      {
        text: "When not in Figma, I can often be found in various corners of the UC San Diego music building. My way of winding down is playing violin for the school’s chamber orchestra or rehearsing with the ",
      },
      { text: "Anatole Quartet", href: "https://www.anatole-quartet.com/" },
      { text: ", a student ensemble we formed on campus." },
    ],
    photo: "/about/quartet.jpg",
    alt: "Alice and three other string quartet members performing on a stage.",
    caption: "PERFORMING WITH THE ANATOLE QUARTET. (PHOTO: ROBBIE BUI)",
  },
  {
    id: "everything-else",
    header: "EVERYTHING ELSE /",
    body: [
      {
        text: "Other miscellaneous things I love include concerts, oysters, writing, tarot cards, and Broadway shows. Thanks for dropping by, and let’s ",
      },
      { text: "connect", href: "https://www.linkedin.com/in/aliceguo03/" },
      { text: "." },
    ],
    photo: "/about/paraglide.jpg",
    alt: "A paraglider soaring over the cliffs of La Jolla, California.",
    caption: "ON MY BUCKET LIST: PARAGLIDING IN SAN DIEGO BEFORE I GRADUATE.",
  },
];

// The three static hero photos (Figma "photos", 523:6572), left to right.
// Separate from ABOUT_SECTIONS — a different set of photos, no captions,
// no section-count relationship.
export type AboutHeroPhoto = {
  src: string;
  alt: string;
};

export const ABOUT_HERO_PHOTOS: AboutHeroPhoto[] = [
  { src: "/about/hero-sunset-cliffs.jpg", alt: "Sun Diego sunset over the cliffs." },
  {
    src: "/about/hero-manhattan.jpg",
    alt: "Alice standing on a boat facing New York City.",
  },
  {
    src: "/about/hero-joshua-tree.jpg",
    alt: "Rocks shaped like a bear in Joshua Tree.",
  },
];
