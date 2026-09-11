// Case study content model. Figma "project case study section" (736:6070)
// decomposes into a small set of block kinds, not a hand-built layout per
// project — a case study is `blocks[]` per section, so case study 2–9 are
// authored as data with zero new component code (CLAUDE.md "Build order").
//
// `Segment`/`Paragraph` mirror `AboutBodyPart[]` in content/about.ts exactly
// (same ordered-array-of-{text,href?} shape) — every case study will have
// inline links, so this stays the one representation, shared by `prose` and
// `credits` rather than invented twice. A `{ text -> href }` map was
// considered and rejected: it needs runtime string-splitting, breaks on a
// repeated substring, and can't express two links sharing a label (the
// credits block has exactly that risk with repeated names).
export type Segment = { text: string; href?: string };
export type Paragraph = Segment[];

export type Figure = {
  src: string; // path in public/work/<slug>/
  alt: string;
};

// Every block kind in the template (736:6031), one component each under
// src/components/case-study/blocks/. `figure` and the figure inside
// `proseFigure` are always 1077x556 (CaseStudy's CONTENT_W x FIGURE_H) —
// there is no per-project size prop, so a case study cannot introduce a
// nonstandard figure size.
export type Block =
  | { kind: "statement"; text: Paragraph }
  | { kind: "prose"; paragraphs: Paragraph[] }
  | { kind: "figure"; figure: Figure }
  | {
      kind: "proseFigure";
      heading?: Paragraph;
      paragraphs?: Paragraph[];
      figure: Figure;
      // Figma orders most proseFigure blocks heading -> prose -> figure, but
      // each section's own opening block (736:6075's "How might we…" hook,
      // 736:6126's "The fully responsive…" hook) orders hook -> figure ->
      // prose instead. One boolean captures that, rather than a second block
      // kind for what is otherwise an identical shape.
      figureFirst?: boolean;
    }
  | {
      kind: "carousel";
      // This session renders items stacked as ordinary proseFigure blocks —
      // both the static build and the permanent reduced-motion fallback
      // (CLAUDE.md "Stacked project cards" applies the same principle here:
      // build the real fallback, not a placeholder). P2 adds motion beside
      // this, not instead of it.
      items: { heading: Paragraph; paragraphs: Paragraph[]; figure: Figure }[];
    }
  | {
      kind: "stats";
      // 4-6 items. Figma (736:6106) shows only the 4-item case (2x2, two
      // 411px columns at 100px gap, left-packed in the 1077 column — not
      // stretched full width). 5-6 render 3 columns instead.
      items: { value: string; label: string }[];
    }
  | {
      kind: "tiles";
      heading?: Paragraph;
      items: { title: string; body: string }[]; // 2x2, Figma 736:6135
    }
  | { kind: "credits"; heading: Paragraph; paragraphs: Paragraph[] };

// A section's title row renders `navLabel` twice — once here (mono header,
// e.g. "our approach" + the muted section number) and once as the sidebar's
// nav topic label (672:4392 etc: "01/ our approach") — so it is one field,
// not two kept in sync by hand.
export type Section = {
  id: string;
  number: string; // "01".."04"
  navLabel: string; // "OUR APPROACH" — stored caps, rendered with no text-transform
  navSubLabel: string; // sidebar topic's own one-line description
  blocks: Block[];
};

export type CaseStudy = {
  slug: string; // must match a Project.slug in content/projects.ts
  hero: {
    tagline: string; // hero card's muted subhead line
    photos: Figure[]; // exactly 3, Figma "photo section" 730:6000
  };
  // Typed separately from `proseFigure` rather than folded into it: Figma's
  // overview section (736:6063) uses a 30px gap between its text group and
  // figure, where every in-section proseFigure uses 20px — a real,
  // deliberate-looking difference worth keeping distinct in the type rather
  // than papering over with a shared shape (see plan "Flags" #5).
  overview: { hook: Paragraph; paragraphs: Paragraph[]; figure: Figure };
  sections: Section[];
};
