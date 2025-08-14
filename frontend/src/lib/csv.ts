import type { JobApplication } from "@/types";

const headers = [
  "company","role","location","job_url","source","status","stage","salary",
  "applied_date","follow_up_date","priority","resume_version","tags","notes"
] as const;

export function toCsv(apps: JobApplication[]) {
  // escape " as "" using a regex that works on older targets
  const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const header = headers.join(",");
  const rows = apps.map(a =>
    headers.map(h => esc((a as any)[h] ?? "")).join(",")
  );
  return [header, ...rows].join("\n");
}

// very simple CSV parser (handles quoted commas & quotes).
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const hdr = lines.shift();
  if (!hdr) return [];
  const cols = hdr.split(",").map(s => s.replace(/^"|"$/g, ""));

  function parseLine(line: string) {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        out.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map(s => s.replace(/^"|"$/g, ""));
  }

  return lines.map(line => {
    const vals = parseLine(line);
    const obj: Record<string, string> = {};
    cols.forEach((k, i) => obj[k] = vals[i] ?? "");
    return obj;
  });
}
