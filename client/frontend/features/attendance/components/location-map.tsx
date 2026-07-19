"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

function usePointerFine() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFine(mq.matches);
    const handler = () => setFine(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return fine;
}

interface LocationMapProps {
  location: string | null;
  coordinates: string | null;
  className?: string;
}

export function LocationMap({
  location,
  coordinates,
  className,
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerFine = usePointerFine();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-50, 50], [6, -6]);
  const rotateY = useTransform(mouseX, [-50, 50], [-6, 6]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent) {
    if (!pointerFine || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative select-none", className)}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => pointerFine && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative h-55 w-full overflow-hidden rounded-2xl border border-border bg-background sm:h-70"
        style={{
          rotateX: pointerFine ? springRotateX : 0,
          rotateY: pointerFine ? springRotateY : 0,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-muted/20 via-transparent to-muted/40" />

        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-muted" />
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <motion.line
              x1="0%"
              y1="35%"
              x2="100%"
              y2="35%"
              className="stroke-foreground/25"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <motion.line
              x1="0%"
              y1="65%"
              x2="100%"
              y2="65%"
              className="stroke-foreground/25"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <motion.line
              x1="30%"
              y1="0%"
              x2="30%"
              y2="100%"
              className="stroke-foreground/20"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
            <motion.line
              x1="70%"
              y1="0%"
              x2="70%"
              y2="100%"
              className="stroke-foreground/20"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
            {[20, 50, 80].map((y, i) => (
              <motion.line
                key={`h-${i}`}
                x1="0%"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                className="stroke-foreground/10"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              />
            ))}
            {[15, 45, 55, 85].map((x, i) => (
              <motion.line
                key={`v-${i}`}
                x1={`${x}%`}
                y1="0%"
                x2={`${x}%`}
                y2="100%"
                className="stroke-foreground/10"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
              />
            ))}
          </svg>

          <motion.div
            className="absolute left-[10%] top-[40%] h-[20%] w-[15%] rounded-sm border border-muted-foreground/20 bg-muted-foreground/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          />
          <motion.div
            className="absolute left-[35%] top-[15%] h-[15%] w-[12%] rounded-sm border border-muted-foreground/15 bg-muted-foreground/25"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          />
          <motion.div
            className="absolute left-[75%] top-[70%] h-[18%] w-[18%] rounded-sm border border-muted-foreground/18 bg-muted-foreground/28"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          />
          <motion.div
            className="absolute right-[10%] top-[20%] h-[25%] w-[10%] rounded-sm border border-muted-foreground/15 bg-muted-foreground/22"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.55 }}
          />
          <motion.div
            className="absolute left-[5%] top-[55%] h-[12%] w-[8%] rounded-sm border border-muted-foreground/12 bg-muted-foreground/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.65 }}
          />
          <motion.div
            className="absolute left-[75%] top-[8%] h-[10%] w-[14%] rounded-sm border border-muted-foreground/15 bg-muted-foreground/22"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.75 }}
          />

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: 0.3,
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg"
              style={{
                filter: "drop-shadow(0 0 10px rgba(52, 211, 153, 0.5))",
              }}
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="#34D399"
              />
              <circle cx="12" cy="9" r="2.5" className="fill-background" />
            </svg>
          </motion.div>

          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-60" />
        </motion.div>

        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <motion.svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
              animate={{
                filter: isHovered
                  ? "drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))"
                  : "drop-shadow(0 0 4px rgba(52, 211, 153, 0.3))",
              }}
              transition={{ duration: 0.3 }}
            >
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" x2="9" y1="3" y2="18" />
              <line x1="15" x2="15" y1="6" y2="21" />
            </motion.svg>

            <motion.div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-sm",
                isHovered ? "bg-foreground/8" : "bg-foreground/5",
              )}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Live
              </span>
            </motion.div>
          </div>

          <div className="space-y-1">
            <motion.h3
              className="text-sm font-medium tracking-tight text-foreground"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {location ?? "Getting your location..."}
            </motion.h3>
            <p className="font-mono text-xs text-muted-foreground">
              {coordinates ?? "—"}
            </p>
            <motion.div
              className="h-px bg-linear-to-r from-emerald-500/50 via-emerald-400/30 to-transparent"
              initial={{ scaleX: 0.3, originX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0.6 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
