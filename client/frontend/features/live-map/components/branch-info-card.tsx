import { Users, Waypoints } from "lucide-react";
import { Building2 } from "lucide-react";

interface BranchInfoCardProps {
  displayName?: string;
  branchStatus?: "LOCKED" | "UNLOCKED";
  radius?: number;
  shiftStart?: string;
  shiftEnd?: string;
}

export function BranchInfoCard({
  displayName,
  branchStatus,
  radius,
  shiftStart,
  shiftEnd,
}: BranchInfoCardProps) {
  const isLocked = branchStatus === "LOCKED";

  return (
    <div className="w-44 overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 bg-primary/10 px-2.5 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {displayName ?? "Branch"}
          </p>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span
              className={
                isLocked
                  ? "h-1.5 w-1.5 rounded-full bg-destructive"
                  : "h-1.5 w-1.5 rounded-full bg-emerald-500"
              }
            />
            {isLocked ? "Locked" : "Unlocked"}
          </p>
        </div>
      </div>

      <div className="space-y-1 px-2.5 py-2">
        {radius != null && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Waypoints className="h-2.5 w-2.5 shrink-0" />
            <span>{radius}m radius</span>
          </div>
        )}
        {shiftStart && shiftEnd && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Users className="h-2.5 w-2.5 shrink-0" />
            <span>
              {shiftStart}–{shiftEnd}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
