from __future__ import annotations

import asyncio
import contextvars
import json
import os
from typing import Literal

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

from intent_layer.engine import enforce
from .auth import create_api_key, delete_api_key, get_current_user, list_api_keys
from .db import (
    create_layer,
    create_scan_record,
    delete_layer,
    get_layer_for_user,
    get_scan,
    list_layers_for_user,
    list_proxy_requests,
    list_scans_for_user,
    update_layer,
    update_scan_record,
)
from .engine import run_scan
from .llm import use_provider_key
from .models import EnforceRequest, EnforceResponse, LayerCreate, LayerUpdate, ScanConfig, ScanResponse
from .provider_keys import delete_provider_key, provider_key_status, save_provider_key
from .proxy import router as proxy_router
from .rate_limit import check_rate_limit, check_scan_quota, get_usage
from .reports import generate_scan_pdf
from .security import assert_safe_url
from .tasks import enqueue_scan_job
from pipeline.router import router as pipeline_router
from pipeline.stream_processor import event_stream

_MAX_RESPONSE_CHARS = 32_768

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    from pipeline.warehouse import init_warehouse
    init_warehouse()
    await event_stream.start()
    yield
    await event_stream.stop()

app = FastAPI(title="KnowYourAI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proxy_router)
app.include_router(pipeline_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


# ── Scan (async via Cloud Tasks when available, sync fallback) ──

@app.post("/scan")
async def scan(config: ScanConfig, user: dict = Depends(check_scan_quota)):
    use_provider_key(user["uid"])
    scan_id = create_scan_record(uid=user["uid"], config=config.model_dump(mode="json"))

    task_name = enqueue_scan_job(scan_id, config.model_dump(mode="json"), user["uid"])
    if task_name:
        return {"scan_id": scan_id, "status": "queued"}

    # Sync fallback when Cloud Tasks is not configured
    try:
        result = await run_scan(config)
        update_scan_record(
            scan_id,
            status="complete",
            summary=result.summary.model_dump(),
            violations=[v.model_dump() for v in result.violations],
        )
        await event_stream.emit({
            "scan_id": scan_id,
            "config": config.model_dump(mode="json"),
            "summary": result.summary.model_dump(),
            "violations": [v.model_dump() for v in result.violations],
            "status": "complete",
        })
        return {"scan_id": scan_id, "status": "complete", **result.model_dump()}
    except Exception as exc:
        update_scan_record(scan_id, status="failed")
        raise exc


@app.post("/scan/worker/{scan_id}")
async def scan_worker(scan_id: str, request: Request):
    # Verify this is from Cloud Tasks
    queue_name = request.headers.get("X-CloudTasks-QueueName")
    if not queue_name:
        raise HTTPException(status_code=403, detail="Worker endpoint is internal only")

    body = await request.json()
    config = ScanConfig.model_validate(body["config"])

    try:
        use_provider_key(body["uid"])
        result = await run_scan(config)
        update_scan_record(
            scan_id,
            status="complete",
            summary=result.summary.model_dump(),
            violations=[v.model_dump() for v in result.violations],
        )
    except Exception:
        update_scan_record(scan_id, status="failed")

    return {"status": "ok"}


@app.get("/scans")
async def list_scans(user: dict = Depends(get_current_user)):
    return list_scans_for_user(uid=user["uid"])


@app.get("/scans/{scan_id}")
async def get_scan_detail(scan_id: str, user: dict = Depends(get_current_user)):
    record = get_scan(scan_id, uid=user["uid"])
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return record


@app.get("/scans/{scan_id}/report.pdf")
async def get_scan_report(scan_id: str, user: dict = Depends(get_current_user)):
    record = get_scan(scan_id, uid=user["uid"])
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    pdf_bytes = generate_scan_pdf(record)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="scan-{scan_id}.pdf"'},
    )


# ── Usage ──

@app.get("/usage")
async def usage_route(user: dict = Depends(get_current_user)):
    return get_usage(uid=user["uid"])


# ── Enforce ──

def _call_runtime_target_api(target_url: str, prompt: str) -> str:
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


@app.post("/enforce", response_model=EnforceResponse)
async def enforce_route(payload: EnforceRequest, user: dict = Depends(check_rate_limit)) -> EnforceResponse:
    use_provider_key(user["uid"])
    target_url = (str(payload.target_api).strip() if payload.target_api else "") or os.getenv("INTENT_TARGET_API_URL", "").strip()

    if target_url:
        assert_safe_url(target_url)

    def _proxy_call(prompt: str) -> str:
        if not target_url:
            return "Request allowed by intent policy. No runtime target API is configured."
        return _call_runtime_target_api(target_url=target_url, prompt=prompt)

    config = {
        "allowed": payload.config.allowed,
        "blocked": payload.config.blocked,
    }

    ctx = contextvars.copy_context()
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: ctx.run(enforce, prompt=payload.prompt, config=config, call_api=_proxy_call),
    )
    return EnforceResponse.model_validate(result)


