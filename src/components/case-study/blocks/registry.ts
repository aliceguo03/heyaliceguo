import type { ComponentType } from "react";
import type { Block } from "@/content/case-studies/types";
import { Statement } from "./Statement";
import { Prose } from "./Prose";
import { Figure } from "./Figure";
import { ProseFigure } from "./ProseFigure";
import { Carousel } from "./Carousel";
import { Stats } from "./Stats";
import { Tiles } from "./Tiles";
import { Credits } from "./Credits";

// One component per block kind, keyed here so CaseStudy.tsx walks
// `section.blocks` generically instead of switching on `kind` by hand —
// the mechanism that lets case studies 2-9 add sections as data with zero
// new component code (CLAUDE.md "Build order").
//
// Each component's own props are exactly `Omit<BlockOfThatKind, "kind">" —
// TypeScript has no built-in way to express "a Record whose value type
// varies per key to match that key's own variant" without a mapped
// conditional type, so this is the one place a narrowing cast lives
// (ComponentType<any>), rather than one at every render call site. The
// single render call in CaseStudy.tsx spreads `block` minus `kind`
// straight into the looked-up component, so the props objects above are
// still checked structurally against each component's real signature at
// every content-file call site — this cast only defeats checking on the
// lookup itself.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLOCK_REGISTRY: Record<Block["kind"], ComponentType<any>> = {
  statement: Statement,
  prose: Prose,
  figure: Figure,
  proseFigure: ProseFigure,
  carousel: Carousel,
  stats: Stats,
  tiles: Tiles,
  credits: Credits,
};
