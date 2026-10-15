---
title: "A chatbot or support assistant"
description: "Secure a chatbot's provider keys, request limits, prompt content and output rendering, then test its job boundary and trace redaction."
controls: [keys-server-side, spend-caps, secrets-out-of-prompts, output-rendering, stay-on-task, logging-pii]
review: pending
updated: 2026-10-15
---

## What you are building

You are adding a model-backed conversation to your product so users can ask questions or get support. The first boundary is the path from a user's message through your server to the reply you render.

## Where untrusted text gets in

- User messages, including instructions to change the assistant's job or repeat its prompt.
- Earlier conversation turns that remain in context during a later request.
- Model output that your interface treats as HTML, markdown, images or links.
- Prompts and tool arguments copied into local logs or a tracing service.

## What it can do if it goes wrong

- Spend provider budget through an unprotected endpoint or a request with unbounded work.
- Expose a key bundled into the client or a credential placed in the system prompt.
- Drift away from the assistant's declared job over several turns.
- Trigger a request to an unapproved host through rendered output, or copy personal data into traces.

## Know the limit

These minimum controls cover the basic conversation path. If the assistant retrieves customer documents, calls tools or writes memory, follow those build pages as well. A model that answers ordinary support questions correctly has not established those additional boundaries.
