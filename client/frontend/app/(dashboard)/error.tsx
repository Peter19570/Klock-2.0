"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-sm">
        <span className="text-6xl font-semibold tracking-tight text-destructive/20">
          !
        </span>
        <h1 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This section hit an unexpected error. You can try again without
          leaving the page.
        </p>

        <Button variant="outline" onClick={reset} className="mt-6 gap-1.5">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
