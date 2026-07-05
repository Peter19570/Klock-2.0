"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClockButtonProps extends Omit<ButtonProps, "onClick"> {
  isClockedIn: boolean;
  onToggle: () => void;
  successDuration?: number;
}

function SuccessParticles({ buttonRef }: { buttonRef: React.RefObject<HTMLButtonElement> }) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    <AnimatePresence>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed h-1 w-1 rounded-full bg-primary"
          style={{ left: centerX, top: centerY }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 50 + 20)],
            y: [0, -Math.random() * 50 - 20],
          }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}

export function ClockButton({ isClockedIn, onToggle, successDuration = 1000, className, ...props }: ClockButtonProps) {
  const [showParticles, setShowParticles] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleClick() {
    onToggle(); // real clock-in/out API call plugs in here later
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), successDuration);
  }

  return (
    <>
      {showParticles && <SuccessParticles buttonRef={buttonRef} />}
      <Button
        ref={buttonRef}
        onClick={handleClick}
        size="lg"
        variant={isClockedIn ? "destructive" : "default"}
        className={cn("relative w-full gap-2 py-6 text-base transition-transform duration-100", showParticles && "scale-95", className)}
        {...props}
      >
        <Fingerprint className="h-5 w-5" />
        {isClockedIn ? "Clock out" : "Clock in"}
      </Button>
    </>
  );
}