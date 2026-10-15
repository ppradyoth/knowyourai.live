---
title: "Before your first users"
description: "Before real users arrive, check the boundary between model text and your tools: validate arguments, enforce permissions and require approval."
order: 1
time: "Half a day"
review: pending
updated: 2026-10-11
---

Use this stage when you are about to let someone outside the team use the feature. Start from what the model can reach. A chat response, a retrieved document and a tool call need different checks because they can affect different parts of your product.

Treat uploaded and retrieved content as untrusted. Validate tool arguments on the server and take identity from the session. Run permission checks inside the tool, where a model reply cannot bypass them. For an action that cannot be undone, show the person the exact action and require approval tied to those arguments.

Check the output path too. Render model text without allowing it to fetch arbitrary remote content. If you run an open-weight model, inspect its provenance and lock what you approved before serving it.

Done means you can call the tool directly with bad arguments and a different user's record ID and watch the server reject it. You can change an approved action's arguments and show that the old approval no longer works.

## Know the limit

These checks limit what a confused model can do. They do not make prompt injection disappear or establish that customer data stays separate across retrieval, memory and deletion.
