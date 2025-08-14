export type JobApplication = {
  id: string;
  company: string;
  role: string;
  location: string;
  job_url: string;
  source: string;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected" | "Ghosted";
  stage: string;
  salary: string;
  applied_date: string | null;     // "YYYY-MM-DD" or null
  follow_up_date: string | null;   // "YYYY-MM-DD" or null
  priority: "Low" | "Medium" | "High";
  resume_version: string;
  tags: string;
  notes: string;
  created_at: string;              // ISO
  updated_at: string;              // ISO
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
