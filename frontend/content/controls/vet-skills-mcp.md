---
title: "Vet skills, plugins and MCP servers before you install them"
description: "Read agent extensions before installing them. Pin versions, narrow permissions and scan skills and MCP manifests for hidden instructions."
stage: one-hour-baseline
builds: [coding-agent-workflow, mcp-server, local-models]
time: "15 min"
tools: [agent-supply-chain-guard, agentscan]
checklist: "Skills, plugins and MCP servers have reviewed source, pinned versions and narrow permissions, with hidden instruction text checked."
agent_rule: "Before installing skills, plugins or MCP servers, read the manifest and source, pin a version or commit, grant minimal permissions and scan for hidden instructions and invisible Unicode. Avoid arbitrary-shell servers."
review: pending
updated: 2026-10-15
---

## The risk

An extension can give an agent instructions to follow and code to run. A useful-looking description does not tell you what its source requests or which permissions installation grants. Hidden instruction text can sit in a file that you otherwise treat as documentation.

## The fix

1. Read the manifest and the source before installing a skill, plugin or MCP server. Trace what the entry point runs. Include instruction files and installation commands in that review, because the access they request matters before the extension does its advertised job.
2. Pin the version or commit you reviewed. Keep the reference with your configuration so another developer can identify the same source. When the reference changes, read the changed source before accepting the update.
3. Grant the narrowest permissions the task needs. Inspect requested filesystem roots, credentials and tool access. Avoid servers that expose arbitrary shell commands rather than a bounded operation you can review.
4. Scan the files for hidden instruction language and invisible Unicode. Read the original text around a finding, including content that is easy to miss in the normal rendered view. A scanner's label starts a review rather than finishing it.

The commands below come from the Agent Supply Chain Guard entry in the tool data. They scan its example file. Use the example to understand the output, then change the final file argument to the actual skill or manifest you are reviewing before installing it.

```bash
git clone https://github.com/ppradyoth/agent-supply-chain-guard.git
cd agent-supply-chain-guard
python -m agent_supply_chain_guard scan examples/poisoned-skill.md
```

Record which version you inspected and what access you accepted. The record can be a short review note next to the pinned reference. It should let another person distinguish the reviewed extension from a newer version with the same name.

For an MCP server, read both the server's source and the client configuration that launches it. A narrow-looking server description does not cancel a broad filesystem root or a shell command in the launcher. Review the permissions that the installed configuration actually grants.

## Prove it works

Run the scanner on the example file above and inspect its findings. Then scan the exact files from the version you intend to install. Read every matched instruction and compare it with the extension's stated job. Resolve unexpected requests for credentials, shell execution or wider access before enabling it.

Check that the installed reference still points at the reviewed version or commit. Have a second person follow the entry point from the manifest and name the permissions it needs. If the source or permissions have changed since the review, repeat the review against those files.

## Know the limit

Agent Supply Chain Guard is a signal scanner, not proof of exploitability. Findings need human review, and a clean result does not make a dependency safe. Source review and a pinned reference also do not establish what the agent will do with every future input.
