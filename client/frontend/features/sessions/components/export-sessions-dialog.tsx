"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
import { useToasts } from "@/components/common/toast";
import { exportSessions } from "@/lib/api/sessions";

interface ExportSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportSessionsDialog({
  open,
  onOpenChange,
}: ExportSessionsDialogProps) {
  const toasts = useToasts();
  const [start, setStart] = useState<string | undefined>();
  const [end, setEnd] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await exportSessions(start, end);
    setLoading(false);
    if (err) {
      setError(err);
      toasts.error(err);
      return;
    }
    toasts.success("Export started");
    onOpenChange(false);
    setStart(undefined);
    setEnd(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export sessions</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <DatePicker value={start} onChange={setStart} />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <DatePicker value={end} onChange={setEnd} />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Exporting..." : "Export"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
