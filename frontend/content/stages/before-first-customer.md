---
title: "Before your first paying customer"
description: "Before customers depend on your AI, test tenant boundaries, memory, deletion, trace redaction and regressions in the behavior you rely on."
order: 2
time: "1–2 days"
review: pending
updated: 2026-10-11
---

Use this stage before a customer puts their own data into the product and expects you to look after it. Trace where that data goes, what the model can retrieve, and what you will need to investigate a failure. Test those paths with separate users rather than a shared development account.

Apply tenant boundaries in retrieval code. Treat stored memory as untrusted input with a source, and make deletion reach the places you say it reaches. Keep enough trace information to investigate tool decisions while redacting personal data and secrets before you write it.

Add a repeatable injection test pack with benign controls. Assert on calls and arguments, not just a reassuring reply. Check any judge that grades those replies, and make sure the assistant stays within the job you gave it. If customers bring provider keys, keep those keys on the server and out of traces.

Done means you have tests that fail when these boundaries break. Keep the canary data and the expected outcomes so another developer can reproduce the checks after a change.

## Know the limit

A passing test pack covers the cases you put in it. It does not prove that every tenant, memory path or future model behavior is safe.
