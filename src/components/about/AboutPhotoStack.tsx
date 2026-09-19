"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { DRAG, DUR, EASE, PHOTO_EXIT, cubicBezier, usePrefersReducedMotion } from "@/lib/motion";
import { STACK_SIZE_MOBILE, PHOTO_BOX_MOBILE, SLOTS_MOBILE } from "@/components/home/PhotoStack";
import { ABOUT_HERO_PHOTOS } from "@/content/about";

// Mobile hero photo stack session (CLAUDE.md sub-session D). "Visually and
// interactively the same component family as the homepage's PhotoStack" —
// reuses that component's mechanics (advance(), the pointer-drag path, the
// two-flag dragging/springingBack split, the single-exitProgress-clock
// transform set, the <button>+aria-live a11y, eager loading) and its exact
// mobile geometry (STACK_SIZE_MOBILE/PHOTO_BOX_MOBILE/SLOTS_MOBILE,
// imported from PhotoStack.tsx, not re-typed — single source). Built as a
// SEPARATE file rather than a generalized prop on PhotoStack, per that
// session's own plan: the one real unknown below turned out to need its
// own timing, not just different data, so parameterizing PhotoStack
// itself would have meant threading a second exit-timing shape through an
// already-tuned, shipped component for a single caller. A shared-mechanics
// extraction is possible later if a third caller ever needs this; not
// pursued here to keep this session's own risk to the homepage at zero.
//
// The one real unknown, why this is its own session: PhotoStack's 4-photo
// SLOTS array has a coincident 4th slot (index 3, same x/y/rotate/scale as
// slot 2) that the exiting photo's own destination math lands on — see
// PhotoStack.tsx's own slotOf comment. That coincidence is what lets the
// exiting photo reappear already faded-out UNDER another photo, hidden
// until its own fade-in. About has only 3 photos, so there is no
// coincident slot to hide in: slotOf's own arithmetic (below) puts the
// exiting photo's destination at slot 2 directly — the LAST slot, nothing
// painted on top of it. Verified by rendering and sampling actual frames
// during a live advance() (not assumed): PHOTO_EXIT's existing schedule —
// opacity reaches 0 at the same instant position reaches its extremum,
// then holds at 0 until 0.85 before recovering — already has position
// effectively at rest well before opacity starts recovering (the same
// property PHOTO_EXIT's own comment in lib/motion.ts documents: ~99.4% of
// the return trip covered by p=0.85). That property holds regardless of
// what's behind the destination slot — it's about WHEN opacity moves
// relative to WHEN position finishes, not about occlusion — so the
// existing PHOTO_EXIT schedule reused unchanged here reads as a clean
// "photo settles into place, then fades in," not a pop or a flash, even
// with the destination now in full view the whole time. Confirmed with a
// rapid frame-sampled screenshot sequence across a live transition before
// deciding NOT to introduce a second, About-specific timing constant.

const exitEase = cubicBezier(EASE);

const PHOTO_COUNT = 3;
const FRONT_Z = 3;

// Only the first three slots — no coincident hidden 4th. See this file's
// own header comment for why that changes what the exit path lands on,
// not the geometry itself (front/mid/back are unchanged from PhotoStack's
// own SLOTS_MOBILE).
const SLOTS = SLOTS_MOBILE.slice(0, 3);

type Slot = (typeof SLOTS)[number];
type Photo = (typeof ABOUT_HERO_PHOTOS)[number];

function slotOf(photoIndex: number, front: number) {
  return (photoIndex - front + PHOTO_COUNT) % PHOTO_COUNT;
}

// Near-identical to PhotoStack.tsx's own PhotoLayer — see that component's
// comment for the full reasoning behind exitProgress-as-one-clock and the
// deliberately different times/opacityTimes arrays. Kept as a separate
// function (not imported) because PHOTO_COUNT/FRONT_Z close over different
// values here; genuinely shared logic between the two is the geometry
// math and the timing shape, not this closure itself.
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

  const positionTimes = [...PHOTO_EXIT.times];
  const opacityTimes = [...PHOTO_EXIT.opacityTimes];
  const positionEase = [exitEase, exitEase];
  const opacityEase = [exitEase, exitEase, exitEase];

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
    width: PHOTO_BOX_MOBILE,
    height: PHOTO_BOX_MOBILE,
    borderRadius: `calc(var(--radius-card) / ${slot.scale})`,
    ...(onExitPath
      ? { x: exitX, y: exitY, rotate: exitRotate, scale: exitScale, opacity: exitOpacity, zIndex: exitZ }
      : isBeingDragged
        ? { x: dragX }
        : null),
  };

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
        sizes={`${PHOTO_BOX_MOBILE}px`}
        className="object-cover"
        draggable={false}
        priority={photoIndex === 0}
        loading={photoIndex === 0 ? undefined : "eager"}
      />
    </motion.div>
  );
}

// Rendered only below --breakpoint-about (980) — AboutHero.tsx's own tier
// switch, holding the same 868px row down to that boundary in lockstep
// with the section rows below it (see aboutGeometry.ts's HERO_W comment),
// then swapping to this stack rather than the row once it stacks.
export function AboutPhotoStack() {
  const reducedMotion = usePrefersReducedMotion();

  const [front, setFront] = useState(0);
  const [exit, setExit] = useState<{ photo: number; releaseX: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const dragX = useMotionValue(0);
  const exitProgress = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [springingBack, setSpringingBack] = useState(false);
  const startXRef = useRef(0);
  const movedRef = useRef(0);

  function advance(releaseX = 0) {
    setExit({ photo: front, releaseX });
    const next = (front + 1) % PHOTO_COUNT;
    setFront(next);
    setAnnouncement(ABOUT_HERO_PHOTOS[next].alt);

    if (!reducedMotion) {
      exitProgress.set(0);
      animate(exitProgress, 1, { duration: DUR.reveal, ease: "linear" });
    }
  }

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

  function releaseDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);

    const delta = dragX.get();
    const thresholdPx = DRAG.thresholdFraction * PHOTO_BOX_MOBILE;

    if (delta <= -thresholdPx) {
      advance(delta);
      return;
    }

    setSpringingBack(true);
    animate(dragX, 0, {
      duration: reducedMotion ? 0 : DUR.hover,
      ease: EASE,
    }).then(() => setSpringingBack(false));
  }

  function handleClick() {
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
      style={{ ...STACK_SIZE_MOBILE, touchAction: "pan-y" }}
    >
      {ABOUT_HERO_PHOTOS.map((photo, photoIndex) => {
        const slotIndex = slotOf(photoIndex, front);
        const slot = SLOTS[slotIndex];
        const isFrontSlot = slotIndex === 0;
        const isExitingThis = exit !== null && exit.photo === photoIndex;
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
