"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { DRAG, DUR, EASE, PHOTO_EXIT, cubicBezier, usePrefersReducedMotion } from "@/lib/motion";

// The exit path's per-segment easing. exitProgress itself (below) is driven
// linearly in wall-clock time — it's the *input* to a keyframe remapping,
// not the motion itself — so EASE has to be applied here, inside each
// segment, rather than to exitProgress's own journey from 0 to 1. Reuses
// the same cubicBezier() adapter lib/motion.ts already built for Lenis,
// rather than inventing a second way to turn EASE's control points into a
// sampling function.
const exitEase = cubicBezier(EASE);

// Figma "photo album" component (307:155/441:5970), page "final". Geometry
// below is derived from the node's transforms — frame-specific pixel math,
// not a design token, so it's kept here as documented consts rather than in
// @theme. Re-derived fresh this session from the design-context response's
// percentages; matches the previous (static) build exactly. Figma's own
// metadata reports *rotated* bounding boxes, which is why raw figures there
// look different from the unrotated values below.
const STACK_SIZE = { width: 289.293, height: 256 };
const PHOTO_BOX = 256; // every photo is this square before any slot transform

const PHOTO_COUNT = 4;
const FRONT_Z = 4;

// Session 4 (CLAUDE.md "Photo stack"): four photos cycle through three
// visible fanned positions plus one hidden back position. Slots are static
// geometry — SLOTS[i] never changes. A photo's *slot*, not the photo
// itself, carries the fan's x/y/rotate/scale; advancing rotates which photo
// occupies which slot (see slotOf below) rather than mutating any photo's
// own offset, which is what would let the fan drift over repeated cycles.
//
// x/y are translate offsets of a PHOTO_BOX square about its own centre
// (transform-origin: center, the default), derived so that scaling the box
// down about its centre still lands each rotated box exactly where the
// original absolute left/top/size figures placed it: centre_new = centre_old
// - PHOTO_BOX/2. scale is size/PHOTO_BOX (230.4/256 = 0.9, 207.36/256 =
// 0.81 = 0.9²).
//
// Slot 3 is coincident with slot 2 — the fourth photo's hidden rest
// position, fully occluded behind whatever currently sits in the
// back-visible slot, not a fourth distinct fan position. Figma's own
// component only ever shows three layers, and the container is sized flush
// to slot 2's right edge — extending the fan further would overflow it.
const SLOTS = [
  { x: 0, y: 0, rotate: 0, scale: 1 }, // front
  { x: 26.52, y: -6.48, rotate: 1.77, scale: 0.9 }, // mid
  { x: 51.65, y: -6.35, rotate: 3.4, scale: 0.81 }, // back, visible
  { x: 51.65, y: -6.35, rotate: 3.4, scale: 0.81 }, // back, hidden — coincident with the above
] as const;

const PHOTOS = [
  {
    src: "/photos/photo-01.jpg",
    alt: "Alice Guo, wearing a maroon top, standing in a sunlit outdoor walkway",
  },
  {
    src: "/photos/photo-02.jpg",
    alt: "Alice smiling in front of an ocean sunset",
  },
  {
    src: "/photos/photo-03.jpg",
    alt: "Alice standing outdoors against a stone column, greenery in the background",
  },
  {
    src: "/photos/photo-04.jpg",
    alt: "Alice at Joshua Tree",
  },
] as const;

type Slot = (typeof SLOTS)[number];
type Photo = (typeof PHOTOS)[number];

// Which slot a given photo currently occupies, given which photo is front.
function slotOf(photoIndex: number, front: number) {
  return (photoIndex - front + PHOTO_COUNT) % PHOTO_COUNT;
}

