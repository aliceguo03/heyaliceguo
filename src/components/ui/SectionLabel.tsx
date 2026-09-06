import type { ReactNode } from "react";

// Figma "SELECTED WORK." label (441:5986). `id` is optional: only the
// homepage's instance is a scroll/focus target (VIEW MY WORK jumps here),
// so it's opt-in rather than baked into every heading this renders.
export function SectionLabel({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} tabIndex={id ? -1 : undefined} className="text-mono-header font-mono text-dark-gray">
      {children}
    </h2>
  );
}
