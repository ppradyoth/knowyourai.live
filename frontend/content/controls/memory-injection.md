---
title: "Treat agent memory as untrusted input"
description: "Write memory only through explicit user actions or validated paths, retain its source, let users inspect and delete it, and load it as data."
stage: before-first-customer
builds: [agent-with-memory, rag, tool-calling-agent]
time: "45 min"
case: brave-leo
tools: [prompt-injection-ctf]
checklist: "Memory writes use explicit user actions or validated paths, carry their source, exclude secrets and remain visible and deletable to users."
agent_rule: "Treat agent memory as untrusted data with provenance. Permit writes only through explicit user action or a validated path, never document instructions, and let users inspect and delete stored memory."
review: pending
updated: 2026-10-15
---

## The risk

A hostile instruction can outlive the document that carried it if an agent stores it as memory. A later session can load the instruction without showing the user the original source. Calling stored text a preference does not make it a trusted instruction.

## What happened in production

The case makes the memory write and reload paths part of the boundary you need to test.

## The fix

1. Allow memory writes only through an explicit user action or a path whose values you validate. A web page or document asking the agent to remember something is not that action. Separate the write path from the model's interpretation of retrieved content.
2. Store memory as data with its source. Keep the source when the record is loaded again so a later session does not mistake an old piece of outside text for a new system instruction.
3. Keep secrets and payment details out of memory. Limit stored values to what the feature needs. If you accept free-form memory, review how that path validates the content before it is written rather than assuming the model selected harmless text.
4. Let the user see and delete stored memory. When loading it into context, label it as untrusted data. A record the user approved storing can still contain text the model should not treat as authority over tools or permissions.

This example permits only a bounded display preference from your authenticated settings handler. The handler supplies the user ID after an explicit user action. Do not expose the save function as a tool that a retrieved document can cause the model to call.

```ts
type Memory = { source: string; preference: "brief" | "detailed" };
const memory = new Map<string, Memory>();

export function savePreference(userId: string, value: unknown) {
  if (value !== "brief" && value !== "detailed") throw new Error("invalid_preference");
  memory.set(userId, { source: "explicit_user_action", preference: value });
}
export function viewMemory(userId: string) { return memory.get(userId); }
export function deleteMemory(userId: string) { memory.delete(userId); }
export function memoryContext(userId: string) {
  return JSON.stringify({ kind: "untrusted_memory", data: viewMemory(userId) ?? null });
}
```

```python
import json

memory: dict[str, dict] = {}

def save_preference(user_id: str, value: str) -> None:
    if value not in ("brief", "detailed"):
        raise ValueError("invalid_preference")
    memory[user_id] = {"source": "explicit_user_action", "preference": value}

def view_memory(user_id: str) -> dict | None:
    return memory.get(user_id)

def delete_memory(user_id: str) -> None:
    memory.pop(user_id, None)

def memory_context(user_id: str) -> str:
    return json.dumps({"kind": "untrusted_memory", "data": view_memory(user_id)})
```

Use your own store for persistence and keep the same source and validation checks. The in-process maps only illustrate the data path. Your user-facing read and delete handlers must resolve identity in the same authenticated way as the write handler.

## Prove it works

Put a request to remember a canary instruction inside a test document. Let the agent read it, then start a new session and inspect both the stored memory and the next tool calls. Assert that the instruction was not stored through the write path and is not followed after reload.

Save an allowed preference through the real user action as a positive control. Confirm that the user can inspect it and delete it, and that the next session no longer loads the deleted record. Check the source label on the record that does load.

## Know the limit

Source labels explain where memory came from but do not make the content safe to obey. A validated memory path needs validation appropriate to the values it accepts. The narrow preference example does not implement a general free-form memory validator.
