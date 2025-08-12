import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { JobApplication } from "@/types";

function todayYYYYMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function UpcomingFollowups({ refresh = 0 }: { refresh?: number }) {
  const [rows, setRows] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const today = todayYYYYMMDD();
      const data = await apiGet<JobApplication[]>("/applications/", {
        follow_up_date__gte: today, ordering: "follow_up_date",
      });
      setRows(data.slice(0, 5));
      setLoading(false);
    })();
  }, [refresh]);

  if (loading) return <div className="text-sm text-gray-600">Loading follow-ups…</div>;

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500">No upcoming follow-ups.</div>
      ) : rows.map(a => (
        <div key={a.id} className="flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">{a.company}</span>
            <span className="text-gray-500"> — {a.role}</span>
            {a.stage ? <span className="text-gray-500"> ({a.stage})</span> : null}
          </div>
          <div className="text-gray-600">{a.follow_up_date}</div>
        </div>
      ))}
    </div>
  );
}
