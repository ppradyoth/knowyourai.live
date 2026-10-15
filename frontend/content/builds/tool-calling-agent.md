---
title: "An agent that calls tools"
description: "Validate and authorize model-requested actions, bind approvals to exact arguments and test tool traces under untrusted input and bounded request work."
controls: [tool-argument-validation, authorize-as-user, human-approval, untrusted-content, spend-caps, injection-tests-in-ci]
review: pending
updated: 2026-10-15
---

## What you are building

Your model proposes structured calls that server code turns into reads or actions. The execution handler decides whether those proposals can touch a real record, recipient or payment.

## Where untrusted text gets in

- Messages and earlier conversation turns that shape a proposed action.
- Documents, web pages and tool results read before the model selects its next call.
- Model-generated tool names and arguments, even when their JSON is well formed.
- A changed action proposed after the user has approved an earlier set of arguments.

## What it can do if it goes wrong

- Execute a validly shaped call with an attacker-chosen price, ID or recipient.
- Use a privileged service account to reach a record the current user cannot access.
- Send, pay, delete or publish without approval for the actual action.
- Continue an unbounded loop of model calls and tools while appearing to handle one request.

## Know the limit

Schema validation establishes argument shape, not user intent or permission. Approval also needs the same authorization checks as an ordinary API action. Test the execution boundary directly and keep benign controls in the regression pack, rather than deciding safety from the model's final reply.
