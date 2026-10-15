---
title: "Cap spend and rate-limit every AI endpoint"
description: "Bound model spend and request work with authentication, per-user and per-IP limits, input and output caps, and bounded agent tool loops."
stage: one-hour-baseline
builds: [chatbot, rag, tool-calling-agent, agent-with-memory, llm-judge]
time: "15 min"
checklist: "AI endpoints require authentication, limit each user and IP, and cap input, output, agent iterations and tool calls."
agent_rule: "Require authentication before model calls, rate-limit per user and IP, cap input length and max_tokens, and bound agent iterations and tool calls. Configure provider budgets and alerts."
review: pending
updated: 2026-10-15
---

## The risk

One HTTP request can start several model calls and tool actions. A limit on the outer request does not bound that inner work. An unauthenticated endpoint also lets someone spend your provider budget without first having an account you can limit.

## The fix

1. Configure a hard monthly budget and alerts at the provider where those controls are available. Confirm whether a setting stops calls or only sends a notification. An alert alone is not a hard budget.
2. Authenticate before calling the model. Take the user identity from the verified session and the IP from your server's trusted request handling, not from values the caller puts in the JSON body.
3. Apply separate limits to the user and the IP. Count accepted requests before invoking the provider. Use a shared, atomic counter when requests can reach multiple server processes.
4. Reject oversized input before the provider sees it. Set `max_tokens` on every provider call. Bound the number of iterations in an agent loop and the total number of tool calls made during that request.

The following counters illustrate the decision for one server process. The values are example limits, not recommended quotas. Move the same check into your shared limiter before using it across replicas, and keep the rejection outside the model call.

```ts
const counts = new Map<string, number>();
const limits = { requests: 10, input: 2000, max_tokens: 128, iterations: 4, tools: 8 };

export function admit(user: string | undefined, ip: string, input: string, now = Date.now()) {
  if (!user) return 401;
  if (input.length > limits.input) return 413;
  const window = Math.floor(now / 60000);
  const keys = [`user:${user}:${window}`, `ip:${ip}:${window}`];
  if (keys.some((key) => (counts.get(key) ?? 0) >= limits.requests)) return 429;
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return 200;
}
```

```python
counts: dict[str, int] = {}
limits = {"requests": 10, "input": 2000, "max_tokens": 128, "iterations": 4, "tools": 8}

def admit(user: str | None, ip: str, text: str, now: int) -> int:
    if not user:
        return 401
    if len(text) > limits["input"]:
        return 413
    window = now // 60
    keys = [f"user:{user}:{window}", f"ip:{ip}:{window}"]
    if any(counts.get(key, 0) >= limits["requests"] for key in keys):
        return 429
    for key in keys:
        counts[key] = counts.get(key, 0) + 1
    return 200
```

Return the rejection as the HTTP status from your own handler. Pass the output bound to your provider adapter, and stop the agent before it exceeds either work counter. Merely declaring those three values in a settings object does not enforce them.

## Prove it works

In a test environment, send the configured request limit plus one request within one window. Expect HTTP 429 on the extra request and assert that it never invokes the provider. Repeat with different users sharing one IP, and with one user using different IPs, to exercise both counters.

Send an oversized input and count provider calls. The input must fail before any model call. Use a stub model that repeatedly asks for tools to show that the loop stops at the configured iteration or tool-call bound. Check the arguments your adapter passes for `max_tokens` too.

## Know the limit

A per-process counter resets when the process restarts and does not coordinate replicas. Request and token caps limit work, but they are not a precise bill calculation. Provider budget behavior must be checked for the account and service you actually use.
