import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost } from "@/lib/api";
import { toCsv, parseCsv } from "@/lib/csv";
import type { JobApplication } from "@/types";
import { toast } from "sonner";


function dl(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

type Props = { onImported: () => void };

export default function ExportImportBar({ onImported }: Props) {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function exportJSON() {
    const rows = await apiGet<JobApplication[]>("/applications/");
    dl("applications.json", JSON.stringify(rows, null, 2), "application/json");
  }
  async function exportCSV() {
    const rows = await apiGet<JobApplication[]>("/applications/");
    dl("applications.csv", toCsv(rows), "text/csv");
  }

  async function importJSON(file: File) {
    const text = await file.text();
    const items = JSON.parse(text) as Partial<JobApplication>[];
    await bulkCreate(items);
  }
  async function importCSV(file: File) {
    const text = await file.text();
    const rows = parseCsv(text);
    const items = rows.map(r => ({
      company: r.company, role: r.role, location: r.location,
      job_url: r.job_url, source: r.source, status: r.status as any,
      stage: r.stage, salary: r.salary,
      applied_date: r.applied_date || null,
      follow_up_date: r.follow_up_date || null,
      priority: r.priority as any, resume_version: r.resume_version,
      tags: r.tags, notes: r.notes,
    }));
    await bulkCreate(items);
  }

  async function bulkCreate(items: Partial<JobApplication>[]) {
    if (!items.length) return;
    setBusy(true); setMsg(null);
    let ok = 0, fail = 0;
    for (const raw of items) {
      // only send fields the API expects; DO NOT send id/created_at/updated_at
      const body = {
        company: raw.company ?? "",
        role: raw.role ?? "",
        location: raw.location ?? "",
        job_url: raw.job_url ?? "",
        source: raw.source ?? "",
        status: (raw.status ?? "Saved") as JobApplication["status"],
        stage: raw.stage ?? "",
        salary: raw.salary ?? "",
        applied_date: (raw.applied_date as any) || null,
        follow_up_date: (raw.follow_up_date as any) || null,
        priority: (raw.priority ?? "Medium") as JobApplication["priority"],
        resume_version: raw.resume_version ?? "",
        tags: raw.tags ?? "",
        notes: raw.notes ?? "",
      };
      try {
        if (!body.company || !body.role) throw new Error("company+role required");
        await apiPost<JobApplication>("/applications/", body);
        ok++;
      } catch {
        fail++;
      }
    }
    setBusy(false);
    setMsg(`Imported: ${ok} ok, ${fail} failed`);
    onImported();
    toast.success(`Import complete: ${ok} ok, ${fail} failed`);

  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={exportJSON}>Export JSON</Button>
      <Button variant="outline" onClick={exportCSV}>Export CSV</Button>

      <input ref={jsonInputRef} type="file" accept="application/json"
             className="hidden" onChange={(e) => e.target.files && importJSON(e.target.files[0])} />
      <Button variant="outline" onClick={() => jsonInputRef.current?.click()} disabled={busy}>
        Import JSON
      </Button>

      <input ref={csvInputRef} type="file" accept=".csv,text/csv"
             className="hidden" onChange={(e) => e.target.files && importCSV(e.target.files[0])} />
      <Button variant="outline" onClick={() => csvInputRef.current?.click()} disabled={busy}>
        Import CSV
      </Button>

      {msg ? <span className="text-sm text-gray-600 ml-2">{msg}</span> : null}
    </div>
  );
}