# ── API Keys ──

class CreateApiKeyRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


@app.post("/api-keys")
async def create_key(body: CreateApiKeyRequest, user: dict = Depends(get_current_user)):
    return create_api_key(uid=user["uid"], name=body.name)


@app.get("/api-keys")
async def list_keys(user: dict = Depends(get_current_user)):
    return list_api_keys(uid=user["uid"])


@app.delete("/api-keys/{key_id}")
async def delete_key(key_id: str, user: dict = Depends(get_current_user)):
    delete_api_key(uid=user["uid"], key_id=key_id)
    return {"status": "deleted"}


# ── Model provider key (the caller's own Claude or Gemini key) ──

class ProviderKeyRequest(BaseModel):
    provider: Literal["anthropic", "gemini"]
    api_key: str = Field(min_length=20, max_length=200)
    model: str | None = Field(default=None, max_length=64)


@app.get("/provider-key")
async def get_provider_key(user: dict = Depends(get_current_user)):
    return provider_key_status(uid=user["uid"])


@app.put("/provider-key")
async def put_provider_key(body: ProviderKeyRequest, user: dict = Depends(get_current_user)):
    return save_provider_key(uid=user["uid"], provider=body.provider, api_key=body.api_key, model=body.model)


@app.delete("/provider-key")
async def remove_provider_key(user: dict = Depends(get_current_user)):
    delete_provider_key(uid=user["uid"])
    return {"status": "deleted"}


# ── Layers ──

@app.post("/layers")
async def create_layer_route(body: LayerCreate, user: dict = Depends(get_current_user)):
    layer_id = create_layer(uid=user["uid"], data=body.model_dump(mode="json"))
    return {"layer_id": layer_id}


@app.get("/layers")
async def list_layers(user: dict = Depends(get_current_user)):
    return list_layers_for_user(uid=user["uid"])


@app.get("/layers/{layer_id}")
async def get_layer_route(layer_id: str, user: dict = Depends(get_current_user)):
    layer = get_layer_for_user(layer_id, uid=user["uid"])
    if not layer:
        raise HTTPException(status_code=404, detail="Layer not found")
    return layer


@app.put("/layers/{layer_id}")
async def update_layer_route(layer_id: str, body: LayerUpdate, user: dict = Depends(get_current_user)):
    data = body.model_dump(mode="json", exclude_none=True)
    if not update_layer(layer_id, uid=user["uid"], data=data):
        raise HTTPException(status_code=404, detail="Layer not found")
    return {"status": "updated"}


@app.delete("/layers/{layer_id}")
async def delete_layer_route(layer_id: str, user: dict = Depends(get_current_user)):
    if not delete_layer(layer_id, uid=user["uid"]):
        raise HTTPException(status_code=404, detail="Layer not found")
    return {"status": "deleted"}


@app.get("/layers/{layer_id}/requests")
async def list_layer_requests(layer_id: str, user: dict = Depends(get_current_user)):
    return list_proxy_requests(layer_id, uid=user["uid"])
