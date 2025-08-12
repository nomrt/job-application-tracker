import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ApplicationsTable from "@/components/ApplicationsTable";
import NewApplicationDialog from "@/components/NewApplicationDialog";

export default function App() {
  const [open, setOpen] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Saved"|"Applied"|"Interview"|"Offer"|"Rejected"|"Ghosted"|"All">("All");
  const [priority, setPriority] = useState<"Low"|"Medium"|"High"|"All">("All");
  const [ordering, setOrdering] = useState("-applied_date"); // newest applied first

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-2 justify-between">
          <h1 className="text-xl font-semibold">Job Application Tracker</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search…"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["All","Saved","Applied","Interview","Offer","Rejected","Ghosted"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                {["All","Low","Medium","High"].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ordering} onValueChange={setOrdering}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="-applied_date">Applied (new→old)</SelectItem>
                <SelectItem value="applied_date">Applied (old→new)</SelectItem>
                <SelectItem value="company">Company (A→Z)</SelectItem>
                <SelectItem value="-company">Company (Z→A)</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setOpen(true)}>New</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <ApplicationsTable
          search={search || undefined}
          status={status === "All" ? undefined : status}
          priority={priority === "All" ? undefined : priority}
          ordering={ordering}
          reloadTick={reloadTick}
        />
      </main>

      <NewApplicationDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => { setOpen(false); setReloadTick((x) => x + 1); }}
      />
    </div>
  );
}
