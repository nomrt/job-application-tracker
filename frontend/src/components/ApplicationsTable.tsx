import { useEffect, useState } from "react";
import { JobApplication } from "@/types";
import { apiGet, apiPatch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["Saved","Applied","Interview","Offer","Rejected","Ghosted"] as const;

const STATUS_COLOR: Record<JobApplication["status"], string> = {
  Saved: "bg-slate-100 text-slate-700",
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-purple-100 text-purple-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Ghosted: "bg-zinc-200 text-zinc-700",
};

function StatusPill({ value }: { value: JobApplication["status"] }) {
  return <Badge className={`rounded-full ${STATUS_COLOR[value]}`}>{value}</Badge>;
}

type Props = {
  search?: string;
  status?: JobApplication["status"];
  priority?: JobApplication["priority"];
  ordering?: string;          // e.g. "-applied_date"
  reloadTick?: number;        // bump to force refetch
};

export default function ApplicationsTable({ search, status, priority, ordering, reloadTick = 0 }: Props) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setErr(null);
      const rows = await apiGet<JobApplication[]>("/applications/", {
        search,
        status,
        priority,
        ordering,
      });
      setData(rows);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, ordering, reloadTick]);

  async function onChangeStatus(id: string, next: JobApplication["status"]) {
    // optimistic UI
    setData(prev => prev.map(a => (a.id === id ? { ...a, status: next } : a)));
    try {
      await apiPatch<JobApplication>(`/applications/${id}/`, { status: next });
    } catch {
      // revert if server fails
      await fetchData();
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading applications…</div>;
  if (err) return <div className="p-6 text-sm text-red-600">Error: {err}</div>;

  return (
    <Table>
      <TableCaption className="text-left">Your applications ({data.length})</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Follow-up</TableHead>
          <TableHead>Tags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-gray-500">No applications yet.</TableCell>
          </TableRow>
        ) : (
          data.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <div className="font-medium">{a.company}</div>
                <div className="text-xs text-gray-500">{a.location}</div>
                {a.job_url ? (
                  <a className="text-xs text-blue-700 hover:underline" href={a.job_url} target="_blank" rel="noreferrer">
                    {a.job_url}
                  </a>
                ) : null}
              </TableCell>
              <TableCell className="align-top">{a.role}</TableCell>
              <TableCell className="align-top">
                <div className="flex items-center gap-2">
                  <StatusPill value={a.status} />
                  <Select value={a.status} onValueChange={(v) => onChangeStatus(a.id, v as JobApplication["status"])}>
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {a.stage ? <div className="text-xs text-gray-500 mt-1">{a.stage}</div> : null}
              </TableCell>
              <TableCell className="align-top">{a.priority}</TableCell>
              <TableCell className="align-top">{a.applied_date ?? ""}</TableCell>
              <TableCell className="align-top">{a.follow_up_date ?? ""}</TableCell>
              <TableCell className="align-top">{a.tags}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
