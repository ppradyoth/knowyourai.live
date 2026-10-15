---
title: "Make delete mean the model can no longer recall it"
description: "Trace user content through storage, retrieval, memory, caches and backups. Delete each copy or explain clearly which copies your product retains."
stage: before-first-customer
builds: [rag, agent-with-memory, chatbot]
time: "45 min"
case: meta-ai-whatsapp
checklist: "Deletion reaches every documented copy of user content, or the product explicitly identifies retained copies and their limits."
agent_rule: "Trace deletion across databases, vector stores, memory, caches, conversation history, logs and backups. Delete each copy or disclose what remains, and test that deleted canaries cannot be retrieved or recalled."
review: pending
updated: 2026-10-15
---

## The risk

Deleting a visible message can leave its contents in retrieval, agent memory or conversation context. The next model call can receive that remaining copy even though the interface says the message is gone. A deletion promise needs to describe all the places your product put the data.

## What happened in production

The case makes a recall check part of verifying what the product's delete action actually removes.

## The fix

1. List every destination for user content: the database, vector store, agent memory, caches, conversation history, logs and backups. Follow the request through the actual product path. Include a destination even if another service manages it for you.
2. Define what the delete action does to each destination. Connect the action to its removal path rather than assuming deletion in the primary database removes derived copies. Identify any copy the model can still receive after that action completes.
3. Make the delete reach each listed copy, or say plainly what it does not delete. If a backup or retained log has different handling, explain that limit in the product's deletion description. Do not hide that difference behind a single success message.
4. Check completion across the paths you support. A failed removal is not a completed deletion. Keep enough result information to show which destination still needs attention without putting the deleted content into that result.

These examples coordinate your own deletion adapters. Configure an adapter for each inventoried destination you can delete from. They do not implement database, vector-store or backup APIs, and an omitted destination does not become deleted just because every configured adapter succeeds.

```ts
type Store = { name: string; remove: (userId: string) => Promise<void> };

export async function deleteUserContent(userId: string, stores: Store[]) {
  const results = await Promise.allSettled(stores.map((store) => store.remove(userId)));
  return results.map((result, index) => ({
    store: stores[index].name,
    deleted: result.status === "fulfilled",
  }));
}
```

```python
import asyncio

async def delete_user_content(user_id: str, stores: list[tuple]) -> list[dict]:
    results = await asyncio.gather(
        *(remove(user_id) for _, remove in stores), return_exceptions=True
    )
    return [
        {"store": name, "deleted": not isinstance(result, BaseException)}
        for (name, _), result in zip(stores, results)
    ]
```

Resolve the user through your authenticated server path before calling the adapters. Present completion only for the destinations whose removal actually finished. Keep any retained-copy explanation next to the deletion action so the user can understand it before relying on the result.

## Prove it works

Store a unique canary through the product so it reaches the same destinations as real content. Use the real delete action. Start a new session and ask the assistant to complete or recall the canary. Also query retrieval and inspect memory directly, because a model's failure to repeat a value does not prove the value was removed.

Check the remaining destinations against the inventory, including caches, conversation history and the handling you documented for logs and backups. Exercise a failed deletion adapter and confirm the product does not report every copy removed. Keep a non-deleted record as a positive retrieval control.

## Know the limit

A recall test establishes behavior for that canary and request path. It does not prove removal from a store you did not inspect. Backups or retained logs need an explicit explanation when they are outside the immediate deletion path.
