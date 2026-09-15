"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import type { Project } from "@/content/projects";
import { useActiveRoute, useActiveProjectSlug } from "@/lib/useActiveRoute";
import { MailButton, LinkedinLink, useCopyEmail } from "@/components/ui/ContactLinks";

const RESUME_HREF = "/resume.pdf";

const NAV_ITEM =
  "flex items-center justify-center gap-sm rounded-nav px-btn-x py-btn-y text-mono font-mono transition-colors duration-200 ease-standard";

// Per Figma's nav button variants (427:4065): an item is either "selected"
// (deep-black, no hover fill) or "dimmed" (muted-gray, hover fill). Hover uses
// divider gray rather than Figma's original subtle gray — it reads better
// against the translucent backdrop. There is no selected+hover variant, so
// active items never get the fill.
function navItemColor(active: boolean) {
  return active ? "text-deep-black" : "text-muted-gray hover:bg-divider";
}

function CaretDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16.9133 8.16328L10.6633 14.4133C10.5762 14.5007 10.4727 14.57 10.3587 14.6173C10.2448 14.6647 10.1226 14.689 9.99922 14.689C9.87583 14.689 9.75366 14.6647 9.6397 14.6173C9.52575 14.57 9.42225 14.5007 9.33516 14.4133L3.08516 8.16328C2.90904 7.98716 2.81009 7.74829 2.81009 7.49922C2.81009 7.25015 2.90904 7.01128 3.08516 6.83516C3.26128 6.65904 3.50015 6.56009 3.74922 6.56009C3.99829 6.56009 4.23716 6.65904 4.41328 6.83516L10 12.4219L15.5867 6.83438C15.7628 6.65825 16.0017 6.55931 16.2508 6.55931C16.4999 6.55931 16.7387 6.65825 16.9148 6.83438C17.091 7.0105 17.1899 7.24937 17.1899 7.49844C17.1899 7.74751 17.091 7.98638 16.9148 8.1625L16.9133 8.16328Z"
        fill="currentColor"
      />
    </svg>
  );
}

