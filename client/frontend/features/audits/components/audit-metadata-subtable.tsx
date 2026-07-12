"use client";

interface AuditMetadataSubTableProps {
  metadata: Record<string, unknown>;
}

export function AuditMetadataSubTable({
  metadata,
}: AuditMetadataSubTableProps) {
  const entries = Object.entries(metadata ?? {});

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        No metadata for this event.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
      {entries.map(([key, value], i) => (
        <div
          key={key}
          className={
            "grid grid-cols-[180px_1fr] gap-3 px-4 py-2 text-xs" +
            (i < entries.length - 1 ? " border-b border-border/40" : "")
          }
        >
          <span className="truncate font-medium text-muted-foreground">
            {key}
          </span>
          <span className="break-all text-foreground">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
