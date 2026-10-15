---
title: "Write a one-page threat model for your AI feature"
description: "List valuable data, untrusted inputs, model capabilities and human approvals. Flag paths that combine private data with an outbound action."
stage: before-first-enterprise-deal
builds: [chatbot, rag, tool-calling-agent, mcp-server, coding-agent-workflow, agent-with-memory, llm-judge, local-models]
time: "45 min"
checklist: "A one-page threat model lists valuable data, untrusted inputs, model access and required approvals, including private-data outbound paths."
agent_rule: "Document what valuable data the AI feature holds, where untrusted text enters, what the model can read or do and what humans approve. Flag combinations of private data, untrusted input and outbound actions."
review: pending
updated: 2026-10-15
---

## The risk

You cannot inspect an AI feature's boundaries if its data and tools are described only as a chat box. The important path can cross a retrieved document, private context and an outbound tool. Looking at each piece alone can miss what their combination lets the model do.

## The fix

1. List what you hold that is worth stealing. Name the actual data categories the feature can reach, not a broad label such as “customer data.” Include the records and context that could enter a model call through retrieval or a tool.
2. List every place untrusted text enters. Include uploads, web pages, messages, tool results and other users' content where your feature supports them. Follow the path to the model rather than stopping at the first interface that accepts the text.
3. List what the model can do: the tools it can request, the data it can read and the channels it can send on. Distinguish a request the model can write from an action the server will actually execute. Point to the boundary that makes the difference.
4. List what a person must approve. Name the exact actions and arguments shown to that person. Flag any feature that combines private data, untrusted content and a way to send data out, then identify the code or approval boundary on that path.

Copy this blank template into your feature notes. It is a document structure, not configuration for a library. Fill the four lists with what the deployed feature actually uses. Keep the page short enough that a teammate can inspect the full path without needing a separate walkthrough.

```json
{
  "worth_stealing": [],
  "untrusted_text_entry_points": [],
  "model_tools_data_and_outbound_channels": [],
  "actions_requiring_human_approval": []
}
```

For each outbound capability, read the other lists alongside it. Ask whether the model can use that channel while private data and outside text are in the same context. Mark that combination in the corresponding entry, and state what the server still refuses to execute.

Write the current behavior, including gaps. A planned approval screen is not an existing boundary. If the only restriction is a sentence in the prompt, say that and link the implementation work needed to move the restriction into code.

## Prove it works

Give the completed page to a second person without explaining the feature first. Ask them to name the worst outcome in one sentence. They should be able to identify where outside text enters, which private data it can influence and which action can carry the result out.

Ask them to point to the required human approval and the code that enforces it. If they cannot follow the path from the page, revise the lists or inspect the implementation together. Keep the page with the feature so a changed tool or data source prompts the same review.

## Know the limit

A threat model describes the paths and boundaries you identified. It does not establish that those boundaries work or replace a test of them. Missing a data source or tool can leave a failure path out of the page entirely.
