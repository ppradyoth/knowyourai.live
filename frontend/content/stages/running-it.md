---
title: "Running it"
description: "Keep the same test pack across model and prompt changes, and rehearse how to stop tool actions, rotate keys and investigate an incident."
order: 4
time: "Ongoing"
review: pending
updated: 2026-10-11
---

Use this stage once people rely on your AI feature. A change to a prompt, a model version or a tool can change behavior even when the interface looks the same. Keep the tests you used to approve the current version and run them against the proposed version before switching traffic.

Pin the model version you tested where the provider supports dated versions. Keep the dataset fingerprint with both runs so you can compare the same cases. A new test result needs an explanation when a tool decision or argument changes, not just a new average score.

Write down how to turn off tool actions without waiting for a deploy. Include key rotation, keeping the relevant logs, telling affected users and a public contact for security reports. Rehearse the switch in staging and record how long it takes. Add an incident's failing case to the test pack before calling the issue closed.

Done is a routine you can repeat. Someone on the team can run the regression pack, find the incident instructions and stop the actions the model can take.

## Know the limit

Regression tests cover known cases. An incident playbook helps you respond, but neither replaces investigation of a new failure or a check of the changed feature's boundaries.
