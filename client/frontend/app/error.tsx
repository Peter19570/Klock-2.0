"use client";

import { useEffect } from "react";
import { KlockLogo } from "@/components/brand/klock-logo";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <KlockLogo className="h-8 w-auto" />

      <div className="mt-10 flex flex-col items-center text-center">
        <span className="text-7xl font-semibold tracking-tight text-destructive/20">
          !
        </span>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. You can try again, or head back to the
          dashboard.
        </p>

        <div className="mt-6 flex items-center gap-2.5">
          <Button variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard")}>
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