// One photo layer. A subcomponent (not inlined in PhotoStack's own .map())
// because it needs its own stable useTransform hooks per rules of hooks —
// they can't live inside a loop callback in the parent.
//
// Tuning fix, session 4: the exiting photo's x/y/rotate/scale/opacity used
// to be one multi-keyframe `animate` target (arrays with a shared `times`
// breakpoint), on the assumption that Motion would run every property
// through that timeline in lockstep. Measured instead (sampling the actual
// computed style across the transition, then fitting the observed curves
// against the EASE function): x's first segment genuinely ran ~290ms,
// matching the intended 0.6×DUR.reveal, but opacity's first segment ran
// ~166ms — a materially shorter, independently-scheduled clock, even given
// an identical explicit transition override (confirmed by removing
// boxShadow and by giving opacity its own explicit transition; neither
// changed the measured timing). The result: opacity finished fading and
// started recovering nearly 150ms before position reached its extremum, so
// the photo sat fully visible at x≈-140 for a stretch before position
// caught up — the reported "pause."
//
// The fix here is the same principle CLAUDE.md already documents for
// --strip-y in ProjectSection.tsx: don't let two properties compute their
// own timelines independently when they need to agree. `exitProgress` is
// one MotionValue, eased 0→1 by one imperative animate() call in
// PhotoStack's advance(); every exit-path property below is a pure
// useTransform of that same value, evaluated in the same frame — they
// cannot drift apart, because there is only one clock.
//
// One further wrinkle, found in review (see PHOTO_EXIT's own comment):
// "agree" does NOT mean opacity and position should share the same `times`.
// They did, briefly, and it produced a visible flash — opacity recovering
// on position's own return-trip schedule left a real window where the
// photo was visible before its geometry caught up to the spot that hides
// it. Position and opacity now read the same exitProgress but through
// deliberately different `times`, which is what actually delivers the
// dissolve cleanly: opacity only becomes visible once position is already
// there.
function PhotoLayer({
  photo,
  photoIndex,
  slot,
  isFrontSlot,
  isExitingThis,
  exitReleaseX,
  exitProgress,
  isBeingDragged,
  dragX,
  reducedMotion,
  targetZ,
}: {
  photo: Photo;
  photoIndex: number;
  slot: Slot;
  isFrontSlot: boolean;
  isExitingThis: boolean;
  exitReleaseX: number;
  exitProgress: MotionValue<number>;
  isBeingDragged: boolean;
  dragX: MotionValue<number>;
  reducedMotion: boolean;
  targetZ: number;
}) {
  const shadow = isFrontSlot ? "var(--shadow-photo)" : "var(--shadow-photo-none)";

  // useTransform's InputRange wants a mutable array; PHOTO_EXIT's times are
  // readonly tuples (`as const`) — copy once per render rather than
  // fighting the type with a cast. Position and opacity deliberately do NOT
  // share a times array — see PHOTO_EXIT's own comment for why: opacity
  // recovering on position's own schedule is what produced the visible
  // flash this session's fix addresses.
  const positionTimes = [...PHOTO_EXIT.times];
  const opacityTimes = [...PHOTO_EXIT.opacityTimes];
  // One EASE per segment (exitProgress supplying the times is linear, not
  // eased — see exitEase's own comment for why the two can't be the same
  // job). Opacity's middle segment is a hold (its keyframe value repeats),
  // so that particular entry's easing is moot, but useTransform still
  // requires one per segment.
  const positionEase = [exitEase, exitEase];
  const opacityEase = [exitEase, exitEase, exitEase];

  // Always created (rules of hooks) — only wired into style below when this
  // is the exiting layer. Idle otherwise; four photos is small enough that
  // this isn't worth conditionally constructing.
  const exitX = useTransform(exitProgress, positionTimes, [exitReleaseX, PHOTO_EXIT.exitX, slot.x], {
    ease: positionEase,
  });
  const exitY = useTransform(exitProgress, positionTimes, [0, PHOTO_EXIT.exitY, slot.y], {
    ease: positionEase,
  });
  const exitRotate = useTransform(exitProgress, positionTimes, [0, PHOTO_EXIT.exitRotate, slot.rotate], {
    ease: positionEase,
  });
  const exitScale = useTransform(exitProgress, positionTimes, [1, PHOTO_EXIT.exitScale, slot.scale], {
    ease: positionEase,
  });
  const exitOpacity = useTransform(exitProgress, opacityTimes, [1, 0, 0, 1], { ease: opacityEase });
  const exitZ = useTransform(exitProgress, (p) => (p < PHOTO_EXIT.zSwapAt ? FRONT_Z : 1));

  const onExitPath = isExitingThis && !reducedMotion;

  const style = {
    width: PHOTO_BOX,
    height: PHOTO_BOX,
    borderRadius: `calc(var(--radius-card) / ${slot.scale})`,
    ...(onExitPath
      ? { x: exitX, y: exitY, rotate: exitRotate, scale: exitScale, opacity: exitOpacity, zIndex: exitZ }
      : isBeingDragged
        ? { x: dragX }
        : null),
  };

  // boxShadow is the one property still driven declaratively — it only
  // ever has a single target (current vs. none), never multiple keyframes,
  // so it was never subject to the desync above and doesn't need routing
  // through exitProgress.
  const animateTarget = onExitPath
    ? { boxShadow: shadow }
    : isBeingDragged
      ? { y: slot.y, rotate: slot.rotate, scale: slot.scale, opacity: 1, boxShadow: shadow, zIndex: FRONT_Z }
      : { x: slot.x, y: slot.y, rotate: slot.rotate, scale: slot.scale, opacity: 1, boxShadow: shadow, zIndex: targetZ };

  const transition = reducedMotion ? { duration: 0 } : { duration: DUR.reveal, ease: EASE };

  return (
    <motion.div
      className="absolute left-0 top-0 overflow-hidden"
      style={style}
      animate={animateTarget}
      transition={transition}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="256px"
        className="object-cover"
        draggable={false}
        priority={photoIndex === 0}
        loading={photoIndex === 0 ? undefined : "eager"}
      />
    </motion.div>
  );
}

