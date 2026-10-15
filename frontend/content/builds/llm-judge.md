---
title: "An LLM judge or eval pipeline"
description: "Keep candidate text out of the rubric, parse judge decisions strictly and compare the same evaluation cases when the model or prompt changes."
controls: [llm-judge, untrusted-content, model-upgrade-regression]
review: pending
updated: 2026-10-15
---

## What you are building

You use a model to grade another model's output or help decide whether a response meets a rule. The candidate text is an input to that decision, not authority to rewrite the rubric.

## Where untrusted text gets in

- Candidate answers that include instructions aimed at the grader.
- Retrieved or uploaded material placed inside the sample being judged.
- Free-text judge responses parsed by searching for a passing word.
- Changes to the judge model or rubric that are compared on different test cases.

## What it can do if it goes wrong

- Turn a failing sample into a pass because the candidate asks for a different verdict.
- Accept malformed or extra output fields that the application interprets inconsistently.
- Treat a confident but wrong classification as permission for a high-impact action.
- Hide a regression behind an aggregate score computed on a different case set.

## Know the limit

Strict structured output limits format, not correctness. Include a cannot-decide result and a tested confidence threshold, and keep code-level controls for actions outside the judge. Matching dataset fingerprints make a comparison interpretable but do not establish that the evaluation pack covers every failure.
