import type { ReactNode } from "react";
import { PANEL_H, PANEL_W } from "./caseStudyGeometry";

// The 383x840 shell shared by the overview metadata panel (736:6047) and
// the section sidebar (736:6071) — one component, two content variants
// (PanelMeta.tsx, PanelNav.tsx), so a later session can make this shell
// sticky in one place instead of two. Fixed height rather than
// content-driven, matching Figma exactly (see caseStudyGeometry.ts).
//
// Deliberately just the box: each variant owns its own vertical
// distribution down to the LIVE SITE pill, because the two variants
// distribute differently in Figma, not identically. PanelMeta's five rows
// use a fixed gap-md, with one big justify-between gap before the pill
// (I736:6071 -> I672:4320's sibling instance shows a single large gap
// between the roles block and the pill). PanelNav's four topics and the
// pill instead sit in one flat justify-content: space-between run — all
// five gaps in the real page instance (736:6071) measured equal — so
// folding a pill prop in here and giving it special treatment would have
// reproduced the wrong one of the two.
export function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="shrink-0 rounded-card border border-divider p-lg"
      style={{ width: PANEL_W, height: PANEL_H }}
    >
      {children}
    </div>
  );
}
