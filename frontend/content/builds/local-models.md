---
title: "Running open-weight models yourself"
description: "Inspect an open-weight model and its template before inference, review extensions, lock approved artifacts and repeat tests when the model changes."
controls: [model-provenance, vet-skills-mcp, model-upgrade-regression]
review: pending
updated: 2026-10-15
---

## What you are building

You serve an open-weight model and choose the files and templates used to run it. Your review needs to identify the actual artifact and configuration rather than only the name on its model card.

## Where untrusted text gets in

- Chat templates and metadata from the repository you pulled.
- Source and instructions in extensions installed alongside the model.
- Skills or MCP servers that gain access through the agent configuration.
- Prompt or model changes accepted without repeating the approved test pack.

## What it can do if it goes wrong

- Apply template behavior that differs from the declared base and has not been reviewed.
- Load changed artifacts after the version you inspected has moved.
- Give an extension wider access than the task needs.
- Change tool decisions or benign behavior while a familiar model name stays on the interface.

## Know the limit

A template difference is a reason to inspect the change, not evidence that a model is malicious. Metadata consistency does not establish safe behavior either. Keep provenance checks, extension review and before-and-after behavioral tests as separate checks, each with the evidence it actually produces.
