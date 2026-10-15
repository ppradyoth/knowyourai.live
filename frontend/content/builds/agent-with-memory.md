---
title: "An agent that remembers"
description: "Control how agent memory is written, labeled, inspected and deleted, and test that outside instructions and sensitive trace values do not persist."
controls: [memory-injection, untrusted-content, deletion, logging-pii]
review: pending
updated: 2026-10-15
---

## What you are building

Your agent stores information from one interaction and loads it during a later one. The write and reload paths determine whether outside text becomes persistent context for a different session.

## Where untrusted text gets in

- A document, page or tool result that asks the agent to remember an instruction.
- Free-form memory written through a path without content validation.
- A stored record loaded without its source or an untrusted-data label.
- Logs, caches and conversation history that keep copies after memory is deleted.

## What it can do if it goes wrong

- Carry a hostile instruction into future sessions after the original document is gone.
- Store secrets or payment details as if they were ordinary preferences.
- Leave a deleted canary retrievable through a copy outside the visible memory list.
- Send sensitive memory or prompt text to a trace destination before redaction.

## Know the limit

A source label describes provenance but does not make stored text trustworthy. A bounded preference field and a free-form memory system need different validation. Check the actual write path, let the user inspect and delete what it stores, and test the next session rather than only the current reply.