// The desktop pill and dropdown, unchanged — split out of Nav.tsx in
// session R1 so a separate MobileNav.tsx (below --breakpoint-tablet) can
// exist alongside it. Lifted verbatim rather than adapted, so 1440/1710
// stay pixel-identical to before this session: only the outer `<nav>`'s own
// visibility class is new (`hidden tablet:block`; the rest of this file is
// the previous Nav.tsx byte-for-byte). `projects` is LIVE_PROJECTS — see
// Nav.tsx's own comment.
export function DesktopNav({ projects }: { projects: Project[] }) {
  const pathname = usePathname();
  const { isHome, isWork, isAbout } = useActiveRoute();
  // Shared with Footer.tsx — see useActiveRoute.ts's own comment.
  const activeSlug = useActiveProjectSlug();

  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close whenever the route changes — e.g. a click inside the dropdown.
  // Adjusted during render (not an effect) per the React-recommended pattern
  // for resetting state on a prop change — avoids an extra render pass.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Escape and outside-click close the dropdown while it's open.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Tabbing past the last item in the nav also closes it.
  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!navRef.current?.contains(event.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  const { copied, announcement, handleCopyEmail } = useCopyEmail();

  // WORK only reads as "selected" (deep-black) when its route is active and
  // the panel is closed — Figma's "opened" variant is always muted-gray,
  // matching "dimmed", regardless of route.
  const workActive = isWork && !open;

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      onBlur={handleBlur}
      // nav:, not tablet: — the pill's own content-derived floor (644,
      // globals.css "Breakpoints") is a different, independent number from
      // the mobile type step's 744, not a reuse of it. See MobileNav.tsx's
      // matching nav:hidden.
      className="sticky top-0 z-50 hidden h-nav-height nav:block"
    >
      <div
        className={`absolute left-1/2 top-0 flex -translate-x-1/2 flex-col gap-lg pt-sm ${
          open ? "rounded-card bg-ink px-md pb-lg" : ""
        }`}
      >
        <div
          className={`flex items-center gap-sm rounded-nav p-sm transition-colors duration-200 ease-standard ${
            open ? "bg-true-white" : "bg-menu-gradient/70 backdrop-blur-lg"
          }`}
        >
          <Link href="/" className={`${NAV_ITEM} ${navItemColor(isHome)}`}>
            HOME
          </Link>

          {/* Two independent targets sharing one visual pill (Figma's own
              nav button, 427:4065, only shows one control — this split is
              this session's own call, not a Figma variant). The color/hover
              fill lives on this wrapper, not on either child: CSS :hover
              matches an ancestor whenever the pointer is over any
              descendant, so hovering either the word or the arrow already
              paints the shared pill background — no group-hover class
              needed for them to read as one control.

              WORK (the word) is a plain toggle button for now, not a real
              `/work` link: that route 404s today (no Work index page
              exists yet — CLAUDE.md build order step 8 is still open). Flip
              this to `<Link href="/work">` with no onClick once that page
              ships; until then, keeping its old toggle behavior means
              nothing here regresses to a dead click. */}
          <div
            className={`flex items-center gap-sm rounded-nav py-btn-y pl-btn-x pr-btn-x text-mono font-mono transition-colors duration-200 ease-standard ${navItemColor(workActive)}`}
          >
            <button type="button" onClick={() => setOpen((value) => !value)}>
              WORK
            </button>
            {/* The arrow is the one real disclosure control: aria-expanded
                and aria-controls live here, not on the word. `size-btn-x`
                (24px, the same token the button padding elsewhere on this
                pill already uses) gives the arrow a full 24x24 clickable
                box around its 20px (size-md) glyph — a couple pixels more
                than the old single-button pill's own right inset, not
                pixel-identical, but this is a real touch-target floor, not
                a decorative measurement worth a fragile negative-margin
                trick to avoid. */}
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-controls="nav-work-menu"
              onClick={() => setOpen((value) => !value)}
              className="flex size-btn-x shrink-0 items-center justify-center"
            >
              <CaretDownIcon
                className={`size-md transition-transform duration-200 ease-standard ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <Link href="/about" className={`${NAV_ITEM} ${navItemColor(isAbout)}`}>
            ABOUT
          </Link>

          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={`${NAV_ITEM} ${navItemColor(false)}`}
          >
            RESUMÉ
          </a>

          <div className="flex items-center gap-sm px-btn-x py-btn-y">
            <MailButton
              copied={copied}
              onClick={handleCopyEmail}
              className="text-muted-gray transition-colors duration-200 ease-standard hover:text-accent-blue-light"
            />
            <LinkedinLink className="text-muted-gray transition-colors duration-200 ease-standard hover:text-accent-blue-light" />
          </div>
          <span aria-live="polite" className="sr-only">
            {announcement}
          </span>
        </div>

        {open && (
          <ul id="nav-work-menu" className="flex flex-col gap-sm pl-lg">
            {projects.map((project) => {
              // The current project reads permanently in --color-pure-white
              // (#F0F0F0) — the same color every item already brightens to
              // on hover, i.e. "ink's dark-mode counterpart" for text: the
              // established bright-on-dark token, not a new one (no Figma
              // reference for this state; --color-true-white was considered
              // and rejected — it's documented as an absolute/background
              // value in globals.css, not this system's text-on-dark color,
              // and pure-white is already exactly that role in this exact
              // dropdown). It gets no hover treatment at all — not just a
              // suppressed arrow — since every hover-only class is dropped
              // rather than overridden.
              const isActive = project.slug === activeSlug;
              return (
                <li key={project.slug}>
                  <Link
                    href={project.href}
                    className={
                      isActive
                        ? "group flex items-center gap-lg text-mono-header font-mono text-pure-white"
                        : "group flex items-center gap-lg text-mono-header font-mono text-light-gray transition-colors duration-200 ease-standard hover:text-pure-white"
                    }
                  >
                    {/* Session R1.1 Part C: checked, not assumed. This
                        dropdown's own reference frame (432:4563, "state=nav
                        expanded") draws the long form — F3GLOBAL, JPMORGAN
                        CHASE, GOOGLE GEMINICUT, UC SAN DIEGO BFS BLINK — so
                        project.name is correct here. MobileNav's switch to
                        footerLabel was a real fix for a real divergence (its
                        own reference frame, 938:4820, draws the short form,
                        because the long form was wrapping onto two lines in
                        that narrower panel) — it doesn't generalize to this
                        607-695px pill, which has never had a wrapping
                        problem. Don't "fix" this to match MobileNav. */}
                    {project.name}
                    <span
                      aria-hidden="true"
                      className={
                        isActive
                          ? "opacity-0"
                          : "opacity-0 transition-opacity duration-200 ease-standard group-hover:opacity-100"
                      }
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
