---
title: "Building or installing an MCP server"
description: "Review the source and access of an MCP server, validate tool arguments, preserve user permissions and check the configuration that launches it."
controls: [vet-skills-mcp, tool-argument-validation, authorize-as-user, agent-config-lint]
review: pending
updated: 2026-10-15
---

## What you are building

You are installing an MCP server for an agent or exposing your own product operations through one. Its tools and launcher configuration determine which parts of the surrounding system the agent can reach.

## Where untrusted text gets in

- Tool-call arguments produced by a model after reading outside content.
- Server manifests, installation instructions and source you have not reviewed.
- MCP configuration that chooses a package version, command or filesystem root.
- Tool results that the agent brings back into its next model call.

## What it can do if it goes wrong

- Give an agent arbitrary shell access or a broader filesystem root than its task needs.
- Execute a tool call whose arguments name a resource the current user cannot use.
- Load different extension code after an unpinned package reference moves.
- Grant the agent permission through a configuration file that application review never inspected.

## Know the limit

A clean configuration scan does not establish what a running server does with every input. Review the source and the effective access as well as the manifest. If a tool performs irreversible actions or reads retrieved content, add the matching approval and untrusted-content controls to these minimum checks.
