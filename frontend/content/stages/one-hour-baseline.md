---
title: "The one-hour baseline"
description: "Start with the controls you can check before an AI feature reaches users: server-side keys, spend limits, prompt secrets and agent config."
order: 0
time: "1 hour"
review: pending
updated: 2026-10-11
---

Start here if you have a working prototype and nobody owns security. You do not need to redesign the product to check where its keys live, who can call its model endpoint, or what permissions your coding agent has. Work through these controls before adding another integration.

Keep model API keys on the server. Put a budget around calls and bound the work one request can trigger. Read your system prompt as if someone outside the team could see it. Then inspect the configuration files, hooks, skills and MCP servers that your coding agent reads or runs.

Done means you have checked the built client for keys, exercised the request limits, and read the files that grant your agent access. A setting in a dashboard or a sentence in a prompt is not evidence by itself. Keep the result of each check with the code so the next person can repeat it.

## Know the limit

This baseline does not test retrieval isolation, tool authorization or actions that need approval. It gives you a starting point. Continue to the next stage before real users depend on the feature.
