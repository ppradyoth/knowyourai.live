---
title: "Lock down your coding agent's config files"
description: "Review agent permissions, filesystem roots, hooks and MCP versions before running a coding agent. Keep secrets out and lint the config in CI."
stage: one-hour-baseline
builds: [coding-agent-workflow, mcp-server]
time: "10 min"
case: claude-code
tools: [agentscan]
checklist: "Coding-agent config has no permission bypass, secrets or unreviewed hooks, and MCP versions and filesystem access are restricted."
agent_rule: "Review coding-agent config before use: disable permission bypass, remove secrets, pin MCP packages, narrow filesystem roots and read each hook before enabling it."
review: pending
updated: 2026-10-15
---

## The risk

An agent's settings and instruction files decide what it can read, execute and do without asking. Those files can grant access before you send the first task. Reviewing application code while skipping this configuration leaves the agent's working permissions unchecked.

## What happened in production

The case shows why configuration and instruction files belong in the review of what an agent can do.

## The fix

1. Read the configuration that the agent will actually load. Include repository instructions, MCP manifests, settings and enabled hooks. Look at the effective permissions rather than assuming the defaults still apply.
2. Remove permission-bypass modes and instructions that disable confirmation. Keep approval for actions that need it. A broad grant made to get one command working can remain after that task ends.
3. Keep secrets out of settings and instruction files. Read each file as something that can be copied with the repository or shown to the agent. A private-looking filename does not make an embedded key safe.
4. Pin MCP package versions and narrow filesystem roots to the directories needed for the task. Review every hook before enabling it. If you cannot explain what a hook runs and when it runs, leave it disabled until you can.

Use agentscan to inspect the files on disk. These are the install and scan commands from the tool data. Run the scan from the repository you intend to give the agent, including the configuration changes you are about to accept.

```bash
pipx install git+https://github.com/ppradyoth/agentscan
agentscan .
```

Read each finding in the original file. Check the permission grant, the filesystem path, the package version or the hook command it points to. Resolve the finding by changing that grant or explaining the narrow use it serves. Do not treat a scan result as permission to run a hook you have not read.

Use the same command in CI after installing the tool. Keep its exit status as the job's result so a failed scan cannot be hidden by a later successful command. Run it when configuration or instruction files change, not only when application source changes.

## Prove it works

Run the command on your repository and inspect the findings. In a disposable test copy, add a permission-bypass setting or an over-broad filesystem grant that the scanner recognizes. Confirm that the command reports it and exits unsuccessfully. Remove the fixture and run again.

Submit the same harmless fixture through your CI path to confirm that the job fails there too. A command that only prints a warning without affecting the job result is not the gate you intended. Keep the clean configuration in review alongside the application change that needs it.

## Know the limit

This is static analysis of files on disk. It does not observe what the agent does at runtime, prove a hook is harmless or validate the behavior of an MCP server. A clean scan still needs a review of the access you grant.
