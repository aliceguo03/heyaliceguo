"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react"
import { CURSOR, DUR, EASE, usePointerFine, usePrefersReducedMotion } from "@/lib/motion"

// Cursor label bubble (CLAUDE.md "Custom cursor", revised by the session-4
// plan into a bubble that supplements the pointer rather than replacing it —
// `cursor: none` appears nowhere on this site, the system cursor stays
// visible everywhere, including over the mail/LinkedIn icons). One instance,
// mounted at the layout root via CursorLabelProvider; MailButton and
// LinkedinLink (ui/ContactLinks.tsx) are its only two publishers.

type Tone = "action" | "copied"
type CursorLabelState = { label: string; tone: Tone } | null
type CursorLabelApi = { show: (label: string, tone: Tone) => void; hide: () => void }

const noopApi: CursorLabelApi = { show: () => {}, hide: () => {} }
const CursorLabelContext = createContext<CursorLabelApi>(noopApi)

// Publishers call this on hover enter/leave and whenever their own `copied`
// flips — never on mousemove (CLAUDE.md's "state changes on hover and on
// copy only"). Defaults to a no-op so a target rendered outside the provider
// (there isn't one today) degrades quietly instead of throwing.
export function useCursorLabel() {
  return useContext(CursorLabelContext)
}

// Renders no DOM of its own beyond the fixed-position bubble: `{children}`
// passes straight through, so body's flex column (layout.tsx) is unchanged.
// The bubble itself is `position: fixed`, out of that flow regardless.
export function CursorLabelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorLabelState>(null)

  // setState's own identity is stable across renders (React guarantee), so
  // this object's identity is too — publishers depend on it in an effect
  // dependency array (ContactLinks.tsx) and would otherwise re-fire on every
  // provider render for no reason.
  const api = useMemo<CursorLabelApi>(
    () => ({
      show: (label, tone) => setState({ label, tone }),
      hide: () => setState(null),
    }),
    [],
  )

  return (
    <CursorLabelContext.Provider value={api}>
      {children}
      <CursorBubble state={state} />
    </CursorLabelContext.Provider>
  )
}

function CursorBubble({ state }: { state: CursorLabelState }) {
  const pointerFine = usePointerFine()
  const reducedMotion = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Touch attaches nothing at all — no listener, no bubble — same top-guard
  // shape as useMagnet and usePointerFine's other consumers. Reduced motion
  // does NOT gate this effect: the bubble still appears there, just without
  // lag (see the retargeted animate() calls below) — so it's a dependency
  // that re-subscribes the listener with a fresh closure, not a per-event
  // ref read.
  useEffect(() => {
    if (!pointerFine) return

    function onPointerMove(event: PointerEvent) {
      const duration = reducedMotion ? 0 : DUR.hover
      // Retargeting an in-flight animate() call on every pointermove is what
      // produces the follow-lag: each new call smoothly redirects from
      // wherever the bubble currently is toward the latest pointer position,
      // rather than restarting from scratch. Reuses EASE/DUR.hover rather
      // than a spring or a new duration — CLAUDE.md's "no new easing curves
      // or durations" rule.
      animate(x, event.clientX + CURSOR.offsetX, { duration, ease: EASE })
      animate(y, event.clientY + CURSOR.offsetY, { duration, ease: EASE })
    }

    window.addEventListener("pointermove", onPointerMove)
    return () => window.removeEventListener("pointermove", onPointerMove)
  }, [pointerFine, reducedMotion, x, y])

  // No bubble at all on touch — nothing rendered, matching "attaches
  // nothing" for the listener above.
  if (!pointerFine) return null

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          data-cursor-bubble
          aria-hidden="true"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
          transition={{ duration: reducedMotion ? 0 : DUR.hover, ease: EASE }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            x,
            y,
            zIndex: "var(--z-cursor)",
            pointerEvents: "none",
          }}
          className="whitespace-nowrap rounded-panel border border-divider bg-true-white px-md py-s text-mono-caption font-mono"
        >
          <span className={state.tone === "copied" ? "text-dark-gray" : "text-accent-blue-light"}>
            {state.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
