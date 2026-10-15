---
title: "The Gap in AI Security No One Is Solving"
author: "Pradyoth P"
date: "2026-05-04"
excerpt: "Red teaming, evals, and guardrails dominate AI security today. But all three miss the same fundamental problem."
review: pending
updated: 2026-10-15
---

# The Gap in AI Security No One Is Solving

AI security today looks comprehensive.

We have:
- Red teaming to find vulnerabilities  
- Evals to measure behavior  
- Guardrails to prevent harmful outputs  

On the surface, it feels like a complete stack.

It isn’t.

---

## The Three Pillars of AI Security Today

### 1. Red Teaming

Red teaming focuses on adversarial testing.

It tries to break systems using:
- prompt injections  
- jailbreak attempts  
- edge-case inputs  

It’s useful. It surfaces real weaknesses.

But it has a limitation:

> It is point-in-time.

Once testing is done, systems go back into production — often unchanged in behavior, only patched at the edges.

---

### 2. Evaluations (Evals)

Evals bring structure.

They:
- benchmark model performance  
- measure safety and correctness  
- track regressions across versions  

They are essential for consistency.

But they rely on something fragile:

> predefined scenarios

Which means:
- they are predictable  
- they are static  
- they don’t reflect real-world behavior  

---

### 3. Guardrails

Guardrails operate in real-time.

They:
- filter inputs  
- filter outputs  
- enforce policies  

They are the last line of defense.

But they share a critical constraint:

> they are reactive

They act *after* a request is made or a response is generated.

---

## The Common Assumption

All three approaches — red teaming, evals, and guardrails — are built on the same foundation:

> If we control prompts and outputs, we control the system.

This assumption is where things break.

---

## Where This Model Fails

Real-world AI usage does not look like:

> one prompt → one response

It looks like:

- conversations  
- workflows  
- chained actions  
- evolving user goals  

Attacks don’t appear fully formed.

They emerge gradually.

---

### Multi-step interactions

A user can:
- start with harmless queries  
- build context over time  
- shift intent across steps  

Each individual interaction may look safe.

The overall trajectory is not.

---

### Intent obfuscation

Modern attacks don’t rely on obvious malicious inputs.

They rely on:
- ambiguity  
- gradual escalation  
- indirect manipulation  

Which means:

> harmful intent is often invisible at the prompt level

---

### System-level effects

AI systems today are no longer just generating text.

They are:
- calling APIs  
- accessing data  
- triggering workflows  
- taking actions  

The risk is no longer just:
- “bad output”

It is:
- unintended execution  

---

## The Real Gap

All existing approaches focus on:

- what the user says  
- what the model outputs  

None focus on:

> what the user is trying to do

That is the missing layer.

---

## Why This Matters

If a system cannot understand intent, it cannot:

- enforce meaningful boundaries  
- prevent misuse before execution  
- detect multi-step attacks  
- control real-world outcomes  

It can only react.

And reaction is always late.

---

## The Shift That Needs to Happen

AI security needs to move from:

- prompt-level control  
to  
- intent-level control  

From:
- filtering outputs  
to  
- controlling decisions  

From:
- model-centric safety  
to  
- system-level behavior  

---

## Final Thought

Red teaming will improve.  
Evals will become more sophisticated.  
Guardrails will get better.

But none of them solve the core problem.

Because the gap isn’t in how we test or filter AI.

> The gap is in understanding and controlling intent.

Until that layer exists, AI systems will remain fundamentally insecure.