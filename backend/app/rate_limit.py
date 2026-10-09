from __future__ import annotations

from datetime import datetime, timezone

from fastapi import Depends, HTTPException

from .auth import get_current_user
from .db import _get_db

PLAN_LIMITS = {
    "free": {"rpm": 10, "monthly_tests": 1_000},
    "starter": {"rpm": 10, "monthly_tests": 1_000},
    "growth": {"rpm": 60, "monthly_tests": 20_000},
    "enterprise": {"rpm": 300, "monthly_tests": 500_000},
}


def _get_user_plan(uid: str) -> dict:
    db = _get_db()
    doc = db.collection("users").document(uid).get()
    if doc.exists:
        data = doc.to_dict()
        plan = data.get("plan", "free")
    else:
        plan = "free"
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


def _get_monthly_usage(uid: str) -> int:
    db = _get_db()
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    docs = (
        db.collection("scans")
        .where("uid", "==", uid)
        .where("created_at", ">=", month_start)
        .stream()
    )
    count = 0
    for doc in docs:
        data = doc.to_dict()
        config = data.get("config", {})
        count += config.get("num_tests", 1)
    return count


def _check_rpm(uid: str, limit: int) -> bool:
    db = _get_db()
    now = datetime.now(timezone.utc)
    window_start = now.replace(second=0, microsecond=0).isoformat()
    ref = db.collection("rate_limits").document(uid)
    doc = ref.get()
    if doc.exists:
        data = doc.to_dict()
        if data.get("window") == window_start:
            if data.get("count", 0) >= limit:
                return False
            ref.update({"count": data.get("count", 0) + 1})
            return True
    ref.set({"window": window_start, "count": 1})
    return True


async def check_rate_limit(user: dict = Depends(get_current_user)) -> dict:
    uid = user["uid"]
    limits = _get_user_plan(uid)

    if not _check_rpm(uid, limits["rpm"]):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    return user


async def check_scan_quota(user: dict = Depends(get_current_user)) -> dict:
    uid = user["uid"]
    limits = _get_user_plan(uid)
    usage = _get_monthly_usage(uid)

    if usage >= limits["monthly_tests"]:
        raise HTTPException(status_code=402, detail=f"Monthly test quota reached ({usage}/{limits['monthly_tests']}). It resets on the 1st.")

    if not _check_rpm(uid, limits["rpm"]):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    return user


def get_usage(uid: str) -> dict:
    limits = _get_user_plan(uid)
    usage = _get_monthly_usage(uid)
    db = _get_db()
    doc = db.collection("users").document(uid).get()
    plan = "free"
    if doc.exists:
        plan = doc.to_dict().get("plan", "free")
    return {
        "plan": plan,
        "monthly_tests_used": usage,
        "monthly_tests_limit": limits["monthly_tests"],
    }
