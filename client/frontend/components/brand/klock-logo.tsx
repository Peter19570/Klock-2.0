import Image from "next/image";

export function KlockLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/klock-logo.png"
        alt="Klock"
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
        priority
      />
      <span className="text-lg font-semibold tracking-tight text-foreground">Klock</span>
    </div>
  );
}