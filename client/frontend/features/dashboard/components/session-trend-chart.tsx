"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/generated/schema";
import { useIsMobile } from "@/hooks/use-is-mobile";

type SessionTrend = components["schemas"]["SessionTrend"];

interface SessionTrendChartProps {
  data: SessionTrend[];
}

export function SessionTrendChart({ data }: SessionTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);

  const points = data.map((d) => ({
    label: d.dayLabel ?? "",
    value: d.count ?? 0,
  }));
  const maxValue = Math.max(1, ...points.map((d) => d.value));
  const todayIndex = points.length - 1; // assumes chronological, last = today

  const isMobile = useIsMobile();
  const MAX_HEIGHT_PCT = isMobile ? 84 : 250;
  const MIN_VALUE_HEIGHT_PCT = isMobile ? 16 : 14;
  const MIN_HEIGHT_PCT = 4;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hoveredIndex !== null)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(points[hoveredIndex]?.value ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredIndex]);

  const handleLeave = () => {
    setIsHovering(false);
    setHoveredIndex(null);
    setTimeout(() => setDisplayValue(null), 150);
  };

  const barHeight = (value: number) => {
    if (value <= 0) return MIN_HEIGHT_PCT;
    return Math.max((value / maxValue) * MAX_HEIGHT_PCT, MIN_VALUE_HEIGHT_PCT);
  };

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleLeave}
      className="group relative flex h-64 w-full flex-col gap-6 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/10 sm:h-80 sm:p-6 lg:h-116.25 lg:max-w-250 lg:flex-[7]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Session trend
          </span>
        </div>
        <div className="relative flex h-8 items-center">
          <span
            className={cn(
              "text-xl font-semibold tabular-nums transition-all duration-300",
              isHovering && displayValue !== null
                ? "text-foreground opacity-100"
                : "text-muted-foreground opacity-50",
            )}
          >
            {displayValue !== null ? displayValue : ""}
            <span
              className={cn(
                "ml-1 text-xs font-normal text-muted-foreground transition-opacity duration-300",
                displayValue !== null ? "opacity-100" : "opacity-0",
              )}
            >
              sessions
            </span>
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-end gap-1.5 pb-6 sm:gap-3">
        {points.map((item, index) => {
          const heightPx = barHeight(item.value);
          const isHovered = hoveredIndex === index;
          const isAnyHovered = hoveredIndex !== null;
          const isNeighbor =
            isAnyHovered &&
            (index === hoveredIndex - 1 || index === hoveredIndex + 1);
          const isToday = index === todayIndex;

          return (
            <div
              key={`${item.label}-${index}`}
              className="relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() =>
                setHoveredIndex((prev) => (prev === index ? null : index))
              }
            >
              <div
                className={cn(
                  "w-full origin-bottom cursor-pointer rounded-t-lg transition-[height,transform,background-color] duration-500 ease-out",
                  isHovered
                    ? "bg-primary"
                    : isNeighbor
                      ? "bg-primary/40"
                      : isAnyHovered
                        ? "bg-primary/15"
                        : isToday
                          ? "bg-primary/50 group-hover:bg-primary/40"
                          : "bg-primary/25 group-hover:bg-primary/30",
                )}
                style={{
                  height: mounted ? `${heightPx}px` : "0px",
                  transitionDelay: mounted ? `${index * 30}ms` : "0ms",
                  transform: isHovered
                    ? "scaleX(1.1) scaleY(1.02)"
                    : isNeighbor
                      ? "scaleX(1.04)"
                      : "scaleX(1)",
                }}
              />
              <span
                className={cn(
                  "mt-3 text-[10px] font-medium transition-all duration-300 sm:text-xs",
                  isHovered
                    ? "text-foreground"
                    : isToday
                      ? "text-primary/70"
                      : "text-muted-foreground/60",
                )}
              >
                {item.label}
              </span>
              <div
                className={cn(
                  "absolute left-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background transition-all duration-200",
                  isHovered && item.value > 0
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none",
                )}
                style={{
                  bottom: `calc(${Math.min(heightPx, 92)}% + 10px)`,
                  transform: `translateX(-50%) translateY(${isHovered && item.value > 0 ? "0" : "4px"})`,
                }}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-primary/3 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
