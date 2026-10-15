---
title: "Verify the open-weight model you pulled"
description: "Compare an open-weight model with its declared base, read chat-template differences and lock approved artifacts so changes fail your CI check."
stage: before-first-users
builds: [local-models]
time: "30 min"
tools: [knowyourai]
checklist: "Open-weight models are checked against their declared base, template changes are reviewed and approved artifacts are locked in CI."
agent_rule: "Before running an open-weight model, compare it with its declared base, review chat-template differences and lock the approved artifacts. Fail CI when the approved model changes."
review: pending
updated: 2026-10-15
---

## The risk

A model card tells you what a repository claims to contain. It does not replace checking the files you pulled or the chat template that processes your prompts. An update can change those files after you have reviewed a previous version.

## The fix

1. Check the model against its declared base before running it. Identify which files and metadata the comparison covers. Keep the result attached to the artifact you intend to use rather than treating a familiar repository name as the result of a review.
2. Read the chat-template differences the scan reports. A template is part of how the model receives each prompt. Decide whether the changes fit the model you intended to run, instead of accepting or rejecting every difference from its label alone.
3. Lock the artifacts you approved. Record the approved state in the tool's lockfile so your next check has a specific reference. A review without that reference cannot tell you whether a later pull is still the reviewed model.
4. Run the check in CI and fail when the approved state changes. Review the changed files and metadata before updating what you approve. Do not automatically refresh the lock just to make the job pass.

Use the scan command from the knowyourai tool entry. Run it against the model setup you are reviewing before you start inference. The tool reads headers and metadata without running the model, so this step is separate from a behavioral test of replies.

```bash
uvx knowyourai scan
```

Inspect the output with the declared base available for comparison. Follow the reported evidence to the relevant template or metadata. Read the changed branches in context and check whether they do something you intended. A label is a reason to inspect the difference, not a substitute for reading it.

Use the lock and check workflow documented by the version of the tool you adopt. This page shows only the scan command present in the repository's tool data. Keep the approved lockfile in review with the model change so another person can identify what was accepted.

## Prove it works

Run the scan and keep the output for the exact artifact you plan to serve. Review the differences rather than relying on a clean-looking summary. Create the approved lock through your chosen tool version's documented workflow and run its check in CI.

In a disposable fixture, change a locked file or metadata value and confirm that the check fails. Restore the approved artifact and confirm that it passes again. Inspect the job result as well as the printed output, so the test establishes that a change actually blocks the build.

## Know the limit

Most template differences are deliberate fixes by the quantizer. A finding means read it, not that the model is malicious, and consistent is never the same as safe.
