---
title: "Assume your system prompt will leak"
description: "Write system prompts as public text. Keep keys, internal URLs and credentials out, and enforce access rules in server code instead of prose."
stage: one-hour-baseline
builds: [chatbot, rag, tool-calling-agent, agent-with-memory, llm-judge]
time: "10 min"
case: reddit-answers
checklist: "System prompts contain no keys, internal URLs or credentials, and security rules are enforced in code."
agent_rule: "Write prompts as if they will be published. Keep keys, internal URLs and credentials out, and enforce access rules in server code rather than relying on model instructions."
review: pending
updated: 2026-10-15
---

## The risk

A prompt is text the model can use when it writes a reply. Putting a credential in that text creates another way for the credential to reach the output. An instruction saying not to reveal it does not move it out of the model's context.

## What happened in production

The case is a reason to review what instruction disclosure would expose before you give the prompt to the model.

## The fix

1. Read the full prompt you send, including text added by templates and server code. Remove keys, internal URLs and credentials. Check the assembled prompt rather than only the visible template, because substitutions can add a value later.
2. Write the remaining instructions as if you will publish them. They can explain the assistant's job, tone and expected format without carrying something that must remain secret. Keep authentication material outside the text you ask the model to process.
3. Move security rules into the code that performs the action. A prompt can ask the assistant to respect permissions, but the server must decide whether the current user can read a record or invoke a tool.
4. Review each rule that exists only in prose. Find the code that enforces it. If there is no such code, describe that rule as an instruction to the model rather than an access boundary.

The examples use an ordinary ownership check to show the difference. `session` comes from your authentication layer and `record` comes from your server's data store. Neither value is an identity the model gets to choose. The prompt can explain the feature without including a credential or deciding access.

```ts
const systemPrompt = "Help the user understand records they are allowed to read.";

export function readRecord(
  session: { userId: string },
  record: { ownerId: string; text: string },
) {
  if (record.ownerId !== session.userId) throw new Error("forbidden");
  return record.text;
}

export { systemPrompt };
```

```python
SYSTEM_PROMPT = "Help the user understand records they are allowed to read."

def read_record(session: dict, record: dict) -> str:
    if record["owner_id"] != session["user_id"]:
        raise PermissionError("forbidden")
    return record["text"]
```

Use your normal permission checks in the real tool. This small example establishes only the ownership rule it shows. It is not a replacement for the rest of your product's authorization logic.

## Prove it works

Ask your own assistant to repeat its instructions in several ways. Try a direct request, a request to quote the text for debugging and a request to translate it. Read what comes back, including partial disclosures. A refusal on one attempt is not a reason to put a secret back into the prompt.

Review the assembled prompt for anything you would not post publicly. Then call the server-side action directly with a record the session cannot access. It must fail regardless of whether the model obeys its instructions. Keep that direct test in your suite so a prompt rewrite cannot silently become your only permission check.

## Know the limit

Removing secrets limits the harm of instruction disclosure. It does not stop prompt injection or protect private data that other parts of the context or tools expose. A model's refusal to repeat a prompt is not proof that the prompt will stay private.
