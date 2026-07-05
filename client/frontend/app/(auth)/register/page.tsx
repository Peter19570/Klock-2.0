import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Create your organization</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted-foreground">Set up your workspace and admin account in one step.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}