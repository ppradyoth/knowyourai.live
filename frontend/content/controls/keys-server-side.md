---
title: "Keep model API keys off the client"
description: "Keep provider credentials in server code and your host's secret store. Check the built client, separate environments and rotate exposed keys."
stage: one-hour-baseline
builds: [chatbot, rag, tool-calling-agent, coding-agent-workflow, llm-judge]
time: "10 min"
checklist: "Model API keys live only on the server, use separate environments and never appear in the built client or repository."
agent_rule: "Call model providers from server code using the host's secret store. Never put provider keys in client code, prompts or repositories, and rotate any key that was committed."
review: pending
updated: 2026-10-15
---

## The risk

A provider key in a browser bundle belongs to everyone who can download that bundle. Moving it into a client environment variable changes how you write the value, not who receives it. A mobile app or a public repository is not a secret store either.

## The fix

1. Make the provider call in server code. The client sends the user's input to your server and receives the result. It never receives the provider credential, including in an error response or a configuration endpoint.
2. Put the key in your host's secret store and make it available only to the server process that needs it. Read it when you set up the provider call. Do not copy it into a shared module imported by the browser.
3. Use separate keys for development and production. Check which environment the server reads before letting a prototype use a production credential. Keep actual values out of tracked files in both environments.
4. If a key was committed, rotate it at the provider. Deleting the line from the latest file does not withdraw copies that someone already has. Update the server's secret store with the replacement.

These examples belong in a server-only module. `callProvider` and `call_provider` are adapters you write around your provider client, not package APIs. They show where the credential enters the call without choosing a framework or returning the credential to the browser.

```ts
type Provider = (request: { apiKey: string; input: string }) => Promise<string>;

export async function answer(input: string, callProvider: Provider) {
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey) throw new Error("Missing server credential");
  return callProvider({ apiKey, input });
}
```

```python
import os
from collections.abc import Callable

def answer(input_text: str, call_provider: Callable[..., str]) -> str:
    api_key = os.environ["MODEL_API_KEY"]
    return call_provider(api_key=api_key, input=input_text)
```

Review the imports of this module as well as the file itself. A server-looking filename does not establish where a bundler will put its contents. Follow the import from the endpoint that calls it and confirm that the browser uses only your endpoint.

## Prove it works

Build the client in CI and search its emitted JavaScript for the provider's key prefix. Search for a synthetic marker using the same configuration path too, so the test demonstrates that it can find a value that reaches the bundle. Never print a real credential into the CI log while checking it.

Run a secret scanner in CI against the repository. Check the browser's network responses when you send a message and when the server returns an error. Neither response should contain the key. Keep the scanner result and the bundle check with the change that moves the provider call.

## Know the limit

Keeping a key on the server does not limit who can use your model endpoint or how much they can spend. It also does not protect a credential already exposed elsewhere. Rotate exposed values and add authentication and request limits to the endpoint separately.
