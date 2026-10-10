from __future__ import annotations

import os
import sys

import httpx

# Make the backend package importable when Firebase runs this as the source root.
sys.path.insert(0, os.path.dirname(__file__))

from firebase_functions import https_fn
from firebase_functions.params import SecretParam
from firebase_admin import initialize_app
from a2wsgi import ASGIMiddleware
from flask import Response
from app.main import app as fastapi_app

initialize_app()

# Built on first request, not at import: the adapter starts an event-loop thread,
# and a thread started before the server forks its workers does not exist in them.
_wsgi = None


def _adapter():
    global _wsgi
    if _wsgi is None:
        _wsgi = ASGIMiddleware(fastapi_app)
    return _wsgi

PROVIDER_KEY_MASTER = SecretParam("PROVIDER_KEY_MASTER")


@https_fn.on_request(region="us-central1", secrets=[PROVIDER_KEY_MASTER], memory=1024, timeout_sec=540)
def api(req: https_fn.Request) -> Response:
    # Firebase Hosting rewrites /api/** to this function but keeps the full
    # path (e.g. /api/scan). Strip the prefix so FastAPI routes match.
    environ = req.environ.copy()
    path: str = environ.get("PATH_INFO", "")
    if path.startswith("/api"):
        environ["SCRIPT_NAME"] = environ.get("SCRIPT_NAME", "") + "/api"
        environ["PATH_INFO"] = path[len("/api"):] or "/"

    captured: dict[str, object] = {}
    chunks: list[bytes] = []

    def start_response(status: str, headers: list[tuple[str, str]], exc_info=None):
        captured["status"] = int(status.split(" ", 1)[0])
        captured["headers"] = dict(headers)

    for chunk in _adapter()(environ, start_response):
        chunks.append(chunk if isinstance(chunk, bytes) else chunk.encode())

    return Response(
        response=b"".join(chunks),
        status=captured.get("status", 500),
        headers=captured.get("headers", {}),
    )


@https_fn.on_request(region="us-central1", memory=512, timeout_sec=120, max_instances=10)
def ctf(req: https_fn.Request) -> Response:
    if req.path != "/ctf" and not req.path.startswith("/ctf/"):
        return Response(status=404)
    origin = "https://prompt-injection-ctf--prompt-injection-ctf-2026.us-central1.hosted.app"
    url = httpx.URL(origin).copy_with(path=req.path, query=req.query_string)
    forwarded = {"accept", "accept-language", "authorization", "content-type", "user-agent", "rsc", "next-router-state-tree", "next-router-prefetch", "next-router-segment-prefetch", "next-url", "if-none-match", "if-modified-since", "range", "x-forwarded-for"}
    headers = {key: value for key, value in req.headers.items() if key.lower() in forwarded}
    headers["X-Forwarded-Host"] = "knowyourai.live"
    headers["X-Forwarded-Proto"] = "https"
    try:
        upstream = httpx.request(req.method, url, headers=headers, content=req.get_data(), timeout=65, follow_redirects=False)
    except httpx.HTTPError:
        return Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="10;url=/ctf"><title>CTF unavailable</title></head><body><h1>The CTF could not load.</h1><p>Please email <a href="mailto:pradyoth.jpg@gmail.com">pradyoth.jpg@gmail.com</a> with the mission link.</p><p>Returning to the CTF home in 10 seconds.</p><a href="/ctf">Go to the CTF home</a></body></html>', status=503, content_type="text/html", headers={"Cache-Control": "no-store"})
    excluded = {"connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "content-encoding", "content-length", "set-cookie"}
    response_headers = [(key, value) for key, value in upstream.headers.multi_items() if key.lower() not in excluded]
    return Response(upstream.content, status=upstream.status_code, headers=response_headers)
