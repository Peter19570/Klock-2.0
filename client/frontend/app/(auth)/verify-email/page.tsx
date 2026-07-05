import { Suspense } from "react";
import { VerifyEmailStatus } from "@/features/auth/components/verify-email-status";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Email verification</h1>
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </div>
  );
}