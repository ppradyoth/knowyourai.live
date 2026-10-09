from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ViolationType(str, Enum):
    capability_drift = "capability_drift"
    role_drift = "role_drift"
    domain_violation = "domain_violation"
    none = "none"


class TriageStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    triaged = "triaged"
    resolved = "resolved"


class ViolationEvent(BaseModel):
    scan_id: str
    violation_index: int
    strategy: str
    probe: str
    response: str
    violation_type: ViolationType
    severity: SeverityLevel
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    target_url: str = ""
    use_case: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TriageResult(BaseModel):
    violation_id: str
    cluster_label: str
    similar_findings: list[str] = Field(default_factory=list)
    risk_assessment: str = ""
    remediation: str = ""
    priority: Literal["P0", "P1", "P2", "P3"] = "P2"
    status: TriageStatus = TriageStatus.pending


class AggregatedMetrics(BaseModel):
    total_scans: int = 0
    total_violations: int = 0
    avg_risk_score: float = 0.0
    violations_by_severity: dict[str, int] = Field(default_factory=dict)
    violations_by_strategy: dict[str, int] = Field(default_factory=dict)
    violations_by_type: dict[str, int] = Field(default_factory=dict)
    risk_trend: list[dict] = Field(default_factory=list)


class SemanticSearchResult(BaseModel):
    violation_id: str
    scan_id: str
    probe: str
    reason: str
    similarity_score: float
    severity: str
    strategy: str
