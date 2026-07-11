"use client";

import { Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { components } from "@/lib/api/generated/schema";

type BranchResponse = components["schemas"]["BranchResponse"];

interface BranchSelectorProps {
  branches: BranchResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function BranchLabel({ branch }: { branch: BranchResponse }) {
  return (
    <span className="flex items-center gap-1.5">
      {branch.displayName}
      {branch.branchStatus === "LOCKED" && (
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </span>
  );
}

export function BranchSelector({
  branches,
  selectedId,
  onSelect,
}: BranchSelectorProps) {
  return (
    <Select
      value={selectedId ?? undefined}
      onValueChange={(value) => onSelect(value ?? "")}
    >
      <SelectTrigger className="w-full bg-card shadow-sm">
        {/* Base UI's Select.Value takes a render function: (value) => ReactNode.
            Without it, it just stringifies the raw value — the branch id. */}
        <SelectValue placeholder="Jump to branch">
          {(value: string | null) => {
            const branch = branches.find((b) => b.id === value);
            return branch ? <BranchLabel branch={branch} /> : "Jump to branch";
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {branches.map((b) => (
          <SelectItem key={b.id} value={b.id ?? ""}>
            <BranchLabel branch={b} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
