"use client"

import { motion } from "motion/react"
import { createContext, useContext, useState, type ReactNode } from "react"
import { DUR, EASE, usePrefersReducedMotion } from "@/lib/motion"

// Lets a descendant (Stats.tsx's count-up) key off the *same* whileInView
// crossing that reveals its enclosing block, instead of standing up a
// second IntersectionObserver for the same element. Default `true` covers
// every render path that isn't inside an active ScrollReveal: outside any
// ScrollReveal entirely, and the reduced-motion branch below (which renders
// no provider at all) — both cases where a descendant should treat itself
// as already "revealed" rather than waiting on a crossing that never fires.
const RevealedContext = createContext(true)
export function useRevealed() {
  return useContext(RevealedContext)
}

// The site's one scroll-triggered entrance primitive. Every reveal goes
// through this component rather than a one-off motion.div — see CLAUDE.md
// "Animation system".
//
// Constraint that must never be violated: motion/react sets `transform` on
// whatever it animates, and a transformed ancestor creates a new containing
// block that breaks `position: sticky` / `position: fixed` on descendants.
// So ScrollReveal must never wrap an element that is, or contains, a sticky
// element. Where both are needed, they're two separate nodes — reveal
// outside and sticky inside as its own element, or the reverse. This is why
// the stacked project cards animate by pinning, not by revealing.
const TAGS = {
  div: "div",
  section: "section",
  span: "span",
  li: "li",
  p: "p",
  h2: "h2",
  h3: "h3",
  ul: "ul",
} as const

type Tag = keyof typeof TAGS

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: Tag
}

// Scroll reveals travel 16-24px, never more (CLAUDE.md "Animation system" →
// Rules). Clamped here rather than left to callers, and clamped on
// magnitude so a negative y (revealing downward) is capped at -24 rather
// than passing through unbounded.
const MAX_TRAVEL = 24

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 20,
  as = "div",
}: ScrollRevealProps) {
  const reducedMotion = usePrefersReducedMotion()
  const travel = Math.sign(y) * Math.min(Math.abs(y), MAX_TRAVEL)
  // Own state, not read back off the viewport prop above: onViewportEnter
  // fires once, at the same crossing whileInView reacts to, off the same
  // observer motion/react already attaches to this element — this isn't a
  // second observer, just a second callback on the one motion/react sets up
  // for `viewport`.
  const [entered, setEntered] = useState(false)

  if (reducedMotion) {
    const Plain = TAGS[as]
    return (
      <Plain data-reveal className={className}>
        {children}
      </Plain>
    )
  }

  const MotionTag = motion[TAGS[as]]

  return (
    <MotionTag
      data-reveal
      className={className}
      initial={{ opacity: 0, y: travel }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setEntered(true)}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: DUR.reveal, ease: EASE, delay }}
    >
      <RevealedContext.Provider value={entered}>{children}</RevealedContext.Provider>
    </MotionTag>
  )
}
