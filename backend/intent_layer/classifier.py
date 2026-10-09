from __future__ import annotations

import json
import re

from app.llm import llm

_DEFAULT_CATEGORIES = [
    {"name": "general_coding", "description": "questions about software development, architecture, design patterns, debugging"},
    {"name": "financial_advice", "description": "questions about investments, loans, interest rates, financial planning"},
    {"name": "payments_api_help", "description": "questions about payment APIs, transaction processing, payment integration"},
    {"name": "general_knowledge", "description": "other general knowledge questions"},
    {"name": "unclear", "description": "unable to classify"},
]


def classify_intent(prompt: str, schema: dict | None = None) -> dict[str, float | str]:
    if not prompt.strip():
        return {"label": "unknown", "confidence": 0.5}

    categories = (schema or {}).get("categories") or _DEFAULT_CATEGORIES
    cat_lines = "\n".join(f"- {c['name']}: {c['description']}" for c in categories)

    classification_prompt = f"""Classify the user's intent based on their prompt. Return STRICT JSON only.

Available intent categories:
{cat_lines}

User prompt:
"{prompt}"

Return STRICT JSON (no markdown, no explanation):
{{"label": "category_name", "confidence": 0.0-1.0}}

confidence must be between 0 and 1, reflecting how certain you are about the classification.""".strip()

    try:
        raw = llm(classification_prompt)
        match = re.search(r'\{[^{}]*\}', raw)
        if not match:
            return {"label": "unknown", "confidence": 0.3}

        parsed = json.loads(match.group(0))
        label = str(parsed.get("label", "unknown")).lower().strip()
        confidence = float(parsed.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))

        return {"label": label, "confidence": confidence}
    except Exception:
        return {"label": "unknown", "confidence": 0.3}
