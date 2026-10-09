from __future__ import annotations

from contextvars import ContextVar

import anthropic
import httpx
from fastapi import HTTPException

from .provider_keys import MISSING_KEY_DETAIL, load_provider_key

_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# Each request runs on the caller's own model key, so the credentials live in
# request context instead of a process-wide client.
_credentials: ContextVar[tuple[str, str, str] | None] = ContextVar("llm_credentials", default=None)


def use_provider_key(uid: str) -> None:
    _credentials.set(load_provider_key(uid))


def llm(prompt: str) -> str:
    credentials = _credentials.get()
    if not credentials:
        raise HTTPException(status_code=400, detail=MISSING_KEY_DETAIL)
    provider, api_key, model = credentials
    if provider == "anthropic":
        return _claude(prompt, api_key, model)
    return _gemini(prompt, api_key, model)


def _claude(prompt: str, api_key: str, model: str) -> str:
    client = anthropic.Anthropic(api_key=api_key, timeout=120.0)
    try:
        response = client.messages.create(
            model=model,
            max_tokens=16000,
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=400, detail="Claude rejected the saved API key. Save a valid key under Account.")
    except anthropic.PermissionDeniedError:
        raise HTTPException(status_code=400, detail="The saved Claude API key is not allowed to use this model.")
    except anthropic.NotFoundError:
        raise HTTPException(status_code=400, detail=f"Claude model '{model}' was not found. Change it under Account.")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Your Claude API key is rate limited. Try again shortly.")
    except anthropic.APIStatusError as exc:
        raise HTTPException(status_code=502, detail=f"Claude call failed: {exc.message}") from exc
    except anthropic.APIConnectionError as exc:
        raise HTTPException(status_code=502, detail="Claude call failed: could not reach the API") from exc

    if response.stop_reason == "refusal":
        raise HTTPException(status_code=502, detail="Claude declined this request.")
    text = "".join(block.text for block in response.content if block.type == "text")
    if not text:
        raise HTTPException(status_code=502, detail="Claude returned an empty response")
    return text


def _gemini(prompt: str, api_key: str, model: str) -> str:
    try:
        resp = httpx.post(
            _GEMINI_URL.format(model=model),
            headers={"x-goog-api-key": api_key},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=httpx.Timeout(60.0, connect=10.0),
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Gemini call failed: {type(exc).__name__}") from exc

    if resp.status_code >= 400:
        try:
            message = resp.json()["error"]["message"]
        except Exception:
            message = f"HTTP {resp.status_code}"
        raise HTTPException(status_code=502, detail=f"Gemini call failed: {message}")

    try:
        parts = resp.json()["candidates"][0]["content"]["parts"]
        text = "".join(part.get("text", "") for part in parts)
    except Exception:
        text = ""
    if not text:
        raise HTTPException(status_code=502, detail="Gemini returned an empty response")
    return text
