# The Loop — connecting IntentScan to IntentEnforce

Status: plan, not built. Written 2026-08-08.

## Thesis

IntentScan finds violations. IntentEnforce blocks them. Right now they are two
products a customer has to wire together by hand, and nothing proves the second
one actually fixed what the first one found.

The Loop closes that gap:

```
IntentScan campaign
      │  confirmed violations
      ▼
Policy synthesis  ──► IntentEnforce policy set (versioned, diffable)
      ▼
Replay the exact violating traces against the enforced target
      ▼
Evidence: N found → M policies generated → M blocked on replay
```

Attack → defend → prove, as one system. Every competing tool does exactly one of
the three. The proof artifact is the product: "we found 14 boundary violations,
generated policies for 11, and 11 stay blocked on replay" is a report no scanner
can produce.

## Planes

**1. Target plane.** Adapters for the system under test: raw HTTP API (exists in
IntentScan), MCP server, tool-use loop. Tool calls execute against honeypot
implementations in a container — a `send_email` that records instead of sends —
so exfiltration is observable without anything real leaving.

**2. Red team plane.** IntentScan's three strategies (Role Transformation,
Gradual Drift, Language Variation) become tools available to a small agent team
rather than a fixed pipeline:

- **Recon** — maps the target's tool surface, probes refusal boundaries,
  fingerprints the system prompt
- **Strategist** — selects attack families from an OWASP LLM Top 10 / MITRE
  ATLAS taxonomy and plans multi-turn campaigns
- **Attackers** — execute campaigns in parallel under a token budget
- **Judge** — scores outcomes (see Scoring below)
- **Trace memory** — successful attack paths feed the next strategist run

**3. Synthesis plane.** Confirmed violations compile into a declarative policy
DSL. Each generated policy carries a matcher, an allowlist, and the trace that
justified it. Policies are reviewable artifacts, not a black box.

**4. Enforcement plane.** IntentEnforce, generalized from intent
allow/block to arbitrary compiled policies. Inline on the tool-call path. Fails
closed. Latency budget: sub-10ms for the policy check itself. The PreToolUse
hook pattern from `credential-guard` is the reference implementation.

**5. Evidence plane.** Deterministic record/replay of every LLM call, a
per-campaign cost ledger, and a before/after view showing which specific traces
changed verdict.

## Scoring

Use Weighted Safety Refusal (SSRN 2026, DOI 10.2139/ssrn.6874522) as the judge's
metric rather than a flat violation count — severity-weighted, reference-free,
and gaming-resistant, so a target that blocks everything scores zero instead of
perfect. Repo: github.com/ppradyoth/weighted-safety-refusal

`AgentInjectionBench` supplies the agentic tool-use attack corpus.

## Model routing

Claude only, Sonnet and Haiku — no Opus. (The current codebase uses Gemini; this
is a deliberate routing decision for the loop, not a wholesale migration.)

| Job | Model | Rate (per MTok) |
|---|---|---|
| Attack mutation, payload generation | `claude-haiku-4-5` | $1 / $5 |
| Trace triage, log labeling | `claude-haiku-4-5` | $1 / $5 |
| Campaign planning, policy synthesis | `claude-sonnet-5` | $3 / $15 |
| WSR judging | `claude-sonnet-5` | $3 / $15 |

Two API differences the model-router must encode rather than paper over:

- **Thinking config differs.** Sonnet 5 uses adaptive thinking (on by default)
  with `output_config.effort`. Haiku 4.5 predates that — it needs
  `thinking: {type: "enabled", budget_tokens: N}` and **errors if sent `effort`**.
- **Prompt-cache minimums differ: 1024 tokens on Sonnet 5, 4096 on Haiku 4.5.**
  A 2K cached prefix caches on Sonnet and silently does not on Haiku — no error,
  just `cache_creation_input_tokens: 0`. Haiku carries the highest request
  volume, so this is where a silent miss costs the most. Assert
  `cache_read_input_tokens > 0` in CI.

## Cost envelope

A 200-probe campaign against one target:

- Haiku generation: ~400K in / 100K out = **~$0.90**
- Sonnet judging: ~600K in / 60K out = **~$2.70** ($1.80 at intro pricing)
- With the judge rubric cached (reads at 0.1x): closer to **~$1 total**

Batch API is 50% off for the offline regression corpus. Surface the per-campaign
cost in the dashboard — it is a differentiator, not just an internal metric.

## Phases

| Phase | Ships | Demoable |
|---|---|---|
| 0 | Target adapter + honeypot tools + record/replay | Attack one target by hand, replay deterministically |
| 1 | Single attacker + WSR judge + cost ledger | Real findings against a real target |
| 2 | Multi-agent: recon → strategist → parallel attackers | The agentic story |
| 3 | Policy synthesis + IntentEnforce integration | The loop closes |
| 4 | Replay verification + regression suite in CI | The proof artifact |
| 5 | Dashboard, writeup, published benchmark results | The public deliverable |

Phase 1 is a weekend and already stands alone. Phases 3–4 are the part nothing
else in the space does.

## First target

`prompt-injection-ctf` (github.com/ppradyoth/prompt-injection-ctf) — 16 levels of
known-vulnerable behavior, full OWASP LLM Top 10 coverage, and it is ours to
break. "The platform autonomously solves our own CTF" is a demo that explains
itself in one sentence, with ground truth to measure recall against.

## Non-negotiables

These are what make it read as engineering rather than a demo:

- **Deterministic replay** of every LLM call. A security finding that cannot be
  reproduced is not a finding.
- **Cost ledger per campaign**, with model-routing decisions visible.
- **Enforcement fails closed**, with an explicit latency budget.
- **Generated policies are human-reviewable** and carry their justifying trace.
