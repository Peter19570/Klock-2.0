import Link from "next/link";
import { KlockLogo } from "@/components/brand/klock-logo";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <KlockLogo className="h-8 w-auto" />

      <div className="mt-10 flex flex-col items-center text-center">
        <span className="text-7xl font-semibold tracking-tight text-primary/20">
          404
        </span>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        <Link href="/login">
          <Button className="mt-6">Back to login</Button>
        </Link>
      </div>
    </div>
  );
}
