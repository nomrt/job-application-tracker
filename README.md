# Job Application Tracker

Full-stack CRUD app to track your job applications.

* Backend: Django + Django REST Framework (SQLite in dev)
* Frontend: React (Vite + TypeScript) + Tailwind v4 + shadcn/ui
* Features: Create/Edit/Delete, search/filter/sort, inline status update, CSV/JSON import/export, and an "Upcoming Follow-ups" panel

> Reminder: after each step, commit and push to GitHub.

---

## 1) Prerequisites

* Python 3.12 (pyenv recommended)
* Node.js LTS (install with nvm)
* Git

Check versions:

```bash
python --version
node --version
npm --version
git --version
```

---

## 2) Project Structure

```
job-application-tracker/
├─ backend/                  # Django project (API)
│  ├─ api/                   # settings, urls
│  ├─ applications/          # app (model, views, serializers, admin)
│  ├─ db.sqlite3             # dev DB (ok for local use)
│  └─ .venv/                 # python venv (ignored by git)
└─ frontend/                 # Vite + React + TS app
   ├─ src/
   │  ├─ components/
   │  │  ├─ ApplicationsTable.tsx
   │  │  ├─ NewApplicationDialog.tsx
   │  │  ├─ EditApplicationDialog.tsx
   │  │  ├─ ExportImportBar.tsx
   │  │  └─ UpcomingFollowups.tsx
   │  ├─ lib/api.ts
   │  ├─ lib/csv.ts
   │  └─ types.ts
   ├─ index.html
   ├─ vite.config.ts
   └─ tsconfig.json
```

---

## 3) Getting Started (Dev)

### 3.1 Backend (Django API)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# first time only
python manage.py migrate

# run the server
python manage.py runserver 127.0.0.1:8000
```

API root: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

For local dev, add this to `backend/api/settings.py`:

```py
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]
CORS_ALLOW_ALL_ORIGINS = True  # dev only
CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1:5173", "http://localhost:5173"]
TIME_ZONE = "America/Chicago"
USE_TZ = True
```

### 3.2 Frontend (Vite + React + TS)

```bash
cd frontend
npm install

# Option A: call API directly (simplest)
# make sure src/lib/api.ts has: const API_BASE = "http://127.0.0.1:8000/api";
npm run dev
# open http://localhost:5173/
```

Optional Vite proxy (to avoid CORS):

* `vite.config.ts`:

  ```ts
  server: {
    proxy: { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } },
  }
  ```
* `src/lib/api.ts`:

  ```ts
  const API_BASE = "/api"; // use relative path
  ```

---

## 4) Core Endpoints (Quick Reference)

`GET /api/applications/` — list (supports `?search=&status=&priority=&ordering=`)

`POST /api/applications/` — create

```json
{
  "company": "Acme",
  "role": "Backend Engineer",
  "location": "Remote",
  "job_url": "https://example.com/job/123",
  "source": "LinkedIn",
  "status": "Applied",
  "stage": "Recruiter screen",
  "salary": "$150k",
  "applied_date": "2025-08-12",
  "follow_up_date": "2025-08-19",
  "priority": "High",
  "resume_version": "SWE_v1.pdf",
  "tags": "python,django,aws",
  "notes": "Referred by John"
}
```

`PATCH /api/applications/<UUID>/` — partial update (e.g., change status)

```json
{ "status": "Interview" }
```

`DELETE /api/applications/<UUID>/` — remove an application

Query params:

* `search` (company, role, location, source, stage, tags, notes)
* `status` = Saved | Applied | Interview | Offer | Rejected | Ghosted
* `priority` = Low | Medium | High
* `applied_date__gte` / `applied_date__lte` (YYYY-MM-DD)
* `follow_up_date__gte` / `follow_up_date__lte` (YYYY-MM-DD)
* `ordering` = -applied\_date | company | role | ...

---

## 5) Frontend Features

* Applications table — live data from Django
* Search/Filters — search text, status, priority, sorting
* Inline status update — change status without opening a dialog
* New/Edit dialogs — full CRUD
* Export/Import — JSON and CSV (simple CSV parser)
* Upcoming follow-ups — shows next 5 items by `follow_up_date`

---

## 6) Troubleshooting

Frontend shows "Failed to fetch":

* Backend is not running, or `API_BASE` is wrong.
* Set `const API_BASE = "http://127.0.0.1:8000/api";` and restart `npm run dev`.

Visiting `http://127.0.0.1:5173/api/...` fails:

* Normal unless you set up the Vite proxy. The frontend should call Django at `127.0.0.1:8000`.

`OperationalError: no such table` on `/api/applications/`:

* Run migrations:

  ```bash
  cd backend
  source .venv/bin/activate
  python manage.py makemigrations
  python manage.py migrate
  ```

Tailwind v4 warnings/errors:

* Use `@import "tailwindcss";` in `src/index.css` and apply utilities in JSX (avoid `@apply` in CSS).

---

## 7) Nice-to-Have Next

* Auth (JWT) and multi-user support
* Attachments (resume, cover letter) via Django media storage
* Email/SMS reminders for follow-up dates
* Deploy: API to Render/Fly/EC2, frontend to Vercel/Netlify
* Switch SQLite to Postgres in prod

---

## 8) Development Cheatsheet

Backend:

```bash
cd backend
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8000
```

Frontend:

```bash
cd frontend
npm run dev
```

API smoke test:

```bash
curl http://127.0.0.1:8000/api/applications/
```

Create an app (curl):

```bash
curl -X POST http://127.0.0.1:8000/api/applications/ \
  -H "Content-Type: application/json" \
  -d '{"company":"Acme","role":"Backend Engineer","status":"Applied","priority":"High"}'
```

---

## 9) License

MIT

---

## 10) Credits

* Tailwind CSS v4, shadcn/ui, Vite, React, DRF.

---

Reminder: commit and push to GitHub.

```bash
git add -A
git commit -m "docs: update README"
git push
```
