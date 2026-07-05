export function KlockLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="var(--primary)" strokeWidth="2" />
        <line x1="14" y1="14" x2="14" y2="7" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
        <line
          x1="14" y1="14" x2="19" y2="14"
          stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"
          className="origin-[14px_14px] animate-[spin_60s_linear_infinite] motion-reduce:animate-none"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-foreground">Klock</span>
    </div>
  );
}