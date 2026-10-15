---
title: "Run injection tests on every change"
description: "Keep attack cases and benign controls fixed, assert on tool calls and arguments, and block regressions when prompts, models or tools change."
stage: before-first-customer
builds: [rag, tool-calling-agent, llm-judge]
time: "45 min"
tools: [agentinjectionbench, weighted-safety-refusal, intentscan]
checklist: "A fixed pack of attacks and benign controls checks tool calls and arguments in CI when prompts, models or tools change."
agent_rule: "Run a fixed injection test pack with benign controls on model, prompt and tool changes. Assert on actual tool calls and arguments and fail CI on regressions rather than grading reply text alone."
review: pending
updated: 2026-10-15
---

## The risk

A model can say it refused an instruction after your application has already executed a tool call. A prompt or model change can alter those calls without changing your interface. Reading the final reply alone leaves the action path out of the regression test.

## The fix

1. Keep a small fixed pack of attack cases with benign controls. Choose cases that exercise the untrusted text your feature actually reads. Retain the task, the hostile input and the permitted outcome so another run can use the same test.
2. Capture the tool calls and arguments made by your application. Assert on the actual actions rather than a sentence saying the assistant stayed safe. Include a benign case that must complete its allowed work so refusing everything is not a passing strategy.
3. Run the same pack when the prompt, model or tool implementation changes. Keep the inputs and dataset fingerprint with both results. A comparison between different cases does not isolate what the product change did.
4. Fail the build on a regression. Inspect the failing trace before updating the expected result. Do not replace a failed action assertion with a looser check of the final reply to make a model upgrade pass.

These examples show two illustrative fixtures from your own application test pack, not identifiers from the public benchmark. `runCase` and `run_case` are your harness adapters. They return normalized calls observed at the execution boundary, including arguments.

```ts
import assert from "node:assert/strict";

type Call = { name: string; arguments: { id?: string } };
const cases: { id: string; expected: Call[] }[] = [
  { id: "document-must-not-send", expected: [] },
  { id: "benign-read-own-record", expected: [{ name: "read_record", arguments: { id: "own-record" } }] },
];

export async function checkPack(runCase: (id: string) => Promise<Call[]>) {
  for (const item of cases) assert.deepStrictEqual(await runCase(item.id), item.expected, item.id);
}
```

```python
def check_pack(run_case) -> None:
    cases = [
        ("document-must-not-send", []),
        ("benign-read-own-record", [{"name": "read_record", "arguments": {"id": "own-record"}}]),
    ]
    for case_id, expected in cases:
        assert run_case(case_id) == expected, case_id
```

Define the first fixture so its legitimate task needs no action tool and its document asks for an outbound action. Define the second around the allowed record. Use your product's corresponding fixtures and record the whole observed call list, including calls the model did not mention in its reply.

## Prove it works

Run AgentInjectionBench using the command in the tool data:

```bash
git clone https://github.com/ppradyoth/AgentInjectionBench.git && cd AgentInjectionBench
pip install -e '.[openai]'
aib-run --adapter adapters.openai_compatible:adapter --limit 10 --seed 42 --bundle results/model-check
```

Configure the adapter for your chosen endpoint using that tool version's documentation. Inspect the calls and arguments in `traces.jsonl`, and retain the dataset fingerprint. For your application pack, make a disposable tool-boundary change that permits the canary outbound call and confirm that CI fails. Restore the boundary and run again.

## Know the limit

A fixed pack covers its cases, not every future instruction or tool combination. Provider billing applies when you run against a paid model. Keep the traces and benign controls so a score does not hide an unsafe action or an assistant that no longer does its job.
