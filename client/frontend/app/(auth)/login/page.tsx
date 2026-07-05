import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
      <p className="mt-1.5 mb-8 text-sm text-muted-foreground">Welcome back. Enter your details to continue.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}