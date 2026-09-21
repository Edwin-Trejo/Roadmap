# Budget Tracker — Implementation Plan

## Context

Edwin wants to build a personal budget tracking tool, starting as a web-based
service (accessible from phone browsers) with a longer-term path to a native
iOS app. The project has three planned versions:

- **V1 (this plan's focus):** manual expense entry (amount, category, date,
  optional note), with totals by category and by month.
- **V2:** automate entry via receipt scanning (OCR).
- **V3:** location-based reminders to log spending.

This is a greenfield project — the working directory started empty, no
language/framework had been chosen yet, and the goal of this plan is to pick
a stack that fits V1 now while not boxing out V2/V3. Edwin has working
knowledge of JavaScript/TypeScript, Python, and some Swift/iOS; he'll run the
service long-term on a Proxmox home server (existing Linux containers, more
can be created) and wants to reach it from his phone via Tailscale rather
than exposing it to the public internet — a good fit for a personal finance
app. He wants a PWA-style responsive web app for now, with native Swift
possibly revisited later, reusing the same backend API.

## Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | **Python + FastAPI** | Edwin already knows Python; FastAPI gives typed request/response validation (Pydantic), auto-generated OpenAPI docs, and async support. Python's OCR/ML ecosystem (pytesseract, OpenCV, cloud vision SDKs) makes V2 receipt scanning a natural extension of the same service instead of a rewrite. |
| Frontend | **React + TypeScript + Vite** | Edwin already knows JS/TS/React. Built as a responsive, installable PWA so it works well on a phone browser without committing to native code yet. |
| Database | **PostgreSQL** | Robust, free, runs easily in a Proxmox container/Docker. Postgres also has the **PostGIS** extension available if V3's location-based reminders need geospatial queries later — no migration to a different DB required. |
| ORM / migrations | **SQLAlchemy 2.0 + Alembic** | Standard, well-documented pairing with FastAPI; Alembic gives versioned schema migrations as the data model grows across V1→V3. |
| Auth | **JWT-based auth (single user account for now)** | Even on a private Tailscale network, basic login protects the data and sets up the same token-based auth a future native iOS app will need to call the API. |
| Styling | **Tailwind CSS** | Fast to build a clean, mobile-first responsive UI without hand-rolling CSS. |
| Server state / data fetching | **TanStack Query (React Query)** | Handles API calls, caching, and refetching without needing Redux for a CRUD-style app. |
| Hosting | **Docker Compose on an existing Proxmox Linux container (or a new one)** | Matches Edwin's existing infra; one `docker-compose.yml` runs the API, frontend, and Postgres together, and restarts automatically (`restart: unless-stopped`) for 24/7 uptime. |
| Remote access | **Tailscale** | App stays off the public internet entirely — install Tailscale on the phone and the server, no domain name, port forwarding, or TLS certs to manage. Best fit for a financial app. |
| Testing | **pytest** (backend), **Vitest + React Testing Library** (frontend) | Standard, low-friction choices for each ecosystem. |

### Why this fits V2 and V3 without a rewrite

- **V2 (receipt scanning):** stays entirely in the FastAPI backend — add an
  endpoint that accepts an image upload, runs OCR (e.g. Tesseract locally or
  a cloud Vision API), and pre-fills an expense entry for the user to
  confirm. No frontend framework change needed; React just adds an "upload
  receipt" flow that hits the new endpoint.
- **V3 (location-based reminders):** the API-first design means a future
  native Swift app (or the PWA's Geolocation API, though iOS restricts
  background geolocation for web apps) can consume the same `/expenses` and
  `/reminders` endpoints. If geofencing needs geospatial queries, Postgres
  can gain the PostGIS extension in place.

## Project Structure

```
Budget_tracker/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entrypoint
│   │   ├── models.py          # SQLAlchemy models (Expense, Category, User)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── expenses.py    # CRUD + totals-by-category/month
│   │   │   └── auth.py        # login/JWT issuance
│   │   ├── database.py        # engine/session setup
│   │   └── alembic/           # migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/              # Dashboard, AddExpense, History
│   │   ├── components/
│   │   ├── api/                # typed API client (fetch wrappers)
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml           # api + web + postgres services
├── .env.example
└── README.md
```

## V1 Scope (Data Model & API)

**Data model**
- `Category` — id, name (e.g. Groceries, Rent, Transport; seed with defaults,
  user can add more)
- `Expense` — id, amount, category_id, date, note (optional), created_at

**API endpoints**
- `POST /auth/login` → JWT
- `POST /expenses` — create expense
- `GET /expenses` — list, filterable by month/category
- `PUT /expenses/{id}` / `DELETE /expenses/{id}`
- `GET /expenses/summary?by=category&month=YYYY-MM` — totals by category
- `GET /expenses/summary?by=month&year=YYYY` — totals by month
- `GET /categories` / `POST /categories`

**Frontend pages**
- **Add Expense** form (amount, category dropdown, date picker, optional note)
- **Dashboard** — current month totals by category (simple bar/pie), running
  monthly total
- **History** — list/filter past expenses by month or category

## Deployment Plan

1. Create a new Proxmox LXC/VM (or reuse an existing Linux container) with
   Docker + Docker Compose installed.
2. `docker-compose.yml` defines three services: `postgres`, `api` (FastAPI),
   `web` (built React app served via Nginx or Vite preview).
3. Install Tailscale on that container and on Edwin's phone; access the app
   via the container's Tailscale IP/hostname — no public ports opened.
4. `restart: unless-stopped` on all services for 24/7 availability;
   Postgres data on a mounted volume for persistence.

## Next Steps

1. Scaffold `backend/` (FastAPI + SQLAlchemy + Alembic) and `frontend/`
   (Vite + React + TS + Tailwind) per the structure above.
2. Implement the V1 data model, migrations, and CRUD + summary endpoints.
3. Build the three V1 frontend pages against the API.
4. Write a `docker-compose.yml` for local dev, verify it end-to-end, then
   deploy the same compose file to the Proxmox container.
5. Set up Tailscale on the container and confirm the phone can reach the app.

## Verification

- Backend: `pytest` passing; manually hit endpoints via the FastAPI
  auto-generated docs (`/docs`) to confirm CRUD + summary math is correct.
- Frontend: `npm run dev`, walk through add-expense → dashboard → history
  flow in a browser at both desktop and phone widths.
- End-to-end: run `docker-compose up` locally to confirm all three services
  talk to each other before deploying to Proxmox.
- Deployment: from a phone with Tailscale connected, load the app over the
  Tailscale hostname and add/view an expense.
