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
  src: string; // path in public/work/<slug>/ — the still, or a video's poster frame
  alt: string;
  video?: VideoSource;
};

// GeminiCut's two video figures (CLAUDE.md "GeminiCut case study" session
// notes) are deliberately different mechanisms, not two settings of one
// behavior — `behavior` is the only axis that actually branches logic in
// AmbientVideo.tsx/FeatureVideo.tsx, which is why it's a closed union rather
// than a handful of independent booleans (autoplay/loop/controls/muted would
// let a caller build a combination neither real case needs).
//
// "ambient": muted, native `loop`, no controls — the carousel's four clips.
// The caller (CarouselTabs.tsx) owns the play/pause gate; only the selected
// tab's video ever plays.
//
// "feature": real controls, audio, no loop, never autoplays — Commercial
// Showcase's 2-minute video. Shows a replay affordance on `ended` rather than
// freezing on the last frame.
export type VideoSource = {
  src: string;
  // The well's own height for this source, in px. Deliberately NOT FIGURE_H —
  // see caseStudyGeometry.ts's CAROUSEL_VIDEO_H/SHOWCASE_VIDEO_H comments for
  // why each video figure gets its own height rather than reusing 556.
  height: number;
  behavior: "ambient" | "feature";
  // Recording-capture edge-artifact crop, scale()-only — ProjectMedia.tsx's
  // VIDEO_ZOOM precedent (home page cards). Omitted = no zoom.
  zoom?: number;
};

// Every block kind in the template (736:6031), one component each under
// src/components/case-study/blocks/. `figure` and the figure inside
// `proseFigure`/`carousel` are always CONTENT_W x FIGURE_H (1077x556) UNLESS
// the figure carries `video` — GeminiCut's two video figures each have a
// source aspect ratio FIGURE_H doesn't match (caseStudyGeometry.ts's
// CAROUSEL_VIDEO_H/SHOWCASE_VIDEO_H), so `VideoSource.height` is the one
// sanctioned per-figure override, not a general size prop any block can set.
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
      //
      // `mode` (added for GeminiCut's "design decisions" carousel, 767:7270)
      // discriminates the *mechanism*, not the content shape: an item is
      // still heading + paragraphs + one figure either way, so this stays
      // one block kind rather than a second one. Default/omitted ("scrub")
      // is F3Global's pinned, scroll-scrubbed stage (CarouselStage.tsx) with
      // no visible tabs. "tabs" is click-driven selection (CarouselTabs.tsx)
      // — a deliberate departure, not a bug to reconcile with scrub's
      // pattern — and requires a `label` per item since tabs need a name to
      // show; scrub has no tabs to label, so the union keeps `label`
      // required on one side and absent on the other rather than leaving it
      // an always-optional field either component could half-use.
      mode?: "scrub";
      items: { heading: Paragraph; paragraphs: Paragraph[]; figure: Figure }[];
    }
  | {
      kind: "carousel";
      mode: "tabs";
      items: { label: string; heading: Paragraph; paragraphs: Paragraph[]; figure: Figure }[];
    }
  | {
      kind: "stats";
      // 2-6 items. Figma shows two cases: F3Global/Chase's 4-item 2x2
      // (736:6106, two 411px columns at 100px gap, left-packed in the 1077
      // column — not stretched full width) and GeminiCut's 2-item single row
      // (794:2451, re-read fresh — same 411px column width and 100px gap,
      // just one row instead of two). Both fit Stats.tsx's existing
      // `columnCount` (<=4 -> 2 columns) with no threshold change; 5-6 render
      // 3 columns, this session's own extrapolation, still unconfirmed in
      // the file.
      items: { value: string; label: string }[];
    }
  | {
      kind: "tiles";
      heading?: Paragraph;
      // Chase's "our approach section" (736:6320) groups a plain-prose lead
      // paragraph and the tile grid in one 20px auto-layout, not the 50px
      // gap CaseStudySection.tsx puts between sibling blocks — so the lead
      // has to live inside this block, not as a preceding `prose` block.
      // Plain Satoshi body, not `heading` (which renders the gradient
      // Statement treatment) — Chase's paragraph carries no such styling.
      lead?: Paragraph[];
      items: { title: string; body: string }[]; // 2x2, Figma 736:6135
    }
  | {
      kind: "credits";
      heading: Paragraph;
      paragraphs: Paragraph[];
      // Chase's "The Team" (736:6401) adds a 2x2 photo grid below the
      // paragraph, at the same 20px rhythm Credits.tsx already uses between
      // its own children — optional because F3Global's credits block has
      // none. See caseStudyGeometry.ts's CREDITS_PHOTO_ASPECT for the cell
      // size these render at.
      photos?: Figure[];
    };

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
    // 3 (F3Global, 730:6000: an over-wide strip centered under the card)
    // or 1 (Chase, 730:6547: a single photo filling the card's own px-xl
    // padding) — CaseStudyHero.tsx branches on `photos.length`, not a
    // separate variant flag, since the count alone determines which layout
    // applies.
    photos: Figure[];
    // Width of the header's "<slug> /" + tagline column (Figma "project
    // title", 730:5996/730:6011). F3Global fills the full HERO_HEADER_W
    // (829); Chase's is deliberately narrower (620), which is what makes
    // its tagline break after "FOR" rather than run the full width.
    // Omitted = fill, so F3Global needs no value here.
    titleWidth?: number;
  };
  // Typed separately from `proseFigure` rather than folded into it: Figma's
  // overview section (736:6063) uses a 30px gap between its text group and
  // figure, where every in-section proseFigure uses 20px — a real,
  // deliberate-looking difference worth keeping distinct in the type rather
  // than papering over with a shared shape (see plan "Flags" #5).
  overview: { hook: Paragraph; paragraphs: Paragraph[]; figure: Figure };
  sections: Section[];
};
