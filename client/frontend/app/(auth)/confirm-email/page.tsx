import { Suspense } from "react";
import { ConfirmEmailStatus } from "@/features/auth/components/confirm-email-status";

export default function ConfirmEmailPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Confirm email change</h1>
      <Suspense fallback={null}>
        <ConfirmEmailStatus />
      </Suspense>
    </div>
  );
}