---
title: "Log enough to investigate, without leaking"
description: "Record request and user IDs, tool calls and allow or deny decisions, but redact sensitive arguments before writing or sending traces anywhere."
stage: before-first-customer
builds: [chatbot, rag, tool-calling-agent, agent-with-memory]
time: "30 min"
checklist: "Traces record request IDs, user IDs, tool calls and decisions, redact secrets and personal data before writing, and have restricted access and retention."
agent_rule: "Record request IDs, user IDs, tool calls and allow or deny decisions. Redact secrets and personal data before writing traces, restrict trace access and set retention, including for third-party tracing."
review: pending
updated: 2026-10-15
---

## The risk

Without a trace, you may not be able to tell which tool an agent called or why the server allowed it. Logging every raw prompt and argument creates another copy of users' private data and keys. A third-party tracing service receives whatever you send to it.

## The fix

1. Record a request ID, the authenticated user ID, each tool call with its arguments and the allow or deny decision. Use server-established identifiers and the tool name your handler resolved. Keep enough structure to connect the decision with the request that triggered it.
2. Redact secrets and personal data before writing the event. Apply the same decision to local logs and exported traces. Sending a raw event to a tracing service and redacting the display later still sends the raw data to that service.
3. Set a retention period for the traces you keep. Check the actual storage configuration against that period. Include copies held by a tracing provider in your decision rather than assuming the application log setting covers every destination.
4. Restrict who can read traces. Review their content as customer data, including prompts or tool arguments sent to a third party. An investigation view should not make every user able to browse another user's requests.

These examples conservatively redact the values of two known argument fields before writing an event. Add the fixed fields from each validated tool schema deliberately. Do not copy an arbitrary model-generated object into the log. Use opaque server user IDs, not email addresses or other personal values, for this example's identifier.

```ts
type Event = {
  requestId: string; userId: string; tool: string;
  arguments: { recordId?: string; query?: string };
  decision: "allow" | "deny";
};

export function writeTrace(event: Event) {
  const args: Record<string, string> = {};
  for (const key of ["recordId", "query"] as const) {
    if (key in event.arguments) args[key] = "[redacted]";
  }
  console.log(JSON.stringify({ requestId: event.requestId, userId: event.userId,
    tool: event.tool, arguments: args, decision: event.decision }));
}
```

```python
import json

def write_trace(event: dict) -> None:
    args = {key: "[redacted]" for key in ("record_id", "query") if key in event["arguments"]}
    print(json.dumps({
        "request_id": event["request_id"], "user_id": event["user_id"],
        "tool": event["tool"], "arguments": args, "decision": event["decision"],
    }))
```

This retains which fields were present without keeping their text. If you need particular argument values for investigation, decide which validated fields you can retain and which redactor they need before changing the logger. Keep the raw event out of error messages and export paths too.

## Prove it works

Send a test prompt containing a fake card number and a fake API key through the actual product path. Make the values distinctive and record them in your test fixture. Exercise an allowed call, a denied call and a failure path so each logger destination receives an event.

Search stored logs and exported traces for both markers. They must be absent, while the request ID, tool name and decision remain available. Repeat against any third-party trace destination. Check that a user without trace access cannot read the events and that the configured retention period applies to the store you inspected.

## Know the limit

The example redacts argument values rather than diagnosing their content. It does not implement a general personal-data detector or decide your retention period. Any additional value you retain needs its own review before you send it to a log or tracing provider.
