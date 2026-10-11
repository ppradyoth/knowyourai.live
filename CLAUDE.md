# CLAUDE.md

Follow GUIDE_PLAN.md section 0.

## Defaults (read first)
- No explanations, no trailing summaries — just make the change
- No new files unless explicitly asked
- No comments, no docstrings unless asked
- Only touch files mentioned in the request
- No added error handling for impossible scenarios
- No abstractions beyond what the task requires

## Project Overview

KnowYourAI is an AI boundary testing and enforcement platform with two core capabilities:
1. **IntentScan** (`/scan`) — red-team probe generation and violation detection against a target AI API
2. **IntentEnforce** (`/enforce`) — real-time intent classification and policy enforcement acting as a proxy layer

## Development Commands

### Backend (FastAPI + Python 3.11)

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Setup from scratch:
```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then set GEMINI_API_KEY and optionally GEMINI_MODEL
```

### Frontend (React + Vite + TypeScript)

```bash
cd frontend
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # tsc -b && vite build → frontend/dist/
```

`frontend/.env.development` sets `VITE_API_BASE=http://localhost:8000` so the dev build hits the local uvicorn server directly. Production builds default `VITE_API_BASE` to `/api`, which Firebase Hosting rewrites to the Cloud Function.

## Architecture

### Backend (`backend/`)

**`app/main.py`** — FastAPI entry point. CORS is allowed only for `localhost:5173`. Two routes:
- `POST /scan` → `app.engine.run_scan`
- `POST /enforce` → `intent_layer.engine.enforce` with an injected synchronous `call_api` proxy (run in a thread pool via `loop.run_in_executor` to avoid blocking the async event loop)

**`app/engine.py`** — IntentScan pipeline, five stages run in sequence per test:
1. `constraint_builder` — normalizes `ScanConfig` into a `Constraints` dataclass
2. `strategy_engine` — assigns strategies round-robin: `RoleTransformation`, `GradualDrift`, `LanguageVariation`
3. `probe_generator` — calls Gemini to synthesize red-team prompts per strategy/language
4. `_invoke_target_api` — tries multiple JSON payload keys (`prompt`, `message`, `input`, `query`) against the target; extracts response from common keys (`response`, `output`, `text`, `message`, `answer`, `result`)
5. `detector` — calls Gemini to classify each (probe, response) pair for violations; `_risk_score` computes weighted score (severity × confidence, normalized to 0–100)

**`app/gemini_client.py`** — thin wrapper around `google-generativeai`. Reads `GEMINI_API_KEY` and `GEMINI_MODEL` (default: `gemini-pro`) from env. Single `llm(prompt: str) -> str` function used by both `engine.py` and `intent_layer/classifier.py`.

**`app/security.py`** — SSRF guard. `assert_safe_url()` resolves the hostname and rejects loopback, private, link-local, reserved, multicast, and RFC 6598 (`100.64.0.0/10`) addresses. Called before any outbound HTTP request to a user-supplied URL.

**`app/models.py`** — Pydantic v2 models shared across routes and engine. `ScanConfig`, `ScanResponse`, `EnforceRequest`, `EnforceResponse` are the API contracts.

**`intent_layer/`** — enforcement pipeline (four steps, no async):
- `classifier.py` — calls Gemini to classify intent into `general_coding`, `financial_advice`, `payments_api_help`, `general_knowledge`, or `unclear`; returns `{label, confidence}`
- `policy.py` — checks label against `allowed`/`blocked` lists; returns `allow`, `block`, or `clarify`
- `router.py` — on `allow`, calls the injected `call_api` callback; otherwise returns canned strings
- `validator.py` — regex-based injection detection; blocks responses containing jailbreak/role-subversion patterns or exceeding `_MAX_SAFE_LENGTH` (10,000 chars)
- `engine.py` — orchestrates the four steps, replacing the response with a safety message if validation fails

### Frontend (`frontend/`)

React SPA using React Router v7. All routes nest under a single `Layout` wrapper (`components/Layout.tsx` → Navbar + Outlet + Footer). Two pages make live backend calls:
- `/intentscan` (`pages/Demo.tsx`) — IntentScan form using `ConfigForm`, `ResultsPanel`, `ViolationCard` components
- `/enforce` (`pages/Enforce.tsx`) — IntentEnforce playground

`src/api.ts` — all backend calls; reads `VITE_API_BASE` from env (dev: `http://localhost:8000`, prod: `/api`).
`src/types.ts` — TypeScript mirrors of the Pydantic models.

There are also several static marketing/content pages (Home, Product, Pricing, Blog, etc.) and unused layout components (`layout/AppLayout.tsx`, `layout/SiteLayout.tsx`) that are not wired into `App.tsx`.

Blog content lives as markdown files in `frontend/src/blog/posts/` and is rendered via `react-markdown`.

### Deployment

`backend/main.py` is the Firebase Cloud Function entrypoint. It wraps the FastAPI app in `a2wsgi.ASGIMiddleware`, strips the `/api` prefix from `PATH_INFO`, and exposes an `api` function via `firebase_functions.https_fn`. `GEMINI_API_KEY` is injected as a Firebase Secret Parameter.

Firebase Hosting (`firebase.json`) serves `frontend/dist/` and has a catch-all rewrite to `/index.html` for client-side routing. The `/api/**` → Cloud Function rewrite must be added to `firebase.json` under `"rewrites"` before deploying the backend via Firebase.

## Key Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-pro` | Gemini model name |
| `INTENT_TARGET_API_URL` | No | — | Fallback target for `/enforce` if not in request |
| `VITE_API_BASE` | No | `/api` | Frontend API base URL (set to `http://localhost:8000` in `.env.development`) |

## No Test Suite

There are currently no automated tests. Manual testing is done via the frontend UI or direct API calls to `http://localhost:8000`.
