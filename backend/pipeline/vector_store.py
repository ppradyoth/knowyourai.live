from __future__ import annotations

import hashlib
import os
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings

from .models import SemanticSearchResult

_PERSIST_DIR = os.getenv(
    "CHROMA_PERSIST_DIR",
    str(Path(__file__).parent / "chroma_data"),
)
_COLLECTION_NAME = "violation_embeddings"


def _get_client() -> chromadb.ClientAPI:
    return chromadb.PersistentClient(
        path=_PERSIST_DIR,
        settings=Settings(anonymized_telemetry=False),
    )


def _get_collection(client: chromadb.ClientAPI) -> chromadb.Collection:
    return client.get_or_create_collection(
        name=_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def _violation_id(scan_id: str, index: int) -> str:
    return hashlib.sha256(f"{scan_id}:{index}".encode()).hexdigest()[:16]


def _build_document(violation: dict, scan_id: str, use_case: str) -> str:
    analysis = violation.get("analysis", {})
    parts = [
        f"Strategy: {violation.get('strategy', '')}",
        f"Severity: {analysis.get('severity', '')}",
        f"Type: {analysis.get('type', '')}",
        f"Reason: {analysis.get('reason', '')}",
        f"Probe: {violation.get('prompt', '')[:500]}",
        f"Use case: {use_case}",
    ]
    return "\n".join(parts)


def index_scan_violations(scan_record: dict[str, Any]) -> int:
    client = _get_client()
    collection = _get_collection(client)

    violations = scan_record.get("violations", [])
    if not violations:
        return 0

    scan_id = scan_record.get("scan_id", "")
    config = scan_record.get("config", {})
    use_case = config.get("use_case", "")

    ids = []
    documents = []
    metadatas = []

    for i, v in enumerate(violations):
        analysis = v.get("analysis", {})
        vid = _violation_id(scan_id, i)
        ids.append(vid)
        documents.append(_build_document(v, scan_id, use_case))
        metadatas.append({
            "scan_id": scan_id,
            "strategy": v.get("strategy", ""),
            "severity": analysis.get("severity", "low"),
            "violation_type": analysis.get("type", "none"),
            "confidence": analysis.get("confidence", 0.0),
            "probe_preview": v.get("prompt", "")[:200],
            "reason": analysis.get("reason", ""),
        })

    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    return len(ids)


def semantic_search(
    query: str,
    n_results: int = 10,
    severity_filter: str | None = None,
    strategy_filter: str | None = None,
) -> list[SemanticSearchResult]:
    client = _get_client()
    collection = _get_collection(client)

    if collection.count() == 0:
        return []

    where_clauses = []
    if severity_filter:
        where_clauses.append({"severity": severity_filter})
    if strategy_filter:
        where_clauses.append({"strategy": strategy_filter})

    where = None
    if len(where_clauses) == 1:
        where = where_clauses[0]
    elif len(where_clauses) > 1:
        where = {"$and": where_clauses}

    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, collection.count()),
        where=where,
        include=["metadatas", "distances", "documents"],
    )

    search_results = []
    if results["ids"] and results["ids"][0]:
        for i, vid in enumerate(results["ids"][0]):
            meta = results["metadatas"][0][i] if results["metadatas"] else {}
            distance = results["distances"][0][i] if results["distances"] else 1.0
            similarity = 1.0 - distance

            search_results.append(SemanticSearchResult(
                violation_id=vid,
                scan_id=meta.get("scan_id", ""),
                probe=meta.get("probe_preview", ""),
                reason=meta.get("reason", ""),
                similarity_score=round(similarity, 4),
                severity=meta.get("severity", ""),
                strategy=meta.get("strategy", ""),
            ))

    return search_results


def find_similar_violations(violation_text: str, n_results: int = 5) -> list[dict]:
    results = semantic_search(violation_text, n_results=n_results)
    return [r.model_dump() for r in results]


def get_collection_stats() -> dict:
    client = _get_client()
    collection = _get_collection(client)
    return {
        "total_embeddings": collection.count(),
        "collection_name": _COLLECTION_NAME,
        "persist_dir": _PERSIST_DIR,
    }
