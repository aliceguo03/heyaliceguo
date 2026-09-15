"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/content/projects";
import { useActiveRoute, useActiveProjectSlug } from "@/lib/useActiveRoute";
import { MailButton, LinkedinLink, useCopyEmail } from "@/components/ui/ContactLinks";

const RESUME_HREF = "/resume.pdf";

function FooterLink({
  href,
  active = false,
  target,
  rel,
  children,
}: {
  href: string;
  active?: boolean;
  target?: string;
  rel?: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={`text-body font-sans text-pure-white transition-colors duration-200 ease-standard hover:text-light-gray ${
        active ? "font-black" : ""
      }`}
    >
      {children}
    </Link>
  );
}

// The two link columns — identical content and layout at every breakpoint
// (Home/About/Resumé, then LIVE_PROJECTS), so shared rather than repeated
// across the three footer variants below.
function FooterLinkColumns({
  projects,
  isHome,
  isAbout,
  activeSlug,
}: {
  projects: Project[];
  isHome: boolean;
  isAbout: boolean;
  activeSlug: string | null;
}) {
  return (
    <nav aria-label="Footer" className="flex gap-xl">
      <ul className="flex flex-col gap-s">
        <li>
          <FooterLink href="/" active={isHome}>
            Home
          </FooterLink>
        </li>
        <li>
          <FooterLink href="/about" active={isAbout}>
            About
          </FooterLink>
        </li>
        <li>
          <FooterLink href={RESUME_HREF} target="_blank" rel="noopener noreferrer">
            Resumé
          </FooterLink>
        </li>
      </ul>
      <ul className="flex flex-col gap-s">
        {projects.map((project) => (
          <li key={project.slug}>
            <FooterLink href={project.href} active={project.slug === activeSlug}>
              {project.footerLabel}
            </FooterLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function useSanDiegoTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });

    function tick() {
      setTime(formatter.format(new Date()));
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

// `projects` is LIVE_PROJECTS (content/liveProjects.ts), computed
// server-side in layout.tsx and passed down as a plain prop — see that
// file's own comment on why this component doesn't import PROJECTS
// directly.
//
// Session R1: three variants below --breakpoint-laptop/-tablet, toggled by
// CSS visibility (same reasoning as Nav.tsx's Desktop/Mobile split — no
// hydration flash, and `display:none` clears the inactive ones from the
// accessibility tree). Not two: the 744px iPad-mini frame's shell padding
// (px-md py-lg) and clock placement turned out to differ from both the
// >=1024 frame AND the <744 frame's own "circle back" row, which spreads
// its text and icons across the full row width (justify-between, no
// gap-lg cluster) rather than sitting tight together — three genuinely
// different arrangements, confirmed from three separate Figma frames
// (967:6199, 967:6291, 943:5247), not a single reflowing layout forced to
// cover all of them.
export function Footer({ projects }: { projects: Project[] }) {
  const { isHome, isAbout } = useActiveRoute();
  // Same route -> slug derivation Nav's WORK dropdown highlights off —
  // see useActiveRoute.ts's own comment.
  const activeSlug = useActiveProjectSlug();
  const { copied, announcement, handleCopyEmail } = useCopyEmail();
  const time = useSanDiegoTime();

  const linkColumns = (
    <FooterLinkColumns
      projects={projects}
      isHome={isHome}
      isAbout={isAbout}
      activeSlug={activeSlug}
    />
  );
  const announcer = (
    <span aria-live="polite" className="sr-only">
      {announcement}
    </span>
  );

  return (
    // Full-bleed padded wrapper + capped, centred footer — mirrors the
    // projects section's pattern (page.tsx) so the footer tracks the same
    // 1610px cap and gutter as the card frames above it (max-w-page,
    // globals.css) instead of growing unbounded past ~1725px viewports.
    <div className="px-page-x pb-lg">
      <div className="mx-auto max-w-page rounded-card bg-ink">
        {/* >=1024 (967:6199) — unchanged from before this session. */}
        <footer className="hidden flex-col gap-4xl p-lg laptop:flex">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-lg">
              <p className="flex items-center gap-sm text-mono font-mono text-pure-white">
                LET&rsquo;S CIRCLE BACK <span aria-hidden="true">→</span>
              </p>
              <div className="flex items-center gap-sm">
                <MailButton
                  copied={copied}
                  onClick={handleCopyEmail}
                  className="text-pure-white transition-colors duration-200 ease-standard hover:text-accent-blue"
                />
                <LinkedinLink className="text-pure-white transition-colors duration-200 ease-standard hover:text-accent-blue" />
                {announcer}
              </div>
            </div>
            <p className="text-mono font-mono text-light-gray">
              &ldquo;A DESIGNER IS A PLANNER WITH AN AESTHETIC SENSE.&rdquo;
            </p>
          </div>

          <div className="flex items-end justify-between">
            {linkColumns}
            <div className="flex items-center gap-lg">
              <p className="text-mono font-mono text-pure-white">SAN DIEGO, CA</p>
              <p className="text-mono font-mono text-accent-blue">{time ?? ""}</p>
            </div>
          </div>
        </footer>

        {/* 744-1023 (967:6291) — quote drops, clock relocates into row 1,
            stacked on the right; shell padding matches <744, not the
            uniform p-lg desktop uses (re-measured against the actual
            744px frame rather than assumed). */}
        <footer className="hidden flex-col gap-4xl px-md py-lg tablet:flex laptop:hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-lg">
              <p className="flex items-center gap-sm text-mono font-mono text-pure-white">
                LET&rsquo;S CIRCLE BACK <span aria-hidden="true">→</span>
              </p>
              <div className="flex items-center gap-sm">
                <MailButton
                  copied={copied}
                  onClick={handleCopyEmail}
                  className="text-pure-white transition-colors duration-200 ease-standard hover:text-accent-blue"
                />
                <LinkedinLink className="text-pure-white transition-colors duration-200 ease-standard hover:text-accent-blue" />
                {announcer}
              </div>
            </div>
            <div className="flex flex-col items-end gap-s">
              <p className="text-mono font-mono text-pure-white">SAN DIEGO, CA</p>
              <p className="text-mono font-mono text-accent-blue">{time ?? ""}</p>
            </div>
          </div>

          {linkColumns}
        </footer>

        {/* <744 (943:5247) — three rows: circle-back spans the full width
            (justify-between, not the gap-lg cluster above), links, then
            the clock as its own row, unstacked (city left, time right).
            Contact icons grow to size-icon-touch here only. */}
        <footer className="flex flex-col gap-4xl px-md py-lg tablet:hidden">
          <div className="flex w-full items-center justify-between">
            <p className="flex items-center gap-sm text-mono font-mono text-pure-white">
              LET&rsquo;S CIRCLE BACK <span aria-hidden="true">→</span>
            </p>
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
              {announcer}
            </div>
          </div>

          {linkColumns}

          <div className="flex w-full items-center justify-between">
            <p className="text-mono font-mono text-pure-white">SAN DIEGO, CA</p>
            <p className="text-mono font-mono text-accent-blue">{time ?? ""}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
