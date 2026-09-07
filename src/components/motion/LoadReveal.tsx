"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"
import { EASE, LOAD } from "@/lib/motion"

// The fade-and-rise wrapper for everything in the hero's load sequence after
// the wordmark (photo stack, each bio line, the button) — see CLAUDE.md
// "Hero load sequence". Deliberately separate from ScrollReveal
// (src/components/motion/ScrollReveal.tsx): that component is
// viewport-triggered and fires once on scroll; this one is clock-triggered
// from mount against useLoadSequence's shared timeline. Merging the two would
// mean one component with two mutually exclusive trigger modes.
const TAGS = {
  div: "div",
  li: "li",
} as const

type Tag = keyof typeof TAGS

type LoadRevealProps = {
  children: ReactNode
  className?: string
  play: boolean
  delay: number
  as?: Tag
}

export function LoadReveal({ children, className, play, delay, as = "div" }: LoadRevealProps) {
  const MotionTag = motion[TAGS[as]]

  return (
    <MotionTag
      data-load
      className={className}
      initial={play ? { opacity: 0, y: LOAD.fadeY } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: LOAD.fadeDuration, ease: EASE, delay: play ? delay : 0 }}
    >
      {children}
    </MotionTag>
  )
}
