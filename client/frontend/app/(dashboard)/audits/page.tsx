"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { EnumSelect } from "@/components/common/enum-select";
import { DatePicker } from "@/components/common/date-picker";
import { Pagination } from "@/components/common/pagination";
import { AuditTable } from "@/features/audits/components/audit-table";
import { formatAuditAction } from "@/features/audits/constants";
import {
  AUDIT_ACTIONS,
  fetchAudits,
  type AuditAction,
  type AuditResponse,
} from "@/features/audits/api";

export default function AuditsPage() {
  const [audits, setAudits] = useState<AuditResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [fullName, setFullName] = useState("");
  const [auditAction, setAuditAction] = useState<AuditAction | undefined>();
  const [minCreatedAt, setMinCreatedAt] = useState<string | undefined>();
  const [maxCreatedAt, setMaxCreatedAt] = useState<string | undefined>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchAudits({
      page,
      fullName: fullName || undefined,
      auditAction,
      minCreatedAt,
      maxCreatedAt,
    }).then((data) => {
      setAudits(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
      setLoading(false);
    });
  }, [page, fullName, auditAction, minCreatedAt, maxCreatedAt]);

  return (
    <div className="pb-16 pt-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every recorded action across your organization.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search by name..."
          value={fullName}
          onChange={(e) => {
            setPage(0);
            setFullName(e.target.value);
          }}
        />
        <EnumSelect
          value={auditAction}
          onChange={(v) => {
            setPage(0);
            setAuditAction(v);
          }}
          options={AUDIT_ACTIONS}
          placeholder="Any action"
          formatLabel={formatAuditAction}
        />
        <DatePicker
          value={minCreatedAt}
          onChange={(v) => {
            setPage(0);
            setMinCreatedAt(v);
          }}
          placeholder="From date"
        />
        <DatePicker
          value={maxCreatedAt}
          onChange={(v) => {
            setPage(0);
            setMaxCreatedAt(v);
          }}
          placeholder="To date"
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading audit log...
          </div>
        ) : (
          <AuditTable audits={audits} />
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />
    </div>
  );
}
