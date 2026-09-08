import Image from "next/image";
import { TextColumn } from "./TextColumn";
import { PhotoColumn } from "./PhotoColumn";

// The gray frame (Figma "about", 523:6601). Background is a single image
// layer at 40% opacity, bottom-aligned within the frame — same
// next/image fill + object-cover pattern ProjectFrame.tsx already uses for
// a gradient-backed frame, with object-bottom added to match this frame's
// bottom-aligned crop.
//
// Height is not set explicitly: with both columns items-start under this
// flex row, the frame's own height (padding + the taller column) already
// lands on FRAME_H (940) naturally, since TextColumn's fixed
// TEXT_WINDOW_H (740) plus this frame's own 100px top/bottom padding sums
// to exactly 940 — see aboutGeometry.ts.
export function AboutFrame() {
  return (
    <div className="relative flex items-start justify-between overflow-hidden rounded-card px-xl py-3xl">
      <Image
        src="/about/frame-gradient.jpg"
        alt=""
        fill
        sizes="(max-width: 1710px) 100vw, 1610px"
        className="object-cover object-bottom opacity-40"
      />

      <TextColumn />
      <PhotoColumn />
    </div>
  );
}
