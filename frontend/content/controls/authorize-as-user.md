---
title: "Run tools with the user's permissions, not the agent's"
description: "Take identity from the verified session and enforce the normal permission check inside every tool. Never let model text choose user or tenant."
stage: before-first-users
builds: [tool-calling-agent, mcp-server, rag]
time: "30 min"
tools: [railproof]
checklist: "Every tool takes user and tenant identity from the session and checks the same permissions as the normal API."
agent_rule: "Take user and tenant IDs from the authenticated session, never model output. Enforce normal resource permissions inside each tool and do not use a shared all-powerful agent token."
review: pending
updated: 2026-10-15
---

## The risk

A model can write a valid record ID without being entitled to read that record. If a tool uses a shared privileged account and trusts the ID, the agent can reach data that the current user cannot. Asking the model to remember the user's permissions does not enforce them.

## The fix

1. Resolve user and tenant identity from the authenticated session on the server. Do not accept identity from a prompt, a model-generated argument or an editable request field. The same session should establish who is asking for the tool action.
2. Give the tool only the arguments the user may choose. Keep the user and tenant IDs outside the model-controlled schema. A validly formatted ID still needs the permission check after you look up its record.
3. Perform the same authorization your normal API uses inside every tool. Check the tenant and the user's access to the specific resource. Reject the call before returning data or making a change, regardless of what the model said about permission.
4. Do not hide a shared all-powerful service token behind the agent and treat the prompt as its access policy. Follow the user's permissions through the actual execution path, including tools that call another internal service.

These examples use a server-loaded record and a session your authentication code already verified. The small access list illustrates a resource check. Replace it with your normal policy rather than building a separate, weaker policy for AI calls.

```ts
type Session = { userId: string; tenantId: string };
type RecordData = { tenantId: string; readers: string[]; text: string };

export function readRecord(id: string, session: Session, records: Map<string, RecordData>) {
  const record = records.get(id);
  if (!record || record.tenantId !== session.tenantId || !record.readers.includes(session.userId)) {
    throw new Error("forbidden");
  }
  return record.text;
}
```

```python
def read_record(record_id: str, session: dict, records: dict) -> str:
    record = records.get(record_id)
    if (
        record is None
        or record["tenant_id"] != session["tenant_id"]
        or session["user_id"] not in record["readers"]
    ):
        raise PermissionError("forbidden")
    return record["text"]
```

The model chooses only the record ID here. It cannot provide a replacement session or add itself to the reader list. Keep those inputs in server code when wiring this function into your tool handler.

## Prove it works

Create test users A and B with separate records. As A, ask the agent for B's record by its exact ID. Observe the tool's authorization result. A model refusal without a tool-side check is not the outcome this test is meant to establish.

Call the tool function directly with A's session and B's ID as well. Test a record in a different tenant and a same-tenant record that A still cannot read. Keep a positive check for A's own allowed record. The forbidden calls must fail even when no model participates in the test.

## Know the limit

Authorization limits the resources a call may use. It does not establish that the user wanted the action, or that a permitted action is sensible in this conversation. Irreversible actions still need an approval tied to what will actually happen.
