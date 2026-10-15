---
title: "Render model output as untrusted"
description: "Render model text safely, block unapproved image and link hosts, set an image policy and never automatically fetch a URL the model writes."
stage: before-first-users
builds: [chatbot, rag, tool-calling-agent]
time: "30 min"
checklist: "Model output cannot inject active HTML or load images and links from unapproved hosts, and model-written URLs are never fetched automatically."
agent_rule: "Treat model output as untrusted. Escape or sanitize HTML, restrict markdown image and link hosts, set CSP img-src and never automatically fetch model-generated URLs."
review: pending
updated: 2026-10-15
---

## The risk

The model's reply can contain active HTML or a markdown image URL. Rendering that URL can send a request without another user action, including data placed in its query string. A harmless-looking answer is not a reason to let model text choose the browser's network destinations.

## The fix

1. Sanitize HTML before rendering it, or render the output as plain text. Do not put raw model text into an HTML sink. Escaping markup is a simple option when your feature does not need rich formatting.
2. If you render markdown, explicitly block images and links whose hosts you have not allow-listed. Check the parsed destination, not whether the raw string contains a trusted hostname. A markdown renderer is not an application-specific destination policy.
3. Set a Content-Security-Policy `img-src` that matches the image sources you intend to permit. Keep it aligned with the renderer's rules so an unsupported image path cannot become an alternate way to send a request.
4. Never auto-fetch a URL because the model produced it. Apply the same rule to server-side previews and document fetches as to browser rendering. A link in an answer is data until your own application decides what to do with it.

These examples choose the plain-text option, so markdown images and raw HTML stay visible as text. They also show a separate allow-list check for a link you deliberately choose to expose. The example documentation origin stands for one you control. Neither function fetches the destination.

```ts
const allowedOrigins = new Set(["https://docs.example.test"]);
export const imagePolicy = "img-src 'self'";

export function renderOutput(container: HTMLElement, output: string) {
  container.textContent = output;
}

export function allowedLink(raw: string): string | null {
  try {
    const url = new URL(raw);
    return allowedOrigins.has(url.origin) ? url.href : null;
  } catch {
    return null;
  }
}
```

```python
from html import escape
from urllib.parse import urlsplit

IMAGE_POLICY = "img-src 'self'"

def render_output(output: str) -> str:
    return "<pre>" + escape(output) + "</pre>"

def allowed_link(raw: str) -> str | None:
    try:
        url = urlsplit(raw)
    except ValueError:
        return None
    if url.scheme == "https" and url.netloc == "docs.example.test":
        return raw
    return None
```

Send the policy through your server's response headers rather than merely declaring the string. If you switch from this plain-text path to a markdown renderer, carry the destination check into that renderer and test its image handling before enabling it.

## Prove it works

Make the model output a markdown image pointing to a test host with a fake secret in the query string. Open the browser's network panel before displaying the reply. Assert that no request reaches that host. Use a test marker rather than real customer data.

Repeat with raw HTML containing an image and with a link whose query or path contains a trusted hostname while its actual host is different. Test the server's preview path too. The check needs to observe outgoing requests, not just whether the page hides the image after a fetch has happened.

## Know the limit

Safe rendering limits what the output can execute or fetch. It does not establish that the answer is correct or that the model did not already disclose data in text. An allow-listed destination also needs a clear reason to receive any data you put in its URL.
