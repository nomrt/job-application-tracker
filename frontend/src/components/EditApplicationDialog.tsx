import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPatch } from "@/lib/api";
import type { JobApplication } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: JobApplication | null;
  onSaved: () => void; // caller will refresh table
};

const STATUSES = ["Saved","Applied","Interview","Offer","Rejected","Ghosted"] as const;
const PRIORITIES = ["Low","Medium","High"] as const;

export default function EditApplicationDialog({ open, onOpenChange, item, onSaved }: Props) {
  const [form, setForm] = useState({
    company: "", role: "", location: "", job_url: "", source: "",
    status: "Saved" as (typeof STATUSES)[number],
    stage: "", salary: "",
    applied_date: "" as string | "",
    follow_up_date: "" as string | "",
    priority: "Medium" as (typeof PRIORITIES)[number],
    resume_version: "", tags: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setForm({
      company: item.company ?? "",
      role: item.role ?? "",
      location: item.location ?? "",
      job_url: item.job_url ?? "",
      source: item.source ?? "",
      status: item.status,
      stage: item.stage ?? "",
      salary: item.salary ?? "",
      applied_date: item.applied_date ?? "",
      follow_up_date: item.follow_up_date ?? "",
      priority: item.priority,
      resume_version: item.resume_version ?? "",
      tags: item.tags ?? "",
      notes: item.notes ?? "",
    });
  }, [item?.id]); // reset on different item

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!item) return;
    if (!form.company || !form.role) {
      setErr("Company and Role are required");
      return;
    }
    setErr(null); setSaving(true);
    try {
      const body = {
        ...form,
        applied_date: form.applied_date || null,
        follow_up_date: form.follow_up_date || null,
      };
      await apiPatch(`/applications/${item.id}/`, body);
      toast.success("Saved Changes");
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Failed to save Changes");
      setErr(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Edit Application</DialogTitle></DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Company *</Label><Input name="company" value={form.company} onChange={onChange} /></div>
          <div><Label>Role *</Label><Input name="role" value={form.role} onChange={onChange} /></div>

          <div><Label>Location</Label><Input name="location" value={form.location} onChange={onChange} /></div>
          <div><Label>Job URL</Label><Input name="job_url" value={form.job_url} onChange={onChange} /></div>

          <div><Label>Source</Label><Input name="source" value={form.source} onChange={onChange} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div><Label>Stage</Label><Input name="stage" value={form.stage} onChange={onChange} /></div>
          <div><Label>Salary</Label><Input name="salary" value={form.salary} onChange={onChange} /></div>

          <div><Label>Applied Date</Label><Input type="date" name="applied_date" value={form.applied_date} onChange={onChange} /></div>
          <div><Label>Follow-up Date</Label><Input type="date" name="follow_up_date" value={form.follow_up_date} onChange={onChange} /></div>

          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Resume Version</Label><Input name="resume_version" value={form.resume_version} onChange={onChange} /></div>

          <div className="sm:col-span-2"><Label>Tags</Label><Input name="tags" value={form.tags} onChange={onChange} /></div>
          <div className="sm:col-span-2"><Label>Notes</Label><Textarea name="notes" value={form.notes} onChange={onChange} /></div>
        </div>

        {err ? <div className="text-sm text-red-600 mt-2">{err}</div> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
