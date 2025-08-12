import { useEffect, useState } from "react";
import { JobApplication } from "@/types";
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";

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

export default function ApplicationsTable({ reloadTick = 0 }: { reloadTick?: number }) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const rows = await apiGet<JobApplication[]>("/applications/");
        setData(rows);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadTick]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Loading applications…</div>;
  }
  if (err) {
    return <div className="p-6 text-sm text-red-600">Error: {err}</div>;
  }

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
            <TableCell colSpan={7} className="text-gray-500">
              No applications yet.
            </TableCell>
          </TableRow>
        ) : (
          data.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <div className="font-medium">{a.company}</div>
                <div className="text-xs text-gray-500">{a.location}</div>
                {a.job_url ? (
                  <a
                    className="text-xs text-blue-700 hover:underline"
                    href={a.job_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.job_url}
                  </a>
                ) : null}
              </TableCell>
              <TableCell className="align-top">{a.role}</TableCell>
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <StatusPill value={a.status} />
                  {a.stage ? <div className="text-xs text-gray-500">{a.stage}</div> : null}
                </div>
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
