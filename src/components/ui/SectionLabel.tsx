import type { ReactNode } from "react";

// Figma "SELECTED WORK." label (441:5986).
export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-mono-header font-mono text-dark-gray">{children}</h2>;
}
