---
title: "Re-test whenever the model or prompt changes"
description: "Pin the model version you tested and compare the same cases before and after model or prompt changes, retaining traces and dataset fingerprints."
stage: running-it
builds: [chatbot, rag, tool-calling-agent, llm-judge, local-models, agent-with-memory]
time: "30 min"
tools: [agentinjectionbench, weighted-safety-refusal]
checklist: "Model versions are pinned, and model or prompt changes rerun the same test pack with matching dataset fingerprints and compared outcomes."
agent_rule: "Treat model and prompt changes like code changes. Pin dated model versions where available, rerun the same test pack before and after, verify matching dataset fingerprints and block regressions."
review: pending
updated: 2026-10-15
---

## The risk

A familiar model alias can point at behavior you did not test. A prompt edit can change tool choices without changing the application code around them. If the before and after tests use different cases, their results do not isolate the effect of that change.

## The fix

1. Pin the dated model version you tested where the provider offers one. Record it with the prompt version used in the run. Do not describe an alias as a fixed version if it can move independently of your application change.
2. Treat a model or prompt update like a code change. Keep the old configuration available for the comparison. Review the proposed change with the tests that establish the behavior your product depends on.
3. Run the same test pack before and after. Check the dataset fingerprint and case set before comparing outcomes. Keep the traces so you can inspect the actual tool calls and arguments behind a changed result.
4. Block regressions and explain other differences. A better overall score does not explain a newly allowed forbidden tool call. Read that case before accepting the changed configuration or updating an expectation.

These examples compare summaries produced by your own test harness. The property names are an application-level normalization, not a benchmark file format. Populate the fingerprint from the actual run metadata and the outcomes from the fixed case checks, without changing either to make the comparison pass.

```ts
import assert from "node:assert/strict";

type Run = { datasetFingerprint: string; outcomes: Record<string, "pass" | "fail"> };

export function compareRuns(before: Run, after: Run) {
  assert.equal(after.datasetFingerprint, before.datasetFingerprint);
  assert.deepStrictEqual(Object.keys(after.outcomes).sort(), Object.keys(before.outcomes).sort());
  const changed = Object.keys(before.outcomes).filter((id) => before.outcomes[id] !== after.outcomes[id]);
  const regressions = changed.filter((id) => before.outcomes[id] === "pass" && after.outcomes[id] === "fail");
  assert.deepStrictEqual(regressions, []);
  return changed;
}
```

```python
def compare_runs(before: dict, after: dict) -> list[str]:
    assert before["dataset_fingerprint"] == after["dataset_fingerprint"]
    assert before["outcomes"].keys() == after["outcomes"].keys()
    changed = [
        key for key, value in before["outcomes"].items()
        if value != after["outcomes"][key]
    ]
    regressions = [key for key in changed if before["outcomes"][key] == "pass"]
    assert not regressions, regressions
    return changed
```

Keep the raw run bundles alongside these summaries. A matching fingerprint and summary make the comparison repeatable, while the trace is what lets you explain an unexpected result rather than guessing from an aggregate number.

## Prove it works

Run your fixed pack against the current pinned model and prompt, then against the proposed configuration. Verify that both report the same dataset fingerprint and case set. Compare each case's expected tool decisions and arguments, and inspect every changed outcome.

Deliberately supply a different fingerprint to the comparison in a test and confirm that it refuses to compare. Supply a fixture with a passing case changed to failing and confirm that CI rejects it. Keep benign controls in both runs so an increase in refusals cannot hide the loss of legitimate behavior.

## Know the limit

A matching dataset fingerprint establishes which inputs you compared, not that the pack covers every failure. A passing run also does not pin a provider alias that can move later. Keep the tested configuration identifiable and repeat the checks when it changes.
