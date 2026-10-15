---
title: "Know what you will do when it goes wrong"
description: "Prepare a tool kill switch, key-rotation steps, trace handling and user communication before an incident, then rehearse the switch in staging."
stage: running-it
builds: [chatbot, rag, tool-calling-agent, mcp-server, coding-agent-workflow, agent-with-memory, llm-judge, local-models]
time: "45 min"
checklist: "An incident playbook covers disabling tools without a deploy, key rotation, logs, affected-user communication, regression tests and a security contact."
agent_rule: "Keep and rehearse an AI incident playbook: disable tools without a deploy, rotate keys, preserve relevant logs, assign affected-user communication, add the failing case to tests and publish a security contact."
review: pending
updated: 2026-10-15
---

## The risk

An agent can keep making tool calls while the team works out how to stop it. A response that depends on an application deploy can leave the same path open during that work. Without written steps, key rotation, trace handling and user communication become decisions made under pressure.

## The fix

1. Provide a switch that disables tool execution without a deploy. Identify who can operate it and where the tool handler checks it. Make the procedure specific enough that another person can follow it when the feature is misbehaving.
2. Write the rotation steps for each key the feature uses. Name the credential by its role and secret-store location, not by pasting its value into the playbook. Include how the server starts using the replacement.
3. Keep the relevant logs for investigation. Record where to find the request IDs, tool calls and allow or deny decisions. Follow your trace access and redaction rules while preserving the evidence you need to explain what happened.
4. Assign who tells affected users and how they identify the affected requests. Add the failing case to the regression pack after you understand it. Publish a contact for security reports so someone outside the team has a route to reach you.

Fill this blank runbook with the feature's real procedures and responsible people. It is a documentation template, not configuration for an SDK or a ready-made kill switch. A blank entry is work still needed, not evidence that the response path exists.

```json
{
  "disable_tools_without_deploy": {"procedure": "", "operator": "", "verification": ""},
  "rotate_keys": [],
  "preserve_relevant_logs": {"location": "", "responsible_person": ""},
  "tell_affected_users": {"responsible_person": "", "procedure": ""},
  "add_failing_case_to_test_pack": {"location": "", "responsible_person": ""},
  "public_security_contact": ""
}
```

Keep the switch procedure separate from a prompt edit that merely asks the model to stop. The execution handler must refuse calls while the switch is off, including a call the model already proposed. Check every tool path the playbook says the switch covers.

Read the key-rotation instructions against your actual secret-store and provider setup. Review the affected-user communication assignment with the named person. The point is to remove unanswered operational questions before you need those answers during an incident.

## Prove it works

Run the kill switch once in staging and time it. Start the timer when the operator begins the documented procedure. Stop it after a test tool action is rejected by the execution boundary, and retain that request's decision trace. Do not use a model's statement that it stopped as the verification.

Check that the operator can find the key-rotation steps, relevant logs and communication owner from the same page. Add the rehearsal's failing path to your test pack if a tool remains active. Restore the staging switch through the documented procedure after checking what the rehearsal established.

## Know the limit

A playbook helps only if its procedures and access still work. A staging rehearsal does not establish that every production tool is behind the same switch. Recheck the covered paths when tools, credentials or response responsibilities change.
