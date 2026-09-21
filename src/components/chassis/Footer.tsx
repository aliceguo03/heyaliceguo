"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/content/projects";
import { useActiveRoute, useActiveProjectSlug } from "@/lib/useActiveRoute";
import { MailButton, LinkedinLink, useCopyEmail } from "@/components/ui/ContactLinks";
import { ArrowClockwiseIcon } from "@/components/ui/icons/ArrowClockwiseIcon";
import { useFooterQuote } from "@/components/chassis/useFooterQuote";
import { useFooterQuoteLayout } from "@/components/chassis/useFooterQuoteLayout";

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
    // Row gap is 12 below the footer tier and 8 at/above it — re-measured
    // against 988:7351 (12, rows pitch 32 with a 20px line height) versus
    // 988:7508/967:6199 (8, pitch 35 with a 27px line height). The 50px
    // gap between the two columns (gap-xl) is unaffected and holds at
    // every tier.
    <nav aria-label="Footer" className="flex gap-xl">
      <ul className="flex flex-col gap-sm footer:gap-s">
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
      <ul className="flex flex-col gap-sm footer:gap-s">
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
// Session R1: three variants (gated on --breakpoint-footer-desktop/-footer,
// Session R1.1 Part D — 1024/"--breakpoint-laptop" was never this footer's
// own boundary, see --breakpoint-footer-desktop's comment), toggled by
// CSS visibility (same reasoning as Nav.tsx's Desktop/Mobile split — no
// hydration flash, and `display:none` clears the inactive ones from the
// accessibility tree). Not two: the 744px iPad-mini frame's shell padding
// (px-md py-lg) and clock placement turned out to differ from both the
// desktop frame AND the <519 frame's own "circle back" row, which spreads
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
  const { quote, reroll } = useFooterQuote();
  const { rowRef, clusterRef, quoteGroupRef, textRef, buttonRef, lines } = useFooterQuoteLayout(quote);

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
        {/* --breakpoint-footer-desktop: see globals.css's own comment — the
            quote row's own overlap failure mode this boundary used to
            protect against is gone now that the quote is a real flex
            sibling (see below), so this is back to the general laptop
            breakpoint rather than a footer-specific measurement. */}
        <footer className="hidden flex-col gap-4xl p-lg footer-desktop:flex">
          <div ref={rowRef} className="flex h-icon items-start justify-between">
            {/* shrink-0: this cluster was never designed to shrink or wrap —
                it's meant to hold a fixed, measured width always. Without
                this, real flexbox shrinks both row siblings together once
                the row runs out of room, and this one wraps first ("LET'S
                CIRCLE BACK" breaking across two lines) since the quote's
                own shrink floor (its longest word) is narrower. All the
                give belongs to the quote alone — its own available width is
                exactly what useFooterQuoteLayout.ts measures off this
                cluster's real rendered width, not a guess. */}
            <div ref={clusterRef} className="flex shrink-0 items-center gap-lg">
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

            {/* useFooterQuoteLayout.ts (CLAUDE.md "Footer quote — wrapping,
                alignment, and orphan control") owns everything about how
                this renders: it measures the row's real available width
                (this element's own width, minus the cluster's, both read
                live off the DOM — never a flat number), fits the quote into
                real, orphan-free lines against that width (line 1 reduced
                by the reload button's own footprint), and — since the fit
                only tells you what WOULD fit, not where the button should
                actually sit relative to whatever line 1 ends up rendering
                at — measures line 1's real rendered position afterward and
                pins the button a fixed gap from it directly, imperatively.
                `lines` is null only for the one render before the very
                first measurement lands (unavoidable: real font-metric
                measurement can't run during SSR, so even the
                deterministic DEFAULT_QUOTE needs one client pass) — the
                fallback below is what shipped before this session, not
                empty space, so a hard load shows real text immediately and
                swaps to the fitted version a frame later rather than
                popping in from nothing. Every update after that first one
                swaps directly from the old fitted lines to the new ones —
                see the hook's own comment for why `lines` never resets to
                null again after landing. Height-neutrality is unaffected
                (h-icon + default overflow:visible on this row, same as
                before); width-independence from hover is structural, not
                tuned — the button has been out of normal flow since this
                rewrite, so its opacity toggling was never going to move
                anything to begin with. */}
            {lines ? (
              <div ref={quoteGroupRef} className="group relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={reroll}
                  aria-label="Show another quote"
                  className="absolute top-0 opacity-0 transition-opacity duration-200 ease-standard group-hover:opacity-100 group-focus-within:opacity-100 text-light-gray hover:text-pure-white"
                >
                  <ArrowClockwiseIcon className="size-icon" />
                </button>
                <p ref={textRef} className="w-fit text-right text-mono font-mono text-light-gray">
                  {lines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            ) : (
              <div className="group flex items-start gap-footer-quote-gap">
                <button
                  type="button"
                  onClick={reroll}
                  aria-label="Show another quote"
                  className="shrink-0 opacity-0 transition-opacity duration-200 ease-standard group-hover:opacity-100 group-focus-within:opacity-100 text-light-gray hover:text-pure-white"
                >
                  <ArrowClockwiseIcon className="size-icon" />
                </button>
                <p className="text-right text-mono font-mono text-light-gray">“{quote}”</p>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            {linkColumns}
            <div className="flex items-center gap-lg">
              <p className="text-mono font-mono text-pure-white">SAN DIEGO, CA</p>
              <p className="text-mono font-mono text-accent-blue">{time ?? ""}</p>
            </div>
          </div>
        </footer>

        {/* 519-1023 (967:6291 at 744, the widest and only frame this tier
            has — Session R1.1 Part B extended its own render range down to
            this tier's content-derived floor, well below any Figma sample
            point; see globals.css's "Breakpoints" comment). Quote drops,
            clock relocates into row 1, stacked on the right.
            Session R1.1 Part C correction: shell padding is the uniform
            p-lg (30), same as desktop — commit c80ac08's recorded "px-md
            py-lg (20/30), matching <744" was a misread of the page gutter
            one level out (744 - 704 = 40, i.e. 20/side) rather than the
            footer's own padding. 988:7508's children sit at x=30 in a
            704-wide footer: 30 + 644 + 30 = 704. This cost the row 20px of
            content width at every viewport, which is why the floor moved
            from 499 to 519 (globals.css's "Breakpoints" comment).
            Session R1.1 Part D raised the upper bound past 1024 (to 1124,
            then 1137, then 1175) for a quote-overlap reason the natural-
            minimum-line-wrapping session removed — --breakpoint-footer-
            desktop is back at 1024 now, so this tier's own upper bound is
            too. */}
        <footer className="hidden flex-col gap-4xl p-lg footer:flex footer-desktop:hidden">
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

        {/* <519 (943:5247 at 430 — again the widest sample point, not the
            boundary itself; Session R1.1 Part B) — three rows: circle-back
            spans the full width (justify-between, not the gap-lg cluster
            above), links, then the clock as its own row, unstacked (city
            left, time right). Contact icons grow to size-icon-touch here
            only.

            Session R1.1 Part C: the outer gap-4xl (212) is the "circle
            back" -> "bottom frame" gap only. Figma nests the link columns
            and the clock row inside that "bottom frame" wrapper with their
            own, much smaller internal gap (50, gap-xl) — links.height 148
            to time-and-place's y=198 on 943:5247/988:7351 — so they're
            wrapped in their own gap-xl group here rather than sharing the
            outer 212. */}
        <footer className="flex flex-col gap-4xl px-md py-lg footer:hidden">
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

          <div className="flex flex-col gap-xl">
            {linkColumns}

            <div className="flex w-full items-center justify-between">
              <p className="text-mono font-mono text-pure-white">SAN DIEGO, CA</p>
              <p className="text-mono font-mono text-accent-blue">{time ?? ""}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
