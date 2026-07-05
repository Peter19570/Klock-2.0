"use client";

import { useEffect } from "react";

export function ForceTheme({ theme }: { theme: "light" | "dark" }) {
  useEffect(() => {
    const root = document.documentElement;
    const alreadyPresent = root.classList.contains(theme);
    root.classList.add(theme);
    return () => {
      if (!alreadyPresent) root.classList.remove(theme);
    };
  }, [theme]);

  return null;
}