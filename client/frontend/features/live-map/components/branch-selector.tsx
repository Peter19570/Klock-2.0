"use client";

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
        <SelectValue placeholder="Jump to branch" />
      </SelectTrigger>
      <SelectContent>
        {branches.map((b) => (
          <SelectItem key={b.id} value={b.id ?? ""}>
            {b.displayName}
            {b.branchStatus === "LOCKED" ? " 🔒" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}