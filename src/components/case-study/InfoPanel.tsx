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
export function InfoPanel({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div
      data-info-panel
      className="sticky shrink-0 rounded-card border border-divider p-lg"
      style={{ top: STICKY_TOP, width: PANEL_W, height: compact ? PANEL_COMPACT_H : PANEL_H }}
    >
      {children}
    </div>
  );
}
