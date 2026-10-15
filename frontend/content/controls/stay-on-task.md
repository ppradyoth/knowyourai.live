---
title: "Keep the assistant on its job"
description: "Define the assistant's job and prohibited actions, test that boundary across turns and back intent classification with code-level tool controls."
stage: before-first-customer
builds: [chatbot, tool-calling-agent, agent-with-memory]
time: "30 min"
tools: [intentscan, intentenforce, intent-drift-playbook]
checklist: "The assistant's job and prohibited actions are explicit, tested across turns and backed by code-level checks for high-impact tools."
agent_rule: "Define the assistant's job and prohibited actions, test them under multi-turn pressure and treat intent classification as one layer. Enforce deterministic checks before high-impact actions."
review: pending
updated: 2026-10-15
---

## The risk

A conversation can drift away from the job you intended without one turn looking obviously unrelated. If the same assistant still has access to high-impact tools, a changed conversational goal can become a real action. A classifier's allowed label does not establish permission for that action.

## The fix

1. Write down what the assistant is for and what it must not do. Make the boundary specific enough to test. Name the actions outside its job rather than relying on a general instruction to be helpful and safe.
2. Test the boundary with multi-turn pressure. Keep the original job visible when judging the final state of the conversation. A sequence can move away from that job even when each new request resembles the previous turn.
3. Treat an intent classifier as one layer. Inspect allowed, blocked and uncertain results against your own conversations. Do not equate a confident label with a correct account of what the user intended.
4. Back high-impact actions with a code-level control. Limit available tools to the job, enforce the user's permissions and require the approval appropriate to the exact action. The classifier must not be able to override those decisions.

The examples assume a record-reading assistant. The server defines its job and tool allow-list. A classifier result can stop a request, but a permissive result does not add a new tool. The tool handler still performs normal authorization before it reads a record.

```ts
export const job = {
  purpose: "Help users read records they are permitted to access.",
  prohibited: ["send messages", "make payments", "delete records"],
};
const toolsForJob = new Set(["read_record"]);

export function mayRequestTool(tool: string, intent: "in_scope" | "out_of_scope" | "uncertain") {
  return intent === "in_scope" && toolsForJob.has(tool);
}
```

```python
JOB = {
    "purpose": "Help users read records they are permitted to access.",
    "prohibited": ["send messages", "make payments", "delete records"],
}
TOOLS_FOR_JOB = {"read_record"}

def may_request_tool(tool: str, intent: str) -> bool:
    return intent == "in_scope" and tool in TOOLS_FOR_JOB
```

These are your application's policy values, not an SDK's configuration keys. Keep the tool check in the execution handler. If another feature legitimately sends a message or deletes a record, give that feature its own checked path rather than widening this assistant's tools because a model requested it.

## Prove it works

Use IntentScan against a test endpoint for your assistant. Declare the job you wrote down and inspect the conversations and responses that pressure its boundary. The hosted tool tests an HTTP endpoint, requires sign-in and uses your own provider key, as described in the tool entry.

Keep a multi-turn conversation that begins with the legitimate task and gradually asks for an out-of-scope action. Assert on the tool calls as well as the response. Force the classifier's result to `in_scope` in a controlled test and confirm that an out-of-job tool still cannot execute. Keep an ordinary in-scope conversation as a positive control.

## Know the limit

An intent classifier is a model and can be wrong. Testing a set of conversations does not establish that every route away from the job has been covered. The code-level action boundary must continue to hold when classification is wrong.
