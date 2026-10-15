---
title: "Working with Claude Code, Cursor or Codex"
description: "Review the files and extensions that grant a coding agent access, keep provider keys off clients and require approval before irreversible actions."
controls: [agent-config-lint, vet-skills-mcp, keys-server-side, human-approval]
review: pending
updated: 2026-10-15
---

## What you are building

You use a coding agent to edit a repository and run parts of your development workflow. Its instruction files, settings, hooks and installed extensions help define what it can do during that work.

## Where untrusted text gets in

- Repository instructions and configuration accepted without reading their effective permissions.
- Skills, plugins, MCP manifests and their installation commands.
- Documents or tool results that the agent reads while completing a task.
- Model-generated code that moves a server credential into a client import path.

## What it can do if it goes wrong

- Run commands through an enabled hook or arbitrary-shell MCP server.
- Read files outside the task's needed root because a configuration grant is too broad.
- Send, delete or publish something without showing the exact action for approval.
- Commit a provider key or place it into code that the browser receives.

## Know the limit

Static scans inspect the configuration and source paths they support. They do not observe every runtime action or establish that an extension's behavior matches its description. Read hooks and extension source before enabling them, and keep the irreversible-action boundary in the actual workflow.
