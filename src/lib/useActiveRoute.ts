"use client";

import { usePathname } from "next/navigation";

export function useActiveRoute() {
  const pathname = usePathname();
  return {
    isHome: pathname === "/",
    isWork: pathname.startsWith("/work"),
    isAbout: pathname.startsWith("/about"),
  };
}
