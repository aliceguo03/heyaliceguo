"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Project } from "@/content/projects";
import { useActiveRoute, useActiveProjectSlug } from "@/lib/useActiveRoute";
import { MailButton, LinkedinLink, useCopyEmail } from "@/components/ui/ContactLinks";
import { EASE, DUR, usePrefersReducedMotion } from "@/lib/motion";
import { STICKY_TOP } from "./navGeometry";

const RESUME_HREF = "/resume.pdf";

// Rest-state bar geometry for the hamburger glyph (Figma 935:4580's "nav
// icon": a 21x8 box, two lines, --color-dark-gray). Stroke weight isn't in
// Figma's metadata (a Line node reports 0 height) — 2px is this session's
// own estimate, flagged rather than treated as measured.
const BAR_WIDTH = 21;
const BAR_HEIGHT = 2;
const BAR_GAP = 6; // top bar's y=0, bottom bar's y=BAR_HEIGHT+BAR_GAP=8 — matches the 8px box

// Two bars rotating to an X — CLAUDE.md's mobile-nav carve-out asks for
// exactly this, and there's no Figma frame for the open state to match
// against (motion can't be drawn statically, same reasoning CLAUDE.md gives
// for the selected-work mechanic's layering). Hand-authored rects, not the
// remote asset get_design_context returned for the closed glyph — same
// precedent as DesktopNav's CaretDownIcon: a two-line glyph isn't real
// vector data worth committing a 7-day-expiring URL for.
function HamburgerIcon({ open, reducedMotion }: { open: boolean; reducedMotion: boolean }) {
  const transition = { duration: reducedMotion ? 0 : DUR.hover, ease: EASE };
  return (
    <svg width={BAR_WIDTH} height={BAR_GAP + BAR_HEIGHT} viewBox={`0 0 ${BAR_WIDTH} ${BAR_GAP + BAR_HEIGHT}`} aria-hidden="true">
      <motion.rect
        x="0"
        width={BAR_WIDTH}
        height={BAR_HEIGHT}
        fill="var(--color-dark-gray)"
        style={{ transformOrigin: "center" }}
        animate={open ? { y: BAR_GAP / 2, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
      <motion.rect
        x="0"
        width={BAR_WIDTH}
        height={BAR_HEIGHT}
        fill="var(--color-dark-gray)"
        style={{ transformOrigin: "center" }}
        animate={open ? { y: BAR_GAP / 2, rotate: -45 } : { y: BAR_GAP, rotate: 0 }}
        transition={transition}
      />
    </svg>
  );
}

const TOP_ITEM = "text-mono-header font-mono uppercase transition-colors duration-200 ease-standard";
const SUB_ITEM = "text-mono font-mono uppercase transition-colors duration-200 ease-standard";

// pure-white active / light-gray inactive, brightening to pure-white on
// hover — the same on-dark pair DesktopNav's own WORK dropdown uses
// (Nav.tsx's comment on --color-pure-white as "ink's dark-mode counterpart"
// applies here unchanged; this panel is the same bg-ink surface).
function linkColor(active: boolean) {
  return active ? "text-pure-white" : "text-light-gray hover:text-pure-white";
}

// Hamburger + full-content inset panel (Figma 935:4692 / 938:4820), below
// --breakpoint-tablet. Unlike DesktopNav's dropdown, WORK's project list has
// no second disclosure layer here — it's always expanded, so "WORK" is
// inert text, not a toggle. `projects` is LIVE_PROJECTS, same prop as
// DesktopNav — see Nav.tsx's own comment on why this component doesn't
// import PROJECTS directly.
export function MobileNav({ projects }: { projects: Project[] }) {
  const pathname = usePathname();
  const { isHome, isWork, isAbout } = useActiveRoute();
  const activeSlug = useActiveProjectSlug();
  const reducedMotion = usePrefersReducedMotion();

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close whenever the route changes — same pattern as DesktopNav's
  // dropdown, adjusted during render rather than in an effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Escape closes and returns focus to the hamburger; Tab is trapped inside
  // the panel while open — the keyboard parity DesktopNav's dropdown
  // already has (Escape + outside-click there), adapted to a takeover
  // panel's own focus needs rather than a dropdown's.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Move focus into the panel on open, same as a dialog would — nothing in
  // DesktopNav's dropdown needs this (its trigger and menu share one visual
  // pill), but a full takeover panel does.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
  }, [open]);

  const { copied, announcement, handleCopyEmail } = useCopyEmail();

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    // Swallow Tab's own default here isn't needed — the effect above only
    // traps once `open`, and this keydown fires before that state commits.
    if (event.key !== "Escape") return;
    setOpen(false);
  }

  return (
    <nav aria-label="Main" className="sticky top-0 z-50 block h-nav-height tablet:hidden">
      <div className="flex justify-end px-page-x pt-sm">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={handleTriggerKeyDown}
          className="flex items-center justify-center gap-sm rounded-nav bg-menu-gradient/50 p-sm"
        >
          <span className="flex items-center justify-center px-sm py-btn-y">
            <HamburgerIcon open={open} reducedMotion={reducedMotion} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-panel"
            ref={panelRef}
            className="fixed left-lg right-lg flex flex-col gap-lg rounded-card bg-ink p-lg"
            style={{ top: STICKY_TOP }}
            initial={{ opacity: 0, y: reducedMotion ? 0 : -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -16, pointerEvents: "none" }}
            transition={{ duration: reducedMotion ? 0 : DUR.reveal, ease: EASE }}
          >
            <Link href="/" className={`${TOP_ITEM} ${linkColor(isHome)}`}>
              HOME
            </Link>

            <div className="flex flex-col gap-md">
              {/* Inert on mobile — no second disclosure layer, the whole
                  list below is always visible, so there's nothing for this
                  label to toggle (unlike DesktopNav's WORK, which is a real
                  button). */}
              <span className={`${TOP_ITEM} ${linkColor(isWork)}`}>WORK</span>
              <ul className="flex flex-col gap-sm">
                {projects.map((project) => {
                  const isActive = project.slug === activeSlug;
                  return (
                    <li key={project.slug} className="px-md">
                      <Link href={project.href} className={`${SUB_ITEM} ${linkColor(isActive)}`}>
                        {project.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link href="/about" className={`${TOP_ITEM} ${linkColor(isAbout)}`}>
              ABOUT
            </Link>

            <a
              href={RESUME_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={`${TOP_ITEM} ${linkColor(false)}`}
            >
              RESUMÉ
            </a>

            <div className="flex items-center gap-sm">
              <MailButton
                copied={copied}
                onClick={handleCopyEmail}
                iconClassName="size-icon-touch"
                className="text-pure-white transition-colors duration-200 ease-standard hover:text-accent-blue"
              />
              <LinkedinLink
                iconClassName="size-icon-touch"
                className="text-pure-white transition-colors duration-200 ease-standard hover:text-accent-blue"
              />
            </div>
            <span aria-live="polite" className="sr-only">
              {announcement}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
