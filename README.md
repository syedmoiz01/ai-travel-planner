# AI Travel Planner

Generates AI-written day-by-day trip itineraries, with auth, saved trips, an AI chat
assistant, a deal finder, and an admin dashboard. Scoped down from a much larger
production spec — see [.agent/plans/1.mvp-scaffold.md](.agent/plans/1.mvp-scaffold.md)
for the original scoping rationale.

## Stack

- Frontend: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui — `frontend/`
- Backend: FastAPI + Pydantic + SQLAlchemy — `backend/`
- LLM: OpenAI-compatible API (OpenAI or OpenRouter), configurable via env vars
- Auth: email/password + JWT, SQLite by default (swappable for Postgres via `DATABASE_URL`)

## Setup

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in LLM_API_KEY and JWT_SECRET at minimum
uvicorn app.main:app --port 8000 --reload
```

`.env` vars:
- `LLM_API_KEY` — your OpenAI or OpenRouter key (required for `/api/itinerary` and `/api/chat`)
- `LLM_BASE_URL` / `LLM_MODEL` — defaults to OpenAI; see `.env.example` for OpenRouter values
- `JWT_SECRET` — generate with `python3 -c "import secrets; print(secrets.token_hex(32))"`
- `DATABASE_URL` — optional, defaults to a local `backend/app.db` SQLite file
- `OPENWEATHER_API_KEY` / `GOOGLE_MAPS_API_KEY` — optional; without these, destination
  weather/hotels/attractions fall back to mock data

The **first user who registers becomes an admin** automatically (`/admin` dashboard).

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit http://localhost:3000.

### Docker

```bash
docker compose up --build
```

Runs both services (frontend on :3000, backend on :8000) using `backend/.env` for backend
config. Not yet tested against a live Docker daemon in this environment — verify locally
before relying on it. Actual cloud hosting (Vercel, AWS, etc.) needs your own accounts and
isn't set up here beyond the Dockerfiles and `docker-compose.yml`.

## What's real vs. mocked

- Itinerary generation (`/api/itinerary`) and the chat assistant (`/api/chat`) make real LLM calls.
- Hotels/attractions use Google Places and weather uses OpenWeather when their API keys are
  set; otherwise all three fall back to mock data shaped the same way.
- The deal finder (`/api/deals/{name}`) is always mock data (price history, cheapest day to
  fly, book-now/wait recommendation) — no flight/hotel pricing API (Amadeus, Skyscanner,
  booking partner APIs) is wired up yet. Clearly flagged via `is_mock_data` in the response
  and a badge in the UI.

## Not built yet

Google/Apple OAuth login (email/password only for now), live booking partner integrations,
Kubernetes manifests, and actual cloud deployment.
