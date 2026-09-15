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
export function Footer({ projects }: { projects: Project[] }) {
  const { isHome, isAbout } = useActiveRoute();
  // Same route -> slug derivation Nav's WORK dropdown highlights off —
  // see useActiveRoute.ts's own comment.
  const activeSlug = useActiveProjectSlug();
  const { copied, announcement, handleCopyEmail } = useCopyEmail();
  const time = useSanDiegoTime();

  return (
    // Full-bleed padded wrapper + capped, centred footer — mirrors the
    // projects section's pattern (page.tsx) so the footer tracks the same
    // 1610px cap and gutter as the card frames above it (max-w-page,
    // globals.css) instead of growing unbounded past ~1725px viewports.
    <div className="px-xl pb-lg">
      <footer className="mx-auto flex max-w-page flex-col gap-4xl rounded-card bg-ink p-lg">
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
              <span aria-live="polite" className="sr-only">
                {announcement}
              </span>
            </div>
          </div>
          <p className="text-mono font-mono text-light-gray">
            &ldquo;A DESIGNER IS A PLANNER WITH AN AESTHETIC SENSE.&rdquo;
          </p>
        </div>

        <div className="flex items-end justify-between">
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
          <div className="flex items-center gap-lg">
            <p className="text-mono font-mono text-pure-white">SAN DIEGO, CA</p>
            <p className="text-mono font-mono text-accent-blue">{time ?? ""}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
