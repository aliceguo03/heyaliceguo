"use client"

import { useEffect, useRef } from "react"
import { animate, useMotionValue, type MotionValue } from "motion/react"
import { EASE, MAGNET, usePointerFine, usePrefersReducedMotion } from "@/lib/motion"

// Magnetic hover for primary black-fill buttons (CLAUDE.md "Magnetic
// button"). Adapted from the React Bits Magnet snippet, with five changes
// against that reference, all deliberate:
//
// - No wrapper element. The reference's `position: relative; display:
//   inline-block` wrapper div would change how a button sits inside its
//   parent's flex layout (e.g. ProjectTileContent's `justify-between` row) —
//   most likely to bite exactly where a button already sits at a flex edge.
//   This hook returns a ref plus a MotionValue style pair instead, meant to
//   be spread directly onto `motion.button` / `motion.create(Link)` so the
//   wrapped element IS the button — zero new DOM nodes, so boxes are
//   identical by construction, not by measurement.
// - MotionValues, not useState. The reference re-renders React on every
//   mousemove; position updates here never re-render.
// - One shared `pointermove` + one shared rAF loop for every registered
//   button, not one listener per instance (six buttons on this page would
//   otherwise mean six window listeners). Still true after the contact-only
//   change below: the pull vector has to keep tracking the cursor's exact
//   position for as long as it's inside the box, which is a per-frame
//   concern, not a one-shot enter/leave — a shared loop over the (at most
//   three, ever) live entries stays cheaper than N per-element listeners.
// - Contact-only activation: a literal hit test against the button's own
//   rect (already cached per-entry for the pull vector itself), not a
//   proximity radius. Tuning fix, session 4 review: the first-pass version
//   pulled the button before the cursor reached it (an 80px radius beyond
//   the rect's edge); nothing moves now until the cursor is physically over
//   the box. See MAGNET's own comment for why there's no `radius` constant
//   any more. Once inside, the pull still tracks pointer-to-center distance
//   the same way as before.
// - Offset capped at MAGNET.maxOffset (scaling the whole vector, so
//   direction is preserved); the reference's is uncapped.
//
// Keyboard focus is inert by design: a :focus-visible element is excluded
// from the loop entirely and held at (0, 0), so the focus ring can never
// drift off the target.
export function useMagnet<T extends HTMLElement = HTMLElement>(enabled: boolean) {
  const pointerFine = usePointerFine()
  const reducedMotion = usePrefersReducedMotion()
  const ref = useRef<T>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Touch and reduced motion attach nothing at all (never register, rather
  // than registering and no-opping) — same top-guard shape as
  // useProjectSnap, per usePointerFine's own precedent.
  const active = enabled && pointerFine && !reducedMotion

  useEffect(() => {
    const el = ref.current
    if (!el || !active) return

    const entry: Entry = {
      el,
      x,
      y,
      rect: el.getBoundingClientRect(),
      scrollY: window.scrollY,
      dirty: false,
      pulling: false,
      focused: false,
      releaseX: null,
      releaseY: null,
    }

    function onFocus(event: FocusEvent) {
      if (!(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return
      entry.focused = true
      entry.pulling = false
      entry.releaseX?.stop()
      entry.releaseY?.stop()
      x.set(0)
      y.set(0)
    }
    function onBlur() {
      entry.focused = false
    }
    el.addEventListener("focus", onFocus)
    el.addEventListener("blur", onBlur)

    const resizeObserver = new ResizeObserver(() => {
      entry.dirty = true
    })
    resizeObserver.observe(el)

    registry.add(entry)
    attachSharedListeners()

    return () => {
      registry.delete(entry)
      el.removeEventListener("focus", onFocus)
      el.removeEventListener("blur", onBlur)
      resizeObserver.disconnect()
      entry.releaseX?.stop()
      entry.releaseY?.stop()
      // Reset immediately rather than leaving whatever offset was live —
      // this fires whenever `active` flips false too (e.g. a card CTA's
      // visibility gate closing mid-pull), not only on unmount.
      x.set(0)
      y.set(0)
      detachSharedListenersIfIdle()
    }
    // x and y are stable across renders (useMotionValue, like useRef) —
    // listed for exhaustive-deps, not because either identity ever changes.
  }, [active, x, y])

  return { ref, style: { x, y } }
}

// --- Shared registry, one per page load, not one per hook instance --------

type ReleaseControls = ReturnType<typeof animate> | null

type Entry = {
  el: HTMLElement
  x: MotionValue<number>
  y: MotionValue<number>
  rect: DOMRect
  scrollY: number
  dirty: boolean
  pulling: boolean
  focused: boolean
  releaseX: ReleaseControls
  releaseY: ReleaseControls
}

const registry = new Set<Entry>()

let pointerX = 0
let pointerY = 0
let rafId: number | null = null
let listenersAttached = false

function attachSharedListeners() {
  if (listenersAttached) return
  listenersAttached = true
  window.addEventListener("pointermove", onPointerMove)
  window.addEventListener("resize", onWindowResize)
}

function detachSharedListenersIfIdle() {
  if (registry.size > 0 || !listenersAttached) return
  listenersAttached = false
  window.removeEventListener("pointermove", onPointerMove)
  window.removeEventListener("resize", onWindowResize)
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function onPointerMove(event: PointerEvent) {
  pointerX = event.clientX
  pointerY = event.clientY
  // Scheduled from the event that actually moves the pointer, not a free-
  // running loop — while the pointer sits still, nothing runs. rAF itself
  // de-dupes bursts of pointermove down to at most one measurement/write
  // pass per frame (the guard in ensureLoop, via `rafId`).
  ensureLoop()
}

function onWindowResize() {
  // One shared listener marks every entry dirty; each entry additionally
  // carries its own ResizeObserver for element-level (not viewport-level)
  // size changes.
  for (const entry of registry) entry.dirty = true
}

function ensureLoop() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(tick)
}

// All reads (rect measurement) happen before any writes (MotionValue.set /
// animate) in this callback, so a write can never invalidate a measurement
// taken later in the same frame — see the entries loop split below.
function tick() {
  rafId = null
  if (registry.size === 0) return

  const measured: Entry[] = []
  for (const entry of registry) {
    if (entry.focused) continue
    // Cache-invalidate on scroll delta, not on every scroll event: a
    // getBoundingClientRect() is viewport-relative, so it goes stale on any
    // scroll (sticky-positioned card buttons included — their document
    // position isn't constant during scroll, so caching in document
    // coordinates and subtracting scrollY at use time would be wrong for
    // them specifically). Comparing scrollY here means hovering without
    // scrolling — the common case — remeasures nothing.
    if (entry.dirty || entry.scrollY !== window.scrollY) {
      entry.rect = entry.el.getBoundingClientRect()
      entry.scrollY = window.scrollY
      entry.dirty = false
    }
    measured.push(entry)
  }

  for (const entry of measured) {
    const { rect } = entry
    // Contact, not proximity: a literal hit test against the button's own
    // rect. No padding, no radius beyond the edge — see MAGNET's own comment
    // for why that field is gone.
    const withinBox =
      pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom

    if (withinBox) {
      entry.releaseX?.stop()
      entry.releaseY?.stop()
      entry.releaseX = null
      entry.releaseY = null
      entry.pulling = true

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      let pullX = (pointerX - centerX) * MAGNET.strength
      let pullY = (pointerY - centerY) * MAGNET.strength
      const magnitude = Math.hypot(pullX, pullY)
      if (magnitude > MAGNET.maxOffset && magnitude > 0) {
        const scale = MAGNET.maxOffset / magnitude
        pullX *= scale
        pullY *= scale
      }
      entry.x.set(pullX)
      entry.y.set(pullY)
    } else if (entry.pulling) {
      // Edge-triggered: fires once on the active→inactive transition, not
      // every frame the pointer stays away, so re-entering the radius mid-
      // release can hand straight back to the direct `.set()` path above
      // (which itself stops any in-flight release) without fighting a
      // repeatedly-restarted animation.
      entry.pulling = false
      entry.releaseX = animate(entry.x, 0, { duration: MAGNET.release, ease: EASE })
      entry.releaseY = animate(entry.y, 0, { duration: MAGNET.release, ease: EASE })
    }
  }
}
