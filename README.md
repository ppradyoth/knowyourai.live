# KnowYourAI

Source for [knowyourai.live](https://knowyourai.live): free AI security tools, a hosted platform for testing and enforcing what an AI system is allowed to do, and published security research.

The platform has two parts:

- **IntentScan** points adversarial probes at any AI API and reports where it steps outside its intended scope.
- **IntentEnforce** sits in front of an AI API as a proxy, classifies what each request is for, and allows, blocks or asks for clarification before the model sees it.

Both are free. You sign in, add your own Claude or Gemini key, and the platform uses that key for its model calls. Keys are stored encrypted (AES-GCM) and are never returned by the API.

This project was previously called AkrivonAI.

---

## What is on the site

| Stage | Tool | What it answers |
|---|---|---|
| Before you run it | [knowyourai](https://github.com/ppradyoth/knowyourai) | Is the model on your machine the model it claims to be? |
| | [agentscan](https://github.com/ppradyoth/agentscan) | A linter for the config files that give your coding agent its power. |
| | [Agent Supply Chain Guard](https://github.com/ppradyoth/agent-supply-chain-guard) | Your AI agent can be compromised by a file it reads. |
| | [jev-guard](https://github.com/ppradyoth/jev-guard) | Type-safe is not the same as correct. |
| Before you ship it | [AgentInjectionBench](https://github.com/ppradyoth/AgentInjectionBench) | Catch unsafe tool calls before you ship. |
| | [Weighted Safety Refusal](https://github.com/ppradyoth/weighted-safety-refusal) | A safety score that a model cannot game by refusing everything. |
| | [YOLOBench](https://github.com/ppradyoth/yolobench) | Does your coding agent ask before it touches something real? |
| While it is live | IntentScan (this repo) | Point it at your AI endpoint and get a risk score. |
| | IntentEnforce (this repo) | Decide what a request is for before your model sees it. |
| | [Railproof](https://github.com/ppradyoth/railproof) | If the action is not explicitly allowed, it does not execute. |
| Learn how it breaks | [Prompt Injection CTF](https://knowyourai.live/ctf) | Break a constrained AI, then read the guardrail that stops you. |
| | [Build & Break Models From Scratch](https://github.com/ppradyoth/build-break-models-from-scratch) | You understand a mechanism when you can attack it. |
| | [Intent Drift Playbook](https://github.com/ppradyoth/intent-drift-playbook) | The jailbreak no single-turn scanner can see. |
| | [AI Security Resources](https://github.com/ppradyoth/ai-security-resources) | One map of the field, from foundations to red teaming. |

The tool catalogue lives in [frontend/src/data/tools.ts](frontend/src/data/tools.ts) and the research case studies in [frontend/src/data/research.ts](frontend/src/data/research.ts).

---

## How the platform works

### IntentScan

You describe what the target AI is for, what it may and may not do, and how many tests to run (1 to 200). IntentScan then:

1. Generates adversarial prompts with three strategies: **role transformation**, **gradual drift** and **language variation**.
2. Sends them to your API.
3. Has a judge model label each response as `capability_drift`, `role_drift`, `domain_violation` or `none`, with a severity and a confidence.
4. Returns a risk score from 0 to 100 and the full violation list, also available as a PDF report.

Scans run as background jobs through Cloud Tasks, so the request returns a scan ID straight away.

### IntentEnforce

You create a **layer**: a target URL, a set of intent categories, and policy rules. Each layer gets a proxy URL. For every request sent to it, IntentEnforce:

1. Classifies the intent of the prompt.
2. Applies the layer's rules to reach `allow`, `block` or `clarify`.
3. Forwards allowed requests to the target and withholds the response if it is over 10,000 characters or contains injection-style text such as "ignore previous instructions".

Target URLs are checked against private and internal address ranges before any request is sent.

---

## Repository layout

| Path | Contents |
|---|---|
| `frontend/` | React + TypeScript + Vite site and dashboard |
| `backend/app/` | FastAPI app: scans, layers, API keys, provider keys, rate limits, PDF reports |
| `backend/intent_layer/` | IntentEnforce: classifier, policy engine, router, response validator || `backend/pipeline/` | Analytics over scan results: DuckDB warehouse, vector search, triage agent |
| `backend/main.py` | Firebase Cloud Function wrapper around the FastAPI app |
| `functions/` | Cloud Function that emails new assessment requests |
| `firestore.rules` | Browser access is limited to creating assessment requests; everything else goes through the backend |

---

## API

All endpoints except `/health` and `/proxy/{layer_id}` need an `Authorization: Bearer <token>` header. The token is either a Firebase ID token or a platform API key (`ak_live_…`) created from the dashboard. In production the API is served under `/api`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/scan` | Start a scan |
| `GET` | `/scans`, `/scans/{id}` | List scans, fetch one |
| `GET` | `/scans/{id}/report.pdf` | Download the report |
| `POST` | `/enforce` | Classify and route a single prompt |
| `POST` `GET` `PUT` `DELETE` | `/layers`, `/layers/{id}` | Manage enforcement layers |
| `GET` | `/layers/{id}/requests` | Requests a layer has handled |
| `POST` | `/proxy/{layer_id}` | The proxy endpoint your application calls |
| `GET` `PUT` `DELETE` | `/provider-key` | Your Claude or Gemini key |
| `POST` `GET` `DELETE` | `/api-keys` | Platform API keys |
| `GET` | `/usage` | Usage against your quota |

The free plan allows 10 requests per minute and 1,000 tests per month.

### `POST /scan`

```json
{
  "api_url": "https://your-ai-api.example.com/chat",
  "use_case": "A customer support assistant for a SaaS product. It answers questions about billing, account management, and product features.",
  "allowed_capabilities": ["billing questions", "account help", "feature explanations"],
  "disallowed_capabilities": ["investment advice", "legal advice", "writing code"],
  "languages": ["English"],
  "num_tests": 20
}
```

### `POST /enforce`

```json
{
  "prompt": "Can you help me set up a Stripe webhook?",
  "target_api": "https://your-ai-api.example.com/chat",
  "config": {
    "allowed": ["payments_api_help", "general_coding"],
    "blocked": ["financial_advice"]
  }
}
```

The response carries the detected intent and confidence, the decision, the final response, and the result of the output check.

---

## Local development

You need Python 3.11, Node.js 18+, and a Firebase project with Authentication and Firestore enabled. The backend uses the Firebase Admin SDK, so it needs application default credentials for that project.

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. Set `VITE_API_BASE` and the `VITE_FIREBASE_*` values in `frontend/.env.development` to point it at your backend and Firebase project.

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PROVIDER_KEY_MASTER` | Yes | none | 32 random bytes, URL-safe base64. Encrypts each user's stored provider key. |
| `CLAUDE_MODEL` | No | `claude-opus-5-5` | Model used when a user with a Claude key has not chosen one |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Model used when a user with a Gemini key has not chosen one |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated CORS origins |
| `INTENT_TARGET_API_URL` | No | none | Default target for `/enforce` when the request has none |
| `GCP_PROJECT`, `CLOUD_TASKS_LOCATION`, `CLOUD_TASKS_QUEUE`, `SCAN_WORKER_URL` | For background scans | none | Cloud Tasks queue that runs scan jobs |
| `WAREHOUSE_DB_PATH` | No | local file | Location of the DuckDB warehouse |

---

## Deployment

Everything runs on Firebase. Hosting serves `frontend/dist` and rewrites `/api/**` to the `api` Cloud Function (Python 3.11, `us-central1`).

```bash
firebase functions:secrets:set PROVIDER_KEY_MASTER --project <your-project-id>
```

```bash
cd frontend && npm run build
```

```bash
firebase deploy --project <your-project-id>
```

Always pass `--project` explicitly. `.firebaserc` lists more than one project.

---

## Responsible use

Only scan AI systems you own or have written permission to test.
