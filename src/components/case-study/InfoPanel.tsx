import type { ReactNode } from "react";
import { STICKY_TOP } from "@/components/chassis/navGeometry";
import { PANEL_COMPACT_H, PANEL_H, PANEL_W } from "./caseStudyGeometry";

// The 383x840 (or 600 compact) shell shared by the overview metadata panel
// (736:6047) and the section sidebar (736:6071/839:3144/839:3145) — one
// sticky shell, two content variants (PanelMeta.tsx, PanelNav.tsx) swapped
// by CasePanel.tsx. Session "case-study panel behaviour" makes this the
// panel's only instance on the page: previously two separate InfoPanels sat
// in two separate sections, which meant two independent sticky contexts —
// see this session's plan for why the two static sections had to merge into
// one row before a single sticky panel was possible at all.
//
// Sticky, not fixed: the row this sits in (CaseStudyBody.tsx) is
// `items-start`, so the shell pins at STICKY_TOP relative to its own
// containing block and releases naturally once the row's own content runs
// out — no separate release calculation needed, unlike About's frame (which
// pins against a taller, independently-scrolled content column).
//
// Fixed height, not content-driven, in both variants: PanelMeta and PanelNav
// each pad their own content to fill exactly PANEL_H (or PANEL_COMPACT_H)
// so the content swap this session adds never reflows the shell.
//
// Session R5 (case study responsive pass): below --breakpoint-desktop the
// panel isn't a compact sticky variant, it's gone — Figma's tablet mock
// has no sidebar node at all in that range (see CasePanel.tsx's own
// comment on its `belowDesktop` gate). `fixed` is what CasePanel passes to
// say which shape this render is: `true` (desktop) keeps every existing
// prop — sticky, exact width/height from PANEL_W/PANEL_H/PANEL_COMPACT_H —
// byte-identical to before this session; `false` (tablet/phone) drops the
// inline style entirely and lets the box take its grid cell's own width
// (383px at tablet, full-width at phone — CaseStudyBody.tsx's grid) and
// its own content height, matching the tablet mock's plain bordered box.
// `col-start-1 row-start-1` is the SAME placement at every tier (phone's
// single-column grid, tablet's two-column grid, and desktop's two
// effective grid items both resolve to "first column, first row" — see
// CaseStudyBody.tsx's own comment for why no tier-specific override is
// needed here). `mb-lg tablet:mb-0`: at phone the panel stacks above the
// overview text with a 30+30 split gap (this box's own bottom margin plus
// the text group's own top margin, OverviewContent.tsx); at tablet the two
// sit side by side instead, so this margin is cancelled and the row's own
// `gap-x-xl` (CaseStudyBody.tsx) supplies the gap between them instead.
export function InfoPanel({
  children,
  fixed,
  compact = false,
  chrome = true,
}: {
  children: ReactNode;
  fixed: boolean;
  compact?: boolean;
  // Fix pass (item 3, sidebar stacking transition): CasePanel.tsx's
  // scroll-linked stacking mechanic needs the border/radius/padding/
  // background to travel WITH whichever layer is moving, not sit fixed on
  // this shared shell — otherwise only the text slides while the "card"
  // chrome around it stays put. `false` there strips those classes from
  // this div entirely and CasePanel.tsx applies the identical values to
  // each of its two layers instead, so each one is a genuine self-contained
  // card. Every other caller (the belowDesktop static box, and the
  // reduced-motion single-layer render) keeps the default `true` — neither
  // has anything sliding, so the shell owning its own chrome is correct
  // there, unchanged from before this session.
  chrome?: boolean;
}) {
  return (
    <div
      data-info-panel
      className={`col-start-1 row-start-1 mb-lg tablet:mb-0 desktop:sticky desktop:shrink-0 ${
        chrome ? "rounded-card border border-divider p-lg" : ""
      }`}
      style={fixed ? { top: STICKY_TOP, width: PANEL_W, height: compact ? PANEL_COMPACT_H : PANEL_H } : undefined}
    >
      {children}
    </div>
  );
}
