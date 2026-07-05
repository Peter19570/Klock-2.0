import { KlockLogo } from "@/components/brand/klock-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <KlockLogo />
      </div>
      {children}
    </div>
  );
}