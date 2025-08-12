import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost } from "@/lib/api";
import type { JobApplication } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (created: JobApplication) => void;
};

const STATUSES = ["Saved","Applied","Interview","Offer","Rejected","Ghosted"] as const;
const PRIORITIES = ["Low","Medium","High"] as const;

export default function NewApplicationDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    job_url: "",
    source: "",
    status: "Saved" as (typeof STATUSES)[number],
    stage: "",
    salary: "",
    applied_date: "" as string | "",
    follow_up_date: "" as string | "",
    priority: "Medium" as (typeof PRIORITIES)[number],
    resume_version: "",
    tags: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    if (!form.company || !form.role) {
      setErr("Company and Role are required");
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        applied_date: form.applied_date || null,
        follow_up_date: form.follow_up_date || null,
      };
      const created = await apiPost<JobApplication>("/applications/", payload);
      onCreated(created);
      // reset minimal fields
      setForm(prev => ({ ...prev, company: "", role: "" }));
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Application</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Company *</Label>
            <Input name="company" value={form.company} onChange={onChange} placeholder="Acme Corp" />
          </div>
          <div>
            <Label>Role *</Label>
            <Input name="role" value={form.role} onChange={onChange} placeholder="Backend Engineer" />
          </div>

          <div>
            <Label>Location</Label>
            <Input name="location" value={form.location} onChange={onChange} placeholder="Remote / City, ST" />
          </div>
          <div>
            <Label>Job URL</Label>
            <Input name="job_url" value={form.job_url} onChange={onChange} placeholder="https://…" />
          </div>

          <div>
            <Label>Source</Label>
            <Input name="source" value={form.source} onChange={onChange} placeholder="LinkedIn / Referral" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Stage</Label>
            <Input name="stage" value={form.stage} onChange={onChange} placeholder="OA / Screen / Onsite" />
          </div>
          <div>
            <Label>Salary (expected/offered)</Label>
            <Input name="salary" value={form.salary} onChange={onChange} placeholder="$150k" />
          </div>

          <div>
            <Label>Applied Date</Label>
            <Input type="date" name="applied_date" value={form.applied_date} onChange={onChange} />
          </div>
          <div>
            <Label>Follow-up Date</Label>
            <Input type="date" name="follow_up_date" value={form.follow_up_date} onChange={onChange} />
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm(prev => ({ ...prev, priority: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Resume Version</Label>
            <Input name="resume_version" value={form.resume_version} onChange={onChange} placeholder="SWE_v1.pdf" />
          </div>

          <div className="sm:col-span-2">
            <Label>Tags (comma separated)</Label>
            <Input name="tags" value={form.tags} onChange={onChange} placeholder="python,django,aws" />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea name="notes" value={form.notes} onChange={onChange} placeholder="Anything to remember…" />
          </div>
        </div>

        {err ? <div className="text-sm text-red-600 mt-2">{err}</div> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
