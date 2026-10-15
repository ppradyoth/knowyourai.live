---
title: "RAG over your customers' data"
description: "Keep retrieved customer data tenant-scoped and untrusted, render answers safely and verify that deletion and injection regression tests reach retrieval."
controls: [untrusted-content, tenant-isolation, output-rendering, secrets-out-of-prompts, deletion, injection-tests-in-ci]
review: pending
updated: 2026-10-15
---

## What you are building

You retrieve customer content and put selected chunks into a model's context so it can answer a question. The retrieval query decides which data the model receives before it writes that answer.

## Where untrusted text gets in

- Uploaded files and pages that customers or other users can edit.
- Retrieved chunks, including text hidden in a source document's styling.
- Search and tool results added alongside the user's question.
- Previous content that remains in a retrieval store after a visible message is deleted.

## What it can do if it goes wrong

- Put another tenant's chunks into the current user's model context.
- Treat instructions in a document as authority over the answer or available tools.
- Disclose prompt secrets or cause a network request through an answer's rendered image or link.
- Recall deleted content from a derived copy that the delete path did not remove.

## Know the limit

A tenant filter does not make the retrieved text trustworthy. The model can still follow an instruction from a document that the user is allowed to read. If retrieval happens inside a tool-calling agent, use the tool and approval controls too, and assert on the actions it actually attempts.
