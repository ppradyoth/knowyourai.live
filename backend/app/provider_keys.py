from __future__ import annotations

import base64
import os
import re
from datetime import datetime, timezone

import anthropic
import httpx
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import HTTPException
from firebase_admin import firestore

_COLLECTION = "provider_keys"
_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models"
_MODEL_RE = re.compile(r"^[a-z0-9][a-z0-9.\-]{0,63}$")

PROVIDERS = ("anthropic", "gemini")

MISSING_KEY_DETAIL = "Add your Claude or Gemini API key under Account before running this."


def default_model(provider: str) -> str:
    if provider == "anthropic":
        return os.getenv("CLAUDE_MODEL", "claude-opus-5-5").strip()
    return os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()


def _cipher() -> AESGCM:
    try:
        key = base64.urlsafe_b64decode(os.getenv("PROVIDER_KEY_MASTER", "").strip())
    except Exception:
        key = b""
    if len(key) != 32:
        raise HTTPException(status_code=500, detail="Key storage is not configured")
    return AESGCM(key)


def _doc(uid: str):
    return firestore.client().collection(_COLLECTION).document(uid)


def _verify_with_provider(provider: str, api_key: str, model: str) -> None:
    if provider == "anthropic":
        try:
            anthropic.Anthropic(api_key=api_key, timeout=15.0).models.retrieve(model)
        except anthropic.AuthenticationError:
            raise HTTPException(status_code=400, detail="Claude rejected this API key")
        except anthropic.PermissionDeniedError:
            raise HTTPException(status_code=400, detail="This Claude API key is not allowed to use that model")
        except anthropic.NotFoundError:
            raise HTTPException(status_code=400, detail=f"Claude model '{model}' was not found")
        except anthropic.APIStatusError as exc:
            raise HTTPException(status_code=502, detail=f"Could not verify the key with Claude: {exc.message}")
        except anthropic.APIConnectionError:
            raise HTTPException(status_code=502, detail="Could not reach Claude to verify the key")
        return

    try:
        resp = httpx.get(
            _MODELS_URL,
            params={"pageSize": 1},
            headers={"x-goog-api-key": api_key},
            timeout=httpx.Timeout(15.0, connect=10.0),
        )
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Could not reach Gemini to verify the key")
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Gemini rejected this API key")


def save_provider_key(uid: str, provider: str, api_key: str, model: str | None) -> dict:
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail="Unknown provider")
    api_key = api_key.strip()
    model = (model or "").strip() or default_model(provider)
    if not _MODEL_RE.match(model):
        raise HTTPException(status_code=400, detail="Invalid model name")

    cipher = _cipher()
    _verify_with_provider(provider, api_key, model)

    # The uid is bound in as associated data so a ciphertext copied to another
    # user's document fails to decrypt.
    nonce = os.urandom(12)
    ciphertext = cipher.encrypt(nonce, api_key.encode(), uid.encode())
    _doc(uid).set({
        "provider": provider,
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "last4": api_key[-4:],
        "model": model,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    return provider_key_status(uid)


def provider_key_status(uid: str) -> dict:
    snap = _doc(uid).get()
    if not snap.exists:
        return {"configured": False}
    data = snap.to_dict()
    provider = data.get("provider", "gemini")
    return {
        "configured": True,
        "provider": provider,
        "last4": data.get("last4", ""),
        "model": data.get("model") or default_model(provider),
        "updated_at": data.get("updated_at"),
    }


def delete_provider_key(uid: str) -> None:
    _doc(uid).delete()


def load_provider_key(uid: str) -> tuple[str, str, str]:
    snap = _doc(uid).get()
    if not snap.exists:
        raise HTTPException(status_code=400, detail=MISSING_KEY_DETAIL)
    data = snap.to_dict()
    try:
        api_key = _cipher().decrypt(
            base64.b64decode(data["nonce"]),
            base64.b64decode(data["ciphertext"]),
            uid.encode(),
        ).decode()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="The saved API key could not be read. Save it again under Account.")
    provider = data.get("provider", "gemini")
    return provider, api_key, data.get("model") or default_model(provider)
