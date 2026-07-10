"use client";

import { useEffect, useRef } from "react";

export function useAutoMarquee<T extends HTMLElement>(
  enabled: boolean,
  speed = 0.4,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let frame: number;
    let paused = false;
    let userActive = false;
    let resumeTimer: ReturnType<typeof setTimeout>;

    const wrap = () => {
      const half = el.scrollWidth / 2;
      if (half <= 0) return;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      else if (el.scrollLeft < 0) el.scrollLeft += half;
    };

    const step = () => {
      if (!paused) {
        el.scrollLeft += speed;
        wrap();
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    const pause = () => {
      userActive = true;
      paused = true;
      clearTimeout(resumeTimer);
    };

    // Pushes the resume further out on every sign of movement, so it
    // only fires once things have actually settled. This is what
    // handles momentum/inertial scrolling that continues on mobile
    // after touchend has already fired.
    const scheduleResume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        userActive = false;
        paused = false;
      }, 2500);
    };

    const onInteractionEnd = () => {
      scheduleResume();
    };

    const onScroll = () => {
      wrap();
      // still moving (manual drag or momentum) -> keep delaying resume
      if (userActive) scheduleResume();
    };

    const onWheel = () => {
      pause();
      scheduleResume();
    };

    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", onInteractionEnd);
    el.addEventListener("pointercancel", onInteractionEnd);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", onInteractionEnd);
    el.addEventListener("touchcancel", onInteractionEnd);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resumeTimer);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", onInteractionEnd);
      el.removeEventListener("pointercancel", onInteractionEnd);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", onInteractionEnd);
      el.removeEventListener("touchcancel", onInteractionEnd);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
    };
  }, [enabled, speed]);

  return ref;
}