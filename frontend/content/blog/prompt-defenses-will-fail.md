---
title: "Why Prompt-Based Defenses Will Fail"
author: "Pradyoth P"
date: "2026-05-04"
excerpt: "You can filter prompts. You can’t filter intent."
review: pending
updated: 2026-10-15
---

# Why Prompt-Based Defenses Will Fail

## You can filter prompts.  
## You can’t filter intent.

The dominant strategy in AI security today is simple:

> Detect bad inputs. Block bad outputs.

It sounds reasonable.  
It’s also fundamentally flawed.

---

## The assumption behind guardrails

Guardrails operate on a core belief:

> Harmful intent is visible in text.

So we build:
- classifiers  
- filters  
- moderation layers  

And we expect them to catch misuse.

---

## But intent is not static

Here’s the problem:

> Intent is not contained in a single prompt.

It evolves.

A user can:
- start with benign queries  
- build context  
- gradually shift goals  
- disguise harmful intent as legitimate tasks  

Each individual message looks safe.  
The system as a whole is not.

---

## The multi-step attack problem

Most AI defenses assume:

> One prompt → one response → decision

Real systems don’t work like that.

They involve:
- memory  
- chaining  
- tool usage  
- API calls  

Attacks happen **across steps**, not within one input.

---

## Prompt filtering is reactive

Even when guardrails work, they act:

- after input is given  
- or after output is generated  

By then:
- the model has already processed the request  
- the system may have already taken action  

---

## The bypass reality

This is why jailbreaks keep working.

Not because models are weak.

But because:

> filtering surface-level text cannot capture deeper intent

---

## The real control point

If you want to secure an AI system, you need to control:

- what the user is trying to achieve  
- before the system executes anything  

Not just:
- what they typed  
- or what the model said  

---

## A better approach

Instead of asking:

> “Is this input allowed?”

We should be asking:

> “What is the user trying to do, and should the system do it?”

That requires:
- intent classification  
- policy enforcement  
- system-level control  

---

## The bottom line

Prompt-based defenses will keep improving.

And they will keep failing.

Because they are solving the wrong abstraction.