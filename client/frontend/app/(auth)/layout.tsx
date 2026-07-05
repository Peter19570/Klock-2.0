import { KlockLogo } from "@/components/brand/klock-logo";
import { ForceTheme } from "@/components/theme/force-theme";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12">
      <ForceTheme theme="dark" />
      <div className="mb-8">
        <KlockLogo />
      </div>
      {children}
    </div>
  );
}