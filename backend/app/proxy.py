from __future__ import annotations

import asyncio
import contextvars

import httpx
from fastapi import APIRouter, HTTPException, Request

from intent_layer.engine import enforce
from .db import get_layer, log_proxy_request
from .llm import use_provider_key
from .security import assert_safe_url

router = APIRouter()

_MAX_RESPONSE_CHARS = 32_768


def _call_target(target_url: str, prompt: str) -> str:
    payload_options = [
        {"prompt": prompt},
        {"message": prompt},
        {"input": prompt},
        {"query": prompt},
    ]
    with httpx.Client(timeout=httpx.Timeout(20.0, connect=10.0)) as client:
        for payload in payload_options:
            try:
                resp = client.post(target_url, json=payload)
                if resp.status_code >= 400:
                    continue
                content_type = resp.headers.get("content-type", "")
                if "application/json" in content_type:
                    body = resp.json()
                    if isinstance(body, dict):
                        for key in ["response", "output", "text", "message", "answer", "result"]:
                            value = body.get(key)
                            if isinstance(value, str) and value.strip():
                                return value.strip()[:_MAX_RESPONSE_CHARS]
                    return str(body)[:_MAX_RESPONSE_CHARS]
                text = resp.text.strip()
                if text:
                    return text[:_MAX_RESPONSE_CHARS]
            except Exception:
                continue
    return "Request allowed by intent policy, but runtime target API did not return a usable response."


@router.post("/proxy/{layer_id}")
async def proxy_request(layer_id: str, request: Request):
    layer = get_layer(layer_id)
    if not layer:
        raise HTTPException(status_code=404, detail="Layer not found")

    body = await request.json()
    prompt = None
    for key in ("prompt", "message", "input", "query"):
        if key in body and isinstance(body[key], str):
            prompt = body[key]
            break
    if not prompt:
        raise HTTPException(status_code=400, detail="No prompt found in request body")

    use_provider_key(layer["uid"])

    target_url = layer.get("target_url", "")
    if target_url:
        assert_safe_url(target_url)

    schema = layer.get("intent_schema", {"categories": []})
    policy_rules = layer.get("policy_rules", [{"default": "allow"}])

    def _proxy_call(p: str) -> str:
        if not target_url:
            return "No target API configured for this layer."
        return _call_target(target_url, p)

    ctx = contextvars.copy_context()
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: ctx.run(
            enforce,
            prompt=prompt,
            config={"allowed": [], "blocked": []},
            call_api=_proxy_call,
            intent_schema=schema,
            policy_rules=policy_rules,
        ),
    )

    log_proxy_request(layer_id, {
        "prompt": prompt[:500],
        "intent": result.get("intent"),
        "decision": result.get("decision"),
    })

    return result
