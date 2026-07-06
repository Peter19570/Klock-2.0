"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function MarqueeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const el = textRef.current;
      if (!container || !el) return;
      const overflow = el.scrollWidth - container.clientWidth;
      setShift(overflow > 4 ? overflow + 8 : 0);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden whitespace-nowrap", className)}
    >
      <span
        ref={textRef}
        className="inline-block"
        style={
          shift > 0
            ? ({
                animation: "klock-marquee 7s ease-in-out infinite",
                "--klock-marquee-shift": `-${shift}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
}
