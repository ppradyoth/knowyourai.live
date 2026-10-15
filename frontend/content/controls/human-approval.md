---
title: "Ask before any action that cannot be undone"
description: "Show the exact send, pay, delete or publish action before execution. Bind approval to its arguments and reject changed or expired approvals."
stage: before-first-users
builds: [tool-calling-agent, coding-agent-workflow]
time: "45 min"
case: jack-and-jill
tools: [railproof, yolobench]
checklist: "Irreversible actions need an explicit approval bound to the exact arguments, with an expiry checked at execution."
agent_rule: "Require confirmation for send, pay, delete and publish actions. Show the exact action, bind approval to its arguments and user, and reject changed or expired approvals before execution."
review: pending
updated: 2026-10-15
---

## The risk

An agent can request an action the user never intended, even when every argument passes a schema. A generic approval to continue does not say which recipient, amount or document the person accepted. If arguments change after confirmation, the action is no longer the one they saw.

## What happened in production

The case connects agent-generated actions to the need for a human gate before an external commitment leaves the system.

## The fix

1. Sort tools into read, write and irreversible actions. Identify sends, payments, deletions and publishing explicitly. Use that classification in the execution path so an irreversible tool cannot bypass confirmation because the model describes it as routine.
2. Show the person the exact proposed action. For a message, show the recipient, subject and body. For another action, show every argument that changes what will happen. The approval screen must represent the values the server will execute.
3. Store the approved arguments on the server, bound to the person who approved them. A model-written claim that the user agreed is not an approval record. Resolve the record through your own authenticated approval flow.
4. Give approvals an expiry and compare the actual execution arguments with the stored values. A changed recipient, body or amount requires a new approval. Make that decision immediately before calling the irreversible tool.

The examples compare a proposed message with a trusted server approval record. Your approval handler creates that record only after the user sees and confirms the action. These functions do not accept an approval supplied by the model.

```ts
type Message = { to: string; subject: string; body: string };
type Approval = { userId: string; expiresAt: number; message: Message };

export function approved(userId: string, message: Message, stored: Approval | undefined) {
  return Boolean(stored && stored.userId === userId && stored.expiresAt > Date.now()
    && stored.message.to === message.to
    && stored.message.subject === message.subject
    && stored.message.body === message.body);
}
```

```python
import time

def approved(user_id: str, message: dict, stored: dict | None) -> bool:
    return bool(
        stored
        and stored["user_id"] == user_id
        and stored["expires_at"] > time.time()
        and stored["message"] == message
    )
```

Use a validated message shape with only those fields in the TypeScript example. The execution handler must reject a false result, then execute the compared values. Do not check one object and subsequently rebuild a different message from fresh model output.

## Prove it works

Approve a harmless test action through the real confirmation flow. Change one argument, such as the recipient, and replay the execution request using the old approval. Assert that the server rejects it without invoking the tool. Repeat for each argument that changes the action.

Test an expired approval and a different user's approval. Include the unchanged, unexpired action as a positive control. Record tool invocations so the test distinguishes a rejected call from a message that the model merely says it did not send.

## Know the limit

Approval helps only when the person can understand what they are approving. It does not establish that the underlying data is correct or replace normal authorization. The server still needs to validate arguments and enforce the user's permissions before taking the action.
