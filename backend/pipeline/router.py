from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from .warehouse import (
    init_warehouse,
    etl_scan_to_warehouse,
    query_aggregated_metrics,
    query_risk_trend,
    query_severity_distribution,
    query_strategy_breakdown,
    query_violation_type_distribution,
)
from .vector_store import (
    get_collection_stats,
    index_scan_violations,
    semantic_search,
)
from .spark_etl import run_batch_etl
from .stream_processor import event_stream
from .triage_agent import triage_violation, triage_scan_violations

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

init_warehouse()


# ── Analytics ──

@router.get("/metrics")
async def get_metrics():
    return query_aggregated_metrics()


@router.get("/risk-trend")
async def get_risk_trend(limit: int = Query(default=30, le=100)):
    return query_risk_trend(limit=limit)


@router.get("/strategy-breakdown")
async def get_strategy_breakdown():
    return query_strategy_breakdown()


@router.get("/severity-distribution")
async def get_severity_distribution():
    return query_severity_distribution()


@router.get("/violation-types")
async def get_violation_types():
    return query_violation_type_distribution()


# ── Semantic Search ──

class SearchRequest(BaseModel):
    query: str
    n_results: int = 10
    severity_filter: str | None = None
    strategy_filter: str | None = None


@router.post("/search")
async def search_violations(body: SearchRequest):
    results = semantic_search(
        query=body.query,
        n_results=body.n_results,
        severity_filter=body.severity_filter,
        strategy_filter=body.strategy_filter,
    )
    return [r.model_dump() for r in results]


@router.get("/vector-stats")
async def get_vector_stats():
    return get_collection_stats()


# ── ETL ──

class ETLRequest(BaseModel):
    scan_records: list[dict[str, Any]]


@router.post("/etl/warehouse")
async def run_warehouse_etl(body: ETLRequest):
    results = []
    for record in body.scan_records:
        scan_key = etl_scan_to_warehouse(record)
        results.append({"scan_id": record.get("scan_id"), "scan_key": scan_key})
    return {"loaded": len(results), "results": results}


@router.post("/etl/vector-index")
async def run_vector_index(body: ETLRequest):
    total = 0
    for record in body.scan_records:
        count = index_scan_violations(record)
        total += count
    return {"indexed": total}


@router.post("/etl/spark")
async def run_spark_etl(body: ETLRequest):
    results = run_batch_etl(body.scan_records)
    return results


# ── Triage ──

class TriageRequest(BaseModel):
    violation: dict[str, Any]
    scan_context: dict[str, Any] | None = None


@router.post("/triage")
async def run_triage(body: TriageRequest):
    result = triage_violation(body.violation, scan_context=body.scan_context)
    return result.model_dump()


@router.post("/triage/scan")
async def triage_full_scan(body: ETLRequest):
    all_results = []
    for record in body.scan_records:
        results = triage_scan_violations(record)
        all_results.extend([r.model_dump() for r in results])
    return {"triaged": len(all_results), "results": all_results}


# ── Stream ──

@router.get("/stream/status")
async def stream_status():
    return event_stream.get_status()


@router.post("/stream/start")
async def start_stream():
    await event_stream.start()
    return {"status": "started"}


@router.post("/stream/stop")
async def stop_stream():
    await event_stream.stop()
    return {"status": "stopped"}