export function PhotoStack() {
  const reducedMotion = usePrefersReducedMotion();

  const [front, setFront] = useState(0);
  // The one photo currently running the deal-left exit path, and the x it
  // started that path from — 0 for a click/keyboard advance, the pointer's
  // release offset for a drag advance, so a completed drag hands off into
  // the exit animation from wherever the gesture actually let go rather
  // than restarting it from a fixed origin. Never explicitly cleared: the
  // next advance() call simply reassigns it to the new outgoing photo, so a
  // rapid second advance interrupts the first mid-flight rather than
  // queuing behind it.
  const [exit, setExit] = useState<{ photo: number; releaseX: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Live drag offset for whichever photo is currently in the front slot.
  // Bound via `style`, not `animate`, only while a drag is in progress (see
  // isBeingDragged below) — the two are never allowed to target x on the
  // same element at the same time, or Motion's declarative animate would
  // fight the pointer's own imperative .set() calls.
  const dragX = useMotionValue(0);
  // Shared 0→1 clock for the exiting photo's whole path — see PhotoLayer's
  // own comment for why every exit-path property derives from this one
  // value instead of each computing its own timeline.
  const exitProgress = useMotionValue(0);
  // Bug fix, session 4 (cursor-follow bug): these used to be ONE flag.
  // `dragging` now means exactly "a pointer gesture is currently down" and
  // must go false the instant pointerup/pointercancel fires — it's what
  // gates handlePointerMove, so any delay here is a delay before ordinary,
  // *uncaptured* hover-pointermove (which fires on the button any time the
  // cursor merely passes over it, capture or not — confirmed by console
  // trace: releasePointerCapture had already run, yet pointermove kept
  // arriving with dragging still true) starts being misread as drag input.
  // `springingBack` is a separate, purely visual concern: it keeps
  // style.x=dragX bound to the just-released photo for as long as the
  // below-threshold spring-back animation is still actually running, so
  // the handoff to the declarative rest animation doesn't race an
  // in-flight snap-back. The bug was conflating the two — a released,
  // barely-jittered click (dragX not exactly 0, which is the ordinary
  // case for a real hand, not the edge case) spends DUR.hover (~200ms)
  // animating back, and for that whole window the single old flag kept
  // handlePointerMove live.
  const [dragging, setDragging] = useState(false);
  const [springingBack, setSpringingBack] = useState(false);
  const startXRef = useRef(0);
  const movedRef = useRef(0);

  // Both input methods advance through this one function — the transition
  // exists exactly once.
  function advance(releaseX = 0) {
    setExit({ photo: front, releaseX });
    const next = (front + 1) % PHOTO_COUNT;
    setFront(next);
    setAnnouncement(PHOTOS[next].alt);

    if (!reducedMotion) {
      exitProgress.set(0);
      // Linear, deliberately: exitProgress is a wall-clock timer that every
      // exit-path property remaps through its own EASE'd keyframes (see
      // exitEase above) and the zIndex step function below — it must be a
      // faithful 0..1 fraction of elapsed time, or "0.6 of the way through
      // exitProgress" stops meaning "60% of DUR.reveal has elapsed."
      animate(exitProgress, 1, { duration: DUR.reveal, ease: "linear" });
    }
  }

  // Known first-pass limitation: a drag can be grabbed at any moment,
  // including mid-transition (right after a click or another drag, while
  // the deal-left path is still animating). Grabbing forces dragX to 0 and
  // rebinds this element's x to it, which can produce a small visible pop
  // if the photo wasn't already at rest. Left as-is deliberately — the
  // transition is only DUR.reveal (500ms), so this needs precise timing to
  // hit. Revisit only if it's actually visible on review.
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    startXRef.current = event.clientX;
    movedRef.current = 0;
    dragX.set(0);
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    const delta = event.clientX - startXRef.current;
    movedRef.current = Math.max(movedRef.current, Math.abs(delta));
    dragX.set(delta);
  }

  // Bound to both onPointerUp and onPointerCancel — one function both paths
  // funnel through, so release can't be duplicated (and skipped) per path.
  // Pointer capture release and `setDragging(false)` are BOTH unconditional
  // here, in the same place, the instant this fires — the gesture is over
  // regardless of which branch follows.
  function releaseDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);

    const delta = dragX.get();
    const thresholdPx = DRAG.thresholdFraction * PHOTO_BOX;

    if (delta <= -thresholdPx) {
      advance(delta);
      return;
    }

    // Below threshold, or dragged the wrong way: spring back to rest.
    // `springingBack`, not `dragging`, keeps style.x=dragX bound for as
    // long as this animation actually runs — see its own declaration
    // comment for why the two must be separate flags.
    setSpringingBack(true);
    animate(dragX, 0, {
      duration: reducedMotion ? 0 : DUR.hover,
      ease: EASE,
    }).then(() => setSpringingBack(false));
  }

  function handleClick() {
    // A completed drag already called advance() from the pointer handler
    // above; the browser still synthesizes a click after pointerup, so
    // this suppresses it whenever the gesture moved past slop — otherwise
    // every drag would advance the stack twice. Reset immediately after
    // reading, so a keyboard activation right after a drag isn't wrongly
    // suppressed by a stale value.
    const moved = movedRef.current;
    movedRef.current = 0;
    if (moved > DRAG.slop) return;
    advance();
  }

  return (
    <button
      type="button"
      aria-label="Show next photo in photostack"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releaseDrag}
      onPointerCancel={releaseDrag}
      className="relative block cursor-pointer select-none"
      style={{ ...STACK_SIZE, touchAction: "pan-y" }}
    >
      {PHOTOS.map((photo, photoIndex) => {
        const slotIndex = slotOf(photoIndex, front);
        const slot = SLOTS[slotIndex];
        const isFrontSlot = slotIndex === 0;
        const isExitingThis = exit !== null && exit.photo === photoIndex;
        // dragging OR springingBack: the style.x=dragX binding must stay in
        // place for the whole spring-back animation, not just the live
        // gesture — see the `springingBack` state's own comment.
        const isBeingDragged = (dragging || springingBack) && isFrontSlot && !isExitingThis;
        const exitReleaseX = isExitingThis && exit ? exit.releaseX : 0;

        return (
          <PhotoLayer
            key={photo.src}
            photo={photo}
            photoIndex={photoIndex}
            slot={slot}
            isFrontSlot={isFrontSlot}
            isExitingThis={isExitingThis}
            exitReleaseX={exitReleaseX}
            exitProgress={exitProgress}
            isBeingDragged={isBeingDragged}
            dragX={dragX}
            reducedMotion={reducedMotion}
            targetZ={FRONT_Z - slotIndex}
          />
        );
      })}

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </button>
  );
}
