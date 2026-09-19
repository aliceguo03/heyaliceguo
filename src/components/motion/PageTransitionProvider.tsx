"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Remembers the route navigated FROM, for FlipText's title flip (Wordmark /
// PageTitle both read this via usePreviousRoute()). Mounted once in
// layout.tsx, wrapping <SmoothScroll>, so it survives every client-side
// route change the way Nav/Footer/SmoothScroll already do.
const PreviousRouteContext = createContext<string | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Tracks the route we just navigated FROM using React's own "adjusting
  // state during render" pattern (react.dev, "You Might Not Need an
  // Effect") rather than a ref written in an effect: comparing this
  // render's pathname against the pathname remembered from the last
  // render, and updating both pieces of state in the same render pass when
  // they differ. Deliberately NOT a ref — this project's React Compiler
  // rejects reading a ref's `.current` during render (`react-hooks/refs`),
  // and an effect-written ref would run one render late anyway: a
  // destination title reads "previous route" on its OWN first render, and
  // an effect only fires after that render commits. Calling setState
  // mid-render like this is a documented, sanctioned exception — React
  // discards the in-progress render and re-renders immediately with the
  // new state, before anything commits, so by the time children (and their
  // usePreviousRoute() reads) actually render, the value is already
  // settled, not one navigation behind.
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setPreviousRoute(lastPathname);
    setLastPathname(pathname);
  }

  return (
    <PreviousRouteContext.Provider value={previousRoute}>{children}</PreviousRouteContext.Provider>
  );
}

// A destination page (Hero on "/", AboutHero on "/about") only exists for
// the lifetime of its own route segment — Next remounts it fresh on every
// client-side navigation rather than reusing the instance — so this value
// is already stable for as long as any caller is mounted; no extra
// mount-time freeze needed on top of it.
export function usePreviousRoute() {
  return useContext(PreviousRouteContext);
}
