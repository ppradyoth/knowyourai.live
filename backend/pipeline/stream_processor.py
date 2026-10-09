from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .models import ViolationEvent
from .warehouse import etl_scan_to_warehouse
from .vector_store import index_scan_violations

logger = logging.getLogger("akrivon.pipeline.stream")


@dataclass
class EventMetrics:
    events_processed: int = 0
    events_failed: int = 0
    last_event_at: datetime | None = None
    processing_times_ms: list[float] = field(default_factory=list)

    @property
    def avg_processing_time_ms(self) -> float:
        if not self.processing_times_ms:
            return 0.0
        return sum(self.processing_times_ms[-100:]) / len(self.processing_times_ms[-100:])


class ViolationEventStream:
    def __init__(self, max_queue_size: int = 1000):
        self._queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=max_queue_size)
        self._handlers: list[Callable] = []
        self._running = False
        self._metrics = EventMetrics()
        self._worker_task: asyncio.Task | None = None

    @property
    def metrics(self) -> EventMetrics:
        return self._metrics

    def register_handler(self, handler: Callable) -> None:
        self._handlers.append(handler)

    async def emit(self, scan_record: dict[str, Any]) -> None:
        await self._queue.put(scan_record)
        logger.info("Scan event queued: %s", scan_record.get("scan_id", "unknown"))

    def emit_sync(self, scan_record: dict[str, Any]) -> None:
        try:
            self._queue.put_nowait(scan_record)
        except asyncio.QueueFull:
            logger.warning("Event queue full, dropping scan: %s", scan_record.get("scan_id"))

    async def _process_event(self, scan_record: dict[str, Any]) -> None:
        start = datetime.now(timezone.utc)
        scan_id = scan_record.get("scan_id", "unknown")

        try:
            etl_scan_to_warehouse(scan_record)
            logger.info("Warehouse ETL complete for scan %s", scan_id)
        except Exception:
            logger.exception("Warehouse ETL failed for scan %s", scan_id)
            self._metrics.events_failed += 1

        try:
            count = index_scan_violations(scan_record)
            logger.info("Indexed %d violations in vector store for scan %s", count, scan_id)
        except Exception:
            logger.exception("Vector indexing failed for scan %s", scan_id)

        for handler in self._handlers:
            try:
                result = handler(scan_record)
                if asyncio.iscoroutine(result):
                    await result
            except Exception:
                logger.exception("Handler %s failed for scan %s", handler.__name__, scan_id)

        elapsed = (datetime.now(timezone.utc) - start).total_seconds() * 1000
        self._metrics.events_processed += 1
        self._metrics.last_event_at = datetime.now(timezone.utc)
        self._metrics.processing_times_ms.append(elapsed)
        logger.info("Processed scan %s in %.1fms", scan_id, elapsed)

    async def _worker(self) -> None:
        while self._running:
            try:
                scan_record = await asyncio.wait_for(self._queue.get(), timeout=1.0)
                await self._process_event(scan_record)
                self._queue.task_done()
            except asyncio.TimeoutError:
                continue
            except Exception:
                logger.exception("Stream worker error")

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._worker_task = asyncio.create_task(self._worker())
        logger.info("Event stream processor started")

    async def stop(self) -> None:
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        logger.info("Event stream processor stopped")

    def get_status(self) -> dict:
        return {
            "running": self._running,
            "queue_size": self._queue.qsize(),
            "events_processed": self._metrics.events_processed,
            "events_failed": self._metrics.events_failed,
            "avg_processing_time_ms": round(self._metrics.avg_processing_time_ms, 2),
            "last_event_at": self._metrics.last_event_at.isoformat() if self._metrics.last_event_at else None,
        }


event_stream = ViolationEventStream()
