import { useEffect, useState } from "react";
import type { JobApplication } from "@/types";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import EditApplicationDialog from "@/components/EditApplicationDialog";

const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected", "Ghosted"] as const;

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
  ordering?: string; // e.g. "-applied_date"
  reloadTick?: number; // bump to force refetch
};

export default function ApplicationsTable({
  search,
  status,
  priority,
  ordering,
  reloadTick = 0,
}: Props) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // keep in sync with DRF PAGE_SIZE
  const [total, setTotal] = useState(0);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, priority, ordering]);

  async function fetchData() {
    try {
      setLoading(true);
      setErr(null);

      // Accept both shapes:
      // - Array (if pagination disabled)
      // - Object { count, results } (DRF pagination enabled)
      const res = await apiGet<any>("/applications/", {
        search,
        status,
        priority,
        ordering,
        page,
        page_size: pageSize,
      });

      if (Array.isArray(res)) {
        setData(res);
        setTotal(res.length);
      } else {
        setData(res?.results ?? []);
        setTotal(res?.count ?? 0);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, ordering, reloadTick, page]);

  async function onChangeStatus(id: string, next: JobApplication["status"]) {
    // optimistic update
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
    try {
      await apiPatch(`/applications/${id}/`, { status: next });
    } catch {
      toast.error(" Status update Failed");
      await fetchData(); // revert on failure
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Loading applications…</div>;
  }
  if (err) {
    return <div className="p-6 text-sm text-red-600">Error: {err}</div>;
  }

  return (
    <>
      <Table>
        <TableCaption className="text-left">Your applications ({total || data.length})</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-gray-500">
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
                  <div className="flex items-center gap-2">
                    <StatusPill value={a.status} />
                    <Select
                      value={a.status}
                      onValueChange={(v) => onChangeStatus(a.id, v as JobApplication["status"])}
                    >
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {a.stage ? <div className="text-xs text-gray-500 mt-1">{a.stage}</div> : null}
                </TableCell>

                <TableCell className="align-top">{a.priority}</TableCell>
                <TableCell className="align-top">{a.applied_date ?? ""}</TableCell>
                <TableCell className="align-top">{a.follow_up_date ?? ""}</TableCell>
                <TableCell className="align-top">{a.tags}</TableCell>

                <TableCell className="align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(a)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setConfirmDeleteId(a.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {page} • Showing {data.length} of {total || data.length}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={data.length < pageSize || page * pageSize >= total}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit dialog */}
      <EditApplicationDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        item={editing}
        onSaved={fetchData}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(v) => !v && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                const id = confirmDeleteId!;
                setConfirmDeleteId(null);
                // optimistic remove
                setData((prev) => prev.filter((x) => x.id !== id));
                try {
                  await apiDelete(`/applications/${id}/`);
                  toast.success("Deleted");
                } catch {
                  toast.error("Delete failed");
                  await fetchData();
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
